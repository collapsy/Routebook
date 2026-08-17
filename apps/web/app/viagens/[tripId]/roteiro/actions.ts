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

function findActivityDayDate(itinerary: Itinerary, activityId: string): string | undefined {
  return itinerary.days.find((day) => day.activities.some((activity) => activity.id === activityId))
    ?.date;
}

function findFreePeriodDayDate(itinerary: Itinerary, freePeriodId: string): string | undefined {
  return itinerary.days.find((day) =>
    day.freePeriods.some((freePeriod) => freePeriod.id === freePeriodId),
  )?.date;
}

function redirectToItinerary(
  tripId: string,
  status: Readonly<Record<string, string>>,
  dayDate?: string,
): never {
  const query = new URLSearchParams(status);
  if (dayDate) query.set("dia", dayDate);
  redirect(`/viagens/${tripId}/roteiro?${query.toString()}`);
}

function redirectWithItineraryError(
  tripId: string,
  error: ItineraryValidationError,
  dayDate?: string,
): never {
  redirectToItinerary(tripId, { erro: itineraryErrorMessage(error) }, dayDate);
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
      redirectWithItineraryError(tripId, error, dayDate);
    }
    throw error;
  }

  await itineraryRepository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirectToItinerary(tripId, { atividadeCriada: "1" }, dayDate);
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
      redirectWithItineraryError(tripId, error, dayDate);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirectToItinerary(tripId, { periodoLivreCriado: "1" }, dayDate);
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
  const dayDate = findFreePeriodDayDate(itinerary, freePeriodId);
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
      redirectWithItineraryError(tripId, error, dayDate);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirectToItinerary(tripId, { periodoLivreEditado: "1" }, dayDate);
}

export async function removeItineraryFreePeriodAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const freePeriodId = String(formData.get("freePeriodId") ?? "").trim();
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const { repository, itinerary } = await loadItinerary(tripId);
  const dayDate = findFreePeriodDayDate(itinerary, freePeriodId);
  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = removeFreePeriod(itinerary, { freePeriodId });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      redirectWithItineraryError(tripId, error, dayDate);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirectToItinerary(tripId, { periodoLivreRemovido: "1" }, dayDate);
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
  const dayDate = findActivityDayDate(itinerary, activityId);
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
      redirectWithItineraryError(tripId, error, dayDate);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirectToItinerary(tripId, { atividadeEditada: "1" }, dayDate);
}

export async function reorderItineraryActivitiesAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const activityId = String(formData.get("activityId") ?? "").trim();
  const targetActivityId = String(formData.get("targetActivityId") ?? "").trim();
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const { repository, itinerary } = await loadItinerary(tripId);
  const dayDate = findActivityDayDate(itinerary, activityId);
  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = reorderActivities(itinerary, { activityId, targetActivityId });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      redirectWithItineraryError(tripId, error, dayDate);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirectToItinerary(tripId, { atividadeReordenada: "1" }, dayDate);
}

export async function moveItineraryActivityAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const activityId = String(formData.get("activityId") ?? "").trim();
  const targetDayDate = String(formData.get("targetDayDate") ?? "").trim();
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const { repository, itinerary } = await loadItinerary(tripId);
  const sourceDayDate = findActivityDayDate(itinerary, activityId);
  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = moveActivity(itinerary, { activityId, targetDayDate });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      redirectWithItineraryError(tripId, error, sourceDayDate);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirectToItinerary(tripId, { atividadeMovida: "1" }, targetDayDate);
}

export async function removeItineraryActivityAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const activityId = String(formData.get("activityId") ?? "").trim();
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const { repository, itinerary } = await loadItinerary(tripId);
  const dayDate = findActivityDayDate(itinerary, activityId);
  let updatedItinerary: Itinerary;
  try {
    updatedItinerary = removeActivity(itinerary, { activityId });
  } catch (error) {
    if (error instanceof ItineraryValidationError) {
      redirectWithItineraryError(tripId, error, dayDate);
    }
    throw error;
  }

  await repository.save(updatedItinerary);
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
  redirectToItinerary(tripId, { atividadeRemovida: "1" }, dayDate);
}
