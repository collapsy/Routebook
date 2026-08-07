---
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
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-099 — Serviço Concreto de Geração Autoritativa de Itinerary Proposal

## 1. Objetivo

Compor o adapter PostgreSQL de contexto autoritativo, o repository PostgreSQL de Itinerary Proposal e o generator determinístico em um serviço concreto pronto para ser chamado por uma fronteira autorizada da aplicação.

Issue: #223.

Branch: `feature/rb-inc-099-authoritative-itinerary-proposal-service`.

## 2. Contexto

O RB-INC-098 concluiu a infraestrutura concreta necessária para carregar o contexto autoritativo. A próxima lacuna canônica é materializar a composição das dependências já existentes sem mover autorização, UI ou regras de negócio para a infraestrutura.

## 3. Resultado esperado

- expor uma composição concreta para geração autoritativa de Itinerary Proposal;
- reutilizar o adapter PostgreSQL do RB-INC-098;
- reutilizar o repository PostgreSQL já existente para Itinerary Proposal;
- reutilizar o generator determinístico e o lifecycle do Proposal Management;
- manter relógio, IDs e dependências explícitas;
- preservar erros estáveis e boundaries arquiteturais;
- cobrir a composição com testes de integração.

## 4. Escopo

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

- [ ] existe um serviço concreto que compõe contexto, repository e generator;
- [ ] a composição não duplica regras de elegibilidade ou lifecycle;
- [ ] dependências não determinísticas permanecem explícitas;
- [ ] erros são estáveis e testáveis;
- [ ] testes de integração cobrem o fluxo concreto;
- [ ] CI integral passa no mesmo SHA;
- [ ] registry, Context Pack e matriz de rastreabilidade são atualizados.
