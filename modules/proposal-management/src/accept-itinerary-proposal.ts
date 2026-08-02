import {
  createApplyProposalItemsCommand,
  type ApplyProposalItem,
  type ApplyProposalItemsCommand,
  type ApplyProposalItemsCommandInput,
} from "@routebook/trip-management";

import {
  createProposalApplicationRequestFingerprint,
  type ProposalApplicationId,
} from "./proposal-application";

export type AcceptItineraryProposalCommandInput = Readonly<{
  tripId: string;
  itineraryId: string;
  itineraryProposalId: string;
  expectedItineraryVersion: number;
  idempotencyKey: string;
  actorType: string;
  actorId?: string;
  decidedAt: Date;
  items: readonly ApplyProposalItem[];
}>;

export type AcceptItineraryProposalCommand = ApplyProposalItemsCommand &
  Readonly<{
    applicationType: "full";
    actorType: string;
    actorId?: string;
    decidedAt: Date;
    requestFingerprint: string;
    proposedActivityIds: readonly string[];
  }>;

export type AppliedItineraryProposalAcceptance = Readonly<{
  kind: "applied";
  tripId: string;
  itineraryId: string;
  itineraryProposalId: string;
  proposalApplicationId: ProposalApplicationId | string;
  decisionId: string;
  requestFingerprint: string;
  resultingItineraryVersion: number;
  appliedProposedActivityIds: readonly string[];
}>;

export type ReplayedItineraryProposalAcceptance = Readonly<{
  kind: "replay";
  tripId: string;
  itineraryId: string;
  itineraryProposalId: string;
  proposalApplicationId: ProposalApplicationId | string;
  decisionId: string;
  requestFingerprint: string;
  resultingItineraryVersion: number;
  appliedProposedActivityIds: readonly string[];
}>;

export type AcceptItineraryProposalResult =
  | AppliedItineraryProposalAcceptance
  | ReplayedItineraryProposalAcceptance;

export const acceptItineraryProposalErrorCodes = [
  "fingerprint-conflict",
  "proposal-not-found",
  "proposal-not-ready",
  "proposal-expired",
  "proposal-items-mismatch",
  "itinerary-not-found",
  "itinerary-version-mismatch",
  "application-in-progress",
  "application-failed",
] as const;

export type AcceptItineraryProposalErrorCode =
  (typeof acceptItineraryProposalErrorCodes)[number];

export class AcceptItineraryProposalValidationError extends Error {
  constructor(readonly fieldErrors: Readonly<Record<string, string>>) {
    super("O comando AcceptItineraryProposal possui dados inválidos.");
    this.name = "AcceptItineraryProposalValidationError";
  }
}

export class AcceptItineraryProposalError extends Error {
  constructor(
    readonly code: AcceptItineraryProposalErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AcceptItineraryProposalError";
  }
}

export interface ApplyItineraryProposalTransaction {
  execute(command: AcceptItineraryProposalCommand): Promise<AcceptItineraryProposalResult>;
}

export interface AcceptItineraryProposal {
  execute(input: AcceptItineraryProposalCommandInput): Promise<AcceptItineraryProposalResult>;
}

function requiredText(value: string, field: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    throw new AcceptItineraryProposalValidationError({
      [field]: "Informe um valor não vazio.",
    });
  }
  return normalized;
}

function optionalText(value: string | undefined, field: string): string | undefined {
  return value === undefined ? undefined : requiredText(value, field);
}

function validDate(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new AcceptItineraryProposalValidationError({
      [field]: "Informe uma data válida.",
    });
  }
  return new Date(value.getTime());
}

function applyCommandInput(
  input: AcceptItineraryProposalCommandInput,
): ApplyProposalItemsCommandInput {
  return {
    tripId: input.tripId,
    itineraryId: input.itineraryId,
    itineraryProposalId: input.itineraryProposalId,
    expectedItineraryVersion: input.expectedItineraryVersion,
    idempotencyKey: input.idempotencyKey,
    items: input.items,
  };
}

export function createAcceptItineraryProposalCommand(
  input: AcceptItineraryProposalCommandInput,
): AcceptItineraryProposalCommand {
  if (!input || typeof input !== "object") {
    throw new AcceptItineraryProposalValidationError({
      command: "Informe um comando AcceptItineraryProposal válido.",
    });
  }

  const applyCommand = createApplyProposalItemsCommand(applyCommandInput(input));
  const actorType = requiredText(input.actorType, "actorType");
  const actorId = optionalText(input.actorId, "actorId");
  const decidedAt = validDate(input.decidedAt, "decidedAt");
  const proposedActivityIds = Object.freeze(
    applyCommand.items.map((item) => item.proposedActivityId),
  );
  const requestFingerprint = createProposalApplicationRequestFingerprint({
    itineraryProposalId: applyCommand.itineraryProposalId,
    itineraryId: applyCommand.itineraryId,
    applicationType: "full",
    expectedItineraryVersion: applyCommand.expectedItineraryVersion,
    actorType,
    ...(actorId !== undefined ? { actorId } : {}),
    proposedActivityIds,
  });

  return Object.freeze({
    ...applyCommand,
    applicationType: "full",
    actorType,
    ...(actorId !== undefined ? { actorId } : {}),
    decidedAt,
    requestFingerprint,
    proposedActivityIds,
  });
}

export function createAcceptItineraryProposal(
  transaction: ApplyItineraryProposalTransaction,
): AcceptItineraryProposal {
  if (!transaction || typeof transaction.execute !== "function") {
    throw new TypeError("Informe um port ApplyItineraryProposalTransaction válido.");
  }

  return Object.freeze({
    async execute(input) {
      const command = createAcceptItineraryProposalCommand(input);
      return transaction.execute(command);
    },
  });
}
