---
id: RB-INC-144
title: Visão de Decisão Contextual da Viagem
description: Conecta o contexto existente da Viagem às Recommendations em uma superfície inicial de decisão, sem criar novo estado de domínio ou mutações implícitas.
document_type: implementation-increment
owner: Decision Intelligence and Experience
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors:
  - RouteBook Team
tags:
  - implementation
  - recommendations
  - decision-intelligence
  - trip-overview
  - personalization
  - experience
related_documents:
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

# RB-INC-144 — Visão de Decisão Contextual da Viagem

## 1. Resultado vertical

Na visão principal de uma Viagem, o usuário consegue encontrar rapidamente uma pequena seleção de Places recomendados a partir do contexto já informado, compreender por que foram sugeridos e seguir para uma ação explícita.

A superfície deve responder à pergunta de produto:

> **O que vale a pena considerar a partir do que eu já informei sobre esta Viagem?**

Ela não pretende responder ainda a disponibilidade em tempo real, horário de funcionamento, tempo de rota ou planejamento completo do dia.

## 2. Problema

O RouteBook já possui contexto da Viagem, Hospedagem, catálogo de Places, proximidade geodésica, Recommendations determinísticas, imagens e descoberta externa. Essas capacidades estão funcionando, mas distribuídas entre telas diferentes.

A visão principal atualmente apresenta a estrutura da Viagem e direciona para “Explorar lugares” ou “Ver sugestões contextualizadas”. Isso faz o produto depender de navegação manual para chegar ao apoio à decisão.

O incremento conecta as capacidades existentes em uma primeira superfície contextual, sem criar um novo conceito de domínio.

## 3. Princípios

- contexto antes de volume;
- Recommendation continua sendo orientação, não Decision;
- o usuário permanece no controle;
- distância é estimativa quando não representa rota;
- informação ausente permanece ausente;
- imagem melhora reconhecimento, mas não altera ranking ou Reasons;
- visualizar a Viagem não deve aplicar mudanças canônicas silenciosas;
- catálogo e descoberta externa continuam disponíveis como alternativas.

## 4. Escopo

- adicionar uma seção contextual à visão principal da Viagem;
- carregar Recommendations existentes sem duplicar a lógica de geração;
- limitar a apresentação a um conjunto pequeno, adequado à superfície de entrada;
- apresentar nome, categoria, resumo, imagem/fallback, confiança, Reasons relevantes, limitações e distância geodésica quando disponível;
- fornecer link para detalhes do Place;
- fornecer entrada para a experiência completa de Recommendations;
- manter catálogo, lugares salvos e descoberta externa acessíveis;
- apresentar estado vazio quando não houver contexto suficiente ou Recommendations disponíveis;
- evitar persistência/mutação adicional causada apenas pela visualização da seção contextual;
- cobrir a nova jornada por testes de unidade e E2E;
- atualizar o Context Pack e o Registry.

## 5. Fora de escopo

- novo agregado ou entidade de domínio;
- novo estado persistido de “snapshot” ou “decision view”;
- migration ou alteração de schema;
- LLM, agente ou Provider novo;
- mudança no algoritmo canônico de ranking de Recommendation;
- estimativa de tempo de rota, trânsito ou horário de funcionamento;
- publicação automática de candidatos externos;
- mudança de `primaryImage` ou nova curadoria de imagens;
- concluir a validação humana do M8;
- integração na `main`.

## 6. Contratos reutilizados

A implementação deve reutilizar:

- `loadRecommendationExperience` e `RecommendationCardViewModel` como fonte da experiência de Recommendation;
- `PlacePrimaryImage` para imagem/fallback;
- `formatGeodesicDistance` para distância declaradamente em linha reta;
- Recommendation Reasons, Confidence e Limitations existentes;
- navegação existente para detalhe e Recommendations.

Quando a visão principal precisar apenas consultar Recommendations, a camada de experiência deve permitir um modo de leitura que não gere novos efeitos persistentes.

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

Qualquer caminho adicional exige justificativa no Context Pack e no PR.

## 8. Critérios de aceite

- [ ] A visão da Viagem possui uma entrada primária de decisão contextual.
- [ ] A seção contextual mostra uma seleção limitada de Recommendations existentes.
- [ ] A seleção não cria um segundo algoritmo de ranking na UI.
- [ ] Reasons, Confidence e Limitations permanecem semanticamente idênticos aos existentes.
- [ ] Imagem local ou fallback é apresentada quando aplicável.
- [ ] Distância é identificada como linha reta/estimativa e nunca como tempo de deslocamento.
- [ ] O usuário consegue abrir o detalhe do Place.
- [ ] O usuário consegue abrir a experiência completa de Recommendations.
- [ ] Nenhuma ação de salvar ou planejar ocorre apenas por visualizar a seção.
- [ ] Contexto insuficiente produz uma explicação clara e acionável.
- [ ] Catálogo e descoberta externa continuam acessíveis.
- [ ] Nenhuma migration, secret, Provider novo ou alteração de Production é necessária.
- [ ] Unit/integration tests aplicáveis passam.
- [ ] Playwright/E2E cobre a jornada principal em desktop e mobile quando a infraestrutura existente permitir.
- [ ] Documentation Validation e Engineering Validation passam no SHA final.

## 9. Estratégia de testes

### Recommendation experience

- modo somente leitura não persiste novas Recommendations;
- modo existente continua preservando o comportamento da tela completa;
- view model mantém Reasons, Confidence, Limitations, imagem e distância;
- ausência de contexto continua explícita.

### Interface

- seção contextual aparece com Recommendations;
- máximo definido de cards é respeitado;
- links de detalhe e Recommendations funcionam;
- imagem e fallback não quebram o layout;
- estado vazio é acessível.

### E2E

- abrir uma Viagem com contexto e encontrar a seção contextual;
- verificar que um Place recomendado pode abrir seus detalhes;
- navegar para Recommendations completas;
- verificar estado de contexto insuficiente;
- validar desktop e viewport móvel sem depender de texto frágil ou posição visual.

## 10. Riscos e mitigação

**Duplicação de lógica de Recommendation:** reutilizar `loadRecommendationExperience` e view models existentes.

**Efeito colateral ao visitar a visão principal:** introduzir modo de leitura explicitamente não persistente para esta superfície.

**Excesso de conteúdo:** limitar a seleção e manter a tela de Recommendations como experiência completa.

**Falsa precisão:** manter a distinção entre distância geodésica e rota/tempo.

**Alteração de semântica:** nenhuma alteração de score, Reasons, Confidence ou regra de domínio.

## 11. Governança

- sem migration;
- sem Production;
- sem novo Provider;
- sem novo conceito de domínio;
- sem alteração de `main` direta;
- PR somente após gates aplicáveis passarem;
- merge somente mediante autorização humana explícita.

## 12. Definition of Done

O incremento somente será considerado concluído quando os critérios de aceite forem satisfeitos, a documentação estiver registrada, os testes aplicáveis tiverem evidência real e a PR estiver pronta para revisão humana. O merge permanece fora da execução autônoma.