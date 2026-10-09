---
id: RB-INC-218
title: Clareza e continuidade no wizard de preparação
description: Corrige ambiguidades observadas no Preview ao entrar no Roteiro de uma viagem ainda sem planejamento e ao avançar entre etapas da preparação, em desktop e mobile.
document_type: implementation-increment
owner: Experience and Quality
status: Draft
version: "0.2.0"
created: "2026-10-09"
last_updated: "2026-10-09"
authors: [RouteBook Team]
tags: [implementation, ux, wizard, preparation, responsive, quality]
related_documents: [RB-CORE-0004, RB-PRD-004, RB-UX-001, RB-UX-002, RB-UX-005, RB-INC-207, RB-INC-211, RB-INC-212, RB-INC-213, RB-INC-217, RB-CTX-218]
prerequisites: [RB-INC-217]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-218 — Clareza e continuidade no wizard de preparação

## 1. Unidade de trabalho

- Trabalho: correção de UX/QA identificada na validação manual autenticada do Preview.
- Issue: ainda não vinculada; este incremento delimita a unidade de trabalho.
- Branch: `codex/rb-inc-218-preparation-ux-polish`.
- Base: `main` vigente no início do incremento.
- Merge na `main`: exige autorização humana explícita.

## 2. Evidência e problema

Na jornada de uma Trip `draft` sem Itinerary, abrir `/roteiro` leva o usuário para Lugares sem explicar o motivo nem oferecer uma continuação clara. Na tela de geração da preparação, o título diz “Monte uma proposta”, enquanto o wizard descreve a etapa como revisão de uma proposta já existente. Em mobile, a rolagem preservada entre páginas pode deixar o início da nova etapa parcialmente sob o cabeçalho fixo; no desktop, o título longo ocupa largura excessiva e quebra em muitas linhas.

Os comportamentos foram observados no Preview autenticado em uma conta e dados de teste. O incremento corrige a compreensão e a navegação sem alterar o significado dos estados canônicos.

## 3. Resultado esperado

```text
Trip draft sem Itinerary
→ abrir Roteiro
→ explicação de que ainda não há Itinerary
→ ação explícita “Começar roteiro” cria somente os Dias vazios
→ preparação prossegue sem criar Proposal ou Activity

Etapa de geração da preparação
→ indicador, título e ação descrevem geração de Proposal ainda inexistente
→ navegação para nova etapa apresenta o título no viewport e com foco acessível
```

## 4. Restrições e invariantes

- Proposal continua distinta do Itinerary aplicado; nenhum estado muda sem a ação explícita já existente.
- Não criar TripPlacePreference, Activity, ItineraryProposal, WizardState ou sessão de wizard por apresentar a orientação.
- A navegação GET permanece sem escrita. Somente a ação explícita “Começar roteiro” pode criar um Itinerary vazio usando o período canônico da Trip; a ação é autorizada no servidor e idempotente.
- Não alterar regras de elegibilidade, lifecycle, geração, aceite, rejeição ou replanejamento.
- Navegação de retorno preserva Trip e dados canônicos existentes.
- A orientação deve distinguir “sem Itinerary” de “Itinerary vazio/parcial” quando os dados permitirem.
- Não usar datas passadas para inferir que a Trip terminou nem bloquear geração; essa política exige decisão de produto separada.
- Manter funcionamento por teclado, leitor de tela, toque e `prefers-reduced-motion`.

## 5. Critérios de aceite

