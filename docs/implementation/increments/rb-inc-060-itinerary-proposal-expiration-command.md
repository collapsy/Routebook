---
id: RB-INC-060
title: Comando de Expiração Temporal da Itinerary Proposal
description: Orquestra a expiração temporal e a persistência de uma Itinerary Proposal pronta pela operação pública do aggregate.
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
  - expiration
related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-INC-056
  - RB-INC-058
  - RB-INC-059
prerequisites:
  - RB-INC-058
  - RB-INC-059
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-060 — Comando de Expiração Temporal da Itinerary Proposal

## 1. Objetivo

Adicionar à camada de aplicação o comando que carrega uma Itinerary Proposal `ready`, executa sua expiração temporal pela operação pública do domínio e persiste o resultado `expired` pelo port existente.

Issue: [#136](https://github.com/collapsy/Routebook/issues/136)

Branch: `codex/rb-inc-060-expiration-command`.

Pull request: [#137](https://github.com/collapsy/Routebook/pull/137).

## 2. Problema

Domínio e adapter já suportam `ready → expired`, porém consumidores ainda precisariam repetir a ordem entre carregar, validar o instante, transicionar e salvar. Isso permite tratamentos divergentes para ausência, estado ou validade incompatíveis.

## 3. Resultado verificável

- comando tipado recebe Trip, Proposal e `expiredAt`;
- busca usa `tripId` e `itineraryProposalId`;
- expiração delega integralmente a `expireItineraryProposalByTime`;
- `save` ocorre somente após uma transição válida;
- retorno corresponde ao resultado entregue pelo repository;
- ausência e erros do domínio preservam seus tipos públicos;
- nenhuma dependência de banco, framework, relógio ou Provider entra no módulo.

## 4. Invariantes

1. somente Proposal `ready` pode expirar por este comando;
2. o instante é explícito e não é obtido internamente;
3. a operação de domínio acontece antes de `repository.save`;
4. falha de busca ou transição não executa escrita;
5. Proposal `expired` permanece auditável e não altera Itinerary;
6. o serviço não duplica regra temporal do aggregate.

## 5. Escopo

- contrato `ExpireItineraryProposalByTimeCommand`;
- função `expireAndPersistItineraryProposalByTime`;
- exports públicos;
- testes unitários com repository em memória;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- scheduler, job, fila, retry ou relógio de infraestrutura;
- API, Server Action ou UI;
- expiração por versão, Contexto, cancelamento de Trip ou substituição;
- aceite ou aplicação da Proposal;
- schema, migration, adapter ou Provider;
- Evento de Domínio, Outbox ou observabilidade.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-060-itinerary-proposal-expiration-command.md`

## 8. Caminhos permitidos

```text
modules/proposal-management/src/index.ts
modules/proposal-management/src/service.ts
modules/proposal-management/src/service.test.ts
docs/implementation/increments/rb-inc-060-itinerary-proposal-expiration-command.md
docs/implementation/context-packs/rb-inc-060-itinerary-proposal-expiration-command.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] comando carrega Proposal pela Trip e identidade informadas;
- [x] expiração válida persiste exatamente uma Proposal `expired`;
- [x] `expiredAt`, conteúdo e proveniência chegam ao repository sem perda;
- [x] Proposal ausente produz erro de aplicação tipado;
- [x] estado incompatível não chama `save`;
- [x] instante antecipado ou inválido não chama `save`;
- [x] falha do repository não é apresentada como sucesso;
- [x] nenhuma infraestrutura ou bounded context externo é acoplado;
- [x] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- sucesso exatamente em `validUntil` e persistência única;
- sucesso depois de `validUntil` com conteúdo preservado;
- Proposal ausente sem `save`;
- estado incompatível sem `save`;
- instante antecipado e inválido sem `save`;
- rejeição do repository propagada;
- regressão dos comandos anteriores e do monorepo.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| salvar antes da validação | Alto | calcular `expired` antes de chamar o port |
| duplicar regra temporal | Médio | delegar exclusivamente à operação pública do aggregate |
| esconder falha de persistência | Alto | retornar e propagar diretamente a Promise de `save` |
| antecipar automação | Médio | receber `expiredAt` explicitamente e não introduzir scheduler |

## 12. Segurança e privacidade

O comando recebe apenas identidades e um instante de lifecycle. Não recebe conteúdo externo, prompt, token, secret ou dado pessoal novo e não concede autoridade para aplicar a Proposal.

## 13. Rollback

Reverter serviço, testes, exports e documentação. Não existe migration, dependência ou efeito externo adicional.

## 14. Evidências

- Prettier dos caminhos alterados e `git diff --check`: verdes;
- documentação: 161 documentos e 161 registros validados, com quatro avisos preexistentes;
- `@routebook/proposal-management`: lint e typecheck verdes; 60 testes verdes;
- workspace: lint, typecheck e build verdes;
- PR #137, run `30714407588`: formatação, documentação, lint, typecheck, migration PostgreSQL, suíte de componentes e domínio, smoke, build e 50 testes Playwright responsivos verdes.
