"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { DrizzleItineraryRepository, DrizzleTripRepository } from "@routebook/database";
import {
  addActivity,
  createItinerary,
  findTripById,
  ItineraryValidationError,
  removeActivity,
  updateActivity,
  type Itinerary,
} from "@routebook/trip-management";

function optionalText(value: FormDataEntryValue | null): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || undefined;
}

function itineraryErrorMessage(error: ItineraryValidationError): string {
  return Object.values(error.fieldErrors).find(Boolean) ?? error.message;
}

async function loadItinerary(tripId: string): Promise<{
  repository: DrizzleItineraryRepository;
  itinerary: Itinerary;
}> {
  const repository = new DrizzleItineraryRepository();
  const itinerary = await repository.findByTripId(tripId);
  if (!itinerary) notFound();
  return { repository, itinerary };
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

  let updatedItinerary: Itinerary;
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
      redirect(
        `/viagens/${tripId}/roteiro?erro=${encodeURIComponent(itineraryErrorMessage(error))}`,
      );
    }

    throw error;
  }

  await itineraryRepository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?atividadeCriada=1`);
}

export async function updateItineraryActivityAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const activityId = String(formData.get("activityId") ?? "").trim();
  const title = String(formData.get("title") ?? "");
  const startTime = optionalText(formData.get("startTime"));
  const durationValue = optionalText(formData.get("durationMinutes"));
  const durationMinutes = durationValue === undefined ? undefined : Number(durationValue);
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const { repository, itinerary } = await loadItinerary(tripId);
  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = updateActivity(itinerary, {
      activityId,
      title,
      ...(startTime ? { startTime } : {}),
      ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      redirect(
        `/viagens/${tripId}/roteiro?erro=${encodeURIComponent(itineraryErrorMessage(error))}`,
      );
    }

    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?atividadeEditada=1`);
}

export async function removeItineraryActivityAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const activityId = String(formData.get("activityId") ?? "").trim();
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const { repository, itinerary } = await loadItinerary(tripId);
  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = removeActivity(itinerary, { activityId });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      redirect(
        `/viagens/${tripId}/roteiro?erro=${encodeURIComponent(itineraryErrorMessage(error))}`,
      );
    }

    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?atividadeRemovida=1`);
}
