---
id: RB-CTX-122
title: Context Pack do RB-INC-122 — Conclusão do Corpo RSC nas Server Actions E2E
description: Delimita a sincronização dos testes com a conclusão do corpo RSC.
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
  - RB-INC-122
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-121
prerequisites:
  - RB-INC-121
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-122 — Conclusão do Corpo RSC nas Server Actions E2E

## Missão

Aguardar a resposta RSC completa antes de observar o resultado renderizado, sem
alterar comportamento do produto ou tolerâncias do Playwright.

## Evidência

- issue: #282;
- run: `31518438255`, attempt 2;
- cenários: criação de período livre mobile e Proposal sem Recommendation desktop;
- resultado: headers do POST recebidos, corpo ainda em trânsito e aprovação no retry.

## Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible e `docs/README.md`;
3. RB-QA-001, determinismo, E2E e flaky tests;
4. RB-CICD-001, pipeline determinístico e flaky tests;
5. RB-ADR-010, Playwright, auto-waiting e flaky tests;
6. RB-INC-118, RB-INC-120 e RB-INC-121.

## Caminhos permitidos

```text
apps/web/e2e/free-period.spec.ts
apps/web/e2e/itinerary-proposal-generation.spec.ts
apps/web/e2e/itinerary-proposal-review.spec.ts
apps/web/e2e/itinerary.spec.ts
docs/implementation/increments/rb-inc-122-rsc-response-completion.md
docs/implementation/context-packs/rb-inc-122-rsc-response-completion.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Restrições

- não alterar domínio, aplicação, UI, banco ou Server Action;
- não aumentar timeout, retry ou workers;
- não adicionar sleep;
- preservar as assertions posteriores;
- exigir duas execuções completas sem flaky annotation.

## Validação

Executar os comandos obrigatórios e duas matrizes completas no mesmo SHA.
