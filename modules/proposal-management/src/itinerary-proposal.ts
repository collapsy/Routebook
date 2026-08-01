import { randomUUID } from "node:crypto";

const itineraryProposalIdBrand: unique symbol = Symbol("ItineraryProposalId");

export type ItineraryProposalId = string & {
  readonly [itineraryProposalIdBrand]: true;
};

export const itineraryProposalStatuses = [
  "requested",
  "generating",
  "ready",
  "partially-accepted",
  "accepted",
  "rejected",
  "expired",
  "failed",
  "cancelled",
  "superseded",
] as const;

export type ItineraryProposalStatus = (typeof itineraryProposalStatuses)[number];

export const proposedActivityOperationTypes = ["add", "move", "update", "remove"] as const;

export type ProposedActivityOperationType = (typeof proposedActivityOperationTypes)[number];

export type ProposedActivity = Readonly<{
  proposedActivityId: string;
  targetTripDayId?: string;
  sourceActivityId?: string;
  placeId?: string;
  title: string;
  description?: string;
  proposedStartTime?: string;
  durationMinutes?: number;
  proposedOrder?: number;
  operationType: ProposedActivityOperationType;
  flexibility?: string;
  estimatedCostAmount?: number;
  estimatedCostCurrency?: string;
  reason?: string;
}>;

export type ProposedActivityInput = ProposedActivity;

export type CompleteItineraryProposalGenerationInput = Readonly<{
  generationMethod: string;
  generationVersion: string;
  proposedActivities: readonly ProposedActivityInput[];
  criteria: readonly string[];
  justifications: readonly string[];
  limitations: readonly string[];
  planningConflictIds: readonly string[];
  validUntil: Date;
  generatedAt: Date;
}>;

export type ItineraryProposal = Readonly<{
  id: ItineraryProposalId;
  tripId: string;
  itineraryId: string;
  baseTripContextVersion: number;
  baseItineraryVersion: number;
  contextSnapshotId: string;
  status: ItineraryProposalStatus;
  requestedAt: Date;
  updatedAt: Date;
  generationStartedAt?: Date;
  generationMethod?: string;
  generationVersion?: string;
  proposedActivities?: readonly ProposedActivity[];
  criteria?: readonly string[];
  justifications?: readonly string[];
  limitations?: readonly string[];
  planningConflictIds?: readonly string[];
  validUntil?: Date;
  generatedAt?: Date;
  rejectedAt?: Date;
  expiredAt?: Date;
  failedAt?: Date;
  failureCode?: string;
  cancelledAt?: Date;
}>;

export type RequestItineraryProposalInput = Readonly<{
  id?: string;
  tripId: string;
  itineraryId: string;
  baseTripContextVersion: number;
  baseItineraryVersion: number;
  contextSnapshotId: string;
  requestedAt: Date;
}>;

export class ItineraryProposalValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Readonly<Record<string, string>>,
  ) {
    super(message);
    this.name = "ItineraryProposalValidationError";
  }
}

export class ItineraryProposalTransitionError extends Error {
  constructor(
    message: string,
    readonly currentStatus: ItineraryProposalStatus,
    readonly attemptedStatus: ItineraryProposalStatus,
  ) {
    super(message);
    this.name = "ItineraryProposalTransitionError";
  }
}

function requiredText(value: string, field: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Informe um valor não vazio.",
    });
  }
  return normalized;
}

function optionalText(value: string | undefined, field: string): string | undefined {
  return value === undefined ? undefined : requiredText(value, field);
}

function optionalPositiveInteger(value: number | undefined, field: string): number | undefined {
  return value === undefined ? undefined : positiveInteger(value, field);
}

function optionalNonNegativeInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || value < 0) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Use um inteiro maior ou igual a zero.",
    });
  }
  return value;
}

function optionalNonNegativeNumber(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value) || value < 0) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Use um número finito maior ou igual a zero.",
    });
  }
  return value;
}

function optionalLocalTime(value: string | undefined, field: string): string | undefined {
  const normalized = optionalText(value, field);
  if (normalized === undefined) return undefined;
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(normalized)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Use um horário local no formato HH:mm ou HH:mm:ss.",
    });
  }
  return normalized;
}

function optionalCurrency(value: string | undefined, field: string): string | undefined {
  const normalized = optionalText(value, field)?.toUpperCase();
  if (normalized === undefined) return undefined;
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Use um código de moeda com três letras.",
    });
  }
  return normalized;
}

