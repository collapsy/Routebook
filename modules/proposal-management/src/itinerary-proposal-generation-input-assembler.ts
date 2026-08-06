import type {
  ItineraryProposalGenerationCandidate,
  ItineraryProposalGenerationDay,
} from "./deterministic-itinerary-proposal-generator";

export const eligibleItineraryProposalRecommendationStatuses = ["generated", "presented"] as const;

export type EligibleItineraryProposalRecommendationStatus =
  (typeof eligibleItineraryProposalRecommendationStatuses)[number];

export type ItineraryProposalSourceDay = Readonly<{
  tripDayId: string;
  date: string;
  activities: readonly unknown[];
}>;

export type ItineraryProposalSourceItinerary = Readonly<{
  tripId: string;
  days: readonly ItineraryProposalSourceDay[];
}>;

export type ItineraryProposalSourceRecommendation = Readonly<{
  recommendationId: string;
  tripId: string;
  placeId: string;
  status: string;
  score: number;
  validFrom: Date;
  expiresAt?: Date;
  reason?: string;
}>;

export type ItineraryProposalSourcePlace = Readonly<{
  placeId: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  estimatedCostAmount?: number;
  estimatedCostCurrency?: string;
}>;

export type AssembleItineraryProposalGenerationInput = Readonly<{
  itinerary: ItineraryProposalSourceItinerary;
  recommendations: readonly ItineraryProposalSourceRecommendation[];
  places: readonly ItineraryProposalSourcePlace[];
  asOf: Date;
}>;

export type AssembledItineraryProposalGenerationInput = Readonly<{
  days: readonly ItineraryProposalGenerationDay[];
  candidates: readonly ItineraryProposalGenerationCandidate[];
}>;

export type ItineraryProposalGenerationInputAssemblyErrorCode =
  | "invalid-itinerary"
  | "invalid-day"
  | "duplicate-day"
  | "invalid-recommendation"
  | "duplicate-recommendation"
  | "recommendation-trip-mismatch"
  | "invalid-place"
  | "duplicate-place"
  | "place-not-found"
  | "invalid-as-of";

export class ItineraryProposalGenerationInputAssemblyError extends Error {
  constructor(
    message: string,
    readonly code: ItineraryProposalGenerationInputAssemblyErrorCode,
  ) {
    super(message);
    this.name = "ItineraryProposalGenerationInputAssemblyError";
  }
}

function requiredText(
  value: string | undefined,
  code: ItineraryProposalGenerationInputAssemblyErrorCode,
  message: string,
): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) throw new ItineraryProposalGenerationInputAssemblyError(message, code);
  return normalized;
}

function optionalText(
  value: string | undefined,
  code: ItineraryProposalGenerationInputAssemblyErrorCode,
  message: string,
): string | undefined {
  if (value === undefined) return undefined;
  return requiredText(value, code, message);
}

function validDate(
  value: Date,
  code: ItineraryProposalGenerationInputAssemblyErrorCode,
  message: string,
): Date {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new ItineraryProposalGenerationInputAssemblyError(message, code);
  }
  return new Date(value.getTime());
}

function compareCanonicalText(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function normalizeDays(
  itinerary: ItineraryProposalSourceItinerary,
): readonly ItineraryProposalGenerationDay[] {
  if (!itinerary || typeof itinerary !== "object") {
    throw new ItineraryProposalGenerationInputAssemblyError(
      "Informe um Itinerary válido.",
      "invalid-itinerary",
    );
  }
  requiredText(itinerary.tripId, "invalid-itinerary", "Informe um TripId válido.");
  if (!Array.isArray(itinerary.days) || itinerary.days.length === 0) {
    throw new ItineraryProposalGenerationInputAssemblyError(
      "O Itinerary deve possuir ao menos um Dia.",
      "invalid-itinerary",
    );
  }

  const ids = new Set<string>();
  const days = itinerary.days.map((day) => {
    if (!day || typeof day !== "object") {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "Informe um Dia válido.",
        "invalid-day",
      );
    }
    const tripDayId = requiredText(day.tripDayId, "invalid-day", "Informe um TripDayId válido.");
    const date = requiredText(day.date, "invalid-day", "Informe uma data válida.");
    if (!isValidIsoDate(date) || !Array.isArray(day.activities)) {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "Informe data civil válida e coleção de Atividades para o Dia.",
        "invalid-day",
      );
    }
    if (ids.has(tripDayId)) {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "Cada Dia deve possuir um TripDayId único.",
        "duplicate-day",
      );
    }
    ids.add(tripDayId);
    return Object.freeze({ tripDayId, date, existingActivityCount: day.activities.length });
  });

  return Object.freeze(
    days.sort(
      (left, right) =>
        compareCanonicalText(left.date, right.date) ||
        compareCanonicalText(left.tripDayId, right.tripDayId),
    ),
  );
}

