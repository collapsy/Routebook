import type { TripFieldErrors } from "@routebook/trip-management";

export type CreateTripActionState = {
  fieldErrors: TripFieldErrors;
  formError?: string;
  destinationSelectionResetToken?: string;
};

export const initialCreateTripState: CreateTripActionState = { fieldErrors: {} };
