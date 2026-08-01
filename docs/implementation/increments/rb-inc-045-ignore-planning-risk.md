---
id: RB-INC-045
title: Ignorar Risco de Planejamento
description: Permite aceitar conscientemente um Planning Conflict de severidade risk, com Decision explícita, persistência atômica e histórico preservado.
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
  - decision
  - idempotency
  - itinerary-review
  - vertical-slice
related_documents:
  - RB-DEL-001
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-ARC-002
  - RB-ARC-004
  - RB-UX-003
  - RB-UX-005
  - RB-ADR-002
  - RB-ADR-003
  - RB-ADR-005
  - RB-ADR-006
  - RB-ADR-010
  - RB-ADR-011
  - RB-INC-044
prerequisites:
  - RB-INC-044
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-045 — Ignorar Risco de Planejamento

## 1. Objetivo

Permitir que o Organizador da Viagem registre uma decisão consciente de ignorar um `PlanningConflict` aberto de severidade `risk` na Revisão de Conflitos, sem corrigir a condição, esconder erros bloqueantes ou perder sua rastreabilidade.

## 2. Decisão humana registrada

O recorte foi aprovado explicitamente para:

- implementar `IgnorePlanningRisk` somente para severidade `risk`;
- registrar uma `Decision` explícita;
- preservar contexto, evidências e histórico;
- não escolher nem implementar estratégia de restauração neste incremento.

`RestoreIgnoredPlanningRisk` permanece para um incremento posterior porque o ciclo de vida canônico permite reabrir o mesmo agregado ou criar um novo `PlanningConflict`. Essa escolha deverá ser registrada antes da implementação.

## 3. Resultado utilizável

Na Revisão de Conflitos, o usuário poderá abrir a confirmação de um Risco, reconhecer que a condição continuará existindo e confirmar `Ignorar risco`. Após sucesso, o Risco deixará a lista de itens abertos e permanecerá auditável com a `Decision` que autorizou a transição.

## 4. Domínio

### 4.1 Transição

`IgnorePlanningRisk` deverá:

- aceitar somente `PlanningConflict` em estado `open`;
- aceitar somente severidade `risk`;
- exigir instante válido e `DecisionId` não vazio;
- produzir estado `ignored`;
- preservar todos os snapshots e evidências anteriores;
- correlacionar a mudança a `DecisionRecorded`.

`ignored` significa risco conhecido e aceito. Não significa `resolved`.

### 4.2 Decision

A `Decision` deverá registrar:

- Trip;
- ator responsável;
- instante;
- opção `ignore-planning-risk` e `PlanningConflictId`;
- snapshot mínimo do conflito e do Roteiro avaliados;
- efeito `planning-conflict-ignored`;
- chave de idempotência.

As regras determinísticas desta fatia não exigem justificativa textual adicional. A confirmação explícita é obrigatória.

## 5. Persistência e reconciliação

- `Decision` e transição do conflito deverão ocorrer na mesma transação;
- repetição equivalente deverá devolver o resultado persistido;
- reutilização divergente da chave deverá ser rejeitada;
- a referência da `Decision` no conflito deverá ser íntegra e única;
- a migration deverá aceitar o novo tipo de `Decision` e o estado `ignored`;
- uma condição ignorada com fingerprint equivalente não deverá reaparecer como `open`;
- se o contexto da mesma linhagem mudar, a condição ignorada anterior poderá ser `superseded` por um novo conflito aberto;
- se a condição deixar de ser detectada, o conflito ignorado poderá ser `invalidated`, preservando os dados da decisão anterior.

## 6. Experiência

- exibir `Ignorar risco` apenas em itens de severidade `risk`;
- manter Erros sem ação de ignorar;
- explicar que ignorar não corrige a condição;
- exigir confirmação explícita antes do envio;
- comunicar estado pendente, sucesso e falha recuperável;
- recalcular a Revisão após sucesso;
- preservar teclado, foco visível, semântica e responsividade.

## 7. Critérios de aceite

- [ ] `PlanningConflict` modela `ignored`, instante e referência à `Decision`;
- [ ] a transição rejeita estado diferente de `open` e severidade diferente de `risk`;
- [ ] `Decision` registra opção, snapshot, efeito, ator e idempotência;
- [ ] serviço valida Trip, conflito e papel de Organizador disponível no modelo atual;
- [ ] escrita de `Decision` e conflito é atômica;
- [ ] repetição equivalente é idempotente e repetição divergente falha;
- [ ] reconciliação não recria uma condição ignorada equivalente;
- [ ] contexto novo pode substituir o risco ignorado sem perder histórico;
- [ ] ação aparece somente em Riscos e exige confirmação explícita;
- [ ] sucesso atualiza a Revisão e falha não produz escrita parcial;
- [ ] testes cobrem domínio, adapter, interface e jornada responsiva.

## 8. Testes obrigatórios

- domínio: sucesso, estado incompatível, `error`, `suggestion` e dados de correlação inválidos;
- Decision: novo tipo, snapshot, efeito incompatível e cross-trip;
- persistência: atomicidade, cross-trip, ator, idempotência equivalente e divergente;
- reconciliação: fingerprint ignorado equivalente, mudança de linhagem/contexto e desaparecimento;
- interface: confirmação somente em Riscos, Erro sem ação, sucesso e falha acessível;
- E2E desktop e mobile: detectar sobreposição, confirmar `Ignorar risco`, atualizar contagens e manter o Roteiro inalterado;
- gates: docs, formato, lint, typecheck, migration, testes, smoke, build e Playwright.

## 9. Riscos

- tratar `ignored` como resolução;
- criar novo conflito aberto equivalente durante cada avaliação;
- persistir Decision sem transição ou transição sem Decision;
- inferir identidade autenticada que ainda não existe no produto;
- esconder erro bloqueante;
- implementar restauração sem decisão arquitetural.

## 10. Fora de escopo

- `RestoreIgnoredPlanningRisk`;
- `resolved` e `ResolvePlanningConflict`;
- novos tipos, regras, severidades ou evidências;
- ignorar `error` ou aplicar `IgnorePlanningRisk` a `suggestion`;
- correção ou edição inline do Roteiro;
- Providers, IA, Proposal, notificações ou analytics;
- autenticação nova e autorização além do papel de owner já persistido na Trip.

## 11. Evidências de conclusão

O incremento somente poderá ser considerado pronto quando a PR possuir SHA final com Documentation Validation e Engineering Validation verdes, incluindo migration, testes, build e Playwright responsivo.
