---
id: RB-CTX-043
title: Context Pack — Núcleo de Planning Conflict
description: Contexto operacional para implementar o RB-INC-043 com domínio determinístico, persistência isolada e detecção sem mutação silenciosa.
document_type: implementation-context-pack
owner: Planning Assurance
status: Draft
version: "0.1.0"
created: "2026-07-31"
last_updated: "2026-07-31"
authors:
  - RouteBook Team
tags:
  - context-pack
  - planning-assurance
  - planning-conflict
  - deterministic-detection
related_documents:
  - RB-INC-043
  - RB-INC-042
  - RB-DOM-001
  - RB-DOM-003
  - RB-DOM-004
  - RB-DEL-001
prerequisites:
  - RB-INC-042
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-043 — Núcleo de Planning Conflict

## 1. Missão

Implementar o RB-INC-043 a partir do HEAD verde `09b2f86ed5be35b6e3cb77f990f97ba21e45fd44`, preservando todas as invariantes e validações existentes.

## 2. Fonte canônica

- repositório: `collapsy/Routebook`;
- branch: `feature/rb-inc-043-planning-conflict-core`;
- base: `feature/rb-inc-042-recommendation-decisions`;
- issue: `#96`;
- incremento: `RB-INC-043`.

Não trabalhar em cópias hipotéticas e não declarar alterações não aplicadas ao GitHub.

## 3. Linguagem obrigatória

Utilizar os termos canônicos:

- `PlanningConflict`;
- `PlanningConflictId`;
- `TripId`;
- `Itinerary`;
- `ItineraryDay`;
- `Activity`;
- `ActivityId`;
- `Context Snapshot`;
- `Evidence`;
- `Severity`;
- `detected`;
- `invalidated`;
- `superseded`.

Não usar Recommendation, Warning ou Error como sinônimos de PlanningConflict.

## 4. Fronteiras

### Planning Assurance

Responsável por:

- agregado PlanningConflict;
- tipos e severidades;
- políticas determinísticas;
- fingerprint;
- ciclo de vida inicial;
- contrato de repositório.

### Trip Management

Responsável por:

- Trip;
- Itinerary;
- ItineraryDay;
- Activity;
- regras de alteração do Roteiro.

Planning Assurance somente lê snapshots desses agregados nesta fatia.

### Database

Responsável por:

- schema físico;
- migration;
- adapter Drizzle;
- transação;
- integridade referencial.

Regras de domínio não devem ser implementadas exclusivamente no adapter.

## 5. Estrutura sugerida

```text
modules/planning-assurance/
  package.json
  tsconfig.json
  src/
    planning-conflict.ts
    planning-conflict-id.ts
    planning-conflict-policy.ts
    planning-conflict-detection.ts
    planning-conflict-repository.ts
    index.ts
    *.test.ts

packages/database/src/
  planning-conflict-schema.ts
  planning-conflict-repository.ts
  planning-conflict-detection-service.ts
```

A estrutura poderá variar, desde que preserve ownership e baixo acoplamento.

## 6. Modelo mínimo

```text
PlanningConflict
  id: PlanningConflictId
  tripId: TripId
  type: PlanningConflictType
  severity: PlanningConflictSeverity
  state: detected | invalidated | superseded
  snapshot: PlanningConflictContextSnapshot
  evidence: PlanningConflictEvidence[]
  relatedDayIds: string[]
  relatedActivityIds: ActivityId[]
  detectedAt: Date
  policyVersion: string
  contextFingerprint: string
  invalidatedAt?: Date
  supersededAt?: Date
  supersededBy?: PlanningConflictId
```

## 7. Tipos iniciais

```text
activity-time-overlap
activity-outside-trip-period
activity-day-mismatch
invalid-activity-interval
day-overloaded
```

Os nomes finais deverão ser estáveis, tipados e testados.

## 8. Evidências

Evidências devem ser estruturadas e derivadas de dados conhecidos.

Exemplos:

- IDs das Activities sobrepostas;
- intervalos comparados;
- data do Dia;
- período da Viagem;
- quantidade e duração total de Activities;
- limite explícito aplicado;
- política e versão utilizadas.

Não incluir texto especulativo, avaliação pública, trânsito, disponibilidade ou dados pessoais.

## 9. Fingerprint

O fingerprint deverá ser construído somente com campos materiais para a equivalência do conflito.

Deverá:

- ser determinístico;
- ordenar coleções antes da serialização;
- excluir `detectedAt` e IDs aleatórios;
- incluir versão da política;
- distinguir tipos e relações materiais;
- permitir deduplicação ativa.

## 10. Regras temporais

- intervalos adjacentes não se sobrepõem;
- sobreposição exige início anterior ao fim do outro intervalo;
- Activity sem horário suficiente não gera sobreposição inventada;
- datas devem ser comparadas no modelo temporal já adotado pelo projeto;
- duração não positiva é intervalo inválido;
- Activity associada a Dia diferente da sua data é incompatível;
- Activity fora do período da Trip é conflito verificável.

## 11. Dia excessivamente carregado

A regra deverá usar constante nomeada, documentada e coberta por testes.

Não utilizar score oculto.

A primeira política poderá considerar quantidade e/ou duração total, desde que:

- seja simples;
- seja reproduzível;
- não dependa de Provider;
- não presuma deslocamento desconhecido;
- produza evidência clara.

## 12. Sequência de detecção

```text
carregar Trip e Itinerary
→ validar ownership
→ construir snapshot
→ aplicar políticas em ordem estável
→ normalizar evidências
→ calcular fingerprints
→ comparar conflitos ativos
→ reutilizar equivalentes
→ invalidar ou superseder obsoletos
→ persistir novos conflitos
→ commit
```

## 13. Erros esperados

- `trip-not-found`;
- `itinerary-not-found` quando necessário;
- `cross-trip`;
- `invalid-snapshot`;
- `invalid-related-activity`;
- `idempotency-conflict`;
- `repository-failure`.

Erros de aplicação não devem vazar detalhes físicos do banco.

## 14. Testes obrigatórios

### Domínio

- criação válida e inválida;
- identidade;
- transições;
- fingerprint;
- ordenação;
- tipos e severidades.

### Detecção

- sobreposição parcial e total;
- adjacência;
- ausência de horário;
- fora do período;
- incompatibilidade de Dia;
- duração inválida;
- carga diária;
- repetição idêntica.

### Persistência

- round trip;
- unicidade ativa;
- supersessão;
- invalidação;
- cross-trip;
- cascata;
- rollback;
- migrations.

## 15. Quality gates

Antes de considerar o incremento concluído, executar e registrar:

- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm db:migrate`;
- `pnpm test`;
- smoke da aplicação;
- `pnpm build`;
- Playwright responsivo existente.

## 16. Restrições

Não implementar nesta fatia:

- resolução;
- ignorar risco;
- restauração;
- interface final;
- mutação automática do Roteiro;
- Decision de resolução;
- Providers externos;
- IA;
- Itinerary Proposal.
