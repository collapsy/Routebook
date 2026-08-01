import { describe, expect, it } from "vitest";

import {
  cancelItineraryProposalGeneration,
  createItineraryProposalId,
  ItineraryProposalTransitionError,
  ItineraryProposalValidationError,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposal,
  type ItineraryProposalId,
} from "./itinerary-proposal";
import type { ItineraryProposalRepository } from "./repository";
import {
  cancelAndPersistItineraryProposalGeneration,
  completeAndPersistItineraryProposalGeneration,
  failAndPersistItineraryProposalGeneration,
  ItineraryProposalApplicationError,
  requestAndPersistItineraryProposal,
  startAndPersistItineraryProposalGeneration,
} from "./service";

class MemoryItineraryProposalRepository implements ItineraryProposalRepository {
  readonly createCalls: ItineraryProposal[] = [];
  readonly saveCalls: ItineraryProposal[] = [];
  readonly proposals = new Map<string, ItineraryProposal>();

  private key(tripId: string, itineraryProposalId: ItineraryProposalId): string {
    return `${tripId}:${itineraryProposalId}`;
  }

  seed(proposal: ItineraryProposal): void {
    this.proposals.set(this.key(proposal.tripId, proposal.id), proposal);
  }

  async create(proposal: ItineraryProposal): Promise<ItineraryProposal> {
    this.createCalls.push(proposal);
    this.seed(proposal);
    return proposal;
  }

  async save(proposal: ItineraryProposal): Promise<ItineraryProposal> {
    this.saveCalls.push(proposal);
    this.seed(proposal);
    return proposal;
  }

  async findById(
    tripId: string,
    itineraryProposalId: ItineraryProposalId,
  ): Promise<ItineraryProposal | null> {
    return this.proposals.get(this.key(tripId, itineraryProposalId)) ?? null;
  }

  async listByTripId(tripId: string): Promise<readonly ItineraryProposal[]> {
    return [...this.proposals.values()].filter((proposal) => proposal.tripId === tripId);
  }
}

function requestedProposal(id = "proposal-1"): ItineraryProposal {
  return requestItineraryProposal({
    id,
    tripId: "trip-1",
    itineraryId: "itinerary-1",
    baseTripContextVersion: 2,
    baseItineraryVersion: 3,
    contextSnapshotId: "snapshot-1",
    requestedAt: new Date("2026-08-01T12:00:00.000Z"),
  });
}

function completionContent() {
  return {
    generationMethod: " deterministic ",
    generationVersion: " proposal-policy-v1 ",
    proposedActivities: [
      {
        proposedActivityId: " proposed-activity-1 ",
        title: " Museu de Arte ",
        proposedOrder: 0,
        operationType: "add" as const,
      },
    ],
    criteria: [" ritmo do grupo "],
    justifications: [" preserva o período protegido "],
    limitations: [],
    planningConflictIds: [" conflict-1 "],
    generatedAt: new Date("2026-08-01T12:02:00.000Z"),
    validUntil: new Date("2026-08-02T12:02:00.000Z"),
  };
}

