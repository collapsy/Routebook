import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { findTripById } from "@routebook/trip-management";

import { ItineraryProposalReview } from "../../../../../components/itinerary-proposal-review";
import {
  buildItineraryProposalReview,
  findLatestReadyItineraryProposal,
  ItineraryProposalReviewIntegrityError,
} from "../../../../../lib/itinerary-proposal-experience";
import styles from "./proposal-page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proposta de Roteiro — RouteBook",
  description: "Revise uma sugestão separada do Roteiro atual da viagem.",
};

export default async function ItineraryProposalReviewPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const [itinerary, proposals] = await Promise.all([
    new DrizzleItineraryRepository().findByTripId(trip.id),
    new DrizzleItineraryProposalRepository().listByTripId(trip.id),
  ]);
  const proposal = findLatestReadyItineraryProposal(proposals);

  if (!proposal) {
    return (
      <section className={`app-page ${styles.page}`}>
        <Link className="back-link" href={`/viagens/${trip.id}/roteiro`}>
          ← Voltar para o Roteiro
        </Link>
        <div className={styles.emptyState}>
          <p className="product-eyebrow">Proposta de Roteiro</p>
          <h1>Nenhuma proposta disponível</h1>
          <p>
            Ainda não existe uma proposta pronta para revisão. Seu Roteiro atual continua disponível
            e não foi alterado.
          </p>
          <Link className="product-secondary-action" href={`/viagens/${trip.id}/roteiro`}>
            Continuar no Roteiro
          </Link>
        </div>
      </section>
    );
  }

  if (!itinerary) {
    throw new ItineraryProposalReviewIntegrityError(
      "A Proposta pronta não possui um Roteiro correspondente.",
    );
  }

  const review = buildItineraryProposalReview({ itinerary, proposal });

  return (
    <section className={`app-page ${styles.page}`}>
      <Link className="back-link" href={`/viagens/${trip.id}/roteiro`}>
        ← Voltar para o Roteiro
      </Link>

      <header className={styles.hero}>
        <div>
          <p className="product-eyebrow">{trip.name} · revisão separada</p>
          <h1>Proposta de Roteiro</h1>
          <p>
            Revise critérios, limitações e mudanças sugeridas antes de qualquer decisão. Esta página
            não aplica alterações.
          </p>
        </div>
        <span>Roteiro atual preservado</span>
      </header>

      <ItineraryProposalReview review={review} />
    </section>
  );
}
