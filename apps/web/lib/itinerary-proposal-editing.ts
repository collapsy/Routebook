import {
  editAndPersistItineraryProposalProposedActivity,
  ItineraryProposalApplicationError,
  ItineraryProposalProposedActivityEditError,
  ItineraryProposalValidationError,
  type EditableItineraryProposalProposedActivityChanges,
  type EditAndPersistItineraryProposalProposedActivityCommand,
  type ItineraryProposal,
  type ItineraryProposalRepository,
} from "@routebook/proposal-management";

import type { TripRouteAccessResult } from "./trip-route-access";

export const editItineraryProposalActionErrorCodes = [
  "unauthenticated",
  "not-found",
  "invalid-request",
  "proposal-not-found",
  "proposal-not-ready",
  "proposed-activity-not-found",
  "technical-error",
] as const;

export type EditItineraryProposalActionErrorCode =
  (typeof editItineraryProposalActionErrorCodes)[number];

export type EditItineraryProposalActionState =
  | Readonly<{ status: "idle" }>
  | Readonly<{
      status: "error";
      code: EditItineraryProposalActionErrorCode;
      message: string;
    }>
  | Readonly<{
      status: "success";
      tripId: string;
      itineraryProposalId: string;
      proposedActivityId: string;
      updatedAt: string;
    }>;

export const initialEditItineraryProposalActionState: EditItineraryProposalActionState =
  Object.freeze({ status: "idle" });

export type EditItineraryProposalActionInput = Readonly<{
  tripId: string;
  itineraryProposalId: string;
  proposedActivityId: string;
  targetTripDayId?: string;
  title?: string;
  description?: string | null;
  proposedStartTime?: string | null;
  durationMinutes?: string | null;
  proposedOrder?: string | null;
  flexibility?: string | null;
  estimatedCostAmount?: string | null;
  estimatedCostCurrency?: string | null;
}>;

type TripAccessResolver = (input: {
  tripId: string;
  action: "trip:edit";
}) => Promise<TripRouteAccessResult>;

type EditProposalService = (
  repository: ItineraryProposalRepository,
  command: EditAndPersistItineraryProposalProposedActivityCommand,
) => Promise<ItineraryProposal>;

export type EditItineraryProposalActionDependencies = Readonly<{
  resolveAccess: TripAccessResolver;
  repository: ItineraryProposalRepository;
  editProposal?: EditProposalService;
  now?: () => Date;
}>;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const localTimePattern = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

const messages: Readonly<Record<EditItineraryProposalActionErrorCode, string>> = {
  unauthenticated: "Entre no RouteBook para editar a proposta de roteiro.",
  "not-found": "A viagem não está disponível para este usuário.",
  "invalid-request": "Os dados enviados para editar a proposta são inválidos.",
  "proposal-not-found": "A proposta de roteiro não está mais disponível.",
  "proposal-not-ready": "A proposta de roteiro não pode mais ser editada.",
  "proposed-activity-not-found": "A atividade sugerida não está mais disponível na proposta.",
  "technical-error": "Não foi possível salvar a edição agora. Tente novamente.",
};

export function editItineraryProposalActionError(
  code: EditItineraryProposalActionErrorCode,
): EditItineraryProposalActionState {
  return Object.freeze({ status: "error", code, message: messages[code] });
}

function nullableText(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function positiveInteger(value: string | null | undefined): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function nonNegativeInteger(value: string | null | undefined): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : Number.NaN;
}

function nonNegativeNumber(value: string | null | undefined): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
}

