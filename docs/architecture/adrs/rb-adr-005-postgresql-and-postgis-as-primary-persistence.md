---

id: RB-ADR-005

title: Adoção de PostgreSQL com PostGIS como Persistência Relacional Principal
description: Registra a decisão de adotar PostgreSQL como banco de dados relacional principal do RouteBook e PostGIS como extensão geoespacial, preservando ownership modular, integridade transacional, migrations controladas e capacidade de consultas por localização.

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
- postgresql
- postgis
- database
- persistence
- relational-database
- geospatial
- transactions
- data-integrity
- migrations
- modular-monolith
- typescript
- nodejs
- travel-platform

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
- RB-DATA-001
- RB-DATA-002
- RB-SEC-001
- RB-SEC-002
- RB-SEC-003
- RB-PRIV-001
- RB-PRIV-002
- RB-PRIV-003
- RB-OBS-001
- RB-QA-001
- RB-OPS-001
- RB-SRE-001
- RB-RISK-001
- RB-DEL-001
- RB-DEV-001
- RB-CICD-001
- RB-INFRA-001
- RB-ADR-001
- RB-ADR-002
- RB-ADR-003
- RB-ADR-004

next_documents:

- RB-ADR-006

ai_context:
priority: critical
index: true
---

# RB-ADR-005 — Adoção de PostgreSQL com PostGIS como Persistência Relacional Principal

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* PostgreSQL será o banco de dados relacional principal do RouteBook;
* PostGIS será a extensão geoespacial preferencial;
* dados canônicos dos módulos deverão utilizar PostgreSQL, salvo decisão específica;
* ownership de dados deverá permanecer definido por módulo;
* migrations deverão ser versionadas e executadas por processo controlado;
* a escolha do ORM ou query builder deverá ser registrada separadamente;
* a escolha do Provider gerenciado deverá ser registrada separadamente quando estrutural.

---

## 2. Contexto

O RouteBook será inicialmente implementado como:

* monólito modular;
* aplicação TypeScript;
* runtime Node.js;
* aplicação web Next.js;
* monorepo com pnpm Workspaces e Turborepo.

O produto deverá persistir conceitos como:

* Account;
* User;
* Trip;
* hospedagem;
* Traveler Profile;
* Place;
* Place Category;
* Trip Collection;
* Activity;
* Itinerary;
* Recommendation;
* Decision;
* Planning Conflict;
* Itinerary Proposal;
* Provider;
* eventos;
* auditoria;
* configuração;
* avaliações de inteligência artificial.

Esses conceitos possuem relações e invariantes relevantes.

Exemplos:

* uma Trip pertence a uma Account;
* uma Activity pertence a uma Trip;
* uma Activity poderá referenciar um Place;
* um Planning Conflict pertence ao contexto de planejamento de uma Trip;
* uma Itinerary Proposal não deverá ser aplicada automaticamente;
* uma Recommendation não deverá ser confundida com uma Decision;
* dados de uma Account não poderão ser acessados por outra Account.

Além do modelo relacional, o RouteBook possui requisitos geoespaciais.

O produto deverá permitir:

* armazenar coordenadas;
* localizar Places próximos;
* calcular distância da hospedagem;
* filtrar Places por raio;
* ordenar resultados por proximidade;
* representar pontos e áreas;
* relacionar Places a regiões;
* apoiar cálculos de mobilidade;
* integrar dados de mapas e geocoding.

É necessário escolher a tecnologia de persistência principal antes de definir:

* ORM ou query builder;
* migrations concretas;
* schemas físicos;
* Provider gerenciado;
* estratégia de conexão;
* desenvolvimento local;
* backups;
* índices;
* consultas geoespaciais.

---

## 3. Problema

Qual tecnologia deverá ser utilizada como persistência principal do RouteBook, considerando:

* integridade relacional;
* transações;
* isolamento entre Accounts;
* domínio modular;
* dados geográficos;
* consultas por proximidade;
* suporte a TypeScript e Node.js;
* migrations;
* desenvolvimento local;
* serviços gerenciados;
* backup e restore;
* observabilidade;
* custo inicial;
* evolução futura?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. integridade de dados;
2. suporte a transações;
3. relacionamentos;
4. constraints;
5. consultas complexas;
6. suporte geoespacial;
7. índices espaciais;
8. maturidade;
9. portabilidade;
10. suporte em serviços gerenciados;
11. integração com Node.js;
12. integração com TypeScript;
13. ferramentas de migration;
14. backup e restore;
15. observabilidade;
16. desempenho suficiente;
17. baixo custo inicial;
18. capacidade de evolução;
19. flexibilidade controlada para dados semiestruturados;
20. suporte à arquitetura de monólito modular.

---

## 5. Restrições

A solução deverá:

* permitir execução local;
* permitir serviço gerenciado;
* suportar transações;
* suportar constraints;
* suportar índices;
* suportar migrations;
* suportar backup;
* suportar restore;
* possuir driver para Node.js;
* permitir isolamento lógico de dados;
* permitir consultas geográficas;
* não exigir arquitetura distribuída;
* não acoplar o domínio a um Provider;
* não exigir um banco distinto por módulo no MVP;
* permitir crescimento gradual.

---

## 6. Opções consideradas

### 6.1 Opção A — PostgreSQL sem PostGIS

Utilizar PostgreSQL como banco relacional, armazenando latitude e longitude em colunas numéricas.

#### Benefícios

* banco relacional maduro;
* transações;
* constraints;
* índices;
* amplo suporte;
* operação conhecida;
* consultas SQL;
* integração com Node.js.

#### Limitações

