import { createSavedPlace, type SavedPlace } from "./saved-place";
import type { SavedPlaceRepository } from "./repository";

export async function savePlaceForTrip(
  repository: SavedPlaceRepository,
  tripId: string,
  placeId: string,
): Promise<SavedPlace> {
  const existing = await repository.find(tripId, placeId);
  if (existing) return existing;

  return repository.save(createSavedPlace({ tripId, placeId }));
}

export async function removePlaceFromTrip(
  repository: SavedPlaceRepository,
  tripId: string,
  placeId: string,
): Promise<void> {
  await repository.remove(tripId, placeId);
}

export async function listSavedPlaces(
  repository: SavedPlaceRepository,
  tripId: string,
): Promise<SavedPlace[]> {
  return repository.listByTripId(tripId);
}
