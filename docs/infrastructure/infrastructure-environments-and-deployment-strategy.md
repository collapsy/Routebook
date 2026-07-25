---

id: RB-INFRA-001

title: Infraestrutura, Ambientes e Estratégia de Deployment
description: Define a arquitetura operacional de infraestrutura do RouteBook, os ambientes, recursos, redes, identidades, configurações, deployment, escalabilidade, recuperação, segurança, observabilidade e governança da infraestrutura como código.

document_type: infrastructure
owner: Platform

status: Draft
version: "0.1.0"

created: "2026-07-24"
last_updated: null

authors:

- RouteBook Team

tags:

- infrastructure
- platform
- environments
- deployment
- infrastructure-as-code
- cloud
- networking
- security
- observability
- reliability
- scalability
- disaster-recovery
- cost-management
- ai-infrastructure
- documentation-first
- diagrams
- mermaid

related_documents:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
- RB-PRD-002
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
- RB-AI-003
- RB-AI-004
- RB-AI-005
- RB-AI-006
- RB-COMP-001
- RB-COMP-002
- RB-COMP-003
- RB-GOV-001
- RB-GOV-002
- RB-RISK-001
- RB-DEL-001
- RB-DEV-001
- RB-CICD-001

prerequisites:

- RB-CORE-0004
- RB-PRD-008
- RB-ARC-001
- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-ARC-005
- RB-DATA-002
- RB-SEC-001
- RB-SEC-002
- RB-SEC-003
- RB-OBS-001
- RB-OPS-001
- RB-OPS-002
- RB-SRE-001
- RB-GOV-001
- RB-GOV-002
- RB-RISK-001
- RB-DEL-001
- RB-DEV-001
- RB-CICD-001

next_documents:

- RB-ADR-001

ai_context:
priority: critical
index: true
---

# RouteBook — Infraestrutura, Ambientes e Estratégia de Deployment

## Parte I — Fundamentos

### 1. Propósito

Este documento define a estratégia oficial de infraestrutura do RouteBook.

Seu objetivo é estabelecer como a plataforma deverá ser provisionada, configurada, protegida, implantada, observada, recuperada e evoluída.

O documento define:

* princípios de infraestrutura;
* arquitetura operacional;
* ambientes;
* infraestrutura como código;
* identidade de workloads;
* redes;
* compute;
* persistência;
* storage;
* cache;
* mensageria;
* configuração;
* secrets;
* deployment;
* escalabilidade;
* alta disponibilidade;
* backup;
* restore;
* continuidade;
* observabilidade;
* segurança;
* custos;
* sustentabilidade;
* governança;
* infraestrutura de inteligência artificial.

---

### 2. Relação com a arquitetura do RouteBook

Os documentos de arquitetura definem os limites lógicos e as responsabilidades do sistema.

Este documento define como esses limites poderão ser materializados operacionalmente.

A infraestrutura não deverá redefinir:

* módulos;
* bounded contexts;
* ownership de dados;
* conceitos de domínio;
* contratos;
* linguagem ubíqua.

A escolha de serviços gerenciados, containers, runtimes, bancos ou Providers deverá respeitar os modelos canônicos já definidos.

---

### 3. Relação com o RB-CICD-001

O `RB-CICD-001` define:

* pipelines;
* artefatos;
* promoção;
* releases;
* quality gates;
* deployments;
* rollback;
* segurança da cadeia de software.

O `RB-INFRA-001` define os ambientes e recursos nos quais esses artefatos serão executados.

A relação esperada é:

```text
Código
→ pipeline
→ artefato imutável
→ ambiente
→ deployment
→ workload
→ observabilidade
→ verificação
```

---

### 4. Relação com confiabilidade e operações

O `RB-SRE-001` define objetivos de confiabilidade e continuidade.

O `RB-OPS-001` e o `RB-OPS-002` definem procedimentos operacionais e runbooks.

O `RB-INFRA-001` deverá fornecer os mecanismos técnicos necessários para:

* monitoramento;
* recuperação;
* escalabilidade;
* rollback;
* backup;
* restore;
* contenção;
* operação degradada;
* resposta a incidentes.

---

### 5. Problema que este documento resolve

Sem uma estratégia canônica de infraestrutura, o RouteBook poderá apresentar:

* ambientes divergentes;
* recursos criados manualmente;
* configurações não rastreáveis;
* acessos excessivos;
* secrets distribuídos incorretamente;
* dependência implícita de Provider;
* deployments irreproduzíveis;
* falta de isolamento;
* custos sem controle;
* ausência de backup;
* restore não testado;
* falta de observabilidade;
* dificuldade de rollback;
* crescimento desordenado;
* infraestrutura incompatível com o estágio do produto.

Este documento estabelece uma base operacional progressiva e governada.

---

### 6. Escopo

Este documento cobre:

* ambientes;
* contas e projetos de infraestrutura;
* infraestrutura como código;
* redes;
* identidade;
* compute;
* persistência;
* storage;
* cache;
* filas;
* configuração;
* secrets;
* edge;
* DNS;
* certificados;
* deployment;
* escalabilidade;
* disponibilidade;
* recuperação;
* observabilidade;
* segurança;
* custos;
* infraestrutura de IA;
* governança.

---

### 7. Fora do escopo

Este documento não escolhe definitivamente:

* Provider de cloud;
* região;
* framework;
* banco de dados;
* orquestrador;
* serviço de containers;
* plataforma serverless;
* ferramenta de infraestrutura como código;
* ferramenta de observabilidade;
* CDN;
* DNS;
* registry.

Essas escolhas deverão ser registradas por ADRs.

---

### 8. Princípio central

A infraestrutura do RouteBook deverá ser simples o suficiente para o estágio atual e estruturada o suficiente para evoluir sem comprometer segurança, confiabilidade ou reversibilidade.

