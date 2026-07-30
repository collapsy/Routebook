import { describe, expect, it } from "vitest";

import { createRecommendation, fingerprintRecommendation } from "./index";

function recommendation(generatedAt: Date, tripContextVersion = 2) {
  return createRecommendation({
    id: crypto.randomUUID(),
    snapshot: {
      schemaVersion: 1,
      tripId: "trip-1",
      destinationId: "pipa-rn-br",
      tripContextVersion,
      travelerProfileVersion: 3,
      itineraryVersion: 4,
      capturedAt: generatedAt,
    },
    target: {
      kind: "place",
      placeId: "place-1",
      destinationId: "pipa-rn-br",
      publicationStatus: "published",
    },
    reasons: [
      {
        code: "known-place",
        message: "Lugar publicado no Destino conhecido.",
        evidence: { placeId: "place-1" },
      },
    ],
    score: { value: 10, purpose: "ordering-only" },
    confidence: { level: "medium", basis: ["contexto conhecido"] },
    validity: { validFrom: generatedAt },
    generation: {
      generator: "deterministic",
      policyVersion: "place-ranking-v1",
      generatedAt,
    },
  });
}

describe("Recommendation context fingerprint", () => {
  it("ignores generated identity and clock for the same logical context", () => {
    const first = recommendation(new Date("2026-07-30T20:00:00.000Z"));
    const second = recommendation(new Date("2026-07-30T21:00:00.000Z"));

    expect(first.id).not.toBe(second.id);
    expect(fingerprintRecommendation(first)).toBe(fingerprintRecommendation(second));
  });

  it("changes after a relevant context version changes", () => {
    const first = recommendation(new Date("2026-07-30T20:00:00.000Z"), 2);
    const changed = recommendation(new Date("2026-07-30T20:00:00.000Z"), 3);

    expect(fingerprintRecommendation(first)).not.toBe(fingerprintRecommendation(changed));
  });
});
