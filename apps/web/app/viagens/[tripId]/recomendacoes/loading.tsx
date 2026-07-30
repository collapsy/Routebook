import styles from "./recommendations-page.module.css";

export default function RecommendationsLoading() {
  return (
    <main aria-busy="true" className={styles.page}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Decision Intelligence determinística</p>
        <h1>Carregando sugestões da viagem</h1>
        <p>Estamos avaliando somente o Contexto conhecido e os Places publicados.</p>
      </header>
      <div aria-hidden="true" className={styles.loadingCard} />
      <div aria-hidden="true" className={styles.loadingCard} />
    </main>
  );
}
