import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzleTripRepository, DrizzleTripStageRepository } from "@routebook/database";
import { findTripById } from "@routebook/trip-management";

import { DestinationCombobox } from "@/components/destination-combobox";

import { addTripStageAction, removeTripStageAction } from "./actions";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function TripStagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ erro?: string; adicionada?: string; removida?: string }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();
  const stages = await new DrizzleTripStageRepository().listByTripId(tripId);
  const feedback = await searchParams;
  const errorMessage: Record<string, string> = {
    destino: "Não conseguimos confirmar esse destino. Selecione uma sugestão ou tente novamente.",
    selecao: "O destino mudou depois da seleção. Escolha novamente uma sugestão.",
    indisponivel: "A busca de destinos está indisponível agora. Tente novamente mais tarde.",
    datas: "Escolha datas válidas dentro do período da viagem.",
    salvar: "Não foi possível salvar esta etapa agora. Tente novamente.",
  };

  return (
    <section className="app-page trip-overview-page">
      <Link className="back-link" href={`/viagens/${tripId}`}>
        ← Voltar para a viagem
      </Link>
      <header className="app-page-heading">
        <p className="product-eyebrow">Destinos da viagem</p>
        <h1>Planeje visitas a outros lugares</h1>
        <p>
          Sua base é {trip.destination.name}. Adicione outra cidade para os dias em que pretende
          visitá-la. Um bate-volta não muda sua hospedagem em {trip.destination.name}.
        </p>
        <p>
          Para essa visita, escolha lugares e adicione-os manualmente aos dias da etapa. A proposta
          automática de roteiro ainda considera apenas o Destino principal.
        </p>
      </header>

      {feedback.erro && errorMessage[feedback.erro] ? (
        <p className="form-error" role="alert">
          {errorMessage[feedback.erro]}
        </p>
      ) : null}
      {feedback.adicionada === "1" ? (
        <p className="success-banner" role="status">
          Etapa adicionada à viagem.
        </p>
      ) : null}
      {feedback.removida === "1" ? (
        <p className="success-banner" role="status">
          Etapa removida da viagem.
        </p>
      ) : null}

      <section className="traveler-context-summary" aria-labelledby="trip-stage-list-heading">
        <h2 id="trip-stage-list-heading">Destinos desta viagem</h2>
        {stages.length > 0 ? (
          <p>Remover uma etapa não apaga lugares salvos nem atividades já colocadas no roteiro.</p>
        ) : null}
        <ul>
          <li>
            <strong>{trip.destination.name}</strong> · Destino principal ·{" "}
            {formatDate(trip.period.startDate)} a {formatDate(trip.period.endDate)}
            <div>Hospedagem principal: {trip.accommodation?.name ?? "Não informada"}</div>
            <Link className="product-inline-link" href={`/viagens/${tripId}/hospedagem`}>
              Editar hospedagem principal
            </Link>
          </li>
          {stages.map((stage) => (
            <li key={stage.id}>
              <strong>{stage.destination.name}</strong> · {formatDate(stage.startDate)}
              {stage.endDate !== stage.startDate ? ` a ${formatDate(stage.endDate)}` : ""}
              <div>
                Hospedagem desta etapa:{" "}
                {stage.accommodation?.name ?? "Não informada (bate-volta possível)"}
                {stage.accommodation && !stage.accommodation.coordinate
                  ? " · localização não confirmada"
                  : ""}
              </div>
              <div className="section-heading-row">
                <Link
                  className="product-inline-link"
                  href={`/viagens/${tripId}/lugares?etapa=${stage.id}`}
                >
                  Explorar lugares em {stage.destination.name}
                </Link>
                <Link
                  className="product-inline-link"
                  href={`/viagens/${tripId}/etapas/${stage.id}/hospedagem`}
                >
                  {stage.accommodation
                    ? "Editar hospedagem da etapa"
                    : "Adicionar hospedagem à etapa"}
                </Link>
                <form action={removeTripStageAction}>
                  <input name="tripId" type="hidden" value={tripId} />
                  <input name="stageId" type="hidden" value={stage.id} />
                  <button className="product-secondary-action" type="submit">
                    Remover etapa em {stage.destination.name}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="traveler-context-summary" aria-labelledby="add-trip-stage-heading">
        <h2 id="add-trip-stage-heading">Adicionar outra cidade</h2>
        <form action={addTripStageAction} className="trip-form">
          <input name="tripId" type="hidden" value={tripId} />
          <label htmlFor="destination">Destino da visita</label>
          <DestinationCombobox />
          <div>
            <label htmlFor="stage-start-date">Primeiro dia da visita</label>
            <input
              id="stage-start-date"
              max={trip.period.endDate}
              min={trip.period.startDate}
              name="startDate"
              required
              type="date"
            />
          </div>
          <div>
            <label htmlFor="stage-end-date">Último dia da visita</label>
            <input
              id="stage-end-date"
              max={trip.period.endDate}
              min={trip.period.startDate}
              name="endDate"
              required
              type="date"
            />
          </div>
          <p>Para um passeio de um dia, escolha a mesma data nos dois campos.</p>
          <button className="product-primary-action" type="submit">
            Adicionar destino à viagem
          </button>
        </form>
      </section>
    </section>
  );
}
