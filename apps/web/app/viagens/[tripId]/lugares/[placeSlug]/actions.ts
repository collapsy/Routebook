"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import {
  DrizzleItineraryRepository,
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { findPublishedPlace } from "@routebook/place-catalog";
import { removePlaceFromTrip, savePlaceForTrip } from "@routebook/saved-places";
import {
  addActivity,
  createItinerary,
  findTripById,
  ItineraryValidationError,
} from "@routebook/trip-management";

function resolveDestinationId(destinationName: string): string | null {
  const normalized = destinationName.trim().toLocaleLowerCase("pt-BR");
  return normalized.includes("pipa") ? "pipa-rn-br" : null;
}

function optionalText(value: FormDataEntryValue | null): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || undefined;
}

async function resolvePublishedPlace(tripId: string, placeSlug: string) {
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const destinationId = resolveDestinationId(trip.destination.name);
  if (!destinationId) notFound();

  const place = await findPublishedPlace(new DrizzlePlaceRepository(), destinationId, placeSlug);
  if (!place) notFound();

  return { trip, place };
}

function revalidatePlaceSurfaces(tripId: string, placeSlug: string): void {
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/lugares`);
  revalidatePath(`/viagens/${tripId}/lugares/${placeSlug}`);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
}

export async function savePlaceAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const { place } = await resolvePublishedPlace(tripId, placeSlug);

  await savePlaceForTrip(new DrizzleSavedPlaceRepository(), tripId, place.id);

  revalidatePlaceSurfaces(tripId, placeSlug);
  redirect(`/viagens/${tripId}/lugares/${placeSlug}?saved=1#adicionar-ao-roteiro`);
}

export async function removePlaceAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const { place } = await resolvePublishedPlace(tripId, placeSlug);

  await removePlaceFromTrip(new DrizzleSavedPlaceRepository(), tripId, place.id);

  revalidatePlaceSurfaces(tripId, placeSlug);
  redirect(`/viagens/${tripId}/lugares/${placeSlug}?removed=1#adicionar-ao-roteiro`);
}

export async function addPlaceToItineraryAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const dayDate = String(formData.get("dayDate") ?? "").trim();
  const startTime = optionalText(formData.get("startTime"));
  const durationValue = optionalText(formData.get("durationMinutes"));
  const durationMinutes = durationValue === undefined ? undefined : Number(durationValue);
  const { trip, place } = await resolvePublishedPlace(tripId, placeSlug);
  const itineraryRepository = new DrizzleItineraryRepository();
  const itinerary =
    (await itineraryRepository.findByTripId(tripId)) ??
    createItinerary({ tripId, period: trip.period });

  try {
    const updatedItinerary = addActivity(itinerary, {
      dayDate,
      title: place.name,
      type: "place-visit",
      placeId: place.id,
      ...(startTime ? { startTime } : {}),
      ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    });

    await itineraryRepository.save(updatedItinerary);
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      const message = Object.values(error.fieldErrors).find(Boolean) ?? error.message;
      redirect(
        `/viagens/${tripId}/lugares/${placeSlug}?erroRoteiro=${encodeURIComponent(
          message,
        )}#adicionar-ao-roteiro`,
      );
    }

    throw error;
  }

  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  revalidatePath(`/viagens/${tripId}/roteiro/revisao`);
  revalidatePath(`/viagens/${tripId}/lugares/${placeSlug}`);
  redirect(
    `/viagens/${tripId}/lugares/${placeSlug}?adicionadoAoRoteiro=1&dia=${encodeURIComponent(
      dayDate,
    )}#adicionar-ao-roteiro`,
  );
}
