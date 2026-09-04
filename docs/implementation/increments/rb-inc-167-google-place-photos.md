---
id: RB-INC-167
title: Google Places Photos para cobertura visual governada
description: Reintroduz Google Places Photos sobre o baseline RouteBook Anywhere, reutilizando identidade Google já validada pelo ranking e preservando attribution, no-store, fallback e gate Preview-only.
document_type: implementation-increment
owner: Place Catalog and Web Experience
status: Draft
version: "0.2.0"
created: "2026-08-28"
last_updated: "2026-09-04"
authors: [RouteBook Team]
tags: [implementation, place-catalog, media, google-places, photos, provenance, preview]
related_documents: [RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-141, RB-INC-162, RB-INC-168, RB-INC-172, RB-INC-179, RB-CTX-167]
prerequisites: [RB-INC-141, RB-INC-162, RB-INC-168, RB-INC-172, RB-INC-179]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-167 — Google Places Photos para cobertura visual governada

## 1. Contexto

Issue: `#382`.

Branch atual: `codex/rb-inc-167-google-place-photos-refresh`.

Base canônica: `main` em `604433b7eb403f577b7ca142eed12f28607d731b`, após conclusão do M9 / RouteBook Anywhere.

A implementação original vive na PR `#410`, criada antes da sequência RB-INC-173 → RB-INC-179. Como essa branch ficou estruturalmente desatualizada e deixou de ser mergeável, este refresh reconstrói somente a capacidade de mídia sobre a `main` atual, sem trazer de volta assumptions regionais removidas pelo M9.

O gate humano para uso **Preview-only** de Google Places já foi concedido em `01/09/2026`. Production, aceitação material do RB-ADR-012 e ativação pública continuam gates separados.

## 2. Problema

Wikimedia Commons permanece adequada como fonte aberta para praias, natureza e landmarks quando existe correspondência `secure`, mas não oferece cobertura consistente para restaurantes, bares, casas noturnas e muitos estabelecimentos urbanos.

A Discovery já possui identidade Google segura quando o Provider de qualidade está configurado. O incremento reutiliza esse `externalId` como evidência para tentar uma fotografia real, sem fazer matching textual frouxo e sem persistir recurso de foto.

## 3. Prioridade visual

```text
Place.primaryImage curada
→ Google Place Photo com Google Place ID já reconciliado
→ Wikimedia Commons secure quando o fallback governado suporta o destino
→ ilustração de categoria
```

Imagem externa nunca substitui `Place.primaryImage` curada.

## 4. Contrato Google

Para cada card elegível:

1. a Discovery recebe `PlaceQualitySignals.externalId` somente quando o matching do Provider de qualidade foi conservador;
2. o servidor consulta Place Details (New) por Place ID com FieldMask explícito `id,displayName,location,photos`;
3. nome e coordenadas são revalidados novamente antes de liberar a mídia;
4. o JSON público recebe somente metadata necessária, attribution, link Google Maps e token efêmero;
5. `photo name` não sai do servidor e não é persistido/cacheado;
6. ao receber o token, a rota de mídia consulta `photos` novamente para resolver o resource name atual;
7. Place Photos é chamado server-side e retorna somente MIME de imagem permitido e tamanho limitado.

## 5. Attribution e cache

- quando `authorAttributions` existir, o nome é exibido junto à foto;
- o URI do autor é linkado quando fornecido e válido;
- a superfície exibe `Google Maps` e oferece link para o conteúdo correspondente quando `googleMapsUri` estiver disponível;
- metadata Google usa `private, no-store`;
- mídia Google usa `private, no-store`;
- Wikimedia mantém a política de cache CDN já aprovada no RB-INC-162;
- nenhum token, secret ou resource name é persistido no domínio.

## 6. Lazy loading e budget

- resolução de imagem começa somente quando o card se aproxima do viewport;
- o budget do `Place Bootstrap` limita quantos cards tentam mídia externa;
- apenas uma fotografia é solicitada por card;
- falha, timeout, quota ou mismatch degradam para Wikimedia segura quando aplicável ou para ilustração de categoria;
- o Provider de mídia nunca bloqueia Discovery, Salvos, Roteiro ou Guia.

## 7. Configuração

Nova variável de seleção:

```text
ROUTEBOOK_PLACE_PHOTO_PROVIDER=google
```

Credencial reutilizada:

```text
GOOGLE_PLACES_API_KEY
```

Regras:

- Provider não é ativado implicitamente;
- variável ausente = nenhuma chamada Google Photos;
- chave permanece server-side;
- `VERCEL_ENV=production` bloqueia explicitamente o adapter nesta fase;
- nenhuma variável Production é alterada por este incremento.

## 8. Compliance

A documentação atual da Google Maps Platform exige attribution apropriada e políticas públicas de uso/privacidade para aplicações que usam Places content.

O repositório já possui arquitetura de segurança/privacidade, mas não foi encontrada uma superfície pública de **Termos de Uso + Política de Privacidade** da aplicação.

Isso fica registrado como gate obrigatório antes de qualquer ativação pública/Production de Google Places Photos. Não é contornado por este incremento e não bloqueia o Preview técnico autorizado.

## 9. Escopo

- adapter Google Places Photos server-side;
- token HMAC efêmero para mídia;
- proxy interno `no-store`;
- metadata endpoint Google-first com fallback Wikimedia seguro;
- integração no componente lazy de imagem externa;
- integração na Discovery destination-agnostic atual;
- testes unitários e de rota;
- documentação, rastreabilidade, CI e Preview.

O refresh foi normalizado pelo Prettier canônico do monorepo antes da rodada final de validação, sem alteração semântica adicional.

## 10. Fora de escopo

- aceitar ou alterar RB-ADR-012;
- Production;
- criar ou ampliar billing;
- criar nova API key;
- persistir `photo name` ou mídia Google;
- copiar reviews;
- scraping;
- tornar Google fonte canônica de Place;
- remover Wikimedia;
- substituir imagem curada;
- criar Termos/Política sem decisão jurídica/produto.

## 11. Caminhos autorizados

```text
apps/web/README.md
apps/web/app/api/place-image-preview/google/route.ts
apps/web/app/api/place-image-preview/google/route.test.ts
apps/web/app/api/place-image-preview/route.ts
apps/web/app/api/place-image-preview/route.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/components/external-place-image-preview.tsx
apps/web/components/external-place-image-preview.test.tsx
apps/web/lib/google-place-photo.ts
apps/web/lib/google-place-photo.test.ts
turbo.json
docs/implementation/increments/rb-inc-167-google-place-photos.md
docs/implementation/context-packs/rb-inc-167-google-place-photos.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 12. Critérios de aceite

- [ ] `Place.primaryImage` continua primeira prioridade;
- [ ] Google Photo só é tentada com identidade Google previamente reconciliada;
- [ ] Place Details revalida ID, nome e proximidade antes da mídia;
- [ ] API key nunca chega ao browser;
- [ ] `photo name` não aparece no JSON público e é re-resolvido antes da mídia;
- [ ] metadata e mídia Google usam `no-store`;
- [ ] `authorAttributions` são exibidos quando fornecidos;
- [ ] link para Google Maps fica disponível quando fornecido pelo Provider;
- [ ] mismatch não exibe fotografia possivelmente errada;
- [ ] 429/5xx/timeout usam retry limitado e depois degradam com segurança;
- [ ] ausência de Google preserva Wikimedia/ilustração sem quebrar Discovery;
- [ ] fluxo funciona fora de Pipa quando existe Google Place ID seguro;
- [ ] nenhum hardcode regional volta a ser requisito da Discovery;
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] Vercel Preview fica READY no mesmo SHA;
- [ ] cobertura live é medida no Preview antes do gate de merge;
- [ ] Production permanece bloqueada.

## 13. Gate humano restante

Antes de integração na `main`:

1. Preview live precisa provar correspondência visual segura e melhora material de cobertura;
2. CI e Preview precisam estar verdes no mesmo SHA;
3. o merge continua decisão humana explícita.

Antes de Production, além de novo gate humano, devem existir as superfícies públicas de termos/privacidade exigíveis e uma revisão atual dos termos, billing, quotas e attribution.

## 14. Rollback

Desabilitar `ROUTEBOOK_PLACE_PHOTO_PROVIDER` remove as chamadas Google e devolve imediatamente o fluxo aos fallbacks existentes. Não há migration, schema novo ou persistência de conteúdo Google.
