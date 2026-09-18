import { and, asc, eq } from "drizzle-orm";

import {
  TRIP_PLACE_INTENTS,
  TRIP_PLACE_PRIORITIES,
  type TripPlaceIntent,
  type TripPlacePreference,
  type TripPlacePreferenceRepository,
  type TripPlacePriority,
} from "@routebook/trip-collection";

import { getDatabase } from "./client";
import { savedPlaces } from "./schema";

type TripPlacePreferenceRow = typeof savedPlaces.$inferSelect;

function isIntent(value: string): value is TripPlaceIntent {
  return TRIP_PLACE_INTENTS.includes(value as TripPlaceIntent);
}

function isPriority(value: string): value is TripPlacePriority {
  return TRIP_PLACE_PRIORITIES.includes(value as TripPlacePriority);
}

function mapTripPlacePreference(row: TripPlacePreferenceRow): TripPlacePreference {
  if (!isIntent(row.intent)) {
    throw new Error(`Intent persistido inválido em TripPlacePreference: ${row.intent}`);
  }
  if (row.priority !== null && !isPriority(row.priority)) {
    throw new Error(`Prioridade persistida inválida em TripPlacePreference: ${row.priority}`);
  }
  if (row.priority === "MUST_DO" && row.intent !== "WANT") {
    throw new Error("MUST_DO persistido sem WANT em TripPlacePreference.");
  }

  return {
    id: row.id,
    tripId: row.tripId,
    placeId: row.placeId,
    intent: row.intent,
    priority: row.priority,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleTripPlacePreferenceRepository implements TripPlacePreferenceRepository {
  async find(tripId: string, placeId: string): Promise<TripPlacePreference | null> {
    const [row] = await getDatabase()
      .select()
      .from(savedPlaces)
      .where(and(eq(savedPlaces.tripId, tripId), eq(savedPlaces.placeId, placeId)))
      .limit(1);

    return row ? mapTripPlacePreference(row) : null;
  }

  async listByTripId(tripId: string): Promise<TripPlacePreference[]> {
    const rows = await getDatabase()
      .select()
      .from(savedPlaces)
      .where(eq(savedPlaces.tripId, tripId))
      .orderBy(asc(savedPlaces.createdAt), asc(savedPlaces.id));

    return rows.map(mapTripPlacePreference);
  }

  async save(preference: TripPlacePreference): Promise<TripPlacePreference> {
    await getDatabase()
      .insert(savedPlaces)
      .values({
        id: preference.id,
        tripId: preference.tripId,
        placeId: preference.placeId,
        intent: preference.intent,
        priority: preference.priority,
        createdAt: preference.createdAt,
        updatedAt: preference.updatedAt,
      })
      .onConflictDoUpdate({
        target: [savedPlaces.tripId, savedPlaces.placeId],
        set: {
          intent: preference.intent,
          priority: preference.priority,
          updatedAt: preference.updatedAt,
        },
      });

    const persisted = await this.find(preference.tripId, preference.placeId);
    if (!persisted) {
      throw new Error("TripPlacePreference não encontrada após persistência.");
    }
    return persisted;
  }

  async remove(tripId: string, placeId: string): Promise<void> {
    await getDatabase()
      .delete(savedPlaces)
      .where(and(eq(savedPlaces.tripId, tripId), eq(savedPlaces.placeId, placeId)));
  }
}
