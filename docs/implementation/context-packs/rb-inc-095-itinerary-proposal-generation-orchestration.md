---
id: RB-CTX-095
title: Context Pack do RB-INC-095
description: Contexto operacional para compor e validar o lifecycle persistido de geração de Itinerary Proposal.
document_type: context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-05"
last_updated: "2026-08-05"
authors:
  - RouteBook Team
tags:
  - context-pack
  - implementation
  - itinerary-proposal
  - application-service
  - orchestration
related_documents:
  - RB-INC-095
  - RB-ARC-003
  - RB-PRD-005
  - RB-PRD-006
prerequisites:
  - RB-INC-094
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-095 — Orquestração do Lifecycle de Geração de Itinerary Proposal

## 1. Contexto operacional

Implementar a porta de entrada interna que coordena os comandos já existentes de Proposal Management com uma `ItineraryProposalGenerationPort` injetada.

O recorte recebe a solicitação e a entrada normalizada da geração. Ele não busca contexto, não seleciona candidatos e não autoriza o ator.

## 2. Dependências canônicas

- `ItineraryProposalRepository`;
- `ItineraryProposalGenerationPort`;
- `requestAndPersistItineraryProposal`;
- `startAndPersistItineraryProposalGeneration`;
- `completeAndPersistItineraryProposalGeneration`;
- `failAndPersistItineraryProposalGeneration`;
- lifecycle definido em `itinerary-proposal.ts`.

## 3. Sequência de execução

1. Persistir a solicitação em `requested`.
2. Persistir o início em `generating`.
3. Invocar uma única vez a porta de geração.
4. Concluir e persistir `ready` com o conteúdo retornado.
5. Se a porta falhar, normalizar o código interno.
6. Persistir `failed` usando o instante explícito da falha.
7. Retornar a representação terminal persistida.

## 4. Contrato de falhas

- código estruturado e normalizável: `itinerary-proposal-generation-<code>`;
- falha desconhecida: `itinerary-proposal-generation-failed`;
- falha de domínio ao concluir conteúdo inválido: deve produzir `failed` com código interno estável;
- falha do repository: deve ser propagada;
- a causa original da porta não deve vazar como contrato externo.

## 5. Testes mínimos

- sucesso com porta controlada;
- sucesso com `DeterministicItineraryProposalGenerator`;
- ordem `create → save generating → generate → save ready`;
- chamada única da porta;
- código conhecido normalizado;
- código desconhecido com fallback;
- falha de conteúdo retornado pela porta;
- falha no create;
- falha no save de `generating`;
- falha no save de `ready`;
- imutabilidade da entrada.

## 6. Guardrails

- não importar `apps/web`;
- não importar `@routebook/database` ou Drizzle;
- não acessar environment variables;
- não usar relógio ou UUID global oculto;
- não depender do adapter determinístico concreto;
- não consultar Trip, Itinerary, Place, Saved Place ou Recommendation;
- não alterar o Itinerary;
- não criar migration;
- não adicionar retry ou fila neste incremento;
- não esconder falha de repository.

## 7. Gates

- frozen install;
- Prettier;
- validação documental;
- lint;
- typecheck;
- migrations existentes;
- testes de domínio e componente;
- testes PostgreSQL existentes;
- smoke;
- build;
- Playwright responsivo existente.

## 8. Encerramento

O incremento estará pronto quando o application service persistir corretamente os estados terminais `ready` e `failed`, os guardrails forem comprovados pelos testes e o CI integral estiver verde no SHA definitivo.
