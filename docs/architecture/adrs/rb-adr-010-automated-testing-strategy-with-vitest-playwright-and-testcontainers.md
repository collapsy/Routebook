---

id: RB-ADR-010

title: Estratégia de Testes Automatizados com Vitest, Testing Library, Playwright e Testcontainers
description: Registra a decisão de adotar uma estratégia de testes automatizados em camadas utilizando Vitest, Testing Library, Playwright e Testcontainers, cobrindo domínio, aplicação, componentes, integrações, PostgreSQL, PostGIS, contratos, acessibilidade, jornadas e capacidades de inteligência artificial.

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
- testing
- automated-testing
- vitest
- testing-library
- playwright
- testcontainers
- postgresql
- postgis
- integration-testing
- end-to-end-testing
- accessibility
- contract-testing
- ai-evaluation

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-002
- RB-PRD-003
- RB-PRD-004
- RB-PRD-005
- RB-PRD-006
- RB-PRD-007
- RB-PRD-008
- RB-UX-001
- RB-UX-002
- RB-UX-003
- RB-UX-004
- RB-UX-005
- RB-UX-006
- RB-DS-001
- RB-DS-002
- RB-DS-003
- RB-DS-004
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
- RB-API-001
- RB-SEC-001
- RB-SEC-002
- RB-SEC-003
- RB-OBS-001
- RB-QA-001
- RB-QA-002
- RB-AI-002
- RB-AI-003
- RB-AI-004
- RB-AI-005
- RB-AI-006
- RB-DEV-001
- RB-CICD-001
- RB-ADR-001
- RB-ADR-002
- RB-ADR-003
- RB-ADR-004
- RB-ADR-005
- RB-ADR-006
- RB-ADR-007
- RB-ADR-008
- RB-ADR-009

next_documents:

- RB-ADR-011

ai_context:
priority: critical
index: true
---

# RB-ADR-010 — Estratégia de Testes Automatizados com Vitest, Testing Library, Playwright e Testcontainers

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* Vitest será o test runner principal para testes unitários, de aplicação, contratos e integrações não navegacionais;
* Testing Library será utilizada para testar comportamento de componentes React;
* Playwright será utilizado para testes end-to-end e jornadas reais no navegador;
* Testcontainers será utilizado para provisionar PostgreSQL com PostGIS e outras dependências reais em testes de integração;
* mocks serão utilizados principalmente em fronteiras externas;
* testes cross-account serão obrigatórios;
* testes de capacidades de IA serão separados entre determinísticos, contract tests e evaluations;
* testes flaky deverão ser tratados como defeitos;
* versões exatas deverão ser fixadas no repositório.

---

## 2. Contexto

O RouteBook adotou:

* monólito modular;
* TypeScript;
* Node.js;
* Next.js com App Router;
* pnpm Workspaces;
* Turborepo;
* PostgreSQL;
* PostGIS;
* Drizzle ORM;
* Better Auth;
* autorização híbrida por Account;
* Zod para validação em runtime;
* arquitetura AI-First.

A aplicação deverá implementar fluxos que combinam:

* regras de domínio;
* persistência;
* autenticação;
* autorização;
* mapas;
* Providers;
* componentes React;
* Server Components;
* Client Components;
* Server Functions;
* Route Handlers;
* Structured Outputs;
* Tools;
* agentes;
* jornadas responsivas.

Uma única ferramenta de testes não cobre adequadamente todas essas responsabilidades.

A estratégia precisa distinguir:

* testes rápidos e isolados;
* testes com dependências reais;
* testes no navegador;
* testes de contratos;
* testes de segurança;
* testes de acessibilidade;
* avaliações de IA.

---

## 3. Problema

Qual estratégia e conjunto de ferramentas deverão ser adotados para validar o RouteBook de forma:

* rápida;
* confiável;
* reproduzível;
* próxima da execução real;
* adequada ao monólito modular;
* integrada ao Turborepo;
* compatível com PostgreSQL e PostGIS;
* compatível com Next.js;
* adequada ao isolamento multi-tenant;
* capaz de testar IA sem depender exclusivamente de outputs exatos;
* sustentável para um projeto inicialmente pequeno?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. feedback rápido;
2. confiança;
3. isolamento;
4. comportamento observável;
5. dependências reais quando relevante;
6. baixa flakiness;
7. suporte a TypeScript;
8. suporte a React;
9. suporte a Next.js;
10. suporte a PostgreSQL;
11. suporte a PostGIS;
12. suporte a múltiplos navegadores;
13. suporte a dispositivos móveis;
14. acessibilidade;
15. testes cross-account;
16. integração com CI/CD;
17. execução seletiva;
18. diagnóstico de falhas;
19. cobertura de capacidades de IA;
20. manutenção sustentável.

---

## 5. Restrições

A estratégia deverá:

* funcionar no monorepo;
* funcionar com pnpm;
* integrar-se ao Turborepo;
* suportar TypeScript estrito;
* suportar Node.js;
* suportar React e Next.js;
* suportar PostgreSQL real;
* suportar PostGIS;
* permitir execução local;
* permitir execução no CI;
* não depender de serviços externos reais para todos os testes;
* não utilizar mocks como substituto para integração crítica;
* não depender de sleeps fixos;
* não permitir acesso cross-account;
* não exigir cobertura total por end-to-end;
* não tratar cobertura percentual como garantia de qualidade;
* não utilizar outputs probabilísticos exatos como única validação de IA.

---

## 6. Princípio central

O RouteBook adotará testes em camadas, selecionando o menor nível capaz de demonstrar o comportamento necessário com confiança.

```text
regra pura
→ teste unitário

caso de uso
→ teste de aplicação

repository ou adapter
→ teste de integração

componente
→ teste de comportamento

jornada
→ teste end-to-end

capacidade de IA
→ contrato + avaliação
```

---

## 7. Estratégia em camadas

A estratégia será composta por:

1. testes de domínio;
2. testes de aplicação;
3. testes de arquitetura;
4. testes de schemas;
5. testes de componentes;
6. testes de integração;
7. testes de banco;
8. testes de contrato;
9. testes de segurança;
10. testes de acessibilidade;
11. testes end-to-end;
12. testes de inteligência artificial;
13. smoke tests;
14. verificações manuais complementares.

---

## 8. Opções consideradas

