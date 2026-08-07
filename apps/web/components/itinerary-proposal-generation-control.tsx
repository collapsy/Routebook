"use client";

import { useState, useTransition } from "react";

import type { GenerateItineraryProposalActionState } from "@/lib/itinerary-proposal-generation";

type Props = Readonly<{
  action: () => Promise<GenerateItineraryProposalActionState>;
}>;

export function ItineraryProposalGenerationControl({ action }: Props) {
  const [state, setState] = useState<GenerateItineraryProposalActionState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  function generate() {
    if (isPending) return;

    startTransition(async () => {
      const nextState = await action();
      setState(nextState);
    });
  }

  return (
    <div>
      <button
        className="product-primary-action"
        disabled={isPending}
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
