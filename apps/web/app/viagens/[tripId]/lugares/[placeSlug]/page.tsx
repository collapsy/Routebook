import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzlePlaceRepository, DrizzleTripRepository } from "@routebook/database";
import { findPublishedPlace, type PlaceCategory } from "@routebook/place-catalog";
import { findTripById } from "@routebook/trip-management";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detalhes do lugar — RouteBook",
  description: "Consulte os detalhes básicos de um lugar publicado para a sua viagem.",
};

const categoryLabels: Record<PlaceCategory, string> = {
  beach: "Praia",
  gastronomy: "Gastronomia",
  nature: "Natureza",
  nightlife: "Vida noturna",
};

function resolveDestinationId(destinationName: string): string | null {
  const normalized = destinationName.trim().toLocaleLowerCase("pt-BR");
  return normalized.includes("pipa") ? "pipa-rn-br" : null;
}

function formatCoordinate(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(value);
}

export default async function PlaceDetailsPage({
  params,
}: {
  params: Promise<{ tripId: string; placeSlug: string }>;
}) {
  const { tripId, placeSlug } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const destinationId = resolveDestinationId(trip.destination.name);
  if (!destinationId) notFound();

  const place = await findPublishedPlace(new DrizzlePlaceRepository(), destinationId, placeSlug);
  if (!place) notFound();

  return (
    <section className="app-page trip-overview-page">
      <div className="section-heading-row">
        <Link className="back-link" href={`/viagens/${tripId}/lugares`}>
          ← Voltar para lugares
        </Link>
        <Link className="product-secondary-action" href={`/viagens/${tripId}`}>
          Visão da viagem
        </Link>
      </div>

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">{categoryLabels[place.category]}</p>
          <h1>{place.name}</h1>
          <p>{place.summary}</p>
        </div>
      </header>

      <dl className="trip-overview-summary">
        <div>
          <dt>Destino</dt>
          <dd>{trip.destination.name}</dd>
        </div>
        <div>
          <dt>Categoria</dt>
          <dd>{categoryLabels[place.category]}</dd>
        </div>
        <div>
          <dt>Endereço</dt>
          <dd>{place.addressLabel ?? "Ainda não informado"}</dd>
        </div>
        <div>
          <dt>Coordenadas</dt>
          <dd>
            {formatCoordinate(place.latitude)}, {formatCoordinate(place.longitude)}
          </dd>
        </div>
      </dl>

      <section className="traveler-context-summary" aria-labelledby="place-data-note">
        <p className="product-eyebrow">Informação rastreável</p>
        <h2 id="place-data-note">Detalhes básicos do catálogo</h2>
        <p>
          Esta página apresenta somente informações persistidas e publicadas pelo RouteBook.
          Horários, preços, avaliações, rotas e disponibilidade em tempo real ainda não fazem parte
          deste ciclo.
        </p>
      </section>
    </section>
  );
}
