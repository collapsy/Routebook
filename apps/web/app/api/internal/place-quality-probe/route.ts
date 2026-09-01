import {
  calculatePlaceQualityScore,
  placeDistanceMeters,
  type PlaceQualityTarget,
} from "@routebook/place-catalog";

import { resolveConfiguredPlaceQualityProvider } from "@/lib/place-quality-provider";

export const dynamic = "force-dynamic";

const BRANCH = "codex/rb-inc-172-place-ranking-experience";

const categoryQueries = Object.freeze({
  beach: "praias",
  gastronomy: "restaurantes",
  nightlife: "bares e vida noturna",
  nature: "atrações e natureza",
});

const targets: readonly PlaceQualityTarget[] = Object.freeze([
  {
    id: "beach-praia-do-amor",
    name: "Praia do Amor",
    category: "beach",
    latitude: -6.2366,
    longitude: -35.0465,
  },
  {
    id: "gastronomy-camarao",
    name: "Camarão na Fazenda Pipa",
    category: "gastronomy",
    latitude: -6.229395,
    longitude: -35.04994,
  },
  {
    id: "nightlife-agora",
    name: "Agora Club",
    category: "nightlife",
    latitude: -6.2288875,
    longitude: -35.0488821,
  },
  {
    id: "nature-chapadao",
    name: "Chapadão de Pipa",
    category: "nature",
    latitude: -6.2445,
    longitude: -35.0407,
  },
]);

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview" || process.env.VERCEL_GIT_COMMIT_REF !== BRANCH) {
    return Response.json({ status: "unavailable" }, { status: 404 });
  }

  const configured = resolveConfiguredPlaceQualityProvider();
  if (configured.status !== "configured") {
    return Response.json(
      {
        status: configured.status,
        ...(configured.status === "missing-secret"
          ? { provider: configured.provider }
          : configured.status === "invalid-provider"
            ? { requestedProvider: configured.requestedProvider }
            : {}),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const matches = await configured.port.findSignals(targets);
    const targetById = new Map(targets.map((target) => [target.id, target]));
    const googleKey = process.env.GOOGLE_PLACES_API_KEY;
    const diagnostics =
      configured.provider === "google" && googleKey
        ? await Promise.all(
            targets.map(async (target) => {
              const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Goog-Api-Key": googleKey,
                  "X-Goog-FieldMask":
                    "places.displayName,places.location,places.rating,places.userRatingCount",
                },
                body: JSON.stringify({
                  textQuery: categoryQueries[target.category],
                  languageCode: "pt-BR",
                  regionCode: "BR",
                  pageSize: 20,
                  locationBias: {
                    circle: {
                      center: { latitude: target.latitude, longitude: target.longitude },
                      radius: 2_000,
                    },
                  },
                }),
              });
              const payload = (await response.json()) as {
                places?: readonly {
                  displayName?: { text?: string };
                  location?: { latitude?: number; longitude?: number };
                  rating?: number;
                  userRatingCount?: number;
                }[];
              };
              return {
                id: target.id,
                status: response.status,
                candidates: (payload.places ?? []).flatMap((candidate) => {
                  const name = candidate.displayName?.text;
                  const latitude = candidate.location?.latitude;
                  const longitude = candidate.location?.longitude;
                  if (!name || latitude === undefined || longitude === undefined) return [];
                  return [
                    {
                      name,
                      distanceMeters: Math.round(
                        placeDistanceMeters(target, { latitude, longitude }),
                      ),
                      rating: candidate.rating,
                      reviewCount: candidate.userRatingCount,
                    },
                  ];
                }),
              };
            }),
          )
        : [];

    return Response.json(
      {
        status: "ok",
        provider: configured.provider,
        targets: targets.length,
        matched: matches.length,
        results: matches.flatMap((match) => {
          const target = targetById.get(match.targetId);
          if (!target) return [];
          const quality = calculatePlaceQualityScore({
            category: target.category,
            distanceMeters: 1_000,
            signals: match.signals,
            contextualNow: true,
          });
          return [
            {
              id: target.id,
              name: target.name,
              category: target.category,
              rating: match.signals.rating?.value,
              reviewCount: match.signals.rating?.reviewCount,
              score: quality?.score,
              reasons: quality?.reasons ?? [],
              collectedAt: match.signals.collectedAt,
            },
          ];
        }),
        diagnostics,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "provider-error" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
