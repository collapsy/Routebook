---
id: RB-CTX-161
title: Context Pack do RB-INC-161 — Experiência de viagem ativa e navegação mobile
description: Delimita a melhoria de navegação, foco no Dia atual e simplificação mobile da Viagem ativa sem alterar estado canônico.
document_type: implementation-context-pack
owner: Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-20"
last_updated: "2026-08-20"
authors: [RouteBook Team]
tags: [implementation, context-pack, active-trip, navigation, mobile, itinerary]
related_documents: [RB-INC-161, RB-CORE-0004, RB-PRD-002, RB-UX-002, RB-UX-005, RB-INC-159, RB-INC-160, RB-INC-136]
prerequisites: [RB-INC-159, RB-INC-160]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-161 — Experiência de viagem ativa e navegação mobile

## 1. Missão do executor

Reduzir o custo de navegação durante a Viagem real, priorizando consulta rápida no celular e o Dia atual, sem criar novo estado de negócio nem aplicar decisões automaticamente.

## 2. Incremento

- ID: `RB-INC-161`;
- issue: `#375`;
- branch: `codex/rb-inc-161-active-trip-mobile-experience`;
- baseline: `8aa9309ad8c7eea48674515a931da7df69029afe`;
- base funcional: RB-INC-159 e RB-INC-160;
- ambiente de aceite: Vercel Preview;
- Production permanece fora do incremento.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/product/mvp-definition.md`;
5. `docs/ux/user-flows.md`;
6. `docs/ux/interaction-specifications.md`;
7. `docs/implementation/increments/rb-inc-159-place-actions-itinerary-entry.md`;
8. `docs/implementation/context-packs/rb-inc-159-place-actions-itinerary-entry.md`;
9. `docs/implementation/increments/rb-inc-160-pipa-trip-guide.md`;
10. `docs/implementation/context-packs/rb-inc-160-pipa-trip-guide.md`;
11. `docs/implementation/increments/rb-inc-161-active-trip-mobile-experience.md`;
12. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`.

## 4. Contratos preservados

- Viagem continua sendo o contexto organizador;
- Guia editorial não é Itinerary;
- Saved Place não é Activity;
- Recommendation não é Decision;
- Proposal não é estado aplicado;
- leitura de Guia, navegação ou Roteiro não cria mutation;
- query de Dia representa intenção explícita de apresentação e deve vencer foco automático;
- Dia atual é derivado em runtime e não persistido;
- lista e mapa preservam a mesma semântica;
- estimativas e distâncias continuam qualificadas conforme contratos existentes;
- apenas superfícies existentes são ligadas pela navegação contextual;
- evidência técnica deste incremento não substitui evidência humana do M8.

## 5. Regras de UX

- contexto de Viagem deve ser preservado ao alternar entre áreas;
- navegação contextual deve funcionar por teclado, toque e leitor de tela;
- item atual deve usar `aria-current` e tratamento visual não dependente apenas de cor;
- mobile deve oferecer alvos de toque utilizáveis e permitir rolagem horizontal da navegação sem quebrar layout;
- `Hoje` deve ser texto explícito;
- Guia abre o Dia atual quando aplicável, mantendo os demais acessíveis;
- Roteiro foca o Dia atual apenas quando `dia` não seleciona um Dia válido;
- fora do Período da Viagem, fallback continua sendo o primeiro Dia;
- controles de manutenção de Activity permanecem acessíveis, mas podem ser agrupados para reduzir ruído;
- nenhum gesto pode ser o único caminho para uma ação.

## 6. Caminhos permitidos

Somente os caminhos declarados no RB-INC-161 podem ser alterados. Arquivo adicional exige atualização explícita do incremento e justificativa na PR.

## 7. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/trip-day-guide.spec.ts e2e/itinerary.spec.ts e2e/place-actions.spec.ts
```

Engineering Validation e Documentation Validation devem concluir no mesmo SHA.

O aceite funcional exige Preview Vercel READY do head final. Merge e Production continuam gates humanos separados.

## 8. Proibições

- não persistir Dia atual;
- não depender do relógio do navegador para alterar estado canônico;
- não autoaplicar Guia, Recommendation, Decision ou Proposal;
- não criar Activity ao navegar ou abrir um Dia;
- não introduzir Provider, SDK, API paga, secret, migration ou dependência;
- não alterar invariantes ou linguagem de domínio;
- não esconder ações atrás de gesto exclusivo;
- não tratar cor como único indicador de estado;
- não declarar M8 validado por CI ou Preview;
- não fazer merge nem promover Production sem autorização humana separada.

## 9. Handoff

Relatar:

- navegação contextual entregue;
- regra de Dia atual e timezone aplicada;
- comportamento com seleção explícita e fora do Período;
- simplificação mobile das ações;
- arquivos alterados;
- testes efetivamente executados;
- SHA e estado dos gates de CI;
- Preview Vercel correspondente ao mesmo head;
- riscos residuais;
- issue e PR;
- qualquer decisão humana ainda pendente.
