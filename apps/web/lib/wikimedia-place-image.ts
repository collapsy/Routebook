import {
  canPromoteExternalImageToControlledAsset,
  type ExternalPlaceImageCandidate,
  type PlaceImagePort,
} from "@routebook/place-catalog";

const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const SOURCE_NAME = "Wikimedia Commons";
const MAX_RESULTS = 8;

const REUSABLE_LICENSE_PATTERN = /^CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)$/i;

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type MetadataValue = Readonly<{ value?: string }>;

type CommonsImageInfo = Readonly<{
  descriptionurl?: string;
  url?: string;
  thumburl?: string;
  mime?: string;
  sha1?: string;
  extmetadata?: Readonly<Record<string, MetadataValue>>;
}>;

type CommonsPage = Readonly<{
  pageid?: number;
  title?: string;
  imageinfo?: readonly CommonsImageInfo[];
}>;

type CommonsResponse = Readonly<{
  query?: Readonly<{
    pages?: readonly CommonsPage[];
  }>;
}>;

export type WikimediaImageMatchStatus = "secure" | "ambiguous" | "rejected";

export type WikimediaImageMatch = Readonly<{
  status: WikimediaImageMatchStatus;
  reason: string;
}>;

export type WikimediaImageRecord = Readonly<{
  fileTitle: string;
  descriptionUrl: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mime: string;
  sourceSha1?: string;
  artist: string;
  license: string;
  licenseUrl?: string;
  description: string;
}>;

type WikimediaPlaceImageAdapterDependencies = Readonly<{
  fetcher?: FetchLike;
  now?: () => Date;
}>;

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replace(/\s+/g, " ")
    .trim();
}

function metadataText(info: CommonsImageInfo, key: string): string {
  return stripHtml(info.extmetadata?.[key]?.value ?? "");
}

function normalizeIdentity(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function isAllowedCommonsPageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "commons.wikimedia.org";
  } catch {
    return false;
  }
}

function isAllowedMediaUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "upload.wikimedia.org";
  } catch {
    return false;
  }
}

function isReusableLicense(value: string): boolean {
  return REUSABLE_LICENSE_PATTERN.test(value.trim());
}

export function normalizeWikimediaImageRecord(
  page: CommonsPage,
): WikimediaImageRecord | undefined {
  const info = page.imageinfo?.[0];
  const fileTitle = page.title?.trim() ?? "";
  const descriptionUrl = info?.descriptionurl?.trim() ?? "";
  const mediaUrl = info?.url?.trim() ?? "";
  const thumbnailUrl = info?.thumburl?.trim() || undefined;
  const mime = info?.mime?.trim() ?? "";
  const artist = info ? metadataText(info, "Artist") : "";
  const license = info ? metadataText(info, "LicenseShortName") : "";
  const licenseUrl = info ? metadataText(info, "LicenseUrl") || undefined : undefined;
  const description = info ? metadataText(info, "ImageDescription") : "";

  if (!fileTitle.startsWith("File:")) return undefined;
  if (!isAllowedCommonsPageUrl(descriptionUrl)) return undefined;
  if (!isAllowedMediaUrl(mediaUrl)) return undefined;
  if (thumbnailUrl && !isAllowedMediaUrl(thumbnailUrl)) return undefined;
  if (!mime.startsWith("image/")) return undefined;
  if (!artist || !isReusableLicense(license)) return undefined;
  if (licenseUrl && !licenseUrl.startsWith("https://creativecommons.org/licenses/")) return undefined;

  return {
    fileTitle,
    descriptionUrl,
    mediaUrl,
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    mime,
    ...(info?.sha1 ? { sourceSha1: info.sha1 } : {}),
    artist,
    license,
    ...(licenseUrl ? { licenseUrl } : {}),
    description,
  };
}

export function classifyWikimediaImageMatch(
  place: Readonly<{ name: string }>,
  image: Pick<WikimediaImageRecord, "fileTitle" | "description">,
): WikimediaImageMatch {
  const placeName = normalizeIdentity(place.name);
  const title = normalizeIdentity(image.fileTitle.replace(/^File:/, ""));
  const description = normalizeIdentity(image.description);
  const combined = `${title} ${description}`;
  const hasExactPlaceName = title.includes(placeName) || description.includes(placeName);
  const hasLocalContext = /\b(?:pipa|tibau do sul)\b/.test(combined);

  if (hasExactPlaceName && hasLocalContext) {
    return {
      status: "secure",
      reason: "Nome do Place e contexto local de Pipa/Tibau do Sul aparecem na metadata da mídia.",
    };
  }
  if (hasExactPlaceName || hasLocalContext) {
    return {
      status: "ambiguous",
      reason: "A metadata possui apenas parte dos sinais necessários para confirmar a identidade do Place.",
    };
  }
  return {
    status: "rejected",
    reason: "A metadata não sustenta correspondência entre a mídia e o Place.",
  };
}

function toCandidate(record: WikimediaImageRecord, collectedAt: Date): ExternalPlaceImageCandidate {
  return {
    provider: "wikimedia-commons",
    externalPlaceId: record.fileTitle,
    sourceUrl: record.descriptionUrl,
    sourceName: SOURCE_NAME,
    license: record.license,
    attribution: record.artist,
    collectedAt,
    cachePolicy: "download_allowed",
  };
}

export class WikimediaCommonsPlaceImageAdapter implements PlaceImagePort {
  private readonly fetcher: FetchLike;
  private readonly now: () => Date;

  constructor(dependencies: WikimediaPlaceImageAdapterDependencies = {}) {
    this.fetcher = dependencies.fetcher ?? fetch;
    this.now = dependencies.now ?? (() => new Date());
  }

  async findCandidates(
    place: Readonly<{ name: string; latitude: number; longitude: number; externalId?: string }>,
  ): Promise<readonly ExternalPlaceImageCandidate[]> {
    const query = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      generator: "search",
      gsrsearch: `\"${place.name}\" Pipa Tibau do Sul`,
      gsrnamespace: "6",
      gsrlimit: String(MAX_RESULTS),
      prop: "imageinfo",
      iiprop: "url|size|mime|sha1|extmetadata",
      iiurlwidth: "1280",
      iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|ImageDescription|Credit",
      origin: "*",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6_000);
    try {
      const response = await this.fetcher(`${COMMONS_API_URL}?${query}`, {
        signal: controller.signal,
        headers: { "User-Agent": "RouteBook/0.1 place-image-discovery" },
      });
      if (!response.ok) {
        throw new Error(`Wikimedia Commons respondeu ${response.status}.`);
      }
      const payload = (await response.json()) as CommonsResponse;
      const collectedAt = this.now();
      return (payload.query?.pages ?? [])
        .map(normalizeWikimediaImageRecord)
        .filter((record): record is WikimediaImageRecord => Boolean(record))
        .map((record) => toCandidate(record, collectedAt))
        .filter(canPromoteExternalImageToControlledAsset);
    } finally {
      clearTimeout(timeout);
    }
  }
}
