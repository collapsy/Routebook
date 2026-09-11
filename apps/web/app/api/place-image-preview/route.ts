import { NextResponse } from "next/server";

import {
  PLACE_CATEGORIES,
  type PlaceCategory,
  type PlaceQualityTarget,
} from "@routebook/place-catalog";

import { resolveConfiguredGooglePlacePhotoProvider } from "../../../lib/google-place-photo";
import { resolvePlaceBootstrapPolicy, runPlaceBootstrapStep } from "../../../lib/place-bootstrap";
import {
  isConservativeQualityIdentityMatch,
  resolveConfiguredPlaceQualityProvider,
} from "../../../lib/place-quality-provider";
import { WikimediaCommonsPlaceImageAdapter } from "../../../lib/wikimedia-place-image";

const SUCCESS_CACHE_CONTROL = "public, s-maxage=86400, stale-while-revalidate=604800";
const MISS_CACHE_CONTROL = "public, s-maxage=21600, stale-while-revalidate=86400";
const GOOGLE_CACHE_CONTROL = "private, no-store";
const DESTINATION_CONTEXT_PATTERN = /^[\p{L}\p{N}\s._-]+$/u;
const GOOGLE_PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{5,256}$/;
const LAZY_QUALITY_TARGET_ID = "lazy-media-preview";
const GOOGLE_PLACES_SEARCH_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const GOOGLE_IDENTITY_FIELD_MASK =
  "places.id,places.displayName,places.location,places.formattedAddress";
const GOOGLE_IDENTITY_RADIUS_METERS = 2_500;
const GOOGLE_IDENTITY_PAGE_SIZE = 5;
const GOOGLE_IDENTITY_TIMEOUT_MS = 5_000;

type GoogleIdentityCandidate = Readonly<{
  externalId: string;
  name: string;
  latitude: number;
  longitude: number;
  addressLabel?: string;
}>;

