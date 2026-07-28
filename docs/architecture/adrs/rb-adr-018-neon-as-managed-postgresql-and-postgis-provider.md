---

id: RB-ADR-018

title: Adoção do Neon como Provider Gerenciado de PostgreSQL e PostGIS
description: Registra a decisão de adotar o Neon como Provider inicial de PostgreSQL e PostGIS gerenciado, com pooling compatível com execução serverless, branches isoladas para desenvolvimento e Preview, recuperação point-in-time e preservação da portabilidade do banco.

document_type: architecture_decision_record
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
- postgresql
- postgis
- neon
- managed-database
- database-branching
- connection-pooling
- serverless
- backups
- point-in-time-recovery
- vercel
- drizzle
- infrastructure
- portability

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-002
- RB-PRD-006
- RB-PRD-007
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
- RB-GOV-001
- RB-GOV-002
- RB-RISK-001
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
- RB-ADR-015
- RB-ADR-016
- RB-ADR-017

prerequisites:

- RB-FND-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-ARC-005
- RB-DATA-001
- RB-DATA-002
- RB-SEC-001
- RB-SEC-002
- RB-PRIV-001
- RB-OBS-001
- RB-QA-001
- RB-QA-002
- RB-OPS-001
- RB-SRE-001
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
- RB-ADR-015
- RB-ADR-017

next_documents:

- RB-ADR-019

ai_context:
priority: critical
index: true
---

# RB-ADR-018 — Adoção do Neon como Provider Gerenciado de PostgreSQL e PostGIS

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* Neon será o Provider inicial de PostgreSQL gerenciado;
* PostGIS será habilitado por migration controlada;
* PostgreSQL continuará sendo a tecnologia canônica de persistência;
* Drizzle continuará sendo a camada de acesso e migrations;
* conexões de runtime utilizarão pooling compatível com a execução serverless;
* migrations utilizarão conexão direta e credencial apropriada;
* produção utilizará branch protegida;
* ambientes de Preview poderão utilizar branches isoladas;
* branches não serão tratadas como substitutas de backups;
* recuperação e restauração serão testadas;
* nenhuma funcionalidade específica do Neon será utilizada no domínio;
* a aplicação deverá permanecer migrável para outro PostgreSQL compatível.

---

## 2. Contexto

O RouteBook adotou:

* PostgreSQL como banco relacional;
* PostGIS como extensão geoespacial;
* Drizzle ORM e Drizzle Kit;
* Next.js;
* Vercel;
* arquitetura serverless;
* Redis gerenciado;
* Inngest;
* Cloudflare R2;
* Google Maps Platform;
* isolamento lógico por Account.

O banco será responsável por armazenar dados críticos como:

* Users;
* Accounts;
* Account Memberships;
* Trips;
* Activities;
* Places;
* coordenadas;
* Itineraries;
* Recommendations;
* Decisions;
* Planning Conflicts;
* Itinerary Proposals;
* sessões;
* auditoria;
* outbox;
* metadados de objetos;
* configurações canônicas.

A seleção do Provider de banco deverá preservar as capacidades padrão do PostgreSQL e reduzir a carga operacional inicial.

---

## 3. Problema

Qual Provider deverá hospedar inicialmente o PostgreSQL e o PostGIS do RouteBook, considerando:

* compatibilidade com PostgreSQL padrão;
* suporte a PostGIS;
* execução serverless;
* pooling;
* integração com Vercel;
* ambientes de Preview;
* migrations;
* backups;
* restauração;
* segurança;
* custo;
* observabilidade;
* portabilidade?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. PostgreSQL padrão;
2. suporte ao PostGIS;
3. pooling para serverless;
4. integração com Vercel;
5. branches para Preview;
6. baixa carga operacional;
7. backups e restauração;
8. proteção de produção;
9. conexão segura;
10. compatibilidade com Drizzle;
11. desenvolvimento local;
12. escalabilidade gradual;
13. controle de custos;
14. observabilidade;
15. separação de ambientes;
16. portabilidade;
17. automação por API ou CLI;
18. recuperação de desastres;
19. proteção de dados;
20. suporte a um projeto inicialmente pessoal.

---

## 5. Restrições

A solução deverá:

* executar PostgreSQL real;
* suportar PostGIS;
* aceitar conexões PostgreSQL padrão;
* suportar TLS;
* funcionar com Node.js;
* funcionar com Drizzle;
* funcionar com Vercel;
* oferecer pooling ou integração equivalente;
* permitir migrations controladas;
* separar produção, desenvolvimento e Preview;
* possuir mecanismos de backup e restauração;
* permitir exportação lógica;
* não exigir mudanças no domínio;
* não transformar branches em fonte de dados de produção paralela;
* não permitir acesso público irrestrito;
* não executar migrations no startup das Functions;
* não impedir migração futura para outro PostgreSQL.

