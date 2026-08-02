import { randomUUID } from "node:crypto";

import type {
  DecisionContextSnapshot as RecommendationDecisionContextSnapshot,
  RecommendationId,
} from "./recommendation";

const decisionIdBrand: unique symbol = Symbol("DecisionId");

export type DecisionId = string & { readonly [decisionIdBrand]: true };
export type DecisionType =
  "save-place" | "add-to-itinerary" | "ignore-planning-risk" | "accept-itinerary-proposal";

export type PlanningRiskDecisionContextSnapshot = Readonly<{
  schemaVersion: 1;
  tripId: string;
  planningConflictId: string;
  planningConflictContextFingerprint: string;
  itineraryId: string;
  itineraryVersion: number;
  policyVersion: string;
  capturedAt: Date;
}>;

export type ItineraryProposalDecisionContextSnapshot = Readonly<{
  schemaVersion: 1;
  tripId: string;
  itineraryId: string;
  itineraryProposalId: string;
  baseItineraryVersion: number;
  requestFingerprint: string;
  capturedAt: Date;
}>;

export type DecisionRecordContextSnapshot =
  | RecommendationDecisionContextSnapshot
  | PlanningRiskDecisionContextSnapshot
  | ItineraryProposalDecisionContextSnapshot;

export type SavePlaceDecisionOption = Readonly<{
  type: "save-place";
  placeId: string;
}>;

export type AddToItineraryDecisionOption = Readonly<{
  type: "add-to-itinerary";
  placeId: string;
  dayId: string;
  startTime?: string;
  durationMinutes?: number;
}>;

export type IgnorePlanningRiskDecisionOption = Readonly<{
  type: "ignore-planning-risk";
  planningConflictId: string;
}>;

export type AcceptItineraryProposalDecisionOption = Readonly<{
  type: "accept-itinerary-proposal";
  itineraryProposalId: string;
  proposedActivityIds: readonly string[];
}>;

export type DecisionOption =
  | SavePlaceDecisionOption
  | AddToItineraryDecisionOption
  | IgnorePlanningRiskDecisionOption
  | AcceptItineraryProposalDecisionOption;

export type ItineraryProposalAppliedDecisionEffect = Readonly<{
  type: "itinerary-proposal-applied";
  proposalApplicationId: string;
  itineraryId: string;
  resultingItineraryVersion: number;
  appliedProposedActivityIds: readonly string[];
}>;

export type DecisionEffect =
  | Readonly<{ type: "saved-place"; savedPlaceId: string }>
  | Readonly<{ type: "itinerary-activity"; activityId: string }>
  | Readonly<{ type: "planning-conflict-ignored"; planningConflictId: string }>
  | ItineraryProposalAppliedDecisionEffect;

export type Decision = Readonly<{
  id: DecisionId;
  tripId: string;
  recommendationId?: RecommendationId;
  actorParticipantId: string;
  decidedAt: Date;
  type: DecisionType;
  chosenOption: DecisionOption;
  contextSnapshot: DecisionRecordContextSnapshot;
  effect: DecisionEffect;
  idempotencyKey: string;
}>;

export type CreateDecisionInput = Readonly<{
  id?: string;
  tripId: string;
  recommendationId?: RecommendationId;
  actorParticipantId: string;
  decidedAt: Date;
  chosenOption: DecisionOption;
  contextSnapshot: DecisionRecordContextSnapshot;
  effect: DecisionEffect;
  idempotencyKey: string;
}>;

export class DecisionValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Readonly<Record<string, string>>,
  ) {
    super(message);
    this.name = "DecisionValidationError";
  }
}

function requiredText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new DecisionValidationError("Decision inválida.", {
      [field]: "Informe um valor não vazio.",
    });
  }
  return normalized;
}

function validDate(value: Date): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new DecisionValidationError("Decision inválida.", {
      decidedAt: "Informe uma data válida.",
    });
  }
  return new Date(value.getTime());
}

function positiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new DecisionValidationError("Decision inválida.", {
      [field]: "Use um inteiro positivo.",
    });
  }
  return value;
}

