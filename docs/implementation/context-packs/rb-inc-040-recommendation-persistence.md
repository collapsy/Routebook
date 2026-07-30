---
id: RB-CTX-040
title: Context Pack do RB-INC-040
description: Contexto operacional para persistir Recommendations com deduplicação, rastreabilidade e isolamento por Viagem.
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
  - recommendation
  - persistence
related_documents:
  - RB-INC-040
  - RB-INC-039
  - RB-ARC-004
  - RB-DATA-002
prerequisites:
  - RB-INC-039
next_documents:
  - RB-CTX-041
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-040

## Missão

Adicionar a porta e o adapter de persistência das Recommendations sem mover invariantes para Drizzle nem antecipar Decision ou interface.

## Base

- issue: `#85`;
- branch: `feature/rb-inc-040-recommendation-persistence`;
- base verde: `a6037c17d93e8732e3e11d284db6c0ca20d10790`;
- PR base: `#89`.

## Leitura obrigatória

- `modules/decision-intelligence/**`;
- `packages/database/src/schema.ts`;
- adapters e testes existentes em `packages/database/src`;
- `packages/database/drizzle/0006_itinerary.sql` e metadados;
- documentos de dados, persistência, migrations e qualidade.

## Contratos

- domínio continua responsável por validar e reidratar Recommendation;
- repositório recebe TripId em toda leitura e mutação;
- adapter valida Trip, Destination e Place publicado;
- fingerprint é determinístico e não inclui dados pessoais, ID ou relógio;
- deduplicação padrão reutiliza ativa equivalente;
- supersession exige intenção explícita;
- transições persistidas são produzidas pelo domínio, não por update arbitrário de status.

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

## Dados mínimos

- RecommendationId, TripId e PlaceId;
- status;
- Context Snapshot versionado;
- contextFingerprint;
- Reasons e Limitations;
- Score interno;
- Confidence qualitativa e bases;
- validade;
- generator e policyVersion;
- generatedAt, presentedAt, resolvedAt, createdAt e updatedAt;
- DecisionId futura opcional;
- motivo de estado e Recommendation substituta opcional.

## Testes obrigatórios

- migration limpa e incremental;
- reidratação de generated, presented, rejected, expired, invalidated, superseded e accepted preparado para futura Decision;
- deduplicação concorrente protegida por constraint;
- round trip de JSON;
- cross-trip;
- Place não publicado ou de outro Destination;
- cascata por Trip;
- preservação de Place;
- fingerprint estável;
- ausência de dados pessoais no snapshot.

## Gate

Não criar RB-INC-041 até o workflow completo deste incremento ficar verde.