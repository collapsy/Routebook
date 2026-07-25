---

id: RB-ADR-002

title: Adoção de TypeScript e Node.js como Base Tecnológica Inicial
description: Registra a decisão de adotar TypeScript como linguagem principal e Node.js como runtime inicial do RouteBook, estabelecendo uma base unificada para aplicação web, módulos de negócio, APIs, automações, testes e capacidades de inteligência artificial.

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
- typescript
- nodejs
- runtime
- programming-language
- type-safety
- modular-monolith
- full-stack
- ai-first
- developer-experience
- testing
- maintainability
- portability

related_documents:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
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
- RB-SEC-003
- RB-OBS-001
- RB-QA-001
- RB-QA-002
- RB-OPS-001
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

prerequisites:

- RB-CORE-0004
- RB-DOM-001
- RB-DOM-002
- RB-DOM-003
- RB-DOM-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-ARC-005
- RB-API-001
- RB-QA-001
- RB-SEC-003
- RB-AI-004
- RB-AI-006
- RB-DEL-001
- RB-DEV-001
- RB-CICD-001
- RB-INFRA-001
- RB-ADR-001

next_documents:

- RB-ADR-003

ai_context:
priority: critical
index: true
---

# RB-ADR-002 — Adoção de TypeScript e Node.js como Base Tecnológica Inicial

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* TypeScript deverá ser tratado como linguagem principal do RouteBook;
* Node.js deverá ser tratado como runtime principal inicial;
* novas aplicações e módulos deverão seguir esta base, salvo exceção documentada;
* desvios relevantes deverão possuir justificativa e decisão arquitetural;
* decisões de framework deverão ser registradas separadamente.

---

## 2. Contexto

O RouteBook será implementado inicialmente como um monólito modular, conforme definido no `RB-ADR-001`.

A solução deverá suportar:

* aplicação web;
* APIs;
* módulos de domínio;
* casos de uso;
* persistência;
* integrações externas;
* jobs;
* workers;
* testes;
* scripts;
* pipelines;
* ferramentas de desenvolvimento;
* capacidades de inteligência artificial;
* agentes;
* Structured Outputs;
* Tools;
* validação de schemas;
* observabilidade.

O projeto também deverá preservar:

* linguagem ubíqua;
* identificadores canônicos;
* fronteiras entre módulos;
* contratos tipados;
* validação de entradas;
* segurança;
* produtividade individual;
* desenvolvimento assistido por agentes de IA;
* baixo custo operacional;
* simplicidade de setup.

É necessário selecionar uma linguagem e um runtime principais antes de definir:

* framework web;
* estrutura física do repositório;
* estratégia de frontend;
* framework de APIs;
* bibliotecas de persistência;
* ferramentas de teste;
* runtime de agentes;
* estratégia de build.

---

## 3. Problema

Qual linguagem e runtime deverão formar a base tecnológica inicial do RouteBook, considerando:

* o estágio atual do produto;
* a arquitetura de monólito modular;
* a necessidade de desenvolvimento web;
* a necessidade de APIs e integrações;
* o uso intenso de contratos e schemas;
* a integração com modelos de IA;
* a experiência do responsável pelo projeto;
* a necessidade de produtividade;
* a necessidade de testes;
* a manutenção por agentes de IA;
* a possibilidade de compartilhar tipos;
* a simplicidade operacional?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. produtividade inicial;
2. segurança de tipos;
3. adequação ao desenvolvimento web;
4. suporte a APIs;
5. suporte a processamento assíncrono;
6. compatibilidade com SDKs de IA;
7. disponibilidade de bibliotecas;
8. qualidade do ecossistema de testes;
9. suporte de ferramentas;
10. compatibilidade com monólito modular;
11. facilidade de contratação ou colaboração futura;
12. experiência existente do responsável pelo projeto;
13. suporte de agentes de IA;
14. portabilidade;
15. baixo custo operacional;
16. compartilhamento controlado de contratos;
17. capacidade de validação em tempo de execução.

---

## 5. Restrições

A linguagem e o runtime selecionados deverão:

