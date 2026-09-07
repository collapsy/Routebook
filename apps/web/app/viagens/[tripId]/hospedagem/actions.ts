"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DrizzleTripRepository } from "@routebook/database";
import {
  TripValidationError,
  type UpdateAccommodationInput,
  updateAndPersistTripAccommodation,
} from "@routebook/trip-management";

import { prepareAccommodationUpdate } from "@/lib/accommodation-geocoding";
import { NominatimGeocoder } from "@/lib/geocoding";

import type { AccommodationActionState } from "./state";

function optionalText(formData: FormData, field: string): string | undefined {
  const value = String(formData.get(field) ?? "").trim();
  return value || undefined;
}

function optionalCoordinate(formData: FormData, field: string): number | undefined {
  const value = String(formData.get(field) ?? "").trim();
  return value ? Number(value.replace(",", ".")) : undefined;
}

export async function updateAccommodationAction(
  _state: AccommodationActionState,
  formData: FormData,
): Promise<AccommodationActionState> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const accommodationName = String(formData.get("accommodationName") ?? "").trim();
  const accommodationAddress = optionalText(formData, "accommodationAddress");
  const accommodationLatitude = optionalCoordinate(formData, "accommodationLatitude");
  const accommodationLongitude = optionalCoordinate(formData, "accommodationLongitude");
  const repository = new DrizzleTripRepository();

  try {
    const trip = await repository.findById(tripId);
    if (!trip) {
      return { fieldErrors: {}, formError: "A viagem informada não existe." };
    }

    const prepared = await prepareAccommodationUpdate({
      trip,
      accommodationName,
      ...(accommodationAddress !== undefined ? { accommodationAddress } : {}),
      ...(accommodationLatitude !== undefined ? { manualLatitude: accommodationLatitude } : {}),
      ...(accommodationLongitude !== undefined ? { manualLongitude: accommodationLongitude } : {}),
      geocoder: new NominatimGeocoder(),
    });

    const input: UpdateAccommodationInput = prepared.input;
    const updatedTrip = await updateAndPersistTripAccommodation(repository, tripId, input);

    if (!updatedTrip) {
      return { fieldErrors: {}, formError: "A viagem informada não existe." };
    }

    revalidatePath(`/viagens/${tripId}`);
    revalidatePath(`/viagens/${tripId}/hospedagem`);
    revalidatePath(`/viagens/${tripId}/lugares`, "layout");
    revalidatePath(`/viagens/${tripId}/lugares-salvos`);

    const located = ["resolved", "preserved", "manual"].includes(prepared.locationStatus)
      ? "1"
      : prepared.locationStatus === "removed"
        ? undefined
        : "0";
    redirect(
      `/viagens/${tripId}/hospedagem?saved=1${located ? `&located=${located}` : ""}`,
    );
  } catch (error) {
    if (error instanceof TripValidationError) {
      return { fieldErrors: error.fieldErrors };
    }

    console.error("Falha ao atualizar hospedagem da viagem", error);
    return {
      fieldErrors: {},
      formError: "Não foi possível salvar a hospedagem agora. Tente novamente.",
    };
  }
}