* cálculos geográficos implementados manualmente;
* consultas por raio mais complexas;
* risco de cálculos inconsistentes;
* menor capacidade de índices espaciais;
* dificuldade para áreas, polígonos e interseções;
* evolução geográfica limitada.

#### Avaliação

PostgreSQL atende à persistência relacional, mas a ausência de PostGIS reduziria a qualidade das capacidades geográficas centrais do RouteBook.

Foi rejeitada como configuração final preferencial.

---

### 6.2 Opção B — PostgreSQL com PostGIS

Utilizar PostgreSQL como banco principal e PostGIS como extensão geoespacial.

#### Benefícios

* transações;
* integridade referencial;
* constraints;
* consultas relacionais;
* tipos geográficos;
* índices espaciais;
* distância;
* proximidade;
* raio;
* interseções;
* suporte a pontos e áreas;
* flexibilidade com `jsonb`;
* ampla disponibilidade em Providers;
* ecossistema maduro;
* portabilidade;
* suporte a migrations;
* capacidade de evolução.

#### Limitações

* operação mais complexa que armazenamento simples;
* necessidade de habilitar extensão;
* necessidade de conhecimento de sistemas de referência;
* risco de consultas espaciais incorretas;
* necessidade de índices adequados;
* Provider deverá suportar PostGIS;
* migrations deverão controlar extensões e tipos.

#### Avaliação

Oferece o melhor equilíbrio entre dados relacionais e requisitos geoespaciais.

Foi selecionada.

---

### 6.3 Opção C — Banco documental

Utilizar banco orientado a documentos como persistência principal.

#### Benefícios

* documentos flexíveis;
* desenvolvimento inicial rápido em alguns cenários;
* armazenamento natural de estruturas aninhadas;
* escalabilidade horizontal em determinadas soluções;
* schema flexível.

#### Limitações

* relacionamentos mais difíceis;
* invariantes distribuídas na aplicação;
* transações mais limitadas ou mais complexas;
* risco de duplicação;
* consistência de dados mais difícil;
* consultas analíticas e relacionais menos naturais;
* menor adequação às relações do domínio;
* necessidade de solução geoespacial específica.

#### Avaliação

A flexibilidade documental não compensa a perda de estrutura relacional no domínio principal.

Foi rejeitada como persistência canônica principal.

---

### 6.4 Opção D — Banco serverless proprietário

Utilizar banco distribuído ou serverless específico de um Provider.

#### Benefícios

* operação reduzida;
* escala automática;
* integração com plataforma;
* cobrança por uso;
* alta disponibilidade gerenciada.

#### Limitações

* maior lock-in;
* semântica transacional específica;
* limitações de consultas;
* custos menos previsíveis;
* migração mais difícil;
* suporte geoespacial variável;
* acoplamento da arquitetura ao Provider.

#### Avaliação

Poderá ser reavaliado futuramente, mas não é a melhor base canônica inicial.

Foi rejeitada.

---

### 6.5 Opção E — SQLite

Utilizar SQLite como banco principal.

#### Benefícios

* simplicidade;
* arquivo único;
* setup local rápido;
* ausência de serviço separado;
* bom desempenho para uso local;
* transações;
* baixo custo.

#### Limitações

* concorrência limitada;
* operação de produção diferente;
* recursos geográficos mais limitados;
* menor adequação a múltiplas instâncias;
* migração futura provável;
* menor equivalência entre local e produção.

#### Avaliação

Poderá ser usado em ferramentas ou testes específicos, mas não como persistência principal.

Foi rejeitada.

---

### 6.6 Opção F — Banco de grafos

Utilizar banco orientado a grafos.

#### Benefícios

* relações complexas;
* navegação por conexões;
* algoritmos de grafos;
* modelagem de redes.

#### Limitações

* complexidade adicional;
* menor adequação a transações gerais do produto;
* operação especializada;
* necessidade não comprovada;
* dados geográficos ainda exigiriam estratégia específica;
* integração operacional adicional.

#### Avaliação

Não existem requisitos atuais que justifiquem banco de grafos como persistência principal.

Foi rejeitada.

---

### 6.7 Opção G — Bancos separados por módulo

Provisionar uma instância ou banco independente para cada módulo desde o início.

#### Benefícios

* isolamento físico;
* ownership forte;
* evolução independente;
* possibilidade de tecnologias distintas;
* menor risco de acesso cruzado direto.

#### Limitações

* complexidade operacional;
* transações distribuídas;
* múltiplas conexões;
* backups separados;
* migrations separadas;
* maior custo;
* debugging mais complexo;
* incompatibilidade com a simplicidade do monólito modular inicial.

#### Avaliação

A separação física não é necessária no estágio inicial.

Foi rejeitada.

---

## 7. Decisão

O RouteBook adotará:

* **PostgreSQL** como banco de dados relacional principal;
* **PostGIS** como extensão oficial para dados e consultas geoespaciais;
* uma infraestrutura principal compartilhada no estágio inicial;
* ownership lógico dos dados por módulo;
* migrations versionadas;
* constraints no banco;
* índices definidos conforme consultas reais;
* backups e restores controlados;
* conexão por adapter de persistência.

A decisão não define:

* ORM;
* query builder;
* biblioteca de migrations;
* Provider de banco;
* versão exata do PostgreSQL;
* versão exata do PostGIS;
* estratégia de pooling;
* estrutura física completa dos schemas;
* política detalhada de particionamento.

---

## 8. Definição de persistência principal

Persistência principal significa a tecnologia utilizada como fonte canônica para o estado durável dos módulos de negócio.

Ela deverá armazenar, conforme o modelo físico aprovado:

* Trips;
* Activities;
* Places;
* preferências;
* coleções;
* Recommendations;
* Decisions;
* Planning Conflicts;
* Itinerary Proposals;
* configurações;
* referências de Providers;
* estados operacionais duráveis;
* metadados de auditoria necessários.

