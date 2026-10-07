---
id: RB-INC-216
title: Etapa 8 — replanejamento explícito durante a viagem
description: Expõe REPLAN no Roteiro, torna visível a janela temporal persistida na Proposal e preserva a decisão explícita do viajante.
document_type: implementation-increment
owner: Experience, Proposal Management and Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-10-07"
last_updated: "2026-10-07"
authors: [RouteBook Team]
tags: [implementation, replanning, itinerary-proposal, trip-experience]
related_documents:
  [
    RB-CORE-0004,
    RB-PRD-004,
    RB-PRD-005,
    RB-DOM-001,
    RB-DOM-003,
    RB-DOM-004,
    RB-UX-001,
    RB-UX-002,
    RB-ARC-002,
    RB-ADR-027,
    RB-ADR-028,
    RB-INC-206,
    RB-INC-207,
    RB-INC-215,
    RB-CTX-216,
  ]
prerequisites: [RB-INC-206, RB-INC-215]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-216 — Etapa 8: replanejamento explícito durante a viagem

## Unidade de trabalho

- Issue: [#525](https://github.com/collapsy/Routebook/issues/525).
- Branch: `codex/rb-inc-216-replanning-experience`.
- Base: `main@a09bf9f2b45366f7374b9e82108800c19408e901`.
- Pull Request: a criar.
- Merge: gate humano; não integrar sem autorização explícita para esta PR.

## Base canônica

RB-INC-206 implementou `generationScope = REPLAN`, `ReplanningWindow` e o snapshot temporal persistido no pipeline autoritativo, mas deixou a UI/CTA fora de escopo. Seu próximo passo e a Etapa 8 de RB-INC-207 recomendam expor o replanejamento na jornada do Roteiro.

Na `main` desta etapa, a página e a Server Action Web ainda solicitam geração sem `generationScope`, logo todas as novas propostas seguem `INITIAL`. Também não há apresentação visível de `generationContext.replanningWindow` na revisão da Proposal.

## Resultado esperado

```text
Roteiro planejado/em andamento
→ usuário escolhe “Replanejar dias futuros” explicitamente
→ geração REPLAN usa ReplanningWindow e seleção atuais
→ revisão mostra o snapshot temporal persistido
→ usuário aceita, aceita parcialmente, descarta ou rejeita pela jornada existente
```

## Decisão de disponibilidade deste incremento

- A ação `REPLAN` é oferecida para Trips `planned` ou `in-progress`.
- O modo depende de escolha explícita na interface; não é inferido automaticamente por data, status ou presença de dias elegíveis.
- Trips `draft`, `completed`, `cancelled` e `archived` não podem iniciar REPLAN.
- Esta etapa não cria nem altera transição de lifecycle para `in-progress`.
- A fronteira temporal efetiva é sempre calculada pelo pipeline canônico `ReplanningWindow`, com o timezone da Trip; não é reimplementada na UI.

## Comportamento

- O Roteiro oferece uma ação distinta para solicitar replanejamento, sem substituir a geração `INITIAL` já existente.
- A ação autenticada valida o scope e o status permitido no servidor, e encaminha `REPLAN` ao serviço autoritativo existente.
- `includeMaybe` permanece um opt-in explícito separado.
- A revisão identifica a Proposal como replanejamento e exibe, a partir do snapshot persistido, instante de captura/timezone e os Dias elegíveis. Atividades ou trechos protegidos não são apresentados como alteráveis.
- Proposal sem Dias elegíveis/falha de geração apresenta estado compreensível; não aplica mudanças nem cria estado alternativo.
- Aceite integral/parcial, descarte e rejeição reutilizam as ações existentes. Itinerary só muda após decisão explícita.

## Fora de escopo

- Mudança de conceitos de domínio, estado de Trip ou regras de lifecycle.
- Nova migration/schema ou alteração do snapshot/persistência.
- Novo pipeline, algoritmo, ranking ou geração de deltas `move/update/remove`.
- Aplicação automática, decisão silenciosa ou alteração da política de `MAYBE`.
- Criar/editar atividades como parte da geração REPLAN.
- Ativação de Provider, alteração de Production ou acesso a dados de Production.
- Redesign geral do Roteiro ou do fluxo de aceite/rejeição.

## Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts
apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.test.ts
apps/web/lib/itinerary-proposal-generation.ts
apps/web/lib/itinerary-proposal-generation.test.ts
apps/web/components/itinerary-proposal-generation-control.tsx
apps/web/components/itinerary-proposal-generation-control.test.tsx
apps/web/components/itinerary-proposal-replanning-window.tsx
apps/web/components/itinerary-proposal-replanning-window.test.tsx
apps/web/e2e/itinerary-proposal-generation.spec.ts
docs/implementation/increments/rb-inc-216-replanning-experience.md
docs/implementation/context-packs/rb-inc-216-replanning-experience.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Se outro caminho for indispensável, interrompa antes de alterá-lo e atualize formalmente este incremento e seu Context Pack.

## Critérios de aceite

- [x] Roteiro oferece escolha distinta e explícita entre proposta inicial já existente e REPLAN.
- [x] Somente Trips `planned`/`in-progress` podem solicitar REPLAN, com validação também no servidor.
- [x] Geração `INITIAL` mantém exatamente o comportamento vigente; não há inferência automática de scope.
- [x] Geração REPLAN encaminha `generationScope: REPLAN` ao serviço canônico, respeita autorização e opt-in de MAYBE.
- [x] A revisão identifica REPLAN e mostra `capturedAt`, timezone e os Dias elegíveis lidos do snapshot persistido.
- [x] A UI comunica que passado/trecho transcorrido e Activities protegidas não são replanejados; não contradiz o snapshot.
- [x] Ausência de Dias elegíveis e erros não alteram Itinerary nem bypassam a revisão/decisão.
- [x] Aceite integral/parcial, descarte e rejeição continuam usando as ações existentes e mantêm a semântica explícita.
- [x] Cobertura de componente/lib testa seleção de scope, autorização/status, estado de janela e regressão INITIAL.
- [x] E2E cobre entrada explícita, geração REPLAN, revisão do snapshot e uma decisão explícita; validado nos projetos responsivos da CI.
- [x] Sem mudança de domínio, schema, migration, Provider ou estado de lifecycle.
- [x] `node scripts/validate-docs.mjs`, formatação, lint, typecheck e gates de CI registrados com resultados reais.

## Validação obrigatória

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Engineering Validation, Documentation Validation e Vercel Preview são evidências integradas da PR.

## Gate humano

Após abrir a PR, informar SHA, CI, Preview, testes e riscos. Não fazer merge sem autorização explícita para esta PR.
