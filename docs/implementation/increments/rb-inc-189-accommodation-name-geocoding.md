---
id: RB-INC-189
title: Geocodificação robusta de Hospedagem por nome na stack atual
description: Torna a resolução de Hospedagem somente por nome destination-aware e a reconcilia com a stack RouteBook Anywhere que já exibe lugares próximos na visão geral.
document_type: implementation-increment
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-09"
last_updated: "2026-09-09"
authors: [RouteBook Team]
tags: [implementation, trip, accommodation, geocoding, routebook-anywhere, destination]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-DATA-002, RB-OBS-001, RB-INC-181, RB-INC-183, RB-INC-190, RB-CTX-189]
prerequisites: [RB-INC-181, RB-INC-183, RB-INC-190]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-189 — Geocodificação robusta de Hospedagem por nome na stack atual

## 1. Contexto

- Issue canônica: #451.
- Branch: `codex/rb-inc-189-accommodation-name-geocoding-current-stack`.
- Base de reconciliação: RB-INC-190 / PR #450 @ `966e205a599e8f6530348da7d67b0544dd379599`.
- A primeira implementação do RB-INC-189 foi validada em um Preview empilhado diretamente sobre RB-INC-181. O aceite humano confirmou que `Hotel Palacio Maya` em `Panajachel, Guatemala` passou a ser geocodificado durante a criação da Viagem.
- O mesmo aceite revelou que aquele Preview antigo mostrava apenas a Hospedagem no mapa da visão geral. A causa não era a nova geocodificação: a base RB-INC-181 ainda não continha RB-INC-183, que posteriormente passou a projetar descobertas externas próximas na visão geral.
- Este incremento é, portanto, reconciliado sobre a stack atual para combinar a correção de Hospedagem com RB-INC-183/184/185/186/187/188/190, sem reimplementar Discovery nem mídia.

## 2. Resultado vertical

Quando o usuário cria ou edita uma Viagem informando apenas o nome da Hospedagem, o RouteBook usa o Destination confirmado como contexto textual, de país e espacial para escolher conservadoramente um candidato do Geocoder.

Quando a Hospedagem é resolvida, sua coordenada é persistida e passa a alimentar a Region accommodation-first já existente. Na stack atual, a visão geral continua usando `loadTripOverviewDiscoveryMap`; portanto uma Trip zero-seed com Discovery disponível deve representar Hospedagem e Lugares próximos, e não apenas um ponto de Hospedagem.

Nenhum candidato distante ou ambíguo deve ser aceito apenas para preencher coordenadas. Falha de geocoding não bloqueia a criação da Viagem.

## 3. Decisões

### 3.1 Mesmo Provider e mesma porta

- `Geocoder` continua sendo a fronteira externa;
- Nominatim continua sendo o adapter de Hospedagem;
- nenhuma chamada por tecla/autocomplete é introduzida;
- nenhum Provider pago novo é criado;
- parâmetros externos não entram no Domain.

### 3.2 Name-only destination-aware

Para Hospedagem sem endereço:

1. query textual = `nome da Hospedagem + Destination`;
2. `countryCode` do Destination restringe os candidatos quando disponível;
3. coordenadas do Destination funcionam como âncora;
4. `Destination.type = city` usa raio conservador de 40 km;
5. com âncora/raio o Nominatim usa `viewbox` + `bounded=1`;
6. o adapter revalida país e distância localmente;
7. objetos praticamente co-localizados não geram falsa ambiguidade;
8. candidatos espacialmente distintos e competitivos fazem a resolução falhar fechada.

Não existe regra por Pipa, Gramado, Panajachel, Guatemala ou Brasil.

### 3.3 Endereço completo preserva RB-INC-181

Quando existe endereço, a query continua sendo `endereço + Destination`. País pode restringir o Provider, mas não se aplica o raio rígido name-only para não regredir endereços completos em Destinations amplos.

