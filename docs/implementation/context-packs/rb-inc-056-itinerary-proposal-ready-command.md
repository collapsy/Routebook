---
id: RB-CTX-056
title: Context Pack do RB-INC-056
description: Fornece o contexto mínimo para orquestrar a conclusão e persistência de Itinerary Proposal ready.
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
  - RB-INC-056
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-INC-050
  - RB-INC-053
  - RB-INC-055
prerequisites:
  - RB-INC-055
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-056

## 1. Missão do executor

Implementar um comando de aplicação fino para concluir e persistir Itinerary Proposal `ready`, reutilizando exclusivamente o aggregate e o port públicos.

## 2. Incremento

- ID: `RB-INC-056`;
- issue: `#128`;
- branch: `codex/rb-inc-056-ready-command`;
- base empilhada: `codex/rb-inc-054-ready-data-contract`, PR #125, após PR #127;
- arquivo: `docs/implementation/increments/rb-inc-056-itinerary-proposal-ready-command.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-056-itinerary-proposal-ready-command.md`;
6. `docs/implementation/increments/rb-inc-050-itinerary-proposal-commands.md`;
7. `docs/implementation/increments/rb-inc-053-itinerary-proposal-ready-domain.md`;
8. `docs/implementation/increments/rb-inc-055-itinerary-proposal-ready-persistence.md`;
9. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-002 a RB-BR-PRP-005;
10. `docs/domain/domain-events-and-lifecycles.md`, conclusão da geração na Parte XVII;
11. `modules/proposal-management/src/itinerary-proposal.ts`;
12. `modules/proposal-management/src/repository.ts`;
13. `modules/proposal-management/src/service.ts` e testes.

## 4. Contrato em escopo

```text
CompleteItineraryProposalGenerationCommand
  tripId
  itineraryProposalId
  generationMethod
  generationVersion
  proposedActivities
  criteria
  justifications
  limitations
  planningConflictIds
  validUntil
  generatedAt
```

O comando reutiliza `CompleteItineraryProposalGenerationInput` para o conteúdo e acrescenta somente as identidades necessárias à carga.

## 5. Ordem obrigatória

```text
repository.findById(tripId, itineraryProposalId)
→ verificar existência
→ completeItineraryProposalGeneration(proposal, content)
→ repository.save(readyProposal)
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
- não criar Provider, job, fila, retry ou evento;
- não gerar conteúdo dentro do comando;
- não aceitar, rejeitar ou aplicar Proposal;
- não escrever em Itinerary ou Planning Assurance;
- não capturar erros de domínio como erro técnico genérico;
- não adicionar dependência;
- não alterar schema ou migration.

## 9. Testes obrigatórios

- sucesso carrega `generating`, conclui e salva `ready` uma vez;
- conteúdo e proveniência são normalizados pelo aggregate;
- Proposal ausente retorna `proposal-not-found` sem `save`;
- Proposal em estado incompatível propaga erro de transição sem `save`;
- conteúdo inválido propaga erro de validação sem `save`;
- comandos anteriores permanecem verdes.

## 10. Comandos

```bash
pnpm exec prettier --check modules/proposal-management/src/index.ts modules/proposal-management/src/service.ts modules/proposal-management/src/service.test.ts docs/implementation/increments/rb-inc-056-itinerary-proposal-ready-command.md docs/implementation/context-packs/rb-inc-056-itinerary-proposal-ready-command.md docs/implementation/traceability-matrix.md docs/registry.md
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

- for necessário escolher Provider, modelo, prompt, job ou retry;
- o comando precisar gerar conteúdo em vez de recebê-lo;
- surgir necessidade de escrever no Itinerary ou Planning Assurance;
- for necessário novo estado, relação ou invariante de domínio;
- o port existente não suportar a ordem segura de carga e persistência.
