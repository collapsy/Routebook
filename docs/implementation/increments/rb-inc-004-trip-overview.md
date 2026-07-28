---
id: RB-INC-004
title: Visão Inicial da Viagem
description: Entrega a primeira visão contextual de uma Trip persistida e deriva seus Dias da Viagem.
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
  - trip-overview
  - navigation
  - accessibility
related_documents:
  - RB-PRD-004
  - RB-UX-001
  - RB-UX-002
  - RB-UX-003
  - RB-DOM-001
  - RB-DOM-003
  - RB-INC-003
prerequisites:
  - RB-INC-003
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-004 — Visão Inicial da Viagem

## Estado

`Ready for Integration`

A implementação foi validada no PR #12 e está pronta para revisão humana e integração.

## Resultado vertical

Uma pessoa consegue abrir uma Viagem persistida por seu `TripId`, compreender seu contexto estrutural e visualizar os Dias da Viagem derivados de forma inclusiva a partir do período salvo.

## Problema

O RB-INC-003 permitiu criar e listar uma `Trip`, porém ainda não existia uma superfície dedicada para retomá-la. Sem uma visão contextual, o card em `Minhas viagens` encerrava o fluxo antes do primeiro valor de planejamento.

## Hipótese

Uma visão inicial enxuta, derivada somente do agregado `Trip`, permite validar retomada, navegação e estrutura temporal antes de introduzir Preferências, Lugares, mapas ou Roteiro.

## Escopo

- adicionar consulta `findById` à porta `TripRepository`;
- implementar consulta por identidade no adapter Drizzle;
- criar rota `/viagens/[tripId]`;
- tornar cards de `Minhas viagens` navegáveis;
- apresentar destino, período, hospedagem, owner, status e versão do contexto;
- derivar Dias da Viagem de forma inclusiva;
- implementar loading, erro recuperável e 404 específico;
- preservar acessibilidade e responsividade;
- adicionar testes de domínio e E2E;
- atualizar documentação, registro e rastreabilidade.

## Fora de escopo

- edição da Viagem;
- persistência dos Dias da Viagem;
- Preferências, Restrições, Orçamento ou Perfil do Grupo;
- catálogo e descoberta de Lugares;
- mapas, rotas ou geocodificação;
- Salvos e Roteiro;
- recomendações ou IA;
- autenticação.

## Decisões de recorte

- os Dias da Viagem são uma projeção derivada do período e não um novo agregado;
- o intervalo é inclusivo, portanto 22 a 29 de agosto produz oito dias;
- a ausência de hospedagem é apresentada explicitamente, sem inferência;
- `TripId` inexistente resulta em 404 seguro;
- a página é dinâmica porque lê PostgreSQL em tempo de execução;
- nenhum dado adicional é gravado neste incremento.

## Critérios de aceite

- [x] uma Viagem existente pode ser aberta por seu `TripId`;
- [x] os cards de `Minhas viagens` possuem ação clara de abertura;
- [x] destino, período, hospedagem, owner, status e versão são apresentados;
- [x] os Dias correspondem ao intervalo inclusivo do período;
- [x] hospedagem ausente é tratada sem informação inventada;
- [x] `TripId` inexistente apresenta 404 específico;
- [x] loading e erro recuperável existem na rota;
- [x] navegação por teclado e foco visível são preservados;
- [x] testes passam em desktop e mobile;
- [x] formatação, documentação, lint, typecheck, migration, testes e build passam.

## Estrutura técnica

```text
modules/trip-management
├── src/repository.ts
├── src/service.ts
└── src/trip-days.ts

packages/database
└── src/trip-repository.ts

apps/web
├── app/viagens/[tripId]/{page,loading,error,not-found}.tsx
├── app/viagens/trip-overview.css
├── components/trip-card.tsx
└── e2e/product-shell.spec.ts
```

## Rollback

O rollback consiste em reverter o PR. Não há migration, alteração física de schema ou escrita adicional de dados neste incremento.

## Evidências

- issue #11 e PR #12;
- 5 testes de domínio aprovados, incluindo derivação inclusiva dos Dias;
- 4 testes de componente aprovados;
- 14 testes Playwright aprovados em desktop Chromium e Pixel 7;
- instalação congelada, formatação, documentação, lint e typecheck aprovados;
- migration PostGIS, smoke do servidor e build de produção aprovados;
- rota persistente e 404 específico validados ponta a ponta.
