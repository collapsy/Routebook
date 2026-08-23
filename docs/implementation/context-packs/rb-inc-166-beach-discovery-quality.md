---
id: RB-CTX-166
title: Context Pack do RB-INC-166 — Qualidade da Discovery de praias
description: Delimita a correção de classificação e identidade de praias observada no uso real de Pipa, sem ativar novo Provider nem alterar estado canônico.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-23"
last_updated: "2026-08-23"
authors: [RouteBook Team]
tags: [implementation, context-pack, place-catalog, discovery, overture, beaches, taxonomy, deduplication]
related_documents: [RB-INC-166, RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-142, RB-INC-148, RB-INC-156, RB-INC-162, RB-INC-163, RB-INC-164, RB-INC-136]
prerequisites: [RB-INC-142, RB-INC-156, RB-INC-164]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-166 — Qualidade da Discovery de praias

## 1. Missão

Corrigir o feedback de uso real de 23/08/2026: ao filtrar `Praias`, mostrar somente candidatos compatíveis com praia e apenas uma representação por identidade, sem fundir praias vizinhas distintas.

## 2. Unidade de trabalho

- issue: `#388`;
- branch: `codex/rb-inc-166-beach-discovery-quality`;
- baseline: `21a0ca5521f507c8c2b3264a7303155417c1cfdf`;
- Preview Vercel é o ambiente de aceite;
- imagens de maior cobertura permanecem em `#382 / RB-INC-167` e dependem de gate humano de Provider.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/architecture/integrations-and-ports.md`;
5. `docs/architecture/adrs/rb-adr-012-google-maps-platform-as-initial-geospatial-provider.md`;
6. RB-INC-142, 148, 156, 162, 163, 164 e este incremento.

## 4. Contratos preservados

- `Place` publicado continua canônico;
- `ExternalPlaceCandidate` continua candidato read-only até promoção explícita;
- Overture continua Provider de descoberta e Provenance factual;
- categoria externa só vira categoria canônica por ACL explícito;
- `linked` continua evidência de identidade mais forte;
- `possible_match` não cria vínculo automaticamente;
- proximidade geográfica não prova identidade isoladamente;
- lista e mapa representam o mesmo read model deduplicado;
- falha Overture degrada para catálogo publicado;
- Wikimedia continua mídia opcional e fail-closed;
- Google Places Photos não é ativado neste incremento.

## 5. Taxonomia autorizada

`beach` é uma categoria semântica concreta, não uma categoria agregadora de qualquer POI relacionado à orla.

Política:

- mapeamento direto conhecido pode retornar `beach`;
- fallback por `providerCategoryHierarchy` não pode produzir `beach` quando a categoria direta não é mapeada como praia;
- fallback por hierarquia pode continuar retornando `gastronomy`, `nightlife` ou `nature` quando o ACL possui ancestral explicitamente suportado;
- categoria sem mapeamento permanece sem `PlaceCategory`.

## 6. Identidade autorizada de praia

Para `category = beach`, a comparação pode remover descritores equivalentes `praia`, `beach` e `playa` e comparar a âncora nominal restante.

Exemplos de mesma identidade quando próximos:

- `Praia do Madeiro` ↔ `Madeiro Beach`;
- `Praia de Pipa` ↔ `Pipa Beach`.

Exemplos que devem continuar distintos:

- `Praia do Amor` ↔ `Praia do Centro`;
- `Madeiro` ↔ `Cacimbinhas`;
- dois itens apenas próximos, sem âncora nominal compartilhada.

A regra específica de praia pode manter `Pipa` como âncora nominal; isso não torna tokens regionais suficientes para identidade em outras categorias.

## 7. Caminhos permitidos

```text
modules/place-catalog/src/external-place.ts
modules/place-catalog/src/external-place.test.ts
apps/web/lib/place-discovery-feed.ts
apps/web/lib/place-discovery-feed.test.ts
apps/web/lib/overture-place-search.test.ts
apps/web/e2e/unified-place-identity.spec.ts
apps/web/e2e/place-discovery-filters.spec.ts
docs/implementation/increments/rb-inc-166-beach-discovery-quality.md
docs/implementation/context-packs/rb-inc-166-beach-discovery-quality.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Gates

`pnpm format:check`, `pnpm docs:validate`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e`.

Documentation Validation e Engineering Validation devem passar no mesmo SHA. O Preview Vercel desse SHA deve ficar READY antes do aceite humano.

## 9. Proibições

- não aprovar ou alterar silenciosamente RB-ADR-012;
- não ativar Google Places/Photos, billing ou secret;
- não alterar categorias canônicas de domínio;
- não persistir resultado de leitura Overture;
- não promover/publicar automaticamente;
- não deduplicar somente por distância;
- não usar imagem genérica para simular cobertura;
- não concluir M8 por CI;
- não integrar na `main` nem promover Production sem gate humano.

## 10. Handoff

Relatar arquivos alterados, exemplos de falsos positivos bloqueados, aliases deduplicados, testes executados, SHA/CI/Preview, riscos residuais e a pendência separada `#382 / RB-INC-167` para cobertura visual.