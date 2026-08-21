---
id: RB-CTX-164
title: Context Pack do RB-INC-164 — Identidade única e catálogo external-first de Places
description: Delimita a deduplicação de identidade na Discovery e o enriquecimento external-first preservando estado canônico e Provenance.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-20"
last_updated: "2026-08-20"
authors: [RouteBook Team]
tags: [implementation, context-pack, place-catalog, discovery, overture, deduplication]
related_documents: [RB-INC-164, RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-142, RB-INC-148, RB-INC-156, RB-INC-162, RB-INC-163, RB-INC-136]
prerequisites: [RB-INC-142, RB-INC-148, RB-INC-156, RB-INC-162, RB-INC-163]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-164 — Identidade única e catálogo external-first de Places

## 1. Missão

Eliminar duplicidade perceptível na Discovery. O usuário deve enxergar um Lugar por identidade; RouteBook e Overture permanecem fontes rastreáveis por trás do item.

## 2. Unidade de trabalho

- issue: `#381`;
- branch: `codex/rb-inc-164-unified-place-identity`;
- PR empilhada: `#385` contra `codex/rb-inc-162-external-place-images`;
- base empilhada: `ea8d23958aa115b227ec8cbf7a6092cddfda313b` do RB-INC-162;
- Preview Vercel é o ambiente de aceite;
- integrações e Production permanecem gates humanos separados.

O helper transitório autorizado pelo Increment executou a montagem documental/formatação e se auto-removeu antes do candidato de validação. Ele não faz parte do diff final da PR.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/architecture/integrations-and-ports.md`;
5. `docs/architecture/adrs/rb-adr-012-google-maps-platform-as-initial-geospatial-provider.md`;
6. RB-INC-142, 148, 156, 162, 163 e este incremento.

## 4. Contratos preservados

- `Place` publicado continua canônico e possui `PlaceId`;
- `ExternalPlaceCandidate` continua read-only até promoção explícita;
- referência externa `linked` é a evidência mais forte de identidade;
- `possible_match` não cria vínculo automaticamente;
- Saved Place, Recommendation, Decision e Itinerary continuam usando estado canônico;
- Overture continua Provider de descoberta;
- Wikimedia do RB-INC-162 continua capability de mídia read-only;
- falha Overture degrada para published-only;
- lista e mapa representam o mesmo conjunto;
- links Google Maps preservam RB-INC-163 e o fallback de origem do RB-INC-162.

## 5. Projeção autorizada

A aplicação pode derivar um read model efêmero:

```text
UnifiedPlaceDiscoveryItem
  = published
  | enriched (published + external)
  | external
```

Isso não é novo agregado nem entidade persistida. `enriched` usa o Place para conteúdo e ações canônicas e o candidato para contexto externo de apresentação.

## 6. Match forte

- categoria canônica igual;
- nome/endereço normalizados ou tokens distintivos compatíveis;
- proximidade geográfica é evidência auxiliar, nunca prova isolada;
- tokens regionais como `Pipa`, `RN` e `Tibau do Sul` não bastam;
- artigos e preposições não impedem equivalência;
- casos duvidosos falham fechado.

A reconciliação pode classificar variantes nominais óbvias como `possible_match`, mas não cria `linked` sem referência persistida existente.

## 7. Representante externo

Quando múltiplos candidatos equivalem à mesma identidade, a escolha é determinística: `linked` primeiro, depois maior confiança, endereço explícito, menor distância e por fim `provider + externalId`.

## 8. UX e imagem

- Fonte não estrutura a lista principal;
- `enriched`: `Curado + atualizado`;
- `published`: `Curado pelo RouteBook`;
- `external`: `Descoberta atual`;
- Provenance permanece em texto secundário;
- item enriquecido mantém detalhe, Saved Place e ação de Roteiro;
- imagem curada vence; na ausência, pode reutilizar o preview externo do RB-INC-162;
- Google Places Photos fica fora deste incremento e está registrado separadamente na issue `#382`.

## 9. Limites

- no máximo 200 candidatos Overture por leitura;
- deduplicação antes do limite visual de 60 external-only;
- sem chamadas adicionais de Provider para deduplicar;
- sem migration ou nova credencial;
- sem API paga neste incremento.

## 10. Caminhos permitidos

```text
modules/place-catalog/src/external-place.ts
modules/place-catalog/src/external-place.test.ts
apps/web/lib/place-discovery-feed.ts
apps/web/lib/place-discovery-feed.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/place-discovery.module.css
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/unified-place-identity.spec.ts
docs/implementation/increments/rb-inc-164-unified-place-identity.md
docs/implementation/context-packs/rb-inc-164-unified-place-identity.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 11. Gates

`pnpm format:check`, `pnpm docs:validate`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e`.

Documentation Validation e Engineering Validation devem passar no mesmo SHA; Preview Vercel deve estar READY nesse SHA.

## 12. Proibições

- não alterar silenciosamente o estado do RB-ADR-012;
- não ativar Google Places/Photos;
- não persistir resultados Overture por leitura;
- não promover/publicar automaticamente;
- não fundir dois lugares somente por proximidade;
- não inventar dados ausentes;
- não concluir M8 por evidência técnica;
- não integrar na main nem promover Production sem gate humano.

## 13. Handoff

Relatar política de identidade, arquivos alterados, testes executados, SHA final, CI, Preview, riscos residuais e a dependência separada de `#382` para ampliar cobertura de imagens.