export interface PostgresTransactionHost<TExecutor> {
  transaction<TResult>(operation: (executor: TExecutor) => Promise<TResult>): Promise<TResult>;
}

export type PostgresTransactionOperation<TExecutor, TResult> = (
  executor: TExecutor,
) => Promise<TResult>;

export class PostgresTransactionRunner<TExecutor> {
  constructor(private readonly host: PostgresTransactionHost<TExecutor>) {
    if (!host || typeof host.transaction !== "function") {
      throw new TypeError("Informe um host transacional PostgreSQL válido.");
    }
  }

  async execute<TResult>(
    operation: PostgresTransactionOperation<TExecutor, TResult>,
  ): Promise<TResult> {
    if (typeof operation !== "function") {
      throw new TypeError("Informe uma operação transacional válida.");
    }

    return this.host.transaction(async (executor) => operation(executor));
  }
}
