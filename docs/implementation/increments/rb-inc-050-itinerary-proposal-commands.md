---
id: RB-INC-050
title: Comandos do Ciclo Inicial de Itinerary Proposal
description: Orquestra solicitação, início, falha e cancelamento de Itinerary Proposal através do port de persistência, sem Provider ou alteração do Itinerary.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - proposal-management
  - application-service
  - commands
related_documents:
  - RB-CORE-0004
  - RB-PRD-006
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-INC-048
  - RB-INC-049
prerequisites:
  - RB-INC-049
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-050 — Comandos do Ciclo Inicial de Itinerary Proposal

## 1. Objetivo

Adicionar a camada de comandos de aplicação que cria, carrega, transiciona e persiste o ciclo inicial de Itinerary Proposal através do port do bounded context.

Issue: [#112](https://github.com/collapsy/Routebook/issues/112)

Branch: `codex/rb-inc-050-proposal-commands`

Base empilhada: `codex/rb-inc-049-proposal-persistence`.

## 2. Problema

O aggregate e o repository existem, mas cada consumidor futuro teria de repetir a ordem correta entre carregar, executar uma transição e persistir. Essa duplicação facilitaria salvar estado antes de uma validação ou tratar Proposal ausente de maneiras incompatíveis.

## 3. Resultado verificável

- comando de solicitação que cria e persiste uma Proposal `requested`;
- comandos de início, falha e cancelamento que carregam por Trip e identidade;
- erro de aplicação tipado para Proposal ausente;
- persistência somente após transição válida;
- serviço dependente apenas do port público;
- testes unitários com repository em memória.

## 4. Invariantes

1. o serviço não depende de Drizzle, PostgreSQL, framework ou Provider;
2. toda busca usa TripId e ItineraryProposalId;
3. Proposal ausente não cria estado implícito;
4. a operação de domínio acontece antes de `save`;
5. transição inválida não executa escrita;
6. request delega validação e normalização ao aggregate;
7. os comandos retornam a mesma representação persistida;
8. nenhuma operação altera o Itinerary.

## 5. Escopo

- `modules/proposal-management/src/service.ts`;
- `modules/proposal-management/src/service.test.ts`;
- contratos de comando e erro de aplicação;
- exports públicos;
- documentação, registro e rastreabilidade.

## 6. Limite canônico preservado

Os comandos terminam em `requested`, `generating`, `failed` ou `cancelled`. Não existe comando de conclusão, evitando qualquer escolha entre `ready` e `generated`.

## 7. Fora de escopo

- conclusão da geração, Proposed Activity e conteúdo;
- Provider, modelo, prompt, output schema, job ou fila;
- retry, supersessão, expiração, rejeição ou aceite;
- Unit of Work, lock ou concorrência otimista;
- API, Server Action, rota ou interface;
- evento, outbox ou observabilidade;
- alteração de outro bounded context.

## 8. Context Pack

`docs/implementation/context-packs/rb-inc-050-itinerary-proposal-commands.md`

## 9. Caminhos permitidos

```text
modules/proposal-management/src/index.ts
modules/proposal-management/src/service.ts
modules/proposal-management/src/service.test.ts
docs/implementation/increments/rb-inc-050-itinerary-proposal-commands.md
docs/implementation/context-packs/rb-inc-050-itinerary-proposal-commands.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 10. Critérios de aceite

- [x] request cria e persiste uma Proposal `requested`;
- [x] start carrega, transiciona e persiste `generating`;
- [x] fail carrega, transiciona e persiste `failed` com failureCode;
- [x] cancel funciona a partir de `requested` e `generating`;
- [x] Proposal ausente produz erro de aplicação tipado;
- [x] transição inválida não chama `save`;
- [x] o serviço depende somente do port e das operações públicas do aggregate;
- [x] testes unitários cobrem comandos, ausência e ordem de escrita;
- [x] documentação, lint, tipagem, testes e build permanecem verdes.

## 11. Testes obrigatórios

- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- regressão Playwright desktop e mobile no CI.

## 12. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| escrever após transição inválida | Alto | calcular a nova representação antes de chamar save |
| atravessar limite de Trip | Alto | chave composta lógica em toda busca |
| esconder Proposal ausente | Médio | erro de aplicação tipado |
| antecipar orquestração assíncrona | Alto | nenhum job, Provider ou retry neste recorte |

## 13. Rollback

Reverter serviço, testes e exports. Não existe migration ou escrita externa nova neste incremento.

## 14. Evidências

Evidências locais:

- 141 documentos registrados e validados, com quatro avisos preexistentes;
- 23 testes de Proposal Management aprovados, incluindo oito testes novos dos comandos;
- todos os testes fora do package database aprovados, incluindo 46 testes do web;
- lint e typecheck integrais aprovados;
- build aprovado;
- Prettier dos arquivos alterados e `git diff --check` aprovados;
- package database não executado localmente porque o daemon do Docker estava inativo.

Evidências da PR acumulada #115 no SHA `7d89f58`:

- Documentation Validation `30685658798` aprovada com 143 documentos registrados;
- Engineering Validation `30685658797`, tentativas 1 e 2, aprovada integralmente;
- migrations PostgreSQL, 23 testes de Proposal Management, regressão completa, build e 46 cenários Playwright desktop/mobile aprovados;
- nenhuma das duas tentativas exigiu retry de cenário ou gerou flaky annotation.
