"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPostgresAuthenticatedTrip } from "@routebook/database";
import { TripValidationError } from "@routebook/trip-management";

import { getRouteBookSession } from "@/lib/auth-session";
import { resolveConfiguredDestinationResolver } from "@/lib/destination-resolver";
import { resolveSelectedDestination } from "@/lib/destination-suggestions";

import type { CreateTripActionState } from "./state";

function resolverUnavailableMessage(
  reason: "disabled" | "blocked" | "invalid-configuration",
): string {
  if (reason === "disabled")
    return "Selecione um destino sugerido ou tente novamente quando a busca de destinos estiver disponível.";
  if (reason === "blocked")
    return "A busca textual de destinos está bloqueada neste ambiente por segurança. Selecione uma sugestão da lista.";
  return "A busca de destinos está com uma configuração inválida. Selecione uma sugestão da lista ou tente novamente mais tarde.";
}

function selectedDestinationError(
  result:
    | Readonly<{ status: "not-found" }>
    | Readonly<{
        status: "unavailable";
        reason: "blocked" | "misconfigured" | "provider-error" | "invalid-response";
      }>,
): CreateTripActionState {
  if (result.status === "not-found") {
    return {
      fieldErrors: {
        destination: "Não conseguimos confirmar esse destino. Selecione novamente uma sugestão.",
      },
    };
  }
  if (result.reason === "blocked" || result.reason === "misconfigured") {
    return {
      fieldErrors: {},
      formError:
        "A seleção de destinos não está disponível neste ambiente. Seu texto foi preservado; tente novamente mais tarde.",
    };
  }
  return {
    fieldErrors: {},
    formError: "Não foi possível confirmar o destino agora. Tente novamente em instantes.",
  };
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

  const selectedProvider = String(formData.get("destinationProvider") ?? "").trim();
  const selectedReference = String(formData.get("destinationReference") ?? "").trim();
  const selectedLabel = String(formData.get("destinationSelectedLabel") ?? "").trim();
  const selectedSessionToken = String(formData.get("destinationSessionToken") ?? "").trim();
  const hasSelectionData = Boolean(selectedProvider || selectedReference || selectedLabel);

  let resolution;
  if (hasSelectionData) {
    if (
      !selectedProvider ||
      !selectedReference ||
      !selectedLabel ||
      !selectedSessionToken ||
      selectedLabel !== destinationQuery
    ) {
      return {
        fieldErrors: {
          destination:
            "O destino foi alterado depois da seleção. Escolha novamente uma sugestão para continuar.",
        },
      };
    }

    const selectedResolution = await resolveSelectedDestination({
      provider: selectedProvider,
      reference: selectedReference,
      sessionToken: selectedSessionToken,
    });
    if (selectedResolution.status !== "resolved")
      return selectedDestinationError(selectedResolution);
    resolution = { status: "resolved" as const, value: selectedResolution.value };
  } else {
    const configuredResolver = resolveConfiguredDestinationResolver();
    if (configuredResolver.status !== "configured") {
      return {
        fieldErrors: {},
        formError: resolverUnavailableMessage(configuredResolver.reason),
      };
    }

    resolution = await configuredResolver.resolver.resolve(destinationQuery);
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
            "Encontramos destinos parecidos. Selecione uma sugestão ou inclua estado/país para deixar claro qual é.",
        },
      };
    }
    if (resolution.status === "unavailable") {
      return {
        fieldErrors: {},
        formError: "Não foi possível localizar o destino agora. Tente novamente em instantes.",
      };
    }
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
