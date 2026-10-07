import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { findTripById } from "@routebook/trip-management";

import { ItineraryProposalGenerationControl } from "../../../../../components/itinerary-proposal-generation-control";
import { ItineraryProposalReplanningWindow } from "../../../../../components/itinerary-proposal-replanning-window";
import { ItineraryProposalReview } from "../../../../../components/itinerary-proposal-review";
import { TripPlanningWizard } from "../../../../../components/trip-planning-wizard";
import {
  buildItineraryProposalReview,
  findLatestReviewableItineraryProposal,
  ItineraryProposalReviewIntegrityError,
} from "../../../../../lib/itinerary-proposal-experience";
import { resolveTripRouteAccess } from "../../../../../lib/trip-route-access";
import { discardItineraryProposalAction } from "./actions";
import { generateItineraryProposalAction } from "./generate-action";
import styles from "./proposal-page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proposta de Roteiro — RouteBook",
  description: "Revise uma sugestão antes de aplicá-la ao Roteiro da viagem.",
};

export default async function ItineraryProposalReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ preparar?: string; scope?: string }>;
}) {
  const { tripId } = await params;
  const { preparar, scope } = await searchParams;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();
  const preparing = preparar === "1" && trip.status === "draft";
  const generationScope = scope === "REPLAN" ? "REPLAN" : "INITIAL";
  const replanningUnavailable =
    generationScope === "REPLAN" && trip.status !== "planned" && trip.status !== "in-progress";

  const [itinerary, proposals, acceptanceAccess, editAccess] = await Promise.all([
    new DrizzleItineraryRepository().findByTripId(trip.id),
    new DrizzleItineraryProposalRepository().listByTripId(trip.id),
    resolveTripRouteAccess({ tripId: trip.id, action: "trip:accept-proposal" }),
    resolveTripRouteAccess({ tripId: trip.id, action: "trip:edit" }),
  ]);
  const asOf = new Date();
  const proposal = findLatestReviewableItineraryProposal(proposals, asOf);
  const canGenerate = editAccess.status === "authorized" && !replanningUnavailable;
  const generateAction = generateItineraryProposalAction.bind(null, trip.id);

  if (!proposal) {
    return (
      <section className={`app-page ${styles.page}`}>
        {preparing ? (
          <TripPlanningWizard currentStep="proposal" tripId={trip.id} tripStatus={trip.status} />
        ) : null}
        <Link className="back-link" href={`/viagens/${trip.id}/roteiro`}>
          ← Voltar para o Roteiro
        </Link>
        <div className={styles.emptyState}>
          <p className="product-eyebrow">Proposta de Roteiro</p>
          <h1>
            {generationScope === "REPLAN"
              ? "Nenhuma proposta de replanejamento disponível"
              : "Nenhuma proposta disponível"}
          </h1>
          {replanningUnavailable ? (
            <p>O replanejamento está disponível somente para viagens planejadas ou em andamento.</p>
          ) : generationScope === "REPLAN" ? (
            <p>
              A janela temporal será calculada no momento da geração. A proposta mostrará quais Dias
              podem receber mudanças e preservará o trecho protegido.
            </p>
          ) : (
            <p>Gere uma nova proposta ou continue montando o Roteiro manualmente.</p>
          )}
          {canGenerate ? (
            <ItineraryProposalGenerationControl
              action={generateAction}
              generationScope={generationScope}
            />
          ) : null}
          <Link className="product-secondary-action" href={`/viagens/${trip.id}/roteiro`}>
            Continuar no Roteiro
          </Link>
        </div>
      </section>
    );
  }

  if (!itinerary) {
    throw new ItineraryProposalReviewIntegrityError(
      "A Proposta revisável não possui um Roteiro correspondente.",
    );
  }

  const replanningWindow =
    proposal.generationScope === "REPLAN"
      ? proposal.generationContext?.replanningWindow
      : undefined;
  if (proposal.generationScope === "REPLAN" && !replanningWindow) {
    throw new ItineraryProposalReviewIntegrityError(
      "A Proposal REPLAN não possui o snapshot temporal necessário para revisão.",
    );
  }

  const review = buildItineraryProposalReview({ asOf, itinerary, proposal });
  const discardAction = discardItineraryProposalAction.bind(null, trip.id);
  const canDecide = acceptanceAccess.status === "authorized";
  const isEmptyReady = review.status === "ready" && review.proposedChangeCount === 0;
  const canEdit =
    editAccess.status === "authorized" &&
    review.status === "ready" &&
    !isEmptyReady &&
    review.isBasedOnCurrentItinerary;
  const idempotencyKey = `accept-itinerary-proposal:${proposal.id}:${proposal.baseItineraryVersion}`;
  const itineraryHref = `/viagens/${trip.id}/roteiro`;
  const nextGenerationScope =
    generationScope === "REPLAN" || proposal.generationScope === "REPLAN" ? "REPLAN" : "INITIAL";

  return (
    <section className={`app-page ${styles.page}`}>
      {preparing ? (
        <TripPlanningWizard currentStep="proposal" tripId={trip.id} tripStatus={trip.status} />
      ) : null}
      <Link className="back-link" href={itineraryHref}>
        ← Voltar para o Roteiro
      </Link>

      <header className={styles.hero}>
        <div>
          <p className="product-eyebrow">{trip.name}</p>
          <h1>
            {proposal.generationScope === "REPLAN"
              ? "Proposta de replanejamento"
              : "Proposta de Roteiro"}
          </h1>
          <p>
            {review.status === "expired"
              ? "Esta proposta expirou. Consulte as sugestões como referência para planejar o Roteiro atual."
              : isEmptyReady
                ? "Nenhuma mudança adequada foi encontrada. Você pode descartar esta proposta e gerar outra usando os Lugares disponíveis agora."
                : "Revise as mudanças sugeridas, edite se necessário e escolha o que deseja aplicar ao Roteiro."}
          </p>
        </div>
        <span>
          {review.status === "expired"
            ? "Proposta expirada"
            : isEmptyReady
              ? "Sem mudanças sugeridas"
              : "Aguardando sua decisão"}
        </span>
      </header>

      {generationScope === "REPLAN" && proposal.generationScope !== "REPLAN" ? (
        <p role="status">
          Esta viagem já tem uma proposta de planejamento inicial aguardando decisão. Resolva essa
          proposta antes de iniciar um replanejamento.
        </p>
      ) : null}

      {proposal.generationScope === "REPLAN" && replanningWindow ? (
        <ItineraryProposalReplanningWindow days={itinerary.days} window={replanningWindow} />
      ) : null}

      {review.status === "expired" && canGenerate ? (
        <section className={styles.expiredNextStep} aria-labelledby="expired-proposal-next-step">
          <div>
            <p className="product-eyebrow">Próximo passo</p>
            <h2 id="expired-proposal-next-step">Continue com uma nova proposta</h2>
            <p>
              A proposta abaixo permanece como referência. Gere outra usando o Roteiro e os Lugares
              disponíveis agora.
            </p>
          </div>
          <ItineraryProposalGenerationControl
            action={generateAction}
            generationScope={nextGenerationScope}
          />
        </section>
      ) : null}

      {isEmptyReady ? (
        <div>
          {canDecide ? (
            <form action={discardAction}>
              <input name="itineraryProposalId" type="hidden" value={proposal.id} />
              <button className="product-secondary-action" type="submit">
                Descartar e gerar outra
              </button>
            </form>
          ) : null}
          <Link className="product-secondary-action" href={`/viagens/${trip.id}/lugares`}>
            Explorar lugares
          </Link>
        </div>
      ) : null}

      <ItineraryProposalReview
        canAccept={canDecide && !isEmptyReady}
        canDecide={canDecide && !isEmptyReady}
        canEdit={canEdit}
        discardAction={discardAction}
        expectedItineraryVersion={proposal.baseItineraryVersion}
        idempotencyKey={idempotencyKey}
        itineraryHref={itineraryHref}
        review={review}
        tripId={trip.id}
      />
    </section>
  );
}
