---
id: RB-INC-172
title: Experiência completa de ranking de Places
description: Conecta o motor de qualidade à Discovery, adiciona UI de ordenação, score, evidências e Top 5, com adapters Google/Foursquare explicitamente configuráveis e degradação segura.
document_type: implementation-increment
owner: Place Catalog and Decision Intelligence
status: Draft
version: "0.1.0"
created: "2026-08-28"
last_updated: "2026-08-28"
authors: [RouteBook Team]
tags: [implementation, ranking, places, discovery, google-places, foursquare, pipa]
related_documents: [RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-168, RB-INC-170, RB-INC-171, RB-CTX-172]
prerequisites: [RB-INC-168, RB-INC-171]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-172 — Experiência completa de ranking de Places

## 1. Contexto

Issue: `#401`.

Issue raiz do ranking: `#390`.

Branch: `codex/rb-inc-172-place-ranking-experience`.

Base de Preview: PR #400 / SHA `5145a5e59907a02c4a9370b299b6c7d60ea1a146`, empilhada sobre #398 → #396 → #387.

RB-INC-168 entregou o contrato provider-neutral, reputação Bayesiana, RouteBook Score e ordenação determinística. Faltava conectar esses conceitos à experiência de Discovery e ao runtime sem produzir Top fictício.

## 2. Objetivo

Completar a experiência visível de ranking:

- Recomendados;
- Melhor avaliados;
- Mais populares;
- Mais próximos;
- posição na ordenação atual;
- RouteBook Score;
- rating/volume quando disponíveis;
- popularidade quando disponível;
- Provider e instante de coleta;
- motivos explicáveis;
- Top 5 por categoria, recolhido por padrão para não aumentar carga cognitiva.

## 3. Runtime provider-neutral

`resolveConfiguredPlaceQualityProvider` não ativa Provider implicitamente.

Configuração autorizada:

```text
ROUTEBOOK_PLACE_QUALITY_PROVIDER=google
GOOGLE_PLACES_API_KEY=<secret>
```

ou:

```text
ROUTEBOOK_PLACE_QUALITY_PROVIDER=foursquare
FOURSQUARE_PLACES_API_KEY=<secret>
```

Sem seleção explícita, nenhuma chamada externa acontece.

Provider selecionado sem secret também não realiza chamada e a UI mantém apenas `Mais próximos`.

## 4. Google Places

Adapter server-side usa Text Search (New):

```text
POST https://places.googleapis.com/v1/places:searchText
```

FieldMask limitado ao necessário para o ranking:

```text
places.id
places.displayName
places.location
places.rating
places.userRatingCount
```

Não solicita reviews, fotos ou Atmosphere nesta fatia.

Google exige API key e billing habilitado. Rating e `userRatingCount` pertencem ao tier aplicável do Places API conforme documentação vigente; ativação continua gate humano.

## 5. Foursquare Places

Adapter usa a API atual:

```text
GET https://places-api.foursquare.com/places/search
X-Places-Api-Version: 2025-06-17
Authorization: Bearer <Service Key>
```

Campos:

```text
fsq_place_id,name,latitude,longitude,rating,popularity
```

O endpoint aceita ordenação por RELEVANCE, RATING, DISTANCE e POPULARITY. O RouteBook usa a resposta como sinais e calcula seu próprio score.

## 6. Matching conservador

Rating nunca é atribuído apenas porque nomes se parecem.

Matching exige:

- identidade normalizada exata dentro de distância máxima conservadora; ou
- tokens distintivos com alta cobertura e distância curta;
- um mesmo externalId não é reutilizado em dois targets na mesma consulta.

Homônimo distante é rejeitado.

## 7. Comportamento da UI

Quando existem sinais:

- controles compatíveis são habilitados;
- card mostra posição;
- score RouteBook aparece separado do rating externo;
- rating/volume/popularidade aparecem somente se informados;
- Provider e coleta ficam visíveis;
- selo Top categoria só aparece para o primeiro colocado com score real;
- Top 5 usa somente itens com quality.

Quando não existem sinais:

- apenas `Mais próximos` fica acionável;
- outros modos aparecem indisponíveis;
- nenhuma nota, score ou Top é fabricado;
- query solicitando ordenação indisponível degrada para distância.

## 8. Lista e mapa

A projeção ordenada é compartilhada pela grade e pelo mapa. Ordenar não cria, salva ou altera Place.

## 9. Falhas externas

- falha do Provider não quebra Discovery;
- ranking degrada para distância;
- erro exposto ao usuário não contém secret;
- chamadas possuem timeout;
- sucesso parcial por categoria pode ser usado;
- nenhum sinal é persistido.

## 10. Escopo

```text
apps/web/lib/place-quality-provider.ts
apps/web/lib/place-quality-provider.test.ts
apps/web/lib/place-discovery-ranking.ts
apps/web/lib/place-discovery-ranking.test.ts
apps/web/components/place-ranking-meta.tsx
apps/web/components/place-ranking-meta.module.css
apps/web/components/place-ranking-meta.test.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/place-discovery.module.css
apps/web/e2e/place-discovery-filters.spec.ts
docs/implementation/increments/rb-inc-172-place-ranking-experience.md
docs/implementation/context-packs/rb-inc-172-place-ranking-experience.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 11. Fora de escopo

- criar conta/chave de Provider;
- ativar billing;
- armazenar secret em código;
- persistir rating/reviews/popularidade;
- scraping;
- reviews próprios;
- Production;
- merge da pilha antes do aceite humano da #387.

## 12. Critérios de aceite

- [ ] controles de ordenação preservam filtros;
- [ ] modos sem sinal ficam indisponíveis;
- [ ] score/rating/popularidade não aparecem sem evidência;
- [ ] posição reflete a ordenação efetiva;
- [ ] Top 5 contém apenas score real;
- [ ] cards expõem Provenance;
- [ ] matching rejeita homônimo distante;
- [ ] Google usa FieldMask mínimo;
- [ ] Foursquare usa endpoint e versão atuais;
- [ ] ausência de configuração não chama Provider;
- [ ] falha de Provider degrada para distância;
- [ ] lista e mapa usam a mesma ordem;
- [ ] unit/component/E2E cobrem política de ausência;
- [ ] Documentation + Engineering/Playwright verdes no mesmo SHA;
- [ ] Vercel READY no mesmo SHA.

## 13. Gate humano restante

Para o ranking real aparecer no Preview/Production, ainda é necessária uma decisão material:

1. escolher Google Places ou Foursquare;
2. provisionar a chave correspondente;
3. aceitar termos/quota/billing aplicáveis;
4. configurar `ROUTEBOOK_PLACE_QUALITY_PROVIDER` e o secret na Vercel;
5. executar a comparação live prevista em #390 antes de declarar o Provider adotado.

Até esse gate, a implementação fica pronta e verificável sem fabricar ranking.

## 14. Rollback

Remover configuração de Provider é suficiente para voltar imediatamente à ordenação por proximidade. Não há migration nem persistência de sinais.
