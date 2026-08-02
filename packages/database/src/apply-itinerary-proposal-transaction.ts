import {
  AcceptItineraryProposalError,
  type AcceptItineraryProposalCommand,
  type AcceptItineraryProposalResult,
  type ApplyItineraryProposalTransaction,
} from "@routebook/proposal-management";

import { getDatabase } from "./client";
import {
  createDecisionTransactionFragment,
  type DecisionTransactionFragment,
} from "./decision-transaction-fragment";
import {
  createItineraryProposalTransactionFragment,
  type ItineraryProposalTransactionFragment,
} from "./itinerary-proposal-transaction-fragment";
import {
  createItineraryTransactionFragment,
  type ItineraryTransactionFragment,
} from "./itinerary-transaction-fragment";
import { ItineraryProposalTransactionUnit } from "./itinerary-proposal-transaction-unit";
import { PostgresTransactionRunner } from "./postgres-transaction-runner";
import {
  createProposalApplicationTransactionFragment,
  type ProposalApplicationTransactionFragment,
  type ReplayedProposalApplication,
  type ReservedProposalApplication,
} from "./proposal-application-transaction-fragment";

export type ApplyItineraryProposalTransactionFragments = Readonly<{
  proposalApplication: ProposalApplicationTransactionFragment;
  itineraryProposal: ItineraryProposalTransactionFragment;
  itinerary: ItineraryTransactionFragment;
  decision: DecisionTransactionFragment;
}>;

export type ApplyItineraryProposalTransactionUnit = Readonly<{
  execute<TResult>(
    operation: (fragments: ApplyItineraryProposalTransactionFragments) => Promise<TResult>,
  ): Promise<TResult>;
}>;

function acceptanceError(
  code: ConstructorParameters<typeof AcceptItineraryProposalError>[0],
  message: string,
): never {
  throw new AcceptItineraryProposalError(code, message);
}

function requiredActorParticipantId(command: AcceptItineraryProposalCommand): string {
  const actorId = typeof command.actorId === "string" ? command.actorId.trim() : "";
  if (command.actorType !== "participant" || !actorId) {
    throw new TypeError(
      "O aceite de Itinerary Proposal exige actorType participant e actorId válido.",
    );
  }
  return actorId;
}

function reserveInput(command: AcceptItineraryProposalCommand) {
  return {
    tripId: command.tripId,
    itineraryProposalId: command.itineraryProposalId,
    itineraryId: command.itineraryId,
    applicationType: command.applicationType,
    expectedItineraryVersion: command.expectedItineraryVersion,
    actorType: command.actorType,
    ...(command.actorId !== undefined ? { actorId: command.actorId } : {}),
    proposedActivityIds: command.proposedActivityIds,
    idempotencyKey: command.idempotencyKey,
    startedAt: command.decidedAt,
  } as const;
}

async function replayAcceptance(
  command: AcceptItineraryProposalCommand,
  replay: ReplayedProposalApplication,
  fragments: ApplyItineraryProposalTransactionFragments,
  actorParticipantId: string,
): Promise<AcceptItineraryProposalResult> {
  const application = replay.record.application;
  const decision = await fragments.decision.persist({
    command,
    proposalApplicationId: application.id,
    actorParticipantId,
    resultingItineraryVersion: application.resultingItineraryVersion,
    appliedProposedActivityIds: replay.record.request.proposedActivityIds,
  });

  return Object.freeze({
    kind: "replay",
    tripId: command.tripId,
    itineraryId: command.itineraryId,
    itineraryProposalId: command.itineraryProposalId,
    proposalApplicationId: application.id,
    decisionId: decision.id,
    requestFingerprint: application.requestFingerprint,
    resultingItineraryVersion: application.resultingItineraryVersion,
    appliedProposedActivityIds: replay.record.request.proposedActivityIds,
  });
}

async function applyReservedAcceptance(
  command: AcceptItineraryProposalCommand,
  reservation: ReservedProposalApplication,
  fragments: ApplyItineraryProposalTransactionFragments,
  actorParticipantId: string,
): Promise<AcceptItineraryProposalResult> {
  const proposal = await fragments.itineraryProposal.loadForAcceptance(command);
  const applied = await fragments.itinerary.apply(command);
  const decision = await fragments.decision.persist({
    command,
    proposalApplicationId: reservation.record.application.id,
    actorParticipantId,
    resultingItineraryVersion: applied.result.resultingItineraryVersion,
    appliedProposedActivityIds: applied.result.appliedProposedActivityIds,
  });

  await fragments.itineraryProposal.accept(proposal, command.decidedAt);
  const succeeded = await fragments.proposalApplication.succeed(reservation.record, {
    resultingItineraryVersion: applied.result.resultingItineraryVersion,
    completedAt: command.decidedAt,
  });

  return Object.freeze({
    kind: "applied",
    tripId: command.tripId,
    itineraryId: command.itineraryId,
    itineraryProposalId: command.itineraryProposalId,
    proposalApplicationId: succeeded.application.id,
    decisionId: decision.id,
    requestFingerprint: succeeded.application.requestFingerprint,
    resultingItineraryVersion: applied.result.resultingItineraryVersion,
    appliedProposedActivityIds: applied.result.appliedProposedActivityIds,
  });
}

export function createApplyItineraryProposalTransaction(
  unit: ApplyItineraryProposalTransactionUnit,
): ApplyItineraryProposalTransaction {
  if (!unit || typeof unit.execute !== "function") {
    throw new TypeError("Informe uma unidade transacional de Itinerary Proposal válida.");
  }

  return Object.freeze({
    async execute(command: AcceptItineraryProposalCommand): Promise<AcceptItineraryProposalResult> {
      if (!command || typeof command !== "object") {
        throw new TypeError("Informe um comando AcceptItineraryProposal válido.");
      }
      const actorParticipantId = requiredActorParticipantId(command);

      return unit.execute(async (fragments) => {
        const reservation = await fragments.proposalApplication.reserve(reserveInput(command));

        switch (reservation.kind) {
          case "fingerprint-conflict":
            return acceptanceError(
              "fingerprint-conflict",
              "A idempotency key já foi usada com outro conteúdo de aceite.",
            );
          case "application-in-progress":
            return acceptanceError(
              "application-in-progress",
              "Já existe uma aplicação desta Itinerary Proposal em andamento.",
            );
          case "application-failed":
            return acceptanceError(
              "application-failed",
              "A aplicação anterior desta Itinerary Proposal terminou com falha.",
            );
          case "replay":
            return replayAcceptance(command, reservation, fragments, actorParticipantId);
          case "reserved":
            return applyReservedAcceptance(command, reservation, fragments, actorParticipantId);
        }
      });
    },
  });
}

export function createPostgresApplyItineraryProposalTransaction(): ApplyItineraryProposalTransaction {
  const database = getDatabase();
  const runner = new PostgresTransactionRunner(database);
  const unit = new ItineraryProposalTransactionUnit(runner, {
    proposalApplication: createProposalApplicationTransactionFragment,
    itineraryProposal: createItineraryProposalTransactionFragment,
    itinerary: createItineraryTransactionFragment,
    decision: createDecisionTransactionFragment,
  });

  return createApplyItineraryProposalTransaction(unit);
}
