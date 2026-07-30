---
id: RB-INC-041
title: Experiência de Recommendations Contextualizadas
description: Define a experiência navegável para consultar Recommendations, compreender razões e limitações e ignorar sugestões sem mutação silenciosa.
document_type: implementation-increment
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-07-30"
last_updated: "2026-07-30"
authors:
  - RouteBook Team
tags:
  - implementation
  - decision-intelligence
  - recommendation
  - experience
  - accessibility
related_documents:
  - RB-INC-040
  - RB-PRD-004
  - RB-PRD-006
  - RB-PRD-007
  - RB-UX-001
  - RB-UX-003
  - RB-UX-004
  - RB-UX-005
  - RB-UX-006
  - RB-DS-002
  - RB-DS-003
  - RB-QA-001
  - RB-QA-002
prerequisites:
  - RB-INC-040
next_documents:
  - RB-INC-042
ai_context:
  priority: critical
  index: true
---

# RB-INC-041 — Experiência de Recommendations Contextualizadas

## Estado

`Draft`

Issue: [#86](https://github.com/collapsy/Routebook/issues/86)

Branch: `feature/rb-inc-041-recommendations-experience`

## Resultado vertical

O viajante poderá acessar uma lista pequena e ordenada de Recommendations de Places para uma Trip, compreender os dados conhecidos que justificam cada sugestão, reconhecer limitações do Contexto e ignorar uma Recommendation sem alterar Place, Saved Place, Preferences ou Itinerary.

## Compatibilidade com a Arquitetura da Informação

A documentação atual não define uma rota canônica específica para Recommendations. A superfície será criada em:

```text
/viagens/[tripId]/recomendacoes
```

A rota será contextual à Trip e acessível pela Visão Geral. Ela não será adicionada como sexta área da navegação principal, preservando a arquitetura vigente de cinco áreas globais.

## Decisões de experiência

1. A Visão Geral explica que as sugestões consideram o Contexto informado e não representam decisões automáticas.
2. A lista é composta no servidor por um serviço de aplicação próprio; a página não reimplementa ranking ou persistência.
3. Recommendations equivalentes são reutilizadas e apresentadas uma única vez.
4. Mudança relevante de Contexto invalida Recommendations ativas incompatíveis antes da geração atual.
5. Recommendations rejeitadas permanecem persistidas e não voltam como ativas equivalentes.
6. O texto visível usa `Ignorar`, enquanto o domínio persiste `rejected`.
7. Score bruto nunca é renderizado.
8. Confidence é apresentada como `Baixa`, `Média` ou `Alta`, acompanhada de explicação contextual e sem porcentagem.
9. Distância, quando conhecida, é identificada como geodésica em linha reta.
10. Estados salvo e planejado são informativos e não mudam a ordenação.
11. Nenhuma afirmação é feita sobre preço, avaliação pública, funcionamento, disponibilidade, rota, trânsito ou duração.

## Conteúdo do card

- nome do Place;
- categoria canônica;
- resumo do catálogo;
- distância geodésica da Accommodation, quando disponível;
- uma ou mais RecommendationReasons;
- RecommendationLimitations relevantes;
- Confidence qualitativa e sua base;
- estado salvo e planejado, quando aplicável;
- link para detalhes do Place;
- ação explícita `Ignorar`.

## Estados da rota

- loading por `loading.tsx`;
- Recommendations disponíveis;
- geração parcial com Contexto incompleto;
- nenhum candidato publicado adequado;
- erro recuperável por `error.tsx` e feedback de Server Action;
- Recommendation rejeitada;
- Recommendation invalidada;
- lista atualizada após mudança de Contexto.

## Fluxo de composição

1. carregar Trip, TravelerProfile, Places publicados, Saved Places e Itinerary;
2. resolver o Destination canônico pelo contrato local existente;
3. comparar versões do Contexto com Recommendations ativas persistidas;
4. invalidar avaliações incompatíveis;
5. gerar candidatos determinísticos com relógio e IDs controlados;
6. reutilizar ou persistir cada Recommendation equivalente;
7. transicionar `generated → presented` somente quando houver Reason;
8. compor o modelo de apresentação sem expor Score;
9. renderizar estados salvo, planejado e limitações.

## Ignorar Recommendation

A Server Action deve:

- validar TripId e RecommendationId;
- buscar a Recommendation dentro da mesma Trip;
- aceitar somente estado `presented`;
- aplicar `rejectRecommendation`;
- persistir a transição;
- revalidar a rota e a Visão Geral;
- redirecionar com feedback acessível;
- não remover o Place;
- não alterar Preferences, Saved Place ou Itinerary;
- não criar preferência permanente.

## Critérios de aceite

- [ ] a rota contextual é acessível pela Visão Geral;
- [ ] a entrada comunica Contexto, ausência de decisão automática e controle do usuário;
- [ ] cada card possui nome acessível e ao menos um Reason;
- [ ] Limitations são compreensíveis fora do contexto visual;
- [ ] Confidence é qualitativa e não se confunde com Score ou avaliação pública;
- [ ] Score bruto não aparece na interface;
- [ ] estados salvo e planejado são apresentados sem excluir candidatos;
- [ ] `Ignorar` persiste após recarregar;
- [ ] rejeitar não altera Place, Preferences, Saved Place ou Itinerary;
- [ ] sucesso usa `role="status"` e falha usa `role="alert"`;
- [ ] foco visível, teclado e semântica são preservados;
- [ ] nenhuma informação depende somente de cor;
- [ ] não existe overflow horizontal em desktop ou mobile;
- [ ] testes de componente cobrem cards, motivos, limitações, confiança e estados;
- [ ] Playwright cobre ordem, justificativas, ausência de Score, rejeição e recarga em desktop e mobile.

## Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/recomendacoes/**
apps/web/app/viagens/[tripId]/page.tsx
apps/web/components/**
apps/web/lib/**
apps/web/e2e/**
apps/web/package.json
modules/decision-intelligence/**
packages/database/src/**
pnpm-lock.yaml
docs/ux/screen-inventory.md
docs/ux/wireframes.md
docs/implementation/increments/rb-inc-041-recommendations-experience.md
docs/implementation/context-packs/rb-inc-041-recommendations-experience.md
docs/implementation/traceability-matrix.md
docs/registry.md
README.md
```

## Testes

### Componentes

- card com Reason e Limitation;
- Confidence qualitativa;
- distância disponível e indisponível;
- estados salvo e planejado;
- Recommendation rejeitada e invalidada;
- estados vazio, parcial e erro;
- semântica e nomes acessíveis;
- ausência de Score bruto.

### Playwright

- criar Trip;
- configurar interesses compatíveis;
- configurar Accommodation com coordenadas;
- abrir Recommendations pela Visão Geral;
- verificar ordem e justificativas;
- verificar ausência de Score bruto, estrelas e porcentagens;
- ignorar uma Recommendation;
- esperar explicitamente a Server Action e navegação;
- recarregar e confirmar persistência da rejeição;
- executar em Chromium desktop e Pixel 7.

## Riscos

| Risco | Mitigação |
| --- | --- |
| geração em leitura criar duplicações | repository reutiliza avaliação ativa equivalente |
| rejeição reaparecer | fingerprint e estado rejeitado impedem nova ativa equivalente no mesmo Contexto |
| UI acoplada ao banco | serviço de aplicação retorna view model explícito |
| Score exposto como qualidade | view model não contém Score |
| afirmação não suportada | Reasons e Limitations vêm do domínio determinístico |
| seletor E2E frágil | usar headings, labels, roles e nomes acessíveis |

## Fora de escopo

- salvar Place recomendado;
- adicionar Recommendation ao Itinerary;
- persistir Decision;
- aceitar Recommendation;
- LLM, agente, embeddings ou runtime de IA;
- preço, rating, funcionamento, disponibilidade, rota, trânsito ou duração;
- geração automática completa do Itinerary;
- Planning Conflict.
