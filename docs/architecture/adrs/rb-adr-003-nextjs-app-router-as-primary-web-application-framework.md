---

id: RB-ADR-003

title: Adoção de Next.js com App Router como Estrutura Principal da Aplicação Web
description: Registra a decisão de adotar Next.js com App Router como framework principal da aplicação web do RouteBook, integrando experiência React, renderização no servidor, rotas de aplicação e endpoints HTTP sem transferir regras de domínio para o framework.

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
- nextjs
- react
- app-router
- web-application
- full-stack
- server-components
- route-handlers
- rendering
- modular-monolith
- typescript
- nodejs
- user-experience
- deployment

related_documents:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
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
- RB-OBS-001
- RB-QA-001
- RB-QA-002
- RB-OPS-001
- RB-SRE-001
- RB-AI-001
- RB-AI-002
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

prerequisites:

- RB-CORE-0004
- RB-PRD-002
- RB-PRD-004
- RB-PRD-006
- RB-PRD-007
- RB-PRD-008
- RB-UX-001
- RB-UX-002
- RB-UX-003
- RB-UX-004
- RB-DS-001
- RB-DS-002
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
- RB-SEC-001
- RB-QA-001
- RB-DEL-001
- RB-DEV-001
- RB-CICD-001
- RB-INFRA-001
- RB-ADR-001
- RB-ADR-002

next_documents:

- RB-ADR-004

ai_context:
priority: critical
index: true
---

# RB-ADR-003 — Adoção de Next.js com App Router como Estrutura Principal da Aplicação Web

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após a aprovação:

* Next.js será o framework principal da aplicação localizada em `apps/web`;
* App Router será o modelo de roteamento adotado;
* React será utilizado para a composição da interface;
* regras de domínio continuarão fora das camadas específicas do framework;
* desvios estruturais deverão ser registrados em novo ADR;
* versões exatas deverão ser fixadas na implementação.

---

## 2. Contexto

O RouteBook é uma aplicação web visual e orientada à decisão.

A experiência deverá combinar:

* mapas;
* cartões de lugares;
* fotografias;
* filtros;
* categorias;
* distâncias;
* tempos de deslocamento;
* itinerários;
* linhas do tempo;
* recomendações;
* Planning Conflicts;
* Itinerary Proposals;
* conteúdo contextual;
* interações responsivas;
* uso antes e durante a viagem.

A base arquitetural já estabeleceu:

* monólito modular como arquitetura inicial;
* TypeScript como linguagem principal;
* Node.js como runtime principal;
* uma aplicação executável em `apps/web`;
* pacotes ou módulos internos com responsabilidades específicas;
* necessidade de deployment simples;
* desenvolvimento assistido por agentes de IA;
* necessidade de preservar contratos e limites de domínio.

Ainda é necessário definir a estrutura principal da aplicação web.

A decisão deverá estabelecer como serão organizados:

* páginas;
* layouts;
* renderização;
* carregamento de dados;
* interatividade no cliente;
* mutações;
* endpoints HTTP;
* integração com módulos internos;
* tratamento de erros;
* autenticação;
* observabilidade;
* assets;
* mapas;
* capacidades de IA.

---

## 3. Problema

Qual estrutura web deverá ser adotada pelo RouteBook para fornecer uma aplicação:

* visual;
* responsiva;
* performática;
* indexável quando necessário;
* adequada a dispositivos móveis;
* compatível com TypeScript e Node.js;
* integrada ao monólito modular;
* capaz de executar lógica no servidor;
* capaz de expor endpoints HTTP;
* simples de implantar;
* sustentável para um projeto inicialmente pequeno;
* evolutiva para capacidades de IA e mapas?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. velocidade de implementação;
2. experiência responsiva;
3. integração com React;
4. suporte a renderização no servidor;
5. suporte a renderização estática;
6. suporte a interatividade no cliente;
7. roteamento estruturado;
8. layouts compartilhados;
9. tratamento de loading e errors;
10. integração com TypeScript;
11. integração com Node.js;
12. suporte a APIs;
13. deployment simples;
14. otimização de assets;
15. suporte a streaming;
16. capacidade de manter regras fora do framework;
17. integração com autenticação;
18. integração com observabilidade;
19. suporte amplo por agentes de IA;
20. ecossistema consolidado.

---

## 5. Restrições

A solução deverá:

* funcionar com TypeScript;
* funcionar sobre Node.js;
* respeitar o monólito modular;
* permitir uso de React;
* suportar telas responsivas;
* suportar mapas interativos;
* permitir integração com Providers;
* permitir rotas públicas e privadas;
* permitir endpoints HTTP;
* permitir testes;
* permitir deployment reproduzível;
* não exigir microservices;
* não acoplar domínio ao framework;
* não permitir acesso direto da interface à persistência;
* não utilizar Server Functions como bypass de autorização;
* não tratar componentes como casos de uso.

---

