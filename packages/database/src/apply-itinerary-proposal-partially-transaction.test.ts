import { describe, expect, it, vi } from "vitest";

import type { Decision } from "@routebook/decision-intelligence";
import {
  AcceptItineraryProposalError,
  completeItineraryProposalGeneration,
  createAcceptItineraryProposalPartiallyCommand,
  failProposalApplication,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  startProposalApplication,
  succeedProposalApplication,
} from "@routebook/proposal-management";
import type { AppliedProposalItemsToItinerary } from "@routebook/trip-management";

import {
  createApplyPartialItineraryProposalTransaction,
  type ApplyPartialItineraryProposalTransactionFragments,
  type ApplyPartialItineraryProposalTransactionUnit,
} from "./apply-itinerary-proposal-partially-transaction";
import type {
  PartiallyAcceptedItineraryProposal,
  ReadyItineraryProposal,
} from "./itinerary-proposal-transaction-fragment";

const requestedAt = new Date("2026-08-09T16:00:00.000Z");
const generatedAt = new Date("2026-08-09T16:02:00.000Z");
const decidedAt = new Date("2026-08-09T17:00:00.000Z");

function readyProposal(): ReadyItineraryProposal {
  const requested = requestItineraryProposal({
    id: "proposal-1",
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    baseTripContextVersion: 3,
    baseItineraryVersion: 7,
    contextSnapshotId: "context-1",
    requestedAt,
  });
  return completeItineraryProposalGeneration(
    startItineraryProposalGeneration(requested, new Date("2026-08-09T16:01:00.000Z")),
    {
      generationMethod: "deterministic-test",
      generationVersion: "1",
      proposedActivities: [
        {
          proposedActivityId: "proposed-1",
          targetTripDayId: "day-1",
          title: "Praia pela manhã",
          operationType: "add",
          proposedOrder: 0,
        },
        {
          proposedActivityId: "proposed-2",
          targetTripDayId: "day-1",
          title: "Almoço",
          operationType: "add",
          proposedOrder: 1,
        },
      ],
      criteria: ["ritmo"],
      justifications: ["reduz deslocamentos"],
      limitations: [],
      planningConflictIds: [],
      generatedAt,
      validUntil: new Date("2026-08-10T16:02:00.000Z"),
    },
  ) as ReadyItineraryProposal;
}

