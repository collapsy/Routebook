import { and, asc, eq } from "drizzle-orm";

import {
  createDecision,
  DecisionRepositoryError,
  type Decision,
  type DecisionContextSnapshot,
  type DecisionEffect,
  type DecisionId,
  type DecisionOption,
  type DecisionRepository,
} from "@routebook/decision-intelligence";

import { getDatabase } from "./client";
import { decisions } from "./decision-schema";

type DecisionRow = typeof decisions.$inferSelect;

type StoredSnapshot = Readonly<{
  schemaVersion: 1;
  tripId: string;
  destinationId: string;
  tripContextVersion: number;
  capturedAt: string;
  travelerProfileVersion?: number;
  itineraryVersion?: number;
}>;

function serializeSnapshot(snapshot: DecisionContextSnapshot): StoredSnapshot {
  return {
    schemaVersion: 1,
    tripId: snapshot.tripId,
    destinationId: snapshot.destinationId,
    tripContextVersion: snapshot.tripContextVersion,
    capturedAt: snapshot.capturedAt.toISOString(),
    ...(snapshot.travelerProfileVersion !== undefined
      ? { travelerProfileVersion: snapshot.travelerProfileVersion }
      : {}),
    ...(snapshot.itineraryVersion !== undefined
      ? { itineraryVersion: snapshot.itineraryVersion }
      : {}),
  };
}

function deserializeSnapshot(value: unknown): DecisionContextSnapshot {
  const snapshot = value as StoredSnapshot;
  return {
    schemaVersion: 1,
    tripId: snapshot.tripId,
    destinationId: snapshot.destinationId,
    tripContextVersion: snapshot.tripContextVersion,
    capturedAt: new Date(snapshot.capturedAt),
    ...(snapshot.travelerProfileVersion !== undefined
      ? { travelerProfileVersion: snapshot.travelerProfileVersion }
      : {}),
    ...(snapshot.itineraryVersion !== undefined
      ? { itineraryVersion: snapshot.itineraryVersion }
      : {}),
  };
}

function rehydrateDecision(row: DecisionRow): Decision {
  return createDecision({
    id: row.id,
    tripId: row.tripId,
    ...(row.recommendationId ? { recommendationId: row.recommendationId as never } : {}),
    actorParticipantId: row.actorParticipantId,
    decidedAt: row.decidedAt,
    chosenOption: row.chosenOption as DecisionOption,
    contextSnapshot: deserializeSnapshot(row.contextSnapshot),
    effect: row.effect as DecisionEffect,
    idempotencyKey: row.idempotencyKey,
  });
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

export class DrizzleDecisionRepository implements DecisionRepository {
  async findById(id: DecisionId): Promise<Decision | null> {
    const [row] = await getDatabase()
      .select()
      .from(decisions)
      .where(eq(decisions.id, id))
      .limit(1);
    return row ? rehydrateDecision(row) : null;
  }

  async findByIdempotencyKey(
    tripId: string,
    idempotencyKey: string,
  ): Promise<Decision | null> {
    const [row] = await getDatabase()
      .select()
      .from(decisions)
      .where(and(eq(decisions.tripId, tripId), eq(decisions.idempotencyKey, idempotencyKey)))
      .limit(1);
    return row ? rehydrateDecision(row) : null;
  }

  async listByTripId(tripId: string): Promise<Decision[]> {
    const rows = await getDatabase()
      .select()
      .from(decisions)
      .where(eq(decisions.tripId, tripId))
      .orderBy(asc(decisions.decidedAt), asc(decisions.id));
    return rows.map(rehydrateDecision);
  }

  async save(decision: Decision): Promise<Decision> {
    const existing = await this.findByIdempotencyKey(decision.tripId, decision.idempotencyKey);
    if (existing) {
      return existing;
    }

    try {
      await getDatabase().insert(decisions).values({
        id: decision.id,
        tripId: decision.tripId,
        recommendationId: decision.recommendationId ?? null,
        actorParticipantId: decision.actorParticipantId,
        decidedAt: decision.decidedAt,
        type: decision.type,
        chosenOption: decision.chosenOption,
        contextSnapshot: serializeSnapshot(decision.contextSnapshot),
        effect: decision.effect,
        idempotencyKey: decision.idempotencyKey,
        createdAt: decision.decidedAt,
      });
      return decision;
    } catch (error) {
      if (isUniqueViolation(error)) {
        const repeated = await this.findByIdempotencyKey(
          decision.tripId,
          decision.idempotencyKey,
        );
        if (repeated) return repeated;
        throw new DecisionRepositoryError(
          "A chave de idempotência já foi usada por outra Decision.",
          "duplicate-idempotency-key",
          { cause: error },
        );
      }
      throw new DecisionRepositoryError(
        "Não foi possível persistir a Decision.",
        "persistence-failure",
        { cause: error },
      );
    }
  }
}
