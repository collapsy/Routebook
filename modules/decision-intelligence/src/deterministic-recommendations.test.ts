import type { Place, PlaceCategory } from "@routebook/place-catalog";
import { describe, expect, it } from "vitest";

import {
  DISTANCE_ABOVE_10_KM_WEIGHT,
  DISTANCE_UP_TO_10_KM_WEIGHT,
  DISTANCE_UP_TO_2_KM_WEIGHT,
  DISTANCE_UP_TO_5_KM_WEIGHT,
  distanceWeight,
  generateDeterministicPlaceRecommendations,
  INTEREST_MATCH_WEIGHT,
  type DeterministicRecommendationContext,
  type TravelerInterest,
} from "./index";

const generatedAt = new Date("2026-07-30T21:00:00.000Z");

function place(
  id: string,
  slug: string,
  category: PlaceCategory,
  overrides: Partial<Place> = {},
): Place {
  return {
    id,
    destinationId: "pipa-rn-br",
    slug,
    name: `Lugar ${id}`,
    summary: "Resumo conhecido e publicado do Lugar para testes.",
    category,
    latitude: -6.228,
    longitude: -35.048,
    publicationStatus: "published",
    createdAt: generatedAt,
    updatedAt: generatedAt,
    ...overrides,
  };
}

function context(
  interests: readonly TravelerInterest[] = [],
  overrides: Partial<DeterministicRecommendationContext> = {},
): DeterministicRecommendationContext {
  return {
    tripId: "trip-1",
    destinationId: "pipa-rn-br",
    tripContextVersion: 3,
    travelerProfileVersion: 2,
    itineraryVersion: 4,
    interests,
    ...overrides,
  };
}

function generate(
  places: readonly Place[],
  recommendationContext: DeterministicRecommendationContext,
) {
  return generateDeterministicPlaceRecommendations({
    context: recommendationContext,
    places,
    generatedAt,
    createRecommendationId: (candidate, index) => `${index}-${candidate.slug}`,
  });
}

