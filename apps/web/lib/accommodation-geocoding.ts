import type { Trip, UpdateAccommodationInput } from "@routebook/trip-management";

import { GeocodingProviderError, type Geocoder, type GeocodingContext } from "./geocoding";

export type AccommodationLocationStatus =
  "removed" | "manual" | "preserved" | "resolved" | "not-found" | "unavailable";

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
  const address = accommodationAddress?.trim();
  if (!address) return accommodationName.trim();

  const destination = destinationName.trim();
  if (!destination || normalized(address).includes(normalized(destination))) return address;
  return `${address}, ${destination}`;
}

export function accommodationNameSearchRadiusKm(type: Trip["destination"]["type"]): number {
  switch (type) {
    case "district":
      return 60;
    case "city":
      return 120;
    case "island":
    case "park":
      return 250;
    case "region":
      return 800;
    default:
      return 300;
  }
}

function destinationCountryCode(trip: Trip): string | undefined {
  const code = trip.destination.countryCode?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : undefined;
}

function destinationAnchor(trip: Trip): GeocodingContext["anchor"] | undefined {
  const latitude = trip.destination.latitude;
  const longitude = trip.destination.longitude;
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return undefined;
  }
  return { latitude, longitude };
}

function geocodingContext(trip: Trip, nameOnly: boolean): GeocodingContext | undefined {
  const countryCode = destinationCountryCode(trip);
  if (!nameOnly) return countryCode ? { countryCode } : undefined;

  const anchor = destinationAnchor(trip);
  return {
    ...(countryCode ? { countryCode } : {}),
    ...(anchor
      ? {
          anchor,
          maxDistanceKm: accommodationNameSearchRadiusKm(trip.destination.type),
          rejectAmbiguous: true,
        }
      : {}),
  };
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

  if (
    !accommodationName.trim() &&
    !accommodationAddress?.trim() &&
    !hasManualLatitude &&
    !hasManualLongitude
  ) {
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

  const nameOnly = !accommodationAddress?.trim();
  const query = buildAccommodationGeocodingQuery(
    accommodationName,
    accommodationAddress,
    trip.destination.name,
  );

  try {
    const result = await geocoder.geocode(query, geocodingContext(trip, nameOnly));
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
