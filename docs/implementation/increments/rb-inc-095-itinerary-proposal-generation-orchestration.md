---
id: RB-INC-095
title: Orquestração do Lifecycle de Geração de Itinerary Proposal
description: Compõe repository, comandos canônicos e porta de geração em um application service interno que persiste requested, generating, ready ou failed.
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
  - application-service
  - generation
  - orchestration
related_documents:
  - RB-PRD-005
  - RB-PRD-006
  - RB-ARC-003
  - RB-INC-048
  - RB-INC-050
  - RB-INC-053
  - RB-INC-056
  - RB-INC-094
prerequisites:
  - RB-INC-094
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-095 — Orquestração do Lifecycle de Geração de Itinerary Proposal

## 1. Objetivo

Publicar um application service interno que componha `ItineraryProposalRepository`, `ItineraryProposalGenerationPort` e os comandos canônicos existentes para executar e persistir o lifecycle:

```text
requested → generating → ready | failed
```

Issue: #215.

Branch: `feature/rb-inc-095-itinerary-proposal-generation-orchestration`.

Pull request: #216.

## 2. Contexto

O RB-INC-094 publicou a porta e o adapter determinístico puro. Proposal Management já possuía comandos isolados para solicitar, iniciar, concluir e falhar uma Proposal, mas nenhuma porta de entrada interna coordenava essas capacidades.

Sem essa composição, uma futura Server Action precisaria controlar diretamente o lifecycle e conhecer detalhes de persistência, contrariando RB-ARC-003 e duplicando regras fora do módulo owner.

## 3. Resultado esperado

Dadas as informações autoritativas da solicitação e uma entrada de geração já normalizada, o serviço:

- cria e persiste a Proposal em `requested`;
- persiste a transição para `generating`;
- invoca exatamente uma vez a porta injetada;
- persiste a saída válida em `ready`;
- transforma falha da porta em Proposal `failed` com código estável;
- propaga falhas de repository sem simular um resultado terminal;
- não altera o Itinerary;
- não acessa banco, web, rede ou Provider diretamente.

## 4. Decisões

- o serviço depende de `ItineraryProposalGenerationPort`, não do adapter concreto;
- o repository e a porta são dependências explícitas;
- request, start, complete e fail reutilizam os serviços canônicos existentes;
- os instantes e IDs permanecem fornecidos pela chamada;
- falhas com código interno normalizável usam o namespace `itinerary-proposal-generation-<code>`;
- falhas desconhecidas usam `itinerary-proposal-generation-failed`;
- falha do repository não é convertida em falha da porta;
- a persistência é sequencial e observável, não uma transação longa;
- o retorno é a representação terminal persistida, `ready` ou `failed`.

## 5. Escopo

- comando e application service de geração;
- composição do repository com a porta;
- mapeamento seguro de falhas da porta;
- persistência sequencial dos estados;
- testes unitários de sucesso e falha;
- teste integrado do serviço com o adapter determinístico;
- exports públicos;
- documentação, Context Pack, registry e matriz.

## 6. Fora de escopo

- Server Action, página ou componente React;
- autenticação e autorização;
- composition root PostgreSQL;
- seleção de candidatos produtivos;
- leitura de Trip, Itinerary ou Planning Context repositories;
- Provider de IA, HTTP ou chamadas de rede;
- retries, filas ou recuperação de processamento interrompido;
- aplicação da Proposal ao Itinerary;
- migration ou alteração de schema.

## 7. Critérios de aceite

- [x] serviço usa somente contratos internos;
- [x] repository e porta são injetados;
- [x] Proposal é persistida em `requested`, `generating` e `ready` na ordem canônica;
- [x] porta é invocada exatamente uma vez;
- [x] saída da porta conclui e persiste a Proposal em `ready`;
- [x] falha conhecida da porta persiste `failed` com código estável;
- [x] falha desconhecida usa fallback estável;
- [x] falha de repository é propagada sem conversão indevida;
- [x] entradas e dependências não são mutadas;
- [x] nenhum efeito é aplicado ao Itinerary;
- [x] não existem dependências de web, banco, Drizzle, HTTP, Provider ou ambiente;
- [x] exports, registry, Context Pack e matriz estão atualizados;
- [ ] CI integral está verde no SHA definitivo.

## 8. Evidências

- application service: `modules/proposal-management/src/itinerary-proposal-generation-service.ts`;
- testes: `modules/proposal-management/src/itinerary-proposal-generation-service.test.ts`;
- exports: `modules/proposal-management/src/index.ts`;
- cobertura implementada: 10 testes de sucesso, lifecycle, falhas, persistência e imutabilidade;
- Increment, Context Pack, registry e matriz publicados na branch;
- runs, jobs, SHA definitivo, quantidade total de documentos, testes e E2E: pendentes do fechamento da PR #216.
