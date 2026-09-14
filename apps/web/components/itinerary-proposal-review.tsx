import type { ItineraryProposalReview as ReviewModel } from "../lib/itinerary-proposal-experience";
import { ItineraryProposalActivityEditor } from "./itinerary-proposal-activity-editor";
import { ItineraryProposalDecisionActions } from "./itinerary-proposal-decision-actions";
import styles from "./itinerary-proposal-review.module.css";

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function ItineraryProposalReview({
  canAccept,
  canDecide,
  canEdit,
  discardAction,
  expectedItineraryVersion,
  idempotencyKey,
  itineraryHref,
  review,
  tripId,
}: {
  canAccept: boolean;
  canDecide: boolean;
  canEdit: boolean;
  discardAction: (formData: FormData) => void | Promise<void>;
  expectedItineraryVersion: number;
  idempotencyKey: string;
  itineraryHref: string;
  review: ReviewModel;
  tripId: string;
}) {
  const isExpired = review.status === "expired";
  const editingEnabled = canEdit && !isExpired && review.isBasedOnCurrentItinerary;

  return (
    <div className={styles.review}>
      <section
        className={styles.summary}
        data-status={review.status}
        aria-labelledby="proposal-review-summary-title"
      >
        <div>
          <span className={styles.status}>
            {isExpired ? "Proposta expirada" : "Proposta aguardando sua decisão"}
          </span>
          <h2 id="proposal-review-summary-title">
            {isExpired ? "Consulte esta proposta como referência" : "Revise antes de aplicar"}
          </h2>
          {isExpired ? (
            <p>
              A validade terminou em {review.expiredAtLabel}. Esta proposta não pode mais ser
              aplicada.
            </p>
          ) : (
            <p>Compare as mudanças sugeridas e escolha se deseja aplicá-las ao Roteiro.</p>
          )}
        </div>
        <dl aria-label="Resumo da proposta">
          <div>
            <dt>Mudanças propostas</dt>
            <dd>{review.proposedChangeCount}</dd>
          </div>
          <div>
            <dt>Conflitos conhecidos</dt>
            <dd>{review.knownConflictCount}</dd>
          </div>
        </dl>
      </section>

      {!review.isBasedOnCurrentItinerary ? (
        <aside className={styles.staleNotice} role="status">
          <strong>O Roteiro mudou depois desta proposta</strong>
          <p>Use o conteúdo como referência e confira o Roteiro atual antes de decidir.</p>
        </aside>
      ) : null}

      <section className={styles.context} aria-labelledby="proposal-review-context-title">
        <div>
          <p className={styles.eyebrow}>O que foi considerado</p>
          <h2 id="proposal-review-context-title">Critérios da proposta</h2>
          <ul>
            {review.criteria.map((criterion, index) => (
              <li key={`${criterion}-${index}`}>{criterion}</li>
            ))}
          </ul>
        </div>
        <dl>
          <div>
            <dt>Proposta gerada</dt>
            <dd>{review.generatedAtLabel}</dd>
          </div>
          <div>
            <dt>Válida até</dt>
            <dd>{review.validUntilLabel}</dd>
          </div>
          {isExpired ? (
            <div>
              <dt>Expirada em</dt>
              <dd>{review.expiredAtLabel}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className={styles.limitations} aria-labelledby="proposal-review-limitations-title">
        <div>
          <p className={styles.eyebrow}>Antes de decidir</p>
          <h2 id="proposal-review-limitations-title">Limitações</h2>
        </div>
        {review.limitations.length > 0 ? (
          <ul>
            {review.limitations.map((limitation, index) => (
              <li key={`${limitation}-${index}`}>{limitation}</li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma limitação foi informada para esta proposta.</p>
        )}
      </section>

      <section aria-labelledby="proposal-review-changes-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Organização sugerida</p>
            <h2 id="proposal-review-changes-title">Mudanças propostas</h2>
          </div>
          <p>{countLabel(review.proposedChangeCount, "item", "itens")}</p>
        </div>

        {review.days.length === 0 ? (
          <div className={styles.emptyChanges} role="status">
            <strong>Nenhuma mudança adequada foi proposta</strong>
            <p>Revise os critérios e limitações ou volte ao Roteiro para continuar manualmente.</p>
          </div>
        ) : (
          <ol className={styles.days} aria-label="Mudanças propostas por dia">
            {review.days.map((day) => (
              <li
                className={styles.day}
                data-reference-available={day.referenceAvailable}
                key={day.id}
              >
                <section aria-labelledby={`proposal-day-${day.id}`}>
                  <header>
                    <h3 id={`proposal-day-${day.id}`}>{day.label}</h3>
                    {!day.referenceAvailable ? <span>Informação não confirmada</span> : null}
                  </header>
                  <ol>
                    {day.activities.map((activity) => (
                      <li key={activity.id}>
                        <article aria-labelledby={`proposed-activity-${activity.id}`}>
                          <div className={styles.activityHeading}>
                            <span>{activity.operationLabel}</span>
                            <small>Mudança proposta</small>
                          </div>
                          <h4 id={`proposed-activity-${activity.id}`}>{activity.title}</h4>
                          {activity.description ? <p>{activity.description}</p> : null}
                          <dl className={styles.activityFacts}>
                            <div>
                              <dt>Horário</dt>
                              <dd>{activity.timeLabel}</dd>
                            </div>
                            {activity.durationLabel ? (
                              <div>
                                <dt>Duração proposta</dt>
                                <dd>{activity.durationLabel}</dd>
                              </div>
                            ) : null}
                            {activity.estimatedCostLabel ? (
                              <div>
                                <dt>Custo estimado</dt>
                                <dd>{activity.estimatedCostLabel}</dd>
                              </div>
                            ) : null}
                            {activity.flexibility ? (
                              <div>
                                <dt>Flexibilidade</dt>
                                <dd>{activity.flexibility}</dd>
                              </div>
                            ) : null}
                            {activity.sourceActivityTitle ? (
                              <div>
                                <dt>Atividade de origem</dt>
                                <dd>{activity.sourceActivityTitle}</dd>
                              </div>
                            ) : null}
                          </dl>
                          {activity.reason ? (
                            <div className={styles.reason}>
                              <strong>Por que foi sugerida</strong>
                              <p>{activity.reason}</p>
                            </div>
                          ) : null}
                          {editingEnabled ? (
                            <ItineraryProposalActivityEditor
                              activity={activity}
                              dayOptions={review.dayOptions}
                              proposalId={review.proposalId}
                              tripId={tripId}
                            />
                          ) : null}
                        </article>
                      </li>
                    ))}
                  </ol>
                </section>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className={styles.justifications} aria-labelledby="proposal-review-reasons-title">
        <div>
          <p className={styles.eyebrow}>Por que foi sugerido</p>
          <h2 id="proposal-review-reasons-title">Justificativas</h2>
        </div>
        <ol>
          {review.justifications.map((justification, index) => (
            <li key={`${justification}-${index}`}>{justification}</li>
          ))}
        </ol>
      </section>

      {isExpired ? (
        <p className={styles.preservation} role="note">
          Esta proposta expirou e não pode mais ser aplicada.
        </p>
      ) : null}

      {!isExpired ? (
        <ItineraryProposalDecisionActions
          canAccept={canAccept && review.isBasedOnCurrentItinerary}
          canDecide={canDecide}
          discardAction={discardAction}
          expectedItineraryVersion={expectedItineraryVersion}
          idempotencyKey={idempotencyKey}
          itineraryHref={itineraryHref}
          partialAcceptanceItems={review.days.flatMap((day) =>
            day.activities.map((activity) => ({
              id: activity.id,
              title: activity.title,
              dayLabel: day.label,
            })),
          )}
          proposalId={review.proposalId}
          tripId={tripId}
        />
      ) : null}
    </div>
  );
}