### 8.1 Opção A — Jest como ferramenta única

Utilizar Jest para domínio, componentes, integração e parte dos testes de sistema.

#### Benefícios

* grande ecossistema;
* ampla adoção;
* documentação;
* mocks;
* cobertura;
* integração com Testing Library.

#### Limitações

* não substitui testes reais de navegador;
* não resolve provisionamento de dependências;
* configuração ESM e TypeScript pode exigir maior composição;
* ferramenta única criaria falsa uniformidade;
* menor alinhamento com a stack moderna escolhida.

#### Avaliação

Foi rejeitada como test runner principal.

---

### 8.2 Opção B — Vitest para todos os testes, incluindo navegador

Utilizar Vitest para testes unitários, componentes e Browser Mode.

#### Benefícios

* configuração uniforme;
* boa integração com TypeScript;
* API familiar;
* Browser Mode;
* execução rápida;
* menor quantidade de ferramentas.

#### Limitações

* Browser Mode não substitui integralmente jornadas end-to-end completas;
* menor separação entre teste de componente e sistema;
* menor maturidade para determinados fluxos completos;
* necessidades de tracing e múltiplos projetos seriam melhor atendidas pelo Playwright.

#### Avaliação

Vitest será utilizado amplamente, mas não substituirá Playwright no end-to-end.

---

### 8.3 Opção C — Cypress para end-to-end

Utilizar Cypress para jornadas e testes de interface.

#### Benefícios

* experiência interativa;
* debugging visual;
* ampla adoção;
* boa integração com aplicações web;
* conhecimento prévio do responsável pelo projeto.

#### Limitações

* modelo de execução e automação diferente do navegador real em determinados cenários;
* menor alinhamento com a estratégia desejada de múltiplos browsers e contextos;
* Playwright oferece integração mais direta com Chromium, Firefox e WebKit;
* necessidade de escolher uma única ferramenta principal de end-to-end.

#### Avaliação

É uma solução válida, mas Playwright foi considerado mais adequado para a estratégia inicial.

---

### 8.4 Opção D — Playwright para todos os níveis

Utilizar Playwright para componentes, APIs e jornadas.

#### Benefícios

* navegador real;
* auto-waiting;
* tracing;
* múltiplos browsers;
* fixtures;
* testes de API.

#### Limitações

* maior custo para regras puras;
* feedback mais lento;
* infraestrutura desnecessária para domínio;
* risco de excesso de testes end-to-end;
* diagnóstico mais complexo para regras pequenas.

#### Avaliação

Playwright será utilizado para jornadas e browser-level testing, não como ferramenta universal.

---

### 8.5 Opção E — Mocks de banco em todos os testes

Simular repositories e banco sem executar PostgreSQL.

#### Benefícios

* velocidade;
* setup simples;
* testes determinísticos;
* menor dependência de Docker.

#### Limitações

* não valida SQL;
* não valida migrations;
* não valida constraints;
* não valida transações;
* não valida PostGIS;
* não valida comportamento real do driver;
* oferece confiança insuficiente.

#### Avaliação

Foi rejeitada para testes de persistência.

---

### 8.6 Opção F — Vitest, Testing Library, Playwright e Testcontainers

Utilizar ferramentas especializadas por responsabilidade.

#### Benefícios

* testes rápidos para domínio;
* testes comportamentais de componentes;
* navegador real;
* múltiplos browsers;
* PostgreSQL real;
* PostGIS real;
* diagnóstico adequado;
* boa integração com TypeScript;
* separação clara de níveis.

#### Limitações

* mais de uma ferramenta;
* configuração adicional;
* necessidade de convenções;
* maior custo no CI;
* risco de sobreposição;
* necessidade de governar fixtures.

#### Avaliação

Oferece o melhor equilíbrio.

Foi selecionada.

---

## 9. Decisão

O RouteBook adotará:

* **Vitest** para testes unitários, aplicação, schemas, arquitetura e integrações que não exijam navegador real;
* **Testing Library** para testes de componentes React orientados ao comportamento do usuário;
* **Playwright** para testes end-to-end, browser-level, responsividade e jornadas críticas;
* **Testcontainers for Node.js** para PostgreSQL, PostGIS e dependências reais descartáveis;
* **mocks e fakes controlados** para ports e Providers externos;
* **evaluations próprias** para capacidades probabilísticas de IA;
* **testes manuais complementares** para áreas que não possam ser totalmente automatizadas.

---

## 10. Escopo da decisão

Esta decisão define:

* ferramentas principais;
* níveis de teste;
* papel de mocks;
* testes de banco;
* testes de componentes;
* testes end-to-end;
* testes cross-account;
* testes de acessibilidade;
* testes de IA;
* execução local e no CI;
* tratamento de flakiness;
* cobertura.

Esta decisão não define:

* ferramenta final de visual regression;
* plataforma externa de testes;
* solução de device farm;
* ferramenta final de mutation testing;
* solução de performance testing;
* ferramenta final de evaluations de IA;
* política completa de testes manuais;
* SLOs de performance.

---

## 11. Testes de domínio

Testes de domínio deverão validar:

* entidades;
* Value Objects;
* aggregates;
* invariantes;
* policies puras;
* transições de estado;
* domain events;
* resultados.

Eles deverão:

* executar sem banco;
* executar sem rede;
* executar sem Next.js;
* executar rapidamente;
* evitar mocks quando não necessários.

---

## 12. Exemplos de testes de domínio

Casos iniciais:

* intervalo válido de uma Trip;
* Activity dentro dos limites da viagem;
* conflito entre Activities;
* mudança de estado de Planning Conflict;
* aceitação parcial de Itinerary Proposal;
* construção de distância;
* moeda e valor;
* janela de horário;
* invariantes de Account Membership.

---

## 13. Terminologia canônica nos testes

Testes deverão utilizar nomes canônicos.

Exemplos corretos:

* `PlanningConflictId`;
* `ItineraryProposalId`;
* `RecommendationId`;
* `ActivityId`;
* `AcceptItineraryProposalPartially`;
* `PlanningConflictPartiallyResolved`, quando canonicamente definido;
* `ItineraryProposalPartiallyAccepted`.

Exemplos genéricos deverão ser evitados:

* `ConflictId`;
* `ProposalId`;
* `ItemId`;
* `ProfileId`.

