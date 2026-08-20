import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { DrizzleTripRepository } from "@routebook/database";
import { findTripById } from "@routebook/trip-management";

import { TripContextNav } from "@/components/trip-context-nav";
import { resolveTripDestinationId } from "@/lib/trip-destination";
import { resolveTripRouteAccess } from "@/lib/trip-route-access";

type AuthorizedTripLayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{ tripId: string }>;
}>;

export default async function AuthorizedTripLayout({
  children,
  params,
}: AuthorizedTripLayoutProps) {
  const { tripId } = await params;
  const access = await resolveTripRouteAccess({
    tripId,
    action: "trip:view",
  });

  if (access.status === "unauthenticated") {
    redirect(`/entrar?next=${encodeURIComponent(`/viagens/${tripId}`)}`);
  }
  if (access.status === "not-found") notFound();

  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const showGuide = resolveTripDestinationId(trip.destination.name) === "pipa-rn-br";

  return (
    <>
      <TripContextNav showGuide={showGuide} tripId={tripId} />
      {children}
    </>
  );
}