---

## 6. Terminologia

### 6.1 Project

Contêiner administrativo do Provider que agrupa recursos do banco.

### 6.2 Branch

Linha isolada de estado do banco derivada de outra branch.

### 6.3 Compute

Recurso responsável por executar o processo PostgreSQL e atender conexões.

### 6.4 Storage

Camada responsável pela persistência dos dados e do histórico aplicável.

### 6.5 Direct Connection

Conexão direta ao endpoint PostgreSQL, sem o pooler compartilhado da aplicação.

### 6.6 Pooled Connection

Conexão realizada por meio de um pooler para controlar a quantidade de conexões ao PostgreSQL.

### 6.7 Point-in-Time Restore

Restauração do banco para um instante dentro da janela de retenção disponível.

### 6.8 Snapshot

Representação recuperável do estado do banco em determinado instante.

### 6.9 Database Branching

Criação de um ambiente de banco isolado a partir do estado de outra branch.

---

## 7. Princípio central

O RouteBook depende do PostgreSQL, não do Neon como modelo de dados.

```text
RouteBook
→ PostgreSQL
→ PostGIS
→ Provider gerenciado
```

O Neon será uma implementação de infraestrutura.

O domínio não deverá depender de:

* branches do Neon;
* endpoints do Neon;
* SDK do Neon;
* APIs administrativas;
* conceitos de compute;
* formatos proprietários.

---

## 8. Opções consideradas

### 8.1 Neon

#### Benefícios

* PostgreSQL gerenciado;
* suporte ao PostGIS;
* pooling;
* integração com workloads serverless;
* branches isoladas;
* branches para Preview;
* automação por API e CLI;
* recuperação point-in-time;
* integração com Vercel;
* possibilidade de scale-to-zero em configurações compatíveis;
* baixa carga operacional.

#### Limitações

* arquitetura específica do Provider;
* limites variam por plano;
* branches exigem governança;
* scale-to-zero pode introduzir latência de ativação;
* recuperação depende da janela contratada;
* compatibilidade de extensões precisa ser verificada;
* integração profunda pode aumentar lock-in.

#### Avaliação

Oferece o melhor equilíbrio para a arquitetura adotada.

Foi selecionado.

---

### 8.2 Supabase Database

#### Benefícios

* PostgreSQL completo;
* suporte ao PostGIS;
* pooling;
* backups;
* PITR em planos compatíveis;
* painel administrativo;
* ecossistema integrado;
* APIs e recursos adicionais.

#### Limitações

* parte relevante do produto Supabase não seria utilizada;
* maior superfície de plataforma;
* pooling e recursos variam conforme o plano;
* branching e restauração possuem fluxo próprio;
* risco de adoção acidental de recursos externos à arquitetura definida.

#### Avaliação

É uma alternativa forte.

Não foi selecionada porque o RouteBook já definiu soluções próprias para autenticação, storage, realtime futuro e APIs.

---

### 8.3 Amazon RDS for PostgreSQL

#### Benefícios

* serviço maduro;
* backups;
* PITR;
* read replicas;
* rede privada;
* IAM;
* alta disponibilidade;
* ampla capacidade operacional.

#### Limitações

* maior complexidade;
* custo mínimo mais elevado;
* ausência de branching nativo equivalente ao fluxo desejado;
* maior configuração de networking;
* maior esforço para serverless;
* operação desproporcional ao estágio atual.

#### Avaliação

Poderá ser reavaliado quando houver requisitos empresariais, rede privada avançada ou escala maior.

---

### 8.4 Google Cloud SQL

#### Benefícios

* PostgreSQL gerenciado;
* backups;
* PITR;
* alta disponibilidade;
* rede privada;
* integração com Google Cloud.

#### Limitações

* maior operação;
* custo mínimo;
* integração menos direta com a topologia inicial;
* ausência de branching para Preview;
* configuração de conexões e rede adicional.

#### Avaliação

Foi rejeitado para a fase inicial.

---

### 8.5 Provider generalista de aplicação

Utilizar banco oferecido por plataformas como Railway, Render ou equivalentes.

#### Benefícios

* configuração simples;
* integração com aplicações;
* experiência centralizada;
* baixo esforço inicial.

#### Limitações

* recursos de backup e recuperação variam;
* PostGIS e extensões precisam ser confirmados;
* pooling pode exigir configuração adicional;
* branching e Preview podem ser limitados;
* menor especialização no workflow desejado.

#### Avaliação

Não foi selecionado.

---

### 8.6 PostgreSQL operado pelo RouteBook

#### Benefícios

* controle total;
* liberdade de extensões;
* custos previsíveis em determinados cenários;
* ausência de dependência administrativa de um DBaaS.

