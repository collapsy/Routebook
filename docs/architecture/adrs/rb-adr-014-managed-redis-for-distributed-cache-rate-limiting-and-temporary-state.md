---

id: RB-ADR-014

title: Adoção de Redis Gerenciado para Cache Distribuído, Rate Limiting, Idempotência e Estado Temporário
description: Registra a decisão de adotar uma infraestrutura Redis gerenciada como armazenamento distribuído de dados temporários, reconstruíveis e com expiração, cobrindo cache compartilhado, rate limiting, idempotência, deduplicação, coordenação limitada e proteção de Providers.

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
- redis
- cache
- distributed-cache
- rate-limiting
- idempotency
- temporary-state
- distributed-coordination
- nextjs
- providers
- artificial-intelligence
- security
- cost-governance

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
- RB-ADR-013

prerequisites:

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
- RB-ADR-013

next_documents:

- RB-ADR-015

ai_context:
priority: critical
index: true
---

# RB-ADR-014 — Adoção de Redis Gerenciado para Cache Distribuído, Rate Limiting, Idempotência e Estado Temporário

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* Redis será a tecnologia preferencial para estado temporário distribuído;
* uma oferta Redis gerenciada será preferida em produção;
* PostgreSQL continuará sendo a fonte canônica dos dados duráveis;
* cache, rate limiting, idempotência e locks terão namespaces e contratos separados;
* toda chave deverá possuir owner, finalidade e política de expiração;
* Redis não será requisito obrigatório para o primeiro fluxo local quando um fallback seguro for suficiente;
* falhas no Redis deverão produzir degradação controlada de acordo com a criticidade da capacidade;
* dados pessoais e localização precisa não deverão ser armazenados sem finalidade e proteção explícitas;
* versões e capacidades utilizadas deverão ser fixadas antes da implementação.

---

## 2. Contexto

O RouteBook utilizará:

* Next.js;
* Node.js;
* PostgreSQL;
* PostGIS;
* Drizzle ORM;
* Better Auth;
* Google Maps Platform;
* Providers de inteligência artificial;
* Tools;
* múltiplas instâncias de aplicação quando houver escala;
* ambientes de preview;
* jobs e workers futuros.

A aplicação precisa controlar estados que não pertencem necessariamente ao banco canônico.

Exemplos:

* resultados temporários de Providers;
* cálculos de rota;
* matrizes de distância;
* respostas de geocoding;
* contadores de rate limiting;
* chaves de idempotência;
* deduplicação de requests;
* supressão de chamadas simultâneas;
* estado transitório de jobs;
* nonces;
* tokens de uso único;
* resultados intermediários de capacidades de IA;
* proteção contra custo excessivo;
* coordenação limitada entre processos.

Esses estados possuem características diferentes dos dados canônicos:

* curta duração;
* possibilidade de reconstrução;
* alto volume;
* necessidade de expiração;
* acesso frequente;
* compartilhamento entre instâncias;
* tolerância a perda controlada.

---

## 3. Problema

Qual estratégia deverá ser adotada para armazenar e coordenar estados temporários, considerando:

* execução distribuída;
* ambientes serverless;
* múltiplas instâncias;
* baixa latência;
* expiração;
* operações atômicas;
* rate limiting;
* cache;
* idempotência;
* proteção de Providers;
* custo;
* privacidade;
* portabilidade;
* disponibilidade;
* simplicidade inicial?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. compartilhamento entre instâncias;
2. baixa latência;
3. expiração nativa;
4. operações atômicas;
5. suporte a rate limiting;
6. suporte a cache;
7. idempotência;
8. deduplicação;
9. proteção de custos;
10. integração com Node.js;
11. compatibilidade com serverless;
12. operação gerenciada;
13. observabilidade;
14. isolamento por ambiente;
15. isolamento por Account;
16. privacidade;
17. controle de memória;
18. portabilidade;
19. degradação controlada;
20. baixo custo inicial.

---

## 5. Restrições

A solução deverá:

* funcionar com Node.js;
* funcionar com Next.js;
* permitir acesso por múltiplas instâncias;
* oferecer TTL;
* oferecer operações atômicas;
* suportar configuração gerenciada;
* funcionar em desenvolvimento local;
* não substituir PostgreSQL como fonte canônica;
* não armazenar dados sem política de expiração quando forem temporários;
* não expor credenciais ao navegador;
* não utilizar IDs e dados pessoais diretamente nas chaves sem proteção;
* não transformar falha de cache em corrupção de dados;
* não utilizar locks temporários como garantia absoluta de integridade;
* não exigir Redis para testes unitários.

---

## 6. Terminologia

### 6.1 Cache

Cópia temporária e reconstruível de um dado obtido de outra fonte.

### 6.2 Estado temporário

Dado cujo ciclo de vida é limitado e que não representa a fonte canônica do domínio.

### 6.3 Rate Limiting

Controle da quantidade de operações permitidas em determinado período.

### 6.4 Idempotency Key

Identificador utilizado para reconhecer repetições da mesma operação lógica.

### 6.5 Deduplicação

Prevenção do processamento simultâneo ou repetido da mesma solicitação.

### 6.6 Distributed Lock

Lease temporário utilizado para reduzir execução concorrente sobre determinado recurso.

### 6.7 TTL

Tempo após o qual uma chave expira automaticamente.

### 6.8 Cache Stampede

Conjunto de requests concorrentes tentando reconstruir simultaneamente o mesmo item expirado.

### 6.9 Canonical State

Estado durável cuja fonte oficial pertence ao domínio e à persistência principal.

### 6.10 Ephemeral State

Estado transitório que pode expirar ou ser perdido sem alterar a verdade canônica.

---

## 7. Princípio central

Redis armazenará apenas dados:

* temporários;
* reconstruíveis;
* derivados;
* de coordenação limitada;
* com ciclo de vida explícito.

```text
PostgreSQL
→ estado canônico

Redis
→ estado temporário ou derivado
```

Fluxo proibido:

```text
Redis
→ única fonte de uma Trip, Activity ou Decision
```

---

## 8. Opções consideradas

### 8.1 Opção A — Somente memória do processo

Utilizar mapas, caches e contadores dentro da instância Node.js.

#### Benefícios

* implementação simples;
* latência mínima;
* ausência de infraestrutura;
* custo direto inexistente.

#### Limitações

* estado não compartilhado;
* perda em reinicialização;
* comportamento diferente entre instâncias;
* inadequado para rate limiting distribuído;
* inadequado para idempotência entre requests;
* baixa previsibilidade em serverless.

