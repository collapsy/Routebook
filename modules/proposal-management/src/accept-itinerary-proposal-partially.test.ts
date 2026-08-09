import { describe, expect, it } from "vitest";

import type { ApplyProposalItem } from "@routebook/trip-management";

import {
  completeItineraryProposalGeneration,
  rejectItineraryProposal,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposal,
} from "./itinerary-proposal";
import {
  createAcceptItineraryProposalPartiallyCommand,
  PartialItineraryProposalAcceptanceError,
  partiallyAcceptItineraryProposal,
  selectItineraryProposalForPartialAcceptance,
} from "./accept-itinerary-proposal-partially";
import { createProposalApplicationRequestFingerprint } from "./proposal-application";

const requestedAt = new Date("2026-08-09T14:00:00.000Z");
const generatedAt = new Date("2026-08-09T14:02:00.000Z");
const decidedAt = new Date("2026-08-09T15:00:00.000Z");

function readyProposal(): ItineraryProposal {
  const requested = requestItineraryProposal({
    id: "proposal-1",
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    baseTripContextVersion: 3,
    baseItineraryVersion: 7,
    contextSnapshotId: "context-1",
    requestedAt,
  });
  const generating = startItineraryProposalGeneration(
    requested,
    new Date("2026-08-09T14:01:00.000Z"),
  );

  return completeItineraryProposalGeneration(generating, {
    generationMethod: "deterministic-test",
    generationVersion: "1",
    proposedActivities: [
      {
        proposedActivityId: "proposed-1",
        targetTripDayId: "day-1",
        title: "Praia pela manhã",
        operationType: "add",
        proposedOrder: 0,
        reason: "Melhor maré.",
      },
      {
        proposedActivityId: "proposed-2",
        sourceActivityId: "activity-2",
        title: "Almoço mais tarde",
        operationType: "update",
        proposedStartTime: "13:30",
        proposedOrder: 1,
        reason: "Reduz deslocamentos.",
      },
      {
        proposedActivityId: "proposed-3",
        sourceActivityId: "activity-3",
        targetTripDayId: "day-2",
        title: "Mirante no segundo dia",
        operationType: "move",
        proposedOrder: 0,
        reason: "Evita conflito de horário.",
      },
    ],
    criteria: ["Ritmo leve"],
    justifications: ["A seleção reduz deslocamentos."],
    limitations: [],
    planningConflictIds: [],
    generatedAt,
    validUntil: new Date("2026-08-10T14:02:00.000Z"),
  });
}

function item(id: "proposed-1" | "proposed-2" | "proposed-3"): ApplyProposalItem {
  switch (id) {
    case "proposed-1":
      return {
        proposedActivityId: id,
        operationType: "add",
        targetTripDayId: "day-1",
        title: "Praia pela manhã",
      };
    case "proposed-2":
      return {
        proposedActivityId: id,
        operationType: "update",
        sourceActivityId: "activity-2",
        title: "Almoço mais tarde",
        startTime: "13:30",
      };
    case "proposed-3":
      return {
        proposedActivityId: id,
        operationType: "move",
        sourceActivityId: "activity-3",
        targetTripDayId: "day-2",
      };
  }
}

function commandInput(items: readonly ApplyProposalItem[]) {
  return {
    proposal: readyProposal(),
    expectedItineraryVersion: 7,
    idempotencyKey: " partial-accept-1 ",
    actorType: " participant ",
    actorId: " participant-local ",
    decidedAt,
    items,
  } as const;
}

describe("selectItineraryProposalForPartialAcceptance", () => {
  it("particiona pela ordem canônica da Proposal, independentemente da ordem da seleção", () => {
    const selection = selectItineraryProposalForPartialAcceptance(
      readyProposal(),
      [" proposed-3 ", " proposed-1 "],
      decidedAt,
    );

    expect(selection.selected.map(({ proposedActivityId }) => proposedActivityId)).toEqual([
      "proposed-1",
      "proposed-3",
    ]);
    expect(selection.remaining.map(({ proposedActivityId }) => proposedActivityId)).toEqual([
      "proposed-2",
    ]);
    expect(Object.isFrozen(selection)).toBe(true);
    expect(Object.isFrozen(selection.selected)).toBe(true);
    expect(Object.isFrozen(selection.remaining)).toBe(true);
  });

  it.each([
    ["selection-empty", []],
    ["duplicate-selection", ["proposed-1", "proposed-1"]],
    ["unknown-proposed-activity", ["proposed-unknown"]],
    ["full-selection", ["proposed-1", "proposed-2", "proposed-3"]],
  ] as const)("rejeita seleção inválida com código %s", (code, selectedIds) => {
    expect(() =>
      selectItineraryProposalForPartialAcceptance(readyProposal(), selectedIds, decidedAt),
    ).toThrowError(expect.objectContaining({ code }));
  });

  it("rejeita Proposal que não está ready", () => {
    const rejected = rejectItineraryProposal(readyProposal(), decidedAt);

    expect(() =>
      selectItineraryProposalForPartialAcceptance(rejected, ["proposed-1"], decidedAt),
    ).toThrowError(
      expect.objectContaining<PartialItineraryProposalAcceptanceError>({
        code: "proposal-not-ready",
      }),
    );
  });

  it("rejeita aceite no instante de expiração ou depois dele", () => {
    const proposal = readyProposal();

    expect(() =>
      selectItineraryProposalForPartialAcceptance(
        proposal,
        ["proposed-1"],
        new Date(proposal.validUntil!.getTime()),
      ),
    ).toThrowError(expect.objectContaining({ code: "proposal-expired" }));
  });
});

