---
id: RB-INC-157
title: Catálogo progressivo e jornada clara de criação do roteiro
description: Amplia progressivamente a descoberta externa e reorganiza o Roteiro em uma jornada orientada por Dia, preservando estado canônico e ações explícitas.
document_type: implementation-increment
owner: Traveler Experience and Place Catalog
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, pipa, discovery, itinerary, ux, map]
related_documents: [RB-CORE-0004, RB-UX-002, RB-INC-155, RB-INC-156, RB-CTX-157]
prerequisites: [RB-INC-155, RB-INC-156]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-157 — Catálogo progressivo e jornada clara de criação do roteiro

## 1. Contexto

Issue: `#363`.

Branch: `codex/rb-inc-157-progressive-catalog-itinerary-journey`.

Baseline empilhada: `932b806dca0343b10c033509930c4700e69939bd`, preview do RB-INC-156.

A validação autenticada do preview mostrou duas fricções ainda relevantes antes da viagem:

1. a descoberta consulta uma janela governada de até 200 candidatos, porém apresenta no máximo 60 novos; mesmo quando existem mais candidatos reconciliados, a interface não oferece continuação explícita;
2. a entrada do Roteiro apresenta mapa, oito dias, proposta, revisão, criação manual e Período livre simultaneamente. O estado vazio não orienta o próximo passo e o mapa aparece antes do contexto do Dia que ele representa.

O RB-UF-002 determina que uma Viagem futura priorize próximo passo, Roteiro e Salvos. O RB-UF-004 admite Dia vazio como entrada para Explorar, e os princípios de fluxo exigem que estados vazios orientem a próxima ação.

## 2. Objetivo

Entregar duas melhorias coordenadas de experiência sem alterar domínio:

- permitir expansão progressiva das descobertas externas além da janela inicial, mantendo contagens honestas e lista/mapa sincronizados;
- transformar o Roteiro numa jornada orientada por um único Dia em foco, com contexto espacial associado à seleção e ações secundárias menos concorrentes.

## 3. Decisões

### 3.1 Descoberta progressiva

A consulta Overture continua limitada a 200 candidatos e a reconciliação continua precedendo a apresentação.

A tela:

- começa com até 60 candidatos externos novos;
- informa quantas opções estão exibidas e quantas estão disponíveis na consulta governada;
- oferece ação explícita para mostrar todos os candidatos novos já obtidos nessa consulta;
- permite retornar à janela inicial;
- aplica busca, categoria, distância e ocultação da fonte antes de formar a janela visível;
- mantém o mapa sincronizado somente com os itens efetivamente exibidos.

Expandir a leitura não publica, salva, promove nem adiciona candidato ao Roteiro.

### 3.2 Jornada do Roteiro

A tela do Roteiro passa a comunicar uma sequência familiar:

`Explorar → Salvos → Roteiro → Revisar`.

Um único Dia fica em foco por vez. A seleção do Dia governa:

- resumo e estado vazio;
- Atividades e Períodos livres exibidos;
- mapa e contexto geográfico;
- formulário manual quando aberto;
- Dia padrão do compositor de Período livre.

Quando o Dia estiver vazio, a primeira ação recomendada é Explorar Lugares; Salvos aparece como alternativa. Criação manual e Período livre continuam disponíveis como ações explícitas, porém secundárias e recolhidas.

O mapa deixa de anteceder toda a página e passa a aparecer depois do contexto do Dia selecionado.

### 3.3 Persistência da seleção

Mutations do Roteiro devem redirecionar de volta ao Dia relevante sempre que esse Dia puder ser determinado de forma canônica pela própria operação.

## 4. Escopo

- janela progressiva de descoberta e contagens exibido/disponível;
- preservação de filtros e alternância da fonte ao expandir/recolher;
- jornada contextual Explorar/Salvos/Roteiro/Revisar;
- seletor de Dia como foco principal;
- mapa contextual reposicionado dentro da página do Roteiro;
- estado vazio com próximo passo claro;
- criação manual e Período livre como ações secundárias;
- redirects de mutations preservando Dia relevante;
- regressões unitárias/E2E necessárias;
- documentação e Registry.

