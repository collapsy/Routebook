---
id: RB-INC-110
title: Server Action Autorizada para Aceite Parcial de Itinerary Proposal
description: Expõe o aceite parcial em uma fronteira web autorizada que reconstrói os itens aplicáveis a partir da Proposal persistida.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-09"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - partial-acceptance
  - authorization
  - server-action
  - idempotency
related_documents:
  - RB-PRD-006
  - RB-UX-005
  - RB-INC-108
  - RB-INC-109
prerequisites:
  - RB-INC-109
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-110 — Server Action Autorizada para Aceite Parcial de Itinerary Proposal

## 1. Objetivo

Expor o aceite parcial de `Itinerary Proposal` em uma fronteira web autorizada e determinística, consumindo a transação PostgreSQL do RB-INC-109 sem confiar em conteúdo de `Proposed Activity` enviado pelo cliente.

Issue: #250.

Branch: `feature/rb-inc-110-authorized-partial-itinerary-proposal-action`.

PR: #251.

## 2. Dependência canônica

O RB-INC-108 definiu seleção parcial, fingerprint e transição de domínio. O RB-INC-109 materializou a transação PostgreSQL atômica e idempotente. Este incremento adiciona exclusivamente a fronteira de aplicação autorizada e a Server Action; a experiência de seleção continua fora do escopo.

## 3. Escopo implementado

- application service web para aceite parcial;
- autorização pela capability `trip:accept-proposal`;
- Participant derivado da sessão autorizada e da Trip persistida;
- payload limitado a Trip ID, Proposal ID, versão esperada, idempotency key e IDs selecionados;
- carga autoritativa de Trip, Itinerary e Proposal no servidor;
- validação de seleção vazia, duplicada, desconhecida ou integral;
- reconstrução de `ApplyProposalItem` somente a partir das Proposed Activities persistidas;
- composição com `createAcceptItineraryProposalPartially` e a transação PostgreSQL do RB-INC-109;
- replay de Proposal `partially-accepted` por Proposal Application e Decision persistidas;
- estados serializáveis de sucesso e erro;
- Server Action com revalidação de Trip, Roteiro e Proposal;
- testes unitários de autorização, validação, aplicação, replay e erros.

## 4. Fora de escopo

- checkboxes ou seleção visual;
- feedback visual final;
- E2E específico pelo navegador;
- regeneração de Proposal;
- nova aplicação de itens restantes de uma Proposal `partially-accepted`.

## 5. Fronteira de confiança

O cliente não fornece título, horário, duração, operação nem destino aplicável. A fronteira aceita somente IDs e reconstrói os itens selecionados da Proposal persistida. A versão persistida do Itinerary e a versão-base da Proposal precisam coincidir com `expectedItineraryVersion`.

Anônimo e participante sem `trip:accept-proposal` não atravessam a fronteira. O ator do comando é o Participant associado ao usuário autenticado na Trip.

## 6. Replay idempotente

Quando a Proposal já está `partially-accepted`, a fronteira consulta a Proposal Application pela mesma idempotency key e valida Trip, Itinerary, ator, versão, tipo `partial` e seleção. Uma Decision persistida compatível é obrigatória para produzir `kind: replay`. O replay não reaplica itens nem cria nova versão do Itinerary.

## 7. Estados públicos

O estado de sucesso diferencia `applied` e `replay` e retorna os IDs aplicados/restantes, Decision, Proposal Application, fingerprint e versão resultante. Erros de autenticação, request, seleção, lifecycle, versão, idempotência e persistência são convertidos para códigos estáveis; exceções inesperadas viram `technical-error` na Server Action.

## 8. Critérios de aceite

- [x] capability `trip:accept-proposal` aplicada antes da carga da Trip;
- [x] ator derivado da sessão e da Trip;
- [x] cliente envia somente IDs, versão e idempotency key;
- [x] conteúdo aplicável reconstruído da Proposal persistida;
- [x] seleção vazia, duplicada, desconhecida e integral rejeitada;
- [x] Proposal e Itinerary autoritativos validados;
- [x] transação parcial do RB-INC-109 composta pela fronteira;
- [x] replay sequencial não reaplica o Itinerary;
- [x] estados de erro serializáveis e estáveis;
- [x] Server Action revalida as rotas afetadas após sucesso;
- [x] testes unitários focados aprovados;
- [x] lint e typecheck aprovados localmente;
- [x] Engineering Validation técnico aprovado no SHA corrigido;
- [x] registry, Context Pack e matriz de rastreabilidade sincronizados;
- [ ] Documentation Validation e Engineering Validation aprovados no HEAD canônico antes do merge.

## 9. Evidências técnicas

- application service: `apps/web/lib/itinerary-proposal-partial-acceptance.ts`;
- testes: `apps/web/lib/itinerary-proposal-partial-acceptance.test.ts`;
- Server Action: `apps/web/app/viagens/[tripId]/roteiro/proposta/partial-accept-action.ts`;
- composição pública de persistência: `packages/database/src/index.ts`;
- SHA técnico corrigido: `1b79e54b04cbe59c9b78f24d2e3291ea906c5a0a`;
- teste focado local: 10 testes aprovados;
- validação local: documentação válida com avisos preexistentes, lint e typecheck aprovados;
- Engineering Validation técnico: run `31493467942`, job `93785295900`, success integral em formato, documentação, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo;
- Playwright: 77 testes aprovados; dois casos de edição de Proposed Activity exigiram retry e foram anotados como flaky, fora do diff deste incremento.

## 10. Próximo recorte esperado

O próximo incremento deve oferecer a seleção visual explícita das Proposed Activities, apresentar feedback de erro/sucesso e cobrir a jornada de aceite parcial por E2E, sem ampliar as regras de domínio ou a transação.
