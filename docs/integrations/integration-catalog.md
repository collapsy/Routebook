---
id: RB-INT-001
title: Catálogo de Integrações e Providers
description: Reserva o catálogo futuro das integrações externas do RouteBook, seus contratos, ownership, dados, limites, custos, fallbacks e estratégia de saída.
document_type: planned-document
owner: Architecture
status: Planned
version: "0.1.0"
created: "2026-07-28"
last_updated: null
authors:
  - RouteBook Team
tags:
  - integrations
  - providers
  - catalog
  - planned
related_documents:
  - RB-ARC-003
  - RB-PRD-007
  - RB-API-001
  - RB-DATA-003
  - RB-SEC-001
prerequisites:
  - RB-ARC-003
next_documents: []
ai_context:
  priority: medium
  index: true
---

# RB-INT-001 — Catálogo de Integrações e Providers

## Estado

`Planned`

## Finalidade reservada

Este documento deverá registrar somente integrações realmente adotadas ou em avaliação ativa, incluindo:

- finalidade e owner;
- Provider e alternativa;
- Port e Adapter internos;
- dados enviados e recebidos;
- autorização e secrets;
- limites, quotas e custo;
- timeout, retry e idempotência;
- fallback e indisponibilidade;
- observabilidade;
- privacidade, termos e licença;
- estratégia de saída.

## Gate de elaboração

O catálogo será detalhado quando o primeiro incremento integrar um serviço externo. A existência de ADR de Provider não significa provisionamento automático.