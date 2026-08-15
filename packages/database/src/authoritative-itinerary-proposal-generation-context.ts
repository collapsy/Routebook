import { asc, eq, inArray } from "drizzle-orm";

import type {
  AuthoritativeItineraryProposalGenerationContext,
  AuthoritativeItineraryProposalGenerationContextPort,
  ItineraryProposalSourcePlace,
  ItineraryProposalSourceRecommendation,
  LoadAuthoritativeItineraryProposalGenerationContextInput,
} from "@routebook/proposal-management";

import { getDatabase } from "./client";
import {
  itineraries,
  itineraryActivities,
  itineraryDays,
  itineraryFreePeriods,
  places,
  recommendations,
  trips,
} from "./schema";

type Database = ReturnType<typeof getDatabase>;
type ReadExecutor = Pick<Database, "select">;
type RecommendationRow = typeof recommendations.$inferSelect;

export type PostgresAuthoritativeItineraryProposalGenerationContextErrorCode =
  | "invalid-trip-id"
  | "invalid-as-of"
  | "trip-not-found"
  | "itinerary-not-found"
  | "itinerary-days-not-found"
  | "context-inconsistent";

export class PostgresAuthoritativeItineraryProposalGenerationContextError extends Error {
  constructor(
    message: string,
    readonly code: PostgresAuthoritativeItineraryProposalGenerationContextErrorCode,
  ) {
    super(message);
    this.name = "PostgresAuthoritativeItineraryProposalGenerationContextError";
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireTripId(value: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!uuidPattern.test(normalized)) {
    throw new PostgresAuthoritativeItineraryProposalGenerationContextError(
      "Informe um TripId UUID válido.",
      "invalid-trip-id",
    );
  }
  return normalized;
}

function requireAsOf(value: Date): Date {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new PostgresAuthoritativeItineraryProposalGenerationContextError(
      "Informe um instante asOf válido.",
      "invalid-as-of",
    );
  }
  return new Date(value.getTime());
}

function firstRecommendationReason(row: RecommendationRow): string | undefined {
  if (!Array.isArray(row.reasons)) return undefined;

  for (const value of row.reasons) {
    if (!value || typeof value !== "object") continue;
    const message = Reflect.get(value, "message");
    if (typeof message === "string" && message.trim()) return message.trim();
  }

  return undefined;
}

