import type { ItineraryProposal, ItineraryProposalId } from "./itinerary-proposal";

export interface ItineraryProposalRepository {
  create(proposal: ItineraryProposal): Promise<ItineraryProposal>;
  save(proposal: ItineraryProposal): Promise<ItineraryProposal>;
  findById(
    tripId: string,
    itineraryProposalId: ItineraryProposalId,
  ): Promise<ItineraryProposal | null>;
  listByTripId(tripId: string): Promise<readonly ItineraryProposal[]>;
}

export type ItineraryProposalRepositoryErrorCode =
  | "trip-not-found"
  | "itinerary-not-found"
  | "itinerary-trip-mismatch"
  | "proposal-not-found"
  | "duplicate-proposal"
  | "invalid-status";

export class ItineraryProposalRepositoryError extends Error {
  constructor(
    message: string,
    readonly code: ItineraryProposalRepositoryErrorCode,
  ) {
    super(message);
    this.name = "ItineraryProposalRepositoryError";
  }
}
