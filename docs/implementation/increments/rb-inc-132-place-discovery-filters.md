---
id: RB-INC-132
title: Pesquisa e Filtros Obrigatórios na Descoberta de Places
description: Completa pesquisa textual e filtros de categoria, distância e Price Range com lista e mapa sincronizados.
document_type: implementation-increment
owner: Place Catalog and Experience
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, place-catalog, discovery, filters, mvp]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-PRD-006, RB-DOM-001, RB-DOM-002, RB-ARC-002, RB-UX-002, RB-DS-003, RB-QA-001, RB-INC-129]
prerequisites: [RB-INC-129]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-132 — Pesquisa e Filtros Obrigatórios na Descoberta de Places

## 1. Objetivo

Entregar a pesquisa básica e os filtros obrigatórios do MVP na área Explorar,
preservando o mesmo conjunto de Places na lista e no mapa.

Issue: #304.

Branch: `codex/rb-inc-132-place-discovery-filters`.

## 2. Problema

O RB-INC-129 comprovou lista, mapa e categoria em Production, mas a área Explorar não
possui pesquisa textual nem filtros por distância e Price Range. Os filtros ativos
também não podem ser removidos isoladamente nem limpos em conjunto.

## 3. Escopo

- representar Price Range qualitativo e opcional no Place Catalog;
- persistir Price Range sem tratar ausência como gratuito;
- pesquisar nome, resumo, categoria e endereço no Destino da Trip;
- filtrar por categoria, distância geodésica da Hospedagem e Price Range;
- identificar, remover isoladamente e limpar filtros ativos;
- renderizar lista e mapa a partir do mesmo conjunto filtrado;
- tratar ausência de Hospedagem e estado sem resultados com recuperação;
- cobrir domínio, persistência, apresentação e jornada responsiva.

## 4. Fora de escopo

- busca semântica, sugestão remota ou Place fora do Destino;
- Rating, Opening Hours, ordenação avançada ou Provider novo;
- cálculo de rota, trânsito ou tempo de deslocamento;
- alterar Salvos, Roteiro, Recommendations ou Proposals;
- mudar política de acesso de Production (#305).

## 5. Critérios de aceite

- [x] pesquisa básica preserva os demais filtros;
- [x] categoria, distância e Price Range afetam lista e mapa igualmente;
- [x] distância usa a Hospedagem e permanece identificada como geodésica estimada;
- [x] Price Range ausente é exibido como indisponível, nunca gratuito;
- [x] filtros ativos são visíveis, removíveis isoladamente e limpáveis em conjunto;
- [x] estado sem resultados orienta limpar ou ampliar filtros;
- [x] experiência funciona por teclado e em viewport móvel;
- [x] domínio, migration, testes, documentação, CI e Production estão verdes.

## 6. Testes obrigatórios

- unitários do Place e do filtro de catálogo;
- integração PostgreSQL do repositório de Place;
- E2E responsivo da pesquisa e dos filtros;
- lint, typecheck, testes e build;
- `pnpm docs:validate`;
- Engineering Validation, Documentation Validation e Preview;
- smoke em Production com a Trip sintética do RB-INC-129.

## 7. Rollback

Reverter UI, filtro, campo opcional e documentação. A coluna nullable pode permanecer
sem alterar o significado de registros preexistentes; rollback destrutivo de migration
fica fora deste incremento.

## 8. Evidências de conclusão

- implementação: PR #307, squash merge `10943fca21da967269ec1b30f12c4912037f0629`;
- CI: Engineering Validation, Documentation Validation e Preview verdes, incluindo
  migration PostgreSQL, testes e E2E responsivo;
- deploy: `dpl_73NWcYLAD2SY9zKY2DYh8XNCjgP9`, target Production e estado `READY`;
- banco: migration Neon `311f2142-6e6b-43d0-8a59-d7b1a6602cf6` validada em branch
  temporária e promovida com aprovação explícita para a branch principal;
- smoke autenticado: Trip `956badd7-b414-4606-96e6-ffc8025e5567`, com cinco Places
  no catálogo, pesquisa por `gastronomico`, remoção isolada, filtros combinados de
  categoria, distância e Price Range, estado vazio e limpeza total;
- responsividade: viewport 390 × 844 sem overflow horizontal, com todos os controles
  visíveis e operáveis;
- observabilidade: health live e ready em 200, banco disponível e nenhum erro de
  runtime após a promoção da migration;
- follow-up operacional: issue #308 registra a lacuna de promoção de migrations antes
  de código dependente em Production.