function normalizeSha256(value: string, field: string): string {
  const normalized = requiredText(value, field).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new DecisionValidationError("Decision inválida.", {
      [field]: "Use um SHA-256 hexadecimal com 64 caracteres.",
    });
  }
  return normalized;
}

function normalizeOrderedIds(values: readonly string[], field: string): readonly string[] {
  if (!Array.isArray(values)) {
    throw new DecisionValidationError("Decision inválida.", {
      [field]: "Informe uma coleção de identificadores.",
    });
  }

  const normalized = values.map((value, index) => requiredText(value, `${field}.${index}`));
  const seen = new Set<string>();
  for (const value of normalized) {
    if (seen.has(value)) {
      throw new DecisionValidationError("Decision inválida.", {
        [field]: "Não repita identificadores na coleção.",
      });
    }
    seen.add(value);
  }
  return Object.freeze(normalized);
}

function sameOrderedIds(actual: readonly string[], expected: readonly string[]): boolean {
  return (
    actual.length === expected.length && actual.every((value, index) => value === expected[index])
  );
}

function normalizeTime(value: string): string {
  const normalized = requiredText(value, "chosenOption.startTime");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(normalized)) {
    throw new DecisionValidationError("Decision inválida.", {
      "chosenOption.startTime": "Use o formato HH:mm.",
    });
  }
  return normalized;
}

function freezeRecommendationSnapshot(
  snapshot: RecommendationDecisionContextSnapshot,
): RecommendationDecisionContextSnapshot {
  const tripId = requiredText(snapshot.tripId, "contextSnapshot.tripId");
  const destinationId = requiredText(snapshot.destinationId, "contextSnapshot.destinationId");
  const capturedAt = validDate(snapshot.capturedAt);

  return Object.freeze({
    schemaVersion: 1,
    tripId,
    destinationId,
    tripContextVersion: positiveInteger(
      snapshot.tripContextVersion,
      "contextSnapshot.tripContextVersion",
    ),
    capturedAt,
    ...(snapshot.travelerProfileVersion !== undefined
      ? {
          travelerProfileVersion: positiveInteger(
            snapshot.travelerProfileVersion,
            "contextSnapshot.travelerProfileVersion",
          ),
        }
      : {}),
    ...(snapshot.itineraryVersion !== undefined
      ? {
          itineraryVersion: positiveInteger(
            snapshot.itineraryVersion,
            "contextSnapshot.itineraryVersion",
          ),
        }
      : {}),
  });
}

function freezePlanningRiskSnapshot(
  snapshot: PlanningRiskDecisionContextSnapshot,
): PlanningRiskDecisionContextSnapshot {
  return Object.freeze({
    schemaVersion: 1,
    tripId: requiredText(snapshot.tripId, "contextSnapshot.tripId"),
    planningConflictId: requiredText(
      snapshot.planningConflictId,
      "contextSnapshot.planningConflictId",
    ),
    planningConflictContextFingerprint: normalizeSha256(
      snapshot.planningConflictContextFingerprint,
      "contextSnapshot.planningConflictContextFingerprint",
    ),
    itineraryId: requiredText(snapshot.itineraryId, "contextSnapshot.itineraryId"),
    itineraryVersion: positiveInteger(
      snapshot.itineraryVersion,
      "contextSnapshot.itineraryVersion",
    ),
    policyVersion: requiredText(snapshot.policyVersion, "contextSnapshot.policyVersion"),
    capturedAt: validDate(snapshot.capturedAt),
  });
}

function freezeItineraryProposalSnapshot(
  snapshot: ItineraryProposalDecisionContextSnapshot,
): ItineraryProposalDecisionContextSnapshot {
  return Object.freeze({
    schemaVersion: 1,
    tripId: requiredText(snapshot.tripId, "contextSnapshot.tripId"),
    itineraryId: requiredText(snapshot.itineraryId, "contextSnapshot.itineraryId"),
    itineraryProposalId: requiredText(
      snapshot.itineraryProposalId,
      "contextSnapshot.itineraryProposalId",
    ),
    baseItineraryVersion: positiveInteger(
      snapshot.baseItineraryVersion,
      "contextSnapshot.baseItineraryVersion",
    ),
    requestFingerprint: normalizeSha256(
      snapshot.requestFingerprint,
      "contextSnapshot.requestFingerprint",
    ),
    capturedAt: validDate(snapshot.capturedAt),
  });
}

