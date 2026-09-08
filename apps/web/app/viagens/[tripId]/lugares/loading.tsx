export default function PlaceCatalogLoading() {
  return (
    <section className="app-page" aria-busy="true" aria-live="polite">
      <p className="product-eyebrow">Lugares</p>
      <h1>Carregando lugares…</h1>
      <p>Isso pode levar alguns instantes.</p>
    </section>
  );
}
