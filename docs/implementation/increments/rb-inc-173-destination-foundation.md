---
id: RB-INC-173
title: Destination Foundation destination-agnostic
description: Remove do núcleo de Trip e da persistência a suposição implícita de Pipa, alinhando Destination à modelagem canônica e preparando a criação genérica de viagens.
document_type: implementation-increment
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-01"
last_updated: "2026-09-01"
authors: [RouteBook Team]
tags: [implementation, trip, destination, routebook-anywhere, destination-bootstrap]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-ADR-012, RB-INC-136, RB-INC-172, RB-CTX-173]
prerequisites: [RB-INC-136, RB-INC-172]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-173 — Destination Foundation destination-agnostic

## 1. Contexto

- Epic: #411 — M9 / RouteBook Anywhere: Destination Bootstrap.
- Issue: #412.
- Branch: `codex/rb-inc-173-destination-foundation`.
- Base: `main` em `b067a688f39c1e3298e9670b6a82c9857a188f0e`.
- O RB-INC-136 confirmou uso real útil em Pipa, que permanece cenário de regressão e conteúdo curado, não regra universal.
- O RB-INC-172 já está integrado na base.
- A PR #410 / Issue #382 de Google Places Photos permanece independente, Draft e Preview-only.

## 2. Problema

A documentação canônica já define `Destination` como Value Object genérico com tipos:

`city | district | region | island | park | custom-region`.

A implementação concreta de Trip, porém, ainda restringia:

- `type` a `district`;
- `countryCode` a `BR`;
- `timeZone` a `America/Fortaleza`;
- toda nova Trip a uma constante `PIPA_DESTINATION`.

A persistência agravava o problema ao ignorar `destination_type`, `country_code` e `time_zone` já armazenados na tabela `trips` e reidratar sempre os valores de Pipa.

## 3. Objetivo

Remover a dependência implícita de Pipa do núcleo de Trip e da reidratação PostgreSQL sem ainda introduzir resolução geográfica, Provider, nova migration ou mudança de UX.

Este slice prova a fundação estrutural com dois Destinations explícitos, mas não declara o produto destination-agnostic completo.

## 4. Decisão de modelagem

Nenhum conceito canônico novo é necessário.

O domínio existente já possui:

- Destination;
- Region;
- Location;
- Accommodation;
- PlaceResolutionService.

Portanto este incremento não cria `DestinationContext`, `DiscoveryRegion` ou `DestinationBootstrapService` como entidades/serviços de domínio.

Abstrações adicionais só devem surgir quando um próximo slice demonstrar necessidade concreta.

## 5. Regras de Destination aplicadas

A implementação concreta passa a:

- aceitar os seis `DestinationType` documentados;
- exigir nome não vazio;
- normalizar `countryCode` para ISO alpha-2 em maiúsculas;
- validar coordenadas pelos contratos existentes de `GeoCoordinate`;
- exigir timezone IANA válido;
- copiar o timezone do Destination para o Trip Period.

A resolução de texto do usuário para esses valores pertence à camada de aplicação/integração e fica para o próximo incremento.

## 6. Persistência

A tabela `trips` já possui:

- `destination_name`;
- `destination_type`;
- `country_code`;
- `latitude`;
- `longitude`;
- `time_zone`.

Logo:

- nenhuma migration é necessária;
- create continua persistindo os valores do Destination;
- read deixa de sobrescrever os valores por Pipa;
- um round-trip com Florianópolis valida `city / BR / America/Sao_Paulo`.

## 7. Auditoria inicial de dependências de Pipa

| Ocorrência | Classificação | Tratamento |
| --- | --- | --- |
| `modules/trip-management/src/trip.ts` — `PIPA_DESTINATION` e literais de tipo/país/fuso | deve ser generalizada | resolvida neste incremento |
| `packages/database/src/trip-repository.ts` — reidratação `district/BR/America-Fortaleza` | deve ser generalizada | resolvida neste incremento |
| `apps/web/app/viagens/nova/**` — destino read-only/defaults de Pipa | deve ser generalizada | próxima fatia de criação genérica |
| `apps/web/app/viagens/[tripId]/lugares/page.tsx` — `pipaDiscoveryCenter` e `resolveDestinationId` | deve ser generalizada | fatia de Region/Discovery |
| `apps/web/lib/trip-destination.ts` — id somente para nome contendo Pipa | deve ser generalizada | fatia de Region/Discovery |
| `modules/place-catalog/src/external-place.ts` — tokens regionais Pipa/Tibau/RN | deve ser generalizada | fatia de identidade |
| `apps/web/lib/place-quality-provider.ts` — stopwords Pipa/Tibau/RN | deve ser generalizada | fatia de identidade/quality |
| `apps/web/components/pipa-daily-experiences.tsx` | deve ser generalizada ou condicionada | fatia temporal/experiências |
| migrations históricas `0026/0027/0030/0031` | pode permanecer como conteúdo/histórico | não alterar |
| `apps/web/public/place-images/pipa/**` e `pipa-place-images.json` | pode permanecer como conteúdo curado | não alterar |
| testes/fixtures que exercitam Pipa | pode permanecer como fixture/regressão | adicionar segundo destino, não apagar Pipa |
| docs de incrementos M8/Pipa | pode permanecer como histórico/rastreabilidade | não alterar |

