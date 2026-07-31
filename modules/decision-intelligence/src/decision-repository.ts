import type { Decision, DecisionId } from "./decision";

export class DecisionRepositoryError extends Error {
  constructor(
    message: string,
    readonly code:
      | "duplicate-idempotency-key"
      | "decision-not-found"
      | "persistence-failure",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "DecisionRepositoryError";
  }
}

export interface DecisionRepository {
  findById(id: DecisionId): Promise<Decision | null>;
  findByIdempotencyKey(
    tripId: string,
    idempotencyKey: string,
  ): Promise<Decision | null>;
  listByTripId(tripId: string): Promise<Decision[]>;
  save(decision: Decision): Promise<Decision>;
}
