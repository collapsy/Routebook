---
id: RB-INC-120
title: Geração de Proposal E2E Sincronizada
description: Sincroniza a geração E2E de Itinerary Proposal com os sinais observáveis da Server Action e da navegação.
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
  - RB-INC-118
  - RB-INC-119
prerequisites:
  - RB-INC-119
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-120 — Geração de Proposal E2E Sincronizada

## 1. Objetivo

Eliminar o flaky da geração de Itinerary Proposal registrando a resposta POST e a
URL esperada antes do click.

Issue: #278.

Branch: `codex/rb-inc-120-deterministic-proposal-generation`.

Base empilhada: `codex/rb-inc-119-deterministic-landing-navigation`.

PR: #279.

## 2. Evidência

O Engineering Validation `31516435515` validou a URL antes da conclusão observável
da geração em desktop Chromium. O cenário passou no retry e preservou corretamente
a Proposal e o Itinerary.

O primeiro run da PR, `31517303193`, confirmou que `waitForURL` fica acoplado ao
lifecycle interno da navegação suave. A sequência final aguarda o POST, depois o
heading renderizado e somente então valida a URL e o ID.

## 3. Escopo

- registrar o POST da rota atual antes do click;
- aguardar a resposta POST registrada antes do click;
- aguardar o heading renderizado antes de validar URL e ID;
- preservar assertions de conteúdo, persistência e invariância do Itinerary.

## 4. Fora de escopo

- domínio, geração, banco, UI ou Server Action;
- configuração Playwright ou workflow;
- aumento de timeout, retry ou workers;
- sleep, quarentena ou remoção de assertion.

## 5. Critérios de aceite

- [x] POST é registrado antes do click e conteúdo precede a validação da URL;
- [x] URL e ID gerado continuam explicitamente validados;
- [x] conteúdo, persistência e Itinerary preservado continuam cobertos;
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