```mermaid
flowchart LR
    Requirements["Requisitos"]
    Architecture["Arquitetura"]
    IaC["Infrastructure as Code"]
    Environment["Ambiente"]
    Deployment["Deployment"]
    Workload["Workload"]
    Signals["Sinais operacionais"]
    Improvement["Melhoria"]

    Requirements --> Architecture
    Architecture --> IaC
    IaC --> Environment
    Environment --> Deployment
    Deployment --> Workload
    Workload --> Signals
    Signals --> Improvement
    Improvement --> Architecture
```

---

## Parte II — Princípios de infraestrutura

### 9. Infraestrutura como código

Recursos relevantes deverão ser definidos como código sempre que tecnicamente viável.

Isso inclui:

* compute;
* redes;
* bancos;
* storage;
* permissões;
* filas;
* alertas;
* dashboards;
* políticas;
* configurações não sensíveis.

---

### 10. Ambientes reproduzíveis

Um ambiente deverá poder ser recriado a partir de:

* código;
* configuração;
* artefatos;
* secrets autorizados;
* dados ou backups previstos.

---

### 11. Simplicidade progressiva

O MVP não deverá iniciar com complexidade destinada a uma escala ainda não demonstrada.

Deverão ser evitados sem necessidade comprovada:

* múltiplos clusters;
* múltiplas regiões ativas;
* service mesh;
* dezenas de serviços independentes;
* filas para todos os fluxos;
* infraestrutura dedicada por módulo;
* sistemas de orquestração complexos.

---

### 12. Separação entre lógica e infraestrutura

Regras de domínio não deverão depender de detalhes do Provider.

Integrações deverão utilizar ports e adapters conforme a arquitetura definida.

---

### 13. Menor privilégio

Pessoas, pipelines e workloads deverão receber apenas as permissões necessárias.

---

### 14. Configuração externa

A configuração específica de ambiente deverá permanecer fora do artefato executável.

---

### 15. Artefatos imutáveis

O ambiente deverá executar artefatos identificáveis e imutáveis.

---

### 16. Observabilidade desde o início

Todo workload relevante deverá produzir sinais suficientes para operação.

---

### 17. Falhas esperadas

A arquitetura deverá considerar que:

* Providers falham;
* redes falham;
* processos reiniciam;
* dependências ficam lentas;
* mensagens duplicam;
* credenciais expiram;
* storage pode ficar indisponível;
* modelos de IA podem degradar.

---

### 18. Segurança por padrão

Recursos novos deverão iniciar com:

* acesso privado quando possível;
* autenticação;
* criptografia;
* logging;
* menor privilégio;
* configuração segura;
* ausência de exposição pública desnecessária.

---

## Parte III — Estratégia de ambientes

### 19. Ambientes iniciais

A estratégia poderá incluir:

* Local;
* Test;
* Preview;
* Staging;
* Production.

A existência física de todos os ambientes não é obrigatória no início.

---

### 20. Local

O ambiente local deverá:

* ser reproduzível;
* utilizar dados sintéticos;
* permitir execução sem credenciais de produção;
* suportar adapters simulados;
* permitir reset;
* oferecer feedback rápido.

---

### 21. Test

O ambiente de teste deverá suportar:

* testes automatizados;
* migrations;
* contratos;
* integração;
* autorização;
* isolamento;
* IA simulada ou controlada.

---

### 22. Preview

Ambientes de preview poderão existir por pull request.

Deverão possuir:

* duração limitada;
* dados sintéticos;
* recursos reduzidos;
* URL identificável;
* ausência de secrets de produção;
* destruição automática;
* limites de custo.

---

### 23. Staging

Staging deverá aproximar os principais comportamentos de produção quando isso for necessário.

Deverá ser utilizado para:

* testes integrados;
* migrations;
* deployment;
* performance;
* Providers;
* observabilidade;
* runbooks;
* validação de IA.

---

### 24. Production

Produção deverá possuir:

* acesso controlado;
* deployment rastreável;
* backup;
* monitoramento;
* alertas;
* rollback;
* logs;
* proteção de dados;
* gestão de incidentes;
* continuidade proporcional.

---

### 25. Isolamento entre ambientes

Cada ambiente deverá possuir isolamento adequado de:

* dados;
* secrets;
* identidades;
* configuração;
* recursos;
* quotas;
* logs;
* Providers.

---

### 26. Proibição de dados de produção

Dados reais de produção não deverão ser copiados para ambientes inferiores sem processo formal de:

* autorização;
* minimização;
* anonimização;
* proteção;
* retenção;
* exclusão.

---

### 27. Nomenclatura

Recursos deverão possuir nomes consistentes.

Estrutura recomendada:

```text
routebook-<environment>-<service>-<resource>
```

Exemplos:

```text
routebook-prod-api-runtime
routebook-staging-primary-database
routebook-preview-142-web
```

---

## Parte IV — Contas, projetos e isolamento administrativo

### 28. Separação administrativa

Ambientes relevantes deverão ser separados por contas, projetos, subscriptions ou estruturas equivalentes quando isso reduzir risco.

---

### 29. Produção isolada

Produção deverá possuir separação administrativa suficiente para impedir alterações acidentais originadas em ambientes inferiores.

---

### 30. Ownership

Cada conta ou projeto deverá possuir:

* owner;
* finalidade;
* ambientes;
* acessos;
* orçamento;
* contatos;
* criticidade.

---

### 31. Acesso humano

Acesso administrativo deverá:

* ser limitado;
* utilizar identidade individual;
* evitar credenciais compartilhadas;
* possuir autenticação forte;
* ser auditável;
* possuir revisão periódica.

---

### 32. Acesso emergencial

Acesso emergencial deverá:

* possuir justificativa;
* ter duração limitada;
* gerar logs;
* ser revogado;
* passar por revisão posterior.

---

## Parte V — Infrastructure as Code

### 33. Fonte canônica

O código de infraestrutura deverá permanecer no repositório ou em repositório canônico autorizado.

---

### 34. Estrutura sugerida

```text
infrastructure/
├── modules/
├── environments/
│   ├── test/
│   ├── staging/
│   └── production/
├── policies/
├── scripts/
└── tests/
```

---

### 35. Módulos reutilizáveis

Módulos deverão representar capacidades coerentes.

Exemplos:

