---
title: Context Pack do RB-INC-099 — Serviço concreto de geração autoritativa de Itinerary Proposal
description: Contexto operacional e evidências canônicas do serviço concreto que compõe geração autoritativa de Itinerary Proposal sobre PostgreSQL.
document_type: implementation-context
owner: Engineering
status: Draft
version: "0.1.0"
created: "2026-08-07"
last_updated: null
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - generation
  - postgres
  - deterministic
related_documents:
  - RB-INC-099
  - RB-INC-094
  - RB-INC-095
  - RB-INC-096
  - RB-INC-097
  - RB-INC-098
prerequisites:
  - RB-INC-098
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-099 — Serviço concreto de geração autoritativa de Itinerary Proposal

## Objetivo

Preservar o contexto necessário para evoluir a geração autoritativa após o RB-INC-099 sem reabrir decisões já consolidadas nos incrementos RB-INC-094 a RB-INC-098.

## Estado canônico esperado

O pacote `@routebook/database` expõe uma fronteira concreta de geração que compõe:

- `DrizzleItineraryProposalRepository` para persistência do lifecycle da Proposal;
- `PostgresAuthoritativeItineraryProposalGenerationContextPort` para leitura consistente do contexto autoritativo;
- `DeterministicItineraryProposalGenerator` para geração reproduzível;
- `generateAuthoritativeItineraryProposal` como orquestrador canônico de domínio/aplicação.

A composição não deve duplicar regras de elegibilidade, lifecycle, validação de output ou classificação de falhas. Valores não determinísticos continuam explícitos no comando: instantes e factory de `ProposedActivityId`.

## Arquivos centrais

- `packages/database/src/authoritative-itinerary-proposal-generation-service.ts`
- `packages/database/src/authoritative-itinerary-proposal-generation-context.ts`
- `packages/database/src/proposal-repository.ts`
- `modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts`
- `modules/proposal-management/src/deterministic-itinerary-proposal-generator.ts`

## Invariantes

1. O contexto usado na geração deve ser carregado de fonte autoritativa PostgreSQL.
2. O lifecycle de `ItineraryProposal` permanece governado por `proposal-management`.
3. A geração determinística não consulta infraestrutura diretamente.
4. `asOf`, `startedAt`, `failedAt`, `generatedAt` e `createProposedActivityId` são fornecidos explicitamente pelo chamador.
5. Erros estáveis dos componentes canônicos não devem ser mascarados pela composição concreta.
6. A persistência da Proposal e de suas Proposed Activities continua centralizada no repository existente.

## Evidências

As evidências finais de CI devem ser registradas no RB-INC-099 somente depois de Engineering Validation e Documentation Validation passarem no mesmo SHA.

## Próxima lacuna canônica

Após a composição concreta, a próxima lacuna deve ser determinada a partir da fronteira autorizada da aplicação: expor a geração para um ator autenticado/autorizado sem acoplar autorização ao domínio de geração e sem introduzir uma segunda política de lifecycle.
