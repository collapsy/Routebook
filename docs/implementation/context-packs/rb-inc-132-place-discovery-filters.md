---
id: RB-CTX-132
title: Context Pack do RB-INC-132 — Pesquisa e Filtros de Places
description: Delimita a conclusão da descoberta básica do MVP com pesquisa, filtros e mapa sincronizado.
document_type: implementation-context-pack
owner: Place Catalog and Experience
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, place-catalog, discovery, mvp]
related_documents: [RB-INC-132, RB-CORE-0004, RB-PRD-002, RB-PRD-006, RB-DOM-001, RB-DOM-002, RB-ARC-002, RB-UX-002, RB-DS-003, RB-QA-001, RB-INC-129]
prerequisites: [RB-INC-129]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-132 — Pesquisa e Filtros de Places

## Missão

Completar a descoberta obrigatória do MVP sem Provider novo e sem inventar preço,
rota ou disponibilidade quando o dado estiver ausente.

## Caminhos permitidos

```text
modules/place-catalog/src/place.ts
modules/place-catalog/src/place.test.ts
packages/database/src/schema.ts
packages/database/src/place-repository.ts
packages/database/src/place-repository.test.ts
packages/database/drizzle/0025_add_place_price_range.sql
packages/database/drizzle/meta/_journal.json
apps/web/app/viagens/[tripId]/lugares/**
apps/web/e2e/place-discovery-filters.spec.ts
docs/implementation/increments/rb-inc-132-place-discovery-filters.md
docs/implementation/context-packs/rb-inc-132-place-discovery-filters.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Documentos carregados

- RB-CORE-0004;
- RB-PRD-002, seções 19–22 e 82;
- RB-PRD-006, RB-FR-024 a RB-FR-041;
- RB-DOM-001, PriceRange;
- RB-DOM-002, `Unknown` não significa gratuito;
- RB-ARC-002, Place Catalog;
- RB-UX-002, RB-UF-004 a RB-UF-006;
- RB-DS-003, RB-PAT-005, RB-PAT-006, RB-PAT-008 e RB-PAT-009;
- RB-QA-001.

## Restrições

- Price Range é classificação aproximada, não preço confirmado;
- ausência de Price Range permanece indisponível;
- distância é geodésica e não representa rota ou duração;
- lista e mapa recebem exatamente o mesmo conjunto filtrado;
- filtros são leitura por URL e não criam estado canônico;
- nenhuma dependência ou Provider novo.

## Critérios de aceite

Os oito critérios do RB-INC-132 devem ser comprovados por testes e smoke produtivo.

## Validação

Executar unitários, integração PostgreSQL, E2E responsivo, validações locais completas,
documentação, CI, Preview e smoke em Production.
