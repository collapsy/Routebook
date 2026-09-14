import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { TripForm } from "@/components/trip-form";
import { getRouteBookSession } from "@/lib/auth-session";
import { resolveConfiguredDestinationResolver } from "@/lib/destination-resolver";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Criar viagem — RouteBook",
  description: "Informe destino, período e hospedagem para iniciar seu guia no RouteBook.",
};

export default async function NewTripPage() {
  const session = await getRouteBookSession();
  if (!session) redirect("/entrar?next=%2Fviagens%2Fnova");

  const configuredResolver = resolveConfiguredDestinationResolver();
  const destinationAttribution =
    configuredResolver.status === "configured" ? configuredResolver.attribution : undefined;

  return (
    <section className="preparation-page">
      <Link className="back-link" href="/viagens">
        ← Voltar para Minhas viagens
      </Link>

      <div className="creation-layout">
        <header className="preparation-copy">
          <p className="product-eyebrow">Nova viagem</p>
          <h1>Para onde você vai?</h1>
          <p>Digite uma cidade ou região e escolha a opção correta nas sugestões.</p>
        </header>

        <aside className="preparation-note">
          <strong>Comece com o essencial.</strong>
          <p>Informe o que já souber. Hospedagem e preferências podem ser completadas depois.</p>
        </aside>
      </div>

      <TripForm destinationAttribution={destinationAttribution} />
    </section>
  );
}
