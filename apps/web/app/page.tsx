import { DecisionPillars } from "@/components/decision-pillars";

const previewPlaces = [
  { distance: "1,8 km", name: "Praia do Amor", type: "Praia" },
  { distance: "650 m", name: "Centro de Pipa", type: "Gastronomia" },
  { distance: "4,2 km", name: "Baía dos Golfinhos", type: "Experiência" },
] as const;

export default function Home() {
  return (
    <main>
      <section className="hero-shell">
        <nav aria-label="Navegação principal" className="topbar">
          <a aria-label="RouteBook — início" className="brand" href="#inicio">
            <span aria-hidden="true" className="brand-mark">
              R
            </span>
            <span>RouteBook</span>
          </a>
          <a className="nav-link" href="#proposito">
            Conhecer o projeto
          </a>
        </nav>

        <div className="hero-grid" id="inicio">
          <div className="hero-copy">
            <p className="status-pill">
              <span aria-hidden="true" />
              Primeiro cenário: Pipa · agosto de 2026
            </p>
            <h1>Decisões melhores para cada momento da sua viagem.</h1>
            <p className="hero-lead">
              O RouteBook transforma lugares, distâncias, preferências e tempo disponível em um
              guia visual que ajuda você a escolher o que realmente vale a pena.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#proposito">
                Entender o RouteBook
              </a>
              <span>Aplicação em construção</span>
            </div>
          </div>

          <div aria-label="Prévia visual do futuro guia de viagem" className="preview-card">
            <div className="preview-header">
              <div>
                <p>Viagem ativa</p>
                <h2>Pipa, Rio Grande do Norte</h2>
              </div>
              <span>7 dias</span>
            </div>

            <div aria-hidden="true" className="map-preview">
              <div className="map-route" />
              <span className="map-pin map-pin-home">H</span>
              <span className="map-pin map-pin-one">1</span>
              <span className="map-pin map-pin-two">2</span>
              <span className="map-pin map-pin-three">3</span>
            </div>

            <div className="places-list">
              {previewPlaces.map((place) => (
                <div className="place-row" key={place.name}>
                  <span aria-hidden="true" className="place-dot" />
                  <div>
                    <p>{place.type}</p>
                    <strong>{place.name}</strong>
                  </div>
                  <span>{place.distance}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div id="proposito">
        <DecisionPillars />
      </div>

      <section aria-labelledby="principle-title" className="principle-shell">
        <div>
          <p className="eyebrow">Princípio central</p>
          <h2 id="principle-title">A tecnologia recomenda. A pessoa decide.</h2>
        </div>
        <p>
          O RouteBook não aplica mudanças silenciosamente. Toda recomendação deve ser compreensível,
          toda estimativa deve ser identificada e o roteiro permanece sob controle do viajante.
        </p>
      </section>

      <footer>
        <span>RouteBook</span>
        <p>Produto pessoal, documentation-first e AI-first.</p>
      </footer>
    </main>
  );
}
