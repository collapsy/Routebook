---

id: RB-ARC-001

title: Visão Geral da Arquitetura
description: Define a visão arquitetural de alto nível do RouteBook, incluindo princípios, estilos, contextos, camadas, componentes, fluxos, integrações, dados, IA, segurança, observabilidade e estratégia de evolução.

document_type: architecture
owner: Architecture

status: Draft
version: "0.1.0"

created: "2026-07-17"
last_updated: null

authors:

- RouteBook Team

tags:

- architecture
- architecture-overview
- software-architecture
- modular-monolith
- ai-first
- domain-driven-design
- event-driven
- cloud-ready

related_documents:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
- RB-PRD-001
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

prerequisites:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
- RB-PRD-001
- RB-DOM-001
- RB-DOM-002
- RB-DOM-003
- RB-DOM-004

next_documents:

- RB-ARC-002
- RB-ARC-003
- RB-ARC-004
- RB-ARC-005
- RB-DATA-001
- RB-API-001
- RB-SEC-001
- RB-QA-001

ai_context:
priority: critical
index: true
---

# RouteBook — Visão Geral da Arquitetura

## 1. Propósito deste documento

Este documento define a visão arquitetural de alto nível do RouteBook.

Seu objetivo é transformar os princípios de produto e domínio em uma estrutura técnica coerente, evolutiva e implementável.

Esta visão deverá orientar:

* decisões arquiteturais;
* organização do código;
* definição de módulos;
* integração entre contextos;
* persistência;
* APIs;
* frontend;
* backend;
* uso de IA;
* segurança;
* observabilidade;
* testes;
* implantação;
* evolução do produto;
* agentes de engenharia.

Este documento define:

* objetivos arquiteturais;
* princípios;
* drivers;
* restrições;
* estilo arquitetural;
* contextos;
* módulos;
* camadas;
* responsabilidades;
* comunicação;
* fluxos;
* dados;
* integrações;
* IA;
* segurança;
* resiliência;
* observabilidade;
* qualidade;
* implantação;
* evolução;
* governança.

Este documento não define:

* código;
* endpoints completos;
* schemas finais;
* tabelas;
* provedores definitivos;
* framework obrigatório;
* configuração de infraestrutura;
* contratos detalhados;
* pipelines completos;
* decisões de baixo nível.

---

## 2. Relação com as demais Epics

A Arquitetura deverá implementar e proteger decisões estabelecidas por:

```text
Foundation
→ define propósito, princípios e limites permanentes

Product
→ define comportamento e requisitos

Experience
→ define superfícies, fluxos e interações

Design System
→ define linguagem visual e componentes

Domain
→ define conceitos, regras, invariantes e eventos

Architecture
→ define como o sistema será estruturado para cumprir tudo isso
```

A Arquitetura não deverá modificar conceitos do domínio para se adaptar a limitações locais de implementação.

---

## 3. Visão arquitetural resumida

O RouteBook deverá iniciar como uma aplicação web responsiva organizada como um **Monólito Modular**, com limites explícitos entre módulos de negócio.

A arquitetura deverá combinar:

* Domain-Driven Design;
* arquitetura em camadas;
* portas e adaptadores;
* comunicação orientada a casos de uso;
* eventos internos;
* integrações externas isoladas;
* serviços assíncronos quando necessário;
* IA como capacidade especializada;
* contratos versionados;
* observabilidade desde o início;
* evolução incremental.

Visão conceitual:

```text
Cliente Web
    │
    ▼
Application Interface
    │
    ▼
Módulos de Aplicação
    │
    ▼
Domínio
    │
    ├── Persistência
    ├── Provedores Geográficos
    ├── Fontes de Lugares
    ├── IA
    ├── Identidade
    └── Observabilidade
```

---

# Parte I — Drivers arquiteturais

## 4. Driver de produto

O RouteBook deverá ajudar o viajante a tomar decisões durante a viagem.

A arquitetura deverá suportar perguntas como:

* O que fazer agora?
* Onde ir?
* Onde almoçar?
* Qual opção faz mais sentido?
* Quanto tempo vou gastar?
* Quanto vou me deslocar?
* Como organizar meu Dia?
* O que precisa ser revisto?

---

## 5. Driver de personalização

As respostas deverão considerar o contexto específico da Viagem:

* Destino;
* Hospedagem;
* Período;
* Viajantes;
* Preferências;
* Restrições;
* Ritmo;
* Orçamento;
* Roteiro;
* horário;
* Localização;
* dados disponíveis.

---

## 6. Driver de confiabilidade

O sistema deverá diferenciar:

* fatos;
* estimativas;
* inferências;
* Recomendações;
* informações não confirmadas;
* dados desatualizados.

---

## 7. Driver de controle do Usuário

IA e automações deverão:

* sugerir;
* explicar;
* preparar;
* revisar;
* simular.

Não deverão aplicar alterações canônicas sem autorização.

---

## 8. Driver de evolução

O projeto inicia como produto pessoal, mas deverá permitir evolução para:

* múltiplos Usuários;
* múltiplos Destinos;
* colaboração;
* múltiplas fontes de dados;
* aplicativos móveis;
* integrações;
* reservas;
* notificações;
* sincronização;
* operação offline parcial.

---

## 9. Driver de custo

A arquitetura inicial deverá priorizar:

* simplicidade operacional;
* baixo custo;
* poucos serviços;
* implantação previsível;
* utilização controlada de IA;
* possibilidade de escalar por demanda.

---

## 10. Driver de qualidade

A solução deverá permitir:

* testes automatizados;
* contratos claros;
* substituição de provedores;
* observabilidade;
* tratamento de falhas;
* rastreabilidade;
* acessibilidade;
* segurança.

---

# Parte II — Restrições arquiteturais

## 11. Aplicação web inicial

O primeiro cliente será uma aplicação web responsiva.

Deverá funcionar adequadamente em:

* navegadores móveis;
* navegadores desktop;
* diferentes larguras;
* conexões instáveis;
* dispositivos de menor capacidade.

---

## 12. GitHub como fonte canônica

A documentação, decisões e código deverão permanecer no repositório oficial.

Nenhuma ferramenta externa deverá ser a única fonte de verdade.

---

## 13. Documentação-first

Decisões estruturais importantes deverão ser documentadas antes ou junto da implementação.

---

## 14. AI-First com controle

