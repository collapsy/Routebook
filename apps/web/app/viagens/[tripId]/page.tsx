import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzleSavedPlaceRepository,
  DrizzleTravelerProfileRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { listSavedPlaces } from "@routebook/saved-places";
import { findTravelerProfile } from "@routebook/traveler-profile";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

import { ContextualRecommendationStrip } from "../../../components/contextual-recommendation-strip";
import { TripMap } from "../../../components/trip-map";
import { loadRecommendationExperience } from "../../../lib/recommendation-experience";
import { loadTripOverviewDiscoveryMap } from "../../../lib/trip-overview-discovery-map";
import { resolveTripRouteAccess } from "../../../lib/trip-route-access";
import { DeleteTripControl } from "./delete-trip-control";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visão da viagem — RouteBook",
  description: "Consulte os principais dados e continue planejando sua viagem.",
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

function mapDescription(
  input: Readonly<{
    canonicalCount: number;
    externalVisibleCount: number;
    externalAvailableCount: number;
    discoveryStatus: "unavailable" | "disabled" | "success" | "failed";
  }>,
): string {
  const visiblePlaceCount = input.canonicalCount + input.externalVisibleCount;
  const availablePlaceCount = input.canonicalCount + input.externalAvailableCount;
  const base = `O mapa mostra ${visiblePlaceCount} ${visiblePlaceCount === 1 ? "Lugar próximo" : "Lugares próximos"} com localização disponível.`;

  if (input.discoveryStatus === "failed") {
    return `${base} Não foi possível atualizar os lugares próximos agora. Os lugares já disponíveis continuam no mapa.`;
  }
  if (input.discoveryStatus === "disabled") {
    return `${base} Não foi possível buscar novos lugares agora.`;
  }
  if (availablePlaceCount > visiblePlaceCount) {
    return `${base} Este resumo mostra ${visiblePlaceCount} de ${availablePlaceCount} lugares disponíveis; explore Lugares para ver a cobertura completa.`;
  }
  return base;
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

  const savedPlacesPromise = listSavedPlaces(new DrizzleSavedPlaceRepository(), tripId);
  const [profile, deleteAccess, recommendationExperience, overviewMap] = await Promise.all([
    findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId),
    resolveTripRouteAccess({ tripId, action: "trip:delete" }),
    loadRecommendationExperience(tripId, new Date(), { persist: false }),
    savedPlacesPromise.then((savedPlaces) =>
      loadTripOverviewDiscoveryMap(
        trip,
        new Set(savedPlaces.map((selection) => selection.placeId)),
      ),
    ),
  ]);
  const { contextUpdated } = await searchParams;
  const owner = trip.participants.find((participant) => participant.role === "owner");
  const days = deriveTripDays(trip.period);

  return (
    <section className="app-page trip-overview-page">
      <Link className="back-link" href="/viagens">
        ← Voltar para Minhas viagens
      </Link>

      {contextUpdated === "1" ? (
        <p className="success-banner" role="status">
          Preferências da viagem salvas.
        </p>
      ) : null}

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">
            {trip.status === "draft" ? "Viagem em rascunho" : trip.status}
          </p>
          <h1>{trip.name}</h1>
          <p>Veja os principais dados da viagem e continue de onde parou.</p>
        </div>
        <div className="section-heading-row">
          <Link className="product-primary-action" href={`/viagens/${tripId}/lugares`}>
            Explorar lugares
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
          <dd>{owner?.displayName ?? "Responsável não informado"}</dd>
        </div>
      </dl>

      {days.length > 0 ? (
        <section className="traveler-context-summary" aria-labelledby="trip-guide-entry-title">
          <div className="section-heading-row">
            <div>
              <p className="product-eyebrow">Hoje em {trip.destination.name}</p>
              <h2 id="trip-guide-entry-title">Comece pelo que importa neste Dia</h2>
              <p>
                Veja o que já está disponível para a data em foco e abra o Guia para continuar
                planejando o dia.
              </p>
            </div>
            <Link className="product-primary-action" href={`/viagens/${tripId}/guia`}>
              Ver Hoje
            </Link>
          </div>
        </section>
      ) : null}

      {recommendationExperience?.destinationSupported ? (
        <ContextualRecommendationStrip
          cards={recommendationExperience.cards}
          hasContextLimitations={recommendationExperience.hasContextLimitations}
          tripId={tripId}
        />
      ) : null}

      <TripMap
        description={mapDescription(overviewMap)}
        points={overviewMap.points}
        title={`Mapa do entorno de ${trip.destination.name}`}
      />

      <section className="traveler-context-summary" aria-labelledby="traveler-context-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Perfil dos viajantes</p>
            <h2 id="traveler-context-title">
              {profile ? "Preferências informadas" : "Preferências ainda não informadas"}
            </h2>
          </div>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/contexto`}>
            {profile ? "Editar preferências" : "Informar preferências"}
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
            <p className="product-eyebrow">Dias da viagem</p>
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
              <small>Organize atividades no roteiro</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="traveler-context-summary" aria-labelledby="recommendations-title">
        <p className="product-eyebrow">Sugestões para a viagem</p>
        <h2 id="recommendations-title">Sugestões para sua viagem</h2>
        <p>Compare lugares com base no que você informou sobre a viagem.</p>
        <Link className="product-secondary-action" href={`/viagens/${tripId}/recomendacoes`}>
          Ver sugestões
        </Link>
      </section>

      <section className="trip-next-steps" aria-labelledby="trip-next-steps-title">
        <div>
          <p className="product-eyebrow">Descoberta do destino</p>
          <h2 id="trip-next-steps-title">Explore lugares de {trip.destination.name}</h2>
          <p>
            Compare lugares da região e use a distância como referência para escolher o que faz
            sentido para a viagem.
          </p>
        </div>
        <div className="section-heading-row">
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
            Explorar lugares
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
