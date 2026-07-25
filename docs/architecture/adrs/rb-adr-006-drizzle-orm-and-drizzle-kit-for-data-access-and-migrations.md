---

id: RB-ADR-006

title: Adoção de Drizzle ORM e Drizzle Kit para Acesso a Dados e Migrations
description: Registra a decisão de adotar Drizzle ORM como camada tipada de acesso ao PostgreSQL e Drizzle Kit como ferramenta principal de geração e gestão de migrations, preservando transparência SQL, suporte a PostGIS, ownership modular e separação entre persistência e domínio.

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
- drizzle-orm
- drizzle-kit
- postgresql
- postgis
- persistence
- migrations
- sql
- typescript
- nodejs
- type-safety
- modular-monolith
- data-access
- repositories

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
- RB-AI-004
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
- RB-SEC-001
- RB-QA-001
- RB-DEV-001
- RB-CICD-001
- RB-INFRA-001
- RB-ADR-001
- RB-ADR-002
- RB-ADR-003
- RB-ADR-004
- RB-ADR-005

next_documents:

- RB-ADR-007

ai_context:
priority: critical
index: true
---

# RB-ADR-006 — Adoção de Drizzle ORM e Drizzle Kit para Acesso a Dados e Migrations

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* Drizzle ORM será a ferramenta principal de acesso tipado ao PostgreSQL;
* Drizzle Kit será a ferramenta principal para geração e execução controlada de migrations;
* schemas de persistência serão definidos em TypeScript;
* SQL explícito continuará permitido e será obrigatório quando necessário;
* PostGIS será habilitado e evoluído por migrations SQL;
* repositories continuarão encapsulando a persistência;
* schemas do Drizzle não serão tratados como modelos de domínio;
* versões exatas deverão ser fixadas antes da implementação.

---

## 2. Contexto

As decisões anteriores estabeleceram:

* monólito modular como arquitetura inicial;
* TypeScript como linguagem principal;
* Node.js como runtime principal;
* Next.js como framework da aplicação web;
* monorepo com pnpm Workspaces e Turborepo;
* PostgreSQL como banco relacional principal;
* PostGIS como extensão geoespacial.

O RouteBook agora precisa definir como a aplicação TypeScript deverá:

* declarar tabelas;
* declarar colunas;
* declarar constraints;
* declarar índices;
* executar queries;
* executar transações;
* utilizar tipos geográficos;
* criar migrations;
* validar mudanças de schema;
* testar repositories;
* acessar SQL avançado;
* manter transparência operacional.

A decisão deverá preservar a separação entre:

* modelo de domínio;
* modelo lógico;
* modelo físico;
* schema de persistência;
* contratos de API;
* read models;
* outputs de inteligência artificial.

---

## 3. Problema

Qual ferramenta deverá ser utilizada para acesso a dados e migrations no RouteBook, considerando:

* PostgreSQL;
* PostGIS;
* TypeScript;
* Node.js;
* monólito modular;
* queries relacionais;
* consultas geoespaciais;
* transações;
* transparência SQL;
* tipagem;
* migrations versionadas;
* testes;
* baixo acoplamento;
* desenvolvimento assistido por agentes de IA?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. suporte de primeira classe ao PostgreSQL;
2. compatibilidade com PostGIS;
3. tipagem em TypeScript;
4. transparência das queries;
5. acesso a SQL explícito;
6. migrations versionadas;
7. controle de constraints e índices;
8. baixo acoplamento com o domínio;
9. integração com Node.js;
10. integração com Next.js;
11. integração com monorepo;
12. testabilidade;
13. desempenho previsível;
14. facilidade de revisão;
15. facilidade de análise por agentes de IA;
16. suporte a transações;
17. suporte a queries complexas;
18. baixo nível de geração implícita;
19. compatibilidade com ports e adapters;
20. possibilidade de substituição futura.

---

## 5. Restrições

A solução deverá:

* funcionar com PostgreSQL;
* permitir PostGIS;
* funcionar com TypeScript estrito;
* permitir SQL parametrizado;
* permitir transações;
* permitir migrations;
* permitir constraints;
* permitir índices;
* permitir schemas separados quando adotados;
* funcionar localmente e no CI;
* não exigir geração de cliente proprietário;
* não transformar tabelas em entidades de domínio;
* não impedir queries avançadas;
* não esconder planos de execução;
* não exigir um serviço externo;
* não criar dependência obrigatória de um Provider.

---

## 6. Opções consideradas

### 6.1 Opção A — Driver PostgreSQL e SQL manual

Utilizar diretamente um driver PostgreSQL e arquivos SQL.

#### Benefícios

* controle completo;
* máxima transparência;
* acesso total ao PostgreSQL;
* suporte integral ao PostGIS;
* ausência de abstração adicional;
* menor lock-in de biblioteca.

#### Limitações

* maior quantidade de código repetitivo;
* tipagem manual;
* mapeamentos manuais;
* maior risco de divergência entre schema e tipos;
* maior esforço para migrations;
* menor produtividade;
* maior custo de manutenção.

#### Avaliação

É tecnicamente sólido, mas transfere ao projeto responsabilidades que uma camada tipada leve pode resolver.

Foi rejeitado como estratégia principal.

SQL manual continuará permitido dentro da solução selecionada.

---

### 6.2 Opção B — Prisma ORM e Prisma Migrate

Utilizar Prisma Schema, Prisma Client e Prisma Migrate.

#### Benefícios

* experiência de desenvolvimento consolidada;
* client tipado;
* migrations integradas;
* ampla documentação;
* tooling visual;
* grande comunidade;
* integração conhecida com Next.js.

#### Limitações