### 3.4 Criação e edição compartilham a política

`/viagens/nova` resolve a Hospedagem depois que o Destination é confirmado e antes de persistir a Trip. A edição de Hospedagem reutiliza o mesmo helper de resolução. `not-found` ou `GeocodingProviderError` preservam os dados textuais e deixam coordenada ausente.

### 3.5 Visão geral herda RB-INC-183

Este incremento não cria um segundo pipeline de Discovery. A visão geral deve continuar usando o read model do RB-INC-183 (`loadTripOverviewDiscoveryMap`) e a Region accommodation-first. O teste integrado deste incremento deve provar que a nova coordenada criada pelo fluxo name-only alimenta essa projeção e mantém Lugares próximos visíveis.

## 4. Escopo autorizado

```text
apps/web/lib/geocoding.ts
apps/web/lib/geocoding.test.ts
apps/web/lib/accommodation-geocoding.ts
apps/web/lib/accommodation-geocoding.test.ts
apps/web/app/viagens/nova/actions.ts
apps/web/app/viagens/nova/actions.test.ts
apps/web/e2e/authenticated-trips.spec.ts
apps/web/e2e/product-shell.spec.ts
docs/implementation/increments/rb-inc-189-accommodation-name-geocoding.md
docs/implementation/context-packs/rb-inc-189-accommodation-name-geocoding.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Qualquer caminho adicional exige atualização prévia deste Increment e do Context Pack.

## 5. Fora de escopo

- alterar `trip-overview-discovery-map` ou criar nova Discovery para a visão geral;
- autocomplete de Hospedagem por tecla;
- recomendação/reserva de hotel;
- múltiplas hospedagens;
- novo Provider de geocoding;
- alterar ranking, mídia ou contratos de Place;
- migration;
- Production;
- merge na `main` sem autorização humana explícita.

## 6. Critérios de aceite

- [ ] Hospedagem somente por nome usa Destination textual + país + âncora quando disponíveis;
- [ ] candidato distante é rejeitado no fluxo name-only;
- [ ] candidatos distintos competitivos são tratados como ambíguos;
- [ ] duplicatas co-localizadas não bloqueiam candidato seguro;
- [ ] `city` usa raio de 40 km;
- [ ] endereço completo preserva o comportamento do RB-INC-181;
- [ ] criação de Viagem tenta geocodificar Hospedagem antes da persistência;
- [ ] `not-found`/Provider indisponível não bloqueiam a criação nem inventam coordenadas;
- [ ] `Hotel Palacio Maya` + `Panajachel, Guatemala` é coberto em teste de aplicação;
- [ ] E2E prova criação name-only → contexto espacial disponível;
- [ ] no mesmo E2E, a visão geral atual continua exibindo Lugares próximos herdados do RB-INC-183, em vez de somente a Hospedagem;
- [ ] Pipa e destinos zero-seed continuam usando o mesmo contrato;
- [ ] Documentation e Engineering Validation ficam verdes no mesmo SHA;
- [ ] Vercel Preview fica READY no mesmo SHA;
- [ ] aceite humano repete Panajachel no Preview consolidado;
- [ ] Production permanece intocada;
- [ ] merge permanece gate humano.

## 7. Riscos

| Risco | Mitigação |
| --- | --- |
| homônimo em cidade vizinha | país + `bounded=1` + raio + validação radial |
| dois hotéis próximos com nomes semelhantes | detecção de competição e fail-closed |
| objetos OSM duplicados | tolerância somente para co-localização curta |
| regressão de endereço completo | contexto espacial rígido somente no name-only |
| criação depender do Provider | degradação para Hospedagem textual sem bloquear Trip |
| validar em Preview antigo e perder features posteriores | base atual RB-INC-190 e E2E que exige Lugares próximos da visão geral |

## 8. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation Validation e Engineering Validation do GitHub são evidências canônicas. O Preview precisa corresponder ao mesmo SHA final.
