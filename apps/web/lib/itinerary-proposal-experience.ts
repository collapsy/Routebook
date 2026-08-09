import type {
  ItineraryProposal,
  ProposedActivity,
  ProposedActivityOperationType,
} from "@routebook/proposal-management";
import type { Itinerary, ItineraryDay } from "@routebook/trip-management";

export type ItineraryProposalReviewDayOption = Readonly<{
  id: string;
  label: string;
}>;

export type ItineraryProposalReviewActivityEditValues = Readonly<{
  targetTripDayId?: string;
  title: string;
  description: string;
  proposedStartTime: string;
  durationMinutes: string;
  flexibility: string;
  estimatedCostAmount: string;
  estimatedCostCurrency: string;
}>;

export type ItineraryProposalReviewActivity = Readonly<{
  id: string;
  title: string;
  operationType: ProposedActivityOperationType;
  operationLabel: "Adicionar" | "Mover" | "Atualizar" | "Remover";
  timeLabel: string;
  editValues: ItineraryProposalReviewActivityEditValues;
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

type ItineraryProposalReviewBase = Readonly<{
  proposalId: string;
  generatedAtLabel: string;
  validUntilLabel: string;
  isBasedOnCurrentItinerary: boolean;
  proposedChangeCount: number;
  knownConflictCount: number;
  criteria: readonly string[];
  justifications: readonly string[];
  limitations: readonly string[];
  dayOptions: readonly ItineraryProposalReviewDayOption[];
  days: readonly ItineraryProposalReviewDay[];
}>;

export type ItineraryProposalReview =
  | (ItineraryProposalReviewBase &
      Readonly<{
        status: "ready";
      }>)
  | (ItineraryProposalReviewBase &
      Readonly<{
        status: "expired";
        expiredAtLabel: string;
      }>);

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

function requireReviewableContent(proposal: ItineraryProposal) {
  if (
    (proposal.status !== "ready" && proposal.status !== "expired") ||
    !isValidDate(proposal.generatedAt) ||
    !isValidDate(proposal.validUntil) ||
    (proposal.status === "expired" && !isValidDate(proposal.expiredAt)) ||
    !Array.isArray(proposal.proposedActivities) ||
    !Array.isArray(proposal.criteria) ||
    proposal.criteria.length === 0 ||
    !Array.isArray(proposal.justifications) ||
    proposal.justifications.length === 0 ||
    !Array.isArray(proposal.limitations) ||
    !Array.isArray(proposal.planningConflictIds)
  ) {
    throw new ItineraryProposalReviewIntegrityError(
      "A Proposta revisável não possui o snapshot completo.",
    );
  }

  const content = {
    generatedAt: proposal.generatedAt,
    validUntil: proposal.validUntil,
    proposedActivities: proposal.proposedActivities,
    criteria: proposal.criteria,
    justifications: proposal.justifications,
    limitations: proposal.limitations,
    planningConflictIds: proposal.planningConflictIds,
  };

  return proposal.status === "expired"
    ? { ...content, status: "expired" as const, expiredAt: proposal.expiredAt! }
    : { ...content, status: "ready" as const };
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

function dayLabel(day: ItineraryDay): string {
  return `Dia ${day.position} · ${formatDay(day.date)}`;
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

function editValues(activity: ProposedActivity): ItineraryProposalReviewActivityEditValues {
  return {
    ...(activity.targetTripDayId ? { targetTripDayId: activity.targetTripDayId } : {}),
    title: activity.title,
    description: activity.description ?? "",
    proposedStartTime: activity.proposedStartTime?.slice(0, 5) ?? "",
    durationMinutes:
      activity.durationMinutes === undefined ? "" : String(activity.durationMinutes),
    flexibility: activity.flexibility ?? "",
    estimatedCostAmount:
      activity.estimatedCostAmount === undefined ? "" : String(activity.estimatedCostAmount),
    estimatedCostCurrency: activity.estimatedCostCurrency ?? "",
  };
}

export function hasReadyItineraryProposal(proposals: readonly ItineraryProposal[]): boolean {
  return proposals.some((proposal) => proposal.status === "ready");
}

export function getItineraryProposalReviewStatus(
  proposals: readonly ItineraryProposal[],
): "ready" | "expired" | null {
  if (hasReadyItineraryProposal(proposals)) return "ready";
  return proposals.some((proposal) => proposal.status === "expired") ? "expired" : null;
}

export function findLatestReadyItineraryProposal(
  proposals: readonly ItineraryProposal[],
): ItineraryProposal | null {
  const ready = proposals.filter((proposal) => proposal.status === "ready");
  for (const proposal of ready) requireReviewableContent(proposal);

  return (
    [...ready].sort((left, right) => {
      const timeDifference = right.generatedAt!.getTime() - left.generatedAt!.getTime();
      return timeDifference || right.id.localeCompare(left.id);
    })[0] ?? null
  );
}

export function findLatestReviewableItineraryProposal(
  proposals: readonly ItineraryProposal[],
): ItineraryProposal | null {
  const latestReady = findLatestReadyItineraryProposal(proposals);
  if (latestReady) return latestReady;

  const expired = proposals.filter((proposal) => proposal.status === "expired");
  for (const proposal of expired) requireReviewableContent(proposal);

  return (
    [...expired].sort((left, right) => {
      const timeDifference = right.expiredAt!.getTime() - left.expiredAt!.getTime();
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

  const content = requireReviewableContent(proposal);
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

  const dayOptions = Object.freeze(
    [...itinerary.days]
      .sort((left, right) => left.position - right.position || left.id.localeCompare(right.id))
      .map((day): ItineraryProposalReviewDayOption => ({ id: day.id, label: dayLabel(day) })),
  );

  const days = [...groups.entries()]
    .sort(([, left], [, right]) => {
      if (left.day && right.day) return left.day.position - right.day.position;
      if (left.day) return -1;
      if (right.day) return 1;
      return 0;
    })
    .map(([id, group]): ItineraryProposalReviewDay => ({
      id,
      label: group.day ? dayLabel(group.day) : "Referência de dia indisponível",
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
          operationType: activity.operationType,
          operationLabel: operationLabels[activity.operationType],
          timeLabel: activity.proposedStartTime
            ? `Horário proposto: ${activity.proposedStartTime.slice(0, 5)}`
            : "Horário não informado",
          editValues: editValues(activity),
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

  const review = {
    proposalId: proposal.id,
    generatedAtLabel: formatInstant(content.generatedAt, itinerary.period.timeZone),
    validUntilLabel: formatInstant(content.validUntil, itinerary.period.timeZone),
    isBasedOnCurrentItinerary: proposal.baseItineraryVersion === itinerary.version,
    proposedChangeCount: content.proposedActivities.length,
    knownConflictCount: content.planningConflictIds.length,
    criteria: content.criteria,
    justifications: content.justifications,
    limitations: content.limitations,
    dayOptions,
    days,
  };

  return content.status === "expired"
    ? {
        ...review,
        status: "expired",
        expiredAtLabel: formatInstant(content.expiredAt, itinerary.period.timeZone),
      }
    : { ...review, status: "ready" };
}
