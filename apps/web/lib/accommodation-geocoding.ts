import type {
  Destination,
  Trip,
  UpdateAccommodationInput,
} from "@routebook/trip-management";

import { GeocodingProviderError, type Geocoder, type GeocodingContext } from "./geocoding";

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

type ResolveAccommodationInput = Readonly<{
  destination: Destination;
  accommodationName: string;
  accommodationAddress?: string;
  geocoder: Geocoder;
}>;

export type PreparedAccommodationUpdate = Readonly<{
  input: UpdateAccommodationInput;
  locationStatus: AccommodationLocationStatus;
}>;

export type ResolvedAccommodationLocation = Readonly<{
  input: UpdateAccommodationInput;
  locationStatus: "resolved" | "not-found" | "unavailable";
}>;

function normalized(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase("pt-BR") ?? "";
}

export function buildAccommodationGeocodingQuery(
  accommodationName: string,
  accommodationAddress: string | undefined,
  destinationName: string,
): string {
  const destination = destinationName.trim();
  const address = accommodationAddress?.trim();

  if (!address) {
    const name = accommodationName.trim();
    if (!destination || normalized(name).includes(normalized(destination))) return name;
    return `${name}, ${destination}`;
  }

  if (!destination || normalized(address).includes(normalized(destination))) return address;
  return `${address}, ${destination}`;
}

export function accommodationNameSearchRadiusKm(type: Destination["type"]): number {
  switch (type) {
    case "district":
      return 60;
    case "city":
      return 40;
    case "island":
    case "park":
      return 250;
    case "region":
      return 800;
    default:
      return 300;
  }
}

function destinationCountryCode(destination: Destination): string | undefined {
  const code = destination.countryCode?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : undefined;
}

function destinationAnchor(destination: Destination): GeocodingContext["anchor"] | undefined {
  const latitude = destination.latitude;
  const longitude = destination.longitude;
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

function geocodingContext(
  destination: Destination,
  nameOnly: boolean,
): GeocodingContext | undefined {
  const countryCode = destinationCountryCode(destination);
  if (!nameOnly) return countryCode ? { countryCode } : undefined;

  const anchor = destinationAnchor(destination);
  return {
    ...(countryCode ? { countryCode } : {}),
    ...(anchor
      ? {
          anchor,
          maxDistanceKm: accommodationNameSearchRadiusKm(destination.type),
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
  const name = accommodationName.trim();
  const address = accommodationAddress?.trim();
  return {
    accommodationName: name,
    ...(address ? { accommodationAddress: address } : {}),
  };
}

export async function resolveAccommodationLocation({
  destination,
  accommodationName,
  accommodationAddress,
  geocoder,
}: ResolveAccommodationInput): Promise<ResolvedAccommodationLocation> {
  const base = rawInput(accommodationName, accommodationAddress);
  if (!base.accommodationName) return { input: base, locationStatus: "not-found" };

  const nameOnly = !base.accommodationAddress;
  const query = buildAccommodationGeocodingQuery(
    base.accommodationName,
    base.accommodationAddress,
    destination.name,
  );

  try {
    const result = await geocoder.geocode(query, geocodingContext(destination, nameOnly));
    if (!result) return { input: base, locationStatus: "not-found" };

    return {
      input: {
        accommodationName: base.accommodationName,
        accommodationAddress: base.accommodationAddress ?? result.normalizedAddress,
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

  return resolveAccommodationLocation({
    destination: trip.destination,
    accommodationName,
    ...(accommodationAddress !== undefined ? { accommodationAddress } : {}),
    geocoder,
  });
}
