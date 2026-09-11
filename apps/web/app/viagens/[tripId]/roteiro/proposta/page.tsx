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
import { ItineraryProposalReview } from "../../../../../components/itinerary-proposal-review";
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
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const [itinerary, proposals, acceptanceAccess, editAccess] = await Promise.all([
    new DrizzleItineraryRepository().findByTripId(trip.id),
    new DrizzleItineraryProposalRepository().listByTripId(trip.id),
    resolveTripRouteAccess({ tripId: trip.id, action: "trip:accept-proposal" }),
    resolveTripRouteAccess({ tripId: trip.id, action: "trip:edit" }),
  ]);
  const proposal = findLatestReviewableItineraryProposal(proposals);

  if (!proposal) {
    const canGenerate = editAccess.status === "authorized";
    const generateAction = generateItineraryProposalAction.bind(null, trip.id);

    return (
      <section className={`app-page ${styles.page}`}>
        <Link className="back-link" href={`/viagens/${trip.id}/roteiro`}>
          ← Voltar para o Roteiro
        </Link>
        <div className={styles.emptyState}>
          <p className="product-eyebrow">Proposta de Roteiro</p>
          <h1>Nenhuma proposta disponível</h1>
          <p>Gere uma nova proposta ou continue montando o Roteiro manualmente.</p>
          {canGenerate ? <ItineraryProposalGenerationControl action={generateAction} /> : null}
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

  const review = buildItineraryProposalReview({ itinerary, proposal });
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

  return (
    <section className={`app-page ${styles.page}`}>
      <Link className="back-link" href={itineraryHref}>
        ← Voltar para o Roteiro
      </Link>

      <header className={styles.hero}>
        <div>
          <p className="product-eyebrow">{trip.name}</p>
          <h1>Proposta de Roteiro</h1>
          <p>
            {proposal.status === "expired"
              ? "Esta proposta expirou. Consulte as sugestões como referência para planejar o Roteiro atual."
              : isEmptyReady
                ? "Nenhuma mudança adequada foi encontrada. Você pode descartar esta proposta e gerar outra usando os Lugares disponíveis agora."
                : "Revise as mudanças sugeridas, edite se necessário e escolha o que deseja aplicar ao Roteiro."}
          </p>
        </div>
        <span>
          {proposal.status === "expired"
            ? "Proposta expirada"
            : isEmptyReady
              ? "Sem mudanças sugeridas"
              : "Aguardando sua decisão"}
        </span>
      </header>

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