Não deverão ser tratados como fonte canônica exclusiva:

* cache;
* índice de busca;
* armazenamento vetorial;
* memória de agente;
* estado do navegador;
* logs;
* respostas de Providers;
* arquivos temporários.

---

## 9. Versões

O projeto deverá utilizar versões suportadas e estáveis de PostgreSQL e PostGIS.

As versões exatas deverão ser fixadas em:

* ambiente local;
* containers;
* infraestrutura;
* CI;
* documentação operacional.

Atualizações principais deverão avaliar:

* compatibilidade;
* extensões;
* drivers;
* migrations;
* índices;
* queries;
* backup;
* restore;
* replicação;
* observabilidade.

---

## 10. Ambiente local

O ambiente local deverá permitir inicialização reproduzível do PostgreSQL com PostGIS.

A configuração poderá utilizar container ou serviço local equivalente.

O processo deverá permitir:

```text
iniciar banco
→ habilitar extensão
→ aplicar migrations
→ carregar seed
→ executar testes
→ resetar ambiente
```

Os dados locais deverão ser sintéticos.

---

## 11. Serviço gerenciado

Produção deverá preferir PostgreSQL gerenciado quando isso reduzir risco operacional.

O Provider deverá suportar:

* versão aprovada;
* PostGIS;
* backup;
* restore;
* criptografia;
* métricas;
* logs;
* acesso privado quando necessário;
* alta disponibilidade proporcional;
* atualização controlada;
* exportação de dados;
* plano de saída.

A escolha do Provider deverá ser registrada separadamente quando estrutural.

---

## 12. Modelo relacional

Dados com relações e invariantes deverão utilizar estruturas relacionais explícitas.

Exemplos:

```text
Account
→ Trip
→ Itinerary
→ Activity
→ Place
```

```text
Trip
→ Recommendation
→ Decision
```

```text
Trip
→ PlanningConflict
```

```text
Trip
→ ItineraryProposal
```

A modelagem física deverá preservar o domínio sem reproduzi-lo de forma mecânica.

---

## 13. Constraints

Regras estruturais deverão ser protegidas pelo banco quando apropriado.

Exemplos:

* `NOT NULL`;
* `UNIQUE`;
* `FOREIGN KEY`;
* `CHECK`;
* exclusões;
* índices únicos condicionais;
* constraints temporais;
* constraints geográficas.

Constraints não substituem as invariantes de domínio, mas fornecem proteção adicional.

---

## 14. Identificadores

Identificadores canônicos deverão ser preservados.

Exemplos:

* `TripId`;
* `ActivityId`;
* `PlaceId`;
* `RecommendationId`;
* `PlanningConflictId`;
* `ItineraryProposalId`.

O formato físico deverá:

* ser consistente;
* suportar geração distribuída quando necessária;
* não expor sequência sensível sem necessidade;
* permitir indexação;
* ser independente do ORM.

A escolha entre UUID, UUID ordenável ou alternativa deverá ser registrada na modelagem física ou em ADR específico quando necessário.

---

## 15. Ownership por módulo

Cada tabela ou estrutura canônica deverá possuir módulo owner.

Somente o módulo owner poderá definir:

* criação;
* alteração;
* exclusão;
* invariantes;
* ciclo de vida;
* migrations;
* retenção;
* contratos de leitura.

Outro módulo não deverá escrever diretamente em tabelas que não possui.

---

## 16. Banco compartilhado

No estágio inicial, os módulos poderão utilizar a mesma instância de PostgreSQL.

Isso não autoriza:

* queries arbitrárias entre módulos;
* foreign keys sem análise;
* escrita direta em tabelas externas;
* compartilhamento de repositories;
* uso da estrutura física como contrato de integração;
* acesso irrestrito por agentes.

O compartilhamento é operacional, não conceitual.

---

## 17. Estratégias de organização

A organização física poderá utilizar:

* um schema com convenções por módulo;
* schemas separados por módulo;
* combinação progressiva.

A escolha deverá considerar:

* suporte da biblioteca de persistência;
* migrations;
* permissões;
* clareza;
* operação;
* ferramentas;
* complexidade.

A decisão final deverá ser documentada no design físico da persistência.

---

## 18. Repositories

Repositories deverão pertencer aos módulos correspondentes.

Eles deverão:

* implementar ports;
* mapear dados persistidos;
* reconstruir aggregates quando necessário;
* ocultar SQL ou biblioteca de persistência;
* respeitar transações;
* retornar conceitos da aplicação ou domínio.

Não deverão ser compartilhados como utilitários globais.

---

## 19. Modelos de persistência

Modelos de persistência deverão ser separados dos modelos de domínio quando suas responsabilidades divergirem.

O adapter deverá converter entre:

```text
row ou record
→ tipo validado
→ modelo de domínio
```

Entidades de domínio não deverão ser decoradas ou alteradas exclusivamente para atender ao mecanismo de persistência sem análise.

---

## 20. Transações

PostgreSQL deverá ser utilizado para preservar atomicidade em operações que exijam consistência.

Exemplos:

* criação de Trip e estado inicial;
* atualização de Itinerary;
* movimentação de Activity;
* aceitação de Itinerary Proposal;
* resolução de Planning Conflict;
* registro de Decision.

A fronteira transacional deverá pertencer ao caso de uso da aplicação.

---

## 21. Transações entre módulos

Transações que alterem dados de múltiplos módulos deverão ser evitadas quando representarem acoplamento indevido.

Poderão ser utilizadas quando:

* a operação for realmente atômica;
* os módulos participarem de processo autorizado;
* a decisão estiver explícita;
* a evolução futura tiver sido considerada.

