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
  changeTripPlacePreference,
  TRIP_PLACE_INTENTS,
  type TripPlaceIntent,
  type TripPlacePreference,
  type TripPlacePriority,
} from "@routebook/trip-collection";
import {
  addActivity,
  createItinerary,
  findTripById,
  ItineraryValidationError,
  type Itinerary,
} from "@routebook/trip-management";

import { resolveTripRouteAccess } from "../../../../lib/trip-route-access";

const tripPlaceIntentSet = new Set<string>(TRIP_PLACE_INTENTS);

function optionalText(value: FormDataEntryValue | null): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || undefined;
}

function parseTripPlaceIntent(value: FormDataEntryValue | null): TripPlaceIntent {
  const intent = typeof value === "string" ? value.trim() : "";
  if (!tripPlaceIntentSet.has(intent)) throw new Error("Intenção de lugar inválida.");
  return intent as TripPlaceIntent;
}

function parseTripPlacePriority(
  value: FormDataEntryValue | null,
  intent: TripPlaceIntent,
): TripPlacePriority | null {
  const priority = typeof value === "string" ? value.trim() : "";
  if (!priority) return null;
  if (priority !== "MUST_DO") throw new Error("Prioridade de lugar inválida.");
  if (intent !== "WANT") throw new Error("Imperdível somente pode ser usado com Quero ir.");
  return "MUST_DO";
}

async function resolveSelectedPlace(
  tripId: string,
  placeSlug: string,
): Promise<{
  trip: NonNullable<Awaited<ReturnType<typeof findTripById>>>;
  place: Awaited<ReturnType<DrizzlePlaceRepository["listByIds"]>>[number];
  preference: TripPlacePreference;
}> {
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

  return { trip, place, preference };
}

function revalidateSelectionSurfaces(tripId: string, placeSlug: string): void {
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/lugares`);
  revalidatePath(`/viagens/${tripId}/lugares/${placeSlug}`);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
}

export async function setSelectionPlacePreferenceAction(formData: FormData): Promise<void> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const { place, preference } = await resolveSelectedPlace(tripId, placeSlug);
  const intent = parseTripPlaceIntent(formData.get("intent"));
  const priority = parseTripPlacePriority(formData.get("priority"), intent);
  const next = changeTripPlacePreference(preference, { intent, priority }, new Date());

  if (next !== preference) {
    await new DrizzleTripPlacePreferenceRepository().save(next);
  }
  revalidateSelectionSurfaces(tripId, place.slug);
}

export async function clearSelectionPlacePreferenceAction(formData: FormData): Promise<void> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const { place } = await resolveSelectedPlace(tripId, placeSlug);

  await new DrizzleTripPlacePreferenceRepository().remove(tripId, place.id);
  revalidateSelectionSurfaces(tripId, place.slug);
}

export async function addSelectedPlaceToItineraryAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const dayDate = String(formData.get("dayDate") ?? "").trim();
  const startTime = optionalText(formData.get("startTime"));
  const durationValue = optionalText(formData.get("durationMinutes"));
  const durationMinutes = durationValue === undefined ? undefined : Number(durationValue);
  const { trip, place } = await resolveSelectedPlace(tripId, placeSlug);

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
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/lugares-salvos?adicionadoAoRoteiro=1`);
}

// Alias transitório para chamadas internas antigas.
export async function addSavedPlaceToItineraryAction(formData: FormData): Promise<never> {
  return addSelectedPlaceToItineraryAction(formData);
}
