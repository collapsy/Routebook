---
id: RB-CTX-213
title: Context Pack do RB-INC-213 — Proposta da preparação
description: Delimita a integração da geração explícita de Proposal ao quarto passo do wizard, usando Trip, TripPlacePreference e TravelerProfile sem aplicar o resultado ao Roteiro.
document_type: implementation-context-pack
owner: Experience and Proposal Management
status: Draft
version: "0.1.0"
created: "2026-09-30"
last_updated: "2026-09-30"
authors: [RouteBook Team]
tags: [implementation, context-pack, wizard, proposal, generation]
related_documents: [RB-INC-213, RB-INC-211, RB-INC-212, RB-INC-203, RB-INC-208, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003]
prerequisites: [RB-INC-212]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-213 — Proposta da preparação

## Missão

Conectar a Revisão à geração explícita de uma Itinerary Proposal revisável, sem transformar a Proposal em Roteiro aplicado.

## Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. RB-INC/CTX-203, RB-INC/CTX-208, RB-INC/CTX-211 e RB-INC/CTX-212;
5. RB-ADR-027, RB-ADR-028 e RB-ADR-029;
6. domínio de Trip, TravelerProfile, TripPlacePreference, Itinerary e Itinerary Proposal;
7. geração autoritativa existente, seu input assembler, contexto Postgres e rota normal de Proposal;
8. Registry e matriz de rastreabilidade.

## Contratos e invariantes

- Trip continua dona de destino, período, hospedagem, participantes e versão de contexto.
- TravelerProfile continua dono do contexto adicional da viagem.
- TripPlacePreference continua dona de intenção e prioridade.
- O Itinerary continua sendo o estado canônico aplicado.
- A Itinerary Proposal é uma sugestão separada e não aplica mudanças ao Itinerary ao ser gerada.
- Exceção operacional: ao gerar INITIAL por ação explícita numa Trip `draft` sem Itinerary, criar somente a estrutura vazia de Dias exigida pelo contrato atual. Não criar Activities; se a geração falhar, a estrutura vazia pode permanecer.
- Abrir a página Roteiro de uma Trip `draft` sem Itinerary é somente leitura e deve retomar a preparação, sem criar/persistir esse scaffold.
- `WANT` é elegível por padrão; `MAYBE` exige opt-in; `NOT_INTERESTED` é excluído.
- `MUST_DO` somente qualifica `WANT` e não supera restrições ou conflitos.
- Proveniência distingue `USER_SELECTED` de `ROUTEBOOK_RECOMMENDED`.

## Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/preparacao/revisao/**
apps/web/app/viagens/[tripId]/preparacao/proposta/page.tsx
apps/web/app/viagens/[tripId]/lugares-salvos/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/**
apps/web/components/trip-planning-wizard.tsx
apps/web/lib/itinerary-proposal-generation.*
apps/web/e2e/trip-preparation-proposal.spec.ts
apps/web/e2e/trip-context-wizard.spec.ts
apps/web/e2e/journey-consolidation.spec.ts
packages/database/src/authoritative-itinerary-proposal-generation-context.*
docs/implementation/increments/rb-inc-213-preparation-proposal.md
docs/implementation/context-packs/rb-inc-213-preparation-proposal.md
docs/registry.md
docs/implementation/traceability-matrix.md
```

## Caminhos somente leitura

```text
modules/proposal-management/**
packages/database/drizzle/**
docs/domain/**
docs/architecture/adrs/**
```

Se um contrato desses caminhos for insuficiente, interrompa e registre a divergência antes de alterá-lo.

## Proibições

- não criar WizardState, WizardSession, snapshot duplicado ou tabela nova;
- não criar Activity canônica na geração nem aplicar sugestões antes do aceite;
- não aplicar, aceitar ou rejeitar Proposal nesta etapa;
- não inventar `ROUTEBOOK_RECOMMENDED`;
- não tornar opcionais do TravelerProfile obrigatórios por conveniência;
- não alterar autenticação, Production ou Providers;
- não enviar secrets ou dados privados desnecessários a qualquer gerador.

## Critérios de aceite

- [ ] CTA e navegação da Etapa 3 conduzem à Etapa 4 sem geração silenciosa.
- [ ] O contexto de geração lê as fontes canônicas atuais e inclui TravelerProfile quando suportado pelo contrato.
- [ ] A geração é autorizada, validada, limitada e tem tratamento de erro.
- [ ] Proposal gerada não altera TripPlacePreference, TravelerProfile nem aplica sugestões/Activities ao Itinerary; a única inicialização permitida é o scaffold vazio numa Trip `draft` sem roteiro, após ação explícita.
- [ ] A revisão existente da Proposal permanece acessível e compatível.
- [ ] Alterações feitas antes da geração são refletidas; nenhum snapshot antigo da Revisão prevalece.
- [ ] Testes comprovam a ausência de Activity e aplicação automática.
- [ ] E2E parte da visão de uma Trip `draft` existente sem Itinerary, conclui a jornada e verifica aplicação somente após aceite.
- [ ] CTA para Contexto fica visível no início da Minha seleção.
- [ ] Navegar a Roteiro sem Itinerary em Trip `draft` não causa gravação e volta ao onboarding.
- [ ] Mobile, teclado, loading, vazio e erro permanecem cobertos.

## Comandos

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Gate humano

Após PR, CI e Preview, parar antes do merge e informar evidências reais, SHA, riscos e pendências.
