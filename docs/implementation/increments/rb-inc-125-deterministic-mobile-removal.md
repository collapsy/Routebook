---
id: RB-INC-125
title: Remoção Mobile Determinística no E2E
description: Elimina o flaky residual da remoção de atividade sincronizando criação e remoção pelo redirect declarado da Server Action.
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
  - RB-INC-121
  - RB-INC-122
prerequisites:
  - RB-INC-122
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-125 — Remoção Mobile Determinística no E2E

## 1. Objetivo

Eliminar o flaky residual do cenário de remoção de Activity em mobile Chromium,
sincronizando a criação e a remoção pelos redirects declarados pelas Server Actions.

Issue: #289.

Branch: `codex/rb-inc-125-deterministic-mobile-removal`.

## 2. Evidência

O Engineering Validation `31530544328` não encontrou a Activity recém-adicionada
dentro do timeout no projeto mobile Chromium. O cenário passou no retry, enquanto
execuções adjacentes no mesmo código concluíram com 81 testes na primeira tentativa.

A criação no cenário de remoção ainda usava apenas o click seguido da busca do texto,
sem validar o redirect da Server Action nem carregar explicitamente seu destino.

## 3. Escopo

- usar o helper de redirect já consolidado na criação da Activity do cenário;
- usar o mesmo contrato na remoção subsequente;
- preservar as assertions de URL, conteúdo e persistência;
- registrar e validar a correção em duas execuções completas no mesmo SHA.

## 4. Fora de escopo

- domínio, aplicação, banco, UI ou Server Action;
- configuração Playwright ou workflow;
- aumento de timeout, retry ou workers;
- sleep, quarentena ou remoção de assertion;
- refatoração de outros cenários.

## 5. Critérios de aceite

- [x] criação aguarda e valida o redirect declarado;
- [x] remoção aguarda e valida o redirect declarado;
- [x] destino validado é carregado antes da observação da UI;
- [x] assertions de URL, conteúdo e persistência são preservadas;
- [x] validações locais obrigatórias estão verdes;
- [x] duas execuções completas no mesmo SHA terminam sem flaky annotation.

## 6. Testes obrigatórios

- `pnpm --filter @routebook/web test`;
- `pnpm --filter @routebook/web lint`;
- `pnpm --filter @routebook/web typecheck`;
- `pnpm docs:validate`;
- `pnpm --filter @routebook/web build`;
- `pnpm --filter @routebook/web exec playwright test --list`;
- Engineering Validation executado duas vezes no mesmo SHA.

## 7. Evidências finais

- PR principal: #290; merge `d5f9fe32af270590deb4b8fd71da4dab8458648a`;
- SHA final da ponta: `da003f0efe416ede4a2504ee0ce77d88cf0ca486`;
- Engineering Validation `31534321192`, attempts 1 e 2: 81 aprovados, sem flaky;
- validação consolidada `31535217769`: 81 aprovados, sem flaky;
- validação pós-merge `31535676668`: 81 aprovados, sem flaky.

## 8. Rollback

Reverter somente o spec e a documentação. Não existe alteração de produto, banco ou
Production.
