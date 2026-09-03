"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import {
  DrizzleItineraryRepository,
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { removePlaceFromTrip } from "@routebook/saved-places";
import {
  addActivity,
  createItinerary,
  findTripById,
  ItineraryValidationError,
  type Itinerary,
} from "@routebook/trip-management";

function optionalText(value: FormDataEntryValue | null): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || undefined;
}

export async function addSavedPlaceToItineraryAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const dayDate = String(formData.get("dayDate") ?? "").trim();
  const startTime = optionalText(formData.get("startTime"));
  const durationValue = optionalText(formData.get("durationMinutes"));
  const durationMinutes = durationValue === undefined ? undefined : Number(durationValue);
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const savedPlaceRepository = new DrizzleSavedPlaceRepository();
  const savedSelections = await savedPlaceRepository.listByTripId(tripId);
  const place = (
    await new DrizzlePlaceRepository().listByIds(
      savedSelections.map((selection) => selection.placeId),
    )
  ).find((item) => item.slug === placeSlug);
  if (!place) notFound();

  const savedPlace = await savedPlaceRepository.find(tripId, place.id);
  if (!savedPlace) {
    redirect(
      `/viagens/${tripId}/lugares-salvos?erro=${encodeURIComponent(
        "Salve o lugar nesta viagem antes de adicioná-lo ao roteiro.",
      )}`,
    );
  }

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

export async function removeSavedPlaceAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const savedPlaceRepository = new DrizzleSavedPlaceRepository();
  const savedSelections = await savedPlaceRepository.listByTripId(tripId);
  const place = (
    await new DrizzlePlaceRepository().listByIds(
      savedSelections.map((selection) => selection.placeId),
    )
  ).find((item) => item.slug === placeSlug);
  if (!place) notFound();

  await removePlaceFromTrip(savedPlaceRepository, tripId, place.id);

  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/lugares`);
  revalidatePath(`/viagens/${tripId}/lugares/${placeSlug}`);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
  redirect(`/viagens/${tripId}/lugares-salvos?removed=1`);
}