* executar adequadamente aplicações web e APIs;
* permitir modularização explícita;
* possuir suporte ativo;
* permitir tipagem estrita;
* possuir ecossistema maduro de testes;
* possuir ferramentas de lint e formatação;
* suportar integração com banco de dados;
* suportar tarefas assíncronas;
* permitir instrumentação;
* suportar SDKs de inteligência artificial;
* funcionar em ambientes locais e gerenciados;
* permitir builds reproduzíveis;
* evitar dependência obrigatória de um único Provider.

---

## 6. Opções consideradas

### 6.1 Opção A — JavaScript sem TypeScript

Utilizar JavaScript como linguagem principal no runtime Node.js.

#### Benefícios

* configuração inicial simples;
* amplo ecossistema;
* execução direta;
* menor barreira para pequenos scripts;
* excelente suporte web.

#### Limitações

* menor segurança estática;
* maior dependência de testes para detectar erros de contrato;
* refatorações mais arriscadas;
* menor proteção de invariantes estruturais;
* maior possibilidade de identificadores inconsistentes;
* contratos mais difíceis de manter em bases maiores;
* menor contexto verificável para agentes de IA.

#### Avaliação

A simplicidade inicial não compensa a perda de segurança e de capacidade de evolução.

Foi rejeitada como linguagem principal.

---

### 6.2 Opção B — TypeScript com Node.js

Utilizar TypeScript como linguagem principal e Node.js como runtime inicial.

#### Benefícios

* tipagem estática;
* amplo ecossistema web;
* compartilhamento controlado de tipos;
* boa integração com validação de schemas;
* suporte amplo a SDKs de IA;
* excelente tooling;
* testes maduros;
* execução em múltiplos Providers;
* produtividade elevada;
* compatibilidade com frontend e backend;
* boa legibilidade para agentes de IA;
* suporte a ESM;
* integração simples com JSON;
* adequação a workloads orientados a I/O.

#### Limitações

* tipos não existem automaticamente em runtime;
* configuração pode se tornar complexa;
* risco de uso excessivo de tipos genéricos;
* risco de compartilhamento indevido entre camadas;
* desempenho inferior a runtimes compilados em alguns workloads intensivos;
* event loop exige atenção em operações bloqueantes;
* ecossistema possui dependências de qualidade variável.

#### Avaliação

Oferece o melhor equilíbrio para o estágio inicial e para o perfil do RouteBook.

Foi selecionada.

---

### 6.3 Opção C — Java com JVM

Utilizar Java e uma stack baseada em JVM.

#### Benefícios

* tipagem forte;
* ecossistema corporativo;
* frameworks maduros;
* desempenho previsível;
* excelente suporte a sistemas modulares;
* ferramentas robustas;
* observabilidade madura.

#### Limitações

* maior peso operacional inicial;
* maior quantidade de configuração;
* menor compartilhamento com frontend;
* curva de desenvolvimento potencialmente mais lenta para o contexto atual;
* menor alinhamento com a experiência principal do responsável pelo projeto;
* maior custo cognitivo para um MVP pessoal.

#### Avaliação

É tecnicamente adequada, mas não oferece o melhor equilíbrio de produtividade para o estágio atual.

Foi rejeitada como base inicial.

---

### 6.4 Opção D — C# com .NET

Utilizar C# e .NET como base.

#### Benefícios

* tipagem forte;
* excelente tooling;
* APIs maduras;
* desempenho;
* testes;
* recursos modernos da linguagem;
* boa estrutura modular.

#### Limitações

* menor compartilhamento com frontend;
* mudança de ecossistema;
* menor alinhamento com as habilidades já utilizadas no projeto;
* maior custo inicial de adoção;
* não oferece vantagem decisiva para o MVP atual.

#### Avaliação

É uma opção válida, mas não supera TypeScript no contexto atual.

Foi rejeitada.

---

### 6.5 Opção E — Python

Utilizar Python como linguagem principal.

#### Benefícios

* produtividade;
* ecossistema de IA e dados;
* sintaxe simples;
* ampla disponibilidade de bibliotecas;
* boa adequação a protótipos;
* forte suporte a automação.

#### Limitações

* menor compartilhamento com frontend;
* tipagem opcional e menos uniforme;
* maior risco de divergência de contratos;
* desempenho inferior em determinados workloads;
* necessidade de stack adicional para frontend;
* manutenção de dois ecossistemas desde o início.

