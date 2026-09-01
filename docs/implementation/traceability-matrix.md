---
id: RB-IMP-004
title: Matriz de Rastreabilidade da Implementação
description: Mantém a ligação entre requisitos, decisões, incrementos, issues, código, testes, pull requests e evidências do RouteBook.
document_type: implementation-governance
owner: Delivery
status: Published
version: "1.0.0"
created: "2026-07-28"
last_updated: "2026-08-20"
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
| RB-INC-060 | RB-BR-PRP-004, RB-BR-PRP-008, ciclo oficial e RB-INC-056, RB-INC-058–059 | #136 | `codex/rb-inc-060-expiration-command`, PR #137 | comando de aplicação para expirar e persistir Proposal `ready` | 60 testes do módulo; run 30714407588 com migrations, suíte integral, build e 50 E2E responsivos verdes | Pronto para integração |
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
| RB-INC-080 | RB-ADR-006, RB-ADR-027, RB-ARC-003–004, RB-DATA-002 e RB-INC-073–074, RB-INC-076, RB-INC-078–079 | #183 | `feature/rb-inc-080-decision-transactional-repository`, PR #184 | repository de Decision com executor escopado, idempotência preservada e rollback externo | runs 30752604088 e 30752604108; 200 documentos, migrations, suíte integral, build e 56 E2E responsivos verdes | Integrado |
| RB-INC-081 | RB-DOM-001, RB-DOM-003–004, RB-ADR-027 e RB-INC-072, RB-INC-079–080 | #185 | `feature/rb-inc-081-itinerary-proposal-acceptance-decision`, PR #186 | Decision de aceite com option, snapshot, effect e invariantes cruzadas | runs 30753442260 e 30753442266; 202 documentos, migrations, suíte integral, build e 56 E2E responsivos verdes | Integrado |
| RB-INC-082 | RB-DATA-002, RB-ADR-006, RB-ADR-027 e RB-INC-080–081 | #187 | `feature/rb-inc-082-persist-itinerary-proposal-decision`, PR #188 | check constraint e migration para persistir a Decision de aceite com round trip e rollback | PR #188; validação em andamento | Em validação |

| RB-INC-084 | RB-ADR-027, RB-ARC-003–004, RB-DATA-002 e RB-INC-072–075, RB-INC-079, RB-INC-083 | #191 | `feature/rb-inc-084-apply-itinerary-proposal-transaction`, PR #194 | composição PostgreSQL dos quatro fragments em uma única transação física | runs 30766253051 e 30766253063; migration 0019, suíte integral, smoke, build e E2E responsivo verdes | Pronto para integração |
| RB-INC-085 | RB-ARC-002–003, RB-DATA-002, RB-ADR-027 e RB-INC-072, RB-INC-084 | #195 | `feature/rb-inc-085-postgres-accept-itinerary-proposal-service`, PR #196 | composition root concreta, normalização antecipada e mapeamentos allowlisted de domínio e PostgreSQL | runs 30767412654 e 30767412648; suíte integral, PostgreSQL real, smoke, build e E2E responsivo verdes | Pronto para integração |
| RB-INC-086 | RB-SEC-001, RB-DATA-001–002, RB-ADR-007–008 e RB-INC-085 | #197 | `feature/rb-inc-086-better-auth-session-foundation`, PR #198 | Better Auth 1.6.14, schema e migration 0020, rota Next.js e resolução server-side de sessão | runs 30769434778 e 30769434775; migration 0020, PostgreSQL real, smoke, build Turbopack e E2E responsivo verdes | Pronto para integração |
| RB-INC-087 | RB-SEC-001, RB-DATA-001–002, RB-ADR-007–008 e RB-INC-085–086 | #199 | `feature/rb-inc-087-account-membership-trip-authorization`, PR #200 | Account, Membership, matriz deny-by-default e autorização PostgreSQL de Trip | runs 30770613047 e 30770613051; migration 0021, PostgreSQL real, smoke, build e E2E responsivo verdes | Pronto para integração |
| RB-INC-088 | RB-DATA-001–002, RB-ADR-007–008 e RB-INC-086–087 | #201 | `feature/rb-inc-088-personal-account-authenticated-trip`, PR #202 | vínculo pessoal um-para-um, provisioning idempotente e criação transacional de Trip escopada | runs 30771744270 e 30771744252; migration 0022, replay, concorrência, rollback, PostgreSQL real, smoke, build e E2E verdes | Pronto para integração |

| RB-INC-089 | RB-SEC-001, RB-ADR-007 e RB-INC-086–088 | #203 | `feature/rb-inc-089-server-auth-experience`, PR #204 | páginas e Server Actions de cadastro, entrada e saída, retorno seguro e sessão no App Shell | validações funcionais em execução | Em validação |
| RB-INC-090 | RB-SEC-001, RB-ADR-007–008 e RB-INC-086–089 | #205 | `feature/rb-inc-090-authenticated-trip-workspace`, PR #206 | coleção e criação autenticadas, isolamento por Account e guard `trip:view` nas páginas de Trip | runs 30860363214 e 30860363218, job 91840790462, SHA d2e5a83; 220 documentos, migrations, 507 testes, smoke, build e 65 E2E responsivos verdes | Pronto para integração |
| RB-INC-091 | RB-SEC-001, RB-ADR-007–008, RB-ADR-027 e RB-INC-085, RB-INC-087, RB-INC-090 | #207 | `feature/rb-inc-091-authorized-proposal-acceptance-action`, PR #208 | Server Action autorizada, ator e itens derivados de dados autoritativos, mapeamento `applied` e `replay` | runs 30863272217 e 30863272221, job 91849613822, SHA 526ce22; migrations, testes de domínio, componentes e PostgreSQL, smoke, build e E2E responsivo verdes | Pronto para integração |

| RB-INC-092 | RB-UX-004–006, RB-DS-002–003, RB-SEC-001, RB-ADR-007–008, RB-ADR-027 e RB-INC-091 | #209 | `feature/rb-inc-092-itinerary-proposal-acceptance-experience`, PR #210 | experiência autorizada de aceite, confirmação explícita, bloqueio de decisões concorrentes e feedback `applied`/`replay` | runs 30869999535 e 30869999538, job 91869867843, SHA 76cda755; 224 documentos, migrations, 540 testes, smoke, build e 65 E2E responsivos executados | Pronto para integração |

