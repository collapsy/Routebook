---
id: RB-CTX-109
title: Context Pack do RB-INC-109 — Transação PostgreSQL de Aceite Parcial de Itinerary Proposal
description: Contexto operacional da transação parcial, persistência do estado parcialmente aceito, idempotência e rollback.
document_type: implementation-context
owner: Engineering
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
  - context-pack
related_documents:
  - RB-INC-109
  - RB-INC-108
  - RB-PRD-006
  - RB-UX-005
prerequisites:
  - RB-INC-108
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-109 — Transação PostgreSQL de Aceite Parcial de Itinerary Proposal

## Objetivo

Preservar as decisões de persistência e composição que devem orientar Server Action, UX e E2E posteriores do aceite parcial.

## Fronteira transacional

O aceite parcial reutiliza a mesma `ItineraryProposalTransactionUnit` do aceite integral. Não existe uma segunda arquitetura transacional.

A ordem obrigatória é:

1. Proposal Application reserve;
2. load/validate da Proposal;
3. aplicação dos itens selecionados ao Itinerary;
4. persistência da Decision;
5. finalização da Proposal como `partially-accepted`;
6. Proposal Application succeed.

Qualquer falha reverte todos esses efeitos.

## Partição autoritativa

A transação não confia apenas no payload do caller. O fragment de Proposal compara a Proposal persistida com:

- `proposedActivityIds` selecionados;
- `remainingProposedActivityIds` calculados pelo núcleo do RB-INC-108.

Os dois vetores precisam formar uma partição exata, sem interseção, sem perda e preservando a ordem da Proposal persistida. Divergência produz `proposal-items-mismatch`.

## Aplicação do Itinerary

O fragment de Itinerary é compartilhado entre `full` e `partial`. Ele recebe somente `command.items`, portanto no aceite parcial:

- somente a seleção é aplicada;
- a versão atual precisa ser a versão esperada;
- a aplicação gera exatamente uma nova versão do Itinerary;
- o fragment não conhece nem modifica os itens restantes da Proposal.

## Proposal parcialmente aceita

`partially-accepted` é persistido como estado terminal deste fluxo. A Proposal preserva metadata de geração e mantém em `proposed_activities` somente os itens que não foram selecionados.

Este incremento não autoriza uma segunda aplicação sobre uma Proposal já `partially-accepted`. Os itens restantes existem para auditabilidade, revisão e experiência posterior.

## Proposal Application

O modelo existente já suporta `applicationType: "partial"`. Não foi criada nova tabela.

A reserva continua governando idempotência:

- mesma key/fingerprint concluído → replay;
- mesma key/fingerprint em andamento → `application-in-progress`;
- mesma key/fingerprint falho → `application-failed`;
- mesma key com outro fingerprint → `fingerprint-conflict`.

## Replay

Replay não pode:

- reaplicar Proposed Activities;
- criar nova versão do Itinerary;
- refinalizar a Proposal;
- alterar os itens restantes.

Ele retorna a versão já concluída e reutiliza a Decision pelo mecanismo idempotente persistido.

## Decision

O tipo canônico continua `accept-itinerary-proposal`. Para parcial, `proposedActivityIds` representa explicitamente o subconjunto escolhido e o efeito registra os IDs efetivamente aplicados. Não é necessário um novo DecisionType.

## Persistência PostgreSQL

A migration `0024_persist_partially_accepted_itinerary_proposals`:

- adiciona `partially-accepted` à constraint de status;
- adiciona ramo específico no lifecycle;
- exige `accepted_at` e `updated_at = accepted_at`;
- inclui o estado no shape de conteúdo revisável;
- preserva as demais constraints.

`DrizzleItineraryProposalRepository` reidrata o estado a partir do conteúdo persistido restante.

## Compatibilidade

As mudanças de fragments são aditivas por tipo (`AcceptItineraryProposalCommand | AcceptItineraryProposalPartiallyCommand`). O comportamento do aceite integral deve permanecer idêntico e continua coberto pela suíte existente.

## Erros públicos relevantes

Além dos erros de seleção introduzidos no RB-INC-108, a fronteira transacional pode devolver:

- `fingerprint-conflict`;
- `proposal-not-found`;
- `proposal-not-ready`;
- `proposal-expired`;
- `proposal-items-mismatch`;
- `itinerary-not-found`;
- `itinerary-version-mismatch`;
- `application-in-progress`;
- `application-failed`.

Erros legados do fragment compartilhado de Itinerary são convertidos para `PartialItineraryProposalAcceptanceError` antes de atravessar a fronteira pública parcial.

## Evidência técnica

O SHA `b17f57f24a93c4cb9eac930abdae1eb83dedf6cc` passou no Engineering Validation #1354 / run `31331066567`, attempt 2, job `93289823239`, incluindo migration `0024`, testes unitários/PostgreSQL e Playwright responsivo.

## Próxima lacuna

Expor essa transação em Server Action autorizada, resolvendo acesso `trip:edit`, Proposal autoritativa, seleção explícita e estados de erro consumíveis pela UI sem permitir que a fronteira web altere diretamente o Itinerary.
