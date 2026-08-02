---
id: RB-CTX-076
title: Context Pack do RB-INC-076
description: Fornece o contexto mínimo para adaptar o repository de Itinerary Proposal ao executor Drizzle escopado.
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
  - RB-INC-076
  - RB-CORE-0004
  - RB-ARC-003
  - RB-ARC-004
  - RB-DATA-002
  - RB-ADR-006
  - RB-ADR-027
  - RB-INC-055
  - RB-INC-067
  - RB-INC-073
  - RB-INC-074
  - RB-INC-075
prerequisites:
  - RB-ADR-027
  - RB-INC-055
  - RB-INC-073
  - RB-INC-074
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-076

## 1. Missão

Permitir que o repository PostgreSQL de Itinerary Proposal participe da transação externa do aceite integral sem acessar o database global nem abrir nested transaction.

## 2. Incremento

- ID: `RB-INC-076`;
- issue: `#175`;
- PR: `#176`;
- branch: `feature/rb-inc-076-scoped-proposal-repository`;
- arquivo: `docs/implementation/increments/rb-inc-076-scoped-proposal-repository.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. RB-ADR-006 e RB-ADR-027;
4. RB-INC-055, RB-INC-067 e RB-INC-073–075;
5. `packages/database/src/client.ts`;
6. `packages/database/src/proposal-repository.ts`;
7. `packages/database/src/proposal-repository.test.ts`;
8. `packages/database/src/itinerary-proposal-transaction-unit.ts`.

## 4. Contrato operacional

```text
Modo global
new DrizzleItineraryProposalRepository()
└── getDatabase()
    └── save → database.transaction(...)

Modo escopado
createPostgresItineraryProposalRepository(transactionExecutor)
└── repository(executor, useOwnTransaction=false)
    ├── create/find/list → executor
    └── save → executor direto
```

## 5. Invariantes

- todas as operações do modo escopado usam a mesma identidade de executor;
- validações de Trip e Itinerary usam o executor injetado;
- o modo escopado nunca chama `getDatabase()`;
- o modo escopado não abre nested transaction;
- o modo global continua abrindo transação própria em `save`;
- Proposal e Proposed Activities permanecem atomicamente consistentes;
- erro da transação superior reverte todos os writes;
- nenhuma query, schema ou regra de domínio é alterada.

## 6. Restrições

- não implementar o fragment de Itinerary Proposal;
- não adicionar locks ou isolation level;
- não alterar schema ou migrations;
- não alterar o lifecycle de Proposal;
- não acessar Itinerary ou Decision;
- não criar Server Action ou UI;
- não remover a atomicidade do modo global.

## 7. Decisões locais

- o executor é um `Pick` estrutural de `select`, `insert`, `update` e `delete`;
- o constructor mantém defaults compatíveis com o uso existente;
- um flag interno controla se o repository possui a transação de write;
- a factory pública fixa o modo escopado sem expor o flag;
- o helper `withWriteExecutor` centraliza a diferença entre os modos;
- o teste integrado força rollback após create, save, find e list.

## 8. Testes obrigatórios

- suíte histórica do repository;
- round trip de `requested`, `generating`, `ready`, `expired`, `rejected` e `accepted`;
- substituição de Proposed Activities;
- integridade de referências;
- visibilidade dentro da transação externa;
- rollback externo;
- ausência da Proposal após rollback;
- typecheck do transaction executor.

## 9. Comandos

```bash
pnpm exec prettier --check packages/database/src/proposal-repository.ts packages/database/src/proposal-repository.test.ts packages/database/src/index.ts docs/implementation/increments/rb-inc-076-scoped-proposal-repository.md docs/implementation/context-packs/rb-inc-076-scoped-proposal-repository.md docs/implementation/traceability-matrix.md docs/registry.md
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
