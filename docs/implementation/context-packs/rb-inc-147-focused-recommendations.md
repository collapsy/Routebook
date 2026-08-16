---
id: RB-CTX-147
title: Context Pack do RB-INC-147 — Recommendations Focadas com Divulgação Progressiva
description: Delimita contratos, caminhos, testes e restrições para reduzir a carga cognitiva da experiência completa de Recommendations sem alterar ranking ou domínio.
document_type: implementation-context-pack
owner: Decision Intelligence and Experience
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors:
  - RouteBook Team
tags:
  - implementation
  - context-pack
  - recommendations
  - progressive-disclosure
  - accessibility
related_documents:
  - RB-INC-147
  - RB-CORE-0004
  - RB-PRD-002
  - RB-PRD-004
  - RB-PRD-006
  - RB-UX-003
  - RB-DOM-001
  - RB-DOM-002
  - RB-ARC-001
  - RB-ARC-002
  - RB-INC-041
  - RB-INC-042
  - RB-INC-136
  - RB-INC-144
  - RB-INC-146
prerequisites:
  - RB-INC-041
  - RB-INC-042
  - RB-INC-144
next_documents:
  - RB-INC-136
ai_context:
  priority: high
  index: true
---

# RB-CTX-147 — Recommendations Focadas com Divulgação Progressiva

## 1. Missão do executor

Reduzir a carga cognitiva da rota completa de Recommendations por divulgação progressiva, preservando integralmente a ordenação canônica, os estados de domínio, a explicabilidade e as ações explícitas existentes.

O executor não pode criar um segundo ranking, introduzir novo estado de Recommendation ou transformar apresentação em mutação.

## 2. Incremento

- ID: `RB-INC-147`.
- Issue: `#343`.
- Branch: `codex/rb-inc-147-focused-recommendations`.
- Base: `main` em `a5f2f6e01f3f013cac34023b8d2b12ce24d9adb2`.
- Related: `#319`.
- Incremento: `docs/implementation/increments/rb-inc-147-focused-recommendations.md`.

## 3. Leitura obrigatória concluída antes de código

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/product/mvp-definition.md`;
5. `docs/product/functional-requirements.md`, especialmente RB-FR-097 a RB-FR-103;
6. `docs/product/user-journeys.md`, especialmente a jornada de Descoberta;
7. `docs/ux/screen-inventory.md`;
8. `docs/domain/domain-model.md`;
9. `docs/domain/ubiquitous-language.md`;
10. `docs/architecture/architecture-overview.md`;
11. `docs/architecture/modules-and-bounded-contexts.md`;
12. `docs/implementation/increments/rb-inc-041-recommendations-experience.md`;
13. `docs/implementation/increments/rb-inc-042-recommendation-decisions.md`;
14. `docs/implementation/increments/rb-inc-144-contextual-decision-view.md`;
15. `docs/implementation/context-packs/rb-inc-144-contextual-decision-view.md`;
16. `docs/implementation/increments/rb-inc-147-focused-recommendations.md`;
17. este Context Pack.

## 4. Evidência que originou o incremento

A validação técnica registrada em `#319` observou uma Trip realista de Pipa com 30 Places publicados e 30 cards completos de Recommendations na rota de sugestões.

A evidência é técnica/observada, não feedback humano. Ela sustenta a existência do problema de volume para investigação, mas não permite declarar melhora de usabilidade antes da Fase B do M8.

## 5. Invariantes

- Recommendation é sugestão, não Decision.
- Decision continua pertencendo ao usuário.
- Salvar não significa planejar.
- `accepted` e `rejected` são estados reais; a UI não cria sinônimo persistido.
- `isSaved` e `isPlanned` são flags informativas já existentes.
- `loadRecommendationExperience` define a coleção e a ordem.
- Nenhuma função do RB-INC-147 pode usar `sort` para ordenar Recommendations.
- Nenhuma função pode acessar ou expor Recommendation Score.
- Reasons, Confidence e Limitations não são reinterpretados.
- A visualização completa deve continuar disponível.
- Visualização focada e completa são estados de interface via URL/query string, não estado canônico.

## 6. Contratos existentes

### Experiência

- `loadRecommendationExperience(tripId)`;
- `RecommendationExperienceViewModel`;
- `RecommendationCardViewModel`;
- `formatGeodesicDistance`;
- ordenação de `experience.cards` produzida pelo engine determinístico.

### Interface

- `RecommendationCard`;
- rota `/viagens/[tripId]/recomendacoes`;
- Server Actions existentes de `ignore`, `save` e `add-to-itinerary`;
- feedback `role="status"` e `role="alert"` existente.

### Domínio

- estados de Recommendation definidos em Decision Intelligence;
- Decision e idempotência do RB-INC-042;
- Saved Place e Itinerary permanecem sob seus owners.

## 7. Projeção de apresentação permitida

É permitido adicionar uma função pura na camada `apps/web/lib/recommendation-experience.ts`, por exemplo `buildFocusedRecommendationPresentation`, desde que:

- receba apenas `RecommendationCardViewModel[]` e um limite positivo;
- use partição estável e `slice`;
- preserve referência/valor dos cards recebidos;
- não persista nada;
- não chame Provider;
- não faça `sort`;
- não crie Recommendation ou Decision;
- retorne apenas dados de apresentação.

Classificação autorizada para **pendente de decisão na UI**:

```text
status === presented
AND isSaved === false
AND isPlanned === false
```

Classificação autorizada para seção de histórico/estado já considerado:

```text
status === accepted
OR status === rejected
OR isSaved === true
OR isPlanned === true
```

O texto visível pode chamar a seção de “Já consideradas”, mas esse rótulo não pode aparecer como novo estado de domínio, código de persistência ou evento.

## 8. Modo focado

- é o default sem query string;
- máximo de 6 pendentes completos;
- preserva a ordem relativa de `experience.cards`;
- mostra contagem explícita;
- quando existem pendentes adicionais, oferece `Ver todas as sugestões`;
- Recommendations já consideradas ficam acessíveis numa seção compacta, preferencialmente por links e badges/textos derivados de estados existentes;
- não precisa renderizar novamente todos os detalhes/Reasons do histórico compacto, desde que o usuário possa abrir o detalhe ou a lista completa.

## 9. Modo completo

- ativado por query string simples, preferencialmente `?view=all`;
- renderiza `experience.cards` diretamente, sem nova partição/reordenação;
- preserva os cards completos e suas ações;
- oferece retorno explícito ao modo focado;
- query inválida deve degradar para modo focado, sem erro de domínio.

## 10. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/recomendacoes/page.tsx
apps/web/app/viagens/[tripId]/recomendacoes/recommendations-page.module.css
apps/web/components/recommendation-card.tsx
apps/web/components/recommendation-card.module.css
apps/web/lib/recommendation-experience.ts
apps/web/lib/recommendation-experience.test.ts
apps/web/e2e/recommendations-experience.spec.ts
docs/implementation/increments/rb-inc-147-focused-recommendations.md
docs/implementation/context-packs/rb-inc-147-focused-recommendations.md
docs/registry.md
```

## 11. Caminhos somente leitura

```text
modules/decision-intelligence/**
modules/saved-places/**
modules/trip-management/**
modules/place-catalog/**
packages/database/**
docs/core/**
docs/product/**
docs/domain/**
docs/architecture/**
docs/ux/**
```

## 12. Caminhos proibidos

```text
packages/database/drizzle/**
.github/workflows/**
apps/web/public/place-images/**
```

Não criar migration, workflow, secret, asset, dependência ou mudança de Production neste incremento.

## 13. Mudanças esperadas por arquivo

### `recommendation-experience.ts`

Somente helper puro de projeção focada, se necessário. Não alterar geração, persistência, fingerprint, invalidação ou ordenação.

### `recommendation-experience.test.ts`

Testar limite, ordem, partição, contagens, ausência de mutação e estados Saved/Planned/Accepted/Rejected.

### `recomendacoes/page.tsx`

Interpretar `view=all`, selecionar a projeção apropriada, renderizar resumo e links de divulgação progressiva e manter todos os estados existentes.

### `recommendations-page.module.css`

Somente estilos necessários para controles/sections compactas e responsividade.

### `recommendation-card.*`

Alterar apenas se indispensável para preservar clareza/acessibilidade do card no novo contexto. Preferir não alterar se a página conseguir compor a solução sozinha.

### `recommendations-experience.spec.ts`

Cobrir modo focado, modo completo e regressão das ações.

## 14. Critérios de aceite executáveis

- default: `focusedCards.length <= 6`;
- nenhum card `focused` possui estado diferente de `presented`, `isSaved=true` ou `isPlanned=true`;
- ordem dos IDs focados é subsequência estável da ordem de entrada;
- `consideredCards` também mantém ordem estável;
- `remainingPendingCount` é exato;
- `totalCount === cards.length`;
- modo completo tem a mesma sequência de IDs de `experience.cards`;
- links `view=all` e retorno não executam Server Action;
- ações existentes continuam cobertas por E2E;
- ausência de Score bruto continua coberta;
- desktop/mobile não apresentam overflow horizontal.

## 15. Testes obrigatórios

Executar primeiro os afetados diretamente e depois a suíte integral:

```bash
pnpm --filter @routebook/web test -- recommendation-experience
pnpm --filter @routebook/web test:e2e -- recommendations-experience.spec.ts
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Se o comando filtrado não for suportado pelo workspace, registrar a limitação e usar o comando equivalente realmente disponível; nunca declarar execução inexistente.

## 16. Riscos

### Segundo ranking acidental

Mitigação: nenhuma chamada `sort`; somente filtro, partição estável e `slice`.

### Estado de UI confundido com domínio

Mitigação: “já consideradas” só existe em copy/estrutura visual. Tipos de domínio não mudam.

### Opções escondidas

Mitigação: modo completo explícito e contagens visíveis.

### Regressão em Decisions

Mitigação: Server Actions não mudam e os fluxos save/add/ignore permanecem em E2E.

### Histórico ainda pesado

Mitigação: seção compacta no modo focado; card completo apenas em `view=all`.

## 17. Observabilidade e evidência

Nenhuma telemetria comportamental nova será adicionada. A evidência deste incremento é:

- testes automatizados;
- CI;
- comportamento observável em navegador;
- posterior feedback humano do M8, registrado separadamente.

## 18. Quando interromper

Interromper e escalar se a solução exigir:

- alterar ranking canônico;
- mudar estados/transições de Recommendation;
- alterar domínio, Decision ou idempotência;
- migration/schema;
- Provider/secret;
- nova dependência;
- mudança de navegação estrutural;
- alteração de Production;
- inventar dados externos.

## 19. Definition of Done

Incremento e Context Pack registrados, implementação limitada aos caminhos autorizados, testes afetados e suíte integral com resultados reais, CI verde no mesmo SHA e PR pronta para revisão. Merge permanece condicionado à autorização humana explícita.
