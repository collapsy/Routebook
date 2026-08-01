import styles from "./review-page.module.css";

export default function PlanningConflictReviewLoading() {
  return (
    <section className={`app-page ${styles.page}`} aria-busy="true" aria-live="polite">
      <p className="back-link" aria-hidden="true">
        ← Voltar para o Roteiro
      </p>
      <header className={styles.hero}>
        <div>
          <p className="product-eyebrow">Roteiro · análise determinística</p>
          <h1>Analisando Conflitos de Planejamento…</h1>
          <p>Estamos comparando dias, atividades, horários e limites conhecidos da viagem.</p>
        </div>
      </header>
      <div className={styles.loadingCard}>
        <span aria-hidden="true" />
        <div>
          <strong>A avaliação está em andamento</strong>
          <p>Os resultados serão exibidos assim que a análise terminar.</p>
        </div>
      </div>
    </section>
  );
}
