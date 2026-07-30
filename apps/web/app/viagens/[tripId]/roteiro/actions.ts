"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { DrizzleItineraryRepository, DrizzleTripRepository } from "@routebook/database";
import {
  addActivity,
  addFreePeriod,
  createItinerary,
  findTripById,
  ItineraryValidationError,
  moveActivity,
  removeActivity,
  removeFreePeriod,
  reorderActivities,
  updateActivity,
  updateFreePeriod,
  type FreePeriodMode,
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

function redirectWithItineraryError(tripId: string, error: ItineraryValidationError): never {
  redirect(`/viagens/${tripId}/roteiro?erro=${encodeURIComponent(itineraryErrorMessage(error))}`);
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
      redirectWithItineraryError(tripId, error);
    }
    throw error;
  }

  await itineraryRepository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?atividadeCriada=1`);
}

export async function addItineraryFreePeriodAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const dayDate = String(formData.get("freePeriodDayDate") ?? "").trim();
  const mode = String(formData.get("freePeriodMode") ?? "").trim() as FreePeriodMode;
  const startTime = optionalText(formData.get("freePeriodStartTime"));
  const durationValue = optionalText(formData.get("freePeriodDurationMinutes"));
  const durationMinutes = durationValue === undefined ? undefined : Number(durationValue);
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const { repository, itinerary } = await loadItinerary(tripId);
  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = addFreePeriod(itinerary, {
      dayDate,
      mode,
      ...(startTime ? { startTime } : {}),
      ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      redirectWithItineraryError(tripId, error);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?periodoLivreCriado=1`);
}

export async function updateItineraryFreePeriodAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const freePeriodId = String(formData.get("freePeriodId") ?? "").trim();
  const mode = String(formData.get("freePeriodMode") ?? "").trim() as FreePeriodMode;
  const startTime = optionalText(formData.get("freePeriodStartTime"));
  const durationValue = optionalText(formData.get("freePeriodDurationMinutes"));
  const durationMinutes = durationValue === undefined ? undefined : Number(durationValue);
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const { repository, itinerary } = await loadItinerary(tripId);
  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = updateFreePeriod(itinerary, {
      freePeriodId,
      mode,
      ...(startTime ? { startTime } : {}),
      ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      redirectWithItineraryError(tripId, error);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?periodoLivreEditado=1`);
}

export async function removeItineraryFreePeriodAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const freePeriodId = String(formData.get("freePeriodId") ?? "").trim();
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const { repository, itinerary } = await loadItinerary(tripId);
  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = removeFreePeriod(itinerary, { freePeriodId });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      redirectWithItineraryError(tripId, error);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?periodoLivreRemovido=1`);
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
      redirectWithItineraryError(tripId, error);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?atividadeEditada=1`);
}

export async function reorderItineraryActivitiesAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const activityId = String(formData.get("activityId") ?? "").trim();
  const targetActivityId = String(formData.get("targetActivityId") ?? "").trim();
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const { repository, itinerary } = await loadItinerary(tripId);
  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = reorderActivities(itinerary, { activityId, targetActivityId });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      redirectWithItineraryError(tripId, error);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?atividadeReordenada=1`);
}

export async function moveItineraryActivityAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const activityId = String(formData.get("activityId") ?? "").trim();
  const targetDayDate = String(formData.get("targetDayDate") ?? "").trim();
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const { repository, itinerary } = await loadItinerary(tripId);
  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = moveActivity(itinerary, { activityId, targetDayDate });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      redirectWithItineraryError(tripId, error);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?atividadeMovida=1`);
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
      redirectWithItineraryError(tripId, error);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirect(`/viagens/${tripId}/roteiro?atividadeRemovida=1`);
}
