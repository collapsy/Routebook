---
id: RB-CTX-119
title: Context Pack do RB-INC-119 — Navegação Determinística da Landing para Viagens
description: Delimita a correção do flaky de renderização após a navegação da landing.
document_type: implementation-context-pack
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - quality
  - playwright
related_documents:
  - RB-INC-119
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-118
prerequisites:
  - RB-INC-118
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-119 — Navegação Determinística da Landing para Viagens

## Missão

Validar a navegação pelo estado renderizado percebido pelo usuário, sem depender do
intervalo entre a atualização da URL e a conclusão da renderização do App Router.

## Evidência

- issue: #276;
- run: `31514759756`, attempt 2;
- cenário: desktop Chromium, landing para Minhas viagens;
- resultado: 80 passed e 1 flaky aprovado por retry.
- run combinado `31516435515`: a espera direta pelo heading não acompanhou o
  lifecycle da navegação mobile; `waitForURL` deve ser registrado antes do click.

## Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible e `docs/README.md`;
3. RB-QA-001, determinismo, E2E e flaky tests;
4. RB-CICD-001, pipeline determinístico e flaky tests;
5. RB-ADR-010, Playwright, auto-waiting e flaky tests;
6. RB-INC-047 e RB-INC-118.

## Caminhos permitidos

```text
apps/web/e2e/home.spec.ts
docs/implementation/increments/rb-inc-119-deterministic-landing-navigation.md
docs/implementation/context-packs/rb-inc-119-deterministic-landing-navigation.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Restrições

- não alterar aplicação, roteamento ou autenticação;
- não aumentar timeout, retry ou workers;
- não adicionar sleep;
- preservar URL e heading como assertions independentes;
- exigir duas execuções completas sem flaky annotation.

## Validação

Executar os comandos obrigatórios do incremento e duas matrizes completas no mesmo
SHA.
