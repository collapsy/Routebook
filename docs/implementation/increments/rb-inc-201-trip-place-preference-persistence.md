---
id: RB-INC-201
title: Persistência de TripPlacePreference e compatibilidade Saved Places
description: Evolui saved_places para o estado canônico de TripPlacePreference com backfill aditivo, repository Drizzle e adapters legados.
document_type: implementation-increment
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, persistence, migration, trip-collection, trip-place-preference, saved-places]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002, RB-ADR-028, RB-INC-199, RB-INC-200, RB-CTX-201]
prerequisites: [RB-INC-200]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-201 — Persistência de TripPlacePreference e compatibilidade Saved Places

## 1. Estado

`Draft`

- issue: [#485](https://github.com/collapsy/Routebook/issues/485);
- branch: `codex/issue-485-trip-place-preference-persistence`;
- base: `origin/main@57fdd501f38413ddd1f644ba25ef9ef05526acc8`.

## 2. Resultado vertical

O estado canônico de `TripPlacePreference` passa a ser persistido na associação já existente `saved_places`, sem criar uma segunda tabela concorrente e sem perder identidade, vínculo ou data de criação do legado.

Saved Places permanece temporariamente como adapter de compatibilidade:

```text
SavePlace   -> TripPlacePreference(WANT, null)
UnsavePlace -> ClearTripPlacePreference
List Saved  -> somente WANT
```

## 3. Problema

O núcleo puro do RB-INC-200 já representa intenção e prioridade, mas o banco ainda armazena somente uma associação binária. Criar UI ou trocar a origem da Proposal antes da persistência produziria duas fontes de verdade e impediria uma transição sem perda dos Saved Places existentes.

## 4. Escopo

- repository port de `TripPlacePreference`;
- adapter `DrizzleTripPlacePreferenceRepository`;
- evolução aditiva da tabela `saved_places`;
- colunas `intent`, `priority` e `updated_at`;
- backfill legado para `WANT`, prioridade nula e `updated_at = created_at`;
- constraints de banco para intents e prioridade canônicos;
- preservação de `id`, `trip_id`, `place_id` e `created_at`;
- compatibilidade de `DrizzleSavedPlaceRepository`;
- compatibilidade do fluxo transacional de Save de Recommendation;
- testes PostgreSQL e contrato da migration;
- documentação e rastreabilidade.

## 5. Contrato de persistência

A tabela física permanece `saved_places` durante a transição.

Estado após a migration:

```text
saved_places
- id
- trip_id
- place_id
- intent: WANT | MAYBE | NOT_INTERESTED
- priority: MUST_DO | null
- created_at
- updated_at
```

A chave contextual `trip_id + place_id` continua única.

## 6. Backfill

Para toda linha existente antes do incremento:

```text
id         = preservado
trip_id    = preservado
place_id   = preservado
created_at = preservado
intent     = WANT
priority   = null
updated_at = created_at
```

O backfill ocorre antes de `intent` e `updated_at` serem promovidos para `NOT NULL`.

## 7. Constraints

O banco rejeita:

- intent fora de `WANT | MAYBE | NOT_INTERESTED`;
- prioridade diferente de `MUST_DO | null`;
- `MUST_DO` quando o intent não é `WANT`.

As regras de domínio continuam sendo a autoridade; as constraints protegem a fronteira de persistência.

## 8. Compatibilidade Saved Places

`DrizzleSavedPlaceRepository` permanece utilizável por superfícies antigas.

### Find/List

Somente linhas com `intent = WANT` são expostas como Saved Place.

### Save

Criação nova persiste:

```text
intent = WANT
priority = null
updated_at = created_at
```

Quando já existe `MAYBE` ou `NOT_INTERESTED` para o mesmo Trip + Place:

- a linha é reutilizada;
- o ID e `created_at` são preservados;
- intent passa a `WANT`;
- priority volta a `null`;
- `updated_at` registra a ação de Save.

### Unsave

Remove a linha de preferência, retornando o Place ao estado não avaliado. Nenhuma Activity é removida.

## 9. Save de Recommendation

O fluxo transacional existente que aceita uma Recommendation com efeito `save-place` também passa a escrever `WANT` sem prioridade.

Se a preferência já existir como `MAYBE` ou `NOT_INTERESTED`, o fluxo preserva a linha e a converte para `WANT`.

## 10. Caminhos permitidos

```text
modules/trip-collection/**
packages/database/package.json
packages/database/src/schema.ts
packages/database/src/index.ts
packages/database/src/saved-place-repository.ts
packages/database/src/trip-place-preference-repository.ts
packages/database/src/trip-place-preference-repository.test.ts
packages/database/src/trip-place-preference-migration.test.ts
packages/database/src/recommendation-decision-service.ts
packages/database/drizzle/0034_persist_trip_place_preferences.sql
packages/database/drizzle/meta/_journal.json
pnpm-lock.yaml
docs/implementation/increments/rb-inc-201-trip-place-preference-persistence.md
docs/implementation/context-packs/rb-inc-201-trip-place-preference-persistence.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 11. Caminhos somente leitura

```text
apps/web/**
modules/saved-places/**
modules/proposal-management/**
modules/trip-management/**
modules/place-catalog/**
docs/core/**
docs/domain/**
docs/architecture/**
```

## 12. Fora de escopo

- UI Minha seleção;
- novas Server Actions;
- renomear rotas;
- remover `@routebook/saved-places`;
- renomear a tabela física;
- alterar candidate set de Proposal;
- Planning Role;
- ReplanningWindow;
- Preview ou Production.

## 13. Risco de migration

A migration é aditiva quanto ao schema e preserva linhas existentes, mas contém:

- `UPDATE` para backfill;
- `SET NOT NULL` após o backfill.

A política de release deve classificá-la como `high risk`.

Isso não autoriza execução em Production. O incremento somente versiona e valida a migration no CI. A aplicação produtiva continua sujeita ao gate operacional/humano aplicável.

## 14. Testes obrigatórios

```bash
pnpm install --frozen-lockfile
pnpm --filter @routebook/trip-collection test
pnpm --filter @routebook/trip-collection lint
pnpm --filter @routebook/trip-collection typecheck
pnpm --filter @routebook/database test
pnpm --filter @routebook/database lint
pnpm --filter @routebook/database typecheck
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O CI do PR também aplica migrations em PostgreSQL, executa smoke e Playwright.

## 15. Critérios de aceite

- [x] legado preserva ID, Trip, Place e createdAt;
- [x] legado é convertido para WANT sem prioridade;
- [x] updatedAt legado nasce igual a createdAt;
- [x] banco protege intents e prioridade canônicos;
- [x] repository canônico faz round-trip das três intenções;
- [x] update canônico preserva ID e createdAt;
- [x] Saved Places expõe somente WANT;
- [x] Save legado converte MAYBE/NOT_INTERESTED para WANT;
- [x] Unsave legado limpa a preferência;
- [x] Save de Recommendation grava WANT;
- [x] Activity, Proposal e UI permanecem inalteradas;
- [x] validação integral do CI passa.

## 16. Rollback

Antes de qualquer aplicação produtiva, o rollback do código consiste em reverter o incremento.

Depois que a migration for aplicada em um ambiente com dados reais, rollback físico das colunas não é autorizado por este incremento. Qualquer reversão deve preservar intent e prioridade já registrados e exige plano próprio.

## 17. Evidências

No SHA `6655a401302020c374ec21046b68f8afa4e9bdc0`:

- Documentation Validation `35386173495`: `success`;
- Overture Place Discovery `35386173591`: `success`;
- Engineering Validation `35386173582`: `success`;
- Vercel: `success`.

A Engineering Validation aprovou:

- instalação com lockfile congelado;
- Prettier e validação documental;
- lint e typecheck;
- política de migrations;
- verificações de deployment;
- aplicação da migration `0034_persist_trip_place_preferences` em PostgreSQL limpo;
- testes de componente, domínio e integração;
- testes do normalizador Overture e verificação de imagens;
- smoke do servidor;
- build;
- Playwright/responsividade.

A política de release define `UPDATE ... SET` como `update-data` e `SET NOT NULL` como `set-not-null`; ambos são padrões de alto risco. Portanto, a migration 0034 é `high risk`, como previsto. Nenhuma migration foi executada em Production.
