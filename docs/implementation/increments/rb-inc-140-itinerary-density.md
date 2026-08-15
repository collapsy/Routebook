---
id: RB-INC-140
title: Densidade Útil do Roteiro e Itinerary Proposals
description: Torna a geração determinística de Itinerary Proposal consciente de densidade diária e Free Periods para reduzir subpreenchimento sem sobreplanejar.
document_type: implementation-increment
owner: Proposal Management and Data
status: Draft
version: "0.1.0"
created: "2026-08-15"
last_updated: "2026-08-15"
authors: [RouteBook Team]
tags: [implementation, itinerary, proposal-management, density, free-period, m8]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-DOM-003, RB-INC-094, RB-INC-096, RB-INC-098, RB-INC-131, RB-INC-136, RB-INC-139]
prerequisites: [RB-INC-094, RB-INC-096, RB-INC-098, RB-INC-131]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-140 — Densidade Útil do Roteiro e Itinerary Proposals

## 1. Objetivo

Fortalecer a geração determinística de Itinerary Proposal para produzir uma densidade diária útil quando existem candidatos elegíveis, distinguindo subpreenchimento de espaço livre intencional e protegendo contra sobreplanejamento.

Issue: #327.

Branch: `codex/rb-inc-140-itinerary-density`.

Relação com M8: backlog pré-validação vinculado a #319; nenhuma evidência técnica deste incremento valida hipótese humana do M8.

## 2. Problema observado

A política `deterministic-candidate-balancing` v1 conhece somente a quantidade de Activities de cada Dia. Ela não recebe Free Periods e distribui todos os candidatos recebidos para o Dia menos carregado, sem uma meta ou teto explícito de densidade.

Isso cria dois riscos opostos:

- um Dia vazio intencionalmente, protegido pelo usuário, pode ser tratado como simples subpreenchimento;
- um conjunto grande de candidatos pode gerar uma Proposal excessivamente carregada.

Ao mesmo tempo, quando existem poucos candidatos elegíveis, o sistema não deve inventar Activities apenas para preencher o Roteiro.

## 3. Autoridade canônica

Este incremento aplica regras já existentes; não cria novos conceitos de Domain:

- RB-BR-ITN-005: Dia vazio é válido e representa planejamento incompleto, não erro;
- RB-BR-ITN-017: Free Period `protected` não pode receber Proposed Activity automaticamente;
- RB-BR-ITN-018: Free Period `flexible` pode receber sugestões em Itinerary Proposal;
- RB-BR-DAT-002: informação desconhecida não recebe valor falso;
- Bible: o usuário pode manter períodos livres sem ser penalizado pelo sistema;
- Proposal permanece isolada até aceitação explícita.

## 4. Política determinística v2

### 4.1 Contexto conhecido de Free Periods

Quando todos os Dias possuem contagens autoritativas de Free Periods:

1. a meta de densidade é até **3 Activities por Dia elegível**;
2. cada Free Period `protected` consome uma unidade conservadora da capacidade diária;
3. Free Period `flexible` não bloqueia o Dia para sugestões;
4. Dia sem Activities, com ao menos um Free Period `protected` e nenhum `flexible`, é tratado como vazio intencional e não recebe Proposed Activity;
5. candidatos permanecem na ordem recebida;
6. cada candidato é atribuído ao Dia elegível com menor ocupação efetiva;
7. empates usam a ordem canônica dos Dias;
8. quando todos os Dias elegíveis atingem a meta, candidatos restantes não são propostos;
9. quando faltam candidatos, os Dias restantes permanecem subpreenchidos sem fabricação de conteúdo.

A ocupação efetiva é a soma de Activities existentes, Proposed Activities já distribuídas nesta geração e Free Periods `protected`.

### 4.2 Contexto de Free Periods desconhecido

Se a entrada interna não fornece contexto de Free Periods, o adapter não assume zero. Ele preserva o balanceamento legado por quantidade de Activities e registra Limitation explícita de que a proteção de densidade não pôde classificar espaço livre intencional.

O fluxo autoritativo PostgreSQL deste incremento passa a fornecer o contexto conhecido.

### 4.3 Temporalidade

A política não inventa `proposedStartTime` nem afirma distribuição por manhã, tarde ou noite sem evidência temporal suficiente. Distribuição por período só é aplicável quando contratos futuros fornecerem âncoras temporais compatíveis; este incremento não cria falsa precisão.

