import { describe, expect, it } from "vitest";

import {
  cancelItineraryProposalGeneration,
  completeItineraryProposalGeneration,
  createItineraryProposalId,
  failItineraryProposalGeneration,
  itineraryProposalStatuses,
  ItineraryProposalTransitionError,
  ItineraryProposalValidationError,
  proposedActivityOperationTypes,
  requestItineraryProposal,
  startItineraryProposalGeneration,
} from "./itinerary-proposal";

const requestedAt = new Date("2026-07-31T12:00:00.000Z");

function requestProposal() {
  return requestItineraryProposal({
    id: "proposal-1",
    tripId: " trip-1 ",
    itineraryId: " itinerary-1 ",
    baseTripContextVersion: 3,
    baseItineraryVersion: 13,
    contextSnapshotId: " snapshot-1 ",
    requestedAt,
  });
}

function generatingProposal() {
  return startItineraryProposalGeneration(requestProposal(), new Date("2026-07-31T12:01:00.000Z"));
}

function readyContent() {
  return {
    generationMethod: " deterministic ",
    generationVersion: " proposal-policy-v1 ",
    proposedActivities: [
      {
        proposedActivityId: " proposed-activity-1 ",
        targetTripDayId: " day-1 ",
        placeId: " place-1 ",
        title: " Museu de Arte ",
        description: " Visita no período da manhã ",
        proposedStartTime: "09:30",
        durationMinutes: 90,
        proposedOrder: 0,
        operationType: "add" as const,
        flexibility: " flexible ",
        estimatedCostAmount: 25.5,
        estimatedCostCurrency: "brl",
        reason: " Compatível com os interesses do grupo ",
      },
    ],
    criteria: [" ritmo do grupo "],
    justifications: [" preserva o período protegido "],
    limitations: [" horário de funcionamento não confirmado "],
    planningConflictIds: [" conflict-1 "],
    generatedAt: new Date("2026-07-31T12:02:00.000Z"),
    validUntil: new Date("2026-08-01T12:02:00.000Z"),
  };
}

