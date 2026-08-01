---
id: RB-INC-043
title: Núcleo de Planning Conflict e Detecção Determinística
description: Introduz o agregado PlanningConflict, sua detecção determinística, ciclo de vida inicial, persistência e isolamento por Viagem.
document_type: implementation-increment
owner: Planning Assurance
status: Draft
version: "0.1.0"
created: "2026-07-31"
last_updated: "2026-07-31"
authors:
  - RouteBook Team
tags:
  - planning-assurance
  - planning-conflict
  - deterministic-detection
  - itinerary
  - persistence
  - vertical-slice
related_documents:
  - RB-DEL-001
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-INC-042
prerequisites:
  - RB-INC-042
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-043 — Núcleo de Planning Conflict e Detecção Determinística

## 1. Objetivo

Introduzir o núcleo canônico de `PlanningConflict` e detectar conflitos de planejamento de forma determinística, reproduzível e isolada por Viagem, sem resolver, ignorar ou alterar silenciosamente o Roteiro.

Este incremento inicia a Fase 6 — Planning Assurance definida pelo `RB-DEL-001`.

## 2. Hipótese

Conflitos verificáveis com dados internos podem ser detectados cedo, explicados com evidências rastreáveis e persistidos sem depender de IA ou Providers externos.

## 3. Resultado utilizável

Ao final do incremento, a aplicação deverá possuir uma base de domínio e persistência capaz de:

- representar conflitos de planejamento com identidade própria;
- detectar conflitos temporais e estruturais conhecidos;
- produzir resultados estáveis para os mesmos inputs;
- deduplicar conflitos equivalentes;
- invalidar ou superseder resultados obsoletos;
- reconstruir integralmente conflitos persistidos;
- preservar o Roteiro sem mutações silenciosas.

## 4. Escopo

### 4.1 Agregado PlanningConflict

O agregado deverá conter:

- `PlanningConflictId`;
- `TripId`;
- tipo;
- severidade;
- estado;
- Context Snapshot;
- evidências;
- referências a Dias e Activities relacionadas;
- instante de detecção;
- versão da política;
- fingerprint contextual.

### 4.2 Tipos iniciais

- sobreposição de horários entre Activities do mesmo Dia;
- Activity fora do período da Viagem;
- Activity incompatível com o Dia ao qual pertence;
- intervalo temporal inconsistente;
- dia excessivamente carregado por limite explícito.

### 4.3 Estados

- `detected`;
- `invalidated`;
- `superseded`.

Os estados `resolved` e `ignored` permanecem fora desta fatia porque exigem ação explícita do usuário e integração com Decision.

## 5. Regras determinísticas

- mesmos inputs e mesma versão de política produzem os mesmos conflitos;
- nenhuma aleatoriedade participa da detecção ou ordenação;
- limites e severidades são constantes nomeadas;
- conflitos são ordenados por tipo, Dia e identificadores relacionados;
- intervalos adjacentes não são sobreposição;
- conflito equivalente ativo não pode ser duplicado;
- mudança material de contexto invalida ou supersede o conflito anterior;
- ausência de dado não autoriza inferência.

## 6. Ownership e fronteiras

`Planning Assurance` é proprietário de `PlanningConflict` e de suas políticas de detecção.

`Trip Management` permanece proprietário de Trip, Itinerary, Day e Activity.

O módulo de Planning Assurance poderá ler snapshots desses conceitos, mas não poderá alterar seus agregados durante a detecção.

`@routebook/database` implementará adapters e transações sem transferir regras de domínio para Drizzle.

## 7. Persistência

A implementação deverá:

- criar migration incremental posterior ao RB-INC-042;
- adicionar schema Drizzle;
- definir `PlanningConflictRepository` no módulo proprietário;
- implementar adapter em `@routebook/database`;
- persistir snapshot e evidências em estruturas versionadas;
- garantir unicidade de conflito ativo equivalente;
- preservar isolamento por `TripId`;
- rejeitar referências cross-trip;
- acompanhar cascata da Viagem sem deixar registros órfãos.

## 8. Atomicidade e recalculação

A detecção e persistência de uma avaliação deverão ocorrer como uma unidade coerente.

Em recalculação:

1. carregar o estado canônico da Viagem e do Roteiro;
2. construir snapshot determinístico;
3. detectar conflitos;
4. comparar fingerprints ativos;
5. reutilizar equivalentes;
6. superseder ou invalidar obsoletos;
7. persistir novos conflitos;
8. confirmar a transação.

Falha parcial deverá preservar o estado anterior.

## 9. Critérios de aceite

- [ ] `PlanningConflictId` possui identidade canônica;
- [ ] agregado é independente de Drizzle, Next.js e React;
- [ ] detecção é reproduzível;
- [ ] sobreposição parcial e total é detectada;
- [ ] intervalos adjacentes não geram falso positivo;
- [ ] Activity fora do período ou do Dia é detectada;
- [ ] intervalo inválido é detectado;
- [ ] carga diária usa limite explícito e testado;
- [ ] ordenação é estável;
- [ ] conflito equivalente ativo não é duplicado;
- [ ] mudança material invalida ou supersede conflito anterior;
- [ ] detecção não altera Itinerary ou Activity;
- [ ] referências cross-trip são rejeitadas;
- [ ] round trip preserva todo o agregado;
- [ ] migration funciona em banco limpo e sobre migrations anteriores;
- [ ] testes cobrem domínio, persistência, deduplicação e isolamento.

## 10. Estratégia de testes

### Domínio

- identidade e validação;
- tipos, severidades e evidências;
- transições de estado;
- fingerprint e ordenação;
- regras de sobreposição;
- limites de carga diária.

### Aplicação

- composição do snapshot;
- detecção repetida com mesmos inputs;
- recalculação com mudança material;
- ausência de mutação do Roteiro.

### Persistência

- round trip completo;
- unicidade ativa;
- invalidação e supersessão;
- isolamento cross-trip;
- cascatas;
- rollback.

### Engenharia

- formatação;
- lint;
- typecheck;
- migrations;
- testes;
- smoke;
- build;
- E2E existente sem regressão.

## 11. Riscos

- misturar conflito com Recommendation;
- tratar estimativa como fato;
- resolver conflito durante detecção;
- duplicar conflitos a cada recálculo;
- criar limites implícitos;
- copiar dados pessoais para snapshots;
- acoplar domínio à persistência física.

## 12. Fora de escopo

- interface final de conflitos;
- resolução;
- ignorar ou restaurar risco;
- Decision de resolução;
- rota viária, trânsito ou duração por Provider;
- disponibilidade e horário externo;
- IA, LLM, agente ou embedding;
- Itinerary Proposal;
- notificações e analytics avançado.

## 13. Evidências de conclusão

Este incremento somente poderá sair de `Draft` quando a PR possuir:

- SHA final verde;
- Documentation Validation concluída com sucesso;
- Engineering Validation concluída com sucesso;
- migrations aplicadas;
- testes de domínio e persistência aprovados;
- build e suíte E2E existentes aprovados;
- registry e traceability atualizados.
