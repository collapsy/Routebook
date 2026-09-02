---
id: RB-INC-175
title: Discovery Region accommodation-first e Place Discovery destination-agnostic
description: Torna a descoberta de Lugares independente de Pipa, compondo uma Region a partir da Hospedagem ou do Destination e consultando PlaceSearchPort por contexto espacial.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-02"
last_updated: "2026-09-02"
authors: [RouteBook Team]
tags: [implementation, place-catalog, discovery, region, overture, routebook-anywhere]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-ADR-012, RB-OBS-001, RB-INC-139, RB-INC-156, RB-INC-174, RB-CTX-175]
prerequisites: [RB-INC-174]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-175 — Discovery Region accommodation-first e Place Discovery destination-agnostic

## 1. Contexto

- Epic: #411 — M9 / RouteBook Anywhere: Destination Bootstrap.
- Issue: #415.
- Branch: `codex/rb-inc-175-discovery-region`.
- Base: `main@82020064fa39e096484b844d6bb0a0c060f4c43b`.
- RB-INC-174 tornou Trip e criação destination-agnostic.
- `/lugares` ainda possui centro fixo de Pipa, lookup de catálogo por `destinationId` derivado do nome e consulta externa condicionada a `pipa-rn-br`.

## 2. Resultado vertical

Para qualquer Trip com referência geográfica válida:

1. a Hospedagem geocodificada é a referência espacial principal;
2. sem Hospedagem geocodificada, o Destination fornece a referência espacial;
3. a aplicação compõe uma Region derivada e limitada;
4. o catálogo curado é lido por proximidade dessa Region;
5. o `PlaceSearchPort` recebe centro/raio/categorias/limite, sem identidade regional inventada;
6. candidatos externos permanecem não canônicos até ação explícita governada.

## 3. Region

`Region` já é conceito canônico em RB-DOM-001/RB-DOM-002: área geográfica usada para busca, agrupamento ou recomendação.

Este incremento implementa uma representação de aplicação para Discovery sem alterar o modelo de domínio:

- `source = accommodation | destination`;
- centro geográfico;
- raio governado;
- nível de referência;
- label de distância.

Não cria novo agregado nem nova linguagem.

## 4. Política espacial

### 4.1 Prioridade

```text
Accommodation.coordinate
→ Destination.latitude/longitude
→ indisponível
```

A ausência de referência espacial é estado explícito e não produz centro artificial.

### 4.2 Raios

- busca externa sob demanda: máximo 8 km;
- leitura curada por proximidade: janela limitada e determinística;
- filtro escolhido pelo usuário pode reduzir a busca, nunca ampliá-la além do limite do adapter;
- distância apresentada continua sendo geodésica/em linha reta;
- rota real e duração permanecem externas e separadas.

Nenhuma categoria recebe raio especial e nenhuma regra depende de praia.

## 5. PlaceSearchPort

`PlaceSearchQuery` deixa de exigir `destinationId`.

O contrato necessário ao Provider é exclusivamente espacial:

- `center`;
- `radiusMeters`;
- categorias opcionais;
- limite opcional.

Identidade canônica de Destination/Place não é responsabilidade do Provider de busca.

## 6. Catálogo publicado e reconciliação

A leitura do catálogo publicado deixa de depender de substring de Pipa na tela de Discovery.

O adapter PostgreSQL oferece consulta publicada por proximidade geográfica e a reconciliação carrega somente referências externas dos Places realmente participantes da Region.

Isso permite:

- Pipa continuar exibindo o catálogo curado;
- destinos sem seed terem zero Places publicados sem serem tratados como erro;
- candidatos Overture ainda aparecerem no mesmo feed;
- nenhuma promoção/publicação automática.

A promoção explícita continua limitada a uma identidade editorial existente; um destino sem catálogo canônico não ganha `destinationId` inventado neste slice.

## 7. Overture: serving sustentável

Documentação oficial consultada em 02/09/2026:

- https://docs.overturemaps.org/getting-data/cloud-sources/
- https://docs.overturemaps.org/examples/overture-tiles/
- https://docs.overturemaps.org/getting-data/

