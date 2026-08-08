import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import {
  completeItineraryProposalGeneration,
  editAndPersistItineraryProposalProposedActivity,
  requestItineraryProposal,
  startItineraryProposalGeneration,
} from "@routebook/proposal-management";
import { createItinerary, createTrip } from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import { DrizzleItineraryRepository } from "./itinerary-repository";
import { proposedActivities } from "./proposal-schema";
import { DrizzleItineraryProposalRepository } from "./proposal-repository";
import { trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

afterAll(async () => {
  await closeDatabase();
});

async function createReadyFixture() {
  const trip = createTrip({
    name: `Edição persistida ${randomUUID()}`,
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    ownerName: "RouteBook QA",
  });
  const itinerary = createItinerary({ tripId: trip.id, period: trip.period });
  await new DrizzleTripRepository().create(trip);
  await new DrizzleItineraryRepository().save(itinerary);

  const repository = new DrizzleItineraryProposalRepository();
  const requestedAt = new Date("2026-08-08T12:00:00.000Z");
  const requested = requestItineraryProposal({
    id: randomUUID(),
    tripId: trip.id,
    itineraryId: itinerary.id,
    baseTripContextVersion: trip.contextVersion,
    baseItineraryVersion: itinerary.version,
    contextSnapshotId: `snapshot-${randomUUID()}`,
    requestedAt,
  });
  const generating = startItineraryProposalGeneration(
    requested,
    new Date("2026-08-08T12:01:00.000Z"),
  );
  const proposedActivityId = randomUUID();
  const ready = completeItineraryProposalGeneration(generating, {
    generationMethod: "deterministic",
    generationVersion: "1",
    proposedActivities: [
      {
        proposedActivityId,
        targetTripDayId: randomUUID(),
        placeId: randomUUID(),
        title: "Praia do Amor",
        description: "Visita original",
        proposedStartTime: "10:00",
        durationMinutes: 90,
        proposedOrder: 0,
        operationType: "add",
        flexibility: "flexible",
        estimatedCostAmount: 25,
        estimatedCostCurrency: "BRL",
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

  await repository.create(requested);
  await repository.save(ready);

  return { trip, itinerary, repository, ready, proposedActivityId };
}

async function cleanup(tripId: string): Promise<void> {
  await getDatabase().delete(trips).where(eq(trips.id, tripId));
}

describe("edição persistida de Itinerary Proposal no PostgreSQL", () => {
  it("persiste e reidrata a Proposed Activity editada sem alterar o Itinerary", async () => {
    const fixture = await createReadyFixture();
    const itineraryRepository = new DrizzleItineraryRepository();
    const itineraryBefore = await itineraryRepository.findByTripId(fixture.trip.id);

    try {
      const edited = await editAndPersistItineraryProposalProposedActivity(fixture.repository, {
        tripId: fixture.trip.id,
        itineraryProposalId: fixture.ready.id,
        proposedActivityId: fixture.proposedActivityId,
        editedAt: new Date("2026-08-08T12:03:00.000Z"),
        changes: {
          title: "Praia do Amor ao entardecer",
          description: "Visita ajustada e persistida",
          proposedStartTime: "16:30",
          durationMinutes: 120,
          proposedOrder: 2,
          flexibility: "fixed",
          estimatedCostAmount: 40.5,
          estimatedCostCurrency: "brl",
        },
      });

      const rehydrated = await fixture.repository.findById(fixture.trip.id, fixture.ready.id);
      expect(rehydrated).toEqual(edited);
      expect(rehydrated).toMatchObject({
        status: "ready",
        updatedAt: new Date("2026-08-08T12:03:00.000Z"),
        proposedActivities: [
          expect.objectContaining({
            proposedActivityId: fixture.proposedActivityId,
            title: "Praia do Amor ao entardecer",
            description: "Visita ajustada e persistida",
            proposedStartTime: "16:30",
            durationMinutes: 120,
            proposedOrder: 2,
            flexibility: "fixed",
            estimatedCostAmount: 40.5,
            estimatedCostCurrency: "BRL",
            operationType: "add",
            reason: "Boa opção para o roteiro.",
          }),
        ],
      });
      expect(await itineraryRepository.findByTripId(fixture.trip.id)).toEqual(itineraryBefore);

      const persistedActivities = await getDatabase()
        .select({
          id: proposedActivities.id,
          title: proposedActivities.title,
          durationMinutes: proposedActivities.durationMinutes,
          proposedOrder: proposedActivities.proposedOrder,
        })
        .from(proposedActivities)
        .where(eq(proposedActivities.itineraryProposalId, fixture.ready.id));
      expect(persistedActivities).toEqual([
        {
          id: fixture.proposedActivityId,
          title: "Praia do Amor ao entardecer",
          durationMinutes: 120,
          proposedOrder: 2,
        },
      ]);
    } finally {
      await cleanup(fixture.trip.id);
    }
  });

  it("não persiste alteração inválida e mantém a Proposal anterior", async () => {
    const fixture = await createReadyFixture();

    try {
      await expect(
        editAndPersistItineraryProposalProposedActivity(fixture.repository, {
          tripId: fixture.trip.id,
          itineraryProposalId: fixture.ready.id,
          proposedActivityId: fixture.proposedActivityId,
          editedAt: new Date("2026-08-08T12:03:00.000Z"),
          changes: { durationMinutes: 0 },
        }),
      ).rejects.toBeInstanceOf(Error);

      expect(await fixture.repository.findById(fixture.trip.id, fixture.ready.id)).toEqual(
        fixture.ready,
      );
    } finally {
      await cleanup(fixture.trip.id);
    }
  });
});
