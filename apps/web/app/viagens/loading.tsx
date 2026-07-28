export default function TripsLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Carregando suas viagens"
      className="product-state-page"
      role="status"
    >
      <div className="product-state-card loading-card">
        <p className="product-eyebrow">Organizando seu espaço</p>
        <div className="loading-line loading-line-short" />
        <div className="loading-line" />
        <div className="loading-block" />
        <span className="sr-only">Carregando suas viagens</span>
      </div>
    </section>
  );
}