A IA será uma capacidade de primeira classe, mas não será responsável direta pela integridade do domínio.

---

## 15. Dependência de serviços externos

O RouteBook dependerá potencialmente de:

* mapas;
* geocodificação;
* rotas;
* Lugares;
* imagens;
* avaliações;
* IA;
* autenticação.

Essas dependências deverão ser isoladas por contratos internos.

---

## 16. MVP incremental

O sistema deverá permitir implementação gradual.

Uma capacidade futura não deverá ser antecipada por complexidade desnecessária.

---

# Parte III — Princípios arquiteturais

## 17. Domínio no centro

Regras de negócio deverão permanecer independentes de:

* framework;
* banco de dados;
* provedor;
* interface;
* IA;
* infraestrutura.

---

## 18. Monólito Modular primeiro

O sistema deverá iniciar como Monólito Modular.

Isso significa:

* uma unidade principal de implantação;
* módulos com responsabilidades explícitas;
* dependências controladas;
* contratos internos;
* persistência logicamente separada;
* possibilidade de extração futura.

Não significa:

* código sem organização;
* acesso irrestrito entre módulos;
* banco compartilhado sem limites;
* lógica centralizada em um único serviço.

---

## 19. Separação por capacidade

A organização principal deverá seguir capacidades do negócio, e não apenas camadas técnicas globais.

Preferir:

```text
trip/
places/
itinerary/
recommendations/
```

Evitar uma estrutura central baseada somente em:

```text
controllers/
services/
repositories/
models/
```

sem separação por domínio.

---

## 20. Dependências direcionadas para dentro

Camadas externas poderão depender das internas.

O domínio não deverá depender de infraestrutura.

```text
Infrastructure
→ Application
→ Domain
```

---

## 21. Portas e adaptadores

Integrações externas deverão ser acessadas por portas internas.

Exemplo:

```text
TravelEstimationPort
    ├── GoogleMapsAdapter
    ├── MapboxAdapter
    └── MockTravelEstimationAdapter
```

---

## 22. Contratos internos estáveis

O domínio deverá utilizar contratos próprios, mesmo quando um provedor possuir estruturas semelhantes.

Objetos externos não deverão atravessar diretamente todo o sistema.

---

## 23. Eventos para efeitos secundários

Eventos internos deverão ser utilizados para consequências que não precisam ocorrer na mesma transação.

Exemplo:

```text
TripAccommodationChanged
→ marcar Estimativas como desatualizadas
→ solicitar recálculo
→ invalidar Recomendações
```

---

## 24. Sincronia somente quando necessária

A comunicação síncrona deverá ser usada quando o resultado for necessário para concluir a operação.

A comunicação assíncrona deverá ser considerada para:

* cálculos demorados;
* geração de Proposta;
* atualização de dados;
* indexação;
* notificações;
* analytics;
* recálculo de Conflitos.

---

## 25. Falha parcial

Falhas externas deverão permanecer restritas à capacidade afetada.

---

## 26. Observabilidade como requisito

Operações críticas deverão ser rastreáveis desde o início.

---

## 27. Segurança por padrão

Autorização, validação e proteção de dados deverão existir além da interface.

---

## 28. Evolução por evidência

Novos serviços, bancos, filas ou mecanismos complexos somente deverão ser introduzidos por necessidade comprovada.

---

# Parte IV — Estilo arquitetural

## 29. Estilo principal

O estilo inicial será:

```text
Monólito Modular
+ Arquitetura em Camadas
+ Ports and Adapters
+ Domain-Driven Design
+ Eventos internos
```

---

## 30. Unidade de implantação

A aplicação poderá iniciar com:

* frontend web;
* backend;
* banco relacional;
* armazenamento de assets;
* serviços externos.

O frontend e o backend poderão ser implantados separadamente, embora o backend permaneça um Monólito Modular.

---

## 31. Evolução futura

Módulos poderão ser extraídos quando existirem evidências de:

* escala independente;
* ciclo de implantação diferente;
* isolamento de segurança;
* alta carga;
* ownership distinto;
* disponibilidade específica;
* dependência externa especializada.

---

## 32. Microservices não são objetivo inicial

Microservices não deverão ser utilizados apenas por:

* tendência;
* expectativa futura;
* preferência técnica;
* número de módulos.

A extração deverá ocorrer somente quando o custo operacional for justificado.

---

# Parte V — Contexto do sistema

## 33. Atores

Atores iniciais:

* Usuário autenticado;
* visitante futuro;
* administrador futuro;
* agente de IA;
* scheduler;
* serviços externos;
* fontes de dados.

---

## 34. Sistemas externos

Possíveis sistemas externos:

* provedor de identidade;
* serviço de mapas;
* serviço de geocodificação;
* serviço de rotas;
* fonte de Lugares;
* serviço de imagens;
* provedor de IA;
* analytics;
* monitoramento;
* notificações futuras.

---

## 35. Diagrama de contexto

```text
                    ┌────────────────────┐
                    │      Usuário       │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │     RouteBook      │
                    └─┬────┬────┬────┬──┘
                      │    │    │    │
          ┌───────────┘    │    │    └────────────┐
          ▼                ▼    ▼                 ▼
┌─────────────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐
│ Identidade      │ │ Mapas e  │ │ Fontes de │ │ Provedor de  │
│                 │ │ Rotas    │ │ Lugares   │ │ IA           │
└─────────────────┘ └──────────┘ └───────────┘ └──────────────┘
```

---

# Parte VI — Módulos de domínio

## 36. Módulos iniciais

O backend deverá considerar os seguintes módulos lógicos:

1. Identity and Access;
2. Trips;
3. Travelers and Preferences;
4. Places;
5. Saved Places;
6. Itinerary;
7. Mobility;
8. Recommendations;
9. Itinerary Proposals;
10. Conflicts;
11. Data Provenance;
12. Platform.

---

## 37. Identity and Access

Responsabilidades:

* Conta;
* Usuário;
* autenticação;
* papéis;
* permissões;
* sessão;
* consentimentos.

Não deverá conter regras de planejamento.

---

## 38. Trips

Responsabilidades:

* Viagem;
* Destino;
* Período;
* Hospedagem;
* status;
* participantes;
* alterações estruturais.

---

## 39. Travelers and Preferences

Responsabilidades:

* Viajantes;
* Perfil do Grupo;
* Interesses;
* Orçamento;
* Ritmo;
* Restrições;
* transporte predominante.

