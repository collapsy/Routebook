import type {
  CompleteItineraryProposalGenerationInput,
  ProposedActivityInput,
} from "./itinerary-proposal";

export const DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_METHOD =
  "deterministic-candidate-balancing";
export const DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_VERSION = "1";
export const DETERMINISTIC_ITINERARY_PROPOSAL_VALIDITY_HOURS = 24;
export const DEFAULT_DETERMINISTIC_ACTIVITY_DURATION_MINUTES = 90;

export type ItineraryProposalGenerationDay = Readonly<{
  tripDayId: string;
  date: string;
  existingActivityCount: number;
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
  | "invalid-proposed-activity-id";

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

function normalizeDay(day: ItineraryProposalGenerationDay): ItineraryProposalGenerationDay {
  const tripDayId = requiredText(day?.tripDayId, "invalid-day", "Informe um TripDayId válido.");
  const date = requiredText(day?.date, "invalid-day", "Informe uma data válida para o Dia.");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new DeterministicItineraryProposalGenerationError(
      "Use uma data no formato YYYY-MM-DD.",
      "invalid-day",
    );
  }

  if (!Number.isInteger(day.existingActivityCount) || day.existingActivityCount < 0) {
    throw new DeterministicItineraryProposalGenerationError(
      "A quantidade de Atividades existentes deve ser um inteiro maior ou igual a zero.",
      "invalid-day",
    );
  }

  return Object.freeze({ tripDayId, date, existingActivityCount: day.existingActivityCount });
}

function normalizeCandidate(
  candidate: ItineraryProposalGenerationCandidate,
): ItineraryProposalGenerationCandidate {
  const candidateId = requiredText(
    candidate?.candidateId,
    "invalid-candidate",
    "Informe um CandidateId válido.",
  );
  const title = requiredText(
    candidate?.title,
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

  return Object.freeze(
    [...normalized].sort(
      (left, right) =>
        left.date.localeCompare(right.date) || left.tripDayId.localeCompare(right.tripDayId),
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

function nextDay(
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

function limitationsFor(
  candidates: readonly ItineraryProposalGenerationCandidate[],
): readonly string[] {
  const limitations = [
    "A política determinística não consulta horário de funcionamento, disponibilidade, trânsito ou rota viária.",
    "Nenhum horário de início foi definido; a organização temporal exige revisão humana.",
    "A distribuição considera apenas a carga de Atividades por Dia e não calcula proximidade geográfica.",
  ];

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

    const days = normalizedDays(input.days);
    const candidates = normalizedCandidates(input.candidates);
    const activityCounts = new Map(
      days.map((day) => [day.tripDayId, day.existingActivityCount] as const),
    );
    const proposedActivities: ProposedActivityInput[] = [];

    candidates.forEach((candidate, index) => {
      const day = nextDay(days, activityCounts);
      const proposedOrder = activityCounts.get(day.tripDayId) ?? day.existingActivityCount;
      const proposedActivityId = requiredText(
        input.createProposedActivityId(candidate, index),
        "invalid-proposed-activity-id",
        "A factory deve produzir um ProposedActivityId válido.",
      );

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

    return Object.freeze({
      generationMethod: DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_METHOD,
      generationVersion: DETERMINISTIC_ITINERARY_PROPOSAL_GENERATION_VERSION,
      proposedActivities: Object.freeze(proposedActivities),
      criteria: Object.freeze([
        "Candidatos recebidos em ordem canônica.",
        "Distribuição balanceada pela quantidade de Atividades de cada Dia.",
        "Novas Atividades anexadas após o conteúdo existente.",
      ]),
      justifications: Object.freeze([
        candidates.length > 0
          ? "A política determinística mantém a ordem dos candidatos e distribui a carga entre os Dias disponíveis."
          : "Nenhum candidato elegível foi recebido; nenhuma mudança foi proposta.",
      ]),
      limitations: limitationsFor(candidates),
      planningConflictIds: Object.freeze([]),
      generatedAt,
      validUntil,
    });
  }
}
