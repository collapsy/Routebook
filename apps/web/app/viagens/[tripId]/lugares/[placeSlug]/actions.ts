"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { findPublishedPlace } from "@routebook/place-catalog";
import { removePlaceFromTrip, savePlaceForTrip } from "@routebook/saved-places";
import { findTripById } from "@routebook/trip-management";

function resolveDestinationId(destinationName: string): string | null {
  const normalized = destinationName.trim().toLocaleLowerCase("pt-BR");
  return normalized.includes("pipa") ? "pipa-rn-br" : null;
}

async function resolvePublishedPlace(tripId: string, placeSlug: string) {
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const destinationId = resolveDestinationId(trip.destination.name);
  if (!destinationId) notFound();

  const place = await findPublishedPlace(new DrizzlePlaceRepository(), destinationId, placeSlug);
  if (!place) notFound();

  return place;
}

export async function savePlaceAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const place = await resolvePublishedPlace(tripId, placeSlug);

  await savePlaceForTrip(new DrizzleSavedPlaceRepository(), tripId, place.id);

  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/lugares`);
  revalidatePath(`/viagens/${tripId}/lugares/${placeSlug}`);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
  redirect(`/viagens/${tripId}/lugares/${placeSlug}?saved=1`);
}

export async function removePlaceAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const place = await resolvePublishedPlace(tripId, placeSlug);

  await removePlaceFromTrip(new DrizzleSavedPlaceRepository(), tripId, place.id);

  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/lugares`);
  revalidatePath(`/viagens/${tripId}/lugares/${placeSlug}`);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
  redirect(`/viagens/${tripId}/lugares/${placeSlug}?removed=1`);
}