#### Avaliação

Poderá ser utilizado para caches locais estritamente não críticos, mas não como estratégia distribuída.

Foi rejeitada como solução principal.

---

### 8.2 Opção B — PostgreSQL para todo estado temporário

Utilizar tabelas no PostgreSQL para cache, contadores, idempotência e locks.

#### Benefícios

* infraestrutura já existente;
* transações;
* consistência;
* persistência;
* menor quantidade de tecnologias;
* boa auditabilidade.

#### Limitações

* maior carga no banco principal;
* necessidade de limpeza;
* latência maior para operações muito frequentes;
* risco de bloat;
* contenção;
* pior adequação para contadores de alta frequência;
* operação de cache menos natural.

#### Avaliação

PostgreSQL continuará sendo utilizado quando a idempotência exigir garantia transacional forte ou histórico durável.

Não será a solução padrão para todos os estados temporários.

---

### 8.3 Opção C — Cache nativo do Next.js como única estratégia

Utilizar somente as capacidades de cache do framework.

#### Benefícios

* integração com Next.js;
* baixa configuração;
* revalidação;
* suporte a renderização;
* cache próximo à camada web.

#### Limitações

* semântica vinculada ao framework;
* inadequado para rate limiting geral;
* inadequado para idempotência;
* inadequado para locks;
* comportamento depende da plataforma de deployment;
* menor controle de estruturas e operações atômicas.

#### Avaliação

O cache do Next.js continuará permitido para renderização e dados públicos adequados.

Ele não substituirá o armazenamento temporário distribuído geral.

---

### 8.4 Opção D — Redis operado pelo RouteBook

Provisionar e administrar uma instância Redis própria.

#### Benefícios

* controle;
* portabilidade;
* acesso ao protocolo;
* customização;
* possibilidade de custos previsíveis em escala.

#### Limitações

* backups quando necessários;
* patches;
* disponibilidade;
* segurança;
* upgrades;
* monitoramento;
* failover;
* carga operacional desproporcional ao estágio inicial.

#### Avaliação

Poderá ser reavaliado futuramente.

Foi rejeitado para a operação inicial.

---

### 8.5 Opção E — Redis gerenciado por conexão TCP

Utilizar uma oferta Redis gerenciada tradicional.

#### Benefícios

* compatibilidade ampla;
* clientes maduros;
* baixa latência;
* suporte a comandos;
* pooling;
* operação gerenciada;
* portabilidade entre ofertas.

#### Limitações

* gerenciamento de conexões;
* possível incompatibilidade com alguns ambientes serverless;
* rede privada ou configuração adicional;
* custo de instância mínima em alguns Providers.

#### Avaliação

É uma opção válida, especialmente para workloads Node.js persistentes.

Poderá ser utilizada conforme o ambiente de deployment.

---

### 8.6 Opção F — Redis gerenciado com interface HTTP

Utilizar uma oferta Redis gerenciada compatível com ambientes serverless e acesso por HTTP.

#### Benefícios

* ausência de conexão persistente;
* integração simples com serverless;
* cobrança proporcional em determinadas ofertas;
* suporte a rate limiting;
* baixa operação;
* configuração rápida;
* ambientes independentes.

#### Limitações

* latência de rede HTTP;
* API e SDK específicos;
* suporte parcial a determinados comandos;
* custo por request;
* dependência do Provider;
* necessidade de adapter para preservar portabilidade.

#### Avaliação

É adequada como implementação inicial quando o deployment utilizar execução serverless.

A escolha do fornecedor concreto será uma decisão de infraestrutura ou configuração operacional.

---

### 8.7 Opção G — Redis gerenciado com adapter portável

Definir contratos próprios e selecionar a forma de acesso conforme o ambiente.

#### Benefícios

* Redis como modelo operacional;
* suporte a TCP ou HTTP;
* portabilidade;
* menor acoplamento;
* compatibilidade com serverless;
* possibilidade de evolução;
* separação entre capability e Provider.

#### Limitações

* necessidade de abstrações;
* testes adicionais;
* menor acesso direto a APIs específicas;
* risco de criar adapter genérico excessivo.

#### Avaliação

Oferece o melhor equilíbrio.

Foi selecionada.

---

## 9. Decisão

O RouteBook adotará:

* **Redis** como tecnologia preferencial para estado temporário distribuído;
* **Redis gerenciado** como estratégia de produção inicial;
* **adapter interno** para proteger o código de APIs específicas do fornecedor;
* **acesso HTTP** quando o ambiente serverless justificar;
* **acesso TCP** quando o runtime persistente oferecer melhor adequação;
* **cache do Next.js** apenas para responsabilidades de renderização e caching compatíveis com o framework;
* **PostgreSQL** para idempotência durável ou transacionalmente acoplada ao estado canônico;
* **memória local** somente para otimizações não críticas e isoladas por processo.

---

## 10. Escopo da decisão

Esta decisão define:

* tecnologia de estado temporário;
* responsabilidades do Redis;
* limites em relação ao PostgreSQL;
* organização das chaves;
* TTL;
* cache;
* rate limiting;
* idempotência;
* deduplicação;
* locks limitados;
* degradação;
* privacidade;
* testes;
* observabilidade.

Esta decisão não define integralmente:

* fornecedor final;
* plano comercial;
* região;
* biblioteca cliente final;
* sistema de filas;
* scheduler;
* workflow engine;
* event streaming;
* cache semântico de IA;
* algoritmo final de rate limiting de todas as rotas;
* solução completa de locks distribuídos.

---

## 11. Responsabilidades permitidas

Redis poderá ser utilizado para:

* cache distribuído;
* rate limiting;
* idempotência temporária;
* deduplicação;
* nonces;
* tokens de uso único;
* locks temporários;
* request coalescing;
* resultados temporários de Providers;
* estado transitório de jobs;
* circuit breaker;
* contadores;
* feature state temporário;
* supressão de chamadas simultâneas.

---

## 12. Responsabilidades proibidas

Redis não deverá ser a única fonte de:

* Account;
* User;
* Account Membership;
* Trip;
* Activity;
* Place;
* Itinerary;
* Recommendation;
* Decision;
* Planning Conflict;
* Itinerary Proposal;
* eventos de auditoria;
* consentimentos;
* exclusões;
* dados financeiros;
* estado de domínio irreconstruível.

---

## 13. Ports internos

Contratos deverão representar capacidades, não comandos Redis genéricos expostos ao domínio.

Exemplo:

```typescript
interface CacheStore {
  get<T>(key: CacheKey, schema: RuntimeSchema<T>): Promise<T | null>;

  set<T>(
    key: CacheKey,
    value: T,
    options: CacheWriteOptions,
  ): Promise<void>;

  delete(key: CacheKey): Promise<void>;
}

interface RateLimiter {
  consume(input: RateLimitInput): Promise<RateLimitDecision>;
}

interface IdempotencyStore {
  begin(input: BeginIdempotentOperation): Promise<IdempotencyDecision>;

  complete(input: CompleteIdempotentOperation): Promise<void>;

  fail(input: FailIdempotentOperation): Promise<void>;
}
```

---

## 14. Adapter de infraestrutura

A implementação poderá conter:

```text
platform/
└── temporary-state/
    ├── cache/
    ├── rate-limiting/
    ├── idempotency/
    ├── coordination/
    ├── redis/
    └── tests/
```

Módulos não deverão criar clientes Redis diretamente.

---

## 15. Separação de capacidades

Não deverá existir um único wrapper genérico utilizado indiscriminadamente.

Deverão ser separados:

* Cache Store;
* Rate Limiter;
* Idempotency Store;
* Nonce Store;
* Circuit Breaker State;
* Coordination Lease.

Cada contrato deverá possuir semântica e garantias próprias.

---

## 16. Organização das chaves

Chaves deverão seguir estrutura estável.

Formato conceitual:

```text
rb:<environment>:<capability>:<scope>:<identifier>:<version>
```

Exemplos:

```text
rb:prod:cache:place-details:<protected-id>:v1
rb:prod:rate-limit:account:<protected-id>:places-search:v1
rb:prod:idempotency:trip-create:<protected-key>:v1
rb:prod:lock:itinerary-proposal:<protected-id>:v1
```

---

## 17. Regras de nomenclatura

Chaves deverão:

* possuir prefixo da aplicação;
* possuir ambiente;
* possuir capability;
* possuir versão;
* evitar texto livre;
* evitar e-mail;
* evitar endereço;
* evitar coordenadas;
* evitar nomes pessoais;
* evitar IDs externos sem proteção quando sensíveis.

---

## 18. Proteção de identificadores

Quando identificadores internos forem utilizados em chaves, deverão ser avaliados quanto a:

* sensibilidade;
* previsibilidade;
* exposição em logs;
* ferramentas administrativas;
* acesso do Provider.

Poderão ser utilizados identificadores derivados por HMAC com secret rotacionável quando apropriado.

Hash simples não será considerado anonimização completa.

---

## 19. Versionamento de chaves

Mudanças incompatíveis no formato deverão utilizar nova versão.

Exemplo:

```text
:v1
:v2
```

Isso permite:

* rollout progressivo;
* invalidação;
* convivência temporária;
* rollback;
* limpeza posterior.

---

## 20. Serialização

Valores deverão utilizar formato explícito.

Opções iniciais:

* string;
* integer;
* JSON validado;
* estruturas nativas do Redis.

JSON deverá ser validado com Zod ao ser lido.

O tipo TypeScript não substitui a validação em runtime.

---

## 21. Compressão

Compressão somente deverá ser utilizada quando:

* o tamanho justificar;
* o custo de CPU for aceitável;
* o formato estiver versionado;
* a observabilidade existir;
* houver testes.

Objetos muito grandes deverão ser reavaliados antes de serem armazenados.

---

## 22. Limites de tamanho

Toda capability deverá definir tamanho máximo por valor.

Redis não deverá ser utilizado para:

* respostas integrais muito grandes;
* arquivos;
* imagens;
* prompts extensos;
* documentos;
* dumps de Providers;
* logs.

---

## 23. TTL obrigatório

Dados temporários deverão possuir TTL explícito.

Exceções deverão possuir justificativa documentada.

Fluxo proibido:

```text
SET temporary-key value
```

Fluxo esperado:

```text
SET temporary-key value EX ttl
```

---

## 24. Seleção de TTL

O TTL deverá considerar:

* volatilidade;
* custo de reconstrução;
* risco de defasagem;
* regras do Provider;
* sensibilidade;
* impacto da perda;
* frequência de atualização.

Não deverá existir um TTL universal.

---

## 25. Categorias de TTL

Categorias conceituais:

### Muito curto

* segundos;
* proteção contra duplicação;
* coalescing;
* locks;
* tráfego.

### Curto

* minutos;
* rate limiting;
* circuit breaker;
* resultados altamente voláteis.

### Médio

* horas;
* detalhes temporários;
* geocoding permitido;
* resultados reconstruíveis.

### Longo controlado

* dias;
* somente quando termos, atualização e negócio permitirem.

---

## 26. Cache-aside

Cache distribuído utilizará preferencialmente cache-aside.

```text
request
→ consultar cache
→ hit: retornar valor
→ miss: consultar fonte
→ validar
→ armazenar com TTL
→ retornar valor
```

A fonte canônica continuará sendo consultável independentemente do cache.

---

## 27. Cache hit e miss

Toda leitura deverá distinguir:

* hit;
* miss;
* stale hit quando suportado;
* bypass;
* error;
* fallback.

Esses resultados deverão ser observáveis.

---

## 28. Invalidação

Estratégias permitidas:

* expiração por TTL;
* invalidação explícita;
* versionamento de chave;
* namespace versionado;
* revalidação;
* atualização assíncrona.

A invalidação deverá ser definida pelo owner do dado.

---

## 29. Invalidação por escrita

Dados canônicos alterados poderão exigir invalidação do cache relacionado.

Exemplo:

```text
Place atualizado
→ commit no PostgreSQL
→ invalidar cache permitido do Place
```

A falha de invalidação deverá resultar em stale data temporária limitada pelo TTL, não em corrupção do estado canônico.

---

## 30. Cache stampede

A aplicação deverá reduzir múltiplas reconstruções simultâneas.

Estratégias possíveis:

* request coalescing;
* lease curta;
* stale-while-revalidate;
* early refresh;
* jitter no TTL;
* limitação de concorrência.

---

## 31. Jitter

TTLs de grandes conjuntos poderão receber variação controlada para evitar expiração simultânea.

A variação deverá preservar os limites de freshness.

---

## 32. Negative caching

Resultados ausentes poderão ser cacheados por período curto quando isso reduzir chamadas repetidas.

Exemplos:

* Place externo inexistente;
* rota não disponível;
* resultado vazio de geocoding.

O TTL deverá ser menor que o de resultados positivos quando o estado puder mudar.

---

