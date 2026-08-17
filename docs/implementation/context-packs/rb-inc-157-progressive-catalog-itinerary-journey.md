---
id: RB-CTX-157
title: Context Pack do RB-INC-157 — Catálogo progressivo e jornada clara de criação do roteiro
description: Delimita a expansão progressiva de Discovery e a reorganização do Roteiro por Dia sem alterar estado canônico.
document_type: implementation-context-pack
owner: Traveler Experience and Place Catalog
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, context-pack, discovery, itinerary, ux, map]
related_documents: [RB-INC-157, RB-CORE-0004, RB-UX-002, RB-INC-155, RB-INC-156]
prerequisites: [RB-INC-155, RB-INC-156]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-157 — Catálogo progressivo e jornada clara de criação do roteiro

## 1. Missão do executor

Reduzir duas fricções observadas no preview pré-viagem:

1. permitir continuar a descoberta quando existem mais candidatos Overture novos do que a janela inicial de 60;
2. transformar a entrada do Roteiro numa jornada orientada por um Dia em foco, com próximo passo explícito e mapa contextual.

A implementação deve preservar estado canônico, Provenance, separação entre Saved Place e Atividade, e controle humano sobre decisões.

## 2. Incremento

- ID: `RB-INC-157`;
- issue: `#363`;
- branch: `codex/rb-inc-157-progressive-catalog-itinerary-journey`;
- baseline empilhada: `932b806dca0343b10c033509930c4700e69939bd`;
- relação: complementa RB-INC-156 e RB-INC-155 sem inferir evidência M8.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/ux/user-flows.md`;
5. `docs/ux/information-architecture.md`;
6. `docs/ux/interaction-specifications.md`;
7. `docs/implementation/increments/rb-inc-157-progressive-catalog-itinerary-journey.md`;
8. `docs/implementation/increments/rb-inc-156-unified-place-discovery.md`;
9. `docs/implementation/context-packs/rb-inc-156-unified-place-discovery.md`;
10. `docs/implementation/increments/rb-inc-155-pipa-place-practical-guide.md`.

## 4. Contratos preservados

- Place externo não é Place canônico;
- Saved Place não é Atividade do Roteiro;
- Recommendation não é Decision;
- Proposal não é estado aplicado até aceite explícito;
- lista e mapa de Discovery representam o mesmo conjunto visível;
- expansão da lista não executa nova publicação nem escrita canônica;
- consulta externa continua governada pelo limite máximo existente;
- um Dia selecionado controla simultaneamente conteúdo e contexto espacial;
- ausência de coordenadas não remove o Roteiro textual;
- distância geodésica continua identificada como estimativa em linha reta;
- criação manual e Período livre continuam semanticamente distintos;
- M8 exige evidência humana real separada.

## 5. Regras de UX

- estado vazio deve orientar a próxima ação;
- Viagem futura deve priorizar próximo passo, Roteiro e Salvos;
- Dia vazio pode levar diretamente a Explorar;
- navegação deve preservar contexto da Viagem;
- Mapa não pode ser a única forma de compreender o Dia;
- ações avançadas podem ser progressivamente reveladas quando isso reduzir competição visual sem ocultar capacidades essenciais.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados no RB-INC-157 e na issue `#363`.

## 7. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/place-discovery-filters.spec.ts e2e/itinerary.spec.ts e2e/itinerary-spatial.spec.ts
```

Engineering Validation e Documentation Validation devem concluir no mesmo SHA.

## 8. Proibições

- não aumentar a consulta externa acima de 200 candidatos;
- não alterar raio, taxonomia, confiança ou reconciliação Overture;
- não publicar, salvar ou inserir candidato externo no Roteiro por leitura;
- não transformar Saved Place em Atividade automaticamente;
- não inferir localização ausente;
- não esconder a alternativa textual ao mapa;
- não autoaplicar Itinerary Proposal;
- não criar migration, secret, SDK, API paga ou novo Provider;
- não editar ADR ou linguagem de domínio;
- não declarar evidência M8 a partir de teste técnico;
- não fazer merge nem promover para Production sem autorização humana separada.

## 9. Handoff

Relatar comportamento entregue, arquivos, testes efetivamente executados, estado de CI, cobertura variável da descoberta, issue, PR e preview. Expansão da descoberta não equivale a publicação e reorganização do Roteiro não altera semântica do domínio.
