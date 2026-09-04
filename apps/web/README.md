# RouteBook Web

Aplicação web principal do RouteBook, implementada com Next.js App Router e TypeScript estrito.

## Superfícies atuais

| Rota | Finalidade |
| --- | --- |
| `/` | landing institucional e entrada no produto |
| `/viagens` | listagem de Viagens persistidas ou estado vazio |
| `/viagens/nova` | criação canônica de uma Viagem com Destination resolvido |
| `/viagens/[tripId]/lugares` | catálogo curado próximo e Discovery externa progressiva |
| `/viagens/[tripId]/guia` | decisões do Dia e conteúdo editorial quando disponível |
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
- Playwright `1.62.0`;
- PostgreSQL/PostGIS `17`;
- Drizzle ORM `0.45.2`;
- Postgres.js `3.4.9`.

As versões são exatas e o `pnpm-lock.yaml` é obrigatório. O ESLint permanece na linha 9 por compatibilidade com os plugins utilizados pelo `eslint-config-next`. O TypeScript permanece na linha 6 porque a API de compilador da linha 7 ainda não é suportada pelo Next.js `16.2.12`.

## Pré-requisitos

- Node.js `24.18.0`;
- Corepack habilitado;
- Docker com Compose;
- pnpm definido pelo campo `packageManager` da raiz.

## Configuração local

A partir da raiz do repositório:

```bash
cp .env.example .env.local
docker compose up -d postgres
corepack enable
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm dev
```

A aplicação ficará disponível em `http://localhost:3000`.

A variável `DATABASE_URL` é obrigatória. O arquivo `.env.example` contém somente credenciais descartáveis do ambiente local.

## Fluxo de Viagem

O incremento atual permite:

1. abrir `/viagens/nova`;
2. informar nome, Destination, período, owner inicial e hospedagem opcional;
3. validar as invariantes do agregado `Trip`;
4. gerar `TripId` interno;
5. persistir a Viagem em PostgreSQL;
6. retornar para `/viagens` e manter a Viagem visível após recarregar a página.

O Destination é resolvido por uma porta de aplicação, persiste coordenadas, timezone e Proveniência e não possui default obrigatório de Pipa. Pipa permanece catálogo curado/regressão; destinos sem seed regional usam Discovery externa e podem continuar por Salvos, Roteiro e Guia sem conteúdo inventado.

## Validações

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm db:migrate
pnpm test
pnpm build
pnpm test:e2e
```

O teste end-to-end requer o Chromium do Playwright:

```bash
pnpm --filter @routebook/web exec playwright install chromium
```

## Limites atuais

- Providers externos continuam governados por configuração, kill switches e gates de Production;
- Quality e Media são enriquecimentos opcionais e podem degradar sem invalidar Discovery;
- o conteúdo editorial diário e a mídia curada permanecem concentrados em Pipa;
- destinos zero-seed recebem Guia derivado apenas de Salvos e Roteiro reais;
- convites e colaboração multiusuário permanecem fora do recorte atual.
