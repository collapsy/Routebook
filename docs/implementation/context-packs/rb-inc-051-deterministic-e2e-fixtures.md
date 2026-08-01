---
id: RB-CTX-051
title: Context Pack do RB-INC-051
description: Fornece o contexto mínimo para corrigir flakiness nas jornadas de período livre, Lugar salvo e conflitos com fixtures e navegação observável.
document_type: implementation-context-pack
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - playwright
  - flakiness
related_documents:
  - RB-INC-051
  - RB-CORE-0004
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-047
prerequisites:
  - RB-INC-050
next_documents: []
ai_context:
  priority: high
  index: true
---

# Context Pack — RB-INC-051

## 1. Missão

Focar os E2E de período livre e histórico de conflitos no comportamento observável sob teste, controlando os dados anteriores e sem ocultar flakiness.

## 2. Incremento

- ID: `RB-INC-051`;
- issue: `#114`;
- branch: `codex/rb-inc-051-deterministic-e2e-fixtures`;
- base empilhada: `codex/rb-inc-050-proposal-commands`;
- arquivo: `docs/implementation/increments/rb-inc-051-deterministic-e2e-fixtures.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/quality/quality-and-testing-strategy.md`, determinismo, isolamento e Parte XXV;
5. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`, pipelines determinísticos e flaky tests;
6. `docs/architecture/adrs/rb-adr-010-automated-testing-strategy-with-vitest-playwright-and-testcontainers.md`, fixtures, Playwright e flaky tests;
7. `docs/implementation/increments/rb-inc-047-deterministic-e2e.md`;
8. `docs/implementation/increments/rb-inc-051-deterministic-e2e-fixtures.md`.

## 4. Diagnóstico aplicável

| Spec | Causa observada | Correção permitida |
| --- | --- | --- |
| free-period | setup longo e estado concorrente com nomes prefixados | fixture sintética com domain factory e Drizzle repository |
| free-period | duas criações sequenciais disputam a mesma URL de sucesso | persistir o estado anterior à remoção diretamente |
| planning-conflicts | `waitForURL` aguarda lifecycle de navegação suave | click e assertions da URL/conteúdo finais |
| itinerary | `waitForURL` aguarda `load` após Server Action e link do App Router | click e assertions da URL/conteúdo finais |

## 5. Fronteira da fixture

- estado anterior à ação principal pode ser criado diretamente;
- a ação descrita no título do teste permanece na UI;
- assertions de feedback, conteúdo e persistência após reload permanecem;
- cada projeto usa IDs aleatórios fornecidos pelas factories;
- nenhuma fixture usa dado pessoal real.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 7 do incremento.

## 7. Caminhos proibidos

```text
apps/web/playwright.config.ts
apps/web/app/**
apps/web/components/**
modules/**
packages/**
.github/workflows/**
```

## 8. Restrições

- não remover nem relaxar assertion;
- não aumentar timeout, retry ou workers;
- não adicionar sleep;
- não usar seletor posicional para identificar uma Trip compartilhada;
- não alterar comportamento de produto;
- não declarar correção concluída após uma única execução.

## 9. Comandos

```bash
pnpm --filter @routebook/web test
pnpm --filter @routebook/web lint
pnpm --filter @routebook/web typecheck
pnpm docs:validate
pnpm --filter @routebook/web build
pnpm --filter @routebook/web exec playwright test --list
```

O workflow Engineering Validation deve ser executado duas vezes no mesmo SHA, sem annotation de flaky.

## 10. Quando interromper e escalar

- a correção exigir mudança de produto ou domínio;
- uma assertion de requisito precisar ser removida;
- for necessário aumentar timeout ou retry;
- duas execuções ainda produzirem flakiness pela mesma causa.
