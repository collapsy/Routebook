---

id: RB-ADR-017

title: Adoção da Vercel como Plataforma Inicial de Deployment da Aplicação Web
description: Registra a decisão de adotar a Vercel como plataforma inicial de build, hosting e execução da aplicação Next.js do RouteBook, mantendo PostgreSQL, Redis, Inngest, Cloudflare R2 e demais serviços externos desacoplados por contratos e configuração.

document_type: architecture_decision_record
owner: Architecture

status: Published
version: "0.1.0"

created: "2026-07-24"
last_updated: null

authors:

- RouteBook Team

tags:

- architecture
- adr
- deployment
- hosting
- vercel
- nextjs
- infrastructure
- preview-environments
- serverless
- runtime
- regions
- ci-cd
- secrets
- portability

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-ARC-005
- RB-DATA-001
- RB-DATA-002
- RB-API-001
- RB-SEC-001
- RB-SEC-002
- RB-SEC-003
- RB-PRIV-001
- RB-PRIV-002
- RB-PRIV-003
- RB-OBS-001
- RB-QA-001
- RB-QA-002
- RB-OPS-001
- RB-OPS-002
- RB-SRE-001
- RB-AI-001
- RB-AI-004
- RB-AI-005
- RB-AI-006
- RB-GOV-001
- RB-GOV-002
- RB-RISK-001
- RB-ADR-001
- RB-ADR-002
- RB-ADR-003
- RB-ADR-004
- RB-ADR-005
- RB-ADR-006
- RB-ADR-007
- RB-ADR-008
- RB-ADR-009
- RB-ADR-010
- RB-ADR-011
- RB-ADR-012
- RB-ADR-013
- RB-ADR-014
- RB-ADR-015
- RB-ADR-016

prerequisites:

- RB-FND-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-ARC-005
- RB-DATA-001
- RB-DATA-002
- RB-SEC-001
- RB-SEC-002
- RB-SEC-003
- RB-PRIV-001
- RB-PRIV-002
- RB-OBS-001
- RB-QA-001
- RB-QA-002
- RB-OPS-001
- RB-OPS-002
- RB-SRE-001
- RB-ADR-003
- RB-ADR-004
- RB-ADR-005
- RB-ADR-007
- RB-ADR-010
- RB-ADR-012
- RB-ADR-013
- RB-ADR-014
- RB-ADR-015
- RB-ADR-016

next_documents:

- RB-ADR-018

ai_context:
priority: critical
index: true
---

# RB-ADR-017 — Adoção da Vercel como Plataforma Inicial de Deployment da Aplicação Web

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* Vercel será a plataforma inicial de build, hosting e execução da aplicação web;
* a aplicação Next.js será implantada como um único projeto Vercel no estágio inicial;
* deployments serão originados do repositório Git canônico;
* pull requests produzirão Preview Deployments;
* produção será promovida somente a partir de referências aprovadas;
* o runtime Node.js será utilizado como padrão para operações server-side;
* Edge Runtime somente será adotado mediante necessidade comprovada;
* Functions serão posicionadas próximas à infraestrutura de dados principal;
* PostgreSQL, Redis, Inngest, Cloudflare R2 e Providers permanecerão serviços externos;
* secrets serão separados por ambiente;
* migrations não serão executadas automaticamente durante o startup da aplicação;
* a configuração deverá preservar portabilidade para self-hosting ou outra plataforma.

---

## 2. Contexto

O RouteBook adotou uma arquitetura composta por:

* Next.js com App Router;
* React;
* TypeScript;
* pnpm Workspaces;
* Turborepo;
* monólito modular;
* PostgreSQL;
* PostGIS;
* Drizzle ORM;
* Better Auth;
* Redis gerenciado;
* Inngest;
* Cloudflare R2;
* Google Maps Platform;
* OpenTelemetry;
* Sentry.

É necessário definir onde a aplicação web será:

* construída;
* implantada;
* executada;
* distribuída;
* configurada;
* monitorada;
* exposta aos usuários.

A primeira versão do RouteBook é um projeto pessoal, mas a plataforma deverá oferecer:

* ambiente de produção;
* ambientes de Preview;
* domínio seguro;
* HTTPS;
* rollback;
* integração com Git;
* execução server-side;
* deploys reproduzíveis;
* observabilidade;
* controle de custos;
* possibilidade de migração futura.

---

## 3. Problema

Qual plataforma deverá ser utilizada inicialmente para o deployment da aplicação Next.js, considerando:

* compatibilidade com App Router;
* Server Components;
* Route Handlers;
* Server Functions;
* streaming;
* image optimization;
* Preview Deployments;
* integração com GitHub;
* ambientes;
* secrets;
* regiões;
* jobs do Inngest;
* serviços externos;
* observabilidade;
* custo operacional;
* portabilidade?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. compatibilidade integral com Next.js;
2. baixo esforço operacional;
3. integração com GitHub;
4. Preview Deployments;
5. rollback;
6. HTTPS e domínio;
7. execução Node.js;
8. suporte a streaming;
9. suporte a Server Components;
10. configuração por ambiente;
11. suporte a monorepo;
12. integração com Turborepo;
13. integração com Inngest;
14. observabilidade;
15. segurança;
16. escolha de região;
17. controle de custos;
18. escalabilidade inicial;
19. desenvolvimento individual;
20. portabilidade futura.

---

## 5. Restrições

A solução deverá:

* suportar Next.js App Router;
* suportar Node.js;
* suportar Route Handlers;
* suportar Server Components;
* suportar Server Functions;
* suportar streaming;
* integrar-se ao repositório Git;
* possuir HTTPS gerenciado;
* separar ambientes;
* proteger secrets;
* permitir configuração regional;
* integrar-se a PostgreSQL externo;
* integrar-se a Redis externo;
* integrar-se ao Inngest;
* acessar Cloudflare R2;
* exportar telemetria;
* não exigir administração de servidores no MVP;
* não tornar o banco dependente da plataforma web;
* não impedir self-hosting futuro;
* não executar migrations concorrentes em Functions.

---

## 6. Terminologia

### 6.1 Build

Processo que transforma o código-fonte em artefatos executáveis.

### 6.2 Deployment

Versão imutável da aplicação construída e publicada em determinado ambiente.

### 6.3 Hosting

Infraestrutura responsável por servir a aplicação e seus assets.

### 6.4 Runtime

Ambiente no qual o código server-side é executado.

### 6.5 Preview Deployment

Deployment isolado criado para revisão antes da produção.

### 6.6 Production Deployment

Deployment associado ao ambiente público principal.

### 6.7 Function

Unidade de compute server-side executada pela plataforma.

### 6.8 Edge Runtime

Runtime restrito executado próximo aos usuários em uma rede distribuída.

### 6.9 Node.js Runtime

Runtime completo baseado em Node.js, compatível com bibliotecas e drivers utilizados pela aplicação.

### 6.10 Region

Localização geográfica na qual determinada execução ou infraestrutura ocorre.

---

## 7. Princípio central

A plataforma de hosting executará a aplicação.

Ela não será a fonte canônica do produto.

```text
GitHub
→ build
→ deployment
→ runtime da aplicação
→ serviços externos
```

O RouteBook deverá continuar independente da plataforma para:

* domínio;
* casos de uso;
* banco;
* arquivos;
* eventos;
* contratos;
* autenticação;
* autorização;
* observabilidade.

---

## 8. Opções consideradas

### 8.1 Vercel

Utilizar a plataforma mantida pela organização responsável pelo Next.js.

#### Benefícios

* suporte direto ao Next.js;
* integração com Git;
* Preview Deployments;
* HTTPS e domínios;
* Functions;
* streaming;
* image optimization;
* configuração por ambiente;
* integração simples com monorepos;
* rollback por deployment;
* baixa carga operacional;
* integração documentada com Inngest;
* boa experiência para projeto individual.

#### Limitações

* dependência da plataforma;
* custos podem crescer conforme compute e tráfego;
* algumas capacidades utilizam comportamento específico da Vercel;
* Functions possuem limites próprios;
* cache e regiões exigem compreensão operacional;
* self-hosting posterior poderá exigir adaptações.

#### Avaliação

Oferece o melhor equilíbrio para o estágio inicial.

Foi selecionada.

---

### 8.2 Cloudflare Workers com OpenNext

Executar a aplicação Next.js sobre Cloudflare Workers utilizando o adapter OpenNext.

#### Benefícios

* runtime distribuído;
* integração com o ecossistema Cloudflare;
* proximidade com R2;
* rede global;
* possibilidade de menor latência em determinados cenários;
* suporte a grande parte das capacidades do Next.js.

#### Limitações

* utiliza uma camada de adaptação;
* compatibilidade precisa acompanhar Next.js e OpenNext;
* Node.js não está disponível integralmente em todos os contextos;
* bibliotecas e drivers precisam ser validados;
* maior complexidade para a primeira implementação;
* debugging atravessa framework, adapter e runtime.

#### Avaliação

É uma alternativa tecnicamente viável e relevante para uma migração futura.

Não foi selecionada inicialmente.

---

### 8.3 Container gerenciado

Executar a aplicação em serviço de containers gerenciado.

Exemplos conceituais:

* Cloud Run;
* AWS App Runner;
* Fly.io;
* Render;
* Railway;
* serviço Kubernetes gerenciado.

#### Benefícios

* runtime Node.js previsível;
* maior controle;
* compatibilidade com self-hosting;
* processos persistentes;
* menor dependência de APIs específicas do hosting;
* liberdade de topologia.

#### Limitações

* configuração de imagem;
* networking;
* autoscaling;
* health checks;
* CDN;
* domínio;
* preview environments;
* observabilidade;
* maior responsabilidade operacional.

#### Avaliação

Poderá tornar-se adequada quando o RouteBook exigir workloads persistentes ou maior controle.

Foi rejeitada para o MVP.

---

### 8.4 AWS como plataforma integral

Executar frontend, backend, banco, cache, storage e filas no ecossistema AWS.

#### Benefícios

* ampla capacidade;
* controle de rede;
* serviços maduros;
* regiões;
* IAM;
* escala;
* infraestrutura como código.

#### Limitações

* alta complexidade;
* maior carga operacional;
* maior superfície de configuração;
* custos difíceis de prever no início;
* excesso de capacidade para projeto pessoal;
* maior tempo até a entrega de valor.

#### Avaliação

Foi rejeitada para o estágio inicial.

---

### 8.5 VPS ou servidor próprio

Executar Next.js em máquina virtual administrada pelo projeto.

#### Benefícios

* controle;
* custo fixo possível;
* compatibilidade com Node.js;
* menor dependência de plataforma proprietária;
* facilidade para processos persistentes.

#### Limitações

* patches;
* TLS;
* proxy;
* deploy;
* rollback;
* autoscaling;
* backups;
* monitoramento;
* segurança;
* disponibilidade;
* alta carga operacional.

