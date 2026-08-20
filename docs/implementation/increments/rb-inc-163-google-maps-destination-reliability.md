---
id: RB-INC-163
title: Confiabilidade dos destinos no Google Maps
description: Torna links individuais de rota mais resistentes a coordenadas aproximadas ao preferir identidade semântica de nome e endereço, preservando coordenadas como fallback.
document_type: implementation-increment
owner: Traveler Experience and Spatial Context
status: Draft
version: "0.1.0"
created: "2026-08-20"
last_updated: "2026-08-20"
authors: [RouteBook Team]
tags: [implementation, google-maps, routing, places, pipa, reliability, m8]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-ARC-003, RB-INC-139, RB-INC-153, RB-INC-156, RB-INC-160, RB-INC-161, RB-INC-136, RB-CTX-163]
prerequisites: [RB-INC-139, RB-INC-153, RB-INC-156, RB-INC-160]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-163 — Confiabilidade dos destinos no Google Maps

## 1. Contexto

Issue: `#378`.

Branch: `codex/rb-inc-163-google-maps-destination-reliability`.

Baseline: `474ad3c8b23c10605f4223e32cc75fb7169bd947`.

Foi observado em uso manual que `Calcular rota real` pode abrir um ponto diferente do estabelecimento ou atração pretendidos. O helper existente envia somente latitude/longitude como `destination`; isso é determinístico, porém herda integralmente coordenadas aproximadas do catálogo ou da Fonte externa.

O próprio catálogo contém pontos aproximados e, em alguns casos, entidades distintas muito próximas ou com a mesma coordenada de referência. Para uma experiência de guia em viagem real, abrir uma rota para o lugar errado é um problema de confiança maior que uma simples imprecisão visual no mapa interno.

## 2. Objetivo

Fazer com que links individuais de rota usem a identidade mais específica já disponível sem ativar Provider pago ou geocoding novo:

1. origem continua sendo a coordenada geocodificada da hospedagem;
2. destino prefere `nome + endereço` quando disponível;
3. coordenada validada permanece fallback quando o rótulo semântico não existe;
4. Google Maps continua sendo calculador externo de rota e tempo atuais.

## 3. Decisão

A URL oficial do Google Maps aceita texto de lugar/endereço como `destination`. O RouteBook passa a construir um rótulo semântico a partir de `Place.name + addressLabel` ou `ExternalPlaceCandidate.name + addressLabel` para rotas individuais.

Não é introduzido Google Place ID nesta entrega. Place ID poderia ser mais preciso, porém obtê-lo de modo confiável exigiria uma integração/provider adicional e fica fora deste incremento.

## 4. Escopo

- helper central de links do Google Maps com `destinationLabel` opcional;
- builder reutilizável de rótulo `nome + endereço`;
- cards publicados da Discovery;
- cards de candidatos externos da Discovery;
- detalhe de Place publicado, a pé e de carro;
- links individuais de paradas no Guia de Pipa;
- testes unitários das URLs;
- regressões E2E aplicáveis;
- documentação, Registry e rastreabilidade.

## 5. Fora de escopo

- Google Places API, Place Details API ou novo secret;
- Provider pago;
- geocoding/reverse-geocoding automático;
- correção em massa de coordenadas no banco sem Provenance;
- migration/schema;
- alterar distância geodésica do RouteBook;
- alterar posição dos marcadores do mapa interno;
- converter a sequência multi-paradas do Dia para waypoints textuais nesta entrega;
- concluir M8;
- promoção para Production sem gate humano separado.

## 6. Contratos

- `buildGoogleMapsDirectionsUrl` continua validando coordenadas de origem/destino;
- `destinationLabel` vazio nunca substitui o fallback geográfico;
- identidade semântica não é persistida pela geração do link;
- dados externos continuam com Overture como Fonte do candidato;
- links não alteram Place, Saved Place, Recommendation, Decision ou Itinerary;
- sequência multi-paradas continua usando coordenadas até contrato específico futuro;
- a aplicação não afirma que o cálculo do Google Maps é verdade canônica do RouteBook.

## 7. Caminhos autorizados

```text
apps/web/lib/google-maps-links.ts
apps/web/lib/google-maps-links.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/lib/pipa-day-guide.ts
apps/web/lib/pipa-day-guide.test.ts
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/trip-day-guide.spec.ts
apps/web/e2e/route-destination-reliability.spec.ts
docs/implementation/increments/rb-inc-163-google-maps-destination-reliability.md
docs/implementation/context-packs/rb-inc-163-google-maps-destination-reliability.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Exceção operacional transitória autorizada:

```text
.github/workflows/rb-inc-163-route-helper.yml
```

O helper pode somente aplicar substituições determinísticas nos caminhos autorizados, inserir `RB-INC-163` e `RB-CTX-163` no Registry, executar formatação dos arquivos alterados, remover a si próprio e criar o commit resultante. Ele não pode permanecer no diff final.

## 8. Critérios de aceite

- [ ] rota individual de Place com endereço usa `nome + endereço` como `destination`;
- [ ] candidato externo usa nome/endereço retornados pela Fonte quando disponíveis;
- [ ] ausência de endereço/rótulo mantém coordenada validada como fallback;
- [ ] origem da hospedagem continua geográfica e validada;
- [ ] detalhe do Place e card da Discovery seguem a mesma política;
- [ ] Guia de Pipa segue a mesma política para rota individual;
- [ ] sequência multi-paradas permanece inalterada;
- [ ] nenhuma migration, secret ou Provider novo é criado;
- [ ] Documentation e Engineering Validation ficam verdes no mesmo SHA;
- [ ] Preview correspondente ao head final fica READY antes do aceite funcional.

## 9. Testes obrigatórios

- rótulo semântico com nome/endereço;
- rota walking/driving com destino textual;
- fallback por coordenada;
- coordenada inválida falha antes da URL;
- sequência multi-paradas preserva ordem atual;
- E2E valida `destination` textual em pelo menos um Place publicado;
- E2E do Guia confirma rota individual identificável;
- `node scripts/validate-docs.mjs`;
- `pnpm format:check`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- Playwright aplicável.

## 10. Riscos

- endereço canônico também pode estar desatualizado: por isso esta entrega não reescreve fatos; ela melhora a resolução com dois sinais em vez de um ponto aproximado;
- nomes genéricos podem permanecer ambíguos: incluir endereço reduz risco e coordenada continua disponível como dado de contexto;
- Google pode interpretar o texto de forma diferente ao longo do tempo: o RouteBook continua exibindo `Ver mapa e fotos` para confirmação e não trata o resultado externo como canônico;
- Place ID seria mais forte, mas sua integração fica deliberadamente adiada para não ampliar risco antes da viagem.

## 11. Rollback

Código e documentação podem ser revertidos sem alteração de dados. Não existe migration nem write de catálogo nesta entrega.