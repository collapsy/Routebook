---
id: RB-CTX-096
title: Context Pack do RB-INC-096
description: Contexto mínimo para manutenção e evolução do assembler determinístico de entrada da geração de Itinerary Proposal.
document_type: implementation-context-pack
owner: Proposal Management
status: Ready
version: "1.0.0"
created: "2026-08-05"
last_updated: "2026-08-05"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - itinerary-proposal
  - generation
  - input-assembler
related_documents:
  - RB-INC-096
  - RB-INC-094
  - RB-INC-095
  - RB-ARC-003
prerequisites:
  - RB-INC-094
  - RB-INC-095
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-096

## Objetivo do incremento

Converter snapshots autoritativos já carregados de Itinerary, Recommendations e Places em entrada normalizada para `ItineraryProposalGenerationPort`, sem banco, web ou Provider.

## Arquivos owner

- `modules/proposal-management/src/itinerary-proposal-generation-input-assembler.ts`;
- `modules/proposal-management/src/itinerary-proposal-generation-input-assembler.test.ts`;
- `modules/proposal-management/src/index.ts`.

## Contratos principais

- `AssembleItineraryProposalGenerationInput`;
- `AssembledItineraryProposalGenerationInput`;
- `ItineraryProposalSourceItinerary`;
- `ItineraryProposalSourceDay`;
- `ItineraryProposalSourceRecommendation`;
- `ItineraryProposalSourcePlace`;
- `ItineraryProposalGenerationInputAssemblyError`.

## Regras preservadas

- `asOf` é obrigatório e explícito;
- somente Recommendations `generated` e `presented` podem originar candidatos;
- `validFrom` é inclusivo e `expiresAt` é exclusivo;
- toda Recommendation deve pertencer à Trip do Itinerary;
- Dias são ordenados por data e TripDayId;
- candidatos são ordenados por score decrescente e RecommendationId;
- `existingActivityCount` deriva do tamanho da coleção de Atividades;
- Place é obrigatório apenas para Recommendation elegível;
- entradas não são mutadas;
- nenhuma fonte global de tempo ou identidade é permitida.

## Limites arquiteturais

O assembler não pode importar ou acessar:

- `apps/web`;
- repositories concretos;
- PostgreSQL, Drizzle ou migrations;
- HTTP, SDK externo ou Provider de IA;
- variáveis de ambiente;
- `Date.now()`, `new Date()` sem parâmetro ou UUID global.

## Próxima lacuna provável

Uma composição produtiva deve carregar Itinerary, Recommendations e Places autorizados, construir os snapshots deste incremento e chamar o serviço do RB-INC-095. Esse recorte deve manter autorização e infraestrutura fora do domínio puro.

## Validação

- issue: #217;
- PR: #218;
- branch: `feature/rb-inc-096-itinerary-proposal-generation-input-assembler`;
- SHA validado: `e2d3cd94a3a56c944c5cac51a65f2183bc9b84b0`;
- Documentation Validation: run `31065745508`, job `92502975148`;
- Engineering Validation: run `31065745496`, job `92502974835`;
- 232 documentos, 573 testes e 71 testes Playwright responsivos aprovados.
