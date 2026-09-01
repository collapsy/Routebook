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

function formatCollectedAt(value: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Fortaleza",
  }).format(value);
}

export function PlaceRankingMeta({
  position,
  orderLabel,
  quality,
  signals,
  categoryRank,
  categoryLabel,
}: Readonly<{
  position: number;
  orderLabel: string;
  quality?: PlaceQualityScore;
  signals?: PlaceQualitySignals;
  categoryRank?: number;
  categoryLabel: string;
}>) {
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
      <div className={styles.summaryRow}>
        <div className={styles.badges}>
          <strong className={styles.position}>
            #{position} · {orderLabel}
          </strong>
          {quality && categoryRank === 1 ? (
            <strong className={styles.topBadge}>
              Top {categoryLabel.toLocaleLowerCase("pt-BR")}
            </strong>
          ) : categoryRank ? (
            <span className={styles.categoryRank}>
              #{categoryRank} em {categoryLabel}
            </span>
          ) : null}
        </div>

        {signals?.rating ? (
          <span className={styles.ratingSummary}>
            ★ {formatDecimal(signals.rating.value)}
            {signals.rating.reviewCount !== undefined
              ? " · " +
                new Intl.NumberFormat("pt-BR").format(signals.rating.reviewCount) +
                " avaliações"
              : ""}
          </span>
        ) : popularityPercent !== undefined ? (
          <span className={styles.ratingSummary}>{popularityPercent}% popularidade</span>
        ) : null}
      </div>

      {quality && signals ? (
        <details className={styles.evidenceDetails}>
          <summary>Por que está aqui?</summary>
          <div className={styles.evidence}>
            <strong>Score RouteBook {formatDecimal(quality.score)}/10</strong>
            {signals.rating ? (
              <span>
                Avaliação {formatDecimal(signals.rating.value)}/
                {formatDecimal(signals.rating.scaleMax, 0)}
                {signals.rating.reviewCount !== undefined
                  ? " · " +
                    new Intl.NumberFormat("pt-BR").format(signals.rating.reviewCount) +
                    " avaliações"
                  : ""}
              </span>
            ) : null}
            {popularityPercent !== undefined ? (
              <span>{popularityPercent}% de popularidade relativa</span>
            ) : null}
            <span>
              Fonte: {providerLabel(signals.provider)} · coletado em{" "}
              {formatCollectedAt(signals.collectedAt)}
            </span>
            {quality.reasons.length > 0 ? (
              <span className={styles.reason}>{quality.reasons.join(" · ")}</span>
            ) : (
              <span className={styles.reason}>Score derivado somente dos sinais disponíveis.</span>
            )}
          </div>
        </details>
      ) : null}
    </section>
  );
}
