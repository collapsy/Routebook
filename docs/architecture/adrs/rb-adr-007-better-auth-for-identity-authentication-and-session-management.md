---

id: RB-ADR-007

title: Adoção de Better Auth para Identidade, Autenticação e Gestão de Sessões
description: Registra a decisão de adotar Better Auth como base de autenticação e gestão de sessões do RouteBook, integrado a Next.js, PostgreSQL e Drizzle ORM, preservando a separação entre autenticação, autorização, Account, identidade de domínio e Providers externos.

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
- authentication
- identity
- session-management
- better-auth
- oauth
- openid-connect
- nextjs
- drizzle-orm
- postgresql
- cookies
- authorization
- security
- modular-monolith

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-002
- RB-PRD-003
- RB-PRD-004
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
- RB-ADR-006

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
- RB-PRIV-002
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

next_documents:

- RB-ADR-008

ai_context:
priority: critical
index: true
---

# RB-ADR-007 — Adoção de Better Auth para Identidade, Autenticação e Gestão de Sessões

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* Better Auth será a biblioteca principal de autenticação e gestão de sessões;
* a integração será executada no servidor da aplicação Next.js;
* PostgreSQL será utilizado para persistência de usuários, contas de autenticação, sessões e verificações;
* Drizzle ORM será utilizado por meio do adapter oficial;
* sessões serão validadas no servidor;
* autorização continuará pertencendo à aplicação e aos módulos de domínio;
* a entidade de autenticação não substituirá automaticamente `User`, `Account` ou outros conceitos canônicos;
* Providers sociais deverão ser adicionados progressivamente;
* versões exatas deverão ser fixadas antes da implementação.

---

## 2. Contexto

As decisões anteriores estabeleceram:

* monólito modular;
* TypeScript;
* Node.js;
* Next.js com App Router;
* monorepo com pnpm Workspaces e Turborepo;
* PostgreSQL com PostGIS;
* Drizzle ORM e Drizzle Kit.

O RouteBook precisa identificar usuários e manter sessões seguras para permitir que uma pessoa:

* crie uma Trip;
* acesse suas Trips;
* defina hospedagem;
* organize Activities;
* salve Places;
* consulte Recommendations;
* resolva Planning Conflicts;
* avalie Itinerary Proposals;
* configure preferências;
* gerencie dados pessoais;
* encerre sessões;
* exclua ou encerre sua conta.

O modelo de domínio também prevê conceitos distintos:

* identidade autenticada;
* User;
* Account;
* vínculo entre usuário e Account;
* papéis;
* permissões;
* ownership de Trips;
* autorização por recurso.

Autenticar uma pessoa não determina automaticamente:

* a qual Account ela pertence;
* quais Trips poderá acessar;
* quais ações poderá executar;
* quais dados poderá visualizar;
* quais Tools um agente poderá chamar em seu nome.

É necessário selecionar uma solução de autenticação que seja compatível com a stack, mas que não se torne o owner das regras de autorização ou do modelo de domínio.

---

## 3. Problema

Qual estratégia deverá ser utilizada para identidade, autenticação e gestão de sessões no RouteBook, considerando:

* Next.js;
* TypeScript;
* PostgreSQL;
* Drizzle ORM;
* monólito modular;
* login social;
* sessões seguras;
* proteção contra acesso cross-account;
* baixo custo inicial;
* desenvolvimento local;
* portabilidade;
* possibilidade de múltiplos usuários por Account;
* revogação;
* privacidade;
* auditoria;
* evolução futura?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. segurança;
2. integração com Next.js;
3. integração com PostgreSQL;
4. integração com Drizzle ORM;
5. sessões revogáveis;
6. suporte a cookies seguros;
7. suporte a OAuth 2.0;
8. suporte a OpenID Connect;
9. suporte a login social;
10. baixo custo inicial;
11. controle sobre os dados;
12. portabilidade;
13. desenvolvimento local;
14. extensibilidade;
15. separação entre autenticação e autorização;
16. compatibilidade com monólito modular;
17. capacidade de auditoria;
18. suporte a múltiplas Accounts;
19. proteção contra account takeover;
20. manutenção sustentável.

---

## 5. Restrições

A solução deverá:

* funcionar com Next.js App Router;
* funcionar no runtime Node.js;
* funcionar com TypeScript;
* persistir dados em PostgreSQL;
* integrar-se ao Drizzle ORM;
* validar sessões no servidor;
* utilizar cookies seguros;
* suportar logout;
* suportar revogação;
* permitir OAuth ou OIDC;
* funcionar localmente;
* não exigir um Provider proprietário obrigatório;
* não transformar autenticação em autorização;
* não expor tokens ao navegador sem necessidade;
* não permitir acesso baseado apenas na existência de cookie;
* permitir evolução futura para múltiplos usuários por Account.

---

## 6. Terminologia

### 6.1 Identidade

Representação reconhecível de uma pessoa, workload ou agente.

### 6.2 Autenticação

Processo de verificar a identidade apresentada.

### 6.3 Autorização

Processo de decidir se uma identidade autenticada poderá executar determinada ação sobre determinado recurso.

### 6.4 Sessão

Estado temporário que vincula um cliente autenticado a uma identidade válida.

### 6.5 Account

Fronteira de ownership, isolamento e colaboração do RouteBook.

### 6.6 User

Representação canônica de uma pessoa dentro do domínio do RouteBook.

### 6.7 Authentication User

Registro técnico mantido pela solução de autenticação.

### 6.8 Provider Account

Vínculo técnico entre o usuário autenticado e um Provider externo.

---

## 7. Princípio central

Autenticação confirma identidade.

Autorização confirma acesso.

