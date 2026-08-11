---
id: RB-CTX-131
title: Context Pack do RB-INC-131 — Deduplicação de Place em Proposal
description: Delimita a exclusão de Recommendations cujos Places já estão presentes no Roteiro autoritativo.
document_type: implementation-context-pack
owner: Proposal Management and Data
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, proposal-management, data, mvp]
related_documents: [RB-INC-131, RB-CORE-0004, RB-PRD-002, RB-ARC-001, RB-ARC-003, RB-DOM-002, RB-DEL-001, RB-QA-001, RB-INC-129, RB-INC-130]
prerequisites: [RB-INC-130]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-131 — Deduplicação de Place em Proposal

## Missão

Garantir que o contexto autoritativo de geração não ofereça como candidato um Place
já materializado no Roteiro, sem ampliar contratos de Domain nem usar heurísticas.

## Caminhos permitidos

```text
packages/database/src/authoritative-itinerary-proposal-generation-context.ts
packages/database/src/authoritative-itinerary-proposal-generation-context-postgres.test.ts
apps/web/e2e/itinerary-proposal-generation.spec.ts
docs/implementation/increments/rb-inc-131-proposal-place-deduplication.md
docs/implementation/context-packs/rb-inc-131-proposal-place-deduplication.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Restrições

- comparar apenas a identidade persistida de Place;
- não deduplicar por nome, coordenada ou similaridade;
- não alterar o contrato público de geração;
- preservar o isolamento entre Proposal e Roteiro;
- manter decisão e aplicação explícitas.

## Critérios de aceite

Os oito critérios do RB-INC-131 devem ser comprovados por testes e smoke produtivo.

## Validação

Executar integração PostgreSQL, E2E de Proposal, validações locais completas,
documentação, CI e smoke em Production.
