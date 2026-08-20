import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzlePlaceRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import { listPublishedPlaces } from "@routebook/place-catalog";
import {
  createItinerary,
  findTripById,
  type Activity,
  type Itinerary,
  type Trip,
} from "@routebook/trip-management";

import { getItineraryProposalReviewStatus } from "../../../../lib/itinerary-proposal-experience";
import { deriveItineraryDayLegSummary } from "../../../../lib/itinerary-leg-distances";
import { deriveItineraryDaySpatialContext } from "../../../../lib/itinerary-spatial-context";
import {
  resolvePreferredTripDay,
  resolveTripTodayDate,
} from "../../../../lib/trip-active-day";
import {
  addManualActivityAction,
  moveItineraryActivityAction,
  removeItineraryActivityAction,
  reorderItineraryActivitiesAction,
  updateItineraryActivityAction,
} from "./actions";
import { FreePeriodComposer, FreePeriodList } from "./free-periods";
import { ItinerarySpatialPanel } from "./itinerary-spatial-panel";

import journeyStyles from "./itinerary-journey.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Roteiro da viagem — RouteBook",
  description: "Organize atividades e períodos livres por dia da viagem.",
};

type ItineraryPeriod = {
  id: "morning" | "afternoon" | "evening" | "unscheduled";
  label: string;
  activities: Activity[];
};

