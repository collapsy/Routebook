import { DrizzlePlaceRepository } from "@routebook/database";
import type { Place } from "@routebook/place-catalog";
import type { Trip } from "@routebook/trip-management";

import { resolvePlaceDiscoveryRegion } from "./place-discovery-region";

export type TripCuratedCatalog = Readonly<{
  places: readonly Place[];
  destinationId?: string;
}>;

export async function loadTripCuratedCatalog(trip: Trip): Promise<TripCuratedCatalog> {
  const regionResolution = resolvePlaceDiscoveryRegion({
    destination: trip.destination,
    ...(trip.accommodation?.coordinate
      ? { accommodationCoordinate: trip.accommodation.coordinate }
      : {}),
  });
  if (regionResolution.status !== "resolved") return { places: [] };

  const places = await new DrizzlePlaceRepository().listPublishedWithinRadius({
    center: regionResolution.region.center,
    radiusMeters: regionResolution.region.curatedRadiusMeters,
  });
  const destinationIds = [
    ...new Set(places.flatMap((place) => (place.destinationId ? [place.destinationId] : []))),
  ];

  return {
    places,
    ...(destinationIds.length === 1 ? { destinationId: destinationIds[0] } : {}),
  };
}