---

## 14. Testes de aplicação

Testes de aplicação deverão validar casos de uso e orquestrações.

Eles poderão utilizar:

* repositories fake;
* clock fake;
* ID generator fake;
* Provider fake;
* event publisher fake;
* authorization fake controlado.

Deverão validar:

* input;
* autorização;
* execução;
* estado;
* eventos;
* erros;
* efeitos esperados.

---

## 15. Casos de uso prioritários

Deverão possuir testes, conforme implementação:

* criar Trip;
* atualizar Trip;
* definir hospedagem;
* adicionar Activity;
* mover Activity;
* salvar Place;
* gerar Recommendation;
* descartar Recommendation;
* resolver Planning Conflict;
* ignorar risco;
* restaurar risco ignorado;
* aceitar Itinerary Proposal;
* aceitar Itinerary Proposal parcialmente;
* rejeitar Itinerary Proposal.

---

## 16. Testes de arquitetura

Testes de arquitetura deverão detectar:

* dependências proibidas;
* imports cross-module;
* domínio dependente de infraestrutura;
* interface acessando banco diretamente;
* schemas Drizzle fora de adapters;
* Better Auth fora de Identity and Access;
* Zod usado como modelo de domínio;
* Client Components importando código server-only;
* dependências circulares;
* packages importando aplicações.

---

## 17. Ferramentas de arquitetura

As regras poderão ser implementadas com:

* verificadores de imports;
* lint rules;
* análise do grafo;
* testes Vitest;
* scripts específicos;
* ferramentas especializadas aprovadas.

A escolha da ferramenta deverá preservar mensagens acionáveis.

---

## 18. Testes de schemas

Schemas Zod deverão ser testados com Vitest.

Casos:

* valor válido;
* campo ausente;
* campo extra;
* tipo incorreto;
* limite;
* enum inválido;
* transformação;
* refinement;
* JSON Schema;
* erro sanitizado.

---

## 19. Testes de contratos

Contratos deverão ser validados entre:

* interface e aplicação;
* módulo produtor e consumidor;
* API e cliente;
* evento e consumidor;
* Tool e agente;
* Provider e adapter;
* Structured Output e aplicação.

---

## 20. Contract fixtures

Fixtures de contrato deverão:

* possuir versão;
* ser pequenas;
* ser representativas;
* evitar dados pessoais reais;
* incluir casos válidos e inválidos;
* permanecer próximas ao contrato owner.

---

## 21. Testes de componentes

Testing Library será utilizada para componentes React.

Os testes deverão observar:

* texto;
* papéis semânticos;
* labels;
* estados visíveis;
* foco;
* eventos;
* resultados;
* acessibilidade.

Eles não deverão depender excessivamente de:

* classes CSS;
* estrutura interna;
* nomes de métodos;
* hooks internos;
* state privado;
* árvore de implementação.

---

## 22. Prioridade de queries

Queries deverão preferir, conforme aplicável:

1. `getByRole`;
2. `getByLabelText`;
3. `getByPlaceholderText`;
4. `getByText`;
5. `getByDisplayValue`;
6. `getByAltText`;
7. `getByTitle`;
8. `getByTestId`.

`data-testid` deverá ser utilizado quando não houver seletor semântico adequado.

---

## 23. User Event

Interações deverão preferir abstrações próximas ao uso real.

Exemplos:

* clicar;
* digitar;
* selecionar;
* navegar por teclado;
* enviar formulário;
* limpar campo.

Disparos de eventos de baixo nível deverão ser evitados quando houver operação equivalente de usuário.

---

## 24. Componentes server-side

Server Components e composição do App Router deverão ser testados principalmente por:

* casos de uso;
* contratos;
* testes de integração;
* Playwright;
* comportamento renderizado.

Detalhes internos instáveis do framework não deverão dominar a estratégia.

---

## 25. Componentes client-side

Client Components deverão possuir testes quando contiverem:

* estado;
* eventos;
* mapas;
* formulários;
* drag and drop;
* atualizações otimistas;
* modais;
* navegação;
* filtros.

---

## 26. Ambiente DOM simulado

Vitest poderá utilizar ambiente DOM simulado para componentes que não exigem APIs completas de navegador.

O ambiente deverá ser escolhido conforme:

* compatibilidade;
* comportamento necessário;
* desempenho;
* bibliotecas utilizadas.

Ele não substituirá Playwright quando o navegador real for relevante.

---

## 27. Browser Mode

Vitest Browser Mode poderá ser avaliado para componentes que exijam comportamento real de navegador sem constituir uma jornada end-to-end.

Sua adoção deverá evitar sobreposição desnecessária com Playwright.

Não será obrigatório na implementação inicial.

---

## 28. Testes de integração

Testes de integração deverão validar a colaboração entre componentes reais.

Exemplos:

* repository e PostgreSQL;
* Drizzle e migrations;
* Better Auth e sessão;
* Zod e Route Handler;
* adapter e Provider fake server;
* outbox e banco;
* autorização e repository;
* PostGIS e query geográfica.

---

## 29. Testcontainers

Testcontainers será utilizado para dependências reais descartáveis.

Casos iniciais:

* PostgreSQL;
* PostGIS;
* serviços adicionais quando necessários.

O container deverá:

* usar versão fixada;
* iniciar isoladamente;
* aplicar migrations;
* executar seeds;
* ser encerrado;
* produzir logs em falhas.

---

## 30. PostgreSQL de teste

Testes de persistência deverão utilizar PostgreSQL compatível com produção.

Não deverão substituir PostgreSQL por banco em memória quando precisarem validar:

* SQL;
* constraints;
* locks;
* tipos;
* transações;
* migrations;
* extensões;
* planos;
* comportamento do driver.

---

## 31. PostGIS de teste

Testes geoespaciais deverão executar com PostGIS real.

Casos:

* habilitação da extensão;
* persistência de Point;
* SRID;
* distância;
* raio;
* ordenação por proximidade;
* índice espacial;
* coordenadas inválidas;
* hemisférios;
* pontos coincidentes.

---

## 32. Migrations nos testes

O banco de teste deverá ser criado preferencialmente a partir das migrations canônicas.

Fluxo:

```text
iniciar container
→ habilitar extensões pelas migrations
→ aplicar migrations
→ executar seeds
→ executar testes
```

