import { describe, expect, it } from "vitest";

import { createRecommendation, presentRecommendation } from "@routebook/decision-intelligence";
import { createPlace } from "@routebook/place-catalog";

import { formatGeodesicDistance, toRecommendationCardViewModel } from "./recommendation-experience";

const generatedAt = new Date("2026-07-30T20:00:00.000Z");
const primaryImage = {
  assetPath: "/place-images/tests/praia-do-amor.webp",
  altText: "Falésias da Praia do Amor vistas do alto.",
  sourceName: "Acervo RouteBook",
  sourceUrl: "https://example.com/acervo/praia-do-amor",
  license: "uso autorizado",
} as const;

function presentedRecommendation() {
  return presentRecommendation(
    createRecommendation({
      id: "00000000-0000-4000-8000-000000000041",
      snapshot: {
        schemaVersion: 1,
        tripId: "trip-1",
        destinationId: "pipa-rn-br",
        tripContextVersion: 2,
        capturedAt: generatedAt,
      },
      target: {
        kind: "place",
        placeId: "10000000-0000-4000-8000-000000000001",
        destinationId: "pipa-rn-br",
        publicationStatus: "published",
      },
      reasons: [
        {
          code: "interest-category-match",
          message: "A categoria corresponde a um interesse informado.",
          evidence: { category: "beach" },
        },
      ],
      limitations: [
        {
          code: "catalog-operational-data-unavailable",
          message: "Dados operacionais não estão disponíveis.",
        },
      ],
      score: { value: 130, purpose: "ordering-only" },
      confidence: { level: "high", basis: ["interesses e distância conhecidos"] },
      validity: { validFrom: generatedAt },
      generation: {
        generator: "deterministic",
        policyVersion: "place-ranking-v1",
        generatedAt,
      },
    }),
    generatedAt,
  );
}

describe("Recommendation experience view model", () => {
  it("formats geodesic distance without implying route duration", () => {
    expect(formatGeodesicDistance(850)).toBe("850 m em linha reta");
    expect(formatGeodesicDistance(1_850)).toBe("1,9 km em linha reta");
  });

  it("does not expose the internal RecommendationScore", () => {
    const place = createPlace({
      destinationId: "pipa-rn-br",
      slug: "praia-do-amor",
      name: "Praia do Amor",
      summary: "Praia publicada no catálogo.",
      category: "beach",
      latitude: -6.2366,
      longitude: -35.0465,
      priceRange: "moderate",
      primaryImage,
      publicationStatus: "published",
    });
    const viewModel = toRecommendationCardViewModel({
      tripId: "trip-1",
      recommendation: presentedRecommendation(),
      place: { ...place, id: "10000000-0000-4000-8000-000000000001" },
      geodesicDistanceMeters: 1_850,
      isSaved: false,
      isPlanned: false,
    });

    expect(viewModel).not.toHaveProperty("score");
    expect(viewModel).not.toHaveProperty("rating");
    expect(viewModel.confidenceLevel).toBe("high");
    expect(viewModel.canIgnore).toBe(true);
    expect(viewModel.primaryImage).toEqual(primaryImage);
    expect(viewModel.priceRange).toBe("moderate");
  });

  it("omits primaryImage when the Place has no governed image", () => {
    const place = createPlace({
      destinationId: "pipa-rn-br",
      slug: "praia-do-centro",
      name: "Praia do Centro",
      summary: "Praia publicada no catálogo sem imagem principal curada.",
      category: "beach",
      latitude: -6.23,
      longitude: -35.05,
      publicationStatus: "published",
    });

    const viewModel = toRecommendationCardViewModel({
      tripId: "trip-1",
      recommendation: presentedRecommendation(),
      place: { ...place, id: "10000000-0000-4000-8000-000000000001" },
      isSaved: false,
      isPlanned: false,
    });

    expect(viewModel).not.toHaveProperty("primaryImage");
  });
});
