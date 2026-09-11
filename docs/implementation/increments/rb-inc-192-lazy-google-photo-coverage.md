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

A tela **Explorar Lugares** deve manter o bootstrap inicial de Quality limitado, mas um Place externo fora desse lote não pode ficar permanentemente impedido de usar Google Places Photos apenas porque apareceu depois dos primeiros 12 alvos, ficou depois dos primeiros 12 cards da lista ou porque sua identidade Google segura não possui rating/popularity suficiente para produzir score.

Quando o card entra na janela lazy já governada por `IntersectionObserver`, o endpoint de mídia pode executar reconciliação Google just-in-time para **aquele único Place**, caso ainda não exista Google Place ID previamente reconciliado. Somente após um match conservador o Google Place ID efêmero pode alimentar o adapter Google Place Photo existente.

A ordem permanece:

```text
Place.primaryImage curada
→ Google Place Photo com identidade Google reconciliada
→ Wikimedia Commons com match seguro
→ fallback compacto “Sem foto”
```

A diferença para o RB-INC-190 é o momento e a finalidade da reconciliação: o ID pode vir do bootstrap inicial, de Quality just-in-time ou de uma recuperação identity-only estritamente governada para mídia. Nenhum desses caminhos persiste o ID ou fabrica score.

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

A primeira implementação lazy foi validada novamente em 2026-09-11. Os logs confirmaram que a reconciliação just-in-time era realmente executada, porém parte dos cards ainda terminava em `matched: false` porque o target lazy não recebia o contexto textual do Destination usado pelo targeted fallback do Quality Provider. Esse ponto foi corrigido passando o Destination validado como `addressLabel`.

No aceite seguinte, a tela ainda mostrou vários cards `Sem foto`. Os logs do Preview do mesmo SHA registraram 12 pedidos lazy de metadata no recorte observado: 9 produziram Google Photo com resposta `200` e 3 terminaram em `404`. Em dois dos três misses, a etapa lazy de Quality concluiu com sucesso técnico porém `matched: false`; no terceiro, Quality encontrou uma identidade Google mas o adapter de foto não liberou mídia segura.

A análise do contrato mostrou uma diferença importante entre ranking e mídia: `PlaceQualitySignals` admite `externalId` sem rating/popularity, mas o fluxo histórico de Quality foi otimizado para produzir sinais quantitativos de ranking. Um estabelecimento pode, portanto, ser identificável com segurança no Google e ainda não gerar signal útil de ranking. Ausência de reputação não deve ser confundida com ausência de identidade quando a finalidade exclusiva é buscar uma foto real.

A inspeção da projeção da própria página revelou ainda uma lacuna independente: `externalMediaItemIds` aplicava `.slice(0, bootstrapPolicy.media.previewBudget)`. Com o budget padrão 12, todo card externo a partir da posição 13 recebia `enabled=false` e era renderizado imediatamente como `Sem foto`, **sem sequer entrar no fluxo lazy**. Isso contradiz o objetivo deste incremento: o budget de bootstrap não pode virar uma lista permanente de únicos cards autorizados a tentar mídia. Na Discovery, o controle de custo passa a ser principalmente por demanda visual: somente cards que entram na margem do `IntersectionObserver` iniciam o request.

## 4. Reconciliação just-in-time autorizada

Quando `/api/place-image-preview` recebe um Place válido com `category`, mas **sem** `googlePlaceId`:

1. o request já deve ter sido disparado pelo comportamento lazy do card;
2. o servidor resolve o Quality Provider configurado;
3. somente se o Provider for Google, executa `findSignals` para um único `PlaceQualityTarget` derivado de nome, categoria e coordenadas do card;
4. quando o request possui contexto de Destination validado, esse contexto é reutilizado como `addressLabel` do target, permitindo que o targeted fallback existente consulte `nome + Destination`;
5. um `PlaceQualitySignals(provider=google-places, externalId)` resultante libera o Google Place Photo;
6. se `findSignals` não produzir Google Place ID, pode ocorrer **uma única recuperação identity-only** no mesmo request lazy: Text Search nominal com `nome + Destination` quando disponível, location bias de 2,5 km, até cinco resultados e FieldMask somente de identidade;
7. somente o primeiro resultado dessa busca pode ser usado, e apenas se passar por `isConservativeQualityIdentityMatch(..., { allowSpatialAlias: true })` com nome, coordenadas e contexto local;
8. rating/popularity não são exigidos nessa recuperação, porque ela não produz score e não entra no ranking;
9. o adapter de foto continua revalidando ID, nome e proximidade via Place Details;
10. miss/mismatch/failure segue para Wikimedia e depois `Sem foto`.

A recuperação identity-only é efêmera e exclusiva da mídia. Não é persistida, não cria `PlaceQualitySignals` canônicos e não retroalimenta o ranking. Texto melhora a recuperação do candidato, mas nunca substitui a validação de identidade.

## 5. Budget, performance e cache