Criar tabelas manualmente no setup de teste deverá ser evitado quando isso puder divergir da produção.

---

## 33. Isolamento do banco

A estratégia poderá utilizar:

* container por suíte;
* banco por worker;
* schema por teste;
* transação com rollback;
* snapshot controlado.

A escolha deverá equilibrar:

* isolamento;
* velocidade;
* paralelismo;
* compatibilidade com migrations;
* comportamento real.

---

## 34. Limpeza de dados

Os testes não deverão depender da ordem de execução.

Cada teste deverá:

* criar seus dados;
* identificar seu escopo;
* limpar ou descartar o ambiente;
* evitar registros globais mutáveis;
* não reutilizar dados de outro teste sem contrato explícito.

---

## 35. Builders e factories

Builders poderão criar objetos válidos com defaults explícitos.

Exemplo conceitual:

```typescript
const trip = TripBuilder.create()
  .forAccount(accountId)
  .withDestination("Pipa")
  .build();
```

Builders não deverão ocultar dados importantes para o comportamento testado.

---

## 36. Fixtures sintéticas

Fixtures deverão:

* ser sintéticas;
* evitar nomes e dados reais;
* representar diferentes Accounts;
* representar fusos;
* representar coordenadas;
* representar estados;
* ser determinísticas.

---

## 37. Mocks

Mocks deverão ser utilizados principalmente em fronteiras como:

* Provider de IA;
* mapas;
* geocoding;
* e-mail;
* storage;
* clock;
* geração de IDs;
* observabilidade;
* serviços indisponíveis.

---

## 38. O que não deverá ser excessivamente mockado

Deverá ser evitado mockar em testes de integração:

* PostgreSQL;
* PostGIS;
* Drizzle;
* migrations;
* Zod;
* autorização;
* serialização;
* Route Handler completo;
* sessão quando o objetivo for testar autenticação real.

---

## 39. Fakes

Fakes deverão possuir comportamento suficiente para o teste, sem tentar reimplementar integralmente a dependência real.

Um fake não deverá se tornar mais complexo que o adapter original.

---

## 40. Spies

Spies deverão ser utilizados para verificar efeitos relevantes, como:

* evento publicado;
* Provider chamado;
* auditoria registrada;
* Tool executada;
* notificação solicitada.

Não deverão ser utilizados para acoplar o teste a toda a sequência interna de métodos.

---

## 41. End-to-end com Playwright

Playwright será utilizado para jornadas críticas da aplicação.

Os testes deverão executar contra:

* aplicação em execução;
* banco isolado;
* autenticação controlada;
* dados sintéticos;
* browser real.

---

## 42. Navegadores

O baseline deverá contemplar:

* Chromium;
* Firefox;
* WebKit.

A frequência poderá variar:

* Chromium em pull requests;
* matriz completa em branch principal ou execução programada;
* browsers adicionais conforme risco.

A estratégia final deverá considerar custo e tempo de execução.

---

## 43. Dispositivos móveis

Testes deverão cobrir viewports e interações móveis relevantes.

Casos:

* navegação;
* cards;
* filtros;
* mapa;
* criação de Trip;
* timeline;
* formulários;
* modais;
* ações de proposta.

A emulação não substitui integralmente testes em dispositivos reais, mas fornece cobertura inicial.

---

## 44. Geolocalização

Playwright poderá simular:

* coordenadas;
* permission;
* timezone;
* locale.

Casos:

* localização permitida;
* localização negada;
* localização indisponível;
* usuário longe do destino;
* usuário em Pipa;
* timezone diferente.

---

## 45. Locators

Locators deverão priorizar:

* role;
* label;
* texto;
* placeholder;
* test id estável quando necessário.

Seletores frágeis baseados em:

* posição;
* classes geradas;
* estrutura profunda;
* XPath complexo;

deverão ser evitados.

---

## 46. Auto-waiting

Testes Playwright deverão utilizar:

* locators;
* assertions com retry;
* estados observáveis;
* espera por respostas específicas quando necessário.

Deverão evitar:

```text
sleep
wait fixo
retry manual sem causa
```

---

## 47. Tracing

Falhas no CI deverão produzir, conforme configuração:

* trace;
* screenshot;
* vídeo quando útil;
* logs;
* informações do browser;
* console;
* requests relevantes.

Artefatos deverão respeitar privacidade e retenção.

---

## 48. Jornadas end-to-end prioritárias

### Jornada 1 — Autenticação

1. iniciar login;
2. concluir autenticação controlada;
3. provisionar User;
4. provisionar Account;
5. acessar área privada;
6. realizar logout.

### Jornada 2 — Criar Trip

1. acessar criação;
2. informar destino;
3. informar datas;
4. salvar;
5. visualizar Trip.

### Jornada 3 — Planejar Activity

1. abrir Trip;
2. selecionar Place;
3. adicionar Activity;
4. definir data e horário;
5. visualizar na timeline.

### Jornada 4 — Planning Conflict

1. criar condição conflitante;
2. visualizar conflito;
3. ignorar risco;
4. restaurar risco ignorado;
5. resolver conflito.

### Jornada 5 — Itinerary Proposal

1. visualizar proposta;
2. revisar itens;
3. aceitar parcialmente;
4. confirmar;
5. verificar alteração no itinerário.

---

## 49. Testes cross-account

Testes cross-account são obrigatórios.

Cenários:

* User A não lê Trip B;
* User A não altera Activity B;
* User A não acessa Recommendation B;
* User A não resolve Planning Conflict B;
* User A não aceita Itinerary Proposal B;
* Account ativa manipulada não concede acesso;
* identificador válido de outro tenant não concede acesso;
* Tool não acessa outra Account.

---

## 50. Autenticação nos testes

A estratégia deverá distinguir:

* testes reais do fluxo de autenticação;
* autenticação controlada para demais jornadas;
* sessão seedada ou fixture autorizada;
* Provider externo simulado.

A maioria dos testes end-to-end não deverá depender de um Provider OAuth real.

---

## 51. Testes de Better Auth

Integrações deverão cobrir:

* sessão criada;
* sessão válida;
* sessão expirada;
* sessão revogada;
* logout;
* membership suspensa;
* User sem Account;
* callback inválido;
* linking quando implementado.

---

## 52. Testes de autorização

