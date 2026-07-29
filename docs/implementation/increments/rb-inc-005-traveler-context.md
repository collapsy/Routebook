---
id: RB-INC-005
title: Contexto Progressivo da Viagem
description: Ativa o agregado TravelerProfile para configurar viajantes, interesses, ritmo, transporte e orçamento.
document_type: implementation-increment
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-07-28"
last_updated: "2026-07-28"
authors:
  - RouteBook Team
tags:
  - implementation
  - traveler-profile
  - preferences
  - budget
  - pace
  - persistence
related_documents:
  - RB-PRD-004
  - RB-DOM-001
  - RB-DOM-003
  - RB-ARC-004
  - RB-DATA-001
  - RB-DATA-002
  - RB-INC-004
prerequisites:
  - RB-INC-004
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-005 — Contexto Progressivo da Viagem

## Estado

`Draft`

O incremento permanece em elaboração até a aprovação dos checks documentais e de engenharia no PR associado à issue #13.

## Resultado vertical

Uma pessoa consegue configurar progressivamente o perfil dos viajantes de uma Viagem persistida, informando quantidade de pessoas, interesses do grupo, ritmo, transporte preferencial e orçamento total estimado em BRL. O contexto permanece disponível após recarregar e é resumido na visão inicial da Viagem.

## Decisão de domínio

Os dados não são adicionados à `Trip`. Eles pertencem ao agregado separado `TravelerProfile`, conforme o Modelo de Domínio. Participantes com acesso e Viajantes continuam conceitos distintos.

## Escopo

- adicionar `modules/traveler-profile`;
- modelar `TravelerProfile`, `Interest`, `Pace`, transporte preferencial e `Budget`;
- validar de 1 a 20 viajantes;
- limitar interesses ao catálogo inicial;
- manter orçamento opcional e associado a BRL;
- incrementar a versão do perfil a cada atualização;
- criar tabela `traveler_profiles` vinculada por `TripId`;
- adicionar migration versionada;
- implementar adapter Drizzle com upsert;
- criar rota `/viagens/[tripId]/contexto`;
- implementar Server Action e formulário acessível;
- exibir resumo do contexto na visão inicial;
- adicionar testes de domínio e E2E persistentes.

## Fora de escopo

- nomes e dados pessoais detalhados de viajantes;
- restrições de alimentação, mobilidade ou acessibilidade;
- preferências individuais;
- edição estrutural da `Trip`;
- catálogo de Lugares, mapa, Roteiro, recomendações e IA;
- autenticação.

## Invariantes

1. `TravelerProfile` possui identidade própria e referência a uma `Trip` existente;
2. existe no máximo um perfil por `TripId`;
3. a quantidade de viajantes fica entre 1 e 20;
4. interesses são opcionais e pertencem ao catálogo aceito;
5. ritmo é opcional e aceita `relaxed`, `balanced` ou `intense`;
6. transporte é opcional;
7. ausência de orçamento não significa zero;
8. orçamento informado é positivo, estimado e possui moeda BRL;
9. atualização incrementa a versão do perfil;
10. exclusão da `Trip` remove o perfil associado por integridade referencial.

## Critérios de aceite

- [ ] o perfil permanece separado da `Trip`;
- [ ] um contexto pode ser criado e atualizado;
- [ ] a configuração exige ao menos um viajante;
- [ ] orçamento ausente aparece como não informado;
- [ ] orçamento informado é formatado em reais;
- [ ] interesses, ritmo e transporte permanecem opcionais;
- [ ] o resumo aparece na visão inicial;
- [ ] os dados permanecem após recarregar;
- [ ] migration é aplicada no CI;
- [ ] testes passam em desktop e mobile;
- [ ] formatação, documentação, lint, typecheck e build passam.

## Rollback

O rollback exige reverter o PR e criar uma migration corretiva para remover `traveler_profiles` em ambientes compartilhados. Migrations já aplicadas não devem ser apagadas silenciosamente.

## Evidências

Serão preenchidas após os workflows definitivos da issue #13 e do PR correspondente.
