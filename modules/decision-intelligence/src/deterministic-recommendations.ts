import { calculateGeodesicDistance, type GeoCoordinate } from "@routebook/geo-distance";
import type { Place, PlaceCategory } from "@routebook/place-catalog";

import {
  createRecommendation,
  type DecisionContextSnapshot,
  type Recommendation,
  type RecommendationConfidence,
  type RecommendationLimitation,
  type RecommendationReason,
} from "./recommendation";

export const INTEREST_MATCH_WEIGHT = 100;
export const DISTANCE_UP_TO_2_KM_WEIGHT = 30;
export const DISTANCE_UP_TO_5_KM_WEIGHT = 20;
export const DISTANCE_UP_TO_10_KM_WEIGHT = 10;
export const DISTANCE_ABOVE_10_KM_WEIGHT = 0;
export const DETERMINISTIC_RECOMMENDATION_POLICY_VERSION = "place-ranking-v1";

export const SUPPORTED_INTEREST_CATEGORY_MAP = Object.freeze({
  beaches: "beach",
  gastronomy: "gastronomy",
  nature: "nature",
  nightlife: "nightlife",
} satisfies Readonly<Record<string, PlaceCategory>>);

export const unsupportedTravelerInterests = ["culture", "rest", "adventure", "shopping"] as const;

export type TravelerInterest =
  keyof typeof SUPPORTED_INTEREST_CATEGORY_MAP | (typeof unsupportedTravelerInterests)[number];

export type DeterministicRecommendationContext = Readonly<{
  tripId: string;
  destinationId: string;
  tripContextVersion: number;
  travelerProfileVersion?: number;
  itineraryVersion?: number;
  interests: readonly TravelerInterest[];
  accommodationCoordinate?: GeoCoordinate;
  savedPlaceIds?: ReadonlySet<string>;
  plannedPlaceIds?: ReadonlySet<string>;
}>;

export type GeneratedPlaceRecommendation = Readonly<{
  recommendation: Recommendation;
  place: Place;
  geodesicDistanceMeters?: number;
  isSaved: boolean;
  isPlanned: boolean;
}>;

export type GenerateDeterministicRecommendationsInput = Readonly<{
  context: DeterministicRecommendationContext;
  places: readonly Place[];
  generatedAt: Date;
  createRecommendationId: (place: Place, index: number) => string;
}>;

function normalizedInterests(interests: readonly TravelerInterest[]): readonly TravelerInterest[] {
  return Object.freeze([...new Set(interests)].sort());
}

function supportedCategories(interests: readonly TravelerInterest[]): ReadonlySet<PlaceCategory> {
  const categories = interests.flatMap((interest) => {
    const category =
      SUPPORTED_INTEREST_CATEGORY_MAP[interest as keyof typeof SUPPORTED_INTEREST_CATEGORY_MAP];
    return category ? [category] : [];
  });
  return new Set(categories);
}

function unsupportedInterests(interests: readonly TravelerInterest[]): readonly TravelerInterest[] {
  return interests.filter((interest) => !(interest in SUPPORTED_INTEREST_CATEGORY_MAP));
}

export function distanceWeight(distanceMeters: number): number {
  if (distanceMeters <= 2_000) return DISTANCE_UP_TO_2_KM_WEIGHT;
  if (distanceMeters <= 5_000) return DISTANCE_UP_TO_5_KM_WEIGHT;
  if (distanceMeters <= 10_000) return DISTANCE_UP_TO_10_KM_WEIGHT;
  return DISTANCE_ABOVE_10_KM_WEIGHT;
}

function confidenceFor(
  hasSupportedInterests: boolean,
  hasDistance: boolean,
): RecommendationConfidence {
  if (hasSupportedInterests && hasDistance) {
    return {
      level: "high",
      basis: ["interesses compatíveis disponíveis", "distância geodésica da hospedagem disponível"],
    };
  }

  if (hasSupportedInterests || hasDistance) {
    return {
      level: "medium",
      basis: [
        hasSupportedInterests
          ? "interesses compatíveis disponíveis"
          : "distância geodésica da hospedagem disponível",
      ],
    };
  }

  return {
    level: "low",
    basis: ["somente dados básicos do Destino e do catálogo estão disponíveis"],
  };
}

function commonLimitations(
  context: DeterministicRecommendationContext,
  unsupported: readonly TravelerInterest[],
): RecommendationLimitation[] {
  const limitations: RecommendationLimitation[] = [
    {
      code: "catalog-operational-data-unavailable",
      message:
        "O catálogo não possui preço real, avaliação pública, horário de funcionamento ou disponibilidade verificável para esta recomendação.",
    },
  ];

  if (!context.accommodationCoordinate) {
    limitations.push({
      code: "accommodation-distance-unavailable",
      message: "A Hospedagem não possui coordenadas; a distância não participou da ordenação.",
    });
  }

  if (unsupported.length > 0) {
    limitations.push({
      code: "interest-category-unavailable",
      message: `Os interesses ${unsupported.join(", ")} não possuem categoria correspondente no catálogo atual e não participaram do score.`,
    });
  }

  return limitations;
}

