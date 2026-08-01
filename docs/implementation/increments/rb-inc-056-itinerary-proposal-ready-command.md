---
id: RB-INC-056
title: Comando de Conclusão da Itinerary Proposal Ready
description: Orquestra a conclusão e persistência de Itinerary Proposal ready pela operação pública do aggregate e pelo port existente.
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
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-INC-050
  - RB-INC-053
  - RB-INC-055
prerequisites:
  - RB-INC-055
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-056 — Comando de Conclusão da Itinerary Proposal Ready

## 1. Objetivo

Adicionar à camada de aplicação o comando que carrega uma Itinerary Proposal `generating`, executa a conclusão pública em `ready` e persiste o resultado pelo port do bounded context.

Issue: [#128](https://github.com/collapsy/Routebook/issues/128)

Branch: `codex/rb-inc-056-ready-command`

Base empilhada: `codex/rb-inc-054-ready-data-contract`, PR #125, após o merge da PR #127.

## 2. Problema

O aggregate conclui a geração e o repository persiste o snapshot completo, mas a camada de aplicação ainda termina em `start`, `fail` ou `cancel`. Um consumidor teria de repetir manualmente a ordem entre carregar, validar, concluir e salvar, com risco de tratamento incompatível para ausência ou erro de domínio.

## 3. Resultado verificável

- comando tipado recebe identidade, conteúdo revisável, proveniência e validade;
- busca usa TripId e ItineraryProposalId;
- conclusão delega integralmente à operação pública do aggregate;
- `save` acontece somente depois de uma conclusão válida;
- Proposal ausente preserva o erro de aplicação tipado existente;
- conteúdo inválido ou transição inválida não executa escrita;
- nenhuma dependência de banco, framework ou Provider entra no módulo.

## 4. Invariantes

1. `ready` significa pronta para revisão, não aceita nem aplicada;
2. o comando não gera conteúdo e não conhece Provider;
3. a operação de domínio acontece antes de `repository.save`;
4. falha de busca, validação ou transição não executa escrita;
5. o retorno é a representação entregue ao repository;
6. nenhuma operação altera Itinerary, Activity ou Planning Conflict;
7. conteúdo e proveniência são validados pelo aggregate, sem duplicação de regra no serviço.

## 5. Escopo

- contrato `CompleteItineraryProposalGenerationCommand`;
- função `completeAndPersistItineraryProposalGeneration`;
- exports públicos;
- testes unitários com repository em memória;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- Provider, modelo, prompt, output schema externo, job ou fila;
- API, Server Action ou UI;
- geração determinística ou assistida;
- aceite total ou parcial, rejeição, expiração, aplicação ou supersessão;
- autorização, idempotência de aplicação ou concorrência otimista;
- alteração de schema, migration ou adapter;
- evento, Outbox, retry ou observabilidade.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-056-itinerary-proposal-ready-command.md`

## 8. Caminhos permitidos

```text
modules/proposal-management/src/index.ts
modules/proposal-management/src/service.ts
modules/proposal-management/src/service.test.ts
docs/implementation/increments/rb-inc-056-itinerary-proposal-ready-command.md
docs/implementation/context-packs/rb-inc-056-itinerary-proposal-ready-command.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [ ] comando carrega Proposal pela Trip e identidade informadas;
- [ ] conclusão válida persiste exatamente uma Proposal `ready`;
- [ ] conteúdo, proveniência e datas chegam ao aggregate sem perda;
- [ ] Proposal ausente produz erro de aplicação tipado;
- [ ] transição inválida não chama `save`;
- [ ] conteúdo inválido não chama `save`;
- [ ] o serviço depende somente do port e das operações públicas do aggregate;
- [ ] nenhum Provider ou bounded context externo é acoplado;
- [ ] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- conclusão válida e persistida com conteúdo normalizado;
- Proposal ausente no comando de conclusão;
- conclusão fora de `generating` sem `save`;
- conteúdo ou proveniência inválida sem `save`;
- regressão dos comandos anteriores;
- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm --filter @routebook/proposal-management lint`;
- `pnpm --filter @routebook/proposal-management typecheck`;
- `pnpm --filter @routebook/proposal-management test`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test` quando `DATABASE_URL` estiver disponível;
- `pnpm build`;
- regressão Playwright desktop e mobile no CI;
- `git diff --check`.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| salvar antes da validação | Alto | calcular a representação `ready` antes de chamar o port |
| duplicar regras no serviço | Médio | delegar conteúdo e transição ao aggregate público |
| transformar conclusão em aplicação | Alto | limitar o pós-estado a `ready` e não escrever no Itinerary |
| antecipar integração externa | Alto | nenhum Provider, job, fila ou retry no recorte |

## 12. Segurança e privacidade

O comando recebe somente o conteúdo revisável e a proveniência técnica já aprovados. Não recebe prompt, token, secret, payload bruto ou dado pessoal adicional e não concede autoridade para aplicar a Proposal.

## 13. Rollback

Reverter serviço, testes, exports e documentação. Não existe migration, nova dependência ou escrita externa adicional.

## 14. Evidências

- `@routebook/proposal-management`: lint e typecheck verdes; 49 testes verdes;
- workspace: lint, typecheck e build verdes;
- documentação: 153 documentos e 153 registros validados, com quatro avisos preexistentes;
- Prettier dos caminhos alterados e `git diff --check`: verdes;
- testes do package database não executados localmente porque `DATABASE_URL` não está configurada e o daemon Docker está indisponível;
- migration PostgreSQL, suíte integral e Playwright responsivo: pendentes do workflow da pull request.