| RB-INC-093 | RB-QA-001, RB-CICD-001, RB-SEC-001, RB-ADR-007–008, RB-ADR-027 e RB-INC-084–085, RB-INC-091–092 | #211 | `feature/rb-inc-093-itinerary-proposal-acceptance-e2e`, PR #212 | aceite integral UI–PostgreSQL, replay idempotente, redirecionamento autoritativo e validação de persistência | runs 30970192016 e 30970192009, job 92192651639, SHA d7ef177; 226 documentos, migrations, 541 testes, smoke, build e Playwright responsivo verdes | Pronto para integração |

| RB-INC-094 | RB-UC-022, RB-FR-087–096, RB-ARC-003, decisão #118 e RB-INC-052–057, RB-INC-093 | #213 | `feature/rb-inc-094-deterministic-itinerary-proposal-generator`, PR #214 | porta interna, contratos normalizados e adapter puro com ordenação canônica, balanceamento, append, duração padrão explícita, validade e lifecycle `ready` | runs 31060389877 e 31060389870, jobs 92486885615 e 92486884413, SHA 61d8e063; 228 documentos, migrations, 551 testes, smoke, build e 71 Playwright responsivos verdes | Pronto para integração |
| RB-INC-095 | RB-UC-022, RB-FR-087–094, RB-ARC-003, decisão #118 e RB-INC-048–056, RB-INC-094 | #215 | `feature/rb-inc-095-itinerary-proposal-generation-orchestration`, PR #216 | application service interno que persiste `requested → generating → ready | failed` por repository e porta injetados | runs 31061951949 e 31061951910, jobs 92491556471 e 92491556370, SHA 3000435a; 230 documentos, migrations, 561 testes, smoke, build e 71 Playwright responsivos verdes | Pronto para integração |
| RB-INC-096 | RB-UC-022, RB-FR-087–096, RB-ARC-003 e RB-INC-094–095 | #217 | `feature/rb-inc-096-itinerary-proposal-generation-input-assembler`, PR #218 | assembler puro de snapshots autoritativos de Itinerary, Recommendations e Places para Dias e candidatos normalizados | SHA `e2d3cd94a3a56c944c5cac51a65f2183bc9b84b0`; Engineering run `31065745496`, job `92502974835`; Documentation run `31065745508`, job `92502975148`; 232 documentos; 573 testes; migrations, smoke e build aprovados; 71 Playwright responsivos | Pronto para integração |
| RB-INC-099 | RB-PRD-005–006, RB-ARC-003–004 e RB-INC-094–098 | #223 | `feature/rb-inc-099-authoritative-itinerary-proposal-service`, PR #224 | composition root PostgreSQL, contexto autoritativo, repository de Proposal, generator determinístico, exports e teste PostgreSQL completo | HEAD final `dcb2e46d18948d1a49f81c527af219796144b7d4`; Documentation #859 run `31200795096`; Engineering #1220 run `31200795135`; format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright verdes; merge `6c13f614c4a649f1c2ae1234bef32af7b83aab9d` | Integrado |
| RB-INC-100 | RB-SEC-001, RB-ADR-007–008, RB-ARC-003 e RB-INC-087, RB-INC-090, RB-INC-099 | #226 | `feature/rb-inc-100-authorized-itinerary-proposal-generation-action`, PR #228 | caso de uso server-side, `trip:edit`, Trip/Itinerary autoritativos, serviço PostgreSQL do RB-INC-099 e Server Action | HEAD final `9ba396937dae4b947cff1347392652d4988f6023`; Documentation #887 run `31209789690`; Engineering #1248 run `31209792591`; merge `1ef2564688da6d02d06beb1514a08a76647601a2` | Integrado |
| RB-INC-101 | RB-UX-004–006, RB-DS-002–003, RB-SEC-001, RB-ADR-007–008 e RB-INC-092, RB-INC-100 | #229 | `feature/rb-inc-101-authorized-itinerary-proposal-generation-experience`, PR #230 | página de Proposal, affordance explícita de geração, `trip:edit`, pending/erro acessíveis e reutilização da Server Action | SHA funcional `4e0370900849e3db33c02cfedd4a48c9cabc22a8`; Documentation #894 run `31218649387`; Engineering #1255 run `31218649337`; validação final de governança requerida no HEAD da PR | Pronto para validação final |

## Evidências do RB-INC-003

| Evidência | Localização/resultado |
| --- | --- |
| definição publicada | `docs/implementation/increments/rb-inc-003-trip-creation.md`, versão `1.0.0` |
| agregado e invariantes | `modules/trip-management/src/trip.ts` e `src/service.ts` |
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

## Evidências do RB-INC-097

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-097-authoritative-itinerary-proposal-generation.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-097-authoritative-itinerary-proposal-generation.md` |
| composição autoritativa | `modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts` |
| exports | `modules/proposal-management/src/index.ts` |
| rastreabilidade | issue #219 e PR #220 |
| CI | Engineering Validation `31067491527`, job `92508196343` |
| integração | merge commit `8c8cce11d894feadd1f23a8d78c503642651628d` |

## Evidências previstas do RB-INC-098

| Evidência | Localização |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-098-postgres-authoritative-itinerary-proposal-context.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-098-postgres-authoritative-itinerary-proposal-context.md` |
| adapter PostgreSQL | `packages/database/src/authoritative-itinerary-proposal-generation-context.ts` |
| testes de integração | `packages/database/src/authoritative-itinerary-proposal-generation-context-postgres.test.ts` |
| exports | `packages/database/src/index.ts` |
| rastreabilidade | issue #221 e PR #222 |
| schema | reutilização de `packages/database/src/schema.ts`, sem migration |

