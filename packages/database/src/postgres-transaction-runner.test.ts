import { describe, expect, it, vi } from "vitest";

import {
  PostgresTransactionRunner,
  type PostgresTransactionHost,
} from "./postgres-transaction-runner";

type Executor = Readonly<{ scope: "transaction" }>;

function createHost(
  executor: Executor,
  onTransaction?: () => void,
): PostgresTransactionHost<Executor> {
  return {
    async transaction<TResult>(
      operation: (scopedExecutor: Executor) => Promise<TResult>,
    ): Promise<TResult> {
      onTransaction?.();
      return operation(executor);
    },
  };
}

describe("PostgresTransactionRunner", () => {
  it("abre uma única transação e preserva a identidade do resultado", async () => {
    const executor = { scope: "transaction" } as const;
    const result = { applied: true } as const;
    const transaction = vi.fn();
    const operation = vi.fn(async () => result);
    const runner = new PostgresTransactionRunner(createHost(executor, transaction));

    await expect(runner.execute(operation)).resolves.toBe(result);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("entrega somente o executor escopado à operação", async () => {
    const executor = { scope: "transaction" } as const;
    const host = createHost(executor);
    const operation = vi.fn(async () => "ok");
    const runner = new PostgresTransactionRunner(host);

    await runner.execute(operation);

    expect(operation).toHaveBeenCalledWith(executor);
    expect(operation).not.toHaveBeenCalledWith(host);
  });

  it("preserva o tipo genérico do resultado", async () => {
    const runner = new PostgresTransactionRunner(createHost({ scope: "transaction" }));

    const result = await runner.execute(async () => 42 as const);

    expect(result).toBe(42);
  });

  it("propaga erro síncrono sem retry ou conversão", async () => {
    const error = new Error("sync failure");
    const transaction = vi.fn();
    const operation = vi.fn(() => {
      throw error;
    });
    const runner = new PostgresTransactionRunner(createHost({ scope: "transaction" }, transaction));

    await expect(runner.execute(operation)).rejects.toBe(error);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("propaga rejeição assíncrona sem retry ou compensação", async () => {
    const error = new Error("async failure");
    const transaction = vi.fn();
    const operation = vi.fn(async () => {
      throw error;
    });
    const runner = new PostgresTransactionRunner(createHost({ scope: "transaction" }, transaction));

    await expect(runner.execute(operation)).rejects.toBe(error);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("rejeita host sem transaction", () => {
    expect(() => new PostgresTransactionRunner(undefined as never)).toThrowError(TypeError);
    expect(() => new PostgresTransactionRunner({} as never)).toThrowError(TypeError);
  });

  it("rejeita callback ausente antes de abrir a transação", async () => {
    const transaction = vi.fn();
    const runner = new PostgresTransactionRunner(createHost({ scope: "transaction" }, transaction));

    await expect(runner.execute(undefined as never)).rejects.toThrowError(TypeError);
    expect(transaction).not.toHaveBeenCalled();
  });
});
