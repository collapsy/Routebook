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

Remover a barreira de Vercel Authentication dos domínios de Production do RouteBook para que o público-alvo alcance a aplicação sem Shareable Link ou token temporário, preservando a proteção de Preview e todas as fronteiras de autenticação e autorização do próprio produto.

Issue: #305.

Branch: `codex/rb-inc-134-production-public-access`.

## 2. Origem

O RB-INC-129 comprovou a jornada crítica do MVP em Production, mas o acesso ao alias principal exigiu Shareable Link porque a proteção da Vercel incluía Production. O lançamento permaneceu condicionado à definição explícita da política de acesso da issue #305.

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

## 4. Configuração alvo na Vercel

A configuração aprovada é **Standard Protection + Vercel Authentication**.

Segundo o contrato atual da Vercel, `ssoProtection.deploymentType` possui os modos relevantes:

```text
prod_deployment_urls_and_all_previews = Standard Protection
all                                   = All Deployments
preview                               = Only Preview Deployments
```

Para este incremento, o estado desejado é `prod_deployment_urls_and_all_previews`: Preview e generated deployment URLs permanecem protegidos, enquanto os Production domains permanecem públicos.

Não desabilitar Vercel Authentication globalmente, pois isso tornaria também os Previews públicos e violaria a decisão aprovada.

## 5. Estado inicial comprovado

Baseline em 2026-08-12:

- `main`: `bd32107bb5d79ddd13baf1472dce0bd4c05b281c`;
- `codex/production-release`: mesmo SHA;
- Production deployment: `dpl_Caz5LVTB9P8Di8bG8YFBkvZFPUmW`, `READY`, `target=production`;
- alias principal: `https://routebook-one.vercel.app`;
- a Vercel ainda oferece Shareable Link para o alias principal, comprovando que a proteção de acesso permanece ativa antes deste incremento;
- liveness e readiness estavam saudáveis antes da alteração;
- não há migration associada a este incremento.

Nenhum Shareable Link, token ou credencial é versionado como evidência.

## 6. Escopo

- aplicar Standard Protection no projeto Vercel `routebook`;
- comprovar que o alias principal de Production é alcançável sem bypass da Vercel;
- comprovar que um Preview continua protegido;
- comprovar que rotas/dados de Account e Trip continuam exigindo autenticação/autorização do RouteBook;
- revalidar liveness e readiness;
- executar smoke autenticado da jornada crítica já consolidada;
- inspecionar runtime após a alteração;
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
- [ ] Vercel Authentication configurada como Standard Protection;
- [ ] domínio de Production acessível sem Shareable Link, bypass header ou login Vercel;
- [ ] Preview continua exigindo Vercel Authentication;
- [ ] visitante anônimo não obtém dados protegidos de Account/Trip;
- [ ] autenticação normal do RouteBook continua funcional;
- [ ] liveness responde `200`/`ok`;
- [ ] readiness responde `200`/`ready` com database `available`;
- [ ] jornada crítica autenticada permanece funcional;
- [ ] nenhum erro/fatal relevante aparece no runtime após a mudança;
- [ ] Documentation Validation e Engineering Validation passam;
- [ ] evidências finais são registradas na matriz de rastreabilidade e na issue #305.

## 9. Validação operacional

A mudança deve ser validada em duas perspectivas distintas:

### 9.1 Sem credencial/bypass da Vercel

- abrir o domínio de Production sem Shareable Link;
- confirmar ausência do redirecionamento para login da Vercel;
- confirmar que a aplicação pública/entrada do RouteBook é exibida;
- tentar acessar uma área protegida e confirmar que o próprio produto exige autenticação.

### 9.2 Preview

- abrir um Preview sem Shareable Link ou bypass;
- confirmar que a Vercel Authentication continua bloqueando acesso público.

### 9.3 Aplicação autenticada

- autenticar com conta sintética autorizada;
- abrir Trip sintética de validação;
- confirmar descoberta/Roteiro ou outra jornada crítica representativa;
- validar persistência sem expor dados pessoais reais.

## 10. Operação e segurança

A mudança é de exposição da borda, não de autorização do produto. Por isso:

- não alterar código de autenticação para obter o resultado;
- não adicionar exceção de autorização para landing ou Trip;
- não usar Shareable Link como evidência de acesso público;
- não considerar health checks suficientes para comprovar proteção de dados;
- falhar a conclusão se Preview também ficar público;
- falhar a conclusão se qualquer dado de Account/Trip ficar acessível anonimamente.

## 11. Rollback

Se a validação revelar exposição indevida ou regressão, restaurar a proteção anterior de Production na Vercel e manter a issue aberta. O rollback de proteção não exige rollback de banco ou aplicação porque este incremento não altera schema nem estado canônico.

## 12. Evidências

Evidências finais serão registradas após a alteração efetiva de Deployment Protection. Até esse momento, este incremento permanece **em execução** e não pode ser declarado concluído.
