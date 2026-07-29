import { createGeoCoordinate, type GeoCoordinate } from "./coordinate";

const EARTH_RADIUS_METERS = 6_371_008.8;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export interface GeoDistance {
  meters: number;
  kilometers: number;
}

export function calculateGeodesicDistance(
  originInput: GeoCoordinate,
  destinationInput: GeoCoordinate,
): GeoDistance {
  const origin = createGeoCoordinate(originInput);
  const destination = createGeoCoordinate(destinationInput);

  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  const angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  const meters = EARTH_RADIUS_METERS * angularDistance;

  return Object.freeze({
    meters,
    kilometers: meters / 1_000,
  });
}