* abstração maior sobre SQL;
* modelo próprio de schema;
* necessidade de geração de client;
* tipos de extensões podem exigir tratamento como `Unsupported`;
* operações de PostGIS podem exigir SQL bruto;
* risco de o modelo Prisma ser utilizado como modelo de domínio;
* menor naturalidade para queries geoespaciais avançadas;
* maior dependência das capacidades suportadas pelo client.

#### Avaliação

É adequada para aplicações relacionais comuns, mas o suporte geoespacial e a necessidade de transparência SQL reduzem sua adequação ao RouteBook.

Foi rejeitada.

---

### 6.3 Opção C — TypeORM

Utilizar entidades decoradas, Data Mapper ou Active Record e migrations.

#### Benefícios

* amplo conjunto de recursos;
* suporte a repositories;
* decorators;
* migrations;
* suporte a múltiplos bancos;
* uso conhecido em aplicações Node.js.

#### Limitações

* abstração elevada;
* risco de entidades de persistência contaminarem o domínio;
* comportamento implícito;
* relações e carregamentos potencialmente complexos;
* tipagem e inferência menos diretas;
* maior risco de queries inesperadas;
* adequação inferior ao objetivo de transparência.

#### Avaliação

Foi rejeitada por aumentar o risco de acoplamento entre domínio e persistência.

---

### 6.4 Opção D — Sequelize

Utilizar Sequelize como ORM.

#### Benefícios

* maturidade;
* suporte a múltiplos bancos;
* migrations;
* grande histórico no ecossistema Node.js.

#### Limitações

* API e tipagem menos alinhadas ao TypeScript moderno;
* maior abstração;
* maior risco de modelos anêmicos ou acoplados;
* experiência inferior para o tipo de modelagem desejado;
* menor adequação ao uso explícito de SQL e PostGIS.

#### Avaliação

Foi rejeitada.

---

### 6.5 Opção E — Kysely

Utilizar Kysely como query builder SQL tipado.

#### Benefícios

* abstração fina;
* queries próximas ao SQL;
* forte tipagem;
* suporte oficial ao PostgreSQL;
* boa previsibilidade;
* acesso a SQL;
* baixo acoplamento;
* excelente adequação a repositories.

#### Limitações

* definição dos tipos do banco exige estratégia adicional;
* sincronização entre schema e tipos precisa ser governada;
* migrations não possuem o mesmo modelo integrado de schema declarativo;
* geração e evolução do schema exigiriam ferramentas ou processos complementares;
* menor capacidade de declarar toda a estrutura em uma única fonte TypeScript.

#### Avaliação

É a principal alternativa à decisão selecionada.

Foi rejeitada neste estágio porque o RouteBook se beneficia de uma definição de schema TypeScript integrada à geração de migrations.

---

### 6.6 Opção F — Drizzle ORM e Drizzle Kit

Utilizar:

* Drizzle ORM para schema tipado e queries;
* Drizzle Kit para geração e gestão de migrations;
* SQL explícito para recursos avançados.

#### Benefícios

* schema em TypeScript;
* queries próximas ao SQL;
* forte inferência de tipos;
* acesso direto a expressões SQL;
* suporte a PostgreSQL;
* suporte a tipos customizados;
* suporte documentado a PostGIS;
* migrations SQL revisáveis;
* integração com drivers PostgreSQL;
* baixa carga de runtime;
* boa adequação ao monólito modular;
* separação compatível com repositories;
* ausência de client proprietário gerado.

#### Limitações

* ferramenta mais recente que ORMs tradicionais;
* APIs podem evoluir;
* Drizzle Kit exige revisão cuidadosa das migrations geradas;
* PostGIS exige migration explícita para extensão;
* queries avançadas ainda exigirão SQL;
* risco de schema do Drizzle ser confundido com domínio;
* risco de uso indiscriminado de relational queries;
* necessidade de fixar versões cuidadosamente.

#### Avaliação

Oferece o melhor equilíbrio entre tipagem, transparência SQL, migrations e suporte geoespacial.

Foi selecionada.

---

## 7. Decisão

O RouteBook adotará:

* **Drizzle ORM** como camada principal de acesso tipado ao PostgreSQL;
* **Drizzle Kit** como ferramenta principal para geração e gestão de migrations;
* **driver PostgreSQL aprovado** como mecanismo de conexão;
* **SQL explícito e parametrizado** para funcionalidades não representadas adequadamente pela API tipada;
* **migrations SQL versionadas** como fonte operacional das alterações aplicadas;
* **schemas Drizzle em TypeScript** como representação do modelo físico esperado.

A solução será utilizada dentro dos adapters de persistência.

---

## 8. Escopo da decisão

Esta decisão define:

* ferramenta de acesso a dados;
* ferramenta principal de migrations;
* papel dos schemas TypeScript;
* uso de SQL explícito;
* fronteira com repositories;
* integração com PostGIS;
* critérios de segurança;
* critérios de testes.

Esta decisão não define:

* Provider do PostgreSQL;
* driver PostgreSQL final;
* estratégia de pooling;
* organização final dos schemas físicos;
* Row-Level Security;
* formato definitivo dos identificadores;
* política de auditoria;
* Transactional Outbox;
* extensão vetorial;
* ferramenta de backup;
* arquitetura de busca.

---

## 9. Princípio central

O Drizzle deverá representar e acessar o modelo físico da persistência.

Ele não deverá representar o modelo conceitual completo do domínio.

```text
Modelo de domínio
→ port de persistência
→ repository
→ Drizzle ORM ou SQL
→ PostgreSQL
```

Fluxo inverso:

```text
PostgreSQL
→ row tipada
→ mapeamento
→ entidade, value object ou read model
```