## 6. Opções consideradas

### 6.1 Opção A — React com Vite e API separada

Criar uma aplicação React renderizada no cliente e uma aplicação backend separada.

#### Benefícios

* separação clara entre frontend e backend;
* build frontend simples;
* ecossistema Vite;
* liberdade de escolha do framework da API;
* deployment independente;
* arquitetura familiar.

#### Limitações

* duas aplicações executáveis desde o início;
* dois fluxos de deployment;
* configuração adicional de CORS;
* duplicação potencial de autenticação e contratos;
* maior complexidade operacional;
* necessidade de implementar SSR separadamente;
* maior distância entre interface e casos de uso;
* menor simplicidade para o MVP.

#### Avaliação

A separação é válida, mas introduz complexidade que ainda não é necessária.

Foi rejeitada como estrutura inicial.

---

### 6.2 Opção B — Next.js com App Router

Utilizar Next.js como framework full-stack da aplicação web, com App Router para páginas, layouts, Server Components, Client Components, Route Handlers e Server Functions controladas.

#### Benefícios

* integração natural com React;
* suporte a renderização no servidor;
* suporte a páginas estáticas e dinâmicas;
* roteamento por arquivos;
* layouts;
* loading states;
* error boundaries;
* streaming;
* Route Handlers;
* otimização de assets;
* uma aplicação principal;
* menor complexidade operacional inicial;
* bom suporte a TypeScript;
* ecossistema amplo;
* compatibilidade com deployment em diferentes ambientes;
* boa base para Progressive Enhancement.

#### Limitações

* forte influência das convenções do framework;
* risco de acoplamento entre interface e aplicação;
* risco de regras em Server Actions;
* complexidade de cache e renderização;
* necessidade de distinguir Server e Client Components;
* mudanças frequentes no ecossistema;
* possibilidade de dependência excessiva do Provider mais comum;
* necessidade de atualização rápida em vulnerabilidades do framework ou React.

#### Avaliação

Oferece o melhor equilíbrio para o RouteBook no estágio atual.

Foi selecionada.

---

### 6.3 Opção C — Remix ou React Router em modo framework

Utilizar uma estrutura React orientada a rotas, loaders, actions e padrões web.

#### Benefícios

* uso forte das APIs da Web;
* bom modelo de formulários;
* carregamento por rota;
* Progressive Enhancement;
* separação de loaders e actions;
* deployment em diferentes ambientes.

#### Limitações

* menor alinhamento com a estrutura inicial já considerada;
* ecossistema menor no contexto específico do projeto;
* menor quantidade de exemplos para as integrações previstas;
* benefício insuficiente para superar a adoção de Next.js no contexto atual.

#### Avaliação

É uma alternativa tecnicamente adequada, mas não oferece vantagem decisiva para este projeto.

Foi rejeitada.

---

### 6.4 Opção D — Single Page Application sem framework full-stack

Construir uma SPA com React e implementar manualmente roteamento, carregamento, autenticação, build e integração com backend.

#### Benefícios

* alto controle;
* arquitetura cliente simples;
* independência de framework full-stack;
* deploy estático possível.

#### Limitações

* maior quantidade de decisões;
* maior esforço para SSR;
* SEO mais limitado sem infraestrutura adicional;
* carregamento inicial potencialmente maior;
* necessidade de backend separado;
* mais código de infraestrutura de interface;
* menor produtividade inicial.

#### Avaliação

Foi rejeitada por transferir ao projeto responsabilidades que o framework pode resolver adequadamente.

---

### 6.5 Opção E — Framework não React

Utilizar Vue, Nuxt, SvelteKit, Angular ou alternativa equivalente.

#### Benefícios

* frameworks maduros;
* diferentes modelos de reatividade;
* boas experiências de desenvolvimento;
* SSR e roteamento integrados em várias opções.

#### Limitações

* mudança de ecossistema;
* menor alinhamento com a organização atual;
* menor reaproveitamento de conhecimento;
* ausência de benefício material comprovado para o RouteBook;
* maior dispersão tecnológica.

#### Avaliação

As alternativas são válidas, mas não superam React e Next.js no contexto atual.

Foram rejeitadas.

---

## 7. Decisão

O RouteBook adotará:

* **React** como biblioteca principal de interface;
* **Next.js** como framework principal da aplicação web;
* **App Router** como modelo de roteamento;
* **Server Components** como padrão inicial para componentes que não exigem interatividade no navegador;
* **Client Components** somente quando houver necessidade de estado, eventos, APIs do navegador ou bibliotecas incompatíveis com Server Components;
* **Route Handlers** para endpoints HTTP expostos pela aplicação;
* **Server Functions e Server Actions** apenas como adaptadores de interface para casos de uso autorizados.

A aplicação principal permanecerá em:

```text
apps/web
```

---

## 8. Escopo da decisão

Esta decisão define:

* framework da aplicação web;
* biblioteca principal de interface;
* roteamento;
* fronteira inicial entre servidor e cliente;
* estratégia geral de endpoints;
* integração com módulos;
* princípios de renderização;
* princípios de mutação.

Esta decisão não define:

* Provider de hosting;
* versão exata do Next.js;
* versão exata do React;
* biblioteca de componentes;
* biblioteca de formulários;
* biblioteca de mapas;
* solução de autenticação;
* ORM;
* banco de dados;
* biblioteca de schemas;
* sistema de estilos;
* biblioteca de estado;
* ferramenta de testes;
* Provider de observabilidade.

---

## 9. Versões

As versões de Next.js e React deverão:

* ser fixadas;
* possuir lockfile;
* ser compatíveis entre si;
* receber atualizações de segurança;
* ser testadas antes da promoção;
* não utilizar faixas indefinidas para produção.

Atualizações principais deverão avaliar:

* App Router;
* Server Components;
* Server Functions;
* cache;
* bundler;
* runtime;
* APIs depreciadas;
* compatibilidade de bibliotecas;
* segurança.

---

## 10. App Router

O App Router será utilizado para organizar:

* páginas;
* layouts;
* segmentos;
* loading states;
* error states;
* not-found states;
* metadata;
* Route Handlers;
* grupos de rotas;
* áreas públicas e privadas.

Estrutura inicial conceitual:

```text
apps/web/
└── src/
    ├── app/
    ├── components/
    ├── features/
    ├── interfaces/
    ├── modules/
    ├── platform/
    └── styles/
```

A estrutura física deverá ser detalhada posteriormente, preservando as fronteiras dos módulos.

---

## 11. Rotas de produto

As rotas deverão representar a arquitetura da informação, e não a organização interna do código.

Exemplos conceituais:

```text
/
 /trips
 /trips/new
 /trips/{tripId}
 /trips/{tripId}/places
 /trips/{tripId}/itinerary
 /trips/{tripId}/recommendations
 /trips/{tripId}/conflicts
 /trips/{tripId}/proposals
 /settings
```

A nomenclatura final deverá respeitar os documentos de UX e os contratos de produto.

---

## 12. Route Groups

Route Groups poderão ser utilizados para separar contextos de interface sem alterar URLs.

Exemplos conceituais:

```text
app/
├── (public)/
├── (authenticated)/
├── (trip)/
└── api/
```

Route Groups não deverão ser tratados como módulos de domínio.

---

## 13. Layouts

Layouts deverão ser utilizados para estruturas persistentes, como:

* shell da aplicação;
* navegação;
* contexto visual da Trip;
* sidebar;
* cabeçalho;
* providers de interface;
* áreas autenticadas.

Layouts não deverão conter:

* regras de domínio;
* mutações;
* acesso não autorizado a dados;
* lógica complexa de casos de uso.

---

## 14. Server Components

Server Components serão o padrão para componentes que:

* carregam dados no servidor;
* não dependem de eventos do navegador;
* não utilizam estado local interativo;
* não utilizam APIs exclusivas do browser;
* não dependem de biblioteca client-only.

Benefícios esperados:

* menor JavaScript enviado ao cliente;
* acesso controlado ao servidor;
* composição próxima à origem dos dados;
* streaming;
* proteção de credenciais;
* renderização progressiva.

---

## 15. Client Components

Client Components serão utilizados quando necessário para:

* interações;
* formulários complexos;
* drag and drop;
* mapas;
* geolocalização;
* estado local;
* media queries programáticas;
* APIs do navegador;
* bibliotecas client-only;
* atualizações otimistas.

A diretiva de cliente deverá ser colocada na menor fronteira possível.

Não deverá ser transformada toda a aplicação em Client Component por conveniência.

---

## 16. Fronteira servidor-cliente

A fronteira deverá considerar:

* serialização;
* segurança;
* tamanho do payload;
* interatividade;
* cache;
* privacidade;
* latência;
* frequência de atualização.

Dados enviados ao cliente deverão ser explicitamente selecionados.

Objetos internos, entidades completas e dados sensíveis não deverão ser serializados indiscriminadamente.

---

## 17. Server Functions e Server Actions

Server Functions poderão ser utilizadas como adaptadores para operações de interface.

Exemplos:

* criar uma Trip;
* atualizar hospedagem;
* salvar um Place;
* mover uma Activity;
* ignorar um Planning Conflict;
* aceitar parte de uma Itinerary Proposal.

Elas deverão:

1. validar entrada;
2. autenticar;
3. autorizar;
4. construir command ou input;
5. chamar caso de uso;
6. mapear resultado;
7. atualizar ou invalidar visualização;
8. produzir observabilidade.

Não deverão conter diretamente:

* regras de domínio;
* queries de banco;
* integração com Provider;
* manipulação de tabelas;
* lógica de Recommendation;
* execução livre de Tools.

---

## 18. Segurança de Server Functions