---

## 40. Places

Responsabilidades:

* Lugar;
* identidade;
* categorias;
* informações;
* fontes;
* reconciliação;
* dados externos;
* disponibilidade.

---

## 41. Saved Places

Responsabilidades:

* associação Viagem–Lugar;
* salvamento;
* remoção;
* observações;
* tags futuras.

Poderá permanecer dentro de Trips no MVP, desde que sua responsabilidade permaneça explícita.

---

## 42. Itinerary

Responsabilidades:

* Roteiro;
* Dias;
* Atividades;
* Períodos Livres;
* ordenação;
* versões;
* planejamento parcial.

---

## 43. Mobility

Responsabilidades:

* Deslocamentos;
* Distâncias;
* Tempo de Deslocamento;
* transporte;
* estimativas;
* validade;
* integração com rotas.

---

## 44. Recommendations

Responsabilidades:

* Contexto de Decisão;
* Recomendações;
* justificativas;
* scores internos;
* validade;
* aceitação;
* rejeição.

---

## 45. Itinerary Proposals

Responsabilidades:

* geração;
* revisão;
* Proposta;
* aceitação integral;
* aceitação parcial;
* expiração;
* substituição.

---

## 46. Conflicts

Responsabilidades:

* detecção;
* classificação;
* evidências;
* resolução;
* ignorar Riscos;
* invalidação;
* revisão.

---

## 47. Data Provenance

Responsabilidades:

* Fontes de Dados;
* Proveniência;
* confiança;
* atualização;
* divergência;
* reconciliação.

Poderá funcionar como capacidade transversal.

---

## 48. Platform

Responsabilidades técnicas compartilhadas:

* eventos;
* jobs;
* observabilidade;
* configuração;
* feature flags;
* armazenamento;
* cache;
* clock;
* IDs;
* segurança técnica.

Platform não deverá absorver regras de negócio.

---

# Parte VII — Limites e dependências

## 49. Dependências permitidas

Visão inicial:

```text
Trips
├── Travelers and Preferences
├── Itinerary
├── Saved Places
└── Data Provenance

Itinerary
├── Places por identidade
├── Mobility
└── Conflicts

Recommendations
├── Trips
├── Travelers and Preferences
├── Places
├── Itinerary
├── Mobility
└── Data Provenance

Itinerary Proposals
├── Recommendations
├── Itinerary
├── Conflicts
└── Mobility
```

---

## 50. Referência por identidade

Módulos deverão preferir relacionamentos por identificador.

Exemplo:

```text
Activity
→ PlaceId
```

Evitar compartilhar toda a entidade `Place` dentro de `Itinerary`.

---

## 51. Sem acesso direto irrestrito

Um módulo não deverá acessar tabelas internas de outro módulo diretamente sem contrato definido.

---

## 52. Integração interna

Opções permitidas:

* chamadas de casos de uso;
* portas internas;
* consultas específicas;
* Eventos internos;
* projeções.

---

## 53. Dependências circulares

Dependências circulares entre módulos deverão ser evitadas.

Quando identificadas, considerar:

* Evento;
* serviço de aplicação;
* contrato neutro;
* divisão de responsabilidade;
* módulo de orquestração.

---

# Parte VIII — Camadas internas

## 54. Camadas por módulo

Cada módulo poderá possuir:

```text
domain/
application/
infrastructure/
interfaces/
```

---

## 55. Domain

Contém:

* entidades;
* objetos de valor;
* agregados;
* invariantes;
* serviços de domínio;
* Eventos de Domínio;
* especificações;
* políticas puras.

Não contém:

* ORM;
* chamadas HTTP;
* SDK de IA;
* SDK de mapas;
* logs específicos;
* framework web.

---

## 56. Application

Contém:

* casos de uso;
* comandos;
* consultas;
* orquestração;
* autorização contextual;
* transações;
* portas;
* publicação de Eventos;
* composição de respostas.

---

## 57. Infrastructure

Contém:

* persistência;
* adaptadores externos;
* mensageria;
* cache;
* provedores;
* configuração;
* observabilidade técnica.

---

## 58. Interfaces

Contém:

* HTTP;
* handlers;
* controllers;
* serialização;
* validação de transporte;
* webhooks futuros;
* jobs;
* consumers.

---

## 59. Regra de dependência

```text
Interfaces
→ Application
→ Domain

Infrastructure
→ Application e Domain por contratos
```

O Domain não depende das demais camadas.

---

# Parte IX — Frontend

## 60. Responsabilidade do frontend

O frontend será responsável por:

* experiência;
* navegação;
* estado visual;
* acessibilidade;
* validações imediatas;
* composição de componentes;
* sincronização com APIs;
* proteção de alterações não salvas;
* cache de consulta;
* tratamento de estados;
* telemetria de interação.

---

## 61. Regras que não devem existir apenas no frontend

O frontend não será fonte final de:

* autorização;
* invariantes;
* validação de domínio;
* versão do Roteiro;
* aceitação de Proposta;
* restrições obrigatórias;
* exclusão.

---

## 62. Organização do frontend

Estrutura orientada por feature:

```text
features/
├── trips/
├── explore/
├── places/
├── map/
├── saved-places/
├── itinerary/
├── proposals/
├── conflicts/
└── settings/
```

Componentes genéricos deverão permanecer no Design System.

---

## 63. Estado do servidor

Dados canônicos deverão ser tratados como estado do servidor.

Exemplos:

* Viagem;
* Roteiro;
* Lugares Salvos;
* Propostas;
* Conflitos.

---

## 64. Estado local

Exemplos:

* modal aberto;
* filtro ainda não aplicado;
* texto digitado;
* item selecionado;
* posição de scroll;
* edição ainda não salva.

---

## 65. Cache no cliente

Poderá ser utilizado para:

* reduzir carregamento;
* preservar contexto;
* fornecer feedback imediato;
* permitir atualização otimista segura.

O cache não será a fonte canônica.

---

## 66. Atualização otimista

Poderá ser utilizada em ações simples e reversíveis:

* Salvar Lugar;
* remover dos Salvos;
* reordenar, se houver restauração segura.

Não deverá ser utilizada sem estratégia de reconciliação.

---

## 67. Renderização

A estratégia de renderização deverá considerar:

* SEO futuro para conteúdo público;
* performance;
* autenticação;
* custo;
* complexidade.

