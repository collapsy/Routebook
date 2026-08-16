---
id: RB-INC-147
title: Recommendations Focadas com Divulgação Progressiva
description: Reduz a carga cognitiva da experiência completa de Recommendations preservando a ordenação canônica, os estados existentes e todas as ações explícitas.
document_type: implementation-increment
owner: Decision Intelligence and Experience
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors:
  - RouteBook Team
tags:
  - implementation
  - recommendations
  - decision-intelligence
  - progressive-disclosure
  - accessibility
  - mobile
related_documents:
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

# RB-INC-147 — Recommendations Focadas com Divulgação Progressiva

## 1. Resultado vertical

Na experiência completa de Recommendations, o usuário encontra primeiro um conjunto pequeno de opções ainda pendentes de decisão, na mesma ordem produzida pelo mecanismo canônico, e pode revelar explicitamente a lista completa quando quiser.

A mudança reduz a carga de varredura sem esconder permanentemente opções, sem criar novo ranking e sem alterar o significado ou o estado de nenhuma Recommendation.

## 2. Issue e branch

- Issue: `#343`.
- Branch: `codex/rb-inc-147-focused-recommendations`.
- Base: `main` no merge commit `a5f2f6e01f3f013cac34023b8d2b12ce24d9adb2`.
- Related: `#319` — validação real do MVP em Pipa.

## 3. Problema observado

A validação técnica pré-viagem registrada na issue `#319` encontrou 30 Recommendations renderizadas como cards completos em sequência.

A tela preserva explicabilidade e controle, mas o volume aumenta a carga cognitiva e aproxima a experiência de um catálogo extenso. Esse comportamento entra em tensão com os princípios constitucionais:

- contexto antes de popularidade;
- valor antes de volume;
- controle do usuário antes de automação.

O `RB-INC-144` já criou uma entrada contextual curta na visão da Viagem, mas a experiência completa ainda precisa oferecer profundidade sem exigir que toda a profundidade seja exibida de uma só vez.

## 4. Hipótese

Apresentar primeiro poucas Recommendations pendentes, mantendo todas as demais acessíveis sob demanda, reduz o esforço de varredura e melhora a clareza da próxima escolha sem diminuir transparência nem autonomia.

A implementação não valida a hipótese. O efeito real deverá ser observado na Fase B do `RB-INC-136`.

## 5. Princípios e invariantes

- Recommendation não é Decision.
- Lugar salvo não é Atividade de Roteiro.
- Estados `presented`, `accepted`, `rejected`, `invalidated`, `expired` e `superseded` não são reinterpretados pela UI.
- `isSaved` e `isPlanned` são informações de apresentação e não criam novos estados de Recommendation.
- A ordem entregue por `loadRecommendationExperience` é a única ordem autorizada.
- A UI não calcula score, prioridade, popularidade ou relevância paralela.
- Score bruto continua não exposto.
- Reasons, Confidence e Limitations permanecem semanticamente idênticos.
- Distância geodésica continua sendo linha reta, nunca rota ou tempo.
- Nenhuma Recommendation é removida do acesso do usuário devido à apresentação focada.
- Nenhuma visualização aplica efeito canônico.

## 6. Escopo

### 6.1 Visão focada padrão

A rota `/viagens/[tripId]/recomendacoes` deve abrir em modo focado por padrão.

O modo focado apresenta, no máximo, as seis primeiras Recommendations que ainda requerem decisão, preservando a ordem original de `experience.cards`.

Uma Recommendation é considerada **pendente de decisão para fins exclusivamente de apresentação** quando:

- `status === "presented"`;
- não está salva (`isSaved === false`);
- não está planejada (`isPlanned === false`).

Essa classificação é uma projeção de UI. Ela não modifica estado, domínio ou persistência.

### 6.2 Recommendations já consideradas

Recommendations que já apresentam evidência de consideração devem continuar acessíveis no modo focado em uma seção separada e compacta.

Para fins de apresentação, entram nessa seção cards que satisfaçam pelo menos uma condição:

- `status === "accepted"`;
- `status === "rejected"`;
- `isSaved === true`;
- `isPlanned === true`.

A seção deve preservar a ordem relativa original dos cards e comunicar os estados existentes sem criar um novo estado chamado “considerada”.

### 6.3 Divulgação progressiva

Quando houver Recommendations além da seleção focada, a interface deve informar quantas opções estão sendo exibidas e oferecer ação explícita para abrir a visualização completa.

A visualização completa deve:

- usar a mesma rota com estado de apresentação explícito em query string;
- renderizar todos os cards em `experience.cards` na ordem original;
- preservar todas as ações atualmente disponíveis;
- permitir retorno ao modo focado sem mutação.

A query string não é estado de domínio nem precisa ser persistida.

### 6.4 Conteúdo preservado

Os cards completos continuam apresentando, conforme disponibilidade:

- imagem/fallback;
- categoria;
- nome e resumo;
- Confidence qualitativa;
- Saved/Planned/Accepted/Rejected;
- distância geodésica;
- Reasons;
- Limitations;
- link para detalhes;
- ações explícitas de salvar, adicionar ao Roteiro e ignorar quando autorizadas pelo estado atual.

## 7. Fora de escopo

- alterar o algoritmo de geração ou ordenação de Recommendation;
- introduzir score, popularidade ou heurística de ranking na camada web;
- criar novo agregado, entidade, value object, estado de domínio ou migration;
- modificar transições de Recommendation;
- modificar transações/idempotência de Decision;
- adicionar IA, LLM, agente ou Provider;
- inferir preço real, rating público, disponibilidade, horário, trânsito, rota ou duração;
- alterar catálogo, descoberta externa ou promoção de Places;
- curadoria adicional de imagens;
- mudar navegação global;
- executar ação de Production;
- concluir M8 ou fabricar evidência humana.

