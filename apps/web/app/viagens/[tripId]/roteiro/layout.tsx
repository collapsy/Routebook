import type { ReactNode } from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import {
  DrizzleItineraryRepository,
  DrizzlePlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { listPublishedPlaces } from "@routebook/place-catalog";
import { createItinerary, findTripById } from "@routebook/trip-management";

import { deriveItineraryDaySpatialContext } from "../../../../lib/itinerary-spatial-context";
import { ItinerarySpatialPanel } from "./itinerary-spatial-panel";

function resolveDestinationId(destinationName: string): string | null {
  const normalized = destinationName.trim().toLocaleLowerCase("pt-BR");
  return normalized.includes("pipa") ? "pipa-rn-br" : null;
}

function formatDayLabel(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function ItineraryLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const itineraryRepository = new DrizzleItineraryRepository();
  const persistedItinerary = await itineraryRepository.findByTripId(tripId);
  const itinerary = persistedItinerary ?? createItinerary({ tripId: trip.id, period: trip.period });
  const destinationId = resolveDestinationId(trip.destination.name);
  const publishedPlaces = destinationId
    ? await listPublishedPlaces(new DrizzlePlaceRepository(), destinationId)
    : [];
  const days = itinerary.days.map((day) => ({
    date: day.date,
    position: day.position,
    label: formatDayLabel(day.date),
    context: deriveItineraryDaySpatialContext({
      itinerary,
      dayDate: day.date,
      publishedPlaces,
      ...(trip.accommodation ? { accommodation: trip.accommodation } : {}),
    }),
  }));

  return (
    <>
      <Suspense fallback={<p aria-live="polite">Carregando contexto geográfico do Roteiro…</p>}>
        <ItinerarySpatialPanel days={days} tripId={tripId} />
      </Suspense>
      {children}
    </>
  );
}
