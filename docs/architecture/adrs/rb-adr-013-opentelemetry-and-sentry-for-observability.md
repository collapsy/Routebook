---

id: RB-ADR-013

title: Adoção de OpenTelemetry e Sentry para Observabilidade, Rastreamento e Monitoramento de Erros
description: Registra a decisão de adotar OpenTelemetry como padrão de instrumentação portável e Sentry como backend gerenciado inicial para monitoramento de erros e desempenho, com logs estruturados, correlação ponta a ponta, proteção de dados e telemetria específica para Providers e capacidades de inteligência artificial.

document_type: architecture_decision_record
owner: Architecture

status: Draft
version: "0.1.0"

created: "2026-07-24"
last_updated: null

authors:

- RouteBook Team

tags:

- architecture
- adr
- observability
- opentelemetry
- sentry
- logging
- tracing
- metrics
- error-tracking
- nextjs
- postgresql
- providers
- artificial-intelligence
- privacy
- operations

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

prerequisites:

- RB-FND-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-ARC-005
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
- RB-AI-002
- RB-AI-004
- RB-AI-005
- RB-AI-006
- RB-DEV-001
- RB-CICD-001
- RB-INFRA-001
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
- RB-ADR-012

next_documents:

- RB-ADR-014

ai_context:
priority: critical
index: true
---

# RB-ADR-013 — Adoção de OpenTelemetry e Sentry para Observabilidade, Rastreamento e Monitoramento de Erros

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* OpenTelemetry será o padrão principal de instrumentação;
* W3C Trace Context será utilizado para propagação de rastreamento;
* Sentry será o backend gerenciado inicial para erros e desempenho;
* logs da aplicação serão estruturados;
* requests, casos de uso, banco, Providers, Tools e capacidades de IA deverão possuir correlação;
* telemetria deverá ser minimizada e sanitizada;
* dados pessoais, secrets, prompts integrais e localização precisa não deverão ser registrados por padrão;
* sampling e retenção deverão ser controlados por ambiente;
* a instrumentação deverá permanecer portável para outro backend;
* versões exatas deverão ser fixadas antes da implementação.

---

## 2. Contexto

O RouteBook combina:

* aplicação web Next.js;
* Server Components;
* Client Components;
* Route Handlers;
* Server Functions;
* PostgreSQL;
* PostGIS;
* autenticação;
* autorização multi-tenant;
* Providers geoespaciais;
* capacidades de inteligência artificial;
* Structured Outputs;
* Tools;
* jobs e processos futuros.

Uma jornada poderá atravessar diversos componentes.

Exemplo:

```text
navegador
→ Next.js
→ autenticação
→ autorização
→ caso de uso
→ repository
→ PostgreSQL
→ Google Maps Platform
→ capacidade de IA
→ Tool
→ resposta
```

Sem correlação, uma falha nesse fluxo seria difícil de diagnosticar.

Além de erros técnicos, o RouteBook precisará observar:

* latência;
* indisponibilidade;
* custos de Providers;
* consumo de modelos;
* falhas de validação;
* autorizações negadas;
* queries lentas;
* cache;
* retries;
* timeouts;
* qualidade operacional;
* jornadas críticas.

---

## 3. Problema

Qual estratégia deverá ser utilizada para:

* detectar erros;
* investigar falhas;
* rastrear requests;
* medir desempenho;
* correlacionar frontend e backend;
* monitorar banco e Providers;
* compreender execuções de IA;
* controlar custo;
* preservar privacidade;
* evitar lock-in excessivo;
* apoiar incidentes e debugging?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. portabilidade;
2. correlação ponta a ponta;
3. suporte a Next.js;
4. error tracking;
5. distributed tracing;
6. logs estruturados;
7. métricas;
8. monitoramento do frontend;
9. monitoramento de Providers;
10. monitoramento de banco;
11. observabilidade de IA;
12. proteção de dados;
13. baixo custo inicial;
14. integração com CI/CD;
15. diagnóstico de produção;
16. sampling;
17. retenção;
18. alertas;
19. operação simples;
20. substituição futura do backend.

---

## 5. Restrições

A solução deverá:

* funcionar com Next.js App Router;
* funcionar com Node.js;
* funcionar no navegador quando necessário;
* suportar OpenTelemetry;
* suportar propagação de contexto;
* permitir logs estruturados;
* permitir monitoramento de erros;
* permitir tracing;
* não exigir instrumentação proprietária em todas as camadas;
* não registrar secrets;
* não registrar tokens;
* não registrar cookies;
* não registrar localização precisa por padrão;
* não registrar prompts integrais por padrão;
* não utilizar AccountId ou UserId como identificadores públicos em ferramentas externas sem proteção;
* permitir configuração por ambiente;
* possuir limites de custo;
* funcionar sem impedir a execução da aplicação quando a telemetria falhar.

---

## 6. Terminologia

### 6.1 Observabilidade

Capacidade de compreender o estado interno de um sistema por seus sinais externos.

### 6.2 Telemetria

Dados produzidos pela aplicação para apoiar observabilidade.

### 6.3 Trace

Representação do fluxo completo de uma operação distribuída.

### 6.4 Span

Unidade individual de trabalho dentro de um trace.

### 6.5 Metric

Medição numérica agregável ao longo do tempo.

### 6.6 Log

Registro estruturado de um acontecimento.

### 6.7 Event

Ocorrência discreta relevante para diagnóstico ou operação.

### 6.8 Error Tracking

Captura, agrupamento e análise de erros e exceções.

### 6.9 Correlation ID

Identificador utilizado para relacionar registros da mesma operação.

### 6.10 Sampling

Política que determina quais dados de telemetria serão coletados ou exportados.

### 6.11 Baggage

Contexto propagado entre componentes, sujeito a limites e controles de segurança.

---

## 7. Princípio central

Instrumentação e backend de observabilidade são responsabilidades diferentes.

