---
id: RB-INC-134
title: Acesso Público de Production com Preview Protegido
description: Define e comprova a política de acesso público dos domínios de Production, preservando Vercel Authentication em Preview e a autenticação/autorização do RouteBook.
document_type: implementation-increment
owner: Platform and Security
status: Draft
version: "0.1.0"
created: "2026-08-12"
last_updated: "2026-08-12"
authors: [RouteBook Team]
tags: [implementation, production, release, security, vercel, deployment-protection]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-SEC-001, RB-CICD-001, RB-INFRA-001, RB-ADR-017, RB-INC-124, RB-INC-129, RB-INC-133]
prerequisites: [RB-INC-124, RB-INC-129, RB-INC-133]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-134 — Acesso Público de Production com Preview Protegido

## 1. Objetivo

Comprovar e formalizar a política de acesso dos domínios de Production do RouteBook para que o público-alvo alcance a aplicação sem Shareable Link ou token temporário, preservando a proteção de Preview e todas as fronteiras de autenticação e autorização do próprio produto.

Issue: #305.

Branch: `codex/rb-inc-134-production-public-access`.

## 2. Origem e correção do diagnóstico

O RB-INC-129 comprovou a jornada crítica do MVP em Production e deixou a issue #305 como follow-up de acesso. A investigação do RB-INC-134 identificou que o bloqueio havia sido inferido a partir de URLs geradas de deployment/Preview, que permanecem corretamente protegidas pela Vercel Authentication.

A inspeção humana do painel da Vercel em 2026-08-12 comprovou que o projeto `routebook` **já estava** com `Require Log In` habilitado e **Standard Protection** selecionado. Em seguida, o alias canônico de Production foi aberto em janela anônima e exibiu a landing do RouteBook sem login da Vercel. Portanto, nenhuma mutação de Deployment Protection foi necessária para atingir a política aprovada.

Em 2026-08-12, o responsável humano aprovou explicitamente: **`aprovo Production pública`**.

Essa aprovação define a política de release/segurança deste incremento; ela não concede acesso a dados autenticados nem altera permissões de Account ou Trip.

## 3. Política aprovada

A política de lançamento é:

- domínios de **Production públicos** na camada Vercel;
- **Preview e deployment URLs protegidos** por Vercel Authentication;
- autenticação Better Auth do RouteBook continua sendo a fronteira de identidade do produto;
- autorização server-side continua sendo a autoridade para Account, Trip e recursos protegidos;
- isolamento entre Accounts/Trips permanece obrigatório;
- nenhuma rota protegida pode depender da Vercel Authentication como substituto da autorização do produto.

## 4. Configuração alvo e estado comprovado na Vercel

A configuração aprovada é **Standard Protection + Vercel Authentication**.

O contrato da Vercel representa Standard Protection por `ssoProtection.deploymentType=prod_deployment_urls_and_all_previews`: Preview e generated deployment URLs permanecem protegidos, enquanto os Production domains permanecem públicos.

Em 2026-08-12 o painel do projeto `routebook` mostrou:

- `Require Log In`: habilitado;
- `Vercel Authentication`: habilitada;
- modo: `Standard Protection`.

A configuração alvo, portanto, já era a configuração efetiva. O incremento não desabilitou Vercel Authentication e não tornou Preview público.

## 5. Baseline de aplicação validado

Aplicação de Production validada em 2026-08-12:

- `main`: `bd32107bb5d79ddd13baf1472dce0bd4c05b281c`;
- `codex/production-release`: mesmo SHA;
- Production deployment: `dpl_Caz5LVTB9P8Di8bG8YFBkvZFPUmW`;
- estado do deployment: `READY`;
- target: `production`;
- branch implantada: `codex/production-release`;
- alias principal: `https://routebook-one.vercel.app`;
- não há migration, alteração de banco, secret ou código de autenticação associada a este incremento.

Nenhum Shareable Link, token, cookie ou credencial é versionado como evidência.

## 6. Escopo

- formalizar Standard Protection como política de acesso do projeto;
- comprovar que o alias principal de Production é alcançável sem bypass da Vercel;
- comprovar que um Preview continua protegido;
- comprovar que rotas/dados de Account e Trip continuam exigindo autenticação/autorização do RouteBook;
- revalidar liveness e readiness;
- correlacionar a jornada crítica autenticada já comprovada no mesmo SHA de aplicação;
- inspecionar runtime após a validação;
- registrar evidências reais e rastreabilidade.

## 7. Fora de escopo

- tornar Preview público;
- remover ou enfraquecer Better Auth;
- alterar RBAC, ownership ou isolamento multi-tenant;
- alterar domínio, schema, migrations ou dados;
- alterar `codex/production-release` ou o gate do RB-INC-133;
- adicionar domínio customizado;
- criar allowlist externa;
- registrar Shareable Links, tokens, cookies ou secrets.

## 8. Critérios de aceite