Alternativas:

* eventos;
* outbox;
* processos;
* compensações;
* consistência eventual.

---

## 22. Isolamento entre Accounts

Toda tabela que contenha dados pertencentes a uma Account deverá possuir mecanismo explícito de escopo.

A estratégia poderá envolver:

* `account_id`;
* ownership transitivo comprovado;
* policies;
* queries obrigatoriamente escopadas;
* Row-Level Security quando adotada;
* testes cross-account.

O isolamento não deverá depender apenas de filtros inseridos manualmente de forma ad hoc.

---

## 23. Row-Level Security

Row-Level Security poderá ser utilizada como defesa adicional.

Sua adoção deverá avaliar:

* contexto de conexão;
* pooling;
* migrations;
* jobs;
* administração;
* testes;
* observabilidade;
* compatibilidade com biblioteca de persistência.

Ela não substituirá autorização na camada de aplicação.

A adoção concreta poderá exigir decisão específica.

---

## 24. Dados geoespaciais

PostGIS será utilizado para representar dados espaciais relevantes.

Casos iniciais:

* coordenadas da hospedagem;
* coordenadas de Places;
* localização de pontos de interesse;
* regiões;
* áreas de cobertura;
* consultas de proximidade;
* ordenação por distância.

---

## 25. Geometry e Geography

A escolha entre `geometry` e `geography` deverá considerar o tipo de cálculo.

Como regra inicial:

* `geography` poderá ser utilizado para pontos globais e distâncias em metros;
* `geometry` poderá ser utilizado para operações cartesianas, projeções ou necessidades específicas.

A escolha deverá permanecer consistente por caso de uso.

---

## 26. Sistema de referência

Dados de latitude e longitude deverão possuir sistema de referência explícito.

Para coordenadas geográficas globais, a implementação poderá utilizar WGS 84 quando apropriado.

O SRID não deverá ser omitido ou assumido silenciosamente em operações relevantes.

---

## 27. Pontos geográficos

Places e hospedagens deverão possuir representação geográfica validada.

A validação deverá considerar:

* latitude;
* longitude;
* ordem das coordenadas;
* SRID;
* ausência;
* precisão;
* origem;
* qualidade;
* data de atualização.

---

## 28. Distância geográfica

A distância geográfica deverá ser distinguida de:

* distância por rota;
* tempo de deslocamento;
* distância caminhável;
* distância de carro;
* distância de transporte público.

PostGIS poderá fornecer distância espacial direta.

Providers de mobilidade poderão fornecer distância e duração por rota.

Esses valores não deverão ser tratados como equivalentes.

---

## 29. Busca por proximidade

Consultas de proximidade deverão utilizar recursos espaciais adequados.

Exemplos conceituais:

* Places em um raio;
* Places mais próximos;
* hospedagens próximas;
* pontos dentro de uma região;
* ordenação por distância.

A implementação deverá evitar cálculos completos em memória quando o banco puder filtrar e ordenar eficientemente.

---

## 30. Índices espaciais

Colunas geoespaciais consultadas deverão possuir índices adequados quando o volume e o padrão de acesso justificarem.

A estratégia deverá considerar:

* tipo espacial;
* operador utilizado;
* seletividade;
* volume;
* plano de execução;
* custo de escrita.

A existência de um índice não garante que toda consulta o utilizará.

---

## 31. Dados de rota

PostGIS não será tratado como substituto automático de um mecanismo de roteamento.

Rotas e tempos de viagem poderão depender de Providers especializados.

O banco poderá armazenar:

* resultados derivados;
* cache;
* origem;
* timestamp;
* modo;
* distância;
* duração;
* validade.

Resultados derivados deverão permanecer reconstruíveis.

---

## 32. JSON e JSONB

`jsonb` poderá ser utilizado para dados semiestruturados quando houver justificativa.

Casos possíveis:

* payload original de Provider;
* metadados não canônicos;
* configurações de integração;
* atributos variáveis;
* evidência técnica;
* snapshots controlados.

Não deverá ser utilizado para evitar modelagem relacional de conceitos canônicos estáveis.

---

## 33. Regras para JSONB

Todo campo `jsonb` relevante deverá possuir:

* finalidade;
* owner;
* schema lógico;
* validação;
* limites de tamanho;
* estratégia de evolução;
* índices quando necessários;
* política de retenção.

A aplicação não deverá depender de propriedades arbitrárias não documentadas.

---

## 34. Arrays

Arrays nativos poderão ser utilizados quando representarem valores simples e limitados.

Não deverão substituir relações quando:

* os itens possuírem identidade;
* houver necessidade de busca;
* houver ciclo de vida;
* houver metadados;
* houver integridade referencial.

---

## 35. Datas e horários

Datas e horários deverão possuir semântica explícita.

O modelo deverá distinguir:

* data civil da viagem;
* horário local;
* instante UTC;
* timezone;
* janela de tempo;
* duração.

Timestamps técnicos deverão ser armazenados de forma consistente.

O planejamento de viagem deverá preservar o fuso do destino quando relevante.

---

## 36. Dinheiro

Valores monetários deverão evitar tipos de ponto flutuante.

A modelagem deverá preservar:

* valor;
* moeda;
* precisão;
* origem;
* data de referência;
* estimativa ou valor confirmado.

A escolha física deverá ser documentada no modelo de dados.

---

## 37. Estados

Estados de entidades deverão utilizar representação controlada.

A implementação poderá utilizar:

* constraint;
* enum de banco;
* tabela de referência;
* texto validado.

A escolha deverá considerar facilidade de migration e compatibilidade.

Estados canônicos não deverão ser persistidos com valores ambíguos.

