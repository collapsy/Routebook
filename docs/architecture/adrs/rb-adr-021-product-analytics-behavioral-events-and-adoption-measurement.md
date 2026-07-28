---

id: RB-ADR-021

title: Estratégia de Product Analytics, Eventos Comportamentais e Medição de Adoção
description: Define a estratégia oficial do RouteBook para instrumentação de product analytics, taxonomia de eventos comportamentais, identidade analítica, consentimento, privacidade, funis, retenção, adoção de funcionalidades e integração controlada com feature flags.

document_type: architecture-decision-record
owner: Architecture

status: Published
version: "0.1.0"

created: "2026-07-27"
last_updated: null

authors:

- RouteBook Team

tags:

- architecture
- adr
- product-analytics
- behavioral-events
- adoption
- funnels
- retention
- privacy
- consent
- posthog
- decision-intelligence
- ai-first

related_documents:

- RB-CORE-0004
- RB-DOM-001
- RB-DOM-004
- RB-ADR-008
- RB-ADR-009
- RB-ADR-013
- RB-ADR-014
- RB-ADR-015
- RB-ADR-017
- RB-ADR-018
- RB-ADR-019
- RB-ADR-020

prerequisites:

- RB-CORE-0004
- RB-DOM-001
- RB-ADR-009
- RB-ADR-013
- RB-ADR-014
- RB-ADR-020

next_documents: []

ai_context:
  priority: high
  index: true

---

# RB-ADR-021 — Estratégia de Product Analytics, Eventos Comportamentais e Medição de Adoção

## 1. Status

**Draft**

---

## 2. Contexto

O RouteBook precisa compreender se suas capacidades realmente ajudam viajantes a tomar decisões melhores durante o planejamento e a execução de uma viagem.

Logs, traces, métricas de infraestrutura e erros permitem avaliar a saúde técnica do sistema, mas não respondem de forma suficiente:

* quantas Viagens chegam ao primeiro valor percebido;
* quais capacidades são descobertas e utilizadas;
* onde as jornadas são abandonadas;
* quais Recomendações são apresentadas, aceitas, rejeitadas ou ignoradas;
* se uma Proposta de Roteiro contribui para um Roteiro utilizável;
* se o usuário retorna durante o ciclo real de uma Viagem;
* se uma nova funcionalidade melhora adoção ou apenas aumenta atividade;
* se a assistência do RouteBook resulta em Decisões úteis;
* quais mudanças de produto devem ser mantidas, corrigidas ou removidas.

O RouteBook também manipula contexto de viagem potencialmente sensível, incluindo:

* destinos;
* datas;
* Hospedagem;
* localização;
* Preferências;
* Restrições;
* composição do grupo;
* orçamento;
* decisões;
* histórico de uso.

Uma instrumentação ampla, automática ou sem governança poderá transformar product analytics em uma cópia paralela e indevida do domínio.

Esta decisão estabelece como medir o produto sem transformar telemetria em vigilância, sem redefinir os conceitos oficiais e sem criar dependência irreversível de um fornecedor.

---

## 3. Problema

O RouteBook precisa de uma estratégia que:

1. permita analisar jornadas, funis, adoção, retenção e resultados;
2. preserve a linguagem e as invariantes do domínio;
3. diferencie eventos comportamentais de Eventos de Domínio;
4. diferencie product analytics de observabilidade, auditoria e marketing;
5. suporte eventos client-side e server-side;
6. trate consentimento e revogação;
7. minimize dados pessoais e contexto de viagem;
8. correlacione releases e variações de feature flags;
9. evite métricas de vaidade;
10. preserve portabilidade;
11. permaneça viável para o estágio inicial do produto;
12. permita evolução futura para warehouse e experimentação.

---

## 4. Forças de decisão

São forças relevantes:

* estágio inicial e orçamento controlado;
* necessidade de rápida aprendizagem de produto;
* aplicação web com operações client-side e server-side;
* arquitetura AI-First;
* existência de Account, User, Trip, Recommendation e Decision no domínio;
* natureza episódica de viagens;
* necessidade de funis e análise de caminhos;
* necessidade futura de cohorts e retenção;
* risco elevado de coleta excessiva;
* LGPD e requisitos de privacidade aplicáveis;
* necessidade de governança antes da escala;
* compatibilidade com a estratégia de feature flags do `RB-ADR-020`;
* possibilidade de troca futura de fornecedor.

---

## 5. Objetivos

Esta decisão objetiva:

* definir fronteiras de analytics;
* selecionar a plataforma inicial;
* estabelecer um port interno;
* definir taxonomia e versionamento;
* governar identidade analítica;
* definir coleta client-side e server-side;
* estabelecer consentimento;
* proibir propriedades sensíveis;
* definir métricas de ativação, adoção, retenção e valor;
* permitir correlação com releases;
* garantir qualidade e verificabilidade;
* estabelecer uma estratégia de saída.

---

## 6. Não objetivos

Esta decisão não define integralmente:

* tracking de campanhas publicitárias;
* CRM;
* CDP empresarial;
* data warehouse definitivo;
* business intelligence financeiro;
* sistema de auditoria;
* observabilidade técnica;
* modelo jurídico final de consentimento;
* política completa de retenção de todos os dados;
* plataforma de experimentação autônoma;
* personalização automática baseada em comportamento;
* treinamento de modelos de IA com eventos comportamentais;
* venda ou compartilhamento comercial de dados.

---

## 7. Distinções obrigatórias

### 7.1 Product analytics

Product analytics mede como pessoas e Accounts utilizam o produto para compreender:

* descoberta;
* ativação;
* adoção;
* engajamento;
* retenção;
* conversão;
* sucesso de jornadas;
* resultado de capacidades.

### 7.2 Observabilidade

Observabilidade mede a saúde técnica por:

* logs;
* traces;
* métricas;
* erros;
* latência;
* disponibilidade;
* consumo;
* dependências.

### 7.3 Auditoria

Auditoria preserva evidência de ações relevantes:

* actor;
* ação;
* objeto;
* estado anterior;
* estado posterior;
* instante;
* justificativa;
* origem.

### 7.4 Eventos de Domínio

Eventos de Domínio representam fatos relevantes ocorridos no domínio e seguem os conceitos oficiais do RouteBook.

Exemplos:

* `TripCreated`;
* `PlaceSaved`;
* `RecommendationPresented`;
* `DecisionRecorded`;
* `ItineraryProposalAccepted`.

### 7.5 Eventos comportamentais

Eventos comportamentais representam interação ou progresso analítico.

Exemplos:

* `trip_creation_started`;
* `place_details_viewed`;
* `recommendation_explanation_opened`;
* `itinerary_proposal_previewed`;
* `map_layer_changed`.

### 7.6 Métricas de negócio

Métricas de negócio representam resultados organizacionais ou econômicos.

Exemplos futuros:

* receita;
* custo por Account;
* margem;
* conversão de plano;
* churn comercial.

### 7.7 Tracking de marketing

