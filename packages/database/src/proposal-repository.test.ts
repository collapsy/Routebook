import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import {
  cancelItineraryProposalGeneration,
  failItineraryProposalGeneration,
  ItineraryProposalRepositoryError,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposal,
} from "@routebook/proposal-management";
import { createItinerary, createTrip } from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import { DrizzleItineraryRepository } from "./itinerary-repository";
import { itineraryProposals } from "./proposal-schema";
import { DrizzleItineraryProposalRepository } from "./proposal-repository";
import { itineraries, trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

afterAll(async () => {
  await closeDatabase();
});

async function createFixture(name = "Persistência de Itinerary Proposal") {
  const trip = createTrip({
    name,
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    ownerName: "RouteBook QA",
  });
  const itinerary = createItinerary({ tripId: trip.id, period: trip.period });
  await new DrizzleTripRepository().create(trip);
  await new DrizzleItineraryRepository().save(itinerary);
  return { trip, itinerary };
}

function buildProposal(
  fixture: Awaited<ReturnType<typeof createFixture>>,
  requestedAt: Date,
  overrides: Partial<{
    id: string;
    tripId: string;
    itineraryId: string;
  }> = {},
): ItineraryProposal {
  return requestItineraryProposal({
    id: overrides.id ?? randomUUID(),
    tripId: overrides.tripId ?? fixture.trip.id,
    itineraryId: overrides.itineraryId ?? fixture.itinerary.id,
    baseTripContextVersion: fixture.trip.contextVersion,
    baseItineraryVersion: fixture.itinerary.version,
    contextSnapshotId: `snapshot-${randomUUID()}`,
    requestedAt,
  });
}

async function cleanup(...tripIds: string[]) {
  const database = getDatabase();
  for (const tripId of tripIds) {
    await database.delete(trips).where(eq(trips.id, tripId));
  }
}

describe("DrizzleItineraryProposalRepository", () => {
  it("preserva requested, generating e failed no round trip", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleItineraryProposalRepository();
    const requested = buildProposal(fixture, new Date("2026-08-01T12:00:00.000Z"));

    try {
      expect(await repository.create(requested)).toEqual(requested);
      expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(requested);

      const generating = startItineraryProposalGeneration(
        requested,
        new Date("2026-08-01T12:01:00.000Z"),
      );
      await repository.save(generating);
      expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(generating);

      const failed = failItineraryProposalGeneration(
        generating,
        "provider-timeout",
        new Date("2026-08-01T12:02:00.000Z"),
      );
      await repository.save(failed);
      expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(failed);
    } finally {
      await cleanup(fixture.trip.id);
    }
  });

  it("preserva cancelamento antes e depois do início da geração", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleItineraryProposalRepository();

    try {
      const requested = buildProposal(fixture, new Date("2026-08-01T13:00:00.000Z"));
      await repository.create(requested);
      const cancelledRequested = cancelItineraryProposalGeneration(
        requested,
        new Date("2026-08-01T13:01:00.000Z"),
      );
      await repository.save(cancelledRequested);

      const anotherRequested = buildProposal(fixture, new Date("2026-08-01T14:00:00.000Z"));
      await repository.create(anotherRequested);
      const generating = startItineraryProposalGeneration(
        anotherRequested,
        new Date("2026-08-01T14:01:00.000Z"),
      );
      await repository.save(generating);
      const cancelledGenerating = cancelItineraryProposalGeneration(
        generating,
        new Date("2026-08-01T14:02:00.000Z"),
      );
      await repository.save(cancelledGenerating);

      expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(cancelledRequested);
      expect(await repository.findById(fixture.trip.id, anotherRequested.id)).toEqual(
        cancelledGenerating,
      );
    } finally {
      await cleanup(fixture.trip.id);
    }
  });

  it("lista por instante e isola leituras por TripId", async () => {
    const fixture = await createFixture();
    const otherFixture = await createFixture("Outra Viagem com Proposal");
    const repository = new DrizzleItineraryProposalRepository();

    try {
      const later = buildProposal(fixture, new Date("2026-08-01T16:00:00.000Z"));
      const earlier = buildProposal(fixture, new Date("2026-08-01T15:00:00.000Z"));
      const other = buildProposal(otherFixture, new Date("2026-08-01T14:00:00.000Z"));
      await repository.create(later);
      await repository.create(earlier);
      await repository.create(other);

      expect((await repository.listByTripId(fixture.trip.id)).map(({ id }) => id)).toEqual([
        earlier.id,
        later.id,
      ]);
      expect(await repository.findById(otherFixture.trip.id, earlier.id)).toBeNull();
      expect(await repository.listByTripId(otherFixture.trip.id)).toEqual([other]);
    } finally {
      await cleanup(fixture.trip.id, otherFixture.trip.id);
    }
  });

  it("rejeita Trip, Itinerary e vínculo entre Viagens inválidos", async () => {
    const fixture = await createFixture();
    const otherFixture = await createFixture("Viagem de outro Itinerary");
    const repository = new DrizzleItineraryProposalRepository();

    try {
      const missingTrip = buildProposal(fixture, new Date(), {
        tripId: randomUUID(),
      });
      await expect(repository.create(missingTrip)).rejects.toMatchObject({
        code: "trip-not-found",
      } satisfies Partial<ItineraryProposalRepositoryError>);

      const missingItinerary = buildProposal(fixture, new Date(), {
        itineraryId: randomUUID(),
      });
      await expect(repository.create(missingItinerary)).rejects.toMatchObject({
        code: "itinerary-not-found",
      } satisfies Partial<ItineraryProposalRepositoryError>);

      const mismatched = buildProposal(fixture, new Date(), {
        itineraryId: otherFixture.itinerary.id,
      });
      await expect(repository.create(mismatched)).rejects.toMatchObject({
        code: "itinerary-trip-mismatch",
      } satisfies Partial<ItineraryProposalRepositoryError>);
    } finally {
      await cleanup(fixture.trip.id, otherFixture.trip.id);
    }
  });

  it("rejeita create fora de requested, duplicidade e save ausente", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleItineraryProposalRepository();
    const requested = buildProposal(fixture, new Date("2026-08-01T17:00:00.000Z"));

    try {
      const generating = startItineraryProposalGeneration(
        requested,
        new Date("2026-08-01T17:01:00.000Z"),
      );
      await expect(repository.create(generating)).rejects.toMatchObject({
        code: "invalid-status",
      } satisfies Partial<ItineraryProposalRepositoryError>);

      await repository.create(requested);
      await expect(repository.create(requested)).rejects.toMatchObject({
        code: "duplicate-proposal",
      } satisfies Partial<ItineraryProposalRepositoryError>);

      const missing = buildProposal(fixture, new Date("2026-08-01T18:00:00.000Z"));
      await expect(repository.save(missing)).rejects.toMatchObject({
        code: "proposal-not-found",
      } satisfies Partial<ItineraryProposalRepositoryError>);
    } finally {
      await cleanup(fixture.trip.id);
    }
  });

  it("aplica constraints de lifecycle e acompanha cascatas de Itinerary e Trip", async () => {
    const fixture = await createFixture();
    const otherFixture = await createFixture("Cascata da Trip com Proposal");
    const repository = new DrizzleItineraryProposalRepository();
    const proposal = buildProposal(fixture, new Date("2026-08-01T19:00:00.000Z"));
    const otherProposal = buildProposal(otherFixture, new Date("2026-08-01T20:00:00.000Z"));

    try {
      await repository.create(proposal);
      await repository.create(otherProposal);
      await expect(
        getDatabase()
          .update(itineraryProposals)
          .set({ status: "ready" })
          .where(eq(itineraryProposals.id, proposal.id)),
      ).rejects.toThrow();

      await getDatabase().delete(itineraries).where(eq(itineraries.id, fixture.itinerary.id));
      expect(await repository.findById(fixture.trip.id, proposal.id)).toBeNull();

      await getDatabase().delete(trips).where(eq(trips.id, otherFixture.trip.id));
      expect(await repository.findById(otherFixture.trip.id, otherProposal.id)).toBeNull();
    } finally {
      await cleanup(fixture.trip.id, otherFixture.trip.id);
    }
  });
});
