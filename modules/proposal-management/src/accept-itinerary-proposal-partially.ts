import {
  createApplyProposalItemsCommand,
  type ApplyProposalItem,
  type ApplyProposalItemsCommand,
} from "../../trip-management/src/index";

import {
  createProposalApplicationRequestFingerprint,
  type ProposalApplicationId,
} from "./proposal-application";
import {
  ItineraryProposalValidationError,
  type ItineraryProposal,
  type ProposedActivity,
} from "./itinerary-proposal";

export const partialItineraryProposalAcceptanceApplicationType = "partial" as const;

export const partialItineraryProposalAcceptanceErrorCodes = [
  "proposal-not-ready",
  "proposal-expired",
  "selection-empty",
  "duplicate-selection",
  "unknown-proposed-activity",
  "full-selection",
] as const;

export type PartialItineraryProposalAcceptanceErrorCode =
  (typeof partialItineraryProposalAcceptanceErrorCodes)[number];

export class PartialItineraryProposalAcceptanceError extends Error {
  constructor(
    readonly code: PartialItineraryProposalAcceptanceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PartialItineraryProposalAcceptanceError";
  }
}

export type PartialItineraryProposalSelection = Readonly<{
  selected: readonly ProposedActivity[];
  remaining: readonly ProposedActivity[];
}>;

export type AcceptItineraryProposalPartiallyCommandInput = Readonly<{
  proposal: ItineraryProposal;
  expectedItineraryVersion: number;
  idempotencyKey: string;
  actorType: string;
  actorId?: string;
  decidedAt: Date;
  items: readonly ApplyProposalItem[];
}>;

export type AcceptItineraryProposalPartiallyCommand = ApplyProposalItemsCommand &
  Readonly<{
    applicationType: typeof partialItineraryProposalAcceptanceApplicationType;
    actorType: string;
    actorId?: string;
    decidedAt: Date;
    requestFingerprint: string;
    proposedActivityIds: readonly string[];
    remainingProposedActivityIds: readonly string[];
  }>;

export type AppliedPartialItineraryProposalAcceptance = Readonly<{
  kind: "applied";
  tripId: string;
  itineraryId: string;
  itineraryProposalId: string;
  proposalApplicationId: ProposalApplicationId | string;
  decisionId: string;
  requestFingerprint: string;
  resultingItineraryVersion: number;
  appliedProposedActivityIds: readonly string[];
  remainingProposedActivityIds: readonly string[];
}>;

export type ReplayedPartialItineraryProposalAcceptance = Readonly<{
  kind: "replay";
  tripId: string;
  itineraryId: string;
  itineraryProposalId: string;
  proposalApplicationId: ProposalApplicationId | string;
  decisionId: string;
  requestFingerprint: string;
  resultingItineraryVersion: number;
  appliedProposedActivityIds: readonly string[];
  remainingProposedActivityIds: readonly string[];
}>;

export type AcceptItineraryProposalPartiallyResult =
  AppliedPartialItineraryProposalAcceptance | ReplayedPartialItineraryProposalAcceptance;

function requiredText(value: string, field: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    throw new ItineraryProposalValidationError("Aceite parcial inválido.", {
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
    throw new ItineraryProposalValidationError("Aceite parcial inválido.", {
      [field]: "Informe uma data válida.",
    });
  }
  return new Date(value.getTime());
}

function proposalActivities(proposal: ItineraryProposal): readonly ProposedActivity[] {
  if (!Array.isArray(proposal.proposedActivities) || proposal.proposedActivities.length === 0) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      proposedActivities: "A Proposal pronta deve possuir Proposed Activities para aceite parcial.",
    });
  }
  return proposal.proposedActivities;
}

function assertReadyAndCurrent(proposal: ItineraryProposal, decidedAt: Date): Date {
  if (proposal.status !== "ready") {
    throw new PartialItineraryProposalAcceptanceError(
      "proposal-not-ready",
      "Somente uma Itinerary Proposal pronta pode ser aceita parcialmente.",
    );
  }

  const normalizedDecidedAt = validDate(decidedAt, "decidedAt");
  if (!(proposal.validUntil instanceof Date) || Number.isNaN(proposal.validUntil.getTime())) {
    throw new ItineraryProposalValidationError("Itinerary Proposal inválida.", {
      validUntil: "A Proposal pronta deve possuir validade temporal.",
    });
  }
  if (normalizedDecidedAt.getTime() < proposal.updatedAt.getTime()) {
    throw new ItineraryProposalValidationError("Aceite parcial inválido.", {
      decidedAt: "A decisão não pode ser anterior à última atualização da Proposal.",
    });
  }
  if (normalizedDecidedAt.getTime() >= proposal.validUntil.getTime()) {
    throw new PartialItineraryProposalAcceptanceError(
      "proposal-expired",
      "A Itinerary Proposal não está mais válida para aceite parcial.",
    );
  }

  return normalizedDecidedAt;
}

function normalizedSelectionIds(values: readonly string[]): readonly string[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new PartialItineraryProposalAcceptanceError(
      "selection-empty",
      "Selecione ao menos uma Proposed Activity para o aceite parcial.",
    );
  }

  const normalized = values.map((value, index) =>
    requiredText(value, `selectedProposedActivityIds.${index}`),
  );
  const seen = new Set<string>();
  for (const id of normalized) {
    if (seen.has(id)) {
      throw new PartialItineraryProposalAcceptanceError(
        "duplicate-selection",
        `A Proposed Activity ${id} foi selecionada mais de uma vez.`,
      );
    }
    seen.add(id);
  }
  return Object.freeze(normalized);
}

