---

id: RB-ADR-019

title: Adoção do GitHub Actions para Integração Contínua e Governança de Entregas
description: Registra a decisão de adotar GitHub Actions como plataforma principal de integração contínua, automação de qualidade, migrations, releases e governança das entregas do RouteBook, mantendo a integração Git da Vercel responsável pelos Preview Deployments e deployments da aplicação.

document_type: architecture_decision_record
owner: Architecture

status: Draft
version: "0.1.0"

created: "2026-07-27"
last_updated: null

authors:

- RouteBook Team

tags:

- architecture
- adr
- github-actions
- continuous-integration
- continuous-delivery
- deployment
- pipelines
- quality-gates
- migrations
- releases
- supply-chain-security
- vercel
- neon
- turborepo
- monorepo

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
- RB-GOV-001
- RB-GOV-002
- RB-RISK-001
- RB-DEL-001
- RB-DEV-001
- RB-CICD-001
- RB-INFRA-001
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
- RB-ADR-017
- RB-ADR-018

prerequisites:

- RB-FND-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-ARC-005
- RB-SEC-001
- RB-SEC-002
- RB-SEC-003
- RB-OBS-001
- RB-QA-001
- RB-QA-002
- RB-OPS-001
- RB-OPS-002
- RB-SRE-001
- RB-GOV-002
- RB-DEL-001
- RB-DEV-001
- RB-CICD-001
- RB-INFRA-001
- RB-ADR-003
- RB-ADR-004
- RB-ADR-005
- RB-ADR-006
- RB-ADR-008
- RB-ADR-009
- RB-ADR-010
- RB-ADR-013
- RB-ADR-015
- RB-ADR-016
- RB-ADR-017
- RB-ADR-018

next_documents:

- RB-ADR-020

ai_context:
priority: critical
index: true
---

# RB-ADR-019 — Adoção do GitHub Actions para Integração Contínua e Governança de Entregas

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* GitHub Actions será a plataforma principal de integração contínua;
* GitHub será a fonte canônica de código, documentação e histórico de mudanças;
* pull requests deverão passar por quality gates antes do merge;
* a integração Git da Vercel continuará responsável pelos Preview Deployments;
* deployments de produção dependerão de referência protegida e checks obrigatórios;
* migrations serão executadas por workflows controlados;
* GitHub Environments serão utilizados para proteger operações sensíveis;
* branches temporárias do Neon poderão ser coordenadas pelo pipeline;
* releases serão identificáveis por commit, versão e deployment;
* dependências e actions deverão ser fixadas e revisadas;
* secrets de produção não serão disponibilizados a workflows de pull requests não confiáveis;
* agentes de IA não poderão promover deployments ou executar migrations de produção autonomamente.

---

## 2. Contexto

O RouteBook adotou:

* GitHub como repositório canônico;
* pnpm Workspaces;
* Turborepo;
* Next.js;
* Vercel;
* Neon;
* PostgreSQL;
* PostGIS;
* Redis;
* Inngest;
* Cloudflare R2;
* OpenTelemetry;
* Sentry;
* Vitest;
* Testing Library;
* Playwright;
* Testcontainers.

Essa composição exige automação para validar e coordenar:

* instalação;
* documentação;
* formatação;
* lint;
* typecheck;
* testes;
* arquitetura;
* schemas;
* migrations;
* segurança;
* builds;
* Preview Deployments;
* releases;
* source maps;
* smoke tests;
* limpeza de recursos temporários;
* rollback e recuperação.

A automação deverá preservar segurança sem criar uma plataforma excessivamente complexa para um projeto inicialmente pessoal.

---

## 3. Problema

Qual estratégia deverá ser adotada para integração contínua, entrega contínua e governança de deployments, considerando:

* monorepo;
* GitHub;
* Vercel;
* Neon;
* migrations;
* Preview Deployments;
* quality gates;
* segurança da cadeia de software;
* secrets;
* releases;
* ambientes;
* rollback;
* custo;
* desenvolvimento assistido por IA?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. integração nativa com GitHub;
2. qualidade antes do merge;
3. suporte ao monorepo;
4. execução seletiva;
5. integração com Turborepo;
6. Preview Deployments;
7. proteção da produção;
8. migrations controladas;
9. secrets por ambiente;
10. rastreabilidade;
11. segurança da cadeia de software;
12. caching;
13. paralelismo;
14. observabilidade;
15. rollback;
16. baixo custo operacional;
17. reprodutibilidade;
18. princípio do menor privilégio;
19. compatibilidade com agentes de IA;
20. portabilidade futura.

---

## 5. Restrições

A solução deverá:

* integrar-se ao GitHub;
* funcionar com pnpm;
* funcionar com Turborepo;
* suportar Node.js;
* validar o monorepo;
* proteger a branch principal;
* separar pull requests, Preview e produção;
* proteger secrets;
* impedir acesso de forks a credenciais sensíveis;
* controlar concorrência;
* executar migrations de forma exclusiva;
* permitir cancelamento de execuções obsoletas;
* gerar evidências de qualidade;
* não depender exclusivamente de operações manuais;
* não permitir que o deployment substitua os quality gates;
* não executar código não confiável com secrets de produção;
* não utilizar versões flutuantes de actions sensíveis;
* não executar migrations no startup da aplicação.

---

## 6. Terminologia

### 6.1 Continuous Integration

Integração frequente de mudanças acompanhada de validações automatizadas.

### 6.2 Continuous Delivery

Manutenção do código em estado entregável, com promoção controlada para produção.

