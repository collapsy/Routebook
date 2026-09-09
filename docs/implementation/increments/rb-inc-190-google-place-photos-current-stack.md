---
id: RB-INC-190
title: Google Places Photos destination-agnostic na stack atual
description: Corrige o viés regional remanescente no Google Quality Provider e adiciona Google Places Photos governado em Preview para elevar a cobertura visual real de estabelecimentos comerciais.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-08"
last_updated: "2026-09-08"
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
→ Google Place Photo com Google Place ID previamente reconciliado
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
- Production, novo billing, nova chave e ampliação comercial permanecem fora do gate atual.

## 3. Evidência do problema

A validação humana do RB-INC-188 rejeitou o catálogo visual com muitos cards `Sem foto`.

A auditoria confirmou três causas:

1. o RB-INC-188 inicialmente desabilitava mídia em Destinations sem catálogo curado; isso foi corrigido no próprio incremento;
2. Wikimedia tem cobertura adequada para muitos landmarks e atrações, mas cobertura inconsistente para estabelecimentos comerciais;
3. o Google Quality Provider ainda envia `regionCode: "BR"` fixo mesmo quando as coordenadas da viagem pertencem a outro país.

No Preview de Antigua Guatemala, a Discovery retornou `candidateCount: 200`, mas `qualityMatchCount: 0`. Sem sinais Google reconciliados, os cards também não recebem um Google Place ID seguro para fotografia.

## 4. Quality Provider global

O Google Text Search já recebe `locationBias.circle` derivado das coordenadas reais dos targets. O incremento remove o `regionCode: "BR"` fixo da requisição para que o Provider não contradiga o contexto geográfico da viagem.

Regras:

- não inferir país por heurística textual;
- não substituir o location bias por hardcode regional;
- matching conservador atual permanece obrigatório;
- homônimo distante continua rejeitado;
- a remoção do `regionCode` não torna Google fonte canônica do Place;
- sinais continuam temporários e com Provenance.

## 5. Identidade autorizada para fotografia

Google Places Photos só pode ser tentado quando o item já possui `PlaceQualitySignals` com:

```text
provider = google-places
externalId = Google Place ID reconciliado
```

Não é permitido executar um segundo matching textual frouxo apenas para conseguir uma foto.

Antes de liberar mídia, o servidor consulta Place Details pelo Place ID e revalida:

- ID retornado;
- nome;
- coordenadas/proximidade;
- identidade usando a mesma política conservadora do Quality Provider.

Mismatch resulta em ausência de foto Google.

## 6. Contrato de mídia Google

Para cada card elegível:

1. browser solicita metadata ao endpoint RouteBook já existente;
2. endpoint tenta Google primeiro somente quando há `googlePlaceId` governado + categoria válida;
3. servidor chama Place Details com FieldMask mínimo `id,displayName,location,photos`;
4. identidade é revalidada;
5. resposta pública contém somente metadata de apresentação, attribution, link Google Maps quando disponível e token efêmero;
6. `photo resource name` e API key nunca chegam ao browser;
7. endpoint interno de mídia re-resolve `photos` pelo Place ID antes de buscar bytes;
8. mídia é validada por MIME e limite de tamanho.

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

## 9. Fallback e UX

Google miss/failure/mismatch deve degradar para Wikimedia segura usando o Destination dinâmico do RB-INC-188. Se Wikimedia também não produzir match seguro, usar o fallback compacto `Sem foto`.

Durante `idle/loading`, não reintroduzir hero ilustrativo genérico que recrie o problema visual rejeitado no RB-INC-188. O estado temporário continua compacto.

A mídia é lazy e limitada pelo `previewBudget` existente. Uma foto por card é suficiente nesta fatia.

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
- não criar nova chave ou billing;
- logs não podem conter chave, token completo ou resource name de foto.

## 11. Escopo

- remover `regionCode: "BR"` do Google Quality Provider e cobrir destino não-Brasil em teste;
- portar o adapter Google Place Photo para a stack atual;
- adicionar rota interna de bytes Google;
- integrar Google-first ao endpoint atual sem remover Wikimedia destination-agnostic;
- passar Google Place ID reconciliado do ranking para a superfície de mídia;
- renderizar attribution obrigatória;
- manter fallback compacto do RB-INC-188;
- testes unitários, rota, componente e E2E;
- documentação, Registry, rastreabilidade, CI e Preview.

## 12. Fora de escopo

- Production;
- criar API key, billing ou ampliar quota;
- aceitar ou alterar RB-ADR-012;
- scraping de Google Images/Maps, Instagram, TripAdvisor ou sites comerciais;
- usar texto sozinho para liberar foto;
- persistir Google Place Photo ou `photo resource name` no domínio;
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

Arquivo adicional indispensável deve ser registrado no Increment/Context Pack antes da alteração e justificado na PR.

## 14. Critérios de aceite

- [ ] Google Quality Provider não contém `regionCode: "BR"` fixo;
- [ ] destino não-Brasil recebe busca Google usando as coordenadas reais como location bias;
- [ ] `Place.primaryImage` continua prioridade absoluta;
- [ ] Google Photo só é tentada com Google Place ID previamente reconciliado;
- [ ] Place Details revalida ID, nome e proximidade;
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
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] Vercel Preview fica READY no mesmo SHA;
- [ ] Production permanece bloqueada.

## 15. Gate humano restante

Antes do merge:

1. CI e Preview precisam estar verdes no mesmo SHA final;
2. a amostra live deve provar correspondência visual segura e melhora material de cobertura;
3. o usuário deve aceitar visualmente o catálogo mobile.

Qualquer ativação em Production exige novo gate humano e revisão atual de compliance, quotas, billing e attribution.

## 16. Rollback

Remover `ROUTEBOOK_PLACE_PHOTO_PROVIDER` desabilita imediatamente Google Photos e mantém Wikimedia/fallback compacto. Não há migration nem persistência de mídia Google.
