import { asc, eq, inArray } from "drizzle-orm";

import {
  detectPlanningConflicts,
  type PlanningConflict,
  type PlanningConflictContextSnapshot,
} from "@routebook/planning-assurance";

import { getDatabase } from "./client";
import { reconcilePlanningConflictsWithDatabase } from "./planning-conflict-repository";
import { itineraries, itineraryActivities, itineraryDays, trips } from "./schema";

type DatabaseClient = ReturnType<typeof getDatabase>;

export type PlanningConflictEvaluationResult = Readonly<{
  snapshot: PlanningConflictContextSnapshot;
  activeConflicts: readonly PlanningConflict[];
}>;

export class PlanningConflictEvaluationServiceError extends Error {
  constructor(
    message: string,
    readonly code: "trip-not-found" | "itinerary-not-found" | "persistence-failure",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "PlanningConflictEvaluationServiceError";
  }
}

export async function evaluatePlanningConflicts(
  tripId: string,
  evaluatedAt: Date = new Date(),
): Promise<PlanningConflictEvaluationResult> {
  const normalizedTripId = tripId.trim();
  if (!normalizedTripId) {
    throw new PlanningConflictEvaluationServiceError(
      "Informe a Trip para avaliar PlanningConflicts.",
      "trip-not-found",
    );
  }

  try {
    return await getDatabase().transaction(async (transaction) => {
      const [trip] = await transaction
        .select()
        .from(trips)
        .where(eq(trips.id, normalizedTripId))
        .limit(1);
      if (!trip) {
        throw new PlanningConflictEvaluationServiceError(
          "A Trip informada não foi encontrada.",
          "trip-not-found",
        );
      }

      const [itinerary] = await transaction
        .select()
        .from(itineraries)
        .where(eq(itineraries.tripId, normalizedTripId))
        .limit(1);
      if (!itinerary) {
        throw new PlanningConflictEvaluationServiceError(
          "A Trip ainda não possui Itinerary para avaliação.",
          "itinerary-not-found",
        );
      }

      const dayRows = await transaction
        .select()
        .from(itineraryDays)
        .where(eq(itineraryDays.itineraryId, itinerary.id))
        .orderBy(asc(itineraryDays.position), asc(itineraryDays.id));
      const dayIds = dayRows.map((day) => day.id);
      const activityRows =
        dayIds.length === 0
          ? []
          : await transaction
              .select()
              .from(itineraryActivities)
              .where(inArray(itineraryActivities.itineraryDayId, dayIds))
              .orderBy(
                asc(itineraryActivities.itineraryDayId),
                asc(itineraryActivities.order),
                asc(itineraryActivities.id),
              );
      const activitiesByDay = new Map<string, (typeof activityRows)[number][]>();
      for (const activity of activityRows) {
        const activities = activitiesByDay.get(activity.itineraryDayId) ?? [];
        activities.push(activity);
        activitiesByDay.set(activity.itineraryDayId, activities);
      }

      const snapshot: PlanningConflictContextSnapshot = {
        schemaVersion: 1,
        tripId: trip.id,
        tripStartDate: trip.startDate,
        tripEndDate: trip.endDate,
        itineraryId: itinerary.id,
        itineraryVersion: itinerary.version,
        capturedAt: evaluatedAt,
        days: dayRows.map((day) => ({
          id: day.id,
          tripId: trip.id,
          date: day.date,
          activities: (activitiesByDay.get(day.id) ?? []).map((activity) => ({
            id: activity.id,
            tripId: trip.id,
            dayId: activity.itineraryDayId,
            scheduledDate: day.date,
            ...(activity.startTime ? { startTime: activity.startTime } : {}),
            ...(activity.durationMinutes !== null
              ? { durationMinutes: activity.durationMinutes }
              : {}),
          })),
        })),
      };
      const detectedConflicts = detectPlanningConflicts(snapshot);
      const activeConflicts = await reconcilePlanningConflictsWithDatabase(
        transaction as unknown as DatabaseClient,
        normalizedTripId,
        detectedConflicts,
        evaluatedAt,
      );

      return Object.freeze({ snapshot, activeConflicts });
    });
  } catch (error) {
    if (error instanceof PlanningConflictEvaluationServiceError) throw error;
    throw new PlanningConflictEvaluationServiceError(
      "Não foi possível avaliar os PlanningConflicts.",
      "persistence-failure",
      { cause: error },
    );
  }
}
