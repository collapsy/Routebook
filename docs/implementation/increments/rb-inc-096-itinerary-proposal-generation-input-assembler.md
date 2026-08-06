---
id: RB-INC-096
title: Assembler Determinístico de Entrada para Geração de Itinerary Proposal
description: Normaliza snapshots autoritativos de Itinerary, Recommendations e Places para a porta determinística de geração.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-05"
last_updated: "2026-08-05"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - generation
  - deterministic
  - input-assembler
related_documents:
  - RB-PRD-005
  - RB-PRD-006
  - RB-ARC-003
  - RB-INC-094
  - RB-INC-095
prerequisites:
  - RB-INC-094
  - RB-INC-095
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-096 — Assembler Determinístico de Entrada para Geração de Itinerary Proposal

## 1. Objetivo

Publicar um assembler interno, puro e determinístico que transforme snapshots autoritativos de Itinerary, Recommendations e Places em `days` e `candidates` consumidos por `ItineraryProposalGenerationPort`.

Issue: #217.

Branch: `feature/rb-inc-096-itinerary-proposal-generation-input-assembler`.

Pull request: #218.

## 2. Contexto

O RB-INC-094 publicou a porta e o adapter determinístico. O RB-INC-095 passou a orquestrar o lifecycle da Proposal, mas recebe uma entrada de geração já normalizada. Ainda faltava um contrato owner de Proposal Management para converter o contexto autoritativo da viagem em tal entrada sem transferir regras de elegibilidade para a futura camada web.

## 3. Resultado esperado

Dado um Itinerary, Recommendations e metadados de Places já carregados por uma composição externa, o assembler:

- ordena os Dias por data e identificador;
- deriva `existingActivityCount` das Atividades existentes;
- considera elegíveis somente Recommendations `generated` ou `presented`;
- aplica validade temporal usando `asOf` explícito;
- exige que todas as Recommendations pertençam à Trip do Itinerary;
- ordena candidatos por score decrescente e RecommendationId;
- mapeia metadados opcionais de duração e custo do Place;
- falha com códigos estáveis diante de inconsistências;
- não muta as entradas nem acessa relógio, UUID, banco, web ou rede.

## 4. Escopo

- snapshots internos de Itinerary, Recommendation e Place;
- assembler determinístico de `days` e `candidates`;
- elegibilidade por status e validade;
- ordenação canônica;
- validação de identidade, datas, duração, custo e moeda;
- erros estáveis;
- testes unitários e exports públicos;
- Increment, Context Pack, registry e matriz.

## 5. Fora de escopo

- repositories concretos, PostgreSQL ou transaction boundary;
- leitura direta de Trip, Itinerary, Recommendation ou Place;
- Server Action, página ou componente React;
- autenticação e autorização;
- criação e lifecycle da Proposal;
- Provider de IA, HTTP ou chamadas de rede;
- migration ou alteração de schema.

## 6. Critérios de aceite

- [x] mesma entrada e mesmo instante produzem saída semanticamente equivalente;
- [x] Dias são ordenados por data e TripDayId;
- [x] `existingActivityCount` é derivado das Atividades existentes;
- [x] Recommendations elegíveis usam status `generated` ou `presented`;
- [x] Recommendations futuras, expiradas ou inelegíveis são excluídas;
- [x] Recommendation de outra Trip é rejeitada;
- [x] candidatos são ordenados por score decrescente e RecommendationId;
- [x] Place ausente para Recommendation elegível falha com código estável;
- [x] duração, custo e moeda opcionais são preservados e validados;
- [x] Dias, Recommendations e Places duplicados são rejeitados;
- [x] entradas não são mutadas;
- [x] não existem dependências de web, banco, Drizzle, HTTP, Provider ou ambiente;
- [x] exports, registry, Context Pack e matriz estão atualizados;
- [ ] CI integral está verde no SHA definitivo.

## 7. Evidências

- assembler: `modules/proposal-management/src/itinerary-proposal-generation-input-assembler.ts`;
- testes: `modules/proposal-management/src/itinerary-proposal-generation-input-assembler.test.ts`;
- exports: `modules/proposal-management/src/index.ts`;
- cobertura implementada: 12 testes de ordenação, elegibilidade, mapeamento, determinismo, imutabilidade e falhas;
- Increment, Context Pack, registry e matriz publicados na branch;
- SHA definitivo: pendente;
- Engineering Validation: pendente;
- Documentation Validation: pendente;
