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
  - RB-INC-004
  - RB-INC-005
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
| RB-INC-004 | RB-PRD-004, RB-UX-001, RB-UX-002, RB-UX-003, RB-DOM-001, RB-DOM-003 | #11 | `feature/rb-inc-004-trip-overview`, PR #12 | consulta por TripId, visão inicial, Dias derivados e estados da rota | 5 testes de domínio, 4 de componente, build e 14 E2E persistentes | Integrado |
| RB-INC-005 | RB-PRD-004, RB-DOM-001, RB-DOM-003, RB-ARC-004, RB-DATA-001, RB-DATA-002 | #13 | `feature/rb-inc-005-traveler-context`, PR pendente | `traveler-profile`, migration, formulário de contexto e resumo na visão inicial | evidências pendentes dos workflows definitivos | Em execução |
| RB-INC-038 | RB-FR-097–103, RB-BR-REC-002–011, RB-BR-DEC-002–007 | #83 | `feature/rb-inc-038-recommendation-core`, PR #88 | `modules/decision-intelligence`, Recommendation e Context Snapshot | run 30577548188, job 90989479708, SHA cc4d36d | Verde em Draft |
| RB-INC-039 | RB-FR-097–103, RB-BR-REC-002–011 | #84 | `feature/rb-inc-039-deterministic-recommendations`, PR #89 | geração determinística, Reasons, Limitations, score e Confidence | run 30578729497, job 90993423544, SHA a6037c1 | Verde em Draft |
| RB-INC-040 | RB-BR-REC-002–011, RB-ARC-004, RB-DATA-001, RB-DATA-002 | #85 | `feature/rb-inc-040-recommendation-persistence`, PR #90 | repository, schema, migration 0007, adapter e lifecycle | run 30580262262, job 90998461192, SHA 190ebd9 | Verde em Draft |
| RB-INC-041 | RB-FR-097–103, RB-BR-REC-002–011, RB-UX-001–006, RB-DS-002–003 | #86 | `feature/rb-inc-041-recommendations-experience`, PR #91; integração PR #93 | rota contextual, cards, composição e ação Ignorar | run 30589831270, SHA fb4b46e | Integrado |
| RB-INC-042 | RB-BR-REC-002–011, RB-BR-DEC-002–007, RB-DOM-001–004 | #87 | `feature/rb-inc-042-recommendation-decisions`, PR #94 | Decision persistida, salvar Lugar e adicionar ao Roteiro com aprovação explícita | run 30674788792, SHA cad3b2b | Integrado |
| RB-INC-043 | RB-FR-105, RB-FR-107–110, RB-BR-PCF-001–008, RB-DOM-001–004 | #96; correção #98 | `feature/rb-inc-043-planning-conflict-core`, PR #97; integração PR #94; correção PR #99 | `planning-assurance`, detecção, migrations 0010–0011, persistência e alinhamento canônico | run 30674788792; PR #99, SHA 1b45de1 | Integrado |
| RB-INC-044 | RB-FR-105, RB-FR-107–110, RB-SCR-010, RB-UF-021, RB-INT-070–074 | #100 | `codex/rb-inc-044-planning-conflicts-experience`, PR #101 | Revisão contextual, read model, filtros e estados | runs 30677382538 e 30677382583, SHA 53f32dc | Integrado |
| RB-INC-045 | RB-FR-111, RB-BR-PCF-002–006, RB-SCR-010, RB-INT-073 | #102 | `codex/rb-inc-045-ignore-planning-risk`, PR #103; integração PR #105 | `IgnorePlanningRisk`, Decision explícita, estado `ignored` e confirmação acessível | runs 30679499852 e 30679499853, SHA 848dd96 | Integrado |
| RB-INC-046 | RB-BR-PCF-003, RB-BR-PCF-006, RB-SCR-010, RB-INT-073 | #104 | `codex/rb-inc-046-ignored-risk-history`, PR #105 | histórico auditável de riscos ignorados e Decisions correlacionadas | runs 30679499852 e 30679499853, SHA 848dd96 | Integrado |
| RB-INC-047 | RB-QA-001, RB-CICD-001, RB-ADR-010 | #106 | `codex/rb-inc-047-deterministic-e2e`, PR #107 | contratos E2E observáveis sem ordem interna ou evento de navegação | run diagnóstico 30680751411; evidências verdes pendentes | Em execução |

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

## Evidências do RB-INC-004

| Evidência | Localização/resultado |
| --- | --- |
| definição publicada | `docs/implementation/increments/rb-inc-004-trip-overview.md`, versão `1.0.0` |
| consulta de domínio | `modules/trip-management/src/repository.ts` e `src/service.ts` |
| derivação dos Dias | `modules/trip-management/src/trip-days.ts` |
| adapter por identidade | `packages/database/src/trip-repository.ts` |
| visão inicial | `apps/web/app/viagens/[tripId]/page.tsx` |
| estados da rota | `apps/web/app/viagens/[tripId]/{loading,error,not-found}.tsx` |
| navegação | `apps/web/components/trip-card.tsx` |
| testes de domínio | 5 aprovados |
| testes de componente | 4 aprovados |
| testes E2E | 14 aprovados em desktop Chromium e Pixel 7 |
| quality gates | frozen install, format, docs, lint, typecheck, migration, dev smoke, build e Playwright aprovados |
| rastreabilidade | issue #11 e PR #12 |

## Evidências previstas do RB-INC-005

| Evidência | Localização |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-005-traveler-context.md` |
| agregado e invariantes | `modules/traveler-profile/src/profile.ts` |
| porta e serviços | `modules/traveler-profile/src/repository.ts` e `src/service.ts` |
| schema e adapter | `packages/database/src/schema.ts` e `src/traveler-profile-repository.ts` |
| migration | `packages/database/drizzle/0001_create_traveler_profiles.sql` |
| configuração | `apps/web/app/viagens/[tripId]/contexto` e `apps/web/components/traveler-context-form.tsx` |
| resumo | `apps/web/app/viagens/[tripId]/page.tsx` |
| testes | `modules/traveler-profile/src/profile.test.ts` e `apps/web/e2e/product-shell.spec.ts` |

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
