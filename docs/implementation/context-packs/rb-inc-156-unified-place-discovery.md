---
id: RB-CTX-156
title: Context Pack do RB-INC-156 — Descoberta Unificada de Lugares
description: Delimita a integração visual e espacial entre catálogo publicado e candidatos externos sem alterar estado canônico.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, context-pack, discovery, overture, map, ux]
related_documents: [RB-INC-156, RB-CORE-0004, RB-INC-139, RB-INC-153, RB-INC-154, RB-INC-155]
prerequisites: [RB-INC-139, RB-INC-153, RB-INC-154, RB-INC-155]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-156 — Descoberta Unificada de Lugares

## 1. Missão do executor

Eliminar a percepção de catálogo fixo em 30 Places integrando, na mesma grade e no mesmo mapa,
os Places publicados e os candidatos Overture realmente visíveis. Preservar origem, Provenance,
estado canônico, ações explícitas e degradação segura.
Tornar a grade encontrável no topo da Viagem e impedir que uma janela pré-reconciliação pequena
reduza a cobertura externa a zero sem evidência operacional.

## 2. Incremento

- ID: `RB-INC-156`;
- issue: `#361`;
- branch: `codex/rb-inc-156-unified-place-discovery`;
- baseline empilhada: `09e0f73f296aa04e64a4069b41435ee9d336caa5`;
- relação: complementa RB-INC-154 sem inferir evidência M8.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/increments/rb-inc-156-unified-place-discovery.md`;
5. `docs/implementation/increments/rb-inc-154-integrated-place-count.md`;
6. `docs/implementation/context-packs/rb-inc-154-integrated-place-count.md`;
7. `docs/implementation/increments/rb-inc-153-pipa-operational-guide.md`;
8. `docs/implementation/context-packs/rb-inc-153-pipa-operational-guide.md`;
9. `docs/implementation/increments/rb-inc-139-accommodation-proximity.md`.

## 4. Contratos preservados

- Place externo não é Place canônico;
- promoção externa continua explícita, autorizada e revalidada server-side;
- lista e mapa representam o mesmo conjunto de opções visíveis;
- Hospedagem pode aparecer como referência adicional no mapa;
- distância geodésica é estimativa em linha reta;
- falha do Overture não bloqueia catálogo;
- consulta externa mantém raio e tiles limitados, varre no máximo 200 candidatos e exibe até 60
  novos após reconciliação;
- promoção server-side revalida na mesma janela da leitura;
- logs estruturados registram contagens sem expor dados pessoais;
- mapa não publica, salva ou inclui candidato no Roteiro;
- M8 exige evidência humana real separada.

## 5. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados no RB-INC-156 e na issue `#361`.

## 6. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @routebook/web exec vitest run lib/place-discovery-feed.test.ts lib/trip-map.test.ts components/trip-map.test.tsx
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/place-discovery-filters.spec.ts e2e/accommodation-proximity.spec.ts
```

A Engineering Validation e a Documentation Validation devem concluir no mesmo SHA.

## 7. Proibições

- não alterar raio, confiança, taxonomia ou reconciliação Overture;
- não exibir mais de 60 candidatos externos por leitura;
- não publicar, salvar ou inserir candidato no Roteiro por leitura;
- não criar detalhe interno falso para candidato externo;
- não apresentar capa de categoria como foto do local;
- não criar migration, secret, SDK, API paga ou novo Provider;
- não editar ADR ou linguagem de domínio;
- não declarar quantidade externa fixa;
- não fazer merge nem promover para Production sem autorização humana separada.

## 8. Handoff

Relatar comportamento, arquivos, testes, CI, cobertura externa variável, issue, PR, preview e as
limitações preservadas. O checkpoint deve deixar claro que integração visual não equivale a
publicação canônica.