---

## 38. Exclusão

A estratégia deverá distinguir:

* exclusão física;
* exclusão lógica;
* invalidação;
* arquivamento;
* expiração;
* anonimização.

Soft delete não deverá ser adotado como padrão universal.

Dados excluídos não deverão reaparecer após restore sem processo de reconciliação.

---

## 39. Auditoria

Mudanças críticas deverão possuir rastreabilidade proporcional.

A auditoria poderá registrar:

* ator;
* Account;
* Trip;
* operação;
* entidade;
* identificador;
* instante;
* correlação;
* origem;
* resultado.

A estratégia de auditoria não deverá copiar indiscriminadamente dados sensíveis.

---

## 40. Eventos e outbox

Quando eventos precisarem sobreviver ao processo e ser publicados com consistência, poderá ser adotado Transactional Outbox.

O padrão deverá permitir:

```text
alteração canônica
+ registro do evento
→ mesma transação
```

A publicação posterior deverá possuir:

* idempotência;
* retry;
* observabilidade;
* dead-letter ou tratamento equivalente.

A adoção concreta deverá ocorrer quando existir consumidor ou necessidade real.

---

## 41. Migrations

Toda alteração de schema deverá utilizar migration versionada.

Migrations deverão ser:

* ordenadas;
* revisadas;
* testadas;
* reproduzíveis;
* aplicáveis em ambiente limpo;
* observáveis;
* compatíveis com deployment;
* protegidas contra execução acidental.

---

## 42. Expand and Contract

Mudanças incompatíveis deverão preferir:

1. adicionar estrutura compatível;
2. implantar código compatível;
3. executar backfill;
4. verificar;
5. migrar leituras e escritas;
6. remover estrutura antiga.

Alterações destrutivas diretas deverão ser evitadas em produção.

---

## 43. Backfills

Backfills deverão possuir:

* identificador;
* owner;
* escopo;
* checkpoint;
* idempotência;
* limite;
* métricas;
* pausa;
* retomada;
* verificação;
* rollback ou compensação.

Não deverão executar automaticamente no startup da aplicação.

---

## 44. Seed

Seeds deverão ser utilizados para:

* dados mínimos;
* desenvolvimento;
* testes;
* demonstração;
* catálogo inicial controlado.

Seeds de produção deverão ser explícitos, versionados e seguros.

Eles não deverão duplicar dados já administrados por migrations ou operação canônica sem necessidade.

---

## 45. Fixtures

Fixtures deverão ser:

* sintéticas;
* determinísticas;
* pequenas;
* representativas;
* livres de dados pessoais reais.

Cenários mínimos deverão incluir:

* Trip válida;
* Place geográfico;
* Activity;
* Recommendation;
* Planning Conflict;
* Itinerary Proposal;
* tentativa cross-account;
* coordenada inválida.

---

## 46. Conexões

A aplicação deverá utilizar conexões de forma controlada.

A estratégia deverá considerar:

* limite do Provider;
* número de instâncias;
* pooling;
* jobs;
* migrations;
* desenvolvimento local;
* serverless quando aplicável;
* timeouts;
* encerramento gracioso.

---

## 47. Pooling

A escolha do pooling dependerá do ambiente de deployment.

Poderá envolver:

* pool no processo;
* proxy de conexão;
* pool gerenciado;
* pooling transacional.

A solução deverá preservar corretamente:

* transações;
* session settings;
* Row-Level Security quando utilizada;
* prepared statements;
* timeouts.

---

## 48. Timeouts

Deverão ser definidos limites para:

* conexão;
* aquisição no pool;
* execução de query;
* transação;
* lock;
* migration.

Queries sem limite poderão comprometer a disponibilidade.

---

## 49. Locks

Operações deverão considerar:

* concorrência;
* deadlocks;
* duração;
* ordem de atualização;
* nível de isolamento;
* retries.

Locks prolongados deverão ser observáveis.

---

## 50. Concorrência otimista

Entidades sujeitas a edição concorrente poderão utilizar:

* versão;
* timestamp;
* compare-and-set;
* constraint;
* detecção de conflito.

Atualizações silenciosamente perdidas deverão ser evitadas.

---

## 51. Idempotência

Operações que possam ser repetidas deverão utilizar mecanismos como:

* idempotency key;
* constraint única;
* estado;
* registro de processamento;
* deduplicação.

Isso é especialmente relevante para:

* webhooks;
* Tool Calls;
* jobs;
* eventos;
* retries;
* aceitação de propostas.

---

## 52. Índices

Índices deverão ser criados com base em:

* consultas reais;
* constraints;
* joins;
* filtros;
* ordenação;
* escopo por Account;
* escopo por Trip;
* dados geográficos.

Índices excessivos aumentam:

* escrita;
* storage;
* migrations;
* manutenção.

---

## 53. Planos de execução

Queries relevantes deverão ser avaliadas por seus planos de execução.

A análise deverá ocorrer quando houver:

* lentidão;
* alto volume;
* full scan inesperado;
* join custoso;
* índice ignorado;
* ordenação pesada;
* consulta espacial relevante.

---

## 54. Paginação

Listagens deverão preferir estratégia compatível com estabilidade e volume.

Paginação por cursor poderá ser utilizada quando:

* houver grandes conjuntos;
* ordenação estável;
* atualização concorrente;
* necessidade de continuidade.

Offset poderá ser suficiente em listas pequenas ou administrativas.

---

## 55. Busca textual

PostgreSQL poderá suportar busca textual inicial quando suficiente.

A adoção de mecanismo externo de busca somente deverá ocorrer quando houver necessidade comprovada de:

* relevância avançada;
* grande escala;
* autocomplete especializado;
* tolerância complexa;
* analytics de busca;
* múltiplas fontes.

