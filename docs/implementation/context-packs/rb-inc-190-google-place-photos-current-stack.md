---
id: RB-CTX-190
title: Context Pack do RB-INC-190 — Google Places Photos destination-agnostic
description: Delimita a correção do viés regional no Google Quality Provider e o uso governado de Google Places Photos em Preview sobre o baseline RB-INC-188.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-08"
last_updated: "2026-09-08"
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
- Production continua proibida sem novo gate.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `apps/web/AGENTS.md`;
3. `apps/web/e2e/AGENTS.md`;
4. `docs/AGENTS.md`;
5. `docs/implementation/AGENTS.md`;
6. `docs/core/routebook-bible.md`;
7. `docs/README.md`;
8. `docs/domain/domain-model.md`;
9. `docs/domain/ubiquitous-language.md`;
10. `docs/architecture/integrations-and-ports.md`;
11. `docs/architecture/adrs/rb-adr-012-google-maps-platform-as-initial-geospatial-provider.md`;
12. RB-INC-168;
13. RB-INC-172;
14. RB-INC-177;
15. RB-INC-188;
16. RB-INC-190.

## 4. Contratos preservados

- Place Catalog continua owner do Place canônico;
- `Place.primaryImage` curada vence qualquer mídia externa;
- Overture continua fonte de Discovery;
- Google Quality continua fonte temporária de sinais, não de Place canônico;
- Google Place ID usado para foto deve vir do matching conservador do Quality Provider;
- a rota de foto revalida identidade novamente;
- ausência ou dúvida resulta em ausência, nunca em foto aproximada;
- Wikimedia do RB-INC-188 continua fallback aberto destination-agnostic;
- `Sem foto` compacto continua fallback final;
- mídia não altera ranking, Saved Place, Activity ou Recommendation;
- nenhuma key ou photo resource name vai ao browser;
- nenhum conteúdo Google é persistido no domínio.

## 5. Correção global do Quality Provider

A requisição Google Text Search deve usar o `locationBias` calculado pelos targets e não pode fixar `regionCode: "BR"`.

Teste obrigatório deve cobrir um target fora do Brasil e verificar que:

- as coordenadas reais continuam no `locationBias`;
- `regionCode` não é enviado como hardcode;
- match conservador continua necessário.

## 6. Fluxo autorizado de mídia

```text
Discovery item
  -> PlaceQualitySignals(provider=google-places, externalId)
  -> Google Place Details por ID
  -> revalidação de ID + nome + proximidade
  -> primeira foto válida
  -> metadata pública + attribution + token efêmero
  -> rota interna de mídia
  -> Google Place Details (photos novamente)
  -> Google Place Photo bytes
```

Se qualquer etapa falhar:

```text
Google miss/failure
  -> Wikimedia secure destination-agnostic
  -> fallback compacto “Sem foto”
```

## 7. Segurança e cache

- metadata Google: `private, no-store`;
- mídia Google: `private, no-store`;
- token HMAC com TTL curto;
- resource name é resolvido novamente antes da mídia;
- MIME permitido: JPEG/PNG/WebP;
- limite de bytes explícito;
- timeout limitado;
- retries reutilizam a política do Place Bootstrap;
- logs não contêm key, token completo ou photo resource name.

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
- `previewBudget` existente limita quantos cards tentam mídia externa;
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

Arquivo adicional indispensável deve ser registrado aqui e no Increment antes da alteração.

## 11. Validação obrigatória

- teste do Quality Provider fora do Brasil;
- testes de configuração Preview/Production do Google Photo Provider;
- testes de revalidação de identidade;
- testes do token efêmero;
- testes da rota metadata Google-first + Wikimedia fallback;
- testes da rota de bytes;
- testes do componente para Google attribution e fallback compacto;
- E2E de mídia e multi-destino;
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
- não criar nova API key ou billing;
- não aceitar/alterar RB-ADR-012 nesta branch;
- não usar matching textual frouxo só para foto;
- não persistir Google photo/resource name;
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
- quantidade/amostra de cards Google com match seguro;
- fallbacks observados;
- risco de compliance ainda aberto para Production;
- decisão humana exigida para aceite visual e merge.
