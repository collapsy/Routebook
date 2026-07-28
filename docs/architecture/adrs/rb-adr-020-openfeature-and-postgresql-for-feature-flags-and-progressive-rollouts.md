---

id: RB-ADR-020

title: Adoção de OpenFeature com Flags Persistidas no PostgreSQL para Rollouts Controlados
description: Registra a decisão de adotar OpenFeature como API padronizada de avaliação e uma implementação inicial baseada em PostgreSQL para feature flags, kill switches e rollouts progressivos, preservando governança, auditoria, isolamento por ambiente e portabilidade para Providers gerenciados.

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
- openfeature
- feature-flags
- progressive-delivery
- progressive-rollout
- kill-switch
- configuration
- postgresql
- redis
- experimentation
- governance
- observability
- artificial-intelligence
- release-management

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-002
- RB-PRD-006
- RB-PRD-007
- RB-PRD-008
- RB-DOM-001
- RB-DOM-002
- RB-DOM-003
- RB-DOM-004
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
- RB-AI-002
- RB-AI-003
- RB-AI-004
- RB-AI-005
- RB-AI-006
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
- RB-ADR-019

prerequisites:

- RB-FND-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
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
- RB-GOV-002
- RB-DEL-001
- RB-CICD-001
- RB-ADR-005
- RB-ADR-008
- RB-ADR-009
- RB-ADR-010
- RB-ADR-013
- RB-ADR-014
- RB-ADR-015
- RB-ADR-017
- RB-ADR-018
- RB-ADR-019

next_documents:

- RB-ADR-021

ai_context:
priority: high
index: true
---

# RB-ADR-020 — Adoção de OpenFeature com Flags Persistidas no PostgreSQL para Rollouts Controlados

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* OpenFeature será a API canônica de avaliação de feature flags;
* uma implementação interna baseada em PostgreSQL será o Provider inicial;
* Redis poderá armazenar snapshots e resultados temporários de avaliação;
* flags serão avaliadas prioritariamente no servidor;
* flags poderão ser segmentadas por ambiente, Account, User e percentual;
* rollouts percentuais serão determinísticos;
* kill switches possuirão caminho seguro de desativação;
* toda flag possuirá owner, tipo, finalidade, estado e prazo de revisão;
* mudanças em flags críticas serão auditadas;
* flags não serão utilizadas para substituir autorização ou entitlements;
* flags de release deverão ser removidas após a conclusão do rollout;
* SDKs proprietários não serão importados diretamente por módulos de produto.

---

## 2. Contexto

O RouteBook adotou uma estratégia de entrega baseada em:

* trunk-based development;
* pull requests;
* Continuous Delivery;
* Preview Deployments;
* deployments imutáveis;
* workflows assíncronos;
* Providers externos;
* inteligência artificial;
* serviços sujeitos a custo e indisponibilidade.

Código implantado nem sempre deverá ser disponibilizado imediatamente a todos os usuários.

O produto poderá precisar:

* ocultar uma funcionalidade ainda incompleta;
* liberar uma nova experiência gradualmente;
* ativar uma capacidade somente para uma Account;
* interromper uma integração degradada;
* desativar temporariamente uma Tool;
* comparar duas experiências;
* ativar funcionalidade em Preview antes de produção;
* limitar capacidades caras;
* testar um novo algoritmo de Recommendation;
* desligar rapidamente geração de Itinerary Proposals;
* manter código implantado sem disponibilizá-lo publicamente.

Essas necessidades não devem exigir novo deployment a cada mudança operacional.

---

## 3. Problema

Qual estratégia deverá ser utilizada para controlar a disponibilização de funcionalidades em runtime, considerando:

* Next.js;
* Server Components;
* Client Components;
* múltiplos ambientes;
* Accounts;
* rollouts progressivos;
* kill switches;
* Providers;
* IA;
* observabilidade;
* auditoria;
* baixo custo inicial;
* portabilidade;
* prevenção de dívida técnica?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. independência de Provider;
2. avaliação server-side;
3. baixa latência;
4. isolamento por ambiente;
5. isolamento por Account;
6. rollout percentual determinístico;
7. kill switches;
8. auditoria;
9. observabilidade;
10. tipagem;
11. defaults seguros;
12. funcionamento durante falhas;
13. integração com PostgreSQL;
14. integração com Redis;
15. suporte a Next.js;
16. remoção de flags obsoletas;
17. segurança;
18. privacidade;
19. baixo custo operacional;
20. migração futura para Provider gerenciado.

---

## 5. Restrições

A solução deverá:

* funcionar com TypeScript;
* funcionar no runtime Node.js;
* funcionar com Next.js App Router;
* possuir API independente do mecanismo concreto;
* permitir avaliação no servidor;
* permitir defaults explícitos;
* permitir contexto de avaliação;
* permitir targeting por ambiente;
* permitir targeting por Account;
* permitir rollout percentual;
* registrar mudanças relevantes;
* não expor regras sensíveis ao cliente;
* não transformar feature flag em autorização;
* não transformar flag em entitlement comercial;
* não armazenar secrets como valores de flag;
* não depender de rede externa para toda avaliação;
* não manter flags de release indefinidamente;
* não permitir alteração sem owner e finalidade.

---

## 6. Terminologia

### 6.1 Feature Flag

Mecanismo que seleciona um caminho de código em runtime a partir de regras e contexto.

### 6.2 Flag Key

Identificador técnico estável de uma flag.

### 6.3 Variation

Valor que uma flag pode retornar.

### 6.4 Evaluation Context

Conjunto mínimo de atributos utilizados para avaliar uma flag.

### 6.5 Targeting Rule

Regra que define quando determinada variação será retornada.

### 6.6 Progressive Rollout

Exposição gradual de uma variação a uma parcela crescente dos contextos elegíveis.

### 6.7 Kill Switch

Flag operacional destinada a desativar rapidamente uma capacidade.

### 6.8 Operational Toggle

Controle de comportamento operacional sem representar uma funcionalidade comercial.

