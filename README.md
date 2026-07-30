# RouteBook

> Guia de viagem visual, personalizável e orientado à decisão.

O **RouteBook** é uma aplicação web AI-First que ajuda viajantes a descobrir lugares, compreender distâncias, organizar atividades e tomar decisões antes e durante uma viagem.

O produto combina contexto da viagem, preferências, localização, mapas, orçamento e tempo disponível para transformar informações dispersas em um guia visual e um roteiro editável.

## Cenário inicial de validação

O projeto surgiu para apoiar uma viagem real a **Pipa (RN), de 22 a 29 de agosto de 2026**, realizada por três adultos e com hospedagem principal no Condomínio Solar Água.

Esse cenário será utilizado para validar o primeiro ciclo do produto, incluindo praias, restaurantes, vida noturna, distâncias a partir da hospedagem e organização das atividades por dia.

Pipa é o cenário inicial, não uma limitação estrutural. Outros destinos serão habilitados quando a resolução geográfica estiver implementada.

## Proposta de valor

O RouteBook não é apenas um catálogo de pontos turísticos. Seu objetivo é ajudar o viajante a responder:

> Considerando onde estou, quanto tempo tenho, quanto posso gastar e o que gosto de fazer, qual é a próxima melhor decisão para esta viagem?

## Estado atual

| Área | Estado |
| --- | --- |
| Visão, produto, domínio, UX e arquitetura | Publicado |
| Governança para implementação | Integrada pelo RB-INC-000 |
| Monorepo executável | Implementado pelo RB-INC-001 |
| Product shell e Minhas Viagens | Implementados pelo RB-INC-002 |
| Agregado `Trip` | Implementado no RB-INC-003 |
| Persistência PostgreSQL/PostGIS | Ativada no RB-INC-003 |
| Criação e listagem de Viagens | Implementadas para Pipa |
| Contexto, Hospedagem, Lugares, salvos, mapas e Roteiro | Implementados nos incrementos integrados |
| Recommendations determinísticas, explicáveis e persistidas | Implementadas no ciclo RB-INC-038–041 |
| Decisions explícitas sobre Recommendations | Em implementação no RB-INC-042 |
| MVP funcional completo | Não validado |

A aplicação já cria e persiste Trips, Contexto dos viajantes, Accommodation, catálogo de Places, Saved Places, mapas, distância geodésica e Itinerary manual. O ciclo RB-INC-038–041 adiciona Recommendations determinísticas com Context Snapshot, Reasons, Limitations, Confidence qualitativa, persistência e rejeição explícita, sem uso de LLM ou mutação automática do Roteiro.

## Execução local

### Pré-requisitos

- Node.js `24.18.0`;
- Corepack;
- Docker com Compose;
- Git.

### Instalação e banco

```bash
git clone https://github.com/collapsy/Routebook.git
cd Routebook
cp .env.example .env.local
docker compose up -d postgres
corepack enable
pnpm install --frozen-lockfile
pnpm db:migrate
```

### Desenvolvimento

```bash
pnpm dev
```

A aplicação fica disponível em `http://localhost:3000`.

