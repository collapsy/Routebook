---
id: RB-CTX-110
title: Context Pack do RB-INC-110 — Server Action Autorizada para Aceite Parcial de Itinerary Proposal
description: Contexto operacional da autorização, fronteira de confiança, composição e replay do aceite parcial na aplicação web.
document_type: implementation-context
owner: Engineering
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
  - context-pack
related_documents:
  - RB-INC-110
  - RB-INC-109
  - RB-INC-108
  - RB-PRD-006
  - RB-UX-005
prerequisites:
  - RB-INC-109
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-110 — Server Action Autorizada para Aceite Parcial de Itinerary Proposal

## Objetivo

Preservar as decisões da fronteira web que devem orientar a experiência visual e o E2E posteriores do aceite parcial.

## Documentos obrigatórios

- RB-CORE-0004 — RouteBook Bible;
- RB-PRD-006 — Requisitos Funcionais;
- RB-UX-005 — Especificações de Interação;
- RB-INC-108 — núcleo do aceite parcial;
- RB-INC-109 — transação PostgreSQL do aceite parcial.

## Caminhos permitidos

- `apps/web/lib/itinerary-proposal-partial-acceptance.ts`;
- `apps/web/lib/itinerary-proposal-partial-acceptance.test.ts`;
- `apps/web/app/viagens/[tripId]/roteiro/proposta/partial-accept-action.ts`;
- `packages/database/src/index.ts`;
- documentos de implementação, registry e matriz de rastreabilidade do RB-INC-110.

## Fronteira cliente/servidor

O cliente pode enviar somente:

- Trip ID;
- Itinerary Proposal ID;
- versão esperada do Itinerary;
- idempotency key;
- IDs explicitamente selecionados.

Título, horário, duração, operação, destino e qualquer outro conteúdo aplicável são reconstruídos da Proposal persistida.

## Autorização

A capability canônica é `trip:accept-proposal`. A resolução ocorre antes da carga de dados da Trip. O Participant é derivado pela correspondência entre o usuário autenticado e os participantes persistidos; identidade fornecida pelo formulário não é aceita.

## Validação autoritativa

- Proposal precisa pertencer à Trip e referenciar o Itinerary carregado;
- Proposal `ready` precisa estar temporalmente válida;
- Proposal base version, versão persistida do Itinerary e versão esperada precisam coincidir;
- seleção precisa ser não vazia, sem duplicatas, conhecida e estritamente parcial;
- Proposed Activities selecionadas são mapeadas somente após a seleção canônica do domínio.

## Composição

A fronteira chama `createAcceptItineraryProposalPartially` com `createPostgresApplyPartialItineraryProposalTransaction`. Ela não modifica o Itinerary diretamente e não replica a lógica transacional do RB-INC-109.

## Replay

Proposal `partially-accepted` só produz replay quando Proposal Application e Decision persistidas correspondem à mesma Trip, Itinerary, Proposal, ator, versão, seleção, tipo `partial` e idempotency key. Qualquer divergência retorna erro estável; o replay nunca reaplica o Itinerary.

## Erros estáveis

Os principais grupos são:

- acesso: `unauthenticated`, `not-found`;
- request/seleção: `invalid-request`, `selection-empty`, `duplicate-selection`, `unknown-proposed-activity`, `full-selection`;
- Proposal/Itinerary: `proposal-not-found`, `proposal-not-ready`, `proposal-expired`, `proposal-items-mismatch`, `itinerary-not-found`, `itinerary-version-mismatch`;
- idempotência: `fingerprint-conflict`, `application-in-progress`, `application-failed`;
- fallback: `technical-error`.

## Testes obrigatórios

- autorização anônima e participante não associado;
- versão stale e expiração;
- seleção válida e mapeamento autoritativo;
- replay persistido;
- Proposal não pronta;
- códigos de erro da transação;
- lint, typecheck, validação documental e Engineering Validation integral.

## Fora de escopo

- UI de seleção;
- feedback visual final;
- E2E pelo navegador;
- regeneração;
- mudança de lifecycle, invariantes ou transação.

## Próxima lacuna

Adicionar a experiência explícita de seleção e feedback do aceite parcial, seguida por E2E da jornada autorizada.
