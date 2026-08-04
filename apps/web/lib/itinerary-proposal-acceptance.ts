import {
  AcceptItineraryProposalError,
  AcceptItineraryProposalValidationError,
  createItineraryProposalId,
  type AcceptItineraryProposal,
  type ItineraryProposal,
  type ItineraryProposalRepository,
  type ProposedActivity,
} from "@routebook/proposal-management";
import type {
  ApplyProposalItem,
  ItineraryRepository,
  TripRepository,
} from "@routebook/trip-management";

import type { TripRouteAccessResult } from "./trip-route-access";

export const acceptItineraryProposalActionErrorCodes = [
  "unauthenticated",
  "not-found",
  "invalid-request",
  "fingerprint-conflict",
  "proposal-not-found",
  "proposal-not-ready",
  "proposal-expired",
  "proposal-items-mismatch",
  "itinerary-not-found",
  "itinerary-version-mismatch",
  "application-in-progress",
  "application-failed",
  "technical-error",
] as const;

export type AcceptItineraryProposalActionErrorCode =
  (typeof acceptItineraryProposalActionErrorCodes)[number];

export type AcceptItineraryProposalActionState =
  | Readonly<{ status: "idle" }>
  | Readonly<{
      status: "error";
      code: AcceptItineraryProposalActionErrorCode;
      message: string;
    }>
  | Readonly<{
      status: "success";
      kind: "applied" | "replay";
      tripId: string;
      itineraryId: string;
      itineraryProposalId: string;
      proposalApplicationId: string;
      decisionId: string;
      requestFingerprint: string;
      resultingItineraryVersion: number;
      appliedProposedActivityIds: readonly string[];
    }>;

export const initialAcceptItineraryProposalActionState: AcceptItineraryProposalActionState =
  Object.freeze({ status: "idle" });

export type AcceptItineraryProposalActionInput = Readonly<{
  tripId: string;
  itineraryProposalId: string;
  expectedItineraryVersion: string;
  idempotencyKey: string;
}>;

type TripAccessResolver = (input: {
  tripId: string;
  action: "trip:accept-proposal";
}) => Promise<TripRouteAccessResult>;

export type AcceptItineraryProposalActionDependencies = Readonly<{
  resolveAccess: TripAccessResolver;
  tripRepository: Pick<TripRepository, "findById">;
  itineraryRepository: Pick<ItineraryRepository, "findByTripId">;
  proposalRepository: Pick<ItineraryProposalRepository, "findById">;
  acceptItineraryProposal: AcceptItineraryProposal;
  now?: () => Date;
}>;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedFlexibilities = new Set(["fixed", "flexible", "suggested"]);

type ActionMessages = Readonly<Record<AcceptItineraryProposalActionErrorCode, string>>;

const messages: ActionMessages = {
  unauthenticated: "Entre no RouteBook para aceitar esta proposta.",
  "not-found": "A viagem ou a proposta não está disponível para este usuário.",
  "invalid-request": "Os dados enviados para aceitar a proposta são inválidos.",
  "fingerprint-conflict": "Esta tentativa de aceite diverge de uma solicitação anterior.",
  "proposal-not-found": "A proposta de roteiro não foi encontrada.",
  "proposal-not-ready": "A proposta não está pronta para ser aceita.",
  "proposal-expired": "A validade desta proposta terminou.",
  "proposal-items-mismatch": "As mudanças da proposta não correspondem ao conteúdo persistido.",
  "itinerary-not-found": "O roteiro associado à proposta não foi encontrado.",
  "itinerary-version-mismatch": "O roteiro mudou desde a geração desta proposta.",
  "application-in-progress": "O aceite desta proposta já está em processamento.",
  "application-failed": "Uma tentativa anterior de aplicar esta proposta terminou com falha.",
  "technical-error": "Não foi possível aceitar a proposta agora. Tente novamente.",
};

class ProposalItemsMappingError extends Error {
  constructor() {
    super("As Proposed Activities não podem ser convertidas no contrato de aplicação.");
    this.name = "ProposalItemsMappingError";
  }
}

