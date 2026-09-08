import type { PlaceQualityScore, PlaceQualitySignals } from "@routebook/place-catalog";

import styles from "./place-ranking-meta.module.css";

function providerLabel(provider: string): string {
  switch (provider) {
    case "google-places":
      return "Google Places";
    case "foursquare-places":
      return "Foursquare Places";
    default:
      return provider;
  }
}

function formatDecimal(value: number, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits }).format(value);
}

function formatCollectedAt(value: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone,
  }).format(value);
}

export function PlaceRankingMeta({
  position,
  orderLabel,
  quality,
  signals,
  categoryRank,
  categoryLabel,
  timeZone,
}: Readonly<{
  position: number;
  orderLabel: string;
  quality?: PlaceQualityScore;
  signals?: PlaceQualitySignals;
  categoryRank?: number;
  categoryLabel: string;
  timeZone: string;
}>) {
  if (!quality && !signals) return null;

  const popularityPercent =
    signals?.popularity &&
    Math.round((signals.popularity.value / signals.popularity.scaleMax) * 100);

  return (
    <section
      aria-label="Evidência do ranking"
      className={styles.meta}
      data-place-ranking-position={position}
      data-place-ranking-quality={quality ? "true" : "false"}
    >
      {quality || signals.rating ? (
        <div className={styles.summary}>
          {quality ? (
            <strong className={styles.score}>Score {formatDecimal(quality.score)}/10</strong>
          ) : null}
          {signals.rating ? (
            <span className={styles.rating}>
              Nota {formatDecimal(signals.rating.value)}/{formatDecimal(signals.rating.scaleMax, 0)}
            </span>
          ) : null}
          {quality && categoryRank === 1 ? (
            <strong className={styles.topBadge}>
              Top {categoryLabel.toLocaleLowerCase("pt-BR")}
            </strong>
          ) : null}
        </div>
      ) : null}

      <details className={styles.details}>
        <summary>Por que aparece assim?</summary>
        <div className={styles.evidence}>
          <span>
            #{position} · {orderLabel}
          </span>
          {categoryRank && categoryRank > 1 ? (
            <span>
              #{categoryRank} em {categoryLabel}
            </span>
          ) : null}
          {signals.rating?.reviewCount !== undefined ? (
            <span>
              {new Intl.NumberFormat("pt-BR").format(signals.rating.reviewCount)} avaliações
            </span>
          ) : null}
          {popularityPercent !== undefined ? (
            <span>{popularityPercent}% de popularidade relativa</span>
          ) : null}
          <span>
            Fonte: {providerLabel(signals.provider)} · atualizado em{" "}
            {formatCollectedAt(signals.collectedAt, timeZone)}
          </span>
          {quality && quality.reasons.length > 0 ? (
            <span className={styles.reason}>{quality.reasons.join(" · ")}</span>
          ) : null}
        </div>
      </details>
    </section>
  );
}
