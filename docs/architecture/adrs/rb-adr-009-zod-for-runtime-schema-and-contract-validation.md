---

id: RB-ADR-009

title: Adoção de Zod para Validação de Schemas e Contratos em Runtime
description: Registra a decisão de adotar Zod como biblioteca padrão de validação em runtime do RouteBook, utilizando schemas executáveis para entradas externas, APIs, configurações, Structured Outputs, Tools e contratos, com geração controlada de JSON Schema.

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
- zod
- validation
- runtime-validation
- schema
- contracts
- json-schema
- openapi
- structured-outputs
- tools
- typescript
- api
- ai-first
- security

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
- RB-OBS-001
- RB-QA-001
- RB-QA-002
- RB-AI-001
- RB-AI-002
- RB-AI-003
- RB-AI-004
- RB-AI-005
- RB-AI-006
- RB-GOV-001
- RB-GOV-002
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

prerequisites:

- RB-FND-004
- RB-DOM-001
- RB-DOM-002
- RB-DOM-003
- RB-DOM-004
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-API-001
- RB-SEC-001
- RB-SEC-002
- RB-SEC-003
- RB-QA-001
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

next_documents:

- RB-ADR-010

ai_context:
priority: critical
index: true
---

# RB-ADR-009 — Adoção de Zod para Validação de Schemas e Contratos em Runtime

## 1. Status da decisão

**Proposed**

Este ADR permanece em estado `Proposed` até receber aprovação formal conforme o processo definido no `RB-GOV-002`.

Após sua aprovação:

* Zod será a biblioteca padrão de validação em runtime;
* entradas externas deverão ser tratadas inicialmente como `unknown`;
* schemas Zod serão utilizados nas fronteiras da aplicação;
* tipos TypeScript poderão ser inferidos dos schemas;
* JSON Schema poderá ser gerado para contratos interoperáveis;
* Structured Outputs e Tool inputs deverão possuir schemas validados;
* schemas externos não deverão substituir automaticamente commands ou modelos de domínio;
* versões exatas deverão ser fixadas no repositório.

---

## 2. Contexto

O RouteBook adotou:

* TypeScript;
* Node.js;
* Next.js;
* PostgreSQL;
* Drizzle ORM;
* Better Auth;
* autorização híbrida por Account;
* arquitetura AI-First;
* contratos explícitos entre módulos e integrações.

O TypeScript fornece validação estática durante o desenvolvimento, mas seus tipos não validam valores recebidos durante a execução.

O RouteBook receberá dados de múltiplas fronteiras:

* formulários;
* Route Handlers;
* Server Functions;
* parâmetros de URL;
* query strings;
* headers;
* cookies;
* variáveis de ambiente;
* webhooks;
* Providers de mapas;
* APIs de Places;
* banco de dados;
* JSONB;
* arquivos;
* modelos de inteligência artificial;
* Structured Outputs;
* Tool Calls;
* eventos;
* jobs;
* filas;
* cache.

Esses dados não poderão ser considerados confiáveis apenas porque uma interface TypeScript foi declarada.

---

## 3. Problema

Qual estratégia deverá ser utilizada para validar dados em runtime, garantindo:

* segurança;
* consistência;
* inferência TypeScript;
* mensagens de erro estruturadas;
* contratos reutilizáveis;
* integração com APIs;
* integração com formulários;
* geração de JSON Schema;
* compatibilidade com Structured Outputs;
* compatibilidade com Tools;
* separação entre contrato externo e domínio;
* baixo custo de manutenção?

---

## 4. Direcionadores da decisão

Os principais direcionadores são:

1. validação em runtime;
2. integração com TypeScript;
3. inferência de tipos;
4. composição de schemas;
5. suporte a objetos discriminados;
6. mensagens de erro;
7. conversão para JSON Schema;
8. integração com OpenAPI;
9. suporte a Structured Outputs;
10. suporte a Tools;
11. integração com Next.js;
12. testabilidade;
13. ampla adoção;
14. documentação madura;
15. legibilidade para agentes de IA;
16. segurança;
17. portabilidade;
18. manutenção;
19. transformação controlada;
20. compatibilidade com monorepo.

---

## 5. Restrições

A solução deverá:

* funcionar com TypeScript estrito;
* funcionar em Node.js;
* funcionar em Next.js;
* validar valores `unknown`;
* suportar schemas aninhados;
* suportar unions;
* suportar refinements;
* suportar erros estruturados;
* permitir geração de JSON Schema;
* funcionar sem serviço externo;
* permitir testes unitários;
* não acoplar o domínio à biblioteca;
* não confiar somente em tipos estáticos;
* não realizar coerções silenciosas sem decisão explícita;
* não expor dados sensíveis em mensagens de erro;
* não transformar schemas de persistência em contratos externos.

---

## 6. Terminologia

### 6.1 Schema

Definição executável da estrutura e das restrições de um valor.

### 6.2 Input externo

Valor originado fora da fronteira confiável do componente.

### 6.3 Parsing

Processo de validar e, quando declarado, transformar um valor.

### 6.4 Validation Error

Representação estruturada das violações encontradas.

### 6.5 Contract Schema

Schema que define uma fronteira entre componentes ou sistemas.

### 6.6 Domain Invariant

Regra semântica pertencente ao domínio.

### 6.7 JSON Schema

Representação interoperável e independente de linguagem para descrever estruturas JSON.

### 6.8 Structured Output

Resposta estruturada de um modelo de IA que deverá obedecer a um schema.

---

## 7. Princípio central

Todo valor externo deverá permanecer `unknown` até ser validado.

