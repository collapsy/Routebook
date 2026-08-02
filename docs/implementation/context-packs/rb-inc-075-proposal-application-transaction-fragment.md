---
id: RB-CTX-075
title: Context Pack do RB-INC-075
description: Fornece o contexto mínimo para implementar o fragment transacional idempotente de Proposal Application.
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
  - idempotency
related_documents:
  - RB-INC-075
  - RB-CORE-0004
  - RB-ARC-003
  - RB-ARC-004
  - RB-DATA-002
  - RB-ADR-027
  - RB-INC-069
  - RB-INC-071
  - RB-INC-073
  - RB-INC-074
prerequisites:
  - RB-ADR-027
  - RB-INC-069
  - RB-INC-071
  - RB-INC-074
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-075

## 1. Missão

Implementar o fragment que reserva e conclui Proposal Applications dentro do executor PostgreSQL escopado, traduzindo o resultado técnico do repository em estados idempotentes explícitos para o aceite integral.

## 2. Incremento

- ID: `RB-INC-075`;
- issue: `#173`;
- PR: `#174`;
- branch: `feature/rb-inc-075-proposal-application-transaction-fragment`;
- arquivo: `docs/implementation/increments/rb-inc-075-proposal-application-transaction-fragment.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. RB-ADR-027;
4. RB-INC-069, RB-INC-071, RB-INC-073 e RB-INC-074;
5. `modules/proposal-management/src/proposal-application.ts`;
6. `modules/proposal-management/src/accept-itinerary-proposal.ts`;
7. `packages/database/src/proposal-application-repository.ts`;
8. `packages/database/src/itinerary-proposal-transaction-unit.ts`;
9. `packages/database/src/index.ts`.

## 4. Contrato operacional

```text
proposalApplicationFactory(scopedExecutor)
└── createProposalApplicationTransactionFragment
    ├── reserve(input)
    │   ├── startProposalApplication
    │   ├── repository.create
    │   └── classify created/replay/conflict by status
    ├── succeed(startedRecord, input)
    │   ├── succeedProposalApplication
    │   └── repository.saveTerminal
    └── fail(startedRecord, input)
        ├── failProposalApplication
        └── repository.saveTerminal
```

## 5. Invariantes

- o repository é criado com o executor recebido pela factory;
- não existe acesso a `getDatabase` no fragment;
- uma nova reserva produz application `started`;
- replay só representa application `succeeded`;
- application `started` existente nunca é tratada como replay concluído;
- application `failed` existente nunca é reiniciada implicitamente;
- fingerprint divergente não altera o record canônico;
- sucesso e falha partem somente de record `started`;
- o request canônico permanece associado ao record terminal;
- falhas do repository são propagadas sem retry.

## 6. Resultados de reserva

| Kind | Condição |
| --- | --- |
| `reserved` | repository criou uma nova tentativa |
| `replay` | mesmo fingerprint e application `succeeded` |
| `application-in-progress` | mesmo fingerprint e application `started` |
| `application-failed` | mesmo fingerprint e application `failed` |
| `fingerprint-conflict` | chave idempotente com fingerprint divergente |

## 7. Restrições

- não importar ou alterar Itinerary Proposal, Itinerary ou Decision;
- não compor o aceite integral;
- não adicionar SQL, schema ou migration;
- não usar database global;
- não criar retry ou compensação;
- não criar Server Action ou UI;
- não converter falhas técnicas do repository em resultados de negócio;
- não permitir replay de application `started` ou `failed`.

## 8. Decisões locais

- o record transacional especializa o tipo da application por status;
- a factory de repository é injetável apenas para testes e composição;
- o lifecycle de domínio executa a normalização e as transições;
- o fragment preserva TripId, ItineraryId e request ao concluir;
- os resultados de reserva são unions discriminados por `kind`;
- os records e resultados criados pelo fragment são congelados.

## 9. Testes obrigatórios

- executor compartilhado com a factory;
- criação única do repository;
- reserva `started` normalizada;
- classificação de todos os estados idempotentes;
- conclusão succeeded;
- conclusão failed;
- preservação do request;
- propagação de erro de criação;
- propagação de erro terminal;
- ausência de retry;
- validações de infraestrutura;
- reserva inválida antes de persistência.

## 10. Comandos

```bash
pnpm exec prettier --check packages/database/src/proposal-application-transaction-fragment.ts packages/database/src/proposal-application-transaction-fragment.test.ts packages/database/src/index.ts docs/implementation/increments/rb-inc-075-proposal-application-transaction-fragment.md docs/implementation/context-packs/rb-inc-075-proposal-application-transaction-fragment.md docs/implementation/traceability-matrix.md docs/registry.md
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

- o fragment precisar acessar outro aggregate;
- for necessário criar SQL novo;
- a classificação idempotente não puder ser determinada pelo record persistido;
- o repository existente não preservar atomicidade com o executor escopado;
- surgir necessidade de retry, compensação ou operação assíncrona externa.