function snapshotFor(
  context: DeterministicRecommendationContext,
  generatedAt: Date,
): DecisionContextSnapshot {
  return {
    schemaVersion: 1,
    tripId: context.tripId,
    destinationId: context.destinationId,
    tripContextVersion: context.tripContextVersion,
    capturedAt: generatedAt,
    ...(context.travelerProfileVersion !== undefined
      ? { travelerProfileVersion: context.travelerProfileVersion }
      : {}),
    ...(context.itineraryVersion !== undefined
      ? { itineraryVersion: context.itineraryVersion }
      : {}),
  };
}

function evaluatePlace(
  place: Place,
  context: DeterministicRecommendationContext,
  categories: ReadonlySet<PlaceCategory>,
  unsupported: readonly TravelerInterest[],
): Readonly<{
  place: Place;
  score: number;
  reasons: readonly RecommendationReason[];
  limitations: readonly RecommendationLimitation[];
  confidence: RecommendationConfidence;
  geodesicDistanceMeters?: number;
}> {
  const reasons: RecommendationReason[] = [
    {
      code: "published-place-in-trip-destination",
      message: "O Lugar está publicado no catálogo do Destino desta Viagem.",
      evidence: {
        placeId: place.id,
        destinationId: place.destinationId,
        publicationStatus: place.publicationStatus,
      },
    },
  ];
  let score = 0;
  const categoryMatchesInterest = categories.has(place.category);

  if (categoryMatchesInterest) {
    score += INTEREST_MATCH_WEIGHT;
    reasons.push({
      code: "interest-category-match",
      message: "A categoria do Lugar corresponde a um interesse informado.",
      evidence: { category: place.category },
    });
  }

  let geodesicDistanceMeters: number | undefined;
  const limitations = commonLimitations(context, unsupported);

  if (context.accommodationCoordinate) {
    try {
      const distance = calculateGeodesicDistance(context.accommodationCoordinate, {
        latitude: place.latitude,
        longitude: place.longitude,
      });
      geodesicDistanceMeters = distance.meters;
      score += distanceWeight(distance.meters);
      reasons.push({
        code: "geodesic-distance-known",
        message:
          "A distância geodésica em linha reta entre a Hospedagem e o Lugar foi considerada.",
        evidence: {
          distanceMeters: Math.round(distance.meters),
          measurement: "geodesic-straight-line",
        },
      });
    } catch {
      limitations.push({
        code: "geodesic-distance-could-not-be-evaluated",
        message:
          "A distância geodésica não pôde ser avaliada para este Lugar; os demais critérios continuaram válidos.",
      });
    }
  }

  return {
    place,
    score,
    reasons,
    limitations,
    confidence: confidenceFor(categories.size > 0, geodesicDistanceMeters !== undefined),
    ...(geodesicDistanceMeters !== undefined ? { geodesicDistanceMeters } : {}),
  };
}

export function generateDeterministicPlaceRecommendations(
  input: GenerateDeterministicRecommendationsInput,
): readonly GeneratedPlaceRecommendation[] {
  const interests = normalizedInterests(input.context.interests);
  const categories = supportedCategories(interests);
  const unsupported = unsupportedInterests(interests);
  const snapshot = snapshotFor(input.context, input.generatedAt);

  const evaluated = input.places
    .filter(
      (place) =>
        place.publicationStatus === "published" &&
        place.destinationId === input.context.destinationId,
    )
    .map((place) => evaluatePlace(place, input.context, categories, unsupported))
    .sort(
      (left, right) => right.score - left.score || left.place.slug.localeCompare(right.place.slug),
    );

  return Object.freeze(
    evaluated.map((result, index) => {
      const recommendation = createRecommendation({
        id: input.createRecommendationId(result.place, index),
        snapshot,
        target: {
          kind: "place",
          placeId: result.place.id,
          destinationId: result.place.destinationId,
          publicationStatus: "published",
        },
        reasons: result.reasons,
        limitations: result.limitations,
        score: { value: result.score, purpose: "ordering-only" },
        confidence: result.confidence,
        validity: { validFrom: input.generatedAt },
        generation: {
          generator: "deterministic",
          policyVersion: DETERMINISTIC_RECOMMENDATION_POLICY_VERSION,
          generatedAt: input.generatedAt,
        },
      });

      return Object.freeze({
        recommendation,
        place: result.place,
        ...(result.geodesicDistanceMeters !== undefined
          ? { geodesicDistanceMeters: result.geodesicDistanceMeters }
          : {}),
        isSaved: input.context.savedPlaceIds?.has(result.place.id) ?? false,
        isPlanned: input.context.plannedPlaceIds?.has(result.place.id) ?? false,
      });
    }),
  );
}
