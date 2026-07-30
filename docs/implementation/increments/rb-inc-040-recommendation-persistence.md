---
id: RB-INC-040
title: Persistência e Ciclo de Vida das Recommendations
description: Define a persistência rastreável de Recommendations, seus snapshots, deduplicação contextual e isolamento por Viagem.
document_type: implementation-increment
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-07-30"
last_updated: "2026-07-30"
authors:
  - RouteBook Team
tags:
  - implementation
  - decision-intelligence
  - persistence
  - drizzle
  - migration
related_documents:
  - RB-INC-039
  - RB-DOM-003
  - RB-ARC-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-QA-001
prerequisites:
  - RB-INC-039
next_documents:
  - RB-INC-041
ai_context:
  priority: critical
  index: true
---

# RB-INC-040 — Persistência e Ciclo de Vida das Recommendations

## Estado

`Draft`

Issue: [#85](https://github.com/collapsy/Routebook/issues/85)

Branch: `feature/rb-inc-040-recommendation-persistence`

## Resultado vertical

Recommendations passam a sobreviver à recarga com Context Snapshot, Reasons, Limitations, Score, Confidence, validade, metadados e ciclo de vida integralmente reconstruídos.

## Decisões

1. `RecommendationRepository` pertence ao módulo Decision Intelligence.
2. O adapter Drizzle pertence a `@routebook/database`.
3. A migration será incremental e posterior à `0006`.
4. Trip e Place permanecem relações explícitas; estruturas compostas são persistidas como JSON versionado e validado na reconstrução.
5. `contextFingerprint` é calculado a partir de versões e identidades lógicas do contexto e da política, sem dados pessoais.
6. A operação padrão reutiliza uma Recommendation ativa equivalente; substituição exige modo explícito e marca a anterior como `superseded`.
7. Busca e mutação sempre exigem `TripId`, impedindo acesso cross-trip.
8. Place associado deve estar publicado e pertencer ao Destination da Trip.
9. Ownership da Recommendation é da Trip: exclusão da Trip remove Recommendations; exclusão de Place não pode deixar referência inválida.
10. A aceitação continua fora de escopo até a persistência de Decision no RB-INC-042.

## Estratégia de equivalência

Uma avaliação é equivalente quando possui a mesma Trip, Place, política e fingerprint lógico do Contexto. O fingerprint considera:

- `tripId` e `destinationId`;
- `tripContextVersion`;
- versões disponíveis de TravelerProfile e Itinerary;
- versão da política de geração;
- schema version do snapshot.

Instantes, IDs gerados, nomes de participantes e dados pessoais não participam.

## Operações mínimas

- salvar ou reutilizar Recommendation ativa equivalente;
- substituir explicitamente avaliação ativa equivalente;
- buscar por `(TripId, RecommendationId)`;
- listar por TripId;
- persistir transições `generated → presented`, `presented → rejected`, invalidação e substituição;
- reconstruir todos os estados já definidos pelo domínio.

## Critérios de aceite

- [ ] round trip completo preserva snapshot, motivos, limitações, score, confiança, validade e metadados;
- [ ] Recommendation pertence a uma única Trip;
- [ ] Place de outro Destination ou não publicado é rejeitado;
- [ ] acesso cross-trip retorna ausência ou erro sem expor dados;
- [ ] transições inválidas continuam rejeitadas pelo domínio;
- [ ] regeneração equivalente não cria duplicação ativa;
- [ ] substituição equivalente explícita torna a anterior `superseded`;
- [ ] mudança material de contexto permite invalidar a avaliação anterior;
- [ ] migration funciona em banco limpo e sobre `0000` a `0006`;
- [ ] cascatas seguem ownership;
- [ ] snapshot não contém dados pessoais desnecessários;
- [ ] testes de persistência e migration permanecem verdes.

## Caminhos permitidos

```text
modules/decision-intelligence/**
packages/database/src/**
packages/database/drizzle/**
packages/database/package.json
pnpm-lock.yaml
docs/implementation/increments/rb-inc-040-recommendation-persistence.md
docs/implementation/context-packs/rb-inc-040-recommendation-persistence.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Testes

- fingerprint determinístico;
- reidratação de cada estado;
- round trip de Reasons e Limitations;
- score e Confidence separados;
- deduplicação ativa;
- substituição explícita;
- invalidação por versão;
- cross-trip;
- Place incompatível;
- cascatas;
- banco limpo e cadeia completa de migrations;
- compatibilidade com dados anteriores.

## Riscos

- JSON sem validação;
- constraint física divergente do domínio;
- fingerprint incluindo instante aleatório;
- cascata indevida sobre Place;
- race condition na deduplicação;
- migration destrutiva.

## Fora de escopo

Interface, Decision persistida, aceitação, cache distribuído, filas, jobs, Provider externo, IA e analytics avançado.