---
id: RB-INC-047
title: Execução E2E Determinística no CI
description: Remove a concorrência entre jornadas Playwright que compartilham uma única aplicação e banco no job de engenharia, sem ocultar flakiness com novos retries ou timeouts.
document_type: implementation-increment
owner: Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-07-31"
last_updated: "2026-07-31"
authors:
  - RouteBook Team
tags:
  - quality
  - playwright
  - e2e
  - ci
  - flakiness
related_documents:
  - RB-CORE-0004
  - RB-QA-001
  - RB-CICD-001
  - RB-ADR-010
  - RB-INC-046
prerequisites:
  - RB-INC-046
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-047 — Execução E2E Determinística no CI

## 1. Objetivo

Executar serialmente as jornadas Playwright no CI enquanto elas compartilharem uma única aplicação Next.js e um único PostgreSQL, eliminando a concorrência conhecida sem reduzir cobertura ou mascarar instabilidade com novos retries, sleeps ou timeouts.

## 2. Problema

Os workflows das PRs #103 e #105 ficaram verdes após retries de jornadas diferentes. Na execução final da PR #105, duas jornadas falharam inicialmente e passaram na repetição. A configuração atual permite concorrência contra ambiente compartilhado, contrariando a regra do `RB-CICD-001` para estado mutável comum e deixando retries ocultarem o sinal descrito no `RB-QA-001`.

## 3. Resultado verificável

- o CI utiliza um único worker Playwright;
- desktop Chromium e Pixel 7 continuam executados;
- execução local não recebe limitação adicional;
- retries existentes não são aumentados;
- nenhuma assertion, jornada ou timeout é removido ou relaxado;
- duas execuções completas consecutivas terminam sem annotation de flaky.

## 4. Escopo

- configuração Playwright;
- teste automatizado da configuração por ambiente;
- documentação e rastreabilidade;
- evidências do workflow Engineering Validation.

## 5. Fora de escopo

- comportamento de produto ou domínio;
- banco, migrations ou dados de produção;
- aumento de timeout, sleep ou retry;
- remoção ou quarentena de testes;
- infraestrutura isolada por worker;
- novos browsers, dependências ou Providers.

## 6. Context Pack

`docs/implementation/context-packs/rb-inc-047-deterministic-e2e.md`

## 7. Caminhos permitidos

```text
apps/web/playwright.config.ts
apps/web/playwright.config.test.ts
docs/implementation/increments/rb-inc-047-deterministic-e2e.md
docs/implementation/context-packs/rb-inc-047-deterministic-e2e.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Critérios de aceite

- [ ] `workers` vale `1` quando `CI` está ativo;
- [ ] execução local mantém o número de workers gerenciado pelo Playwright;
- [ ] os projetos desktop e mobile permanecem registrados;
- [ ] `retries` e timeouts não aumentam;
- [ ] nenhuma jornada ou assertion é removida;
- [ ] teste automatizado protege a diferença CI/local;
- [ ] duas execuções consecutivas do workflow ficam verdes sem flaky annotation;
- [ ] matriz e registro documental permanecem válidos.

## 9. Testes obrigatórios

- teste de configuração com `CI=1`;
- teste de configuração sem `CI`;
- `pnpm format:check` no CI Linux;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test` com PostgreSQL no CI;
- `pnpm build`;
- Playwright desktop e mobile em duas execuções consecutivas.

## 10. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| workflow mais lento | Médio | medir as duas execuções e manter o corte somente no CI |
| flake possuir outra causa | Médio | exigir duas execuções sem retry e preservar traces |
| serialização esconder dependência de ordem | Baixo | cada jornada continua criando seus próprios dados e a ordem não é fixada |

## 11. Rollback

Reverter a configuração e o teste. Não existe migration, escrita de produto ou efeito em produção.

## 12. Evidências de conclusão

O incremento somente será considerado pronto após duas execuções consecutivas do SHA final com Documentation Validation e Engineering Validation verdes e sem annotation de flaky.
