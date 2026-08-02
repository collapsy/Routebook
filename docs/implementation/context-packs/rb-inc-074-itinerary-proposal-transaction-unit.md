---
id: RB-CTX-074
title: Context Pack do RB-INC-074
description: Fornece o contexto mínimo para compor fragments transacionais de Itinerary Proposal sobre um único executor PostgreSQL.
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
  - proposal-management
related_documents:
  - RB-INC-074
  - RB-CORE-0004
  - RB-ARC-003
  - RB-ARC-004
  - RB-DATA-002
  - RB-ADR-027
  - RB-INC-072
  - RB-INC-073
prerequisites:
  - RB-ADR-027
  - RB-INC-072
  - RB-INC-073
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-074

## 1. Missão

Compor quatro fragments transacionais genéricos sobre o executor escopado fornecido pelo `PostgresTransactionRunner`, sem antecipar SQL, repositories ou regras do aceite.

## 2. Incremento

- ID: `RB-INC-074`;
- issue: `#169`;
- PR: `#172`;
- branch: `feature/rb-inc-074-itinerary-proposal-transaction-unit`;
- arquivo: `docs/implementation/increments/rb-inc-074-itinerary-proposal-transaction-unit.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/implementation/README.md`;
4. RB-ADR-027;
5. RB-ARC-003 e RB-ARC-004;
6. RB-DATA-002;
7. RB-INC-072 e RB-INC-073;
8. `packages/database/src/postgres-transaction-runner.ts`;
9. `packages/database/src/index.ts`;
10. repositories existentes apenas como referência de limites, não para reutilização direta.

## 4. Contrato operacional

```text
ItineraryProposalTransactionUnit.execute(operation)
└── runner.execute(scopedExecutor =>
    ├── proposalApplication(scopedExecutor)
    ├── itineraryProposal(scopedExecutor)
    ├── itinerary(scopedExecutor)
    ├── decision(scopedExecutor)
    ├── freeze(context)
    └── operation(context)
)
```

## 5. Invariantes

- uma execução abre somente a transação controlada pelo runner;
- todas as factories recebem o mesmo executor;
- nenhuma factory recebe o host global;
- as factories são criadas em ordem fixa;
- a operação só inicia após os quatro fragments existirem;
- contexto transacional é congelado;
- falha de factory interrompe a composição;
- falha da operação é propagada;
- não existe retry ou compensação;
- nenhuma query ou regra de domínio pertence à unidade.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os definidos na seção 9 do incremento.

## 7. Restrições

- não importar Proposal Management ou Trip Management;
- não implementar `ApplyItineraryProposalTransaction` neste recorte;
- não adicionar SQL, repositories ou locks;
- não carregar ou persistir aggregates;
- não criar fragments concretos;
- não expor executor ou host no contexto entregue à operação;
- não criar retry, compensação ou nested transaction;
- não alterar schema ou migrations;
- não criar Server Action ou UI.

## 8. Decisões locais

- os quatro fragments são genericamente tipados;
- factories são obrigatórias e validadas no construtor;
- a ordem canônica começa por Proposal Application e termina em Decision;
- o contexto preserva a identidade exata retornada pelas factories;
- o contexto é congelado superficialmente;
- a operação é validada antes de abrir a transação;
- o resultado é retornado sem transformação.

## 9. Testes obrigatórios

- transação única;
- ordem das factories;
- executor compartilhado;
- contexto congelado;
- identidade dos fragments;
- resultado por identidade e tipo;
- falha de factory;
- interrupção dos fragments posteriores;
- falha da operação;
- ausência de retry;
- runner inválido;
- cada factory ausente;
- operação ausente.

## 10. Comandos

```bash
pnpm exec prettier --check packages/database/src/itinerary-proposal-transaction-unit.ts packages/database/src/itinerary-proposal-transaction-unit.test.ts packages/database/src/index.ts docs/implementation/increments/rb-inc-074-itinerary-proposal-transaction-unit.md docs/implementation/context-packs/rb-inc-074-itinerary-proposal-transaction-unit.md docs/implementation/traceability-matrix.md docs/registry.md
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

- o recorte exigir SQL concreto;
- uma regra de negócio precisar entrar na unidade;
- fragments precisarem de executores diferentes;
- for necessário expor o executor à operação;
- surgir necessidade de retry ou compensação;
- a implementação contrariar a transação local aprovada no RB-ADR-027.
