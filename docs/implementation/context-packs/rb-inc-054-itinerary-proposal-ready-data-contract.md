---
id: RB-CTX-054
title: Context Pack do RB-INC-054
description: Fornece o contexto mínimo para documentar o snapshot híbrido de persistência da Itinerary Proposal ready.
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
  - data-model
related_documents:
  - RB-INC-054
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-006
  - RB-INC-053
prerequisites:
  - RB-INC-053
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-054

## 1. Missão do executor

Alinhar os modelos de dados à Opção A aprovada sem criar migration, Provider, estado ou ownership novo.

## 2. Incremento

- ID: `RB-INC-054`;
- issue: `#124`;
- decisão humana: `#123`;
- branch: `codex/rb-inc-054-ready-data-contract`;
- base empilhada: `codex/rb-inc-053-proposal-ready-domain`, PR #122;
- arquivo: `docs/implementation/increments/rb-inc-054-itinerary-proposal-ready-data-contract.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-054-itinerary-proposal-ready-data-contract.md`;
6. `docs/implementation/increments/rb-inc-053-itinerary-proposal-ready-domain.md`;
7. `docs/domain/domain-model.md`, Parte XII;
8. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-002 a RB-BR-PRP-010;
9. `docs/domain/domain-events-and-lifecycles.md`, Parte XVII;
10. `docs/data/logical-data-model.md`, Parte XII;
11. `docs/data/physical-data-model-and-migrations.md`, Partes XII e XV;
12. `docs/architecture/adrs/rb-adr-006-drizzle-orm-and-drizzle-kit-for-data-access-and-migrations.md`.

## 4. Contrato aprovado

| Conteúdo | Persistência canônica |
| --- | --- |
| Proposed Activities | linhas normalizadas em `proposal_management.proposed_activities` |
| critérios | array JSONB ordenado na Proposal |
| justificativas | array JSONB ordenado na Proposal |
| limitações | array JSONB ordenado na Proposal |
| Planning Conflict IDs conhecidos | array JSONB de referências em snapshot, sem FK cross-context |
| proveniência | `generation_method` e `generation_version` |
| conclusão e validade | `generated_at` e `valid_until` |

## 5. Shape dos snapshots JSONB

```text
criteria: string[]
justifications: string[]
limitations: string[]
planningConflictIds: string[]
```

Os arrays preservam ordem, aceitam lista vazia somente quando o Domínio permitir e devem ser validados em runtime pelo adapter.

## 6. Lifecycle físico

- `requested`, `generating`, `failed` e `cancelled`: campos de conteúdo e proveniência nulos;
- `ready`: conteúdo, proveniência, `generated_at` e `valid_until` obrigatórios;
- `criteria` e `justifications` contêm ao menos um texto;
- `proposed_activities` pode não possuir linhas quando a ausência de alteração estiver justificada;
- limitações e conflitos conhecidos podem ser arrays vazios.

## 7. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 9 do incremento.

## 8. Caminhos somente leitura

```text
apps/**
modules/**
packages/**
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
```

## 9. Restrições

- não criar schema, migration ou adapter;
- não alterar Domínio, API ou UI;
- não criar FK de Proposal para Planning Assurance;
- não armazenar conflito completo em Proposal Management;
- não criar tabela auxiliar para grupos sem identidade publicada;
- não escolher Provider ou enum de método;
- não alterar Proposed Activity para JSONB;
- não incluir prompt, token ou payload bruto.

## 10. Saídas esperadas

- atributos lógicos completos;
- colunas físicas e regras de lifecycle explícitas;
- JSONB com owner, shape e validação definidos;
- incremento, Context Pack, registry e rastreabilidade;
- evidências reais de validação documental.

## 11. Comandos

```bash
pnpm exec prettier --check docs/data/logical-data-model.md docs/data/physical-data-model-and-migrations.md docs/implementation/increments/rb-inc-054-itinerary-proposal-ready-data-contract.md docs/implementation/context-packs/rb-inc-054-itinerary-proposal-ready-data-contract.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
git diff --check
```

## 12. Quando interromper e escalar

- a alteração exigir novo conceito ou invariante de domínio;
- o snapshot exigir dado sensível ou payload bruto;
- for necessária FK cross-context;
- Proposed Activity precisar deixar de ser normalizada;
- surgir necessidade de Provider, código ou migration neste incremento.