- [ ] Ao abrir o Roteiro de uma Trip `draft` sem Itinerary, a pessoa entende por que chegou à preparação e encontra próximo passo e retorno à Trip.
- [ ] O comportamento para Trip com Itinerary vazio, parcial ou aplicado não é confundido com a ausência de Itinerary.
- [ ] Na etapa de geração, o título, o texto introdutório, o indicador do wizard e o CTA identificam geração de uma nova Proposal, não revisão de uma Proposal existente.
- [ ] Após navegar entre etapas, o cabeçalho/título da nova etapa fica inteiramente visível, inclusive com cabeçalho fixo no viewport mobile; foco programático, se utilizado, é visível e não inesperado.
- [ ] O título de etapa mantém hierarquia e comprimento legíveis em desktop e mobile sem overflow horizontal.
- [ ] Loading, erro e retorno continuam oferecendo recuperação sem apagar preferências ou contexto.
- [ ] Nenhuma navegação por si só gera Proposal ou altera Trip, seleção ou Itinerary.
- [ ] “Começar roteiro” cria apenas um Itinerary vazio, apenas após submissão explícita, com autorização server-side e sem duplicar um Itinerary existente.
- [ ] Na etapa de geração sem Itinerary, a pré-condição é explicada e a mesma ação permite continuar para gerar, sem gerar automaticamente.
- [ ] A experiência de uma Trip planejada/em andamento sem Itinerary mantém acesso explícito ao início do roteiro; E2E cobre esse POST, enquanto cenários de edição usam Itinerary de fixture.
- [ ] Testes de componente cobrem rótulos/etapas; E2E valida a entrada sem Itinerary e as transições nas configurações desktop e mobile existentes.
- [ ] A jornada é revisada manualmente no Preview nos cenários “nova Trip sem roteiro” e “Trip existente sem roteiro”; registrar evidência sem aceitar/aplicar Proposal.
- [ ] UX canônica afetada, rastreabilidade e registro documental permanecem sincronizados.

## 6. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/roteiro/actions.ts
apps/web/app/viagens/[tripId]/roteiro/actions.test.ts
apps/web/app/viagens/[tripId]/preparacao/proposta/page.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx
apps/web/components/trip-planning-wizard.tsx
apps/web/components/trip-planning-wizard.module.css
apps/web/components/trip-planning-wizard.test.tsx
apps/web/components/trip-preparation-stage-focus.tsx
apps/web/components/trip-preparation-stage-focus.test.tsx
apps/web/e2e/journey-consolidation.spec.ts
apps/web/e2e/active-trip-experience.spec.ts
apps/web/e2e/itinerary.spec.ts
apps/web/e2e/trip-preparation-proposal.spec.ts
docs/ux/user-flows.md
docs/ux/interaction-specifications.md
docs/implementation/increments/rb-inc-218-preparation-ux-polish.md
docs/implementation/context-packs/rb-inc-218-preparation-ux-polish.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

O componente de foco/rolagem só deve ser criado se a solução não puder ser expressa acessivelmente no componente atual. Se outro caminho for indispensável, interromper antes da edição e atualizar formalmente o incremento e o Context Pack.

## 7. Fora de escopo

- política de Trips com datas passadas ou estado “encerrada”;
- limpeza/remoção de Trips ou Places de teste;
- redesign geral da visão da Trip, Discovery, seleção ou Proposal;
- mudança de contratos de Proposal, seleção, geração ou aplicação;
- instrumentação comportamental/analytics;
- alteração de schema, domínio, Provider, Production ou autenticação.

## 8. Validação obrigatória

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm --filter @routebook/web exec vitest run components/trip-planning-wizard.test.tsx components/trip-preparation-stage-focus.test.tsx
pnpm --filter @routebook/web exec playwright test e2e/journey-consolidation.spec.ts e2e/trip-preparation-proposal.spec.ts --project=desktop-chromium --project=mobile-chromium
pnpm test:e2e
pnpm build
```

Se scripts de teste direcionado diferirem no workspace, registrar o comando equivalente e sua saída real. CI, Preview e avaliação manual de UX são evidências necessárias; não aceitar/aplicar Proposal no teste exploratório.

## 9. Riscos e revisão humana

- Evitar que a mensagem de ausência de Itinerary sugira que dados existentes foram perdidos.
- Evitar fazer a etapa de geração parecer uma revisão/aprovação antes de existir Proposal.
- Não introduzir scroll ou foco automático que desoriente usuários de teclado/leitor de tela.
- Merge continua condicionado à autorização humana explícita.
