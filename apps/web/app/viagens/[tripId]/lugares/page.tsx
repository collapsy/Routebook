import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzlePlaceRepository, DrizzleTripRepository } from "@routebook/database";
import {
  PLACE_CATEGORIES,
  PLACE_PRICE_RANGES,
  listPublishedPlaces,
} from "@routebook/place-catalog";
import { findTripById } from "@routebook/trip-management";

import { TripMap } from "../../../../components/trip-map";
import type { TripMapPoint } from "../../../../lib/trip-map";
import {
  categoryLabels,
  filterPlaces,
  parseMaximumDistance,
  parsePlaceCategory,
  parsePlacePriceRange,
  priceRangeLabels,
} from "./filters";

import styles from "./place-discovery.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lugares da viagem — RouteBook",
  description: "Explore lugares publicados do destino da sua viagem.",
};

type DiscoverySearchParams = {
  busca?: string;
  categoria?: string;
  distancia?: string;
  preco?: string;
};

const distanceOptions = [1, 3, 5, 10] as const;

function resolveDestinationId(destinationName: string): string | null {
  const normalized = destinationName.trim().toLocaleLowerCase("pt-BR");
  return normalized.includes("pipa") ? "pipa-rn-br" : null;
}

function discoveryHref(tripId: string, values: DiscoverySearchParams): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value) query.set(key, value);
  }

  const serialized = query.toString();
  return `/viagens/${tripId}/lugares${serialized ? `?${serialized}` : ""}`;
}

