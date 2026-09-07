import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzleTripRepository } from "@routebook/database";
import { findTripById } from "@routebook/trip-management";

import { AccommodationForm } from "@/components/accommodation-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hospedagem da viagem — RouteBook",
  description: "Edite a hospedagem usada como referência espacial da viagem.",
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
          Hospedagem salva e localização confirmada. Mapa e distâncias já podem usar esse ponto.
        </p>
      ) : saved === "1" && located === "0" ? (
        <div className="form-error" role="status">
          Hospedagem salva, mas não conseguimos confirmar a localização automaticamente. O restante
          da viagem continua disponível; tente salvar novamente com um endereço mais completo ou use
          as opções avançadas.
        </div>
      ) : saved === "1" ? (
        <p className="success-banner" role="status">
          Hospedagem salva com sucesso.
        </p>
      ) : null}

      <header className="app-page-heading">
        <p className="product-eyebrow">Contexto da viagem</p>
        <h1>Hospedagem de {trip.name}</h1>
        <p>
          Informe onde você vai ficar. O RouteBook usa essa localização como referência para mapa e
          distâncias e tenta encontrá-la automaticamente quando você salva.
        </p>
      </header>

      <AccommodationForm accommodation={trip.accommodation} tripId={tripId} />
    </section>
  );
}