#### Limitações

* patches;
* backups;
* restore;
* replicação;
* monitoramento;
* segurança;
* failover;
* atualização;
* capacidade;
* alta carga operacional.

#### Avaliação

Foi rejeitado para o estágio inicial.

---

## 9. Decisão

O RouteBook adotará:

* **Neon** como Provider inicial de PostgreSQL gerenciado;
* **PostgreSQL padrão** como contrato de persistência;
* **PostGIS** como extensão geoespacial;
* **Drizzle ORM** para acesso;
* **Drizzle Kit** para migrations;
* **conexão pooled** para o runtime da aplicação;
* **conexão direta** para migrations e operações administrativas;
* **branch de produção protegida**;
* **branches de Preview** quando houver isolamento adequado;
* **restauração point-in-time e snapshots**, conforme o plano aprovado;
* **exports lógicos independentes** como camada adicional de portabilidade.

---

## 10. Escopo da decisão

Esta decisão define:

* Provider inicial;
* PostgreSQL e PostGIS;
* organização de branches;
* conexões;
* pooling;
* migrations;
* Preview;
* backup;
* restauração;
* segurança;
* observabilidade;
* custos;
* portabilidade.

Esta decisão não define integralmente:

* plano comercial definitivo;
* região final;
* tamanho inicial do compute;
* janela final de retenção;
* política completa de disaster recovery;
* read replicas;
* multi-region;
* analytics warehouse;
* data lake;
* estratégia completa de anonimização de Preview;
* Provider futuro.

---

## 11. Organização inicial

Estrutura conceitual:

```text
Neon Project
├── production
├── staging, quando necessário
├── development
└── preview branches temporárias
```

A nomenclatura final deverá ser:

* estável;
* documentada;
* compatível com automação;
* livre de dados pessoais;
* associada ao ambiente correto.

---

## 12. Branch de produção

A branch de produção deverá:

* ser protegida;
* possuir acesso restrito;
* não ser utilizada para desenvolvimento;
* não ser utilizada por Preview;
* receber migrations somente por pipeline autorizado;
* possuir retenção e recuperação compatíveis;
* possuir alertas;
* possuir credenciais próprias.

---

## 13. Branch de desenvolvimento

A branch de desenvolvimento poderá:

* possuir dados sintéticos;
* receber migrations em evolução;
* ser recriada;
* ser utilizada localmente;
* possuir compute com menor capacidade;
* utilizar scale-to-zero quando adequado.

Ela não deverá conter dados pessoais copiados de produção sem processo autorizado de anonimização.

---

## 14. Branches de Preview

Branches de Preview poderão ser criadas para pull requests relevantes.

Elas deverão:

* possuir identificador do Preview;
* possuir expiração;
* utilizar dados sintéticos ou schema-only quando necessário;
* receber migrations do commit correspondente;
* possuir secrets isolados;
* ser removidas após o encerramento;
* não possuir acesso de produção;
* não executar schedules de produção.

---

## 15. Benefícios do branching

Database branching poderá oferecer:

* isolamento;
* validação de migrations;
* testes de integração;
* Preview com banco próprio;
* reprodução de problemas;
* experimentação;
* restauração sem alterar imediatamente a branch principal.

Branching não elimina a necessidade de:

* migrations;
* backups;
* testes;
* controle de acesso;
* anonimização;
* limpeza;
* governança.

---

## 16. Dados de produção em branches

Copiar uma branch de produção pode reproduzir dados pessoais.

Portanto, branches derivadas de produção somente poderão ser utilizadas quando:

* a finalidade estiver autorizada;
* o ambiente estiver protegido;
* o acesso estiver restrito;
* a retenção estiver definida;
* os dados forem minimizados ou anonimizados quando necessário;
* a política de privacidade permitir.

Para Preview comum, a preferência será por:

* schema-only;
* seeds sintéticos;
* fixtures;
* datasets de teste.

---

## 17. PostGIS

PostGIS será habilitado por migration explícita.

Exemplo conceitual:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

A migration deverá validar:

* disponibilidade;
* versão suportada;
* permissões;
* compatibilidade com a versão do PostgreSQL;
* execução em todos os ambientes.

---

## 18. Extensões adicionais

Extensões somente deverão ser habilitadas quando houver requisito concreto.

Cada extensão deverá possuir:

* finalidade;
* owner;
* versão;
* impacto de portabilidade;
* política de atualização;
* testes;
* migration.

A disponibilidade no Provider não constitui justificativa suficiente.

---

## 19. Conexão pooled

O runtime da aplicação deverá utilizar conexão pooled quando a topologia exigir controle de conexões.

Casos:

* Route Handlers;
* Server Functions;
* Server Components;
* Functions concorrentes;
* workflows executados em compute efêmero.

