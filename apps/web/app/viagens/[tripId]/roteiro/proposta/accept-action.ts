"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createPostgresAcceptItineraryProposal,
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleTripRepository,
} from "@routebook/database";

import {
  acceptItineraryProposalActionError,
  executeAcceptItineraryProposalAction,
  type AcceptItineraryProposalActionState,
} from "@/lib/itinerary-proposal-acceptance";
import { resolveTripRouteAccess } from "@/lib/trip-route-access";

function itineraryPath(tripId: string): string {
  return `/viagens/${tripId}/roteiro`;
}

export async function acceptItineraryProposalAction(
  tripId: string,
  _state: AcceptItineraryProposalActionState,
  formData: FormData,
): Promise<AcceptItineraryProposalActionState> {
  let state: AcceptItineraryProposalActionState;

  try {
    state = await executeAcceptItineraryProposalAction(
      {
        tripId,
        itineraryProposalId: String(formData.get("itineraryProposalId") ?? ""),
        expectedItineraryVersion: String(formData.get("expectedItineraryVersion") ?? ""),
        idempotencyKey: String(formData.get("idempotencyKey") ?? ""),
      },
      {
        resolveAccess: resolveTripRouteAccess,
        tripRepository: new DrizzleTripRepository(),
        itineraryRepository: new DrizzleItineraryRepository(),
        proposalRepository: new DrizzleItineraryProposalRepository(),
        acceptItineraryProposal: createPostgresAcceptItineraryProposal(),
      },
    );
  } catch (error) {
    console.error("Falha técnica ao aceitar Itinerary Proposal", error);
    return acceptItineraryProposalActionError("technical-error");
  }

  if (state.status === "success") {
    revalidatePath(`/viagens/${tripId}`);
    revalidatePath(itineraryPath(tripId));
    redirect(`${itineraryPath(tripId)}?propostaAceita=${state.kind}`);
  }

  return state;
}