function freezeSnapshot(
  snapshot: DecisionRecordContextSnapshot,
  option: DecisionOption,
): DecisionRecordContextSnapshot {
  if (option.type === "accept-itinerary-proposal") {
    if (!("itineraryProposalId" in snapshot)) {
      throw new DecisionValidationError("Decision inválida.", {
        contextSnapshot: "Use um snapshot de Itinerary Proposal para esta escolha.",
      });
    }
    const normalized = freezeItineraryProposalSnapshot(snapshot);
    if (normalized.itineraryProposalId !== option.itineraryProposalId) {
      throw new DecisionValidationError("Decision incompatível com o Context Snapshot.", {
        "contextSnapshot.itineraryProposalId":
          "O snapshot deve referenciar a mesma Itinerary Proposal escolhida.",
      });
    }
    return normalized;
  }

  if (option.type === "ignore-planning-risk") {
    if (!("planningConflictId" in snapshot)) {
      throw new DecisionValidationError("Decision inválida.", {
        contextSnapshot: "Use um snapshot de PlanningConflict para ignorar um risco.",
      });
    }
    const normalized = freezePlanningRiskSnapshot(snapshot);
    if (normalized.planningConflictId !== option.planningConflictId) {
      throw new DecisionValidationError("Decision incompatível com o Context Snapshot.", {
        "contextSnapshot.planningConflictId":
          "O snapshot deve referenciar o mesmo PlanningConflict escolhido.",
      });
    }
    return normalized;
  }

  if ("planningConflictId" in snapshot || "itineraryProposalId" in snapshot) {
    throw new DecisionValidationError("Decision inválida.", {
      contextSnapshot: "Use um snapshot de Recommendation para esta escolha.",
    });
  }
  return freezeRecommendationSnapshot(snapshot);
}

function freezeOption(option: DecisionOption): DecisionOption {
  if (option.type === "accept-itinerary-proposal") {
    return Object.freeze({
      type: option.type,
      itineraryProposalId: requiredText(
        option.itineraryProposalId,
        "chosenOption.itineraryProposalId",
      ),
      proposedActivityIds: normalizeOrderedIds(
        option.proposedActivityIds,
        "chosenOption.proposedActivityIds",
      ),
    });
  }

  if (option.type === "ignore-planning-risk") {
    return Object.freeze({
      type: "ignore-planning-risk",
      planningConflictId: requiredText(
        option.planningConflictId,
        "chosenOption.planningConflictId",
      ),
    });
  }

  const placeId = requiredText(option.placeId, "chosenOption.placeId");

  if (option.type === "save-place") {
    return Object.freeze({ type: "save-place", placeId });
  }

  if (option.type !== "add-to-itinerary") {
    throw new DecisionValidationError("Decision inválida.", {
      chosenOption:
        "Use save-place, add-to-itinerary, ignore-planning-risk ou accept-itinerary-proposal.",
    });
  }

  return Object.freeze({
    type: "add-to-itinerary",
    placeId,
    dayId: requiredText(option.dayId, "chosenOption.dayId"),
    ...(option.startTime !== undefined ? { startTime: normalizeTime(option.startTime) } : {}),
    ...(option.durationMinutes !== undefined
      ? {
          durationMinutes: positiveInteger(option.durationMinutes, "chosenOption.durationMinutes"),
        }
      : {}),
  });
}

