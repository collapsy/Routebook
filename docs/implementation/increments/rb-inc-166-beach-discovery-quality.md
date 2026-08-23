---
id: RB-INC-166
title: Qualidade da Discovery de praias
description: Corrige falsos positivos de categoria e aliases duplicados de praias observados em uso real da Discovery durante a viagem de Pipa.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-23"
last_updated: "2026-08-23"
authors: [RouteBook Team]
tags: [implementation, place-catalog, discovery, overture, beaches, taxonomy, deduplication, pipa, m8]
related_documents: [RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-142, RB-INC-148, RB-INC-156, RB-INC-162, RB-INC-163, RB-INC-164, RB-INC-136, RB-CTX-166]
prerequisites: [RB-INC-142, RB-INC-156, RB-INC-164]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-166 — Qualidade da Discovery de praias

## 1. Contexto

Issue: `#388`.

Branch: `codex/rb-inc-166-beach-discovery-quality`.

Baseline: `21a0ca5521f507c8c2b3264a7303155417c1cfdf`, merge do RB-INC-164.

Em 23/08/2026, durante uso humano real do RouteBook na viagem canônica de Pipa, a filtragem por `Praias` revelou dois problemas que sobreviveram ao RB-INC-164:

1. a lista ainda contém representações repetidas da mesma praia;
2. alguns candidatos classificados como praia não parecem representar uma praia de fato.

A evidência mostra que o problema não é apenas visual. A projeção unificada já deduplica identidades, mas o ACL Overture aceita mapeamento por ancestral da hierarquia de forma ampla e a política nominal não reconhece adequadamente aliases PT/EN como `Praia do Madeiro` e `Madeiro Beach`.

A ausência de imagens observada na mesma viagem é uma frente separada, registrada em `#382 / RB-INC-167`, porque ampliar cobertura com Google Places Photos depende de decisão humana material sobre Provider pago, billing e credencial. Este incremento não mascara ausência de mídia nem ativa Provider novo.

## 2. Objetivo

Tornar a categoria `Praias` confiável para uso em viagem real:

- aceitar como praia somente candidato com evidência taxonômica direta e confiável;
- colapsar aliases óbvios da mesma praia antes da composição final da lista e mapa;
- preservar praias vizinhas realmente distintas;
- manter o comportamento external-first, Provenance e degradação segura do RB-INC-164.

## 3. Decisão de classificação

O `PlaceCategory = beach` recebe política mais estrita que categorias agregadoras.

- `providerCategory = beach` continua mapeando diretamente para `beach`;
- um `providerCategory` desconhecido não passa a ser `beach` somente porque a hierarquia contém `beach`;
- fallback pela hierarquia continua permitido para categorias agregadoras já suportadas (`gastronomy`, `nightlife` e `nature`) quando existir mapeamento explícito no ACL;
- categoria desconhecida continua sem conversão canônica silenciosa.

Essa regra não cria uma nova categoria de domínio; apenas reduz falsos positivos no ACL de integração.

## 4. Decisão de identidade para praias

Para candidatos externos da categoria `beach`, descritores equivalentes de idioma como `praia`, `beach` e `playa` são tratados como qualificadores genéricos durante a comparação nominal.

A identidade ainda exige sinais combinados:

- mesma categoria canônica;
- proximidade máxima governada;
- pelo menos um token nominal compartilhado após remover artigos/preposições e descritores de praia;
- o token compartilhado deve representar a âncora do nome, e não apenas um descritor genérico;
- proximidade isolada nunca prova identidade.

Tokens geográficos que normalmente são fracos podem continuar compondo o nome de uma praia quando, após remover o descritor de praia, são a própria âncora nominal (`Praia de Pipa` × `Pipa Beach`). Essa exceção é restrita à comparação de `beach` e não altera a política geral para restaurantes, bares ou outros Places.

## 5. Escopo

