---

id: RB-ADR-008

title: Modelo Híbrido de Autorização e Isolamento Multi-Tenant por Account
description: Registra a decisão de adotar um modelo híbrido de autorização baseado em Account Membership, papéis, permissões, políticas por recurso e atributos contextuais, com enforcement server-side e isolamento multi-tenant em profundidade.

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
- authorization
- access-control
- multi-tenancy
- tenant-isolation
- account
- membership
- rbac
- abac
- resource-based-authorization
- row-level-security
- security
- agents
- tools

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
- RB-SEC-001
- RB-SEC-002
- RB-SEC-003
- RB-PRIV-001
- RB-QA-001
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

next_documents:

- RB-ADR-009

ai_context:
priority: critical
index: true
---

# RB-ADR-008 — Modelo Híbrido de Autorização e Isolamento Multi-Tenant por Account

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* `Account` será a fronteira principal de isolamento multi-tenant;
* toda operação protegida deverá possuir autorização server-side;
* `AccountMembership` vinculará `User` e `Account`;
* papéis fornecerão conjuntos iniciais de permissões;
* políticas por recurso e atributos contextuais complementarão os papéis;
* o acesso será negado por padrão;
* toda query multi-tenant deverá preservar o escopo da Account;
* testes cross-account serão obrigatórios;
* Row-Level Security poderá ser adotada como defesa adicional, mas não substituirá a aplicação;
* Tools e agentes utilizarão autorização delegada e limitada.

---

## 2. Contexto

O `RB-ADR-007` estabeleceu Better Auth como solução técnica para:

* autenticação;
* sessões;
* Providers;
* verificações;
* vínculos técnicos de identidade.

Essa decisão não define quais recursos um usuário autenticado poderá acessar.

O RouteBook deverá suportar conceitos como:

* User;
* Account;
* Account Membership;
* Trip;
* Traveler Profile;
* Place;
* Trip Collection;
* Activity;
* Itinerary;
* Recommendation;
* Decision;
* Planning Conflict;
* Itinerary Proposal;
* Agent;
* Tool;
* capability.

O produto será inicialmente pessoal, mas sua arquitetura deverá permitir que uma Account represente futuramente:

* uma pessoa;
* uma família;
* um casal;
* um grupo de viajantes;
* uma equipe;
* uma organização.

Uma pessoa poderá pertencer a mais de uma Account.

Uma Account poderá conter mais de uma pessoa.

O sistema precisa impedir que identificadores manipulados, queries incompletas, agentes ou integrações permitam acesso entre Accounts.

---

## 3. Problema

Qual modelo de autorização deverá ser adotado para garantir que:

* usuários acessem somente Accounts permitidas;
* Trips sejam isoladas;
* recursos filhos preservem o tenant correto;
* papéis sejam simples, mas não excessivamente amplos;
* decisões dependentes de recurso sejam avaliadas;
* agentes não recebam permissões superiores às do usuário;
* autorização seja aplicável em Next.js, casos de uso e PostgreSQL;
* o sistema possa evoluir para colaboração;
* testes consigam comprovar isolamento cross-account?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. segurança por padrão;
2. isolamento entre Accounts;
3. simplicidade inicial;
4. evolução para colaboração;
5. autorização por recurso;
6. menor privilégio;
7. enforcement server-side;
8. compatibilidade com Better Auth;
9. compatibilidade com PostgreSQL;
10. compatibilidade com Drizzle;
11. compatibilidade com monólito modular;
12. testabilidade;
13. auditabilidade;
14. autorização de Tools;
15. suporte a múltiplas memberships;
16. proteção contra IDOR;
17. regras explícitas;
18. negação por padrão;
19. baixa dependência de framework;
20. capacidade de adicionar políticas futuras.

---

## 5. Restrições

A solução deverá:

* separar autenticação de autorização;
* utilizar Account como tenant;
* validar acesso no servidor;
* validar membership ativa;
* validar recurso e ação;
* funcionar em casos de uso;
* funcionar em Route Handlers;
* funcionar em Server Functions;
* funcionar em Server Components;
* funcionar em jobs e workers;
* funcionar para Tools e agentes;
* negar acesso quando o contexto estiver incompleto;
* não confiar em papéis enviados pelo cliente;
* não confiar somente em middleware;
* não permitir consultas sem escopo quando a Account for aplicável;
* não exigir um motor externo de políticas no MVP.

---

## 6. Terminologia

### 6.1 Actor

Identidade que inicia ou causa uma operação.

Poderá ser:

* User;
* Agent;
* Workload;
* sistema;
* operador autorizado.

### 6.2 Subject

Identidade em nome da qual a operação é executada.

Em operações comuns, actor e subject poderão ser o mesmo User.

Em operações delegadas, um Agent poderá ser actor e o User permanecer como subject.

### 6.3 Account

Fronteira canônica de isolamento, ownership e colaboração.

### 6.4 Account Membership

Relação entre User e Account.

### 6.5 Role

Conjunto nomeado de permissões iniciais associado a uma membership.

### 6.6 Permission

Capacidade abstrata de executar determinada ação.

### 6.7 Policy

Regra que avalia actor, subject, Account, recurso, ação e contexto.

### 6.8 Resource

Objeto sobre o qual uma ação será executada.

### 6.9 Action

Operação solicitada sobre um recurso.

### 6.10 Tenant

Unidade lógica isolada na aplicação.

No RouteBook, o tenant principal é a Account.

---

## 7. Princípio central

Toda operação protegida deverá responder:

* quem está agindo;
* em nome de quem;
* em qual Account;
* sobre qual recurso;
* qual ação está sendo solicitada;
* quais políticas se aplicam;
* qual foi o resultado.

