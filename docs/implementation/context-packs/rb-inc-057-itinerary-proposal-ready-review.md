---
id: RB-CTX-057
title: Context Pack do RB-INC-057
description: Fornece o contexto mínimo para revisar Itinerary Proposal ready sem modificar o Roteiro canônico.
document_type: implementation-context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - proposal-management
  - web
related_documents:
  - RB-INC-057
  - RB-CORE-0004
  - RB-PRD-004
  - RB-UX-003
  - RB-UX-004
  - RB-UX-005
  - RB-UX-006
  - RB-INC-055
  - RB-INC-056
prerequisites:
  - RB-INC-056
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-057

## 1. Missão do executor

Implementar a revisão web somente leitura da Itinerary Proposal `ready`, deixando inequívoco que o conteúdo é uma sugestão separada e ainda não aplicada ao Itinerary atual.

## 2. Incremento

- ID: `RB-INC-057`;
- issue: `#130`;
- branch: `codex/rb-inc-057-ready-review`;
- base empilhada: `codex/rb-inc-056-ready-command`, PR #129;
- arquivo: `docs/implementation/increments/rb-inc-057-itinerary-proposal-ready-review.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-057-itinerary-proposal-ready-review.md`;
6. `docs/implementation/increments/rb-inc-055-itinerary-proposal-ready-persistence.md`;
7. `docs/implementation/increments/rb-inc-056-itinerary-proposal-ready-command.md`;
8. `docs/product/user-journeys.md`, Jornada 8;
9. `docs/ux/screen-inventory.md`, RB-SCR-009;
10. `docs/ux/interaction-specifications.md`, RB-INT-063 a RB-INT-069;
11. `docs/ux/content-guidelines.md`, Proposta de Roteiro e conteúdo não verificado;
12. `docs/ux/wireframes.md`, RB-WF-MOB-025 e RB-WF-DESK-009;
13. `modules/proposal-management/src/itinerary-proposal.ts`;
14. `packages/database/src/proposal-repository.ts`;
15. `apps/web/app/viagens/[tripId]/roteiro/page.tsx`;
16. padrões existentes de view model, componente, rota e E2E em `apps/web`.

## 4. Fluxo em escopo

```text
Roteiro
→ consultar Proposals da Viagem
→ oferecer “Ver proposta” apenas se houver ready
→ abrir /viagens/[tripId]/roteiro/proposta
→ selecionar a ready mais recente
→ validar o snapshot revisável
→ apresentar critérios, limitações, dias, mudanças e justificativas
→ voltar ao Roteiro sem alterar estado
```

## 5. Ordem de seleção

```text
filtrar status = ready
→ ordenar generatedAt decrescente
→ desempatar id decrescente
→ selecionar o primeiro item
```

Proposals sem conteúdo obrigatório de `ready` devem produzir erro de integridade explícito, nunca uma revisão parcialmente inventada.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 8 do incremento.

## 7. Caminhos somente leitura

```text
modules/**
packages/database/src/**
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/data/**
docs/ux/**
```

## 8. Restrições

- não escrever em Proposal, Itinerary, Activity ou Planning Conflict;
- não criar Server Action nem endpoint mutável;
- não oferecer controles de aceite, edição, descarte, regeneração ou aplicação;
- não selecionar Provider, modelo, prompt, fila ou job;
- não exibir geração técnica como explicação de produto;
- não inferir confirmação de horários, custos ou referências ausentes;
- não criar novo estado ou regra de domínio;
- não alterar schema, migration ou adapter;
- não adicionar dependência externa: apenas a dependência workspace pública de Proposal Management é permitida.

## 9. Regras de apresentação

- usar “Sugestão — ainda não aplicada” como status primário;
- informar que o Roteiro atual permanece preservado;
- apresentar Proposed Activity como “mudança proposta”;
- mapear dia somente quando `targetTripDayId` ou a Activity de origem pertencer ao Itinerary;
- mostrar referência indisponível quando o dia não puder ser resolvido;
- manter critérios, justificativas e limitações como listas semânticas;
- não apresentar botão visualmente desabilitado para capacidade fora de escopo.

## 10. Testes obrigatórios

- seleção e desempate da Proposal `ready` mais recente;
- ausência e integridade inválida;
- grupos ordenados por dia e grupo de referência indisponível;
- rótulos de operação, horário, duração e custo sem falsa precisão;
- conteúdo completo e ausência de ações de decisão no componente;
- estado vazio de Proposed Activities;
- E2E desktop e mobile com persistência real;
- retorno ao Roteiro preservando o estado canônico.

## 11. Comandos

```bash
pnpm exec prettier --check apps/web/package.json apps/web/app/itinerary.css apps/web/app/viagens/[tripId]/roteiro/page.tsx apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx apps/web/app/viagens/[tripId]/roteiro/proposta/loading.tsx apps/web/app/viagens/[tripId]/roteiro/proposta/error.tsx apps/web/app/viagens/[tripId]/roteiro/proposta/error.test.tsx apps/web/app/viagens/[tripId]/roteiro/proposta/proposal-page.module.css apps/web/components/itinerary-proposal-review.tsx apps/web/components/itinerary-proposal-review.test.tsx apps/web/components/itinerary-proposal-review.module.css apps/web/lib/itinerary-proposal-experience.ts apps/web/lib/itinerary-proposal-experience.test.ts apps/web/e2e/itinerary-proposal-review.spec.ts pnpm-lock.yaml docs/implementation/increments/rb-inc-057-itinerary-proposal-ready-review.md docs/implementation/context-packs/rb-inc-057-itinerary-proposal-ready-review.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/web lint
pnpm --filter @routebook/web typecheck
pnpm --filter @routebook/web test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 12. Quando interromper e escalar

- a revisão exigir aplicar ou modificar o Itinerary;
- for necessário decidir semântica de aceite total ou parcial;
- o conteúdo persistido não sustentar uma revisão honesta;
- surgir necessidade de Provider, prompt, modelo, job ou retry;
- for necessário alterar estado, evento, relação ou invariante de domínio.
