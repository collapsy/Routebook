---
id: RB-INC-192
title: Cobertura lazy de Google Photos para Places externos
description: Estende a cobertura visual de Places externos fora do lote inicial de Quality por meio de reconciliação Google just-in-time acionada somente quando o card entra no viewport.
document_type: implementation-increment
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-09"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, places, images, google-places, photos, quality, lazy, preview, destination-agnostic]
related_documents: [RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-168, RB-INC-172, RB-INC-177, RB-INC-188, RB-INC-189, RB-INC-190, RB-CTX-192]
prerequisites: [RB-INC-189, RB-INC-190]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-192 — Cobertura lazy de Google Photos para Places externos

## 1. Resultado vertical

A tela **Explorar Lugares** deve manter o bootstrap inicial de Quality limitado, mas um Place externo fora desse lote não pode ficar permanentemente impedido de usar Google Places Photos apenas porque apareceu depois dos primeiros 12 alvos.

Quando o card entra na janela lazy já governada por `IntersectionObserver`, o endpoint de mídia pode executar uma reconciliação Google Quality just-in-time para **aquele único Place**, caso ainda não exista Google Place ID previamente reconciliado. Somente após um match conservador o Google Place ID efêmero pode alimentar o adapter Google Place Photo existente.

A ordem permanece:

```text
Place.primaryImage curada
→ Google Place Photo com identidade Google reconciliada
→ Wikimedia Commons com match seguro
→ fallback compacto “Sem foto”
```

A diferença para o RB-INC-190 é apenas o momento da reconciliação: o ID pode vir do bootstrap inicial ou de Quality just-in-time no pedido lazy do card. Não existe lookup de foto por texto sem Quality.

## 2. Issue, branch e base

- Issue: `#456`.
- Branch: `codex/rb-inc-192-lazy-google-photo-coverage`.
- Base empilhada: RB-INC-189 / PR `#453` @ `cbbb9f8aaf958c9912ceccb6cb9bb824fbe797bb`.
- RB-INC-190 continua owner do adapter Google Photo, token, attribution e fallback.
- Production permanece bloqueada; validação é Preview-only.

## 3. Evidência do problema

No Preview de Panajachel usado no aceite mobile:

```text
candidateCount: 127
qualityMatchCount: 12
mediaPreviewBudget: 12
mediaPreviewEligibleCount: 12
```

O Google Photos respondeu `200` para cards com Google Place ID governado, confirmando configuração e credencial funcionais. O card `Punto Cero Guatemala`, fora do lote enriquecido, caiu em `SEM FOTO`.

A primeira implementação lazy foi validada novamente em 2026-09-11. Os logs confirmaram que a reconciliação just-in-time era realmente executada, porém parte dos cards ainda terminava em `matched: false` porque o target lazy não recebia o contexto textual do Destination usado pelo targeted fallback do Quality Provider. Assim, o lookup nominal perdia precisão justamente nos casos fora da busca ampla por categoria.

A causa permanece de cobertura/recuperação de identidade, não de configuração: `PLACE_DISCOVERY_QUALITY_LIMIT = 12` protege custo/latência do bootstrap e deve ser preservado. O matching conservador também não deve ser afrouxado apenas para obter uma fotografia.

## 4. Reconciliação just-in-time autorizada

Quando `/api/place-image-preview` recebe um Place válido com `category`, mas **sem** `googlePlaceId`:

1. o request já deve ter sido disparado pelo comportamento lazy do card;
2. o servidor resolve o Quality Provider configurado;
3. somente se o Provider for Google, executa `findSignals` para um único `PlaceQualityTarget` derivado de nome, categoria e coordenadas do card;
4. quando o request possui contexto de Destination validado, esse contexto é reutilizado como `addressLabel` do target, permitindo que o targeted fallback existente consulte `nome + Destination` sem criar nova heurística de identidade;
5. o adapter existente aplica Text Search com location bias e matching conservador, incluindo targeted fallback já governado;
6. somente um `PlaceQualitySignals(provider=google-places, externalId)` resultante pode liberar o Google Place Photo;
7. o adapter de foto continua revalidando ID, nome e proximidade via Place Details;
8. miss/mismatch/failure segue para Wikimedia e depois `Sem foto`.

O match just-in-time é efêmero e exclusivo da mídia. Não é persistido nem retroalimentado no ranking. O Destination melhora a recuperação textual, mas nunca substitui a prova de identidade nem autoriza associação por similaridade fraca.

## 5. Budget, performance e cache

