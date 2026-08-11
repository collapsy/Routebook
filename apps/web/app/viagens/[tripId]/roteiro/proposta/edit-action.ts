"use server";

import { DrizzleItineraryProposalRepository } from "@routebook/database";

import {
  editItineraryProposalActionError,
  executeEditItineraryProposalAction,
  type EditItineraryProposalActionInput,
  type EditItineraryProposalActionState,
} from "@/lib/itinerary-proposal-editing";
import { resolveTripRouteAccess } from "@/lib/trip-route-access";

function requiredFormText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function presentFormText(formData: FormData, field: string): string | null {
  const value = formData.get(field);
  return typeof value === "string" ? value : null;
}

function actionInput(tripId: string, formData: FormData): EditItineraryProposalActionInput {
  return {
    tripId,
    itineraryProposalId: requiredFormText(formData, "itineraryProposalId"),
    proposedActivityId: requiredFormText(formData, "proposedActivityId"),
    ...(formData.has("targetTripDayId")
      ? { targetTripDayId: requiredFormText(formData, "targetTripDayId") }
      : {}),
    ...(formData.has("title") ? { title: requiredFormText(formData, "title") } : {}),
    ...(formData.has("description")
      ? { description: presentFormText(formData, "description") }
      : {}),
    ...(formData.has("proposedStartTime")
      ? { proposedStartTime: presentFormText(formData, "proposedStartTime") }
      : {}),
    ...(formData.has("durationMinutes")
      ? { durationMinutes: presentFormText(formData, "durationMinutes") }
      : {}),
    ...(formData.has("proposedOrder")
      ? { proposedOrder: presentFormText(formData, "proposedOrder") }
      : {}),
    ...(formData.has("flexibility")
      ? { flexibility: presentFormText(formData, "flexibility") }
      : {}),
    ...(formData.has("estimatedCostAmount")
      ? { estimatedCostAmount: presentFormText(formData, "estimatedCostAmount") }
      : {}),
    ...(formData.has("estimatedCostCurrency")
      ? { estimatedCostCurrency: presentFormText(formData, "estimatedCostCurrency") }
      : {}),
  };
}

export async function editItineraryProposalAction(
  tripId: string,
  _previousState: EditItineraryProposalActionState,
  formData: FormData,
): Promise<EditItineraryProposalActionState> {
  try {
    return await executeEditItineraryProposalAction(actionInput(tripId, formData), {
      resolveAccess: resolveTripRouteAccess,
      repository: new DrizzleItineraryProposalRepository(),
    });
  } catch (error) {
    console.error("Failed to edit Itinerary Proposal.", error);
    return editItineraryProposalActionError("technical-error");
  }
}
