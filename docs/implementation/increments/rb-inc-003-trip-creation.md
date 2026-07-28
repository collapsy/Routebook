---
id: RB-INC-003
title: Criação Canônica de Viagem
description: Implementa a criação validada e persistente do agregado Trip para o cenário inicial de Pipa.
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
  - trip-management
  - postgresql
  - postgis
  - drizzle
  - server-actions
  - persistence
related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-ARC-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-ADR-005
  - RB-ADR-006
  - RB-QA-001
  - RB-INC-002
prerequisites:
  - RB-INC-002
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-003 — Criação Canônica de Viagem

## Estado

`Published`

O incremento foi validado no PR #9 por meio dos workflows permanentes de documentação e engenharia.

## Resultado vertical

Uma pessoa consegue criar uma Viagem para Pipa informando nome, período, owner inicial e hospedagem opcional. O RouteBook valida as invariantes, gera identidade interna, persiste o agregado em PostgreSQL/PostGIS e apresenta a Viagem em `Minhas viagens` após a gravação.

## Problema

O RB-INC-002 entregou navegação e estado vazio, porém a rota `/viagens/nova` ainda não criava estado canônico. Sem uma `Trip` persistida, nenhum contexto posterior — preferências, Lugares, distâncias, Roteiro ou recomendações — pode ser associado com segurança.

## Hipótese validada

A ativação do agregado `Trip` com um destino inicial controlado permite validar domínio, persistência e fluxo de criação sem antecipar geocodificação, autenticação ou outros agregados.

## Decisões de recorte

- Pipa, Tibau do Sul — RN é o único destino canônico suportado neste incremento;
- o destino possui coordenadas e fuso definidos internamente;
- a Viagem nasce em estado `draft`;
- um owner local é criado para satisfazer a invariante de ownership enquanto autenticação permanece fora de escopo;
- participantes representam acesso à Viagem e não o perfil de Viajantes;
- hospedagem é opcional;
- alterações futuras de destino, período ou hospedagem deverão incrementar `TripContextVersion`;
- o agregado é persistido por uma porta de repositório e adapter Drizzle.

## Escopo entregue

- `modules/trip-management` com domínio puro e testável;
- `Trip`, `TripId`, `Destination`, `TripPeriod`, `Accommodation` e `TripParticipant`;
- validação de nome, período, owner e hospedagem;
- geração interna de `TripId` e `UserId`;
- `packages/database` com Drizzle ORM e Postgres.js;
- migration inicial versionada;
- PostGIS local por Docker Compose;
- Server Action de criação;
- formulário acessível com erros junto aos campos;
- listagem de viagens persistidas;
- testes de domínio e E2E de persistência;
- CI com banco isolado, migration e testes responsivos;
- documentação, registro e rastreabilidade.

## Fora de escopo

- autenticação e Account reais;
- convites, editor e viewer;
- perfil de Viajantes;
- resolução dinâmica de destinos;
- múltiplos destinos;
- edição, cancelamento, arquivamento ou exclusão;
- mapas e rotas;
- catálogo de Lugares;
- Salvos;
- Roteiro;
- Recomendações e IA.

## Invariantes implementadas

1. a Viagem possui identidade interna;
2. a Viagem possui nome válido;
3. Pipa é o destino canônico deste recorte;
4. o período utiliza datas locais no fuso `America/Fortaleza`;
5. a data final não precede a inicial;
6. toda Viagem possui ao menos um owner;
7. hospedagem é opcional;
8. endereço de hospedagem não existe sem nome de hospedagem;
9. a versão estrutural inicial é `1`;
10. a persistência possui checks adicionais para ordem do período e versão positiva.

## Superfícies

| Superfície | Comportamento |
| --- | --- |
| `/viagens/nova` | formulário de criação canônica |
| Server Action | valida, persiste, revalida e redireciona |
| `/viagens` | lista viagens persistidas ou apresenta estado vazio |
| PostgreSQL/PostGIS | armazena o agregado Trip |
| migration | cria a tabela `trips` e invariantes físicas |

## Estrutura técnica

```text
apps/web
├── app/viagens/nova/{actions,state,page}.ts(x)
├── app/viagens/page.tsx
└── components/{trip-form,trip-card}.tsx

modules/trip-management
└── src/{trip,repository,service}.ts

packages/database
├── drizzle/0000_create_trips.sql
└── src/{client,schema,trip-repository,migrate}.ts
```

## Persistência local

```bash
cp .env.example .env.local
docker compose up -d postgres
corepack enable
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm dev
```

A variável obrigatória é `DATABASE_URL`. Credenciais de produção não são versionadas.

## Critérios de aceite

- [x] `Trip` é criada somente com dados válidos;
- [x] data final não precede a inicial;
- [x] toda Viagem possui owner inicial;
- [x] hospedagem permanece opcional;
- [x] `TripId` é gerado internamente;
- [x] Pipa possui referência geográfica e fuso canônicos;
- [x] migration é aplicada em PostgreSQL/PostGIS;
- [x] formulário apresenta erros junto aos campos;
- [x] criação redireciona para `/viagens`;
- [x] viagem permanece visível após recarregar a página;
- [x] CI provisiona banco e aplica migration;
- [x] testes de domínio passam;
- [x] testes E2E passam em desktop e mobile;
- [x] formatação, documentação, lint, typecheck e build passam.

## Riscos e mitigação

### Owner temporário sem autenticação

O identificador interno e a participação explícita são preservados. A futura autenticação deverá associar essa participação sem redefinir `Trip`.

### Destino único

O limite é comunicado na interface. A resolução dinâmica de destino permanece como incremento separado.

### Participantes em JSON

O JSON é utilizado apenas para participantes pertencentes ao agregado. Atributos estruturais continuam consultáveis em colunas e novos agregados terão tabelas próprias.

## Rollback

O rollback exige reverter o PR e, quando houver dados locais de teste, remover a tabela `trips`. Em ambientes compartilhados, migrations aplicadas não devem ser apagadas silenciosamente; uma migration corretiva deverá ser criada.

## Evidências

| Evidência | Resultado |
| --- | --- |
| issue | #8 |
| pull request | #9 |
| validação documental | 113 documentos registrados, 0 avisos |
| instalação | `pnpm install --frozen-lockfile` aprovado |
| domínio | 4 testes aprovados |
| componentes | 3 testes aprovados |
| migration | aplicada com sucesso em PostGIS 17 |
| servidor de desenvolvimento | smoke aprovado |
| build | produção aprovada |
| E2E | 14 testes aprovados em desktop Chromium e Pixel 7 |
| quality gates | formatação, documentação, lint, typecheck, migration, testes, dev smoke, build e Playwright aprovados |
