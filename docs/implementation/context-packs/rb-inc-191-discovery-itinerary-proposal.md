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

A Proposal deve receber candidatos suficientes para exercer a densidade já governada pelo generator, em vez de herdar indevidamente o limite visual de seis itens da experiência de Sugestões.

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

A lacuna original era `Discovery segura + zero Recommendation persistida → Proposal vazia`. A ponte adicionada pelo RB-INC-191 resolve essa desconexão.

No aceite funcional surgiu uma segunda evidência: `recommendation-discovery-suggestions` limitava a seleção contextual a seis candidatos. Esse limite foi criado para manter a UI de Sugestões focada, mas a Proposal o herdou. Como o generator já balanceia candidatos até a densidade desejada de três Activities por Dia, seis candidatos em uma viagem mais longa tendem a produzir aproximadamente uma Activity por Dia, mesmo com dezenas de Lugares seguros disponíveis.

A correção deve ampliar apenas o tamanho da seleção usada pela mutação de Proposal; ranking, reconciliação, identidade e distribuição continuam nos contratos existentes.

## 5. Invariantes

- Recommendation não é Decision.
- Proposal não é estado aplicado.
- Recommendation persistida continua limitada a Place publicado.
- Candidate externo não recebe `RecommendationId` fictício.
- Place operacional `draft` pode sustentar continuidade de planejamento conforme RB-INC-178.
- gerar Proposal não cria Saved Place, Activity ou Decision.
- Proposal vazia continua permitida pelo RB-BR-PRP-004 quando explicada.
- Proposal vazia não pode ser aceita/editada como se contivesse mudanças, mas pode ser explicitamente rejeitada para permitir nova geração.
- rejection/discard não apaga o registro histórico.
- protected Free Period não é preenchido automaticamente.
- Place já planejado não volta como nova atividade proposta.
- Provenance de Provider é preservada.
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
- `selectContextualExternalDiscoveryItems` e sua política de ordenação.

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

A seleção opera somente sobre `PlaceDiscoveryItem.kind === external` com categoria conhecida depois de reconciliação e preserva a ordem:

1. categoria compatível com interesse conhecido;
2. menor distância geodésica;
3. nome;
4. identidade estável.

O limite padrão de apresentação permanece 6. Para geração de Proposal, o mesmo loader recebe um `selectionLimit` explícito calculado pela capacidade disponível do Itinerary. Não existe segundo algoritmo de ranking.

A capacidade é somada por Dia com a meta já praticada pelo generator de até três Activities por Dia:

```text
availableSlots = max(0, 3 - existingActivities - protectedFreePeriods)
```

Dia sem Activity, com Free Period protegido e sem Free Period flexível, permanece intencionalmente vazio e contribui com zero slots. Esse cálculo só dimensiona o conjunto de candidatos; o generator continua decidindo a distribuição final.

## 8. Materialização na ação explícita

A ponte de geração recebe Trip + Itinerary atuais e:

1. calcula a capacidade de candidatos da Proposal;
2. se não houver capacidade, não consulta nem materializa Discovery;
3. carrega Traveler Profile para interesses;
4. executa o loader de Discovery existente com o limite calculado;
5. usa os candidatos crus correspondentes à mesma seleção contextual;
6. materializa/reconcilia cada candidato com `promoteExternalPlaceCandidate`;
7. ignora de forma fail-closed candidato rejeitado/possível duplicata;
8. propaga erro técnico inesperado;
9. carrega os Places resultantes por ID;
10. remove IDs já planejados;
11. converte os restantes em `ItineraryProposalGenerationCandidate`.

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
- `days`, Free Periods e política de distribuição não são recalculados no Proposal Management.

## 10. Proposal vazia na UI

Para `review.status === ready && proposedChangeCount === 0`:

- status visível: `Sem mudanças sugeridas`;
- heading: `Nenhuma mudança para aplicar` ou equivalente;
- critérios, limitações e justificativas permanecem visíveis;
- editor e ações de aceite não são renderizados;
- o hero não usa `Aguardando sua decisão`;
- usuário autorizado pode `Descartar e gerar outra` por meio da rejeição canônica existente;
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

Não alterar arquivos de mídia do RB-INC-190/RB-INC-192 nem o algoritmo de densidade do generator neste incremento.

## 13. Testes mínimos

- seleção contextual padrão continua limitada a seis;
- seleção para Proposal pode crescer usando exatamente o mesmo ranking;
- viagem de quatro Dias vazios solicita capacidade para doze candidatos;
- Activity existente e protected Free Period reduzem capacidade;
- materialização de candidato novo produz `placeId` de draft e candidato de Proposal;
- candidato já planejado é omitido;
- erro conhecido de possível duplicata/rejeição não vira atividade;
- merge de Recommendation + Discovery deduplica `placeId` e preserva precedência;
- Proposal vazia não mostra aceite/edição e oferece descarte explícito quando autorizado;
- Proposal não vazia mantém aceite/edição/descarte;
- E2E zero-seed continua sem Recommendation persistida e sem alterar Itinerary antes do aceite.

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
- não criar novo ranking de Discovery;
- não alterar o algoritmo de distribuição/densidade do generator;
- não criar novo Provider ou buscar dados fora da Discovery vigente;
- não tocar Production;
- não alterar mídia/fotos;
- não fazer push direto em `main`;
- não fazer merge na `main` sem autorização humana.

## 16. Handoff

Relatar branch/SHA, capacidade calculada, candidatos Discovery usados, materializações realizadas em teste, deduplicação, comportamento de Proposal vazia, testes reais, CI, Preview e conflitos/reconciliação necessários com a PR paralela de mídia.
