import Link from "next/link";

import type { Trip } from "@routebook/trip-management";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export function TripCard({ trip }: { trip: Trip }) {
  const owner = trip.participants.find((participant) => participant.role === "owner");

  return (
    <article className="trip-card">
      <div className="trip-card-heading">
        <div>
          <p className="product-eyebrow">{trip.status === "draft" ? "Rascunho" : trip.status}</p>
          <h2>
            <Link className="trip-card-link" href={`/viagens/${trip.id}`}>
              {trip.name}
            </Link>
          </h2>
        </div>
        <span className="trip-context-version">Contexto v{trip.contextVersion}</span>
      </div>

      <dl className="trip-card-details">
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
        </div>
        <div>
          <dt>Responsável</dt>
          <dd>{owner?.displayName ?? "Owner não identificado"}</dd>
        </div>
      </dl>

      <div className="trip-card-footer">
        <p className="trip-card-id">TripId: {trip.id}</p>
        <Link className="product-secondary-action" href={`/viagens/${trip.id}`}>
          Abrir viagem
        </Link>
      </div>
    </article>
  );
}
