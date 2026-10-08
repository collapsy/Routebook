---
id: RB-CTX-218
title: Context Pack do RB-INC-218 — Retomada de Proposal pendente
description: Delimita a retomada de uma Proposal válida aguardando decisão, preservando a separação entre proposta e estado aplicado.
document_type: implementation-context-pack
owner: Experience and Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-10-08"
last_updated: "2026-10-08"
authors: [RouteBook Team]
tags: [implementation, context-pack, journey-resumption, itinerary-proposal]
related_documents: [RB-INC-218, RB-INC-217, RB-CTX-217, RB-CORE-0004]
prerequisites: [RB-INC-217]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-218 — Retomada de Proposal pendente

## 1. Missão

Fechar a lacuna entre sair de uma preparação com uma Proposal ainda não decidida e retomá-la depois, sem criar uma segunda Proposal ou aplicar a primeira silenciosamente.

## 2. Unidade

- Incremento: `RB-INC-218`.
- Issue: [#531](https://github.com/collapsy/Routebook/issues/531).
- Branch: `codex/issue-531-resume-proposal`.
- Base: branch `codex/fix-preparation-without-itinerary`, PR #530.

## 3. Fontes aplicáveis

1. `AGENTS.md`, `docs/core/routebook-bible.md` e `docs/README.md`;
2. `RB-INC-217` e `RB-CTX-217`, para a jornada integrada já coberta e os limites da preparação;
3. `apps/web/lib/itinerary-proposal-experience.ts`, fonte de consulta para validade e seleção da Proposal revisável;
4. visão da Trip, páginas Revisão/Proposta da preparação e revisão existente da Proposal;
5. E2E integrado `apps/web/e2e/journey-consolidation.spec.ts`;
6. `docs/registry.md` e `docs/implementation/traceability-matrix.md`.

Não há mudança de domínio ou arquitetura neste incremento. Use os estados e operações públicos existentes; não crie estado de wizard, endpoint, coluna ou migration.

## 4. Evidência e lacuna

- Com Proposal válida pendente, a visão da Trip oferece “Preparar viagem”.
- A Revisão continua dizendo que a próxima etapa é montar uma Proposal.
- A etapa Proposta oferece geração sem verificar a Proposal válida existente.
- A página de Roteiro já consegue identificar e revisar a Proposal mais recente, mas chegar até ela exige descoberta indireta.
- O E2E atual valida geração e aceite na mesma sessão, mas não sair e retornar antes da decisão.

## 5. Invariantes

- Proposal `ready` válida continua sendo uma sugestão, não uma decisão aplicada.
- Retomada não altera Proposal, Itinerary, Trip ou preferências.
- Expiração continua sendo determinada pela validade já persistida e pelo helper existente.
- Autorização de revisão/aceite permanece nas fronteiras existentes.

## 6. Caminhos e validação

Alterar somente os caminhos permitidos em RB-INC-218. Reutilizar `findLatestReviewableItineraryProposal` ou `hasReadyItineraryProposal` quando apropriado, sem copiar regras de validade para a UI.

O E2E deve gerar uma única Proposal pela UI, navegar para fora, retornar pela visão e pela preparação, retomar a mesma Proposal e confirmar que continua `ready` e que não foi criada Activity antes do aceite. Executar nos projetos desktop e mobile. A suíte integrada atual cobre o aceite explícito depois desse ponto.

## 7. Fora de escopo e escalonamento

Não alterar os critérios de seleção/geração ou permitir múltiplas Proposals como nova regra de domínio. Se a retomada exigir escolha entre várias Proposals válidas ou mudar a política de geração, interrompa e solicite decisão humana; não escolha silenciosamente uma regra.

Não fazer merge da PR sem autorização humana.
