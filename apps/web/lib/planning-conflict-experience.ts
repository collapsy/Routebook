import type { Itinerary } from "@routebook/trip-management";

export type PlanningConflictSeverity = "error" | "risk" | "suggestion";

type PlanningConflictEvidenceValue =
  string | number | boolean | null | readonly string[] | readonly number[];

export type PlanningConflictReviewSource = Readonly<{
  id: string;
  type:
    | "activity-time-overlap"
    | "activity-outside-trip-period"
    | "activity-day-mismatch"
    | "invalid-activity-interval"
    | "day-overloaded";
  severity: PlanningConflictSeverity;
  state: "open" | "invalidated" | "superseded";
  contextSnapshot: Readonly<{
    tripStartDate: string;
    tripEndDate: string;
  }>;
  evidence: readonly Readonly<{
    code: string;
    facts: Readonly<Record<string, PlanningConflictEvidenceValue>>;
  }>[];
  relatedDayIds: readonly string[];
  relatedActivityIds: readonly string[];
}>;

export type PlanningConflictReviewItem = Readonly<{
  id: string;
  severity: PlanningConflictSeverity;
  severityLabel: "Erro" | "Risco" | "Sugestão";
  title: string;
  explanation: string;
  impact: string;
  dayLabel?: string;
  activityTitles: readonly string[];
  itineraryHref?: string;
}>;

export type PlanningConflictReview = Readonly<{
  total: number;
  counts: Readonly<Record<PlanningConflictSeverity, number>>;
  items: readonly PlanningConflictReviewItem[];
}>;

const severityLabels: Readonly<
  Record<PlanningConflictSeverity, PlanningConflictReviewItem["severityLabel"]>
> = {
  error: "Erro",
  risk: "Risco",
  suggestion: "Sugestão",
};

function formatDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
  }).format(date);
}

function evidenceFact(
  conflict: PlanningConflictReviewSource,
  name: string,
): PlanningConflictEvidenceValue | undefined {
  for (const evidence of conflict.evidence) {
    const value = evidence.facts[name];
    if (value !== undefined) return value;
  }
  return undefined;
}

function textFact(conflict: PlanningConflictReviewSource, name: string): string | null {
  const value = evidenceFact(conflict, name);
  return typeof value === "string" ? value : null;
}

