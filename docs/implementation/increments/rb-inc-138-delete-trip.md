---
id: RB-INC-138
title: Exclusão Segura de Viagem
description: Permite que o owner exclua definitivamente uma Viagem autenticada com confirmação explícita, autorização server-side e integridade referencial garantida pelo banco.
document_type: implementation-increment
owner: Trip Management and Identity Access
status: Draft
version: "0.1.0"
created: "2026-08-14"
last_updated: "2026-08-14"
authors: [RouteBook Team]
tags: [trip, deletion, authorization, destructive-action, postgres, m8]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-SEC-001, RB-ADR-008, RB-INC-087, RB-INC-090, RB-INC-136]
prerequisites: [RB-INC-087, RB-INC-090]
next_documents: [RB-INC-139, RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-138 — Exclusão Segura de Viagem

Issue: `#325`

Branch: `codex/rb-inc-138-delete-trip`

## 1. Contexto

Durante a preparação do M8, foi identificada uma lacuna de controle do usuário: uma Viagem criada não possuía caminho explícito para exclusão definitiva. O incremento resolve essa lacuna sem tratar sua implementação como evidência de validação humana do M8.

## 2. Objetivo

Permitir que somente o `owner` autorizado exclua uma Viagem mediante confirmação explícita, removendo o workspace dependente de forma consistente e retornando o usuário para `Minhas viagens` com feedback de sucesso.

## 3. Decisões

- `trip:delete` é uma permissão distinta de `trip:edit`;
- somente `owner` ativo pode executar `trip:delete`;
- `editor` e `viewer` recebem `permission-denied`;
- a UI de exclusão só é exibida quando o boundary server-side comprova autorização;
- a Server Action revalida sessão, escopo da Trip e membership antes do write;
- a exclusão é hard delete neste incremento;
- o `DELETE` ocorre apenas na raiz `trips`;
- dependências são removidas pelos FKs `ON DELETE CASCADE` já existentes;
- não há nova migration de schema nem DML de seed;
- cancelamento da confirmação não produz write.

## 4. Integridade referencial verificada

Auditoria read-only do schema PostgreSQL confirmou `ON DELETE CASCADE` para relações diretas com `trips.id`, incluindo:

- `decisions`;
- `itineraries`;
- `itinerary_proposals`;
- `planning_conflicts`;
- `proposal_applications`;
- `recommendations`;
- `saved_places`;
- `traveler_profiles`.

O incremento reutiliza essa política de integridade em vez de implementar uma sequência manual de deletes.

## 5. Escopo implementado

- extensão de `TripRepository` com `deleteById`;
- serviço `deletePersistedTrip`;
- implementação Drizzle com `DELETE ... RETURNING`;
- nova permissão `trip:delete` owner-only;
- Server Action autorizada para exclusão;
- zona de risco na visão da Viagem;
- confirmação explícita com opção de cancelar;
- redirect para `/viagens?deleted=1` após sucesso;
- feedback visual de exclusão concluída;
- testes de autorização, persistência/cascade e E2E.

## 6. Fora de escopo

- lixeira, soft delete ou restauração;
- exclusão de Account ou User;
- exclusão em massa;
- mudança de política de retenção geral do produto;
- inferir resultado da validação M8.

## 7. Critérios de aceite

- [x] ação de exclusão disponível para owner autorizado;
- [x] confirmação explícita antes do write;
- [x] cancelamento não altera a Viagem;
- [x] autorização é revalidada no servidor;
- [x] editor e viewer não possuem `trip:delete`;
- [x] Trip inexistente/fora do escopo não é excluída;
- [x] persistência usa a raiz `trips` e cascades existentes;
- [x] teste PostgreSQL comprova remoção de dados dependentes;
- [x] E2E cobre cancelamento e exclusão confirmada;
- [x] Registry atualizado;
- [ ] Documentation Validation verde;
- [ ] Engineering Validation verde no mesmo SHA;
- [ ] PR integrada.

## 8. Arquivos principais

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
```

## 9. Testes e gates

O mesmo SHA deve passar por:

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Engineering Validation continua sendo a fonte canônica para PostgreSQL efêmero e Playwright responsivo.

## 10. Riscos

- exclusão é irreversível no produto atual;
- por isso a confirmação precisa permanecer explícita e inequívoca;
- a política de cascade é parte material da segurança do fluxo e deve continuar protegida por teste PostgreSQL;
- qualquer futura relação com `trips.id` que não use cascade precisa ser avaliada antes de manter o mesmo contrato de delete.

## 11. Relação com M8

O incremento melhora o controle sobre a Viagem antes da Fase B do RB-INC-136. Durante uso real, ainda deve ser observado se a ação é encontrável, compreensível e transmite segurança. Nenhum resultado humano é marcado como validado por esta entrega.