```text
valor externo
→ unknown
→ schema
→ valor validado
→ input da aplicação
→ command ou query
→ domínio
```

Fluxo proibido:

```text
valor externo
→ cast TypeScript
→ domínio
```

---

## 8. Opções consideradas

### 8.1 Opção A — Validação manual

Implementar funções próprias para validar cada estrutura.

#### Benefícios

* controle completo;
* ausência de dependência;
* comportamento customizável;
* bundle mínimo em casos pequenos.

#### Limitações

* repetição;
* inconsistência;
* mensagens de erro distintas;
* maior risco de falhas;
* inferência de tipos manual;
* difícil geração de JSON Schema;
* maior custo de manutenção;
* maior risco em código produzido por agentes.

#### Avaliação

Foi rejeitada como estratégia principal.

Validações manuais continuarão possíveis para regras específicas não expressáveis adequadamente pelo schema.

---

### 8.2 Opção B — Interfaces TypeScript sem validação em runtime

Declarar interfaces e utilizar casts.

#### Benefícios

* ausência de código adicional;
* boa experiência no editor;
* implementação rápida.

#### Limitações

* nenhum controle em runtime;
* casts podem aceitar qualquer valor;
* falhas aparecem tarde;
* risco de segurança;
* inadequado para APIs e IA;
* inadequado para Providers;
* inadequado para JSONB.

#### Avaliação

Foi rejeitada.

---

### 8.3 Opção C — JSON Schema como fonte primária

Definir contratos diretamente como documentos JSON Schema e gerar tipos ou validators.

#### Benefícios

* padrão independente de linguagem;
* interoperabilidade;
* integração com OpenAPI;
* integração com sistemas de IA;
* possibilidade de geração de código.

#### Limitações

* experiência menos natural em TypeScript;
* geração de tipos adicional;
* transforms e regras locais menos convenientes;
* maior separação entre código e schema;
* tooling adicional;
* manutenção mais pesada para contratos internos.

#### Avaliação

JSON Schema será utilizado nas fronteiras interoperáveis, mas não como fonte principal de todos os schemas internos.

---

### 8.4 Opção D — Valibot

Utilizar Valibot como biblioteca modular de schemas.

#### Benefícios

* modularidade;
* bom tree-shaking;
* bundle reduzido;
* tipagem;
* validação;
* arquitetura moderna;
* ausência de dependências.

#### Limitações

* ecossistema menor;
* menor quantidade de integrações consolidadas;
* menor familiaridade da equipe;
* maior esforço para algumas integrações com OpenAPI e IA;
* benefício de bundle menos relevante para validações predominantemente server-side.

#### Avaliação

É uma alternativa tecnicamente forte, especialmente para bundles client-side mínimos.

Não foi selecionada por não oferecer benefício material suficiente sobre Zod no contexto geral do RouteBook.

---

### 8.5 Opção E — TypeBox com validator JSON Schema

Definir schemas compatíveis com JSON Schema utilizando TypeBox e um validator.

#### Benefícios

* proximidade com JSON Schema;
* boa inferência TypeScript;
* interoperabilidade;
* validação eficiente conforme ferramenta utilizada;
* integração natural com APIs.

#### Limitações

* composição operacional com múltiplas ferramentas;
* experiência menos direta para transformações;
* maior complexidade inicial;
* menor adequação à experiência desejada para formulários e regras de entrada.

#### Avaliação

É adequada para arquiteturas contract-first fortemente centradas em JSON Schema, mas não foi selecionada para o estágio atual.

---

### 8.6 Opção F — Zod

Utilizar Zod como biblioteca padrão, gerando JSON Schema quando necessário.

#### Benefícios

* integração natural com TypeScript;
* inferência de tipos;
* schemas executáveis;
* ampla adoção;
* composição;
* unions discriminadas;
* refinements;
* transforms;
* erros estruturados;
* ecossistema amplo;
* conversão nativa para JSON Schema;
* compatibilidade com OpenAPI;
* boa adequação a Structured Outputs;
* legibilidade para agentes de IA.

#### Limitações

* custo de bundle superior a alternativas modulares;
* refinements nem sempre são traduzíveis para JSON Schema;
* transforms podem dificultar interoperabilidade;
* risco de schemas excessivamente complexos;
* risco de utilizar Zod dentro do domínio;
* necessidade de separar input e output;
* necessidade de fixar versões.

#### Avaliação

Oferece o melhor equilíbrio para o RouteBook.

Foi selecionada.

---

## 9. Decisão

O RouteBook adotará:

* **Zod** como biblioteca padrão de validação em runtime;
* **Zod 4 ou versão estável compatível** como linha inicial;
* **schemas Zod** como fonte principal dos contratos executáveis em TypeScript;
* **JSON Schema** como representação interoperável para APIs, IA e integrações;
* **tipos inferidos** somente onde representarem corretamente o contrato;
* **mapeamento explícito** entre schemas externos, commands e domínio;
* **validação server-side obrigatória**;
* **validação client-side complementar**.

---

## 10. Escopo da decisão

Esta decisão define:

* biblioteca de validação;
* tratamento de entradas externas;
* organização de schemas;
* inferência de tipos;
* geração de JSON Schema;
* integração com APIs;
* integração com IA;
* integração com Tools;
* validação de configuração;
* tratamento de erros.

Esta decisão não define:

* framework de formulários;
* gerador de OpenAPI;
* biblioteca de API;
* protocolo final de eventos;
* catálogo completo de schemas;
* estratégia de versionamento de API;
* UI de mensagens de validação;
* ferramenta final de documentação de endpoints.

