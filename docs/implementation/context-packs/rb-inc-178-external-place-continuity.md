---
id: RB-CTX-178
title: Context Pack do RB-INC-178 — Continuidade de candidato externo
description: Delimita a entrada segura de candidatos descobertos em Salvos e Roteiro com Place global, revalidação e sem publicação automática.
document_type: implementation-context-pack
owner: Traveler Experience and Platform
status: Draft
version: "0.1.0"
created: "2026-09-03"
last_updated: "2026-09-03"
authors: [RouteBook Team]
tags: [implementation, context-pack, place, saved-place, itinerary]
related_documents: [RB-INC-178, RB-CORE-0004, RB-ARC-001, RB-ADR-013, RB-INC-164, RB-INC-176, RB-INC-177]
prerequisites: [RB-INC-176, RB-INC-177]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-178 — Continuidade de candidato externo

## Missão

Permitir que um candidato externo seguro e revalidado entre no planejamento de qualquer Viagem,
inclusive zero-seed, sem confundir materialização operacional com publicação editorial.

## Decisão aprovada

- Place possui identidade global;
- Destination e Region são contexto, não identidade;
- `destinationId` é vínculo editorial legado e opcional;
- dados curados de Pipa permanecem intactos;
- Recommendation continua separada de Place, Saved Place e Activity.

## Restrições

- autenticar e autorizar a Viagem antes da mutação;
- reconsultar o Provider no servidor e selecionar por external identity;
- não confiar em payload de Place enviado pelo cliente;
- criar somente `draft`;
- não publicar, recomendar ou aplicar proposta automaticamente;
- preservar Proveniência;
- bloquear provável duplicata;
- manter operações idempotentes;
- não ativar Provider, billing ou Production;
- não registrar PII, coordenadas ou hospedagem em logs.

## Contratos reutilizados

- `ExternalPlaceCandidate` e reconciliação do RB-INC-176;
- `PlacePromotionService`;
- `SavedPlaceRepository` e `savePlaceForTrip`;
- `ItineraryRepository` e ações de Activity existentes;
- Region accommodation-first do RB-INC-175;
- Discovery degradável do RB-INC-177.

## Testes mínimos

- Place pode existir sem Destination;
- migration permite `destination_id = NULL`;
- promoção zero-seed cria Place global em `draft`;
- external identity é reutilizada entre Destinations;
- possível duplicata permanece bloqueada;
- leitura por IDs inclui Place global não publicado;
- busca espacial por slug inclui rascunho próximo e rejeita distante;
- ação externa revalida o candidato e cria Saved Place;
- cliente não controla dados canônicos;
- Pipa mantém catálogo publicado e mídia curada.

## Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

CI e Preview são a evidência canônica. Merge na `main` permanece gate humano.
