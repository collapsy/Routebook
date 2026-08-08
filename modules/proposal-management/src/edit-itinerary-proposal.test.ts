import { describe, expect, it } from "vitest";

import {
  editItineraryProposalProposedActivity,
  ItineraryProposalProposedActivityEditError,
  type ItineraryProposalProposedActivityEditErrorCode,
} from "./edit-itinerary-proposal";
import {
  completeItineraryProposalGeneration,
  ItineraryProposalValidationError,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposal,
} from "./itinerary-proposal";

function createReadyProposal(): ItineraryProposal {
  const requested = requestItineraryProposal({
    id: "proposal-edit-1",
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    baseTripContextVersion: 4,
    baseItineraryVersion: 7,
    contextSnapshotId: "snapshot-1",
    requestedAt: new Date("2026-08-08T10:00:00.000Z"),
  });
  const generating = startItineraryProposalGeneration(
    requested,
    new Date("2026-08-08T10:01:00.000Z"),
  );

  return completeItineraryProposalGeneration(generating, {
    generationMethod: "deterministic-candidate-balancing",
    generationVersion: "1",
    proposedActivities: [
      {
        proposedActivityId: "proposed-activity-1",
        targetTripDayId: "day-1",
        sourceActivityId: "source-activity-1",
        placeId: "place-1",
        title: "Praia do Amor",
        description: "Visita sugerida",
        proposedStartTime: "10:00",
        durationMinutes: 90,
        proposedOrder: 1,
        operationType: "update",
        flexibility: "flexible",
        estimatedCostAmount: 25,
        estimatedCostCurrency: "BRL",
        reason: "Boa opção para a manhã.",
      },
      {
        proposedActivityId: "proposed-activity-2",
        targetTripDayId: "day-2",
        placeId: "place-2",
        title: "Baía dos Golfinhos",
        durationMinutes: 120,
        proposedOrder: 0,
        operationType: "add",
        reason: "Boa opção para o segundo dia.",
      },
    ],
    criteria: ["proximidade"],
    justifications: ["Distribuição equilibrada."],
    limitations: [],
    planningConflictIds: [],
    validUntil: new Date("2026-08-09T10:02:00.000Z"),
    generatedAt: new Date("2026-08-08T10:02:00.000Z"),
  });
}

function captureError(operation: () => unknown): unknown {
  try {
    operation();
    return undefined;
  } catch (error) {
    return error;
  }
}

function expectEditError(
  operation: () => unknown,
  code: ItineraryProposalProposedActivityEditErrorCode,
): void {
  const error = captureError(operation);
  expect(error).toBeInstanceOf(ItineraryProposalProposedActivityEditError);
  expect(error).toMatchObject({
    name: "ItineraryProposalProposedActivityEditError",
    code,
  });
}

function expectValidationField(operation: () => unknown, field: string): void {
  const error = captureError(operation);
  expect(error).toBeInstanceOf(ItineraryProposalValidationError);
  const fieldErrors = (error as ItineraryProposalValidationError).fieldErrors;
  expect(fieldErrors[field]).toEqual(expect.any(String));
}

