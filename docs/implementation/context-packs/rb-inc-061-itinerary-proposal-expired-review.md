---
id: RB-CTX-061
title: Context Pack do RB-INC-061
description: Fornece o contexto mínimo para revisar uma Itinerary Proposal expirada como histórico não aplicável.
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
  - frontend
  - accessibility
  - expiration
related_documents:
  - RB-INC-061
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-UX-001
  - RB-UX-002
  - RB-UX-003
  - RB-UX-004
  - RB-INC-057
  - RB-INC-058
  - RB-INC-059
  - RB-INC-060
prerequisites:
  - RB-INC-057
  - RB-INC-059
next_documents: []
ai_context:
  priority: critical
  index: true
---

# Context Pack — RB-INC-061

## 1. Missão

Estender a revisão somente leitura para Proposal `expired`, preservando a prioridade da Proposal `ready` e comunicando o estado histórico sem oferecer aplicação.

## 2. Incremento

- ID: `RB-INC-061`;
- issue: `#138`;
- branch: `codex/rb-inc-061-expired-review`;
- arquivo: `docs/implementation/increments/rb-inc-061-itinerary-proposal-expired-review.md`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/README.md`;
5. `docs/implementation/increments/rb-inc-061-itinerary-proposal-expired-review.md`;
6. `docs/implementation/increments/rb-inc-057-itinerary-proposal-ready-review.md`;
7. `docs/implementation/increments/rb-inc-058-itinerary-proposal-temporal-expiration.md`;
8. `docs/implementation/increments/rb-inc-059-itinerary-proposal-expired-persistence.md`;
9. `docs/implementation/increments/rb-inc-060-itinerary-proposal-expiration-command.md`;
10. `docs/product/user-journeys.md`, Jornada 8;
11. `docs/ux/screen-inventory.md`, RB-SCR-009;
12. `docs/ux/interaction-specifications.md`, RB-INT-063 a RB-INT-069;
13. `docs/ux/content-guidelines.md`, Proposta de Roteiro;
14. `docs/ux/wireframes.md`, RB-WF-MOB-025 e RB-WF-DESK-009;
15. `docs/domain/business-rules-and-invariants.md`, RB-BR-PRP-004 e RB-BR-PRP-008;
16. `docs/domain/domain-events-and-lifecycles.md`, Parte XVII;
17. `docs/domain/domain-model.md`, Itinerary Proposal;
18. `docs/domain/ubiquitous-language.md`, estados de Itinerary Proposal;
19. `docs/architecture/modules-and-bounded-contexts.md`, Proposal Management;
20. arquivos da experiência de revisão listados nos caminhos permitidos.

## 4. Regra de seleção

```text
se existir Proposal ready válida
→ selecionar a ready mais recente
senão, se existir Proposal expired válida
→ selecionar a expired com expiredAt mais recente
senão
→ estado vazio recuperável
```

Empates usam a identidade da Proposal como desempate estável.

## 5. Contrato de apresentação

- `ready`: manter “Sugestão — ainda não aplicada” e a revisão atual;
- `expired`: informar “Proposta expirada — somente referência”;
- mostrar geração e validade em ambos os estados;
- mostrar o instante de expiração apenas no estado `expired`;
- preservar critérios, justificativas, limitações, mudanças e proveniência;
- não renderizar controles de aceitar, aplicar, descartar ou gerar novamente.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados na seção 8 do incremento.

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

- não disparar ou persistir expiração durante a leitura;
- não introduzir scheduler, job, fila, relógio ou Provider;
- não alterar estado, relação, evento ou invariante de domínio;
- não aplicar conteúdo ao Itinerary;
- não inventar conteúdo ausente em snapshot incompleto;
- não deixar histórico expirado esconder uma Proposal `ready`;
- não adicionar dependência, schema, migration ou adapter;
- não ampliar a revisão para outros estados terminais.

## 9. Testes obrigatórios

- seleção de `ready` sobre `expired`;
- ordenação estável de `expired` por `expiredAt`;
- integridade de ambos os snapshots;
- formatação de `expiredAt` no fuso do Roteiro;
- conteúdo histórico explícito e acessível;
- ausência de controles de decisão;
- fluxo E2E `ready`, `expired` e vazio;
- regressão integral do workspace.

## 10. Comandos

```bash
pnpm exec prettier --check apps/web/app/viagens/[tripId]/roteiro/page.tsx apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx apps/web/components/itinerary-proposal-review.tsx apps/web/components/itinerary-proposal-review.test.tsx apps/web/components/itinerary-proposal-review.module.css apps/web/lib/itinerary-proposal-experience.ts apps/web/lib/itinerary-proposal-experience.test.ts apps/web/e2e/itinerary-proposal-review.spec.ts docs/implementation/increments/rb-inc-061-itinerary-proposal-expired-review.md docs/implementation/context-packs/rb-inc-061-itinerary-proposal-expired-review.md docs/implementation/traceability-matrix.md docs/registry.md
pnpm docs:validate
pnpm --filter @routebook/web lint
pnpm --filter @routebook/web typecheck
pnpm --filter @routebook/web test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

O E2E com PostgreSQL deve ser executado no CI quando o banco local não estiver disponível.

## 11. Quando interromper e escalar

- for necessário escolher mecanismo de disparo da expiração;
- surgir necessidade de nova ação de decisão ou escrita no Itinerary;
- for necessário novo estado, relação, evento ou invariante de domínio;
- a persistência não entregar o snapshot `expired` completo;
- a experiência exigir política de retenção ou autorização ainda não definida.