* workload;
* database;
* object storage;
* queue;
* observability;
* identity;
* networking.

---

### 36. Estado da infraestrutura

Quando a ferramenta utilizar estado, ele deverá possuir:

* backend controlado;
* criptografia;
* acesso mínimo;
* locking;
* backup;
* histórico;
* proteção contra alteração manual.

---

### 37. Plan antes de apply

Mudanças deverão produzir plano revisável antes da aplicação em ambientes críticos.

---

### 38. Aplicação controlada

A aplicação deverá ocorrer por pipeline autorizado sempre que possível.

Alterações manuais deverão ser tratadas como exceção.

---

### 39. Drift

O sistema deverá detectar divergências entre:

* código declarado;
* configuração aplicada;
* recursos reais.

---

### 40. Policy as Code

Políticas automatizadas poderão validar:

* exposição pública;
* criptografia;
* regiões;
* tags;
* permissões;
* logging;
* backups;
* imagens;
* redes;
* secrets.

---

### 41. Destruição de recursos

Operações destrutivas deverão possuir:

* proteção;
* aprovação;
* plano;
* backup;
* evidência;
* verificação.

---

## Parte VI — Redes

### 42. Princípio de exposição mínima

Recursos não deverão ser publicamente acessíveis sem necessidade.

---

### 43. Camadas de rede

A arquitetura poderá distinguir:

* edge público;
* workloads de aplicação;
* serviços internos;
* persistência;
* administração.

---

### 44. Entrada pública

A entrada pública deverá utilizar mecanismos apropriados para:

* TLS;
* roteamento;
* rate limiting;
* proteção contra abuso;
* logging;
* health checks.

---

### 45. Banco de dados

O banco não deverá ficar publicamente acessível em produção.

---

### 46. Egress

Saídas externas deverão ser conhecidas e controladas quando necessário.

Isso é especialmente relevante para:

* Providers de IA;
* mapas;
* pagamentos;
* e-mail;
* observabilidade;
* storage externo.

---

### 47. DNS

Registros DNS deverão possuir:

* owner;
* finalidade;
* ambiente;
* TTL;
* histórico;
* controle de acesso.

---

### 48. Certificados

Certificados deverão:

* utilizar algoritmos aprovados;
* possuir renovação automatizada;
* gerar alertas de expiração;
* ser separados por ambiente.

---

## Parte VII — Identidade de workloads

### 49. Identidade própria

Cada workload deverá possuir identidade própria quando suportado.

---

### 50. Credenciais estáticas

Credenciais de longa duração deverão ser evitadas.

---

### 51. Permissões

Permissões deverão ser concedidas por capacidade necessária.

Exemplos:

* API acessa banco;
* worker consome fila;
* job de backup acessa storage;
* pipeline publica artefato;
* agente acessa apenas Tools autorizadas.

---

### 52. Workload identity

Deverá ser preferida identidade federada ou temporária para:

* pipelines;
* containers;
* jobs;
* funções;
* automações.

---

### 53. Rotação

Credenciais que não puderem ser temporárias deverão possuir rotação.

---

## Parte VIII — Compute

### 54. Estratégia inicial

A escolha inicial deverá favorecer:

* baixo custo operacional;
* deployment simples;
* escalabilidade suficiente;
* integração com observabilidade;
* rollback;
* isolamento;
* portabilidade razoável.

---

### 55. Opções elegíveis

A decisão poderá considerar:

* plataforma serverless;
* containers gerenciados;
* virtual machines;
* funções;
* orquestração de containers.

A escolha final deverá ser registrada em ADR.

---

### 56. Workloads síncronos

Workloads HTTP deverão possuir:

* health checks;
* timeout;
* limite de recursos;
* graceful shutdown;
* logs;
* métricas;
* readiness;
* liveness quando aplicável.

---

### 57. Workloads assíncronos

Workers deverão possuir:

* idempotência;
* retry controlado;
* dead-letter mechanism;
* métricas;
* limite de concorrência;
* rastreabilidade;
* tratamento de duplicidade.

---

### 58. Jobs

Jobs deverão possuir:

* identificador;
* owner;
* schedule;
* timeout;
* retry;
* logs;
* alerta;
* comportamento idempotente quando aplicável.

---

### 59. Imagens

Imagens de container deverão:

* utilizar base mínima;
* possuir versão fixa;
* executar sem root quando possível;
* passar por scanner;
* não conter secrets;
* possuir SBOM;
* ser imutáveis.

---

## Parte IX — Persistência

### 60. Banco primário

A persistência principal deverá respeitar:

* ownership;
* consistência;
* migrations;
* backup;
* restore;
* criptografia;
* observabilidade;
* acesso mínimo.

---

### 61. Banco gerenciado

Serviço gerenciado deverá ser preferido quando reduzir risco operacional sem criar dependência desproporcional.

---

### 62. Alta disponibilidade

A configuração deverá ser proporcional aos objetivos definidos no `RB-SRE-001`.

---

### 63. Conexões

Deverão existir limites e pooling adequados.

---

### 64. Criptografia

Dados deverão ser protegidos:

* em trânsito;
* em repouso;
* em backups;
* em snapshots.

---

### 65. Ownership de schema

Schemas, tabelas ou estruturas deverão possuir ownership identificável.

---

### 66. Migrations

Migrations deverão ser executadas por processo controlado e compatível com o `RB-CICD-001`.

---

### 67. Read replicas

Réplicas somente deverão ser introduzidas quando houver necessidade de:

* escala;
* relatórios;
* isolamento de leitura;
* recuperação.

---

## Parte X — Object storage

### 68. Usos

Object storage poderá ser utilizado para:

* imagens;
* exports;
* backups;
* documentos;
* artefatos;
* evidências;
* conteúdo gerado.

---

### 69. Acesso

Objetos privados deverão ser privados por padrão.

---

### 70. URLs temporárias

Acesso temporário deverá utilizar URLs assinadas ou mecanismo equivalente quando aplicável.

---

### 71. Retenção

Políticas deverão definir:

* expiração;
* versionamento;
* exclusão;
* archive;
* legal hold quando aplicável.

