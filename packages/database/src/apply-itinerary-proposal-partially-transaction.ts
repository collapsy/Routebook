import {
  AcceptItineraryProposalError,
  PartialItineraryProposalAcceptanceError,
  type AcceptItineraryProposalPartiallyCommand,
  type AcceptItineraryProposalPartiallyResult,
  type ApplyPartialItineraryProposalTransaction,
} from "@routebook/proposal-management";

import { getDatabase } from "./client";
import {
  createDecisionTransactionFragment,
  type DecisionTransactionFragment,
} from "./decision-transaction-fragment";
import {
  createItineraryProposalTransactionFragment,
  type PartialItineraryProposalTransactionFragment,
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

export type ApplyPartialItineraryProposalTransactionFragments = Readonly<{
  proposalApplication: ProposalApplicationTransactionFragment;
  itineraryProposal: PartialItineraryProposalTransactionFragment;
  itinerary: ItineraryTransactionFragment;
  decision: DecisionTransactionFragment;
}>;

export type ApplyPartialItineraryProposalTransactionUnit = Readonly<{
  execute<TResult>(
    operation: (fragments: ApplyPartialItineraryProposalTransactionFragments) => Promise<TResult>,
  ): Promise<TResult>;
}>;

function partialAcceptanceError(
  code: ConstructorParameters<typeof PartialItineraryProposalAcceptanceError>[0],
  message: string,
): never {
  throw new PartialItineraryProposalAcceptanceError(code, message);
}

function requiredActorParticipantId(command: AcceptItineraryProposalPartiallyCommand): string {
  const actorId = typeof command.actorId === "string" ? command.actorId.trim() : "";
  if (command.actorType !== "participant" || !actorId) {
    throw new TypeError(
      "O aceite parcial de Itinerary Proposal exige actorType participant e actorId válido.",
    );
  }
  return actorId;
}

function reserveInput(command: AcceptItineraryProposalPartiallyCommand) {
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

async function replayPartialAcceptance(
  command: AcceptItineraryProposalPartiallyCommand,
  replay: ReplayedProposalApplication,
  fragments: ApplyPartialItineraryProposalTransactionFragments,
  actorParticipantId: string,
): Promise<AcceptItineraryProposalPartiallyResult> {
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
    remainingProposedActivityIds: command.remainingProposedActivityIds,
  });
}

async function applyReservedPartialAcceptance(
  command: AcceptItineraryProposalPartiallyCommand,
  reservation: ReservedProposalApplication,
  fragments: ApplyPartialItineraryProposalTransactionFragments,
  actorParticipantId: string,
): Promise<AcceptItineraryProposalPartiallyResult> {
  const proposal = await fragments.itineraryProposal.loadForPartialAcceptance(command);
  const applied = await fragments.itinerary.apply(command);
  const decision = await fragments.decision.persist({
    command,
    proposalApplicationId: reservation.record.application.id,
    actorParticipantId,
    resultingItineraryVersion: applied.result.resultingItineraryVersion,
    appliedProposedActivityIds: applied.result.appliedProposedActivityIds,
  });

  const partiallyAccepted = await fragments.itineraryProposal.acceptPartially(proposal, command);
  const succeeded = await fragments.proposalApplication.succeed(reservation.record, {
    resultingItineraryVersion: applied.result.resultingItineraryVersion,
    completedAt: command.decidedAt,
  });
  const remainingProposedActivityIds = Object.freeze(
    partiallyAccepted.proposedActivities.map((activity) => activity.proposedActivityId),
  );

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
    remainingProposedActivityIds,
  });
}

export function createApplyPartialItineraryProposalTransaction(
  unit: ApplyPartialItineraryProposalTransactionUnit,
): ApplyPartialItineraryProposalTransaction {
  if (!unit || typeof unit.execute !== "function") {
    throw new TypeError("Informe uma unidade transacional de Itinerary Proposal parcial válida.");
  }

  return Object.freeze({
    async execute(
      command: AcceptItineraryProposalPartiallyCommand,
    ): Promise<AcceptItineraryProposalPartiallyResult> {
      if (!command || typeof command !== "object") {
        throw new TypeError("Informe um comando AcceptItineraryProposalPartially válido.");
      }
      const actorParticipantId = requiredActorParticipantId(command);

      try {
        return await unit.execute(async (fragments) => {
          const reservation = await fragments.proposalApplication.reserve(reserveInput(command));

          switch (reservation.kind) {
            case "fingerprint-conflict":
              return partialAcceptanceError(
                "fingerprint-conflict",
                "A idempotency key já foi usada com outro conteúdo de aceite parcial.",
              );
            case "application-in-progress":
              return partialAcceptanceError(
                "application-in-progress",
                "Já existe uma aplicação desta Itinerary Proposal em andamento.",
              );
            case "application-failed":
              return partialAcceptanceError(
                "application-failed",
                "A aplicação anterior desta Itinerary Proposal terminou com falha.",
              );
            case "replay":
              return replayPartialAcceptance(command, reservation, fragments, actorParticipantId);
            case "reserved":
              return applyReservedPartialAcceptance(
                command,
                reservation,
                fragments,
                actorParticipantId,
              );
          }
        });
      } catch (error) {
        if (error instanceof AcceptItineraryProposalError) {
          throw new PartialItineraryProposalAcceptanceError(error.code, error.message);
        }
        throw error;
      }
    },
  });
}

export function createPostgresApplyPartialItineraryProposalTransaction(): ApplyPartialItineraryProposalTransaction {
  const database = getDatabase();
  const runner = new PostgresTransactionRunner(database);
  const unit = new ItineraryProposalTransactionUnit(runner, {
    proposalApplication: createProposalApplicationTransactionFragment,
    itineraryProposal: createItineraryProposalTransactionFragment,
    itinerary: createItineraryTransactionFragment,
    decision: createDecisionTransactionFragment,
  });

  return createApplyPartialItineraryProposalTransaction(unit);
}
