---
id: RB-INC-190
title: Google Places Photos destination-agnostic na stack atual
description: Corrige o viés regional remanescente no Google Quality Provider e adiciona Google Places Photos governado em Preview para elevar a cobertura visual real de estabelecimentos comerciais.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-08"
last_updated: "2026-09-10"
authors: [RouteBook Team]
tags: [implementation, places, images, google-places, photos, quality, preview, destination-agnostic]
related_documents: [RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-168, RB-INC-172, RB-INC-177, RB-INC-188, RB-CTX-190]
prerequisites: [RB-INC-188]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-190 — Google Places Photos destination-agnostic na stack atual

## 1. Resultado vertical

A tela **Explorar Lugares** deve continuar honesta e destination-agnostic, mas não pode apresentar um catálogo de restaurantes, bares e vida noturna majoritariamente sem fotografias quando existe identidade Google segura para esses estabelecimentos.

A ordem visual passa a ser:

```text
Place.primaryImage curada
→ Google Place Photo com Google Place ID reconciliado com segurança
→ Wikimedia Commons com match seguro
→ fallback compacto “Sem foto”
```

Imagem continua sem efeito sobre score, ranking, publicação ou reconciliação canônica.

## 2. Issue, branch e base

- Issue: `#449`.
- Branch: `codex/rb-inc-190-google-place-photos-current-stack`.
- Base empilhada: HEAD final do RB-INC-188 / PR `#447`.
- A implementação histórica de Google Places Photos nas issues/PRs anteriores é referência técnica, não base de merge.
- A autorização humana registrada anteriormente permite Google Places Photos **somente em Preview**, reutilizando a credencial server-side existente.
- Em 10/09/2026, a validação humana autorizou continuar a melhoria de cobertura por carregamento sob demanda dos cards visíveis, sem ativar Production, criar nova chave ou alterar billing/quota do Provider.
- Production, novo billing, nova chave e ampliação de quota comercial permanecem fora do gate atual.

## 3. Evidência do problema

A validação humana do RB-INC-188 rejeitou o catálogo visual com muitos cards `Sem foto`.

A auditoria confirmou três causas iniciais:

1. o RB-INC-188 inicialmente desabilitava mídia em Destinations sem catálogo curado; isso foi corrigido no próprio incremento;
2. Wikimedia tem cobertura adequada para muitos landmarks e atrações, mas cobertura inconsistente para estabelecimentos comerciais;
3. o Google Quality Provider ainda enviava `regionCode: "BR"` fixo mesmo quando as coordenadas da viagem pertenciam a outro país.

No Preview de Antigua Guatemala, a Discovery retornou `candidateCount: 200`, mas `qualityMatchCount: 0`. A remoção do viés regional e o refinamento conservador de identidade elevaram a cobertura.

A validação posterior em Panajachel expôs um segundo gargalo: `candidateCount: 127`, `qualityMatchCount: 12` e `mediaPreviewEligibleCount: 12`. Fotos Google funcionaram para cards reconciliados, mas cards fora da cobertura inicial continuaram em Wikimedia/`Sem foto`, inclusive estabelecimentos que possuem fotografia no Google Maps. O caso `Punto Cero Guatemala`/`PUNTO ROJO` também comprovou a necessidade de aliases espaciais conservadores.

O `previewBudget` não pode condenar permanentemente cards posteriores ao fallback. Ele continua sendo proteção do bootstrap inicial, enquanto a interação/viewport pode solicitar enriquecimento individual autenticado.

## 4. Quality Provider global

O Google Text Search recebe `locationBias.circle` derivado das coordenadas reais dos targets. O incremento remove o `regionCode: "BR"` fixo da requisição para que o Provider não contradiga o contexto geográfico da viagem.

Regras:

- não inferir país por heurística textual;
- não substituir o location bias por hardcode regional;
- matching conservador permanece obrigatório;
- alias espacial só é aceito nas condições restritas e testadas do matching direcionado;
- homônimo distante continua rejeitado;
- a remoção do `regionCode` não torna Google fonte canônica do Place;
- sinais continuam temporários e com Provenance.

## 5. Identidade autorizada para fotografia

Google Places Photos pode ser tentado por dois caminhos equivalentes de identidade governada:

1. o item já possui `PlaceQualitySignals` com `provider = google-places` e `externalId` reconciliado pelo bootstrap; ou
2. um card renderizado para uma Trip autenticada entra próximo ao viewport, ainda não possui Google Place ID e solicita **uma reconciliação individual** usando nome, categoria, coordenadas e endereço disponível. Essa reconciliação usa o mesmo Google Quality Provider e a mesma política conservadora; somente um `PlaceQualitySignals(provider=google-places, externalId)` resultante pode seguir para foto.

