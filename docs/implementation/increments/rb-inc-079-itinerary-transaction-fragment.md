---
id: RB-INC-079
title: Fragment Transacional de Itinerary
description: Implementa leitura, validação, transformação e persistência integral do Itinerary sobre o executor PostgreSQL escopado.
document_type: implementation-increment
owner: Data and Persistence
status: Draft
version: "0.1.0"
created: "2026-08-02"
last_updated: "2026-08-02"
authors:
  - RouteBook Team
tags:
  - implementation
  - database
  - transaction
  - itinerary-planning
  - proposal-management
related_documents:
  - RB-CORE-0004
  - RB-ARC-003
  - RB-ARC-004
  - RB-DOM-003
  - RB-DOM-004
  - RB-ADR-027
  - RB-INC-070
  - RB-INC-072
  - RB-INC-073
  - RB-INC-074
  - RB-INC-078
prerequisites:
  - RB-ADR-027
  - RB-INC-070
  - RB-INC-072
  - RB-INC-073
  - RB-INC-074
  - RB-INC-078
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-079 — Fragment Transacional de Itinerary

## 1. Objetivo

Implementar o fragment transacional responsável por carregar o Itinerary canônico, validar identidade e versão, aplicar integralmente os itens do aceite e persistir o aggregate resultante sobre o mesmo executor PostgreSQL escopado.

Issue: [#181](https://github.com/collapsy/Routebook/issues/181).

Branch: `feature/rb-inc-079-itinerary-transaction-fragment`.

Pull request: [#182](https://github.com/collapsy/Routebook/pull/182).

## 2. Contexto

O RB-INC-070 publicou a transformação pura `applyProposalItemsToItinerary`. O RB-INC-072 definiu o comando e os erros públicos do aceite. O RB-INC-078 adaptou o repository de Itinerary ao executor transacional escopado.

O incremento encapsula esses contratos em um fragment de infraestrutura que poderá ser composto pela unidade transacional do RB-INC-074 sem conhecer Proposal Application, lifecycle da Proposal ou Decision.

## 3. Resultado verificável

- interface `ItineraryTransactionFragment`;
- factory de repository escopado;
- leitura por Trip ID;
- validação de Trip, Itinerary ID e versão antes do write;
- transformação integral pelo domínio de Itinerary Planning;
- uso de `decidedAt` como instante canônico;
- persistência única do aggregate resultante;
- resultado canônico com versão resultante e IDs aplicados;
- propagação de erros de domínio e falhas técnicas sem retry.

## 4. Fluxo

```mermaid
flowchart LR
    Command[AcceptItineraryProposalCommand] --> Load[Carregar Itinerary]
    Load --> Validate[Validar identidade e versão]
    Validate --> Apply[applyProposalItemsToItinerary]
    Apply --> Save[Persistir aggregate]
    Save --> Result[Itinerary e ApplyProposalItemsResult]
```

## 5. Contrato do fragment

```text
apply(command)
├── repository.findByTripId(command.tripId)
├── itinerary-not-found para ausência ou identidade divergente
├── itinerary-version-mismatch para versão divergente
├── applyProposalItemsToItinerary(..., now=command.decidedAt)
├── repository.save(result.itinerary)
└── retorna aggregate persistido e resultado canônico
```

## 6. Escopo

- contratos do fragment, repository e factory;
- validações públicas do aceite;
- chamada ao domínio puro;
- persistência escopada;
- testes unitários;
- export público;
- documentação, registry e rastreabilidade.

## 7. Fora de escopo

- composição completa de `ApplyItineraryProposalTransaction`;
- Proposal Application;
- lifecycle da Itinerary Proposal;
- criação ou persistência de Decision;
- lock explícito ou isolation level;
- schema, migration, Server Action, autorização ou UI.

## 8. Caminhos permitidos

```text
packages/database/src/itinerary-transaction-fragment.ts
packages/database/src/itinerary-transaction-fragment.test.ts
packages/database/src/index.ts
docs/implementation/increments/rb-inc-079-itinerary-transaction-fragment.md
docs/implementation/context-packs/rb-inc-079-itinerary-transaction-fragment.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] factory recebe o executor escopado;
- [x] leitura usa a Trip do comando;
- [x] ausência e identidade divergente produzem `itinerary-not-found`;
- [x] versão divergente produz `itinerary-version-mismatch` antes do write;
- [x] transformação usa `applyProposalItemsToItinerary`;
- [x] `decidedAt` determina o instante da aplicação;
- [x] erro de domínio não produz write;
- [x] aggregate resultante é persistido exatamente uma vez;
- [x] falhas técnicas são propagadas sem retry;
- [x] export público foi atualizado;
- [x] validações finais do CI aprovadas.

## 10. Testes obrigatórios

- sucesso integral;
- identidade do executor e factory;
- Itinerary ausente;
- identidade divergente;
- versão divergente;
- erro de domínio sem write;
- falha de leitura;
- falha de persistência;
- dependências e comando inválidos.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| write ocorrer antes da validação | Alto | leitura e validações antecedem a transformação |
| transformação parcial | Alto | função pura integral do RB-INC-070 |
| instante divergente | Alto | `decidedAt` passado explicitamente como `now` |
| nested transaction | Alto | repository escopado do RB-INC-078 |
| erro de domínio virar falha técnica | Médio | propagação sem conversão genérica |

## 12. Rollback

Remover o fragment, seus testes e exports. Nenhuma migration ou transformação de dados é necessária.

## 13. Evidências

- Documentation Validation `30752064982`: aprovada;
- Engineering Validation `30752064966`: aprovada;
- 198 documentos encontrados e registrados;
- formatação, documentação, lint e typecheck aprovados;
- migrations PostgreSQL existentes aplicadas com sucesso;
- suíte integral aprovada, incluindo os sete cenários do fragment;
- smoke do servidor de desenvolvimento aprovado;
- build de produção aprovado;
- 56 testes Playwright responsivos aprovados;
- registry e matriz de rastreabilidade sincronizados com `RB-INC-079` e `RB-CTX-079`;
- HEAD validado: `ca9e6c8c739dbbad11d9b59a782c32cb813411c2`.
