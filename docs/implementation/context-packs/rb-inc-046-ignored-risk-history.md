---
id: RB-CTX-046
title: Context Pack — Histórico de Riscos Ignorados
description: Contexto operacional para compor e apresentar Decisions de Riscos ignorados na Revisão sem mutação canônica.
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
  - decision
  - auditability
related_documents:
  - RB-INC-046
  - RB-INC-045
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-UX-003
  - RB-UX-005
  - RB-ADR-003
  - RB-ADR-010
  - RB-ADR-011
  - RB-DEL-001
prerequisites:
  - RB-INC-045
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-046 — Histórico de Riscos Ignorados

## 1. Missão

Implementar o RB-INC-046 sobre o commit verde `ca26e40b6c97fcd788c039392629449cba628edd` do RB-INC-045.

## 2. Fonte canônica

- repositório: `collapsy/Routebook`;
- branch: `codex/rb-inc-046-ignored-risk-history`;
- base empilhada: `codex/rb-inc-045-ignore-planning-risk`;
- destino da PR acumulada: `main`;
- issue: `#104`;
- incremento: `RB-INC-046`.

## 3. Documentos obrigatórios

- `RB-CORE-0004` — Bible;
- `RB-DOM-001` a `RB-DOM-004` — Planning Conflict, Decision e rastreabilidade;
- `RB-ARC-002` — ownership e contratos públicos;
- `RB-UX-003` e `RB-UX-005` — Revisão e interação;
- `RB-ADR-003`, `RB-ADR-010` e `RB-ADR-011`;
- `RB-DEL-001` — Fase 6;
- `RB-INC-045` — estado e Decision persistidos.

## 4. Read model

```text
PlanningConflictReview
  totalOpen
  countsBySeverity
  openItems[]
  ignoredRisks[]

IgnoredPlanningRiskItem
  id
  title
  explanation
  impact
  dayLabel?
  activityTitles[]
  ignoredAtLabel
  actorLabel?
```

- reutilizar a descrição baseada em evidência do RB-INC-044;
- validar que a Decision seja `ignore-planning-risk`, pertença à mesma Trip e referencie o mesmo conflito;
- resolver ator somente por participante persistido com o mesmo `actorParticipantId`;
- comunicar autoria indisponível quando o participante não puder ser resolvido.

## 5. Estados da tela

- conflitos abertos e histórico;
- somente conflitos abertos;
- somente histórico, com “Nenhum conflito aberto”;
- vazio total, mantendo a ressalva sobre limites da análise;
- erro recuperável de integridade/composição.

## 6. Caminhos permitidos

```text
packages/database/src/planning-conflict-*
packages/database/src/decision-* somente leitura/compatibilidade
apps/web/app/viagens/[tripId]/roteiro/revisao/**
apps/web/components/planning-conflict-*.tsx
apps/web/components/planning-conflict-*.module.css
apps/web/components/planning-conflict-*.test.tsx
apps/web/lib/planning-conflict-experience*.ts
apps/web/e2e/planning-conflicts.spec.ts
docs/implementation/increments/rb-inc-045-ignore-planning-risk.md
docs/implementation/context-packs/rb-inc-045-ignore-planning-risk.md
docs/implementation/increments/rb-inc-046-ignored-risk-history.md
docs/implementation/context-packs/rb-inc-046-ignored-risk-history.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Nenhuma migration ou dependência nova é permitida.

## 7. Testes obrigatórios

- composição e integridade do read model;
- ator conhecido e indisponível;
- contagens e filtros abertos;
- estados combinado, somente histórico e vazio;
- ausência de ações canônicas;
- Playwright desktop e mobile;
- regressão completa.

## 8. Quality gates

- `pnpm format:check` no CI Linux;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm db:migrate` sem migration nova;
- `pnpm test`;
- smoke;
- `pnpm build`;
- Playwright responsivo.

## 9. Restrições

- não alterar domínio ou persistência;
- não restaurar, resolver, invalidar ou superseder;
- não incluir estados terminais no histórico desta fatia;
- não expor IDs internos como autoria;
- não inferir dados desconhecidos;
- não adicionar Provider, IA ou dependência.
