---
id: RB-INC-165
title: Roteiro diário operacional e timeline contextual
description: Reorganiza a superfície de Roteiro para priorizar o Dia, sua timeline, deslocamentos e mapa contextual, reduzindo carga cognitiva sem alterar domínio ou persistência.
document_type: implementation-increment
owner: Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-21"
last_updated: "2026-08-21"
authors: [RouteBook Team]
tags: [implementation, itinerary, timeline, mobile, map, ux]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-UX-002, RB-UX-004, RB-UX-005, RB-INC-159, RB-INC-160, RB-INC-161, RB-INC-136, RB-CTX-165]
prerequisites: [RB-INC-159, RB-INC-160, RB-INC-161]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-165 — Roteiro diário operacional e timeline contextual

## 1. Contexto

Issue: `#386`.

Branch: `codex/rb-inc-165-itinerary-daily-timeline`.

Baseline: `21a0ca5521f507c8c2b3264a7303155417c1cfdf`, `main` após RB-INC-164 e release correspondente em Production.

A validação humana em Production apontou que o Roteiro ainda não oferece a melhor experiência de uso. A implementação atual abre com conteúdo explicativo e uma jornada `Explorar → Salvos → Roteiro → Revisar`, repete o cabeçalho do Dia, expõe muitas ações de manutenção simultaneamente e separa o mapa da leitura principal.

Essa composição diverge da camada UX canônica. RB-UX-002 define `Consultar Roteiro` como seleção de Dia seguida de Atividades, Deslocamentos e ações contextuais. RB-UX-004 representa mobile como timeline simples com deslocamentos entre Atividades e menu `⋮`, e desktop como Dias + timeline + Mapa do Dia no mesmo contexto. RB-UX-005 exige que Atividade abra ações contextuais, reordenação mantenha alternativa acessível e Deslocamentos acompanhem mudanças do Roteiro.

## 2. Objetivo

Reduzir carga cognitiva e tornar o Roteiro uma superfície operacional do Dia, especialmente durante a viagem, sem alterar domínio, persistência, Providers ou políticas de decisão.

O usuário deve chegar rapidamente a:

- qual Dia está vendo;
- o que está planejado;
- qual é a sequência;
- quais deslocamentos existem entre as decisões;
- onde cada parada está no mapa;
- como editar o plano sem poluir a leitura principal.

## 3. Decisões

### 3.1 Timeline antes de processo

A página não reproduz a jornada `1. Explorar / 2. Salvos / 3. Roteiro / 4. Revisar`. A navegação contextual da Viagem entregue pelo RB-INC-161 já resolve alternância entre áreas.

O primeiro conteúdo operacional passa a ser o Dia selecionado, com resumo e timeline.

### 3.2 Dia como unidade visual principal

O seletor de Dias permanece navegável por URL e preserva a regra de `Hoje` do RB-INC-161. Seleção explícita continua tendo precedência.

O cabeçalho do Roteiro se torna compacto e evita repetir o mesmo contexto em hero, foco e card.

### 3.3 Timeline representa sequência canônica

Atividades permanecem na ordem canônica do Itinerary. Horário e duração são apresentados como contexto, sem criar ordenação paralela.

Deslocamentos disponíveis derivados do contexto espacial são apresentados entre etapas correspondentes. Quando indisponíveis, a interface não inventa distância.

Períodos livres continuam explícitos e não são interpretados como Atividades.

### 3.4 Manutenção fica contextual

Editar, mover, reordenar e remover continuam disponíveis por controles explícitos e acessíveis, porém agrupados em uma superfície contextual `⋮`/disclosure para não competir com título, horário e deslocamento.

A alternativa sem gesto permanece obrigatória. Arrastar não pode ser o único método; progressive enhancement de drag pode ser introduzido somente se preservar os contratos de servidor e acessibilidade.

### 3.5 Timeline e Mapa pertencem ao mesmo contexto

No desktop, timeline e mapa do Dia compartilham a mesma composição visual. No mobile, a timeline vem primeiro e o mapa permanece complementar, evitando empurrar o plano principal para baixo.

O painel espacial pode ocultar explicações repetitivas quando renderizado no Roteiro operacional, mas preserva disclosures de estimativa, estados indisponíveis e rotas externas.

### 3.6 Proposta e Revisão são secundárias

Gerar/ver Proposta e Revisar conflitos permanecem acessíveis no cabeçalho compacto do Roteiro, sem estruturar a leitura como um wizard linear.

## 4. Escopo

- cabeçalho operacional compacto do Roteiro;
- remoção da jornada 1/2/3/4 redundante;
- seletor de Dias prioritário;
- timeline visual do Dia baseada na ordem canônica;
- deslocamentos geográficos apresentados entre etapas quando disponíveis;
- contexto de Place vinculado à Activity quando já disponível no catálogo publicado;
- agrupamento contextual das ações de Activity;
- composição responsiva timeline + mapa;
- modo compacto do painel espacial dentro do Roteiro;
- estados vazios orientados a ação;
- regressão E2E da hierarquia, seleção de Dia, manutenção, mapa e Período livre afetado pela nova composição;
- documentação, Context Pack e Registry.

## 5. Fora de escopo

- alterar domínio de Itinerary, Activity ou Free Period;
- alterar invariantes, conflitos ou Proposal;
- criar Activity por leitura ou navegação;
- persistir estado visual do Roteiro;
- novo Provider, SDK, API paga, secret ou migration;
- cálculo interno de rota rodoviária, trânsito ou tempo real;
- Google Places Photos;
- redesign de Lugares, Salvos ou Guia;
- fechar M8;
- Production antes de aceite funcional explícito em Preview.

