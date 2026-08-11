---
id: RB-CTX-118
title: Context Pack do RB-INC-118 — Sincronização Determinística Pós-Server Action no E2E
description: Delimita a correção de duas esperas Playwright frágeis sem alterar produto, configuração ou tolerâncias.
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
  - flakiness
related_documents:
  - RB-INC-118
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-047
  - RB-INC-051
prerequisites:
  - RB-INC-117
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-118 — Sincronização Determinística Pós-Server Action no E2E

## Missão

Sincronizar os dois cenários flaky pela resposta POST observável da submissão,
preservando todos os resultados já exigidos pelos testes.

## Evidência

- issue: #274;
- run: `31513286871`;
- resultado: 79 passed e 2 flaky aprovados por retry;
- specs: `free-period.spec.ts` e `itinerary-proposal-review.spec.ts`.
- run da primeira correção: `31514212266`, com os casos originais estáveis e um
  novo flaky de mesma causa no descarte concorrente de Proposal.

## Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. RB-QA-001, determinismo, isolamento, E2E e Parte XXV;
5. RB-CICD-001, pipelines determinísticos e flaky tests;
6. RB-ADR-010, fixtures, Playwright, auto-waiting e flaky tests;
7. RB-INC-047 e RB-INC-051.

## Caminhos permitidos

```text
apps/web/e2e/free-period.spec.ts
apps/web/e2e/itinerary-proposal-review.spec.ts
docs/implementation/increments/rb-inc-118-deterministic-server-action-e2e.md
docs/implementation/context-packs/rb-inc-118-deterministic-server-action-e2e.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Caminhos proibidos

```text
apps/web/playwright.config.ts
apps/web/app/**
apps/web/components/**
modules/**
packages/**
.github/workflows/**
```

## Regras

- registrar `waitForResponse` antes de disparar o click;
- identificar a submissão por método POST e pathname atual;
- não interpretar o status do redirect como sucesso ou falha;
- preservar assertions posteriores e erro explícito da decisão;
- não aumentar timeout, retry ou workers;
- não adicionar sleep nem serialização.

## Validação

Executar os comandos obrigatórios do incremento e duas execuções consecutivas do
Engineering Validation no mesmo SHA, sem flaky annotation.
