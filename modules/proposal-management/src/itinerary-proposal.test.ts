import { describe, expect, it } from "vitest";

import {
  cancelItineraryProposalGeneration,
  createItineraryProposalId,
  failItineraryProposalGeneration,
  itineraryProposalStatuses,
  ItineraryProposalTransitionError,
  ItineraryProposalValidationError,
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
