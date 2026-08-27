---
id: RB-INC-169
title: Experiências diárias de Pipa — céu, horizonte e rolês confirmados
description: Adiciona ao Guia uma projeção temporal de lugares para observar Sol e Lua e de eventos confirmados, com Provenance, data explícita e planejamento humano no Roteiro.
document_type: implementation-increment
owner: Place Catalog and Trip Experience
status: Draft
version: "0.1.0"
created: "2026-08-27"
last_updated: "2026-08-27"
authors: [RouteBook Team]
tags: [implementation, pipa, daily-experience, events, sunset, moonrise, guide, provenance]
related_documents: [RB-CORE-0004, RB-INC-136, RB-INC-165, RB-INC-168, RB-CTX-169]
prerequisites: [RB-INC-165]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-169 — Experiências diárias de Pipa — céu, horizonte e rolês confirmados

## 1. Contexto

Issue: `#395`.

Branch: `codex/rb-inc-169-daily-experiences`.

Base de Preview: PR `#387` / RB-INC-165, SHA `379d356621f421c70a71a47cdc9b720b3c782860`.

O uso humano real em Pipa mostrou duas necessidades diferentes que não podem ser misturadas:

1. descobrir **lugares adequados para observar o Sol ou a Lua** numa data específica;
2. descobrir **rolês que realmente possuem programação confirmada** naquela data.

Um luau é evento e só deve aparecer quando houver evidência atual. Um mirante, praia ou lagoa pode ser recomendado para pôr do sol ou nascer da Lua sem que exista qualquer evento comercial no local.

## 2. Resultado vertical desta fase

Esta primeira fatia governada entrega no Guia de Pipa:

- seleção explícita de uma data da Viagem;
- horários de nascer do Sol, pôr do Sol e nascer da Lua para 22–29/08/2026;
- direção/azimute e iluminação lunar quando aplicável;
- Places canônicos sugeridos para observação, com motivo e nível de evidência;
- distância em linha reta a partir da hospedagem quando disponível;
- rota externa sem fingir cálculo próprio;
- agenda separada de **Rolês confirmados**;
- evento somente quando data, fonte e Place canônico correspondem;
- Provenance e data de coleta visíveis;
- CTA de planejamento que abre a Activity manual já preenchida no Dia correto, mas não grava nada sem confirmação humana;
- estado vazio explícito quando não há rolê confirmado.

Não é criado novo agregado persistente nem novo estado canônico.

## 3. Separação semântica obrigatória

### 3.1 Céu e horizonte

São recomendações contextuais de Place.

Exemplos:

- pôr do sol;
- nascer do sol;
- nascer da Lua.

A adequação pode ser:

- **curada**, quando há evidência editorial específica do uso do ponto para aquela experiência;
- **inferida pela geografia**, quando horizonte/orientação tornam o ponto plausível.

Inferência deve permanecer identificada como inferência.

### 3.2 Rolês confirmados

São ocorrências datadas e verificáveis.

Exemplos:

- festa;
- show;
- DJ;
- luau;
- sunset party.

Horário de funcionamento de um bar, histórico de programação ou review antigo não transforma o Place em evento do Dia.

## 4. Fontes desta fatia

### Astronomia

Fonte governada: Timeanddate para Pipa/Tibau do Sul, coletada em 27/08/2026.

A tabela do piloto cobre somente 22–29/08/2026. Fora dessas datas, a UI informa indisponibilidade em vez de extrapolar horário.

### Eventos

Eventos confirmados desta fatia:

- 28/08/2026 — **Nihanna · Mística Weekend**, Agora Club, fonte Sympla;
- 29/08/2026 — **PAGOFUNK**, Agora Club, fonte Sympla.

Em 27/08/2026 nenhum rolê foi encontrado com evidência governada suficiente nesta fatia; a UI deve exibir o estado vazio em vez de inventar programação.

## 5. Places de observação

### Horizonte leste / nascer do Sol e da Lua

- Chapadão de Pipa — adequação geoespacial inferida;
- Praia do Amor — adequação geoespacial inferida.

### Horizonte oeste / pôr do sol

- Lagoa de Guaraíras — ponto curado;
- Mirante Sunset Bar — ponto curado.

A classificação não cria atributo persistido em Place nesta fase.