```text
credencial ou Provider
→ autenticação
→ sessão válida
→ identidade autenticada
→ resolução de Account
→ autorização da ação
→ execução do caso de uso
```

Uma sessão válida não autoriza automaticamente acesso a qualquer recurso.

---

## 8. Opções consideradas

### 8.1 Opção A — Autenticação implementada integralmente pelo RouteBook

Implementar diretamente:

* senhas;
* hashing;
* recuperação;
* tokens;
* sessões;
* rotação;
* OAuth;
* cookies;
* verificações;
* account linking.

#### Benefícios

* controle completo;
* ausência de dependência de biblioteca principal;
* modelagem totalmente customizada;
* integração direta com o domínio.

#### Limitações

* alta responsabilidade de segurança;
* maior risco de vulnerabilidades;
* recuperação de senha complexa;
* OAuth e OIDC complexos;
* maior custo de manutenção;
* maior quantidade de testes críticos;
* desvio do foco principal do produto;
* maior risco de implementação incorreta por agentes de IA.

#### Avaliação

O RouteBook não deverá construir infraestrutura de autenticação do zero sem necessidade comprovada.

Foi rejeitada.

---

### 8.2 Opção B — Provider de identidade totalmente gerenciado

Utilizar serviço proprietário para:

* usuários;
* login;
* sessões;
* Providers;
* recuperação;
* MFA;
* painel administrativo.

#### Benefícios

* implementação rápida;
* menor carga operacional;
* recursos avançados;
* segurança gerenciada;
* suporte a escala;
* monitoramento especializado.

#### Limitações

* lock-in;
* custo progressivo;
* dependência operacional;
* restrições de customização;
* dados em Provider;
* maior complexidade de saída;
* possível duplicação entre identidade externa e modelo interno;
* desenvolvimento local dependente do serviço.

#### Avaliação

Poderá ser reavaliado se o RouteBook atingir requisitos empresariais ou operacionais maiores.

Foi rejeitado como estratégia inicial obrigatória.

---

### 8.3 Opção C — Auth.js

Utilizar Auth.js ou NextAuth.js para autenticação no Next.js.

#### Benefícios

* integração histórica com Next.js;
* ampla comunidade;
* Providers;
* cookies;
* adapters;
* documentação conhecida;
* solução open source.

#### Limitações

* projeto atualmente integrado ao ecossistema Better Auth;
* direção futura concentrada em Better Auth;
* migração futura provável em um projeto novo;
* alguns fluxos e plugins avançados exigiriam composição adicional.

#### Avaliação

É uma solução válida para sistemas existentes.

Para um novo projeto, Better Auth oferece uma direção mais adequada.

Foi rejeitada como escolha inicial.

---

### 8.4 Opção D — Better Auth

Utilizar Better Auth como biblioteca principal, integrada ao Next.js, PostgreSQL e Drizzle ORM.

#### Benefícios

* integração com Next.js;
* adapter oficial para Drizzle;
* suporte a PostgreSQL;
* sessões baseadas em cookies;
* suporte a OAuth e OIDC;
* plugins;
* controle sobre os dados;
* solução open source;
* compatibilidade com TypeScript;
* funcionamento local;
* suporte a expansão futura;
* separação possível entre autenticação e domínio;
* menor lock-in que serviço totalmente gerenciado.

#### Limitações

* biblioteca relativamente nova;
* APIs e plugins poderão evoluir;
* responsabilidade operacional permanece no RouteBook;
* schemas técnicos precisam ser integrados às migrations;
* configuração incorreta ainda pode gerar vulnerabilidades;
* plugins não devem ser ativados indiscriminadamente;
* necessidade de acompanhar atualizações de segurança.

#### Avaliação

Oferece o melhor equilíbrio entre controle, integração, extensibilidade e simplicidade.

Foi selecionada.

---

### 8.5 Opção E — Serviço próprio baseado em OpenID Connect externo

Utilizar um servidor de identidade independente e integrar por OIDC.

#### Benefícios

* protocolo padrão;
* separação de responsabilidade;
* suporte a múltiplas aplicações;
* centralização de identidade;
* independência do frontend.

#### Limitações

* infraestrutura adicional;
* operação especializada;
* configuração;
* deployment;
* backups;
* atualizações;
* complexidade incompatível com o estágio atual.

#### Avaliação

Poderá ser adequado futuramente para um ecossistema com múltiplos produtos.

Foi rejeitado para o MVP.

---

## 9. Decisão

O RouteBook adotará:

* **Better Auth** como biblioteca principal de autenticação;
* **PostgreSQL** como persistência de autenticação;
* **Drizzle Adapter** como integração de persistência;
* **sessões persistidas e revogáveis**;
* **cookies HTTP-only** para transporte da sessão;
* **Google por OpenID Connect/OAuth** como primeiro Provider social elegível;
* **validação da sessão no servidor** para operações protegidas;
* **modelo de autorização próprio** no módulo Identity and Access;
* **Account e membership próprios do RouteBook**.

Better Auth será tratado como componente técnico de autenticação.

Ele não será o modelo completo de identidade e acesso do produto.

---

## 10. Escopo da decisão

Esta decisão define:

* biblioteca de autenticação;
* persistência de sessões;
* integração com PostgreSQL e Drizzle;
* estratégia inicial de cookies;
* integração com Next.js;
* papel dos Providers externos;
* relação entre usuário autenticado e domínio;
* princípios de sessão;
* princípios de revogação.

Esta decisão não define completamente:

* modelo final de papéis;
* matriz completa de permissões;
* Row-Level Security;
* MFA obrigatório;
* autenticação de serviços;
* autenticação de agentes;
* autenticação de API pública;
* Provider de e-mail;
* política empresarial de SSO;
* OAuth Provider próprio;
* SCIM;
* passkeys obrigatórias.