```text
sessão válida
→ identidade
→ membership
→ Account
→ recurso
→ ação
→ política
→ decisão de autorização
→ caso de uso
```

A ausência de qualquer elemento obrigatório deverá resultar em negação.

---

## 8. Opções consideradas

### 8.1 Opção A — Verificação exclusiva de ownership direto

Permitir acesso somente quando o `userId` do recurso for igual ao usuário autenticado.

#### Benefícios

* implementação simples;
* fácil compreensão;
* adequada a produto estritamente individual;
* baixa quantidade de tabelas.

#### Limitações

* dificulta colaboração;
* não representa famílias ou grupos;
* ownership direto espalhado por todas as tabelas;
* migração futura complexa;
* não suporta papéis;
* não suporta múltiplos usuários por espaço.

#### Avaliação

Foi rejeitada porque limita a evolução natural do RouteBook.

---

### 8.2 Opção B — RBAC puro

Utilizar somente papéis como:

* Owner;
* Member;
* Viewer.

#### Benefícios

* simples;
* previsível;
* fácil de documentar;
* fácil de representar em interface;
* baixo custo inicial.

#### Limitações

* papéis tendem a se tornar amplos;
* não representam contexto do recurso;
* não tratam estados;
* não tratam ownership específico;
* não representam delegação de agentes;
* podem criar explosão de papéis.

#### Avaliação

RBAC será utilizado, mas não isoladamente.

---

### 8.3 Opção C — ABAC puro

Avaliar acesso por atributos de:

* usuário;
* Account;
* recurso;
* contexto;
* ambiente;
* ação.

#### Benefícios

* flexibilidade;
* políticas contextuais;
* boa representação de casos complexos;
* evita criação excessiva de papéis.

#### Limitações

* maior complexidade;
* difícil auditoria se mal modelado;
* regras espalhadas;
* maior custo de testes;
* menor clareza para o MVP.

#### Avaliação

Atributos serão utilizados de forma complementar, não como estratégia exclusiva.

---

### 8.4 Opção D — ACL por recurso

Manter listas de usuários ou memberships autorizadas em cada recurso.

#### Benefícios

* controle granular;
* compartilhamento direto;
* flexibilidade por recurso.

#### Limitações

* alto custo de manutenção;
* muitas relações;
* risco de inconsistência;
* difícil revogação;
* complexidade desnecessária no MVP;
* autorização mais custosa.

#### Avaliação

Poderá ser adotada futuramente para compartilhamentos específicos, mas não será o modelo-base.

---

### 8.5 Opção E — Motor externo de políticas

Utilizar ferramenta dedicada para policies.

#### Benefícios

* centralização;
* linguagem declarativa;
* decisões auditáveis;
* possibilidade de uso entre serviços;
* políticas sofisticadas.

#### Limitações

* infraestrutura adicional;
* operação;
* latência;
* sincronização de contexto;
* complexidade prematura;
* necessidade ainda não comprovada.

#### Avaliação

Foi rejeitada para o estágio inicial.

---

### 8.6 Opção F — Modelo híbrido

Combinar:

* Account Membership;
* RBAC inicial;
* autorização por recurso;
* atributos contextuais;
* policies server-side;
* defesa em profundidade no banco.

#### Benefícios

* simples para casos comuns;
* flexível para casos específicos;
* adequado a colaboração;
* evita explosão de papéis;
* permite menor privilégio;
* funciona com monólito modular;
* permite evolução;
* permite autorização de agentes.

#### Limitações

* exige disciplina;
* exige catálogo de ações;
* exige testes;
* exige contexto consistente;
* possui mais componentes que RBAC puro.

#### Avaliação

Oferece o melhor equilíbrio.

Foi selecionada.

---

## 9. Decisão

O RouteBook adotará um modelo híbrido composto por:

1. **Account como tenant principal**;
2. **Account Membership** para vincular User e Account;
3. **RBAC** para permissões-base;
4. **políticas por recurso** para validar ownership e relacionamentos;
5. **atributos contextuais** para estados, delegação e restrições adicionais;
6. **negação por padrão**;
7. **enforcement server-side**;
8. **escopo obrigatório em queries**;
9. **testes cross-account**;
10. **defesa adicional no PostgreSQL quando apropriada**.

---

## 10. Escopo da decisão

Esta decisão define:

* tenant principal;
* membership;
* papéis iniciais;
* permissions;
* policies;
* formato da decisão;
* enforcement;
* query scoping;
* autorização de agentes;
* auditoria;
* testes;
* relação com Row-Level Security.

Esta decisão não define integralmente:

* UI administrativa de membros;
* fluxo final de convites;
* compartilhamento público;
* links públicos;
* permissões de suporte;
* acesso administrativo de emergência;
* política empresarial de organizações;
* motor externo de policies;
* autenticação de API pública;
* todos os papéis futuros.

---

## 11. Account como tenant

A Account será a fronteira principal para:

* Trips;
* Traveler Profiles;
* Trip Collections;
* Activities;
* Itineraries;
* Recommendations;
* Decisions;
* Planning Conflicts;
* Itinerary Proposals;
* configurações;
* memória contextual;
* dados derivados.

Todo recurso privado deverá:

* possuir `accountId`;
* ou possuir relação transitiva inequívoca com um recurso que possua `accountId`.

---

## 12. Account pessoal

No primeiro incremento, cada novo User receberá uma Account pessoal.

Essa Account deverá:

* possuir owner;
* possuir membership ativa;
* ser utilizada como tenant;
* poder receber Trips;
* permitir evolução futura para colaboração.