Deverão validar:

* negação por padrão;
* Owner;
* Member;
* Viewer;
* permission ausente;
* recurso incorreto;
* estado proibido;
* delegação expirada;
* Tool não autorizada;
* capability não autorizada.

---

## 53. Testes de segurança

Testes automatizados deverão incluir, conforme aplicável:

* IDOR;
* acesso cross-account;
* open redirect;
* CSRF;
* session fixation;
* cookies;
* headers;
* validação de input;
* campos extras;
* SQL injection;
* Tool injection;
* uploads;
* rate limiting;
* secrets no bundle;
* dados sensíveis em logs.

---

## 54. Testes de acessibilidade

A estratégia deverá combinar:

* queries semânticas;
* navegação por teclado;
* foco;
* landmarks;
* labels;
* mensagens;
* contraste automatizado quando possível;
* verificações manuais.

Automação não será considerada cobertura completa de acessibilidade.

---

## 55. Acessibilidade em componentes

Testes de componentes deverão verificar:

* nome acessível;
* role;
* label;
* foco;
* estado disabled;
* mensagem de erro;
* `aria` quando necessário;
* comportamento por teclado.

---

## 56. Acessibilidade end-to-end

Jornadas deverão verificar:

* ordem de foco;
* abertura e fechamento de modal;
* retorno de foco;
* navegação sem mouse;
* skip links quando aplicáveis;
* título da página;
* anúncios de erro;
* mapa com alternativa em lista.

---

## 57. Visual regression

Visual regression poderá ser adotada futuramente para:

* componentes estáveis;
* layouts críticos;
* responsividade;
* mapas simulados;
* Design System.

Ela não será obrigatória na primeira implementação.

Snapshots visuais deverão possuir revisão humana.

---

## 58. Snapshots de código

Snapshots textuais deverão ser utilizados com cautela.

Não deverão substituir assertions semânticas.

Snapshots grandes e atualizados sem revisão deverão ser evitados.

---

## 59. Testes de API

Route Handlers deverão ser testados para:

* método;
* input;
* autenticação;
* autorização;
* status;
* body;
* headers;
* erros;
* idempotência;
* rate limits quando aplicáveis.

---

## 60. Testes de Server Functions

Deverão validar:

* input externo;
* sessão;
* Account;
* autorização;
* command;
* resultado;
* invalidação;
* erro;
* auditoria.

---

## 61. Testes de eventos

Eventos deverão validar:

* envelope;
* eventType;
* versão;
* Account;
* payload;
* correlationId;
* causationId;
* idempotência;
* compatibilidade.

---

## 62. Testes de outbox

Quando implementada, a outbox deverá validar:

* alteração canônica e evento na mesma transação;
* publicação;
* retry;
* duplicidade;
* idempotência;
* falha;
* retomada.

---

## 63. Testes de jobs

Jobs deverão validar:

* schedule quando aplicável;
* idempotência;
* retry;
* timeout;
* checkpoint;
* Account;
* logs;
* retomada;
* processamento em lote.

---

## 64. Testes de Providers

Adapters deverão possuir contract tests com:

* respostas válidas;
* campos ausentes;
* erro;
* timeout;
* rate limit;
* payload divergente;
* autenticação falha;
* retry;
* fallback.

Chamadas reais deverão ser executadas apenas em testes controlados e não como requisito de toda pull request.

---

## 65. Service virtualization

Providers poderão ser simulados por:

* servidor HTTP local;
* fixtures;
* adapters fake;
* interceptação de rede;
* sandbox oficial.

O mock deverá reproduzir contratos relevantes, não detalhes arbitrários.

---

## 66. Testes de mapas

Deverão separar:

* lógica geoespacial;
* adapter do Provider;
* componente visual;
* interação;
* fallback em lista.

A presença de um canvas ou mapa renderizado não deverá ser a única evidência de funcionalidade.

---

## 67. Testes de inteligência artificial

Capacidades de IA deverão possuir três níveis:

1. testes determinísticos;
2. testes de contrato;
3. evaluations probabilísticas.

---

## 68. Testes determinísticos de IA

Deverão cobrir:

* Context Builder;
* seleção de dados;
* redaction;
* Tool Registry;
* autorização;
* limites;
* parsing;
* Structured Output;
* fallback;
* versionamento;
* Provenance.

Esses testes não deverão chamar modelos reais.

---

## 69. Testes de contrato de IA

Deverão validar:

* request ao Provider;
* schema;
* modelo;
* parâmetros;
* resposta;
* erro;
* timeout;
* rate limit;
* fallback;
* custo;
* tracing.

Poderão utilizar adapter simulado ou servidor fake.

---

## 70. Evaluations

Evaluations deverão verificar qualidade do comportamento probabilístico.

Critérios possíveis:

* relevância;
* factualidade;
* adequação ao contexto;
* segurança;
* aderência ao schema;
* utilidade;
* respeito a restrições;
* consistência;
* ausência de ações silenciosas.

---

## 71. Datasets de avaliação

Datasets deverão:

* possuir versão;
* ser sintéticos ou autorizados;
* representar cenários;
* incluir casos difíceis;
* incluir falhas de Provider;
* incluir preferências;
* incluir restrições;
* incluir diferentes Trips;
* evitar dados pessoais reais.

---

## 72. Casos de avaliação do RouteBook

Cenários iniciais:

* manhã de chuva em Pipa;
* usuário hospedado no Solar Água;
* orçamento limitado;
* preferência por praia;
* grupo de três adultos;
* Activity conflitante;
* restaurante fechado;
* deslocamento inviável;
* Place distante;
* proposta parcialmente aceitável.

---

## 73. Oráculos de IA

Não deverá ser exigido texto exato como único oráculo.

Poderão ser utilizados:

* schema;
* regras determinísticas;
* assertions por campo;
* rubricas;
* comparação com conjunto permitido;
* revisão humana;
* avaliação por modelo com controle;
* métricas.

---

## 74. Model-as-judge

Avaliação por modelo poderá ser utilizada como sinal complementar.

Ela deverá possuir:

* modelo fixado;
* prompt versionado;
* rubrica;
* temperatura controlada;
* repetição quando necessária;
* calibração;
* amostras revisadas por humanos.

Não deverá ser a única evidência para decisões críticas.

---

