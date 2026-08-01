---
id: RB-CTX-044
title: Context Pack — Experiência Básica de Revisão de Conflitos
description: Contexto operacional para implementar a revisão contextual dos Planning Conflicts ativos com evidência conhecida e sem ações de estado.
document_type: implementation-context-pack
owner: Planning Assurance
status: Draft
version: "0.1.0"
created: "2026-07-31"
last_updated: "2026-07-31"
authors:
  - RouteBook Team
tags:
  - context-pack
  - planning-assurance
  - planning-conflict
  - itinerary-review
  - accessibility
related_documents:
  - RB-INC-044
  - RB-INC-043
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-UX-001
  - RB-UX-002
  - RB-UX-003
  - RB-UX-004
  - RB-UX-005
  - RB-ADR-003
  - RB-ADR-010
  - RB-ADR-011
prerequisites:
  - RB-INC-043
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-044 — Experiência Básica de Revisão de Conflitos

## 1. Missão

Implementar o RB-INC-044 a partir do HEAD verde `1b45de106579ba1f7290d45d4ba6270e56a54ff9`, preservando o domínio corrigido e todos os quality gates existentes.

## 2. Fonte canônica

- repositório: `collapsy/Routebook`;
- branch: `codex/rb-inc-044-planning-conflicts-experience`;
- base: `main`;
- issue: `#100`;
- incremento: `RB-INC-044`.

## 3. Documentos obrigatórios

- `RB-CORE-0004` — Bible;
- `RB-DOM-001` a `RB-DOM-004` — agregado, linguagem, regras e ciclo de vida;
- `RB-UX-001` a `RB-UX-005` — hierarquia, fluxo, tela, wireframes e interação;
- `RB-ADR-003` — Next.js App Router;
- `RB-ADR-010` — testes automatizados;
- `RB-ADR-011` — base do Design System;
- `RB-DEL-001` — Fase 6 Planning Assurance;
- `RB-INC-043` — núcleo, detecção e persistência.

## 4. Linguagem obrigatória

- `PlanningConflict`;
- `PlanningConflictId` somente em contratos internos;
- Conflito de Planejamento na interface;
- `open`, `invalidated`, `superseded`;
- `error`, `risk`, `suggestion`;
- Evidence, Dia, Activity e Roteiro.

Não utilizar alerta genérico, Warning, Recommendation ou erro técnico como sinônimo de PlanningConflict.

## 5. Rota

```text
/viagens/[tripId]/roteiro/revisao
```

A rota é contextual ao Roteiro. Não adicionar item à navegação principal.

## 6. Composição

Criar um read model de apresentação fora do domínio:

```text
PlanningConflictReview
  total
  countsBySeverity
  items[]

PlanningConflictReviewItem
  id
  severity
  severityLabel
  title
  explanation
  impact
  dayLabel?
  activityTitles[]
  itineraryHref?
```

O read model poderá combinar o `PlanningConflict` com o Itinerary canônico para resolver títulos de Activities. Não copiar regras para a UI e não alterar o agregado.

## 7. Apresentação dos tipos atuais

- `invalid-activity-interval`: intervalo inválido, `error`;
- `activity-outside-trip-period`: Activity fora do Período, `error`;
- `activity-day-mismatch`: Activity associada a Dia incompatível, `risk`;
- `activity-time-overlap`: horários sobrepostos, `risk`;
- `day-overloaded`: Dia potencialmente sobrecarregado, `risk`.

Textos devem derivar somente de Evidence, Context Snapshot e títulos do Itinerary. Valores desconhecidos devem ser omitidos.

## 8. Estados da rota

- `loading.tsx`: análise em andamento com comunicação textual;
- conteúdo: resumo, filtros e lista;
- vazio: nenhum conflito conhecido e limite explícito da análise;
- `error.tsx`: `role="alert"`, nova tentativa e retorno ao Roteiro.

## 9. Interações

- filtros operam localmente sem persistir estado;
- controles possuem estado selecionado acessível;
- `Ver dia` navega para a âncora do Dia no Roteiro;
- voltar à Revisão executa nova avaliação;
- nenhuma ação muda estado de conflito nesta fatia.

## 10. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/roteiro/**
apps/web/components/planning-conflict-*.tsx
apps/web/components/planning-conflict-*.module.css
apps/web/components/planning-conflict-*.test.tsx
apps/web/lib/planning-conflict-experience*.ts
apps/web/lib/planning-conflict-experience*.test.ts
apps/web/e2e/planning-conflicts.spec.ts
apps/web/package.json somente se necessário
docs/implementation/increments/rb-inc-043-planning-conflict-core.md
docs/implementation/context-packs/rb-inc-043-planning-conflict-core.md
docs/implementation/increments/rb-inc-044-planning-conflicts-experience.md
docs/implementation/context-packs/rb-inc-044-planning-conflicts-experience.md
docs/implementation/traceability-matrix.md
docs/registry.md
pnpm-lock.yaml somente se necessário
```

Somente leitura:

```text
modules/planning-assurance/**
modules/trip-management/**
packages/database/src/**
```

## 11. Testes obrigatórios

- composição por tipo e severidade;
- títulos conhecidos de Activities;
- contagens e filtros;
- estado vazio;
- ausência de ações Resolver e Ignorar;
- navegação para o Dia;
- Playwright desktop e mobile;
- regressão dos quality gates existentes.

## 12. Quality gates

- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm db:migrate`;
- `pnpm test`;
- smoke da aplicação;
- `pnpm build`;
- Playwright responsivo.

## 13. Restrições

- não implementar `resolved` ou `ignored`;
- não criar Decision;
- não editar o Roteiro dentro da Revisão;
- não adicionar Provider ou dependência;
- não criar novos tipos, severidades ou evidências;
- não apresentar ausência de conflito como garantia;
- não expor IDs internos quando houver rótulo conhecido.
