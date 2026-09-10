---
id: RB-CTX-190
title: Context Pack do RB-INC-190 — Google Places Photos destination-agnostic
description: Delimita a correção do viés regional no Google Quality Provider e o uso governado de Google Places Photos em Preview sobre o baseline RB-INC-188.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-08"
last_updated: "2026-09-10"
authors: [RouteBook Team]
tags: [implementation, context-pack, places, google-places, photos, preview, destination-agnostic]
related_documents: [RB-INC-190, RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-168, RB-INC-172, RB-INC-177, RB-INC-188]
prerequisites: [RB-INC-188]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-190 — Google Places Photos destination-agnostic

## 1. Missão

Elevar a cobertura visual real de Places comerciais sem desfazer as garantias do RouteBook Anywhere e sem transformar Google em fonte canônica de Place.

## 2. Unidade de trabalho

- issue: `#449`;
- branch: `codex/rb-inc-190-google-place-photos-current-stack`;
- base: HEAD final do RB-INC-188 / PR `#447`;
- autorização humana existente: Google Places Photos **Preview-only**;
- em 10/09/2026 foi autorizado continuar a melhoria de cobertura com enriquecimento lazy dos cards visíveis;
- Production continua proibida sem novo gate;
- nenhuma nova chave, billing ou ampliação de quota do Provider é autorizada.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. instruções `AGENTS.md` aninhadas, quando existirem;
3. `docs/core/routebook-bible.md`;
4. `docs/README.md`;
5. `docs/domain/domain-model.md`;
6. `docs/domain/ubiquitous-language.md`;
7. `docs/architecture/integrations-and-ports.md`;
8. `docs/architecture/adrs/rb-adr-012-google-maps-platform-as-initial-geospatial-provider.md`;
9. RB-INC-168;
10. RB-INC-172;
11. RB-INC-177;
12. RB-INC-188;
13. RB-INC-190.

## 4. Contratos preservados

- Place Catalog continua owner do Place canônico;
- `Place.primaryImage` curada vence qualquer mídia externa;
- Overture continua fonte de Discovery;
- Google Quality continua fonte temporária de sinais, não de Place canônico;
- Google Place ID usado para foto deve vir do matching conservador do Quality Provider, seja no bootstrap ou no lookup individual autenticado;
- a rota de foto revalida identidade novamente;
- ausência ou dúvida resulta em ausência, nunca em foto aproximada;
- Wikimedia do RB-INC-188 continua fallback aberto destination-agnostic;
- `Sem foto` compacto continua fallback final;
- mídia não altera ranking, Saved Place, Activity ou Recommendation;
- nenhuma key ou photo resource name vai ao browser;
- nenhum conteúdo Google, Google Place ID de enriquecimento ou photo resource name é persistido no domínio.

## 5. Correção global do Quality Provider

A requisição Google Text Search deve usar o `locationBias` calculado pelos targets e não pode fixar `regionCode: "BR"`.

Teste obrigatório deve cobrir um target fora do Brasil e verificar que:

- as coordenadas reais continuam no `locationBias`;
- `regionCode` não é enviado como hardcode;
- match conservador continua necessário;
- alias espacial direcionado só passa sob proximidade forte e evidência nominal mínima;
- homônimo distante continua rejeitado.

## 6. Fluxo autorizado de mídia

Caminho pré-reconciliado:

```text
Discovery item
  -> PlaceQualitySignals(provider=google-places, externalId)
  -> Google Place Details por ID
  -> revalidação de ID + nome/alias conservador + proximidade
  -> primeira foto válida
  -> metadata pública + attribution + token efêmero
  -> rota interna de mídia
  -> Google Place Details (photos novamente)
  -> Google Place Photo bytes
```

Caminho lazy quando o card não recebeu ID no bootstrap:

```text
card entra próximo ao viewport
  -> /api/place-image-preview com tripId + nome + categoria + coordenadas + endereço disponível
  -> autorização da Trip para a sessão atual
  -> Quality Provider com um único target
  -> matching conservador / alias espacial restrito
  -> PlaceQualitySignals(provider=google-places, externalId)
  -> mesmo fluxo de revalidação Google Photo acima
```

Se qualquer etapa de identidade falhar:

```text
Google miss/failure/mismatch
  -> Wikimedia secure destination-agnostic
  -> fallback compacto “Sem foto”
```

O lookup lazy não pode promover Place, salvar Google Place ID, alterar score ou mudar a ordem da lista.

## 7. Segurança e cache

