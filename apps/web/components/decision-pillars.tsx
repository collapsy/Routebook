const pillars = [
  {
    eyebrow: "Descoberta",
    title: "Encontre o que combina com a viagem",
    description:
      "Praias, restaurantes e experiências apresentados com contexto, e não apenas por popularidade.",
  },
  {
    eyebrow: "Contexto",
    title: "Compare tempo, distância e momento",
    description:
      "Entenda o impacto de cada opção a partir da hospedagem, do período disponível e das preferências do grupo.",
  },
  {
    eyebrow: "Controle",
    title: "Decida sem perder flexibilidade",
    description:
      "Recomendações ajudam a escolher, mas o roteiro continua editável e a decisão final permanece com você.",
  },
] as const;

export function DecisionPillars() {
  return (
    <section aria-labelledby="decision-pillars-title" className="section-shell">
      <div className="section-heading">
        <p className="eyebrow">Como o RouteBook ajuda</p>
        <h2 id="decision-pillars-title">Menos listas. Mais contexto para decidir.</h2>
      </div>

      <div className="pillars-grid">
        {pillars.map((pillar, index) => (
          <article className="pillar-card" key={pillar.title}>
            <span aria-hidden="true" className="pillar-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="pillar-eyebrow">{pillar.eyebrow}</p>
            <h3>{pillar.title}</h3>
            <p>{pillar.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
