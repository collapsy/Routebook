---
id: RB-CTX-203
title: Context Pack do RB-INC-203 — TripPlacePreference como fonte autoritativa da Itinerary Proposal
description: Delimita a troca da origem automática dos candidatos da Proposal para TripPlacePreference.
document_type: implementation-context-pack
owner: Proposal Management and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-19"
last_updated: "2026-09-19"
authors: [RouteBook Team]
tags: [implementation, context-pack, itinerary-proposal, trip-place-preference]
related_documents: [RB-CORE-0004, RB-ADR-028, RB-INC-203]
prerequisites: [RB-ADR-028, RB-INC-202]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-203 — Context Pack

## Objetivo

Implementar exclusivamente o passo 5 do RB-ADR-028: usar TripPlacePreference como origem autoritativa dos candidatos da Itinerary Proposal.

## Leia antes de alterar

- `AGENTS.md`
- `docs/core/routebook-bible.md`
- `docs/README.md`
- `docs/architecture/adrs/rb-adr-028-trip-place-preference-and-temporal-replanning.md`
- `docs/implementation/increments/rb-inc-196-contextual-itinerary-composer.md`
- `docs/implementation/increments/rb-inc-200-trip-place-preference-core.md`
- `docs/implementation/increments/rb-inc-201-trip-place-preference-persistence.md`
- `docs/implementation/increments/rb-inc-202-trip-selection-ui.md`

## Regras obrigatórias

1. WANT é elegível por padrão.
2. MAYBE só é elegível com includeMaybe explícito.
3. NOT_INTERESTED e ausência de preferência nunca são elegíveis.
4. MUST_DO vem antes dos demais candidatos elegíveis.
5. Place já presente em Activity não volta como candidato.
6. Recommendation e Discovery não entram automaticamente.
7. A geração é somente leitura sobre preferências e Itinerary.
8. Nenhum schema/migration novo.
9. Nenhuma alteração em Production.
10. Nenhum merge na main sem autorização humana.

## Caminhos permitidos

Os caminhos são os listados no RB-INC-203.

## Testes obrigatórios

- seleção WANT/MAYBE/NOT_INTERESTED/MUST_DO;
- exclusão de Place já planejado;
- contexto PostgreSQL autoritativo;
- regressão do gerador;
- ação/UX de includeMaybe;
- E2E da geração;
- validação documental e engenharia.
