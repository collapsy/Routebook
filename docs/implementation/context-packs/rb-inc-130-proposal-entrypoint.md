---
id: RB-CTX-130
title: Context Pack do RB-INC-130 — Entrada da Primeira Proposal
description: Delimita a correção do caminho visível entre o Roteiro e o estado vazio de Itinerary Proposal.
document_type: implementation-context-pack
owner: Experience and Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, experience, proposal-management]
related_documents: [RB-INC-130, RB-CORE-0004, RB-PRD-002, RB-DEL-001, RB-QA-001, RB-INC-129]
prerequisites: [RB-INC-129]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-130 — Entrada da Primeira Proposal

## Missão

Expor o estado vazio de Proposal pelo Roteiro, mantendo geração e aplicação como
ações humanas separadas e explícitas.

## Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/e2e/itinerary-proposal-generation.spec.ts
apps/web/e2e/itinerary-proposal-review.spec.ts
docs/implementation/increments/rb-inc-130-proposal-entrypoint.md
docs/implementation/context-packs/rb-inc-130-proposal-entrypoint.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Restrições

- não gerar nem aplicar Proposal durante navegação;
- não alterar regras, transições, persistência ou autorização;
- preservar rótulos dos estados ready e expired;
- não usar URL direta sem validar o link visível no E2E;
- não ampliar a correção para outras lacunas do MVP.

## Critérios de aceite

Os oito critérios do RB-INC-130 devem ser comprovados por testes e smoke após deploy.

## Validação

Executar validações locais completas, E2E de Proposal, documentação, CI, Preview e
smoke de Production.
