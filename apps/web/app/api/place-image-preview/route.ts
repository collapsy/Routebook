import { NextResponse } from "next/server";

import { PLACE_CATEGORIES, type PlaceCategory } from "@routebook/place-catalog";

import { resolveConfiguredGooglePlacePhotoProvider } from "../../../lib/google-place-photo";
import { resolvePlaceBootstrapPolicy, runPlaceBootstrapStep } from "../../../lib/place-bootstrap";
import { WikimediaCommonsPlaceImageAdapter } from "../../../lib/wikimedia-place-image";

const WIKIMEDIA_DESTINATION_ID = "pipa-rn-br";
const SUCCESS_CACHE_CONTROL = "public, s-maxage=86400, stale-while-revalidate=604800";
const MISS_CACHE_CONTROL = "public, s-maxage=21600, stale-while-revalidate=86400";
const GOOGLE_CACHE_CONTROL = "private, no-store";
const GOOGLE_PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{5,256}$/;
const PIPA_REGION_BOUNDS = Object.freeze({
  minimumLatitude: -6.35,
  maximumLatitude: -6.1,
  minimumLongitude: -35.2,
  maximumLongitude: -34.95,
});

function parseCoordinate(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isValidCoordinate(latitude: number, longitude: number): boolean {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function parseCategory(value: string | null): PlaceCategory | undefined {
  return PLACE_CATEGORIES.includes(value as PlaceCategory) ? (value as PlaceCategory) : undefined;
}

function parseGooglePlaceId(value: string | null): string | undefined {
  const candidate = value?.trim() ?? "";
  return GOOGLE_PLACE_ID_PATTERN.test(candidate) ? candidate : undefined;
}

function isInsidePipaRegion(latitude: number, longitude: number): boolean {
  return (
    latitude >= PIPA_REGION_BOUNDS.minimumLatitude &&
    latitude <= PIPA_REGION_BOUNDS.maximumLatitude &&
    longitude >= PIPA_REGION_BOUNDS.minimumLongitude &&
    longitude <= PIPA_REGION_BOUNDS.maximumLongitude
  );
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
  const destinationId = url.searchParams.get("destinationId")?.trim();
  const name = url.searchParams.get("name")?.trim() ?? "";
  const latitude = parseCoordinate(url.searchParams.get("latitude"));
  const longitude = parseCoordinate(url.searchParams.get("longitude"));
  const requestedGooglePlaceId = url.searchParams.get("googlePlaceId")?.trim() ?? "";
  const category = parseCategory(url.searchParams.get("category"));
  const googlePlaceId = parseGooglePlaceId(requestedGooglePlaceId);

  if (
    name.length < 2 ||
    name.length > 180 ||
    latitude === undefined ||
    longitude === undefined ||
    !isValidCoordinate(latitude, longitude)
  ) {
    return NextResponse.json(
      { error: "Parâmetros inválidos para a prévia de imagem externa." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const wikimediaSupported =
    destinationId === WIKIMEDIA_DESTINATION_ID && isInsidePipaRegion(latitude, longitude);
  const hasGoogleCandidate = Boolean(googlePlaceId && category);

  if (!wikimediaSupported && !hasGoogleCandidate) {
    return NextResponse.json(
      { error: "Parâmetros inválidos para a prévia de imagem externa." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  let googleFailed = false;

  if (googlePlaceId && category) {
    const google = resolveConfiguredGooglePlacePhotoProvider();
    if (google.status === "configured") {
      const googleResult = await runPlaceBootstrapStep({
        enabled: policy.media.enabled,
        maxAttempts: policy.media.maxAttempts,
        operation: () =>
          google.adapter.findPreview({
            placeId: googlePlaceId,
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

      googleFailed = googleResult.status === "failed";
      console.info("[place-bootstrap] media preview completed", {
        provider: "google-places",
        status: googleResult.status,
        attempts: googleResult.attempts,
        durationMs: googleResult.durationMs,
        matched: false,
        ...(googleResult.status === "failed" ? { retryable: googleResult.retryable } : {}),
      });
    }
  }

  if (!wikimediaSupported) {
    return NextResponse.json(
      {
        error: googleFailed
          ? "A fonte de imagem externa está indisponível no momento."
          : "Nenhuma imagem externa com correspondência segura foi encontrada.",
      },
      {
        status: googleFailed ? 503 : 404,
        headers: { "Cache-Control": GOOGLE_CACHE_CONTROL },
      },
    );
  }

  const result = await runPlaceBootstrapStep({
    enabled: policy.media.enabled,
    maxAttempts: policy.media.maxAttempts,
    operation: () =>
      new WikimediaCommonsPlaceImageAdapter().findSecurePreview({
        name,
        latitude,
        longitude,
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
      { error: "Nenhuma imagem externa com correspondência segura foi encontrada." },
      { status: 404, headers: { "Cache-Control": MISS_CACHE_CONTROL } },
    );
  }

  console.info("[place-bootstrap] media preview completed", {
    provider: "wikimedia-commons",
    status: result.status,
    attempts: result.attempts,
    durationMs: result.durationMs,
    matched: true,
  });
  return NextResponse.json(
    { provider: "wikimedia-commons", ...result.value },
    { headers: { "Cache-Control": SUCCESS_CACHE_CONTROL } },
  );
}
