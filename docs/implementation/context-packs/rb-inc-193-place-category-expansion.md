---
id: RB-CTX-193
title: Context Pack do RB-INC-193 — Expansão de categorias de Place
description: Delimita o alinhamento entre a taxonomia canônica de Place e a Discovery para Pontos turísticos e Mirantes.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-11"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, places, categories, discovery, overture]
related_documents: [RB-INC-193, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-003, RB-INC-132, RB-INC-142, RB-INC-170, RB-INC-192]
prerequisites: [RB-INC-192]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-193 — Expansão de categorias de Place

## 1. Missão

Distinguir `attraction` e `viewpoint` das categorias genéricas atuais da Discovery, sem criar nova semântica de domínio e sem interferir nos trabalhos paralelos de mídia ou Proposal.

## 2. Unidade de trabalho

- issue: `#459`;
- branch: `codex/rb-inc-193-place-category-expansion`;
- base: RB-INC-192 / PR `#457` @ `aabca06180776dc4d7ddeb8002ac1d476743d9a9`;
- sibling paralelo: RB-INC-191 / PR `#458`;
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
10. RB-INC-192;
11. RB-INC-193.

## 4. Fatos canônicos

- `Place` é um ponto de interesse com identidade global;
- `Place Category` é classificação funcional de um Place;
- RB-DOM-001 já lista `attraction` e `viewpoint` como categorias iniciais;
- o código atual aceita apenas `beach`, `gastronomy`, `nature` e `nightlife`;
- o ACL Overture atual converte `tourist_attraction`, `viewpoint` e `scenic_viewpoint` para `nature`;
- `places.category` é `varchar`, portanto a expansão não exige migration;
- a tela de Lugares deriva filtros disponíveis das categorias efetivamente presentes;
- `CategoryIllustration` é fallback visual, nunca fotografia nem dado persistido;
- fotografia governada continua tendo precedência;
- `CATEGORY_WEIGHTS` e mapas `Record<PlaceCategory, ...>`/objetos indexados por categoria são consumidores exaustivos: toda nova categoria precisa de tratamento explícito para preservar typecheck e comportamento determinístico.

## 5. Decisão de classificação

Mapeamentos autorizados:

```text
tourist_attraction -> attraction
viewpoint           -> viewpoint
scenic_viewpoint    -> viewpoint
```

Rótulos de interface:

```text
attraction -> Pontos turísticos
viewpoint  -> Mirantes
```

Não mapear por inferência ampla ancestrais de taxonomia. Categoria externa desconhecida continua `undefined`.

Para ranking, este incremento **não recalibra** a fórmula. `attraction` e `viewpoint` recebem exatamente os pesos já usados por `nature` como compatibilidade conservadora até um incremento específico de ranking justificar pesos próprios.

## 6. Compatibilidade Overture

A stack atual já normaliza categoria primária usando, em ordem:

1. `basic_category`;
2. `taxonomy.primary`;
3. `categories.primary` legado.

A hierarquia usa `taxonomy.hierarchy`. Este incremento não muda parsing de PMTiles nem protocolo de acesso; altera apenas o ACL explícito para as categorias canônicas autorizadas.

## 7. Contratos preservados

- uma busca externa não escreve no catálogo;
- candidato externo sem categoria canônica suportada não é promovido silenciosamente;
- categoria não altera identidade por si só;
- Discovery oferece apenas filtros com cobertura real;
- foto/mídia não altera categoria;
- não há recalibração de ranking neste incremento; as novas categorias apenas recebem pesos de compatibilidade equivalentes aos de `nature`;
- `Place.category` permanece singular na implementação;
- regras de Recommendation, Saved Place, Activity e Proposal permanecem inalteradas; consumidores de apresentação/consulta podem receber rótulos ou queries explícitas apenas para suportar os novos valores de `PlaceCategory`;
- nenhum novo Provider, secret, billing ou migration.

## 8. Caminhos permitidos

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

Os oito caminhos web adicionais acima foram autorizados depois que o Engineering Validation revelou consumidores exaustivos da união `PlaceCategory`. Neles, a mudança permitida limita-se a rótulos/queries de categoria e compatibilidade de apresentação; nenhuma regra de decisão ou persistência é alterada.

## 9. Testes esperados

- aceitação de `attraction` e `viewpoint` no domínio;
- ACL Overture exato para as novas categorias;
- não regressão de beach/gastronomy/nature/nightlife;
- filtro e pesquisa pelos novos rótulos;
- filtro não aparece quando não há cobertura;
- fallback ilustrativo para as duas novas categorias;
- cálculo de qualidade das novas categorias com pesos idênticos a `nature`;
- typecheck dos consumidores exaustivos de `PlaceCategory` na web;
- docs validation;
- lint, typecheck, unit/integration, build e E2E aplicáveis.

## 10. Proibições

- não criar `interesting` como categoria;
- não mapear toda atração/cultura/comércio por ancestral genérico;
- não ampliar para shopping/cultural-site/tour sem novo recorte explícito;
- não converter `Place.category` para array neste incremento;
- não recalibrar ranking ou criar pesos específicos para attraction/viewpoint;
- não alterar lógica de Recommendation, Saved Place, Activity ou Proposal; compatibilidade exaustiva de rótulo/query é permitida;
- não alterar arquivos funcionais da PR #458;
- não introduzir migration;
- não ativar Production;
- não integrar na `main` sem decisão humana.

## 11. Handoff

Relatar issue, branch, SHA, arquivos alterados, mappings efetivos, pesos de compatibilidade, consumidores exaustivos reconciliados, testes executados, resultados do CI, conflitos com a stack paralela e qualquer gate restante.
