import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="product-eyebrow">Página não encontrada</p>
      <h1>Essa página saiu do roteiro.</h1>
      <p>O endereço pode ter mudado ou ainda não fazer parte do RouteBook.</p>
      <Link className="product-primary-action" href="/viagens">
        Voltar para Minhas viagens
      </Link>
    </main>
  );
}
