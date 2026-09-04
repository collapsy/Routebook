import { createHmac, timingSafeEqual } from "node:crypto";

import type { PlaceCategory, PlaceQualityTarget } from "@routebook/place-catalog";

import { isConservativeQualityIdentityMatch } from "./place-quality-provider";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type AdapterDependencies = Readonly<{
  fetcher?: FetchLike;
  now?: () => Date;
}>;

export type GoogleAuthorAttribution = Readonly<{
  displayName: string;
  uri?: string;
}>;

type GooglePhotoResource = Readonly<{
  name: string;
  authorAttributions: readonly GoogleAuthorAttribution[];
  googleMapsUri?: string;
}>;

export type GooglePlacePhotoPreview = Readonly<{
  provider: "google-places";
  sourceName: "Google Maps";
  altText: string;
  authorAttributions: readonly GoogleAuthorAttribution[];
  sourceUrl?: string;
  matchEvidence: string;
  mediaToken: string;
}>;

export type GooglePlacePhotoMedia = Readonly<{
  bytes: ArrayBuffer;
  contentType: string;
}>;

export type GooglePlacePhotoProviderConfiguration =
  | Readonly<{ status: "not-configured" }>
  | Readonly<{ status: "invalid-provider"; requestedProvider: string }>
  | Readonly<{ status: "missing-secret"; provider: "google"; providerLabel: "Google Places" }>
  | Readonly<{ status: "blocked-environment"; provider: "google"; providerLabel: "Google Places" }>
  | Readonly<{
      status: "configured";
      provider: "google";
      providerLabel: "Google Places";
      adapter: GooglePlacePhotoAdapter;
    }>;

const DETAILS_ENDPOINT = "https://places.googleapis.com/v1/places";
const DETAILS_IDENTITY_FIELD_MASK = "id,displayName,location,photos";
const DETAILS_PHOTO_FIELD_MASK = "photos";
const DETAILS_TIMEOUT_MS = 5_000;
const MEDIA_TIMEOUT_MS = 10_000;
const MEDIA_TOKEN_TTL_MS = 10 * 60 * 1_000;
const MAXIMUM_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{5,256}$/;
const TOKEN_CONTEXT = "routebook-google-place-photo-v1";

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeGoogleUrl(value: unknown): string | undefined {
  const raw = cleanText(value);
  if (!raw) return undefined;
  try {
    const url = new URL(raw.startsWith("//") ? `https:${raw}` : raw);
    if (url.protocol !== "https:") return undefined;
    if (url.hostname !== "maps.google.com" && url.hostname !== "www.google.com") return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function parseAuthorAttributions(value: unknown): readonly GoogleAuthorAttribution[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry as { displayName?: unknown; uri?: unknown };
    const displayName = cleanText(candidate.displayName);
    if (!displayName) return [];
    const uri = normalizeGoogleUrl(candidate.uri);
    return [{ displayName, ...(uri ? { uri } : {}) }];
  });
}

function parsePhotoResources(value: unknown): readonly GooglePhotoResource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry as {
      name?: unknown;
      authorAttributions?: unknown;
      googleMapsUri?: unknown;
    };
    const name = cleanText(candidate.name);
    if (!name.startsWith("places/") || !name.includes("/photos/")) return [];
    const googleMapsUri = normalizeGoogleUrl(candidate.googleMapsUri);
    return [
      {
        name,
        authorAttributions: parseAuthorAttributions(candidate.authorAttributions),
        ...(googleMapsUri ? { googleMapsUri } : {}),
      },
    ];
  });
}