A decisão entre SPA, SSR ou modelo híbrido será detalhada posteriormente.

---

# Parte X — API e interface de aplicação

## 68. API principal

A primeira API poderá utilizar HTTP com contratos orientados a recursos e casos de uso.

---

## 69. Recursos conceituais

Exemplos:

```text
/trips
/trips/{tripId}
/trips/{tripId}/travelers
/trips/{tripId}/saved-places
/trips/{tripId}/itinerary
/trips/{tripId}/proposals
/trips/{tripId}/conflicts
/places
```

Os contratos detalhados serão definidos em documento próprio.

---

## 70. Comandos explícitos

Ações que não representem CRUD simples poderão utilizar operações específicas.

Exemplos conceituais:

```text
POST /trips/{tripId}/itinerary/proposals
POST /trips/{tripId}/itinerary/proposals/{proposalId}/accept
POST /trips/{tripId}/conflicts/{conflictId}/ignore
POST /trips/{tripId}/activities/{activityId}/move
```

---

## 71. Consultas especializadas

Consultas poderão ser projetadas para necessidades da interface.

Exemplo:

```text
GET /trips/{tripId}/overview
GET /trips/{tripId}/explore
GET /trips/{tripId}/map
GET /trips/{tripId}/itinerary/days/{date}
```

Essas consultas podem utilizar projeções sem expor estrutura interna do domínio.

---

## 72. Versionamento

Contratos públicos deverão possuir estratégia de versionamento.

A decisão técnica será detalhada em `RB-API-001`.

---

## 73. Erros

Erros deverão distinguir:

* validação de transporte;
* regra de domínio;
* autorização;
* concorrência;
* dependência externa;
* indisponibilidade;
* falha interna.

---

## 74. Concorrência

Operações críticas deverão suportar versão esperada, ETag ou mecanismo equivalente.

---

# Parte XI — Persistência

## 75. Banco inicial

O sistema deverá priorizar banco relacional no MVP.

Motivos:

* relacionamentos;
* transações;
* consistência;
* consultas;
* maturidade;
* custo;
* evolução.

---

## 76. Separação lógica por módulo

Mesmo em banco compartilhado, cada módulo deverá possuir:

* ownership de dados;
* tabelas ou schemas próprios;
* acesso controlado;
* contratos de leitura;
* migrações organizadas.

---

## 77. Agregados e transações

Transações deverão respeitar limites de agregado.

Operações entre agregados deverão preferir:

* orquestração;
* Eventos;
* consistência eventual;
* compensação quando necessário.

---

## 78. Dados derivados

Dados derivados poderão ser:

* calculados na leitura;
* armazenados como projeção;
* armazenados em cache;
* recalculados por evento.

A escolha deverá considerar custo e consistência.

---

## 79. Histórico

O sistema deverá permitir rastrear alterações críticas.

Não implica event sourcing completo.

Poderão ser utilizados:

* audit log;
* versões;
* Eventos persistidos;
* histórico de alterações;
* snapshots.

---

## 80. Exclusão

A persistência deverá diferenciar:

* remoção lógica;
* arquivamento;
* cancelamento;
* anonimização;
* exclusão física.

---

## 81. Migrações

Migrações de dados deverão ser:

* versionadas;
* reproduzíveis;
* revisáveis;
* testadas;
* reversíveis quando possível.

---

# Parte XII — Eventos e processamento assíncrono

## 82. Event bus interno

O Monólito Modular poderá possuir um barramento interno para Eventos de Domínio.

---

## 83. Publicação após transação

Eventos que dependem de estado persistido deverão ser publicados de forma consistente com a transação.

Estratégias possíveis:

* after-commit;
* transactional outbox;
* fila interna persistida.

A decisão será detalhada posteriormente.

---

## 84. Jobs assíncronos

Capacidades candidatas:

* geração de Proposta;
* recálculo de Distâncias;
* sincronização de Lugares;
* atualização de Proveniência;
* reavaliação de Conflitos;
* expiração de objetos;
* processamento de imagens;
* analytics.

---

## 85. Idempotência

Jobs e consumers deverão suportar:

* identificador;
* deduplicação;
* repetição;
* retry;
* dead-letter futura;
* rastreabilidade.

---

## 86. Entrega

A arquitetura não deverá assumir entrega exatamente uma vez.

Consumidores deverão ser idempotentes.

---

## 87. Falha

Falhas assíncronas deverão:

* ser observáveis;
* possuir retry;
* preservar estado válido;
* permitir reprocessamento;
* não ocultar falha crítica.

---

# Parte XIII — Integrações externas

## 88. Anti-Corruption Layer

Cada integração deverá possuir adaptador que traduza o modelo externo para o modelo interno.

---

## 89. Geocodificação

Porta conceitual:

```text
GeocodingPort
```

Responsabilidades:

* resolver endereço;
* resolver coordenada;
* indicar confiança;
* preservar provedor;
* tratar múltiplos resultados.

---

## 90. Rotas e Distâncias

Porta:

```text
TravelEstimationPort
```

Responsabilidades:

* calcular Distância;
* calcular Tempo;
* considerar transporte;
* retornar Proveniência;
* indicar validade;
* representar indisponibilidade.

---

## 91. Lugares

Porta:

```text
PlaceDataProviderPort
```

Responsabilidades:

* pesquisar Lugares;
* obter Detalhes;
* resolver identificadores;
* preservar fonte;
* representar dados parciais;
* indicar atualização.

---

## 92. Imagens

Porta:

```text
PlaceImageProviderPort
```

A ausência de imagens não deverá impedir o uso do Lugar.

---

## 93. IA

Portas possíveis:

```text
RecommendationGenerationPort
ItineraryProposalGenerationPort
ContentGenerationPort
```

O domínio não deverá depender de SDK ou fornecedor específico.

---

## 94. Autenticação

Porta:

```text
IdentityProviderPort
```

A identidade externa deverá ser mapeada para `UserId` interno.

---

## 95. Timeout

Toda chamada externa deverá possuir timeout explícito.

---

## 96. Retry

Retry somente deverá ocorrer em falhas transitórias e operações seguras.

---

## 97. Circuit breaker

Poderá ser introduzido quando uma integração instável ameaçar o sistema.

---

## 98. Cache de integração

Poderá ser utilizado respeitando:

* validade;
* termos;
* Proveniência;
* atualização;
* privacidade.

---

## 99. Fallback

