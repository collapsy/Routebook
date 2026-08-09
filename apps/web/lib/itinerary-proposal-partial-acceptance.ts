import type { Decision } from "@routebook/decision-intelligence";
import {
  ItineraryProposalValidationError,
  PartialItineraryProposalAcceptanceError,
  createItineraryProposalId,
  selectItineraryProposalForPartialAcceptance,
  type AcceptItineraryProposalPartially,
  type ItineraryProposal,
  type ItineraryProposalRepository,
  type ProposalApplication,
  type ProposalApplicationRequestFingerprintInput,
} from "@routebook/proposal-management";
import type { ItineraryRepository, TripRepository } from "@routebook/trip-management";

import { mapProposedActivitiesToApplyItems } from "./itinerary-proposal-acceptance";
import type { TripRouteAccessResult } from "./trip-route-access";

export const acceptItineraryProposalPartiallyActionErrorCodes = [
  "unauthenticated",
  "not-found",
  "invalid-request",
  "selection-empty",
  "duplicate-selection",
  "unknown-proposed-activity",
  "full-selection",
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

export type AcceptItineraryProposalPartiallyActionErrorCode =
  (typeof acceptItineraryProposalPartiallyActionErrorCodes)[number];

export type AcceptItineraryProposalPartiallyActionState =
  | Readonly<{ status: "idle" }>
  | Readonly<{
      status: "error";
      code: AcceptItineraryProposalPartiallyActionErrorCode;
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
      remainingProposedActivityIds: readonly string[];
    }>;

export const initialAcceptItineraryProposalPartiallyActionState: AcceptItineraryProposalPartiallyActionState =
  Object.freeze({ status: "idle" });

export type AcceptItineraryProposalPartiallyActionInput = Readonly<{
  tripId: string;
  itineraryProposalId: string;
  expectedItineraryVersion: string;
  idempotencyKey: string;
  selectedProposedActivityIds: readonly string[];
}>;

type TripAccessResolver = (input: {
  tripId: string;
  action: "trip:accept-proposal";
}) => Promise<TripRouteAccessResult>;

export type PartialProposalApplicationReplayRecord = Readonly<{
  tripId: string;
  itineraryId: string;
  request: ProposalApplicationRequestFingerprintInput;
  application: ProposalApplication;
}>;

export type AcceptItineraryProposalPartiallyActionDependencies = Readonly<{
  resolveAccess: TripAccessResolver;
  tripRepository: Pick<TripRepository, "findById">;
  itineraryRepository: Pick<ItineraryRepository, "findByTripId">;
  proposalRepository: Pick<ItineraryProposalRepository, "findById">;
  proposalApplicationReader: Readonly<{
    findByIdempotencyKey(
      itineraryProposalId: string,
      idempotencyKey: string,
    ): Promise<PartialProposalApplicationReplayRecord | null>;
  }>;
  decisionReader: Readonly<{
    findByIdempotencyKey(tripId: string, idempotencyKey: string): Promise<Decision | null>;
  }>;
  acceptItineraryProposalPartially: AcceptItineraryProposalPartially;
  now?: () => Date;
}>;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ActionMessages = Readonly<Record<AcceptItineraryProposalPartiallyActionErrorCode, string>>;

const messages: ActionMessages = {
  unauthenticated: "Entre no RouteBook para aceitar parte desta proposta.",
  "not-found": "A viagem ou a proposta não está disponível para este usuário.",
  "invalid-request": "Os dados enviados para o aceite parcial são inválidos.",
  "selection-empty": "Selecione ao menos uma sugestão da proposta.",
  "duplicate-selection": "A mesma sugestão foi selecionada mais de uma vez.",
  "unknown-proposed-activity": "A seleção contém uma sugestão que não pertence à proposta.",
  "full-selection": "Para aceitar todas as sugestões, use o aceite integral da proposta.",
  "fingerprint-conflict": "Esta tentativa de aceite parcial diverge de uma solicitação anterior.",
  "proposal-not-found": "A proposta de roteiro não foi encontrada.",
  "proposal-not-ready": "A proposta não está disponível para um novo aceite parcial.",
  "proposal-expired": "A validade desta proposta terminou.",
  "proposal-items-mismatch": "A seleção não corresponde ao conteúdo persistido da proposta.",
  "itinerary-not-found": "O roteiro associado à proposta não foi encontrado.",
  "itinerary-version-mismatch": "O roteiro mudou desde a geração desta proposta.",
  "application-in-progress": "O aceite parcial desta proposta já está em processamento.",
  "application-failed": "Uma tentativa anterior de aceite parcial terminou com falha.",
  "technical-error": "Não foi possível aceitar parte da proposta agora. Tente novamente.",
};

export function acceptItineraryProposalPartiallyActionError(
  code: AcceptItineraryProposalPartiallyActionErrorCode,
): AcceptItineraryProposalPartiallyActionState {
  return Object.freeze({ status: "error", code, message: messages[code] });
}

type NormalizedRequest = Readonly<{
  tripId: string;
  itineraryProposalId: string;
  expectedItineraryVersion: number;
  idempotencyKey: string;
  selectedProposedActivityIds: readonly string[];
}>;

function normalizedRequest(
  input: AcceptItineraryProposalPartiallyActionInput,
): NormalizedRequest | AcceptItineraryProposalPartiallyActionState {
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
    idempotencyKey.length > 200 ||
    !Array.isArray(input.selectedProposedActivityIds)
  ) {
    return acceptItineraryProposalPartiallyActionError("invalid-request");
  }

  if (input.selectedProposedActivityIds.length === 0) {
    return acceptItineraryProposalPartiallyActionError("selection-empty");
  }

  const selectedProposedActivityIds = input.selectedProposedActivityIds.map((value) => value.trim());
  if (selectedProposedActivityIds.some((value) => !uuidPattern.test(value))) {
    return acceptItineraryProposalPartiallyActionError("invalid-request");
  }
  if (new Set(selectedProposedActivityIds).size !== selectedProposedActivityIds.length) {
    return acceptItineraryProposalPartiallyActionError("duplicate-selection");
  }

  return Object.freeze({
    tripId,
    itineraryProposalId,
    expectedItineraryVersion,
    idempotencyKey,
    selectedProposedActivityIds: Object.freeze(selectedProposedActivityIds),
  });
}