## 75. Flakiness em IA

Variação probabilística não deverá ser confundida automaticamente com flakiness de infraestrutura.

A evaluation deverá definir:

* tolerância;
* amostragem;
* critérios;
* distribuição;
* baseline;
* regressão.

---

## 76. Testes de Tools

Cada Tool deverá possuir testes para:

* input;
* output;
* autorização;
* Account;
* timeout;
* idempotência;
* efeitos;
* erro;
* logs;
* tentativa de ação fora da allowlist.

---

## 77. Testes de delegação

Deverão verificar:

* agente não amplia permissão;
* delegação expirada é rejeitada;
* capability incorreta é rejeitada;
* Tool não autorizada é rejeitada;
* Account incorreta é rejeitada;
* operação read-only não executa mutação.

---

## 78. Smoke tests

Após deployment deverão executar smoke tests mínimos.

Exemplos:

* aplicação responde;
* página pública carrega;
* login inicia;
* sessão controlada funciona;
* banco responde;
* rota principal de Trip responde;
* health check está saudável.

Smoke tests não deverão alterar dados críticos sem estratégia de isolamento.

---

## 79. Testes de produção

Testes em produção deverão ser limitados a verificações seguras.

Poderão utilizar:

* conta sintética;
* recursos isolados;
* read-only checks;
* cleanup;
* identificadores específicos.

Não deverão utilizar dados reais de usuários.

---

## 80. Testes de performance

Testes de performance não serão responsabilidade principal desta decisão, mas deverão ser adicionados quando houver risco.

Áreas prioritárias:

* carregamento da Trip;
* lista de Places;
* consultas geográficas;
* timeline;
* Recommendations;
* Structured Outputs;
* banco;
* filas.

---

## 81. Cobertura

Cobertura deverá ser utilizada como indicador, não como objetivo isolado.

Deverão ser observados:

* linhas;
* branches;
* funções;
* statements;
* módulos críticos;
* casos de uso;
* policies;
* schemas.

Um teste sem assertions relevantes poderá aumentar cobertura sem aumentar confiança.

---

## 82. Baseline de cobertura

O projeto poderá definir thresholds progressivos.

A prioridade inicial deverá ser:

* domínio;
* autorização;
* casos de uso críticos;
* schemas;
* repositories;
* Tools.

Thresholds não deverão incentivar testes de baixo valor.

---

## 83. Mutation testing

Mutation testing poderá ser adotado futuramente para módulos críticos, como:

* autorização;
* políticas;
* conflitos;
* propostas;
* cálculos;
* Value Objects.

Não será obrigatório no MVP.

---

## 84. Flaky tests

Teste flaky será considerado defeito.

Não deverá ser tratado permanentemente por:

* aumentar timeout;
* adicionar sleep;
* repetir indefinidamente;
* ignorar falha;
* marcar como instável sem owner.

---

## 85. Tratamento de flakiness

O processo deverá:

1. identificar;
2. registrar;
3. classificar;
4. reproduzir;
5. corrigir;
6. verificar;
7. remover quarentena.

Quarentena deverá ser temporária e possuir owner.

---

## 86. Fontes comuns de flakiness

* tempo;
* timezone;
* aleatoriedade;
* dados compartilhados;
* ordem;
* rede;
* animação;
* debounce;
* concorrência;
* dependência externa;
* selectors frágeis;
* limpeza incompleta.

---

## 87. Controle de tempo

Testes deverão utilizar clock controlado quando o tempo fizer parte do comportamento.

Casos:

* expiração de sessão;
* datas da Trip;
* horários de Activities;
* convites;
* delegações;
* cache;
* retry.

---

## 88. Timezone

O projeto deverá testar diferentes timezones.

Cenários:

* usuário em São Paulo;
* destino em Pipa;
* execução do CI em UTC;
* mudança de data civil;
* horário próximo da meia-noite.

---

## 89. Aleatoriedade

Dados aleatórios deverão utilizar seed quando a reprodução for necessária.

Falhas deverão registrar a seed.

---

## 90. Paralelismo

Testes poderão executar em paralelo quando:

* dados forem isolados;
* portas não colidirem;
* containers forem controlados;
* recursos não forem globais;
* migrations suportarem a estratégia.

---

## 91. Sequenciamento

Testes não deverão depender de sequência.

Suites serializadas deverão possuir justificativa, especialmente quando envolverem:

* migrations;
* banco compartilhado;
* fluxo end-to-end único;
* recurso externo limitado.

---

## 92. Organização dos arquivos

Estrutura conceitual:

```text
apps/web/
├── src/
│   └── modules/
│       └── trip-management/
│           ├── domain/
│           ├── application/
│           ├── adapters/
│           └── tests/
├── tests/
│   ├── integration/
│   ├── contract/
│   └── e2e/
└── playwright.config.ts
```

A estrutura final poderá manter testes próximos ao código ou em diretórios dedicados conforme o nível.

---

## 93. Nomenclatura

Arquivos poderão utilizar:

```text
*.test.ts
*.test.tsx
*.integration.test.ts
*.contract.test.ts
*.architecture.test.ts
*.e2e.spec.ts
```

A convenção deverá permitir filtros claros.

---

## 94. Projetos Vitest

Vitest poderá utilizar projects separados para:

* unit;
* component;
* integration;
* contract;
* architecture.

Cada projeto poderá possuir:

* ambiente;
* setup;
* timeout;
* cobertura;
* include;
* exclude.

---

## 95. Configuração conceitual do Vitest

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "vitest.unit.config.ts",
      "vitest.component.config.ts",
      "vitest.integration.config.ts",
    ],
  },
});
```

A configuração final deverá utilizar APIs estáveis da versão fixada.

---

## 96. Configuração conceitual do Playwright

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: devices["Desktop Chrome"],
    },
    {
      name: "firefox",
      use: devices["Desktop Firefox"],
    },
    {
      name: "webkit",
      use: devices["Desktop Safari"],
    },
  ],
});
```

---

## 97. Turborepo

Tarefas poderão incluir:

```text
test
test:unit
test:component
test:integration
test:contract
test:e2e
test:architecture
test:ai
```

A configuração deverá declarar corretamente:

* dependências;
* inputs;
* outputs;
* cache;
* ambiente.

---

## 98. Cache de testes

Testes determinísticos poderão utilizar cache.

