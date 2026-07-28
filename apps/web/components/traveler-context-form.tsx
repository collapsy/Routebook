"use client";

import { useActionState } from "react";

import type { TravelerProfile } from "@routebook/traveler-profile";

import { saveTravelerContextAction } from "@/app/viagens/[tripId]/contexto/actions";
import { initialTravelerContextState } from "@/app/viagens/[tripId]/contexto/state";

const interests = [
  ["beaches", "Praias"],
  ["gastronomy", "Gastronomia"],
  ["nightlife", "Vida noturna"],
  ["nature", "Natureza"],
  ["culture", "Cultura"],
  ["rest", "Descanso"],
  ["adventure", "Aventura"],
  ["shopping", "Compras"],
] as const;

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="field-error" role="alert">
      {message}
    </p>
  ) : null;
}

function formatBudget(profile: TravelerProfile | null): string {
  if (!profile?.budget) return "";
  return (profile.budget.totalCents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TravelerContextForm({
  tripId,
  profile,
}: {
  tripId: string;
  profile: TravelerProfile | null;
}) {
  const [state, action, pending] = useActionState(
    saveTravelerContextAction,
    initialTravelerContextState,
  );

  return (
    <form action={action} className="trip-form traveler-context-form" noValidate>
      <input name="tripId" type="hidden" value={tripId} />

      {state.formError ? (
        <div className="form-error" role="alert">
          {state.formError}
        </div>
      ) : null}

      <div className="form-field">
        <label htmlFor="travelerCount">Quantidade de viajantes</label>
        <input
          aria-invalid={Boolean(state.fieldErrors.travelerCount)}
          defaultValue={profile?.travelerCount ?? 3}
          id="travelerCount"
          max="20"
          min="1"
          name="travelerCount"
          required
          type="number"
        />
        <FieldError message={state.fieldErrors.travelerCount} />
      </div>

      <fieldset className="form-field form-field-wide interest-fieldset">
        <legend>Interesses do grupo</legend>
        <p className="field-hint">Escolha somente o que ajuda a personalizar a viagem.</p>
        <div className="choice-grid">
          {interests.map(([value, label]) => (
            <label className="choice-card" key={value}>
              <input
                defaultChecked={profile?.interests.includes(value)}
                name="interests"
                type="checkbox"
                value={value}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <FieldError message={state.fieldErrors.interests} />
      </fieldset>

      <div className="form-field">
        <label htmlFor="pace">Ritmo da viagem</label>
        <select defaultValue={profile?.pace ?? ""} id="pace" name="pace">
          <option value="">Ainda não informado</option>
          <option value="relaxed">Relaxado</option>
          <option value="balanced">Equilibrado</option>
          <option value="intense">Intenso</option>
        </select>
        <FieldError message={state.fieldErrors.pace} />
      </div>

      <div className="form-field">
        <label htmlFor="transportPreference">Transporte preferencial</label>
        <select
          defaultValue={profile?.transportPreference ?? ""}
          id="transportPreference"
          name="transportPreference"
        >
          <option value="">Ainda não informado</option>
          <option value="walking">A pé</option>
          <option value="rental-car">Carro alugado</option>
          <option value="ride-hailing">Aplicativos e táxi</option>
          <option value="public-transport">Transporte público</option>
          <option value="mixed">Combinação de meios</option>
        </select>
        <FieldError message={state.fieldErrors.transportPreference} />
      </div>

      <div className="form-field form-field-wide">
        <label htmlFor="budget">Orçamento total estimado</label>
        <div className="money-input">
          <span aria-hidden="true">R$</span>
          <input
            aria-invalid={Boolean(state.fieldErrors.budget)}
            defaultValue={formatBudget(profile)}
            id="budget"
            inputMode="decimal"
            name="budget"
            placeholder="Ex.: 4.500,00"
          />
        </div>
        <p className="field-hint">
          Campo opcional. O valor representa uma estimativa em reais, não um limite confirmado.
        </p>
        <FieldError message={state.fieldErrors.budget} />
      </div>

      <div className="form-actions form-field-wide">
        <button className="product-button" disabled={pending} type="submit">
          {pending ? "Salvando contexto…" : profile ? "Atualizar contexto" : "Salvar contexto"}
        </button>
        <p>Informações não preenchidas continuarão explicitamente como não informadas.</p>
      </div>
    </form>
  );
}
