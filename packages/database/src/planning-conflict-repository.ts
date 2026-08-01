import { and, asc, eq } from "drizzle-orm";

import {
  createPlanningConflict,
  invalidatePlanningConflict,
  PlanningConflictRepositoryError,
  supersedePlanningConflict,
  type PlanningConflict,
  type PlanningConflictContextSnapshot,
  type PlanningConflictEvidence,
  type PlanningConflictId,
  type PlanningConflictRepository,
  type PlanningConflictSeverity,
  type PlanningConflictState,
  type PlanningConflictType,
} from "@routebook/planning-assurance";

import { getDatabase } from "./client";
import { planningConflicts } from "./planning-conflict-schema";

type PlanningConflictRow = typeof planningConflicts.$inferSelect;
type PlanningConflictDatabase = ReturnType<typeof getDatabase>;

type StoredPlanningConflictContextSnapshot = Readonly<{
  schemaVersion: 1;
  tripId: string;
  tripStartDate: string;
  tripEndDate: string;
  itineraryId: string;
  itineraryVersion: number;
  capturedAt: string;
  days: readonly Readonly<{
    id: string;
    tripId: string;
    date: string;
    activities: readonly Readonly<{
      id: string;
      tripId: string;
      dayId: string;
      scheduledDate?: string;
      startTime?: string;
      durationMinutes?: number;
    }>[];
  }>[];
}>;

function serializeContextSnapshot(
  snapshot: PlanningConflictContextSnapshot,
): StoredPlanningConflictContextSnapshot {
  return {
    schemaVersion: 1,
    tripId: snapshot.tripId,
    tripStartDate: snapshot.tripStartDate,
    tripEndDate: snapshot.tripEndDate,
    itineraryId: snapshot.itineraryId,
    itineraryVersion: snapshot.itineraryVersion,
    capturedAt: snapshot.capturedAt.toISOString(),
    days: snapshot.days.map((day) => ({
      id: day.id,
      tripId: day.tripId,
      date: day.date,
      activities: day.activities.map((activity) => ({
        id: activity.id,
        tripId: activity.tripId,
        dayId: activity.dayId,
        ...(activity.scheduledDate !== undefined ? { scheduledDate: activity.scheduledDate } : {}),
        ...(activity.startTime !== undefined ? { startTime: activity.startTime } : {}),
        ...(activity.durationMinutes !== undefined
          ? { durationMinutes: activity.durationMinutes }
          : {}),
      })),
    })),
  };
}

function deserializeContextSnapshot(value: unknown): PlanningConflictContextSnapshot {
  const snapshot = value as StoredPlanningConflictContextSnapshot;
  return {
    schemaVersion: 1,
    tripId: snapshot.tripId,
    tripStartDate: snapshot.tripStartDate,
    tripEndDate: snapshot.tripEndDate,
    itineraryId: snapshot.itineraryId,
    itineraryVersion: snapshot.itineraryVersion,
    capturedAt: new Date(snapshot.capturedAt),
    days: snapshot.days.map((day) => ({
      id: day.id,
      tripId: day.tripId,
      date: day.date,
      activities: day.activities.map((activity) => ({
        id: activity.id,
        tripId: activity.tripId,
        dayId: activity.dayId,
        ...(activity.scheduledDate !== undefined ? { scheduledDate: activity.scheduledDate } : {}),
        ...(activity.startTime !== undefined ? { startTime: activity.startTime } : {}),
        ...(activity.durationMinutes !== undefined
          ? { durationMinutes: activity.durationMinutes }
          : {}),
      })),
    })),
  };
}

