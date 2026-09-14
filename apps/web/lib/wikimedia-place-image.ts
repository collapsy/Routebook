import {
  canPromoteExternalImageToControlledAsset,
  placeDistanceMeters,
  type ExternalPlaceImageCandidate,
  type PlaceImagePort,
} from "@routebook/place-catalog";

const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const SOURCE_NAME = "Wikimedia Commons";
const MAX_RESULTS = 8;
const MAX_SECURE_IMAGE_DISTANCE_METERS = 3_000;
const USER_AGENT = "RouteBookPlaceImageBot/0.1 (https://github.com/collapsy/Routebook)";

const REUSABLE_LICENSE_PATTERN =
  /^(?:CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|CC0 1\.0|Public domain)$/i;
const PLACE_NAME_STOPWORDS = new Set([
  "a",
  "as",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "o",
  "os",
  "praia",
  "baia",
  "lagoa",
]);
const GENERIC_PLACE_IDENTITY_TOKENS = new Set([
  "bar",
  "beach",
  "cafe",
  "cafeteria",
  "club",
  "clube",
  "dessert",
  "food",
  "mirante",
  "nightclub",
  "parque",
  "park",
  "postre",
  "pub",
  "restaurant",
  "restaurante",
  "sobremesa",
  "viewpoint",
]);
const DESTINATION_CONTEXT_STOPWORDS = new Set([
  "brasil",
  "brazil",
  "city",
  "cidade",
  "district",
  "estado",
  "region",
  "regiao",
]);
const PLACE_TOKEN_ALIASES: Readonly<Record<string, readonly string[]>> = {
  centro: ["centre", "center"],
};

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type MetadataValue = Readonly<{ value?: string }>;
type CommonsCoordinate = Readonly<{ lat?: number; lon?: number; primary?: string }>;

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
  coordinates?: readonly CommonsCoordinate[];
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
  coordinate?: Readonly<{ latitude: number; longitude: number }>;
}>;

export type WikimediaPlaceImagePreview = Readonly<{
  previewUrl: string;
  sourceUrl: string;
  sourceName: string;
  license: string;
  licenseUrl?: string;
  attribution: string;
  altText: string;
  matchEvidence: string;
}>;

type WikimediaPlaceImageAdapterDependencies = Readonly<{
  fetcher?: FetchLike;
  now?: () => Date;
}>;

type PlaceImageLookup = Readonly<{
  name: string;
  latitude: number;
  longitude: number;
  externalId?: string;
  contextLabel?: string;
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

function significantPlaceTokens(placeName: string): string[] {
  return normalizeIdentity(placeName)
    .split(" ")
    .filter((token) => token.length >= 3 && !PLACE_NAME_STOPWORDS.has(token));
}

function destinationContextTokens(value?: string): string[] {
  if (!value) return [];
  return normalizeIdentity(value)
    .split(" ")
    .filter(
      (token) =>
        token.length >= 3 &&
        !PLACE_NAME_STOPWORDS.has(token) &&
        !DESTINATION_CONTEXT_STOPWORDS.has(token),
    )
    .slice(0, 4);
}

function hasPlaceToken(combinedTokens: ReadonlySet<string>, token: string): boolean {
  if (combinedTokens.has(token)) return true;
  return (PLACE_TOKEN_ALIASES[token] ?? []).some((alias) => combinedTokens.has(alias));
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

function isAllowedLicenseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "creativecommons.org" &&
      (url.pathname.startsWith("/licenses/") || url.pathname.startsWith("/publicdomain/"))
    );
  } catch {
    return false;
  }
}

function previewAltText(placeName: string, description: string): string {
  const cleanedDescription = description.trim().replace(/\s+/g, " ");
  if (cleanedDescription.length >= 12) return cleanedDescription.slice(0, 220);
  return `Fotografia de ${placeName}.`;
}

function normalizeCoordinate(page: CommonsPage):
  | Readonly<{
      latitude: number;
      longitude: number;
    }>
  | undefined {
  const coordinate =
    page.coordinates?.find(({ primary }) => primary === "") ?? page.coordinates?.[0];
  if (
    !coordinate ||
    typeof coordinate.lat !== "number" ||
    !Number.isFinite(coordinate.lat) ||
    coordinate.lat < -90 ||
    coordinate.lat > 90 ||
    typeof coordinate.lon !== "number" ||
    !Number.isFinite(coordinate.lon) ||
    coordinate.lon < -180 ||
    coordinate.lon > 180
  ) {
    return undefined;
  }
  return { latitude: coordinate.lat, longitude: coordinate.lon };
}

export function normalizeWikimediaImageRecord(page: CommonsPage): WikimediaImageRecord | undefined {
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
  const coordinate = normalizeCoordinate(page);

  if (!fileTitle.startsWith("File:")) return undefined;
  if (!isAllowedCommonsPageUrl(descriptionUrl)) return undefined;
  if (!isAllowedMediaUrl(mediaUrl)) return undefined;
  if (thumbnailUrl && !isAllowedMediaUrl(thumbnailUrl)) return undefined;
  if (!mime.startsWith("image/")) return undefined;
  if (!artist || !isReusableLicense(license)) return undefined;
  if (licenseUrl && !isAllowedLicenseUrl(licenseUrl)) return undefined;

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
    ...(coordinate ? { coordinate } : {}),
  };
}

