"use client";

export default function PlaceCatalogError({ reset }: { reset: () => void }) {
  return (
    <section className="app-page" role="alert">
      <p className="product-eyebrow">Lugares indisponíveis</p>
      <h1>Não foi possível carregar os lugares</h1>
      <p>Tente novamente.</p>
      <button className="product-secondary-action" type="button" onClick={reset}>
        Tentar novamente
      </button>
    </section>
  );
}
