---
id: RB-INC-164
title: Identidade única e catálogo external-first de Places
description: Deduplica a Discovery por identidade de Lugar, usando Overture para cobertura ampla e o catálogo publicado como enriquecimento canônico sem duplicar opções na UI.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-20"
last_updated: "2026-08-20"
authors: [RouteBook Team]
tags: [implementation, place-catalog, discovery, overture, deduplication, identity, pipa, m8]
related_documents: [RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-142, RB-INC-148, RB-INC-156, RB-INC-162, RB-INC-163, RB-INC-136, RB-CTX-164]
prerequisites: [RB-INC-142, RB-INC-148, RB-INC-156, RB-INC-162, RB-INC-163]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-164 — Identidade única e catálogo external-first de Places

## 1. Contexto

Issue: `#381`.

Branch: `codex/rb-inc-164-unified-place-identity`.

Base empilhada: `ea8d23958aa115b227ec8cbf7a6092cddfda313b`, candidato verde do RB-INC-162.

A validação funcional do Preview mostrou que a Discovery pode apresentar duas representações visuais do mesmo lugar: um `Place` publicado e um candidato Overture semanticamente equivalente. O feed atual concatena os dois conjuntos e depende de uma reconciliação conservadora anterior para evitar sobreposição. Variações legítimas de nome ou endereço podem escapar dessa fronteira e produzir duplicidade perceptível.

Para o viajante, Fonte não é identidade. A tela deve apresentar opções de Lugar únicas e manter Provenance, estado canônico e enriquecimento como atributos dessa identidade de apresentação.

## 2. Objetivo

Entregar uma Discovery external-first com identidade visual única:

1. Overture fornece cobertura ampla e atual de descoberta;
2. o catálogo publicado fornece conteúdo editorial, estado canônico e ações internas;
3. quando as duas fontes sustentam a mesma identidade, a UI mostra um único item enriquecido;
4. candidato novo continua visível sem virar Place canônico;
5. Place publicado sem candidato correspondente continua visível como fallback de cobertura;
6. lista, mapa, contagens e filtros operam sobre identidades únicas.

## 3. Decisão de apresentação

A união permanece read-only e não cria uma nova entidade de domínio. `UnifiedPlaceDiscoveryItem` é projeção de aplicação/apresentação e pode ter três estados:

- `enriched`: Place publicado + candidato externo reconciliado;
- `published`: Place publicado sem candidato externo seguro;
- `external`: candidato externo novo sem Place canônico correspondente.

`PlaceId` continua pertencendo exclusivamente ao Place canônico. O candidato externo preserva `provider`, `externalId`, licença e instante de coleta. Nenhuma leitura cria vínculo ou promoção.

## 4. Política de identidade

A reconciliação existente continua sendo a primeira fronteira. A apresentação pode considerar equivalência forte somente quando:

- existe referência externa `linked`; ou
- categoria canônica coincide e nome/endereço/proximidade sustentam um match forte determinístico.

O match forte deve normalizar acentos, pontuação, artigos/preposições e contexto regional não distintivo, sem permitir que mera proximidade transforme dois estabelecimentos diferentes em uma identidade.

Casos ambíguos continuam fail-closed: o candidato não é mesclado automaticamente apenas porque está próximo. `possible_match` fraco continua retido para evitar duplicidade enganosa.

Quando mais de um candidato externo sustenta a mesma identidade, a projeção escolhe um representante deterministicamente e nunca cria dois cards para o mesmo Place publicado.

## 5. External-first e enriquecimento

Para item `enriched`:

- nome, resumo, faixa de preço, estado salvo, detalhe e ações de Roteiro vêm do Place canônico;
- endereço e coordenada de apresentação podem usar o candidato externo quando disponíveis, sem sobrescrever persistência canônica;
- rota externa preserva a política semântica do RB-INC-163;
- mídia prioriza `Place.primaryImage`; se ausente, pode reutilizar o preview read-only do RB-INC-162 sobre a identidade reconciliada;
- Provenance informa discretamente que há dados RouteBook + Overture.

A Fonte deixa de estruturar a lista como duas coleções concorrentes e passa a ser informação de Provenance.

## 6. Contagens e mapa

- total disponível representa identidades únicas após deduplicação;
- limite de 60 aplica-se aos itens `external` depois da deduplicação, não aos candidatos brutos;
- itens `enriched` contam uma única vez;
- mapa usa exatamente o mesmo conjunto da lista;
- item `enriched` mantém ações/detalhe canônicos e usa a coordenada externa de apresentação quando reconciliada;
- Hospedagem continua sendo referência adicional, não opção de Lugar.

