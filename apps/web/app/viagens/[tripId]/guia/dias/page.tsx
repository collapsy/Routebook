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

import { TripDayGuide } from "../../../../../components/trip-day-guide";
import { DestinationTripGuide } from "../../../../../components/destination-trip-guide";
import { TripGuideModeNav } from "../../../../../components/trip-guide-mode-nav";
import { buildPipaTripGuide } from "../../../../../lib/pipa-day-guide";
import { resolveTripTodayDate } from "../../../../../lib/trip-active-day";
import { loadTripCuratedCatalog } from "../../../../../lib/trip-curated-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guia por dia — RouteBook",
  description: "Consulte as decisões de cada Dia sem misturar com a agenda imediata.",
};

export default async function TripGuideDaysPage({
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
  const guide =
    curatedCatalog.destinationId === "pipa-rn-br"
      ? buildPipaTripGuide({
          tripId,
          days,
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

      <TripGuideModeNav active="days" {...(selectedDate ? { selectedDate } : {})} tripId={tripId} />

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
          {...(selectedDate ? { selectedDate } : {})}
          todayDate={todayDate}
        />
      ) : (
        <DestinationTripGuide
          days={days}
          destinationName={trip.destination.name}
          itinerary={itinerary}
          mode="days"
          savedPlaceCount={savedPlaces.length}
          {...(selectedDate ? { selectedDate } : {})}
          {...(todayDate ? { todayDate } : {})}
          tripId={tripId}
        />
      )}
    </section>
  );
}
