---
id: RB-INC-066
title: Finalização Pós-aplicação da Itinerary Proposal Accepted
description: Implementa a finalização canônica de uma Itinerary Proposal integralmente aplicada para accepted, sem executar a aplicação do Roteiro.
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
  - acceptance
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
  - RB-INC-058
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-066 — Finalização Pós-aplicação da Itinerary Proposal Accepted

## 1. Objetivo

Adicionar ao aggregate a operação interna e pública que finaliza como `accepted` uma Itinerary Proposal `ready` cuja aplicação integral já foi concluída validamente pelo futuro orquestrador, registrando `acceptedAt` e preservando o snapshot.

Issue: [#148](https://github.com/collapsy/Routebook/issues/148).

Branch: `codex/rb-inc-066-finalize-accepted-proposal`.

Pull request: [#149](https://github.com/collapsy/Routebook/pull/149).

## 2. Problema

O estado `accepted`, o instante `acceptedAt` e o fato `ItineraryProposalAccepted` já são canônicos. O aggregate, porém, não possui uma forma segura de registrar a conclusão depois de `ApplyProposalItems`. Construir manualmente esse snapshot permitiria perder conteúdo, retroceder a timeline ou confundir finalização com aplicação.

## 3. Resultado verificável

- `acceptedAt` integra o snapshot do aggregate;
- `finalizeAppliedItineraryProposalAcceptance` aceita somente Proposal `ready`;
- o nome e o contrato deixam explícito que a aplicação integral antecede a operação;
- o instante deve ser válido, não anterior a `updatedAt` e anterior a `validUntil`;
- resultado possui status `accepted`, `acceptedAt` e `updatedAt` coerentes;
- conteúdo, versões base e proveniência permanecem preservados;
- nenhuma escrita em Itinerary, persistência ou integração externa é introduzida.

## 4. Invariantes

1. `accepted` significa integralmente aplicada, nunca apenas aprovada em memória;
2. esta operação finaliza o aggregate somente depois de aplicação válida coordenada externamente;
3. somente Proposal `ready` e ainda válida pode ser finalizada;
4. Proposal expirada não pode ser aceita;
5. snapshot revisável permanece auditável após a finalização;
6. instante não pode retroceder o lifecycle;
7. operação é pura e independente de framework, banco, relógio, Provider ou Itinerary.

## 5. Escopo

- propriedade opcional `acceptedAt`;
- operação `finalizeAppliedItineraryProposalAcceptance`;
- export público;
- testes unitários;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- comando `AcceptItineraryProposal` e orquestração da aplicação;
- `ApplyProposalItems` ou escrita no Itinerary;
- validação da versão atual do Itinerary, Trip Context, Restrições, Activities fixed, Free Periods protected, autorização ou idempotência;
- Proposal Application, Selection ou Decision;
- persistence adapter, schema ou migration;
- Evento de Domínio persistido, Outbox ou observabilidade;
- API, Server Action, confirmação ou UI;
- aceite parcial, rejeição, regeneração, supersessão ou expiração;
- Provider, IA, job ou fila.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-066-itinerary-proposal-accepted-finalization.md`

## 8. Caminhos permitidos

```text
modules/proposal-management/src/index.ts
modules/proposal-management/src/itinerary-proposal.ts
modules/proposal-management/src/itinerary-proposal.test.ts
docs/implementation/increments/rb-inc-066-itinerary-proposal-accepted-finalization.md
docs/implementation/context-packs/rb-inc-066-itinerary-proposal-accepted-finalization.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] Proposal `ready` ainda válida pode transicionar para `accepted`;
- [x] `acceptedAt` e `updatedAt` registram clones independentes do instante informado;
- [x] instante igual a `updatedAt` é permitido quando anterior a `validUntil`;
- [x] instante anterior ao lifecycle ou inválido é rejeitado;
- [x] instante igual ou posterior a `validUntil` é rejeitado;
- [x] Proposal sem `validUntil` é rejeitada defensivamente;
- [x] Proposal fora de `ready` é rejeitada;
- [x] conteúdo, referências, versões e proveniência permanecem preservados;
- [x] input e instante não são mutados;
- [x] operação não aplica o Roteiro e não conhece banco, relógio, Provider ou Itinerary;
- [x] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- sucesso em Proposal `ready` antes de `validUntil`;
- instante igual a `updatedAt`;
- instante anterior ao lifecycle ou inválido;
- instante igual e posterior a `validUntil`;
- ausência defensiva de `validUntil`;
- estados incompatíveis, incluindo `requested`, `rejected`, `expired` e `accepted`;
- preservação do snapshot revisável;
- imutabilidade do input e dos instantes;
- regressão do módulo e do monorepo.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| marcar como aceita antes da aplicação | Alto | nome explícito, contrato e restrição de uso pós-aplicação |
| aceitar Proposal temporalmente expirada | Alto | exigir `acceptedAt < validUntil` |
| aceitar estado incompatível | Alto | permitir somente origem `ready` |
| perder conteúdo histórico | Alto | espalhar o snapshot e alterar somente estado e instantes |
| confundir finalização com comando cross-context | Alto | manter Itinerary e serviço de aplicação fora dos caminhos permitidos |

## 12. Segurança e privacidade

A operação recebe somente uma Proposal já validada e um instante explícito. Não recebe credencial, ator, payload externo, conteúdo pessoal novo ou autoridade para aplicar mudanças no Itinerary.

## 13. Rollback

Reverter propriedade, operação, export, testes e documentação. Não há migration ou efeito externo.

## 14. Evidências

Evidências locais:

- Prettier dos caminhos alterados e `git diff --check` aprovados;
- 173 documentos e 173 registros validados, com quatro avisos preexistentes;
- Proposal Management com lint e typecheck aprovados e 77 testes verdes;
- lint e typecheck integrais aprovados nos 12 packages do workspace;
- build de produção do Next.js aprovado;
- PostgreSQL e Playwright não executados localmente porque o incremento não altera adapter ou interface e o ambiente não possui `DATABASE_URL` nem Docker; serão cobertos pelo CI.

Evidências de CI:

- run de documentação `30721260255` aprovado;
- run de engenharia `30721260271` aprovado com formatação, documentação, lint, typecheck, migrations PostgreSQL, suíte integral, smoke do servidor, build e 56 E2E responsivos.