function freezeItineraryProposalEffect(
  effect: ItineraryProposalAppliedDecisionEffect,
  option: AcceptItineraryProposalDecisionOption,
  snapshot: ItineraryProposalDecisionContextSnapshot,
): ItineraryProposalAppliedDecisionEffect {
  const normalized = Object.freeze({
    type: effect.type,
    proposalApplicationId: requiredText(
      effect.proposalApplicationId,
      "effect.proposalApplicationId",
    ),
    itineraryId: requiredText(effect.itineraryId, "effect.itineraryId"),
    resultingItineraryVersion: positiveInteger(
      effect.resultingItineraryVersion,
      "effect.resultingItineraryVersion",
    ),
    appliedProposedActivityIds: normalizeOrderedIds(
      effect.appliedProposedActivityIds,
      "effect.appliedProposedActivityIds",
    ),
  });

  if (normalized.itineraryId !== snapshot.itineraryId) {
    throw new DecisionValidationError("Efeito incompatível com o Context Snapshot.", {
      "effect.itineraryId": "O efeito deve referenciar o mesmo Itinerary do snapshot.",
    });
  }
  if (normalized.resultingItineraryVersion !== snapshot.baseItineraryVersion + 1) {
    throw new DecisionValidationError("Efeito incompatível com o Context Snapshot.", {
      "effect.resultingItineraryVersion":
        "A versão resultante deve incrementar a versão-base uma única vez.",
    });
  }
  if (!sameOrderedIds(normalized.appliedProposedActivityIds, option.proposedActivityIds)) {
    throw new DecisionValidationError("Efeito incompatível com a opção escolhida.", {
      "effect.appliedProposedActivityIds":
        "Os IDs aplicados devem corresponder, na mesma ordem, aos IDs escolhidos.",
    });
  }

  return normalized;
}

function freezeEffect(
  effect: DecisionEffect,
  option: DecisionOption,
  snapshot: DecisionRecordContextSnapshot,
): DecisionEffect {
  if (
    option.type === "accept-itinerary-proposal" &&
    effect.type === "itinerary-proposal-applied" &&
    "itineraryProposalId" in snapshot
  ) {
    return freezeItineraryProposalEffect(effect, option, snapshot);
  }

  if (option.type === "save-place" && effect.type === "saved-place") {
    return Object.freeze({
      type: "saved-place",
      savedPlaceId: requiredText(effect.savedPlaceId, "effect.savedPlaceId"),
    });
  }

  if (option.type === "add-to-itinerary" && effect.type === "itinerary-activity") {
    return Object.freeze({
      type: "itinerary-activity",
      activityId: requiredText(effect.activityId, "effect.activityId"),
    });
  }

  if (option.type === "ignore-planning-risk" && effect.type === "planning-conflict-ignored") {
    const normalized = Object.freeze({
      type: "planning-conflict-ignored" as const,
      planningConflictId: requiredText(effect.planningConflictId, "effect.planningConflictId"),
    });
    if (normalized.planningConflictId !== option.planningConflictId) {
      throw new DecisionValidationError("Efeito incompatível com a opção escolhida.", {
        effect: "O efeito deve referenciar o mesmo PlanningConflict escolhido.",
      });
    }
    return normalized;
  }

  throw new DecisionValidationError("Efeito incompatível com o tipo da Decision.", {
    effect: "O efeito deve corresponder à opção escolhida.",
  });
}

export function createDecisionId(value: string = randomUUID()): DecisionId {
  return requiredText(value, "decisionId") as DecisionId;
}

export function createDecision(input: CreateDecisionInput): Decision {
  const tripId = requiredText(input.tripId, "tripId");
  const chosenOption = freezeOption(input.chosenOption);
  const contextSnapshot = freezeSnapshot(input.contextSnapshot, chosenOption);
  if (contextSnapshot.tripId !== tripId) {
    throw new DecisionValidationError("Decision incompatível com o Context Snapshot.", {
      "contextSnapshot.tripId": "O snapshot deve pertencer à mesma Trip.",
    });
  }

  const type = chosenOption.type;
  const effect = freezeEffect(input.effect, chosenOption, contextSnapshot);

  return Object.freeze({
    id: createDecisionId(input.id),
    tripId,
    ...(input.recommendationId ? { recommendationId: input.recommendationId } : {}),
    actorParticipantId: requiredText(input.actorParticipantId, "actorParticipantId"),
    decidedAt: validDate(input.decidedAt),
    type,
    chosenOption,
    contextSnapshot,
    effect,
    idempotencyKey: requiredText(input.idempotencyKey, "idempotencyKey"),
  });
}
