import { and, asc, eq } from "drizzle-orm";

import type { SavedPlace, SavedPlaceRepository } from "@routebook/saved-places";

import { getDatabase } from "./client";
import { savedPlaces } from "./schema";

type SavedPlaceRow = typeof savedPlaces.$inferSelect;

function mapSavedPlace(row: SavedPlaceRow): SavedPlace {
  return {
    id: row.id,
    tripId: row.tripId,
    placeId: row.placeId,
    createdAt: row.createdAt,
  };
}

export class DrizzleSavedPlaceRepository implements SavedPlaceRepository {
  async find(tripId: string, placeId: string): Promise<SavedPlace | null> {
    const [row] = await getDatabase()
      .select()
      .from(savedPlaces)
      .where(and(eq(savedPlaces.tripId, tripId), eq(savedPlaces.placeId, placeId)))
      .limit(1);

    return row ? mapSavedPlace(row) : null;
  }

  async listByTripId(tripId: string): Promise<SavedPlace[]> {
    const rows = await getDatabase()
      .select()
      .from(savedPlaces)
      .where(eq(savedPlaces.tripId, tripId))
      .orderBy(asc(savedPlaces.createdAt));

    return rows.map(mapSavedPlace);
  }

  async save(selection: SavedPlace): Promise<SavedPlace> {
    await getDatabase().insert(savedPlaces).values(selection).onConflictDoNothing({
      target: [savedPlaces.tripId, savedPlaces.placeId],
    });

    return (await this.find(selection.tripId, selection.placeId)) ?? selection;
  }

  async remove(tripId: string, placeId: string): Promise<void> {
    await getDatabase()
      .delete(savedPlaces)
      .where(and(eq(savedPlaces.tripId, tripId), eq(savedPlaces.placeId, placeId)));
  }
}
