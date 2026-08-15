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

Na visão principal de uma Viagem, o usuário consegue encontrar rapidamente uma pequena seleção explicável de Places relevantes ao contexto conhecido, entender por que aparecem e seguir para um próximo passo explícito sem que o RouteBook execute uma escolha.

A superfície deve responder, com honestidade factual, à pergunta:

> **O que vale a pena considerar a partir do que eu já informei sobre esta Viagem?**

Quando custos, riscos ou perdas de oportunidade não forem suportados por dados governados, a interface deve declarar que não estão medidos, em vez de inferi-los.

## 2. Problema

O RouteBook já possui contexto da Viagem, Hospedagem, catálogo de Places, proximidade geodésica, Recommendations determinísticas, imagens e descoberta externa. Essas capacidades funcionam, mas estão distribuídas entre telas diferentes.

A visão principal ainda depende de navegação manual para chegar ao apoio à decisão. Este incremento cria uma primeira superfície contextual sem criar um novo conceito de domínio.

## 3. Princípios

- contexto antes de volume;
- Recommendation continua sendo orientação, não Decision;
- a visão é não executora: não salva, não planeja, não reserva, não compra, não envia mensagens, não chama fornecedores e não gera efeitos externos;
- o usuário permanece no controle;
- informação ausente permanece ausente;
- distância geodésica é estimativa em linha reta, nunca rota ou duração;
- imagem melhora reconhecimento, mas não altera ranking ou Reasons;
- contexto insuficiente produz neutralidade e indica os dados necessários;
- custo, risco e perda de oportunidade só aparecem quando sustentados por dados governados.

## 4. Escopo

- adicionar uma seção contextual à visão principal da Viagem;
- reutilizar Recommendations existentes sem duplicar a lógica de geração;
- limitar a apresentação a três opções de entrada;
- apresentar nome, categoria, resumo, imagem/fallback, confiança, Reasons, limitações e distância quando disponível;
- apresentar a faixa de preço do catálogo somente quando existir, deixando explícito que não é custo real;
- apresentar um próximo passo possível de navegação, sem chamá-lo de Decision nem executar ação;
- explicitar custos reais, riscos e impacto de esperar como “não medidos/disponíveis” quando não houver evidência governada;
- oferecer links para detalhes e Recommendations completas;
- manter catálogo, lugares salvos e descoberta externa acessíveis;
- apresentar estado neutro quando não houver contexto suficiente;
- evitar persistência/mutação causada apenas pela visualização da seção;
- cobrir a jornada por testes unitários e E2E;
- atualizar Context Pack e Registry.

## 5. Fora de escopo

- novo agregado, entidade ou estado persistido de “Decision View”;
- migration ou alteração de schema;
- LLM, agente ou Provider novo neste incremento;
- mudança no algoritmo canônico de ranking de Recommendation;
- inferência de custo real, avaliação pública, disponibilidade, horário, trânsito, rota ou duração;
- cálculo de risco ou perda de oportunidade sem dados governados;
- publicação automática de candidatos externos;
- nova curadoria de imagens;
- concluir a validação humana do M8;
- integração na `main`.

## 6. Contratos reutilizados

A implementação deve reutilizar:

- `loadRecommendationExperience` e `RecommendationCardViewModel`;
- `PlacePrimaryImage` para imagem/fallback;
- `formatGeodesicDistance` para distância declaradamente em linha reta;
- Reasons, Confidence e Limitations existentes;
- `Place.priceRange` somente como faixa de preço do catálogo;
- navegação existente para detalhe e Recommendations.

Quando a visão principal apenas consultar Recommendations, a camada de experiência deve operar em modo de leitura sem persistir novas Recommendations.

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
- [ ] A seção mostra no máximo três Recommendations existentes.
- [ ] A seleção não cria um segundo algoritmo de ranking na UI.
- [ ] Reasons, Confidence e Limitations permanecem semanticamente idênticos.
- [ ] Imagem local ou fallback é apresentada quando aplicável.
- [ ] Faixa de preço do catálogo, quando existente, é distinguida de custo real.
- [ ] Distância é identificada como linha reta/estimativa e nunca como tempo de deslocamento.
- [ ] A interface apresenta um próximo passo possível sem executar uma escolha.
- [ ] Custos, riscos e perdas de oportunidade só são exibidos quando factualmente suportados; caso contrário, a indisponibilidade é declarada.
- [ ] Contexto insuficiente mantém a interface neutra e indica dados que podem ser configurados.
- [ ] O usuário consegue abrir o detalhe do Place e a experiência completa de Recommendations.
- [ ] Visualizar a seção não cria novas Recommendations persistidas, não salva lugares e não altera o Roteiro.
- [ ] Catálogo e descoberta externa continuam acessíveis.
- [ ] Nenhuma migration, secret, Provider novo ou alteração de Production é necessária.
- [ ] Unit/integration tests aplicáveis e E2E passam.
- [ ] Documentation Validation e Engineering Validation passam no SHA final.

## 9. Estratégia de testes

### Recommendation experience

- modo somente leitura não persiste novas Recommendations;
- modo interativo existente continua preservando o comportamento da tela completa;
- view model mantém Reasons, Confidence, Limitations, imagem, faixa de preço e distância;
- ausência de contexto permanece explícita.

### Interface

- seção contextual aparece com seleção limitada;
- preço é apresentado somente como faixa do catálogo;
- custos/riscos/espera não medidos não são apresentados como fatos;
- links de detalhe e Recommendations funcionam;
- imagem e fallback não quebram o layout;
- estado neutro é acessível.

### E2E

- abrir uma Viagem com contexto e encontrar a seção contextual;
- verificar seleção limitada, imagem/fallback, preço e distância;
- navegar para detalhe e Recommendations completas;
- confirmar que salvar lugares e atividades continuam vazios após somente visualizar a seção;
- validar estado de contexto insuficiente;
- validar desktop e viewport móvel.

## 10. Riscos e mitigação

**Duplicação de lógica:** reutilizar `loadRecommendationExperience` e view models.

**Efeito colateral na visão principal:** modo de leitura explicitamente não persistente.

**Falsa precisão:** separar faixa de preço de custo real e distância de rota/tempo.

**Recomendação opaca sob contexto insuficiente:** estado neutro e indicação de dados faltantes.

**Decisão executada por engano:** a superfície oferece apenas navegação para ações existentes; não executa ações.

## 11. Governança

- sem migration;
- sem Production;
- sem novo Provider;
- sem novo conceito de domínio;
- sem alteração direta de `main`;
- PR somente após gates aplicáveis passarem;
- merge somente mediante autorização humana explícita.

## 12. Definition of Done

O incremento somente será considerado concluído quando os critérios de aceite forem satisfeitos, a documentação estiver registrada, os testes aplicáveis tiverem evidência real e a PR estiver pronta para revisão humana. O merge permanece fora da execução autônoma.