---
id: RB-CTX-172
title: Context Pack do RB-INC-172 — Experiência completa de ranking de Places
description: Delimita UI de ranking, adapters runtime Google/Foursquare, matching conservador, cobertura governada e política de ausência.
document_type: implementation-context-pack
owner: Place Catalog and Decision Intelligence
status: Draft
version: "0.2.0"
created: "2026-08-28"
last_updated: "2026-09-01"
authors: [RouteBook Team]
tags: [implementation, context-pack, ranking, discovery, providers]
related_documents: [RB-INC-172, RB-INC-168, RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-171]
prerequisites: [RB-INC-168, RB-INC-171]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-172 — Experiência completa de ranking de Places

## 1. Missão

Finalizar o ranking visível de Places, ativar Google Places somente no Preview após autorização humana
e validar cobertura real sem fabricar sinais.

## 2. Unidade de trabalho

- issue: #401;
- issue raiz: #390;
- branch: `codex/rb-inc-172-place-ranking-experience`;
- base: PR #400 / SHA `5145a5e59907a02c4a9370b299b6c7d60ea1a146`;
- stack: #387 → #396 → #398 → #400 → RB-INC-172;
- Preview continua sendo o ambiente de aceite;
- nenhuma PR da pilha deve ser mergeada antes do aceite funcional humano aplicável.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible;
3. `docs/README.md`;
4. RB-INC-168 / RB-CTX-168;
5. RB-INC-171 / RB-CTX-171;
6. RB-ARC-003;
7. RB-ADR-012;
8. este incremento/context pack.

## 4. Invariantes

- Overture confidence não é rating;
- ausência de sinal continua ausência;
- ranking externo não é verdade canônica;
- RouteBook Score é derivado e reversível;
- score não existe sem reputação ou popularidade;
- lista e mapa compartilham a mesma projeção;
- navegação/ordenar não cria mutation;
- secret nunca aparece em HTML, log estruturado ou relatório;
- Provider não é ativado sem configuração explícita;
- ranking indisponível degrada para distância;
- chamadas nominais adicionais têm limite explícito por categoria.

## 5. Provider

### Google

- Text Search (New);
- FieldMask mínimo;
- key apenas server-side;
- busca ampla por categoria seguida de até quatro buscas nominais para targets ainda sem match;
- Places canônicos têm prioridade no fallback limitado;
- falha nominal isolada preserva os resultados amplos;
- billing/termos e configuração de Preview foram autorizados e provisionados fora do repositório;
- Production permanece desativado até decisão humana separada.

### Foursquare

- `places-api.foursquare.com/places/search`;
- `X-Places-Api-Version: 2025-06-17`;
- Service Key via Bearer;
- rating/popularity permanecem sinais externos.

## 6. Matching

- exact match ainda exige proximidade;
- fuzzy match exige tokens distintivos + distância curta;
- expansão distintiva até 1,2 km exige busca nominal vinculada ao target específico;
- externalId não pode alimentar dois targets no mesmo grupo;
- sem match seguro, nenhum signal match.

## 7. UX

- painel de ranking compacto;
- quatro modos visíveis;
- indisponíveis recebem `aria-disabled`;
- Top 5 fica em `details` fechado por padrão;
- card sem quality mostra posição da ordenação atual, mas não score;
- card com quality mostra score separado de rating;
- selo Top só com quality.

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

Documentation e Engineering Validation devem passar no mesmo SHA; Vercel deve estar READY nesse SHA.

## 9. Proibições

- não criar API key;
- não ativar billing;
- não escolher Provider automaticamente;
- não imprimir secret;
- não inventar ranking;
- não persistir reviews;
- não alterar schema/migration;
- não promover Production;
- não contornar #387.

## 10. Handoff

Relatar SHA, PR, arquivos, testes, Preview, Provider status e ação humana exata para ativar ranking real.