function normalizedTexts(
  values: readonly string[],
  field: string,
  requireAtLeastOne: boolean,
): readonly string[] {
  if (!Array.isArray(values) || (requireAtLeastOne && values.length === 0)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Informe ao menos um item.",
    });
  }

  return Object.freeze(values.map((value, index) => requiredText(value, `${field}.${index}`)));
}

function normalizeProposedActivity(
  activity: ProposedActivityInput,
  index: number,
): ProposedActivity {
  const field = `proposedActivities.${index}`;
  if (!activity || typeof activity !== "object") {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Informe uma Proposed Activity válida.",
    });
  }

  if (!proposedActivityOperationTypes.includes(activity.operationType)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [`${field}.operationType`]: "Use add, move, update ou remove.",
    });
  }

  const targetTripDayId = optionalText(activity.targetTripDayId, `${field}.targetTripDayId`);
  const sourceActivityId = optionalText(activity.sourceActivityId, `${field}.sourceActivityId`);
  const placeId = optionalText(activity.placeId, `${field}.placeId`);
  const description = optionalText(activity.description, `${field}.description`);
  const proposedStartTime = optionalLocalTime(
    activity.proposedStartTime,
    `${field}.proposedStartTime`,
  );
  const durationMinutes = optionalPositiveInteger(
    activity.durationMinutes,
    `${field}.durationMinutes`,
  );
  const proposedOrder = optionalNonNegativeInteger(
    activity.proposedOrder,
    `${field}.proposedOrder`,
  );
  const flexibility = optionalText(activity.flexibility, `${field}.flexibility`);
  const estimatedCostAmount = optionalNonNegativeNumber(
    activity.estimatedCostAmount,
    `${field}.estimatedCostAmount`,
  );
  const estimatedCostCurrency = optionalCurrency(
    activity.estimatedCostCurrency,
    `${field}.estimatedCostCurrency`,
  );
  const reason = optionalText(activity.reason, `${field}.reason`);

  return Object.freeze({
    proposedActivityId: requiredText(activity.proposedActivityId, `${field}.proposedActivityId`),
    title: requiredText(activity.title, `${field}.title`),
    operationType: activity.operationType,
    ...(targetTripDayId ? { targetTripDayId } : {}),
    ...(sourceActivityId ? { sourceActivityId } : {}),
    ...(placeId ? { placeId } : {}),
    ...(description ? { description } : {}),
    ...(proposedStartTime ? { proposedStartTime } : {}),
    ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    ...(proposedOrder !== undefined ? { proposedOrder } : {}),
    ...(flexibility ? { flexibility } : {}),
    ...(estimatedCostAmount !== undefined ? { estimatedCostAmount } : {}),
    ...(estimatedCostCurrency ? { estimatedCostCurrency } : {}),
    ...(reason ? { reason } : {}),
  });
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Use um inteiro positivo.",
    });
  }
  return value;
}

function validDate(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Informe uma data válida.",
    });
  }
  return new Date(value.getTime());
}

function transitionDate(proposal: ItineraryProposal, value: Date): Date {
  const normalized = validDate(value, "transitionAt");
  if (normalized.getTime() < proposal.updatedAt.getTime()) {
    throw new ItineraryProposalValidationError("Instante de transição inválido.", {
      transitionAt: "O instante não pode ser anterior à última atualização.",
    });
  }
  return normalized;
}

function assertStatus(
  proposal: ItineraryProposal,
  allowedStatuses: readonly ItineraryProposalStatus[],
  attemptedStatus: ItineraryProposalStatus,
): void {
  if (!allowedStatuses.includes(proposal.status)) {
    throw new ItineraryProposalTransitionError(
      `Não é possível alterar Itinerary Proposal de ${proposal.status} para ${attemptedStatus}.`,
      proposal.status,
      attemptedStatus,
    );
  }
}

export function createItineraryProposalId(value: string = randomUUID()): ItineraryProposalId {
  return requiredText(value, "id") as ItineraryProposalId;
}

export function requestItineraryProposal(input: RequestItineraryProposalInput): ItineraryProposal {
  const requestedAt = validDate(input.requestedAt, "requestedAt");

  return Object.freeze({
    id: createItineraryProposalId(input.id),
    tripId: requiredText(input.tripId, "tripId"),
    itineraryId: requiredText(input.itineraryId, "itineraryId"),
    baseTripContextVersion: positiveInteger(input.baseTripContextVersion, "baseTripContextVersion"),
    baseItineraryVersion: positiveInteger(input.baseItineraryVersion, "baseItineraryVersion"),
    contextSnapshotId: requiredText(input.contextSnapshotId, "contextSnapshotId"),
    status: "requested",
    requestedAt,
    updatedAt: new Date(requestedAt.getTime()),
  });
}

