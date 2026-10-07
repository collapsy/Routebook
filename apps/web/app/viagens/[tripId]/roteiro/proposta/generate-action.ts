"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createPostgresAuthoritativeItineraryProposalGenerationService,
  DrizzleItineraryRepository,
  DrizzleTripRepository,
} from "@routebook/database";

import {
  executeGenerateItineraryProposalAction,
  generateItineraryProposalActionError,
  type GenerateItineraryProposalActionState,
} from "@/lib/itinerary-proposal-generation";
import type { ItineraryProposalGenerationScope } from "@routebook/proposal-management";
import { resolveTripRouteAccess } from "@/lib/trip-route-access";

function proposalPath(tripId: string): string {
  return `/viagens/${tripId}/roteiro/proposta`;
}

export async function generateItineraryProposalAction(
  tripId: string,
  includeMaybe = false,
  preparing = false,
  generationScope: ItineraryProposalGenerationScope = "INITIAL",
): Promise<GenerateItineraryProposalActionState> {
  if (
    (generationScope !== "INITIAL" && generationScope !== "REPLAN") ||
    (preparing && generationScope === "REPLAN")
  ) {
    return generateItineraryProposalActionError("invalid-request");
  }

  let state: GenerateItineraryProposalActionState;

  try {
    state = await executeGenerateItineraryProposalAction(
      {
        tripId,
        includeMaybe,
        ...(generationScope === "REPLAN" ? { generationScope } : {}),
      },
      {
        resolveAccess: resolveTripRouteAccess,
        tripRepository: new DrizzleTripRepository(),
        itineraryRepository: new DrizzleItineraryRepository(),
        generationService: createPostgresAuthoritativeItineraryProposalGenerationService(),
      },
    );
  } catch (error) {
    console.error("Falha técnica ao gerar Itinerary Proposal", error);
    return generateItineraryProposalActionError("technical-error");
  }

  if (state.status === "success") {
    revalidatePath(`/viagens/${tripId}`);
    revalidatePath(`/viagens/${tripId}/roteiro`);
    revalidatePath(proposalPath(tripId));
    const searchParams = new URLSearchParams();
    if (preparing) searchParams.set("preparar", "1");
    if (generationScope === "REPLAN") searchParams.set("scope", "REPLAN");
    searchParams.set("propostaGerada", state.itineraryProposalId);
    redirect(`${proposalPath(tripId)}?${searchParams.toString()}`);
  }

  return state;
}