- lookup Quality lazy exige `tripId` autorizado quando não existe Google Place ID pré-reconciliado;
- requisição sem autorização não pode disparar Google Quality;
- metadata Google: `private, no-store`;
- mídia Google: `private, no-store`;
- token HMAC com TTL curto;
- resource name é resolvido novamente antes da mídia;
- MIME permitido: JPEG/PNG/WebP;
- limite de bytes explícito;
- timeout limitado;
- retries reutilizam a política do Place Bootstrap;
- logs não contêm key, token completo ou photo resource name;
- nenhuma rota nova anônima de enriquecimento é criada.

## 8. Attribution

Quando o Provider devolver attribution:

- mostrar `Google Maps` junto à foto;
- mostrar nomes de autores disponíveis;
- URI do autor só pode ser HTTPS em host Google permitido;
- link do conteúdo Google Maps só pode usar host permitido;
- attribution permanece visível no estado `ready`.

## 9. UX e budget

- resolução inicia somente próxima ao viewport;
- uma foto por card;
- `previewBudget` existente continua limitando o conjunto priorizado no bootstrap inicial;
- cards posteriores não ficam permanentemente desabilitados: podem pedir Quality + Media individual quando entram próximo ao viewport;
- não existe fan-out eager para todos os candidatos do Discovery;
- `idle/loading` continua compacto, sem restaurar hero ilustrativo genérico;
- erro de imagem volta ao fallback sem quebrar layout;
- Discovery, mapa, salvar e roteiro independem da foto.

## 10. Caminhos permitidos

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

`apps/web/lib/trip-route-access.ts` é fronteira existente e pode ser importada para autorização do lookup lazy, sem alteração do arquivo.

A probe `api/internal/place-media-probe` é um instrumento de aceitação do RB-INC-190, não contrato de produto. Ela deve:

- responder apenas em Vercel Preview da branch do incremento;
- usar cenários fixos de validação, incluindo Antigua Guatemala e um segundo Destination não-Pipa;
- executar o mesmo Quality Provider configurado e a mesma revalidação Google Photo do runtime;
- retornar somente contagens/estados e nomes dos fixtures, sem API key, token completo, Google Place ID ou photo resource name;
- usar `private, no-store`;
- permanecer indisponível em Production e em outras branches.

Ela é indispensável porque a probe histórica do RB-INC-172 está hardcoded para a branch antiga e contém diagnóstico regional legado; alterá-la criaria mistura de responsabilidades.

Arquivo adicional indispensável deve ser registrado aqui e no Increment antes da alteração.

## 11. Validação obrigatória

- teste do Quality Provider fora do Brasil;
- testes de configuração Preview/Production do Google Photo Provider;
- testes de revalidação de identidade e alias espacial conservador;
- testes do token efêmero;
- testes da rota metadata Google-first + Wikimedia fallback;
- teste da rota comprovando lookup Quality individual quando não há `googlePlaceId`;
- teste da rota comprovando que ausência/falha de autorização não dispara Google Quality;
- testes da rota de bytes;
- testes da probe live, incluindo bloqueio fora do Preview/branch e ausência de identificadores sensíveis na resposta;
- testes do componente para `tripId`, endereço opcional, lazy viewport, Google attribution e fallback compacto;
- E2E de mídia com card fora do conjunto inicialmente reconciliado;
- E2E multi-destino;
- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- `pnpm test:e2e`;
- Documentation + Engineering verdes no mesmo SHA;
- Vercel Preview READY no mesmo SHA;
- amostra live de cobertura de estabelecimentos comerciais antes do merge.

## 12. Proibições

- não alterar `main` diretamente;
- não ativar Production;
- não criar nova API key, billing ou ampliar quota do Provider;
- não aceitar/alterar RB-ADR-012 nesta branch;
- não usar texto ou proximidade frouxa sozinhos para foto;
- não permitir lookup Quality lazy anônimo;
- não fazer prefetch/background crawl de todos os candidatos;
- não persistir Google photo, Google Place ID de enriquecimento ou resource name;
- não copiar reviews;
- não fazer scraping;
- não alterar ranking por disponibilidade de imagem;
- não substituir imagem curada;
- não restaurar hardcode Pipa/Brasil;
- não reintroduzir ilustração genérica hero nos Place Cards.

## 13. Handoff

Relatar:

- branch e SHA final;
- arquivos alterados;
- testes reais executados;
- estado de CI e Preview;
- `qualityMatchCount` em pelo menos um destino fora do Brasil;
- quantidade/amostra de cards Google com match seguro no bootstrap e no caminho lazy;
- fallbacks observados;
- evidência de que card fora do lote inicial pode obter foto no viewport;
- risco de compliance ainda aberto para Production;
- decisão humana exigida para aceite visual e merge.