describe("comandos do ciclo inicial de Itinerary Proposal", () => {
  it("cria, normaliza e persiste uma solicitação", async () => {
    const repository = new MemoryItineraryProposalRepository();

    const proposal = await requestAndPersistItineraryProposal(repository, {
      id: " proposal-1 ",
      tripId: " trip-1 ",
      itineraryId: " itinerary-1 ",
      baseTripContextVersion: 2,
      baseItineraryVersion: 3,
      contextSnapshotId: " snapshot-1 ",
      requestedAt: new Date("2026-08-01T12:00:00.000Z"),
    });

    expect(proposal).toMatchObject({
      id: "proposal-1",
      tripId: "trip-1",
      itineraryId: "itinerary-1",
      contextSnapshotId: "snapshot-1",
      status: "requested",
    });
    expect(repository.createCalls).toEqual([proposal]);
  });

  it("inicia e falha a geração persistindo cada nova representação", async () => {
    const repository = new MemoryItineraryProposalRepository();
    const requested = requestedProposal();
    repository.seed(requested);

    const generating = await startAndPersistItineraryProposalGeneration(repository, {
      tripId: requested.tripId,
      itineraryProposalId: requested.id,
      startedAt: new Date("2026-08-01T12:01:00.000Z"),
    });
    const failed = await failAndPersistItineraryProposalGeneration(repository, {
      tripId: requested.tripId,
      itineraryProposalId: requested.id,
      failureCode: " provider-timeout ",
      failedAt: new Date("2026-08-01T12:02:00.000Z"),
    });

    expect(generating.status).toBe("generating");
    expect(failed).toMatchObject({ status: "failed", failureCode: "provider-timeout" });
    expect(repository.saveCalls).toEqual([generating, failed]);
    expect(failed).toBe(repository.saveCalls[1]);
  });

  it("conclui e persiste uma Proposal ready com conteúdo e proveniência normalizados", async () => {
    const repository = new MemoryItineraryProposalRepository();
    const requested = requestedProposal();
    const generating = startItineraryProposalGeneration(
      requested,
      new Date("2026-08-01T12:01:00.000Z"),
    );
    repository.seed(generating);

    const ready = await completeAndPersistItineraryProposalGeneration(repository, {
      tripId: requested.tripId,
      itineraryProposalId: requested.id,
      ...completionContent(),
    });

    expect(ready).toMatchObject({
      status: "ready",
      generationMethod: "deterministic",
      generationVersion: "proposal-policy-v1",
      criteria: ["ritmo do grupo"],
      justifications: ["preserva o período protegido"],
      planningConflictIds: ["conflict-1"],
      proposedActivities: [
        {
          proposedActivityId: "proposed-activity-1",
          title: "Museu de Arte",
          operationType: "add",
        },
      ],
    });
    expect(repository.saveCalls).toEqual([ready]);
    expect(await repository.findById(requested.tripId, requested.id)).toBe(ready);
  });

  it("cancela uma solicitação antes do início da geração", async () => {
    const repository = new MemoryItineraryProposalRepository();
    const requested = requestedProposal();
    repository.seed(requested);

    const cancelled = await cancelAndPersistItineraryProposalGeneration(repository, {
      tripId: requested.tripId,
      itineraryProposalId: requested.id,
      cancelledAt: new Date("2026-08-01T12:01:00.000Z"),
    });

    expect(cancelled).toMatchObject({ status: "cancelled" });
    expect(cancelled.generationStartedAt).toBeUndefined();
    expect(repository.saveCalls).toEqual([cancelled]);
  });

  it("cancela uma solicitação após o início da geração", async () => {
    const repository = new MemoryItineraryProposalRepository();
    const requested = requestedProposal();
    const generating = startItineraryProposalGeneration(
      requested,
      new Date("2026-08-01T12:01:00.000Z"),
    );
    repository.seed(generating);

    const cancelled = await cancelAndPersistItineraryProposalGeneration(repository, {
      tripId: requested.tripId,
      itineraryProposalId: requested.id,
      cancelledAt: new Date("2026-08-01T12:02:00.000Z"),
    });

    expect(cancelled).toMatchObject({
      status: "cancelled",
      generationStartedAt: new Date("2026-08-01T12:01:00.000Z"),
    });
    expect(repository.saveCalls).toEqual([cancelled]);
  });

  it.each([
    [
      "start",
      (repository: ItineraryProposalRepository, itineraryProposalId: ItineraryProposalId) =>
        startAndPersistItineraryProposalGeneration(repository, {
          tripId: "trip-1",
          itineraryProposalId,
          startedAt: new Date("2026-08-01T12:01:00.000Z"),
        }),
    ],
    [
      "fail",
      (repository: ItineraryProposalRepository, itineraryProposalId: ItineraryProposalId) =>
        failAndPersistItineraryProposalGeneration(repository, {
          tripId: "trip-1",
          itineraryProposalId,
          failureCode: "provider-timeout",
          failedAt: new Date("2026-08-01T12:02:00.000Z"),
        }),
    ],
    [
      "complete",
      (repository: ItineraryProposalRepository, itineraryProposalId: ItineraryProposalId) =>
        completeAndPersistItineraryProposalGeneration(repository, {
          tripId: "trip-1",
          itineraryProposalId,
          ...completionContent(),
        }),
    ],
    [
      "cancel",
      (repository: ItineraryProposalRepository, itineraryProposalId: ItineraryProposalId) =>
        cancelAndPersistItineraryProposalGeneration(repository, {
          tripId: "trip-1",
          itineraryProposalId,
          cancelledAt: new Date("2026-08-01T12:01:00.000Z"),
        }),
    ],
  ] as const)("rejeita Proposal ausente no comando %s", async (_, command) => {
    const repository = new MemoryItineraryProposalRepository();

    await expect(
      command(repository, createItineraryProposalId("missing-proposal")),
    ).rejects.toMatchObject({
      code: "proposal-not-found",
    } satisfies Partial<ItineraryProposalApplicationError>);
    expect(repository.saveCalls).toEqual([]);
  });

  it("propaga transição inválida sem executar save", async () => {
    const repository = new MemoryItineraryProposalRepository();
    const requested = requestedProposal();
    const cancelled = cancelItineraryProposalGeneration(
      requested,
      new Date("2026-08-01T12:01:00.000Z"),
    );
    repository.seed(cancelled);

    await expect(
      startAndPersistItineraryProposalGeneration(repository, {
        tripId: requested.tripId,
        itineraryProposalId: requested.id,
        startedAt: new Date("2026-08-01T12:02:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(ItineraryProposalTransitionError);
    expect(repository.saveCalls).toEqual([]);
    expect(await repository.findById(requested.tripId, requested.id)).toEqual(cancelled);
  });

  it("não salva quando a conclusão ocorre fora de generating", async () => {
    const repository = new MemoryItineraryProposalRepository();
    const requested = requestedProposal();
    repository.seed(requested);

    await expect(
      completeAndPersistItineraryProposalGeneration(repository, {
        tripId: requested.tripId,
        itineraryProposalId: requested.id,
        ...completionContent(),
      }),
    ).rejects.toBeInstanceOf(ItineraryProposalTransitionError);
    expect(repository.saveCalls).toEqual([]);
  });

  it("não salva quando o conteúdo de conclusão é inválido", async () => {
    const repository = new MemoryItineraryProposalRepository();
    const requested = requestedProposal();
    repository.seed(
      startItineraryProposalGeneration(requested, new Date("2026-08-01T12:01:00.000Z")),
    );

    await expect(
      completeAndPersistItineraryProposalGeneration(repository, {
        tripId: requested.tripId,
        itineraryProposalId: requested.id,
        ...completionContent(),
        generationMethod: " ",
      }),
    ).rejects.toBeInstanceOf(ItineraryProposalValidationError);
    expect(repository.saveCalls).toEqual([]);
  });
});