export function selectItineraryProposalForPartialAcceptance(
  proposal: ItineraryProposal,
  selectedProposedActivityIds: readonly string[],
  decidedAt: Date,
): PartialItineraryProposalSelection {
  assertReadyAndCurrent(proposal, decidedAt);
  const activities = proposalActivities(proposal);
  const selectedIds = normalizedSelectionIds(selectedProposedActivityIds);
  const availableIds = new Set(activities.map((activity) => activity.proposedActivityId));

  for (const id of selectedIds) {
    if (!availableIds.has(id)) {
      throw new PartialItineraryProposalAcceptanceError(
        "unknown-proposed-activity",
        `A Proposed Activity ${id} não pertence à Proposal atual.`,
      );
    }
  }

  if (selectedIds.length === activities.length) {
    throw new PartialItineraryProposalAcceptanceError(
      "full-selection",
      "Selecionar todos os itens corresponde ao aceite integral, não ao aceite parcial.",
    );
  }

  const selectedIdSet = new Set(selectedIds);
  const selected = Object.freeze(
    activities.filter((activity) => selectedIdSet.has(activity.proposedActivityId)),
  );
  const remaining = Object.freeze(
    activities.filter((activity) => !selectedIdSet.has(activity.proposedActivityId)),
  );

  return Object.freeze({ selected, remaining });
}

function orderedSelectedItems(
  items: readonly ApplyProposalItem[],
  selection: PartialItineraryProposalSelection,
): readonly ApplyProposalItem[] {
  const itemsById = new Map(items.map((item) => [item.proposedActivityId, item] as const));
  return Object.freeze(
    selection.selected.map((activity) => {
      const item = itemsById.get(activity.proposedActivityId);
      if (!item) {
        throw new PartialItineraryProposalAcceptanceError(
          "unknown-proposed-activity",
          `O item de aplicação ${activity.proposedActivityId} não foi informado.`,
        );
      }
      return item;
    }),
  );
}

export function createAcceptItineraryProposalPartiallyCommand(
  input: AcceptItineraryProposalPartiallyCommandInput,
): AcceptItineraryProposalPartiallyCommand {
  if (!input || typeof input !== "object") {
    throw new ItineraryProposalValidationError("Aceite parcial inválido.", {
      command: "Informe um comando AcceptItineraryProposalPartially válido.",
    });
  }

  const normalizedItemsCommand = createApplyProposalItemsCommand({
    tripId: input.proposal.tripId,
    itineraryId: input.proposal.itineraryId,
    itineraryProposalId: String(input.proposal.id),
    expectedItineraryVersion: input.expectedItineraryVersion,
    idempotencyKey: input.idempotencyKey,
    items: input.items,
  });
  const decidedAt = assertReadyAndCurrent(input.proposal, input.decidedAt);
  const selection = selectItineraryProposalForPartialAcceptance(
    input.proposal,
    normalizedItemsCommand.items.map((item) => item.proposedActivityId),
    decidedAt,
  );
  const items = orderedSelectedItems(normalizedItemsCommand.items, selection);
  const applyCommand = createApplyProposalItemsCommand({
    ...normalizedItemsCommand,
    items,
  });
  const actorType = requiredText(input.actorType, "actorType");
  const actorId = optionalText(input.actorId, "actorId");
  const proposedActivityIds = Object.freeze(
    selection.selected.map((activity) => activity.proposedActivityId),
  );
  const remainingProposedActivityIds = Object.freeze(
    selection.remaining.map((activity) => activity.proposedActivityId),
  );
  const requestFingerprint = createProposalApplicationRequestFingerprint({
    itineraryProposalId: applyCommand.itineraryProposalId,
    itineraryId: applyCommand.itineraryId,
    applicationType: partialItineraryProposalAcceptanceApplicationType,
    expectedItineraryVersion: applyCommand.expectedItineraryVersion,
    actorType,
    ...(actorId !== undefined ? { actorId } : {}),
    proposedActivityIds,
  });

  return Object.freeze({
    ...applyCommand,
    applicationType: partialItineraryProposalAcceptanceApplicationType,
    actorType,
    ...(actorId !== undefined ? { actorId } : {}),
    decidedAt,
    requestFingerprint,
    proposedActivityIds,
    remainingProposedActivityIds,
  });
}

export function partiallyAcceptItineraryProposal(
  proposal: ItineraryProposal,
  acceptedProposedActivityIds: readonly string[],
  acceptedAt: Date,
): ItineraryProposal {
  const normalizedAcceptedAt = assertReadyAndCurrent(proposal, acceptedAt);
  const selection = selectItineraryProposalForPartialAcceptance(
    proposal,
    acceptedProposedActivityIds,
    normalizedAcceptedAt,
  );

  return Object.freeze({
    ...proposal,
    status: "partially-accepted",
    proposedActivities: selection.remaining,
    acceptedAt: new Date(normalizedAcceptedAt.getTime()),
    updatedAt: new Date(normalizedAcceptedAt.getTime()),
  });
}