#### Avaliação

Python poderá ser utilizado futuramente para workloads especializados de dados ou IA, mas não será a linguagem principal inicial.

Foi rejeitada como base principal.

---

### 6.6 Opção F — Rust ou Go

Utilizar uma linguagem compilada com foco em desempenho e operação.

#### Benefícios

* desempenho;
* binários distribuíveis;
* controle de recursos;
* concorrência;
* previsibilidade operacional;
* forte tipagem.

#### Limitações

* menor produtividade inicial para o contexto atual;
* menor compartilhamento com frontend;
* maior curva de aprendizado;
* menor disponibilidade de algumas integrações de produto e IA;
* complexidade desnecessária para o MVP;
* ausência atual de requisitos de desempenho que justifiquem a escolha.

#### Avaliação

Poderão ser consideradas futuramente para componentes especializados.

Foram rejeitadas como base inicial.

---

## 7. Decisão

O RouteBook adotará:

* **TypeScript** como linguagem principal;
* **Node.js** como runtime principal inicial.

A decisão se aplica inicialmente a:

* backend;
* APIs;
* módulos de domínio;
* camada de aplicação;
* adapters;
* integrações;
* jobs;
* workers;
* scripts;
* automações;
* testes;
* runtime de agentes;
* Tools;
* validações;
* componentes compartilhados autorizados.

TypeScript também será a linguagem preferencial para o frontend, sujeito a decisão específica sobre framework e arquitetura de interface.

---

## 8. Escopo da decisão

Esta decisão define:

* linguagem principal;
* runtime principal;
* diretrizes gerais de compilação;
* princípios de tipagem;
* interoperabilidade;
* critérios para exceções.

Esta decisão não define:

* framework frontend;
* framework backend;
* framework full-stack;
* banco de dados;
* ORM;
* biblioteca de schemas;
* ferramenta de testes;
* package manager;
* bundler;
* plataforma de deployment;
* Provider de cloud.

Essas escolhas deverão ser registradas separadamente quando forem estruturais.

---

## 9. Versão do runtime

O projeto deverá utilizar uma versão LTS ativa do Node.js.

A versão exata deverá ser fixada por mecanismo versionado, como:

```text
.node-version
.nvmrc
.tool-versions
package.json
imagem de container
```

O projeto não deverá utilizar a instrução genérica “Node.js mais recente”.

Atualizações de versão principal deverão passar por:

* análise de compatibilidade;
* testes;
* atualização de dependências;
* validação de build;
* validação de runtime;
* registro da mudança.

---

## 10. TypeScript estrito

O TypeScript deverá operar em modo estrito.

A configuração deverá habilitar ou equivaler a:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

A configuração final poderá variar conforme compatibilidade, mas reduções relevantes de rigor deverão ser justificadas.

---

## 11. Ausência de `any` como padrão

O tipo `any` não deverá ser utilizado como solução rotineira.

Alternativas preferenciais:

* `unknown`;
* tipos discriminados;
* generics limitados;
* validação de schema;
* narrowing;
* type guards;
* contratos explícitos.

O uso de `any` deverá ser:

* localizado;
* justificado;
* revisável;
* temporário quando possível.

---

## 12. Validação em runtime

A tipagem do TypeScript não substitui validação em tempo de execução.

Entradas externas deverão ser tratadas como não confiáveis.

Isso inclui:

* requests;
* parâmetros;
* headers;
* variáveis de ambiente;
* respostas de Providers;
* dados do banco;
* eventos;
* arquivos;
* Structured Outputs;
* Tool inputs;
* webhooks.

O fluxo deverá ser:

```text
dado externo
→ unknown
→ validação
→ tipo validado
→ aplicação
→ domínio
```

---

## 13. Separação de tipos

O projeto deverá distinguir:

* input contract;
* validated input;
* command;
* query;
* domain model;
* persistence model;
* API response;
* event contract;
* Provider contract;
* AI output schema.

Um único tipo não deverá ser reutilizado indiscriminadamente entre todas as camadas.

---

## 14. Tipos de domínio

