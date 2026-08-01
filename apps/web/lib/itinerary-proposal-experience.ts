import type {
  ItineraryProposal,
  ProposedActivity,
  ProposedActivityOperationType,
} from "@routebook/proposal-management";
import type { Itinerary, ItineraryDay } from "@routebook/trip-management";

export type ItineraryProposalReviewActivity = Readonly<{
  id: string;
  title: string;
  operationLabel: "Adicionar" | "Mover" | "Atualizar" | "Remover";
  timeLabel: string;
  description?: string;
  durationLabel?: string;
  estimatedCostLabel?: string;
  flexibility?: string;
  reason?: string;
  sourceActivityTitle?: string;
}>;

export type ItineraryProposalReviewDay = Readonly<{
  id: string;
  label: string;
  position: number;
  referenceAvailable: boolean;
  activities: readonly ItineraryProposalReviewActivity[];
}>;

export type ItineraryProposalReview = Readonly<{
  proposalId: string;
  generatedAtLabel: string;
  validUntilLabel: string;
  isBasedOnCurrentItinerary: boolean;
  proposedChangeCount: number;
  knownConflictCount: number;
  criteria: readonly string[];
  justifications: readonly string[];
  limitations: readonly string[];
  days: readonly ItineraryProposalReviewDay[];
}>;

export class ItineraryProposalReviewIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItineraryProposalReviewIntegrityError";
  }
}

const operationLabels: Readonly<
  Record<ProposedActivityOperationType, ItineraryProposalReviewActivity["operationLabel"]>
> = {
  add: "Adicionar",
  move: "Mover",
  update: "Atualizar",
  remove: "Remover",
};

function isValidDate(value: Date | undefined): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function requireReadyContent(proposal: ItineraryProposal) {
  if (
    proposal.status !== "ready" ||
    !isValidDate(proposal.generatedAt) ||
    !isValidDate(proposal.validUntil) ||
    !Array.isArray(proposal.proposedActivities) ||
    !Array.isArray(proposal.criteria) ||
    proposal.criteria.length === 0 ||
    !Array.isArray(proposal.justifications) ||
    proposal.justifications.length === 0 ||
    !Array.isArray(proposal.limitations) ||
    !Array.isArray(proposal.planningConflictIds)
  ) {
    throw new ItineraryProposalReviewIntegrityError(
      "A Proposta pronta não possui o conteúdo revisável completo.",
    );
  }

  return {
    generatedAt: proposal.generatedAt,
    validUntil: proposal.validUntil,
    proposedActivities: proposal.proposedActivities,
    criteria: proposal.criteria,
    justifications: proposal.justifications,
    limitations: proposal.limitations,
    planningConflictIds: proposal.planningConflictIds,
  };
}

function formatInstant(value: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(value);
}

function formatDay(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

function formatEstimatedCost(activity: ProposedActivity): string | undefined {
  if (activity.estimatedCostAmount === undefined) return undefined;
  if (!activity.estimatedCostCurrency) {
    return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(
      activity.estimatedCostAmount,
    )} · moeda não informada`;
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: activity.estimatedCostCurrency,
  }).format(activity.estimatedCostAmount);
}

function compareActivities(left: ProposedActivity, right: ProposedActivity): number {
  const leftOrder = left.proposedOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.proposedOrder ?? Number.MAX_SAFE_INTEGER;
  return leftOrder - rightOrder || left.proposedActivityId.localeCompare(right.proposedActivityId);
}

export function hasReadyItineraryProposal(proposals: readonly ItineraryProposal[]): boolean {
  return proposals.some((proposal) => proposal.status === "ready");
}

export function findLatestReadyItineraryProposal(
  proposals: readonly ItineraryProposal[],
): ItineraryProposal | null {
  const ready = proposals.filter((proposal) => proposal.status === "ready");
  for (const proposal of ready) requireReadyContent(proposal);

  return (
    [...ready].sort((left, right) => {
      const timeDifference = right.generatedAt!.getTime() - left.generatedAt!.getTime();
      return timeDifference || right.id.localeCompare(left.id);
    })[0] ?? null
  );
}

export function buildItineraryProposalReview({
  itinerary,
  proposal,
}: {
  itinerary: Itinerary;
  proposal: ItineraryProposal;
}): ItineraryProposalReview {
  if (proposal.tripId !== itinerary.tripId || proposal.itineraryId !== itinerary.id) {
    throw new ItineraryProposalReviewIntegrityError(
      "A Proposta não pertence ao Roteiro informado.",
    );
  }

  const content = requireReadyContent(proposal);
  const daysById = new Map(itinerary.days.map((day) => [day.id, day]));
  const sourceActivities = new Map(
    itinerary.days.flatMap((day) =>
      day.activities.map((activity) => [activity.id, { activity, day }] as const),
    ),
  );
  const unknownGroupId = "unavailable-day-reference";
  const groups = new Map<string, { day?: ItineraryDay; activities: ProposedActivity[] }>();

  for (const activity of [...content.proposedActivities].sort(compareActivities)) {
    const targetDay = activity.targetTripDayId
      ? daysById.get(activity.targetTripDayId)
      : activity.sourceActivityId
        ? sourceActivities.get(activity.sourceActivityId)?.day
        : undefined;
    const groupId = targetDay?.id ?? unknownGroupId;
    const group = groups.get(groupId) ?? {
      ...(targetDay ? { day: targetDay } : {}),
      activities: [],
    };
    group.activities.push(activity);
    groups.set(groupId, group);
  }

  const days = [...groups.entries()]
    .sort(([, left], [, right]) => {
      if (left.day && right.day) return left.day.position - right.day.position;
      if (left.day) return -1;
      if (right.day) return 1;
      return 0;
    })
    .map(([id, group]): ItineraryProposalReviewDay => ({
      id,
      label: group.day
        ? `Dia ${group.day.position} · ${formatDay(group.day.date)}`
        : "Referência de dia indisponível",
      position: group.day?.position ?? Number.MAX_SAFE_INTEGER,
      referenceAvailable: Boolean(group.day),
      activities: group.activities.map((activity) => {
        const sourceActivity = activity.sourceActivityId
          ? sourceActivities.get(activity.sourceActivityId)?.activity
          : undefined;
        const estimatedCostLabel = formatEstimatedCost(activity);
        return {
          id: activity.proposedActivityId,
          title: activity.title,
          operationLabel: operationLabels[activity.operationType],
          timeLabel: activity.proposedStartTime
            ? `Horário proposto: ${activity.proposedStartTime.slice(0, 5)}`
            : "Horário não informado",
          ...(activity.description ? { description: activity.description } : {}),
          ...(activity.durationMinutes
            ? { durationLabel: formatDuration(activity.durationMinutes) }
            : {}),
          ...(estimatedCostLabel ? { estimatedCostLabel } : {}),
          ...(activity.flexibility ? { flexibility: activity.flexibility } : {}),
          ...(activity.reason ? { reason: activity.reason } : {}),
          ...(sourceActivity ? { sourceActivityTitle: sourceActivity.title } : {}),
        };
      }),
    }));

  return {
    proposalId: proposal.id,
    generatedAtLabel: formatInstant(content.generatedAt, itinerary.period.timeZone),
    validUntilLabel: formatInstant(content.validUntil, itinerary.period.timeZone),
    isBasedOnCurrentItinerary: proposal.baseItineraryVersion === itinerary.version,
    proposedChangeCount: content.proposedActivities.length,
    knownConflictCount: content.planningConflictIds.length,
    criteria: content.criteria,
    justifications: content.justifications,
    limitations: content.limitations,
    days,
  };
}
