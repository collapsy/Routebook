"use client";

type ProductErrorStateProps = Readonly<{
  onRetry: () => void;
}>;

export function ProductErrorState({ onRetry }: ProductErrorStateProps) {
  return (
    <section aria-labelledby="product-error-title" className="product-state-card" role="alert">
      <p className="product-eyebrow">Algo saiu da rota</p>
      <h1 id="product-error-title">Não foi possível abrir suas viagens</h1>
      <p>Seus dados não foram alterados. Tente carregar esta área novamente.</p>
      <button className="product-button" onClick={onRetry} type="button">
        Tentar novamente
      </button>
    </section>
  );
}