Tracking de marketing mede aquisição e campanhas.

Exemplos:

* origem;
* campanha;
* mídia;
* landing page;
* conversão publicitária.

Essas categorias poderão se relacionar, mas não deverão ser implementadas como se fossem o mesmo sistema.

---

## 8. Princípios

1. Medir perguntas, não acumular eventos.
2. Coletar o mínimo necessário.
3. Preferir eventos semânticos a cliques genéricos.
4. Resultado server-side prevalece sobre intenção client-side.
5. Analytics não é fonte canônica do domínio.
6. Analytics não substitui auditoria.
7. Analytics não substitui observabilidade.
8. Evento comportamental não concede autorização.
9. Consentimento deve ser respeitado antes da coleta não essencial.
10. Localização precisa não será enviada.
11. Texto livre não será enviado por padrão.
12. Identificadores externos legíveis não serão utilizados.
13. Uma métrica deve possuir definição, owner e finalidade.
14. Uma funcionalidade não será considerada adotada apenas porque foi exibida.
15. Retenção deverá respeitar a natureza episódica das Viagens.
16. Eventos deverão possuir schema versionado.
17. Instrumentação será testada como código de produção.
18. Agentes de IA obedecerão às mesmas políticas.

---

## 9. Alternativas avaliadas

### 9.1 Sem plataforma de product analytics

#### Benefícios de não adotar uma plataforma

* ausência de nova dependência;
* menor custo;
* menor superfície de dados.

#### Limitações de não adotar uma plataforma

* baixa capacidade de análise de funis;
* baixa capacidade de cohorts;
* dashboards manuais;
* aprendizagem lenta;
* tendência de usar logs de forma inadequada.

#### Avaliação da ausência de plataforma

Não atende às necessidades de produto.

---

### 9.2 Analytics próprio sobre PostgreSQL

#### Benefícios do analytics próprio

* controle total;
* integração com infraestrutura existente;
* liberdade de schema;
* ausência de SDK proprietário no cliente.

#### Limitações do analytics próprio

* necessidade de construir ingestão;
* custo de consultas analíticas;
* necessidade de funis, cohorts e dashboards próprios;
* disputa entre carga transacional e analítica;
* manutenção elevada;
* risco de criar data warehouse improvisado.

#### Avaliação do analytics próprio

Não foi selecionado como solução inicial.

PostgreSQL transacional não deverá se tornar o mecanismo principal de product analytics.

---

### 9.3 Amplitude

#### Benefícios do Amplitude

* plataforma especializada;
* funis;
* retenção;
* cohorts;
* governança de eventos;
* SDKs client-side e server-side;
* recursos de consentimento;
* recursos de experimentação.

#### Limitações do Amplitude

* nova dependência gerenciada;
* custo e limites sujeitos ao plano;
* maior distância da stack operacional inicial;
* risco de acoplamento a conceitos proprietários;
* necessidade de governar identidade e PII.

#### Avaliação do Amplitude

É uma alternativa futura válida, especialmente se governança analítica empresarial se tornar o principal requisito.

Não foi selecionada inicialmente.

---

### 9.4 Mixpanel

#### Benefícios do Mixpanel

* maturidade em eventos;
* funis;
* retenção;
* cohorts;
* análise de caminhos;
* SDKs;
* ferramentas de governança;
* orientações de privacidade.

#### Limitações do Mixpanel

* nova dependência;
* custo e limites sujeitos ao plano;
* necessidade de governar residência e identidade;
* recursos avançados podem depender do plano;
* risco de taxonomia guiada pelo fornecedor.

#### Avaliação do Mixpanel

Permanece alternativa futura.

Não foi selecionada inicialmente.

---

### 9.5 PostHog Cloud

#### Benefícios do PostHog Cloud

* product analytics;
* funis;
* retenção;
* caminhos;
* cohorts;
* web analytics;
* SDKs client-side e server-side;
* integração com feature flag context;
* modelo de preço baseado em uso;
* camada gratuita compatível com o estágio inicial;
* opção de região europeia;
* mecanismos de opt-in e opt-out;
* possibilidade futura de exportação e data pipelines.

#### Limitações do PostHog Cloud

* dados processados por terceiro;
* preços e limites podem mudar;
* recursos adicionais aumentam superfície e custo;
* autocapture pode gerar coleta excessiva;
* session replay eleva substancialmente o risco de privacidade;
* experimentação pode ser confundida com a estratégia canônica de flags;
* group analytics poderá depender do plano.

#### Avaliação do PostHog Cloud

Oferece o melhor equilíbrio inicial entre capacidade, velocidade, custo e portabilidade quando utilizado por meio de contratos próprios e coleta estritamente controlada.

Foi selecionado.

---

### 9.6 PostHog self-hosted

#### Benefícios do PostHog self-hosted

* controle de infraestrutura;
* possibilidade de manter dados em ambiente próprio;
* código aberto;
* menor dependência operacional do SaaS.

#### Limitações do PostHog self-hosted

* operação de ClickHouse e serviços relacionados;
* backups, upgrades e recuperação sob responsabilidade do RouteBook;
* ausência de suporte comercial na distribuição aberta;
* diferenças funcionais em relação ao Cloud;
* esforço desproporcional ao estágio inicial.

#### Avaliação do PostHog self-hosted

Não foi selecionado inicialmente.

Poderá ser reavaliado caso requisitos de soberania de dados justifiquem o custo operacional.

---

## 10. Decisão

O RouteBook adotará:

* **PostHog Cloud EU** como plataforma inicial de product analytics;
* **eventos explícitos e semânticos** como padrão;
* **autocapture desabilitado inicialmente**;
* **session replay desabilitado inicialmente**;
* **port interno e catálogo tipado** para preservar portabilidade;
* **coleta server-side** para resultados canônicos;
* **coleta client-side controlada** para interações de interface;
* **consentimento aplicado antes da coleta não essencial**;
* **identificadores internos opacos**;
* **ausência de PII e texto livre** nos eventos;
* **taxonomia versionada no repositório**;
* **PostHog como sistema analítico, nunca como fonte canônica**;
* **integração explícita com as variações avaliadas pelo OpenFeature**;
* **métricas de ativação, adoção, retenção e valor orientadas por Viagem**;
* **revisões periódicas de custo, qualidade e privacidade**.

---

## 11. Escopo da decisão

Esta decisão define:

* plataforma inicial;
* fronteiras;
* port;
* catálogo;
* naming;
* identidade;
* consentimento;
* coleta;
* propriedades;
* schemas;
* funis;
* retenção;
* adoção;
* feature flag context;
* qualidade;
* testes;
* observabilidade da pipeline;
* governança;
* estratégia de implementação;
* estratégia de saída.

---

## 12. Arquitetura conceitual

```text
Client Component
→ Analytics Client
→ Consent Gate
→ Analytics Port
→ PostHog

caso de uso
→ Evento de Domínio ou resultado da operação
→ Analytics Projector
→ Analytics Port
→ PostHog
```

