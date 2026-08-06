---
id: RB-INC-098
title: Adapter PostgreSQL do Contexto Autoritativo de Itinerary Proposal
description: Implementa a porta concreta PostgreSQL que carrega Itinerary, Recommendations e Places para a geração autoritativa de Itinerary Proposal.
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
  - postgresql
  - authoritative-context
related_documents:
  - RB-PRD-005
  - RB-PRD-006
  - RB-ARC-003
  - RB-ARC-004
  - RB-INC-096
  - RB-INC-097
prerequisites:
  - RB-INC-096
  - RB-INC-097
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-098 — Adapter PostgreSQL do Contexto Autoritativo de Itinerary Proposal

## 1. Objetivo

Implementar o adapter PostgreSQL concreto de `AuthoritativeItineraryProposalGenerationContextPort`, carregando um snapshot consistente, autoritativo e deterministicamente ordenado de Itinerary, Recommendations e Places associados a uma Trip.

Issue: #221.

Branch: `feature/rb-inc-098-postgres-authoritative-itinerary-proposal-context`.

Pull request: #222.

## 2. Contexto

O RB-INC-097 passou a depender de uma porta abstrata para carregar o contexto de geração. O recorte atual materializa essa porta em `@routebook/database`, sem mover regras de elegibilidade ou geração para a infraestrutura e sem alterar o schema existente.

## 3. Resultado esperado

- validar `tripId` e `asOf` antes de consultar o banco;
- confirmar a existência da Trip e de seu Itinerary autoritativo;
- carregar Dias e Atividades em ordenação estável;
- carregar Recommendations da Trip em ordenação estável;
- carregar somente os Places referenciados pelas Recommendations;
- detectar Recommendation sem Place correspondente;
- mapear os registros para os contratos do Proposal Management;
- executar a leitura sob snapshot PostgreSQL consistente;
- expor códigos de erro estáveis;
- preservar a responsabilidade do assembler sobre elegibilidade temporal e por status.

## 4. Escopo

- adapter Drizzle/PostgreSQL da porta autoritativa;
- transaction boundary de leitura `repeatable read` e `read only`;
- mapeamento de Itinerary, Dia, Atividade, Recommendation e Place;
- ordenação canônica;
- validações e erros estáveis;
- testes de integração PostgreSQL;
- exports e governança.

## 5. Fora de escopo

- migration ou alteração de schema;
- autenticação e autorização;
- Server Action, página ou componente React;
- criação ou persistência da Itinerary Proposal;
- alteração do algoritmo determinístico;
- HTTP, SDK externo ou Provider de IA.

## 6. Critérios de aceite

- [x] o adapter implementa a porta do RB-INC-097;
- [x] `tripId` inválido e `asOf` inválido produzem códigos estáveis;
- [x] Trip, Itinerary e Dias ausentes produzem erros distintos;
- [x] Dias são ordenados por posição, data e identificador;
- [x] Atividades são ordenadas por Dia, ordem e identificador;
- [x] Recommendations são ordenadas por geração e identificador;
- [x] Places são ordenados por identificador;
- [x] Recommendation sem Place correspondente é tratada como inconsistência;
- [x] a leitura usa snapshot transacional consistente;
- [x] o adapter não replica regras do assembler;
- [x] testes de integração exercitam o PostgreSQL real do CI;
- [ ] CI integral aprovado no mesmo SHA;
- [x] registry, Context Pack e matriz atualizados.

## 7. Evidências

- adapter: `packages/database/src/authoritative-itinerary-proposal-generation-context.ts`;
- testes: `packages/database/src/authoritative-itinerary-proposal-generation-context-postgres.test.ts`;
- exports: `packages/database/src/index.ts`;
- schema reutilizado: `packages/database/src/schema.ts`;
- nenhuma migration criada;
- formatação canônica aplicada pelo workflow `Format RB-INC-077`, run `31123628228`;
- issue: #221;
- Draft PR: #222.
