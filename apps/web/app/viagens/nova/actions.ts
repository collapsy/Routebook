"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPostgresAuthenticatedTrip } from "@routebook/database";
import { TripValidationError, type Destination } from "@routebook/trip-management";

import { getRouteBookSession } from "@/lib/auth-session";

import type { CreateTripActionState } from "./state";

const PIPA_DESTINATION_FIXTURE = {
  name: "Pipa, Tibau do Sul - RN",
  type: "district",
  countryCode: "BR",
  latitude: -6.2302,
  longitude: -35.0503,
  timeZone: "America/Fortaleza",
} satisfies Destination;

export async function createTripAction(
  _state: CreateTripActionState,
  formData: FormData,
): Promise<CreateTripActionState> {
  const session = await getRouteBookSession();
  if (!session) redirect("/entrar?next=%2Fviagens%2Fnova");

  try {
    await createPostgresAuthenticatedTrip({
      userId: session.user.id,
      trip: {
        name: String(formData.get("name") ?? ""),
        // Fixture transitória da aplicação; RB-INC-174 resolverá o Destination informado pelo usuário.
        destination: PIPA_DESTINATION_FIXTURE,
        startDate: String(formData.get("startDate") ?? ""),
        endDate: String(formData.get("endDate") ?? ""),
        accommodationName: String(formData.get("accommodationName") ?? ""),
        accommodationAddress: String(formData.get("accommodationAddress") ?? ""),
      },
    });
  } catch (error) {
    if (error instanceof TripValidationError) {
      return { fieldErrors: error.fieldErrors };
    }

    console.error("Falha ao criar viagem autenticada", error);
    return {
      fieldErrors: {},
      formError: "Não foi possível salvar a viagem agora. Revise a conexão e tente novamente.",
    };
  }

  revalidatePath("/viagens");
  redirect("/viagens?created=1");
}
