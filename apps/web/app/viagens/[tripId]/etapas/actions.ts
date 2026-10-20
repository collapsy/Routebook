"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { DrizzleTripRepository, DrizzleTripStageRepository } from "@routebook/database";
import {
  createTripStage,
  findTripById,
  TripStageValidationError,
} from "@routebook/trip-management";

import { resolveConfiguredDestinationResolver } from "@/lib/destination-resolver";
import { resolveSelectedDestination } from "@/lib/destination-suggestions";
import { resolveTripRouteAccess } from "@/lib/trip-route-access";

function stagesPath(tripId: string): string {
  return `/viagens/${encodeURIComponent(tripId)}/etapas`;
}

async function authorizedTrip(tripId: string) {
  const access = await resolveTripRouteAccess({ tripId, action: "trip:edit" });
  if (access.status === "unauthenticated") {
    redirect(`/entrar?next=${encodeURIComponent(stagesPath(tripId))}`);
  }
  if (access.status === "not-found") notFound();
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();
  return trip;
}

function revalidateStageViews(tripId: string): void {
  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(`/viagens/${tripId}/etapas`);
  revalidatePath(`/viagens/${tripId}/lugares`);
  revalidatePath(`/viagens/${tripId}/roteiro`);
}

export async function addTripStageAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  if (!tripId) notFound();
  const trip = await authorizedTrip(tripId);
  const destinationQuery = String(formData.get("destination") ?? "").trim();
  const provider = String(formData.get("destinationProvider") ?? "").trim();
  const reference = String(formData.get("destinationReference") ?? "").trim();
  const selectedLabel = String(formData.get("destinationSelectedLabel") ?? "").trim();
  const sessionToken = String(formData.get("destinationSessionToken") ?? "").trim();
  const hasSelection = Boolean(provider || reference || selectedLabel);

  if (destinationQuery.length < 2) redirect(`${stagesPath(tripId)}?erro=destino`);
  let resolution;
  if (hasSelection) {
    if (
      !provider ||
      !reference ||
      !selectedLabel ||
      !sessionToken ||
      selectedLabel !== destinationQuery
    ) {
      redirect(`${stagesPath(tripId)}?erro=selecao`);
    }
    const selected = await resolveSelectedDestination({ provider, reference, sessionToken });
    if (selected.status !== "resolved") redirect(`${stagesPath(tripId)}?erro=destino`);
    resolution = selected;
  } else {
    const configured = resolveConfiguredDestinationResolver();
    if (configured.status !== "configured") redirect(`${stagesPath(tripId)}?erro=indisponivel`);
    const resolved = await configured.resolver.resolve(destinationQuery);
    if (resolved.status !== "resolved") redirect(`${stagesPath(tripId)}?erro=destino`);
    resolution = resolved;
  }

  try {
    const stage = createTripStage(trip, {
      destination: resolution.value.destination,
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
    });
    await new DrizzleTripStageRepository().add(stage, resolution.value.provenance);
  } catch (error) {
    if (error instanceof TripStageValidationError) {
      redirect(`${stagesPath(tripId)}?erro=datas`);
    }
    console.error("Falha ao adicionar etapa da viagem", error);
    redirect(`${stagesPath(tripId)}?erro=salvar`);
  }
  revalidateStageViews(tripId);
  redirect(`${stagesPath(tripId)}?adicionada=1`);
}

export async function removeTripStageAction(formData: FormData): Promise<never> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim();
  if (!tripId || !stageId) notFound();
  await authorizedTrip(tripId);
  const removed = await new DrizzleTripStageRepository().remove(tripId, stageId);
  if (!removed) notFound();
  revalidateStageViews(tripId);
  redirect(`${stagesPath(tripId)}?removida=1`);
}
