---
id: RB-INC-002
title: Product Shell e Minhas Viagens
description: Implementa o primeiro shell navegável de produto do RouteBook, com entrada pela landing, área Minhas Viagens, estado vazio e estados globais seguros.
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
  - product-shell
  - navigation
  - empty-state
  - accessibility
  - frontend
related_documents:
  - RB-CORE-0004
  - RB-DEL-001
  - RB-UX-001
  - RB-UX-003
  - RB-UX-004
  - RB-UX-005
  - RB-UX-006
  - RB-DS-001
  - RB-DS-002
  - RB-QA-001
  - RB-INC-001
prerequisites:
  - RB-INC-001
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-002 — Product Shell e Minhas Viagens

## Estado

`Published`

O incremento foi implementado e validado no pull request `#7`, associado à issue `#6`.

## Resultado vertical

Uma pessoa consegue acessar a landing institucional, entrar na área de produto, compreender que ainda não possui Viagens, conhecer o fluxo de criação previsto e retornar com segurança, utilizando navegação responsiva e acessível.

## Problema

O `RB-INC-001` entregou uma aplicação institucional executável, mas o RouteBook ainda não possuía uma superfície de produto navegável. A landing apresentava o conceito, porém não oferecia um espaço coerente para iniciar o planejamento.

## Hipótese validada

Uma entrada clara para `Minhas viagens`, acompanhada de um estado vazio orientativo, permite validar a arquitetura de navegação e a compreensão do primeiro uso antes de introduzir identidade, persistência ou regras canônicas de `Trip`.

## Escopo entregue

- conexão da landing com a área de produto;
- rota `/viagens`;
- estado vazio de primeiro acesso;
- rota preparatória `/viagens/nova`;
- shell global responsivo;
- identificação do produto e contexto de navegação;
- skip link e foco visível;
- estado de carregamento;
- error boundary recuperável;
- página de rota inexistente;
- testes de componente;
- testes E2E em desktop e viewport móvel;
- documentação e rastreabilidade atualizadas.

## Fora de escopo preservado

- criar ou persistir `Trip`;
- gerar `TripId`;
- autenticação, `User` ou `Account`;
- banco de dados;
- migrations;
- catálogo de Lugares;
- mapas ou geolocalização;
- Salvos;
- Roteiro;
- Recomendações;
- IA em execução;
- Providers externos;
- criação de `packages/ui`.

## Context Pack utilizado

- `AGENTS.md`;
- `apps/web/AGENTS.md`;
- `docs/core/routebook-bible.md`;
- `docs/delivery/delivery-strategy-and-implementation-roadmap.md`;
- `docs/ux/information-architecture.md`;
- `docs/ux/screen-inventory.md`;
- `docs/ux/wireframes.md`;
- `docs/ux/interaction-specifications.md`;
- `docs/ux/content-guidelines.md`;
- `docs/design-system/foundations.md`;
- `docs/design-system/component-library.md`;
- `docs/quality/quality-and-testing-strategy.md`;
- `docs/implementation/increments/rb-inc-001-monorepo-bootstrap.md`.

## Superfícies entregues

| Rota | Superfície | Estado |
| --- | --- | --- |
| `/` | Landing institucional | ação de entrada no produto |
| `/viagens` | RB-SCR-001 — Minhas Viagens | vazio orientativo |
| `/viagens/nova` | Preparação de RB-FRM-001 — Criar Viagem | informativo, sem persistência |
| rota inexistente | Estado global de página não encontrada | recuperável |

## Regras de experiência preservadas

- a Viagem continua sendo o contexto central futuro, mas nenhuma Viagem fictícia é criada;
- o estado vazio orienta o primeiro uso e não parece falha;
- ações utilizam rótulos verbais e descritivos;
- a rota preparatória informa explicitamente que nenhum dado é salvo;
- a navegação global funciona por teclado;
- o foco permanece visível;
- loading, erro e 404 utilizam mensagens seguras, sem detalhes técnicos;
- mobile e desktop preservam a mesma hierarquia de informação.

## Caminhos alterados

```text
apps/web/app/**
apps/web/components/**
apps/web/e2e/**
apps/web/README.md
docs/implementation/increments/rb-inc-002-product-shell.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Critérios de aceite

- [x] a landing possui ação clara para abrir o RouteBook;
- [x] `/viagens` possui título, contexto e estado vazio orientativo;
- [x] o estado vazio explica o funcionamento em três passos;
- [x] `Criar primeira viagem` aponta para uma rota válida;
- [x] `/viagens/nova` apresenta destino, datas, hospedagem e viajantes como etapas futuras;
- [x] a rota preparatória informa que nenhum dado é salvo;
- [x] a navegação global permite retornar à landing e a Minhas Viagens;
- [x] skip link e foco visível funcionam;
- [x] loading utiliza semântica de status;
- [x] erro oferece nova tentativa;
- [x] 404 oferece retorno seguro;
- [x] não existe persistência, Provider ou secret novo;
- [x] testes de componente passam;
- [x] testes E2E passam em desktop e mobile;
- [x] formatação, documentação, lint, typecheck e build passam.

## Testes executados

### Componentes

Três testes foram aprovados:

- `decision-pillars.test.tsx`;
- `empty-trips-state.test.tsx`;
- `product-error-state.test.tsx`.

### E2E responsivo

Quatorze testes foram aprovados nos projetos `desktop-chromium` e `mobile-chromium`, cobrindo:

- proposta de valor da landing;
- explicação institucional;
- entrada no product shell;
- estado vazio de Minhas Viagens;
- preparação da criação;
- ausência explícita de persistência;
- navegação global;
- recuperação de rota inexistente.

## Decisões de implementação

- componentes permanecem locais em `apps/web`, pois ainda não existe segundo consumidor que justifique `packages/ui`;
- nenhum modelo de domínio temporário foi criado;
- nenhum dado é armazenado em `localStorage`;
- a rota `/viagens/nova` valida somente arquitetura de informação e navegação;
- os tokens semânticos existentes continuam sendo a fonte visual;
- nenhuma biblioteca de ícones ou UI foi adicionada.

## Riscos tratados

### Confundir preparação com funcionalidade concluída

Mitigação aplicada: a interface informa claramente que nenhum dado é salvo e não apresenta campos editáveis falsos.

### Antecipar domínio ou persistência

Mitigação aplicada: não foram criados `Trip`, `TripId`, repositórios, APIs ou armazenamento local.

### Duplicar componentes prematuramente

Mitigação aplicada: os componentes permanecem locais e somente serão promovidos quando existir responsabilidade reutilizável real.

## Evidências

| Evidência | Resultado |
| --- | --- |
| issue | `#6` |
| branch | `feature/rb-inc-002-product-shell` |
| pull request | `#7` |
| Documentation Validation | aprovado |
| instalação congelada | aprovada |
| formatação | aprovada |
| lint | aprovado |
| typecheck | aprovado |
| testes de componente | 3 aprovados |
| smoke do servidor de desenvolvimento | aprovado |
| build de produção | aprovado |
| Playwright responsivo | 14 aprovados |

## Rollback

O incremento não possui migrations, dados persistidos, secrets ou Providers externos. O rollback pode ser realizado revertendo o pull request `#7`.