---

## 11. Localização arquitetural

Better Auth deverá permanecer dentro do módulo:

* Identity and Access;

e de seus adapters técnicos.

Estrutura conceitual:

```text
identity-and-access/
├── domain/
├── application/
├── ports/
├── adapters/
│   ├── authentication/
│   │   └── better-auth/
│   └── persistence/
├── contracts/
└── tests/
```

O restante do domínio não deverá depender diretamente do Better Auth.

---

## 12. Integração com Next.js

A integração deverá utilizar:

* Route Handler dedicado;
* funções server-side;
* leitura e validação de sessão no servidor;
* Client API apenas para interações de login e logout quando necessária.

Estrutura conceitual:

```text
apps/web/src/
├── app/
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts
├── interfaces/
├── modules/
│   └── identity-and-access/
└── platform/
    └── authentication/
```

A estrutura final deverá seguir a documentação oficial da versão fixada.

---

## 13. Fronteira de autenticação

A solução deverá expor uma abstração interna.

Exemplo conceitual:

```typescript
interface AuthenticationService {
  getAuthenticatedIdentity(
    requestContext: RequestContext,
  ): Promise<AuthenticatedIdentity | null>;

  revokeSession(sessionId: SessionId): Promise<void>;

  revokeAllUserSessions(userId: UserId): Promise<void>;
}
```

Casos de uso não deverão depender diretamente de métodos específicos do Better Auth.

---

## 14. Identidade autenticada

A identidade autenticada deverá conter somente o necessário para iniciar autorização.

Exemplo conceitual:

```typescript
interface AuthenticatedIdentity {
  authenticationUserId: AuthenticationUserId;
  userId: UserId;
  sessionId: SessionId;
  accountMemberships: AccountMembershipSummary[];
}
```

Dados como role ou Account ativa não deverão ser confiados apenas porque foram enviados pelo cliente.

---

## 15. Authentication User e User

O registro técnico criado pelo Better Auth não deverá substituir automaticamente o `User` canônico.

A relação deverá ser explícita:

```text
AuthenticationUser
→ IdentityLink
→ User
```

Essa separação permite:

* múltiplos métodos de login;
* evolução do Provider;
* linking de contas;
* migração;
* suspensão;
* exclusão;
* separação entre dados técnicos e dados de domínio.

---

## 16. Account

A `Account` do RouteBook é uma fronteira de domínio.

Ela não deverá ser confundida com:

* provider account;
* OAuth account;
* conta Google;
* sessão;
* usuário técnico do Better Auth.

Uma Account poderá representar inicialmente o espaço pessoal do viajante.

Futuramente poderá representar:

* família;
* grupo de viagem;
* equipe;
* organização.

---

## 17. Membership

A relação entre `User` e `Account` deverá ser representada explicitamente.

Exemplo conceitual:

```text
User
→ AccountMembership
→ Account
```

A membership poderá conter:

* membershipId;
* userId;
* accountId;
* role;
* status;
* createdAt;
* suspendedAt;
* invitedBy.

O modelo final deverá ser definido no domínio.

---

## 18. Account inicial

No primeiro login válido, o RouteBook poderá:

1. criar ou localizar o `User`;
2. criar vínculo com o `AuthenticationUser`;
3. criar uma Account pessoal;
4. criar membership inicial;
5. definir a Account ativa;
6. registrar o evento correspondente.

Esse processo deverá ser idempotente.

---

## 19. Provider social inicial

Google será o primeiro Provider social elegível porque:

* é amplamente utilizado;
* suporta OpenID Connect;
* reduz necessidade de senha própria;
* possui boa experiência em dispositivos móveis;
* simplifica o MVP.

A ativação concreta exigirá:

* credenciais por ambiente;
* callback autorizado;
* configuração de consentimento;
* política de dados;
* testes;
* plano de erro;
* documentação.

---

## 20. Providers adicionais

Providers adicionais somente deverão ser ativados quando houver necessidade real.

Possibilidades:

* Apple;
* Microsoft;
* GitHub;
* Provider genérico OIDC.

Cada Provider deverá possuir:

* finalidade;
* owner;
* dados solicitados;
* scopes;
* política de linking;
* comportamento de erro;
* configuração por ambiente;
* revogação;
* avaliação de privacidade.

---

## 21. E-mail e senha

Login com e-mail e senha não será obrigatório no primeiro incremento.

Sua adoção deverá avaliar:

* hashing;
* política de senha;
* recuperação;
* verificação;
* rate limiting;
* account enumeration;
* credential stuffing;
* suporte;
* notificação;
* MFA.

A funcionalidade não deverá ser ativada apenas porque a biblioteca a suporta.

---

## 22. Magic link

Magic link poderá ser considerado futuramente.

Sua adoção exige:

* Provider de e-mail;
* proteção contra abuso;
* expiração;
* uso único;
* rate limiting;
* prevenção de enumeração;
* tratamento de scanners de links;
* observabilidade.

---

## 23. Passkeys

Passkeys poderão ser avaliadas após a estabilização do fluxo inicial.

A adoção deverá considerar:

* recuperação;
* múltiplos dispositivos;
* compatibilidade;
* UX;
* suporte;
* vinculação de credenciais;
* risco de lockout.

---

## 24. Sessões persistidas

O RouteBook utilizará sessões persistidas em banco.

Isso permite:

* revogação;
* listagem;
* encerramento;
* auditoria;
* expiração;
* controle de dispositivos;
* encerramento global;
* investigação.

A sessão não deverá depender apenas de um token autocontido impossível de revogar imediatamente.

