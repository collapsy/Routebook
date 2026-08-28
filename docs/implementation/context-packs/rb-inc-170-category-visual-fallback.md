---
id: RB-CTX-170
title: Context Pack do RB-INC-170 — Fallback visual ilustrativo por categoria
description: Delimita a ilustração local e genérica usada quando fotografias governadas estão ausentes ou indisponíveis, preservando Provenance e precedência de mídia real.
document_type: implementation-context-pack
owner: Place Catalog and Trip Experience
status: Draft
version: "0.1.0"
created: "2026-08-28"
last_updated: "2026-08-28"
authors: [RouteBook Team]
tags: [implementation, context-pack, images, fallback, illustration, mobile]
related_documents: [RB-INC-170, RB-CORE-0004, RB-INC-141, RB-INC-158, RB-INC-162, RB-INC-169, RB-INC-136]
prerequisites: [RB-INC-141, RB-INC-162, RB-INC-169]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-170 — Fallback visual ilustrativo por categoria

## 1. Missão

Eliminar cards visualmente secos sem enfraquecer a governança de fotografia.

A implementação deve preservar a cadeia:

```text
Place.primaryImage governada
→ preview externo com identidade segura
→ ilustração local da categoria
```

## 2. Unidade de trabalho

- issue: `#397`;
- branch: `codex/rb-inc-170-category-visual-fallback`;
- base: PR #396 / SHA `872b03c9a18e62b3273f1d48cf8ec9792c517a02`;
- PR #396 continua empilhada sobre #387;
- ambiente de aceite: Vercel Preview consolidado;
- merge permanece bloqueado pelo gate humano do RB-INC-165/#387.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/design-system/foundations.md`;
5. `docs/design-system/component-library.md`;
6. `docs/design-system/ui-patterns.md`;
7. `docs/ux/interaction-specifications.md`;
8. `docs/architecture/integrations-and-ports.md`;
9. RB-INC-141 / RB-CTX-141;
10. RB-INC-158 / RB-CTX-158;
11. RB-INC-162 / RB-CTX-162;
12. RB-INC-169 / RB-CTX-169;
13. RB-INC-170 e este Context Pack.

## 4. Contratos preservados

- `Place.primaryImage` continua opcional e representa somente mídia governada;
- `sourceUrl` continua sendo Provenance, nunca `src`;
- candidato externo continua não canônico;
- Wikimedia só vence o fallback quando o match é `secure`;
- ilustração não possui identidade de Place;
- ilustração não altera Recommendation, ranking, Saved Place, Itinerary ou Decision;
- céu/evento continuam usando os dados e Provenance do RB-INC-169;
- falha de Provider não remove o conteúdo factual do card;
- nenhuma API key, billing, migration ou Provider novo entra nesta unidade.

## 5. UX obrigatória

- arte vetorial genérica e visualmente distinta de fotografia;
- disclosure visível em todo fallback de Place;
- categoria conhecida deve selecionar a ilustração correspondente;
- estado desconhecido usa ilustração neutra de Lugar;
- candidato externo usa a ilustração já no estado idle/loading;
- foto segura substitui a ilustração sem mudar conteúdo factual;
- erro/miss recupera a ilustração;
- Salvos usa a mesma cadeia visual da Discovery;
- Sol/Lua/Rolês usam variantes próprias e disclosure que não as confunde com evidência real;
- aspect ratio estável e mobile-first.

## 6. Caminhos permitidos

Somente os caminhos declarados no RB-INC-170/#397.

Assets novos ficam exclusivamente sob:

`apps/web/public/category-illustrations/`.

## 7. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

GitHub Actions deve comprovar Documentation Validation e Engineering Validation no mesmo SHA. O Vercel Preview do mesmo SHA deve estar READY antes do aceite humano.

## 8. Proibições

- não ativar Google Places Photos;
- não solicitar API key em chat;
- não introduzir Provider/SDK;
- não persistir ilustração em `Place.primaryImage`;
- não gerar foto falsa de estabelecimento;
- não remover Provenance de mídia real;
- não alterar ranking/#390;
- não alterar domínio ou categorias canônicas;
- não alterar eventos/astronomia do RB-INC-169;
- não mergear #387/#396/esta PR antes do aceite funcional documentado.

## 9. Handoff

Relatar SHA, arquivos, superfícies cobertas, testes reais, CI, Preview, riscos, dependência de #387/#396 e o fato de que Google Places Photos continua bloqueado por gate humano separado.