### 6.3 Continuous Deployment

Publicação automática em produção após os gates definidos, sem aprovação manual obrigatória.

### 6.4 Workflow

Arquivo declarativo que define triggers, jobs, permissões e steps executados pelo GitHub Actions.

### 6.5 Job

Conjunto de steps executado em um runner.

### 6.6 Quality Gate

Condição obrigatória que uma mudança precisa atender antes de avançar.

### 6.7 Environment

Escopo protegido para deployments, secrets e regras de aprovação.

### 6.8 Release

Identificação de uma versão entregável do produto associada a código, artefatos e deployments.

### 6.9 Promotion

Ação de disponibilizar uma versão previamente validada em um ambiente superior.

### 6.10 Rollback

Retorno da aplicação a uma versão anterior compatível.

---

## 7. Princípio central

Integração, validação, deployment e migration são processos relacionados, mas distintos.

```text
código
→ integração contínua
→ quality gates
→ build
→ Preview Deployment
→ aprovação
→ migration controlada
→ deployment de produção
→ smoke tests
```

O sucesso do build não será considerado evidência suficiente para produção.

---

## 8. Opções consideradas

### 8.1 Apenas integração Git da Vercel

Utilizar somente os builds e deployments iniciados pela Vercel.

#### Benefícios

* configuração mínima;
* integração direta com Next.js;
* Preview Deployments;
* logs de build;
* baixa carga operacional.

#### Limitações

* cobertura insuficiente para workflows independentes;
* menor controle sobre migrations;
* menor adequação para testes matriciais;
* menor governança de supply chain;
* coordenação limitada de recursos externos;
* quality gates excessivamente ligados ao deployment.

#### Avaliação

A integração da Vercel continuará responsável pelos deployments da aplicação, mas não será o pipeline completo do RouteBook.

---

### 8.2 GitHub Actions para tudo, incluindo deployment manual da Vercel

Desabilitar a integração Git da Vercel e controlar todos os deployments pelo GitHub Actions e pela CLI.

#### Benefícios

* pipeline centralizado;
* controle explícito;
* maior previsibilidade da ordem;
* promoção customizada;
* integração direta com environments.

#### Limitações

* duplicação de recursos já fornecidos pela integração Git;
* maior gestão de tokens;
* maior configuração;
* perda de simplicidade dos Preview Deployments automáticos;
* maior responsabilidade operacional.

#### Avaliação

Poderá ser adotado futuramente caso a promoção exija controle mais rígido.

Não foi selecionado inicialmente.

---

### 8.3 Plataforma externa de CI

Utilizar CircleCI, Buildkite ou plataforma equivalente.

#### Benefícios

* recursos avançados;
* runners;
* paralelismo;
* pipelines especializados;
* controle de performance.

#### Limitações

* nova plataforma;
* novas credenciais;
* custo;
* menor proximidade com o repositório;
* complexidade desnecessária para o estágio atual.

#### Avaliação

Foi rejeitada.

---

### 8.4 GitHub Actions com integração Git da Vercel

Utilizar:

* GitHub Actions para validação, segurança, migrations e governança;
* Vercel Git Integration para Preview e Production Deployments;
* Neon para branches temporárias;
* GitHub Environments para operações protegidas.

#### Benefícios

* integração direta com o repositório;
* pull request checks;
* environments;
* proteção de secrets;
* actions reutilizáveis;
* suporte ao monorepo;
* integração com Turborepo;
* Preview Deployments automáticos;
* menor duplicação operacional;
* flexibilidade para evoluir.

#### Limitações

* coordenação entre GitHub e Vercel;
* possibilidade de builds duplicados;
* necessidade de definir claramente responsabilidades;
* consumo de minutos e cache;
* necessidade de proteger actions e tokens;
* migrations exigem workflow específico.

#### Avaliação

Oferece o melhor equilíbrio.

Foi selecionada.

---

## 9. Decisão

O RouteBook adotará:

* **GitHub Actions** como plataforma principal de CI e automação operacional;
* **Vercel Git Integration** como mecanismo inicial de Preview e Production Deployments da aplicação;
* **GitHub Environments** para operações protegidas;
* **branch protection e required checks** para controlar merges;
* **Turborepo** para orquestração e execução seletiva;
* **Remote Cache** apenas após configuração segura;
* **Neon branches** para Previews que necessitem de banco isolado;
* **workflows reutilizáveis** para reduzir duplicação;
* **migrations em workflow separado**;
* **releases associadas a commits e deployments**;
* **smoke tests posteriores ao deployment**.

---

## 10. Modelo de entrega

O RouteBook adotará inicialmente **Continuous Delivery**, não Continuous Deployment irrestrito.

Isso significa:

* todas as mudanças deverão permanecer potencialmente entregáveis;
* pull requests serão validadas automaticamente;
* Preview Deployments serão automáticos;
* produção dependerá da branch protegida e dos gates definidos;
* migrations sensíveis poderão exigir aprovação;
* automação não removerá o controle sobre mudanças de alto risco.

A adoção futura de Continuous Deployment exigirá evidência de estabilidade e novo registro decisório quando houver impacto estrutural.

---

## 11. Responsabilidades por plataforma

### GitHub

Responsável por:

* fonte canônica;
* pull requests;
* revisão;
* branch protection;
* Actions;
* checks;
* environments;
* histórico de mudanças.

### Vercel

Responsável por:

* build da aplicação;
* Preview Deployment;
* Production Deployment;
* hosting;
* runtime;
* domínio;
* HTTPS.