### Validação completa

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm db:migrate
pnpm test
pnpm build
pnpm test:e2e
```

Para o primeiro uso local do Playwright:

```bash
pnpm --filter @routebook/web exec playwright install chromium
```

## Stack ativa

| Componente | Versão |
| --- | --- |
| Node.js | 24.18.0 |
| pnpm | 11.17.0 |
| Turborepo | 2.10.7 |
| Next.js | 16.2.12 |
| React | 19.2.8 |
| Tailwind CSS | 4.3.3 |
| TypeScript | 6.0.3 |
| ESLint | 9.39.5 |
| Vitest | 4.1.10 |
| Playwright | 1.62.0 |
| PostgreSQL/PostGIS | 17 / 3.5 |
| Drizzle ORM | 0.45.2 |
| Drizzle Kit | 0.31.10 |
| Postgres.js | 3.4.9 |
| tsx | 4.22.5 |

As versões são fixadas de forma exata e o `pnpm-lock.yaml` é obrigatório.

## Estrutura executável atual

```text
Routebook/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
│       ├── documentation-validation.yml
│       └── engineering-validation.yml
├── apps/
│   └── web/
│       ├── app/
│       ├── components/
│       ├── e2e/
│       └── package.json
├── modules/
│   ├── decision-intelligence/
│   ├── geo-distance/
│   ├── place-catalog/
│   ├── saved-places/
│   ├── traveler-profile/
│   └── trip-management/
├── packages/
│   ├── database/
│   ├── eslint-config/
│   └── typescript-config/
├── docs/
├── scripts/
├── compose.yaml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
├── AGENTS.md
├── CONTRIBUTING.md
└── README.md
```

Os módulos de domínio preservam ownership por bounded context. `modules/decision-intelligence` contém Recommendations, geração determinística e contratos de Decision; `packages/database` contém schemas, migrations e adapters Drizzle; `apps/web` concentra a composição e a experiência navegável.

## Quality gates

O workflow `.github/workflows/engineering-validation.yml` executa:

1. PostGIS isolado para o job;
2. instalação congelada;
3. verificação de formatação;
4. validação documental;
5. lint e typecheck;
6. aplicação da migration;
7. testes de domínio e componente;
8. smoke do servidor de desenvolvimento;
9. build de produção;
10. testes E2E persistentes em desktop e mobile.

Nenhum secret ou Provider externo é necessário para esse pipeline.

## Capacidades planejadas para o MVP

O MVP deverá permitir que o usuário:

1. crie uma Viagem;
2. informe Destino, Período e Hospedagem;
3. registre Preferências e contexto básico do grupo;
4. descubra Lugares relevantes em lista e mapa;
5. consulte distância e tempo estimado de deslocamento;
6. salve Lugares sem adicioná-los automaticamente ao Roteiro;
7. organize manualmente atividades por Dia e Período;
8. visualize conflitos e restrições relevantes;
9. receba Recomendações determinísticas explicáveis;
10. avalie e aceite explicitamente Propostas geradas com assistência de IA.

Reservas, pagamentos, colaboração avançada e automações autônomas permanecem fora do primeiro corte.

## Princípios permanentes

- **Decisão antes de conteúdo:** cada capacidade deve ajudar a descobrir, decidir, organizar ou executar uma viagem.
- **Visual antes de textual:** mapas, cartões, fotografias e indicadores comunicam o essencial primeiro.
- **Contexto antes de popularidade:** um Lugar popular não é necessariamente a melhor opção para uma Viagem específica.
- **Controle do usuário:** recomendações e Propostas podem ser aceitas, alteradas ou rejeitadas.
- **Transparência:** estimativas e motivos relevantes não devem comunicar falsa precisão.
- **Simplicidade progressiva:** o produto gera valor com contexto mínimo e permite refinamento gradual.

## Arquitetura adotada

O RouteBook é implementado inicialmente como um **monólito modular**, em TypeScript, organizado como monorepo com pnpm Workspaces e Turborepo.

A aplicação web utiliza Next.js com App Router. O domínio permanece desacoplado da interface por portas, e o PostgreSQL/PostGIS é acessado por um adapter Drizzle.

## Documentação

Entradas principais:

- [`docs/README.md`](./docs/README.md): navegação e hierarquia documental;
- [`docs/registry.md`](./docs/registry.md): registro oficial dos documentos;
- [`docs/core/routebook-bible.md`](./docs/core/routebook-bible.md): constituição semântica do projeto;
- [`docs/implementation/README.md`](./docs/implementation/README.md): operação por incrementos e Context Packs;
- [`docs/implementation/increments/rb-inc-041-recommendations-experience.md`](./docs/implementation/increments/rb-inc-041-recommendations-experience.md): experiência explicável de Recommendations;
- [`AGENTS.md`](./AGENTS.md): regras obrigatórias para agentes de IA.

A ordem de autoridade é:

```text
RouteBook Bible
→ Foundation e Product
→ Domain
→ UX e Design System
→ Architecture e ADRs
→ Delivery, Quality e Operations
→ Incremento e Context Pack
→ Implementação
```

Em caso de conflito, a camada inferior não pode redefinir silenciosamente a camada superior.

## Fonte oficial de verdade

O repositório Git é a fonte canônica do RouteBook.

Uma decisão somente é oficial quando registrada por meio de documentos versionados, ADRs, issues, commits ou pull requests. Conversas e memórias de agentes podem apoiar o trabalho, mas não substituem o conteúdo versionado.

## Contribuição

As regras de contribuição estão em [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Toda alteração deve preservar escopo controlado, rastreabilidade, validação automatizada, ausência de secrets e revisão antes da integração na `main`.

## Licença

Uma licença de código aberto ainda não foi escolhida.

Enquanto não existir um arquivo `LICENSE`, o código, a documentação, os assets e demais conteúdos permanecem com **todos os direitos reservados** e não devem ser considerados liberados para uso, modificação ou distribuição sem autorização do responsável pelo projeto.