A Account pessoal não deverá ser substituída pelo próprio `userId`.

---

## 13. Account Membership

A membership deverá possuir, no mínimo:

```text
membershipId
accountId
userId
role
status
createdAt
updatedAt
```

Campos futuros poderão incluir:

```text
invitedBy
invitedAt
acceptedAt
suspendedAt
removedAt
expiresAt
```

---

## 14. Status da membership

Estados iniciais:

* `active`;
* `invited`;
* `suspended`;
* `removed`.

Somente memberships ativas deverão conceder acesso comum.

Uma sessão válida não deverá ignorar membership suspensa ou removida.

---

## 15. Papéis iniciais

### 15.1 Owner

Responsável pela Account.

Permissões iniciais possíveis:

* administrar a Account;
* administrar memberships;
* criar Trips;
* alterar Trips;
* excluir Trips;
* gerenciar dados;
* exportar dados;
* solicitar encerramento;
* executar ações críticas.

### 15.2 Member

Participante com permissão de colaboração.

Permissões possíveis:

* visualizar Trips;
* criar e editar conteúdo;
* organizar Activities;
* interagir com Recommendations;
* tratar Planning Conflicts;
* avaliar Itinerary Proposals.

### 15.3 Viewer

Participante com acesso predominantemente de leitura.

Permissões possíveis:

* visualizar Trips;
* visualizar Itineraries;
* visualizar Places;
* visualizar Recommendations.

A matriz definitiva deverá ser versionada e testada.

---

## 16. Papéis não são autorização completa

Um `Member` não poderá executar automaticamente qualquer ação em qualquer recurso.

A decisão poderá depender de:

* recurso pertencer à Account;
* recurso estar ativo;
* Trip permitir edição;
* ação exigir Owner;
* proposta ainda estar pendente;
* conflito estar resolvível;
* sessão ser recente;
* actor ser humano ou agente;
* capability estar autorizada.

---

## 17. Catálogo de ações

Ações deverão utilizar nomenclatura explícita.

Exemplos:

```text
account.read
account.update
account.members.read
account.members.manage
account.close

trip.create
trip.read
trip.update
trip.delete

activity.create
activity.read
activity.move
activity.remove

recommendation.read
recommendation.dismiss
recommendation.convert

planning-conflict.read
planning-conflict.resolve
planning-conflict.ignore
planning-conflict.restore

itinerary-proposal.read
itinerary-proposal.accept
itinerary-proposal.accept-partially
itinerary-proposal.reject
```

O catálogo deverá permanecer centralizado e governado.

---

## 18. Nomenclatura das permissions

As permissions deverão seguir:

```text
<resource>.<action>
```

Quando necessária maior precisão:

```text
<resource>.<subresource>.<action>
```

Nomes vagos deverão ser evitados.

Exemplos inadequados:

```text
manage
edit
admin
full-access
```

---

## 19. Resource types

Tipos iniciais de recursos:

* Account;
* Account Membership;
* Trip;
* Traveler Profile;
* Place;
* Trip Collection;
* Activity;
* Itinerary;
* Recommendation;
* Decision;
* Planning Conflict;
* Itinerary Proposal;
* AI Capability;
* Tool Execution.

---

## 20. Authorization Context

Toda avaliação deverá utilizar contexto explícito.

Exemplo conceitual:

```typescript
interface AuthorizationContext {
  actor: ActorIdentity;
  subject: SubjectIdentity;
  accountId: AccountId;
  membership: AccountMembership;
  action: Permission;
  resource?: AuthorizationResource;
  environment: AuthorizationEnvironment;
  delegation?: DelegationContext;
}
```

---

## 21. Authorization Resource

O recurso deverá conter somente atributos necessários à decisão.

Exemplo:

```typescript
interface AuthorizationResource {
  type: ResourceType;
  id: string;
  accountId: AccountId;
  state?: string;
  ownerUserId?: UserId;
  tripId?: TripId;
}
```

O serviço de autorização não deverá receber entidades completas sem necessidade.

---

## 22. Authorization Decision

O resultado deverá ser explícito.

```typescript
type AuthorizationDecision =
  | {
      allowed: true;
      policyId: string;
      reasonCode: string;
    }
  | {
      allowed: false;
      policyId?: string;
      reasonCode: string;
    };
```

O motivo interno poderá ser registrado, mas não deverá expor detalhes sensíveis ao cliente.

---

## 23. Negação por padrão

Quando:

* a permission não existir;
* o papel não estiver mapeado;
* a membership estiver ausente;
* a Account estiver ausente;
* o recurso não puder ser resolvido;
* a policy falhar;
* o contexto estiver inconsistente;

o resultado deverá ser negado.

---

## 24. Serviço de autorização

A aplicação deverá possuir uma abstração central.

```typescript
interface AuthorizationService {
  authorize(
    context: AuthorizationContext,
  ): Promise<AuthorizationDecision>;

  assertAuthorized(
    context: AuthorizationContext,
  ): Promise<void>;
}
```

Os casos de uso não deverão implementar regras duplicadas ad hoc.

---

## 25. Localização arquitetural

A autorização deverá pertencer ao módulo Identity and Access, com policies específicas próximas aos módulos owners quando necessário.

Estrutura conceitual:

```text
identity-and-access/
├── domain/
│   ├── memberships/
│   ├── roles/
│   ├── permissions/
│   └── policies/
├── application/
├── ports/
├── adapters/
└── tests/
```

Módulos poderão publicar descritores de recursos e policies específicas sem assumir ownership global da identidade.

---

## 26. Enforcement em casos de uso

A autorização deverá ocorrer antes do efeito protegido.

