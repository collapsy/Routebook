---
id: RB-INC-141
title: Imagem Principal de Places para Apoio à Decisão
description: Adiciona imagem principal opcional e governada ao Place, com asset controlado pelo RouteBook, Provenance explícita e fallback acessível nas superfícies de decisão.
document_type: implementation-increment
owner: Place Catalog and Experience
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors: [RouteBook Team]
tags: [implementation, place-catalog, image, provenance, discovery, recommendations, m8]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-DOM-001, RB-DATA-002, RB-QA-001, RB-INC-132, RB-INC-135, RB-INC-136, RB-INC-139]
prerequisites: [RB-INC-132, RB-INC-135]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-141 — Imagem Principal de Places para Apoio à Decisão

## 1. Objetivo

Permitir que um Place possua zero ou uma imagem principal opcional para apoiar reconhecimento visual em Discovery, detalhes e Recommendations, sem transformar imagem em requisito de publicação e sem introduzir scraping ou hotlink não governado em runtime.

Issue: #328.

Branch: `codex/rb-inc-141-place-primary-image`.

Relação com M8: hipótese pré-validação vinculada a #319; a implementação não comprova que imagens melhoram Decision Quality.

## 2. Autoridade canônica

Este incremento concretiza conceitos já existentes e não cria novo agregado de Domain:

- Bible: visual antes de texto quando melhora compreensão;
- Bible: incerteza não pode ser escondida por falsa precisão;
- Place já possui Details e Provenance no RB-DOM-001;
- Provenance exige origem rastreável e não permite inferir licença ou fato externo sem base;
- informação ausente continua ausente, nunca recebe imagem fictícia.

## 3. Contrato da imagem principal

`Place.primaryImage` é opcional e atômico. Quando presente, contém:

- `assetPath`: caminho interno controlado pelo RouteBook, obrigatoriamente sob `/place-images/`;
- `altText`: descrição textual não vazia da imagem;
- `sourceName`: identificação da Fonte/origem;
- `sourceUrl`: referência HTTPS opcional para auditoria da origem, nunca usada como `src` da UI;
- `license`: base declarada de uso/licença; valor desconhecido não é aceito como imagem publicável;
- `attribution`: texto opcional de crédito quando aplicável.

A UI carrega somente `assetPath`. `sourceUrl` existe para Provenance e não produz hotlink.

## 4. Política de ingestão e curadoria

- este incremento não busca imagens em runtime;
- ingestão futura deve copiar/gerar o asset autorizado para armazenamento controlado pelo RouteBook antes de associá-lo ao Place;
- nenhuma licença é inferida automaticamente;
- imagens sem base de uso declarada não entram no contrato publicado;
- atribuição, quando fornecida, deve permanecer visível na tela de detalhes;
- alteração da imagem não altera identidade do Place;
- Places existentes permanecem válidos sem imagem.

## 5. Escopo

- estender o contrato de Place com `primaryImage` opcional e validado;
- adicionar coluna JSONB nullable e migration aditiva;
- persistir e recuperar o contrato pelo `DrizzlePlaceRepository`;
- criar componente visual reutilizável com fallback semântico para ausência ou falha de carregamento;
- renderizar imagem/fallback em Discovery, detalhes e Recommendation card;
- propagar a imagem para o view model de Recommendation sem alterar ranking ou confiança;
- manter atribuição/licença separadas da imagem carregada;
- cobrir domínio, persistência, UI e E2E aplicáveis;
- atualizar Increment, Context Pack e Registry.

## 6. Fora de escopo

- galeria com múltiplas imagens;
- Provider de imagens, scraping ou busca remota em runtime;
- hotlink direto para mídia de terceiros;
- tornar imagem obrigatória para publicar Place;
- inferir licença, autoria ou atribuição;
- mudar Recommendation score, Reasons, Confidence ou ordem por causa da imagem;
- backfill obrigatório dos 30 Places de Pipa;
- declarar resultado da hipótese humana do M8;
- promoção manual de migration em Production.

## 7. Caminhos permitidos

```text
modules/place-catalog/src/place.ts
modules/place-catalog/src/place.test.ts
packages/database/src/schema.ts
packages/database/src/place-repository.ts
packages/database/src/place-repository.test.ts
packages/database/drizzle/0028_add_place_primary_image.sql
packages/database/drizzle/meta/_journal.json
apps/web/components/place-primary-image.tsx
apps/web/components/place-primary-image.module.css
apps/web/components/place-primary-image.test.tsx
apps/web/components/recommendation-card.tsx
apps/web/lib/recommendation-experience.ts
apps/web/lib/recommendation-experience.test.ts
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/place-discovery.module.css
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/e2e/place-discovery.spec.ts
apps/web/e2e/recommendations.spec.ts
docs/implementation/increments/rb-inc-141-place-primary-image.md
docs/implementation/context-packs/rb-inc-141-place-primary-image.md
docs/registry.md
```

Arquivo adicional só pode ser alterado se indispensável e deve ser registrado no Context Pack e explicado na PR.

## 8. Critérios de aceite

- [ ] Place aceita zero ou uma imagem principal sem quebrar contratos existentes;
- [ ] `assetPath` externo/absoluto é rejeitado;
- [ ] origem e licença declaradas são obrigatórias quando existe imagem;
- [ ] `sourceUrl` nunca é usado como URL de mídia;
- [ ] persistência nullable preserva Places antigos;
- [ ] Discovery, detalhes e Recommendations apresentam imagem quando válida;
- [ ] ausência e erro de carregamento possuem fallback previsível e acessível;
- [ ] detalhes apresentam atribuição/licença sem alegar mais do que a Provenance informa;
- [ ] imagem não altera Recommendation ranking, Reasons ou Confidence;
- [ ] estratégia usa asset local e carregamento responsivo/lazy quando aplicável;
- [ ] migration é append-only e aditiva;
- [ ] Documentation Validation e Engineering Validation ficam verdes no mesmo SHA.

## 9. Testes obrigatórios

- domínio: imagem válida, ausência, path externo, alt/origem/licença inválidos;
- PostgreSQL: round-trip com imagem e sem imagem;
- componente: sucesso, ausência e `onError` com fallback;
- Recommendation view model: propagação sem mudança semântica;
- E2E: Discovery/Recommendation continuam utilizáveis sem imagem e representam imagem/fallback quando aplicável;
- format, docs, lint, typecheck, release migration policy, migrations, testes, smoke, build e Playwright.

## 10. Rollback

Reverter domínio, repositório, UI e documentação. A coluna nullable pode permanecer sem alterar o significado dos registros preexistentes; remover coluna em Production é destrutivo e fica fora do rollback automático.

## 11. Riscos

- Provenance incorreta é mais grave que ausência de imagem; por isso o contrato falha fechado para licença/origem ausentes;
- assets inexistentes podem gerar erro de mídia; o componente deve degradar para fallback sem perder ações ou texto;
- o incremento habilita o contrato, mas não obriga backfill de Pipa antes de evidência humana do M8.
