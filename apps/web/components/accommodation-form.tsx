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
        <h2>Onde você vai ficar?</h2>
        <p className="field-hint">
          Informe a hospedagem para usar o local como referência em mapas e distâncias.
        </p>
        {accommodation?.coordinate ? (
          <p className="field-hint" role="status">
            Localização disponível para mapa e distâncias.
          </p>
        ) : null}
      </div>

      <div className="form-field form-field-wide">
        <label htmlFor="accommodationName">Nome da hospedagem</label>
        <input
          aria-describedby="accommodationName-hint accommodationName-error"
          aria-invalid={Boolean(state.fieldErrors.accommodationName)}
          defaultValue={accommodation?.name ?? ""}
          id="accommodationName"
          name="accommodationName"
          placeholder="Ex.: Hotel, pousada, condomínio ou apartamento"
        />
        <p className="field-hint" id="accommodationName-hint">
          Se ainda não souber o endereço, informe só o nome. Deixe nome e endereço vazios para
          remover a hospedagem.
        </p>
        <FieldError id="accommodationName-error" message={state.fieldErrors.accommodationName} />
      </div>

      <div className="form-field form-field-wide">
        <label htmlFor="accommodationAddress">Endereço</label>
        <input
          aria-describedby="accommodationAddress-hint accommodationAddress-error"
          aria-invalid={Boolean(state.fieldErrors.accommodationAddress)}
          defaultValue={accommodation?.address ?? ""}
          id="accommodationAddress"
          name="accommodationAddress"
          placeholder="Rua, número, bairro e cidade"
        />
        <p className="field-hint" id="accommodationAddress-hint">
          Quanto mais completo o endereço, maior a chance de localizar a hospedagem corretamente.
        </p>
        <FieldError
          id="accommodationAddress-error"
          message={state.fieldErrors.accommodationAddress}
        />
      </div>

      <details className="form-field form-field-wide">
        <summary>Opções avançadas de localização</summary>
        <p className="field-hint">
          Use coordenadas somente se a localização não estiver correta. Informe latitude e longitude
          juntas.
        </p>

        <div className="trip-form">
          <div className="form-field">
            <label htmlFor="accommodationLatitude">Latitude</label>
            <input
              aria-describedby="accommodationLatitude-hint accommodationLatitude-error"
              aria-invalid={Boolean(state.fieldErrors.accommodationLatitude)}
              id="accommodationLatitude"
              inputMode="decimal"
              name="accommodationLatitude"
              placeholder="Ex.: -29,3746"
            />
            <p className="field-hint" id="accommodationLatitude-hint">
              Use junto com a longitude para indicar o ponto exato.
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
              id="accommodationLongitude"
              inputMode="decimal"
              name="accommodationLongitude"
              placeholder="Ex.: -50,8764"
            />
            <p className="field-hint" id="accommodationLongitude-hint">
              Informe junto com a latitude.
            </p>
            <FieldError
              id="accommodationLongitude-error"
              message={state.fieldErrors.accommodationLongitude}
            />
          </div>
        </div>
      </details>

      <div className="form-actions form-field-wide">
        <button className="product-button" disabled={pending} type="submit">
          {pending ? "Salvando hospedagem…" : "Salvar hospedagem"}
        </button>
        <p>Quando a localização estiver disponível, ela será usada no mapa e nas distâncias.</p>
      </div>
    </form>
  );
}
