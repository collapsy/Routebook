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
  const normalized = value.trim();
  if (!normalized) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      [field]: "Informe um valor não vazio.",
    });
  }
  return normalized;
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
