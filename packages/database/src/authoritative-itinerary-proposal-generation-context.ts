import { asc, eq, inArray } from "drizzle-orm";

import type {
  AuthoritativeItineraryProposalGenerationContext,
  AuthoritativeItineraryProposalGenerationContextPort,
  ItineraryProposalSourcePlace,
  ItineraryProposalSourcePreference,
  LoadAuthoritativeItineraryProposalGenerationContextInput,
} from "@routebook/proposal-management";

import { getDatabase } from "./client";
import {
  itineraries,
  itineraryActivities,
  itineraryDays,
  itineraryFreePeriods,
  places,
  savedPlaces,
  trips,
} from "./schema";

type Database = ReturnType<typeof getDatabase>;
type ReadExecutor = Pick<Database, "select">;

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

function isActivePlannedActivityStatus(status: string): boolean {
  return status !== "removed" && status !== "cancelled";
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
      status: itineraryActivities.status,
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
    activityRows.flatMap((activity) =>
      activity.placeId && isActivePlannedActivityStatus(activity.status) ? [activity.placeId] : [],
    ),
  );

  const allPreferenceRows = await database
    .select({
      id: savedPlaces.id,
      tripId: savedPlaces.tripId,
      placeId: savedPlaces.placeId,
      intent: savedPlaces.intent,
      priority: savedPlaces.priority,
      createdAt: savedPlaces.createdAt,
    })
    .from(savedPlaces)
    .where(eq(savedPlaces.tripId, tripId))
    .orderBy(asc(savedPlaces.createdAt), asc(savedPlaces.id));
  const preferenceRows = allPreferenceRows.filter(
    (preference) => !plannedPlaceIds.has(preference.placeId),
  );
  const placeIds = [...new Set(preferenceRows.map((preference) => preference.placeId))];
  const placeRows =
    placeIds.length === 0
      ? []
      : await database
          .select({
            id: places.id,
            name: places.name,
            summary: places.summary,
            category: places.category,
            latitude: places.latitude,
            longitude: places.longitude,
          })
          .from(places)
          .where(inArray(places.id, placeIds))
          .orderBy(asc(places.id));

  if (placeRows.length !== placeIds.length) {
    throw new PostgresAuthoritativeItineraryProposalGenerationContextError(
      "O contexto autoritativo possui TripPlacePreference sem Place correspondente.",
      "context-inconsistent",
    );
  }

  const sourcePreferences: readonly ItineraryProposalSourcePreference[] = Object.freeze(
    preferenceRows.map((row) =>
      Object.freeze({
        preferenceId: row.id,
        tripId: row.tripId,
        placeId: row.placeId,
        intent: row.intent as ItineraryProposalSourcePreference["intent"],
        priority: row.priority as ItineraryProposalSourcePreference["priority"],
      }),
    ),
  );
  const sourcePlaces: readonly ItineraryProposalSourcePlace[] = Object.freeze(
    placeRows.map((row) =>
      Object.freeze({
        placeId: row.id,
        title: row.name,
        ...(row.summary.trim() ? { description: row.summary } : {}),
        category: row.category,
        latitude: row.latitude,
        longitude: row.longitude,
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
    preferences: sourcePreferences,
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
