import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { TripForm } from "@/components/trip-form";
import { getRouteBookSession } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Criar viagem — RouteBook",
  description: "Crie uma viagem canônica para Pipa no RouteBook.",
};

export default async function NewTripPage() {
  const session = await getRouteBookSession();
  if (!session) redirect("/entrar?next=%2Fviagens%2Fnova");

  return (
    <section className="preparation-page">
      <Link className="back-link" href="/viagens">
        ← Voltar para Minhas viagens
      </Link>

      <div className="creation-layout">
        <header className="preparation-copy">
          <p className="product-eyebrow">Nova viagem</p>
          <h1>Crie o contexto inicial da sua viagem.</h1>
          <p>
            Informe apenas os dados estruturais necessários. Preferências, lugares e roteiro serão
            adicionados em etapas posteriores, sempre sob seu controle.
          </p>
        </header>

        <aside className="preparation-note">
          <strong>Primeiro destino suportado: Pipa.</strong>
          <p>
            O MVP utiliza Pipa, Tibau do Sul — RN como destino canônico, com coordenadas e fuso já
            definidos. Outros destinos serão habilitados quando a resolução geográfica estiver
            pronta.
          </p>
        </aside>
      </div>

      <TripForm />
    </section>
  );
}
