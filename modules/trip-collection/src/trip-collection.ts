import {
  changeTripPlacePreference,
  createTripPlacePreference,
  normalizeTripCollectionIdentifier,
  type TripPlaceIntent,
  type TripPlacePreference,
  type TripPlacePriority,
} from "./trip-place-preference";

export type TripCollection = {
  id: string;
  tripId: string;
  preferences: readonly TripPlacePreference[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTripCollectionInput = {
  tripId: string;
};

export type TripCollectionFactoryOptions = {
  id: string;
  now: Date;
};

export type SetTripPlacePreferenceInput = {
  placeId: string;
  intent: TripPlaceIntent;
  priority?: TripPlacePriority | null;
};

export type SetTripPlacePreferenceOptions = {
  preferenceId?: string;
  now: Date;
};

export function createTripCollection(
  input: CreateTripCollectionInput,
  options: TripCollectionFactoryOptions,
): TripCollection {
  const now = options.now;

  return {
    id: normalizeTripCollectionIdentifier(options.id, "A coleção"),
    tripId: normalizeTripCollectionIdentifier(input.tripId, "A viagem"),
    preferences: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function getTripPlacePreference(
  collection: TripCollection,
  placeId: string,
): TripPlacePreference | null {
  const normalizedPlaceId = normalizeTripCollectionIdentifier(placeId, "O lugar");
  return (
    collection.preferences.find((preference) => preference.placeId === normalizedPlaceId) ?? null
  );
}

export function listTripPlacePreferences(
  collection: TripCollection,
): readonly TripPlacePreference[] {
  return collection.preferences;
}

export function setTripPlacePreference(
  collection: TripCollection,
  input: SetTripPlacePreferenceInput,
  options: SetTripPlacePreferenceOptions,
): TripCollection {
  const placeId = normalizeTripCollectionIdentifier(input.placeId, "O lugar");
  const current = getTripPlacePreference(collection, placeId);
  const now = options.now;

  if (current) {
    const updated = changeTripPlacePreference(current, input, now);
    if (updated === current) return collection;

    return {
      ...collection,
      preferences: collection.preferences.map((preference) =>
        preference.id === updated.id ? updated : preference,
      ),
      updatedAt: now,
    };
  }

  const preference = createTripPlacePreference(
    {
      tripId: collection.tripId,
      placeId,
      intent: input.intent,
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
    },
    {
      id: options.preferenceId ?? "",
      now,
    },
  );

  return {
    ...collection,
    preferences: [...collection.preferences, preference],
    updatedAt: now,
  };
}

export function clearTripPlacePreference(
  collection: TripCollection,
  placeId: string,
  now: Date,
): TripCollection {
  const normalizedPlaceId = normalizeTripCollectionIdentifier(placeId, "O lugar");
  const preferences = collection.preferences.filter(
    (preference) => preference.placeId !== normalizedPlaceId,
  );
  if (preferences.length === collection.preferences.length) return collection;

  return {
    ...collection,
    preferences,
    updatedAt: now,
  };
}
