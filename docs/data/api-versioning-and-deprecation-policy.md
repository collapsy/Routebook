---
id: RB-API-003
title: Versionamento e Depreciação de APIs
description: Reserva a política futura de compatibilidade, versionamento, depreciação, sunset e migração dos contratos de API do RouteBook.
document_type: planned-document
owner: Architecture
status: Planned
version: "0.1.0"
created: "2026-07-28"
last_updated: null
authors:
  - RouteBook Team
tags:
  - api
  - versioning
  - deprecation
  - planned
related_documents:
  - RB-API-001
  - RB-API-002
  - RB-GOV-002
  - RB-ADR-026
prerequisites:
  - RB-API-001
next_documents: []
ai_context:
  priority: medium
  index: true
---

# RB-API-003 — Versionamento e Depreciação de APIs

## Estado

`Planned`

## Finalidade reservada

Este documento deverá definir:

- regras de compatibilidade;
- tipos de mudança breaking e non-breaking;
- estratégia de versionamento;
- comunicação de depreciação;
- período de suporte e sunset;
- migração de consumidores;
- telemetria de uso;
- exceções e aprovação.

## Gate de elaboração

A política será detalhada quando houver contrato consumido por mais de um cliente, módulo ou integração externa. Até lá, mudanças permanecem governadas por ADRs e pull requests.