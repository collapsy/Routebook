import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzleTripRepository } from "@routebook/database";
import { findTripById } from "@routebook/trip-management";

import { AccommodationForm } from "@/components/accommodation-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hospedagem da viagem — RouteBook",
  description:
    "Edite a hospedagem e as coordenadas usadas nas distâncias da viagem.",
};

export default async function AccommodationPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { tripId } = await params;
  const { saved } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  return (
    <section className="app-page context-page accommodation-page">
      <Link className="back-link" href={`/viagens/${tripId}`}>
        ← Voltar para a visão da viagem
      </Link>

      {saved === "1" ? (
        <p className="success-banner" role="status">
          Hospedagem salva com sucesso.
        </p>
      ) : null}

      <header className="app-page-heading">
        <p className="product-eyebrow">Contexto da viagem</p>
        <h1>Hospedagem de {trip.name}</h1>
        <p>
          Atualize nome, endereço e coordenadas. As distâncias exibidas são
          geodésicas, em linha reta, e não representam rotas, trânsito ou tempo
          de deslocamento.
        </p>
      </header>

      <AccommodationForm
        accommodation={trip.accommodation}
        tripId={tripId}
      />
    </section>
  );
}
