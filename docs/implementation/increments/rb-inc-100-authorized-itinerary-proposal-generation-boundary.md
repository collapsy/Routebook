---
id: RB-INC-100
title: Fronteira Autorizada para Geração de Itinerary Proposal
description: Expõe a geração autoritativa de Itinerary Proposal para um ator autenticado e autorizado na fronteira server-side da aplicação.
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
  - authorization
  - server-action
related_documents:
  - RB-SEC-001
  - RB-ADR-007
  - RB-ADR-008
  - RB-INC-086
  - RB-INC-087
  - RB-INC-090
  - RB-INC-099
prerequisites:
  - RB-INC-086
  - RB-INC-087
  - RB-INC-090
  - RB-INC-099
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-100 — Fronteira Autorizada para Geração de Itinerary Proposal

## 1. Objetivo

Expor o serviço concreto do RB-INC-099 para um ator autenticado e autorizado na fronteira server-side, reutilizando sessão, Account Membership e autorização de Trip já existentes.

Issue: #225.

Branch: `feature/rb-inc-100-authorized-itinerary-proposal-generation-boundary`.

## 2. Contexto

O RB-INC-099 concluiu a composition root PostgreSQL da geração autoritativa. A lacuna seguinte é impedir que UI ou cliente acionem geração sem uma fronteira server-side que resolva sessão e autorização a partir de fontes confiáveis.

## 3. Escopo

- fronteira server-side de geração autoritativa;
- resolução de sessão autenticada;
- autorização da Trip antes da geração;
- derivação autoritativa de identidade e escopo;
- composição com o serviço do RB-INC-099;
- contrato estável de resultado/erro;
- testes de autorização e integração;
- governança canônica.

## 4. Fora de escopo

- experiência visual completa;
- alteração do algoritmo determinístico;
- nova política de lifecycle;
- Provider externo de IA;
- migrations sem alteração real de contrato de dados.

## 5. Critérios de aceite

- [ ] ator não autenticado não aciona geração;
- [ ] ator sem autorização de Trip não aciona geração;
- [ ] Account/actor não são aceitos cegamente do cliente;
- [ ] geração autorizada reutiliza o serviço concreto do RB-INC-099;
- [ ] erros esperados são estáveis e testáveis;
- [ ] testes cobrem sucesso, autenticação ausente e autorização negada;
- [ ] registry, Context Pack e matriz de rastreabilidade são atualizados;
- [ ] Engineering Validation e Documentation Validation passam no mesmo HEAD final.
