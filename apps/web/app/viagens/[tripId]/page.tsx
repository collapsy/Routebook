import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzleTripRepository } from "@routebook/database";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visão da viagem — RouteBook",
  description: "Consulte o contexto estrutural e os dias da sua viagem.",
};

function formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    ...options,
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function TripOverviewPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const owner = trip.participants.find((participant) => participant.role === "owner");
  const days = deriveTripDays(trip.period);

  return (
    <section className="app-page trip-overview-page">
      <Link className="back-link" href="/viagens">
        ← Voltar para Minhas viagens
      </Link>

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">{trip.status === "draft" ? "Viagem em rascunho" : trip.status}</p>
          <h1>{trip.name}</h1>
          <p>
            Esta é a base estrutural da viagem. Preferências, lugares e roteiro serão adicionados em
            etapas posteriores, sem alterar os dados já salvos.
          </p>
        </div>
        <span className="trip-context-version">Contexto v{trip.contextVersion}</span>
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
            O próximo incremento permitirá configurar o contexto da viagem. A descoberta de praias,
            restaurantes e vida noturna virá depois dessa base.
          </p>
        </div>
        <Link className="product-secondary-action" href="/viagens">
          Ver todas as viagens
        </Link>
      </section>
    </section>
  );
}