---

### 72. Uploads

Uploads deverão ser validados quanto a:

* tipo;
* tamanho;
* conteúdo;
* nome;
* destino;
* autorização;
* malware quando necessário.

---

## Parte XI — Cache

### 73. Objetivo

Cache deverá existir para resolver necessidade mensurável.

---

### 74. Dados elegíveis

Poderão ser armazenados:

* respostas de Providers;
* dados derivados;
* sessões;
* resultados geográficos;
* configurações não sensíveis.

---

### 75. Dados inadequados

Não deverão ser armazenados sem análise:

* secrets;
* dados sensíveis completos;
* estado canônico exclusivo;
* informações cross-account;
* decisões não persistidas.

---

### 76. Chaves

Chaves deverão preservar escopo de:

* ambiente;
* Account;
* Trip;
* versão;
* tipo de dado.

---

### 77. Invalidação

Toda estratégia de cache deverá definir:

* TTL;
* invalidação;
* fallback;
* atualização;
* consistência;
* observabilidade.

---

## Parte XII — Mensageria

### 78. Critério de adoção

Mensageria deverá ser adotada quando houver necessidade real de:

* desacoplamento;
* processamento assíncrono;
* absorção de picos;
* retry;
* integração;
* eventos.

---

### 79. Mensagens

Mensagens deverão possuir:

* messageId;
* eventType;
* version;
* correlationId;
* causationId;
* timestamp;
* producer;
* payload.

---

### 80. Idempotência

Consumidores deverão tratar duplicidade.

---

### 81. Dead-letter

Mensagens não processadas deverão possuir mecanismo de isolamento e análise.

---

### 82. Retenção

A retenção deverá considerar:

* replay;
* custo;
* privacidade;
* volume;
* operação.

---

### 83. Eventos canônicos

Eventos deverão preservar a linguagem definida em `RB-DOM-004`.

---

## Parte XIII — Configuração

### 84. Categorias

A configuração deverá ser classificada como:

* pública;
* interna;
* sensível;
* operacional;
* feature flag;
* capability configuration;
* Provider configuration.

---

### 85. Schema

Configurações relevantes deverão possuir schema ou validação equivalente.

---

### 86. Mudanças

Mudanças de configuração em produção deverão ser:

* rastreáveis;
* aprovadas;
* verificadas;
* reversíveis.

---

### 87. Configuração dinâmica

Somente deverá ser utilizada quando houver necessidade real.

---

### 88. Valores padrão

Valores padrão deverão ser seguros.

---

## Parte XIV — Secrets

### 89. Armazenamento

Secrets deverão utilizar mecanismo dedicado.

---

### 90. Separação

Secrets deverão ser separados por:

* ambiente;
* aplicação;
* workload;
* Provider;
* finalidade.

---

### 91. Acesso

O acesso deverá ser concedido à identidade do workload, não distribuído manualmente.

---

### 92. Auditoria

Leitura e alteração de secrets deverão ser auditáveis.

---

### 93. Rotação

Deverão existir procedimentos para:

* rotação planejada;
* rotação emergencial;
* revogação;
* validação pós-rotação.

---

### 94. Exposição

Um secret exposto deverá ser considerado comprometido.

---

## Parte XV — Edge, CDN e proteção

### 95. CDN

CDN poderá ser utilizada para:

* assets;
* conteúdo público;
* redução de latência;
* absorção de tráfego.

---

### 96. Cache de edge

Não deverá armazenar respostas privadas sem controle apropriado de chave e headers.

---

### 97. Rate limiting

Deverá existir para endpoints suscetíveis a:

* abuso;
* scraping;
* brute force;
* custo elevado;
* chamadas de IA;
* uso anônimo.

---

### 98. Web Application Firewall

Poderá ser adotado conforme exposição e risco.

---

### 99. Proteção contra automação abusiva

Deverá considerar:

* autenticação;
* rate limits;
* quotas;
* detecção;
* bloqueios;
* desafios quando apropriado.

---

## Parte XVI — Deployment

### 100. Princípio

Deployment deverá promover artefato já validado.

---

### 101. Estratégias

Poderão ser utilizadas:

* rolling;
* recreate;
* blue-green;
* canary;
* feature-based release.

---

### 102. Escolha proporcional

A estratégia deverá considerar:

* estado;
* criticidade;
* volume;
* custo;
* rollback;
* infraestrutura;
* observabilidade.

---

### 103. Health checks

Workloads deverão expor checks adequados.

---

### 104. Readiness

Um workload somente deverá receber tráfego quando estiver pronto.

---

### 105. Graceful shutdown

O encerramento deverá permitir:

* conclusão de requests;
* liberação de conexões;
* finalização de jobs;
* preservação de estado.

---

### 106. Rollout progressivo

Mudanças de maior risco deverão permitir progressão controlada.

---

### 107. Verificação

Após deployment deverão ser avaliados:

* disponibilidade;
* erros;
* latência;
* saturação;
* migrations;
* filas;
* Providers;
* métricas de produto;
* capacidades de IA.

---

## Parte XVII — Escalabilidade

### 108. Escalabilidade horizontal

Deverá ser preferida quando o workload for stateless ou puder ser adaptado para isso.

---

### 109. Estado

Estado de sessão ou processamento não deverá permanecer exclusivamente na memória de uma instância quando isso impedir recuperação.

---

### 110. Auto scaling

Poderá utilizar sinais como:

* CPU;
* memória;
* concorrência;
* fila;
* latência;
* requests;
* jobs pendentes.

---

### 111. Limites

Auto scaling deverá possuir:

* mínimo;
* máximo;
* cooldown;
* orçamento;
* alertas.

---

### 112. Proteção contra cascata

Deverão existir:

* timeouts;
* circuit breakers quando necessários;
* limites de concorrência;
* backpressure;
* retries controlados;
* filas limitadas.

---

### 113. Load testing

Testes deverão ser executados quando houver risco de capacidade ou lançamento relevante.

---

## Parte XVIII — Alta disponibilidade

### 114. Princípio

A disponibilidade deverá ser proporcional ao SLO e ao estágio do produto.

