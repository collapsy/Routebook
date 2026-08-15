---
id: RB-INC-142
title: Descoberta Orgânica e Ingestão Governada de Places
description: Implementa descoberta externa provider-neutral, reconciliação e promoção idempotente de candidatos de Place, com Overture Maps como fonte aberta inicial e mídia tratada como capability licenciável separada.
document_type: implementation-increment
owner: Place Catalog and Integrations
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors: [RouteBook Team]
tags: [implementation, place-catalog, integrations, overture, provenance, ingestion, deduplication, images, m8]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-DOM-001, RB-ARC-003, RB-DATA-002, RB-QA-001, RB-INC-133, RB-INC-137, RB-INC-141, RB-INC-136, RB-CTX-142]
prerequisites: [RB-INC-133, RB-INC-137, RB-INC-141]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-142 — Descoberta Orgânica e Ingestão Governada de Places

## 1. Objetivo

Permitir que o RouteBook amplie o catálogo a partir de fontes externas sem depender de uma migration DML para cada Place e sem transformar resultados remotos em estado canônico por efeito colateral.

Issue: #333.

Branch: `codex/rb-inc-142-organic-place-ingestion`.

Baseline: `2576bd29a08d13b5f5dc82976d5d5c8c9ce76f06`.

Relação com M8: relacionado a #319. Cobertura e imagem são hipóteses de redução de fricção; não constituem evidência humana de Decision Quality.

## 2. Autoridade canônica

O RB-ARC-003 já define:

- `PlaceSearchPort`, `PlaceDetailsPort` e `PlaceImagePort` como Ports oficiais/possíveis da integração de Places;
- resultado externo como candidato, e não `Place` canônico completo;
- ACL/normalização antes do domínio;
- reconciliação antes de criar ou vincular identidade interna;
- Provenance obrigatória na ingestão;
- deduplicação baseada em múltiplos sinais, sem um critério universalmente suficiente;
- imagem externa governada por licença, atribuição, expiração e cache autorizado.

Este incremento concretiza esses contratos; não redefine o significado canônico de `Place`.

## 3. Estado inicial

- catálogo publicado de Pipa: 30 Places, resultado do RB-INC-137;
- inclusão de novos Places ainda depende de seed/migration ou write específico;
- `PlaceRepository` expõe apenas leitura do catálogo publicado;
- RB-INC-141 permite `primaryImage`, mas os 30 Places atuais podem permanecer sem imagem e exibir fallback;
- não existe Provider de busca de Places implementado no código.

## 4. Arquitetura alvo

```text
External Provider
  -> PlaceSearchPort
  -> ExternalPlaceCandidate
  -> ACL / category mapping / validation
  -> reconciliation
       -> linked
       -> possible_match
       -> new
       -> rejected
  -> explicit promotion
  -> Place + external reference + Provenance
```

A busca nunca escreve no catálogo. A promoção é uma operação distinta e auditável.

## 5. Fonte aberta inicial

O adapter inicial usa Overture Maps Places porque:

- é uma fonte de dados, não a autoridade canônica do RouteBook;
- publica dados em S3/Azure e PMTiles com recorte geográfico;
- possui GERS IDs estáveis para diversas entidades;
- preserva `sources` e licenças upstream;
- não exige API key para acesso aos dados públicos;
- permite gerar candidatos de uma área delimitada sem scraping de sites de terceiros.

Referências oficiais:

- `https://docs.overturemaps.org/guides/places/`;
- `https://docs.overturemaps.org/getting-data/`;
- `https://docs.overturemaps.org/getting-data/cloud-sources/`;
- `https://docs.overturemaps.org/schema/reference/places/place/`.

O adapter não torna Overture requisito de domínio. Uma segunda implementação de `PlaceSearchPort` poderá substituir ou complementar a fonte.

## 6. Provider boundary

Não ativar neste incremento:

- Google Places como fonte materializada do catálogo, pois conteúdo/fotos possuem regras próprias de armazenamento/cache e referências de foto temporárias;
- Foursquare Places API/Photos como dependência obrigatória, pois chamadas de dados ricos/fotos podem ser cobradas;
- Nominatim público para download sistemático de POIs;
- instância pública de Overpass como backend permanente de runtime.

Provider pago permanece decisão humana conforme AGENTS.md.

## 7. Candidato externo

`ExternalPlaceCandidate` deverá carregar somente fatos necessários à reconciliação:

- Provider e `externalId`;
- nome;
- coordenadas;
- categoria do Provider;
- categoria canônica somente quando o ACL possuir mapeamento explícito;
- endereço opcional;
- URL de Provenance opcional;
- licença da Fonte;
- `collectedAt`;
- confidence opcional quando a Fonte a fornece.

Categoria desconhecida não recebe conversão silenciosa.

## 8. Reconciliação

Estados de integração:

- `linked`: referência externa já vinculada a um Place;
- `possible_match`: sinais combinados indicam duplicata provável e bloqueiam promoção automática;
- `new`: não foi encontrada correspondência suficientemente forte;
- `rejected`: candidato inválido, não licenciável ou sem categoria canônica suportada.

A primeira política determinística combina:

- identidade externa previamente vinculada;
- categoria canônica;
- nome normalizado;
- endereço normalizado quando disponível;
- proximidade geográfica.

Os limiares são conservadores e existem para impedir duplicatas, não para afirmar identidade universal.

## 9. Persistência

A migration `0029_create_place_external_references.sql` cria tabela aditiva para vínculos de Provenance entre Place e identidade externa.

Requisitos:

- `provider + external_id` é único;
- vínculo aponta para `places.id`;
- Fonte/licença e `collected_at` permanecem auditáveis;
- exclusão de Place pode remover o vínculo sem afetar a Fonte externa;
- nenhum catálogo existente é reescrito pela migration;
- nenhum Place novo é inserido pela migration.

A promoção passa a ser write normal da aplicação/serviço, não uma migration histórica por Place.

## 10. Descoberta Overture

O repositório possuirá dois caminhos reproduzíveis e coerentes de descoberta, ambos read-only:

1. pipeline operacional por bounding box para gerar artefato auditável no GitHub Actions;
2. adapter server-side consumido pela experiência de Lugares para descobrir candidatos sob demanda sem expor segredo ao browser.

O pipeline operacional deverá:

1. obter a release atual do catálogo Overture;
2. baixar somente `type=place` para a área delimitada de Pipa/Tibau do Sul usando a ferramenta oficial;
3. normalizar GeoJSON para `ExternalPlaceCandidate`;
4. aplicar ACL e filtros de categoria/confiança;
5. gerar artefato de candidatos;
6. nunca escrever em Production no modo discovery/dry-run.

A entrada de produto deverá consultar os PMTiles públicos de Places server-side, usando HTTP Range e somente os tiles da área solicitada. Ela deverá aplicar o mesmo contrato canônico, limite, ACL, licença e reconciliação antes de exibir candidatos.

Candidatos externos serão apresentados em seção separada do catálogo publicado. Não entram silenciosamente na lista/mapa canônicos e não recebem rota de detalhe enquanto não forem promovidos.

A etapa de promoção deverá ser separada e usar o mesmo serviço idempotente da aplicação.

## 11. Imagens

Imagem permanece uma capability separada da descoberta de POI:

- `PlaceImagePort` trabalha com candidatos de mídia, nunca altera `Place.primaryImage` durante uma simples busca;
- licença, autoria/atribuição, URL de origem e permissão de cache/download devem ser conhecidas;
- uma mídia só vira `primaryImage` depois de existir como asset controlado pelo RouteBook;
- ausência de mídia licenciável mantém o fallback do RB-INC-141;
- Wikimedia Commons pode ser usada futuramente como fonte aberta de mídia quando houver correspondência verificável;
- Foursquare Photos pode ser adapter opcional futuro após decisão humana sobre custo/secret;
- imagens genéricas que não representam o Place não podem ser usadas para simular cobertura.

## 12. Escopo

- contratos provider-neutral para candidato externo, busca e reconciliação;
- ACL inicial de categorias Overture -> RouteBook;
- migration aditiva de referências externas;
- repositório de vínculos externos;
- promoção idempotente de candidato `new` para `Place`;
- bloqueio de `possible_match`/`rejected` sem resolução explícita;
- pipeline de descoberta Overture em modo dry-run/artefato;
- adapter Overture PMTiles server-side para descoberta sob demanda no produto;
- entrada explícita na tela de Lugares para consultar e visualizar candidatos externos sem alterar o catálogo;
- falha da fonte externa degradando para o catálogo canônico existente com feedback previsível;
- normalizador testável sem rede;
- contratos de candidato de imagem e `PlaceImagePort` sem ativar Provider pago;
- documentação, Registry e testes aplicáveis.

## 13. Fora de escopo

