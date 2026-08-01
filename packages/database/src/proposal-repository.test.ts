import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";

import {
  cancelItineraryProposalGeneration,
  completeItineraryProposalGeneration,
  expireItineraryProposalByTime,
  failItineraryProposalGeneration,
  ItineraryProposalRepositoryError,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposal,
  type ProposedActivityInput,
} from "@routebook/proposal-management";
import { createItinerary, createTrip } from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import { DrizzleItineraryRepository } from "./itinerary-repository";
import { itineraryProposals, proposedActivities } from "./proposal-schema";
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

function buildReadyProposal(
  requested: ItineraryProposal,
  activities: readonly ProposedActivityInput[] = [
    {
      proposedActivityId: randomUUID(),
      targetTripDayId: randomUUID(),
      placeId: randomUUID(),
      title: "Museu de Arte",
      description: "Visita pela manhã",
      proposedStartTime: "09:30:15",
      durationMinutes: 90,
      proposedOrder: 0,
      operationType: "add",
      flexibility: "flexible",
      estimatedCostAmount: 25.5,
      estimatedCostCurrency: "BRL",
      reason: "Compatível com os interesses do grupo",
    },
  ],
  generationMethod = "deterministic",
): ItineraryProposal {
  const generationStartedAt = new Date(requested.requestedAt.getTime() + 60_000);
  const generatedAt = new Date(requested.requestedAt.getTime() + 120_000);
  return completeItineraryProposalGeneration(
    startItineraryProposalGeneration(requested, generationStartedAt),
    {
      generationMethod,
      generationVersion: "proposal-policy-v1",
      proposedActivities: activities,
      criteria: ["ritmo do grupo"],
      justifications: ["preserva o período protegido"],
      limitations: [],
      planningConflictIds: [randomUUID()],
      generatedAt,
      validUntil: new Date(generatedAt.getTime() + 86_400_000),
    },
  );
}

async function cleanup(...tripIds: string[]) {
  const database = getDatabase();
  for (const tripId of tripIds) {
    await database.delete(trips).where(eq(trips.id, tripId));
  }
}

