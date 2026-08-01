---
id: RB-CTX-063
title: Context Pack do RB-INC-063
description: Fornece o contexto mínimo para persistir e reidratar uma Itinerary Proposal rejeitada.
document_type: implementation-context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - proposal-management
  - persistence
  - rejection
related_documents:
  - RB-INC-063
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-006
  - RB-INC-055
  - RB-INC-059
  - RB-INC-062
prerequisites:
  - RB-INC-055
  - RB-INC-062
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-063

## 1. Missão

Persistir e reidratar Proposal `rejected` como snapshot auditável, reutilizando o aggregate público e preservando os demais estados.

## 2. Incremento

- ID: `RB-INC-063`;
- issue: `#142`;
- branch: `codex/rb-inc-063-rejected-persistence`;
- arquivo: `docs/implementation/increments/rb-inc-063-itinerary-proposal-rejected-persistence.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-063-itinerary-proposal-rejected-persistence.md`;
6. `docs/implementation/increments/rb-inc-049-itinerary-proposal-persistence.md`;
7. `docs/implementation/increments/rb-inc-055-itinerary-proposal-ready-persistence.md`;
8. `docs/implementation/increments/rb-inc-059-itinerary-proposal-expired-persistence.md`;
9. `docs/implementation/increments/rb-inc-062-itinerary-proposal-rejection.md`;
10. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-001 e RB-BR-PRP-004;
11. `docs/domain/domain-events-and-lifecycles.md`, ciclo da Itinerary Proposal;
12. `docs/data/logical-data-model.md`, Itinerary Proposal e `rejectedAt`;
13. `docs/data/physical-data-model-and-migrations.md`, `itinerary_proposals`;
14. `docs/architecture/adrs/rb-adr-006-database-orm-and-migration-strategy.md`;
15. `modules/proposal-management/src/itinerary-proposal.ts`;
16. schema, repository, testes, migration `0015` e journal do package database.

## 4. Contrato físico

```text
status = rejected
rejected_at IS NOT NULL
updated_at = rejected_at
rejected_at >= generated_at
snapshot ready completo
expired_at, failed_at e cancelled_at IS NULL
```

Nos demais estados, `rejected_at IS NULL`.

## 5. Reidratação obrigatória

```text
requestItineraryProposal
→ startItineraryProposalGeneration
→ completeItineraryProposalGeneration
→ rejectItineraryProposal(ready, rejectedAt)
```

Não construir `rejected` por cast ou objeto manual.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 8 do incremento.

## 7. Caminhos somente leitura

```text
apps/**
modules/**
packages/database/src/schema.ts
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/data/**
docs/ux/**
```

## 8. Restrições

- não alterar o aggregate neste incremento;
- não construir estado `rejected` manualmente;
- não remover ou renomear coluna existente;
- não adicionar motivo de rejeição;
- não criar comando, API, Server Action ou UI;
- não escrever no Itinerary ou em outro bounded context;
- não adicionar Provider, dependência, evento ou Outbox;
- não ampliar schema para outros estados ainda não implementados.

## 9. Testes obrigatórios

- save e find de `rejected` com snapshot completo;
- listagem estável contendo `rejected`;
- Proposed Activities preservadas;
- `rejected_at` ausente rejeitado;
- `rejected_at < generated_at` rejeitado;
- conteúdo incompleto rejeitado;
- `rejected_at` proibido nos demais estados;
- regressão dos estados anteriores.

## 10. Comandos

```bash
pnpm exec prettier --check packages/database/src/proposal-schema.ts packages/database/src/proposal-repository.ts packages/database/src/proposal-repository.test.ts packages/database/drizzle/0016_persist_rejected_itinerary_proposals.sql packages/database/drizzle/meta/_journal.json docs/implementation/increments/rb-inc-063-itinerary-proposal-rejected-persistence.md docs/implementation/context-packs/rb-inc-063-itinerary-proposal-rejected-persistence.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/database lint
pnpm --filter @routebook/database typecheck
pnpm --filter @routebook/proposal-management test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

Migrations e testes PostgreSQL devem ser executados no CI quando `DATABASE_URL` local não estiver disponível.

## 11. Quando interromper e escalar

- for necessário remover ou transformar dado existente;
- a migration exigir backfill não trivial;
- surgir necessidade de motivo, ator, autorização ou nova informação de rejeição;
- for necessária coordenação transacional com Itinerary ou Decision Intelligence;
- o adapter não puder reidratar pelo aggregate público.
