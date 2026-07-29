import type { SavedPlace } from "./saved-place";

export interface SavedPlaceRepository {
  find(tripId: string, placeId: string): Promise<SavedPlace | null>;
  listByTripId(tripId: string): Promise<SavedPlace[]>;
  save(selection: SavedPlace): Promise<SavedPlace>;
  remove(tripId: string, placeId: string): Promise<void>;
}