async function loadContext(
  database: ReadExecutor,
  input: LoadAuthoritativeItineraryProposalGenerationContextInput,
): Promise<AuthoritativeItineraryProposalGenerationContext> {
  const tripId = requireTripId(input.tripId);
  requireAsOf(input.asOf);

  const [trip] = await database
    .select({ id: trips.id })
    .from(trips)
    .where(eq(trips.id, tripId))
    .limit(1);
  if (!trip) {
    throw new PostgresAuthoritativeItineraryProposalGenerationContextError(
      "A Trip solicitada não existe.",
      "trip-not-found",
    );
  }

  const [itinerary] = await database
    .select({ id: itineraries.id, tripId: itineraries.tripId })
    .from(itineraries)
    .where(eq(itineraries.tripId, tripId))
    .limit(1);
  if (!itinerary) {
    throw new PostgresAuthoritativeItineraryProposalGenerationContextError(
      "A Trip não possui Itinerary autoritativo.",
      "itinerary-not-found",
    );
  }

  const dayRows = await database
    .select({
      id: itineraryDays.id,
      date: itineraryDays.date,
      position: itineraryDays.position,
    })
    .from(itineraryDays)
    .where(eq(itineraryDays.itineraryId, itinerary.id))
    .orderBy(asc(itineraryDays.position), asc(itineraryDays.date), asc(itineraryDays.id));
  if (dayRows.length === 0) {
    throw new PostgresAuthoritativeItineraryProposalGenerationContextError(
      "O Itinerary autoritativo não possui Dias.",
      "itinerary-days-not-found",
    );
  }

  const dayIds = dayRows.map((day) => day.id);
  const activityRows = await database
    .select({
      id: itineraryActivities.id,
      itineraryDayId: itineraryActivities.itineraryDayId,
      order: itineraryActivities.order,
      placeId: itineraryActivities.placeId,
    })
    .from(itineraryActivities)
    .where(inArray(itineraryActivities.itineraryDayId, dayIds))
    .orderBy(
      asc(itineraryActivities.itineraryDayId),
      asc(itineraryActivities.order),
      asc(itineraryActivities.id),
    );
  const activitiesByDay = new Map<string, readonly Readonly<{ activityId: string }>[]>();
  for (const row of activityRows) {
    const activities = [...(activitiesByDay.get(row.itineraryDayId) ?? [])];
    activities.push(Object.freeze({ activityId: row.id }));
    activitiesByDay.set(row.itineraryDayId, Object.freeze(activities));
  }

  const freePeriodRows = await database
    .select({
      id: itineraryFreePeriods.id,
      itineraryDayId: itineraryFreePeriods.itineraryDayId,
      mode: itineraryFreePeriods.mode,
      order: itineraryFreePeriods.order,
    })
    .from(itineraryFreePeriods)
    .where(inArray(itineraryFreePeriods.itineraryDayId, dayIds))
    .orderBy(
      asc(itineraryFreePeriods.itineraryDayId),
      asc(itineraryFreePeriods.order),
      asc(itineraryFreePeriods.id),
    );
  const freePeriodsByDay = new Map<
    string,
    readonly Readonly<{ freePeriodId: string; mode: string }>[]
  >();
  for (const row of freePeriodRows) {
    const freePeriods = [...(freePeriodsByDay.get(row.itineraryDayId) ?? [])];
    freePeriods.push(Object.freeze({ freePeriodId: row.id, mode: row.mode }));
    freePeriodsByDay.set(row.itineraryDayId, Object.freeze(freePeriods));
  }

  const plannedPlaceIds = new Set(
    activityRows.flatMap((activity) => (activity.placeId ? [activity.placeId] : [])),
  );

  const allRecommendationRows = await database
    .select()
    .from(recommendations)
    .where(eq(recommendations.tripId, tripId))
    .orderBy(asc(recommendations.generatedAt), asc(recommendations.id));
  const recommendationRows = allRecommendationRows.filter(
    (recommendation) => !plannedPlaceIds.has(recommendation.placeId),
  );
  const placeIds = [...new Set(recommendationRows.map((recommendation) => recommendation.placeId))];
  const placeRows =
    placeIds.length === 0
      ? []
      : await database
          .select({
            id: places.id,
            name: places.name,
            summary: places.summary,
          })
          .from(places)
          .where(inArray(places.id, placeIds))
          .orderBy(asc(places.id));

  if (placeRows.length !== placeIds.length) {
    throw new PostgresAuthoritativeItineraryProposalGenerationContextError(
      "O contexto autoritativo possui Recommendation sem Place correspondente.",
      "context-inconsistent",
    );
  }

  const sourceRecommendations: readonly ItineraryProposalSourceRecommendation[] = Object.freeze(
    recommendationRows.map((row) => {
      const reason = firstRecommendationReason(row);
      return Object.freeze({
        recommendationId: row.id,
        tripId: row.tripId,
        placeId: row.placeId,
        status: row.status,
        score: row.score,
        validFrom: new Date(row.validFrom.getTime()),
        ...(row.expiresAt ? { expiresAt: new Date(row.expiresAt.getTime()) } : {}),
        ...(reason ? { reason } : {}),
      });
    }),
  );
  const sourcePlaces: readonly ItineraryProposalSourcePlace[] = Object.freeze(
    placeRows.map((row) =>
      Object.freeze({
        placeId: row.id,
        title: row.name,
        ...(row.summary.trim() ? { description: row.summary } : {}),
      }),
    ),
  );

  return Object.freeze({
    itinerary: Object.freeze({
      tripId: itinerary.tripId,
      days: Object.freeze(
        dayRows.map((day) =>
          Object.freeze({
            tripDayId: day.id,
            date: day.date,
            activities: activitiesByDay.get(day.id) ?? Object.freeze([]),
            freePeriods: freePeriodsByDay.get(day.id) ?? Object.freeze([]),
          }),
        ),
      ),
    }),
    recommendations: sourceRecommendations,
    places: sourcePlaces,
  });
}

export class PostgresAuthoritativeItineraryProposalGenerationContextPort implements AuthoritativeItineraryProposalGenerationContextPort {
  constructor(private readonly database: Database = getDatabase()) {}

  async load(
    input: LoadAuthoritativeItineraryProposalGenerationContextInput,
  ): Promise<AuthoritativeItineraryProposalGenerationContext> {
    requireTripId(input.tripId);
    requireAsOf(input.asOf);

    return this.database.transaction((transaction) => loadContext(transaction, input), {
      isolationLevel: "repeatable read",
      accessMode: "read only",
    });
  }
}

export function createPostgresAuthoritativeItineraryProposalGenerationContextPort(
  database: Database = getDatabase(),
): PostgresAuthoritativeItineraryProposalGenerationContextPort {
  return new PostgresAuthoritativeItineraryProposalGenerationContextPort(database);
}
