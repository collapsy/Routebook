# RouteBook

> Guia de viagem visual, personalizável e orientado à decisão.

O **RouteBook** é uma aplicação web AI-First que ajuda viajantes a descobrir lugares, compreender distâncias, organizar atividades e tomar decisões antes e durante uma viagem.

O produto combina contexto da viagem, preferências, localização, mapas, orçamento e tempo disponível para transformar informações dispersas em um guia visual e um roteiro editável.

## Cenário inicial de validação

O projeto surgiu para apoiar uma viagem real a **Pipa (RN), de 22 a 29 de agosto de 2026**, realizada por três adultos e com hospedagem principal no Condomínio Solar Água.

Esse cenário será utilizado para validar o primeiro ciclo do produto, incluindo:

- praias e atrações;
- restaurantes e custo-benefício;
- bares e vida noturna;
- distâncias a partir da hospedagem;
- organização das atividades por dia;
- equilíbrio entre planejamento e períodos livres.

Pipa é o cenário inicial, não uma limitação estrutural. O RouteBook deverá atender progressivamente outros destinos, grupos, períodos e estilos de viagem.

## Proposta de valor

O RouteBook não é apenas um catálogo de pontos turísticos.

Seu objetivo é ajudar o viajante a responder:

> Considerando onde estou, quanto tempo tenho, quanto posso gastar e o que gosto de fazer, qual é a próxima melhor decisão para esta viagem?

Para isso, o produto deverá integrar:

- descoberta de lugares;
- contexto geográfico;
- mapas, distâncias e rotas;
- personalização progressiva;
- organização de roteiro;
- recomendações contextualizadas;
- justificativas compreensíveis;
- controle final pelo usuário.

## Capacidades do MVP

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

### Decisão antes de conteúdo

Cada capacidade deve ajudar o usuário a descobrir, decidir, organizar ou executar uma viagem.

### Visual antes de textual

Mapas, cartões, fotografias e indicadores devem comunicar o essencial antes de blocos extensos de texto.

### Contexto antes de popularidade

Um Lugar popular não é necessariamente a melhor opção para uma Viagem específica.

### Controle do usuário

Recomendações e Propostas podem ser aceitas, alteradas ou rejeitadas. A IA não altera o estado canônico silenciosamente.

### Transparência

Distâncias, estimativas, disponibilidade, confiança e motivos relevantes devem ser apresentados sem falsa precisão.

### Simplicidade progressiva

O produto deve gerar valor com contexto mínimo e permitir refinamento gradual.

## Estado atual

A trilha documental inicial está publicada. O repositório contém documentação de Foundation, Product, UX, Design System, Domain, Architecture, Data, Security, Privacy, Quality, Delivery, Operations e ADRs.

A implementação executável ainda será construída por **incrementos verticais**, começando pelo `RB-INC-000 — Implementation Readiness` e, em seguida, pelo bootstrap do monorepo.

Estado resumido:

| Área | Estado |
| --- | --- |
| Visão e escopo do produto | Publicado |
| Domínio e linguagem ubíqua | Publicado |
| UX e Design System | Publicado |
| Arquitetura e ADRs | Publicado |
| Estratégia de entrega e qualidade | Publicado |
| Aplicação executável | Não iniciada |
| Integrações externas | Não provisionadas |
| MVP validado | Não |

## Arquitetura adotada

O RouteBook será implementado inicialmente como um **monólito modular**, em TypeScript, organizado como monorepo com pnpm Workspaces e Turborepo.

A aplicação web utilizará Next.js com App Router. As decisões de persistência, autenticação, mapas, observabilidade e demais Providers estão registradas nos ADRs, mas serão ativadas somente quando um incremento concreto exigir sua utilização.

A estrutura física alvo é:

```text
Routebook/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   └── PULL_REQUEST_TEMPLATE.md
├── apps/
│   └── web/
├── modules/
│   ├── identity-access/
│   ├── trip-management/
│   ├── traveler-profile/
│   ├── place-catalog/
│   ├── trip-collection/
│   ├── itinerary-planning/
│   ├── mobility/
│   ├── decision-intelligence/
│   ├── proposal-management/
│   ├── planning-assurance/
│   ├── data-governance/
│   └── platform/
├── packages/
│   ├── ui/
│   ├── shared-kernel/
│   ├── database/
│   ├── observability/
│   ├── configuration/
│   ├── eslint-config/
│   └── typescript-config/
├── docs/
├── scripts/
├── tests/
├── tooling/
├── AGENTS.md
├── CONTRIBUTING.md
└── README.md
```

Essa estrutura será criada progressivamente. Diretórios e dependências não serão adicionados antes de existir uma responsabilidade real.

## Documentação

A documentação é parte do produto e precede a implementação.

Entradas principais:

- [`docs/README.md`](./docs/README.md): navegação e hierarquia documental;
- [`docs/registry.md`](./docs/registry.md): registro oficial dos documentos;
- [`docs/core/routebook-bible.md`](./docs/core/routebook-bible.md): constituição semântica do projeto;
- [`docs/delivery/delivery-strategy-and-implementation-roadmap.md`](./docs/delivery/delivery-strategy-and-implementation-roadmap.md): estratégia de entrega;
- [`docs/implementation/README.md`](./docs/implementation/README.md): operação por incrementos e Context Packs;
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

## Desenvolvimento por incrementos

Cada entrega deve representar valor vertical verificável e possuir:

- identificador `RB-INC-NNN`;
- objetivo e problema;
- documentos de contexto;
- caminhos permitidos;
- critérios de aceite;
- testes e evidências;
- impactos documentais;
- riscos e itens fora de escopo.

O agente responsável por uma tarefa deve receber somente o Context Pack necessário. Todo trabalho deve ser revisável por diff, testável e rastreável a uma issue e a um pull request.

## Fonte oficial de verdade

O repositório Git é a fonte canônica do RouteBook.

Uma decisão somente é oficial quando registrada por meio de documentos versionados, ADRs, issues, commits ou pull requests.

Conversas, memórias de agentes e respostas externas podem apoiar o trabalho, mas não substituem o conteúdo versionado.

## Contribuição

As regras de contribuição estão em [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Alterações devem preservar:

- escopo controlado;
- consistência com o domínio;
- atualização documental;
- validação automatizada;
- rastreabilidade;
- ausência de secrets;
- revisão antes da integração na `main`.

## Licença

Uma licença de código aberto ainda não foi escolhida.

Enquanto não existir um arquivo `LICENSE`, o código, a documentação, os assets e demais conteúdos permanecem com **todos os direitos reservados** e não devem ser considerados liberados para uso, modificação ou distribuição sem autorização do responsável pelo projeto.