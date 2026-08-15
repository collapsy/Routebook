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

Conectar a visão principal da Viagem às Recommendations determinísticas já existentes, apresentando uma pequena seleção explicável e somente leitura, sem criar novo estado de domínio.

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

## 4. Conceitos relevantes

| Termo oficial | Interpretação necessária |
| --- | --- |
| Viagem | Contexto organizador do produto, contendo destino, período, grupo, preferências, restrições e referências geográficas. |
| Lugar | Opção descoberta ou catalogada; visualizar ou salvar não o torna atividade do Roteiro. |
| Recommendation | Orientação contextual acompanhada dos fatores relevantes; não é Decision e não altera estado por si mesma. |
| Decision | Escolha explícita do usuário; este incremento apenas navega para ações existentes e não cria Decision. |
| Lugar salvo | Interesse persistido; não equivale a atividade do Roteiro. |
| Distância geodésica | Estimativa em linha reta; não deve ser apresentada como rota, trânsito ou duração. |

## 5. Invariantes

- Recommendation não é Decision.
- Lugar salvo não é Atividade de Roteiro.
- Visualização da seção contextual não aplica efeitos canônicos.
- Informação desconhecida permanece desconhecida.
- Estimativa deve ser identificada como estimativa.
- Mapa e lista preservam o mesmo significado quando usados nesta jornada.
- Falha de Provider não redefine o catálogo canônico.
- IA não é necessária para esta capacidade.

## 6. Decisões arquiteturais aplicáveis

| ADR | Decisão que deve ser respeitada |
| --- | --- |
| RB-ADR-001 | Preservar o monólito modular e bounded contexts existentes. |
| RB-ADR-003 | Manter a implementação web no Next.js/App Router existente. |
| RB-ADR-005 | Nenhuma mudança de persistência ou PostGIS é necessária neste incremento. |
| RB-ADR-009 | Validar entradas/contratos existentes nas fronteiras; não inventar dados. |
| RB-ADR-010 | Cobrir regras e jornadas com testes automatizados existentes. |
| RB-ADR-012 | Não substituir a estratégia geoespacial atual neste incremento. |
| RB-ADR-019 | Usar CI existente como gate de validação. |

## 7. Contratos existentes

- `loadRecommendationExperience(tripId, now)` como orquestrador existente da experiência de Recommendations;
- `RecommendationCardViewModel` para Reasons, Confidence, Limitations, imagem e distância;
- `toRecommendationCardViewModel` como view model sem `RecommendationScore` exposto;
- `formatGeodesicDistance` para apresentação explícita de distância em linha reta;
- `PlacePrimaryImage` para imagem governada e fallback;
- `/viagens/[tripId]/recomendacoes` para experiência completa;
- `/viagens/[tripId]/lugares/[placeSlug]` para detalhes.

A implementação pode introduzir uma opção de leitura em `loadRecommendationExperience` para impedir persistência quando a visão principal apenas consulta Recommendations. O comportamento atual da página completa deve permanecer compatível.

## 8. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/page.tsx
apps/web/components/contextual-recommendation-strip.tsx
apps/web/lib/recommendation-experience.ts
apps/web/lib/recommendation-experience.test.ts
apps/web/e2e/recommendations-experience.spec.ts
docs/implementation/increments/rb-inc-144-contextual-decision-view.md
docs/implementation/context-packs/rb-inc-144-contextual-decision-view.md
docs/registry.md
.github/workflows/rb-inc-144-registry-helper.yml
```

O workflow listado acima é um helper temporário exclusivamente mecânico para registrar os dois novos documentos no Registry porque o conector de edição disponível não oferece operação de append. Ele deve:

- executar somente na branch `codex/rb-inc-144-contextual-decision-view`;
- inserir somente `RB-INC-144` e `RB-CTX-144`;
- não alterar outros documentos;
- usar somente `GITHUB_TOKEN` implícito do Actions;
- ser removido antes da PR final.

## 9. Caminhos somente leitura

```text
modules/decision-intelligence/src/**
modules/place-catalog/src/**
packages/database/src/**
docs/core/routebook-bible.md
docs/product/**
docs/domain/**
docs/architecture/**
```

Não alterar esses caminhos para corrigir o escopo do incremento. Se um contrato de domínio precisar mudar, interromper e escalar.

## 10. Caminhos proibidos

```text
packages/database/drizzle/**
apps/web/public/place-images/**
```

Não criar migration, asset novo ou secret neste incremento. O único arquivo em `.github/workflows/` permitido é o helper temporário explicitamente listado acima, que deve ser removido antes da PR final.

## 11. Entradas disponíveis

- Trip existente e seu contexto já persistido;
- Traveler Profile existente, quando configurado;
- Accommodation e coordenada, quando configuradas;
- Places publicados do destino;
- Recommendations determinísticas existentes;
- imagens governadas/fallback existentes.

Não usar dados externos novos para preencher lacunas.

## 12. Saídas esperadas

- seção contextual na visão principal da Viagem;
- componente de apresentação limitado e reutilizável;
- modo de leitura seguro para Recommendations quando necessário;
- testes de view model/loader;
- E2E da jornada principal;
- documentação e Registry atualizados;
- helper temporário removido antes da PR final.

## 13. Critérios de aceite

- [ ] A visão da Viagem apresenta a decisão contextual antes do catálogo secundário.
- [ ] A seleção é limitada e vem do mesmo motor de Recommendations já existente.
- [ ] Reasons, Confidence e Limitations não são reinterpretados.
- [ ] Imagem/fallback é renderizada sem hotlink.
- [ ] Distância é explicitamente em linha reta quando presente.
- [ ] Detalhe do Place e Recommendations completas permanecem navegáveis.
- [ ] Visualizar a seção não cria novas Recommendations persistidas.
- [ ] Estado sem contexto é claro e acionável.
- [ ] Desktop e mobile são cobertos pela jornada E2E aplicável.

## 14. Restrições

- não alterar o domínio;
- não adicionar Provider ou dependência;
- não criar migration;
- não alterar Production;
- não criar nova regra de ranking na UI;
- não usar dados inventados;
- não afirmar que uma Recommendation é melhor por causa de uma heurística nova;
- não declarar testes executados sem execução real;
- não expandir o incremento;
- remover o helper de Registry antes da PR final.

## 15. Comandos

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Durante desenvolvimento, priorizar os testes diretamente afetados antes da suíte completa.

## 16. Dados e privacidade

Usar somente o contexto mínimo já necessário para a Recommendation da própria Trip. Não introduzir analytics, tracking comportamental ou novos dados pessoais. Fixtures devem usar dados sintéticos existentes.

## 17. Quando interromper e escalar

Interromper se:

- surgir necessidade de alterar o domínio;
- a seleção exigir novo conceito persistido;
- for necessário mudar o algoritmo canônico de Recommendation;
- for necessário novo Provider, secret ou infraestrutura;
- for necessária migration;
- um teste revelar divergência semântica entre Recommendations e a nova superfície;
- o escopo não puder ser satisfeito pelos caminhos permitidos.

## 18. Formato do relatório final

- resultado entregue;
- arquivos alterados;
- testes executados e resultados;
- testes não executados;
- riscos e pendências;
- mudanças documentais;
- issue `#337`;
- PR, quando aberta.
