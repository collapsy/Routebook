---
id: RB-CTX-143
title: Context Pack do RB-INC-143 — Enriquecimento Governado de Imagens Reais
description: Delimita fonte, curadoria, materialização, persistência, licenciamento, paths e gates para imagens reais dos Places de Pipa.
document_type: implementation-context-pack
owner: Place Catalog and Integrations
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors: [RouteBook Team]
tags: [implementation, context-pack, place-catalog, images, wikimedia-commons, provenance, licensing]
related_documents: [RB-INC-143, RB-CORE-0004, RB-ARC-003, RB-ADR-016, RB-DATA-002, RB-QA-001, RB-INC-133, RB-INC-141, RB-INC-142, RB-INC-136]
prerequisites: [RB-INC-141, RB-INC-142]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-143 — Enriquecimento Governado de Imagens Reais

## 1. Missão

Adicionar fotografia real a Places publicados de Pipa sem transformar uma busca de mídia em write, sem hotlink e sem introduzir storage pago antes de uma decisão arquitetural.

## 2. Estado inicial

- issue: #335;
- branch: `codex/rb-inc-143-place-images`;
- base: `474135f3c0f7e1b0fb9f7d7e8d90511faf49e2b4`;
- RB-INC-141 criou `Place.primaryImage`, mas ausência permanece válida;
- RB-INC-142 criou `ExternalPlaceImageCandidate`/`PlaceImagePort` e exige `download_allowed` para promoção;
- os 30 Places publicados ainda podem renderizar fallback;
- RB-ADR-016 continua `Proposed` internamente;
- #319 continua sendo a autoridade para evidência humana M8.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/architecture/integrations-and-ports.md`;
5. `docs/architecture/adrs/rb-adr-016-cloudflare-r2-for-object-storage.md`;
6. `docs/implementation/increments/rb-inc-133-production-migration-gate.md`;
7. `docs/implementation/increments/rb-inc-141-place-primary-image.md`;
8. `docs/implementation/increments/rb-inc-142-organic-place-ingestion.md`;
9. RB-INC-143 e este Context Pack.

## 4. Regras que prevalecem

- `Place.primaryImage.assetPath` é sempre interno `/place-images/...`;
- `sourceUrl` é Provenance e nunca `src` da imagem;
- busca de imagem é read-only;
- mídia só é materializada após correspondência e licença verificadas;
- ausência ou ambiguidade mantém fallback;
- imagem não muda Recommendation;
- Provider pago, secret ou object storage novo requer decisão humana;
- CI/PR não modifica Production;
- migration DML não pode chegar a Production sem aprovação high-risk explícita.

## 5. Fonte inicial

Wikimedia Commons é o adapter inicial porque oferece API oficial para arquivos e metadata e permite reutilização conforme a licença individual de cada arquivo.

Consulta técnica:

```text
https://commons.wikimedia.org/w/api.php
  action=query
  prop=imageinfo
  iiprop=url|size|mime|sha1|extmetadata
  iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl|ImageDescription|Credit
```

A integração deve usar `imageinfo`/`extmetadata`; HTML de metadata deve ser normalizado antes de comparação/armazenamento.

## 6. Estados de correspondência

A curadoria usa três resultados de integração, sem redefinir estado de domínio:

- `secure`: evidência suficiente para associar a imagem ao Place;
- `ambiguous`: há indício útil, mas identidade/representatividade não é forte o bastante;
- `rejected`: licença, mídia, host, metadata ou correspondência invalida o candidato.

Somente `secure` + `download_allowed` pode entrar no manifesto materializável.

## 7. Cobertura inicial

Curar inicialmente:

| Place | Evidência mínima |
| --- | --- |
| Praia do Amor | título/descrição explicitam Praia do Amor, Pipa |
| Baía dos Golfinhos | título/descrição explicitam Baía dos Golfinhos, Pipa/Tibau do Sul |
| Chapadão de Pipa | título/descrição explicitam Chapadão/falésias de Pipa e localização coerente |
| Praia do Madeiro | título/descrição explicitam Madeiro e contexto local |
| Lagoa de Guaraíras | título/descrição e coordenadas explicitam a lagoa em Tibau do Sul |
| Praia de Tibau do Sul | título/descrição e coordenadas explicitam a praia central de Tibau do Sul |