export function acceptItineraryProposalActionError(
  code: AcceptItineraryProposalActionErrorCode,
): AcceptItineraryProposalActionState {
  return Object.freeze({ status: "error", code, message: messages[code] });
}

function normalizedRequest(input: AcceptItineraryProposalActionInput): Readonly<{
  tripId: string;
  itineraryProposalId: string;
  expectedItineraryVersion: number;
  idempotencyKey: string;
}> | null {
  const tripId = input.tripId.trim();
  const itineraryProposalId = input.itineraryProposalId.trim();
  const expectedItineraryVersion = Number(input.expectedItineraryVersion);
  const idempotencyKey = input.idempotencyKey.trim();

  if (
    !uuidPattern.test(tripId) ||
    !uuidPattern.test(itineraryProposalId) ||
    !Number.isInteger(expectedItineraryVersion) ||
    expectedItineraryVersion < 1 ||
    idempotencyKey.length < 8 ||
    idempotencyKey.length > 200
  ) {
    return null;
  }

  return Object.freeze({
    tripId,
    itineraryProposalId,
    expectedItineraryVersion,
    idempotencyKey,
  });
}

function requiredText(value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) throw new ProposalItemsMappingError();
  return normalized;
}

function optionalFlexibility(
  value: string | undefined,
): "fixed" | "flexible" | "suggested" | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim();
  if (!allowedFlexibilities.has(normalized)) {
    throw new ProposalItemsMappingError();
  }
  return normalized as "fixed" | "flexible" | "suggested";
}

function optionalStartTime(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim();
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(normalized)) {
    throw new ProposalItemsMappingError();
  }
  return normalized.slice(0, 5);
}

function activityDraft(activity: ProposedActivity) {
  const flexibility = optionalFlexibility(activity.flexibility);
  const startTime = optionalStartTime(activity.proposedStartTime);
  const placeId = activity.placeId === undefined ? undefined : requiredText(activity.placeId);

  return {
    title: requiredText(activity.title),
    ...(flexibility !== undefined ? { flexibility } : {}),
    ...(startTime !== undefined ? { startTime } : {}),
    ...(activity.durationMinutes !== undefined
      ? { durationMinutes: activity.durationMinutes }
      : {}),
    ...(placeId !== undefined ? { placeId } : {}),
  } as const;
}

function targetOrder(activity: ProposedActivity): number | undefined {
  return activity.proposedOrder === undefined ? undefined : activity.proposedOrder + 1;
}

export function mapProposedActivitiesToApplyItems(
  proposedActivities: readonly ProposedActivity[],
): readonly ApplyProposalItem[] {
  return Object.freeze(
    proposedActivities.map((activity): ApplyProposalItem => {
      const proposedActivityId = requiredText(activity.proposedActivityId);
      const order = targetOrder(activity);

      switch (activity.operationType) {
        case "add":
          return Object.freeze({
            proposedActivityId,
            operationType: "add",
            targetTripDayId: requiredText(activity.targetTripDayId),
            ...activityDraft(activity),
            ...(order !== undefined ? { targetOrder: order } : {}),
          });
        case "move":
          return Object.freeze({
            proposedActivityId,
            operationType: "move",
            sourceActivityId: requiredText(activity.sourceActivityId),
            targetTripDayId: requiredText(activity.targetTripDayId),
            ...(order !== undefined ? { targetOrder: order } : {}),
          });
        case "update":
          return Object.freeze({
            proposedActivityId,
            operationType: "update",
            sourceActivityId: requiredText(activity.sourceActivityId),
            ...activityDraft(activity),
          });
        case "remove":
          return Object.freeze({
            proposedActivityId,
            operationType: "remove",
            sourceActivityId: requiredText(activity.sourceActivityId),
          });
      }
    }),
  );
}

function officialErrorState(
  error: AcceptItineraryProposalError,
): AcceptItineraryProposalActionState {
  const code = error.code as AcceptItineraryProposalActionErrorCode;
  return acceptItineraryProposalActionError(code);
}