O PostHog não será acessado diretamente por módulos de domínio.

---

## 13. Port interno

```typescript
interface ProductAnalytics {
  capture<TEvent extends AnalyticsEventName>(
    event: AnalyticsEvent<TEvent>,
  ): Promise<void>;

  identify(
    identity: AnalyticsIdentity,
    traits?: ApprovedAnalyticsTraits,
  ): Promise<void>;

  reset(): Promise<void>;
}
```

O contrato interno deverá:

* aceitar apenas eventos conhecidos;
* validar propriedades;
* aplicar consentimento;
* aplicar redaction;
* anexar contexto técnico permitido;
* oferecer implementação nula;
* permitir substituição de Provider.

---

## 14. Implementações do port

Deverão existir progressivamente:

* `PostHogProductAnalytics`;
* `NoopProductAnalytics`;
* `InMemoryProductAnalytics`;
* `CompositeProductAnalytics` somente quando justificado;
* `BufferedServerProductAnalytics` para captura resiliente.

---

## 15. Catálogo tipado

Eventos deverão ser declarados em catálogo versionado.

```typescript
const analyticsEvents = {
  tripCreated: defineAnalyticsEvent({
    name: "trip_created",
    version: 1,
    source: "server",
    purpose: "activation",
  }),
  placeDetailsViewed: defineAnalyticsEvent({
    name: "place_details_viewed",
    version: 1,
    source: "client",
    purpose: "discovery",
  }),
  decisionRecorded: defineAnalyticsEvent({
    name: "decision_recorded",
    version: 1,
    source: "server",
    purpose: "value",
  }),
} as const;
```

Strings livres espalhadas por componentes deverão ser proibidas.

---

## 16. Convenção de nomes

Formato:

```text
<object>_<action>
```

Regras:

* inglês técnico;
* `snake_case`;
* ação no passado quando o fato já ocorreu;
* nome estável;
* ausência de ambiente no nome;
* ausência de versão no nome;
* ausência de IDs no nome;
* ausência de detalhes de UI quando o significado for de produto.

Exemplos:

```text
trip_creation_started
trip_created
place_details_viewed
place_saved
recommendation_presented
recommendation_accepted
decision_recorded
itinerary_proposal_generated
itinerary_proposal_accepted
```

---

## 17. Nomes proibidos

Deverão ser evitados:

```text
button_clicked
modal_opened
event_1
user_action
success
error
screen_view
test_event
```

Um evento de interface poderá referenciar o elemento somente quando isso representar a pergunta analítica real.

---

## 18. Schema base

```typescript
interface AnalyticsEventEnvelope<TProperties> {
  eventId: string;
  eventName: string;
  schemaVersion: number;
  occurredAt: string;
  source: "client" | "server" | "workflow";
  environment: string;
  applicationVersion?: string;
  releaseId?: string;
  sessionKey?: string;
  anonymousKey?: string;
  userKey?: string;
  accountKey?: string;
  tripKey?: string;
  correlationKey?: string;
  properties: TProperties;
  featureVariants?: Record<string, string | boolean>;
}
```

O envelope representa transporte analítico, não entidade de domínio.

---

## 19. Propriedades globais permitidas

Poderão ser incluídas:

* ambiente;
* versão da aplicação;
* release;
* source;
* locale amplo;
* device category;
* viewport category;
* session key;
* identificadores opacos;
* versão do schema;
* variações relevantes de feature flags;
* correlation key não reversível quando necessária.

---

## 20. Propriedades proibidas

Não deverão ser enviadas:

* nome;
* e-mail;
* telefone;
* endereço;
* documento;
* credencial;
* token;
* API key;
* prompt;
* resposta completa de IA;
* nota do usuário;
* busca livre;
* nome da Hospedagem;
* endereço da Hospedagem;
* coordenada precisa;
* rota completa;
* itinerário completo;
* restrição médica;
* descrição livre de acessibilidade;
* nome de Viajante;
* dados de crianças;
* payload de Provider;
* stack trace;
* conteúdo de formulário;
* URL contendo dados sensíveis.

---

## 21. Propriedades controladas

Poderão ser enviadas somente quando aprovadas e categorizadas:

* país ou região ampla do destino;
* categoria de Lugar;
* faixa de orçamento;
* tamanho do grupo em bucket;
* duração da Viagem em bucket;
* quantidade de Itinerary Days;
* tipo de Recomendação;
* nível de confiança categórico;
* motivo de rejeição por enumeração;
* tipo de conflito;
* modo de mobilidade.

Valores deverão preferir enumerações ou buckets a dados brutos.

---

## 22. Identidade analítica

O RouteBook reconhecerá:

* `anonymousKey`;
* `sessionKey`;
* `userKey`;
* `accountKey`;
* `tripKey`.

Essas chaves deverão:

* ser opacas;
* ser estáveis no escopo necessário;
* não revelar o identificador de banco diretamente quando evitável;
* não utilizar e-mail;
* não utilizar nome;
* não utilizar identificador de Provider externo;
* possuir estratégia de rotação quando aplicável.

---

## 23. Usuário anônimo

Antes da autenticação, um identificador anônimo poderá existir somente quando:

* permitido pela política de consentimento;
* necessário para a pergunta analítica;
* armazenado conforme política;
* reinicializado quando solicitado;
* não enriquecido com PII.

Eventos cookieless poderão ser considerados futuramente, mas não serão ativados automaticamente por este ADR.

---

## 24. Identificação após autenticação

Após autenticação e consentimento aplicável:

```text
anonymousKey
→ identify(userKey)
→ vinculação controlada
→ eventos futuros associados
```

A vinculação deverá evitar:

* duplicidade;
* mistura entre usuários no mesmo dispositivo;
* associação após logout;
* exposição de PII em traits.

---

## 25. Logout e troca de Account

No logout:

* identidade deverá ser resetada;
* buffers deverão ser tratados conforme política;
* propriedades persistidas deverão ser removidas;
* uma nova identidade anônima poderá ser criada somente quando permitida.

Na troca de Account:

* `accountKey` deverá ser atualizado;
* contexto anterior não deverá vazar;
* eventos deverão permanecer atribuídos ao escopo correto.

---

## 26. Account como unidade analítica

Account poderá ser utilizada para:

* ativação de grupo;
* adoção compartilhada;
* retenção de grupo;
* consistência com rollouts por Account;
* análise futura de entitlements.

Caso recursos de group analytics não estejam disponíveis, `accountKey` poderá permanecer como propriedade opaca governada.

---

## 27. Trip como contexto analítico

Viagem é a principal unidade operacional do RouteBook.

`tripKey` poderá apoiar:

* funil de criação;
* ativação;
* planejamento;
* adoção de Recomendações;
* adoção de Propostas;
* retenção durante o ciclo da Viagem;
* análise pós-viagem.

O Provider não receberá:

* nome da Viagem;
* destino preciso;
* datas completas quando não necessárias;
* conteúdo do Roteiro.

---

## 28. Consentimento

