---

id: RB-ADR-015

title: Adoção de Inngest para Jobs Assíncronos e Workflows Duráveis
description: Registra a decisão de adotar Inngest como plataforma inicial de execução assíncrona e durável do RouteBook, cobrindo jobs, eventos, schedules, retries, checkpoints, concorrência, workflows de inteligência artificial e processamento de Providers.

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
- inngest
- asynchronous-jobs
- background-jobs
- durable-execution
- workflows
- queues
- events
- schedules
- retries
- artificial-intelligence
- providers
- nextjs
- observability

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-002
- RB-PRD-004
- RB-PRD-005
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
- RB-ADR-012
- RB-ADR-013
- RB-ADR-014

prerequisites:

- RB-FND-004
- RB-DOM-001
- RB-DOM-002
- RB-DOM-003
- RB-DOM-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-DATA-001
- RB-DATA-002
- RB-API-001
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
- RB-AI-001
- RB-AI-002
- RB-AI-003
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
- RB-ADR-008
- RB-ADR-009
- RB-ADR-010
- RB-ADR-012
- RB-ADR-013
- RB-ADR-014

next_documents:

- RB-ADR-016

ai_context:
priority: critical
index: true
---

# RB-ADR-015 — Adoção de Inngest para Jobs Assíncronos e Workflows Duráveis

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* Inngest será a plataforma inicial para execução assíncrona e durável;
* jobs serão implementados como funções explicitamente identificadas;
* workflows com múltiplos efeitos deverão utilizar etapas duráveis;
* eventos internos deverão possuir schemas e versões;
* retries serão configurados por função ou etapa;
* efeitos deverão permanecer idempotentes;
* PostgreSQL continuará sendo a fonte canônica dos dados;
* Transactional Outbox será utilizada quando a publicação de evento precisar ser atomicamente ligada a uma alteração canônica;
* schedules deverão possuir timezone e ownership explícitos;
* falhas permanentes deverão ser observáveis e recuperáveis;
* código de domínio não dependerá diretamente do SDK do Inngest;
* versões exatas deverão ser fixadas antes da implementação.

---

## 2. Contexto

O RouteBook começará como uma aplicação web relativamente concentrada, mas algumas operações não deverão permanecer dentro do ciclo síncrono de uma requisição.

Exemplos:

* enriquecimento de Places;
* atualização de dados externos;
* geração de Recommendations;
* geração de Itinerary Proposals;
* reavaliação de Planning Conflicts;
* cálculo de rotas para vários candidatos;
* sincronização com Providers;
* envio de notificações;
* limpeza de dados temporários;
* expiração de propostas;
* atualização de dados desatualizados;
* avaliações de capacidades de inteligência artificial;
* processamento posterior de eventos;
* exportação de dados;
* exclusão e anonimização;
* jobs programados.

Essas operações podem:

* levar mais tempo que uma requisição;
* depender de Providers instáveis;
* exigir retries;
* aguardar determinado instante;
* aguardar outro evento;
* possuir múltiplas etapas;
* precisar sobreviver a redeploys e falhas;
* consumir recursos e custos controlados;
* necessitar de observabilidade detalhada.

---

## 3. Problema

Qual estratégia deverá ser adotada para executar jobs assíncronos e workflows duráveis, considerando:

* Next.js;
* TypeScript;
* Node.js;
* ambientes serverless;
* PostgreSQL;
* Redis;
* Providers geoespaciais;
* Providers de inteligência artificial;
* retries;
* schedules;
* concorrência;
* idempotência;
* observabilidade;
* custos;
* privacidade;
* portabilidade;
* baixo custo operacional inicial?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. execução durável;
2. checkpoints;
3. retries por etapa;
4. suporte a TypeScript;
5. integração com Next.js;
6. suporte a eventos;
7. suporte a schedules;
8. suporte a espera;
9. suporte a workflows de múltiplas etapas;
10. controle de concorrência;
11. idempotência;
12. observabilidade;
13. desenvolvimento local;
14. baixo custo operacional;
15. compatibilidade com IA;
16. compatibilidade com Providers;
17. segurança;
18. portabilidade;
19. recuperação manual;
20. evolução futura.

---

## 5. Restrições

A solução deverá:

* funcionar com TypeScript;
* funcionar com Node.js;
* integrar-se ao Next.js;
* funcionar fora do tempo de vida de uma requisição comum;
* permitir retries;
* permitir delays e schedules;
* permitir controle de concorrência;
* permitir execução local;
* permitir observabilidade;
* suportar payloads validados;
* não transformar a fila em fonte canônica;
* não exigir que entidades de domínio conheçam o SDK;
* não assumir entrega exatamente uma vez;
* não depender de memória do processo;
* não armazenar secrets em eventos;
* não armazenar prompts integrais sem finalidade explícita;
* não substituir autorização;
* não substituir idempotência.

---

## 6. Terminologia

### 6.1 Evento

Fato imutável que comunica que algo ocorreu.

### 6.2 Job

Unidade assíncrona de trabalho executada fora do fluxo principal de uma requisição.

### 6.3 Queue

Mecanismo utilizado para controlar espera, distribuição e concorrência de trabalhos.

### 6.4 Workflow

Coordenação de múltiplas etapas, estados, esperas e decisões ao longo do tempo.

### 6.5 Schedule

Regra que dispara uma execução em determinado instante ou recorrência.

### 6.6 Durable Execution

Modelo no qual o progresso de uma execução é persistido e pode ser retomado após falhas ou interrupções.

### 6.7 Step

Unidade identificada e recuperável de trabalho dentro de um workflow.

### 6.8 Retry

Nova tentativa de executar trabalho que falhou de maneira transitória.

### 6.9 Dead Letter

Execução ou mensagem que esgotou as tentativas automáticas e exige tratamento posterior.

### 6.10 Transactional Outbox

Padrão que persiste a intenção de publicar um evento na mesma transação do estado canônico alterado.

---

## 7. Princípio central

Trabalho assíncrono não elimina as garantias exigidas pelo domínio.

```text
caso de uso
→ alteração canônica
→ evento ou comando assíncrono
→ workflow durável
→ efeitos externos
```

O workflow coordena efeitos.

O PostgreSQL preserva a verdade canônica.

