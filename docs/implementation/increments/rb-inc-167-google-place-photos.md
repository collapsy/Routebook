---
id: RB-INC-167
title: Google Places Photos para cobertura visual governada
description: Amplia a cobertura de fotografias reais na Discovery usando Google Places Photos somente no Preview, reutilizando a identidade Google já resolvida pelo ranking e preservando Provenance, atribuição, custo e fallback.
document_type: implementation-increment
owner: Place Catalog and Integrations
status: Draft
version: "0.1.0"
created: "2026-09-01"
last_updated: "2026-09-01"
authors: [RouteBook Team]
tags: [implementation, places, images, google-places, photos, provenance, preview, cost-governance]
related_documents: [RB-CORE-0004, RB-ARC-001, RB-ADR-012, RB-INC-141, RB-INC-162, RB-INC-168, RB-INC-172, RB-CTX-167]
prerequisites: [RB-INC-141, RB-INC-162, RB-INC-168, RB-INC-172]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-167 — Google Places Photos para cobertura visual governada

## 1. Contexto

Issue: `#382`.

Branch: `codex/rb-inc-167-google-place-photos`.

Baseline: `main@b067a688f39c1e3298e9670b6a82c9857a188f0e`.

O uso real em Pipa confirmou que Wikimedia Commons preserva Provenance/licença, porém não oferece cobertura suficiente para estabelecimentos. O RB-INC-172 passou a resolver identidade Google de forma conservadora para ranking no Preview e expõe `externalId` em `PlaceQualitySignals`.

Em 01/09/2026 houve autorização humana explícita para experimentar Google Places Photos somente no Preview. Production continua sem ativação e a decisão interna do RB-ADR-012 permanece `Proposed`; este incremento não aceita o ADR em nome do usuário.

A documentação oficial atual exige que `photo name` não seja cacheado e pode expirar. `authorAttributions`, quando presente, deve ser exibido. O SKU Place Details Photos possui free usage cap de 1.000 solicitações/mês e preço inicial global de US$ 7/1.000 após o cap.

## 2. Objetivo

Aumentar materialmente a cobertura visual dos cards sem criar fotografia falsa, sem persistir referência temporária Google e sem duplicar a resolução de identidade já feita pelo ranking.

Cadeia visual:

```text
Place.primaryImage governada
→ Google Places Photo quando existe externalId Google seguro
→ Wikimedia Commons secure
→ ilustração genérica por categoria
```

## 3. Reutilização de identidade

Google Photos não executa nova busca textual para decidir qual Place é o correto.

A UI recebe `PlaceQualitySignals.externalId` somente quando o RB-INC-172 associou o Place/candidato a um Google Place ID por matching conservador.

O endpoint de metadata revalida o Place ID com Place Details usando nome + coordenada antes de emitir um token efêmero de mídia. Isso impede que um `placeId` arbitrário seja aceito somente porque veio do browser.

## 4. Provider e configuração

Ativação independente:

```text
ROUTEBOOK_PLACE_PHOTO_PROVIDER=google
GOOGLE_PLACES_API_KEY=<server-side secret já provisionado no Preview>
```

Ausência da variável, Provider inválido ou secret ausente não quebra a Discovery e mantém Wikimedia/categoria.

Production não recebe `ROUTEBOOK_PLACE_PHOTO_PROVIDER` neste incremento.

## 5. Fluxo

```text
card próximo ao viewport
→ GET /api/place-image-preview?googlePlaceId=...
→ Place Details (New): id, displayName, location, photos
→ revalidação conservadora nome + distância
→ metadata sanitizada + attribution + token efêmero sem photo name
→ GET /api/place-image-preview/google?token=...
→ Place Details (New): photos
→ resolve photo name atual
→ Place Photos (New)
→ bytes servidos pelo domínio RouteBook
```

O browser nunca recebe API key nem `photo name`.

## 6. Cache e custo

- metadata Google: `Cache-Control: no-store`;
- mídia Google: `Cache-Control: no-store`;
- token de mídia expira em poucos minutos;
- nenhuma URL de foto ou resource name é persistida;
- uma única foto por card nesta fase;
- carregamento continua lazy por `IntersectionObserver`;
- Wikimedia mantém sua política de cache atual;
- falha Google tenta Wikimedia antes do fallback ilustrado quando possível.

## 7. Segurança e Provenance

- API key somente server-side;
- token de mídia é assinado com HMAC e não contém secret;
- Place ID é revalidado contra nome/coordenada;
- mídia aceita somente JPEG, PNG ou WebP e possui limite de tamanho;
- nenhuma resposta de erro imprime secret, token completo ou photo name;
- atribuição de plataforma é exibida como `Google Maps` no mesmo container da fotografia e `authorAttributions` adicionais são exibidos quando fornecidos;
- link Google Maps da fotografia é exibido somente quando retornado pelo Provider;
- Overture continua Fonte factual dos candidatos externos;
- Google fornece apenas mídia/Provenance de mídia nesta capability.

## 8. Escopo

```text
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
turbo.json
docs/implementation/increments/rb-inc-167-google-place-photos.md
docs/implementation/context-packs/rb-inc-167-google-place-photos.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 9. Fora de escopo

- alterar `Place.primaryImage`;
- persistir foto Google ou resource name;
- galeria;
- escolher foto editorialmente;
- Google Maps JavaScript API;
- mudar ranking;
- ativar Google Photos em Production;
- aceitar o RB-ADR-012;
- migration/schema;
- scraping.

## 10. Critérios de aceite

- [ ] foto Google só é tentada quando existe externalId Google proveniente do matching seguro;
- [ ] Place Details revalida identidade antes de liberar mídia;
- [ ] API key, photo name e token de assinatura não aparecem em HTML/log;
- [ ] attribution é exibida quando exigida;
- [ ] ausência de attribution válida não inventa autoria;
- [ ] metadata e mídia Google não são cacheadas;
- [ ] photo name nunca é persistido/cacheado;
- [ ] imagem curada continua prevalecendo;
- [ ] falha Google degrada para Wikimedia/categoria;
- [ ] nenhuma chamada Google ocorre sem configuração explícita;
- [ ] browser recebe somente URL RouteBook para mídia;
- [ ] custo é limitado por lazy load + uma foto por card;
- [ ] Documentation + Engineering/Playwright verdes no mesmo SHA;
- [ ] Vercel Preview READY no mesmo SHA;
- [ ] cobertura real no Preview é medida antes de qualquer Production.

## 11. Testes obrigatórios

- configuração ausente/secret ausente;
- Place Details FieldMask explícito;
- revalidação de identidade aceita match seguro e rejeita homônimo;
- token HMAC válido, expirado e adulterado;
- photo name não aparece no payload público;
- mídia resolve photo name novamente e limita MIME/tamanho;
- endpoint Google não cacheia;
- componente mantém lazy load, attribution e fallback;
- E2E garante precedência local → Google → fallback;
- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- `pnpm test:e2e`.

## 12. Rollback

Remover `ROUTEBOOK_PLACE_PHOTO_PROVIDER` desativa imediatamente Google Photos e devolve a cadeia visual para Wikimedia → ilustração. Não há migration nem estado persistido.

## 13. Gate de merge

Preview é o único ambiente autorizado. Merge na `main` e qualquer ativação em Production continuam decisões humanas separadas conforme AGENTS.md.
