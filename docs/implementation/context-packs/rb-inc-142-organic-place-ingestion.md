---
id: RB-CTX-142
title: Context Pack do RB-INC-142 — Descoberta Orgânica e Ingestão Governada de Places
description: Delimita arquitetura, fontes, persistência, Provenance, reconciliação, mídia e gates para descoberta orgânica de Places.
document_type: implementation-context-pack
owner: Place Catalog and Integrations
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors: [RouteBook Team]
tags: [implementation, context-pack, place-catalog, integrations, overture, provenance, ingestion, images]
related_documents: [RB-INC-142, RB-CORE-0004, RB-PRD-002, RB-DOM-001, RB-ARC-003, RB-DATA-002, RB-QA-001, RB-INC-133, RB-INC-137, RB-INC-141, RB-INC-136]
prerequisites: [RB-INC-133, RB-INC-137, RB-INC-141]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-142 — Descoberta Orgânica e Ingestão Governada de Places

## 1. Missão

Implementar os Ports e a ingestão de Places já previstos pelo RB-ARC-003, usando uma fonte aberta inicial e preservando `Place` como entidade canônica interna independente do Provider.

## 2. Estado inicial

- issue: #333;
- branch: `codex/rb-inc-142-organic-place-ingestion`;
- base: `2576bd29a08d13b5f5dc82976d5d5c8c9ce76f06`;
- Pipa possui 30 Places publicados;
- `Place.primaryImage` existe, mas ausência continua legítima;
- não existe busca externa implementada nem vínculo persistido Provider -> Place;
- #319 permanece aberto para evidência humana do M8.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/architecture/integrations-and-ports.md`, especialmente busca, candidato, ingestão, imagens e deduplicação de Places;
5. `docs/domain/domain-model.md`, seções Place e Provenance;
6. `docs/data/physical-data-model-and-migrations.md`;
7. `docs/implementation/increments/rb-inc-133-production-migration-gate.md`;
8. `docs/implementation/increments/rb-inc-137-pipa-catalog-coverage.md`;
9. `docs/implementation/increments/rb-inc-141-place-primary-image.md`;
10. RB-INC-142 e este Context Pack.

## 4. Regras que prevalecem

- candidato externo não é Place canônico;
- busca externa é read-only;
- categoria desconhecida não recebe aproximação silenciosa;
- identidade externa previamente vinculada vence heurística;
- possível duplicata bloqueia promoção automática;
- promoção deve ser explícita, auditável e idempotente;
- Provider não pode vazar para o domínio como SDK/HTTP;
- licença/Fonte e instante de coleta são preservados;
- Provider indisponível não invalida catálogo já promovido;
- ausência de imagem é preferível a mídia sem licença verificável;
- Provider pago/secret exige decisão humana antes de ativação;
- CI/PR não modifica Production.

## 5. Fonte inicial

A implementação inicial usa Overture Maps como fonte aberta para geração de candidatos.

A fronteira aceita que Overture é dataset versionado, não API transacional. A obtenção oficial poderá usar:

- listagem pública S3 para descobrir release atual sem depender do catálogo STAC opcional;
- `overturemaps` Python API para recorte operacional por bounding box;
- PMTiles públicos + HTTP Range para descoberta server-side sob demanda;
- GeoJSON como formato intermediário do pipeline operacional;
- `sources`/licenças da feature para Provenance.

O normalizador RouteBook não depende do Python e deve ser testável sobre fixtures locais. O adapter de produto deve permanecer isolado atrás de `PlaceSearchPort` e possuir dependências de rede injetáveis/testáveis quando aplicável.

## 6. Limite geográfico inicial

O pipeline inicial deverá operar apenas sobre área explicitamente delimitada de Pipa/Tibau do Sul, nunca sobre download mundial. O bounding box usado no workflow deve permanecer versionado e explicado no próprio arquivo.

A descoberta sob demanda deverá consultar somente os tiles necessários ao centro/raio solicitado e possuir limite estrito de raio, quantidade de tiles, candidatos e timeout.

Parâmetros devem ser conservadores:

- máximo de 200 candidatos normalizados por execução operacional;
- limite menor e orientado à UX na descoberta sob demanda;
- somente categorias que possuem mapeamento canônico;
- confidence mínima configurável quando disponível;
- sem ingestão de entidade marcada como fechada permanentemente quando o Provider fornecer esse estado.

## 7. Reconciliação

Ordem de decisão:

1. validar contrato/Provenance;
2. rejeitar categoria sem mapeamento;
3. procurar `provider + externalId` já vinculado;
4. comparar somente Places da mesma categoria;
5. combinar nome/endereço normalizados e distância;
6. retornar `possible_match` diante de ambiguidade;
7. retornar `new` apenas na ausência de sinais fortes de duplicata.

