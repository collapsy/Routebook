---
id: RB-CTX-192
title: Context Pack do RB-INC-192 — Cobertura lazy de Google Photos
description: Delimita a reconciliação Google just-in-time para Places externos fora do lote inicial, mantendo bootstrap limitado, matching conservador e Google Photos Preview-only.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-09"
last_updated: "2026-09-11"
authors: [RouteBook Team]
tags: [implementation, context-pack, places, google-places, photos, quality, lazy, preview]
related_documents: [RB-INC-192, RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-168, RB-INC-172, RB-INC-177, RB-INC-188, RB-INC-189, RB-INC-190]
prerequisites: [RB-INC-189, RB-INC-190]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-192 — Cobertura lazy de Google Photos

## 1. Missão

Remover a lacuna entre o bootstrap inicial limitado de Quality e a cobertura visual dos demais Places externos, sem transformar o catálogo em um batch caro nem afrouxar identidade. Um limite de bootstrap não pode se transformar em desabilitação permanente de mídia para cards posteriores na lista.

## 2. Unidade de trabalho

- issue: `#456`;
- branch: `codex/rb-inc-192-lazy-google-photo-coverage`;
- base: RB-INC-189 / PR `#453` @ `cbbb9f8aaf958c9912ceccb6cb9bb824fbe797bb`;
- Google Places Photos: autorização Preview-only já existente;
- Production continua proibida.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible;
3. `docs/README.md`;
4. `docs/domain/domain-model.md`;
5. `docs/domain/ubiquitous-language.md`;
6. `docs/architecture/integrations-and-ports.md`;
7. RB-ADR-012;
8. RB-INC-168;
9. RB-INC-172;
10. RB-INC-177;
11. RB-INC-188;
12. RB-INC-189;
13. RB-INC-190;
14. RB-INC-192.

## 4. Diagnóstico canônico

Preview Panajachel inicial:

```text
candidateCount: 127
qualityMatchCount: 12
mediaPreviewBudget: 12
mediaPreviewEligibleCount: 12
```

No mesmo deployment existem respostas Google metadata/media `200`, portanto Provider, chave, token e proxy de bytes estão operacionais. O problema inicial era que cards fora dos 12 targets de Quality não possuíam Google Place ID governado.

A validação do primeiro Preview RB-INC-192 em 2026-09-11 confirmou que a Quality lazy era executada, porém targets sem match na busca ampla entravam no targeted fallback sem o contexto textual do Destination. Esse ponto foi corrigido passando o Destination validado como `addressLabel` do target.

A validação humana seguinte ainda mostrou vários cards `Sem foto`. Os logs do mesmo Preview provaram outro detalhe: em uma amostra lazy de 12 cards houve 9 respostas Google com foto e 3 misses finais. Em dois desses três misses, `findSignals` terminou `matched: false`; em um, a Quality reconciliou Google Place ID mas o adapter de foto não liberou mídia segura.

O primeiro padrão é compatível com Places que possuem identidade Google recuperável, porém sem `rating` nem `popularity`. Para mídia, ausência desses sinais não deve apagar uma identidade segura. Por isso existe fallback identity-only governado, exclusivo da mídia.

A inspeção de `apps/web/app/viagens/[tripId]/lugares/page.tsx` mostrou ainda que `externalMediaItemIds` aplicava `.slice(0, bootstrapPolicy.media.previewBudget)`. Como o default é 12, o card de posição 13 em diante recebia `enabled=false` e renderizava `Sem foto` sem consulta alguma. Esse corte é incompatível com a estratégia lazy já presente no componente: o `IntersectionObserver` é quem deve impedir requests de cards que o usuário ainda não alcançou.

Com esse corte removido, o aceite mobile seguinte confirmou melhora material: vários cards posteriores aos 12 iniciais passaram a mostrar Google Photo. Os `Sem foto` restantes já correspondem a requests reais. Em alguns, a reconciliação lazy termina `matched: false`; em outros, existe identidade Google mas o adapter de foto não libera mídia. A recuperação identity-only também tinha uma limitação de cobertura: solicitava até cinco resultados da Text Search, porém descartava toda a resposta quando o primeiro resultado era incompatível, mesmo que um candidato posterior passasse o mesmo matching conservador.

