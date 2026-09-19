---
id: RB-CTX-206
title: Context Pack do RB-INC-206 — Proposal REPLAN e snapshot temporal
description: Delimita a integração da ReplanningWindow ao pipeline autoritativo de Itinerary Proposal e sua persistência aditiva.
document_type: implementation-context-pack
owner: Proposal Management and Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-09-19"
last_updated: "2026-09-19"
authors: [RouteBook Team]
tags: [implementation, context-pack, proposal, replanning]
related_documents: [RB-INC-206, RB-ADR-028, RB-INC-203, RB-INC-204, RB-INC-205, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002]
prerequisites: [RB-INC-205]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-206 — Proposal REPLAN e snapshot temporal

## 1. Missão

Integrar o valor calculado no RB-INC-205 ao pipeline existente de Proposal, persistindo contexto suficiente para auditoria e restringindo a composição REPLAN aos Dias elegíveis.

## 2. Unidade de trabalho

- issue: [#499](https://github.com/collapsy/Routebook/issues/499);
- PR: a abrir;
- branch: `codex/issue-499-proposal-replan-snapshot`;
- base: `main@9a37084ca36da79e74c89328a57a4d2585c4d660`;
- merge na main exige gate humano.

## 3. Leitura obrigatória

1. AGENTS.md;
2. RB-CORE-0004;
3. docs/README.md;
4. RB-DOM-001 a RB-DOM-004;
5. RB-ARC-002;
6. RB-ADR-028;
7. RB-INC-203;
8. RB-INC-204;
9. RB-INC-205.

## 4. Decisões já tomadas

- Proposal não é estado aplicado;
- `TripPlacePreference` é fonte autoritativa dos candidatos;
- `MAYBE` exige opt-in;
- `generationScope` é `INITIAL | REPLAN`;
- REPLAN usa ReplanningWindow timezone-aware;
- passado e trecho transcorrido são protegidos;
- pipeline não deve ser duplicado;
- add/move/update/remove são operações canônicas, mas a política automática deste incremento só produz add.

## 5. Fronteira entre módulos

Proposal Management define o snapshot serializável necessário à Proposal.

O adapter Database pode usar `@routebook/trip-management` para calcular ReplanningWindow e retornar a projeção estrutural ao Port de Proposal Management. Proposal Management não recebe nova dependência de Itinerary Planning.

## 6. Persistência

- migration número 0035;
- sem DROP/DELETE/UPDATE de dados de negócio;
- default INITIAL para compatibilidade;
- generation_context nullable para rows históricas;
- REPLAN novo não pode existir sem janela no contexto.

## 7. Validação temporal

- `asOf` é o `capturedAt` da janela;
- timezone vem do Itinerary persistido;
- Activities removidas/terminais continuam presentes na classificação da janela;
- seleção de candidatos continua excluindo Place já presente em Activity ativa;
- Free Period protected continua reduzindo capacidade conforme compositor vigente.

## 8. Não decidir neste incremento

- quando a UI deve oferecer REPLAN;
- se REPLAN deve ser automático por status/data;
- política de move/update/remove;
- algoritmo de otimização espacial adicional;
- novos motivos de exclusão;
- alterações em Domain/ADR.

## 9. Caminhos

Alterar somente os caminhos autorizados pelo RB-INC-206. Arquivo adicional indispensável deve ser primeiro registrado no incremento.

## 10. Gate humano

Após CI integral, PR permanece aberta até autorização explícita de merge.