function rehydratePlanningConflict(row: PlanningConflictRow): PlanningConflict {
  return createPlanningConflict({
    id: row.id,
    tripId: row.tripId,
    type: row.type as PlanningConflictType,
    severity: row.severity as PlanningConflictSeverity,
    state: row.state as PlanningConflictState,
    contextSnapshot: deserializeContextSnapshot(row.contextSnapshot),
    evidence: row.evidence as readonly PlanningConflictEvidence[],
    relatedDayIds: row.relatedDayIds as readonly string[],
    relatedActivityIds: row.relatedActivityIds as readonly string[],
    detectedAt: row.detectedAt,
    policyVersion: row.policyVersion,
    contextFingerprint: row.contextFingerprint,
    lineageKey: row.lineageKey,
    ...(row.invalidatedAt ? { invalidatedAt: row.invalidatedAt } : {}),
    ...(row.supersededAt ? { supersededAt: row.supersededAt } : {}),
    ...(row.supersededByPlanningConflictId
      ? { supersededByPlanningConflictId: row.supersededByPlanningConflictId }
      : {}),
  });
}

function insertValues(conflict: PlanningConflict) {
  return {
    id: conflict.id,
    tripId: conflict.tripId,
    type: conflict.type,
    severity: conflict.severity,
    state: conflict.state,
    contextSnapshot: serializeContextSnapshot(conflict.contextSnapshot),
    evidence: conflict.evidence,
    relatedDayIds: conflict.relatedDayIds,
    relatedActivityIds: conflict.relatedActivityIds,
    detectedAt: conflict.detectedAt,
    policyVersion: conflict.policyVersion,
    contextFingerprint: conflict.contextFingerprint,
    lineageKey: conflict.lineageKey,
    invalidatedAt: conflict.invalidatedAt ?? null,
    supersededAt: conflict.supersededAt ?? null,
    supersededByPlanningConflictId: conflict.supersededByPlanningConflictId ?? null,
    createdAt: conflict.detectedAt,
    updatedAt: conflict.invalidatedAt ?? conflict.supersededAt ?? conflict.detectedAt,
  };
}

