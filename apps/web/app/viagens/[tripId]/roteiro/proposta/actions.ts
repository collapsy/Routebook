"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { DrizzleItineraryProposalRepository } from "@routebook/database";
import {
  createItineraryProposalId,
  ItineraryProposalApplicationError,
  ItineraryProposalTransitionError,
  ItineraryProposalValidationError,
  rejectAndPersistItineraryProposal,
} from "@routebook/proposal-management";

import { resolveTripRouteAccess } from "../../../../../lib/trip-route-access";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function itineraryPath(tripId: string): string {
  return `/viagens/${tripId}/roteiro`;
}

export async function discardItineraryProposalAction(
  tripId: string,
  formData: FormData,
): Promise<never> {
  const access = await resolveTripRouteAccess({ tripId, action: "trip:accept-proposal" });
  if (access.status === "unauthenticated") {
    redirect(`/entrar?next=${encodeURIComponent(`${itineraryPath(tripId)}/proposta`)}`);
  }
  if (access.status === "not-found") notFound();

  const itineraryProposalId = String(formData.get("itineraryProposalId") ?? "").trim();
  if (!uuidPattern.test(itineraryProposalId)) {
    redirect(`${itineraryPath(tripId)}?erroProposta=referencia-invalida`);
  }

  let errorCode: "proposta-nao-encontrada" | "estado-atualizado" | null = null;
  try {
    await rejectAndPersistItineraryProposal(new DrizzleItineraryProposalRepository(), {
      tripId,
      itineraryProposalId: createItineraryProposalId(itineraryProposalId),
      rejectedAt: new Date(),
    });
  } catch (error) {
    if (error instanceof ItineraryProposalApplicationError) {
      errorCode = "proposta-nao-encontrada";
    } else if (
      error instanceof ItineraryProposalTransitionError ||
      error instanceof ItineraryProposalValidationError
    ) {
      errorCode = "estado-atualizado";
    } else {
      throw error;
    }
  }

  if (errorCode) {
    redirect(`${itineraryPath(tripId)}?erroProposta=${errorCode}`);
  }

  revalidatePath(`/viagens/${tripId}`);
  revalidatePath(itineraryPath(tripId));
  revalidatePath(`${itineraryPath(tripId)}/proposta`);
  redirect(`${itineraryPath(tripId)}?propostaDescartada=1`);
}
