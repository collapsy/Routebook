---
id: RB-INC-127
title: Retorno Determinístico da Revisão de Proposal
description: Elimina o flaky do retorno ao Roteiro validando e carregando explicitamente o destino declarado pelo link.
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
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-122
  - RB-INC-125
  - RB-INC-126
prerequisites:
  - RB-INC-126
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-127 — Retorno Determinístico da Revisão de Proposal

## 1. Objetivo

Eliminar o flaky do retorno da revisão de Proposal para o Roteiro validando o destino
acessível e carregando-o explicitamente antes das assertions de conteúdo.

Issue: #293.

Branch: `codex/rb-inc-127-deterministic-proposal-return`.

## 2. Evidência

O attempt 2 do Engineering Validation `31532256527` excedeu o timeout aguardando
`waitForURL` após o click em `Voltar para o Roteiro`. O cenário passou no retry.

## 3. Escopo

- validar o `href` do link de retorno;
- carregar explicitamente o destino validado;
- preservar assertions de URL e de não aplicação da Proposal.

## 4. Fora de escopo

- domínio, aplicação, banco ou UI;
- aumento de timeout, retry, sleep ou quarentena;
- outros cenários.

## 5. Critérios de aceite

- [x] destino do link é validado;
- [x] retorno ao Roteiro é carregado explicitamente;
- [x] assertions funcionais são preservadas;
- [ ] validações locais estão verdes;
- [ ] duas matrizes completas no mesmo SHA não possuem flaky annotation.

## 6. Testes obrigatórios

- lint, typecheck, build e `pnpm docs:validate`;
- Playwright `--list`;
- Engineering Validation executado duas vezes no mesmo SHA.

## 7. Rollback

Reverter somente o spec e a documentação.