O Overture publica GeoParquet como dataset principal e STAC como índice de releases. Os PMTiles publicados no bucket `overturemaps-extras` alimentam o Explorer e são descritos como voltados a inspeção/visualização, não como backend de produção definitivo.

Decisão deste incremento:

- manter `OverturePmtilesPlaceSearchAdapter` como adapter transitório de Preview/teste, pois já existe e permite validar RouteBook Anywhere sem novo Provider;
- não promover PMTiles a contrato arquitetural de Production;
- direção de serving sustentável: extrair/consultar GeoParquet por bbox a partir da release descoberta via STAC e materializar um índice próprio consultável espacialmente;
- a escolha concreta de infraestrutura para esse índice exige incremento/ADR separado antes de Production;
- nenhum SDK pago, billing ou infraestrutura nova é ativado aqui.

## 8. Observabilidade

Logs estruturados da Discovery registram somente:

- source da Region;
- raio aplicado;
- quantidade de Places curados;
- candidatos externos;
- novos/possible-match/linked/rejected;
- duração total da busca externa;
- fallback/erro do adapter.

Coordenadas precisas da Hospedagem não são registradas.

## 9. Escopo

```text
modules/place-catalog/src/external-place.ts
modules/place-catalog/src/external-place.test.ts
packages/database/src/place-repository.ts
packages/database/src/place-repository.test.ts
packages/database/src/place-external-reference-repository.ts
packages/database/src/place-external-reference-repository.test.ts
apps/web/lib/place-discovery-region.ts
apps/web/lib/place-discovery-region.test.ts
apps/web/lib/overture-place-search.ts
apps/web/lib/overture-place-search.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/actions.ts
apps/web/app/viagens/[tripId]/lugares/actions.test.ts
apps/web/e2e/accommodation-proximity.spec.ts
apps/web/e2e/place-actions.spec.ts
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/place-discovery-anywhere.spec.ts
docs/implementation/increments/rb-inc-175-discovery-region.md
docs/implementation/context-packs/rb-inc-175-discovery-region.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 10. Fora de escopo

- mudar regras de identidade/reconciliação regional do RB-INC-176;
- alterar Recommendations;
- tornar candidato externo Saved Place sem promoção;
- detalhe interno para candidato externo;
- novo índice GeoParquet/STAC em Production;
- Provider pago;
- billing;
- secrets;
- migration;
- alterar RB-ADR-012;
- Production;
- mudar taxonomia canônica.

## 11. Critérios de aceite

- [ ] Pipa funciona sem centro fixo codificado na página;
- [ ] Florianópolis zero seed recebe candidatos externos;
- [ ] Hospedagem coordenada é referência primária;
- [ ] sem Hospedagem coordenada, Destination fornece fallback;
- [ ] sem referência espacial, Region fica indisponível e a UI não inventa precisão;
- [ ] `PlaceSearchPort` permanece provider-neutral e não exige `destinationId`;
- [ ] catálogo publicado é lido por proximidade, não por substring de Destination;
- [ ] nenhuma promoção/publicação automática;
- [ ] distância geodésica permanece separada de rota real;
- [ ] logs não registram coordenadas precisas da Hospedagem;
- [ ] estratégia Overture além de inspeção está documentada;
- [ ] PMTiles não é declarado serving definitivo de Production;
- [ ] Documentation e Engineering Validation verdes no mesmo SHA;
- [ ] merge permanece gate humano.

## 12. Riscos

| Risco | Mitigação |
| --- | --- |
| Region ampla demais | raio máximo governado |
| catálogo de cidade vizinha entrar na leitura | janela espacial limitada + distância exata |
| PMTiles virar dependência definitiva | status transitório documentado; Production fora de escopo |
| localização precisa em logs | telemetria registra source/raio/contagens, não coordenadas |
| candidato externo confundido com Place | badges/estado existentes e nenhuma promoção automática |
| regressão Pipa | E2E accommodation-first + fallback Destination |
| falso sucesso segunda cidade | E2E exige candidato externo e zero Place publicado |

## 13. Rollback

Não há migration. Reverter os commits restaura lookup regional anterior sem exigir reversão de dados.

## 14. Próximo slice

RB-INC-176 deverá remover regras de identidade/reconciliação regional específicas de Pipa e tornar matching de candidatos conservador para qualquer Destination.
