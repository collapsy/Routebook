"use client";

import { useState, useSyncExternalStore, useTransition } from "react";

import type { GenerateItineraryProposalActionState } from "@/lib/itinerary-proposal-generation";

type Props = Readonly<{
  action: (includeMaybe: boolean) => Promise<GenerateItineraryProposalActionState>;
}>;

const subscribeToHydration = () => () => undefined;

export function ItineraryProposalGenerationControl({ action }: Props) {
  const [state, setState] = useState<GenerateItineraryProposalActionState>({ status: "idle" });
  const [includeMaybe, setIncludeMaybe] = useState(false);
  const [isPending, startTransition] = useTransition();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  function generate() {
    if (isPending) return;

    startTransition(async () => {
      const nextState = await action(includeMaybe);
      setState(nextState);
    });
  }

  return (
    <div>
      <label>
        <input
          checked={includeMaybe}
          disabled={!hydrated || isPending}
          onChange={(event) => setIncludeMaybe(event.currentTarget.checked)}
          type="checkbox"
        />
        Incluir lugares marcados como Talvez
      </label>
      <button
        className="product-primary-action"
        disabled={!hydrated || isPending}
        onClick={generate}
        type="button"
      >
        {isPending ? "Gerando proposta…" : "Gerar proposta de roteiro"}
      </button>
      {state.status === "error" ? (
        <p aria-live="polite" role="status">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