### 6.9 Entitlement

Direito concedido a uma Account por plano, contrato ou configuração comercial.

### 6.10 Experiment

Comparação controlada entre variações com hipótese, métrica e população definidas.

---

## 7. Princípio central

Deployment e release serão tratados como processos diferentes.

```text
deployment
→ código disponível na infraestrutura

release
→ funcionalidade disponibilizada a contextos elegíveis
```

Feature flags controlarão releases.

Elas não substituirão a integridade do domínio.

---

## 8. Separação conceitual

O RouteBook deverá distinguir:

```text
configuration
≠
secret
≠
feature flag
≠
entitlement
≠
permission
≠
experiment
≠
kill switch
```

Misturar esses conceitos produziria controles ambíguos e inseguros.

---

## 9. Opções consideradas

### 9.1 Variáveis de ambiente

Utilizar variáveis para habilitar ou desabilitar funcionalidades.

#### Benefícios

* implementação simples;
* suporte nativo da plataforma;
* separação por ambiente;
* ausência de nova persistência.

#### Limitações

* exigem novo deployment;
* não suportam Account;
* não suportam rollout percentual;
* não possuem auditoria própria;
* não são dinâmicas;
* não são adequadas a experimentos;
* não oferecem boa experiência operacional.

#### Avaliação

Continuarão adequadas para configuração estática.

Foram rejeitadas como estratégia completa de feature flags.

---

### 9.2 Constantes no código

Utilizar condições e valores fixos versionados.

#### Benefícios

* simplicidade;
* tipagem;
* revisão por pull request;
* comportamento determinístico.

#### Limitações

* novo deployment;
* ausência de targeting;
* ausência de kill switch rápido;
* baixa flexibilidade operacional.

#### Avaliação

Adequadas somente para configurações que não precisam mudar em runtime.

---

### 9.3 Flags próprias acessadas diretamente no PostgreSQL

Criar tabelas e consultar diretamente o banco em cada ponto da aplicação.

#### Benefícios

* baixo custo inicial;
* controle dos dados;
* auditoria;
* integração com a infraestrutura existente;
* targeting próprio.

#### Limitações

* API de avaliação espalhada;
* forte acoplamento à implementação;
* risco de consultas excessivas;
* migração futura custosa;
* possibilidade de regras inconsistentes.

#### Avaliação

O PostgreSQL será utilizado como armazenamento inicial, mas o acesso será isolado por OpenFeature e por um Provider interno.

---

### 9.4 LaunchDarkly

#### Benefícios

* plataforma especializada;
* targeting;
* rollouts progressivos;
* workflows;
* auditoria;
* experimentação;
* SDKs maduros;
* kill switches;
* observabilidade operacional.

#### Limitações

* custo;
* dependência de fornecedor;
* nova plataforma;
* capacidade superior à necessidade inicial;
* necessidade de governar dados enviados como contexto.

#### Avaliação

É uma alternativa futura forte para operação em maior escala.

Não foi selecionada inicialmente.

---

### 9.5 Unleash

#### Benefícios

* plataforma especializada;
* estratégias de ativação;
* gradual rollout;
* ambientes;
* possibilidade de self-hosting;
* modelo aberto;
* segmentação.

#### Limitações

* nova infraestrutura ou SaaS;
* operação adicional no self-hosting;
* necessidade de integração;
* capacidade superior à necessidade inicial.

#### Avaliação

Permanece alternativa futura.

---

### 9.6 PostHog Feature Flags

#### Benefícios

* integração com analytics;
* targeting;
* percentual;
* experimentos;
* SDKs;
* plataforma gerenciada.

#### Limitações

* aproxima flags de product analytics;
* nova dependência;
* contexto enviado a terceiro;
* experimentação não é necessidade inicial;
* risco de misturar telemetria e autorização.

#### Avaliação

Poderá ser avaliado caso o RouteBook adote PostHog para product analytics.

Não foi selecionado inicialmente.

---

### 9.7 OpenFeature com Provider interno

Utilizar:

* OpenFeature como API de avaliação;
* PostgreSQL como armazenamento canônico das definições;
* Redis como otimização;
* Provider interno substituível.

#### Benefícios

* API padronizada;
* independência de fornecedor;
* custo inicial reduzido;
* controle sobre dados;
* integração com infraestrutura existente;
* possibilidade de migração;
* defaults padronizados;
* hooks;
* contexto de avaliação;
* tipagem.

#### Limitações

* painel administrativo precisa ser construído ou postergado;
* regras e rollout precisam ser implementados;
* auditoria permanece responsabilidade do RouteBook;
* experimentação avançada não estará disponível inicialmente;
* necessidade de governança e testes.

#### Avaliação

Oferece o melhor equilíbrio para o estágio atual.

Foi selecionada.

---

## 10. Decisão

O RouteBook adotará:

* **OpenFeature** como API canônica para avaliação;
* **Provider interno baseado em PostgreSQL** como implementação inicial;
* **Redis** para snapshots, invalidação e cache temporário;
* **avaliação server-side** como padrão;
* **contextos mínimos e tipados**;
* **flags booleanas, string, numéricas e estruturadas** quando justificadas;
* **rollouts determinísticos por percentual**;
* **targeting por ambiente, Account e User**;
* **kill switches** para capacidades críticas;
* **auditoria das alterações**;
* **governança de ciclo de vida**;
* **defaults seguros no código**.

---

## 11. Escopo da decisão

Esta decisão define:

* API de avaliação;
* armazenamento inicial;
* contexto;
* targeting;
* rollout;
* kill switches;
* cache;
* auditoria;
* observabilidade;
* ciclo de vida;
* segurança;
* testes;
* portabilidade.

Esta decisão não define integralmente:

* painel administrativo completo;
* plataforma de experimentação;
* product analytics;
* entitlements comerciais;
* sistema de permissões;
* billing;
* modelo final de planos;
* Provider gerenciado futuro;
* automação de rollout baseada em métricas;
* guarded rollouts autônomos.

