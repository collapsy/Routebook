---
id: RB-CTX-093
title: Context Pack — RB-INC-093
description: Contexto operacional para validar o aceite integral de Itinerary Proposal da UI ao PostgreSQL.
document_type: context-pack
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-03"
last_updated: "2026-08-03"
authors:
  - RouteBook Team
tags:
  - context-pack
  - itinerary-proposal
  - acceptance
  - e2e
related_documents:
  - RB-INC-093
  - RB-INC-084
  - RB-INC-085
  - RB-INC-091
  - RB-INC-092
prerequisites:
  - RB-INC-092
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-093 — Context Pack do Aceite Integral E2E

## Objetivo operacional

Validar a cadeia:

`UI → autorização → Server Action → AcceptItineraryProposal → transação PostgreSQL → Itinerary + Proposal + Proposal Application + Decision → UI atualizada`.

## Fonte de verdade

- issue #211;
- branch `feature/rb-inc-093-itinerary-proposal-acceptance-e2e`;
- RB-ADR-027;
- contratos publicados pelos incrementos RB-INC-084, RB-INC-085, RB-INC-091 e RB-INC-092.

## Invariantes

- uma única transação física no primeiro aceite;
- nenhuma nested transaction;
- ator e itens derivados no servidor;
- `accepted` significa aplicação integral concluída;
- replay reutiliza Application, Decision, fingerprint, versão resultante e IDs aplicados;
- uma chave nova não pode reaplicar Proposal já aceita;
- erros não podem produzir falso sucesso visual;
- fixtures devem ser determinísticas e persistidas no PostgreSQL real.

## Caminhos principais

- `apps/web/lib/itinerary-proposal-acceptance.ts`;
- `apps/web/lib/itinerary-proposal-acceptance.test.ts`;
- `apps/web/e2e/itinerary-proposal-review.spec.ts`;
- `apps/web/app/viagens/[tripId]/roteiro/proposta/accept-action.ts`;
- `packages/database/src/apply-itinerary-proposal-transaction.ts`;
- `packages/database/src/apply-itinerary-proposal-transaction-postgres.test.ts`.

## Gates

- format;
- documentação;
- lint;
- typecheck;
- migrations;
- testes de domínio, componentes e PostgreSQL;
- smoke;
- build;
- Playwright responsivo.
