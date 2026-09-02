"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPostgresAuthenticatedTrip } from "@routebook/database";
import { TripValidationError } from "@routebook/trip-management";

import { getRouteBookSession } from "@/lib/auth-session";
import { resolveConfiguredDestinationResolver } from "@/lib/destination-resolver";

import type { CreateTripActionState } from "./state";

function resolverUnavailableMessage(
  reason: "disabled" | "blocked" | "invalid-configuration",
): string {
  if (reason === "disabled") return "A busca de destinos ainda não está habilitada neste ambiente.";
  if (reason === "blocked")
    return "A busca de destinos está bloqueada neste ambiente por segurança.";
  return "A busca de destinos está com uma configuração inválida.";
}

export async function createTripAction(
  _state: CreateTripActionState,
  formData: FormData,
): Promise<CreateTripActionState> {
  const session = await getRouteBookSession();
  if (!session) redirect("/entrar?next=%2Fviagens%2Fnova");

  const destinationQuery = String(formData.get("destination") ?? "").trim();
  if (destinationQuery.length < 2) {
    return { fieldErrors: { destination: "Informe para onde você vai." } };
  }

  const configuredResolver = resolveConfiguredDestinationResolver();
  if (configuredResolver.status !== "configured") {
    return {
      fieldErrors: {},
      formError: resolverUnavailableMessage(configuredResolver.reason),
    };
  }

  const resolution = await configuredResolver.resolver.resolve(destinationQuery);
  if (resolution.status === "not-found") {
    return {
      fieldErrors: {
        destination: "Não encontramos esse destino. Tente incluir cidade, estado ou país.",
      },
    };
  }
  if (resolution.status === "ambiguous") {
    return {
      fieldErrors: {
        destination:
          "Encontramos destinos parecidos. Inclua estado ou país para deixar claro qual é.",
      },
    };
  }
  if (resolution.status === "unavailable") {
    return {
      fieldErrors: {},
      formError: "Não foi possível localizar o destino agora. Tente novamente em instantes.",
    };
  }

  try {
    const requestedName = String(formData.get("name") ?? "").trim();
    await createPostgresAuthenticatedTrip({
      userId: session.user.id,
      destinationProvenance: resolution.value.provenance,
      trip: {
        name: requestedName || resolution.value.destination.name,
        destination: resolution.value.destination,
        startDate: String(formData.get("startDate") ?? ""),
        endDate: String(formData.get("endDate") ?? ""),
        accommodationName: String(formData.get("accommodationName") ?? ""),
        accommodationAddress: String(formData.get("accommodationAddress") ?? ""),
      },
    });
  } catch (error) {
    if (error instanceof TripValidationError) return { fieldErrors: error.fieldErrors };

    console.error("Falha ao criar viagem autenticada", error);
    return {
      fieldErrors: {},
      formError: "Não foi possível salvar a viagem agora. Revise a conexão e tente novamente.",
    };
  }

  revalidatePath("/viagens");
  redirect("/viagens?created=1");
}