Todos os argumentos deverão ser tratados como não confiáveis.

A existência de uma função no servidor não implica autorização.

Cada mutação deverá verificar:

* User;
* Account;
* Trip;
* recurso;
* ação;
* escopo;
* estado.

Uma referência de função recebida do cliente não deverá ser considerada prova de permissão.

---

## 19. Route Handlers

Route Handlers deverão ser utilizados para:

* APIs públicas ou internas;
* webhooks;
* callbacks de autenticação;
* integração com Providers;
* uploads;
* downloads;
* endpoints de health;
* endpoints consumidos por clientes externos;
* streaming controlado;
* Tools expostas por HTTP quando autorizadas.

Eles deverão atuar como adaptadores HTTP.

Não deverão concentrar regras de negócio.

---

## 20. API interna e externa

A aplicação poderá possuir:

* operações internas usadas pela própria interface;
* endpoints externos estáveis;
* webhooks;
* endpoints administrativos;
* endpoints de integração.

Contratos externos deverão seguir o `RB-API-001`.

Uma Server Action não deverá substituir um endpoint externo quando houver necessidade de:

* contrato estável;
* versionamento;
* consumo externo;
* integração;
* reuso por múltiplos clientes;
* observabilidade independente.

---

## 21. Integração com o monólito modular

O Next.js será tratado como camada de interface e composição.

O fluxo deverá ser:

```text
Page, Component, Server Action ou Route Handler
→ caso de uso público do módulo
→ domínio
→ ports
→ adapters
```

Fluxos proibidos:

```text
Page
→ banco de dados diretamente
```

```text
Client Component
→ repository
```

```text
Route Handler
→ tabela de outro módulo
```

```text
Server Action
→ SDK de Provider sem port
```

---

## 22. Organização por módulo

Os módulos canônicos não deverão ser substituídos por uma organização exclusivamente baseada em páginas.

Uma estrutura possível:

```text
apps/web/src/
├── app/
├── interfaces/
│   ├── web/
│   └── http/
├── modules/
│   ├── identity-and-access/
│   ├── trip-management/
│   ├── traveler-profile/
│   ├── place-catalog/
│   ├── trip-collection/
│   ├── itinerary-planning/
│   ├── mobility/
│   ├── decision-intelligence/
│   ├── proposal-management/
│   └── planning-assurance/
└── platform/
```

A pasta `app/` deverá compor os casos de uso públicos dos módulos.

---

## 23. React e domínio

Componentes React não deverão ser entidades de domínio.

Hooks não deverão substituir application services.

Context Providers de React não deverão se tornar fonte canônica de dados de negócio.

Estado relevante deverá permanecer:

* no servidor;
* na persistência;
* no módulo owner;
* ou em estado temporário explicitamente local.

---

## 24. Carregamento de dados

O carregamento deverá ocorrer preferencialmente no servidor quando:

* os dados forem necessários para renderização inicial;
* exigirem credenciais;
* forem privados;
* não dependerem de APIs do navegador;
* puderem reduzir JavaScript do cliente.

O carregamento no cliente será apropriado para:

* atualizações frequentes;
* interações locais;
* geolocalização;
* mapas;
* polling ou streaming controlado;
* dados dependentes do browser.

---

## 25. Acesso aos casos de uso

Pages e Server Components deverão acessar somente APIs públicas da camada de aplicação.

Exemplo conceitual:

```typescript
const tripSummary = await getTripSummary.execute({
  accountId,
  tripId,
});
```

Não deverão importar:

* repository concreto;
* modelo de ORM;
* tabela;
* client de banco;
* SDK de mapas;
* SDK de IA.

---

## 26. Renderização

A estratégia poderá combinar:

* renderização estática;
* renderização dinâmica;
* renderização no servidor;
* streaming;
* renderização no cliente.

A escolha deverá ser feita por rota e capacidade.

Não deverá existir uma política universal de renderizar tudo no servidor ou tudo no cliente.

---

## 27. Conteúdo estático

Poderão ser estáticos:

* páginas institucionais;
* páginas de ajuda;
* conteúdo público;
* documentação pública;
* páginas de destinos curados, quando aplicável.

---

## 28. Conteúdo dinâmico

Deverá ser dinâmico quando depender de:

* identidade;
* Account;
* Trip;
* preferências;
* Itinerary;
* Recommendations;
* Planning Conflicts;
* Itinerary Proposals;
* dados em tempo real;
* geolocalização.

---

## 29. Streaming e Suspense

Streaming poderá ser utilizado para permitir que partes da interface sejam entregues progressivamente.

Casos elegíveis:

* dashboard da Trip;
* mapa;
* Recommendations;
* detalhes de Places;
* Planning Conflicts;
* custos;
* dados de Providers.

A fragmentação não deverá produzir uma experiência instável ou excesso de loaders.

---

## 30. Loading states

Estados de carregamento deverão:

* preservar layout;
* comunicar progresso;
* evitar mudanças bruscas;
* diferenciar carregamento inicial de atualização;
* respeitar acessibilidade;
* evitar skeletons enganosos.

---

## 31. Error boundaries

Erros deverão ser tratados no menor limite útil.

A interface deverá distinguir:

* erro de validação;
* não autenticado;
* não autorizado;
* recurso não encontrado;
* conflito;
* Provider indisponível;
* falha inesperada.

Erros internos não deverão expor detalhes técnicos.

---

## 32. Not found

Recursos inexistentes e recursos não acessíveis não deverão permitir enumeração indevida.

A resposta deverá seguir a arquitetura de segurança.

---

## 33. Cache

O cache do framework deverá ser utilizado somente com comportamento compreendido e documentado.

Cada decisão de cache deverá definir:

* fonte;
* escopo;
* Account;
* Trip;
* chave;
* duração;
* invalidação;
* dados sensíveis;
* fallback;
* consistência.

Não deverão ser armazenadas respostas privadas em cache compartilhado sem isolamento comprovado.

---

## 34. Invalidação

Mutações deverão invalidar ou atualizar apenas os dados necessários.

A invalidação deverá considerar:

* Trip;
* Activity;
* Place;
* Recommendation;
* Planning Conflict;
* Itinerary Proposal;
* read models relacionados.

Invalidação ampla e indiscriminada deverá ser evitada quando causar custo ou inconsistência.

---

## 35. Estado no cliente

O estado do cliente deverá ser dividido em:

* estado de interface;
* estado transitório;
* cache de dados do servidor;
* estado canônico.

O estado canônico não deverá existir exclusivamente no browser.

Exemplos de estado local adequado:

* modal aberto;
* tab selecionada;
* zoom do mapa;
* filtro temporário;
* item em drag;
* formulário não enviado.

---

## 36. Atualizações otimistas

Atualizações otimistas poderão ser utilizadas quando:

* a operação for previsível;
* houver rollback visual;
* a falha puder ser comunicada;
* não houver risco de ocultar conflito relevante;
* a consistência puder ser restaurada.

Não deverão ser usadas para apresentar como concluída uma decisão crítica ainda não confirmada.

---

## 37. Formulários

Formulários deverão:

* funcionar com validação no servidor;
* possuir validação acessível no cliente quando útil;
* preservar valores quando houver erro;
* evitar dupla submissão;
* tratar idempotência;
* comunicar progresso;
* mapear erros por campo e globais.

Validação no cliente não substitui validação no servidor.

---

## 38. Mapas

Mapas serão uma área interativa predominantemente executada no cliente.

A integração deverá utilizar adapter autorizado para:

* markers;
* geocoding;
* routes;
* distances;
* travel times;
* clustering;
* viewport.

O SDK do Provider não deverá ser importado por módulos de domínio.

---

## 39. Carregamento de mapas

A interface deverá considerar:

* carregamento sob demanda;
* divisão de bundle;
* fallback;
* consentimento quando aplicável;
* indisponibilidade;
* quotas;
* acessibilidade;
* lista equivalente ao conteúdo visual.

A experiência não deverá depender exclusivamente do mapa.

---

## 40. Imagens

Imagens deverão possuir:

* dimensões;
* texto alternativo;
* otimização;
* carregamento adequado;
* origem autorizada;
* fallback;
* política de domínio remoto;
* respeito a licença.

Fotografias de Places não deverão ser tratadas como confiáveis sem validação de origem.

---

## 41. Responsividade

A aplicação deverá priorizar uso móvel.

As telas deverão funcionar em:

* smartphones;
* tablets;
* desktops.

A responsividade deverá seguir os documentos de Design System e UX.

---

## 42. Progressive Enhancement

Fluxos críticos deverão funcionar com o menor nível razoável de dependência de JavaScript no cliente.

Isso é especialmente aplicável a:

* autenticação;
* criação de Trip;
* formulários;
* atualização de preferências;
* ações básicas de itinerário.

Mapas e interações avançadas poderão exigir JavaScript.

---

## 43. Acessibilidade

A aplicação deverá preservar:

* estrutura semântica;
* navegação por teclado;
* foco;
* labels;
* contraste;
* mensagens de erro;
* landmarks;
* títulos;
* alternativas textuais;
* redução de movimento.

Componentes client-side não deverão remover comportamento nativo sem oferecer equivalente acessível.

---

## 44. Metadata

Metadata deverá ser utilizada para:

* títulos;
* descrições;
* compartilhamento;
* indexação;
* páginas públicas;
* páginas de erro.

Dados privados de Trips não deverão ser expostos em metadata pública.

---

## 45. Autenticação

A autenticação deverá integrar-se ao framework sem transferir ownership ao framework.

A solução deverá permitir:

* sessão;
* expiração;
* revogação;
* proteção de rotas;
* identidade no servidor;
* identidade em Route Handlers;
* identidade em Server Functions;
* auditoria.

