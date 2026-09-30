---
id: RB-INC-213
title: Wizard de preparação — proposta de roteiro
description: Implementa a Etapa 4 de 4, gerando explicitamente uma Itinerary Proposal a partir das fontes canônicas revisadas, sem aplicar mudanças ao Roteiro.
document_type: implementation-increment
owner: Experience and Proposal Management
status: Draft
version: "0.1.0"
created: "2026-09-30"
last_updated: "2026-09-30"
authors: [RouteBook Team]
tags: [implementation, wizard, preparation, proposal, traveler-profile]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-INC-203, RB-INC-208, RB-INC-211, RB-INC-212, RB-CTX-213]
prerequisites: [RB-INC-212]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-213 — Wizard de preparação: proposta de roteiro

## Unidade de trabalho

- Issue: [#517](https://github.com/collapsy/Routebook/issues/517)
- Branch: `codex/rb-inc-213-preparation-proposal`
- Base: `main@53518e5ab7d99636db76d8d90edd240b62a5635a`.
- Merge: somente após autorização humana explícita.

## Objetivo

Implementar a Etapa 4 de 4 do wizard:

```text
Trip + TripPlacePreference[] + TravelerProfile
        ↓
Itinerary Proposal revisável
```

A geração ocorre somente após ação explícita do usuário na Revisão. A Proposal é criada como sugestão separada do Roteiro e permanece sujeita a decisão posterior.

## Contrato de dados

O contexto de geração deve carregar as fontes canônicas atuais no momento da solicitação. Não persistir uma cópia da Revisão, `WizardState`, `WizardSession` ou JSON paralelo. O `TravelerProfile` participa como contexto de geração sem alterar a responsabilidade da Trip, das preferências ou do Itinerary.

As regras de seleção permanecem:

- `WANT` participa por padrão;
- `MUST_DO` aumenta precedência apenas dentro de `WANT`;
- `MAYBE` só participa quando o usuário autoriza explicitamente;
- `NOT_INTERESTED` é excluído;
- candidatos do usuário permanecem `USER_SELECTED`;
- `ROUTEBOOK_RECOMMENDED` não é criado por conveniência de preenchimento.

## Experiência

- Revisão exibe CTA para a Etapa 4, preservando `preparar=1` quando o fluxo permanecer no wizard.
- A Etapa 4 comunica geração, sucesso, erro e indisponibilidade sem afirmar que o Roteiro foi alterado.
- A Proposal pode ser revisada pela experiência existente, mas aceite, rejeição, edição e aplicação permanecem ações distintas e explícitas.
- A navegação mostra Lugares e Contexto concluídos, Revisão concluída e Proposta ativa.

## Invariantes

- `TripPlacePreference ≠ Activity`.
- `Proposal ≠ Roteiro aplicado`.
- Nenhuma Activity canônica é criada pela geração.
- Nenhuma alteração no Itinerary ocorre antes de aceite explícito.
- Falha de geração não altera Trip, preferências, TravelerProfile ou Itinerary.
- O contexto enviado ao gerador é mínimo, validado e derivado das fontes autorizadas.

## Fora de escopo

- aceite, rejeição, edição ou aplicação novos;
- montagem automática de dias fora do gerador já contratado;
- criação automática de `ROUTEBOOK_RECOMMENDED`;
- nova tabela, snapshot persistido ou estado paralelo do wizard;
- mudança de autenticação, Provider ou Production;
- alteração de regras de domínio sem decisão humana.

## Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/preparacao/revisao/**
apps/web/app/viagens/[tripId]/roteiro/proposta/**
apps/web/components/trip-planning-wizard.tsx
apps/web/lib/itinerary-proposal-generation.*
apps/web/e2e/trip-preparation-proposal.spec.ts
apps/web/e2e/trip-context-wizard.spec.ts
packages/database/src/authoritative-itinerary-proposal-generation-context.*
docs/implementation/increments/rb-inc-213-preparation-proposal.md
docs/implementation/context-packs/rb-inc-213-preparation-proposal.md
docs/registry.md
docs/implementation/traceability-matrix.md
```

## Critérios de aceite

- [ ] Revisão → Proposta preserva o contexto de preparação e a URL esperada.
- [ ] Etapa 4 de 4 aparece ativa e as etapas anteriores permanecem navegáveis.
- [ ] A geração usa Trip, TripPlacePreference e TravelerProfile atuais.
- [ ] WANT, MUST_DO, MAYBE e NOT_INTERESTED respeitam seus contratos.
- [ ] A ação de geração exige autorização e não ocorre ao abrir a página.
- [ ] A Proposal é persistida/reidratada sem alterar o Itinerary.
- [ ] Erros, ausência de Itinerary e indisponibilidade são comunicados sem perda de dados.
- [ ] Rota normal existente de Proposal permanece compatível.
- [ ] Nenhuma Activity ou `ROUTEBOOK_RECOMMENDED` é criada indevidamente.
- [ ] Cobertura unitária, integração, interface e E2E responsivo comprova a jornada crítica.

## Validação

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

CI integrado e Vercel Preview são evidências finais. O merge não é automático.
