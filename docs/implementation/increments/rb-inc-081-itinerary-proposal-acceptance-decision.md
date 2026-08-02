---
id: RB-INC-081
title: Decision de Aceite de Itinerary Proposal
description: Amplia Decision Intelligence para registrar canonicamente a escolha explícita de aceitar integralmente uma Itinerary Proposal.
document_type: implementation-increment
owner: Decision Intelligence
status: Draft
version: "0.1.0"
created: "2026-08-02"
last_updated: "2026-08-02"
authors:
  - RouteBook Team
tags:
  - implementation
  - decision-intelligence
  - proposal-management
  - itinerary-planning
  - idempotency
related_documents:
  - RB-CORE-0004
  - RB-DOM-001
  - RB-DOM-003
  - RB-DOM-004
  - RB-ADR-027
  - RB-INC-072
  - RB-INC-079
  - RB-INC-080
prerequisites:
  - RB-DOM-001
  - RB-ADR-027
  - RB-INC-072
  - RB-INC-079
  - RB-INC-080
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-081 — Decision de Aceite de Itinerary Proposal

## 1. Objetivo

Representar no domínio de Decision Intelligence a escolha explícita do usuário de aceitar integralmente uma Itinerary Proposal, com contexto rastreável e efeito confirmado.

Issue: [#185](https://github.com/collapsy/Routebook/issues/185).

Branch: `feature/rb-inc-081-itinerary-proposal-acceptance-decision`.

Pull request: [#186](https://github.com/collapsy/Routebook/pull/186).

## 2. Contexto

RB-DOM-001 reconhece aceitar uma Proposal como exemplo oficial de Decision. RB-ADR-027 exige que essa Decision seja registrada na mesma transação que aplica o Itinerary, finaliza a Proposal e confirma a Proposal Application.

O modelo implementado até o RB-INC-080 suportava apenas salvar Lugar, adicionar Lugar ao Itinerary e ignorar Planning Risk. O incremento adiciona o contrato de domínio necessário sem antecipar persistência física ou composição transacional.

## 3. Resultado verificável

- `DecisionType` inclui `accept-itinerary-proposal`;
- option contém a Proposal e os IDs ordenados das Proposed Activities;
- snapshot contém Trip, Itinerary, Proposal, versão-base, fingerprint e instante capturado;
- effect contém Proposal Application, Itinerary, versão resultante e IDs aplicados;
- estruturas e coleções são imutáveis;
- option, snapshot e effect são validados como um único fato consistente;
- decisões existentes permanecem compatíveis.

## 4. Contrato canônico

```text
Decision
├── type: accept-itinerary-proposal
├── chosenOption
│   ├── itineraryProposalId
│   └── proposedActivityIds[]
├── contextSnapshot
│   ├── tripId
│   ├── itineraryId
│   ├── itineraryProposalId
│   ├── baseItineraryVersion
│   ├── requestFingerprint
│   └── capturedAt
└── effect
    ├── proposalApplicationId
    ├── itineraryId
    ├── resultingItineraryVersion
    └── appliedProposedActivityIds[]
```

## 5. Invariantes

- Trip da Decision e do snapshot são iguais;
- Proposal da option e do snapshot são iguais;
- Itinerary do snapshot e do effect são iguais;
- fingerprint é SHA-256 hexadecimal com 64 caracteres;
- versões são inteiros positivos;
- versão resultante é exatamente a versão-base mais um;
- IDs escolhidos são não vazios e únicos;
- IDs aplicados correspondem exatamente aos IDs escolhidos e na mesma ordem;
- effect deve ser `itinerary-proposal-applied`;
- Recommendation relacionada permanece opcional.

## 6. Escopo

- tipos públicos de option, snapshot e effect;
- extensão de `DecisionType` e unions públicas;
- normalização e congelamento;
- validações cruzadas;
- testes de domínio;
- exports públicos;
- documentação, registry e rastreabilidade.

## 7. Fora de escopo

- check constraint e migration da tabela `decisions`;
- serialização e reidratação PostgreSQL;
- repository ou fragment transacional;
- composição do port de aceite;
- Server Action, autorização ou UI.

## 8. Caminhos permitidos

```text
modules/decision-intelligence/src/decision.ts
modules/decision-intelligence/src/itinerary-proposal-decision.test.ts
modules/decision-intelligence/src/index.ts
docs/implementation/increments/rb-inc-081-itinerary-proposal-acceptance-decision.md
docs/implementation/context-packs/rb-inc-081-itinerary-proposal-acceptance-decision.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Critérios de aceite

- [x] novo DecisionType publicado;
- [x] option, snapshot e effect publicados;
- [x] coleções congeladas e ordenadas;
- [x] fingerprint normalizado;
- [x] identidades cruzadas validadas;
- [x] incremento único de versão validado;
- [x] IDs escolhidos e aplicados comparados em ordem;
- [x] tipos existentes preservados;
- [x] exports públicos atualizados;
- [ ] validações finais do CI aprovadas.

## 10. Testes obrigatórios

- criação do fato canônico;
- ausência de Recommendation;
- imutabilidade das coleções;
- normalização de fingerprint;
- Proposal divergente;
- Itinerary divergente;
- versão resultante divergente;
- IDs reordenados ou duplicados;
- fingerprint inválido;
- effect incompatível;
- regressão da suíte histórica de Decision.

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Decision não representar o efeito executado | Alto | effect inclui Application e versão resultante |
| replay produzir contexto ambíguo | Alto | fingerprint e versão-base preservados |
| coleção aplicada divergir da escolha | Alto | igualdade ordenada obrigatória |
| múltiplos incrementos de versão | Alto | regra estrita `base + 1` |
| regressão em decisões existentes | Alto | unions aditivas e suíte histórica preservada |

## 12. Rollback

Remover os novos membros das unions, validações, testes e exports. Nenhum dado ou migration é alterado neste incremento.

## 13. Evidências

As evidências serão registradas após a aprovação dos workflows da PR #186.
