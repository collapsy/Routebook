"use client";

import { useActionState } from "react";

import { createTripAction, initialCreateTripState } from "@/app/viagens/nova/actions";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="field-error" role="alert">
      {message}
    </p>
  );
}

export function TripForm() {
  const [state, action, pending] = useActionState(createTripAction, initialCreateTripState);

  return (
    <form action={action} className="trip-form" noValidate>
      {state.formError ? (
        <div className="form-error" role="alert">
          {state.formError}
        </div>
      ) : null}

      <div className="form-field form-field-wide">
        <label htmlFor="name">Nome da viagem</label>
        <input
          aria-describedby={state.fieldErrors.name ? "name-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors.name)}
          autoComplete="off"
          defaultValue="Pipa em agosto"
          id="name"
          name="name"
          required
        />
        <div id="name-error">
          <FieldError message={state.fieldErrors.name} />
        </div>
      </div>

      <div className="form-field form-field-wide">
        <label htmlFor="destination">Destino</label>
        <input id="destination" readOnly value="Pipa, Tibau do Sul - RN" />
        <p className="field-hint">Pipa é o primeiro destino canônico suportado pelo MVP.</p>
      </div>

      <div className="form-field">
        <label htmlFor="startDate">Data de início</label>
        <input
          aria-invalid={Boolean(state.fieldErrors.startDate)}
          defaultValue="2026-08-22"
          id="startDate"
          name="startDate"
          required
          type="date"
        />
        <FieldError message={state.fieldErrors.startDate} />
      </div>

      <div className="form-field">
        <label htmlFor="endDate">Data de término</label>
        <input
          aria-invalid={Boolean(state.fieldErrors.endDate)}
          defaultValue="2026-08-29"
          id="endDate"
          name="endDate"
          required
          type="date"
        />
        <FieldError message={state.fieldErrors.endDate} />
      </div>

      <div className="form-field form-field-wide">
        <label htmlFor="ownerName">Responsável pela viagem</label>
        <input
          aria-invalid={Boolean(state.fieldErrors.ownerName)}
          autoComplete="name"
          id="ownerName"
          name="ownerName"
          placeholder="Nome do owner inicial"
          required
        />
        <FieldError message={state.fieldErrors.ownerName} />
      </div>

      <div className="form-field">
        <label htmlFor="accommodationName">Hospedagem opcional</label>
        <input
          aria-invalid={Boolean(state.fieldErrors.accommodationName)}
          defaultValue="Condomínio Solar Água"
          id="accommodationName"
          name="accommodationName"
        />
        <FieldError message={state.fieldErrors.accommodationName} />
      </div>

      <div className="form-field">
        <label htmlFor="accommodationAddress">Endereço da hospedagem</label>
        <input
          defaultValue="Pipa, Tibau do Sul - RN"
          id="accommodationAddress"
          name="accommodationAddress"
        />
      </div>

      <div className="form-actions form-field-wide">
        <button className="product-button" disabled={pending} type="submit">
          {pending ? "Criando viagem…" : "Criar viagem"}
        </button>
        <p>Nenhuma preferência, roteiro ou recomendação será criada automaticamente.</p>
      </div>
    </form>
  );
}
