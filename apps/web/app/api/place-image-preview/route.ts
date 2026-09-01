import { NextResponse } from "next/server";

import { PLACE_CATEGORIES, type PlaceCategory } from "@routebook/place-catalog";

import { resolveConfiguredGooglePlacePhotoProvider } from "../../../lib/google-place-photo";
import { WikimediaCommonsPlaceImageAdapter } from "../../../lib/wikimedia-place-image";

const SUPPORTED_DESTINATION_ID = "pipa-rn-br";
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

function parseCategory(value: string | null): PlaceCategory | undefined {
  return PLACE_CATEGORIES.includes(value as PlaceCategory) ? (value as PlaceCategory) : undefined;
}

function parseGooglePlaceId(value: string | null): string | undefined {
  const candidate = value?.trim() ?? "";
  return GOOGLE_PLACE_ID_PATTERN.test(candidate) ? candidate : undefined;
}

function isInsideSupportedRegion(latitude: number, longitude: number): boolean {
  return (
    latitude >= PIPA_REGION_BOUNDS.minimumLatitude &&
    latitude <= PIPA_REGION_BOUNDS.maximumLatitude &&
    longitude >= PIPA_REGION_BOUNDS.minimumLongitude &&
    longitude <= PIPA_REGION_BOUNDS.maximumLongitude
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const destinationId = url.searchParams.get("destinationId")?.trim();
  const name = url.searchParams.get("name")?.trim() ?? "";
  const latitude = parseCoordinate(url.searchParams.get("latitude"));
  const longitude = parseCoordinate(url.searchParams.get("longitude"));
  const category = parseCategory(url.searchParams.get("category"));
  const googlePlaceId = parseGooglePlaceId(url.searchParams.get("googlePlaceId"));

  if (
    destinationId !== SUPPORTED_DESTINATION_ID ||
    name.length < 2 ||
    name.length > 180 ||
    latitude === undefined ||
    longitude === undefined ||
    !isInsideSupportedRegion(latitude, longitude)
  ) {
    return NextResponse.json(
      { error: "Parâmetros inválidos para a prévia de imagem externa." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (googlePlaceId && category) {
    const google = resolveConfiguredGooglePlacePhotoProvider();
    if (google.status === "configured") {
      try {
        const preview = await google.adapter.findPreview({
          placeId: googlePlaceId,
          name,
          category,
          latitude,
          longitude,
        });
        if (preview) {
          const { mediaToken, ...publicPreview } = preview;
          return NextResponse.json(
            {
              ...publicPreview,
              mediaUrl: `/api/place-image-preview/google?token=${encodeURIComponent(mediaToken)}`,
            },
            { headers: { "Cache-Control": GOOGLE_CACHE_CONTROL } },
          );
        }
      } catch (error) {
        console.warn(
          "[place-image-preview] Google Places Photos indisponível; tentando Wikimedia",
          {
            destinationId,
            name,
            message: error instanceof Error ? error.message : "erro desconhecido",
          },
        );
      }
    }
  }

  try {
    const preview = await new WikimediaCommonsPlaceImageAdapter().findSecurePreview({
      name,
      latitude,
      longitude,
    });

    if (!preview) {
      return NextResponse.json(
        { error: "Nenhuma imagem externa com correspondência segura foi encontrada." },
        { status: 404, headers: { "Cache-Control": MISS_CACHE_CONTROL } },
      );
    }

    return NextResponse.json(
      { provider: "wikimedia-commons", ...preview },
      { headers: { "Cache-Control": SUCCESS_CACHE_CONTROL } },
    );
  } catch (error) {
    console.warn("[place-image-preview] Wikimedia Commons indisponível", {
      destinationId,
      name,
      message: error instanceof Error ? error.message : "erro desconhecido",
    });
    return NextResponse.json(
      { error: "A fonte de imagem externa está indisponível no momento." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
