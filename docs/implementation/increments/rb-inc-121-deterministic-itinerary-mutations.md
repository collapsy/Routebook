---
id: RB-INC-121
title: Mutações do Roteiro E2E Sincronizadas pelo Resultado Renderizado
description: Sincroniza as mutações E2E do roteiro com a resposta da Server Action e a mensagem de sucesso renderizada.
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
  - RB-INC-120
prerequisites:
  - RB-INC-120
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-121 — Mutações do Roteiro E2E Sincronizadas pelo Resultado Renderizado

## 1. Objetivo

Eliminar o flaky das mutações do roteiro aguardando o resultado renderizado da
Server Action antes de validar a URL final.

Issue: #280.

Branch: `codex/rb-inc-121-deterministic-itinerary-mutations`.

Base empilhada: `codex/rb-inc-120-deterministic-proposal-generation`.

PR: pendente.

## 2. Evidência

O Engineering Validation `31517303193` concluiu o POST da movimentação de uma
atividade, mas a assertion de URL ainda observou a query string da criação anterior.
O cenário passou no retry, preservando corretamente a atividade movida.

## 3. Escopo

- registrar o POST da rota atual antes do click;
- aguardar a resposta POST registrada antes do click;
- aguardar a mensagem de sucesso renderizada antes de validar a URL;
- aplicar o mesmo contrato às mutações que compartilham o helper;
- preservar assertions de conteúdo e persistência.

## 4. Fora de escopo

- domínio, aplicação, banco, UI ou Server Action;
- configuração Playwright ou workflow;
- aumento de timeout, retry ou workers;
- sleep, quarentena ou remoção de assertion.

## 5. Critérios de aceite

- [x] POST é registrado antes do click;
- [x] resultado renderizado precede a validação da URL;
- [x] URL, conteúdo e persistência continuam explicitamente validados;
- [ ] documentação, lint, tipagem, testes e build verdes;
- [ ] duas execuções consecutivas sem flaky annotation.

## 6. Testes obrigatórios

- `pnpm --filter @routebook/web test`;
- `pnpm --filter @routebook/web lint`;
- `pnpm --filter @routebook/web typecheck`;
- `pnpm docs:validate`;
- `pnpm --filter @routebook/web build`;
- `pnpm --filter @routebook/web exec playwright test --list`;
- Engineering Validation executado duas vezes no mesmo SHA.

## 7. Rollback

Reverter somente o spec e a documentação. Não existe alteração de produto, banco ou
produção.
