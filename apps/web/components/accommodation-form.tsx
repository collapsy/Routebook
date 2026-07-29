"use client";

import { useActionState } from "react";

import type { Accommodation } from "@routebook/trip-management";

import { updateAccommodationAction } from "@/app/viagens/[tripId]/hospedagem/actions";
import { initialAccommodationState } from "@/app/viagens/[tripId]/hospedagem/state";

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  return message ? (
    <p className="field-error" id={id} role="alert">
      {message}
    </p>
  ) : null;
}

export function AccommodationForm({
  tripId,
  accommodation,
}: {
  tripId: string;
  accommodation: Accommodation | undefined;
}) {
  const [state, action, pending] = useActionState(
    updateAccommodationAction,
    initialAccommodationState,
  );

  return (
    <form action={action} className="trip-form accommodation-form" noValidate>
      <input name="tripId" type="hidden" value={tripId} />

      {state.formError ? (
        <div className="form-error" role="alert">
          {state.formError}
        </div>
      ) : null}

      <div className="form-field form-field-wide">
        <label htmlFor="accommodationName">Nome da hospedagem</label>
        <input
          aria-describedby="accommodationName-error"
          aria-invalid={Boolean(state.fieldErrors.accommodationName)}
          defaultValue={accommodation?.name ?? ""}
          id="accommodationName"
          name="accommodationName"
          placeholder="Ex.: Condomínio Solar Água"
        />
        <p className="field-hint">Deixe todos os campos vazios para remover a hospedagem da viagem.</p>
        <FieldError
          id="accommodationName-error"
          message={state.fieldErrors.accommodationName}
        />
      </div>

      <div className="form-field form-field-wide">
        <label htmlFor="accommodationAddress">Endereço</label>
        <input
          aria-describedby="accommodationAddress-error"
          aria-invalid={Boolean(state.fieldErrors.accommodationAddress)}
          defaultValue={accommodation?.address ?? ""}
          id="accommodationAddress"
          name="accommodationAddress"
          placeholder="Rua, número, bairro e cidade"
        />
        <FieldError
          id="accommodationAddress-error"
          message={state.fieldErrors.accommodationAddress}
        />
      </div>

      <div className="form-field">
        <label htmlFor="accommodationLatitude">Latitude</label>
        <input
          aria-describedby="accommodationLatitude-hint accommodationLatitude-error"
          aria-invalid={Boolean(state.fieldErrors.accommodationLatitude)}
          defaultValue={accommodation?.coordinate?.latitude ?? ""}
          id="accommodationLatitude"
          inputMode="decimal"
          name="accommodationLatitude"
          placeholder="Ex.: -6,2302"
        />
        <p className="field-hint" id="accommodationLatitude-hint">
          Informe latitude e longitude juntas.
        </p>
        <FieldError
          id="accommodationLatitude-error"
          message={state.fieldErrors.accommodationLatitude}
        />
      </div>

      <div className="form-field">
        <label htmlFor="accommodationLongitude">Longitude</label>
        <input
          aria-describedby="accommodationLongitude-hint accommodationLongitude-error"
          aria-invalid={Boolean(state.fieldErrors.accommodationLongitude)}
          defaultValue={accommodation?.coordinate?.longitude ?? ""}
          id="accommodationLongitude"
          inputMode="decimal"
          name="accommodationLongitude"
          placeholder="Ex.: -35,0503"
        />
        <p className="field-hint" id="accommodationLongitude-hint">
          Apague ambas para remover somente as coordenadas.
        </p>
        <FieldError
          id="accommodationLongitude-error"
          message={state.fieldErrors.accommodationLongitude}
        />
      </div>

      <div className="form-actions form-field-wide">
        <button className="product-button" disabled={pending} type="submit">
          {pending ? "Salvando hospedagem…" : "Salvar hospedagem"}
        </button>
        <p>As distâncias em linha reta serão recalculadas com as coordenadas salvas.</p>
      </div>
    </form>
  );
}