## Evidências do RB-INC-099

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-099-authoritative-itinerary-proposal-service.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-099-authoritative-itinerary-proposal-service.md` |
| serviço concreto | `packages/database/src/authoritative-itinerary-proposal-generation-service.ts` |
| integração PostgreSQL | `packages/database/src/authoritative-itinerary-proposal-generation-service-postgres.test.ts` |
| exports | `packages/database/src/index.ts` |
| rastreabilidade | issue #223 e PR #224 |
| migration | nenhuma nova migration; contratos de dados existentes reutilizados |
| HEAD final | `dcb2e46d18948d1a49f81c527af219796144b7d4` |
| Documentation Validation | #859, run `31200795096`, success |
| Engineering Validation | #1220, run `31200795135`, success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo |
| integração | squash merge `6c13f614c4a649f1c2ae1234bef32af7b83aab9d`; issue #223 fechada |

## Evidências do RB-INC-100

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-100-authorized-itinerary-proposal-generation-action.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-100-authorized-itinerary-proposal-generation-action.md` |
| caso de uso | `apps/web/lib/itinerary-proposal-generation.ts` |
| Server Action | `apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts` |
| testes | `apps/web/lib/itinerary-proposal-generation.test.ts` e `apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.test.ts` |
| rastreabilidade | issue #226 e PR #228 |
| autorização | `resolveTripRouteAccess` com `trip:edit` |
| composição concreta | `createPostgresAuthoritativeItineraryProposalGenerationService` do RB-INC-099 |
| HEAD final | `9ba396937dae4b947cff1347392652d4988f6023` |
| Documentation Validation | #887, run `31209789690`, success |
| Engineering Validation | #1248, run `31209792591`, success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo |
| integração | squash merge `1ef2564688da6d02d06beb1514a08a76647601a2`; issue #226 fechada |

## Evidências do RB-INC-101

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-101-authorized-itinerary-proposal-generation-experience.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-101-authorized-itinerary-proposal-generation-experience.md` |
| experiência | `apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx` |
| controle de geração | `apps/web/components/itinerary-proposal-generation-control.tsx` |
| Server Action reutilizada | `apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts` |
| autorização de affordance | `resolveTripRouteAccess` com `trip:edit` |
| rastreabilidade | issue #229 e PR #230 |
| SHA funcional validado | `4e0370900849e3db33c02cfedd4a48c9cabc22a8` |
| Documentation Validation | #894, run `31218649387`, success |
| Engineering Validation | #1255, run `31218649337`, success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo |
| gate final | repetir Documentation Validation e Engineering Validation no mesmo HEAD final de governança antes do merge |

## Evidências previstas do RB-INC-102

| Evidência | Localização |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-102-authorized-itinerary-proposal-generation-e2e.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-102-authorized-itinerary-proposal-generation-e2e.md` |
| E2E de geração | `apps/web/e2e/itinerary-proposal-generation.spec.ts` |
| experiência | `apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx` |
| Server Action | `apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts` |
| persistência | `packages/database/src/proposal-repository.ts` |
| rastreabilidade | issue #231 e PR #234 |
| migration | nenhuma nova migration; contratos existentes reutilizados |

## Evidências previstas do RB-INC-103

| Evidência | Localização |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-103-edit-itinerary-proposal-activity.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-103-edit-itinerary-proposal-activity.md` |
| núcleo de edição | `modules/proposal-management/src/edit-itinerary-proposal.ts` |
| testes de domínio | `modules/proposal-management/src/edit-itinerary-proposal.test.ts` |
| exports públicos | `modules/proposal-management/src/index.ts` |
| requisito de produto | `RB-FR-094` |
| interação | `RB-INT-065` |
| rastreabilidade | issue #235 e PR #236 |
| migration | nenhuma nova migration; domínio sem alteração de schema |

## Evidências previstas do RB-INC-104

| Evidência | Localização |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-104-persisted-itinerary-proposal-edit.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-104-persisted-itinerary-proposal-edit.md` |
| application service | `modules/proposal-management/src/service.ts` |
| testes do service | `modules/proposal-management/src/edit-itinerary-proposal-service.test.ts` |
| integração PostgreSQL | `packages/database/src/edit-itinerary-proposal-service-postgres.test.ts` |
| repository | `packages/database/src/proposal-repository.ts` |
| schema de Proposal | `packages/database/src/proposal-schema.ts` |
| migration | `packages/database/drizzle/0023_allow_ready_itinerary_proposal_edits.sql` |
| journal de migrations | `packages/database/drizzle/meta/_journal.json` |
| rastreabilidade | issue #237 e PR #238 |

## Evidências previstas do RB-INC-105

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-105-authorized-itinerary-proposal-edit-action.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-105-authorized-itinerary-proposal-edit-action.md` |
| executor web | `apps/web/lib/itinerary-proposal-editing.ts` |
| testes do executor | `apps/web/lib/itinerary-proposal-editing.test.ts` |
| Server Action | `apps/web/app/viagens/[tripId]/roteiro/proposta/edit-action.ts` |
| testes da Server Action | `apps/web/app/viagens/[tripId]/roteiro/proposta/edit-action.test.ts` |
| autorização | `resolveTripRouteAccess` com `trip:edit` |
| application service reutilizado | `editAndPersistItineraryProposalProposedActivity` |
| repository concreto | `DrizzleItineraryProposalRepository` |
| rastreabilidade | issue #239 e PR #240 |
| SHA técnico validado | `fdba3b2c2c2e88987936d04c673748f764b49f35` |
| Engineering Validation técnico | #1306, run `31257205455`, success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo |
| migration | nenhuma nova migration; RB-INC-104 reutilizado |

## Evidências previstas do RB-INC-106

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-106-itinerary-proposal-edit-experience.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-106-itinerary-proposal-edit-experience.md` |
| editor client | `apps/web/components/itinerary-proposal-activity-editor.tsx` |
| estilos responsivos | `apps/web/components/itinerary-proposal-activity-editor.module.css` |
| testes do editor | `apps/web/components/itinerary-proposal-activity-editor.test.tsx` |
| integração da review | `apps/web/components/itinerary-proposal-review.tsx` |
| testes de estados da review | `apps/web/components/itinerary-proposal-review.test.tsx` |
| review model | `apps/web/lib/itinerary-proposal-experience.ts` |
| testes do review model | `apps/web/lib/itinerary-proposal-experience.test.ts` |
| página autorizada | `apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx` |
| rastreabilidade | issue #241 e PR #242 |
| SHA técnico validado | `ffc6fc4e214c76c0241303ab7a80c51376fbfc48` |
| Engineering Validation técnico | #1319, run `31326575512`, success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo |
| migration | nenhuma nova migration; RB-INC-104/RB-INC-105 reutilizados |

