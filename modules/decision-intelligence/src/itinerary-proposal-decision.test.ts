import { describe, expect, it } from "vitest";

import { createDecision, DecisionValidationError } from "./index";

const decidedAt = new Date("2026-08-02T15:00:00.000Z");
const requestFingerprint = "a".repeat(64);

function acceptanceDecision(overrides: Record<string, unknown> = {}) {
  return createDecision({
    id: "decision-accept-1",
    tripId: "trip-1",
    actorParticipantId: "participant-owner",
    decidedAt,
    chosenOption: {
      type: "accept-itinerary-proposal",
      itineraryProposalId: "proposal-1",
      proposedActivityIds: ["proposed-1", "proposed-2"],
    },
    contextSnapshot: {
      schemaVersion: 1,
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      itineraryProposalId: "proposal-1",
      baseItineraryVersion: 7,
      requestFingerprint,
      capturedAt: decidedAt,
    },
    effect: {
      type: "itinerary-proposal-applied",
      proposalApplicationId: "application-1",
      itineraryId: "itinerary-1",
      resultingItineraryVersion: 8,
      appliedProposedActivityIds: ["proposed-1", "proposed-2"],
    },
    idempotencyKey: "accept-proposal-1",
    ...overrides,
  } as never);
}

describe("Itinerary Proposal acceptance Decision", () => {
  it("cria uma Decision imutável com contexto, escolha e efeito canônicos", () => {
    const decision = acceptanceDecision();

    expect(decision).toEqual({
      id: "decision-accept-1",
      tripId: "trip-1",
      actorParticipantId: "participant-owner",
      decidedAt,
      type: "accept-itinerary-proposal",
      chosenOption: {
        type: "accept-itinerary-proposal",
        itineraryProposalId: "proposal-1",
        proposedActivityIds: ["proposed-1", "proposed-2"],
      },
      contextSnapshot: {
        schemaVersion: 1,
        tripId: "trip-1",
        itineraryId: "itinerary-1",
        itineraryProposalId: "proposal-1",
        baseItineraryVersion: 7,
        requestFingerprint,
        capturedAt: decidedAt,
      },
      effect: {
        type: "itinerary-proposal-applied",
        proposalApplicationId: "application-1",
        itineraryId: "itinerary-1",
        resultingItineraryVersion: 8,
        appliedProposedActivityIds: ["proposed-1", "proposed-2"],
      },
      idempotencyKey: "accept-proposal-1",
    });
    expect(decision).not.toHaveProperty("recommendationId");
    expect(Object.isFrozen(decision)).toBe(true);
    expect(Object.isFrozen(decision.chosenOption)).toBe(true);
    expect(Object.isFrozen(decision.contextSnapshot)).toBe(true);
    expect(Object.isFrozen(decision.effect)).toBe(true);

    if (decision.chosenOption.type !== "accept-itinerary-proposal") {
      throw new Error("A Decision deveria conter a opção de aceite da Proposal.");
    }
    if (decision.effect.type !== "itinerary-proposal-applied") {
      throw new Error("A Decision deveria conter o efeito de aplicação da Proposal.");
    }
    expect(Object.isFrozen(decision.chosenOption.proposedActivityIds)).toBe(true);
    expect(Object.isFrozen(decision.effect.appliedProposedActivityIds)).toBe(true);
  });

  it("normaliza o fingerprint hexadecimal", () => {
    const decision = acceptanceDecision({
      contextSnapshot: {
        schemaVersion: 1,
        tripId: "trip-1",
        itineraryId: "itinerary-1",
        itineraryProposalId: "proposal-1",
        baseItineraryVersion: 7,
        requestFingerprint: "A".repeat(64),
        capturedAt: decidedAt,
      },
    });

    expect(decision.contextSnapshot).toMatchObject({ requestFingerprint });
  });

  it("rejeita Proposal divergente entre escolha e snapshot", () => {
    expect(() =>
      acceptanceDecision({
        contextSnapshot: {
          schemaVersion: 1,
          tripId: "trip-1",
          itineraryId: "itinerary-1",
          itineraryProposalId: "proposal-other",
          baseItineraryVersion: 7,
          requestFingerprint,
          capturedAt: decidedAt,
        },
      }),
    ).toThrow(DecisionValidationError);
  });

  it("rejeita Itinerary e versão resultante incompatíveis com o snapshot", () => {
    expect(() =>
      acceptanceDecision({
        effect: {
          type: "itinerary-proposal-applied",
          proposalApplicationId: "application-1",
          itineraryId: "itinerary-other",
          resultingItineraryVersion: 8,
          appliedProposedActivityIds: ["proposed-1", "proposed-2"],
        },
      }),
    ).toThrow(DecisionValidationError);

    expect(() =>
      acceptanceDecision({
        effect: {
          type: "itinerary-proposal-applied",
          proposalApplicationId: "application-1",
          itineraryId: "itinerary-1",
          resultingItineraryVersion: 9,
          appliedProposedActivityIds: ["proposed-1", "proposed-2"],
        },
      }),
    ).toThrow(DecisionValidationError);
  });

  it("rejeita IDs aplicados divergentes, reordenados ou duplicados", () => {
    expect(() =>
      acceptanceDecision({
        effect: {
          type: "itinerary-proposal-applied",
          proposalApplicationId: "application-1",
          itineraryId: "itinerary-1",
          resultingItineraryVersion: 8,
          appliedProposedActivityIds: ["proposed-2", "proposed-1"],
        },
      }),
    ).toThrow(DecisionValidationError);

    expect(() =>
      acceptanceDecision({
        chosenOption: {
          type: "accept-itinerary-proposal",
          itineraryProposalId: "proposal-1",
          proposedActivityIds: ["proposed-1", "proposed-1"],
        },
      }),
    ).toThrow(DecisionValidationError);
  });

  it("rejeita fingerprint e efeito de tipo incompatível", () => {
    expect(() =>
      acceptanceDecision({
        contextSnapshot: {
          schemaVersion: 1,
          tripId: "trip-1",
          itineraryId: "itinerary-1",
          itineraryProposalId: "proposal-1",
          baseItineraryVersion: 7,
          requestFingerprint: "invalid",
          capturedAt: decidedAt,
        },
      }),
    ).toThrow(DecisionValidationError);

    expect(() =>
      acceptanceDecision({
        effect: { type: "saved-place", savedPlaceId: "saved-place-1" },
      }),
    ).toThrow(DecisionValidationError);
  });
});
