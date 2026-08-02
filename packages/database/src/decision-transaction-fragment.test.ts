import { describe, expect, it, vi } from "vitest";

import { createAcceptItineraryProposalCommand } from "@routebook/proposal-management";

import { createDecisionTransactionFragment } from "./decision-transaction-fragment";

const decidedAt = new Date("2026-08-02T20:00:00.000Z");

function command() {
  return createAcceptItineraryProposalCommand({
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    itineraryProposalId: "proposal-1",
    expectedItineraryVersion: 7,
    idempotencyKey: "accept-proposal-1",
    actorType: "participant",
    actorId: "participant-1",
    decidedAt,
    items: [
      {
        proposedActivityId: "proposed-1",
        targetTripDayId: "day-1",
        title: "Praia do Amor",
        operationType: "add",
        flexibility: "suggested",
      },
      {
        proposedActivityId: "proposed-2",
        targetTripDayId: "day-1",
        title: "Baía dos Golfinhos",
        operationType: "add",
        flexibility: "suggested",
      },
    ],
  });
}

function executor() {
  return {
    select: vi.fn(),
    insert: vi.fn(),
  } as never;
}

describe("Decision transaction fragment", () => {
  it("constrói e persiste a Decision canônica de aceite", async () => {
    const save = vi.fn(async (decision) => decision);
    const fragment = createDecisionTransactionFragment(executor(), () => ({ save }));
    const currentCommand = command();

    const persisted = await fragment.persist({
      command: currentCommand,
      proposalApplicationId: "application-1",
      actorParticipantId: "participant-1",
      resultingItineraryVersion: 8,
      appliedProposedActivityIds: ["proposed-1", "proposed-2"],
      decisionId: "decision-1",
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(persisted).toMatchObject({
      id: "decision-1",
      tripId: "trip-1",
      actorParticipantId: "participant-1",
      decidedAt,
      type: "accept-itinerary-proposal",
      idempotencyKey: "accept-proposal-1",
      chosenOption: {
        itineraryProposalId: "proposal-1",
        proposedActivityIds: ["proposed-1", "proposed-2"],
      },
      contextSnapshot: {
        itineraryId: "itinerary-1",
        baseItineraryVersion: 7,
        requestFingerprint: currentCommand.requestFingerprint,
      },
      effect: {
        proposalApplicationId: "application-1",
        resultingItineraryVersion: 8,
        appliedProposedActivityIds: ["proposed-1", "proposed-2"],
      },
    });
  });

  it("delega replay idempotente ao repository escopado", async () => {
    const existing = { id: "existing-decision" };
    const save = vi.fn(async () => existing);
    const fragment = createDecisionTransactionFragment(executor(), () => ({ save: save as never }));

    await expect(
      fragment.persist({
        command: command(),
        proposalApplicationId: "application-1",
        actorParticipantId: "participant-1",
        resultingItineraryVersion: 8,
        appliedProposedActivityIds: ["proposed-1", "proposed-2"],
      }),
    ).resolves.toBe(existing);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("falha antes do write quando versão ou IDs divergem", async () => {
    const save = vi.fn();
    const fragment = createDecisionTransactionFragment(executor(), () => ({ save }));

    await expect(
      fragment.persist({
        command: command(),
        proposalApplicationId: "application-1",
        actorParticipantId: "participant-1",
        resultingItineraryVersion: 9,
        appliedProposedActivityIds: ["proposed-2", "proposed-1"],
      }),
    ).rejects.toThrow();
    expect(save).not.toHaveBeenCalled();
  });

  it("rejeita executor, factory e repository inválidos", () => {
    expect(() => createDecisionTransactionFragment(null as never)).toThrow(TypeError);
    expect(() => createDecisionTransactionFragment(executor(), null as never)).toThrow(TypeError);
    expect(() => createDecisionTransactionFragment(executor(), () => null as never)).toThrow(
      TypeError,
    );
  });
});
