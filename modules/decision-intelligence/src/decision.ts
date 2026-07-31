import { randomUUID } from "node:crypto";

import type { DecisionContextSnapshot, RecommendationId } from "./recommendation";

const decisionIdBrand: unique symbol = Symbol("DecisionId");

export type DecisionId = string & { readonly [decisionIdBrand]: true };
export type DecisionType = "save-place" | "add-to-itinerary";

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

export type DecisionOption = SavePlaceDecisionOption | AddToItineraryDecisionOption;

export type DecisionEffect =
  | Readonly<{ type: "saved-place"; savedPlaceId: string }>
  | Readonly<{ type: "itinerary-activity"; activityId: string }>;

export type Decision = Readonly<{
  id: DecisionId;
  tripId: string;
  recommendationId?: RecommendationId;
  actorParticipantId: string;
  decidedAt: Date;
  type: DecisionType;
  chosenOption: DecisionOption;
  contextSnapshot: DecisionContextSnapshot;
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
  contextSnapshot: DecisionContextSnapshot;
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

function freezeSnapshot(snapshot: DecisionContextSnapshot): DecisionContextSnapshot {
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

function freezeOption(option: DecisionOption): DecisionOption {
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
          durationMinutes: positiveInteger(
            option.durationMinutes,
            "chosenOption.durationMinutes",
          ),
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

  throw new DecisionValidationError("Efeito incompatível com o tipo da Decision.", {
    effect: "O efeito deve corresponder à opção escolhida.",
  });
}

export function createDecisionId(value: string = randomUUID()): DecisionId {
  return requiredText(value, "decisionId") as DecisionId;
}

export function createDecision(input: CreateDecisionInput): Decision {
  const tripId = requiredText(input.tripId, "tripId");
  const contextSnapshot = freezeSnapshot(input.contextSnapshot);
  if (contextSnapshot.tripId !== tripId) {
    throw new DecisionValidationError("Decision incompatível com o Context Snapshot.", {
      "contextSnapshot.tripId": "O snapshot deve pertencer à mesma Trip.",
    });
  }

  const chosenOption = freezeOption(input.chosenOption);
  const type = chosenOption.type;

  return Object.freeze({
    id: createDecisionId(input.id),
    tripId,
    ...(input.recommendationId ? { recommendationId: input.recommendationId } : {}),
    actorParticipantId: requiredText(input.actorParticipantId, "actorParticipantId"),
    decidedAt: validDate(input.decidedAt),
    type,
    chosenOption,
    contextSnapshot,
    effect: freezeEffect(input.effect, type),
    idempotencyKey: requiredText(input.idempotencyKey, "idempotencyKey"),
  });
}
