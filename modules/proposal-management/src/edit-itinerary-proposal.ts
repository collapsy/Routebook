import {
  ItineraryProposalValidationError,
  type ItineraryProposal,
  type ProposedActivity,
} from "./itinerary-proposal";

export type ItineraryProposalProposedActivityEditErrorCode =
  | "proposal-not-ready"
  | "proposed-activity-not-found";

export class ItineraryProposalProposedActivityEditError extends Error {
  constructor(
    message: string,
    readonly code: ItineraryProposalProposedActivityEditErrorCode,
  ) {
    super(message);
    this.name = "ItineraryProposalProposedActivityEditError";
  }
}

export type EditableItineraryProposalProposedActivityChanges = Readonly<{
  targetTripDayId?: string;
  title?: string;
  description?: string | null;
  proposedStartTime?: string | null;
  durationMinutes?: number | null;
  proposedOrder?: number | null;
  flexibility?: string | null;
  estimatedCostAmount?: number | null;
  estimatedCostCurrency?: string | null;
}>;

export type EditItineraryProposalProposedActivityInput = Readonly<{
  proposedActivityId: string;
  changes: EditableItineraryProposalProposedActivityChanges;
  editedAt: Date;
}>;

function validationError(field: string, message: string): never {
  throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
    [field]: message,
  });
}

function requiredText(value: string, field: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) validationError(field, "Informe um valor não vazio.");
  return normalized;
}

function optionalTextChange(
  current: string | undefined,
  change: string | null | undefined,
  field: string,
): string | undefined {
  if (change === undefined) return current;
  if (change === null) return undefined;
  return requiredText(change, field);
}

function optionalLocalTimeChange(
  current: string | undefined,
  change: string | null | undefined,
  field: string,
): string | undefined {
  const value = optionalTextChange(current, change, field);
  if (value === undefined) return undefined;
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) {
    validationError(field, "Use um horário local no formato HH:mm ou HH:mm:ss.");
  }
  return value;
}

function optionalPositiveIntegerChange(
  current: number | undefined,
  change: number | null | undefined,
  field: string,
): number | undefined {
  if (change === undefined) return current;
  if (change === null) return undefined;
  if (!Number.isInteger(change) || change < 1) {
    validationError(field, "Use um inteiro positivo.");
  }
  return change;
}

function optionalNonNegativeIntegerChange(
  current: number | undefined,
  change: number | null | undefined,
  field: string,
): number | undefined {
  if (change === undefined) return current;
  if (change === null) return undefined;
  if (!Number.isInteger(change) || change < 0) {
    validationError(field, "Use um inteiro maior ou igual a zero.");
  }
  return change;
}

function optionalNonNegativeNumberChange(
  current: number | undefined,
  change: number | null | undefined,
  field: string,
): number | undefined {
  if (change === undefined) return current;
  if (change === null) return undefined;
  if (!Number.isFinite(change) || change < 0) {
    validationError(field, "Use um número finito maior ou igual a zero.");
  }
  return change;
}

function optionalCurrencyChange(
  current: string | undefined,
  change: string | null | undefined,
  field: string,
): string | undefined {
  const value = optionalTextChange(current, change, field)?.toUpperCase();
  if (value === undefined) return undefined;
  if (!/^[A-Z]{3}$/.test(value)) {
    validationError(field, "Use um código de moeda com três letras.");
  }
  return value;
}

function validEditedAt(proposal: ItineraryProposal, value: Date): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    validationError("editedAt", "Informe uma data válida.");
  }
  if (value.getTime() < proposal.updatedAt.getTime()) {
    validationError("editedAt", "O instante não pode ser anterior à última atualização.");
  }
  return new Date(value.getTime());
}

function hasChanges(changes: EditableItineraryProposalProposedActivityChanges): boolean {
  return Object.values(changes).some((value) => value !== undefined);
}

