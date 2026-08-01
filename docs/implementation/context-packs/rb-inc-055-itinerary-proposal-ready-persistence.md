---
id: RB-CTX-055
title: Context Pack do RB-INC-055
description: Fornece o contexto mínimo para persistir Itinerary Proposal ready e Proposed Activities segundo o snapshot híbrido aprovado.
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
related_documents:
  - RB-INC-055
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-006
  - RB-INC-053
  - RB-INC-054
prerequisites:
  - RB-INC-054
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-055

## 1. Missão do executor

Implementar migration e adapter para o round trip transacional de Proposal `ready`, preservando o domínio, o snapshot híbrido e os limites de ownership.

## 2. Incremento

- ID: `RB-INC-055`;
- issue: `#126`;
- decisão humana: `#123`;
- branch: `codex/rb-inc-055-ready-persistence`;
- base empilhada: `codex/rb-inc-054-ready-data-contract`, PR #125;
- arquivo: `docs/implementation/increments/rb-inc-055-itinerary-proposal-ready-persistence.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-055-itinerary-proposal-ready-persistence.md`;
6. `docs/implementation/increments/rb-inc-054-itinerary-proposal-ready-data-contract.md`;
7. `docs/implementation/increments/rb-inc-053-itinerary-proposal-ready-domain.md`;
8. `docs/domain/domain-model.md`, Parte XII;
9. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-002 a RB-BR-PRP-010;
10. `docs/domain/domain-events-and-lifecycles.md`, Parte XVII;
11. `docs/data/logical-data-model.md`, Parte XII;
12. `docs/data/physical-data-model-and-migrations.md`, Partes XII e XV;
13. `docs/architecture/adrs/rb-adr-006-drizzle-orm-and-drizzle-kit-for-data-access-and-migrations.md`;
14. aggregate, schema, repository, migration `0013` e testes atuais.

## 4. Contrato de domínio adicional

`CompleteItineraryProposalGenerationInput` recebe:

```text
generationMethod: string
generationVersion: string
```

Ambos são normalizados como textos não vazios e copiados para a Proposal `ready`. Eles não formam enum e não selecionam Provider.

## 5. Schema físico

Campos novos em `itinerary_proposals`:

```text
generation_method varchar(64)
generation_version varchar(80)
content_schema_version integer
criteria jsonb
justifications jsonb
limitations jsonb
planning_conflict_ids jsonb
generated_at timestamptz
valid_until timestamptz
```

Tabela `proposed_activities` segue `RB-DATA-002`, sem coluna `status`.

## 6. Lifecycle e transação

- Proposal anterior a `ready`: campos novos nulos e nenhuma Proposed Activity;
- Proposal `ready`: todos os campos novos não nulos e `content_schema_version = 1`;
- update da Proposal, remoção dos itens anteriores e insert dos itens atuais ocorrem na mesma transação;
- uma falha reverte todas as operações;
- `findById` e `listByTripId` reidratam pela operação pública do Domínio.

## 7. JSONB e proveniência

- validar que cada snapshot é `string[]`;
- critérios e justificativas possuem ao menos um item não vazio;
- limitações e conflitos podem estar vazios;
- referências de conflito não são consultadas nem validadas em Planning Assurance;
- não persistir prompt, token ou payload bruto.

## 8. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 8 do incremento.

## 9. Caminhos somente leitura

```text
apps/**
packages/database/src/schema.ts
packages/database/src/client.ts
packages/database/src/migrate.ts
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/data/**
```

## 10. Restrições

- não alterar port ou service; o port existente suporta o recorte;
- não criar Provider, job, fila, retry ou evento;
- não criar status de Proposed Activity;
- não criar FK para Planning Conflict;
- não alterar Itinerary ou Planning Assurance;
- não adicionar dependência;
- não executar migration em produção;
- não usar `drizzle-kit push`.

## 11. Testes obrigatórios

- proveniência obrigatória e normalizada no domínio;
- round trip integral de `ready` com itens e snapshots;
- Proposal vazia com justificativa;
- listagem preserva ordem das Proposals e dos itens;
- update de itens substitui o conjunto na mesma transação;
- constraint rejeita `ready` incompleta;
- JSONB inválido produz erro de repository;
- cascata remove Proposed Activities com a Proposal;
- ciclo anterior permanece verde.

## 12. Comandos

```bash
pnpm format:check
pnpm docs:validate
pnpm --filter @routebook/proposal-management lint
pnpm --filter @routebook/proposal-management typecheck
pnpm --filter @routebook/proposal-management test
pnpm --filter @routebook/database lint
pnpm --filter @routebook/database typecheck
pnpm --filter @routebook/database test
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

## 13. Quando interromper e escalar

- for necessária migration destrutiva ou backfill de produção;
- o adapter precisar conhecer Provider;
- surgir FK ou escrita cross-context;
- o port existente não suportar atomicidade do adapter;
- for necessário novo estado, relação ou invariante de domínio.
