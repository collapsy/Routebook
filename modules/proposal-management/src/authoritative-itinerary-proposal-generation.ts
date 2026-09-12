import type {
  GenerateItineraryProposalInput,
  ItineraryProposalGenerationCandidate,
  ItineraryProposalGenerationPort,
} from "./deterministic-itinerary-proposal-generator";
import {
  assembleItineraryProposalGenerationInput,
  type ItineraryProposalSourceItinerary,
  type ItineraryProposalSourcePlace,
  type ItineraryProposalSourceRecommendation,
} from "./itinerary-proposal-generation-input-assembler";
import {
  generateAndPersistItineraryProposal,
  type GenerateAndPersistItineraryProposalCommand,
} from "./itinerary-proposal-generation-service";
import type { ItineraryProposal } from "./itinerary-proposal";
import type { ItineraryProposalRepository } from "./repository";

export type LoadAuthoritativeItineraryProposalGenerationContextInput = Readonly<{
  tripId: string;
  asOf: Date;
}>;

export type AuthoritativeItineraryProposalGenerationContext = Readonly<{
  itinerary: ItineraryProposalSourceItinerary;
  recommendations: readonly ItineraryProposalSourceRecommendation[];
  places: readonly ItineraryProposalSourcePlace[];
}>;

export interface AuthoritativeItineraryProposalGenerationContextPort {
  load(
    input: LoadAuthoritativeItineraryProposalGenerationContextInput,
  ): Promise<AuthoritativeItineraryProposalGenerationContext>;
}

export type GenerateAuthoritativeItineraryProposalCommand = Readonly<{
  request: GenerateAndPersistItineraryProposalCommand["request"];
  startedAt: Date;
  failedAt: Date;
  asOf: Date;
  generatedAt: Date;
  createProposedActivityId: GenerateItineraryProposalInput["createProposedActivityId"];
  additionalCandidates?: readonly ItineraryProposalGenerationCandidate[];
  anchorCoordinate?: GenerateItineraryProposalInput["anchorCoordinate"];
}>;

export type AuthoritativeItineraryProposalGenerationErrorCode =
  "invalid-trip-id" | "context-trip-mismatch";

export class AuthoritativeItineraryProposalGenerationError extends Error {
  constructor(
    message: string,
    readonly code: AuthoritativeItineraryProposalGenerationErrorCode,
  ) {
    super(message);
    this.name = "AuthoritativeItineraryProposalGenerationError";
  }
}

function requiredTripId(value: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    throw new AuthoritativeItineraryProposalGenerationError(
      "Informe um TripId válido para gerar a Itinerary Proposal.",
      "invalid-trip-id",
    );
  }
  return normalized;
}

export function mergeItineraryProposalGenerationCandidates(
  recommendationCandidates: readonly ItineraryProposalGenerationCandidate[],
  additionalCandidates: readonly ItineraryProposalGenerationCandidate[] = [],
): readonly ItineraryProposalGenerationCandidate[] {
  const merged = [...recommendationCandidates];
  const representedPlaceIds = new Set(
    recommendationCandidates.flatMap((candidate) => (candidate.placeId ? [candidate.placeId] : [])),
  );

  for (const candidate of additionalCandidates) {
    if (candidate.placeId && representedPlaceIds.has(candidate.placeId)) continue;
    merged.push(candidate);
    if (candidate.placeId) representedPlaceIds.add(candidate.placeId);
  }

  return Object.freeze(merged);
}

export async function generateAuthoritativeItineraryProposal(
  repository: ItineraryProposalRepository,
  generationPort: ItineraryProposalGenerationPort,
  contextPort: AuthoritativeItineraryProposalGenerationContextPort,
  command: GenerateAuthoritativeItineraryProposalCommand,
): Promise<ItineraryProposal> {
  const tripId = requiredTripId(command.request.tripId);
  const context = await contextPort.load({ tripId, asOf: command.asOf });

  if (context.itinerary.tripId.trim() !== tripId) {
    throw new AuthoritativeItineraryProposalGenerationError(
      "O Itinerary carregado não pertence à Trip solicitada.",
      "context-trip-mismatch",
    );
  }

  const assembled = assembleItineraryProposalGenerationInput({
    ...context,
    asOf: command.asOf,
  });
  const candidates = mergeItineraryProposalGenerationCandidates(
    assembled.candidates,
    command.additionalCandidates,
  );

  return generateAndPersistItineraryProposal(repository, generationPort, {
    request: command.request,
    startedAt: command.startedAt,
    failedAt: command.failedAt,
    generation: {
      ...assembled,
      candidates,
      generatedAt: command.generatedAt,
      createProposedActivityId: command.createProposedActivityId,
      ...(command.anchorCoordinate ? { anchorCoordinate: command.anchorCoordinate } : {}),
    },
  });
}
