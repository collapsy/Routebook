import type { TripPlaceIntent, TripPlacePriority } from "@routebook/trip-collection";

export const TRIP_PLACE_PREFERENCE_CHANGED_EVENT =
  "routebook:trip-place-preference-changed";

export type TripPlacePreferenceChangedDetail = Readonly<{
  previousIntent?: TripPlaceIntent;
  nextIntent?: TripPlaceIntent;
  previousPriority: TripPlacePriority | null;
  nextPriority: TripPlacePriority | null;
}>;
