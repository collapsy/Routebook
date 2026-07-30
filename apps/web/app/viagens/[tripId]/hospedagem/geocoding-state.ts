import type { GeocodingResult } from "@/lib/geocoding";

export type GeocodingActionState = {
  query: string;
  result?: GeocodingResult;
  error?: string;
};

export const initialGeocodingState: GeocodingActionState = {
  query: "",
};
