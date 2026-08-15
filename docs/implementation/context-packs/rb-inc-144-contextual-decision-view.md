---
id: RB-CTX-144
title: Context Pack do RB-INC-144 — Visão de Decisão Contextual da Viagem
description: Delimita contratos, caminhos, testes e restrições para conectar o contexto da Viagem às Recommendations na visão principal.
document_type: implementation-context-pack
owner: Decision Intelligence and Experience
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - recommendations
  - personalization
  - trip-overview
related_documents:
  - RB-INC-144
  - RB-CORE-0004
  - RB-PRD-001
  - RB-PRD-004
  - RB-DOM-001
  - RB-DOM-002
  - RB-ARC-001
  - RB-ARC-002
  - RB-INC-038
  - RB-INC-039
  - RB-INC-040
  - RB-INC-041
  - RB-INC-042
  - RB-INC-139
  - RB-INC-141
  - RB-INC-142
  - RB-INC-143
  - RB-INC-136
prerequisites:
  - RB-INC-041
  - RB-INC-042
  - RB-INC-139
next_documents:
  - RB-INC-136
ai_context:
  priority: high
  index: true
---

# RB-CTX-144 — Visão de Decisão Contextual da Viagem

## 1. Missão do executor

Conectar a visão principal da Viagem às Recommendations determinísticas já existentes, apresentando uma seleção limitada e explicável em modo não executor. A superfície não deve salvar, planejar, reservar, comprar, enviar mensagens, chamar fornecedores ou gerar efeitos externos.

## 2. Incremento

- ID: `RB-INC-144`
- Issue: `#337`
- Branch: `codex/rb-inc-144-contextual-decision-view`
- Base: `main` no head Production `e92e2d7fc0b547055bc1917fd12f9c28dd5b08af`
- Arquivo: `docs/implementation/increments/rb-inc-144-contextual-decision-view.md`

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/product/user-journeys.md`;
5. `docs/product/product-overview.md`;
6. `docs/domain/domain-model.md`;
7. `docs/domain/ubiquitous-language.md`;
8. `docs/architecture/architecture-overview.md`;
9. `docs/architecture/modules-and-bounded-contexts.md`;
10. `docs/implementation/increments/rb-inc-038-recommendation-core.md`;
11. `docs/implementation/increments/rb-inc-039-deterministic-recommendations.md`;
12. `docs/implementation/increments/rb-inc-040-recommendation-persistence.md`;
13. `docs/implementation/increments/rb-inc-041-recommendations-experience.md`;
14. `docs/implementation/increments/rb-inc-042-recommendation-decisions.md`;
15. `docs/implementation/increments/rb-inc-139-accommodation-proximity.md`;
16. `docs/implementation/increments/rb-inc-141-place-primary-image.md`;
17. `docs/implementation/increments/rb-inc-142-organic-place-ingestion.md`;
18. `docs/implementation/increments/rb-inc-143-place-images.md`;
19. `docs/implementation/increments/rb-inc-144-contextual-decision-view.md`;
20. este Context Pack.

## 4. Invariantes

- Recommendation não é Decision.
- Lugar salvo não é Atividade de Roteiro.
- Visualização não aplica efeitos canônicos.
- Informação desconhecida permanece desconhecida.
- Distância geodésica é linha reta, não rota/tempo.
- Contexto insuficiente exige neutralidade.
- Custos, riscos e perda de oportunidade só podem aparecer quando suportados por dados governados.
- IA não é necessária para a base determinística deste incremento.

## 5. Contratos existentes

- `loadRecommendationExperience(tripId, now, options)`;
- `RecommendationCardViewModel` para Reasons, Confidence, Limitations, imagem, preço e distância;
- `toRecommendationCardViewModel` sem expor `RecommendationScore`;
- `formatGeodesicDistance`;
- `PlacePrimaryImage`;
- `/viagens/[tripId]/recomendacoes` para experiência completa;
- `/viagens/[tripId]/lugares/[placeSlug]` para detalhes;
- `Place.priceRange` somente como faixa de preço do catálogo.

A visão principal deve chamar a experiência em `persist: false`, preservando o comportamento persistente da página completa de Recommendations.

## 6. Arquitetura e governança

| ADR | Aplicação |
| --- | --- |
| RB-ADR-001 | Preservar monólito modular e contextos existentes. |
| RB-ADR-003 | Usar Next.js/App Router existente. |
| RB-ADR-005 | Nenhuma alteração de persistência/PostGIS. |
| RB-ADR-009 | Validar fronteiras e não inventar dados. |
| RB-ADR-010 | Cobrir regras e jornadas com testes existentes. |
| RB-ADR-012 | Não substituir a estratégia geoespacial. |
| RB-ADR-019 | Usar CI existente como gate. |

## 7. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/page.tsx
apps/web/components/contextual-recommendation-strip.tsx
apps/web/lib/recommendation-experience.ts
apps/web/lib/recommendation-experience.test.ts
apps/web/e2e/recommendations-experience.spec.ts
docs/implementation/increments/rb-inc-144-contextual-decision-view.md
docs/implementation/context-packs/rb-inc-144-contextual-decision-view.md
docs/registry.md
```

