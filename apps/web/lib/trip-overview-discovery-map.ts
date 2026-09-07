import {
  DrizzlePlaceExternalReferenceRepository,
  DrizzlePlaceRepository,
} from "@routebook/database";
import {
  reconcileExternalPlaceCandidate,
  type ExternalPlaceCandidate,
  type ExternalPlaceReconciliation,
  type Place,
  type PlaceSearchPort,
} from "@routebook/place-catalog";
import type { Trip } from "@routebook/trip-management";

import { OverturePmtilesPlaceSearchAdapter } from "./overture-place-search";
import { buildPlaceDiscoveryFeed } from "./place-discovery-feed";
import {
  resolvePlaceBootstrapPolicy,
  runPlaceBootstrapStep,
  type PlaceBootstrapPolicy,
} from "./place-bootstrap";
import { resolvePlaceDiscoveryRegion } from "./place-discovery-region";
import type { TripMapPoint } from "./trip-map";

export const TRIP_OVERVIEW_EXTERNAL_DISPLAY_LIMIT = 20;

export type TripOverviewDiscoveryStatus = "unavailable" | "disabled" | "success" | "failed";

export type TripOverviewDiscoveryMap = Readonly<{
  points: readonly TripMapPoint[];
  canonicalCount: number;
  externalVisibleCount: number;
  externalAvailableCount: number;
  discoveryStatus: TripOverviewDiscoveryStatus;
  regionSource?: "accommodation" | "destination";
  distanceReferenceLabel?: string;
}>;

type PlaceRepositoryPort = Pick<DrizzlePlaceRepository, "listPublishedWithinRadius">;
type ExternalReferenceRepositoryPort = Pick<
  DrizzlePlaceExternalReferenceRepository,
  "listByPlaceIds"
>;

type TripOverviewDiscoveryDependencies = Readonly<{
  placeRepository?: PlaceRepositoryPort;
  externalReferenceRepository?: ExternalReferenceRepositoryPort;
  placeSearchPort?: PlaceSearchPort;
  bootstrapPolicy?: PlaceBootstrapPolicy;
}>;

function e2eCandidate(
  query: Readonly<{ center: Readonly<{ latitude: number; longitude: number }> }>,
  input: Readonly<{
    id: string;
    name: string;
    latitudeOffset: number;
    longitudeOffset: number;
    providerCategory: string;
    category: ExternalPlaceCandidate["category"];
  }>,
): ExternalPlaceCandidate {
  return {
    provider: "routebook-e2e",
    externalId: input.id,
    name: input.name,
    latitude: query.center.latitude + input.latitudeOffset,
    longitude: query.center.longitude + input.longitudeOffset,
    providerCategory: input.providerCategory,
    category: input.category,
    addressLabel: "Próximo à referência espacial da viagem",
    sourceLicense: "RouteBook test fixture",
    collectedAt: new Date("2026-09-07T12:00:00.000Z"),
    confidence: 0.95,
  };
}

function resolveOverviewPlaceSearchPort(
  configured: PlaceSearchPort | undefined,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): PlaceSearchPort {
  if (configured) return configured;
  if (environment.ROUTEBOOK_E2E_DESTINATION_RESOLVER === "1" && !environment.VERCEL_ENV) {
    return {
      async search(query) {
        return [
          e2eCandidate(query, {
            id: "nearby-cafe",
            name: "Café próximo",
            latitudeOffset: 0.001,
            longitudeOffset: 0.001,
            providerCategory: "cafe",
            category: "gastronomy",
          }),
          e2eCandidate(query, {
            id: "nearby-park",
            name: "Parque próximo",
            latitudeOffset: 0.002,
            longitudeOffset: -0.001,
            providerCategory: "park",
            category: "nature",
          }),
          e2eCandidate(query, {
            id: "nearby-bar",
            name: "Bar próximo",
            latitudeOffset: -0.001,
            longitudeOffset: 0.002,
            providerCategory: "bar",
            category: "nightlife",
          }),
        ];
      },
    };
  }
  return new OverturePmtilesPlaceSearchAdapter();
}

