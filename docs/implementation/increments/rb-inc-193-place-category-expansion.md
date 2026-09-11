---
id: RB-INC-193
title: Pontos turísticos e mirantes como categorias de Place
description: Alinha a implementação de Place Category ao domínio canônico, distinguindo atrações turísticas e mirantes de Natureza na Discovery.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-11"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, places, categories, discovery, overture, filters, destination-agnostic]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-003, RB-INC-132, RB-INC-142, RB-INC-170, RB-INC-192, RB-CTX-193]
prerequisites: [RB-INC-192]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-193 — Pontos turísticos e mirantes como categorias de Place

## 1. Objetivo

Ampliar a taxonomia implementada de `Place Category` para que a Discovery diferencie **Pontos turísticos** e **Mirantes** de **Natureza**, preservando filtros, busca, reconciliação, fallback visual e a política fail-closed para categorias externas desconhecidas.

Issue: `#459`.

Branch: `codex/rb-inc-193-place-category-expansion`.

Base empilhada: RB-INC-192 / PR `#457` @ `aabca06180776dc4d7ddeb8002ac1d476743d9a9`.

Este incremento é sibling do RB-INC-191 / PR `#458`: não altera Proposal e pode avançar em paralelo sobre a mesma stack de mídia.

## 2. Autoridade de domínio

RB-DOM-001 já define `attraction` e `viewpoint` entre as categorias iniciais de Lugar. RB-DOM-002 define `Place` como um ponto de interesse e `Place Category` como classificação funcional.

Portanto:

- `attraction` e `viewpoint` não são conceitos novos de domínio;
- este incremento alinha a implementação atual, hoje restrita a `beach`, `gastronomy`, `nature` e `nightlife`, ao domínio já publicado;
- `Pontos interessantes` não será criado como categoria, pois todo `Place` já representa um ponto de interesse e a categoria ficaria semanticamente genérica;
- apesar de RB-DOM-001 admitir múltiplas categorias conceituais, este incremento preserva o contrato atual de uma categoria canônica principal por `Place`; migrar para classificação multivalorada fica fora de escopo.

## 3. Problema

O ACL atual de Overture converte:

- `tourist_attraction` em `nature`;
- `viewpoint` em `nature`;
- `scenic_viewpoint` em `nature`.

Isso mistura funções distintas. Uma atração urbana, monumento ou ponto turístico não é necessariamente Natureza; um mirante possui intenção própria de descoberta e pode ser relevante mesmo em contexto urbano.

A stack atual já prioriza `basic_category` / `taxonomy.primary` e usa o campo legado apenas como fallback. A mudança deste incremento é, portanto, de classificação canônica e apresentação, não uma nova integração de Provider.

## 4. Taxonomia alvo

A implementação passa a reconhecer, nesta ordem canônica preservando as categorias existentes:

```text
beach       -> Praias
gastronomy  -> Gastronomia
nature      -> Natureza
nightlife   -> Vida noturna
attraction  -> Pontos turísticos
viewpoint   -> Mirantes
```

Mapeamento Overture explícito adicional:

```text
tourist_attraction -> attraction
viewpoint           -> viewpoint
scenic_viewpoint    -> viewpoint
```

Continuam em `nature`:

- `park`;
- `nature_reserve`;
- `lagoon`;
- `waterfall`;
- `botanical_garden`;
- `hiking_area`.

Categorias externas sem ACL explícito continuam sem categoria canônica e falham fechadas.

## 5. UX

- filtros exibem **Pontos turísticos** e **Mirantes** somente quando a cobertura real da viagem contém essas categorias;
- pesquisa textual encontra os novos rótulos de categoria;
- cards preservam fotografia real governada quando disponível;
- quando não houver fotografia, cada nova categoria possui fallback visual local e explicitamente ilustrativo;
- consumidores de apresentação que exibem `PlaceCategory` recebem rótulos explícitos para as duas novas categorias, sem alterar decisão, salvamento, atividade ou proposta;
- nenhuma categoria vazia é exibida apenas por existir no domínio;
- nenhuma mudança de navegação, ranking ou densidade visual é introduzida.

## 6. Escopo

- ampliar `PlaceCategory` com `attraction` e `viewpoint`;
- atualizar ACL Overture;
- atualizar rótulos e filtros da Discovery;
- atualizar fallback visual por categoria;
- cobrir novas categorias com testes unitários e de interface;
- preservar compatibilidade do ranking existente atribuindo às novas categorias os mesmos pesos neutros já usados por `nature`, sem recalibrar a fórmula ou alterar sua semântica;
- reconciliar consumidores exaustivos de `PlaceCategory` em qualidade e apresentação, incluindo queries de Provider e rótulos de cards/páginas, sem alterar regras de Recommendation, Saved Place, Activity ou Proposal;
- registrar a aderência no glossário de domínio sem criar conceito novo;
- documentação, Registry e rastreabilidade do incremento.

## 7. Fora de escopo

