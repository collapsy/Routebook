import { describe, expect, it, vi } from "vitest";

import type { Decision } from "@routebook/decision-intelligence";
import {
  AcceptItineraryProposalError,
  createAcceptItineraryProposalCommand,
  failProposalApplication,
  startProposalApplication,
  succeedProposalApplication,
} from "@routebook/proposal-management";
import type { AppliedProposalItemsToItinerary } from "@routebook/trip-management";

import {
  createApplyItineraryProposalTransaction,
  type ApplyItineraryProposalTransactionFragments,
  type ApplyItineraryProposalTransactionUnit,
} from "./apply-itinerary-proposal-transaction";
import type { AcceptedItineraryProposal, ReadyItineraryProposal } from "./itinerary-proposal-transaction-fragment";
import type { ProposalApplicationTransactionRecord } from "./proposal-application-transaction-fragment";

const decidedAt = new Date("2026-08-02T20:00:00.000Z");

function command() {
  return createAcceptItineraryProposalCommand({
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    itineraryProposalId: "proposal-1",
    expectedItineraryVersion: 7,
    idempotencyKey: "accept-proposal-1",
    actorType: "participant",
    actorId: "participant-owner",
    decidedAt,
    items: [
      {
        proposedActivityId: "proposed-1",
        operationType: "add",
        targetTripDayId: "day-1",
        title: "Praia do Amor",
        flexibility: "suggested",
      },
      {
        proposedActivityId: "proposed-2",
        operationType: "add",
        targetTripDayId: "day-1",
        title: "Baía dos Golfinhos",
        flexibility: "suggested",
      },
    ],
  });
}

function applicationRecords(currentCommand: ReturnType<typeof command>) {
  const request = Object.freeze({
    itineraryProposalId: currentCommand.itineraryProposalId,
    itineraryId: currentCommand.itineraryId,
    applicationType: currentCommand.applicationType,
    expectedItineraryVersion: currentCommand.expectedItineraryVersion,
    actorType: currentCommand.actorType,
    actorId: currentCommand.actorId,
    proposedActivityIds: currentCommand.proposedActivityIds,
  });
  const started = startProposalApplication({
    ...request,
    id: "application-1",
    idempotencyKey: currentCommand.idempotencyKey,
    startedAt: currentCommand.decidedAt,
  });
  const startedRecord = Object.freeze({
    tripId: currentCommand.tripId,
    itineraryId: currentCommand.itineraryId,
    request,
    application: started,
  });
  const succeededRecord = Object.freeze({
    ...startedRecord,
    application: succeedProposalApplication(started, {
      resultingItineraryVersion: 8,
      completedAt: currentCommand.decidedAt,
    }),
  });
  const failedRecord = Object.freeze({
    ...startedRecord,
    application: failProposalApplication(started, {
      failureCode: "decision-persistence-failure",
      completedAt: currentCommand.decidedAt,
    }),
  });

  return { startedRecord, succeededRecord, failedRecord };
}

function harness(
  reservationKind:
    | "reserved"
    | "replay"
    | "fingerprint-conflict"
    | "application-in-progress"
    | "application-failed" = "reserved",
) {
  const currentCommand = command();
  const { startedRecord, succeededRecord, failedRecord } = applicationRecords(currentCommand);
  const events: string[] = [];
  const readyProposal = { id: currentCommand.itineraryProposalId } as ReadyItineraryProposal;
  const acceptedProposal = {
    ...readyProposal,
    status: "accepted",
    acceptedAt: currentCommand.decidedAt,
  } as AcceptedItineraryProposal;
  const applied = Object.freeze({
    itinerary: {} as AppliedProposalItemsToItinerary["itinerary"],
    result: Object.freeze({
      itineraryId: currentCommand.itineraryId,
      resultingItineraryVersion: 8,
      appliedProposedActivityIds: currentCommand.proposedActivityIds,
    }),
  });
  const decision = { id: "decision-1" } as Decision;

  const proposalApplication: ApplyItineraryProposalTransactionFragments["proposalApplication"] = {
    reserve: vi.fn(async () => {
      events.push("reserve");
      switch (reservationKind) {
        case "reserved":
          return { kind: "reserved", record: startedRecord };
        case "replay":
          return { kind: "replay", record: succeededRecord };
        case "fingerprint-conflict":
          return { kind: "fingerprint-conflict", record: startedRecord };
        case "application-in-progress":
          return { kind: "application-in-progress", record: startedRecord };
        case "application-failed":
          return { kind: "application-failed", record: failedRecord };
      }
    }),
    succeed: vi.fn(async () => {
      events.push("succeed-application");
      return succeededRecord;
    }),
    fail: vi.fn(async () => failedRecord),
  };
  const itineraryProposal: ApplyItineraryProposalTransactionFragments["itineraryProposal"] = {
    loadForAcceptance: vi.fn(async () => {
      events.push("load-proposal");
      return readyProposal;
    }),
    accept: vi.fn(async () => {
      events.push("accept-proposal");
      return acceptedProposal;
    }),
  };
  const itinerary: ApplyItineraryProposalTransactionFragments["itinerary"] = {
    apply: vi.fn(async () => {
      events.push("apply-itinerary");
      return applied;
    }),
  };
  const decisionFragment: ApplyItineraryProposalTransactionFragments["decision"] = {
    persist: vi.fn(async () => {
      events.push("persist-decision");
      return decision;
    }),
  };
  const fragments = Object.freeze({
    proposalApplication,
    itineraryProposal,
    itinerary,
    decision: decisionFragment,
  });
  let transactions = 0;
  const unit: ApplyItineraryProposalTransactionUnit = {
    async execute<TResult>(operation: (value: ApplyItineraryProposalTransactionFragments) => Promise<TResult>) {
      transactions += 1;
      return operation(fragments);
    },
  };

  return {
    currentCommand,
    events,
    fragments,
    transaction: createApplyItineraryProposalTransaction(unit),
    transactions: () => transactions,
  };
}

