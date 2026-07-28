---
id: RB-INC-003
title: Criação Canônica de Viagem
description: Implementa a criação validada e persistente do agregado Trip para o cenário inicial de Pipa.
document_type: implementation-increment
owner: Delivery
status: Draft
version: "0.1.0"
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

`Draft`

O incremento permanece em elaboração até a aprovação dos checks documentais e de engenharia no PR #9.

## Resultado vertical

Uma pessoa consegue criar uma Viagem para Pipa informando nome, período, owner inicial e hospedagem opcional. O RouteBook valida as invariantes, gera identidade interna, persiste o agregado em PostgreSQL/PostGIS e apresenta a Viagem em `Minhas viagens` após a gravação.

## Problema

O RB-INC-002 entregou navegação e estado vazio, porém a rota `/viagens/nova` ainda não criava estado canônico. Sem uma `Trip` persistida, nenhum contexto posterior — preferências, Lugares, distâncias, Roteiro ou recomendações — pode ser associado com segurança.

## Hipótese

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

## Escopo

- adicionar `modules/trip-management`;
- modelar `Trip`, `TripId`, `Destination`, `TripPeriod`, `Accommodation` e `TripParticipant`;
- validar nome, período, owner e hospedagem;
- gerar `TripId` e `UserId` internamente;
- adicionar `packages/database`;
- configurar Drizzle ORM e Postgres.js;
- versionar migration inicial;
- adicionar PostGIS local por Compose;
- implementar Server Action de criação;
- implementar formulário acessível;
- listar viagens persistidas;
- adicionar testes de domínio e E2E de persistência;
- atualizar CI, documentação e rastreabilidade.

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
├── app/viagens/nova/actions.ts
├── app/viagens/nova/page.tsx
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

- [ ] `Trip` é criada somente com dados válidos;
- [ ] data final não precede a inicial;
- [ ] toda Viagem possui owner inicial;
- [ ] hospedagem permanece opcional;
- [ ] `TripId` é gerado internamente;
- [ ] Pipa possui referência geográfica e fuso canônicos;
- [ ] migration é aplicada em PostgreSQL/PostGIS;
- [ ] formulário apresenta erros junto aos campos;
- [ ] criação redireciona para `/viagens`;
- [ ] viagem permanece visível após recarregar a página;
- [ ] CI provisiona banco e aplica migration;
- [ ] testes de domínio passam;
- [ ] testes E2E passam em desktop e mobile;
- [ ] formatação, documentação, lint, typecheck e build passam.

## Riscos

### Owner temporário sem autenticação

Mitigação: manter o identificador interno e limitar o recorte a um owner local. A futura autenticação deverá migrar ou associar essa participação explicitamente, sem redefinir `Trip`.

### Destino único

Mitigação: comunicar claramente o limite na interface. A resolução dinâmica de destino será um incremento separado.

### Agregado armazenado parcialmente em JSON

Mitigação: utilizar JSON apenas para participantes pertencentes ao agregado e manter atributos estruturais consultáveis em colunas. Novos agregados terão tabelas próprias.

## Rollback

O rollback exige reverter o PR e, quando houver dados locais de teste, remover a tabela `trips`. Em ambientes compartilhados, migrations aplicadas não devem ser apagadas silenciosamente; uma migration corretiva deverá ser criada.

## Evidências

Serão preenchidas após a execução definitiva dos workflows associados à issue #8 e ao PR #9.