---

## 8. Separação conceitual

O RouteBook deverá distinguir:

```text
request síncrono
≠
evento
≠
job
≠
queue
≠
workflow
≠
schedule
≠
Tool Call
```

Esses conceitos poderão participar do mesmo processo, mas não serão tratados como equivalentes.

---

## 9. Opções consideradas

### 9.1 Opção A — Execução síncrona em requests

Executar todas as operações diretamente em Route Handlers ou Server Functions.

#### Benefícios

* implementação simples;
* fluxo linear;
* menor quantidade de infraestrutura;
* resposta imediata quando a operação é curta.

#### Limitações

* timeout;
* baixa tolerância a falhas;
* request bloqueado;
* retries difíceis;
* risco de efeitos duplicados;
* inadequado para tarefas demoradas;
* incompatibilidade com esperas longas;
* experiência ruim para IA e múltiplos Providers.

#### Avaliação

Continuará adequada para operações rápidas e necessárias à resposta.

Foi rejeitada como estratégia universal.

---

### 9.2 Opção B — Fire-and-forget no processo

Iniciar uma Promise sem aguardar sua conclusão.

#### Benefícios

* implementação mínima;
* ausência de plataforma adicional;
* resposta rápida ao cliente.

#### Limitações

* execução pode ser interrompida;
* ausência de garantia;
* ausência de retry;
* ausência de observabilidade;
* perda em redeploy;
* comportamento inadequado em serverless;
* difícil teste e recuperação.

#### Avaliação

Foi rejeitada.

---

### 9.3 Opção C — PostgreSQL como fila artesanal

Criar tabelas de jobs e workers próprios.

#### Benefícios

* infraestrutura já existente;
* transações;
* integração com outbox;
* controle;
* ausência de SaaS adicional;
* portabilidade.

#### Limitações

* necessidade de implementar polling;
* retries;
* backoff;
* leases;
* concorrência;
* heartbeats;
* schedules;
* observabilidade;
* dead letters;
* manutenção operacional.

#### Avaliação

PostgreSQL será utilizado para Transactional Outbox e poderá suportar casos simples.

Não será a plataforma principal de workflows duráveis.

---

### 9.4 Opção D — BullMQ sobre Redis

Utilizar BullMQ como fila e scheduler sobre Redis.

#### Benefícios

* ecossistema Node.js;
* jobs;
* retries;
* prioridades;
* delays;
* concorrência;
* repeatable jobs;
* controle direto.

#### Limitações

* exige workers persistentes;
* exige operação do Redis como infraestrutura de fila;
* exige monitoramento próprio;
* durabilidade depende da configuração;
* workflows de múltiplas etapas exigem maior composição;
* maior responsabilidade operacional;
* menor adequação inicial ao deployment serverless.

#### Avaliação

É adequada quando houver workers dedicados e necessidade de maior controle de fila.

Foi rejeitada para o estágio inicial.

---

### 9.5 Opção E — QStash

Utilizar mensageria HTTP gerenciada para entrega, retries, schedules e filas.

#### Benefícios

* integração serverless;
* entrega HTTP;
* retries;
* schedules;
* delay;
* filas;
* dead-letter;
* baixa operação;
* integração com infraestrutura Upstash.

#### Limitações

* modelo centrado em mensagens HTTP;
* coordenação de workflows complexos exige composição adicional;
* estado de etapas precisa ser implementado ou delegado;
* menor naturalidade para espera por eventos e workflows extensos;
* APIs e semântica ligadas ao Provider.

#### Avaliação

É uma opção forte para entrega HTTP simples e jobs independentes.

Não foi selecionada como plataforma principal de workflows.

---

### 9.6 Opção F — Trigger.dev

Utilizar Trigger.dev para tasks duráveis, filas, retries, schedules e workflows.

#### Benefícios

* TypeScript;
* tasks duráveis;
* retries;
* queues;
* idempotência;
* concorrência;
* suporte a workloads longos;
* boa adequação a agentes e IA;
* runtime flexível;
* desenvolvimento local.

#### Limitações

* deployment próprio das tasks pela plataforma;
* build e runtime adicionais;
* maior separação em relação à aplicação principal;
* maior acoplamento ao modelo de tasks;
* complexidade superior à necessária para os primeiros workflows;
* necessidade de avaliar portabilidade e custos.

#### Avaliação

É a principal alternativa ao Inngest e poderá ser reavaliada para workloads que exijam runtimes especializados.

Não foi selecionada inicialmente.

---

### 9.7 Opção G — Inngest

Utilizar funções duráveis acionadas por eventos, schedules ou webhooks.

#### Benefícios

* TypeScript;
* integração com Next.js;
* execução em compute controlado pela aplicação;
* eventos tipados;
* retries;
* checkpoints por step;
* delays;
* espera por eventos;
* schedules;
* concorrência;
* throttling;
* observabilidade;
* desenvolvimento local;
* adequada a workflows de IA;
* menor operação inicial.

#### Limitações

* dependência de plataforma;
* necessidade de sincronização das funções;
* necessidade de compreender replay e checkpoints;
* payloads e histórico possuem limites;
* steps precisam de IDs estáveis;
* efeitos ainda precisam ser idempotentes;
* disponibilidade do SaaS influencia o processamento;
* self-hosting adicionaria complexidade.

#### Avaliação

Oferece o melhor equilíbrio para o RouteBook.

Foi selecionada.

---

### 9.8 Opção H — Temporal

Utilizar Temporal para Durable Execution baseada em histórico e replay.

#### Benefícios

* modelo robusto de workflows;
* event history;
* timers duráveis;
* signals;
* retries;
* Activities;
* workflows longos;
* grande capacidade de coordenação;
* forte histórico operacional.

#### Limitações

* plataforma adicional;
* workers;
* modelo determinístico;
* maior curva de aprendizado;
* operação ou serviço gerenciado;
* maior complexidade arquitetural;
* desproporcional ao estágio inicial.

#### Avaliação

É uma opção adequada para workflows críticos, longos e altamente complexos.

Foi rejeitada para o estágio inicial.

---

## 10. Decisão

O RouteBook adotará:

* **Inngest** como plataforma inicial de execução assíncrona e durável;
* **Inngest Functions** para jobs e workflows;
* **Events** para disparos assíncronos;
* **Steps** para efeitos e checkpoints;
* **Cron e delayed execution** para schedules;
* **concurrency e throttling** para proteção de recursos;
* **Transactional Outbox** quando a emissão precisar acompanhar uma transação canônica;
* **PostgreSQL** como fonte canônica do estado;
* **Redis** para idempotência temporária, rate limiting e coordenação limitada;
* **OpenTelemetry e Sentry** para correlação complementar.

---

## 11. Escopo da decisão

Esta decisão define:

* plataforma de jobs;
* modelo de funções;
* eventos;
* steps;
* retries;
* schedules;
* concorrência;
* idempotência;
* outbox;
* tratamento de falhas;
* observabilidade;
* privacidade;
* testes;
* limites de uso.

Esta decisão não define integralmente:

* todos os workflows;
* todos os eventos;
* política final de notificações;
* Provider de e-mail;
* Transactional Outbox completa;
* workflow de exclusão de dados;
* sistema de analytics;
* todos os schedules;
* self-hosting;
* estratégia final de disaster recovery do Provider.

---

## 12. Localização arquitetural

O SDK do Inngest deverá permanecer na camada de infraestrutura e composição.

Estrutura conceitual:

```text
apps/web/src/
├── app/
│   └── api/
│       └── inngest/
├── platform/
│   └── asynchronous-execution/
│       ├── inngest/
│       ├── events/
│       ├── workflows/
│       └── tests/
└── modules/
```

Módulos poderão publicar contratos e handlers internos, mas não deverão depender diretamente do SDK em seu domínio.

---

## 13. Port de execução assíncrona

Casos de uso deverão depender de abstrações internas.

Exemplo:

```typescript
interface AsynchronousJobDispatcher {
  dispatch<TPayload>(
    job: AsynchronousJob<TPayload>,
  ): Promise<DispatchResult>;
}
```

Ou, para eventos:

```typescript
interface IntegrationEventPublisher {
  publish<TPayload>(
    event: IntegrationEvent<TPayload>,
  ): Promise<void>;
}
```

---

## 14. Funções do Inngest

Cada função deverá possuir:

* ID estável;
* owner;
* trigger;
* schema de input;
* versão;
* política de retry;
* política de concorrência;
* timeout;
* idempotência;
* observabilidade;
* classificação de dados;
* tratamento de falhas.

---

## 15. Identificadores estáveis

IDs de funções e steps fazem parte do estado de execução.

Eles não deverão ser alterados apenas por preferência de nomenclatura.

Mudanças deverão avaliar:

* execuções ativas;
* histórico;
* compatibilidade;
* replay;
* deployment;
* migração.

---

## 16. Convenção de nomes

Funções poderão utilizar:

```text
<module>/<operation>
```

Exemplos:

```text
place-catalog/enrich-place
mobility/recompute-route-matrix
decision-intelligence/generate-recommendations
proposal-management/generate-itinerary-proposal
planning-assurance/reassess-planning-conflicts
data-governance/delete-account-data
```

---

## 17. Eventos

Eventos deverão representar fatos ou solicitações explícitas.

Exemplos de fatos:

```text
routebook/trip.created
routebook/activity.added
routebook/place.saved
routebook/planning-conflict.detected
routebook/itinerary-proposal.partially-accepted
```

Exemplos de solicitações:

```text
routebook/place.enrichment-requested
routebook/itinerary-proposal.generation-requested
routebook/account-data.export-requested
```

Fato e comando assíncrono não deverão ser confundidos.

---

## 18. Eventos canônicos

Eventos deverão preservar a terminologia oficial do RouteBook.

Exemplos:

* `PlanningConflictDetected`;
* `ItineraryProposalPartiallyAccepted`;
* `RecommendationGenerated`;
* `ActivityAdded`.

Não deverão ser introduzidos nomes genéricos que contradigam o domínio.

---

## 19. Schemas de eventos

Todo evento deverá possuir schema Zod versionado.

Envelope conceitual:

```typescript
const integrationEventSchema = z.object({
  eventId: z.string().min(1),
  eventType: z.string().min(1),
  eventVersion: z.string().min(1),
  occurredAt: z.iso.datetime(),
  correlationId: z.string().min(1),
  causationId: z.string().optional(),
  accountId: z.string().min(1),
  payload: z.unknown(),
});
```

O payload deverá ser validado pelo schema correspondente.

---

## 20. Conteúdo dos eventos

Eventos deverão conter o mínimo necessário.

Eles deverão preferir:

* identificadores;
* versões;
* reason codes;
* timestamps;
* referências;
* atributos estáveis.

Eles não deverão transportar automaticamente:

* entidades completas;
* prompts;
* respostas de Providers;
* coordenadas precisas;
* notas pessoais;
* tokens;
* secrets;
* arquivos.

---

## 21. Account

Todo job relacionado a dados privados deverá possuir `accountId` explícito ou contexto equivalente e verificável.

O worker deverá revalidar:

* Account;
* estado;
* autorização técnica;
* recurso;
* ownership.

O fato de um evento possuir `accountId` não torna seu payload automaticamente confiável.

---

## 22. Actor e subject

Operações iniciadas por usuários ou agentes deverão preservar:

* actorType;
* subjectType;
* userId protegido ou referência interna;
* agentId quando aplicável;
* capabilityId;
* correlationId;
* causationId.

A execução assíncrona não deverá perder a Provenance da ação.

---

## 23. Steps

Todo efeito externo ou operação não determinística deverá ocorrer dentro de uma etapa identificada.

Exemplos:

* consultar Provider;
* chamar modelo;
* gravar banco;
* enviar evento;
* aguardar;
* enviar notificação;
* criar arquivo.

Código fora de steps deverá permanecer predominantemente determinístico e de coordenação.

---

## 24. Granularidade dos steps

Um step deverá representar uma unidade que possa:

* ser repetida independentemente;
* possuir política de retry;
* produzir resultado delimitado;
* ser observada;
* ser testada;
* possuir efeito idempotente.

Steps excessivamente grandes reduzem recuperação.

Steps excessivamente pequenos aumentam complexidade e custo.

---

