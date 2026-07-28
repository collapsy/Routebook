"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DrizzleTravelerProfileRepository, DrizzleTripRepository } from "@routebook/database";
import {
  saveAndPersistTravelerProfile,
  TravelerProfileValidationError,
} from "@routebook/traveler-profile";
import { findTripById } from "@routebook/trip-management";

import type { TravelerContextActionState } from "./state";

function parseBudget(value: string): number | undefined {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  if (!normalized) return undefined;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export async function saveTravelerContextAction(
  _state: TravelerContextActionState,
  formData: FormData,
): Promise<TravelerContextActionState> {
  const tripId = String(formData.get("tripId") ?? "");

  try {
    const trip = await findTripById(new DrizzleTripRepository(), tripId);
    if (!trip) return { fieldErrors: {}, formError: "A viagem informada não existe." };

    await saveAndPersistTravelerProfile(new DrizzleTravelerProfileRepository(), {
      tripId,
      travelerCount: Number(formData.get("travelerCount") ?? 0),
      interests: formData.getAll("interests").map(String),
      pace: String(formData.get("pace") ?? "") || undefined,
      transportPreference: String(formData.get("transportPreference") ?? "") || undefined,
      budgetTotalCents: parseBudget(String(formData.get("budget") ?? "")),
    });
  } catch (error) {
    if (error instanceof TravelerProfileValidationError) {
      return { fieldErrors: error.fieldErrors };
    }

    console.error("Falha ao salvar contexto da viagem", error);
    return {
      fieldErrors: {},
      formError: "Não foi possível salvar o contexto agora. Tente novamente.",
    };
  }

  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/contexto`);
  redirect(`/viagens/${tripId}?contextUpdated=1`);
}
