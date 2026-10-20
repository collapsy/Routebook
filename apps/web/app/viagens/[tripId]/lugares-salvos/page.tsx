import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzleItineraryRepository,
  DrizzlePlaceRepository,
  DrizzleTripPlacePreferenceRepository,
  DrizzleTripRepository,
  DrizzleTripStageRepository,
} from "@routebook/database";
import { PLACE_CATEGORIES, type PlaceCategory } from "@routebook/place-catalog";
import type { TripPlacePreference } from "@routebook/trip-collection";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

import { PlacePrimaryImage } from "../../../../components/place-primary-image";
import { TripPlanningWizard } from "../../../../components/trip-planning-wizard";
import { TripPlacePreferenceControls } from "../../../../components/trip-place-preference-controls";
import { TripPlaceSelectionProgress } from "../../../../components/trip-place-selection-progress";
import { TripMap } from "../../../../components/trip-map";
import type { TripMapPoint } from "../../../../lib/trip-map";
import { resolveSelectedPlaceScope } from "../../../../lib/trip-stage-discovery";
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00Z`));
}

function placeDetailsHref(tripId: string, slug: string, stageId?: string, wizardMode = false) {
  const query = new URLSearchParams();
  if (wizardMode) query.set("preparar", "1");
  if (stageId) query.set("etapa", stageId);
  return `/viagens/${tripId}/lugares/${slug}${query.size ? `?${query}` : ""}`;
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
    preparar?: string;
  }>;
}) {
  const { tripId } = await params;
  const { categoria, preferencia, adicionadoAoRoteiro, erro, preparar } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();
  const wizardMode = preparar === "1" && trip.status === "draft";

  const preferenceRepository = new DrizzleTripPlacePreferenceRepository();
  const [preferences, itinerary, stages] = await Promise.all([
    preferenceRepository.listByTripId(tripId),
    new DrizzleItineraryRepository().findByTripId(tripId),
    new DrizzleTripStageRepository().listByTripId(tripId),
  ]);
  const places = await new DrizzlePlaceRepository().listByIds(
    preferences.map((selection) => selection.placeId),
  );
  const placesById = new Map(places.map((place) => [place.id, place]));
  const stagesById = new Map(stages.map((stage) => [stage.id, stage]));
  const scopesByPlaceId = new Map(
    places.map((place) => [
      place.id,
      resolveSelectedPlaceScope(trip, stages, {
        latitude: place.latitude,
        longitude: place.longitude,
      }),
    ]),
  );
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
            activity.placeId && activity.status !== "removed" && activity.status !== "cancelled",
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
  const planningCandidateCount = counts.WANT + counts.MAYBE;
  const mapPoints: TripMapPoint[] = filteredPreferences.flatMap((selection) => {
    const place = placesById.get(selection.placeId);
    if (!place) return [];
    const scope = scopesByPlaceId.get(place.id);
    return [
      {
        id: place.id,
        label: place.name,
        kind: "saved-place" as const,
        latitude: place.latitude,
        longitude: place.longitude,
        ...(scope ? { href: placeDetailsHref(tripId, place.slug, scope.stageId, wizardMode) } : {}),
      },
    ];
  });

  for (const stage of stages) {
    if (
      !stage.accommodation?.coordinate ||
      !filteredPreferences.some(
        (selection) => scopesByPlaceId.get(selection.placeId)?.stageId === stage.id,
      )
    )
      continue;
    mapPoints.unshift({
      id: `accommodation-${stage.id}`,
      label: `${stage.accommodation.name} · ${stage.destination.name}`,
      kind: "accommodation",
      latitude: stage.accommodation.coordinate.latitude,
      longitude: stage.accommodation.coordinate.longitude,
    });
  }

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
          {!wizardMode ? (
            <Link className="product-secondary-action" href={`/viagens/${tripId}/roteiro`}>
              Abrir roteiro
            </Link>
          ) : null}
          <Link
            className="product-secondary-action"
            href={`/viagens/${tripId}/lugares${wizardMode ? "?preparar=1" : ""}`}
          >
            Explorar lugares
          </Link>
        </div>
      </div>

      {wizardMode ? (
        <TripPlanningWizard
          currentView="selection"
          onboarding={trip.status === "draft"}
          tripId={tripId}
          tripStatus={trip.status}
        />
      ) : null}

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
            Revise os lugares que você quer considerar nesta viagem. Cada lugar indica o Destino
            principal ou a Etapa mais próxima; sua preferência não altera o roteiro automaticamente.
          </p>
          <p>
            As distâncias são estimativas em linha reta a partir da hospedagem correspondente. Sem
            hospedagem localizada na Etapa, usamos o Destino dela como referência.
          </p>
        </div>
        <span className="trip-context-version">{preferences.length} avaliados</span>
      </header>

      <TripPlaceSelectionProgress initialCounts={counts} />

      <section className="traveler-context-summary" aria-labelledby="selection-filter-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Filtro</p>
            <h2 id="selection-filter-title">Categoria</h2>
          </div>
          {selectedCategory ? (
            <Link
              className="product-inline-link"
              href={`/viagens/${tripId}/lugares-salvos${wizardMode ? "?preparar=1" : ""}`}
            >
              Limpar filtro
            </Link>
          ) : null}
        </div>
        <div className="section-heading-row">
          {PLACE_CATEGORIES.map((category) => (
            <Link
              aria-current={selectedCategory === category ? "page" : undefined}
              className="product-secondary-action"
              href={`/viagens/${tripId}/lugares-salvos?${wizardMode ? "preparar=1&" : ""}categoria=${category}`}
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
            Explore os destinos da viagem e marque lugares como Quero ir, Talvez ou Não tenho
            interesse.
          </p>
          <Link
            className="product-secondary-action"
            href={`/viagens/${tripId}/lugares${wizardMode ? "?preparar=1" : ""}`}
          >
            Explorar lugares
          </Link>
        </section>
      ) : filteredPreferences.length === 0 ? (
        <section className="traveler-context-summary" aria-labelledby="selection-filter-empty">
          <p className="product-eyebrow">Nenhum resultado</p>
          <h2 id="selection-filter-empty">Nenhum lugar desta categoria está na sua seleção</h2>
          <Link
            className="product-secondary-action"
            href={`/viagens/${tripId}/lugares-salvos${wizardMode ? "?preparar=1" : ""}`}
          >
            Ver seleção completa
          </Link>
        </section>
      ) : (
        <ul className="place-catalog-grid">
          {filteredPreferences.map((selection) => {
            const place = placesById.get(selection.placeId);
            if (!place) return null;
            const scope = scopesByPlaceId.get(place.id);
            const stage = scope?.stageId ? stagesById.get(scope.stageId) : undefined;
            const referenceCoordinate = !scope
              ? undefined
              : stage
                ? (stage.accommodation?.coordinate ??
                  (scope.regionResolution.status === "resolved"
                    ? scope.regionResolution.region.center
                    : undefined))
                : trip.accommodation?.coordinate;
            const referenceLabel = !scope
              ? "da referência espacial"
              : stage
                ? stage.accommodation?.coordinate
                  ? "da hospedagem da etapa"
                  : "do destino da etapa"
                : "da hospedagem principal";
            const accommodationDistance = presentAccommodationDistance(
              referenceCoordinate,
              {
                latitude: place.latitude,
                longitude: place.longitude,
              },
              referenceLabel,
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
                <p>
                  <strong>Destino na viagem: </strong>
                  {scope
                    ? `${stage ? "Etapa" : "Principal"} em ${scope.destinationName} (estimado pela localização do lugar)`
                    : "referência geográfica indisponível"}
                </p>
                <p>{place.summary}</p>
                <p>
                  <strong>Roteiro: </strong>
                  {planned ? "Planejado" : "Ainda não planejado"}
                </p>
                <p>
                  <strong>Distância {referenceLabel}: </strong>
                  {accommodationDistance
                    ? `${accommodationDistance.label} — ${accommodationDistance.description}`
                    : "referência espacial indisponível para calcular esta distância."}
                </p>

                <TripPlacePreferenceControls
                  className="section-heading-row"
                  clearAction={clearSelectionPreferenceAction}
                  currentIntent={selection.intent}
                  currentPriority={selection.priority}
                  fields={{ tripId, placeSlug: place.slug }}
                  label={`Preferência para ${place.name}`}
                  mustDoAction={setSelectionMustDoAction}
                  refreshOnClearSuccess
                  setAction={setSelectionPreferenceAction}
                  summaryLabel="Preferência"
                />

                {!wizardMode ? (
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
                  {scope ? (
                    <Link
                      className="product-secondary-action"
                      href={placeDetailsHref(tripId, place.slug, scope.stageId, wizardMode)}
                    >
                      Ver detalhes
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {wizardMode ? (
        <section
          className="traveler-context-summary"
          aria-labelledby="wizard-places-boundary-title"
        >
          <p className="product-eyebrow">Fim do passo Lugares</p>
          <h2 id="wizard-places-boundary-title">Continue para Contexto quando quiser</h2>
          <p>
            {planningCandidateCount > 0
              ? "Sua seleção está salva. O próximo passo usa o contexto da viagem sem adicionar nenhuma escolha ao roteiro."
              : "Você ainda não marcou lugares como Quero ir ou Talvez. Uma seleção vazia também é válida e não bloqueia o contexto da viagem."}
          </p>
          <Link className="product-primary-action" href={`/viagens/${tripId}/contexto?preparar=1`}>
            Continuar para Contexto
          </Link>
        </section>
      ) : null}
    </section>
  );
}
