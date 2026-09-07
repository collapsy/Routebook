import {
  DrizzlePlaceExternalReferenceRepository,
  DrizzlePlaceRepository,
} from "@routebook/database";
import {
  SUPPORTED_INTEREST_CATEGORY_MAP,
  type TravelerInterest,
} from "@routebook/decision-intelligence";
import {
  reconcileExternalPlaceCandidate,
  type ExternalPlaceCandidate,
  type ExternalPlaceReconciliation,
  type Place,
  type PlaceCategory,
  type PlaceSearchPort,
} from "@routebook/place-catalog";
import type { Trip } from "@routebook/trip-management";

import { OverturePmtilesPlaceSearchAdapter } from "./overture-place-search";
import {
  resolvePlaceBootstrapPolicy,
  runPlaceBootstrapStep,
  type PlaceBootstrapPolicy,
} from "./place-bootstrap";
import { buildPlaceDiscoveryFeed, type PlaceDiscoveryItem } from "./place-discovery-feed";
import { resolvePlaceDiscoveryRegion } from "./place-discovery-region";

export const CONTEXTUAL_EXTERNAL_SUGGESTION_LIMIT = 6;

export type RecommendationDiscoveryStatus = "unavailable" | "disabled" | "success" | "failed";

export type ContextualExternalSuggestionViewModel = Readonly<{
  id: string;
  provider: string;
  externalId: string;
  name: string;
  category: PlaceCategory;
  categoryLabel: string;
  addressLabel?: string;
  geodesicDistanceLabel: string;
  reasons: readonly string[];
  limitations: readonly string[];
  sourceLabel: string;
  discoveryHref: string;
}>;

export type RecommendationDiscoverySuggestions = Readonly<{
  suggestions: readonly ContextualExternalSuggestionViewModel[];
  discoveryStatus: RecommendationDiscoveryStatus;
  availableCount: number;
}>;

type PlaceRepositoryPort = Pick<DrizzlePlaceRepository, "listPublishedWithinRadius">;
type ExternalReferenceRepositoryPort = Pick<
  DrizzlePlaceExternalReferenceRepository,
  "listByPlaceIds"
>;

export type RecommendationDiscoverySuggestionDependencies = Readonly<{
  placeRepository?: PlaceRepositoryPort;
  externalReferenceRepository?: ExternalReferenceRepositoryPort;
  placeSearchPort?: PlaceSearchPort;
  bootstrapPolicy?: PlaceBootstrapPolicy;
}>;

const categoryLabels: Readonly<Record<PlaceCategory, string>> = {
  beach: "Praias",
  gastronomy: "Gastronomia",
  nature: "Natureza",
  nightlife: "Vida noturna",
};