---

### 115. Redundância

Componentes críticos poderão exigir:

* múltiplas instâncias;
* zonas distintas;
* storage redundante;
* failover;
* réplicas.

---

### 116. Single points of failure

Pontos únicos deverão ser:

* identificados;
* avaliados;
* aceitos;
* tratados;
* monitorados.

---

### 117. Dependências externas

A disponibilidade global deverá considerar os Providers críticos.

---

### 118. Operação degradada

O sistema deverá definir comportamentos quando:

* mapas falham;
* IA falha;
* catálogo externo falha;
* e-mail falha;
* observabilidade falha;
* cache falha.

---

## Parte XIX — Backup

### 119. Escopo

Backups poderão incluir:

* banco;
* object storage;
* configuração;
* estado de infraestrutura;
* registros necessários;
* documentos.

---

### 120. Política

Cada recurso deverá definir:

* frequência;
* retenção;
* criptografia;
* localização;
* owner;
* monitoramento;
* teste.

---

### 121. RPO

A frequência deverá ser compatível com o RPO definido.

---

### 122. Falha

Falha de backup deverá gerar alerta.

---

### 123. Imutabilidade

Backups críticos poderão exigir proteção contra alteração e exclusão.

---

### 124. Separação

Backups não deverão depender exclusivamente da mesma falha administrativa ou credencial do recurso original.

---

## Parte XX — Restore

### 125. Princípio

Backup não verificado não deverá ser considerado recuperável.

---

### 126. Testes

Restore deverá ser testado periodicamente.

---

### 127. Escopo de teste

Poderá incluir:

* restauração completa;
* restauração pontual;
* validação de integridade;
* aplicação;
* migrations;
* credenciais;
* conectividade.

---

### 128. Evidência

O teste deverá registrar:

* backup utilizado;
* ambiente;
* duração;
* resultado;
* falhas;
* RTO observado;
* integridade;
* owner.

---

### 129. Dados excluídos

Restore deverá considerar o risco de reintroduzir dados previamente excluídos.

---

## Parte XXI — Continuidade e disaster recovery

### 130. Cenários

O plano deverá considerar:

* perda de banco;
* região indisponível;
* conta comprometida;
* Provider indisponível;
* erro de migration;
* exclusão acidental;
* secret comprometido;
* falha de DNS;
* indisponibilidade de IA.

---

### 131. RTO e RPO

Cada capacidade crítica deverá possuir metas proporcionais.

---

### 132. Estratégias

Poderão incluir:

* restore;
* recriação por IaC;
* promoção de réplica;
* troca de Provider;
* operação degradada;
* rollback;
* desativação de capability.

---

### 133. Runbooks

Cada cenário relevante deverá possuir runbook.

---

### 134. Exercícios

Planos deverão ser testados por:

* walkthrough;
* tabletop;
* simulação;
* execução técnica.

---

## Parte XXII — Observabilidade da infraestrutura

### 135. Sinais mínimos

* métricas;
* logs;
* traces;
* eventos;
* health checks;
* audit logs.

---

### 136. Métricas de compute

* CPU;
* memória;
* reinícios;
* instâncias;
* concorrência;
* throttling;
* tempo de startup.

---

### 137. Métricas de banco

* conexões;
* latência;
* locks;
* queries lentas;
* storage;
* replication lag;
* falhas;
* backups.

---

### 138. Métricas de filas

* profundidade;
* idade;
* consumo;
* retries;
* dead letters;
* throughput.

---

### 139. Métricas de rede

* requests;
* erros;
* latência;
* egress;
* conexões;
* certificados;
* DNS.

---

### 140. Dashboards

Dashboards deverão ser orientados a:

* serviço;
* ambiente;
* jornada;
* dependência;
* SLO;
* custo.

---

### 141. Alertas

Alertas deverão ser:

* acionáveis;
* classificados;
* atribuídos;
* testados;
* integrados a runbooks.

---

## Parte XXIII — Logging e auditoria

### 142. Logs de infraestrutura

Deverão registrar:

* mudanças;
* autenticação;
* autorização;
* deployments;
* acesso administrativo;
* leitura de secrets;
* falhas;
* eventos de segurança.

---

### 143. Centralização

Logs relevantes deverão ser centralizados quando a maturidade operacional exigir.

---

### 144. Proteção

Logs deverão possuir:

* acesso mínimo;
* retenção;
* integridade;
* redaction;
* criptografia.

---

### 145. Dados sensíveis

Logs não deverão conter:

* secrets;
* tokens;
* credenciais;
* prompts integrais;
* dados pessoais desnecessários;
* payloads privados completos.

---

## Parte XXIV — Segurança da infraestrutura

### 146. Baseline

Todo recurso deverá possuir baseline seguro.

---

### 147. Hardening

Deverá incluir, conforme aplicável:

* patches;
* imagens mínimas;
* portas reduzidas;
* permissões;
* criptografia;
* logging;
* scanner;
* configuração segura.

---

### 148. Vulnerabilidades

Imagens, sistemas e dependências deverão ser avaliados.

---

### 149. Patching

Atualizações deverão possuir:

* frequência;
* owner;
* teste;
* rollout;
* rollback.

---

### 150. Exposição pública

Recursos públicos deverão possuir registro e justificativa.

---

### 151. Segmentação

Segmentação deverá reduzir movimento lateral e exposição.

---

### 152. Security groups ou equivalentes

Regras deverão ser mínimas, documentadas e revisadas.

---

### 153. Metadata services

Workloads deverão ser protegidos contra acesso indevido a metadados e credenciais.

---

### 154. Supply chain

A infraestrutura deverá executar apenas artefatos aprovados.

---

## Parte XXV — Privacidade na infraestrutura

### 155. Localização de dados

A localização deverá ser conhecida para dados pessoais relevantes.

---

### 156. Providers

Serviços de infraestrutura deverão constar no catálogo de Providers.

---

### 157. Retenção

Logs, backups, snapshots e objetos deverão possuir retenção definida.

---

### 158. Exclusão

O processo de exclusão deverá considerar:

* banco;
* cache;
* índices;
* filas;
* storage;
* logs;
* backups;
* Providers.

---

### 159. Ambientes inferiores

Não deverão utilizar dados pessoais reais por conveniência.

---

### 160. Minimização

Somente os dados necessários deverão ser enviados a serviços de infraestrutura e observabilidade.

---

## Parte XXVI — Infraestrutura de inteligência artificial

### 161. Componentes

A infraestrutura de IA poderá incluir:

* gateway de modelos;
* Providers;
* vector storage;
* cache;
* runtime de agentes;
* workers;
* evaluation runtime;
* tracing;
* Tool execution environment.

---

### 162. Provider isolation

Credenciais e configuração de Providers deverão ser separadas por ambiente.

---

### 163. Model gateway

Um gateway poderá ser adotado quando houver necessidade de:

* controle de Providers;
* quotas;
* fallback;
* logs;
* segurança;
* versionamento;
* custos.

---

### 164. Execução de Tools

Tools deverão executar em contexto com:

* identidade;
* autorização;
* limites;
* timeout;
* isolamento;
* logs;
* idempotência quando necessária.

---

### 165. Sandboxing

Execução de código ou Tool de alto risco deverá utilizar sandbox ou isolamento equivalente.

---

### 166. Context storage

Contextos, embeddings e memórias deverão respeitar:

* Account;
* finalidade;
* retenção;
* acesso;
* exclusão;
* criptografia.

---

### 167. Limites

Deverão existir limites para:

* tokens;
* custo;
* Tool Calls;
* duração;
* concorrência;
* retries;
* tamanho de contexto.

---

### 168. Kill switch

Capacidades críticas de IA deverão poder ser desativadas.

---

### 169. Observabilidade de IA

Deverão ser observados:

* modelo;
* Provider;
* tokens;
* custo;
* latência;
* erros;
* Tool Calls;
* fallback;
* schema validation;
* capabilityId;
* agentId.

---

## Parte XXVII — Custos

### 170. Princípio

Custos deverão ser observáveis e atribuíveis.

---

### 171. Tags

Recursos deverão possuir tags ou metadados equivalentes.

Campos recomendados:

```text
project
environment
service
owner
costCenter
managedBy
criticality
dataClassification
```

---

### 172. Orçamentos

Ambientes deverão possuir limites ou alertas de custo.

---

### 173. Custos de IA

Deverão ser separados por:

* capability;
* Provider;
* modelo;
* ambiente;
* Account quando aplicável.

---

### 174. Preview

Ambientes temporários deverão possuir destruição automática.

---

### 175. Recursos ociosos

Deverão ser detectados e revisados.

---

### 176. Otimização

Otimização não deverá comprometer:

* segurança;
* disponibilidade;
* backup;
* observabilidade;
* recuperação.

---

## Parte XXVIII — Capacidade e performance

### 177. Planejamento

Deverá considerar:

* usuários;
* Trips;
* Places;
* Activities;
* requisições;
* jobs;
* mensagens;
* chamadas de IA;
* storage.

---

### 178. Baseline

A infraestrutura inicial deverá possuir baseline mensurável.

---

### 179. Saturação

Limites deverão gerar sinais antes da falha total.

---

### 180. Quotas

Quotas de Providers deverão ser conhecidas.

---

### 181. Performance budget

Capacidades críticas poderão possuir limites de:

* latência;
* payload;
* consultas;
* chamadas externas;
* tokens;
* tempo de execução.

---

## Parte XXIX — Governança de mudanças

### 182. Mudanças de infraestrutura

Mudanças relevantes deverão seguir o `RB-GOV-002`.

---

### 183. Classificação

Mudanças deverão considerar:

* ambiente;
* alcance;
* dados;
* rede;
* segurança;
* reversibilidade;
* indisponibilidade;
* custo.

---

### 184. Mudanças manuais

Deverão ser:

* excepcionais;
* registradas;
* reconciliadas com IaC;
* revisadas.

---

### 185. Mudanças emergenciais

Deverão possuir revisão posterior.

---

### 186. Aprovação

Mudanças críticas deverão possuir revisão especializada.

---

## Parte XXX — ADRs obrigatórios

### 187. Decisões que exigem ADR

Deverão possuir ADR, conforme aplicável:

* Provider de cloud;
* estratégia de compute;
* banco de dados;
* infraestrutura como código;
* regiões;
* mensageria;
* cache;
* storage;
* observabilidade;
* estratégia de deployment;
* plataforma de IA;
* modelo de isolamento de ambientes.

---

### 188. Primeiro ADR

O `RB-ADR-001` deverá registrar a primeira decisão tecnológica estrutural necessária para iniciar a implementação.

---

### 189. Neutralidade deste documento

Este documento define critérios e restrições.

Ele não deverá antecipar a escolha final sem ADR.

---

## Parte XXXI — Operação e runbooks

### 190. Runbooks mínimos

Deverão existir procedimentos para:

* deployment;
* rollback;
* migration;
* backup;
* restore;
* rotação de secret;
* certificado expirando;
* banco indisponível;
* fila acumulada;
* Provider indisponível;
* custo anormal;
* IA desativada.

---

### 191. Conteúdo

Cada runbook deverá possuir:

* condição;
* impacto;
* pré-requisitos;
* passos;
* validação;
* rollback;
* escalonamento;
* owner.

---

### 192. Automação

Procedimentos repetitivos deverão ser automatizados quando seguros.

---

## Parte XXXII — Métricas

### 193. Disponibilidade

* uptime;
* health checks;
* indisponibilidade;
* falhas por dependência.

---

### 194. Performance

* latência;
* throughput;
* saturação;
* tempo de startup;
* queries lentas.

---

### 195. Deployment

* frequência;
* duração;
* falhas;
* rollbacks;
* tempo de recuperação.

---

### 196. Infraestrutura

* drift;
* mudanças manuais;
* recursos órfãos;
* falhas de provisioning;
* vulnerabilidades.

---

### 197. Recuperação

* backups concluídos;
* backups falhos;
* restores testados;
* RTO observado;
* RPO observado.

