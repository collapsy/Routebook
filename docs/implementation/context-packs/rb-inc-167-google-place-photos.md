---
id: RB-CTX-167
title: Context Pack do RB-INC-167 — Google Places Photos
description: Delimita a integração Preview-only de Google Places Photos, reutilizando identidade do ranking e protegendo attribution, custo, secrets, cache e fallback.
document_type: implementation-context-pack
owner: Place Catalog and Integrations
status: Draft
version: "0.1.0"
created: "2026-09-01"
last_updated: "2026-09-01"
authors: [RouteBook Team]
tags: [implementation, context-pack, google-places, photos, preview, provenance]
related_documents: [RB-INC-167, RB-CORE-0004, RB-ARC-001, RB-ADR-012, RB-INC-141, RB-INC-162, RB-INC-168, RB-INC-172]
prerequisites: [RB-INC-141, RB-INC-162, RB-INC-168, RB-INC-172]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-167 — Google Places Photos

## 1. Missão

Ampliar fotografia real na Discovery usando Google Places Photos somente no Preview, sem transformar mídia Google em estado canônico e sem duplicar matching.

## 2. Unidade de trabalho

- issue: `#382`;
- branch: `codex/rb-inc-167-google-place-photos`;
- baseline: `main@b067a688f39c1e3298e9670b6a82c9857a188f0e`;
- Provider autorizado: Google Places Photos somente Preview;
- secret já existe no Preview para RB-INC-172 e não deve transitar pelo repositório/chat;
- Production e aceitação definitiva de RB-ADR-012 permanecem gates humanos.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. RB-ARC-001;
5. RB-ADR-012;
6. RB-INC-141;
7. RB-INC-162;
8. RB-INC-168;
9. RB-INC-172;
10. este incremento/context pack;
11. documentação oficial Google Places API (New) para Place Details, Place Photos, pricing e attribution.

## 4. Contratos preservados

- `Place.primaryImage` continua asset governado RouteBook;
- Google photo não é persistida;
- Overture continua Fonte factual dos candidatos;
- `PlaceQualitySignals.externalId` é a identidade Google reutilizada;
- Recommendation/Decision/Itinerary não mudam por causa da foto;
- lista e mapa não mudam por mídia;
- ausência de mídia permanece ausência/fallback;
- Provider failure não quebra Discovery.

## 5. Regras de Provider

- configuração explícita por `ROUTEBOOK_PLACE_PHOTO_PROVIDER=google`;
- secret `GOOGLE_PLACES_API_KEY` somente server-side;
- não usar `ROUTEBOOK_PLACE_QUALITY_PROVIDER` como ativação implícita de fotos;
- Place Details usa FieldMask mínimo;
- photo name nunca cruza contrato público e nunca é cacheado;
- Place Photos usa somente a primeira foto elegível nesta fase;
- metadata/mídia Google usam `no-store`;
- attribution de plataforma usa `Google Maps` e `authorAttributions` adicionais são preservados;
- token de mídia é efêmero e assinado.

## 6. Degradação

```text
Google configurado + externalId seguro + foto válida
  → Google photo
senão
  → Wikimedia secure
senão
  → CategoryIllustration
```

## 7. Paths permitidos

Somente os caminhos listados no RB-INC-167.

## 8. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation e Engineering Validation devem passar no mesmo SHA. Vercel Preview deve ficar READY nesse SHA.

## 9. Proibições

- não versionar/mostrar secret;
- não cachear/persistir photo name;
- não hotlinkar endpoint Google com API key no browser;
- não usar Google photo sem externalId seguro;
- não aceitar matching frouxo;
- não alterar domínio/schema;
- não ativar Production;
- não aceitar RB-ADR-012 automaticamente;
- não esconder attribution obrigatória;
- não inventar licença/autoria.

## 10. Handoff

Relatar arquivos, FieldMask, política de token/cache, cobertura real no Preview, requests observadas, custos/limites, testes, SHA, CI, Vercel e gate humano restante para merge/Production.