#### Avaliação

Foi rejeitada.

---

## 9. Decisão

O RouteBook adotará:

* **Vercel** como plataforma inicial de deployment da aplicação web;
* **GitHub** como origem canônica dos deployments;
* **Preview Deployments** para pull requests;
* **Production Deployment** para a referência aprovada;
* **Node.js Runtime** como padrão server-side;
* **Functions regionais** próximas ao PostgreSQL;
* **Fluid Compute**, quando disponível e validado, conforme a configuração da plataforma;
* **serviços de dados externos** independentes da Vercel;
* **configuração declarativa versionada** sempre que possível;
* **secrets gerenciados por ambiente**;
* **promoção e rollback baseados em deployments imutáveis**.

---

## 10. Escopo da decisão

Esta decisão define:

* plataforma inicial;
* estratégia de ambientes;
* integração com GitHub;
* runtime;
* regiões;
* domínio;
* secrets;
* migrations;
* Preview Deployments;
* observabilidade;
* segurança;
* rollout;
* rollback;
* portabilidade.

Esta decisão não define integralmente:

* Provider específico de PostgreSQL;
* Provider específico de Redis;
* DNS definitivo;
* todos os domínios;
* plano comercial da Vercel;
* infraestrutura como código completa;
* estratégia multi-region;
* active-active;
* disaster recovery completo;
* CDN de arquivos privados;
* plataforma futura de containers.

---

## 11. Topologia inicial

```text
Usuário
→ Vercel Edge Network
→ Next.js
   ├── Server Components
   ├── Route Handlers
   ├── Server Functions
   └── Client Assets
→ PostgreSQL e PostGIS
→ Redis
→ Inngest
→ Cloudflare R2
→ Google Maps Platform
→ Providers de IA
→ Sentry e OpenTelemetry
```

---

## 12. Projeto Vercel

A aplicação web será implantada inicialmente como um único projeto Vercel.

O projeto deverá apontar para a aplicação correspondente no monorepo.

Exemplo conceitual:

```text
Routebook/
├── apps/
│   └── web/
├── packages/
├── docs/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

A configuração deverá identificar:

* root directory;
* comando de instalação;
* comando de build;
* output;
* versão do Node.js;
* variáveis;
* ambientes.

---

## 13. GitHub como origem

Deployments deverão ser vinculados ao repositório canônico.

Eventos esperados:

```text
pull request
→ Preview Deployment

