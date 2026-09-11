---
id: RB-CTX-191
title: Context Pack do RB-INC-191 — Discovery Anywhere na Proposta de Roteiro
description: Delimita a ponte entre Discovery segura e a geração autoritativa de Itinerary Proposal, preservando Recommendation publicada e Proposal vazia auditável sem ação enganosa.
document_type: implementation-context-pack
owner: Proposal Management and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-11"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, itinerary-proposal, discovery, routebook-anywhere, provider-first]
related_documents: [RB-INC-191, RB-CORE-0004, RB-DOM-001, RB-DOM-003, RB-ARC-003, RB-INC-099, RB-INC-131, RB-INC-178, RB-INC-184, RB-INC-185]
prerequisites: [RB-INC-178, RB-INC-184, RB-INC-185]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-191 — Discovery Anywhere na Proposta de Roteiro

## 1. Missão

Fazer a ação explícita de gerar uma Itinerary Proposal aproveitar Lugares seguros da Discovery em Destinations zero-seed sem criar Recommendation artificial, sem duplicar o pipeline de Discovery e sem transformar uma Proposal vazia em decisão aplicável.

## 2. Unidade de trabalho

- issue: `#455`;
- branch: `codex/rb-inc-191-discovery-itinerary-proposal`;
- base inicial: `codex/rb-inc-189-accommodation-name-geocoding-current-stack` @ `cbbb9f8aaf958c9912ceccb6cb9bb824fbe797bb`;
- execução paralela: PR `#457` / RB-INC-192 trabalha somente mídia;
- reconciliação com a stack paralela é obrigatória antes do gate final;
- Production e merge na `main` permanecem gates humanos.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004 — RouteBook Bible;
3. `docs/README.md`;
4. RB-DOM-001 — Place, Recommendation, Itinerary Proposal e Provenance;
5. RB-DOM-003 — RB-BR-ITN, RB-BR-REC e RB-BR-PRP;
6. RB-ARC-003 — Ports, Adapters, Providers e Provenance;
7. RB-INC-099 — serviço autoritativo de geração;
8. RB-INC-131 — deduplicação de Place na Proposal;
9. RB-INC-178 — materialização operacional segura de candidato externo;
10. RB-INC-184 — seleção contextual sobre Discovery reconciliada;
11. RB-INC-185 — experiência provider-first unificada de Lugar;
12. RB-INC-191 / este Context Pack.

## 4. Diagnóstico canônico

O contexto PostgreSQL autoritativo atual carrega:

```text
Itinerary
+ Recommendations persistidas elegíveis
+ Places referenciados por essas Recommendations
```

O RouteBook Anywhere, porém, pode possuir:

```text
Discovery segura com dezenas de Lugares
+ zero Recommendation persistida
```

Nesse cenário o assembler entrega `candidates: []`, o generator conclui uma Proposal `ready` vazia e a UI atual a apresenta como “aguardando sua decisão”.

## 5. Invariantes

- Recommendation não é Decision.
- Proposal não é estado aplicado.
- Recommendation persistida continua limitada a Place publicado pelo contrato atual.
- Candidate externo não recebe `RecommendationId` fictício.
- Place operacional `draft` pode sustentar continuidade de planejamento conforme RB-INC-178.
- gerar Proposal é uma ação explícita, mas não implica aceite.
- gerar Proposal não cria Saved Place, Activity ou Decision.
- uma Proposal vazia continua permitida pelo RB-BR-PRP-004 quando explicada.
- Proposal vazia não deve oferecer ação sem efeito como se fosse uma decisão aplicável.
- protected Free Period não é preenchido automaticamente.
- Place já planejado não deve voltar como nova atividade proposta.
- Provenance de Provider é preservada na materialização.
- falha/ambiguidade de identidade permanece fail-closed.
- nenhum hardcode de Destination.

## 6. Contratos reutilizados

Discovery:

- `resolvePlaceDiscoveryRegion`;
- `PlaceSearchPort`;
- `OverturePmtilesPlaceSearchAdapter`;
- `resolvePlaceBootstrapPolicy`;
- `runPlaceBootstrapStep`;
- `reconcileExternalPlaceCandidate`;
- `buildPlaceDiscoveryFeed`;
- `buildContextualExternalSuggestions` e sua política de seleção.

Identidade/persistência:

- `promoteExternalPlaceCandidate`;
- `DrizzlePlaceRepository.listByIds`;
- external references e Provenance existentes.

Proposal:

- `generateAuthoritativeItineraryProposal`;
- `assembleItineraryProposalGenerationInput`;
- `ItineraryProposalGenerationCandidate`;
- `DeterministicItineraryProposalGenerator`;
- `generateAndPersistItineraryProposal`;
- lifecycle e repositories existentes.

## 7. Seleção Discovery reutilizada

A função que ordena e limita itens externos deve produzir uma única seleção reutilizável por:

1. apresentação de Lugares para considerar;
2. ponte de geração de Proposal.

A seleção opera somente sobre `PlaceDiscoveryItem.kind === external` com categoria conhecida depois de reconciliação.

