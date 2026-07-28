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

O incremento foi validado e integrado pelo PR #9.

## Resultado vertical

Uma pessoa consegue criar uma Viagem para Pipa informando nome, período, owner inicial e hospedagem opcional. O RouteBook valida as invariantes, gera identidade interna, persiste o agregado em PostgreSQL/PostGIS e apresenta a Viagem em `Minhas viagens` após a gravação.

## Decisões de recorte

- Pipa, Tibau do Sul — RN é o único destino canônico suportado neste incremento;
- o destino possui coordenadas e fuso definidos internamente;
- a Viagem nasce em estado `draft`;
- um owner local satisfaz a invariante de ownership enquanto autenticação permanece fora de escopo;
- participantes representam acesso à Viagem e não o perfil de Viajantes;
- hospedagem é opcional;
- o agregado é persistido por uma porta de repositório e adapter Drizzle.

## Escopo entregue

- módulo `trip-management` com domínio puro;
- agregado `Trip` e objetos de valor;
- validações de nome, período, owner e hospedagem;
- geração interna de `TripId` e `UserId`;
- adapter Drizzle/PostgreSQL;
- migration inicial versionada;
- PostGIS local por Docker Compose;
- formulário acessível com Server Action;
- listagem persistida em `/viagens`;
- testes de domínio, componentes e E2E;
- CI com banco isolado e migration.

## Fora de escopo

- autenticação e Account reais;
- perfil de Viajantes;
- resolução dinâmica ou múltiplos destinos;
- edição, cancelamento, arquivamento ou exclusão;
- mapas, Lugares, Salvos, Roteiro, Recomendações e IA.

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
- [x] migration é aplicada em PostgreSQL/PostGIS;
- [x] formulário apresenta erros junto aos campos;
- [x] criação redireciona para `/viagens`;
- [x] viagem permanece visível após recarregar a página;
- [x] CI provisiona banco e aplica migration;
- [x] testes passam em desktop e mobile;
- [x] formatação, documentação, lint, typecheck e build passam.

## Evidências

| Evidência | Resultado |
| --- | --- |
| issue | #8 |
| pull request | #9, integrado |
| validação documental | 113 documentos registrados, 0 avisos |
| domínio | 4 testes aprovados |
| componentes | 3 testes aprovados |
| migration | aplicada com sucesso em PostGIS 17 |
| servidor de desenvolvimento | smoke aprovado |
| build | produção aprovada |
| E2E | 14 testes aprovados em desktop Chromium e Pixel 7 |
| quality gates | instalação congelada, format, docs, lint, typecheck, migration, testes, dev smoke, build e Playwright aprovados |