---

## 25. Cookie de sessão

O cookie deverá utilizar, conforme ambiente e compatibilidade:

* `HttpOnly`;
* `Secure` em ambientes HTTPS;
* `SameSite=Lax` como baseline inicial;
* `Path=/`;
* nome com prefixo apropriado;
* expiração compatível com a sessão.

O conteúdo não deverá expor dados pessoais ou autorização completa.

---

## 26. SameSite

`SameSite=Lax` será a configuração inicial preferencial.

Alterações para `Strict` ou `None` deverão considerar:

* fluxos OAuth;
* callbacks;
* embeds;
* múltiplos domínios;
* CSRF;
* HTTPS obrigatório.

`SameSite=None` não deverá ser utilizado sem necessidade comprovada.

---

## 27. Validação da sessão

A existência do cookie não é evidência suficiente de sessão válida.

Toda operação protegida deverá:

1. obter o cookie;
2. validar a sessão no servidor;
3. verificar expiração;
4. verificar revogação;
5. resolver o usuário;
6. resolver a Account;
7. executar autorização.

Fluxo proibido:

```text
cookie existe
→ acesso permitido
```

---

## 28. Cache de sessão

Cache de sessão poderá ser utilizado apenas se preservar:

* revogação;
* expiração;
* isolamento;
* invalidação;
* segurança;
* consistência suficiente.

Uma otimização não deverá transformar uma sessão revogada em acesso persistente.

---

## 29. Duração de sessão

A duração deverá equilibrar:

* conveniência;
* risco;
* uso móvel;
* frequência de acesso;
* revogação;
* sensibilidade.

A configuração inicial deverá possuir:

* validade máxima;
* renovação controlada;
* expiração por inatividade quando aplicável;
* revogação explícita.

Os valores exatos deverão ser definidos na implementação.

---

## 30. Sessão fresca

Operações sensíveis poderão exigir autenticação recente.

Exemplos:

* excluir Account;
* alterar e-mail;
* vincular Provider;
* remover Provider;
* encerrar todas as sessões;
* exportar dados;
* alterar configurações críticas.

A sessão válida, mas antiga, poderá exigir nova autenticação.

---

## 31. Logout

O logout deverá:

* invalidar a sessão atual;
* remover ou expirar o cookie;
* registrar resultado;
* redirecionar de forma segura;
* não afetar outras sessões sem solicitação.

---

## 32. Logout global

O usuário deverá poder encerrar todas as sessões.

A operação deverá:

* revogar sessões;
* preservar a sessão atual somente se explicitamente definido;
* registrar auditoria;
* notificar quando apropriado;
* exigir autenticação recente em cenários de maior risco.

---

## 33. Revogação

Sessões deverão ser revogadas quando houver:

* logout;
* alteração sensível;
* comprometimento;
* exclusão de usuário;
* suspensão;
* remoção de membership crítica;
* resposta a incidente;
* solicitação administrativa autorizada.

---

## 34. Rotação

Identificadores ou tokens de sessão deverão seguir a estratégia segura da biblioteca.

A aplicação não deverá implementar rotação paralela sem necessidade.

Mudanças na estratégia deverão considerar:

* fixation;
* replay;
* concorrência;
* múltiplos dispositivos;
* cache;
* auditoria.

---

## 35. Proteção contra session fixation

Uma nova sessão deverá ser criada quando a identidade for autenticada.

A sessão anterior não autenticada não deverá ser promovida sem rotação adequada.

---

## 36. Proteção contra roubo de sessão

Controles deverão incluir:

* HTTPS;
* cookies HTTP-only;
* Secure;
* SameSite;
* proteção contra XSS;
* CSP;
* rotação quando apropriada;
* revogação;
* logs;
* expiração.

Dados como IP e user-agent poderão apoiar detecção, mas não deverão ser utilizados isoladamente como prova absoluta.

---

## 37. CSRF

Operações mutáveis deverão utilizar proteções adequadas ao mecanismo da biblioteca e ao Next.js.

A estratégia deverá considerar:

* cookies;
* SameSite;
* origem;
* headers;
* tokens quando aplicáveis;
* Server Actions;
* Route Handlers;
* formulários.

---

## 38. OAuth e OpenID Connect

OAuth deverá ser utilizado para delegação.

OpenID Connect deverá ser utilizado para autenticação quando o Provider oferecer suporte.

A aplicação deverá validar:

* state;
* nonce quando aplicável;
* redirect URI;
* issuer;
* audience;
* assinatura;
* expiração;
* callback;
* associação do usuário.

A biblioteca deverá fornecer o fluxo, mas a configuração continuará sob responsabilidade do RouteBook.

---

## 39. Scopes

Somente scopes necessários deverão ser solicitados.

Para login social, deverão ser evitados scopes relacionados a:

* contatos;
* calendário;
* arquivos;
* localização;
* dados adicionais;

quando não forem necessários para autenticação.

Integrações futuras com serviços externos deverão possuir consentimento e finalidade separados.

---

## 40. Tokens de Provider

Access tokens e refresh tokens de Providers somente deverão ser persistidos quando necessários.

Quando persistidos, deverão:

* possuir finalidade;
* ser protegidos;
* ter acesso mínimo;
* não aparecer em logs;
* ter retenção;
* poder ser revogados;
* ser excluídos quando o vínculo for removido.

Login social não deverá armazenar tokens adicionais sem necessidade.

---

## 41. Account linking

Vincular múltiplos Providers ao mesmo `User` deverá exigir regras explícitas.

Não deverá ocorrer linking baseado apenas em e-mail sem avaliação de:

* verificação do e-mail;
* confiança do Provider;
* conflito;
* takeover;
* confirmação do usuário.

