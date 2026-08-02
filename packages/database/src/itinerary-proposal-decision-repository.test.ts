import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

import { createDecision } from "@routebook/decision-intelligence";
import { createTrip } from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import {
  createPostgresDecisionRepository,
  DrizzleDecisionRepository,
} from "./decision-repository";
import { decisions } from "./decision-schema";
import { trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

const decidedAt = new Date("2026-08-02T16:00:00.000Z");

function trip(name: string) {
  return createTrip({
    name,
    startDate: "2026-08-22",
    endDate: "2026-08-23",
    ownerName: "RouteBook QA",
  });
}

function acceptanceDecision(
  tripId: string,
  idempotencyKey: string,
  id = randomUUID(),
) {
  return createDecision({
    id,
    tripId,
    actorParticipantId: "participant-owner",
    decidedAt,
    chosenOption: {
      type: "accept-itinerary-proposal",
      itineraryProposalId: "proposal-1",
      proposedActivityIds: ["proposed-1", "proposed-2"],
    },
    contextSnapshot: {
      schemaVersion: 1,
      tripId,
      itineraryId: "itinerary-1",
      itineraryProposalId: "proposal-1",
      baseItineraryVersion: 7,
      requestFingerprint: "a".repeat(64),
      capturedAt: decidedAt,
    },
    effect: {
      type: "itinerary-proposal-applied",
      proposalApplicationId: "application-1",
      itineraryId: "itinerary-1",
      resultingItineraryVersion: 8,
      appliedProposedActivityIds: ["proposed-1", "proposed-2"],
    },
    idempotencyKey,
  });
}

afterAll(async () => {
  await closeDatabase();
});

describe("Itinerary Proposal acceptance Decision persistence", () => {
  it("preserva option, snapshot, effect, datas, listagem e replay idempotente", async () => {
    const currentTrip = trip("Persistência da Decision de aceite");
    const database = getDatabase();
    const repository = new DrizzleDecisionRepository();
    const persisted = acceptanceDecision(
      currentTrip.id,
      `accept-proposal-${currentTrip.id}`,
    );
    const repeated = acceptanceDecision(
      currentTrip.id,
      persisted.idempotencyKey,
    );

    await new DrizzleTripRepository().create(currentTrip);
    try {
      expect(await repository.save(persisted)).toEqual(persisted);
      expect(await repository.findById(persisted.id)).toEqual(persisted);
      expect(
        await repository.findByIdempotencyKey(
          currentTrip.id,
          persisted.idempotencyKey,
        ),
      ).toEqual(persisted);
      expect(await repository.save(repeated)).toEqual(persisted);
      expect(await repository.listByTripId(currentTrip.id)).toEqual([persisted]);
    } finally {
      await database.delete(trips).where(eq(trips.id, currentTrip.id));
    }
  });

  it("usa o executor escopado e remove a Decision no rollback externo", async () => {
    const currentTrip = trip("Rollback da Decision de aceite");
    const database = getDatabase();
    const persisted = acceptanceDecision(
      currentTrip.id,
      `accept-proposal-rollback-${currentTrip.id}`,
    );
    const rollback = new Error("rollback intencional");

    await new DrizzleTripRepository().create(currentTrip);
    try {
      await expect(
        database.transaction(async (transaction) => {
          const nestedTransaction = vi.fn();
          const executor = {
            select: transaction.select.bind(transaction),
            insert: transaction.insert.bind(transaction),
            transaction: nestedTransaction,
          };
          const repository = createPostgresDecisionRepository(executor);

          expect(await repository.save(persisted)).toEqual(persisted);
          expect(await repository.findById(persisted.id)).toEqual(persisted);
          expect(nestedTransaction).not.toHaveBeenCalled();
          throw rollback;
        }),
      ).rejects.toBe(rollback);

      expect(await new DrizzleDecisionRepository().findById(persisted.id)).toBeNull();
    } finally {
      await database.delete(trips).where(eq(trips.id, currentTrip.id));
    }
  });

  it("mantém o check constraint rejeitando tipos desconhecidos", async () => {
    const currentTrip = trip("Check da Decision de aceite");
    const database = getDatabase();

    await new DrizzleTripRepository().create(currentTrip);
    try {
      await expect(
        database.insert(decisions).values({
          id: randomUUID(),
          tripId: currentTrip.id,
          recommendationId: null,
          actorParticipantId: "participant-owner",
          decidedAt,
          type: "unsupported-decision",
          chosenOption: {},
          contextSnapshot: {},
          effect: {},
          idempotencyKey: `unsupported-${currentTrip.id}`,
          createdAt: decidedAt,
        }),
      ).rejects.toMatchObject({ code: "23514" });
    } finally {
      await database.delete(trips).where(eq(trips.id, currentTrip.id));
    }
  });
});