function editActivity(
  activity: ProposedActivity,
  changes: EditableItineraryProposalProposedActivityChanges,
): ProposedActivity {
  const targetTripDayId =
    changes.targetTripDayId === undefined
      ? activity.targetTripDayId
      : requiredText(changes.targetTripDayId, "changes.targetTripDayId");
  const title =
    changes.title === undefined
      ? activity.title
      : requiredText(changes.title, "changes.title");
  const description = optionalTextChange(
    activity.description,
    changes.description,
    "changes.description",
  );
  const proposedStartTime = optionalLocalTimeChange(
    activity.proposedStartTime,
    changes.proposedStartTime,
    "changes.proposedStartTime",
  );
  const durationMinutes = optionalPositiveIntegerChange(
    activity.durationMinutes,
    changes.durationMinutes,
    "changes.durationMinutes",
  );
  const proposedOrder = optionalNonNegativeIntegerChange(
    activity.proposedOrder,
    changes.proposedOrder,
    "changes.proposedOrder",
  );
  const flexibility = optionalTextChange(
    activity.flexibility,
    changes.flexibility,
    "changes.flexibility",
  );
  const estimatedCostAmount = optionalNonNegativeNumberChange(
    activity.estimatedCostAmount,
    changes.estimatedCostAmount,
    "changes.estimatedCostAmount",
  );
  const estimatedCostCurrency = optionalCurrencyChange(
    activity.estimatedCostCurrency,
    changes.estimatedCostCurrency,
    "changes.estimatedCostCurrency",
  );

  return Object.freeze({
    proposedActivityId: activity.proposedActivityId,
    title,
    operationType: activity.operationType,
    ...(targetTripDayId ? { targetTripDayId } : {}),
    ...(activity.sourceActivityId ? { sourceActivityId: activity.sourceActivityId } : {}),
    ...(activity.placeId ? { placeId: activity.placeId } : {}),
    ...(description ? { description } : {}),
    ...(proposedStartTime ? { proposedStartTime } : {}),
    ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    ...(proposedOrder !== undefined ? { proposedOrder } : {}),
    ...(flexibility ? { flexibility } : {}),
    ...(estimatedCostAmount !== undefined ? { estimatedCostAmount } : {}),
    ...(estimatedCostCurrency ? { estimatedCostCurrency } : {}),
    ...(activity.reason ? { reason: activity.reason } : {}),
  });
}

export function editItineraryProposalProposedActivity(
  proposal: ItineraryProposal,
  input: EditItineraryProposalProposedActivityInput,
): ItineraryProposal {
  if (proposal.status !== "ready") {
    throw new ItineraryProposalProposedActivityEditError(
      "Apenas Itinerary Proposal pronta pode ser editada.",
      "proposal-not-ready",
    );
  }

  const proposedActivityId = requiredText(input.proposedActivityId, "proposedActivityId");
  if (!input.changes || typeof input.changes !== "object" || !hasChanges(input.changes)) {
    validationError("changes", "Informe ao menos uma alteração editável.");
  }
  const editedAt = validEditedAt(proposal, input.editedAt);
  const proposedActivities = proposal.proposedActivities;
  if (!Array.isArray(proposedActivities)) {
    validationError("proposedActivities", "A Proposal pronta deve possuir Proposed Activities.");
  }

  const targetIndex = proposedActivities.findIndex(
    (activity) => activity.proposedActivityId === proposedActivityId,
  );
  if (targetIndex < 0) {
    throw new ItineraryProposalProposedActivityEditError(
      "A Proposed Activity solicitada não pertence à Itinerary Proposal.",
      "proposed-activity-not-found",
    );
  }

  const editedActivity = editActivity(proposedActivities[targetIndex]!, input.changes);
  const nextActivities = Object.freeze(
    proposedActivities.map((activity, index) => (index === targetIndex ? editedActivity : activity)),
  );

  return Object.freeze({
    ...proposal,
    proposedActivities: nextActivities,
    updatedAt: editedAt,
  });
}