## Evidências previstas do RB-INC-107

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-107-itinerary-proposal-edit-e2e.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-107-itinerary-proposal-edit-e2e.md` |
| E2E integral de edição | `apps/web/e2e/itinerary-proposal-editing.spec.ts` |
| autenticação/Trip E2E | `apps/web/e2e/support/authenticated-trip.ts` |
| fronteira UI | `apps/web/components/itinerary-proposal-activity-editor.tsx` |
| Server Action | `apps/web/app/viagens/[tripId]/roteiro/proposta/edit-action.ts` |
| application service | `editAndPersistItineraryProposalProposedActivity` |
| persistência | `DrizzleItineraryProposalRepository` e PostgreSQL |
| prova de isolamento | id/version/Activities do Itinerary comparados antes/depois |
| concorrência | Proposal transicionada para `rejected` antes do submit; `proposal-not-ready` sem sobrescrita |
| rastreabilidade | issue #243 e PR #244 |
| SHA técnico validado | `35b4b75859ffa6e4decd7b498189da84ff3a6a76` |
| Engineering Validation técnico | #1329, run `31327843734`, success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo |
| migration | nenhuma nova migration; cadeia RB-INC-104–106 reutilizada |

## Evidências previstas do RB-INC-108

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-108-partial-itinerary-proposal-acceptance-core.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-108-partial-itinerary-proposal-acceptance-core.md` |
| núcleo de aceite parcial | `modules/proposal-management/src/accept-itinerary-proposal-partially.ts` |
| testes de domínio | `modules/proposal-management/src/accept-itinerary-proposal-partially.test.ts` |
| exports públicos | `modules/proposal-management/src/index.ts` |
| contrato de aplicação | `applicationType: partial` + `createApplyProposalItemsCommand` |
| idempotência | `createProposalApplicationRequestFingerprint` sobre seleção canônica |
| preservação | `partiallyAcceptItineraryProposal` retém apenas Proposed Activities não aplicadas |
| rastreabilidade | issue #245 e PR #246 |
| SHA técnico validado | `43ef85bc5f081622ab532648ab52a62620e0e196` |
| Engineering Validation técnico | #1342, run `31329125333`, success em format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo |
| migration | nenhuma neste incremento; persistência parcial fica para o próximo recorte |

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

## Evidências do RB-INC-109

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-109-postgres-partial-itinerary-proposal-acceptance.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-109-postgres-partial-itinerary-proposal-acceptance.md` |
| requisitos e regras | RB-BR-PRP-007, RB-BR-PRP-009, RB-DATA-001–002 e RB-ADR-006 |
| rastreabilidade | issue #248 e PR #249 |
| transação parcial | `packages/database/src/apply-itinerary-proposal-partially-transaction.ts` |
| persistência da Proposal | `packages/database/src/proposal-repository.ts`, `proposal-schema.ts` e migration `0024_persist_partially_accepted_itinerary_proposals.sql` |
| testes | composição unitária, PostgreSQL, replay e rollback integral |
| SHA técnico validado | `b17f57f24a93c4cb9eac930abdae1eb83dedf6cc` |
| Engineering Validation técnico | #1354, run `31331066567`, attempt 2, job `93289823239`, success integral incluindo Playwright responsivo |

## Evidências do RB-INC-110

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-110-authorized-partial-itinerary-proposal-action.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-110-authorized-partial-itinerary-proposal-action.md` |
| requisitos e regras | RB-PRD-006, RB-UX-005, RB-INC-108 e RB-INC-109 |
| rastreabilidade | issue #250 e PR #251 |
| application service | `apps/web/lib/itinerary-proposal-partial-acceptance.ts` |
| Server Action | `apps/web/app/viagens/[tripId]/roteiro/proposta/partial-accept-action.ts` |
| testes focados | 10 testes aprovados em `itinerary-proposal-partial-acceptance.test.ts` |
| SHA técnico corrigido | `1b79e54b04cbe59c9b78f24d2e3291ea906c5a0a` |
| Engineering Validation técnico | run `31493467942`, job `93785295900`, success integral; 77 testes Playwright aprovados, com duas anotações flaky preexistentes na edição de Proposed Activity |

## Evidências do RB-INC-111

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-111-partial-itinerary-proposal-acceptance-experience.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-111-partial-itinerary-proposal-acceptance-experience.md` |
| requisitos e interação | RB-PRD-006, RB-UX-005, RB-INT-066–067 e RB-INC-110 |
| rastreabilidade | issue #253 e PR #254 |
| experiência | `apps/web/components/itinerary-proposal-decision-actions.tsx` |
| integração da revisão | `apps/web/components/itinerary-proposal-review.tsx` |
| feedback no Roteiro | `apps/web/app/viagens/[tripId]/roteiro/page.tsx` |
| testes focados | 19 testes aprovados |
| SHA técnico | `55e45ac30f2674e21903e884e17ce893324a9fb3` |
| Engineering Validation técnico | run `31494965592`, job `93790262730`, success integral; 79 testes Playwright sem retry flaky |

## Evidências do RB-INC-112

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-112-partial-itinerary-proposal-acceptance-e2e.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-112-partial-itinerary-proposal-acceptance-e2e.md` |
| requisitos e interação | RB-PRD-006, RB-UX-005, RB-INT-066–067 e RB-INC-111 |
| rastreabilidade | issue #256 e PR #257 |
| jornada E2E | `apps/web/e2e/itinerary-proposal-review.spec.ts` |
| correção de navegação | `apps/web/app/viagens/[tripId]/roteiro/proposta/partial-accept-action.ts` |
| persistência comprovada | Itinerary, Proposal `partially-accepted`, Proposal Application e Decision |
| idempotência comprovada | replay concorrente sem incremento adicional de versão, aplicação ou decisão |
| SHA técnico | `d086a68fadaaef143c8dad863bd1d54103745e7d` |
| Engineering Validation técnico | run `31498339765`, job `93801596100`, success integral; 79 testes Playwright aprovados, novo E2E parcial sem retry e duas anotações flaky preexistentes |

## Evidências do RB-INC-113

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-113-operational-health-checks.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-113-operational-health-checks.md` |
| requisitos operacionais | RB-DEL-001, RB-OBS-001, RB-INFRA-001, RB-CICD-001 e RB-OPS-001 |
| rastreabilidade | issue #264 e PR #265 |
| liveness | `apps/web/app/api/health/live/route.ts` |
| readiness PostgreSQL | `apps/web/app/api/health/ready/route.ts` |
| serviço operacional | `apps/web/lib/operational-health.ts` |
| testes focados | 8 testes aprovados para serviço, liveness e readiness |
| validação local | documentação com 266 IDs sincronizados; lint, typecheck e build aprovados |

## Evidências do RB-INC-114

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-114-operational-smoke.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-114-operational-smoke.md` |
| requisitos operacionais | RB-DEL-001, RB-CICD-001, RB-OBS-001, RB-INFRA-001 e RB-INC-113 |
| rastreabilidade | issue #266 e PR #267 |
| comando operacional | `pnpm smoke:operational -- <base-url>` |
| implementação | `scripts/operational-smoke.mjs` |
| testes determinísticos | `scripts/operational-smoke.test.mjs` |
| validação local | 5 testes do smoke, 268 documentos, lint, typecheck e build aprovados; suíte web com 173 aprovações e 2 testes PostgreSQL sem serviço local |