---

## 10. Localização arquitetural

Drizzle deverá permanecer na camada de infraestrutura ou adapter.

Estrutura conceitual:

```text
module/
├── domain/
├── application/
├── ports/
├── adapters/
│   └── persistence/
│       ├── drizzle/
│       ├── repositories/
│       └── mappers/
└── tests/
```

O domínio não deverá importar:

* `drizzle-orm`;
* driver PostgreSQL;
* schema de tabela;
* migration;
* tipo de coluna;
* expressão SQL.

---

## 11. Schemas do Drizzle

Schemas deverão declarar:

* tabelas;
* colunas;
* tipos físicos;
* valores padrão;
* constraints;
* foreign keys;
* índices;
* schemas PostgreSQL;
* relações de consulta quando necessárias.

Eles não deverão conter:

* regras complexas de negócio;
* decisões de aplicação;
* autorização;
* lógica de recomendação;
* lógica de Planning Conflict;
* aplicação de Itinerary Proposal;
* acesso a Providers.

---

## 12. Organização dos schemas

A organização deverá preservar ownership modular.

Estrutura conceitual:

```text
persistence/
├── schemas/
│   ├── identity-and-access/
│   ├── trip-management/
│   ├── traveler-profile/
│   ├── place-catalog/
│   ├── trip-collection/
│   ├── itinerary-planning/
│   ├── decision-intelligence/
│   ├── planning-assurance/
│   └── proposal-management/
├── migrations/
└── database/
```

A estrutura física poderá evoluir, mas o ownership deverá permanecer explícito.

---

## 13. Package de persistência

No monorepo, a persistência não deverá ser extraída automaticamente para um package global.

Ela poderá permanecer em `apps/web` enquanto:

* for utilizada somente pela aplicação principal;
* pertencer ao monólito modular;
* não existir segundo consumidor legítimo;
* a extração não gerar benefício comprovado.

Um package poderá ser criado futuramente para:

* migrations;
* schema físico compartilhado por workers;
* tooling de banco;
* testes integrados.

A criação deverá seguir o `RB-ADR-004`.

---

## 14. Tabelas e modelos de domínio

Uma tabela Drizzle não deverá ser exportada como entidade de domínio.

Exemplo inadequado:

```typescript
export type Trip = typeof trips.$inferSelect;
```

quando esse tipo for utilizado como representação canônica de `Trip` em todo o sistema.

O tipo inferido poderá ser utilizado como:

* database row;
* persistence record;
* insert model;
* update model;
* read model técnico.

O domínio deverá possuir seus próprios conceitos quando houver comportamento ou invariantes.

---

## 15. Tipos inferidos

A inferência do Drizzle poderá ser utilizada para reduzir duplicação na camada de persistência.

Exemplos conceituais:

```typescript
type TripRow = typeof trips.$inferSelect;
type NewTripRow = typeof trips.$inferInsert;
```

Esses tipos deverão permanecer próximos ao adapter.

Eles não deverão atravessar automaticamente:

* API;
* frontend;
* domínio;
* eventos;
* Tools;
* Structured Outputs.

---

## 16. Mapeadores

Repositories deverão utilizar mapeadores quando o modelo físico e o domínio forem diferentes.

Responsabilidades:

* converter IDs;
* construir Value Objects;
* validar valores persistidos;
* traduzir datas;
* traduzir dinheiro;
* traduzir geografia;
* reconstruir aggregates;
* converter estado;
* impedir vazamento de colunas técnicas.

---

## 17. Repositories

Cada módulo deverá definir seus ports de persistência.

Exemplo conceitual:

```typescript
interface TripRepository {
  findById(input: {
    accountId: AccountId;
    tripId: TripId;
  }): Promise<Trip | null>;

  save(trip: Trip): Promise<void>;
}
```

A implementação poderá utilizar Drizzle.

O port não deverá expor:

* query builder;
* transaction object;
* schema;
* row;
* SQL;
* client do banco.

---

## 18. Queries de leitura

Read models poderão utilizar queries especializadas sem reconstruir aggregates completos.

Exemplos:

* resumo da Trip;
* lista de Places próximos;
* agenda diária;
* painel de conflitos;
* lista de Recommendations;
* histórico de propostas.

Essas queries deverão:

* respeitar ownership;
* respeitar autorização;
* retornar contratos explícitos;
* permanecer testáveis;
* não alterar dados.

---

## 19. Command e Query Separation

O RouteBook poderá separar:

* repositories de escrita;
* query services;
* read models.

Essa separação não exige CQRS distribuído.

Ela deverá existir apenas quando melhorar:

* clareza;
* desempenho;
* projeção;
* modelagem;
* experiência de interface.

---

## 20. SQL explícito

SQL explícito será permitido e esperado para:

* PostGIS;
* Common Table Expressions;
* window functions;
* queries analíticas;
* índices avançados;
* constraints não suportadas diretamente;
* locks;
* operações em lote;
* planos otimizados;
* extensões PostgreSQL.

O uso de SQL deverá permanecer:

* parametrizado;
* revisado;
* testado;
* localizado;
* observável;
* associado ao módulo owner.

---

## 21. SQL bruto inseguro

Não deverão ser utilizadas APIs inseguras com interpolação direta de dados externos.

Valores de usuário não deverão ser concatenados em:

* filtros;
* ordenações;
* nomes de tabela;
* nomes de coluna;
* expressões;
* fragments.

Elementos estruturais dinâmicos deverão utilizar allowlists.

---

## 22. PostGIS

PostGIS deverá ser habilitado por migration explícita.

Exemplo conceitual:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

A migration deverá ser:

* revisada;
* executada por credencial autorizada;
* compatível com o Provider;
* testada localmente;
* validada no CI;
* documentada.

O Drizzle não deverá ser considerado responsável por provisionar automaticamente a extensão.

---

## 23. Tipos geoespaciais

Schemas poderão utilizar suporte nativo, custom types ou SQL explícito conforme a versão adotada.

A representação deverá preservar:

* `geometry` ou `geography`;
* subtipo;
* SRID;
* nulabilidade;
* origem;
* precisão.

Exemplo conceitual:

```typescript
const places = pgTable("places", {
  id: uuid("id").primaryKey(),
  location: geometry("location", {
    type: "point",
    mode: "xy",
    srid: 4326,
  }).notNull(),
});
```

A sintaxe final deverá ser validada contra a versão fixada.

---

## 24. Consultas geoespaciais

Operações espaciais poderão utilizar expressões SQL tipadas.

Casos:

* distância entre Place e hospedagem;
* busca em raio;
* ordenação por proximidade;
* interseção com região;
* bounding box;
* verificação de coordenada.

Toda consulta deverá distinguir:

* distância geográfica;
* distância por rota;
* duração estimada;
* modo de deslocamento.

---

## 25. Índices espaciais

Índices PostGIS deverão ser criados por migration.

Exemplo conceitual:

```sql
CREATE INDEX places_location_gix
ON places
USING GIST (location);
```

A criação deverá ser acompanhada de:

* consulta alvo;
* plano de execução;
* impacto de escrita;
* teste;
* métrica.

---

## 26. Tipos customizados

Custom types poderão ser utilizados quando:

* o PostgreSQL ou extensão fornecer tipo não abstraído;
* o mapeamento for estável;
* a representação JavaScript estiver definida;
* houver testes;
* a migration correspondente existir.

Um custom type deverá declarar:

* nome SQL;
* tipo de entrada;
* tipo de saída;
* transformação;
* limites;
* owner.

---

## 27. Migrations como código

Toda mudança física deverá possuir migration versionada.

O repositório deverá armazenar:

* arquivo SQL;
* metadados necessários;
* ordem;
* histórico;
* documentação quando relevante.

Migrations aplicadas não deverão ser reescritas para alterar o histórico.

Uma correção deverá gerar nova migration.

---

## 28. Geração de migrations

Drizzle Kit poderá gerar migrations a partir das diferenças do schema.

A geração não autoriza aplicação automática.

O fluxo deverá ser:

```text
alteração do schema TypeScript
→ geração da migration
→ revisão do SQL
→ testes
→ aprovação
→ aplicação controlada
```

---

## 29. Revisão obrigatória de migrations

Toda migration gerada deverá ser revisada quanto a:

* operação destrutiva;
* perda de dados;
* locks;
* duração;
* defaults;
* nulabilidade;
* constraints;
* índices;
* extensão;
* compatibilidade;
* rollback ou compensação;
* ordem de deployment.

A geração automática não transfere responsabilidade à ferramenta.

---

## 30. Uso de `push`

Comandos que sincronizam diretamente o schema com o banco poderão ser permitidos apenas em ambientes locais descartáveis.

Não deverão ser utilizados como mecanismo padrão de alteração em:

* staging;
* produção;
* ambientes compartilhados;
* bancos com dados relevantes.

Ambientes controlados deverão utilizar migrations versionadas.

---

## 31. Migrations manuais

Migrations SQL manuais serão necessárias para:

* extensões;
* PostGIS;
* funções;
* triggers;
* policies;
* views;
* materialized views;
* índices especializados;
* operações de dados;
* backfills;
* constraints avançadas.

Elas deverão coexistir com migrations geradas dentro do mesmo histórico governado.

---

## 32. Ordem das migrations

A ordem deverá ser determinística.

Uma migration deverá possuir:

* identificador;
* timestamp ou sequência;
* descrição;
* owner;
* dependências quando relevantes.

Não deverão existir migrations diferentes com a mesma posição lógica.

---

## 33. Execução de migrations

Migrations deverão ser executadas:

* por pipeline controlado;
* com credencial própria;
* em ordem;
* uma vez;
* com logs;
* com timeout;
* com tratamento de falhas;
* com verificação posterior.

A aplicação web não deverá executar automaticamente migrations de produção durante seu startup.

---

## 34. Credencial de migration

A credencial de migration poderá possuir permissões maiores que a aplicação.

Ela deverá:

* ser separada;
* ser utilizada somente no pipeline autorizado;
* possuir proteção;
* possuir auditoria;
* não ser entregue ao runtime normal.

---

## 35. Migration tracking

O banco deverá registrar quais migrations foram aplicadas.

O mecanismo deverá permitir identificar:

* migration;
* checksum quando suportado;
* instante;
* ambiente;
* resultado;
* execução.

Divergências entre histórico e banco deverão bloquear promoção até análise.

---

## 36. Expand and Contract

Mudanças incompatíveis deverão utilizar estratégia progressiva.

Exemplo:

1. adicionar nova coluna;
2. aceitar estrutura antiga e nova;
3. executar backfill;
4. alterar leituras;
5. alterar escritas;
6. verificar;
7. remover estrutura antiga.

Drizzle Kit não deverá ser utilizado para aplicar renomeações destrutivas sem revisão.

---

## 37. Renomeações

Uma alteração detectada como rename deverá ser validada para evitar que seja traduzida como:

* drop;
* create;
* perda de dados.

Quando houver dúvida, deverá ser criada migration manual.

---

## 38. Backfills

Backfills relevantes não deverão ser escondidos dentro de uma migration transacional longa.

Eles deverão possuir:

* script ou job;
* checkpoint;
* batches;
* métricas;
* idempotência;
* pausa;
* retomada;
* verificação;
* owner.

---

## 39. Transações

Drizzle deverá ser utilizado para executar transações nos casos de uso que exijam atomicidade.

A fronteira transacional deverá permanecer na camada de aplicação ou em serviço técnico autorizado.

O domínio não deverá conhecer o objeto de transação do Drizzle.

---

## 40. Contexto transacional

Repositories participantes de uma transação poderão receber uma abstração de unidade de trabalho.

Não deverão receber diretamente um objeto genérico do Drizzle em suas interfaces de domínio.

Estratégia conceitual:

```typescript
interface UnitOfWork {
  execute<T>(operation: (context: TransactionContext) => Promise<T>): Promise<T>;
}
```

A implementação poderá encapsular a transação do Drizzle.

---

## 41. Transações entre módulos

Transações entre módulos deverão seguir o `RB-ADR-005`.

O fato de todos utilizarem Drizzle e o mesmo banco não autoriza:

* escrita cruzada;
* repositories globais;
* imports de schemas externos;
* alteração direta de tabelas de outro módulo.

---

## 42. Conexões

A criação do client deverá ser centralizada na infraestrutura.

Deverão existir configurações para:

* URL;
* TLS;
* pool;
* timeout;
* limite;
* application name;
* ambiente;
* shutdown.

Módulos não deverão criar conexões próprias arbitrariamente.

---

## 43. Driver PostgreSQL

O driver final deverá ser compatível com:

* ambiente Node.js;
* estratégia de deployment;
* pooling;
* transações;
* PostGIS;
* observabilidade;
* testes.

A escolha poderá avaliar:

* `pg`;
* drivers serverless;
* proxies;
* adapters gerenciados.

Ela deverá ser registrada quando tiver impacto estrutural.

---

## 44. Serverless e conexões

Caso o RouteBook utilize execução serverless, a estratégia deverá considerar:

* criação frequente de instâncias;
* limite de conexões;
* pooling externo;
* prepared statements;
* transações;
* latência;
* compatibilidade do driver.

A ferramenta de persistência não elimina esses requisitos.

---

## 45. Next.js

O client de banco deverá permanecer apenas no servidor.

Ele não deverá ser incluído em:

* Client Components;
* bundles do navegador;
* código compartilhado com o cliente;
* packages de interface.

Server Components, Route Handlers e Server Functions poderão chamar casos de uso que utilizem repositories.

Eles não deverão importar schemas diretamente por conveniência.

---

## 46. Cache do framework

Resultados de banco privados não deverão utilizar cache compartilhado sem escopo correto.

Toda estratégia deverá considerar:

* Account;
* Trip;
* identidade;
* invalidação;
* sensibilidade;
* consistência.

O Drizzle não deverá ser tratado como mecanismo de cache.

---

## 47. Row-Level Security

Caso Row-Level Security seja adotada, Drizzle deverá ser configurado para respeitar:

* roles;
* policies;
* contexto da transação;
* pooling;
* jobs;
* migrations;
* testes.

RLS não deverá ser habilitada sem decisão específica e validação operacional.

---

## 48. Segurança entre Accounts

Toda query que acesse dados de uma Account deverá possuir escopo explícito ou proteção equivalente.

Exemplo conceitual:

```typescript
await db
  .select()
  .from(trips)
  .where(
    and(
      eq(trips.id, tripId),
      eq(trips.accountId, accountId),
    ),
  );
```

Buscar apenas por `tripId` não deverá ser o padrão quando o recurso for multi-tenant.

---

## 49. Queries dinâmicas

Filtros e ordenações dinâmicas deverão utilizar composições seguras.

Campos ordenáveis deverão utilizar allowlist.

Exemplo conceitual:

```typescript
const sortableColumns = {
  name: places.name,
  distance: distanceExpression,
} as const;
```

Valores externos não deverão definir diretamente identificadores SQL.

---

## 50. Paginação

Queries deverão utilizar paginação adequada ao caso.

O Drizzle poderá construir:

* cursor pagination;
* keyset pagination;
* offset pagination.

A API do repository ou query service deverá expressar a semântica, não os detalhes da biblioteca.

---

## 51. Observabilidade de queries

A infraestrutura deverá permitir observar:

* operação;
* módulo;
* duração;
* sucesso;
* falha;
* timeout;
* quantidade de rows quando seguro;
* correlação;
* transação;
* ambiente.

SQL completo e parâmetros não deverão ser registrados indiscriminadamente.

---

## 52. Logs sensíveis

Não deverão ser registrados:

* tokens;
* passwords;
* dados pessoais completos;
* localização precisa sem finalidade;
* prompts;
* payloads de Provider;
* valores de campos sensíveis;
* connection strings.

Logs de query deverão ser reduzidos ou sanitizados em produção.

---

## 53. Queries lentas

Queries lentas deverão ser investigadas por:

* plano de execução;
* volume;
* índices;
* seletividade;
* joins;
* filtros;
* locks;
* transferência de dados;
* N+1;
* consulta espacial.

A solução não deverá ser adicionar cache automaticamente sem identificar a causa.

---

## 54. N+1

Queries relacionais deverão ser avaliadas para evitar múltiplas consultas desnecessárias.

A correção poderá utilizar:

* joins;
* subqueries;
* CTEs;
* agregações;
* batching;
* query específica.

Carregamento automático e indiscriminado de todas as relações também deverá ser evitado.

---

## 55. Seleção explícita

Queries deverão selecionar somente as colunas necessárias quando isso melhorar:

* segurança;
* desempenho;
* clareza;
* tamanho do payload.

