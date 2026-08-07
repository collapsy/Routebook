---
id: RB-CTX-098
title: Context Pack do RB-INC-098
description: Contexto mínimo para manutenção do adapter PostgreSQL do contexto autoritativo de geração de Itinerary Proposal.
document_type: implementation-context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-06"
last_updated: "2026-08-07"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - itinerary-proposal
  - postgresql
  - authoritative-context
related_documents:
  - RB-INC-098
  - RB-INC-096
  - RB-INC-097
  - RB-ARC-003
  - RB-ARC-004
prerequisites:
  - RB-INC-096
  - RB-INC-097
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-098

## Objetivo do incremento

Implementar em `@routebook/database` a porta concreta que entrega ao Proposal Management um snapshot consistente de Itinerary, Recommendations e Places para uma Trip.

## Arquivos owner

- `packages/database/src/authoritative-itinerary-proposal-generation-context.ts`;
- `packages/database/src/authoritative-itinerary-proposal-generation-context-postgres.test.ts`;
- `packages/database/src/index.ts`.

## Contratos principais

- `PostgresAuthoritativeItineraryProposalGenerationContextPort`;
- `createPostgresAuthoritativeItineraryProposalGenerationContextPort`;
- `PostgresAuthoritativeItineraryProposalGenerationContextError`;
- `PostgresAuthoritativeItineraryProposalGenerationContextErrorCode`.

## Regras preservadas

- `tripId` deve ser UUID válido;
- `asOf` deve ser uma data válida, mas a filtragem temporal permanece no assembler;
- a Trip deve existir antes do carregamento do Itinerary;
- deve existir exatamente o Itinerary autoritativo associado à Trip;
- o Itinerary deve possuir ao menos um Dia;
- Dias, Atividades, Recommendations e Places usam ordenação explícita;
- todos os Places referenciados devem existir;
- a leitura ocorre em transaction `repeatable read` e `read only`;
- os registros são mapeados para contratos do Proposal Management sem expor Drizzle.

## Limites arquiteturais

O adapter não pode:

- decidir elegibilidade temporal ou por status;
- gerar ou persistir Itinerary Proposal;
- acessar sessão ou aplicar autorização de usuário;
- importar `apps/web`;
- chamar HTTP, SDK externo ou Provider de IA;
- criar migration sem mudança real de contrato de dados.

## Próxima lacuna provável

Compor o adapter de contexto, o repository PostgreSQL de Itinerary Proposal e o generator determinístico em um serviço concreto pronto para ser chamado por uma fronteira autorizada da aplicação.

## Validação

- issue: #221;
- PR: #222;
- branch: `feature/rb-inc-098-postgres-authoritative-itinerary-proposal-context`;
- Engineering Validation aprovado no SHA `7f249a2e84cd1b0fb1eac1444b812302a5587a13`, run `31124313490`;
- Documentation Validation aprovado no SHA `7f249a2e84cd1b0fb1eac1444b812302a5587a13`, run `31124313476`;
- evidências canônicas atualizadas em 2026-08-07; após esta atualização documental, os gates devem ser revalidados no novo HEAD antes do merge.
