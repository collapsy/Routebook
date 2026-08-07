import type { ItineraryProposal } from "@routebook/proposal-management";
import type { ItineraryRepository, TripRepository } from "@routebook/trip-management";

import type { TripRouteAccessResult } from "./trip-route-access";

export const generateItineraryProposalActionErrorCodes = [
  "unauthenticated",
  "not-found",
  "invalid-request",
  "itinerary-not-found",
  "generation-failed",
  "technical-error",
] as const;

export type GenerateItineraryProposalActionErrorCode =
  (typeof generateItineraryProposalActionErrorCodes)[number];

export type GenerateItineraryProposalActionState =
  | Readonly<{ status: "idle" }>
  | Readonly<{
      status: "error";
      code: GenerateItineraryProposalActionErrorCode;
      message: string;
      failureCode?: string;
    }>
  | Readonly<{
      status: "success";
      tripId: string;
      itineraryId: string;
      itineraryProposalId: string;
      baseTripContextVersion: number;
      baseItineraryVersion: number;
    }>;

export const initialGenerateItineraryProposalActionState: GenerateItineraryProposalActionState =
  Object.freeze({ status: "idle" });

export type GenerateItineraryProposalActionInput = Readonly<{
  tripId: string;
}>;

type TripAccessResolver = (input: {
  tripId: string;
  action: "trip:edit";
}) => Promise<TripRouteAccessResult>;

type GenerationService = Readonly<{
  generate(command: {
    request: {
      id: string;
      tripId: string;
      itineraryId: string;
      baseTripContextVersion: number;
      baseItineraryVersion: number;
      contextSnapshotId: string;
      requestedAt: Date;
    };
    startedAt: Date;
    failedAt: Date;
    asOf: Date;
    generatedAt: Date;
    createProposedActivityId: (_candidate: unknown, index: number) => string;
  }): Promise<ItineraryProposal>;
}>;

export type GenerateItineraryProposalActionDependencies = Readonly<{
  resolveAccess: TripAccessResolver;
  tripRepository: Pick<TripRepository, "findById">;
  itineraryRepository: Pick<ItineraryRepository, "findByTripId">;
  generationService: GenerationService;
  now?: () => Date;
  createItineraryProposalId?: () => string;
  createProposedActivityId?: (_candidate: unknown, index: number) => string;
}>;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const messages: Readonly<Record<GenerateItineraryProposalActionErrorCode, string>> = {
  unauthenticated: "Entre no RouteBook para gerar uma proposta de roteiro.",
  "not-found": "A viagem não está disponível para este usuário.",
  "invalid-request": "Os dados enviados para gerar a proposta são inválidos.",
  "itinerary-not-found": "O roteiro da viagem ainda não está disponível para gerar uma proposta.",
  "generation-failed": "Não foi possível concluir a geração da proposta de roteiro.",
  "technical-error": "Não foi possível gerar a proposta agora. Tente novamente.",
};

export function generateItineraryProposalActionError(
  code: GenerateItineraryProposalActionErrorCode,
  failureCode?: string,
): GenerateItineraryProposalActionState {
  return Object.freeze({
    status: "error",
    code,
    message: messages[code],
    ...(failureCode ? { failureCode } : {}),
  });
}

function cloneInstant(value: Date): Date {
  return new Date(value.getTime());
}

export async function executeGenerateItineraryProposalAction(
  input: GenerateItineraryProposalActionInput,
  dependencies: GenerateItineraryProposalActionDependencies,
): Promise<GenerateItineraryProposalActionState> {
  const tripId = input.tripId.trim();
  if (!uuidPattern.test(tripId)) {
    return generateItineraryProposalActionError("invalid-request");
  }

  const access = await dependencies.resolveAccess({ tripId, action: "trip:edit" });
  if (access.status === "unauthenticated") {
    return generateItineraryProposalActionError("unauthenticated");
  }
  if (access.status === "not-found") {
    return generateItineraryProposalActionError("not-found");
  }

  const trip = await dependencies.tripRepository.findById(tripId);
  if (!trip) return generateItineraryProposalActionError("not-found");

  const itinerary = await dependencies.itineraryRepository.findByTripId(tripId);
  if (!itinerary || itinerary.tripId !== tripId) {
    return generateItineraryProposalActionError("itinerary-not-found");
  }

  const now = dependencies.now?.() ?? new Date();
  if (Number.isNaN(now.getTime())) {
    throw new Error("GenerateItineraryProposalAction received an invalid clock value.");
  }

  const proposalId = dependencies.createItineraryProposalId?.() ?? crypto.randomUUID();
  if (!uuidPattern.test(proposalId)) {
    throw new Error("GenerateItineraryProposalAction generated an invalid proposal id.");
  }

  const createProposedActivityId =
    dependencies.createProposedActivityId ?? (() => crypto.randomUUID());

  const proposal = await dependencies.generationService.generate({
    request: {
      id: proposalId,
      tripId,
      itineraryId: itinerary.id,
      baseTripContextVersion: trip.contextVersion,
      baseItineraryVersion: itinerary.version,
      contextSnapshotId: `authoritative:${tripId}:${trip.contextVersion}:${itinerary.version}`,
      requestedAt: cloneInstant(now),
    },
    startedAt: cloneInstant(now),
    failedAt: cloneInstant(now),
    asOf: cloneInstant(now),
    generatedAt: cloneInstant(now),
    createProposedActivityId,
  });

  if (proposal.status === "failed") {
    return generateItineraryProposalActionError("generation-failed", proposal.failureCode);
  }
  if (proposal.status !== "ready") {
    throw new Error(`Unexpected generated Itinerary Proposal status: ${proposal.status}.`);
  }

  return Object.freeze({
    status: "success",
    tripId: proposal.tripId,
    itineraryId: proposal.itineraryId,
    itineraryProposalId: String(proposal.id),
    baseTripContextVersion: proposal.baseTripContextVersion,
    baseItineraryVersion: proposal.baseItineraryVersion,
  });
}