## Evidências do RB-INC-115

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-115-approve-adr-017.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-115-approve-adr-017.md` |
| decisão | RB-ADR-017 versão 0.2.0, estado interno `Approved` |
| governança | RB-GOV-001, RB-GOV-002 e aprovação humana explícita |
| rastreabilidade | issue #268 e PR #269 |

## Evidências do RB-INC-116

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-116-approve-adr-018.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-116-approve-adr-018.md` |
| decisão | RB-ADR-018 versão 0.2.0, estado interno `Approved` |
| governança | RB-GOV-001, RB-GOV-002 e aprovação humana explícita |
| rastreabilidade | issue #270 e PR #271 |

## Evidências do RB-INC-117

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-117-vercel-neon-preview-bootstrap.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-117-vercel-neon-preview-bootstrap.md` |
| decisões | RB-ADR-017 e RB-ADR-018 aprovados |
| rastreabilidade | issue #272; PR #273 |
| Vercel | team `rnd10`, project `routebook` |
| Neon | project `rapid-brook-02474789`, branch `br-divine-heart-ay8hpdo1`, database `neondb` |
| banco | PostGIS habilitado e 24 tabelas públicas após migrations |
| secrets | nomes verificados em Preview; valores não registrados |
| Preview | deployment `dpl_UMDTJft2qDM7Q9fekLBrHxeRnuWY`, estado `READY` |
| health | liveness `ok`; readiness `ready`; database `available` |
| runtime | nenhum erro encontrado na janela de uma hora após o smoke |
| CI | run `31512711349` aprovado integralmente |

## Evidências do RB-INC-118

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-118-deterministic-server-action-e2e.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-118-deterministic-server-action-e2e.md` |
| origem | Engineering Validation `31513286871` |
| defeito | 2 cenários flaky aprovados somente após retry |
| evidência adicional | run `31514212266`, descarte concorrente com a mesma espera frágil |
| evidência empilhada | run `31515863942`, aceite integral concorrente com a mesma causa |
| refinamento | run `31516435515`, resposta e URL precisam ser aguardadas em conjunto |
| rastreabilidade | issue #274; PR #275 |

## Evidências do RB-INC-119

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-119-deterministic-landing-navigation.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-119-deterministic-landing-navigation.md` |
| origem | Engineering Validation `31514759756`, attempt 2 |
| defeito | heading de destino observado depois da URL; cenário passou no retry |
| refinamento | run `31516435515`, aguardar URL antes do click e heading após navegação |
| rastreabilidade | issue #276; PR #277 |

## Evidências do RB-INC-120

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-120-deterministic-proposal-generation.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-120-deterministic-proposal-generation.md` |
| origem | Engineering Validation `31516435515` |
| defeito | geração validou URL antes da conclusão observável; passou no retry |
| refinamento | run `31517303193`, conteúdo renderizado substitui espera de lifecycle |
| rastreabilidade | issue #278; PR #279 |

## Evidências do RB-INC-121

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-121-deterministic-itinerary-mutations.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-121-deterministic-itinerary-mutations.md` |
| origem | Engineering Validation `31517303193` |
| defeito | movimentação concluiu o POST, mas a URL anterior ainda foi observada; passou no retry |
| correção | mensagem de sucesso renderizada precede a assertion da URL |
| rastreabilidade | issue #280; PR #281 |

## Evidências do RB-INC-122

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-122-rsc-response-completion.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-122-rsc-response-completion.md` |
| origem | Engineering Validation `31518438255`, attempt 2 |
| defeito | headers do POST precederam a navegação suave; 2 cenários passaram somente no retry |
| experimento | `Response.finished()` manteve stream RSC aberto no run cancelado `31519586612` |
| correção | header `x-action-redirect` é validado e seu destino carregado explicitamente |
| validação final | run `31520574275`, attempts 1 e 2: 81 aprovados, sem flaky annotation |
| rastreabilidade | issue #282; PR #283 |

## Evidências do RB-INC-123

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-123-git-preview-deployment.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-123-git-preview-deployment.md` |
| vínculo Git | projeto `routebook` conectado a `collapsy/Routebook`; produção declarada em `main` |
| isolamento | `DATABASE_URL` e `BETTER_AUTH_SECRET` sensíveis somente em Preview |
| Preview automático | `dpl_64cSW7kr8TDPZWAbSNkNUW8DYsye`, branch e PR #285 reconhecidas pela Vercel |
| health | liveness e readiness HTTP 200; database `available`; respostas `no-store` |
| runtime | nenhum log de erro encontrado após o smoke autenticado |
| CI | Engineering Validation `31527703958`: 81 aprovados, sem flaky annotation |
| rastreabilidade | issue #284; PR #285 |

## Evidências do RB-INC-124

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-124-production-bootstrap.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-124-production-bootstrap.md` |
| autorização | provisionamento e integração de Production aprovados pelo responsável em 2026-08-11 |
| isolamento | Neon `routebook-production` / `bitter-queen-90455085`, distinto de Preview; dois secrets sensíveis exclusivos do target Production |
| schema | branch `main` / `br-rough-dew-axo9u82j`; 25 migrations, 21 tabelas públicas, histórico Drizzle e 0 viagens |
| deployment | merge `33a8cdaa`; `dpl_96Evpm9F2JuadmmRWAijzbuFBcrp` READY; alias `https://routebook-rnd10.vercel.app` |
| validação | liveness `ok`; readiness `ready` com database `available`; nenhum log de erro após smoke |
| CI | Documentation Validation `31530544311` verde; Engineering Validation `31530544328` verde, com 80 passagens diretas e 1 retry flaky |
| rastreabilidade | issue #286; PRs #287, #285 e #288 |

