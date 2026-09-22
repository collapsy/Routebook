import type {
  GenerateItineraryProposalInput,
  ItineraryProposalGenerationPort,
} from "./deterministic-itinerary-proposal-generator";
import {
  assembleItineraryProposalGenerationInputFromSelection,
  type ItineraryProposalSourceItinerary,
  type ItineraryProposalSourcePlace,
  type ItineraryProposalSourcePreference,
} from "./itinerary-proposal-generation-input-assembler";
import {
  generateAndPersistItineraryProposal,
  type GenerateAndPersistItineraryProposalCommand,
} from "./itinerary-proposal-generation-service";
import type {
  ItineraryProposal,
  ItineraryProposalGenerationContext,
  ItineraryProposalGenerationScope,
  ItineraryProposalReplanningWindowSnapshot,
} from "./itinerary-proposal";
import type { ItineraryProposalRepository } from "./repository";

export type LoadAuthoritativeItineraryProposalGenerationContextInput = Readonly<{
  tripId: string;
  asOf: Date;
  generationScope?: ItineraryProposalGenerationScope;
}>;

export type AuthoritativeItineraryProposalGenerationContext = Readonly<{
  itinerary: ItineraryProposalSourceItinerary;
  preferences: readonly ItineraryProposalSourcePreference[];
  places: readonly ItineraryProposalSourcePlace[];
  replanningWindow?: ItineraryProposalReplanningWindowSnapshot;
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
  includeMaybe?: boolean;
  anchorCoordinate?: GenerateItineraryProposalInput["anchorCoordinate"];
}>;

export type AuthoritativeItineraryProposalGenerationErrorCode =
  | "invalid-trip-id"
  | "context-trip-mismatch"
  | "candidate-provenance-missing"
  | "replanning-window-required"
  | "replanning-window-day-mismatch";

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

function generationContextFrom(
  context: AuthoritativeItineraryProposalGenerationContext,
  candidates: GenerateItineraryProposalInput["candidates"],
  includeMaybe: boolean,
  generationScope: ItineraryProposalGenerationScope,
): ItineraryProposalGenerationContext {
  if (generationScope === "REPLAN" && !context.replanningWindow) {
    throw new AuthoritativeItineraryProposalGenerationError(
      "REPLAN exige uma ReplanningWindow autoritativa.",
      "replanning-window-required",
    );
  }

  return Object.freeze({
    schemaVersion: 1 as const,
    includeMaybe,
    selection: Object.freeze(
      context.preferences.map((preference) =>
        Object.freeze({
          preferenceId: preference.preferenceId,
          placeId: preference.placeId,
          intent: preference.intent,
          priority: preference.priority,
        }),
      ),
    ),
    candidates: Object.freeze(
      candidates.map((candidate) => {
        const placeId = candidate.placeId?.trim();
        if (!placeId || !candidate.origin || !candidate.provenance) {
          throw new AuthoritativeItineraryProposalGenerationError(
            "A geração autoritativa exige PlaceId, origem e proveniência para cada candidato.",
            "candidate-provenance-missing",
          );
        }
        return Object.freeze({
          candidateId: candidate.candidateId,
          placeId,
          origin: candidate.origin,
          provenance: candidate.provenance,
        });
      }),
    ),
    ...(generationScope === "REPLAN" && context.replanningWindow
      ? { replanningWindow: context.replanningWindow }
      : {}),
  });
}

function eligibleReplanningDays(
  days: GenerateItineraryProposalInput["days"],
  window: ItineraryProposalReplanningWindowSnapshot,
): GenerateItineraryProposalInput["days"] {
  const dayIds = new Set(days.map(({ tripDayId }) => tripDayId));
  for (const eligibleDayId of window.eligibleDayIds) {
    if (!dayIds.has(eligibleDayId)) {
      throw new AuthoritativeItineraryProposalGenerationError(
        "A ReplanningWindow referencia um Dia que não existe no Itinerary autoritativo.",
        "replanning-window-day-mismatch",
      );
    }
  }
  const eligible = new Set(window.eligibleDayIds);
  return Object.freeze(days.filter(({ tripDayId }) => eligible.has(tripDayId)));
}

export async function generateAuthoritativeItineraryProposal(
  repository: ItineraryProposalRepository,
  generationPort: ItineraryProposalGenerationPort,
  contextPort: AuthoritativeItineraryProposalGenerationContextPort,
  command: GenerateAuthoritativeItineraryProposalCommand,
): Promise<ItineraryProposal> {
  const tripId = requiredTripId(command.request.tripId);
  const generationScope = command.request.generationScope ?? "INITIAL";
  const includeMaybe = command.includeMaybe === true;
  const context = await contextPort.load({
    tripId,
    asOf: command.asOf,
    generationScope,
  });

  if (context.itinerary.tripId.trim() !== tripId) {
    throw new AuthoritativeItineraryProposalGenerationError(
      "O Itinerary carregado não pertence à Trip solicitada.",
      "context-trip-mismatch",
    );
  }

  const assembled = assembleItineraryProposalGenerationInputFromSelection({
    ...context,
    includeMaybe,
    asOf: command.asOf,
  });
  const generationContext = generationContextFrom(
    context,
    assembled.candidates,
    includeMaybe,
    generationScope,
  );
  const days =
    generationScope === "REPLAN"
      ? eligibleReplanningDays(assembled.days, generationContext.replanningWindow!)
      : assembled.days;

  return generateAndPersistItineraryProposal(repository, generationPort, {
    request: {
      ...command.request,
      generationScope,
      generationContext,
    },
    startedAt: command.startedAt,
    failedAt: command.failedAt,
    generation: {
      ...assembled,
      days,
      generatedAt: command.generatedAt,
      createProposedActivityId: command.createProposedActivityId,
      ...(command.anchorCoordinate ? { anchorCoordinate: command.anchorCoordinate } : {}),
    },
  });
}