---

## 11. Localização arquitetural

Schemas deverão permanecer próximos às fronteiras às quais pertencem.

Exemplos:

```text
module/
├── domain/
├── application/
├── contracts/
│   ├── commands/
│   ├── queries/
│   ├── events/
│   └── schemas/
├── interfaces/
│   ├── http/
│   ├── web/
│   └── tools/
└── adapters/
```

Schemas não deverão ser concentrados em um único diretório global sem ownership.

---

## 12. Package de contratos

Um package poderá ser criado quando schemas precisarem ser compartilhados entre mais de uma aplicação.

Exemplo futuro:

```text
packages/
└── contracts/
    ├── api/
    ├── events/
    ├── ai/
    └── tools/
```

A criação deverá seguir os critérios do `RB-ADR-004`.

Schemas exclusivos de `apps/web` deverão permanecer na aplicação enquanto não houver segundo consumidor legítimo.

---

## 13. Categorias de schemas

O RouteBook deverá distinguir:

* schemas de entrada HTTP;
* schemas de formulários;
* schemas de parâmetros;
* schemas de configuração;
* schemas de eventos;
* schemas de Providers;
* schemas de persistência semiestruturada;
* schemas de Structured Outputs;
* schemas de Tool inputs;
* schemas de Tool outputs;
* schemas de jobs;
* schemas de arquivos.

---

## 14. Schemas externos e domínio

Um schema externo não deverá ser tratado como entidade de domínio.

Fluxo esperado:

```text
TripInputSchema
→ ValidatedTripInput
→ CreateTripCommand
→ Trip
```

O schema poderá validar forma e restrições de fronteira.

O domínio deverá continuar responsável por suas invariantes.

---

## 15. Inferência de tipos

Tipos poderão ser inferidos:

```typescript
const createTripInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(200),
});

type CreateTripInput = z.infer<typeof createTripInputSchema>;
```

A inferência deverá ser utilizada quando o tipo do contrato for exatamente o resultado do schema.

Não deverá ser utilizada para substituir tipos de domínio semanticamente diferentes.

---

## 16. Input e output de schemas

Quando um schema realizar transformação, os tipos de entrada e saída poderão diferir.

Exemplo conceitual:

```typescript
const tripDateSchema = z
  .string()
  .date()
  .transform((value) => TripDate.create(value));

type TripDateInput = z.input<typeof tripDateSchema>;
type TripDateOutput = z.output<typeof tripDateSchema>;
```

A diferença deverá ser explícita.

---

## 17. Coerção

Coerções deverão ser utilizadas com cautela.

Exemplo de risco:

```typescript
z.coerce.boolean()
```

Valores textuais inesperados poderão produzir resultados diferentes do pretendido.

Coerções deverão possuir:

* finalidade;
* conjunto de entradas aceitas;
* testes;
* comportamento documentado;
* mensagens de erro.

---

## 18. Transformações

Transforms poderão ser utilizados para normalizações simples e determinísticas.

Exemplos:

* trim;
* lowercase controlado;
* parse de data;
* construção de Value Object;
* normalização de código.

Não deverão ocultar:

* chamadas externas;
* queries;
* autorização;
* efeitos;
* decisões de domínio;
* comportamento não determinístico.

---

## 19. Refinements

Refinements poderão validar relações entre campos.

Exemplos:

* data final posterior à inicial;
* janela de horário válida;
* pelo menos um item selecionado;
* combinação permitida de campos.

Invariantes centrais deverão continuar no domínio mesmo quando também forem verificadas na fronteira.

---

## 20. JSON Schema

JSON Schema será utilizado quando houver necessidade de:

* interoperabilidade;
* OpenAPI;
* Structured Outputs;
* Tool contracts;
* integração com Providers;
* documentação;
* geração de clientes;
* validação fora do runtime TypeScript.

A conversão deverá ser testada.

---

## 21. Limites da conversão para JSON Schema

Nem todo comportamento de um schema Zod será representável de forma equivalente em JSON Schema.

Áreas de atenção:

* transforms;
* refinements arbitrários;
* efeitos;
* tipos JavaScript não JSON;
* funções;
* classes;
* `Date`;
* `bigint`;
* mapas e sets;
* schemas recursivos complexos.

Schemas destinados a interoperabilidade deverão utilizar um subconjunto compatível.

---

## 22. Perfil interoperável de schemas

Schemas que precisem gerar JSON Schema deverão evitar, salvo tratamento explícito:

* transforms irreversíveis;
* refinements sem equivalente;
* tipos não serializáveis;
* valores `undefined`;
* funções;
* instâncias de classe;
* estruturas específicas do runtime.

Eles deverão priorizar:

* strings;
* numbers;
* booleans;
* arrays;
* objects;
* null;
* enums;
* unions suportadas;
* constraints declarativas.

---

## 23. Identificação dos schemas

Schemas interoperáveis deverão possuir metadados como:

```text
schemaId
schemaVersion
title
description
owner
```

Quando convertidos para JSON Schema, deverão utilizar identificadores estáveis quando apropriado.

---

## 24. Versionamento

Schemas que atravessem fronteiras deverão possuir versionamento explícito.

Exemplos:

```text
ItineraryProposalSchemaV1
RecommendationSchemaV1
PlanningConflictDetectedSchemaV1
```

Alterações incompatíveis deverão criar nova versão.

Não deverá ser alterado silenciosamente o significado de um contrato publicado.

---

## 25. Compatibilidade

Mudanças deverão ser classificadas como:

* compatíveis;
* incompatíveis;
* aditivas;
* restritivas;
* semânticas.

Exemplos potencialmente incompatíveis:

* tornar campo opcional obrigatório;
* remover campo;
* alterar tipo;
* restringir enum;
* alterar unidade;
* mudar interpretação;
* alterar formato de data.

---

## 26. APIs HTTP

Entradas HTTP deverão validar:

* path parameters;
* query parameters;
* headers relevantes;
* body;
* arquivos;
* dados de autenticação quando aplicável.

O valor validado deverá ser convertido em command ou query.

---

## 27. Route Handlers

Fluxo esperado:

```typescript
const parsedInput = createTripRequestSchema.safeParse({
  params,
  query,
  body,
});

if (!parsedInput.success) {
  return validationErrorResponse(parsedInput.error);
}

const command = mapCreateTripRequestToCommand(parsedInput.data);
```

Route Handlers não deverão utilizar casts para evitar validação.

---

## 28. Server Functions

Argumentos recebidos por Server Functions deverão ser tratados como não confiáveis.

Isso inclui valores originados de:

* formulários;
* Client Components;
* hidden inputs;
* URL;
* JavaScript do navegador.

A execução no servidor não transforma o input em confiável.

---

## 29. Server Components

Parâmetros de rota e query strings utilizados por Server Components deverão ser validados antes de:

* acessar banco;
* montar query;
* escolher Account;
* resolver recurso;
* construir filtro.

---

## 30. Formulários

Schemas poderão ser reutilizados no cliente quando:

* não contiverem secrets;
* não importarem código server-only;
* o custo de bundle for aceitável;
* a validação client-side melhorar a experiência.

A validação no servidor continuará obrigatória.

---

## 31. Mensagens de erro

Erros de validação deverão ser transformados em formato estável.

Exemplo conceitual:

```typescript
interface ValidationIssue {
  path: string;
  code: string;
  messageKey: string;
  parameters?: Record<string, string | number>;
}
```

Mensagens internas da biblioteca não deverão ser expostas diretamente como contrato público permanente.

---

## 32. Localização

A interface poderá traduzir mensagens por `messageKey`.

Schemas não deverão conter textos de interface específicos espalhados por toda a aplicação quando isso impedir internacionalização.

---

## 33. Segurança dos erros

Erros não deverão revelar:

* schemas internos completos;
* nomes de tabelas;
* detalhes de Providers;
* secrets;
* valores sensíveis;
* regras de autorização;
* existência de recursos de outra Account.

---

## 34. Variáveis de ambiente

Toda variável deverá ser validada no startup ou build apropriado.

Exemplo conceitual:

```typescript
const serverEnvironmentSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
});
```

A aplicação deverá falhar rapidamente quando uma configuração obrigatória estiver inválida.

---

## 35. Separação entre ambiente público e privado

Schemas deverão separar:

* variáveis server-only;
* variáveis públicas de build;
* configuração compartilhável.

Secrets não deverão ser incluídos em objetos expostos ao cliente.

---

## 36. Providers externos

Respostas de Providers deverão ser tratadas como `unknown`.

O fato de um SDK declarar tipos não garante que:

* o Provider não alterou a resposta;
* o SDK está correto;
* o dado está completo;
* o cache não está corrompido;
* o mock representa produção.

Schemas deverão validar dados relevantes antes de entrarem no domínio.

---

## 37. Adapters de Providers

Cada adapter deverá possuir schemas próprios.

Exemplo:

```text
GooglePlacesRawResponseSchema
→ GooglePlacesValidatedResponse
→ PlaceProviderResult
→ Place
```

O formato externo não deverá vazar para o domínio.

---

## 38. Persistência e JSONB

Campos JSONB deverão possuir schemas Zod quando sua estrutura for utilizada pela aplicação.

Exemplos:

* payload de Provider;
* Provenance;
* metadados;
* configuração de capability;
* snapshots controlados;
* outputs de IA.

A declaração de tipo TypeScript no Drizzle não substitui a validação do conteúdo.

---

## 39. Eventos

Eventos deverão possuir schemas versionados quando:

* forem persistidos;
* atravessarem módulos;
* forem publicados;
* forem processados assincronamente;
* puderem ser reproduzidos.

O schema deverá validar envelope e payload.

---

## 40. Envelope de eventos

Estrutura conceitual:

```typescript
const eventEnvelopeSchema = z.object({
  eventId: z.uuid(),
  eventType: z.string().min(1),
  eventVersion: z.string().min(1),
  occurredAt: z.iso.datetime(),
  correlationId: z.string().min(1),
  causationId: z.string().optional(),
  accountId: z.string().min(1),
  payload: z.unknown(),
});
```

O payload deverá ser validado pelo schema correspondente ao evento.

---

## 41. Structured Outputs

Toda saída estruturada de IA deverá possuir schema explícito.

O fluxo deverá ser:

```text
modelo
→ output desconhecido
→ schema de Structured Output
→ output validado
→ policy e validação semântica
→ proposta ou resultado
```

O output validado ainda poderá ser semanticamente inadequado.

---

## 42. Itinerary Proposal

Uma `ItineraryProposal` gerada por IA deverá possuir schema versionado.

O schema poderá validar:

* proposta;
* itens;
* datas;
* referências;
* explicações;
* Provenance;
* confiança;
* warnings.

Ele não deverá autorizar ou aplicar a proposta.

---

## 43. Aceitação parcial

O input de `AcceptItineraryProposalPartially` deverá validar:

* ItineraryProposalId;
* itens selecionados;
* ausência de duplicação;
* versão da proposta;
* confirmação;
* campos obrigatórios.

O caso de uso continuará responsável por:

* autorização;
* estado;
* conflito;
* atomicidade;
* efeitos.

---

## 44. Planning Conflicts

Schemas deverão preservar a terminologia canônica:

* PlanningConflictId;
* PlanningConflictDetected;
* Resolved;
* Ignored;
* Invalidated;
* Superseded.

Não deverão introduzir `ConflictId` genérico como conceito canônico.

---

## 45. Recommendations

Schemas deverão distinguir:

* Recommendation;
* Decision;
* Itinerary Proposal.

Uma Recommendation validada não deverá ser persistida como Decision sem caso de uso explícito.

---

## 46. Tool inputs

Cada Tool deverá possuir schema de entrada.

O schema deverá:

* rejeitar campos não autorizados quando apropriado;
* limitar tamanho;
* limitar strings;
* validar identificadores;
* validar enums;
* evitar payload arbitrário;
* ser compatível com JSON Schema quando enviado ao modelo.

---

## 47. Tool outputs

Outputs deverão possuir schema quando forem consumidos por:

* agentes;
* modelos;
* outros módulos;
* workflows;
* avaliações.

Erros de Tool deverão possuir contrato separado do output de sucesso.

---

## 48. Tools mutáveis

Validação de schema não substitui:

* autorização;
* idempotência;
* confirmação;
* transação;
* auditoria;
* limites;
* policy.

Um input válido poderá continuar não autorizado.

---

## 49. Schemas para agentes

Agentes deverão receber somente schemas necessários para a tarefa.

Não deverão receber automaticamente:

* todos os contratos;
* campos internos;
* atributos sensíveis;
* ações administrativas;
* Tool schemas não autorizados.

---

## 50. Strict objects

Contratos externos deverão preferir rejeição de propriedades inesperadas quando isso reduzir risco.

A estratégia deverá ser explícita por schema.

Campos extras não deverão ser descartados silenciosamente quando puderem indicar:

* versão incorreta;
* tentativa de injeção;
* erro de cliente;
* contrato divergente.

---

## 51. Unknown fields

A política poderá ser:

* rejeitar;
* remover;
* preservar.

A escolha deverá depender da fronteira.

Como baseline:

* commands e Tools: rejeitar;
* payload bruto de Provider: preservar apenas em área controlada;
* configurações: rejeitar;
* objetos de domínio: não aplicável diretamente.

---

## 52. Limites de tamanho

Schemas deverão limitar, conforme aplicável:

* comprimento de strings;
* quantidade de itens;
* profundidade;
* tamanho de arrays;
* número de dias;
* número de Activities;
* número de Places;
* tamanho de contexto;
* tamanho de output de IA.

Validação estrutural sem limites poderá permitir abuso de recursos.

---

## 53. Datas e horários

Schemas deverão distinguir:

* data civil;
* datetime ISO;
* timezone;
* duração;
* janela de tempo.

Uma string genérica não deverá representar todos esses conceitos.

---

## 54. Coordenadas

Schemas geográficos deverão validar:

* latitude entre -90 e 90;
* longitude entre -180 e 180;
* ordem das coordenadas;
* precisão;
* ausência permitida;
* origem quando aplicável.

---

## 55. Distâncias e durações

Schemas deverão declarar unidades.

Exemplos:

```typescript
const distanceSchema = z.object({
  value: z.number().nonnegative(),
  unit: z.enum(["meter", "kilometer"]),
});
```

Um número isolado não deverá representar distância sem semântica.

---

## 56. Dinheiro

Schemas deverão preservar:

* valor;
* moeda;
* precisão;
* natureza estimada ou confirmada.

Valores monetários não deverão utilizar coerção genérica para ponto flutuante sem controle.

---

## 57. Identificadores

Schemas deverão utilizar nomes canônicos.

Exemplos:

```typescript
const tripIdSchema = z.string().min(1).brand<"TripId">();
const activityIdSchema = z.string().min(1).brand<"ActivityId">();
const recommendationIdSchema = z.string().min(1).brand<"RecommendationId">();
const planningConflictIdSchema = z.string().min(1).brand<"PlanningConflictId">();
const itineraryProposalIdSchema = z.string().min(1).brand<"ItineraryProposalId">();
```

A implementação poderá utilizar branded types ou Value Objects.

---

## 58. Branded types

Brands poderão ajudar a impedir troca acidental de identificadores.

Eles não deverão ser considerados validação semântica completa.

Um `TripId` estruturalmente válido ainda poderá:

* não existir;
* pertencer a outra Account;
* estar arquivado;
* não estar autorizado.

---

## 59. Schemas recursivos

Schemas recursivos deverão ser utilizados somente quando a estrutura realmente exigir.

Deverão possuir:

* limites de profundidade;
* testes;
* geração de JSON Schema validada;
* proteção contra payloads excessivos.

---

## 60. Schemas discriminados

Estados mutuamente exclusivos deverão preferir unions discriminadas.

Exemplo:

```typescript
const planningConflictResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("resolved"),
    planningConflictId: planningConflictIdSchema,
  }),
  z.object({
    status: z.literal("ignored"),
    planningConflictId: planningConflictIdSchema,
    reason: z.string().min(1),
  }),
  z.object({
    status: z.literal("invalidated"),
    planningConflictId: planningConflictIdSchema,
  }),
]);
```

---

## 61. Schemas assíncronos

Validações que dependam de:

* banco;
* Provider;
* autorização;
* estado;
* disponibilidade;

