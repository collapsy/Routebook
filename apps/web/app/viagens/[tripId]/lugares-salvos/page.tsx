import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleTripPlacePreferenceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import type { PlaceCategory } from "@routebook/place-catalog";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

import { PlacePrimaryImage } from "../../../../components/place-primary-image";
import {
  TripPlacePreferenceControls,
  tripPlaceIntentLabels,
} from "../../../../components/trip-place-preference-controls";
import { TripMap } from "../../../../components/trip-map";
import type { TripMapPoint } from "../../../../lib/trip-map";
import { presentAccommodationDistance } from "../lugares/distance";
import {
  addSelectedPlaceToItineraryAction,
  clearSelectionPlacePreferenceAction,
  setSelectionPlacePreferenceAction,
} from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Minha seleção — RouteBook",
  description: "Revise suas intenções e prioridades de lugares para a viagem.",
};

const categoryLabels: Record<PlaceCategory, string> = {
  beach: "Praia",
  gastronomy: "Gastronomia",
  nature: "Natureza",
  nightlife: "Vida noturna",
  attraction: "Ponto turístico",
  viewpoint: "Mirante",
  tour: "Passeio",
  shopping: "Compras",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function TripSelectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{
    salvo?: string;
    removed?: string;
    adicionadoAoRoteiro?: string;
    erro?: string;
  }>;
}) {
  const { tripId } = await params;
  const { salvo, removed, adicionadoAoRoteiro, erro } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const preferences = await new DrizzleTripPlacePreferenceRepository().listByTripId(tripId);
  const places = await new DrizzlePlaceRepository().listByIds(
    preferences.map((preference) => preference.placeId),
  );
  const placeById = new Map(places.map((place) => [place.id, place]));
  const entries = preferences.flatMap((preference) => {
    const place = placeById.get(preference.placeId);
    return place ? [{ place, preference }] : [];
  });
  const tripDays = deriveTripDays(trip.period);
  const wantCount = preferences.filter((preference) => preference.intent === "WANT").length;
  const maybeCount = preferences.filter((preference) => preference.intent === "MAYBE").length;
  const notInterestedCount = preferences.filter(
    (preference) => preference.intent === "NOT_INTERESTED",
  ).length;

  const mapPoints: TripMapPoint[] = entries.map(({ place }) => ({
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
            Explorar lugares
          </Link>
        </div>
      </div>

      {salvo === "1" ? (
        <p className="success-banner" role="status">
          Lugar adicionado à Minha seleção como Quero ir.
        </p>
      ) : null}
      {removed === "1" ? (
        <p className="success-banner" role="status">
          Preferência removida. O que já estiver no Roteiro continua lá.
        </p>
      ) : null}
      {adicionadoAoRoteiro === "1" ? (
        <p className="success-banner" role="status">
          Lugar adicionado ao Roteiro. A preferência em Minha seleção foi preservada.
        </p>
      ) : null}
      {erro ? (
        <p className="form-error itinerary-feedback" role="alert">
          {erro}
        </p>
      ) : null}

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">Coleção da viagem</p>
          <h1>Minha seleção</h1>
          <p>
            Revise o que você quer considerar para {trip.destination.name}. A seleção registra
            intenção e prioridade, mas não altera o Roteiro automaticamente.
          </p>
          <p>
            Quero ir: {wantCount} · Talvez: {maybeCount} · Não tenho interesse: {notInterestedCount}
          </p>
          <p>
            As distâncias exibidas são estimativas em linha reta a partir da hospedagem e não
            representam rota, trânsito ou tempo de deslocamento.
          </p>
        </div>
        <span className="trip-context-version">{entries.length} avaliados</span>
      </header>

      <TripMap points={mapPoints} title="Hospedagem e Minha seleção" />

      {entries.length === 0 ? (
        <section className="traveler-context-summary" aria-labelledby="selection-empty-title">
          <p className="product-eyebrow">Seleção vazia</p>
          <h2 id="selection-empty-title">Você ainda não avaliou nenhum lugar</h2>
          <p>
            Explore lugares e marque Quero ir, Talvez ou Não tenho interesse. Nenhuma escolha
            adiciona uma atividade automaticamente.
          </p>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
            Explorar lugares
          </Link>
        </section>
      ) : (
        <ul className="place-catalog-grid">
          {entries.map(({ place, preference }) => {
            const accommodationDistance = presentAccommodationDistance(
              trip.accommodation?.coordinate,
              {
                latitude: place.latitude,
                longitude: place.longitude,
              },
            );
            const titleId = `selection-place-${place.id}`;

            return (
              <li className="place-card" key={place.id}>
                <PlacePrimaryImage
                  category={place.category}
                  placeName={place.name}
                  primaryImage={place.primaryImage}
                />
                <p className="product-eyebrow">
                  {categoryLabels[place.category]} · {tripPlaceIntentLabels[preference.intent]}
                  {preference.priority === "MUST_DO" ? " · Imperdível" : ""}
                </p>
                <h2 id={titleId}>{place.name}</h2>
                <p>{place.summary}</p>
                <p>
                  <strong>Distância da hospedagem: </strong>
                  {accommodationDistance
                    ? `${accommodationDistance.label} — ${accommodationDistance.description}`
                    : "informe a localização da hospedagem para calcular esta distância."}
                </p>

                <TripPlacePreferenceControls
                  clearAction={clearSelectionPlacePreferenceAction}
                  placeName={place.name}
                  placeSlug={place.slug}
                  preference={preference}
                  setAction={setSelectionPlacePreferenceAction}
                  tripId={tripId}
                />

                {preference.intent === "WANT" ? (
                  <form
                    action={addSelectedPlaceToItineraryAction}
                    aria-labelledby={titleId}
                    className="saved-place-itinerary-form"
                  >
                    <input name="tripId" type="hidden" value={tripId} />
                    <input name="placeSlug" type="hidden" value={place.slug} />

                    <div className="form-field saved-place-itinerary-day">
                      <label htmlFor={`day-${place.id}`}>Adicionar manualmente ao dia</label>
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
                ) : (
                  <p>
                    Esta preferência não cria uma atividade. Você ainda pode abrir os detalhes e
                    adicionar o lugar manualmente ao Roteiro se decidir fazer isso.
                  </p>
                )}

                <div className="section-heading-row saved-place-card-actions">
                  <Link
                    className="product-secondary-action"
                    href={`/viagens/${tripId}/lugares/${place.slug}`}
                  >
                    Ver detalhes
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
