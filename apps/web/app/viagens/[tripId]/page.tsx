import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTravelerProfileRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { listPublishedPlaces } from "@routebook/place-catalog";
import { listSavedPlaces } from "@routebook/saved-places";
import { findTravelerProfile } from "@routebook/traveler-profile";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

import { ContextualRecommendationStrip } from "../../../components/contextual-recommendation-strip";
import { TripDayGuide } from "../../../components/trip-day-guide";
import { TripMap } from "../../../components/trip-map";
import { buildPipaFirstDayGuide } from "../../../lib/pipa-day-guide";
import { loadRecommendationExperience } from "../../../lib/recommendation-experience";
import { resolveTripDestinationId } from "../../../lib/trip-destination";
import type { TripMapPoint } from "../../../lib/trip-map";
import { resolveTripRouteAccess } from "../../../lib/trip-route-access";
import { DeleteTripControl } from "./delete-trip-control";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visão da viagem — RouteBook",
  description: "Consulte o contexto estrutural e os dias da sua viagem.",
};

const interestLabels: Record<string, string> = {
  beaches: "Praias",
  gastronomy: "Gastronomia",
  nightlife: "Vida noturna",
  nature: "Natureza",
  culture: "Cultura",
  rest: "Descanso",
  adventure: "Aventura",
  shopping: "Compras",
};

const paceLabels: Record<string, string> = {
  relaxed: "Relaxado",
  balanced: "Equilibrado",
  intense: "Intenso",
};

const transportLabels: Record<string, string> = {
  walking: "A pé",
  "rental-car": "Carro alugado",
  "ride-hailing": "Aplicativos e táxi",
  "public-transport": "Transporte público",
  mixed: "Combinação de meios",
};

function formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    ...options,
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatBudget(totalCents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    totalCents / 100,
  );
}

