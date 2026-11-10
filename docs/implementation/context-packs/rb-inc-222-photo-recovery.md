---
id: RB-CTX-222
title: Context Pack do RB-INC-222
description: Delimita consistência e recuperação das fotos de Lugares.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-11-09"
last_updated: "2026-11-09"
authors: [RouteBook Team]
tags: [implementation, context-pack, photos]
related_documents: [RB-INC-222, RB-INC-190, RB-INC-192, RB-ADR-012]
prerequisites: [RB-INC-221]
next_documents: []
ai_context:
  priority: high
  index: true
---

# Context Pack — RB-INC-222

Leia AGENTS.md, Bible, docs/README.md e RB-INC-222. Referências: RB-INC-190 e RB-INC-192 e seus Context Packs; RB-ADR-012 (status Proposed, fronteiras e atribuição); `docs/ux/interaction-specifications.md` (conteúdo parcial e falha externa). A autorização histórica de Google Photos é somente Preview. Não aceitar ADR nem ampliar ambiente.

Contratos: endpoint `/api/place-image-preview`, token assinado de mídia Google, adapters existentes, Place.primaryImage curada. Reutilizar busca efêmera por identidade e contexto; nenhuma foto vira estado canônico. Caminhos, critérios e comandos são os do incremento. Fallback Wikimedia nunca pode contornar matching/licença. O cliente não deve expor erro bruto nem confundir 503 com ausência confirmada. Fixtures não contêm dados pessoais reais. Relatar resultados por camada, separar E2E simulado de cobertura real e manter gate humano de merge.
