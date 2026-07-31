import { describe, expect, it } from "vitest";

import { createDecision, DecisionValidationError } from "./index";

const decidedAt = new Date("2026-07-30T21:00:00.000Z");
const snapshot = {
  schemaVersion: 1 as const,
  tripId: "trip-1",
  destinationId: "pipa-rn-br",
  tripContextVersion: 3,
  itineraryVersion: 4,
  capturedAt: new Date("2026-07-30T20:00:00.000Z"),
};

describe("Decision", () => {
  it("creates an immutable save-place Decision with actor, snapshot and effect", () => {
    const decision = createDecision({
      id: "decision-1",
      tripId: "trip-1",
      actorParticipantId: "participant-owner",
      decidedAt,
      chosenOption: { type: "save-place", placeId: "place-1" },
      contextSnapshot: snapshot,
      effect: { type: "saved-place", savedPlaceId: "saved-place-1" },
      idempotencyKey: "save-recommendation-1",
    });

    expect(decision).toMatchObject({
      id: "decision-1",
      tripId: "trip-1",
      actorParticipantId: "participant-owner",
      type: "save-place",
      idempotencyKey: "save-recommendation-1",
    });
    expect(decision.decidedAt).toEqual(decidedAt);
    expect(decision.contextSnapshot).toEqual(snapshot);
    expect(Object.isFrozen(decision)).toBe(true);
    expect(Object.isFrozen(decision.chosenOption)).toBe(true);
  });

  it("supports an optional Recommendation identity", () => {
    const withoutRecommendation = createDecision({
      tripId: "trip-1",
      actorParticipantId: "participant-owner",
      decidedAt,
      chosenOption: { type: "save-place", placeId: "place-1" },
      contextSnapshot: snapshot,
      effect: { type: "saved-place", savedPlaceId: "saved-place-1" },
      idempotencyKey: "manual-save-place-1",
    });

    expect(withoutRecommendation).not.toHaveProperty("recommendationId");
  });

  it("requires an explicit Day but keeps time and duration optional", () => {
    const decision = createDecision({
      tripId: "trip-1",
      actorParticipantId: "participant-owner",
      decidedAt,
      chosenOption: {
        type: "add-to-itinerary",
        placeId: "place-1",
        dayId: "day-2",
      },
      contextSnapshot: snapshot,
      effect: { type: "itinerary-activity", activityId: "activity-1" },
      idempotencyKey: "add-recommendation-1-day-2",
    });

    expect(decision.chosenOption).toEqual({
      type: "add-to-itinerary",
      placeId: "place-1",
      dayId: "day-2",
    });
  });

  it("rejects cross-trip snapshots, missing owners and empty idempotency keys", () => {
    expect(() =>
      createDecision({
        tripId: "trip-1",
        actorParticipantId: "participant-owner",
        decidedAt,
        chosenOption: { type: "save-place", placeId: "place-1" },
        contextSnapshot: { ...snapshot, tripId: "trip-2" },
        effect: { type: "saved-place", savedPlaceId: "saved-place-1" },
        idempotencyKey: "save-recommendation-1",
      }),
    ).toThrow(DecisionValidationError);

    expect(() =>
      createDecision({
        tripId: "trip-1",
        actorParticipantId: " ",
        decidedAt,
        chosenOption: { type: "save-place", placeId: "place-1" },
        contextSnapshot: snapshot,
        effect: { type: "saved-place", savedPlaceId: "saved-place-1" },
        idempotencyKey: "save-recommendation-1",
      }),
    ).toThrow(DecisionValidationError);

    expect(() =>
      createDecision({
        tripId: "trip-1",
        actorParticipantId: "participant-owner",
        decidedAt,
        chosenOption: { type: "save-place", placeId: "place-1" },
        contextSnapshot: snapshot,
        effect: { type: "saved-place", savedPlaceId: "saved-place-1" },
        idempotencyKey: "",
      }),
    ).toThrow(DecisionValidationError);
  });

  it("rejects inferred itinerary fields and incompatible effects", () => {
    expect(() =>
      createDecision({
        tripId: "trip-1",
        actorParticipantId: "participant-owner",
        decidedAt,
        chosenOption: {
          type: "add-to-itinerary",
          placeId: "place-1",
          dayId: "",
        },
        contextSnapshot: snapshot,
        effect: { type: "itinerary-activity", activityId: "activity-1" },
        idempotencyKey: "add-recommendation-1",
      }),
    ).toThrow(DecisionValidationError);

    expect(() =>
      createDecision({
        tripId: "trip-1",
        actorParticipantId: "participant-owner",
        decidedAt,
        chosenOption: { type: "save-place", placeId: "place-1" },
        contextSnapshot: snapshot,
        effect: { type: "itinerary-activity", activityId: "activity-1" },
        idempotencyKey: "save-recommendation-1",
      }),
    ).toThrow(DecisionValidationError);
  });
});
