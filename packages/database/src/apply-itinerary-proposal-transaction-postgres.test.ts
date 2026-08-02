import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

import {
  completeItineraryProposalGeneration,
  createAcceptItineraryProposalCommand,
  requestItineraryProposal,
  startItineraryProposalGeneration,
} from "@routebook/proposal-management";
import { createItinerary, createTrip } from "@routebook/trip-management";

import {
  createApplyItineraryProposalTransaction,
  createPostgresApplyItineraryProposalTransaction,
} from "./apply-itinerary-proposal-transaction";
import { closeDatabase, getDatabase } from "./client";
import { createDecisionTransactionFragment } from "./decision-transaction-fragment";
import { DrizzleDecisionRepository } from "./decision-repository";
import { createItineraryProposalTransactionFragment } from "./itinerary-proposal-transaction-fragment";
import { ItineraryProposalTransactionUnit } from "./itinerary-proposal-transaction-unit";
import { createItineraryTransactionFragment } from "./itinerary-transaction-fragment";
import { DrizzleItineraryRepository } from "./itinerary-repository";
import { PostgresTransactionRunner } from "./postgres-transaction-runner";
import { createProposalApplicationTransactionFragment } from "./proposal-application-transaction-fragment";
import { createPostgresProposalApplicationRepository } from "./proposal-application-repository";
import { DrizzleItineraryProposalRepository } from "./proposal-repository";
import { trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

const requestedAt = new Date("2026-08-02T18:00:00.000Z");
const generationStartedAt = new Date("2026-08-02T18:01:00.000Z");
const generatedAt = new Date("2026-08-02T18:02:00.000Z");
const decidedAt = new Date("2026-08-02T18:03:00.000Z");

async function createFixture(name: string) {
  const trip = createTrip({
    name,
    startDate: "2026-08-22",
    endDate: "2026-08-23",
    ownerName: "RouteBook QA",
  });
  const itinerary = createItinerary({ tripId: trip.id, period: trip.period });
  const proposedActivityId = randomUUID();
  const requested = requestItineraryProposal({
    id: randomUUID(),
    tripId: trip.id,
    itineraryId: itinerary.id,
    baseTripContextVersion: trip.contextVersion,
    baseItineraryVersion: itinerary.version,
    contextSnapshotId: `snapshot-${randomUUID()}`,
    requestedAt,
  });
  const ready = completeItineraryProposalGeneration(
    startItineraryProposalGeneration(requested, generationStartedAt),
    {
      generationMethod: "deterministic",
      generationVersion: "proposal-policy-v1",
      proposedActivities: [
        {
          proposedActivityId,
          targetTripDayId: itinerary.days[0]!.id,
          title: "Praia do Amor",
          description: "Visita no início da manhã.",
          proposedStartTime: "09:00:00",
          durationMinutes: 120,
          proposedOrder: 0,
          operationType: "add",
          flexibility: "suggested",
          reason: "Compatível com o ritmo da viagem.",
        },
      ],
      criteria: ["ritmo da viagem"],
      justifications: ["preserva o restante do dia"],
      limitations: [],
      planningConflictIds: [],
      generatedAt,
      validUntil: new Date(generatedAt.getTime() + 86_400_000),
    },
  );

  await new DrizzleTripRepository().create(trip);
  await new DrizzleItineraryRepository().save(itinerary);
  const proposalRepository = new DrizzleItineraryProposalRepository();
  await proposalRepository.create(requested);
  await proposalRepository.save(ready);

  const command = createAcceptItineraryProposalCommand({
    tripId: trip.id,
    itineraryId: itinerary.id,
    itineraryProposalId: ready.id,
    expectedItineraryVersion: itinerary.version,
    idempotencyKey: `accept-${ready.id}`,
    actorType: "participant",
    actorId: randomUUID(),
    decidedAt,
    items: [
      {
        proposedActivityId,
        operationType: "add",
        targetTripDayId: itinerary.days[0]!.id,
        title: "Praia do Amor",
        activityType: "place-visit",
        flexibility: "suggested",
        startTime: "09:00",
        durationMinutes: 120,
      },
    ],
  });

  return { trip, itinerary, ready, command, proposedActivityId };
}

async function cleanup(tripId: string) {
  await getDatabase().delete(trips).where(eq(trips.id, tripId));
}

afterAll(async () => {
  await closeDatabase();
});

describe("ApplyItineraryProposalTransaction with PostgreSQL", () => {
  it("persiste o aceite integral em uma transação e reproduz o resultado idempotente", async () => {
    const fixture = await createFixture("Composição PostgreSQL do aceite");
    const database = getDatabase();
    const transactionSpy = vi.spyOn(database, "transaction");
    const transaction = createPostgresApplyItineraryProposalTransaction();

    try {
      const applied = await transaction.execute(fixture.command);
      const replayed = await transaction.execute(fixture.command);

      expect(applied).toMatchObject({
        kind: "applied",
        tripId: fixture.trip.id,
        itineraryId: fixture.itinerary.id,
        itineraryProposalId: fixture.ready.id,
        requestFingerprint: fixture.command.requestFingerprint,
        resultingItineraryVersion: fixture.itinerary.version + 1,
        appliedProposedActivityIds: [fixture.proposedActivityId],
      });
      expect(replayed).toEqual({ ...applied, kind: "replay" });
      expect(transactionSpy).toHaveBeenCalledTimes(2);

      const persistedItinerary = await new DrizzleItineraryRepository().findByTripId(
        fixture.trip.id,
      );
      expect(persistedItinerary).toMatchObject({
        version: fixture.itinerary.version + 1,
      });
      expect(persistedItinerary?.days[0]?.activities).toHaveLength(1);
      expect(persistedItinerary?.days[0]?.activities[0]).toMatchObject({
        title: "Praia do Amor",
        startTime: "09:00",
        durationMinutes: 120,
      });

      const persistedProposal = await new DrizzleItineraryProposalRepository().findById(
        fixture.trip.id,
        fixture.ready.id,
      );
      expect(persistedProposal).toMatchObject({ status: "accepted", acceptedAt: decidedAt });

      const application = await createPostgresProposalApplicationRepository(
        database,
      ).findByIdempotencyKey(fixture.ready.id, fixture.command.idempotencyKey);
      expect(application?.application).toMatchObject({
        id: applied.proposalApplicationId,
        status: "succeeded",
        resultingItineraryVersion: fixture.itinerary.version + 1,
      });

      const decision = await new DrizzleDecisionRepository().findByIdempotencyKey(
        fixture.trip.id,
        fixture.command.idempotencyKey,
      );
      expect(decision).toMatchObject({
        id: applied.decisionId,
        tripId: fixture.trip.id,
        actorParticipantId: fixture.command.actorId,
        effect: {
          proposalApplicationId: applied.proposalApplicationId,
          resultingItineraryVersion: fixture.itinerary.version + 1,
          appliedProposedActivityIds: [fixture.proposedActivityId],
        },
      });
    } finally {
      transactionSpy.mockRestore();
      await cleanup(fixture.trip.id);
    }
  });

  it("reverte Application, Itinerary e Decision quando a finalização da Proposal falha", async () => {
    const fixture = await createFixture("Rollback integral do aceite");
    const database = getDatabase();
    const rollback = new Error("falha intencional ao finalizar a Proposal");
    const runner = new PostgresTransactionRunner(database);
    const unit = new ItineraryProposalTransactionUnit(runner, {
      proposalApplication: createProposalApplicationTransactionFragment,
      itineraryProposal: (executor) => {
        const fragment = createItineraryProposalTransactionFragment(executor);
        return Object.freeze({
          ...fragment,
          async accept() {
            throw rollback;
          },
        });
      },
      itinerary: createItineraryTransactionFragment,
      decision: createDecisionTransactionFragment,
    });
    const transaction = createApplyItineraryProposalTransaction(unit);

    try {
      await expect(transaction.execute(fixture.command)).rejects.toBe(rollback);

      expect(await new DrizzleItineraryRepository().findByTripId(fixture.trip.id)).toEqual(
        fixture.itinerary,
      );
      expect(
        await new DrizzleItineraryProposalRepository().findById(fixture.trip.id, fixture.ready.id),
      ).toEqual(fixture.ready);
      expect(
        await createPostgresProposalApplicationRepository(database).findByIdempotencyKey(
          fixture.ready.id,
          fixture.command.idempotencyKey,
        ),
      ).toBeNull();
      expect(
        await new DrizzleDecisionRepository().findByIdempotencyKey(
          fixture.trip.id,
          fixture.command.idempotencyKey,
        ),
      ).toBeNull();
    } finally {
      await cleanup(fixture.trip.id);
    }
  });
});
