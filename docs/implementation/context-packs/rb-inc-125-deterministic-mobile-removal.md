---
id: RB-CTX-125
title: Context Pack do RB-INC-125 — Remoção Mobile Determinística no E2E
description: Delimita a correção do flaky residual na remoção mobile de Activity.
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
  - RB-INC-125
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-121
  - RB-INC-122
prerequisites:
  - RB-INC-122
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-125 — Remoção Mobile Determinística no E2E

## Missão

Sincronizar a criação e a remoção da Activity pelo contrato observável das Server
Actions, sem alterar comportamento da aplicação ou mascarar o flaky.

## Evidência

- issue: #289;
- run: `31530544328`;
- cenário: remoção de Activity em mobile Chromium;
- resultado: Activity criada ainda não renderizada; cenário aprovado no retry.

## Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible e `docs/README.md`;
3. RB-QA-001 e RB-CICD-001;
4. RB-ADR-010;
5. RB-INC-121 e RB-INC-122.

## Caminhos permitidos

```text
apps/web/e2e/itinerary.spec.ts
docs/implementation/increments/rb-inc-125-deterministic-mobile-removal.md
docs/implementation/context-packs/rb-inc-125-deterministic-mobile-removal.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Restrições

- não alterar domínio, aplicação, UI, banco ou Server Action;
- não aumentar timeout, retry ou workers;
- não adicionar sleep ou quarentena;
- preservar todas as assertions posteriores;
- exigir duas execuções completas sem flaky annotation.

## Validação

Executar os comandos obrigatórios e duas matrizes completas no mesmo SHA.