## 25. Steps e transações

Um step não deverá ser tratado como transação distribuída.

Ele poderá possuir uma transação local no PostgreSQL.

Exemplo:

```text
step.run
→ abrir transação PostgreSQL
→ validar estado
→ gravar alteração
→ gravar outbox
→ commit
```

---

## 26. Retries

Retries deverão ser configurados de acordo com a falha.

Falhas retryable:

* timeout;
* rede;
* rate limit temporário;
* indisponibilidade transitória;
* erro 5xx elegível;
* deadlock;
* conexão interrompida.

Falhas não retryable:

* schema inválido;
* autorização negada;
* recurso inexistente definitivo;
* configuração ausente;
* operação incompatível;
* Provider rejeitando credencial;
* regra de domínio inválida.

---

## 27. Classificação de erros

Erros deverão possuir classificação estável.

Exemplo:

```typescript
interface JobExecutionError {
  code: string;
  category: string;
  retryable: boolean;
  provider?: string;
  cause?: unknown;
}
```

Mensagens livres não deverão determinar sozinhas se uma falha será repetida.

---

## 28. Backoff

Retries deverão utilizar backoff compatível com a operação.

A política deverá considerar:

* limite;
* atraso inicial;
* atraso máximo;
* jitter;
* Provider;
* custo;
* rate limit;
* urgência.

---

## 29. Idempotência

Toda etapa com efeito deverá ser idempotente ou possuir proteção equivalente.

Casos:

* criar Recommendation;
* aplicar Itinerary Proposal;
* salvar Place;
* enviar notificação;
* registrar uso de Provider;
* executar Tool mutável;
* atualizar status.

---

## 30. Idempotency keys

Chaves poderão ser derivadas de:

* eventId;
* operation;
* Account;
* resourceId;
* version;
* capabilityId.

Exemplo conceitual:

```text
itinerary-proposal.generate:
<account>:
<trip>:
<context-version>
```

---

## 31. Idempotência no PostgreSQL

Para efeitos canônicos, deverão ser utilizados:

* unique constraints;
* registros de processamento;
* optimistic concurrency;
* versões;
* Transactional Outbox;
* estados explícitos.

O estado de execução da plataforma não será a única proteção.

---

## 32. Redis e idempotência

Redis poderá apoiar:

* supressão temporária;
* debounce;
* concorrência;
* deduplicação.

Ele não substituirá proteção durável quando a repetição puder causar efeito canônico incorreto.

---

## 33. Entrega

A aplicação deverá assumir semântica de entrega compatível com repetição.

Não deverá assumir execução exatamente uma vez.

```text
at-least-once
+
idempotência
→ efeito lógico único
```

---

## 34. Transactional Outbox

Quando uma alteração canônica precisar necessariamente gerar processamento posterior, deverá ser utilizada uma outbox.

Exemplo:

```text
transação
├── atualizar Trip
└── inserir OutboxMessage
```

Após o commit:

```text
OutboxMessage
→ publicação
→ Inngest Event
→ workflow
```

---

## 35. Motivo da outbox

Sem outbox, existe uma janela de falha:

```text
banco atualizado
→ processo interrompido
→ evento não publicado
```

A outbox reduz esse risco ao registrar alteração e intenção de publicação na mesma transação.

---

## 36. Outbox publisher

O publisher deverá:

* buscar mensagens pendentes;
* publicar;
* registrar resultado;
* utilizar idempotência;
* repetir falhas transitórias;
* limitar lotes;
* possuir observabilidade;
* evitar publicação infinita.

---

## 37. Inbox

Consumidores críticos poderão utilizar inbox ou registro de processamento para impedir efeitos duplicados.

Campos possíveis:

```text
messageId
consumerId
receivedAt
processedAt
result
```

---

## 38. Concorrência

Funções deverão definir limites quando houver risco de:

* sobrecarga de Provider;
* custo;
* race condition;
* saturação de banco;
* múltiplas propostas para a mesma Trip;
* processamento simultâneo do mesmo recurso.

---

## 39. Concorrência por Account

Capacidades caras poderão possuir concorrência por Account.

Isso impede que uma Account consuma toda a capacidade disponível.

---

## 40. Concorrência por recurso

Operações que modificam um recurso poderão limitar concorrência por:

* Trip;
* ItineraryProposal;
* PlanningConflict;
* Place;
* exportação.

A proteção canônica continuará no PostgreSQL.

---

## 41. Throttling

Throttling será utilizado para distribuir chamadas ao longo do tempo.

Casos:

* Google Maps Platform;
* Providers de IA;
* e-mail;
* enriquecimento de Places;
* processamento em lote.

Rate limiting e throttling possuem objetivos relacionados, mas não idênticos.

---

## 42. Debounce

Debounce poderá ser utilizado quando várias mudanças rápidas tornarem execuções anteriores obsoletas.

Exemplos:

* recalcular Planning Conflicts após múltiplas alterações;
* regenerar Recommendation depois de mudanças sucessivas;
* atualizar Route Matrix;
* reindexar contexto.

---

## 43. Prioridades

Prioridades poderão distinguir:

* interação do usuário;
* processamento operacional;
* manutenção;
* backfill;
* evaluation;
* limpeza.

Prioridade não deverá substituir limites de custo ou concorrência.

---

## 44. Schedules

Schedules deverão possuir:

* scheduleId;
* owner;
* timezone;
* expressão;
* finalidade;
* função;
* política de overlap;
* observabilidade;
* runbook;
* mecanismo de desativação.

---

## 45. Timezone

Schedules não deverão assumir UTC silenciosamente quando a semântica pertencer ao destino ou ao usuário.

Exemplos:

* lembrete da Trip;
* atualização diária;
* expiração local;
* operação administrativa.

A conversão deverá ser explícita.

---

## 46. Overlap

Cada schedule deverá definir comportamento quando uma execução anterior ainda estiver ativa:

* permitir;
* limitar;
* ignorar;
* cancelar anterior;
* substituir;
* enfileirar.

---

## 47. Delayed execution

Execução futura deverá ser utilizada para:

* expiração;
* lembrete;
* revalidação;
* retry de negócio;
* follow-up;
* espera por janela.

Ela não deverá ser implementada com timers em memória.

