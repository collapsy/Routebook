---
id: RB-INC-217
title: Etapa 9 — consolidação da jornada, responsividade e E2E
description: Fecha a lacuna de continuidade entre os passos existentes da preparação com um cenário E2E integrado nos projetos desktop e mobile.
document_type: implementation-increment
owner: Experience and Quality
status: Draft
version: "0.1.0"
created: "2026-10-07"
last_updated: "2026-10-07"
authors: [RouteBook Team]
tags: [implementation, journey-consolidation, responsive, e2e, itinerary-proposal]
related_documents:
  [
    RB-CORE-0004,
    RB-PRD-004,
    RB-UX-001,
    RB-UX-002,
    RB-UX-005,
    RB-INC-207,
    RB-CTX-207,
    RB-INC-208,
    RB-INC-209,
    RB-INC-210,
    RB-INC-211,
    RB-INC-212,
    RB-INC-213,
    RB-INC-214,
    RB-INC-215,
    RB-INC-216,
    RB-CTX-217,
  ]
prerequisites: [RB-INC-216]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-217 — Etapa 9: consolidação da jornada, responsividade e E2E

## Unidade de trabalho

- Issue: [#527](https://github.com/collapsy/Routebook/issues/527).
- Branch: `codex/rb-inc-217-integrated-e2e`.
- Base: `main@0de3ac7e8d806bf4d58ae7d1da0b4d596494ca42`.
- Pull Request: implementação E2E [#529](https://github.com/collapsy/Routebook/pull/529); preparação documental em [#528](https://github.com/collapsy/Routebook/pull/528).
- Merge: gate humano; não integrar sem autorização explícita para esta PR.

## Base canônica

RB-INC-207 recomenda como Etapa 9 a consolidação de UX, responsividade e E2E. As etapas RB-INC-209 a RB-INC-216 já implementaram e testaram separadamente seleção, contexto, revisão, Proposal, transição pós-aceite e replanejamento. A configuração Playwright executa os specs autenticados nos projetos `desktop-chromium` e `mobile-chromium`, e já existem testes específicos mobile para Hoje/Roteiro.

A lacuna observada é a continuidade entre esses passos para a mesma Trip: os specs verificam estados e fronteiras em jornadas segmentadas, mas não percorrem a preparação inteira desde uma preferência expressa na UI até o Roteiro aplicado após aceite.

## Resultado esperado

```text
Trip de teste
→ expressar WANT em Lugares
→ completar Contexto
→ revisar Minha seleção
→ gerar e revisar Proposal
→ verificar que o Roteiro continua inalterado
→ aceitar explicitamente
→ confirmar estado planejado e Activity persistidos
```

O cenário deve passar nos projetos desktop e mobile já configurados. A cobertura não substitui os specs isolados nem o E2E REPLAN da Etapa 8.

## Comportamento e limites

- Criar um cenário E2E integrado em uma única Trip usando navegação e ações reais da UI para os passos cobertos.
- Reutilizar fixtures e fronteiras determinísticas existentes; não depender de Places, Providers ou serviços externos.
- Verificar persistência entre telas e após reload nos pontos necessários para provar continuidade.
- Verificar que preferência e Proposal não alteram o Itinerary antes da confirmação explícita.
- Após aceite, verificar resultado planejado persistido sem reaplicar a decisão.
- Validar que as ações primárias necessárias permanecem operáveis nos projetos desktop e mobile existentes.
- Usar a jornada/UX canônica para assertivas; não transformar o incremento em redesign ou auditoria visual subjetiva.
- Se a execução revelar uma divergência de produto que exija mudança fora dos caminhos permitidos, interromper e abrir correção própria ou atualizar formalmente este incremento antes de alterar código.

## Fora de escopo

- Redesign visual geral, mudança de navegação ou alteração de microcopy canônica.
- Mudança de domínio, lifecycle, regra de negócio ou semântica de aceite.
- Mudança de schema, migration, Provider, infraestrutura ou Production.
- Reimplementar specs de seleção, contexto, Proposal, aceite ou REPLAN que já existem.
- Correção oportunista de problemas não necessários para a jornada integrada.

## Caminhos permitidos

```text
apps/web/e2e/journey-consolidation.spec.ts
docs/implementation/increments/rb-inc-217-journey-consolidation.md
docs/implementation/context-packs/rb-inc-217-journey-consolidation.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Se outro caminho for indispensável, interrompa antes de alterá-lo e atualize este incremento e o Context Pack.

## Critérios de aceite

- [x] Um cenário atravessa Lugares → Contexto → Revisão → geração/revisão da Proposal → aceite explícito → Roteiro aplicado na mesma Trip.
- [x] A preferência persiste entre navegação e reload sem criar Activity.
- [x] A Proposal pode ser revisada sem alterar o Itinerary; somente o aceite explícito aplica a mudança.
- [x] Após aceite, Trip planejada e Activity resultante persistem após reload.
- [x] O teste passa em `desktop-chromium` e `mobile-chromium` sem viewport fixo que contorne o projeto correspondente.
- [x] As ações primárias da jornada são localizáveis semanticamente e operáveis por teclado/toque; não há regressão na navegação contextual.
- [x] Specs existentes de REPLAN e dos passos individuais permanecem intactos.
- [x] Sem mudança de comportamento fora da cobertura E2E autorizada.
- [x] `node scripts/validate-docs.mjs`, formatação, lint, typecheck, E2E direcionado e gates de CI são registrados com resultados reais.

## Validação obrigatória

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @routebook/web exec playwright test e2e/journey-consolidation.spec.ts --project=desktop-chromium --project=mobile-chromium
pnpm test:e2e
```

O E2E requer o banco de teste e setup Playwright fornecidos pela CI quando indisponíveis localmente.

## Resultados da PR #529

- CI de documentação: passou.
- CI de engenharia: passou, incluindo formatação, lint, typecheck, build e 173 testes E2E responsivos; os projetos configurados incluem desktop e mobile.
- Preview Vercel: passou.
- Validações locais e limitações: registradas na matriz de rastreabilidade.

## Gate humano

Após abrir a PR, informar SHA, CI, Preview, testes e limitações. Não fazer merge desta PR sem autorização humana explícita.
