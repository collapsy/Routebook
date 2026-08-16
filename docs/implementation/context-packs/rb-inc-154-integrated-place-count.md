---
id: RB-CTX-154
title: Context Pack do RB-INC-154 — Contagem Integrada de Places e Descobertas
description: Delimita a correção de apresentação da cobertura total de Discovery sem alterar catálogo, reconciliação ou Provider.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors: [RouteBook Team]
tags: [implementation, context-pack, discovery, overture, count, ux]
related_documents: [RB-INC-154, RB-CORE-0004, RB-INC-139, RB-INC-153]
prerequisites: [RB-INC-139, RB-INC-153]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-154 — Contagem Integrada de Places e Descobertas

## 1. Missão do executor

Corrigir a percepção de limite em 30 Places mostrando a soma da cobertura visível,
sem transformar candidato externo em Place publicado nem alterar o significado do mapa.

## 2. Incremento

- ID: `RB-INC-154`;
- issue: `#357`;
- branch: `codex/rb-inc-154-integrated-place-count`;
- baseline: `1d222addb87912ca229bee16290e90af46e6282e`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/increments/rb-inc-154-integrated-place-count.md`;
5. `docs/implementation/increments/rb-inc-153-pipa-operational-guide.md`;
6. `docs/implementation/context-packs/rb-inc-153-pipa-operational-guide.md`;
7. `docs/implementation/increments/rb-inc-139-accommodation-proximity.md`.

## 4. Contratos preservados

- Place externo não é Place canônico;
- o mapa canônico representa somente a lista publicada;
- a soma inclui somente itens efetivamente exibidos;
- falha do Overture não bloqueia catálogo;
- distância continua identificada como geodésica;
- M8 não recebe evidência inferida deste ajuste.

## 5. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados no RB-INC-154.

## 6. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/place-discovery-filters.spec.ts e2e/accommodation-proximity.spec.ts
```

A Engineering Validation e a Documentation Validation devem concluir no mesmo SHA.

## 7. Proibições

- não alterar limite, raio ou algoritmo de reconciliação;
- não publicar candidato por leitura;
- não inserir candidato externo no mapa canônico;
- não criar migration, secret ou Provider;
- não fixar em teste a quantidade variável do Overture;
- não apresentar descoberta como conteúdo curado.

## 8. Handoff

Relatar comportamento, arquivos, testes, CI, quantidade externa variável, issue e PR.
Merge e Production continuam exigindo autorizações humanas separadas.