## 5. Fora de escopo

- novo Provider, API paga, migration ou secret;
- alterar raio, taxonomia, reconciliação ou confiança Overture;
- carregar mais de 200 candidatos por leitura;
- infinite scroll ou paginação remota;
- publicar/salvar candidato externo por leitura;
- converter Saved Place em Atividade automaticamente;
- autoaplicar Itinerary Proposal;
- alterar linguagem de domínio ou ADR;
- merge ou promoção para Production sem autorização humana separada.

## 6. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/roteiro/layout.tsx
apps/web/app/viagens/[tripId]/roteiro/actions.ts
apps/web/app/viagens/[tripId]/roteiro/free-periods.tsx
apps/web/app/viagens/[tripId]/roteiro/itinerary-spatial-panel.tsx
apps/web/app/viagens/[tripId]/roteiro/itinerary-journey.module.css
apps/web/e2e/free-period.spec.ts
apps/web/e2e/place-discovery-filters.spec.ts
apps/web/e2e/itinerary.spec.ts
apps/web/e2e/itinerary-spatial.spec.ts
docs/implementation/increments/rb-inc-157-progressive-catalog-itinerary-journey.md
docs/implementation/context-packs/rb-inc-157-progressive-catalog-itinerary-journey.md
docs/registry.md
```

`free-periods.tsx` foi incluído porque o compositor precisa receber o Dia em foco como seleção padrão; sem isso, a própria ação secundária poderia voltar a criar conteúdo no Dia 1 por padrão e quebrar o contrato de contexto preservado. `free-period.spec.ts` foi incluído porque a mudança de um grid de oito Dias para um único Dia em foco altera deliberadamente os seletores E2E dessa capacidade e exige regressão equivalente.

Arquivo adicional indispensável exige atualização explícita desta seção e justificativa na PR.

## 7. Critérios de aceite

- [ ] descoberta informa quantidade exibida e quantidade disponível quando houver candidatos além da janela inicial;
- [ ] ação de expansão mostra todos os candidatos novos já reconciliados dentro da consulta governada;
- [ ] ação de recolher restaura a janela inicial;
- [ ] filtros, ocultação da fonte, promoção explícita e mapa permanecem coerentes com a janela visível;
- [ ] nenhum candidato externo muda de estado por leitura;
- [ ] Roteiro comunica Explorar → Salvos → Roteiro → Revisar;
- [ ] um único Dia fica em foco por vez;
- [ ] mapa e contexto textual correspondem ao Dia em foco;
- [ ] Dia vazio orienta Explorar como próximo passo e oferece Salvos como alternativa;
- [ ] criação manual e Período livre permanecem acessíveis sem competir com o próximo passo principal;
- [ ] mutations retornam ao Dia relevante quando determinável;
- [ ] comportamento permanece utilizável e acessível em desktop e mobile;
- [ ] documentação e CI passam no mesmo SHA.

## 8. Testes obrigatórios

- E2E de Discovery comprova janela inicial, expansão e sincronização da lista com o mapa;
- E2E do Roteiro comprova foco em um Dia, estado vazio orientado e ações secundárias;
- E2E espacial comprova que seleção do Dia governa o mapa e a alternativa textual;
- regressões de criação, edição, movimento, reordenação, remoção e Período livre continuam verdes;
- `node scripts/validate-docs.mjs`;
- `pnpm format:check`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- Playwright aplicável.

## 9. Riscos e mitigação

- **lista longa:** expansão é opt-in e a janela inicial permanece limitada;
- **confusão canônica:** badges e Provenance do RB-INC-156 permanecem;
- **perda de contexto:** seleção de Dia é codificada em query string e reutilizada pelo mapa;
- **ações avançadas escondidas demais:** criação manual e Período livre continuam semanticamente nomeadas e acessíveis por `details`;
- **regressão de edição:** mutations e E2E existentes continuam obrigatórios.

## 10. Rollback

Reverter o incremento restaura a janela fixa de 60 descobertas e a apresentação anterior do Roteiro. Não há migration, DML, Provider ou estado externo para desfazer.
