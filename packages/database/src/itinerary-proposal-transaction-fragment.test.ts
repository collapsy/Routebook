import { describe, expect, it, vi } from "vitest";

import {
  AcceptItineraryProposalError,
  completeItineraryProposalGeneration,
  createAcceptItineraryProposalCommand,
  finalizeAppliedItineraryProposalAcceptance,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposal,
} from "@routebook/proposal-management";

import {
  createItineraryProposalTransactionFragment,
  type ItineraryProposalTransactionRepository,
} from "./itinerary-proposal-transaction-fragment";
import type { ItineraryProposalDatabaseExecutor } from "./proposal-repository";

const requestedAt = new Date("2026-08-02T08:00:00.000Z");
const startedAt = new Date("2026-08-02T09:00:00.000Z");
const generatedAt = new Date("2026-08-02T10:00:00.000Z");
const decidedAt = new Date("2026-08-02T11:00:00.000Z");
const validUntil = new Date("2026-08-02T14:00:00.000Z");

function readyProposal(): ItineraryProposal {
  const requested = requestItineraryProposal({
    id: "proposal-1",
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    baseTripContextVersion: 3,
    baseItineraryVersion: 7,
    contextSnapshotId: "snapshot-1",
    requestedAt,
  });
  const generating = startItineraryProposalGeneration(requested, startedAt);
  return completeItineraryProposalGeneration(generating, {
    generationMethod: "deterministic",
    generationVersion: "1.0.0",
    proposedActivities: [
      {
        proposedActivityId: "activity-1",
        operationType: "add",
        targetTripDayId: "day-1",
        title: "Praia do Amor",
      },
      {
        proposedActivityId: "activity-2",
        operationType: "remove",
        sourceActivityId: "existing-1",
        title: "Atividade removida",
      },
    ],
    criteria: ["distância"],
    justifications: ["melhor sequência"],
    limitations: [],
    planningConflictIds: [],
    validUntil,
    generatedAt,
  });
}

function command(overrides: Record<string, unknown> = {}) {
  return createAcceptItineraryProposalCommand({
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    itineraryProposalId: "proposal-1",
    expectedItineraryVersion: 7,
    idempotencyKey: "accept-1",
    actorType: "participant",
    actorId: "participant-1",
    decidedAt,
    items: [
      {
        proposedActivityId: "activity-1",
        operationType: "add",
        targetTripDayId: "day-1",
        title: "Praia do Amor",
      },
      {
        proposedActivityId: "activity-2",
        operationType: "remove",
        sourceActivityId: "existing-1",
      },
    ],
    ...overrides,
  } as never);
}

function executor(): ItineraryProposalDatabaseExecutor {
  return {
    select() {
      throw new Error("select não deveria ser chamado pelo fake repository");
    },
    insert() {
      throw new Error("insert não deveria ser chamado pelo fake repository");
    },
    update() {
      throw new Error("update não deveria ser chamado pelo fake repository");
    },
    delete() {
      throw new Error("delete não deveria ser chamado pelo fake repository");
    },
  } as unknown as ItineraryProposalDatabaseExecutor;
}

function repository(proposal: ItineraryProposal | null = readyProposal()) {
  const findById = vi.fn(async () => proposal);
  const save = vi.fn(async () => undefined);
  const value: ItineraryProposalTransactionRepository = { findById, save };
  return { value, findById, save };
}

function expectAcceptanceError(error: unknown, code: string): boolean {
  expect(error).toBeInstanceOf(AcceptItineraryProposalError);
  expect(error).toMatchObject({ code });
  return true;
}

