import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import {
  completeItineraryProposalGeneration,
  requestItineraryProposal,
  startItineraryProposalGeneration,
} from "@routebook/proposal-management";
import { createItinerary, createTrip } from "@routebook/trip-management";

import { createPostgresAcceptItineraryProposal } from "./accept-itinerary-proposal-service";
import { closeDatabase, getDatabase } from "./client";
import { DrizzleDecisionRepository } from "./decision-repository";
import { DrizzleItineraryRepository } from "./itinerary-repository";
import { createPostgresProposalApplicationRepository } from "./proposal-application-repository";
import { DrizzleItineraryProposalRepository } from "./proposal-repository";
import { trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

const requestedAt = new Date("2026-08-02T21:00:00.000Z");
const generationStartedAt = new Date("2026-08-02T21:01:00.000Z");
const generatedAt = new Date("2026-08-02T21:02:00.000Z");
const decidedAt = new Date("2026-08-02T21:03:00.000Z");

async function fixture() {
  const trip = createTrip({
    name: "Application service de aceite",
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

  return {
    trip,
    itinerary,
    ready,
    proposedActivityId,
    input: {
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
          operationType: "add" as const,
          targetTripDayId: itinerary.days[0]!.id,
          title: "Praia do Amor",
          activityType: "place-visit" as const,
          flexibility: "suggested" as const,
          startTime: "09:00",
          durationMinutes: 120,
        },
      ],
    },
  };
}

afterAll(async () => {
  await closeDatabase();
});

describe("PostgreSQL AcceptItineraryProposal service", () => {
  it("executa a implementação real e preserva applied e replay", async () => {
    const current = await fixture();
    const service = createPostgresAcceptItineraryProposal();

    try {
      const applied = await service.execute(current.input);
      const replay = await service.execute(current.input);

      expect(applied).toMatchObject({
        kind: "applied",
        tripId: current.trip.id,
        itineraryId: current.itinerary.id,
        itineraryProposalId: current.ready.id,
        resultingItineraryVersion: current.itinerary.version + 1,
        appliedProposedActivityIds: [current.proposedActivityId],
      });
      expect(replay).toEqual({ ...applied, kind: "replay" });

      expect(await new DrizzleItineraryRepository().findByTripId(current.trip.id)).toMatchObject({
        version: current.itinerary.version + 1,
      });
      expect(
        await new DrizzleItineraryProposalRepository().findById(
          current.trip.id,
          current.ready.id,
        ),
      ).toMatchObject({ status: "accepted" });
      expect(
        (
          await createPostgresProposalApplicationRepository(
            getDatabase(),
          ).findByIdempotencyKey(current.ready.id, current.input.idempotencyKey)
        )?.application,
      ).toMatchObject({
        id: applied.proposalApplicationId,
        status: "succeeded",
        resultingItineraryVersion: current.itinerary.version + 1,
      });
      expect(
        await new DrizzleDecisionRepository().findByIdempotencyKey(
          current.trip.id,
          current.input.idempotencyKey,
        ),
      ).toMatchObject({
        id: applied.decisionId,
        actorParticipantId: current.input.actorId,
      });
    } finally {
      await getDatabase().delete(trips).where(eq(trips.id, current.trip.id));
    }
  });
});