### Neon

Responsável por:

* PostgreSQL;
* PostGIS;
* branches de banco;
* histórico e restauração;
* pooling.

### Sentry

Responsável por:

* releases de observabilidade;
* source maps;
* erros;
* performance.

---

## 12. Eventos que disparam workflows

Triggers iniciais poderão incluir:

```text
pull_request
push
workflow_dispatch
schedule
release
deployment_status
```

Cada trigger deverá possuir finalidade clara.

Workflows sensíveis não deverão executar a partir de qualquer evento sem restrições.

---

## 13. Workflow de pull request

O workflow principal de pull request deverá executar:

1. checkout;
2. configuração de Node.js;
3. configuração do pnpm;
4. instalação imutável;
5. validação da documentação;
6. lint;
7. typecheck;
8. testes unitários;
9. testes de arquitetura;
10. testes de componentes;
11. testes de schemas;
12. build;
13. verificações de segurança;
14. testes adicionais conforme arquivos afetados.

---

## 14. Quality gates obrigatórios

Gates iniciais:

* lockfile válido;
* formatação ou verificação equivalente;
* lint aprovado;
* typecheck aprovado;
* testes unitários aprovados;
* testes de arquitetura aprovados;
* schemas aprovados;
* build aprovado;
* migrations válidas quando alteradas;
* ausência de vulnerabilidade bloqueante segundo política;
* documentação obrigatória atualizada;
* testes cross-account aprovados quando aplicáveis.

---

## 15. Checks especializados

Checks adicionais deverão ser ativados conforme a mudança.

Exemplos:

### Alteração de banco

* migration validation;
* banco vazio;
* banco evoluído;
* PostGIS;
* compatibilidade.

### Alteração de interface

* component tests;
* Playwright;
* acessibilidade;
* Preview Deployment.

### Alteração de Providers

* contract tests;
* schemas;
* custo;
* rate limiting;
* fallback.

### Alteração de IA

* Structured Outputs;
* Tools;
* evaluations controladas;
* políticas;
* custo.

---

## 16. Required checks

A branch principal deverá exigir os checks considerados essenciais.

Os nomes dos checks deverão permanecer estáveis.

Renomear um job obrigatório deverá considerar a configuração da branch protection.

Checks obrigatórios não deverão ser ignorados por push direto.

---

## 17. Branch principal

A branch principal deverá possuir:

* pull request obrigatório;
* checks obrigatórios;
* branch atualizada conforme política;
* resolução de conversas;
* restrição de push direto;
* restrição de force push;
* proteção contra exclusão;
* revisão quando aplicável.

---

## 18. Revisões

Mudanças de alto risco deverão exigir revisão proporcional.

Exemplos:

* migrations;
* autenticação;
* autorização;
* secrets;
* workflows;
* infrastructure;
* dependências críticas;
* processamento de dados pessoais;
* Tools mutáveis;
* capacidades de IA com efeitos.

CODEOWNERS poderá ser adotado para direcionar revisões.

---

## 19. Estratégia de branches

O RouteBook utilizará uma estratégia próxima de trunk-based development.

Características:

* branch principal estável;
* branches curtas;
* pull requests pequenas;
* integração frequente;
* ausência de branches permanentes por ambiente;
* feature flags quando necessárias.

Branches longas deverão ser evitadas.

---

## 20. Preview Deployment

A integração da Vercel deverá criar Preview Deployment para pull requests elegíveis.

O Preview será utilizado para:

* revisão visual;
* responsividade;
* testes funcionais;
* autenticação controlada;
* validação de integrações isoladas;
* smoke tests;
* verificação de headers e CSP.

Preview não constitui aprovação automática para produção.

---

## 21. Coordenação com os checks

A Vercel poderá iniciar o Preview enquanto o CI executa.

Entretanto:

* a mudança não poderá ser mesclada enquanto os gates falharem;
* o Preview não deverá receber secrets de produção;
* funcionalidades críticas poderão permanecer desabilitadas até validação;
* o deployment não deverá ser considerado confiável somente porque o build foi concluído.

---

## 22. Banco para Preview

Pull requests que alterarem banco ou exigirem persistência isolada poderão utilizar branch temporária do Neon.

Fluxo conceitual:

```text
pull request aberta
→ criar branch do Neon
→ obter conexão temporária
→ aplicar migrations
→ inserir seeds sintéticos
→ disponibilizar ao Preview
→ executar testes
```

---

## 23. Limpeza do Preview

Após fechamento ou merge da pull request:

```text
encerrar Preview
→ remover branch do Neon
→ remover namespace Redis
→ remover objetos temporários
→ cancelar schedules
→ revogar secrets temporários
```

A limpeza deverá ser idempotente.

---

## 24. Produção

O deployment de produção será associado à branch protegida.

Antes da entrega deverão estar aprovados:

* quality gates;
* revisão;
* migrations compatíveis;
* configuração;
* segurança;
* documentação aplicável.

Operações de alto risco poderão usar GitHub Environment protegido.

---

## 25. GitHub Environments

Ambientes poderão incluir:

* preview-operations;
* staging;
* production;
* production-migrations.

Cada environment poderá definir:

* secrets;
* variáveis;
* regras;
* branches permitidas;
* aprovação;
* timeout;
* owner.

Secrets de environment somente deverão estar disponíveis ao job que realmente precisar deles.

---

## 26. Migrations

Migrations serão executadas em workflow separado da aplicação.

O workflow deverá:

* utilizar conexão direta;
* utilizar credencial própria;
* executar uma vez por ambiente;
* possuir concurrency group;
* validar estado;
* registrar migration aplicada;
* produzir logs sanitizados;
* falhar de maneira explícita;
* impedir concorrência.

---

## 27. Workflow de migration

Fluxo conceitual:

```text
selecionar referência aprovada
→ validar migration
→ acessar environment protegido
→ verificar banco
→ executar migration
→ verificar schema
→ registrar resultado
→ liberar deployment compatível
```

Mudanças destrutivas deverão seguir expand-contract.

---

## 28. Concorrência de migrations

O workflow deverá utilizar grupo exclusivo por ambiente.

Exemplo conceitual:

```yaml
concurrency:
  group: database-migration-production
  cancel-in-progress: false
```

Uma migration em andamento não deverá ser cancelada automaticamente por um commit posterior.

---

## 29. Concorrência de pull requests

Workflows de validação poderão cancelar execuções obsoletas da mesma pull request.

Exemplo conceitual:

```yaml
concurrency:
  group: ci-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

Isso reduz consumo sem afetar execuções de outras mudanças.

---

## 30. Instalação reproduzível

O pipeline deverá utilizar:

* versão fixada de Node.js;
* versão fixada do pnpm;
* Corepack ou mecanismo equivalente;
* `pnpm-lock.yaml`;
* instalação imutável;
* cache controlado.

Comando conceitual:

```bash
pnpm install --frozen-lockfile
```

---

## 31. Turborepo

Turborepo deverá coordenar tarefas do monorepo.

Exemplo conceitual:

```bash
pnpm turbo run lint typecheck test build
```

A configuração deverá declarar corretamente:

* dependencies;
* inputs;
* outputs;
* environment variables;
* cache;
* persistent tasks.

---

## 32. Execução seletiva

O pipeline poderá utilizar o grafo do monorepo para reduzir trabalho.

Entretanto, verificações globais deverão continuar completas quando mudanças afetarem:

* configuração raiz;
* lockfile;
* TypeScript base;
* lint;
* Turborepo;
* segurança;
* packages compartilhados;
* contratos;
* migrations.

Otimização não deverá comprometer confiança.

---

## 33. Remote Cache

O Remote Cache poderá ser habilitado para acelerar:

* build;
* lint;
* typecheck;
* testes determinísticos;
* geração de artefatos.

Antes da ativação deverão ser avaliados:

* autenticação;
* isolamento;
* secrets;
* variáveis;
* outputs;
* custo;
* possibilidade de cache poisoning;
* comportamento em forks.

---

## 34. Regras de cache

Não deverão ser cacheados como resultados determinísticos:

* testes com Provider real;
* testes dependentes de horário real;
* migrations executadas;
* deploys;
* smoke tests;
* evaluations probabilísticas;
* operações com produção;
* dados não versionados.

---

## 35. Cache poisoning

Para reduzir o risco de resultados não confiáveis:

* forks não deverão escrever no cache confiável sem política;
* inputs deverão ser completos;
* variáveis relevantes deverão ser declaradas;
* secrets não deverão entrar em outputs;
* artefatos restaurados deverão ser tratados conforme sua origem;
* mudanças de configuração deverão invalidar o cache.

---

## 36. Testes unitários

Testes unitários deverão executar em toda pull request relevante.

Eles deverão:

* ser rápidos;
* ser determinísticos;
* não chamar Providers reais;
* não exigir secrets;
* não depender de ordem;
* produzir relatório de falhas.

---

## 37. Testes de integração

Testes de integração poderão utilizar Testcontainers para:

* PostgreSQL;
* PostGIS;
* Redis;
* storage compatível com S3.

Esses testes poderão ser separados em jobs paralelos.

---

## 38. Testes end-to-end

Baseline:

* jornadas críticas em Chromium nas pull requests relevantes;
* matriz ampliada na branch principal ou execução programada;
* Firefox e WebKit conforme a estratégia de testes;
* traces e screenshots em falhas.

O teste deverá apontar para ambiente isolado.

---

## 39. Evaluations de IA

Evaluations que utilizem modelos reais não deverão bloquear toda pull request inicialmente.

Elas poderão executar:

* manualmente;
* na branch principal;
* em schedule;
* quando arquivos relevantes mudarem.

Deverão possuir:

* dataset versionado;
* budget;
* modelo fixado;
* rubrica;
* resultados persistidos;
* threshold;
* revisão.

---

## 40. Segurança da cadeia de software

O pipeline deverá incluir progressivamente:

* dependency review;
* secret scanning;
* code scanning;
* análise de dependências;
* verificação de licenças;
* atualização automatizada controlada;
* artifact attestations quando aplicáveis;
* revisão de actions externas.

---

## 41. Actions de terceiros

Actions externas deverão:

* possuir origem confiável;
* ser necessárias;
* possuir permissões mínimas;
* ser fixadas em versão imutável, preferencialmente commit completo;
* ser revisadas antes da adoção;
* não receber secrets sem necessidade.

Tags flutuantes não deverão ser tratadas como garantia de imutabilidade.

---

## 42. Permissões do workflow

O baseline deverá ser:

```yaml
permissions:
  contents: read
