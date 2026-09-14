---
id: RB-CTX-183
title: Context Pack do RB-INC-183 — descobertas próximas no mapa da visão geral
description: Delimita a projeção read-only de Hospedagem, Places canônicos e candidatos externos seguros no contexto espacial da Viagem.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-07"
authors: [RouteBook Team]
tags: [implementation, context-pack, discovery, map, region, routebook-anywhere]
related_documents: [RB-INC-183, RB-CORE-0004, RB-DOM-001, RB-ARC-003, RB-INC-139, RB-INC-156, RB-INC-164, RB-INC-175, RB-INC-178, RB-INC-181, RB-INC-182]
prerequisites: [RB-INC-181, RB-INC-182]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-183 — descobertas próximas no mapa da visão geral

## 1. Missão

Fazer o contexto espacial da visão geral representar o entorno útil da Trip sem exigir publicação prévia dos candidatos que a Discovery já conhece.

## 2. Unidade de trabalho

- issue: #435;
- branch: `codex/rb-inc-183-nearby-discovery-map`;
- base empilhada: `44985623b17bdb78be350c8d458e4c2ad6dc2b12` do RB-INC-182;
- PR do RB-INC-182: #434;
- RB-INC-181 já está Ready, porém a cadeia ainda não foi integrada na `main`;
- Production e merge permanecem gates humanos.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-DOM-001;
5. RB-ARC-003;
6. RB-INC-139 / RB-CTX-139;
7. RB-INC-156 / RB-CTX-156;
8. RB-INC-164 / RB-CTX-164;
9. RB-INC-175 / RB-CTX-175;
10. RB-INC-178 / RB-CTX-178;
11. RB-INC-181;
12. RB-INC-182 / RB-CTX-182;
13. RB-INC-183 / este Context Pack.

## 4. Invariantes

- Region é área de busca; não é Destination;
- Hospedagem coordenada é referência espacial preferencial;
- candidato externo não é Place canônico;
- `linked`/`enriched` mantém identidade do Place;
- `possible_match` não cria vínculo automático;
- `rejected` não é exibido;
- lista/feed e mapa não podem divergir sobre identidade;
- mapa é read-only e não publica, salva ou planeja;
- distância é geodésica e não representa rota/tempo;
- falha externa não bloqueia Hospedagem nem catálogo canônico;
- Provider e Provenance permanecem fora do domínio;
- nenhuma regra pode depender de `Pipa`, `Gramado` ou outro nome de região;
- nenhum secret, billing, Provider pago ou Production.

## 5. Contratos reutilizados

- `Trip.destination` e `Trip.accommodation.coordinate`;
- `resolvePlaceDiscoveryRegion`;
- `PlaceSearchPort` e `OverturePmtilesPlaceSearchAdapter`;
- `resolvePlaceBootstrapPolicy` / `runPlaceBootstrapStep`;
- `DrizzlePlaceRepository.listPublishedWithinRadius`;
- `DrizzlePlaceExternalReferenceRepository.listByPlaceIds`;
- `reconcileExternalPlaceCandidate`;
- `buildPlaceDiscoveryFeed`;
- `TripMapPoint` e `TripMap` com `external-place` já suportado.

## 6. Read model autorizado

O incremento pode criar um read model efêmero para a visão geral:

```text
TripOverviewDiscoveryMap
  region
  points
    accommodation?
    canonical[]
    external[]
  publishedCount
  externalVisibleCount
  externalAvailableCount
  discoveryStatus
```

Esse tipo não é agregado nem entidade persistida.

## 7. Política de visualização

- canônicos seguros da Region podem ser representados;
- external-only entra somente depois de reconciliação/feed;
- external-only visível na visão geral: no máximo 20;
- ordenação espacial vem do feed existente;
- candidato externo não recebe detalhe interno falso;
- CTA para `/lugares` permanece caminho para exploração completa;
- mapa com densidade alta continua usando o comportamento existente do `TripMap`.

## 8. Degradação

Se Region não puder ser resolvida:

- manter Hospedagem se houver coordenada utilizável;
- não inventar externos.

Se Overture estiver disabled/failed:

- manter Places canônicos + Hospedagem;
- retornar status suficiente para microcopy recuperável;
- não propagar erro de Provider como falha fatal da visão geral.

## 9. Testes mínimos

- Hospedagem é prependida sem alterar sua identidade;
- externo `new` seguro vira `external-place`;
- `linked`/equivalente não duplica Place canônico;
- `rejected` não aparece;
- limite externo de 20 é aplicado após reconciliação;
- falha de search mantém canônicos;
- zero-seed com candidatos externos produz mais que somente a Hospedagem;
- read não chama mutação/promoção;
- regressão do `TripMap` mantém legenda de `Descoberta externa`;
- Preview live em Gramado comprova cobertura real sem publicação.

## 10. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation e Engineering Validation devem concluir no mesmo SHA. Preview Vercel deve estar READY no mesmo HEAD funcional.

## 11. Gates humanos remanescentes

- integrar RB-INC-181 / RB-INC-182 antes da base final desta cadeia;
- qualquer mudança de Provider/billing;
- qualquer mudança em Production;
- integrar RB-INC-183 na `main`.

## 12. Handoff

Relatar SHA, arquivos, contagens do read model, comportamento de degradação, testes reais, CI, Preview Gramado, riscos residuais e gates humanos restantes.