## 6. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/roteiro/itinerary-journey.module.css
apps/web/app/viagens/[tripId]/roteiro/itinerary-spatial-panel.tsx
apps/web/app/viagens/[tripId]/roteiro/itinerary-spatial-panel.module.css
apps/web/e2e/itinerary.spec.ts
apps/web/e2e/active-trip-experience.spec.ts
apps/web/e2e/free-period.spec.ts
docs/implementation/increments/rb-inc-165-itinerary-daily-timeline.md
docs/implementation/context-packs/rb-inc-165-itinerary-daily-timeline.md
docs/registry.md
.github/workflows/rb-inc-165-assembly-helper.yml
```

O workflow `rb-inc-165-assembly-helper.yml` é uma exceção operacional temporária autorizada apenas para montagem mecânica da branch: inserir RB-165/CTX-165 no Registry, aplicar ajustes locais de microcopy/E2E já definidos pelo incremento, executar Prettier nos arquivos tocados, remover a si próprio e criar o commit resultante. Ele não pode alterar domínio, migrations, Providers, secrets, Production ou workflows canônicos e não pode permanecer no diff final.

Arquivo adicional indispensável exige atualização explícita desta seção e justificativa na PR antes da alteração.

## 7. Critérios de aceite

- [ ] viewport inicial prioriza Dia selecionado e timeline, não explicação de processo;
- [ ] jornada 1/2/3/4 não compete mais com a navegação contextual da Viagem;
- [ ] seletor de Dias permanece claro, navegável e identifica `Hoje` textualmente;
- [ ] timeline apresenta Atividades na ordem canônica com horário e duração legíveis;
- [ ] deslocamentos disponíveis aparecem entre as etapas correspondentes;
- [ ] ausência de coordenada não produz distância inventada;
- [ ] Activity vinculada a Place pode abrir seu contexto sem perder o Dia selecionado;
- [ ] editar, mover, reordenar e remover permanecem acessíveis em menu/disclosure contextual;
- [ ] desktop apresenta timeline e mapa no mesmo contexto visual;
- [ ] mobile prioriza timeline e reduz competição de controles;
- [ ] estado vazio oferece Explorar, Salvos e criação manual sem penalizar Dia livre;
- [ ] Proposta e Revisão permanecem disponíveis como ações secundárias;
- [ ] Período livre continua editável/removível e o teste valida o redirect Server Action e o estado persistido sem depender da estrutura antiga do card;
- [ ] nenhum novo estado de domínio, migration, Provider ou secret;
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] Preview Vercel READY do mesmo SHA recebe aceite funcional antes de merge.

## 8. Testes obrigatórios

- E2E comprova que o Dia/timeline aparece antes de conteúdo geográfico secundário;
- E2E comprova ausência da jornada redundante 1/2/3/4;
- E2E comprova seleção explícita de Dia e marcador `Hoje` existente;
- E2E comprova ações editar, mover, reordenar e remover acessíveis pelo menu contextual;
- E2E comprova deslocamento apresentado entre Atividades quando disponível;
- E2E comprova mapa contextual do mesmo Dia;
- E2E de Free Period valida resposta de Server Action + persistência sem acoplamento ao markup removido;
- regressões de Proposal, Free Period e Place Actions permanecem verdes;
- `node scripts/validate-docs.mjs`;
- `pnpm format:check`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- Playwright aplicável.

## 9. Riscos e mitigação

- **ocultar ações demais:** disclosure mantém rótulo acessível e alternativa sem gesto;
- **confundir ordem visual e horário:** ordem canônica continua autoridade, horário é contexto;
- **mapa dominar mobile:** composição mobile mantém timeline antes do mapa;
- **distância parecer rota real:** texto continua qualificando distância como geodésica/estimada e rota real permanece externa;
- **regressão de Dia atual:** helper do RB-INC-161 permanece inalterado e E2E cobre precedência de `dia`;
- **Place não estar mais publicado:** timeline continua textual sem link ou contexto inventado.

## 10. Rollback

Reverter o incremento restaura a composição visual anterior. Não existe migration, Provider, secret, schema ou dado persistido novo para desfazer.

## 11. Evidência de montagem

A montagem inicial foi concluída na PR `#387`. O helper transitório aplicou o Registry, alinhou os E2E ao menu contextual e foi removido da branch. A primeira Engineering Validation (`#1808`) identificou exclusivamente divergência de Prettier em `page.tsx` e `itinerary.spec.ts`; o formatter oficial do repositório foi aplicado aos dois arquivos no commit `5e6cf8bbcd47a0c29c506016a0f369c8dbbe6012`, novamente com remoção do helper no mesmo ciclo.

No candidato `958020b0079ea0bd12986dcb85cb279d0ecc4351`, formatação, docs, lint, typecheck, políticas, migrations, testes de domínio/componentes, Overture, imagens, smoke e build passaram. O Playwright expôs duas expectativas antigas de `free-period.spec.ts`: uma dependia de `header small` removido pela nova hierarquia e outra dependia da navegação automática do Server Action, embora o contrato `x-action-redirect` e a persistência continuassem válidos. O arquivo foi incluído explicitamente no escopo para alinhar a regressão ao contrato real, sem alterar domínio ou action.