Não extrapolar cobertura para negócios sem arquivo que represente o estabelecimento específico.

## 8. Manifesto e assets

Manifesto:

`apps/web/data/pipa-place-images.json`

Assets:

`apps/web/public/place-images/pipa/**`

O manifesto é auditável e contém os fatos usados para a associação. O materializador pode resolver URL técnica, hash e tamanho durante a curadoria, mas a página de Provenance continua sendo o `sourceUrl` persistido no Place.

A representação baixada deve ter largura alvo de até 1280 px quando a API fornecer thumbnail, reduzindo peso sem alterar conteúdo editorial.

## 9. Segurança do materializador

- timeout finito;
- user-agent identificável;
- somente API `commons.wikimedia.org`;
- download somente `upload.wikimedia.org`;
- HTTPS obrigatório;
- MIME `image/jpeg`, `image/png` ou `image/webp`;
- tamanho máximo por asset;
- limite fixo de entradas;
- nenhuma URL arbitrária fornecida por usuário;
- não seguir redirect para host diferente do permitido;
- erro de licença/autor/hash falha fechado.

## 10. Materialização binária nesta sessão

O conector GitHub disponível escreve texto, não binário. É permitido um workflow temporário restrito à branch do incremento para executar o materializador e commitar exclusivamente:

- `apps/web/public/place-images/pipa/**`;
- metadata de integridade do manifesto, se aplicável.

Regras do helper temporário:

- branch exata `codex/rb-inc-143-place-images`;
- nenhuma secret;
- origem fixa Commons;
- commit somente quando houver diff esperado;
- remover o workflow antes da PR final;
- workflow final do projeto continua `contents: read`.

## 11. Migration 0030

`0030_curate_pipa_place_primary_images.sql` pode atualizar apenas os seis Places curados por ID/slug estável e deve:

- preencher `primary_image` com contrato válido;
- nunca alterar `publication_status`, nome, coordenada, categoria, preço ou conteúdo editorial;
- ser idempotente quanto ao valor pretendido;
- ser classificada high-risk por `UPDATE`;
- ficar bloqueada no Production Release até aprovação humana do SHA exato.

## 12. Caminhos autorizados

```text
modules/place-catalog/src/external-place.ts
modules/place-catalog/src/external-place.test.ts
apps/web/lib/wikimedia-place-image.ts
apps/web/lib/wikimedia-place-image.test.ts
apps/web/data/pipa-place-images.json
apps/web/public/place-images/pipa/**
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/recommendations-experience.spec.ts
scripts/materialize-place-images.mjs
scripts/materialize-place-images.test.mjs
package.json
.github/workflows/engineering-validation.yml
.github/workflows/rb-inc-143-materialize-images.yml
packages/database/drizzle/0030_curate_pipa_place_primary_images.sql
packages/database/drizzle/meta/_journal.json
packages/database/src/place-repository.test.ts
docs/implementation/increments/rb-inc-143-place-images.md
docs/implementation/context-packs/rb-inc-143-place-images.md
docs/registry.md
```

O workflow `rb-inc-143-materialize-images.yml` é temporário e deve ser removido antes de readiness da PR.

## 13. Gates

```text
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test:release-migration-policy
pnpm db:migrate
pnpm test
pnpm test:place-images
pnpm build
pnpm test:e2e
```

Engineering Validation deve rodar os gates aplicáveis no SHA final. A verificação offline de assets não pode depender de rede.

## 14. Quando escalar

Escalar somente se for necessário:

- ativar R2 ou outro object storage;
- criar secret;
- contratar Provider pago;
- usar mídia com termos incompatíveis;
- aceitar correspondência ambígua como imagem oficial;
- escrever em Production;
- integrar a PR na `main`.

Falhas de format/docs/lint/typecheck/test/build/E2E devem ser corrigidas autonomamente.