export function classifyWikimediaImageMatch(
  place: Readonly<{
    name: string;
    latitude?: number;
    longitude?: number;
    contextLabel?: string;
  }>,
  image: Pick<WikimediaImageRecord, "fileTitle" | "description" | "coordinate">,
): WikimediaImageMatch {
  const title = normalizeIdentity(image.fileTitle.replace(/^File:/, ""));
  const description = normalizeIdentity(image.description);
  const combined = `${title} ${description}`;
  const combinedTokens = new Set(combined.split(" ").filter(Boolean));
  const placeTokens = significantPlaceTokens(place.name);
  const hasDistinctivePlaceIdentity =
    placeTokens.length > 0 &&
    placeTokens.some((token) => !GENERIC_PLACE_IDENTITY_TOKENS.has(token));
  const hasPlaceIdentity =
    hasDistinctivePlaceIdentity &&
    placeTokens.every((token) => hasPlaceToken(combinedTokens, token));

  const localTokens = destinationContextTokens(place.contextLabel);
  const hasTextualLocalContext =
    localTokens.length > 0 && localTokens.every((token) => combinedTokens.has(token));

  const hasCoordinateLocalContext =
    image.coordinate !== undefined &&
    typeof place.latitude === "number" &&
    typeof place.longitude === "number" &&
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    placeDistanceMeters(
      { latitude: place.latitude, longitude: place.longitude },
      image.coordinate,
    ) <= MAX_SECURE_IMAGE_DISTANCE_METERS;

  if (hasPlaceIdentity && (hasTextualLocalContext || hasCoordinateLocalContext)) {
    return {
      status: "secure",
      reason: hasCoordinateLocalContext
        ? "A metadata identifica o Lugar e a fotografia possui localização coerente com ele."
        : "A metadata identifica o Lugar e o contexto local informado para a viagem.",
    };
  }
  if (hasPlaceIdentity || hasTextualLocalContext || hasCoordinateLocalContext) {
    return {
      status: "ambiguous",
      reason: "A metadata possui apenas parte dos sinais necessários para confirmar o Lugar.",
    };
  }
  return {
    status: "rejected",
    reason: "A metadata não sustenta correspondência entre a fotografia e o Lugar.",
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

function buildSearchTexts(placeName: string, contextLabel?: string): readonly string[] {
  const exactName = `\"${placeName}\"`;
  const context = destinationContextTokens(contextLabel).join(" ");
  return [...new Set([context ? `${exactName} ${context}` : exactName, exactName])];
}

export class WikimediaCommonsPlaceImageAdapter implements PlaceImagePort {
  private readonly fetcher: FetchLike;
  private readonly now: () => Date;

  constructor(dependencies: WikimediaPlaceImageAdapterDependencies = {}) {
    this.fetcher = dependencies.fetcher ?? fetch;
    this.now = dependencies.now ?? (() => new Date());
  }

  private async searchRecords(
    place: PlaceImageLookup,
    searchText = buildSearchTexts(place.name, place.contextLabel)[0] ?? `\"${place.name}\"`,
  ): Promise<readonly WikimediaImageRecord[]> {
    const query = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      maxlag: "1",
      generator: "search",
      gsrsearch: searchText,
      gsrnamespace: "6",
      gsrlimit: String(MAX_RESULTS),
      prop: "imageinfo|coordinates",
      iiprop: "url|size|mime|sha1|extmetadata",
      iiurlwidth: "1280",
      iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|ImageDescription|Credit",
      colimit: String(MAX_RESULTS),
      origin: "*",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6_000);
    try {
      const response = await this.fetcher(`${COMMONS_API_URL}?${query}`, {
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          "Api-User-Agent": USER_AGENT,
        },
      });
      if (!response.ok) {
        throw new Error(`Wikimedia Commons respondeu ${response.status}.`);
      }
      const payload = (await response.json()) as CommonsResponse;
      return (payload.query?.pages ?? [])
        .map(normalizeWikimediaImageRecord)
        .filter((record): record is WikimediaImageRecord => Boolean(record));
    } finally {
      clearTimeout(timeout);
    }
  }

  async findCandidates(
    place: Readonly<{ name: string; latitude: number; longitude: number; externalId?: string }>,
  ): Promise<readonly ExternalPlaceImageCandidate[]> {
    const records = await this.searchRecords(place);
    const collectedAt = this.now();
    return records
      .map((record) => toCandidate(record, collectedAt))
      .filter(canPromoteExternalImageToControlledAsset);
  }

  async findSecurePreview(
    place: PlaceImageLookup,
  ): Promise<WikimediaPlaceImagePreview | undefined> {
    for (const searchText of buildSearchTexts(place.name, place.contextLabel)) {
      const records = await this.searchRecords(place, searchText);

      for (const record of records) {
        const match = classifyWikimediaImageMatch(place, record);
        if (match.status !== "secure") continue;

        return {
          previewUrl: record.thumbnailUrl ?? record.mediaUrl,
          sourceUrl: record.descriptionUrl,
          sourceName: SOURCE_NAME,
          license: record.license,
          ...(record.licenseUrl ? { licenseUrl: record.licenseUrl } : {}),
          attribution: record.artist,
          altText: previewAltText(place.name, record.description),
          matchEvidence: match.reason,
        };
      }
    }

    return undefined;
  }
}