O mecanismo de consentimento canônico pertencerá ao domínio de Account e à política de privacidade.

Analytics deverá consultar um estado semelhante a:

```typescript
interface AnalyticsConsent {
  status: "unknown" | "granted" | "denied" | "revoked";
  policyVersion: string;
  decidedAt?: string;
}
```

O PostHog não será a fonte canônica desse consentimento.

---

## 29. Comportamento antes do consentimento

Quando o consentimento for necessário e estiver `unknown`:

* o SDK não deverá capturar eventos;
* persistência analítica deverá permanecer desabilitada;
* session replay permanecerá desabilitado;
* eventos não essenciais não deverão ser colocados em fila indefinidamente;
* a aplicação deverá funcionar normalmente.

---

## 30. Revogação

Ao revogar:

* novas capturas deverão cessar;
* persistência local deverá ser removida;
* identidade deverá ser resetada;
* solicitações de exclusão deverão seguir o processo de privacidade;
* o estado canônico de consentimento deverá ser preservado;
* revogação não deverá impedir observabilidade estritamente necessária.

---

## 31. Base legal e finalidade

Cada categoria de evento deverá possuir:

* finalidade;
* owner;
* classificação;
* base de tratamento definida pela política aplicável;
* retenção;
* propriedades permitidas;
* consumidores autorizados.

Este ADR não substitui validação jurídica.

---

## 32. Coleta client-side

Será adequada para:

* visualização de superfície;
* interação com mapa;
* abertura de explicação;
* expansão de conteúdo;
* tentativa de início de jornada;
* navegação entre etapas;
* abandono observável;
* feedback explícito.

Não deverá confirmar:

* criação persistida;
* pagamento;
* autorização;
* conclusão de workflow;
* aplicação de Proposta;
* registro de Decisão.

---

## 33. Coleta server-side

Será padrão para:

* criação de Trip;
* alteração persistida;
* Place salvo;
* Recomendação gerada;
* Recomendação apresentada quando a apresentação for confirmada pelo servidor;
* Decisão registrada;
* Proposta gerada;
* Proposta aceita;
* Activity aplicada ao Roteiro;
* conflito detectado;
* outcome registrado;
* uso faturável futuro.

---

## 34. Eventos derivados de Eventos de Domínio

Eventos canônicos poderão gerar projeções analíticas.

```text
DecisionRecorded
→ Analytics Projector
→ decision_recorded
```

A projeção deverá:

* utilizar allowlist;
* remover propriedades sensíveis;
* adicionar schema version;
* ser idempotente;
* tolerar retry;
* não bloquear a transação de domínio.

---

## 35. Transactional outbox

Para fatos canônicos relevantes:

```text
transação de domínio
→ Evento de Domínio no outbox
→ commit
→ consumidor
→ projeção analítica
→ PostHog
```

Falha do Provider de analytics não deverá reverter a operação do usuário.

---

## 36. Idempotência

Eventos server-side deverão possuir `eventId` estável.

Retries deverão reutilizar:

* `eventId`;
* `occurredAt`;
* schema version;
* identidade;
* propriedades.

O dashboard deverá considerar a possibilidade de duplicidade residual.

---

## 37. Ordem e atraso

Eventos poderão chegar:

* fora de ordem;
* com atraso;
* após retry;
* após execução assíncrona.

Análises deverão utilizar `occurredAt`, não apenas o instante de ingestão.

Funis deverão declarar janelas compatíveis com workflows assíncronos.

---

## 38. Autocapture

Autocapture permanecerá desabilitado inicialmente.

Sua ativação exigirá novo registro decisório ou revisão formal que defina:

* finalidade;
* seletores permitidos;
* redaction;
* volume;
* custo;
* consentimento;
* retenção;
* teste de vazamento;
* ownership.

---

## 39. Session replay

Session replay permanecerá desabilitado inicialmente.

Não deverá ser ativado apenas para “entender o usuário”.

Uma avaliação futura deverá exigir:

* problema específico;
* consentimento apropriado;
* masking por padrão;
* bloqueio de campos;
* bloqueio de mapas e dados de viagem;
* sampling;
* retenção curta;
* controle de acesso;
* procedimento de exclusão;
* validação em Preview;
* revisão de privacidade e segurança.

---

## 40. Catálogo inicial de eventos

### Aquisição e sessão

* `application_opened`;
* `authentication_started`;
* `authentication_completed`;
* `analytics_consent_granted`;
* `analytics_consent_denied`;
* `analytics_consent_revoked`.

### Viagem

* `trip_creation_started`;
* `trip_creation_step_completed`;
* `trip_created`;
* `trip_context_completed`;
* `trip_opened`;
* `trip_archived`.

### Exploração e lugares

* `place_search_started`;
* `place_search_completed`;
* `place_details_viewed`;
* `place_map_viewed`;
* `place_saved`;
* `place_unsaved`.

### Roteiro

* `itinerary_opened`;
* `activity_added`;
* `activity_moved`;
* `activity_removed`;
* `free_period_added`;
* `itinerary_conflict_presented`;
* `itinerary_conflict_resolved`.

### Recomendação e Decisão

* `recommendation_requested`;
* `recommendation_generated`;
* `recommendation_presented`;
* `recommendation_explanation_opened`;
* `recommendation_accepted`;
* `recommendation_rejected`;
* `decision_recorded`;
* `decision_outcome_recorded`.

### Proposta

* `itinerary_proposal_requested`;
* `itinerary_proposal_generated`;
* `itinerary_proposal_previewed`;
* `itinerary_proposal_partially_accepted`;
* `itinerary_proposal_accepted`;
* `itinerary_proposal_rejected`.

Esta lista é um catálogo inicial, não autorização para instrumentar todos os eventos imediatamente.

---

## 41. Critério para criar um evento

Um evento somente deverá ser criado quando houver:

* pergunta analítica;
* decisão que poderá ser tomada;
* owner;
* fonte;
* definição;
* schema;
* propriedades mínimas;
* classificação de privacidade;
* retenção;
* teste;
* dashboard ou análise prevista.

---

## 42. Métrica norteadora

A métrica norteadora inicial será:

```text
Viagens Ativas com Decisão Assistida Útil
```

Uma Viagem será contabilizada quando, dentro da janela definida:

1. uma Recomendação ou Proposta tiver sido apresentada;
2. uma Decision relacionada tiver sido registrada;
3. existir sinal explícito de utilidade ou outcome compatível.

O nome não implica julgamento absoluto da decisão do usuário.

---

## 43. Limitações da métrica norteadora

A métrica:

* não prova causalidade;
* não mede toda forma de valor;
* depende de outcome disponível;
* não deverá incentivar excesso de Recomendações;
* não deverá penalizar Dias ou Períodos Livres;
* não deverá considerar aceitação automática como qualidade;
* deverá ser acompanhada por guardrails.

---

## 44. Métricas de ativação

Ativação poderá exigir:

```text
trip_created
→ trip_context_completed
→ primeiro valor
```

Primeiro valor poderá ser:

* primeiro Place salvo;
* primeira Activity adicionada;
* primeira Recomendação apresentada;
* primeira Proposta gerada;
* primeira Decision registrada.

O produto deverá escolher uma definição primária e manter as demais como diagnósticas.

---

## 45. Funil inicial recomendado

```text
trip_creation_started
→ trip_created
→ trip_context_completed
→ recommendation_presented ou itinerary_proposal_generated
→ decision_recorded ou activity_added
```

O funil deverá ser segmentável por:

* origem da jornada;
* tipo de Viagem em categorias amplas;
* device category;
* versão;
* variação de feature flag;
* Account elegível;
* presença de Hospedagem como booleano.

---

## 46. Métricas de adoção

Uma capability será considerada:

### Exposta

O usuário recebeu oportunidade real de utilizá-la.

### Experimentada

O usuário iniciou a utilização.

### Utilizada

O fluxo produziu resultado válido.

### Adotada

O resultado foi utilizado em uma jornada ou repetido conforme definição.

### Retida

A capability voltou a ser utilizada em uma janela compatível.

Exibição isolada não significa adoção.

---

## 47. Adoção de Recomendações

Métricas possíveis:

* taxa de Recomendações apresentadas;
* abertura de explicação;
* aceitação;
* rejeição;
* expiração;
* Decisão relacionada;
* outcome posterior;
* tempo até a Decisão;
* cobertura de Justificativas.

Aceitação não deverá ser tratada automaticamente como sucesso.

---

## 48. Adoção de Propostas

Métricas possíveis:

* solicitações;
* geração concluída;
* falha;
* preview;
* aceitação parcial;
* aceitação total;
* rejeição;
* Activities aplicadas;
* edições posteriores;
* tempo até utilização.

Uma Proposta gerada e nunca visualizada não representa valor entregue.

---

## 49. Retenção episódica

Retenção semanal genérica poderá ser enganosa porque Viagens possuem ciclos.

O RouteBook medirá:

* retorno à mesma Trip durante planejamento;
* retorno próximo da data da viagem;
* uso durante a viagem;
* registro pós-viagem;
* criação de nova Trip em outro ciclo;
* reativação após intervalo.

---

## 50. Janelas de retenção

Poderão existir:

* retenção de planejamento em 1, 7 e 30 dias;
* retenção relativa à data de início da Trip;
* utilização durante a Trip;
* retorno pós-viagem;
* criação de nova Trip em 90, 180 ou 365 dias.

As janelas deverão ser declaradas no dashboard.

---

## 51. Métricas de qualidade e guardrails

Deverão acompanhar adoção:

* taxa de erro;
* latência;
* falhas de Provider;
* custo de IA;
* Recomendação rejeitada;
* Proposta falha;
* conflito não resolvido;
* rollback;
* revogação de consentimento;
* exclusão solicitada;
* evento inválido;
* perda de ingestão;
* taxa de uso de fallback.

---

## 52. Decision Quality

Decision Quality pertence ao domínio e não deverá ser calculada diretamente pelo PostHog como verdade canônica.

Analytics poderá analisar sinais derivados aprovados, como:

* outcome informado;
* aderência categórica;
* execução registrada;
* satisfação explícita;
* necessidade de revisão;
* tempo até mudança.

Esses sinais deverão preservar a regra:

> Decision Quality apoia aprendizagem e melhoria; não julga o Usuário.

---

## 53. Métricas de IA

Product analytics poderá medir:

* capability de IA utilizada;
* resultado apresentado;
* resultado aceito ou rejeitado;
* fallback;
* versão de estratégia aprovada;
* classe de latência;
* faixa de custo;
* necessidade de regeneração;
* outcome.

Não deverá receber:

* prompt;
* resposta completa;
* chain of thought;
* Tool arguments sensíveis;
* contexto completo da Trip;
* credencial;
* conteúdo de memória.

---

## 54. Integração com feature flags

O `RB-ADR-020` permanece autoridade sobre:

* avaliação;
* rollout;
* targeting;
* kill switches;
* Provider de flags;
* OpenFeature.

PostHog não substituirá o Provider definido naquele ADR.

---

## 55. Atribuição de variação

Eventos relevantes poderão incluir:

```typescript
featureVariants: {
  "proposal-management.itinerary-proposal.release": true,
  "decision-intelligence.recommendation-ranking.version": "v2",
}
```

Somente flags relevantes à análise deverão ser anexadas.

O contexto não deverá incluir:

* regras;
* listas de targeting;
* atributos pessoais;
* todas as flags da sessão.

---

## 56. Experimentos

O PostHog poderá apoiar análise futura, mas uma experiência somente será considerada experimento quando possuir:

* hipótese;
* população;
* unidade de randomização;
* variações;
* métrica primária;
* guardrails;
* duração;
* poder ou critério de leitura;
* regra de encerramento;
* revisão de privacidade;
* plano de rollout e rollback.

Nenhum experimento será iniciado por este ADR.

---

## 57. Unidade experimental

Para capacidades compartilhadas, Account será preferida.

Para experiências individuais, User poderá ser utilizada.

Trip poderá ser utilizada quando a variação precisar permanecer consistente durante todo o ciclo de uma Viagem.

Request não deverá ser utilizado quando gerar experiência inconsistente.

---

## 58. Dashboards iniciais

### Saúde da instrumentação

* eventos recebidos;
* eventos inválidos;
* atraso;
* duplicidade estimada;
* schema versions;
* volume e custo.

### Ativação

* início de criação;
* Trip criada;
* Contexto completo;
* primeiro valor;
* tempo até primeiro valor.

### Adoção

* Places;
* Roteiro;
* Recomendações;
* Propostas;
* Decisões.

### Retenção

* planejamento;
* pré-viagem;
* durante a viagem;
* nova Viagem.

### Privacidade

* consentimento concedido;
* consentimento negado;
* revogação;
* exclusões;
* violações bloqueadas.

---

## 59. Ownership

Cada:

* evento;
* propriedade;
* métrica;
* funil;
* dashboard;
* experimento;

deverá possuir owner.

Ownership poderá ser atribuído a:

* Product;
* Domain;
* Engineering;
* Data;
* Privacy;
* Growth futuro.

---

## 60. Tracking plan

O repositório deverá manter um tracking plan contendo:

```typescript
interface TrackingPlanEntry {
  name: string;
  description: string;
  purpose: string;
  owner: string;
  source: "client" | "server" | "workflow";
  schemaVersion: number;
  properties: AnalyticsPropertyDefinition[];
  privacyClassification: string;
  consentCategory: string;
  retentionClass: string;
  dashboards: string[];
  status: "draft" | "active" | "deprecated" | "archived";
}
```

---

## 61. Estados do evento

```text
draft
→ active
→ deprecated
→ archived
```

Eventos ativos não deverão ser removidos ou renomeados sem plano de migração.

---

## 62. Versionamento

Mudanças aditivas compatíveis poderão manter a versão.

