---
id: RB-CTX-079
title: Context Pack do RB-INC-079
description: Contexto mínimo para implementar o fragment transacional de Itinerary no aceite integral de Itinerary Proposal.
document_type: implementation-context-pack
owner: Data and Persistence
status: Draft
version: "0.1.0"
created: "2026-08-02"
last_updated: "2026-08-02"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - database
  - transaction
  - itinerary-planning
related_documents:
  - RB-INC-079
  - RB-CORE-0004
  - RB-ARC-003
  - RB-ARC-004
  - RB-DOM-003
  - RB-DOM-004
  - RB-ADR-027
  - RB-INC-070
  - RB-INC-072
  - RB-INC-073
  - RB-INC-074
  - RB-INC-078
prerequisites:
  - RB-ADR-027
  - RB-INC-070
  - RB-INC-072
  - RB-INC-073
  - RB-INC-074
  - RB-INC-078
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-079

## 1. Missão

Encapsular leitura, validação, transformação e persistência do Itinerary em um fragment que opere exclusivamente sobre o executor PostgreSQL escopado da transação superior.

## 2. Incremento

- ID: `RB-INC-079`;
- issue: `#181`;
- PR: `#182`;
- branch: `feature/rb-inc-079-itinerary-transaction-fragment`;
- arquivo: `docs/implementation/increments/rb-inc-079-itinerary-transaction-fragment.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. RB-ADR-027;
4. RB-INC-070, RB-INC-072, RB-INC-073, RB-INC-074 e RB-INC-078;
5. `modules/trip-management/src/proposal-application.ts`;
6. `modules/proposal-management/src/accept-itinerary-proposal.ts`;
7. `packages/database/src/itinerary-repository.ts`;
8. `packages/database/src/itinerary-proposal-transaction-unit.ts`.

## 4. Contrato operacional

```text
createItineraryTransactionFragment(executor)
└── createPostgresItineraryRepository(executor)
    └── apply(command)
        ├── findByTripId
        ├── validate identity/version
        ├── applyProposalItemsToItinerary
        ├── save
        └── return aggregate + result
```

## 5. Invariantes

- a factory recebe exatamente o executor fornecido;
- nenhum método abre transação própria;
- o write ocorre somente após identidade, versão e transformação válidas;
- ausência ou identidade divergente usam `itinerary-not-found`;
- versão divergente usa `itinerary-version-mismatch`;
- `decidedAt` é o instante canônico da transformação;
- todos os itens são aplicados ou nenhum é persistido;
- a versão cresce uma única vez;
- a ordem dos Proposed Activity IDs é preservada;
- erros de domínio específicos permanecem distinguíveis;
- falhas técnicas são propagadas sem retry.

## 6. Restrições

- não reservar Proposal Application;
- não carregar ou finalizar Itinerary Proposal;
- não criar Decision;
- não compor o port transacional completo;
- não adicionar lock ou isolation level;
- não alterar domínio, schema ou migrations;
- não criar Server Action, autorização ou UI.

## 7. Decisões locais

- o fragment expõe uma única operação `apply`;
- o repository mínimo contém somente `findByTripId` e `save`;
- validações públicas ocorrem antes da transformação pura;
- a função do RB-INC-070 permanece a autoridade sobre operações add, move, update e remove;
- o retorno usa o aggregate efetivamente retornado pelo repository após o save.

## 8. Testes obrigatórios

- executor enviado à factory;
- aplicação integral e persistência única;
- versão e `updatedAt` resultantes;
- IDs aplicados em ordem;
- Itinerary ausente;
- identidade divergente;
- versão divergente;
- erro de domínio sem write;
- falhas de leitura e save sem retry;
- executor, factory, repository e comando inválidos.

## 9. Comandos

```bash
pnpm exec prettier --check packages/database/src/itinerary-transaction-fragment.ts packages/database/src/itinerary-transaction-fragment.test.ts packages/database/src/index.ts docs/implementation/increments/rb-inc-079-itinerary-transaction-fragment.md docs/implementation/context-packs/rb-inc-079-itinerary-transaction-fragment.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/database lint
pnpm --filter @routebook/database typecheck
pnpm --filter @routebook/database test
pnpm db:migrate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

## 10. Quando interromper e escalar

- a transformação exigir acesso a SQL ou outros aggregates;
- a versão precisar ser bloqueada com regra não aprovada;
- erro de item exigir novo código público de aceite;
- o repository escopado não preservar atomicidade;
- surgir necessidade de schema, migration ou lock explícito.
