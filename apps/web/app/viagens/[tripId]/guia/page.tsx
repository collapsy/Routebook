import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzleItineraryRepository,
  DrizzleSavedPlaceRepository,
  DrizzleTravelerProfileRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { listSavedPlaces } from "@routebook/saved-places";
import { findTravelerProfile } from "@routebook/traveler-profile";
import { deriveTripDays, findTripById } from "@routebook/trip-management";

import { PipaDailyExperiences } from "../../../../components/pipa-daily-experiences";
import { DestinationTripGuide } from "../../../../components/destination-trip-guide";
import { TripGuideModeNav } from "../../../../components/trip-guide-mode-nav";
import { buildPipaDailyExperience } from "../../../../lib/pipa-daily-experiences";
import { resolveTripTodayDate } from "../../../../lib/trip-active-day";
import { loadTripCuratedCatalog } from "../../../../lib/trip-curated-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hoje na viagem — RouteBook",
  description: "Consulte decisões úteis para o Dia sem carregar o guia completo.",
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

  const [profile, curatedCatalog, itinerary, savedPlaces] = await Promise.all([
    findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId),
    loadTripCuratedCatalog(trip),
    new DrizzleItineraryRepository().findByTripId(tripId),
    listSavedPlaces(new DrizzleSavedPlaceRepository(), tripId),
  ]);
  const publishedPlaces = curatedCatalog.places;
  const days = deriveTripDays(trip.period);
  const todayDate = resolveTripTodayDate(days, new Date(), trip.destination.timeZone);
  const { dia } = await searchParams;
  const selectedDate =
    (dia && days.some((day) => day.date === dia) ? dia : undefined) ?? todayDate ?? days[0]?.date;
  const travelMode = profile?.transportPreference === "walking" ? "walking" : "driving";
  const dailyExperience =
    selectedDate && curatedCatalog.destinationId === "pipa-rn-br"
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
        <DestinationTripGuide
          days={days}
          destinationName={trip.destination.name}
          itinerary={itinerary}
          mode="today"
          savedPlaceCount={savedPlaces.length}
          {...(selectedDate ? { selectedDate } : {})}
          {...(todayDate ? { todayDate } : {})}
          tripId={tripId}
        />
      )}
    </section>
  );
}