describe("createItineraryProposalTransactionFragment", () => {
  it("cria o repository com o executor escopado e retorna o snapshot ready por identidade", async () => {
    const scopedExecutor = executor();
    const stored = repository();
    const repositoryFactory = vi.fn(() => stored.value);
    const fragment = createItineraryProposalTransactionFragment(scopedExecutor, repositoryFactory);
    const acceptanceCommand = command();

    const result = await fragment.loadForAcceptance(acceptanceCommand);

    expect(repositoryFactory).toHaveBeenCalledWith(scopedExecutor);
    expect(repositoryFactory).toHaveBeenCalledTimes(1);
    expect(stored.findById).toHaveBeenCalledWith("trip-1", "proposal-1");
    expect(result).toBe(await stored.findById.mock.results[0]?.value);
    expect(result.status).toBe("ready");
    expect(stored.save).not.toHaveBeenCalled();
  });

  it("retorna proposal-not-found quando o snapshot não existe", async () => {
    const stored = repository(null);
    const fragment = createItineraryProposalTransactionFragment(executor(), () => stored.value);

    await expect(fragment.loadForAcceptance(command())).rejects.toSatisfy((error) =>
      expectAcceptanceError(error, "proposal-not-found"),
    );
  });

  it("retorna proposal-not-ready para status diferente de ready", async () => {
    const proposal = requestItineraryProposal({
      id: "proposal-1",
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      baseTripContextVersion: 3,
      baseItineraryVersion: 7,
      contextSnapshotId: "snapshot-1",
      requestedAt,
    });
    const stored = repository(proposal);
    const fragment = createItineraryProposalTransactionFragment(executor(), () => stored.value);

    await expect(fragment.loadForAcceptance(command())).rejects.toSatisfy((error) =>
      expectAcceptanceError(error, "proposal-not-ready"),
    );
  });

  it("retorna proposal-expired quando o aceite alcança validUntil", async () => {
    const stored = repository();
    const fragment = createItineraryProposalTransactionFragment(executor(), () => stored.value);

    await expect(fragment.loadForAcceptance(command({ decidedAt: validUntil }))).rejects.toSatisfy(
      (error) => expectAcceptanceError(error, "proposal-expired"),
    );
  });

  it("retorna proposal-not-found para identidade divergente", async () => {
    const proposal = { ...readyProposal(), itineraryId: "itinerary-other" };
    const stored = repository(proposal);
    const fragment = createItineraryProposalTransactionFragment(executor(), () => stored.value);

    await expect(fragment.loadForAcceptance(command())).rejects.toSatisfy((error) =>
      expectAcceptanceError(error, "proposal-not-found"),
    );
  });

  it("retorna itinerary-version-mismatch para versão-base divergente", async () => {
    const proposal = { ...readyProposal(), baseItineraryVersion: 6 };
    const stored = repository(proposal);
    const fragment = createItineraryProposalTransactionFragment(executor(), () => stored.value);

    await expect(fragment.loadForAcceptance(command())).rejects.toSatisfy((error) =>
      expectAcceptanceError(error, "itinerary-version-mismatch"),
    );
  });

  it("retorna proposal-items-mismatch para coleção divergente", async () => {
    const stored = repository();
    const fragment = createItineraryProposalTransactionFragment(executor(), () => stored.value);
    const acceptanceCommand = command({
      items: [
        {
          proposedActivityId: "activity-2",
          operationType: "remove",
          sourceActivityId: "existing-1",
        },
        {
          proposedActivityId: "activity-1",
          operationType: "add",
          targetTripDayId: "day-1",
          title: "Praia do Amor",
        },
      ],
    });

    await expect(fragment.loadForAcceptance(acceptanceCommand)).rejects.toSatisfy((error) =>
      expectAcceptanceError(error, "proposal-items-mismatch"),
    );
  });

  it("finaliza e persiste a Proposal accepted preservando o snapshot", async () => {
    const proposal = readyProposal();
    const stored = repository(proposal);
    const fragment = createItineraryProposalTransactionFragment(executor(), () => stored.value);
    const loaded = await fragment.loadForAcceptance(command());

    const result = await fragment.accept(loaded, decidedAt);

    expect(result).toEqual(finalizeAppliedItineraryProposalAcceptance(proposal, decidedAt));
    expect(result.status).toBe("accepted");
    expect(result.acceptedAt).toEqual(decidedAt);
    expect(stored.save).toHaveBeenCalledWith(result);
    expect(stored.save).toHaveBeenCalledTimes(1);
  });

  it("propaga falhas do repository sem retry", async () => {
    const findError = new Error("find failure");
    const saveError = new Error("save failure");
    const stored = repository();
    stored.findById.mockRejectedValueOnce(findError);
    const fragment = createItineraryProposalTransactionFragment(executor(), () => stored.value);

    await expect(fragment.loadForAcceptance(command())).rejects.toBe(findError);
    expect(stored.findById).toHaveBeenCalledTimes(1);

    stored.findById.mockResolvedValueOnce(readyProposal());
    stored.save.mockRejectedValueOnce(saveError);
    const loaded = await fragment.loadForAcceptance(command());
    await expect(fragment.accept(loaded, decidedAt)).rejects.toBe(saveError);
    expect(stored.save).toHaveBeenCalledTimes(1);
  });

  it("rejeita executor, factory, repository, comando e Proposal inválidos", async () => {
    const stored = repository();

    expect(() =>
      createItineraryProposalTransactionFragment(undefined as never, () => stored.value),
    ).toThrowError(TypeError);
    expect(() =>
      createItineraryProposalTransactionFragment(executor(), null as never),
    ).toThrowError(TypeError);
    expect(() =>
      createItineraryProposalTransactionFragment(executor(), () => undefined as never),
    ).toThrowError(TypeError);

    const fragment = createItineraryProposalTransactionFragment(executor(), () => stored.value);
    await expect(fragment.loadForAcceptance(undefined as never)).rejects.toThrowError(TypeError);
    await expect(fragment.accept(undefined as never, decidedAt)).rejects.toThrowError(TypeError);
  });
});
