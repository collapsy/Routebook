---
id: RB-CTX-117
title: Context Pack do RB-INC-117 — Bootstrap Vercel e Neon para Preview
description: Contexto, caminhos permitidos e controles do primeiro Preview integrado à infraestrutura aprovada.
document_type: implementation-context
owner: Platform
status: Draft
version: "0.1.0"
created: "2026-08-11"
last_updated: "2026-08-11"
authors:
  - RouteBook Team
tags:
  - implementation
  - operational-hardening
  - vercel
  - neon
  - context-pack
related_documents:
  - RB-INC-117
  - RB-ADR-017
  - RB-ADR-018
  - RB-CICD-001
  - RB-OBS-001
  - RB-INC-113
  - RB-INC-114
prerequisites:
  - RB-INC-116
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-117 — Bootstrap Vercel e Neon para Preview

## Objetivo

Delimitar o provisionamento e a verificação de Preview após a aprovação dos Providers.

## Caminhos permitidos

- `.gitignore`;
- `apps/web/lib/auth.ts` e seu teste;
- metadados locais ignorados em `apps/web/.vercel/`;
- documentos de implementação, registry e matriz do RB-INC-117.

## Ordem obrigatória

1. vincular Vercel;
2. provisionar Neon;
3. habilitar PostGIS;
4. cadastrar variáveis sensíveis por ambiente;
5. aplicar migrations versionadas por conexão direta;
6. validar código e documentação;
7. criar Preview;
8. executar health checks e smoke;
9. inspecionar logs.

## Segurança

- nunca imprimir ou versionar connection strings, senhas, tokens ou secrets;
- Preview não acessa dados ou secrets de produção;
- registrar somente nomes de variáveis e IDs não secretos;
- não provisionar Neon Auth ou Data API;
- não promover para produção.

## Contrato de URL

`BETTER_AUTH_URL` explícita mantém prioridade. Sem ela, a aplicação pode usar `VERCEL_URL` somente quando o valor for um hostname simples, sem protocolo, path, query, fragmento, porta ou credencial.

## Testes obrigatórios

- URL explícita preservada;
- hostname Vercel válido convertido para HTTPS;
- valor injetável rejeitado;
- fallback local preservado;
- suite focada, lint, typecheck, build e documentação;
- CI integral;
- smoke operacional contra Preview.

## Fora de escopo

- produção e domínio customizado;
- branch Neon por PR;
- backup/restore;
- observabilidade externa;
- Providers adicionais.