## 5. Contratos preservados

- Overture continua Discovery;
- Place Catalog continua autoridade canônica;
- Quality continua enriquecimento temporário;
- `PLACE_DISCOVERY_QUALITY_LIMIT = 12` continua protegendo bootstrap de Quality;
- Google Place Photo só recebe Google Place ID depois de reconciliação de identidade;
- Google Photo adapter continua revalidando identidade;
- `Place.primaryImage` curada continua prioridade;
- Wikimedia continua fallback destination-agnostic;
- `Sem foto` compacto continua fallback final;
- foto não altera ranking nem persistência;
- ausência de rating/popularity continua ausência de score;
- nenhum threshold de matching é relaxado para aumentar cobertura visual;
- cards fora do viewport continuam sem request de mídia.

## 6. Extensão explícita ao RB-INC-190

O RB-INC-190 exigia Google Place ID previamente reconciliado antes do pedido de foto. Este incremento permite que essa reconciliação aconteça **just-in-time dentro do request lazy de metadata**.

Fluxo principal:

- não existe `googlePlaceId` fornecido pelo ranking inicial;
- `category`, nome e coordenadas são válidos;
- o Quality Provider configurado é Google;
- `findSignals` é chamado para um único target;
- quando houver Destination textual validado, ele é repassado como `addressLabel` do target para o targeted fallback nominal existente;
- um resultado `provider=google-places` libera o adapter Google Photo.

Cobertura complementar autorizada quando `findSignals` retorna sem Google Place ID:

1. ainda dentro do mesmo request lazy e somente com Google Quality + Google Photo configurados, pode ocorrer **uma busca nominal de identidade** adicional;
2. a consulta usa `nome + Destination` quando disponível, `locationBias` nas coordenadas do card, raio de 2,5 km, até cinco resultados e FieldMask somente de identidade (`id`, `displayName`, `location`, `formattedAddress`);
3. os resultados são avaliados na ordem retornada pelo Google e somente o primeiro candidato que passe `isConservativeQualityIdentityMatch(..., { allowSpatialAlias: true })` pode ser considerado;
4. candidatos anteriores que falham nesse mesmo gate são ignorados, sem alteração dos thresholds de matching;
5. rating e popularity não são necessários nesse fallback porque ele não produz score, ranking ou Provenance de qualidade; ele recupera apenas o Google Place ID efêmero para mídia;
6. o adapter Google Photo continua fazendo a segunda revalidação por Place Details antes de liberar a fotografia.

Isso não autoriza lookup de foto por texto puro: texto e rank de busca apenas recuperam candidatos; nome, proximidade e coerência contextual continuam gates obrigatórios. O ID não é persistido e não retroalimenta ranking.

## 7. Fluxo autorizado

```text
qualquer card elegível aproxima-se do viewport
  -> IntersectionObserver libera o request daquele card
  -> ExternalPlaceImagePreview solicita /api/place-image-preview
  -> existe googlePlaceId inicial?
       sim -> Google Photo adapter
       não -> Google Quality just-in-time (1 target + Destination opcional)
               -> match google-places? -> Google Photo adapter
               -> sem signal -> busca nominal identity-only governada
                    -> avalia até cinco resultados na ordem
                    -> primeiro candidato seguro passa matching conservador? -> Google Photo adapter
                    -> nenhum candidato seguro -> Wikimedia
  -> Google Photo miss/failure -> Wikimedia
  -> Wikimedia miss -> Sem foto
```

Cards que ainda não entraram na margem do viewport não executam esse fluxo. Cards que ficaram depois da posição 12 não são mais desabilitados apenas por posição.

## 8. Falhas, budget e cache

