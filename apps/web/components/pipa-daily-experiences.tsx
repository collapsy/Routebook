import Link from "next/link";

import type { PipaDailyExperience } from "../lib/pipa-daily-experiences";
import type { TripMapPoint } from "../lib/trip-map";
import { TripMap } from "./trip-map";

import styles from "./pipa-daily-experiences.module.css";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${value}T00:00:00Z`));
}

function sourceCollectedAt(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function PipaDailyExperiences({
  tripId,
  experience,
  availableDates,
  todayDate,
}: {
  tripId: string;
  experience: PipaDailyExperience;
  availableDates: readonly string[];
  todayDate?: string | null;
}) {
  const mapPointsById = new Map<string, TripMapPoint>();
  for (const observation of experience.skyObservations) {
    for (const recommendation of observation.places) {
      mapPointsById.set(recommendation.place.id, {
        id: `daily-experience-${recommendation.place.id}`,
        label: recommendation.place.name,
        kind: "published-place",
        latitude: recommendation.place.latitude,
        longitude: recommendation.place.longitude,
        href: recommendation.detailsHref,
      });
    }
  }
  for (const event of experience.confirmedEvents) {
    mapPointsById.set(event.place.id, {
      id: `daily-experience-${event.place.id}`,
      label: event.place.name,
      kind: "published-place",
      latitude: event.place.latitude,
      longitude: event.place.longitude,
      href: event.detailsHref,
    });
  }

  const isToday = experience.date === todayDate;

  return (
    <section
      className={styles.panel}
      id="experiencias-do-dia"
      aria-labelledby="daily-experiences-title"
    >
      <header className={styles.hero}>
        <div>
          <p className="product-eyebrow">{isToday ? "Hoje em Pipa" : "Experiências do Dia"}</p>
          <h2 id="daily-experiences-title">O que vale encaixar em {formatDate(experience.date)}</h2>
          <p>
            Sol e Lua são recomendações espaciais. Rolês só aparecem aqui quando existe programação
            confirmada para a data e vínculo seguro com um Lugar do RouteBook.
          </p>
        </div>
        <span className={styles.dateBadge}>{isToday ? "Hoje" : formatDate(experience.date)}</span>
      </header>

      <nav className={styles.dateNav} aria-label="Datas das experiências do Guia">
        {availableDates.map((date) => (
          <Link
            aria-current={date === experience.date ? "date" : undefined}
            className={date === experience.date ? styles.activeDate : undefined}
            href={`/viagens/${tripId}/guia?dia=${date}#experiencias-do-dia`}
            key={date}
          >
            {new Intl.DateTimeFormat("pt-BR", {
              timeZone: "UTC",
              weekday: "short",
              day: "2-digit",
            }).format(new Date(`${date}T00:00:00Z`))}
          </Link>
        ))}
      </nav>

      <div className={styles.sectionHeading}>
        <div>
          <p className="product-eyebrow">Céu e horizonte</p>
          <h3>Onde ver o Sol e a Lua</h3>
        </div>
        <small>Horários e azimutes específicos para Pipa</small>
      </div>

      {experience.hasAstronomyCoverage ? (
        <div className={styles.observationGrid}>
          {experience.skyObservations.map((observation) => (
            <article className={styles.observationCard} key={observation.id}>
              <div className={styles.observationTitle}>
                <div>
                  <span>
                    {observation.id === "sunset"
                      ? "🌅"
                      : observation.id === "moonrise"
                        ? "🌕"
                        : "🌄"}
                  </span>
                  <h4>{observation.title}</h4>
                </div>
                <time dateTime={observation.time}>{observation.time}</time>
              </div>
              <p>{observation.description}</p>
              <dl className={styles.facts}>
                <div>
                  <dt>Direção</dt>
                  <dd>
                    {observation.directionLabel} · {observation.azimuthDegrees}°
                  </dd>
                </div>
                {observation.moonIlluminationPercent !== undefined ? (
                  <div>
                    <dt>Lua iluminada</dt>
                    <dd>{observation.moonIlluminationPercent}%</dd>
                  </div>
                ) : null}
              </dl>
              <ul className={styles.placeList}>
                {observation.places.map((recommendation) => (
                  <li key={recommendation.place.id}>
                    <div>
                      <strong>{recommendation.place.name}</strong>
                      <small>
                        {recommendation.confidence === "curated"
                          ? "Ponto curado"
                          : "Adequação inferida pela geografia"}
                      </small>
                    </div>
                    <p>{recommendation.reason}</p>
                    {recommendation.distanceFromAccommodationLabel ? (
                      <small>{recommendation.distanceFromAccommodationLabel} da hospedagem</small>
                    ) : null}
                    <div className={styles.actions}>
                      <Link className="product-secondary-action" href={recommendation.detailsHref}>
                        Ver lugar
                      </Link>
                      <Link className="product-primary-action" href={recommendation.planHref}>
                        Planejar neste Dia
                      </Link>
                      {recommendation.routeHref ? (
                        <a
                          className="product-secondary-action"
                          href={recommendation.routeHref}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Calcular rota
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
              <small className={styles.sourceLine}>
                Fonte astronômica:{" "}
                <a href={observation.source.url} rel="noreferrer" target="_blank">
                  {observation.source.label}
                </a>{" "}
                · coletado em {sourceCollectedAt(observation.source.collectedAt)}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>
          Ainda não há horário astronômico governado para esta data. O RouteBook não inventa uma
          janela de observação.
        </p>
      )}

      <div className={styles.sectionHeading}>
        <div>
          <p className="product-eyebrow">Agenda verificada</p>
          <h3>Rolês confirmados</h3>
        </div>
        <small>Luau só entra aqui quando houver evento confirmado</small>
      </div>

      {experience.confirmedEvents.length > 0 ? (
        <div className={styles.eventGrid}>
          {experience.confirmedEvents.map((event) => (
            <article className={styles.eventCard} key={event.id}>
              <div className={styles.eventTopline}>
                <span className={styles.confirmedBadge}>Confirmado</span>
                <time dateTime={event.startTime}>
                  {event.startTime}–{event.endTime}
                </time>
              </div>
              <h4>{event.title}</h4>
              <p>{event.summary}</p>
              <strong>{event.place.name}</strong>
              <small>Line-up: {event.lineup}</small>
              <div className={styles.tags}>
                {event.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
                <span>{event.minimumAge}+</span>
              </div>
              {event.distanceFromAccommodationLabel ? (
                <small>{event.distanceFromAccommodationLabel} da hospedagem</small>
              ) : null}
              <div className={styles.actions}>
                <a
                  className="product-secondary-action"
                  href={event.source.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Ver fonte / ingresso
                </a>
                <Link className="product-primary-action" href={event.planHref}>
                  Adicionar ao Roteiro
                </Link>
                {event.routeHref ? (
                  <a
                    className="product-secondary-action"
                    href={event.routeHref}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Calcular rota
                  </a>
                ) : null}
              </div>
              <small className={styles.sourceLine}>
                Fonte: {event.source.label} · coletado em{" "}
                {sourceCollectedAt(event.source.collectedAt)}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>
          Nenhum rolê foi confirmado nas fontes governadas para esta data. Lugares abertos podem
          continuar aparecendo em Vida noturna, mas não são apresentados aqui como evento.
        </p>
      )}

      {mapPointsById.size > 0 ? (
        <div className={styles.mapWrap}>
          <TripMap
            description="Mapa dos pontos sugeridos para observação natural e dos locais com evento confirmado nesta data."
            points={[...mapPointsById.values()]}
            title={`Mapa das experiências de ${formatDate(experience.date)}`}
          />
        </div>
      ) : null}

      <p className={styles.disclaimer} role="note">
        Condição do céu, acesso ao horizonte e operação dos locais podem mudar. Este Preview ainda
        não integra previsão de nuvens em tempo real; confirme as condições antes de sair.
      </p>
    </section>
  );
}
