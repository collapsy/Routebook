---
id: RB-INC-219
title: Contexto temporal honesto no Guia da viagem
description: Distingue o Dia atual de um Dia em foco quando a data de hoje está fora do Período da Trip.
document_type: implementation-increment
owner: Experience and Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-10-08"
last_updated: "2026-10-08"
authors: [RouteBook Team]
tags: [implementation, trip-guide, date-context, journey-clarity]
related_documents: [RB-CORE-0004, RB-UX-001, RB-INC-217, RB-CTX-217, RB-CTX-219]
prerequisites: [RB-INC-217]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-219 — Contexto temporal honesto no Guia da viagem

## Unidade de trabalho

- Issue: [#532](https://github.com/collapsy/Routebook/issues/532).
- Branch: `codex/issue-532-trip-guide-date-context`.
- Base: branch `codex/issue-531-resume-proposal` (PR #533, dependente da PR #530).
- Pull Request: a criar.
- Merge: gate humano; não integrar sem autorização explícita.

## Problema observado

Quando hoje fica fora do Período da Trip, o Guia usa o primeiro Dia como fallback de foco. A Visão da viagem e o Guia ainda podem chamá-lo de “Hoje”, embora o título mostre outra data. Isso ocorre antes e depois do Período e torna ambíguo se a data exibida é a data atual.

## Resultado esperado

- “Hoje” aparece somente quando a data selecionada corresponde à data atual no fuso do Destino.
- Fora do Período, a interface identifica claramente “Próxima viagem” ou “Viagem encerrada”, mantendo a data real do Dia em foco.
- Dentro do Período, um Dia escolhido que não seja o atual é apresentado como “Dia selecionado”.
- A Visão da viagem apresenta uma ação coerente com o momento: “Ver Hoje”, “Ver primeiro dia” ou “Rever Dia 1”.
- A classificação é uma projeção de apresentação baseada em datas; não cria lifecycle ou status de domínio.

## Fora de escopo

- Alterar persistência, lifecycle ou estados de Trip.
- Mudar datas/fusos, regra de seleção do Dia, conteúdo de recomendações ou planejamento.
- Redesign do Guia ou mudança das experiências astronômicas/editoriais.

## Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/guia/page.tsx
apps/web/app/viagens/[tripId]/guia/dias/page.tsx
apps/web/components/destination-trip-guide.test.tsx
apps/web/components/destination-trip-guide.tsx
apps/web/components/pipa-daily-experiences.tsx
apps/web/components/trip-guide-mode-nav.tsx
apps/web/lib/trip-active-day.ts
apps/web/lib/trip-active-day.test.ts
apps/web/e2e/trip-day-guide.spec.ts
apps/web/e2e/multi-destination-validation.spec.ts
docs/implementation/increments/rb-inc-219-trip-guide-date-context.md
docs/implementation/context-packs/rb-inc-219-trip-guide-date-context.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Se outro caminho for indispensável, interrompa antes de alterá-lo e atualize este incremento e o Context Pack.

## Critérios de aceite

- [ ] Trip futura e encerrada não identificam o Dia fallback como “Hoje” na Visão Geral nem no Guia.
- [ ] Um Dia atual continua identificado como “Hoje”; um Dia não atual escolhido dentro do Período é identificado como selecionado.
- [ ] O Guia mantém a data real e a navegação para o Dia em foco.
- [ ] Testes E2E cobrem Trips futuras e encerradas com datas relativas ao relógio do teste.
- [ ] Testes unitários cobrem classificação antes/durante/depois do Período e respeitam o fuso do Destino.
- [ ] Nenhum estado novo de domínio ou mudança de persistência é introduzido.
- [x] Formatação focada, lint, typecheck, testes unitários focados e validação documental são registrados; E2E/CI ainda pendente.

## Validação obrigatória

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @routebook/web exec playwright test e2e/trip-day-guide.spec.ts e2e/multi-destination-validation.spec.ts --project=desktop-chromium --project=mobile-chromium
pnpm test:e2e
```

## Resultados locais (2026-10-08)

- Prettier focado nos arquivos alterados: passou.
- `pnpm --filter @routebook/web lint`: passou.
- `pnpm --filter @routebook/web typecheck`: passou.
- `pnpm --filter @routebook/web exec vitest run lib/trip-active-day.test.ts components/destination-trip-guide.test.tsx`: 10 testes passaram.
- `node scripts/validate-docs.mjs`: passou, 470/470 documentos registrados; 10 avisos legados de IDs/referências não resolvidos.
- Playwright `--list` para os dois projetos: listou os cenários, mas não executou navegador.
- E2E e build com dados: não executados localmente porque `DATABASE_URL` está ausente; aguardam CI com PostgreSQL.
- `git diff --check`: passou.

## Gate humano

Após abrir a PR, informar SHA, CI, Preview, testes e limitações. Não fazer merge sem autorização humana explícita.