```text
validar input
→ autenticar
→ resolver Account
→ carregar membership
→ carregar atributos mínimos do recurso
→ autorizar
→ executar regra
→ persistir
→ auditar
```

A autorização não deverá ser executada somente após a alteração.

---

## 27. Next.js

Pages e layouts poderão utilizar autorização para experiência e navegação.

Porém, o controle definitivo deverá permanecer no servidor e no caso de uso.

Server Components poderão:

* verificar sessão;
* resolver Account;
* carregar read models autorizados.

Eles não deverão assumir que uma rota oculta representa proteção suficiente.

---

## 28. Server Functions

Toda Server Function protegida deverá:

1. validar input;
2. validar sessão;
3. resolver identity;
4. resolver Account;
5. autorizar;
6. chamar caso de uso;
7. registrar resultado.

Os campos `accountId`, `role` e `userId` enviados pelo cliente não deverão ser confiados.

---

## 29. Route Handlers

Route Handlers deverão mapear:

* ausência de autenticação;
* ausência de autorização;
* recurso inexistente;
* validação;
* conflito;
* falha interna.

Não deverão revelar se um recurso de outra Account existe.

---

## 30. Middleware

Middleware ou Proxy poderão apoiar:

* proteção inicial;
* redirect;
* resolução de contexto;
* headers;
* correlação.

Eles não deverão ser o único enforcement de autorização de recurso.

---

## 31. Queries multi-tenant

Toda query de recurso privado deverá preservar o tenant.

Exemplo:

```typescript
await db
  .select()
  .from(trips)
  .where(
    and(
      eq(trips.accountId, accountId),
      eq(trips.id, tripId),
    ),
  );
```

Query inadequada:

```typescript
await db
  .select()
  .from(trips)
  .where(eq(trips.id, tripId));
```

quando a Account for necessária para garantir isolamento.

---

## 32. Escopo transitivo

Recursos filhos deverão preservar Account pela relação.

Exemplo:

```text
Account
→ Trip
→ Activity
```

Para acessar uma Activity, a query deverá comprovar:

* Activity;
* Trip;
* Account correta.

Buscar somente por `activityId` não deverá ser o padrão de autorização.

---

## 33. Repositories

Repositories deverão exigir o escopo apropriado.

Exemplo:

```typescript
interface ActivityRepository {
  findById(input: {
    accountId: AccountId;
    tripId: TripId;
    activityId: ActivityId;
  }): Promise<Activity | null>;
}
```

Interfaces genéricas como `findById(id)` deverão ser evitadas para recursos multi-tenant.

---

## 34. Read models

Read models deverão:

* receber Account;
* aplicar escopo;
* selecionar somente dados autorizados;
* não depender de filtragem posterior no frontend.

Filtrar resultados após recuperar dados de múltiplas Accounts é proibido.

---

## 35. Escritas

Operações de escrita deverão utilizar:

* Account resolvida;
* resource scope;
* membership ativa;
* permission;
* policy;
* constraints.

Objetos enviados pelo cliente não deverão definir o tenant efetivo.

---

## 36. Foreign keys e integridade

O modelo físico deverá reduzir referências cross-account inconsistentes.

Quando aplicável, poderão ser utilizados:

* chaves compostas;
* constraints;
* índices únicos;
* validação transacional;
* foreign keys compatíveis com `accountId`.

A estratégia final deverá respeitar o modelo físico de dados.

---

## 37. Row-Level Security

Row-Level Security poderá ser adotada como defesa em profundidade.

Ela poderá proteger contra:

* query sem filtro;
* bug de repository;
* acesso acidental;
* determinados acessos administrativos.

Ela não substituirá:

* autenticação;
* membership;
* policies;
* autorização da ação;
* regras do domínio.

---

## 38. Critérios para adoção de RLS

RLS deverá ser avaliada quando:

* o modelo multi-tenant estiver estável;
* a estratégia de pooling estiver definida;
* o contexto da Account puder ser aplicado com segurança;
* migrations e jobs estiverem contemplados;
* testes de policies forem viáveis;
* o benefício operacional superar a complexidade.

---

## 39. Contexto da Account no banco

Caso RLS seja utilizada, o contexto deverá ser aplicado por transação ou conexão de forma segura.

A estratégia deverá considerar:

* pooling;
* transações;
* reset;
* jobs;
* migrations;
* administração;
* prepared statements;
* falhas.

Um contexto de Account não deverá vazar entre requests.

---

## 40. Credenciais de banco

Poderão existir papéis distintos:

* aplicação;
* migrations;
* leitura operacional;
* administração;
* jobs.

A credencial comum da aplicação não deverá possuir bypass irrestrito de policies sem justificativa.

---

## 41. Account switching

Usuários com múltiplas memberships poderão alterar a Account ativa.

A seleção deverá:

* ser validada;
* exigir membership ativa;
* não confiar somente no cliente;
* atualizar contexto da interface;
* não alterar automaticamente ownership de recursos.

---

## 42. Convites

Um convite não deverá conceder acesso antes da aceitação válida.

O fluxo deverá verificar:

* convite;
* destinatário;
* expiração;
* status;
* Account;
* role proposta;
* revogação;
* identidade autenticada.

---

## 43. Remoção de membership

Ao remover uma membership:

* novos acessos deverão ser bloqueados;
* sessões poderão permanecer autenticadas;
* acesso à Account deverá cessar;
* tokens delegados deverão ser revogados;
* execuções pendentes deverão ser avaliadas;
* auditoria deverá ser registrada.

---

## 44. Suspensão

A suspensão deverá impedir acesso mesmo com sessão válida.

