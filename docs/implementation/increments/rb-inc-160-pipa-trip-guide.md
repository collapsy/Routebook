---
id: RB-INC-160
title: Guia diário completo da viagem de Pipa
description: Expande o roteiro-base editorial de Pipa para todos os Dias reais da Viagem, com mapa, informação prática, rotas externas e entrada explícita no planejamento.
document_type: implementation-increment
owner: Traveler Experience and Place Catalog
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, pipa, guide, itinerary, map, mobile]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-UX-002, RB-INC-155, RB-INC-157, RB-INC-159, RB-CTX-160]
prerequisites: [RB-INC-155, RB-INC-157, RB-INC-159]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-160 — Guia diário completo da viagem de Pipa

## 1. Contexto

Issue: `#369`.

Branch: `codex/rb-inc-160-pipa-trip-guide`.

Baseline empilhada: `1ea3707f2e8410827be9df26e4e116c828a3f742`, head validado do RB-INC-159.

O RB-INC-155 entregou uma primeira experiência editorial visual para o primeiro Dia em Pipa. A auditoria pré-viagem mostrou que os Dias restantes ainda apareciam apenas como estrutura genérica, obrigando o viajante a montar mentalmente a sequência entre catálogo, mapa, orientação prática e Roteiro.

O RB-INC-159 reduz a fricção de planejamento ao permitir que um Place publicado seja adicionado explicitamente a um Dia sem fundir Saved Place e Activity. Este incremento usa essa entrada como CTA do Guia, sem persistir a sugestão editorial.

## 2. Objetivo

Entregar uma superfície dedicada `Guia da viagem` que cubra todos os Dias reais de uma viagem de Pipa no piloto de até oito Dias e permita ao viajante:

- compreender rapidamente o tema e o ritmo de cada Dia;
- consultar de duas a três paradas editoriais coerentes por Dia;
- ver mapa e lista na mesma sequência;
- consultar duração, melhor janela e alerta rastreável de cada Place;
- comparar distância geodésica da hospedagem quando disponível;
- abrir rota individual e sequência do Dia no Google Maps para cálculo atual;
- abrir Detalhes e o compositor do RB-INC-159 já contextualizado no Dia sugerido;
- distinguir claramente sugestão editorial de Roteiro persistido.

## 3. Decisões

- `Guia da viagem` é uma rota dedicada da Viagem; a Visão Geral exibe somente uma entrada compacta para evitar uma página interminável;
- o programa editorial possui até oito perfis de Dia e usa apenas Places publicados com Practical Guides já existentes;
- viagens menores exibem somente seus Dias reais; o último Dia real usa o perfil leve de despedida;
- primeiro e último Dia têm carga menor e copy compatível com chegada/saída;
- cada Dia possui sua própria sequência e seu próprio mapa, com a mesma numeração;
- o mapa compartilhado reage a mudanças de tamanho/visibilidade para continuar íntegro quando um Dia colapsado é aberto;
- distância interna continua exclusivamente geodésica e rotulada como `em linha reta`;
- rota e tempo atuais continuam sendo calculados apenas quando o usuário abre o Google Maps;
- o CTA de planejamento abre Detalhes em `#adicionar-ao-roteiro` com o Dia sugerido na query string;
- leitura do Guia não cria Saved Place, Activity, Recommendation, Decision ou Proposal;
- se um Place editorial deixar de estar publicado ou perder Practical Guide, o Dia incompleto não é apresentado como se estivesse íntegro.

## 4. Escopo

- rota dedicada `/viagens/[tripId]/guia`;
- entrada proeminente e compacta na Visão da viagem;
- cobertura editorial dos Dias reais do piloto de Pipa, até oito Dias;
- visão compacta dos Dias e temas;
- duas a três paradas coerentes por Dia;
- imagens governadas ou fallback existente;
- razão editorial, período, horário sugerido, duração, melhor encaixe e alerta rastreável;
- distância da hospedagem em linha reta quando houver coordenada;
- rota individual e sequência de cada Dia no Google Maps;
- CTA para Detalhes/Adicionar ao Roteiro contextualizado no Dia;
- hardening de redimensionamento do mapa compartilhado para superfícies colapsáveis;
- regressão unitária e E2E para oito Dias e viagem curta;
- documentação e Registry.

