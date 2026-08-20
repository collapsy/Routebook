---
id: RB-INC-162
title: Imagens governadas para Places externos
description: Enriquece candidatos externos da Discovery com fotografias licenciadas do Wikimedia Commons somente quando a correspondência for segura, sem persistir mídia nem promover o candidato.
document_type: implementation-increment
owner: Place Catalog and Integrations
status: Draft
version: "0.1.0"
created: "2026-08-20"
last_updated: "2026-08-20"
authors: [RouteBook Team]
tags: [implementation, place-catalog, external-places, images, wikimedia-commons, provenance, licensing, pipa, m8]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-ARC-003, RB-INC-142, RB-INC-143, RB-INC-148, RB-INC-156, RB-INC-158, RB-INC-161, RB-INC-163, RB-INC-136, RB-CTX-162]
prerequisites: [RB-INC-142, RB-INC-143, RB-INC-148, RB-INC-156]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-162 — Imagens governadas para Places externos

## 1. Contexto

Issue: `#377`.

Branch: `codex/rb-inc-162-external-place-images`.

Baseline original: `474ad3c8b23c10605f4223e32cc75fb7169bd947`.

Durante a implementação, o RB-INC-163 foi integrado na `main` em `f49813a57e03f73aba3d768da02c0d4bc3383084`. O candidato final deste incremento deve ser validado contra essa `main` atual e preservar integralmente a correção de rotas.

A Discovery unificada exibe Places publicados e candidatos Overture. Os candidatos externos possuem nome, categoria, endereço, distância, Fonte e licença, mas usam somente o fallback visual do RouteBook. A capability `PlaceImagePort` e o adapter Wikimedia Commons já existem por RB-INC-143, porém até aqui serviram ao pipeline governado de curadoria de Places publicados.

## 2. Objetivo

Dar contexto visual real também aos candidatos externos sem transformá-los em Places canônicos e sem transformar uma mídia remota em estado persistido.

Um candidato externo pode mostrar fotografia somente quando:

1. a mídia vem do Wikimedia Commons;
2. autor e licença reutilizável são auditáveis;
3. a correspondência de identidade é classificada como `secure`;
4. a mídia é entregue ao browser por uma fronteira RouteBook controlada;
5. qualquer ambiguidade, erro ou indisponibilidade mantém fallback explícito.

## 3. Decisão

O RouteBook reutiliza o adapter `WikimediaCommonsPlaceImageAdapter` para uma operação read-only `findSecurePreview`.

Fluxo:

```text
ExternalPlaceCandidate (Overture)
  -> card entra na janela de visualização
  -> GET /api/place-image-preview
  -> Wikimedia Commons Action API
  -> metadata/licença/autoria + secure|ambiguous|rejected
       -> secure: metadata de preview
       -> demais: 404/fallback
  -> GET /api/place-image-preview/file
  -> valida host/MIME/tamanho
  -> bytes licenciados via domínio RouteBook
  -> card mostra foto + atribuição + licença + fonte
```

Overture continua sendo a Fonte dos fatos do candidato. Wikimedia é uma capability de mídia separada.

## 4. Invariantes

- candidato externo continua não-canônico até promoção explícita;
- preview de imagem nunca cria Place, Saved Place, Recommendation, Decision ou Itinerary Activity;
- preview não altera `Place.primaryImage`;
- presença/ausência de imagem não altera ranking, distância, reconciliação ou elegibilidade de promoção;
- `secure` exige identidade distintiva + contexto de Pipa/Tibau do Sul na metadata da mídia;
- `ambiguous`, `rejected`, falta de autor/licença ou falha de Provider resultam em fallback;
- browser nunca recebe URL de Provenance como `src`;
- browser recebe bytes somente de um endpoint RouteBook que valida a URL Wikimedia permitida;
- nenhuma busca normal escreve banco ou filesystem.

## 5. Limites de rede e cache

Para impedir fan-out indiscriminado:

- previews só são buscados quando o card entra ou se aproxima do viewport via `IntersectionObserver`;
- metadata segura recebe cache CDN de 24h e `stale-while-revalidate` de 7 dias;
- misses recebem cache de 6h;
- thumbnail proxy recebe cache CDN de 24h e `stale-while-revalidate` de 7 dias;
- adapter consulta no máximo 8 resultados por Place;
- timeout da Action API: 6s;
- timeout de thumbnail: 10s;
- thumbnail aceita no máximo 3 MiB;
- nenhuma chamada é feita quando o Destination não é suportado.

## 6. Segurança e Provenance

Metadata aceita:

- página de Fonte exclusivamente em `https://commons.wikimedia.org`;
- mídia exclusivamente em `https://upload.wikimedia.org`;
- licenças reutilizáveis já aceitas pelo pipeline Wikimedia;
- autoria obrigatória;
- URL de licença Creative Commons quando fornecida.

O proxy de mídia aceita somente thumbnails HTTPS de `upload.wikimedia.org` sob `/wikipedia/commons/thumb/`, rejeita redirects, MIME fora da allowlist e payload acima do limite.

