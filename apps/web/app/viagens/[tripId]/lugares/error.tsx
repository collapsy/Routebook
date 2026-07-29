"use client";

export default function PlaceCatalogError({ reset }: { reset: () => void }) {
  return (
    <section className="app-page" role="alert">
      <p className="product-eyebrow">Catálogo indisponível</p>
      <h1>Não foi possível carregar os lugares</h1>
      <p>Tente novamente. A viagem e o contexto salvo não foram alterados.</p>
      <button className="product-secondary-action" type="button" onClick={reset}>
        Tentar novamente
      </button>
    </section>
  );
}
