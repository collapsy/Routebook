"use client";

import Link from "next/link";
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

type TravelerContextSection = "grupo" | "preferencias" | "logistica";

const sections: ReadonlyArray<Readonly<{ id: TravelerContextSection; label: string }>> = [
  { id: "grupo", label: "Grupo" },
  { id: "preferencias", label: "Interesses e ritmo" },
  { id: "logistica", label: "Deslocamento e orçamento" },
];

function FieldError({ message }: { message: string | undefined }) {
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

function sectionHref(
  tripId: string,
  section: TravelerContextSection,
  preparing: boolean,
): string {
  const query = new URLSearchParams();
  if (preparing) query.set("preparar", "1");
  query.set("grupo", section);
  return `/viagens/${tripId}/contexto?${query.toString()}`;
}

export function TravelerContextForm({
  tripId,
  profile,
  section,
  preparing,
}: {
  tripId: string;
  profile: TravelerProfile | null;
  section: TravelerContextSection;
  preparing: boolean;
}) {
  const [state, action, pending] = useActionState(
    saveTravelerContextAction,
    initialTravelerContextState,
  );

  return (
    <section className="traveler-context-summary" aria-labelledby="traveler-context-form-title">
      <div className="section-heading-row">
        <div>
          <p className="product-eyebrow">Contexto progressivo</p>
          <h2 id="traveler-context-form-title">Informe em pequenos grupos</h2>
          <p>Salve um grupo por vez. Voltar ou navegar entre grupos não apaga o que já foi salvo.</p>
        </div>
      </div>

      <nav aria-label="Grupos do contexto" className="section-heading-row">
        {sections.map((item, index) =>
          profile || item.id === "grupo" ? (
            <Link
              aria-current={section === item.id ? "page" : undefined}
              className={
                section === item.id ? "product-primary-action" : "product-secondary-action"
              }
              href={sectionHref(tripId, item.id, preparing)}
              key={item.id}
            >
              {index + 1}. {item.label}
            </Link>
          ) : (
            <span aria-disabled="true" className="product-secondary-action" key={item.id}>
              {index + 1}. {item.label}
            </span>
          ),
        )}
      </nav>

      <form action={action} className="trip-form traveler-context-form" noValidate>
        <input name="tripId" type="hidden" value={tripId} />
        <input name="section" type="hidden" value={section} />
        <input name="preparar" type="hidden" value={preparing ? "1" : "0"} />

        {state.formError ? (
          <div className="form-error" role="alert">
            {state.formError}
          </div>
        ) : null}

        {section === "grupo" ? (
          <div className="form-field form-field-wide">
            <label htmlFor="travelerCount">Quantidade de viajantes</label>
            <input
              aria-invalid={Boolean(state.fieldErrors.travelerCount)}
              defaultValue={profile?.travelerCount ?? ""}
              id="travelerCount"
              max="20"
              min="1"
              name="travelerCount"
              required
              type="number"
            />
            <p className="field-hint">
              Participantes com acesso à conta e quantidade de viajantes são conceitos diferentes.
            </p>
            <FieldError message={state.fieldErrors.travelerCount} />
          </div>
        ) : null}

        {section === "preferencias" ? (
          <>
            <fieldset className="form-field form-field-wide interest-fieldset">
              <legend>Interesses do grupo</legend>
              <p className="field-hint">
                Opcional. Marque somente categorias que realmente ajudem a personalizar a viagem.
              </p>
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

            <div className="form-field form-field-wide">
              <label htmlFor="pace">Ritmo da viagem</label>
              <select defaultValue={profile?.pace ?? ""} id="pace" name="pace">
                <option value="">Ainda não informado</option>
                <option value="relaxed">Relaxado</option>
                <option value="balanced">Equilibrado</option>
                <option value="intense">Intenso</option>
              </select>
              <FieldError message={state.fieldErrors.pace} />
            </div>
          </>
        ) : null}

        {section === "logistica" ? (
          <>
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

            <div className="form-field">
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
          </>
        ) : null}

        <div className="form-actions form-field-wide">
          <button className="product-button" disabled={pending} type="submit">
            {pending
              ? "Salvando contexto…"
              : section === "logistica"
                ? preparing
                  ? "Salvar contexto"
                  : "Salvar contexto e voltar"
                : "Salvar e continuar"}
          </button>
          <p>
            Campos opcionais vazios permanecem sem valor definido; não existe percentual mínimo de
            preenchimento.
          </p>
        </div>
      </form>
    </section>
  );
}
