import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { findPublishedPlace, type PlaceCategory } from "@routebook/place-catalog";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

import { PlacePrimaryImage } from "../../../../../components/place-primary-image";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsSearchUrl,
} from "../../../../../lib/google-maps-links";
import { findPipaPlacePracticalGuide } from "../../../../../lib/pipa-place-guide";
import { presentAccommodationDistance } from "../distance";
import { addPlaceToItineraryAction, removePlaceAction, savePlaceAction } from "./actions";

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

  const destinationId = resolveDestinationId(trip.destination.name);
  if (!destinationId) notFound();

  const place = await findPublishedPlace(new DrizzlePlaceRepository(), destinationId, placeSlug);
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
  const practicalGuide = findPipaPlacePracticalGuide(place.slug);
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
          Lugar salvo na sua viagem.
        </p>
      ) : null}

      {removed === "1" ? (
        <p className="success-banner" role="status">
          Lugar removido da sua seleção. Atividades já planejadas continuam no Roteiro.
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
            Orientação editorial revisada em 16/08/2026. Não representa horário, preço,
            disponibilidade, maré, clima ou condição de rota em tempo real.
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
            <p>
              Base editorial: catálogo publicado do RouteBook. Use “Ver mapa e fotos” para confirmar
              dados operacionais atuais do estabelecimento.
            </p>
          )}
        </section>
      ) : (
        <section className="traveler-context-summary" aria-labelledby="place-guide-pending">
          <p className="product-eyebrow">Planejamento prático</p>
          <h2 id="place-guide-pending">Orientação específica em revisão</h2>
          <p>
            O resumo publicado continua disponível, mas este lugar ainda não possui um perfil
            operacional revisado. Confirme acesso e dados atuais antes de sair.
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
            <p className="product-eyebrow">Planejar este Lugar</p>
            <h2 id="place-itinerary-title">Adicionar ao roteiro</h2>
            <p>
              Escolha o Dia e, se quiser, defina horário e duração. Esta ação cria uma Atividade no
              Roteiro; ela não salva o Lugar automaticamente na sua lista de interesse.
            </p>
          </div>
          {adicionadoAoRoteiro === "1" && selectedDay ? (
            <Link
              className="product-primary-action"
              href={`/viagens/${tripId}/roteiro?dia=${selectedDay.date}#dia-em-foco`}
            >
              Ver Dia no roteiro
            </Link>
          ) : null}
        </div>

        {adicionadoAoRoteiro === "1" && selectedDay ? (
          <p className="success-banner" role="status">
            {place.name} foi adicionado ao Dia {selectedDay.index} — {formatDayLabel(selectedDay.date)}.
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
            <p className="product-eyebrow">Deslocamento e informação atual</p>
            <h2 id="place-route-title">Confira antes de sair</h2>
            <p>
              Abra o local no Google Maps para consultar fotos e dados atuais. Se a hospedagem
              estiver geocodificada, calcule a rota real por ruas; o resultado externo pode incluir
              duração e trânsito.
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
                    travelMode: "walking",
                  })}
                  rel="noreferrer"
                  target="_blank"
                >
                  Rota real a pé
                </a>
                <a
                  className="product-secondary-action"
                  href={buildGoogleMapsDirectionsUrl({
                    origin: trip.accommodation.coordinate,
                    destination: placeCoordinate,
                    travelMode: "driving",
                  })}
                  rel="noreferrer"
                  target="_blank"
                >
                  Rota real de carro
                </a>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="traveler-context-summary" aria-labelledby="saved-place-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Sua seleção</p>
            <h2 id="saved-place-title">
              {savedPlace ? "Este lugar está salvo" : "Salvar como opção"}
            </h2>
            <p>
              {savedPlace
                ? "Ele faz parte da sua seleção pessoal. Remover dos Salvos não remove Atividades já planejadas."
                : "Salvar mantém este Lugar como opção para decidir depois; isso não o adiciona ao Roteiro."}
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
          distância é uma estimativa geodésica em linha reta e não representa rota por ruas,
          trânsito ou tempo de deslocamento. As ações externas permitem consultar esses dados no
          momento da decisão, sem persistir conteúdo do Google como informação canônica do
          RouteBook.
        </p>
      </section>
    </section>
  );
}