Não é permitido liberar foto por texto sozinho, proximidade frouxa ou resultado Google não reconciliado. O lookup individual não altera Place canônico, ranking, Saved Place ou Recommendation.

Antes de liberar mídia, o servidor consulta Place Details pelo Place ID e revalida:

- ID retornado;
- nome, incluindo apenas aliases espaciais conservadores já autorizados;
- coordenadas/proximidade;
- identidade usando a política conservadora do Quality Provider.

Mismatch resulta em ausência de foto Google.

## 6. Contrato de mídia Google

Para cada card elegível:

1. browser aguarda o card se aproximar do viewport;
2. browser solicita metadata ao endpoint RouteBook, enviando contexto mínimo do Place e `tripId` quando o card precisar de reconciliação sob demanda;
3. se já houver `googlePlaceId` governado, o endpoint segue direto para a revalidação de mídia;
4. se não houver `googlePlaceId`, o endpoint só pode executar Quality individual quando a categoria for válida e `tripId` estiver autorizado para a sessão atual;
5. um match individual válido produz um Google Place ID efêmero apenas para esta resposta; ele não é persistido no domínio;
6. servidor chama Place Details com FieldMask mínimo `id,displayName,location,photos`;
7. identidade é revalidada novamente;
8. resposta pública contém somente metadata de apresentação, attribution, link Google Maps quando disponível e token efêmero;
9. `photo resource name` e API key nunca chegam ao browser;
10. endpoint interno de mídia re-resolve `photos` pelo Place ID antes de buscar bytes;
11. mídia é validada por MIME e limite de tamanho.

Metadata e bytes Google usam `private, no-store`.

## 7. Token efêmero

O token de mídia:

- é assinado server-side;
- possui TTL curto;
- carrega somente Place ID, índice da foto e expiração;
- não contém API key nem photo resource name;
- é rejeitado se adulterado ou expirado.

## 8. Attribution

Quando fornecido pelo Google:

- mostrar `Google Maps` junto à foto;
- mostrar `authorAttributions` disponíveis;
- linkar URI do autor somente quando HTTPS e host permitido;
- oferecer link para o conteúdo correspondente no Google Maps quando válido;
- attribution não pode ser removida por compactação do card.

## 9. Fallback, UX e budget

Google miss/failure/mismatch deve degradar para Wikimedia segura usando o Destination dinâmico do RB-INC-188. Se Wikimedia também não produzir match seguro, usar o fallback compacto `Sem foto`.

Durante `idle/loading`, não reintroduzir hero ilustrativo genérico que recrie o problema visual rejeitado no RB-INC-188. O estado temporário continua compacto.

A mídia continua lazy e uma foto por card é suficiente. O `previewBudget` limita o conjunto priorizado pelo bootstrap inicial; ele não bloqueia para sempre cards posteriores. Cards adicionais podem solicitar Quality + Media individualmente somente ao se aproximarem do viewport, com autenticação da Trip e sem fan-out eager de todos os candidatos.

O limite de exibição do Discovery continua limitando quantos cards podem ser materializados em uma página. A mudança não autoriza background crawl, prefetch de todos os candidatos nem persistência de IDs/fotos Google.

## 10. Production e configuração

Seleção explícita:

```text
ROUTEBOOK_PLACE_PHOTO_PROVIDER=google
GOOGLE_PLACES_API_KEY=<secret server-side existente>
```

Regras:

- ausência da variável = nenhuma chamada Google Photos;
- `VERCEL_ENV=production` bloqueia o adapter nesta fase;
- nenhuma variável Production é alterada por este incremento;
- não criar nova chave, billing ou ampliar quota do Provider;
- logs não podem conter chave, token completo ou resource name de foto.

## 11. Escopo

- remover `regionCode: "BR"` do Google Quality Provider e cobrir destino não-Brasil em teste;
- portar o adapter Google Place Photo para a stack atual;
- adicionar rota interna de bytes Google;
- integrar Google-first ao endpoint atual sem remover Wikimedia destination-agnostic;
- passar Google Place ID reconciliado do ranking para a superfície de mídia;
- permitir reconciliação Quality individual, autenticada e lazy para cards sem ID inicial que entram próximo ao viewport;
- passar `tripId` e endereço disponível à superfície de mídia sem persistir novo dado Google;
- preservar alias espacial conservador para renomes confirmados por proximidade forte;
- renderizar attribution obrigatória;
- manter fallback compacto do RB-INC-188;
- adicionar probe de aceitação estritamente Preview-only, com cenários fixos e resposta agregada sem secrets/resource names, para medir Quality + disponibilidade de foto real nos dois destinos exigidos pelo gate;
- testes unitários, rota, componente e E2E;
- documentação, Registry, rastreabilidade, CI e Preview.

