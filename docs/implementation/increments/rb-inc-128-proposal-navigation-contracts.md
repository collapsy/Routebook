---
id: RB-INC-128
title: Contratos Residuais de Navegação na Revisão de Proposal
description: Remove waits frágeis residuais usando redirects declarados nas Server Actions e destinos declarados nos links.
document_type: implementation-increment
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, quality, playwright, flakiness]
related_documents: [RB-QA-001, RB-CICD-001, RB-ADR-010, RB-INC-122, RB-INC-127]
prerequisites: [RB-INC-127]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-128 — Contratos Residuais de Navegação na Revisão de Proposal

## 1. Objetivo

Eliminar os `waitForURL + click` residuais da revisão de Proposal com contratos
determinísticos de Server Action e links acessíveis.

Issue: #295.

Branch: `codex/rb-inc-128-proposal-navigation-contracts`.

## 2. Evidência

- `31532256527`, attempt 2: retorno da revisão passou somente no retry;
- `31532897047`, attempt 2: descarte passou somente no retry;
- ambos aguardavam evento de load após uma navegação cujo destino já era declarativo.

## 3. Escopo

- aceite integral e descarte usam o redirect declarado pela Server Action;
- links de Proposal ready, expired e retorno validam `href` e carregam o destino;
- assertions funcionais e de persistência são preservadas.

## 4. Fora de escopo

- aplicação, domínio, banco ou UI;
- timeout, retry, sleep ou quarentena;
- outros specs.

## 5. Critérios de aceite

- [x] nenhuma ocorrência `waitForURL + click` permanece no spec;
- [x] Server Actions validam seu redirect;
- [x] links validam seu destino acessível;
- [ ] validações locais estão verdes;
- [ ] duas matrizes no mesmo SHA não possuem flaky annotation.

## 6. Testes obrigatórios

- lint, typecheck, build e documentação;
- Playwright `--list`;
- Engineering Validation executado duas vezes no mesmo SHA.

## 7. Rollback

Reverter somente o spec e a documentação.
