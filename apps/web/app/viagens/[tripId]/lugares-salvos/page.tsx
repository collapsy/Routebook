import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import type { PlaceCategory } from "@routebook/place-catalog";
import { listSavedPlaces } from "@routebook/saved-places";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

import { PlacePrimaryImage } from "../../../../components/place-primary-image";
import { TripMap } from "../../../../components/trip-map";
import type { TripMapPoint } from "../../../../lib/trip-map";
import { presentAccommodationDistance } from "../lugares/distance";
import { addSavedPlaceToItineraryAction, removeSavedPlaceAction } from "./actions";

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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function SavedPlacesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{
    removed?: string;
    adicionadoAoRoteiro?: string;
    erro?: string;
  }>;
}) {
  const { tripId } = await params;
  const { removed, adicionadoAoRoteiro, erro } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const savedPlaces = await listSavedPlaces(new DrizzleSavedPlaceRepository(), tripId);
  const places = await new DrizzlePlaceRepository().listByIds(
    savedPlaces.map((selection) => selection.placeId),
  );
  const tripDays = deriveTripDays(trip.period);
  const mapPoints: TripMapPoint[] = places.map((place) => ({
    id: place.id,
    label: place.name,
    kind: "saved-place",
    latitude: place.latitude,
    longitude: place.longitude,
    href: `/viagens/${tripId}/lugares/${place.slug}`,
  }));

  if (trip.accommodation?.coordinate) {
    mapPoints.unshift({
      id: "accommodation",
      label: trip.accommodation.name,
      kind: "accommodation",
      latitude: trip.accommodation.coordinate.latitude,
      longitude: trip.accommodation.coordinate.longitude,
    });
  }

  return (
    <section className="app-page trip-overview-page">
      <div className="section-heading-row">
        <Link className="back-link" href={`/viagens/${tripId}`}>
          ← Voltar para a viagem
        </Link>
        <div className="section-heading-row">
          <Link className="product-secondary-action" href={`/viagens/${tripId}/roteiro`}>
            Abrir roteiro
          </Link>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
            Explorar catálogo
          </Link>
        </div>
      </div>

      {removed === "1" ? (
        <p className="success-banner" role="status">
          Lugar removido da sua seleção.
        </p>
      ) : null}
      {adicionadoAoRoteiro === "1" ? (
        <p className="success-banner" role="status">
          Lugar adicionado ao roteiro. Ele continua salvo na sua seleção.
        </p>
      ) : null}
      {erro ? (
        <p className="form-error itinerary-feedback" role="alert">
          {erro}
        </p>
      ) : null}

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">Sua seleção</p>
          <h1>Lugares salvos</h1>
          <p>
            Reúna os lugares que deseja considerar durante a viagem para {trip.destination.name} e
            transforme uma intenção em Atividade quando decidir o Dia.
          </p>
          <p>
            As distâncias exibidas são estimativas em linha reta a partir da hospedagem e não
            representam rota, trânsito ou tempo de deslocamento.
          </p>
        </div>
        <span className="trip-context-version">{places.length} salvos</span>
      </header>

      <TripMap points={mapPoints} title="Hospedagem e lugares salvos" />

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
            const titleId = `saved-place-${place.id}`;

            return (
              <li className="place-card" key={place.id}>
                <PlacePrimaryImage
                  category={place.category}
                  placeName={place.name}
                  primaryImage={place.primaryImage}
                />
                <p className="product-eyebrow">{categoryLabels[place.category]}</p>
                <h2 id={titleId}>{place.name}</h2>
                <p>{place.summary}</p>
                <p>
                  <strong>Distância da hospedagem: </strong>
                  {accommodationDistance
                    ? `${accommodationDistance.label} — ${accommodationDistance.description}`
                    : "indisponível enquanto a hospedagem não possuir coordenadas."}
                </p>

                <form
                  action={addSavedPlaceToItineraryAction}
                  aria-labelledby={titleId}
                  className="saved-place-itinerary-form"
                >
                  <input name="tripId" type="hidden" value={tripId} />
                  <input name="placeSlug" type="hidden" value={place.slug} />

                  <div className="form-field saved-place-itinerary-day">
                    <label htmlFor={`day-${place.id}`}>Adicionar ao dia</label>
                    <select
                      defaultValue={tripDays[0]?.date}
                      id={`day-${place.id}`}
                      name="dayDate"
                      required
                    >
                      {tripDays.map((day) => (
                        <option key={day.date} value={day.date}>
                          Dia {day.index} — {formatDate(day.date)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor={`time-${place.id}`}>Horário opcional</label>
                    <input id={`time-${place.id}`} name="startTime" type="time" />
                  </div>

                  <div className="form-field">
                    <label htmlFor={`duration-${place.id}`}>Duração opcional</label>
                    <input
                      id={`duration-${place.id}`}
                      min={1}
                      name="durationMinutes"
                      placeholder="Minutos"
                      step={1}
                      type="number"
                    />
                  </div>

                  <button className="product-button" type="submit">
                    Adicionar ao roteiro
                  </button>
                </form>

                <div className="section-heading-row saved-place-card-actions">
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
