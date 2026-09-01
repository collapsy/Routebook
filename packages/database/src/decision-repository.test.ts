import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

import { createDecision } from "@routebook/decision-intelligence";
import { createTrip } from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import { createPostgresDecisionRepository, DrizzleDecisionRepository } from "./decision-repository";
import { trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

afterAll(async () => {
  await closeDatabase();
});

function decision(tripId: string, idempotencyKey: string, id = randomUUID()) {
  const decidedAt = new Date("2026-08-02T14:00:00.000Z");
  return createDecision({
    id,
    tripId,
    actorParticipantId: "participant-1",
    decidedAt,
    chosenOption: {
      type: "ignore-planning-risk",
      planningConflictId: "conflict-1",
    },
    contextSnapshot: {
      schemaVersion: 1,
      tripId,
      planningConflictId: "conflict-1",
      planningConflictContextFingerprint: "a".repeat(64),
      itineraryId: "itinerary-1",
      itineraryVersion: 1,
      policyVersion: "1.0.0",
      capturedAt: decidedAt,
    },
    effect: {
      type: "planning-conflict-ignored",
      planningConflictId: "conflict-1",
    },
    idempotencyKey,
  });
}

function trip(name: string) {
  return createTrip({
    name,
    destination: {
      name: "Pipa, Tibau do Sul - RN",
      type: "district",
      countryCode: "BR",
      latitude: -6.2302,
      longitude: -35.0503,
      timeZone: "America/Fortaleza",
    },
    startDate: "2026-08-22",
    endDate: "2026-08-23",
    ownerName: "RouteBook QA",
  });
}

describe("DrizzleDecisionRepository", () => {
  it("preserva persistência, leitura, ordenação e idempotência no modo global", async () => {
    const currentTrip = trip("Decision global");
    const database = getDatabase();
    const repository = new DrizzleDecisionRepository();
    const first = decision(currentTrip.id, `decision-global-${currentTrip.id}`);
    const repeated = decision(currentTrip.id, first.idempotencyKey);

    await new DrizzleTripRepository().create(currentTrip);
    try {
      expect(await repository.save(first)).toEqual(first);
      expect(await repository.findById(first.id)).toEqual(first);
      expect(await repository.findByIdempotencyKey(currentTrip.id, first.idempotencyKey)).toEqual(
        first,
      );
      expect(await repository.save(repeated)).toEqual(first);
      expect(await repository.listByTripId(currentTrip.id)).toEqual([first]);
    } finally {
      await database.delete(trips).where(eq(trips.id, currentTrip.id));
    }
  });

  it("usa somente o executor escopado e participa do rollback externo", async () => {
    const currentTrip = trip("Decision transacional");
    const database = getDatabase();
    const persisted = decision(currentTrip.id, `decision-transaction-${currentTrip.id}`);
    const repeated = decision(currentTrip.id, persisted.idempotencyKey);
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
          expect(
            await repository.findByIdempotencyKey(currentTrip.id, persisted.idempotencyKey),
          ).toEqual(persisted);
          expect(await repository.save(repeated)).toEqual(persisted);
          expect(await repository.listByTripId(currentTrip.id)).toEqual([persisted]);
          expect(nestedTransaction).not.toHaveBeenCalled();
          throw rollback;
        }),
      ).rejects.toBe(rollback);

      expect(await new DrizzleDecisionRepository().findById(persisted.id)).toBeNull();
    } finally {
      await database.delete(trips).where(eq(trips.id, currentTrip.id));
    }
  });

  it("rejeita executor escopado inválido", () => {
    expect(() => createPostgresDecisionRepository(undefined as never)).toThrowError(TypeError);
    expect(() =>
      createPostgresDecisionRepository({
        select() {},
      } as never),
    ).toThrowError(TypeError);
  });
});
