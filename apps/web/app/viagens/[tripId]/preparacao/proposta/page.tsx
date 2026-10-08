import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleTravelerProfileRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { findTravelerProfile } from "@routebook/traveler-profile";
import { findTripById } from "@routebook/trip-management";

import { ItineraryProposalGenerationControl } from "../../../../../components/itinerary-proposal-generation-control";
import { TripPlanningWizard } from "../../../../../components/trip-planning-wizard";
import { hasReadyItineraryProposal } from "../../../../../lib/itinerary-proposal-experience";
import { generateItineraryProposalAction } from "../../roteiro/proposta/generate-action";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Montar proposta — RouteBook",
  description: "Gere uma proposta de roteiro a partir das escolhas revisadas.",
};

export default async function TripPreparationProposalPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ preparar?: string }>;
}) {
  const { tripId } = await params;
  const { preparar } = await searchParams;
  if (preparar !== "1") notFound();

  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();
  if (trip.status !== "draft") redirect(`/viagens/${tripId}/roteiro/proposta`);

  const [profile, itinerary, proposals] = await Promise.all([
    findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId),
    new DrizzleItineraryRepository().findByTripId(tripId),
    new DrizzleItineraryProposalRepository().listByTripId(tripId),
  ]);
  if (hasReadyItineraryProposal(proposals, new Date())) {
    redirect(`/viagens/${tripId}/roteiro/proposta?preparar=1`);
  }
  const canGenerate = profile?.travelerCount !== undefined;
  const action = generateItineraryProposalAction.bind(null, tripId);

  return (
    <section className="app-page preparation-review-page">
      <Link className="back-link" href={`/viagens/${tripId}/preparacao/revisao?preparar=1`}>
        ← Voltar para Revisão
      </Link>
      <TripPlanningWizard currentStep="proposal" tripId={tripId} tripStatus={trip.status} />
      <header className="app-page-heading">
        <p className="product-eyebrow">Proposta de roteiro</p>
        <h1>Monte uma proposta para {trip.name}</h1>
        <p>
          A proposta será uma sugestão revisável. Gerá-la não aplica as sugestões ao Roteiro nem
          cria Atividades planejadas.
        </p>
      </header>
      <section className="traveler-context-summary" aria-labelledby="preparation-proposal-title">
        <h2 id="preparation-proposal-title">Tudo pronto para gerar?</h2>
        {canGenerate ? (
          <>
            <p>
              O RouteBook usará a Trip, suas seleções e o contexto informado para preparar a
              sugestão.
            </p>
            {!itinerary ? (
              <p role="note">
                Esta viagem ainda não tem roteiro. Ao gerar a proposta, criaremos apenas os Dias
                vazios necessários; nenhuma Atividade será adicionada antes do seu aceite.
              </p>
            ) : null}
            <ItineraryProposalGenerationControl action={action} preparing />
          </>
        ) : (
          <>
            <p>Informe a quantidade de viajantes antes de gerar uma proposta.</p>
            <Link
              className="product-primary-action"
              href={`/viagens/${tripId}/contexto?preparar=1`}
            >
              Editar Contexto
            </Link>
          </>
        )}
      </section>
    </section>
  );
}