export default async function TripOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ contextUpdated?: string }>;
}) {
  const { tripId } = await params;
  const tripRepository = new DrizzleTripRepository();
  const trip = await findTripById(tripRepository, tripId);

  if (!trip) notFound();

  const destinationId = resolveTripDestinationId(trip.destination.name);
  const [profile, publishedPlaces, savedPlaces, deleteAccess, recommendationExperience] =
    await Promise.all([
      findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId),
      destinationId ? listPublishedPlaces(new DrizzlePlaceRepository(), destinationId) : [],
      listSavedPlaces(new DrizzleSavedPlaceRepository(), tripId),
      resolveTripRouteAccess({ tripId, action: "trip:delete" }),
      loadRecommendationExperience(tripId, new Date(), { persist: false }),
    ]);
  const { contextUpdated } = await searchParams;
  const owner = trip.participants.find((participant) => participant.role === "owner");
  const days = deriveTripDays(trip.period);
  const firstDayGuide =
    destinationId === "pipa-rn-br" && days[0]
      ? buildPipaFirstDayGuide({
          tripId,
          date: days[0].date,
          places: publishedPlaces,
          ...(trip.accommodation?.coordinate
            ? { accommodationCoordinate: trip.accommodation.coordinate }
            : {}),
          travelMode: profile?.transportPreference === "walking" ? "walking" : "driving",
        })
      : null;
  const savedPlaceIds = new Set(savedPlaces.map((selection) => selection.placeId));
  const mapPoints: TripMapPoint[] = [];

  if (trip.accommodation?.coordinate) {
    mapPoints.push({
      id: "accommodation",
      label: trip.accommodation.name,
      kind: "accommodation",
      latitude: trip.accommodation.coordinate.latitude,
      longitude: trip.accommodation.coordinate.longitude,
    });
  }

  for (const place of publishedPlaces) {
    mapPoints.push({
      id: place.id,
      label: place.name,
      kind: savedPlaceIds.has(place.id) ? "saved-place" : "published-place",
      latitude: place.latitude,
      longitude: place.longitude,
      href: `/viagens/${tripId}/lugares/${place.slug}`,
    });
  }

  return (
    <section className="app-page trip-overview-page">
      <Link className="back-link" href="/viagens">
        ← Voltar para Minhas viagens
      </Link>

      {contextUpdated === "1" ? (
        <p className="success-banner" role="status">
          Contexto da viagem salvo com sucesso.
        </p>
      ) : null}

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">
            {trip.status === "draft" ? "Viagem em rascunho" : trip.status}
          </p>
          <h1>{trip.name}</h1>
          <p>
            Esta visão reúne a estrutura da Viagem e o contexto progressivo dos viajantes, sem
            executar mudanças automaticamente.
          </p>
        </div>
        <div className="section-heading-row">
          <span className="trip-context-version">Contexto estrutural v{trip.contextVersion}</span>
          <Link className="product-primary-action" href={`/viagens/${tripId}/lugares`}>
            Explorar catálogo ampliado
          </Link>
        </div>
      </header>

      <dl className="trip-overview-summary">
        <div>
          <dt>Destino</dt>
          <dd>{trip.destination.name}</dd>
        </div>
        <div>
          <dt>Período</dt>
          <dd>
            {formatDate(trip.period.startDate)} a {formatDate(trip.period.endDate)}
          </dd>
        </div>
        <div>
          <dt>Hospedagem</dt>
          <dd>{trip.accommodation?.name ?? "Ainda não informada"}</dd>
          {trip.accommodation?.address ? <small>{trip.accommodation.address}</small> : null}
          <Link className="product-inline-link" href={`/viagens/${tripId}/hospedagem`}>
            {trip.accommodation ? "Editar hospedagem" : "Informar hospedagem"}
          </Link>
        </div>
        <div>
          <dt>Responsável</dt>
          <dd>{owner?.displayName ?? "Owner não identificado"}</dd>
        </div>
      </dl>

      {firstDayGuide ? (
        <TripDayGuide
          {...(trip.accommodation?.coordinate
            ? {
                accommodationPoint: {
                  id: "guide-accommodation",
                  label: trip.accommodation.name,
                  kind: "accommodation" as const,
                  latitude: trip.accommodation.coordinate.latitude,
                  longitude: trip.accommodation.coordinate.longitude,
                },
              }
            : {})}
          guide={firstDayGuide}
        />
      ) : null}

      {recommendationExperience?.destinationSupported ? (
        <ContextualRecommendationStrip
          cards={recommendationExperience.cards}
          hasContextLimitations={recommendationExperience.hasContextLimitations}
          tripId={tripId}
        />
      ) : null}

      <TripMap points={mapPoints} title={`Mapa de ${trip.destination.name}`} />

      <section className="traveler-context-summary" aria-labelledby="traveler-context-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Perfil dos viajantes</p>
            <h2 id="traveler-context-title">
              {profile ? "Contexto configurado" : "Personalização ainda não iniciada"}
            </h2>
          </div>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/contexto`}>
            {profile ? "Editar contexto" : "Configurar contexto"}
          </Link>
        </div>

        {profile ? (
          <dl className="traveler-context-details">
            <div>
              <dt>Viajantes</dt>
              <dd>{profile.travelerCount}</dd>
            </div>
            <div>
              <dt>Interesses</dt>
              <dd>
                {profile.interests.length > 0
                  ? profile.interests.map((interest) => interestLabels[interest]).join(", ")
                  : "Ainda não informados"}
              </dd>
            </div>
            <div>
              <dt>Ritmo</dt>
              <dd>{profile.pace ? paceLabels[profile.pace] : "Ainda não informado"}</dd>
            </div>
            <div>
              <dt>Transporte</dt>
              <dd>
                {profile.transportPreference
                  ? transportLabels[profile.transportPreference]
                  : "Ainda não informado"}
              </dd>
            </div>
            <div>
              <dt>Orçamento estimado</dt>
              <dd>
                {profile.budget ? formatBudget(profile.budget.totalCents) : "Ainda não informado"}
              </dd>
            </div>
            <div>
              <dt>Versão do perfil</dt>
              <dd>v{profile.version}</dd>
            </div>
          </dl>
        ) : (
          <p>
            Quantidade de viajantes, interesses, ritmo, transporte e orçamento são opcionais e podem
            ser preenchidos aos poucos.
          </p>
        )}
      </section>

      <section className="trip-days-section" aria-labelledby="trip-days-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Estrutura temporal</p>
            <h2 id="trip-days-title">{days.length} dias de viagem</h2>
          </div>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/roteiro`}>
            Abrir roteiro
          </Link>
        </div>

        <ol className="trip-days-grid">
          {days.map((day) => (
            <li key={day.date}>
              <span>Dia {day.index}</span>
              <strong>
                {formatDate(day.date, {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </strong>
              <small>Organize atividades no roteiro manual</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="traveler-context-summary" aria-labelledby="recommendations-title">
        <p className="product-eyebrow">Sugestões contextualizadas</p>
        <h2 id="recommendations-title">Transforme o Contexto em uma lista explicável</h2>
        <p>
          As Recommendations usam apenas dados conhecidos da Viagem. Elas não salvam Lugares nem
          alteram o Roteiro automaticamente.
        </p>
        <Link className="product-secondary-action" href={`/viagens/${tripId}/recomendacoes`}>
          Ver sugestões contextualizadas
        </Link>
      </section>

      <section className="trip-next-steps" aria-labelledby="trip-next-steps-title">
        <div>
          <p className="product-eyebrow">Descoberta do destino</p>
          <h2 id="trip-next-steps-title">Explore lugares de {trip.destination.name}</h2>
          <p>
            Compare os Places publicados com descobertas externas da região, ordenadas pela mesma
            referência de distância e sempre identificadas pela origem.
          </p>
        </div>
        <div className="section-heading-row">
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
            Explorar catálogo ampliado
          </Link>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares-salvos`}>
            Ver lugares salvos
          </Link>
        </div>
      </section>

      {deleteAccess.status === "authorized" ? (
        <section className="trip-danger-zone" aria-labelledby="trip-danger-title">
          <div>
            <p className="product-eyebrow">Zona de risco</p>
            <h2 id="trip-danger-title">Excluir esta viagem</h2>
            <p>
              Use esta opção somente quando não quiser mais manter a Viagem e todo o planejamento
              associado no RouteBook.
            </p>
          </div>
          <DeleteTripControl tripId={tripId} tripName={trip.name} />
        </section>
      ) : null}
    </section>
  );
}