Poderá ser aplicada a:

* User;
* Account;
* membership;
* capability;
* agente;
* Tool.

---

## 45. Ownership da Account

A Account deverá possuir pelo menos um Owner ativo, salvo durante encerramento controlado.

A transferência ou remoção do último Owner deverá exigir policy específica.

---

## 46. Ações críticas

Ações críticas poderão exigir:

* papel Owner;
* sessão recente;
* confirmação;
* step-up authentication;
* auditoria reforçada.

Exemplos:

* fechar Account;
* excluir dados;
* exportar dados;
* remover Owner;
* transferir ownership;
* revogar todas as sessões;
* alterar configurações críticas.

---

## 47. Resources compartilháveis

O modelo inicial assume recursos privados à Account.

Compartilhamento externo ou público deverá exigir estratégia explícita.

Não deverão ser utilizados:

* IDs previsíveis;
* URLs sem expiração;
* links permanentes sem revogação;
* recursos públicos por padrão.

---

## 48. Links de compartilhamento

Caso adotados futuramente, deverão possuir:

* shareId;
* resourceId;
* Account;
* permission limitada;
* expiração;
* revogação;
* uso único quando aplicável;
* auditoria.

Um link de compartilhamento não deverá conceder acesso à Account inteira.

---

## 49. Place Catalog

Places públicos ou globais poderão possuir ownership diferente dos dados privados da Account.

A autorização deverá distinguir:

* Place global;
* Place privado;
* Place salvo na Trip Collection;
* notas privadas;
* avaliações pessoais;
* dados derivados por Account.

Um Place público não torna públicos os dados relacionados à viagem.

---

## 50. Recommendation

Uma Recommendation deverá pertencer ao contexto autorizado.

Ações como:

* visualizar;
* descartar;
* converter em Activity;
* fornecer feedback;

deverão validar Account e Trip.

---

## 51. Decision

Uma Decision pertence ao módulo Decision Intelligence e deverá preservar:

* Account;
* Trip;
* actor;
* origem;
* contexto;
* autorização.

Recommendation não deverá ser tratada como Decision automaticamente.

---

## 52. Planning Conflict

Ações canônicas incluem:

* `ResolvePlanningConflict`;
* `IgnorePlanningRisk`;
* `RestoreIgnoredPlanningRisk`.

Cada ação deverá validar:

* Account;
* Trip;
* PlanningConflictId;
* estado;
* permission;
* policy.

---

## 53. Itinerary Proposal

A autorização deverá distinguir:

* leitura;
* rejeição;
* aceitação;
* aceitação parcial.

`AcceptItineraryProposalPartially` deverá exigir:

* proposta pertencente à Account;
* Trip correta;
* estado válido;
* seleção válida;
* permission;
* audit trail.

---

## 54. Agentes

Agentes não deverão receber uma sessão humana irrestrita.

A execução deverá preservar:

```text
actor = Agent
subject = User
accountId
membership
capabilityId
agentId
toolset
delegatedPermissions
expiresAt
```

---

## 55. Autorização delegada

Uma delegação deverá ser:

* explícita;
* limitada;
* temporária;
* vinculada à Account;
* vinculada à capability;
* menor ou igual às permissões do usuário;
* auditável;
* revogável.

---

## 56. Regra de interseção

As permissões efetivas de um agente deverão ser a interseção entre:

* permissões do User;
* permissões da membership;
* permissões da capability;
* allowlist do agente;
* allowlist da Tool;
* restrições do recurso;
* restrições do ambiente.

```text
permissão efetiva
=
User
∩ Membership
∩ Capability
∩ Agent
∩ Tool
∩ Resource Policy
```

---

## 57. Tools

Cada Tool deverá declarar:

* toolId;
* actions permitidas;
* resources;
* input schema;
* output schema;
* capability;
* requisitos de autorização;
* timeout;
* idempotência;
* efeitos.

Uma Tool não deverá utilizar permission genérica como `admin`.

---

## 58. Tool read-only

Tools de leitura deverão permanecer read-only.

Exemplos:

* consultar Trip;
* listar Places;
* recuperar Activities;
* visualizar Planning Conflicts.

A classificação read-only deverá ser verificável pela implementação.

---

## 59. Tools mutáveis

Tools mutáveis deverão:

* validar delegação;
* autorizar ação específica;
* validar input;
* registrar actor e subject;
* preservar idempotência;
* emitir evidência;
* limitar efeitos.

---

## 60. Confirmação humana

Ações de maior impacto poderão exigir confirmação humana mesmo quando tecnicamente autorizadas.

Exemplos:

* aplicar uma Itinerary Proposal;
* aceitar parcialmente uma proposta;
* remover Activities;
* alterar grandes partes do itinerário;
* excluir Trip.

Autorização e confirmação são controles distintos.

---

## 61. Jobs e workers

Jobs deverão utilizar identidade própria.

Quando operarem sobre uma Account, deverão possuir:

* jobId;
* actor workload;
* Account;
* ação;
* motivo;
* Provenance;
* limites.

Jobs não deverão executar com contexto global irrestrito por padrão.

---

## 62. Operações administrativas

Acesso administrativo deverá ser separado do uso comum.

Ele deverá possuir:

* finalidade;
* papel técnico;
* aprovação;
* duração;
* auditoria;
* motivo;
* menor privilégio.

Suporte não deverá visualizar dados privados sem necessidade e autorização.

---

## 63. Break-glass

Acesso emergencial deverá:

* ser excepcional;
* possuir credencial separada;
* exigir justificativa;
* gerar alerta;
* possuir duração limitada;
* ser revisado posteriormente.

---

## 64. Auditoria

