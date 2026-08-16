import { randomUUID } from "node:crypto";

import {
  DrizzleItineraryRepository,
  DrizzlePlaceRepository,
  DrizzleRecommendationRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTravelerProfileRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import {
  fingerprintRecommendation,
  generateDeterministicPlaceRecommendations,
  invalidateRecommendation,
  presentRecommendation,
  type Recommendation,
  type RecommendationConfidenceLevel,
  type RecommendationId,
  type RecommendationLimitation,
  type RecommendationReason,
  type RecommendationStatus,
  type TravelerInterest,
} from "@routebook/decision-intelligence";
import {
  listPublishedPlaces,
  type Place,
  type PlaceCategory,
  type PlacePrimaryImage,
} from "@routebook/place-catalog";
import { listSavedPlaces } from "@routebook/saved-places";
import { findTravelerProfile } from "@routebook/traveler-profile";
import { findTripById, type Trip } from "@routebook/trip-management";

import { resolveTripDestinationId } from "./trip-destination";

export type RecommendationCardViewModel = Readonly<{
  id: RecommendationId;
  status: RecommendationStatus;
  placeId: string;
  placeSlug: string;
  placeName: string;
  category: PlaceCategory;
  summary: string;
  priceRange?: Place["priceRange"];
  primaryImage?: PlacePrimaryImage;
  reasons: readonly RecommendationReason[];
  limitations: readonly RecommendationLimitation[];
  confidenceLevel: RecommendationConfidenceLevel;
  confidenceBasis: readonly string[];
  geodesicDistanceLabel?: string;
  isSaved: boolean;
  isPlanned: boolean;
  detailsHref: string;
  canIgnore: boolean;
}>;

export type RecommendationExperienceViewModel = Readonly<{
  trip: Trip;
  destinationSupported: boolean;
  cards: readonly RecommendationCardViewModel[];
  activeCount: number;
  rejectedCount: number;
  invalidatedCount: number;
  hasContextLimitations: boolean;
}>;

export type RecommendationExperienceOptions = Readonly<{
  persist?: boolean;
}>;

export type FocusedRecommendationPresentation = Readonly<{
  focusedCards: readonly RecommendationCardViewModel[];
  consideredCards: readonly RecommendationCardViewModel[];
  remainingPendingCount: number;
  totalCount: number;
}>;

const contextLimitationCodes = new Set([
  "traveler-interests-unavailable",
  "interest-category-unavailable",
  "accommodation-distance-unavailable",
  "geodesic-distance-could-not-be-evaluated",
]);

function sameOptionalVersion(left: number | undefined, right: number | undefined): boolean {
  return left === right;
}

function hasCompatibleContext(
  recommendation: Recommendation,
  input: Readonly<{
    tripContextVersion: number;
    travelerProfileVersion?: number;
    itineraryVersion?: number;
    destinationId: string;
  }>,
): boolean {
  return (
    recommendation.snapshot.destinationId === input.destinationId &&
    recommendation.snapshot.tripContextVersion === input.tripContextVersion &&
    sameOptionalVersion(
      recommendation.snapshot.travelerProfileVersion,
      input.travelerProfileVersion,
    ) &&
    sameOptionalVersion(recommendation.snapshot.itineraryVersion, input.itineraryVersion)
  );
}

function plannedPlaceIds(
  itinerary: Awaited<ReturnType<DrizzleItineraryRepository["findByTripId"]>>,
): ReadonlySet<string> {
  return new Set(
    itinerary?.days.flatMap((day) =>
      day.activities.flatMap((activity) => (activity.placeId ? [activity.placeId] : [])),
    ) ?? [],
  );
}

function isPendingRecommendationCard(card: RecommendationCardViewModel): boolean {
  return card.status === "presented" && !card.isSaved && !card.isPlanned;
}

function isConsideredRecommendationCard(card: RecommendationCardViewModel): boolean {
  return (
    card.status === "accepted" || card.status === "rejected" || card.isSaved || card.isPlanned
  );
}

export function buildFocusedRecommendationPresentation(
  cards: readonly RecommendationCardViewModel[],
  limit = 6,
): FocusedRecommendationPresentation {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new RangeError("focused recommendation limit must be a positive integer");
  }

  const pendingCards = cards.filter(isPendingRecommendationCard);
  const focusedCards = pendingCards.slice(0, limit);
  const consideredCards = cards.filter(isConsideredRecommendationCard);

  return Object.freeze({
    focusedCards: Object.freeze(focusedCards),
    consideredCards: Object.freeze(consideredCards),
    remainingPendingCount: Math.max(0, pendingCards.length - focusedCards.length),
    totalCount: cards.length,
  });
}

