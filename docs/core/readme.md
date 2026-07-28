---
id: RB-CORE-0001
title: RouteBook README Canônico
description: Define a porta de entrada constitucional do RouteBook, a fonte de verdade, a hierarquia documental e o estado oficial do projeto.
document_type: core
owner: Foundation
status: Published
version: "1.0.0"
created: "2026-07-28"
last_updated: null
authors:
  - RouteBook Team
tags:
  - core
  - foundation
  - documentation
  - ai-first
related_documents:
  - RB-CORE-0002
  - RB-CORE-0003
  - RB-CORE-0004
  - RB-DOC-001
prerequisites: []
next_documents:
  - RB-CORE-0002
ai_context:
  priority: critical
  index: true
---

# RB-CORE-0001 — RouteBook README Canônico

## Propósito

Este documento resolve e formaliza o identificador `RB-CORE-0001`, utilizado por documentos históricos do RouteBook.

A apresentação pública e operacional do projeto permanece no [`README.md`](../../README.md). Este documento define como essa entrada deve ser interpretada e mantida.

## Fonte oficial de verdade

O repositório `collapsy/Routebook` é a fonte canônica do produto.

Uma decisão somente é oficial quando registrada em documentação versionada, ADR, issue, commit ou pull request.

Conversas, prompts, memórias de agentes, protótipos externos e documentos não versionados não substituem o repositório.

## Hierarquia documental

```text
RB-CORE-0004 — RouteBook Bible
→ Foundation e Product
→ Domain
→ UX e Design System
→ Architecture e ADRs
→ Delivery, Quality e Operations
→ Incremento e Context Pack
→ Implementação
```

Uma camada inferior não pode contradizer silenciosamente uma camada superior.

## Estado oficial

A documentação inicial está publicada. A aplicação executável ainda será implementada por incrementos verticais governados.

O primeiro cenário real de validação é Pipa (RN), entre **22 e 29 de agosto de 2026**.

## Entradas obrigatórias

- [`../../README.md`](../../README.md);
- [`../README.md`](../README.md);
- [`../registry.md`](../registry.md);
- [`routebook-bible.md`](./routebook-bible.md);
- [`../implementation/README.md`](../implementation/README.md);
- [`../../AGENTS.md`](../../AGENTS.md).

## Manutenção

O README raiz deve refletir o estado real do repositório, não um roadmap já concluído. Mudanças de visão, escopo, arquitetura ou governança devem atualizar os documentos canônicos correspondentes antes ou no mesmo incremento.