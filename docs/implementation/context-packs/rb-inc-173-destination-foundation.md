---
id: RB-CTX-173
title: Context Pack do RB-INC-173 — Destination Foundation
description: Delimita a remoção do hardcode de Pipa no núcleo de Trip e persistência, sem antecipar resolução geográfica, UX ou Provider.
document_type: implementation-context-pack
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-01"
last_updated: "2026-09-01"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip, destination, destination-bootstrap]
related_documents: [RB-INC-173, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-ADR-012]
prerequisites: [RB-INC-136, RB-INC-172]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-173 — Destination Foundation

## 1. Missão

Alinhar a implementação concreta de Trip à definição canônica de Destination e provar que o núcleo/persistência suportam mais de um destino sem introduzir Provider ou mudar a experiência ainda Pipa-first da criação.

## 2. Unidade de trabalho

- Epic: #411;
- Issue: #412;
- branch: `codex/rb-inc-173-destination-foundation`;
- base: `main@b067a688f39c1e3298e9670b6a82c9857a188f0e`;
- merge: gate humano;
- Production: fora de escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible;
3. `docs/README.md`;
4. RB-DOM-001 / RB-DOM-002;
5. RB-ARC-001;
6. RB-ADR-012;
7. RB-INC-136;
8. RB-INC-172;
9. RB-INC-173 / este Context Pack.

## 4. Invariantes

- Pipa é cenário de validação, não regra universal;
- Destination não é Place;
- Destination possui referência geográfica, país e fuso ou mecanismo de resolução;
- Trip Period usa timezone coerente com a Trip;
- dado persistido não pode ser silenciosamente substituído por fallback regional;
- nenhuma chamada de Provider pertence ao domínio;
- nenhum conceito novo deve ser criado quando o domínio existente já cobre o caso;
- ausência/incerteza não deve virar precisão inventada.

## 5. Alterações permitidas

Somente os caminhos listados na seção de Escopo do RB-INC-173.

Mudança adicional exige registrar a necessidade no incremento antes do commit.

## 6. Proibições

- não alterar migrations;
- não criar tabela;
- não ativar Provider;
- não criar secret;
- não alterar billing;
- não promover Production;
- não alterar PR #410;
- não transformar Pipa curada em conteúdo genérico;
- não antecipar Destination Resolver;
- não alterar `main` diretamente.

## 7. Testes mínimos

- criação Pipa explícita;
- criação Florianópolis explícita;
- normalização de countryCode;
- rejeição de timezone inválido;
- coordenada inválida continua rejeitada;
- round-trip PostgreSQL conserva tipo/país/fuso;
- suites existentes de Account/Trip continuam compilando com Destination explícito.

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

O CI do repositório é a evidência canônica nesta sessão; nenhum resultado local hipotético deve ser reportado.

## 9. Handoff

Relatar:

- SHA final;
- arquivos alterados;
- diff contra main;
- CI real;
- regressões/gaps conhecidos;
- próximo incremento;
- gate humano exato para merge.
