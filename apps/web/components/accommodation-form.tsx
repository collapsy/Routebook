"use client";

import { useActionState } from "react";

import type { Accommodation } from "@routebook/trip-management";

import { updateAccommodationAction } from "@/app/viagens/[tripId]/hospedagem/actions";
import { geocodeAccommodationAction } from "@/app/viagens/[tripId]/hospedagem/geocoding-actions";
import { initialGeocodingState } from "@/app/viagens/[tripId]/hospedagem/geocoding-state";
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
  const [geocodingState, geocodingAction, geocodingPending] = useActionState(
    geocodeAccommodationAction,
    initialGeocodingState,
  );

  return (
    <div className="accommodation-workspace">
      <section aria-labelledby="geocoding-title" className="trip-form accommodation-geocoding">
        <div className="form-field form-field-wide">
          <h2 id="geocoding-title">Encontrar coordenadas pelo endereço</h2>
          <p className="field-hint">
            Busque uma localização e revise o resultado antes de confirmar. As coordenadas atuais
            não serão alteradas durante a busca.
          </p>
        </div>

        <form action={geocodingAction} className="form-field form-field-wide">
          <label htmlFor="geocodingQuery">Endereço para busca</label>
          <input
            aria-describedby="geocodingQuery-hint geocodingQuery-error"
            aria-invalid={Boolean(geocodingState.error)}
            defaultValue={geocodingState.query || accommodation?.address || ""}
            id="geocodingQuery"
            name="geocodingQuery"
            placeholder="Rua, número, bairro, cidade e estado"
          />
          <p className="field-hint" id="geocodingQuery-hint">
            Inclua cidade e estado para aumentar a precisão.
          </p>
          <FieldError id="geocodingQuery-error" message={geocodingState.error} />
          <button className="product-button product-button-secondary" disabled={geocodingPending}>
            {geocodingPending ? "Buscando localização…" : "Buscar localização"}
          </button>
        </form>

        {geocodingState.result ? (
          <div className="form-field form-field-wide geocoding-result" role="status">
            <h3>Resultado encontrado</h3>
            <dl>
              <div>
                <dt>Endereço normalizado</dt>
                <dd>{geocodingState.result.normalizedAddress}</dd>
              </div>
              <div>
                <dt>Latitude</dt>
                <dd>{geocodingState.result.latitude}</dd>
              </div>
              <div>
                <dt>Longitude</dt>
                <dd>{geocodingState.result.longitude}</dd>
              </div>
            </dl>

            <form action={action}>
              <input name="tripId" type="hidden" value={tripId} />
              <input
                name="accommodationName"
                type="hidden"
                value={accommodation?.name ?? "Hospedagem"}
              />
              <input
                name="accommodationAddress"
                type="hidden"
                value={geocodingState.result.normalizedAddress}
              />
              <input
                name="accommodationLatitude"
                type="hidden"
                value={geocodingState.result.latitude}
              />
              <input
                name="accommodationLongitude"
                type="hidden"
                value={geocodingState.result.longitude}
              />
              <button className="product-button" disabled={pending}>
                {pending ? "Confirmando localização…" : "Confirmar e salvar localização"}
              </button>
            </form>
          </div>
        ) : null}
      </section>

      <form action={action} className="trip-form accommodation-form" noValidate>
        <input name="tripId" type="hidden" value={tripId} />

        {state.formError ? (
          <div className="form-error" role="alert">
            {state.formError}
          </div>
        ) : null}

        <div className="form-field form-field-wide">
          <h2>Edição manual</h2>
          <p className="field-hint">
            Use estes campos para ajustar os dados ou informar coordenadas manualmente.
          </p>
        </div>

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
          <p className="field-hint">
            Deixe todos os campos vazios para remover a hospedagem da viagem.
          </p>
          <FieldError id="accommodationName-error" message={state.fieldErrors.accommodationName} />
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
    </div>
  );
}
