import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { listPublishedPlaces, type PlaceCategory } from "@routebook/place-catalog";
import { listSavedPlaces } from "@routebook/saved-places";
import { findTripById } from "@routebook/trip-management";

import { presentAccommodationDistance } from "../lugares/distance";
import { removeSavedPlaceAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lugares salvos — RouteBook",
  description: "Consulte os lugares selecionados para a sua viagem.",
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

export default async function SavedPlacesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ removed?: string }>;
}) {
  const { tripId } = await params;
  const { removed } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const destinationId = resolveDestinationId(trip.destination.name);
  if (!destinationId) notFound();

  const [savedPlaces, publishedPlaces] = await Promise.all([
    listSavedPlaces(new DrizzleSavedPlaceRepository(), tripId),
    listPublishedPlaces(new DrizzlePlaceRepository(), destinationId),
  ]);

  const savedIds = new Set(savedPlaces.map((selection) => selection.placeId));
  const places = publishedPlaces.filter((place) => savedIds.has(place.id));

  return (
    <section className="app-page trip-overview-page">
      <div className="section-heading-row">
        <Link className="back-link" href={`/viagens/${tripId}`}>
          ← Voltar para a viagem
        </Link>
        <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
          Explorar catálogo
        </Link>
      </div>

      {removed === "1" ? (
        <p className="success-banner" role="status">
          Lugar removido da sua seleção.
        </p>
      ) : null}

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">Sua seleção</p>
          <h1>Lugares salvos</h1>
          <p>
            Reúna os lugares que deseja considerar durante a viagem para {trip.destination.name}.
          </p>
          <p>
            As distâncias exibidas são estimativas em linha reta a partir da hospedagem e não
            representam rota, trânsito ou tempo de deslocamento.
          </p>
        </div>
        <span className="trip-context-version">{places.length} salvos</span>
      </header>

      {places.length === 0 ? (
        <section className="traveler-context-summary" aria-labelledby="saved-empty-title">
          <p className="product-eyebrow">Seleção vazia</p>
          <h2 id="saved-empty-title">Você ainda não salvou nenhum lugar</h2>
          <p>
            Explore o catálogo e salve praias, restaurantes, natureza ou vida noturna para
            encontrá-los aqui.
          </p>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
            Explorar lugares
          </Link>
        </section>
      ) : (
        <ul className="place-catalog-grid">
          {places.map((place) => {
            const accommodationDistance = presentAccommodationDistance(
              trip.accommodation?.coordinate,
              {
                latitude: place.latitude,
                longitude: place.longitude,
              },
            );

            return (
              <li className="place-card" key={place.id}>
                <p className="product-eyebrow">{categoryLabels[place.category]}</p>
                <h2>{place.name}</h2>
                <p>{place.summary}</p>
                <p>
                  <strong>Distância da hospedagem: </strong>
                  {accommodationDistance
                    ? `${accommodationDistance.label} — ${accommodationDistance.description}`
                    : "indisponível enquanto a hospedagem não possuir coordenadas."}
                </p>
                <div className="section-heading-row">
                  <Link
                    className="product-secondary-action"
                    href={`/viagens/${tripId}/lugares/${place.slug}`}
                  >
                    Ver detalhes
                  </Link>
                  <form action={removeSavedPlaceAction}>
                    <input name="tripId" type="hidden" value={tripId} />
                    <input name="placeSlug" type="hidden" value={place.slug} />
                    <button className="product-secondary-action" type="submit">
                      Remover
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
