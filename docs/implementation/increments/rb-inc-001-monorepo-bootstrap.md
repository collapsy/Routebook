---
id: RB-INC-001
title: Bootstrap do Monorepo
description: Define e registra o primeiro incremento técnico executável do RouteBook, criando a base mínima do monorepo, da aplicação web e das validações de engenharia.
document_type: implementation-increment
owner: Delivery
status: Published
version: "1.0.0"
created: "2026-07-28"
last_updated: "2026-07-28"
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
  - RB-IMP-004
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

## Metadados operacionais

| Campo | Valor |
| --- | --- |
| Estado operacional | Ready for Review |
| Issue | #4 |
| Pull request | #5 |
| Branch | `feature/rb-inc-001-monorepo-bootstrap` |
| Base | `main` |

O status `Published` representa o ciclo documental deste arquivo. A integração do código na `main` permanece sujeita à revisão e aprovação do pull request.

## Resultado vertical

Uma pessoa consegue clonar o repositório, instalar dependências de forma reproduzível, iniciar a aplicação web mínima, executar validações automatizadas e visualizar uma página institucional responsiva do RouteBook.

## Problema resolvido

O repositório possuía documentação extensa, mas ainda não continha workspace executável, package manager configurado, aplicação Next.js, lockfile ou comandos padronizados de engenharia.

Este incremento cria a primeira base de runtime sem antecipar capacidades de domínio ou integrações externas.

## Escopo entregue

- pnpm Workspace com lockfile obrigatório;
- Turborepo para orquestração de tarefas;
- `apps/web` com Next.js App Router;
- TypeScript estrito e configuração compartilhada;
- ESLint compartilhado e Prettier;
- Tailwind CSS com tokens semânticos locais;
- página institucional responsiva e acessível;
- teste de componente com Vitest e Testing Library;
- smoke tests com Playwright em desktop e viewport móvel;
- smoke automatizado do servidor de desenvolvimento;
- comandos padronizados de formatação, documentação, lint, tipagem, testes e build;
- GitHub Actions com instalação congelada e quality gates;
- documentação de instalação e execução.

O pacote `packages/ui` não foi criado porque a página inicial não exigiu uma biblioteca compartilhada. Essa decisão preserva a regra de não criar abstrações antes de existir responsabilidade real.

## Fora de escopo preservado

- autenticação;
- banco de dados;
- mapas;
- módulos de negócio;
- catálogo de Pipa;
- Roteiro;
- IA em execução;
- Redis, Inngest, R2 ou feature flags;
- Providers externos;
- deployment de produção.

## Context Pack utilizado

- `AGENTS.md`;
- `docs/core/routebook-bible.md`;
- `docs/development/development-environment-and-engineering-standards.md`;
- `docs/cicd/continuous-integration-delivery-and-release-strategy.md`;
- `docs/quality/quality-and-testing-strategy.md`;
- `docs/design-system/foundations.md`;
- RB-ADR-002, 003, 004, 010, 011 e 019.

## Estrutura materializada

```text
Routebook/
├── .github/workflows/engineering-validation.yml
├── apps/web/
│   ├── app/
│   ├── components/
│   ├── e2e/
│   └── package.json
├── packages/
│   ├── eslint-config/
│   └── typescript-config/
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── prettier.config.mjs
├── tsconfig.json
└── turbo.json
```

## Stack fixada

| Componente | Versão |
| --- | --- |
| Node.js | 24.18.0 |
| pnpm | 11.17.0 |
| Turborepo | 2.10.7 |
| Next.js | 16.2.12 |
| React | 19.2.8 |
| Tailwind CSS | 4.3.3 |
| TypeScript | 6.0.3 |
| ESLint | 9.39.5 |
| Vitest | 4.1.10 |
| Playwright | 1.62.0 |

As versões são exatas. O `pnpm-lock.yaml` é parte obrigatória do incremento.

## Ajustes de compatibilidade registrados

### pnpm 11

Scripts nativos permanecem bloqueados por padrão. Somente `sharp` e `unrs-resolver` foram autorizados explicitamente por `allowBuilds` no `pnpm-workspace.yaml`.

### ESLint

O ESLint foi fixado em `9.39.5` porque os plugins utilizados pelo `eslint-config-next` ainda não eram compatíveis com a API do ESLint 10.

### TypeScript

O TypeScript foi fixado em `6.0.3`. O Next.js `16.2.12` compilou o código com TypeScript 7 durante o typecheck isolado, mas seu build ainda não suporta a API de compilador dessa linha sem opção experimental.

Foi escolhida a linha estável compatível em vez de ativar `experimental.useTypeScriptCli`.

## Critérios de aceite

- [x] `corepack enable` e `pnpm install --frozen-lockfile` funcionam;
- [x] `pnpm dev` inicia a aplicação e responde por HTTP;
- [x] a página inicial comunica o propósito do RouteBook;
- [x] o layout é validado em viewport móvel e desktop;
- [x] `pnpm format:check` passa;
- [x] `pnpm docs:validate` passa;
- [x] `pnpm lint` passa;
- [x] `pnpm typecheck` passa;
- [x] `pnpm test` passa;
- [x] `pnpm build` passa;
- [x] `pnpm test:e2e` passa;
- [x] o workflow executa as mesmas validações;
- [x] nenhum Provider externo ou secret é necessário;
- [x] instruções de setup estão atualizadas.

## Validação automatizada

O workflow permanente é `.github/workflows/engineering-validation.yml`.

A sequência executada é:

```text
pnpm install --frozen-lockfile
→ pnpm format:check
→ pnpm docs:validate
→ pnpm lint
→ pnpm typecheck
→ pnpm test
→ smoke de pnpm dev
→ pnpm build
→ instalação do Chromium
→ pnpm test:e2e
```

Os testes E2E utilizam Chromium em dois projetos:

- `desktop-chromium`;
- `mobile-chromium`, baseado em Pixel 7.

## Decisões e limites arquiteturais

Este incremento implementa as escolhas autorizadas pelo próprio `RB-INC-001` e pelo Context Pack.

Os ADRs relacionados permanecem com status decisório interno próprio. A implementação deste bootstrap não altera automaticamente o estado decisório desses ADRs.

Nenhum módulo de domínio, Provider ou infraestrutura externa foi criado.

## Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| bootstrap crescer para a plataforma completa | escopo limitado à página institucional e infraestrutura de engenharia |
| dependências incompatíveis por uso indiscriminado de `latest` | versões exatas e lockfile obrigatório |
| execução silenciosa de scripts nativos | `allowBuilds` restrito a duas dependências conhecidas |
| dívida documental anterior bloquear código novo | fronteiras legadas explícitas no `.prettierignore` e validador documental preservado |
| UI inicial se tornar contrato definitivo do produto | página identificada como institucional e sem capacidades de domínio |

## Rollback

A alteração ainda não possui dados persistidos, migrations, Providers ou deployment. O rollback pode ser realizado revertendo o pull request e removendo os arquivos do bootstrap.

## Evidências

- issue #4;
- pull request #5;
- branch `feature/rb-inc-001-monorepo-bootstrap`;
- lockfile gerado e validado com instalação congelada;
- workflow `Engineering Validation`;
- teste de componente aprovado;
- build de produção aprovado;
- smoke tests responsivos aprovados;
- nenhuma credencial ou integração externa exigida.
