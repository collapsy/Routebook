"use client";

import { useParams } from "next/navigation";

import { removeItineraryFreePeriodAction } from "./actions";

export function FreePeriodRemover({ freePeriodId }: { freePeriodId: string }) {
  const { tripId } = useParams<{ tripId: string }>();

  return (
    <form action={removeItineraryFreePeriodAction}>
      <input name="tripId" type="hidden" value={tripId} />
      <input name="freePeriodId" type="hidden" value={freePeriodId} />
      <button
        aria-label={`Remover período livre ${freePeriodId} do roteiro`}
        className="itinerary-danger-action"
        type="submit"
      >
        Remover
      </button>
    </form>
  );
}
