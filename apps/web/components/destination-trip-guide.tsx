import Link from "next/link";

import type { Itinerary, TripDay } from "@routebook/trip-management";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function DestinationTripGuide({
  mode,
  tripId,
  destinationName,
  days,
  selectedDate,
  todayDate,
  itinerary,
  savedPlaceCount,
}: Readonly<{
  mode: "today" | "days";
  tripId: string;
  destinationName: string;
  days: readonly TripDay[];
  selectedDate?: string;
  todayDate?: string;
  itinerary: Itinerary | null;
  savedPlaceCount: number;
}>) {
  const selectedDay = itinerary?.days.find((day) => day.date === selectedDate);
  const selectedTripDay = days.find((day) => day.date === selectedDate);

  if (mode === "days") {
    return (
      <section className="traveler-context-summary" aria-labelledby="destination-guide-title">
        <p className="product-eyebrow">Guia por dia</p>
        <h1 id="destination-guide-title">Guia da viagem em {destinationName}</h1>
        <p>
          O guia reúne somente decisões já registradas. Descobertas e lugares salvos continuam
          disponíveis para completar cada Dia sem inventar paradas.
        </p>
        <ol className="trip-days-grid">
          {days.map((day) => {
            const itineraryDay = itinerary?.days.find((candidate) => candidate.date === day.date);
            const activityCount = itineraryDay?.activities.length ?? 0;
            return (
              <li key={day.date}>
                <span>Dia {day.index}</span>
                <strong>{formatDate(day.date)}</strong>
                <small>
                  {activityCount === 0
                    ? "Nenhuma atividade confirmada"
                    : `${activityCount} ${activityCount === 1 ? "atividade confirmada" : "atividades confirmadas"}`}
                </small>
                <Link href={`/viagens/${tripId}/roteiro?dia=${day.date}`}>
                  Abrir Dia no Roteiro
                </Link>
              </li>
            );
          })}
        </ol>
        <div className="section-heading-row">
          <Link className="product-primary-action" href={`/viagens/${tripId}/lugares`}>
            Explorar Lugares
          </Link>
          <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares-salvos`}>
            Ver {savedPlaceCount} {savedPlaceCount === 1 ? "lugar salvo" : "lugares salvos"}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="traveler-context-summary" aria-labelledby="destination-today-title">
      <p className="product-eyebrow">Hoje em {destinationName}</p>
      <h1 id="destination-today-title">
        {selectedTripDay
          ? `Dia ${selectedTripDay.index} — ${formatDate(selectedTripDay.date)}`
          : "Dia em foco"}
      </h1>
      {selectedDate && selectedDate === todayDate ? <p>Este é o Dia atual da viagem.</p> : null}
      {selectedDay && selectedDay.activities.length > 0 ? (
        <>
          <p>Atividades confirmadas no seu Roteiro:</p>
          <ul>
            {selectedDay.activities.map((activity) => (
              <li key={activity.id}>
                <strong>{activity.title}</strong>
                {activity.startTime ? ` · ${activity.startTime}` : " · horário ainda não definido"}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>
          Ainda não há atividades confirmadas para este Dia. O RouteBook preserva o espaço vazio até
          você escolher entre os candidatos descobertos ou os {savedPlaceCount} lugares salvos.
        </p>
      )}
      <div className="section-heading-row">
        <Link
          className="product-primary-action"
          href={`/viagens/${tripId}/roteiro${selectedDate ? `?dia=${selectedDate}` : ""}`}
        >
          Abrir Roteiro
        </Link>
        <Link className="product-secondary-action" href={`/viagens/${tripId}/lugares`}>
          Explorar Lugares
        </Link>
      </div>
    </section>
  );
}
