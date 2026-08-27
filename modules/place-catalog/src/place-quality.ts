import type { PlaceCategory } from "./place";

export type PlaceRatingSignal = Readonly<{
  value: number;
  scaleMax: number;
  reviewCount?: number;
}>;

export type PlacePopularitySignal = Readonly<{
  value: number;
  scaleMax: number;
}>;

export type PlaceQualitySignals = Readonly<{
  provider: string;
  externalId: string;
  rating?: PlaceRatingSignal;
  popularity?: PlacePopularitySignal;
  openNow?: boolean;
  collectedAt: Date;
  sourceVersion?: string;
  expiresAt?: Date;
}>;

export type PlaceQualityTarget = Readonly<{
  id: string;
  name: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  addressLabel?: string;
}>;

export type PlaceQualitySignalMatch = Readonly<{
  targetId: string;
  signals: PlaceQualitySignals;
}>;

export interface PlaceQualitySignalsPort {
  findSignals(targets: readonly PlaceQualityTarget[]): Promise<readonly PlaceQualitySignalMatch[]>;
}

export type PlaceQualityScore = Readonly<{
  score: number;
  reputationScore?: number;
  popularityScore?: number;
  distanceScore?: number;
  openingScore?: number;
  reasons: readonly string[];
}>;

type PlaceQualityScoreInput = Readonly<{
  category: PlaceCategory;
  distanceMeters?: number;
  signals: PlaceQualitySignals;
  contextualNow?: boolean;
}>;

const RATING_PRIOR_MEAN = 0.72;
const RATING_PRIOR_WEIGHT = 40;
const UNKNOWN_REVIEW_COUNT_WEIGHT = 10;

const CATEGORY_WEIGHTS: Readonly<
  Record<
    PlaceCategory,
    Readonly<{
      reputation: number;
      popularity: number;
      distance: number;
      opening: number;
    }>
  >
> = Object.freeze({
  beach: { reputation: 0.55, popularity: 0.25, distance: 0.2, opening: 0 },
  gastronomy: { reputation: 0.55, popularity: 0.15, distance: 0.15, opening: 0.15 },
  nightlife: { reputation: 0.4, popularity: 0.3, distance: 0.1, opening: 0.2 },
  nature: { reputation: 0.55, popularity: 0.25, distance: 0.2, opening: 0 },
});

function isFiniteNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function normalizeScale(value: number, scaleMax: number): number {
  return Math.min(1, Math.max(0, value / scaleMax));
}

export function validatePlaceQualitySignals(signals: PlaceQualitySignals): void {
  if (!signals.provider.trim())
    throw new Error("O Provider dos sinais de qualidade é obrigatório.");
  if (!signals.externalId.trim()) {
    throw new Error("A referência externa dos sinais de qualidade é obrigatória.");
  }
  if (Number.isNaN(signals.collectedAt.getTime())) {
    throw new Error("O instante de coleta dos sinais de qualidade é inválido.");
  }
  if (signals.expiresAt) {
    if (Number.isNaN(signals.expiresAt.getTime())) {
      throw new Error("A validade dos sinais de qualidade é inválida.");
    }
    if (signals.expiresAt.getTime() < signals.collectedAt.getTime()) {
      throw new Error("A validade dos sinais não pode anteceder a coleta.");
    }
  }

  if (signals.rating) {
    const { value, scaleMax, reviewCount } = signals.rating;
    if (
      !Number.isFinite(scaleMax) ||
      scaleMax <= 0 ||
      !isFiniteNonNegative(value) ||
      value > scaleMax
    ) {
      throw new Error("O rating externo possui escala ou valor inválido.");
    }
    if (reviewCount !== undefined && (!Number.isInteger(reviewCount) || reviewCount < 0)) {
      throw new Error("A quantidade de avaliações deve ser um inteiro não negativo.");
    }
  }

  if (signals.popularity) {
    const { value, scaleMax } = signals.popularity;
    if (
      !Number.isFinite(scaleMax) ||
      scaleMax <= 0 ||
      !isFiniteNonNegative(value) ||
      value > scaleMax
    ) {
      throw new Error("A popularidade externa possui escala ou valor inválido.");
    }
  }
}

export function calculateBayesianReputation(signal: PlaceRatingSignal): number {
  const normalizedRating = normalizeScale(signal.value, signal.scaleMax);
  const effectiveReviewCount = signal.reviewCount ?? UNKNOWN_REVIEW_COUNT_WEIGHT;
  return (
    (normalizedRating * effectiveReviewCount + RATING_PRIOR_MEAN * RATING_PRIOR_WEIGHT) /
    (effectiveReviewCount + RATING_PRIOR_WEIGHT)
  );
}

function calculateDistanceScore(distanceMeters?: number): number | undefined {
  if (distanceMeters === undefined || !isFiniteNonNegative(distanceMeters)) return undefined;
  return 1 / (1 + distanceMeters / 3_000);
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 10;
}

export function calculatePlaceQualityScore(
  input: PlaceQualityScoreInput,
): PlaceQualityScore | undefined {
  try {
    validatePlaceQualitySignals(input.signals);
  } catch {
    return undefined;
  }

  const reputationScore = input.signals.rating
    ? calculateBayesianReputation(input.signals.rating)
    : undefined;
  const popularityScore = input.signals.popularity
    ? normalizeScale(input.signals.popularity.value, input.signals.popularity.scaleMax)
    : undefined;

  // Distância e horário contextualizam qualidade; não criam reputação quando não há evidência externa.
  if (reputationScore === undefined && popularityScore === undefined) return undefined;

  const distanceScore = calculateDistanceScore(input.distanceMeters);
  const openingScore =
    input.contextualNow && input.signals.openNow !== undefined
      ? Number(input.signals.openNow)
      : undefined;
  const weights = CATEGORY_WEIGHTS[input.category];
  const components = [
    reputationScore === undefined
      ? undefined
      : { value: reputationScore, weight: weights.reputation },
    popularityScore === undefined
      ? undefined
      : { value: popularityScore, weight: weights.popularity },
    distanceScore === undefined || weights.distance === 0
      ? undefined
      : { value: distanceScore, weight: weights.distance },
    openingScore === undefined || weights.opening === 0
      ? undefined
      : { value: openingScore, weight: weights.opening },
  ].filter(
    (component): component is Readonly<{ value: number; weight: number }> =>
      component !== undefined && component.weight > 0,
  );

  const totalWeight = components.reduce((total, component) => total + component.weight, 0);
  const weightedScore =
    components.reduce((total, component) => total + component.value * component.weight, 0) /
    totalWeight;

  const reasons: string[] = [];
  if (reputationScore !== undefined && reputationScore >= 0.85) {
    reasons.push("Muito bem avaliado");
  }
  if ((input.signals.rating?.reviewCount ?? 0) >= 500) reasons.push("Muitas avaliações");
  if (popularityScore !== undefined && popularityScore >= 0.75) reasons.push("Popular na região");
  if (input.distanceMeters !== undefined && input.distanceMeters <= 1_500) {
    reasons.push("Perto da referência da viagem");
  }
  if (openingScore === 1) reasons.push("Aberto agora");

  return {
    score: roundScore(weightedScore),
    ...(reputationScore === undefined ? {} : { reputationScore }),
    ...(popularityScore === undefined ? {} : { popularityScore }),
    ...(distanceScore === undefined ? {} : { distanceScore }),
    ...(openingScore === undefined ? {} : { openingScore }),
    reasons,
  };
}
