---
id: RB-CTX-078
title: Context Pack do RB-INC-078
description: Fornece o contexto mínimo para adaptar o repository de Itinerary ao executor Drizzle escopado.
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
  - drizzle
related_documents:
  - RB-INC-078
  - RB-CORE-0004
  - RB-ARC-003
  - RB-ARC-004
  - RB-DATA-002
  - RB-ADR-006
  - RB-ADR-027
  - RB-INC-070
  - RB-INC-073
  - RB-INC-074
  - RB-INC-076
  - RB-INC-077
prerequisites:
  - RB-ADR-027
  - RB-INC-070
  - RB-INC-073
  - RB-INC-074
  - RB-INC-077
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-078

## 1. Missão

Permitir que o repository PostgreSQL de Itinerary participe da transação externa do aceite integral sem acessar o database global nem abrir nested transaction.

## 2. Incremento

- ID: `RB-INC-078`;
- issue: `#179`;
- PR: `#180`;
- branch: `feature/rb-inc-078-itinerary-transactional-repository`;
- arquivo: `docs/implementation/increments/rb-inc-078-itinerary-transactional-repository.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. RB-ADR-006 e RB-ADR-027;
4. RB-INC-070, RB-INC-073, RB-INC-074, RB-INC-076 e RB-INC-077;
5. `packages/database/src/client.ts`;
6. `packages/database/src/itinerary-repository.ts`;
7. `packages/database/src/itinerary-repository.test.ts`;
8. `packages/database/src/itinerary-proposal-transaction-unit.ts`.

## 4. Contrato operacional

```text
Modo global
new DrizzleItineraryRepository()
└── getDatabase()
    ├── findByTripId → database
    └── save → database.transaction(...)

Modo escopado
createPostgresItineraryRepository(transactionExecutor)
└── repository(executor, useOwnTransaction=false)
    ├── findByTripId → executor
    └── save → executor direto
```

## 5. Invariantes

- todas as operações do modo escopado usam a mesma identidade de executor;
- o modo escopado nunca chama `getDatabase()`;
- o modo escopado não abre nested transaction;
- o modo global continua abrindo transação própria em `save`;
- Itinerary, Days, Activities e Free Periods permanecem atomicamente consistentes;
- erro da transação superior reverte todos os writes;
- ordem, IDs, versão e timestamps do aggregate permanecem preservados;
- nenhuma query, schema ou regra de domínio é alterada.

## 6. Restrições

- não implementar o fragment transacional de Itinerary;
- não aplicar Proposed Activity Items;
- não adicionar locks ou isolation level;
- não alterar schema ou migrations;
- não alterar regras de versionamento;
- não registrar Decision ou Proposal Application;
- não criar Server Action ou UI;
- não remover a atomicidade do modo global.

## 7. Decisões locais

- o executor é um `Pick` estrutural de `select`, `insert` e `delete`;
- o constructor mantém defaults compatíveis com o uso existente;
- um flag interno controla se o repository possui a transação de write;
- a factory pública fixa o modo escopado sem expor o flag;
- o helper `withWriteExecutor` centraliza a diferença entre os modos;
- o teste integrado força rollback após persistência e leitura dentro da transação externa.

## 8. Testes obrigatórios

- suíte histórica do repository;
- round trip integral do aggregate;
- substituição do aggregate existente;
- transação própria no modo global;
- visibilidade dentro da transação externa;
- ausência de nested transaction;
- rollback externo;
- ausência do Itinerary após rollback;
- executor inválido.

## 9. Comandos

```bash
pnpm exec prettier --check packages/database/src/itinerary-repository.ts packages/database/src/itinerary-repository.test.ts packages/database/src/index.ts docs/implementation/increments/rb-inc-078-itinerary-transactional-repository.md docs/implementation/context-packs/rb-inc-078-itinerary-transactional-repository.md docs/implementation/traceability-matrix.md docs/registry.md
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

- o transaction executor deixar de satisfazer as operações Drizzle necessárias;
- o modo global não puder preservar sua atomicidade;
- uma query exigir lock ou isolation level não documentado;
- o repository precisar conhecer regras do aceite;
- a alteração exigir migration ou novo modelo persistente.
