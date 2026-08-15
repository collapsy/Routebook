import type {
  CompleteItineraryProposalGenerationInput,
  ProposedActivityInput,
} from "./itinerary-proposal";

export const DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_METHOD =
  "deterministic-candidate-balancing";
export const DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_VERSION = "2";
export const DETERMINISTIC_ITINERARY_PROPOSAL_VALIDITY_HOURS = 24;
export const DEFAULT_DETERMINISTIC_ACTIVITY_DURATION_MINUTES = 90;
export const DETERMINISTIC_DESIRED_ACTIVITY_COUNT_PER_DAY = 3;

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
}>;

export type GenerateItineraryProposalInput = Readonly<{
  days: readonly ItineraryProposalGenerationDay[];
  candidates: readonly ItineraryProposalGenerationCandidate[];
  generatedAt: Date;
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
    const freePeriodContextKnown = days.every(hasFreePeriodContext);
    const activityCounts = new Map(
      days.map((day) => [day.tripDayId, day.existingActivityCount] as const),
    );
    const proposedActivityIds = new Set<string>();
    const proposedActivities: ProposedActivityInput[] = [];
    let skippedCandidateCount = 0;

    candidates.forEach((candidate, index) => {
      const day = freePeriodContextKnown
        ? nextDensityAwareDay(days, activityCounts)
        : nextLegacyDay(days, activityCounts);
      if (!day) {
        skippedCandidateCount += 1;
        return;
      }

      const proposedOrder = activityCounts.get(day.tripDayId) ?? day.existingActivityCount;
      const proposedActivityId = requiredText(
        input.createProposedActivityId(candidate, index),
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

      proposedActivities.push(
        Object.freeze({
          proposedActivityId,
          targetTripDayId: day.tripDayId,
          ...(candidate.placeId ? { placeId: candidate.placeId } : {}),
          title: candidate.title,
          ...(candidate.description ? { description: candidate.description } : {}),
          durationMinutes:
            candidate.durationMinutes ?? DEFAULT_DETERMINISTIC_ACTIVITY_DURATION_MINUTES,
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
        }),
      );
      activityCounts.set(day.tripDayId, proposedOrder + 1);
    });

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

    return Object.freeze({
      generationMethod: DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_METHOD,
      generationVersion: DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_VERSION,
      proposedActivities: Object.freeze(proposedActivities),
      criteria: Object.freeze(
        freePeriodContextKnown
          ? [
              "Candidatos preservados na ordem recebida.",
              `Dias elegíveis recebem sugestões até a densidade conservadora de ${DETERMINISTIC_DESIRED_ACTIVITY_COUNT_PER_DAY} Activities, descontando Free Periods protected da capacidade.`,
              "Dias vazios protegidos permanecem sem Proposed Activities e Free Periods flexible continuam elegíveis para sugestão.",
              "Novas Activities são anexadas após o conteúdo existente sem horário inventado.",
            ]
          : [
              "Candidatos preservados na ordem recebida.",
              "Distribuição balanceada pela quantidade de Atividades de cada Dia.",
              "Novas Atividades anexadas após o conteúdo existente.",
            ],
      ),
      justifications: Object.freeze([
        candidates.length > 0
          ? freePeriodContextKnown
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
