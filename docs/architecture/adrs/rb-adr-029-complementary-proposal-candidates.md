---
id: RB-ADR-029
title: Candidatos complementares e proveniência na Itinerary Proposal
description: Evolui a origem de candidatos da Itinerary Proposal para permitir sugestões complementares do RouteBook sem confundi-las com a seleção explícita do viajante.
document_type: architecture_decision_record
owner: Architecture
status: Draft
version: "0.1.0"
created: "2026-09-21"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [architecture, adr, itinerary-proposal, trip-place-preference, recommendation, provenance]
related_documents: [RB-CORE-0004, RB-PRD-004, RB-DOM-001, RB-DOM-003, RB-UX-001, RB-UX-002, RB-ARC-002, RB-ADR-027, RB-ADR-028, RB-INC-203, RB-INC-207, RB-CTX-207]
prerequisites: [RB-ADR-027, RB-ADR-028]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-ADR-029 — Candidatos complementares e proveniência na Itinerary Proposal

## 1. Status da decisão

**Approved**

A direção funcional foi determinada explicitamente pelo responsável humano do projeto no pedido da Etapa 1 em `2026-09-21`: a seleção do viajante deve continuar sendo a principal fonte da Proposal, mas o RouteBook pode sugerir lugares complementares quando escolhas insuficientes deixarem uma lacuna relevante, desde que a origem seja explícita e nada seja aplicado silenciosamente.

Este ADR formaliza a fronteira arquitetural dessa decisão. Ele evolui somente a regra de origem dos candidatos da seção 6.2 do RB-ADR-028; as demais decisões do RB-ADR-028 permanecem vigentes.

## 2. Contexto

RB-ADR-028 e RB-INC-203 tornaram `TripPlacePreference` a fonte autoritativa da seleção do viajante e removeram Recommendation/Discovery como fonte automática da Proposal. Essa decisão eliminou inclusão silenciosa e consolidou:

```text
WANT
+ MAYBE com opt-in
→ candidatos escolhidos pelo viajante
```

A nova jornada guiada precisa preservar essa autoridade sem obrigar o usuário a descobrir manualmente todos os lugares necessários para uma composição útil. Uma seleção pequena deve continuar válida e períodos livres devem continuar válidos; porém, quando houver uma lacuna funcional real, uma Proposal pode ser mais útil se apresentar uma opção complementar claramente identificada.

## 3. Problema

Como permitir sugestões complementares sem:

- transformar Recommendation em decisão;
- transformar sugestão em TripPlacePreference;
- reinserir Discovery silenciosa na geração;
- preencher artificialmente todos os espaços;
- ocultar por que um Place apareceu;
- enfraquecer o aceite explícito da Proposal?

## 4. Decisão

A Itinerary Proposal passa a admitir dois grupos semanticamente distintos de candidatos:

```text
USER_SELECTED
ROUTEBOOK_RECOMMENDED
```

### 4.1 USER_SELECTED

Representa candidatos derivados da seleção explícita da Trip:

- `WANT` participa por padrão;
- `MAYBE` participa somente quando autorizado para aquela geração;
- `NOT_INTERESTED` nunca participa;
- não avaliado não participa como escolha do usuário;
- `MUST_DO` aumenta precedência sem autorizar violação de restrições.

A seleção continua sendo a fonte autoritativa das escolhas do viajante.

### 4.2 ROUTEBOOK_RECOMMENDED

Representa Place não selecionado que o RouteBook apresenta apenas dentro da Proposal para resolver uma lacuna justificável.

Um candidato complementar:

- não cria ou altera `TripPlacePreference`;
- não pode usar Place com `NOT_INTERESTED`;
- não pode ser apresentado como “selecionado por você”;
- não se torna Activity antes do aceite;
- deve possuir origem e Justificativa estruturadas;
- deve respeitar Planning Role, contexto, evidências conhecidas e ReplanningWindow;
- deve ser opcional e rejeitável individualmente;
- não pode existir apenas para aumentar densidade.

## 5. Gatilhos permitidos