## 33. Cache de Providers

Cada Provider deverá possuir política própria.

A política deverá considerar:

* termos;
* operação;
* campos;
* TTL;
* atribuição;
* data de obtenção;
* Provider Reference;
* região;
* idioma;
* Account quando aplicável.

---

## 34. Google Maps Platform

O cache de dados da Google Maps Platform deverá obedecer às políticas definidas no `RB-ADR-012`.

Redis não autoriza armazenar um dado que não possa ser armazenado segundo os termos aplicáveis.

---

## 35. Cache de rotas

A chave deverá considerar:

* origem protegida;
* destino protegido;
* modo;
* preferência de rota;
* idioma;
* região;
* bucket temporal;
* Provider;
* versão.

Resultados dependentes de tráfego deverão possuir TTL curto.

---

## 36. Cache de Route Matrix

A chave deverá considerar:

* conjunto ordenado ou normalizado de origens;
* conjunto ordenado ou normalizado de destinos;
* modo;
* parâmetros;
* instante ou bucket;
* Provider;
* versão.

O número de destinos deverá permanecer limitado.

---

## 37. Cache de Places

Place Search e Place Details deverão utilizar caches separados.

Isso evita:

* misturar listas e detalhes;
* TTL inadequado;
* field masks incompatíveis;
* sobrescrever resultados com campos incompletos.

---

## 38. Cache de inteligência artificial

Outputs de IA não serão cacheados automaticamente.

A adoção deverá considerar:

* capabilityId;
* promptVersion;
* modelFamily;
* schemaVersion;
* contexto;
* dados pessoais;
* freshness;
* determinismo;
* finalidade;
* risco de reutilização incorreta.

---

## 39. Cache semântico

Cache semântico não faz parte da implementação obrigatória inicial.

Sua adoção exigirá decisão específica sobre:

* embeddings;
* similaridade;
* privacidade;
* falso positivo;
* invalidação;
* custo;
* Provider;
* retenção;
* isolamento por Account.

---

## 40. Cache do Next.js

O cache do Next.js poderá ser utilizado para:

* conteúdo público;
* páginas estáticas;
* configurações públicas;
* dados reconstruíveis e corretamente escopados;
* revalidação de renderização.

Não deverá ser utilizado sem análise para:

* dados privados;
* Trips;
* localização;
* sessões;
* autorização;
* Account específica.

---

## 41. Cache privado

Todo cache de dado privado deverá incluir escopo suficiente.

No mínimo, conforme o caso:

* Account;
* User;
* resource;
* permission-sensitive state;
* versão;
* locale.

Uma chave global não deverá armazenar resposta dependente de autorização.

---

## 42. Rate limiting distribuído

Redis será utilizado para rate limiting quando houver mais de uma instância ou quando o limite precisar sobreviver entre requests independentes.

Dimensões possíveis:

* IP;
* sessão;
* User;
* Account;
* capability;
* Provider;
* Tool;
* API key;
* endpoint;
* modelo de IA.

---

## 43. Algoritmos de rate limiting

Algoritmos possíveis:

* fixed window;
* sliding window;
* token bucket;
* leaky bucket.

A escolha deverá depender da capability.

Não haverá um único algoritmo obrigatório para todos os casos.

---

## 44. Token bucket

Token bucket será preferido quando for necessário:

* permitir pequenos bursts;
* manter taxa média;
* proteger Providers;
* controlar IA;
* limitar Tools;
* limitar buscas.

---

## 45. Fixed window

Fixed window poderá ser utilizado para limites simples e de baixo risco.

Deverá ser avaliado o efeito de burst na transição entre janelas.

---

## 46. Sliding window

Sliding window poderá ser utilizado quando for necessário limite temporal mais preciso.

O custo de operações e armazenamento deverá ser considerado.

---

## 47. Chave de rate limiting

Formato conceitual:

```text
rb:<env>:rate-limit:<scope>:<protected-subject>:<operation>:v1
```

A chave não deverá utilizar diretamente dados pessoais.

---

## 48. Limites em camadas

Uma operação poderá possuir mais de um limite.

Exemplo para IA:

* limite por IP;
* limite por User;
* limite por Account;
* limite por capability;
* limite global;
* limite de custo.

A decisão efetiva deverá respeitar o limite mais restritivo aplicável.

---

## 49. Rate limiting de autenticação

Endpoints de autenticação deverão considerar:

* IP;
* identidade;
* Provider;
* operação;
* resultado.

Limites não deverão permitir account enumeration por respostas diferentes.

---

## 50. Rate limiting de Providers

Capacidades geoespaciais deverão possuir limites específicos.

Exemplos:

* autocomplete;
* Place Search;
* Place Details;
* geocoding;
* Routes;
* Route Matrix;
* fotografias.

---

## 51. Rate limiting de IA

Capacidades de IA deverão considerar:

* Account;
* User;
* capability;
* modelFamily;
* custo;
* tokens;
* execução concorrente.

Uma execução cara poderá consumir mais de uma unidade lógica do bucket.

---

## 52. Rate limiting de Tools

Tools deverão declarar:

* limite;
* janela;
* escopo;
* custo;
* burst;
* fallback;
* reasonCode.

Tools mutáveis poderão possuir limites mais restritivos.

---

## 53. Resposta de rate limiting

A resposta deverá possuir contrato estável.

Exemplo:

```typescript
interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  reasonCode?: string;
}
```

A exposição externa deverá evitar revelar políticas sensíveis.

---

## 54. Headers HTTP

Quando apropriado, respostas poderão informar:

* limite;
* restante;
* reset;
* retry-after.

A nomenclatura deverá seguir o contrato de API adotado.

---

## 55. Fail-open e fail-closed

Cada rate limiter deverá definir comportamento em caso de indisponibilidade.

### Fail-open possível

* leitura pública de baixo risco;
* experiência não crítica;
* custo reduzido.

### Fail-closed possível

* autenticação sensível;
* Tool destrutiva;
* Provider muito caro;
* operação sujeita a abuso.

A escolha deverá ser explícita.

---

## 56. Idempotência

Idempotência deverá impedir efeitos duplicados em operações repetidas.

Casos:

* criação de Trip;
* aceitação de Itinerary Proposal;
* aceitação parcial;
* processamento de webhook;
* Tool mutável;
* publicação de job;
* retry de Provider com efeito.

---

## 57. Idempotência temporária

Redis poderá armazenar estado temporário de idempotência quando:

* a janela for limitada;
* a operação puder ser reconciliada;
* não houver necessidade de histórico durável;
* o efeito canônico possuir proteção adicional.