não deverão ser misturadas indiscriminadamente ao schema estrutural.

O schema deverá validar a forma.

O caso de uso deverá validar contexto e estado.

---

## 62. Parsing e safe parsing

`parse` poderá ser utilizado quando uma falha de validação representar erro de programação ou configuração.

`safeParse` deverá ser preferido em fronteiras onde a falha faz parte do fluxo esperado.

Exemplos:

* request do usuário: `safeParse`;
* configuração obrigatória no startup: `parse`;
* output de Provider: `safeParse`;
* fixture interna estática: conforme contexto.

---

## 63. Exceções

Erros de Zod não deverão escapar indiscriminadamente até o cliente.

Adapters deverão convertê-los para:

* erro de validação da aplicação;
* resposta HTTP;
* feedback de formulário;
* falha de Provider;
* falha de Structured Output;
* falha de Tool.

---

## 64. Schemas compartilhados com frontend

Schemas poderão ser compartilhados quando:

* forem seguros para o cliente;
* não dependerem de código server-only;
* não incluírem secrets;
* não revelarem regras internas;
* o bundle for aceitável.

Um schema server-side poderá possuir versão client-side reduzida quando necessário.

---

## 65. Bundle client-side

O impacto deverá ser medido.

A aplicação deverá evitar importar grandes catálogos de schemas em Client Components.

Estratégias:

* imports específicos;
* fronteiras menores;
* validação server-side;
* schemas client-side somente onde necessários;
* lazy loading quando aplicável.

---

## 66. OpenAPI

Schemas de API poderão gerar ou alimentar especificações OpenAPI.

O processo deverá preservar:

* operação;
* parâmetros;
* request;
* response;
* erros;
* autenticação;
* exemplos;
* versionamento.

A geração automática deverá ser validada para evitar documentação divergente.

---

## 67. Fonte canônica de API

Para endpoints implementados a partir de schemas Zod, o schema poderá ser a fonte do formato dos dados.

Ele não será a fonte única de:

* semântica;
* autorização;
* efeitos;
* idempotência;
* rate limits;
* erros de domínio.

Esses aspectos deverão permanecer documentados no contrato de API.

---

## 68. Webhooks

Payloads de webhooks deverão ser validados somente após os controles de autenticidade exigidos pelo Provider.

Fluxo:

```text
request
→ preservação do body quando necessária
→ verificação de assinatura
→ parsing
→ schema
→ idempotência
→ processamento
```

Validar o formato não comprova a origem do webhook.

---

## 69. Arquivos

Schemas poderão validar metadados de arquivos:

* nome;
* MIME type;
* tamanho;
* referência;
* finalidade.

O conteúdo deverá passar por controles adicionais, como:

* inspeção;
* malware scanning;
* processamento seguro;
* autorização.

---

## 70. Performance

A validação deverá ocorrer na fronteira adequada.

Não deverá ser repetida em todas as camadas sem necessidade.

Dados poderão ser considerados confiáveis dentro de uma operação após:

* validação;
* transformação;
* preservação do tipo;
* ausência de nova fronteira não confiável.

---

## 71. Cache de parsing

Schemas são reutilizáveis e não deverão ser recriados dentro de loops ou requests sem necessidade.

Resultados validados não deverão ser cacheados quando isso puder misturar:

* Accounts;
* usuários;
* versões;
* inputs;
* autorizações.

---

## 72. Segurança

A validação deverá apoiar:

* rejeição de payloads inválidos;
* limites;
* normalização;
* prevenção de campos inesperados;
* proteção de queries;
* segurança de Tools;
* segurança de outputs de IA.

Ela não substitui:

* autenticação;
* autorização;
* sanitização contextual;
* encoding;
* rate limiting;
* CSP;
* SQL parametrizado;
* antivírus;
* políticas de negócio.

---

## 73. Dados sensíveis

Schemas que contenham dados sensíveis deverão evitar:

* inclusão de valores em mensagens;
* logging automático;
* exemplos reais;
* exportação ao cliente;
* geração de documentação pública;
* envio a modelos de IA sem finalidade.

---

## 74. Redaction

Erros e logs deverão mascarar campos como:

* password;
* token;
* secret;
* cookie;
* authorization;
* accessToken;
* refreshToken;
* preciseLocation;
* personalNotes.

---

## 75. Testes de schemas

Todo schema relevante deverá possuir testes para:

* valor válido;
* campo ausente;
* tipo incorreto;
* limite mínimo;
* limite máximo;
* valor extra;
* enum inválido;
* combinação inválida;
* transformação;
* serialização;
* geração de JSON Schema quando aplicável.

---

## 76. Testes de compatibilidade

Schemas versionados deverão possuir testes de:

* payloads antigos permitidos;
* payloads novos;
* mudanças aditivas;
* incompatibilidades intencionais;
* JSON Schema gerado;
* consumidores relevantes.

---

## 77. Testes de Structured Outputs

Deverão incluir:

* output válido;
* campo ausente;
* enum inventado;
* texto fora do JSON;
* ID inválido;
* referência inexistente;
* array excessivo;
* versão incompatível;
* semântica inválida após parsing.

---

## 78. Testes de Tools

Deverão incluir:

* input válido;
* campo extra;
* ação não permitida;
* ID de outra Account;
* tamanho excessivo;
* output inválido;
* timeout;
* erro estruturado;
* tentativa de injeção.

---

## 79. Property-based testing

Schemas críticos poderão utilizar geração de dados para verificar:

* ausência de crashes;
* rejeição de valores fora do domínio;
* limites;
* round-trip;
* invariantes estruturais;
* estabilidade do parser.

---

## 80. Desenvolvimento assistido por IA

Schemas explícitos fornecem aos agentes:

* formato;
* tipos;
* restrições;
* enums;
* exemplos;
* mensagens de erro;
* casos de teste.

Agentes deverão utilizar os schemas canônicos existentes antes de criar novos contratos.

---

## 81. Limites para agentes

Agentes não poderão autonomamente:

* remover validação;
* substituir `unknown` por cast;
* adicionar `.passthrough()` sem justificativa;
* ampliar limites;
* tornar campo obrigatório opcional;
* remover enum;
* adicionar transform com efeito;
* expor schema interno;
* alterar versão de contrato;
* modificar Tool schema sem revisão;
* converter domínio em schema externo;
* introduzir `any`.

---

## 82. Revisão de schemas gerados por IA

Deverá avaliar:

* ownership;
* terminologia canônica;
* compatibilidade;
* limites;
* campos extras;
* segurança;
* serialização;
* JSON Schema;
* testes;
* impacto em consumidores.

---

## 83. Consequências positivas

A decisão proporciona:

* validação em runtime;
* inferência TypeScript;
* schemas executáveis;
* contratos mais explícitos;
* integração com JSON Schema;
* integração com OpenAPI;
* integração com IA;
* melhor segurança;
* erros estruturados;
* melhor contexto para agentes;
* redução de casts;
* maior testabilidade.

---

## 84. Consequências negativas

A decisão introduz:

* dependência do Zod;
* necessidade de governar schemas;
* risco de schemas muito complexos;
* custo de bundle no cliente;
* diferenças entre Zod e JSON Schema;
* necessidade de mapear para domínio;
* risco de transforms ocultos;
* necessidade de versionamento;
* possibilidade de duplicação entre fronteiras.

---

## 85. Riscos

### 85.1 Schema tratado como domínio

Mitigações:

* mappers;
* commands;
* Value Objects;
* imports controlados;
* testes arquiteturais.

### 85.2 Cast substituindo validação

Mitigações:

* lint;
* revisão;
* `unknown`;
* testes;
* padrões de código.

### 85.3 Conversão incompleta para JSON Schema

Mitigações:

* perfil interoperável;
* testes;
* revisão;
* schemas separados quando necessário.

### 85.4 Transform não representável

Mitigações:

* separar schema estrutural e transformação;
* evitar transforms em contratos interoperáveis;
* documentação.

### 85.5 Bundle excessivo

Mitigações:

* server-side;
* imports específicos;
* medição;
* schemas reduzidos no cliente.

### 85.6 Mensagens sensíveis

Mitigações:

* mapeamento de erros;
* redaction;
* message keys;
* logs controlados.

### 85.7 Schemas divergentes

Mitigações:

* fonte canônica;
* geração;
* testes de contrato;
* package compartilhado quando necessário.

### 85.8 Validação excessiva

Mitigações:

* validar nas fronteiras;
* preservar tipos;
* evitar parsing redundante;
* medir desempenho.

---

## 86. Controles

Deverão ser implementados:

* TypeScript strict;
* input `unknown`;
* schemas Zod;
* mapeamento de erros;
* limites de payload;
* strict objects quando apropriado;
* schemas versionados;
* JSON Schema testado;
* testes unitários;
* testes de contrato;
* validação server-side;
* redaction;
* dependency scanning;
* versões fixadas;
* lint contra casts inseguros.

---

## 87. Estratégia de implementação

### Etapa 1 — Dependência e configuração

* adicionar Zod;
* fixar versão;
* criar convenções;
* configurar helpers de erro.

### Etapa 2 — Ambiente

* criar schema server-side;
* criar schema client-safe;
* validar startup;
* testar secrets ausentes.

### Etapa 3 — Trip Management

* criar schema de `CreateTrip`;
* criar schema de `UpdateTrip`;
* mapear para commands;
* testar.

### Etapa 4 — APIs e formulários

* validar Route Handlers;
* validar Server Functions;
* integrar mensagens;
* testar campos extras.

### Etapa 5 — Providers

* criar schemas de respostas;
* mapear para contratos internos;
* adicionar observabilidade.

### Etapa 6 — IA

* criar schemas de Structured Outputs;
* converter para JSON Schema;
* criar schemas de Tools;
* testar outputs inválidos.

### Etapa 7 — Eventos

* criar envelope;
* versionar payloads;
* validar consumidores.

### Etapa 8 — OpenAPI

* avaliar ferramenta de geração;
* validar especificação;
* publicar somente contratos autorizados.

---

## 88. Critérios de implementação concluída

A decisão estará implementada quando:

* Zod estiver instalado e fixado;
* variáveis de ambiente forem validadas;
* `CreateTrip` possuir schema;
* Route Handler validar input;
* Server Function validar input;
* erros forem mapeados;
* Provider externo possuir schema;
* primeiro Structured Output possuir schema;
* primeira Tool possuir schemas de input e output;
* JSON Schema puder ser gerado;
* testes executarem no pipeline;
* domínio não depender de Zod diretamente.

---

## 89. Verificação

A verificação deverá incluir:

* input válido;
* input inválido;
* campo ausente;
* campo extra;
* tipo incorreto;
* payload excessivo;
* transformação;
* refinement;
* erro sanitizado;
* variável ausente;
* Provider divergente;
* Structured Output inválido;
* Tool input inválido;
* geração de JSON Schema;
* build do Next.js;
* bundle client-side.

---

## 90. Métricas

