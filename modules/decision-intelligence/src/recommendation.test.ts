import { describe, expect, it } from "vitest";

import {
  acceptRecommendation,
  createRecommendation,
  expireRecommendation,
  invalidateRecommendation,
  presentRecommendation,
  RecommendationTransitionError,
  RecommendationValidationError,
  rejectRecommendation,
  supersedeRecommendation,
  type CreateRecommendationInput,
} from "./index";

const generatedAt = new Date("2026-07-30T20:00:00.000Z");
const presentedAt = new Date("2026-07-30T20:01:00.000Z");
const resolvedAt = new Date("2026-07-30T20:02:00.000Z");

function recommendationInput(
  overrides: Partial<CreateRecommendationInput> = {},
): CreateRecommendationInput {
  return {
    id: "recommendation-1",
    snapshot: {
      schemaVersion: 1,
      tripId: "trip-1",
      destinationId: "pipa-rn-br",
      tripContextVersion: 3,
      travelerProfileVersion: 2,
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
        code: "interest-match",
        message: "A categoria corresponde a um interesse informado.",
        evidence: { interest: "beaches", category: "beach" },
      },
    ],
    limitations: [
      {
        code: "opening-hours-unavailable",
        message: "O catálogo não possui horário de funcionamento verificável.",
      },
    ],
    score: { value: 40, purpose: "ordering-only" },
    confidence: {
      level: "high",
      basis: ["interesses disponíveis", "hospedagem localizada"],
    },
    validity: {
      validFrom: generatedAt,
      expiresAt: new Date("2026-07-31T20:00:00.000Z"),
    },
    generation: {
      generator: "deterministic",
      policyVersion: "recommendation-ranking-v1",
      generatedAt,
    },
    ...overrides,
  };
}