Estados possíveis:

```text
processing
completed
failed-retryable
```

---

## 58. Idempotência durável

PostgreSQL deverá ser preferido quando:

* a garantia precisar sobreviver a perda do Redis;
* o efeito for financeiro ou crítico;
* a idempotência fizer parte da transação canônica;
* houver necessidade de auditoria;
* a janela for longa;
* a resposta precisar ser reconstruída com precisão.

---

## 59. Idempotency key

A chave deverá:

* ser fornecida pelo cliente confiável ou gerada pela aplicação;
* possuir escopo;
* possuir operação;
* possuir Account;
* possuir versão;
* possuir TTL;
* não ser reutilizada entre operações diferentes.

---

## 60. Fingerprint

A aplicação poderá armazenar fingerprint do request para detectar uso da mesma chave com payload incompatível.

O fingerprint deverá:

* excluir campos voláteis;
* utilizar serialização canônica;
* não expor payload;
* utilizar mecanismo criptográfico aprovado.

---

## 61. Resposta idempotente

Quando uma operação já estiver concluída, a aplicação poderá retornar:

* resultado previamente persistido;
* referência ao recurso;
* status equivalente;
* erro de conflito se o payload divergir.

A resposta não deverá depender exclusivamente de um payload grande armazenado no Redis.

---

## 62. Deduplicação

Deduplicação poderá impedir chamadas concorrentes idênticas.

Exemplos:

* dois requests de Place Details;
* duas Route Matrices iguais;
* duas gerações da mesma Itinerary Proposal;
* dois jobs para o mesmo recurso.

---

## 63. Request coalescing

Quando múltiplos consumidores solicitarem o mesmo dado ausente:

1. uma execução torna-se responsável pela reconstrução;
2. as demais aguardam ou utilizam fallback;
3. o valor é armazenado;
4. os consumidores recebem o resultado.

Timeouts deverão impedir espera indefinida.

---

## 64. Locks distribuídos

Locks Redis serão tratados como leases temporários, não como mutexes absolutos.

Eles poderão ser utilizados para:

* reduzir duplicação;
* coordenar refresh;
* evitar execução concorrente de job não crítico;
* proteger seção com efeito idempotente.

---

## 65. Limites dos locks

Locks Redis não deverão ser a única proteção para:

* integridade de domínio;
* saldo;
* ownership;
* autorização;
* unicidade;
* transações;
* aplicação de proposta;
* estado irreversível.

Essas garantias deverão utilizar PostgreSQL, constraints, versões e idempotência.

---

## 66. Aquisição de lock

A aquisição deverá utilizar:

* identificador aleatório do owner;
* TTL;
* operação atômica;
* timeout curto;
* número limitado de tentativas.

---

## 67. Liberação de lock

A liberação deverá verificar se o owner atual ainda corresponde ao cliente.

Não deverá executar `DEL` de forma irrestrita sobre um lock que possa ter expirado e sido readquirido.

---

## 68. Fencing tokens

Operações críticas que exigirem coordenação mais forte deverão considerar fencing tokens ou versão canônica no PostgreSQL.

O lock por si só não impede um processo atrasado de continuar após a expiração.

---

## 69. Circuit breaker

Redis poderá armazenar estado compartilhado de circuit breaker para Providers.

Estados conceituais:

* closed;
* open;
* half-open.

O estado deverá possuir TTL e observabilidade.

---

## 70. Nonces e uso único

Redis poderá armazenar:

* nonce OAuth complementar;
* token de confirmação;
* marcador de uso único;
* challenge temporário.

Secrets completos não deverão aparecer em logs ou chaves legíveis.

---

## 71. Sessões

As sessões de autenticação continuarão persistidas conforme o `RB-ADR-007`.

Redis não substituirá automaticamente a persistência de sessões no PostgreSQL.

Poderá ser utilizado como cache de sessão somente após avaliação de:

* revogação;
* consistência;
* TTL;
* invalidation;
* segurança;
* comportamento do Better Auth.

---

## 72. Filas

Redis não será adotado automaticamente como sistema de filas apenas por estar disponível.

Filas exigem decisão sobre:

* entrega;
* retry;
* ordenação;
* dead-letter;
* durabilidade;
* observabilidade;
* concorrência;
* agendamento.

---

## 73. Pub/Sub

Redis Pub/Sub não deverá ser utilizado para eventos que precisem de:

* durabilidade;
* replay;
* garantia de entrega;
* auditoria;
* processamento posterior.

Poderá ser usado apenas para sinais transitórios quando perda for aceitável.

---

## 74. Streams

Redis Streams poderão ser avaliados futuramente, mas não fazem parte da decisão inicial.

A adoção exigirá comparação com:

* PostgreSQL Outbox;
* filas gerenciadas;
* workflow engine;
* event broker.

---

## 75. Persistência do Redis

A persistência interna do serviço Redis não altera a classificação do dado como temporário.

Mesmo que o Provider ofereça persistência, a aplicação deverá assumir que:

* chaves podem expirar;
* dados podem ser eliminados;
* cache pode ser limpo;
* o estado pode ficar indisponível.

---

## 76. Eviction policy

A política de eviction deverá ser compatível com as capacidades armazenadas.

Caches reconstruíveis podem tolerar eviction.

Estados como idempotência temporária e rate limiting exigem avaliação mais cuidadosa.

Quando necessário, workloads deverão utilizar:

* instâncias separadas;
* limites separados;
* namespaces;
* planos de memória adequados.

---

## 77. Separação por workload

Produção poderá separar Redis por finalidade quando houver risco de interferência.

Exemplo:

* cache;
* rate limiting e idempotência;
* jobs futuros.

A separação não será obrigatória no MVP, mas a arquitetura deverá permitir evolução.

---

## 78. Isolamento por ambiente

Cada ambiente deverá utilizar:

* database;
* namespace;
* credencial;
* ou instância separada.

Produção não deverá compartilhar chaves com preview ou desenvolvimento.

---

## 79. Regiões

O Redis deverá ser provisionado próximo ao runtime principal.

A decisão deverá considerar:

* latência;
* residência de dados;
* Provider;
* failover;
* custo;
* relação com PostgreSQL;
* relação com aplicação.

---

## 80. Alta disponibilidade

A configuração deverá ser proporcional à criticidade.

Cache poderá tolerar indisponibilidade maior que:

* rate limiting de segurança;
* idempotência crítica;
* coordenação de jobs.

A criticidade deverá orientar plano e fallback.

