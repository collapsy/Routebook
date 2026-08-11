---
id: RB-CTX-111
title: Context Pack do RB-INC-111 — Experiência de Seleção e Aceite Parcial de Itinerary Proposal
description: Contexto da seleção explícita, feedback acessível e payload mínimo do aceite parcial na revisão da Proposal.
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
  - experience
  - context-pack
related_documents:
  - RB-INC-111
  - RB-INC-110
  - RB-PRD-006
  - RB-UX-005
prerequisites:
  - RB-INC-110
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-111 — Experiência de Seleção e Aceite Parcial de Itinerary Proposal

## Objetivo

Preservar as regras de interação e confiança que devem orientar o E2E posterior do aceite parcial.

## Documentos obrigatórios

- RB-CORE-0004 — RouteBook Bible;
- RB-PRD-006 — Requisitos Funcionais;
- RB-UX-005, especialmente RB-INT-066 e RB-INT-067;
- RB-INC-108 — núcleo do aceite parcial;
- RB-INC-109 — transação PostgreSQL;
- RB-INC-110 — fronteira web autorizada.

## Caminhos permitidos

- `apps/web/components/itinerary-proposal-decision-actions.tsx`;
- `apps/web/components/itinerary-proposal-decision-actions.test.tsx`;
- `apps/web/components/itinerary-proposal-decision-actions.module.css`;
- `apps/web/components/itinerary-proposal-review.tsx`;
- `apps/web/components/itinerary-proposal-review.test.tsx`;
- `apps/web/app/viagens/[tripId]/roteiro/page.tsx`;
- documentos de implementação, registry e matriz do RB-INC-111.

## Condições de disponibilidade

O controle parcial existe somente quando:

- o usuário pode aceitar a Proposal;
- a Proposal está pronta, atual e aplicável;
- existem ao menos duas Proposed Activities.

Proposal expirada, stale, somente leitura ou com um único item não apresenta o controle parcial.

## Seleção

- nenhum item é selecionado automaticamente;
- cada checkbox possui nome acessível com o título da Proposed Activity;
- o Dia aparece como contexto secundário;
- zero itens mantém a confirmação desabilitada;
- todos os itens mantêm a confirmação desabilitada e orientam o aceite integral;
- um subconjunto habilita a confirmação e informa a contagem.

## Payload

A UI pode enviar somente:

- `itineraryProposalId`;
- `expectedItineraryVersion`;
- `idempotencyKey` específica do fluxo parcial;
- um ou mais `selectedProposedActivityId`.

Título, Dia, operação, horário, duração e conteúdo aplicável não atravessam a fronteira como fonte de verdade.

## Estado concorrente

Pending de aceite integral, parcial ou descarte desabilita todos os controles de decisão. Isso evita duas decisões concorrentes na mesma Proposal a partir da mesma superfície.

## Feedback

- loading parcial anuncia aplicação da seleção;
- erro utiliza mensagem estável da Server Action;
- applied informa que a seleção foi aplicada;
- replay informa que a mesma seleção já havia sido aplicada;
- o Roteiro distingue `partial-applied` e `partial-replay` do aceite integral.

## Acessibilidade

- fieldset e legend agrupam a seleção;
- checkboxes possuem labels completos;
- contagem e orientação usam região viva;
- erros usam `role=alert`;
- sucesso usa `role=status`;
- foco visível e controles responsivos permanecem obrigatórios.

## Testes obrigatórios

- contrato mínimo do aceite integral preservado;
- subconjunto parcial enviado corretamente;
- zero/todos bloqueados;
- um único item sem controle parcial;
- usuário sem permissão sem decisões;
- pending parcial bloqueando outras ações;
- erro recuperável sem navegação;
- applied/replay integral e parcial;
- mapeamento de Proposed Activities da revisão para a seleção.

## Fora de escopo

- E2E;
- nova regra de domínio;
- seleção por Dia/bloco como comando agregado;
- nova aplicação dos itens restantes.

## Próxima lacuna

Validar por E2E desktop/mobile o fluxo completo e persistido do aceite parcial autorizado.