const proposalErrorMessages: Readonly<Record<string, string>> = {
  "referencia-invalida":
    "A referência da proposta é inválida. O Roteiro atual permanece preservado.",
  "proposta-nao-encontrada":
    "A proposta não está mais disponível nesta Viagem. O Roteiro atual permanece preservado.",
  "estado-atualizado":
    "A proposta foi atualizada e não pode mais ser descartada. O Roteiro atual permanece preservado.",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatDayLabel(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

function formatDaySummary(activityCount: number, freePeriodCount: number): string {
  const activityLabel = activityCount === 1 ? "atividade" : "atividades";
  const freePeriodLabel = freePeriodCount === 1 ? "período livre" : "períodos livres";
  return `${activityCount} ${activityLabel} · ${freePeriodCount} ${freePeriodLabel}`;
}

function groupByPeriod(activities: Activity[]): ItineraryPeriod[] {
  const periods: ItineraryPeriod[] = [
    { id: "morning", label: "Manhã", activities: [] },
    { id: "afternoon", label: "Tarde", activities: [] },
    { id: "evening", label: "Noite", activities: [] },
    { id: "unscheduled", label: "Sem horário", activities: [] },
  ];

  for (const activity of activities) {
    if (!activity.startTime) {
      periods[3]?.activities.push(activity);
      continue;
    }

    const hour = Number(activity.startTime.slice(0, 2));
    if (hour < 12) periods[0]?.activities.push(activity);
    else if (hour < 18) periods[1]?.activities.push(activity);
    else periods[2]?.activities.push(activity);
  }

  return periods.filter((period) => period.activities.length > 0);
}

function resolveDestinationId(destinationName: string): string | null {
  const normalized = destinationName.trim().toLocaleLowerCase("pt-BR");
  return normalized.includes("pipa") ? "pipa-rn-br" : null;
}

async function loadOrCreateItinerary(trip: Trip): Promise<Itinerary> {
  const repository = new DrizzleItineraryRepository();
  const existing = await repository.findByTripId(trip.id);
  if (existing) return existing;

  return repository.save(createItinerary({ tripId: trip.id, period: trip.period }));
}

function ReorderActivityForm({
  activity,
  direction,
  targetActivity,
  tripId,
}: {
  activity: Activity;
  direction: "Subir" | "Descer";
  targetActivity: Activity;
  tripId: string;
}) {
  return (
    <form action={reorderItineraryActivitiesAction}>
      <input name="tripId" type="hidden" value={tripId} />
      <input name="activityId" type="hidden" value={activity.id} />
      <input name="targetActivityId" type="hidden" value={targetActivity.id} />
      <button
        aria-label={`${direction} ${activity.title} no roteiro`}
        className="itinerary-order-action"
        type="submit"
      >
        {direction}
      </button>
    </form>
  );
}

export default async function ItineraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{
    dia?: string;
    atividadeCriada?: string;
    atividadeEditada?: string;
    atividadeMovida?: string;
    atividadeRemovida?: string;
    atividadeReordenada?: string;
    periodoLivreCriado?: string;
    propostaAceita?: string;
    propostaDescartada?: string;
    erroProposta?: string;
    erro?: string;
  }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const [itinerary, proposals] = await Promise.all([
    loadOrCreateItinerary(trip),
    new DrizzleItineraryProposalRepository().listByTripId(trip.id),
  ]);
  const proposalReviewStatus = getItineraryProposalReviewStatus(proposals);
  const {
    dia,
    atividadeCriada,
    atividadeEditada,
    atividadeMovida,
    atividadeRemovida,
    atividadeReordenada,
    periodoLivreCriado,
    propostaAceita,
    propostaDescartada,
    erroProposta,
    erro,
  } = await searchParams;
  const destinationId = resolveDestinationId(trip.destination.name);
  const now = new Date();
  const activeTimeZone = destinationId === "pipa-rn-br" ? "America/Fortaleza" : "UTC";
  const todayDate = resolveTripTodayDate(itinerary.days, now, activeTimeZone);
  const selectedDay = resolvePreferredTripDay(itinerary.days, dia, now, activeTimeZone);
  if (!selectedDay) notFound();

  const activityCount = itinerary.days.reduce((total, day) => total + day.activities.length, 0);
  const freePeriodCount = itinerary.days.reduce((total, day) => total + day.freePeriods.length, 0);
  const periods = groupByPeriod(selectedDay.activities);
  const targetDays = itinerary.days.filter((day) => day.id !== selectedDay.id);
  const selectedItemCount = selectedDay.activities.length + selectedDay.freePeriods.length;
  const selectedDaySummary = formatDaySummary(
    selectedDay.activities.length,
    selectedDay.freePeriods.length,
  );
  const publishedPlaces = destinationId
    ? await listPublishedPlaces(new DrizzlePlaceRepository(), destinationId)
    : [];
  const spatialDays = itinerary.days.map((day) => {
    const context = deriveItineraryDaySpatialContext({
      itinerary,
      dayDate: day.date,
      publishedPlaces,
      ...(trip.accommodation ? { accommodation: trip.accommodation } : {}),
    });

    return {
      date: day.date,
      position: day.position,
      label: formatDayLabel(day.date),
      context,
      legSummary: deriveItineraryDayLegSummary(context),
    };
  });

  return (
    <section className="app-page itinerary-page">
      <Link className="back-link" href={`/viagens/${tripId}`}>
        ← Voltar para a viagem
      </Link>

      {atividadeCriada === "1" ? (
        <p className="success-banner" role="status">
          Atividade adicionada ao roteiro.
        </p>
      ) : null}
      {atividadeEditada === "1" ? (
        <p className="success-banner" role="status">
          Atividade atualizada no roteiro.
        </p>
      ) : null}
      {atividadeMovida === "1" ? (
        <p className="success-banner" role="status">
          Atividade movida para outro dia.
        </p>
      ) : null}
      {atividadeReordenada === "1" ? (
        <p className="success-banner" role="status">
          Ordem das atividades atualizada.
        </p>
      ) : null}
      {atividadeRemovida === "1" ? (
        <p className="success-banner" role="status">
          Atividade removida do roteiro.
        </p>
      ) : null}
      {periodoLivreCriado === "1" ? (
        <p className="success-banner" role="status">
          Período livre adicionado ao roteiro.
        </p>
      ) : null}
      {propostaAceita === "applied" || propostaAceita === "replay" ? (
        <p className="success-banner" role="status">
          {propostaAceita === "replay"
            ? "Esta proposta já havia sido aceita. O Roteiro atualizado foi carregado."
            : "Proposta aceita. O Roteiro foi atualizado com as mudanças confirmadas."}
        </p>
      ) : null}
      {propostaAceita === "partial-applied" || propostaAceita === "partial-replay" ? (
        <p className="success-banner" role="status">
          {propostaAceita === "partial-replay"
            ? "Esta seleção já havia sido aplicada. O Roteiro atualizado foi carregado."
            : "Seleção aplicada. O Roteiro foi atualizado somente com as mudanças confirmadas."}
        </p>
      ) : null}
      {propostaDescartada === "1" ? (
        <p className="success-banner" role="status">
          Proposta descartada. Seu Roteiro atual não foi alterado.
        </p>
      ) : null}
      {erroProposta && proposalErrorMessages[erroProposta] ? (
        <p className="form-error itinerary-feedback" role="alert">
          {proposalErrorMessages[erroProposta]}
        </p>
      ) : null}
      {erro ? (
        <p className="form-error itinerary-feedback" role="alert">
          {erro}
        </p>
      ) : null}

      <header className="itinerary-hero">
        <div>
          <p className="product-eyebrow">Planejamento por Dia</p>
          <h1>{trip.name}</h1>
          <p>
            Escolha um Dia, veja o que já está decidido e avance a partir dali. Explorar e Salvos
            alimentam o planejamento; Revisão ajuda a conferir o que já foi montado.
          </p>
          <div className="itinerary-hero-actions">
            <Link className="product-secondary-action" href={`/viagens/${tripId}/roteiro/proposta`}>
              {proposalReviewStatus === "expired"
                ? "Ver proposta expirada"
                : proposalReviewStatus
                  ? "Ver proposta"
                  : "Gerar proposta"}
            </Link>
          </div>
        </div>
        <div className="itinerary-summary" aria-label="Resumo do roteiro">
          <strong>{itinerary.days.length}</strong>
          <span>dias</span>
          <strong>{activityCount}</strong>
          <span>{activityCount === 1 ? "atividade" : "atividades"}</span>
          <strong>{freePeriodCount}</strong>
          <span>{freePeriodCount === 1 ? "período livre" : "períodos livres"}</span>
        </div>
      </header>

      <nav aria-label="Jornada de planejamento" className={journeyStyles.journeyNav}>
        <Link className={journeyStyles.journeyStep} href={`/viagens/${tripId}/lugares`}>
          <strong>1. Explorar</strong>
          <small>Descobrir Lugares</small>
        </Link>
        <Link className={journeyStyles.journeyStep} href={`/viagens/${tripId}/lugares-salvos`}>
          <strong>2. Salvos</strong>
          <small>Organizar opções</small>
        </Link>
        <span aria-current="step" className={journeyStyles.journeyCurrent}>
          <strong>3. Roteiro</strong>
          <small>Planejar o Dia</small>
        </span>
        <Link className={journeyStyles.journeyStep} href={`/viagens/${tripId}/roteiro/revisao`}>
          <strong>4. Revisar</strong>
          <small>Conferir conflitos</small>
        </Link>
      </nav>

      <section className={journeyStyles.dayFocus} id="dia-em-foco">
        <div className={journeyStyles.focusHeader}>
          <div>
            <p className="product-eyebrow">Dia em foco</p>
            <div className={journeyStyles.focusTitleLine}>
              <h2>
                Dia {selectedDay.position} — {formatDate(selectedDay.date)}
              </h2>
              {selectedDay.date === todayDate ? (
                <span className={journeyStyles.todayBadge}>Hoje</span>
              ) : null}
            </div>
            <p>{selectedItemCount === 0 ? "Planejamento aberto" : selectedDaySummary}</p>
          </div>
        </div>

        <nav aria-label="Selecionar Dia do roteiro" className={journeyStyles.daySelector}>
          {itinerary.days.map((day) => {
            const isToday = day.date === todayDate;

            return (
              <Link
                aria-current={day.id === selectedDay.id ? "page" : undefined}
                className={
                  day.id === selectedDay.id ? journeyStyles.selectedDay : journeyStyles.dayLink
                }
                href={`/viagens/${tripId}/roteiro?dia=${day.date}#dia-em-foco`}
                key={day.id}
              >
                <span>
                  Dia {day.position}
                  {isToday ? <em className={journeyStyles.todayInline}>Hoje</em> : null}
                </span>
                <small>{formatDayLabel(day.date)}</small>
              </Link>
            );
          })}
        </nav>

        <article className="itinerary-day-card" id={selectedDay.id} tabIndex={-1}>
          <header>
            <span>Seu plano para este Dia</span>
            <h2>{formatDate(selectedDay.date)}</h2>
            <small>{selectedItemCount === 0 ? "Planejamento aberto" : selectedDaySummary}</small>
          </header>

          <FreePeriodList dayId={selectedDay.id} freePeriods={selectedDay.freePeriods} />

          {periods.length === 0 && selectedDay.freePeriods.length === 0 ? (
            <section className={journeyStyles.emptyGuide} aria-labelledby="empty-day-title">
              <p className="product-eyebrow">Próximo passo</p>
              <h3 id="empty-day-title">Escolha um Lugar para começar este Dia</h3>
              <p>
                Explore opções próximas e relevantes ou abra seus Salvos. Nada será adicionado ao
                Roteiro sem uma ação explícita sua.
              </p>
              <div className={journeyStyles.emptyActions}>
                <Link className="product-primary-action" href={`/viagens/${tripId}/lugares`}>
                  Explorar Lugares
                </Link>
                <Link
                  className="product-secondary-action"
                  href={`/viagens/${tripId}/lugares-salvos`}
                >
                  Ver Lugares salvos
                </Link>
              </div>
            </section>
          ) : periods.length > 0 ? (
            <div className="itinerary-periods">
              {periods.map((period) => (
                <section key={period.id} aria-labelledby={`${selectedDay.id}-${period.id}`}>
                  <h3 id={`${selectedDay.id}-${period.id}`}>{period.label}</h3>
                  <ol>
                    {period.activities.map((activity, index) => {
                      const previousActivity = period.activities[index - 1];
                      const nextActivity = period.activities[index + 1];

                      return (
                        <li key={activity.id}>
                          <span className="itinerary-activity-time">
                            {activity.startTime ?? "Livre"}
                          </span>
                          <div className="itinerary-activity-content">
                            <div className="itinerary-activity-copy">
                              <strong>{activity.title}</strong>
                              <small>
                                {activity.durationMinutes
                                  ? formatDuration(activity.durationMinutes)
                                  : "Duração aberta"}
                              </small>
                            </div>
                            <div
                              className={`${journeyStyles.activityActions} itinerary-activity-actions`}
                            >
                              {previousActivity || nextActivity ? (
                                <div
                                  aria-label={`Ordenar ${activity.title}`}
                                  className="itinerary-order-actions"
                                >
                                  {previousActivity ? (
                                    <ReorderActivityForm
                                      activity={activity}
                                      direction="Subir"
                                      targetActivity={previousActivity}
                                      tripId={tripId}
                                    />
                                  ) : null}
                                  {nextActivity ? (
                                    <ReorderActivityForm
                                      activity={activity}
                                      direction="Descer"
                                      targetActivity={nextActivity}
                                      tripId={tripId}
                                    />
                                  ) : null}
                                </div>
                              ) : null}
                              <details className="itinerary-move-disclosure">
                                <summary aria-label={`Mover ${activity.title} para outro dia`}>
                                  Mover
                                </summary>
                                <form
                                  action={moveItineraryActivityAction}
                                  aria-label={`Mover ${activity.title} para outro dia`}
                                  className="itinerary-move-form"
                                >
                                  <input name="tripId" type="hidden" value={tripId} />
                                  <input name="activityId" type="hidden" value={activity.id} />

                                  <div className="form-field">
                                    <label htmlFor={`move-day-${activity.id}`}>
                                      Dia de destino
                                    </label>
                                    <select
                                      defaultValue={targetDays[0]?.date}
                                      id={`move-day-${activity.id}`}
                                      name="targetDayDate"
                                      required
                                    >
                                      {targetDays.map((targetDay) => (
                                        <option key={targetDay.id} value={targetDay.date}>
                                          Dia {targetDay.position} — {formatDate(targetDay.date)}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <button className="product-button" type="submit">
                                    Mover atividade
                                  </button>
                                </form>
                              </details>
                              <details className="itinerary-edit-disclosure">
                                <summary aria-label={`Editar ${activity.title}`}>Editar</summary>
                                <form
                                  action={updateItineraryActivityAction}
                                  aria-label={`Editar ${activity.title}`}
                                  className="itinerary-edit-form"
                                >
                                  <input name="tripId" type="hidden" value={tripId} />
                                  <input name="activityId" type="hidden" value={activity.id} />

                                  <div className="form-field itinerary-edit-title">
                                    <label htmlFor={`edit-title-${activity.id}`}>Título</label>
                                    <input
                                      defaultValue={activity.title}
                                      id={`edit-title-${activity.id}`}
                                      maxLength={180}
                                      name="title"
                                      required
                                    />
                                  </div>

                                  <div className="form-field">
                                    <label htmlFor={`edit-time-${activity.id}`}>
                                      Horário opcional
                                    </label>
                                    <input
                                      defaultValue={activity.startTime ?? ""}
                                      id={`edit-time-${activity.id}`}
                                      name="startTime"
                                      type="time"
                                    />
                                  </div>

                                  <div className="form-field">
                                    <label htmlFor={`edit-duration-${activity.id}`}>
                                      Duração opcional
                                    </label>
                                    <input
                                      defaultValue={activity.durationMinutes ?? ""}
                                      id={`edit-duration-${activity.id}`}
                                      min={1}
                                      name="durationMinutes"
                                      step={1}
                                      type="number"
                                    />
                                  </div>

                                  <button className="product-button" type="submit">
                                    Salvar alterações
                                  </button>
                                </form>
                              </details>
                              <form action={removeItineraryActivityAction}>
                                <input name="tripId" type="hidden" value={tripId} />
                                <input name="activityId" type="hidden" value={activity.id} />
                                <button
                                  aria-label={`Remover ${activity.title} do roteiro`}
                                  className="itinerary-danger-action"
                                  type="submit"
                                >
                                  Remover
                                </button>
                              </form>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      <Suspense fallback={<p aria-live="polite">Carregando contexto geográfico do Dia…</p>}>
        <ItinerarySpatialPanel days={spatialDays} showDaySelector={false} tripId={tripId} />
      </Suspense>

      <section className={journeyStyles.secondaryPlanning} aria-label="Outras formas de planejar">
        <p className="product-eyebrow">Outras formas de planejar este Dia</p>
        <details className={journeyStyles.secondaryDisclosure}>
          <summary>Adicionar atividade manual</summary>
          <section className="itinerary-composer" aria-labelledby="new-activity-title">
            <div>
              <h2 id="new-activity-title">Adicione uma decisão manual</h2>
              <p>
                Use quando a atividade não vier de um Lugar salvo. Ela será adicionada ao Dia em
                foco; horário e duração continuam opcionais.
              </p>
            </div>

            <form className="trip-form itinerary-form" action={addManualActivityAction}>
              <input name="tripId" type="hidden" value={tripId} />
              <input name="dayDate" type="hidden" value={selectedDay.date} />

              <div className="form-field form-field-wide">
                <label htmlFor="title">Título</label>
                <input
                  id="title"
                  maxLength={180}
                  name="title"
                  placeholder="Ex.: Caminhada na Praia do Amor"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="startTime">Horário opcional</label>
                <input id="startTime" name="startTime" type="time" />
              </div>

              <div className="form-field">
                <label htmlFor="durationMinutes">Duração opcional</label>
                <input
                  id="durationMinutes"
                  min={1}
                  name="durationMinutes"
                  placeholder="Minutos"
                  step={1}
                  type="number"
                />
              </div>

              <div className="form-actions">
                <p>
                  Dia {selectedDay.position} — {formatDate(selectedDay.date)}
                </p>
                <button className="product-button" type="submit">
                  Adicionar ao roteiro
                </button>
              </div>
            </form>
          </section>
        </details>

        <details className={journeyStyles.secondaryDisclosure}>
          <summary>Adicionar período livre</summary>
          <FreePeriodComposer
            itinerary={itinerary}
            selectedDayDate={selectedDay.date}
            tripId={tripId}
          />
        </details>
      </section>
    </section>
  );
}