```text
aplicação
→ instrumentação OpenTelemetry
→ exportação
→ backend de observabilidade
```

A instrumentação não deverá depender integralmente do formato interno do Sentry.

---

## 8. Opções consideradas

### 8.1 Opção A — Logs textuais somente

Utilizar `console.log` e logs da plataforma de hospedagem.

#### Benefícios

* implementação mínima;
* baixo custo inicial;
* disponibilidade imediata;
* ausência de SDK adicional.

#### Limitações

* baixa correlação;
* dificuldade de busca;
* erros duplicados;
* ausência de traces;
* ausência de contexto de frontend;
* investigação manual;
* baixa capacidade de alertas;
* difícil análise de desempenho.

#### Avaliação

É insuficiente como estratégia principal.

Foi rejeitada.

---

### 8.2 Opção B — Sentry sem OpenTelemetry próprio

Utilizar apenas o SDK e a instrumentação específica do Sentry.

#### Benefícios

* configuração rápida;
* errors;
* traces;
* frontend monitoring;
* integração com Next.js;
* interface gerenciada.

#### Limitações

* maior dependência do fornecedor;
* contratos de instrumentação menos portáveis;
* futura migração mais custosa;
* risco de usar APIs proprietárias em todas as camadas.

#### Avaliação

Sentry será utilizado, mas a instrumentação deverá priorizar padrões portáveis.

---

### 8.3 Opção C — OpenTelemetry com stack própria

Utilizar OpenTelemetry com componentes operados pelo RouteBook, como:

* collector;
* tracing backend;
* metrics backend;
* log storage;
* dashboards.

#### Benefícios

* controle;
* portabilidade;
* customização;
* ausência de dependência de um único SaaS;
* possibilidade de self-hosting.

#### Limitações

* alta carga operacional;
* múltiplos componentes;
* backups;
* atualização;
* segurança;
* storage;
* dashboards;
* custo técnico incompatível com o estágio inicial.

#### Avaliação

Poderá ser adotada futuramente, mas não como primeira composição.

---

### 8.4 Opção D — Plataforma APM empresarial completa

Adotar uma plataforma ampla de observabilidade para logs, métricas, traces e infraestrutura.

#### Benefícios

* conjunto completo;
* dashboards;
* alertas;
* correlação;
* infraestrutura;
* suporte empresarial.

#### Limitações

* custo elevado;
* complexidade;
* volume mínimo desnecessário;
* lock-in;
* recursos além da necessidade inicial.

#### Avaliação

Foi rejeitada para o estágio inicial.

---

### 8.5 Opção E — OpenTelemetry com Sentry

Utilizar:

* OpenTelemetry como padrão de instrumentação;
* Sentry como backend inicial de erros e desempenho;
* logs estruturados como sinal operacional complementar;
* métricas de negócio e custo progressivamente.

#### Benefícios

* portabilidade;
* integração com Next.js;
* error tracking;
* tracing;
* frontend monitoring;
* source maps;
* alertas;
* menor carga operacional;
* evolução gradual;
* possibilidade de trocar ou adicionar exporters.

#### Limitações

* integração exige configuração cuidadosa;
* nem todos os sinais possuem a mesma maturidade;
* possível sobreposição de instrumentação;
* necessidade de controlar sampling;
* custo por volume;
* necessidade de sanitização;
* dependência inicial do SaaS.

#### Avaliação

Oferece o melhor equilíbrio.

Foi selecionada.

---

## 9. Decisão

O RouteBook adotará:

* **OpenTelemetry** como padrão principal de instrumentação;
* **W3C Trace Context** para propagação de traces;
* **Sentry** como backend gerenciado inicial de error tracking e performance monitoring;
* **logs estruturados em JSON** no servidor;
* **source maps protegidos** para diagnóstico de builds;
* **instrumentação manual** para operações de domínio e capacidades críticas;
* **instrumentação automática controlada** para framework, HTTP e dependências;
* **métricas de negócio e custo** para capacidades relevantes;
* **sampling e retenção específicos por ambiente**;
* **sanitização antes da exportação**.

---

## 10. Escopo da decisão

Esta decisão define:

* padrão de instrumentação;
* backend inicial;
* traces;
* spans;
* logs;
* errors;
* métricas;
* correlação;
* sampling;
* redaction;
* telemetria de banco;
* telemetria de Providers;
* telemetria de IA;
* alertas iniciais.

Esta decisão não define integralmente:

* todos os dashboards;
* todos os SLOs;
* plataforma definitiva de logs;
* data warehouse;
* product analytics;
* session replay;
* real user monitoring completo;
* synthetic monitoring;
* uptime provider;
* infraestrutura definitiva do OpenTelemetry Collector;
* retenção contratual final.

---

## 11. Arquitetura conceitual

```text
Browser
→ Next.js
→ Application
→ Database
→ External Providers
→ AI Providers
```

Todos os componentes relevantes deverão participar do mesmo contexto de rastreamento quando tecnicamente possível.

```text
traceId
├── browser navigation
├── server request
├── authentication
├── authorization
├── use case
├── database query
├── maps provider
├── AI capability
└── tool execution
```

---

## 12. OpenTelemetry

OpenTelemetry será utilizado para:

* criação de traces;
* criação de spans;
* propagação de contexto;
* atributos;
* eventos de spans;
* status;
* exporters;
* instrumentação automática;
* instrumentação manual.

Ele não deverá ser utilizado para definir:

* regras de negócio;
* autorização;
* audit trail canônico;
* analytics de produto;
* modelos de domínio.

---

## 13. Instrumentação do Next.js

A aplicação deverá utilizar o mecanismo oficial de instrumentação compatível com a versão fixada do Next.js.

Estrutura conceitual:

```text
apps/web/
├── instrumentation.ts
├── instrumentation-client.ts
├── sentry.server.config.ts
├── sentry.edge.config.ts
└── src/
```

A estrutura final deverá seguir as APIs estáveis da versão adotada.

---

