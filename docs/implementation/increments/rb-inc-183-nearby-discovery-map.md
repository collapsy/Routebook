---
id: RB-INC-183
title: Descobertas externas próximas no mapa da visão geral
description: Faz a visão geral da Viagem representar Hospedagem, Places canônicos e descobertas externas seguras da Region sem publicação automática.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-07"
authors: [RouteBook Team]
tags: [implementation, discovery, map, region, accommodation, routebook-anywhere]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-ARC-003, RB-INC-139, RB-INC-156, RB-INC-164, RB-INC-175, RB-INC-178, RB-INC-181, RB-INC-182, RB-CTX-183]
prerequisites: [RB-INC-181, RB-INC-182]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-183 — Descobertas externas próximas no mapa da visão geral

## 1. Contexto

- Issue: #435.
- Branch: `codex/rb-inc-183-nearby-discovery-map`.
- Base empilhada: RB-INC-182 em `44985623b17bdb78be350c8d458e4c2ad6dc2b12`.
- A validação live do RB-INC-181 em Gramado comprovou a geocodificação automática da Hospedagem: `Hotel Sky Gramado` passou a aparecer no mapa sem latitude/longitude manual.
- A mesma validação expôs outra lacuna: a visão geral ainda projeta somente Hospedagem + Places publicados. Em uma Trip zero-seed, a tela informa `0 Places publicados` e representa apenas a Hospedagem mesmo quando a Discovery externa possui opções próximas.

## 2. Resultado vertical

A visão geral da Viagem passa a representar o entorno útil da Region com três origens explícitas:

1. Hospedagem;
2. Places canônicos publicados/salvos;
3. descobertas externas seguras e reconciliadas.

O mapa continua sendo read-only. Exibir candidato externo não publica, salva, recomenda, cria Decision nem adiciona Activity.

## 3. Decisões de desenho

### 3.1 Reutilizar a Discovery; não criar um segundo algoritmo

A visão geral reutiliza:

- Region accommodation-first do RB-INC-175;
- `PlaceSearchPort` / adapter Overture existente;
- política de bootstrap existente;
- referências externas persistidas;
- `reconcileExternalPlaceCandidate`;
- `buildPlaceDiscoveryFeed` para identidade, deduplicação e ordenação espacial.

O mapa apenas projeta o read model já reconciliado.

### 3.2 Candidato externo continua externo

- `external` usa `TripMapPoint.kind = "external-place"`;
- `published`/`enriched` usam identidade canônica do Place;
- `possible_match` que não possa ser representado sem ambiguidade permanece retido pelas regras do feed;
- `rejected` nunca aparece;
- nenhum read persiste promoção ou publicação.

### 3.3 Hospedagem define o entorno quando disponível

A Region continua preferindo `Trip.accommodation.coordinate`. Destination é fallback espacial quando a Hospedagem não possui coordenada.

Distância permanece geodésica e não significa rota, trânsito, duração ou Meio de transporte.

### 3.4 Visão geral é resumo, não catálogo completo

A Discovery completa continua em `/viagens/[tripId]/lugares`.

Na visão geral:

- Places canônicos elegíveis da Region permanecem representáveis;
- descobertas external-only são limitadas aos 20 candidatos seguros mais próximos após reconciliação;
- a UI informa a quantidade exibida e mantém CTA para explorar todos os lugares;
- o limite é de apresentação, não altera busca, reconciliação ou disponibilidade no catálogo ampliado.

### 3.5 Falha externa degrada sem bloquear a Trip

Timeout, indisponibilidade ou falha Overture mantém Hospedagem + Places canônicos no mapa. A copy informa degradação sem transformar ausência temporária em ausência real de lugares.

## 4. UX

A seção deixa de ser descrita como “Mapa dos N Places publicados”.

Copy alvo:

- título orientado ao entorno, por exemplo `Mapa do entorno de {Destination}`;
- resumo explícito de Hospedagem, canônicos e descobertas externas visíveis;
- legenda existente diferencia `Hospedagem`, `Place publicado`, `Lugar salvo` e `Descoberta externa`;
- CTA `Explorar lugares` continua levando ao catálogo completo.

## 5. Escopo

```text
apps/web/app/viagens/[tripId]/page.tsx
apps/web/lib/trip-overview-discovery-map.ts
apps/web/lib/trip-overview-discovery-map.test.ts
apps/web/e2e/authenticated-trips.spec.ts
docs/implementation/increments/rb-inc-183-nearby-discovery-map.md
docs/implementation/context-packs/rb-inc-183-nearby-discovery-map.md
docs/registry.md
```

Alteração fora desses caminhos exige atualização deste incremento antes do commit.

## 6. Fora de escopo

- mudar taxonomia/categorias;
- alterar ranking de Recommendations;
- criar rota, ETA ou trânsito;
- publicar/promover candidato externo automaticamente;
- mudar regras de reconciliação;
- aumentar limite do Provider ou raio máximo da Region;
- novo Provider, API paga, secret ou billing;
- migration;
- alteração de Production;
- merge na `main` sem autorização humana.

## 7. Critérios de aceite

- [ ] visão geral usa Region derivada da Trip;
- [ ] Hospedagem continua aparecendo quando coordenada;
- [ ] Places canônicos próximos continuam aparecendo com identidade canônica;
- [ ] candidatos externos seguros podem aparecer sem publicação prévia;
- [ ] candidatos externos usam marcador/origem `Descoberta externa`;
- [ ] `rejected` e ambiguidades retidas pelo feed não aparecem como ponto independente;
- [ ] external-only é limitado a 20 itens mais próximos no resumo;
- [ ] renderização não cria Place, Saved Place, Recommendation, Decision ou Activity;
- [ ] falha externa degrada para contexto canônico existente;
- [ ] copy não afirma que o mapa contém somente Places publicados;
- [ ] Gramado zero-seed com Hospedagem pode mostrar entorno externo no Preview;
- [ ] Pipa não duplica Place publicado e candidato equivalente;
- [ ] testes unitários cobrem sucesso, deduplicação, limite e degradação;
- [ ] E2E não depende de rede externa para ser determinístico; quando a fonte live for necessária, Preview humano é a evidência complementar;
- [ ] Documentation e Engineering Validation verdes no mesmo SHA;
- [ ] Vercel Preview READY e validado;
- [ ] Production permanece intocada;
- [ ] merge permanece gate humano explícito.

## 8. Riscos

| Risco | Mitigação |
| --- | --- |
| mapa excessivamente denso | limitar external-only a 20 no resumo e preservar density mode existente |
| duplicar Lugar publicado e externo | usar reconciliação + `buildPlaceDiscoveryFeed` existentes |
| confundir externo com conteúdo curado | manter `external-place` e legenda/provenance explícitas |
| Provider falhar | degradar para Hospedagem + canônicos |
| consulta da home ficar pesada | reutilizar limites/bootstrap existentes e não executar mídia/quality na visão geral |
| regra regional reaparecer | Region deriva da Trip; nenhum nome de destino participa da política |

## 9. Rollback

Sem migration. Rollback volta a visão geral para Hospedagem + Places publicados; nenhuma entidade externa é persistida por esta implementação.
