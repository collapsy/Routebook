import { and, eq } from "drizzle-orm";

import {
  createDecision,
  type Decision,
  type IgnorePlanningRiskDecisionOption,
} from "@routebook/decision-intelligence";
import {
  createPlanningConflictId,
  ignorePlanningRisk as transitionPlanningRiskToIgnored,
  PlanningConflictTransitionError,
  type PlanningConflict,
} from "@routebook/planning-assurance";
import type { TripParticipant } from "@routebook/trip-management";

import { getDatabase } from "./client";
import { decisions } from "./decision-schema";
import { rehydrateDecision, serializeDecisionSnapshot } from "./decision-repository";
import { planningConflicts } from "./planning-conflict-schema";
import { rehydratePlanningConflict } from "./planning-conflict-repository";
import { trips } from "./schema";

export type IgnorePlanningRiskCommand = Readonly<{
  tripId: string;
  planningConflictId: string;
  idempotencyKey: string;
  decidedAt?: Date;
}>;

export type IgnorePlanningRiskResult = Readonly<{
  decision: Decision;
  conflict: PlanningConflict;
}>;

export class PlanningRiskDecisionServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | "planning-conflict-not-found"
      | "cross-trip"
      | "not-risk"
      | "invalid-state"
      | "owner-not-found"
      | "idempotency-conflict"
      | "persistence-failure",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "PlanningRiskDecisionServiceError";
  }
}

type PlanningRiskDatabase = ReturnType<typeof getDatabase>;

function required(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new PlanningRiskDecisionServiceError(
      `Informe ${field} para ignorar o Risco.`,
      "persistence-failure",
    );
  }
  return normalized;
}

function validDate(value: Date): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new PlanningRiskDecisionServiceError(
      "Informe um instante válido para ignorar o Risco.",
      "persistence-failure",
    );
  }
  return new Date(value.getTime());
}

