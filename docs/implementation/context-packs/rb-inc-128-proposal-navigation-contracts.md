---
id: RB-CTX-128
title: Context Pack do RB-INC-128 — Contratos de Navegação de Proposal
description: Delimita a remoção dos waits frágeis residuais no spec de revisão de Proposal.
document_type: implementation-context-pack
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, quality, playwright]
related_documents: [RB-INC-128, RB-QA-001, RB-CICD-001, RB-ADR-010, RB-INC-122, RB-INC-127]
prerequisites: [RB-INC-127]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-128 — Contratos de Navegação de Proposal

## Missão

Substituir waits frágeis por redirects e destinos declarados sem mudar a aplicação.

## Caminhos permitidos

```text
apps/web/e2e/itinerary-proposal-review.spec.ts
docs/implementation/increments/rb-inc-128-proposal-navigation-contracts.md
docs/implementation/context-packs/rb-inc-128-proposal-navigation-contracts.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Restrições

- não alterar aplicação, domínio, banco ou UI;
- não aumentar timeout ou retry;
- não usar sleep ou quarentena;
- preservar assertions e persistência.

## Validação

Executar validações locais e duas matrizes completas sem flaky annotation.