Conceitos canônicos deverão possuir tipos explícitos.

Exemplos:

```typescript
type TripId = string;
type ActivityId = string;
type RecommendationId = string;
type PlanningConflictId = string;
type ItineraryProposalId = string;
```

A implementação final poderá utilizar branded types ou value objects para aumentar segurança.

Identificadores genéricos como `ItemId`, `ProposalId` e `ConflictId` não deverão se tornar conceitos canônicos.

---

## 15. Value Objects

Value Objects deverão ser utilizados quando houver regras ou semântica relevante.

Exemplos possíveis:

* TripDate;
* DateRange;
* GeographicCoordinates;
* Distance;
* Duration;
* Money;
* TimeWindow;
* PlaceCategory.

Eles deverão:

* validar sua construção;
* preservar invariantes;
* ser imutáveis quando apropriado;
* evitar valores primitivos sem semântica.

---

## 16. Null e undefined

A utilização de `null` e `undefined` deverá ser consistente.

O projeto deverá definir convenção específica, mas deverá evitar:

* retorno ambíguo;
* propriedades opcionais sem significado claro;
* estados parcialmente válidos;
* uso misto sem necessidade.

Quando a ausência fizer parte do domínio, ela deverá ser modelada explicitamente.

---

## 17. Discriminated unions

Estados e resultados variáveis deverão preferir uniões discriminadas.

Exemplo:

```typescript
type PlanningConflictResolution =
  | {
      status: "resolved";
      planningConflictId: PlanningConflictId;
    }
  | {
      status: "ignored";
      planningConflictId: PlanningConflictId;
      reason: string;
    }
  | {
      status: "invalidated";
      planningConflictId: PlanningConflictId;
    };
```

Essa abordagem deverá ser preferida a objetos com múltiplas propriedades opcionais incompatíveis.

---

## 18. Tratamento de resultados

Falhas esperadas de domínio ou aplicação não deverão depender exclusivamente de exceções genéricas.

Poderão ser utilizados resultados explícitos, como:

```typescript
type Result<T, E> =
  | {
      success: true;
      value: T;
    }
  | {
      success: false;
      error: E;
    };
```

A convenção final deverá ser definida nos padrões de implementação.

---

## 19. Exceções

Exceções poderão ser utilizadas para:

* falhas inesperadas;
* erro de infraestrutura;
* interrupção de fluxo não recuperável localmente;
* erro de programação.

Erros esperados deverão possuir classificação e contrato.

---

## 20. Programação assíncrona

Operações de I/O deverão utilizar APIs assíncronas.

Deverão ser evitadas operações síncronas bloqueantes no fluxo de requests, especialmente para:

* arquivos;
* criptografia pesada;
* transformação de grandes volumes;
* parsing intensivo;
* processamento de imagens;
* cálculos extensos.

Workloads intensivos poderão ser movidos para:

* workers;
* jobs;
* threads;
* processos;
* serviços especializados.

---

## 21. Event loop

A arquitetura deverá reconhecer as características do event loop do Node.js.

O runtime é adequado para:

* APIs;
* integrações;
* I/O;
* streaming;
* jobs orientados a rede;
* orquestração de IA.

Ele exige cuidado com:

* loops extensos;
* serialização pesada;
* compressão;
* criptografia;
* cálculos de otimização;
* manipulação de arquivos grandes.

---

## 22. Módulos ECMAScript

O projeto deverá preferir o padrão ESM, salvo incompatibilidade técnica relevante.

A configuração deverá ser coerente entre:

* TypeScript;
* Node.js;
* testes;
* bundler;
* lint;
* scripts;
* package manager.

Misturas desnecessárias entre CommonJS e ESM deverão ser evitadas.

---

## 23. Organização de imports

Imports deverão:

* ser explícitos;
* respeitar fronteiras;
* evitar caminhos internos de outros módulos;
* evitar barrel files excessivos;
* não criar ciclos;
* utilizar aliases controlados quando necessário.

Aliases não deverão ocultar dependências proibidas.

---

## 24. Compartilhamento entre frontend e backend

O compartilhamento de código deverá ser criterioso.

Poderão ser compartilhados:

* schemas;
* contratos públicos;
* tipos derivados de schemas;
* identificadores;
* primitives estáveis;
* design tokens, quando aplicável.

Não deverão ser compartilhados diretamente:

* entidades do domínio;
* repositories;
* serviços internos;
* modelos de persistência;
* objetos contendo dados sensíveis;
* regras específicas de infraestrutura.

---

## 25. Contratos como fonte

Quando houver contrato externo ou compartilhado, deverá existir uma fonte canônica.

A fonte poderá ser:

* schema;
* especificação de API;
* contrato TypeScript validável;
* definição de evento;
* Structured Output schema.

Tipos deverão ser derivados ou validados contra essa fonte quando possível.

---

## 26. APIs

APIs deverão utilizar TypeScript para:

* contratos;
* validação;
* handlers;
* casos de uso;
* respostas;
* erros;
* documentação gerável.

A tipagem interna não deverá ser tratada como contrato suficiente para consumidores externos.

---

## 27. Persistência

Modelos de persistência não deverão substituir modelos de domínio.

Adapters deverão converter entre:

* dados persistidos;
* tipos validados;
* objetos de domínio;
* read models.

Mudanças de ORM ou banco não deverão exigir alteração generalizada do domínio.

---

## 28. Inteligência artificial

TypeScript deverá ser utilizado para definir:

* capability contracts;
* agent configuration;
* Context Builders;
* Structured Outputs;
* Tool schemas;
* Tool results;
* evaluation inputs;
* evaluation outputs;
* runtime limits;
* Provider adapters.

Outputs de modelos deverão permanecer `unknown` até validação.

---

## 29. Structured Outputs

Todo Structured Output deverá possuir:

* schemaVersion;
* validação;
* tratamento de erro;
* limite de tamanho;
* fallback;
* rastreabilidade.

Um tipo TypeScript isolado não é suficiente para validar uma resposta de modelo.

---

## 30. Tools

Cada Tool deverá possuir:

* nome;
* descrição;
* input schema;
* output schema;
* autorização;
* timeout;
* tratamento de erro;
* idempotência quando aplicável;
* observabilidade.

O handler da Tool deverá chamar um caso de uso autorizado.

Ele não deverá acessar diretamente banco ou repository de outro módulo.

---

## 31. SDKs de Providers

SDKs externos deverão permanecer em adapters.

O domínio e a aplicação não deverão importar diretamente SDKs de:

* modelos de IA;
* mapas;
* geocoding;
* e-mail;
* storage;
* observabilidade;
* banco gerenciado.

---

## 32. Testes

A base TypeScript deverá suportar:

* testes unitários;
* testes de domínio;
* testes de integração;
* testes de contrato;
* testes de API;
* testes end-to-end;
* testes de arquitetura;
* testes de IA.

A ferramenta final será decidida separadamente.

---

## 33. Type checking no pipeline

O pipeline deverá executar verificação de tipos independente do build quando aplicável.

O merge deverá ser bloqueado por:

* erro de tipagem;
* contrato incompatível;
* import inválido;
* configuração divergente.

---

## 34. Lint e formatação

O projeto deverá utilizar ferramentas automatizadas de:

* lint;
* formatação;
* ordenação ou validação de imports;
* detecção de código não utilizado;
* detecção de promises não tratadas;
* validação arquitetural.

As ferramentas específicas serão definidas na implementação ou em decisão separada quando necessário.

---

## 35. Promises

Promises deverão ser tratadas explicitamente.

Não deverão ser normalizadas:

* promises ignoradas;
* erros assíncronos não tratados;
* callbacks sem controle;
* concorrência ilimitada;
* retries implícitos;
* `Promise.all` sobre populações sem limite.

---

## 36. Concorrência

Operações concorrentes deverão possuir limites quando envolverem:

* Providers;
* banco;
* IA;
* filas;
* arquivos;
* APIs externas.

A concorrência deverá considerar:

* rate limits;
* custo;
* memória;
* timeout;
* cancelamento;
* idempotência.

---

## 37. Cancelamento e timeout

Integrações externas deverão possuir timeout.

Operações longas deverão suportar cancelamento quando apropriado.

O runtime deverá propagar sinais de cancelamento para:

* requests;
* Providers;
* Tools;
* jobs;
* streams.

---

## 38. Segurança

A base tecnológica deverá implementar controles para:

* validação de entrada;
* autorização;
* isolamento entre Accounts;
* proteção de secrets;
* sanitização de logs;
* dependências;
* uploads;
* execução de Tools;
* rate limiting;
* tratamento de erros.

O sistema de tipos deverá complementar, e não substituir, os controles de segurança.

---

## 39. Dependências

Dependências deverão ser avaliadas conforme `RB-DEV-001` e `RB-SEC-003`.

O ecossistema Node.js exige atenção especial a:

* dependências transitivas;
* packages abandonados;
* scripts de instalação;
* typosquatting;
* permissões excessivas;
* atualizações incompatíveis;
* lockfiles.

---

## 40. Package manager

O package manager deverá:

* utilizar lockfile;
* suportar instalação reproduzível;
* permitir workspaces quando necessários;
* possuir execução adequada no CI;
* oferecer auditoria e atualização controlada.

A escolha específica será registrada posteriormente se representar decisão estrutural.

---

## 41. Monorepo

TypeScript permite compartilhar tooling e contratos em monorepo.

A adoção de monorepo será decidida em ADR específico.

Esta decisão não determina:

* número de aplicações;
* número de packages;
* ferramenta de workspace;
* ferramenta de build distribuído.

---

## 42. Build

O build deverá ser:

* reproduzível;
* separado por aplicação quando necessário;
* validado;
* observável;
* compatível com artefatos imutáveis;
* independente de secrets de runtime.

O build não deverá incorporar configuração sensível.

---

## 43. Deployment

Aplicações Node.js poderão ser executadas em:

* containers;
* plataformas gerenciadas;
* serverless;
* virtual machines;
* runtimes especializados.

A escolha deverá ser registrada separadamente.

---

## 44. Portabilidade

A implementação deverá evitar dependência direta de APIs proprietárias no domínio e na aplicação.

A portabilidade será preservada por:

* ports;
* adapters;
* configuração;
* contratos;
* infraestrutura como código;
* testes.

---

## 45. Observabilidade

O runtime deverá suportar:

* logs estruturados;
* métricas;
* traces;
* correlationId;
* requestId;
* accountId;
* tripId;
* capabilityId;
* agentId.

Instrumentação não deverá contaminar regras de domínio.

---

## 46. Performance

TypeScript e Node.js são considerados suficientes para o MVP e para o crescimento inicial esperado.

A decisão deverá ser reavaliada quando existirem evidências de:

* saturação de CPU;
* latência incompatível;
* consumo de memória inadequado;
* necessidade de otimização matemática intensiva;
* processamento geográfico pesado;
* alto volume de streaming;
* custo operacional excessivo.

---

## 47. Componentes em outras linguagens

A adoção de TypeScript como linguagem principal não proíbe componentes especializados em outras linguagens.

Exceções poderão ser consideradas para:

* processamento científico;
* otimização;
* machine learning;
* manipulação de mídia;
* workloads de alto desempenho;
* ferramentas de infraestrutura.

Toda exceção relevante deverá possuir:

* problema;
* justificativa;
* owner;
* contrato;
* estratégia de deployment;
* observabilidade;
* manutenção;
* ADR quando estrutural.

---

## 48. Scripts

Scripts oficiais deverão preferir TypeScript quando:

* fizerem parte da operação;
* precisarem de contratos;
* forem mantidos continuamente;
* acessarem módulos da aplicação.

Shell ou outras linguagens poderão ser usadas para tarefas pequenas e específicas.

---

## 49. Experiência de desenvolvimento

A base deverá proporcionar:

* autocomplete;
* navegação;
* refatoração;
* verificação instantânea;
* integração com editores;
* mensagens de erro acionáveis;
* execução local rápida;
* testes rápidos.

---

## 50. Desenvolvimento assistido por IA

TypeScript deverá facilitar a atuação de agentes ao fornecer:

* tipos;
* interfaces;
* schemas;
* contratos;
* erros de compilação;
* fronteiras;
* imports explícitos;
* testes.

Agentes não deverão:

* utilizar casts para silenciar erros sem justificativa;
* introduzir `any` indiscriminadamente;
* duplicar contratos;
* criar identificadores genéricos;
* exportar componentes internos;
* misturar modelos de persistência e domínio.

---

## 51. Regras para casts

Casts deverão ser utilizados apenas quando o compilador não puder inferir uma condição já garantida.

Não deverão ser usados para transformar dados não validados em tipos confiáveis.

Exemplo inadequado:

```typescript
const proposal = externalValue as ItineraryProposal;
```

Fluxo adequado:

```typescript
const parsedProposal = itineraryProposalSchema.parse(externalValue);
```

---

## 52. Código gerado

Código gerado poderá ser utilizado para:

* clientes de API;
* contratos;
* schemas;
* migrations;
* tipos de banco;
* documentação.

A fonte geradora deverá ser identificada.

Código gerado não deverá ser editado manualmente quando isso impedir regeneração.

---

## 53. Consequências positivas

A decisão proporciona:

* uma linguagem principal para o produto;
* compartilhamento controlado entre frontend e backend;
* forte tooling;
* produtividade;
* tipagem;
* melhor refatoração;
* ampla integração com IA;
* ampla integração com web;
* ecossistema de testes;
* facilidade de contratação futura;
* boa execução em múltiplos ambientes;
* menor carga cognitiva inicial;
* maior capacidade de análise por agentes.

---

## 54. Consequências negativas

A decisão introduz:

* dependência do ecossistema Node.js;
* necessidade de validação em runtime;
* risco de dependências vulneráveis;
* risco de configuração complexa;
* risco de uso excessivo de tipagem estrutural;
* risco de casts inseguros;
* limitações para workloads intensivos de CPU;
* necessidade de controlar operações bloqueantes;
* necessidade de padronizar ESM e tooling.

---

## 55. Riscos

### 55.1 Falsa segurança de tipos

Mitigação:

* validação em runtime;
* schemas;
* testes;
* contratos.

### 55.2 Uso excessivo de `any`

Mitigação:

* lint;
* strict mode;
* revisão;
* métricas.

### 55.3 Contratos compartilhados indevidamente

Mitigação:

* packages controlados;
* superfícies públicas;
* ownership;
* testes de arquitetura.

### 55.4 Dependências inseguras

Mitigação:

* lockfile;
* scanning;
* atualização;
* avaliação;
* SBOM.

### 55.5 Bloqueio do event loop

Mitigação:

* métricas;
* workers;
* profiling;
* limites;
* execução assíncrona.

### 55.6 Divergência de configuração

Mitigação:

* base config;
* validação;
* pipeline;
* versionamento.

### 55.7 Código gerado por IA com casts inseguros

Mitigação:

* revisão humana;
* lint;
* testes;
* regras de prompts;
* proibição de bypass silencioso.

---

## 56. Controles

Deverão ser implementados progressivamente:

* TypeScript strict;
* lint contra `any`;
* validação de entradas;
* testes de contratos;
* dependency scanning;
* secret scanning;
* lockfile;
* typecheck no pipeline;
* validação de arquitetura;
* controle de imports;
* revisão de packages;
* observabilidade do runtime.

---

## 57. Estratégia de implementação

### Etapa 1 — Runtime

* fixar versão LTS do Node.js;
* registrar versão;
* configurar execução local;
* definir política de atualização.

### Etapa 2 — TypeScript

* criar configuração base;
* habilitar strict mode;
* definir target;
* definir module system;
* definir resolução de módulos.

### Etapa 3 — Tooling

* lint;
* formatação;
* typecheck;
* testes;
* build;
* execução em desenvolvimento.

### Etapa 4 — Estrutura

* representar módulos do `RB-ADR-001`;
* configurar aliases controlados;
* impedir imports proibidos.

### Etapa 5 — Primeiro incremento

* implementar Trip Management;
* criar contratos;
* criar testes;
* validar pipeline.

---

## 58. Critérios de implementação

A decisão estará implementada quando:

* a versão do Node.js estiver fixada;
* TypeScript strict estiver habilitado;
* o projeto executar localmente;
* typecheck executar no pipeline;
* build reproduzível existir;
* lint e formatação estiverem configurados;
* testes TypeScript forem executáveis;
* módulos forem representados;
* entradas externas forem validadas;
* a documentação refletir a configuração real.