describe("ApplyItineraryProposalTransaction", () => {
  it("compõe os quatro fragments na ordem canônica e retorna applied", async () => {
    const context = harness();

    await expect(context.transaction.execute(context.currentCommand)).resolves.toEqual({
      kind: "applied",
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      itineraryProposalId: "proposal-1",
      proposalApplicationId: "application-1",
      decisionId: "decision-1",
      requestFingerprint: context.currentCommand.requestFingerprint,
      resultingItineraryVersion: 8,
      appliedProposedActivityIds: ["proposed-1", "proposed-2"],
    });
    expect(context.transactions()).toBe(1);
    expect(context.events).toEqual([
      "reserve",
      "load-proposal",
      "apply-itinerary",
      "persist-decision",
      "accept-proposal",
      "succeed-application",
    ]);
    expect(context.fragments.decision.persist).toHaveBeenCalledWith({
      command: context.currentCommand,
      proposalApplicationId: "application-1",
      actorParticipantId: "participant-owner",
      resultingItineraryVersion: 8,
      appliedProposedActivityIds: ["proposed-1", "proposed-2"],
    });
  });

  it("mapeia replay terminal sem reaplicar ou finalizar agregados", async () => {
    const context = harness("replay");

    await expect(context.transaction.execute(context.currentCommand)).resolves.toMatchObject({
      kind: "replay",
      proposalApplicationId: "application-1",
      decisionId: "decision-1",
      resultingItineraryVersion: 8,
    });
    expect(context.events).toEqual(["reserve", "persist-decision"]);
    expect(context.fragments.itinerary.apply).not.toHaveBeenCalled();
    expect(context.fragments.itineraryProposal.loadForAcceptance).not.toHaveBeenCalled();
    expect(context.fragments.itineraryProposal.accept).not.toHaveBeenCalled();
    expect(context.fragments.proposalApplication.succeed).not.toHaveBeenCalled();
  });

  it.each([
    ["fingerprint-conflict", "fingerprint-conflict"],
    ["application-in-progress", "application-in-progress"],
    ["application-failed", "application-failed"],
  ] as const)("mapeia %s para o erro público %s", async (reservationKind, expectedCode) => {
    const context = harness(reservationKind);

    await expect(context.transaction.execute(context.currentCommand)).rejects.toMatchObject({
      name: "AcceptItineraryProposalError",
      code: expectedCode,
    } satisfies Partial<AcceptItineraryProposalError>);
    expect(context.events).toEqual(["reserve"]);
  });

  it("interrompe a composição quando um fragment falha", async () => {
    const context = harness();
    vi.mocked(context.fragments.decision.persist).mockRejectedValueOnce(
      new Error("falha intencional na Decision"),
    );

    await expect(context.transaction.execute(context.currentCommand)).rejects.toThrow(
      "falha intencional na Decision",
    );
    expect(context.events).toEqual([
      "reserve",
      "load-proposal",
      "apply-itinerary",
      "persist-decision",
    ]);
    expect(context.fragments.itineraryProposal.accept).not.toHaveBeenCalled();
    expect(context.fragments.proposalApplication.succeed).not.toHaveBeenCalled();
  });

  it("exige participante autenticado antes de abrir a transação", async () => {
    const context = harness();
    const invalidCommand = { ...context.currentCommand, actorType: "system" };

    await expect(context.transaction.execute(invalidCommand)).rejects.toThrow(
      "actorType participant",
    );
    expect(context.transactions()).toBe(0);
  });

  it("rejeita unidade transacional inválida", () => {
    expect(() => createApplyItineraryProposalTransaction({} as ApplyItineraryProposalTransactionUnit)).toThrow(
      "unidade transacional",
    );
  });
});
