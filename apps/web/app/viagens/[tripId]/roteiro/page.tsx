import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DrizzleItineraryRepository, DrizzleTripRepository } from "@routebook/database";
import {
  createItinerary,
  findTripById,
  type Activity,
  type Itinerary,
  type Trip,
} from "@routebook/trip-management";

import { addManualActivityAction, removeItineraryActivityAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Roteiro da viagem — RouteBook",
  description: "Organize atividades manuais por dia e período da viagem.",
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

export default async function ItineraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ atividadeCriada?: string; atividadeRemovida?: string; erro?: string }>;
}) {
  const { tripId } = await params;
  const trip = await findTripById(new DrizzleTripRepository(), tripId);
  if (!trip) notFound();

  const itinerary = await loadOrCreateItinerary(trip);
  const { atividadeCriada, atividadeRemovida, erro } = await searchParams;
  const activityCount = itinerary.days.reduce((total, day) => total + day.activities.length, 0);

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
      {atividadeRemovida === "1" ? (
        <p className="success-banner" role="status">
          Atividade removida do roteiro.
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
          <p>
            Organize decisões confirmadas por dia. Horários e durações continuam opcionais para que
            o roteiro possa evoluir sem criar rigidez artificial.
          </p>
        </div>
        <div className="itinerary-summary" aria-label="Resumo do roteiro">
          <strong>{itinerary.days.length}</strong>
          <span>dias</span>
          <strong>{activityCount}</strong>
          <span>{activityCount === 1 ? "atividade" : "atividades"}</span>
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

      <ol className="itinerary-days" aria-label="Dias do roteiro">
        {itinerary.days.map((day) => {
          const periods = groupByPeriod(day.activities);

          return (
            <li className="itinerary-day-card" key={day.id}>
              <header>
                <span>Dia {day.position}</span>
                <h2>{formatDate(day.date)}</h2>
                <small>
                  {day.activities.length === 0
                    ? "Planejamento aberto"
                    : `${day.activities.length} ${day.activities.length === 1 ? "atividade" : "atividades"}`}
                </small>
              </header>

              {periods.length === 0 ? (
                <p className="itinerary-empty-day">
                  Nenhuma atividade planejada. Este dia continua livre para novas decisões.
                </p>
              ) : (
                <div className="itinerary-periods">
                  {periods.map((period) => (
                    <section key={period.id} aria-labelledby={`${day.id}-${period.id}`}>
                      <h3 id={`${day.id}-${period.id}`}>{period.label}</h3>
                      <ol>
                        {period.activities.map((activity) => (
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
                              <form
                                action={removeItineraryActivityAction}
                                className="itinerary-activity-actions"
                              >
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
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
