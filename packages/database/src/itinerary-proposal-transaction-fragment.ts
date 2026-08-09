import {
  AcceptItineraryProposalError,
  finalizeAppliedItineraryProposalAcceptance,
  partiallyAcceptItineraryProposal,
  PartialItineraryProposalAcceptanceError,
  type AcceptItineraryProposalCommand,
  type AcceptItineraryProposalPartiallyCommand,
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

export type PartiallyAcceptedItineraryProposal = ItineraryProposal &
  Readonly<{
    status: "partially-accepted";
    acceptedAt: Date;
    proposedActivities: readonly ProposedActivity[];
  }>;

export type ItineraryProposalTransactionRepository = Readonly<{
  findById(tripId: string, proposalId: string): Promise<ItineraryProposal | null>;
  save(proposal: ItineraryProposal): Promise<ItineraryProposal>;
}>;

export type ItineraryProposalTransactionRepositoryFactory<
  TExecutor extends ItineraryProposalDatabaseExecutor = ItineraryProposalDatabaseExecutor,
> = (executor: TExecutor) => ItineraryProposalTransactionRepository;

export interface ItineraryProposalTransactionFragment {
  loadForAcceptance(command: AcceptItineraryProposalCommand): Promise<ReadyItineraryProposal>;
  accept(proposal: ReadyItineraryProposal, acceptedAt: Date): Promise<AcceptedItineraryProposal>;
}

export interface PartialItineraryProposalTransactionFragment extends ItineraryProposalTransactionFragment {
  loadForPartialAcceptance(
    command: AcceptItineraryProposalPartiallyCommand,
  ): Promise<ReadyItineraryProposal>;
  acceptPartially(
    proposal: ReadyItineraryProposal,
    command: AcceptItineraryProposalPartiallyCommand,
  ): Promise<PartiallyAcceptedItineraryProposal>;
}

function acceptanceError(
  code: ConstructorParameters<typeof AcceptItineraryProposalError>[0],
  message: string,
): never {
  throw new AcceptItineraryProposalError(code, message);
}

function partialAcceptanceError(
  code: ConstructorParameters<typeof PartialItineraryProposalAcceptanceError>[0],
  message: string,
): never {
  throw new PartialItineraryProposalAcceptanceError(code, message);
}

function sameOrderedIds(actual: readonly string[], expected: readonly string[]): boolean {
  return (
    actual.length === expected.length && actual.every((value, index) => value === expected[index])
  );
}

function assertFullCommand(command: AcceptItineraryProposalCommand): void {
  if (!command || typeof command !== "object") {
    throw new TypeError("Informe um comando AcceptItineraryProposal válido.");
  }
}

function assertPartialCommand(command: AcceptItineraryProposalPartiallyCommand): void {
  if (!command || typeof command !== "object") {
    throw new TypeError("Informe um comando AcceptItineraryProposalPartially válido.");
  }
}

function assertReadyContext(
  proposal: ItineraryProposal,
  command: Readonly<{
    itineraryProposalId: string;
    tripId: string;
    itineraryId: string;
    expectedItineraryVersion: number;
    decidedAt: Date;
  }>,
  error: (
    code:
      | "proposal-not-found"
      | "proposal-not-ready"
      | "proposal-expired"
      | "itinerary-version-mismatch",
    message: string,
  ) => never,
): asserts proposal is ReadyItineraryProposal {
  if (
    proposal.id !== command.itineraryProposalId ||
    proposal.tripId !== command.tripId ||
    proposal.itineraryId !== command.itineraryId
  ) {
    error("proposal-not-found", "A Itinerary Proposal não pertence ao contexto solicitado.");
  }
  if (proposal.status !== "ready") {
    error("proposal-not-ready", "A Itinerary Proposal precisa estar pronta para ser aceita.");
  }
  if (
    !(proposal.validUntil instanceof Date) ||
    Number.isNaN(proposal.validUntil.getTime()) ||
    command.decidedAt.getTime() >= proposal.validUntil.getTime()
  ) {
    error("proposal-expired", "A Itinerary Proposal não está mais válida.");
  }
  if (proposal.baseItineraryVersion !== command.expectedItineraryVersion) {
    error(
      "itinerary-version-mismatch",
      "A versão-base da Itinerary Proposal diverge da versão esperada.",
    );
  }
  if (!Array.isArray(proposal.proposedActivities)) {
    throw new TypeError("A Itinerary Proposal pronta não possui Proposed Activities.");
  }
}

function asReadyProposal(
  proposal: ItineraryProposal,
  command: AcceptItineraryProposalCommand,
): ReadyItineraryProposal {
  assertReadyContext(proposal, command, acceptanceError);

  const proposedActivityIds = proposal.proposedActivities.map(
    (activity) => activity.proposedActivityId,
  );
  if (!sameOrderedIds(proposedActivityIds, command.proposedActivityIds)) {
    acceptanceError(
      "proposal-items-mismatch",
      "A coleção de Proposed Activities diverge do comando de aceite.",
    );
  }

  return proposal;
}

function asReadyProposalForPartialAcceptance(
  proposal: ItineraryProposal,
  command: AcceptItineraryProposalPartiallyCommand,
): ReadyItineraryProposal {
  assertReadyContext(proposal, command, partialAcceptanceError);

  const actualIds = proposal.proposedActivities.map((activity) => activity.proposedActivityId);
  const selectedSet = new Set(command.proposedActivityIds);
  const remainingSet = new Set(command.remainingProposedActivityIds);
  const expectedSelectedIds = actualIds.filter((id) => selectedSet.has(id));
  const expectedRemainingIds = actualIds.filter((id) => !selectedSet.has(id));
  const hasOverlap = command.proposedActivityIds.some((id) => remainingSet.has(id));

  if (
    hasOverlap ||
    command.proposedActivityIds.length + command.remainingProposedActivityIds.length !==
      actualIds.length ||
    !sameOrderedIds(expectedSelectedIds, command.proposedActivityIds) ||
    !sameOrderedIds(expectedRemainingIds, command.remainingProposedActivityIds)
  ) {
    partialAcceptanceError(
      "proposal-items-mismatch",
      "A seleção parcial não representa uma partição válida da Itinerary Proposal atual.",
    );
  }

  return proposal;
}

export function createItineraryProposalTransactionFragment<
  TExecutor extends ItineraryProposalDatabaseExecutor,
>(
  executor: TExecutor,
  repositoryFactory: ItineraryProposalTransactionRepositoryFactory<TExecutor> = createPostgresItineraryProposalRepository,
): PartialItineraryProposalTransactionFragment {
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
    throw new TypeError("Informe uma factory de repository de Itinerary Proposal válida.");
  }

  const repository = repositoryFactory(executor);
  if (
    !repository ||
    typeof repository.findById !== "function" ||
    typeof repository.save !== "function"
  ) {
    throw new TypeError("A factory não retornou um repository de Itinerary Proposal válido.");
  }

  return Object.freeze({
    async loadForAcceptance(
      command: AcceptItineraryProposalCommand,
    ): Promise<ReadyItineraryProposal> {
      assertFullCommand(command);
      const proposal = await repository.findById(command.tripId, command.itineraryProposalId);
      if (!proposal) {
        acceptanceError("proposal-not-found", "A Itinerary Proposal não foi encontrada.");
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
      const accepted = finalizeAppliedItineraryProposalAcceptance(proposal, acceptedAt);
      await repository.save(accepted);
      return accepted as AcceptedItineraryProposal;
    },

    async loadForPartialAcceptance(
      command: AcceptItineraryProposalPartiallyCommand,
    ): Promise<ReadyItineraryProposal> {
      assertPartialCommand(command);
      const proposal = await repository.findById(command.tripId, command.itineraryProposalId);
      if (!proposal) {
        partialAcceptanceError("proposal-not-found", "A Itinerary Proposal não foi encontrada.");
      }
      return asReadyProposalForPartialAcceptance(proposal, command);
    },

    async acceptPartially(
      proposal: ReadyItineraryProposal,
      command: AcceptItineraryProposalPartiallyCommand,
    ): Promise<PartiallyAcceptedItineraryProposal> {
      if (!proposal || typeof proposal !== "object") {
        throw new TypeError("Informe uma Itinerary Proposal ready válida.");
      }
      assertPartialCommand(command);
      const partiallyAccepted = partiallyAcceptItineraryProposal(
        proposal,
        command.proposedActivityIds,
        command.decidedAt,
      );
      await repository.save(partiallyAccepted);
      return partiallyAccepted as PartiallyAcceptedItineraryProposal;
    },
  });
}
