import type { Recommendation, RecommendationId } from "./recommendation";

export type SaveGeneratedRecommendationMode = "reuse-active" | "supersede-active";

export interface RecommendationRepository {
  findById(tripId: string, recommendationId: RecommendationId): Promise<Recommendation | null>;
  listByTripId(tripId: string): Promise<readonly Recommendation[]>;
  saveGenerated(
    recommendation: Recommendation,
    mode?: SaveGeneratedRecommendationMode,
  ): Promise<Recommendation>;
  save(recommendation: Recommendation): Promise<Recommendation>;
}

export class RecommendationRepositoryError extends Error {
  constructor(
    message: string,
    readonly code:
      | "trip-not-found"
      | "place-not-found"
      | "place-not-published"
      | "destination-mismatch"
      | "recommendation-not-found"
      | "invalid-status"
      | "duplicate-active-recommendation",
  ) {
    super(message);
    this.name = "RecommendationRepositoryError";
  }
}