- `PLACE_DISCOVERY_QUALITY_LIMIT = 12` não é aumentado por este incremento;
- o bootstrap server-side inicial continua limitado;
- reconciliação extra ocorre apenas para cards que entram na margem lazy do viewport;
- uma requisição de card reconcilia no máximo um target;
- chamadas repetidas do mesmo ciclo de renderização continuam evitadas pelo estado do componente;
- timeouts/retries reutilizam `runPlaceBootstrapStep` e a política existente;
- nenhum prefetch global de todos os 127 candidatos é permitido;
- respostas que passaram pelo caminho Google lazy não podem transformar um miss temporário em `404` público de longa duração;
- Wikimedia obtida depois de uma tentativa Google lazy usa cache privado `no-store`, enquanto o caminho Wikimedia puro preserva o cache público existente.

## 6. Segurança e identidade

- nenhum Google Place ID é aceito a partir de texto sem o Quality Provider;
- `isConservativeQualityIdentityMatch` e o targeted fallback existente continuam gate de identidade;
- o contexto de Destination apenas torna a consulta nominal mais específica; os thresholds de identidade não são relaxados;
- o Google Photo adapter executa a segunda revalidação por Place Details;
- API key, token completo e photo resource name permanecem server-side;
- metadata Google e bytes continuam `private, no-store`;
- nenhum ID ou foto Google é persistido em Place/Saved Place/Recommendation/Activity.

## 7. Ranking e domínio

A reconciliação lazy:

- não altera score;
- não altera ordem dos cards;
- não altera `PlaceQualitySignals` usados pelo ranking já calculado;
- não publica Place canônico;
- não cria Saved Place;
- não cria Recommendation;
- não cria Activity;
- não interfere no RB-INC-191 de propostas de Roteiro.

É uma operação efêmera de cobertura de mídia.

## 8. UX e fallback

- o card continua iniciando resolução próximo ao viewport;
- estado temporário continua compacto (`Carregando foto…`), sem hero genérico;
- match Google seguro mostra foto + attribution;
- miss Google tenta Wikimedia destination-agnostic;
- ausência segura termina em `Sem foto`;
- a aplicação não promete foto para todos os Places;
- um Place ambíguo continua corretamente sem foto se nenhum Provider produzir identidade segura.

## 9. Caminhos autorizados

```text
apps/web/app/api/place-image-preview/route.ts
apps/web/app/api/place-image-preview/route.test.ts
apps/web/components/external-place-image-preview.tsx
apps/web/components/external-place-image-preview.test.tsx
apps/web/e2e/external-place-images.spec.ts
apps/web/e2e/multi-destination-validation.spec.ts
docs/implementation/increments/rb-inc-192-lazy-google-photo-coverage.md
docs/implementation/context-packs/rb-inc-192-lazy-google-photo-coverage.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Alteração em outro arquivo exige primeiro atualização deste Increment e do Context Pack.

## 10. Critérios de aceite

- [ ] o limite inicial de Quality continua 12;
- [ ] card sem Google Place ID pré-calculado pode tentar Google Quality somente após o request lazy de mídia;
- [ ] reconciliação just-in-time processa um único target;
- [ ] Destination validado é repassado como contexto do target lazy para o targeted fallback nominal;
- [ ] somente match `google-places` seguro alimenta Google Place Photo;
- [ ] Google Photo continua revalidando identidade via Place Details;
- [ ] mismatch/Provider ausente/falha degrada para Wikimedia/`Sem foto`;
- [ ] miss do caminho Google lazy não recebe cache público de longa duração;
- [ ] ranking e persistência não mudam;
- [ ] `Punto Cero Guatemala` é validado live no Preview, sem forçar associação se a identidade real permanecer ambígua;
- [ ] ao menos um segundo destino não-Pipa é validado;
- [ ] testes provam que o componente não chama mídia antes do IntersectionObserver;
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] Vercel Preview fica READY no mesmo SHA;
- [ ] Production permanece bloqueada.

## 11. Fora de escopo

- aumentar o bootstrap para todos os candidatos;
- persistir Quality lazy;
- alterar ranking;
- alterar Discovery;
- relaxar matching conservador para forçar fotografia;
- hardcode de alias específico de estabelecimento;
- modificar proposta de Roteiro;
- scraping;
- nova API key/billing;
- Production;
- garantir foto para todo estabelecimento.

## 12. Gate humano

Depois de CI e Preview same-SHA, o aceite visual mobile deve confirmar que a cobertura materialmente melhorou e que as imagens exibidas correspondem aos estabelecimentos. Merge continua dependente desse gate.
