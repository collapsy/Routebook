export default function PlaceCatalogLoading() {
  return (
    <section className="app-page" aria-busy="true" aria-live="polite">
      <p className="product-eyebrow">Catálogo de lugares</p>
      <h1>Carregando lugares...</h1>
      <p>Estamos consultando os lugares publicados para esta viagem.</p>
    </section>
  );
}
