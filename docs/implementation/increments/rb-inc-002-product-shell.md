---
id: RB-INC-002
title: Product Shell e Minhas Viagens
description: Implementa o primeiro shell navegável de produto do RouteBook, com entrada pela landing, área Minhas Viagens, estado vazio e estados globais seguros.
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

`Draft`

O incremento permanece em elaboração até que os checks documentais e de engenharia sejam executados no pull request.

## Resultado vertical

Uma pessoa consegue acessar a landing institucional, entrar na área de produto, compreender que ainda não possui Viagens, conhecer o fluxo de criação previsto e retornar com segurança, utilizando navegação responsiva e acessível.

## Problema

O `RB-INC-001` entregou uma aplicação institucional executável, mas o RouteBook ainda não possui uma superfície de produto navegável. A landing apresenta o conceito, porém não oferece um espaço coerente para iniciar o planejamento.

## Hipótese

Uma entrada clara para `Minhas viagens`, acompanhada de um estado vazio orientativo, permite validar a arquitetura de navegação e a compreensão do primeiro uso antes de introduzir identidade, persistência ou regras canônicas de `Trip`.

## Escopo

- conectar a landing à área de produto;
- implementar a rota `/viagens`;
- implementar o estado vazio de primeiro acesso;
- implementar a rota preparatória `/viagens/nova`;
- implementar shell global responsivo;
- preservar identificação do produto e contexto de navegação;
- adicionar skip link e foco visível;
- implementar estado de carregamento;
- implementar error boundary recuperável;
- implementar página de rota inexistente;
- adicionar testes de componente;
- adicionar testes E2E em desktop e viewport móvel;
- atualizar documentação e rastreabilidade.

## Fora de escopo

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

## Context Pack

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

## Superfícies

| Rota | Superfície | Estado |
| --- | --- | --- |
| `/` | Landing institucional | disponível |
| `/viagens` | RB-SCR-001 — Minhas Viagens | vazio orientativo |
| `/viagens/nova` | Preparação de RB-FRM-001 — Criar Viagem | informativo, sem persistência |
| rota inexistente | Estado global de página não encontrada | recuperável |

## Regras de experiência

- a Viagem continua sendo o contexto central futuro, mas nenhuma Viagem fictícia deve ser criada;
- o estado vazio deve orientar o primeiro uso e não parecer falha;
- ações devem utilizar rótulos verbais e descritivos;
- a rota preparatória deve informar explicitamente que nenhum dado é salvo;
- navegação global deve funcionar por teclado;
- foco deve permanecer visível;
- loading, erro e 404 devem utilizar mensagens seguras, sem detalhes técnicos;
- mobile e desktop devem preservar a mesma hierarquia de informação.

## Caminhos permitidos

```text
apps/web/app/**
apps/web/components/**
apps/web/e2e/**
apps/web/README.md
README.md
docs/implementation/increments/rb-inc-002-product-shell.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## Critérios de aceite

- [ ] a landing possui ação clara para abrir o RouteBook;
- [ ] `/viagens` possui título, contexto e estado vazio orientativo;
- [ ] o estado vazio explica o funcionamento em três passos;
- [ ] `Criar primeira viagem` aponta para uma rota válida;
- [ ] `/viagens/nova` apresenta destino, datas, hospedagem e viajantes como etapas futuras;
- [ ] a rota preparatória informa que nenhum dado é salvo;
- [ ] a navegação global permite retornar à landing e a Minhas Viagens;
- [ ] skip link e foco visível funcionam;
- [ ] loading utiliza semântica de status;
- [ ] erro oferece nova tentativa;
- [ ] 404 oferece retorno seguro;
- [ ] não existe persistência, Provider ou secret novo;
- [ ] testes de componente passam;
- [ ] testes E2E passam em desktop e mobile;
- [ ] formatação, documentação, lint, typecheck e build passam.

## Testes previstos

- renderização e links do estado vazio;
- execução da ação de recuperação do estado de erro;
- entrada no product shell pela landing;
- navegação entre Minhas Viagens e preparação da criação;
- mensagem de ausência de persistência;
- recuperação de rota inexistente;
- execução em projetos Playwright desktop e mobile.

## Decisões de implementação

- componentes permanecem locais em `apps/web`, pois ainda não existe segundo consumidor que justifique `packages/ui`;
- nenhum modelo de domínio temporário será criado;
- nenhum dado será armazenado em `localStorage`;
- a rota `/viagens/nova` valida somente arquitetura de informação e navegação;
- os tokens semânticos existentes continuam sendo a fonte visual;
- nenhuma biblioteca de ícones ou UI será adicionada.

## Riscos

### Confundir preparação com funcionalidade concluída

Mitigação: informar claramente que nenhum dado será salvo e não apresentar campos editáveis falsos.

### Antecipar domínio ou persistência

Mitigação: não criar `Trip`, `TripId`, repositórios, APIs ou armazenamento local.

### Duplicar componentes prematuramente

Mitigação: manter componentes locais e promover para pacote compartilhado somente quando houver responsabilidade reutilizável real.

## Evidências

Serão preenchidas após a execução dos workflows no pull request associado à issue `#6`.
