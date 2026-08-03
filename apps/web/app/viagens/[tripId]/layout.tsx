import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

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

  return children;
}