---

## 42. E-mail verificado

O estado de e-mail verificado deverá preservar sua origem.

Um e-mail informado pelo usuário não é equivalente a um e-mail verificado por um Provider confiável.

A aplicação deverá distinguir:

* e-mail informado;
* e-mail verificado;
* Provider verificador;
* data de verificação.

---

## 43. Alteração de e-mail

A alteração deverá:

* exigir autenticação;
* exigir confirmação;
* verificar novo endereço;
* preservar auditoria;
* prevenir conflito;
* invalidar fluxos antigos;
* considerar revogação de sessões.

---

## 44. Autenticação não é autorização

Better Auth poderá afirmar:

* quem é o usuário;
* qual sessão está ativa;
* quais Providers estão vinculados.

Better Auth não deverá decidir sozinho:

* se o usuário acessa uma Trip;
* se pertence à Account;
* se pode aceitar uma Itinerary Proposal;
* se pode ignorar um Planning Conflict;
* se pode convidar outra pessoa;
* se pode excluir dados;
* se uma Tool pode executar uma ação.

---

## 45. Autorização server-side

Toda ação protegida deverá autorizar no servidor.

Exemplo conceitual:

```typescript
await authorize({
  identity,
  accountId,
  action: "trip.read",
  resource: {
    type: "Trip",
    id: tripId,
  },
});
```

A interface poderá esconder ações não permitidas, mas isso não substitui a autorização.

---

## 46. Escopo por Account

Toda operação multi-tenant deverá preservar:

* userId;
* accountId;
* membership;
* role;
* resource ownership;
* action.

Buscar um recurso apenas por identificador deverá ser evitado quando o escopo da Account for relevante.

---

## 47. Account ativa

A aplicação poderá manter uma Account ativa na experiência.

A Account ativa:

* melhora a navegação;
* reduz repetição;
* não é autorização definitiva;
* deverá ser validada no servidor;
* não deverá ser aceita apenas de cookie manipulável ou parâmetro de URL.

---

## 48. Papéis

Papéis iniciais poderão incluir:

* Owner;
* Member;
* Viewer.

A lista final deverá ser definida no modelo de autorização.

Papéis não deverão ser utilizados como única representação de permissões quando a ação depender do recurso ou do contexto.

---

## 49. Convites

Convites para Account poderão ser implementados futuramente.

O fluxo deverá possuir:

* invitationId;
* accountId;
* e-mail ou destinatário;
* role proposta;
* expiração;
* uso único;
* revogação;
* invitedBy;
* status.

O convite não deverá criar acesso antes da aceitação válida.

---

## 50. Usuário sem Account

Uma identidade autenticada sem Account válida deverá ser direcionada a um fluxo controlado de provisionamento ou recuperação.

Ela não deverá receber acesso genérico à aplicação.

---

## 51. Usuário suspenso

A suspensão poderá ocorrer no nível de:

* User;
* Authentication User;
* Account Membership;
* Account.

A aplicação deverá distinguir os efeitos de cada estado.

Uma sessão tecnicamente válida não deverá ignorar suspensão de domínio.

---

## 52. Exclusão de usuário

A exclusão deverá considerar:

* autenticação;
* User;
* memberships;
* Accounts;
* Trips;
* sessões;
* Providers;
* tokens;
* auditoria;
* retenção;
* obrigações legais;
* backups;
* memória de IA.

O processo deverá seguir os documentos de privacidade.

---

## 53. Encerramento de Account

Encerrar uma Account não é necessariamente excluir a identidade do usuário.

O processo deverá separar:

* encerramento do espaço;
* remoção de membership;
* exclusão de dados;
* manutenção de acesso a outras Accounts;
* revogação de sessões quando necessária.

---

## 54. Persistência do Better Auth

As tabelas técnicas de autenticação deverão permanecer sob ownership do módulo Identity and Access.

Poderão incluir conceitos técnicos equivalentes a:

* user;
* session;
* account;
* verification.

Os nomes técnicos da biblioteca não deverão redefinir a linguagem do domínio.

---

## 55. Integração com Drizzle

A geração de schemas deverá ser revisada antes da inclusão no modelo físico.

O processo deverá ser:

```text
configuração do Better Auth
→ geração ou atualização de schema
→ revisão
→ integração ao schema Drizzle
→ geração de migration
→ revisão do SQL
→ testes
→ aplicação controlada
```

A CLI da biblioteca não deverá aplicar mudanças diretamente em produção fora do processo de migrations definido pelo RouteBook.

---

## 56. Migrations

Mudanças nas tabelas de autenticação deverão seguir o `RB-ADR-006`.

Elas deverão:

* ser versionadas;
* ser revisadas;
* ser testadas;
* considerar sessões existentes;
* considerar tokens;
* considerar account linking;
* possuir rollback ou compensação;
* preservar compatibilidade durante o deployment.

---

## 57. Constraints

A persistência deverá possuir constraints para evitar:

* sessões órfãs;
* Providers duplicados;
* vínculos inconsistentes;
* tokens reutilizados quando proibido;
* registros de verificação inválidos;
* identidades técnicas sem referência adequada.

As constraints finais dependerão do schema da versão aprovada.

---

## 58. Índices

Deverão existir índices adequados para:

* lookup de sessão;
* lookup de usuário;
* lookup de Provider account;
* expiração;
* verificação;
* limpeza;
* auditoria.

Índices deverão ser baseados nas queries reais da biblioteca e da aplicação.

---

## 59. Secrets

A solução deverá utilizar secrets para:

* assinatura;
* criptografia quando aplicável;
* Providers OAuth;
* callbacks;
* e-mail quando adotado.

