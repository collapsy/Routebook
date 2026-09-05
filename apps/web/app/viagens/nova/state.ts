import type { TripFieldErrors } from "@routebook/trip-management";

export type CreateTripActionState = {
  fieldErrors: TripFieldErrors;
  formError?: string;
  destinationSelectionRevision?: number;
};

export const initialCreateTripState: CreateTripActionState = { fieldErrors: {} };