async function fetchWithTimeout(
  fetcher: FetchLike,
  input: string | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetcher(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function tokenSigningKey(apiKey: string): Buffer {
  return createHmac("sha256", apiKey).update(TOKEN_CONTEXT).digest();
}

function encodeMediaToken(
  apiKey: string,
  payload: Readonly<{ placeId: string; photoIndex: number; expiresAt: number }>,
): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", tokenSigningKey(apiKey))
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function decodeMediaToken(
  apiKey: string,
  token: string,
  now: Date,
): Readonly<{ placeId: string; photoIndex: number }> | undefined {
  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return undefined;

  const expected = createHmac("sha256", tokenSigningKey(apiKey)).update(encodedPayload).digest();
  let supplied: Buffer;
  try {
    supplied = Buffer.from(signature, "base64url");
  } catch {
    return undefined;
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return undefined;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as {
      placeId?: unknown;
      photoIndex?: unknown;
      expiresAt?: unknown;
    };
    const placeId = cleanText(payload.placeId);
    if (!PLACE_ID_PATTERN.test(placeId)) return undefined;
    if (!Number.isInteger(payload.photoIndex) || (payload.photoIndex as number) < 0) return undefined;
    if (typeof payload.expiresAt !== "number" || payload.expiresAt <= now.getTime()) return undefined;
    return { placeId, photoIndex: payload.photoIndex as number };
  } catch {
    return undefined;
  }
}

export class GooglePlacePhotoAdapter {
  private readonly fetcher: FetchLike;
  private readonly now: () => Date;

  constructor(
    private readonly apiKey: string,
    dependencies: AdapterDependencies = {},
  ) {
    this.fetcher = dependencies.fetcher ?? fetch;
    this.now = dependencies.now ?? (() => new Date());
  }

  private async fetchDetails(
    placeId: string,
    fieldMask: string,
  ): Promise<{
    id?: string;
    displayName?: Readonly<{ text?: string }>;
    location?: Readonly<{ latitude?: number; longitude?: number }>;
    photos?: unknown;
  }> {
    if (!PLACE_ID_PATTERN.test(placeId)) throw new Error("Google Place ID inválido para mídia.");

    const response = await fetchWithTimeout(
      this.fetcher,
      `${DETAILS_ENDPOINT}/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
          "X-Goog-FieldMask": fieldMask,
        },
      },
      DETAILS_TIMEOUT_MS,
    );
    if (!response.ok) throw new Error(`Google Place Details respondeu HTTP ${response.status}.`);
    return (await response.json()) as {
      id?: string;
      displayName?: Readonly<{ text?: string }>;
      location?: Readonly<{ latitude?: number; longitude?: number }>;
      photos?: unknown;
    };
  }

  async findPreview(
    input: Readonly<{
      placeId: string;
      name: string;
      category: PlaceCategory;
      latitude: number;
      longitude: number;
    }>,
  ): Promise<GooglePlacePhotoPreview | undefined> {
    const details = await this.fetchDetails(input.placeId, DETAILS_IDENTITY_FIELD_MASK);
    const externalId = cleanText(details.id);
    const name = cleanText(details.displayName?.text);
    const latitude = finiteNumber(details.location?.latitude);
    const longitude = finiteNumber(details.location?.longitude);
    if (!externalId || !name || latitude === undefined || longitude === undefined) return undefined;

    const target: PlaceQualityTarget = {
      id: "google-photo-target",
      name: input.name,
      category: input.category,
      latitude: input.latitude,
      longitude: input.longitude,
    };

    if (
      externalId !== input.placeId ||
      !isConservativeQualityIdentityMatch(target, { externalId, name, latitude, longitude })
    ) {
      return undefined;
    }

    const photo = parsePhotoResources(details.photos)[0];
    if (!photo) return undefined;

    return {
      provider: "google-places",
      sourceName: "Google Maps",
      altText: `Fotografia de ${input.name} fornecida pelo Google Maps.`,
      authorAttributions: photo.authorAttributions,
      ...(photo.googleMapsUri ? { sourceUrl: photo.googleMapsUri } : {}),
      matchEvidence: "Google Place ID revalidado por identidade e proximidade antes da mídia.",
      mediaToken: encodeMediaToken(this.apiKey, {
        placeId: input.placeId,
        photoIndex: 0,
        expiresAt: this.now().getTime() + MEDIA_TOKEN_TTL_MS,
      }),
    };
  }

  async fetchMedia(token: string): Promise<GooglePlacePhotoMedia | undefined> {
    const payload = decodeMediaToken(this.apiKey, token, this.now());
    if (!payload) return undefined;

    const details = await this.fetchDetails(payload.placeId, DETAILS_PHOTO_FIELD_MASK);
    const photo = parsePhotoResources(details.photos)[payload.photoIndex];
    if (!photo) return undefined;

    const mediaUrl = new URL(`https://places.googleapis.com/v1/${photo.name}/media`);
    mediaUrl.searchParams.set("maxWidthPx", "960");
    mediaUrl.searchParams.set("key", this.apiKey);

    const response = await fetchWithTimeout(this.fetcher, mediaUrl, { redirect: "follow" }, MEDIA_TIMEOUT_MS);
    if (!response.ok) throw new Error(`Google Place Photos respondeu HTTP ${response.status}.`);

    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
    const contentLength = Number(response.headers.get("content-length"));
    if (
      !ALLOWED_MIME_TYPES.has(contentType) ||
      (Number.isFinite(contentLength) && contentLength > MAXIMUM_IMAGE_BYTES)
    ) {
      throw new Error("Google Place Photo fora dos limites de mídia permitidos.");
    }

    const bytes = await response.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > MAXIMUM_IMAGE_BYTES) {
      throw new Error("Google Place Photo vazia ou acima do limite permitido.");
    }

    return { bytes, contentType };
  }
}

export function resolveConfiguredGooglePlacePhotoProvider(
  environment: Readonly<Record<string, string | undefined>> = process.env,
  dependencies: AdapterDependencies = {},
): GooglePlacePhotoProviderConfiguration {
  const requestedProvider = cleanText(environment.ROUTEBOOK_PLACE_PHOTO_PROVIDER).toLowerCase();
  if (!requestedProvider) return { status: "not-configured" };
  if (requestedProvider !== "google") return { status: "invalid-provider", requestedProvider };
  if (environment.VERCEL_ENV === "production") {
    return { status: "blocked-environment", provider: "google", providerLabel: "Google Places" };
  }
  const apiKey = cleanText(environment.GOOGLE_PLACES_API_KEY);
  if (!apiKey) {
    return { status: "missing-secret", provider: "google", providerLabel: "Google Places" };
  }
  return {
    status: "configured",
    provider: "google",
    providerLabel: "Google Places",
    adapter: new GooglePlacePhotoAdapter(apiKey, dependencies),
  };
}
