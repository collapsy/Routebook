import Link from "next/link";

import type { PipaDayGuideStop, PipaTripGuide, PipaTripGuideDay } from "../lib/pipa-day-guide";
import type { TripMapPoint } from "../lib/trip-map";
import { PlacePrimaryImage } from "./place-primary-image";
import { TripMap } from "./trip-map";

import styles from "./trip-day-guide.module.css";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${value}T00:00:00Z`));
}

function StopCard({ stop }: { stop: PipaDayGuideStop }) {
  return (
    <li className={styles.stopCard}>
      <div className={styles.imageWrap}>
        <PlacePrimaryImage
          category={stop.place.category}
          placeName={stop.place.name}
          primaryImage={stop.place.primaryImage}
        />
        <span className={styles.sequence} aria-label={`Parada ${stop.sequence}`}>
          {stop.sequence}
        </span>
      </div>

      <div className={styles.stopBody}>
        <div className={styles.stopHeading}>
          <div>
            <span className={styles.period}>{stop.periodLabel}</span>
            <h3>{stop.place.name}</h3>
          </div>
          <time dateTime={stop.suggestedTime}>{stop.suggestedTime}</time>
        </div>

        <p>{stop.reason}</p>

        <dl className={styles.stopFacts}>
          <div>
            <dt>Tempo sugerido</dt>
            <dd>{stop.practicalGuide.suggestedDuration}</dd>
          </div>
          <div>
            <dt>Melhor encaixe</dt>
            <dd>{stop.practicalGuide.bestWindow}</dd>
          </div>
          <div>
            <dt>Partindo da hospedagem</dt>
            <dd>{stop.distanceFromAccommodationLabel ?? "Hospedagem sem coordenadas"}</dd>
          </div>
        </dl>

        <p className={styles.check}>
          <strong>Confira antes:</strong> {stop.practicalGuide.checks[0]}
        </p>

        <div className={styles.actions}>
          <Link className="product-secondary-action" href={stop.detailsHref}>
            Ver guia do lugar
          </Link>
          <Link className="product-secondary-action" href={stop.planHref}>
            Planejar neste Dia
          </Link>
          {stop.routeHref ? (
            <a
              className="product-secondary-action"
              href={stop.routeHref}
              rel="noreferrer"
              target="_blank"
            >
              Rota e tempo no Maps
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function GuideDay({
  day,
  accommodationPoint,
  initiallyOpen,
  isToday,
}: {
  day: PipaTripGuideDay;
  accommodationPoint?: TripMapPoint;
  initiallyOpen: boolean;
  isToday: boolean;
}) {
  const mapPoints: TripMapPoint[] = [
    ...(accommodationPoint ? [accommodationPoint] : []),
    ...day.stops.map((stop) => ({
      id: `guide-day-${day.index}-stop-${stop.place.id}`,
      label: stop.place.name,
      kind: "published-place" as const,
      latitude: stop.place.latitude,
      longitude: stop.place.longitude,
      href: stop.detailsHref,
      sequence: stop.sequence,
    })),
  ];

  return (
    <details className={styles.day} id={`guia-dia-${day.index}`} open={initiallyOpen}>
      <summary className={styles.daySummary}>
        <span>
          Dia {day.index} · {formatDate(day.date)}
          {isToday ? <em className={styles.todayBadge}>Hoje</em> : null}
        </span>
        <strong>{day.title}</strong>
        <small>{day.stops.length} paradas sugeridas</small>
      </summary>

      <div className={styles.dayBody}>
        <p className={styles.dayDescription}>{day.summary}</p>

        <div className={styles.layout}>
          <ol className={styles.stops} aria-label={`Paradas sugeridas para o Dia ${day.index}`}>
            {day.stops.map((stop) => (
              <StopCard key={stop.place.id} stop={stop} />
            ))}
          </ol>

          <aside className={styles.mapColumn}>
            <TripMap
              description="Os números do mapa seguem exatamente a ordem dos cards deste Dia. A linha entre pontos não representa uma rota calculada."
              points={mapPoints}
              title={`Mapa do Dia ${day.index} — ${formatDate(day.date)}`}
            />
            {day.itineraryHref ? (
              <a
                className="product-button"
                href={day.itineraryHref}
                rel="noreferrer"
                target="_blank"
              >
                Abrir sequência do Dia no Google Maps
              </a>
            ) : (
              <p className={styles.missingRoute}>
                Informe uma hospedagem com localização para abrir a sequência do Dia e comparar
                deslocamentos reais.
              </p>
            )}
          </aside>
        </div>

        {day.note ? (
          <aside className={styles.alternative} aria-label={`Observação do Dia ${day.index}`}>
            <strong>Ajuste sem culpa</strong>
            <p>{day.note}</p>
          </aside>
        ) : null}
      </div>
    </details>
  );
}

export function TripDayGuide({
  guide,
  accommodationPoint,
  todayDate,
  selectedDate,
}: {
  guide: PipaTripGuide;
  accommodationPoint?: TripMapPoint;
  todayDate?: string | null;
  selectedDate?: string | null;
}) {
  return (
    <section className={styles.guide} aria-labelledby="trip-guide-title">
      <header className={styles.hero}>
        <div>
          <p className="product-eyebrow">Guia da viagem · sugestão editorial</p>
          <h1 id="trip-guide-title">Guia da viagem em Pipa</h1>
          <p>
            Use estes Dias como ponto de partida para decidir o que faz sentido para o grupo. Nada
            aqui altera o Roteiro até você escolher explicitamente uma ação de planejamento.
          </p>
        </div>
        <div className={styles.heroMeta} aria-label="Resumo do guia">
          <span>{guide.days.length} Dias cobertos</span>
          <span>2–3 paradas por Dia</span>
          {todayDate ? <span>Hoje em destaque</span> : null}
        </div>
      </header>

      <div className={styles.disclosure} role="note">
        <strong>Editorial, não aplicado:</strong> ordem, horários e duração são orientação.
        Distâncias nos cards são apenas em linha reta; Google Maps calcula rota e tempo atuais
        quando você abre um link. Confirme maré, clima, funcionamento, preços e programação antes de
        sair.
      </div>

      {guide.coverageLimited ? (
        <p className={styles.coverageNote} role="note">
          Este piloto cobre os primeiros 8 Dias da Viagem. Os demais Dias continuam disponíveis no
          Roteiro sem sugestão editorial automática.
        </p>
      ) : null}

      <nav className={styles.dayNav} aria-label="Dias do Guia da viagem">
        <ol>
          {guide.days.map((day) => {
            const isToday = day.date === todayDate;

            return (
              <li key={day.date}>
                <a
                  aria-current={day.date === selectedDate ? "page" : isToday ? "date" : undefined}
                  className={day.date === selectedDate || isToday ? styles.todayDayLink : undefined}
                  href={`#guia-dia-${day.index}`}
                >
                  <span>
                    Dia {day.index}
                    {isToday ? <em className={styles.todayBadge}>Hoje</em> : null}
                  </span>
                  <strong>{day.title}</strong>
                  <small>{formatDate(day.date)}</small>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className={styles.days}>
        {guide.days.map((day, index) => {
          const isToday = day.date === todayDate;

          return (
            <GuideDay
              key={day.date}
              {...(accommodationPoint ? { accommodationPoint } : {})}
              day={day}
              initiallyOpen={
                selectedDate ? day.date === selectedDate : todayDate ? isToday : index === 0
              }
              isToday={isToday}
            />
          );
        })}
      </div>
    </section>
  );
}
