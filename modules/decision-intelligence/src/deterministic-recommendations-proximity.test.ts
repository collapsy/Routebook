import type { Place } from "@routebook/place-catalog";
import { describe, expect, it } from "vitest";

import {
  DISTANCE_ABOVE_10_KM_WEIGHT,
  DISTANCE_UP_TO_2_KM_WEIGHT,
  generateDeterministicPlaceRecommendations,
  INTEREST_MATCH_WEIGHT,
} from "./index";

const generatedAt = new Date("2026-08-15T00:00:00.000Z");

function place(
  id: string,
  slug: string,
  latitude: number,
  longitude: number,
): Place {
  return {
    id,
    destinationId: "pipa-rn-br",
    slug,
    name: `Lugar ${id}`,
    summary: "Lugar publicado usado para validar proximidade da hospedagem.",
    category: "beach",
    latitude,
    longitude,
    publicationStatus: "published",
    createdAt: generatedAt,
    updatedAt: generatedAt,
  };
}

function generate(places: readonly Place[], withAccommodation: boolean) {
  return generateDeterministicPlaceRecommendations({
    context: {
      tripId: "trip-proximity",
      destinationId: "pipa-rn-br",
      tripContextVersion: 1,
      interests: ["beaches"],
      ...(withAccommodation
        ? { accommodationCoordinate: { latitude: 0, longitude: 0 } }
        : {}),
    },
    places,
    generatedAt,
    createRecommendationId: (candidate, index) => `${index}-${candidate.slug}`,
  });
}

describe("accommodation proximity in deterministic recommendations", () => {
  it("prefere o Place próximo sem excluir uma opção relevante mais distante", () => {
    const far = place("far", "zeta-distante", 0.2, 0);
    const near = place("near", "alfa-proximo", 0, 0);

    const results = generate([far, near], true);

    expect(results.map(({ place: candidate }) => candidate.id)).toEqual([
      "near",
      "far",
    ]);
    expect(results).toHaveLength(2);
    expect(results[0]?.recommendation.score.value).toBe(
      INTEREST_MATCH_WEIGHT + DISTANCE_UP_TO_2_KM_WEIGHT,
    );
    expect(results[1]?.recommendation.score.value).toBe(
      INTEREST_MATCH_WEIGHT + DISTANCE_ABOVE_10_KM_WEIGHT,
    );
  });

  it("mantém ranking determinístico e funcional sem coordenadas da hospedagem", () => {
    const first = place("first", "alfa", 0.2, 0);
    const second = place("second", "beta", 0, 0);

    const results = generate([second, first], false);

    expect(results.map(({ place: candidate }) => candidate.slug)).toEqual([
      "alfa",
      "beta",
    ]);
    expect(
      results.every((result) => result.geodesicDistanceMeters === undefined),
    ).toBe(true);
    expect(
      results.every((result) =>
        result.recommendation.limitations.some(
          (limitation) => limitation.code === "accommodation-distance-unavailable",
        ),
      ),
    ).toBe(true);
  });
});
