import type { TripFieldErrors } from "@routebook/trip-management";

export type AccommodationActionState = {
  fieldErrors: TripFieldErrors;
  formError?: string;
};

export const initialAccommodationState: AccommodationActionState = {
  fieldErrors: {},
};