Decisões relevantes de autorização deverão registrar:

* actor;
* subject;
* accountId;
* membershipId;
* action;
* resourceType;
* resourceId;
* policyId;
* result;
* reasonCode;
* requestId;
* correlationId;
* capabilityId quando aplicável;
* agentId quando aplicável;
* timestamp.

---

## 65. Minimização de logs

Logs não deverão conter:

* tokens;
* cookies;
* dados pessoais completos;
* conteúdo integral do recurso;
* prompts integrais;
* secrets;
* credenciais;
* localização precisa sem necessidade.

---

## 66. Respostas de erro

A aplicação deverá diferenciar internamente:

* não autenticado;
* não autorizado;
* recurso não encontrado;
* membership inválida;
* Account suspensa.

A resposta externa deverá evitar enumeração.

Em determinados cenários, recurso de outra Account poderá ser apresentado como inexistente.

---

## 67. Reason codes

Códigos iniciais poderão incluir:

```text
AUTHENTICATION_REQUIRED
MEMBERSHIP_REQUIRED
MEMBERSHIP_INACTIVE
ACCOUNT_MISMATCH
PERMISSION_DENIED
RESOURCE_NOT_ACCESSIBLE
RESOURCE_STATE_FORBIDDEN
DELEGATION_REQUIRED
DELEGATION_EXPIRED
TOOL_NOT_ALLOWED
CAPABILITY_NOT_ALLOWED
STEP_UP_REQUIRED
```

Reason codes deverão ser estáveis e não revelar detalhes sensíveis.

---

## 68. Cache de autorização

Decisões poderão ser cacheadas apenas quando:

* contexto for completo;
* TTL for curto;
* membership changes invalidarem o cache;
* revogação for considerada;
* recurso for estável;
* risco for baixo.

A otimização não deverá manter acesso após remoção de membership.

---

## 69. Feature flags

Feature flags não deverão conceder autorização.

Elas poderão habilitar capacidade para usuários já autorizados.

O fluxo correto é:

```text
feature habilitada
+
autorização aprovada
→ capacidade disponível
```

---

## 70. Desenvolvimento local

O ambiente local deverá permitir:

* múltiplos Users sintéticos;
* múltiplas Accounts;
* múltiplas memberships;
* papéis diferentes;
* recursos em tenants diferentes;
* testes cross-account.

Um único usuário seedado não é suficiente para validar isolamento.

---

## 71. Seeds mínimos

Deverão existir cenários como:

```text
User A
→ Account A
→ Trip A

User B
→ Account B
→ Trip B

User C
→ Member da Account A
→ Viewer da Account B
```

---

## 72. Testes unitários

Deverão cobrir:

* mapeamento de papéis;
* permission inexistente;
* membership ativa;
* membership suspensa;
* resource mismatch;
* policy por estado;
* delegação;
* menor privilégio;
* negação por padrão.

---

## 73. Testes de integração

Deverão validar:

* queries com Account;
* repositories;
* constraints;
* memberships;
* transações;
* mudanças de papel;
* suspensão;
* remoção;
* auditoria;
* RLS quando adotada.

---

## 74. Testes cross-account

Todo módulo que armazene dados privados deverá possuir testes negativos.

Casos mínimos:

* Trip de outra Account;
* Activity de outra Trip;
* Recommendation de outra Account;
* Planning Conflict de outra Trip;
* Itinerary Proposal de outra Account;
* membership removida;
* ID manipulado;
* Account ativa manipulada;
* Tool usando tenant incorreto.

---

## 75. Testes end-to-end

Jornadas mínimas:

1. Owner cria Trip;
2. Member edita Activity;
3. Viewer visualiza Trip;
4. Viewer não edita;
5. User de outra Account não visualiza;
6. membership suspensa perde acesso;
7. troca de Account altera o contexto;
8. agente read-only não executa mutação;
9. Tool mutável sem delegação é bloqueada.

---

## 76. Property-based tests

Poderão ser utilizados para verificar propriedades como:

* nenhum recurso da Account A aparece para Account B;
* nenhuma permission inexistente resulta em allow;
* nenhuma delegação amplia permissões;
* membership inativa nunca concede acesso.

---

## 77. Testes de RLS

Caso RLS seja adotada, deverão cobrir:

* contexto ausente;
* contexto correto;
* contexto incorreto;
* troca de conexão;
* pooling;
* transação;
* job;
* migration;
* bypass administrativo.

---

## 78. Testes de concorrência

Deverão considerar:

* membership removida durante operação;
* role alterado;
* proposta alterada;
* conflito resolvido por outro usuário;
* Account encerrada;
* sessão revogada.

A regra de consistência deverá ser explícita.

---

## 79. Observabilidade

Métricas poderão incluir:

* autorizações permitidas;
* autorizações negadas;
* negações por reasonCode;
* tentativas cross-account;
* Tools bloqueadas;
* delegações expiradas;
* memberships suspensas;
* erros de policy;
* latência de autorização.

---

## 80. Alertas

Alertas poderão cobrir:

* aumento anormal de tentativas cross-account;
* acesso administrativo;
* falha sistemática de policy;
* bypass de autorização;
* Tool executando ação não declarada;
* contexto de tenant ausente;
* falha de RLS;
* volume anormal de negações.

---

## 81. Performance

A autorização deverá evitar:

* múltiplas queries redundantes;
* carregamento completo de recursos;
* políticas com acesso excessivo;
* validações duplicadas.

Otimizações possíveis:

* membership no request context;
* descritores mínimos;
* joins autorizados;
* cache curto;
* read models escopados.

---

## 82. Request Context

