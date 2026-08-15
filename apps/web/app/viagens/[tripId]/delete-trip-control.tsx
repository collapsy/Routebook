"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteTripAction,
  initialDeleteTripActionState,
  type DeleteTripActionState,
} from "./delete-trip-action";

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button className="trip-delete-confirm" disabled={pending} type="submit">
      {pending ? "Excluindo…" : "Excluir definitivamente"}
    </button>
  );
}

export function DeleteTripControl({ tripId, tripName }: { tripId: string; tripName: string }) {
  const [confirming, setConfirming] = useState(false);
  const boundAction = deleteTripAction.bind(null, tripId);
  const [state, formAction] = useActionState<DeleteTripActionState, FormData>(
    boundAction,
    initialDeleteTripActionState,
  );

  if (!confirming) {
    return (
      <button className="trip-delete-trigger" onClick={() => setConfirming(true)} type="button">
        Excluir viagem
      </button>
    );
  }

  return (
    <div className="trip-delete-confirmation" role="group" aria-label="Confirmar exclusão da viagem">
      <p>
        <strong>Excluir “{tripName}”?</strong> Esta ação remove definitivamente a viagem, seu roteiro,
        lugares salvos, recomendações, conflitos e propostas associados.
      </p>
      <div className="trip-delete-actions">
        <button className="product-secondary-action" onClick={() => setConfirming(false)} type="button">
          Cancelar
        </button>
        <form action={formAction}>
          <ConfirmDeleteButton />
        </form>
      </div>
      {state.status === "error" ? (
        <p className="trip-delete-error" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}