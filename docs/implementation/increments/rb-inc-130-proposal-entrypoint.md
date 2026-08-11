---
id: RB-INC-130
title: Entrada Visível para a Primeira Itinerary Proposal
description: Torna o estado vazio de Proposal alcançável pelo Roteiro sem gerar nem aplicar mudanças automaticamente.
document_type: implementation-increment
owner: Experience and Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors: [RouteBook Team]
tags: [implementation, experience, proposal-management, mvp, production-defect]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-DEL-001, RB-QA-001, RB-INC-129]
prerequisites: [RB-INC-129]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-130 — Entrada Visível para a Primeira Itinerary Proposal

## 1. Objetivo

Permitir que o Organizador alcance, a partir do Roteiro, o estado vazio já existente
que oferece a geração explícita da primeira Itinerary Proposal.

Issue: #299.

Branch: `codex/rb-inc-130-proposal-entrypoint`.

## 2. Problema

O RB-INC-129 comprovou em Production que o link da Proposal só aparecia quando uma
Proposal revisável já existia. A rota e o controle de geração estavam implementados,
mas eram inalcançáveis pela navegação normal da primeira jornada.

## 3. Escopo

- exibir `Gerar proposta` quando não existe Proposal revisável;
- preservar `Ver proposta` para estado ready e `Ver proposta expirada` para expired;
- apontar todas as ações para o estado de revisão existente;
- cobrir entrada inicial, pós-aceite e pós-descarte no E2E;
- comprovar geração da UI ao PostgreSQL começando pelo Roteiro.

## 4. Fora de escopo

- alterar geração, aceitação, edição ou descarte de Proposal;
- gerar ou aplicar Proposal ao abrir o link;
- mudar autorização, domínio, schema, Provider ou layout amplo;
- corrigir outras lacunas observadas durante a validação do MVP.

## 5. Critérios de aceite

- [x] Roteiro sem Proposal exibe link acessível `Gerar proposta`;
- [x] o link abre o estado vazio sem mutação automática;
- [x] usuário autorizado gera Proposal somente após ação explícita;
- [x] estados ready e expired preservam seus rótulos;
- [x] após aceitar ou descartar, a nova geração volta a ser alcançável;
- [x] testes locais, CI e Preview estão verdes;
- [x] correção integrada e validada em Production;
- [x] RB-INC-129 pode retomar a jornada interrompida.

## 6. Testes obrigatórios

- lint, typecheck, testes e build;
- E2E de geração e revisão de Proposal;
- `pnpm docs:validate`;
- Engineering Validation e Documentation Validation;
- smoke de Production pelo caminho visível.

## 7. Rollback

Reverter o link, as assertions E2E e a documentação deste incremento.

## 8. Evidências locais

- runtime efêmero: Node `24.18.0` e pnpm `11.17.0`, sem alteração global;
- Prettier, lint e typecheck: aprovados;
- build de produção: aprovado com variáveis sintéticas locais;
- Playwright `--list`: 23 cenários selecionados em desktop e mobile;
- Vitest: 163 testes aprovados; cinco suítes de autenticação não iniciaram por ausência
  deliberada de `DATABASE_URL` local e serão executadas no CI isolado;
- documentação: aprovada com oito avisos preexistentes.

## 9. Evidências integradas

- PR #301 integrada no commit `1568570e`;
- Engineering Validation `31539117050`: aprovada, com 81 testes responsivos;
- Documentation Validation e Preview: aprovados;
- deployment `dpl_Gzf1vWpo6nHTjVyHzu8sdQn7FAa9`: `READY` em Production;
- smoke produtivo confirmou `Gerar proposta`, estado vazio e geração exclusivamente
  após ação explícita;
- a retomada revelou o defeito de duplicação tratado separadamente no RB-INC-131.
