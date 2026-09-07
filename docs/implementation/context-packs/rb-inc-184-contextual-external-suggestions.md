---
id: RB-CTX-184
title: Context Pack do RB-INC-184 — sugestões contextuais externas
description: Delimita a projeção read-only de sugestões externas para Trips sem cobertura editorial, preservando Recommendation canônica somente para Places publicados.
document_type: implementation-context-pack
owner: Decision Intelligence and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-07"
authors: [RouteBook Team]
tags: [implementation, context-pack, recommendations, discovery, decision-intelligence, routebook-anywhere]
related_documents: [RB-INC-184, RB-CORE-0004, RB-DOM-001, RB-ARC-003, RB-INC-139, RB-INC-147, RB-INC-148, RB-INC-156, RB-INC-164, RB-INC-168, RB-INC-175, RB-INC-182, RB-INC-183]
prerequisites: [RB-INC-182, RB-INC-183]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-184 — sugestões contextuais externas

## 1. Missão

Eliminar o vazio de Sugestões em Destinations zero-seed quando a própria Discovery externa já possui candidatos seguros para apresentação, sem alterar o agregado `Recommendation` nem transformar candidatos externos em estado canônico por leitura.

## 2. Unidade de trabalho

- issue: #438;
- branch: `codex/rb-inc-184-contextual-external-suggestions`;
- base empilhada: `0a829f8a2d6f05f5776e6daba3cfe6e1b28f6bfe` do RB-INC-183 / PR #436;
- cadeia: #431 -> #434 -> #436 -> RB-INC-184;
- Production e merge permanecem gates humanos.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-DOM-001 — Recommendation, Decision Intelligence, Context e Provenance;
5. RB-ARC-003 — Ports/Adapters, ExternalPlaceCandidate e Provenance;
6. RB-INC-139 — proximidade da Hospedagem em Recommendations;
7. RB-INC-147 — apresentação focada de Recommendations;
8. RB-INC-148 — promoção explícita de candidato externo;
9. RB-INC-156 — Discovery unificada;
10. RB-INC-164 — identidade única external-first;
11. RB-INC-168 — ranking contextual provider-neutral;
12. RB-INC-175 — Region accommodation-first;
13. RB-INC-182 — categorias contextuais da Discovery;
14. RB-INC-183 — descobertas externas no mapa;
15. RB-INC-184 / este Context Pack.

## 4. Diagnóstico canônico

`loadRecommendationExperience` utiliza `loadTripCuratedCatalog` e deriva `destinationId` a partir de Places publicados na Region.

Quando a lista está vazia ou possui identidade editorial não única:

```text
curatedCatalog.destinationId === undefined
-> destinationSupported: false
-> cards: []
-> UI: "Destino ainda não coberto"
```

Isso é compatível com a invariante de Recommendation persistida, mas insuficiente para RouteBook Anywhere porque a Discovery externa pode estar disponível no mesmo Contexto.

## 5. Invariantes

- Recommendation não é Decision;
- `RecommendationTarget` continua apontando somente para Place publicado;
- candidato externo não é Place canônico;
- sugestão externa é projeção read-only, não novo conceito de domínio;
- busca externa nunca escreve;
- `possible_match` ambíguo continua fail-closed;
- `rejected` nunca é apresentado;
- `linked`/`enriched` preserva identidade do Place canônico;
- mesma identidade não aparece como canônica e externa ao mesmo tempo;
- Preferência ausente não pode ser inferida;
- distância é geodésica, não rota nem ETA;
- Provenance permanece visível e provider-neutral;
- falha de Provider não invalida Recommendations canônicas;
- nenhum hardcode de Pipa, Gramado ou Destination específico;
- nenhum Provider novo, billing, secret ou Production.

## 6. Contratos reutilizados

- `Trip.destination`;
- `Trip.accommodation.coordinate`;
- `findTravelerProfile`;
- `resolvePlaceDiscoveryRegion`;
- `PlaceSearchPort`;
- `OverturePmtilesPlaceSearchAdapter`;
- `resolvePlaceBootstrapPolicy`;
- `runPlaceBootstrapStep`;
- `DrizzlePlaceRepository.listPublishedWithinRadius`;
- `DrizzlePlaceExternalReferenceRepository.listByPlaceIds`;
- `reconcileExternalPlaceCandidate`;
- `buildPlaceDiscoveryFeed`;
- `loadRecommendationExperience` para Recommendations canônicas;
- `buildFocusedRecommendationPresentation` para a coleção canônica;
- linguagem de distância geodésica já usada pela experiência de Recommendations.

## 7. Projeção autorizada

```text
ContextualExternalSuggestionViewModel
  id
  provider
  externalId
  name
  category
  addressLabel?
  geodesicDistanceLabel
  reasons[]
  limitations[]
  sourceLabel
  discoveryHref
```

`id` é identidade de apresentação derivada de `provider + externalId`; não é `RecommendationId` nem `PlaceId`.

