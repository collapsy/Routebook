---
id: RB-CTX-159
title: Context Pack do RB-INC-159 — Ações diretas de Lugar no planejamento
description: Delimita a redução de fricção entre Discovery, Saved Places e Itinerary preservando decisões explícitas e independentes.
document_type: implementation-context-pack
owner: Traveler Experience and Place Catalog
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, context-pack, discovery, saved-place, itinerary, ux]
related_documents: [RB-INC-159, RB-CORE-0004, RB-PRD-002, RB-UX-002, RB-INC-157, RB-INC-158, RB-INC-136]
prerequisites: [RB-INC-157, RB-INC-158]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-159 — Ações diretas de Lugar no planejamento

## 1. Missão do executor

Corrigir a fricção observada na auditoria pré-Production entre descobrir um Place publicado e tomar uma decisão sobre ele.

O usuário deve conseguir, no contexto em que está avaliando o Lugar:

- salvar/remover como opção;
- iniciar a inclusão no Roteiro;
- escolher explicitamente o Dia;
- distinguir claramente interesse de compromisso.

A implementação não pode fundir Saved Place com Activity nem estender ações canônicas para candidato externo não publicado.

## 2. Incremento

- ID: `RB-INC-159`;
- issue: `#367`;
- branch: `codex/rb-inc-159-place-actions-itinerary-entry`;
- baseline: `570567fc49844fdd926624287871a98926f8c27a`;
- relação: corrige gap do MVP identificado durante a preparação do aceite real #319, após RB-INC-157 e RB-INC-158.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/product/mvp-definition.md`;
5. `docs/ux/user-flows.md`;
6. `docs/implementation/increments/rb-inc-159-place-actions-itinerary-entry.md`;
7. `docs/implementation/increments/rb-inc-157-progressive-catalog-itinerary-journey.md`;
8. `docs/implementation/increments/rb-inc-158-pipa-visual-coverage.md`;
9. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`.

## 4. Contratos preservados

- Saved Place representa interesse e não é Activity;
- Activity pode referenciar Place publicado sem exigir Saved Place;
- salvar não cria Activity;
- adicionar ao Roteiro não cria Saved Place;
- remover dos Salvos preserva Activity existente;
- candidato Overture não publicado não recebe ações canônicas de Salvar ou Roteiro;
- Recommendation não é Decision;
- Proposal não é estado aplicado sem aceite;
- lista e mapa continuam coerentes quanto ao estado visível do Place;
- distância geodésica continua identificada como linha reta;
- rota real e tempo atual continuam externos ao RouteBook neste incremento;
- toda mutation exige contexto de Viagem autenticada/autorizada conforme contratos existentes;
- evidência técnica de Preview não substitui evidência humana M8.

## 5. Regras de UX

- Explorar deve permitir agir sem obrigar abertura de múltiplas superfícies;
- o Cartão publicado deve oferecer Salvar e Adicionar ao Roteiro;
- Detalhes deve oferecer Salvar/Remover, Adicionar ao Roteiro, mapa e rota;
- Salvar no catálogo deve manter pesquisa e filtros atuais;
- Adicionar ao Roteiro exige escolha explícita do Dia;
- horário e duração permanecem opcionais;
- sucesso deve indicar o que mudou e permitir continuar ou abrir o Dia;
- nenhuma ação sobre candidato externo pode sugerir que ele já é Place canônico.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados no RB-INC-159. O novo `apps/web/e2e/place-actions.spec.ts` é explicitamente autorizado para cobrir a jornada transversal sem alterar responsabilidades de suítes existentes.

## 7. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/place-actions.spec.ts e2e/place-details.spec.ts e2e/saved-places.spec.ts e2e/itinerary.spec.ts
```

Engineering Validation e Documentation Validation devem concluir no mesmo SHA.

Para aceite de produto, deve existir Preview Vercel READY contendo a árvore final do incremento. Um Preview anterior pode servir apenas como baseline.

## 8. Proibições

- não auto-salvar ao criar Activity;
- não criar Activity ao salvar;
- não exigir Saved Place para criar Activity a partir de Place publicado;
- não remover Activity ao remover Saved Place;
- não salvar ou inserir candidato externo no Roteiro antes de promoção/publicação governada;
- não alterar domínio ou migration;
- não criar Provider, API paga ou secret;
- não tratar Google Maps como fonte canônica persistida;
- não declarar Preview bloqueado por quota como aceite funcional;
- não declarar evidência M8 sem observação humana real;
- não fazer merge nem promover para Production sem autorização humana separada.

## 9. Handoff

Relatar:

- comportamento entregue em catálogo e Detalhes;
- independência comprovada entre Saved Place e Activity;
- arquivos alterados;
- testes efetivamente executados;
- SHA e estado dos dois gates de CI;
- estado e URL do Preview READY, quando existir;
- bloqueios de quota/rate limit da Vercel separadamente de falhas da aplicação;
- issue e PR;
- riscos residuais antes do próximo incremento pré-viagem.
