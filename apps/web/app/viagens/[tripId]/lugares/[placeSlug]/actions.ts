"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import {
  DrizzleItineraryRepository,
  DrizzlePlaceRepository,
  DrizzleTripPlacePreferenceRepository,
  DrizzleTripRepository,
  DrizzleTripStageRepository,
} from "@routebook/database";
import {
  addActivity,
  createItinerary,
  findTripById,
  ItineraryValidationError,
} from "@routebook/trip-management";

import { resolveTripRouteAccess } from "../../../../../lib/trip-route-access";
import {
  clearTripPlacePreference,
  parseTripPlaceIntent,
  setTripPlaceMustDo,
  setTripPlacePreference,
  tripPlacePreferenceActionError,
  tripPlacePreferenceActionSuccess,
  type TripPlacePreferenceActionState,
} from "../../../../../lib/trip-place-preference";
import { selectTripDiscoveryScope } from "../../../../../lib/trip-stage-discovery";

function optionalText(value: FormDataEntryValue | null): string | undefined {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || undefined;
}

async function resolvePlaceForTrip(tripId: string, placeSlug: string, stageId?: string) {
  const placePath = `/viagens/${tripId}/lugares/${placeSlug}`;
  if (!tripId || !placeSlug) redirect("/viagens?erro=viagem-invalida");

  const access = await resolveTripRouteAccess({ tripId, action: "trip:edit" });
  if (access.status === "unauthenticated") {
    redirect(`/entrar?next=${encodeURIComponent(placePath)}`);
  }
  if (access.status === "not-found") notFound();

  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const stages = await new DrizzleTripStageRepository().listByTripId(tripId);
  const stage = stageId ? stages.find((candidate) => candidate.id === stageId) : undefined;
  const scope = selectTripDiscoveryScope(trip, stages, stageId);
  if (!scope) notFound();
  const regionResolution = scope.regionResolution;
  if (regionResolution.status !== "resolved") notFound();
  const place = await new DrizzlePlaceRepository().findBySlugWithinRadius(placeSlug, {
    center: regionResolution.region.center,
    radiusMeters: regionResolution.region.curatedRadiusMeters,
  });
  if (!place) notFound();

  return { trip, place, stage };
}

export async function setPlacePreferenceAction(
  formData: FormData,
): Promise<TripPlacePreferenceActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim() || undefined;
  const intent = parseTripPlaceIntent(String(formData.get("intent") ?? ""));
  const { place } = await resolvePlaceForTrip(tripId, placeSlug, stageId);
  if (!intent) {
    return tripPlacePreferenceActionError("Escolha uma preferência válida para este lugar.");
  }

  const preference = await setTripPlacePreference(new DrizzleTripPlacePreferenceRepository(), {
    tripId,
    placeId: place.id,
    intent,
  });

  revalidatePath(`/viagens/${tripId}/lugares`);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
  revalidatePath(`/viagens/${tripId}/lugares/${placeSlug}`);
  return tripPlacePreferenceActionSuccess(preference);
}

export async function clearPlacePreferenceAction(
  formData: FormData,
): Promise<TripPlacePreferenceActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim() || undefined;
  const { place } = await resolvePlaceForTrip(tripId, placeSlug, stageId);

  await clearTripPlacePreference(new DrizzleTripPlacePreferenceRepository(), tripId, place.id);

  revalidatePath(`/viagens/${tripId}/lugares`);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
  revalidatePath(`/viagens/${tripId}/lugares/${placeSlug}`);
  return tripPlacePreferenceActionSuccess(
    null,
    "Preferência removida. O que já estiver no roteiro continua lá.",
  );
}

export async function setPlaceMustDoAction(
  formData: FormData,
): Promise<TripPlacePreferenceActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim() || undefined;
  const enabled = String(formData.get("enabled") ?? "") === "1";
  const { place } = await resolvePlaceForTrip(tripId, placeSlug, stageId);

  const preference = await setTripPlaceMustDo(new DrizzleTripPlacePreferenceRepository(), {
    tripId,
    placeId: place.id,
    enabled,
  });

  revalidatePath(`/viagens/${tripId}/lugares`);
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
  revalidatePath(`/viagens/${tripId}/lugares/${placeSlug}`);
  return tripPlacePreferenceActionSuccess(preference);
}

export async function addPlaceToItineraryAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const placeSlug = String(formData.get("placeSlug") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim() || undefined;
  const dayDate = String(formData.get("dayDate") ?? "").trim();
  const startTime = optionalText(formData.get("startTime"));
  const durationValue = optionalText(formData.get("durationMinutes"));
  const durationMinutes = durationValue === undefined ? undefined : Number(durationValue);
  const { trip, place, stage } = await resolvePlaceForTrip(tripId, placeSlug, stageId);
  const stageQuery = stageId ? `&etapa=${encodeURIComponent(stageId)}` : "";
  if (stage && (dayDate < stage.startDate || dayDate > stage.endDate)) {
    redirect(
      `/viagens/${tripId}/lugares/${placeSlug}?erroRoteiro=${encodeURIComponent(
        "Escolha um dia da visita a este destino.",
      )}${stageQuery}#adicionar-ao-roteiro`,
    );
  }
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
        )}${stageQuery}#adicionar-ao-roteiro`,
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
    )}${stageQuery}#adicionar-ao-roteiro`,
  );
}
