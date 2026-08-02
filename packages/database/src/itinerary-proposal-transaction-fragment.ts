import {
  AcceptItineraryProposalError,
  finalizeAppliedItineraryProposalAcceptance,
  type AcceptItineraryProposalCommand,
  type ItineraryProposal,
  type ProposedActivity,
} from "@routebook/proposal-management";

import {
  createPostgresItineraryProposalRepository,
  type ItineraryProposalDatabaseExecutor,
} from "./proposal-repository";

export type ReadyItineraryProposal = ItineraryProposal &
  Readonly<{
    status: "ready";
    validUntil: Date;
    proposedActivities: readonly ProposedActivity[];
  }>;

export type AcceptedItineraryProposal = ItineraryProposal &
  Readonly<{
    status: "accepted";
    acceptedAt: Date;
  }>;

export type ItineraryProposalTransactionRepository = Readonly<{
  findById(
    tripId: string,
    proposalId: string,
  ): Promise<ItineraryProposal | null>;
  save(proposal: ItineraryProposal): Promise<void>;
}>;

export type ItineraryProposalTransactionRepositoryFactory<
  TExecutor extends ItineraryProposalDatabaseExecutor = ItineraryProposalDatabaseExecutor,
> = (executor: TExecutor) => ItineraryProposalTransactionRepository;

export interface ItineraryProposalTransactionFragment {
  loadForAcceptance(
    command: AcceptItineraryProposalCommand,
  ): Promise<ReadyItineraryProposal>;
  accept(
    proposal: ReadyItineraryProposal,
    acceptedAt: Date,
  ): Promise<AcceptedItineraryProposal>;
}

function acceptanceError(
  code: ConstructorParameters<typeof AcceptItineraryProposalError>[0],
  message: string,
): never {
  throw new AcceptItineraryProposalError(code, message);
}

function sameOrderedIds(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function assertCommand(command: AcceptItineraryProposalCommand): void {
  if (!command || typeof command !== "object") {
    throw new TypeError("Informe um comando AcceptItineraryProposal válido.");
  }
}

function asReadyProposal(
  proposal: ItineraryProposal,
  command: AcceptItineraryProposalCommand,
): ReadyItineraryProposal {
  if (
    proposal.id !== command.itineraryProposalId ||
    proposal.tripId !== command.tripId ||
    proposal.itineraryId !== command.itineraryId
  ) {
    acceptanceError(
      "proposal-not-found",
      "A Itinerary Proposal não pertence ao contexto solicitado.",
    );
  }
  if (proposal.status !== "ready") {
    acceptanceError(
      "proposal-not-ready",
      "A Itinerary Proposal precisa estar pronta para ser aceita.",
    );
  }
  if (
    !(proposal.validUntil instanceof Date) ||
    Number.isNaN(proposal.validUntil.getTime()) ||
    command.decidedAt.getTime() >= proposal.validUntil.getTime()
  ) {
    acceptanceError(
      "proposal-expired",
      "A Itinerary Proposal não está mais válida.",
    );
  }
  if (proposal.baseItineraryVersion !== command.expectedItineraryVersion) {
    acceptanceError(
      "itinerary-version-mismatch",
      "A versão-base da Itinerary Proposal diverge da versão esperada.",
    );
  }
  if (!Array.isArray(proposal.proposedActivities)) {
    acceptanceError(
      "proposal-items-mismatch",
      "A Itinerary Proposal não possui a coleção integral de atividades.",
    );
  }

  const proposedActivityIds = proposal.proposedActivities.map(
    (activity) => activity.proposedActivityId,
  );
  if (!sameOrderedIds(proposedActivityIds, command.proposedActivityIds)) {
    acceptanceError(
      "proposal-items-mismatch",
      "A coleção de Proposed Activities diverge do comando de aceite.",
    );
  }

  return proposal as ReadyItineraryProposal;
}

export function createItineraryProposalTransactionFragment<
  TExecutor extends ItineraryProposalDatabaseExecutor,
>(
  executor: TExecutor,
  repositoryFactory: ItineraryProposalTransactionRepositoryFactory<TExecutor> =
    createPostgresItineraryProposalRepository,
): ItineraryProposalTransactionFragment {
  if (
    !executor ||
    typeof executor.select !== "function" ||
    typeof executor.insert !== "function" ||
    typeof executor.update !== "function" ||
    typeof executor.delete !== "function"
  ) {
    throw new TypeError("Informe um executor Drizzle transacional válido.");
  }
  if (typeof repositoryFactory !== "function") {
    throw new TypeError(
      "Informe uma factory de repository de Itinerary Proposal válida.",
    );
  }

  const repository = repositoryFactory(executor);
  if (
    !repository ||
    typeof repository.findById !== "function" ||
    typeof repository.save !== "function"
  ) {
    throw new TypeError(
      "A factory não retornou um repository de Itinerary Proposal válido.",
    );
  }

  return Object.freeze({
    async loadForAcceptance(
      command: AcceptItineraryProposalCommand,
    ): Promise<ReadyItineraryProposal> {
      assertCommand(command);
      const proposal = await repository.findById(
        command.tripId,
        command.itineraryProposalId,
      );
      if (!proposal) {
        acceptanceError(
          "proposal-not-found",
          "A Itinerary Proposal não foi encontrada.",
        );
      }
      return asReadyProposal(proposal, command);
    },

    async accept(
      proposal: ReadyItineraryProposal,
      acceptedAt: Date,
    ): Promise<AcceptedItineraryProposal> {
      if (!proposal || typeof proposal !== "object") {
        throw new TypeError("Informe uma Itinerary Proposal ready válida.");
      }
      const accepted = finalizeAppliedItineraryProposalAcceptance(
        proposal,
        acceptedAt,
      );
      await repository.save(accepted);
      return accepted as AcceptedItineraryProposal;
    },
  });
}
