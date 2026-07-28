# RouteBook Web

Aplicação web principal do RouteBook, implementada com Next.js App Router e TypeScript estrito.

## Superfícies atuais

| Rota | Finalidade |
| --- | --- |
| `/` | landing institucional e entrada no produto |
| `/viagens` | área Minhas Viagens no estado vazio de primeiro acesso |
| `/viagens/nova` | preparação do futuro fluxo de criação, sem persistência |
| rota inexistente | estado 404 com retorno seguro |

O product shell inclui navegação global, skip link, foco visível, loading, error boundary e comportamento responsivo em desktop e mobile.

## Stack

- Node.js `24.18.0`;
- pnpm `11.17.0`;
- Next.js `16.2.12`;
- React `19.2.8`;
- Tailwind CSS `4.3.3`;
- TypeScript `6.0.3`;
- ESLint `9.39.5`;
- Vitest `4.1.10`;
- Playwright `1.62.0`.

As versões são exatas e o `pnpm-lock.yaml` é obrigatório. O ESLint permanece na linha 9 por compatibilidade com os plugins utilizados pelo `eslint-config-next`. O TypeScript permanece na linha 6 porque a API de compilador da linha 7 ainda não é suportada pelo Next.js `16.2.12`.

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
pnpm docs:validate
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

## Cobertura atual

- três testes de componente;
- quatorze testes E2E distribuídos entre desktop Chromium e viewport móvel Pixel 7;
- smoke do servidor de desenvolvimento;
- build de produção.

## Limites atuais

O shell não cria nem persiste uma `Trip`. Ainda não existem autenticação, banco, mapas, catálogo de Lugares, Salvos, Roteiro, Recomendações ou integrações externas. A rota `/viagens/nova` representa somente a preparação navegável do próximo fluxo vertical.
