---
id: RB-CTX-053
title: Context Pack do RB-INC-053
description: Fornece o contexto mínimo para concluir Itinerary Proposal em ready no domínio com conteúdo revisável.
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
related_documents:
  - RB-INC-053
  - RB-CORE-0004
  - RB-PRD-006
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-ARC-002
  - RB-INC-050
  - RB-INC-052
prerequisites:
  - RB-INC-052
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-053

## 1. Missão do executor

Adicionar ao aggregate a conclusão `generating → ready` com conteúdo revisável, sem atravessar o limite de persistência ou alterar o Itinerary.

## 2. Incremento

- ID: `RB-INC-053`;
- issue: `#121`;
- decisão humana: `#118`;
- branch: `codex/rb-inc-053-proposal-ready-domain`;
- base empilhada: `codex/rb-inc-052-ready-contract`, PR #120;
- arquivo: `docs/implementation/increments/rb-inc-053-itinerary-proposal-ready-domain.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-053-itinerary-proposal-ready-domain.md`;
6. `docs/implementation/increments/rb-inc-052-itinerary-proposal-ready-contract.md`;
7. `docs/domain/domain-model.md`, Parte XII;
8. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-002 a RB-BR-PRP-010;
9. `docs/domain/domain-events-and-lifecycles.md`, Parte XVII;
10. `docs/domain/ubiquitous-language.md`, Parte XIII;
11. `docs/data/logical-data-model.md`, Parte XII;
12. `docs/data/physical-data-model-and-migrations.md`, Parte XII;
13. `docs/architecture/modules-and-bounded-contexts.md`, Proposal Management;
14. `modules/proposal-management/src/itinerary-proposal.ts` e testes.

## 4. Conceitos relevantes

| Termo oficial | Interpretação obrigatória |
| --- | --- |
| `ready` | Proposal gerada e pronta para revisão, ainda não aceita ou aplicada |
| Itinerary Proposal | agregado contextual separado do Itinerary |
| Proposed Activity | entidade interna da Proposal sem ActivityId canônico |
| Planning Conflict conhecido | referência a conflito identificado, sem transferir ownership |

## 5. Contrato mínimo do conteúdo pronto

```text
proposedActivities
criteria
justifications
limitations
planningConflictIds
validUntil
generatedAt
```

Cada Proposed Activity segue os atributos aplicáveis já publicados no modelo lógico. Campos opcionais permanecem opcionais; o incremento não cria novas regras por tipo de operação.

## 6. Invariantes

- somente `generating` conclui em `ready`;
- Proposed Activity não possui ActivityId canônico;
- critérios e justificativas são explícitos e não vazios;
- Proposal vazia conserva justificativa;
- limitações e conflitos conhecidos são coleções explícitas, mesmo quando vazias;
- conclusão preserva versões e snapshot base;
- nenhuma escrita ocorre em outro aggregate.

## 7. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 8 do incremento.

## 8. Caminhos somente leitura

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
```

## 9. Restrições

- não editar repository, service, adapter, schema ou migration;
- não importar tipo interno de outro bounded context;
- não criar Activity canônica ou alterar Itinerary;
- não escolher Provider ou método de geração;
- não implementar aceite, aplicação ou estados posteriores;
- não criar enum de status de Proposed Activity sem definição canônica;
- não adicionar dependência.

## 10. Cenários obrigatórios

- conclusão válida a partir de `generating`;
- rejeição a partir de qualquer outro estado disponível;
- rejeição de critério, justificativa ou referência obrigatória vazia;
- Proposal sem itens com justificativa;
- Proposed Activity com operação oficial e campos opcionais;
- data inválida ou anterior à última transição;
- cópia defensiva de datas, arrays e objetos.

## 11. Comandos

```bash
pnpm exec prettier --check <arquivos-alterados>
pnpm docs:validate
pnpm --filter @routebook/proposal-management lint
pnpm --filter @routebook/proposal-management typecheck
pnpm --filter @routebook/proposal-management test
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

## 12. Dados e privacidade

Usar apenas identificadores e conteúdo sintéticos nos testes. Não incluir dado pessoal real, secret, prompt ou resposta de Provider.

## 13. Quando interromper e escalar

- o conteúdo exigir novo conceito, estado ou relação de domínio;
- for necessário definir enum canônico ausente;
- a operação precisar persistir ou alterar Itinerary;
- surgir decisão de Provider, concorrência ou processamento assíncrono;
- algum arquivo indispensável estiver fora dos caminhos permitidos.
