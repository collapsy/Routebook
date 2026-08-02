import {
  applyProposalItemsToItinerary,
  type AppliedProposalItemsToItinerary,
  type Itinerary,
} from "@routebook/trip-management";
import {
  AcceptItineraryProposalError,
  type AcceptItineraryProposalCommand,
} from "@routebook/proposal-management";

import {
  createPostgresItineraryRepository,
  type ItineraryDatabaseExecutor,
} from "./itinerary-repository";

export type ItineraryTransactionRepository = Readonly<{
  findByTripId(tripId: string): Promise<Itinerary | null>;
  save(itinerary: Itinerary): Promise<Itinerary>;
}>;

export type ItineraryTransactionRepositoryFactory<
  TExecutor extends ItineraryDatabaseExecutor = ItineraryDatabaseExecutor,
> = (executor: TExecutor) => ItineraryTransactionRepository;

export interface ItineraryTransactionFragment {
  apply(command: AcceptItineraryProposalCommand): Promise<AppliedProposalItemsToItinerary>;
}

function acceptanceError(
  code: ConstructorParameters<typeof AcceptItineraryProposalError>[0],
  message: string,
): never {
  throw new AcceptItineraryProposalError(code, message);
}

function assertCommand(command: AcceptItineraryProposalCommand): void {
  if (!command || typeof command !== "object") {
    throw new TypeError("Informe um comando AcceptItineraryProposal válido.");
  }
}

function assertCurrentItinerary(
  itinerary: Itinerary,
  command: AcceptItineraryProposalCommand,
): void {
  if (itinerary.tripId !== command.tripId || itinerary.id !== command.itineraryId) {
    acceptanceError(
      "itinerary-not-found",
      "O Itinerary não pertence ao contexto solicitado.",
    );
  }
  if (itinerary.version !== command.expectedItineraryVersion) {
    acceptanceError(
      "itinerary-version-mismatch",
      "A versão atual do Itinerary diverge da versão esperada pela Proposal.",
    );
  }
}

export function createItineraryTransactionFragment<
  TExecutor extends ItineraryDatabaseExecutor,
>(
  executor: TExecutor,
  repositoryFactory: ItineraryTransactionRepositoryFactory<TExecutor> =
    createPostgresItineraryRepository,
): ItineraryTransactionFragment {
  if (
    !executor ||
    typeof executor.select !== "function" ||
    typeof executor.insert !== "function" ||
    typeof executor.delete !== "function"
  ) {
    throw new TypeError("Informe um executor Drizzle transacional válido.");
  }
  if (typeof repositoryFactory !== "function") {
    throw new TypeError("Informe uma factory de repository de Itinerary válida.");
  }

  const repository = repositoryFactory(executor);
  if (
    !repository ||
    typeof repository.findByTripId !== "function" ||
    typeof repository.save !== "function"
  ) {
    throw new TypeError("A factory não retornou um repository de Itinerary válido.");
  }

  return Object.freeze({
    async apply(
      command: AcceptItineraryProposalCommand,
    ): Promise<AppliedProposalItemsToItinerary> {
      assertCommand(command);
      const itinerary = await repository.findByTripId(command.tripId);
      if (!itinerary) {
        acceptanceError("itinerary-not-found", "O Itinerary não foi encontrado.");
      }
      assertCurrentItinerary(itinerary, command);

      const applied = applyProposalItemsToItinerary(itinerary, command, {
        now: command.decidedAt,
      });
      const persisted = await repository.save(applied.itinerary);

      return Object.freeze({
        itinerary: persisted,
        result: applied.result,
      });
    },
  });
}