## 6. Planejamento no Roteiro

O CTA não cria Activity silenciosamente.

O Guia envia apenas parâmetros de preenchimento:

- Dia;
- título;
- horário;
- duração sugerida.

O Roteiro:

1. valida os parâmetros;
2. abre o compositor manual;
3. mostra os valores pré-preenchidos;
4. exige que o usuário pressione **Adicionar ao roteiro**.

Isso preserva a regra constitucional de que Recomendação não é Decisão.

## 7. Escopo

- projeção temporal de Pipa para o período piloto;
- componente visual mobile-first;
- integração com Guia;
- integração de preenchimento seguro com Roteiro;
- testes unitários da projeção;
- E2E da separação evento/natureza e do handoff para Roteiro;
- documentação, Registry e rastreabilidade.

## 8. Fora de escopo

- novo agregado ou migration;
- persistir evento externo;
- scraping de redes sociais;
- ativar Google Places, Foursquare ou outro Provider;
- criar billing ou secret;
- previsão meteorológica live;
- usar cobertura de nuvens em runtime;
- ingestão automática/contínua de agenda;
- declarar cobertura completa de eventos em Pipa;
- tornar `sunset-friendly` ou `moonrise-friendly` atributo canônico;
- ranking visual do RB-INC-168;
- Production;
- concluir a issue #395 nesta primeira fatia.

## 9. Caminhos autorizados

```text
apps/web/lib/pipa-daily-experiences.ts
apps/web/lib/pipa-daily-experiences.test.ts
apps/web/components/pipa-daily-experiences.tsx
apps/web/components/pipa-daily-experiences.module.css
apps/web/app/viagens/[tripId]/guia/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/e2e/trip-day-guide.spec.ts
docs/implementation/increments/rb-inc-169-daily-experiences.md
docs/implementation/context-packs/rb-inc-169-daily-experiences.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

A alteração em Roteiro é limitada ao preenchimento validado do compositor manual já existente; não altera action, domínio nem persistência.

## 10. Critérios de aceite desta fatia

- [ ] Guia permite selecionar explicitamente a data da Viagem;
- [ ] Sol/Lua aparecem em superfície separada de Rolês;
- [ ] cada observação mostra horário e direção específicos da data;
- [ ] Place recomendado informa se a adequação é curada ou inferida;
- [ ] 27/08 não apresenta um evento fictício;
- [ ] 28/08 apresenta Nihanna/Mística apenas com fonte confirmada;
- [ ] 29/08 apresenta PAGOFUNK apenas com fonte confirmada;
- [ ] ausência de Place canônico impede a publicação do evento correspondente;
- [ ] fonte e data de coleta ficam visíveis;
- [ ] CTA abre o Dia correto do Roteiro e pré-preenche a Activity;
- [ ] nenhuma Activity é persistida sem confirmação do usuário;
- [ ] hospedagem geocodificada habilita distância e rota;
- [ ] ausência de cobertura astronômica não produz horário sintético;
- [ ] interface explicita que nuvens/condições atuais ainda precisam ser conferidas;
- [ ] experiência permanece utilizável em viewport mobile;
- [ ] Documentation e Engineering Validation passam no mesmo SHA;
- [ ] Vercel Preview fica READY no mesmo SHA antes do aceite funcional.

## 11. Riscos e mitigação

**Dado temporal envelhecer:** eventos têm data explícita e só são projetados para a data correspondente.

**Confundir inferência com fato:** pontos leste recebem rótulo de adequação geográfica inferida.

**Agenda parecer completa:** estado e documentação declaram que a fatia não é ingestão completa.

**Falsa precisão meteorológica:** não há score de clima nesta fase; a UI pede confirmação das condições.

**Escrever no Roteiro por sugestão:** CTA apenas preenche formulário; a action existente continua dependente de confirmação explícita.

## 12. Dependência e merge

A branch está empilhada sobre o RB-INC-165 porque usa a nova superfície de Roteiro para o handoff de planejamento.

Enquanto a PR #387 permanecer no gate de aceite humano:

- RB-INC-169 pode ser validado em Preview;
- não deve ser integrado em `main` de forma a contornar o gate do RB-INC-165;
- a issue #395 permanece aberta para fases posteriores de cobertura dinâmica, clima e fontes de eventos.
