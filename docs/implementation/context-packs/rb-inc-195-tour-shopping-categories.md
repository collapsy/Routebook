---
id: RB-CTX-195
title: Context Pack do RB-INC-195 — Passeios e compras
description: Delimita a expansão de Place Category para Passeios e Compras com ACL Overture explícito e compatibilidade exaustiva.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-11"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, places, categories, discovery, overture]
related_documents: [RB-INC-195, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-003, RB-INC-132, RB-INC-142, RB-INC-170, RB-INC-193]
prerequisites: [RB-INC-193]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-195 — Passeios e compras

## 1. Missão

Adicionar `tour` e `shopping` à taxonomia executável de Place sem criar nova semântica de domínio, sem inferência ampla sobre a taxonomia externa e sem interferir no trabalho de freshness/identidade live do RB-INC-194.

## 2. Unidade de trabalho

- issue: `#462`;
- branch: `codex/rb-inc-195-tour-shopping-categories`;
- base: RB-INC-193 / PR `#461` @ `0bae04d47b7378a9612a4219173ce508d4eb7558`;
- paralelo: RB-INC-194 / issue `#460`;
- Production permanece fora de escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/domain/domain-model.md`;
5. `docs/domain/ubiquitous-language.md`;
6. `docs/architecture/integrations-and-ports.md`;
7. RB-INC-132;
8. RB-INC-142;
9. RB-INC-170;
10. RB-INC-193;
11. RB-INC-195.

## 4. Fatos canônicos

- `Place Category` é classificação funcional de um Lugar e não Tipo de Atividade;
- RB-DOM-001 já lista `tour` e `shopping` entre categorias iniciais;
- a base RB-INC-193 já implementa `beach`, `gastronomy`, `nature`, `nightlife`, `attraction` e `viewpoint`;
- `places.category` é `varchar`, portanto a expansão não exige migration;
- filtros são derivados das categorias efetivamente presentes;
- fotografia governada continua tendo precedência sobre ilustração;
- `CATEGORY_WEIGHTS` e mapas `Record<PlaceCategory, ...>`/objetos indexados por categoria são consumidores exaustivos;
- a stack já prioriza `basic_category`, depois `taxonomy.primary`, com `taxonomy.hierarchy` disponível para reconciliação explícita.

## 5. Decisão de classificação

Mapeamentos autorizados:

```text
tour_operator   -> tour
shopping_mall   -> shopping
market          -> shopping
farmers_market  -> shopping
```

Rótulos:

```text
tour     -> Passeios
shopping -> Compras
```

Não mapear automaticamente `travel`, `travel_and_transportation` ou `shopping` como ancestrais genéricos. Categoria externa desconhecida continua `undefined`.

Museus e atrações culturais permanecem sob a taxonomia já existente de `attraction` neste incremento.

## 6. Compatibilidade Overture

A documentação oficial do Overture confirma `tour_operator` como basic category de subclasses de tours, `shopping_mall` para shopping centers e `farmers_market` como categoria explícita dentro da hierarquia de Shopping/Market.

Este incremento não muda parsing de PMTiles, protocolo de acesso nem Provider. Altera apenas o ACL explícito.

## 7. Ranking

Não recalibrar a fórmula. `tour` e `shopping` recebem pesos de compatibilidade conservadores já existentes, escolhidos explicitamente no código para manter comportamento determinístico até existir incremento específico de ranking por categoria.

## 8. Contratos preservados

- busca externa não escreve no catálogo;
- candidato sem categoria canônica suportada não é promovido silenciosamente;
- categoria não altera identidade por si só;
- filtro só aparece com cobertura real;
- `tour` não cria Activity nem compromisso de roteiro;
- regras de Recommendation, Saved Place, Activity e Proposal permanecem inalteradas;
- nenhum novo Provider, secret, billing ou migration.

## 9. Caminhos permitidos

```text
modules/place-catalog/src/place.ts
modules/place-catalog/src/place.test.ts
modules/place-catalog/src/external-place.ts
modules/place-catalog/src/external-place.test.ts
modules/place-catalog/src/place-quality.ts
modules/place-catalog/src/place-quality.test.ts
apps/web/app/api/internal/place-quality-probe/route.ts
apps/web/app/viagens/[tripId]/lugares/filters.ts
apps/web/app/viagens/[tripId]/lugares/filters.test.ts
apps/web/app/viagens/[tripId]/lugares-salvos/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/components/category-illustration.tsx
apps/web/components/category-illustration.test.tsx
apps/web/components/contextual-recommendation-strip.tsx
apps/web/components/recommendation-card.tsx
apps/web/lib/place-quality-provider.ts
apps/web/lib/recommendation-discovery-suggestions.ts
apps/web/public/category-illustrations/tour.svg
apps/web/public/category-illustrations/shopping.svg
apps/web/e2e/place-discovery-filters.spec.ts
docs/implementation/increments/rb-inc-195-tour-shopping-categories.md
docs/implementation/context-packs/rb-inc-195-tour-shopping-categories.md
docs/registry.md
```

## 10. Testes esperados

- aceitação de `tour` e `shopping` no domínio;
- ACL Overture exato para mappings autorizados;
- categoria desconhecida permanece sem mapping;
- filtros e busca pelos novos rótulos;
- filtros ausentes sem cobertura;
- fallbacks ilustrativos para as duas categorias;
- cálculo de qualidade determinístico;
- typecheck dos consumidores exaustivos;
- docs validation;
- lint, typecheck, unit/integration, build e E2E aplicáveis.

## 11. Proibições

- não criar `culture`, `museum`, `activity`, `services` ou `interesting`;
- não converter `Place.category` para array;
- não mapear ancestrais genéricos inteiros;
- não recalibrar ranking;
- não alterar regras de Recommendation, Saved Place, Activity ou Proposal;
- não introduzir migration;
- não ativar Production;
- não integrar na `main` sem decisão humana.

## 12. Handoff

Relatar issue, branch, SHA, arquivos alterados, mappings efetivos, pesos de compatibilidade, consumidores reconciliados, testes, CI e dependência da PR #461.
