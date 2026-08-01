import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DrizzleItineraryProposalRepository,
  DrizzleItineraryRepository,
  DrizzleTripRepository,
} from "@routebook/database";
import {
  createItinerary,
  findTripById,
  type Activity,
  type Itinerary,
  type Trip,
} from "@routebook/trip-management";

import {
  addManualActivityAction,
  moveItineraryActivityAction,
  removeItineraryActivityAction,
  reorderItineraryActivitiesAction,
  updateItineraryActivityAction,
} from "./actions";
import { FreePeriodComposer, FreePeriodList } from "./free-periods";
import { hasReadyItineraryProposal } from "../../../../lib/itinerary-proposal-experience";

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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
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
    atividadeCriada?: string;
    atividadeEditada?: string;
    atividadeMovida?: string;
    atividadeRemovida?: string;
    atividadeReordenada?: string;
    periodoLivreCriado?: string;
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
  const hasReadyProposal = hasReadyItineraryProposal(proposals);
  const {
    atividadeCriada,
    atividadeEditada,
    atividadeMovida,
    atividadeRemovida,
    atividadeReordenada,
    periodoLivreCriado,
    erro,
  } = await searchParams;
  const activityCount = itinerary.days.reduce((total, day) => total + day.activities.length, 0);
  const freePeriodCount = itinerary.days.reduce((total, day) => total + day.freePeriods.length, 0);

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
      {erro ? (
        <p className="form-error itinerary-feedback" role="alert">
          {erro}
        </p>
      ) : null}

      <header className="itinerary-hero">
        <div>
          <p className="product-eyebrow">Roteiro manual</p>
          <h1>{trip.name}</h1>
          <div className="itinerary-hero-actions">
            {hasReadyProposal ? (
              <Link
                className="product-secondary-action"
                href={`/viagens/${tripId}/roteiro/proposta`}
              >
                Ver proposta
              </Link>
            ) : null}
            <Link className="product-secondary-action" href={`/viagens/${tripId}/roteiro/revisao`}>
              Revisar conflitos
            </Link>
          </div>
          <p>
            Organize decisões confirmadas e espaços livres por dia. Horários e durações continuam
            opcionais para que o roteiro possa evoluir sem criar rigidez artificial.
          </p>
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

      <section className="itinerary-composer" aria-labelledby="new-activity-title">
        <div>
          <p className="product-eyebrow">Nova atividade</p>
          <h2 id="new-activity-title">Adicione uma decisão ao roteiro</h2>
          <p>
            Comece apenas com um título e um dia. Complete horário e duração quando forem úteis.
          </p>
        </div>

        <form className="trip-form itinerary-form" action={addManualActivityAction}>
          <input name="tripId" type="hidden" value={tripId} />

          <div className="form-field">
            <label htmlFor="dayDate">Dia da viagem</label>
            <select defaultValue={itinerary.days[0]?.date} id="dayDate" name="dayDate" required>
              {itinerary.days.map((day) => (
                <option key={day.id} value={day.date}>
                  Dia {day.position} — {formatDate(day.date)}
                </option>
              ))}
            </select>
          </div>

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
            <p>A atividade será incluída no fim do período correspondente.</p>
            <button className="product-button" type="submit">
              Adicionar ao roteiro
            </button>
          </div>
        </form>
      </section>

      <FreePeriodComposer itinerary={itinerary} tripId={tripId} />

      <ol className="itinerary-days" aria-label="Dias do roteiro">
        {itinerary.days.map((day) => {
          const periods = groupByPeriod(day.activities);
          const targetDays = itinerary.days.filter((targetDay) => targetDay.id !== day.id);
          const itemCount = day.activities.length + day.freePeriods.length;
          const daySummary = formatDaySummary(day.activities.length, day.freePeriods.length);

          return (
            <li className="itinerary-day-card" id={day.id} key={day.id} tabIndex={-1}>
              <header>
                <span>Dia {day.position}</span>
                <h2>{formatDate(day.date)}</h2>
                <small>{itemCount === 0 ? "Planejamento aberto" : daySummary}</small>
              </header>

              <FreePeriodList dayId={day.id} freePeriods={day.freePeriods} />

              {periods.length === 0 && day.freePeriods.length === 0 ? (
                <p className="itinerary-empty-day">
                  Nenhuma atividade ou período livre planejado. Este dia continua aberto para novas
                  decisões.
                </p>
              ) : periods.length > 0 ? (
                <div className="itinerary-periods">
                  {periods.map((period) => (
                    <section key={period.id} aria-labelledby={`${day.id}-${period.id}`}>
                      <h3 id={`${day.id}-${period.id}`}>{period.label}</h3>
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
                                <div className="itinerary-activity-actions">
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
                                              Dia {targetDay.position} —{" "}
                                              {formatDate(targetDay.date)}
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
                                    <summary aria-label={`Editar ${activity.title}`}>
                                      Editar
                                    </summary>
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
            </li>
          );
        })}
      </ol>
    </section>
  );
}
