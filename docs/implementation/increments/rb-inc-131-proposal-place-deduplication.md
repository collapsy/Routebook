---
id: RB-INC-131
title: Deduplicação de Place na Geração de Itinerary Proposal
description: Impede que Recommendations de Places já presentes no Roteiro voltem como novas Activities propostas.
document_type: implementation-increment
owner: Proposal Management and Data
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, proposal-management, itinerary, mvp, production-defect]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-ARC-001, RB-ARC-003, RB-DOM-002, RB-DEL-001, RB-QA-001, RB-INC-129, RB-INC-130]
prerequisites: [RB-INC-130]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-131 — Deduplicação de Place na Geração de Itinerary Proposal

## 1. Objetivo

Impedir que uma Recommendation gere nova Proposed Activity quando o mesmo Place já
está vinculado a uma Activity do Roteiro autoritativo.

Issue: #302.

Branch: `codex/rb-inc-131-proposal-dedup`.

## 2. Problema

Na retomada produtiva do RB-INC-129, a Proposal incluiu novamente três Places já
presentes no Roteiro. A Proposal permaneceu isolada e foi descartada, mas sua aceitação
criaria duplicatas conceituais e reduziria a qualidade da decisão.

## 3. Escopo

- carregar os `placeId` vinculados às Activities do Roteiro autoritativo;
- excluir Recommendations desses Places antes de compor o contexto de geração;
- manter Recommendations de Places ainda não planejados;
- comprovar a regra no adaptador PostgreSQL e na jornada E2E;
- repetir o smoke produtivo do RB-INC-129 após integração.

## 4. Fora de escopo

- alterar linguagem, invariantes ou estados de Domain;
- deduplicar por título, proximidade ou heurística;
- mudar o algoritmo de distribuição entre Dias;
- aplicar Proposal automaticamente;
- remover dados sintéticos de Production.

## 5. Critérios de aceite

- [x] Recommendation de Place já ligado a Activity não entra no contexto de geração;
- [x] Recommendation elegível de Place ainda não planejado continua disponível;
- [x] Proposal sem candidatos permanece ready e sem mudanças;
- [x] teste PostgreSQL comprova a exclusão pela identidade do Place;
- [x] E2E comprova o fluxo desde o Roteiro parcialmente preenchido;
- [x] lint, typecheck, testes, build e documentação estão verdes;
- [x] correção integrada e validada em Production;
- [x] RB-INC-129 pode retomar a jornada sem proposta duplicada.

## 6. Testes obrigatórios

- teste de integração do contexto autoritativo PostgreSQL;
- E2E de geração de Proposal;
- lint, typecheck, testes e build;
- `pnpm docs:validate`;
- Engineering Validation e Documentation Validation;
- smoke de Production com a Trip sintética do RB-INC-129.

## 7. Rollback

Reverter o filtro no adaptador, os testes e esta documentação. Nenhum schema ou dado
existente precisa de rollback.

## 8. Evidências

- PR #303 integrada no commit `b8d3e669`;
- Engineering Validation no PR `31540209253`: aprovada, com 83 testes;
- Engineering Validation pós-merge `31540631621`: aprovada, com 83 testes;
- Documentation Validation e Preview: aprovados;
- deployment `dpl_6hp5feWzaqz7eNARxFZ7ewZJUTgR`: `READY` em Production;
- nova Proposal produtiva apresentou somente `Vida Noturna na Avenida Baía dos
  Golfinhos`; Centro Gastronômico de Pipa, Praia do Amor e Baía dos Golfinhos,
  já planejados, não foram propostos novamente;
- a Proposal permaneceu isolada e foi descartada explicitamente sem alterar o Roteiro.
