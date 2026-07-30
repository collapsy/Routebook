"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { DrizzleItineraryRepository, DrizzleTripRepository } from "@routebook/database";
import {
  addActivity,
  createItinerary,
  findTripById,
  ItineraryValidationError,
} from "@routebook/trip-management";

function optionalText(value: FormDataEntryValue | null): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || undefined;
}

export async function addManualActivityAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const dayDate = String(formData.get("dayDate") ?? "").trim();
  const title = String(formData.get("title") ?? "");
  const startTime = optionalText(formData.get("startTime"));
  const durationValue = optionalText(formData.get("durationMinutes"));
  const durationMinutes = durationValue === undefined ? undefined : Number(durationValue);
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const itineraryRepository = new DrizzleItineraryRepository();
  const itinerary =
    (await itineraryRepository.findByTripId(tripId)) ??
    createItinerary({ tripId, period: trip.period });

  let updatedItinerary;
  try {
    updatedItinerary = addActivity(itinerary, {
      dayDate,
      title,
      type: "custom",
      ...(startTime ? { startTime } : {}),
      ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      const message = Object.values(error.fieldErrors).find(Boolean) ?? error.message;
      redirect(`/viagens/${tripId}/roteiro?erro=${encodeURIComponent(message)}`);
    }

    throw error;
  }

  await itineraryRepository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?atividadeCriada=1`);
}