---

## 12. Arquitetura conceitual

```text
caso de uso
→ FeatureFlagEvaluator
→ OpenFeature Client
→ RouteBook Feature Flag Provider
→ snapshot local ou Redis
→ PostgreSQL
```

Módulos não deverão consultar a tabela de flags diretamente.

---

## 13. OpenFeature

OpenFeature será responsável por padronizar:

* clients;
* flag keys;
* evaluation context;
* providers;
* evaluation;
* defaults;
* detalhes de resolução;
* hooks;
* eventos do Provider.

OpenFeature não será responsável por:

* persistir regras;
* oferecer painel;
* definir autorização;
* definir entitlements;
* definir experimentos;
* definir o ciclo de vida interno do RouteBook.

---

## 14. Port interno

A aplicação poderá oferecer uma abstração semântica sobre OpenFeature.

```typescript
interface FeatureFlagEvaluator {
  isEnabled(
    flag: BooleanFeatureFlag,
    context: FeatureEvaluationContext,
  ): Promise<boolean>;

  getString(
    flag: StringFeatureFlag,
    context: FeatureEvaluationContext,
  ): Promise<string>;

  getNumber(
    flag: NumberFeatureFlag,
    context: FeatureEvaluationContext,
  ): Promise<number>;

  getObject<T>(
    flag: ObjectFeatureFlag<T>,
    context: FeatureEvaluationContext,
  ): Promise<T>;
}
```

O SDK não deverá ser utilizado indiscriminadamente em componentes e casos de uso.

---

## 15. Catálogo tipado

Flags conhecidas deverão ser declaradas em um catálogo versionado.

```typescript
const featureFlags = {
  itineraryProposalGeneration: {
    key: "itinerary-proposal-generation",
    type: "boolean",
    defaultValue: false,
  },
  recommendationRankingVersion: {
    key: "recommendation-ranking-version",
    type: "string",
    defaultValue: "v1",
  },
} as const;
```

Strings livres espalhadas pelo código deverão ser evitadas.

---

## 16. Convenção de chaves

Formato recomendado:

```text
<module>.<capability>.<purpose>
```

Exemplos:

```text
proposal-management.itinerary-proposal.release
decision-intelligence.recommendation-ranking.version
place-catalog.enrichment.kill-switch
mobility.route-matrix.release
ai.itinerary-generation.kill-switch
```

As chaves deverão:

* ser estáveis;
* utilizar inglês técnico;
* não incluir IDs;
* não incluir ambiente;
* não incluir valores;
* não ser reutilizadas para outro significado.

---

## 17. Tipos de flag

O RouteBook reconhecerá os seguintes tipos funcionais:

* release flag;
* operational flag;
* kill switch;
* experiment flag;
* migration flag;
* permissioning flag proibida como autorização;
* configuration flag controlada.

---

## 18. Release flags

Release flags controlarão a disponibilização de funcionalidades novas.

Características:

* temporárias;
* owner obrigatório;
* data de criação;
* data esperada de remoção;
* variação padrão segura;
* plano de rollout;
* plano de rollback;
* issue de remoção.

Após rollout completo e estabilização, deverão ser removidas.

---

## 19. Operational flags

Operational flags controlarão comportamento operacional.

Exemplos:

* ativar fallback;
* reduzir concorrência;
* desabilitar Provider;
* desativar processamento não essencial;
* alterar estratégia interna previamente suportada.

Elas poderão possuir vida mais longa, mas deverão ser revisadas periodicamente.

---

## 20. Kill switches

Kill switches deverão existir para capacidades cujo desligamento rápido reduza impacto.

Exemplos:

* geração de Itinerary Proposal;
* chamadas a determinado Provider;
* Tool mutável;
* processamento de imagens;
* enriquecimento de Places;
* Route Matrix em lote;
* envio de notificações.

O caminho desativado deverá ser testado.

---

## 21. Migration flags

Migration flags poderão apoiar transições como:

* escrita dupla;
* leitura nova com fallback;
* mudança de schema;
* migração de algoritmo;
* alteração de Provider.

Elas deverão possuir:

* fase;
* owner;
* critério de conclusão;
* telemetria;
* prazo de remoção.

---

## 22. Configuration flags

Valores dinâmicos poderão ser usados quando:

* a mudança precisar ocorrer sem deployment;
* o valor não for secret;
* o comportamento suportar alteração segura;
* o tipo for validado;
* houver limites conhecidos.

Feature flags não deverão virar um sistema genérico de configuração sem governança.

---

## 23. Experimentos

Experimentos deverão possuir:

* hipótese;
* população;
* variações;
* métrica primária;
* métricas de segurança;
* duração;
* análise;
* critério de encerramento;
* revisão ética e de privacidade quando aplicável.

Uma flag percentual sem hipótese e métrica não será considerada experimento.

---

## 24. Entitlements

Entitlements representam direitos da Account.

Exemplos futuros:

* acesso a determinado plano;
* limite comercial;
* capacidade contratada;
* integração premium.

Eles deverão possuir modelo canônico próprio.

Uma feature flag poderá restringir temporariamente uma entrega, mas não deverá conceder permanentemente direito comercial.

---

## 25. Permissões

Permissões continuarão sendo avaliadas pelo mecanismo de autorização definido no `RB-ADR-008`.

Fluxo correto:

```text
autorizar ação
→ verificar entitlement quando aplicável
→ avaliar feature flag
→ executar caso de uso
```

Fluxo incorreto:

```text
feature flag ativa
→ ação automaticamente autorizada
```

---

## 26. Secrets

Secrets não deverão ser armazenados como valores de flags.

São exemplos proibidos:

* API keys;
* tokens;
* passwords;
* connection strings;
* signing secrets;
* credentials de Providers.

Secrets permanecerão no mecanismo de secrets da infraestrutura.

---

## 27. Modelo de persistência

O PostgreSQL deverá armazenar definições semelhantes a:

```typescript
interface FeatureFlagDefinition {
  featureFlagId: FeatureFlagId;
  key: string;
  type: FeatureFlagType;
  category: FeatureFlagCategory;
  description: string;
  owner: string;
  status: FeatureFlagStatus;
  defaultVariation: string;
  createdAt: Date;
  updatedAt: Date;
  reviewAt?: Date;
  expiresAt?: Date;
}
```

As regras deverão ser persistidas separadamente ou em estrutura validada e versionada.

---

## 28. Ambientes

As configurações de ativação deverão ser separadas por:

* development;
* preview;
* staging;
* production.

Uma flag poderá existir em todos os ambientes com regras diferentes.

O ambiente não deverá fazer parte da chave lógica.

---

## 29. Preview

Preview Deployments poderão:

* habilitar flags de release;
* utilizar regras específicas;
* testar o caminho desativado;
* testar variações;
* utilizar Accounts sintéticas.

Preview não deverá compartilhar regras de produção sem necessidade.

---

## 30. Evaluation Context

O contexto inicial poderá conter:

```typescript
interface FeatureEvaluationContext {
  environment: string;
  accountKey?: string;
  userKey?: string;
  sessionKey?: string;
  applicationVersion?: string;
  locale?: string;
  attributes?: Record<string, string | number | boolean>;
}
```

Somente atributos necessários deverão ser enviados ao Provider.

---

## 31. Identificadores protegidos

E-mail, nome e outros dados pessoais não deverão ser utilizados como targeting key.

Deverão ser preferidos:

* identificador interno opaco;
* identificador derivado por mecanismo aprovado;
* Account key;
* User key.

O valor deverá permanecer estável para rollouts determinísticos.

---

## 32. Contexto mínimo

A avaliação não deverá receber automaticamente:

* entidade User completa;
* entidade Account completa;
* Trip;
* endereço;
* localização;
* preferências;
* notas;
* prompt;
* histórico de viagem.

Somente atributos necessários à regra deverão ser incluídos.

---

## 33. Targeting por Account

Targeting por Account será preferido quando a funcionalidade afetar:

* dados compartilhados;
* consistência da experiência;
* workflows;
* integrações;
* comportamento de domínio.

Isso evita que membros da mesma Account recebam versões incompatíveis de uma capacidade compartilhada.

---

## 34. Targeting por User

Targeting por User poderá ser utilizado quando:

* a experiência for individual;
* não alterar estado compartilhado incompatível;
* a variação não comprometer colaboração;
* houver finalidade clara.

---

## 35. Targeting por lista explícita

Uma regra poderá ativar a flag para:

* Accounts internas;
* Accounts de teste;
* beta testers;
* usuários autorizados para validação.

Listas deverão possuir:

* owner;
* finalidade;
* revisão;
* ausência de dados pessoais legíveis quando possível.

---

## 36. Rollout percentual

Rollouts percentuais deverão utilizar hashing determinístico.

Fluxo conceitual:

```text
flagKey
+
targetingKey
+
salt ou versão
→ hash
→ bucket estável
→ variação
```

O mesmo contexto deverá permanecer na mesma variação enquanto as regras relevantes não mudarem.

---

## 37. Unidade de rollout

Cada flag deverá declarar sua unidade de rollout:

* Account;
* User;
* sessão;
* request.

Para funcionalidades de domínio compartilhado, `Account` será o padrão preferencial.

Rollout por request deverá ser evitado em experiências que exijam consistência.

---

## 38. Etapas de rollout

Um rollout poderá seguir:

```text
desenvolvimento
→ equipe interna
→ Accounts selecionadas
→ 5%
→ 25%
→ 50%
→ 100%
→ remoção da flag
```

As etapas deverão variar conforme o risco.

---

## 39. Critérios de avanço

O avanço deverá considerar:

* taxa de erro;
* latência;
* falhas de Providers;
* custo;
* feedback;
* sucesso da jornada;
* falhas de validação;
* incidentes;
* métricas específicas da capability.

O aumento de percentual não deverá ocorrer apenas porque o tempo passou.

---

## 40. Critérios de interrupção

O rollout deverá ser pausado ou revertido quando ocorrer:

* aumento significativo de erros;
* corrupção ou inconsistência de dados;
* falha de autorização;
* aumento de custo desproporcional;
* latência inaceitável;
* regressão de acessibilidade;
* falha de Provider;
* feedback crítico;
* violação de policy.

---

## 41. Default seguro

Toda avaliação deverá possuir valor padrão no código.

Exemplo:

```typescript
const enabled = await featureFlags.isEnabled(
  featureFlags.itineraryProposalGeneration,
  context,
);
```

O default deverá representar o comportamento mais seguro durante:

* falha do Provider;
* timeout;
* configuração inválida;
* flag inexistente;
* inicialização incompleta.

---

## 42. Fail-open e fail-closed

Cada flag crítica deverá definir sua postura.

### Possível fail-open

* melhoria visual não crítica;
* otimização;
* caminho já consolidado;
* funcionalidade pública de baixo risco.

### Possível fail-closed

* Tool mutável;
* Provider caro;
* funcionalidade beta;
* nova escrita;
* capacidade sujeita a risco;
* integração degradada.

A decisão deverá ser documentada no catálogo.

---

## 43. Avaliação server-side

A avaliação server-side será o padrão para:

* casos de uso;
* Providers;
* Tools;
* workflows;
* Server Components;
* Route Handlers;
* Server Functions;
* operações de domínio.

Isso preserva:

* regras privadas;
* consistência;
* proteção contra manipulação;
* menor exposição de contexto.

---

## 44. Avaliação client-side

Flags poderão ser enviadas ao cliente somente quando necessárias à apresentação.

O servidor deverá enviar:

* resultado avaliado;
* conjunto mínimo;
* sem regras;
* sem listas de targeting;
* sem atributos sensíveis.

O cliente não deverá decidir autorização nem capacidade de escrita.

---

## 45. Server Components

Server Components deverão avaliar flags antes de compor a interface quando possível.

