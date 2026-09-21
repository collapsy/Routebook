"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import {
  DrizzleItineraryRepository,
  DrizzlePlaceRepository,
  DrizzleTripPlacePreferenceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import {
  addActivity,
  createItinerary,
  findTripById,
  ItineraryValidationError,
  type Itinerary,
} from "@routebook/trip-management";

import {
  clearTripPlacePreference,
  parseTripPlaceIntent,
  setTripPlaceMustDo,
  setTripPlacePreference,
  tripPlacePreferenceActionError,
  tripPlacePreferenceActionSuccess,
  type TripPlacePreferenceActionState,
} from "../../../../lib/trip-place-preference";
import { resolveTripRouteAccess } from "../../../../lib/trip-route-access";

function optionalText(value: FormDataEntryValue | null): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || undefined;
}

async function resolveSelectionPlace(tripId: string, placeSlug: string) {
  const selectionPath = `/viagens/${tripId}/lugares-salvos`;
  if (!tripId || !placeSlug) redirect("/viagens?erro=viagem-invalida");

  const access = await resolveTripRouteAccess({ tripId, action: "trip:edit" });
  if (access.status === "unauthenticated") {
    redirect(`/entrar?next=${encodeURIComponent(selectionPath)}`);
  }
  if (access.status === "not-found") notFound();

  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const preferenceRepository = new DrizzleTripPlacePreferenceRepository();
  const preferences = await preferenceRepository.listByTripId(tripId);
  const places = await new DrizzlePlaceRepository().listByIds(
    preferences.map((preference) => preference.placeId),
  );
  const place = places.find((item) => item.slug === placeSlug);
  if (!place) notFound();

  const preference = preferences.find((item) => item.placeId === place.id);
  if (!preference) notFound();

  return { trip, place, preference, preferenceRepository };
}

function revalidateSelectionSurfaces(tripId: string, placeSlug: string): void {
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/lugares`);
  revalidatePath(`/viagens/${tripId}/lugares/${placeSlug}`);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
}

export async function setSelectionPreferenceAction(
  formData: FormData,
): Promise<TripPlacePreferenceActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const intent = parseTripPlaceIntent(String(formData.get("intent") ?? ""));
  const { place, preferenceRepository } = await resolveSelectionPlace(tripId, placeSlug);

  if (!intent) {
    return tripPlacePreferenceActionError("Escolha uma preferência válida para este lugar.");
  }

  const preference = await setTripPlacePreference(preferenceRepository, {
    tripId,
    placeId: place.id,
    intent,
  });

  return tripPlacePreferenceActionSuccess(preference);
}

export async function clearSelectionPreferenceAction(
  formData: FormData,
): Promise<TripPlacePreferenceActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const { place, preferenceRepository } = await resolveSelectionPlace(tripId, placeSlug);

  await clearTripPlacePreference(preferenceRepository, tripId, place.id);

  return tripPlacePreferenceActionSuccess(
    null,
    "Preferência removida. O que já estiver no roteiro continua lá.",
  );
}

export async function setSelectionMustDoAction(
  formData: FormData,
): Promise<TripPlacePreferenceActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const enabled = String(formData.get("enabled") ?? "") === "1";
  const { place, preferenceRepository } = await resolveSelectionPlace(tripId, placeSlug);

  try {
    const preference = await setTripPlaceMustDo(preferenceRepository, {
      tripId,
      placeId: place.id,
      enabled,
    });
      return tripPlacePreferenceActionSuccess(preference);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível atualizar Imperdível.";
    return tripPlacePreferenceActionError(message);
  }
}

export async function addSelectionPlaceToItineraryAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const dayDate = String(formData.get("dayDate") ?? "").trim();
  const startTime = optionalText(formData.get("startTime"));
  const durationValue = optionalText(formData.get("durationMinutes"));
  const durationMinutes = durationValue === undefined ? undefined : Number(durationValue);
  const { trip, place } = await resolveSelectionPlace(tripId, placeSlug);

  const itineraryRepository = new DrizzleItineraryRepository();
  const itinerary =
    (await itineraryRepository.findByTripId(tripId)) ??
    createItinerary({ tripId, period: trip.period });

  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = addActivity(itinerary, {
      dayDate,
      title: place.name,
      type: "place-visit",
      placeId: place.id,
      ...(startTime ? { startTime } : {}),
      ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      const message = Object.values(error.fieldErrors).find(Boolean) ?? error.message;
      redirect(`/viagens/${tripId}/lugares-salvos?erro=${encodeURIComponent(message)}`);
    }
    throw error;
  }

  await itineraryRepository.save(updatedItinerary);
  revalidateSelectionSurfaces(tripId, placeSlug);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/lugares-salvos?adicionadoAoRoteiro=1`);
}