describe("editItineraryProposalProposedActivity", () => {
  it("edita somente campos planejáveis e preserva identidade e proveniência", () => {
    const proposal = createReadyProposal();
    const originalActivity = proposal.proposedActivities![0]!;

    const edited = editItineraryProposalProposedActivity(proposal, {
      proposedActivityId: "proposed-activity-1",
      editedAt: new Date("2026-08-08T10:03:00.000Z"),
      changes: {
        targetTripDayId: "day-2",
        title: "Praia do Amor no fim da tarde",
        description: "Visita ajustada pelo viajante",
        proposedStartTime: "16:30",
        durationMinutes: 120,
        proposedOrder: 3,
        flexibility: "fixed",
        estimatedCostAmount: 40.5,
        estimatedCostCurrency: "brl",
      },
    });

    expect(edited).not.toBe(proposal);
    expect(edited.status).toBe("ready");
    expect(edited.updatedAt).toEqual(new Date("2026-08-08T10:03:00.000Z"));
    expect(edited.proposedActivities![0]).toEqual({
      proposedActivityId: "proposed-activity-1",
      targetTripDayId: "day-2",
      sourceActivityId: "source-activity-1",
      placeId: "place-1",
      title: "Praia do Amor no fim da tarde",
      description: "Visita ajustada pelo viajante",
      proposedStartTime: "16:30",
      durationMinutes: 120,
      proposedOrder: 3,
      operationType: "update",
      flexibility: "fixed",
      estimatedCostAmount: 40.5,
      estimatedCostCurrency: "BRL",
      reason: "Boa opção para a manhã.",
    });
    expect(edited.proposedActivities![1]).toBe(proposal.proposedActivities![1]);

    expect(proposal.updatedAt).toEqual(new Date("2026-08-08T10:02:00.000Z"));
    expect(proposal.proposedActivities![0]).toBe(originalActivity);
    expect(proposal.proposedActivities![0]!.targetTripDayId).toBe("day-1");
  });

  it("permite limpar campos opcionais editáveis com null", () => {
    const proposal = createReadyProposal();

    const edited = editItineraryProposalProposedActivity(proposal, {
      proposedActivityId: "proposed-activity-1",
      editedAt: new Date("2026-08-08T10:03:00.000Z"),
      changes: {
        description: null,
        proposedStartTime: null,
        durationMinutes: null,
        proposedOrder: null,
        flexibility: null,
        estimatedCostAmount: null,
        estimatedCostCurrency: null,
      },
    });

    expect(edited.proposedActivities![0]).toEqual({
      proposedActivityId: "proposed-activity-1",
      targetTripDayId: "day-1",
      sourceActivityId: "source-activity-1",
      placeId: "place-1",
      title: "Praia do Amor",
      operationType: "update",
      reason: "Boa opção para a manhã.",
    });
  });

  it("rejeita Proposal que não está ready", () => {
    const requested = requestItineraryProposal({
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      baseTripContextVersion: 1,
      baseItineraryVersion: 1,
      contextSnapshotId: "snapshot-1",
      requestedAt: new Date("2026-08-08T10:00:00.000Z"),
    });

    expectEditError(
      () =>
        editItineraryProposalProposedActivity(requested, {
          proposedActivityId: "proposed-activity-1",
          editedAt: new Date("2026-08-08T10:01:00.000Z"),
          changes: { title: "Novo título" },
        }),
      "proposal-not-ready",
    );
  });

  it("rejeita Proposed Activity que não pertence à Proposal", () => {
    const proposal = createReadyProposal();

    expectEditError(
      () =>
        editItineraryProposalProposedActivity(proposal, {
          proposedActivityId: "inexistente",
          editedAt: new Date("2026-08-08T10:03:00.000Z"),
          changes: { title: "Novo título" },
        }),
      "proposed-activity-not-found",
    );
  });

  it.each([
    [{ proposedStartTime: "25:00" }, "changes.proposedStartTime"],
    [{ durationMinutes: 0 }, "changes.durationMinutes"],
    [{ proposedOrder: -1 }, "changes.proposedOrder"],
    [{ estimatedCostAmount: -0.01 }, "changes.estimatedCostAmount"],
    [{ estimatedCostCurrency: "real" }, "changes.estimatedCostCurrency"],
    [{ title: "   " }, "changes.title"],
  ] as const)("rejeita alteração inválida em %s", (changes, field) => {
    const proposal = createReadyProposal();

    expectValidationField(
      () =>
        editItineraryProposalProposedActivity(proposal, {
          proposedActivityId: "proposed-activity-1",
          editedAt: new Date("2026-08-08T10:03:00.000Z"),
          changes,
        }),
      field,
    );
  });

  it("rejeita edição sem mudanças e instante anterior ao updatedAt", () => {
    const proposal = createReadyProposal();

    expectValidationField(
      () =>
        editItineraryProposalProposedActivity(proposal, {
          proposedActivityId: "proposed-activity-1",
          editedAt: new Date("2026-08-08T10:03:00.000Z"),
          changes: {},
        }),
      "changes",
    );

    expectValidationField(
      () =>
        editItineraryProposalProposedActivity(proposal, {
          proposedActivityId: "proposed-activity-1",
          editedAt: new Date("2026-08-08T10:01:59.999Z"),
          changes: { title: "Novo título" },
        }),
      "editedAt",
    );
  });

  it("expõe erro específico para consumo por aplicações", () => {
    expect(
      new ItineraryProposalProposedActivityEditError("erro", "proposed-activity-not-found"),
    ).toMatchObject({
      name: "ItineraryProposalProposedActivityEditError",
      code: "proposed-activity-not-found",
    });
  });
});
