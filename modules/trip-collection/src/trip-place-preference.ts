export const TRIP_PLACE_INTENTS = ["WANT", "MAYBE", "NOT_INTERESTED"] as const;
export const TRIP_PLACE_PRIORITIES = ["MUST_DO"] as const;

export type TripPlaceIntent = (typeof TRIP_PLACE_INTENTS)[number];
export type TripPlacePriority = (typeof TRIP_PLACE_PRIORITIES)[number];

export type TripPlacePreference = {
  id: string;
  tripId: string;
  placeId: string;
  intent: TripPlaceIntent;
  priority: TripPlacePriority | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TripPlacePreferenceInput = {
  tripId: string;
  placeId: string;
  intent: TripPlaceIntent;
  priority?: TripPlacePriority | null;
};

export type TripPlacePreferenceChange = {
  intent: TripPlaceIntent;
  priority?: TripPlacePriority | null;
};

export type TripPlacePreferenceFactoryOptions = {
  id: string;
  now: Date;
};

export class TripPlacePreferenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TripPlacePreferenceValidationError";
  }
}

const INTENT_SET = new Set<string>(TRIP_PLACE_INTENTS);
const PRIORITY_SET = new Set<string>(TRIP_PLACE_PRIORITIES);

export function normalizeTripCollectionIdentifier(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new TripPlacePreferenceValidationError(`${label} é obrigatório.`);
  }
  return normalized;
}

function normalizePreference(
  input: Pick<TripPlacePreferenceInput, "intent" | "priority">,
): Pick<TripPlacePreference, "intent" | "priority"> {
  if (!INTENT_SET.has(input.intent)) {
    throw new TripPlacePreferenceValidationError("Informe uma intenção válida para o lugar.");
  }

  const priority = input.priority ?? null;
  if (priority !== null && !PRIORITY_SET.has(priority)) {
    throw new TripPlacePreferenceValidationError("Informe uma prioridade válida para o lugar.");
  }
  if (priority === "MUST_DO" && input.intent !== "WANT") {
    throw new TripPlacePreferenceValidationError(
      "A prioridade MUST_DO somente pode ser aplicada à intenção WANT.",
    );
  }

  return { intent: input.intent, priority };
}

export function createTripPlacePreference(
  input: TripPlacePreferenceInput,
  options: TripPlacePreferenceFactoryOptions,
): TripPlacePreference {
  const id = normalizeTripCollectionIdentifier(options.id, "A preferência");
  const tripId = normalizeTripCollectionIdentifier(input.tripId, "A viagem");
  const placeId = normalizeTripCollectionIdentifier(input.placeId, "O lugar");
  const preference = normalizePreference(input);
  const now = options.now;

  return {
    id,
    tripId,
    placeId,
    ...preference,
    createdAt: now,
    updatedAt: now,
  };
}

export function changeTripPlacePreference(
  preference: TripPlacePreference,
  change: TripPlacePreferenceChange,
  now: Date,
): TripPlacePreference {
  const normalized = normalizePreference(change);
  if (preference.intent === normalized.intent && preference.priority === normalized.priority) {
    return preference;
  }

  return {
    ...preference,
    ...normalized,
    updatedAt: now,
  };
}
