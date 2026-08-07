---
id: RB-INC-099
title: Serviço Concreto de Geração Autoritativa de Itinerary Proposal
description: Compõe o contexto PostgreSQL, o repository PostgreSQL e o generator determinístico em um serviço concreto para fronteiras autorizadas da aplicação.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-07"
last_updated: "2026-08-07"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - generation
  - postgresql
  - composition
related_documents:
  - RB-PRD-005
  - RB-PRD-006
  - RB-ARC-003
  - RB-ARC-004
  - RB-INC-095
  - RB-INC-096
  - RB-INC-097
  - RB-INC-098
prerequisites:
  - RB-INC-095
  - RB-INC-096
  - RB-INC-097
  - RB-INC-098
next_documents:
  - RB-INC-100
ai_context:
  priority: critical
  index: true
---

# RB-INC-099 — Serviço Concreto de Geração Autoritativa de Itinerary Proposal

## 1. Objetivo

Compor o adapter PostgreSQL de contexto autoritativo, o repository PostgreSQL de Itinerary Proposal e o generator determinístico em um serviço concreto pronto para ser chamado por uma fronteira autorizada da aplicação.

Issue: #223.

Branch: `feature/rb-inc-099-authoritative-itinerary-proposal-service`.

PR: #224.

## 2. Contexto

O RB-INC-098 concluiu a infraestrutura concreta necessária para carregar o contexto autoritativo. A lacuna do RB-INC-099 foi materializar a composição das dependências já existentes sem mover autorização, UI ou regras de negócio para a infraestrutura.

## 3. Resultado entregue

- composição concreta para geração autoritativa de Itinerary Proposal;
- reutilização do adapter PostgreSQL do RB-INC-098;
- reutilização do repository PostgreSQL existente para Itinerary Proposal;
- reutilização do generator determinístico e do lifecycle do Proposal Management;
- relógio, IDs e dependências não determinísticas mantidos explícitos;
- erros estáveis e boundaries arquiteturais preservados;
- composição coberta por teste PostgreSQL de integração.

## 4. Escopo concluído

- composição concreta de dependências;
- contrato de serviço para fronteiras autorizadas;
- testes de integração;
- exports e governança canônica.

## 5. Fora de escopo

- autenticação e autorização da fronteira;
- Server Action, página ou componente React;
- alterações no algoritmo determinístico;
- Provider externo de IA;
- migrations sem alteração real de contrato de dados.

## 6. Critérios de aceite

- [x] existe um serviço concreto que compõe contexto, repository e generator;
- [x] a composição não duplica regras de elegibilidade ou lifecycle;
- [x] dependências não determinísticas permanecem explícitas;
- [x] erros são estáveis e testáveis;
- [x] testes de integração cobrem o fluxo concreto;
- [x] registry e Context Pack utilizam os IDs canônicos `RB-INC-099` e `RB-CTX-099`;
- [x] Documentation Validation e Engineering Validation passaram no mesmo HEAD final `dcb2e46d18948d1a49f81c527af219796144b7d4`;
- [x] Documentation Validation #859, run `31200795096`, passou no HEAD final;
- [x] Engineering Validation #1220, run `31200795135`, passou no HEAD final com format, docs, lint, typecheck, migrations, testes, smoke, build e Playwright responsivo;
- [x] PR #224 foi integrada por squash merge e fechou a issue #223;
- [x] a `main` resultante avançou para `6c13f614c4a649f1c2ae1234bef32af7b83aab9d`.

## 7. Continuidade

A lacuna canônica seguinte foi aberta como RB-INC-100 / issue #226 / PR #228: expor este serviço por uma fronteira server-side autenticada e autorizada da aplicação, preservando a separação entre autorização, infraestrutura e Proposal Management.
