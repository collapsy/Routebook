---
id: RB-CTX-153
title: Context Pack do RB-INC-153 — Guia Operacional de Pipa
description: Delimita contratos, caminhos, riscos e validações para ampliar a utilidade do guia antes da viagem sem ativar Provider pago.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-16"
last_updated: "2026-08-16"
authors: [RouteBook Team]
tags: [implementation, context-pack, pipa, guide, overture, maps, routes, images]
related_documents: [RB-INC-153, RB-CORE-0004, RB-ADR-012, RB-INC-136, RB-INC-139, RB-INC-141, RB-INC-142, RB-INC-143, RB-INC-148]
prerequisites: [RB-INC-139, RB-INC-141, RB-INC-142, RB-INC-143, RB-INC-148]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-153 — Guia Operacional de Pipa

## 1. Missão do executor

Melhorar a experiência de guia para a viagem de 22 a 29 de agosto de 2026, tornando a descoberta externa visível, o conteúdo acionável e a diferença entre estimativa geodésica e rota real inequívoca.

A implementação não pode publicar candidato por leitura, fingir que uma capa é foto, ativar Provider pago ou registrar o feedback como validação M8.

## 2. Incremento

- ID: `RB-INC-153`;
- issue: `#355`;
- branch: `codex/rb-inc-153-pipa-operational-guide`;
- baseline: `c74e82a6a8c35a8a4b2672be03e44e28eef09693`;
- relação M8: backlog pré-viagem vinculado a `#319`, sem evidência humana inferida.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/implementation/increments/rb-inc-153-pipa-operational-guide.md`;
5. `docs/implementation/increments/rb-inc-139-accommodation-proximity.md`;
6. `docs/implementation/increments/rb-inc-141-place-primary-image.md`;
7. `docs/implementation/increments/rb-inc-142-organic-place-ingestion.md`;
8. `docs/implementation/increments/rb-inc-143-place-images.md`;
9. `docs/implementation/increments/rb-inc-148-external-place-promotion.md`;
10. `docs/architecture/adrs/rb-adr-012-google-maps-platform-as-initial-geospatial-provider.md`.

## 4. Contratos preservados

- Recommendation não é Decision;
- Place externo não é Place canônico;
- promoção externa continua explícita e idempotente;
- mapa e lista do catálogo publicado usam o mesmo conjunto;
- distância geodésica é estimativa em linha reta;
- capa de categoria não é fotografia;
- falha de Provider não redefine o produto;
- M8 só recebe evidência humana real conforme RB-INC-136.

## 5. Contrato de links externos

`google-maps-links.ts` aceita somente:

- nome/endereço e coordenada para busca;
- origem, destino e modo `walking | driving` para directions.

O utilitário:

- valida finitude e limites geográficos;
- fixa `https://www.google.com`;
- fixa `api=1`;
- não recebe chave;
- não faz I/O;
- não retorna dados externos;
- não altera domínio.

## 6. Caminhos permitidos

Os caminhos permitidos são exatamente os declarados no RB-INC-153. Alteração adicional exige atualização explícita do incremento e justificativa na PR.

## 7. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @routebook/web exec vitest run lib/google-maps-links.test.ts components/place-primary-image.test.tsx
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/place-discovery-filters.spec.ts
```

A Engineering Validation e a Documentation Validation devem concluir no mesmo SHA da PR.

## 8. Proibições

- não aceitar nem editar RB-ADR-012;
- não criar secret ou API key;
- não ativar billing/Marketplace;
- não instalar SDK Google;
- não materializar resposta Google;
- não usar foto genérica como se representasse o Place;
- não publicar candidato Overture automaticamente;
- não alterar catálogo por efeito colateral da leitura;
- não concluir M8 com evidência sintética.

## 9. Handoff

Relatar:

- comportamento entregue;
- arquivos alterados;
- testes efetivamente executados;
- estado de CI;
- limitações mantidas: fotos reais continuam em seis Places e rota é consultada externamente;
- issue e PR;
- necessidade de autorização humana separada para merge e Production.