A UI exibe autor/atribuição, licença, `Wikimedia Commons` e link `Ver fonte`.

## 7. Escopo

- `findSecurePreview` no adapter Wikimedia existente;
- classificação de identidade reutilizada do pipeline governado;
- endpoint read-only de metadata de preview;
- endpoint proxy de bytes licenciados;
- componente client lazy para candidato externo;
- integração somente no `ExternalDiscoveryCard`;
- fallback acessível para ausência/ambiguidade/erro;
- testes unitários do adapter e endpoints;
- teste de componente para loading/ready/fallback;
- E2E determinístico da Discovery com endpoints interceptados;
- documentação, Registry e rastreabilidade.

## 8. Fora de escopo

- scraping de Google Maps, Google Images, Instagram, TripAdvisor ou sites comerciais;
- Google Places Photos API ou Provider pago;
- novo secret;
- persistir imagem externa em `Place.primaryImage`;
- materializar automaticamente asset local;
- aumentar cobertura visual dos Places publicados neste incremento;
- promover/publicar candidato por causa da foto;
- migration/schema;
- alterar Overture, reconciliação, ranking ou mapa;
- alterar rotas do RB-INC-163;
- concluir M8;
- promoção para Production sem gate humano separado.

## 9. Caminhos autorizados

```text
apps/web/lib/wikimedia-place-image.ts
apps/web/lib/wikimedia-place-image.test.ts
apps/web/app/api/place-image-preview/route.ts
apps/web/app/api/place-image-preview/route.test.ts
apps/web/app/api/place-image-preview/file/route.ts
apps/web/app/api/place-image-preview/file/route.test.ts
apps/web/components/external-place-image-preview.tsx
apps/web/components/external-place-image-preview.test.tsx
apps/web/components/place-primary-image.module.css
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/e2e/external-place-images.spec.ts
docs/implementation/increments/rb-inc-162-external-place-images.md
docs/implementation/context-packs/rb-inc-162-external-place-images.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Exceção operacional transitória, somente se necessária para alinhar a branch com a `main` e aplicar substituições determinísticas no arquivo grande de Discovery:

```text
.github/workflows/rb-inc-162-assembly-helper.yml
```

Esse helper pode apenas: fazer merge não destrutivo de `origin/main`, substituir assinaturas textuais previamente verificadas em `lugares/page.tsx`, inserir somente as linhas `RB-INC-162` e `RB-CTX-162` no Registry, formatar os arquivos alterados, remover a si próprio e criar/pushar o resultado. Ele não pode usar secrets adicionais, alterar Production, executar migration, modificar dados nem permanecer no diff final.

## 10. Critérios de aceite

- [ ] candidato externo com match `secure` pode exibir fotografia real;
- [ ] `ambiguous`, `rejected`, ausência de mídia/licença/autoria ou erro mantém fallback;
- [ ] fotografia exibe atribuição, licença e Fonte auditáveis;
- [ ] link de Provenance aponta para o Commons, mas não é usado como `src`;
- [ ] browser carrega bytes por URL RouteBook controlada;
- [ ] lookup de mídia é lazy e cacheável;
- [ ] Destination/região e inputs são validados na fronteira HTTP;
- [ ] proxy restringe host, caminho, MIME, redirect e tamanho;
- [ ] promoção de RB-INC-148 permanece inalterada;
- [ ] rotas de RB-INC-163 permanecem inalteradas;
- [ ] nenhuma migration, secret, write ou Provider pago é criado;
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] Preview Vercel do mesmo SHA fica READY antes do aceite humano.

## 11. Testes obrigatórios

- normalização de metadata, licença, autor e hosts permitidos;
- `secure | ambiguous | rejected`;
- `findSecurePreview` retorna somente match seguro e preserva Provenance;
- falha Wikimedia não produz preview falso;
- endpoint de metadata rejeita Destination/coordenadas inválidos e trata miss/erro;
- proxy rejeita URL/redirect/MIME/tamanho inválidos;
- componente não busca antes do viewport, renderiza atribuição em sucesso e fallback em erro;
- E2E intercepta metadata/bytes e comprova foto real no card externo sem alterar a fonte factual Overture;
- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- `pnpm test:e2e`.

## 12. Riscos

- metadata do Commons pode mudar: cache é temporário e nenhuma metadata vira fato canônico;
- correspondência textual ainda pode ter falso positivo: política permanece fail-closed e exige identidade + contexto local;
- latência externa pode atrasar foto: card nasce utilizável com fallback/loading e conteúdo factual não depende da mídia;
- muitas descobertas podem existir: carregamento por viewport + cache evita consulta simultânea de todos os cards;
- hotlink não é usado pelo browser; o proxy RouteBook absorve validação e cache, mas ainda depende do Commons em runtime para candidatos externos.

## 13. Rollback

Todo o incremento é reversível por código. Não existe migration nem estado persistido. Em rollback, candidatos externos voltam a usar somente o fallback visual existente.