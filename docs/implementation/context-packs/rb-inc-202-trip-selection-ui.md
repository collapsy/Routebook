---
id: RB-CTX-202
title: Context Pack do RB-INC-202 — Minha seleção
description: Delimita a substituição visual de Salvos por TripPlacePreference no catálogo, detalhe e rota legada de seleção.
document_type: implementation-context-pack
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip-collection, web, ux]
related_documents: [RB-INC-202, RB-INC-201, RB-INC-200, RB-ADR-028, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004]
prerequisites: [RB-INC-201]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-202 — Minha seleção

## 1. Missão

Projetar a persistência canônica de `TripPlacePreference` na interface atual sem alterar domínio, schema, Proposal ou Roteiro.

## 2. Unidade de trabalho

- issue: #487;
- incremento: RB-INC-202;
- branch: `codex/issue-487-trip-selection-ui`;
- base: `d2887427aa84834d8074c538f091fcb5898f86f6`.

## 3. Leitura obrigatória

1. AGENTS.md;
2. RB-CORE-0004;
3. docs/README.md;
4. RB-DOM-001 a RB-DOM-004;
5. RB-ADR-028;
6. RB-INC-200;
7. RB-INC-201;
8. implementação atual de catálogo, detalhe e lugares-salvos;
9. repository canônico de TripPlacePreference.

## 4. Decisões normativas

- “Minha seleção” é o nome de interface;
- WANT = Quero ir;
- MAYBE = Talvez;
- NOT_INTERESTED = Não tenho interesse;
- MUST_DO = Imperdível;
- não avaliado = ausência de preferência;
- escolha não altera Activity;
- rota `/lugares-salvos` permanece técnica e transitória;
- controles devem compartilhar a mesma Server Action/regra;
- candidatos externos materializados por Quero ir viram WANT.

## 5. Restrições

- não alterar Domain ou ADR;
- não criar migration;
- não mudar Proposal;
- não implementar includeMaybe;
- não implementar PlanningRole;
- não implementar ReplanningWindow;
- não aplicar deploy;
- não remover Saved Places legado neste incremento.

## 6. Verificações

- catálogo e detalhe leem o mesmo repository;
- Clear remove apenas TripPlacePreference;
- MUST_DO é removido ao trocar intent;
- Minha seleção inclui as três intenções;
- adição manual ao roteiro na seleção exige WANT;
- navegação exibe Minha seleção;
- rota legada continua válida;
- testes de Server Action cobrem WANT, MAYBE, NOT_INTERESTED, MUST_DO e Clear;
- regressão integral passa.

## 7. Gate humano

Integração na main continua dependente de autorização humana explícita.
