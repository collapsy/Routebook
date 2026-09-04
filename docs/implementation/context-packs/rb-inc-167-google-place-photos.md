---
id: RB-CTX-167
title: Context Pack do RB-INC-167 — Google Places Photos governadas
description: Delimita o refresh de Google Places Photos sobre RouteBook Anywhere, com identidade revalidada, no-store, attribution, fallback e ativação Preview-only.
document_type: implementation-context-pack
owner: Place Catalog and Web Experience
status: Draft
version: "0.2.0"
created: "2026-08-28"
last_updated: "2026-09-04"
authors: [RouteBook Team]
tags: [implementation, context-pack, media, google-places, photos, provenance]
related_documents: [RB-INC-167, RB-CORE-0004, RB-ARC-003, RB-ADR-012, RB-INC-141, RB-INC-162, RB-INC-168, RB-INC-172, RB-INC-179]
prerequisites: [RB-INC-141, RB-INC-162, RB-INC-168, RB-INC-172, RB-INC-179]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-167 — Google Places Photos governadas

## 1. Missão

Aumentar cobertura visual real dos cards sem desfazer a generalização do RouteBook Anywhere, sem promover Google a fonte canônica e sem expor conteúdo externo sem identidade/proveniência suficiente.

## 2. Unidade de trabalho

- issue: `#382`;
- branch: `codex/rb-inc-167-google-place-photos-refresh`;
- base: `main@604433b7eb403f577b7ca142eed12f28607d731b`;
- PR antiga `#410` é implementação histórica a ser substituída pelo refresh;
- autorização humana existente: Google Places Photos **Preview-only**, concedida em `01/09/2026`;
- Production continua proibida sem novo gate.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/architecture/architecture-overview.md`;
5. `docs/architecture/integrations-and-ports.md`;
6. `docs/architecture/adrs/rb-adr-012-google-maps-platform-as-initial-geospatial-provider.md`;
7. RB-INC-141;
8. RB-INC-162;
9. RB-INC-168;
10. RB-INC-172;
11. RB-INC-179;
12. RB-INC-167.

## 4. Contratos preservados

- Place Catalog continua owner do Place canônico;
- `Place.primaryImage` curada vence qualquer mídia externa;
- Overture continua fonte de descoberta, não de reputação/foto;
- Google externalId usado para foto deve vir do matching conservador do Quality Provider;
- a rota de foto revalida identidade novamente;
- ausência ou dúvida resulta em ausência, nunca em foto aproximada;
- Wikimedia permanece fallback aberto quando a política atual do adapter suporta o destino;
- ilustração de categoria continua fallback final explícito;
- leitura de mídia não altera Place, Saved Place ou Activity;
- nenhuma key vai ao browser;
- nenhum `photo name` é persistido.

## 5. Fluxo autorizado

```text
Discovery item
  -> PlaceQualitySignals.google externalId
  -> Google Place Details (ID + nome + localização + photos)
  -> matching conservador novamente
  -> metadata pública + attribution + token efêmero
  -> rota interna de mídia
  -> Google Place Details (photos novamente)
  -> Place Photos
```

Se qualquer etapa falhar:

```text
Google miss/failure
  -> Wikimedia secure quando suportada
  -> ilustração de categoria
```

## 6. Cache e segurança

- metadata Google: `private, no-store`;
- mídia Google: `private, no-store`;
- resource name de foto é sempre resolvido novamente no request de mídia;
- token HMAC tem validade curta e carrega somente Place ID + índice + expiração;
- media endpoint valida MIME e limite de bytes;
- timeout é limitado;
- retries reutilizam a política de `Place Bootstrap`;
- logs não podem conter key, token completo ou photo resource name.

## 7. Attribution

Quando o Provider devolver attribution:

- mostrar `Google Maps` junto à mídia;
- mostrar nome de cada autor disponível;
- linkar o URI do autor quando válido;
- oferecer link para o conteúdo correspondente no Google Maps quando fornecido;
- não ocultar attribution por compactação visual.

## 8. UX e budget

- lazy loading inicia próximo ao viewport;
- uma foto por card;
- `previewBudget` do bootstrap continua limitando tentativas;
- cards sem fonte governada não fazem request;
- falha de imagem volta ao fallback sem layout quebrado;
- catálogo, mapa, salvar e roteiro não dependem da foto para funcionar.

## 9. Caminhos permitidos

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

## 10. Validação obrigatória

- testes do adapter Google;
- testes do metadata endpoint;
- testes da rota de mídia;
- testes do componente lazy e attribution;
- regressões Wikimedia e fallback;
- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- testes de domínio/componentes;
- build;
- Playwright do Engineering Validation;
- Documentation + Engineering verdes no mesmo SHA;
- Vercel Preview READY;
- amostra live de cobertura e correspondência visual antes do merge.

## 11. Proibições

- não aceitar/mudar RB-ADR-012 nesta branch;
- não ativar Production;
- não criar billing ou nova credencial;
- não expor API key;
- não persistir resource name/foto Google;
- não fazer proxy genérico de URL arbitrária;
- não usar texto sozinho para identidade;
- não remover attribution;
- não substituir foto curada;
- não inventar mídia no fallback;
- não restaurar hardcode Pipa como requisito estrutural da Discovery.

## 12. Gate de compliance

Antes de ativação pública/Production, verificar novamente os termos atuais da Google Maps Platform e publicar as superfícies de Termos de Uso/Política de Privacidade aplicáveis. Esse gate não é resolvido automaticamente por código nesta branch.

## 13. Handoff

Relatar:

- branch e SHA final;
- arquivos alterados;
- testes reais;
- estado de CI/Preview;
- quantidade/amostra de cards Google com correspondência segura;
- fallbacks observados;
- custos/chamadas medidos quando disponíveis;
- risco de compliance ainda aberto para Production;
- decisão humana exigida para merge e qualquer ativação além de Preview.