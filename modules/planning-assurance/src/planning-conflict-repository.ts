import type { PlanningConflict, PlanningConflictId } from "./planning-conflict";

export class PlanningConflictRepositoryError extends Error {
  constructor(
    message: string,
    readonly code:
      | "planning-conflict-not-found"
      | "cross-trip"
      | "duplicate-active-conflict"
      | "persistence-failure",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "PlanningConflictRepositoryError";
  }
}

export interface PlanningConflictRepository {
  findByIdForTrip(id: PlanningConflictId, tripId: string): Promise<PlanningConflict | null>;
  listByTripId(tripId: string): Promise<PlanningConflict[]>;
  listActiveByTripId(tripId: string): Promise<PlanningConflict[]>;
  reconcile(
    tripId: string,
    detectedConflicts: readonly PlanningConflict[],
    evaluatedAt: Date,
  ): Promise<PlanningConflict[]>;
}
