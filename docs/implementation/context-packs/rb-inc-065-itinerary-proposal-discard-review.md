---
id: RB-CTX-065
title: Context Pack do RB-INC-065
description: Fornece o contexto mínimo para descartar uma Itinerary Proposal pronta na revisão sem alterar o Roteiro.
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
  - rejection
related_documents:
  - RB-INC-065
  - RB-CORE-0004
  - RB-PRD-004
  - RB-UX-003
  - RB-UX-004
  - RB-UX-005
  - RB-UX-006
  - RB-INC-057
  - RB-INC-061
  - RB-INC-064
prerequisites:
  - RB-INC-064
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-065

## 1. Missão

Conectar a ação de descarte da revisão web ao comando público de rejeição, mantendo o Roteiro canônico intacto e oferecendo recuperação honesta para concorrência ou input inválido.

## 2. Incremento

- ID: `RB-INC-065`;
- issue: `#146`;
- branch: `codex/rb-inc-065-discard-proposal-review`;
- arquivo: `docs/implementation/increments/rb-inc-065-itinerary-proposal-discard-review.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-065-itinerary-proposal-discard-review.md`;
6. `docs/implementation/increments/rb-inc-057-itinerary-proposal-ready-review.md`;
7. `docs/implementation/increments/rb-inc-061-itinerary-proposal-expired-review.md`;
8. `docs/implementation/increments/rb-inc-064-itinerary-proposal-rejection-command.md`;
9. `docs/product/functional-requirements.md`, RB-FR-095;
10. `docs/product/business-rules.md`, RB-BR-100 e RB-BR-102;
11. `docs/ux/screen-inventory.md`, RB-SCR-009 e RB-MDL-005;
12. `docs/ux/interaction-specifications.md`, RB-INT-065 e RB-INT-068;
13. `docs/ux/content-guidelines.md`, “Descartar proposta”;
14. `docs/ux/user-flows.md`, fluxo de descartar proposta;
15. `docs/ux/wireframes.md`, RB-WF-MOB-025 e RB-WF-DESK-009;
16. página, componente, estilos, testes e E2E atuais da revisão;
17. página do Roteiro e padrões de Server Action existentes.

## 4. Fluxo obrigatório

```text
revisão da Proposal ready
→ usuário aciona “Descartar proposta”
→ Server Action recebe proposalId e usa tripId vinculado pela rota
→ validar identidade
→ rejectAndPersistItineraryProposal(repository, rejectedAt do servidor)
→ revalidar Roteiro e revisão
→ retornar ao Roteiro com feedback de sucesso
```

Falha conhecida retorna ao Roteiro com mensagem segura. Falha desconhecida permanece no error boundary.

## 5. Confirmação

Não criar modal neste recorte. RB-INT-068 solicita confirmação somente quando houver edições não salvas, inexistentes na revisão atual somente leitura. RB-MDL-005 é opcional.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 9 do incremento.

## 7. Caminhos somente leitura

```text
modules/**
packages/**
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/data/**
docs/ux/**
```

## 8. Restrições

- não alterar aggregate, comando, port, adapter, schema ou migration;
- não receber `tripId` pelo formulário;
- não gerar motivo, ator ou comentário;
- não aplicar Proposed Activities nem escrever no Itinerary;
- não oferecer descarte para `expired`;
- não adicionar confirmação sem edições não salvas;
- não capturar falha desconhecida como sucesso ou estado esperado;
- não criar Provider, dependência, evento, job, fila ou retry.

## 9. Testes obrigatórios

- componente oferece ação apenas em `ready`;
- formulário envia a identidade da Proposal exibida;
- Server Action bloqueia identidade ausente ou malformada antes do repositório;
- E2E persiste `rejected`, registra instante e retorna ao Roteiro;
- Roteiro e Activities permanecem idênticos;
- Proposed Activity continua ausente do Itinerary;
- concorrência retorna erro seguro, sem sucesso falso;
- revisão expired e estados existentes permanecem verdes.

## 10. Comandos

```bash
pnpm exec prettier --check apps/web/app/viagens/[tripId]/roteiro/page.tsx apps/web/app/viagens/[tripId]/roteiro/proposta/actions.ts apps/web/app/viagens/[tripId]/roteiro/proposta/actions.test.ts apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx apps/web/components/itinerary-proposal-review.tsx apps/web/components/itinerary-proposal-review.test.tsx apps/web/components/itinerary-proposal-review.module.css apps/web/e2e/itinerary-proposal-review.spec.ts docs/implementation/increments/rb-inc-065-itinerary-proposal-discard-review.md docs/implementation/context-packs/rb-inc-065-itinerary-proposal-discard-review.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/web lint
pnpm --filter @routebook/web typecheck
pnpm --filter @routebook/web test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

PostgreSQL e E2E responsivo devem ser executados no CI quando o ambiente local não possuir banco.

## 11. Quando interromper e escalar

- a ação exigir autorização nova não definida no produto atual;
- surgir necessidade de alterar Itinerary, Activity ou outro bounded context;
- for necessário motivo, ator ou informação não canônica de rejeição;
- o comando público não sustentar carga, transição e persistência seguras.