Fallbacks possíveis:

* lista sem Mapa;
* Distância em linha reta;
* conteúdo parcial;
* dados em cache;
* edição manual;
* provedor alternativo.

---

# Parte XIV — Arquitetura de IA

## 100. Princípio central

A IA deverá ser tratada como uma capacidade probabilística externa ao núcleo determinístico do domínio.

---

## 101. Responsabilidades da IA

A IA poderá:

* resumir contexto;
* gerar Recomendações;
* gerar Propostas;
* explicar alternativas;
* sugerir reorganização;
* identificar possíveis Conflitos;
* produzir rascunhos;
* classificar conteúdo.

---

## 102. Responsabilidades que permanecem determinísticas

A IA não será responsável final por:

* autorização;
* persistência canônica;
* invariantes;
* identidade;
* transações;
* exclusão;
* aplicação de Proposta;
* validação de Restrição obrigatória;
* versão do Roteiro.

---

## 103. Orquestração

Fluxo conceitual:

```text
Application Service
→ constrói Contexto de Decisão
→ aplica regras determinísticas
→ chama AI Port
→ valida saída
→ enriquece com Proveniência
→ produz Recomendação ou Proposta
→ apresenta ao Usuário
```

---

## 104. Contexto estruturado

Prompts não deverão ser construídos a partir de texto livre sem controle quando houver dados estruturados.

O contexto deverá incluir:

* IDs;
* fatos;
* estimativas;
* Restrições;
* Preferências;
* versão;
* fontes;
* instruções;
* schema de saída.

---

## 105. Saída estruturada

Sempre que possível, a IA deverá retornar estrutura validável.

Exemplo:

```text
Recommendation
├── target
├── reasons
├── limitations
├── confidence
└── source references
```

---

## 106. Validação

Toda saída deverá passar por:

* validação estrutural;
* validação semântica;
* regras de domínio;
* autorização;
* verificação de IDs;
* verificação de Restrições;
* limitação de campos.

---

## 107. Grounding

Respostas deverão utilizar dados recuperados de fontes conhecidas quando dependerem de fatos.

---

## 108. Alucinação

Dados não suportados não deverão ser persistidos como fatos.

---

## 109. Proveniência de IA

Deverá ser possível registrar:

* provedor;
* modelo;
* versão;
* prompt ou template;
* contexto;
* fontes;
* data;
* política;
* resultado;
* validações.

---

## 110. Custos

Chamadas deverão considerar:

* cache;
* deduplicação;
* limites;
* modelos adequados à tarefa;
* redução de contexto;
* processamento assíncrono;
* telemetria de custo.

---

## 111. Falha de IA

A falha deverá preservar:

* Roteiro atual;
* edição manual;
* Proposta anterior válida;
* dados fornecidos;
* contexto da Viagem.

---

## 112. Vendor lock-in

Contratos internos deverão permitir substituição de provedor.

---

# Parte XV — Busca e recomendação de Lugares

## 113. Estratégia inicial

A busca poderá combinar:

* texto;
* categoria;
* Distância;
* preço;
* Região;
* estado operacional;
* adequação;
* Preferências.

---

## 114. Filtros determinísticos

Filtros obrigatórios deverão ser aplicados antes ou depois da busca conforme a capacidade, mas antes de apresentar opção incompatível como recomendada.

---

## 115. Ranking

O ranking poderá combinar:

* proximidade;
* compatibilidade;
* qualidade dos dados;
* disponibilidade;
* preço;
* interesse;
* diversidade;
* contexto temporal.

---

## 116. Busca semântica

Poderá ser introduzida futuramente por:

* embeddings;
* índice vetorial;
* busca híbrida.

Não é requisito inicial.

---

## 117. Índice de busca

A extração para mecanismo especializado deverá ocorrer somente quando o banco relacional deixar de atender adequadamente.

---

# Parte XVI — Cache

## 118. Objetivos

Cache poderá reduzir:

* latência;
* custo externo;
* chamadas repetidas;
* carga de banco;
* custo de IA.

---

## 119. Itens candidatos

* Detalhes de Lugar;
* geocodificação;
* Distâncias;
* buscas frequentes;
* imagens;
* Recomendações válidas;
* projeções de Visão Geral.

---

## 120. Não armazenar indiscriminadamente

Não deverão ser armazenados em cache sem estratégia:

* autorização;
* dados sensíveis;
* alterações não confirmadas;
* respostas dependentes de versão sem chave adequada.

---

## 121. Chaves

Chaves deverão considerar contexto relevante.

Exemplo:

```text
tripId
accommodationVersion
transportMode
origin
destination
provider
```

---

## 122. Invalidação

Eventos de domínio deverão orientar invalidação.

---

# Parte XVII — Segurança

## 123. Autenticação

Deverá ser realizada por mecanismo confiável e separada do domínio.

---

## 124. Autorização

Deverá existir em cada operação protegida.

---

## 125. Escopo por Viagem

Toda consulta ou alteração deverá verificar acesso à Viagem.

---

## 126. Validação de entrada

Toda entrada externa deverá ser validada antes de atingir o domínio.

---

## 127. Proteção contra acesso indireto

Identificadores previsíveis não deverão permitir acesso a objetos de outros Usuários.

---

## 128. Segredos

Segredos deverão permanecer fora do código e da documentação pública.

---

## 129. Dados pessoais

Deverão ser:

* minimizados;
* protegidos;
* auditáveis;
* retidos conforme necessidade;
* removidos conforme política.

---

## 130. Localização

Localização atual deverá possuir proteção adicional.

---

## 131. IA e dados

Dados enviados a provedores de IA deverão respeitar:

* minimização;
* consentimento;
* contrato;
* retenção;
* finalidade;
* mascaramento quando necessário.

---

## 132. Logs

Logs não deverão conter dados sensíveis sem necessidade.

---

# Parte XVIII — Resiliência

## 133. Categorias de falha

* validação;
* autorização;
* concorrência;
* dependência externa;
* timeout;
* indisponibilidade;
* dados inválidos;
* processamento assíncrono;
* falha interna.

---

## 134. Estratégias

* timeout;
* retry;
* fallback;
* circuit breaker;
* bulkhead futuro;
* cache;
* degradação;
* reprocessamento;
* compensação.

---

## 135. Degradação funcional

Exemplos:

```text
Mapa indisponível
→ lista continua

IA indisponível
→ planejamento manual continua

Rotas indisponíveis
→ Atividades continuam

Imagens indisponíveis
→ Detalhes textuais continuam
```

---

## 136. Retry seguro

Retry deverá considerar:

* idempotência;
* tipo de falha;
* limite;
* backoff;
* jitter futuro;
* efeitos externos.

---

## 137. Estado incerto

Operações com resultado incerto deverão ser reconciliadas antes de repetição destrutiva.

---

# Parte XIX — Observabilidade

## 138. Pilares

* logs;
* métricas;
* traces;
* eventos;
* auditoria.

---

## 139. Correlation ID

Toda requisição relevante deverá possuir identificador de correlação.

---

## 140. Logs estruturados

Logs deverão conter campos pesquisáveis, como:

* timestamp;
* level;
* service;
* module;
* operation;
* correlationId;
* userId anonimizado quando apropriado;
* tripId;
* status;
* duration;
* errorCode.

---

## 141. Métricas técnicas

* latência;
* erros;
* throughput;
* chamadas externas;
* retries;
* timeouts;
* jobs pendentes;
* cache hit;
* custo de IA;
* tokens;
* falhas de validação.

---

## 142. Métricas de produto

* Viagens criadas;
* Lugares salvos;
* Atividades adicionadas;
* Propostas geradas;
* Propostas aceitas;
* Conflitos detectados;
* Conflitos resolvidos;
* falhas de planejamento.

---

## 143. Tracing

Fluxos distribuídos ou assíncronos deverão permitir rastrear:

```text
Requisição
→ Comando
→ Evento
→ Job
→ Provedor externo
→ Resultado
```

---

## 144. Auditoria

Ações críticas deverão permanecer auditáveis.

---

## 145. Alertas operacionais

Alertas deverão priorizar:

* indisponibilidade;
* erro elevado;
* falha de jobs;
* aumento de custo;
* problema de segurança;
* perda de dados;
* falha de integração crítica.

---

# Parte XX — Qualidade arquitetural

## 146. Atributos prioritários

1. manutenibilidade;
2. confiabilidade;
3. testabilidade;
4. segurança;
5. usabilidade;
6. acessibilidade;
7. observabilidade;
8. performance;
9. escalabilidade;
10. portabilidade.

---

## 147. Manutenibilidade

Será favorecida por:

* módulos;
* contratos;
* documentação;
* testes;
* baixo acoplamento;
* alta coesão;
* convenções;
* decisões registradas.

---

## 148. Testabilidade

Dependências externas deverão ser substituíveis por adaptadores de teste.

---

## 149. Performance

A performance deverá ser medida antes de otimizações estruturais.

---

## 150. Escalabilidade

A arquitetura deverá escalar inicialmente por:

* otimização;
* cache;
* índices;
* filas;
* processamento assíncrono;
* replicação;
* escalabilidade horizontal da aplicação.

---

## 151. Disponibilidade

O MVP não exige disponibilidade extrema, mas deverá evitar pontos frágeis desnecessários.

---

## 152. Acessibilidade

A arquitetura frontend deverá permitir conformidade com os documentos de UX e Design System.

---

# Parte XXI — Estratégia de testes

## 153. Pirâmide conceitual

```text
Testes de domínio
Testes de aplicação
Testes de integração
Testes de contrato
Testes de componentes
Testes E2E
Testes exploratórios
```

---

## 154. Testes de domínio

Deverão cobrir:

* invariantes;
* estados;
* transições;
* regras;
* políticas;
* Eventos.

---

## 155. Testes de aplicação

Deverão cobrir:

* casos de uso;
* autorização;
* orquestração;
* transações;
* efeitos.

---

## 156. Testes de integração

Deverão validar:

* banco;
* adaptadores;
* provedores;
* filas;
* cache;
* serialização.

---

## 157. Testes de contrato

Deverão proteger:

* APIs;
* Eventos;
* integrações;
* saídas de IA estruturadas.

---

## 158. Testes E2E

Deverão priorizar fluxos críticos:

* criar Viagem;
* salvar Lugar;
* adicionar ao Roteiro;
* editar;
* gerar Proposta;
* aceitar Proposta;
* revisar Conflito;
* alterar Hospedagem.

---

## 159. Testes de resiliência

Deverão simular:

* timeout;
* provedor indisponível;
* resposta inválida;
* retry;
* evento duplicado;
* concorrência;
* falha parcial.

---

# Parte XXII — Implantação

## 160. Ambientes

Ambientes iniciais:

* local;
* test;
* staging;
* production.

A nomenclatura poderá ser ajustada.

---

## 161. Configuração

Configuração deverá ser externa ao código quando variar por ambiente.

---

## 162. Build reproduzível

Builds deverão ser:

* versionados;
* reproduzíveis;
* testados;
* rastreáveis.

---

## 163. Migração de banco

A implantação deverá coordenar código e schema com compatibilidade.

---

## 164. Rollback

Mudanças deverão considerar rollback ou roll-forward seguro.

---

## 165. Feature flags

Poderão ser utilizadas para:

* lançamento gradual;
* experimentos;
* novos provedores;
* capacidades de IA;
* mitigação de risco.

Não deverão substituir remoção de código obsoleto.

---

## 166. Infraestrutura como código

Recomendada quando a infraestrutura inicial for definida.

---

# Parte XXIII — Estrutura conceitual do repositório

## 167. Visão geral

```text
RouteBook/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── design-system/
│   ├── domain/
│   ├── contracts/
│   ├── testing/
│   └── shared/
├── docs/
│   ├── architecture/
│   ├── domain/
│   ├── ux/
│   └── design-system/
├── infrastructure/
├── scripts/
└── tests/
```

Essa estrutura é conceitual e deverá ser validada contra o repositório atual.

---

## 168. Organização do backend

```text
apps/api/src/
├── modules/
│   ├── identity/
│   ├── trips/
│   ├── travelers/
│   ├── places/
│   ├── itinerary/
│   ├── mobility/
│   ├── recommendations/
│   ├── proposals/
│   └── conflicts/
├── platform/
└── bootstrap/
```

---

## 169. Organização de módulo

```text
trips/
├── domain/
├── application/
├── infrastructure/
├── interfaces/
└── tests/
```

---

## 170. Shared

`shared` deverá permanecer pequeno.

Somente deverá conter:

* utilidades realmente genéricas;
* tipos técnicos comuns;
* contratos transversais;
* infraestrutura compartilhada.

Não deverá tornar-se depósito de lógica sem owner.

---

# Parte XXIV — Fluxos arquiteturais principais

## 171. Criar Viagem

```text
Web
→ CreateTrip API
→ Trips Application
→ Trip Aggregate
→ Repository
→ TripCreated
→ gerar Dias
→ inicializar Roteiro
→ resposta
```

---

## 172. Salvar Lugar

```text
Web
→ SavePlace
→ autorização
→ validar Viagem e Lugar
→ criar SavedPlace idempotente
→ persistir
→ PlaceSaved
→ atualizar projeções
```

---

## 173. Adicionar Lugar ao Roteiro

```text
Web
→ AddPlaceToItinerary
→ validar Viagem
→ validar Dia
→ validar Lugar
→ criar Activity
→ atualizar versão
→ ActivityAdded
→ recalcular Deslocamentos
→ reavaliar Conflitos
```

---

## 174. Gerar Proposta

```text
Web
→ RequestItineraryProposal
→ capturar versão base
→ persistir solicitação
→ job assíncrono
→ construir Contexto
→ obter dados e estimativas
→ chamar IA
→ validar saída
→ aplicar regras
→ persistir Proposta
→ ItineraryProposalGenerated
→ disponibilizar resultado
```

---

## 175. Aceitar Proposta

```text
Web
→ AcceptItineraryProposal
→ validar autorização
→ validar status
→ validar versão base
→ validar invariantes
→ aplicar itens
→ atualizar Roteiro
→ nova versão
→ ItineraryProposalAccepted
→ recalcular derivados
```

---

## 176. Alterar Hospedagem

```text
Web
→ UpdateAccommodation
→ avaliar impacto
→ confirmar
→ persistir mudança
→ TripAccommodationChanged
→ invalidar Estimativas
→ expirar Recomendações
→ expirar Propostas incompatíveis
→ solicitar recálculos
```

---

# Parte XXV — Decisões iniciais

## 177. Decisão A — Monólito Modular

### Estado

Proposta inicial.

### Justificativa

* produto em estágio inicial;
* baixo custo operacional;
* desenvolvimento mais simples;
* transações locais;
* módulos ainda evoluindo;
* extração futura possível.

---

## 178. Decisão B — Banco Relacional

### Estado

Proposta inicial.

### Justificativa

* relações fortes;
* consistência;
* transações;
* consultas;
* maturidade.

---

## 179. Decisão C — IA por adaptadores

### Estado

Obrigatória.

### Justificativa

* substituição de provedor;
* testes;
* controle de custo;
* isolamento;
* segurança.

---

## 180. Decisão D — Eventos internos

### Estado

Recomendada.

### Justificativa

* desacoplar efeitos;
* reprocessamento;
* auditoria;
* evolução assíncrona.

---

## 181. Decisão E — Sem event sourcing inicial

### Estado

Proposta inicial.

### Justificativa

* complexidade;
* custo;
* baixa necessidade inicial;
* auditoria pode ser atendida por Eventos e histórico.

---

## 182. Decisão F — Sem mecanismo de busca especializado inicial

### Estado

Proposta inicial.

### Justificativa

* banco relacional pode atender o MVP;
* evitar infraestrutura prematura;
* futura extração possível.

---

# Parte XXVI — Riscos arquiteturais

## 183. Dependência de provedores externos

### Risco

Custo, indisponibilidade, limite ou mudança de contrato.

### Mitigação

* portas;
* cache;
* fallback;
* abstração;
* múltiplos provedores futuros.

---

## 184. Qualidade dos dados

### Risco

Informações incompletas, desatualizadas ou conflitantes.

### Mitigação

* Proveniência;
* confiança;
* atualização;
* validação;
* transparência.

---

## 185. Custo de IA

### Risco

Chamadas excessivas ou contextos grandes.

### Mitigação

* cache;
* limites;
* métricas;
* modelos adequados;
* execução assíncrona;
* contexto estruturado.

---

## 186. Acoplamento entre módulos

### Risco

Monólito tornar-se código monolítico sem limites.

### Mitigação

* contratos;
* testes de arquitetura;
* ownership;
* eventos;
* organização por módulos.

---

## 187. Complexidade prematura

### Risco

Infraestrutura desnecessária atrasar o produto.

### Mitigação

* decisões incrementais;
* Monólito Modular;
* métricas;
* documentação;
* ADRs.

---

## 188. Regras duplicadas

### Risco

Frontend, backend e IA divergirem.

### Mitigação

* domínio canônico;
* contratos;
* testes;
* documentação;
* validação central.

---

## 189. Saídas inválidas de IA

### Risco

Estrutura incorreta, IDs inexistentes ou violação de regras.

### Mitigação

* schema;
* validação;
* grounding;
* filtros;
* controle do Usuário.

---

# Parte XXVII — Evolução arquitetural

## 190. Estágio 1 — MVP pessoal

Características:

* um cliente web;
* backend modular;
* banco relacional;
* poucos provedores;
* autenticação simples;
* Propostas assíncronas;
* observabilidade essencial.

---

## 191. Estágio 2 — Produto multiusuário

Possíveis evoluções:

* colaboração;
* papéis;
* convites;
* conflitos de edição;
* notificações;
* filas persistentes;
* cache distribuído.

---

## 192. Estágio 3 — Escala de dados e integração

Possíveis evoluções:

* mecanismo de busca;
* índice geográfico especializado;
* pipeline de ingestão;
* reconciliação avançada;
* múltiplos provedores;
* projeções analíticas.

---

## 193. Estágio 4 — Extração seletiva

Possíveis candidatos:

* Places;
* Mobility;
* AI Orchestration;
* Notifications;
* Search.

A extração somente ocorrerá com evidência.

---

# Parte XXVIII — Requisitos arquiteturais

## 194. Funcionais protegidos

A arquitetura deverá suportar:

* criação de Viagem;
* personalização;
* busca;
* Salvos;
* Roteiro;
* Atividades;
* Períodos Livres;
* Mapa;
* Distâncias;
* Recomendações;
* Propostas;
* Conflitos;
* Configurações.

---

## 195. Não funcionais iniciais

A solução deverá buscar:

* navegação responsiva;
* feedback rápido;
* tolerância a falhas externas;
* proteção de dados;
* rastreabilidade;
* testes;
* deploy automatizado;
* custo controlado;
* acessibilidade;
* manutenção simples.

