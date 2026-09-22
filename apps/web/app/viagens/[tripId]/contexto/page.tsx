import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzleTravelerProfileRepository,
  DrizzleTripPlacePreferenceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { findTravelerProfile } from "@routebook/traveler-profile";
import { findTripById } from "@routebook/trip-management";

import { TravelerContextForm } from "@/components/traveler-context-form";
import { TripPlanningWizard } from "@/components/trip-planning-wizard";
import { deriveTripPreparationReviewModel } from "@/lib/trip-preparation-review";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contexto da viagem — RouteBook",
  description: "Configure viajantes, interesses, ritmo, transporte e orçamento da viagem.",
};

type TravelerContextSection = "grupo" | "preferencias" | "logistica";

function parseSection(value: string | undefined): TravelerContextSection {
  if (value === "preferencias" || value === "logistica") return value;
  return "grupo";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function TravelerContextPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ preparar?: string; grupo?: string; salvo?: string }>;
}) {
  const { tripId } = await params;
  const { preparar, grupo, salvo } = await searchParams;
  const preparing = preparar === "1";
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const [profile, preferences] = await Promise.all([
    findTravelerProfile(new DrizzleTravelerProfileRepository(), tripId),
    new DrizzleTripPlacePreferenceRepository().listByTripId(tripId),
  ]);
  const requestedSection = parseSection(grupo);
  const section = profile ? requestedSection : "grupo";
  const reviewModel = deriveTripPreparationReviewModel({ trip, profile, preferences });
  const owner = trip.participants.find((participant) => participant.role === "owner");

  return (
    <section className="app-page context-page">
      <Link
        className="back-link"
        href={preparing ? `/viagens/${tripId}/lugares-salvos?preparar=1` : `/viagens/${tripId}`}
      >
        {preparing ? "← Voltar para Lugares" : "← Voltar para a visão da viagem"}
      </Link>

      {preparing ? <TripPlanningWizard currentStep="context" tripId={tripId} /> : null}

      {salvo === "1" ? (
        <p className="success-banner" role="status">
          Contexto salvo. Você pode continuar ou voltar a qualquer grupo sem perder as respostas.
        </p>
      ) : null}

      <header className="app-page-heading">
        <p className="product-eyebrow">Personalização progressiva</p>
        <h1>Contexto de {trip.name}</h1>
        <p>
          Complete somente o que ajudar no planejamento. O RouteBook reutiliza o que já conhece da
          Viagem e mantém informações opcionais como não informadas quando você não as definir.
        </p>
      </header>

      <section className="traveler-context-summary" aria-labelledby="known-trip-context-title">
        <div className="section-heading-row">
          <div>
            <p className="product-eyebrow">Já sabemos sobre esta Viagem</p>
            <h2 id="known-trip-context-title">Dados que não precisam ser perguntados novamente</h2>
          </div>
        </div>
        <dl className="trip-overview-summary" aria-label="Dados conhecidos da viagem">
          <div>
            <dt>Destino</dt>
            <dd>{trip.destination.name}</dd>
          </div>
          <div>
            <dt>Período</dt>
            <dd>
              {formatDate(trip.period.startDate)} a {formatDate(trip.period.endDate)}
            </dd>
          </div>
          <div>
            <dt>Hospedagem</dt>
            <dd>{trip.accommodation?.name ?? "Ainda não informada"}</dd>
            {trip.accommodation?.address ? <small>{trip.accommodation.address}</small> : null}
          </div>
          <div>
            <dt>Responsável</dt>
            <dd>{owner?.displayName ?? "Ainda não informado"}</dd>
          </div>
        </dl>
      </section>

      <TravelerContextForm
        preparing={preparing}
        profile={profile}
        section={section}
        tripId={tripId}
      />

      {profile ? (
        <section className="traveler-context-summary" aria-labelledby="preparation-review-boundary">
          <p className="product-eyebrow">Próxima etapa</p>
          <h2 id="preparation-review-boundary">Contexto preparado para uma futura Revisão</h2>
          <p>
            A preparação agora consegue reunir {reviewModel.selection.considered}{" "}
            {reviewModel.selection.considered === 1
              ? "lugar em consideração"
              : "lugares em consideração"}{" "}
            e o contexto persistido dos viajantes sem criar Activity ou Proposal.
          </p>
          {reviewModel.context.missingOptional.length > 0 ? (
            <p>
              Ainda não informado, sem bloquear o avanço:{" "}
              {reviewModel.context.missingOptional.join(", ")}.
            </p>
          ) : (
            <p>Todos os campos opcionais representáveis pelo perfil atual foram informados.</p>
          )}
          <p>
            A tela de Revisão será implementada no próximo corte. Nenhuma proposta de roteiro é
            gerada ao concluir este passo.
          </p>
        </section>
      ) : (
        <section className="traveler-context-summary" aria-labelledby="preparation-context-start">
          <p className="product-eyebrow">Primeiro grupo</p>
          <h2 id="preparation-context-start">Defina o tamanho do grupo</h2>
          <p>
            Este é o único dado obrigatório do contrato atual de TravelerProfile. Interesses, ritmo,
            transporte e orçamento continuam opcionais.
          </p>
        </section>
      )}
    </section>
  );
}
