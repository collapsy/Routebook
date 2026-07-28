import Link from "next/link";

const steps = ["Crie a viagem", "Descubra lugares", "Monte o roteiro"] as const;

export function EmptyTripsState() {
  return (
    <section aria-labelledby="empty-trips-title" className="empty-trips-state">
      <div className="empty-state-content">
        <p className="product-eyebrow">Primeiro acesso</p>
        <h2 id="empty-trips-title">Você ainda não criou nenhuma viagem</h2>
        <p>
          Comece informando destino, datas e hospedagem. O RouteBook usará esse contexto para organizar
          as próximas decisões da sua viagem.
        </p>

        <div className="empty-state-actions">
          <Link className="product-primary-action" href="/viagens/nova">
            Criar primeira viagem
          </Link>
          <Link className="product-secondary-action" href="/#proposito">
            Conhecer o RouteBook
          </Link>
        </div>

        <div aria-labelledby="how-it-works-title" className="how-it-works">
          <h3 id="how-it-works-title">Como funciona</h3>
          <ol>
            {steps.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div aria-hidden="true" className="empty-state-visual">
        <div className="travel-case">
          <span className="travel-case-line" />
          <span className="travel-case-line" />
        </div>
      </div>
    </section>
  );
}