Qualquer caminho adicional exige justificativa no PR.

## 8. Caminhos somente leitura

```text
modules/decision-intelligence/src/**
modules/place-catalog/src/**
packages/database/src/**
docs/core/routebook-bible.md
docs/product/**
docs/domain/**
docs/architecture/**
```

Se um contrato de domínio precisar mudar, interromper e escalar.

## 9. Caminhos proibidos

```text
packages/database/drizzle/**
apps/web/public/place-images/**
.github/workflows/**
```

Não criar migration, asset, workflow, secret ou mudança de Production neste incremento.

## 10. Entradas e saídas

Entradas permitidas: Trip, Traveler Profile quando existente, Accommodation/coordenada quando existente, Places publicados, Recommendations determinísticas e imagens governadas/fallback.

Saídas: seção contextual limitada, componente de apresentação, modo de leitura seguro, preço de catálogo quando existente, distância explicitamente geodésica, Reasons/Confidence/Limitations e navegação para detalhe/Recommendations.

Não usar dados externos novos para preencher lacunas.

## 11. Comportamento sob contexto insuficiente

Quando o contexto for insuficiente, a UI deve permanecer neutra. Não deve chamar uma opção de “melhor”, inventar fatores ou aumentar a assertividade.

A interface deve indicar que a seleção pode estar incompleta e apontar dados configuráveis, como interesses e hospedagem. Dados ausentes permanecem ausentes.

## 12. Custos, riscos e perda de oportunidade

- `priceRange` pode ser exibido como **faixa de preço do catálogo**, nunca como custo real;
- custo real, disponibilidade, horário, rota e duração não devem ser inferidos;
- riscos e perda de oportunidade só podem ser apresentados quando houver evidência governada;
- nesta base do produto, quando esses fatores não estiverem medidos, a UI deve dizer explicitamente que não estão medidos/disponíveis;
- nenhuma dessas dimensões pode entrar no ranking sem contrato próprio e evidência.

## 13. Critérios de aceite

- [ ] Seção contextual aparece na visão da Viagem.
- [ ] No máximo três Recommendations são apresentadas.
- [ ] Reasons, Confidence e Limitations não são reinterpretados.
- [ ] Imagem/fallback é renderizada sem hotlink.
- [ ] Faixa de preço é distinguida de custo real.
- [ ] Distância é explicitamente em linha reta.
- [ ] Próximo passo é apenas navegação/comparação, sem execução.
- [ ] Custos/riscos/perdas não medidos são declarados como indisponíveis.
- [ ] Contexto insuficiente mantém neutralidade e indica dados configuráveis.
- [ ] Visualização não cria Recommendations persistidas, não salva Places e não altera Atividades.
- [ ] Desktop/mobile e E2E aplicável passam.

## 14. Testes

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Priorizar testes diretamente afetados antes da suíte completa.

## 15. Quando interromper

Interromper se surgir necessidade de alterar domínio, criar estado persistido novo, mudar ranking canônico, adicionar Provider/secret/infraestrutura, criar migration, introduzir dados não governados ou ampliar o escopo.

## 16. Definition of Done

Critérios de aceite satisfeitos, documentação registrada, testes com evidência real, CI verde no SHA final e PR pronta para revisão humana. Merge permanece condicionado à autorização explícita.