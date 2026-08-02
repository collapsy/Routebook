---
id: RB-CTX-085
title: Context Pack do RB-INC-085
description: Contexto mínimo para conectar AcceptItineraryProposal à transação PostgreSQL real e mapear somente erros oficiais conhecidos.
document_type: implementation-context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-02"
last_updated: "2026-08-02"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - application-service
  - database
  - error-mapping
related_documents:
  - RB-INC-085
  - RB-CORE-0004
  - RB-ARC-002
  - RB-ARC-003
  - RB-DATA-002
  - RB-ADR-027
  - RB-INC-072
  - RB-INC-084
prerequisites:
  - RB-INC-072
  - RB-INC-084
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-085

## 1. Missão

Publicar uma composition root concreta de `AcceptItineraryProposal` que normalize a entrada, execute a transação PostgreSQL real e converta somente erros conhecidos para a allowlist oficial.

## 2. Incremento

- ID: `RB-INC-085`;
- issue: `#195`;
- PR: `#196`;
- branch: `feature/rb-inc-085-postgres-accept-itinerary-proposal-service`;
- documento: `docs/implementation/increments/rb-inc-085-postgres-accept-itinerary-proposal-service.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-ARC-002, RB-ARC-003, RB-DATA-002 e RB-ADR-027;
3. RB-INC-072 e RB-INC-084;
4. `modules/proposal-management/src/accept-itinerary-proposal.ts`;
5. `modules/trip-management/src/proposal-application.ts`;
6. `packages/database/src/apply-itinerary-proposal-transaction.ts`;
7. migrations e constraints de Proposal Application.

## 4. Contrato operacional

```text
createPostgresAcceptItineraryProposal
├── transactionFactory padrão
│   └── createPostgresApplyItineraryProposalTransaction
├── wrapper allowlisted de erros
└── createAcceptItineraryProposal
    ├── normaliza input
    ├── cria fingerprint
    └── delega uma única vez
```

## 5. Invariantes

- o application service não coordena fragments;
- a transação recebe somente comando normalizado;
- `applied` e `replay` atravessam a fronteira sem perda de dados;
- `AcceptItineraryProposalError` existente é preservado por identidade;
- erro de domínio só é convertido quando há equivalência oficial;
- PostgreSQL só é convertido por combinação conhecida de `code` e `constraint`;
- wrappers Drizzle podem ser percorridos exclusivamente por `cause`;
- mensagens livres não determinam classificação;
- erro desconhecido é propagado.

## 6. Restrições

- não importar a factory concreta no módulo de domínio;
- não adicionar SQL ao application service;
- não criar Server Action;
- não resolver usuário ou participante;
- não revalidar páginas;
- não criar código de erro novo;
- não mapear genericamente todo `23503`, `23505` ou `23514`;
- não alterar schema ou migrations.

## 7. Testes mínimos

- normalização antes da transação;
- delegação única;
- resultado applied;
- resultado replay;
- erro de validação antes da transação;
- erro público preservado;
- cada erro de domínio mapeável;
- erro de tempo não mascarado;
- constraints PostgreSQL allowlisted;
- código ou constraint desconhecida propagada;
- falha técnica propagada;
- execução real PostgreSQL e replay.

## 8. Comandos

```bash
pnpm exec prettier --check packages/database/src/accept-itinerary-proposal-service.ts packages/database/src/accept-itinerary-proposal-service.test.ts packages/database/src/accept-itinerary-proposal-service-postgres.test.ts packages/database/src/index.ts docs/implementation/increments/rb-inc-085-postgres-accept-itinerary-proposal-service.md docs/implementation/context-packs/rb-inc-085-postgres-accept-itinerary-proposal-service.md docs/implementation/traceability-matrix.md docs/registry.md
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

- um erro técnico precisar de novo código público;
- uma constraint não permitir identificar Proposal ou Itinerary inequivocamente;
- o application service precisar conhecer autenticação ou autorização;
- a transação concreta não puder ser criada sem dependência web;
- o contrato de `applied` ou `replay` precisar mudar.