A aplicação poderá construir um contexto por request:

```typescript
interface RequestContext {
  requestId: string;
  correlationId: string;
  identity: AuthenticatedIdentity;
  activeAccountId?: AccountId;
  memberships: AccountMembershipSummary[];
}
```

Esse contexto não deverá tornar papéis ou Account imutáveis além da duração apropriada.

---

## 83. Dependência do framework

O serviço de autorização deverá ser independente do Next.js.

Adapters poderão traduzir:

* headers;
* cookies;
* sessão;
* requests.

Policies e permissions não deverão depender de tipos do framework.

---

## 84. Dependência do Better Auth

Better Auth deverá fornecer identidade e sessão.

A autorização deverá utilizar identificadores internos e abstrações próprias.

A substituição do Better Auth não deverá exigir reescrita das policies.

---

## 85. Dependência do Drizzle

Drizzle poderá implementar repositories e queries.

O serviço de autorização não deverá expor:

* schemas;
* query builder;
* transaction client;
* rows.

---

## 86. Dependência do PostgreSQL

PostgreSQL poderá fornecer:

* persistência;
* constraints;
* RLS;
* audit trail;
* transações.

A semântica das permissions e policies continuará na aplicação.

---

## 87. Agentes de IA

Agentes poderão apoiar:

* criação de policies;
* testes;
* catálogo de permissions;
* análise de gaps;
* revisão de queries.

Agentes não poderão autonomamente:

* adicionar permission;
* ampliar papel;
* remover policy;
* criar bypass;
* conceder membership;
* alterar Account;
* habilitar acesso administrativo;
* modificar RLS;
* alterar delegação;
* executar Tool fora da allowlist.

---

## 88. Revisão de mudanças

Mudanças em autorização deverão avaliar:

* novos recursos;
* novas ações;
* papéis afetados;
* policies;
* interface;
* APIs;
* Tools;
* agentes;
* testes;
* auditoria;
* migração;
* retrocompatibilidade.

---

## 89. Mudanças críticas

Deverão exigir revisão especializada:

* novo papel administrativo;
* permission ampla;
* acesso cross-account;
* acesso de suporte;
* bypass de RLS;
* delegação permanente;
* Tool com efeito destrutivo;
* compartilhamento público.

---

## 90. Consequências positivas

A decisão proporciona:

* isolamento explícito;
* evolução para colaboração;
* roles simples;
* policies granulares;
* menor privilégio;
* defesa em profundidade;
* suporte a agentes;
* testes claros;
* auditabilidade;
* independência de framework;
* compatibilidade com monólito modular.

---

## 91. Consequências negativas

A decisão introduz:

* necessidade de catálogo de permissions;
* necessidade de policies;
* contexto adicional;
* testes numerosos;
* risco de duplicação;
* necessidade de governar roles;
* maior complexidade que RBAC puro;
* potencial custo adicional de queries;
* necessidade futura de decidir sobre RLS.

---

## 92. Riscos

### 92.1 Query sem tenant

Mitigações:

* repositories escopados;
* lint;
* revisão;
* testes;
* RLS quando adotada.

### 92.2 Papel excessivamente amplo

Mitigações:

* permissions explícitas;
* policies por recurso;
* revisão;
* menor privilégio.

### 92.3 Autorização somente na UI

Mitigações:

* enforcement server-side;
* testes de API;
* casos de uso protegidos.

### 92.4 Account ativa manipulada

Mitigações:

* membership validada;
* resolução server-side;
* queries escopadas.

### 92.5 Delegação ampliando acesso

Mitigações:

* regra de interseção;
* expiração;
* allowlists;
* auditoria.

### 92.6 Regras duplicadas

Mitigações:

* Authorization Service;
* catálogo central;
* policies reutilizáveis;
* testes.

### 92.7 RLS configurada incorretamente

Mitigações:

* adoção progressiva;
* testes;
* pooling validado;
* revisão;
* runbooks.

### 92.8 Suporte administrativo invasivo

Mitigações:

* acesso separado;
* break-glass;
* justificativa;
* alerta;
* auditoria.

---

## 93. Controles

Deverão ser implementados:

* negação por padrão;
* membership ativa;
* catálogo de permissions;
* roles;
* policies;
* repositories escopados;
* testes cross-account;
* auditoria;
* logs sanitizados;
* reason codes;
* sessão server-side;
* delegação limitada;
* allowlist de Tools;
* secret scanning;
* revisão de mudanças;
* menor privilégio.

---

## 94. Estratégia de implementação

### Etapa 1 — Domínio de acesso

* criar Account Membership;
* criar Role;
* criar Permission;
* criar status;
* criar policies iniciais.

### Etapa 2 — Serviço de autorização

* criar Authorization Context;
* criar Authorization Decision;
* criar serviço;
* implementar negação por padrão.

### Etapa 3 — Trip Management

* proteger `trip.create`;
* proteger `trip.read`;
* proteger `trip.update`;
* proteger `trip.delete`;
* criar testes cross-account.

### Etapa 4 — Repositories

* exigir Account;
* remover queries apenas por ID;
* adicionar constraints;
* revisar read models.

### Etapa 5 — Interface web

* resolver Account ativa;
* proteger Server Functions;
* proteger Route Handlers;
* refletir permissions na interface.

### Etapa 6 — Colaboração

* adicionar papéis;
* adicionar convites;
* adicionar troca de Account;
* adicionar remoção e suspensão.

### Etapa 7 — Agentes e Tools

* criar Delegation Context;
* aplicar regra de interseção;
* proteger Tools;
* adicionar auditoria.

### Etapa 8 — Defesa em profundidade

