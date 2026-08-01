import {
  cancelItineraryProposalGeneration,
  failItineraryProposalGeneration,
  requestItineraryProposal,
  startItineraryProposalGeneration,
  type ItineraryProposal,
  type ItineraryProposalId,
  type RequestItineraryProposalInput,
} from "./itinerary-proposal";
import type { ItineraryProposalRepository } from "./repository";

export class ItineraryProposalApplicationError extends Error {
  constructor(
    message: string,
    readonly code: "proposal-not-found",
  ) {
    super(message);
    this.name = "ItineraryProposalApplicationError";
  }
}

export type StartItineraryProposalGenerationCommand = Readonly<{
  tripId: string;
  itineraryProposalId: ItineraryProposalId;
  startedAt: Date;
}>;

export type FailItineraryProposalGenerationCommand = Readonly<{
  tripId: string;
  itineraryProposalId: ItineraryProposalId;
  failureCode: string;
  failedAt: Date;
}>;

export type CancelItineraryProposalGenerationCommand = Readonly<{
  tripId: string;
  itineraryProposalId: ItineraryProposalId;
  cancelledAt: Date;
}>;

async function loadItineraryProposal(
  repository: ItineraryProposalRepository,
  tripId: string,
  itineraryProposalId: ItineraryProposalId,
): Promise<ItineraryProposal> {
  const proposal = await repository.findById(tripId, itineraryProposalId);
  if (!proposal) {
    throw new ItineraryProposalApplicationError(
      "A Itinerary Proposal não existe nesta Viagem.",
      "proposal-not-found",
    );
  }
  return proposal;
}

export async function requestAndPersistItineraryProposal(
  repository: ItineraryProposalRepository,
  input: RequestItineraryProposalInput,
): Promise<ItineraryProposal> {
  return repository.create(requestItineraryProposal(input));
}

export async function startAndPersistItineraryProposalGeneration(
  repository: ItineraryProposalRepository,
  command: StartItineraryProposalGenerationCommand,
): Promise<ItineraryProposal> {
  const proposal = await loadItineraryProposal(
    repository,
    command.tripId,
    command.itineraryProposalId,
  );
  const generating = startItineraryProposalGeneration(proposal, command.startedAt);
  return repository.save(generating);
}

export async function failAndPersistItineraryProposalGeneration(
  repository: ItineraryProposalRepository,
  command: FailItineraryProposalGenerationCommand,
): Promise<ItineraryProposal> {
  const proposal = await loadItineraryProposal(
    repository,
    command.tripId,
    command.itineraryProposalId,
  );
  const failed = failItineraryProposalGeneration(proposal, command.failureCode, command.failedAt);
  return repository.save(failed);
}

export async function cancelAndPersistItineraryProposalGeneration(
  repository: ItineraryProposalRepository,
  command: CancelItineraryProposalGenerationCommand,
): Promise<ItineraryProposal> {
  const proposal = await loadItineraryProposal(
    repository,
    command.tripId,
    command.itineraryProposalId,
  );
  const cancelled = cancelItineraryProposalGeneration(proposal, command.cancelledAt);
  return repository.save(cancelled);
}