## Evidências do RB-INC-125

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-125-deterministic-mobile-removal.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-125-deterministic-mobile-removal.md` |
| origem | Engineering Validation `31530544328`; 1 retry flaky em mobile Chromium |
| defeito | criação da Activity era observada sem validar e carregar o redirect da Server Action |
| correção | criação e remoção sincronizadas pelo helper de redirect já consolidado |
| validação | `31534321192` attempts 1 e 2, `31535217769` e `31535676668`: 81 aprovados sem flaky |
| rastreabilidade | issue #289; PR #290 |

## Evidências do RB-INC-126

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-126-deterministic-conflict-navigation.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-126-deterministic-conflict-navigation.md` |
| origem | Engineering Validation `31532256527`, attempt 1; retry flaky em desktop Chromium |
| defeito | espera por navegação interna com fragmento não oferecia barreira determinística |
| correção | `href` validado e destino carregado explicitamente antes das assertions |
| validação | `31534321192` attempts 1 e 2, `31535217769` e `31535676668`: 81 aprovados sem flaky |
| rastreabilidade | issue #291; PR #292 |

## Evidências do RB-INC-127

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-127-deterministic-proposal-return.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-127-deterministic-proposal-return.md` |
| origem | Engineering Validation `31532256527`, attempt 2; retry flaky em desktop Chromium |
| defeito | retorno por link aguardava evento de navegação não determinístico |
| correção | `href` validado e destino carregado explicitamente |
| validação | `31534321192` attempts 1 e 2, `31535217769` e `31535676668`: 81 aprovados sem flaky |
| rastreabilidade | issue #293; PR #294 |

## Evidências do RB-INC-128

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-128-proposal-navigation-contracts.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-128-proposal-navigation-contracts.md` |
| origem | runs `31532256527` e `31532897047`, ambos com retry flaky em revisão de Proposal |
| correção | Server Actions usam redirect declarado; links usam `href` validado |
| validação | `31534321192` attempts 1 e 2, `31535217769` e `31535676668`: 81 aprovados sem flaky; Production READY e saudável |
| rastreabilidade | issue #295; PR #296 |

## Evidências do RB-INC-129

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-129-mvp-production-validation.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-129-mvp-production-validation.md` |
| ambiente | Production em `https://routebook-rnd10.vercel.app` |
| cenário | Pipa (RN), 22–29/08/2026, três adultos e dados exclusivamente sintéticos |
| validação parcial | conta e Trip sintéticas criadas; contexto, hospedagem geográfica, catálogo, três salvos, Roteiro editável, Período livre, Recommendation e Planning Conflict comprovados |
| primeiro valor | Praia do Amor exibida a 268 m da hospedagem, com estimativa identificada |
| valor principal | três Places transformados em Activities; reordenação, movimentação, remoção e mapa diário comprovados |
| retomada | RB-INC-130 expôs a entrada; RB-INC-131 removeu Places já planejados da geração |
| persistência e mobile | logout/login recuperou a Trip; smoke real em 390 × 844 aprovou navegação, mapa, Roteiro e Proposal |
| operação | liveness `200`/`ok`; readiness `200`/`ready`; sem erro agregado ou log error/fatal na hora posterior |
| resultado | jornada crítica aprovada; lançamento condicionado à descoberta obrigatória #304 e ao acesso de Production #305 |
| rastreabilidade | issue #298; defeitos #299 e #302; follow-ups #304 e #305 |

## Evidências do RB-INC-130

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-130-proposal-entrypoint.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-130-proposal-entrypoint.md` |
| origem | validação RB-INC-129 em Production, deployment `dpl_2KVxVFJCtpwxBnykRfidwDzkT2Mi` |
| defeito | estado vazio de Proposal existia, mas não havia entrada visível a partir do Roteiro |
| correção | Roteiro sempre aponta para revisão; rótulo distingue gerar, revisar e consultar expirada |
| validação local | Prettier, lint, typecheck e build verdes; 23 E2E listados; 163 unitários verdes e 5 suítes dependentes de banco reservadas ao CI |
| integração | PR #301; commit `1568570e`; CI e deployment `dpl_Gzf1vWpo6nHTjVyHzu8sdQn7FAa9` verdes |
| Production | entrada, estado vazio e geração explícita comprovados na Trip sintética do RB-INC-129 |
| rastreabilidade | issue #299, encerrada pela PR #301 |

## Evidências do RB-INC-131

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-131-proposal-place-deduplication.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-131-proposal-place-deduplication.md` |
| origem | retomada do RB-INC-129 após o deploy produtivo do RB-INC-130 |
| defeito | Proposal ofereceu novamente três Places já vinculados a Activities do Roteiro |
| contenção | Proposal descartada explicitamente; Roteiro permaneceu com três Activities |
| correção | adaptador exclui Recommendations pela identidade persistida de Place antes da geração |
| validação | PR #303; CI no PR e pós-merge com 83 testes; Production propôs somente o Place ainda não planejado |
| operação | deployment `dpl_6hp5feWzaqz7eNARxFZ7ewZJUTgR` READY; sem erros de runtime na hora posterior |
| rastreabilidade | issue #302, encerrada pela PR #303; relacionado a #298 |

