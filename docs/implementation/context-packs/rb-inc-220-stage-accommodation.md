---
id: RB-CTX-220
title: Context Pack do RB-INC-220 — Hospedagem da Etapa
description: Delimita a implementação da Hospedagem opcional associada a uma Etapa da Viagem.
document_type: implementation-context-pack
owner: Trip Management and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-10-16"
last_updated: "2026-10-16"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip, accommodation, discovery]
related_documents: [RB-INC-220, RB-INC-219, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-PRD-006, RB-PRD-007, RB-UX-001, RB-DATA-001, RB-ARC-001, RB-ADR-012]
prerequisites: [RB-INC-219]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-220 — Hospedagem da Etapa

## Leitura obrigatória

1. `AGENTS.md`, `docs/core/routebook-bible.md`, `docs/README.md` e RB-INC-220;
2. RB-INC-219 e RB-CTX-219;
3. RB-DOM-001, RB-DOM-002 e RB-DOM-003 para Trip Stage, Accommodation e alteração estrutural;
4. RB-PRD-006, RB-PRD-007 e RB-UX-001 para múltiplos Destinos, Hospedagens e navegação;
5. RB-DATA-001, RB-ARC-001 e RB-ADR-012 para persistência, fronteiras e Geocoder;
6. código atual de Hospedagem, geocoding, Stage e Discovery.

## Decisão humana recebida

O pedido original inclui mais de uma Hospedagem ou lugar na mesma Viagem. Após RB-INC-219, o usuário autorizou prosseguir. A segunda entrega usa Accommodation já definida na linguagem do domínio, vinculada opcionalmente a uma Etapa adicional.

## Contratos a preservar

- Trip conserva sua Accommodation principal.
- Stage pode ter Accommodation própria; ausência mantém a referência do Destination da Etapa.
- Provider de geocoding pode falhar sem bloquear o registro textual da Hospedagem.
- `trip:edit` e vínculo StageId/TripId são verificados antes da escrita.
- Nenhum Provider novo é ativado e nenhuma Proposal é aplicada automaticamente.
- Somente caminhos do RB-INC-220 podem ser alterados. Arquivo indispensável adicional exige justificativa e atualização prévia do incremento e Context Pack.
