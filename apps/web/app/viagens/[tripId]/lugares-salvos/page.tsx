import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzleItineraryRepository,
  DrizzlePlaceRepository,
  DrizzleTripPlacePreferenceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import {
  PLACE_CATEGORIES,
  type PlaceCategory,
} from "@routebook/place-catalog";
import type {
  TripPlaceIntent,
  TripPlacePreference,
} from "@routebook/trip-collection";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

import { PlacePrimaryImage } from "../../../../components/place-primary-image";
import { TripMap } from "../../../../components/trip-map";
import type { TripMapPoint } from "../../../../lib/trip-map";
import { presentAccommodationDistance } from "../lugares/distance";
import {
  addSelectionPlaceToItineraryAction,
  clearSelectionPreferenceAction,
  setSelectionMustDoAction,
  setSelectionPreferenceAction,
} from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Minha seleção — RouteBook",
  description: "Revise os lugares escolhidos e suas intenções para esta viagem.",
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

const intentLabels: Record<TripPlaceIntent, string> = {
  WANT: "Quero ir",
  MAYBE: "Talvez",
  NOT_INTERESTED: "Não tenho interesse",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00Z`));
}

function parseCategory(value?: string): PlaceCategory | undefined {
  return PLACE_CATEGORIES.includes(value as PlaceCategory) ? (value as PlaceCategory) : undefined;
}

function isPlannedPreference(
  preference: TripPlacePreference,
  plannedPlaceIds: ReadonlySet<string>,
): boolean {
  return plannedPlaceIds.has(preference.placeId);
}

export default async function TripSelectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{
    categoria?: string;
    preferencia?: string;
    adicionadoAoRoteiro?: string;
    erro?: string;
  }>;
}) {
  const { tripId } = await params;
  const { categoria, preferencia, adicionadoAoRoteiro, erro } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const preferenceRepository = new DrizzleTripPlacePreferenceRepository();
  const [preferences, itinerary] = await Promise.all([
    preferenceRepository.listByTripId(tripId),
    new DrizzleItineraryRepository().findByTripId(tripId),
  ]);
  const places = await new DrizzlePlaceRepository().listByIds(
    preferences.map((selection) => selection.placeId),
  );
  const placesById = new Map(places.map((place) => [place.id, place]));
  const selectedCategory = parseCategory(categoria);
  const filteredPreferences = preferences.filter((selection) => {
    const place = placesById.get(selection.placeId);
    return place && (!selectedCategory || place.category === selectedCategory);
  });
  const plannedPlaceIds = new Set(
    itinerary?.days.flatMap((day) =>
      day.activities
        .filter(
          (activity) =>
            activity.placeId &&
            activity.status !== "removed" &&
            activity.status !== "cancelled",
        )
        .map((activity) => activity.placeId!),
    ) ?? [],
  );
  const tripDays = deriveTripDays(trip.period);
  const counts = preferences.reduce(
    (summary, selection) => {
      summary[selection.intent] += 1;
      if (selection.priority === "MUST_DO") summary.mustDo += 1;
      return summary;
    },
    { WANT: 0, MAYBE: 0, NOT_INTERESTED: 0, mustDo: 0 },
  );
  const mapPoints: TripMapPoint[] = filteredPreferences.flatMap((selection) => {
    const place = placesById.get(selection.placeId);
    if (!place) return [];
    return [
      {
        id: place.id,
        label: place.name,
        kind: "saved-place" as const,
        latitude: place.latitude,
        longitude: place.longitude,
        href: `/viagens/${tripId}/lugares/${place.slug}`,
      },
    ];
  });

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

      {preferencia === "atualizada" ? (
        <p className="success-banner" role="status">
          Preferência atualizada.
        </p>
      ) : null}
      {preferencia === "limpa" ? (
        <p className="success-banner" role="status">
          Preferência removida. O que já estiver no roteiro continua lá.
        </p>
      ) : null}
      {adicionadoAoRoteiro === "1" ? (
        <p className="success-banner" role="status">
          Lugar adicionado ao roteiro.
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
            Revise o que você quer considerar em {trip.destination.name}. Sua preferência não
            adiciona nem remove lugares do roteiro automaticamente.
          </p>
          <p>
            As distâncias exibidas são estimativas em linha reta a partir da hospedagem e não
            representam rota, trânsito ou tempo de deslocamento.
          </p>
        </div>
        <span className="trip-context-version">{preferences.length} avaliados</span>
      </header>

      <dl className="trip-overview-summary" aria-label="Resumo da seleção">
        <div>
          <dt>Quero ir</dt>
          <dd>{counts.WANT}</dd>
        </div>
        <div>
          <dt>Talvez</dt>
          <dd>{counts.MAYBE}</dd>
        </div>
        <div>
          <dt>Não tenho interesse</dt>
          <dd>{counts.NOT_INTERESTED}</dd>
        </div>
        <div>
          <dt>Imperdíveis</dt>
          <dd>{counts.mustDo}</dd>
        </div>
      </dl>

      <section className="traveler-context-summary" aria-labelledby="selection-filter-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Filtro</p>
            <h2 id="selection-filter-title">Categoria</h2>
          </div>
          {selectedCategory ? (
            <Link className="product-inline-link" href={`/viagens/${tripId}/lugares-salvos`}>
              Limpar filtro
            </Link>
          ) : null}
        </div>
        <div className="section-heading-row">
          {PLACE_CATEGORIES.map((category) => (
            <Link
              aria-current={selectedCategory === category ? "page" : undefined}
              className="product-secondary-action"
              href={`/viagens/${tripId}/lugares-salvos?categoria=${category}`}
              key={category}
            >
              {categoryLabels[category]}
            </Link>
          ))}
        </div>
      </section>

      <TripMap points={mapPoints} title="Hospedagem e lugares da Minha seleção" />

      {preferences.length === 0 ? (
        <section className="traveler-context-summary" aria-labelledby="selection-empty-title">
          <p className="product-eyebrow">Seleção vazia</p>
          <h2 id="selection-empty-title">Você ainda não avaliou nenhum lugar</h2>
          <p>
            Explore o destino e marque lugares como Quero ir, Talvez ou Não tenho interesse.
          </p>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
            Explorar lugares
          </Link>
        </section>
      ) : filteredPreferences.length === 0 ? (
        <section className="traveler-context-summary" aria-labelledby="selection-filter-empty">
          <p className="product-eyebrow">Nenhum resultado</p>
          <h2 id="selection-filter-empty">Nenhum lugar desta categoria está na sua seleção</h2>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares-salvos`}>
            Ver seleção completa
          </Link>
        </section>
      ) : (
        <ul className="place-catalog-grid">
          {filteredPreferences.map((selection) => {
            const place = placesById.get(selection.placeId);
            if (!place) return null;
            const accommodationDistance = presentAccommodationDistance(
              trip.accommodation?.coordinate,
              {
                latitude: place.latitude,
                longitude: place.longitude,
              },
            );
            const titleId = `selection-place-${place.id}`;
            const planned = isPlannedPreference(selection, plannedPlaceIds);

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
                  <strong>Preferência: </strong>
                  {intentLabels[selection.intent]}
                  {selection.priority === "MUST_DO" ? " · Imperdível" : ""}
                </p>
                <p>
                  <strong>Roteiro: </strong>
                  {planned ? "Planejado" : "Ainda não planejado"}
                </p>
                <p>
                  <strong>Distância da hospedagem: </strong>
                  {accommodationDistance
                    ? `${accommodationDistance.label} — ${accommodationDistance.description}`
                    : "informe a localização da hospedagem para calcular esta distância."}
                </p>

                <div className="section-heading-row" aria-label={`Preferência para ${place.name}`}>
                  {(["WANT", "MAYBE", "NOT_INTERESTED"] as const).map((intent) => (
                    <form action={setSelectionPreferenceAction} key={intent}>
                      <input name="tripId" type="hidden" value={tripId} />
                      <input name="placeSlug" type="hidden" value={place.slug} />
                      <input name="intent" type="hidden" value={intent} />
                      <button
                        aria-pressed={selection.intent === intent}
                        className="product-secondary-action"
                        type="submit"
                      >
                        {intentLabels[intent]}
                      </button>
                    </form>
                  ))}
                </div>

                {selection.intent === "WANT" ? (
                  <form action={setSelectionMustDoAction}>
                    <input name="tripId" type="hidden" value={tripId} />
                    <input name="placeSlug" type="hidden" value={place.slug} />
                    <input
                      name="enabled"
                      type="hidden"
                      value={selection.priority === "MUST_DO" ? "0" : "1"}
                    />
                    <button
                      aria-pressed={selection.priority === "MUST_DO"}
                      className="product-secondary-action"
                      type="submit"
                    >
                      {selection.priority === "MUST_DO"
                        ? "Remover de Imperdíveis"
                        : "Marcar como Imperdível"}
                    </button>
                  </form>
                ) : null}

                {selection.intent !== "NOT_INTERESTED" ? (
                  <form
                    action={addSelectionPlaceToItineraryAction}
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
                ) : null}

                <div className="section-heading-row saved-place-card-actions">
                  <Link
                    className="product-secondary-action"
                    href={`/viagens/${tripId}/lugares/${place.slug}`}
                  >
                    Ver detalhes
                  </Link>
                  <form action={clearSelectionPreferenceAction}>
                    <input name="tripId" type="hidden" value={tripId} />
                    <input name="placeSlug" type="hidden" value={place.slug} />
                    <button className="product-secondary-action" type="submit">
                      Limpar preferência
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