* avaliar RLS;
* criar ADR ou implementação específica;
* testar pooling;
* criar runbooks.

---

## 95. Critérios de implementação concluída

A decisão estará implementada quando:

* Account Membership existir;
* papéis iniciais existirem;
* permissions iniciais existirem;
* Authorization Service existir;
* negação por padrão estiver ativa;
* Trip Management estiver protegido;
* repositories exigirem Account;
* testes cross-account passarem;
* Server Functions estiverem protegidas;
* Route Handlers estiverem protegidos;
* membership suspensa bloquear acesso;
* auditoria registrar decisões relevantes;
* Tools respeitarem permissions delegadas.

---

## 96. Verificação

A verificação deverá incluir:

* Owner autorizado;
* Member autorizado;
* Viewer limitado;
* User externo bloqueado;
* membership suspensa;
* membership removida;
* Account ativa manipulada;
* Trip de outra Account;
* Activity de outra Trip;
* Recommendation de outra Account;
* Planning Conflict de outra Trip;
* Itinerary Proposal de outra Account;
* agente read-only;
* Tool mutável sem delegação;
* negação por permission inexistente.

---

## 97. Métricas

Poderão ser acompanhadas:

* autorizações por ação;
* negações por ação;
* tentativas cross-account;
* policies sem teste;
* permissions sem owner;
* roles com muitas permissions;
* falhas de tenant context;
* Tools bloqueadas;
* delegações expiradas;
* latência de autorização;
* incidentes de acesso.

---

## 98. Gatilhos de revisão

A decisão deverá ser revisada quando:

* permissions se tornarem excessivamente numerosas;
* policies se tornarem difíceis de manter;
* múltiplos serviços exigirem decisão centralizada;
* organizações empresariais exigirem hierarquia complexa;
* compartilhamento por recurso se tornar central;
* um motor externo oferecer benefício comprovado;
* requisitos regulatórios exigirem controles adicionais;
* RLS se tornar necessária para reduzir risco;
* a autorização causar impacto de desempenho material.

---

## 99. Estratégia de rollback

A substituição do modelo deverá ser registrada em novo ADR.

A migração deverá preservar:

* Accounts;
* memberships;
* papéis;
* permissions;
* policies;
* auditoria;
* recursos;
* delegações;
* Tools;
* isolamento.

Mudanças deverão ser progressivas para evitar períodos sem enforcement.

---

## 100. Decisões derivadas

Deverão ser avaliadas decisões sobre:

* Row-Level Security;
* convites;
* Account switching;
* links de compartilhamento;
* acesso administrativo;
* autenticação de API;
* identidade de workloads;
* delegação para agentes;
* policy engine externo;
* step-up authentication;
* papéis empresariais.

---

## 101. Próxima decisão

O `RB-ADR-009` deverá definir a estratégia inicial de validação de schemas e contratos em runtime.

A decisão deverá avaliar:

* Zod;
* Valibot;
* JSON Schema;
* TypeBox;
* schemas compartilhados;
* contratos de API;
* Structured Outputs;
* Tool inputs;
* variáveis de ambiente;
* inferência TypeScript;
* compatibilidade com Next.js;
* compatibilidade com Drizzle;
* geração de OpenAPI.

A decisão deverá preservar a separação entre:

* schema externo;
* input validado;
* command;
* domínio;
* persistência.

---

## 102. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-008
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o novo ADR;
* permanecer disponível;
* preservar o contexto histórico.

---

## 103. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* Account está definida como tenant;
* Account Membership está definida;
* papéis estão definidos;
* permissions estão definidas;
* policies estão definidas;
* negação por padrão está definida;
* Authorization Context está definido;
* Authorization Decision está definida;
* enforcement server-side está definido;
* queries multi-tenant estão governadas;
* repositories estão escopados;
* recursos filhos estão contemplados;
* RLS está corretamente posicionada;
* Account switching está contemplado;
* suspensão está contemplada;
* ações críticas estão contempladas;
* agentes estão contemplados;
* Tools estão contempladas;
* auditoria está definida;
* testes cross-account estão definidos;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* gatilhos de revisão estão definidos;
* supersessão está definida;
* autenticação não foi confundida com autorização;
* papel não foi tratado como autorização universal;
* não existem contradições com RB-ADR-007;
* não existem contradições com RB-SEC-001;
* não existem contradições com RB-SEC-002;
* não existem contradições com RB-AI-005;
* não existem contradições com RB-AI-006.

---

## 104. Declaração final

O RouteBook adotará um modelo híbrido de autorização baseado em:

* Account;
* Account Membership;
* papéis;
* permissions;
* policies por recurso;
* atributos contextuais;
* negação por padrão;
* enforcement server-side.

A Account será a fronteira principal de isolamento multi-tenant.

Uma sessão válida não será suficiente para conceder acesso.

Toda ação protegida deverá validar:

* actor;
* subject;
* Account;
* membership;
* permission;
* recurso;
* contexto;
* policy.

Papéis serão utilizados para simplificar permissões comuns.

Eles não substituirão políticas específicas de recurso.

Queries e repositories deverão preservar o tenant desde a origem.

A filtragem posterior de dados não será considerada mecanismo de segurança.

Row-Level Security poderá ser adotada como defesa adicional, mas não substituirá autorização na aplicação.

Agentes e Tools somente poderão executar ações dentro da interseção entre:

* permissões do usuário;
* membership;
* capability;
* agente;
* Tool;
* recurso.

O modelo deverá impedir acesso cross-account, preservar menor privilégio e permitir que o RouteBook evolua de uma experiência pessoal para colaboração segura sem redefinir sua arquitetura central.
