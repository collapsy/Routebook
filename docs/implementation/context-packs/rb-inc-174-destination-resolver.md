---
id: RB-CTX-174
title: Context Pack do RB-INC-174 — Destination Resolver
description: Delimita a criação destination-agnostic com resolução provider-neutral, Provenance e UX de baixa fricção.
document_type: implementation-context-pack
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-01"
last_updated: "2026-09-01"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip, destination, resolver, destination-bootstrap]
related_documents: [RB-INC-174, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-ADR-012, RB-DATA-002, RB-DATA-003, RB-OBS-001, RB-INC-173]
prerequisites: [RB-INC-173]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-174 — Destination Resolver

## 1. Missão

Permitir que a criação de Trip receba um Destination real informado pelo usuário, resolva-o fora do domínio e preserve a evidência da resolução sem depender de código regional.

## 2. Unidade de trabalho

- Epic: #411;
- Issue: #414;
- branch: `codex/rb-inc-174-destination-resolver`;
- base: `main@e56de75a7713e76fe8e8fc51b7d7214af3cac885`;
- merge: gate humano;
- Production: fora de escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible;
3. `docs/README.md`;
4. RB-DOM-001 / RB-DOM-002;
5. RB-ARC-001;
6. RB-ADR-012;
7. RB-DATA-002 / RB-DATA-003;
8. RB-OBS-001;
9. RB-INC-173;
10. RB-INC-174 / este Context Pack.

## 4. Invariantes

- Destination não é Place;
- Pipa é regressão/conteúdo, não regra;
- Provider fica fora do domínio;
- dado externo relevante preserva origem;
- resultado ambíguo não vira identidade inventada;
- timezone derivado é sinal aproximado, não garantia;
- falha de Provider não pode criar Trip parcial;
- campos técnicos não aparecem no formulário;
- Production, billing e Provider pago continuam gates humanos.

## 5. Alterações permitidas

Somente os caminhos listados no RB-INC-174.

## 6. Regras de Provider

- default: desabilitado;
- Nominatim: somente opt-in por configuração;
- servidor público: sem autocomplete, no máximo uma busca por submit, limite pequeno de candidatos, User-Agent identificável, attribution e timeout;
- Production: bloqueada neste slice;
- fixture: apenas E2E explícito, nunca Vercel.

## 7. Testes mínimos

- resolver aceita Pipa e Florianópolis por fixture genérica do contrato;
- Nominatim normaliza candidato válido;
- Nominatim rejeita resposta inválida;
- ambiguidade é explícita;
- timezone lookup retorna IANA válida para coordenadas de regressão;
- action não cria Trip quando resolver falha;
- action cria Trip com Destination resolvido;
- PostgreSQL persiste Provenance na mesma transação;
- E2E cria viagem informando Destination editável;
- ausência do Provider configurado degrada sem Trip parcial.

## 8. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

O CI do GitHub é a evidência canônica.

## 9. Gates humanos remanescentes

- ativar Nominatim público em Preview;
- escolher Provider pago/comercial;
- alterar RB-ADR-012;
- Production;
- integrar na main.

## 10. Handoff

Relatar SHA final, arquivos, migration, CI, Preview, comportamento entregue, limitações, configuração necessária e próximo incremento.