Mudanças incompatíveis deverão incrementar `schemaVersion`.

São incompatíveis:

* alterar significado;
* mudar unidade;
* mudar enumeração;
* tornar propriedade opcional obrigatória;
* substituir identidade;
* mudar fonte canônica;
* mudar finalidade.

---

## 63. Depreciação

A depreciação deverá:

1. identificar consumidores;
2. criar substituto quando necessário;
3. instrumentar versão nova;
4. validar volume;
5. atualizar dashboards;
6. encerrar emissão;
7. arquivar documentação.

O nome antigo não deverá ser reutilizado para novo significado.

---

## 64. Governança de propriedades

Toda propriedade deverá possuir:

* nome;
* tipo;
* descrição;
* enumeração ou unidade;
* obrigatoriedade;
* classificação;
* origem;
* exemplo seguro;
* política de null;
* owner.

Propriedades livres como `metadata: Record<string, unknown>` serão proibidas.

---

## 65. Qualidade de dados

Deverão ser monitorados:

* cobertura;
* completude;
* conformidade de schema;
* duplicidade;
* atraso;
* volume;
* cardinalidade;
* valores inesperados;
* eventos órfãos;
* ruptura de funis;
* mudança abrupta por release.

---

## 66. Validação em runtime

Eventos deverão ser validados antes do envio.

```typescript
const DecisionRecordedProperties = z.object({
  decisionType: z.enum([
    "place",
    "activity",
    "itinerary-proposal",
    "free-period",
  ]),
  recommendationRelated: z.boolean(),
  outcomeAvailable: z.boolean(),
});
```

Em produção, evento inválido deverá:

* ser descartado ou enviado para quarantine controlada;
* produzir métrica técnica;
* não quebrar a jornada;
* não enviar payload bruto a logs.

---

## 67. Cardinalidade

Valores de alta cardinalidade deverão ser avaliados.

IDs opacos poderão ser necessários para funis e journeys, mas não deverão ser usados indiscriminadamente como dimensões de dashboard.

São proibidos como dimensões livres:

* URL completa;
* prompt;
* texto de busca;
* mensagem de erro;
* nome de Place;
* endereço;
* coordenada;
* payload serializado.

---

## 68. Retenção de dados

Retenção deverá ser configurada conforme:

* finalidade;
* consentimento;
* necessidade analítica;
* plano contratado;
* solicitação de exclusão;
* requisitos legais;
* custo.

Maior retenção disponível no fornecedor não significa retenção automaticamente autorizada.

---

## 69. Direito de exclusão

O RouteBook deverá possuir processo para:

* localizar identidade analítica;
* solicitar exclusão no Provider;
* registrar a solicitação no mecanismo apropriado;
* confirmar conclusão;
* evitar reidentificação;
* preservar somente evidência legal mínima quando aplicável.

---

## 70. Acesso

O acesso ao projeto de analytics deverá seguir least privilege.

Perfis deverão distinguir:

* leitura de dashboards;
* criação de insights;
* alteração de schemas;
* exportação;
* administração;
* exclusão;
* configuração de captura.

Exportações de eventos brutos deverão ser restritas.

---

## 71. Ambientes

Deverão existir separações lógicas ou projetos distintos para:

* development;
* preview;
* staging;
* production.

Dados sintéticos não deverão contaminar produção.

Produção não deverá ser utilizada para testes manuais de instrumentação.

---

## 72. Desenvolvimento local

O ambiente local deverá utilizar, por padrão:

* `NoopProductAnalytics`; ou
* `InMemoryProductAnalytics`.

Envio ao projeto de desenvolvimento deverá ser explícito.

Eventos locais deverão utilizar identidades sintéticas.

---

## 73. Preview

Preview deverá permitir:

* inspeção de eventos;
* validação de consentimento;
* validação de schemas;
* validação de variações;
* teste de logout;
* teste de Account;
* teste de redaction;
* teste de bloqueio de PII.

---

## 74. Testes unitários

Deverão validar:

* nome;
* schema;
* propriedades obrigatórias;
* enumerações;
* redaction;
* consent gate;
* opt-out;
* reset;
* implementação nula;
* feature variants permitidas;
* ausência de texto livre.

---

## 75. Testes de integração

Deverão validar:

* client;
* server;
* outbox;
* retry;
* idempotência;
* atraso;
* identificação;
* logout;
* troca de Account;
* consentimento;
* falha do Provider;
* eventos derivados de domínio.

---

## 76. Testes end-to-end

Jornadas críticas deverão comprovar:

* usuário sem consentimento não envia evento;
* consentimento habilita coleta;
* revogação interrompe coleta;
* Trip criada produz evento server-side;
* falha da captura não impede criação;
* logout reseta identidade;
* Account não vaza para outra;
* evento contém variação correta;
* PII não aparece no payload;
* Preview não contamina produção.

---

## 77. Contract tests

O pipeline deverá comparar:

* catálogo;
* schemas;
* chamadas de captura;
* dashboards declarados;
* propriedades;
* versões.

Código não deverá emitir evento ausente do catálogo.

---

## 78. Teste de privacidade

O pipeline deverá bloquear padrões como:

* e-mail;
* telefone;
* CPF;
* token;
* latitude e longitude precisas;
* URL com query sensível;
* campos livres;
* objetos não tipados;
* payloads de IA.

Esse controle complementa revisão humana e não garante conformidade sozinho.

---

## 79. Observabilidade da pipeline

A pipeline analítica deverá expor:

```text
analytics.events.attempted
analytics.events.sent
analytics.events.dropped
analytics.events.invalid
analytics.events.retried
analytics.queue.depth
analytics.delivery.latency
analytics.provider.errors
```

Métricas não deverão conter identidade de usuário.

---

## 80. Falha do Provider

Se o PostHog estiver indisponível:

* a jornada deverá continuar;
* eventos client-side poderão ser descartados conforme política;
* eventos canônicos poderão permanecer no outbox;
* retries deverão possuir limite;
* fila não deverá crescer indefinidamente;
* circuit breaker poderá ser aplicado;
* alerta deverá ser emitido;
* nenhum dado sensível deverá ser registrado em log.

---

## 81. Custos

O RouteBook deverá acompanhar:

* eventos por jornada;
* eventos por usuário ativo;
* eventos por Trip;
* propriedades de alta cardinalidade;
* retenção;
* volume de teste;
* replay, caso futuramente avaliado;
* exports;
* custo por capability.

Limites de gasto deverão ser configurados quando o Provider permitir.

---

## 82. Sampling

Sampling poderá ser utilizado para:

* eventos de alta frequência;
* interações diagnósticas;
* métricas secundárias.

Não deverá ser aplicado sem compensação a:

* conversões;
* decisões;
* consentimento;
* outcomes;
* eventos raros;
* auditoria;
* fatos canônicos necessários.

---

## 83. Segurança

Deverão ser aplicados:

* chaves públicas somente onde apropriado;
* secrets somente no servidor;
* proxy de ingestão quando justificado;
* CSP;
* allowlist de propriedades;
* redaction;
* controle de acesso;
* rotação de credenciais;
* segregação de ambientes;
* revisão de exportações;
* rate limiting server-side quando aplicável.

---

## 84. Uso de proxy

Um endpoint ou reverse proxy próprio poderá ser adotado para:

* controle de domínio;
* aplicação de headers;
* resiliência;
* redução de bloqueios;
* redaction adicional.

Ele não deverá ser utilizado para ocultar tracking do usuário ou contornar escolhas de privacidade.

---

## 85. Desenvolvimento assistido por IA

Agentes poderão apoiar:

* geração de schemas;
* testes;
* documentação;
* detecção de PII;
* análise de qualidade;
* proposta de métricas;
* revisão de eventos obsoletos;
* elaboração de dashboards.

---

## 86. Limites para agentes

Agentes não poderão autonomamente:

* habilitar autocapture;
* habilitar session replay;
* alterar consentimento;
* adicionar PII;
* enviar prompt ou resposta de IA;
* criar evento sem pergunta analítica;
* identificar usuário por e-mail;
* aumentar retenção;
* exportar dados brutos;
* iniciar experimento;
* escolher vencedor;
* alterar produção;
* compartilhar dados com novo destino;
* usar analytics para autorização;
* usar comportamento para inferir atributo sensível.

---

## 87. Consequências positivas

A decisão proporciona:

* aprendizagem estruturada;
* funis;
* cohorts;
* análise de adoção;
* retenção compatível com viagens;
* separação entre sistemas;
* eventos tipados;
* consentimento;
* minimização;
* correlação com releases;
* baixo custo inicial;
* portabilidade;
* evolução futura para experimentação.

---

## 88. Consequências negativas

A decisão introduz:

* nova dependência SaaS;
* governança adicional;
* catálogo e schemas;
* custo variável;
* risco de instrumentação incorreta;
* necessidade de consentimento;
* necessidade de processos de exclusão;
* testes adicionais;
* dashboards que precisam de ownership;
* possível perda de eventos em falhas.

---

## 89. Riscos e mitigações

### 89.1 Coleta excessiva

Mitigações:

* eventos explícitos;
* autocapture off;
* allowlist;
* revisão;
* catálogo.

### 89.2 PII no Provider

Mitigações:

* IDs opacos;
* redaction;
* schemas;
* CI;
* testes de payload.

### 89.3 Métricas de vaidade

Mitigações:

* pergunta analítica;
* decisão associada;
* métricas de outcome;
* guardrails.

### 89.4 Duplicidade

Mitigações:

* eventId;
* outbox;
* idempotência;
* análise de qualidade.

### 89.5 Lock-in

Mitigações:

* port interno;
* catálogo próprio;
* nomes independentes;
* ausência de chamadas espalhadas;
* estratégia de saída.

### 89.6 Confusão com Eventos de Domínio

Mitigações:

* projeção explícita;
* contratos separados;
* autoridade do Modelo de Domínio.

### 89.7 Confusão com feature flags

Mitigações:

* OpenFeature permanece canônico;
* analytics recebe somente a variação;
* PostHog não autoriza release.

### 89.8 Retenção enganosa

Mitigações:

* cohorts por ciclo da Trip;
* janelas relativas;
* nova Viagem como retorno de longo prazo.

### 89.9 Custo inesperado

Mitigações:

* limites;
* dashboards de volume;
* sampling;
* eventos necessários;
* revisão mensal.

### 89.10 Analytics usado como fonte canônica

Mitigações:

* gravação no domínio primeiro;
* projeção;
* proibição contratual;
* testes.

---

## 90. Controles

Deverão ser implementados:

* PostHog Cloud EU;
* port interno;
* catálogo tipado;
* tracking plan;
* consent gate;
* IDs opacos;
* allowlist;
* redaction;
* schemas;
* outbox para fatos canônicos;
* ambientes separados;
* dashboards de qualidade;
* limites de custo;
* testes;
* ownership;
* depreciação;
* processo de exclusão;
* revisão periódica.

---

## 91. Estratégia de implementação

### Etapa 1 — Fundação

* criar port;
* criar Provider nulo;
* criar Provider em memória;
* criar catálogo;
* definir schema base;
* criar validação.

### Etapa 2 — Privacidade

* integrar consentimento;
* bloquear captura por padrão quando aplicável;
* implementar opt-in;
* implementar revogação;
* implementar reset;
* criar redaction.

### Etapa 3 — PostHog

* criar projeto EU;
* separar ambientes;
* fixar versões de SDK;
* configurar limites;
* desabilitar autocapture;
* manter session replay desabilitado.

### Etapa 4 — Primeiro funil

* instrumentar criação de Trip;
* instrumentar Contexto completo;
* instrumentar primeiro valor;
* validar eventos;
* criar dashboard.

### Etapa 5 — Eventos canônicos

* integrar outbox;
* projetar `TripCreated`;
* projetar `PlaceSaved`;
* projetar `DecisionRecorded`;
* projetar Propostas;
* implementar idempotência.

### Etapa 6 — Adoção

* definir capability adoption;
* instrumentar Recomendações;
* instrumentar Propostas;
* criar cohorts;
* criar guardrails.

### Etapa 7 — Governança

* checks de CI;
* ownership;
* revisão de schemas;
* processo de depreciação;
* revisão de custo;
* processo de exclusão.

---

## 92. Primeiro conjunto recomendado

O primeiro conjunto deverá conter apenas:

```text
trip_creation_started
trip_created
trip_context_completed
place_saved
recommendation_presented
decision_recorded
```

Esse conjunto permite validar:

* client-side;
* server-side;
* outbox;
* consentimento;
* identidade;
* funil;
* primeiro valor;
* separação entre Recomendação e Decisão.

---

## 93. Critérios de implementação concluída

A decisão estará implementada quando:

* port existir;
* Provider nulo funcionar;
* PostHog Cloud EU estiver configurado;
* autocapture estiver desabilitado;
* replay estiver desabilitado;
* consent gate funcionar;
* IDs opacos forem usados;
* primeiro catálogo estiver versionado;
* schemas forem validados;
* eventos server-side não bloquearem domínio;
* outbox projetar pelo menos um evento;
* primeiro funil estiver disponível;
* dashboards de qualidade existirem;
* CI bloquear PII e eventos desconhecidos;
* logout resetar identidade;
* exclusão possuir processo definido.

---

## 94. Verificação

A verificação deverá incluir:

* consentimento desconhecido;
* consentimento concedido;
* consentimento negado;
* revogação;
* usuário anônimo;
* usuário identificado;
* logout;
* troca de Account;
* Trip distinta;
* evento client-side;
* evento server-side;
* evento de workflow;
* retry;
* duplicidade;
* atraso;
* schema inválido;
* PII;
* Provider indisponível;
* feature variant;
* Preview;
* custo;
* exclusão;
* cross-account.

---

## 95. Métricas de adoção da própria estratégia

