---
id: RB-CTX-120
title: Context Pack do RB-INC-120 — Geração de Proposal E2E Sincronizada
description: Delimita a correção da sincronização E2E da geração de Itinerary Proposal.
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
  - RB-INC-120
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-119
prerequisites:
  - RB-INC-119
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-120 — Geração de Proposal E2E Sincronizada

## Missão

Sincronizar a geração pelo POST e pela URL observáveis sem alterar o comportamento
da Proposal ou do Itinerary.

## Evidência

- issue: #278;
- run: `31516435515`;
- cenário: geração com Recommendation elegível em desktop Chromium;
- resultado: cenário aprovado somente após retry.

## Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible e `docs/README.md`;
3. RB-QA-001, determinismo, E2E e flaky tests;
4. RB-CICD-001, pipeline determinístico e flaky tests;
5. RB-ADR-010, Playwright, auto-waiting e flaky tests;
6. RB-INC-118 e RB-INC-119.

## Caminhos permitidos

```text
apps/web/e2e/itinerary-proposal-generation.spec.ts
docs/implementation/increments/rb-inc-120-deterministic-proposal-generation.md
docs/implementation/context-packs/rb-inc-120-deterministic-proposal-generation.md
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
