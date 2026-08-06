---
id: RB-CTX-097
title: Context Pack do RB-INC-097
description: Contexto mínimo para manutenção da composição autoritativa da geração de Itinerary Proposal.
document_type: implementation-context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-06"
last_updated: "2026-08-06"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - itinerary-proposal
  - generation
  - authoritative-context
related_documents:
  - RB-INC-097
  - RB-INC-094
  - RB-INC-095
  - RB-INC-096
  - RB-ARC-003
prerequisites:
  - RB-INC-094
  - RB-INC-095
  - RB-INC-096
next_documents:
  - RB-CTX-098
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-097

## Objetivo do incremento

Compor uma porta de contexto autoritativo, o assembler determinístico e o lifecycle de geração e persistência sem introduzir dependência concreta de infraestrutura no Proposal Management.

## Arquivos owner

- `modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts`;
- `modules/proposal-management/src/index.ts`.

## Contratos principais

- `AuthoritativeItineraryProposalGenerationContextPort`;
- `AuthoritativeItineraryProposalGenerationContext`;
- `LoadAuthoritativeItineraryProposalGenerationContextInput`;
- `GenerateAuthoritativeItineraryProposalCommand`;
- `AuthoritativeItineraryProposalGenerationError`;
- `generateAuthoritativeItineraryProposal`.

## Regras preservadas

- `tripId` é obrigatório e normalizado antes do carregamento;
- `asOf` é fornecido explicitamente à porta e ao assembler;
- o `tripId` do Itinerary deve ser igual ao solicitado;
- a composição não replica elegibilidade, ordenação ou lifecycle;
- o assembler do RB-INC-096 continua owner de `days` e `candidates`;
- o serviço do RB-INC-095 continua owner das transições e persistência;
- relógio, IDs e dependências concretas são recebidos por parâmetro.

## Limites arquiteturais

A composição não pode importar ou acessar:

- `packages/database`;
- PostgreSQL, Drizzle ou migrations;
- `apps/web`;
- sessão ou autorização;
- HTTP, SDK externo ou Provider de IA;
- relógio ou UUID globais.

## Próxima lacuna

Implementar a porta concreta PostgreSQL capaz de produzir um snapshot consistente e deterministicamente ordenado de Itinerary, Recommendations e Places para uma Trip.

## Validação

- issue: #219;
- PR: #220;
- SHA validado: `9eb3de9e6fd9a1b2b1b2af63c1fafdfba653dc90`;
- Engineering Validation: run `31067491527`, job `92508196343`;
- merge commit: `8c8cce11d894feadd1f23a8d78c503642651628d`.