---

## 59. Verificação

A verificação deverá incluir:

* instalação em ambiente limpo;
* execução local;
* typecheck;
* build;
* testes;
* inspeção da configuração;
* validação de imports;
* análise de dependências;
* execução de um caso de uso;
* validação de um Structured Output;
* validação de uma Tool.

---

## 60. Métricas

Poderão ser acompanhadas:

* erros de typecheck;
* ocorrências de `any`;
* casts;
* falhas de validação;
* dependências vulneráveis;
* tempo de build;
* tempo de testes;
* uso de memória;
* event loop lag;
* erros não tratados;
* tempo de startup;
* tamanho de artefatos.

---

## 61. Gatilhos de revisão

A decisão deverá ser reavaliada quando:

* Node.js não atender aos requisitos de desempenho;
* o ecossistema não suportar capacidade necessária;
* a manutenção de TypeScript se tornar desproporcional;
* componentes especializados dominarem a solução;
* requisitos regulatórios exigirem tecnologia específica;
* custo operacional se tornar inadequado;
* uma plataforma alternativa oferecer benefício material comprovado;
* a arquitetura deixar de ser majoritariamente web e orientada a I/O.

---

## 62. Estratégia de rollback

Como esta é uma decisão estrutural, sua reversão exigirá novo ADR.

A migração deverá considerar:

* módulos;
* contratos;
* dados;
* APIs;
* pipelines;
* testes;
* runtime;
* infraestrutura;
* observabilidade;
* habilidades necessárias.

A substituição deverá ocorrer progressivamente e preservar interoperabilidade.

---

## 63. Decisões derivadas

Esta decisão deverá ser seguida por ADRs sobre:

* framework principal de aplicação;
* arquitetura do frontend;
* organização do monorepo;
* package manager;
* estratégia de schemas;
* framework de testes;
* persistência;
* banco de dados;
* autenticação;
* plataforma de deployment;
* Provider de cloud.

---

## 64. Próxima decisão

O `RB-ADR-003` deverá escolher a estrutura principal da aplicação web e avaliar opções como:

* framework full-stack;
* frontend separado de API;
* aplicação React com backend dedicado;
* renderização no servidor;
* renderização no cliente;
* rotas de API integradas ou separadas.

A decisão deverá respeitar:

* o monólito modular;
* TypeScript;
* Node.js;
* o MVP;
* a experiência responsiva;
* a implantação simples;
* a possibilidade de evolução.

---

## 65. Supersessão

Um ADR futuro que substitua esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-002
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar o contexto histórico.

---

## 66. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* TypeScript está justificado;
* Node.js está justificado;
* limites do runtime estão registrados;
* validação em runtime está definida;
* tipagem estrita está definida;
* contratos estão definidos;
* IA está contemplada;
* segurança está contemplada;
* testes estão contemplados;
* desenvolvimento assistido por IA está contemplado;
* componentes em outras linguagens estão governados;
* consequências estão registradas;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* gatilhos de revisão estão definidos;
* supersessão está definida;
* não existem contradições com RB-ADR-001;
* escolhas de framework não foram antecipadas.

---

## 67. Declaração final

O RouteBook adotará TypeScript e Node.js como base tecnológica inicial porque essa combinação oferece o melhor equilíbrio entre:

* produtividade;
* tipagem;
* desenvolvimento web;
* APIs;
* inteligência artificial;
* testes;
* portabilidade;
* experiência de desenvolvimento;
* simplicidade operacional.

A adoção de TypeScript não permitirá confiar em dados externos sem validação.

A adoção de Node.js não permitirá ignorar:

* limites do event loop;
* concorrência;
* timeouts;
* segurança de dependências;
* observabilidade;
* consumo de recursos.

O sistema deverá utilizar tipos para tornar contratos, estados e conceitos mais explícitos, preservando a linguagem canônica definida pelo domínio.

Tecnologias adicionais poderão ser adotadas quando resolverem necessidades comprovadas, mas TypeScript e Node.js permanecerão como a base principal até que uma nova decisão arquitetural formal determine sua substituição.