Não deverá ser utilizado `select *` como padrão em read models sensíveis.

---

## 56. Escritas

Operações de insert e update deverão declarar os campos permitidos.

Objetos recebidos da interface não deverão ser repassados diretamente ao Drizzle.

Fluxo esperado:

```text
input externo
→ validação
→ command
→ caso de uso
→ modelo de persistência controlado
→ insert ou update
```

---

## 57. Updates parciais

Updates parciais deverão distinguir:

* campo ausente;
* campo com valor;
* remoção explícita;
* `null`;
* `undefined`.

Objetos genéricos de patch não deverão permitir atualização de campos protegidos.

---

## 58. Upserts

Upserts deverão ser utilizados apenas quando a semântica de conflito estiver definida.

Deverão considerar:

* constraint alvo;
* idempotência;
* ownership;
* campos atualizados;
* concorrência;
* eventos.

---

## 59. Deletes

Deletes deverão seguir a política do dado.

A operação poderá representar:

* exclusão física;
* invalidação;
* arquivamento;
* anonimização;
* expiração.

A API genérica `deleteById` não deverá substituir a semântica do domínio.

---

## 60. Constraints

Constraints deverão ser definidas no schema e confirmadas nas migrations.

Exemplos:

* `notNull`;
* `unique`;
* foreign key;
* check;
* índice único parcial;
* constraint de intervalo;
* constraint espacial.

Quando o Drizzle não representar uma constraint adequadamente, deverá ser utilizado SQL manual.

---

## 61. Foreign keys

Foreign keys deverão respeitar ownership.

Uma foreign key entre módulos somente deverá ser criada quando:

* a relação for canônica;
* o acoplamento estiver aceito;
* o ciclo de vida for compatível;
* a evolução futura tiver sido avaliada.

A ausência de foreign key não elimina a necessidade de integridade na aplicação.

---

## 62. Cascades

Cascades de exclusão deverão ser utilizadas com cautela.

Não deverão atravessar módulos ou ciclos de vida relevantes sem decisão explícita.

Operações destrutivas implícitas deverão ser evitadas.

---

## 63. Enums

Enums físicos deverão considerar o custo de migration.

Poderão ser utilizados:

* enum PostgreSQL;
* texto com check constraint;
* tabela de referência.

A escolha deverá considerar:

* frequência de evolução;
* compatibilidade;
* domínio;
* ferramentas.

O enum TypeScript não deverá ser a única proteção.

---

## 64. Datas e horários

O mapeamento deverá preservar:

* data civil;
* timestamp;
* timezone;
* duração;
* janela de tempo.

A conversão automática para `Date` deverá ser validada conforme o tipo PostgreSQL.

O planejamento de viagem não deverá perder o timezone do destino.

---

## 65. Numeric e dinheiro

Tipos `numeric` deverão possuir estratégia de representação em JavaScript.

Não deverá ser assumido que todo valor será convertido corretamente para `number`.

Valores monetários deverão preservar precisão por:

* string;
* decimal library;
* integer minor units;
* mapeamento controlado.

---

## 66. Bigint

Campos `bigint` deverão possuir estratégia explícita.

A conversão para `number` somente será segura quando o intervalo estiver garantido.

Alternativas:

* `bigint`;
* string;
* value object;
* parser controlado.

---

## 67. JSONB

Campos JSONB deverão possuir tipos e validação em runtime.

A inferência TypeScript não garante que valores antigos ou externos estejam corretos.

O adapter deverá validar estruturas relevantes antes do uso.

---

## 68. Validação em runtime

Dados recuperados do banco poderão exigir validação quando:

* forem JSONB;
* forem produzidos por migration antiga;
* vierem de Provider;
* representarem output de IA;
* utilizarem tipo customizado;
* forem reconstruídos em domínio.

O banco é confiável para constraints aplicadas, mas não substitui toda validação semântica.

---

## 69. Views

Views poderão ser utilizadas para:

* read models;
* relatórios;
* projeções;
* compatibilidade;
* encapsulamento de consulta.

Deverão possuir:

* owner;
* migration;
* testes;
* documentação;
* controle de acesso.

---

## 70. Materialized Views

Materialized views somente deverão ser adotadas quando houver:

* consulta cara;
* tolerância a defasagem;
* estratégia de refresh;
* observabilidade;
* owner.

Elas não deverão se tornar fonte canônica.

---

## 71. Funções e triggers

Funções e triggers PostgreSQL poderão ser utilizadas quando houver benefício claro.

Deverão ser evitadas para esconder regras centrais do domínio.

Casos possíveis:

* auditoria técnica;
* manutenção de campo derivado;
* constraint avançada;
* outbox;
* atualização de índice.

Toda lógica deverá ser documentada e testada.

---

## 72. Testes unitários

Domínio e aplicação deverão ser testados sem Drizzle quando possível.

Ports poderão utilizar fakes ou mocks controlados.

Esses testes não substituem testes de integração.

---

## 73. Testes de integração

Repositories deverão ser testados contra PostgreSQL real com PostGIS.

Deverão validar:

* schema;
* constraints;
* queries;
* transações;
* mappings;
* PostGIS;
* migrations;
* concorrência relevante;
* autorização por escopo.

---

## 74. Banco efêmero para testes

Testes poderão utilizar:

* container;
* banco temporário;
* schema isolado;
* database isolada.

A estratégia deverá garantir:

* repetibilidade;
* limpeza;
* paralelismo;
* versão compatível;
* PostGIS habilitado.

---

## 75. Migrations no CI

O pipeline deverá executar ao menos:

1. banco vazio;
2. habilitação das extensões;
3. todas as migrations;
4. validação do schema;
5. testes de integração;
6. verificação de divergência.