describe("deterministic place recommendations", () => {
  it("maps only the four canonical interests to catalog categories", () => {
    const results = generate(
      [
        place("1", "praia", "beach"),
        place("2", "restaurante", "gastronomy"),
        place("3", "parque", "nature"),
        place("4", "bar", "nightlife"),
      ],
      context(["beaches", "gastronomy", "nature", "nightlife"]),
    );

    expect(results).toHaveLength(4);
    for (const result of results) {
      expect(result.recommendation.score.value).toBe(INTEREST_MATCH_WEIGHT);
      expect(result.recommendation.reasons).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: "interest-category-match" })]),
      );
    }
  });

  it("does not invent categories for unsupported interests", () => {
    const [result] = generate(
      [place("1", "praia", "beach")],
      context(["culture", "rest", "adventure", "shopping"]),
    );

    expect(result?.recommendation.score.value).toBe(0);
    expect(result?.recommendation.limitations).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "interest-category-unavailable" })]),
    );
  });

  it("uses the named distance bands", () => {
    expect(distanceWeight(0)).toBe(DISTANCE_UP_TO_2_KM_WEIGHT);
    expect(distanceWeight(2_000)).toBe(DISTANCE_UP_TO_2_KM_WEIGHT);
    expect(distanceWeight(2_001)).toBe(DISTANCE_UP_TO_5_KM_WEIGHT);
    expect(distanceWeight(5_001)).toBe(DISTANCE_UP_TO_10_KM_WEIGHT);
    expect(distanceWeight(10_001)).toBe(DISTANCE_ABOVE_10_KM_WEIGHT);
  });

  it("reuses geodesic distance when accommodation coordinates are available", () => {
    const [result] = generate(
      [place("1", "origem", "beach", { latitude: 0, longitude: 0 })],
      context(["beaches"], {
        accommodationCoordinate: { latitude: 0, longitude: 0 },
      }),
    );

    expect(result?.geodesicDistanceMeters).toBe(0);
    expect(result?.recommendation.score.value).toBe(
      INTEREST_MATCH_WEIGHT + DISTANCE_UP_TO_2_KM_WEIGHT,
    );
    expect(result?.recommendation.reasons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "geodesic-distance-known",
          evidence: expect.objectContaining({
            measurement: "geodesic-straight-line",
          }),
        }),
      ]),
    );
  });

  it("continues without distance and records an explicit limitation", () => {
    const [result] = generate([place("1", "praia", "beach")], context(["beaches"]));

    expect(result?.geodesicDistanceMeters).toBeUndefined();
    expect(result?.recommendation.score.value).toBe(INTEREST_MATCH_WEIGHT);
    expect(result?.recommendation.limitations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "accommodation-distance-unavailable" }),
      ]),
    );
    expect(result?.recommendation.confidence.level).toBe("medium");
  });

  it("does not block generation when an optional distance criterion fails", () => {
    const [result] = generate(
      [place("1", "coordenada-invalida", "nature", { latitude: 999 })],
      context(["nature"], {
        accommodationCoordinate: { latitude: 0, longitude: 0 },
      }),
    );

    expect(result?.recommendation.score.value).toBe(INTEREST_MATCH_WEIGHT);
    expect(result?.recommendation.limitations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "geodesic-distance-could-not-be-evaluated" }),
      ]),
    );
  });

  it("filters unpublished places and places from another destination", () => {
    const results = generate(
      [
        place("published", "published", "nature"),
        place("draft", "draft", "nature", { publicationStatus: "draft" }),
        place("other", "other", "nature", { destinationId: "natal-rn-br" }),
      ],
      context(["nature"]),
    );

    expect(results.map((result) => result.place.id)).toEqual(["published"]);
    expect(results[0]?.recommendation.snapshot.tripId).toBe("trip-1");
  });

  it("orders by score and uses slug as a stable tie breaker", () => {
    const results = generate(
      [place("3", "zeta", "nightlife"), place("2", "beta", "beach"), place("1", "alfa", "beach")],
      context(["beaches"]),
    );

    expect(results.map((result) => result.place.slug)).toEqual(["alfa", "beta", "zeta"]);
  });

  it("produces the same order and recommendation data for the same input", () => {
    const places = [place("2", "beta", "beach"), place("1", "alfa", "beach")];
    const recommendationContext = context(["beaches"], {
      accommodationCoordinate: { latitude: -6.23, longitude: -35.05 },
    });

    const first = generate(places, recommendationContext);
    const second = generate(places, recommendationContext);

    expect(second).toEqual(first);
  });

  it("derives confidence from applied context instead of score", () => {
    const complete = generate(
      [place("1", "praia", "beach")],
      context(["beaches"], {
        accommodationCoordinate: { latitude: -6.23, longitude: -35.05 },
      }),
    )[0];
    const minimal = generate([place("1", "praia", "beach")], context([]))[0];

    expect(complete?.recommendation.confidence.level).toBe("high");
    expect(minimal?.recommendation.confidence.level).toBe("low");
    expect(complete?.recommendation.confidence).not.toHaveProperty("value");
  });

  it("keeps saved and planned places as candidates without changing their score", () => {
    const candidate = place("1", "praia", "beach");
    const plain = generate([candidate], context(["beaches"]))[0];
    const contextualized = generate(
      [candidate],
      context(["beaches"], {
        savedPlaceIds: new Set([candidate.id]),
        plannedPlaceIds: new Set([candidate.id]),
      }),
    )[0];

    expect(contextualized?.isSaved).toBe(true);
    expect(contextualized?.isPlanned).toBe(true);
    expect(contextualized?.recommendation.score).toEqual(plain?.recommendation.score);
  });

  it("contains no unsupported claims in reasons", () => {
    const [result] = generate([place("1", "praia", "beach")], context(["beaches"]));
    const text = result?.recommendation.reasons
      .map((reason) => reason.message.toLowerCase())
      .join(" ");

    expect(text).not.toMatch(/preço|avaliação|aberto|disponível agora|minutos|trânsito/);
    expect(result?.recommendation.limitations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "catalog-operational-data-unavailable" }),
      ]),
    );
  });
});
