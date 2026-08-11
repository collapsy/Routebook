---
id: RB-CTX-126
title: Context Pack do RB-INC-126 — Navegação Determinística do Conflito
description: Delimita a correção da navegação E2E por âncora para o dia afetado.
document_type: implementation-context-pack
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, quality, playwright]
related_documents: [RB-INC-126, RB-QA-001, RB-CICD-001, RB-ADR-010, RB-INC-122, RB-INC-125]
prerequisites: [RB-INC-125]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-126 — Navegação Determinística do Conflito

## Missão

Validar e carregar o destino acessível do link sem depender de evento de load opcional.

## Caminhos permitidos

```text
apps/web/e2e/planning-conflicts.spec.ts
docs/implementation/increments/rb-inc-126-deterministic-conflict-navigation.md
docs/implementation/context-packs/rb-inc-126-deterministic-conflict-navigation.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Restrições

- não alterar aplicação, domínio, banco ou UI;
- não aumentar timeout ou retry;
- não usar sleep ou quarentena;
- preservar assertions de navegação, conteúdo e retorno.

## Validação

Executar validações estáticas e duas matrizes completas sem flaky annotation.
