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

import { PipaDailyExperiences } from "../../../../components/pipa-daily-experiences";
import { TripGuideModeNav } from "../../../../components/trip-guide-mode-nav";
import { buildPipaDailyExperience } from "../../../../lib/pipa-daily-experiences";
import { resolveTripTodayDate } from "../../../../lib/trip-active-day";
import { resolveTripDestinationId } from "../../../../lib/trip-destination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hoje em Pipa — RouteBook",
  description: "Consulte experiências e decisões úteis para o Dia sem carregar o guia completo.",
};

export default async function TripGuidePage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ dia?: string }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const destinationId = resolveTripDestinationId(trip.destination.name);
  if (destinationId !== "pipa-rn-br") notFound();

  const [profile, publishedPlaces] = await Promise.all([
    findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId),
    listPublishedPlaces(new DrizzlePlaceRepository(), destinationId),
  ]);
  const days = deriveTripDays(trip.period);
  const todayDate = resolveTripTodayDate(days, new Date(), "America/Fortaleza");
  const { dia } = await searchParams;
  const selectedDate =
    (dia && days.some((day) => day.date === dia) ? dia : undefined) ?? todayDate ?? days[0]?.date;
  const travelMode = profile?.transportPreference === "walking" ? "walking" : "driving";
  const dailyExperience = selectedDate
    ? buildPipaDailyExperience({
        tripId,
        date: selectedDate,
        places: publishedPlaces,
        ...(trip.accommodation?.coordinate
          ? { accommodationCoordinate: trip.accommodation.coordinate }
          : {}),
        travelMode,
      })
    : null;

  return (
    <section className="app-page trip-overview-page">
      <div className="section-heading-row">
        <Link className="back-link" href={`/viagens/${tripId}`}>
          ← Voltar para Visão da viagem
        </Link>
        <Link className="product-secondary-action" href={`/viagens/${tripId}/roteiro`}>
          Abrir Roteiro
        </Link>
      </div>

      <TripGuideModeNav
        active="today"
        {...(selectedDate ? { selectedDate } : {})}
        tripId={tripId}
      />

      {dailyExperience ? (
        <PipaDailyExperiences
          availableDates={days.map((day) => day.date)}
          experience={dailyExperience}
          todayDate={todayDate}
          tripId={tripId}
        />
      ) : (
        <section className="traveler-context-summary" aria-labelledby="today-unavailable">
          <p className="product-eyebrow">Hoje em Pipa</p>
          <h1 id="today-unavailable">Experiências do Dia indisponíveis</h1>
          <p>
            O RouteBook não possui cobertura governada para esta data. O Guia por dia e o Roteiro
            continuam disponíveis sem inventar programação.
          </p>
          <Link className="product-primary-action" href={`/viagens/${tripId}/guia/dias`}>
            Abrir Guia por dia
          </Link>
        </section>
      )}
    </section>
  );
}
