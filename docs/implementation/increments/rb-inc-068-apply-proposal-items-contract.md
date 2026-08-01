---
id: RB-INC-068
title: Contrato Público ApplyProposalItems
description: Define o contrato público do Itinerary Planning para receber itens aceitos de uma Itinerary Proposal.
document_type: implementation-increment
owner: Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-planning
  - proposal-management
  - module-contract
related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-DATA-001
  - RB-DATA-002
  - RB-INC-066
  - RB-INC-067
prerequisites:
  - RB-INC-066
  - RB-INC-067
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-068 — Contrato Público ApplyProposalItems

## 1. Objetivo

Definir no Itinerary Planning o contrato público `ApplyProposalItems`, permitindo que uma futura orquestração solicite a aplicação de Proposed Activities sem depender de internals do módulo ou alterar diretamente seu repositório.

Issue: [#152](https://github.com/collapsy/Routebook/issues/152).

Branch: `codex/rb-inc-068-apply-proposal-items-contract`.

Pull request: [#153](https://github.com/collapsy/Routebook/pull/153).

## 2. Problema

Proposal Management já representa e persiste uma Proposal `accepted`, mas ainda não existe um contrato público pertencente ao Itinerary Planning para receber os itens que deverão ser aplicados antes dessa finalização.

Sem essa fronteira, uma futura implementação poderia acoplar Proposal Management aos internals ou ao repositório do Itinerary Planning.

## 3. Resultado verificável

- comando público contém identidades, versão esperada, chave idempotente e itens;
- operações `add`, `move`, `update` e `remove` possuem contratos estruturais distintos;
- referências exigidas por cada operação são validadas;
- dados comuns de Activity respeitam os tipos públicos do Itinerary Planning;
- comando e itens normalizados são imutáveis;
- port publica resultado com versão resultante e IDs aplicados;
- módulo não depende de Proposal Management.

## 4. Invariantes

1. `ApplyProposalItems` pertence ao Itinerary Planning;
2. o contrato não aceita acesso direto ao repository de Itinerary;
3. `expectedItineraryVersion` é positiva;
4. `idempotencyKey` é obrigatória;
5. cada operação exige somente suas referências canônicas;
6. Proposed Activity continua sem identidade canônica de Activity;
7. criar o comando não altera Itinerary, Proposal ou Decision.

## 5. Escopo

- tipos públicos do comando, itens e resultado;
- port assíncrono `ApplyProposalItems`;
- normalização e validação determinística da fronteira;
- export público do package;
- testes unitários;
- documentação, registry e rastreabilidade.

## 6. Fora de escopo

- mutação efetiva ou persistência do Itinerary;
- validação de autorização, versão atual, Trip Context, Restrictions ou Planning Conflicts;
- proteção operacional de Activity `fixed` e Free Period `protected`;
- Proposal Application persistida ou Decision;
- coordenação transacional entre módulos;
- escolha ou aprovação de ADR;
- API, Server Action ou UI;
- aceite parcial.

## 7. Context Pack

`docs/implementation/context-packs/rb-inc-068-apply-proposal-items-contract.md`

## 8. Caminhos permitidos

```text
modules/trip-management/src/proposal-application.ts
modules/trip-management/src/proposal-application.test.ts
modules/trip-management/src/index.ts
docs/implementation/increments/rb-inc-068-apply-proposal-items-contract.md
docs/implementation/context-packs/rb-inc-068-apply-proposal-items-contract.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] contrato é propriedade de Itinerary Planning e não importa Proposal Management;
- [x] identidades, versão esperada e chave idempotente são normalizadas e validadas;
- [x] `add` exige Dia alvo e dados da nova Activity;
- [x] `move` exige Activity de origem e Dia alvo;
- [x] `update` exige Activity de origem e dados alteráveis;
- [x] `remove` exige Activity de origem;
- [x] tipos, horário, duração, ordem e flexibilidade inválidos são rejeitados;
- [x] comando, itens e resultado expõem coleções readonly;
- [x] nenhum estado canônico é alterado;
- [x] documentação, lint, tipagem, testes e build permanecem verdes.

## 10. Testes obrigatórios

- normalização de comando com cada operação;
- imutabilidade do comando e dos itens;
- rejeição de campos raiz inválidos;
- rejeição das referências obrigatórias por operação;
- rejeição de dados de Activity inválidos;
- aceitação explícita de coleção vazia, pois Proposal vazia é canônica;
- validações documentais e do monorepo.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| acoplamento reverso com Proposal Management | Alto | contrato e tipos pertencem a Itinerary Planning |
| contrato prometer aplicação já implementada | Alto | port sem adapter e fora de escopo explícito |
| itens ambíguos | Médio | união discriminada por operação |
| antecipar estratégia transacional | Alto | nenhuma persistência ou orquestração neste recorte |

## 12. Segurança e privacidade

O contrato recebe somente identificadores técnicos e dados mínimos de Activity. Não adiciona Provider, secret, dado pessoal ou log.

## 13. Rollback

Remover os novos tipos, validator e export antes de haver consumidores. Nenhum dado persistido é alterado.

## 14. Evidências

Evidências locais:

- 177 documentos e 177 registros validados, com quatro avisos preexistentes;
- lint e typecheck do package Itinerary Planning aprovados;
- 56 testes do Itinerary Planning aprovados;
- lint e typecheck integrais aprovados nos 12 packages do workspace;
- build de produção do Next.js aprovado;
- Prettier dos caminhos alterados e `git diff --check` aprovados;
- PostgreSQL e Playwright não executados localmente porque o incremento não altera persistência ou interface; permanecem cobertos pelo CI.

Evidências de CI:

- run [30722787286](https://github.com/collapsy/Routebook/actions/runs/30722787286) validou a documentação;
- run [30722787307](https://github.com/collapsy/Routebook/actions/runs/30722787307) aprovou formatação, documentação, lint, typecheck, migrations PostgreSQL, suíte integral, smoke do servidor, build e 56 E2E concluídos; 55 passaram diretamente e 1 passou no retry, marcado como flaky fora do recorte.
