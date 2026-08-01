---
id: RB-CTX-049
title: Context Pack do RB-INC-049
description: Fornece o contexto mínimo e os limites para persistir o ciclo inicial de Itinerary Proposal com Drizzle e PostgreSQL.
document_type: implementation-context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - proposal-management
  - persistence
related_documents:
  - RB-INC-049
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-006
  - RB-INC-048
prerequisites:
  - RB-INC-048
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-049

## 1. Missão do executor

Adicionar persistência ao ciclo inicial já aprovado de Itinerary Proposal, mantendo o domínio independente e interrompendo o trabalho antes da conclusão da geração.

## 2. Incremento

- ID: `RB-INC-049`;
- issue: `#110`;
- branch: `codex/rb-inc-049-proposal-persistence`;
- base: `main` após a integração da PR `#109`;
- arquivo: `docs/implementation/increments/rb-inc-049-itinerary-proposal-persistence.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-049-itinerary-proposal-persistence.md`;
6. `docs/implementation/increments/rb-inc-048-itinerary-proposal-request.md`;
7. `docs/domain/domain-model.md`, Parte XII;
8. `docs/domain/ubiquitous-language.md`, Parte XIII e estados oficiais;
9. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-002 a RB-BR-PRP-010;
10. `docs/domain/domain-events-and-lifecycles.md`, Parte XVII;
11. `docs/architecture/modules-and-bounded-contexts.md`, Proposal Management e persistência modular;
12. `docs/data/logical-data-model.md`, Parte XII;
13. `docs/data/physical-data-model-and-migrations.md`, Parte XII;
14. `docs/architecture/adrs/rb-adr-006-drizzle-orm-and-drizzle-kit-for-data-access-and-migrations.md`.

## 4. Contratos aplicáveis

| Contrato | Aplicação |
| --- | --- |
| Itinerary Proposal | agregado distinto e ainda não aplicado |
| Proposal Base Version | inteira positiva e preservada |
| Trip Context Version | inteira positiva e preservada |
| ContextSnapshotId | identificador opaco obrigatório, sem store neste incremento |
| `requested` | único estado aceito em create |
| `generating` | exige generationStartedAt |
| `failed` | exige generationStartedAt, failedAt e failureCode |
| `cancelled` | exige cancelledAt e pode ou não ter iniciado geração |

## 5. Port

```text
create(proposal)
save(proposal)
findById(tripId, itineraryProposalId)
listByTripId(tripId)
```

O port não expõe row, schema, query builder, transaction ou SQL.

## 6. Reidratação

O adapter deve reconstruir o agregado usando, nesta ordem quando aplicável:

```text
requestItineraryProposal
startItineraryProposalGeneration
failItineraryProposalGeneration | cancelItineraryProposalGeneration
```

Valor persistido incoerente produz erro tipado de repository, nunca aggregate parcial.

## 7. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 10 do incremento.

## 8. Caminhos somente leitura

```text
apps/**
modules/decision-intelligence/**
modules/itinerary-planning/**
modules/planning-assurance/**
modules/trip-management/**
packages/database/src/schema.ts
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/data/**
```

## 9. Restrições

- não implementar `ready` ou alias `generated`;
- não criar Proposed Activity;
- não criar Provider, job, fila, API ou UI;
- não alterar Trip ou Itinerary;
- não criar store ou conteúdo de Context Snapshot;
- não importar infraestrutura no módulo de domínio;
- não aceitar status persistido fora do recorte;
- não atualizar documentos canônicos para encobrir divergência.

## 10. Testes obrigatórios do adapter

- round trip de `requested`;
- round trip de `generating`;
- round trip de `failed` com failureCode;
- cancelamento antes e depois do início da geração;
- listagem ordenada e isolada por TripId;
- Trip inexistente;
- Itinerary inexistente;
- Itinerary pertencente a outra Trip;
- create duplicado;
- save de Proposal ausente;
- cascata por Trip ou Itinerary;
- rejeição de row inconsistente pelas constraints.

## 11. Comandos

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm db:migrate
pnpm test
pnpm build
```

Playwright desktop e mobile permanece obrigatório no workflow da PR.

## 12. Quando interromper e escalar

- for necessário escolher entre `ready` e `generated`;
- surgir necessidade de novo estado, relação ou operação de domínio;
- for necessário persistir conteúdo, Proposed Activity ou Context Snapshot;
- o adapter precisar escrever no Itinerary;
- uma migration destrutiva se tornar necessária.