Quando possível, deverá também testar upgrade a partir de versão anterior relevante.

---

## 76. Snapshot de schema

O projeto poderá manter mecanismos para comparar:

* schema declarado;
* migrations;
* banco aplicado.

Divergências não explicadas deverão falhar no CI.

---

## 77. Seeds

Seeds poderão utilizar Drizzle para inserir dados sintéticos.

Eles deverão:

* ser determinísticos;
* respeitar constraints;
* utilizar valores seguros;
* representar cenários;
* evitar dados reais;
* ser separados por finalidade.

---

## 78. Agentes de IA

Agentes poderão apoiar:

* schemas;
* queries;
* migrations;
* repositories;
* mappers;
* testes;
* análise de planos.

Eles deverão receber:

* módulo owner;
* documentos canônicos;
* schema atual;
* migration atual;
* critérios de aceite;
* restrições;
* testes esperados.

---

## 79. Limites para agentes

Agentes não poderão autonomamente:

* executar migration em produção;
* utilizar `push` em ambiente relevante;
* remover coluna;
* remover constraint;
* alterar ownership;
* criar acesso cross-module;
* criar SQL inseguro;
* adicionar `any`;
* transformar row em entidade canônica;
* introduzir JSONB para evitar modelagem;
* alterar credenciais;
* habilitar extensão;
* criar cascade destrutiva.

---

## 80. Revisão de código gerado

Código de persistência gerado por IA deverá passar por:

* typecheck;
* lint;
* testes;
* revisão do SQL;
* revisão do plano;
* revisão de segurança;
* revisão do ownership;
* revisão de migration;
* validação de dados.

---

## 81. Consequências positivas

A decisão proporciona:

* tipagem em TypeScript;
* schema declarativo;
* queries próximas ao SQL;
* migrations SQL revisáveis;
* suporte ao PostgreSQL;
* suporte ao PostGIS;
* baixo overhead;
* transparência;
* flexibilidade;
* integração com repositories;
* ausência de client proprietário gerado;
* boa adequação ao monorepo;
* maior clareza para agentes de IA.

---

## 82. Consequências negativas

A decisão introduz:

* dependência do Drizzle;
* necessidade de acompanhar evolução da ferramenta;
* necessidade de revisar migrations geradas;
* necessidade de SQL manual para recursos avançados;
* necessidade de governar tipos customizados;
* risco de vazamento dos tipos de tabela;
* risco de uso de schemas como domínio;
* necessidade de configurar drivers e pooling separadamente.

---

## 83. Riscos

### 83.1 Schema de persistência tornando-se domínio

Mitigações:

* mappers;
* ports;
* repositories;
* imports controlados;
* testes arquiteturais.

### 83.2 Migration gerada incorretamente

Mitigações:

* revisão obrigatória;
* testes;
* banco efêmero;
* plano de rollback;
* aplicação controlada.

### 83.3 Mudança de API da ferramenta

Mitigações:

* versões fixadas;
* atualizações controladas;
* adapters;
* testes;
* ADR de revisão quando necessário.

### 83.4 PostGIS parcialmente suportado

Mitigações:

* SQL explícito;
* custom types;
* migrations manuais;
* testes reais;
* ausência de dependência exclusiva da abstração.

### 83.5 Query cross-account

Mitigações:

* escopo explícito;
* query helpers autorizados;
* testes negativos;
* RLS quando adotada.

### 83.6 SQL inseguro

Mitigações:

* parametrização;
* allowlists;
* revisão;
* lint;
* testes.

### 83.7 Cache ou pooling incompatível

Mitigações:

* escolha explícita do driver;
* testes no ambiente de deployment;
* métricas;
* limites.

### 83.8 Uso de versões beta

Mitigações:

* adotar versões estáveis aprovadas;
* evitar APIs experimentais;
* bloquear atualizações automáticas de versão principal;
* validar release notes.

---

## 84. Controles

Deverão ser implementados:

* versões fixadas;
* lockfile;
* schemas por módulo;
* repositories privados;
* migrations versionadas;
* revisão de SQL;
* testes de integração;
* testes de migrations;
* testes PostGIS;
* instalação imutável;
* secret scanning;
* dependency scanning;
* query timeouts;
* logs sanitizados;
* validação arquitetural;
* proibição de acesso no cliente.

---

## 85. Estratégia de implementação

### Etapa 1 — Dependências

* adicionar Drizzle ORM;
* adicionar Drizzle Kit;
* adicionar driver PostgreSQL;
* fixar versões;
* validar compatibilidade.

### Etapa 2 — Configuração

* criar configuração;
* definir diretórios;
* configurar conexão por ambiente;
* separar credenciais.

### Etapa 3 — Migration inicial

* habilitar PostGIS;
* criar schemas iniciais;
* aplicar migration;
* validar em banco vazio.

### Etapa 4 — Trip Management

* criar tabela de Trip;
* criar repository;
* criar mapper;
* testar escopo por Account;
* testar transação.

### Etapa 5 — Place Catalog

* criar tabela de Place;
* criar campo geográfico;
* criar índice espacial;
* criar query de proximidade;
* testar distância.

### Etapa 6 — Demais módulos

* adicionar schemas conforme o roadmap;
* preservar ownership;
* evitar extrações prematuras.

### Etapa 7 — CI/CD

* validar migrations;
* executar testes integrados;
* detectar drift;
* gerar evidências.

---

## 86. Critérios de implementação concluída

A decisão estará implementada quando:

* Drizzle ORM estiver configurado;
* Drizzle Kit estiver configurado;
* versões estiverem fixadas;
* conexão com PostgreSQL funcionar;
* migration inicial existir;
* PostGIS estiver habilitado;
* schema de Trip existir;
* repository de Trip existir;
* schema de Place possuir localização;
* consulta espacial funcionar;
* migrations executarem no CI;
* testes de integração passarem;
* acesso cross-account estiver testado;
* aplicação não importar Drizzle no domínio ou no cliente.

---

## 87. Verificação

A verificação deverá incluir:

* instalação limpa;
* typecheck;
* lint;
* geração de migration;
* revisão do SQL;
* aplicação em banco vazio;
* execução repetida segura;
* testes de repository;
* transação;
* constraint;
* PostGIS;
* busca por raio;
* ordenação por distância;
* erro cross-account;
* rollback ou compensação de migration relevante;
* build do Next.js.

---

## 88. Métricas

Poderão ser acompanhadas:

* falhas de migration;
* drift;
* tempo de migrations;
* tempo de queries;
* queries lentas;
* erros de mapping;
* erros de constraint;
* acessos cross-account bloqueados;
* quantidade de SQL manual;
* tipos customizados;
* cobertura de repositories;
* regressões de query;
* vulnerabilidades da dependência.

---

## 89. Gatilhos de revisão

A decisão deverá ser revisada quando:

* Drizzle não suportar requisito central;
* migrations apresentarem risco operacional recorrente;
* PostGIS exigir bypass excessivo;
* a ferramenta deixar de receber manutenção adequada;
* mudanças incompatíveis forem frequentes;
* a produtividade se tornar inferior às alternativas;
* a tipagem não representar corretamente o schema;
* o projeto exigir múltiplos bancos com suporte inadequado;
* outra ferramenta demonstrar benefício material.

---

## 90. Estratégia de rollback

A substituição do Drizzle deverá ser registrada em novo ADR.

A migração deverá preservar:

* schema;
* migrations aplicadas;
* repositories;
* ports;
* contratos;
* queries;
* PostGIS;
* transações;
* testes;
* operação.

A separação por repositories deverá permitir substituir a implementação sem alterar o domínio.

As migrations já aplicadas permanecerão parte do histórico do banco.

---

## 91. Alternativas futuras permitidas

Esta decisão não impede:

* SQL manual;
* query services especializados;
* ferramentas de análise;
* geração de tipos;
* bibliotecas geoespaciais;
* ferramenta distinta para backfills;
* ferramenta de schema diff complementar;
* Kysely em componente especializado, mediante decisão.

A coexistência não deverá criar duas estratégias concorrentes sem governança.

---

## 92. Decisões derivadas

Deverão ser avaliadas decisões sobre:

* driver PostgreSQL e pooling;
* organização física de schemas;
* estratégia de identificadores;
* autenticação;
* Row-Level Security;
* Transactional Outbox;
* audit trail;
* Provider gerenciado;
* armazenamento vetorial;
* mecanismo de busca.

---

## 93. Próxima decisão

O `RB-ADR-007` deverá definir a estratégia de identidade, autenticação e sessão.

A decisão deverá avaliar:

* autenticação gerenciada;
* autenticação implementada internamente;
* OAuth e OpenID Connect;
* login social;
* e-mail e senha;
* magic link;
* sessão baseada em cookie;
* tokens;
* integração com Next.js;
* Account;
* autorização server-side;
* possibilidade de evolução para múltiplos usuários por Account.

A decisão não deverá confundir autenticação com autorização.

---

## 94. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-006
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o novo ADR;
* permanecer disponível;
* preservar o contexto histórico.

---

## 95. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* Drizzle ORM está justificado;
* Drizzle Kit está justificado;
* Prisma foi avaliado;
* Kysely foi avaliado;
* SQL manual está governado;
* domínio está separado;
* repositories estão definidos;
* schemas estão organizados por ownership;
* PostGIS está contemplado;
* custom types estão governados;
* migrations estão definidas;
* `push` está restrito;
* expand and contract está definido;
* transações estão definidas;
* segurança entre Accounts está definida;
* conexão está contemplada;
* observabilidade está definida;
* testes estão definidos;
* agentes de IA estão contemplados;
* consequências estão registradas;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* gatilhos de revisão estão definidos;
* supersessão está definida;
* não existem contradições com RB-ADR-001;
* não existem contradições com RB-ADR-002;
* não existem contradições com RB-ADR-003;
* não existem contradições com RB-ADR-004;
* não existem contradições com RB-ADR-005.

---

## 96. Declaração final

O RouteBook adotará Drizzle ORM e Drizzle Kit como base para acesso tipado ao PostgreSQL e gestão de migrations.

A decisão foi tomada porque essa combinação oferece:

* integração natural com TypeScript;
* queries próximas ao SQL;
* schemas declarativos;
* migrations revisáveis;
* flexibilidade para PostgreSQL;
* suporte a PostGIS;
* baixo acoplamento operacional;
* boa compatibilidade com repositories.

O Drizzle será tratado como ferramenta de persistência.

Ele não será tratado como:

* modelo de domínio;
* mecanismo de autorização;
* contrato de API;
* substituto para validação;
* substituto para revisão de SQL;
* substituto para testes;
* substituto para governança de migrations.

Toda migration gerada deverá ser revisada.

Toda operação geoespacial relevante deverá ser testada contra PostgreSQL com PostGIS.

Toda query multi-tenant deverá preservar o escopo da Account.

SQL explícito continuará sendo uma ferramenta de primeira classe quando oferecer maior clareza, segurança ou acesso a funcionalidades específicas do PostgreSQL.

A arquitetura de ports, adapters e repositories deverá permitir que a ferramenta seja substituída futuramente sem reescrever o domínio do RouteBook.
