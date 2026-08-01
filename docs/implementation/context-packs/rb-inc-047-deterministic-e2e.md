---
id: RB-CTX-047
title: Context Pack do RB-INC-047
description: Contexto mínimo para estabilizar a execução Playwright no ambiente compartilhado do CI sem reduzir cobertura ou ocultar flakiness.
document_type: implementation-context-pack
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-07-31"
last_updated: "2026-07-31"
authors:
  - RouteBook Team
tags:
  - context-pack
  - quality
  - playwright
  - ci
related_documents:
  - RB-INC-047
  - RB-CORE-0004
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
prerequisites:
  - RB-INC-046
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-047 — Context Pack do RB-INC-047

## 1. Missão

Serializar os E2E no CI porque o job fornece uma única aplicação e um único banco compartilhados, preservando os projetos responsivos e toda a cobertura existente.

## 2. Incremento

- ID: `RB-INC-047`;
- issue: `#106`;
- branch: `codex/rb-inc-047-deterministic-e2e`;
- arquivo: `docs/implementation/increments/rb-inc-047-deterministic-e2e.md`.

## 3. Leitura obrigatória

1. `docs/core/routebook-bible.md`;
2. `docs/quality/quality-and-testing-strategy.md`, especialmente isolamento, E2E e flaky tests;
3. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`, especialmente paralelização e retries;
4. `docs/architecture/adrs/rb-adr-010-automated-testing-strategy-with-vitest-playwright-and-testcontainers.md`;
5. `docs/implementation/increments/rb-inc-047-deterministic-e2e.md`;
6. `AGENTS.md`.

## 4. Regras aplicáveis

- cada teste controla seus próprios dados e efeitos;
- ambiente compartilhado não isolado não deve ser exercitado em paralelo;
- Playwright continua responsável pelas jornadas reais e responsivas;
- retry automático não pode ocultar instabilidade;
- não aumentar timeout, sleep ou retry como correção;
- preservar traces e diagnóstico do CI.

## 5. Caminhos permitidos

```text
apps/web/playwright.config.ts
apps/web/playwright.config.test.ts
docs/implementation/increments/rb-inc-047-deterministic-e2e.md
docs/implementation/context-packs/rb-inc-047-deterministic-e2e.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 6. Caminhos proibidos

```text
apps/web/e2e/**
apps/web/app/**
apps/web/components/**
modules/**
packages/database/**
.github/workflows/**
```

## 7. Saídas esperadas

- configuração CI com um worker;
- comportamento local inalterado;
- teste da configuração;
- duas execuções completas consecutivas sem flaky annotation;
- documentação validada.

## 8. Restrições

- não remover nem relaxar assertions;
- não aumentar retries ou timeouts;
- não criar nova dependência;
- não alterar cobertura desktop/mobile;
- não alterar domínio, produto, banco ou workflow;
- não declarar flakiness resolvida com apenas uma execução.

## 9. Comandos

```bash
pnpm --filter @routebook/web test
pnpm --filter @routebook/web lint
pnpm --filter @routebook/web typecheck
pnpm docs:validate
pnpm --filter @routebook/web build
```

O workflow Engineering Validation executará migrations, a regressão completa e Playwright com PostgreSQL real.

## 10. Escalonamento

Interromper se a serialização exigir remoção de cobertura, mudança do workflow, aumento de retry/timeout ou se as execuções continuarem produzindo flakiness.
