import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { findPublishedPlace, type PlaceCategory } from "@routebook/place-catalog";
import { findTripById } from "@routebook/trip-management";

import { presentAccommodationDistance } from "../distance";
import { removePlaceAction, savePlaceAction } from "./actions";

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
  searchParams,
}: {
  params: Promise<{ tripId: string; placeSlug: string }>;
  searchParams: Promise<{ saved?: string; removed?: string }>;
}) {
  const { tripId, placeSlug } = await params;
  const { saved, removed } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const destinationId = resolveDestinationId(trip.destination.name);
  if (!destinationId) notFound();

  const place = await findPublishedPlace(new DrizzlePlaceRepository(), destinationId, placeSlug);
  if (!place) notFound();

  const savedPlace = await new DrizzleSavedPlaceRepository().find(tripId, place.id);
  const accommodationDistance = presentAccommodationDistance(trip.accommodation?.coordinate, {
    latitude: place.latitude,
    longitude: place.longitude,
  });

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

      {saved === "1" ? (
        <p className="success-banner" role="status">
          Lugar salvo na sua viagem.
        </p>
      ) : null}

      {removed === "1" ? (
        <p className="success-banner" role="status">
          Lugar removido da sua seleção.
        </p>
      ) : null}

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">{categoryLabels[place.category]}</p>
          <h1>{place.name}</h1>
          <p>{place.summary}</p>
        </div>
      </header>

      <section className="traveler-context-summary" aria-labelledby="saved-place-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Sua seleção</p>
            <h2 id="saved-place-title">
              {savedPlace ? "Este lugar está salvo" : "Adicionar à viagem"}
            </h2>
            <p>
              {savedPlace
                ? "Ele faz parte da sua seleção pessoal e continuará salvo após recarregar a página."
                : "Salve este lugar para encontrá-lo depois na seleção da viagem."}
            </p>
          </div>
          <form action={savedPlace ? removePlaceAction : savePlaceAction}>
            <input name="tripId" type="hidden" value={tripId} />
            <input name="placeSlug" type="hidden" value={placeSlug} />
            <button className="product-secondary-action" type="submit">
              {savedPlace ? "Remover dos salvos" : "Salvar lugar"}
            </button>
          </form>
        </div>
      </section>

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
          <dt>Distância da hospedagem</dt>
          <dd>
            {accommodationDistance ? (
              <>
                <strong>{accommodationDistance.label}</strong>
                <span>{accommodationDistance.description}</span>
              </>
            ) : (
              "Indisponível enquanto a hospedagem não possuir coordenadas."
            )}
          </dd>
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
          Esta página apresenta somente informações persistidas e publicadas pelo RouteBook. A
          distância é uma estimativa geodésica em linha reta e não representa rota por ruas, trânsito
          ou tempo de deslocamento. Horários, preços, avaliações e disponibilidade em tempo real ainda
          não fazem parte deste ciclo.
        </p>
      </section>
    </section>
  );
}
