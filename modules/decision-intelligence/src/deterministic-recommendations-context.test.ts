import type { Place } from "@routebook/place-catalog";
import { describe, expect, it } from "vitest";

import { generateDeterministicPlaceRecommendations } from "./index";

const generatedAt = new Date("2026-07-30T22:00:00.000Z");
const publishedPlace: Place = {
  id: "10000000-0000-4000-8000-000000000001",
  destinationId: "pipa-rn-br",
  slug: "praia-do-amor",
  name: "Praia do Amor",
  summary: "Praia publicada no catálogo.",
  category: "beach",
  latitude: -6.2366,
  longitude: -35.0465,
  publicationStatus: "published",
  createdAt: generatedAt,
  updatedAt: generatedAt,
};

describe("deterministic recommendation context limitations", () => {
  it("registers an explicit limitation when no traveler interests are available", () => {
    const [result] = generateDeterministicPlaceRecommendations({
      context: {
        tripId: "trip-1",
        destinationId: "pipa-rn-br",
        tripContextVersion: 1,
        interests: [],
      },
      places: [publishedPlace],
      generatedAt,
      createRecommendationId: () => "00000000-0000-4000-8000-000000000041",
    });

    expect(result?.recommendation.limitations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "traveler-interests-unavailable" }),
      ]),
    );
    expect(result?.recommendation.confidence.level).toBe("low");
  });
});
