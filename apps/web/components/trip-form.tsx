"use client";

import { useActionState } from "react";

import { createTripAction } from "@/app/viagens/nova/actions";
import { initialCreateTripState } from "@/app/viagens/nova/state";

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <p className="field-error" role="alert">
      {message}
    </p>
  );
}

export function TripForm({
  destinationAttribution,
}: {
  destinationAttribution?: Readonly<{ label: string; href: string }> | undefined;
}) {
  const [state, action, pending] = useActionState(createTripAction, initialCreateTripState);

  return (
    <form action={action} className="trip-form" noValidate>
      {state.formError ? (
        <div className="form-error" role="alert">
          {state.formError}
        </div>
      ) : null}

      <div className="form-field form-field-wide">
        <label htmlFor="destination">Para onde você vai?</label>
        <input
          aria-describedby={state.fieldErrors.destination ? "destination-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors.destination)}
          autoComplete="off"
          id="destination"
          name="destination"
          placeholder="Ex.: Florianópolis, SC"
          required
        />
        <div id="destination-error">
          <FieldError message={state.fieldErrors.destination} />
        </div>
        {destinationAttribution ? (
          <p className="field-hint">
            <a href={destinationAttribution.href} rel="noreferrer" target="_blank">
              {destinationAttribution.label}
            </a>
          </p>
        ) : null}
      </div>

      <div className="form-field form-field-wide">
        <label htmlFor="name">Nome da viagem</label>
        <input
          aria-describedby={state.fieldErrors.name ? "name-error" : "name-hint"}
          aria-invalid={Boolean(state.fieldErrors.name)}
          autoComplete="off"
          id="name"
          name="name"
          placeholder="Opcional"
        />
        <p className="field-hint" id="name-hint">
          Se deixar em branco, usamos o nome do destino.
        </p>
        <div id="name-error">
          <FieldError message={state.fieldErrors.name} />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="startDate">Quando começa?</label>
        <input
          aria-invalid={Boolean(state.fieldErrors.startDate)}
          id="startDate"
          name="startDate"
          required
          type="date"
        />
        <FieldError message={state.fieldErrors.startDate} />
      </div>

      <div className="form-field">
        <label htmlFor="endDate">Quando termina?</label>
        <input
          aria-invalid={Boolean(state.fieldErrors.endDate)}
          id="endDate"
          name="endDate"
          required
          type="date"
        />
        <FieldError message={state.fieldErrors.endDate} />
      </div>

      <div className="form-field">
        <label htmlFor="accommodationName">Onde vai ficar?</label>
        <input
          aria-invalid={Boolean(state.fieldErrors.accommodationName)}
          id="accommodationName"
          name="accommodationName"
          placeholder="Nome da hospedagem, se já souber"
        />
        <FieldError message={state.fieldErrors.accommodationName} />
      </div>

      <div className="form-field">
        <label htmlFor="accommodationAddress">Endereço da hospedagem</label>
        <input
          id="accommodationAddress"
          name="accommodationAddress"
          placeholder="Opcional nesta etapa"
        />
      </div>

      <div className="form-actions form-field-wide">
        <button className="product-button" disabled={pending} type="submit">
          {pending ? "Criando seu guia…" : "Criar meu guia"}
        </button>
        <p>
          Você poderá ajustar hospedagem, preferências, lugares e roteiro depois. Nada é planejado
          automaticamente sem sua ação.
        </p>
      </div>
    </form>
  );
}