function comparePlanningConflicts(left: PlanningConflict, right: PlanningConflict): number {
  return (
    left.type.localeCompare(right.type) ||
    left.relatedDayIds.join("|").localeCompare(right.relatedDayIds.join("|")) ||
    left.relatedActivityIds.join("|").localeCompare(right.relatedActivityIds.join("|")) ||
    left.contextFingerprint.localeCompare(right.contextFingerprint)
  );
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

export async function reconcilePlanningConflictsWithDatabase(
  database: PlanningConflictDatabase,
  tripId: string,
  detectedConflicts: readonly PlanningConflict[],
  evaluatedAt: Date,
): Promise<PlanningConflict[]> {
  const normalizedTripId = tripId.trim();
  if (!normalizedTripId) {
    throw new PlanningConflictRepositoryError(
      "Informe a Trip para reconciliar PlanningConflicts.",
      "persistence-failure",
    );
  }
  if (!(evaluatedAt instanceof Date) || Number.isNaN(evaluatedAt.getTime())) {
    throw new PlanningConflictRepositoryError(
      "Informe um instante válido para reconciliar PlanningConflicts.",
      "persistence-failure",
    );
  }

  const incomingByFingerprint = new Map<string, PlanningConflict>();
  for (const conflict of detectedConflicts) {
    if (conflict.tripId !== normalizedTripId || conflict.state !== "open") {
      throw new PlanningConflictRepositoryError(
        "PlanningConflict incompatível com a reconciliação solicitada.",
        "cross-trip",
      );
    }
    if (incomingByFingerprint.has(conflict.contextFingerprint)) {
      throw new PlanningConflictRepositoryError(
        "A avaliação produziu PlanningConflicts ativos equivalentes duplicados.",
        "duplicate-active-conflict",
      );
    }
    incomingByFingerprint.set(conflict.contextFingerprint, conflict);
  }

  const activeRows = await database
    .select()
    .from(planningConflicts)
    .where(and(eq(planningConflicts.tripId, normalizedTripId), eq(planningConflicts.state, "open")))
    .orderBy(asc(planningConflicts.type), asc(planningConflicts.contextFingerprint));
  const active = activeRows.map(rehydratePlanningConflict);
  const activeByFingerprint = new Map(
    active.map((conflict) => [conflict.contextFingerprint, conflict]),
  );
  const current: PlanningConflict[] = [];

  for (const conflict of [...detectedConflicts].sort(comparePlanningConflicts)) {
    const equivalent = activeByFingerprint.get(conflict.contextFingerprint);
    if (equivalent) {
      current.push(equivalent);
      continue;
    }

    await database.insert(planningConflicts).values(insertValues(conflict));
    current.push(conflict);
  }

  const currentByLineage = new Map(current.map((conflict) => [conflict.lineageKey, conflict]));
  for (const previous of active) {
    if (incomingByFingerprint.has(previous.contextFingerprint)) continue;

    const replacement = currentByLineage.get(previous.lineageKey);
    const terminal = replacement
      ? supersedePlanningConflict(previous, replacement.id, evaluatedAt)
      : invalidatePlanningConflict(previous, evaluatedAt);

    await database
      .update(planningConflicts)
      .set({
        state: terminal.state,
        invalidatedAt: terminal.invalidatedAt ?? null,
        supersededAt: terminal.supersededAt ?? null,
        supersededByPlanningConflictId: terminal.supersededByPlanningConflictId ?? null,
        updatedAt: evaluatedAt,
      })
      .where(eq(planningConflicts.id, previous.id));
  }

  return current.sort(comparePlanningConflicts);
}

export class DrizzlePlanningConflictRepository implements PlanningConflictRepository {
  async findByIdForTrip(id: PlanningConflictId, tripId: string): Promise<PlanningConflict | null> {
    const [row] = await getDatabase()
      .select()
      .from(planningConflicts)
      .where(eq(planningConflicts.id, id))
      .limit(1);
    if (!row) return null;
    if (row.tripId !== tripId.trim()) {
      throw new PlanningConflictRepositoryError(
        "O PlanningConflict não pertence à Trip informada.",
        "cross-trip",
      );
    }
    return rehydratePlanningConflict(row);
  }

  async listByTripId(tripId: string): Promise<PlanningConflict[]> {
    const rows = await getDatabase()
      .select()
      .from(planningConflicts)
      .where(eq(planningConflicts.tripId, tripId.trim()))
      .orderBy(
        asc(planningConflicts.detectedAt),
        asc(planningConflicts.type),
        asc(planningConflicts.id),
      );
    return rows.map(rehydratePlanningConflict);
  }

  async listActiveByTripId(tripId: string): Promise<PlanningConflict[]> {
    const rows = await getDatabase()
      .select()
      .from(planningConflicts)
      .where(and(eq(planningConflicts.tripId, tripId.trim()), eq(planningConflicts.state, "open")))
      .orderBy(asc(planningConflicts.type), asc(planningConflicts.contextFingerprint));
    return rows.map(rehydratePlanningConflict);
  }

  async reconcile(
    tripId: string,
    detectedConflicts: readonly PlanningConflict[],
    evaluatedAt: Date,
  ): Promise<PlanningConflict[]> {
    try {
      return await getDatabase().transaction(async (transaction) =>
        reconcilePlanningConflictsWithDatabase(
          transaction as unknown as PlanningConflictDatabase,
          tripId,
          detectedConflicts,
          evaluatedAt,
        ),
      );
    } catch (error) {
      if (error instanceof PlanningConflictRepositoryError) throw error;
      if (isUniqueViolation(error)) {
        throw new PlanningConflictRepositoryError(
          "Já existe um PlanningConflict ativo equivalente.",
          "duplicate-active-conflict",
          { cause: error },
        );
      }
      throw new PlanningConflictRepositoryError(
        "Não foi possível persistir os PlanningConflicts.",
        "persistence-failure",
        { cause: error },
      );
    }
  }
}
