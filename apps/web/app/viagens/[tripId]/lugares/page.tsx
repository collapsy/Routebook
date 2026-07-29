import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzlePlaceRepository, DrizzleTripRepository } from "@routebook/database";
import {
  PLACE_CATEGORIES,
  listPublishedPlaces,
  type PlaceCategory,
} from "@routebook/place-catalog";
import { findTripById } from "@routebook/trip-management";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lugares da viagem — RouteBook",
  description: "Explore lugares publicados do destino da sua viagem.",
};

const categoryLabels: Record<PlaceCategory, string> = {
  beach: "Praias",
  gastronomy: "Gastronomia",
  nature: "Natureza",
  nightlife: "Vida noturna",
};

function resolveDestinationId(destinationName: string): string | null {
  const normalized = destinationName.trim().toLocaleLowerCase("pt-BR");
  return normalized.includes("pipa") ? "pipa-rn-br" : null;
}

function parseCategory(value?: string): PlaceCategory | undefined {
  return PLACE_CATEGORIES.find((category) => category === value);
}

export default async function PlacesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const destinationId = resolveDestinationId(trip.destination.name);
  const { categoria } = await searchParams;
  const selectedCategory = parseCategory(categoria);
  const places = destinationId
    ? await listPublishedPlaces(new DrizzlePlaceRepository(), destinationId, selectedCategory)
    : [];

  return (
    <section className="app-page trip-overview-page">
      <Link className="back-link" href={`/viagens/${tripId}`}>
        ← Voltar para a viagem
      </Link>

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">Descoberta inicial</p>
          <h1>Lugares em {trip.destination.name}</h1>
          <p>
            Explore opções publicadas por categoria. Esta lista ainda não representa ranking ou
            recomendação personalizada.
          </p>
        </div>
      </header>

      <nav aria-label="Filtrar lugares por categoria" className="section-heading-row">
        <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
          Todos
        </Link>
        {PLACE_CATEGORIES.map((category) => (
          <Link
            aria-current={selectedCategory === category ? "page" : undefined}
            className="product-secondary-action"
            href={`/viagens/${tripId}/lugares?categoria=${category}`}
            key={category}
          >
            {categoryLabels[category]}
          </Link>
        ))}
      </nav>

      {places.length > 0 ? (
        <ul className="trip-days-grid" aria-label="Lugares publicados">
          {places.map((place) => (
            <li key={place.id}>
              <span>{categoryLabels[place.category]}</span>
              <strong>{place.name}</strong>
              <p>{place.summary}</p>
              <small>{place.addressLabel ?? "Endereço ainda não informado"}</small>
            </li>
          ))}
        </ul>
      ) : (
        <section className="traveler-context-summary" aria-live="polite">
          <p className="product-eyebrow">Catálogo vazio</p>
          <h2>Nenhum lugar publicado para este filtro</h2>
          <p>
            Tente outra categoria. Destinos ainda não cobertos pelo catálogo permanecem com estado
            vazio explícito.
          </p>
        </section>
      )}
    </section>
  );
}
