---
id: RB-INC-001
title: Bootstrap do Monorepo
description: Define o primeiro incremento técnico executável do RouteBook, criando a base mínima do monorepo, da aplicação web e das validações de engenharia.
document_type: implementation-increment
owner: Delivery
status: Planned
version: "0.1.0"
created: "2026-07-28"
last_updated: null
authors:
  - RouteBook Team
tags:
  - implementation
  - bootstrap
  - monorepo
  - nextjs
  - tooling
related_documents:
  - RB-CORE-0004
  - RB-IMP-001
  - RB-DEV-001
  - RB-CICD-001
  - RB-QA-001
  - RB-ADR-002
  - RB-ADR-003
  - RB-ADR-004
  - RB-ADR-010
  - RB-ADR-011
  - RB-ADR-019
prerequisites:
  - RB-INC-000
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-001 — Bootstrap do Monorepo

## Estado

`Planned`

Este incremento somente poderá passar para `Ready` após a conclusão e integração do `RB-INC-000`.

## Resultado vertical

Uma pessoa consegue clonar o repositório, instalar dependências, iniciar a aplicação web mínima, executar validações e visualizar uma página institucional do RouteBook.

## Problema

O repositório ainda não contém workspace executável, package manager configurado, aplicação Next.js ou comandos padronizados de engenharia.

## Escopo

- configurar pnpm Workspace e Turborepo;
- criar `apps/web` com Next.js App Router e TypeScript estrito;
- criar configuração compartilhada mínima de TypeScript e ESLint;
- criar pacote `packages/ui` somente se necessário para a página inicial;
- configurar Tailwind conforme ADR;
- criar página institucional responsiva;
- criar testes mínimos de smoke e componente;
- criar comandos `format:check`, `lint`, `typecheck`, `test` e `build`;
- integrar os comandos ao GitHub Actions;
- documentar instalação e execução.

## Fora de escopo

- autenticação;
- banco de dados;
- mapas;
- módulos de negócio;
- catálogo de Pipa;
- Roteiro;
- IA;
- Redis, Inngest, R2 ou feature flags;
- deployment de produção.

## Context Pack obrigatório

- `AGENTS.md`;
- `docs/core/routebook-bible.md`;
- `docs/development/development-environment-and-engineering-standards.md`;
- `docs/cicd/continuous-integration-delivery-and-release-strategy.md`;
- `docs/quality/quality-and-testing-strategy.md`;
- `docs/design-system/foundations.md`;
- RB-ADR-002, 003, 004, 010, 011 e 019.

## Caminhos previstos

```text
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
turbo.json
apps/web/**
packages/ui/**
packages/eslint-config/**
packages/typescript-config/**
.github/workflows/**
README.md
apps/web/README.md
```

## Critérios de aceite

- [ ] `corepack enable` e `pnpm install --frozen-lockfile` funcionam;
- [ ] `pnpm dev` inicia a aplicação;
- [ ] a página inicial comunica o propósito do RouteBook;
- [ ] layout funciona em viewport móvel e desktop;
- [ ] `pnpm format:check` passa;
- [ ] `pnpm lint` passa;
- [ ] `pnpm typecheck` passa;
- [ ] `pnpm test` passa;
- [ ] `pnpm build` passa;
- [ ] workflow executa as mesmas validações;
- [ ] nenhum Provider externo ou secret é necessário;
- [ ] instruções de setup estão atualizadas.

## Decisões já tomadas

- TypeScript e Node.js;
- Next.js App Router;
- pnpm Workspaces e Turborepo;
- Vitest, Testing Library e Playwright como estratégia progressiva;
- Tailwind, Radix e shadcn/ui como base visual;
- GitHub Actions para CI.

## Risco principal

Transformar o bootstrap em implementação antecipada de toda a plataforma. A mitigação é criar somente a infraestrutura exigida para uma página executável e checks confiáveis.