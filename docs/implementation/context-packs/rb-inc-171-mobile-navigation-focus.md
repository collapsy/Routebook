---
id: RB-CTX-171
title: Context Pack do RB-INC-171 — Navegação mobile e separação Hoje / Guia por dia
description: Delimita a simplificação de navegação da Viagem ativa e a separação entre experiências imediatas e Guia editorial multi-dia.
document_type: implementation-context-pack
owner: Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-28"
last_updated: "2026-08-28"
authors: [RouteBook Team]
tags: [implementation, context-pack, navigation, mobile, guide, today]
related_documents: [RB-INC-171, RB-CORE-0004, RB-UX-001, RB-UX-005, RB-INC-161, RB-INC-169, RB-INC-170]
prerequisites: [RB-INC-161, RB-INC-169, RB-INC-170]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-171 — Navegação mobile e separação Hoje / Guia por dia

## 1. Missão

Diminuir o custo de orientação durante a viagem real sem esconder funcionalidade e sem introduzir novo estado de negócio.

## 2. Unidade de trabalho

- issue: `#399`;
- branch: `codex/rb-inc-171-mobile-navigation-focus`;
- base: PR #398 / SHA `e37a954a7065eab67828331d9c475fcd5517696d`;
- stack: #387 → #396 → #398 → RB-INC-171;
- aceite: Vercel Preview consolidado;
- merge continua bloqueado pelo gate funcional humano da #387.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/ux/information-architecture.md`;
5. `docs/ux/interaction-specifications.md`;
6. `docs/design-system/ui-patterns.md`;
7. RB-INC-161 / RB-CTX-161;
8. RB-INC-165 / RB-CTX-165;
9. RB-INC-169 / RB-CTX-169;
10. RB-INC-170 / RB-CTX-170;
11. RB-INC-171 e este Context Pack.

## 4. Regras de UX

- tarefas imediatas não devem competir com planejamento multi-dia na mesma página;
- navegação principal mobile fica fixa na parte inferior conforme RB-INT-001;
- máximo de cinco destinos primários;
- `Hoje` é o destino operacional da Viagem suportada;
- `Guia por dia` é secundário e local a `Hoje`;
- `Viagem` permite voltar à visão estrutural sem usar links de retorno;
- estado ativo usa `aria-current`;
- safe area deve ser respeitada;
- conteúdo não pode ficar sob a barra;
- desktop mantém navegação superior;
- query `dia` deve sobreviver à alternância Hoje/Guia por dia.

## 5. Contratos preservados

- navegação não cria mutations;
- Dia atual é derivado em runtime;
- query explícita vence foco automático;
- Guia editorial não é Roteiro;
- Recommendation não é Decision;
- Saved Place não é Activity;
- experiências temporais preservam Provenance;
- nenhum Provider ou schema novo.

## 6. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation e Engineering Validation devem passar no mesmo SHA. Vercel Preview do mesmo SHA deve estar READY.

## 7. Proibições

- não mergear #387/#396/#398/esta PR antes do aceite humano;
- não autoaplicar Guia ou evento ao Roteiro;
- não persistir Dia atual;
- não alterar ranking/#390;
- não introduzir Provider/API key/billing;
- não alterar eventos ou astronomia do RB-INC-169;
- não transformar Guia por dia em destino primário adicional.

## 8. Handoff

Relatar SHA, arquivos, testes reais, estado da pilha, Preview, diferença visual e checklist mobile para novo aceite funcional.
