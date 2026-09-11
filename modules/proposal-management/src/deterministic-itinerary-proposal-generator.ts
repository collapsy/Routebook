import type {
  CompleteItineraryProposalGenerationInput,
  ProposedActivityInput,
} from "./itinerary-proposal";

export const DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_METHOD =
  "deterministic-contextual-composition";
export const DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_VERSION = "3";
export const DETERMINISTIC_ITINERARY_PROPOSAL_VALIDITY_HOURS = 24;
export const DEFAULT_DETERMINISTIC_ACTIVITY_DURATION_MINUTES = 90;
export const DETERMINISTIC_DESIRED_ACTIVITY_COUNT_PER_DAY = 3;

export type ItineraryProposalGenerationCoordinate = Readonly<{
  latitude: number;
  longitude: number;
}>;

export type ItineraryProposalGenerationDay = Readonly<{
  tripDayId: string;
  date: string;
  existingActivityCount: number;
  protectedFreePeriodCount?: number;
  flexibleFreePeriodCount?: number;
}>;

export type ItineraryProposalGenerationCandidate = Readonly<{
  candidateId: string;
  placeId?: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  reason?: string;
  estimatedCostAmount?: number;
  estimatedCostCurrency?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
}>;

export type GenerateItineraryProposalInput = Readonly<{
  days: readonly ItineraryProposalGenerationDay[];
  candidates: readonly ItineraryProposalGenerationCandidate[];
  generatedAt: Date;
  anchorCoordinate?: ItineraryProposalGenerationCoordinate;
  createProposedActivityId: (
    candidate: ItineraryProposalGenerationCandidate,
    index: number,
  ) => string;
}>;

export interface ItineraryProposalGenerationPort {
  generate(
    input: GenerateItineraryProposalInput,
  ): Promise<CompleteItineraryProposalGenerationInput>;
}

export type DeterministicItineraryProposalGenerationErrorCode =
  | "days-required"
  | "duplicate-day"
  | "invalid-day"
  | "duplicate-candidate"
  | "invalid-candidate"
  | "invalid-anchor-coordinate"
  | "invalid-generated-at"
  | "invalid-validity"
  | "invalid-proposed-activity-id"
  | "duplicate-proposed-activity-id";

export class DeterministicItineraryProposalGenerationError extends Error {
  constructor(
    message: string,
    readonly code: DeterministicItineraryProposalGenerationErrorCode,
  ) {
    super(message);
    this.name = "DeterministicItineraryProposalGenerationError";
  }
}

function requiredText(
  value: string | undefined,
  code: DeterministicItineraryProposalGenerationErrorCode,
  message: string,
): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) throw new DeterministicItineraryProposalGenerationError(message, code);
  return normalized;
}

