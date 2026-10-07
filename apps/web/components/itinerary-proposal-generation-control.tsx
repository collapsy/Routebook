"use client";

import { useState, useSyncExternalStore, useTransition } from "react";

import type { ItineraryProposalGenerationScope } from "@routebook/proposal-management";
import type { GenerateItineraryProposalActionState } from "@/lib/itinerary-proposal-generation";

type Props = Readonly<{
  action: (
    includeMaybe: boolean,
    preparing?: boolean,
    generationScope?: ItineraryProposalGenerationScope,
  ) => Promise<GenerateItineraryProposalActionState>;
  preparing?: boolean;
  generationScope?: ItineraryProposalGenerationScope;
}>;

const subscribeToHydration = () => () => undefined;

export function ItineraryProposalGenerationControl({
  action,
  preparing = false,
  generationScope = "INITIAL",
}: Props) {
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
      const nextState =
        preparing && generationScope === "INITIAL"
          ? await action(includeMaybe, true)
          : preparing
            ? await action(includeMaybe, true, generationScope)
            : generationScope === "REPLAN"
              ? await action(includeMaybe, false, generationScope)
              : await action(includeMaybe);
      setState(nextState);
    });
  }

  return (
    <div>
      {generationScope === "REPLAN" ? (
        <p>
          Esta proposta considera somente o trecho elegível do Roteiro. O passado e as atividades
          protegidas serão preservados.
        </p>
      ) : null}
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
        {isPending
          ? "Gerando proposta…"
          : generationScope === "REPLAN"
            ? "Gerar proposta de replanejamento"
            : "Gerar proposta de roteiro"}
      </button>
      {state.status === "error" ? (
        <p aria-live="polite" role="status">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