O índice de busca não deverá se tornar fonte canônica.

---

## 56. Vetores e embeddings

Embeddings não deverão ser armazenados automaticamente no modelo principal sem decisão específica.

A estratégia deverá avaliar:

* finalidade;
* dimensão;
* modelo;
* versão;
* custo;
* retenção;
* exclusão;
* isolamento;
* índice;
* Provider.

Uma extensão vetorial poderá ser considerada posteriormente, mas não faz parte desta decisão.

---

## 57. Inteligência artificial

O banco poderá persistir metadados de capacidades de IA, como:

* capabilityId;
* agentId;
* modelFamily;
* promptVersion;
* schemaVersion;
* resultado;
* custo;
* latência;
* Provenance;
* feedback.

Prompts completos, contextos e outputs deverão possuir política específica de minimização e retenção.

---

## 58. Memória de agentes

Memória de agente não deverá ser armazenada como texto arbitrário sem:

* finalidade;
* Account;
* escopo;
* retenção;
* exclusão;
* Provenance;
* classificação;
* autorização.

A memória não deverá substituir o estado canônico dos módulos.

---

## 59. Segurança

A configuração deverá contemplar:

* criptografia em trânsito;
* criptografia em repouso;
* autenticação;
* menor privilégio;
* secrets;
* redes privadas quando aplicável;
* logs;
* auditoria;
* patches;
* backups;
* acesso emergencial.

---

## 60. Credenciais

Credenciais deverão ser separadas por:

* ambiente;
* workload;
* finalidade;
* acesso humano;
* migrations;
* backup;
* administração.

A aplicação não deverá utilizar credencial administrativa.

---

## 61. Papéis de banco

Poderão existir papéis distintos para:

* aplicação;
* migrations;
* leitura operacional;
* backup;
* observabilidade;
* administração.

A configuração deverá evitar permissões globais desnecessárias.

---

## 62. SQL injection

Toda query deverá utilizar:

* parâmetros;
* APIs seguras;
* validação;
* allowlists para estruturas dinâmicas;
* revisão.

Strings fornecidas pelo usuário não deverão ser concatenadas em SQL.

A utilização de ORM não eliminará esse risco automaticamente.

---

## 63. Dados sensíveis

Dados sensíveis deverão ser:

* minimizados;
* classificados;
* protegidos;
* excluídos de logs;
* acessados somente por necessidade;
* retidos por período definido.

Criptografia em nível de aplicação ou coluna poderá ser adotada para campos específicos quando justificada.

---

## 64. Backup

O banco deverá possuir política de backup definida.

A política deverá incluir:

* frequência;
* retenção;
* criptografia;
* owner;
* região ou localização;
* monitoramento;
* restauração;
* evidência.

---

## 65. Restore

Backups deverão ser testados por restore.

O teste deverá validar:

* disponibilidade;
* integridade;
* migrations;
* extensões;
* PostGIS;
* permissões;
* conexão da aplicação;
* dados geográficos;
* tempo observado.

---

## 66. Point-in-Time Recovery

Point-in-Time Recovery poderá ser exigido conforme:

* criticidade;
* RPO;
* uso real;
* capacidade do Provider;
* custo.

A configuração deverá ser validada por teste, não apenas por ativação.

---

## 67. Alta disponibilidade

A configuração inicial deverá ser proporcional ao estágio do produto.

Alta disponibilidade poderá envolver:

* múltiplas zonas;
* failover;
* réplica;
* storage redundante;
* backup;
* recovery.

A complexidade não deverá ser introduzida sem relação com os SLOs.

---

## 68. Réplicas de leitura

Réplicas poderão ser adotadas quando houver necessidade comprovada de:

* escala de leitura;
* relatórios;
* isolamento;
* recuperação.

A aplicação deverá considerar atraso de replicação.

Leituras que exigem consistência imediata não deverão utilizar réplica inadequada.

---

## 69. Observabilidade

Deverão ser observados:

* conexões;
* utilização do pool;
* latência;
* queries lentas;
* locks;
* deadlocks;
* storage;
* crescimento;
* cache hit;
* replication lag;
* falhas;
* backups;
* restores;
* migrations.

---

## 70. Logs

Logs do PostgreSQL deverão ser configurados para apoiar diagnóstico sem registrar dados sensíveis desnecessários.

A configuração deverá considerar:

* erros;
* conexões;
* duração;
* queries lentas;
* locks;
* checkpoints;
* falhas de autenticação.

---

## 71. Alertas

Alertas iniciais poderão cobrir:

* indisponibilidade;
* conexões próximas do limite;
* storage próximo do limite;
* backup falho;
* replication lag;
* deadlocks recorrentes;
* latência elevada;
* erro de migration;
* extensão indisponível.

---

## 72. Performance

PostgreSQL com PostGIS é considerado suficiente para o MVP e para o crescimento inicial.

A performance deverá ser tratada por:

* modelagem;
* índices;
* planos;
* pooling;
* queries;
* cache;
* particionamento quando necessário;
* capacidade do recurso.

---

## 73. Particionamento

Particionamento somente deverá ser adotado quando houver volume ou requisito comprovado.

Não deverá ser utilizado antecipadamente apenas por expectativa de escala.

---

## 74. Arquivamento

Dados históricos poderão ser arquivados quando:

* o volume justificar;
* a retenção exigir;
* a consulta operacional for afetada;
* houver estratégia de acesso;
* houver política de exclusão.

---

## 75. Testes unitários

Regras de domínio deverão ser testadas sem depender do PostgreSQL quando possível.

---

## 76. Testes de integração

Repositories, migrations e queries deverão possuir testes contra PostgreSQL real compatível com a versão adotada.