A escolha do Provider de identidade será registrada separadamente.

---

## 46. Autorização

A autorização deverá ocorrer próxima ao caso de uso.

Middleware, Proxy ou proteção de rota poderão impedir acesso inicial, mas não serão suficientes para autorizar recursos.

Toda operação deverá autorizar novamente:

* Account;
* Trip;
* recurso;
* ação.

---

## 47. Middleware e Proxy

Recursos executados antes da rota poderão ser utilizados para:

* redirects;
* headers;
* internacionalização;
* autenticação inicial;
* rate limiting simples;
* correlação.

Não deverão conter regras completas de autorização de domínio.

---

## 48. Segurança

A implementação deverá proteger:

* Server Functions;
* Route Handlers;
* cookies;
* headers;
* uploads;
* redirects;
* parâmetros;
* cache;
* serialização;
* dependências;
* imagens remotas;
* conteúdo de Providers.

---

## 49. React Server Components

O uso de React Server Components deverá considerar atualizações de segurança e compatibilidade.

Versões vulneráveis não poderão permanecer em produção.

O pipeline deverá detectar versões conhecidas como inseguras quando possível.

---

## 50. Content Security Policy

A aplicação deverá evoluir para uma política de conteúdo compatível com:

* scripts;
* imagens;
* mapas;
* analytics;
* observabilidade;
* Providers autorizados.

Exceções amplas deverão ser evitadas.

---

## 51. Uploads

Uploads deverão utilizar Route Handler ou fluxo dedicado.

Deverão ser validados:

* tipo;
* tamanho;
* conteúdo;
* nome;
* autorização;
* destino;
* malware quando aplicável.

---

## 52. Observabilidade

A aplicação deverá registrar sinais para:

* rota;
* operação;
* módulo;
* renderização;
* Route Handler;
* Server Function;
* Provider;
* cache;
* erro;
* latência;
* deployment.

Campos relevantes:

```text
requestId
correlationId
accountId
tripId
route
operation
module
duration
result
errorCode
```

---

## 53. Web Vitals

A experiência deverá observar indicadores de desempenho da interface.

Os indicadores deverão apoiar:

* diagnóstico;
* regressão;
* priorização;
* validação de experiência.

Eles não deverão ser usados isoladamente como representação completa da qualidade.

---

## 54. Logs

Logs do servidor não deverão conter:

* cookies;
* tokens;
* secrets;
* dados pessoais completos;
* prompts integrais;
* Context Snapshots integrais;
* corpos sensíveis;
* URLs assinadas.

---

## 55. Testes

A aplicação deverá possuir:

* testes de componentes;
* testes de casos de uso;
* testes de Route Handlers;
* testes de Server Functions;
* testes de autorização;
* testes de renderização;
* testes end-to-end;
* testes de acessibilidade;
* testes de mapas quando viáveis;
* smoke tests.

---

## 56. Testes de Server Components

Os testes deverão privilegiar comportamento observável.

Detalhes internos do framework não deverão ser excessivamente acoplados aos testes.

---

## 57. Testes de Client Components

Deverão cobrir:

* eventos;
* estado;
* acessibilidade;
* loading;
* erros;
* integração com formulário;
* atualizações otimistas;
* rollback visual.

---

## 58. Testes de autorização

Deverão cobrir ao menos:

* usuário não autenticado;
* usuário sem Account correta;
* Trip de outra Account;
* Activity de outra Trip;
* Planning Conflict não pertencente à Trip;
* Itinerary Proposal não pertencente à Account;
* identificadores manipulados.

---

## 59. End-to-end

Jornadas iniciais:

1. criar Trip;
2. definir hospedagem;
3. visualizar Places;
4. salvar Place;
5. adicionar Activity;
6. mover Activity;
7. visualizar Recommendation;
8. ignorar Planning Conflict;
9. aceitar parcialmente Itinerary Proposal.

---

## 60. Build

O build deverá:

* executar typecheck;
* produzir artefato reproduzível;
* não incorporar secrets;
* validar variáveis necessárias;
* gerar saída compatível com o ambiente;
* registrar versões;
* falhar em erro relevante.

---

## 61. Deployment

A aplicação deverá poder ser implantada como workload Node.js ou formato suportado pela decisão de infraestrutura.

A decisão não exige um Provider específico.

O deployment deverá preservar:

* artefato imutável;
* configuração externa;
* logs;
* health checks;
* rollback;
* rastreabilidade.

---

## 62. Portabilidade

Funcionalidades centrais não deverão depender diretamente de APIs exclusivas de um Provider de hosting.

Quando uma funcionalidade proprietária for adotada, ela deverá:

* possuir adapter quando aplicável;
* possuir justificativa;
* possuir alternativa ou exit plan;
* ser registrada em ADR se estrutural.

---

## 63. Runtime Node.js e Edge

Node.js será o runtime padrão.