A string pooled deverá ser separada da conexão administrativa.

---

## 20. Conexão direta

A conexão direta deverá ser utilizada para:

* migrations;
* operações administrativas;
* sessões que exijam semântica incompatível com transaction pooling;
* ferramentas controladas;
* diagnóstico autorizado.

Ela não deverá ser distribuída indiscriminadamente às Functions.

---

## 21. Pooling e Drizzle

A configuração do Drizzle deverá considerar:

* driver;
* pooling da plataforma;
* prepared statements;
* transactions;
* timeouts;
* TLS;
* comportamento serverless.

A escolha entre driver PostgreSQL tradicional e driver serverless deverá ser validada por testes.

---

## 22. Driver inicial

Como a aplicação será executada na Vercel com runtime Node.js, o baseline deverá preferir o método recomendado pelo Provider para esse ambiente.

A implementação deverá medir:

* latência;
* compatibilidade com Drizzle;
* transações;
* prepared statements;
* pooling;
* observabilidade.

A seleção do driver não alterará os contratos de repository.

---

## 23. Credenciais

Deverão existir credenciais separadas para:

* runtime de produção;
* migrations;
* desenvolvimento;
* Preview;
* observabilidade ou leitura administrativa, quando necessário.

O runtime deverá possuir apenas as permissões necessárias.

---

## 24. TLS

Todas as conexões remotas deverão utilizar TLS.

A aplicação não deverá desabilitar a validação de certificado apenas para contornar problemas de configuração.

---

## 25. Variáveis de ambiente

Variáveis conceituais:

```text
DATABASE_URL
DATABASE_DIRECT_URL
DATABASE_MIGRATION_URL
```

Os nomes finais deverão seguir a convenção do projeto.

Cada variável deverá:

* ser server-only;
* ser validada;
* pertencer ao ambiente correto;
* não aparecer no bundle;
* não ser registrada em logs.

---

## 26. Migrations

Migrations continuarão sendo a fonte canônica da evolução do schema.

Elas deverão:

* permanecer no Git;
* ser revisadas;
* ser determinísticas;
* ser aplicadas por pipeline controlado;
* ser testadas em branch isolada;
* evitar dependência de estado manual do console.

---

## 27. Migrations em Preview

O fluxo poderá ser:

```text
criar branch
→ obter conexão
→ aplicar migrations
→ executar seeds sintéticos
→ executar testes
→ disponibilizar Preview
```

Uma migration inválida deverá impedir a promoção.

---

## 28. Migrations em produção

O fluxo deverá ser:

```text
validar em branch isolada
→ executar backup ou proteção aplicável
→ aplicar migration controlada
→ verificar schema
→ implantar aplicação compatível
→ executar smoke tests
```

A ordem poderá variar conforme a estratégia expand-contract.

---

## 29. Expand and contract

Alterações incompatíveis deverão ser introduzidas progressivamente.

Exemplo:

```text
adicionar nova estrutura
→ publicar código compatível
→ migrar dados
→ mudar leituras e escritas
→ remover estrutura antiga posteriormente
```

Branching não torna uma migration incompatível automaticamente segura.

---

## 30. Locks de migration

Somente uma execução deverá aplicar migrations em determinado ambiente por vez.

A estratégia deverá utilizar:

* controle do pipeline;
* lock;
* verificação de estado;
* tabela de migrations;
* timeout;
* observabilidade.

---

## 31. Backups e recuperação

A estratégia deverá combinar:

* histórico e restauração oferecidos pelo Provider;
* snapshots quando aplicáveis;
* exportações lógicas periódicas conforme criticidade;
* testes de restore;
* documentação operacional.

Nenhum recurso será considerado backup confiável sem teste de restauração.

---

## 32. Point-in-time restore

A restauração point-in-time deverá ser utilizada para recuperar o estado dentro da janela disponível.

O processo deverá considerar:

* instante correto;
* branch de destino;
* aplicações em execução;
* writes durante o incidente;
* consistência com R2;
* consistência com Redis;
* outbox;
* workflows;
* comunicação.

---

## 33. Restore em nova branch

A abordagem preferencial para investigação poderá ser:

```text
selecionar instante
→ restaurar ou criar branch de recuperação
→ validar dados
→ comparar
→ decidir cutover ou correção
```

Isso reduz o risco de alterar imediatamente a produção.

---

## 34. Testes de restauração

Testes deverão comprovar:

* acesso ao histórico;
* criação da branch de recuperação;
* conexão;
* consistência básica;
* presença do PostGIS;
* execução da aplicação;
* extração de dados;
* procedimento de cutover;
* tempo de recuperação.

---

## 35. Exportação lógica

Deverão ser mantidos procedimentos compatíveis com ferramentas PostgreSQL, como:

* `pg_dump`;
* `pg_restore`;
* `psql`.

Isso apoia:

* portabilidade;
* auditoria operacional;
* migração;
* recuperação complementar;
* cópias controladas.

---

## 36. Consistência com armazenamento de objetos

Backups do PostgreSQL não incluem automaticamente os objetos do R2.

O banco armazenará referências e metadados.

A recuperação deverá considerar:

```text
PostgreSQL
↔ StoredObject
↔ R2
```

Uma restauração do banco para o passado poderá produzir referências a objetos cujo ciclo de vida já mudou.

---

## 37. Consistência com Redis

Redis contém estado temporário.

Após restauração do banco, poderá ser necessário:

* limpar caches;
* invalidar idempotency keys;
* recompor rate limits;
* remover locks;
* reconstruir dados derivados.

Redis não deverá ser restaurado como se fosse parte do estado canônico.

---

## 38. Consistência com Inngest

Após restauração, workflows ativos poderão estar baseados em versões posteriores dos dados.

O processo deverá:

* pausar processamento quando necessário;
* identificar workflows relevantes;
* rejeitar resultados stale;
* utilizar versionamento;
* reprocessar outbox;
* cancelar execuções incompatíveis.

---

## 39. Alta disponibilidade

O plano inicial deverá ser proporcional ao estágio do produto.

Antes da produção pública, deverão ser definidos:

* disponibilidade esperada;
* proteção do compute;
* recuperação;
* alertas;
* procedimento de incidente;
* capacidade de restauração.

Não deverá ser prometida alta disponibilidade superior à configuração contratada.

---

## 40. Scale-to-zero

Scale-to-zero poderá ser utilizado em:

* desenvolvimento;
* Preview;
* ambientes pouco utilizados.

Em produção, deverá ser avaliado o impacto de:

* cold start;
* primeira conexão;
* autenticação;
* experiência do usuário;
* jobs;
* health checks.

---

## 41. Compute autoscaling

Autoscaling poderá ser utilizado conforme o plano e a carga.

A configuração deverá observar:

* custo;
* latência;
* memória;
* CPU;
* conexões;
* queries;
* picos;
* limite máximo.

Autoscaling não corrige queries ineficientes.

---

## 42. Região

O projeto deverá utilizar região compatível com:

* Vercel;
* usuários iniciais no Brasil;
* Redis;
* Inngest;
* R2;
* requisitos de privacidade;
* latência;
* custo.

A aplicação deverá executar próxima ao banco principal.

---

## 43. Latência

A latência deverá ser observada em:

* aquisição de conexão;
* query;
* transação;
* PostGIS;
* Function;
* Provider externo;
* cold start do compute.

O banco não deverá ser consultado repetidamente por falta de composição adequada.

---

## 44. Segurança de rede

A conexão deverá utilizar:

* TLS;
* credenciais fortes;
* rotação;
* restrição de papéis;
* allowlists ou mecanismos adicionais quando disponíveis;
* logs de acesso;
* menor privilégio.

---

## 45. Papéis de banco

Papéis deverão ser separados conforme responsabilidade.

Possíveis papéis:

* runtime;
* migration;
* read-only operacional;
* backup;
* administração emergencial.

O usuário comum da aplicação não deverá possuir privilégios de schema.

---

## 46. Row-Level Security

O RouteBook não dependerá inicialmente de RLS como única camada de isolamento.

A autorização seguirá o modelo definido no `RB-ADR-008`.

RLS poderá ser adotada como defesa adicional mediante decisão específica.

---

## 47. Isolamento por Account

Todas as queries privadas deverão incluir Account ou escopo equivalente.

Testes deverão validar:

* leitura cross-account;
* escrita cross-account;
* joins;
* queries geoespaciais;
* jobs;
* Tools;
* restauração;
* seeds.

O Provider gerenciado não substitui o isolamento lógico da aplicação.

---

## 48. Criptografia

O Provider deverá oferecer criptografia em trânsito e em repouso conforme sua configuração.

Dados altamente sensíveis poderão exigir criptografia adicional no nível da aplicação, mediante decisão específica.

---

## 49. Dados pessoais em Preview

Dados pessoais de produção não deverão ser expostos em ambientes temporários.

Estratégias permitidas:

* schema-only branch;
* seeds sintéticos;
* anonimização;
* datasets mínimos autorizados.

---

## 50. Observabilidade

A aplicação deverá observar:

* duração das queries;
* erros;
* timeouts;
* conexões;
* pool;
* transações;
* locks;
* deadlocks;
* tamanho;
* crescimento;
* PostGIS;
* migrations;
* restore.

---

## 51. Logs de queries

SQL e parâmetros não deverão ser exportados indiscriminadamente.

A preferência será por:

* query name;
* operação;
* módulo;
* duração;
* resultado;
* quantidade aproximada;
* errorCode.

---

## 52. Queries lentas

Queries acima do limite deverão gerar sinal operacional.

A análise deverá considerar:

* plano de execução;
* índices;
* cardinalidade;
* joins;
* PostGIS;
* filtros por Account;
* volume;
* round trips.

---

## 53. PostGIS e performance

Consultas geográficas deverão validar:

* SRID;
* tipo de coluna;
* função utilizada;
* índice espacial;
* raio;
* bounding box;
* quantidade de candidatos;
* ordenação;
* conversões.

---

## 54. Capacity planning

Deverão ser acompanhados:

* tamanho do banco;
* crescimento mensal;
* compute;
* CPU;
* memória;
* conexões;
* cache;
* branches;
* histórico;
* egress;
* custo.

---

## 55. Limites de branches

Branches deverão possuir:

* owner;
* finalidade;
* origem;
* data de criação;
* data de expiração;
* ambiente;
* política de remoção.

Branches órfãs aumentam custo e risco.

---

## 56. Limpeza de branches

Branches temporárias deverão ser removidas após:

* fechamento da pull request;
* expiração;
* conclusão do teste;
* encerramento do ambiente.

A limpeza deverá ser automatizada e observável.

---

## 57. Proteção de branches

Branches críticas deverão possuir controles contra:

* exclusão;
* reset acidental;
* acesso excessivo;
* migration não autorizada;
* credencial compartilhada.

---

## 58. Custos

Os custos deverão considerar:

* compute;
* storage;
* histórico;
* snapshots;
* branches;
* transferência;
* quantidade de projetos;
* Preview;
* ambientes inativos.

O workflow de branches deverá possuir limites.

---

## 59. Desenvolvimento local

O desenvolvimento local continuará suportando PostgreSQL com PostGIS em container.

O Neon não será obrigatório para:

* testes unitários;
* testes de domínio;
* desenvolvimento offline;
* testes básicos de repository.

A integração com Neon deverá ser testada separadamente.

---

## 60. Testcontainers

Testcontainers continuará sendo utilizado para testar:

* PostgreSQL;
* PostGIS;
* migrations;
* repositories;
* constraints;
* transações;
* queries geográficas.

Isso reduz a dependência de um banco remoto em toda execução de CI.

---

## 61. Testes de Provider

Testes controlados deverão validar:

* conexão pooled;
* conexão direta;
* TLS;
* migrations;
* PostGIS;
* branch;
* restore;
* integração com Vercel;
* scale-to-zero quando utilizado;
* credenciais.

---

## 62. Testes de migrations

Toda migration deverá ser validada em banco vazio e banco evoluído.

Casos:

* aplicar;
* reaplicar pipeline;
* schema esperado;
* dados existentes;
* PostGIS;
* rollback lógico quando aplicável;
* compatibilidade com versão anterior da aplicação.

---

## 63. Testes de Preview

Um Preview deverá validar:

```text
criar branch
→ aplicar migrations
→ inserir seeds sintéticos
→ executar aplicação
→ executar smoke tests
→ remover branch
```

---

## 64. Testes de restore

Deverão ser realizados periodicamente.

Um backup não testado não será considerado garantia operacional suficiente.

---

## 65. CI/CD

O pipeline poderá utilizar a API ou CLI do Provider para:

* criar branch;
* obter conexão;
* aplicar migrations;
* executar testes;
* remover branch.

Tokens deverão possuir menor privilégio e ambiente correto.

---

## 66. Pull requests de forks

Pull requests não confiáveis não deverão receber:

* credenciais do Neon;
* acesso a branches privadas;
* dados;
* tokens administrativos.

Nesses casos, deverão ser utilizados Testcontainers e fixtures locais.

---

## 67. Desenvolvimento assistido por IA

Agentes poderão apoiar:

* migrations;
* schemas;
* queries;
* índices;
* testes;
* análise de planos;
* automação de branches;
* documentação.

---

## 68. Limites para agentes

Agentes não poderão autonomamente:

* acessar produção;
* criar credencial;
* alterar retenção;
* restaurar produção;
* excluir branch;
* remover proteção;
* executar migration de produção;
* copiar dados pessoais;
* ampliar privilégios;
* habilitar extensão;
* alterar compute;
* promover branch;
* executar query destrutiva;
* desativar backup.

---

## 69. Consequências positivas

A decisão proporciona:

* PostgreSQL gerenciado;
* suporte ao PostGIS;
* pooling para serverless;
* integração com Vercel;
* branches isoladas;
* Preview com banco próprio;
* menor carga operacional;
* recuperação point-in-time;
* automação;
* escala gradual;
* portabilidade por protocolo PostgreSQL.

---

## 70. Consequências negativas