Poderão ser acompanhadas:

* falhas de validação por fronteira;
* schemas sem owner;
* contratos sem versão;
* casts inseguros;
* outputs de IA rejeitados;
* Tool Calls rejeitadas;
* payloads excessivos;
* divergências de Providers;
* erros de configuração;
* tamanho de bundle;
* regressões de schema;
* falhas de compatibilidade.

---

## 91. Gatilhos de revisão

A decisão deverá ser revisada quando:

* Zod limitar requisito central;
* a conversão para JSON Schema for insuficiente;
* o bundle client-side se tornar materialmente problemático;
* o desempenho da validação for inadequado;
* APIs exigirem abordagem contract-first externa;
* múltiplas linguagens consumirem contratos em escala;
* outra biblioteca oferecer benefício comprovado;
* a manutenção dos schemas se tornar desproporcional;
* mudanças incompatíveis da biblioteca forem recorrentes.

---

## 92. Estratégia de rollback

A substituição do Zod deverá ser registrada em novo ADR.

A migração deverá preservar:

* contratos;
* tipos;
* JSON Schemas;
* OpenAPI;
* Structured Outputs;
* Tool schemas;
* erros;
* testes;
* versionamento.

A aplicação não deverá depender de objetos internos do Zod fora das camadas de validação.

---

## 93. Alternativas futuras permitidas

Esta decisão não impede:

* JSON Schema escrito diretamente para contrato externo;
* validator dedicado para alta performance;
* Valibot em componente client-side especializado;
* TypeBox em serviço contract-first;
* validações manuais de domínio;
* schemas específicos de Provider.

A coexistência deverá possuir escopo e justificativa claros.

---

## 94. Decisões derivadas

Deverão ser avaliadas decisões sobre:

* geração de OpenAPI;
* biblioteca de formulários;
* estratégia de erros HTTP;
* versionamento de APIs;
* catálogo de eventos;
* Structured Outputs;
* Tool Registry;
* validação de configuração;
* geração de clientes;
* contract testing.

---

## 95. Próxima decisão

O `RB-ADR-010` deverá definir a estratégia de testes automatizados e selecionar as ferramentas principais para:

* testes unitários;
* testes de integração;
* testes de componentes;
* testes end-to-end;
* testes de contrato;
* testes de arquitetura;
* testes de banco;
* testes de acessibilidade;
* testes de capacidades de IA.

A decisão deverá avaliar separadamente:

* Vitest;
* Testing Library;
* Playwright;
* Testcontainers;
* ferramentas de mocking;
* cobertura;
* execução no Turborepo;
* isolamento de PostgreSQL e PostGIS.

---

## 96. Supersessão

Um ADR futuro que substituir esta decisão deverá declarar:

```text
supersedes:
  - RB-ADR-009
```

O presente documento deverá então:

* receber estado `Superseded`;
* apontar para o ADR substituto;
* permanecer disponível;
* preservar o contexto histórico.

---

## 97. Checklist da decisão

Antes da aprovação:

* contexto está completo;
* problema está definido;
* direcionadores estão claros;
* restrições estão claras;
* alternativas foram avaliadas;
* Zod está justificado;
* Valibot foi avaliado;
* JSON Schema foi avaliado;
* TypeBox foi avaliado;
* input externo é tratado como unknown;
* inferência de tipos está governada;
* input e output estão diferenciados;
* transforms estão governados;
* refinements estão governados;
* JSON Schema está definido;
* limitações da conversão estão registradas;
* versionamento está definido;
* APIs estão contempladas;
* formulários estão contemplados;
* Providers estão contemplados;
* JSONB está contemplado;
* eventos estão contemplados;
* Structured Outputs estão contemplados;
* Tools estão contempladas;
* configuração está contemplada;
* erros estão governados;
* segurança está contemplada;
* testes estão definidos;
* agentes estão contemplados;
* riscos estão registrados;
* controles estão definidos;
* implementação está definida;
* verificação está definida;
* gatilhos de revisão estão definidos;
* supersessão está definida;
* domínio não foi acoplado ao Zod;
* validação não foi confundida com autorização;
* não existem contradições com RB-ADR-002;
* não existem contradições com RB-ADR-003;
* não existem contradições com RB-ADR-006;
* não existem contradições com RB-ADR-008;
* não existem contradições com RB-AI-002;
* não existem contradições com RB-AI-004;
* não existem contradições com RB-AI-005.

---

## 98. Declaração final

O RouteBook adotará Zod como biblioteca padrão de validação em runtime.

Todo dado recebido de uma fronteira externa deverá permanecer `unknown` até ser validado.

Zod será utilizado para:

* requests;
* formulários;
* parâmetros;
* configurações;
* Providers;
* eventos;
* JSONB;
* Structured Outputs;
* Tool inputs;
* Tool outputs.

JSON Schema será utilizado como formato interoperável para:

* OpenAPI;
* inteligência artificial;
* Tools;
* integrações;
* consumidores externos.

Schemas destinados à interoperabilidade deverão respeitar as limitações de conversão e evitar comportamentos exclusivos do runtime que não possam ser representados externamente.

A validação estrutural não substituirá:

* invariantes de domínio;
* autenticação;
* autorização;
* políticas;
* transações;
* controles de segurança.

O RouteBook deverá preservar uma separação explícita entre:

* dado externo;
* dado validado;
* command ou query;
* domínio;
* persistência.

Essa separação permitirá que contratos sejam verificáveis, versionados, reutilizáveis e seguros sem transformar a biblioteca de schemas no modelo central do produto.
