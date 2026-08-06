---
id: RB-CTX-094
title: Context Pack do RB-INC-094
description: Contexto operacional para implementar e validar o adapter determinístico de geração de Itinerary Proposal ready.
document_type: context-pack
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-04"
last_updated: "2026-08-05"
authors:
  - RouteBook Team
tags:
  - context-pack
  - implementation
  - itinerary-proposal
  - deterministic-generation
related_documents:
  - RB-INC-094
  - RB-ARC-003
  - RB-PRD-005
  - RB-PRD-006
prerequisites:
  - RB-INC-093
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-094 — Adapter Determinístico de Geração de Itinerary Proposal Ready

## 1. Contexto operacional

Implementar a primeira fronteira interna de geração de Itinerary Proposal sem Provider externo. O resultado deve ser puro, reproduzível e compatível com o lifecycle existente de Proposal Management.

O incremento não solicita uma Proposal pela web, não consulta repositories e não seleciona candidatos produtivos. Ele publica a capacidade reutilizável que essas integrações consumirão posteriormente.

## 2. Escopo

- `ItineraryProposalGenerationPort`;
- contratos internos de Dia e candidato;
- `DeterministicItineraryProposalGenerator`;
- política v1 de balanceamento e append;
- ordenação lexicográfica estável e independente de locale;
- validações e erros estáveis;
- saída `CompleteItineraryProposalGenerationInput`;
- testes unitários e lifecycle `generating → ready`;
- exports e governança documental.

## 3. Fora de escopo

- banco de dados ou migrations;
- Server Actions, React ou Next.js;
- autenticação e autorização;
- Provider de IA ou integração HTTP;
- seleção de Recommendations, Saved Places ou Places;
- cálculo geográfico ou temporal real;
- aplicação da Proposal ao Itinerary.

## 4. Sequência de execução

1. Normalizar e validar Dias, incluindo existência real da data `YYYY-MM-DD`.
2. Ordenar Dias por data e identificador com comparação lexicográfica independente de locale.
3. Normalizar candidatos preservando a ordem recebida.
4. Rejeitar identificadores duplicados de Dia e candidato.
5. Atribuir cada candidato ao Dia menos carregado.
6. Calcular `proposedOrder` a partir do conteúdo existente e das atribuições anteriores.
7. Criar Proposed Activities com IDs injetados, válidos e únicos, sem horário inventado.
8. Registrar critérios, justificativas e limitações.
9. Derivar `validUntil` de `generatedAt` pela política de 24 horas e rejeitar overflow temporal.
10. Retornar conteúdo compatível com o lifecycle canônico.

## 5. Testes mínimos

- resultado determinístico para entrada equivalente;
- ordenação canônica de Dias independente de locale;
- balanceamento e desempate estáveis;
- append zero-based após Atividades existentes;
- preservação de duração conhecida;
- duração padrão e limitação explícita;
- ausência de horário inventado;
- saída vazia quando não houver candidatos;
- ausência de Dias;
- duplicidade de Dia, candidato ou Proposed Activity;
- data civil inexistente;
- validade derivada inválida;
- valores e factory de ID inválidos;
- imutabilidade das entradas;
- conclusão real da Proposal em `ready`.

## 6. Gates

- `pnpm install --frozen-lockfile`;
- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm db:migrate`;
- `pnpm test`;
- smoke do servidor web;
- `pnpm build`;
- E2E responsivo existente.

## 7. Guardrails

- não importar `@routebook/database` ou código de `apps/web`;
- não introduzir relógio, UUID, locale ou aleatoriedade global;
- não inventar horário, disponibilidade ou rota;
- não alterar o Itinerary;
- não persistir a Proposal;
- não esconder duração padrão ou limitações;
- não aceitar datas civis inexistentes ou validade derivada inválida;
- não aceitar ProposedActivityIds vazios ou duplicados;
- não mutar Dias, candidatos ou datas recebidas;
- não criar Provider de IA neste incremento.

## 8. Encerramento

O incremento estará pronto quando o adapter puder concluir uma Proposal em `ready`, todos os critérios do RB-INC-094 estiverem cobertos e o CI integral estiver verde no SHA definitivo da PR.
