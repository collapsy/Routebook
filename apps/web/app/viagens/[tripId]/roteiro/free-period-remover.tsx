"use client";

import { useParams } from "next/navigation";

import { removeItineraryFreePeriodAction } from "./actions";

export function FreePeriodRemover({
  freePeriodId,
  label,
}: {
  freePeriodId: string;
  label: string;
}) {
  const { tripId } = useParams<{ tripId: string }>();

  return (
    <form action={removeItineraryFreePeriodAction}>
      <input name="tripId" type="hidden" value={tripId} />
      <input name="freePeriodId" type="hidden" value={freePeriodId} />
      <button
        aria-label={`Remover ${label} do roteiro`}
        className="itinerary-danger-action"
        type="submit"
      >
        Remover
      </button>
    </form>
  );
}
