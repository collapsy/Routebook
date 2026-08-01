import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzleItineraryRepository,
  DrizzleTripRepository,
  evaluatePlanningConflicts,
} from "@routebook/database";
import { createItinerary, findTripById } from "@routebook/trip-management";

import { PlanningConflictReview } from "../../../../../components/planning-conflict-review";
import { buildPlanningConflictReview } from "../../../../../lib/planning-conflict-experience";
import styles from "./review-page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Revisão de conflitos — RouteBook",
  description: "Revise conflitos determinísticos identificados no Roteiro da viagem.",
};

export default async function PlanningConflictReviewPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const itineraryRepository = new DrizzleItineraryRepository();
  const itinerary =
    (await itineraryRepository.findByTripId(trip.id)) ??
    (await itineraryRepository.save(createItinerary({ tripId: trip.id, period: trip.period })));
  const evaluation = await evaluatePlanningConflicts(trip.id);
  const review = buildPlanningConflictReview({
    conflicts: evaluation.activeConflicts,
    itinerary,
    tripId: trip.id,
  });

  return (
    <section className={`app-page ${styles.page}`}>
      <Link className="back-link" href={`/viagens/${trip.id}/roteiro`}>
        ← Voltar para o Roteiro
      </Link>

      <header className={styles.hero}>
        <div>
          <p className="product-eyebrow">Roteiro · análise determinística</p>
          <h1>Revisão de Conflitos</h1>
          <p>
            Veja inconsistências e riscos encontrados no planejamento de {trip.name}. A revisão não
            altera nenhuma atividade automaticamente.
          </p>
        </div>
        <p className={styles.freshness} role="status">
          <span aria-hidden="true">✓</span>
          Análise recalculada agora
        </p>
      </header>

      <PlanningConflictReview review={review} />
    </section>
  );
}
