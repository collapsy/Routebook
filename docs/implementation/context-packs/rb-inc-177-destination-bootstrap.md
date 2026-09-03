---
id: RB-CTX-177
title: Context Pack do RB-INC-177 — Destination Bootstrap
description: Delimita bootstrap progressivo, partial success, retries, kill switches, budgets e observabilidade sem adotar Inngest.
document_type: implementation-context-pack
owner: Traveler Experience and Platform
status: Draft
version: "0.1.0"
created: "2026-09-02"
last_updated: "2026-09-02"
authors: [RouteBook Team]
tags: [implementation, context-pack, bootstrap, resilience, observability]
related_documents: [RB-INC-177, RB-CORE-0004, RB-ARC-001, RB-ADR-013, RB-ADR-015, RB-OBS-001, RB-INC-162, RB-INC-168, RB-INC-175, RB-INC-176]
prerequisites: [RB-INC-175, RB-INC-176]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-177 — Destination Bootstrap

## Missão

Transformar a montagem do guia em processo progressivo e degradável, sem bloquear Lugares seguros por enriquecimentos opcionais.

## Restrições

- RB-ADR-015 permanece Proposed: não usar Inngest;
- não persistir estado derivável;
- retries somente em leitura e falha transitória;
- máximo 3 tentativas configuráveis;
- sem secret/PII/coordenadas em telemetria;
- falha de Quality/Media não remove Discovery;
- kill switch não é erro;
- nenhum preço externo vira regra canônica;
- Production permanece gate humano.

## Contratos reutilizados

- `PlaceSearchPort`;
- `PlaceQualitySignalsPort`;
- `PlaceImagePort`;
- Region do RB-INC-175;
- Identity do RB-INC-176;
- ranking/fallback existentes;
- mídia lazy existente;
- RB-OBS-001.

## Testes mínimos

- defaults e clamps da policy;
- kill switches;
- retry transitório;
- erro permanente sem retry;
- Quality preserva causas agrupadas para classificar retry sem repetir erro permanente;
- operação read-only retorna partial failure sem lançar;
- loading usa preparando/descobrindo;
- Quality desabilitada preserva lista;
- Media desabilitada usa fallback sem request;
- Preview Wikimedia retry limitado;
- Pipa mantém imagens quando habilitadas;
- Florianópolis mantém candidatos sem depender de Media;
- E2E mantém lista utilizável com enriquecimento opcional ausente.

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

CI é a evidência canônica. Merge, RB-ADR-015, serviço pago e Production permanecem gates humanos.
