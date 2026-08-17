---
id: RB-CTX-160
title: Context Pack do RB-INC-160 — Guia diário completo da viagem de Pipa
description: Delimita a expansão do guia editorial para os dias canônicos do piloto de Pipa, preservando Itinerary, estimativas e ações explícitas.
document_type: implementation-context-pack
owner: Traveler Experience and Place Catalog
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, context-pack, pipa, guide, itinerary, maps]
related_documents: [RB-INC-160, RB-CORE-0004, RB-PRD-002, RB-UX-002, RB-INC-155, RB-INC-159, RB-INC-136]
prerequisites: [RB-INC-159]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-160 — Guia diário completo da viagem de Pipa

## 1. Missão do executor

Transformar o guia editorial isolado do primeiro dia em uma experiência dedicada para toda a viagem do piloto, sem alterar domínio, persistência ou autoridade do Itinerary.

O resultado deve ajudar o viajante a responder “o que faz sentido hoje?” e ainda exigir ação explícita para transformar a sugestão em planejamento canônico.

## 2. Incremento

- ID: `RB-INC-160`;
- issue: `#369`;
- branch: `codex/rb-inc-160-complete-pipa-trip-guide`;
- baseline: `1ea3707f2e8410827be9df26e4e116c828a3f742` da PR #368;
- dependência: RB-INC-159 fornece as ações diretas de Place para o Roteiro.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/product/mvp-definition.md`;
5. `docs/ux/user-flows.md`;
6. `docs/implementation/increments/rb-inc-160-complete-pipa-trip-guide.md`;
7. `docs/implementation/increments/rb-inc-159-place-actions-itinerary-entry.md`;
8. `docs/implementation/increments/rb-inc-155-pipa-place-practical-guide.md`;
9. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`.

## 4. Contratos preservados

- Guia editorial não é Itinerary;
- Place visualizado não é Saved Place nem Activity;
- Salvar continua distinto de Adicionar ao Roteiro;
- Recommendation não é Decision;
- Proposal não é estado aplicado;
- mapa e lista do Dia representam a mesma sequência;
- distância geodésica é explicitamente linha reta;
- rota, trânsito e duração atuais permanecem externos ao RouteBook;
- maré, clima, funcionamento, preço e programação não são inventados como tempo real;
- período livre é válido;
- nenhuma leitura do Guia executa mutation;
- evidência técnica de Preview não substitui evidência humana M8.

## 5. Regras de UX

- a visão geral da Viagem deve apontar claramente para `Guia da viagem` sem carregar os oito dias completos;
- a página dedicada deve permitir saltar rapidamente entre dias;
- primeiro e último dia devem ser mais leves do que dias centrais;
- cada parada deve mostrar imagem/fallback, motivo, horário orientativo, duração, melhor encaixe, distância e um check prático;
- `Ver guia do lugar` abre Detalhes;
- `Adicionar ao roteiro` abre o compositor com o Dia correspondente pré-selecionado;
- links do Google Maps são externos e explicitam que o cálculo atual acontece fora do RouteBook;
- ausência de hospedagem geocodificada não bloqueia o Guia e não pode fingir rota.

## 6. Caminhos permitidos

Somente os caminhos declarados no RB-INC-160 podem ser alterados. Arquivo adicional indispensável exige atualização do incremento e justificativa na PR.

## 7. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/trip-day-guide.spec.ts e2e/place-actions.spec.ts
```

Engineering Validation e Documentation Validation devem concluir no mesmo SHA.

O aceite funcional exige Preview Vercel READY da branch final do RB-INC-160. O Preview deve representar a pilha RB-INC-159 + RB-INC-160.

## 8. Proibições

- não persistir o Guia como Activity;
- não auto-salvar ou auto-adicionar Place;
- não criar Recommendation, Proposal ou Decision por leitura;
- não introduzir novo Provider, API paga, secret ou migration;
- não tratar linha reta como rota rodoviária;
- não inventar dados em tempo real;
- não adicionar candidato Overture não publicado ao Guia;
- não fazer merge nem promover para Production sem autorização humana separada.

## 9. Handoff

Relatar:

- dias editoriais entregues e densidade por Dia;
- comportamento do teaser na visão da Viagem;
- integração com Detalhes e Adicionar ao Roteiro;
- arquivos alterados;
- testes efetivamente executados;
- SHA e estado dos gates;
- URL e estado do Preview READY;
- riscos residuais encontrados no aceite;
- issue #369 e PR relacionada.
