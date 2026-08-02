import { describe, expect, it, vi } from "vitest";

import { createProposalApplicationRequestFingerprint } from "./proposal-application";
import {
  AcceptItineraryProposalError,
  AcceptItineraryProposalValidationError,
  createAcceptItineraryProposal,
  createAcceptItineraryProposalCommand,
  type AcceptItineraryProposalCommandInput,
  type AcceptItineraryProposalResult,
  type ApplyItineraryProposalTransaction,
} from "./accept-itinerary-proposal";

const decidedAt = new Date("2026-08-01T21:00:00.000Z");

function input(
  override: Partial<AcceptItineraryProposalCommandInput> = {},
): AcceptItineraryProposalCommandInput {
  return {
    tripId: " trip-1 ",
    itineraryId: " itinerary-1 ",
    itineraryProposalId: " proposal-1 ",
    expectedItineraryVersion: 4,
    idempotencyKey: " accept-proposal-1 ",
    actorType: " participant ",
    actorId: " participant-local ",
    decidedAt,
    items: [
      {
        proposedActivityId: " proposed-1 ",
        operationType: "add",
        targetTripDayId: " day-1 ",
        title: " Museu ",
      },
      {
        proposedActivityId: " proposed-2 ",
        operationType: "remove",
        sourceActivityId: " activity-2 ",
      },
    ],
    ...override,
  };
}

function result(kind: "applied" | "replay"): AcceptItineraryProposalResult {
  return {
    kind,
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    itineraryProposalId: "proposal-1",
    proposalApplicationId: "application-1",
    decisionId: "decision-1",
    requestFingerprint: "a".repeat(64),
    resultingItineraryVersion: 5,
    appliedProposedActivityIds: ["proposed-1", "proposed-2"],
  };
}

describe("createAcceptItineraryProposalCommand", () => {
  it("normaliza o comando integral e calcula o fingerprint canônico", () => {
    const command = createAcceptItineraryProposalCommand(input());

    expect(command).toMatchObject({
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      itineraryProposalId: "proposal-1",
      expectedItineraryVersion: 4,
      idempotencyKey: "accept-proposal-1",
      applicationType: "full",
      actorType: "participant",
      actorId: "participant-local",
      proposedActivityIds: ["proposed-1", "proposed-2"],
    });
    expect(command.decidedAt).toEqual(decidedAt);
    expect(command.decidedAt).not.toBe(decidedAt);
    expect(command.requestFingerprint).toBe(
      createProposalApplicationRequestFingerprint({
        itineraryProposalId: "proposal-1",
        itineraryId: "itinerary-1",
        applicationType: "full",
        expectedItineraryVersion: 4,
        actorType: "participant",
        actorId: "participant-local",
        proposedActivityIds: ["proposed-1", "proposed-2"],
      }),
    );
  });

  it("congela o envelope, a coleção e os itens normalizados", () => {
    const command = createAcceptItineraryProposalCommand(input());

    expect(Object.isFrozen(command)).toBe(true);
    expect(Object.isFrozen(command.items)).toBe(true);
    expect(Object.isFrozen(command.items[0])).toBe(true);
    expect(Object.isFrozen(command.proposedActivityIds)).toBe(true);
  });

  it.each([
    ["actorType", { actorType: " " }],
    ["actorId", { actorId: " " }],
    ["decidedAt", { decidedAt: new Date("invalid") }],
  ] as const)("rejeita %s inválido antes do port", (_field, override) => {
    expect(() => createAcceptItineraryProposalCommand(input(override))).toThrowError(
      AcceptItineraryProposalValidationError,
    );
  });

  it("delega a validação dos itens ao contrato público do Itinerary Planning", () => {
    expect(() =>
      createAcceptItineraryProposalCommand(
        input({
          items: [
            {
              proposedActivityId: "proposed-1",
              operationType: "add",
              targetTripDayId: " ",
              title: "Museu",
            },
          ],
        }),
      ),
    ).toThrowError(expect.objectContaining({ name: "ApplyProposalItemsCommandValidationError" }));
  });
});

describe("createAcceptItineraryProposal", () => {
  it.each(["applied", "replay"] as const)("delega uma vez e preserva resultado %s", async (kind) => {
    const expected = result(kind);
    const execute = vi.fn(async () => expected);
    const transaction: ApplyItineraryProposalTransaction = { execute };
    const accept = createAcceptItineraryProposal(transaction);

    await expect(accept.execute(input())).resolves.toBe(expected);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        itineraryProposalId: "proposal-1",
        requestFingerprint: expect.stringMatching(/^[0-9a-f]{64}$/),
      }),
    );
  });

  it("propaga erro público do port sem convertê-lo em Planning Conflict", async () => {
    const error = new AcceptItineraryProposalError(
      "itinerary-version-mismatch",
      "A versão do Itinerary mudou.",
    );
    const transaction: ApplyItineraryProposalTransaction = {
      async execute() {
        throw error;
      },
    };

    await expect(createAcceptItineraryProposal(transaction).execute(input())).rejects.toBe(error);
  });

  it("propaga falha técnica desconhecida sem conversão", async () => {
    const error = new Error("database unavailable");
    const transaction: ApplyItineraryProposalTransaction = {
      async execute() {
        throw error;
      },
    };

    await expect(createAcceptItineraryProposal(transaction).execute(input())).rejects.toBe(error);
  });

  it("rejeita port ausente", () => {
    expect(() => createAcceptItineraryProposal(undefined as never)).toThrowError(TypeError);
  });
});
