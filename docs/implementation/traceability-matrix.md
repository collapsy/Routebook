---
id: RB-IMP-004
title: Matriz de Rastreabilidade da Implementação
description: Mantém a ligação entre requisitos, decisões, incrementos, issues, código, testes, pull requests e evidências do RouteBook.
document_type: implementation-governance
owner: Delivery
status: Published
version: "1.0.0"
created: "2026-07-28"
last_updated: "2026-08-02"
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
| RB-INC-004 | RB-PRD-004, RB-DOM-001, RB-DOM-003, RB-ARC-004, RB-DATA-001, RB-DATA-002 | #11 | `feature/rb-inc-004-trip-overview`, PR #12 | consulta por TripId, visão inicial, Dias derivados e estados da rota | 5 testes de domínio, 4 de componente, build e 14 E2E persistentes | Integrado |
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
| RB-INC-047 | RB-QA-001, RB-CICD-001, RB-ADR-010 | #106 | `codex/rb-inc-047-deterministic-e2e`, PR #107; integração PR #109 | contratos E2E observáveis sem ordem interna ou evento de navegação | run diagnóstico 30680751411; runs 30683233275 e 30683233272 (attempts 1 e 2), SHA 7c5d144 | Integrado |
| RB-INC-048 | RB-FR-087–096, RB-BR-PRP-002–010, RB-DOM-001–004, RB-ARC-002 | #108 | `codex/rb-inc-048-itinerary-proposal-request`, PR #109 | núcleo de solicitação e geração inicial de Itinerary Proposal | runs 30683233275 e 30683233272 (attempts 1 e 2), SHA 7c5d144 | Integrado |
| RB-INC-049 | RB-BR-PRP-002–010, RB-ARC-002, RB-DATA-001–002, RB-ADR-006 | #110 | `codex/rb-inc-049-proposal-persistence`, PR #111; integração acumulada PR #115 | port, migration 0013, adapter Drizzle e round trip do ciclo inicial | runs 30684401975 e 30684401943, SHA 51fa84a | Integrado |
| RB-INC-050 | RB-BR-PRP-002–010, RB-DOM-001–004, RB-ARC-002 | #112 | `codex/rb-inc-050-proposal-commands`, PR #113; integração acumulada PR #115 | comandos de aplicação para request, start, fail e cancel | runs 30685658798 e 30685658797 (tentativas 1 e 2), SHA 7d89f58 | Integrado |
| RB-INC-051 | RB-QA-001, RB-CICD-001, RB-ADR-010 | #114 | `codex/rb-inc-051-deterministic-e2e-fixtures`, PR #115 | fixtures controladas e navegação observável para períodos livres, Lugar salvo e conflitos | run diagnóstico 30684760010; runs finais 30686369423 e 30686369420 (tentativas 1 e 2), SHA ca7beb8 | Integrado |
| RB-INC-052 | RB-API-001, RB-DOM-001–004, decisão #118 | #119 | `codex/rb-inc-052-ready-contract`, PR pendente | contrato documental de Itinerary Proposal alinhado ao estado canônico `ready` | 145 documentos validados; Prettier e diff check aprovados | Em execução |
| RB-INC-053 | RB-BR-PRP-002–010, RB-DOM-001–004, RB-DATA-001–002, decisão #118 | #121 | `codex/rb-inc-053-proposal-ready-domain`, PR pendente | conclusão de domínio `generating → ready` com conteúdo revisável | 43 testes do módulo; lint, typecheck, build, testes sem database e 147 docs aprovados | Em execução |
| RB-INC-054 | RB-BR-PRP-004–005, RB-DATA-001–002, RB-ADR-006, decisão #123 | #124 | `codex/rb-inc-054-ready-data-contract`, PR pendente | snapshot híbrido e proveniência do conteúdo `ready` | 149 documentos validados; Prettier e diff check aprovados | Em execução |
| RB-INC-055 | RB-BR-PRP-002–005, RB-DATA-001–002, RB-ADR-006, decisão #123 | #126 | `codex/rb-inc-055-ready-persistence`, PR #127 | migration, schema e round trip transacional do conteúdo `ready` | validações locais e CI completo verdes | Pronto para revisão |
| RB-INC-056 | RB-BR-PRP-002–005, RB-INC-050, RB-INC-053, RB-INC-055 | #128 | `codex/rb-inc-056-ready-command`, PR pendente | comando de conclusão e persistência de Proposal `ready` | testes e validações pendentes | Em execução |
| RB-INC-057 | RB-SCR-009, RB-INT-063–069, RB-WF-MOB-025, RB-WF-DESK-009, RB-INC-055, RB-INC-056 | #130 | `codex/rb-inc-057-ready-review`, PR #131 | revisão somente leitura da Proposal `ready` sem aplicar ao Roteiro | validações locais verdes; CI com migration, suíte integral, build e 50 E2E responsivos verdes | Pronto para revisão |
| RB-INC-058 | RB-BR-PRP-004, RB-BR-PRP-008, ciclo oficial e RB-DATA-001 | #132 | `codex/rb-inc-058-temporal-expiration`, PR #133 | expiração temporal de Proposal `ready` no domínio | 53 testes do módulo; CI com migration, suíte integral, build e 50 E2E responsivos verdes | Pronto para revisão |
| RB-INC-059 | RB-BR-PRP-004, RB-BR-PRP-008, RB-DATA-001–002, RB-ADR-006 e RB-INC-058 | #134 | `codex/rb-inc-059-expired-persistence`, PR #135 | migration, schema e round trip de Proposal `expired` com conteúdo preservado | validações locais verdes; run 30713827362 com migration, suíte integral, build e 50 E2E responsivos verdes | Pronto para integração |
| RB-INC-060 | RB-BR-PRP-004, RB-BR-PRP-008, ciclo oficial e RB-INC-056, RB-INC-058–059 | #136 | `codex/rb-inc-060-expiration-command`, PR #137 | comando de aplicação para expirar e persistir Proposal `ready` | 60 testes do módulo; run 30714407588 com migration, suíte integral, build e 50 E2E responsivos verdes | Pronto para integração |
| RB-INC-061 | RB-BR-PRP-004, RB-BR-PRP-008, RB-SCR-009, RB-INT-063–069 e RB-INC-057–060 | #138 | `codex/rb-inc-061-expired-review`, PR #139 | revisão histórica somente leitura da Proposal `expired` sem aplicação | validações locais verdes; run 30716155284 com migrations, suíte integral, build e 52 E2E responsivos verdes | Pronto para integração |
| RB-INC-062 | RB-BR-PRP-001, RB-BR-PRP-004, ciclo oficial, RB-DATA-001 e RB-INC-053 | #140 | `codex/rb-inc-062-reject-proposal`, PR #141 | transição pura de Proposal `ready` para `rejected` | validações locais verdes; run 30716780960 com migrations, suíte integral, build e 52 E2E responsivos verdes | Pronto para integração |
| RB-INC-063 | RB-BR-PRP-001, RB-BR-PRP-004, RB-DATA-001–002, RB-ADR-006 e RB-INC-055, RB-INC-062 | #142 | `codex/rb-inc-063-rejected-persistence`, PR #143 | migration, schema e round trip de Proposal `rejected` com snapshot preservado | validações locais verdes; run 30717630992 com migration, suíte integral, build e 52 E2E responsivos verdes | Pronto para integração |
| RB-INC-064 | RB-BR-PRP-001, RB-BR-PRP-004, ciclo oficial e RB-INC-050, RB-INC-060, RB-INC-062–063 | #144 | `codex/rb-inc-064-rejection-command`, PR #145 | comando de aplicação para rejeitar e persistir Proposal `ready` | 70 testes do módulo; run 30718348548 com migrations, suíte integral, build e 52 E2E responsivos verdes | Pronto para integração |
| RB-INC-065 | RB-FR-095, RB-BR-100, RB-BR-102, RB-SCR-009, RB-INT-065, RB-INT-068 e RB-INC-064 | #146 | `codex/rb-inc-065-discard-proposal-review`, PR #147 | descarte explícito da Proposal `ready` com retorno ao Roteiro preservado | 61 testes web; run 30720324642 com migrations, build e 56 E2E responsivos verdes | Pronto para integração |
| RB-INC-066 | RB-BR-PRP-001, RB-BR-PRP-004, RB-BR-PRP-006, RB-BR-PRP-008–009, ciclo oficial, RB-DATA-001 e RB-INC-053, RB-INC-058 | #148 | `codex/rb-inc-066-finalize-accepted-proposal`, PR #149 | finalização pós-aplicação de Proposal `ready` para `accepted` | 77 testes do módulo; run 30721260271 com migrations, suíte integral, build e 56 E2E responsivos verdes | Pronto para integração |
| RB-INC-067 | RB-BR-PRP-001, RB-BR-PRP-004, RB-BR-PRP-006, RB-BR-PRP-008–009, RB-DATA-001–002, RB-ADR-006 e RB-INC-055, RB-INC-066 | #150 | `codex/rb-inc-067-accepted-persistence`, PR #151 | persistência e round trip de Proposal `accepted` | validações locais verdes; run 30721948930 com migrations, suíte integral, build e 56 E2E responsivos verdes | Pronto para integração |
| RB-INC-068 | RB-BR-ITN-015–019, RB-BR-PRP-005–010, RB-ARC-002, RB-DATA-001–002 e RB-INC-066–067 | #152 | `codex/rb-inc-068-apply-proposal-items-contract`, PR #153 | contrato público `ApplyProposalItems` pertencente ao Itinerary Planning | 56 testes do módulo; run 30722787307 com migrations, suíte integral, build e 56 E2E concluídos | Pronto para integração |
| RB-INC-069 | RB-ADR-027, RB-BR-PRP-006, RB-BR-PRP-009–010, RB-DATA-001–002 e RB-INC-068 | #159 | `feature/rb-inc-069-proposal-application-core`, PR #162 | núcleo de Proposal Application, fingerprint idempotente e lifecycle auditável | runs 30725223887 e 30725223889; 180 documentos, lint, typecheck, migrations, suíte integral, build e E2E responsivo verdes | Integrado |
| RB-INC-070 | RB-ADR-027, RB-BR-ITN-015–019, RB-BR-PRP-005–010, RB-DATA-001–002 e RB-INC-068–069 | #163 | `feature/rb-inc-070-apply-proposal-items-domain`, PR #164 | aplicação pura das operações `add`, `move`, `update` e `remove` sobre cópia profunda do Itinerary | runs 30727788663 e 30727788669; 182 documentos, lint, typecheck, migrations, suíte integral, build e E2E responsivo verdes | Integrado |
| RB-INC-071 | RB-ADR-006, RB-ADR-027, RB-DATA-001–002 e RB-INC-069–070 | #165 | `feature/rb-inc-071-proposal-application-persistence`, PR #166 | migration 0018, repository PostgreSQL, reidratação, fingerprint e lifecycle idempotente | runs 30728527007 e 30728527003; migration 0018, suíte integral, build e E2E responsivo verdes | Integrado |
| RB-INC-072 | RB-ADR-027, RB-ARC-002–003 e RB-INC-068–071 | #167 | `feature/rb-inc-072-accept-itinerary-proposal-orchestration`, PR #170 | comando público, fingerprint antecipado, port transacional específico e Application Orchestrator | runs 30729353340 e 30729353334; 186 documentos, suíte integral, build e 56 E2E responsivos verdes | Integrado |
| RB-INC-073 | RB-ADR-005–006, RB-ADR-027, RB-ARC-003–004, RB-DATA-002 e RB-INC-072 | #168 | `feature/rb-inc-073-postgres-transaction-runner`, PR #171 | runner genérico de transação PostgreSQL, host estrutural e executor escopado | runs 30730017605 e 30730017612; 188 documentos, migrations, suíte integral, build e 56 E2E responsivos verdes | Integrado |
| RB-INC-074 | RB-ADR-027, RB-ARC-003–004, RB-DATA-002 e RB-INC-072–073 | #169 | `feature/rb-inc-074-itinerary-proposal-transaction-unit`, PR #172 | unidade transacional genérica, quatro factories escopadas e contexto congelado | runs 30732551083 e 30732551085; 190 documentos, migrations, suíte integral, build e 56 E2E responsivos verdes | Integrado |
| RB-INC-075 | RB-ADR-027, RB-ARC-003–004, RB-DATA-002 e RB-INC-069, RB-INC-071, RB-INC-073–074 | #173 | `feature/rb-inc-075-proposal-application-transaction-fragment`, PR #174 | fragment de reserva idempotente e conclusão terminal de Proposal Application sobre executor escopado | runs 30733685016 e 30733685015; 192 documentos, migrations, suíte integral, build e 56 E2E responsivos verdes | Integrado |
| RB-INC-076 | RB-ADR-006, RB-ADR-027, RB-ARC-003–004, RB-DATA-002 e RB-INC-055, RB-INC-067, RB-INC-073–075 | #175 | `feature/rb-inc-076-scoped-proposal-repository`, PR #176 | executor Drizzle injetado, modo global preservado e rollback externo sem nested transaction | código validado em run 30734294000; documentação e evidências finais em execução | Em execução |
| RB-INC-078 | RB-ADR-006, RB-ADR-027, RB-ARC-003–004, RB-DATA-002 e RB-INC-070, RB-INC-073–077 | #179 | `feature/rb-inc-078-itinerary-transactional-repository`, PR #180 | repository de Itinerary com executor escopado, modo global preservado e rollback externo | runs 30751388318 e 30751388307; 196 documentos, migrations, suíte integral, build e 56 E2E responsivos verdes | Integrado |
| RB-INC-079 | RB-ADR-027, RB-ARC-003–004, RB-DOM-003–004 e RB-INC-070, RB-INC-072–074, RB-INC-078 | #181 | `feature/rb-inc-079-itinerary-transaction-fragment`, PR #182 | fragment de Itinerary com leitura, validação, aplicação integral e persistência escopada | runs 30752064982 e 30752064966; 198 documentos, migrations, suíte integral, build e 56 E2E responsivos verdes | Integrado |
| RB-INC-080 | RB-ADR-006, RB-ADR-027, RB-ARC-003–004, RB-DATA-002 e RB-INC-073–074, RB-INC-076, RB-INC-078–079 | #183 | `feature/rb-inc-080-decision-transactional-repository`, PR #184 | repository de Decision com executor escopado, idempotência preservada e rollback externo | PR #184; validação em andamento | Em validação |

## Evidências do RB-INC-003

| Evidência | Localização/resultado |
| --- | --- |
| definição publicada | `docs/implementation/increments/rb-inc-003-trip-creation.md`, versão `1.0.0` |
| agregado e invariantes | `modules/trip-management/src/trip.ts` |
| porta de repositório | `modules/trip-management/src/repository.ts` |
| schema e adapter | `packages/database/src/schema.ts` e `src/trip-repository.ts` |
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