## 7. Imagens

O RB-INC-162 continua sendo a capability de imagem disponível neste incremento. Wikimedia Commons permanece fallback governado para mídia externa.

Google Places Photos não é ativado aqui. O RB-ADR-012 possui status decisório interno `Proposed`; ativar Places API exige aprovação humana, billing, credencial restrita, política de cache/atribuição e observabilidade. Esse trabalho está registrado separadamente na issue `#382`.

## 8. Escopo

- fortalecer a evidência determinística de identidade externa sem alterar o modelo canônico;
- criar projeção `published | enriched | external`;
- deduplicar published/external e external/external na composição da Discovery;
- aplicar limite externo após deduplicação;
- usar candidato reconciliado como enriquecimento de apresentação;
- ajustar cards, badges, microcopy, contagens e mapa;
- preservar filtros, Saved Place, detalhe, Itinerary e promoção explícita;
- testes unitários e E2E de identidade única;
- documentação, Registry e rastreabilidade.

## 9. Fora de escopo

- Google Places API, Places Photos, billing ou secret;
- aceitar ou modificar o estado decisório do RB-ADR-012;
- persistir candidato por leitura;
- publicar/promover automaticamente;
- criar novo conceito de domínio `UnifiedPlace`;
- migration/schema;
- copiar ratings, reviews, horários ou preços externos para o catálogo;
- concluir M8;
- merge em `main` ou Production sem gates humanos separados.

## 10. Caminhos autorizados

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
.github/workflows/rb-inc-164-assembly-helper.yml
```

A exceção `.github/workflows/rb-inc-164-assembly-helper.yml` é estritamente transitória. Pode somente registrar `RB-INC-164`/`RB-CTX-164`, aplicar Prettier aos caminhos do incremento, restaurar microcopy compatível do RB-INC-162, remover a si própria e fazer push não destrutivo na branch do RB-INC-164. Não pode usar secrets adicionais, alterar dados, migrations, billing, Provider, `main` ou Production e não pode permanecer no diff final.

## 11. Critérios de aceite

- [ ] mesmo Lugar reconciliado aparece uma única vez na grade;
- [ ] mesmo Lugar reconciliado aparece uma única vez no mapa;
- [ ] item enriquecido preserva conteúdo e ações do Place publicado;
- [ ] item enriquecido preserva Provenance externa sem alterar persistência;
- [ ] candidatos externos novos continuam visíveis;
- [ ] Places publicados sem cobertura externa continuam visíveis;
- [ ] candidatos externos equivalentes entre si são deduplicados por match forte;
- [ ] proximidade isolada não mescla estabelecimentos distintos;
- [ ] limite de 60 é aplicado após deduplicação;
- [ ] contagens representam identidades únicas;
- [ ] filtros e mapa continuam sincronizados;
- [ ] falha Overture degrada para o catálogo publicado;
- [ ] rota semântica e fallback de origem dos RB-INC-163/162 permanecem funcionais;
- [ ] nenhuma migration, secret ou Provider pago é criado;
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] Preview Vercel do mesmo SHA fica READY antes do aceite humano.

## 12. Testes obrigatórios

- match forte por nome equivalente e proximidade;
- match forte por endereço equivalente;
- caso negativo de vizinhos próximos com nomes distintos;
- linked + published gera um único `enriched`;
- match forte sem vínculo gera um único `enriched`;
- múltiplos candidatos equivalentes geram um único item;
- candidatos novos distintos permanecem separados;
- published-only permanece no fallback;
- limite externo depois da deduplicação;
- ordenação espacial determinística;
- E2E sem nomes/identidades duplicados na grade e mapa;
- E2E preserva ações canônicas e rota em item enriquecido;
- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- `pnpm test:e2e`.

## 13. Riscos

- falso positivo de identidade: política permanece conservadora e categoria + evidência nominal/endereço são obrigatórias;
- falso negativo: pode manter um publicado sem enriquecimento, mas não deve criar novo card externo quando a reconciliação já o classifica como possível duplicata;
- Overture variável: fallback publicado continua disponível;
- endereço/coordenada externa divergente: valor é somente de apresentação e mantém Provenance;
- volume: deduplicação ocorre em memória sobre janela máxima já limitada a 200 candidatos.

## 14. Rollback

O incremento é reversível por código. Não há migration, secret ou escrita de Provider. Rollback restaura a composição por fontes do RB-INC-156/162.