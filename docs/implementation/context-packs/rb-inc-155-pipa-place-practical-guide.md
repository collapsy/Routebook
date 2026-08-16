---
id: RB-CTX-155
title: Context Pack do RB-INC-155 — Guia Prático por Lugar em Pipa
description: Delimita o enriquecimento editorial dos 30 detalhes de Place sem introduzir dado volátil, Provider ou mudança canônica.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors: [RouteBook Team]
tags: [implementation, context-pack, pipa, place, guide, sources]
related_documents: [RB-INC-155, RB-CORE-0004, RB-INC-137, RB-INC-143, RB-INC-153, RB-INC-154]
prerequisites: [RB-INC-137, RB-INC-153, RB-INC-154]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-155 — Guia Prático por Lugar em Pipa

## 1. Missão do executor

Tornar cada detalhe publicado de Pipa útil para planejamento antes da viagem sem
inventar precisão, converter orientação em estado canônico ou simular dado atual.

## 2. Incremento

- ID: `RB-INC-155`;
- issue: `#359`;
- branch: `codex/rb-inc-155-pipa-place-practical-guide`;
- baseline: `c46fdd1c190a0ad20d69cf19c6df00a17019c51e`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/development/frontend-architecture-and-engineering-standards.md`;
5. `docs/implementation/increments/rb-inc-155-pipa-place-practical-guide.md`;
6. `docs/implementation/increments/rb-inc-137-pipa-catalog-coverage.md`;
7. `docs/implementation/increments/rb-inc-143-place-images.md`;
8. `docs/implementation/increments/rb-inc-153-pipa-operational-guide.md`;
9. `docs/implementation/increments/rb-inc-154-integrated-place-count.md`.

## 4. Contratos preservados

- orientação não é dado em tempo real;
- duração sugerida não é reserva de Itinerary;
- Place permanece canônico e inalterado;
- Place externo permanece não publicado;
- distância geodésica não é rota;
- falha ou ausência editorial não bloqueia o detalhe;
- M8 não recebe evidência inferida.

## 5. Fontes e freshness

Fontes institucionais permitidas para praias e natureza:

- `https://tibaudosul.rn.gov.br/o-municipio/turismo-e-lazer/`;
- `https://visitbrasil.com/location/pipa-pt/`.

Estabelecimentos usam o catálogo publicado como base editorial e devem instruir
confirmação atual pela ação de mapa/fotos. Não persistir horário, preço ou avaliação.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados no RB-INC-155.

## 7. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @routebook/web exec vitest run lib/pipa-place-guide.test.ts
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/place-details.spec.ts
```

Documentation Validation e Engineering Validation devem concluir no mesmo SHA.

## 8. Proibições

- não criar migration, secret, SDK ou Provider;
- não persistir dado volátil como atual;
- não apresentar duração como garantia;
- não declarar observação de fauna como certa;
- não alterar imagens ou Provenance de mídia;
- não alterar ranking, Recommendation ou Itinerary;
- não concluir M8 com este conteúdo editorial.

## 9. Handoff

Relatar cobertura dos 30 slugs, comportamento visual, testes, fontes, data de revisão,
CI, issue e PR. Merge e Production exigem autorizações humanas separadas.
