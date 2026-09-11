---
id: RB-CTX-192
title: Context Pack do RB-INC-192 — Cobertura lazy de Google Photos
description: Delimita a reconciliação Google Quality just-in-time para Places externos fora do lote inicial, mantendo bootstrap limitado, matching conservador e Google Photos Preview-only.
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

Remover a lacuna entre o bootstrap inicial limitado de Quality e a cobertura visual dos demais Places externos, sem transformar o catálogo em um batch caro nem afrouxar identidade.

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

Preview Panajachel:

```text
candidateCount: 127
qualityMatchCount: 12
mediaPreviewBudget: 12
mediaPreviewEligibleCount: 12
```

No mesmo deployment existem respostas Google metadata/media `200`, portanto Provider, chave, token e proxy de bytes estão operacionais. O problema inicial era que cards fora dos 12 targets de Quality não possuíam Google Place ID governado.

A validação do primeiro Preview RB-INC-192 em 2026-09-11 confirmou um segundo detalhe: a Quality lazy era executada, porém targets sem match na busca ampla entravam no targeted fallback sem o contexto textual do Destination. O fluxo deve reutilizar o Destination já validado como `addressLabel` do target para tornar a busca nominal mais específica, sem alterar a política conservadora de identidade.

## 5. Contratos preservados

- Overture continua Discovery;
- Place Catalog continua autoridade canônica;
- Quality continua enriquecimento temporário;
- `PLACE_DISCOVERY_QUALITY_LIMIT = 12` continua protegendo bootstrap;
- Google Place Photo só recebe Google Place ID após reconciliação Quality;
- Google Photo adapter continua revalidando identidade;
- `Place.primaryImage` curada continua prioridade;
- Wikimedia continua fallback destination-agnostic;
- `Sem foto` compacto continua fallback final;
- foto não altera ranking nem persistência;
- nenhum threshold de matching é relaxado para aumentar cobertura visual.

## 6. Extensão explícita ao RB-INC-190

O RB-INC-190 exigia Google Place ID previamente reconciliado antes do pedido de foto. Este incremento permite que essa reconciliação aconteça **just-in-time dentro do request lazy de metadata**, desde que:

- não exista `googlePlaceId` fornecido pelo ranking inicial;
- `category`, nome e coordenadas sejam válidos;
- o Quality Provider configurado seja Google;
- `findSignals` seja chamado para um único target;
- quando houver Destination textual validado, ele seja repassado como `addressLabel` do target para o targeted fallback nominal existente;
- o resultado seja `provider=google-places`;
- o adapter Google Photo faça a revalidação já existente antes de retornar metadata.

Isso não autoriza lookup direto de Google Photo por nome. A busca textual continua exclusivamente dentro do Quality Provider e sujeita à identidade conservadora. `addressLabel` melhora a consulta; não transforma texto em prova de identidade.

## 7. Fluxo autorizado

```text
card entra na margem do viewport
  -> ExternalPlaceImagePreview solicita /api/place-image-preview
  -> existe googlePlaceId inicial?
       sim -> Google Photo adapter
       não -> Google Quality just-in-time (1 target + Destination como contexto opcional)
               -> match google-places? -> Google Photo adapter
               -> miss/failure -> Wikimedia
  -> Google Photo miss/failure -> Wikimedia
  -> Wikimedia miss -> Sem foto
```

## 8. Falhas e cache

- falha de Quality lazy não quebra o card;
- Quality miss segue para Wikimedia;
- falha transitória Google deve degradar conforme política existente;
- resposta Google Photo continua `private, no-store`;
- resposta Wikimedia obtida após tentativa Google lazy também usa cache privado `no-store`, porque a ausência/presença do match Google é dinâmica;
- miss final após tentativa Google lazy usa `no-store` e não pode congelar um `Sem foto` em cache público por horas;
- caminho Wikimedia puro, sem elegibilidade Google lazy, preserva o cache público atual;
- logs podem registrar status/attempts/duration e `matched`, mas nunca key, token completo, coordenada precisa adicional ou photo resource name.

## 9. Caminhos permitidos

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

Não alterar `place-discovery-ranking.ts` para elevar o limite. Não alterar `place-quality-provider.ts` sem antes ampliar formalmente o escopo.

## 10. Testes obrigatórios

- route: sem Google ID + category válida + busca ampla miss + targeted fallback destination-aware seguro -> Google Photo;
- route: targeted fallback recebe `nome + Destination` sem afrouxar matching;
- route: Quality Google miss -> Wikimedia com cache privado quando o caminho lazy estava elegível;
- route: miss final após Quality lazy -> `no-store`;
- route: Quality Provider não configurado/Foursquare -> Wikimedia;
- route: Quality failure -> fallback sem vazar segredo;
- route: Google ID inicial continua tomando o caminho RB-INC-190 sem Quality lazy;
- componente: não faz request antes de entrar no viewport;
- componente: Google attribution/fallback permanecem;
- E2E: card externo fora do bootstrap consegue foto quando há identidade segura;
- `Punto Cero Guatemala` live no Preview, aceitando `Sem foto` somente se a identidade real continuar ambígua após a busca destination-aware;
- segundo Destination não-Pipa;
- Documentation e Engineering completos;
- Preview same-SHA.

## 11. Proibições

- não aumentar indiscriminadamente Quality bootstrap;
- não rodar reconciliação lazy para todos os candidatos no servidor;
- não persistir Google ID/foto;
- não alterar ranking;
- não usar texto como identidade suficiente para foto;
- não hardcodar alias `Punto Cero`/`PUNTO ROJO` ou qualquer estabelecimento específico;
- não relaxar thresholds apenas para obter fotografia;
- não criar Provider novo;
- não ativar Production;
- não misturar RB-INC-191 de Roteiro nesta branch.

## 12. Handoff

Relatar branch/SHA, arquivos, testes, CI, Preview same-SHA, logs agregados do caso `Punto Cero Guatemala`, fallback observado e gate visual restante.
