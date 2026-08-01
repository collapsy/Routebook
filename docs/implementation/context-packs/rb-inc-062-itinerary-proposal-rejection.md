---
id: RB-CTX-062
title: Context Pack do RB-INC-062
description: Fornece o contexto mínimo para implementar a rejeição de Itinerary Proposal pronta no aggregate.
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
  - domain
  - rejection
related_documents:
  - RB-INC-062
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-ARC-002
  - RB-INC-053
  - RB-INC-058
prerequisites:
  - RB-INC-053
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-062

## 1. Missão

Implementar a transição pura `ready → rejected` no aggregate de Itinerary Proposal, registrando o instante canônico e preservando o snapshot sem tocar no Itinerary.

## 2. Incremento

- ID: `RB-INC-062`;
- issue: `#140`;
- branch: `codex/rb-inc-062-reject-proposal`;
- arquivo: `docs/implementation/increments/rb-inc-062-itinerary-proposal-rejection.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-062-itinerary-proposal-rejection.md`;
6. `docs/implementation/increments/rb-inc-053-itinerary-proposal-ready-domain.md`;
7. `docs/implementation/increments/rb-inc-058-itinerary-proposal-temporal-expiration.md`;
8. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-001 e RB-BR-PRP-004;
9. `docs/domain/domain-events-and-lifecycles.md`, Parte XVII e ItineraryProposalRejected;
10. `docs/domain/domain-model.md`, Itinerary Proposal;
11. `docs/domain/ubiquitous-language.md`, estados, comandos e eventos de Proposal;
12. `docs/data/logical-data-model.md`, Itinerary Proposal e `rejectedAt`;
13. `docs/architecture/modules-and-bounded-contexts.md`, Proposal Management;
14. `modules/proposal-management/src/itinerary-proposal.ts` e testes;
15. `modules/proposal-management/src/index.ts`.

## 4. Contrato

```text
rejectItineraryProposal(proposal, rejectedAt)
```

Resultado:

```text
status = rejected
rejectedAt = rejectedAt informado
updatedAt = rejectedAt informado
demais propriedades preservadas
```

## 5. Ordem obrigatória

```text
validar status ready
→ validar rejectedAt como instante de transição
→ criar snapshot rejected imutável
→ preservar conteúdo, versões e proveniência
```

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 8 do incremento.

## 7. Caminhos somente leitura

```text
apps/**
packages/**
modules/proposal-management/src/repository.ts
modules/proposal-management/src/service.ts
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/data/**
docs/ux/**
```

## 8. Restrições

- não alterar estado ou conteúdo do Itinerary;
- não adicionar port, adapter, schema ou migration;
- não criar comando de aplicação, API, Server Action ou UI;
- não criar motivo de rejeição sem contrato canônico;
- não registrar Decision ou evento persistido;
- não aceitar, expirar, regenerar ou substituir a Proposal;
- não obter o instante de relógio interno;
- não adicionar dependência.

## 9. Testes obrigatórios

- `ready → rejected` com `rejectedAt` e `updatedAt`;
- sucesso quando o instante é igual a `updatedAt`;
- rejeição de instante anterior ou inválido;
- rejeição de origem diferente de `ready`;
- preservação de conteúdo, referências, versões e proveniência;
- clones independentes para input, `rejectedAt` e `updatedAt`;
- regressão das transições anteriores.

## 10. Comandos

```bash
pnpm exec prettier --check modules/proposal-management/src/index.ts modules/proposal-management/src/itinerary-proposal.ts modules/proposal-management/src/itinerary-proposal.test.ts docs/implementation/increments/rb-inc-062-itinerary-proposal-rejection.md docs/implementation/context-packs/rb-inc-062-itinerary-proposal-rejection.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/proposal-management lint
pnpm --filter @routebook/proposal-management typecheck
pnpm --filter @routebook/proposal-management test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 11. Quando interromper e escalar

- for necessário definir motivo, ator, autorização ou nova informação de rejeição;
- surgir necessidade de escrever no Itinerary ou em Decision Intelligence;
- for necessário novo estado, relação, evento ou invariante de domínio;
- a transição precisar de persistência ou coordenação transacional neste incremento.
