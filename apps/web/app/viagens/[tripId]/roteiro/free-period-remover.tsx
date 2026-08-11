"use client";

import { useParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";

import { removeItineraryFreePeriodAction } from "./actions";

const subscribeToHydration = () => () => undefined;

function RemoveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  return (
    <button
      aria-label={`Remover ${label} do roteiro`}
      className="itinerary-danger-action"
      disabled={!hydrated || pending}
      type="submit"
    >
      {pending ? "Removendo…" : "Remover"}
    </button>
  );
}

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
      <RemoveButton label={label} />
    </form>
  );
}
