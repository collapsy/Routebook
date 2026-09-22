import { randomUUID } from "node:crypto";

import {
  changeTripPlacePreference,
  createTripPlacePreference,
  TripPlacePreferenceValidationError,
  TRIP_PLACE_INTENTS,
  type TripPlaceIntent,
  type TripPlacePreference,
  type TripPlacePreferenceRepository,
  type TripPlacePriority,
} from "@routebook/trip-collection";

export async function setTripPlacePreference(
  repository: TripPlacePreferenceRepository,
  input: Readonly<{
    tripId: string;
    placeId: string;
    intent: TripPlaceIntent;
    priority?: TripPlacePriority | null;
  }>,
  now = new Date(),
): Promise<TripPlacePreference> {
  const current = await repository.find(input.tripId, input.placeId);
  const priority =
    input.priority === undefined
      ? current?.intent === "WANT" && input.intent === "WANT"
        ? current.priority
        : null
      : input.priority;
  const next = current
    ? changeTripPlacePreference(current, { intent: input.intent, priority }, now)
    : createTripPlacePreference(
        {
          tripId: input.tripId,
          placeId: input.placeId,
          intent: input.intent,
          priority,
        },
        { id: randomUUID(), now },
      );

  if (current === next) return current;
  return repository.save(next);
}

export async function setTripPlaceMustDo(
  repository: TripPlacePreferenceRepository,
  input: Readonly<{
    tripId: string;
    placeId: string;
    enabled: boolean;
  }>,
  now = new Date(),
): Promise<TripPlacePreference> {
  const current = await repository.find(input.tripId, input.placeId);
  if (!current || current.intent !== "WANT") {
    throw new TripPlacePreferenceValidationError(
      "Marque Quero ir antes de definir este lugar como Imperdível.",
    );
  }

  const next = changeTripPlacePreference(
    current,
    { intent: "WANT", priority: input.enabled ? "MUST_DO" : null },
    now,
  );
  if (next === current) return current;
  return repository.save(next);
}

export async function clearTripPlacePreference(
  repository: TripPlacePreferenceRepository,
  tripId: string,
  placeId: string,
): Promise<void> {
  await repository.remove(tripId, placeId);
}

export function parseTripPlaceIntent(value: string): TripPlaceIntent | null {
  const normalized = value.trim();
  return TRIP_PLACE_INTENTS.includes(normalized as TripPlaceIntent)
    ? (normalized as TripPlaceIntent)
    : null;
}

export type TripPlacePreferenceActionState =
  | Readonly<{
      status: "success";
      message: string;
      preference: Readonly<{
        intent: TripPlaceIntent;
        priority: TripPlacePriority | null;
      }> | null;
    }>
  | Readonly<{
      status: "error";
      message: string;
    }>;

export function tripPlacePreferenceActionSuccess(
  preference: Pick<TripPlacePreference, "intent" | "priority"> | null,
  message = "Preferência atualizada.",
): TripPlacePreferenceActionState {
  return {
    status: "success",
    message,
    preference: preference ? { intent: preference.intent, priority: preference.priority } : null,
  };
}

export function tripPlacePreferenceActionError(message: string): TripPlacePreferenceActionState {
  return { status: "error", message };
}