describe("createAcceptItineraryProposalPartiallyCommand", () => {
  it("normaliza os itens pela ordem da Proposal e produz fingerprint partial canônico", () => {
    const command = createAcceptItineraryProposalPartiallyCommand(
      commandInput([item("proposed-3"), item("proposed-1")]),
    );

    expect(command).toMatchObject({
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      itineraryProposalId: "proposal-1",
      expectedItineraryVersion: 7,
      idempotencyKey: "partial-accept-1",
      applicationType: "partial",
      actorType: "participant",
      actorId: "participant-local",
      proposedActivityIds: ["proposed-1", "proposed-3"],
      remainingProposedActivityIds: ["proposed-2"],
    });
    expect(command.items.map(({ proposedActivityId }) => proposedActivityId)).toEqual([
      "proposed-1",
      "proposed-3",
    ]);
    expect(command.decidedAt).toEqual(decidedAt);
    expect(command.decidedAt).not.toBe(decidedAt);
    expect(command.requestFingerprint).toBe(
      createProposalApplicationRequestFingerprint({
        itineraryProposalId: "proposal-1",
        itineraryId: "itinerary-1",
        applicationType: "partial",
        expectedItineraryVersion: 7,
        actorType: "participant",
        actorId: "participant-local",
        proposedActivityIds: ["proposed-1", "proposed-3"],
      }),
    );
  });

  it("gera o mesmo fingerprint para a mesma seleção recebida em ordens diferentes", () => {
    const first = createAcceptItineraryProposalPartiallyCommand(
      commandInput([item("proposed-3"), item("proposed-1")]),
    );
    const second = createAcceptItineraryProposalPartiallyCommand(
      commandInput([item("proposed-1"), item("proposed-3")]),
    );

    expect(first.requestFingerprint).toBe(second.requestFingerprint);
    expect(first.proposedActivityIds).toEqual(second.proposedActivityIds);
  });

  it("rejeita quando os itens selecionados equivalem ao aceite integral", () => {
    expect(() =>
      createAcceptItineraryProposalPartiallyCommand(
        commandInput([item("proposed-1"), item("proposed-2"), item("proposed-3")]),
      ),
    ).toThrowError(expect.objectContaining({ code: "full-selection" }));
  });
});

describe("partiallyAcceptItineraryProposal", () => {
  it("transiciona ready para partially-accepted preservando somente itens não aplicados", () => {
    const proposal = readyProposal();
    const partiallyAccepted = partiallyAcceptItineraryProposal(
      proposal,
      ["proposed-3", "proposed-1"],
      decidedAt,
    );

    expect(partiallyAccepted).toMatchObject({
      id: proposal.id,
      tripId: proposal.tripId,
      itineraryId: proposal.itineraryId,
      baseItineraryVersion: proposal.baseItineraryVersion,
      status: "partially-accepted",
      acceptedAt: decidedAt,
      updatedAt: decidedAt,
    });
    expect(partiallyAccepted.proposedActivities?.map(({ proposedActivityId }) => proposedActivityId)).toEqual([
      "proposed-2",
    ]);
    expect(partiallyAccepted.criteria).toEqual(proposal.criteria);
    expect(partiallyAccepted.justifications).toEqual(proposal.justifications);
    expect(partiallyAccepted.limitations).toEqual(proposal.limitations);
    expect(partiallyAccepted.acceptedAt).not.toBe(decidedAt);
    expect(partiallyAccepted.updatedAt).not.toBe(decidedAt);
    expect(Object.isFrozen(partiallyAccepted)).toBe(true);
    expect(Object.isFrozen(partiallyAccepted.proposedActivities)).toBe(true);
  });

  it("não muta a Proposal original", () => {
    const proposal = readyProposal();

    partiallyAcceptItineraryProposal(proposal, ["proposed-2"], decidedAt);

    expect(proposal.status).toBe("ready");
    expect(proposal.proposedActivities?.map(({ proposedActivityId }) => proposedActivityId)).toEqual([
      "proposed-1",
      "proposed-2",
      "proposed-3",
    ]);
    expect(proposal.acceptedAt).toBeUndefined();
  });
});