- [x] política de acesso aprovada explicitamente pelo responsável humano;
- [x] Vercel Authentication comprovada como Standard Protection;
- [x] domínio de Production acessível sem Shareable Link, bypass header ou login Vercel;
- [x] Preview continua exigindo Vercel Authentication;
- [x] visitante anônimo não obtém dados protegidos de Account/Trip;
- [x] fronteira de autenticação normal do RouteBook permanece ativa para `/viagens`;
- [x] liveness responde `200`/`ok`;
- [x] readiness responde `200`/`ready` com database `available`;
- [x] jornada crítica autenticada possui evidência válida no mesmo SHA de aplicação via RB-INC-129; não houve mudança de código/runtime neste incremento;
- [x] nenhum erro, fatal, warning ou `5xx` relevante foi encontrado no runtime na janela de 24 horas consultada;
- [ ] Documentation Validation e Engineering Validation passam no mesmo HEAD final;
- [ ] evidências finais são registradas na matriz de rastreabilidade e na issue #305.

## 9. Validação operacional executada

### 9.1 Production sem credencial/bypass da Vercel

O responsável abriu `https://routebook-one.vercel.app` em janela anônima e a landing do RouteBook foi exibida diretamente. Não houve tela de login da Vercel.

Resultado: **aprovado**.

### 9.2 Preview

Um deployment Preview `READY` foi consultado e a camada de acesso da Vercel continuou exigindo mecanismo autenticado de acesso. A possibilidade de obter um Shareable Link temporário para esse Preview foi usada somente como prova de que a proteção está ativa; o link e seu token não foram registrados.

Resultado: **aprovado**.

### 9.3 Autorização anônima do produto

A rota `/viagens` foi consultada sem sessão de aplicação. A resposta do Next.js declarou redirect para `/entrar?next=%2Fviagens`; nenhuma coleção de Trips foi devolvida. O código autoritativo da página também resolve `getRouteBookSession()` antes de chamar `listPostgresAuthorizedTrips(session.user.id)`.

Resultado: **aprovado**. A exposição pública da landing não substitui nem contorna a autenticação/autorização do RouteBook.

### 9.4 Liveness e readiness

- `/api/health/live`: HTTP `200`, `status=ok`;
- `/api/health/ready`: HTTP `200`, `status=ready`, `database=available`.

Resultado: **aprovado**.

### 9.5 Jornada crítica autenticada

O RB-INC-129 já comprovou, no mesmo SHA de aplicação atualmente implantado, a jornada autenticada com dados sintéticos, incluindo persistência após logout/login, Trip, contexto, Places, Roteiro, Proposal e validação mobile.

O RB-INC-134 não alterou código de aplicação, runtime, banco, migrations, secrets ou a referência `codex/production-release`. Como não há ferramenta interativa autenticada disponível nesta execução, essa jornada não foi artificialmente declarada como reexecutada; a evidência técnica é herdada do RB-INC-129 no mesmo SHA e complementada pelos smokes frescos de acesso público, fronteira anônima e health checks.

Resultado: **sem regressão de aplicação observada; evidência autenticada herdada do mesmo SHA**.

### 9.6 Runtime

Na janela de 24 horas consultada em Production:

- nenhum log `error`;
- nenhum log `fatal`;
- nenhum log `warning`;
- nenhum HTTP `5xx`.

Foram observadas duas respostas `416` de recurso estático/cache para `GET /`; elas não correspondem a erro de runtime ou `5xx` e não bloquearam landing, liveness, readiness ou autenticação do produto.

Resultado: **aprovado**.

## 10. Operação e segurança

A política é de exposição da borda, não de autorização do produto. Por isso:

- nenhum código de autenticação foi alterado;
- nenhuma exceção de autorização foi adicionada;
- Shareable Link não foi usado como evidência de acesso público de Production;
- Preview permaneceu protegido;
- dados de Account/Trip permaneceram atrás da sessão e autorização server-side;
- nenhum secret ou token foi persistido em issue, documentação ou commit.

## 11. Rollback

Se uma alteração futura de Deployment Protection expuser Preview ou proteger indevidamente Production, restaurar `Vercel Authentication + Standard Protection`. Não existe rollback de banco ou aplicação para o RB-INC-134 porque este incremento não altera schema nem estado canônico.

## 12. Evidências finais

| Evidência | Resultado |
| --- | --- |
| decisão humana | Production pública aprovada em 2026-08-12 |
| configuração Vercel | `Require Log In` ON + `Standard Protection`, comprovado no painel |
| Production pública | landing carregada em janela anônima no alias canônico |
| Preview | proteção Vercel preservada |
| aplicação anônima | `/viagens` exige sessão e redireciona para `/entrar` |
| liveness | `200` / `ok` |
| readiness | `200` / `ready` / database `available` |
| jornada autenticada | RB-INC-129, mesmo SHA de aplicação; não reexecutada interativamente neste incremento |
| runtime | sem error/fatal/warning/5xx na janela consultada |
| deployment | `dpl_Caz5LVTB9P8Di8bG8YFBkvZFPUmW`, `READY`, `target=production` |
| migration/banco | nenhuma alteração |
| rastreabilidade | issue #305; PR e CI a registrar na conclusão |
