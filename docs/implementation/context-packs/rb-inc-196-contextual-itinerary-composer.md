---
id: RB-CTX-196
title: Context Pack do RB-INC-196 — Compositor contextual inteligente de Proposta de Roteiro
description: Delimita a evolução determinística da Itinerary Proposal para composição por proximidade, categoria, Hospedagem e diversidade, preservando o pipeline autoritativo existente.
document_type: implementation-context-pack
owner: Proposal Management and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-11"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, itinerary-proposal, contextual-composition, routebook-anywhere]
related_documents: [RB-INC-196, RB-CORE-0004, RB-DOM-001, RB-DOM-003, RB-ARC-003, RB-INC-099, RB-INC-178, RB-INC-184, RB-INC-185, RB-INC-191]
prerequisites: [RB-INC-191]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-196 — Compositor contextual inteligente de Proposta de Roteiro

## 1. Missão

Transformar o gerador de Proposal de um balanceador de densidade em um compositor contextual determinístico, sem criar outro pipeline de Proposal e sem aplicar alterações automaticamente.

## 2. Unidade de trabalho

- issue: `#464`;
- branch: `codex/rb-inc-196-contextual-itinerary-composer`;
- base: RB-INC-191 / PR `#458` @ `9fb13431aa15fe2a42c85afc15a77929a15f4faf`;
- Production e `main` permanecem gates humanos.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004 — RouteBook Bible;
3. `docs/README.md`;
4. RB-DOM-001 — Place, Itinerary Proposal, Recommendation e Provenance;
5. RB-DOM-003 — invariantes de Itinerary/Recommendation/Proposal;
6. RB-ARC-003 — Ports and Adapters;
7. RB-INC-099 — geração autoritativa;
8. RB-INC-178 — materialização segura de Place externo;
9. RB-INC-184 — seleção contextual da Discovery;
10. RB-INC-185 — experiência provider-first;
11. RB-INC-191 — ponte Discovery → Proposal e densidade;
12. RB-INC-196 / este Context Pack.

## 4. Invariantes

- Proposal não é estado aplicado.
- Nenhum write no Itinerary antes do aceite.
- Não inventar horários, abertura, trânsito, ETA ou rota.
- Categoria e coordenadas são sinais factuais do Place, não garantia de adequação temporal.
- A ordem recebida continua sendo o sinal de relevância produzido a montante.
- `protected` Free Period continua consumindo capacidade.
- Dia intencionalmente vazio continua preservado.
- Recommendation/Discovery continuam responsáveis pela seleção de candidatos; Proposal compõe, não redescobre.
- Sem LLM/provider novo nesta versão.

## 5. Contratos a evoluir

### Candidate

`ItineraryProposalGenerationCandidate` pode receber opcionalmente:

```text
category?: string
latitude?: number
longitude?: number
```

As coordenadas devem ser informadas juntas e validadas.

### Generation input

`GenerateItineraryProposalInput` pode receber:

```text
anchorCoordinate?: { latitude: number; longitude: number }
```

A aplicação deriva essa âncora da Hospedagem quando disponível. Sem Hospedagem coordenada, o campo é omitido.

### Source Place

O assembler autoritativo deve carregar categoria e coordenadas de Places referenciados por Recommendations, para que candidatos canônicos e Discovery usem os mesmos sinais provider-neutral.

## 6. Política de escolha por slot

O compositor continua respeitando `DETERMINISTIC_DESIRED_ACTIVITY_COUNT_PER_DAY = 3`.

Para cada candidato, a distribuição antiga por menor densidade deixa de ser suficiente. A composição deve construir os Dias de forma estável e avaliar candidatos elegíveis por:

1. capacidade do Dia;
2. relevância original;
3. proximidade à última atividade contextual daquele Dia;
4. na ausência de última atividade com coordenada, proximidade à Hospedagem quando disponível;
5. diversidade de categoria no Dia;
6. complementaridade: `gastronomy`/`nightlife` recebem penalidade quando já dominam o Dia e bônus leve quando complementam uma experiência principal;
7. desempate por posição original e `candidateId`.

Não usar distância como falsa rota. A métrica é geodésica e interna ao score.

## 7. Fallback compatível

Se nenhum candidato possuir categoria/coordenada e não houver âncora, preservar o resultado legado do balanceamento por densidade e ordem de candidatos.

## 8. Metadados Discovery

`loadItineraryProposalDiscoveryCandidates` deve copiar `Place.category`, `latitude` e `longitude` do Place materializado. Não usar dados crus do Provider depois da materialização para compor a Proposal.

## 9. Metadados Recommendation

O contexto PostgreSQL deve carregar `places.category`, `places.latitude` e `places.longitude` para `ItineraryProposalSourcePlace`. O assembler deve propagar esses valores ao Candidate.

## 10. Hospedagem

A ação web de geração já possui a `Trip`. Quando `trip.accommodation.coordinate` existir, repassar a coordenada ao serviço de geração sem persistir um novo conceito na Proposal.

## 11. Justificativas e limitações

Critérios/justificativas podem dizer que a composição considerou proximidade espacial, diversidade de categorias e referência da Hospedagem somente quando cada sinal esteve disponível.

Limitações devem continuar deixando claro que não foram consultados horário de funcionamento, trânsito ou rota viária.

## 12. Caminhos permitidos

```text
modules/proposal-management/src/deterministic-itinerary-proposal-generator.ts
modules/proposal-management/src/deterministic-itinerary-proposal-generator.test.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.test.ts
packages/database/src/authoritative-itinerary-proposal-generation-context.ts
packages/database/src/authoritative-itinerary-proposal-generation-context-postgres.test.ts
apps/web/lib/itinerary-proposal-discovery-candidates.ts
apps/web/lib/itinerary-proposal-discovery-candidates.test.ts
apps/web/lib/itinerary-proposal-generation.ts
apps/web/lib/itinerary-proposal-generation.test.ts
apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts
apps/web/e2e/itinerary-proposal-generation.spec.ts
docs/implementation/increments/rb-inc-196-contextual-itinerary-composer.md
docs/implementation/context-packs/rb-inc-196-contextual-itinerary-composer.md
docs/registry.md
```

## 13. Testes mínimos

- pares de candidatos próximos ficam agrupados quando a capacidade permite;
- alternativa de categoria reduz repetição excessiva;
- gastronomia complementa uma experiência principal;
- nightlife não domina slots iniciais quando há outras categorias;
- Hospedagem coordenada influencia primeiro agrupamento espacial;
- sem metadados → fallback legado determinístico;
- input inválido com somente latitude ou longitude falha;
- Recommendations propagam metadados do Place;
- Discovery propagada usa Place materializado;
- Itinerary permanece intacto antes do aceite;
- E2E zero-seed contém mais de uma Activity em pelo menos um Dia quando há candidatos suficientes.

## 14. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 15. Proibições

- não inferir abertura/horário;
- não chamar serviço de rota/trânsito;
- não introduzir IA generativa nesta versão;
- não mudar lifecycle de Proposal;
- não mudar RecommendationTarget;
- não tocar Production;
- não fazer merge em `main` sem autorização humana.