export function startItineraryProposalGeneration(
  proposal: ItineraryProposal,
  startedAt: Date,
): ItineraryProposal {
  assertStatus(proposal, ["requested"], "generating");
  const generationStartedAt = transitionDate(proposal, startedAt);

  return Object.freeze({
    ...proposal,
    status: "generating",
    generationStartedAt,
    updatedAt: new Date(generationStartedAt.getTime()),
  });
}

export function completeItineraryProposalGeneration(
  proposal: ItineraryProposal,
  input: CompleteItineraryProposalGenerationInput,
): ItineraryProposal {
  assertStatus(proposal, ["generating"], "ready");
  const generatedAt = transitionDate(proposal, input.generatedAt);
  const validUntil = validDate(input.validUntil, "validUntil");
  const generationMethod = requiredText(input.generationMethod, "generationMethod");
  const generationVersion = requiredText(input.generationVersion, "generationVersion");
  if (!Array.isArray(input.proposedActivities)) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      proposedActivities: "Informe uma coleção de Proposed Activities.",
    });
  }

  const proposedActivities = Object.freeze(input.proposedActivities.map(normalizeProposedActivity));
  const criteria = normalizedTexts(input.criteria, "criteria", true);
  const justifications = normalizedTexts(input.justifications, "justifications", true);
  const limitations = normalizedTexts(input.limitations, "limitations", false);
  const planningConflictIds = normalizedTexts(
    input.planningConflictIds,
    "planningConflictIds",
    false,
  );

  return Object.freeze({
    ...proposal,
    status: "ready",
    generationMethod,
    generationVersion,
    proposedActivities,
    criteria,
    justifications,
    limitations,
    planningConflictIds,
    validUntil,
    generatedAt,
    updatedAt: new Date(generatedAt.getTime()),
  });
}

export function expireItineraryProposalByTime(
  proposal: ItineraryProposal,
  expiredAt: Date,
): ItineraryProposal {
  assertStatus(proposal, ["ready"], "expired");
  const normalizedExpiredAt = transitionDate(proposal, expiredAt);
  if (!proposal.validUntil) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      validUntil: "A Proposal pronta deve possuir validade temporal.",
    });
  }
  const validUntil = validDate(proposal.validUntil, "validUntil");
  if (normalizedExpiredAt.getTime() < validUntil.getTime()) {
    throw new ItineraryProposalValidationError("A validade da Itinerary Proposal não terminou.", {
      expiredAt: "O instante de expiração deve alcançar ou ultrapassar validUntil.",
    });
  }

  return Object.freeze({
    ...proposal,
    status: "expired",
    expiredAt: new Date(normalizedExpiredAt.getTime()),
    updatedAt: new Date(normalizedExpiredAt.getTime()),
  });
}

export function rejectItineraryProposal(
  proposal: ItineraryProposal,
  rejectedAt: Date,
): ItineraryProposal {
  assertStatus(proposal, ["ready"], "rejected");
  const normalizedRejectedAt = transitionDate(proposal, rejectedAt);

  return Object.freeze({
    ...proposal,
    status: "rejected",
    rejectedAt: new Date(normalizedRejectedAt.getTime()),
    updatedAt: new Date(normalizedRejectedAt.getTime()),
  });
}

export function failItineraryProposalGeneration(
  proposal: ItineraryProposal,
  failureCode: string,
  failedAt: Date,
): ItineraryProposal {
  assertStatus(proposal, ["generating"], "failed");
  const normalizedFailureCode = requiredText(failureCode, "failureCode");
  const normalizedFailedAt = transitionDate(proposal, failedAt);

  return Object.freeze({
    ...proposal,
    status: "failed",
    failureCode: normalizedFailureCode,
    failedAt: normalizedFailedAt,
    updatedAt: new Date(normalizedFailedAt.getTime()),
  });
}

export function cancelItineraryProposalGeneration(
  proposal: ItineraryProposal,
  cancelledAt: Date,
): ItineraryProposal {
  assertStatus(proposal, ["requested", "generating"], "cancelled");
  const normalizedCancelledAt = transitionDate(proposal, cancelledAt);

  return Object.freeze({
    ...proposal,
    status: "cancelled",
    cancelledAt: normalizedCancelledAt,
    updatedAt: new Date(normalizedCancelledAt.getTime()),
  });
}
