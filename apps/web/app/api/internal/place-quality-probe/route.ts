import {
  calculatePlaceQualityScore,
  type PlaceQualityTarget,
} from "@routebook/place-catalog";

import { resolveConfiguredPlaceQualityProvider } from "@/lib/place-quality-provider";

export const dynamic = "force-dynamic";

const BRANCH = "codex/rb-inc-172-place-ranking-experience";

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