describe("Itinerary Proposal", () => {
  it("publica somente os estados oficiais do domínio", () => {
    expect(itineraryProposalStatuses).toEqual([
      "requested",
      "generating",
      "ready",
      "partially-accepted",
      "accepted",
      "rejected",
      "expired",
      "failed",
      "cancelled",
      "superseded",
    ]);
    expect(itineraryProposalStatuses).not.toContain("generated");
  });

  it("publica somente os tipos de operação de Proposed Activity definidos no modelo", () => {
    expect(proposedActivityOperationTypes).toEqual(["add", "move", "update", "remove"]);
  });

  it("cria uma solicitação vinculada às versões e ao snapshot base", () => {
    const proposal = requestProposal();

    expect(proposal).toMatchObject({
      id: "proposal-1",
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      baseTripContextVersion: 3,
      baseItineraryVersion: 13,
      contextSnapshotId: "snapshot-1",
      status: "requested",
    });
    expect(proposal.requestedAt).toEqual(requestedAt);
    expect(proposal.updatedAt).toEqual(requestedAt);
    expect(Object.isFrozen(proposal)).toBe(true);
  });

  it("gera identidade quando ela não é fornecida e normaliza uma identidade conhecida", () => {
    expect(createItineraryProposalId(" proposal-known ")).toBe("proposal-known");
    expect(createItineraryProposalId()).toMatch(/^[0-9a-f-]{36}$/);
  });

  it.each([
    ["id", { id: " " }],
    ["tripId", { tripId: " " }],
    ["itineraryId", { itineraryId: " " }],
    ["contextSnapshotId", { contextSnapshotId: " " }],
  ])("rejeita a referência obrigatória %s vazia", (field, override) => {
    expect(() =>
      requestItineraryProposal({
        id: "proposal-1",
        tripId: "trip-1",
        itineraryId: "itinerary-1",
        baseTripContextVersion: 3,
        baseItineraryVersion: 13,
        contextSnapshotId: "snapshot-1",
        requestedAt,
        ...override,
      }),
    ).toThrowError(ItineraryProposalValidationError);

    try {
      requestItineraryProposal({
        id: "proposal-1",
        tripId: "trip-1",
        itineraryId: "itinerary-1",
        baseTripContextVersion: 3,
        baseItineraryVersion: 13,
        contextSnapshotId: "snapshot-1",
        requestedAt,
        ...override,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ItineraryProposalValidationError);
      expect((error as ItineraryProposalValidationError).fieldErrors).toHaveProperty(field);
    }
  });

  it.each([
    ["baseTripContextVersion", { baseTripContextVersion: 0 }],
    ["baseItineraryVersion", { baseItineraryVersion: 1.5 }],
  ])("rejeita %s quando não é inteiro positivo", (field, override) => {
    expect(() =>
      requestItineraryProposal({
        id: "proposal-1",
        tripId: "trip-1",
        itineraryId: "itinerary-1",
        baseTripContextVersion: 3,
        baseItineraryVersion: 13,
        contextSnapshotId: "snapshot-1",
        requestedAt,
        ...override,
      }),
    ).toThrowError(ItineraryProposalValidationError);

    try {
      requestItineraryProposal({
        id: "proposal-1",
        tripId: "trip-1",
        itineraryId: "itinerary-1",
        baseTripContextVersion: 3,
        baseItineraryVersion: 13,
        contextSnapshotId: "snapshot-1",
        requestedAt,
        ...override,
      });
    } catch (error) {
      expect((error as ItineraryProposalValidationError).fieldErrors).toHaveProperty(field);
    }
  });

  it("rejeita instante de solicitação inválido", () => {
    expect(() =>
      requestItineraryProposal({
        id: "proposal-1",
        tripId: "trip-1",
        itineraryId: "itinerary-1",
        baseTripContextVersion: 3,
        baseItineraryVersion: 13,
        contextSnapshotId: "snapshot-1",
        requestedAt: new Date("invalid"),
      }),
    ).toThrowError(ItineraryProposalValidationError);
  });

  it("inicia a geração sem mutar a solicitação", () => {
    const requested = requestProposal();
    const startedAt = new Date("2026-07-31T12:01:00.000Z");
    const generating = startItineraryProposalGeneration(requested, startedAt);

    expect(requested.status).toBe("requested");
    expect(requested).not.toHaveProperty("generationStartedAt");
    expect(generating.status).toBe("generating");
    expect(generating.generationStartedAt).toEqual(startedAt);
    expect(generating.updatedAt).toEqual(startedAt);
    expect(Object.isFrozen(generating)).toBe(true);
  });

  it("conclui a geração em ready com conteúdo revisável e normalizado", () => {
    const generating = generatingProposal();
    const input = readyContent();
    const ready = completeItineraryProposalGeneration(generating, input);

    expect(generating.status).toBe("generating");
    expect(generating).not.toHaveProperty("proposedActivities");
    expect(ready).toMatchObject({
      status: "ready",
      generationMethod: "deterministic",
      generationVersion: "proposal-policy-v1",
      criteria: ["ritmo do grupo"],
      justifications: ["preserva o período protegido"],
      limitations: ["horário de funcionamento não confirmado"],
      planningConflictIds: ["conflict-1"],
      generatedAt: input.generatedAt,
      validUntil: input.validUntil,
      updatedAt: input.generatedAt,
      proposedActivities: [
        {
          proposedActivityId: "proposed-activity-1",
          targetTripDayId: "day-1",
          placeId: "place-1",
          title: "Museu de Arte",
          description: "Visita no período da manhã",
          proposedStartTime: "09:30",
          durationMinutes: 90,
          proposedOrder: 0,
          operationType: "add",
          flexibility: "flexible",
          estimatedCostAmount: 25.5,
          estimatedCostCurrency: "BRL",
          reason: "Compatível com os interesses do grupo",
        },
      ],
    });
    expect(Object.isFrozen(ready)).toBe(true);
    expect(Object.isFrozen(ready.proposedActivities)).toBe(true);
    expect(Object.isFrozen(ready.proposedActivities?.[0])).toBe(true);
  });

  it("permite Proposal sem itens quando critérios e justificativa estão explícitos", () => {
    const input = readyContent();
    const ready = completeItineraryProposalGeneration(generatingProposal(), {
      ...input,
      proposedActivities: [],
      justifications: ["Nenhuma alteração adequada foi encontrada."],
    });

    expect(ready.status).toBe("ready");
    expect(ready.proposedActivities).toEqual([]);
    expect(ready.justifications).toEqual(["Nenhuma alteração adequada foi encontrada."]);
  });

  it("rejeita conclusão fora de generating", () => {
    const input = readyContent();

    expect(() => completeItineraryProposalGeneration(requestProposal(), input)).toThrowError(
      ItineraryProposalTransitionError,
    );

    const ready = completeItineraryProposalGeneration(generatingProposal(), input);
    expect(() => completeItineraryProposalGeneration(ready, input)).toThrowError(
      ItineraryProposalTransitionError,
    );
  });

  it.each([
    ["generationMethod", { generationMethod: " " }],
    ["generationVersion", { generationVersion: " " }],
    ["criteria", { criteria: [] }],
    ["criteria.0", { criteria: [" "] }],
    ["justifications", { justifications: [] }],
    ["justifications.0", { justifications: [" "] }],
    ["limitations.0", { limitations: [" "] }],
    ["planningConflictIds.0", { planningConflictIds: [" "] }],
  ])("rejeita conteúdo obrigatório inválido em %s", (field, override) => {
    try {
      completeItineraryProposalGeneration(generatingProposal(), {
        ...readyContent(),
        ...override,
      });
      expect.unreachable("A conclusão deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(ItineraryProposalValidationError);
      expect((error as ItineraryProposalValidationError).fieldErrors).toHaveProperty(field);
    }
  });

  it.each([
    ["proposedActivities.0.proposedActivityId", { proposedActivityId: " " }],
    ["proposedActivities.0.title", { title: " " }],
    ["proposedActivities.0.proposedStartTime", { proposedStartTime: "25:00" }],
    ["proposedActivities.0.durationMinutes", { durationMinutes: 0 }],
    ["proposedActivities.0.proposedOrder", { proposedOrder: -1 }],
    ["proposedActivities.0.estimatedCostAmount", { estimatedCostAmount: -1 }],
    ["proposedActivities.0.estimatedCostCurrency", { estimatedCostCurrency: "real" }],
  ])("rejeita Proposed Activity inválida em %s", (field, activityOverride) => {
    const input = readyContent();
    try {
      completeItineraryProposalGeneration(generatingProposal(), {
        ...input,
        proposedActivities: [{ ...input.proposedActivities[0]!, ...activityOverride }],
      });
      expect.unreachable("A conclusão deveria falhar.");
    } catch (error) {
      expect(error).toBeInstanceOf(ItineraryProposalValidationError);
      expect((error as ItineraryProposalValidationError).fieldErrors).toHaveProperty(field);
    }
  });

  it("rejeita tipo de operação não oficial", () => {
    const input = readyContent();

    expect(() =>
      completeItineraryProposalGeneration(generatingProposal(), {
        ...input,
        proposedActivities: [
          {
            ...input.proposedActivities[0]!,
            operationType: "replace" as never,
          },
        ],
      }),
    ).toThrowError(ItineraryProposalValidationError);
  });

  it("rejeita datas inválidas ou conclusão anterior à última transição", () => {
    const input = readyContent();

    expect(() =>
      completeItineraryProposalGeneration(generatingProposal(), {
        ...input,
        generatedAt: new Date("2026-07-31T12:00:59.999Z"),
      }),
    ).toThrowError(ItineraryProposalValidationError);
    expect(() =>
      completeItineraryProposalGeneration(generatingProposal(), {
        ...input,
        validUntil: new Date("invalid"),
      }),
    ).toThrowError(ItineraryProposalValidationError);
  });

  it("copia datas, coleções e itens para preservar a Proposal concluída", () => {
    const input = readyContent();
    const ready = completeItineraryProposalGeneration(generatingProposal(), input);

    input.generatedAt.setUTCFullYear(2030);
    input.validUntil.setUTCFullYear(2030);
    input.criteria[0] = "alterado";
    input.proposedActivities[0]!.title = "alterado";

    expect(ready.generatedAt?.toISOString()).toBe("2026-07-31T12:02:00.000Z");
    expect(ready.validUntil?.toISOString()).toBe("2026-08-01T12:02:00.000Z");
    expect(ready.criteria).toEqual(["ritmo do grupo"]);
    expect(ready.proposedActivities?.[0]?.title).toBe("Museu de Arte");
  });

  it("registra falha técnica somente durante a geração", () => {
    const requested = requestProposal();
    const generating = startItineraryProposalGeneration(
      requested,
      new Date("2026-07-31T12:01:00.000Z"),
    );
    const failedAt = new Date("2026-07-31T12:02:00.000Z");
    const failed = failItineraryProposalGeneration(generating, " provider-unavailable ", failedAt);

    expect(generating.status).toBe("generating");
    expect(generating).not.toHaveProperty("failureCode");
    expect(failed).toMatchObject({
      status: "failed",
      failureCode: "provider-unavailable",
      failedAt,
      updatedAt: failedAt,
    });
    expect(() => failItineraryProposalGeneration(requested, "failure", failedAt)).toThrowError(
      ItineraryProposalTransitionError,
    );
    expect(() => failItineraryProposalGeneration(generating, " ", failedAt)).toThrowError(
      ItineraryProposalValidationError,
    );
  });

  it("cancela solicitação ou geração, mas não um estado terminal", () => {
    const requested = requestProposal();
    const cancelledAt = new Date("2026-07-31T12:03:00.000Z");
    const cancelledRequest = cancelItineraryProposalGeneration(requested, cancelledAt);
    const generating = startItineraryProposalGeneration(
      requested,
      new Date("2026-07-31T12:01:00.000Z"),
    );
    const cancelledGeneration = cancelItineraryProposalGeneration(generating, cancelledAt);

    expect(cancelledRequest.status).toBe("cancelled");
    expect(cancelledRequest.cancelledAt).toEqual(cancelledAt);
    expect(cancelledGeneration.status).toBe("cancelled");
    expect(() => cancelItineraryProposalGeneration(cancelledRequest, cancelledAt)).toThrowError(
      ItineraryProposalTransitionError,
    );
  });

  it("rejeita transição com instante anterior à última atualização", () => {
    const requested = requestProposal();
    const generating = startItineraryProposalGeneration(
      requested,
      new Date("2026-07-31T12:01:00.000Z"),
    );

    expect(() =>
      failItineraryProposalGeneration(
        generating,
        "provider-unavailable",
        new Date("2026-07-31T12:00:59.999Z"),
      ),
    ).toThrowError(ItineraryProposalValidationError);
  });

  it("copia os instantes de entrada para preservar a solicitação", () => {
    const inputDate = new Date("2026-07-31T12:00:00.000Z");
    const proposal = requestItineraryProposal({
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      baseTripContextVersion: 3,
      baseItineraryVersion: 13,
      contextSnapshotId: "snapshot-1",
      requestedAt: inputDate,
    });

    inputDate.setUTCFullYear(2030);

    expect(proposal.requestedAt.toISOString()).toBe("2026-07-31T12:00:00.000Z");
    expect(proposal.updatedAt).not.toBe(proposal.requestedAt);
  });
});