Secrets deverão:

* permanecer fora do repositório;
* ser separados por ambiente;
* possuir rotação;
* ser mascarados;
* não ser enviados ao cliente;
* não aparecer em logs.

---

## 60. Configuração por ambiente

Cada ambiente deverá possuir:

* base URL;
* trusted origins;
* cookies;
* Provider credentials;
* callback URLs;
* secret;
* banco;
* política de segurança.

Produção não deverá compartilhar credenciais com preview, staging ou desenvolvimento.

---

## 61. Preview environments

OAuth em ambientes de preview deverá ser cuidadosamente controlado.

As opções poderão incluir:

* callback específico;
* proxy autorizado;
* Provider de teste;
* autenticação local controlada;
* desabilitação do login social em previews não confiáveis.

Secrets de produção não deverão ser expostos a pull requests.

---

## 62. Trusted origins

Origens confiáveis deverão ser configuradas explicitamente.

A configuração não deverá aceitar wildcards amplos sem análise.

Deverão ser considerados:

* produção;
* staging;
* preview;
* desenvolvimento local;
* callbacks;
* domínios alternativos.

---

## 63. Redirecionamentos

URLs de retorno deverão ser validadas.

O sistema não deverá permitir open redirect para destinos arbitrários.

Somente caminhos ou origens permitidas deverão ser aceitos.

---

## 64. Rate limiting

Endpoints de autenticação deverão possuir proteção contra abuso.

Casos relevantes:

* login;
* callback;
* envio de link;
* verificação;
* recuperação;
* linking;
* logout global.

O rate limiting deverá considerar:

* identidade;
* IP;
* sessão;
* Account;
* Provider;
* endpoint.

---

## 65. Account enumeration

Mensagens de erro não deverão revelar desnecessariamente:

* existência do usuário;
* Provider vinculado;
* status da Account;
* e-mail cadastrado;
* suspensão.

A experiência deverá permanecer útil sem ampliar risco.

---

## 66. Brute force

Caso credenciais próprias sejam ativadas, deverão existir:

* rate limiting;
* atraso progressivo;
* monitoramento;
* bloqueio controlado;
* notificação;
* recuperação segura.

Login social reduz, mas não elimina, riscos de account takeover.

---

## 67. Auditoria

Eventos relevantes deverão ser auditáveis.

Exemplos:

* login bem-sucedido;
* login falho relevante;
* logout;
* logout global;
* Provider vinculado;
* Provider removido;
* e-mail alterado;
* sessão revogada;
* Account provisionada;
* membership criada;
* membership suspensa;
* exclusão solicitada.

A auditoria não deverá registrar secrets ou tokens.

---

## 68. Logs

Logs poderão conter:

* eventType;
* result;
* authenticationUserId;
* userId;
* sessionId mascarado ou hash;
* Provider;
* requestId;
* correlationId;
* timestamp;
* errorCode.

Não deverão conter:

* cookie completo;
* access token;
* refresh token;
* authorization code;
* client secret;
* senha;
* magic link completo.

---

## 69. Métricas

Poderão ser observadas:

* logins bem-sucedidos;
* falhas de login;
* sessões ativas;
* sessões revogadas;
* callbacks falhos;
* linking falho;
* latência;
* erros por Provider;
* taxa de provisionamento;
* logouts globais;
* acessos não autorizados bloqueados.

---

## 70. Alertas

Alertas poderão cobrir:

* aumento de falhas;
* erro persistente de Provider;
* callbacks inválidos;
* sessões criadas em volume anormal;
* falha na validação;
* falha de banco;
* erro de configuração;
* suspeita de abuso;
* falha de revogação.

---

## 71. Privacidade

A solução deverá coletar somente os dados necessários.

Dados recebidos de Providers deverão ser avaliados quanto a:

* finalidade;
* minimização;
* retenção;
* atualização;
* exclusão;
* compartilhamento;
* segurança.

Campos adicionais do perfil não deverão ser persistidos automaticamente apenas porque o Provider os fornece.

---

## 72. Foto de perfil

A foto de perfil externa poderá:

* ser referenciada;
* ser armazenada;
* ser ignorada.

A decisão deverá considerar:

* licença;
* expiração;
* privacidade;
* disponibilidade;
* conteúdo remoto;
* atualização.

Ela não é necessária para autenticar o usuário.

---

## 73. Nome do usuário

O nome recebido do Provider poderá ser utilizado como valor inicial.

O usuário deverá poder corrigi-lo conforme a política do produto.

O valor externo não deverá ser tratado como identificador estável.

---

## 74. E-mail

O e-mail poderá ser utilizado para:

* contato;
* login;
* notificações;
* linking controlado.

Ele não deverá ser utilizado como identificador canônico imutável.

Identificadores internos deverão permanecer independentes.

---

## 75. Testes unitários

Deverão cobrir:

* resolução da identidade;
* criação de User;
* provisionamento da Account;
* membership;
* autorização;
* suspensão;
* revogação;
* mapping de erros.

---

## 76. Testes de integração

Deverão utilizar PostgreSQL real e validar:

* criação de usuário técnico;
* sessão;
* expiração;
* revogação;
* Provider account;
* linking;
* constraints;
* migrations;
* integração com Drizzle.

---

## 77. Testes end-to-end

Fluxos mínimos:

1. iniciar login;
2. concluir callback;
3. criar ou localizar User;
4. provisionar Account;
5. criar sessão;
6. acessar Trip própria;
7. bloquear Trip de outra Account;
8. realizar logout;
9. rejeitar sessão revogada.

---

## 78. Testes negativos

Deverão cobrir:

* cookie ausente;
* cookie inventado;
* sessão inexistente;
* sessão expirada;
* sessão revogada;
* usuário suspenso;
* membership removida;
* Account encerrada;
* callback inválido;
* state inválido;
* redirect não permitido;
* Provider não configurado;
* acesso cross-account.

---

## 79. Testes de segurança

Deverão incluir, conforme o estágio:

* CSRF;
* open redirect;
* session fixation;
* replay;
* cookie flags;
* account linking;
* enumeration;
* rate limiting;
* tokens em logs;
* secrets no bundle;
* acesso client-side indevido.

---

## 80. Desenvolvimento local

O ambiente local deverá permitir autenticação de forma reproduzível.

Opções:

* Provider OAuth de desenvolvimento;
* credenciais específicas;
* modo de teste controlado;
* usuário local seedado quando suportado e seguro.

Não deverá existir bypass de autenticação que possa ser ativado acidentalmente em produção.

---

## 81. Seeds

Dados de teste poderão incluir:

* Authentication User sintético;
* User;
* Account pessoal;
* membership;
* sessão de teste controlada.

Secrets e tokens reais não deverão fazer parte dos seeds.

---

## 82. Agentes de IA

Agentes poderão apoiar:

* configuração;
* schemas;
* migrations;
* testes;
* adapters;
* documentação;
* análise de falhas.

Agentes não poderão autonomamente:

* alterar secrets;
* adicionar Provider;
* ampliar scopes;
* remover validação;
* ignorar autorização;
* criar bypass;
* registrar tokens;
* vincular Accounts;
* alterar política de sessão;
* ativar senha;
* ativar SSO;
* aplicar migration em produção.

---

## 83. Autenticação de agentes

A autenticação de agentes ou workloads não deverá reutilizar automaticamente sessões humanas.

Tools executadas por agentes deverão operar com:

* identidade delegada;
* Account;
* User;
* capability;
* autorização;
* escopo;
* tempo;
* Provenance.

A estratégia detalhada deverá ser definida separadamente.

---

## 84. Delegação

Uma Tool executada em nome de um usuário não deverá possuir mais permissões que o usuário e a capability autorizada.

A identidade delegada deverá preservar:

* actor;
* subject;
* Account;
* session;
* capabilityId;
* agentId;
* correlationId.

---

## 85. Consequências positivas

A decisão proporciona:

* integração com a stack;
* sessões revogáveis;
* cookies seguros;
* OAuth e OIDC;
* controle sobre os dados;
* persistência em PostgreSQL;
* integração com Drizzle;
* desenvolvimento local;
* extensibilidade;
* menor lock-in;
* separação possível entre autenticação e domínio;
* base para múltiplas Accounts e memberships.

---

## 86. Consequências negativas

A decisão introduz:

* dependência do Better Auth;
* responsabilidade de operar autenticação;
* necessidade de acompanhar atualizações;
* necessidade de migrations;
* necessidade de configurar Providers;
* necessidade de gerir secrets;
* necessidade de implementar autorização separadamente;
* risco de confundir tabelas técnicas com domínio;
* risco de ativar plugins sem avaliação.

---

## 87. Riscos

### 87.1 Biblioteca recente

Mitigações:

* versões fixadas;
* atualizações controladas;
* testes;
* adapter interno;
* acompanhamento de segurança.

### 87.2 Sessão validada apenas por cookie

Mitigações:

* validação server-side obrigatória;
* testes negativos;
* abstração única;
* revisão.

### 87.3 Autenticação confundida com autorização

Mitigações:

* módulo próprio;
* authorization service;
* testes cross-account;
* documentação;
* revisão.

### 87.4 Account técnica confundida com Account do domínio

Mitigações:

* nomenclatura explícita;
* mappers;
* IdentityLink;
* ownership.

### 87.5 Account linking inseguro

Mitigações:

* e-mail verificado;
* confirmação;
* regras;
* auditoria;
* testes.

### 87.6 Tokens expostos

Mitigações:

* cookies HTTP-only;
* logs sanitizados;
* secrets;
* server-side;
* scanning.

### 87.7 Lock-in em Provider social

Mitigações:

* User interno;
* IdentityLink;
* múltiplos Providers;
* IDs internos;
* remoção e linking.

### 87.8 Sessões não revogadas

Mitigações:

* persistência;
* logout global;
* expiração;
* eventos de suspensão;
* testes.

### 87.9 Configuração insegura de preview

Mitigações:

* credenciais separadas;
* trusted origins;
* ausência de secrets em forks;
* revisão.

---

## 88. Controles

Deverão ser implementados:

* sessões persistidas;
* cookies HTTP-only;
* Secure em produção;
* SameSite;
* trusted origins;
* validação server-side;
* revogação;
* expiração;
* rate limiting;
* secret scanning;
* dependency scanning;
* logs sanitizados;
* auditoria;
* testes cross-account;
* scopes mínimos;
* Provider credentials por ambiente.

---

## 89. Estratégia de implementação

### Etapa 1 — Dependências

* adicionar Better Auth;
* adicionar adapter Drizzle;
* fixar versões;
* validar compatibilidade.

### Etapa 2 — Configuração

* criar instância server-side;
* configurar base URL;
* configurar secret;
* configurar cookies;
* configurar trusted origins.

### Etapa 3 — Persistência

* gerar schemas técnicos;
* revisar;
* integrar ao Drizzle;
* gerar migration;
* testar.

### Etapa 4 — Next.js

* criar Route Handler;
* criar cliente de autenticação quando necessário;
* criar páginas de login e erro;
* proteger rotas de interface.

### Etapa 5 — Domínio

* criar `User`;
* criar `Account`;
* criar `AccountMembership`;
* criar `IdentityLink`;
* implementar provisionamento idempotente.