Uma recomendação complementar pode ser considerada quando existir benefício funcional real, por exemplo:

- cobrir contexto de refeição quando a seleção não possui opção adequada;
- aproveitar proximidade de uma região já escolhida;
- oferecer experiência compatível com interesses e janela disponível;
- resolver lacuna relevante causada por inviabilidade de um candidato selecionado;
- apresentar alternativa contextual quando o usuário explicitamente permite sugestões.

A existência de tempo livre, isoladamente, não é gatilho suficiente.

## 6. Proveniência e explicabilidade

Cada candidato da Proposal deve permitir distinguir, conceitualmente:

```text
origin = USER_SELECTED | ROUTEBOOK_RECOMMENDED
```

Para `ROUTEBOOK_RECOMMENDED`, a Proposal deve carregar razão sustentada por evidência conhecida, como:

```text
NEAR_SELECTED_PLACES
MEAL_CONTEXT_GAP
MATCHES_TRIP_INTERESTS
REGIONAL_CONTINUITY
REPLACES_INELIGIBLE_SELECTION
```

A implementação poderá evoluir os nomes técnicos, mas não poderá perder a distinção semântica nem a proveniência.

## 7. Planejamento por papel

A taxonomia factual de Place continua separada do Planning Role:

```text
EXPERIENCE
FOOD
NIGHTLIFE
OTHER
```

Planning Role informa como o candidato participa da composição; não redefine a categoria do Place.

- EXPERIENCE participa de blocos de experiência/passeio.
- FOOD é preferencialmente usado em contexto de refeição.
- NIGHTLIFE é considerado em janelas noturnas e somente quando compatível com o contexto da Trip.
- OTHER exige política explícita antes de composição especializada.

## 8. Densidade e períodos livres

Densidade é limite e contexto, nunca meta.

São resultados válidos:

- um dia com poucos itens;
- um período livre;
- uma Proposal sem complemento;
- uma Proposal vazia;
- escolhas do usuário não planejadas com motivo explicado.

Nenhum algoritmo deve inserir candidato complementar somente porque existe capacidade matemática.

## 9. Relação com Minha seleção

Minha seleção permanece projeção de `TripPlacePreference`.

Aceitar uma sugestão complementar na Proposal pode criar Activity, mas não transforma automaticamente esse Place em `WANT`. Qualquer mudança futura da preferência deve ser uma ação explícita e separada.

O estado “planejado” continua derivado do Itinerary.

## 10. Relação com replanejamento

Em `generationScope = REPLAN`, candidatos complementares somente podem tocar a janela futura elegível definida por `ReplanningWindow`.

Passado, trecho transcorrido do Dia atual, Activities protegidas e Free Periods protegidos permanecem intocáveis.

## 11. Consequências

### Positivas

- preserva autoridade da seleção do usuário;
- permite Proposal útil com seleção pequena;
- mantém Recommendation separada de Decision;
- torna a origem de cada candidato auditável;
- evita que “preencher o dia” vire objetivo do produto.

### Negativas

- Proposal precisará representar proveniência e razões de inclusão;
- o gerador atual do RB-INC-203 não implementa o novo conjunto complementar;
- critérios de elegibilidade e evidência exigirão incremento próprio;
- UX deverá diferenciar visualmente origens sem induzir aceite.

## 12. Compatibilidade

- RB-ADR-027 permanece íntegro: Proposal só altera Itinerary após aceite.
- RB-ADR-028 permanece vigente, exceto pela exclusividade de candidatos da seção 6.2.
- RB-INC-203 representa o estado executável atual e deverá ser evoluído em etapa posterior.
- Recommendation/Discovery não voltam a ser seleção do usuário.
- Nenhuma migration ou alteração executável é autorizada por este ADR.

## 13. Rollback

Antes da implementação executável, o rollback consiste em superseder este ADR e manter a regra estrita do RB-ADR-028/RB-INC-203.

Depois da implementação, qualquer rollback deve preservar proveniência de Proposals persistidas e nunca reinterpretar `ROUTEBOOK_RECOMMENDED` como escolha explícita do viajante.