merge aprovado
→ Production Deployment
```

Deploy manual poderá existir para:

* recuperação;
* teste controlado;
* promoção;
* rollback.

Ele não deverá substituir o fluxo normal versionado.

---

## 14. Preview Deployments

Cada pull request deverá poder gerar um deployment isolado.

O Preview deverá permitir validar:

* interface;
* responsividade;
* navegação;
* Server Components;
* integrações fake ou isoladas;
* schemas;
* migrações compatíveis;
* autenticação controlada;
* observabilidade;
* smoke tests.

---

## 15. Limites dos Previews

Preview Deployments não deverão:

* acessar banco de produção;
* acessar Redis de produção;
* utilizar secrets de produção;
* executar schedules de produção;
* consumir quotas amplas;
* processar dados reais;
* publicar eventos em produção;
* enviar notificações reais;
* compartilhar namespace com outros previews.

---

## 16. Ambientes

Ambientes iniciais:

* Development;
* Preview;
* Production.

Staging poderá ser criado quando houver necessidade comprovada de:

* dados persistentes de teste;
* integrations completas;
* homologação;
* execução programada;
* validação anterior à produção.

---

## 17. Development

O desenvolvimento local deverá utilizar:

* Node.js compatível;
* pnpm;
* serviços locais ou de desenvolvimento;
* variáveis locais;
* PostgreSQL local;
* Redis local;
* Inngest Dev Server;
* storage local compatível com S3;
* Providers fake quando possível.

A Vercel não deverá ser requisito para executar testes unitários ou domínio.

---

## 18. Runtime Node.js

Node.js será o runtime padrão para:

* Drizzle;
* PostgreSQL;
* Better Auth;
* OpenTelemetry;
* SDKs de Providers;
* R2;
* operações criptográficas;
* processamento server-side.

A versão deverá ser fixada no repositório e na plataforma.

---

## 19. Edge Runtime

Edge Runtime somente deverá ser adotado quando:

* houver benefício mensurável;
* todas as dependências forem compatíveis;
* a operação não exigir Node.js completo;
* a região distribuída não comprometer o acesso aos dados;
* o ganho superar a complexidade.

Não deverá ser utilizado apenas por estar disponível.

---

## 20. Regiões

Functions deverão executar preferencialmente próximas ao PostgreSQL principal.

O posicionamento deverá minimizar:

* latência de banco;
* tempo de autenticação;
* duração de transações;
* custo de rede;
* risco de timeouts.

A proximidade do usuário não deverá ser priorizada sobre a proximidade dos dados em operações intensivas no banco.

---

## 21. Região inicial

A região inicial deverá ser escolhida considerando:

* localização do PostgreSQL;
* localização do Redis;
* usuários iniciais no Brasil;
* disponibilidade do Provider;
* residência de dados;
* latência;
* custo.

A decisão concreta da região deverá ser registrada na configuração de infraestrutura.

---

## 22. Multi-region

Execução multi-region não será habilitada automaticamente.

Antes de adotá-la, deverão ser avaliados:

* banco centralizado;
* consistência;
* caches regionais;
* sessões;
* rate limiting;
* observabilidade;
* invalidação;
* custos;
* latência entre regiões.

---

## 23. PostgreSQL

O PostgreSQL será externo à Vercel.

A conexão deverá considerar:

* região;
* TLS;
* pooling;
* limites de conexão;
* Functions concorrentes;
* timeouts;
* credentials;
* migrations;
* observabilidade.

---

## 24. Connection pooling

A estratégia deverá ser compatível com execução serverless.

Deverão ser avaliados:

* pooler do Provider;
* conexão direta para migrations;
* conexão agrupada para runtime;
* limites de conexões;
* prepared statements;
* transações;
* PostGIS.

Functions não deverão criar conexões ilimitadas.

---

## 25. Redis

Redis permanecerá externo à Vercel.

A forma de acesso poderá utilizar:

* HTTP;
* TCP;
* SDK específico isolado por adapter.

A escolha deverá considerar o runtime e a região.

---

## 26. Inngest

O endpoint do Inngest poderá ser hospedado junto à aplicação Next.js.

A integração deverá:

* validar assinatura;
* separar ambientes;
* associar deployment;
* preservar funções existentes durante rollout;
* não executar schedules de produção em Preview;
* possuir observabilidade;
* possuir secrets próprios.

---

## 27. Cloudflare R2

A aplicação acessará o R2 server-side para:

* criar URLs temporárias;
* verificar objetos;
* excluir objetos;
* consultar metadados.

Credenciais permanentes não deverão ser enviadas ao navegador.

Uploads diretos utilizarão concessões temporárias.

---

## 28. Google Maps Platform

A configuração deverá separar:

* chave pública restrita para o mapa;
* credenciais server-side;
* ambientes;
* origens;
* quotas;
* APIs permitidas.

Preview URLs deverão ser consideradas nas restrições sem ampliar acesso indiscriminadamente.

---

## 29. Variáveis de ambiente

Variáveis deverão ser separadas entre:

* Development;
* Preview;
* Production.

Variáveis server-only não deverão utilizar prefixo público.

Variáveis públicas deverão conter somente dados seguros para o navegador.

---

## 30. Validação de configuração

Todas as variáveis obrigatórias deverão ser validadas por schemas Zod.

A aplicação deverá falhar no build ou startup apropriado quando uma configuração necessária estiver inválida.

A validação deverá distinguir:

* build-time;
* runtime;
* server-only;
* client-safe;
* opcional;
* ambiente.

---

## 31. Secrets

Secrets deverão:

* permanecer fora do Git;
* possuir owner;
* possuir finalidade;
* ser separados por ambiente;
* ser rotacionáveis;
* possuir menor privilégio;
* não aparecer em logs;
* não ser disponibilizados a Preview não confiável;
* ser removidos quando uma integração for encerrada.

---

## 32. Domínios

A produção deverá utilizar domínio próprio com HTTPS.

Deverão ser configurados:

* domínio canônico;
* redirecionamentos;
* `www`, se utilizado;
* certificados;
* headers;
* callback URLs;
* origem do Better Auth;
* origens do Google Maps;
* CORS;
* CSP.

---

## 33. Preview URLs

Preview URLs deverão ser tratadas como ambientes temporários.

Não deverão ser adicionadas a allowlists amplas utilizando curingas perigosos quando houver alternativa mais segura.

Integrações que não suportarem Preview dinâmico deverão utilizar:

* ambiente compartilhado controlado;
* mocks;
* callbacks intermediários;
* ou desativação da capacidade.

---

## 34. Build

O build deverá ser:

* determinístico;
* reproduzível;
* executado com lockfile;
* compatível com monorepo;
* livre de chamadas externas desnecessárias;
* sem dependência de dados privados;
* validado por typecheck e testes anteriores.

---

## 35. Instalação

O pipeline deverá utilizar:

* versão fixada do Node.js;
* Corepack ou mecanismo equivalente;
* versão fixada do pnpm;
* `pnpm-lock.yaml`;
* instalação imutável.

Alterações não refletidas no lockfile deverão falhar.

---

## 36. Turborepo

O Turborepo deverá ser utilizado para coordenar:

* build;
* lint;
* typecheck;
* testes;
* geração de artefatos;
* dependências entre packages.

O cache remoto somente deverá ser habilitado após avaliação de:

* secrets;
* inputs;
* outputs;
* segurança;
* custo;
* reprodutibilidade.

---

## 37. Cache de build

Caches deverão acelerar builds sem esconder inconsistências.

Eles não deverão incluir:

* secrets;
* arquivos locais não versionados;
* dados de usuários;
* outputs dependentes de ambiente sem declaração;
* artefatos incompatíveis entre versões.

---

## 38. Migrations

Migrations não deverão ser executadas durante o startup comum da aplicação.

Motivos:

* Functions podem iniciar concorrentemente;
* execução pode ocorrer em múltiplas regiões;
* falhas podem bloquear requests;
* migrations exigem credencial distinta;
* rollback precisa ser controlado.

---

## 39. Pipeline de migrations

Fluxo esperado:

```text
validar migration
→ backup ou proteção aplicável
→ executar migration controlada
→ verificar schema
→ implantar aplicação compatível
→ executar smoke tests
```

A ordem poderá variar conforme a estratégia expand-contract.

---

## 40. Expand and contract

Mudanças incompatíveis deverão utilizar etapas progressivas.

Exemplo:

```text
adicionar nova coluna
→ publicar código compatível com ambas
→ migrar dados
→ alterar leitura
→ remover coluna antiga posteriormente
```

Deploy e migration não serão tratados como uma única operação atômica.

---

## 41. Credenciais de migration

Migrations deverão utilizar credencial separada da aplicação.

A credencial comum do runtime não deverá possuir permissões desnecessárias para:

* criar tabelas;
* alterar schema;
* habilitar extensões;
* remover estruturas.

---

## 42. Assets estáticos

Assets produzidos pelo Next.js poderão ser distribuídos pela rede da plataforma.

Eles deverão possuir:

* hashes;
* cache adequado;
* compressão;
* headers;
* ausência de secrets;
* política de invalidação.

Arquivos privados não deverão ser publicados como assets do build.

---

## 43. Imagens

Imagens externas e próprias deverão seguir o `RB-ADR-016` e as políticas dos respectivos Providers.

A otimização de imagem da plataforma deverá considerar:

* domínios permitidos;
* segurança;
* custos;
* caching;
* URLs temporárias;
* imagens privadas;
* termos de terceiros.

---

## 44. Cache do framework

O cache do Next.js deverá ser tratado separadamente do Redis.

Deverão ser definidos:

* escopo;
* região;
* tags;
* revalidação;
* dados públicos ou privados;
* invalidação;
* comportamento entre deployments.

Dados dependentes de Account ou autorização não deverão utilizar cache compartilhado sem chave e política adequadas.

---

## 45. Observabilidade

A aplicação deverá integrar:

* OpenTelemetry;
* Sentry;
* logs estruturados;
* release;
* deployment;
* environment;
* requestId;
* traceId.

Cada deployment deverá ser identificável na telemetria.

---

## 46. Logs da plataforma

Logs da Vercel poderão apoiar diagnóstico operacional.

Eles não substituirão:

* logs estruturados;
* Sentry;
* traces;
* audit trail;
* métricas de negócio.

A retenção e o acesso deverão ser avaliados conforme o plano utilizado.

---

## 47. Source maps

Source maps deverão ser enviados ao Sentry durante o pipeline.

Eles não deverão ser expostos publicamente sem necessidade.

O upload deverá utilizar credencial protegida.

---

## 48. Health checks

A aplicação deverá possuir verificações proporcionais para:

* configuração;
* aplicação;
* banco;
* dependências essenciais.

Health checks não deverão:

* executar operações caras;
* revelar secrets;
* revelar topologia interna;
* depender de Provider não essencial quando houver fallback.

---

## 49. Smoke tests

Após deployment de produção deverão ser executados smoke tests para:

* página pública;
* rota privada controlada;
* autenticação;
* banco;
* criação ou leitura sintética;
* endpoint do Inngest;
* storage;
* observabilidade.

Os testes deverão utilizar Account sintética e dados isolados.

---

## 50. Segurança de headers

A aplicação deverá configurar headers apropriados, incluindo conforme aplicável:

* Content Security Policy;
* Strict-Transport-Security;
* X-Content-Type-Options;
* Referrer-Policy;
* Permissions-Policy;
* proteção de framing;
* cache control.

A política final deverá ser compatível com:

* Google Maps;
* Sentry;
* R2;
* autenticação;
* imagens;
* scripts autorizados.

---

## 51. WAF e proteção de borda

Recursos de proteção da plataforma poderão ser utilizados para:

* bloqueio de padrões abusivos;
* proteção de endpoints;
* mitigação de bots;
* regras geográficas justificadas;
* rate limiting complementar.

Esses mecanismos não substituirão a autorização da aplicação nem o rate limiting distribuído do `RB-ADR-014`.

---

## 52. Rollout

Deployments deverão ser promovidos após:

* CI aprovado;
* migrations compatíveis;
* Preview validado;
* testes críticos;
* revisão;
* verificação de configuração.

Rollouts progressivos poderão ser adotados futuramente quando suportados e necessários.

---

## 53. Rollback

Rollback deverá priorizar a promoção de um deployment anterior conhecido.

Antes de rollback, deverá ser avaliado:

* schema do banco;
* migrations já executadas;
* eventos publicados;
* jobs ativos;
* compatibilidade de contratos;
* dados escritos pela versão nova.

Rollback de código não reverte automaticamente dados.

---

## 54. Roll-forward

Quando uma migration incompatibilizar a versão anterior, o tratamento preferencial poderá ser roll-forward com correção.

A estratégia deverá ser escolhida conforme o incidente.

---

## 55. Disponibilidade

A disponibilidade da aplicação dependerá de:

* Vercel;
* PostgreSQL;
* Redis;
* Inngest;
* Providers;
* DNS;
* R2.

Falhas externas deverão possuir degradação controlada quando possível.

---

## 56. Fallbacks

Exemplos:

### Redis indisponível

* cache bypass;
* comportamento fail-open ou fail-closed conforme a operação.

### Google Maps indisponível

* lista;
* dados canônicos;
* distância geográfica;
* mensagem de degradação.

### Provider de IA indisponível

* recursos determinísticos;
* último resultado permitido;
* execução posterior;
* mensagem transparente.

### Inngest indisponível

* outbox preserva intenção;
* publisher tenta posteriormente;
* aplicação não perde alteração canônica.

---

## 57. Custos

Os custos deverão ser acompanhados por:

* compute;
* bandwidth;
* image optimization;
* builds;
* Preview Deployments;
* logs;
* observabilidade;
* funções;
* chamadas externas;
* armazenamento associado.

Budgets e alertas deverão ser configurados conforme as capacidades do plano e dos Providers.

---

## 58. Escala

A plataforma deverá atender o estágio inicial sem configuração de servidores.

Escala futura deverá observar:

* concorrência de Functions;
* pool de banco;
* Redis;
* Inngest;
* custos;
* limites de execução;
* payloads;
* regiões;
* cold starts;
* cache.

---

## 59. Workloads inadequados para Functions

Workloads poderão precisar migrar para workers ou containers quando exigirem:

* execução prolongada não compatível;
* processos persistentes;
* sockets contínuos;
* binários específicos;
* alta CPU;
* memória elevada;
* controle detalhado de rede;
* processamento intensivo de arquivos.

Inngest não transforma automaticamente qualquer workload em adequado ao runtime da Vercel.

---

## 60. Infraestrutura como código

A infraestrutura deverá ser progressivamente versionada.

Deverão ser priorizados:

* configurações do projeto;
* variáveis declaradas por referência segura;
* domínios;
* recursos externos;
* policies;
* budgets;
* integrações;
* documentação operacional.

Secrets não deverão ser incluídos no estado versionado em texto aberto.

---

## 61. Configuração declarativa

Configurações específicas da Vercel poderão utilizar arquivos suportados pela plataforma quando agregarem:

* rastreabilidade;
* revisão;
* reprodutibilidade;
* consistência.

Configuração exclusiva pelo dashboard deverá ser documentada.

---

## 62. Ambientes efêmeros

Preview Deployments não implicam automaticamente infraestrutura de dados efêmera completa.

Para cada Preview deverão ser definidas estratégias para:

* PostgreSQL;
* Redis;
* Inngest;
* R2;
* autenticação;
* Providers.

A primeira abordagem poderá utilizar serviços compartilhados de Preview com isolamento rigoroso por namespace e dados sintéticos.

---

## 63. Isolamento de Preview

O isolamento deverá considerar:

* branch;
* deployment ID;
* namespace Redis;
* schema ou database;
* bucket prefix;
* ambiente Inngest;
* callbacks;
* usuários sintéticos.

Produção nunca deverá compartilhar namespace com Preview.

---

## 64. Exclusão de Preview

Ao encerrar um Preview, deverão ser removidos quando aplicável:

* dados;
* namespaces;
* objetos temporários;
* schedules;
* secrets específicos;
* recursos externos;
* registros de teste.

---

## 65. Proteção de branches

Deploy de produção deverá depender de branch ou referência protegida.

Regras recomendadas:

* pull request;
* revisão;
* CI;
* testes;
* ausência de conflitos;
* commits assinados quando adotado;
* bloqueio de push direto.

---

## 66. Controle de acesso à plataforma

O acesso à Vercel deverá utilizar:

* contas individuais;
* MFA;
* menor privilégio;
* separação entre proprietário e colaboradores;
* revisão periódica;
* remoção imediata de acessos desnecessários.

Tokens pessoais não deverão ser compartilhados.

---

## 67. Tokens de automação

Tokens utilizados pelo CI deverão:

* possuir escopo mínimo;
* estar em secrets;
* ser rotacionáveis;
* possuir owner;
* não ser exibidos em logs;
* ser revogados quando substituídos.

---

## 68. Backups

A Vercel não será considerada sistema de backup dos dados do RouteBook.

Backups deverão ser tratados nos serviços responsáveis por:

* PostgreSQL;
* R2;
* configurações;
* documentação;
* secrets;
* repositório.

Deployments anteriores também não substituem backup de dados.

---

## 69. Disaster recovery

A estratégia inicial deverá documentar:

* recriação do projeto;
* domínio;
* variáveis;
* secrets;
* conexão com dados;
* rollback;
* restauração de banco;
* reconstrução de caches;
* republicação de funções;
* recuperação do R2.

---

## 70. Portabilidade

O RouteBook deverá preservar a possibilidade de executar Next.js fora da Vercel.

Para isso:

* domínio não dependerá da plataforma;
* casos de uso não dependerão de APIs Vercel;
* dados permanecerão externos;
* object storage será compatível com S3;
* instrumentação utilizará OpenTelemetry;
* jobs possuirão handlers internos;
* configuração será centralizada;
* dependências específicas serão confinadas à composição.

---

## 71. Recursos proprietários

Recursos específicos da Vercel somente deverão ser adotados quando:

* resolverem problema real;
* o benefício for mensurável;
* a dependência estiver documentada;
* houver estratégia de saída;
* testes existirem.

Não deverão ser usados apenas por conveniência inicial quando substituírem contratos centrais.

---

## 72. Estratégia de saída

Uma migração para container ou outra plataforma deverá preservar:

* build Next.js;
* domínio;
* banco;
* Redis;
* R2;
* Inngest ou handlers;
* OpenTelemetry;
* Sentry;
* variáveis;
* domínios;
* contratos;
* testes.

A migração poderá exigir substituir:

* image optimization;
* cache do framework;
* routing de borda;
* Preview Deployments;
* deployment hooks;
* integração de Functions.

---

## 73. Testes unitários

Deverão cobrir:

* validação de ambiente;
* seleção de runtime;
* configuração de headers;
* construção de URLs;
* identificação de deployment;
* redaction;
* feature flags de ambiente;
* regras de Preview.

---

## 74. Testes de integração

Deverão validar:

* PostgreSQL;
* Redis;
* R2;
* Inngest;
* Better Auth;
* OpenTelemetry;
* Sentry;
* Google Maps server-side;
* variáveis por ambiente;
* timeouts;
* fallbacks.

---

## 75. Testes de Preview

Cada Preview relevante deverá validar:

* build;
* página pública;
* autenticação controlada;
* rota privada;
* isolamento;
* CSP;
* mapa;
* funções;
* logs;
* ausência de secrets no bundle.

---

## 76. Testes de produção

Smoke tests seguros deverão validar:

* domínio;
* TLS;
* redirects;
* página principal;
* autenticação;
* banco;
* storage;
* endpoint assíncrono;
* telemetria.

Eles não deverão utilizar dados reais.

---

## 77. Desenvolvimento assistido por IA

Agentes poderão apoiar:

* configuração;
* pipelines;
* testes;
* documentação;
* análise de deployments;
* runbooks;
* diagnóstico.

---

## 78. Limites para agentes

Agentes não poderão autonomamente:

* promover produção;
* alterar domínio;
* criar ou remover secret;
* acessar banco de produção;
* executar migration;
* mudar região;
* ampliar permissões;
* alterar budgets;
* desabilitar proteção de branch;
* expor variável server-only;
* alterar callback de autenticação;
* remover headers;
* habilitar recurso proprietário estrutural;
* excluir projeto;
* realizar rollback ou roll-forward em produção.

---

## 79. Consequências positivas

A decisão proporciona:

* integração direta com Next.js;
* baixo esforço operacional;
* Preview Deployments;
* deploys imutáveis;
* rollback simples de código;
* HTTPS;
* domínio;
* Functions;
* integração com GitHub;
* boa experiência para projeto individual;
* integração com Inngest;
* escala inicial;
* foco na implementação do produto.

---

## 80. Consequências negativas

A decisão introduz:

* dependência da Vercel;
* custos variáveis;
* limites de Functions;
* necessidade de compreender caches regionais;
* configuração específica;
* possível adaptação em migração futura;
* integração entre múltiplos Providers;
* risco de excesso de recursos proprietários;
* necessidade de gerenciar Preview e secrets cuidadosamente.

---

## 81. Riscos

### 81.1 Lock-in da plataforma

Mitigações:

* serviços de dados externos;
* OpenTelemetry;
* S3 compatibility;
* ports;
* adapters;
* self-hosting support;
* uso controlado de APIs proprietárias.

### 81.2 Conexões excessivas ao banco

Mitigações:

* pooling;
* limites;
* região próxima;
* observabilidade;
* testes de carga.

### 81.3 Preview acessando produção

Mitigações:

* secrets separados;
* políticas de ambiente;
* namespaces;
* testes;
* ausência de credenciais de produção.

### 81.4 Migration concorrente

Mitigações:

* pipeline separado;
* credencial própria;
* lock de migration;
* expand-contract.

### 81.5 Custos inesperados

Mitigações:

* budgets;
* alertas;
* cache;
* limites;
* observabilidade;
* revisão de planos.

### 81.6 Runtime incompatível

Mitigações:

* Node.js por padrão;
* testes;
* Edge somente com justificativa;
* versões fixadas.

### 81.7 Rollback incompatível com banco

Mitigações:

* migrations compatíveis;
* expand-contract;
* roll-forward;
* runbook.

### 81.8 Vazamento de secrets

Mitigações:

* validação;
* scopes;
* scanning;
* redaction;
* variáveis server-only;
* revisão de bundle.

---

## 82. Controles

Deverão ser implementados:

* integração GitHub;
* branch protegida;
* Preview Deployments;
* ambientes separados;
* Node.js fixado;
* pnpm fixado;
* lockfile imutável;
* secrets por ambiente;
* pooling;
* região definida;
* migrations separadas;
* CSP;
* headers;
* MFA;
* logs estruturados;
* Sentry;
* OpenTelemetry;
* smoke tests;
* budgets;
* runbooks;
* estratégia de saída.

---

## 83. Estratégia de implementação

### Etapa 1 — Projeto

* criar projeto Vercel;
* conectar ao GitHub;
* selecionar root directory;
* configurar Node.js e pnpm;
* validar build.

### Etapa 2 — Ambientes

* configurar Development;
* configurar Preview;
* configurar Production;
* adicionar schemas de ambiente;
* separar secrets.

### Etapa 3 — Dados

* configurar PostgreSQL;
* configurar pool;
* configurar Redis;
* configurar R2;
* validar regiões e TLS.

### Etapa 4 — Integrações

* configurar Better Auth;
* configurar Google Maps;
* configurar Inngest;
* configurar Sentry;
* configurar OpenTelemetry.

### Etapa 5 — Segurança

* configurar domínio;
* configurar HTTPS;
* configurar CSP;
* configurar headers;
* restringir origens;
* revisar tokens.

### Etapa 6 — Pipeline

* integrar lint;
* integrar typecheck;
* integrar testes;
* separar migrations;
* criar smoke tests;
* configurar release.

### Etapa 7 — Operação

* configurar alertas;
* configurar budgets;
* criar runbooks;
* testar rollback;
* documentar recuperação.

---

## 84. Critérios de implementação concluída

A decisão estará implementada quando:

* projeto estiver conectado ao GitHub;
* Preview Deployment funcionar;
* Production Deployment funcionar;
* domínio possuir HTTPS;
* Node.js estiver fixado;
* pnpm estiver fixado;
* variáveis estiverem validadas;
* secrets estiverem separados;
* PostgreSQL estiver acessível por conexão segura;
* Redis estiver acessível;
* Inngest estiver integrado;
* R2 estiver integrado;
* Sentry estiver associado à release;
* migrations estiverem fora do startup;
* smoke tests passarem;
* rollback de código estiver testado;
* Preview não acessar produção.

---

## 85. Verificação

A verificação deverá incluir:

* clone limpo;
* instalação imutável;
* build;
* Preview;
* produção;
* domínio;
* TLS;
* redirect;
* headers;
* CSP;
* autenticação;
* banco;
* Redis;
* R2;
* Inngest;
* Google Maps;
* observabilidade;
* erro com source map;
* migration;
* smoke test;
* rollback;
* isolamento de Preview.

---

## 86. Métricas

Poderão ser acompanhadas:

* duração do build;
* taxa de falha de deployment;
* frequência de deployment;
* tempo de recuperação;
* rollbacks;
* cold starts;
* duração de Functions;
* erros;
* latência;
* transferência;
* image optimization;
* Preview Deployments;
* conexões ao banco;
* custo por ambiente;
* incidentes de configuração;
* secrets expirados;
* smoke tests falhos.

---

## 87. Gatilhos de revisão

A decisão deverá ser revisada quando:

* os custos se tornarem desproporcionais;
* limites de Functions impedirem workloads;
* requisitos de processo persistente surgirem;
* a compatibilidade do Next.js fora da Vercel amadurecer materialmente;
* Cloudflare Workers oferecer vantagem comprovada;
* containers reduzirem custo ou complexidade;
* residência de dados exigir nova topologia;
* multi-region se tornar necessária;
* requisitos empresariais exigirem rede privada avançada;
* lock-in impedir evolução;
* outro Provider oferecer benefício operacional mensurável.

---

## 88. Estratégia de rollback da decisão

A substituição da plataforma deverá ser registrada em novo ADR.

A migração deverá:

1. construir a aplicação na nova plataforma;
2. configurar ambientes;
3. configurar secrets;
4. conectar serviços externos;
5. validar domínio alternativo;
6. executar smoke tests;
7. realizar cutover controlado;
8. preservar rollback DNS;
9. monitorar;
10. desativar a plataforma anterior após estabilização.

---

## 89. Próxima decisão

O `RB-ADR-018` deverá definir o Provider inicial de PostgreSQL e PostGIS gerenciado.

A decisão deverá avaliar:

* Neon;
* Supabase;
* AWS RDS;
* Google Cloud SQL;
* Railway;
* Crunchy Bridge;
* Aiven;
* pooling;
* branching;
* backups;
* point-in-time recovery;
* regiões;
* extensões;
* PostGIS;
* conexões serverless;
* migrations;
* custos;
* portabilidade.

A decisão deverá preservar PostgreSQL padrão, PostGIS e compatibilidade com Drizzle.

---

## 90. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-017
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar o contexto histórico.

---

## 91. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* Vercel está justificada;
* Cloudflare Workers foi avaliado;
* containers foram avaliados;
* AWS foi avaliada;
* VPS foi avaliada;
* GitHub está definido como origem;
* Preview Deployments estão definidos;
* ambientes estão definidos;
* Node.js está definido;
* Edge Runtime está limitado;
* regiões estão governadas;
* PostgreSQL está contemplado;
* pooling está contemplado;
* Redis está contemplado;
* Inngest está contemplado;
* R2 está contemplado;
* Google Maps está contemplado;
* variáveis estão definidas;
* secrets estão protegidos;
* domínio está contemplado;
* build está definido;
* Turborepo está contemplado;
* migrations estão separadas;
* expand-contract está definido;
* cache está contemplado;
* observabilidade está definida;
* headers estão definidos;
* rollback está definido;
* custos estão contemplados;
* Preview está isolado;
* portabilidade está definida;
* testes estão definidos;
* agentes estão contemplados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* estratégia de saída está definida;
* supersessão está definida;
* não existem contradições com RB-ADR-003;
* não existem contradições com RB-ADR-004;
* não existem contradições com RB-ADR-005;
* não existem contradições com RB-ADR-007;
* não existem contradições com RB-ADR-010;
* não existem contradições com RB-ADR-013;
* não existem contradições com RB-ADR-014;
* não existem contradições com RB-ADR-015;
* não existem contradições com RB-ADR-016.

---

## 92. Declaração final

O RouteBook adotará a Vercel como plataforma inicial de build, hosting e execução da aplicação web Next.js.

A Vercel será responsável por:

* deployments;
* Preview Deployments;
* hosting;
* distribuição de assets;
* Functions;
* domínio;
* HTTPS;
* integração com GitHub.

O runtime Node.js será utilizado como padrão para operações server-side.

Edge Runtime somente será adotado quando houver benefício comprovado e compatibilidade completa.

PostgreSQL, PostGIS, Redis, Inngest, Cloudflare R2, Google Maps Platform e Providers de IA permanecerão serviços externos e independentes.

GitHub continuará sendo a fonte canônica do código e da documentação.

Migrations serão executadas em etapa controlada e separada do startup da aplicação.

Preview Deployments não terão acesso aos dados ou secrets de produção.

A região das Functions será escolhida prioritariamente pela proximidade com o banco principal.

O RouteBook evitará dependências proprietárias nas camadas de domínio e aplicação.

Essa separação permitirá utilizar a experiência operacional da Vercel durante o estágio inicial sem impedir uma futura migração para Cloudflare Workers, containers ou outra plataforma compatível com Next.js.
