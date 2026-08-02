import type { PostgresTransactionRunner } from "./postgres-transaction-runner";

export type ItineraryProposalTransactionFragments<
  TProposalApplication,
  TItineraryProposal,
  TItinerary,
  TDecision,
> = Readonly<{
  proposalApplication: TProposalApplication;
  itineraryProposal: TItineraryProposal;
  itinerary: TItinerary;
  decision: TDecision;
}>;

export type ItineraryProposalTransactionFragmentFactories<
  TExecutor,
  TProposalApplication,
  TItineraryProposal,
  TItinerary,
  TDecision,
> = Readonly<{
  proposalApplication(executor: TExecutor): TProposalApplication;
  itineraryProposal(executor: TExecutor): TItineraryProposal;
  itinerary(executor: TExecutor): TItinerary;
  decision(executor: TExecutor): TDecision;
}>;

export type ItineraryProposalTransactionOperation<
  TProposalApplication,
  TItineraryProposal,
  TItinerary,
  TDecision,
  TResult,
> = (
  fragments: ItineraryProposalTransactionFragments<
    TProposalApplication,
    TItineraryProposal,
    TItinerary,
    TDecision
  >,
) => Promise<TResult>;

export class ItineraryProposalTransactionUnit<
  TExecutor,
  TProposalApplication,
  TItineraryProposal,
  TItinerary,
  TDecision,
> {
  constructor(
    private readonly runner: Pick<PostgresTransactionRunner<TExecutor>, "execute">,
    private readonly factories: ItineraryProposalTransactionFragmentFactories<
      TExecutor,
      TProposalApplication,
      TItineraryProposal,
      TItinerary,
      TDecision
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
      });

      return operation(fragments);
    });
  }
}
