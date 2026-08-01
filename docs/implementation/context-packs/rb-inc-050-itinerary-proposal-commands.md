---
id: RB-CTX-050
title: Context Pack do RB-INC-050
description: Fornece o contexto mínimo para implementar comandos de aplicação do ciclo inicial de Itinerary Proposal.
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
  - application-service
related_documents:
  - RB-INC-050
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-INC-048
  - RB-INC-049
prerequisites:
  - RB-INC-049
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-050

## 1. Missão do executor

Implementar comandos de aplicação finos para o ciclo inicial de Itinerary Proposal, orquestrando aggregate e repository sem adicionar infraestrutura ou geração.

## 2. Incremento

- ID: `RB-INC-050`;
- issue: `#112`;
- branch: `codex/rb-inc-050-proposal-commands`;
- base empilhada: `codex/rb-inc-049-proposal-persistence`;
- arquivo: `docs/implementation/increments/rb-inc-050-itinerary-proposal-commands.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-050-itinerary-proposal-commands.md`;
6. `docs/implementation/increments/rb-inc-048-itinerary-proposal-request.md`;
7. `docs/implementation/increments/rb-inc-049-itinerary-proposal-persistence.md`;
8. `docs/domain/domain-model.md`, Parte XII;
9. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-002 a RB-BR-PRP-010;
10. `docs/domain/domain-events-and-lifecycles.md`, Parte XVII;
11. `docs/architecture/modules-and-bounded-contexts.md`, Proposal Management.

## 4. Comandos em escopo

```text
RequestAndPersistItineraryProposal
StartAndPersistItineraryProposalGeneration
FailAndPersistItineraryProposalGeneration
CancelAndPersistItineraryProposalGeneration
```

Os nomes TypeScript podem seguir a convenção camelCase do repositório.

## 5. Ordem obrigatória

Para transições de Proposal existente:

```text
repository.findById(tripId, itineraryProposalId)
→ verificar existência
→ executar operação pública do aggregate
→ repository.save(updatedProposal)
→ retornar updatedProposal
```

Nenhuma escrita acontece quando a busca ou a transição falha.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 9 do incremento.

## 7. Caminhos somente leitura

```text
apps/**
packages/**
modules/proposal-management/src/itinerary-proposal.ts
modules/proposal-management/src/repository.ts
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/data/**
```

## 8. Restrições

- não criar adapter ou acessar banco;
- não implementar `ready` ou `generated`;
- não criar Proposed Activity, Provider, job, fila ou retry;
- não publicar evento ou outbox;
- não transformar Proposal ausente em nova solicitação;
- não capturar erro de transição como erro técnico genérico;
- não alterar Itinerary ou outro aggregate.

## 9. Testes obrigatórios

- request persiste o resultado normalizado;
- start persiste `generating`;
- fail preserva failureCode e instante;
- cancel a partir de `requested`;
- cancel a partir de `generating`;
- cada comando de transição rejeita Proposal ausente;
- transição inválida propaga erro de domínio e não salva;
- o valor retornado é o valor entregue ao repository.

## 10. Comandos de validação

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## 11. Quando interromper e escalar

- for necessário escolher entre `ready` e `generated`;
- surgir necessidade de concorrência, evento, Provider ou retry;
- o comando precisar escrever no Itinerary;
- for necessário criar novo estado ou relação de domínio.
