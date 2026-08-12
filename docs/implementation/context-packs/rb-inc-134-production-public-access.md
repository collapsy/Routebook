---
id: RB-CTX-134
title: Context Pack do RB-INC-134 — Acesso Público de Production
description: Contexto operacional mínimo para tornar os domínios de Production públicos sem remover a proteção de Preview nem a autenticação/autorização do RouteBook.
document_type: implementation-context-pack
owner: Platform and Security
status: Draft
version: "0.1.0"
created: "2026-08-12"
last_updated: "2026-08-12"
authors: [RouteBook Team]
tags: [context-pack, production, release, security, vercel, deployment-protection]
related_documents: [RB-INC-134, RB-CORE-0004, RB-PRD-002, RB-SEC-001, RB-CICD-001, RB-INFRA-001, RB-ADR-017, RB-INC-124, RB-INC-129, RB-INC-133]
prerequisites: [RB-INC-124, RB-INC-129, RB-INC-133]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-134 — Acesso Público de Production

## 1. Missão

Executar a decisão humana aprovada na issue #305: tornar os domínios de Production do RouteBook públicos na camada Vercel, mantendo Preview protegido e preservando integralmente autenticação, autorização e isolamento do próprio produto.

## 2. Fonte canônica

- repositório: `collapsy/Routebook`;
- issue: #305;
- incremento: RB-INC-134;
- branch: `codex/rb-inc-134-production-public-access`;
- baseline inicial: `bd32107bb5d79ddd13baf1472dce0bd4c05b281c`;
- referência de Production: `codex/production-release`;
- projeto Vercel: `routebook`;
- alias principal: `https://routebook-one.vercel.app`.

## 3. Decisão humana já tomada

Aprovação explícita em 2026-08-12: **`aprovo Production pública`**.

Não solicitar nova decisão sobre público versus allowlist. A decisão aprovada corresponde a Production pública com Preview protegido.

## 4. Documentos obrigatórios

Ler antes de concluir qualquer alteração:

- `AGENTS.md`;
- `docs/core/routebook-bible.md`;
- `docs/README.md`;
- `docs/product/mvp-definition.md` quando necessário para a jornada crítica;
- `docs/security/security-and-privacy-architecture.md`;
- `docs/cicd/continuous-integration-delivery-and-release-strategy.md`;
- `docs/infrastructure/infrastructure-environments-and-deployment-strategy.md`;
- `docs/architecture/adrs/rb-adr-017-vercel-as-initial-web-deployment-platform.md`;
- `docs/implementation/increments/rb-inc-124-production-bootstrap.md`;
- `docs/implementation/increments/rb-inc-129-mvp-production-validation.md`;
- `docs/implementation/increments/rb-inc-133-production-migration-gate.md`.

## 5. Invariantes

- Production pública não significa dados públicos;
- Account/Trip continuam protegidas pela autenticação/autorização server-side;
- Vercel Authentication não substitui Better Auth;
- Preview não pode ficar público como efeito colateral;
- `codex/production-release` continua sendo a única referência de promoção de Production;
- nenhuma migration deve ser criada ou executada para esta mudança;
- nenhum secret, token, cookie ou Shareable Link pode ser registrado.

## 6. Configuração Vercel permitida

Configuração alvo: **Standard Protection + Vercel Authentication**.

Contrato relevante:

```text
ssoProtection.deploymentType = prod_deployment_urls_and_all_previews
```

Esse modo protege Preview/generated deployment URLs e deixa Production domains públicos.

Não usar `ssoProtection = null`, pois isso remove a proteção também dos Previews.

## 7. Caminhos versionados permitidos

```text
docs/implementation/increments/rb-inc-134-production-public-access.md
docs/implementation/context-packs/rb-inc-134-production-public-access.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

O RB-INC-129 poderá ser atualizado apenas se necessário para fechar explicitamente o follow-up #305, sem reescrever suas evidências históricas.

## 8. Alteração externa permitida

Somente a configuração de Deployment Protection do projeto Vercel `routebook`, limitada ao escopo necessário para selecionar Standard Protection preservando Vercel Authentication.

Não alterar:

- Production Branch;
- aliases;
- domains;
- environment variables;
- secrets;
- Git integration;
- build settings;
- regions;
- runtime;
- banco Neon.

## 9. Validações obrigatórias

### Acesso público

- Production domain sem Shareable Link/bypass retorna a aplicação, não o login Vercel;
- nenhum header/cookie especial deve ser necessário para essa comprovação.

### Preview

- Preview sem Shareable Link/bypass permanece protegido pela Vercel Authentication.

### Segurança do produto

- acesso anônimo a uma área autenticada não revela dados de Account/Trip;
- login do RouteBook continua funcionando;
- usuário autenticado autorizado continua acessando sua Trip.

### Operação

- `/api/health/live` → 200 / `ok`;
- `/api/health/ready` → 200 / `ready` e database `available`;
- runtime sem erro/fatal relevante após a mudança;
- deployment atual permanece READY ou novo deployment, se houver, deve ser identificado e validado.

### Repositório

- `pnpm format:check`;
- `pnpm docs:validate`;
- `pnpm lint`;
- `pnpm typecheck`;
- testes/build/E2E conforme Engineering Validation;
- Documentation Validation e Engineering Validation verdes no mesmo HEAD documental final.

## 10. Evidências mínimas

Registrar sem material sensível:

- data e autor da aprovação humana;
- configuração lógica aplicada: Standard Protection;
- SHA de `main` e de `codex/production-release`;
- deployment de Production e estado;
- status público do domínio sem bypass;
- status de proteção de Preview;
- liveness/readiness;
- resultado da jornada autenticada;
- inspeção de runtime;
- issue e PR.

## 11. Critérios de parada

Parar somente se:

- a Vercel exigir mudança de plano/custo não previamente aprovada;
- a configuração disponível não permitir Production pública mantendo Preview protegido;
- houver evidência de exposição anônima de dados protegidos;
- a mudança exigir secret ou credencial que não esteja disponível por canal autorizado;
- surgir qualquer alteração destrutiva ou irreversível não coberta pela aprovação.
