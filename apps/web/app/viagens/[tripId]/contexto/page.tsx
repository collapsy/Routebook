import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzleTravelerProfileRepository, DrizzleTripRepository } from "@routebook/database";
import { findTravelerProfile } from "@routebook/traveler-profile";
import { findTripById } from "@routebook/trip-management";

import { TravelerContextForm } from "@/components/traveler-context-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contexto da viagem — RouteBook",
  description: "Configure viajantes, interesses, ritmo, transporte e orçamento da viagem.",
};

export default async function TravelerContextPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const profile = await findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId);

  return (
    <section className="app-page context-page">
      <Link className="back-link" href={`/viagens/${tripId}`}>
        ← Voltar para a visão da viagem
      </Link>

      <header className="app-page-heading">
        <p className="product-eyebrow">Personalização progressiva</p>
        <h1>Contexto de {trip.name}</h1>
        <p>
          Informe somente o que fizer sentido agora. Esses dados pertencem ao perfil dos viajantes e
          não alteram destino, período ou hospedagem da Viagem.
        </p>
      </header>

      <TravelerContextForm profile={profile} tripId={tripId} />
    </section>
  );
}
