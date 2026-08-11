---
id: RB-INC-119
title: Navegação Determinística da Landing para Viagens
description: Sincroniza o E2E da landing pela renderização observável de Minhas viagens sem ampliar timeouts ou retries.
document_type: implementation-increment
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - quality
  - playwright
  - flakiness
related_documents:
  - RB-CORE-0004
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-047
  - RB-INC-118
prerequisites:
  - RB-INC-118
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-119 — Navegação Determinística da Landing para Viagens

## 1. Objetivo

Eliminar o flaky da navegação da landing aguardando a renderização observável do
heading de destino em paralelo com o click.

Issue: #276.

Branch: `codex/rb-inc-119-deterministic-landing-navigation`.

Base empilhada: `codex/rb-inc-118-deterministic-server-action-e2e`.

PR: #277.

## 2. Evidência

O Engineering Validation `31514759756`, attempt 2, alcançou `/viagens`, mas consultou
o heading `Minhas viagens` antes da renderização final. O cenário passou no retry,
resultando em 80 testes diretos e um flaky.

O primeiro run combinado `31516435515` mostrou que aguardar diretamente o heading
não representa o lifecycle da navegação. A correção registra `waitForURL` antes do
click e mantém a assertion do heading depois da conclusão observável da navegação.

## 3. Escopo

- iniciar a espera pela URL de destino antes do click;
- preservar as assertions explícitas de URL e heading;
- executar duas matrizes consecutivas no mesmo SHA.

## 4. Fora de escopo

- comportamento, componentes, roteamento ou autenticação;
- configuração Playwright ou workflow;
- aumento de timeout, retry ou workers;
- sleep, quarentena ou remoção de assertion.

## 5. Critérios de aceite

- [x] o click e a espera pela URL são registrados em conjunto;
- [x] URL `/viagens` e heading `Minhas viagens` continuam validados;
- [x] configuração e tolerâncias permanecem inalteradas;
- [x] documentação, lint, tipagem, testes e build verdes;
- [x] duas execuções consecutivas sem flaky annotation.

## 6. Testes obrigatórios

- `pnpm --filter @routebook/web test`;
- `pnpm --filter @routebook/web lint`;
- `pnpm --filter @routebook/web typecheck`;
- `pnpm docs:validate`;
- `pnpm --filter @routebook/web build`;
- `pnpm --filter @routebook/web exec playwright test --list`;
- Engineering Validation executado duas vezes no mesmo SHA.

Evidência final: run `31520574275`, attempts 1 e 2, com 81 testes aprovados e
nenhuma flaky annotation em cada execução.

## 7. Rollback

Reverter somente o spec e a documentação. Não existe alteração de produto, banco ou
produção.
