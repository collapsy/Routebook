import {
  DrizzlePlaceRepository,
  DrizzleTravelerProfileRepository,
  PlacePromotionServiceError,
  promoteExternalPlaceCandidate,
  type PromoteExternalPlaceCandidateInput,
  type PromoteExternalPlaceCandidateResult,
} from "@routebook/database";
import type { TravelerInterest } from "@routebook/decision-intelligence";
import type { ExternalPlaceCandidate, Place } from "@routebook/place-catalog";
import type { ItineraryProposalGenerationCandidate } from "@routebook/proposal-management";
import type { Itinerary, Trip } from "@routebook/trip-management";

import {
  loadRecommendationDiscoverySuggestions,
  type RecommendationDiscoverySuggestions,
} from "./recommendation-discovery-suggestions";

const ITINERARY_PROPOSAL_DESIRED_ACTIVITY_COUNT_PER_DAY = 3;

export type ItineraryProposalDiscoveryCandidateDependencies = Readonly<{
  travelerProfileRepository?: Pick<DrizzleTravelerProfileRepository, "findByTripId">;
  placeRepository?: Pick<DrizzlePlaceRepository, "listByIds">;
  loadDiscovery?: (
    trip: Trip,
    interests: readonly TravelerInterest[],
    selectionLimit: number,
  ) => Promise<RecommendationDiscoverySuggestions>;
  promoteCandidate?: (
    input: PromoteExternalPlaceCandidateInput,
  ) => Promise<PromoteExternalPlaceCandidateResult>;
}>;

function plannedPlaceIds(itinerary: Itinerary): ReadonlySet<string> {
  return new Set(
    itinerary.days.flatMap((day) =>
      day.activities.flatMap((activity) => (activity.placeId ? [activity.placeId] : [])),
    ),
  );
}

function discoveryCandidateLimit(itinerary: Itinerary): number {
  return itinerary.days.reduce((total, day) => {
    const protectedFreePeriodCount = day.freePeriods.filter(
      (freePeriod) => freePeriod.mode === "protected",
    ).length;
    const flexibleFreePeriodCount = day.freePeriods.filter(
      (freePeriod) => freePeriod.mode === "flexible",
    ).length;
    const intentionallyEmpty =
      day.activities.length === 0 && protectedFreePeriodCount > 0 && flexibleFreePeriodCount === 0;
    if (intentionallyEmpty) return total;

    const availableSlots = Math.max(
      0,
      ITINERARY_PROPOSAL_DESIRED_ACTIVITY_COUNT_PER_DAY -
        day.activities.length -
        protectedFreePeriodCount,
    );
    return total + availableSlots;
  }, 0);
}

function placeById(places: readonly Place[]): ReadonlyMap<string, Place> {
  return new Map(places.map((place) => [place.id, place]));
}

function candidateId(candidate: ExternalPlaceCandidate): string {
  return `discovery:${candidate.provider}:${candidate.externalId}`;
}

function shouldSkipPromotionError(error: unknown): boolean {
  return (
    error instanceof PlacePromotionServiceError &&
    (error.code === "candidate-rejected" || error.code === "possible-match")
  );
}

export async function loadItineraryProposalDiscoveryCandidates(
  trip: Trip,
  itinerary: Itinerary,
  dependencies: ItineraryProposalDiscoveryCandidateDependencies = {},
): Promise<readonly ItineraryProposalGenerationCandidate[]> {
  if (itinerary.tripId !== trip.id) {
    throw new Error("O Roteiro informado não pertence à Viagem da geração de Proposal.");
  }

  const selectionLimit = discoveryCandidateLimit(itinerary);
  if (selectionLimit === 0) return Object.freeze([]);

  const travelerProfileRepository =
    dependencies.travelerProfileRepository ?? new DrizzleTravelerProfileRepository();
  const placeRepository = dependencies.placeRepository ?? new DrizzlePlaceRepository();
  const loadDiscovery =
    dependencies.loadDiscovery ??
    ((currentTrip, interests, limit) =>
      loadRecommendationDiscoverySuggestions(currentTrip, interests, { selectionLimit: limit }));
  const promoteCandidate = dependencies.promoteCandidate ?? promoteExternalPlaceCandidate;

  const profile = await travelerProfileRepository.findByTripId(trip.id);
  const interests = (profile?.interests ?? []) as readonly TravelerInterest[];
  const discovery = await loadDiscovery(trip, interests, selectionLimit);
  if (discovery.candidates.length === 0) return Object.freeze([]);

  const plannedIds = plannedPlaceIds(itinerary);
  const promoted: Array<{
    source: ExternalPlaceCandidate;
    placeId: string;
  }> = [];
  const seenPlaceIds = new Set<string>();

  for (const source of discovery.candidates) {
    let result: PromoteExternalPlaceCandidateResult;
    try {
      result = await promoteCandidate({ candidate: source });
    } catch (error) {
      if (shouldSkipPromotionError(error)) continue;
      throw error;
    }

    if (plannedIds.has(result.placeId) || seenPlaceIds.has(result.placeId)) continue;
    seenPlaceIds.add(result.placeId);
    promoted.push({ source, placeId: result.placeId });
  }

  if (promoted.length === 0) return Object.freeze([]);

  const places = await placeRepository.listByIds(promoted.map(({ placeId }) => placeId));
  const placesById = placeById(places);

  return Object.freeze(
    promoted.flatMap<ItineraryProposalGenerationCandidate>(({ source, placeId }) => {
      const place = placesById.get(placeId);
      if (!place) return [];

      return [
        Object.freeze({
          candidateId: candidateId(source),
          placeId,
          title: place.name,
          reason: "Lugar selecionado entre opções seguras da área desta Viagem.",
        }),
      ];
    }),
  );
}
