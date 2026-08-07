---
id: RB-INC-097
title: Composição Autoritativa da Geração de Itinerary Proposal
description: Compõe o contexto autoritativo da Trip, o assembler determinístico e o lifecycle de geração e persistência de Itinerary Proposal.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-06"
last_updated: "2026-08-06"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - generation
  - orchestration
  - authoritative-context
related_documents:
  - RB-PRD-005
  - RB-PRD-006
  - RB-ARC-003
  - RB-INC-094
  - RB-INC-095
  - RB-INC-096
prerequisites:
  - RB-INC-094
  - RB-INC-095
  - RB-INC-096
next_documents:
  - RB-INC-098
ai_context:
  priority: critical
  index: true
---

# RB-INC-097 — Composição Autoritativa da Geração de Itinerary Proposal

## 1. Objetivo

Compor a leitura do contexto autoritativo de uma Trip com o assembler determinístico do RB-INC-096 e o lifecycle de geração e persistência do RB-INC-095, preservando a separação entre domínio, aplicação e infraestrutura.

Issue: #219.

Branch: `feature/rb-inc-097-authoritative-itinerary-proposal-generation`.

Pull request: #220.

## 2. Contexto

O RB-INC-094 definiu a porta e o adapter determinístico de geração, o RB-INC-095 consolidou o lifecycle de persistência e o RB-INC-096 normalizou Itinerary, Recommendations e Places em `days` e `candidates`. Faltava uma composição de aplicação que carregasse o contexto por Trip, verificasse sua identidade e delegasse a geração sem conhecer PostgreSQL, web ou Provider externo.

## 3. Resultado entregue

- porta interna `AuthoritativeItineraryProposalGenerationContextPort`;
- comando explícito com `asOf`, `generatedAt`, `startedAt`, `failedAt` e fábrica de identificadores;
- validação do `tripId` solicitado;
- validação de correspondência entre a Trip solicitada e o Itinerary carregado;
- montagem determinística por meio de `assembleItineraryProposalGenerationInput`;
- delegação ao lifecycle `generateAndPersistItineraryProposal`;
- códigos de erro estáveis;
- exports públicos no módulo owner.

## 4. Escopo

- contrato de carregamento do contexto autoritativo;
- composição de application service;
- validação de identidade da Trip;
- integração com assembler e lifecycle existentes;
- exports e governança.

## 5. Fora de escopo

- adapter PostgreSQL concreto;
- autenticação e autorização;
- Server Action, página ou componente React;
- migration ou alteração de schema;
- HTTP, SDK externo ou Provider de IA.

## 6. Critérios de aceite

- [x] o contexto é carregado por `tripId` e `asOf` explícitos;
- [x] `tripId` vazio é rejeitado com código estável;
- [x] Itinerary pertencente a outra Trip é rejeitado;
- [x] a entrada da geração é montada pelo assembler canônico;
- [x] o lifecycle de request, generating, ready ou failed permanece centralizado;
- [x] o serviço não importa PostgreSQL, Drizzle, web ou Provider externo;
- [x] exports públicos foram atualizados;
- [x] CI integral foi aprovado no mesmo SHA antes do merge.

## 7. Evidências

- composição: `modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts`;
- exports: `modules/proposal-management/src/index.ts`;
- SHA validado: `9eb3de9e6fd9a1b2b1b2af63c1fafdfba653dc90`;
- Engineering Validation: run `31067491527`, job `92508196343`;
- pull request integrada: #220;
- merge commit: `8c8cce11d894feadd1f23a8d78c503642651628d`;
- issue encerrada automaticamente: #219.