function command() {
  const proposal = readyProposal();
  return createAcceptItineraryProposalPartiallyCommand({
    proposal,
    expectedItineraryVersion: 7,
    idempotencyKey: "partial-accept-1",
    actorType: "participant",
    actorId: "participant-owner",
    decidedAt,
    items: [
      {
        proposedActivityId: "proposed-1",
        operationType: "add",
        targetTripDayId: "day-1",
        title: "Praia pela manhã",
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
    actorId: currentCommand.actorId!,
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
  const ready = readyProposal();
  const partiallyAccepted = {
    ...ready,
    status: "partially-accepted",
    proposedActivities: [ready.proposedActivities[1]!],
    acceptedAt: currentCommand.decidedAt,
    updatedAt: currentCommand.decidedAt,
  } as PartiallyAcceptedItineraryProposal;
  const applied = Object.freeze({
    itinerary: {} as AppliedProposalItemsToItinerary["itinerary"],
    result: Object.freeze({
      itineraryId: currentCommand.itineraryId,
      resultingItineraryVersion: 8,
      appliedProposedActivityIds: currentCommand.proposedActivityIds,
    }),
  });
  const decision = { id: "decision-1" } as Decision;

  const proposalApplication: ApplyPartialItineraryProposalTransactionFragments["proposalApplication"] =
    {
      reserve: vi.fn(async () => {
        events.push("reserve");
        switch (reservationKind) {
          case "reserved":
            return { kind: "reserved", record: startedRecord } as const;
          case "replay":
            return { kind: "replay", record: succeededRecord } as const;
          case "fingerprint-conflict":
            return { kind: "fingerprint-conflict", record: startedRecord } as const;
          case "application-in-progress":
            return { kind: "application-in-progress", record: startedRecord } as const;
          case "application-failed":
            return { kind: "application-failed", record: failedRecord } as const;
        }
      }),
      succeed: vi.fn(async () => {
        events.push("succeed-application");
        return succeededRecord;
      }),
      fail: vi.fn(async () => failedRecord),
    };
  const itineraryProposal: ApplyPartialItineraryProposalTransactionFragments["itineraryProposal"] =
    {
      loadForAcceptance: vi.fn(async () => ready),
      accept: vi.fn(async () => ({ ...ready, status: "accepted" }) as never),
      loadForPartialAcceptance: vi.fn(async () => {
        events.push("load-proposal");
        return ready;
      }),
      acceptPartially: vi.fn(async () => {
        events.push("accept-partially");
        return partiallyAccepted;
      }),
    };
  const itinerary: ApplyPartialItineraryProposalTransactionFragments["itinerary"] = {
    apply: vi.fn(async () => {
      events.push("apply-itinerary");
      return applied;
    }),
  };
  const decisionFragment: ApplyPartialItineraryProposalTransactionFragments["decision"] = {
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
  const unit: ApplyPartialItineraryProposalTransactionUnit = {
    async execute<TResult>(
      operation: (value: ApplyPartialItineraryProposalTransactionFragments) => Promise<TResult>,
    ) {
      transactions += 1;
      return operation(fragments);
    },
  };

  return {
    currentCommand,
    events,
    fragments,
    transaction: createApplyPartialItineraryProposalTransaction(unit),
    transactions: () => transactions,
  };
}

describe("ApplyPartialItineraryProposalTransaction", () => {
  it("compõe os fragments na ordem canônica e preserva os itens restantes", async () => {
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
      appliedProposedActivityIds: ["proposed-1"],
      remainingProposedActivityIds: ["proposed-2"],
    });
    expect(context.transactions()).toBe(1);
    expect(context.events).toEqual([
      "reserve",
      "load-proposal",
      "apply-itinerary",
      "persist-decision",
      "accept-partially",
      "succeed-application",
    ]);
  });

  it("mapeia replay terminal sem reaplicar ou refinalizar a Proposal", async () => {
    const context = harness("replay");

    await expect(context.transaction.execute(context.currentCommand)).resolves.toMatchObject({
      kind: "replay",
      proposalApplicationId: "application-1",
      decisionId: "decision-1",
      resultingItineraryVersion: 8,
      appliedProposedActivityIds: ["proposed-1"],
      remainingProposedActivityIds: ["proposed-2"],
    });
    expect(context.events).toEqual(["reserve", "persist-decision"]);
    expect(context.fragments.itinerary.apply).not.toHaveBeenCalled();
    expect(context.fragments.itineraryProposal.loadForPartialAcceptance).not.toHaveBeenCalled();
    expect(context.fragments.itineraryProposal.acceptPartially).not.toHaveBeenCalled();
    expect(context.fragments.proposalApplication.succeed).not.toHaveBeenCalled();
  });

  it.each([
    ["fingerprint-conflict", "fingerprint-conflict"],
    ["application-in-progress", "application-in-progress"],
    ["application-failed", "application-failed"],
  ] as const)("mapeia %s para o erro parcial %s", async (reservationKind, expectedCode) => {
    const context = harness(reservationKind);

    await expect(context.transaction.execute(context.currentCommand)).rejects.toMatchObject({
      name: "PartialItineraryProposalAcceptanceError",
      code: expectedCode,
    });
    expect(context.events).toEqual(["reserve"]);
  });

  it("converte erro legado do fragment de Itinerary para o erro público parcial", async () => {
    const context = harness();
    vi.mocked(context.fragments.itinerary.apply).mockRejectedValueOnce(
      new AcceptItineraryProposalError("itinerary-version-mismatch", "versão divergente"),
    );

    await expect(context.transaction.execute(context.currentCommand)).rejects.toMatchObject({
      name: "PartialItineraryProposalAcceptanceError",
      code: "itinerary-version-mismatch",
    });
    expect(context.fragments.itineraryProposal.acceptPartially).not.toHaveBeenCalled();
  });

  it("interrompe a composição quando um fragment falha", async () => {
    const context = harness();
    vi.mocked(context.fragments.decision.persist).mockImplementationOnce(async () => {
      context.events.push("persist-decision");
      throw new Error("falha intencional na Decision");
    });

    await expect(context.transaction.execute(context.currentCommand)).rejects.toThrow(
      "falha intencional na Decision",
    );
    expect(context.events).toEqual([
      "reserve",
      "load-proposal",
      "apply-itinerary",
      "persist-decision",
    ]);
    expect(context.fragments.itineraryProposal.acceptPartially).not.toHaveBeenCalled();
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
    expect(() =>
      createApplyPartialItineraryProposalTransaction(
        {} as ApplyPartialItineraryProposalTransactionUnit,
      ),
    ).toThrow("unidade transacional");
  });
});
