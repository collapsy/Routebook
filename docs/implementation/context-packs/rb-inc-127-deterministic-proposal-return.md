---
id: RB-CTX-127
title: Context Pack do RB-INC-127 — Retorno Determinístico da Revisão de Proposal
description: Delimita a correção E2E do retorno da Proposal ao Roteiro.
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
  - RB-INC-127
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-122
  - RB-INC-125
  - RB-INC-126
prerequisites:
  - RB-INC-126
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-127 — Retorno Determinístico da Revisão de Proposal

## Missão

Validar e carregar o destino do link sem depender de evento de load opcional.

## Caminhos permitidos

```text
apps/web/e2e/itinerary-proposal-review.spec.ts
docs/implementation/increments/rb-inc-127-deterministic-proposal-return.md
docs/implementation/context-packs/rb-inc-127-deterministic-proposal-return.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Restrições

- não alterar aplicação, domínio, banco ou UI;
- não aumentar timeout ou retry;
- não usar sleep ou quarentena;
- preservar assertions de URL e conteúdo.

## Validação

Executar validações estáticas e duas matrizes completas sem flaky annotation.
