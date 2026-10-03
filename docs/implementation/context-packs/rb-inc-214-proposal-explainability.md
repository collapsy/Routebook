---
id: RB-CTX-214
title: Context Pack do RB-INC-214 — Explicabilidade da Proposal
description: Orienta a implementação dos outcomes por candidato e sua apresentação na revisão da Itinerary Proposal.
document_type: implementation-context-pack
owner: Proposal Management and Experience
status: Draft
version: "0.1.0"
created: "2026-10-02"
last_updated: "2026-10-02"
authors: [RouteBook Team]
tags: [implementation, context-pack, itinerary-proposal, explainability]
related_documents: [RB-INC-214, RB-INC-207, RB-INC-208, RB-INC-213, RB-BR-PRP-014, RB-ADR-029]
prerequisites: [RB-INC-213]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-214 — Explicabilidade da Proposal

## Missão

Fechar o gap entre o contrato de domínio de resultados explicáveis e o comportamento da Proposal Management e da revisão web, sem criar uma fonte de recomendação ou aplicar mudanças ao Itinerary.

## Leitura obrigatória

1. `AGENTS.md`, Bible e `docs/README.md`;
2. RB-INC-214, RB-INC/CTX-207, RB-INC/CTX-208 e RB-INC/CTX-213;
3. RB-BR-PRP-013/014 e definição de `ProposalCandidateOutcome` em `docs/domain/domain-model.md`;
4. RB-ADR-029 e fluxo de revisão da Proposal em UX/Product;
5. `itinerary-proposal.ts`, gerador determinístico, geração autoritativa, repository JSONB e projeção/componente web;
6. Registry e matriz de rastreabilidade.

## Delimitação semântica

“Considerado” significa candidato elegível presente no snapshot da geração. `NOT_INTERESTED` não pertence ao conjunto. `MAYBE` sem consentimento de inclusão é uma exclusão explicável por `MAYBE_NOT_REQUESTED`, sem enviar Place ao gerador. Para candidatos elegíveis que não couberam, o gerador atual só pode afirmar `NO_CAPACITY`; não deduzir conflito temporal, fechamento ou outro fato que não tenha sido carregado/avaliado.

Reasons apresentados ao usuário devem vir de uma tabela de rótulos determinística para códigos canônicos. Não expor códigos como se fossem explicações suficientes e não inventar uma causa mais específica que a evidência disponível.

## Compatibilidade e limites

- `generationContext.schemaVersion` segue 1; `outcomes` é opcional e aditivo.
- Persistência continua na coluna JSONB `generation_context`; não adicionar migration.
- Ausência de outcomes significa snapshot legado/sem resultado estruturado, não “nenhuma exclusão”. A UI deve tratar esse caso sem afirmar completude.
- A geração atual só fornece `USER_SELECTED`; a interface permanece preparada para a proveniência existente `ROUTEBOOK_RECOMMENDED`, sem fabricá-la.
- Exclusões só podem ser apresentadas se ligadas a candidates e Places capturados na Proposal.
- Nenhuma alteração nos documentos canônicos de domínio: o contrato já foi aprovado e definido.

## Caminhos autorizados

Use exatamente os caminhos listados em “Caminhos permitidos” no RB-INC-214. Os documentos de Domain, Product, UX e Architecture são somente leitura. Se a execução real exigir qualquer caminho adicional, pare, explique a necessidade e atualize formalmente o incremento/Context Pack antes da edição.

## Verificações

- unit: validação de outcomes e decisão de capacidade;
- integração: geração autoritativa e round-trip no repository JSONB;
- UI: origem, inclusão, exclusão, vazio legado e labels acessíveis;
- E2E: revisão com inclusões/exclusões sem aplicação automática;
- documentação: `node scripts/validate-docs.mjs`.

## Gate humano

Abra PR com evidências e pare antes de mergear. CI/Preview não substituem autorização humana para integração na `main`.
