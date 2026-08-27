---
id: RB-INC-168
title: Ranking e qualidade contextual de Places
description: Introduz sinais de qualidade provider-neutral, RouteBook Score determinístico e um spike governado para comparar Google Places e Foursquare em Pipa antes da ativação de Provider.
document_type: implementation-increment
owner: Place Catalog and Decision Intelligence
status: Draft
version: "0.1.0"
created: "2026-08-27"
last_updated: "2026-08-27"
authors: [RouteBook Team]
tags: [implementation, ranking, place-catalog, decision-intelligence, ratings, popularity, pipa]
related_documents: [RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-142, RB-INC-164, RB-INC-167, RB-CTX-168]
prerequisites: [RB-INC-164]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-168 — Ranking e qualidade contextual de Places

## 1. Contexto

Issue: `#390`.

Branch: `codex/rb-inc-168-place-quality-ranking`.

Base empilhada: correção de qualidade de praias da PR `#389`, necessária para que um ranking não amplifique duplicatas ou falsos positivos de categoria.

O uso humano real em Pipa mostrou que listar Places não resolve a decisão “qual é o melhor?”. A lacuna é transversal a praias, gastronomia, vida noturna e natureza.

O RB-ADR-012 já prevê ratings, quantidade de avaliações, fotografias e Provenance como dados externos, mas seu estado decisório interno continua `Proposed`. Este incremento não aceita o ADR, não cria billing e não ativa Google Places ou Foursquare no runtime.

## 2. Objetivo

Preparar o RouteBook para ordenar opções por qualidade real e contextual sem transformar um Provider em verdade canônica:

1. representar rating, volume de avaliações, popularidade e abertura com Provenance;
2. calcular um RouteBook Score determinístico e explicável;
3. reduzir viés de amostras pequenas com reputação Bayesiana;
4. permitir projeções futuras de “Recomendados”, “Melhor avaliados”, “Mais populares” e “Mais próximos”;
5. comparar Google Places e Foursquare em Pipa por um spike explícito e key-gated antes da escolha humana do Provider.

## 3. Princípios de ranking

- `Overture.confidence` não é reputação e nunca entra como rating;
- rating é normalizado pela escala declarada pelo Provider;
- volume de avaliações aumenta confiança estatística, sem ser tratado como qualidade isolada;
- popularidade possui escala própria e não é confundida com rating;
- distância e `openNow` contextualizam qualidade somente quando existe evidência de reputação ou popularidade;
- ausência de sinal permanece ausência;
- score não é persistência canônica;
- a mesma entrada produz o mesmo score;
- a UI deverá explicar motivos relevantes em vez de exibir somente um número opaco.

## 4. Reputação Bayesiana

A primeira versão utiliza shrinkage determinístico:

```text
adjustedRating =
  (normalizedRating * reviewCount + priorMean * priorWeight)
  / (reviewCount + priorWeight)
```

Quando o Provider não informa `reviewCount`, utiliza-se peso conservador explícito, sem assumir grande confiança.

Assim, uma nota 5,0 com três avaliações não supera automaticamente um 4,8 sustentado por milhares de avaliações.

## 5. Pesos contextuais iniciais

Os pesos são específicos por categoria e aplicados somente aos componentes disponíveis:

- praia/natureza: reputação > popularidade > distância;
- gastronomia: reputação > popularidade/distância > abertura contextual;
- vida noturna: reputação + popularidade + abertura contextual, com distância como ajuste menor.

Os pesos são implementação inicial e deverão ser calibrados com evidência de uso; não são feedback humano M8 por si só.

## 6. Contrato de sinais

`PlaceQualitySignals` preserva:

- Provider;
- externalId;
- rating + escala;
- reviewCount opcional;
- popularidade + escala;
- `openNow` opcional;
- `collectedAt`;
- versão da fonte opcional;
- validade opcional.

