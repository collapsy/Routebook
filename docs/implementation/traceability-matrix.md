---
id: RB-IMP-004
title: Matriz de Rastreabilidade da Implementação
description: Mantém a ligação entre requisitos, decisões, incrementos, issues, código, testes, pull requests e evidências do RouteBook.
document_type: implementation-governance
owner: Delivery
status: Published
version: "1.0.0"
created: "2026-07-28"
last_updated: "2026-07-28"
authors:
  - RouteBook Team
tags:
  - implementation
  - traceability
  - quality
  - governance
related_documents:
  - RB-IMP-001
  - RB-IMP-002
  - RB-IMP-003
  - RB-QA-001
  - RB-GOV-002
prerequisites:
  - RB-IMP-001
next_documents:
  - RB-INC-000
  - RB-INC-001
  - RB-INC-002
ai_context:
  priority: high
  index: true
---

# RB-IMP-004 — Matriz de Rastreabilidade da Implementação

## Regras

- uma linha representa uma entrega ou decisão verificável;
- IDs e links devem apontar para artefatos reais;
- evidência não pode ser preenchida antes da execução;
- itens planejados permanecem explicitamente planejados;
- a matriz é atualizada no mesmo pull request do incremento.

## Matriz

| Incremento | Requisito/decisão | Issue | Branch/PR | Caminhos | Testes/evidências | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| RB-INC-000 | RB-DEL-001, RB-DEV-001, RB-CICD-001 | #2 | `chore/rb-inc-000-readiness`, PR #3 | documentação, templates e validação | 111 documentos registrados, 0 avisos, workflow aprovado | Integrado |
| RB-INC-001 | RB-ADR-002, RB-ADR-003, RB-ADR-004, RB-ADR-010, RB-ADR-011, RB-ADR-019 | #4 | `feature/rb-inc-001-monorepo-bootstrap`, PR #5 | workspace, `apps/web`, configurações compartilhadas e CI | frozen install, format, docs, lint, typecheck, componente, dev smoke, build e E2E responsivo | Integrado |
| RB-INC-002 | RB-DEL-001, RB-UX-001, RB-UX-003, RB-UX-004, RB-UX-005, RB-UX-006, RB-DS-001, RB-DS-002 | #6 | `feature/rb-inc-002-product-shell`, PR #7 | landing, product shell, Minhas Viagens, estados globais e testes | 3 testes de componente, 14 testes E2E, frozen install, format, docs, lint, typecheck, dev smoke e build | Ready for Review |

## Evidências do RB-INC-001

| Evidência | Localização |
| --- | --- |
| definição do incremento | `docs/implementation/increments/rb-inc-001-monorepo-bootstrap.md` |
| registro publicado | `docs/registry.md`, status `Published`, versão `1.0.0` |
| aplicação institucional | `apps/web/app` |
| teste de componente | `apps/web/components/decision-pillars.test.tsx` |
| smoke desktop e móvel | `apps/web/e2e/home.spec.ts` e `apps/web/playwright.config.ts` |
| lockfile reproduzível | `pnpm-lock.yaml` |
| quality gates | `.github/workflows/engineering-validation.yml` |
| instruções de execução | `apps/web/README.md` e `README.md` |

## Evidências do RB-INC-002

| Evidência | Localização/resultado |
| --- | --- |
| definição publicada | `docs/implementation/increments/rb-inc-002-product-shell.md`, versão `1.0.0` |
| entrada pela landing | `apps/web/app/page.tsx` |
| shell global | `apps/web/components/app-shell.tsx` |
| Minhas Viagens e estado vazio | `apps/web/app/viagens/page.tsx` e `apps/web/components/empty-trips-state.tsx` |
| preparação da criação | `apps/web/app/viagens/nova/page.tsx` |
| loading, erro e 404 | `apps/web/app/viagens/loading.tsx`, `apps/web/app/viagens/error.tsx` e `apps/web/app/not-found.tsx` |
| testes de componente | 3 aprovados |
| testes E2E | 14 aprovados em desktop e mobile |
| quality gates | Documentation Validation e Engineering Validation aprovados |
| rastreabilidade | issue #6 e PR #7 |

## Cadeia mínima

```text
Requisito ou decisão
→ Incremento
→ Issue
→ Branch e commits
→ Pull request
→ Testes
→ Evidência
→ Estado final
```

## Manutenção

Ao concluir um incremento:

1. confirme os documentos realmente utilizados;
2. registre issue e PR;
3. indique caminhos efetivamente alterados;
4. registre comandos e resultados reais;
5. atualize o estado;
6. crie novas linhas para pendências que se tornaram incrementos independentes.
