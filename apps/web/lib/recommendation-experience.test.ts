import { describe, expect, it } from "vitest";

import { createRecommendation, presentRecommendation } from "@routebook/decision-intelligence";
import { createPlace } from "@routebook/place-catalog";

import {
  buildFocusedRecommendationPresentation,
  formatGeodesicDistance,
  toRecommendationCardViewModel,
  type RecommendationCardViewModel,
} from "./recommendation-experience";

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

function presentationCard(
  index: number,
  overrides: Partial<RecommendationCardViewModel> = {},
): RecommendationCardViewModel {
  return {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}` as RecommendationCardViewModel["id"],
    status: "presented",
    placeId: `place-${index}`,
    placeSlug: `place-${index}`,
    placeName: `Place ${index}`,
    category: "beach",
    summary: `Resumo ${index}`,
    reasons: [],
    limitations: [],
    confidenceLevel: "medium",
    confidenceBasis: ["contexto disponível"],
    isSaved: false,
    isPlanned: false,
    detailsHref: `/viagens/trip-1/lugares/place-${index}`,
    canIgnore: true,
    ...overrides,
  };
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

describe("Focused recommendation presentation", () => {
  it("limits pending cards without changing their canonical order", () => {
    const cards = Array.from({ length: 8 }, (_, index) => presentationCard(index + 1));
    const originalIds = cards.map((card) => card.id);

    const presentation = buildFocusedRecommendationPresentation(cards);

    expect(presentation.focusedCards.map((card) => card.id)).toEqual(originalIds.slice(0, 6));
    expect(presentation.remainingPendingCount).toBe(2);
    expect(presentation.consideredCards).toEqual([]);
    expect(presentation.totalCount).toBe(8);
    expect(cards.map((card) => card.id)).toEqual(originalIds);
  });

  it("keeps accepted, rejected, saved and planned cards out of focused slots but accessible", () => {
    const cards = [
      presentationCard(1),
      presentationCard(2, { isSaved: true }),
      presentationCard(3),
      presentationCard(4, { status: "rejected", canIgnore: false }),
      presentationCard(5),
      presentationCard(6, { isPlanned: true }),
      presentationCard(7),
      presentationCard(8, { status: "accepted", canIgnore: false }),
      presentationCard(9),
      presentationCard(10),
      presentationCard(11),
      presentationCard(12),
    ];

    const presentation = buildFocusedRecommendationPresentation(cards);

    expect(presentation.focusedCards.map((card) => card.placeName)).toEqual([
      "Place 1",
      "Place 3",
      "Place 5",
      "Place 7",
      "Place 9",
      "Place 10",
    ]);
    expect(presentation.consideredCards.map((card) => card.placeName)).toEqual([
      "Place 2",
      "Place 4",
      "Place 6",
      "Place 8",
    ]);
    expect(presentation.remainingPendingCount).toBe(2);
    expect(presentation.totalCount).toBe(12);
  });

  it("supports a custom positive limit and rejects invalid limits", () => {
    const cards = [presentationCard(1), presentationCard(2), presentationCard(3)];

    expect(buildFocusedRecommendationPresentation(cards, 2).focusedCards).toHaveLength(2);
    expect(() => buildFocusedRecommendationPresentation(cards, 0)).toThrow(RangeError);
    expect(() => buildFocusedRecommendationPresentation(cards, 1.5)).toThrow(RangeError);
  });
});
