---
id: RB-CTX-175
title: Context Pack do RB-INC-175 — Discovery Region
description: Delimita Region accommodation-first, PlaceSearchPort espacial e descoberta Overture destination-agnostic sem compromisso de Production.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-02"
last_updated: "2026-09-02"
authors: [RouteBook Team]
tags: [implementation, context-pack, region, discovery, overture, routebook-anywhere]
related_documents: [RB-INC-175, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-ADR-012, RB-OBS-001, RB-INC-139, RB-INC-156, RB-INC-174]
prerequisites: [RB-INC-174]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-175 — Discovery Region

## 1. Missão

Fazer `/lugares` descobrir opções por Region derivada do Contexto da Trip, priorizando Hospedagem e usando Destination como fallback, sem centro fixo de Pipa.

## 2. Unidade de trabalho

- Epic: #411;
- Issue: #415;
- branch: `codex/rb-inc-175-discovery-region`;
- base: `main@82020064fa39e096484b844d6bb0a0c060f4c43b`;
- merge: gate humano;
- Production: fora de escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-DOM-001 / RB-DOM-002, especialmente Region;
5. RB-ARC-001;
6. RB-ADR-012 sem alterar seu status;
7. RB-OBS-001;
8. RB-INC-139;
9. RB-INC-156;
10. RB-INC-174;
11. RB-INC-175 / este Context Pack.

## 4. Invariantes

- Region é área de busca, não Destination;
- Destination não é Place;
- Hospedagem coordenada é referência espacial preferencial;
- fallback para Destination é explícito;
- distância geodésica não é rota real;
- candidato externo não é Place canônico;
- Provider não recebe identidade canônica desnecessária;
- falha de Provider não bloqueia catálogo curado;
- nenhuma coordenada precisa da Hospedagem em logs;
- nenhum Provider pago, billing ou Production.

## 5. Contratos reutilizados

- `Trip.destination`;
- `Trip.accommodation.coordinate`;
- `PlaceSearchPort`;
- `ExternalPlaceCandidate`;
- `reconcileExternalPlaceCandidate`;
- `placeDistanceMeters`;
- `DrizzlePlaceRepository`;
- `DrizzlePlaceExternalReferenceRepository`;
- feed/ranking/mapa existentes.

## 6. Regras Overture

- PMTiles existente é transitório para Preview/teste;
- não declarar PMTiles como backend definitivo de Production;
- nenhuma consulta deve depender de `destinationId`;
- raio máximo 8 km;
- limite máximo existente preservado;
- timeout e degradação preservados;
- GeoParquet + STAC é direção de serving sustentável, sem infraestrutura nova neste slice.

## 7. Testes mínimos

- Region escolhe Hospedagem antes do Destination;
- Region usa Florianópolis sem regra regional;
- estado sem referência espacial é explícito;
- `validatePlaceSearchQuery` não exige Destination;
- adapter Overture recebe apenas contexto espacial;
- PostgreSQL encontra Places publicados por proximidade;
- referências externas são carregadas por conjunto de PlaceIds;
- Pipa mantém catálogo e externos usando Hospedagem;
- Pipa sem Hospedagem usa Destination;
- Florianópolis zero seed exibe externos e zero publicados;
- UI rotula referência de distância corretamente;
- promoção não inventa `destinationId` para destino sem catálogo.

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

CI do GitHub é a evidência canônica.

## 9. Gates humanos remanescentes

- escolher/ativar infraestrutura de serving GeoParquet/STAC em Production;
- Provider pago;
- alterar RB-ADR-012;
- Production;
- integrar na main.

## 10. Handoff

Relatar SHA, arquivos, testes, CI, Preview, comportamento Pipa/Florianópolis, limitação transitória do PMTiles e próximo incremento.
