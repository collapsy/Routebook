"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { DrizzleTripStageRepository } from "@routebook/database";
import { TripValidationError, updateTripStageAccommodation } from "@routebook/trip-management";

import {
  prepareAccommodationUpdate,
  type AccommodationLocationStatus,
} from "@/lib/accommodation-geocoding";
import { resolveAccommodationGeocoder } from "@/lib/geocoding";
import { resolveTripRouteAccess } from "@/lib/trip-route-access";

import type { AccommodationActionState } from "@/app/viagens/[tripId]/hospedagem/state";

function lodgingPath(tripId: string, stageId: string): string {
  return `/viagens/${encodeURIComponent(tripId)}/etapas/${encodeURIComponent(stageId)}/hospedagem`;
}

function optionalText(formData: FormData, field: string): string | undefined {
  const value = String(formData.get(field) ?? "").trim();
  return value || undefined;
}

function optionalCoordinate(formData: FormData, field: string): number | undefined {
  const value = optionalText(formData, field);
  return value ? Number(value.replace(",", ".")) : undefined;
}

export async function updateStageAccommodationAction(
  _state: AccommodationActionState,
  formData: FormData,
): Promise<AccommodationActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim();
  if (!tripId || !stageId) notFound();
  const path = lodgingPath(tripId, stageId);
  const access = await resolveTripRouteAccess({ tripId, action: "trip:edit" });
  if (access.status === "unauthenticated") redirect(`/entrar?next=${encodeURIComponent(path)}`);
  if (access.status === "not-found") notFound();

  const stage = await new DrizzleTripStageRepository().findById(tripId, stageId);
  if (!stage) notFound();

  let locationStatus: AccommodationLocationStatus;
  try {
    const accommodationAddress = optionalText(formData, "accommodationAddress");
    const manualLatitude = optionalCoordinate(formData, "accommodationLatitude");
    const manualLongitude = optionalCoordinate(formData, "accommodationLongitude");
    const prepared = await prepareAccommodationUpdate({
      trip: stage,
      accommodationName: String(formData.get("accommodationName") ?? "").trim(),
      ...(accommodationAddress !== undefined ? { accommodationAddress } : {}),
      ...(manualLatitude !== undefined ? { manualLatitude } : {}),
      ...(manualLongitude !== undefined ? { manualLongitude } : {}),
      geocoder: resolveAccommodationGeocoder(),
    });
    locationStatus = prepared.locationStatus;
    const updated = updateTripStageAccommodation(stage, prepared.input);
    const saved = await new DrizzleTripStageRepository().updateAccommodation(
      tripId,
      stageId,
      updated.accommodation,
    );
    if (!saved) return { fieldErrors: {}, formError: "Esta etapa não está mais disponível." };
  } catch (error) {
    if (error instanceof TripValidationError) return { fieldErrors: error.fieldErrors };
    console.error(
      "Falha ao atualizar hospedagem da etapa",
      error instanceof Error ? error.name : "unknown",
    );
    return {
      fieldErrors: {},
      formError: "Não foi possível salvar a hospedagem agora. Tente novamente.",
    };
  }

  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/etapas`);
  revalidatePath(path);
  revalidatePath(`/viagens/${tripId}/lugares`, "layout");
  const located = ["resolved", "preserved", "manual"].includes(locationStatus)
    ? "1"
    : locationStatus === "removed"
      ? undefined
      : "0";
  redirect(`${path}?saved=1${located ? `&located=${located}` : ""}`);
}
