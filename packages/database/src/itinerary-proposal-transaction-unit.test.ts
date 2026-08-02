import { describe, expect, it, vi } from "vitest";

import { ItineraryProposalTransactionUnit } from "./itinerary-proposal-transaction-unit";
import { PostgresTransactionRunner } from "./postgres-transaction-runner";

type Executor = Readonly<{ scope: "transaction" }>;

function createRunner(executor: Executor, onTransaction?: () => void) {
  return new PostgresTransactionRunner<Executor>({
    async transaction<TResult>(operation: (value: Executor) => Promise<TResult>) {
      onTransaction?.();
      return operation(executor);
    },
  });
}

function createFragments(executor: Executor, calls: string[] = []) {
  const proposalApplication = {
    name: "proposal-application",
    executor,
  } as const;
  const itineraryProposal = {
    name: "itinerary-proposal",
    executor,
  } as const;
  const itinerary = { name: "itinerary", executor } as const;
  const decision = { name: "decision", executor } as const;

  return {
    values: { proposalApplication, itineraryProposal, itinerary, decision },
    factories: {
      proposalApplication(value: Executor) {
        calls.push("proposalApplication");
        expect(value).toBe(executor);
        return proposalApplication;
      },
      itineraryProposal(value: Executor) {
        calls.push("itineraryProposal");
        expect(value).toBe(executor);
        return itineraryProposal;
      },
      itinerary(value: Executor) {
        calls.push("itinerary");
        expect(value).toBe(executor);
        return itinerary;
      },
      decision(value: Executor) {
        calls.push("decision");
        expect(value).toBe(executor);
        return decision;
      },
    },
  };
}

describe("ItineraryProposalTransactionUnit", () => {
  it("abre uma única transação e cria os quatro fragments em ordem", async () => {
    const executor = { scope: "transaction" } as const;
    const calls: string[] = [];
    const transaction = vi.fn();
    const { factories } = createFragments(executor, calls);
    const unit = new ItineraryProposalTransactionUnit(
      createRunner(executor, transaction),
      factories,
    );

    await unit.execute(async () => {
      calls.push("operation");
      return "ok";
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(calls).toEqual([
      "proposalApplication",
      "itineraryProposal",
      "itinerary",
      "decision",
      "operation",
    ]);
  });

  it("entrega contexto congelado com as identidades produzidas pelas factories", async () => {
    const executor = { scope: "transaction" } as const;
    const { factories, values } = createFragments(executor);
    const unit = new ItineraryProposalTransactionUnit(createRunner(executor), factories);

    await unit.execute(async (fragments) => {
      expect(Object.isFrozen(fragments)).toBe(true);
      expect(fragments.proposalApplication).toBe(values.proposalApplication);
      expect(fragments.itineraryProposal).toBe(values.itineraryProposal);
      expect(fragments.itinerary).toBe(values.itinerary);
      expect(fragments.decision).toBe(values.decision);
    });
  });

  it("preserva identidade e tipo do resultado da operação", async () => {
    const executor = { scope: "transaction" } as const;
    const { factories } = createFragments(executor);
    const unit = new ItineraryProposalTransactionUnit(createRunner(executor), factories);
    const result = { applied: true } as const;

    await expect(unit.execute(async () => result)).resolves.toBe(result);
  });

  it("propaga falha de factory e não cria fragments posteriores nem chama a operação", async () => {
    const executor = { scope: "transaction" } as const;
    const error = new Error("proposal fragment failure");
    const calls: string[] = [];
    const operation = vi.fn(async () => "unused");
    const unit = new ItineraryProposalTransactionUnit(createRunner(executor), {
      proposalApplication() {
        calls.push("proposalApplication");
        throw error;
      },
      itineraryProposal() {
        calls.push("itineraryProposal");
        return {};
      },
      itinerary() {
        calls.push("itinerary");
        return {};
      },
      decision() {
        calls.push("decision");
        return {};
      },
    });

    await expect(unit.execute(operation)).rejects.toBe(error);
    expect(calls).toEqual(["proposalApplication"]);
    expect(operation).not.toHaveBeenCalled();
  });

  it("propaga falha da operação sem retry ou compensação", async () => {
    const executor = { scope: "transaction" } as const;
    const transaction = vi.fn();
    const { factories } = createFragments(executor);
    const error = new Error("operation failure");
    const operation = vi.fn(async () => {
      throw error;
    });
    const unit = new ItineraryProposalTransactionUnit(
      createRunner(executor, transaction),
      factories,
    );

    await expect(unit.execute(operation)).rejects.toBe(error);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("rejeita runner inválido", () => {
    const executor = { scope: "transaction" } as const;
    const { factories } = createFragments(executor);

    expect(() => new ItineraryProposalTransactionUnit(undefined as never, factories)).toThrowError(
      TypeError,
    );
    expect(() => new ItineraryProposalTransactionUnit({} as never, factories)).toThrowError(
      TypeError,
    );
  });

  it.each(["proposalApplication", "itineraryProposal", "itinerary", "decision"] as const)(
    "rejeita factory ausente: %s",
    (name) => {
      const executor = { scope: "transaction" } as const;
      const { factories } = createFragments(executor);

      expect(
        () =>
          new ItineraryProposalTransactionUnit(createRunner(executor), {
            ...factories,
            [name]: undefined,
          } as never),
      ).toThrowError(TypeError);
    },
  );

  it("rejeita operação ausente antes de abrir transação", async () => {
    const executor = { scope: "transaction" } as const;
    const transaction = vi.fn();
    const { factories } = createFragments(executor);
    const unit = new ItineraryProposalTransactionUnit(
      createRunner(executor, transaction),
      factories,
    );

    await expect(unit.execute(undefined as never)).rejects.toThrowError(TypeError);
    expect(transaction).not.toHaveBeenCalled();
  });
});