function formatGeodesicDistance(distanceMeters: number): string {
  if (distanceMeters < 1_000) return `${Math.round(distanceMeters)} m em linha reta`;
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
    distanceMeters / 1_000,
  )} km em linha reta`;
}

function sourceLabel(provider: string): string {
  if (provider === "overture") return "Overture";
  if (provider === "routebook-e2e") return "RouteBook E2E";
  return provider;
}

function supportedInterestCategories(interests: readonly TravelerInterest[]): ReadonlySet<PlaceCategory> {
  return new Set(
    interests.flatMap((interest) => {
      const category =
        SUPPORTED_INTEREST_CATEGORY_MAP[
          interest as keyof typeof SUPPORTED_INTEREST_CATEGORY_MAP
        ];
      return category ? [category] : [];
    }),
  );
}

function isExternalWithCategory(
  item: PlaceDiscoveryItem,
): item is Extract<PlaceDiscoveryItem, { kind: "external" }> & {
  candidate: ExternalPlaceCandidate & { category: PlaceCategory };
} {
  return item.kind === "external" && item.candidate.category !== undefined;
}

function compareExternalSuggestions(
  left: Extract<PlaceDiscoveryItem, { kind: "external" }> & {
    candidate: ExternalPlaceCandidate & { category: PlaceCategory };
  },
  right: Extract<PlaceDiscoveryItem, { kind: "external" }> & {
    candidate: ExternalPlaceCandidate & { category: PlaceCategory };
  },
  preferredCategories: ReadonlySet<PlaceCategory>,
): number {
  const leftMatches = preferredCategories.has(left.candidate.category);
  const rightMatches = preferredCategories.has(right.candidate.category);
  const byInterest = Number(rightMatches) - Number(leftMatches);
  if (byInterest) return byInterest;

  const byDistance = left.distanceMeters - right.distanceMeters;
  if (byDistance) return byDistance;

  return (
    left.candidate.name.localeCompare(right.candidate.name, "pt-BR") ||
    left.id.localeCompare(right.id)
  );
}

export function buildContextualExternalSuggestions(input: Readonly<{
  tripId: string;
  items: readonly PlaceDiscoveryItem[];
  interests: readonly TravelerInterest[];
  limit?: number;
}>): readonly ContextualExternalSuggestionViewModel[] {
  const limit = input.limit ?? CONTEXTUAL_EXTERNAL_SUGGESTION_LIMIT;
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new RangeError("external suggestion limit must be a positive integer");
  }

  const preferredCategories = supportedInterestCategories(input.interests);
  const hasInterests = input.interests.length > 0;

  const suggestions = input.items
    .filter(isExternalWithCategory)
    .sort((left, right) => compareExternalSuggestions(left, right, preferredCategories))
    .slice(0, limit)
    .map<ContextualExternalSuggestionViewModel>((item) => {
      const matchesInterest = preferredCategories.has(item.candidate.category);
      const reasons = [
        ...(matchesInterest
          ? ["A categoria corresponde a um interesse informado para esta Viagem."]
          : []),
        "O Lugar foi encontrado dentro da área de descoberta desta Viagem.",
      ];
      const limitations = [
        "Esta é uma descoberta externa e ainda não é um Place publicado no catálogo do RouteBook.",
        "Preço, avaliação pública, horário e disponibilidade não foram confirmados por esta sugestão.",
        "A distância exibida é geodésica, em linha reta, e não representa rota, trânsito ou duração.",
        ...(!hasInterests
          ? ["Nenhum interesse foi informado; a ordem usa proximidade sem inferir preferência."]
          : []),
      ];

      return Object.freeze({
        id: item.id,
        provider: item.candidate.provider,
        externalId: item.candidate.externalId,
        name: item.candidate.name,
        category: item.candidate.category,
        categoryLabel: categoryLabels[item.candidate.category],
        ...(item.candidate.addressLabel ? { addressLabel: item.candidate.addressLabel } : {}),
        geodesicDistanceLabel: formatGeodesicDistance(item.distanceMeters),
        reasons: Object.freeze(reasons),
        limitations: Object.freeze(limitations),
        sourceLabel: sourceLabel(item.candidate.provider),
        discoveryHref: `/viagens/${input.tripId}/lugares`,
      });
    });

  return Object.freeze(suggestions);
}

function e2eCandidate(
  center: Readonly<{ latitude: number; longitude: number }>,
  input: Readonly<{
    id: string;
    name: string;
    latitudeOffset: number;
    longitudeOffset: number;
    providerCategory: string;
    category: PlaceCategory;
  }>,
): ExternalPlaceCandidate {
  return {
    provider: "routebook-e2e",
    externalId: input.id,
    name: input.name,
    latitude: center.latitude + input.latitudeOffset,
    longitude: center.longitude + input.longitudeOffset,
    providerCategory: input.providerCategory,
    category: input.category,
    addressLabel: "Próximo à referência espacial da viagem",
    sourceLicense: "RouteBook test fixture",
    collectedAt: new Date("2026-09-07T12:00:00.000Z"),
    confidence: 0.95,
  };
}

function resolveRecommendationPlaceSearchPort(
  configured: PlaceSearchPort | undefined,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): PlaceSearchPort {
  if (configured) return configured;
  if (environment.ROUTEBOOK_E2E_DESTINATION_RESOLVER === "1" && !environment.VERCEL_ENV) {
    return {
      async search(query) {
        return [
          e2eCandidate(query.center, {
            id: "recommendation-nearby-cafe",
            name: "Café descoberto próximo",
            latitudeOffset: 0.001,
            longitudeOffset: 0.001,
            providerCategory: "cafe",
            category: "gastronomy",
          }),
          e2eCandidate(query.center, {
            id: "recommendation-nearby-park",
            name: "Parque descoberto próximo",
            latitudeOffset: 0.002,
            longitudeOffset: -0.001,
            providerCategory: "park",
            category: "nature",
          }),
          e2eCandidate(query.center, {
            id: "recommendation-nearby-bar",
            name: "Bar descoberto próximo",
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

export function buildRecommendationDiscoverySuggestions(input: Readonly<{
  trip: Trip;
  publishedPlaces: readonly Place[];
  externalReconciliations: readonly ExternalPlaceReconciliation[];
  reference: Readonly<{ latitude: number; longitude: number }>;
  interests: readonly TravelerInterest[];
  discoveryStatus: Exclude<RecommendationDiscoveryStatus, "unavailable">;
}>): RecommendationDiscoverySuggestions {
  const items = buildPlaceDiscoveryFeed({
    publishedPlaces: input.publishedPlaces,
    externalReconciliations: input.externalReconciliations,
    reference: input.reference,
  });
  const externalItems = items.filter((item) => item.kind === "external");

  return Object.freeze({
    suggestions: buildContextualExternalSuggestions({
      tripId: input.trip.id,
      items,
      interests: input.interests,
    }),
    discoveryStatus: input.discoveryStatus,
    availableCount: externalItems.length,
  });
}

export async function loadRecommendationDiscoverySuggestions(
  trip: Trip,
  interests: readonly TravelerInterest[],
  dependencies: RecommendationDiscoverySuggestionDependencies = {},
): Promise<RecommendationDiscoverySuggestions> {
  const accommodationCoordinate = trip.accommodation?.coordinate;
  const regionResolution = resolvePlaceDiscoveryRegion({
    destination: trip.destination,
    ...(accommodationCoordinate ? { accommodationCoordinate } : {}),
  });
  if (regionResolution.status !== "resolved") {
    return Object.freeze({
      suggestions: Object.freeze([]),
      discoveryStatus: "unavailable",
      availableCount: 0,
    });
  }

  const region = regionResolution.region;
  const placeRepository = dependencies.placeRepository ?? new DrizzlePlaceRepository();
  const externalReferenceRepository =
    dependencies.externalReferenceRepository ?? new DrizzlePlaceExternalReferenceRepository();
  const placeSearchPort = resolveRecommendationPlaceSearchPort(dependencies.placeSearchPort);
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

  return buildRecommendationDiscoverySuggestions({
    trip,
    publishedPlaces,
    externalReconciliations,
    reference: region.center,
    interests,
    discoveryStatus: discoveryResult.status,
  });
}
