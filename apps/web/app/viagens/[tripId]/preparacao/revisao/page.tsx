import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleTravelerProfileRepository,
  DrizzleTripPlacePreferenceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { findTravelerProfile } from "@routebook/traveler-profile";
import { findTripById } from "@routebook/trip-management";

import { TripPlanningWizard } from "../../../../../components/trip-planning-wizard";
import { deriveTripPreparationReviewModel } from "../../../../../lib/trip-preparation-review";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Revisão da preparação — RouteBook",
  description: "Revise os dados e as intenções que serão consideradas na futura proposta.",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatBudget(cents: number | null): string {
  if (cents === null) return "Não informado";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default async function TripPreparationReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ preparar?: string }>;
}) {
  const { tripId } = await params;
  const { preparar } = await searchParams;
  if (preparar !== "1") notFound();

  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const [profile, preferences] = await Promise.all([
    findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId),
    new DrizzleTripPlacePreferenceRepository().listByTripId(tripId),
  ]);
  const model = deriveTripPreparationReviewModel({ trip, profile, preferences });
  const places = await new DrizzlePlaceRepository().listByIds(
    model.selection.items.map((item) => item.placeId),
  );
  const placesById = new Map(places.map((place) => [place.id, place]));
  const selectedItems = model.selection.items.flatMap((item) => {
    const place = placesById.get(item.placeId);
    return place ? [{ ...item, name: place.name }] : [];
  });
  const wants = selectedItems.filter((item) => item.intent === "WANT");
  const maybes = selectedItems.filter((item) => item.intent === "MAYBE");
  const notInterested = selectedItems.filter((item) => item.intent === "NOT_INTERESTED");
  const missingRequired = model.context.travelerCount === null ? ["quantidade de viajantes"] : [];

  return (
    <section className="app-page preparation-review-page">
      <Link className="back-link" href={`/viagens/${tripId}/contexto?preparar=1`}>
        ← Voltar para Contexto
      </Link>

      <TripPlanningWizard currentStep="review" tripId={tripId} />

      <header className="app-page-heading">
        <p className="product-eyebrow">Revisão da preparação</p>
        <h1>Veja o que será considerado</h1>
        <p>Esta é uma projeção atual dos dados da viagem. Você ainda pode editar qualquer etapa.</p>
      </header>

      <section className="traveler-context-summary" aria-labelledby="review-trip-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Viagem</p>
            <h2 id="review-trip-title">{trip.name}</h2>
          </div>
        </div>
        <dl className="trip-overview-summary">
          <div>
            <dt>Destino</dt>
            <dd>{model.trip.destinationName}</dd>
          </div>
          <div>
            <dt>Período</dt>
            <dd>
              {formatDate(model.trip.startDate)} a {formatDate(model.trip.endDate)}
            </dd>
          </div>
          <div>
            <dt>Hospedagem</dt>
            <dd>{model.trip.accommodationName ?? "Não informada"}</dd>
          </div>
          <div>
            <dt>Responsável</dt>
            <dd>
              {trip.participants.find((participant) => participant.role === "owner")?.displayName ??
                "Não informado"}
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="traveler-context-summary preparation-review-section"
        aria-labelledby="review-places-title"
      >
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Lugares escolhidos</p>
            <h2 id="review-places-title">Suas intenções</h2>
          </div>
          <Link
            className="product-secondary-action"
            href={`/viagens/${tripId}/lugares-salvos?preparar=1`}
          >
            Editar Lugares
          </Link>
        </div>
        <div className="preparation-review-place-groups">
          <div>
            <h3>Quero ir</h3>
            {wants.length ? (
              <ul>
                {wants.map((item) => (
                  <li key={item.placeId}>
                    {item.priority === "MUST_DO" ? (
                      <strong>⭐ {item.name} — imperdível</strong>
                    ) : (
                      item.name
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum lugar marcado como Quero ir.</p>
            )}
          </div>
          <div>
            <h3>Talvez</h3>
            {maybes.length ? (
              <ul>
                {maybes.map((item) => (
                  <li key={item.placeId}>{item.name}</li>
                ))}
              </ul>
            ) : (
              <p>Nenhum lugar marcado como Talvez.</p>
            )}
          </div>
          <div>
            <h3>Não tenho interesse</h3>
            <p>
              {notInterested.length
                ? `${notInterested.length} lugar(es) excluído(s) das sugestões deste contexto.`
                : "Nenhum lugar excluído."}
            </p>
          </div>
        </div>
      </section>

      <section
        className="traveler-context-summary preparation-review-section"
        aria-labelledby="review-context-title"
      >
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Contexto da viagem</p>
            <h2 id="review-context-title">O que você informou</h2>
          </div>
          <Link
            className="product-secondary-action"
            href={`/viagens/${tripId}/contexto?preparar=1`}
          >
            Editar Contexto
          </Link>
        </div>
        <dl className="trip-overview-summary">
          <div>
            <dt>Viajantes</dt>
            <dd>{model.context.travelerCount ?? "Informação obrigatória ausente"}</dd>
          </div>
          <div>
            <dt>Interesses</dt>
            <dd>
              {model.context.interests?.length
                ? model.context.interests.join(", ")
                : "Não informado"}
            </dd>
          </div>
          <div>
            <dt>Ritmo</dt>
            <dd>{model.context.pace ?? "Não informado"}</dd>
          </div>
          <div>
            <dt>Transporte</dt>
            <dd>{model.context.transportPreference ?? "Não informado"}</dd>
          </div>
          <div>
            <dt>Orçamento</dt>
            <dd>{formatBudget(model.context.budgetTotalCents)}</dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="review-readiness-title"
        className={`traveler-context-summary ${missingRequired.length ? "preparation-review-pending" : "preparation-review-ready"}`}
      >
        <p className="product-eyebrow">Próxima etapa</p>
        <h2 id="review-readiness-title">
          {missingRequired.length ? "Antes de continuar" : "Tudo pronto para montar sua proposta"}
        </h2>
        {missingRequired.length ? (
          <p>Informe: {missingRequired.join(", ")}.</p>
        ) : (
          <p>
            Quando a Etapa 4 estiver disponível, ela poderá usar esta revisão para montar uma
            proposta separada do roteiro.
          </p>
        )}
        <button className="product-primary-action" disabled type="button">
          Montar proposta de roteiro
        </button>
        <p className="preparation-review-note">
          A montagem da Proposta pertence à próxima etapa. Nenhuma Activity, Proposal ou
          recomendação automática foi criada nesta revisão.
        </p>
      </section>
    </section>
  );
}