---

### 198. Custos

* custo por ambiente;
* custo por serviço;
* custo por capability;
* crescimento;
* desperdício;
* previsão.

---

### 199. Segurança

* recursos públicos;
* acessos privilegiados;
* secrets vencidos;
* imagens vulneráveis;
* políticas violadas.

---

## Parte XXXIII — Papéis e responsabilidades

### 200. Platform

Responsável por:

* infraestrutura;
* IaC;
* ambientes;
* identidade de workloads;
* redes;
* deployment;
* observabilidade;
* recuperação;
* custos.

---

### 201. Engineering

Responsável por:

* requisitos de runtime;
* health checks;
* consumo de recursos;
* configuração;
* comportamento degradado;
* compatibilidade.

---

### 202. Security

Responsável por:

* baseline;
* acessos;
* redes;
* hardening;
* vulnerabilidades;
* proteção de secrets.

---

### 203. Privacy

Responsável por:

* localização;
* retenção;
* Providers;
* exclusão;
* dados em ambientes.

---

### 204. SRE e Operations

Responsáveis por:

* SLOs;
* alertas;
* incidentes;
* continuidade;
* runbooks;
* recovery.

---

### 205. Data

Responsável por:

* persistência;
* backup;
* restore;
* migrations;
* integridade.

---

### 206. AI Platform

Responsável por:

* Providers de IA;
* runtime;
* limites;
* tracing;
* Tools;
* custos;
* fallback.

---

### 207. Governance

Responsável por:

* mudanças;
* ADRs;
* riscos;
* exceções;
* evidências.

---

## Parte XXXIV — Riscos principais

### 208. Complexidade prematura

Mitigação:

* simplicidade;
* serviços gerenciados;
* ADRs;
* fases;
* validação de necessidade.

---

### 209. Lock-in de Provider

Mitigação:

* ports;
* adapters;
* contratos;
* exportação;
* exit plan;
* ADR.

---

### 210. Exposição pública indevida

Mitigação:

* private by default;
* policies;
* scanners;
* revisão;
* inventário.

---

### 211. Drift

Mitigação:

* IaC;
* pipelines;
* detecção;
* reconciliação.

---

### 212. Custo imprevisível

Mitigação:

* budgets;
* quotas;
* tags;
* alertas;
* limites de IA.

---

### 213. Restore inválido

Mitigação:

* testes;
* evidência;
* runbooks;
* métricas.

---

### 214. Permissões excessivas

Mitigação:

* menor privilégio;
* workload identity;
* revisão;
* acesso temporário.

---

### 215. Dependência de pessoa

Mitigação:

* automação;
* documentação;
* runbooks;
* ownership compartilhado.

---

## Parte XXXV — Anti-patterns

### 216. Recursos criados manualmente

Produzem drift e perda de rastreabilidade.

---

### 217. Produção compartilhando secrets com staging

Amplia exposição e impacto.

---

### 218. Banco publicamente acessível

Não deverá ser normalizado.

---

### 219. Uso de credenciais pessoais por workloads

Impede governança adequada.

---

### 220. Backup sem restore testado

Não demonstra recuperabilidade.

---

### 221. Alta disponibilidade sem SLO

Cria custo sem objetivo verificável.

---

### 222. Kubernetes por padrão

Não deverá ser escolhido sem necessidade demonstrada.

---

### 223. Microservices por ambiente

A separação física não deverá anteceder a necessidade arquitetural e operacional.

---

### 224. Configuração dentro da imagem

Impede promoção segura do mesmo artefato.

---

### 225. Secret em variável de build

Pode incorporá-lo ao artefato.

---

### 226. Logs como banco de dados

Logs não deverão substituir persistência canônica.

---

### 227. Cache como fonte canônica

Cache deverá permanecer reconstruível.

---

### 228. IA sem limite de custo

Capacidades de IA deverão possuir quotas e monitoramento.

---

## Parte XXXVI — Modelo de maturidade

### 229. Nível 1 — Base operacional

* ambientes mínimos;
* IaC básico;
* deployment;
* logs;
* backups;
* secrets;
* alertas essenciais.

---

### 230. Nível 2 — Infraestrutura gerenciada

* isolamento;
* policies;
* restore testado;
* dashboards;
* custos;
* rollout controlado;
* identidade de workloads.

---

### 231. Nível 3 — Infraestrutura verificável

* drift detection;
* policy as code;
* provenance;
* auto scaling;
* recovery exercises;
* capacidade planejada.

---

### 232. Nível 4 — Infraestrutura adaptativa

* autoscaling avançado;
* canary automatizado;
* recuperação orquestrada;
* otimização dinâmica;
* análise assistida por agentes.

---

## Parte XXXVII — Estrutura documental

### 233. Organização sugerida

```text
docs/
└── infrastructure/
    ├── infrastructure-environments-and-deployment-strategy.md
    ├── environments/
    ├── networking/
    ├── compute/
    ├── data/
    ├── security/
    ├── observability/
    ├── recovery/
    ├── cost/
    └── templates/
```

---

### 234. Template de ambiente

```text
environmentId:
title:
purpose:
criticality:
accounts:
regions:
network:
workloads:
dataStores:
providers:
secrets:
observability:
backup:
restore:
access:
costLimits:
owner:
status:
```

---

### 235. Template de recurso

```text
resourceId:
title:
resourceType:
environmentId:
purpose:
owner:
criticality:
dataClassification:
networkExposure:
identity:
backup:
monitoring:
costAllocation:
managedBy:
status:
```

---

### 236. Template de decisão de infraestrutura

```text
decision:
context:
requirements:
options:
security:
reliability:
operations:
cost:
portability:
risks:
decisionRecord:
architectureDecisionRecord:
```

---

## Parte XXXVIII — Rastreabilidade

### 237. Cadeia canônica