---

## 81. Segurança de rede

O acesso deverá utilizar:

* TLS;
* credenciais;
* allowlists ou rede privada quando disponível;
* rotação;
* menor privilégio;
* secrets por ambiente.

---

## 82. Credenciais

Credenciais Redis deverão:

* permanecer fora do repositório;
* não ser enviadas ao cliente;
* ser separadas por ambiente;
* possuir rotação;
* ser mascaradas;
* possuir owner;
* ser removidas ao desativar ambiente.

---

## 83. Privacidade

Dados armazenados deverão ser minimizados.

Deverão ser evitados:

* e-mail;
* telefone;
* nome;
* endereço;
* notas;
* localização precisa;
* prompts;
* outputs integrais;
* tokens;
* cookies;
* credenciais.

---

## 84. Localização

Coordenadas precisas não deverão fazer parte de chaves em texto aberto.

Quando uma rota precisar ser cacheada, a chave deverá utilizar representação protegida ou discretização apropriada, desde que não gere colisões semanticamente perigosas.

---

## 85. Dados de IA

Prompts e outputs integrais não deverão ser armazenados por padrão.

Caches de IA futuros deverão armazenar somente o mínimo necessário e possuir:

* finalidade;
* escopo por Account;
* TTL;
* schema;
* modelo;
* promptVersion;
* redaction;
* política de exclusão.

---

## 86. Direito de exclusão

Dados temporários relacionados a uma Account poderão precisar de invalidação quando ocorrer:

* exclusão;
* encerramento;
* revogação;
* solicitação de privacidade;
* remoção de integração.

A organização das chaves deverá permitir remoção seletiva quando necessária.

---

## 87. Logs

Logs não deverão registrar:

* valor completo;
* credencial;
* chave contendo dado sensível;
* payload;
* coordenada;
* conteúdo de cache.

Poderão registrar:

* capability;
* namespace;
* resultado;
* TTL class;
* duração;
* tamanho aproximado;
* cache status;
* errorCode.

---

## 88. Observabilidade

Operações Redis deverão possuir spans ou métricas para:

* get;
* set;
* delete;
* rate limit;
* idempotency;
* lock;
* timeout;
* retry;
* fallback.

Comandos ou chaves completas não deverão ser exportados indiscriminadamente.

---

## 89. Métricas técnicas

Métricas possíveis:

* cache hit rate;
* cache miss rate;
* latência;
* erros;
* timeouts;
* memória;
* conexões ou requests;
* evictions;
* expirations;
* rate limit allowed;
* rate limit denied;
* idempotency hits;
* lock contention;
* fallback usage.

---

## 90. Métricas por capability

Métricas poderão distinguir:

* maps;
* places;
* routes;
* AI;
* authentication;
* Tools;
* API pública;
* jobs.

Labels deverão possuir baixa cardinalidade.

---

## 91. Alertas

Alertas iniciais poderão cobrir:

* indisponibilidade;
* aumento de erros;
* latência;
* memória próxima do limite;
* evictions inesperadas;
* rate limiting sem estado;
* idempotência indisponível;
* custo;
* quota;
* credencial inválida.

---

## 92. Degradação controlada

Cada capability deverá definir fallback.

Exemplos:

### Cache

* consultar a fonte;
* evitar gravar;
* continuar.

### Rate limiting de baixo risco

* limite local reduzido;
* fail-open controlado.

### Rate limiting de alto risco

* fail-closed;
* indisponibilidade temporária.

### Idempotência crítica

* utilizar PostgreSQL;
* rejeitar temporariamente;
* não executar sem proteção.

---

## 93. Timeout

Operações Redis deverão possuir timeouts curtos.

Uma falha de cache não deverá manter um request bloqueado por tempo superior ao benefício esperado.

---

## 94. Retry

Retries deverão ser limitados.

Não deverão ocorrer indiscriminadamente no caminho síncrono quando:

* a operação for de cache;
* o timeout já comprometer a experiência;
* houver risco de amplificação;
* o Provider estiver indisponível.

---

## 95. Desenvolvimento local

O desenvolvimento deverá suportar:

* Redis local por container;
* adapter em memória para testes e desenvolvimento limitado;
* serviço gerenciado de desenvolvimento quando necessário;
* reset;
* inspeção;
* seeds temporários.

---

## 96. Adapter em memória

O adapter em memória poderá ser utilizado para:

* testes unitários;
* desenvolvimento de fluxo;
* histórias que não exigem múltiplas instâncias.

Ele não será evidência suficiente para:

* atomicidade;
* TTL real;
* concorrência;
* rate limiting distribuído;
* locks;
* compatibilidade do Provider.

---

## 97. Testcontainers

Testes de integração poderão utilizar Redis real descartável por Testcontainers.

Deverão validar:

* conexão;
* TTL;
* atomicidade;
* rate limiting;
* idempotência;
* locks;
* expiração;
* falha;
* concorrência.

---

## 98. Testes unitários

Deverão cobrir:

* geração de chave;
* proteção de identificadores;
* seleção de TTL;
* serialização;
* cache policy;
* decisão de fallback;
* fingerprint;
* reason codes;
* mapeamento de erros.

---

## 99. Testes de cache

Casos mínimos:

* hit;
* miss;
* expiração;
* valor inválido;
* invalidação;
* Provider indisponível;
* cache indisponível;
* negative cache;
* stampede;
* escopo por Account.

---

## 100. Testes de rate limiting

Casos mínimos:

* primeiro request;
* limite restante;
* limite excedido;
* reset;
* burst;
* concorrência;
* múltiplas instâncias;
* Account diferente;
* operação diferente;
* falha do Redis;
* fail-open;
* fail-closed.

---

## 101. Testes de idempotência

Casos mínimos:

* primeira execução;
* repetição durante processamento;
* repetição após conclusão;
* mesma chave com payload divergente;
* expiração;
* falha retryable;
* concorrência;
* perda do Redis;
* fallback durável.

---

## 102. Testes de locks

Deverão validar:

* aquisição;
* contenção;
* expiração;
* liberação pelo owner;
* tentativa de liberação por outro owner;
* processo atrasado;
* timeout;
* fallback.

Os testes não deverão alegar garantias superiores às fornecidas pela implementação.

---

## 103. Testes de privacidade

Deverão verificar ausência de:

* e-mail em chave;
* localização em chave;
* token em chave;
* payload em log;
* prompt em valor não autorizado;
* dados cross-account;
* credenciais em erro.

---

## 104. Testes end-to-end

