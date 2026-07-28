# RouteBook Web

Aplicação web principal do RouteBook, implementada com Next.js App Router e TypeScript.

## Pré-requisitos

- Node.js `24.18.0`;
- Corepack habilitado;
- pnpm definido pelo campo `packageManager` da raiz.

## Execução

A partir da raiz do repositório:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

A aplicação ficará disponível em `http://localhost:3000`.

## Validações

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

O teste end-to-end requer o Chromium do Playwright:

```bash
pnpm --filter @routebook/web exec playwright install chromium
```

## Limites atuais

Este bootstrap entrega somente a página institucional e a infraestrutura de engenharia. Não existem autenticação, banco, mapas, catálogo de lugares, roteiro ou integrações externas neste incremento.