Isso reduz:

* flicker;
* hidratação divergente;
* exposição de regra;
* bundle client-side.

---

## 46. Client Components

Quando um Client Component precisar do resultado, ele deverá recebê-lo como prop ou por contexto controlado.

O SDK completo e as regras não deverão ser enviados indiscriminadamente ao navegador.

---

## 47. Consistência entre interface e servidor

Ocultar uma funcionalidade na interface não basta.

A operação server-side deverá avaliar novamente:

* autorização;
* entitlement quando aplicável;
* feature flag;
* estado do recurso.

Isso impede que chamadas diretas ignorem o controle de release.

---

## 48. PostgreSQL

PostgreSQL será a fonte canônica para:

* definição;
* regras;
* variações;
* ambientes;
* ownership;
* estados;
* auditoria;
* ciclo de vida.

A aplicação não deverá consultar o banco para cada avaliação individual.

---

## 49. Snapshots

O Provider deverá carregar um snapshot validado das definições.

O snapshot poderá permanecer:

* em memória por instância;
* em Redis;
* em cache versionado.

Cada snapshot deverá possuir:

* versão;
* instante de carregamento;
* schema;
* ambiente;
* checksum quando aplicável.

---

## 50. Redis

Redis poderá ser utilizado para:

* distribuir snapshots;
* invalidar caches;
* armazenar versão atual;
* reduzir consultas;
* aplicar TTL;
* apoiar kill switches.

Redis não será a fonte canônica das definições.

---

## 51. Invalidação

Ao alterar uma flag:

```text
transação PostgreSQL
→ registrar alteração
→ atualizar versão
→ invalidar snapshot
→ publicar sinal
→ instâncias recarregam
```

A invalidação deverá tolerar falhas.

TTL e verificação periódica deverão funcionar como proteção adicional.

---

## 52. Freshness

Categorias possíveis:

### Kill switch

* atualização muito rápida;
* TTL curto;
* verificação ativa;
* alerta em falha.

### Release flag

* atualização rápida;
* cache curto ou sinalizado.

### Configuração de baixo risco

* TTL maior;
* eventual consistency aceitável.

---

## 53. Dependência do Redis

Se o Redis estiver indisponível:

* snapshots locais ainda válidos poderão ser usados;
* PostgreSQL poderá servir como fallback controlado;
* defaults seguros deverão permanecer disponíveis;
* a aplicação não deverá bloquear toda a navegação.

Kill switches críticos deverão possuir estratégia específica de atualização e fallback.

---

## 54. Mudanças de flags

Toda alteração deverá registrar:

* flag;
* ambiente;
* valor anterior;
* valor novo;
* regra anterior;
* regra nova;
* actor;
* motivo;
* instante;
* correlationId;
* origem;
* ticket ou referência quando aplicável.

---

## 55. Auditoria

O histórico deverá permanecer no PostgreSQL ou mecanismo de auditoria canônico.

Logs de observabilidade e Sentry não serão a única fonte do histórico de mudanças.

---

## 56. Autorização administrativa

Somente atores autorizados poderão:

* criar flag;
* alterar regra;
* alterar produção;
* acionar kill switch;
* aumentar rollout;
* arquivar flag;
* remover flag.

Produção deverá possuir controles superiores aos ambientes de desenvolvimento.

---

## 57. Interface administrativa

Um painel próprio não será obrigatório na primeira implementação.

A primeira versão poderá utilizar:

* seeds;
* migration;
* script administrativo;
* endpoint interno protegido;
* ferramenta operacional restrita.

Alterações de produção não deverão depender de edição manual direta no banco.

---

## 58. Scripts administrativos

Scripts deverão:

* validar input;
* exigir ambiente;
* exigir motivo;
* registrar actor;
* utilizar contratos;
* produzir diff;
* confirmar alterações de produção;
* evitar secrets;
* ser idempotentes quando possível.

---

## 59. API administrativa

Caso criada, deverá possuir:

* autenticação forte;
* autorização;
* validação Zod;
* audit trail;
* rate limiting;
* CSRF protection quando aplicável;
* reason field;
* optimistic concurrency;
* observabilidade.

---

## 60. Estados da flag

Estados iniciais:

```text
draft
active
paused
completed
archived
```

Uma flag `completed` deverá estar aguardando remoção do código ou encerramento formal.

---

## 61. Ciclo de vida

Fluxo recomendado:

```text
proposta
→ criação
→ implementação
→ validação
→ rollout
→ estabilização
→ conclusão
→ remoção do código antigo
→ remoção da avaliação
→ arquivamento
```

---

## 62. Expiração

Release flags deverão possuir:

* `reviewAt`;
* `expiresAt`;
* owner;
* issue de cleanup;
* comportamento após expiração.

A expiração não deverá alterar automaticamente uma flag de produção sem política explícita.

Ela deverá gerar:

* alerta;
* relatório;
* bloqueio de nova extensão sem justificativa;
* tarefa de remoção.

---

## 63. Flags obsoletas

O pipeline deverá detectar progressivamente:

* flags cadastradas sem uso;
* flags usadas sem cadastro;
* flags expiradas;
* flags 100% estáveis;
* caminhos antigos ainda existentes;
* owners ausentes.

---

## 64. Remoção

A remoção de uma release flag deverá:

1. confirmar rollout estável;
2. escolher o caminho definitivo;
3. remover o caminho antigo;
4. remover a avaliação;
5. atualizar testes;
6. atualizar documentação;
7. arquivar a definição;
8. registrar a conclusão.

---

## 65. Testes unitários

Todo código condicionado por flag deverá testar:

* default;
* variação ativa;
* variação inativa;
* configuração inválida;
* flag ausente;
* falha do Provider;
* targeting relevante.

---

## 66. Testes de integração

Deverão validar:

* Provider;
* PostgreSQL;
* Redis;
* snapshot;
* invalidação;
* targeting por Account;
* rollout percentual;
* auditoria;
* optimistic concurrency;
* fallback.

