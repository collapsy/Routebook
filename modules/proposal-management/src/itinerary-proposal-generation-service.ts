import type {
  GenerateItineraryProposalInput,
  ItineraryProposalGenerationPort,
} from "./deterministic-itinerary-proposal-generator";
import {
  ItineraryProposalValidationError,
  type CompleteItineraryProposalGenerationInput,
  type ItineraryProposal,
  type RequestItineraryProposalInput,
} from "./itinerary-proposal";
import type { ItineraryProposalRepository } from "./repository";
import {
  completeAndPersistItineraryProposalGeneration,
  failAndPersistItineraryProposalGeneration,
  requestAndPersistItineraryProposal,
  startAndPersistItineraryProposalGeneration,
} from "./service";

export const ITINERARY_PROPOSAL_GENERATION_FAILURE_CODE_PREFIX =
  "itinerary-proposal-generation";
export const UNKNOWN_ITINERARY_PROPOSAL_GENERATION_FAILURE_CODE =
  "itinerary-proposal-generation-failed";
export const INVALID_ITINERARY_PROPOSAL_GENERATION_OUTPUT_FAILURE_CODE =
  "itinerary-proposal-generation-invalid-output";

export type GenerateAndPersistItineraryProposalCommand = Readonly<{
  request: RequestItineraryProposalInput;
  startedAt: Date;
  failedAt: Date;
  generation: GenerateItineraryProposalInput;
}>;

function normalizedErrorCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

  return normalized || undefined;
}

export function toItineraryProposalGenerationFailureCode(error: unknown): string {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return UNKNOWN_ITINERARY_PROPOSAL_GENERATION_FAILURE_CODE;
  }

  const code = normalizedErrorCode(error.code);
  if (!code) return UNKNOWN_ITINERARY_PROPOSAL_GENERATION_FAILURE_CODE;
  if (code.startsWith(`${ITINERARY_PROPOSAL_GENERATION_FAILURE_CODE_PREFIX}-`)) {
    return code;
  }

  return `${ITINERARY_PROPOSAL_GENERATION_FAILURE_CODE_PREFIX}-${code}`;
}

export async function generateAndPersistItineraryProposal(
  repository: ItineraryProposalRepository,
  generationPort: ItineraryProposalGenerationPort,
  command: GenerateAndPersistItineraryProposalCommand,
): Promise<ItineraryProposal> {
  const requested = await requestAndPersistItineraryProposal(repository, command.request);
  const generating = await startAndPersistItineraryProposalGeneration(repository, {
    tripId: requested.tripId,
    itineraryProposalId: requested.id,
    startedAt: command.startedAt,
  });

  let generatedContent: CompleteItineraryProposalGenerationInput;
  try {
    generatedContent = await generationPort.generate(command.generation);
  } catch (error) {
    return failAndPersistItineraryProposalGeneration(repository, {
      tripId: generating.tripId,
      itineraryProposalId: generating.id,
      failureCode: toItineraryProposalGenerationFailureCode(error),
      failedAt: command.failedAt,
    });
  }

  try {
    return await completeAndPersistItineraryProposalGeneration(repository, {
      tripId: generating.tripId,
      itineraryProposalId: generating.id,
      ...generatedContent,
    });
  } catch (error) {
    if (!(error instanceof ItineraryProposalValidationError)) throw error;

    return failAndPersistItineraryProposalGeneration(repository, {
      tripId: generating.tripId,
      itineraryProposalId: generating.id,
      failureCode: INVALID_ITINERARY_PROPOSAL_GENERATION_OUTPUT_FAILURE_CODE,
      failedAt: command.failedAt,
    });
  }
}