Testes não deverão ser cacheados quando dependerem de:

* tempo real;
* Provider externo;
* modelo real;
* ambiente mutável;
* produção;
* dados não versionados.

---

## 99. Execução em pull request

Baseline sugerido:

* documentação;
* lint;
* typecheck;
* unit;
* architecture;
* schemas;
* components;
* integração crítica;
* Chromium end-to-end crítico;
* segurança.

---

## 100. Execução na branch principal

Poderá incluir:

* matriz completa de integração;
* Chromium;
* Firefox;
* WebKit;
* acessibilidade;
* migrations;
* PostGIS;
* contract tests;
* evaluations controladas;
* relatórios.

---

## 101. Execução programada

Poderá incluir:

* suíte extensa;
* Providers sandbox;
* múltiplos browsers;
* regressão visual;
* evaluations com modelos reais;
* dependency checks;
* performance;
* restore tests específicos.

---

## 102. Pull requests de forks

Testes não deverão receber secrets de produção.

Suites que exigirem secrets deverão:

* usar fakes;
* usar ambientes isolados;
* não executar;
* ou aguardar aprovação segura.

---

## 103. Artefatos de teste

Poderão ser armazenados:

* cobertura;
* relatórios;
* traces;
* screenshots;
* vídeos;
* logs;
* resultados de evaluations.

Deverão possuir:

* retenção;
* acesso;
* redaction;
* limite de tamanho;
* proteção de dados.

---

## 104. Relatórios

Relatórios deverão permitir identificar:

* teste;
* nível;
* duração;
* tentativa;
* falha;
* stack;
* artefatos;
* ambiente;
* commit;
* browser;
* seed.

---

## 105. Observabilidade de testes

Poderão ser acompanhados:

* duração;
* flakiness;
* falhas;
* retries;
* cobertura;
* tempo de container;
* cache hit;
* custo;
* testes lentos;
* testes em quarentena.

---

## 106. Quality gates

Gates iniciais:

* nenhum teste crítico falho;
* nenhum teste cross-account falho;
* migrations válidas;
* schemas válidos;
* arquitetura válida;
* smoke tests aprovados;
* ausência de flakiness conhecida não tratada em fluxo crítico.

---

## 107. Testes lentos

Testes lentos deverão ser identificados.

Possíveis ações:

* reduzir setup;
* compartilhar container com isolamento;
* executar seletivamente;
* paralelizar;
* mover para execução programada;
* corrigir espera inadequada.

Eles não deverão ser removidos apenas por serem lentos quando fornecerem confiança necessária.

---

## 108. Responsabilidade dos testes

Cada teste deverá possuir owner implícito pelo módulo ou explícito quando transversal.

Suites sem owner tendem a degradar.

---

## 109. Desenvolvimento assistido por IA

Agentes poderão apoiar:

* geração de cenários;
* implementação de testes;
* análise de gaps;
* criação de fixtures;
* identificação de casos negativos;
* triagem de falhas.

---

## 110. Limites para agentes

Agentes não poderão autonomamente:

* remover teste falho;
* alterar assertion para aceitar comportamento incorreto;
* aumentar timeout sem análise;
* adicionar retry permanente;
* atualizar snapshot em massa;
* excluir teste cross-account;
* mockar dependência crítica;
* ignorar falha de migration;
* reduzir cobertura crítica;
* aprovar evaluation.

---

## 111. Revisão de testes gerados por IA

Deverá avaliar:

* comportamento comprovado;
* assertions;
* nível correto;
* dados;
* isolamento;
* flakiness;
* mocks;
* terminologia;
* casos negativos;
* legibilidade;
* manutenção.

---

## 112. Consequências positivas

A decisão proporciona:

* feedback rápido;
* cobertura em camadas;
* navegador real;
* banco real;
* PostGIS real;
* melhor diagnóstico;
* testes comportamentais;
* proteção multi-tenant;
* cobertura de IA;
* integração com a stack;
* evolução progressiva.

---

## 113. Consequências negativas

A decisão introduz:

* múltiplas ferramentas;
* maior configuração;
* necessidade de Docker;
* maior custo no CI;
* manutenção de fixtures;
* possibilidade de sobreposição;
* necessidade de governar flakiness;
* necessidade de separar evaluations de testes determinísticos.

---

## 114. Riscos

### 114.1 Excesso de testes end-to-end

Mitigações:

* pirâmide em camadas;
* domínio e aplicação testados abaixo;
* jornadas críticas selecionadas.

### 114.2 Mocks irreais

Mitigações:

* contract tests;
* Testcontainers;
* sandbox controlado;
* fixtures versionadas.

### 114.3 Flakiness

Mitigações:

* auto-waiting;
* isolamento;
* clock;
* seed;
* ausência de sleeps;
* tracing.

### 114.4 Testes lentos

Mitigações:

* filtros;
* cache;
* paralelismo;
* níveis;
* execução programada.

### 114.5 Banco divergente

Mitigações:

* PostgreSQL real;
* PostGIS;
* migrations;
* versões fixadas.

### 114.6 Cobertura sem valor

Mitigações:

* foco em comportamentos;
* branches críticos;
* revisão;
* mutation testing futuro.

### 114.7 Testes de IA frágeis

Mitigações:

* separar contrato e evaluation;
* rubricas;
* datasets;
* tolerância;
* revisão humana.

### 114.8 Dados sensíveis em artefatos

Mitigações:

* dados sintéticos;
* redaction;
* retenção;
* acesso controlado.

---

## 115. Controles

Deverão ser implementados:

* Vitest;
* Testing Library;
* Playwright;
* Testcontainers;
* versões fixadas;
* testes cross-account;
* migrations em CI;
* PostgreSQL real;
* PostGIS real;
* tracing em falhas;
* fixtures sintéticas;
* controle de tempo;
* proibição de sleeps fixos;
* quarentena temporária;
* relatórios;
* quality gates.

---

## 116. Estratégia de implementação

### Etapa 1 — Vitest

* adicionar dependência;
* configurar unit;
* configurar coverage;
* criar primeiro teste de domínio;
* integrar ao Turborepo.

### Etapa 2 — Testing Library

* configurar ambiente;
* adicionar helpers;
* criar teste de formulário;
* validar acessibilidade semântica.

### Etapa 3 — Testcontainers