### Etapa 6 — Provider

* configurar Google;
* validar callbacks;
* testar scopes;
* testar erro e cancelamento.

### Etapa 7 — Autorização

* implementar autorização server-side;
* proteger Trip Management;
* criar testes cross-account.

### Etapa 8 — Operação

* adicionar auditoria;
* métricas;
* alertas;
* revogação;
* runbooks.

---

## 90. Critérios de implementação concluída

A decisão estará implementada quando:

* Better Auth estiver configurado;
* versões estiverem fixadas;
* adapter Drizzle estiver ativo;
* migrations existirem;
* PostgreSQL armazenar sessões;
* Route Handler estiver configurado;
* login com Provider aprovado funcionar;
* User interno for provisionado;
* Account pessoal for criada;
* membership existir;
* sessão for validada no servidor;
* logout funcionar;
* revogação funcionar;
* acesso cross-account estiver bloqueado;
* testes estiverem no pipeline.

---

## 91. Verificação

A verificação deverá incluir:

* instalação limpa;
* migration;
* login;
* callback;
* sessão;
* cookie;
* User;
* Account;
* membership;
* acesso autorizado;
* acesso cross-account;
* logout;
* sessão expirada;
* sessão revogada;
* callback inválido;
* redirect inválido;
* Provider indisponível;
* build do Next.js;
* deployment em ambiente controlado.

---

## 92. Métricas de implementação

Poderão ser acompanhadas:

* taxa de login;
* falhas de callback;
* latência;
* sessões ativas;
* sessões revogadas;
* falhas de banco;
* falhas de provisionamento;
* usuários sem Account;
* tentativas cross-account;
* erros por Provider;
* vulnerabilidades da dependência.

---

## 93. Gatilhos de revisão

A decisão deverá ser revisada quando:

* Better Auth não atender requisito central;
* o projeto deixar de receber manutenção adequada;
* vulnerabilidades recorrentes se tornarem inaceitáveis;
* requisitos empresariais exigirem SSO avançado;
* múltiplas aplicações exigirem Identity Provider central;
* requisitos regulatórios exigirem serviço especializado;
* a operação própria se tornar desproporcional;
* um Provider gerenciado oferecer benefício comprovado;
* a aplicação precisar autenticar grande volume de workloads externos;
* a biblioteca limitar o modelo de sessão ou Account.

---

## 94. Estratégia de rollback

A substituição do Better Auth deverá ser registrada em novo ADR.

A migração deverá preservar:

* User;
* Account;
* memberships;
* IdentityLinks;
* Providers;
* sessões quando possível;
* revogação;
* auditoria;
* IDs internos;
* fluxo de autorização.

Os casos de uso e o domínio não deverão depender diretamente das APIs do Better Auth.

Sessões antigas poderão precisar ser invalidadas durante a migração.

---

## 95. Decisões derivadas

Deverão ser avaliadas decisões sobre:

* modelo de autorização;
* papéis e permissões;
* Row-Level Security;
* autenticação de agentes;
* autenticação de APIs;
* Provider de e-mail;
* magic link;
* passkeys;
* MFA;
* SSO;
* convites;
* Account switching;
* política detalhada de retenção de identidade.

---

## 96. Próxima decisão

O `RB-ADR-008` deverá definir o modelo inicial de autorização e isolamento multi-tenant.

A decisão deverá avaliar:

* RBAC;
* ABAC;
* autorização por recurso;
* Account Membership;
* roles;
* permissions;
* policies;
* enforcement server-side;
* escopo por Account;
* testes cross-account;
* integração com PostgreSQL;
* Row-Level Security como defesa adicional;
* autorização de Tools e agentes.

A decisão não deverá utilizar papéis como substituto universal para políticas de recurso.

---

## 97. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-007
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o novo ADR;
* permanecer disponível;
* preservar o contexto histórico.

---

## 98. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* Better Auth está justificado;
* Auth.js foi avaliado;
* Provider gerenciado foi avaliado;
* integração com Next.js está definida;
* integração com Drizzle está definida;
* integração com PostgreSQL está definida;
* Authentication User está separado de User;
* Provider Account está separado de Account;
* membership está definida;
* sessão está definida;
* cookie está governado;
* validação server-side está obrigatória;
* logout está definido;
* revogação está definida;
* OAuth está definido;
* OpenID Connect está definido;
* scopes estão governados;
* account linking está governado;
* autenticação e autorização estão separadas;
* privacidade está contemplada;
* logs estão governados;
* testes estão definidos;
* agentes estão contemplados;
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
* não existem contradições com RB-ADR-005;
* não existem contradições com RB-ADR-006.

---

## 99. Declaração final

O RouteBook adotará Better Auth como base técnica de autenticação e gestão de sessões.

A solução será integrada a:

* Next.js;
* PostgreSQL;
* Drizzle ORM;
* módulo Identity and Access.

Better Auth será responsável por capacidades técnicas como:

* autenticação;
* sessões;
* Providers;
* verificações;
* vínculos técnicos.

O RouteBook continuará responsável por:

* User canônico;
* Account;
* membership;
* roles;
* permissions;
* autorização;
* ownership;
* isolamento;
* auditoria;
* privacidade.

Uma sessão válida nunca será considerada autorização suficiente.

Toda operação protegida deverá validar:

* sessão;
* identidade;
* membership;
* Account;
* recurso;
* ação.

O primeiro Provider social poderá ser Google, mas o modelo interno não dependerá de um Provider específico.

A separação entre identidade técnica e identidade de domínio deverá permitir que o RouteBook evolua, substitua Providers e adicione novos métodos de autenticação sem redefinir seus conceitos centrais.
