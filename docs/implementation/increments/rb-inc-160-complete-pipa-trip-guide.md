---
id: RB-INC-160
title: Guia diário completo da viagem de Pipa
description: Expande o guia editorial visual de Pipa para todos os dias canônicos do piloto, mantendo sugestões separadas do Itinerary e conectadas às ações explícitas de planejamento.
document_type: implementation-increment
owner: Traveler Experience and Place Catalog
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, pipa, guide, itinerary, maps, ux]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-UX-002, RB-INC-155, RB-INC-159, RB-INC-136, RB-CTX-160]
prerequisites: [RB-INC-159]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-160 — Guia diário completo da viagem de Pipa

## 1. Contexto

Issue: `#369`.

Branch: `codex/rb-inc-160-complete-pipa-trip-guide`.

Baseline: `1ea3707f2e8410827be9df26e4e116c828a3f742`, head verde da PR #368 / RB-INC-159.

O RB-INC-155 entregou um guia visual útil para o primeiro dia e Practical Guides para os Places publicados. A auditoria pré-Production mostrou que os demais dias continuam dependentes de montagem manual e que a visão da Viagem ficou extensa demais para servir como guia de mão.

O RB-INC-159 adicionou as ações explícitas de Salvar e Adicionar ao Roteiro no contexto do Place. Este incremento usa essa capacidade para oferecer uma base editorial de toda a viagem sem transformar sugestão em estado aplicado.

## 2. Objetivo

Criar uma página dedicada `Guia da viagem` para Pipa que:

- cubra até os oito dias editoriais do piloto de 22 a 29 de agosto de 2026;
- use somente Places publicados e Practical Guides já revisados;
- apresente 2 paradas no primeiro e último dia e 3 nos dias centrais;
- mostre imagem ou fallback governado, período, horário orientativo, duração, checks e distância em linha reta;
- abra rota individual e sequência do dia no Google Maps para cálculo externo atual;
- conecte cada Place aos Detalhes e ao compositor `Adicionar ao roteiro` do RB-INC-159;
- preserve o Guia como leitura editorial sem criar Saved Place, Activity, Recommendation, Proposal ou Decision;
- reduza a visão geral da Viagem a um teaser e um CTA claro para o Guia dedicado.

## 3. Decisões

### 3.1 Guia não é Itinerary

O Guia é uma projeção editorial somente leitura. A ordem e os horários são orientação; nenhuma leitura altera estado canônico.

O CTA `Adicionar ao roteiro` abre o compositor do Place com o Dia pré-selecionado. A Activity só nasce após submit explícito do usuário.

### 3.2 Densidade variável

O primeiro e o último dia possuem duas paradas. Os seis dias centrais possuem três. Isso evita tratar chegada e saída como dias equivalentes aos dias integrais.

Períodos livres continuam legítimos. O usuário pode ignorar qualquer parada sem penalização.

### 3.3 Dados operacionais continuam externos ou identificados

- distância exibida: geodésica, rotulada como linha reta;
- rota e duração atuais: calculadas pelo Google Maps apenas ao abrir o link;
- maré, clima, programação, horário, reserva e preço: continuam checks a confirmar, não fatos em tempo real do RouteBook.

### 3.4 Viagens mais curtas não recebem dias inventados

O builder usa somente as datas canônicas existentes e limita a projeção aos oito dias editoriais disponíveis. Uma Viagem de três dias recebe somente os três primeiros dias do Guia.

## 4. Escopo

- modelo determinístico do Guia editorial de Pipa;
- página dedicada `/viagens/[tripId]/guia`;
- teaser/entrada clara na visão da Viagem;
- mapa e lista por Dia com a mesma sequência;
- links para Detalhes, compositor de Roteiro e Google Maps;
- regressões unitárias e E2E;
- documentação, Context Pack e Registry;
- aceite em Preview Vercel READY.

## 5. Fora de escopo

- novo Place ou publicação automática de candidato externo;
- Recommendation, Proposal ou Itinerary alterados por leitura;
- persistir o Guia como Activity;
- rota rodoviária, trânsito ou duração calculados internamente;
- dados de maré, clima, evento, preço ou funcionamento como tempo real;
- Provider, API paga, secret ou migration;
- Production.

## 6. Caminhos autorizados

```text
apps/web/lib/pipa-day-guide.ts
apps/web/lib/pipa-day-guide.test.ts
apps/web/components/trip-day-guide.tsx
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/guia/page.tsx
apps/web/e2e/trip-day-guide.spec.ts
docs/implementation/increments/rb-inc-160-complete-pipa-trip-guide.md
docs/implementation/context-packs/rb-inc-160-complete-pipa-trip-guide.md
docs/registry.md
```

## 7. Critérios de aceite

- [ ] Viagem de Pipa oferece entrada `Abrir guia da viagem` próxima à estrutura temporal;
- [ ] página dedicada cobre os oito dias canônicos do piloto quando a Viagem possui esse período;
- [ ] viagens mais curtas usam somente as datas existentes;
- [ ] primeiro e último dia têm duas paradas e os dias centrais três;
- [ ] cada parada usa Place publicado com Practical Guide existente;
- [ ] imagens/fallbacks preservam a governança atual;
- [ ] distância continua rotulada como linha reta;
- [ ] rota e duração atuais continuam externas ao RouteBook;
- [ ] mapa e lista de cada Dia preservam a mesma sequência;
- [ ] leitura do Guia não cria estado canônico;
- [ ] CTA de cada parada abre Detalhes e o compositor com Dia pré-selecionado;
- [ ] mobile e desktop permanecem utilizáveis;
- [ ] documentação e CI passam no mesmo SHA;
- [ ] Preview Vercel READY é usado para aceite antes de Production.

## 8. Testes obrigatórios

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/trip-day-guide.spec.ts e2e/place-actions.spec.ts
```

Engineering Validation e Documentation Validation devem concluir no mesmo SHA.

## 9. Preview e release

O incremento é empilhado sobre a PR #368. O Preview da Vercel da branch do RB-INC-160 é o ambiente de aceite funcional do pacote RB-INC-159 + RB-INC-160.

Nenhuma alteração deve ser promovida para Production neste incremento. Merge e Production permanecem gates humanos separados.

## 10. Riscos e mitigação

- **roteiro editorial parecer obrigatório:** disclosure explícito e períodos livres preservados;
- **informação operacional ficar obsoleta:** checks orientam confirmação no mesmo dia;
- **usuário confundir linha reta com tempo:** rótulo permanece explícito e rota real é externa;
- **home da Viagem ficar extensa:** guia completo migra para página dedicada e a home mantém apenas teaser;
- **Place ausente produzir dia parcial:** builder falha fechado se uma parada editorial não estiver no conjunto publicado recebido.

## 11. Rollback

Reverter o incremento remove a página dedicada e restaura o guia isolado do primeiro dia. Não há migration, Provider, secret ou novo estado persistido para desfazer.