Poderão ser acompanhadas:

* eventos ativos;
* eventos sem owner;
* eventos sem dashboard;
* eventos inválidos;
* eventos depreciados ainda emitidos;
* propriedades não utilizadas;
* schemas em múltiplas versões;
* falhas de entrega;
* tempo de atraso;
* custo mensal;
* solicitações de exclusão;
* violações bloqueadas;
* dashboards revisados;
* decisões de produto sustentadas por evidência.

---

## 96. Gatilhos de revisão

Esta decisão deverá ser revisada quando:

* o volume ultrapassar materialmente a faixa inicial;
* custos crescerem de forma desproporcional;
* residência de dados precisar mudar;
* self-hosting se tornar obrigatório;
* warehouse se tornar fonte analítica central;
* Amplitude ou Mixpanel oferecer benefício comprovado;
* group analytics avançado se tornar necessário;
* experimentação se tornar frequente;
* aplicativo móvel exigir nova estratégia;
* session replay for proposto;
* autocapture for proposto;
* requisitos legais mudarem;
* PostHog não atender disponibilidade, suporte ou governança.

---

## 97. Estratégia de saída

Uma migração deverá preservar:

* nomes;
* schemas;
* versions;
* identidades opacas;
* consentimento;
* tracking plan;
* eventId;
* occurredAt;
* propriedades;
* dashboards essenciais;
* métricas;
* cohorts;
* histórico permitido.

Fluxo:

```text
implementar novo Provider
→ executar modo shadow controlado
→ comparar volume e schemas
→ reconstruir dashboards
→ migrar captura server-side
→ migrar captura client-side
→ validar consentimento e exclusão
→ encerrar Provider anterior
```

---

## 98. Alternativas futuras permitidas

Esta decisão não impede:

* Amplitude;
* Mixpanel;
* analytics próprio;
* warehouse;
* dbt;
* reverse ETL;
* PostHog self-hosted;
* experimentação;
* session replay controlado;
* autocapture limitado;
* product analytics móvel;
* modelos de atribuição.

Toda evolução deverá preservar minimização, consentimento, contratos e separação de responsabilidades.

---

## 99. Fontes consultadas

Foram consultadas, em 2026-07-27, documentações oficiais:

* [PostHog — Product Analytics](https://posthog.com/docs/product-analytics/start-here);
* [PostHog — Pricing](https://posthog.com/pricing);
* [PostHog — Privacy](https://posthog.com/docs/privacy);
* [PostHog — Controlling data collection](https://posthog.com/docs/privacy/data-collection);
* [PostHog — Self-hosting](https://posthog.com/docs/self-host);
* [PostHog — Open-source self-hosting disclaimer](https://posthog.com/docs/self-host/open-source/disclaimer);
* [Amplitude — Plan your taxonomy](https://amplitude.com/docs/data/data-planning-playbook);
* [Amplitude — Cookies and consent management](https://amplitude.com/docs/sdks/analytics/browser/cookies-and-consent-management);
* [Mixpanel — Data privacy and PII best practices](https://docs.mixpanel.com/guides/guides-by-workflow/data-privacy).

Recursos, limites e preços deverão ser confirmados novamente antes da implementação.

---

## 100. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-021
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar o contexto histórico.

---

## 101. Checklist da decisão

Antes da aprovação:

* problema está definido;
* alternativas foram avaliadas;
* PostHog Cloud EU está justificado;
* self-hosting foi avaliado;
* Amplitude foi avaliado;
* Mixpanel foi avaliado;
* analytics próprio foi avaliado;
* product analytics está separado de observabilidade;
* product analytics está separado de auditoria;
* Eventos de Domínio estão separados de eventos comportamentais;
* métricas de negócio estão separadas;
* marketing está separado;
* port interno está definido;
* catálogo está definido;
* naming está definido;
* schemas estão definidos;
* versionamento está definido;
* identidade anônima está definida;
* User está contemplado;
* Account está contemplada;
* Trip está contemplada;
* consentimento está definido;
* revogação está definida;
* PII está proibida;
* localização está protegida;
* texto livre está proibido;
* client-side está definido;
* server-side está definido;
* outbox está definido;
* idempotência está definida;
* autocapture está desabilitado;
* session replay está desabilitado;
* métrica norteadora está definida;
* ativação está definida;
* adoção está definida;
* retenção episódica está definida;
* Decision Quality está preservada;
* IA está contemplada;
* feature flags estão integradas sem substituir OpenFeature;
* experimentação está limitada;
* tracking plan está definido;
* ownership está definido;
* qualidade está definida;
* testes estão definidos;
* custos estão definidos;
* segurança está definida;
* agentes estão limitados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* estratégia de saída está definida;
* não existem contradições com RB-DOM-001;
* não existem contradições com RB-ADR-008;
* não existem contradições com RB-ADR-009;
* não existem contradições com RB-ADR-013;
* não existem contradições com RB-ADR-014;
* não existem contradições com RB-ADR-020.

---

## 102. Declaração final

O RouteBook adotará PostHog Cloud EU como plataforma inicial de product analytics.

A integração será encapsulada por um port interno e por um catálogo tipado, preservando a possibilidade de substituição futura.

O RouteBook instrumentará eventos explícitos, semânticos, versionados e associados a perguntas analíticas reais.

Autocapture e session replay permanecerão desabilitados inicialmente.

Eventos server-side representarão resultados canônicos, enquanto eventos client-side representarão apenas interações adequadas à interface.

Product analytics não será utilizado como:

* fonte canônica do domínio;
* mecanismo de auditoria;
* sistema de autorização;
* observabilidade técnica;
* armazenamento de prompts;
* armazenamento de contexto completo de Viagem;
* substituto de consentimento;
* sistema de feature flags.

O `RB-ADR-020` continuará definindo OpenFeature e o Provider canônico de feature flags.

Analytics receberá apenas as variações relevantes já avaliadas, permitindo comparar releases sem expor regras ou targeting.

A Viagem será a principal unidade operacional de análise.

A métrica norteadora inicial será **Viagens Ativas com Decisão Assistida Útil**, acompanhada por métricas de ativação, adoção, retenção episódica, qualidade, custo e privacidade.

Identificadores serão opacos.

PII, texto livre, localização precisa, prompts, respostas completas de IA e conteúdo integral de Roteiros não serão enviados ao Provider.

Consentimento será canônico no RouteBook, aplicado antes da coleta não essencial e respeitado em revogação, logout e exclusão.

Essa estratégia permitirá aprender com o uso real do produto sem transformar a experiência de viagem em uma fonte irrestrita de telemetria.

---

## 103. Entrada para o registro

```markdown
| RB-ADR-021 | Estratégia de Product Analytics, Eventos Comportamentais e Medição de Adoção | Architecture Decision Record | Published | 0.1.0 | [rb-adr-021-product-analytics-behavioral-events-and-adoption-measurement.md](./architecture/adrs/rb-adr-021-product-analytics-behavioral-events-and-adoption-measurement.md) |
```
