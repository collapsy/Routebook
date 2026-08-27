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
import { TripDayGuide } from "../../../../components/trip-day-guide";
import { buildPipaDailyExperience } from "../../../../lib/pipa-daily-experiences";
import { buildPipaTripGuide } from "../../../../lib/pipa-day-guide";
import { resolveTripTodayDate } from "../../../../lib/trip-active-day";
import { resolveTripDestinationId } from "../../../../lib/trip-destination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guia da viagem — RouteBook",
  description: "Consulte a sugestão editorial diária da sua viagem sem alterar o Roteiro.",
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
  const guide = buildPipaTripGuide({
    tripId,
    days,
    places: publishedPlaces,
    ...(trip.accommodation?.coordinate
      ? { accommodationCoordinate: trip.accommodation.coordinate }
      : {}),
    travelMode,
  });
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

      {dailyExperience ? (
        <PipaDailyExperiences
          availableDates={days.map((day) => day.date)}
          experience={dailyExperience}
          todayDate={todayDate}
          tripId={tripId}
        />
      ) : null}

      {guide ? (
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
          guide={guide}
          todayDate={todayDate}
        />
      ) : (
        <section className="traveler-context-summary" aria-labelledby="trip-guide-unavailable">
          <p className="product-eyebrow">Guia da viagem</p>
          <h1 id="trip-guide-unavailable">Guia editorial temporariamente indisponível</h1>
          <p>
            O RouteBook não encontrou todos os Places publicados necessários para apresentar uma
            sequência íntegra. Explore o catálogo ou use o Roteiro sem inventar paradas ausentes.
          </p>
          <div className="section-heading-row">
            <Link className="product-primary-action" href={`/viagens/${tripId}/lugares`}>
              Explorar Lugares
            </Link>
            <Link className="product-secondary-action" href={`/viagens/${tripId}/roteiro`}>
              Abrir Roteiro
            </Link>
          </div>
        </section>
      )}
    </section>
  );
}
