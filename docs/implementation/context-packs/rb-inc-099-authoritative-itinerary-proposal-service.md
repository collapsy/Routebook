---
id: RB-CTX-099
title: Context Pack do RB-INC-099 — Serviço concreto de geração autoritativa de Itinerary Proposal
description: Contexto operacional e evidências canônicas do serviço concreto que compõe geração autoritativa de Itinerary Proposal sobre PostgreSQL.
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
  - postgres
  - deterministic
related_documents:
  - RB-INC-099
  - RB-INC-094
  - RB-INC-095
  - RB-INC-096
  - RB-INC-097
  - RB-INC-098
  - RB-INC-100
prerequisites:
  - RB-INC-098
next_documents:
  - RB-INC-100
ai_context:
  priority: high
  index: true
---

# RB-CTX-099 — Serviço concreto de geração autoritativa de Itinerary Proposal

## Objetivo

Preservar o contexto necessário para evoluir a geração autoritativa após o RB-INC-099 sem reabrir decisões já consolidadas nos incrementos RB-INC-094 a RB-INC-098.

## Estado canônico

O pacote `@routebook/database` expõe uma fronteira concreta de geração que compõe:

- `DrizzleItineraryProposalRepository` para persistência do lifecycle da Proposal;
- `PostgresAuthoritativeItineraryProposalGenerationContextPort` para leitura consistente do contexto autoritativo;
- `DeterministicItineraryProposalGenerator` para geração reproduzível;
- `generateAuthoritativeItineraryProposal` como orquestrador canônico de domínio/aplicação.

A composição não duplica regras de elegibilidade, lifecycle, validação de output ou classificação de falhas. Valores não determinísticos continuam explícitos no comando: instantes e factory de `ProposedActivityId`.

## Arquivos centrais

- `packages/database/src/authoritative-itinerary-proposal-generation-service.ts`
- `packages/database/src/authoritative-itinerary-proposal-generation-service-postgres.test.ts`
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
7. Autenticação e autorização pertencem à fronteira da aplicação, não a este serviço.

## Evidências definitivas

HEAD final da PR #224: `dcb2e46d18948d1a49f81c527af219796144b7d4`.

No mesmo HEAD final passaram:

- Documentation Validation #859, run `31200795096`;
- Engineering Validation #1220, run `31200795135`;
- format, docs, lint, typecheck, migrations, suíte de testes, smoke, build e Playwright responsivo.

A PR #224 foi integrada por squash merge. A issue #223 foi fechada e a `main` resultante avançou para `6c13f614c4a649f1c2ae1234bef32af7b83aab9d`.

## Próxima lacuna canônica

A continuidade foi materializada como RB-INC-100, issue #226 e Draft PR #228: expor a geração para um ator autenticado/autorizado na fronteira server-side da aplicação, reutilizando `resolveTripRouteAccess` e a permissão `trip:edit`, sem acoplar autorização ao domínio de geração nem introduzir uma segunda política de lifecycle.
