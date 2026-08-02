---
id: RB-CTX-080
title: Context Pack do RB-INC-080
description: Contexto mínimo para adaptar o repository de Decision ao executor Drizzle escopado.
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
  - decision-intelligence
related_documents:
  - RB-INC-080
  - RB-CORE-0004
  - RB-ARC-003
  - RB-ARC-004
  - RB-DATA-002
  - RB-ADR-006
  - RB-ADR-027
  - RB-INC-073
  - RB-INC-074
  - RB-INC-076
  - RB-INC-078
  - RB-INC-079
prerequisites:
  - RB-ADR-027
  - RB-INC-073
  - RB-INC-074
  - RB-INC-078
  - RB-INC-079
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-080

## 1. Missão

Permitir que o repository PostgreSQL de Decision participe da transação externa do aceite integral sem acessar outro database e sem alterar sua idempotência ou semântica de erros.

## 2. Incremento

- ID: `RB-INC-080`;
- issue: `#183`;
- PR: `#184`;
- branch: `feature/rb-inc-080-decision-transactional-repository`;
- arquivo: `docs/implementation/increments/rb-inc-080-decision-transactional-repository.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. RB-ADR-006 e RB-ADR-027;
4. RB-INC-073, RB-INC-074, RB-INC-076, RB-INC-078 e RB-INC-079;
5. `modules/decision-intelligence/src/decision.ts`;
6. `modules/decision-intelligence/src/repository.ts`;
7. `packages/database/src/decision-repository.ts`;
8. `packages/database/src/decision-schema.ts`;
9. `packages/database/src/itinerary-proposal-transaction-unit.ts`.

## 4. Contrato operacional

```text
Modo global
new DrizzleDecisionRepository()
└── getDatabase()
    ├── findById
    ├── findByIdempotencyKey
    ├── listByTripId
    └── save

Modo escopado
createPostgresDecisionRepository(transactionExecutor)
└── DrizzleDecisionRepository(executor)
    ├── todas as leituras → executor
    ├── consulta idempotente → executor
    └── insert → executor
```

## 5. Invariantes

- toda operação usa a mesma identidade de executor;
- o modo escopado não chama `getDatabase()`;
- o repository não abre transação própria;
- idempotência permanece definida por Trip e chave;
- replay equivalente retorna o registro existente;
- serialização e reidratação mantêm o contrato público de Decision;
- violações únicas mantêm a classificação atual;
- rollback da transação superior remove o insert;
- falhas técnicas não recebem retry.

## 6. Restrições

- não ampliar `DecisionType`, `DecisionOption`, snapshot ou effect;
- não criar Decision de aceite de Itinerary Proposal;
- não implementar fragment transacional de Decision;
- não compor o port completo;
- não alterar schema ou migrations;
- não adicionar lock, isolation level, Server Action, autorização ou UI.

## 7. Decisões locais

- o executor mínimo contém `select` e `insert`;
- o constructor mantém default global compatível;
- a factory valida estruturalmente o executor;
- `save` reutiliza `findByIdempotencyKey`, garantindo a mesma sessão;
- testes integrados usam uma Decision de Planning Risk já suportada pelo domínio;
- rollback é verificado fora da transação com repository global.

## 8. Testes obrigatórios

- persistência global;
- leitura por ID;
- leitura por idempotência;
- replay sem novo insert;
- listagem por Trip;
- executor escopado;
- visibilidade antes do commit;
- ausência de nested transaction;
- rollback externo;
- executor inválido.

## 9. Comandos

```bash
pnpm exec prettier --check packages/database/src/decision-repository.ts packages/database/src/decision-repository.test.ts packages/database/src/index.ts docs/implementation/increments/rb-inc-080-decision-transactional-repository.md docs/implementation/context-packs/rb-inc-080-decision-transactional-repository.md docs/implementation/traceability-matrix.md docs/registry.md
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

- a persistência exigir operação além do contrato atual;
- idempotência precisar mudar de Trip e chave;
- a nova Decision de aceite exigir alteração arquitetural não documentada;
- o schema atual não comportar o novo tipo futuro;
- surgir necessidade de migration, lock ou isolation level.