describe("DrizzleItineraryProposalRepository", () => {
  it("preserva Proposal ready, proveniência, snapshots e Proposed Activities no round trip", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleItineraryProposalRepository();
    const requested = buildProposal(fixture, new Date("2026-08-01T10:00:00.000Z"));
    const ready = buildReadyProposal(requested);

    try {
      await repository.create(requested);
      await repository.save(ready);

      expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(ready);
      expect(
        await getDatabase()
          .select({ id: proposedActivities.id })
          .from(proposedActivities)
          .where(eq(proposedActivities.itineraryProposalId, requested.id)),
      ).toHaveLength(1);
    } finally {
      await cleanup(fixture.trip.id);
    }
  });

  it("preserva Proposal ready vazia quando a justificativa é explícita", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleItineraryProposalRepository();
    const requested = buildProposal(fixture, new Date("2026-08-01T10:30:00.000Z"));
    const ready = buildReadyProposal(requested, []);

    try {
      await repository.create(requested);
      await repository.save(ready);
      expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(ready);
    } finally {
      await cleanup(fixture.trip.id);
    }
  });

  it("preserva Proposal expired, conteúdo auditável e Proposed Activities no round trip e na listagem", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleItineraryProposalRepository();
    const requested = buildProposal(fixture, new Date("2026-08-01T10:45:00.000Z"));
    const ready = buildReadyProposal(requested);
    const expiredAt = new Date(ready.validUntil!.getTime() + 60_000);
    const expired = expireItineraryProposalByTime(ready, expiredAt);

    try {
      await repository.create(requested);
      await repository.save(ready);
      await repository.save(expired);

      expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(expired);
      expect(await repository.listByTripId(fixture.trip.id)).toEqual([expired]);
      const [persisted] = await getDatabase()
        .select({
          status: itineraryProposals.status,
          expiredAt: itineraryProposals.expiredAt,
          generationMethod: itineraryProposals.generationMethod,
          generationVersion: itineraryProposals.generationVersion,
          criteria: itineraryProposals.criteria,
        })
        .from(itineraryProposals)
        .where(eq(itineraryProposals.id, requested.id));
      expect(persisted).toEqual({
        status: "expired",
        expiredAt,
        generationMethod: ready.generationMethod,
        generationVersion: ready.generationVersion,
        criteria: ready.criteria,
      });
      expect(
        await getDatabase()
          .select({ id: proposedActivities.id })
          .from(proposedActivities)
          .where(eq(proposedActivities.itineraryProposalId, requested.id)),
      ).toHaveLength(1);
    } finally {
      await cleanup(fixture.trip.id);
    }
  });

  it("rejeita persistência expired sem instante, antecipada ou com conteúdo incompleto", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleItineraryProposalRepository();
    const requested = buildProposal(fixture, new Date("2026-08-01T10:50:00.000Z"));
    const ready = buildReadyProposal(requested);
    const validUntil = ready.validUntil!;

    try {
      await repository.create(requested);
      await repository.save(ready);

      await expect(
        getDatabase()
          .update(itineraryProposals)
          .set({ status: "expired", updatedAt: validUntil })
          .where(eq(itineraryProposals.id, requested.id)),
      ).rejects.toThrow();

      const tooEarly = new Date(validUntil.getTime() - 1);
      await expect(
        getDatabase()
          .update(itineraryProposals)
          .set({ status: "expired", expiredAt: tooEarly, updatedAt: tooEarly })
          .where(eq(itineraryProposals.id, requested.id)),
      ).rejects.toThrow();

      await expect(
        getDatabase()
          .update(itineraryProposals)
          .set({ status: "expired", criteria: null, expiredAt: validUntil, updatedAt: validUntil })
          .where(eq(itineraryProposals.id, requested.id)),
      ).rejects.toThrow();

      expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(ready);
    } finally {
      await cleanup(fixture.trip.id);
    }
  });

  it("reverte a transição para expired quando a persistência das Proposed Activities falha", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleItineraryProposalRepository();
    const requested = buildProposal(fixture, new Date("2026-08-01T10:55:00.000Z"));
    const ready = buildReadyProposal(requested);
    const duplicateId = randomUUID();
    const invalidReady = buildReadyProposal(requested, [
      {
        proposedActivityId: duplicateId,
        title: "Atividade duplicada",
        proposedOrder: 0,
        operationType: "add",
      },
      {
        proposedActivityId: duplicateId,
        title: "Outra atividade duplicada",
        proposedOrder: 1,
        operationType: "add",
      },
    ]);
    const invalidExpired = expireItineraryProposalByTime(
      invalidReady,
      new Date(invalidReady.validUntil!.getTime()),
    );

    try {
      await repository.create(requested);
      await repository.save(ready);

      await expect(repository.save(invalidExpired)).rejects.toThrow();
      expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(ready);
    } finally {
      await cleanup(fixture.trip.id);
    }
  });

  it("substitui Proposed Activities e reverte integralmente quando o novo conjunto falha", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleItineraryProposalRepository();
    const requested = buildProposal(fixture, new Date("2026-08-01T11:00:00.000Z"));
    const first = buildReadyProposal(requested);
    const replacementActivity: ProposedActivityInput = {
      proposedActivityId: randomUUID(),
      title: "Parque central",
      proposedOrder: 0,
      operationType: "add",
    };
    const replacement = buildReadyProposal(requested, [replacementActivity], "rules-engine");

    try {
      await repository.create(requested);
      await repository.save(first);
      await repository.save(replacement);
      expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(replacement);

      const duplicateId = randomUUID();
      const invalidReplacement = buildReadyProposal(
        requested,
        [
          { ...replacementActivity, proposedActivityId: duplicateId },
          { ...replacementActivity, proposedActivityId: duplicateId, proposedOrder: 1 },
        ],
        "should-rollback",
      );
      await expect(repository.save(invalidReplacement)).rejects.toThrow();
      expect(await repository.findById(fixture.trip.id, requested.id)).toEqual(replacement);
    } finally {
      await cleanup(fixture.trip.id);
    }
  });

  it("rejeita snapshot JSONB inválido com erro tipado do repository", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleItineraryProposalRepository();
    const requested = buildProposal(fixture, new Date("2026-08-01T11:30:00.000Z"));
    const ready = buildReadyProposal(requested);

    try {
      await repository.create(requested);
      await repository.save(ready);
      await getDatabase()
        .update(itineraryProposals)
        .set({ limitations: [1] })
        .where(eq(itineraryProposals.id, requested.id));

      await expect(repository.findById(fixture.trip.id, requested.id)).rejects.toMatchObject({
        code: "invalid-status",
      } satisfies Partial<ItineraryProposalRepositoryError>);
    } finally {
      await cleanup(fixture.trip.id);
    }
  });

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
      const [persisted] = await getDatabase()
        .select({
          generationMethod: itineraryProposals.generationMethod,
          generationVersion: itineraryProposals.generationVersion,
          contentSchemaVersion: itineraryProposals.contentSchemaVersion,
          criteria: itineraryProposals.criteria,
          generatedAt: itineraryProposals.generatedAt,
          validUntil: itineraryProposals.validUntil,
        })
        .from(itineraryProposals)
        .where(eq(itineraryProposals.id, requested.id));
      expect(persisted).toEqual({
        generationMethod: null,
        generationVersion: null,
        contentSchemaVersion: null,
        criteria: null,
        generatedAt: null,
        validUntil: null,
      });
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

  it("lista Proposals e seus itens em ordem estável", async () => {
    const fixture = await createFixture();
    const repository = new DrizzleItineraryProposalRepository();
    const later = buildProposal(fixture, new Date("2026-08-01T16:00:00.000Z"));
    const earlier = buildProposal(fixture, new Date("2026-08-01T15:00:00.000Z"));
    const firstActivity: ProposedActivityInput = {
      proposedActivityId: randomUUID(),
      title: "Primeira atividade",
      proposedOrder: 0,
      operationType: "add",
    };
    const secondActivity: ProposedActivityInput = {
      proposedActivityId: randomUUID(),
      title: "Segunda atividade",
      proposedOrder: 1,
      operationType: "add",
    };
    const earlierReady = buildReadyProposal(earlier, [firstActivity, secondActivity]);

    try {
      await repository.create(later);
      await repository.create(earlier);
      await repository.save(earlierReady);

      const listed = await repository.listByTripId(fixture.trip.id);
      expect(listed.map(({ id }) => id)).toEqual([earlier.id, later.id]);
      expect(
        listed[0]?.proposedActivities?.map(({ proposedActivityId }) => proposedActivityId),
      ).toEqual([firstActivity.proposedActivityId, secondActivity.proposedActivityId]);
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
      const readyOtherProposal = buildReadyProposal(otherProposal);
      await repository.save(readyOtherProposal);
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
      expect(
        await getDatabase()
          .select({ id: proposedActivities.id })
          .from(proposedActivities)
          .where(eq(proposedActivities.itineraryProposalId, otherProposal.id)),
      ).toEqual([]);
    } finally {
      await cleanup(fixture.trip.id, otherFixture.trip.id);
    }
  });
});
