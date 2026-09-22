---
id: RB-CTX-201
title: Context Pack do RB-INC-201 — Persistência de TripPlacePreference
description: Delimita migration aditiva, repository Drizzle e compatibilidade de Saved Places para TripPlacePreference.
document_type: implementation-context-pack
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, context-pack, persistence, migration, trip-collection, saved-places]
related_documents: [RB-INC-201, RB-INC-200, RB-ADR-028, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-ARC-002]
prerequisites: [RB-INC-200]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-201 — Persistência de TripPlacePreference

## 1. Missão

Materializar a persistência canônica de `TripPlacePreference` sobre a associação existente `saved_places`, preservando dados legados e mantendo Saved Places somente como adapter transitório.

## 2. Unidade de trabalho

- issue: [#485](https://github.com/collapsy/Routebook/issues/485);
- incremento: RB-INC-201;
- branch: `codex/issue-485-trip-place-preference-persistence`;
- base: `57fdd501f38413ddd1f644ba25ef9ef05526acc8`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-DOM-001 — Trip Collection e TripPlacePreference;
5. RB-DOM-002 — linguagem canônica;
6. RB-DOM-003 — RB-BR-COL-001 a RB-BR-COL-010;
7. RB-DOM-004 — eventos da Trip Collection;
8. RB-ARC-002 — ownership da Trip Collection;
9. RB-ADR-028;
10. RB-INC-199;
11. RB-INC-200 e RB-CTX-200;
12. `modules/saved-places/**`;
13. `packages/database/src/schema.ts`;
14. `packages/database/src/saved-place-repository.ts`;
15. política de migrations em `scripts/release-migration-policy.mjs`.

## 4. Decisões normativas

- não criar tabela paralela;
- evoluir `saved_places` aditivamente;
- preservar identidade e `created_at`;
- legado existente equivale a `WANT` sem prioridade;
- ausência continua sendo não avaliado;
- Save legado significa Set WANT;
- Unsave legado significa Clear;
- Activity não muda;
- domínio não conhece Drizzle;
- migration de Production não está autorizada por este incremento.

## 5. Entradas e saídas

### Entrada legada

```text
SavedPlace(id, tripId, placeId, createdAt)
```

### Estado canônico

```text
TripPlacePreference(
  id,
  tripId,
  placeId,
  intent,
  priority,
  createdAt,
  updatedAt
)
```

### Tradução

```text
SavedPlace -> WANT + null
```

## 6. Caminhos permitidos

Usar somente os caminhos declarados na seção 10 do RB-INC-201.

## 7. Restrições

- não alterar `apps/web/**`;
- não alterar o contrato público de `@routebook/saved-places`;
- não remover Saved Places;
- não criar UI;
- não trocar origem de candidatos da Proposal;
- não implementar ReplanningWindow;
- não aplicar migration em Preview ou Production;
- não executar operação destrutiva;
- não adicionar Provider.

## 8. Migration

A migration deve:

1. adicionar colunas nullable;
2. fazer backfill;
3. promover `intent` e `updated_at` para NOT NULL;
4. adicionar constraints;
5. manter a chave única existente;
6. não dropar, renomear ou recriar a tabela.

Backfill obrigatório:

```text
intent = WANT
priority = null
updated_at = created_at
```

## 9. Repository canônico

O port pertence a `@routebook/trip-collection`.

O adapter pertence a `@routebook/database`.

Operações mínimas:

```text
find(tripId, placeId)
listByTripId(tripId)
save(preference)
remove(tripId, placeId)
```

`save` em conflito de `TripId + PlaceId` atualiza somente intent, priority e updatedAt, preservando ID e createdAt.

## 10. Adapter legado

Find/List filtram `WANT`.

Save realiza upsert sem criar segunda linha e converte qualquer estado existente para `WANT` sem prioridade.

Remove apaga a preferência inteira e não toca Activity.

## 11. Verificações

- migration está append-only no journal;
- release policy classifica o backfill como high risk;
- PostgreSQL aceita os estados válidos;
- PostgreSQL rejeita intent desconhecido;
- PostgreSQL rejeita MUST_DO fora de WANT;
- repository canônico preserva identidade;
- adapter legado não expõe MAYBE/NOT_INTERESTED;
- adapter legado converte para WANT;
- limpeza remove somente a preferência;
- regressão integral permanece verde.

## 12. Gate humano

- merge na `main` exige confirmação humana;
- aplicação da migration em Production exige processo operacional próprio;
- este incremento não autoriza deploy ou execução produtiva.

## 13. Relatório final

Informar:

- migration adicionada e classificação de risco;
- arquivos alterados;
- testes e CI;
- compatibilidade preservada;
- riscos pendentes;
- issue e PR;
- ausência de ação em Production.