function isActionError(
  value: NormalizedRequest | AcceptItineraryProposalPartiallyActionState,
): value is AcceptItineraryProposalPartiallyActionState {
  return "status" in value;
}

function sameSelection(actual: readonly string[], expected: readonly string[]): boolean {
  if (actual.length !== expected.length) return false;
  const expectedSet = new Set(expected);
  return actual.every((value) => expectedSet.has(value));
}

function successState(input: {
  kind: "applied" | "replay";
  tripId: string;
  itineraryId: string;
  itineraryProposalId: string;
  proposalApplicationId: string;
  decisionId: string;
  requestFingerprint: string;
  resultingItineraryVersion: number;
  appliedProposedActivityIds: readonly string[];
  remainingProposedActivityIds: readonly string[];
}): AcceptItineraryProposalPartiallyActionState {
  return Object.freeze({
    status: "success",
    ...input,
    appliedProposedActivityIds: Object.freeze([...input.appliedProposedActivityIds]),
    remainingProposedActivityIds: Object.freeze([...input.remainingProposedActivityIds]),
  });
}

function partialErrorState(
  error: PartialItineraryProposalAcceptanceError,
): AcceptItineraryProposalPartiallyActionState {
  const code = error.code as AcceptItineraryProposalPartiallyActionErrorCode;
  return acceptItineraryProposalPartiallyActionError(code);
}