function normalizedOptionalText(
  value: string | undefined,
  code: DeterministicItineraryProposalGenerationErrorCode,
  message: string,
): string | undefined {
  return value === undefined ? undefined : requiredText(value, code, message);
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

function validCoordinate(
  coordinate: ItineraryProposalGenerationCoordinate,
  code: DeterministicItineraryProposalGenerationErrorCode,
  message: string,
): ItineraryProposalGenerationCoordinate {
  if (
    !coordinate ||
    typeof coordinate !== "object" ||
    !Number.isFinite(coordinate.latitude) ||
    coordinate.latitude < -90 ||
    coordinate.latitude > 90 ||
    !Number.isFinite(coordinate.longitude) ||
    coordinate.longitude < -180 ||
    coordinate.longitude > 180
  ) {
    throw new DeterministicItineraryProposalGenerationError(message, code);
  }
  return Object.freeze({ latitude: coordinate.latitude, longitude: coordinate.longitude });
}

function hasFreePeriodContext(day: ItineraryProposalGenerationDay): boolean {
  return day.protectedFreePeriodCount !== undefined && day.flexibleFreePeriodCount !== undefined;
}

function normalizeDay(day: ItineraryProposalGenerationDay): ItineraryProposalGenerationDay {
  if (!day || typeof day !== "object") {
    throw new DeterministicItineraryProposalGenerationError(
      "Informe um Dia válido.",
      "invalid-day",
    );
  }

  const tripDayId = requiredText(day.tripDayId, "invalid-day", "Informe um TripDayId válido.");
  const date = requiredText(day.date, "invalid-day", "Informe uma data válida para o Dia.");

  if (!isValidIsoDate(date)) {
    throw new DeterministicItineraryProposalGenerationError(
      "Use uma data existente no formato YYYY-MM-DD.",
      "invalid-day",
    );
  }

  if (!Number.isInteger(day.existingActivityCount) || day.existingActivityCount < 0) {
    throw new DeterministicItineraryProposalGenerationError(
      "A quantidade de Atividades existentes deve ser um inteiro maior ou igual a zero.",
      "invalid-day",
    );
  }

  const hasProtectedCount = day.protectedFreePeriodCount !== undefined;
  const hasFlexibleCount = day.flexibleFreePeriodCount !== undefined;
  if (hasProtectedCount !== hasFlexibleCount) {
    throw new DeterministicItineraryProposalGenerationError(
      "O contexto de Free Periods deve informar as contagens protected e flexible em conjunto.",
      "invalid-day",
    );
  }

  if (
    (day.protectedFreePeriodCount !== undefined &&
      (!Number.isInteger(day.protectedFreePeriodCount) || day.protectedFreePeriodCount < 0)) ||
    (day.flexibleFreePeriodCount !== undefined &&
      (!Number.isInteger(day.flexibleFreePeriodCount) || day.flexibleFreePeriodCount < 0))
  ) {
    throw new DeterministicItineraryProposalGenerationError(
      "As contagens de Free Periods devem ser inteiros maiores ou iguais a zero.",
      "invalid-day",
    );
  }

  return Object.freeze({
    tripDayId,
    date,
    existingActivityCount: day.existingActivityCount,
    ...(day.protectedFreePeriodCount !== undefined
      ? { protectedFreePeriodCount: day.protectedFreePeriodCount }
      : {}),
    ...(day.flexibleFreePeriodCount !== undefined
      ? { flexibleFreePeriodCount: day.flexibleFreePeriodCount }
      : {}),
  });
}

function normalizeCandidate(
  candidate: ItineraryProposalGenerationCandidate,
): ItineraryProposalGenerationCandidate {
  if (!candidate || typeof candidate !== "object") {
    throw new DeterministicItineraryProposalGenerationError(
      "Informe um candidato válido.",
      "invalid-candidate",
    );
  }

  const candidateId = requiredText(
    candidate.candidateId,
    "invalid-candidate",
    "Informe um CandidateId válido.",
  );
  const title = requiredText(
    candidate.title,
    "invalid-candidate",
    "Informe um título para o candidato.",
  );
  const placeId = normalizedOptionalText(
    candidate.placeId,
    "invalid-candidate",
    "Informe um PlaceId válido.",
  );
  const description = normalizedOptionalText(
    candidate.description,
    "invalid-candidate",
    "Informe uma descrição válida.",
  );
  const reason = normalizedOptionalText(
    candidate.reason,
    "invalid-candidate",
    "Informe uma justificativa válida.",
  );
  const category = normalizedOptionalText(
    candidate.category,
    "invalid-candidate",
    "Informe uma categoria válida.",
  );
  const estimatedCostCurrency = normalizedOptionalText(
    candidate.estimatedCostCurrency,
    "invalid-candidate",
    "Informe uma moeda válida.",
  )?.toUpperCase();

  if (
    candidate.durationMinutes !== undefined &&
    (!Number.isInteger(candidate.durationMinutes) || candidate.durationMinutes < 1)
  ) {
    throw new DeterministicItineraryProposalGenerationError(
      "A duração deve ser um inteiro positivo.",
      "invalid-candidate",
    );
  }

  if (
    candidate.estimatedCostAmount !== undefined &&
    (!Number.isFinite(candidate.estimatedCostAmount) || candidate.estimatedCostAmount < 0)
  ) {
    throw new DeterministicItineraryProposalGenerationError(
      "O custo estimado deve ser um número finito maior ou igual a zero.",
      "invalid-candidate",
    );
  }

  if (estimatedCostCurrency !== undefined && !/^[A-Z]{3}$/.test(estimatedCostCurrency)) {
    throw new DeterministicItineraryProposalGenerationError(
      "Use uma moeda com três letras.",
      "invalid-candidate",
    );
  }

  const hasLatitude = candidate.latitude !== undefined;
  const hasLongitude = candidate.longitude !== undefined;
  if (hasLatitude !== hasLongitude) {
    throw new DeterministicItineraryProposalGenerationError(
      "Latitude e longitude do candidato devem ser informadas juntas.",
      "invalid-candidate",
    );
  }
  if (hasLatitude && hasLongitude) {
    validCoordinate(
      { latitude: candidate.latitude!, longitude: candidate.longitude! },
      "invalid-candidate",
      "Informe coordenadas válidas para o candidato.",
    );
  }

  return Object.freeze({
    candidateId,
    title,
    ...(placeId ? { placeId } : {}),
    ...(description ? { description } : {}),
    ...(candidate.durationMinutes !== undefined
      ? { durationMinutes: candidate.durationMinutes }
      : {}),
    ...(reason ? { reason } : {}),
    ...(candidate.estimatedCostAmount !== undefined
      ? { estimatedCostAmount: candidate.estimatedCostAmount }
      : {}),
    ...(estimatedCostCurrency ? { estimatedCostCurrency } : {}),
    ...(category ? { category } : {}),
    ...(hasLatitude && hasLongitude
      ? { latitude: candidate.latitude!, longitude: candidate.longitude! }
      : {}),
  });
}

function normalizedDays(
  days: readonly ItineraryProposalGenerationDay[],
): readonly ItineraryProposalGenerationDay[] {
  if (!Array.isArray(days) || days.length === 0) {
    throw new DeterministicItineraryProposalGenerationError(
      "A geração exige ao menos um Dia da Viagem.",
      "days-required",
    );
  }

  const normalized = days.map(normalizeDay);
  const ids = new Set<string>();
  for (const day of normalized) {
    if (ids.has(day.tripDayId)) {
      throw new DeterministicItineraryProposalGenerationError(
        "Cada Dia deve possuir um TripDayId único.",
        "duplicate-day",
      );
    }
    ids.add(day.tripDayId);
  }

  const daysWithFreePeriodContext = normalized.filter(hasFreePeriodContext).length;
  if (daysWithFreePeriodContext !== 0 && daysWithFreePeriodContext !== normalized.length) {
    throw new DeterministicItineraryProposalGenerationError(
      "O contexto de Free Periods deve estar disponível para todos os Dias ou para nenhum deles.",
      "invalid-day",
    );
  }

  return Object.freeze(
    [...normalized].sort(
      (left, right) =>
        compareCanonicalText(left.date, right.date) ||
        compareCanonicalText(left.tripDayId, right.tripDayId),
    ),
  );
}

function normalizedCandidates(
  candidates: readonly ItineraryProposalGenerationCandidate[],
): readonly ItineraryProposalGenerationCandidate[] {
  if (!Array.isArray(candidates)) {
    throw new DeterministicItineraryProposalGenerationError(
      "Informe uma coleção de candidatos.",
      "invalid-candidate",
    );
  }

  const normalized = candidates.map(normalizeCandidate);
  const ids = new Set<string>();
  for (const candidate of normalized) {
    if (ids.has(candidate.candidateId)) {
      throw new DeterministicItineraryProposalGenerationError(
        "Cada candidato deve possuir um CandidateId único.",
        "duplicate-candidate",
      );
    }
    ids.add(candidate.candidateId);
  }

  return Object.freeze(normalized);
}

function nextLegacyDay(
  days: readonly ItineraryProposalGenerationDay[],
  activityCounts: ReadonlyMap<string, number>,
): ItineraryProposalGenerationDay {
  return days.reduce((selected, candidate) => {
    const selectedCount = activityCounts.get(selected.tripDayId) ?? selected.existingActivityCount;
    const candidateCount =
      activityCounts.get(candidate.tripDayId) ?? candidate.existingActivityCount;
    return candidateCount < selectedCount ? candidate : selected;
  });
}

function isIntentionallyEmpty(day: ItineraryProposalGenerationDay): boolean {
  return (
    hasFreePeriodContext(day) &&
    day.existingActivityCount === 0 &&
    (day.protectedFreePeriodCount ?? 0) > 0 &&
    (day.flexibleFreePeriodCount ?? 0) === 0
  );
}

function effectiveDensity(
  day: ItineraryProposalGenerationDay,
  activityCounts: ReadonlyMap<string, number>,
): number {
  return (
    (activityCounts.get(day.tripDayId) ?? day.existingActivityCount) +
    (day.protectedFreePeriodCount ?? 0)
  );
}

function nextDensityAwareDay(
  days: readonly ItineraryProposalGenerationDay[],
  activityCounts: ReadonlyMap<string, number>,
): ItineraryProposalGenerationDay | undefined {
  const eligible = days.filter(
    (day) =>
      !isIntentionallyEmpty(day) &&
      effectiveDensity(day, activityCounts) < DETERMINISTIC_DESIRED_ACTIVITY_COUNT_PER_DAY,
  );
  if (eligible.length === 0) return undefined;

  return eligible.reduce((selected, candidate) =>
    effectiveDensity(candidate, activityCounts) < effectiveDensity(selected, activityCounts)
      ? candidate
      : selected,
  );
}

function candidateCoordinate(
  candidate: ItineraryProposalGenerationCandidate,
): ItineraryProposalGenerationCoordinate | undefined {
  return candidate.latitude !== undefined && candidate.longitude !== undefined
    ? { latitude: candidate.latitude, longitude: candidate.longitude }
    : undefined;
}

function distanceKm(
  left: ItineraryProposalGenerationCoordinate,
  right: ItineraryProposalGenerationCoordinate,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371.0088;
  const deltaLatitude = toRadians(right.latitude - left.latitude);
  const deltaLongitude = toRadians(right.longitude - left.longitude);
  const leftLatitude = toRadians(left.latitude);
  const rightLatitude = toRadians(right.latitude);
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(leftLatitude) * Math.cos(rightLatitude) * Math.sin(deltaLongitude / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

const COMPLEMENTARY_CATEGORIES = new Set(["gastronomy", "nightlife"]);

function isPrimaryExperienceCategory(category: string | undefined): boolean {
  return category !== undefined && !COMPLEMENTARY_CATEGORIES.has(category);
}

type DayCompositionState = {
  categories: string[];
  lastCoordinate?: ItineraryProposalGenerationCoordinate;
};

type IndexedCandidate = Readonly<{
  candidate: ItineraryProposalGenerationCandidate;
  originalIndex: number;
}>;

type CandidateSelection = Readonly<{
  indexed: IndexedCandidate;
  usedSpatialSignal: boolean;
  usedCategorySignal: boolean;
  usedAnchor: boolean;
}>;

function contextualCandidateScore(
  indexed: IndexedCandidate,
  state: DayCompositionState,
  anchorCoordinate: ItineraryProposalGenerationCoordinate | undefined,
): Readonly<{
  score: number;
  usedSpatialSignal: boolean;
  usedCategorySignal: boolean;
  usedAnchor: boolean;
}> {
  const candidate = indexed.candidate;
  let score = -indexed.originalIndex;
  let usedSpatialSignal = false;
  let usedCategorySignal = false;
  let usedAnchor = false;

  const coordinate = candidateCoordinate(candidate);
  const referenceCoordinate = state.lastCoordinate ?? anchorCoordinate;
  if (coordinate && referenceCoordinate) {
    const proximityKm = distanceKm(referenceCoordinate, coordinate);
    score += Math.max(-30, 18 - proximityKm * 2.5);
    usedSpatialSignal = true;
    usedAnchor = state.lastCoordinate === undefined && anchorCoordinate !== undefined;
  }

  const category = candidate.category;
  if (category) {
    usedCategorySignal = true;
    const categoryCount = state.categories.filter((value) => value === category).length;
    const hasPrimary = state.categories.some(isPrimaryExperienceCategory);
    const hasGastronomy = state.categories.includes("gastronomy");
    const hasNightlife = state.categories.includes("nightlife");

    if (categoryCount > 0) score -= 18 * categoryCount;

    if (state.categories.length === 0) {
      if (isPrimaryExperienceCategory(category)) score += 12;
      else if (category === "nightlife") score -= 8;
      else score -= 3;
    } else if (category === "gastronomy") {
      if (hasPrimary && !hasGastronomy) score += 12;
      if (hasGastronomy) score -= 10;
    } else if (category === "nightlife") {
      if (hasPrimary && !hasNightlife) score += 8;
      if (hasNightlife) score -= 12;
    } else if (!hasPrimary) {
      score += 8;
    } else {
      score += 2;
    }
  }

  return Object.freeze({ score, usedSpatialSignal, usedCategorySignal, usedAnchor });
}

function selectContextualCandidate(
  remaining: readonly IndexedCandidate[],
  state: DayCompositionState,
  anchorCoordinate: ItineraryProposalGenerationCoordinate | undefined,
): CandidateSelection {
  let selected = remaining[0]!;
  let selectedScore = contextualCandidateScore(selected, state, anchorCoordinate);

  for (const candidate of remaining.slice(1)) {
    const score = contextualCandidateScore(candidate, state, anchorCoordinate);
    if (
      score.score > selectedScore.score ||
      (score.score === selectedScore.score &&
        (candidate.originalIndex < selected.originalIndex ||
          (candidate.originalIndex === selected.originalIndex &&
            compareCanonicalText(candidate.candidate.candidateId, selected.candidate.candidateId) < 0)))
    ) {
      selected = candidate;
      selectedScore = score;
    }
  }

  return Object.freeze({ indexed: selected, ...selectedScore });
}

function limitationsFor(
  candidates: readonly ItineraryProposalGenerationCandidate[],
  freePeriodContextKnown: boolean,
  skippedCandidateCount: number,
): readonly string[] {
  const limitations = [
    "A política determinística não consulta horário de funcionamento, disponibilidade, trânsito ou rota viária.",
    "Nenhum horário de início foi definido; a organização temporal exige revisão humana.",
  ];

  if (freePeriodContextKnown) {
    limitations.push(
      `A densidade diária usa uma heurística conservadora de até ${DETERMINISTIC_DESIRED_ACTIVITY_COUNT_PER_DAY} Activities por Dia, considerando Free Periods protected como capacidade reservada; isso não comprova viabilidade por horário.`,
    );
  } else {
    limitations.push(
      "O contexto de Free Periods não foi fornecido; a geração preservou o balanceamento legado por quantidade de Activities e não classificou espaço livre intencional.",
    );
  }

  if (candidates.some((candidate) => candidate.durationMinutes === undefined)) {
    limitations.push(
      `Candidatos sem duração conhecida receberam a estimativa padrão de ${DEFAULT_DETERMINISTIC_ACTIVITY_DURATION_MINUTES} minutos.`,
    );
  }

  if (candidates.length === 0) {
    limitations.push(
      "Nenhum candidato elegível foi recebido; a proposta não contém mudanças e o Roteiro atual permanece preservado.",
    );
  }

  if (skippedCandidateCount > 0) {
    limitations.push(
      `${skippedCandidateCount} candidato(s) elegível(is) não foram propostos porque os Dias disponíveis atingiram a densidade desejada ou foram preservados como vazios intencionais.`,
    );
  }

  return Object.freeze(limitations);
}

function proposedActivity(
  candidate: ItineraryProposalGenerationCandidate,
  proposedActivityId: string,
  day: ItineraryProposalGenerationDay,
  proposedOrder: number,
): ProposedActivityInput {
  return Object.freeze({
    proposedActivityId,
    targetTripDayId: day.tripDayId,
    ...(candidate.placeId ? { placeId: candidate.placeId } : {}),
    title: candidate.title,
    ...(candidate.description ? { description: candidate.description } : {}),
    durationMinutes: candidate.durationMinutes ?? DEFAULT_DETERMINISTIC_ACTIVITY_DURATION_MINUTES,
    proposedOrder,
    operationType: "add",
    flexibility: "flexible",
    ...(candidate.estimatedCostAmount !== undefined
      ? { estimatedCostAmount: candidate.estimatedCostAmount }
      : {}),
    ...(candidate.estimatedCostCurrency
      ? { estimatedCostCurrency: candidate.estimatedCostCurrency }
      : {}),
    ...(candidate.reason ? { reason: candidate.reason } : {}),
  });
}

export class DeterministicItineraryProposalGenerator implements ItineraryProposalGenerationPort {
  async generate(
    input: GenerateItineraryProposalInput,
  ): Promise<CompleteItineraryProposalGenerationInput> {
    if (!(input.generatedAt instanceof Date) || !Number.isFinite(input.generatedAt.getTime())) {
      throw new DeterministicItineraryProposalGenerationError(
        "Informe um instante válido para a geração.",
        "invalid-generated-at",
      );
    }

    if (typeof input.createProposedActivityId !== "function") {
      throw new DeterministicItineraryProposalGenerationError(
        "Informe uma factory de ProposedActivityId válida.",
        "invalid-proposed-activity-id",
      );
    }

    const days = normalizedDays(input.days);
    const candidates = normalizedCandidates(input.candidates);
    const anchorCoordinate = input.anchorCoordinate
      ? validCoordinate(
          input.anchorCoordinate,
          "invalid-anchor-coordinate",
          "Informe uma coordenada de referência válida para a geração.",
        )
      : undefined;
    const freePeriodContextKnown = days.every(hasFreePeriodContext);
    const activityCounts = new Map(
      days.map((day) => [day.tripDayId, day.existingActivityCount] as const),
    );
    const proposedActivityIds = new Set<string>();
    const proposedActivities: ProposedActivityInput[] = [];
    const hasContextualSignals =
      anchorCoordinate !== undefined ||
      candidates.some(
        (candidate) =>
          candidate.category !== undefined ||
          (candidate.latitude !== undefined && candidate.longitude !== undefined),
      );
    let skippedCandidateCount = 0;
    let usedSpatialSignal = false;
    let usedCategorySignal = false;
    let usedAccommodationAnchor = false;

    const appendCandidate = (
      candidate: ItineraryProposalGenerationCandidate,
      candidateIndex: number,
      day: ItineraryProposalGenerationDay,
    ) => {
      const proposedOrder = activityCounts.get(day.tripDayId) ?? day.existingActivityCount;
      const proposedActivityId = requiredText(
        input.createProposedActivityId(candidate, candidateIndex),
        "invalid-proposed-activity-id",
        "A factory deve produzir um ProposedActivityId válido.",
      );

      if (proposedActivityIds.has(proposedActivityId)) {
        throw new DeterministicItineraryProposalGenerationError(
          "A factory deve produzir ProposedActivityIds únicos.",
          "duplicate-proposed-activity-id",
        );
      }
      proposedActivityIds.add(proposedActivityId);
      proposedActivities.push(proposedActivity(candidate, proposedActivityId, day, proposedOrder));
      activityCounts.set(day.tripDayId, proposedOrder + 1);
    };

    if (!hasContextualSignals) {
      candidates.forEach((candidate, index) => {
        const day = freePeriodContextKnown
          ? nextDensityAwareDay(days, activityCounts)
          : nextLegacyDay(days, activityCounts);
        if (!day || (freePeriodContextKnown && isIntentionallyEmpty(day))) {
          skippedCandidateCount += 1;
          return;
        }
        if (
          freePeriodContextKnown &&
          effectiveDensity(day, activityCounts) >= DETERMINISTIC_DESIRED_ACTIVITY_COUNT_PER_DAY
        ) {
          skippedCandidateCount += 1;
          return;
        }
        appendCandidate(candidate, index, day);
      });
    } else {
      const remaining: IndexedCandidate[] = candidates.map((candidate, originalIndex) =>
        Object.freeze({ candidate, originalIndex }),
      );
      const states = new Map<string, DayCompositionState>(
        days.map((day) => [day.tripDayId, { categories: [] }] as const),
      );

      while (remaining.length > 0) {
        const day = freePeriodContextKnown
          ? nextDensityAwareDay(days, activityCounts)
          : nextLegacyDay(days, activityCounts);
        if (!day) break;
        if (
          freePeriodContextKnown &&
          (isIntentionallyEmpty(day) ||
            effectiveDensity(day, activityCounts) >= DETERMINISTIC_DESIRED_ACTIVITY_COUNT_PER_DAY)
        ) {
          break;
        }

        const state = states.get(day.tripDayId)!;
        const selection = selectContextualCandidate(remaining, state, anchorCoordinate);
        const selectedIndex = remaining.findIndex(
          (value) => value.originalIndex === selection.indexed.originalIndex,
        );
        remaining.splice(selectedIndex, 1);

        appendCandidate(
          selection.indexed.candidate,
          selection.indexed.originalIndex,
          day,
        );
        if (selection.indexed.candidate.category) {
          state.categories.push(selection.indexed.candidate.category);
        }
        const selectedCoordinate = candidateCoordinate(selection.indexed.candidate);
        if (selectedCoordinate) state.lastCoordinate = selectedCoordinate;
        usedSpatialSignal ||= selection.usedSpatialSignal;
        usedCategorySignal ||= selection.usedCategorySignal;
        usedAccommodationAnchor ||= selection.usedAnchor;
      }

      skippedCandidateCount = remaining.length;
    }

    const generatedAt = new Date(input.generatedAt.getTime());
    const validUntil = new Date(
      generatedAt.getTime() + DETERMINISTIC_ITINERARY_PROPOSAL_VALIDITY_HOURS * 60 * 60 * 1_000,
    );

    if (!Number.isFinite(validUntil.getTime())) {
      throw new DeterministicItineraryProposalGenerationError(
        "A validade derivada para a Proposal é inválida.",
        "invalid-validity",
      );
    }

    const contextualCriteria = [
      "Candidatos preservam a relevância recebida como sinal inicial.",
      ...(usedSpatialSignal
        ? ["A composição favoreceu continuidade por proximidade geodésica entre Lugares do mesmo Dia."]
        : []),
      ...(usedCategorySignal
        ? ["A composição considerou diversidade e complementaridade de categorias dentro de cada Dia."]
        : []),
      ...(usedAccommodationAnchor
        ? ["A Hospedagem foi usada como referência espacial quando o Dia ainda não possuía outro Lugar proposto."]
        : []),
    ];

    return Object.freeze({
      generationMethod: DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_METHOD,
      generationVersion: DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_VERSION,
      proposedActivities: Object.freeze(proposedActivities),
      criteria: Object.freeze(
        freePeriodContextKnown
          ? [
              ...(hasContextualSignals
                ? contextualCriteria
                : ["Candidatos preservados na ordem recebida."]),
              `Dias elegíveis recebem sugestões até a densidade conservadora de ${DETERMINISTIC_DESIRED_ACTIVITY_COUNT_PER_DAY} Activities, descontando Free Periods protected da capacidade.`,
              "Dias vazios protegidos permanecem sem Proposed Activities e Free Periods flexible continuam elegíveis para sugestão.",
              "Novas Activities são anexadas após o conteúdo existente sem horário inventado.",
            ]
          : [
              ...(hasContextualSignals
                ? contextualCriteria
                : ["Candidatos preservados na ordem recebida."]),
              "Distribuição balanceada pela quantidade de Atividades de cada Dia.",
              "Novas Atividades anexadas após o conteúdo existente.",
            ],
      ),
      justifications: Object.freeze([
        candidates.length > 0
          ? hasContextualSignals
            ? "A proposta combina relevância, densidade e sinais contextuais disponíveis para formar Dias mais coerentes sem inventar horários ou rotas."
            : freePeriodContextKnown
              ? "A política determinística prioriza Dias subpreenchidos, preserva espaço protegido e limita a densidade para evitar sobreplanejamento."
              : "A política determinística mantém a ordem dos candidatos e distribui a carga entre os Dias disponíveis no modo legado."
          : "Nenhum candidato elegível foi recebido; nenhuma mudança foi proposta.",
      ]),
      limitations: limitationsFor(candidates, freePeriodContextKnown, skippedCandidateCount),
      planningConflictIds: Object.freeze([]),
      generatedAt,
      validUntil,
    });
  }
}
