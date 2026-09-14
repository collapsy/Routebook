---
id: RB-CTX-189
title: Context Pack do RB-INC-189 — geocodificação robusta de Hospedagem na stack atual
description: Delimita a resolução destination-aware de Hospedagem somente por nome reconciliada com a stack atual de Discovery, visão geral e mídia.
document_type: implementation-context-pack
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-09"
last_updated: "2026-09-09"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip, accommodation, geocoding, routebook-anywhere]
related_documents: [RB-INC-189, RB-INC-181, RB-INC-183, RB-INC-190, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-DATA-002, RB-OBS-001]
prerequisites: [RB-INC-181, RB-INC-183, RB-INC-190]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-189 — geocodificação robusta de Hospedagem na stack atual

## 1. Missão

Portar a correção RB-INC-189 para a stack RouteBook Anywhere mais recente sem regredir as capacidades já entregues depois do RB-INC-181. Em especial, a coordenada segura da Hospedagem deve alimentar a Region accommodation-first e a visão geral do RB-INC-183, que já projeta Lugares próximos em Destinations zero-seed.

## 2. Unidade de trabalho

- Issue: #451;
- branch: `codex/rb-inc-189-accommodation-name-geocoding-current-stack`;
- base: PR #450 / RB-INC-190 @ `966e205a599e8f6530348da7d67b0544dd379599`;
- predecessor funcional de geocoding: RB-INC-181;
- comportamento de visão geral a preservar: RB-INC-183;
- Provider de Hospedagem: Nominatim existente;
- Preview: gate funcional;
- merge: gate humano;
- Production: fora de escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004 — RouteBook Bible;
3. `docs/README.md`;
4. RB-DOM-001 / RB-DOM-002;
5. RB-ARC-001;
6. RB-DATA-002;
7. RB-OBS-001;
8. RB-INC-181 / RB-CTX-181;
9. RB-INC-183 / RB-CTX-183;
10. RB-INC-190 / RB-CTX-190;
11. issue #451;
12. RB-INC-189 / este Context Pack.

## 4. Evidência humana que motivou a reconciliação

No Preview antigo do RB-INC-189, o usuário criou `Panajachel, Guatemala` com `Hotel Palacio Maya` apenas pelo nome. A Hospedagem foi localizada e o mapa passou a existir, validando a correção de geocoding. Porém a visão geral mostrou somente um ponto porque aquela branch estava baseada diretamente no RB-INC-181 e não continha RB-INC-183.

Na stack atual, `apps/web/app/viagens/[tripId]/page.tsx` já usa `loadTripOverviewDiscoveryMap`. Portanto a correção correta é portar RB-INC-189 para essa base, não criar outro algoritmo de Places.

## 5. Invariantes

- Accommodation continua opcional e pertencente à Trip;
- `coordinate` continua contexto espacial opcional;
- Provider externo permanece fora do domínio;
- Nominatim continua consulta pontual por submit, nunca autocomplete;
- Destination fornece contexto, não regra regional;
- resultado inseguro equivale a ausência de coordenada;
- falha do Geocoder não bloqueia a criação da Viagem;
- criação e edição compartilham a política de resolução;
- endereço completo mantém comportamento do RB-INC-181;
- fallback manual avançado permanece disponível;
- visão geral continua usando RB-INC-183; este incremento não materializa, salva ou publica candidato apenas por leitura;
- nenhuma mudança em Production ou `main` é autorizada.

## 6. Alterações permitidas

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

Qualquer caminho adicional deve ser autorizado primeiro neste Context Pack e no Increment.

## 7. Contrato Geocoder

`geocode(query, context?)` aceita contexto provider-neutral opcional:

- `countryCode`;
- `anchor` com latitude/longitude do Destination;
- `maxDistanceKm`;
- `rejectAmbiguous`.

Sem contexto, o comportamento permanece compatível com o contrato anterior.

Para contexto espacial válido, Nominatim pode buscar pequena lista de candidatos, aplicar país e `viewbox` restritivo, calcular distância e selecionar conservadoramente. Resultado inválido ou inseguro retorna ausência em vez de coordenada inventada.

## 8. Contrato name-only

Para Hospedagem sem endereço:

1. query = `nome da Hospedagem + Destination`;
2. país e âncora vêm do Destination confirmado;
3. `city` usa 40 km;
4. com âncora/raio, `viewbox` + `bounded=1` restringem a recuperação;
5. país e distância são revalidados após a resposta;
6. candidatos co-localizados podem representar o mesmo local;
7. dois candidatos distintos competitivos resultam em `undefined`.

O caso `Hotel Palacio Maya` + `Panajachel, Guatemala` deve poder resolver o candidato local `Hotel El Palacio Maya` quando o Provider o devolver.

## 9. Contrato com endereço

- query = `endereço + Destination`;
- país pode restringir candidatos;
- não aplicar raio rígido de name-only;
- preservar endereço explicitamente informado pelo usuário;
- regressão do RB-INC-181 permanece coberta.

## 10. Criação da Viagem

Após o Destination ser confirmado e antes da persistência:

1. normalizar nome/endereço da Hospedagem;
2. sem nome, não chamar o Geocoder;
3. com nome, usar a mesma resolução destination-aware da edição;
4. sucesso seguro persiste coordenada e endereço normalizado quando necessário;
5. `not-found` ou Provider indisponível persistem somente os dados textuais e não bloqueiam a Trip.

## 11. Integração com visão geral

Nenhum arquivo do read model de visão geral deve ser alterado por este incremento. O contrato já existente do RB-INC-183 é a autoridade:

- Region accommodation-first;
- Hospedagem + Places canônicos + descobertas externas seguras;
- Overture via porta existente;
- leitura sem mutação;
- falha de Provider degrada sem quebrar a visão geral.

O E2E do RB-INC-189 deve provar a composição: Hospedagem name-only criada com coordenada → visão geral com mapa → ao menos um Lugar próximo quando a fixture determinística do ambiente E2E fornece cobertura externa.

## 12. Testes mínimos

- Geocoder sem contexto permanece compatível;
- país e `viewbox` aplicados;
- candidato mais próximo selecionado;
- candidato fora do raio rejeitado;
- `city` rejeita candidato além de 40 km;
- ambiguidade fail-closed;
- duplicatas co-localizadas não criam falso conflito;
- name-only envia query + contexto estruturado;
- `Hotel Palacio Maya` / Panajachel em teste de aplicação;
- endereço completo não regride;
- criação persiste coordenada segura;
- criação degrada em no-result/Provider error;
- criação sem Hospedagem não chama Geocoder;
- E2E cria Viagem com Hospedagem somente por nome e comprova mapa + Lugares próximos na visão geral;
- E2E legado de Pipa usa locator semântico único quando o nome da Hospedagem também aparece no mapa.

## 13. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation e Engineering Validation devem ficar verdes no mesmo SHA. O Preview Vercel deve estar READY no mesmo SHA.

## 14. Gates humanos remanescentes

- criar uma nova Trip em Panajachel no Preview consolidado;
- informar apenas `Hotel Palacio Maya`;
- confirmar que a Hospedagem está correta;
- confirmar que a visão geral contém Hospedagem e múltiplos Lugares próximos, quando a Discovery live estiver disponível;
- validar ao menos um segundo Destination não-Pipa;
- qualquer mudança de Provider/comercialização;
- qualquer mudança em Production;
- integração na `main`.
