---
id: RB-CTX-168
title: Context Pack do RB-INC-168 — Ranking e qualidade contextual de Places
description: Delimita sinais de qualidade, RouteBook Score e o spike de Providers sem ativar API paga ou alterar estado canônico.
document_type: implementation-context-pack
owner: Place Catalog and Decision Intelligence
status: Draft
version: "0.1.0"
created: "2026-08-27"
last_updated: "2026-08-27"
authors: [RouteBook Team]
tags: [implementation, context-pack, ranking, ratings, popularity, providers]
related_documents: [RB-INC-168, RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-142, RB-INC-164, RB-INC-167]
prerequisites: [RB-INC-164]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-168 — Ranking e qualidade contextual de Places

## 1. Missão

Implementar a base determinística para responder “quais são os melhores lugares?” em praias, gastronomia, vida noturna e natureza, preservando incerteza, Provenance e portabilidade.

## 2. Unidade de trabalho

- issue: `#390`;
- branch: `codex/rb-inc-168-place-quality-ranking`;
- base empilhada: PR `#389`, correção de praias;
- Provider pago permanece gate humano;
- Preview Vercel é ambiente de validação técnica/funcional;
- Production permanece fora de escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/architecture/integrations-and-ports.md`;
5. `docs/architecture/adrs/rb-adr-012-google-maps-platform-as-initial-geospatial-provider.md`;
6. RB-INC-142;
7. RB-INC-164;
8. RB-INC-167;
9. RB-INC-168.

## 4. Contratos preservados

- Place Catalog continua owner do Place canônico;
- Overture continua fonte de cobertura e localização, não de reputação;
- `confidence` do Overture não é rating;
- rating/popularidade externos exigem Provider e `collectedAt`;
- não combinar ratings de Providers sem metodologia explícita;
- nenhuma leitura grava Place/Saved Place/Activity;
- ausência de sinal não recebe valor sintético;
- lista e mapa continuam operando sobre a projeção deduplicada;
- score RouteBook é derivado e reversível.

## 5. Modelo autorizado

```text
PlaceQualityTarget
  -> PlaceQualitySignalsPort
  -> PlaceQualitySignalMatch
  -> calculatePlaceQualityScore
  -> rankPlaceDiscoveryItems
```

Nenhum desses conceitos cria agregado persistente.

## 6. Política estatística

- rating é normalizado para 0..1 pela escala declarada;
- reputação usa shrinkage Bayesiano com prior explícito;
- review count ausente recebe confiança conservadora;
- popularidade usa escala independente;
- score final usa somente componentes disponíveis;
- distância/abertura não criam score sem reputação ou popularidade;
- tie-break final é determinístico.

## 7. UX futura autorizada

Quando existir cobertura real:

- Recomendados;
- Melhor avaliados;
- Mais populares;
- Mais próximos;
- posição no ranking;
- score RouteBook;
- rating + quantidade de avaliações com fonte;
- explicação curta do motivo.

Sem cobertura, a experiência continua pela ordenação espacial existente; não deve exibir “Top” fictício.

## 8. Spike de Provider

O script comparativo é uma ferramenta de engenharia, não um adapter de runtime.

Pode:
- consultar Pipa em raio limitado;
- usar Google Places Text Search (New);
- usar Foursquare Places Search;
- medir cobertura e sinais retornados;
- produzir JSON sem credenciais.

Não pode:
- criar billing;
- criar/alterar secret;
- persistir resultado como Place canônico;
- executar automaticamente em CI com segredo;
- decidir Provider em nome do responsável;
- afirmar cobertura sem execução live real.

## 9. Caminhos permitidos

```text
modules/place-catalog/src/place-quality.ts
modules/place-catalog/src/place-quality.test.ts
modules/place-catalog/src/index.ts
apps/web/lib/place-discovery-ranking.ts
apps/web/lib/place-discovery-ranking.test.ts
scripts/compare-place-quality-providers.mjs
scripts/compare-place-quality-providers.test.mjs
package.json
docs/implementation/increments/rb-inc-168-place-quality-ranking.md
docs/implementation/context-packs/rb-inc-168-place-quality-ranking.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Se o CI revelar uma regressão indispensável herdada da PR base, uma correção mínima pode ocorrer na branch base e deve ser registrada no handoff.

## 10. Gates

- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm test:place-quality-provider-spike`;
- `pnpm build`;
- E2E do Engineering Validation;
- Documentation Validation e Engineering Validation no mesmo SHA;
- Preview Vercel READY.

## 11. Proibições

- não alterar estado decisório do RB-ADR-012;
- não ativar Google/Foursquare no runtime;
- não criar API key/billing;
- não imprimir segredo;
- não transformar Overture confidence em score;
- não inventar ratings;
- não persistir reviews;
- não promover Production;
- não concluir M8.

## 12. Handoff

Relatar score, política de ausência, arquivos, testes, SHA, CI, Preview, resultado do spike offline e o gate humano necessário para comparação live/Provider.