- endurecer `mapOverturePlaceCategory` para impedir fallback hierárquico que converta POI relacionado em `beach`;
- preservar fallback hierárquico explícito para categorias agregadoras existentes;
- tornar a deduplicação external-only consciente de aliases PT/EN/ES de praias;
- aplicar a mesma equivalência forte entre candidato de praia e Place publicado quando necessário para impedir card concorrente;
- testes unitários para taxonomia direta, falsos positivos, aliases e praias vizinhas;
- regressão da projeção de Discovery comprovando uma identidade por praia;
- documentação, Registry e matriz de rastreabilidade.

## 6. Fora de escopo

- ampliar cobertura de imagens;
- Google Places API/Place Photos, billing ou secrets;
- mudar o estado do RB-ADR-012;
- migration/schema;
- nova categoria canônica;
- reescrever coordenadas ou nomes no banco;
- publicar/promover candidatos automaticamente;
- mudar ranking ou raio da Discovery;
- fechar M8 somente por evidência técnica;
- Production.

## 7. Caminhos autorizados

```text
modules/place-catalog/src/external-place.ts
modules/place-catalog/src/external-place.test.ts
apps/web/lib/place-discovery-feed.ts
apps/web/lib/place-discovery-feed.test.ts
apps/web/lib/overture-place-search.test.ts
apps/web/e2e/unified-place-identity.spec.ts
apps/web/e2e/place-discovery-filters.spec.ts
docs/implementation/increments/rb-inc-166-beach-discovery-quality.md
docs/implementation/context-packs/rb-inc-166-beach-discovery-quality.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 8. Critérios de aceite

- [ ] `beach` direto continua mapeando para a categoria canônica `beach`;
- [ ] categoria específica/POI desconhecido não vira `beach` apenas por possuir `beach` na hierarquia;
- [ ] fallback hierárquico de gastronomia permanece funcional;
- [ ] `Praia do Madeiro` e `Madeiro Beach`, geograficamente coerentes, produzem uma única identidade na Discovery;
- [ ] `Praia de Pipa` e `Pipa Beach`, geograficamente coerentes, produzem uma única identidade;
- [ ] praias com âncoras nominais distintas permanecem separadas mesmo quando próximas;
- [ ] Place publicado e candidato externo equivalente continuam virando um único item enriquecido;
- [ ] lista e mapa continuam usando o mesmo conjunto deduplicado;
- [ ] Overture indisponível continua degradando para Places publicados;
- [ ] nenhuma leitura cria/altera Place, Saved Place, Recommendation, Decision ou Itinerary;
- [ ] nenhuma migration, secret ou Provider novo;
- [ ] Documentation Validation e Engineering Validation passam no mesmo SHA;
- [ ] Preview Vercel do mesmo SHA fica READY antes do aceite funcional humano.

## 9. Testes obrigatórios

- unitário do ACL Overture: `beach` direto, ancestral `beach` rejeitado e fallback gastronômico preservado;
- unitário de identidade Place publicado × candidato para alias de praia;
- unitário de deduplicação external-only PT/EN e `Pipa` como âncora de praia;
- unitário provando praias vizinhas distintas;
- E2E aplicável de filtro `Praias` e identidade única;
- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- `pnpm test:e2e`.

## 10. Riscos e mitigação

- **falso negativo de taxonomia:** `beach` exige evidência direta; o custo aceitável é omitir um POI ambíguo em vez de apresentar falsa praia;
- **alias excessivo:** a deduplicação de praia continua exigindo mesma categoria, âncora nominal e proximidade, nunca distância isolada;
- **nomes regionais:** a exceção para `Pipa` é aplicada somente à semântica de nome de praia;
- **cobertura de imagem continua baixa:** explicitamente fora deste incremento e rastreada por `#382 / RB-INC-167`.

## 11. Rollback

Código e documentação podem ser revertidos sem alteração de dados. Não há migration, write canônico, secret ou mudança de Provider para desfazer.