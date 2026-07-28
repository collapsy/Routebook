import type { Metadata } from "next";
import Link from "next/link";

import { DrizzleTripRepository } from "@routebook/database";
import { listTrips } from "@routebook/trip-management";

import { EmptyTripsState } from "@/components/empty-trips-state";
import { TripCard } from "@/components/trip-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Minhas viagens — RouteBook",
  description: "Acesse, organize e crie suas viagens no RouteBook.",
};

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const trips = await listTrips(new DrizzleTripRepository());
  const { created } = await searchParams;

  return (
    <section className="app-page">
      <header className="app-page-heading trips-page-heading">
        <div>
          <p className="product-eyebrow">Seu espaço de planejamento</p>
          <h1>Minhas viagens</h1>
          <p>
            Cada viagem reúne o contexto estrutural que orientará lugares, distâncias, roteiro e
            recomendações futuras.
          </p>
        </div>
        {trips.length > 0 ? (
          <Link className="product-primary-action" href="/viagens/nova">
            Criar nova viagem
          </Link>
        ) : null}
      </header>

      {created === "1" ? (
        <p className="success-banner" role="status">
          Viagem criada e salva com sucesso.
        </p>
      ) : null}

      {trips.length === 0 ? (
        <EmptyTripsState />
      ) : (
        <div className="trips-grid">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </section>
  );
}