## 8. Contratos reutilizados

- `loadRecommendationExperience` é a fonte única da coleção e da ordem.
- `RecommendationCardViewModel` fornece estado, Reasons, Confidence, Limitations, mídia e flags de Saved/Planned.
- `RecommendationCard` continua sendo o card completo para decisão.
- Server Actions de ignorar, salvar e adicionar ao Roteiro permanecem inalteradas semanticamente.
- `RB-INC-041` protege explicabilidade, ausência de Score e persistência de rejeição.
- `RB-INC-042` protege ações explícitas, idempotência e efeitos canônicos.

## 9. Modelo de apresentação

A composição focada deve ser uma função pura e determinística sobre `RecommendationCardViewModel[]`.

A função deve retornar, sem mutar os cards:

- `focusedCards`: até seis cards pendentes, em ordem original;
- `consideredCards`: cards aceitos, rejeitados, salvos ou planejados, em ordem original;
- `remainingPendingCount`: quantidade de pendentes não exibidos no modo focado;
- `totalCount`: quantidade total de cards recebidos.

No modo completo, `experience.cards` deve ser renderizado diretamente em ordem original.

## 10. Estados da experiência

Devem continuar funcionais:

- Destino não suportado;
- Contexto incompleto;
- nenhuma Recommendation disponível;
- Recommendations ativas;
- Recommendation ignorada;
- Recommendation aceita;
- Lugar salvo;
- Lugar planejado;
- Recommendation invalidada por mudança de Contexto;
- sucesso de ações;
- erro de ação;
- modo focado sem opções pendentes, mas com histórico acessível;
- modo completo.

## 11. Acessibilidade e responsividade

- controles de divulgação devem ser links ou controles semanticamente navegáveis por teclado;
- o modo focado deve comunicar quantidade exibida e quantidade total em texto, não apenas visualmente;
- status não pode depender somente de cor;
- headings devem manter hierarquia compreensível;
- não introduzir overflow horizontal;
- mobile não deve renderizar inicialmente dezenas de cards completos quando houver mais de seis pendentes.

## 12. Caminhos permitidos

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

Qualquer caminho adicional exige justificativa no Context Pack e no pull request.

## 13. Critérios de aceite

- [ ] O modo padrão exibe no máximo seis Recommendations pendentes.
- [ ] `focusedCards` preserva exatamente a ordem relativa recebida do engine.
- [ ] Cards salvos, planejados, aceitos ou rejeitados não ocupam as seis posições pendentes.
- [ ] Recommendations já consideradas continuam acessíveis no modo focado, com seus estados existentes.
- [ ] A interface comunica quantidade exibida, pendentes restantes e total quando aplicável.
- [ ] Existe ação explícita para visualizar todas as Recommendations.
- [ ] O modo completo renderiza todos os cards na ordem original.
- [ ] É possível retornar ao modo focado sem mutação.
- [ ] Nenhuma Recommendation é reclassificada ou persistida pela projeção de apresentação.
- [ ] Reasons, Confidence, Limitations, imagem/fallback, preço de catálogo e distância preservam significado.
- [ ] Salvar, adicionar ao Roteiro e ignorar continuam exigindo ação explícita e respeitando os contratos existentes.
- [ ] Estados de Destino não suportado, Contexto parcial, vazio, sucesso e erro continuam funcionais.
- [ ] Desktop e viewport móvel não apresentam overflow horizontal.
- [ ] Nenhuma migration, secret, Provider ou alteração de Production é necessária.
- [ ] Documentation Validation e Engineering Validation passam no mesmo SHA final.

## 14. Estratégia de testes

### Unidade / experiência

- seleção focada respeita limite de seis;
- preserva ordem original;
- cards considered são separados sem mutação;
- Saved/Planned `presented` não ocupam slot pendente;
- `accepted` e `rejected` permanecem em considered;
- quantidade restante é correta;
- entrada vazia funciona;
- coleção original permanece intacta.

### E2E

- Viagem com catálogo amplo abre com no máximo seis cards pendentes completos;
- resumo informa que é uma seleção;
- `Ver todas as sugestões` revela a coleção completa;
- ordem completa continua canônica;
- voltar ao modo focado funciona;
- ignorar uma Recommendation mantém a rejeição após reload e a torna acessível no agrupamento de estado;
- salvar e adicionar ao Roteiro continuam funcionando na experiência completa;
- estado de Contexto incompleto continua explícito;
- desktop e mobile são cobertos.

### Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 15. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| UI criar segundo ranking | somente `filter`, `slice` e partição estável sobre a ordem recebida; nenhum `sort` |
| esconder opções | link explícito para visualização completa e histórico acessível |
| inventar novo estado | “já consideradas” existe apenas como heading de apresentação; badges continuam usando estados reais |
| regressão nas ações | não alterar contratos das Server Actions; E2E cobre save/add/ignore |
| contagens confusas | derivar todas as contagens da mesma coleção em função pura testada |
| experiência mobile ainda longa | limite inicial de seis cards completos e seção histórica compacta |

## 16. Governança

- sem mudança de domínio;
- sem migration;
- sem Provider;
- sem Production;
- sem novo algoritmo canônico;
- sem push direto na `main`;
- CI deve validar o SHA final;
- merge exige autorização humana explícita.

## 17. Definition of Done

O incremento está pronto para revisão quando os critérios de aceite estiverem satisfeitos, o Context Pack e o Registry estiverem atualizados, todos os testes aplicáveis possuírem evidência real e Documentation Validation + Engineering Validation estiverem verdes no mesmo SHA. A integração na `main` permanece uma decisão humana separada.
