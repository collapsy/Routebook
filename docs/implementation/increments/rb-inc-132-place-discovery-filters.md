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

- [ ] pesquisa básica preserva os demais filtros;
- [ ] categoria, distância e Price Range afetam lista e mapa igualmente;
- [ ] distância usa a Hospedagem e permanece identificada como geodésica estimada;
- [ ] Price Range ausente é exibido como indisponível, nunca gratuito;
- [ ] filtros ativos são visíveis, removíveis isoladamente e limpáveis em conjunto;
- [ ] estado sem resultados orienta limpar ou ampliar filtros;
- [ ] experiência funciona por teclado e em viewport móvel;
- [ ] domínio, migration, testes, documentação, CI e Production estão verdes.

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