function parseCoordinate(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isValidCoordinate(latitude: number, longitude: number): boolean {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function parseDestinationContext(value: string | null): string | undefined {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  if (normalized.length > 160 || !DESTINATION_CONTEXT_PATTERN.test(normalized)) return undefined;
  return normalized;
}

function parseCategory(value: string | null): PlaceCategory | undefined {
  return PLACE_CATEGORIES.includes(value as PlaceCategory) ? (value as PlaceCategory) : undefined;
}

function parseGooglePlaceId(value: string | null): string | undefined {
  const normalized = value?.trim() ?? "";
  return GOOGLE_PLACE_ID_PATTERN.test(normalized) ? normalized : undefined;
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

async function resolveIdentityOnlyGooglePlaceId(
  input: Readonly<{
    category: PlaceCategory;
    name: string;
    latitude: number;
    longitude: number;
    addressLabel?: string;
  }>,
): Promise<string | undefined> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) return undefined;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GOOGLE_IDENTITY_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(GOOGLE_PLACES_SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": GOOGLE_IDENTITY_FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: input.addressLabel ? `${input.name}, ${input.addressLabel}` : input.name,
        languageCode: "pt-BR",
        pageSize: GOOGLE_IDENTITY_PAGE_SIZE,
        locationBias: {
          circle: {
            center: { latitude: input.latitude, longitude: input.longitude },
            radius: GOOGLE_IDENTITY_RADIUS_METERS,
          },
        },
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Google Places respondeu HTTP ${response.status} no fallback de identidade.`);
  }

  const payload = (await response.json()) as {
    places?: readonly {
      id?: string;
      displayName?: Readonly<{ text?: string }>;
      location?: Readonly<{ latitude?: number; longitude?: number }>;
      formattedAddress?: string;
    }[];
  };

  const candidates = (payload.places ?? []).flatMap((place): GoogleIdentityCandidate[] => {
    const externalId = cleanText(place.id);
    const name = cleanText(place.displayName?.text);
    const latitude = finiteNumber(place.location?.latitude);
    const longitude = finiteNumber(place.location?.longitude);
    if (!externalId || !name || latitude === undefined || longitude === undefined) return [];
    const addressLabel = cleanText(place.formattedAddress);
    return [
      {
        externalId,
        name,
        latitude,
        longitude,
        ...(addressLabel ? { addressLabel } : {}),
      },
    ];
  });

  const target: PlaceQualityTarget = {
    id: LAZY_QUALITY_TARGET_ID,
    name: input.name,
    category: input.category,
    latitude: input.latitude,
    longitude: input.longitude,
    ...(input.addressLabel ? { addressLabel: input.addressLabel } : {}),
  };

  const matchedRank = candidates.findIndex((candidate) =>
    isConservativeQualityIdentityMatch(target, candidate, { allowSpatialAlias: true }),
  );
  const matchedCandidate = matchedRank >= 0 ? candidates[matchedRank] : undefined;

  console.info("[place-bootstrap] lazy media identity completed", {
    provider: "google-places",
    candidateCount: candidates.length,
    matched: Boolean(matchedCandidate),
    ...(matchedCandidate ? { matchedRank: matchedRank + 1 } : {}),
  });

  return matchedCandidate?.externalId;
}

async function resolveLazyGooglePlaceId(
  input: Readonly<{
    category: PlaceCategory;
    name: string;
    latitude: number;
    longitude: number;
    addressLabel?: string;
    enabled: boolean;
    maxAttempts: number;
  }>,
): Promise<Readonly<{ placeId?: string; failed: boolean }>> {
  const quality = resolveConfiguredPlaceQualityProvider();
  if (quality.status !== "configured" || quality.provider !== "google") {
    return { failed: false };
  }

  const result = await runPlaceBootstrapStep({
    enabled: input.enabled,
    maxAttempts: input.maxAttempts,
    operation: async () => {
      const target: PlaceQualityTarget = {
        id: LAZY_QUALITY_TARGET_ID,
        name: input.name,
        category: input.category,
        latitude: input.latitude,
        longitude: input.longitude,
        ...(input.addressLabel ? { addressLabel: input.addressLabel } : {}),
      };
      const matches = await quality.port.findSignals([target]);
      const signalPlaceId = matches.find(
        (match) =>
          match.targetId === LAZY_QUALITY_TARGET_ID && match.signals.provider === "google-places",
      )?.signals.externalId;
      if (signalPlaceId) return signalPlaceId;

      return resolveIdentityOnlyGooglePlaceId(input);
    },
  });

  const placeId = result.status === "success" ? result.value : undefined;
  console.info("[place-bootstrap] lazy media quality completed", {
    provider: "google-places",
    status: result.status,
    attempts: result.attempts,
    durationMs: result.durationMs,
    matched: Boolean(placeId),
    ...(result.status === "failed" ? { retryable: result.retryable } : {}),
  });

  return {
    ...(placeId ? { placeId } : {}),
    failed: result.status === "failed",
  };
}

export async function GET(request: Request) {
  const policy = resolvePlaceBootstrapPolicy();
  if (!policy.media.enabled) {
    return NextResponse.json(
      { error: "Prévia de mídia externa desabilitada para este ambiente." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  const url = new URL(request.url);
  const rawDestinationContext = url.searchParams.get("destinationId");
  const destinationContext = parseDestinationContext(rawDestinationContext);
  const name = url.searchParams.get("name")?.trim() ?? "";
  const latitude = parseCoordinate(url.searchParams.get("latitude"));
  const longitude = parseCoordinate(url.searchParams.get("longitude"));
  const rawGooglePlaceId = url.searchParams.get("googlePlaceId");
  const googlePlaceId = parseGooglePlaceId(rawGooglePlaceId);
  const rawCategory = url.searchParams.get("category");
  const category = parseCategory(rawCategory);

  if (
    name.length < 2 ||
    name.length > 180 ||
    latitude === undefined ||
    longitude === undefined ||
    !isValidCoordinate(latitude, longitude) ||
    (rawDestinationContext !== null && rawDestinationContext.trim() && !destinationContext) ||
    (rawGooglePlaceId !== null && rawGooglePlaceId.trim() && !googlePlaceId) ||
    (googlePlaceId && !category) ||
    (rawCategory !== null && rawCategory.trim() && !category)
  ) {
    return NextResponse.json(
      { error: "Parâmetros inválidos para a prévia de imagem externa." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const google = resolveConfiguredGooglePlacePhotoProvider();
  const onDemandGoogleEligible =
    !googlePlaceId && Boolean(category) && google.status === "configured";
  let effectiveGooglePlaceId = googlePlaceId;
  let googleFailed = false;

  if (onDemandGoogleEligible && category) {
    const lazyQuality = await resolveLazyGooglePlaceId({
      category,
      name,
      latitude,
      longitude,
      ...(destinationContext ? { addressLabel: destinationContext } : {}),
      enabled: policy.quality.enabled,
      maxAttempts: policy.quality.maxAttempts,
    });
    effectiveGooglePlaceId = lazyQuality.placeId;
    googleFailed = lazyQuality.failed;
  }

  if (effectiveGooglePlaceId && category && google.status === "configured") {
    const googleResult = await runPlaceBootstrapStep({
      enabled: policy.media.enabled,
      maxAttempts: policy.media.maxAttempts,
      operation: () =>
        google.adapter.findPreview({
          placeId: effectiveGooglePlaceId,
          name,
          category,
          latitude,
          longitude,
        }),
    });

    if (googleResult.status === "success" && googleResult.value) {
      const { mediaToken, ...publicPreview } = googleResult.value;
      console.info("[place-bootstrap] media preview completed", {
        provider: "google-places",
        status: googleResult.status,
        attempts: googleResult.attempts,
        durationMs: googleResult.durationMs,
        matched: true,
      });
      return NextResponse.json(
        {
          ...publicPreview,
          mediaUrl: `/api/place-image-preview/google?token=${encodeURIComponent(mediaToken)}`,
        },
        { headers: { "Cache-Control": GOOGLE_CACHE_CONTROL } },
      );
    }

    googleFailed = googleFailed || googleResult.status === "failed";
    console.info("[place-bootstrap] media preview completed", {
      provider: "google-places",
      status: googleResult.status,
      attempts: googleResult.attempts,
      durationMs: googleResult.durationMs,
      matched: false,
      ...(googleResult.status === "failed" ? { retryable: googleResult.retryable } : {}),
    });
  }

  const result = await runPlaceBootstrapStep({
    enabled: policy.media.enabled,
    maxAttempts: policy.media.maxAttempts,
    operation: () =>
      new WikimediaCommonsPlaceImageAdapter().findSecurePreview({
        name,
        latitude,
        longitude,
        ...(destinationContext ? { contextLabel: destinationContext } : {}),
      }),
  });

  if (result.status === "failed") {
    console.warn("[place-bootstrap] media provider degraded", {
      provider: "wikimedia-commons",
      status: result.status,
      attempts: result.attempts,
      durationMs: result.durationMs,
      retryable: result.retryable,
    });
    return NextResponse.json(
      { error: "A fonte de imagem externa está indisponível no momento." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (result.status !== "success" || !result.value) {
    console.info("[place-bootstrap] media preview completed", {
      provider: "wikimedia-commons",
      status: result.status,
      attempts: result.attempts,
      durationMs: result.durationMs,
      matched: false,
    });
    return NextResponse.json(
      {
        error: googleFailed
          ? "A fonte de imagem externa está indisponível no momento."
          : "Nenhuma imagem externa com correspondência segura foi encontrada.",
      },
      {
        status: googleFailed ? 503 : 404,
        headers: {
          "Cache-Control": googleFailed || onDemandGoogleEligible ? "no-store" : MISS_CACHE_CONTROL,
        },
      },
    );
  }

  console.info("[place-bootstrap] media preview completed", {
    provider: "wikimedia-commons",
    status: result.status,
    attempts: result.attempts,
    durationMs: result.durationMs,
    matched: true,
  });
  return NextResponse.json(result.value, {
    headers: {
      "Cache-Control": onDemandGoogleEligible ? GOOGLE_CACHE_CONTROL : SUCCESS_CACHE_CONTROL,
    },
  });
}