function proposalReadyError(
  proposal: ItineraryProposal,
  now: Date,
): AcceptItineraryProposalPartiallyActionState | null {
  if (proposal.status === "expired") {
    return acceptItineraryProposalPartiallyActionError("proposal-expired");
  }
  if (proposal.status !== "ready") {
    return acceptItineraryProposalPartiallyActionError("proposal-not-ready");
  }
  if (
    !(proposal.validUntil instanceof Date) ||
    Number.isNaN(proposal.validUntil.getTime()) ||
    now.getTime() >= proposal.validUntil.getTime()
  ) {
    return acceptItineraryProposalPartiallyActionError("proposal-expired");
  }
  return null;
}

async function replayPartiallyAcceptedProposal(
  request: NormalizedRequest,
  proposal: ItineraryProposal,
  actorId: string,
  dependencies: AcceptItineraryProposalPartiallyActionDependencies,
): Promise<AcceptItineraryProposalPartiallyActionState> {
  const record = await dependencies.proposalApplicationReader.findByIdempotencyKey(
    request.itineraryProposalId,
    request.idempotencyKey,
  );
  if (!record) return acceptItineraryProposalPartiallyActionError("proposal-not-ready");

  const persistedRequest = record.request;
  if (
    record.tripId !== request.tripId ||
    record.itineraryId !== proposal.itineraryId ||
    persistedRequest.itineraryProposalId !== request.itineraryProposalId ||
    persistedRequest.itineraryId !== proposal.itineraryId ||
    persistedRequest.applicationType !== "partial" ||
    persistedRequest.expectedItineraryVersion !== request.expectedItineraryVersion ||
    persistedRequest.actorType !== "participant" ||
    persistedRequest.actorId !== actorId ||
    !sameSelection(request.selectedProposedActivityIds, persistedRequest.proposedActivityIds)
  ) {
    return acceptItineraryProposalPartiallyActionError("fingerprint-conflict");
  }

  if (record.application.status === "started") {
    return acceptItineraryProposalPartiallyActionError("application-in-progress");
  }
  if (record.application.status === "failed") {
    return acceptItineraryProposalPartiallyActionError("application-failed");
  }

  const decision = await dependencies.decisionReader.findByIdempotencyKey(
    request.tripId,
    request.idempotencyKey,
  );
  if (
    !decision ||
    decision.actorParticipantId !== actorId ||
    decision.chosenOption.type !== "accept-itinerary-proposal" ||
    decision.chosenOption.itineraryProposalId !== request.itineraryProposalId ||
    !sameSelection(decision.chosenOption.proposedActivityIds, persistedRequest.proposedActivityIds) ||
    decision.effect.type !== "itinerary-proposal-applied" ||
    decision.effect.proposalApplicationId !== record.application.id ||
    decision.effect.resultingItineraryVersion !== record.application.resultingItineraryVersion ||
    !sameSelection(
      decision.effect.appliedProposedActivityIds,
      persistedRequest.proposedActivityIds,
    )
  ) {
    return acceptItineraryProposalPartiallyActionError("technical-error");
  }

  return successState({
    kind: "replay",
    tripId: request.tripId,
    itineraryId: proposal.itineraryId,
    itineraryProposalId: request.itineraryProposalId,
    proposalApplicationId: String(record.application.id),
    decisionId: String(decision.id),
    requestFingerprint: record.application.requestFingerprint,
    resultingItineraryVersion: record.application.resultingItineraryVersion,
    appliedProposedActivityIds: persistedRequest.proposedActivityIds,
    remainingProposedActivityIds:
      proposal.proposedActivities?.map((activity) => activity.proposedActivityId) ?? [],
  });
}

