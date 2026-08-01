import { randomUUID } from "node:crypto";

import type {
  DecisionContextSnapshot as RecommendationDecisionContextSnapshot,
  RecommendationId,
} from "./recommendation";

const decisionIdBrand: unique symbol = Symbol("DecisionId");

export type DecisionId = string & { readonly [decisionIdBrand]: true };
export type DecisionType = "save-place" | "add-to-itinerary" | "ignore-planning-risk";

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

export type DecisionRecordContextSnapshot =
  RecommendationDecisionContextSnapshot | PlanningRiskDecisionContextSnapshot;

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

export type DecisionOption =
  SavePlaceDecisionOption | AddToItineraryDecisionOption | IgnorePlanningRiskDecisionOption;

export type DecisionEffect =
  | Readonly<{ type: "saved-place"; savedPlaceId: string }>
  | Readonly<{ type: "itinerary-activity"; activityId: string }>
  | Readonly<{ type: "planning-conflict-ignored"; planningConflictId: string }>;

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
  const fingerprint = requiredText(
    snapshot.planningConflictContextFingerprint,
    "contextSnapshot.planningConflictContextFingerprint",
  ).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(fingerprint)) {
    throw new DecisionValidationError("Decision inválida.", {
      "contextSnapshot.planningConflictContextFingerprint":
        "Use um SHA-256 hexadecimal com 64 caracteres.",
    });
  }

  return Object.freeze({
    schemaVersion: 1,
    tripId: requiredText(snapshot.tripId, "contextSnapshot.tripId"),
    planningConflictId: requiredText(
      snapshot.planningConflictId,
      "contextSnapshot.planningConflictId",
    ),
    planningConflictContextFingerprint: fingerprint,
    itineraryId: requiredText(snapshot.itineraryId, "contextSnapshot.itineraryId"),
    itineraryVersion: positiveInteger(
      snapshot.itineraryVersion,
      "contextSnapshot.itineraryVersion",
    ),
    policyVersion: requiredText(snapshot.policyVersion, "contextSnapshot.policyVersion"),
    capturedAt: validDate(snapshot.capturedAt),
  });
}

function freezeSnapshot(
  snapshot: DecisionRecordContextSnapshot,
  option: DecisionOption,
): DecisionRecordContextSnapshot {
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

  if ("planningConflictId" in snapshot) {
    throw new DecisionValidationError("Decision inválida.", {
      contextSnapshot: "Use um snapshot de Recommendation para esta escolha.",
    });
  }
  return freezeRecommendationSnapshot(snapshot);
}

function freezeOption(option: DecisionOption): DecisionOption {
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
      chosenOption: "Use save-place ou add-to-itinerary.",
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

function freezeEffect(effect: DecisionEffect, type: DecisionType): DecisionEffect {
  if (type === "save-place" && effect.type === "saved-place") {
    return Object.freeze({
      type: "saved-place",
      savedPlaceId: requiredText(effect.savedPlaceId, "effect.savedPlaceId"),
    });
  }

  if (type === "add-to-itinerary" && effect.type === "itinerary-activity") {
    return Object.freeze({
      type: "itinerary-activity",
      activityId: requiredText(effect.activityId, "effect.activityId"),
    });
  }

  if (type === "ignore-planning-risk" && effect.type === "planning-conflict-ignored") {
    return Object.freeze({
      type: "planning-conflict-ignored",
      planningConflictId: requiredText(effect.planningConflictId, "effect.planningConflictId"),
    });
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
  const effect = freezeEffect(input.effect, type);
  if (
    type === "ignore-planning-risk" &&
    effect.type === "planning-conflict-ignored" &&
    effect.planningConflictId !== chosenOption.planningConflictId
  ) {
    throw new DecisionValidationError("Efeito incompatível com a opção escolhida.", {
      effect: "O efeito deve referenciar o mesmo PlanningConflict escolhido.",
    });
  }

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