## 14. Runtimes

A instrumentação deverá distinguir:

* Node.js runtime;
* Edge runtime, quando utilizado;
* browser;
* build;
* jobs;
* migrations.

Uma integração disponível em Node.js não deverá ser considerada automaticamente compatível com Edge.

---

## 15. Sentry

Sentry será utilizado inicialmente para:

* captura de exceções;
* agrupamento de erros;
* stack traces;
* source maps;
* release tracking;
* traces;
* spans;
* alertas;
* diagnóstico de frontend;
* diagnóstico de backend.

---

## 16. Papel do Sentry

Sentry não será:

* fonte canônica de auditoria;
* banco de dados;
* analytics completo do produto;
* repositório de prompts;
* repositório de localização;
* repositório de dados de usuários;
* substituto para logs operacionais;
* substituto para métricas de negócio.

---

## 17. Source maps

Source maps deverão ser enviados de forma controlada durante o pipeline.

Eles deverão:

* estar associados à release correta;
* não ser publicados como assets públicos quando desnecessário;
* utilizar token de upload protegido;
* ser removidos dos locais públicos quando a estratégia permitir;
* não conter secrets embutidos.

---

## 18. Releases

Toda telemetria de produção deverá ser associada, quando possível, a:

* release;
* commit;
* ambiente;
* deployment;
* aplicação;
* versão.

Isso permitirá relacionar regressões a mudanças específicas.

---

## 19. Ambientes

A telemetria deverá distinguir:

* development;
* test;
* preview;
* staging;
* production.

Dados de ambientes diferentes não deverão ser agregados sem identificação clara.

---

## 20. Desenvolvimento local

No ambiente local:

* exportação remota poderá permanecer desabilitada por padrão;
* logs estruturados poderão ser exibidos de forma legível;
* traces poderão ser exportados para backend local opcional;
* erros esperados de desenvolvimento não deverão poluir produção;
* secrets reais não deverão ser utilizados.

---

## 21. Preview environments

Ambientes de preview deverão:

* possuir ambiente próprio;
* utilizar sampling reduzido;
* não possuir dados reais;
* não utilizar tokens de produção quando evitável;
* identificar branch e pull request;
* limitar retenção e custo.

---

## 22. Trace Context

A propagação deverá utilizar os headers e padrões compatíveis com W3C Trace Context.

Exemplo:

```text
traceparent
tracestate
```

Baggage deverá ser utilizado somente quando necessário e sem dados sensíveis.

---

## 23. Request ID

Cada request deverá possuir `requestId`.

Ele poderá ser:

* recebido de proxy confiável;
* gerado pela aplicação;
* propagado em logs;
* retornado em respostas de erro quando seguro.

O `requestId` não substitui o `traceId`.

---

## 24. Correlation ID

Operações que atravessarem requests ou processos poderão possuir `correlationId`.

Exemplos:

* criação de Trip;
* geração de Itinerary Proposal;
* execução de job;
* cadeia de Tool Calls;
* processamento de evento.

---

## 25. Causation ID

Eventos e operações derivadas poderão utilizar `causationId` para identificar a operação que originou o efeito.

```text
correlationId
→ agrupa o processo

causationId
→ identifica a causa imediata
```

---

## 26. Spans automáticos

Instrumentação automática poderá gerar spans para:

* requests HTTP;
* fetch;
* framework;
* banco;
* runtime;
* chamadas externas.

Ela deverá ser revisada para evitar:

* duplicação;
* alto volume;
* nomes instáveis;
* atributos sensíveis;
* overhead excessivo.

---

## 27. Spans manuais

Spans manuais deverão representar operações relevantes.

Exemplos:

```text
trip.create
trip.load
activity.move
planning-conflict.resolve
itinerary-proposal.generate
itinerary-proposal.accept-partially
places.search
route.compute
route-matrix.compute
ai.capability.execute
tool.execute
```

---

## 28. Convenção de nomes

Nomes de spans deverão:

* ser estáveis;
* representar operação;
* evitar IDs;
* evitar URLs completas;
* evitar dados pessoais;
* evitar nomes gerados dinamicamente.

Adequado:

```text
trip.load
```

Inadequado:

```text
load-trip-9c1f4a7b-user-ronaldo
```

---

## 29. Atributos

Atributos deverão utilizar cardinalidade controlada.

Exemplos aceitáveis:

```text
routebook.module
routebook.operation
routebook.resource_type
routebook.provider
routebook.capability_id
routebook.tool_id
routebook.cache_status
routebook.result
```

---

## 30. Alta cardinalidade

Deverá ser evitado utilizar como atributos indexáveis:

* UserId;
* AccountId;
* TripId;
* ActivityId;
* PlaceId;
* e-mail;
* endereço;
* coordenada;
* prompt;
* texto livre;
* URL completa.

Quando a correlação com recurso for indispensável, deverá ser utilizado identificador protegido ou estratégia restrita.

---

## 31. Identificadores protegidos

Identificadores internos poderão ser:

* omitidos;
* truncados;
* hasheados com mecanismo aprovado;
* registrados apenas em audit trail interno;
* adicionados somente em ambiente controlado.

Hash sem segredo não deverá ser considerado anonimização completa.

---

## 32. Logs estruturados

Logs do servidor deverão ser produzidos como objetos estruturados.

Exemplo conceitual:

```json
{
  "level": "info",
  "event": "trip.created",
  "requestId": "req_...",
  "traceId": "trace_...",
  "correlationId": "corr_...",
  "module": "trip-management",
  "result": "success"
}
```

---

## 33. Níveis de log

Níveis iniciais:

* `debug`;
* `info`;
* `warn`;
* `error`;
* `fatal`, quando suportado e necessário.

A escolha deverá representar impacto, não preferência pessoal.

---

## 34. Debug

Logs `debug` poderão conter detalhes técnicos controlados.

Eles deverão permanecer:

* desabilitados ou reduzidos em produção;
* sem secrets;
* sem payloads sensíveis;
* sujeitos a sampling;
* temporários quando criados para investigação específica.

---

## 35. Info

Logs `info` deverão representar acontecimentos operacionais relevantes.

Exemplos:

* aplicação iniciada;
* migration concluída;
* Provider selecionado;
* job concluído;
* capability executada;
* fallback utilizado.

Eventos de alto volume não deverão ser registrados individualmente sem necessidade.

---

## 36. Warn

Logs `warn` deverão representar condições degradadas ou inesperadas que ainda permitem continuidade.

Exemplos:

* fallback acionado;
* retry executado;
* quota próxima do limite;
* resposta parcial;
* cache indisponível;
* Structured Output rejeitado com recuperação.

---

## 37. Error

Logs `error` deverão representar falhas que impediram ou comprometeram uma operação.

Eles deverão incluir:

* erro normalizado;
* contexto técnico;
* traceId;
* operation;
* result;
* errorCode.

Não deverão repetir a mesma exceção em todas as camadas sem necessidade.

---

## 38. Error normalization

Erros deverão ser convertidos para representação interna controlada.

Exemplo conceitual:

```typescript
interface ObservabilityError {
  name: string;
  code: string;
  category: string;
  retryable: boolean;
  cause?: unknown;
}
```

Mensagens externas não deverão ser utilizadas como código estável.

---

## 39. Captura de exceções

Exceções inesperadas deverão ser capturadas no ponto em que:

* possuam contexto suficiente;
* não serão tratadas posteriormente;
* representem falha real;
* não causem duplicação.

Erros esperados de domínio não deverão ser reportados automaticamente como incidentes.

---

## 40. Erros de domínio

Resultados como:

* Trip inexistente;
* ação não autorizada;
* estado inválido;
* Planning Conflict já resolvido;
* Itinerary Proposal expirada;

deverão ser tratados como resultados esperados quando fizerem parte da semântica normal.

Eles poderão gerar métricas ou logs controlados, mas não deverão poluir error tracking.

---

## 41. Erros de validação

Falhas de Zod deverão ser agregadas de forma segura.

A telemetria poderá registrar:

* schemaId;
* schemaVersion;
* quantidade de issues;
* paths normalizados;
* origem;
* resultado.

Os valores rejeitados não deverão ser enviados automaticamente.

---

## 42. Autenticação

A telemetria de autenticação poderá registrar:

* operação;
* Provider;
* resultado;
* reasonCode;
* duração;
* ambiente.

Não deverá registrar:

* senha;
* token;
* cookie;
* authorization code;
* access token;
* refresh token;
* magic link.

---

## 43. Autorização

A telemetria poderá registrar:

* action;
* resourceType;
* result;
* reasonCode;
* policyId;
* actorType;
* delegation presente ou ausente.

Tentativas cross-account deverão ser monitoradas como sinal de segurança.

---

## 44. Banco de dados

A instrumentação do PostgreSQL deverá observar:

* duração;
* erro;
* timeout;
* pool;
* conexão;
* transação;
* operação;
* query name quando definida.

SQL e parâmetros não deverão ser exportados indiscriminadamente.

---

## 45. Queries

Queries críticas deverão possuir nomes estáveis.

Exemplos:

```text
trip.find_by_account_and_id
place.find_nearby
activity.list_by_trip
planning_conflict.find_active
itinerary_proposal.load_for_review
```

O nome deverá ser registrado em vez do SQL completo quando suficiente.

---

## 46. Queries lentas

Queries acima do limite definido deverão gerar:

* métrica;
* span sinalizado;
* log sanitizado;
* contexto da operação;
* análise posterior.

O limite poderá variar conforme a categoria da query.

---

## 47. Pool de conexões

Métricas relevantes:

* conexões ativas;
* conexões ociosas;
* fila de aquisição;
* tempo de espera;
* timeouts;
* erros de conexão;
* saturação.

---

## 48. PostGIS

Operações geográficas deverão registrar:

* operation;
* quantidade de candidatos;
* uso de pré-filtro;
* duração;
* resultado;
* erro.

Coordenadas exatas não deverão ser registradas.

---

## 49. Providers externos

Toda chamada externa deverá possuir span próprio.

Atributos possíveis:

```text
provider.name
provider.capability
provider.operation
provider.result
provider.retry_count
provider.cache_status
provider.rate_limit_status
provider.cost_class
```

---

## 50. Google Maps Platform

A telemetria deverá distinguir:

* map load;
* place search;
* place details;
* geocoding;
* route;
* route matrix;
* photo;
* fallback.

Não deverá registrar:

* API key;
* endereço completo;
* coordenadas precisas;
* resposta integral;
* termos pesquisados quando sensíveis.

---

## 51. Custos de Providers

Métricas deverão apoiar:

* chamadas por capability;
* chamadas por ambiente;
* elementos de matriz;
* cache hit;
* retries;
* estimativa de classe de custo;
* quota;
* falhas por billing.

Valores monetários reais poderão ser reconciliados posteriormente com dados do Provider.

---

## 52. Inteligência artificial

Toda execução de capacidade de IA deverá possuir trace ou span específico.

Exemplo:

```text
ai.capability.execute
```

Atributos possíveis:

```text
ai.capability_id
ai.agent_id
ai.provider
ai.model_family
ai.prompt_version
ai.schema_version
ai.result
ai.fallback
ai.retry_count
```

---

## 53. Prompts

Prompts completos não deverão ser enviados à telemetria por padrão.

Poderão ser registrados:

* promptVersion;
* templateId;
* tamanho aproximado;
* categorias de contexto;
* hash controlado;
* quantidade de mensagens.

Captura temporária de conteúdo deverá exigir processo específico e ambiente controlado.

---

## 54. Outputs de IA

Outputs completos também não deverão ser enviados por padrão.

A telemetria poderá registrar:

* schemaId;
* schemaVersion;
* parsing result;
* quantidade de itens;
* validation result;
* policy result;
* fallback;
* confidence class quando existente.

---

## 55. Tokens de IA

Quando fornecidos pelo Provider, deverão ser observados:

* input tokens;
* output tokens;
* total tokens;
* cached tokens quando aplicável;
* reasoning tokens quando aplicável e autorizado;
* modelo;
* capability.

---

## 56. Custos de IA

O sistema deverá permitir estimar ou registrar:

* custo por execução;
* custo por capability;
* custo por modelo;
* custo por ambiente;
* custo por Trip ou Account de forma protegida;
* custo de retry;
* custo de fallback.

---

## 57. Tools

Toda Tool Call deverá possuir span.

Atributos:

```text
tool.id
tool.operation
tool.effect
tool.authorization_result
tool.result
tool.retry_count
tool.timeout
tool.idempotency_status
```

Inputs e outputs completos não deverão ser enviados automaticamente.

---

## 58. Delegação

Execuções delegadas deverão registrar de forma protegida:

* actorType;
* subjectType;
* capabilityId;
* agentId;
* delegation result;
* expiration status;
* authorization result.

---

## 59. Itinerary Proposals

A geração e aplicação de propostas deverão possuir spans diferentes.

Exemplos:

```text
itinerary-proposal.generate
itinerary-proposal.review
itinerary-proposal.accept
itinerary-proposal.accept-partially
itinerary-proposal.reject
```

---

## 60. Planning Conflicts

Operações deverão preservar terminologia canônica.

Exemplos:

```text
planning-conflict.detect
planning-conflict.resolve
planning-conflict.ignore
planning-conflict.restore
planning-conflict.invalidate
```

---

## 61. Frontend monitoring

O frontend deverá monitorar, de forma proporcional:

* erros JavaScript;
* falhas de carregamento;
* navegação;
* requests;
* performance de páginas;
* hydration errors;
* falhas de mapa;
* falhas de Client Components.

---

## 62. Web Vitals

Web Vitals relevantes poderão ser coletados conforme suporte e finalidade.

Exemplos:

* LCP;
* INP;
* CLS;
* TTFB;
* FCP.

As métricas deverão ser analisadas por rota ou classe de página, evitando URLs com IDs.

---

## 63. Session Replay

Session Replay não será habilitado por padrão.

Sua adoção exigirá avaliação específica sobre:

* privacidade;
* mascaramento;
* localização;
* formulários;
* conteúdo de Trips;
* custos;
* consentimento;
* retenção;
* acesso.

---

## 64. Breadcrumbs

Breadcrumbs poderão apoiar investigação.

Eles deverão ser sanitizados e não conter:

* input de formulário;
* endereço;
* localização;
* conteúdo de notas;
* prompts;
* tokens;
* payloads integrais.

---

## 65. Métricas técnicas

Métricas iniciais poderão incluir:

* request count;
* request duration;
* error count;
* active requests;
* database query duration;
* pool saturation;
* provider duration;
* provider error rate;
* cache hit rate;
* AI execution duration;
* Tool execution duration.

---

## 66. Métricas de negócio

Métricas operacionais do produto poderão incluir:

* Trips criadas;
* Activities adicionadas;
* Recommendations geradas;
* Planning Conflicts detectados;
* Itinerary Proposals geradas;
* propostas aceitas;
* propostas parcialmente aceitas;
* fallbacks utilizados.

Essas métricas deverão ser agregadas e não substituir product analytics.

---

## 67. Cardinalidade de métricas

Labels de métricas deverão possuir cardinalidade limitada.

Não deverão utilizar diretamente:

* IDs;
* e-mails;
* nomes;
* destinos livres;
* endereços;
* prompts;
* mensagens de erro livres.

---

## 68. Audit trail

Audit trail e observabilidade são mecanismos diferentes.

### Observabilidade

Tem finalidade de:

* diagnóstico;
* desempenho;
* disponibilidade;
* alertas.

### Auditoria

Tem finalidade de:

* responsabilidade;
* segurança;
* histórico de ações;
* conformidade.

Um evento de auditoria não deverá existir apenas no Sentry.

---

## 69. Redaction

A aplicação deverá possuir uma etapa central de redaction.

Campos mínimos a remover ou mascarar:

```text
password
secret
token
authorization
cookie
accessToken
refreshToken
apiKey
email
phone
address
preciseLocation
latitude
longitude
prompt
responseContent
personalNotes
```

---

## 70. Before-send hooks

Antes de exportar eventos ao backend, deverão ser aplicadas funções de sanitização.

Essas funções deverão:

* remover headers sensíveis;
* remover cookies;
* normalizar URLs;
* remover query parameters sensíveis;
* filtrar breadcrumbs;
* limitar payload;
* remover dados pessoais;
* bloquear eventos incompatíveis.

---

## 71. URLs

URLs de telemetria deverão utilizar templates de rota.

Adequado:

```text
/trips/[tripId]/activities
```

Inadequado:

```text
/trips/01J.../activities?address=Rua...
```

---

## 72. Localização

Não deverão ser registrados por padrão:

* latitude;
* longitude;
* endereço completo;
* localização atual;
* ponto de hospedagem;
* rota detalhada.

Quando métricas regionais forem necessárias, deverá ser utilizada agregação ampla e justificada.

---

## 73. Dados de Account

AccountId não deverá ser enviado diretamente a sistemas externos por padrão.

Para investigação controlada, poderá ser utilizado identificador protegido com:

* escopo limitado;
* documentação;
* rotação quando aplicável;
* acesso restrito.

---

## 74. Retenção

A retenção deverá variar por sinal e ambiente.

Deverão ser definidos:

* retenção de erros;
* retenção de traces;
* retenção de logs;
* retenção de métricas;
* retenção de artefatos;
* retenção de dados de preview.

A retenção deverá ser mínima e proporcional.

---

## 75. Sampling

Sampling deverá ser configurado por:

* ambiente;
* operação;
* resultado;
* criticidade;
* custo;
* volume.

Erros inesperados poderão possuir maior taxa de captura que requests bem-sucedidos.

---

## 76. Head sampling

Head sampling poderá ser utilizado para reduzir volume antes da exportação.

Limitação:

* a decisão ocorre antes de conhecer o resultado completo.

Operações críticas poderão exigir taxa maior.

---

## 77. Tail sampling

Tail sampling poderá ser adotado futuramente com collector ou backend compatível.

Ele poderá priorizar:

* erros;
* alta latência;
* retries;
* falhas de Provider;
* operações críticas;
* execuções caras de IA.

Não será obrigatório na implementação inicial.

---

## 78. Sampling inicial

Baseline conceitual:

### Development

* exportação remota desabilitada ou mínima.

### Preview

* traces reduzidos;
* erros habilitados;
* retenção curta.

### Staging

* taxa superior à produção para diagnóstico;
* dados sintéticos.

### Production

* erros inesperados capturados;
* traces amostrados;
* operações críticas com taxa maior;
* custos monitorados.

Os valores exatos deverão ser definidos na configuração operacional.

---

## 79. Overhead

A instrumentação deverá possuir orçamento de overhead.

Deverão ser medidos:

* CPU;
* memória;
* latência;
* tamanho de bundle;
* volume de rede;
* volume exportado;
* impacto no build.

---

## 80. Falha da telemetria

Falha do exporter ou backend não deverá interromper a operação principal.

A telemetria deverá:

* possuir timeout;
* utilizar buffering limitado;
* falhar silenciosamente de forma controlada;
* evitar retry infinito;
* evitar consumo excessivo de memória.

---

## 81. Alertas iniciais

Alertas prioritários:

* aumento de erros inesperados;
* falha de autenticação sistêmica;
* falha de banco;
* pool saturado;
* Provider geoespacial degradado;
* quota próxima do limite;
* Structured Outputs rejeitados;
* Tool failures;
* aumento de tentativas cross-account;
* deployment com regressão.

---

## 82. Severidade

Incidentes poderão ser classificados conforme:

* usuários afetados;
* Accounts afetadas;
* indisponibilidade;
* perda de dados;
* segurança;
* duração;
* ausência de workaround;
* custo.

A severidade não deverá ser determinada apenas pela quantidade de eventos.

---

## 83. Deduplicação

Erros deverão ser agrupados por causa provável, não apenas por mensagem.

Fingerprints customizados poderão ser utilizados quando:

* o agrupamento padrão for inadequado;
* a regra for estável;
* não utilizar dados sensíveis;
* não fragmentar excessivamente.

---

## 84. Alert fatigue

Alertas deverão ser acionáveis.

Cada alerta deverá possuir:

* condição;
* severidade;
* owner;
* canal;
* runbook;
* janela;
* deduplicação;
* critério de encerramento.

---

## 85. Dashboards

Dashboards iniciais poderão incluir:

### Aplicação

* requests;
* erros;
* latência;
* releases.

### Banco

* queries;
* pool;
* timeouts;
* locks.

### Providers

* chamadas;
* falhas;
* custo;
* quota.

### IA

* execuções;
* latência;
* tokens;
* custo;
* schema failures.

### Segurança

* falhas de autenticação;
* autorizações negadas;
* tentativas cross-account.

---

## 86. Runbooks

Alertas críticos deverão apontar para runbooks.

Um runbook deverá conter:

* sintomas;
* impacto;
* sinais;
* consultas;
* passos de triagem;
* mitigação;
* rollback;
* escalonamento;
* encerramento.

---

## 87. Health checks

A aplicação deverá distinguir:

* liveness;
* readiness;
* dependency health;
* degraded state.

Health checks não deverão executar operações caras ou expor detalhes sensíveis.

---

## 88. Readiness

Readiness poderá considerar:

* configuração válida;
* conexão necessária;
* migrations compatíveis;
* dependências essenciais.

Providers externos não essenciais não deverão tornar a aplicação completamente indisponível quando houver fallback.

---

## 89. Synthetic monitoring

Synthetic monitoring poderá ser adotado posteriormente para:

* página pública;
* login;
* criação de Trip;
* health endpoint;
* jornada crítica.

Não faz parte da implementação obrigatória inicial deste ADR.

---

## 90. Uptime monitoring

Um monitor externo simples poderá ser adotado para validar disponibilidade.

A escolha do Provider poderá ser registrada em configuração operacional, salvo impacto estrutural.

---

## 91. CI/CD

O pipeline deverá:

* definir release;
* enviar source maps;
* associar commit;
* validar configuração;
* impedir upload de secrets;
* marcar deployment;
* executar smoke tests;
* permitir rollback.

---

## 92. Deployments

Eventos de deployment deverão permitir comparar:

* versão anterior;
* versão atual;
* início;
* conclusão;
* ambiente;
* resultado;
* regressões.

---

## 93. Testes unitários

Deverão cobrir:

* redaction;
* normalização de erros;
* criação de atributos;
* limites de cardinalidade;
* geração de requestId;
* propagação de correlationId;
* sampling customizado;
* mapeamento de Provider errors.

---

## 94. Testes de integração

Deverão validar:

* criação de trace;
* propagação;
* spans de caso de uso;
* spans de banco;
* captura de erro;
* sanitização;
* exporter fake;
* falha do exporter;
* correlação de logs.

---

## 95. Testes end-to-end

Playwright poderá validar:

* erro de frontend controlado;
* erro de backend controlado;
* requestId na resposta;
* correlação;
* source map em ambiente de teste;
* ausência de dados sensíveis em payloads capturados.

---

## 96. Testes de privacidade

Deverão verificar que telemetria não contém:

* cookies;
* authorization headers;
* e-mail;
* endereço;
* coordenadas;
* prompts;
* tokens;
* secrets;
* notas pessoais;
* respostas integrais de Providers.