- categoria genérica `interesting` / `Pontos interessantes`;
- adicionar Cultura, Compras, Serviços, Tours ou Transporte neste incremento;
- transformar `Place.category` em coleção multivalorada;
- recalibrar ranking, pesos ou fórmula de qualidade;
- alterar lógica de Recommendation, Saved Place, Activity ou Proposal; ajustes de compatibilidade de rótulo/consulta exigidos pela expansão exaustiva de `PlaceCategory` são permitidos;
- publicar automaticamente candidatos externos;
- alterar Provider, billing, secrets ou Provenance — apenas ampliar as queries existentes por categoria nos adapters já configurados;
- migration de banco — `places.category` já é `varchar`;
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
apps/web/public/category-illustrations/attraction.svg
apps/web/public/category-illustrations/viewpoint.svg
apps/web/e2e/place-discovery-filters.spec.ts
docs/domain/ubiquitous-language.md
docs/implementation/increments/rb-inc-193-place-category-expansion.md
docs/implementation/context-packs/rb-inc-193-place-category-expansion.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

`place-quality.ts` e seu teste foram incluídos após o primeiro Engineering Validation revelar um consumidor exaustivo de `PlaceCategory`. A correção é estritamente de compatibilidade: `attraction` e `viewpoint` herdam os pesos atuais de `nature`; não há nova decisão de ranking.

O Engineering Validation seguinte revelou oito consumidores exaustivos adicionais na camada web. Eles foram incluídos somente para completar queries/rótulos de categoria e permitir que `attraction`/`viewpoint` atravessem as superfícies existentes. Nenhuma regra de decisão, estado de Saved Place, Activity ou Proposal foi alterada.

Arquivo adicional indispensável exige registro prévio neste incremento e justificativa na PR.

## 9. Critérios de aceite

- [ ] `PlaceCategory` aceita `attraction` e `viewpoint` sem migration;
- [ ] `tourist_attraction` é normalizado para `attraction`;
- [ ] `viewpoint` e `scenic_viewpoint` são normalizados para `viewpoint`;
- [ ] Natureza mantém apenas as categorias naturais explicitamente mapeadas neste recorte;
- [ ] categoria desconhecida continua sem conversão silenciosa;
- [ ] Discovery oferece Pontos turísticos e Mirantes apenas quando presentes nos resultados;
- [ ] busca textual encontra os novos rótulos;
- [ ] fallback visual das novas categorias é distinto, local e explicitamente ilustrativo;
- [ ] fotografia governada continua prevalecendo sobre fallback;
- [ ] novas categorias recebem pesos de compatibilidade iguais aos de `nature`, sem recalibração de ranking;
- [ ] consumidores exaustivos da web exibem/consultam as novas categorias sem alterar regras de Recommendation, Saved Place, Activity ou Proposal;
- [ ] nenhuma migration, novo Provider, secret ou billing é adicionado;
- [ ] testes de domínio/ACL/UI passam;
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] PR permanece Draft até reconciliação com a stack corrente e aceite.

## 10. Testes obrigatórios

- `Place`: criação/validação das duas novas categorias;
- ACL: attraction, viewpoint, scenic viewpoint e categoria desconhecida;
- filtros: ordem canônica, disponibilidade real, busca por rótulo e filtragem das novas categorias;
- ilustração: `attraction` e `viewpoint` expõem categoria/fallback sem simular fotografia;
- qualidade: novas categorias são calculáveis com os pesos de compatibilidade de `nature`, sem alterar pesos existentes;
- typecheck de todos os consumidores exaustivos de `PlaceCategory` na web;
- E2E: filtros continuam responsivos e categorias vazias não aparecem;
- regressão das quatro categorias anteriores;
- `pnpm docs:validate`;
- lint, typecheck, testes, build e E2E pelo Engineering Validation.

## 11. Riscos e mitigação

**Taxonomia externa ampla:** somente três mappings novos são autorizados; nenhum ancestral genérico vira categoria canônica automaticamente.

**Quebra de consumidores exaustivos:** `Record<PlaceCategory, ...>` e switches devem falhar em typecheck até receberem tratamento explícito. O primeiro pipeline encontrou `CATEGORY_WEIGHTS` em `place-quality.ts`; o pipeline seguinte revelou oito consumidores web de query/rótulo. Todos são tratados de forma explícita para evitar fallback silencioso.

**Conflito com trabalho paralelo:** a branch parte de RB-INC-192 e não modifica arquivos do RB-INC-191. `docs/registry.md` pode exigir reconciliação textual posterior.

**Semântica de ponto de interesse:** não criar `interesting` evita sobreposição com o próprio conceito `Place`.

## 12. Rollback

Reverter os novos valores, ACL, rótulos, assets, pesos de compatibilidade, queries e documentação. Nenhum dado ou schema é alterado por migration. Places materializados como `attraction`/`viewpoint` durante um Preview devem permanecer governados pela mesma política de rascunho e não serão removidos automaticamente.
