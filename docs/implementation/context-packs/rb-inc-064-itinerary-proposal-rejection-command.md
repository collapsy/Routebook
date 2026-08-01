---
id: RB-CTX-064
title: Context Pack do RB-INC-064
description: Fornece o contexto mínimo para orquestrar a rejeição e a persistência de Itinerary Proposal pronta.
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
  - rejection
related_documents:
  - RB-INC-064
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-INC-050
  - RB-INC-060
  - RB-INC-062
  - RB-INC-063
prerequisites:
  - RB-INC-062
  - RB-INC-063
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-064

## 1. Missão

Implementar um comando de aplicação fino para rejeitar explicitamente e persistir Itinerary Proposal `ready`, reutilizando exclusivamente o aggregate e o port públicos.

## 2. Incremento

- ID: `RB-INC-064`;
- issue: `#144`;
- branch: `codex/rb-inc-064-rejection-command`;
- arquivo: `docs/implementation/increments/rb-inc-064-itinerary-proposal-rejection-command.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-064-itinerary-proposal-rejection-command.md`;
6. `docs/implementation/increments/rb-inc-050-itinerary-proposal-commands.md`;
7. `docs/implementation/increments/rb-inc-060-itinerary-proposal-expiration-command.md`;
8. `docs/implementation/increments/rb-inc-062-itinerary-proposal-rejection.md`;
9. `docs/implementation/increments/rb-inc-063-itinerary-proposal-rejected-persistence.md`;
10. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-001 e RB-BR-PRP-004;
11. `docs/domain/domain-events-and-lifecycles.md`, ciclo da Itinerary Proposal;
12. `modules/proposal-management/src/itinerary-proposal.ts`;
13. `modules/proposal-management/src/repository.ts`;
14. `modules/proposal-management/src/service.ts` e testes.

## 4. Contrato

```text
RejectItineraryProposalCommand
  tripId
  itineraryProposalId
  rejectedAt
```

## 5. Ordem obrigatória

```text
repository.findById(tripId, itineraryProposalId)
→ verificar existência
→ rejectItineraryProposal(proposal, rejectedAt)
→ repository.save(rejectedProposal)
→ retornar o resultado do repository
```

Nenhum `save` acontece quando a busca ou a operação de domínio falha.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 8 do incremento.

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

- não alterar aggregate, port ou adapter;
- não criar motivo, ator ou comentário de rejeição;
- não criar relógio, Provider, job, fila, retry ou evento;
- não inferir `rejectedAt` no serviço;
- não aceitar nem aplicar Proposal;
- não escrever em Itinerary ou outro bounded context;
- não capturar erros de domínio ou repository como erro genérico;
- não adicionar dependência, schema ou migration.

## 9. Testes obrigatórios

- sucesso carrega `ready`, rejeita e salva `rejected` uma vez;
- conteúdo e proveniência são preservados pelo aggregate;
- Proposal ausente retorna `proposal-not-found` sem `save`;
- Proposal em estado incompatível propaga erro de transição sem `save`;
- instante retroativo ou inválido propaga erro de validação sem `save`;
- rejeição de `save` é propagada;
- comandos anteriores permanecem verdes.

## 10. Comandos

```bash
pnpm exec prettier --check modules/proposal-management/src/index.ts modules/proposal-management/src/service.ts modules/proposal-management/src/service.test.ts docs/implementation/increments/rb-inc-064-itinerary-proposal-rejection-command.md docs/implementation/context-packs/rb-inc-064-itinerary-proposal-rejection-command.md docs/implementation/traceability-matrix.md docs/registry.md
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

- for necessário motivo, ator, autorização ou nova informação de rejeição;
- surgir necessidade de escrever no Itinerary ou em outro bounded context;
- for necessário novo estado, relação ou invariante de domínio;
- o port existente não suportar a ordem segura de carga e persistência.