export async function executeAcceptItineraryProposalPartiallyAction(
  input: AcceptItineraryProposalPartiallyActionInput,
  dependencies: AcceptItineraryProposalPartiallyActionDependencies,
): Promise<AcceptItineraryProposalPartiallyActionState> {
  const normalized = normalizedRequest(input);
  if (isActionError(normalized)) return normalized;
  const request = normalized;

  const access = await dependencies.resolveAccess({
    tripId: request.tripId,
    action: "trip:accept-proposal",
  });
  if (access.status === "unauthenticated") {
    return acceptItineraryProposalPartiallyActionError("unauthenticated");
  }
  if (access.status === "not-found") {
    return acceptItineraryProposalPartiallyActionError("not-found");
  }

  const trip = await dependencies.tripRepository.findById(request.tripId);
  if (!trip) return acceptItineraryProposalPartiallyActionError("not-found");
  const actor = trip.participants.find((participant) => participant.userId === access.context.userId);
  if (!actor) return acceptItineraryProposalPartiallyActionError("not-found");

  const proposal = await dependencies.proposalRepository.findById(
    request.tripId,
    createItineraryProposalId(request.itineraryProposalId),
  );
  if (!proposal) return acceptItineraryProposalPartiallyActionError("proposal-not-found");

  if (proposal.status === "partially-accepted") {
    return replayPartiallyAcceptedProposal(request, proposal, actor.userId, dependencies);
  }

  const now = dependencies.now?.() ?? new Date();
  const statusError = proposalReadyError(proposal, now);
  if (statusError) return statusError;
  if (proposal.baseItineraryVersion !== request.expectedItineraryVersion) {
    return acceptItineraryProposalPartiallyActionError("itinerary-version-mismatch");
  }
  if (!Array.isArray(proposal.proposedActivities)) {
    return acceptItineraryProposalPartiallyActionError("proposal-items-mismatch");
  }

  const itinerary = await dependencies.itineraryRepository.findByTripId(request.tripId);
  if (!itinerary || itinerary.id !== proposal.itineraryId) {
    return acceptItineraryProposalPartiallyActionError("itinerary-not-found");
  }
  if (itinerary.version !== request.expectedItineraryVersion) {
    return acceptItineraryProposalPartiallyActionError("itinerary-version-mismatch");
  }

  let selectedActivities;
  try {
    selectedActivities = selectItineraryProposalForPartialAcceptance(
      proposal,
      request.selectedProposedActivityIds,
      now,
    ).selected;
  } catch (error) {
    if (error instanceof PartialItineraryProposalAcceptanceError) return partialErrorState(error);
    if (error instanceof ItineraryProposalValidationError) {
      return acceptItineraryProposalPartiallyActionError("proposal-items-mismatch");
    }
    throw error;
  }

  let items;
  try {
    items = mapProposedActivitiesToApplyItems(selectedActivities);
  } catch {
    return acceptItineraryProposalPartiallyActionError("proposal-items-mismatch");
  }

  try {
    const result = await dependencies.acceptItineraryProposalPartially.execute({
      proposal,
      expectedItineraryVersion: request.expectedItineraryVersion,
      idempotencyKey: request.idempotencyKey,
      actorType: "participant",
      actorId: actor.userId,
      decidedAt: now,
      items,
    });

    return successState({
      kind: result.kind,
      tripId: result.tripId,
      itineraryId: result.itineraryId,
      itineraryProposalId: result.itineraryProposalId,
      proposalApplicationId: String(result.proposalApplicationId),
      decisionId: result.decisionId,
      requestFingerprint: result.requestFingerprint,
      resultingItineraryVersion: result.resultingItineraryVersion,
      appliedProposedActivityIds: result.appliedProposedActivityIds,
      remainingProposedActivityIds: result.remainingProposedActivityIds,
    });
  } catch (error) {
    if (error instanceof PartialItineraryProposalAcceptanceError) return partialErrorState(error);
    if (error instanceof ItineraryProposalValidationError) {
      return acceptItineraryProposalPartiallyActionError("proposal-items-mismatch");
    }
    throw error;
  }
}