Mocks não serão evidência suficiente para:

* constraints;
* transações;
* SQL;
* PostGIS;
* índices;
* migrations;
* locks.

---

## 77. Testes geoespaciais

Deverão cobrir:

* coordenadas válidas;
* coordenadas inválidas;
* distância;
* raio;
* ordenação por proximidade;
* SRID;
* índice;
* pontos coincidentes;
* posições distantes;
* hemisférios;
* ausência de coordenada.

---

## 78. Testes de migration

O pipeline deverá validar:

* banco vazio até versão atual;
* atualização de versão anterior;
* extensão PostGIS;
* constraints;
* índices;
* seeds necessários;
* rollback ou compensação quando aplicável.

---

## 79. Testes cross-account

Deverão verificar:

* Trip de outra Account;
* Activity de outra Trip;
* Place privado de outro escopo;
* Planning Conflict de outra Trip;
* Itinerary Proposal de outra Account;
* Recommendation não autorizada;
* identificador manipulado.

---

## 80. Desenvolvimento assistido por IA

Agentes poderão apoiar:

* criação de migrations;
* queries;
* repositories;
* índices;
* fixtures;
* testes;
* análise de planos;
* documentação.

Agentes não poderão autonomamente:

* executar migration destrutiva;
* alterar ownership;
* remover constraint;
* conceder permissão;
* acessar produção;
* copiar dados reais;
* habilitar extensão não aprovada;
* criar campo `jsonb` genérico para evitar modelagem;
* adicionar acesso direto entre módulos.

---

## 81. SQL gerado por agentes

SQL produzido por agentes deverá passar por:

* revisão humana;
* teste;
* análise de impacto;
* validação de locks;
* análise de dados;
* plano de rollback ou compensação;
* observabilidade.

SQL plausível não deverá ser tratado como seguro sem execução controlada.

---

## 82. Consequências positivas

A decisão proporciona:

* integridade relacional;
* transações;
* constraints;
* maturidade;
* portabilidade;
* amplo suporte;
* consultas complexas;
* suporte geoespacial;
* índices espaciais;
* proximidade;
* flexibilidade controlada;
* boa integração com Node.js;
* serviços gerenciados;
* backup e restore;
* evolução gradual.

---

## 83. Consequências negativas

A decisão introduz:

* necessidade de administrar migrations;
* necessidade de modelagem relacional;
* necessidade de configurar PostGIS;
* necessidade de conhecimento geoespacial;
* risco de banco compartilhado gerar acoplamento;
* necessidade de pooling;
* necessidade de tuning;
* necessidade de testar backups;
* necessidade de controlar extensões;
* maior responsabilidade operacional que soluções totalmente proprietárias.

---

## 84. Riscos

### 84.1 Banco compartilhado quebrando modularidade

Mitigações:

* ownership;
* repositories privados;
* regras de importação;
* schemas;
* revisão;
* testes.

### 84.2 Consulta cross-account

Mitigações:

* escopo obrigatório;
* autorização;
* constraints;
* Row-Level Security quando adotada;
* testes negativos.

### 84.3 Uso indiscriminado de JSONB

Mitigações:

* critérios;
* schema lógico;
* revisão;
* modelagem relacional.

### 84.4 Consulta espacial incorreta

Mitigações:

* SRID explícito;
* escolha entre geometry e geography;
* testes;
* revisão;
* documentação.

### 84.5 Índice espacial ausente

Mitigações:

* planos;
* métricas;
* testes;
* análise de consultas.

### 84.6 Migration destrutiva

Mitigações:

* expand and contract;
* backup;
* review;
* pipeline;
* compensação.

### 84.7 Limite de conexões

Mitigações:

* pooling;
* métricas;
* limites;
* deployment adequado.

### 84.8 Lock-in do Provider gerenciado

Mitigações:

* PostgreSQL padrão;
* exports;
* backups;
* IaC;
* adapters;
* plano de saída.

### 84.9 Restore inválido

Mitigações:

* testes periódicos;
* evidência;
* runbook;
* alertas.

---

## 85. Controles

Deverão ser implementados progressivamente:

* migrations versionadas;
* constraints;
* ownership de tabelas;
* credenciais separadas;
* menor privilégio;
* TLS;
* backups;
* restore testado;
* testes de integração;
* testes PostGIS;
* query timeouts;
* monitoramento;
* análise de planos;
* dependency scanning do driver;
* secret scanning;
* testes cross-account.

---

## 86. Estratégia de implementação

### Etapa 1 — Ambiente local

* fixar versões;
* provisionar PostgreSQL;
* habilitar PostGIS;
* criar comandos locais;
* validar conexão.

### Etapa 2 — Migrations

* escolher ferramenta;
* criar migration inicial;
* criar mecanismo de execução;
* validar banco vazio.

### Etapa 3 — Trip Management

* modelar Account;
* modelar Trip;
* criar constraints;
* criar repository;
* criar testes.

### Etapa 4 — Place Catalog

* modelar Place;
* adicionar coordenada geográfica;
* criar índice espacial;
* testar proximidade.

### Etapa 5 — Itinerary Planning

* modelar Activity;
* modelar estrutura de Itinerary;
* criar transações;
* testar concorrência.

### Etapa 6 — Decision Intelligence e Assurance

* modelar Recommendation;
* modelar Decision;
* modelar Planning Conflict;
* preservar ciclos de vida.

### Etapa 7 — Proposal Management

* modelar Itinerary Proposal;
* registrar aceitação parcial;
* garantir atomicidade;
* gerar eventos.

### Etapa 8 — Operação

* configurar backup;
* testar restore;
* adicionar métricas;
* criar runbooks.