A projeção deve ser imutável e efêmera.

## 8. Política de ordenação

Entrada: somente `PlaceDiscoveryItem.kind === "external"` depois de reconciliação/deduplicação.

Ordem:

1. candidatos cuja categoria corresponde a interesse conhecido;
2. menor `distanceMeters`;
3. nome em `pt-BR`;
4. `provider + externalId`.

Interesses atualmente mapeáveis reutilizam a correspondência canônica existente:

- `beaches -> beach`;
- `gastronomy -> gastronomy`;
- `nature -> nature`;
- `nightlife -> nightlife`.

Interesses sem categoria correspondente não fabricam score nem categoria.

Limite inicial da projeção: 6 sugestões externas focadas.

## 9. Reasons e Limitations

Reasons permitidos somente quando sustentados por dado conhecido:

- categoria corresponde a interesse informado;
- candidato está próximo da referência espacial conhecida;
- candidato foi descoberto na Region atual.

Limitations mínimas:

- descoberta externa ainda não é Place publicado;
- dados editoriais/operacionais do catálogo podem estar indisponíveis;
- distância é linha reta;
- ausência de interesses quando aplicável.

Não criar `RecommendationConfidence` para a projeção externa, pois isso aproximaria semanticamente a projeção do agregado persistido sem decisão de domínio.

## 10. Carregamento

O loader da projeção externa deve:

1. resolver Region;
2. carregar Places publicados da Region;
3. carregar external references dos Places canônicos;
4. consultar Overture pela política já existente;
5. reconciliar candidatos;
6. construir `buildPlaceDiscoveryFeed`;
7. selecionar apenas `external`;
8. aplicar interesse/distância;
9. limitar a 6;
10. devolver status `unavailable | disabled | success | failed` para microcopy.

A leitura pode reutilizar fixture E2E somente no mesmo guard já adotado pelo RB-INC-183: modo E2E ativo e ausência de `VERCEL_ENV`. Preview Vercel deve usar Overture real.

## 11. Integração com a página

A página deve:

- carregar Recommendations canônicas e sugestões externas sem fundir lifecycle;
- não exibir `Destino ainda não coberto` quando externas estão disponíveis;
- renderizar canônicas com `RecommendationCard` inalterado;
- renderizar externas em seção visualmente distinta;
- expor CTA para `/lugares` como exploração completa;
- não oferecer `Salvar lugar`, `Adicionar ao roteiro` ou `Ignorar` em sugestão externa;
- explicar que essas ações exigem um Place canônico e não são aplicadas silenciosamente.

## 12. Degradação

- Region indisponível: manter canônicas se houver; externas vazias;
- Discovery disabled/failed: manter canônicas e mensagem discreta; sem erro fatal;
- nenhuma canônica e nenhuma externa: estado vazio honesto, sem afirmar cobertura inexistente como regra permanente;
- perfil ausente: externas ordenadas por distância, com limitação de ausência de interesse.

## 13. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/recomendacoes/page.tsx
apps/web/app/viagens/[tripId]/recomendacoes/recommendations-page.module.css
apps/web/lib/recommendation-experience.ts
apps/web/lib/recommendation-experience.test.ts
apps/web/lib/recommendation-discovery-suggestions.ts
apps/web/lib/recommendation-discovery-suggestions.test.ts
apps/web/e2e/recommendations-experience.spec.ts
apps/web/e2e/recommendations-anywhere.spec.ts
docs/implementation/increments/rb-inc-184-contextual-external-suggestions.md
docs/implementation/context-packs/rb-inc-184-contextual-external-suggestions.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 14. Caminhos somente leitura

```text
modules/decision-intelligence/**
modules/place-catalog/**
modules/trip-management/**
packages/database/**
docs/core/**
docs/domain/**
docs/architecture/**
```

## 15. Testes mínimos

- projeção externa com interesse compatível;
- projeção sem interesses;
- ordem por distância;
- desempate estável;
- limite 6;
- candidate `external` apenas;
- dedupe via feed antes da projeção;
- Provider failed/disabled sem throw;
- página zero-seed com externas;
- página zero-seed sem externas;
- regressão das canônicas e ações existentes;
- E2E multi-destino;
- nenhuma escrita causada por abrir/recarregar a página.

## 16. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation e Engineering Validation devem concluir verdes no mesmo SHA. Preview Vercel deve estar READY no mesmo HEAD e validar Gramado com Overture real.

## 17. Gates humanos remanescentes

- integração da cadeia #431/#434/#436 antes da base final do RB-INC-184;
- qualquer alteração da invariante de `RecommendationTarget`;
- qualquer Provider/billing/secret novo;
- qualquer mudança em Production;
- merge do RB-INC-184 na `main`.

## 18. Handoff

Relatar SHA, arquivos alterados, comportamento canônico e externo, contagens, status de degradação, testes reais, CI, Preview Gramado, riscos e gates humanos restantes.