describe("Recommendation", () => {
  it("creates an identified Recommendation with a minimized context snapshot", () => {
    const recommendation = createRecommendation(recommendationInput());

    expect(recommendation.id).toBe("recommendation-1");
    expect(recommendation.status).toBe("generated");
    expect(recommendation.snapshot).toEqual({
      schemaVersion: 1,
      tripId: "trip-1",
      destinationId: "pipa-rn-br",
      tripContextVersion: 3,
      travelerProfileVersion: 2,
      itineraryVersion: 4,
      capturedAt: generatedAt,
    });
    expect(recommendation.target.publicationStatus).toBe("published");
  });

  it("keeps score and confidence as distinct contracts", () => {
    const recommendation = createRecommendation(recommendationInput());

    expect(recommendation.score).toEqual({ value: 40, purpose: "ordering-only" });
    expect(recommendation.confidence).toEqual({
      level: "high",
      basis: ["interesses disponíveis", "hospedagem localizada"],
    });
    expect(recommendation.score).not.toHaveProperty("level");
    expect(recommendation.confidence).not.toHaveProperty("value");
  });

  it("rejects an unpublished or cross-destination target", () => {
    expect(() =>
      createRecommendation(
        recommendationInput({
          target: {
            kind: "place",
            placeId: "place-1",
            destinationId: "outro-destino",
            publicationStatus: "published",
          },
        }),
      ),
    ).toThrow(RecommendationValidationError);

    expect(() =>
      createRecommendation(
        recommendationInput({
          target: {
            kind: "place",
            placeId: "place-1",
            destinationId: "pipa-rn-br",
            publicationStatus: "draft" as "published",
          },
        }),
      ),
    ).toThrow(RecommendationValidationError);
  });

  it("requires at least one known reason before presentation", () => {
    const recommendation = createRecommendation(recommendationInput({ reasons: [] }));

    expect(() => presentRecommendation(recommendation, presentedAt)).toThrow(
      RecommendationValidationError,
    );
    expect(recommendation.status).toBe("generated");
  });

  it("presents and rejects without mutating the original aggregate", () => {
    const generated = createRecommendation(recommendationInput());
    const presented = presentRecommendation(generated, presentedAt);
    const rejected = rejectRecommendation(presented, resolvedAt);

    expect(generated.status).toBe("generated");
    expect(generated).not.toHaveProperty("presentedAt");
    expect(presented.status).toBe("presented");
    expect(presented.updatedAt).toEqual(presentedAt);
    expect(rejected.status).toBe("rejected");
    expect(rejected.statusReason).toBe("ignored-by-user");
    expect(rejected.resolvedAt).toEqual(resolvedAt);
    expect(presented.status).toBe("presented");
  });

  it("accepts only a presented Recommendation associated with a Decision", () => {
    const generated = createRecommendation(recommendationInput());
    const presented = presentRecommendation(generated, presentedAt);

    expect(() => acceptRecommendation(generated, "decision-1", resolvedAt)).toThrow(
      RecommendationTransitionError,
    );
    expect(() => acceptRecommendation(presented, "", resolvedAt)).toThrow(
      RecommendationValidationError,
    );

    const accepted = acceptRecommendation(presented, "decision-1", resolvedAt);
    expect(accepted.status).toBe("accepted");
    expect(accepted.linkedDecisionId).toBe("decision-1");
    expect(presented.status).toBe("presented");
  });

  it("expires only after the configured validity window", () => {
    const generated = createRecommendation(recommendationInput());

    expect(() => expireRecommendation(generated, resolvedAt)).toThrow(
      RecommendationValidationError,
    );

    const expiredAt = new Date("2026-07-31T20:00:00.000Z");
    const expired = expireRecommendation(generated, expiredAt);
    expect(expired.status).toBe("expired");
    expect(expired.resolvedAt).toEqual(expiredAt);
    expect(() => acceptRecommendation(expired, "decision-1", expiredAt)).toThrow(
      RecommendationTransitionError,
    );
  });

  it("invalidates incompatible context and blocks later acceptance", () => {
    const presented = presentRecommendation(
      createRecommendation(recommendationInput()),
      presentedAt,
    );
    const invalidated = invalidateRecommendation(
      presented,
      "trip-context-version-changed",
      resolvedAt,
    );

    expect(invalidated.status).toBe("invalidated");
    expect(invalidated.statusReason).toBe("trip-context-version-changed");
    expect(() => acceptRecommendation(invalidated, "decision-1", resolvedAt)).toThrow(
      RecommendationTransitionError,
    );
  });

  it("supersedes an active Recommendation with another identity", () => {
    const presented = presentRecommendation(
      createRecommendation(recommendationInput()),
      presentedAt,
    );

    expect(() => supersedeRecommendation(presented, presented.id, resolvedAt)).toThrow(
      RecommendationValidationError,
    );

    const superseded = supersedeRecommendation(presented, "recommendation-2", resolvedAt);
    expect(superseded.status).toBe("superseded");
    expect(superseded.supersededByRecommendationId).toBe("recommendation-2");
    expect(() => acceptRecommendation(superseded, "decision-1", resolvedAt)).toThrow(
      RecommendationTransitionError,
    );
  });

  it("rejects terminal-state transitions and time travel", () => {
    const presented = presentRecommendation(
      createRecommendation(recommendationInput()),
      presentedAt,
    );
    const rejected = rejectRecommendation(presented, resolvedAt);

    expect(() => rejectRecommendation(rejected, resolvedAt)).toThrow(RecommendationTransitionError);
    expect(() => invalidateRecommendation(rejected, "context-changed", resolvedAt)).toThrow(
      RecommendationTransitionError,
    );
    expect(() => rejectRecommendation(presented, new Date("2026-07-30T19:59:00.000Z"))).toThrow(
      RecommendationValidationError,
    );
  });

  it("copies mutable inputs so callers cannot change the aggregate afterwards", () => {
    const capturedAt = new Date(generatedAt);
    const reasonEvidence: Record<string, string> = { interest: "beaches" };
    const input = recommendationInput({
      snapshot: {
        schemaVersion: 1,
        tripId: "trip-1",
        destinationId: "pipa-rn-br",
        tripContextVersion: 1,
        capturedAt,
      },
      reasons: [
        {
          code: "interest-match",
          message: "Interesse conhecido.",
          evidence: reasonEvidence,
        },
      ],
    });

    const recommendation = createRecommendation(input);
    capturedAt.setUTCFullYear(2030);
    reasonEvidence.interest = "nightlife";

    expect(recommendation.snapshot.capturedAt).toEqual(generatedAt);
    expect(recommendation.reasons[0]?.evidence.interest).toBe("beaches");
    expect(Object.isFrozen(recommendation)).toBe(true);
    expect(Object.isFrozen(recommendation.reasons)).toBe(true);
  });
});
