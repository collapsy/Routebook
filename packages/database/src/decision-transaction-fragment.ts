import {
  createDecision,
  type Decision,
  type RecommendationId,
} from "@routebook/decision-intelligence";
import type { AcceptItineraryProposalCommand } from "@routebook/proposal-management";

import {
  createPostgresDecisionRepository,
  type DecisionDatabaseExecutor,
} from "./decision-repository";

export type PersistItineraryProposalDecisionInput = Readonly<{
  command: AcceptItineraryProposalCommand;
  proposalApplicationId: string;
  actorParticipantId: string;
  resultingItineraryVersion: number;
  appliedProposedActivityIds: readonly string[];
  decisionId?: string;
  recommendationId?: RecommendationId;
}>;

export type DecisionTransactionRepository = Readonly<{
  save(decision: Decision): Promise<Decision>;
}>;

export type DecisionTransactionRepositoryFactory<
  TExecutor extends DecisionDatabaseExecutor = DecisionDatabaseExecutor,
> = (executor: TExecutor) => DecisionTransactionRepository;

export interface DecisionTransactionFragment {
  persist(input: PersistItineraryProposalDecisionInput): Promise<Decision>;
}

function requiredText(value: string, field: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    throw new TypeError(`Informe ${field}.`);
  }
  return normalized;
}

function assertInput(input: PersistItineraryProposalDecisionInput): void {
  if (!input || typeof input !== "object") {
    throw new TypeError("Informe os dados da Decision de aceite.");
  }
  if (!input.command || typeof input.command !== "object") {
    throw new TypeError("Informe um comando AcceptItineraryProposal válido.");
  }
  requiredText(input.proposalApplicationId, "proposalApplicationId");
  requiredText(input.actorParticipantId, "actorParticipantId");
  if (
    !Number.isInteger(input.resultingItineraryVersion) ||
    input.resultingItineraryVersion < 1
  ) {
    throw new TypeError("Informe resultingItineraryVersion como inteiro positivo.");
  }
  if (!Array.isArray(input.appliedProposedActivityIds)) {
    throw new TypeError("Informe appliedProposedActivityIds.");
  }
}

export function createDecisionTransactionFragment<
  TExecutor extends DecisionDatabaseExecutor,
>(
  executor: TExecutor,
  repositoryFactory: DecisionTransactionRepositoryFactory<TExecutor> =
    createPostgresDecisionRepository,
): DecisionTransactionFragment {
  if (
    !executor ||
    typeof executor.select !== "function" ||
    typeof executor.insert !== "function"
  ) {
    throw new TypeError("Informe um executor Drizzle transacional válido.");
  }
  if (typeof repositoryFactory !== "function") {
    throw new TypeError("Informe uma factory de repository de Decision válida.");
  }

  const repository = repositoryFactory(executor);
  if (!repository || typeof repository.save !== "function") {
    throw new TypeError("A factory não retornou um repository de Decision válido.");
  }

  return Object.freeze({
    async persist(input: PersistItineraryProposalDecisionInput): Promise<Decision> {
      assertInput(input);
      const { command } = input;

      const decision = createDecision({
        ...(input.decisionId !== undefined ? { id: input.decisionId } : {}),
        tripId: command.tripId,
        ...(input.recommendationId !== undefined
          ? { recommendationId: input.recommendationId }
          : {}),
        actorParticipantId: requiredText(
          input.actorParticipantId,
          "actorParticipantId",
        ),
        decidedAt: command.decidedAt,
        chosenOption: {
          type: "accept-itinerary-proposal",
          itineraryProposalId: command.itineraryProposalId,
          proposedActivityIds: command.proposedActivityIds,
        },
        contextSnapshot: {
          schemaVersion: 1,
          tripId: command.tripId,
          itineraryId: command.itineraryId,
          itineraryProposalId: command.itineraryProposalId,
          baseItineraryVersion: command.expectedItineraryVersion,
          requestFingerprint: command.requestFingerprint,
          capturedAt: command.decidedAt,
        },
        effect: {
          type: "itinerary-proposal-applied",
          proposalApplicationId: requiredText(
            input.proposalApplicationId,
            "proposalApplicationId",
          ),
          itineraryId: command.itineraryId,
          resultingItineraryVersion: input.resultingItineraryVersion,
          appliedProposedActivityIds: input.appliedProposedActivityIds,
        },
        idempotencyKey: command.idempotencyKey,
      });

      return repository.save(decision);
    },
  });
}