## 8. Escopo

```text
modules/trip-management/src/trip.ts
modules/trip-management/src/trip.test.ts
modules/trip-management/src/authenticated-trip-owner.test.ts
packages/database/src/trip-repository.ts
packages/database/src/trip-repository-postgres.test.ts
packages/database/src/authenticated-trip-service-postgres.test.ts
packages/database/src/authenticated-trip-query-postgres.test.ts
packages/database/src/accept-itinerary-proposal-service-postgres.test.ts
packages/database/src/apply-itinerary-proposal-partially-transaction-postgres.test.ts
packages/database/src/apply-itinerary-proposal-transaction-postgres.test.ts
packages/database/src/decision-repository.test.ts
packages/database/src/decision-transaction-fragment-postgres.test.ts
packages/database/src/edit-itinerary-proposal-service-postgres.test.ts
packages/database/src/itinerary-free-period-repository.test.ts
packages/database/src/itinerary-proposal-decision-repository.test.ts
packages/database/src/itinerary-repository.test.ts
packages/database/src/planning-conflict-decision-service.test.ts
packages/database/src/planning-conflict-repository.test.ts
packages/database/src/proposal-repository.test.ts
packages/database/src/recommendation-repository.test.ts
packages/database/src/trip-authorization-repository-postgres.test.ts
apps/web/app/viagens/nova/actions.ts
docs/implementation/increments/rb-inc-173-destination-foundation.md
docs/implementation/context-packs/rb-inc-173-destination-foundation.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

O uso de uma fixture Pipa explícita na Server Action é transitório e evita alterar UX ou introduzir rede neste slice. Ela é um débito deliberadamente rastreado para a próxima fatia.

## 9. Fora de escopo

- Destination Resolver;
- geocoding de destino;
- resolução automática de timezone;
- mudança visual da criação de viagem;
- remoção do catálogo curado de Pipa;
- Region/Discovery genérica;
- bootstrap assíncrono;
- novo Provider;
- Google Places/Photos;
- migration;
- Production;
- billing;
- merge.

## 10. Critérios de aceite

- [ ] `createTrip` não escolhe Pipa implicitamente;
- [ ] `DestinationType` representa os seis tipos canônicos;
- [ ] Destination explícito possui nome, país, coordenada e timezone validados;
- [ ] Trip Period herda o timezone do Destination;
- [ ] reidratação PostgreSQL usa os valores persistidos;
- [ ] teste com Florianópolis prova um segundo Destination;
- [ ] Pipa permanece válida quando fornecida explicitamente;
- [ ] nenhuma migration, Provider, secret, billing ou Production é alterado;
- [ ] Documentation Validation e Engineering Validation passam no mesmo SHA final;
- [ ] integração na main permanece gate humano.

## 11. Riscos

| Risco | Mitigação |
| --- | --- |
| mover o hardcode em vez de removê-lo do produto | fixture transitória explicitamente rastreada; UX genérica é próximo slice |
| dados legados inválidos | banco atual já contém os campos; leitura deixa de inventar valores |
| timezone inválido | validação IANA na fronteira de criação |
| ampliar domínio silenciosamente | tipos copiados literalmente do RB-DOM-001; nenhum conceito novo |
| regressão Pipa | manter fixture e testes Pipa enquanto se adiciona Florianópolis |
| acoplar Provider cedo | nenhum Provider entra neste incremento |

## 12. Rollback

Reverter o código deste slice restaura o comportamento anterior. Não há migration, backfill, alteração destrutiva, novo secret nem write de Production.

## 13. Próximo slice

Resolver Destination informado pelo usuário no fluxo de criação, por uma porta provider-neutral, mantendo resolução de coordenadas/país/fuso fora do domínio e com degradação explícita.
