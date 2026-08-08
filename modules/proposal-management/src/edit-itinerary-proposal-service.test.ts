import { describe, expect, it } from "vitest";

import {
  completeItineraryProposalGeneration,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposal,
  type ItineraryProposalId,
} from "./itinerary-proposal";
import type { ItineraryProposalRepository } from "./repository";
import {
  editAndPersistItineraryProposalProposedActivity,
  ItineraryProposalApplicationError,
} from "./service";

class ControlledItineraryProposalRepository implements ItineraryProposalRepository {
  readonly saveCalls: ItineraryProposal[] = [];
  current: ItineraryProposal | null = null;

  async create(proposal: ItineraryProposal): Promise<ItineraryProposal> {
    this.current = proposal;
    return proposal;
  }

  async save(proposal: ItineraryProposal): Promise<ItineraryProposal> {
    this.saveCalls.push(proposal);
    this.current = proposal;
    return proposal;
  }

  async findById(
    tripId: string,
    itineraryProposalId: ItineraryProposalId,
  ): Promise<ItineraryProposal | null> {
    if (this.current?.tripId === tripId && this.current.id === itineraryProposalId) {
      return this.current;
    }
    return null;
  }

  async listByTripId(tripId: string): Promise<readonly ItineraryProposal[]> {
    return this.current?.tripId === tripId ? [this.current] : [];
  }
}

function readyProposal(): ItineraryProposal {
  const requested = requestItineraryProposal({
    id: "proposal-edit-service-1",
    tripId: "trip-edit-service-1",
    itineraryId: "itinerary-edit-service-1",
    baseTripContextVersion: 2,
    baseItineraryVersion: 3,
    contextSnapshotId: "snapshot-edit-service-1",
    requestedAt: new Date("2026-08-08T12:00:00.000Z"),
  });
  const generating = startItineraryProposalGeneration(
    requested,
    new Date("2026-08-08T12:01:00.000Z"),
  );
  return completeItineraryProposalGeneration(generating, {
    generationMethod: "deterministic",
    generationVersion: "1",
    proposedActivities: [
      {
        proposedActivityId: "proposed-edit-service-1",
        targetTripDayId: "day-1",
        placeId: "place-1",
        title: "Praia do Amor",
        description: "Visita original",
        proposedStartTime: "10:00",
        durationMinutes: 90,
        proposedOrder: 0,
        operationType: "add",
        reason: "Boa opção para o roteiro.",
      },
    ],
    criteria: ["ritmo"],
    justifications: ["Boa distribuição."],
    limitations: [],
    planningConflictIds: [],
    generatedAt: new Date("2026-08-08T12:02:00.000Z"),
    validUntil: new Date("2026-08-09T12:02:00.000Z"),
  });
}

describe("editAndPersistItineraryProposalProposedActivity", () => {
  it("carrega o estado atual, aplica a edição e persiste somente o resultado validado", async () => {
    const repository = new ControlledItineraryProposalRepository();
    const ready = readyProposal();
    repository.current = ready;

    const edited = await editAndPersistItineraryProposalProposedActivity(repository, {
      tripId: ready.tripId,
      itineraryProposalId: ready.id,
      proposedActivityId: "proposed-edit-service-1",
      editedAt: new Date("2026-08-08T12:03:00.000Z"),
      changes: {
        title: "Praia do Amor ao entardecer",
        proposedStartTime: "16:30",
        durationMinutes: 120,
      },
    });

    expect(edited).toMatchObject({
      id: ready.id,
      status: "ready",
      updatedAt: new Date("2026-08-08T12:03:00.000Z"),
      proposedActivities: [
        expect.objectContaining({
          proposedActivityId: "proposed-edit-service-1",
          placeId: "place-1",
          operationType: "add",
          reason: "Boa opção para o roteiro.",
          title: "Praia do Amor ao entardecer",
          proposedStartTime: "16:30",
          durationMinutes: 120,
        }),
      ],
    });
    expect(repository.saveCalls).toEqual([edited]);
    expect(repository.current).toBe(edited);
    expect(ready.proposedActivities![0]!.title).toBe("Praia do Amor");
  });

  it("usa a representação atual do repository em cada comando", async () => {
    const repository = new ControlledItineraryProposalRepository();
    const ready = readyProposal();
    repository.current = ready;

    const first = await editAndPersistItineraryProposalProposedActivity(repository, {
      tripId: ready.tripId,
      itineraryProposalId: ready.id,
      proposedActivityId: "proposed-edit-service-1",
      editedAt: new Date("2026-08-08T12:03:00.000Z"),
      changes: { title: "Título persistido" },
    });
    const second = await editAndPersistItineraryProposalProposedActivity(repository, {
      tripId: ready.tripId,
      itineraryProposalId: ready.id,
      proposedActivityId: "proposed-edit-service-1",
      editedAt: new Date("2026-08-08T12:04:00.000Z"),
      changes: { durationMinutes: 150 },
    });

    expect(first.proposedActivities![0]!.title).toBe("Título persistido");
    expect(second.proposedActivities![0]).toMatchObject({
      title: "Título persistido",
      durationMinutes: 150,
    });
    expect(repository.saveCalls).toEqual([first, second]);
  });

  it("rejeita Proposal ausente sem executar save", async () => {
    const repository = new ControlledItineraryProposalRepository();

    await expect(
      editAndPersistItineraryProposalProposedActivity(repository, {
        tripId: "trip-ausente",
        itineraryProposalId: "proposal-ausente" as ItineraryProposalId,
        proposedActivityId: "activity-ausente",
        editedAt: new Date("2026-08-08T12:03:00.000Z"),
        changes: { title: "Novo título" },
      }),
    ).rejects.toMatchObject({
      name: "ItineraryProposalApplicationError",
      code: "proposal-not-found",
    } satisfies Partial<ItineraryProposalApplicationError>);
    expect(repository.saveCalls).toEqual([]);
  });

  it.each([
    [
      "Proposal não ready",
      () =>
        requestItineraryProposal({
          id: "proposal-requested-edit",
          tripId: "trip-edit-service-1",
          itineraryId: "itinerary-edit-service-1",
          baseTripContextVersion: 1,
          baseItineraryVersion: 1,
          contextSnapshotId: "snapshot-requested-edit",
          requestedAt: new Date("2026-08-08T12:00:00.000Z"),
        }),
      "proposed-edit-service-1",
      { title: "Novo título" },
    ],
    ["atividade inexistente", readyProposal, "inexistente", { title: "Novo título" }],
    ["payload inválido", readyProposal, "proposed-edit-service-1", { durationMinutes: 0 }],
  ] as const)("não persiste quando %s", async (_, proposalFactory, activityId, changes) => {
    const repository = new ControlledItineraryProposalRepository();
    const proposal = proposalFactory();
    repository.current = proposal;

    await expect(
      editAndPersistItineraryProposalProposedActivity(repository, {
        tripId: proposal.tripId,
        itineraryProposalId: proposal.id,
        proposedActivityId: activityId,
        editedAt: new Date("2026-08-08T12:03:00.000Z"),
        changes,
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(repository.saveCalls).toEqual([]);
    expect(repository.current).toBe(proposal);
  });
});
