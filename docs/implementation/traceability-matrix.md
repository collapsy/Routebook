---
id: RB-IMP-004
title: Matriz de Rastreabilidade da Implementação
description: Mantém a ligação entre requisitos, decisões, incrementos, issues, código, testes, pull requests e evidências do RouteBook.
document_type: implementation-governance
owner: Delivery
status: Published
version: "1.0.0"
created: "2026-07-28"
last_updated: "2026-07-28"
authors:
  - RouteBook Team
tags:
  - implementation
  - traceability
  - quality
  - governance
related_documents:
  - RB-IMP-001
  - RB-IMP-002
  - RB-IMP-003
  - RB-QA-001
  - RB-GOV-002
prerequisites:
  - RB-IMP-001
next_documents:
  - RB-INC-000
  - RB-INC-001
  - RB-INC-002
  - RB-INC-003
ai_context:
  priority: high
  index: true
---

# RB-IMP-004 — Matriz de Rastreabilidade da Implementação

## Matriz

| Incremento | Requisito/decisão | Issue | Branch/PR | Caminhos | Testes/evidências | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| RB-INC-000 | RB-DEL-001, RB-DEV-001, RB-CICD-001 | #2 | `chore/rb-inc-000-readiness`, PR #3 | documentação, templates e validação | 111 documentos registrados, 0 avisos | Integrado |
| RB-INC-001 | RB-ADR-002, RB-ADR-003, RB-ADR-004, RB-ADR-010, RB-ADR-011, RB-ADR-019 | #4 | `feature/rb-inc-001-monorepo-bootstrap`, PR #5 | workspace, `apps/web`, configurações compartilhadas e CI | frozen install, format, docs, lint, typecheck, componente, dev smoke, build e E2E | Integrado |
| RB-INC-002 | RB-DEL-001, RB-UX-001, RB-UX-003, RB-UX-004, RB-UX-005, RB-UX-006, RB-DS-001, RB-DS-002 | #6 | `feature/rb-inc-002-product-shell`, PR #7 | landing, product shell, Minhas Viagens e estados globais | 3 testes de componente e 14 E2E | Integrado |
| RB-INC-003 | RB-DOM-001, RB-DOM-003, RB-ARC-004, RB-DATA-001, RB-DATA-002, RB-ADR-005, RB-ADR-006 | #8 | `feature/rb-inc-003-trip-creation`, PR #9 | `trip-management`, database, migration, formulário, listagem e CI PostgreSQL | 4 testes de domínio, 3 de componente, migration PostGIS, build e 14 E2E persistentes | Integrado |

## Evidências do RB-INC-003

| Evidência | Localização/resultado |
| --- | --- |
| definição publicada | `docs/implementation/increments/rb-inc-003-trip-creation.md`, versão `1.0.0` |
| agregado e invariantes | `modules/trip-management/src/trip.ts` |
| porta de repositório | `modules/trip-management/src/repository.ts` |
| schema e adapter | `packages/database/src/schema.ts` e `packages/database/src/trip-repository.ts` |
| migration | `packages/database/drizzle/0000_create_trips.sql`, aplicada em PostGIS 17 |
| criação | `apps/web/app/viagens/nova/actions.ts` e `apps/web/components/trip-form.tsx` |
| leitura | `apps/web/app/viagens/page.tsx` e `apps/web/components/trip-card.tsx` |
| ambiente local | `compose.yaml` e `.env.example` |
| testes de domínio | 4 aprovados |
| testes de componente | 3 aprovados |
| testes E2E | 14 aprovados em desktop Chromium e Pixel 7 |
| quality gates | frozen install, format, docs, lint, typecheck, migration, dev smoke, build e Playwright aprovados |
| rastreabilidade | issue #8 e PR #9 |

## Cadeia mínima

```text
Requisito ou decisão
→ Incremento
→ Issue
→ Branch e commits
→ Pull request
→ Testes
→ Evidência
→ Estado final
```

## Manutenção

Ao concluir um incremento:

1. confirme os documentos realmente utilizados;
2. registre issue e PR;
3. indique caminhos efetivamente alterados;
4. registre comandos e resultados reais;
5. atualize o estado;
6. crie novas linhas para pendências que se tornaram incrementos independentes.
