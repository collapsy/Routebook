---
id: RB-INC-044
title: Experiência Básica de Revisão de Conflitos
description: Disponibiliza uma revisão contextual do Roteiro para visualizar, compreender e filtrar Planning Conflicts conhecidos sem alterar estado canônico.
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
  - itinerary-review
  - accessibility
  - vertical-slice
related_documents:
  - RB-DEL-001
  - RB-DOM-001
  - RB-DOM-002
  - RB-DOM-003
  - RB-DOM-004
  - RB-UX-001
  - RB-UX-002
  - RB-UX-003
  - RB-UX-004
  - RB-UX-005
  - RB-ADR-003
  - RB-ADR-010
  - RB-ADR-011
  - RB-INC-043
prerequisites:
  - RB-INC-043
next_documents:
  - RB-INC-045
ai_context:
  priority: critical
  index: true
---

# RB-INC-044 — Experiência Básica de Revisão de Conflitos

## 1. Objetivo

Disponibilizar a versão básica de `RB-SCR-010 — Revisão de Conflitos` como página contextual do Roteiro, permitindo identificar e compreender `PlanningConflict` conhecidos sem resolvê-los, ignorá-los ou alterar silenciosamente o Roteiro.

## 2. Resultado utilizável

Ao final do incremento, o usuário poderá abrir a Revisão a partir do Roteiro, executar a avaliação determinística existente, compreender os conflitos ativos e voltar ao Dia afetado.

## 3. Rota e navegação

- rota: `/viagens/[tripId]/roteiro/revisao`;
- entrada explícita no Roteiro;
- retorno para `/viagens/[tripId]/roteiro`;
- a Revisão permanece contextual ao Roteiro e não cria nova área principal.

## 4. Escopo

### 4.1 Avaliação

- avaliar o Roteiro ao abrir a Revisão;
- reutilizar `evaluatePlanningConflicts` e a reconciliação transacional do RB-INC-043;
- apresentar somente conflitos em estado `open`;
- preservar a ordem determinística existente;
- recalcular ao retornar após uma alteração do Roteiro.

### 4.2 Resumo e filtros

- quantidade total;
- contagens de `error`, `risk` e `suggestion`;
- filtros Todos, Erros, Riscos e Sugestões;
- filtros operáveis por teclado e compreensíveis sem cor.

### 4.3 Item de conflito

Cada item deverá apresentar:

- severidade textual;
- título compreensível;
- explicação baseada em evidência conhecida;
- impacto;
- Dia relacionado quando conhecido;
- títulos das Activities relacionadas quando disponíveis;
- ação `Ver dia` quando houver referência válida.

IDs internos não devem substituir títulos conhecidos na interface.

## 5. Estados

- analisando;
- conflitos conhecidos disponíveis;
- nenhum conflito conhecido;
- erro recuperável de análise;
- lista atualizada após mudança do Roteiro.

O estado vazio deverá informar que a análise considera somente os dados disponíveis e não representa garantia absoluta.

## 6. Linguagem e apresentação

- utilizar `Conflito de Planejamento` ou `Conflito` quando o contexto estiver claro;
- não usar Warning, Error técnico ou Recommendation como sinônimos;
- apresentar `error` como Erro, `risk` como Risco e `suggestion` como Sugestão;
- nenhuma informação pode depender somente de cor;
- ausência de dado não autoriza texto inferido.

## 7. Critérios de aceite

- [ ] rota contextual é acessível pelo Roteiro;
- [ ] abertura executa avaliação transacional do RB-INC-043;
- [ ] somente conflitos `open` são apresentados;
- [ ] severidades canônicas não dependem somente de cor;
- [ ] resumo e filtros informam contagens corretas;
- [ ] cada item possui título acessível, explicação, impacto e referências conhecidas;
- [ ] títulos conhecidos de Activities substituem IDs internos;
- [ ] estado vazio comunica os limites da análise;
- [ ] erro usa `role="alert"` e oferece nova tentativa;
- [ ] foco visível, teclado e ordem semântica são preservados;
- [ ] não existe overflow horizontal em desktop ou mobile;
- [ ] Revisão não altera Itinerary, Activity, Decision ou estado do conflito;
- [ ] testes cobrem composição, filtros, vazio, erro e jornada responsiva.

## 8. Estratégia de testes

### Composição

- títulos, explicações e impactos por tipo conhecido;
- Dia e Activities relacionadas;
- contagens por severidade;
- ausência de referências conhecidas sem inferência.

### Interface

- filtros Todos, Erros, Riscos e Sugestões;
- item acessível;
- estado vazio;
- ausência de ações Resolver e Ignorar;
- foco, teclado e semântica.

### E2E

- criar duas Activities sobrepostas;
- abrir Revisão pelo Roteiro;
- visualizar o conflito e seus títulos;
- filtrar por severidade;
- voltar ao Dia afetado;
- validar desktop e mobile.

### Engenharia

- formatação;
- validação documental;
- lint;
- typecheck;
- migrations existentes;
- testes;
- smoke;
- build;
- Playwright responsivo.

## 9. Riscos

- expor IDs internos como conteúdo;
- transformar ausência de conflito conhecido em garantia;
- misturar conflito com Recommendation;
- mapear evidência para texto não suportado;
- alterar o Roteiro durante a avaliação;
- introduzir ação de estado sem Decision.

## 10. Fora de escopo

- estados `resolved` e `ignored`;
- `ResolvePlanningConflict`;
- `IgnorePlanningRisk`;
- `RestoreIgnoredPlanningRisk`;
- Decision associada a conflito;
- edição inline, remoção ou movimentação dentro da Revisão;
- novos tipos ou severidades;
- conflito de deslocamento por Provider;
- IA, Itinerary Proposal, notificações ou analytics.

## 11. Evidências de conclusão

O incremento somente poderá ser considerado pronto quando a PR possuir SHA final com Documentation Validation e Engineering Validation verdes, incluindo migration, testes, build e Playwright responsivo.
