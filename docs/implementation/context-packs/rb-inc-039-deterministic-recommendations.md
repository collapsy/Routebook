---
id: RB-CTX-039
title: Context Pack do RB-INC-039
description: Contexto operacional para implementar geração determinística e explicável de Recommendations de Places.
document_type: implementation-context-pack
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-07-30"
last_updated: "2026-07-30"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - deterministic-ranking
related_documents:
  - RB-INC-039
  - RB-INC-038
  - RB-DOM-003
  - RB-ARC-002
prerequisites:
  - RB-INC-038
next_documents:
  - RB-CTX-040
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-039

## Missão

Implementar geração determinística de Recommendations de Places publicados, usando contratos públicos existentes e sem inventar dados ausentes.

## Base

- issue: `#84`;
- branch: `feature/rb-inc-039-deterministic-recommendations`;
- base verde: `cc4d36d62ba9f9b4906a99ae29c044fdaf70e936`;
- PR base: `#88`.

## Entradas

- TripId, DestinationId e ContextVersion;
- TravelerProfile com interests e version;
- Accommodation coordenada opcional;
- Itinerary version e PlaceIds planejados;
- PlaceIds salvos;
- Places do catálogo;
- relógio e fábrica de IDs injetáveis.

## Contratos obrigatórios

- `calculateGeodesicDistance` de `@routebook/geo-distance`;
- categorias de `@routebook/place-catalog`;
- tipos públicos do TravelerProfile, Trip, Itinerary e Saved Place;
- `createRecommendation` e transições do RB-INC-038.

## Regras

- filtrar `publicationStatus === "published"` e `destinationId` compatível;
- mapear somente beaches, gastronomy, nature e nightlife;
- não mapear culture, rest, adventure ou shopping;
- Reasons devem citar critérios conhecidos;
- sem coordenada de Accommodation, registrar Limitation e não aplicar distância;
- score usa constantes nomeadas: interesse 100, distância 30/20/10/0;
- desempate estável por slug;
- Confidence: high com interesse e distância, medium com um, low sem ambos;
- score nunca entra no texto visível;
- estado salvo/planejado não altera candidatura nem score.

## Caminhos permitidos

```text
modules/decision-intelligence/**
pnpm-lock.yaml
docs/implementation/increments/rb-inc-039-deterministic-recommendations.md
docs/implementation/context-packs/rb-inc-039-deterministic-recommendations.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Proibido

Persistência, interface, alteração em módulos consumidores, algoritmo geográfico alternativo, aleatoriedade interna, preço, rating, horário, disponibilidade, duração, rota, trânsito, scraping, Provider e IA.

## Testes obrigatórios

- quatro matches canônicos;
- quatro interesses sem match;
- distância por todas as faixas;
- ausência de distância;
- coordenada zero;
- filtro de publicação e Destination;
- empate por slug;
- mesmos inputs e ordem;
- Reasons e Limitations;
- Confidence independente do score;
- salvos e planejados sem penalidade.

## Gate

Executar workflow integral e não criar RB-INC-040 antes do SHA verde.