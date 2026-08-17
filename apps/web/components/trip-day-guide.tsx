import Link from "next/link";

import type { PipaDayGuideStop, PipaTripGuideDay } from "../lib/pipa-day-guide";
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
            Adicionar ao roteiro
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

export function TripDayGuide({
  guide,
  accommodationPoint,
  showDisclosure = true,
}: {
  guide: PipaTripGuideDay;
  accommodationPoint?: TripMapPoint;
  showDisclosure?: boolean;
}) {
  const titleId = `trip-guide-day-${guide.index}-title`;
  const mapPoints: TripMapPoint[] = [
    ...(accommodationPoint ? [accommodationPoint] : []),
    ...guide.stops.map((stop) => ({
      id: `guide-day-${guide.index}-stop-${stop.place.id}`,
      label: stop.place.name,
      kind: "itinerary-activity" as const,
      latitude: stop.place.latitude,
      longitude: stop.place.longitude,
      href: stop.detailsHref,
      sequence: stop.sequence,
    })),
  ];

  return (
    <section className={styles.guide} aria-labelledby={titleId} id={`dia-${guide.index}`}>
      <header className={styles.hero}>
        <div>
          <p className="product-eyebrow">
            Dia {guide.index} · {guide.theme}
          </p>
          <h2 id={titleId}>
            {formatDate(guide.date)} — {guide.title}
          </h2>
          <p>{guide.summary}</p>
        </div>
        <div className={styles.heroMeta} aria-label={`Resumo do Dia ${guide.index}`}>
          <span>{guide.stops.length} paradas</span>
          <span>{guide.stops.map((stop) => stop.periodLabel).join(" · ")}</span>
        </div>
      </header>

      {showDisclosure ? (
        <div className={styles.disclosure} role="note">
          <strong>Guia editorial, não Roteiro aplicado:</strong> horários, duração e ordem são uma
          orientação. Nada é salvo ou adicionado por leitura. O Google Maps calcula rota e tempo
          atuais quando você abre o link; a distância exibida no card é apenas linha reta.
        </div>
      ) : null}

      <div className={styles.layout}>
        <ol className={styles.stops} aria-label={`Paradas sugeridas para o Dia ${guide.index}`}>
          {guide.stops.map((stop) => (
            <StopCard key={stop.place.id} stop={stop} />
          ))}
        </ol>

        <aside className={styles.mapColumn}>
          <TripMap
            description="Os números do mapa seguem a mesma ordem dos cards. A linha entre os pontos não representa uma rota calculada."
            points={mapPoints}
            title={`Mapa do Dia ${guide.index} — ${formatDate(guide.date)}`}
          />
          {guide.itineraryHref ? (
            <a
              className="product-button"
              href={guide.itineraryHref}
              rel="noreferrer"
              target="_blank"
            >
              Abrir sequência do dia no Google Maps
            </a>
          ) : (
            <p className={styles.missingRoute}>
              Informe uma hospedagem com localização para abrir a sequência completa e comparar
              deslocamentos reais.
            </p>
          )}
        </aside>
      </div>

      {guide.alternative ? (
        <aside className={styles.alternative} aria-label={`Alternativa para o Dia ${guide.index}`}>
          <strong>Plano mais leve</strong>
          <p>{guide.alternative}</p>
        </aside>
      ) : null}
    </section>
  );
}