---

## 196. Performance inicial

Metas numéricas serão definidas posteriormente, mas deverão ser medidas:

* carregamento inicial;
* consultas principais;
* salvamento;
* busca;
* abertura de Roteiro;
* geração de Proposta;
* cálculo de rota.

---

## 197. Segurança inicial

Deverá incluir:

* autenticação;
* autorização por Viagem;
* validação;
* proteção de segredos;
* logs seguros;
* política de dependências;
* proteção contra abuso.

---

# Parte XXIX — Fitness Functions

## 198. Dependência de módulos

Deverá existir verificação automatizada para impedir dependências proibidas.

---

## 199. Cobertura de domínio

Regras críticas deverão possuir testes.

---

## 200. Acessibilidade

Componentes e fluxos críticos deverão possuir validações automatizadas e manuais.

---

## 201. Contratos

APIs e Eventos deverão possuir testes de contrato.

---

## 202. Observabilidade

Fluxos críticos deverão propagar `correlationId`.

---

## 203. Segredos

O repositório não deverá conter segredos válidos.

---

## 204. Dependências externas

Integrações deverão ser acessadas por adaptadores.

---

## 205. Valores de infraestrutura no domínio

O domínio não deverá importar SDKs, ORMs ou frameworks.

---

# Parte XXX — ADRs iniciais recomendados

## 206. Lista

Deverão ser criados posteriormente:

* ADR-001 — Estilo Monólito Modular;
* ADR-002 — Estratégia de persistência;
* ADR-003 — Arquitetura frontend;
* ADR-004 — Estratégia de autenticação;
* ADR-005 — Eventos e Outbox;
* ADR-006 — Provedor de mapas e rotas;
* ADR-007 — Provedor e orquestração de IA;
* ADR-008 — Estratégia de busca;
* ADR-009 — Estratégia de implantação;
* ADR-010 — Observabilidade.

---

# Parte XXXI — Critérios de aceite

## 207. Estrutura

* o estilo arquitetural está definido;
* os módulos estão identificados;
* as camadas estão definidas;
* as dependências estão orientadas;
* os limites estão explícitos.

---

## 208. Domínio

* o domínio permanece independente;
* regras não dependem da interface;
* agregados orientam transações;
* Eventos respeitam o Modelo de Domínio;
* Proveniência está preservada.

---

## 209. IA

* IA está isolada por portas;
* saídas são validadas;
* estado canônico não é alterado automaticamente;
* Proveniência e custo são observáveis;
* falha preserva operação manual.

---

## 210. Integrações

* provedores estão isolados;
* timeouts são obrigatórios;
* retries são controlados;
* fallbacks estão previstos;
* contratos externos não vazam para o domínio.

---

## 211. Dados

* banco relacional é a proposta inicial;
* ownership por módulo está previsto;
* dados derivados possuem estratégia;
* histórico crítico é rastreável;
* exclusão possui distinções claras.

---

## 212. Qualidade

* testes estão previstos;
* observabilidade está integrada;
* segurança está integrada;
* resiliência está integrada;
* evolução está documentada.

---

# Parte XXXII — Governança arquitetural

## 213. Owner

O owner desta documentação é:

```text
Architecture
```

---

## 214. Decisões estruturais

Toda decisão estrutural deverá possuir:

* contexto;
* problema;
* alternativas;
* decisão;
* consequências;
* status;
* data;
* responsáveis;
* documentos afetados.

---

## 215. ADR obrigatório

Um ADR deverá ser criado quando uma decisão:

* alterar estilo;
* introduzir tecnologia central;
* criar dependência importante;
* afetar múltiplos módulos;
* criar custo operacional relevante;
* limitar evolução;
* alterar segurança;
* introduzir breaking change.

---

## 216. Revisão arquitetural

Mudanças relevantes deverão ser revisadas por:

* Architecture;
* Domain;
* área técnica responsável;
* Security, quando aplicável;
* QA;
* Produto, quando houver impacto funcional.

---

## 217. Exceções

Exceções deverão possuir:

* justificativa;
* owner;
* prazo;
* risco;
* mitigação;
* plano de convergência.

---

## 218. Uso por agentes de IA

Agentes de engenharia deverão:

* consultar este documento;
* respeitar módulos;
* respeitar camadas;
* não introduzir dependências circulares;
* utilizar portas;
* não colocar regra no adapter;
* não tornar IA autoridade canônica;
* gerar testes;
* registrar decisões;
* informar quando uma solicitação exigir novo ADR.

---

## 219. Checklist de revisão

Antes de aprovar este documento, verificar:

* drivers estão definidos;
* restrições estão definidas;
* princípios estão definidos;
* estilo está definido;
* contexto está definido;
* módulos estão definidos;
* limites estão definidos;
* camadas estão definidas;
* frontend está contemplado;
* APIs estão contempladas;
* persistência está contemplada;
* eventos estão contemplados;
* integrações estão contempladas;
* IA está contemplada;
* busca está contemplada;
* cache está contemplado;
* segurança está contemplada;
* resiliência está contemplada;
* observabilidade está contemplada;
* testes estão contemplados;
* implantação está contemplada;
* estrutura do repositório está contemplada;
* fluxos estão documentados;
* riscos estão registrados;
* evolução está definida;
* fitness functions estão definidas;
* ADRs estão propostos;
* governança está definida.

---

## 220. Declaração final

A Visão Geral da Arquitetura estabelece como o RouteBook deverá ser estruturado para transformar seus princípios de produto e domínio em software sustentável.

A solução deverá iniciar simples, mas não desorganizada.

Ela deverá utilizar:

* Monólito Modular;
* Domain-Driven Design;
* arquitetura em camadas;
* portas e adaptadores;
* banco relacional;
* Eventos internos;
* processamento assíncrono seletivo;
* integrações isoladas;
* IA validada e controlada;
* observabilidade;
* segurança;
* testes automatizados.

O núcleo do RouteBook deverá permanecer determinístico e orientado pelo domínio.

A IA deverá ampliar a capacidade de decisão, mas nunca substituir:

* invariantes;
* autorização;
* Proveniência;
* validação;
* persistência canônica;
* decisão do Usuário.

A arquitetura deverá evoluir por necessidade comprovada, preservando clareza, modularidade, rastreabilidade e baixo custo operacional.
