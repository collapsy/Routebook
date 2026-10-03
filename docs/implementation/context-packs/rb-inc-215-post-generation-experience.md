---
id: RB-CTX-215
title: Context Pack do RB-INC-215 — Experiência pós-geração
description: Delimita a transição atômica da Trip após aceite de Proposal e a experiência operacional posterior.
document_type: implementation-context-pack
owner: Experience, Trip Management and Itinerary Planning
status: Draft
version: "0.1.0"
created: "2026-10-03"
last_updated: "2026-10-03"
authors: [RouteBook Team]
tags: [implementation, context-pack, post-generation, proposal-application, trip-lifecycle]
related_documents: [RB-INC-215, RB-INC-207, RB-INC-212, RB-INC-213, RB-INC-214, RB-ADR-027, RB-ADR-028, RB-DOM-001, RB-DOM-003, RB-DOM-004]
prerequisites: [RB-INC-214]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-215 — Experiência pós-geração

## Missão

Fechar o gap entre aceite/aplicação de uma Proposal e o modo operacional da Trip. Não adicionar estado paralelo: `Trip.status` já é a fonte que RB-INC-212 usa para encerrar o onboarding.

## Leitura obrigatória

1. `AGENTS.md`, Bible e `docs/README.md`;
2. RB-INC/CTX-207, RB-INC/CTX-212, RB-INC/CTX-213, RB-INC/CTX-214 e este incremento;
3. `docs/domain/domain-model.md`, `docs/domain/business-rules-and-invariants.md` e `docs/domain/domain-events-and-lifecycles.md`;
4. RB-ADR-027, RB-ADR-028 e RB-ADR-029;
5. serviços de aplicação integral/parcial, ports públicos do Trip Management e adapters transacionais PostgreSQL;
6. overview da Trip, páginas de preparação/Lugares, wizard e E2Es de criação, Proposal e aceite;
7. `docs/registry.md` e matriz de rastreabilidade.

## Interpretação canônica

- `TripStatus` já contém `draft`, `planned`, `in-progress`, `completed`, `cancelled` e `archived`.
- RB-INC-212 já declara que a aplicação de planejamento move Trip de `draft` para `planned` e encerra o onboarding.
- RB-ADR-027 determina atomicidade, idempotência e rollback para a aplicação integral; aplicar status fora da transação causaria estado parcial e não é permitido.
- A aplicação parcial já possui seu próprio fluxo transacional; a transição deve seguir as mesmas garantias.
- Atualizar para `planned` somente a partir de `draft`. Status mais avançados/terminais ficam intactos. Não deduzir status temporal do relógio nesta etapa.
- Não confundir status da Trip com status da Activity, Proposal ou Itinerary.

## Fronteiras

- O módulo `trip-management` define a operação de domínio pura de transição; continua independente de banco/UI.
- O adapter PostgreSQL autorizado em RB-ADR-027 persiste a atualização junto com Proposal Application, Itinerary e Decision.
- A camada web não tenta gravar Trip status depois do sucesso da action.
- O componente do wizard e as rotas que o exibem condicionam o wizard inicial ao status `draft`; URL antiga ou `preparar=1` manual não deve reabrir onboarding numa Trip planejada.
- A navegação operacional mantém acesso a descoberta e permite geração normal de nova Proposal, sem o progresso introdutório `preparar=1`.
- Não criar novo estado persistido nem tocar migrations/schema.

## Caminhos permitidos

Use somente “Caminhos permitidos” no RB-INC-215. Se forem insuficientes, pare e atualize ambos os documentos antes da edição.

## Verificações

- unit: transições idempotentes e status não regressivo;
- integração PostgreSQL: aceite integral/parcial atualiza `draft → planned` na mesma transação;
- rollback: erro em qualquer escrita não deixa Itinerary, Proposal, Decision ou Trip parcialmente atualizados;
- idempotência/concorrência: replays e status avançados preservados;
- E2E: saída da preparação após aplicação, continuidade para Roteiro e overview operacional;
- regressão: Trip draft, fluxo normal de Proposal, preferência e acesso ao Roteiro manual;
- documental: `node scripts/validate-docs.mjs`.

## Gate humano

Não mergear. Apresentar evidências reais de CI e Preview e aguardar autorização explícita.