---

## 67. Testes end-to-end

Jornadas críticas deverão validar:

* funcionalidade desativada;
* funcionalidade ativada;
* Account elegível;
* Account não elegível;
* kill switch;
* Preview;
* mudança sem novo deployment;
* fallback seguro;
* interface e servidor consistentes.

---

## 68. Testes de distribuição percentual

Deverão validar:

* determinismo;
* estabilidade;
* distribuição aproximada;
* mudança de percentual;
* unidade por Account;
* isolamento entre flags;
* efeito de versionamento do algoritmo.

---

## 69. Testes de segurança

Deverão comprovar que:

* flag não concede autorização;
* regra não é exposta ao cliente;
* contexto não contém dados desnecessários;
* Account não influencia outra;
* scripts exigem autenticação;
* alteração é auditada;
* defaults são seguros.

---

## 70. Observabilidade

Cada avaliação relevante poderá registrar, com sampling:

```text
feature_flag.key
feature_flag.variant
feature_flag.reason
feature_flag.provider
feature_flag.error_code
feature_flag.cache_status
```

Deverão ser evitados:

* UserId;
* AccountId direto;
* e-mail;
* regra completa;
* atributos pessoais;
* valores estruturados sensíveis.

---

## 71. Métricas

Métricas possíveis:

* avaliações;
* variações servidas;
* erros de avaliação;
* uso de default;
* cache hit;
* snapshot age;
* invalidações;
* kill switches ativos;
* flags expiradas;
* flags sem owner;
* flags por categoria;
* rollouts em andamento.

---

## 72. Correlação com releases

Telemetria deverá permitir relacionar:

* deployment;
* release;
* flag;
* variação;
* erro;
* latência;
* custo.

Isso apoia decisões de avanço ou interrupção.

---

## 73. Métricas de negócio

Métricas de adoção ou sucesso não deverão ser implementadas dentro do Provider de flags.

Elas deverão pertencer ao mecanismo de product analytics ou métricas do produto.

A flag apenas fornece contexto da variação.

---

## 74. Providers externos

Kill switches deverão ser considerados para:

* Google Maps Platform;
* Provider de IA;
* Inngest;
* processamento de imagens;
* e-mail futuro;
* integração futura.

O desligamento deverá preservar uma experiência de fallback quando possível.

---

## 75. Inteligência artificial

Flags poderão controlar:

* liberação de capability;
* escolha entre versões aprovadas;
* rollout de novo modelo;
* ativação de Tool;
* fallback;
* execução assíncrona;
* limites operacionais.

Elas não deverão:

* substituir policy;
* permitir Tool não autorizada;
* enviar contexto adicional sem revisão;
* alterar silenciosamente objetivo ou contrato de uma capability.

---

## 76. Model routing

Uma flag poderá selecionar uma versão de estratégia ou modelo aprovado.

Exemplo:

```text
ai.itinerary-generation.model-routing
→ stable
→ candidate
```

Ambas as variações deverão possuir:

* contrato compatível;
* schema;
* política;
* observabilidade;
* budget;
* fallback.

---

## 77. Workflows assíncronos

Inngest Functions deverão avaliar flags em pontos definidos.

Um workflow longo não deverá mudar de comportamento de maneira imprevisível entre steps.

Quando necessário, deverá persistir:

* versão da flag;
* variação selecionada;
* instante;
* contexto relevante.

---

## 78. Consistência de workflows

Para decisões que precisam permanecer estáveis durante toda a execução:

```text
início do workflow
→ avaliar flag
→ persistir variação
→ utilizar a mesma variação nos steps
```

Uma mudança operacional urgente poderá cancelar ou interromper execuções conforme política específica.

---

## 79. Kill switch de workflows

Um kill switch poderá:

* impedir novas execuções;
* pausar determinada etapa;
* cancelar trabalhos elegíveis;
* redirecionar para fallback.

Ele não deverá abandonar silenciosamente efeitos já iniciados.

---

## 80. Custos

Flags poderão reduzir custos ao controlar:

* porcentagem de rollout;
* Providers caros;
* funcionalidades experimentais;
* processamento em lote;
* chamadas de IA;
* Route Matrix;
* geração de imagens ou documentos.

A flag não substituirá budgets, quotas e rate limiting.

---

## 81. Privacidade

Targeting deverá utilizar o mínimo de atributos.

A criação de segmentos baseados em:

* localização;
* comportamento;
* preferências;
* perfil;
* histórico de viagens;

exigirá finalidade e revisão de privacidade.

---

## 82. Localização

Localização precisa não deverá ser utilizada como atributo de flag.

Quando a região for realmente necessária, deverá ser utilizada granularidade ampla e justificada.

---

## 83. Desenvolvimento local

O ambiente local deverá permitir:

* Provider em memória;
* arquivo local validado;
* PostgreSQL local;
* overrides explícitos;
* teste de variações;
* defaults.

Overrides locais não deverão ser enviados ao Git com dados pessoais ou secrets.

---

## 84. Provider em memória

Um Provider em memória poderá ser utilizado para:

* testes unitários;
* Storybook futuro;
* desenvolvimento isolado;
* exemplos;
* fixtures.

Ele não será evidência suficiente para validar:

* concorrência;
* invalidação;
* auditoria;
* Redis;
* regras de produção.

---

## 85. CI/CD

O pipeline deverá validar:

* catálogo;
* chaves duplicadas;
* tipos;
* defaults;
* flags expiradas;
* uso sem cadastro;
* migrations;
* testes de ambos os caminhos;
* documentação de flags novas.

---

## 86. Preview Deployments

Preview deverá permitir overrides controlados para revisão.

Esses overrides deverão:

* aplicar-se somente ao Preview;
* possuir expiração;
* utilizar Accounts sintéticas;
* não alterar produção;
* ser visíveis à equipe de revisão.

---

## 87. Alterações de produção

Mudanças em flags de produção deverão ocorrer por processo protegido.

