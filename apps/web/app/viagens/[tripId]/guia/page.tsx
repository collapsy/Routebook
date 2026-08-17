import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzlePlaceRepository,
  DrizzleTravelerProfileRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { listPublishedPlaces } from "@routebook/place-catalog";
import { findTravelerProfile } from "@routebook/traveler-profile";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

import { TripDayGuide } from "../../../../components/trip-day-guide";
import { buildPipaTripGuide } from "../../../../lib/pipa-day-guide";
import { resolveTripDestinationId } from "../../../../lib/trip-destination";
import type { TripMapPoint } from "../../../../lib/trip-map";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guia da viagem — RouteBook",
  description: "Consulte uma base editorial diária para organizar sua viagem sem aplicar mudanças automaticamente.",
};

export default async function TripGuidePage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const destinationId = resolveTripDestinationId(trip.destination.name);
  if (destinationId !== "pipa-rn-br") notFound();

  const [publishedPlaces, profile] = await Promise.all([
    listPublishedPlaces(new DrizzlePlaceRepository(), destinationId),
    findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId),
  ]);
  const tripDays = deriveTripDays(trip.period);
  const guide = buildPipaTripGuide({
    tripId,
    dates: tripDays.map((day) => day.date),
    places: publishedPlaces,
    ...(trip.accommodation?.coordinate
      ? { accommodationCoordinate: trip.accommodation.coordinate }
      : {}),
    travelMode: profile?.transportPreference === "walking" ? "walking" : "driving",
  });

  if (!guide) notFound();

  const accommodationPoint: TripMapPoint | undefined = trip.accommodation?.coordinate
    ? {
        id: "guide-accommodation",
        label: trip.accommodation.name,
        kind: "accommodation",
        latitude: trip.accommodation.coordinate.latitude,
        longitude: trip.accommodation.coordinate.longitude,
      }
    : undefined;

  return (
    <section className="app-page trip-overview-page">
      <div className="section-heading-row">
        <Link className="back-link" href={`/viagens/${tripId}`}>
          ← Voltar para a visão da viagem
        </Link>
        <Link className="product-secondary-action" href={`/viagens/${tripId}/roteiro`}>
          Abrir roteiro
        </Link>
      </div>

      <header className="trip-overview-hero">
        <div>
          <p className="product-eyebrow">Guia da viagem · base editorial</p>
          <h1>Um plano leve para cada dia em Pipa</h1>
          <p>
            Use esta sequência como ponto de partida. Maré, clima, funcionamento, trânsito e energia
            do grupo podem mudar a decisão no dia; nenhuma sugestão é aplicada automaticamente ao
            Roteiro.
          </p>
        </div>
      </header>

      <section className="traveler-context-summary" aria-labelledby="guide-days-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Navegação rápida</p>
            <h2 id="guide-days-title">{guide.days.length} dias com orientação editorial</h2>
          </div>
          {guide.totalCanonicalDays > guide.days.length ? (
            <p>
              O piloto editorial cobre os primeiros {guide.days.length} dias desta Viagem de {guide.totalCanonicalDays} dias.
            </p>
          ) : null}
        </div>
        <nav aria-label="Dias do guia" className="section-heading-row">
          {guide.days.map((day) => (
            <a className="product-secondary-action" href={`#dia-${day.index}`} key={day.date}>
              Dia {day.index}
            </a>
          ))}
        </nav>
      </section>

      {guide.days.map((day, index) => (
        <TripDayGuide
          accommodationPoint={accommodationPoint}
          guide={day}
          key={day.date}
          showDisclosure={index === 0}
        />
      ))}

      <section className="trip-next-steps" aria-labelledby="guide-next-step-title">
        <div>
          <p className="product-eyebrow">Transforme sugestão em decisão</p>
          <h2 id="guide-next-step-title">Escolha só o que fizer sentido</h2>
          <p>
            Abra os detalhes de um Lugar para revisar informações práticas ou use “Adicionar ao
            roteiro” para escolher explicitamente o Dia. O Guia continua separado do planejamento
            canônico até essa ação.
          </p>
        </div>
        <div className="section-heading-row">
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
            Explorar outros lugares
          </Link>
          <Link className="product-primary-action" href={`/viagens/${tripId}/roteiro`}>
            Revisar meu roteiro
          </Link>
        </div>
      </section>
    </section>
  );
}
