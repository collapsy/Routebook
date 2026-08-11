---
id: RB-INC-122
title: Conclusão do Corpo RSC nas Server Actions E2E
description: Aguarda a conclusão do corpo RSC antes de observar os efeitos das Server Actions nos testes E2E.
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
  - RB-INC-120
  - RB-INC-121
prerequisites:
  - RB-INC-121
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-122 — Conclusão do Corpo RSC nas Server Actions E2E

## 1. Objetivo

Eliminar os flakies residuais aguardando a conclusão do corpo da resposta RSC antes
de observar os efeitos renderizados das Server Actions.

Issue: #282.

Branch: `codex/rb-inc-122-rsc-response-completion`.

Base empilhada: `codex/rb-inc-121-deterministic-itinerary-mutations`.

PR: #283.

## 2. Evidência

O attempt 2 do Engineering Validation `31518438255` recebeu os headers do POST,
mas ainda não observou a criação do período livre em mobile nem a Proposal gerada
em desktop. Ambos os cenários passaram no retry e a execução terminou com 79 testes
aprovados e 2 flaky.

## 3. Escopo

- aguardar `Response.finished()` após o POST registrado;
- cobrir criação e remoção de período livre;
- cobrir geração e revisão de Proposal;
- cobrir as mutações do roteiro que compartilham o helper;
- preservar assertions de URL, conteúdo e persistência.

## 4. Fora de escopo

- domínio, aplicação, banco, UI ou Server Action;
- configuração Playwright ou workflow;
- aumento de timeout, retry ou workers;
- sleep, quarentena ou remoção de assertion.

## 5. Critérios de aceite

- [x] corpo da resposta RSC termina antes da observação da UI;
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

Reverter somente os specs e a documentação. Não existe alteração de produto, banco
ou produção.