* criar PostgreSQL com PostGIS;
* aplicar migrations;
* criar teste de repository;
* validar consulta geográfica.

### Etapa 4 — Playwright

* configurar browsers;
* criar web server;
* criar autenticação controlada;
* implementar jornada de criação de Trip.

### Etapa 5 — Segurança

* adicionar testes cross-account;
* adicionar papéis;
* adicionar sessão revogada;
* adicionar input inválido.

### Etapa 6 — IA

* testar Context Builder;
* testar Structured Output;
* testar Tool;
* criar dataset inicial;
* criar evaluation.

### Etapa 7 — CI/CD

* distribuir suites;
* publicar artefatos;
* configurar matriz;
* medir duração;
* adicionar gates.

---

## 117. Critérios de implementação concluída

A decisão estará implementada quando:

* Vitest estiver configurado;
* Testing Library estiver configurada;
* Playwright estiver configurado;
* Testcontainers estiver configurado;
* PostgreSQL com PostGIS executar nos testes;
* migrations forem aplicadas;
* primeiro teste de domínio existir;
* primeiro teste de aplicação existir;
* primeiro teste de componente existir;
* primeiro teste de repository existir;
* primeiro teste end-to-end existir;
* primeiro teste cross-account existir;
* primeiro teste de Tool existir;
* pipeline executar as suites definidas.

---

## 118. Verificação

A verificação deverá incluir:

* clone limpo;
* instalação;
* unit;
* component;
* integration;
* migrations;
* PostGIS;
* contract;
* architecture;
* end-to-end;
* múltiplos browsers;
* cross-account;
* acessibilidade;
* Tool;
* Structured Output;
* relatório;
* artefato de falha.

---

## 119. Métricas

Poderão ser acompanhadas:

* duração por suíte;
* taxa de falha;
* flakiness;
* retries;
* cobertura;
* tempo de container;
* testes lentos;
* jornadas críticas cobertas;
* módulos sem testes;
* policies sem teste;
* Tools sem teste;
* avaliações de IA;
* custo do CI.

---

## 120. Gatilhos de revisão

A decisão deverá ser revisada quando:

* Vitest não atender requisito central;
* Playwright limitar jornadas relevantes;
* Testcontainers gerar custo operacional desproporcional;
* o tempo de CI se tornar incompatível;
* uma ferramenta deixar de receber manutenção adequada;
* a estratégia apresentar flakiness recorrente;
* novos runtimes exigirem ferramentas distintas;
* uma plataforma externa oferecer benefício comprovado;
* avaliações de IA exigirem infraestrutura especializada.

---

## 121. Estratégia de rollback

A substituição de uma ferramenta deverá ser registrada quando tiver impacto estrutural.

A migração deverá preservar:

* cenários;
* fixtures;
* contratos;
* datasets;
* evidências;
* coverage;
* pipelines;
* quality gates.

Os testes deverão depender prioritariamente de comportamento, reduzindo o acoplamento ao runner.

---

## 122. Decisões derivadas

Deverão ser avaliadas decisões sobre:

* visual regression;
* performance testing;
* load testing;
* mutation testing;
* evaluation framework de IA;
* mocking de rede;
* device farm;
* contract testing externo;
* ambientes efêmeros;
* testes de produção;
* cobertura mínima.

---

## 123. Próxima decisão

O `RB-ADR-011` deverá definir a estratégia de estilização e implementação física do Design System.

A decisão deverá avaliar:

* Tailwind CSS;
* CSS Modules;
* vanilla CSS;
* CSS-in-JS;
* tokens;
* componentes acessíveis;
* Radix Primitives;
* shadcn/ui;
* ownership do Design System;
* integração com Next.js;
* responsividade;
* theming;
* bundle;
* manutenção.

A decisão deverá distinguir:

* tokens;
* primitives;
* componentes;
* padrões;
* features;
* páginas.

---

## 124. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-010
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o novo ADR;
* permanecer disponível;
* preservar o contexto histórico.

---

## 125. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* Vitest está justificado;
* Testing Library está justificada;
* Playwright está justificado;
* Testcontainers está justificado;
* níveis de teste estão definidos;
* domínio está contemplado;
* aplicação está contemplada;
* arquitetura está contemplada;
* schemas estão contemplados;
* componentes estão contemplados;
* PostgreSQL está contemplado;
* PostGIS está contemplado;
* migrations estão contempladas;
* contratos estão contemplados;
* end-to-end está contemplado;
* cross-account está contemplado;
* segurança está contemplada;
* acessibilidade está contemplada;
* IA está contemplada;
* Tools estão contempladas;
* flakiness está governada;
* cobertura está governada;
* CI/CD está definido;
* agentes estão contemplados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* gatilhos de revisão estão definidos;
* supersessão está definida;
* não existem contradições com RB-QA-001;
* não existem contradições com RB-QA-002;
* não existem contradições com RB-ADR-003;
* não existem contradições com RB-ADR-005;
* não existem contradições com RB-ADR-006;
* não existem contradições com RB-ADR-008;
* não existem contradições com RB-ADR-009.

---

## 126. Declaração final

O RouteBook adotará uma estratégia de testes automatizados em camadas utilizando:

* Vitest;
* Testing Library;
* Playwright;
* Testcontainers.

Vitest fornecerá feedback rápido para:

* domínio;
* aplicação;
* schemas;
* contratos;
* arquitetura;
* integrações não navegacionais.

Testing Library validará componentes pelo comportamento percebido pelo usuário.

Playwright validará jornadas completas em navegadores reais.

Testcontainers validará a aplicação contra PostgreSQL, PostGIS e outras dependências reais descartáveis.

Mocks serão utilizados nas fronteiras apropriadas.

Eles não substituirão testes reais de:

* banco;
* migrations;
* constraints;
* PostGIS;
* autenticação;
* autorização;
* contratos críticos.

Testes cross-account serão obrigatórios.

Uma falha de isolamento será tratada como crítica.

Capacidades de inteligência artificial serão testadas por:

* verificações determinísticas;
* contratos;
* evaluations probabilísticas.

A cobertura será utilizada como indicador, não como finalidade.

Testes flaky serão tratados como defeitos.

A estratégia deverá maximizar confiança sem transferir toda a validação para testes end-to-end lentos e frágeis.