## 5. Fora de escopo

- criar ou publicar novos Places;
- persistir o Guia como Activity ou Itinerary;
- autoaplicar Recommendation, Decision ou Proposal;
- novo Provider, API paga, SDK, secret ou migration;
- cálculo interno de rota por ruas, trânsito ou tempo;
- horários, preços, eventos, maré, clima ou disponibilidade em tempo real;
- promoção para Production;
- merge sem autorização humana separada.

## 6. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/guia/page.tsx
apps/web/components/trip-day-guide.tsx
apps/web/components/trip-day-guide.module.css
apps/web/components/trip-map.tsx
apps/web/lib/pipa-day-guide.ts
apps/web/lib/pipa-day-guide.test.ts
apps/web/e2e/trip-day-guide.spec.ts
docs/implementation/increments/rb-inc-160-pipa-trip-guide.md
docs/implementation/context-packs/rb-inc-160-pipa-trip-guide.md
docs/registry.md
```

Arquivo adicional exige atualização explícita desta seção e justificativa na PR.

## 7. Critérios de aceite

- [ ] a Visão da viagem oferece entrada clara para `Guia da viagem` sem renderizar todos os Dias na home;
- [ ] uma viagem Pipa de oito Dias apresenta oito Dias editoriais, na ordem temporal real;
- [ ] cada Dia apresenta de duas a três paradas publicadas com Practical Guide existente;
- [ ] primeiro e último Dia são deliberadamente mais leves;
- [ ] viagem menor não inventa Dias ausentes;
- [ ] mapa e lista de cada Dia usam a mesma sequência;
- [ ] mapas permanecem utilizáveis ao abrir Dias inicialmente colapsados;
- [ ] imagem curada e fallback preservam a semântica existente;
- [ ] distância é rotulada como linha reta e não como rota ou tempo;
- [ ] rota individual e sequência abrem no Google Maps quando existe hospedagem geocodificada;
- [ ] ausência de coordenadas degrada sem inventar deslocamento;
- [ ] CTA de cada Place abre Detalhes com o Dia sugerido e o compositor `Adicionar ao roteiro`;
- [ ] a interface declara que o Guia é editorial e não altera o Roteiro automaticamente;
- [ ] leitura do Guia não persiste estado de planejamento;
- [ ] desktop, mobile e acessibilidade básica permanecem utilizáveis;
- [ ] CI completa passa no mesmo SHA e Preview Vercel correspondente fica READY.

## 8. Testes obrigatórios

- unitário cobre os oito perfis editoriais, ordem e Practical Guides;
- unitário cobre truncamento para viagem curta e perfil leve do último Dia;
- unitário cobre distância/rotas com hospedagem e degradação sem coordenadas;
- unitário cobre falha honesta quando falta Place canônico necessário;
- E2E cobre entrada do Guia na Visão da viagem;
- E2E cobre oito Dias, sequência, mapas, imagens, rotas e CTA contextualizado;
- E2E cobre viagem curta sem Dias inventados;
- E2E cobre ausência de hospedagem geocodificada;
- regressão mobile do fluxo principal;
- `node scripts/validate-docs.mjs`;
- `pnpm format:check`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- Playwright aplicável.

## 9. Riscos e mitigação

- **Guia parecer Roteiro aplicado:** disclosure explícito e ausência de qualquer mutation na leitura;
- **home da Viagem ficar longa:** somente teaser/CTA permanece na Visão Geral;
- **excesso de conteúdo mobile:** Dias são agrupados em blocos colapsáveis com visão geral navegável;
- **mapa inicializado enquanto o Dia está oculto:** `TripMap` invalida o tamanho quando o container volta a ter dimensões visíveis;
- **sequência editorial parecer rota calculada:** mapa declara que linhas não representam rota e Google Maps concentra cálculo atual;
- **conteúdo operacional ficar desatualizado:** alertas vêm dos Practical Guides versionados e mantêm confirmação no dia;
- **Place editorial indisponível:** o builder não publica Dia parcial como se estivesse completo.

## 10. Rollback

Reverter o incremento remove a rota dedicada e restaura o guia de primeiro Dia da Visão da viagem. Não existe migration, Provider, secret ou estado externo a desfazer.