---

## 87. Critérios de implementação concluída

A decisão estará implementada quando:

* PostgreSQL executar localmente;
* PostGIS estiver habilitado;
* versões estiverem fixadas;
* migration inicial existir;
* ambiente puder ser recriado;
* aplicação conectar por configuração externa;
* Trip puder ser persistida;
* Place possuir coordenada geográfica;
* busca por proximidade funcionar;
* constraints forem testadas;
* transação relevante for testada;
* pipeline executar testes;
* backup e restore estiverem planejados para produção.

---

## 88. Verificação

A verificação deverá incluir:

* clone limpo;
* inicialização do banco;
* habilitação do PostGIS;
* aplicação de migrations;
* seed;
* testes;
* persistência de Trip;
* persistência de Place;
* consulta por distância;
* consulta por raio;
* tentativa cross-account;
* constraint inválida;
* transação;
* reset;
* backup;
* restore quando aplicável.

---

## 89. Métricas

Poderão ser acompanhadas:

* latência de query;
* queries lentas;
* conexões;
* pool saturation;
* deadlocks;
* locks;
* tamanho do banco;
* crescimento;
* tamanho de índices;
* consultas espaciais;
* cache hit;
* falhas de migration;
* falhas de backup;
* tempo de restore;
* erros de integridade;
* acessos cross-account bloqueados.

---

## 90. Gatilhos de revisão

A decisão deverá ser revisada quando:

* PostgreSQL não atender à escala necessária;
* a carga geoespacial exigir plataforma especializada;
* requisitos de distribuição global forem incompatíveis;
* disponibilidade exigir arquitetura diferente;
* custo se tornar desproporcional;
* um módulo exigir persistência especializada;
* busca textual exigir mecanismo dedicado;
* vetores exigirem infraestrutura específica;
* requisitos regulatórios exigirem solução distinta;
* o Provider limitar capacidades essenciais.

---

## 91. Persistências complementares

Esta decisão não impede a adoção futura de:

* cache;
* object storage;
* mecanismo de busca;
* armazenamento vetorial;
* data warehouse;
* event store;
* fila;
* banco especializado.

Essas tecnologias deverão complementar o PostgreSQL, não substituí-lo silenciosamente como fonte canônica.

---

## 92. Estratégia de rollback

A substituição do banco principal exigirá novo ADR.

A migração deverá considerar:

* schemas;
* dados;
* relações;
* constraints;
* queries;
* PostGIS;
* APIs;
* repositories;
* migrations;
* backups;
* histórico;
* operação;
* rollback.

A separação por ports e adapters deverá reduzir o acoplamento, mas não elimina o custo de migração de dados.

---

## 93. Decisões derivadas

Deverão ser registradas decisões sobre:

* ORM ou query builder;
* ferramenta de migrations;
* organização física de schemas;
* identificadores;
* Row-Level Security;
* Provider gerenciado;
* pooling;
* estratégia de busca;
* armazenamento vetorial;
* audit trail;
* Transactional Outbox.

---

## 94. Próxima decisão

O `RB-ADR-006` deverá definir a estratégia de acesso a dados em TypeScript e avaliar separadamente:

* ORM;
* query builder;
* SQL tipado;
* migrations;
* suporte a PostgreSQL;
* suporte a PostGIS;
* transparência das queries;
* modelagem do domínio;
* compatibilidade com monólito modular;
* geração de tipos;
* testabilidade.

A decisão não deverá permitir que o modelo do ORM se torne automaticamente o modelo de domínio.

---

## 95. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-005
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar contexto e consequências históricas.

---

## 96. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* PostgreSQL está justificado;
* PostGIS está justificado;
* banco compartilhado está governado;
* ownership por módulo está definido;
* transações estão definidas;
* isolamento entre Accounts está contemplado;
* dados geográficos estão definidos;
* geometry e geography estão diferenciados;
* SRID está contemplado;
* distância geográfica está diferenciada de rota;
* JSONB está governado;
* migrations estão definidas;
* backfills estão definidos;
* conexões estão contempladas;
* segurança está contemplada;
* backup está definido;
* restore está definido;
* observabilidade está definida;
* testes estão definidos;
* IA está contemplada;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* gatilhos de revisão estão definidos;
* supersessão está definida;
* ORM não foi escolhido prematuramente;
* Provider não foi escolhido prematuramente;
* não existem contradições com RB-ADR-001;
* não existem contradições com RB-ADR-002;
* não existem contradições com RB-ADR-003;
* não existem contradições com RB-ADR-004.

---

## 97. Declaração final

O RouteBook adotará PostgreSQL como banco de dados relacional principal e PostGIS como extensão geoespacial.

A decisão foi tomada porque o produto precisa combinar:

* integridade relacional;
* transações;
* constraints;
* relações de domínio;
* consultas complexas;
* dados geográficos;
* proximidade;
* distância;
* evolução controlada.

O banco será inicialmente compartilhado pela aplicação, mas os dados continuarão pertencendo aos módulos canônicos.

O compartilhamento da infraestrutura não permitirá:

* acesso arbitrário;
* escrita em tabelas externas;
* quebra de ownership;
* integração por estrutura física;
* bypass dos casos de uso.

PostGIS será utilizado para capacidades geográficas.

Ele não será tratado como substituto para Providers de rota, trânsito ou mobilidade.

JSONB será utilizado apenas quando sua flexibilidade for realmente necessária.

Ele não será utilizado como alternativa à modelagem dos conceitos canônicos.

A persistência permanecerá acessível por ports e adapters, preservando a separação entre domínio, aplicação e infraestrutura.

A escolha do ORM, do Provider e das ferramentas de migrations será realizada em decisões posteriores.
