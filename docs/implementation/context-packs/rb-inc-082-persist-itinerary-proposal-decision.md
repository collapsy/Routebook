---
id: RB-CTX-082
title: Context Pack do RB-INC-082
description: Contexto mínimo para liberar a persistência PostgreSQL da Decision de aceite de Itinerary Proposal.
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
  - migration
  - decision-intelligence
related_documents:
  - RB-INC-082
  - RB-CORE-0004
  - RB-DATA-002
  - RB-ADR-006
  - RB-ADR-027
  - RB-INC-080
  - RB-INC-081
prerequisites:
  - RB-ADR-027
  - RB-INC-080
  - RB-INC-081
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-082

## 1. Missão

Remover o bloqueio físico que impede a Decision `accept-itinerary-proposal` de ser persistida na tabela `decisions`, sem ampliar o schema além do check constraint.

## 2. Incremento

- ID: `RB-INC-082`;
- issue: `#187`;
- PR: `#188`;
- branch: `feature/rb-inc-082-persist-itinerary-proposal-decision`;
- arquivo: `docs/implementation/increments/rb-inc-082-persist-itinerary-proposal-decision.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. RB-DATA-002, RB-ADR-006 e RB-ADR-027;
4. RB-INC-080 e RB-INC-081;
5. `modules/decision-intelligence/src/decision.ts`;
6. `packages/database/src/decision-schema.ts`;
7. `packages/database/src/decision-repository.ts`;
8. `packages/database/drizzle/0008_create_decisions.sql`;
9. `packages/database/drizzle/0012_ignore_planning_risk.sql`;
10. `packages/database/drizzle/meta/_journal.json`.

## 4. Contrato operacional

```text
Migration 0018
├── drop decisions_type_check
└── add decisions_type_check
    ├── save-place
    ├── add-to-itinerary
    ├── ignore-planning-risk
    └── accept-itinerary-proposal
```

## 5. Invariantes

- somente o conjunto permitido de `type` muda;
- colunas, índices e foreign keys permanecem iguais;
- JSONB continua sendo a representação de option, snapshot e effect;
- repository continua responsável pelo replay idempotente;
- a Decision reidratada passa novamente pelas validações do domínio;
- um executor escopado não abre nested transaction;
- rollback externo remove o insert;
- valores desconhecidos continuam rejeitados pelo banco.

## 6. Restrições

- não adicionar colunas;
- não alterar foreign keys ou índices;
- não transformar dados existentes;
- não implementar fragment transacional;
- não compor o aceite integral;
- não criar Server Action, autorização ou UI.

## 7. Decisões locais

- a migration é manual e segue o padrão de drop/add de constraints existente;
- o journal recebe o índice `18` e tag correspondente ao arquivo;
- o teste usa uma Trip real para respeitar a foreign key;
- option, snapshot e effect são comparados por igualdade integral após reidratação;
- o rollback é validado fora da transação com repository global;
- a rejeição de valor desconhecido é verificada pelo código PostgreSQL `23514`.

## 8. Testes obrigatórios

- aplicação da migration;
- round trip completo;
- find por ID e idempotency key;
- listagem por Trip;
- replay sem segundo insert;
- executor escopado;
- ausência de nested transaction;
- rollback externo;
- tipo desconhecido rejeitado.

## 9. Comandos

```bash
pnpm exec prettier --check packages/database/src/decision-schema.ts packages/database/src/itinerary-proposal-decision-repository.test.ts packages/database/drizzle/meta/_journal.json docs/implementation/increments/rb-inc-082-persist-itinerary-proposal-decision.md docs/implementation/context-packs/rb-inc-082-persist-itinerary-proposal-decision.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/database lint
pnpm --filter @routebook/database typecheck
pnpm db:migrate
pnpm --filter @routebook/database test
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

## 10. Quando interromper e escalar

- o banco possuir registros de tipo incompatível;
- a migration exigir alteração de dados;
- o novo fato exigir colunas ou relações adicionais;
- a reidratação não puder preservar o contrato do domínio;
- a constraint precisar ser substituída por enum PostgreSQL.