A decisão introduz:

* dependência do Neon;
* custo variável;
* necessidade de governar branches;
* necessidade de compreender pooling;
* latência de ativação em scale-to-zero;
* dependência da janela de retenção;
* diferenças operacionais em relação ao PostgreSQL tradicional;
* necessidade de estratégia de saída.

---

## 71. Riscos

### 71.1 Lock-in do Provider

Mitigações:

* PostgreSQL padrão;
* PostGIS padrão;
* Drizzle;
* migrations portáveis;
* exports lógicos;
* ausência de SDK no domínio.

### 71.2 Conexões esgotadas

Mitigações:

* pooling;
* limites;
* região próxima;
* observabilidade;
* timeouts;
* testes de carga.

### 71.3 Dados de produção em Preview

Mitigações:

* schema-only;
* seeds sintéticos;
* anonimização;
* acesso restrito;
* lifecycle.

### 71.4 Branches órfãs

Mitigações:

* expiração;
* automação;
* métricas;
* limpeza.

### 71.5 Restore não testado

Mitigações:

* exercícios;
* runbooks;
* branch de recuperação;
* verificação periódica.

### 71.6 Migration incompatível

Mitigações:

* Preview;
* expand-contract;
* testes;
* pipeline controlado;
* roll-forward.

### 71.7 Custo inesperado

Mitigações:

* budgets;
* alertas;
* scale-to-zero em ambientes adequados;
* remoção de branches;
* capacity review.

### 71.8 Indisponibilidade do Provider

Mitigações:

* backups;
* exports;
* runbook;
* observabilidade;
* estratégia de saída;
* degradação controlada.

---

## 72. Controles

Deverão ser implementados:

* branch de produção protegida;
* credenciais separadas;
* TLS;
* pooling;
* direct URL para migrations;
* PostGIS por migration;
* branches temporárias;
* seeds sintéticos;
* limpeza automatizada;
* backups e snapshots;
* testes de restore;
* exports lógicos;
* observabilidade;
* budgets;
* MFA;
* menor privilégio;
* runbooks.

---

## 73. Estratégia de implementação

### Etapa 1 — Projeto

* criar organização e projeto;
* escolher região;
* criar branch de produção;
* configurar proteção;
* definir plano inicial.

### Etapa 2 — PostgreSQL e PostGIS

* fixar versão do PostgreSQL;
* habilitar PostGIS por migration;
* validar extensões;
* executar migrations;
* testar Drizzle.

### Etapa 3 — Conectividade

* configurar conexão pooled;
* configurar conexão direta;
* configurar TLS;
* configurar credenciais;
* integrar à Vercel.

### Etapa 4 — Ambientes

* criar desenvolvimento;
* configurar Preview;
* criar seeds sintéticos;
* automatizar expiração e limpeza.

### Etapa 5 — Segurança

* separar papéis;
* restringir tokens;
* configurar MFA;
* revisar dados de Preview;
* criar procedimento emergencial.

### Etapa 6 — Recuperação

* configurar retenção;
* configurar snapshots quando aplicável;
* criar exportação lógica;
* executar primeiro teste de restore;
* documentar runbook.

### Etapa 7 — Observabilidade

* monitorar conexões;
* monitorar queries;
* monitorar compute;
* monitorar storage;
* configurar alertas e budgets.

---

## 74. Critérios de implementação concluída

A decisão estará implementada quando:

* projeto estiver criado;
* região estiver definida;
* branch de produção estiver protegida;
* PostgreSQL estiver fixado;
* PostGIS estiver habilitado;
* migrations funcionarem;
* conexão pooled funcionar;
* conexão direta funcionar;
* Vercel estiver integrada;
* Preview puder utilizar branch isolada;
* dados sintéticos forem utilizados;
* branches temporárias forem removidas;
* backup ou histórico estiver configurado;
* primeiro restore tiver sido testado;
* observabilidade estiver ativa;
* exports lógicos estiverem documentados.

---

## 75. Verificação

A verificação deverá incluir:

* conexão TLS;
* conexão pooled;
* conexão direta;
* Drizzle;
* migrations;
* PostGIS;
* transação;
* query geográfica;
* criação de branch;
* isolamento;
* seed;
* Preview;
* remoção;
* scale-to-zero quando aplicável;
* restore;
* exportação lógica;
* credencial restrita;
* query lenta;
* limite de conexões.

---

## 76. Métricas

Poderão ser acompanhadas:

* compute usage;
* storage;
* histórico;
* branches;
* branches órfãs;
* conexões;
* latência;
* query duration;
* timeouts;
* locks;
* deadlocks;
* migrations;
* restores testados;
* crescimento;
* custo;
* Preview branches;
* cold starts;
* falhas de conexão.

---

