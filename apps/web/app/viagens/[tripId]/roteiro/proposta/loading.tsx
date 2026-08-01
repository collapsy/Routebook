import styles from "./proposal-page.module.css";

export default function ItineraryProposalReviewLoading() {
  return (
    <section className={`app-page ${styles.page}`} aria-busy="true" aria-live="polite">
      <p className="back-link" aria-hidden="true">
        ← Voltar para o Roteiro
      </p>
      <header className={styles.hero}>
        <div>
          <p className="product-eyebrow">Proposta de Roteiro</p>
          <h1>Carregando proposta…</h1>
          <p>Estamos reunindo o conteúdo já gerado para uma revisão separada do Roteiro atual.</p>
        </div>
      </header>
      <div className={styles.loadingCard}>
        <span aria-hidden="true" />
        <div>
          <strong>Preparando a revisão</strong>
          <p>O Roteiro atual permanece preservado durante o carregamento.</p>
        </div>
      </div>
    </section>
  );
}