Edge runtime somente deverá ser utilizado quando houver benefício claro e compatibilidade comprovada.

Não deverão ser enviados ao Edge componentes que dependam de:

* APIs exclusivas de Node.js;
* bibliotecas incompatíveis;
* transações complexas;
* SDKs não suportados;
* processamento pesado;
* secrets inadequadamente distribuídos.

---

## 64. Inteligência artificial

A aplicação poderá integrar capacidades de IA por:

* Route Handlers;
* Server Functions controladas;
* streaming;
* adapters;
* runtime de agentes;
* jobs assíncronos.

A interface não deverá chamar diretamente Providers de modelos usando secrets no navegador.

---

## 65. Streaming de IA

Streaming poderá ser utilizado para:

* respostas conversacionais;
* explicações;
* progresso;
* geração de propostas.

O streaming não deverá aplicar efeitos canônicos durante a geração.

Uma Itinerary Proposal deverá ser validada e persistida somente após cumprir seu contrato.

---

## 66. Structured Outputs

Structured Outputs deverão ser validados no servidor antes de serem enviados à interface como objetos confiáveis.

A interface não deverá interpretar livremente texto do modelo como command de domínio.

---

## 67. Tools

Tools acionadas por IA deverão chamar casos de uso autorizados.

A camada web poderá disponibilizar transporte, mas não deverá remover:

* autenticação;
* autorização;
* schema;
* timeout;
* limites;
* observabilidade;
* idempotência.

---

## 68. Consequências positivas

A decisão proporciona:

* uma aplicação principal;
* roteamento integrado;
* layouts;
* renderização no servidor;
* interatividade React;
* streaming;
* endpoints HTTP;
* integração com TypeScript;
* menor complexidade inicial;
* bom suporte a dispositivos móveis;
* integração natural com o ecossistema web;
* ampla documentação;
* suporte amplo por agentes de IA;
* deploy simplificado;
* evolução progressiva.

---

## 69. Consequências negativas

A decisão introduz:

* dependência relevante do Next.js;
* necessidade de acompanhar mudanças do framework;
* necessidade de entender cache e renderização;
* risco de acoplamento ao App Router;
* risco de regras em Server Actions;
* risco de uso excessivo de Client Components;
* risco de dependência do Provider de hosting dominante;
* maior superfície de segurança com Server Components e Server Functions;
* complexidade de testes em determinadas fronteiras.

---

## 70. Riscos

### 70.1 Acoplamento de domínio ao framework

Mitigações:

* casos de uso públicos;
* ports;
* adapters;
* regras arquiteturais;
* testes de imports.

### 70.2 Server Actions com regras de negócio

Mitigações:

* handlers finos;
* revisão;
* templates;
* lint;
* testes.

### 70.3 Acesso direto ao banco em páginas

Mitigações:

* proibição arquitetural;
* APIs públicas de módulo;
* repositories privados;
* revisão.

### 70.4 Client Components excessivos

Mitigações:

* fronteiras mínimas;
* análise de bundle;
* revisão;
* padrões de componentes.

### 70.5 Cache cross-account

Mitigações:

* chaves com escopo;
* testes;
* política de cache;
* dados privados sem compartilhamento.

### 70.6 Dependência de hosting

Mitigações:

* runtime Node.js;
* infraestrutura como código;
* adapters;
* uso criterioso de APIs proprietárias.

### 70.7 Vulnerabilidades no framework

Mitigações:

* dependency scanning;
* versões fixadas;
* atualização rápida;
* SBOM;
* alertas.

### 70.8 Instabilidade de APIs recentes

Mitigações:

* versões estáveis;
* evitar APIs experimentais sem ADR;
* testes;
* atualização controlada.

---

## 71. Controles arquiteturais

Deverão existir progressivamente:

* proibição de imports de infraestrutura em UI;
* proibição de client de banco em `app/`;
* proibição de SDK de Provider em domínio;
* validação de `'use client'`;
* validação de Route Handlers;
* testes de autorização;
* análise de bundle;
* testes de cache;
* dependency scanning;
* headers de segurança;
* observabilidade de rotas.

---

## 72. Estratégia de implementação

### Etapa 1 — Inicialização

* criar aplicação Next.js em `apps/web`;
* habilitar TypeScript;
* fixar versões;
* configurar App Router;
* configurar lint;
* configurar build.

### Etapa 2 — Estrutura

* criar shell;
* criar layouts;
* criar grupos de rotas;
* representar interfaces;
* conectar módulos do monólito modular.

### Etapa 3 — Primeiro slice

* criar fluxo de Trip;
* carregar dados no servidor;
* criar formulário;
* criar mutação;
* validar autorização;
* testar.

### Etapa 4 — Place Discovery

* integrar componentes de Place;
* introduzir mapa como Client Component;
* manter dados no servidor;
* adicionar fallback em lista.

### Etapa 5 — Decision Intelligence