`PlaceQualitySignalsPort` é provider-neutral e recebe targets de Place sem acoplar o domínio a SDK ou contrato externo.

## 7. Projeção de Discovery

`rankPlaceDiscoveryItems` opera depois da deduplicação da Discovery. Ela:

- mantém exatamente as identidades recebidas;
- associa sinais pelo id da projeção;
- calcula score somente quando há evidência;
- expõe modos de ordenação apenas quando o sinal correspondente existe;
- degrada para distância quando qualidade não está disponível;
- mantém faltantes depois dos itens com evidência para ordenações por rating/popularidade;
- usa distância/nome/id como desempate determinístico.

A UI final só deverá oferecer controles de qualidade quando houver cobertura real do Provider.

## 8. Spike Google × Foursquare

O script `scripts/compare-place-quality-providers.mjs` mede Pipa em quatro grupos:

- praias;
- gastronomia;
- vida noturna;
- natureza/atrações.

Google Places mede, quando retornados, rating, `userRatingCount`, fotos e preço.

Foursquare mede, quando retornados, rating, popularidade, fotos e preço, consultando a busca com ordenação `RATING`.

O spike:

- requer `GOOGLE_PLACES_API_KEY` para Google;
- requer `FOURSQUARE_PLACES_API_KEY` para Foursquare;
- não grava chaves;
- não imprime chaves;
- falha antes de chamar rede se uma credencial selecionada estiver ausente;
- não roda live no CI por padrão;
- não escolhe automaticamente o Provider vencedor.

## 9. Escopo

- tipos e validação de sinais;
- `PlaceQualitySignalsPort`;
- RouteBook Score;
- reputação Bayesiana;
- ranking provider-neutral da Discovery;
- testes unitários;
- spike Google/Foursquare e testes offline;
- documentação e rastreabilidade.

## 10. Fora de escopo

- ativar Provider pago no runtime;
- criar billing, API key ou secret;
- aceitar ou modificar RB-ADR-012;
- persistir rating/review/popularity;
- copiar reviews;
- combinar ratings de múltiplos Providers em um único rating;
- exibir ranking sem evidência real;
- migration/schema;
- Production;
- concluir M8.

## 11. Caminhos autorizados

```text
modules/place-catalog/src/place-quality.ts
modules/place-catalog/src/place-quality.test.ts
modules/place-catalog/src/index.ts
apps/web/lib/place-discovery-ranking.ts
apps/web/lib/place-discovery-ranking.test.ts
scripts/compare-place-quality-providers.mjs
scripts/compare-place-quality-providers.test.mjs
package.json
docs/implementation/increments/rb-inc-168-place-quality-ranking.md
docs/implementation/context-packs/rb-inc-168-place-quality-ranking.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 12. Critérios de aceite

- [ ] sinais externos possuem Provenance mínima e escala explícita;
- [ ] score não existe sem rating ou popularidade;
- [ ] 4,8 com grande volume pode superar 5,0 com amostra minúscula;
- [ ] distância não fabrica qualidade;
- [ ] abertura só altera score quando há contexto temporal explícito;
- [ ] ranking é determinístico;
- [ ] modos indisponíveis não são oferecidos sem sinal;
- [ ] spike não chama Provider sem chave;
- [ ] chave nunca aparece no relatório;
- [ ] comparação live Google × Foursquare é executada somente após provisionamento humano de credenciais;
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] Preview Vercel fica READY no mesmo SHA antes do aceite funcional.

## 13. Gate humano restante

A escolha e ativação de Google Places e/ou Foursquare é material porque envolve Provider, termos, credencial, quota e possível cobrança.

Antes desse gate, o incremento pode concluir o motor, o contrato, o spike offline e o Preview, mas não pode declarar ranking de produção com dados reais.

## 14. Rollback

Todo o trabalho anterior ao Provider é código read-only e reversível. Não há migration, persistência de sinal, secret, billing ou alteração de Production.
