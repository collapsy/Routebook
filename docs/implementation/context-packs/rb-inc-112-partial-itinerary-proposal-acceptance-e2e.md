---
id: RB-CTX-112
title: Context Pack do RB-INC-112 — E2E do Aceite Parcial de Itinerary Proposal
description: Contexto e limites do teste persistido de aplicação parcial e replay idempotente pelo navegador.
document_type: implementation-context
owner: Engineering
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - partial-acceptance
  - e2e
  - context-pack
related_documents:
  - RB-INC-112
  - RB-INC-111
  - RB-PRD-006
  - RB-UX-005
prerequisites:
  - RB-INC-111
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-112 — E2E do Aceite Parcial de Itinerary Proposal

## Objetivo

Delimitar a prova E2E do aceite parcial autorizado, incluindo estado visual, persistência, rastreabilidade e idempotência.

## Documentos obrigatórios

- RB-CORE-0004 — RouteBook Bible;
- RB-PRD-006 — Requisitos Funcionais;
- RB-UX-005, especialmente RB-INT-066 e RB-INT-067;
- RB-INC-108 — núcleo do aceite parcial;
- RB-INC-109 — transação PostgreSQL;
- RB-INC-110 — Server Action autorizada;
- RB-INC-111 — experiência de seleção e feedback.

## Caminhos permitidos

- `apps/web/e2e/itinerary-proposal-review.spec.ts`;
- `apps/web/app/viagens/[tripId]/roteiro/proposta/partial-accept-action.ts`;
- documentos de implementação, registry e matriz do RB-INC-112.

O segundo caminho foi incluído após o primeiro ciclo E2E revelar que a revalidação da Proposal remontava a página antes da navegação de sucesso. A ampliação foi registrada na issue #256 e ficou restrita ao redirect pós-sucesso.

## Jornada obrigatória

1. criar Itinerary e Proposal pronta com duas mudanças;
2. abrir a seleção parcial como usuário autorizado;
3. selecionar exatamente uma Proposed Activity;
4. confirmar e receber feedback no Roteiro;
5. verificar Itinerary, Proposal, Proposal Application e Decision no PostgreSQL;
6. repetir a mesma confirmação em contexto concorrente;
7. comprovar replay e ausência de efeitos duplicados.

## Invariantes verificadas

- somente IDs selecionados são aplicados;
- itens não selecionados permanecem na Proposal;
- Itinerary avança exatamente uma versão;
- aplicação e decisão são únicas por idempotency key;
- replay não reaplica mutações;
- feedback distingue `partial-applied` de `partial-replay`.

## Comportamento da Server Action

Erros de validação, autorização, conflito ou indisponibilidade retornam estado recuperável. Sucesso revalida Trip e Roteiro e redireciona no servidor. O redirect deve permanecer fora do `try/catch` para não ser convertido em `technical-error`.

## Testes obrigatórios

- lint e typecheck;
- suíte de componentes e domínio;
- build;
- Playwright responsivo com PostgreSQL;
- validação documental após registrar o incremento.

## Fora de escopo

- alteração de domínio ou schema;
- nova UX;
- aplicação dos itens restantes;
- mudanças em providers ou infraestrutura.
