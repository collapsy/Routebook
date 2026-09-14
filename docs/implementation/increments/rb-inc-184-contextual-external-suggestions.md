---
id: RB-INC-184
title: Sugestões contextuais para Destinations sem catálogo publicado
description: Faz a experiência de Sugestões aproveitar Discovery externa segura em Trips sem cobertura editorial, preservando Recommendation canônica somente para Places publicados.
document_type: implementation-increment
owner: Decision Intelligence and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-07"
authors: [RouteBook Team]
tags: [implementation, recommendations, discovery, decision-intelligence, routebook-anywhere, external-places]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-ARC-003, RB-INC-139, RB-INC-147, RB-INC-148, RB-INC-156, RB-INC-164, RB-INC-168, RB-INC-175, RB-INC-182, RB-INC-183, RB-CTX-184]
prerequisites: [RB-INC-182, RB-INC-183]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-184 — Sugestões contextuais para Destinations sem catálogo publicado

## 1. Resultado vertical

A rota `/viagens/[tripId]/recomendacoes` deixa de ficar vazia apenas porque a Trip não possui Places publicados com uma `destinationId` editorial única.

Quando a Region da Trip possui candidatos externos seguros, reconciliados e utilizáveis, o RouteBook apresenta uma seleção contextual read-only baseada em dados conhecidos, mantendo Recommendations persistidas e suas ações exclusivamente para Places canônicos publicados.

O objetivo é remover a dependência de cobertura editorial prévia sem redefinir silenciosamente o agregado `Recommendation`.

## 2. Issue, branch e base

- Issue: `#438`.
- Branch: `codex/rb-inc-184-contextual-external-suggestions`.
- Base empilhada: `0a829f8a2d6f05f5776e6daba3cfe6e1b28f6bfe` do RB-INC-183 / PR `#436`.
- Cadeia atual: `#431 -> #434 -> #436 -> RB-INC-184`.
- `main` permanece fora de alteração direta.
- Production e merge continuam gates humanos.

## 3. Problema observado

A validação live em Gramado mostrou que:

- a Hospedagem já pode ser geocodificada automaticamente;
- a Discovery externa já encontra opções próximas;
- o mapa já pode representar essas descobertas;
- a tela de Sugestões ainda retorna `Destino ainda não coberto`.

A causa está em `loadRecommendationExperience`: o fluxo carrega `loadTripCuratedCatalog`, exige uma `destinationId` derivada de Places publicados e retorna `destinationSupported: false` quando a Region é zero-seed.

Isso faz a Decision Intelligence ignorar dados externos que o próprio produto já considera seguros para apresentação read-only.

## 4. Decisão de escopo

Este incremento **não altera** o tipo `RecommendationTarget`, a persistência de `Recommendation` ou a invariante atual de que uma Recommendation canônica aponta para um `Place` publicado.

Em vez disso, adiciona uma projeção de aplicação/apresentação para candidatos externos:

```text
ContextualExternalSuggestion
  external identity
  name
  category
  distance
  reasons
  limitations
  provenance
```

Essa projeção:

- não é agregado;
- não é entidade persistida;
- não recebe `RecommendationId`;
- não recebe estado `presented/accepted/rejected`;
- não cria `Decision`;
- não altera Saved Places;
- não cria Activity;
- não promove nem publica Place por leitura.

## 5. Fontes e identidade

A cobertura deve reutilizar os contratos existentes:

1. `resolvePlaceDiscoveryRegion` para Region accommodation-first;
2. `PlaceSearchPort` / `OverturePmtilesPlaceSearchAdapter`;
3. `resolvePlaceBootstrapPolicy` / `runPlaceBootstrapStep`;
4. `DrizzlePlaceRepository.listPublishedWithinRadius`;
5. `DrizzlePlaceExternalReferenceRepository.listByPlaceIds`;
6. `reconcileExternalPlaceCandidate`;
7. `buildPlaceDiscoveryFeed`.

A projeção externa deve operar sobre o feed já reconciliado. Não cria segundo algoritmo de identidade.

Regras:

- `external` pode virar sugestão externa;
- `enriched`/`published` permanece responsabilidade do fluxo canônico de Recommendation quando houver `Place` elegível;
- `possible_match` sem match forte continua retido pelo feed;
- `rejected` nunca é apresentado;
- identidade externa equivalente a Place canônico não pode aparecer duas vezes.

## 6. Ordenação contextual da projeção externa

A ordenação inicial deve ser pequena, determinística e explicável.

Critérios autorizados:

1. categoria compatível com interesse informado;
2. distância geodésica em relação à referência espacial da Region;
3. nome e identidade externa como desempate estável.

Não há score público.

Quando não há interesses compatíveis, distância continua sendo um critério conhecido e a limitação deve ser comunicada.

Nenhuma qualidade, rating, preço, horário, disponibilidade ou popularidade é inventada.

## 7. Experiência

A página mantém o título `Sugestões para <Destino>` e passa a distinguir duas fontes de apoio à decisão:

### Recommendations canônicas

Mantêm exatamente:

- ciclo de vida existente;
- persistência;
- Reasons/Limitations/Confidence;
- ações de salvar, planejar e ignorar;
- divulgação focada/completa.

### Sugestões descobertas

Devem:

- ser claramente rotuladas como descobertas externas ainda não publicadas no catálogo;
- mostrar nome, categoria, distância em linha reta quando disponível e Fonte/Provenance;
- explicar por que apareceram, por exemplo interesse compatível e/ou proximidade;
- comunicar limitações explícitas;
- oferecer navegação para a experiência completa de `/lugares` sem fingir detalhe interno inexistente;
- não exibir ações canônicas de Recommendation que dependem de `PlaceId` publicado.

O estado `Destino ainda não coberto` deixa de ser exibido quando há sugestões externas seguras.

## 8. Estados

A experiência deve cobrir:

- canônicas disponíveis, sem externas;
- externas disponíveis, sem canônicas;
- canônicas + externas sem duplicidade;
- nenhuma cobertura canônica nem externa;
- Region indisponível;
- Discovery disabled/failed;
- interesses ausentes;
- hospedagem ausente com fallback espacial de Destination;
- contexto alterado invalidando apenas Recommendations persistidas, sem inventar lifecycle para externas.

## 9. Fora de escopo

- alterar RB-DOM-001 a RB-DOM-004;
- ampliar `RecommendationTarget` para candidato externo;
- persistir sugestão externa como Recommendation;
- promover/publicar candidato automaticamente;
- salvar ou planejar candidato externo diretamente;
- criar novo estado de domínio;
- migration/schema;
- Google Places, Foursquare ou Provider novo;
- billing, secret ou alteração do RB-ADR-012;
- inferir rating, reviews, preço, horário, rota, ETA ou disponibilidade;
- Production;
- merge em `main` sem autorização humana.

## 10. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/recomendacoes/page.tsx
apps/web/app/viagens/[tripId]/recomendacoes/recommendations-page.module.css
apps/web/lib/recommendation-experience.ts
apps/web/lib/recommendation-experience.test.ts
apps/web/lib/recommendation-discovery-suggestions.ts
apps/web/lib/recommendation-discovery-suggestions.test.ts
apps/web/e2e/recommendations-experience.spec.ts
apps/web/e2e/recommendations-anywhere.spec.ts
docs/implementation/increments/rb-inc-184-contextual-external-suggestions.md
docs/implementation/context-packs/rb-inc-184-contextual-external-suggestions.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Se um caminho adicional for indispensável, o incremento deve ser atualizado antes da alteração.

## 11. Caminhos somente leitura

```text
modules/decision-intelligence/**
modules/place-catalog/**
modules/trip-management/**
packages/database/**
docs/core/**
docs/domain/**
docs/architecture/**
```

## 12. Critérios de aceite

- [ ] Gramado zero-seed com Discovery segura exibe sugestões úteis em vez de apenas `Destino ainda não coberto`.
- [ ] Sugestões externas não recebem `RecommendationId` nem lifecycle de Recommendation.
- [ ] Recommendations persistidas continuam exigindo Place publicado.
- [ ] Interesse compatível prioriza categoria correspondente.
- [ ] Distância geodésica participa da ordenação quando disponível.
- [ ] Ausência de interesse não fabrica preferência.
- [ ] `possible_match` ambíguo e `rejected` não aparecem como novas sugestões.
- [ ] Candidato equivalente a Place canônico não duplica a opção na tela.
- [ ] A UI diferencia explicitamente Recommendation canônica de descoberta externa.
- [ ] Sugestão externa não oferece ação que implique persistência canônica inexistente.
- [ ] Falha/disable do Provider mantém Recommendations canônicas utilizáveis.
- [ ] Pipa preserva a experiência canônica existente.
- [ ] Nenhuma migration, Provider, secret, billing ou Production é necessária.
- [ ] Documentation e Engineering Validation passam no mesmo SHA final.
- [ ] Preview Vercel do mesmo SHA comprova o comportamento em Gramado.

## 13. Testes mínimos

### Unitários

- ordena match de interesse antes de não-match;
- desempata por distância e identidade;
- sem interesses ordena por distância sem razão falsa de preferência;
- externa produz Reasons/Limitations explicáveis;
- feed reconciliado não duplica canônico;
- limite focado é respeitado;
- falha de Provider retorna coleção vazia sem exceção fatal.

### Experiência

- zero-seed com externas não mostra `Destino ainda não coberto`;
- zero-seed sem externas mantém estado vazio honesto;
- fluxo canônico existente permanece funcional;
- CTA externo leva à Discovery completa;
- sem ação de salvar/roteiro/ignorar em item externo.

### E2E

- Trip fora de Pipa com hospedagem/contexto e fixture externa mostra sugestões contextuais;
- nenhuma escrita canônica ocorre apenas ao abrir/recarregar a tela;
- regressão Pipa continua mostrando Recommendations canônicas e suas ações.

## 14. Validação

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

CI Documentation e Engineering deve ficar verde no mesmo SHA. Preview deve estar READY no mesmo HEAD funcional.

## 15. Riscos

- **confusão semântica:** mitigada por separar visualmente descoberta externa de Recommendation persistida;
- **duplicidade:** mitigada por reutilizar `buildPlaceDiscoveryFeed`;
- **Provider variável:** degradação mantém canônicas e vazio honesto;
- **ranking paralelo:** a projeção usa apenas interesse + distância e não substitui o motor canônico;
- **crescimento de escopo:** ações canônicas sobre externos ficam explicitamente fora deste incremento.

## 16. Rollback

Reversível por código. Não há migration, persistência nova, secret, billing ou mudança de Provider.
