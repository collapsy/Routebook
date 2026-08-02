---
id: RB-CTX-073
title: Context Pack do RB-INC-073
description: Fornece o contexto mínimo para implementar o runner genérico que controla a transação física PostgreSQL.
document_type: implementation-context-pack
owner: Data and Persistence
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - database
  - transaction
  - postgresql
related_documents:
  - RB-INC-073
  - RB-CORE-0004
  - RB-ARC-003
  - RB-ARC-004
  - RB-DATA-002
  - RB-ADR-005
  - RB-ADR-006
  - RB-ADR-027
  - RB-INC-072
prerequisites:
  - RB-ADR-027
  - RB-INC-072
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-073

## 1. Missão

Implementar uma fronteira genérica e mínima sobre `host.transaction`, permitindo que adapters futuros executem todas as operações em um único executor PostgreSQL escopado.

## 2. Incremento

- ID: `RB-INC-073`;
- issue: `#168`;
- PR: `#171`;
- branch: `feature/rb-inc-073-postgres-transaction-runner`;
- arquivo: `docs/implementation/increments/rb-inc-073-postgres-transaction-runner.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/implementation/README.md`;
4. RB-ADR-005, RB-ADR-006 e RB-ADR-027;
5. RB-ARC-003 e RB-ARC-004;
6. RB-DATA-002;
7. RB-INC-072;
8. `packages/database/src/client.ts`;
9. `packages/database/src/index.ts`;
10. repositories existentes em `packages/database/src`.

## 4. Contrato operacional

```text
PostgresTransactionRunner.execute(operation)
└── host.transaction(scopedExecutor => operation(scopedExecutor))
    ├── resolve: retornar resultado original
    └── reject/throw: propagar erro ao host
```

## 5. Invariantes

- uma execução abre exatamente uma transação;
- uma operação é chamada exatamente uma vez;
- somente o executor escopado é entregue à operação;
- resultado não é transformado;
- erro não é traduzido;
- não existe retry;
- não existe compensação;
- nenhuma regra de domínio pertence ao runner;
- nenhuma query pertence ao runner.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os definidos na seção 9 do incremento.

## 7. Restrições

- não importar Proposal Management ou Trip Management;
- não implementar `ApplyItineraryProposalTransaction`;
- não carregar aggregates;
- não executar SQL de negócio;
- não receber o host global na callback do adapter;
- não criar retry automático;
- não engolir ou converter erros;
- não definir isolation level neste recorte;
- não criar nested transaction;
- não alterar schema ou migrations.

## 8. Decisões locais

- o contrato do host é estrutural para permanecer compatível com Drizzle sem acoplamento nominal;
- a operação é assíncrona e genericamente tipada;
- erro síncrono é propagado pela callback assíncrona;
- host inválido é rejeitado no construtor;
- callback inválido é rejeitado antes da abertura da transação;
- o runner é exportado pelo package Database para composição futura.

## 9. Testes obrigatórios

- transação chamada uma vez;
- operação chamada uma vez;
- executor correto;
- resultado por identidade;
- resultado genérico;
- erro síncrono;
- erro assíncrono;
- ausência de retry;
- host inválido;
- callback inválido.

## 10. Comandos

```bash
pnpm exec prettier --check packages/database/src/postgres-transaction-runner.ts packages/database/src/postgres-transaction-runner.test.ts packages/database/src/index.ts docs/implementation/increments/rb-inc-073-postgres-transaction-runner.md docs/implementation/context-packs/rb-inc-073-postgres-transaction-runner.md docs/implementation/traceability-matrix.md docs/registry.md
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

## 11. Quando interromper e escalar

- o recorte exigir queries ou repositories;
- for necessário definir isolation level específico;
- a solução exigir retry automático;
- surgir necessidade de nested transaction;
- o runner precisar conhecer erro de domínio;
- a implementação contrariar a transação local aprovada no RB-ADR-027.
