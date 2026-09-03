---
id: RB-CTX-179
title: Context Pack do RB-INC-179 — Validação multi-destino
description: Delimita a validação urbana zero-seed em São Paulo e a remoção de Pipa como pré-requisito estrutural, preservando seu catálogo curado.
document_type: implementation-context-pack
owner: Traveler Experience and Platform
status: Draft
version: "0.1.0"
created: "2026-09-03"
last_updated: "2026-09-03"
authors: [RouteBook Team]
tags: [implementation, context-pack, routebook-anywhere, multi-destination]
related_documents: [RB-INC-179, RB-CORE-0004, RB-ARC-001, RB-ADR-013, RB-ADR-015, RB-INC-175, RB-INC-176, RB-INC-177, RB-INC-178]
prerequisites: [RB-INC-175, RB-INC-176, RB-INC-177, RB-INC-178]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-179 — Validação multi-destino

## Missão

Provar RouteBook Anywhere em São Paulo sem seed ou regra regional e preservar Pipa como catálogo
curado/regressão, nunca como pré-requisito estrutural.

## Documentos obrigatórios

- RB-CORE-0004 — RouteBook Bible;
- RB-ARC-001 — arquitetura modular e Ports and Adapters;
- RB-ADR-013 — observabilidade, ainda Proposed;
- RB-ADR-015 — eventos/background processing, ainda Proposed;
- RB-INC-175 a RB-INC-178 — Region, Identity, Bootstrap e continuidade.

## Restrições

- São Paulo não recebe seed, alias, código condicional ou configuração manual;
- Pipa mantém dados, imagens, fixtures e guia editorial;
- Place continua diferente de Saved Place, Recommendation e Activity;
- conteúdo externo continua candidato até revalidação/materialização;
- nenhuma nota, foto, rota, duração ou programação pode ser inventada;
- ausência de guia editorial deve degradar para Roteiro/Salvos reais, não para 404;
- Quality/Media não invalidam Discovery;
- não ativar Provider, billing, Production, Inngest ou infraestrutura paga;
- merge na `main` permanece gate humano.

## Roteamento da implementação

- Region/proximidade: `apps/web/lib/place-discovery-region.ts`;
- catálogo curado espacial: `apps/web/lib/trip-curated-catalog.ts`;
- Discovery e bootstrap: página de Lugares e RB-INC-177;
- continuidade externa: ações de Lugares e RB-INC-178;
- idempotência concorrente da materialização externa: `packages/database/src/place-promotion-service.ts`;
- fallback de Hoje/Guia: `DestinationTripGuide`;
- experiência editorial preservada: módulos `pipa-*`;
- timezone: Destination/Trip/Itinerary persistidos.

## Testes mínimos

- São Paulo com `America/Sao_Paulo` e Hospedagem geocodificada;
- nenhum Place publicado/seed regional próximo;
- candidatos externos presentes e priorizados pela Hospedagem;
- categoria urbana visível;
- imagem externa degrada para ilustração declarada;
- candidato revalidado entra em Salvos e mapa;
- duas promoções concorrentes da mesma identidade externa convergem para um único Place;
- Saved Place entra no Roteiro;
- Hoje reflete a Activity persistida;
- Guia por dia abre sem conteúdo de Pipa;
- Pipa mantém testes existentes de Guia, rotas, imagens e Discovery;
- Itinerary restaura o timezone persistido.

## Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

CI e Preview são a evidência canônica. Falha local por ausência de `DATABASE_URL` não substitui o
gate PostgreSQL do Engineering Validation.