```

Permissões adicionais deverão ser concedidas por job e somente quando necessárias.

Exemplos:

* `pull-requests: write`;
* `checks: write`;
* `id-token: write`;
* `deployments: write`.

`write-all` não deverá ser utilizado por conveniência.

---

## 43. OpenID Connect

Quando um Provider suportar autenticação federada, deverá ser preferida identidade temporária por OIDC em vez de secrets estáticos de longa duração.

A adoção deverá considerar:

* suporte do Provider;
* audience;
* subject;
* branch;
* environment;
* menor privilégio;
* duração.

---

## 44. Secrets

Secrets deverão:

* pertencer ao menor escopo possível;
* ser separados por ambiente;
* possuir owner;
* possuir finalidade;
* ser rotacionáveis;
* não aparecer em logs;
* não ser enviados a jobs desnecessários;
* não ser disponibilizados a código não confiável.

---

## 45. Pull requests de forks

Workflows de forks deverão executar somente atividades seguras.

Eles não deverão receber:

* secrets;
* tokens administrativos;
* acesso ao Neon;
* acesso ao R2;
* acesso ao Inngest;
* acesso ao Sentry;
* acesso à Vercel;
* acesso a Providers pagos.

Deverão utilizar:

* Testcontainers;
* fakes;
* fixtures;
* builds locais ao runner.

---

## 46. `pull_request_target`

O evento `pull_request_target` não deverá executar código da pull request com secrets.

Seu uso deverá ser restrito a operações sobre metadados, após revisão de segurança.

---

## 47. Dependências

Mudanças de dependências deverão validar:

* lockfile;
* vulnerabilidades;
* licença;
* tamanho;
* origem;
* manutenção;
* duplicação;
* compatibilidade;
* necessidade.

Atualizações automáticas deverão produzir pull requests revisáveis.

---

## 48. Artifact attestations

Artefatos distribuíveis poderão receber atestação de proveniência quando aplicável.

A atestação não substituirá:

* testes;
* revisão;
* assinatura de commits quando adotada;
* proteção de secrets;
* controle de dependências.

---

## 49. Artefatos do pipeline

Poderão ser armazenados:

* relatórios de testes;
* cobertura;
* traces Playwright;
* screenshots;
* resultados de evaluations;
* migration plans;
* manifests;
* logs sanitizados.

Artefatos deverão possuir:

* retenção;
* acesso;
* limite de tamanho;
* classificação;
* ausência de dados pessoais;
* ausência de secrets.

---

## 50. Cobertura

Relatórios de cobertura poderão ser publicados como evidência.

A cobertura não será utilizada isoladamente para aprovar uma mudança.

Mudanças em módulos críticos deverão ser avaliadas pelo comportamento coberto.

---

## 51. Releases

Toda entrega de produção deverá poder ser identificada por:

* commit SHA;
* deployment;
* ambiente;
* data;
* migration state;
* versão da aplicação;
* release do Sentry;
* conjunto de funções do Inngest.

---

## 52. Estratégia de versão

Enquanto o produto estiver em desenvolvimento inicial, a versão poderá permanecer `0.x.y`.

Releases formais deverão seguir uma convenção estável, preferencialmente SemVer quando aplicável.

A versão do documento e a versão da aplicação são conceitos distintos.

---

## 53. Changelog

Mudanças relevantes deverão possuir registro legível.

O changelog poderá ser gerado a partir de:

* pull requests;
* labels;
* commits;
* release notes;
* documentos alterados.

Commits não deverão ser a única fonte de comunicação das mudanças.

---

## 54. Source maps

O pipeline deverá associar source maps ao release correto no Sentry.

O upload deverá:

* utilizar secret protegido;
* ocorrer somente no ambiente apropriado;
* não publicar mapas publicamente sem necessidade;
* falhar de maneira observável;
* não impedir rollback do código.

---

## 55. Inngest

Deployments deverão preservar a compatibilidade das funções ativas.

Mudanças deverão validar:

* IDs das functions;
* IDs dos steps;
* schemas de eventos;
* execuções em andamento;
* schedules;
* secrets;
* ambiente.

---

## 56. Cloudflare R2

Workflows administrativos poderão validar:

* buckets;
* CORS;
* lifecycle;
* credenciais;
* objetos de teste;
* limpeza.

O CI não deverá receber credenciais de produção quando não forem necessárias.

---

## 57. Deployment status

Após um Preview ou Production Deployment, workflows poderão reagir ao status do deployment para executar:

* smoke tests;
* Playwright;
* verificação de headers;
* validação de health;
* confirmação de release.

Esses testes deverão possuir timeout e cleanup.

---

## 58. Smoke tests de produção

Após o deployment deverão validar, de forma segura:

* página pública;
* HTTPS;
* rota principal;
* autenticação controlada;
* conexão com banco;
* leitura sintética;
* endpoint do Inngest;
* telemetria;
* fallback crítico.

Não deverão utilizar dados reais.

---

## 59. Falha após deployment

Quando smoke tests falharem, o pipeline deverá:

1. marcar a entrega como degradada;
2. impedir promoções adicionais;
3. preservar evidências;
4. notificar o owner;
5. avaliar rollback ou roll-forward;
6. registrar o incidente quando aplicável.

---

## 60. Rollback

Rollback de código deverá utilizar deployment anterior conhecido.

Antes de executar, deverão ser verificados:

* migrations aplicadas;
* compatibilidade do schema;
* jobs ativos;
* eventos publicados;
* dados escritos;
* feature flags;
* contratos externos.

Rollback não desfaz automaticamente uma migration ou efeito externo.

---

## 61. Roll-forward

Roll-forward deverá ser preferido quando:

* a versão anterior for incompatível com o schema;
* dados já tiverem sido transformados;
* efeitos externos não puderem ser revertidos;
* a correção for mais segura que o retorno.

---

## 62. Aprovação de produção

Enquanto o produto possuir operação pessoal e baixo risco, o merge protegido poderá iniciar o deployment de produção.

Migrations destrutivas, mudanças de segurança e operações emergenciais deverão possuir aprovação explícita.

À medida que o produto evoluir, o environment de produção poderá exigir reviewer obrigatório para toda promoção.

---

## 63. Workflows manuais

`workflow_dispatch` poderá ser utilizado para:

* migration controlada;
* restore test;
* limpeza;
* backfill;
* evaluation;
* rotação;
* smoke test;
* operação emergencial.

Inputs deverão ser:

* tipados;
* limitados;
* validados;
* registrados;
* livres de secrets.

---

## 64. Schedules

Workflows programados poderão executar:

* dependency checks;
* avaliações completas;
* testes de restore;
* limpeza de recursos;
* verificação de branches órfãs;
* security scans;
* health checks.

Schedules deverão possuir owner e timezone conhecido.

---

## 65. Runners

GitHub-hosted runners serão utilizados inicialmente.

Self-hosted runners somente deverão ser adotados quando houver necessidade de:

* rede privada;
* hardware específico;
* custo comprovadamente menor;
* performance;
* compliance;
* workloads especializados.

---

## 66. Segurança de self-hosted runners

Caso adotados, runners próprios não deverão executar código não confiável sem isolamento forte.

Deverão ser:

* efêmeros quando possível;
* atualizados;
* monitorados;
* restritos;
* sem credenciais persistentes;
* separados por nível de confiança.

---

## 67. Timeouts

Todos os jobs deverão possuir timeout proporcional.

Workflows não deverão permanecer executando indefinidamente por:

* teste travado;
* Provider indisponível;
* migration bloqueada;
* processo filho;
* browser;
* container.

---

## 68. Retries

Retries no CI deverão ser utilizados somente para falhas transitórias conhecidas.

Não deverão mascarar:

* teste flaky;
* migration inválida;
* erro de build;
* falha de autorização;
* vulnerabilidade;
* configuração incorreta.

---

## 69. Flaky tests

Teste flaky deverá ser tratado como defeito.

O pipeline poderá repetir temporariamente para diagnóstico, mas a repetição não deverá transformar um teste instável em gate confiável.

Quarentena deverá possuir:

* issue;
* owner;
* prazo;
* justificativa;
* critério de saída.

---

## 70. Observabilidade do pipeline

Deverão ser acompanhados:

* duração;
* falhas;
* cancelamentos;
* cache hit;
* tempo por job;
* testes flaky;
* custo;
* uso de runners;
* migrations;
* deployments;
* rollbacks;
* recursos de Preview órfãos.

---

## 71. Métricas de entrega

Poderão ser acompanhadas:

* deployment frequency;
* lead time for changes;
* change failure rate;
* mean time to restore;
* tempo de pull request;
* taxa de falha do CI;
* duração do build;
* duração dos testes;
* frequência de rollback;
* migrations falhas.

---

## 72. Notificações

Falhas relevantes deverão ser comunicadas ao owner apropriado.

Notificações deverão ser acionáveis e incluir:

* workflow;
* commit;
* ambiente;
* job;
* resultado;
* evidência;
* ação recomendada.

---

## 73. Documentação

Mudanças estruturais deverão atualizar:

* ADRs;
* registry;
* runbooks;
* variáveis;
* scripts;
* pipelines;
* decisões derivadas.

A documentação não deverá divergir silenciosamente do workflow real.

---

## 74. Workflows reutilizáveis

Comportamentos compartilhados deverão ser extraídos para workflows reutilizáveis quando houver repetição real.

Exemplos:

* setup do monorepo;
* quality checks;
* migration validation;
* smoke tests;
* security scans.

A abstração não deverá dificultar o diagnóstico.

---

## 75. Composite actions locais

Composite actions locais poderão encapsular steps estáveis.

Elas deverão:

* permanecer no repositório;
* possuir responsabilidade limitada;
* ser versionadas junto ao código;
* receber inputs explícitos;
* não ocultar permissões ou secrets.

---

## 76. Organização dos workflows

Estrutura conceitual:

```text
.github/
├── workflows/
│   ├── ci.yml
│   ├── database-validation.yml
│   ├── production-migration.yml
│   ├── post-deployment-smoke.yml
│   ├── scheduled-quality.yml
│   └── cleanup-preview.yml
├── actions/
└── dependabot.yml
```

A quantidade de workflows deverá permanecer proporcional às responsabilidades reais.

---

## 77. Workflow principal conceitual

```yaml
name: Continuous Integration

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@<commit-fixado>

      - uses: actions/setup-node@<commit-fixado>
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"

      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run lint typecheck test build