function normalizePlaces(
  places: readonly ItineraryProposalSourcePlace[],
): ReadonlyMap<string, ItineraryProposalSourcePlace> {
  if (!Array.isArray(places)) {
    throw new ItineraryProposalGenerationInputAssemblyError(
      "Informe uma coleção de Places.",
      "invalid-place",
    );
  }
  const byId = new Map<string, ItineraryProposalSourcePlace>();
  for (const source of places) {
    if (!source || typeof source !== "object") {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "Informe um Place válido.",
        "invalid-place",
      );
    }
    const placeId = requiredText(source.placeId, "invalid-place", "Informe um PlaceId válido.");
    const title = requiredText(source.title, "invalid-place", "Informe um título para o Place.");
    const description = optionalText(
      source.description,
      "invalid-place",
      "Informe uma descrição válida para o Place.",
    );
    if (
      source.durationMinutes !== undefined &&
      (!Number.isInteger(source.durationMinutes) || source.durationMinutes < 1)
    ) {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "A duração do Place deve ser um inteiro positivo.",
        "invalid-place",
      );
    }
    if (
      source.estimatedCostAmount !== undefined &&
      (!Number.isFinite(source.estimatedCostAmount) || source.estimatedCostAmount < 0)
    ) {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "O custo estimado do Place deve ser finito e não negativo.",
        "invalid-place",
      );
    }
    const estimatedCostCurrency = optionalText(
      source.estimatedCostCurrency,
      "invalid-place",
      "Informe uma moeda válida para o Place.",
    )?.toUpperCase();
    if (estimatedCostCurrency !== undefined && !/^[A-Z]{3}$/.test(estimatedCostCurrency)) {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "Use uma moeda com três letras.",
        "invalid-place",
      );
    }
    if (byId.has(placeId)) {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "Cada Place deve possuir um PlaceId único.",
        "duplicate-place",
      );
    }
    byId.set(
      placeId,
      Object.freeze({
        placeId,
        title,
        ...(description ? { description } : {}),
        ...(source.durationMinutes !== undefined
          ? { durationMinutes: source.durationMinutes }
          : {}),
        ...(source.estimatedCostAmount !== undefined
          ? { estimatedCostAmount: source.estimatedCostAmount }
          : {}),
        ...(estimatedCostCurrency ? { estimatedCostCurrency } : {}),
      }),
    );
  }
  return byId;
}

function isEligibleStatus(status: string): status is EligibleItineraryProposalRecommendationStatus {
  return eligibleItineraryProposalRecommendationStatuses.includes(
    status as EligibleItineraryProposalRecommendationStatus,
  );
}

