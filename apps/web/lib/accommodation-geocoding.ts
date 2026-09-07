import type { Trip, UpdateAccommodationInput } from "@routebook/trip-management";

import { GeocodingProviderError, type Geocoder } from "./geocoding";

export type AccommodationLocationStatus =
  | "removed"
  | "manual"
  | "preserved"
  | "resolved"
  | "not-found"
  | "unavailable";

type PrepareAccommodationInput = Readonly<{
  trip: Trip;
  accommodationName: string;
  accommodationAddress?: string;
  manualLatitude?: number;
  manualLongitude?: number;
  geocoder: Geocoder;
}>;

export type PreparedAccommodationUpdate = Readonly<{
  input: UpdateAccommodationInput;
  locationStatus: AccommodationLocationStatus;
}>;

function normalized(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase("pt-BR") ?? "";
}

export function buildAccommodationGeocodingQuery(
  accommodationName: string,
  accommodationAddress: string | undefined,
  destinationName: string,
): string {
  const location = accommodationAddress?.trim() || accommodationName.trim();
  const destination = destinationName.trim();

  if (!location) return "";
  if (!destination || normalized(location).includes(normalized(destination))) return location;
  return `${location}, ${destination}`;
}

function sameLocation(
  trip: Trip,
  accommodationName: string,
  accommodationAddress: string | undefined,
): boolean {
  const existing = trip.accommodation;
  if (!existing?.coordinate) return false;

  const previousAddress = normalized(existing.address);
  const nextAddress = normalized(accommodationAddress);

  if (previousAddress || nextAddress) return previousAddress === nextAddress;
  return normalized(existing.name) === normalized(accommodationName);
}

function rawInput(
  accommodationName: string,
  accommodationAddress: string | undefined,
): UpdateAccommodationInput {
  return {
    accommodationName,
    ...(accommodationAddress ? { accommodationAddress } : {}),
  };
}

export async function prepareAccommodationUpdate({
  trip,
  accommodationName,
  accommodationAddress,
  manualLatitude,
  manualLongitude,
  geocoder,
}: PrepareAccommodationInput): Promise<PreparedAccommodationUpdate> {
  const base = rawInput(accommodationName, accommodationAddress);
  const hasManualLatitude = manualLatitude !== undefined;
  const hasManualLongitude = manualLongitude !== undefined;

  if (!accommodationName.trim() && !accommodationAddress?.trim() && !hasManualLatitude && !hasManualLongitude) {
    return { input: base, locationStatus: "removed" };
  }

  if (hasManualLatitude || hasManualLongitude) {
    return {
      input: {
        ...base,
        ...(hasManualLatitude ? { accommodationLatitude: manualLatitude } : {}),
        ...(hasManualLongitude ? { accommodationLongitude: manualLongitude } : {}),
      },
      locationStatus: "manual",
    };
  }

  if (sameLocation(trip, accommodationName, accommodationAddress)) {
    const coordinate = trip.accommodation!.coordinate!;
    return {
      input: {
        ...base,
        accommodationLatitude: coordinate.latitude,
        accommodationLongitude: coordinate.longitude,
      },
      locationStatus: "preserved",
    };
  }

  if (!accommodationName.trim()) return { input: base, locationStatus: "not-found" };

  const query = buildAccommodationGeocodingQuery(
    accommodationName,
    accommodationAddress,
    trip.destination.name,
  );

  try {
    const result = await geocoder.geocode(query);
    if (!result) return { input: base, locationStatus: "not-found" };

    return {
      input: {
        accommodationName,
        accommodationAddress: accommodationAddress?.trim() || result.normalizedAddress,
        accommodationLatitude: result.latitude,
        accommodationLongitude: result.longitude,
      },
      locationStatus: "resolved",
    };
  } catch (error) {
    if (error instanceof GeocodingProviderError) {
      return { input: base, locationStatus: "unavailable" };
    }
    throw error;
  }
}
