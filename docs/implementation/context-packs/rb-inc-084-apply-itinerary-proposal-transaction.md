---
id: RB-CTX-084
title: Context Pack do RB-INC-084
description: Contexto mínimo para implementar e validar a composição PostgreSQL do aceite integral de Itinerary Proposal.
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
  - proposal-management
related_documents:
  - RB-INC-084
  - RB-CORE-0004
  - RB-DATA-002
  - RB-ADR-006
  - RB-ADR-027
  - RB-INC-072
  - RB-INC-073
  - RB-INC-074
  - RB-INC-075
  - RB-INC-079
  - RB-INC-083
prerequisites:
  - RB-ADR-027
  - RB-INC-075
  - RB-INC-079
  - RB-INC-083
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-084

## 1. Missão

Compor os quatro fragments PostgreSQL do aceite integral em uma única implementação concreta do port `ApplyItineraryProposalTransaction`, preservando atomicidade, idempotência e os contratos públicos já publicados.

## 2. Incremento

- ID: `RB-INC-084`;
- issue: `#191`;
- PR: `#194`;
- branch: `feature/rb-inc-084-apply-itinerary-proposal-transaction`;
- arquivo: `docs/implementation/increments/rb-inc-084-apply-itinerary-proposal-transaction.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. RB-DATA-002, RB-ADR-006 e RB-ADR-027;
4. RB-INC-072 a RB-INC-075;
5. RB-INC-079 e RB-INC-083;
6. `modules/proposal-management/src/accept-itinerary-proposal.ts`;
7. `packages/database/src/postgres-transaction-runner.ts`;
8. `packages/database/src/itinerary-proposal-transaction-unit.ts`;
9. os quatro arquivos `*-transaction-fragment.ts` envolvidos.

## 4. Fluxo obrigatório

```text
reserve Proposal Application
├── fingerprint-conflict → erro público
├── application-in-progress → erro público
├── application-failed → erro público
├── replay → resolver Decision idempotente e retornar replay
└── reserved
    ↓
loadForAcceptance Itinerary Proposal
    ↓
apply Itinerary
    ↓
persist Decision
    ↓
accept Itinerary Proposal
    ↓
succeed Proposal Application
    ↓
retornar applied
```

## 5. Invariantes

- uma única transação física por execução;
- um único executor escopado compartilhado;
- nenhuma nested transaction;
- reserva acontece antes de qualquer mutação de agregado;
- replay não reaplica Itinerary nem refinaliza Proposal/Application;
- Decision usa os resultados efetivamente persistidos;
- Proposal Application concluída é a última escrita;
- qualquer falha rejeita a transação inteira;
- ator precisa ser participante com ID resolvido;
- a ordem dos Proposed Activity IDs nunca é reordenada.

## 6. Restrições

- não criar Server Action;
- não implementar autorização web;
- não alterar UX;
- não introduzir partial acceptance;
- não tornar Recommendation obrigatória;
- não criar retry, compensação ou Outbox;
- não alterar schema sem falha concreta de contrato;
- não capturar erro de domínio para convertê-lo em sucesso.

## 7. Testes mínimos

- applied com ordem exata de fragments;
- replay terminal;
- três estados não executáveis da reserva;
- validação do ator;
- falha na Decision interrompe finalizações;
- commit integral no PostgreSQL;
- replay real no PostgreSQL;
- rollback por falha intermediária;
- nenhuma nested transaction;
- typecheck dos consumidores do export público.

## 8. Comandos

```bash
pnpm exec prettier --check packages/database/src/apply-itinerary-proposal-transaction.ts packages/database/src/apply-itinerary-proposal-transaction.test.ts packages/database/src/apply-itinerary-proposal-transaction-postgres.test.ts packages/database/src/index.ts docs/implementation/increments/rb-inc-084-apply-itinerary-proposal-transaction.md docs/implementation/context-packs/rb-inc-084-apply-itinerary-proposal-transaction.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/database lint
pnpm --filter @routebook/database typecheck
pnpm db:migrate
pnpm --filter @routebook/database test
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 9. Quando escalar

- o contrato público não permitir representar replay sem novo comportamento de produto;
- o actor participant não puder ser resolvido antes do port;
- algum fragment exigir transação própria;
- os resultados persistidos não fornecerem versão ou IDs necessários à Decision;
- a atomicidade exigir mudança incompatível com RB-ADR-027.
