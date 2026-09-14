import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzleDecisionRepository,
  DrizzleItineraryRepository,
  DrizzlePlanningConflictRepository,
  DrizzleTripRepository,
  evaluatePlanningConflicts,
} from "@routebook/database";
import { createItinerary, findTripById } from "@routebook/trip-management";

import { PlanningConflictReview } from "../../../../../components/planning-conflict-review";
import { buildPlanningConflictReview } from "../../../../../lib/planning-conflict-experience";
import { ignorePlanningRiskAction } from "./actions";
import styles from "./review-page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Revisão de conflitos — RouteBook",
  description: "Revise riscos e inconsistências encontrados no Roteiro da viagem.",
};

export default async function PlanningConflictReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ riscoIgnorado?: string; erro?: string }>;
}) {
  const { tripId } = await params;
  const { riscoIgnorado, erro } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const itineraryRepository = new DrizzleItineraryRepository();
  const itinerary =
    (await itineraryRepository.findByTripId(trip.id)) ??
    (await itineraryRepository.save(createItinerary({ tripId: trip.id, period: trip.period })));
  const evaluation = await evaluatePlanningConflicts(trip.id);
  const [conflictHistory, decisions] = await Promise.all([
    new DrizzlePlanningConflictRepository().listByTripId(trip.id),
    new DrizzleDecisionRepository().listByTripId(trip.id),
  ]);
  const review = buildPlanningConflictReview({
    conflicts: [
      ...evaluation.activeConflicts,
      ...conflictHistory.filter((conflict) => conflict.state === "ignored"),
    ],
    decisions,
    itinerary,
    participants: trip.participants,
    tripId: trip.id,
  });
  const errorMessages: Readonly<Record<string, string>> = {
    "conflito-nao-encontrado":
      "Este conflito não está mais disponível. Atualize e tente novamente.",
    "acao-cross-trip": "Não foi possível concluir esta ação. Volte ao Roteiro e tente novamente.",
    "severidade-incompativel": "Somente riscos podem ser ignorados.",
    "estado-incompativel": "Este risco já foi atualizado. A revisão mostra o estado atual.",
    "responsavel-nao-encontrado": "Não foi possível registrar esta escolha nesta viagem.",
    "conflito-idempotencia": "A página ficou desatualizada. Atualize e tente novamente.",
    "falha-persistencia": "Não foi possível ignorar este risco agora. Tente novamente.",
    "confirmacao-obrigatoria": "Confirme que entende que o risco continuará no Roteiro.",
  };
  const errorMessage = erro ? errorMessages[erro] : undefined;

  return (
    <section className={`app-page ${styles.page}`}>
      <Link className="back-link" href={`/viagens/${trip.id}/roteiro`}>
        ← Voltar para o Roteiro
      </Link>

      {riscoIgnorado === "1" ? (
        <p className={styles.success} role="status">
          Risco ignorado. A condição continua no Roteiro.
        </p>
      ) : null}

      {errorMessage ? (
        <p className={styles.actionError} role="alert">
          {errorMessage}
        </p>
      ) : null}

      <header className={styles.hero}>
        <div>
          <p className="product-eyebrow">Revisão do Roteiro</p>
          <h1>Revisão de Conflitos</h1>
          <p>Revise riscos e inconsistências encontrados no planejamento de {trip.name}.</p>
        </div>
        <p className={styles.freshness} role="status">
          <span aria-hidden="true">✓</span>
          Análise atualizada agora
        </p>
      </header>

      <PlanningConflictReview
        ignoreAction={ignorePlanningRiskAction}
        review={review}
        tripId={trip.id}
      />
    </section>
  );
}
