---
id: RB-CTX-045
title: Context Pack — Ignorar Risco de Planejamento
description: Contexto operacional para implementar IgnorePlanningRisk com Decision explícita, persistência atômica e histórico preservado.
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
  - idempotency
related_documents:
  - RB-INC-045
  - RB-INC-044
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-ARC-004
  - RB-UX-003
  - RB-UX-005
  - RB-ADR-002
  - RB-ADR-003
  - RB-ADR-005
  - RB-ADR-006
  - RB-ADR-010
  - RB-ADR-011
  - RB-DEL-001
prerequisites:
  - RB-INC-044
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-045 — Ignorar Risco de Planejamento

## 1. Missão

Implementar o RB-INC-045 a partir do HEAD verde `def719a093eee716257fab55945ead323bfae7d4`, preservando os quality gates do RB-INC-044.

## 2. Fonte canônica

- repositório: `collapsy/Routebook`;
- branch: `codex/rb-inc-045-ignore-planning-risk`;
- base: `main`;
- issue: `#102`;
- incremento: `RB-INC-045`.

## 3. Documentos obrigatórios

- `RB-CORE-0004` — Bible;
- `RB-DOM-001` a `RB-DOM-004` — agregado, linguagem, regras e ciclo de vida;
- `RB-ARC-002` — ownership e contratos de Planning Assurance;
- `RB-ARC-004` — transação e idempotência;
- `RB-UX-003` e `RB-UX-005` — Revisão de Conflitos e interação de ignorar;
- `RB-ADR-002`, `RB-ADR-003`, `RB-ADR-005`, `RB-ADR-006`, `RB-ADR-010` e `RB-ADR-011`;
- `RB-DEL-001` — Fase 6 Planning Assurance;
- `RB-INC-044` — experiência de revisão existente.

## 4. Linguagem obrigatória

- `PlanningConflict` e Conflito de Planejamento;
- `IgnorePlanningRisk`;
- `PlanningConflictIgnored`;
- `Decision` e `DecisionRecorded`;
- `open`, `ignored`, `invalidated`, `superseded`;
- `error`, `risk`, `suggestion`;
- `Ignorar risco` na interface.

Não utilizar `Ignorar erro`, não chamar a transição de resolução e não usar Recommendation como sinônimo de Decision.

## 5. Contrato de domínio

```text
IgnorePlanningRisk
  PlanningConflict open + risk
  DecisionId
  ignoredAt
  -> PlanningConflict ignored
```

- `error` e `suggestion` são rejeitados por este comando;
- a `Decision` registra o ator owner já existente na Trip;
- não inferir sessão ou autenticação inexistente;
- não exigir justificativa textual quando a regra atual não a exige;
- preservar contexto, evidência, fingerprint, linhagem e política.

## 6. Contrato transacional

Na mesma transação PostgreSQL:

1. validar Trip e owner;
2. carregar o conflito pela identidade e pela Trip;
3. validar ou recuperar a chave idempotente;
4. criar e inserir a `Decision`;
5. transicionar e atualizar o `PlanningConflict`;
6. retornar o resultado confirmado.

Qualquer falha deverá reverter as duas escritas.

## 7. Reconciliação

- `open` e `ignored` são condições ainda ativas para deduplicação;
- fingerprint ignorado equivalente não produz novo conflito nem volta à lista aberta;
- mesma linhagem com fingerprint novo cria novo conflito aberto e marca o anterior como `superseded`;
- condição ausente marca o anterior como `invalidated`;
- dados de `ignoredAt` e `DecisionId` permanecem em estados terminais para auditoria.

## 8. Interface

- manter a rota `/viagens/[tripId]/roteiro/revisao`;
- ação disponível somente em card `risk` aberto;
- confirmação deverá dizer que a condição continuará no planejamento;
- checkbox ou controle equivalente deve tornar a aprovação explícita;
- botão final usa `Confirmar e ignorar risco`;
- comunicar processamento, sucesso e erro;
- atualizar resumo, filtros e lista após sucesso;
- manter `error` visível e sem ação de ignorar.

## 9. Caminhos permitidos

```text
modules/planning-assurance/**
modules/decision-intelligence/**
packages/database/src/planning-conflict-*
packages/database/src/decision-*
packages/database/src/recommendation-decision-service.ts somente para compatibilidade
packages/database/src/index.ts
packages/database/drizzle/0012_*.sql
packages/database/drizzle/meta/_journal.json
apps/web/app/viagens/[tripId]/roteiro/revisao/**
apps/web/components/planning-conflict-*.tsx
apps/web/components/planning-conflict-*.module.css
apps/web/components/planning-conflict-*.test.tsx
apps/web/lib/planning-conflict-experience*.ts
apps/web/e2e/planning-conflicts.spec.ts
docs/implementation/increments/rb-inc-044-planning-conflicts-experience.md
docs/implementation/context-packs/rb-inc-044-planning-conflicts-experience.md
docs/implementation/increments/rb-inc-045-ignore-planning-risk.md
docs/implementation/context-packs/rb-inc-045-ignore-planning-risk.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Manifests e lockfile só poderão mudar se estritamente necessários. Qualquer outro caminho indispensável deverá ser incorporado aqui com justificativa antes da alteração.

## 10. Testes obrigatórios

- unidade de domínio para transição e invariantes negativas;
- unidade de Decision para opção, snapshot e efeito;
- integração PostgreSQL para transação, idempotência, cross-trip e reconciliação;
- interface para disponibilidade da ação, confirmação, sucesso e erro;
- E2E desktop e mobile;
- regressão de Recommendations e do RB-INC-044.

## 11. Quality gates

- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm db:migrate`;
- `pnpm test`;
- smoke da aplicação;
- `pnpm build`;
- Playwright responsivo.

## 12. Restrições

- não implementar restauração ou resolução;
- não introduzir novo tipo, regra, severidade ou evidência;
- não alterar Itinerary durante a ação;
- não adicionar Provider ou dependência;
- não ocultar Erros;
- não transformar ausência de conflito aberto em garantia;
- não implementar autenticação fictícia.