Dependendo da criticidade, poderão exigir:

* GitHub Environment;
* aprovação;
* script administrativo;
* painel protegido;
* motivo obrigatório;
* auditoria.

---

## 88. Desenvolvimento assistido por IA

Agentes poderão apoiar:

* criação do catálogo;
* testes;
* análise de flags expiradas;
* documentação;
* detecção de caminhos antigos;
* avaliação de rollout.

---

## 89. Limites para agentes

Agentes não poderão autonomamente:

* alterar flag de produção;
* acionar kill switch;
* aumentar rollout;
* criar targeting com dados pessoais;
* transformar flag em autorização;
* criar secret como valor;
* remover default;
* prolongar expiração;
* iniciar experimento;
* escolher vencedor;
* arquivar auditoria;
* remover caminho antigo sem testes;
* ativar Tool mutável.

---

## 90. Consequências positivas

A decisão proporciona:

* separação entre deployment e release;
* rollout progressivo;
* kill switches;
* targeting por Account;
* defaults seguros;
* portabilidade;
* baixo custo inicial;
* controle sobre dados;
* integração com PostgreSQL;
* integração com Redis;
* melhor suporte ao trunk-based development;
* redução de risco em releases.

---

## 91. Consequências negativas

A decisão introduz:

* nova camada de avaliação;
* tabelas e regras;
* necessidade de cache;
* necessidade de auditoria;
* risco de flags obsoletas;
* necessidade de testar múltiplos caminhos;
* necessidade de governança;
* painel administrativo limitado inicialmente;
* manutenção do Provider interno.

---

## 92. Riscos

### 92.1 Flags permanentes

Mitigações:

* `expiresAt`;
* owner;
* alertas;
* cleanup issue;
* checks de CI.

### 92.2 Flag usada como autorização

Mitigações:

* contratos separados;
* revisão;
* testes de segurança;
* avaliação de autorização independente.

### 92.3 Regras inconsistentes entre instâncias

Mitigações:

* snapshots versionados;
* Redis;
* invalidação;
* TTL;
* telemetria.

### 92.4 Targeting com dados pessoais

Mitigações:

* contexto mínimo;
* identificadores opacos;
* revisão de privacidade;
* schemas.

### 92.5 Falha do Provider

Mitigações:

* defaults;
* snapshot local;
* fallback PostgreSQL;
* fail mode explícito.

### 92.6 Rollout não determinístico

Mitigações:

* hashing estável;
* unidade declarada;
* testes;
* versionamento.

### 92.7 Caminhos antigos não removidos

Mitigações:

* prazo;
* CI;
* relatório;
* ownership;
* checklist de conclusão.

### 92.8 Mudança operacional indevida

Mitigações:

* autorização;
* auditoria;
* environment protegido;
* optimistic concurrency;
* reason obrigatório.

### 92.9 Lock-in futuro

Mitigações:

* OpenFeature;
* catálogo próprio;
* contexto padronizado;
* Provider isolado;
* ausência de SDK proprietário nos módulos.

---

## 93. Controles

Deverão ser implementados:

* OpenFeature;
* Provider interno;
* catálogo tipado;
* PostgreSQL;
* snapshots;
* Redis;
* defaults seguros;
* targeting por Account;
* hashing determinístico;
* auditoria;
* owner;
* expiração;
* kill switches;
* métricas;
* testes;
* scripts protegidos;
* checks de CI;
* política de remoção;
* separação de autorização e entitlement.

---

## 94. Estratégia de implementação

### Etapa 1 — Fundação

* adicionar OpenFeature;
* fixar versão;
* criar catálogo;
* criar abstração;
* implementar Provider em memória.

### Etapa 2 — Persistência

* criar tabelas;
* criar schemas;
* criar regras;
* criar ambientes;
* criar audit trail.

### Etapa 3 — Provider PostgreSQL

* carregar definições;
* validar snapshot;
* avaliar defaults;
* implementar targeting;
* implementar rollout percentual.

### Etapa 4 — Cache

* armazenar snapshot no Redis;
* criar versionamento;
* criar invalidação;
* criar fallback;
* medir freshness.

### Etapa 5 — Primeira release flag

* selecionar funcionalidade não crítica;
* definir owner;
* definir rollout;
* testar caminhos;
* ativar em Preview;
* liberar gradualmente;
* remover após estabilização.

### Etapa 6 — Kill switch

* selecionar Provider ou capability;
* implementar caminho desativado;
* testar falha;
* criar alerta;
* documentar runbook.

### Etapa 7 — Governança

* criar script administrativo;
* exigir motivo;
* implementar auditoria;
* criar relatório de flags expiradas;
* integrar CI.

---

## 95. Primeiro caso recomendado

A primeira flag deverá controlar uma capacidade ainda não crítica e com fallback claro.

Candidato:

```text
proposal-management.itinerary-proposal.release
```

Plano inicial:

```text
development: on
preview: on
production: off
→ Account de teste
→ 10% das Accounts elegíveis
→ 50%
→ 100%
→ estabilização
→ remoção da flag
```

---

## 96. Critérios de implementação concluída

A decisão estará implementada quando:

* OpenFeature estiver configurado;
* catálogo tipado existir;
* Provider em memória funcionar;
* Provider PostgreSQL funcionar;
* snapshots estiverem versionados;
* Redis apoiar invalidação;
* primeira flag puder ser alterada sem deployment;
* targeting por Account funcionar;
* rollout percentual for determinístico;
* default seguro for aplicado;
* auditoria registrar mudanças;
* kill switch possuir caminho testado;
* CI detectar flags expiradas;
* módulos não acessarem tabelas diretamente.

---

## 97. Verificação

A verificação deverá incluir:

* flag ausente;
* default;
* variação ativa;
* variação inativa;
* ambiente;
* Account elegível;
* Account não elegível;
* User elegível;
* percentual;
* determinismo;
* mudança de rollout;
* snapshot;
* invalidação;
* Redis indisponível;
* PostgreSQL indisponível;
* configuração inválida;
* auditoria;
* kill switch;
* cliente sem regras sensíveis;
* workflow assíncrono;
* cross-account.