function numberFact(conflict: PlanningConflictReviewSource, name: string): number | null {
  const value = evidenceFact(conflict, name);
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function describeInvalidInterval(conflict: PlanningConflictReviewSource) {
  const reason = textFact(conflict, "reason");
  const explanation =
    reason === "invalid-start-time"
      ? "O horário registrado não segue o formato esperado."
      : reason === "invalid-duration"
        ? "A duração registrada precisa ser um número inteiro maior que zero."
        : reason === "interval-exceeds-day-boundary"
          ? "O horário e a duração registrados ultrapassam o limite deste dia."
          : "O intervalo registrado não pôde ser validado.";

  return {
    title: "Horário ou duração inválidos",
    explanation,
    impact: "Este intervalo não pode participar de forma consistente da análise temporal.",
  };
}

function describeOutsideTrip(conflict: PlanningConflictReviewSource) {
  const dayDate = formatDate(textFact(conflict, "dayDate") ?? "");
  const tripStartDate = formatDate(conflict.contextSnapshot.tripStartDate);
  const tripEndDate = formatDate(conflict.contextSnapshot.tripEndDate);
  const explanation =
    dayDate && tripStartDate && tripEndDate
      ? `A atividade está em ${dayDate}, fora do período de ${tripStartDate} a ${tripEndDate}.`
      : "A atividade está associada a uma data fora do período conhecido da viagem.";

  return {
    title: "Atividade fora do período da viagem",
    explanation,
    impact: "O Roteiro contém uma atividade fora dos limites registrados para a Viagem.",
  };
}

function describeDayMismatch(activityTitles: readonly string[]) {
  const subject = activityTitles[0] ? `“${activityTitles[0]}”` : "A atividade";
  return {
    title: "Atividade associada a outro dia",
    explanation: `${subject} referencia um dia diferente daquele em que aparece no Roteiro.`,
    impact:
      "A associação entre a atividade e o dia precisa ser revisada antes de confiar na agenda.",
  };
}

function describeOverlap(activityTitles: readonly string[]) {
  const explanation =
    activityTitles.length >= 2
      ? `“${activityTitles[0]}” e “${activityTitles[1]}” ocupam intervalos que se sobrepõem.`
      : "Duas atividades ocupam intervalos que se sobrepõem.";

  return {
    title: "Horários sobrepostos",
    explanation,
    impact:
      "Os horários registrados precisam ser revisados antes de considerar este trecho consistente.",
  };
}

function describeOverload(conflict: PlanningConflictReviewSource) {
  const activityCount = numberFact(conflict, "activityCount");
  const totalMinutes = numberFact(conflict, "totalScheduledMinutes");
  const maxActivities = numberFact(conflict, "maxActivityCount");
  const maxMinutes = numberFact(conflict, "maxScheduledMinutes");
  const details = [
    activityCount !== null && maxActivities !== null
      ? `${activityCount} atividades para um limite de ${maxActivities}`
      : null,
    totalMinutes !== null && maxMinutes !== null
      ? `${totalMinutes} minutos programados para um limite de ${maxMinutes}`
      : null,
  ].filter((detail): detail is string => detail !== null);

  return {
    title: "Dia potencialmente sobrecarregado",
    explanation:
      details.length > 0
        ? `A análise encontrou ${details.join(" e ")}.`
        : "A carga deste dia ultrapassa ao menos um limite da política de análise atual.",
    impact: "A carga excede um limite explícito da avaliação determinística atual.",
  };
}

function describeConflict(
  conflict: PlanningConflictReviewSource,
  activityTitles: readonly string[],
) {
  switch (conflict.type) {
    case "invalid-activity-interval":
      return describeInvalidInterval(conflict);
    case "activity-outside-trip-period":
      return describeOutsideTrip(conflict);
    case "activity-day-mismatch":
      return describeDayMismatch(activityTitles);
    case "activity-time-overlap":
      return describeOverlap(activityTitles);
    case "day-overloaded":
      return describeOverload(conflict);
  }
}

export function buildPlanningConflictReview({
  conflicts,
  itinerary,
  tripId,
}: {
  conflicts: readonly PlanningConflictReviewSource[];
  itinerary: Itinerary;
  tripId: string;
}): PlanningConflictReview {
  const daysById = new Map(itinerary.days.map((day) => [day.id, day]));
  const activitiesById = new Map(
    itinerary.days.flatMap((day) =>
      day.activities.map((activity) => [activity.id, activity] as const),
    ),
  );
  const counts: Record<PlanningConflictSeverity, number> = {
    error: 0,
    risk: 0,
    suggestion: 0,
  };
  const items = conflicts
    .filter((conflict) => conflict.state === "open")
    .map((conflict): PlanningConflictReviewItem => {
      counts[conflict.severity] += 1;
      const day = conflict.relatedDayIds.map((dayId) => daysById.get(dayId)).find(Boolean);
      const activityTitles = conflict.relatedActivityIds.flatMap((activityId) => {
        const activity = activitiesById.get(activityId);
        return activity ? [activity.title] : [];
      });
      const description = describeConflict(conflict, activityTitles);
      const formattedDay = day ? formatDate(day.date) : null;

      return {
        id: conflict.id,
        severity: conflict.severity,
        severityLabel: severityLabels[conflict.severity],
        ...description,
        activityTitles,
        ...(day && formattedDay ? { dayLabel: `Dia ${day.position} · ${formattedDay}` } : {}),
        ...(day ? { itineraryHref: `/viagens/${tripId}/roteiro#${day.id}` } : {}),
      };
    });

  return {
    total: items.length,
    counts,
    items,
  };
}
