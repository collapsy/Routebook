---
id: RB-INC-178
title: Continuidade de candidato descoberto para Salvos e Roteiro
description: Permite revalidar, materializar e salvar candidatos externos como Places globais em rascunho, sem publicação editorial automática.
document_type: implementation-increment
owner: Traveler Experience and Platform
status: Draft
version: "0.1.0"
created: "2026-09-03"
last_updated: "2026-09-03"
authors: [RouteBook Team]
tags: [implementation, place, saved-place, itinerary, routebook-anywhere]
related_documents: [RB-CORE-0004, RB-ARC-001, RB-ADR-013, RB-INC-164, RB-INC-176, RB-INC-177, RB-CTX-178]
prerequisites: [RB-INC-176, RB-INC-177]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-178 — Continuidade de candidato descoberto para Salvos e Roteiro

## 1. Contexto

- Epic: #411.
- Issue: #418.
- Branch: `codex/rb-inc-178-external-place-continuity`.
- Base: `main@a8e6ce39b36729f48fb10715a8ed39797d8f5772`.
- RB-INC-176 entrega identidade e reconciliação destination-agnostic.
- RB-INC-177 torna Discovery utilizável antes dos enriquecimentos opcionais.
- Antes deste incremento, um candidato seguro de uma cidade zero-seed não podia entrar em Salvos ou Roteiro sem existir um catálogo editorial para seu Destination.

## 2. Decisão de domínio

Place possui identidade global. Destination e Region são contexto de descoberta e consulta, não
parte da identidade do Place.

A decisão material foi autorizada pelo responsável do produto em 2026-09-03. Como consequência:

- `Place.destinationId` passa a ser opcional;
- `places.destination_id` passa a aceitar `NULL` por migration aditiva;
- vínculos existentes do catálogo curado são preservados como agrupamento editorial legado;
- nenhuma linha, fixture ou mídia de Pipa é removida;
- a mesma referência externa pode ser reutilizada entre Viagens e Destinations;
- Saved Place e Activity podem referenciar Place global em `draft`;
- Recommendation continua exigindo Place publicado em catálogo editorial;
- materialização operacional não equivale a publicação editorial.

## 3. Fluxo entregue

1. o usuário escolhe salvar um candidato externo exibido na Region da Viagem;
2. a Server Action autentica e autoriza edição da Viagem;
3. o servidor resolve novamente a Region e consulta o Provider;
4. somente o candidato reencontrado por `externalId` segue para reconciliação;
5. a identidade externa existente é reutilizada ou um Place global em `draft` é criado;
6. um Saved Place idempotente liga o Place à Viagem;
7. o Place salvo pode entrar no Roteiro pelos fluxos existentes.

O cliente nunca envia nome, coordenadas, categoria, Proveniência ou estado editorial confiáveis.

## 4. Segurança e reconciliação

- identidade externa `provider + externalId` permanece única;
- match provável bloqueia criação automática e pede revisão;
- candidatos rejeitados não são materializados;
- slug é reconciliado no recorte espacial;
- remoção ou indisponibilidade posterior do Provider não apaga Place, Saved Place ou Activity já persistidos;
- falha do Provider durante revalidação não produz dado inventado e retorna degradação explícita;
- logs de falha preservam apenas source da Region e mensagem técnica, sem coordenadas ou dados da hospedagem.

## 5. Experiência

- todo candidato externo seguro oferece `Salvar na viagem`;
- cidades zero-seed não dependem de catálogo editorial para continuidade;
- promoção editorial continua separada e só aparece quando há Destination curado inequívoco;
- Salvos, detalhe e Roteiro leem Places por identidade global e contexto espacial;
- Pipa mantém catálogo, imagens, guia prático e regressões existentes.

## 6. Persistência

Migration `0033_allow_global_places.sql` remove somente o `NOT NULL` de
`places.destination_id`. A alteração é compatível com dados existentes e não executa backfill,
merge ou exclusão.

## 7. Escopo

```text
modules/place-catalog/src/place.ts
modules/place-catalog/src/place.test.ts
modules/decision-intelligence/src/deterministic-recommendations.ts
packages/database/src/schema.ts
packages/database/src/place-repository.ts
packages/database/src/place-repository.test.ts
packages/database/src/place-promotion-service.ts
packages/database/src/place-promotion-service.test.ts
packages/database/drizzle/0033_allow_global_places.sql
packages/database/drizzle/meta/_journal.json
apps/web/app/viagens/[tripId]/lugares/actions.ts
apps/web/app/viagens/[tripId]/lugares/actions.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares-salvos/actions.ts
apps/web/app/viagens/[tripId]/lugares-salvos/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/actions.ts
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
docs/domain/domain-model.md
docs/domain/ubiquitous-language.md
docs/implementation/increments/rb-inc-178-external-place-continuity.md
docs/implementation/context-packs/rb-inc-178-external-place-continuity.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Fora de escopo

- publicação ou promoção editorial automática;
- Recommendation baseada em Place não publicado;
- ativação de novo Provider, billing ou Production;
- alteração de retenção, consentimento ou privacidade;
- remoção do conteúdo curado de Pipa;
- tornar o guia editorial e seus adapters de mídia destination-agnostic;
- integração na `main` sem autorização humana.

## 9. Critérios de aceite

- [ ] candidato é revalidado no servidor antes da mutação;
- [ ] cidade zero-seed permite salvar candidato seguro;
- [ ] Place criado permanece `draft` e sem publicação automática;
- [ ] external identity e Saved Place são idempotentes;
- [ ] provável duplicata continua bloqueada;
- [ ] Proveniência externa permanece persistida;
- [ ] Place salvo pode ser adicionado e removido do Roteiro;
- [ ] indisponibilidade futura do Provider não destrói planejamento persistido;
- [ ] Pipa permanece catálogo curado e regressão;
- [ ] CI e Preview estão verdes no mesmo SHA.