function proposalStatusError(
  proposal: ItineraryProposal,
  now: Date,
): AcceptItineraryProposalActionState | null {
  if (proposal.status === "accepted") return null;
  if (proposal.status === "expired") {
    return acceptItineraryProposalActionError("proposal-expired");
  }
  if (proposal.status !== "ready") {
    return acceptItineraryProposalActionError("proposal-not-ready");
  }
  if (
    !(proposal.validUntil instanceof Date) ||
    Number.isNaN(proposal.validUntil.getTime()) ||
    now.getTime() >= proposal.validUntil.getTime()
  ) {
    return acceptItineraryProposalActionError("proposal-expired");
  }
  return null;
}

export async function executeAcceptItineraryProposalAction(
  input: AcceptItineraryProposalActionInput,
  dependencies: AcceptItineraryProposalActionDependencies,
): Promise<AcceptItineraryProposalActionState> {
  const request = normalizedRequest(input);
  if (!request) return acceptItineraryProposalActionError("invalid-request");

  const access = await dependencies.resolveAccess({
    tripId: request.tripId,
    action: "trip:accept-proposal",
  });
  if (access.status === "unauthenticated") {
    return acceptItineraryProposalActionError("unauthenticated");
  }
  if (access.status === "not-found") {
    return acceptItineraryProposalActionError("not-found");
  }

  const trip = await dependencies.tripRepository.findById(request.tripId);
  if (!trip) return acceptItineraryProposalActionError("not-found");
  const actor = trip.participants.find(
    (participant) => participant.userId === access.context.userId,
  );
  if (!actor) return acceptItineraryProposalActionError("not-found");

  const proposal = await dependencies.proposalRepository.findById(
    request.tripId,
    createItineraryProposalId(request.itineraryProposalId),
  );
  if (!proposal) return acceptItineraryProposalActionError("proposal-not-found");

  const now = dependencies.now?.() ?? new Date();
  const statusError = proposalStatusError(proposal, now);
  if (statusError) return statusError;
  if (proposal.baseItineraryVersion !== request.expectedItineraryVersion) {
    return acceptItineraryProposalActionError("itinerary-version-mismatch");
  }
  if (!Array.isArray(proposal.proposedActivities)) {
    return acceptItineraryProposalActionError("proposal-items-mismatch");
  }

  const itinerary = await dependencies.itineraryRepository.findByTripId(request.tripId);
  if (!itinerary || itinerary.id !== proposal.itineraryId) {
    return acceptItineraryProposalActionError("itinerary-not-found");
  }
  if (
    proposal.status === "ready" &&
    itinerary.version !== request.expectedItineraryVersion
  ) {
    return acceptItineraryProposalActionError("itinerary-version-mismatch");
  }

  try {
    const result = await dependencies.acceptItineraryProposal.execute({
      tripId: request.tripId,
      itineraryId: proposal.itineraryId,
      itineraryProposalId: proposal.id,
      expectedItineraryVersion: request.expectedItineraryVersion,
      idempotencyKey: request.idempotencyKey,
      actorType: "participant",
      actorId: actor.userId,
      decidedAt: now,
      items: mapProposedActivitiesToApplyItems(proposal.proposedActivities),
    });

    return Object.freeze({
      status: "success",
      kind: result.kind,
      tripId: result.tripId,
      itineraryId: result.itineraryId,
      itineraryProposalId: result.itineraryProposalId,
      proposalApplicationId: String(result.proposalApplicationId),
      decisionId: result.decisionId,
      requestFingerprint: result.requestFingerprint,
      resultingItineraryVersion: result.resultingItineraryVersion,
      appliedProposedActivityIds: Object.freeze([...result.appliedProposedActivityIds]),
    });
  } catch (error) {
    if (error instanceof AcceptItineraryProposalError) {
      return officialErrorState(error);
    }
    if (
      error instanceof AcceptItineraryProposalValidationError ||
      error instanceof ProposalItemsMappingError
    ) {
      return acceptItineraryProposalActionError("proposal-items-mismatch");
    }
    throw error;
  }
}
