"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DrizzleTripRepository } from "@routebook/database";
import {
  TripValidationError,
  type UpdateAccommodationInput,
  updateAndPersistTripAccommodation,
} from "@routebook/trip-management";

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

  const input: UpdateAccommodationInput = { accommodationName };

  if (accommodationAddress !== undefined) {
    input.accommodationAddress = accommodationAddress;
  }

  if (accommodationLatitude !== undefined) {
    input.accommodationLatitude = accommodationLatitude;
  }

  if (accommodationLongitude !== undefined) {
    input.accommodationLongitude = accommodationLongitude;
  }

  try {
    const updatedTrip = await updateAndPersistTripAccommodation(
      new DrizzleTripRepository(),
      tripId,
      input,
    );

    if (!updatedTrip) {
      return { fieldErrors: {}, formError: "A viagem informada não existe." };
    }
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

  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/hospedagem`);
  revalidatePath(`/viagens/${tripId}/lugares`, "layout");
  revalidatePath(`/viagens/${tripId}/lugares-salvos`);
  redirect(`/viagens/${tripId}/hospedagem?saved=1`);
}
