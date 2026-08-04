"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { acceptItineraryProposalAction } from "../app/viagens/[tripId]/roteiro/proposta/accept-action";
import { initialAcceptItineraryProposalActionState } from "../lib/itinerary-proposal-acceptance";
import styles from "./itinerary-proposal-decision-actions.module.css";

type DiscardAction = (formData: FormData) => void | Promise<void>;

const subscribeToHydration = () => () => undefined;

export function ItineraryProposalDecisionActions({
  canAccept,
  canDecide,
  discardAction,
  expectedItineraryVersion,
  idempotencyKey,
  itineraryHref,
  proposalId,
  tripId,
}: {
  canAccept: boolean;
  canDecide: boolean;
  discardAction: DiscardAction;
  expectedItineraryVersion: number;
  idempotencyKey: string;
  itineraryHref: string;
  proposalId: string;
  tripId: string;
}) {
  const router = useRouter();
  const acceptAction = useMemo(() => acceptItineraryProposalAction.bind(null, tripId), [tripId]);
  const [state, submitAccept, acceptPending] = useActionState(
    acceptAction,
    initialAcceptItineraryProposalActionState,
  );
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [discardPending, setDiscardPending] = useState(false);
  const decisionPending = acceptPending || discardPending;
  const decisionDisabled = !hydrated || decisionPending;

  useEffect(() => {
    if (state.status !== "success") return;
    router.push(`${itineraryHref}?propostaAceita=${state.kind}`);
    router.refresh();
  }, [itineraryHref, router, state]);

  if (!canDecide) {
    return (
      <section className={styles.decisionActions} aria-labelledby="proposal-decision-title">
        <div className={styles.decisionCopy}>
          <p className={styles.eyebrow}>Revisão somente leitura</p>
          <h2 id="proposal-decision-title">Você pode consultar esta proposta</h2>
          <p>
            Somente participantes com permissão de decisão podem aceitar ou descartar a proposta.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.decisionActions} aria-labelledby="proposal-decision-title">
      <div className={styles.decisionCopy}>
        <p className={styles.eyebrow}>Decisão sobre esta sugestão</p>
        <h2 id="proposal-decision-title">
          {canAccept ? "Quer aplicar esta proposta?" : "Não quer usar esta proposta?"}
        </h2>
        <p>
          {canAccept
            ? "Revise a confirmação antes de substituir o estado atual do Roteiro pelas mudanças propostas."
            : "Esta proposta não pode mais ser aplicada ao estado atual. Ao descartar, o Roteiro não será alterado."}
        </p>
      </div>

      <div className={styles.decisionControls}>
        {canAccept ? (
          <details className={styles.acceptConfirmation}>
            <summary>Aceitar proposta</summary>
            <form action={submitAccept}>
              <input name="itineraryProposalId" type="hidden" value={proposalId} />
              <input
                name="expectedItineraryVersion"
                type="hidden"
                value={expectedItineraryVersion}
              />
              <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
              <p>
                As mudanças serão aplicadas ao Roteiro em uma única decisão. Em caso de repetição, o
                RouteBook reutilizará o resultado já persistido.
              </p>
              <label>
                <input
                  disabled={decisionDisabled}
                  name="confirmation"
                  required
                  type="checkbox"
                  value="apply-proposal"
                />
                Entendo que esta ação atualizará o Roteiro.
              </label>
              <button className={styles.acceptButton} disabled={decisionDisabled} type="submit">
                {acceptPending ? "Aplicando proposta…" : "Confirmar e aceitar proposta"}
              </button>
            </form>
          </details>
        ) : null}

        <form action={discardAction} onSubmit={() => setDiscardPending(true)}>
          <input name="itineraryProposalId" type="hidden" value={proposalId} />
          <button className={styles.discardButton} disabled={decisionDisabled} type="submit">
            {discardPending ? "Descartando proposta…" : "Descartar proposta"}
          </button>
        </form>
      </div>

      <div aria-live="polite" className={styles.actionFeedback}>
        {acceptPending ? <p>Aplicando a proposta e atualizando o Roteiro…</p> : null}
        {state.status === "error" ? <p role="alert">{state.message}</p> : null}
        {state.status === "success" ? (
          <p role="status">
            {state.kind === "replay"
              ? "Esta proposta já havia sido aceita. Abrindo o Roteiro atualizado…"
              : "Proposta aceita. Abrindo o Roteiro atualizado…"}
          </p>
        ) : null}
      </div>
    </section>
  );
}
