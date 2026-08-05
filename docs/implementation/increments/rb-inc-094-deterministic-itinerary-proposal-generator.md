---
id: RB-INC-094
title: Adapter Determinístico de Geração de Itinerary Proposal Ready
description: Publica uma porta interna e um adapter puro para gerar conteúdo revisável de Itinerary Proposal sem Provider externo.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-04"
last_updated: "2026-08-04"
authors:
  - RouteBook Team
tags:
  - implementation
  - itinerary-proposal
  - generation
  - deterministic
  - ports-and-adapters
related_documents:
  - RB-PRD-005
  - RB-PRD-006
  - RB-ARC-003
  - RB-INC-052
  - RB-INC-057
  - RB-INC-093
prerequisites:
  - RB-INC-093
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-094 — Adapter Determinístico de Geração de Itinerary Proposal Ready

## 1. Objetivo

Publicar uma porta interna de geração e um adapter determinístico simplificado que produza o conteúdo canônico necessário para concluir uma Itinerary Proposal de `generating` para `ready`, sem I/O externo, Provider de IA ou dependência da camada web.

Issue: #213.

Branch: `feature/rb-inc-094-deterministic-itinerary-proposal-generator`.

## 2. Contexto

O RouteBook já possui lifecycle, persistência, revisão, descarte, aceite integral, replay idempotente e validação E2E para Itinerary Proposal. Entretanto, uma Proposal `ready` ainda depende de fixtures ou chamadas internas que montam diretamente o conteúdo de conclusão.

A decisão registrada na issue #118 determinou que a geração deve ser exposta primeiro por um adapter determinístico, antes de qualquer Provider. O recorte também atende a versão simplificada prevista em RB-UC-022 e RB-FR-087 a RB-FR-096.

## 3. Resultado esperado

Dado um conjunto de Dias e candidatos normalizados, o adapter produz sempre uma saída equivalente e revisável:

- Dias ordenados canonicamente por data e identificador;
- candidatos preservados na ordem recebida;
- distribuição estável para o Dia menos carregado;
- novas Proposed Activities anexadas após as Atividades existentes;
- nenhuma hora de início inventada;
- duração conhecida preservada;
- duração desconhecida preenchida por política explícita de 90 minutos;
- limitações operacionais declaradas;
- validade de 24 horas a partir de `generatedAt`;
- conteúdo compatível com `completeItineraryProposalGeneration`.

## 4. Decisões

- `ItineraryProposalGenerationPort` recebe somente contratos internos.
- O adapter não importa banco, HTTP client, SDK, módulo web ou Provider.
- Datas e IDs são fornecidos pela chamada; não existe relógio ou UUID global oculto.
- O balanceamento considera a quantidade atual de Atividades e as atribuições feitas durante a geração.
- Empates mantêm a ordem canônica dos Dias.
- `proposedOrder` é zero-based e representa append após o conteúdo já existente.
- `proposedStartTime` permanece ausente.
- `flexibility` é `flexible`.
- Candidatos sem duração usam 90 minutos e geram limitação explícita.
- Geração sem candidatos é válida, vazia e explicada.
- Ausência de Dias, duplicidades e valores inválidos produzem erros estáveis.
- Nenhuma entrada recebida pode ser mutada.

## 5. Escopo

- contratos de Dia e candidato normalizados;
- porta interna de geração;
- adapter determinístico v1;
- política de distribuição, ordenação, duração e validade;
- validação e códigos de erro estáveis;
- exports públicos do módulo Proposal Management;
- testes unitários de determinismo, balanceamento, lifecycle e limites;
- documentação, Context Pack, registry e rastreabilidade.

## 6. Fora de escopo

- Server Action ou interface para solicitar geração;
- seleção produtiva de candidatos;
- composição com repositories;
- Provider de IA, prompt, modelo ou credencial;
- horários de funcionamento, rota, trânsito ou disponibilidade real;
- migration ou nova persistência;
- aplicação automática ao Itinerary;
- edição parcial da Proposal.

## 7. Critérios de aceite

- [ ] porta usa somente contratos internos;
- [ ] adapter não possui dependência externa ou I/O;
- [ ] mesma entrada e factories determinísticas produzem saída equivalente;
- [ ] Dias são ordenados canonicamente;
- [ ] candidatos são balanceados de forma estável;
- [ ] ordem recebida dos candidatos é preservada;
- [ ] `proposedOrder` permanece válido para aplicação posterior;
- [ ] duração conhecida é preservada;
- [ ] duração padrão é identificada nas limitações;
- [ ] nenhum horário é inventado;
- [ ] ausência de candidatos produz Proposal vazia e explicada;
- [ ] ausência de Dias e duplicidades são rejeitadas com códigos estáveis;
- [ ] entradas permanecem imutáveis;
- [ ] saída conclui o lifecycle canônico em `ready`;
- [ ] exports, registry, Context Pack e matriz estão atualizados;
- [ ] CI integral está verde.

## 8. Evidências

Implementação e validação em andamento na Draft PR do RB-INC-094. Os runs finais serão registrados após todos os gates verdes.