## Evidências do RB-INC-132

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-132-place-discovery-filters.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-132-place-discovery-filters.md` |
| origem | conclusão condicionada do RB-INC-129 e requisito obrigatório de descoberta do RB-PRD-002 |
| lacuna | pesquisa textual, distância, Price Range, filtros ativos e mapa filtrado ausentes em Explorar |
| implementação | PR #307; merge `10943fca`; CI completo e E2E responsivo verdes |
| banco | migration Neon `311f2142-6e6b-43d0-8a59-d7b1a6602cf6` validada em branch temporária e promovida com aprovação explícita |
| Production | deployment `dpl_73NWcYLAD2SY9zKY2DYh8XNCjgP9` READY; busca e filtros combinados preservaram o mesmo Place na lista e no mapa |
| responsividade | viewport 390 × 844 sem overflow; controles de busca, categoria, distância, preço e aplicação visíveis |
| operação | live e ready em 200; banco disponível; nenhum erro de runtime após a migration; follow-up #308 aberto |
| rastreabilidade | issue #304 encerrada pela PR #307; relacionado a #298 e #308 |


## Evidências do RB-INC-133

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-133-production-migration-gate.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-133-production-migration-gate.md` |
| origem | incidente de ordem de deployment observado no RB-INC-132 e issue #308 |
| implementação | PR #310; correção operacional PR #311; candidate final `a9c0496eca45d90618808a853eaa692ccafc3702` |
| CI | Documentation Validation #1049 e Engineering Validation #1471 verdes no SHA final |
| release gate | `.github/workflows/production-release.yml`; SHA imutável, ledger real, classificação de risco e promoção serializada |
| segurança | ruleset com update/deletion/non-fast-forward e bypass `DeployKey`; secrets validados sem exposição |
| fail-closed | Production Release #2 (`31558997377`) bloqueou a 0025 `high` por `drop-constraint`/`update-data` antes de migration ou promoção |
| aprovação humana | 0025 aprovada explicitamente para `a9c0496eca45d90618808a853eaa692ccafc3702` antes do despacho manual |
| migration | Production Release #3 (`31596977124`) aplicou `0025_add_place_price_range` com sucesso |
| ledger final | 26 registros, `latestAppliedAt=1786482000000`, zero pendências |
| referência de Production | `codex/production-release` promovida por fast-forward para `a9c0496eca45d90618808a853eaa692ccafc3702` somente após o schema |
| Vercel | `dpl_FBfJuNxULQ64X7NaWzWDTXFAWu1x` READY, `target=production`, branch `codex/production-release`, SHA `a9c0496eca45d90618808a853eaa692ccafc3702` |
| smoke | `https://routebook-one.vercel.app` HTTP 200; nenhum log `error`/`fatal` na janela pós-release |
| rastreabilidade | issue #308; PRs #310 e #311; entrega operacional comprovada em Production |

## Evidências do RB-INC-134

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-134-production-public-access.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-134-production-public-access.md` |
| decisão humana | Production pública aprovada em 2026-08-12 |
| diagnóstico corrigido | URLs geradas de deployment/Preview estavam protegidas; o alias canônico de Production já estava público sob Standard Protection |
| Vercel Authentication | `Require Log In` ON e `Standard Protection` comprovados no painel; nenhuma mutação de configuração necessária |
| Production pública | `https://routebook-one.vercel.app` aberta em janela anônima sem login da Vercel |
| Preview | deployment da PR #315 `dpl_Auqp32VhuWDjmg34oiDC4wdaE1ix` READY e protegido; nenhum Shareable Link/token registrado |
| autorização anônima | `/viagens` sem sessão redireciona para `/entrar?next=%2Fviagens` antes da consulta autorizada de Trips |
| health | liveness `200`/`ok`; readiness `200`/`ready`; database `available` |
| jornada autenticada | evidência do RB-INC-129 no mesmo SHA de aplicação; não reexecutada interativamente neste incremento |
| runtime | sem `error`, `fatal`, `warning` ou `5xx` na janela de 24 horas consultada |
| Production | `dpl_Caz5LVTB9P8Di8bG8YFBkvZFPUmW` READY, `target=production`, branch `codex/production-release`, SHA `bd32107bb5d79ddd13baf1472dce0bd4c05b281c` |
| CI preliminar | Documentation Validation #1055 (`31607305678`) e Engineering Validation #1476 (`31607305719`) verdes no SHA `ffd5acb88c8892453b54c92a1a167d95e9258167` |
| mudanças de aplicação | nenhuma; sem migration, banco, secret ou código de autenticação/autorização alterado |
| rastreabilidade | issue #305 e PR #315; gates finais devem permanecer verdes no HEAD definitivo antes do merge |

## Evidências do RB-INC-136

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-136-m8-real-validation.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-136-m8-real-validation.md` |
| requisitos e decisões | RB-PRD-002, RB-DEL-001, RB-QA-001, RB-OBS-001 e RB-PRIV-001 |
| rastreabilidade | issue #319; preparação/reconciliação #374; closeout PR #403 / `codex/rb-inc-136-m8-closeout` |
| Fase A | concluída e integrada em 20/08/2026; CI da preparação verde |
| uso humano real | evidências contemporâneas em #382, #390, #395, #397, #399 e #401 |
| feedback pós-viagem | em 01/09/2026 o owner confirmou que a viagem ocorreu, o RouteBook foi útil e recebeu alterações durante o período de teste |
| Sessions M8 | RB-M8-20260823-01, RB-M8-20260827-01, RB-M8-20260828-01 e RB-M8-20260901-01 |
| matriz H1–H10 | H1 `partially_supported`; H10 `supported`; demais hipóteses permanecem `not_measured` por falta de evidência específica |
| principais achados | cobertura visual, fricção do Roteiro, ranking/qualidade, temporalidade do Dia e navegação mobile |
| backlog derivado | #382, #386/#387, #390/#401/#402, #395/#396, #397/#398 e #399/#400 |
| decisão M8 | `partially_validated` — valor real demonstrado, com lacunas relevantes e capabilities não medidas |
| código/Production | closeout documental; nenhuma mudança funcional, migration, Provider, secret ou promoção |
| gate final | Documentation Validation e Engineering Validation devem permanecer verdes no SHA final da PR de closeout |
| encerramento | #319 permanece aberta até revisão humana final e integração do closeout |

## Evidências previstas do RB-INC-168

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-168-place-quality-ranking.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-168-place-quality-ranking.md` |
| origem | feedback de uso humano real em Pipa: dificuldade para identificar melhores praias, restaurantes e vida noturna |
| base | PR #389 / correção de classificação e identidade de praias |
| rastreabilidade | issue #390 |
| arquitetura | RB-ARC-003 e RB-ADR-012; ratings/popularidade externos exigem Provenance e Provider permanece desacoplado |
| implementação | PlaceQualitySignalsPort, reputação Bayesiana, RouteBook Score e projeção de ranking provider-neutral |
| spike | Google Places × Foursquare key-gated, sem segredo no relatório e sem execução live automática |
| Provider | escolha/ativação pendente de gate humano por credencial, termos, quota e eventual billing |
| validação | Documentation Validation, Engineering Validation e Preview Vercel pendentes no HEAD final |

