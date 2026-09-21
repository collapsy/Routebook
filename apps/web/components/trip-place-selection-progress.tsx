"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  TRIP_PLACE_PREFERENCE_CHANGED_EVENT,
  type TripPlacePreferenceChangedDetail,
} from "./trip-place-preference-events";

import styles from "./trip-place-selection-progress.module.css";

export type TripPlaceSelectionCounts = Readonly<{
  WANT: number;
  MAYBE: number;
  NOT_INTERESTED: number;
  mustDo: number;
}>;

type TripPlaceSelectionProgressProps = Readonly<{
  initialCounts: TripPlaceSelectionCounts;
  reviewHref?: string;
}>;

function adjustCount(value: number, delta: number): number {
  return Math.max(0, value + delta);
}

export function TripPlaceSelectionProgress({
  initialCounts,
  reviewHref,
}: TripPlaceSelectionProgressProps) {
  const [counts, setCounts] = useState(initialCounts);

  useEffect(() => {
    function handlePreferenceChanged(event: Event) {
      const detail = (event as CustomEvent<TripPlacePreferenceChangedDetail>).detail;
      if (!detail) return;

      setCounts((current) => {
        const next = { ...current };

        if (detail.previousIntent) {
          next[detail.previousIntent] = adjustCount(next[detail.previousIntent], -1);
        }
        if (detail.nextIntent) {
          next[detail.nextIntent] = adjustCount(next[detail.nextIntent], 1);
        }

        if (detail.previousPriority === "MUST_DO") {
          next.mustDo = adjustCount(next.mustDo, -1);
        }
        if (detail.nextPriority === "MUST_DO") {
          next.mustDo = adjustCount(next.mustDo, 1);
        }

        return next;
      });
    }

    window.addEventListener(TRIP_PLACE_PREFERENCE_CHANGED_EVENT, handlePreferenceChanged);
    return () =>
      window.removeEventListener(TRIP_PLACE_PREFERENCE_CHANGED_EVENT, handlePreferenceChanged);
  }, []);

  const consideredCount = counts.WANT + counts.MAYBE;

  return (
    <section
      aria-labelledby="trip-place-selection-progress-title"
      className={styles.progress}
      data-selection-progress="true"
    >
      <div className={styles.heading}>
        <div>
          <p className="product-eyebrow">Progresso da seleção</p>
          <h2 id="trip-place-selection-progress-title">
            {consideredCount > 0 ? "Sua seleção está tomando forma" : "Comece pelo que desperta interesse"}
          </h2>
        </div>
        {reviewHref ? (
          <Link className="product-secondary-action" href={reviewHref}>
            Revisar seleção
          </Link>
        ) : null}
      </div>

      <dl className={styles.counts} aria-label="Resumo das preferências">
        <div>
          <dt>Quero ir</dt>
          <dd>{counts.WANT}</dd>
        </div>
        <div>
          <dt>Talvez</dt>
          <dd>{counts.MAYBE}</dd>
        </div>
        <div>
          <dt>Não tenho interesse</dt>
          <dd>{counts.NOT_INTERESTED}</dd>
        </div>
        <div>
          <dt>Imperdíveis</dt>
          <dd>{counts.mustDo}</dd>
        </div>
      </dl>

      <p className={styles.guidance} role="status">
        {consideredCount > 0
          ? `${consideredCount} ${consideredCount === 1 ? "lugar está" : "lugares estão"} em consideração para a próxima etapa. Isso ainda não cria atividades no roteiro.`
          : "Ainda não há lugares marcados como Quero ir ou Talvez. Continue explorando se quiser — não existe quantidade mínima obrigatória."}
      </p>
    </section>
  );
}
