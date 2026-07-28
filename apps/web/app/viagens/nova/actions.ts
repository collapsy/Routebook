"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { DrizzleTripRepository } from "@routebook/database";
import { createAndPersistTrip, TripValidationError } from "@routebook/trip-management";

import type { CreateTripActionState } from "./state";

export async function createTripAction(
  _state: CreateTripActionState,
  formData: FormData,
): Promise<CreateTripActionState> {
  try {
    await createAndPersistTrip(new DrizzleTripRepository(), {
      name: String(formData.get("name") ?? ""),
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      ownerName: String(formData.get("ownerName") ?? ""),
      accommodationName: String(formData.get("accommodationName") ?? ""),
      accommodationAddress: String(formData.get("accommodationAddress") ?? ""),
    });
  } catch (error) {
    if (error instanceof TripValidationError) {
      return { fieldErrors: error.fieldErrors };
    }

    console.error("Falha ao criar viagem", error);
    return {
      fieldErrors: {},
      formError: "Não foi possível salvar a viagem agora. Revise a conexão e tente novamente.",
    };
  }

  revalidatePath("/viagens");
  redirect("/viagens?created=1");
}
