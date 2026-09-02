import type { Destination } from "@routebook/trip-management";

export const EXTERNAL_DISCOVERY_RADIUS_METERS = 8_000;
export const CURATED_DISCOVERY_RADIUS_METERS = 25_000;

type Coordinate = Readonly<{ latitude: number; longitude: number }>;

export type PlaceDiscoveryRegion = Readonly<{
  source: "accommodation" | "destination";
  center: Coordinate;
  externalRadiusMeters: number;
  curatedRadiusMeters: number;
  distanceReferenceLabel: "da hospedagem" | "do destino";
}>;

export type PlaceDiscoveryRegionResolution =
  | Readonly<{ status: "resolved"; region: PlaceDiscoveryRegion }>
  | Readonly<{ status: "unavailable"; reason: "missing-spatial-reference" }>;

function validCoordinate(value: Coordinate | undefined): value is Coordinate {
  return Boolean(
    value &&
      Number.isFinite(value.latitude) &&
      value.latitude >= -90 &&
      value.latitude <= 90 &&
      Number.isFinite(value.longitude) &&
      value.longitude >= -180 &&
      value.longitude <= 180,
  );
}

export function resolvePlaceDiscoveryRegion(input: Readonly<{
  destination?: Pick<Destination, "latitude" | "longitude">;
  accommodationCoordinate?: Coordinate;
  requestedRadiusMeters?: number;
}>): PlaceDiscoveryRegionResolution {
  const accommodation = validCoordinate(input.accommodationCoordinate)
    ? input.accommodationCoordinate
    : undefined;
  const destination = validCoordinate(input.destination)
    ? { latitude: input.destination.latitude, longitude: input.destination.longitude }
    : undefined;
  const center = accommodation ?? destination;
  if (!center) return { status: "unavailable", reason: "missing-spatial-reference" };

  const requestedRadius =
    input.requestedRadiusMeters !== undefined &&
    Number.isFinite(input.requestedRadiusMeters) &&
    input.requestedRadiusMeters > 0
      ? input.requestedRadiusMeters
      : EXTERNAL_DISCOVERY_RADIUS_METERS;

  return {
    status: "resolved",
    region: {
      source: accommodation ? "accommodation" : "destination",
      center,
      externalRadiusMeters: Math.min(requestedRadius, EXTERNAL_DISCOVERY_RADIUS_METERS),
      curatedRadiusMeters: CURATED_DISCOVERY_RADIUS_METERS,
      distanceReferenceLabel: accommodation ? "da hospedagem" : "do destino",
    },
  };
}