- publicar automaticamente todo resultado retornado pelo Provider;
- scraping de Google Maps, TripAdvisor, Instagram ou site comercial;
- reviews/ratings/horários como verdade canônica;
- nova categoria canônica de Place;
- galeria de imagens;
- ativação de cobrança/secret de Provider pago;
- alteração da política de Recommendation;
- mutação de Production durante CI de PR;
- concluir M8 sem evidência humana real.

## 14. Caminhos autorizados

```text
modules/place-catalog/src/external-place.ts
modules/place-catalog/src/external-place.test.ts
modules/place-catalog/src/index.ts
packages/database/src/schema.ts
packages/database/src/index.ts
packages/database/src/place-external-reference-repository.ts
packages/database/src/place-external-reference-repository.test.ts
packages/database/src/place-promotion-service.ts
packages/database/src/place-promotion-service.test.ts
packages/database/drizzle/0029_create_place_external_references.sql
packages/database/drizzle/meta/_journal.json
scripts/normalize-overture-places.mjs
scripts/normalize-overture-places.test.mjs
scripts/promote-place-candidates.mjs
package.json
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/lib/overture-place-search.ts
apps/web/lib/overture-place-search.test.ts
apps/web/package.json
pnpm-lock.yaml
.github/workflows/engineering-validation.yml
.github/workflows/overture-place-discovery.yml
docs/implementation/increments/rb-inc-142-organic-place-ingestion.md
docs/implementation/context-packs/rb-inc-142-organic-place-ingestion.md
docs/registry.md
```

Arquivo adicional indispensável deve ser registrado neste incremento e explicado na PR antes da alteração.

## 15. Critérios de aceite

- [ ] busca externa é provider-neutral e não possui write implícito;
- [ ] candidato preserva identidade externa, licença e `collectedAt`;
- [ ] categoria Overture só é convertida quando existe mapeamento explícito;
- [ ] candidato inválido/sem licença/mapeamento é rejeitado;
- [ ] referência externa previamente vinculada é reconhecida como `linked`;
- [ ] provável duplicata é `possible_match` e não é promovida silenciosamente;
- [ ] candidato novo pode ser promovido de forma explícita/idempotente;
- [ ] promoção cria Place e referência externa atomicamente;
- [ ] migration 0029 é somente DDL aditivo e sem backfill/DML de catálogo;
- [ ] pipeline Overture gera artefato de candidatos limitado a Pipa/Tibau do Sul sem secret;
- [ ] tela de Lugares possui entrada server-side explícita para descobrir candidatos externos sem substituir o catálogo publicado;
- [ ] falha do Provider não quebra Places já canônicos e mantém feedback previsível;
- [ ] contrato de imagem exige licença/atribuição/cache compatíveis antes da promoção para asset;
- [ ] nenhum Provider pago é ativado;
- [ ] Documentation e Engineering Validation ficam verdes no mesmo SHA.

## 16. Testes obrigatórios

- ACL de categorias conhecidas e desconhecidas;
- validação de busca/candidato;
- distância e reconciliação `linked/new/possible_match/rejected`;
- round-trip e unicidade de referência externa no PostgreSQL;
- promoção idempotente;
- bloqueio de provável duplicata e candidato rejeitado;
- normalização de fixture Overture sem rede;
- adapter PMTiles com fonte injetável/fixture sem rede, incluindo release, tiles, normalização, limites e falha externa;
- experiência de descoberta preservando catálogo canônico quando a fonte externa falha;
- migration policy + aplicação das migrations;
- regressão dos 30 Places existentes;
- format, docs, lint, typecheck, testes, build e E2E pelo Engineering Validation.

## 17. Riscos

- cobertura externa pode conter entidades desatualizadas; Provenance e `collectedAt` devem permanecer visíveis ao sistema;
- taxonomia externa é mais ampla que as quatro categorias atuais; desconhecido falha fechado;
- deduplicação conservadora pode exigir revisão humana em casos ambíguos;
- volume precisa ser limitado por área, confidence e categorias para não degradar UX;
- PMTiles é uma fonte de leitura remota e deve ser acionada sob demanda, com limites e timeout para não degradar a página canônica;
- imagem possui risco jurídico maior que texto/posição; ausência é preferível a licença incerta.

## 18. Rollback

Código e pipeline podem ser revertidos sem apagar Places existentes. A nova tabela é aditiva; removê-la de Production é destrutivo e fica fora do rollback automático. Places já promovidos permanecem canônicos e devem ser tratados por roll-forward governado, não por exclusão em massa automática.
