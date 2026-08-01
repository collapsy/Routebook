---
id: RB-CTX-047
title: Context Pack do RB-INC-047
description: Contexto mínimo para corrigir contratos Playwright frágeis sem reduzir cobertura ou ocultar flakiness.
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

Substituir duas expectativas acopladas a detalhes internos por validações equivalentes de comportamento observável, sem aumentar timeout/retry ou alterar o produto.

## 2. Incremento

- ID: `RB-INC-047`;
- issue: `#106`;
- branch: `codex/rb-inc-047-deterministic-e2e`;
- PR: `#107`;
- arquivo: `docs/implementation/increments/rb-inc-047-deterministic-e2e.md`.

## 3. Leitura obrigatória

1. `docs/core/routebook-bible.md`;
2. `docs/quality/quality-and-testing-strategy.md`, especialmente isolamento, E2E e flaky tests;
3. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`, especialmente paralelização e retries;
4. `docs/architecture/adrs/rb-adr-010-automated-testing-strategy-with-vitest-playwright-and-testcontainers.md`;
5. `docs/implementation/increments/rb-inc-047-deterministic-e2e.md`;
6. `AGENTS.md`.

## 4. Evidência de causa

- run falho: `30680751411`;
- execução: 44 testes com um worker;
- resultado: 41 passaram, dois flaky e um falhou;
- histórico: locator exigia ordem textual não canônica;
- roteiro: `waitForURL(..., waitUntil: "commit")` expirava em navegação suave.

## 5. Regras aplicáveis

- testar comportamento observável, não detalhe interno;
- usar locators e assertions com auto-waiting;
- retry automático não pode ocultar instabilidade;
- não aumentar timeout, sleep ou retry como correção;
- preservar traces, projetos responsivos e requisitos das jornadas.

## 6. Caminhos permitidos

```text
apps/web/e2e/itinerary.spec.ts
apps/web/e2e/planning-conflicts.spec.ts
docs/implementation/increments/rb-inc-047-deterministic-e2e.md
docs/implementation/context-packs/rb-inc-047-deterministic-e2e.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 7. Caminhos proibidos

```text
apps/web/playwright.config.ts
apps/web/app/**
apps/web/components/**
modules/**
packages/**
.github/workflows/**
```

## 8. Saídas esperadas

- títulos do histórico validados sem ordem implícita;
- URL final validada sem espera por evento de implementação;
- configuração Playwright original;
- duas execuções completas consecutivas sem flaky annotation;
- documentação validada.

## 9. Restrições

- não remover nem relaxar requisito;
- não aumentar retries ou timeouts;
- não criar dependência;
- não alterar cobertura desktop/mobile;
- não alterar domínio, produto, banco ou workflow;
- não declarar flakiness resolvida com apenas uma execução.

## 10. Comandos

```bash
pnpm --filter @routebook/web test
pnpm --filter @routebook/web lint
pnpm --filter @routebook/web typecheck
pnpm docs:validate
pnpm --filter @routebook/web build
```

O workflow Engineering Validation executará migrations, regressão e Playwright com PostgreSQL real.

## 11. Escalonamento

Interromper se a correção exigir mudança de produto, remoção de cobertura, aumento de retry/timeout ou se duas execuções ainda produzirem flakiness.
