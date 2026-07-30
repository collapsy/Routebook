"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { TripMap } from "../../../../components/trip-map";
import type { ItineraryDaySpatialContext } from "../../../../lib/itinerary-spatial-context";
import type { TripMapPoint } from "../../../../lib/trip-map";

import styles from "./itinerary-spatial-panel.module.css";

type SpatialDay = {
  date: string;
  position: number;
  label: string;
  context: ItineraryDaySpatialContext;
};

const unavailableLabels = {
  "manual-activity": "Atividade manual sem Lugar associado.",
  "place-not-found": "O Lugar vinculado não está disponível no catálogo publicado.",
  "coordinates-unavailable": "O Lugar vinculado não possui coordenadas válidas.",
} as const;

function buildMapPoints(tripId: string, context: ItineraryDaySpatialContext): TripMapPoint[] {
  const points: TripMapPoint[] = [];

  if (context.accommodation.status === "available") {
    const { point } = context.accommodation;
    points.push({
      id: point.id,
      label: point.label,
      kind: "accommodation",
      latitude: point.coordinate.latitude,
      longitude: point.coordinate.longitude,
    });
  }

  for (const step of context.activitySteps) {
    if (step.status !== "available") continue;
    points.push({
      id: step.point.id,
      label: step.point.label,
      kind: "itinerary-activity",
      latitude: step.point.coordinate.latitude,
      longitude: step.point.coordinate.longitude,
      sequence: step.order,
      ...(step.point.placeSlug
        ? { href: `/viagens/${tripId}/lugares/${step.point.placeSlug}` }
        : {}),
    });
  }

  return points;
}

export function ItinerarySpatialPanel({
  tripId,
  days,
}: {
  tripId: string;
  days: readonly SpatialDay[];
}) {
  const selectedDate = useSearchParams().get("dia");
  const selectedDay = days.find((day) => day.date === selectedDate) ?? days[0]!;
  const context = selectedDay.context;
  const points = buildMapPoints(tripId, context);
  const unavailable = context.activitySteps.filter((step) => step.status === "unavailable");

  return (
    <section
      aria-labelledby="itinerary-spatial-title"
      className={styles.panel}
      id="contexto-geografico"
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>Visualização geográfica do Dia</p>
        <h2 id="itinerary-spatial-title">Onde estão as decisões do Roteiro</h2>
        <p>
          Selecione um Dia para relacionar a sequência das Atividades com a Hospedagem. Nenhuma
          localização ausente é inferida.
        </p>
      </header>

      <nav aria-label="Selecionar Dia para o mapa" className={styles.daySelector}>
        {days.map((day) => (
          <Link
            aria-current={day.date === selectedDay.date ? "page" : undefined}
            className={day.date === selectedDay.date ? styles.selectedDay : styles.dayLink}
            href={`/viagens/${tripId}/roteiro?dia=${day.date}#contexto-geografico`}
            key={day.date}
          >
            <span>Dia {day.position}</span>
            <small>{day.label}</small>
          </Link>
        ))}
      </nav>

      <TripMap
        description="A Hospedagem possui símbolo próprio. As Atividades são numeradas conforme a ordem canônica do Dia."
        emptyDescription="Este Dia não possui Hospedagem ou Atividades com coordenadas válidas. O Roteiro textual permanece disponível."
        emptyTitle="Mapa do Dia indisponível"
        points={points}
        title={`Mapa do Dia ${selectedDay.position}`}
      />

      <section aria-labelledby="spatial-list-title" className={styles.textualContext}>
        <div className={styles.contextHeading}>
          <div>
            <p className={styles.eyebrow}>Alternativa textual ao mapa</p>
            <h3 id="spatial-list-title">Sequência do Dia {selectedDay.position}</h3>
          </div>
          <p>
            {context.accommodation.status === "available"
              ? "Hospedagem localizada."
              : "Hospedagem sem coordenadas disponíveis."}
          </p>
        </div>

        {unavailable.length > 0 ? (
          <p className={styles.notice} role="status">
            {unavailable.length}{" "}
            {unavailable.length === 1 ? "Atividade não pôde" : "Atividades não puderam"} ser
            localizada.
          </p>
        ) : null}

        {context.activitySteps.length === 0 ? (
          <p className={styles.emptyDay}>Nenhuma Atividade planejada para este Dia.</p>
        ) : (
          <ol
            aria-label={`Atividades do Dia ${selectedDay.position}`}
            className={styles.activityList}
          >
            {context.activitySteps.map((step) => (
              <li
                className={step.status === "available" ? styles.available : styles.unavailable}
                key={step.activityId}
              >
                <span className={styles.sequence}>{step.order}</span>
                <div>
                  <strong>{step.title}</strong>
                  <span>
                    {step.status === "available"
                      ? "Localização disponível no mapa."
                      : unavailableLabels[step.reason]}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
