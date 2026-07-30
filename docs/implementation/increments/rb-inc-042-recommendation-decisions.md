---
id: RB-INC-042
title: Decisions e Ações sobre Recommendations
description: Define o incremento responsável por transformar Recommendations em escolhas explícitas e efeitos canônicos idempotentes.
document_type: implementation-increment
owner: Decision Intelligence
status: Draft
version: "0.1.0"
created: "2026-07-30"
last_updated: null
authors:
  - RouteBook Team
tags:
  - implementation
  - recommendations
  - decisions
  - itinerary
  - saved-places
related_documents:
  - RB-INC-038
  - RB-INC-039
  - RB-INC-040
  - RB-INC-041
prerequisites:
  - RB-INC-041
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-042 — Decisions e Ações sobre Recommendations

## 1. Objetivo

Permitir que o usuário transforme uma Recommendation em uma escolha explícita, salvando o Lugar ou adicionando-o ao Roteiro sem mutação silenciosa, duplicação ou aceitação parcial.

## 2. Resultado esperado

O incremento deve introduzir o núcleo mínimo de `Decision` e coordenar, de forma transacional e idempotente, as ações executadas sobre uma Recommendation.

A Recommendation somente poderá ser marcada como `accepted` depois que o efeito canônico escolhido tiver sido concluído com sucesso e estiver associado a uma `Decision` válida.

## 3. Ações incluídas

### 3.1 Salvar Lugar

- reutilizar `@routebook/saved-places`;
- preservar idempotência por `(TripId, PlaceId)`;
- não criar Activity automaticamente;
- registrar a Decision associada;
- aceitar a Recommendation somente após a persistência canônica.

### 3.2 Adicionar ao Roteiro

- exigir seleção explícita do Dia;
- manter horário e duração opcionais;
- reutilizar `addActivity` e as invariantes do `Itinerary`;
- não inferir Dia, horário, duração ou Meio de transporte;
- não remover o Lugar dos salvos;
- não preencher Free Period protegido;
- registrar a Decision e aceitar a Recommendation somente após a operação canônica.

## 4. Núcleo mínimo de Decision

A entidade deverá representar, no mínimo:

- `DecisionId`;
- `TripId`;
- `RecommendationId` opcional;
- ator local autorizado já existente na Viagem;
- instante;
- tipo;
- opção escolhida;
- Context Snapshot relevante;
- efeito executado, quando aplicável;
- chave de idempotência para reenvios.

O ator será o participante local com papel `owner` persistido na `Trip`. A ausência de autenticação real permanece como limitação explícita.

## 5. Invariantes

- não aceitar Recommendation quando o efeito falhar;
- não duplicar Decisions em reenvios;
- não duplicar Saved Places;
- não duplicar Activities no reenvio da mesma Decision;
- preservar o estado anterior em falha parcial;
- rejeitar Recommendation expirada, invalidada ou superseded;
- rejeitar ações cross-trip;
- rejeitar Recommendation sem Decision quando a transição exigir aceitação;
- manter Decision Intelligence independente de Drizzle, Next.js e React.

## 6. Atomicidade

Operações envolvendo Recommendation, Decision, Saved Place ou Itinerary deverão ser coordenadas em transação no adapter de persistência.

A ordem lógica será:

1. validar Trip, ator, Recommendation e estado atual;
2. resolver a chave de idempotência;
3. executar o efeito canônico escolhido;
4. persistir ou relacionar a Decision;
5. marcar a Recommendation como `accepted`;
6. confirmar a transação.

Qualquer falha deve provocar rollback integral.

## 7. Critérios de aceite

- [ ] salvar é idempotente;
- [ ] adicionar ao Roteiro não duplica no reenvio da mesma Decision;
- [ ] aceitar gera ou relaciona uma Decision;
- [ ] Recommendation somente fica `accepted` após o efeito concluir;
- [ ] falha não deixa Recommendation aceita nem Decision concluída indevidamente;
- [ ] rejeitar não altera Place, Saved Place ou Itinerary;
- [ ] estados expirado, invalidado e superseded bloqueiam aceitação;
- [ ] ações cross-trip são rejeitadas;
- [ ] feedback e persistência sobrevivem à recarga;
- [ ] salvar não cria Activity;
- [ ] adicionar exige escolha explícita do Dia;
- [ ] testes cobrem atomicidade, rollback e idempotência.

## 8. Testes obrigatórios

- criação e identidade de Decision;
- ator local, instante, tipo, opção e snapshot;
- Recommendation opcional;
- aceitação somente com Decision;
- salvar idempotente;
- adicionar ao Roteiro idempotente pela mesma Decision;
- falha antes e durante a transação;
- rollback de estado parcial;
- cross-trip;
- estados terminais bloqueados;
- Playwright desktop e mobile cobrindo ignorar, recarregar, salvar, verificar Salvos, adicionar com Dia explícito, verificar Roteiro e recarregar.

## 9. Fora de escopo

- autenticação completa;
- Decision Outcome e Decision Quality avançados;
- propostas automáticas;
- Planning Conflict;
- LLM, agentes, embeddings ou runtime de IA;
- notificações, analytics avançado, jobs ou cache distribuído.

## 10. Estratégia de branch

- branch: `feature/rb-inc-042-recommendation-decisions`;
- base: `feature/rb-inc-041-recommendations-experience`;
- origem: HEAD verde `19b15be53f4f4b8cd4e927ceeb6f0dcb1e488f99`;
- PR Draft empilhada;
- não realizar merge individual.
