import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzleTripRepository } from "@routebook/database";
import { findTripById } from "@routebook/trip-management";

import { AccommodationForm } from "@/components/accommodation-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hospedagem da viagem — RouteBook",
  description: "Edite a hospedagem usada como referência para mapa e distâncias.",
};

export default async function AccommodationPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ saved?: string; located?: string }>;
}) {
  const { tripId } = await params;
  const { saved, located } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  return (
    <section className="app-page context-page accommodation-page">
      <Link className="back-link" href={`/viagens/${tripId}`}>
        ← Voltar para a visão da viagem
      </Link>

      {saved === "1" && located === "1" ? (
        <p className="success-banner" role="status">
          Hospedagem salva. Mapa e distâncias já usam essa localização.
        </p>
      ) : saved === "1" && located === "0" ? (
        <div className="form-error" role="status">
          Hospedagem salva, mas não foi possível confirmar a localização. Tente um endereço mais
          completo ou use as opções avançadas.
        </div>
      ) : saved === "1" ? (
        <p className="success-banner" role="status">
          Hospedagem salva.
        </p>
      ) : null}

      <header className="app-page-heading">
        <p className="product-eyebrow">Planejamento da viagem</p>
        <h1>Hospedagem de {trip.name}</h1>
        <p>
          Informe onde você vai ficar. Essa localização serve de referência para mapa e distâncias.
        </p>
      </header>

      <AccommodationForm accommodation={trip.accommodation} tripId={tripId} />
    </section>
  );
}
