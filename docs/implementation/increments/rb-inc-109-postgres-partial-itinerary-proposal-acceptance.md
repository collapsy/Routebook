---
id: RB-INC-109
title: Transação PostgreSQL de Aceite Parcial de Itinerary Proposal
description: Materializa o aceite parcial como transação PostgreSQL atômica e idempotente, persistindo somente a seleção e preservando Proposed Activities não aplicadas.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-09"
last_updated: "2026-08-09"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - partial-acceptance
  - postgresql
  - transaction
  - idempotency
related_documents:
  - RB-PRD-006
  - RB-UX-005
  - RB-INC-108
prerequisites:
  - RB-INC-108
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-109 — Transação PostgreSQL de Aceite Parcial de Itinerary Proposal

## 1. Objetivo

Materializar `AcceptItineraryProposalPartially` como uma aplicação PostgreSQL atômica e idempotente, reutilizando a unidade transacional do aceite integral e garantindo que somente a seleção explícita altere o Itinerary.

Issue: #248.

Branch: `feature/rb-inc-109-postgres-partial-itinerary-proposal-acceptance`.

PR: #249.

## 2. Dependência canônica

O RB-INC-108 introduziu seleção parcial determinística, fingerprint `partial`, `remainingProposedActivityIds` e a transição pura `ready → partially-accepted`. O presente incremento conecta esse núcleo ao PostgreSQL sem criar uma segunda arquitetura de aplicação.

## 3. Escopo implementado

- port transacional público para aceite parcial;
- factory de serviço `createAcceptItineraryProposalPartially`;
- transação PostgreSQL sobre `ItineraryProposalTransactionUnit`;
- Proposal Application com `applicationType: "partial"`;
- aplicação somente dos `ApplyProposalItem` selecionados;
- uma única nova versão do Itinerary por aplicação parcial;
- Decision auditável com IDs selecionados e efetivamente aplicados;
- Proposal `partially-accepted` com somente Proposed Activities restantes;
- replay idempotente sem reaplicar o Itinerary nem refinalizar a Proposal;
- conflito de fingerprint, aplicação em andamento e aplicação falha convertidos para erros públicos estáveis;
- validação de que `selected + remaining` forma uma partição exata e ordenada da Proposal persistida;
- repository capaz de persistir e reidratar `partially-accepted`;
- migration PostgreSQL `0024_persist_partially_accepted_itinerary_proposals`;
- fragments de Itinerary e Decision compartilhados entre aceite integral e parcial;
- testes unitários de composição;
- testes PostgreSQL de aplicação, replay e rollback integral.

## 4. Fora de escopo

- Server Action para aceite parcial;
- seleção visual na tela de revisão;
- E2E específico do aceite parcial pelo navegador;
- regeneração de Itinerary Proposal;
- reaplicação posterior de uma Proposal já `partially-accepted`.

## 5. Unidade transacional

A sequência de aplicação mantém a ordem canônica já usada no aceite integral:

1. reservar Proposal Application;
2. carregar e validar a Proposal `ready`;
3. aplicar apenas os itens selecionados ao Itinerary;
4. persistir a Decision;
5. persistir a Proposal como `partially-accepted` com itens restantes;
6. concluir a Proposal Application como `succeeded`.

Todas as etapas executam dentro da mesma transação PostgreSQL. Falha em qualquer fragment causa rollback integral.

## 6. Idempotência e replay

A reserva utiliza a idempotency key e o fingerprint canônico do comando parcial.

- mesma key + mesmo fingerprint + aplicação concluída: replay;
- mesma key + fingerprint diferente: `fingerprint-conflict`;
- aplicação existente em andamento: `application-in-progress`;
- aplicação anterior falha: `application-failed`.

O replay não reaplica Proposed Activities ao Itinerary e não refinaliza a Proposal. A Decision é recuperada/persistida pelo mecanismo idempotente existente e o resultado preserva a versão já produzida.

## 7. Persistência de `partially-accepted`

A migration `0024` amplia somente o necessário:

- inclui `partially-accepted` na constraint de status;
- exige conteúdo de Proposal pronto;
- exige `accepted_at` não nulo;
- exige `updated_at = accepted_at`;
- mantém constraints temporais e de shape;
- não relaxa os demais estados do lifecycle.

O repository trata `partially-accepted` como conteúdo revisável. Ao salvar a transição parcial, a coleção `proposed_activities` é substituída exclusivamente pelas Proposed Activities ainda não aplicadas.

## 8. Compatibilidade com aceite integral

A arquitetura compartilhada foi ampliada por tipos de comando `full | partial`, preservando a lógica do aceite integral. A unidade transacional, o fragment de Itinerary e o fragment de Decision continuam únicos; apenas o fragment de Proposal ganhou operações específicas de carga/finalização parcial.

## 9. Critérios de aceite

- [x] port e factory públicos de aceite parcial;
- [x] Proposal Application usa `applicationType: "partial"`;
- [x] somente itens selecionados são aplicados ao Itinerary;
- [x] versão do Itinerary incrementa exatamente uma vez;
- [x] Decision registra seleção e efeitos aplicados;
- [x] Proposal persiste `partially-accepted`;
- [x] Proposed Activities não selecionadas permanecem na Proposal;
- [x] selected/remaining são validados contra a Proposal persistida;
- [x] replay não reaplica Itinerary;
- [x] replay não refinaliza Proposal;
- [x] conflitos de idempotência possuem códigos estáveis;
- [x] rollback remove Application/Decision e restaura Itinerary/Proposal em falha;
- [x] schema e migration aceitam `partially-accepted` sem relaxar outros estados;
- [x] repository reidrata Proposal parcialmente aceita;
- [x] aceite integral mantém compatibilidade;
- [x] testes unitários e PostgreSQL aprovados;
- [x] Engineering Validation técnico aprovado;
- [x] registry, Context Pack e matriz de rastreabilidade sincronizados;
- [ ] Documentation Validation e Engineering Validation aprovados no HEAD canônico antes do merge.

## 10. Evidências técnicas

- domínio/port: `modules/proposal-management/src/accept-itinerary-proposal-partially.ts`;
- transação: `packages/database/src/apply-itinerary-proposal-partially-transaction.ts`;
- Proposal fragment: `packages/database/src/itinerary-proposal-transaction-fragment.ts`;
- Itinerary fragment: `packages/database/src/itinerary-transaction-fragment.ts`;
- Decision fragment: `packages/database/src/decision-transaction-fragment.ts`;
- repository: `packages/database/src/proposal-repository.ts`;
- schema: `packages/database/src/proposal-schema.ts`;
- migration: `packages/database/drizzle/0024_persist_partially_accepted_itinerary_proposals.sql`;
- testes unitários: `packages/database/src/apply-itinerary-proposal-partially-transaction.test.ts`;
- testes PostgreSQL: `packages/database/src/apply-itinerary-proposal-partially-transaction-postgres.test.ts`;
- SHA técnico validado: `b17f57f24a93c4cb9eac930abdae1eb83dedf6cc`;
- Engineering Validation #1354 / run `31331066567`, attempt 2, job `93289823239`: success em format, docs, lint, typecheck, migration `0024`, testes, smoke, build e Playwright responsivo;
- governança sincronizada em registry e matriz no ciclo canônico da PR #249.

## 11. Próximo recorte esperado

O próximo incremento deve expor o aceite parcial em uma fronteira de aplicação autorizada, validando `trip:edit`, carregando a Proposal autoritativa, recebendo apenas IDs explicitamente selecionados e convertendo erros de domínio/transação em estados estáveis para a experiência web.
