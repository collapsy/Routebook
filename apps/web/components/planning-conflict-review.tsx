"use client";

import Link from "next/link";
import { useState } from "react";

import type {
  PlanningConflictReview as PlanningConflictReviewModel,
  PlanningConflictSeverity,
} from "../lib/planning-conflict-experience";
import styles from "./planning-conflict-review.module.css";

type ReviewFilter = "all" | PlanningConflictSeverity;

const filters: readonly Readonly<{ id: ReviewFilter; label: string }>[] = [
  { id: "all", label: "Todos" },
  { id: "error", label: "Erros" },
  { id: "risk", label: "Riscos" },
  { id: "suggestion", label: "Sugestões" },
];

const severitySymbols: Readonly<Record<PlanningConflictSeverity, string>> = {
  error: "!",
  risk: "△",
  suggestion: "i",
};

function countForFilter(review: PlanningConflictReviewModel, filter: ReviewFilter): number {
  return filter === "all" ? review.total : review.counts[filter];
}

function conflictLabel(count: number): string {
  return count === 1 ? "1 conflito" : `${count} conflitos`;
}

export function PlanningConflictReview({ review }: { review: PlanningConflictReviewModel }) {
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("all");

  if (review.total === 0) {
    return (
      <section className={styles.emptyState} aria-labelledby="planning-review-empty-title">
        <span aria-hidden="true">✓</span>
        <div>
          <h2 id="planning-review-empty-title">Nenhum conflito encontrado</h2>
          <p>
            A análise determinística atual não encontrou inconsistências no Roteiro. Isso não
            garante ausência de imprevistos ou mudanças externas.
          </p>
        </div>
      </section>
    );
  }

  const visibleItems =
    activeFilter === "all"
      ? review.items
      : review.items.filter((item) => item.severity === activeFilter);

  return (
    <div className={styles.review}>
      <section className={styles.summary} aria-labelledby="planning-review-summary-title">
        <div>
          <p className={styles.eyebrow}>Resultado da análise</p>
          <h2 id="planning-review-summary-title">{conflictLabel(review.total)} para revisar</h2>
          <p>
            Os itens abaixo são resultados da política determinística atual e não alteram o Roteiro
            automaticamente.
          </p>
        </div>
        <dl aria-label="Conflitos por severidade">
          <div>
            <dt>Erros</dt>
            <dd>{review.counts.error}</dd>
          </div>
          <div>
            <dt>Riscos</dt>
            <dd>{review.counts.risk}</dd>
          </div>
          <div>
            <dt>Sugestões</dt>
            <dd>{review.counts.suggestion}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="planning-review-list-title">
        <div className={styles.listHeading}>
          <div>
            <p className={styles.eyebrow}>Revisão</p>
            <h2 id="planning-review-list-title">Conflitos de Planejamento</h2>
          </div>
          <div className={styles.filters} aria-label="Filtrar conflitos" role="group">
            {filters.map((filter) => {
              const count = countForFilter(review, filter.id);
              return (
                <button
                  aria-pressed={activeFilter === filter.id}
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  type="button"
                >
                  {filter.label} <span>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className={styles.resultCount} aria-live="polite">
          Exibindo {conflictLabel(visibleItems.length)}
        </p>

        {visibleItems.length === 0 ? (
          <div className={styles.filteredEmpty} role="status">
            <strong>Nenhum conflito desta severidade</strong>
            <p>Selecione outro filtro para continuar a revisão.</p>
          </div>
        ) : (
          <ol className={styles.list} aria-label="Conflitos de Planejamento encontrados">
            {visibleItems.map((item) => {
              const titleId = `planning-conflict-${item.id}`;
              return (
                <li className={styles.card} data-severity={item.severity} key={item.id}>
                  <article aria-labelledby={titleId}>
                    <div className={styles.cardHeading}>
                      <span className={styles.severity} data-severity={item.severity}>
                        <span aria-hidden="true">{severitySymbols[item.severity]}</span>
                        {item.severityLabel}
                      </span>
                      {item.dayLabel ? <span className={styles.day}>{item.dayLabel}</span> : null}
                    </div>
                    <h3 id={titleId}>{item.title}</h3>
                    <p>{item.explanation}</p>
                    {item.activityTitles.length > 0 ? (
                      <div className={styles.affected}>
                        <strong>Atividades afetadas</strong>
                        <ul>
                          {item.activityTitles.map((title, index) => (
                            <li key={`${title}-${index}`}>{title}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div className={styles.impact}>
                      <strong>Impacto</strong>
                      <p>{item.impact}</p>
                    </div>
                    {item.itineraryHref ? (
                      <Link className={styles.dayLink} href={item.itineraryHref}>
                        Ver dia no Roteiro <span aria-hidden="true">→</span>
                      </Link>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
