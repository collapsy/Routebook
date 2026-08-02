import { describe, expect, it, vi } from "vitest";

import {
  AcceptItineraryProposalError,
  AcceptItineraryProposalValidationError,
  type AcceptItineraryProposalCommand,
  type AcceptItineraryProposalResult,
  type ApplyItineraryProposalTransaction,
} from "@routebook/proposal-management";
import { ApplyProposalItemsDomainError } from "@routebook/trip-management";

import {
  createPostgresAcceptItineraryProposal,
  type ApplyItineraryProposalTransactionFactory,
} from "./accept-itinerary-proposal-service";

const decidedAt = new Date("2026-08-02T21:00:00.000Z");

function input() {
  return {
    tripId: " trip-1 ",
    itineraryId: " itinerary-1 ",
    itineraryProposalId: " proposal-1 ",
    expectedItineraryVersion: 7,
    idempotencyKey: " accept-proposal-1 ",
    actorType: " participant ",
    actorId: " participant-owner ",
    decidedAt,
    items: [
      {
        proposedActivityId: " proposed-1 ",
        operationType: "add" as const,
        targetTripDayId: " day-1 ",
        title: " Praia do Amor ",
        flexibility: "suggested" as const,
      },
    ],
  };
}

function applied(command: AcceptItineraryProposalCommand): AcceptItineraryProposalResult {
  return Object.freeze({
    kind: "applied",
    tripId: command.tripId,
    itineraryId: command.itineraryId,
    itineraryProposalId: command.itineraryProposalId,
    proposalApplicationId: "application-1",
    decisionId: "decision-1",
    requestFingerprint: command.requestFingerprint,
    resultingItineraryVersion: 8,
    appliedProposedActivityIds: command.proposedActivityIds,
  });
}

function serviceWith(
  execute: ApplyItineraryProposalTransaction["execute"],
): ReturnType<typeof createPostgresAcceptItineraryProposal> {
  return createPostgresAcceptItineraryProposal(() => ({ execute }));
}

function drizzleError(code: string, constraint?: string): Error {
  const error = new Error("Drizzle query failed");
  Object.assign(error, {
    cause: {
      code,
      ...(constraint !== undefined ? { constraint } : {}),
    },
  });
  return error;
}

describe("createPostgresAcceptItineraryProposal", () => {
  it("normaliza a entrada e executa a transação concreta uma única vez", async () => {
    const execute = vi.fn(async (command: AcceptItineraryProposalCommand) => applied(command));
    const service = serviceWith(execute);

    await expect(service.execute(input())).resolves.toMatchObject({
      kind: "applied",
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      itineraryProposalId: "proposal-1",
      proposalApplicationId: "application-1",
      decisionId: "decision-1",
      resultingItineraryVersion: 8,
      appliedProposedActivityIds: ["proposed-1"],
    });
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        tripId: "trip-1",
        itineraryId: "itinerary-1",
        itineraryProposalId: "proposal-1",
        idempotencyKey: "accept-proposal-1",
        actorType: "participant",
        actorId: "participant-owner",
        proposedActivityIds: ["proposed-1"],
      }),
    );
  });

  it("preserva integralmente o resultado replay", async () => {
    const execute = vi.fn(async (command: AcceptItineraryProposalCommand) => ({
      ...applied(command),
      kind: "replay" as const,
    }));
    const service = serviceWith(execute);

    await expect(service.execute(input())).resolves.toEqual({
      kind: "replay",
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      itineraryProposalId: "proposal-1",
      proposalApplicationId: "application-1",
      decisionId: "decision-1",
      requestFingerprint: expect.any(String),
      resultingItineraryVersion: 8,
      appliedProposedActivityIds: ["proposed-1"],
    });
  });

  it("rejeita entrada inválida antes de executar a transação", async () => {
    const execute = vi.fn<ApplyItineraryProposalTransaction["execute"]>();
    const service = serviceWith(execute);

    await expect(service.execute({ ...input(), tripId: "" })).rejects.toBeInstanceOf(
      AcceptItineraryProposalValidationError,
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it("preserva erros públicos já classificados", async () => {
    const expected = new AcceptItineraryProposalError("proposal-expired", "A Proposal expirou.");
    const service = serviceWith(async () => {
      throw expected;
    });

    await expect(service.execute(input())).rejects.toBe(expected);
  });

  it.each([
    ["itinerary-version-mismatch", "itinerary-version-mismatch"],
    ["trip-mismatch", "itinerary-not-found"],
    ["itinerary-mismatch", "itinerary-not-found"],
    ["duplicate-proposed-activity-id", "proposal-items-mismatch"],
    ["duplicate-source-activity-id", "proposal-items-mismatch"],
    ["target-trip-day-not-found", "proposal-items-mismatch"],
    ["source-activity-not-found", "proposal-items-mismatch"],
    ["fixed-activity-protected", "proposal-items-mismatch"],
    ["target-order-out-of-range", "proposal-items-mismatch"],
    ["generated-activity-id-invalid", "proposal-items-mismatch"],
    ["generated-activity-id-duplicate", "proposal-items-mismatch"],
  ] as const)("mapeia o erro de domínio %s para %s", async (domainCode, publicCode) => {
    const service = serviceWith(async () => {
      throw new ApplyProposalItemsDomainError(domainCode, "falha de domínio");
    });

    await expect(service.execute(input())).rejects.toMatchObject({
      name: "AcceptItineraryProposalError",
      code: publicCode,
    });
  });

  it("não mascara application-time-invalid como erro de negócio", async () => {
    const expected = new ApplyProposalItemsDomainError(
      "application-time-invalid",
      "instante inválido",
    );
    const service = serviceWith(async () => {
      throw expected;
    });

    await expect(service.execute(input())).rejects.toBe(expected);
  });

  it.each([
    ["23505", "proposal_applications_proposal_idempotency_unique", "fingerprint-conflict"],
    ["23503", "proposal_applications_itinerary_proposal_id_fkey", "proposal-not-found"],
    ["23503", "proposal_applications_itinerary_id_fkey", "itinerary-not-found"],
    ["23503", "itinerary_proposals_itinerary_id_fkey", "itinerary-not-found"],
  ] as const)("mapeia PostgreSQL %s/%s para %s", async (code, constraint, publicCode) => {
    const service = serviceWith(async () => {
      throw drizzleError(code, constraint);
    });

    await expect(service.execute(input())).rejects.toMatchObject({
      name: "AcceptItineraryProposalError",
      code: publicCode,
    });
  });

  it("propaga erro PostgreSQL desconhecido sem conversão", async () => {
    const expected = drizzleError("23514", "unknown_constraint");
    const service = serviceWith(async () => {
      throw expected;
    });

    await expect(service.execute(input())).rejects.toBe(expected);
  });

  it("propaga falha técnica desconhecida", async () => {
    const expected = new Error("indisponibilidade inesperada");
    const service = serviceWith(async () => {
      throw expected;
    });

    await expect(service.execute(input())).rejects.toBe(expected);
  });

  it("rejeita factory e transaction inválidas", () => {
    expect(() =>
      createPostgresAcceptItineraryProposal(
        null as unknown as ApplyItineraryProposalTransactionFactory,
      ),
    ).toThrow("factory");
    expect(() =>
      createPostgresAcceptItineraryProposal(
        (() => ({})) as unknown as ApplyItineraryProposalTransactionFactory,
      ),
    ).toThrow("ApplyItineraryProposalTransaction");
  });
});
