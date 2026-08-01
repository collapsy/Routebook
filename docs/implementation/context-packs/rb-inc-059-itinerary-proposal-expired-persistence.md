---
id: RB-CTX-059
title: Context Pack do RB-INC-059
description: Fornece o contexto mínimo para persistir e reidratar a expiração temporal da Itinerary Proposal.
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
  - expiration
related_documents:
  - RB-INC-059
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-006
  - RB-INC-055
  - RB-INC-058
prerequisites:
  - RB-INC-055
  - RB-INC-058
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-059

## 1. Missão

Implementar a menor evolução aditiva de schema e adapter que materializa a expiração temporal já definida no domínio, preservando o snapshot auditável da Proposal `ready`.

## 2. Incremento

- ID: `RB-INC-059`;
- issue: `#134`;
- branch: `codex/rb-inc-059-expired-persistence`;
- arquivo: `docs/implementation/increments/rb-inc-059-itinerary-proposal-expired-persistence.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-059-itinerary-proposal-expired-persistence.md`;
6. `docs/implementation/increments/rb-inc-055-itinerary-proposal-ready-persistence.md`;
7. `docs/implementation/increments/rb-inc-058-itinerary-proposal-temporal-expiration.md`;
8. `docs/domain/domain-model.md`, Itinerary Proposal;
9. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-004 e RB-BR-PRP-008;
10. `docs/domain/domain-events-and-lifecycles.md`, Parte XVII;
11. `docs/data/logical-data-model.md`, Parte XII;
12. `docs/data/physical-data-model-and-migrations.md`, Partes XII e de migrations;
13. `docs/architecture/adrs/rb-adr-006-drizzle-orm-and-drizzle-kit-for-data-access-and-migrations.md`;
14. aggregate, schema, repository, migration `0014` e testes atuais.

## 4. Contrato de persistência

```text
ready + expireItineraryProposalByTime(expiredAt)
→ status = expired
→ expired_at = expiredAt
→ updated_at = expiredAt
→ conteúdo ready e Proposed Activities preservados
```

## 5. Schema físico

- adicionar `expired_at timestamptz` nullable;
- incluir `expired` no status permitido;
- em `ready`, exigir `expired_at` nulo;
- em `expired`, exigir o mesmo snapshot completo de `ready` e `expired_at` não nulo;
- exigir `expired_at >= valid_until` e `updated_at = expired_at`;
- manter `expired_at` nulo nos demais estados implementados.

## 6. Adapter

- estados portadores de conteúdo são `ready` e `expired`;
- persistir `expiredAt` explicitamente;
- manter Proposed Activities ao salvar `expired`;
- reidratar primeiro `ready` pela operação pública de conclusão;
- reidratar `expired` chamando `expireItineraryProposalByTime` sobre o snapshot pronto;
- continuar validando JSONB e versões em runtime.

## 7. Caminhos permitidos

Exatamente os caminhos da seção 8 do incremento.

## 8. Caminhos somente leitura

```text
apps/**
modules/**
packages/database/src/schema.ts
packages/database/src/client.ts
packages/database/src/migrate.ts
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/data/**
```

## 9. Restrições

- não alterar o domínio, port ou service;
- não criar Provider, comando, job, fila, API, UI ou evento;
- não implementar outra causa de expiração;
- não alterar Itinerary, Activity ou Planning Assurance;
- não adicionar dependência;
- não executar migration em produção;
- não usar `drizzle-kit push`;
- não remover coluna ou conteúdo histórico.

## 10. Testes obrigatórios

- round trip completo de `expired`;
- preservação de itens, snapshots, versões e proveniência;
- listagem em lote de Proposed Activities expirada;
- constraint rejeita `expired_at` ausente ou anterior a `valid_until`;
- constraint rejeita conteúdo incompleto em `expired`;
- estados anteriores preservam `expired_at` nulo;
- migration aplica em PostgreSQL vazio no CI.

## 11. Comandos

```bash
pnpm exec prettier --check packages/database/src/proposal-schema.ts packages/database/src/proposal-repository.ts packages/database/src/proposal-repository.test.ts packages/database/drizzle/meta/_journal.json docs/implementation/increments/rb-inc-059-itinerary-proposal-expired-persistence.md docs/implementation/context-packs/rb-inc-059-itinerary-proposal-expired-persistence.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/database lint
pnpm --filter @routebook/database typecheck
pnpm --filter @routebook/database test
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

## 12. Quando interromper e escalar

- for necessária migration destrutiva ou backfill de produção;
- o adapter precisar alterar o domínio ou conhecer Provider;
- surgir escrita cross-context;
- for necessário novo estado, relação ou invariante;
- a persistência exigir comando, scheduler ou causa de expiração além da temporal.
