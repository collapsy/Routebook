import type { TravelerProfileFieldErrors } from "@routebook/traveler-profile";

export type TravelerContextActionState = {
  fieldErrors: TravelerProfileFieldErrors;
  formError?: string;
};

export const initialTravelerContextState: TravelerContextActionState = {
  fieldErrors: {},
};