---

## 98. Métricas de adoção

Poderão ser acompanhadas:

* flags ativas;
* flags por tipo;
* flags expiradas;
* flags sem owner;
* avaliações;
* defaults utilizados;
* erros;
* snapshot age;
* invalidações;
* kill switches ativos;
* rollouts em andamento;
* flags removidas;
* tempo médio de vida;
* caminhos antigos pendentes.

---

## 99. Gatilhos de revisão

A decisão deverá ser revisada quando:

* o Provider interno exigir manutenção excessiva;
* o número de flags crescer materialmente;
* experimentação avançada se tornar necessária;
* múltiplas aplicações precisarem compartilhar flags;
* baixa latência global se tornar requisito;
* governança empresarial for necessária;
* LaunchDarkly, Unleash ou outro Provider oferecer benefício comprovado;
* guarded rollouts automáticos se tornarem necessários;
* auditoria interna não atender aos requisitos;
* disponibilidade do sistema próprio for insuficiente.

---

## 100. Estratégia de saída

A migração para outro Provider deverá preservar:

* flag keys;
* tipos;
* defaults;
* contexto;
* unidades de rollout;
* regras essenciais;
* ambientes;
* ownership;
* auditoria histórica;
* catálogo tipado.

Fluxo conceitual:

```text
implementar novo OpenFeature Provider
→ espelhar definições
→ comparar avaliações
→ executar modo shadow
→ migrar ambiente por ambiente
→ validar
→ remover Provider antigo
```

---

## 101. Alternativas futuras permitidas

Esta decisão não impede:

* LaunchDarkly;
* Unleash;
* PostHog;
* Provider OpenFeature adicional;
* painel administrativo;
* guarded rollouts;
* experimentação;
* flags client-side controladas;
* configuração dinâmica especializada.

Toda adoção deverá preservar a separação entre:

* flag;
* autorização;
* entitlement;
* secret;
* experimento.

---

## 102. Próxima decisão

O `RB-ADR-021` deverá definir a estratégia de product analytics, eventos comportamentais e medição de adoção.

A decisão deverá avaliar:

* PostHog;
* Amplitude;
* Mixpanel;
* analytics próprio;
* eventos server-side;
* eventos client-side;
* consentimento;
* identificação;
* anonimização;
* funnels;
* retenção;
* feature adoption;
* experimentação;
* custo;
* privacidade;
* integração com OpenFeature.

A decisão deverá distinguir:

* product analytics;
* observabilidade;
* auditoria;
* métricas de negócio;
* eventos de domínio;
* eventos comportamentais;
* tracking de marketing.

---

## 103. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-020
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar o contexto histórico.

---

## 104. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* alternativas foram avaliadas;
* OpenFeature está justificado;
* PostgreSQL está corretamente posicionado;
* Redis está corretamente posicionado;
* LaunchDarkly foi avaliado;
* Unleash foi avaliado;
* PostHog foi avaliado;
* deployment está separado de release;
* configuração está separada de flag;
* secret está separado de flag;
* entitlement está separado de flag;
* permission está separada de flag;
* experimento está separado de flag;
* catálogo está definido;
* chaves estão governadas;
* tipos estão definidos;
* ciclo de vida está definido;
* owner está definido;
* expiração está definida;
* defaults estão definidos;
* fail-open e fail-closed estão definidos;
* contexto está minimizado;
* Account está contemplada;
* rollout percentual está definido;
* determinismo está definido;
* kill switches estão definidos;
* avaliação server-side está definida;
* Client Components estão contemplados;
* snapshots estão definidos;
* invalidação está definida;
* auditoria está definida;
* IA está contemplada;
* workflows estão contemplados;
* Providers estão contemplados;
* privacidade está definida;
* testes estão definidos;
* CI/CD está contemplado;
* agentes estão limitados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* estratégia de saída está definida;
* não existem contradições com RB-ADR-008;
* não existem contradições com RB-ADR-009;
* não existem contradições com RB-ADR-013;
* não existem contradições com RB-ADR-014;
* não existem contradições com RB-ADR-015;
* não existem contradições com RB-ADR-017;
* não existem contradições com RB-ADR-018;
* não existem contradições com RB-ADR-019.

---

## 105. Declaração final

O RouteBook adotará OpenFeature como API canônica para avaliação de feature flags.

Uma implementação interna baseada em PostgreSQL será utilizada inicialmente para armazenar:

* definições;
* regras;
* variações;
* ambientes;
* ownership;
* auditoria;
* ciclo de vida.

Redis poderá distribuir snapshots e apoiar invalidação, mas não será a fonte canônica das flags.

A avaliação ocorrerá prioritariamente no servidor.

Resultados poderão ser enviados ao cliente somente quando necessários à apresentação e sem expor regras sensíveis.

Feature flags serão utilizadas para:

* releases progressivas;
* kill switches;
* migrações;
* controles operacionais;
* configurações dinâmicas estritamente governadas;
* experimentos futuros.

Feature flags não serão utilizadas como substitutas de:

* autorização;
* permissões;
* entitlements;
* secrets;
* estado canônico do domínio.

Rollouts percentuais utilizarão hashing determinístico e declararão explicitamente sua unidade de distribuição.

Para funcionalidades compartilhadas, a Account será a unidade preferencial.

Toda flag deverá possuir:

* chave estável;
* tipo;
* categoria;
* descrição;
* owner;
* default;
* ambiente;
* plano de rollout;
* prazo de revisão;
* critério de remoção.

Flags de release serão temporárias.

Após a conclusão e estabilização do rollout, o RouteBook removerá o caminho antigo, a avaliação e a dívida técnica correspondente.

A integração por OpenFeature permitirá substituir o Provider interno por uma plataforma gerenciada no futuro sem espalhar contratos proprietários pelo domínio, casos de uso e componentes do RouteBook.
