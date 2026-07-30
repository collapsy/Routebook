---
id: RB-INC-038
title: Núcleo de Recommendation e Context Snapshot
description: Define o incremento que ativa o núcleo de domínio de Recommendations contextualizadas e seu ciclo de vida inicial.
document_type: implementation-increment
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-07-30"
last_updated: "2026-07-30"
authors:
  - RouteBook Team
tags:
  - implementation
  - decision-intelligence
  - recommendation
  - context-snapshot
  - domain
related_documents:
  - RB-CORE-0004
  - RB-PRD-006
  - RB-PRD-007
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-ARC-002
  - RB-DEL-001
  - RB-IMP-001
  - RB-IMP-003
  - RB-IMP-004
prerequisites:
  - RB-INC-037
next_documents:
  - RB-INC-039
ai_context:
  priority: critical
  index: true
---

# RB-INC-038 — Núcleo de Recommendation e Context Snapshot

## Estado

`Draft`

Issue: [#83](https://github.com/collapsy/Routebook/issues/83)

Branch: `feature/rb-inc-038-recommendation-core`

## Resultado vertical

O RouteBook passa a possuir um núcleo de domínio capaz de representar uma Recommendation contextualizada, explicável e rastreável, sem gerar ranking, persistir dados ou alterar silenciosamente Place, Saved Place, Preferences ou Itinerary.

## Problema

A documentação canônica define Recommendation, Decision, Decision Context Snapshot, Reasons, Limitations, Score, Confidence e estados de ciclo de vida, mas o código ainda não possui um bounded context executável que preserve essas distinções.

Sem esse núcleo, uma implementação posterior poderia:

- confundir Recommendation com Decision;
- apresentar score como avaliação ou confiança;
- aceitar uma sugestão inválida;
- perder o contexto que justificou a recomendação;
- acoplar regras de domínio ao banco ou à interface.

## Hipótese

Uma fundação de domínio pequena, explícita e imutável reduz o risco de automações silenciosas e permite que a geração determinística seja construída sobre contratos verificáveis.

## Decisões humanas registradas

1. Decision Intelligence será ativado como módulo próprio, coerente com o bounded context canônico e seu ownership independente.
2. Recommendation e Decision permanecem agregados distintos.
3. O alvo inicial é um Place publicado, referenciado por identidade e DestinationId.
4. RecommendationScore é exclusivamente interno e distinto de RecommendationConfidence.
5. RecommendationConfidence é qualitativa e representa completude e qualidade do Contexto conhecido, nunca certeza.
6. Toda Recommendation personalizada possui DecisionContextSnapshot versionado e minimizado.
7. Uma Recommendation somente pode ser apresentada quando possui ao menos um RecommendationReason.
8. Aceitação exige referência a uma Decision explícita.
9. Nenhuma dependência de Drizzle, Next.js ou React será permitida no núcleo.

## Escopo

- workspace `@routebook/decision-intelligence`;
- `Recommendation` e `RecommendationId`;
- `RecommendationStatus` com estados `generated`, `presented`, `accepted`, `rejected`, `expired`, `invalidated` e `superseded`;
- `DecisionContextSnapshot` com schema version, TripId, DestinationId e versões contextuais conhecidas;
- `RecommendationReason` e evidência conhecida;
- `RecommendationLimitation`;
- `RecommendationScore` interno;
- `RecommendationConfidence` qualitativa;
- `RecommendationValidity`;
- alvo inicial `Place`;
- metadados de geração;
- factories e transições imutáveis;
- erros de validação e transição;
- testes unitários de domínio.

## Invariantes

1. toda Recommendation possui identidade própria;
2. toda Recommendation personalizada possui Context Snapshot;
3. o snapshot possui versão de schema e não copia dados pessoais desnecessários;
4. o alvo inicial referencia um Place publicado no mesmo Destino do snapshot;
5. uma Recommendation apresentada possui ao menos um motivo;
6. score e confiança são tipos e conceitos distintos;
7. transições preservam o agregado original;
8. estados terminais não retornam a estados ativos;
9. Recommendation expirada, invalidada ou superseded não pode ser aceita;
10. aceitar exige DecisionId explícito;
11. rejeitar altera somente o estado da Recommendation;
12. nenhuma operação deste incremento modifica outro agregado.

## Critérios de aceite

- [ ] toda Recommendation possui identidade própria;
- [ ] toda Recommendation personalizada possui Context Snapshot;
- [ ] uma Recommendation apresentada possui ao menos um motivo;
- [ ] score e confiança são tipos e conceitos distintos;
- [ ] alvo inicial é um Place publicado;
- [ ] o módulo não importa Drizzle, Next.js ou React;
- [ ] factories e operações são imutáveis;
- [ ] transições inválidas são rejeitadas;
- [ ] Recommendations expiradas, invalidadas ou substituídas não podem ser aceitas;
- [ ] aceitação exige DecisionId;
- [ ] testes cobrem invariantes, estados e transições;
- [ ] frozen install, documentação, formatação, lint, typecheck, testes, build e Playwright permanecem verdes.

## Estratégia de testes

### Domínio

- criação, identidade e normalização;
- snapshot obrigatório e versionado;
- Place publicado e Destino compatível;
- apresentação com e sem motivo;
- score separado de confiança;
- transições válidas;
- transições inválidas;
- expiração, invalidação e substituição;
- rejeição;
- aceitação somente com Decision;
- imutabilidade profunda observável.

### Regressão

O workflow permanente `Engineering Validation` executará a regressão integral do monorepo, inclusive migrations anteriores, componentes, smoke, build e Playwright desktop/mobile.

## Caminhos permitidos

```text
modules/decision-intelligence/**
pnpm-lock.yaml
pnpm-workspace.yaml
docs/implementation/increments/rb-inc-038-recommendation-core.md
docs/implementation/context-packs/rb-inc-038-recommendation-core.md
docs/implementation/traceability-matrix.md
docs/registry.md
README.md
```

## Caminhos somente leitura

```text
modules/traveler-profile/**
modules/place-catalog/**
modules/saved-places/**
modules/trip-management/**
modules/geo-distance/**
packages/database/**
apps/web/**
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/quality/**
docs/delivery/**
```

## Fora de escopo

- banco, schema ou migration;
- RecommendationRepository;
- geração, pesos ou ranking;
- interface web;
- Decision persistida;
- alteração de Place, Saved Place, Preferences ou Itinerary;
- IA, LLM, embeddings, busca vetorial ou Provider externo;
- analytics, filas, jobs ou cache.

## Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| redefinir conceitos canônicos | nomes e invariantes derivados diretamente de RB-DOM-001 a RB-DOM-003 |
| score exposto como qualidade | tipo nominal e contrato interno sem presenter público |
| snapshot excessivo | armazenar apenas identidades, versões e critérios conhecidos |
| acoplamento de infraestrutura | workspace sem dependências de banco ou web |
| transição silenciosa | operações explícitas com validação de estado |

## Rollback

O incremento não altera banco nem estado persistido. O rollback consiste em reverter os commits do módulo e da documentação, sem migration corretiva.

## Evidências

Serão registradas após o workflow documental e o workflow final do incremento.