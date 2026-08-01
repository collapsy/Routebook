---
id: RB-CTX-066
title: Context Pack do RB-INC-066
description: Fornece o contexto mínimo para finalizar como accepted uma Itinerary Proposal já aplicada integralmente.
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
  - acceptance
related_documents:
  - RB-INC-066
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
  - RB-INC-058
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-066

## 1. Missão

Implementar a finalização pura `ready → accepted` no aggregate somente para registrar o resultado posterior a uma aplicação integral válida, sem aplicar itens ou escrever no Itinerary.

## 2. Incremento

- ID: `RB-INC-066`;
- issue: `#148`;
- branch: `codex/rb-inc-066-finalize-accepted-proposal`;
- arquivo: `docs/implementation/increments/rb-inc-066-itinerary-proposal-accepted-finalization.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-066-itinerary-proposal-accepted-finalization.md`;
6. `docs/implementation/increments/rb-inc-053-itinerary-proposal-ready-domain.md`;
7. `docs/implementation/increments/rb-inc-058-itinerary-proposal-temporal-expiration.md`;
8. `docs/implementation/increments/rb-inc-062-itinerary-proposal-rejection.md`;
9. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-001, RB-BR-PRP-004, RB-BR-PRP-006, RB-BR-PRP-008 e RB-BR-PRP-009;
10. `docs/domain/domain-events-and-lifecycles.md`, ciclo oficial e `ItineraryProposalAccepted`;
11. `docs/domain/domain-model.md`, Itinerary Proposal;
12. `docs/domain/ubiquitous-language.md`, estado `accepted`;
13. `docs/data/logical-data-model.md`, Itinerary Proposal e `acceptedAt`;
14. `docs/architecture/modules-and-bounded-contexts.md`, Proposal Management e aplicação por Itinerary Planning;
15. `modules/proposal-management/src/itinerary-proposal.ts` e testes;
16. `modules/proposal-management/src/index.ts`.

## 4. Contrato

```text
finalizeAppliedItineraryProposalAcceptance(proposal, acceptedAt)
```

Pré-condição externa obrigatória:

```text
ApplyProposalItems concluído validamente pela orquestração
```

Resultado:

```text
status = accepted
acceptedAt = acceptedAt informado
updatedAt = acceptedAt informado
demais propriedades preservadas
```

## 5. Ordem obrigatória

```text
validar status ready
→ validar acceptedAt como instante de transição
→ exigir validUntil canônico
→ exigir acceptedAt anterior a validUntil
→ criar snapshot accepted imutável
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
- não implementar `ApplyProposalItems` ou `AcceptItineraryProposal`;
- não adicionar port, adapter, schema ou migration;
- não validar versão atual, Contexto atual, Restrições, conflitos, autorização ou idempotência neste recorte;
- não registrar Decision, Proposal Application ou evento persistido;
- não aceitar parcialmente, rejeitar, expirar, regenerar ou substituir a Proposal;
- não obter o instante de relógio interno;
- não adicionar dependência.

## 9. Testes obrigatórios

- `ready → accepted` com `acceptedAt` e `updatedAt`;
- sucesso quando o instante é igual a `updatedAt` e anterior a `validUntil`;
- rejeição de instante anterior, inválido, igual ou posterior a `validUntil`;
- rejeição de `validUntil` ausente;
- rejeição de origem diferente de `ready`;
- preservação de conteúdo, referências, versões e proveniência;
- clones independentes para input, `acceptedAt` e `updatedAt`;
- regressão das transições anteriores.

## 10. Comandos

```bash
pnpm exec prettier --check modules/proposal-management/src/index.ts modules/proposal-management/src/itinerary-proposal.ts modules/proposal-management/src/itinerary-proposal.test.ts docs/implementation/increments/rb-inc-066-itinerary-proposal-accepted-finalization.md docs/implementation/context-packs/rb-inc-066-itinerary-proposal-accepted-finalization.md docs/implementation/traceability-matrix.md docs/registry.md
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

- a finalização precisar ocorrer antes ou sem aplicação integral válida;
- surgir necessidade de escrever no Itinerary ou em Decision Intelligence neste incremento;
- for necessário novo estado, relação, evento ou invariante de domínio;
- a transição precisar de persistência ou coordenação transacional neste incremento.