---

## 97. Testes de cardinalidade

Deverão impedir atributos dinâmicos baseados em:

* IDs;
* texto livre;
* URL completa;
* mensagem de usuário;
* destino livre.

---

## 98. Testes de Providers

Deverão verificar que spans de Provider registram:

* Provider;
* capability;
* resultado;
* duração;
* retry;
* cache.

Sem registrar o payload sensível.

---

## 99. Testes de IA

Deverão verificar que a telemetria registra:

* capabilityId;
* model family;
* promptVersion;
* schemaVersion;
* result;
* token usage quando disponível;
* fallback.

Sem registrar prompt ou output completos.

---

## 100. Desenvolvimento assistido por IA

Agentes poderão apoiar:

* instrumentação;
* criação de spans;
* dashboards;
* alertas;
* testes;
* runbooks;
* análise de incidentes.

---

## 101. Limites para agentes

Agentes não poderão autonomamente:

* registrar payload completo;
* remover redaction;
* aumentar sampling de produção;
* habilitar Session Replay;
* enviar localização;
* alterar retenção;
* adicionar atributo de alta cardinalidade;
* registrar prompt completo;
* alterar DSN ou token;
* criar alerta sem owner;
* desabilitar captura de erro crítico;
* instalar exporter desconhecido.

---

## 102. Revisão da instrumentação

Toda mudança deverá avaliar:

* finalidade;
* cardinalidade;
* privacidade;
* volume;
* custo;
* overhead;
* nome;
* sampling;
* retenção;
* utilidade operacional.

---

## 103. Consequências positivas

A decisão proporciona:

* rastreamento ponta a ponta;
* error tracking;
* source maps;
* correlação;
* portabilidade;
* monitoramento de frontend;
* monitoramento de backend;
* visibilidade de Providers;
* visibilidade de IA;
* alertas;
* investigação mais rápida;
* menor carga operacional inicial.

---

## 104. Consequências negativas

A decisão introduz:

* dependências de instrumentação;
* custo por volume;
* necessidade de sampling;
* necessidade de sanitização;
* configuração de source maps;
* risco de duplicação de spans;
* necessidade de governar atributos;
* dependência inicial do Sentry;
* possível overhead.

---

## 105. Riscos

### 105.1 Vazamento de dados

Mitigações:

* redaction;
* before-send hooks;
* testes;
* allowlists;
* revisão;
* retenção mínima.

### 105.2 Alta cardinalidade

Mitigações:

* convenções;
* lint;
* testes;
* atributos controlados;
* ausência de IDs.

### 105.3 Custo excessivo

Mitigações:

* sampling;
* budgets;
* quotas;
* retenção;
* dashboards;
* alertas.

### 105.4 Lock-in

Mitigações:

* OpenTelemetry;
* W3C Trace Context;
* wrappers;
* contratos internos;
* exporters substituíveis.

### 105.5 Overhead

Mitigações:

* medição;
* sampling;
* instrumentação seletiva;
* limites de payload;
* exporters assíncronos.

### 105.6 Duplicação de spans

Mitigações:

* revisar auto-instrumentation;
* configuração única;
* testes;
* convenções.

### 105.7 Alert fatigue

Mitigações:

* thresholds;
* owners;
* runbooks;
* deduplicação;
* revisão periódica.

### 105.8 Telemetria indisponível

Mitigações:

* falha não bloqueante;
* timeout;
* buffering limitado;
* logs locais;
* health separado.

---

## 106. Controles

Deverão ser implementados:

* OpenTelemetry;
* Sentry;
* W3C Trace Context;
* logs estruturados;
* redaction;
* source maps protegidos;
* releases;
* sampling;
* retenção;
* alertas;
* dashboards;
* requestId;
* correlationId;
* spans manuais;
* limites de cardinalidade;
* testes de privacidade;
* budgets;
* runbooks.

---

## 107. Estratégia de implementação

### Etapa 1 — Fundação

* adicionar dependências;
* fixar versões;
* criar módulo de observabilidade;
* configurar ambientes;
* criar redaction.

### Etapa 2 — Sentry

* criar projeto;
* configurar DSN;
* configurar server;
* configurar browser;
* configurar Edge quando necessário;
* configurar releases e source maps.

### Etapa 3 — OpenTelemetry

* criar registro de instrumentação;
* configurar resource attributes;
* configurar propagação;
* validar integração com Sentry;
* evitar duplicação.

### Etapa 4 — Logs

* criar logger estruturado;
* integrar traceId;
* integrar requestId;
* definir níveis;
* sanitizar.

### Etapa 5 — Aplicação

* instrumentar casos de uso críticos;
* instrumentar autenticação;
* instrumentar autorização;
* instrumentar banco;
* instrumentar Providers.

### Etapa 6 — IA e Tools

* instrumentar capabilities;
* instrumentar modelos;
* instrumentar Structured Outputs;
* instrumentar Tools;
* registrar custos e tokens.

### Etapa 7 — Alertas

* criar alertas de erro;
* criar alertas de banco;
* criar alertas de Provider;
* criar alertas de segurança;
* criar runbooks.

### Etapa 8 — Validação

* executar testes de redaction;
* medir overhead;
* revisar sampling;
* revisar custos;
* revisar retenção.

---

## 108. Critérios de implementação concluída

A decisão estará implementada quando:

* OpenTelemetry estiver configurado;
* Sentry estiver configurado;
* erros frontend forem capturados;
* erros backend forem capturados;
* source maps funcionarem;
* release estiver associada;
* requestId existir;
* traceId estiver nos logs;
* caso de uso possuir span;
* query possuir telemetria;
* Provider possuir span;
* capability de IA possuir span;
* redaction estiver testada;
* alertas iniciais existirem;
* falha da telemetria não bloquear a aplicação.

---

## 109. Verificação

A verificação deverá incluir:

* erro no browser;
* erro no servidor;
* erro em Route Handler;
* erro em Server Function;
* query lenta;
* Provider indisponível;
* timeout;
* retry;
* autorização negada;
* tentativa cross-account;
* Structured Output inválido;
* Tool failure;
* source map;
* release;
* redaction;
* sampling;
* falha do exporter.

---

## 110. Métricas de adoção

Poderão ser acompanhadas:

* operações críticas instrumentadas;
* erros sem trace;
* logs sem requestId;
* atributos rejeitados;
* eventos sanitizados;
* volume exportado;
* custo;
* taxa de sampling;
* overhead;
* alertas sem owner;
* incidentes sem runbook;
* queries sem nome;
* Providers sem instrumentação;
* Tools sem spans.

---

## 111. Gatilhos de revisão

A decisão deverá ser revisada quando:

* o custo do Sentry se tornar desproporcional;
* requisitos de logs exigirem backend dedicado;
* métricas exigirem plataforma específica;
* OpenTelemetry Collector tornar-se necessário;
* múltiplas aplicações exigirem pipeline central;
* requisitos regulatórios limitarem o SaaS;
* retenção precisar ser controlada internamente;
* a integração causar overhead material;
* outro backend oferecer benefício comprovado;
* o projeto precisar de self-hosting.

---

## 112. Estratégia de rollback

A substituição do Sentry deverá preservar:

* instrumentação OpenTelemetry;
* nomes de spans;
* atributos;
* logs;
* métricas;
* propagação;
* dashboards conceituais;
* alertas;
* runbooks.

O backend poderá ser substituído ou complementado por outro exporter.

---

## 113. Estratégia de saída

O RouteBook deverá conseguir:

* remover o SDK específico;
* manter OpenTelemetry;
* alterar exporter;
* introduzir Collector;
* exportar para outro backend;
* preservar W3C Trace Context;
* preservar logs estruturados;
* preservar contratos internos.

---

## 114. Alternativas futuras permitidas

Esta decisão não impede:

* OpenTelemetry Collector;
* backend próprio;
* Grafana;
* Tempo;
* Loki;
* Prometheus;
* Axiom;
* Datadog;
* New Relic;
* SigNoz;
* Uptrace;
* outro backend compatível;
* uptime monitoring;
* synthetic monitoring.

Cada adoção deverá possuir finalidade e custo claros.

---

## 115. Decisões derivadas

Deverão ser avaliadas decisões sobre:

* logger estruturado;
* OpenTelemetry Collector;
* backend de métricas;
* backend de logs;
* product analytics;
* synthetic monitoring;
* uptime monitoring;
* Session Replay;
* frontend performance budgets;
* retenção;
* incident management;
* status page.

---

## 116. Próxima decisão

O `RB-ADR-014` deverá definir a estratégia de cache, rate limiting e armazenamento de estado temporário.

A decisão deverá avaliar:

* cache em memória;
* Redis;
* Provider Redis gerenciado;
* cache do Next.js;
* cache de Providers;
* idempotência;
* locks distribuídos;
* sessions;
* rate limiting;
* filas;
* invalidação;
* isolamento por Account;
* custo;
* privacidade;
* disponibilidade.

A decisão deverá distinguir:

* cache;
* persistência canônica;
* sessão;
* idempotência;
* rate limiting;
* lock;
* fila.

---

## 117. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-013
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar o contexto histórico.

---

## 118. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* OpenTelemetry está justificado;
* Sentry está justificado;
* instrumentação e backend estão separados;
* Trace Context está definido;
* requestId está definido;
* correlationId está definido;
* logs estruturados estão definidos;
* níveis estão definidos;
* error tracking está definido;
* frontend está contemplado;
* banco está contemplado;
* PostGIS está contemplado;
* Providers estão contemplados;
* custos estão contemplados;
* IA está contemplada;
* Tools estão contempladas;
* prompts estão protegidos;
* outputs estão protegidos;
* localização está protegida;
* redaction está definida;
* sampling está definido;
* retenção está definida;
* source maps estão definidos;
* releases estão definidas;
* alertas estão definidos;
* runbooks estão definidos;
* testes estão definidos;
* agentes estão contemplados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* estratégia de saída está definida;
* supersessão está definida;
* observabilidade não foi confundida com auditoria;
* observabilidade não foi confundida com analytics;
* não existem contradições com RB-OBS-001;
* não existem contradições com RB-SEC-001;
* não existem contradições com RB-PRIV-001;
* não existem contradições com RB-AI-004;
* não existem contradições com RB-AI-006;
* não existem contradições com RB-ADR-003;
* não existem contradições com RB-ADR-005;
* não existem contradições com RB-ADR-008;
* não existem contradições com RB-ADR-012.

---

## 119. Declaração final

O RouteBook adotará OpenTelemetry como padrão principal de instrumentação e Sentry como backend gerenciado inicial para erros e desempenho.

OpenTelemetry será responsável por fornecer uma linguagem portável para:

* traces;
* spans;
* propagação;
* atributos;
* eventos;
* métricas.

Sentry será utilizado inicialmente para:

* error tracking;
* stack traces;
* source maps;
* releases;
* performance monitoring;
* alertas;
* diagnóstico de frontend e backend.

Logs do servidor serão estruturados e correlacionados com traces.

A instrumentação deverá abranger:

* Next.js;
* casos de uso;
* PostgreSQL;
* PostGIS;
* autenticação;
* autorização;
* Providers;
* inteligência artificial;
* Tools.

Telemetria não deverá armazenar por padrão:

* secrets;
* tokens;
* cookies;
* dados pessoais completos;
* endereços;
* localização precisa;
* prompts integrais;
* outputs integrais de IA.

Sampling, retenção, cardinalidade e custo serão tratados como requisitos arquiteturais.

A falha da telemetria não deverá impedir o funcionamento principal do RouteBook.

A utilização de padrões abertos deverá permitir substituir ou complementar o Sentry futuramente sem reescrever toda a instrumentação da aplicação.
