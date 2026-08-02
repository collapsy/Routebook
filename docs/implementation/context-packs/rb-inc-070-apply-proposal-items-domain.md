---
id: RB-CTX-070
title: Context Pack do RB-INC-070
description: Fornece o contexto mínimo para implementar a aplicação pura dos itens de Itinerary Proposal sobre o Itinerary.
document_type: implementation-context-pack
owner: Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - itinerary-planning
  - proposal-management
  - atomicity
related_documents:
  - RB-INC-070
  - RB-CORE-0004
  - RB-DOM-003
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-027
  - RB-INC-068
  - RB-INC-069
prerequisites:
  - RB-ADR-027
  - RB-INC-068
  - RB-INC-069
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-070

## 1. Missão

Implementar uma transformação determinística, integral e atômica em memória dos itens de `ApplyProposalItems` sobre um Itinerary carregado.

## 2. Incremento

- ID: `RB-INC-070`;
- issue: `#163`;
- branch: `feature/rb-inc-070-apply-proposal-items-domain`;
- arquivo: `docs/implementation/increments/rb-inc-070-apply-proposal-items-domain.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/implementation/README.md`;
4. RB-ADR-027;
5. RB-DOM-003, regras RB-BR-PRP-005, RB-BR-PRP-006, RB-BR-PRP-009 e RB-BR-PRP-010;
6. RB-DATA-001 e RB-DATA-002;
7. RB-INC-068;
8. RB-INC-069;
9. `modules/trip-management/src/itinerary.ts`;
10. `modules/trip-management/src/proposal-application.ts`.

## 4. Contrato operacional

```text
applyProposalItemsToItinerary
├── valida Trip, Itinerary e versão
├── valida referências únicas
├── cria cópia profunda
├── aplica itens na ordem
│   ├── add
│   ├── move
│   ├── update
│   └── remove
├── incrementa ItineraryVersion uma vez
└── retorna Itinerary resultante + IDs aplicados
```

## 5. Invariantes

- o agregado de entrada nunca é mutado;
- qualquer falha elimina o resultado intermediário;
- a ordem dos itens é semântica;
- cada Proposed Activity ID aparece uma vez;
- cada Activity canônica recebe no máximo uma operação;
- Activity `fixed` não é alterável;
- Free Periods não são alterados;
- a versão incrementa uma única vez, inclusive para coleção vazia;
- identidade de nova Activity nasce somente na aplicação.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os definidos na seção 9 do incremento.

## 7. Restrições

- não importar Proposal Management;
- não importar Decision Intelligence;
- não importar Database;
- não persistir;
- não alterar Proposal Status;
- não validar autorização ou TripContextVersion;
- não criar Planning Conflict;
- não implementar aceite parcial;
- não adicionar Server Action ou UI;
- não chamar Provider;
- não incrementar versão por item;
- não usar as operações atuais de Itinerary que incrementam versão individualmente.

## 8. Decisões locais

- cópia profunda manual preserva tipos e datas;
- `targetOrder` é baseado em 1;
- move no mesmo Dia é permitido;
- update preserva tipo, flexibilidade e Place quando omitidos;
- update remove horário e duração quando omitidos, alinhado ao contrato existente;
- add usa `custom`, `planned` e `flexible` como defaults;
- o relógio e o gerador de ActivityId são injetáveis;
- envelope e resultado são congelados, mas o Itinerary resultante permanece compatível com os aggregates mutáveis existentes.

## 9. Testes obrigatórios

- quatro operações em uma aplicação;
- coleção vazia;
- move no mesmo Dia;
- update com campos omitidos;
- identidades e versão divergentes;
- referências duplicadas;
- referências ausentes;
- Activity fixed;
- targetOrder inválido;
- ActivityId inválido ou duplicado;
- instante inválido;
- rollback em memória;
- resultado congelado.

## 10. Comandos

```bash
pnpm exec prettier --check modules/trip-management/src/proposal-application.ts modules/trip-management/src/proposal-application.test.ts docs/implementation/increments/rb-inc-070-apply-proposal-items-domain.md docs/implementation/context-packs/rb-inc-070-apply-proposal-items-domain.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/trip-management lint
pnpm --filter @routebook/trip-management typecheck
pnpm --filter @routebook/trip-management test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 11. Quando interromper e escalar

- a aplicação exigir alterar Free Period;
- uma regra exigir modificar Activity `fixed`;
- a semântica depender de TripContextVersion, autorização ou Planning Conflict;
- surgir necessidade de aceite parcial;
- o recorte exigir persistência ou escrita entre módulos;
- for necessário alterar a estratégia aprovada no RB-ADR-027.