- `PLACE_DISCOVERY_QUALITY_LIMIT = 12` não é aumentado por este incremento;
- o bootstrap server-side inicial de Quality continua limitado;
- `ROUTEBOOK_PLACE_MEDIA_PREVIEW_BUDGET` deixa de ser usado na Discovery como corte permanente dos únicos cards elegíveis a mídia;
- o valor continua disponível como referência de budget das superfícies que fazem preview antecipado/eager, mas a lista de Discovery usa **viewport lazy** como gate efetivo de execução;
- todos os cards externos/enriquecidos sem `primaryImage` podem ser elegíveis, porém **nenhum request é disparado antes de o card entrar na margem de 320 px do viewport**;
- rolar a lista pode produzir novos requests conforme novos cards entram nessa margem; não existe batch global dos 60/127 resultados;
- reconciliação extra ocorre apenas para cards efetivamente alcançados pelo usuário;
- uma requisição de card reconcilia no máximo um target;
- a busca identity-only ocorre somente quando `findSignals` não produziu Google Place ID;
- cada tentativa identity-only faz no máximo uma Text Search adicional, sem paginação;
- chamadas repetidas do mesmo ciclo de renderização continuam evitadas pelo estado do componente;
- timeouts/retries reutilizam `runPlaceBootstrapStep` e a política existente;
- nenhum prefetch global de todos os candidatos é permitido;
- respostas que passaram pelo caminho Google lazy não podem transformar um miss temporário em `404` público de longa duração;
- Wikimedia obtida depois de uma tentativa Google lazy usa cache privado `no-store`, enquanto o caminho Wikimedia puro preserva o cache público existente.

Essa mudança de semântica é restrita à superfície Discovery no Preview e responde diretamente ao aceite visual: preservar um limite server-side como desabilitação permanente fazia dezenas de cards parecerem sem foto sem consulta real ao Provider.

## 6. Segurança e identidade

- nenhum Google Place ID é aceito sem matching de identidade;
- `isConservativeQualityIdentityMatch` continua gate obrigatório;
- o contexto de Destination apenas torna a consulta nominal mais específica;
- a recuperação identity-only considera apenas o primeiro resultado do Text Search e ainda exige matching conservador;
- ausência de rating/popularity não é tratada como evidência positiva nem negativa de identidade;
- o Google Photo adapter executa a segunda revalidação por Place Details;
- API key, token completo e photo resource name permanecem server-side;
- metadata Google e bytes continuam `private, no-store`;
- nenhum ID ou foto Google é persistido em Place/Saved Place/Recommendation/Activity.

## 7. Ranking e domínio

A reconciliação lazy e a recuperação identity-only:

- não alteram score;
- não alteram ordem dos cards;
- não acrescentam rating/popularity inexistentes;
- não alteram `PlaceQualitySignals` usados pelo ranking já calculado;
- não publicam Place canônico;
- não criam Saved Place;
- não criam Recommendation;
- não criam Activity;
- não interferem no RB-INC-191 de propostas de Roteiro.

São operações efêmeras de cobertura de mídia.

## 8. UX e fallback

- todo card elegível inicia resolução somente ao se aproximar do viewport;
- estado temporário continua compacto (`Carregando foto…`), sem hero genérico;
- match Google seguro mostra foto + attribution;
- miss Google tenta Wikimedia destination-agnostic;
- ausência segura termina em `Sem foto`;
- `Sem foto` não pode ser produzido apenas porque o card ficou depois da posição 12;
- a aplicação não promete foto para todos os Places;
- um Place ambíguo continua corretamente sem foto se nenhum Provider produzir identidade segura.

## 9. Caminhos autorizados

```text
apps/web/app/api/place-image-preview/route.ts
apps/web/app/api/place-image-preview/route.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
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
- [ ] Place Google seguro sem rating/popularity pode recuperar apenas sua identidade para mídia sem criar score;
- [ ] recuperação identity-only consulta no máximo uma página curta e aceita somente o primeiro candidato que passe matching conservador;
- [ ] Google Photo continua revalidando identidade via Place Details;
- [ ] card externo posterior ao antigo budget de 12 continua podendo solicitar mídia ao entrar no viewport;
- [ ] cards fora do viewport não fazem request antecipado;
- [ ] mismatch/Provider ausente/falha degrada para Wikimedia/`Sem foto`;
- [ ] miss do caminho Google lazy não recebe cache público de longa duração;
- [ ] ranking e persistência não mudam;
- [ ] `Punto Cero Guatemala` é validado live no Preview, sem hardcode específico;
- [ ] ao menos um segundo destino não-Pipa é validado;
- [ ] testes provam que o componente não chama mídia antes do IntersectionObserver;
- [ ] E2E prova que um card além da posição 12 ainda resolve foto quando rolado ao viewport;
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] Vercel Preview fica READY no mesmo SHA;
- [ ] Production permanece bloqueada.

## 11. Fora de escopo

- aumentar o bootstrap de Quality para todos os candidatos;
- prefetch de mídia de todos os resultados sem ação visual do usuário;
- persistir Quality lazy ou identidade de mídia;
- alterar ranking;
- alterar Discovery;
- relaxar matching conservador para forçar fotografia;
- aceitar um resultado textual sem validação espacial/contextual;
- hardcode de alias específico de estabelecimento;
- modificar proposta de Roteiro;
- scraping;
- nova API key/billing;
- Production;
- garantir foto para todo estabelecimento.

## 12. Gate humano

Depois de CI e Preview same-SHA, o aceite visual mobile deve confirmar que a cobertura materialmente melhorou e que as imagens exibidas correspondem aos estabelecimentos. Merge continua dependente desse gate.
