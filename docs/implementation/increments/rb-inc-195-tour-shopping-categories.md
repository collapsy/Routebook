---
id: RB-INC-195
title: Passeios e compras como categorias de Place
description: Alinha a implementação de Place Category ao domínio canônico, adicionando Passeios e Compras à Discovery de forma explícita e fail-closed.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-11"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, places, categories, discovery, overture, filters, destination-agnostic]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-003, RB-INC-132, RB-INC-142, RB-INC-170, RB-INC-193, RB-CTX-195]
prerequisites: [RB-INC-193]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-195 — Passeios e compras como categorias de Place

## 1. Objetivo

Ampliar a taxonomia implementada de `Place Category` para que a Discovery diferencie **Passeios** e **Compras**, preservando filtros, busca, reconciliação, fallback visual e a política fail-closed para categorias externas desconhecidas.

Issue: `#462`.

Branch: `codex/rb-inc-195-tour-shopping-categories`.

Base empilhada: RB-INC-193 / PR `#461` @ `0bae04d47b7378a9612a4219173ce508d4eb7558`.

RB-INC-194 / issue `#460` trata freshness e identidade live e permanece fora deste incremento.

## 2. Autoridade de domínio

RB-DOM-001 já lista `tour` e `shopping` entre as categorias iniciais de Lugar. RB-DOM-002 define `Place Category` como classificação funcional e explicita que Categoria de Lugar não significa Tipo de Atividade.

Portanto:

- `tour` e `shopping` não são conceitos novos de domínio;
- `tour` representa a classificação funcional de um Lugar associado a passeios/tours, não uma `Activity` já planejada;
- `shopping` representa a classificação funcional de um Lugar de compras;
- museus, sítios históricos e atrações culturais não ganham uma nova categoria `culture` neste incremento;
- `Place.category` permanece uma categoria canônica principal singular.

## 3. Evidência de taxonomia externa

A documentação oficial do Overture para a taxonomia nova recomenda `basic_category` para filtragem de alto nível e preserva `taxonomy.hierarchy` para generalização.

O material de mapeamento oficial confirma:

- subclasses como `architectural_tours` e `food_tours` usam `tour_operator` como basic category e hierarquia de `tour`;
- `shopping_center` usa `shopping_mall` como basic category;
- `farmers_market` é categoria explícita sob a hierarquia de Shopping/Market.

Este incremento não mapeia automaticamente os ancestrais genéricos `travel`, `travel_and_transportation` ou `shopping`.

## 4. Taxonomia alvo

A ordem canônica passa a ser:

```text
beach       -> Praias
gastronomy  -> Gastronomia
nature      -> Natureza
nightlife   -> Vida noturna
attraction  -> Pontos turísticos
viewpoint   -> Mirantes
tour        -> Passeios
shopping    -> Compras
```

Mapeamentos Overture explícitos adicionais autorizados:

```text
tour_operator   -> tour
shopping_mall   -> shopping
market          -> shopping
farmers_market  -> shopping
```

Categorias externas sem ACL explícito continuam sem categoria canônica e falham fechadas.

## 5. UX

- filtros exibem **Passeios** e **Compras** somente quando a cobertura real da viagem contém essas categorias;
- pesquisa textual encontra os novos rótulos;
- cards preservam fotografia real governada quando disponível;
- quando não houver fotografia, cada nova categoria possui fallback visual local e explicitamente ilustrativo;
- consumidores de apresentação que exibem `PlaceCategory` recebem rótulos explícitos sem alterar regras de decisão, salvamento, atividade ou proposta;
- nenhuma categoria vazia é exibida apenas por existir no domínio.

## 6. Escopo

- ampliar `PlaceCategory` com `tour` e `shopping`;
- atualizar o ACL Overture somente com mappings explícitos autorizados;
- atualizar rótulos e filtros da Discovery;
- atualizar fallback visual por categoria;
- cobrir novas categorias com testes unitários e de interface;
- preservar compatibilidade do ranking existente com pesos explícitos conservadores, sem recalibrar a fórmula;
- reconciliar consumidores exaustivos de `PlaceCategory` em qualidade e apresentação;
- criar Increment, Context Pack e registro documental.

## 7. Fora de escopo

- criar `culture`, `museum`, `services`, `activity` ou `interesting`;
- classificar qualquer descendente de Shopping ou Travel apenas pelo ancestral genérico;
- transformar `Place.category` em coleção multivalorada;
- recalibrar ranking ou criar fórmula específica para `tour`/`shopping`;
- alterar lógica de Recommendation, Saved Place, Activity ou Proposal;
- publicar automaticamente candidatos externos;
- adicionar Provider, billing, secret ou migration;
- Production;
- merge na `main` sem gate humano.

## 8. Caminhos autorizados

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

Arquivo adicional indispensável exige registro prévio neste incremento e justificativa na PR.

## 9. Critérios de aceite

- [ ] `PlaceCategory` aceita `tour` e `shopping` sem migration;
- [ ] `tour_operator` é normalizado para `tour`;
- [ ] `shopping_mall`, `market` e `farmers_market` são normalizados para `shopping`;
- [ ] categoria desconhecida continua sem conversão silenciosa;
- [ ] Discovery oferece Passeios e Compras apenas quando presentes nos resultados;
- [ ] busca textual encontra os novos rótulos;
- [ ] fallback visual das novas categorias é distinto, local e explicitamente ilustrativo;
- [ ] fotografia governada continua prevalecendo sobre fallback;
- [ ] ranking permanece determinístico com pesos de compatibilidade explícitos;
- [ ] consumidores exaustivos da web exibem/consultam as novas categorias sem alterar regras de Recommendation, Saved Place, Activity ou Proposal;
- [ ] nenhuma migration, novo Provider, secret ou billing é adicionado;
- [ ] testes de domínio/ACL/UI passam;
- [ ] Documentation, Overture Place Discovery e Engineering Validation passam no mesmo SHA;
- [ ] PR permanece Draft até reconciliação com a stack corrente e aceite.

## 10. Testes obrigatórios

- `Place`: criação/validação das duas novas categorias;
- ACL: mappings autorizados e categoria desconhecida;
- filtros: ordem canônica, disponibilidade real, busca por rótulo e filtragem das novas categorias;
- ilustração: `tour` e `shopping` expõem fallback sem simular fotografia;
- qualidade: novas categorias são calculáveis sem alterar pesos existentes;
- typecheck dos consumidores exaustivos de `PlaceCategory` na web;
- E2E: filtros continuam responsivos e categorias vazias não aparecem;
- regressão das seis categorias anteriores;
- `pnpm docs:validate`;
- lint, typecheck, testes, build e E2E pelo Engineering Validation.

## 11. Riscos e mitigação

**Taxonomia externa ampla:** mappings ficam limitados a basic categories/categorias verificadas e semanticamente inequívocas. Ancestrais amplos não são convertidos automaticamente.

**Tour não é Activity:** `tour` é Categoria de Lugar. Adicionar esse Lugar ao Roteiro continua sendo uma decisão separada.

**Quebra de consumidores exaustivos:** `Record<PlaceCategory, ...>` e objetos indexados por categoria devem falhar em typecheck até receberem tratamento explícito.

**Stack empilhada:** a branch depende do RB-INC-193; não deve ser integrada isoladamente antes da base.

## 12. Rollback

Reverter novos valores, ACL, rótulos, assets, pesos de compatibilidade, queries e documentação. Nenhum dado ou schema é alterado por migration.
