import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

import type { DecisionId } from "@routebook/decision-intelligence";
import { createAcceptItineraryProposalCommand } from "@routebook/proposal-management";
import { createTrip } from "@routebook/trip-management";

import { closeDatabase, getDatabase } from "./client";
import { DrizzleDecisionRepository } from "./decision-repository";
import { createDecisionTransactionFragment } from "./decision-transaction-fragment";
import { trips } from "./schema";
import { DrizzleTripRepository } from "./trip-repository";

const decidedAt = new Date("2026-08-02T20:00:00.000Z");

function command(tripId: string, idempotencyKey: string) {
  return createAcceptItineraryProposalCommand({
    tripId,
    itineraryId: "itinerary-1",
    itineraryProposalId: "proposal-1",
    expectedItineraryVersion: 7,
    idempotencyKey,
    actorType: "participant",
    actorId: "participant-owner",
    decidedAt,
    items: [
      {
        proposedActivityId: "proposed-1",
        targetTripDayId: "day-1",
        title: "Praia do Amor",
        operationType: "add",
        flexibility: "suggested",
      },
      {
        proposedActivityId: "proposed-2",
        targetTripDayId: "day-1",
        title: "Baía dos Golfinhos",
        operationType: "add",
        flexibility: "suggested",
      },
    ],
  });
}

function trip(name: string) {
  return createTrip({
    name,
    startDate: "2026-08-22",
    endDate: "2026-08-23",
    ownerName: "RouteBook QA",
  });
}

afterAll(async () => {
  await closeDatabase();
});

describe("Decision transaction fragment with PostgreSQL", () => {
  it("persiste e reproduz a Decision pelo executor escopado sem nested transaction", async () => {
    const currentTrip = trip("Fragment de Decision de aceite");
    const database = getDatabase();
    const decisionId = randomUUID() as DecisionId;
    const idempotencyKey = `accept-fragment-${currentTrip.id}`;

    await new DrizzleTripRepository().create(currentTrip);
    try {
      await database.transaction(async (transaction) => {
        const nestedTransaction = vi.fn();
        const executor = {
          select: transaction.select.bind(transaction),
          insert: transaction.insert.bind(transaction),
          transaction: nestedTransaction,
        };
        const fragment = createDecisionTransactionFragment(executor);
        const input = {
          command: command(currentTrip.id, idempotencyKey),
          proposalApplicationId: "application-1",
          actorParticipantId: "participant-owner",
          resultingItineraryVersion: 8,
          appliedProposedActivityIds: ["proposed-1", "proposed-2"],
          decisionId,
        } as const;

        const persisted = await fragment.persist(input);
        const replayed = await fragment.persist({ ...input, decisionId: randomUUID() });

        expect(persisted.id).toBe(decisionId);
        expect(replayed).toEqual(persisted);
        expect(nestedTransaction).not.toHaveBeenCalled();
      });

      expect(await new DrizzleDecisionRepository().findById(decisionId)).toMatchObject({
        id: decisionId,
        tripId: currentTrip.id,
        idempotencyKey,
        effect: {
          proposalApplicationId: "application-1",
          resultingItineraryVersion: 8,
          appliedProposedActivityIds: ["proposed-1", "proposed-2"],
        },
      });
    } finally {
      await database.delete(trips).where(eq(trips.id, currentTrip.id));
    }
  });

  it("participa do rollback externo integral", async () => {
    const currentTrip = trip("Rollback do fragment de Decision");
    const database = getDatabase();
    const decisionId = randomUUID() as DecisionId;
    const rollback = new Error("rollback intencional");

    await new DrizzleTripRepository().create(currentTrip);
    try {
      await expect(
        database.transaction(async (transaction) => {
          const fragment = createDecisionTransactionFragment({
            select: transaction.select.bind(transaction),
            insert: transaction.insert.bind(transaction),
          });

          await fragment.persist({
            command: command(currentTrip.id, `rollback-${currentTrip.id}`),
            proposalApplicationId: "application-rollback",
            actorParticipantId: "participant-owner",
            resultingItineraryVersion: 8,
            appliedProposedActivityIds: ["proposed-1", "proposed-2"],
            decisionId,
          });
          throw rollback;
        }),
      ).rejects.toBe(rollback);

      expect(await new DrizzleDecisionRepository().findById(decisionId)).toBeNull();
    } finally {
      await database.delete(trips).where(eq(trips.id, currentTrip.id));
    }
  });
});