## 77. Gatilhos de revisão

A decisão deverá ser revisada quando:

* custos se tornarem desproporcionais;
* limites do plano impedirem evolução;
* extensões necessárias não forem suportadas;
* pooling não atender a carga;
* requisitos de rede privada aumentarem;
* multi-region se tornar necessário;
* read replicas se tornarem necessárias;
* requisitos de compliance exigirem outra topologia;
* AWS RDS ou outro Provider oferecer vantagem comprovada;
* latência for inadequada;
* lock-in operacional impedir evolução;
* disponibilidade contratada não atender ao produto.

---

## 78. Estratégia de saída

A migração para outro PostgreSQL deverá utilizar recursos padrão.

Fluxo conceitual:

```text
provisionar destino
→ instalar extensões
→ aplicar schema
→ transferir dados
→ validar checksums e contagens
→ sincronizar alterações finais
→ alterar conexões
→ executar smoke tests
→ manter rollback
→ desativar origem após estabilização
```

---

## 79. Portabilidade

A portabilidade será preservada por:

* PostgreSQL padrão;
* PostGIS;
* SQL;
* Drizzle;
* migrations versionadas;
* `pg_dump`;
* `pg_restore`;
* conexão padrão;
* ausência de modelos proprietários no domínio;
* adapters de infraestrutura.

---

## 80. Próxima decisão

O `RB-ADR-019` deverá definir a estratégia de entrega contínua, pipelines e automação de qualidade do monorepo.

A decisão deverá avaliar:

* GitHub Actions;
* Vercel Git Integration;
* checks obrigatórios;
* migrations;
* branches de banco;
* Preview Deployments;
* Turborepo Remote Cache;
* releases;
* source maps;
* supply-chain security;
* secrets;
* rollback;
* environments;
* aprovações;
* agentes de IA.

A decisão deverá distinguir:

* continuous integration;
* continuous delivery;
* continuous deployment;
* Preview Deployment;
* migration;
* release;
* promotion;
* rollback.

---

## 81. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-018
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar o contexto histórico.

---

## 82. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* alternativas foram avaliadas;
* Neon está justificado;
* Supabase foi avaliado;
* RDS foi avaliado;
* Cloud SQL foi avaliado;
* PostgreSQL padrão está preservado;
* PostGIS está definido;
* branches estão governadas;
* produção está protegida;
* Preview está isolado;
* dados pessoais estão protegidos;
* pooling está definido;
* conexão direta está definida;
* Drizzle está contemplado;
* migrations estão definidas;
* expand-contract está definido;
* backups estão definidos;
* PITR está contemplado;
* snapshots estão contemplados;
* restore está definido;
* exports lógicos estão definidos;
* R2 está contemplado;
* Redis está contemplado;
* Inngest está contemplado;
* segurança está definida;
* observabilidade está definida;
* custos estão contemplados;
* desenvolvimento local está definido;
* testes estão definidos;
* agentes estão contemplados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* estratégia de saída está definida;
* não existem contradições com RB-ADR-005;
* não existem contradições com RB-ADR-006;
* não existem contradições com RB-ADR-008;
* não existem contradições com RB-ADR-010;
* não existem contradições com RB-ADR-012;
* não existem contradições com RB-ADR-013;
* não existem contradições com RB-ADR-015;
* não existem contradições com RB-ADR-016;
* não existem contradições com RB-ADR-017.

---

## 83. Declaração final

O RouteBook adotará o Neon como Provider inicial de PostgreSQL e PostGIS gerenciado.

O Neon será utilizado para:

* execução do PostgreSQL;
* armazenamento gerenciado;
* pooling de conexões;
* branches isoladas;
* ambientes de Preview;
* histórico e restauração;
* integração com a Vercel.

PostgreSQL continuará sendo a tecnologia canônica de persistência.

PostGIS continuará sendo a extensão geoespacial oficial.

Drizzle continuará responsável por:

* acesso;
* schemas de persistência;
* migrations;
* integração tipada.

Produção utilizará uma branch protegida.

Branches temporárias serão utilizadas somente para desenvolvimento, testes, recuperação e Preview, com ownership e expiração.

Dados pessoais de produção não deverão ser propagados indiscriminadamente para ambientes temporários.

O runtime utilizará conexão pooled.

Migrations e operações administrativas utilizarão conexão direta e credencial apropriada.

Branches, histórico e snapshots não substituirão:

* migrations;
* exportações lógicas;
* testes de restauração;
* runbooks;
* estratégia de disaster recovery.

A integração com recursos específicos do Neon permanecerá confinada à infraestrutura e ao pipeline.

O domínio, os casos de uso e os repositories continuarão dependentes somente dos contratos e capacidades padrão do PostgreSQL, permitindo futura migração para outro Provider compatível.
