import { calculateGeodesicDistance, createGeoCoordinate } from "@routebook/geo-distance";
import type { Trip, TripStage } from "@routebook/trip-management";

import {
  resolvePlaceDiscoveryRegion,
  type PlaceDiscoveryRegionResolution,
} from "./place-discovery-region";

export type TripDiscoveryScope = Readonly<{
  stageId?: string;
  destinationName: string;
  timeZone: string;
  accommodationCoordinate?: Readonly<{ latitude: number; longitude: number }>;
  regionResolution: PlaceDiscoveryRegionResolution;
}>;

export function selectTripDiscoveryScope(
  trip: Trip,
  stages: readonly TripStage[],
  requestedStageId?: string,
  requestedRadiusMeters?: number,
): TripDiscoveryScope | null {
  const stage = requestedStageId
    ? stages.find((candidate) => candidate.id === requestedStageId && candidate.tripId === trip.id)
    : undefined;
  if (requestedStageId && !stage) return null;

  const destination = stage?.destination ?? trip.destination;
  const accommodationCoordinate = stage
    ? stage.accommodation?.coordinate
    : trip.accommodation?.coordinate;
  return {
    ...(stage ? { stageId: stage.id } : {}),
    destinationName: destination.name,
    timeZone: destination.timeZone,
    ...(accommodationCoordinate ? { accommodationCoordinate } : {}),
    regionResolution: resolvePlaceDiscoveryRegion({
      destination,
      ...(accommodationCoordinate ? { accommodationCoordinate } : {}),
      ...(requestedRadiusMeters ? { requestedRadiusMeters } : {}),
    }),
  };
}

export function resolveSelectedPlaceScope(
  trip: Trip,
  stages: readonly TripStage[],
  placeCoordinate: Readonly<{ latitude: number; longitude: number }>,
): TripDiscoveryScope | null {
  const scopes = [
    selectTripDiscoveryScope(trip, stages),
    ...stages
      .filter((stage) => stage.tripId === trip.id)
      .map((stage) => selectTripDiscoveryScope(trip, stages, stage.id)),
  ];
  let closest: { scope: TripDiscoveryScope; distanceMeters: number } | undefined;
  for (const scope of scopes) {
    if (scope?.regionResolution.status !== "resolved") continue;
    const region = scope.regionResolution.region;
    const distanceMeters = calculateGeodesicDistance(
      createGeoCoordinate(region.center),
      createGeoCoordinate(placeCoordinate),
    ).meters;
    if (distanceMeters > region.curatedRadiusMeters) continue;
    if (!closest || distanceMeters < closest.distanceMeters) closest = { scope, distanceMeters };
  }
  return closest?.scope ?? null;
}
