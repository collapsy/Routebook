---
id: RB-API-002
title: Catálogo de Contratos de API
description: Reserva o catálogo futuro de endpoints, operações, schemas, erros, autorização e exemplos de integração das APIs do RouteBook.
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
  - contracts
  - catalog
  - planned
related_documents:
  - RB-API-001
  - RB-DOM-001
  - RB-ARC-003
  - RB-DATA-001
prerequisites:
  - RB-API-001
next_documents:
  - RB-API-003
ai_context:
  priority: medium
  index: true
---

# RB-API-002 — Catálogo de Contratos de API

## Estado

`Planned`

## Finalidade reservada

Este documento deverá catalogar contratos públicos e internos realmente implementados, incluindo:

- operação e finalidade;
- autorização e Account scope;
- input e output;
- schemas versionados;
- erros e códigos;
- idempotência;
- paginação e filtros;
- exemplos sanitizados;
- ownership e consumidores.

## Gate de elaboração

O catálogo será detalhado quando o primeiro incremento introduzir uma API. Nenhum endpoint deve ser inventado antecipadamente apenas para preencher este documento.