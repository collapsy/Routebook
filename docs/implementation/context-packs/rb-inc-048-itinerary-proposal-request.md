---
id: RB-CTX-048
title: Context Pack do RB-INC-048
description: Fornece o contexto mínimo e os limites operacionais para implementar a solicitação e o ciclo inicial de Itinerary Proposal.
document_type: implementation-context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-07-31"
last_updated: "2026-07-31"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - proposal-management
  - itinerary-proposal
related_documents:
  - RB-INC-048
  - RB-CORE-0004
  - RB-PRD-006
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-DATA-001
prerequisites:
  - RB-INC-047
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-048

## 1. Missão do executor

Implementar um núcleo imutável de Proposal Management para solicitar, iniciar, falhar e cancelar a geração de Itinerary Proposal, preservando as versões base e sem gerar conteúdo nem alterar o Itinerary.

## 2. Incremento

- ID: `RB-INC-048`;
- Issue: `#108`;
- branch: `codex/rb-inc-048-itinerary-proposal-request`;
- base empilhada: `codex/rb-inc-047-deterministic-e2e`;
- arquivo: `docs/implementation/increments/rb-inc-048-itinerary-proposal-request.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/increments/rb-inc-048-itinerary-proposal-request.md`;
5. `docs/product/functional-requirements.md`, RB-FR-087 a RB-FR-096;
6. `docs/domain/domain-model.md`, Parte XII;
7. `docs/domain/ubiquitous-language.md`, Itinerary Proposal, Proposed Activity, Proposal Base Version e estados oficiais;
8. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-002 a RB-BR-PRP-010;
9. `docs/domain/domain-events-and-lifecycles.md`, Parte XVII;
10. `docs/architecture/modules-and-bounded-contexts.md`, Parte XII;
11. `docs/data/logical-data-model.md`, Parte XII;
12. `docs/data/api-guidelines-and-contracts.md`, seção 189, somente para reconhecer a divergência descrita neste pack.

## 4. Contratos canônicos aplicáveis

| Contrato | Aplicação neste incremento |
| --- | --- |
| Itinerary Proposal | agregado distinto do Itinerary e ainda não aplicado |
| ItineraryProposalId | identidade própria obrigatória |
| Proposal Base Version | Itinerary Version usada como base |
| Trip Context Version | versão de contexto usada como base |
| Context Snapshot | referência mínima ao contexto capturado |
| `requested` | geração solicitada |
| `generating` | geração em andamento |
| `failed` | geração falhou sem alterar o Itinerary |
| `cancelled` | processo explicitamente cancelado |

## 5. Transições em escopo

```text
[*] -> requested
requested -> generating
requested -> cancelled
generating -> failed
generating -> cancelled
```

Nenhuma outra transição oficial será implementada neste incremento.

## 6. Divergência conhecida

`RB-DOM-001`, `RB-DOM-002` e `RB-DOM-004` definem `ready` como estado oficial após a geração. O exemplo da seção 189 de `RB-API-001` usa `generated`. O executor deve preservar os estados oficiais no tipo público, mas interromper a implementação antes da conclusão da geração. Não adicionar alias, mapeamento ou escolha silenciosa.

## 7. Caminhos permitidos

```text
modules/proposal-management/**
pnpm-lock.yaml
docs/implementation/increments/rb-inc-048-itinerary-proposal-request.md
docs/implementation/context-packs/rb-inc-048-itinerary-proposal-request.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Caminhos somente leitura

```text
apps/**
modules/decision-intelligence/**
modules/itinerary-planning/**
modules/planning-assurance/**
modules/trip-management/**
packages/**
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/data/**
```

## 9. Saídas esperadas

- workspace `@routebook/proposal-management`;
- contrato público em `src/index.ts`;
- agregado e operações iniciais em `src/itinerary-proposal.ts`;
- erros de validação e transição;
- testes unitários;
- lockfile e rastreabilidade atualizados.

## 10. Restrições

- não criar Provider, adapter, port, prompt ou output schema;
- não gerar Proposed Activity;
- não implementar `ready`, aceite, rejeição, expiração, retry ou supersessão;
- não persistir;
- não alterar Itinerary ou outro agregado;
- não incluir dados pessoais no Context Snapshot;
- não adicionar dependência de runtime;
- não alterar documentos canônicos para encobrir a divergência.

## 11. Testes obrigatórios do módulo

- criação em `requested` e normalização das referências;
- geração de identidade e identidade fornecida;
- rejeição de textos vazios, versões inválidas e data inválida;
- `requested -> generating`;
- `generating -> failed` com código técnico;
- cancelamento a partir de `requested` e `generating`;
- rejeição de transições fora do ciclo em escopo;
- rejeição de instante retroativo;
- preservação dos inputs e do agregado anterior.

## 12. Comandos

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Playwright desktop e mobile permanece como regressão obrigatória no workflow da PR.

## 13. Quando interromper e escalar

- for necessário escolher entre `ready` e `generated`;
- a implementação exigir novo estado ou relação de domínio;
- surgir necessidade de Provider, persistência, aplicação ou escrita em outro bounded context;
- um teste revelar conflito entre documentos canônicos.
