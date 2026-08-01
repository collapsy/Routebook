---
id: RB-INC-062
title: Rejeição da Itinerary Proposal no Domínio
description: Implementa a transição canônica de uma Itinerary Proposal pronta para rejeitada sem alterar o Itinerary.
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
  - domain
  - rejection
related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-DATA-001
  - RB-ARC-002
  - RB-INC-053
  - RB-INC-058
prerequisites:
  - RB-INC-053
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-062 — Rejeição da Itinerary Proposal no Domínio

## 1. Objetivo

Adicionar ao aggregate a operação pública que rejeita explicitamente uma Itinerary Proposal `ready`, registra `rejectedAt`, preserva seu snapshot revisável e não altera o Itinerary.

Issue: [#140](https://github.com/collapsy/Routebook/issues/140)

Branch: `codex/rb-inc-062-reject-proposal`.

Pull request: [#141](https://github.com/collapsy/Routebook/pull/141).

## 2. Problema

O estado `rejected`, o comando `RejectItineraryProposal`, o fato `ItineraryProposalRejected` e o instante `rejectedAt` já são canônicos, mas o aggregate ainda não oferece a transição executável. Consumidores não conseguem registrar a decisão explícita sem construir um snapshot manual e potencialmente inconsistente.

## 3. Resultado verificável

- `rejectedAt` integra o snapshot do aggregate;
- operação pública aceita somente Proposal `ready`;
- instante de rejeição deve ser válido e não anterior à última atualização;
- transição resulta em `rejected` e atualiza `updatedAt`;
- conteúdo, versões e proveniência permanecem preservados;
- input e instantes permanecem imutáveis;
- nenhuma escrita em Itinerary ou integração externa é introduzida.

## 4. Invariantes

1. rejeição é uma decisão explícita sobre uma Proposal pronta;
2. Proposal rejeitada não altera o Itinerary;
3. rejeição é terminal no ciclo oficial;
4. snapshot revisável permanece auditável após a transição;
5. instante não pode retroceder o lifecycle;
6. operação é pura e independente de framework, banco, relógio ou Provider.

## 5. Escopo

- propriedade opcional `rejectedAt`;
- operação `rejectItineraryProposal`;
- export público;
- testes unitários;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- persistence adapter, schema ou migration;
- comando de aplicação, API, Server Action ou UI;
- aceitar total ou parcialmente e aplicar conteúdo ao Itinerary;
- motivo de rejeição não definido no contrato canônico;
- Evento de Domínio persistido, Decision, Outbox ou observabilidade;
- geração, regeneração, supersessão ou expiração;
- Provider, IA, job ou fila.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-062-itinerary-proposal-rejection.md`

## 8. Caminhos permitidos

```text
modules/proposal-management/src/index.ts
modules/proposal-management/src/itinerary-proposal.ts
modules/proposal-management/src/itinerary-proposal.test.ts
docs/implementation/increments/rb-inc-062-itinerary-proposal-rejection.md
docs/implementation/context-packs/rb-inc-062-itinerary-proposal-rejection.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] Proposal `ready` pode transicionar para `rejected`;
- [x] `rejectedAt` e `updatedAt` registram clones do instante informado;
- [x] instante anterior à última atualização é rejeitado;
- [x] instante inválido é rejeitado;
- [x] Proposal fora de `ready` é rejeitada;
- [x] conteúdo, referências, versões e proveniência permanecem preservados;
- [x] input e instante não são mutados;
- [x] operação não conhece banco, relógio, Provider ou Itinerary;
- [x] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- sucesso em Proposal `ready`;
- instante igual a `updatedAt`;
- instante anterior ao lifecycle;
- instante inválido;
- estados incompatíveis, incluindo `requested` e `rejected`;
- preservação do snapshot revisável;
- imutabilidade do input e dos instantes;
- regressão do módulo e do monorepo.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| rejeitar estado incompatível | Alto | permitir somente origem `ready` |
| perder conteúdo histórico | Alto | espalhar o snapshot e alterar apenas estado e instantes |
| retroceder a timeline | Médio | reutilizar validação comum de transição |
| inventar motivo obrigatório | Médio | não criar atributo ausente nos contratos canônicos |

## 12. Segurança e privacidade

A operação recebe somente uma Proposal já validada e um instante explícito. Não recebe credencial, payload externo, conteúdo pessoal novo ou autoridade para alterar o Itinerary.

## 13. Rollback

Reverter propriedade, operação, export, testes e documentação. Não há migration ou efeito externo.

## 14. Evidências

- Prettier dos caminhos alterados e `git diff --check`: verdes;
- documentação: 165 documentos e 165 registros validados, com quatro avisos preexistentes;
- `@routebook/proposal-management`: lint e typecheck verdes; 63 testes verdes;
- workspace: lint, typecheck e build verdes;
- PostgreSQL e Playwright não executados localmente porque o incremento não altera adapter ou interface e o ambiente local não possui `DATABASE_URL` nem Docker; serão cobertos pelo CI;
- PR #141, run `30716780960`: formatação, documentação, lint, typecheck, migrations PostgreSQL, suíte integral, smoke, build e 52 testes Playwright responsivos verdes.