function normalizeCandidates(
  tripId: string,
  recommendations: readonly ItineraryProposalSourceRecommendation[],
  placesById: ReadonlyMap<string, ItineraryProposalSourcePlace>,
  asOf: Date,
): readonly ItineraryProposalGenerationCandidate[] {
  if (!Array.isArray(recommendations)) {
    throw new ItineraryProposalGenerationInputAssemblyError(
      "Informe uma coleção de Recommendations.",
      "invalid-recommendation",
    );
  }

  const ids = new Set<string>();
  const eligible: Array<{
    recommendationId: string;
    placeId: string;
    score: number;
    reason?: string;
  }> = [];

  for (const source of recommendations) {
    if (!source || typeof source !== "object") {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "Informe uma Recommendation válida.",
        "invalid-recommendation",
      );
    }
    const recommendationId = requiredText(
      source.recommendationId,
      "invalid-recommendation",
      "Informe um RecommendationId válido.",
    );
    if (ids.has(recommendationId)) {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "Cada Recommendation deve possuir um RecommendationId único.",
        "duplicate-recommendation",
      );
    }
    ids.add(recommendationId);
    const recommendationTripId = requiredText(
      source.tripId,
      "invalid-recommendation",
      "Informe o TripId da Recommendation.",
    );
    if (recommendationTripId !== tripId) {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "A Recommendation não pertence à Trip do Itinerary.",
        "recommendation-trip-mismatch",
      );
    }
    const placeId = requiredText(
      source.placeId,
      "invalid-recommendation",
      "Informe o PlaceId da Recommendation.",
    );
    if (!Number.isFinite(source.score)) {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "Informe score finito para a Recommendation.",
        "invalid-recommendation",
      );
    }
    const validFrom = validDate(
      source.validFrom,
      "invalid-recommendation",
      "Informe validFrom válido para a Recommendation.",
    );
    const expiresAt =
      source.expiresAt === undefined
        ? undefined
        : validDate(
            source.expiresAt,
            "invalid-recommendation",
            "Informe expiresAt válido para a Recommendation.",
          );
    if (expiresAt && expiresAt.getTime() <= validFrom.getTime()) {
      throw new ItineraryProposalGenerationInputAssemblyError(
        "expiresAt deve ser posterior a validFrom.",
        "invalid-recommendation",
      );
    }
    const reason = optionalText(
      source.reason,
      "invalid-recommendation",
      "Informe uma justificativa válida.",
    );

    if (
      isEligibleStatus(source.status) &&
      validFrom.getTime() <= asOf.getTime() &&
      (expiresAt === undefined || asOf.getTime() < expiresAt.getTime())
    ) {
      eligible.push({
        recommendationId,
        placeId,
        score: source.score,
        ...(reason ? { reason } : {}),
      });
    }
  }

  eligible.sort(
    (left, right) =>
      right.score - left.score ||
      compareCanonicalText(left.recommendationId, right.recommendationId),
  );

  return Object.freeze(
    eligible.map((recommendation) => {
      const place = placesById.get(recommendation.placeId);
      if (!place) {
        throw new ItineraryProposalGenerationInputAssemblyError(
          `Place ${recommendation.placeId} não encontrado para Recommendation elegível.`,
          "place-not-found",
        );
      }
      return Object.freeze({
        candidateId: recommendation.recommendationId,
        placeId: place.placeId,
        title: place.title,
        ...(place.description ? { description: place.description } : {}),
        ...(place.durationMinutes !== undefined ? { durationMinutes: place.durationMinutes } : {}),
        ...(recommendation.reason ? { reason: recommendation.reason } : {}),
        ...(place.estimatedCostAmount !== undefined
          ? { estimatedCostAmount: place.estimatedCostAmount }
          : {}),
        ...(place.estimatedCostCurrency
          ? { estimatedCostCurrency: place.estimatedCostCurrency }
          : {}),
      });
    }),
  );
}

export function assembleItineraryProposalGenerationInput(
  input: AssembleItineraryProposalGenerationInput,
): AssembledItineraryProposalGenerationInput {
  const asOf = validDate(input?.asOf, "invalid-as-of", "Informe um instante asOf válido.");
  const days = normalizeDays(input?.itinerary);
  const tripId = requiredText(
    input.itinerary.tripId,
    "invalid-itinerary",
    "Informe um TripId válido.",
  );
  const placesById = normalizePlaces(input?.places);
  const candidates = normalizeCandidates(tripId, input?.recommendations, placesById, asOf);
  return Object.freeze({ days, candidates });
}
