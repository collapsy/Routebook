---
id: RB-CTX-219
title: Context Pack do RB-INC-219 — Etapas e Discovery por Destino
description: Delimita a primeira entrega de múltiplos Destinos na mesma Viagem, com datas e exploração geográfica explícita.
document_type: implementation-context-pack
owner: Trip Management and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-10-16"
last_updated: "2026-10-22"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip, destination, discovery]
related_documents: [RB-INC-219, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-PRD-006, RB-PRD-007, RB-UX-001, RB-DATA-001, RB-ARC-001, RB-ADR-012]
prerequisites: [RB-INC-218]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-219 — Etapas e Discovery por Destino

## Leitura obrigatória

1. `AGENTS.md`, `docs/core/routebook-bible.md`, `docs/README.md`;
2. RB-INC-219;
3. RB-DOM-001, RB-DOM-002 e RB-DOM-003 para Trip, Destination, Accommodation, Region e Trip Day;
4. RB-PRD-006 e RB-PRD-007 para requisitos e regras de múltiplos Destinos;
5. RB-UX-001 para exploração, Roteiro e navegação futura de múltiplos Destinos;
6. RB-DATA-001, RB-ARC-001 e RB-ADR-012 para persistência, limites modulares e geoespacial;
7. RB-INC-175/CTX-175 e RB-INC-218/CTX-218 para Discovery por Region e jornada vigente;
8. os arquivos permitidos e testes adjacentes.

## Decisão humana recebida

O usuário solicitou e confirmou trabalhar em uma Viagem que começa em Joinville e inclui visita a Itapema no fim de semana. Pediu distinção clara das cidades e catálogos. A primeira entrega usa a Etapa da Viagem já esboçada no modelo de domínio. A hospedagem da base permanece válida no bate-volta; a hospedagem adicional requer próximo incremento.

## Contratos a preservar

- Trip continua a ter um Destination principal.
- Stage é uma relação datada da Trip, com Destination próprio; não substitui Trip Day nem Activity.
- Region usada por Discovery é derivada do Destination escolhido, ou da Hospedagem principal apenas quando o principal é escolhido.
- Place não é duplicado por Destination ou por Trip. TripPlacePreference mantém chave TripId + PlaceId.
- Ações de escrita são autorizadas no servidor; query string não é fonte de autorização.
- Lista e mapa preservam o mesmo conjunto de Lugares.

## Caminhos e testes

Somente os caminhos e comandos do RB-INC-219. As fixtures determinísticas de Joinville e Itapema em `destination-suggestions.ts` são permitidas apenas para o E2E da seleção; não devem aparecer fora do modo de teste. Se outro arquivo for indispensável, explicar a necessidade e atualizar ambos os documentos antes de editá-lo. Registrar resultados reais, inclusive falhas de ambiente.

## Correção vinculada à issue #540

A pesquisa de Place por texto no Destino da Etapa deve filtrar candidatos Overture antes do limite de 200. O termo é validado e reaplicado na busca de revalidação antes de salvar; a Categoria e a Region selecionadas continuam obrigatórias. Os caminhos adicionais permitidos pela issue são `modules/place-catalog/src/external-place.ts`, `modules/place-catalog/src/external-place.test.ts`, `apps/web/lib/overture-place-search.ts`, `apps/web/lib/overture-place-search.test.ts` e os testes de ação em `apps/web/app/viagens/[tripId]/lugares/actions.test.ts`. Não mudar a classificação da fonte nem ativar outro Provider.

Na mesma busca, o Overture retornou dois IDs com nome Hard Rock Cafe Itapema. Um aponta para Porto Belo, embora a [fonte oficial](https://cafe.hardrock.com/itapema/) localize a unidade no Píer Oporto em Itapema, com acesso pela Rua 323. A correção adicional da issue #540 pode descartar somente esse ID com endereço divergente no adaptador externo. Não deduplicar por nome: filiais homônimas e outros candidatos permanecem distintos.