```mermaid
flowchart LR
    Requirement["Requirement"]
    Architecture["Architecture"]
    ADR["ADR"]
    IaC["Infrastructure as Code"]
    Plan["Plan"]
    Approval["Approval"]
    Apply["Apply"]
    Resource["Resource"]
    Deployment["Deployment"]
    Signals["Operational Signals"]
    Evidence["Evidence"]

    Requirement --> Architecture
    Architecture --> ADR
    ADR --> IaC
    IaC --> Plan
    Plan --> Approval
    Approval --> Apply
    Apply --> Resource
    Resource --> Deployment
    Deployment --> Signals
    Signals --> Evidence
```

---

### 238. Identificadores

A rastreabilidade deverá preservar, quando aplicável:

* requirementId;
* architectureDecisionRecordId;
* decisionRecordId;
* changeRequestId;
* riskId;
* controlId;
* environmentId;
* resourceId;
* artifactId;
* releaseId;
* deploymentId;
* backupId;
* restoreTestId;
* incidentId;
* correlationId.

---

### 239. Matriz mínima

| Elemento   | Vinculação obrigatória          |
| ---------- | ------------------------------- |
| ambiente   | finalidade e owner              |
| recurso    | ambiente e owner                |
| IaC        | recurso                         |
| ADR        | decisão estrutural              |
| mudança    | plano de IaC                    |
| deployment | release e ambiente              |
| backup     | recurso                         |
| restore    | backup                          |
| alerta     | recurso ou serviço              |
| custo      | ambiente, serviço ou capability |

---

## Parte XXXIX — Critérios de aceite

### 240. Fundamentos

* propósito definido;
* escopo definido;
* princípios definidos;
* relação com arquitetura definida;
* relação com CI/CD definida.

---

### 241. Ambientes

* ambientes definidos;
* isolamento definido;
* contas e projetos definidos;
* nomenclatura definida;
* dados de produção protegidos.

---

### 242. Provisionamento

* IaC definido;
* estado definido;
* plan e apply definidos;
* drift definido;
* policy as code definida.

---

### 243. Plataforma

* redes definidas;
* identidade definida;
* compute definido;
* persistência definida;
* storage definido;
* cache definido;
* mensageria definida.

---

### 244. Operação

* configuração definida;
* secrets definidos;
* deployment definido;
* escalabilidade definida;
* disponibilidade definida;
* backup definido;
* restore definido;
* continuidade definida.

---

### 245. Governança

* observabilidade definida;
* segurança definida;
* privacidade definida;
* IA definida;
* custos definidos;
* ADRs definidos;
* runbooks definidos;
* métricas definidas.

---

## Parte XL — Checklist final

### 246. Checklist documental

Antes de aprovar:

* frontmatter YAML é válido;
* ID é único;
* título está correto;
* existe apenas um H1;
* propósito está definido;
* relação com RB-CICD-001 está definida;
* relação com RB-SRE-001 está definida;
* relação com RB-OPS-001 está definida;
* princípios estão definidos;
* ambientes estão definidos;
* isolamento está definido;
* contas e projetos estão definidos;
* IaC está definido;
* estado está definido;
* drift está definido;
* policy as code está definida;
* redes estão definidas;
* identidade de workloads está definida;
* compute está definido;
* persistência está definida;
* object storage está definido;
* cache está definido;
* mensageria está definida;
* configuração está definida;
* secrets estão definidos;
* edge está definido;
* deployment está definido;
* escalabilidade está definida;
* alta disponibilidade está definida;
* backup está definido;
* restore está definido;
* continuidade está definida;
* observabilidade está definida;
* logging está definido;
* segurança está definida;
* privacidade está definida;
* infraestrutura de IA está definida;
* custos estão definidos;
* capacidade está definida;
* governança de mudanças está definida;
* ADRs obrigatórios estão definidos;
* runbooks estão definidos;
* métricas estão definidas;
* papéis estão definidos;
* riscos estão definidos;
* anti-patterns estão definidos;
* maturidade está definida;
* estrutura documental está definida;
* rastreabilidade está presente;
* diagramas Mermaid renderizam no GitHub;
* blocos Mermaid não possuem atributos adicionais;
* termos canônicos estão preservados;
* escolhas tecnológicas não foram antecipadas sem ADR;
* não existem contradições com RB-ARC-001;
* não existem contradições com RB-ARC-002;
* não existem contradições com RB-ARC-003;
* não existem contradições com RB-ARC-004;
* não existem contradições com RB-ARC-005;
* não existem contradições com RB-DATA-002;
* não existem contradições com RB-SEC-001;
* não existem contradições com RB-SEC-002;
* não existem contradições com RB-SEC-003;
* não existem contradições com RB-OBS-001;
* não existem contradições com RB-OPS-001;
* não existem contradições com RB-OPS-002;
* não existem contradições com RB-SRE-001;
* não existem contradições com RB-GOV-001;
* não existem contradições com RB-GOV-002;
* não existem contradições com RB-RISK-001;
* não existem contradições com RB-DEL-001;
* não existem contradições com RB-DEV-001;
* não existem contradições com RB-CICD-001.

---

## Parte XLI — Declaração final

### 247. Declaração de infraestrutura

A infraestrutura do RouteBook deverá ser tratada como parte integral do produto, da arquitetura, da segurança e da operação.

Todo ambiente e recurso relevante deverá permitir responder:

* por que existe;
* qual capacidade suporta;
* quem é responsável;
* como foi provisionado;
* quais dados processa;
* como é protegido;
* como é observado;
* como é atualizado;
* quanto custa;
* como é recuperado;
* como pode ser removido.

Nenhum recurso crítico deverá depender exclusivamente de configuração manual ou conhecimento individual.

Nenhuma implantação deverá utilizar artefato não identificado.

Nenhum backup deverá ser considerado confiável sem restore testado.

Nenhuma capacidade de IA deverá operar sem limites, observabilidade, autorização e mecanismos de contenção.

As escolhas tecnológicas deverão ser realizadas por ADRs, considerando o estágio real do RouteBook e evitando complexidade prematura.

A infraestrutura deverá evoluir progressivamente, mantendo:

* reprodutibilidade;
* segurança;
* confiabilidade;
* observabilidade;
* reversibilidade;
* controle de custos;
* coerência arquitetural;
* rastreabilidade.