```

A configuração real deverá separar jobs conforme custo e paralelismo.

---

## 78. Pipeline mínimo da primeira implementação

O primeiro pipeline deverá conter:

* checkout;
* setup do Node.js;
* setup do pnpm;
* cache;
* instalação imutável;
* lint;
* typecheck;
* testes unitários;
* build.

Depois serão adicionados:

* integração;
* arquitetura;
* segurança;
* Playwright;
* migrations;
* smoke tests;
* releases.

---

## 79. Desenvolvimento assistido por IA

Agentes poderão apoiar:

* criação de workflows;
* análise de falhas;
* geração de testes;
* atualização de dependências;
* criação de runbooks;
* identificação de gaps;
* otimização de cache.

---

## 80. Limites para agentes

Agentes não poderão autonomamente:

* mesclar pull request;
* promover produção;
* aprovar environment;
* alterar branch protection;
* criar secret;
* acessar secret;
* executar migration de produção;
* realizar rollback;
* alterar permissões para `write-all`;
* adicionar action não revisada;
* remover quality gate;
* ignorar falha;
* atualizar snapshot indiscriminadamente;
* ampliar retenção;
* acessar dados de produção;
* alterar workflow sensível sem revisão.

---

## 81. Revisão de mudanças no pipeline

Toda mudança deverá avaliar:

* trigger;
* permissions;
* secrets;
* código não confiável;
* action utilizada;
* versão;
* environment;
* concurrency;
* timeout;
* cache;
* artefatos;
* custo;
* impacto em required checks;
* estratégia de rollback.

---

## 82. Consequências positivas

A decisão proporciona:

* integração direta com GitHub;
* quality gates;
* proteção de produção;
* workflows versionados;
* automação de migrations;
* integração com o monorepo;
* Preview Deployments;
* branches de banco;
* supply-chain controls;
* rastreabilidade;
* baixo esforço operacional inicial.

---

## 83. Consequências negativas

A decisão introduz:

* arquivos e workflows adicionais;
* custo de execução;
* necessidade de governar actions;
* necessidade de coordenar GitHub e Vercel;
* risco de builds duplicados;
* necessidade de controlar cache;
* necessidade de manutenção dos gates;
* necessidade de proteger tokens e environments.

---

## 84. Riscos

### 84.1 Secrets expostos a código não confiável

Mitigações:

* ausência de secrets em forks;
* environments;
* menor privilégio;
* evitar `pull_request_target` inseguro;
* revisão de workflows.

### 84.2 Action comprometida

Mitigações:

* origem confiável;
* commit fixado;
* revisão;
* permissões mínimas;
* dependências reduzidas.

### 84.3 Cache contaminado

Mitigações:

* isolamento;
* inputs completos;
* política para forks;
* invalidação;
* ausência de secrets nos outputs.

### 84.4 Merge com checks incompletos

Mitigações:

* required checks;
* branch protection;
* revisão;
* nomes estáveis.

### 84.5 Migration concorrente

Mitigações:

* environment;
* concurrency group;
* conexão direta;
* pipeline exclusivo.

### 84.6 Preview utilizando produção

Mitigações:

* secrets separados;
* branch Neon;
* namespace Redis;
* ambiente Inngest;
* testes de isolamento.

### 84.7 Deployment incompatível com schema

Mitigações:

* migration validation;
* expand-contract;
* smoke tests;
* roll-forward.

### 84.8 Custo excessivo

Mitigações:

* cancelamento de execuções obsoletas;
* cache;
* execução seletiva;
* paralelismo controlado;
* schedules limitados.

### 84.9 Automação excessiva

Mitigações:

* Continuous Delivery;
* approvals proporcionais;
* workflows manuais protegidos;
* limites para agentes.

---

## 85. Controles

Deverão ser implementados:

* GitHub Actions;
* branch protection;
* required checks;
* GitHub Environments;
* permissões mínimas;
* actions fixadas;
* instalação imutável;
* Turborepo;
* caching seguro;
* migrations exclusivas;
* Preview isolation;
* security scans;
* dependency review;
* smoke tests;
* releases;
* source maps;
* timeouts;
* concurrency;
* runbooks;
* auditoria das mudanças.

---

## 86. Estratégia de implementação

### Etapa 1 — CI básico

* criar `ci.yml`;
* fixar Node.js;
* fixar pnpm;
* instalar com lockfile;
* executar lint;
* executar typecheck;
* executar testes;
* executar build.

### Etapa 2 — Proteção da branch

* configurar pull request obrigatório;
* configurar required checks;
* bloquear push direto;
* bloquear force push;
* configurar revisão.

### Etapa 3 — Monorepo

* integrar Turborepo;
* declarar inputs e outputs;
* habilitar execução seletiva;
* avaliar Remote Cache.

### Etapa 4 — Banco

* validar migrations;
* integrar Testcontainers;
* criar branch Neon de Preview;
* criar cleanup;
* criar workflow de produção protegido.

### Etapa 5 — Preview

* integrar status da Vercel;
* executar smoke tests;
* executar Playwright;
* validar isolamento.

### Etapa 6 — Segurança

* configurar dependency review;
* configurar secret scanning;
* configurar code scanning;
* fixar actions;
* revisar permissões.

### Etapa 7 — Produção

* configurar environment;
* associar release;
* enviar source maps;
* executar smoke tests;
* documentar rollback e roll-forward.

### Etapa 8 — Operação

* schedules;
* restore tests;
* cleanup;
* métricas;
* alertas;
* runbooks.

---

## 87. Critérios de implementação concluída

A decisão estará implementada quando:

* workflow básico estiver ativo;
* instalação imutável funcionar;
* lint for obrigatório;
* typecheck for obrigatório;
* testes forem obrigatórios;
* build for obrigatório;
* branch principal estiver protegida;
* pull requests gerarem Preview;
* migrations forem validadas;
* migration de produção possuir workflow protegido;
* secrets estiverem separados;
* actions sensíveis estiverem fixadas;
* smoke test pós-deployment funcionar;
* release estiver associada ao commit;
* forks não receberem secrets;
* cleanup de Preview estiver implementado.

---

## 88. Verificação

A verificação deverá incluir:

* pull request válida;
* pull request com lint falho;
* teste falho;
* build falho;
* lockfile divergente;
* migration inválida;
* Preview Deployment;
* branch Neon;
* cleanup;
* fork sem secrets;
* environment protegido;
* migration concorrente;
* deployment de produção;
* source map;
* smoke test falho;
* rollback;
* action sem permissão suficiente;
* cache invalidado.

---

## 89. Métricas

Poderão ser acompanhadas:

* duração do CI;
* taxa de sucesso;
* taxa de cancelamento;
* cache hit;
* testes flaky;
* builds falhos;
* migrations falhas;
* tempo até Preview;
* tempo até merge;
* deployments;
* change failure rate;
* rollback;
* mean time to restore;
* custo de runners;
* branches Neon órfãs;
* artefatos armazenados;
* dependências vulneráveis.

---

## 90. Gatilhos de revisão

A decisão deverá ser revisada quando:

* o custo do GitHub Actions se tornar desproporcional;
* o tempo do pipeline impedir fluxo saudável;
* runners especializados se tornarem necessários;
* deploys exigirem promoção integralmente controlada;
* a integração Git da Vercel deixar de atender;
* requisitos empresariais exigirem segregação adicional;
* compliance exigir runners privados;
* outra plataforma oferecer benefício comprovado;
* o monorepo crescer além da estratégia atual;
* Continuous Deployment se tornar seguro e desejável.

---

## 91. Estratégia de saída

Uma migração para outra plataforma de CI deverá preservar:

* scripts do package;
* comandos do Turborepo;
* quality gates;
* testes;
* migrations;
* environments;
* release metadata;
* segurança;
* artefatos;
* runbooks;
* estratégia de deployment.

A lógica central deverá permanecer em scripts e ferramentas portáveis, evitando dependência desnecessária da sintaxe do GitHub Actions.

---

## 92. Próxima decisão

O `RB-ADR-020` deverá definir a estratégia de feature flags, configuração dinâmica e rollout progressivo.

A decisão deverá avaliar:

* configuração estática;
* variáveis de ambiente;
* flags no PostgreSQL;
* Provider gerenciado;
* flags por ambiente;
* flags por Account;
* kill switches;
* experimentos;
* autorização;
* cache;
* auditoria;
* rollout percentual;
* desenvolvimento assistido por IA.

A decisão deverá distinguir:

* configuração;
* secret;
* feature flag;
* entitlement;
* permission;
* experiment;
* operational toggle;
* kill switch.

---

## 93. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-019
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar o contexto histórico.

---

## 94. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* alternativas foram avaliadas;
* GitHub Actions está justificado;
* integração Vercel está corretamente posicionada;
* Continuous Delivery está definida;
* Continuous Deployment está diferenciado;
* branch principal está protegida;
* required checks estão definidos;
* Preview Deployment está definido;
* Neon Preview está definido;
* cleanup está definido;
* migrations estão separadas;
* concurrency está definida;
* instalação é reproduzível;
* Turborepo está contemplado;
* Remote Cache está governado;
* testes estão definidos;
* IA está contemplada;
* segurança da cadeia está definida;
* actions de terceiros estão governadas;
* permissões estão definidas;
* OIDC está contemplado;
* secrets estão protegidos;
* forks estão tratados;
* artefatos estão governados;
* releases estão definidas;
* source maps estão definidos;
* Inngest está contemplado;
* R2 está contemplado;
* smoke tests estão definidos;
* rollback está definido;
* roll-forward está definido;
* workflows manuais estão governados;
* schedules estão governados;
* agentes estão limitados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* estratégia de saída está definida;
* não existem contradições com RB-CICD-001;
* não existem contradições com RB-GOV-002;
* não existem contradições com RB-ADR-010;
* não existem contradições com RB-ADR-013;
* não existem contradições com RB-ADR-015;
* não existem contradições com RB-ADR-016;
* não existem contradições com RB-ADR-017;
* não existem contradições com RB-ADR-018.

---

## 95. Declaração final

O RouteBook adotará GitHub Actions como plataforma principal de integração contínua e governança das entregas.

GitHub Actions será responsável por:

* quality gates;
* lint;
* typecheck;
* testes;
* builds;
* validação de migrations;
* segurança da cadeia de software;
* automações operacionais;
* releases;
* smoke tests;
* limpeza de recursos temporários.

A integração Git da Vercel continuará responsável pelos Preview Deployments e deployments da aplicação.

GitHub Environments serão utilizados para proteger:

* migrations;
* produção;
* secrets;
* operações administrativas.

A branch principal permanecerá protegida por pull requests e checks obrigatórios.

O pipeline utilizará pnpm e Turborepo de forma reproduzível, com lockfile imutável e caching controlado.

Pull requests não confiáveis não receberão secrets nem acesso a serviços de produção.

Migrations serão executadas fora do startup da aplicação, por workflow exclusivo, com conexão direta e controle de concorrência.

Produção seguirá inicialmente uma estratégia de Continuous Delivery.

Automação irrestrita de produção somente será adotada quando os controles, testes, rollback e observabilidade demonstrarem maturidade suficiente.

Agentes de IA poderão auxiliar na criação e análise dos pipelines, mas não poderão autonomamente:

* aprovar;
* promover;
* migrar;
* alterar proteções;
* acessar secrets;
* executar rollback;
* remover quality gates.

A lógica principal de qualidade permanecerá expressa por scripts e comandos portáveis, permitindo que o RouteBook substitua futuramente a plataforma de CI sem redefinir seus critérios de entrega.
