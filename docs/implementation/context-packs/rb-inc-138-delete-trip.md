---
id: RB-CTX-138
title: Context Pack do RB-INC-138 — Exclusão Segura de Viagem
description: Fornece o contexto mínimo, os invariantes de autorização e os gates para implementar exclusão destrutiva de Trip sem violar isolamento, integridade ou evidência M8.
document_type: implementation-context-pack
owner: Trip Management and Identity Access
status: Draft
version: "0.1.0"
created: "2026-08-14"
last_updated: "2026-08-14"
authors: [RouteBook Team]
tags: [context-pack, trip, deletion, authorization, postgres, destructive-action]
related_documents: [RB-INC-138, RB-CORE-0004, RB-DOM-001, RB-SEC-001, RB-ADR-008, RB-INC-087, RB-INC-090, RB-INC-136]
prerequisites: [RB-INC-087, RB-INC-090]
next_documents: [RB-INC-139, RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-138 — Exclusão Segura de Viagem

## 1. Missão do executor

Implementar a exclusão definitiva de Trip como operação destrutiva owner-only, preservando isolamento por Account, revalidação server-side, confirmação humana imediata e integridade referencial PostgreSQL.

## 2. Incremento

- ID: `RB-INC-138`;
- Issue: `#325`;
- branch: `codex/rb-inc-138-delete-trip`;
- base inicial: `4b4f8c5554adac2e0a34a9f02a38c7561966fb47`;
- relação com M8: backlog pré-validação vinculado a `#319`.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/domain/domain-model.md`;
5. `docs/security/security-and-privacy-architecture.md`;
6. `docs/architecture/adrs/rb-adr-008-hybrid-authorization-and-account-tenant-isolation.md`;
7. `docs/implementation/increments/rb-inc-087-account-membership-trip-authorization.md`;
8. `docs/implementation/increments/rb-inc-090-authenticated-trip-workspace.md`;
9. `docs/implementation/increments/rb-inc-136-m8-real-validation.md`;
10. RB-INC-138 e este Context Pack.

## 4. Invariantes

- Trip continua sendo a raiz do workspace de planejamento;
- operação destrutiva exige confirmação explícita na interface;
- autenticação e autorização são revalidadas no servidor;
- `trip:delete` não é sinônimo de `trip:edit`;
- somente membership `owner` ativa pode excluir;
- `editor` e `viewer` nunca recebem essa permissão;
- nenhuma identidade de outro tenant pode ser inferida em mensagens de erro;
- um delete bem-sucedido remove o workspace dependente sem órfãos;
- cancelamento não produz DML;
- nenhum delete é executado em Production como parte da validação técnica do incremento;
- implementação não constitui evidência humana de M8.

## 5. Contratos existentes reutilizados

- `TripRepository` e `DrizzleTripRepository`;
- `resolveTripRouteAccess`;
- `authorizeTripAction` e `DrizzleTripAuthorizationReader`;
- Account Membership owner/editor/viewer;
- Server Actions do Next.js App Router;
- FKs PostgreSQL existentes com `ON DELETE CASCADE`;
- `/viagens` como superfície segura após a remoção.

## 6. Auditoria de persistência

Consulta read-only ao schema real confirmou `ON DELETE CASCADE` para as referências diretas a `trips.id` em `decisions`, `itineraries`, `itinerary_proposals`, `planning_conflicts`, `proposal_applications`, `recommendations`, `saved_places` e `traveler_profiles`.

Consequência arquitetural: o adapter deve executar um único delete na raiz `trips`; não criar orquestração manual de limpeza nem migration desnecessária.

## 7. Caminhos permitidos

```text
modules/trip-management/src/repository.ts
modules/trip-management/src/service.ts
modules/identity-access/src/trip-authorization.ts
modules/identity-access/src/trip-authorization.test.ts
packages/database/src/trip-repository.ts
packages/database/src/trip-repository-postgres.test.ts
apps/web/app/viagens/[tripId]/delete-trip-action.ts
apps/web/app/viagens/[tripId]/delete-trip-control.tsx
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/page.tsx
apps/web/app/viagens/trip-overview.css
apps/web/e2e/authenticated-trips.spec.ts
docs/implementation/increments/rb-inc-138-delete-trip.md
docs/implementation/context-packs/rb-inc-138-delete-trip.md
docs/registry.md
```

## 8. Estratégia de autorização

A matriz esperada é:

| Role | trip:view | trip:edit | trip:accept-proposal | trip:delete |
| --- | --- | --- | --- | --- |
| owner | sim | sim | sim | sim |
| editor | sim | sim | sim | não |
| viewer | sim | não | não | não |

A UI não é boundary de segurança. Mesmo quando o controle não é renderizado, a Server Action precisa chamar `resolveTripRouteAccess({ action: "trip:delete" })` antes do repository.

## 9. Experiência destrutiva

Fluxo esperado:

1. owner abre a visão da Viagem;
2. encontra Zona de risco;
3. escolhe `Excluir viagem`;
4. recebe aviso explícito do impacto;
5. pode cancelar sem alteração;
6. ao confirmar, a action revalida autorização e exclui;
7. retorna a `/viagens?deleted=1`;
8. a lista confirma a conclusão e não exibe mais a Trip.

## 10. Estratégia de teste

- unitário de autorização owner/editor/viewer;
- PostgreSQL real para `deleteById`, retorno booleano e cascade de dependências representativas;
- E2E autenticado para cancelamento e confirmação;
- regressão existente continua cobrindo isolamento entre Users;
- CI deve executar format, docs, lint, typecheck, domain/component tests, build e Playwright.

## 11. Fora de escopo

- soft delete/lixeira/restauração;
- retenção especial de Account;
- delete em massa;
- nova migration;
- remoção automática de viagens antigas;
- preenchimento de evidências da Fase B do M8.

## 12. Critérios de aceite

- [x] contrato de delete adicionado ao TripRepository;
- [x] adapter Drizzle implementado;
- [x] `trip:delete` owner-only;
- [x] Server Action revalida acesso;
- [x] confirmação e cancelamento implementados;
- [x] feedback pós-delete implementado;
- [x] testes unitário/PostgreSQL/E2E adicionados;
- [ ] Registry atualizado;
- [ ] Documentation Validation verde;
- [ ] Engineering Validation verde no mesmo SHA;
- [ ] PR integrada.

## 13. Quando interromper e escalar

Interromper apenas se:

- algum FK relevante deixar de suportar remoção consistente;
- o delete exigir retenção regulatória não coberta pelos contratos atuais;
- houver risco de exclusão cross-tenant;
- surgir decisão de produto sobre lixeira/restauração que altere materialmente o hard delete;
- Production ou dados pessoais reais precisarem ser alterados para validar a feature.

Não interromper para correções de format, docs, lint, typecheck, testes, build ou E2E resolvíveis dentro dos contratos existentes.