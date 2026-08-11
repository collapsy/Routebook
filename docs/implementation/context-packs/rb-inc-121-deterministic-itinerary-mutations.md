---
id: RB-CTX-121
title: Context Pack do RB-INC-121 — Mutações do Roteiro E2E Sincronizadas
description: Delimita a correção da sincronização E2E das mutações do roteiro.
document_type: implementation-context-pack
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - quality
  - playwright
related_documents:
  - RB-INC-121
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-120
prerequisites:
  - RB-INC-120
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-121 — Mutações do Roteiro E2E Sincronizadas

## Missão

Sincronizar as mutações pelo POST e pelo resultado renderizado sem alterar o
comportamento do Itinerary.

## Evidência

- issue: #280;
- run: `31517303193`;
- cenário: movimentação de atividade em mobile Chromium;
- resultado: URL anterior ainda observada após o POST; cenário aprovado no retry.

## Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible e `docs/README.md`;
3. RB-QA-001, determinismo, E2E e flaky tests;
4. RB-CICD-001, pipeline determinístico e flaky tests;
5. RB-ADR-010, Playwright, auto-waiting e flaky tests;
6. RB-INC-120.

## Caminhos permitidos

```text
apps/web/e2e/itinerary.spec.ts
docs/implementation/increments/rb-inc-121-deterministic-itinerary-mutations.md
docs/implementation/context-packs/rb-inc-121-deterministic-itinerary-mutations.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Restrições

- não alterar domínio, aplicação, UI, banco ou Server Action;
- não aumentar timeout, retry ou workers;
- não adicionar sleep;
- preservar todas as assertions posteriores;
- exigir duas execuções completas sem flaky annotation.

## Validação

Executar os comandos obrigatórios e duas matrizes completas no mesmo SHA.
