---
id: RB-INC-126
title: Navegação Determinística do Conflito para o Roteiro
description: Elimina o flaky da navegação por âncora validando e carregando explicitamente o destino declarado pelo link.
document_type: implementation-increment
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, quality, playwright, flakiness]
related_documents: [RB-QA-001, RB-CICD-001, RB-ADR-010, RB-INC-122, RB-INC-125]
prerequisites: [RB-INC-125]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-126 — Navegação Determinística do Conflito para o Roteiro

## 1. Objetivo

Eliminar o flaky da navegação do conflito para o dia afetado no Roteiro validando o
`href` acessível e carregando explicitamente seu destino com âncora.

Issue: #291.

Branch: `codex/rb-inc-126-deterministic-conflict-navigation`.

## 2. Evidência

O attempt 1 do Engineering Validation `31532256527` excedeu o timeout aguardando
`waitForURL` depois do click em `Ver dia no Roteiro`. O destino é uma navegação interna
com fragmento e não fornece uma barreira de load determinística em todas as execuções.

## 3. Escopo

- validar o destino declarado no `href` do link;
- carregar explicitamente o destino validado;
- preservar a assertion da URL, do dia afetado e do retorno à revisão.

## 4. Fora de escopo

- domínio, aplicação, banco ou UI;
- timeout, retry, sleep ou quarentena;
- outros cenários.

## 5. Critérios de aceite

- [x] destino do link é validado antes da navegação;
- [x] destino com âncora é carregado explicitamente;
- [x] assertions funcionais posteriores são preservadas;
- [x] validações locais estão verdes;
- [x] duas matrizes completas no mesmo SHA não possuem flaky annotation.

## 6. Testes obrigatórios

- lint, typecheck, build e `pnpm docs:validate`;
- Playwright `--list`;
- Engineering Validation executado duas vezes no mesmo SHA.

## 7. Evidências finais

- PR #292, incorporada à #290;
- Engineering Validation `31534321192`, attempts 1 e 2: 81 aprovados, sem flaky;
- validações consolidada `31535217769` e pós-merge `31535676668`: 81 aprovados.

## 8. Rollback

Reverter somente o spec e a documentação.
