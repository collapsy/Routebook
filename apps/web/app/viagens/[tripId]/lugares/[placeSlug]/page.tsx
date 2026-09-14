import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import type { PlaceCategory } from "@routebook/place-catalog";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

import { PlacePrimaryImage } from "../../../../../components/place-primary-image";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsPlaceLabel,
  buildGoogleMapsSearchUrl,
} from "../../../../../lib/google-maps-links";
import { findPipaPlacePracticalGuide } from "../../../../../lib/pipa-place-guide";
import { resolvePlaceDiscoveryRegion } from "../../../../../lib/place-discovery-region";
import { presentAccommodationDistance } from "../distance";
import { addPlaceToItineraryAction, removePlaceAction, savePlaceAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detalhes do lugar — RouteBook",
  description: "Consulte informações e planeje um lugar da sua viagem.",
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

function formatDayLabel(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function PlaceDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string; placeSlug: string }>;
  searchParams: Promise<{
    saved?: string;
    removed?: string;
    adicionadoAoRoteiro?: string;
    dia?: string;
    erroRoteiro?: string;
  }>;
}) {
  const { tripId, placeSlug } = await params;
  const { saved, removed, adicionadoAoRoteiro, dia, erroRoteiro } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);

  if (!trip) notFound();

  const regionResolution = resolvePlaceDiscoveryRegion({
    destination: trip.destination,
    ...(trip.accommodation?.coordinate
      ? { accommodationCoordinate: trip.accommodation.coordinate }
      : {}),
  });
  if (regionResolution.status !== "resolved") notFound();
  const place = await new DrizzlePlaceRepository().findBySlugWithinRadius(placeSlug, {
    center: regionResolution.region.center,
    radiusMeters: regionResolution.region.curatedRadiusMeters,
  });
  if (!place) notFound();

  const savedPlace = await new DrizzleSavedPlaceRepository().find(tripId, place.id);
  const accommodationDistance = presentAccommodationDistance(trip.accommodation?.coordinate, {
    latitude: place.latitude,
    longitude: place.longitude,
  });
  const placeCoordinate = { latitude: place.latitude, longitude: place.longitude };
  const mapsSearchUrl = buildGoogleMapsSearchUrl({
    name: place.name,
    addressLabel: place.addressLabel,
    coordinate: placeCoordinate,
  });
  const destinationLabel = buildGoogleMapsPlaceLabel({
    name: place.name,
    addressLabel: place.addressLabel,
  });
  const practicalGuide =
    place.destinationId === "pipa-rn-br" ? findPipaPlacePracticalGuide(place.slug) : undefined;
  const tripDays = deriveTripDays(trip.period);
  const selectedDay = tripDays.find((day) => day.date === dia) ?? tripDays[0];

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
          Lugar salvo.
        </p>
      ) : null}

      {removed === "1" ? (
        <p className="success-banner" role="status">
          Lugar removido dos salvos. O que já estiver no roteiro continua lá.
        </p>
      ) : null}

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">{categoryLabels[place.category]}</p>
          <h1>{place.name}</h1>
          <p>{place.summary}</p>
        </div>
      </header>

      <PlacePrimaryImage
        category={place.category}
        placeName={place.name}
        primaryImage={place.primaryImage}
        priority
        showProvenance
      />

      {practicalGuide ? (
        <section className="traveler-context-summary" aria-labelledby="place-practical-guide">
          <p className="product-eyebrow">Planejamento prático</p>
          <h2 id="place-practical-guide">Como encaixar este lugar na viagem</h2>
          <dl className="trip-overview-summary">
            <div>
              <dt>Bom para</dt>
              <dd>{practicalGuide.goodFor}</dd>
            </div>
            <div>
              <dt>Tempo sugerido</dt>
              <dd>{practicalGuide.suggestedDuration}</dd>
            </div>
            <div>
              <dt>Melhor encaixe</dt>
              <dd>{practicalGuide.bestWindow}</dd>
            </div>
            <div>
              <dt>Acesso</dt>
              <dd>{practicalGuide.access}</dd>
            </div>
          </dl>
          <h3>Confira antes de sair</h3>
          <ul>
            {practicalGuide.checks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
          <p>
            Orientação revisada em 16/08/2026. Horários, preços, disponibilidade, maré, clima e
            condições de rota podem mudar.
          </p>
          {practicalGuide.sources.length > 0 ? (
            <p>
              Referências institucionais:{" "}
              {practicalGuide.sources.map((source, index) => (
                <span key={source.url}>
                  {index > 0 ? " · " : null}
                  <a href={source.url} rel="noreferrer" target="_blank">
                    {source.label}
                  </a>
                </span>
              ))}
            </p>
          ) : (
            <p>Use “Ver mapa e fotos” para confirmar informações atuais antes de sair.</p>
          )}
        </section>
      ) : (
        <section className="traveler-context-summary" aria-labelledby="place-guide-pending">
          <p className="product-eyebrow">Planejamento prático</p>
          <h2 id="place-guide-pending">Confira as informações atuais</h2>
          <p>
            Ainda não há orientação prática específica para este lugar. Confirme acesso, horários e
            outras informações que possam mudar antes de sair.
          </p>
        </section>
      )}

      <section
        className="traveler-context-summary"
        aria-labelledby="place-itinerary-title"
        id="adicionar-ao-roteiro"
      >
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Planejar este lugar</p>
            <h2 id="place-itinerary-title">Adicionar ao roteiro</h2>
            <p>
              Escolha o dia e, se quiser, defina horário e duração. Adicionar ao roteiro não salva o
              lugar automaticamente nos Salvos.
            </p>
          </div>
          {adicionadoAoRoteiro === "1" && selectedDay ? (
            <Link
              className="product-primary-action"
              href={`/viagens/${tripId}/roteiro?dia=${selectedDay.date}#dia-em-foco`}
            >
              Ver dia no roteiro
            </Link>
          ) : null}
        </div>

        {adicionadoAoRoteiro === "1" && selectedDay ? (
          <p className="success-banner" role="status">
            {place.name} foi adicionado ao Dia {selectedDay.index} —{" "}
            {formatDayLabel(selectedDay.date)}.
          </p>
        ) : null}
        {erroRoteiro ? (
          <p className="form-error itinerary-feedback" role="alert">
            {erroRoteiro}
          </p>
        ) : null}

        <form action={addPlaceToItineraryAction} className="saved-place-itinerary-form">
          <input name="tripId" type="hidden" value={tripId} />
          <input name="placeSlug" type="hidden" value={placeSlug} />

          <div className="form-field saved-place-itinerary-day">
            <label htmlFor="place-itinerary-day">Adicionar ao dia</label>
            <select
              defaultValue={selectedDay?.date}
              id="place-itinerary-day"
              name="dayDate"
              required
            >
              {tripDays.map((day) => (
                <option key={day.date} value={day.date}>
                  Dia {day.index} — {formatDayLabel(day.date)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="place-itinerary-time">Horário opcional</label>
            <input id="place-itinerary-time" name="startTime" type="time" />
          </div>

          <div className="form-field">
            <label htmlFor="place-itinerary-duration">Duração opcional</label>
            <input
              id="place-itinerary-duration"
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
      </section>

      <section className="traveler-context-summary" aria-labelledby="place-route-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Antes de sair</p>
            <h2 id="place-route-title">Mapa, fotos e rota</h2>
            <p>
              Abra o local no Google Maps para consultar fotos e informações atuais. Se a hospedagem
              tiver localização, você também pode abrir a rota a pé ou de carro.
            </p>
          </div>
          <div className="section-heading-row">
            <a
              className="product-secondary-action"
              href={mapsSearchUrl}
              rel="noreferrer"
              target="_blank"
            >
              Ver mapa e fotos
            </a>
            {trip.accommodation?.coordinate ? (
              <>
                <a
                  className="product-secondary-action"
                  href={buildGoogleMapsDirectionsUrl({
                    origin: trip.accommodation.coordinate,
                    destination: placeCoordinate,
                    destinationLabel,
                    travelMode: "walking",
                  })}
                  rel="noreferrer"
                  target="_blank"
                >
                  Rota a pé
                </a>
                <a
                  className="product-secondary-action"
                  href={buildGoogleMapsDirectionsUrl({
                    origin: trip.accommodation.coordinate,
                    destination: placeCoordinate,
                    destinationLabel,
                    travelMode: "driving",
                  })}
                  rel="noreferrer"
                  target="_blank"
                >
                  Rota de carro
                </a>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="traveler-context-summary" aria-labelledby="saved-place-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Salvos</p>
            <h2 id="saved-place-title">
              {savedPlace ? "Este lugar está salvo" : "Salvar para depois"}
            </h2>
            <p>
              {savedPlace
                ? "Remover dos salvos não remove o que já estiver no roteiro."
                : "Salvar deixa este lugar disponível nos Salvos; não o adiciona ao roteiro."}
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
              "Informe a localização da hospedagem para calcular esta distância."
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