Jornadas poderão validar:

* rate limiting de login;
* rate limiting de Place Search;
* deduplicação de geração;
* idempotência de mutação;
* fallback de cache;
* indisponibilidade controlada;
* headers de limite.

---

## 105. CI/CD

Pull requests deverão:

* executar testes unitários;
* executar integração com Redis real quando necessário;
* não utilizar credenciais de produção;
* não chamar serviço pago sem necessidade;
* validar variáveis;
* validar migrations ou scripts associados.

---

## 106. Ambientes de preview

Cada preview deverá:

* utilizar namespace exclusivo;
* possuir TTL curto;
* possuir quota reduzida;
* evitar dados reais;
* ser limpo após encerramento.

---

## 107. Custos

Custos deverão ser acompanhados por:

* armazenamento;
* quantidade de requests;
* tráfego;
* região;
* plano;
* ambientes;
* capabilities.

O cache não deverá custar mais que a operação que pretende evitar sem justificativa.

---

## 108. Capacidade e memória

A configuração deverá definir:

* memória máxima;
* tamanho esperado;
* eviction policy;
* alertas;
* distribuição por namespace;
* crescimento;
* itens grandes;
* TTL médio.

---

## 109. Desenvolvimento assistido por IA

Agentes poderão apoiar:

* contratos;
* key builders;
* políticas de TTL;
* rate limiters;
* testes;
* observabilidade;
* análise de custos.

---

## 110. Limites para agentes

Agentes não poderão autonomamente:

* armazenar dado canônico somente no Redis;
* remover TTL;
* utilizar e-mail em chave;
* utilizar coordenada em chave;
* alterar fail-open ou fail-closed;
* criar lock como única garantia;
* aumentar limites;
* ampliar retenção;
* armazenar prompt integral;
* criar cache cross-account;
* registrar credencial;
* habilitar nova capability;
* utilizar comandos destrutivos em produção.

---

## 111. Revisão de mudanças

Mudanças deverão avaliar:

* owner;
* finalidade;
* chave;
* versão;
* TTL;
* tamanho;
* sensibilidade;
* fallback;
* cardinalidade;
* custo;
* observabilidade;
* testes;
* impacto de eviction;
* impacto de indisponibilidade.

---

## 112. Consequências positivas

A decisão proporciona:

* estado compartilhado;
* baixa latência;
* expiração;
* rate limiting distribuído;
* idempotência temporária;
* deduplicação;
* proteção de Providers;
* redução de custo;
* menor carga no PostgreSQL;
* compatibilidade com múltiplas instâncias;
* operação gerenciada;
* evolução gradual.

---

## 113. Consequências negativas

A decisão introduz:

* nova infraestrutura;
* nova dependência operacional;
* custo;
* necessidade de TTL;
* necessidade de invalidação;
* risco de stale data;
* risco de falhas parciais;
* necessidade de proteger chaves;
* necessidade de controlar memória;
* possibilidade de lock-in do Provider;
* necessidade de adapters e testes.

---

## 114. Riscos

### 114.1 Redis tornando-se fonte canônica

Mitigações:

* documentação;
* ports;
* revisão;
* testes;
* persistência principal no PostgreSQL.

### 114.2 Dados sem TTL

Mitigações:

* API de escrita exigindo TTL;
* lint;
* testes;
* revisão.

### 114.3 Cache cross-account

Mitigações:

* chave escopada;
* proteção de identificadores;
* testes;
* negação por padrão.

### 114.4 Stale data

Mitigações:

* TTL;
* invalidação;
* Provenance;
* freshness;
* revalidação.

### 114.5 Eviction de idempotência

Mitigações:

* memória;
* separação de workload;
* PostgreSQL para casos críticos;
* alertas.

### 114.6 Lock incorreto

Mitigações:

* lease curta;
* owner token;
* liberação segura;
* fencing;
* constraint canônica;
* idempotência.

### 114.7 Indisponibilidade

Mitigações:

* fallback;
* timeout;
* fail-open ou fail-closed explícito;
* operação gerenciada;
* alertas.

### 114.8 Custo inesperado

Mitigações:

* quotas;
* métricas;
* TTL;
* tamanho máximo;
* ambientes separados;
* budgets.

### 114.9 Vazamento de dados

Mitigações:

* minimização;
* HMAC;
* TLS;
* secrets;
* logs sanitizados;
* retenção curta.

### 114.10 Lock-in do Provider

Mitigações:

* Redis como modelo;
* ports;
* adapter;
* testes de contrato;
* ausência de APIs proprietárias no domínio.

---

## 115. Controles

Deverão ser implementados:

* Redis gerenciado;
* adapter interno;
* namespaces;
* key builder;
* versionamento;
* TTL obrigatório;
* schemas Zod;
* limites de tamanho;
* cache policy;
* rate limiting;
* idempotência;
* fallbacks;
* TLS;
* secrets;
* observabilidade;
* testes de concorrência;
* testes de privacidade;
* budgets;
* alertas;
* documentação de ownership.

---

## 116. Estratégia de implementação

### Etapa 1 — Fundação

* selecionar oferta gerenciada compatível;
* criar ambientes;
* configurar secrets;
* configurar TLS;
* definir região;
* fixar cliente.

### Etapa 2 — Contratos

* criar Cache Store;
* criar Rate Limiter;
* criar Idempotency Store;
* criar key builder;
* criar políticas de TTL;
* criar schemas.

### Etapa 3 — Primeiro cache

* aplicar cache a uma operação reconstruível;
* adicionar TTL;
* adicionar métricas;
* adicionar fallback;
* testar invalidação.

### Etapa 4 — Rate limiting

* proteger autenticação;
* proteger Place Search;
* proteger Route Matrix;
* proteger capability de IA;
* definir fail modes.

### Etapa 5 — Idempotência

* proteger uma Tool mutável;
* proteger criação ou aplicação de operação relevante;
* integrar PostgreSQL quando necessário;
* testar concorrência.

### Etapa 6 — Providers

* adicionar request coalescing;
* adicionar negative caching;
* adicionar circuit breaker;
* monitorar custo.

### Etapa 7 — Qualidade

* Testcontainers;
* testes cross-account;
* testes de expiração;
* testes de indisponibilidade;
* testes de privacidade.

### Etapa 8 — Operação

* dashboards;
* alertas;
* budgets;
* runbooks;
* capacity review.

---

## 117. Critérios de implementação concluída

A decisão estará implementada quando:

* Redis gerenciado estiver provisionado;
* ambientes estiverem separados;
* credenciais estiverem protegidas;
* adapter estiver implementado;
* key builder estiver implementado;
* TTL for obrigatório;
* primeiro cache distribuído funcionar;
* primeiro rate limiter distribuído funcionar;
* primeira operação idempotente funcionar;
* fallback estiver definido;
* observabilidade estiver ativa;
* testes com Redis real passarem;
* dados sensíveis não aparecerem em chaves ou logs.

---

## 118. Verificação

A verificação deverá incluir:

* conexão;
* TLS;
* isolamento de ambiente;
* hit;
* miss;
* TTL;
* expiração;
* invalidação;
* rate limiting;
* concorrência;
* idempotência;
* deduplicação;
* lock;
* falha;
* timeout;
* fail-open;
* fail-closed;
* eviction simulada;
* privacidade;
* custo;
* observabilidade.

---

## 119. Métricas de adoção

Poderão ser acompanhadas:

* capabilities usando Redis;
* chaves sem TTL;
* hit rate;
* miss rate;
* evictions;
* valores grandes;
* rate limits acionados;
* idempotency hits;
* lock contention;
* falhas;
* latência;
* fallback;
* memória;
* requests;
* custo;
* chaves por ambiente;
* incidentes de stale data.

---

## 120. Gatilhos de revisão

A decisão deverá ser revisada quando:

* Redis se tornar indisponível com frequência;
* custo se tornar desproporcional;
* latência for inadequada;
* o Provider limitar comandos essenciais;
* idempotência exigir maior durabilidade;
* filas se tornarem necessárias;
* workflow engine se tornar necessário;
* workloads exigirem separação;
* requisitos regulatórios impedirem o Provider;
* self-hosting oferecer benefício comprovado;
* outra tecnologia atender melhor às capacidades.

---

## 121. Estratégia de rollback

A substituição do Provider deverá preservar:

* contratos;
* key formats;
* TTL policies;
* schemas;
* rate limit policies;
* idempotency semantics;
* fallbacks;
* testes;
* observabilidade.

Caches poderão ser descartados durante a migração.

Estados temporários críticos deverão possuir plano de transição ou fallback no PostgreSQL.

---

## 122. Estratégia de saída

O RouteBook deverá conseguir:

* trocar cliente;
* trocar acesso HTTP por TCP;
* trocar Provider;
* executar Redis local;
* separar workloads;
* limpar caches;
* preservar contratos;
* reconstruir dados;
* manter PostgreSQL como fonte canônica.

---

## 123. Alternativas futuras permitidas

Esta decisão não impede:

* cache local;
* cache do Next.js;
* PostgreSQL para idempotência durável;
* fila gerenciada;
* workflow engine;
* Redis Streams;
* serviço especializado de rate limiting;
* CDN cache;
* edge cache;
* cache semântico.

Cada uso deverá possuir escopo e garantias definidos.

---

## 124. Decisões derivadas

Deverão ser avaliadas decisões sobre:

* Provider Redis gerenciado;
* cliente Redis;
* sistema de filas;
* workflow engine;
* scheduler;
* Transactional Outbox;
* cache semântico;
* CDN;
* edge caching;
* estratégia de jobs;
* feature flags;
* distributed concurrency limits.

---

## 125. Próxima decisão

O `RB-ADR-015` deverá definir a estratégia de jobs assíncronos, filas e workflows duráveis.

A decisão deverá avaliar:

* execução síncrona;
* jobs baseados no PostgreSQL;
* filas gerenciadas;
* QStash;
* BullMQ;
* Trigger.dev;
* Inngest;
* Temporal;
* retries;
* schedules;
* idempotência;
* dead-letter;
* observabilidade;
* Account;
* Tools;
* capacidades de IA;
* portabilidade;
* custo.

A decisão deverá distinguir:

* evento;
* outbox;
* job;
* fila;
* workflow;
* schedule;
* Tool Call;
* request síncrono.

---

## 126. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-014
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar o contexto histórico.

---

## 127. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* Redis está justificado;
* oferta gerenciada está justificada;
* HTTP e TCP foram considerados;
* PostgreSQL está corretamente posicionado;
* cache do Next.js está corretamente posicionado;
* responsabilidades permitidas estão definidas;
* responsabilidades proibidas estão definidas;
* ports estão definidos;
* chaves estão governadas;
* identificadores estão protegidos;
* versionamento está definido;
* TTL está definido;
* cache-aside está definido;
* invalidação está definida;
* stampede está contemplado;
* Providers estão contemplados;
* IA está contemplada;
* rate limiting está definido;
* fail-open e fail-closed estão definidos;
* idempotência está definida;
* locks estão limitados;
* fencing está contemplado;
* sessões estão corretamente posicionadas;
* filas não foram escolhidas prematuramente;
* segurança está definida;
* privacidade está definida;
* observabilidade está definida;
* testes estão definidos;
* custos estão contemplados;
* agentes estão contemplados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* estratégia de saída está definida;
* supersessão está definida;
* não existem contradições com RB-ADR-005;
* não existem contradições com RB-ADR-007;
* não existem contradições com RB-ADR-008;
* não existem contradições com RB-ADR-009;
* não existem contradições com RB-ADR-012;
* não existem contradições com RB-ADR-013.

---

## 128. Declaração final

O RouteBook adotará Redis como tecnologia preferencial para estado temporário distribuído.

Uma oferta gerenciada será utilizada inicialmente para reduzir carga operacional e permitir integração com múltiplas instâncias e ambientes serverless.

Redis será utilizado para:

* cache distribuído;
* rate limiting;
* idempotência temporária;
* deduplicação;
* coordenação limitada;
* circuit breakers;
* nonces;
* proteção de Providers.

PostgreSQL continuará sendo a fonte canônica para:

* domínio;
* transações;
* integridade;
* auditoria;
* idempotência durável;
* estado irreconstruível.

Toda chave temporária deverá possuir:

* owner;
* finalidade;
* namespace;
* versão;
* TTL;
* limite de tamanho;
* política de privacidade;
* fallback.

Locks Redis serão tratados como leases temporários.

Eles não substituirão:

* constraints;
* transações;
* optimistic concurrency;
* fencing;
* idempotência;
* autorização.

Rate limiting será aplicado em camadas para proteger:

* autenticação;
* APIs;
* Google Maps Platform;
* capacidades de IA;
* Tools;
* custos.

A implementação permanecerá protegida por ports e adapters para permitir troca de cliente, forma de conexão ou Provider sem redefinir os módulos do RouteBook.
