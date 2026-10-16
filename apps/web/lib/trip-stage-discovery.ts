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
  const accommodationCoordinate = stage ? undefined : trip.accommodation?.coordinate;
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