A probe de aceitação é indispensável porque a rota `api/internal/place-quality-probe` existente pertence ao RB-INC-172, restringe-se à branch histórica e contém diagnóstico regional legado. Ela não será reutilizada nem ampliada como contrato de produto.

## 12. Fora de escopo

- Production;
- criar API key, billing ou ampliar quota do Provider;
- aceitar ou alterar RB-ADR-012;
- scraping de Google Images/Maps, Instagram, TripAdvisor ou sites comerciais;
- usar texto sozinho para liberar foto;
- endpoint anônimo que permita disparar Quality Google sob demanda;
- prefetch/background crawl de todos os candidatos do Discovery;
- persistir Google Place Photo, Google Place ID de enriquecimento ou `photo resource name` no domínio;
- copiar reviews;
- alterar score/ranking por causa da imagem;
- substituir `Place.primaryImage` curada;
- restaurar hardcodes de Pipa/Brasil.

## 13. Caminhos autorizados

```text
apps/web/lib/place-quality-provider.ts
apps/web/lib/place-quality-provider.test.ts
apps/web/lib/google-place-photo.ts
apps/web/lib/google-place-photo.test.ts
apps/web/app/api/place-image-preview/route.ts
apps/web/app/api/place-image-preview/route.test.ts
apps/web/app/api/place-image-preview/google/route.ts
apps/web/app/api/place-image-preview/google/route.test.ts
apps/web/app/api/internal/place-media-probe/route.ts
apps/web/app/api/internal/place-media-probe/route.test.ts
apps/web/components/external-place-image-preview.tsx
apps/web/components/external-place-image-preview.test.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/e2e/external-place-images.spec.ts
apps/web/e2e/multi-destination-validation.spec.ts
turbo.json
docs/implementation/increments/rb-inc-190-google-place-photos-current-stack.md
docs/implementation/context-packs/rb-inc-190-google-place-photos-current-stack.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

`apps/web/lib/trip-route-access.ts` pode ser importado como fronteira existente de autorização, mas não deve ser alterado neste incremento.

Arquivo adicional indispensável deve ser registrado no Increment/Context Pack antes da alteração e justificado na PR.

## 14. Critérios de aceite

- [ ] Google Quality Provider não contém `regionCode: "BR"` fixo;
- [ ] destino não-Brasil recebe busca Google usando as coordenadas reais como location bias;
- [ ] `Place.primaryImage` continua prioridade absoluta;
- [ ] Google Photo só é tentada com Google Place ID reconciliado pelo bootstrap ou por Quality individual autenticada usando a mesma política conservadora;
- [ ] card fora do `previewBudget` inicial pode obter foto ao entrar próximo ao viewport sem fan-out eager dos demais cards;
- [ ] Quality individual sem `tripId` autorizado não chama Google;
- [ ] Place Details revalida ID, nome/alias autorizado e proximidade;
- [ ] API key e photo resource name não chegam ao browser;
- [ ] metadata e mídia Google usam `private, no-store`;
- [ ] token de mídia é efêmero e assinado;
- [ ] attribution obrigatória é renderizada;
- [ ] mismatch não exibe fotografia possivelmente errada;
- [ ] falha Google degrada para Wikimedia segura e depois `Sem foto` compacto;
- [ ] nenhuma ilustração hero genérica volta ao Place Card;
- [ ] foto não altera score/ranking;
- [ ] pelo menos dois Destinations não-Pipa são validados, incluindo um fora do Brasil;
- [ ] cobertura live de gastronomia/vida noturna melhora materialmente no Preview;
- [ ] probe Preview-only não expõe API key, token de mídia completo ou photo resource name;
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] Vercel Preview fica READY no mesmo SHA;
- [ ] Production permanece bloqueada.

## 15. Gate humano restante

Antes do merge:

1. CI e Preview precisam estar verdes no mesmo SHA final;
2. a amostra live deve provar correspondência visual segura e melhora material de cobertura, incluindo cards que não receberam match no bootstrap inicial;
3. o usuário deve aceitar visualmente o catálogo mobile.

Qualquer ativação em Production exige novo gate humano e revisão atual de compliance, quotas, billing e attribution.

## 16. Rollback

Remover `ROUTEBOOK_PLACE_PHOTO_PROVIDER` desabilita imediatamente Google Photos e mantém Wikimedia/fallback compacto. Não há migration nem persistência de mídia Google.