## Evidências previstas do RB-INC-169

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-169-daily-experiences.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-169-daily-experiences.md` |
| origem | feedback de uso humano real em 27/08/2026: separar pontos para observar Sol/Lua de luaus, festas e outros Rolês confirmados |
| rastreabilidade | issue #395; issue permanece aberta para cobertura dinâmica e fases posteriores |
| base de Preview | PR #387 / RB-INC-165 no SHA `379d356621f421c70a71a47cdc9b720b3c782860` |
| astronomia | tabela governada de Pipa para 22–29/08/2026, com horário e azimute específicos por data; ausência fora da cobertura não é preenchida |
| observação natural | Lagoa de Guaraíras e Mirante Sunset Bar curados para pôr do sol; Chapadão e Praia do Amor identificados como adequação geoespacial inferida para horizonte leste |
| eventos | 28/08 Nihanna/Mística Weekend e 29/08 PAGOFUNK no Agora Club, somente quando o Place canônico está presente e com Provenance Sympla |
| decisão | Guia apenas pré-preenche o compositor manual do Roteiro; persistência continua exigindo submit humano |
| Provider/segredo | nenhum Provider novo, API key, billing, migration ou secret |
| limitações | sem previsão live de nuvens e sem ingestão completa/contínua de eventos nesta fatia |
| validação | testes unitários, E2E, Documentation Validation, Engineering Validation e Vercel Preview pendentes no HEAD final |

## Evidências previstas do RB-INC-170

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-170-category-visual-fallback.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-170-category-visual-fallback.md` |
| origem | feedback de uso humano em Pipa: cards sem fotografia continuam secos e reduzem a utilidade do guia no celular |
| rastreabilidade | issue #397; relacionada ao gate de mídia real da issue #382 sem contorná-lo |
| base de Preview | PR #396 / SHA `872b03c9a18e62b3273f1d48cf8ec9792c517a02`, empilhada sobre RB-INC-165/#387 |
| precedência visual | foto governada → mídia externa segura → ilustração local da categoria |
| superfícies | Discovery, candidato externo, Recommendations, Lugares salvos e experiências diárias |
| semântica | ilustração não é `Place.primaryImage`, não recebe identidade do estabelecimento e possui disclosure explícito |
| Provider/segredo | nenhum Provider, billing, API key, migration ou secret |
| validação | Documentation Validation, Engineering Validation e Vercel Preview READY pendentes no HEAD final |

## Evidências previstas do RB-INC-171

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-171-mobile-navigation-focus.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-171-mobile-navigation-focus.md` |
| origem | feedback funcional humano no Preview: excesso de conteúdo na mesma página e navegação confusa |
| rastreabilidade | issue #399; follow-up direto do RB-INC-161 |
| base de Preview | PR #398 / SHA `e37a954a7065eab67828331d9c475fcd5517696d`, empilhada sobre #396 e #387 |
| diagnóstico | `/guia` misturava experiências do Dia com Guia editorial multi-dia; nav mobile contradizia RB-INT-001 ao permanecer no topo com scroll horizontal |
| arquitetura | `/guia` = Hoje; `/guia/dias` = Guia por dia; subnavegação preserva `dia` |
| mobile | cinco destinos primários: Hoje, Lugares, Roteiro, Salvos e Viagem; barra fixa inferior com safe area |
| domínio | nenhuma mutation, migration, Provider, secret ou alteração de persistência |
| validação | Documentation Validation, Engineering/Playwright e Vercel Preview READY pendentes no HEAD final |

## Evidências previstas do RB-INC-172

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-172-place-ranking-experience.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-172-place-ranking-experience.md` |
| origem | decisão humana desta sessão de concluir a experiência de ranking |
| rastreabilidade | issue #401; issue raiz #390; fundação mergeada na PR #391 |
| base de Preview | PR #400 / SHA `5145a5e59907a02c4a9370b299b6c7d60ea1a146`, empilhada sobre #398 → #396 → #387 |
| UI | Recomendados, Melhor avaliados, Mais populares, Mais próximos, posição, score/evidência e Top 5 recolhido |
| política de ausência | sem Provider/sinal: somente distância; nenhum score/Top fictício |
| runtime | adapters Google Places Text Search (New) e Foursquare Places API 2025-06-17; seleção por `ROUTEBOOK_PLACE_QUALITY_PROVIDER`; Google usa busca ampla + fallback nominal limitado a quatro targets por categoria |
| matching | identidade + proximidade; homônimo distante rejeitado; externalId não reutilizado |
| segurança | secrets somente server-side; nenhum secret em UI/log/relatório |
| Provider | Google Places autorizado e provisionado somente em Preview em 01/09/2026; comparação live confirmou a integração e motivou correção de cobertura; Production continua gate humano separado |
| validação | Documentation, Engineering/Playwright e Vercel Preview pendentes no HEAD final |
\n

## Evidências previstas do RB-INC-173

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-173-destination-foundation.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-173-destination-foundation.md` |
| iniciativa | #411 — M9 / RouteBook Anywhere: Destination Bootstrap |
| rastreabilidade | #412; branch `codex/rb-inc-173-destination-foundation` |
| base | `main@b067a688f39c1e3298e9670b6a82c9857a188f0e`; RB-INC-172 integrado |
| domínio | Destination usa os seis tipos já definidos em RB-DOM-001; nenhum conceito canônico novo |
| implementação | `createTrip` recebe Destination explícito; Pipa deixa de ser constante implícita no domínio |
| persistência | reidratação usa `destination_type`, `country_code` e `time_zone` armazenados |
| segundo destino | teste de Florianópolis, SC com `city / BR / America/Sao_Paulo` |
| Pipa | permanece fixture/regressão e conteúdo curado; não é removida |
| Provider/segredo | nenhum Provider novo, API key, billing, migration ou Production |
| validação | Documentation Validation e Engineering Validation pendentes no SHA final |



## Evidências previstas do RB-INC-174

| Evidência | Localização/resultado |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-174-destination-resolver.md` |
| Context Pack | `docs/implementation/context-packs/rb-inc-174-destination-resolver.md` |
| iniciativa | #411 — M9 / RouteBook Anywhere: Destination Bootstrap |
| rastreabilidade | #414; branch `codex/rb-inc-174-destination-resolver` |
| base | `main@e56de75a7713e76fe8e8fc51b7d7214af3cac885`; RB-INC-173 integrado |
| resolução | porta `DestinationResolver` na aplicação; Provider fora do domínio |
| Provider inicial | Nominatim opcional, desligado por default e bloqueado em Production |
| timezone | lookup local vendorizado/fixado; sem chamada adicional de Provider |
| Provenance | persistência aditiva e atômica da evidência de resolução de Destination |
| UX | destino editável; Pipa deixa de ser default/read-only |
| regressão | Pipa e Florianópolis passam pelo mesmo contrato de resolução |
| validação | Documentation Validation e Engineering Validation pendentes no SHA final |