- falha de Quality lazy não quebra o card;
- Quality miss pode tentar uma única recuperação identity-only antes de Wikimedia;
- a recuperação identity-only ocorre somente no request lazy do card e somente depois de `findSignals` não fornecer Google Place ID;
- uma tentativa identity-only faz no máximo uma Text Search adicional e nunca pagina; no máximo cinco candidatos da mesma resposta são avaliados;
- o bootstrap inicial de Quality continua limitado e não ganha batch adicional;
- `ROUTEBOOK_PLACE_MEDIA_PREVIEW_BUDGET` não é usado na Discovery como corte permanente de elegibilidade; o controle efetivo dessa superfície é o viewport lazy;
- não existe prefetch global de toda a lista: rolar a página é o que torna novos cards elegíveis a executar mídia;
- o valor de preview budget permanece disponível para outras superfícies/eager paths que o utilizem e continua exposto como referência operacional, não como autorização exclusiva dos primeiros N cards da Discovery;
- falha transitória Google deve degradar conforme política existente;
- resposta Google Photo continua `private, no-store`;
- resposta Wikimedia obtida após tentativa Google lazy também usa cache privado `no-store`;
- miss final após tentativa Google lazy usa `no-store` e não pode congelar um `Sem foto` por horas;
- caminho Wikimedia puro preserva o cache público atual;
- logs podem registrar status/attempts/duration, contagem de cards lazy elegíveis, quantidade de candidatos identity-only, posição do candidato seguro e `matched`, mas nunca key, token completo, nome do usuário, coordenada precisa adicional ou photo resource name.

## 9. Caminhos permitidos

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

Não alterar `place-discovery-ranking.ts` para elevar o limite. Alterar `place-quality-provider.ts` exige antes ampliar formalmente o escopo; o fallback identity-only desta versão permanece isolado na fronteira lazy de mídia para não mudar o contrato de ranking.

## 10. Testes obrigatórios

- route: sem Google ID + category válida + busca ampla miss + targeted fallback destination-aware seguro -> Google Photo;
- route: Place Google seguro sem rating/popularity ainda pode recuperar identidade para mídia sem criar score;
- route: primeiro candidato identity-only incompatível é ignorado e candidato posterior seguro da mesma resposta pode liberar Google Photo;
- route: nenhum candidato identity-only seguro não libera foto;
- route: targeted fallback recebe `nome + Destination` sem afrouxar matching;
- route: Quality Google miss -> Wikimedia com cache privado quando o caminho lazy estava elegível;
- route: miss final após Quality lazy -> `no-store`;
- route: Quality Provider não configurado/Foursquare -> Wikimedia;
- route: Quality failure -> fallback sem vazar segredo;
- route: Google ID inicial continua tomando o caminho RB-INC-190 sem Quality lazy;
- componente: não faz request antes de entrar no viewport;
- componente: Google attribution/fallback permanecem;
- E2E: card externo fora do bootstrap consegue foto quando há identidade segura;
- E2E: card posterior à antiga posição 12 faz request e resolve foto quando rolado ao viewport;
- `Punto Cero Guatemala` live no Preview;
- segundo Destination não-Pipa;
- Documentation e Engineering completos;
- Preview same-SHA.

## 11. Proibições

- não aumentar indiscriminadamente Quality bootstrap;
- não prefetchar mídia de todos os candidatos no servidor ou no browser;
- não persistir Google ID/foto;
- não alterar ranking;
- não tratar texto sozinho como identidade suficiente para foto;
- não aceitar candidato identity-only que não passe o matching conservador;
- não hardcodar alias `Punto Cero`/`PUNTO ROJO` ou qualquer estabelecimento específico;
- não relaxar thresholds apenas para obter fotografia;
- não criar Provider novo;
- não ativar Production;
- não misturar RB-INC-191 de Roteiro nesta branch.

## 12. Handoff

Relatar branch/SHA, arquivos, testes, CI, Preview same-SHA, proporção de metadata Google `200`/miss na amostra lazy, confirmação de request em card além da posição 12, distribuição de `candidateCount/matchedRank` identity-only, fallback observado e gate visual restante.
