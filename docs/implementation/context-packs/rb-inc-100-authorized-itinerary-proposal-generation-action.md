---
id: RB-CTX-100
title: Context Pack do RB-INC-100 — Server Action autorizada para gerar Itinerary Proposal
description: Contexto operacional da fronteira server-side autorizada para geração autoritativa de Itinerary Proposal.
document_type: implementation-context
owner: Engineering
status: Draft
version: "0.1.0"
created: "2026-08-07"
last_updated: "2026-08-07"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - generation
  - authorization
  - server-action
related_documents:
  - RB-INC-100
  - RB-INC-087
  - RB-INC-090
  - RB-INC-099
prerequisites:
  - RB-INC-099
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-100 — Server Action autorizada para gerar Itinerary Proposal

## Objetivo

Preservar as decisões e invariantes necessárias para expor a geração autoritativa do RB-INC-099 por uma fronteira server-side autenticada e autorizada, sem transferir autorização ou concerns do Next.js para Proposal Management.

## Fronteiras canônicas

- `apps/web/lib/itinerary-proposal-generation.ts` contém o caso de uso testável da fronteira de aplicação.
- `apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts` contém a Server Action do Next.js.
- `resolveTripRouteAccess` permanece responsável pela autenticação e autorização server-side.
- `trip:edit` é reutilizada como permissão canônica para geração de Proposal.
- `createPostgresAuthoritativeItineraryProposalGenerationService` permanece responsável apenas pela composição concreta PostgreSQL + Proposal Management.

## Invariantes

1. `tripId` é validado antes de consultar autorização ou dados.
2. usuário não autenticado não executa geração.
3. acesso negado permanece indistinguível de recurso inexistente.
4. `contextVersion`, `itineraryId` e `itinerary.version` são derivados de dados autoritativos, nunca do cliente.
5. IDs e relógio são criados na fronteira e permanecem injetáveis em testes.
6. a Server Action somente revalida e redireciona após sucesso.
7. falhas recuperáveis retornam códigos estáveis; falhas técnicas desconhecidas são normalizadas para `technical-error`.
8. o algoritmo determinístico e o lifecycle permanecem em Proposal Management.

## Arquivos centrais

- `apps/web/lib/itinerary-proposal-generation.ts`
- `apps/web/lib/itinerary-proposal-generation.test.ts`
- `apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts`
- `apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.test.ts`
- `packages/database/src/authoritative-itinerary-proposal-generation-service.ts`

## Estado de validação

A implementação está em Draft PR #228. Evidências definitivas devem ser registradas somente quando Documentation Validation e Engineering Validation passarem no mesmo HEAD final.

## Próxima lacuna

Após esta fronteira estar integrada, a próxima lacuna deve ser identificada a partir da experiência de revisão/geração existente, sem antecipar UI neste incremento nem criar política paralela de autorização.