---

## 48. Espera por evento

Workflows poderão aguardar eventos quando houver correlação clara.

Exemplos:

* aguardar confirmação humana;
* aguardar conclusão de enriquecimento;
* aguardar sinal de cancelamento;
* aguardar nova versão de contexto.

Toda espera deverá possuir timeout ou política explícita.

---

## 49. Human-in-the-loop

Workflows de IA poderão pausar para revisão humana.

Exemplo:

```text
gerar Itinerary Proposal
→ validar
→ disponibilizar para revisão
→ aguardar decisão
→ aceitar, aceitar parcialmente ou rejeitar
```

A ação humana continuará ocorrendo por caso de uso autorizado.

---

## 50. Cancelamento

Workflows deverão poder reconhecer cancelamento quando:

* Trip for excluída;
* Account for encerrada;
* proposta for superseded;
* usuário cancelar;
* capability for desabilitada;
* Provider estiver bloqueado.

Efeitos já concluídos deverão possuir compensação quando necessária.

---

## 51. Compensação

Workflows não deverão simular transação distribuída.

Quando uma etapa posterior falhar, poderá ser necessário:

* reverter estado derivado;
* invalidar proposta;
* marcar processamento como falho;
* remover artefato;
* enviar novo comando;
* solicitar revisão humana.

---

## 52. Saga

Sagas poderão ser utilizadas para processos com múltiplos efeitos e compensações.

Elas deverão possuir:

* estado;
* etapas;
* compensações;
* idempotência;
* timeout;
* observabilidade;
* resultado terminal.

Não deverão ser introduzidas para processos simples.

---

## 53. Estados de execução

Estados internos poderão incluir:

* queued;
* running;
* waiting;
* completed;
* failed;
* cancelled;
* expired.

Estados de plataforma não deverão substituir estados canônicos do domínio.

---

## 54. Estado visível ao usuário

Quando o progresso for relevante, o RouteBook deverá persistir uma projeção própria.

Exemplo:

```text
ItineraryProposalGeneration
├── requested
├── processing
├── ready
├── failed
└── cancelled
```

A interface não deverá depender diretamente do painel do Inngest.

---

## 55. Resultados grandes

Resultados grandes não deverão permanecer apenas no histórico do workflow.

Eles deverão ser armazenados em local apropriado:

* PostgreSQL;
* object storage;
* cache permitido;
* artefato versionado.

O workflow deverá transportar referências.

---

## 56. Providers geoespaciais

Jobs poderão executar:

* enriquecimento de Place;
* atualização de detalhes;
* cálculo de rotas;
* Route Matrix;
* reconciliação;
* verificação de freshness.

Deverão respeitar:

* quotas;
* cache;
* termos;
* field masks;
* concorrência;
* custos;
* Provenance.

---

## 57. Inteligência artificial

Workflows poderão coordenar:

* Context Builder;
* chamada ao modelo;
* Tool Calls;
* Structured Output;
* validação;
* policy;
* persistência da proposta;
* evaluation;
* fallback.

---

## 58. Workflow de Itinerary Proposal

Fluxo conceitual:

```text
generation requested
→ carregar contexto autorizado
→ validar freshness
→ construir contexto
→ executar modelo
→ executar Tools autorizadas
→ validar Structured Output
→ executar policies
→ persistir Itinerary Proposal
→ notificar disponibilidade
```

---

## 59. Workflow de Recommendations

Fluxo conceitual:

```text
recommendation requested
→ selecionar candidatos
→ consultar dados necessários
→ calcular mobilidade
→ aplicar preferências
→ executar capacidade de IA quando necessária
→ validar
→ persistir Recommendation
```

---

## 60. Planning Assurance

Mudanças em Activities poderão disparar reavaliação assíncrona.

O workflow deverá:

* utilizar versão da Trip;
* detectar se o contexto mudou;
* evitar aplicar resultado obsoleto;
* invalidar conflitos superseded;
* persistir novos resultados de forma idempotente.

---

## 61. Stale workflows

Antes de aplicar resultados, o workflow deverá verificar:

* versão do recurso;
* estado atual;
* Account ativa;
* cancelamento;
* supersessão;
* validade do contexto.

Resultado calculado sobre versão antiga não deverá sobrescrever estado novo.

---

## 62. Optimistic concurrency

Persistências deverão utilizar versão ou condição equivalente.

Exemplo:

```text
UPDATE
WHERE id = ?
AND version = expectedVersion
```

Uma falha de versão deverá produzir reavaliação ou encerramento controlado.

---

## 63. Tools

Tools executadas em workflows deverão preservar:

* Account;
* actor;
* subject;
* capabilityId;
* agentId;
* autorização;
* idempotência;
* timeout;
* Provenance;
* observabilidade.

---

## 64. Tools mutáveis

Uma Tool mutável deverá possuir:

* caso de uso explícito;
* schema;
* autorização;
* confirmação quando necessária;
* idempotency key;
* audit trail;
* limite;
* resposta validada.

---

## 65. Segurança

Endpoints do Inngest deverão validar a autenticidade das chamadas segundo o mecanismo aprovado.

Não deverão aceitar invocações arbitrárias como se fossem internas.

---

## 66. Secrets

Secrets deverão:

* permanecer fora de eventos;
* permanecer fora de logs;
* ser separados por ambiente;
* ser rotacionáveis;
* possuir menor privilégio;
* ser acessados apenas pelas etapas necessárias.

---

## 67. Dados pessoais

Payloads deverão minimizar:

* e-mail;
* telefone;
* nome;
* endereço;
* localização;
* preferências pessoais;
* notas;
* conteúdo de viagem.

Identificadores deverão ser preferidos quando o worker puder carregar os dados autorizados no momento da execução.

---

## 68. Localização

Localização precisa não deverá ser incluída em eventos sem necessidade.

Quando necessária para cálculo, deverá ser:

* minimizada;
* protegida;
* não registrada em logs;
* excluída do histórico quando possível;
* substituída por referência canônica quando viável.

---

## 69. Prompts e outputs

Prompts e outputs integrais não deverão ser enviados como eventos ou atributos de observabilidade por padrão.

O workflow deverá registrar:

* promptVersion;
* schemaVersion;
* capabilityId;
* modelFamily;
* resultado;
* referência ao artefato autorizado.

---

## 70. Retenção

A retenção da plataforma deverá ser considerada ao definir payloads.

O RouteBook não deverá enviar dados que não possam permanecer durante o período operacional configurado.

---

## 71. Direito de exclusão

Quando uma Account for excluída, workflows e eventos relacionados deverão ser avaliados quanto a:

* cancelamento;
* retenção;
* referências;
* artefatos;
* logs;
* dados no Provider;
* histórico operacional.

---

## 72. Observabilidade

Toda execução deverá possuir:

* functionId;
* runId;
* eventId;
* correlationId;
* Account protegida;
* result;
* duration;
* retryCount;
* step;
* errorCode;
* deployment version.

---

## 73. OpenTelemetry

Spans internos deverão ser correlacionados, quando possível, com:

* request de origem;
* evento;
* workflow;
* step;
* Provider;
* banco;
* Tool;
* capability.

---

## 74. Sentry

Erros inesperados deverão ser reportados com contexto sanitizado.

Erros conhecidos e não retryable deverão possuir classificação e não gerar ruído excessivo.

---

## 75. Métricas

Métricas iniciais:

* jobs dispatched;
* jobs completed;
* jobs failed;
* retries;
* duration;
* queue delay;
* step duration;
* cancellations;
* timeouts;
* stale results rejected;
* Provider calls;
* AI cost;
* concurrency saturation.

---

## 76. Custos

Custos deverão considerar:

* executions;
* steps;
* duração;
* events;
* retenção;
* Providers;
* IA;
* banco;
* egress.

O workflow não deverá gerar steps sem benefício operacional.

---

## 77. Alertas

Alertas poderão cobrir:

* aumento de falhas;
* execução parada;
* retry excessivo;
* schedule não executado;
* backlog;
* Provider degradado;
* custo elevado;
* stale result;
* outbox acumulada;
* dead letters;
* falha de autenticação da plataforma.

---

## 78. Dead letters

Falhas permanentes deverão possuir fila, estado ou visão operacional equivalente para:

* inspeção;
* classificação;
* retry manual;
* cancelamento;
* correção;
* auditoria operacional.

A recuperação manual deverá respeitar idempotência.

---

## 79. Replay

Replay ou nova execução deverá considerar:

* estado atual;
* versão da função;
* efeitos já realizados;
* idempotência;
* dados excluídos;
* contratos;
* Provider;
* custo.

Não deverá ser utilizado indiscriminadamente em workflows mutáveis.

---

## 80. Versionamento de funções

Mudanças deverão ser classificadas como:

* compatíveis com execuções ativas;
* incompatíveis;
* nova função;
* nova versão de evento;
* alteração de step.

Mudanças incompatíveis deverão preservar a conclusão segura de execuções antigas ou possuir plano de cancelamento.

---

## 81. Deployments

O deployment deverá:

* sincronizar funções;
* associar versão;
* validar schemas;
* manter compatibilidade;
* não remover função ativa sem análise;
* permitir rollback.

---

## 82. Desenvolvimento local

O ambiente local deverá permitir:

* servidor de desenvolvimento da plataforma;
* execução de funções;
* inspeção de eventos;
* retry;
* schedules simulados;
* fixtures;
* Providers fake;
* PostgreSQL e Redis locais.

---

## 83. Testes unitários

Deverão cobrir:

* handlers internos;
* classificação de erros;
* idempotency keys;
* schemas;
* decisions;
* stale checks;
* compensações;
* mappings.

Não deverão depender da plataforma real.

---

## 84. Testes de steps

Cada step deverá ser testável como função ou caso de uso independente.

Deverão ser testados:

* sucesso;
* erro retryable;
* erro permanente;
* timeout;
* estado obsoleto;
* idempotência;
* autorização;
* Provider inválido.

---

## 85. Testes de integração

Deverão validar:

* dispatch;
* event schema;
* execução;
* step;
* retry;
* delay;
* concorrência;
* cancelamento;
* outbox;
* observabilidade.

---

## 86. Testes end-to-end

Jornadas poderão validar:

* solicitar geração;
* responder imediatamente;
* acompanhar status;
* concluir workflow;
* exibir resultado;
* repetir request sem duplicação;
* falhar e recuperar;
* cancelar;
* rejeitar resultado stale.

---

## 87. Testes de outbox

Deverão validar:

* alteração e outbox na mesma transação;
* falha antes do commit;
* falha depois do commit;
* publicação repetida;
* consumer idempotente;
* acumulação;
* recuperação.

---

## 88. Testes de concorrência

Casos:

* duas gerações para a mesma Trip;
* múltiplos eventos iguais;
* mesma Itinerary Proposal aplicada duas vezes;
* mudança de Trip durante geração;
* Account excluída durante execução;
* Provider lento;
* limite global atingido.

---

## 89. Testes de privacidade

Deverão comprovar ausência de:

* secrets;
* tokens;
* cookies;
* prompts integrais;
* outputs integrais;
* endereço;
* coordenada precisa;
* notas pessoais;
* dados cross-account.

---

## 90. CI/CD

O pipeline deverá:

* validar funções;
* validar eventos;
* executar testes;
* verificar versões;
* sincronizar ambiente correto;
* proteger signing keys;
* associar release;
* executar smoke test.

---

## 91. Pull requests

Pull requests não deverão:

* receber secrets de produção;
* executar Providers pagos sem necessidade;
* disparar workflows reais de produção;
* acessar dados reais;
* utilizar eventos de produção.

---

## 92. Ambientes

Cada ambiente deverá possuir:

* app ou environment próprio;
* signing keys;
* event keys;
* funções sincronizadas;
* limites;
* dados;
* observabilidade;
* retenção.

---

## 93. Preview environments

Previews deverão utilizar:

* ambiente isolado;
* funções limitadas;
* Providers fake quando viável;
* schedules desabilitados por padrão;
* retenção curta;
* custos limitados.

---

## 94. Schedules em preview

Schedules não deverão ser criados automaticamente em toda preview sem necessidade.

Isso evita:

* execuções órfãs;
* custos;
* efeitos duplicados;
* dados temporários persistentes.

---

