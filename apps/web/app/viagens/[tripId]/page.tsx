import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzleTravelerProfileRepository, DrizzleTripRepository } from "@routebook/database";
import { findTravelerProfile } from "@routebook/traveler-profile";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visão da viagem — RouteBook",
  description: "Consulte o contexto estrutural e os dias da sua viagem.",
};

const interestLabels: Record<string, string> = {
  beaches: "Praias",
  gastronomy: "Gastronomia",
  nightlife: "Vida noturna",
  nature: "Natureza",
  culture: "Cultura",
  rest: "Descanso",
  adventure: "Aventura",
  shopping: "Compras",
};

const paceLabels: Record<string, string> = {
  relaxed: "Relaxado",
  balanced: "Equilibrado",
  intense: "Intenso",
};

const transportLabels: Record<string, string> = {
  walking: "A pé",
  "rental-car": "Carro alugado",
  "ride-hailing": "Aplicativos e táxi",
  "public-transport": "Transporte público",
  mixed: "Combinação de meios",
};

function formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    ...options,
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatBudget(totalCents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    totalCents / 100,
  );
}

export default async function TripOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ contextUpdated?: string }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const profile = await findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId);
  const { contextUpdated } = await searchParams;
  const owner = trip.participants.find((participant) => participant.role === "owner");
  const days = deriveTripDays(trip.period);

  return (
    <section className="app-page trip-overview-page">
      <Link className="back-link" href="/viagens">
        ← Voltar para Minhas viagens
      </Link>

      {contextUpdated === "1" ? (
        <p className="success-banner" role="status">
          Contexto da viagem salvo com sucesso.
        </p>
      ) : null}

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">
            {trip.status === "draft" ? "Viagem em rascunho" : trip.status}
          </p>
          <h1>{trip.name}</h1>
          <p>
            Esta visão reúne a estrutura da Viagem e o contexto progressivo dos viajantes, sem gerar
            automaticamente lugares, roteiro ou recomendações.
          </p>
        </div>
        <span className="trip-context-version">Contexto estrutural v{trip.contextVersion}</span>
      </header>

      <dl className="trip-overview-summary">
        <div>
          <dt>Destino</dt>
          <dd>{trip.destination.name}</dd>
        </div>
        <div>
          <dt>Período</dt>
          <dd>
            {formatDate(trip.period.startDate)} a {formatDate(trip.period.endDate)}
          </dd>
        </div>
        <div>
          <dt>Hospedagem</dt>
          <dd>{trip.accommodation?.name ?? "Ainda não informada"}</dd>
          {trip.accommodation?.address ? <small>{trip.accommodation.address}</small> : null}
        </div>
        <div>
          <dt>Responsável</dt>
          <dd>{owner?.displayName ?? "Owner não identificado"}</dd>
        </div>
      </dl>

      <section className="traveler-context-summary" aria-labelledby="traveler-context-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Perfil dos viajantes</p>
            <h2 id="traveler-context-title">
              {profile ? "Contexto configurado" : "Personalização ainda não iniciada"}
            </h2>
          </div>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/contexto`}>
            {profile ? "Editar contexto" : "Configurar contexto"}
          </Link>
        </div>

        {profile ? (
          <dl className="traveler-context-details">
            <div>
              <dt>Viajantes</dt>
              <dd>{profile.travelerCount}</dd>
            </div>
            <div>
              <dt>Interesses</dt>
              <dd>
                {profile.interests.length > 0
                  ? profile.interests.map((interest) => interestLabels[interest]).join(", ")
                  : "Ainda não informados"}
              </dd>
            </div>
            <div>
              <dt>Ritmo</dt>
              <dd>{profile.pace ? paceLabels[profile.pace] : "Ainda não informado"}</dd>
            </div>
            <div>
              <dt>Transporte</dt>
              <dd>
                {profile.transportPreference
                  ? transportLabels[profile.transportPreference]
                  : "Ainda não informado"}
              </dd>
            </div>
            <div>
              <dt>Orçamento estimado</dt>
              <dd>{profile.budget ? formatBudget(profile.budget.totalCents) : "Ainda não informado"}</dd>
            </div>
            <div>
              <dt>Versão do perfil</dt>
              <dd>v{profile.version}</dd>
            </div>
          </dl>
        ) : (
          <p>
            Quantidade de viajantes, interesses, ritmo, transporte e orçamento são opcionais e podem
            ser preenchidos aos poucos.
          </p>
        )}
      </section>

      <section className="trip-days-section" aria-labelledby="trip-days-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Estrutura temporal</p>
            <h2 id="trip-days-title">{days.length} dias de viagem</h2>
          </div>
          <p>Os dias são derivados do período salvo e ainda não possuem atividades.</p>
        </div>

        <ol className="trip-days-grid">
          {days.map((day) => (
            <li key={day.date}>
              <span>Dia {day.index}</span>
              <strong>
                {formatDate(day.date, {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </strong>
              <small>Planejamento ainda vazio</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="trip-next-steps" aria-labelledby="trip-next-steps-title">
        <div>
          <p className="product-eyebrow">Próximos passos</p>
          <h2 id="trip-next-steps-title">Continue no seu ritmo</h2>
          <p>
            Depois do contexto, o próximo ciclo poderá iniciar a descoberta de praias, restaurantes e
            vida noturna com informações rastreáveis.
          </p>
        </div>
        <Link className="product-secondary-action" href="/viagens">
          Ver todas as viagens
        </Link>
      </section>
    </section>
  );
}
