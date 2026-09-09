---
id: RB-INC-189
title: Geocodificação robusta de Hospedagem por nome e contexto do Destination
description: Torna a resolução de Hospedagem somente por nome destination-aware, priorizando candidatos espacialmente coerentes e rejeitando resultados distantes ou ambíguos.
document_type: implementation-increment
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-09"
last_updated: "2026-09-09"
authors: [RouteBook Team]
tags: [implementation, trip, accommodation, geocoding, routebook-anywhere, destination]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-DATA-002, RB-DATA-003, RB-OBS-001, RB-INC-181, RB-CTX-189]
prerequisites: [RB-INC-181]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-189 — Geocodificação robusta de Hospedagem por nome e contexto do Destination

## 1. Contexto

- Issue: #451.
- Branch: `codex/rb-inc-189-accommodation-name-geocoding-rb181`.
- Base: RB-INC-181 / PR #431 no SHA `0d86b0ca3eabcc27ad12ae0013d0f12c70c49259`.
- O RB-INC-181 automatizou a geocodificação no submit, porém o adapter Nominatim ainda usa `limit=1` e aceita o primeiro resultado textual.
- Em uso real foi observado que informar somente o nome do hotel/pousada pode não localizar a Hospedagem ou pode depender demais da ordenação textual global do Provider.
- O Destination já possui país e, quando resolvido pelo fluxo atual, coordenadas suficientes para funcionar como âncora espacial sem introduzir um Provider novo.

## 2. Resultado vertical

Quando o usuário informa somente o nome da Hospedagem, o RouteBook usa o Destination da própria Trip como contexto estruturado para buscar e selecionar um candidato geograficamente coerente. O primeiro resultado global deixa de ser aceito automaticamente.

Quando não existe candidato seguro — por distância excessiva, país divergente ou ambiguidade relevante — nenhuma coordenada é inventada e o fallback avançado do RB-INC-181 permanece disponível.

## 3. Decisões de desenho

### 3.1 Mesma porta e mesmo Provider

A porta `Geocoder` permanece a fronteira externa e o adapter continua sendo Nominatim. O incremento apenas adiciona contexto opcional de busca à porta, sem acoplar Trip Management a parâmetros específicos do Provider.

### 3.2 Nome-only usa contexto espacial, não hardcode regional

Para Hospedagem sem endereço:

- a query primária é o nome informado pelo usuário;
- `countryCode`, latitude, longitude e tipo do Destination são derivados da Trip;
- o adapter pode usar esses dados para restringir/priorizar candidatos;
- nenhuma regra depende de Pipa, Brasil ou cidade específica.

O texto do Destination deixa de ser a única forma de desambiguação para o caso name-only.

### 3.3 Mais de um candidato, seleção conservadora

Quando existe contexto espacial, o Nominatim pode retornar uma pequena lista limitada de candidatos. O RouteBook:

1. valida payload, coordenadas e país;
2. calcula distância até a âncora do Destination;
3. descarta candidato fora do raio coerente com o tipo do Destination;
4. trata resultados praticamente co-localizados como a mesma localização para evitar falso conflito de objetos OSM duplicados;
5. rejeita o resultado quando dois candidatos espacialmente distintos continuam competitivos, em vez de escolher arbitrariamente.

### 3.4 Endereço completo preserva RB-INC-181

Quando existe endereço, a query continua usando `endereço + Destination`. O novo contexto pode restringir país, mas o fluxo não passa a exigir proximidade rígida para endereços completos, preservando a regressão já validada pelo RB-INC-181.

### 3.5 Degradação fail-closed

`undefined` continua significando ausência de resultado seguro. Erros do Provider continuam usando `GeocodingProviderError`. Nenhum estado novo é introduzido no domínio e `Accommodation.coordinate` continua opcional.

## 4. Escopo

```text
apps/web/lib/geocoding.ts
apps/web/lib/geocoding.test.ts
apps/web/lib/accommodation-geocoding.ts
apps/web/lib/accommodation-geocoding.test.ts
apps/web/e2e/authenticated-trips.spec.ts
docs/implementation/increments/rb-inc-189-accommodation-name-geocoding.md
docs/implementation/context-packs/rb-inc-189-accommodation-name-geocoding.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Mudança fora desses caminhos exige atualização deste incremento e do Context Pack antes do commit correspondente.

## 5. Fora de escopo

- autocomplete de Hospedagem por tecla;
- reserva ou recomendação de hotel;
- múltiplas hospedagens;
- Google Places ou qualquer Provider pago novo para geocoding;
- alteração de conceitos/invariantes de Domain;
- ranking, Discovery ou mídia de Lugares;
- migration;
- Production;
- merge na `main` sem autorização humana.

## 6. Critérios de aceite

- [ ] Hospedagem somente por nome pode ser resolvida quando existe candidato espacialmente coerente com o Destination;
- [ ] país do Destination restringe a seleção quando disponível;
- [ ] coordenada do Destination prioriza candidatos próximos sem regra regional fixa;
- [ ] candidato distante do Destination é rejeitado no fluxo name-only;
- [ ] candidatos espacialmente distintos e competitivos são tratados como ambíguos e não geram coordenada arbitrária;
- [ ] duplicatas praticamente co-localizadas não geram falso estado ambíguo;
- [ ] endereço completo continua funcionando como no RB-INC-181;
- [ ] no-result e erro do Provider continuam sem coordenada inventada;
- [ ] fallback manual avançado permanece intacto;
- [ ] teste unitário do adapter cobre país, proximidade, distância, ambiguidade e compatibilidade sem contexto;
- [ ] teste de aplicação cobre name-only com contexto do Destination e regressão de endereço completo;
- [ ] E2E determinístico cobre Hospedagem somente por nome → save → contexto espacial disponível;
- [ ] Documentation Validation e Engineering Validation ficam verdes no mesmo SHA;
- [ ] Vercel Preview real permanece gate de aceite funcional posterior quando a quota estiver disponível;
- [ ] Production permanece intocada;
- [ ] merge permanece gate humano explícito.

## 7. Riscos

| Risco | Mitigação |
| --- | --- |
| homônimo próximo | detectar competição entre candidatos distintos e falhar fechado |
| objetos OSM duplicados do mesmo hotel | agrupar candidatos praticamente co-localizados antes de avaliar ambiguidade |
| Destination grande | raio varia por tipo canônico em vez de assumir cidade |
| resultado em outro país | `countryCode` enviado e revalidado quando disponível |
| Provider público receber chamadas excessivas | uma única consulta por submit no caminho normal; sem autocomplete e lista pequena |
| regressão de endereço completo | contexto espacial rígido aplicado somente ao fluxo name-only |

## 8. Rollback

Não há migration. Rollback restaura o comportamento do RB-INC-181 (`limit=1` e query textual contextual). Coordenadas já persistidas continuam válidas e o fallback manual permanece inalterado.