function formatDistance(meters: number): string {
  if (meters < 1_000) return `${Math.round(meters)} m`;
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(meters / 1_000)} km`;
}

export default async function PlacesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<DiscoverySearchParams>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const destinationId = resolveDestinationId(trip.destination.name);
  const rawFilters = await searchParams;
  const search = rawFilters.busca?.trim().slice(0, 120) || undefined;
  const category = parsePlaceCategory(rawFilters.categoria);
  const priceRange = parsePlacePriceRange(rawFilters.preco);
  const accommodationCoordinate = trip.accommodation?.coordinate;
  const maximumDistanceMeters = accommodationCoordinate
    ? parseMaximumDistance(rawFilters.distancia)
    : undefined;
  const publishedPlaces = destinationId
    ? await listPublishedPlaces(new DrizzlePlaceRepository(), destinationId)
    : [];
  const filteredPlaces = filterPlaces(
    publishedPlaces,
    {
      ...(search ? { search } : {}),
      ...(category ? { category } : {}),
      ...(priceRange ? { priceRange } : {}),
      ...(maximumDistanceMeters ? { maximumDistanceMeters } : {}),
    },
    accommodationCoordinate,
  );
  const canonicalParams: DiscoverySearchParams = {
    ...(search ? { busca: search } : {}),
    ...(category ? { categoria: category } : {}),
    ...(maximumDistanceMeters ? { distancia: String(maximumDistanceMeters / 1_000) } : {}),
    ...(priceRange ? { preco: priceRange } : {}),
  };
  const activeFilters = [
    ...(search
      ? [
          {
            key: "busca" as const,
            label: `Busca: ${search}`,
          },
        ]
      : []),
    ...(category
      ? [{ key: "categoria" as const, label: `Categoria: ${categoryLabels[category]}` }]
      : []),
    ...(maximumDistanceMeters
      ? [
          {
            key: "distancia" as const,
            label: `Até ${maximumDistanceMeters / 1_000} km da hospedagem`,
          },
        ]
      : []),
    ...(priceRange
      ? [{ key: "preco" as const, label: `Preço: ${priceRangeLabels[priceRange]}` }]
      : []),
  ];
  const mapPoints: TripMapPoint[] = filteredPlaces.map(({ place }) => ({
    id: place.id,
    label: place.name,
    kind: "published-place",
    latitude: place.latitude,
    longitude: place.longitude,
    href: `/viagens/${tripId}/lugares/${place.slug}`,
  }));

  if (accommodationCoordinate && trip.accommodation) {
    mapPoints.unshift({
      id: "accommodation",
      label: trip.accommodation.name,
      kind: "accommodation",
      latitude: accommodationCoordinate.latitude,
      longitude: accommodationCoordinate.longitude,
    });
  }

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
            Pesquise o catálogo publicado e combine filtros. Com Hospedagem geocodificada, a lista
            prioriza os Lugares mais próximos pela distância geodésica; isso não representa rota,
            duração ou recomendação personalizada.
          </p>
        </div>
      </header>

      <form action={`/viagens/${tripId}/lugares`} className={styles.filters} method="get">
        <div className={styles.searchField}>
          <label htmlFor="place-search">Nome ou termo</label>
          <input
            defaultValue={search}
            id="place-search"
            maxLength={120}
            name="busca"
            placeholder="Ex.: praia, gastronomia ou endereço"
            type="search"
          />
        </div>
        <div>
          <label htmlFor="place-category">Categoria</label>
          <select defaultValue={category ?? ""} id="place-category" name="categoria">
            <option value="">Todas</option>
            {PLACE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {categoryLabels[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="place-distance">Distância máxima</label>
          <select
            defaultValue={maximumDistanceMeters ? String(maximumDistanceMeters / 1_000) : ""}
            disabled={!accommodationCoordinate}
            id="place-distance"
            name="distancia"
          >
            <option value="">Qualquer distância</option>
            {distanceOptions.map((kilometers) => (
              <option key={kilometers} value={kilometers}>
                Até {kilometers} km
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="place-price">Faixa de preço</label>
          <select defaultValue={priceRange ?? ""} id="place-price" name="preco">
            <option value="">Qualquer faixa</option>
            {PLACE_PRICE_RANGES.map((value) => (
              <option key={value} value={value}>
                {priceRangeLabels[value]}
              </option>
            ))}
          </select>
        </div>
        <button className="product-primary-action" type="submit">
          Aplicar filtros
        </button>
      </form>

      {!accommodationCoordinate ? (
        <p className={styles.notice} role="status">
          O filtro de distância fica disponível após informar a localização da hospedagem.
        </p>
      ) : (
        <p className={styles.notice}>
          Distâncias estimadas em linha reta a partir da hospedagem; não representam rota ou tempo
          de deslocamento.
        </p>
      )}

      {activeFilters.length > 0 ? (
        <section aria-label="Filtros ativos" className={styles.activeFilters}>
          <strong>Filtros ativos</strong>
          <ul>
            {activeFilters.map((filter) => {
              const nextParams = { ...canonicalParams };
              delete nextParams[filter.key];
              return (
                <li key={filter.key}>
                  <Link href={discoveryHref(tripId, nextParams)}>
                    {filter.label} <span aria-hidden="true">×</span>
                    <span className={styles.visuallyHidden}> Remover filtro</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
            Limpar filtros
          </Link>
        </section>
      ) : null}

      <div className={styles.resultHeading}>
        <h2>
          {filteredPlaces.length === 1
            ? "1 lugar encontrado"
            : `${filteredPlaces.length} lugares encontrados`}
        </h2>
        <p>Lista e mapa exibem o mesmo conjunto filtrado.</p>
      </div>

      {filteredPlaces.length > 0 ? (
        <ul className="trip-days-grid" aria-label="Lugares publicados">
          {filteredPlaces.map(({ place, distanceMeters }) => (
            <li key={place.id}>
              <span>{categoryLabels[place.category]}</span>
              <strong>{place.name}</strong>
              <p>{place.summary}</p>
              <small>{place.addressLabel ?? "Endereço ainda não informado"}</small>
              <small>
                Faixa de preço aproximada:{" "}
                {place.priceRange ? priceRangeLabels[place.priceRange] : "indisponível"}
              </small>
              {distanceMeters !== undefined ? (
                <small>{formatDistance(distanceMeters)} em linha reta da hospedagem</small>
              ) : null}
              <Link
                className="product-secondary-action"
                href={`/viagens/${tripId}/lugares/${place.slug}`}
              >
                Ver detalhes
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <section className="traveler-context-summary" aria-live="polite">
          <p className="product-eyebrow">Nenhum resultado</p>
          <h2>Nenhum lugar corresponde aos filtros</h2>
          <p>Remova um filtro, amplie a distância ou limpe todos para voltar ao catálogo.</p>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
            Limpar filtros
          </Link>
        </section>
      )}

      <TripMap
        description="O mapa usa exatamente os lugares visíveis na lista, além da hospedagem como referência quando disponível."
        emptyDescription="Não há lugar com coordenadas no conjunto filtrado. Limpe ou amplie os filtros para recuperar resultados."
        emptyTitle="Nenhum lugar para exibir no mapa"
        points={mapPoints}
        title="Mapa dos lugares filtrados"
      />
    </section>
  );
}
