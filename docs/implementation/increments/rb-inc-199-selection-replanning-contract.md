---
id: RB-INC-199
title: Contrato canônico de seleção e replanejamento
description: Publica TripPlacePreference, Minha seleção, a origem autoritativa da Proposal e a janela temporal timezone-aware antes de qualquer implementação.
document_type: implementation-increment
owner: Domain, Product, Experience and Architecture
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, documentation, trip-place-preference, itinerary-proposal, replanning]
related_documents: [RB-CORE-0004, RB-PRD-004, RB-PRD-005, RB-PRD-006, RB-PRD-007, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-UX-001, RB-UX-002, RB-UX-005, RB-ARC-002, RB-ADR-027, RB-ADR-028, RB-CTX-199]
prerequisites: [RB-INC-196]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-199 — Contrato canônico de seleção e replanejamento

## 1. Resultado vertical

O RouteBook passa a possuir um contrato canônico, aprovado e rastreável para a jornada:

```text
Place
→ TripPlacePreference
→ Minha seleção
→ geração explícita de Itinerary Proposal
→ revisão e aceite
→ Activity
```

O incremento é exclusivamente documental. Nenhuma mudança de código, banco, rota ou produção faz parte do resultado.

## 2. Unidade de trabalho

- Issue: [#481](https://github.com/collapsy/Routebook/issues/481).
- Branch: `codex/issue-481-selection-replanning-contract`.
- Base: `origin/main@3beceb737edfc390c9e56eecf90f006fac8342b0`.
- Decisão: RB-ADR-028, aprovada pelo responsável humano em `2026-09-18`.
- Merge na `main` permanece gate humano explícito.

## 3. Problema

Saved Place é binário e o gerador atual pode usar Recommendations ou descobertas não escolhidas. Também não existe contrato completo para distinguir passado imutável, trecho transcorrido do Dia atual e futuro elegível.

Implementar UI ou persistence antes de fechar esses conceitos criaria termos concorrentes, migrations ambíguas e risco de reforçar o fluxo direto Place → Activity.

## 4. Decisões deste incremento

- `TripPlacePreference` é o termo canônico.
- `WANT`, `MAYBE` e `NOT_INTERESTED` são intenções explícitas.
- ausência de registro significa Place não avaliado.
- `MUST_DO` só pode qualificar `WANT`.
- Saved Places existentes serão futuramente convertidos para `WANT` sem prioridade.
- `MAYBE` é excluído por padrão e exige opt-in na geração.
- Places não avaliados e `NOT_INTERESTED` não entram automaticamente em Proposal.
- Planning Roles iniciais são `EXPERIENCE`, `FOOD`, `NIGHTLIFE` e `OTHER`.
- adição manual ao Dia permanece possível, mas secundária.
- replanejamento é explícito, produz Proposal e respeita ReplanningWindow.
- passado, trecho transcorrido, Activities em andamento, sem horário no Dia atual, terminais ou `fixed` ficam protegidos.

## 5. Experiência alvo

1. criar Viagem;
2. Explorar;
3. expressar intenção por Place;
4. revisar Minha seleção;
5. solicitar geração e decidir sobre `MAYBE`;
6. revisar incluídos, excluídos e limitações;
7. aceitar integral ou parcialmente;
8. continuar explorando sem alterar o Roteiro;
9. solicitar replanejamento explícito;
10. durante a Viagem, operar somente sobre o futuro elegível.

## 6. Caminhos autorizados

```text
docs/architecture/adrs/rb-adr-028-trip-place-preference-and-temporal-replanning.md
docs/architecture/modules-and-bounded-contexts.md
docs/domain/domain-model.md
docs/domain/ubiquitous-language.md
docs/domain/business-rules-and-invariants.md
docs/domain/domain-events-and-lifecycles.md
docs/product/functional-requirements.md
docs/product/user-journeys.md
docs/product/use-cases.md
docs/product/business-rules.md
docs/ux/information-architecture.md
docs/ux/user-flows.md
docs/ux/interaction-specifications.md
docs/implementation/increments/rb-inc-199-selection-replanning-contract.md
docs/implementation/context-packs/rb-inc-199-selection-replanning-contract.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 7. Migração e compatibilidade

Não há migration neste incremento.

O contrato apenas define a futura evolução aditiva de `saved_places`, com backfill para `WANT`, prioridade nula, preservação dos IDs e adaptadores temporários para Save/Unsave.

## 8. Fora de escopo

- TypeScript ou código de aplicação;
- schema, migration ou backfill;
- criação ou renomeação de rota;
- alteração do gerador;
- novos componentes ou wireframes;
- alteração de Activity;
- deployment, Preview ou Production;
- merge na `main`.

## 9. Riscos

- documentos antigos continuarem tratando Salvos como fluxo primário;
- linguagem de “interesse” virar sinônimo concorrente;
- MUST_DO ser interpretado como obrigação de violar restrições;
- regras temporais usarem timezone do servidor;
- PRs concorrentes consolidarem adição direta ao Dia como ação primária.

## 10. Testes obrigatórios

```bash
node scripts/validate-docs.mjs
pnpm format:check
```

Não há justificativa para executar testes de código, build, migrations ou E2E porque nenhum artefato executável pode ser alterado.

## 11. Critérios de aceite

- [ ] TripPlacePreference está definido sem sinônimo de domínio concorrente.
- [ ] intenções, prioridade e ausência de avaliação possuem invariantes explícitas.
- [ ] Saved Places possuem transição futura sem perda de dados.
- [ ] Minha seleção substitui Salvos como arquitetura primária.
- [ ] Recommendation/Discovery permanecem separadas da seleção.
- [ ] Proposal só usa candidatos explicitamente selecionados.
- [ ] seleção vazia ou pequena é válida.
- [ ] incluídos e excluídos possuem explicação.
- [ ] taxonomia factual permanece separada de Planning Role.
- [ ] regra temporal cobre passado, Dia atual, futuro, horários ausentes, status e flexibilidade.
- [ ] Activity continua distinta de Proposed Activity.
- [ ] adição manual ao Dia está documentada como secundária.
- [ ] RB-ADR-028 registra alternativas, consequências, riscos e transição.
- [ ] registry e rastreabilidade estão atualizados.
- [ ] validação documental passa.

## 12. Rollback

Como o incremento é documental, o rollback consiste em reverter o patch antes do merge ou superseder formalmente RB-ADR-028 depois da publicação. Nenhum dado ou estado de produção é afetado.