export function buildTripOverviewDiscoveryMap(input: Readonly<{
  trip: Trip;
  publishedPlaces: readonly Place[];
  externalReconciliations: readonly ExternalPlaceReconciliation[];
  reference: Readonly<{ latitude: number; longitude: number }>;
  savedPlaceIds?: ReadonlySet<string>;
  discoveryStatus: Exclude<TripOverviewDiscoveryStatus, "unavailable">;
  regionSource?: "accommodation" | "destination";
  distanceReferenceLabel?: string;
  externalLimit?: number;
}>): TripOverviewDiscoveryMap {
  const savedPlaceIds = input.savedPlaceIds ?? new Set<string>();
  const externalLimit = input.externalLimit ?? TRIP_OVERVIEW_EXTERNAL_DISPLAY_LIMIT;
  const allItems = buildPlaceDiscoveryFeed({
    publishedPlaces: input.publishedPlaces,
    externalReconciliations: input.externalReconciliations,
    reference: input.reference,
  });
  const visibleItems = buildPlaceDiscoveryFeed({
    publishedPlaces: input.publishedPlaces,
    externalReconciliations: input.externalReconciliations,
    reference: input.reference,
    externalLimit,
  });
  const points: TripMapPoint[] = visibleItems.map((item) => {
    if (item.kind === "external") {
      return {
        id: item.id,
        label: item.candidate.name,
        kind: "external-place",
        latitude: item.candidate.latitude,
        longitude: item.candidate.longitude,
      };
    }

    const coordinate =
      item.kind === "enriched"
        ? { latitude: item.candidate.latitude, longitude: item.candidate.longitude }
        : { latitude: item.place.latitude, longitude: item.place.longitude };
    return {
      id: item.id,
      label: item.place.name,
      kind: savedPlaceIds.has(item.place.id) ? "saved-place" : "published-place",
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      href: `/viagens/${input.trip.id}/lugares/${item.place.slug}`,
    };
  });

  if (input.trip.accommodation?.coordinate) {
    points.unshift({
      id: "accommodation",
      label: input.trip.accommodation.name,
      kind: "accommodation",
      latitude: input.trip.accommodation.coordinate.latitude,
      longitude: input.trip.accommodation.coordinate.longitude,
    });
  }

  return {
    points,
    canonicalCount: visibleItems.filter((item) => item.kind !== "external").length,
    externalVisibleCount: visibleItems.filter((item) => item.kind === "external").length,
    externalAvailableCount: allItems.filter((item) => item.kind === "external").length,
    discoveryStatus: input.discoveryStatus,
    ...(input.regionSource ? { regionSource: input.regionSource } : {}),
    ...(input.distanceReferenceLabel
      ? { distanceReferenceLabel: input.distanceReferenceLabel }
      : {}),
  };
}

function accommodationOnlyMap(trip: Trip): TripOverviewDiscoveryMap {
  const points: TripMapPoint[] = [];
  if (trip.accommodation?.coordinate) {
    points.push({
      id: "accommodation",
      label: trip.accommodation.name,
      kind: "accommodation",
      latitude: trip.accommodation.coordinate.latitude,
      longitude: trip.accommodation.coordinate.longitude,
    });
  }
  return {
    points,
    canonicalCount: 0,
    externalVisibleCount: 0,
    externalAvailableCount: 0,
    discoveryStatus: "unavailable",
  };
}

export async function loadTripOverviewDiscoveryMap(
  trip: Trip,
  savedPlaceIds: ReadonlySet<string> = new Set<string>(),
  dependencies: TripOverviewDiscoveryDependencies = {},
): Promise<TripOverviewDiscoveryMap> {
  const accommodationCoordinate = trip.accommodation?.coordinate;
  const regionResolution = resolvePlaceDiscoveryRegion({
    destination: trip.destination,
    ...(accommodationCoordinate ? { accommodationCoordinate } : {}),
  });
  if (regionResolution.status !== "resolved") return accommodationOnlyMap(trip);

  const region = regionResolution.region;
  const placeRepository = dependencies.placeRepository ?? new DrizzlePlaceRepository();
  const externalReferenceRepository =
    dependencies.externalReferenceRepository ?? new DrizzlePlaceExternalReferenceRepository();
  const placeSearchPort = resolveOverviewPlaceSearchPort(dependencies.placeSearchPort);
  const bootstrapPolicy = dependencies.bootstrapPolicy ?? resolvePlaceBootstrapPolicy();
  const publishedPlaces = await placeRepository.listPublishedWithinRadius({
    center: region.center,
    radiusMeters: region.curatedRadiusMeters,
  });
  const references = await externalReferenceRepository.listByPlaceIds(
    publishedPlaces.map((place) => place.id),
  );
  const discoveryResult = await runPlaceBootstrapStep({
    enabled: bootstrapPolicy.discovery.enabled,
    maxAttempts: bootstrapPolicy.discovery.maxAttempts,
    operation: () =>
      placeSearchPort.search({
        center: region.center,
        radiusMeters: region.externalRadiusMeters,
        limit: bootstrapPolicy.discovery.candidateLimit,
      }),
  });

  const externalReconciliations =
    discoveryResult.status === "success"
      ? discoveryResult.value.map((candidate) =>
          reconcileExternalPlaceCandidate(candidate, publishedPlaces, references),
        )
      : [];

  return buildTripOverviewDiscoveryMap({
    trip,
    publishedPlaces,
    externalReconciliations,
    reference: region.center,
    savedPlaceIds,
    discoveryStatus: discoveryResult.status,
    regionSource: region.source,
    distanceReferenceLabel: region.distanceReferenceLabel,
  });
}