Ordem preservada:

1. categoria compatível com interesse conhecido;
2. menor distância geodésica;
3. nome;
4. identidade estável.

Limite preservado: 6.

A apresentação continua derivando seu ViewModel dessa seleção, evitando que UI e Proposal mantenham algoritmos paralelos.

## 8. Materialização na ação explícita

A ponte de geração deve receber Trip + Itinerary atuais e:

1. carregar Traveler Profile para interesses;
2. executar o loader de Discovery existente;
3. usar os candidatos crus correspondentes à seleção contextual;
4. materializar/reconciliar cada candidato com `promoteExternalPlaceCandidate`;
5. ignorar de forma fail-closed erros conhecidos de candidato rejeitado/possível duplicata;
6. propagar erro técnico inesperado para feedback recuperável;
7. carregar os Places resultantes por ID;
8. remover IDs já planejados;
9. converter os restantes em `ItineraryProposalGenerationCandidate`.

A materialização não publica o Place e não o salva na Trip.

## 9. Merge no Proposal Management

`GenerateAuthoritativeItineraryProposalCommand` pode receber:

```text
additionalCandidates?: readonly ItineraryProposalGenerationCandidate[]
```

Após o assembler canônico:

- candidatos de Recommendation permanecem primeiro;
- candidato adicional com `placeId` já existente é omitido;
- duplicata adicional do mesmo `placeId` é omitida;
- validações do generator continuam responsáveis por campos inválidos/IDs inválidos;
- `days` e políticas de distribuição não são recalculados fora do generator.

## 10. Proposal vazia na UI

Para `review.status === ready && proposedChangeCount === 0`:

- status visível: `Sem mudanças sugeridas`;
- heading: `Nenhuma mudança para aplicar` ou equivalente;
- critérios, limitações e justificativas permanecem visíveis;
- editor não é renderizado;
- `ItineraryProposalDecisionActions` não é renderizado;
- o hero da página não usa `Aguardando sua decisão`;
- navegação para Roteiro/Discovery continua disponível.

Proposal ready com uma ou mais mudanças mantém o comportamento decisório atual.

## 11. Caminhos permitidos

```text
modules/proposal-management/src/authoritative-itinerary-proposal-generation.ts
modules/proposal-management/src/authoritative-itinerary-proposal-generation.test.ts
apps/web/lib/recommendation-discovery-suggestions.ts
apps/web/lib/recommendation-discovery-suggestions.test.ts
apps/web/lib/itinerary-proposal-discovery-candidates.ts
apps/web/lib/itinerary-proposal-discovery-candidates.test.ts
apps/web/lib/itinerary-proposal-generation.ts
apps/web/lib/itinerary-proposal-generation.test.ts
apps/web/app/viagens/[tripId]/roteiro/proposta/generate-action.ts
apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx
apps/web/components/itinerary-proposal-review.tsx
apps/web/components/itinerary-proposal-review.test.tsx
apps/web/e2e/itinerary-proposal-generation.spec.ts
docs/implementation/increments/rb-inc-191-discovery-itinerary-proposal.md
docs/implementation/context-packs/rb-inc-191-discovery-itinerary-proposal.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 12. Caminhos somente leitura

```text
modules/decision-intelligence/**
modules/place-catalog/**
modules/trip-management/**
packages/database/src/place-promotion-service.ts
packages/database/src/place-repository.ts
docs/core/**
docs/domain/**
docs/architecture/**
```

Não alterar arquivos de mídia do RB-INC-190/RB-INC-192.

## 13. Testes mínimos

- seleção contextual retorna candidatos crus na mesma ordem dos ViewModels;
- loader failed/disabled retorna seleção vazia sem mutação;
- materialização de candidato novo produz `placeId` de draft e candidato de Proposal;
- candidato já planejado é omitido;
- erro conhecido de possível duplicata/rejeição não vira atividade;
- merge de Recommendation + Discovery deduplica `placeId` e preserva precedência;
- comando sem `additionalCandidates` mantém regressão;
- Proposal vazia não mostra ações de decisão;
- Proposal não vazia mantém aceite/edição/descarte;
- E2E zero-seed gera atividade proposta sem Recommendation persistida e sem alterar Itinerary.

## 14. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation e Engineering Validation precisam passar no mesmo SHA. Preview final precisa estar READY no mesmo SHA reconciliado com a stack de mídia aceita.

## 15. Proibições

- não mudar Domain para facilitar o recorte;
- não criar Recommendation fake;
- não publicar Place automaticamente;
- não criar Saved Place implicitamente;
- não aplicar Proposal automaticamente;
- não criar novo Provider ou buscar dados adicionais fora da Discovery vigente;
- não tocar Production;
- não alterar mídia/fotos;
- não fazer push direto em `main`;
- não fazer merge na `main` sem autorização humana.

## 16. Handoff

Relatar branch/SHA, arquivos alterados, candidatos Discovery usados, materializações realizadas em teste, deduplicação, comportamento de Proposal vazia, testes reais, CI, Preview e conflitos/reconciliação necessários com a PR paralela de mídia.