function ownerFrom(participants: unknown): TripParticipant {
  const owner = (participants as TripParticipant[]).find(
    (participant) => participant.role === "owner",
  );
  if (!owner?.userId.trim()) {
    throw new PlanningRiskDecisionServiceError(
      "A Viagem não possui um Organizador autorizado.",
      "owner-not-found",
    );
  }
  return owner;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

function assertEquivalentDecision(
  decision: Decision,
  planningConflictId: string,
): asserts decision is Decision & {
  chosenOption: IgnorePlanningRiskDecisionOption;
} {
  if (
    decision.type !== "ignore-planning-risk" ||
    decision.chosenOption.type !== "ignore-planning-risk" ||
    decision.chosenOption.planningConflictId !== planningConflictId
  ) {
    throw new PlanningRiskDecisionServiceError(
      "A chave de idempotência já foi usada por outra decisão.",
      "idempotency-conflict",
    );
  }
}

async function loadConflict(
  database: PlanningRiskDatabase,
  tripId: string,
  planningConflictId: string,
): Promise<PlanningConflict> {
  const [row] = await database
    .select()
    .from(planningConflicts)
    .where(eq(planningConflicts.id, createPlanningConflictId(planningConflictId)))
    .limit(1);
  if (!row) {
    throw new PlanningRiskDecisionServiceError(
      "O Conflito de Planejamento não existe.",
      "planning-conflict-not-found",
    );
  }
  if (row.tripId !== tripId) {
    throw new PlanningRiskDecisionServiceError(
      "O Conflito de Planejamento não pertence a esta Viagem.",
      "cross-trip",
    );
  }
  return rehydratePlanningConflict(row);
}

async function existingDecision(
  database: PlanningRiskDatabase,
  tripId: string,
  idempotencyKey: string,
): Promise<Decision | null> {
  const [row] = await database
    .select()
    .from(decisions)
    .where(and(eq(decisions.tripId, tripId), eq(decisions.idempotencyKey, idempotencyKey)))
    .limit(1);
  return row ? rehydrateDecision(row) : null;
}

async function repeatedResult(
  database: PlanningRiskDatabase,
  command: Required<
    Pick<IgnorePlanningRiskCommand, "tripId" | "planningConflictId" | "idempotencyKey">
  >,
): Promise<IgnorePlanningRiskResult | null> {
  const decision = await existingDecision(database, command.tripId, command.idempotencyKey);
  if (!decision) return null;
  assertEquivalentDecision(decision, command.planningConflictId);
  const conflict = await loadConflict(database, command.tripId, command.planningConflictId);
  if (
    (conflict.state !== "ignored" &&
      conflict.state !== "invalidated" &&
      conflict.state !== "superseded") ||
    conflict.ignoredDecisionId !== decision.id
  ) {
    throw new PlanningRiskDecisionServiceError(
      "A decisão idempotente não está correlacionada ao Risco ignorado.",
      "persistence-failure",
    );
  }
  return Object.freeze({ decision, conflict });
}

export async function ignorePlanningRisk(
  command: IgnorePlanningRiskCommand,
): Promise<IgnorePlanningRiskResult> {
  const normalized = {
    tripId: required(command.tripId, "a Trip"),
    planningConflictId: required(command.planningConflictId, "o PlanningConflict"),
    idempotencyKey: required(command.idempotencyKey, "a chave de idempotência"),
  };
  const decidedAt = validDate(command.decidedAt ?? new Date());
  const database = getDatabase();

  try {
    return await database.transaction(async (transaction) => {
      const transactionalDatabase = transaction as unknown as PlanningRiskDatabase;
      const repeated = await repeatedResult(transactionalDatabase, normalized);
      if (repeated) return repeated;

      const [trip] = await transaction
        .select()
        .from(trips)
        .where(eq(trips.id, normalized.tripId))
        .limit(1);
      if (!trip) {
        throw new PlanningRiskDecisionServiceError("A Viagem não existe.", "cross-trip");
      }
      const owner = ownerFrom(trip.participants);
      const conflict = await loadConflict(
        transactionalDatabase,
        normalized.tripId,
        normalized.planningConflictId,
      );

      const decision = createDecision({
        tripId: normalized.tripId,
        actorParticipantId: owner.userId,
        decidedAt,
        chosenOption: {
          type: "ignore-planning-risk",
          planningConflictId: conflict.id,
        },
        contextSnapshot: {
          schemaVersion: 1,
          tripId: normalized.tripId,
          planningConflictId: conflict.id,
          planningConflictContextFingerprint: conflict.contextFingerprint,
          itineraryId: conflict.contextSnapshot.itineraryId,
          itineraryVersion: conflict.contextSnapshot.itineraryVersion,
          policyVersion: conflict.policyVersion,
          capturedAt: conflict.contextSnapshot.capturedAt,
        },
        effect: {
          type: "planning-conflict-ignored",
          planningConflictId: conflict.id,
        },
        idempotencyKey: normalized.idempotencyKey,
      });
      const ignored = transitionPlanningRiskToIgnored(conflict, decision.id, decidedAt);

      await transaction.insert(decisions).values({
        id: decision.id,
        tripId: decision.tripId,
        recommendationId: null,
        actorParticipantId: decision.actorParticipantId,
        decidedAt: decision.decidedAt,
        type: decision.type,
        chosenOption: decision.chosenOption,
        contextSnapshot: serializeDecisionSnapshot(decision.contextSnapshot),
        effect: decision.effect,
        idempotencyKey: decision.idempotencyKey,
        createdAt: decision.decidedAt,
      });
      const updated = await transaction
        .update(planningConflicts)
        .set({
          state: ignored.state,
          ignoredAt: ignored.ignoredAt,
          ignoredDecisionId: ignored.ignoredDecisionId,
          updatedAt: decidedAt,
        })
        .where(
          and(
            eq(planningConflicts.id, conflict.id),
            eq(planningConflicts.tripId, normalized.tripId),
            eq(planningConflicts.state, "open"),
          ),
        )
        .returning({ id: planningConflicts.id });
      if (updated.length !== 1) {
        throw new PlanningRiskDecisionServiceError(
          "O estado do Conflito mudou antes da confirmação.",
          "invalid-state",
        );
      }

      return Object.freeze({ decision, conflict: ignored });
    });
  } catch (error) {
    if (error instanceof PlanningRiskDecisionServiceError) throw error;
    if (error instanceof PlanningConflictTransitionError) {
      throw new PlanningRiskDecisionServiceError(
        error.message,
        error.code === "not-risk" ? "not-risk" : "invalid-state",
        { cause: error },
      );
    }
    if (isUniqueViolation(error)) {
      const repeated = await repeatedResult(database, normalized);
      if (repeated) return repeated;
    }
    throw new PlanningRiskDecisionServiceError(
      "Não foi possível ignorar o Risco de Planejamento.",
      "persistence-failure",
      { cause: error },
    );
  }
}