## 5. Escopo

- carregar Free Periods no snapshot autoritativo da geração;
- normalizar contagens `protected` e `flexible` no assembler;
- aplicar política v2 de densidade no adapter determinístico;
- preservar fallback quando o contexto de Free Periods estiver indisponível em chamadas internas legadas;
- limitar sobreplanejamento e explicar candidatos não propostos;
- manter determinismo e ordem canônica;
- atualizar versão de geração para `2`;
- cobrir subpreenchimento, vazio intencional, Free Period flexible e proteção contra excesso;
- comprovar o fluxo PostgreSQL e E2E;
- atualizar Increment, Context Pack, Registry e matriz de rastreabilidade.

## 6. Fora de escopo

- Provider de IA ou geração não determinística;
- criar Recommendations ou Places fictícios para atingir densidade;
- horários de funcionamento, disponibilidade real, trânsito ou rota;
- inventar manhã, tarde ou noite para candidatos sem evidência temporal;
- preencher todos os minutos do Dia;
- remover Free Period automaticamente;
- alterar Domain, linguagem ubíqua ou invariantes;
- migration ou mudança de schema;
- mudanças no catálogo de Pipa;
- declarar conclusão de hipótese do M8.

## 7. Caminhos permitidos

```text
modules/proposal-management/src/deterministic-itinerary-proposal-generator.ts
modules/proposal-management/src/deterministic-itinerary-proposal-generator.test.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.ts
modules/proposal-management/src/itinerary-proposal-generation-input-assembler.test.ts
packages/database/src/authoritative-itinerary-proposal-generation-context.ts
packages/database/src/authoritative-itinerary-proposal-generation-context-postgres.test.ts
apps/web/e2e/itinerary-proposal-generation.spec.ts
docs/implementation/increments/rb-inc-140-itinerary-density.md
docs/implementation/context-packs/rb-inc-140-itinerary-density.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Arquivo adicional só pode ser alterado se indispensável e deve ser registrado no Context Pack e na PR.

## 8. Critérios de aceite

- [ ] Dia vazio intencional é distinguido de Dia apenas subpreenchido;
- [ ] com candidatos compatíveis e capacidade disponível, Dias elegíveis recebem Activities até a meta documentada;
- [ ] Free Period `protected` é preservado e reduz capacidade da geração;
- [ ] Free Period `flexible` não bloqueia sugestões;
- [ ] ausência de contexto de Free Periods não é interpretada silenciosamente como zero;
- [ ] candidatos insuficientes não geram conteúdo inventado;
- [ ] candidatos excedentes não provocam sobreplanejamento acima da meta;
- [ ] mesma entrada produz saída equivalente;
- [ ] nenhum horário de início é inventado;
- [ ] geração v2 permanece compatível com lifecycle e aplicação existentes;
- [ ] PostgreSQL fornece snapshot de Free Periods sem migration;
- [ ] E2E comprova densidade e preservação do Itinerary antes da aceitação;
- [ ] Registry e matriz estão atualizados;
- [ ] Documentation Validation e Engineering Validation ficam verdes no mesmo SHA.

## 9. Testes obrigatórios

- adapter: Dia subpreenchido recebe candidatos até a meta;
- adapter: Dia vazio protegido permanece sem propostas;
- adapter: Free Period flexible continua elegível para sugestão;
- adapter: candidatos excedentes são omitidos com Limitation explícita;
- adapter: candidatos insuficientes não são fabricados;
- adapter: fallback sem contexto de Free Periods é determinístico e explicado;
- assembler: deriva contagens protected/flexible e valida modos;
- PostgreSQL: carrega Free Periods autoritativos;
- E2E: geração v2 e isolamento da Proposal;
- format, docs, lint, typecheck, migration policy, migrations, testes, smoke, build e Playwright.

## 10. Rollback

Reverter adapter, assembler, leitura autoritativa, testes e documentação. Não existe migration, alteração de schema ou mutação de dados de Production associada ao incremento.

## 11. Riscos

- contagem diária é uma heurística explícita, não uma afirmação de viabilidade temporal;
- Free Period sem horário não permite saber qual parte do Dia está protegida; por isso sua presença reduz capacidade conservadoramente;
- o sistema continua limitado ao conjunto de Recommendations elegíveis recebido; não fabrica candidatos para completar a meta.
