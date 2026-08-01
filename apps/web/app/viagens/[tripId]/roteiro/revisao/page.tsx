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
  description: "Revise conflitos determinísticos identificados no Roteiro da viagem.",
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
      "O Conflito não foi encontrado nesta Viagem. Atualize e tente novamente.",
    "acao-cross-trip": "A ação foi rejeitada porque os dados não pertencem à mesma Viagem.",
    "severidade-incompativel": "Somente Riscos podem receber a ação Ignorar risco.",
    "estado-incompativel": "Este Risco já foi atualizado. A revisão abaixo mostra o estado atual.",
    "responsavel-nao-encontrado":
      "A Viagem não possui um Organizador persistido para registrar a Decision.",
    "conflito-idempotencia":
      "Esta confirmação já foi enviada com dados diferentes. Atualize a página.",
    "falha-persistencia":
      "Não foi possível registrar a Decision. Nenhuma alteração parcial foi mantida.",
    "confirmacao-obrigatoria": "Confirme que compreende a permanência do Risco antes de continuar.",
  };
  const errorMessage = erro ? errorMessages[erro] : undefined;

  return (
    <section className={`app-page ${styles.page}`}>
      <Link className="back-link" href={`/viagens/${trip.id}/roteiro`}>
        ← Voltar para o Roteiro
      </Link>

      {riscoIgnorado === "1" ? (
        <p className={styles.success} role="status">
          Risco ignorado e Decision registrada. A condição não foi resolvida e o Roteiro não foi
          alterado.
        </p>
      ) : null}

      {errorMessage ? (
        <p className={styles.actionError} role="alert">
          {errorMessage}
        </p>
      ) : null}

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

      <PlanningConflictReview
        ignoreAction={ignorePlanningRiskAction}
        review={review}
        tripId={trip.id}
      />
    </section>
  );
}
