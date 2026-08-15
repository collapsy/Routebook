---
id: RB-CTX-141
title: Context Pack do RB-INC-141 — Imagem Principal de Places
description: Delimita contratos, governança, caminhos e gates para imagem principal opcional e rastreável em Places.
document_type: implementation-context-pack
owner: Place Catalog and Experience
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors: [RouteBook Team]
tags: [implementation, context-pack, place-catalog, image, provenance, m8]
related_documents: [RB-INC-141, RB-CORE-0004, RB-PRD-002, RB-DOM-001, RB-DATA-002, RB-INC-132, RB-INC-135, RB-INC-136]
prerequisites: [RB-INC-132, RB-INC-135]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-141 — Imagem Principal de Places

## 1. Missão

Implementar o RB-INC-141 como extensão opcional de Details/Provenance de Place, sem criar Provider, novo agregado ou dependência remota em runtime.

## 2. Estado inicial

- issue: #328;
- branch: `codex/rb-inc-141-place-primary-image`;
- base: `693fbbecf4ccae96f761d62502248f28bd0a4664`;
- RB-INC-140 / #327 integrado;
- #319 permanece aberto para validação real do M8.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/domain/domain-model.md`, seções Place e Provenance;
5. `docs/data/physical-data-model-and-migrations.md`;
6. `docs/implementation/increments/rb-inc-132-place-discovery-filters.md`;
7. `docs/implementation/increments/rb-inc-135-pipa-catalog-m8-readiness.md`;
8. RB-INC-141 e este Context Pack.

## 4. Regras que prevalecem

- Place continua válido sem imagem;
- ausência não recebe valor sintético;
- mídia externa relevante exige Provenance;
- licença/autoria não podem ser inferidas;
- UI nunca usa `sourceUrl` como `src`;
- somente asset interno sob `/place-images/` pode ser renderizado;
- imagem não altera Recommendation score, Reasons, Confidence ou estado;
- falha visual não remove conteúdo textual nem ações;
- nenhuma busca/scraping de imagem ocorre em runtime.

## 5. Contrato permitido

```text
Place.primaryImage?
  assetPath: /place-images/...
  altText: texto não vazio
  sourceName: texto não vazio
  sourceUrl?: URL HTTPS de Provenance
  license: texto não vazio
  attribution?: texto de crédito
```

O objeto é opcional e persistido atomicamente como JSONB nullable. O parser de domínio valida dados vindos do banco antes de expô-los ao restante da aplicação.

## 6. Persistência

- migration `0028_add_place_primary_image.sql` adiciona `places.primary_image JSONB NULL`;
- migration é append-only e sem DML/backfill;
- schema Drizzle declara a coluna sem tornar imagem requisito;
- journal recebe somente a nova entrada;
- migrations históricas não são alteradas.

## 7. Apresentação

O componente `PlacePrimaryImage` deve:

- usar `next/image` para asset interno;
- receber nome e imagem opcional;
- exibir alt do contrato quando a imagem existe;
- exibir fallback semântico quando ausente;
- trocar para o mesmo fallback após erro de carregamento;
- preservar dimensões/aspect ratio para reduzir layout shift;
- não exibir `sourceUrl` como imagem;
- permitir mostrar attribution/licença em detalhes sem poluir cards.

## 8. Caminhos autorizados

```text
modules/place-catalog/src/place.ts
modules/place-catalog/src/place.test.ts
packages/database/src/schema.ts
packages/database/src/place-repository.ts
packages/database/src/place-repository.test.ts
packages/database/drizzle/0028_add_place_primary_image.sql
packages/database/drizzle/meta/_journal.json
apps/web/components/place-primary-image.tsx
apps/web/components/place-primary-image.module.css
apps/web/components/place-primary-image.test.tsx
apps/web/components/recommendation-card.tsx
apps/web/lib/recommendation-experience.ts
apps/web/lib/recommendation-experience.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/place-discovery.module.css
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/recommendations-experience.spec.ts
docs/implementation/increments/rb-inc-141-place-primary-image.md
docs/implementation/context-packs/rb-inc-141-place-primary-image.md
docs/registry.md
```

## 9. Gates

```text
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test:release-migration-policy
pnpm db:migrate
pnpm test
pnpm build
pnpm test:e2e
```

GitHub Actions no SHA atual da PR é a fonte de verdade neste ambiente.

## 10. Quando escalar

Escalar se for necessário:

- escolher ou contratar Provider de mídia;
- permitir hotlink remoto em runtime;
- redefinir Provenance/licença canônica;
- tornar imagem obrigatória para Place;
- criar galeria/múltiplas imagens como novo modelo;
- executar migration manual ou ação destrutiva em Production.

Falhas de format, docs, lint, typecheck, migration policy, migrations, testes, build e E2E devem ser corrigidas autonomamente.
