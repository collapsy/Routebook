"use client";

import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";

import { acceptItineraryProposalAction } from "../app/viagens/[tripId]/roteiro/proposta/accept-action";
import { acceptItineraryProposalPartiallyAction } from "../app/viagens/[tripId]/roteiro/proposta/partial-accept-action";
import { initialAcceptItineraryProposalActionState } from "../lib/itinerary-proposal-acceptance";
import { initialAcceptItineraryProposalPartiallyActionState } from "../lib/itinerary-proposal-partial-acceptance";
import styles from "./itinerary-proposal-decision-actions.module.css";

type DiscardAction = (formData: FormData) => void | Promise<void>;

const subscribeToHydration = () => () => undefined;

export type PartialAcceptanceItem = Readonly<{
  id: string;
  title: string;
  dayLabel: string;
}>;

export function ItineraryProposalDecisionActions({
  canAccept,
  canDecide,
  discardAction,
  expectedItineraryVersion,
  idempotencyKey,
  itineraryHref,
  partialAcceptanceItems,
  proposalId,
  tripId,
}: {
  canAccept: boolean;
  canDecide: boolean;
  discardAction: DiscardAction;
  expectedItineraryVersion: number;
  idempotencyKey: string;
  itineraryHref: string;
  partialAcceptanceItems: readonly PartialAcceptanceItem[];
  proposalId: string;
  tripId: string;
}) {
  const router = useRouter();
  const acceptAction = useMemo(() => acceptItineraryProposalAction.bind(null, tripId), [tripId]);
  const [state, dispatchAccept, actionPending] = useActionState(
    acceptAction,
    initialAcceptItineraryProposalActionState,
  );
  const partialAcceptAction = useMemo(
    () => acceptItineraryProposalPartiallyAction.bind(null, tripId),
    [tripId],
  );
  const [partialState, dispatchPartialAccept, partialActionPending] = useActionState(
    partialAcceptAction,
    initialAcceptItineraryProposalPartiallyActionState,
  );
  const [transitionPending, startAcceptTransition] = useTransition();
  const [partialTransitionPending, startPartialAcceptTransition] = useTransition();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [discardPending, setDiscardPending] = useState(false);
  const [selectedPartialIds, setSelectedPartialIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const acceptPending = actionPending || transitionPending;
  const partialAcceptPending = partialActionPending || partialTransitionPending;
  const decisionPending = acceptPending || partialAcceptPending || discardPending;
  const decisionDisabled = !hydrated || decisionPending;
  const canPartiallyAccept = canAccept && partialAcceptanceItems.length > 1;
  const partialSelectionIsValid =
    selectedPartialIds.size > 0 && selectedPartialIds.size < partialAcceptanceItems.length;

  const submitAccept = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      startAcceptTransition(() => dispatchAccept(formData));
    },
    [dispatchAccept],
  );

  const submitPartialAccept = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!partialSelectionIsValid) return;
      const formData = new FormData(event.currentTarget);
      startPartialAcceptTransition(() => dispatchPartialAccept(formData));
    },
    [dispatchPartialAccept, partialSelectionIsValid],
  );

  const togglePartialSelection = useCallback((id: string, selected: boolean) => {
    setSelectedPartialIds((current) => {
      const next = new Set(current);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (state.status !== "success") return;
    router.push(`${itineraryHref}?propostaAceita=${state.kind}`);
    router.refresh();
  }, [itineraryHref, router, state]);

  useEffect(() => {
    if (partialState.status !== "success") return;
    router.push(`${itineraryHref}?propostaAceita=partial-${partialState.kind}`);
    router.refresh();
  }, [itineraryHref, partialState, router]);

  if (!canDecide) {
    return (
      <section className={styles.decisionActions} aria-labelledby="proposal-decision-title">
        <div className={styles.decisionCopy}>
          <p className={styles.eyebrow}>Somente leitura</p>
          <h2 id="proposal-decision-title">Você pode consultar esta proposta</h2>
          <p>Você não tem permissão para aceitar ou descartar esta proposta.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.decisionActions} aria-labelledby="proposal-decision-title">
      <div className={styles.decisionCopy}>
        <p className={styles.eyebrow}>Sua decisão</p>
        <h2 id="proposal-decision-title">
          {canAccept ? "Quer aplicar esta proposta?" : "Não quer usar esta proposta?"}
        </h2>
        <p>
          {canAccept
            ? "Você pode aplicar tudo, escolher apenas algumas mudanças ou descartar a proposta."
            : "O Roteiro mudou desde que esta proposta foi criada. Você ainda pode descartá-la."}
        </p>
      </div>

      <div className={styles.decisionControls}>
        {canAccept ? (
          <details className={styles.acceptConfirmation}>
            <summary>Aceitar proposta</summary>
            <form onSubmit={submitAccept}>
              <input name="itineraryProposalId" type="hidden" value={proposalId} />
              <input
                name="expectedItineraryVersion"
                type="hidden"
                value={expectedItineraryVersion}
              />
              <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
              <p>Todas as mudanças desta proposta serão aplicadas ao Roteiro.</p>
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

        {canPartiallyAccept ? (
          <details className={styles.partialConfirmation}>
            <summary>Aceitar parte da proposta</summary>
            <form onSubmit={submitPartialAccept}>
              <input name="itineraryProposalId" type="hidden" value={proposalId} />
              <input
                name="expectedItineraryVersion"
                type="hidden"
                value={expectedItineraryVersion}
              />
              <input
                name="idempotencyKey"
                type="hidden"
                value={`partial-accept-itinerary-proposal:${proposalId}:${expectedItineraryVersion}`}
              />
              <fieldset disabled={decisionDisabled}>
                <legend>Escolha as mudanças que deseja aplicar</legend>
                <p>Itens não selecionados ficarão fora do Roteiro.</p>
                <ul className={styles.partialSelectionList}>
                  {partialAcceptanceItems.map((item) => (
                    <li key={item.id}>
                      <label>
                        <input
                          checked={selectedPartialIds.has(item.id)}
                          name="selectedProposedActivityId"
                          onChange={(event) =>
                            togglePartialSelection(item.id, event.currentTarget.checked)
                          }
                          type="checkbox"
                          value={item.id}
                        />
                        <span>
                          <strong>{item.title}</strong>
                          <small>{item.dayLabel}</small>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
              <p className={styles.selectionFeedback} aria-live="polite">
                {selectedPartialIds.size === 0
                  ? "Selecione ao menos uma mudança."
                  : selectedPartialIds.size === partialAcceptanceItems.length
                    ? "Para aplicar todas as mudanças, use o aceite integral."
                    : `${selectedPartialIds.size} de ${partialAcceptanceItems.length} mudanças selecionadas.`}
              </p>
              <button
                className={styles.partialAcceptButton}
                disabled={decisionDisabled || !partialSelectionIsValid}
                type="submit"
              >
                {partialAcceptPending ? "Aplicando seleção…" : "Confirmar seleção"}
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
        {acceptPending ? <p>Aplicando proposta ao Roteiro…</p> : null}
        {partialAcceptPending ? <p>Aplicando seleção ao Roteiro…</p> : null}
        {state.status === "error" ? <p role="alert">{state.message}</p> : null}
        {partialState.status === "error" ? <p role="alert">{partialState.message}</p> : null}
        {state.status === "success" ? (
          <p role="status">
            {state.kind === "replay"
              ? "Esta proposta já foi aplicada. Abrindo o Roteiro…"
              : "Proposta aplicada. Abrindo o Roteiro…"}
          </p>
        ) : null}
        {partialState.status === "success" ? (
          <p role="status">
            {partialState.kind === "replay"
              ? "Esta seleção já foi aplicada. Abrindo o Roteiro…"
              : "Seleção aplicada. Abrindo o Roteiro…"}
          </p>
        ) : null}
      </div>
    </section>
  );
}
