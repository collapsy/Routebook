---
id: RB-INC-064
title: Comando de Rejeição da Itinerary Proposal
description: Orquestra a rejeição explícita e a persistência de uma Itinerary Proposal pronta pela operação pública do aggregate.
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
  - rejection
related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-INC-050
  - RB-INC-060
  - RB-INC-062
  - RB-INC-063
prerequisites:
  - RB-INC-062
  - RB-INC-063
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-064 — Comando de Rejeição da Itinerary Proposal

## 1. Objetivo

Adicionar à camada de aplicação o comando que carrega uma Itinerary Proposal `ready`, executa sua rejeição explícita pela operação pública do domínio e persiste o resultado `rejected` pelo port existente.

Issue: [#144](https://github.com/collapsy/Routebook/issues/144)

Branch: `codex/rb-inc-064-rejection-command`.

Pull request: pendente.

## 2. Problema

Domínio e adapter já suportam `ready → rejected`, porém consumidores ainda precisariam repetir a ordem entre carregar, transicionar e salvar. Isso permite tratamentos divergentes para ausência, estado incompatível, instante inválido ou falha de persistência.

## 3. Resultado verificável

- comando tipado recebe Trip, Proposal e `rejectedAt`;
- busca usa `tripId` e `itineraryProposalId`;
- rejeição delega integralmente a `rejectItineraryProposal`;
- `save` ocorre somente após uma transição válida;
- retorno corresponde ao resultado entregue pelo repository;
- ausência e erros do domínio preservam seus tipos públicos;
- nenhuma dependência de banco, framework, relógio ou Provider entra no módulo.

## 4. Invariantes

1. somente Proposal `ready` pode ser rejeitada por este comando;
2. o instante é explícito e não é obtido internamente;
3. a operação de domínio acontece antes de `repository.save`;
4. falha de busca ou transição não executa escrita;
5. Proposal `rejected` preserva o snapshot e não altera Itinerary;
6. o serviço não duplica regras do aggregate.

## 5. Escopo

- contrato `RejectItineraryProposalCommand`;
- função `rejectAndPersistItineraryProposal`;
- exports públicos;
- testes unitários com repository em memória;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- motivo, ator ou comentário de rejeição não definidos no domínio;
- API, Server Action ou UI;
- aceite, aplicação ou alteração da Proposal;
- autorização, idempotência ou concorrência otimista;
- schema, migration, adapter ou Provider;
- Evento de Domínio, Outbox, job, fila, retry ou observabilidade;
- escrita em Itinerary ou outro bounded context.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-064-itinerary-proposal-rejection-command.md`

## 8. Caminhos permitidos

```text
modules/proposal-management/src/index.ts
modules/proposal-management/src/service.ts
modules/proposal-management/src/service.test.ts
docs/implementation/increments/rb-inc-064-itinerary-proposal-rejection-command.md
docs/implementation/context-packs/rb-inc-064-itinerary-proposal-rejection-command.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [ ] comando carrega Proposal pela Trip e identidade informadas;
- [ ] rejeição válida persiste exatamente uma Proposal `rejected`;
- [ ] `rejectedAt`, conteúdo e proveniência chegam ao repository sem perda;
- [ ] Proposal ausente produz erro de aplicação tipado;
- [ ] estado incompatível não chama `save`;
- [ ] instante retroativo ou inválido não chama `save`;
- [ ] falha do repository não é apresentada como sucesso;
- [ ] nenhuma infraestrutura ou bounded context externo é acoplado;
- [ ] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- sucesso exatamente em `updatedAt` e persistência única;
- sucesso depois de `updatedAt` com snapshot preservado;
- Proposal ausente sem `save`;
- estado incompatível sem `save`;
- instante retroativo e inválido sem `save`;
- rejeição do repository propagada sem substituir o estado em memória;
- regressão dos comandos anteriores e do monorepo.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| salvar antes da validação | Alto | calcular `rejected` antes de chamar o port |
| duplicar regra do domínio | Médio | delegar exclusivamente à operação pública do aggregate |
| esconder falha de persistência | Alto | retornar e propagar diretamente a Promise de `save` |
| inventar motivo ou ator | Alto | limitar o contrato às informações já canônicas |

## 12. Segurança e privacidade

O comando recebe apenas identidades e um instante de lifecycle. Não recebe prompt, token, secret, payload bruto, dado pessoal novo ou motivo livre e não concede autoridade para aplicar a Proposal.

## 13. Rollback

Reverter serviço, testes, exports e documentação. Não existe migration, dependência ou efeito externo adicional.

## 14. Evidências

Evidências locais:

- 169 documentos registrados e validados, com quatro avisos preexistentes;
- lint e typecheck do módulo Proposal Management aprovados;
- 70 testes de Proposal Management aprovados;
- lint, typecheck e build integrais aprovados;
- Prettier dos arquivos alterados e `git diff --check` aprovados.

Evidências de CI pendentes.