`possible_match` não equivale a duplicata confirmada.

Na experiência de descoberta, `new`, `possible_match` e `linked` devem permanecer distinguíveis. A interface não pode apresentar candidato externo como Place publicado antes da promoção/publicação correspondente.

## 8. Persistência

Tabela nova:

```text
place_external_references
  id uuid PK
  place_id uuid FK -> places.id
  provider varchar
  external_id varchar
  source_license text
  source_url text?
  collected_at timestamptz
  created_at timestamptz
  updated_at timestamptz
```

Constraints/indexes mínimos:

- unique `(provider, external_id)`;
- index `place_id`;
- `place_id` com cascade somente para metadado dependente do Place.

Nenhuma alteração em linhas de `places` ocorre na migration 0029.

## 9. Promoção

A operação de promoção deverá:

- receber candidato já normalizado;
- executar reconciliação contra catálogo e referências atuais;
- retornar o Place existente para `linked`;
- recusar `possible_match` e `rejected`;
- criar `Place` e referência externa na mesma transação para `new`;
- usar `draft` como publication status padrão, evitando publicação silenciosa;
- gerar slug canônico e resolver colisão deterministicamente;
- não inventar rating, horário, preço ou descrição editorial externa;
- usar resumo técnico neutro quando o Provider não fornece texto editorial publicável.

Publicação do draft permanece operação separada.

## 10. Descoberta na aplicação

A tela `/viagens/[tripId]/lugares` deverá expor uma ação explícita para descoberta externa. A carga normal da página continua baseada somente no catálogo canônico publicado.

Quando acionada:

- a busca roda exclusivamente no servidor;
- Overture é acessado pelo adapter de `PlaceSearchPort` via PMTiles públicos e HTTP Range;
- o centro parte da hospedagem quando geocodificada e usa referência conhecida do destino apenas como fallback delimitado;
- filtros de categoria podem restringir a consulta externa;
- candidatos são reconciliados contra Places/referências existentes;
- candidatos externos aparecem em seção própria e nunca são misturados silenciosamente ao catálogo publicado;
- falha, timeout ou indisponibilidade da fonte externa preserva a lista/mapa canônicos e exibe feedback de degradação;
- nenhuma busca externa produz write.

## 11. Imagem

O contrato de mídia externa deve ser separado de `PlacePrimaryImage`:

```text
ExternalPlaceImageCandidate
  provider
  externalPlaceId
  sourceUrl
  sourceName
  license
  attribution?
  collectedAt
  cachePolicy
```

`PlaceImagePort` pode encontrar candidatos, mas não deve gravar `primaryImage`. Somente após download/cópia permitida para asset controlado pelo RouteBook a mídia poderá ser promovida ao contrato do RB-INC-141.

## 12. Caminhos autorizados

```text
modules/place-catalog/src/external-place.ts
modules/place-catalog/src/external-place.test.ts
modules/place-catalog/src/index.ts
packages/database/src/schema.ts
packages/database/src/index.ts
packages/database/src/place-external-reference-repository.ts
packages/database/src/place-external-reference-repository.test.ts
packages/database/src/place-promotion-service.ts
packages/database/src/place-promotion-service.test.ts
packages/database/drizzle/0029_create_place_external_references.sql
packages/database/drizzle/meta/_journal.json
scripts/normalize-overture-places.mjs
scripts/normalize-overture-places.test.mjs
scripts/promote-place-candidates.mjs
package.json
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/lib/overture-place-search.ts
apps/web/lib/overture-place-search.test.ts
apps/web/package.json
pnpm-lock.yaml
.github/workflows/engineering-validation.yml
.github/workflows/overture-place-discovery.yml
docs/implementation/increments/rb-inc-142-organic-place-ingestion.md
docs/implementation/context-packs/rb-inc-142-organic-place-ingestion.md
docs/registry.md
```

## 13. Gates

```text
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test:release-migration-policy
pnpm db:migrate
pnpm test
pnpm test:overture-place-normalizer
pnpm build
pnpm test:e2e
```

GitHub Actions no SHA atual da PR é a fonte de verdade para gates executáveis neste ambiente.

O workflow Overture deve ser dry-run/read-only por padrão e gerar artefato; nenhuma credencial de Production deve existir nele neste incremento.

## 14. Quando escalar

Escalar somente se a implementação exigir:

- ativar Provider pago ou criar compromisso comercial;
- armazenar/hotlinkar mídia sob termos incompatíveis com RB-INC-141;
- alterar categorias canônicas de Place;
- transformar candidato em Place publicado automaticamente;
- mudar política de privacidade/retenção;
- executar write de Production;
- integrar a PR na `main`.

Falhas de format, docs, lint, typecheck, migration policy, migrations, testes, build e E2E devem ser corrigidas autonomamente.
