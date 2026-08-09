"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useSyncExternalStore } from "react";

import { editItineraryProposalAction } from "../app/viagens/[tripId]/roteiro/proposta/edit-action";
import {
  initialEditItineraryProposalActionState,
  type EditItineraryProposalActionState,
} from "../lib/itinerary-proposal-editing";
import type {
  ItineraryProposalReviewActivity,
  ItineraryProposalReviewDayOption,
} from "../lib/itinerary-proposal-experience";
import styles from "./itinerary-proposal-activity-editor.module.css";

const subscribeToHydration = () => () => undefined;

function feedbackMessage(state: EditItineraryProposalActionState): string | null {
  if (state.status === "error") return state.message;
  if (state.status === "success") {
    return "Edição salva na proposta. O Roteiro confirmado ainda não foi alterado.";
  }
  return null;
}

export function ItineraryProposalActivityEditor({
  activity,
  dayOptions,
  proposalId,
  tripId,
}: {
  activity: ItineraryProposalReviewActivity;
  dayOptions: readonly ItineraryProposalReviewDayOption[];
  proposalId: string;
  tripId: string;
}) {
  const router = useRouter();
  const action = useMemo(() => editItineraryProposalAction.bind(null, tripId), [tripId]);
  const [state, formAction, pending] = useActionState(
    action,
    initialEditItineraryProposalActionState,
  );
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const disabled = !hydrated || pending;
  const canMove = activity.operationType === "add" || activity.operationType === "move";
  const canEditContent = activity.operationType === "add" || activity.operationType === "update";
  const feedback = feedbackMessage(state);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state]);

  if (!canMove && !canEditContent) return null;

  return (
    <details className={styles.editor}>
      <summary>{`Editar sugestão: ${activity.title}`}</summary>
      <form action={formAction}>
        <input name="itineraryProposalId" type="hidden" value={proposalId} />
        <input name="proposedActivityId" type="hidden" value={activity.id} />

        <div className={styles.intro}>
          <strong>Ajuste somente esta sugestão</strong>
          <p>
            Salvar atualiza a proposta revisável. O Roteiro só muda depois de uma decisão de aceite
            separada.
          </p>
        </div>

        {canMove ? (
          <label className={styles.fullField}>
            <span>Dia proposto</span>
            <select
              defaultValue={activity.editValues.targetTripDayId ?? ""}
              disabled={disabled}
              name="targetTripDayId"
              required
            >
              <option disabled value="">
                Selecione um Dia
              </option>
              {dayOptions.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {canEditContent ? (
          <>
            <label className={styles.fullField}>
              <span>Título</span>
              <input
                defaultValue={activity.editValues.title}
                disabled={disabled}
                name="title"
                required
                type="text"
              />
            </label>

            <label className={styles.fullField}>
              <span>Descrição da sugestão</span>
              <textarea
                defaultValue={activity.editValues.description}
                disabled={disabled}
                name="description"
                rows={3}
              />
            </label>

            <div className={styles.fieldGrid}>
              <label>
                <span>Horário</span>
                <input
                  defaultValue={activity.editValues.proposedStartTime}
                  disabled={disabled}
                  name="proposedStartTime"
                  type="time"
                />
              </label>

              <label>
                <span>Duração (min)</span>
                <input
                  defaultValue={activity.editValues.durationMinutes}
                  disabled={disabled}
                  min="1"
                  name="durationMinutes"
                  step="1"
                  type="number"
                />
              </label>

              <label>
                <span>Flexibilidade</span>
                <select
                  defaultValue={activity.editValues.flexibility}
                  disabled={disabled}
                  name="flexibility"
                >
                  <option value="">Não informar</option>
                  <option value="fixed">Fixa</option>
                  <option value="flexible">Flexível</option>
                  <option value="suggested">Sugerida</option>
                </select>
              </label>
            </div>

            <fieldset className={styles.costFields}>
              <legend>Estimativa da proposta</legend>
              <label>
                <span>Valor</span>
                <input
                  defaultValue={activity.editValues.estimatedCostAmount}
                  disabled={disabled}
                  min="0"
                  name="estimatedCostAmount"
                  step="0.01"
                  type="number"
                />
              </label>
              <label>
                <span>Moeda</span>
                <input
                  defaultValue={activity.editValues.estimatedCostCurrency}
                  disabled={disabled}
                  inputMode="text"
                  maxLength={3}
                  name="estimatedCostCurrency"
                  placeholder="BRL"
                  type="text"
                />
              </label>
            </fieldset>
          </>
        ) : null}

        <div className={styles.actions}>
          <button disabled={disabled} type="submit">
            {pending ? "Salvando edição…" : "Salvar edição"}
          </button>
          <span>Esta ação não aceita a proposta.</span>
        </div>

        <div aria-live="polite" className={styles.feedback}>
          {pending ? <p>Salvando a edição na proposta…</p> : null}
          {feedback ? <p role={state.status === "error" ? "alert" : "status"}>{feedback}</p> : null}
        </div>
      </form>
    </details>
  );
}
