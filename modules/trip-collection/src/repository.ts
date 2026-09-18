import type { TripPlacePreference } from "./trip-place-preference";

export interface TripPlacePreferenceRepository {
  find(tripId: string, placeId: string): Promise<TripPlacePreference | null>;
  listByTripId(tripId: string): Promise<TripPlacePreference[]>;
  save(preference: TripPlacePreference): Promise<TripPlacePreference>;
  remove(tripId: string, placeId: string): Promise<void>;
}
