---
id: RB-INC-218
title: Retomada da Proposal pendente na preparação
description: Mantém continuidade quando uma pessoa retorna a uma Trip draft que já possui uma Proposal válida aguardando decisão.
document_type: implementation-increment
owner: Experience and Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-10-08"
last_updated: "2026-10-08"
authors: [RouteBook Team]
tags: [implementation, journey-resumption, itinerary-proposal, preparation]
related_documents: [RB-CORE-0004, RB-INC-217, RB-CTX-217, RB-CTX-218]
prerequisites: [RB-INC-217]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-218 — Retomada da Proposal pendente na preparação

## Unidade de trabalho

- Issue: [#531](https://github.com/collapsy/Routebook/issues/531).
- Branch: `codex/issue-531-resume-proposal`.
- Base: PR #530, branch `codex/fix-preparation-without-itinerary`.
- Pull Request: a criar.
- Merge: gate humano; não integrar sem autorização explícita.

## Problema observado

Uma Trip `draft` pode ter uma Proposal `ready` e válida aguardando decisão. Ao voltar à visão da Trip ou abrir novamente as etapas de Revisão/Proposta, a UI continua oferecendo “Preparar viagem” ou “Gerar proposta”, sem destacar a Proposal existente. “Ver proposta” só fica evidente depois de entrar no Roteiro. A pessoa pode perder a continuidade e iniciar outra geração sem perceber que já há uma decisão pendente.

## Resultado esperado

```text
Trip draft + Proposal ready não expirada
→ visão da Trip / preparação reconhece a decisão pendente
→ pessoa retoma a Proposal existente
→ revisão e decisão continuam explícitas
```

## Regras e limites

- A fonte da pendência é a Proposal persistida, em estado `ready` e dentro da validade existente; não criar estado paralelo.
- A visão da Trip e a preparação oferecem um caminho primário e inequívoco para revisar a Proposal existente.
- Abrir a etapa de geração enquanto há Proposal válida deve levar à revisão existente, sem criar uma nova Proposal.
- Retomar ou exibir a Proposal não aplica alterações ao Itinerary; só o aceite explícito existente pode fazê-lo.
- Dados canônicos atuais de seleção e contexto continuam editáveis; nenhuma mudança de preferência é inferida ou aplicada.
- Proposal expirada não é tratada como pendente válida; o fluxo existente de expiração e nova geração permanece disponível.
- Não alterar domínio, lifecycle, autorização, schema, migration, ranking, Providers ou Production.

## Fora de escopo

- Aceite ou rejeição automática, substituição silenciosa ou descarte automático da Proposal.
- Alterar regras de expiração, validade, geração ou aplicação da Proposal.
- Redesign da área da Trip ou reorganização geral da navegação.
- Alterações em `Hoje`/Guia fora do estado de retomada da Proposal.

## Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/preparacao/revisao/page.tsx
apps/web/app/viagens/[tripId]/preparacao/proposta/page.tsx
apps/web/e2e/journey-consolidation.spec.ts
docs/implementation/increments/rb-inc-218-resume-pending-proposal.md
docs/implementation/context-packs/rb-inc-218-resume-pending-proposal.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Se outro caminho for indispensável, interrompa antes de alterá-lo e atualize este incremento e o Context Pack.

## Critérios de aceite

- [ ] A visão de uma Trip `draft` com Proposal `ready` válida oferece um CTA claro para retomar a Proposal.
- [ ] A Revisão da preparação identifica a Proposal pendente e permite abri-la sem perder a navegação para editar seleção/contexto.
- [ ] Abrir a etapa de geração com Proposal válida leva à revisão existente e não cria outra Proposal.
- [ ] Após retomar, a mesma Proposal permanece `ready`, aguardando decisão, e o Itinerary permanece inalterado.
- [ ] Trip sem Proposal válida mantém o fluxo de geração atual; Proposal expirada segue o caminho existente de expiração/nova geração.
- [ ] A jornada de saída e retomada passa em `desktop-chromium` e `mobile-chromium`.
- [ ] Nenhuma Proposta é aceita ou aplicada sem ação explícita da pessoa.
- [x] `node scripts/validate-docs.mjs`, formatação, lint e typecheck são registrados com resultados reais; CI permanece pendente.

## Validação obrigatória

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @routebook/web exec playwright test e2e/journey-consolidation.spec.ts --project=desktop-chromium --project=mobile-chromium
pnpm test:e2e
```

O E2E requer PostgreSQL e setup Playwright fornecidos pela CI quando indisponíveis localmente.

## Resultados locais (2026-10-08)

- `node scripts/validate-docs.mjs`: passou, 468/468 documentos registrados; 10 avisos preexistentes (IDs/referências legadas não resolvidas).
- Prettier focado nos arquivos alterados: passou.
- `pnpm --filter @routebook/web lint`: passou.
- `pnpm --filter @routebook/web typecheck`: passou.
- `git diff --check`: passou.
- `pnpm --filter @routebook/web test`, usando Node 24.19.0: 502 testes passaram; 5 suites falharam na inicialização porque `DATABASE_URL` não está configurada. A primeira tentativa com Node 18.17.0 nem iniciou Vitest/Rolldown, que requer `node:util.styleText`.
- E2E desktop/mobile e CI: não executados ainda; dependem do PostgreSQL/setup Playwright da CI.

## Gate humano

Após abrir a PR, informar SHA, CI, Preview, testes e limitações. Não fazer merge sem autorização humana explícita.