* adicionar Recommendations;
* adicionar streaming quando necessário;
* preservar contratos.

### Etapa 6 — AI-assisted Experience

* adicionar Itinerary Proposals;
* validar Structured Outputs;
* integrar Tools autorizadas;
* adicionar observabilidade.

---

## 73. Critérios de implementação concluída

A decisão estará implementada quando:

* `apps/web` executar com Next.js;
* App Router estiver configurado;
* TypeScript strict estiver ativo;
* layouts iniciais existirem;
* uma rota pública existir;
* uma rota autenticada existir;
* um Server Component carregar dados por caso de uso;
* um Client Component interativo existir;
* um Route Handler existir;
* uma mutação chamar caso de uso autorizado;
* testes executarem;
* build for reproduzível;
* deployment inicial for possível.

---

## 74. Verificação

A verificação deverá incluir:

* instalação em ambiente limpo;
* execução local;
* build;
* typecheck;
* lint;
* testes;
* navegação;
* renderização no servidor;
* hidratação;
* Client Component;
* Route Handler;
* mutação;
* autorização;
* erro;
* loading;
* deployment.

---

## 75. Métricas

Poderão ser observadas:

* tamanho de JavaScript no cliente;
* quantidade de Client Components;
* tempo de renderização;
* latência do servidor;
* cache hit rate;
* erros por rota;
* falhas de Server Functions;
* falhas de Route Handlers;
* Web Vitals;
* tempo de build;
* tamanho do artefato;
* regressões de bundle;
* vulnerabilidades.

---

## 76. Gatilhos de revisão

A decisão deverá ser revisada quando:

* o Next.js limitar requisitos centrais;
* o modelo full-stack impedir escala organizacional;
* a aplicação exigir backend independente;
* o custo de runtime se tornar inadequado;
* o App Router apresentar incompatibilidade estrutural;
* dependência do hosting se tornar excessiva;
* segurança ou conformidade exigir separação;
* múltiplos clientes exigirem API independente;
* a equipe perder capacidade de manter o framework;
* outra solução demonstrar benefício material.

---

## 77. Estratégia de rollback

A substituição do framework exigirá novo ADR.

A migração deverá preservar:

* rotas;
* contratos;
* módulos;
* casos de uso;
* domínio;
* dados;
* APIs;
* autenticação;
* observabilidade;
* testes;
* deployment.

A separação já definida entre interface e aplicação deverá reduzir o impacto da troca.

---

## 78. Decisões derivadas

Deverão ser registradas decisões sobre:

* organização do monorepo;
* package manager;
* sistema de estilos;
* biblioteca de componentes;
* biblioteca de schemas;
* autenticação;
* persistência;
* banco de dados;
* mapas;
* testes;
* Provider de hosting;
* observabilidade web.

---

## 79. Próxima decisão

O `RB-ADR-004` deverá definir a estratégia física do repositório e avaliar:

* monorepo;
* aplicações;
* packages;
* módulos internos;
* package manager;
* workspaces;
* compartilhamento de contratos;
* compartilhamento de UI;
* isolamento arquitetural;
* build e cache.

A decisão deverá considerar que o repositório já possui:

```text
apps/
packages/
docs/
```

---

## 80. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-003
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar contexto e consequências históricas.

---

## 81. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* Next.js está justificado;
* App Router está justificado;
* Server Components estão governados;
* Client Components estão governados;
* Server Functions estão governadas;
* Route Handlers estão governados;
* domínio permanece fora do framework;
* cache está governado;
* autenticação está contemplada;
* autorização está contemplada;
* segurança está contemplada;
* IA está contemplada;
* mapas estão contemplados;
* testes estão definidos;
* deployment está definido;
* riscos estão registrados;
* implementação está definida;
* verificação está definida;
* gatilhos de revisão estão definidos;
* supersessão está definida;
* não existem contradições com RB-ADR-001;
* não existem contradições com RB-ADR-002;
* escolhas de Provider não foram antecipadas.

---

## 82. Declaração final

O RouteBook adotará Next.js com App Router como estrutura principal de sua aplicação web.

A decisão foi tomada porque a solução oferece uma base integrada para:

* React;
* TypeScript;
* Node.js;
* roteamento;
* renderização;
* streaming;
* layouts;
* endpoints;
* mutações;
* deployment.

O framework será tratado como camada de interface e execução web.

Ele não será tratado como substituto para:

* domínio;
* casos de uso;
* módulos;
* contracts;
* ports;
* adapters;
* autorização;
* governança.

Server Components serão utilizados para reduzir código no cliente e aproximar o carregamento de dados do servidor.

Client Components serão utilizados apenas quando a interatividade justificar sua presença.

Server Functions e Route Handlers deverão permanecer finos, validados, autorizados e rastreáveis.

A arquitetura deverá preservar a possibilidade de substituir a camada web no futuro sem reescrever as regras centrais do RouteBook.