## 95. Agentes de IA

Agentes poderão apoiar:

* criação de funções;
* steps;
* schemas;
* testes;
* observabilidade;
* runbooks;
* análise de falhas.

---

## 96. Limites para agentes

Agentes não poderão autonomamente:

* criar schedule de produção;
* ampliar retry;
* aumentar concorrência;
* remover idempotência;
* alterar evento publicado;
* remover validação;
* enviar dados pessoais;
* adicionar prompt ao payload;
* executar replay mutável;
* remover stale check;
* alterar assinatura;
* aplicar workflow em produção;
* remover outbox;
* transformar fila em fonte canônica.

---

## 97. Revisão de workflows

Toda mudança deverá avaliar:

* trigger;
* schema;
* função;
* steps;
* IDs;
* retries;
* idempotência;
* concorrência;
* timeout;
* privacidade;
* custo;
* observabilidade;
* compensação;
* versionamento;
* testes.

---

## 98. Consequências positivas

A decisão proporciona:

* execução fora do request;
* retries;
* checkpoints;
* schedules;
* esperas;
* workflows de múltiplas etapas;
* observabilidade;
* integração com TypeScript;
* integração com Next.js;
* menor carga operacional;
* suporte a IA;
* controle de concorrência;
* recuperação de falhas.

---

## 99. Consequências negativas

A decisão introduz:

* dependência do Inngest;
* novo modelo de execução;
* necessidade de versionar functions e steps;
* necessidade de idempotência;
* necessidade de outbox;
* custo de plataforma;
* retenção de eventos;
* necessidade de sincronização;
* risco de payload excessivo;
* risco de lock-in;
* necessidade de testes adicionais.

---

## 100. Riscos

### 100.1 Evento perdido após commit

Mitigações:

* Transactional Outbox;
* publisher idempotente;
* monitoramento.

### 100.2 Efeito duplicado

Mitigações:

* idempotência;
* constraints;
* inbox;
* eventId;
* versionamento.

### 100.3 Workflow obsoleto

Mitigações:

* resource version;
* stale check;
* cancelamento;
* optimistic concurrency.

### 100.4 Retry de erro permanente

Mitigações:

* classificação de erro;
* non-retryable errors;
* testes;
* limites.

### 100.5 Sobrecarga de Provider

Mitigações:

* concorrência;
* throttling;
* rate limiting;
* cache;
* quotas.

### 100.6 Vazamento de dados

Mitigações:

* payload mínimo;
* schemas;
* redaction;
* referências;
* retenção.

### 100.7 Lock-in

Mitigações:

* ports;
* handlers internos;
* eventos próprios;
* ausência de SDK no domínio;
* outbox;
* estratégia de saída.

### 100.8 Custo inesperado

Mitigações:

* budgets;
* limites de steps;
* métricas;
* prioridades;
* schedules governados.

### 100.9 Falha do Provider de workflows

Mitigações:

* outbox;
* reprocessamento;
* estado canônico;
* alertas;
* fallback síncrono somente quando seguro.

### 100.10 Mudança incompatível de step

Mitigações:

* IDs estáveis;
* versionamento;
* revisão;
* rollout progressivo.

---

## 101. Controles

Deverão ser implementados:

* Inngest;
* functions com IDs estáveis;
* events versionados;
* schemas Zod;
* steps;
* retries controlados;
* idempotência;
* Transactional Outbox;
* concorrência;
* throttling;
* timeouts;
* stale checks;
* observabilidade;
* redaction;
* ambientes isolados;
* testes de integração;
* budgets;
* runbooks.

---

## 102. Estratégia de implementação

### Etapa 1 — Fundação

* adicionar SDK;
* fixar versão;
* criar client;
* criar endpoint;
* configurar ambiente;
* configurar signing key;
* integrar observabilidade.

### Etapa 2 — Contratos

* criar envelope de eventos;
* criar schemas;
* criar publisher port;
* criar convenções;
* criar error taxonomy.

### Etapa 3 — Primeiro job

* selecionar tarefa reconstruível;
* criar função;
* criar step;
* configurar retry;
* configurar idempotência;
* testar localmente.

### Etapa 4 — Outbox

* criar tabela;
* criar publisher;
* criar status;
* criar retry;
* criar observabilidade;
* testar falhas.

### Etapa 5 — Place Catalog

* criar workflow de enriquecimento;
* aplicar concorrência;
* aplicar quotas;
* persistir Provenance;
* tratar stale data.

### Etapa 6 — IA

* criar workflow de Itinerary Proposal;
* separar steps;
* validar Structured Output;
* aplicar policies;
* persistir proposta;
* notificar conclusão.

### Etapa 7 — Schedules

* criar schedule operacional simples;
* definir timezone;
* impedir overlap;
* criar runbook;
* validar ambiente.

### Etapa 8 — Operação

* dashboards;
* alertas;
* dead-letter handling;
* replay controlado;
* budgets;
* documentação.

---

## 103. Primeiro caso de uso recomendado

O primeiro workflow deverá ser pequeno, assíncrono e reconstruível.

Candidato:

```text
PlaceEnrichmentRequested
→ carregar Place
→ consultar detalhes permitidos
→ validar resposta
→ mapear categorias
→ persistir enrichment e Provenance
```

Esse caso permite validar:

* eventos;
* steps;
* retries;
* Provider;
* idempotência;
* stale checks;
* observabilidade;
* custo.

---

## 104. Critérios de implementação concluída

A decisão estará implementada quando:

* Inngest estiver configurado;
* ambientes estiverem separados;
* endpoint estiver protegido;
* primeiro evento estiver versionado;
* primeira função estiver ativa;
* primeiro step estiver implementado;
* retry estiver testado;
* idempotência estiver testada;
* concorrência estiver configurada;
* outbox estiver funcional para caso crítico;
* observabilidade estiver ativa;
* falha permanente puder ser inspecionada;
* payloads estiverem sanitizados;
* pipeline validar as funções.

---

## 105. Verificação

A verificação deverá incluir:

* dispatch;
* validação de evento;
* execução;
* step;
* checkpoint;
* retry;
* erro permanente;
* timeout;
* delay;
* schedule;
* concorrência;
* throttling;
* idempotência;
* outbox;
* duplicação;
* stale result;
* cancelamento;
* observabilidade;
* privacidade;
* rollback de deployment.