function parseChanges(
  input: EditItineraryProposalActionInput,
): EditableItineraryProposalProposedActivityChanges | null {
  const changes: {
    targetTripDayId?: string;
    title?: string;
    description?: string | null;
    proposedStartTime?: string | null;
    durationMinutes?: number | null;
    proposedOrder?: number | null;
    flexibility?: string | null;
    estimatedCostAmount?: number | null;
    estimatedCostCurrency?: string | null;
  } = {};

  if (input.targetTripDayId !== undefined) {
    const targetTripDayId = input.targetTripDayId.trim();
    if (!uuidPattern.test(targetTripDayId)) return null;
    changes.targetTripDayId = targetTripDayId;
  }

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) return null;
    changes.title = title;
  }

  if (input.description !== undefined) {
    changes.description = nullableText(input.description) ?? null;
  }

  if (input.proposedStartTime !== undefined) {
    const proposedStartTime = nullableText(input.proposedStartTime);
    if (proposedStartTime !== null && proposedStartTime !== undefined) {
      if (!localTimePattern.test(proposedStartTime)) return null;
      changes.proposedStartTime = proposedStartTime;
    } else {
      changes.proposedStartTime = null;
    }
  }

  if (input.durationMinutes !== undefined) {
    const durationMinutes = positiveInteger(input.durationMinutes);
    if (typeof durationMinutes === "number" && Number.isNaN(durationMinutes)) return null;
    changes.durationMinutes = durationMinutes;
  }

  if (input.proposedOrder !== undefined) {
    const proposedOrder = nonNegativeInteger(input.proposedOrder);
    if (typeof proposedOrder === "number" && Number.isNaN(proposedOrder)) return null;
    changes.proposedOrder = proposedOrder;
  }

  if (input.flexibility !== undefined) {
    changes.flexibility = nullableText(input.flexibility) ?? null;
  }

  if (input.estimatedCostAmount !== undefined) {
    const estimatedCostAmount = nonNegativeNumber(input.estimatedCostAmount);
    if (typeof estimatedCostAmount === "number" && Number.isNaN(estimatedCostAmount)) return null;
    changes.estimatedCostAmount = estimatedCostAmount;
  }

  if (input.estimatedCostCurrency !== undefined) {
    const estimatedCostCurrency = nullableText(input.estimatedCostCurrency);
    if (estimatedCostCurrency === null || estimatedCostCurrency === undefined) {
      changes.estimatedCostCurrency = null;
    } else {
      const normalized = estimatedCostCurrency.toUpperCase();
      if (!/^[A-Z]{3}$/.test(normalized)) return null;
      changes.estimatedCostCurrency = normalized;
    }
  }

  return Object.values(changes).some((value) => value !== undefined) ? changes : null;
}

function mapKnownError(error: unknown): EditItineraryProposalActionState | null {
  if (error instanceof ItineraryProposalApplicationError && error.code === "proposal-not-found") {
    return editItineraryProposalActionError("proposal-not-found");
  }
  if (error instanceof ItineraryProposalProposedActivityEditError) {
    if (error.code === "proposal-not-ready") {
      return editItineraryProposalActionError("proposal-not-ready");
    }
    if (error.code === "proposed-activity-not-found") {
      return editItineraryProposalActionError("proposed-activity-not-found");
    }
  }
  if (error instanceof ItineraryProposalValidationError) {
    return editItineraryProposalActionError("invalid-request");
  }
  return null;
}

export async function executeEditItineraryProposalAction(
  input: EditItineraryProposalActionInput,
  dependencies: EditItineraryProposalActionDependencies,
): Promise<EditItineraryProposalActionState> {
  const tripId = input.tripId.trim();
  const itineraryProposalId = input.itineraryProposalId.trim();
  const proposedActivityId = input.proposedActivityId.trim();
  const changes = parseChanges(input);

  if (
    !uuidPattern.test(tripId) ||
    !uuidPattern.test(itineraryProposalId) ||
    !uuidPattern.test(proposedActivityId) ||
    !changes
  ) {
    return editItineraryProposalActionError("invalid-request");
  }

  try {
    const access = await dependencies.resolveAccess({ tripId, action: "trip:edit" });
    if (access.status === "unauthenticated") {
      return editItineraryProposalActionError("unauthenticated");
    }
    if (access.status === "not-found") {
      return editItineraryProposalActionError("not-found");
    }

    const editedAt = dependencies.now?.() ?? new Date();
    if (Number.isNaN(editedAt.getTime())) {
      return editItineraryProposalActionError("technical-error");
    }

    const editProposal =
      dependencies.editProposal ?? editAndPersistItineraryProposalProposedActivity;
    const proposal = await editProposal(dependencies.repository, {
      tripId,
      itineraryProposalId,
      proposedActivityId,
      changes,
      editedAt: new Date(editedAt.getTime()),
    });

    if (proposal.status !== "ready") {
      return editItineraryProposalActionError("technical-error");
    }

    return Object.freeze({
      status: "success",
      tripId: proposal.tripId,
      itineraryProposalId: String(proposal.id),
      proposedActivityId,
      updatedAt: proposal.updatedAt.toISOString(),
    });
  } catch (error) {
    return mapKnownError(error) ?? editItineraryProposalActionError("technical-error");
  }
}
