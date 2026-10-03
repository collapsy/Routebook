import type { PostgresTransactionRunner } from "./postgres-transaction-runner";

export type ItineraryProposalTransactionFragments<
  TProposalApplication,
  TItineraryProposal,
  TItinerary,
  TDecision,
  TTripStatus,
> = Readonly<{
  proposalApplication: TProposalApplication;
  itineraryProposal: TItineraryProposal;
  itinerary: TItinerary;
  decision: TDecision;
  tripStatus: TTripStatus;
}>;

export type ItineraryProposalTransactionFragmentFactories<
  TExecutor,
  TProposalApplication,
  TItineraryProposal,
  TItinerary,
  TDecision,
  TTripStatus,
> = Readonly<{
  proposalApplication(executor: TExecutor): TProposalApplication;
  itineraryProposal(executor: TExecutor): TItineraryProposal;
  itinerary(executor: TExecutor): TItinerary;
  decision(executor: TExecutor): TDecision;
  tripStatus(executor: TExecutor): TTripStatus;
}>;

export type ItineraryProposalTransactionOperation<
  TProposalApplication,
  TItineraryProposal,
  TItinerary,
  TDecision,
  TTripStatus,
  TResult,
> = (
  fragments: ItineraryProposalTransactionFragments<
    TProposalApplication,
    TItineraryProposal,
    TItinerary,
    TDecision,
    TTripStatus
  >,
) => Promise<TResult>;

export class ItineraryProposalTransactionUnit<
  TExecutor,
  TProposalApplication,
  TItineraryProposal,
  TItinerary,
  TDecision,
  TTripStatus,
> {
  constructor(
    private readonly runner: Pick<PostgresTransactionRunner<TExecutor>, "execute">,
    private readonly factories: ItineraryProposalTransactionFragmentFactories<
      TExecutor,
      TProposalApplication,
      TItineraryProposal,
      TItinerary,
      TDecision,
      TTripStatus
    >,
  ) {
    if (!runner || typeof runner.execute !== "function") {
      throw new TypeError("Informe um PostgresTransactionRunner válido.");
    }
    if (!factories || typeof factories !== "object") {
      throw new TypeError("Informe as factories dos fragments transacionais.");
    }

    for (const name of [
      "proposalApplication",
      "itineraryProposal",
      "itinerary",
      "decision",
      "tripStatus",
    ] as const) {
      if (typeof factories[name] !== "function") {
        throw new TypeError(`Informe a factory transacional ${name}.`);
      }
    }
  }

  async execute<TResult>(
    operation: ItineraryProposalTransactionOperation<
      TProposalApplication,
      TItineraryProposal,
      TItinerary,
      TDecision,
      TTripStatus,
      TResult
    >,
  ): Promise<TResult> {
    if (typeof operation !== "function") {
      throw new TypeError("Informe uma operação para a unidade transacional.");
    }

    return this.runner.execute(async (executor) => {
      const fragments = Object.freeze({
        proposalApplication: this.factories.proposalApplication(executor),
        itineraryProposal: this.factories.itineraryProposal(executor),
        itinerary: this.factories.itinerary(executor),
        decision: this.factories.decision(executor),
        tripStatus: this.factories.tripStatus(executor),
      });

      return operation(fragments);
    });
  }
}