---

## 106. Métricas de adoção

Poderão ser acompanhadas:

* functions;
* events;
* runs;
* success rate;
* failures;
* retries;
* queue delay;
* duration;
* stale results;
* duplicate events;
* outbox backlog;
* dead letters;
* Provider cost;
* AI cost;
* schedules;
* cancellations;
* runs sem owner;
* steps sem idempotência.

---

## 107. Gatilhos de revisão

A decisão deverá ser revisada quando:

* o custo se tornar desproporcional;
* a plataforma limitar workflows essenciais;
* requisitos de self-hosting surgirem;
* retenção for incompatível com privacidade;
* runtime especializado for necessário;
* throughput exigir workers dedicados;
* BullMQ se tornar mais adequado;
* Temporal se tornar justificável;
* QStash atender melhor a uma capacidade isolada;
* lock-in impedir evolução;
* requisitos regulatórios limitarem o SaaS;
* falhas operacionais forem recorrentes.

---

## 108. Estratégia de rollback

A substituição da plataforma deverá preservar:

* eventos;
* schemas;
* handlers internos;
* idempotency keys;
* outbox;
* estados canônicos;
* jobs pendentes;
* schedules;
* observabilidade;
* runbooks.

Execuções ativas deverão ser:

* concluídas;
* canceladas;
* ou migradas por processo explícito.

---

## 109. Estratégia de saída

O RouteBook deverá conseguir:

* trocar o dispatcher;
* republicar outbox em outra plataforma;
* mover handlers para workers;
* manter contratos de eventos;
* preservar PostgreSQL;
* preservar idempotência;
* reconstruir caches;
* recriar schedules;
* manter módulos independentes do SDK.

---

## 110. Alternativas futuras permitidas

Esta decisão não impede:

* execução síncrona;
* QStash para entrega HTTP específica;
* BullMQ para workers dedicados;
* PostgreSQL para jobs simples;
* Temporal para workflows críticos;
* Trigger.dev para runtimes especializados;
* filas gerenciadas;
* cron da infraestrutura.

Cada adoção deverá possuir escopo e garantias explícitos.

---

## 111. Decisões derivadas

Deverão ser avaliadas decisões sobre:

* Transactional Outbox;
* catálogo de eventos;
* notificações;
* Provider de e-mail;
* exportação e exclusão de dados;
* evaluation workflows;
* object storage;
* workflow de Itinerary Proposal;
* backfills;
* policy de dead letters;
* disaster recovery;
* scheduler operacional.

---

## 112. Próxima decisão

O `RB-ADR-016` deverá definir a estratégia de armazenamento de objetos e arquivos.

A decisão deverá avaliar:

* Amazon S3;
* Cloudflare R2;
* Vercel Blob;
* storage do Provider de deployment;
* uploads;
* imagens;
* exports;
* artefatos de IA;
* URLs assinadas;
* malware scanning;
* retenção;
* privacidade;
* CDN;
* custos;
* portabilidade.

A decisão deverá distinguir:

* arquivo canônico;
* imagem externa;
* referência de Provider;
* cache;
* artefato temporário;
* exportação;
* anexo;
* dado estruturado.

---

## 113. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-015
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar o contexto histórico.

---

## 114. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* Inngest está justificado;
* Trigger.dev foi avaliado;
* QStash foi avaliado;
* BullMQ foi avaliado;
* Temporal foi avaliado;
* PostgreSQL foi avaliado;
* evento está diferenciado de job;
* job está diferenciado de workflow;
* schedule está diferenciado de evento;
* funções estão definidas;
* steps estão definidos;
* IDs estáveis estão definidos;
* schemas estão definidos;
* retries estão governados;
* erros permanentes estão definidos;
* idempotência está definida;
* entrega está definida;
* outbox está definida;
* inbox está contemplada;
* concorrência está definida;
* throttling está definido;
* debounce está contemplado;
* schedules estão definidos;
* timezone está definido;
* espera por evento está contemplada;
* human-in-the-loop está contemplado;
* cancelamento está definido;
* compensação está definida;
* stale workflows estão tratados;
* Providers estão contemplados;
* IA está contemplada;
* Tools estão contempladas;
* segurança está definida;
* privacidade está definida;
* observabilidade está definida;
* testes estão definidos;
* ambientes estão definidos;
* agentes estão contemplados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* estratégia de saída está definida;
* supersessão está definida;
* não existem contradições com RB-ADR-005;
* não existem contradições com RB-ADR-008;
* não existem contradições com RB-ADR-009;
* não existem contradições com RB-ADR-010;
* não existem contradições com RB-ADR-012;
* não existem contradições com RB-ADR-013;
* não existem contradições com RB-ADR-014.

---

## 115. Declaração final

O RouteBook adotará Inngest como plataforma inicial para jobs assíncronos e workflows duráveis.

Inngest será utilizado para:

* jobs em background;
* processamento baseado em eventos;
* schedules;
* delays;
* espera por eventos;
* retries;
* checkpoints;
* controle de concorrência;
* workflows de múltiplas etapas.

PostgreSQL continuará sendo a fonte canônica do domínio.

Redis continuará responsável por:

* cache;
* rate limiting;
* idempotência temporária;
* coordenação limitada.

Transactional Outbox será utilizada quando uma alteração canônica e a intenção de processamento posterior precisarem ser atomicamente ligadas.

Toda função deverá possuir:

* ID estável;
* owner;
* trigger;
* schema;
* versão;
* política de retry;
* idempotência;
* concorrência;
* timeout;
* observabilidade;
* tratamento de dados.

Toda etapa com efeitos deverá ser idempotente ou possuir proteção canônica equivalente.

O RouteBook não assumirá execução exatamente uma vez.

A confiabilidade será obtida pela combinação de:

* Durable Execution;
* checkpoints;
* retries;
* idempotência;
* constraints;
* optimistic concurrency;
* outbox;
* observabilidade.

A integração com o Inngest permanecerá confinada à infraestrutura e à composição da aplicação, permitindo que módulos, domínio, casos de uso e contratos continuem independentes da plataforma escolhida.
