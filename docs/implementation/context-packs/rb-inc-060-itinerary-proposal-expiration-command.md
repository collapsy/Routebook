---
id: RB-CTX-060
title: Context Pack do RB-INC-060
description: Fornece o contexto mínimo para orquestrar a expiração temporal e a persistência de Itinerary Proposal pronta.
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
  - expiration
related_documents:
  - RB-INC-060
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-INC-056
  - RB-INC-058
  - RB-INC-059
prerequisites:
  - RB-INC-058
  - RB-INC-059
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-060

## 1. Missão

Implementar um comando de aplicação fino para expirar temporalmente e persistir Itinerary Proposal `ready`, reutilizando exclusivamente o aggregate e o port públicos.

## 2. Incremento

- ID: `RB-INC-060`;
- issue: `#136`;
- branch: `codex/rb-inc-060-expiration-command`;
- arquivo: `docs/implementation/increments/rb-inc-060-itinerary-proposal-expiration-command.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-060-itinerary-proposal-expiration-command.md`;
6. `docs/implementation/increments/rb-inc-056-itinerary-proposal-ready-command.md`;
7. `docs/implementation/increments/rb-inc-058-itinerary-proposal-temporal-expiration.md`;
8. `docs/implementation/increments/rb-inc-059-itinerary-proposal-expired-persistence.md`;
9. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-004 e RB-BR-PRP-008;
10. `docs/domain/domain-events-and-lifecycles.md`, Parte XVII;
11. `modules/proposal-management/src/itinerary-proposal.ts`;
12. `modules/proposal-management/src/repository.ts`;
13. `modules/proposal-management/src/service.ts` e testes.

## 4. Contrato

```text
ExpireItineraryProposalByTimeCommand
  tripId
  itineraryProposalId
  expiredAt
```

## 5. Ordem obrigatória

```text
repository.findById(tripId, itineraryProposalId)
→ verificar existência
→ expireItineraryProposalByTime(proposal, expiredAt)
→ repository.save(expiredProposal)
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
- não criar relógio, Provider, job, fila, retry ou evento;
- não inferir `expiredAt` no serviço;
- não implementar outra causa de expiração;
- não aceitar, rejeitar ou aplicar Proposal;
- não escrever em Itinerary ou Planning Assurance;
- não capturar erros de domínio ou repository como erro genérico;
- não adicionar dependência, schema ou migration.

## 9. Testes obrigatórios

- sucesso carrega `ready`, expira e salva `expired` uma vez;
- conteúdo e proveniência são preservados pelo aggregate;
- Proposal ausente retorna `proposal-not-found` sem `save`;
- Proposal em estado incompatível propaga erro de transição sem `save`;
- instante antecipado ou inválido propaga erro de validação sem `save`;
- rejeição de `save` é propagada;
- comandos anteriores permanecem verdes.

## 10. Comandos

```bash
pnpm exec prettier --check modules/proposal-management/src/index.ts modules/proposal-management/src/service.ts modules/proposal-management/src/service.test.ts docs/implementation/increments/rb-inc-060-itinerary-proposal-expiration-command.md docs/implementation/context-packs/rb-inc-060-itinerary-proposal-expiration-command.md docs/implementation/traceability-matrix.md docs/registry.md
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

- for necessário escolher relógio, scheduler, Provider, job ou retry;
- surgir necessidade de escrever no Itinerary ou Planning Assurance;
- for necessário novo estado, relação ou invariante de domínio;
- o port existente não suportar a ordem segura de carga e persistência.