export function formatGeodesicDistance(distanceMeters: number): string {
  if (distanceMeters < 1_000) return `${Math.round(distanceMeters)} m em linha reta`;
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
    distanceMeters / 1_000,
  )} km em linha reta`;
}

function latestEquivalentRecommendation(
  persisted: readonly Recommendation[],
  generated: Recommendation,
): Recommendation | null {
  const fingerprint = fingerprintRecommendation(generated);
  const candidates = persisted.filter(
    (recommendation) =>
      recommendation.target.placeId === generated.target.placeId &&
      fingerprintRecommendation(recommendation) === fingerprint &&
      !["expired", "invalidated", "superseded"].includes(recommendation.status),
  );

  return (
    [...candidates].sort(
      (left, right) =>
        right.generation.generatedAt.getTime() - left.generation.generatedAt.getTime() ||
        right.id.localeCompare(left.id),
    )[0] ?? null
  );
}

export function toRecommendationCardViewModel(input: {
  tripId: string;
  recommendation: Recommendation;
  place: Place;
  geodesicDistanceMeters?: number;
  isSaved: boolean;
  isPlanned: boolean;
}): RecommendationCardViewModel {
  return Object.freeze({
    id: input.recommendation.id,
    status: input.recommendation.status,
    placeId: input.place.id,
    placeSlug: input.place.slug,
    placeName: input.place.name,
    category: input.place.category,
    summary: input.place.summary,
    ...(input.place.priceRange ? { priceRange: input.place.priceRange } : {}),
    ...(input.place.primaryImage ? { primaryImage: input.place.primaryImage } : {}),
    reasons: input.recommendation.reasons,
    limitations: input.recommendation.limitations,
    confidenceLevel: input.recommendation.confidence.level,
    confidenceBasis: input.recommendation.confidence.basis,
    ...(input.geodesicDistanceMeters !== undefined
      ? { geodesicDistanceLabel: formatGeodesicDistance(input.geodesicDistanceMeters) }
      : {}),
    isSaved: input.isSaved,
    isPlanned: input.isPlanned,
    detailsHref: `/viagens/${input.tripId}/lugares/${input.place.slug}`,
    canIgnore: input.recommendation.status === "presented",
  });
}

export async function loadRecommendationExperience(
  tripId: string,
  now = new Date(),
  options: RecommendationExperienceOptions = {},
): Promise<RecommendationExperienceViewModel | null> {
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) return null;

  const destinationId = resolveTripDestinationId(trip.destination.name);
  if (!destinationId) {
    return {
      trip,
      destinationSupported: false,
      cards: [],
      activeCount: 0,
      rejectedCount: 0,
      invalidatedCount: 0,
      hasContextLimitations: true,
    };
  }

  const shouldPersist = options.persist ?? true;
  const recommendationRepository = shouldPersist
    ? new DrizzleRecommendationRepository()
    : undefined;
  const [profile, places, savedPlaces, itinerary, initialPersisted] = await Promise.all([
    findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId),
    listPublishedPlaces(new DrizzlePlaceRepository(), destinationId),
    listSavedPlaces(new DrizzleSavedPlaceRepository(), tripId),
    new DrizzleItineraryRepository().findByTripId(tripId),
    recommendationRepository
      ? recommendationRepository.listByTripId(tripId)
      : Promise.resolve<readonly Recommendation[]>([]),
  ]);

  const currentContext = {
    tripContextVersion: trip.contextVersion,
    ...(profile ? { travelerProfileVersion: profile.version } : {}),
    ...(itinerary ? { itineraryVersion: itinerary.version } : {}),
    destinationId,
  };
  let invalidatedCount = 0;
  const persisted: Recommendation[] = [];

  for (const recommendation of initialPersisted) {
    if (
      shouldPersist &&
      (recommendation.status === "generated" || recommendation.status === "presented") &&
      !hasCompatibleContext(recommendation, currentContext)
    ) {
      const invalidated = invalidateRecommendation(
        recommendation,
        "decision-context-version-changed",
        now,
      );
      await recommendationRepository!.save(invalidated);
      persisted.push(invalidated);
      invalidatedCount += 1;
    } else {
      persisted.push(recommendation);
    }
  }

  const savedPlaceIds = new Set(savedPlaces.map((savedPlace) => savedPlace.placeId));
  const itineraryPlaceIds = plannedPlaceIds(itinerary);
  const generated = generateDeterministicPlaceRecommendations({
    context: {
      tripId,
      destinationId,
      tripContextVersion: trip.contextVersion,
      interests: (profile?.interests ?? []) as readonly TravelerInterest[],
      ...(profile ? { travelerProfileVersion: profile.version } : {}),
      ...(itinerary ? { itineraryVersion: itinerary.version } : {}),
      ...(trip.accommodation?.coordinate
        ? { accommodationCoordinate: trip.accommodation.coordinate }
        : {}),
      savedPlaceIds,
      plannedPlaceIds: itineraryPlaceIds,
    },
    places,
    generatedAt: now,
    createRecommendationId: () => randomUUID(),
  });

  const cards: RecommendationCardViewModel[] = [];
  for (const result of generated) {
    let recommendation = latestEquivalentRecommendation(persisted, result.recommendation);

    if (!recommendation) {
      if (recommendationRepository) {
        recommendation = await recommendationRepository.saveGenerated(result.recommendation);
        persisted.push(recommendation);
      } else {
        recommendation = result.recommendation;
      }
    }

    if (recommendation.status === "generated" && recommendationRepository) {
      recommendation = presentRecommendation(recommendation, now);
      await recommendationRepository.save(recommendation);
      const index = persisted.findIndex((candidate) => candidate.id === recommendation?.id);
      if (index >= 0) persisted[index] = recommendation;
    }

    cards.push(
      toRecommendationCardViewModel({
        tripId,
        recommendation,
        place: result.place,
        ...(result.geodesicDistanceMeters !== undefined
          ? { geodesicDistanceMeters: result.geodesicDistanceMeters }
          : {}),
        isSaved: result.isSaved,
        isPlanned: result.isPlanned,
      }),
    );
  }

  return {
    trip,
    destinationSupported: true,
    cards: Object.freeze(cards),
    activeCount: cards.filter((card) => card.status === "presented").length,
    rejectedCount: cards.filter((card) => card.status === "rejected").length,
    invalidatedCount,
    hasContextLimitations: cards.some((card) =>
      card.limitations.some((limitation) => contextLimitationCodes.has(limitation.code)),
    ),
  };
}
