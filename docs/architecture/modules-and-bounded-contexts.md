---

id: RB-ARC-002

title: Arquitetura de Módulos e Contextos Delimitados
description: Define os módulos, contextos delimitados, responsabilidades, contratos, dependências, integrações, ownership e critérios de evolução arquitetural do RouteBook.

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
- bounded-contexts
- modules
- modular-monolith
- domain-driven-design
- context-map
- integration
- ai-first

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
- RB-DOM-001
- RB-DOM-002
- RB-DOM-003
- RB-DOM-004
- RB-ARC-001

prerequisites:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
- RB-DOM-001
- RB-DOM-002
- RB-DOM-003
- RB-DOM-004
- RB-ARC-001

next_documents:

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

# RouteBook — Arquitetura de Módulos e Contextos Delimitados

## 1. Propósito deste documento

Este documento define a arquitetura modular e os contextos delimitados do RouteBook.

Seu objetivo é estabelecer:

* quais capacidades pertencem ao sistema;
* onde cada regra deve residir;
* quais módulos possuem determinados dados;
* como os módulos se comunicam;
* quais dependências são permitidas;
* quais contratos devem permanecer estáveis;
* como evitar acoplamento indevido;
* quando um módulo pode evoluir para serviço independente.

Este documento deverá orientar:

* organização do código;
* definição de ownership;
* desenho de APIs internas;
* persistência;
* comunicação entre módulos;
* eventos;
* testes de arquitetura;
* observabilidade;
* segurança;
* evolução do Monólito Modular;
* atuação de agentes de engenharia.

Este documento não define:

* endpoints completos;
* schemas físicos;
* tecnologias definitivas;
* implementação de banco;
* estratégia final de mensageria;
* contratos públicos detalhados;
* infraestrutura de implantação.

---

## 2. Relação com a visão arquitetural

O `RB-ARC-001 — Visão Geral da Arquitetura` estabelece o RouteBook como:

```text
Monólito Modular
+ Domain-Driven Design
+ Arquitetura em Camadas
+ Ports and Adapters
+ Eventos internos
```

Este documento detalha como esse modelo será dividido em módulos e contextos delimitados.

---

## 3. Objetivos da modularização

A modularização deverá:

1. manter responsabilidades claras;
2. proteger invariantes;
3. reduzir dependências;
4. evitar compartilhamento indiscriminado de dados;
5. permitir testes isolados;
6. facilitar manutenção;
7. favorecer substituição de integrações;
8. tornar ownership explícito;
9. preparar extrações futuras;
10. impedir que o Monólito Modular se torne um monólito acoplado;
11. manter o domínio independente da infraestrutura;
12. tornar relações entre módulos rastreáveis.

---

# Parte I — Conceitos arquiteturais

## 4. Contexto Delimitado

Um Contexto Delimitado representa uma fronteira na qual:

* um modelo possui significado consistente;
* termos possuem definições próprias;
* regras possuem ownership;
* dados possuem autoridade;
* contratos externos são controlados.

Um Contexto Delimitado não precisa corresponder imediatamente a:

* serviço;
* processo;
* repositório;
* banco separado;
* unidade de implantação.

No MVP, vários Contextos Delimitados poderão coexistir no mesmo Monólito Modular.

---

## 5. Módulo

Um módulo é uma unidade técnica e funcional que implementa parte de um Contexto Delimitado.

Um módulo deverá possuir:

* responsabilidade;
* owner;
* API interna;
* camada de domínio;
* camada de aplicação;
* infraestrutura própria;
* testes;
* acesso controlado aos dados.

---

## 6. Submódulo

Um submódulo representa uma capacidade interna relevante, mas que não justifica um Contexto Delimitado independente.

Exemplo:

```text
Trips
├── Trip Management
├── Accommodation
└── Participation
```

---

## 7. Ownership

Ownership define qual módulo possui autoridade para:

* alterar um conceito;
* persistir seu estado;
* validar suas invariantes;
* publicar seus Eventos;
* expor seus contratos.

Ownership não significa que outros módulos não possam consultar o conceito.

Significa que eles não podem alterá-lo diretamente.

---

## 8. Contrato interno

Contrato interno é a forma autorizada de comunicação entre módulos.

Pode ser:

* caso de uso;
* porta;
* consulta;
* DTO interno;
* Evento;
* projeção;
* interface de leitura.

---

## 9. Modelo compartilhado

Modelos compartilhados deverão ser mínimos.

Somente conceitos realmente transversais poderão existir em um Shared Kernel.

Exemplos possíveis:

* identificadores;
* Money;
* LocalDate;
* GeoCoordinate;
* CorrelationId;
* Clock.

Regras de negócio específicas não deverão permanecer no Shared Kernel.

---

# Parte II — Visão geral dos Contextos Delimitados

## 10. Contextos iniciais

O RouteBook deverá considerar os seguintes Contextos Delimitados:

1. Identity and Access;
2. Trip Management;
3. Traveler Profile;
4. Place Catalog;
5. Trip Collections;
6. Itinerary Planning;
7. Mobility;
8. Decision Intelligence;
9. Proposal Management;
10. Planning Assurance;
11. Data Governance;
12. Platform Operations.

---

## 11. Mapa de alto nível

```text
Identity and Access
        │
        ▼
Trip Management
 ├───────────────┐
 ▼               ▼
Traveler Profile Trip Collections
        │               │
        └──────┬────────┘
               ▼
        Itinerary Planning
          │          │
          ▼          ▼
       Mobility   Planning Assurance
          │          ▲
          └────┬─────┘
               ▼
      Decision Intelligence
               │
               ▼
      Proposal Management

Place Catalog
   ├───────────────┬───────────────────┐
   ▼               ▼                   ▼
Trip Collections  Mobility   Decision Intelligence

Data Governance
→ transversal a Place Catalog, Mobility e Decision Intelligence

Platform Operations
→ transversal a todos os contextos
```

---

# Parte III — Identity and Access

## 12. Nome oficial

```text
Identity and Access
```

Identificador conceitual:

```text
IAM
```

---

## 13. Responsabilidades

* Conta;
* Usuário;
* autenticação;
* sessão;
* papéis;
* permissões;
* consentimentos;
* identidade externa;
* vínculo entre identidade externa e `UserId`.

---

## 14. Entidades e conceitos

* Account;
* User;
* Session;
* TripRole;
* Permission;
* Consent.

---

## 15. Invariantes próprias

* Conta ativa possui responsável;
* Usuário possui identidade interna;
* identidade externa não substitui `UserId`;
* autorização não depende da interface;
* o último owner de uma Viagem não pode ser removido sem transferência.

A última regra poderá ser coordenada com Trip Management.

---

## 16. Dados de propriedade

Identity and Access possui autoridade sobre:

* Conta;
* Usuário;
* sessão;
* credenciais ou referência ao provedor;
* consentimentos;
* identidade externa.

Não possui autoridade sobre:

* Viajante;
* Viagem;
* Roteiro;
* Preferências da Viagem.

---

## 17. Contratos expostos

### Comandos

* RegisterUser;
* AuthenticateUser;
* RevokeSession;
* UpdateUserProfile;
* RecordConsent.

### Consultas

* GetCurrentUser;
* GetUserIdentity;
* ValidateSession;
* ListUserPermissions.

### Eventos

* UserRegistered;
* UserProfileUpdated;
* SessionRevoked;
* ConsentRecorded.

---

## 18. Dependências

Pode depender de:

* Platform Operations;
* provedor externo de identidade por adapter.

Não deve depender de:

* Itinerary Planning;
* Place Catalog;
* Mobility;
* Decision Intelligence.

---

# Parte IV — Trip Management

## 19. Nome oficial

```text
Trip Management
```

---

## 20. Responsabilidades

* criação da Viagem;
* nome;
* Destino;
* Período;
* Hospedagem;
* status;
* participantes;
* ownership da Viagem;
* alterações estruturais;
* cancelamento;
* arquivamento;
* exclusão.

---

## 21. Entidades e objetos

* Trip;
* Destination;
* TripPeriod;
* Accommodation;
* TripParticipant;
* TripStatus.

---

## 22. Agregado principal

```text
Trip
```

---

## 23. Invariantes próprias

* Viagem planejável possui Destino;
* Período válido;
* pelo menos um Viajante;
* pelo menos um owner;
* data final não precede data inicial;
* alterações estruturais produzem impacto explícito;
* arquivamento, cancelamento e exclusão são distintos.

---

## 24. Dados de propriedade

Trip Management possui:

* estado canônico da Viagem;
* Destino;
* Período;
* Hospedagem;
* participantes;
* owner;
* status;
* versão de contexto.

Não possui:

* Atividades;
* Lugares;
* Recomendações;
* Propostas;
* Estimativas de Deslocamento.

---

## 25. Contratos expostos

### Comandos

* CreateTrip;
* CompleteTripDraft;
* UpdateTripName;
* UpdateTripDestination;
* UpdateTripPeriod;
* UpdateAccommodation;
* AssignTripOwner;
* UpdateTripRole;
* CancelTrip;
* ArchiveTrip;
* DeleteTrip.

### Consultas

* GetTrip;
* ListTrips;
* GetTripContext;
* GetTripPermissions;
* GetTripStructuralImpact.

### Eventos

* TripCreated;
* TripDestinationChanged;
* TripPeriodChanged;
* TripAccommodationChanged;
* TripCancelled;
* TripArchived;
* TripDeleted.

---

## 26. Dependências

Pode consultar:

* Identity and Access;
* Traveler Profile.

Publica Eventos consumidos por:

* Itinerary Planning;
* Mobility;
* Decision Intelligence;
* Proposal Management;
* Planning Assurance.

---

# Parte V — Traveler Profile

## 27. Nome oficial

```text
Traveler Profile
```

---

## 28. Responsabilidades

* Viajantes;
* Perfil do Grupo;
* Preferências da Viagem;
* Interesses;
* Ritmo;
* Orçamento;
* Restrições;
* transporte predominante;
* necessidades funcionais.

---

## 29. Conceitos principais

* Traveler;
* GroupProfile;
* TripPreference;
* Interest;
* Restriction;
* Pace;
* Budget;
* TravelerNeed;
* TransportMode preference.

---

## 30. Invariantes próprias

* Viajante pertence a uma Viagem;
* dados pessoais devem ser minimizados;
* Restrição obrigatória não pode ser ignorada silenciosamente;
* Perfil do Grupo é derivado;
* Orçamento monetário possui moeda;
* Ritmo é orientação, não regra absoluta.

---

## 31. Dados de propriedade

Traveler Profile possui:

* Viajantes;
* Preferências;
* Restrições;
* Perfil do Grupo;
* Ritmo;
* Orçamento.

Não possui:

* Conta;
* Usuário;
* Lugar;
* Atividade;
* Recomendação.

---

## 32. Contratos expostos

### Comandos

* AddTraveler;
* RemoveTraveler;
* UpdateTraveler;
* AddTripInterest;
* RemoveTripInterest;
* UpdateTripBudget;
* UpdateTripPace;
* AddTripRestriction;
* RemoveTripRestriction;
* UpdatePreferredTransportMode.

### Consultas

* GetTravelers;
* GetGroupProfile;
* GetTripPreferences;
* GetMandatoryRestrictions;
* GetDecisionPreferences.

### Eventos

* TravelerAdded;
* TravelerRemoved;
* GroupProfileUpdated;
* TripInterestAdded;
* TripBudgetChanged;
* TripPaceChanged;
* TripRestrictionAdded;
* TripRestrictionRemoved.

---

## 33. Dependências

Depende de:

* Trip Management para validar a Viagem;
* Platform Operations.

É consumido por:

* Decision Intelligence;
* Proposal Management;
* Planning Assurance;
* Itinerary Planning.

---

# Parte VI — Place Catalog

## 34. Nome oficial

```text
Place Catalog
```

---

## 35. Responsabilidades

* identidade interna de Lugar;
* Catálogo de Lugares;
* categorias;
* Detalhes;
* estado operacional;
* horários;
* preços;
* imagens;
* avaliações;
* acessibilidade;
* reconciliação de fontes;
* criação de Lugar personalizado.

---

## 36. Conceitos principais

* Place;
* PlaceCategory;
* PlaceDetails;
* OpeningHours;
* PriceRange;
* Rating;
* PlaceAccessibility;
* ExternalId;
* PlaceOperationalStatus.

---

## 37. Agregado principal

```text
Place
```

---

## 38. Invariantes próprias

* identidade interna não depende apenas de provedor;
* dado ausente não recebe valor enganoso;
* ausência de preço não significa gratuidade;
* ausência de avaliação não significa nota zero;
* estado desconhecido não significa aberto;
* consolidação preserva Proveniência.

---

## 39. Dados de propriedade

Place Catalog possui:

* Lugar;
* identificação;
* categorias;
* Detalhes;
* status operacional;
* identificadores externos;
* metadados das informações.

Não possui:

* estado Salvo por Viagem;
* estado Planejado;
* Atividade;
* score de Recomendação.

---

## 40. Contratos expostos

### Comandos

* CreateCustomPlace;
* UpdateCustomPlace;
* ImportPlace;
* ReconcilePlace;
* MergePlaces;
* MarkPlaceTemporarilyClosed;
* MarkPlacePermanentlyClosed.

### Consultas

* GetPlace;
* SearchPlaces;
* GetPlaceDetails;
* ResolvePlaceIds;
* CheckPlaceAvailability.

### Eventos

* PlaceCreated;
* PlaceDataUpdated;
* PlaceMerged;
* PlaceMarkedTemporarilyClosed;
* PlaceMarkedPermanentlyClosed;
* PlaceDataConflictDetected.

---

## 41. Dependências

Pode depender de:

* Data Governance;
* provedores externos por adapters;
* Platform Operations.

É consumido por:

* Trip Collections;
* Itinerary Planning;
* Mobility;
* Decision Intelligence;
* Proposal Management;
* Planning Assurance.

---

# Parte VII — Trip Collections

## 42. Nome oficial

```text
Trip Collections
```

---

## 43. Responsabilidades

* Lugares Salvos;
* observações sobre Lugares;
* tags futuras;
* origem do salvamento;
* coleções contextuais da Viagem.

No MVP, seu principal objeto será `SavedPlace`.

---

## 44. Conceitos principais

* SavedPlace;
* SavedPlaceNote;
* SavedPlaceOrigin;
* TripCollection.

---

## 45. Invariantes próprias

* um Lugar é salvo no máximo uma vez por Viagem;
* salvar é idempotente;
* salvar não cria Atividade;
* remover dos Salvos não remove Atividade;
* Planejado é estado derivado externo ao módulo.

---

## 46. Dados de propriedade

Trip Collections possui:

* associação `TripId + PlaceId`;
* data de salvamento;
* origem;
* observações;
* metadados próprios da coleção.

Não possui:

* Lugar;
* Roteiro;
* Atividade;
* Recomendação.

---

## 47. Contratos expostos

### Comandos

* SavePlace;
* UnsavePlace;
* UpdateSavedPlaceNote.

### Consultas

* ListSavedPlaces;
* IsPlaceSaved;
* GetSavedPlace;
* ListSavedPlaceIds.

### Eventos

* PlaceSaved;
* PlaceUnsaved;
* SavedPlaceNoteUpdated.

---

## 48. Dependências

Depende de:

* Trip Management;
* Place Catalog.

É consumido por:

* Decision Intelligence;
* Proposal Management;
* frontend de exploração;
* projeções de Visão Geral.

---

# Parte VIII — Itinerary Planning

## 49. Nome oficial

```text
Itinerary Planning
```

---

## 50. Responsabilidades

* Roteiro atual;
* Dias da Viagem;
* Atividades;
* Períodos Livres;
* ordenação;
* versões;
* planejamento parcial;
* aplicação de itens aceitos de Proposta;
* estado Planejado derivado.

---

## 51. Conceitos principais

* Itinerary;
* TripDay;
* Activity;
* FreePeriod;
* ActivityOrder;
* ItineraryVersion;
* ActivityFlexibility.

---

## 52. Agregado principal

```text
Itinerary
```

---

## 53. Invariantes próprias

* uma Viagem possui no máximo um Roteiro atual;
* Atividade pertence a um Dia da mesma Viagem;
* título de Atividade é obrigatório;
* duração, quando informada, é positiva;
* ordem é determinística;
* Atividade sem horário é válida;
* Período Livre protegido não pode ser preenchido automaticamente;
* alteração canônica gera nova versão.

---

## 54. Dados de propriedade

Itinerary Planning possui:

* Roteiro;
* Dias;
* Atividades;
* Períodos Livres;
* versão;
* ordem;
* estado das Atividades.

Não possui:

* Detalhes completos do Lugar;
* Estimativas;
* Recomendações;
* definição dos Conflitos;
* Preferências.

---

## 55. Contratos expostos

### Comandos

* InitializeItinerary;
* AddActivity;
* UpdateActivity;
* RemoveActivity;
* MoveActivity;
* MoveActivityToAnotherDay;
* CompleteActivity;
* SkipActivity;
* CancelActivity;
* AddFreePeriod;
* UpdateFreePeriod;
* RemoveFreePeriod;
* MarkTripDayFree;
* ApplyProposalItems.

### Consultas

* GetItinerary;
* GetTripDay;
* ListActivities;
* GetItineraryVersion;
* GetPlanningSnapshot;
* IsPlacePlanned.

### Eventos

* ItineraryInitialized;
* ActivityAdded;
* ActivityUpdated;
* ActivityMoved;
* ActivityRemoved;
* FreePeriodAdded;
* FreePeriodProtected;
* ItineraryVersionChanged;
* ItineraryMarkedOutdated.

---

## 56. Dependências

Depende de:

* Trip Management;
* Place Catalog por identidade;
* Platform Operations.

Publica Eventos consumidos por:

* Mobility;
* Planning Assurance;
* Decision Intelligence;
* Proposal Management;
* Trip Collections para projeções derivadas.

---

# Parte IX — Mobility

## 57. Nome oficial

```text
Mobility
```

---

## 58. Responsabilidades

* Estimativas de Deslocamento;
* Distância;
* Tempo de Deslocamento;
* Meio de Transporte;
* origem;
* destino;
* validade;
* rotas;
* integração com provedores geográficos;
* fallback geográfico.

---

## 59. Conceitos principais

* TravelLeg;
* TravelEstimate;
* Distance;
* TravelTime;
* TransportMode;
* TravelOrigin;
* TravelDestination;
* Route;
* EstimateValidity.

---

## 60. Invariantes próprias

* Estimativa possui origem;
* Estimativa possui destino;
* Estimativa possui Meio de Transporte;
* valor estimado deve ser identificado;
* mudança de origem, destino ou transporte invalida Estimativa;
* precisão não pode exceder a Fonte;
* falha de rota não remove Atividade.

---

## 61. Dados de propriedade

Mobility possui:

* Estimativas;
* estado do cálculo;
* Proveniência específica;
* validade;
* rota externa normalizada;
* cache de cálculos, quando aplicável.

Não possui:

* Atividade;
* Lugar;
* Hospedagem;
* Preferência.

Recebe somente referências necessárias.

---

## 62. Contratos expostos

### Comandos

* RequestTravelEstimate;
* RefreshTravelEstimate;
* InvalidateTravelEstimates;
* RecalculateItineraryTravel.

### Consultas

* GetTravelEstimate;
* GetTravelEstimatesForDay;
* GetDistanceFromAccommodation;
* GetRouteSummary.

### Eventos

* TravelEstimateRequested;
* TravelEstimateCalculated;
* TravelEstimateMarkedStale;
* TravelEstimateUnavailable;
* TravelEstimateFailed.

---

## 63. Dependências

Depende de:

* Place Catalog para Localização;
* Trip Management para Hospedagem;
* Itinerary Planning para sequência;
* Data Governance;
* provedores externos por adapters.

É consumido por:

* Planning Assurance;
* Decision Intelligence;
* Proposal Management;
* frontend de Mapa e Roteiro.

---

# Parte X — Decision Intelligence

## 64. Nome oficial

```text
Decision Intelligence
```

---

## 65. Responsabilidades

* construção do Contexto de Decisão;
* geração de Recomendações;
* Justificativas;
* ranking;
* diversidade;
* validade;
* aceitação e rejeição como sinais;
* orquestração de IA para decisão;
* validação de saída probabilística.

---

## 66. Conceitos principais

* Recommendation;
* DecisionContext;
* RecommendationReason;
* RecommendationScore;
* RecommendationValidity;
* RecommendationFeedback.

---

## 67. Invariantes próprias

* Recomendação personalizada possui contexto;
* Recomendação possui Justificativa;
* Restrição obrigatória tem precedência;
* score não substitui Justificativa;
* Recomendação não altera estado canônico;
* mudança material de contexto invalida Recomendação;
* saída de IA passa por validação determinística.

---

## 68. Dados de propriedade

Decision Intelligence possui:

* Recomendações;
* Justificativas;
* scores;
* Contexto de Decisão registrado;
* validade;
* feedback de aceitação e rejeição;
* metadados de geração.

Não possui:

* Viagem;
* Roteiro;
* Lugar;
* Preferências;
* Atividade.

Mantém referências e snapshots controlados.

---

## 69. Contratos expostos

### Comandos

* RequestRecommendations;
* AcceptRecommendation;
* RejectRecommendation;
* InvalidateRecommendations.

### Consultas

* GetRecommendations;
* GetRecommendation;
* ExplainRecommendation;
* GetRecommendationContext.

### Eventos

* RecommendationRequested;
* RecommendationGenerated;
* RecommendationAccepted;
* RecommendationRejected;
* RecommendationExpired;
* RecommendationInvalidated.

---

## 70. Dependências

Depende de:

* Trip Management;
* Traveler Profile;
* Place Catalog;
* Trip Collections;
* Itinerary Planning;
* Mobility;
* Data Governance;
* AI adapters.

É consumido por:

* Proposal Management;
* interfaces de exploração;
* Visão Geral.

---

# Parte XI — Proposal Management

## 71. Nome oficial

```text
Proposal Management
```

---

## 72. Responsabilidades

* solicitação de Proposta;
* geração;
* armazenamento;
* versão base;
* critérios;
* Dias propostos;
* Atividades propostas;
* aceitação integral;
* aceitação parcial;
* expiração;
* rejeição;
* substituição;
* integração com Itinerary Planning.

---

## 73. Conceitos principais

* ItineraryProposal;
* ProposedDay;
* ProposedActivity;
* ProposalStatus;
* ProposalSelection;
* BaseItineraryVersion.

---

## 74. Agregado principal

```text
ItineraryProposal
```

---

## 75. Invariantes próprias

* Proposta referencia versão base;
* Proposta não altera Roteiro enquanto não aceita;
* aceitação é explícita;
* aceitação parcial aplica apenas itens selecionados;
* Proposta expirada não pode ser aplicada;
* Período Livre protegido deve ser respeitado;
* Atividade fixa não pode ser movida automaticamente;
* falha preserva Roteiro e Proposta anterior válida.

---

## 76. Dados de propriedade

Proposal Management possui:

* Proposta;
* status;
* conteúdo proposto;
* critérios;
* conflitos da Proposta;
* versão base;
* seleção;
* histórico da geração.

Não possui:

* Roteiro atual;
* Atividade canônica;
* regras de Lugar;
* Preferências canônicas.

---

## 77. Contratos expostos

### Comandos

* RequestItineraryProposal;
* CancelProposalGeneration;
* AcceptItineraryProposal;
* AcceptItineraryProposalPartially;
* RejectItineraryProposal;
* RegenerateItineraryProposal;
* ExpireProposal.

### Consultas

* GetItineraryProposal;
* ListItineraryProposals;
* GetCurrentProposal;
* GetProposalImpact;
* ValidateProposalApplicability.

### Eventos

* ItineraryProposalRequested;
* ItineraryProposalGenerated;
* ItineraryProposalGenerationFailed;
* ItineraryProposalAccepted;
* ItineraryProposalPartiallyAccepted;
* ItineraryProposalRejected;
* ItineraryProposalExpired;
* ItineraryProposalSuperseded.

---

## 78. Dependências

Depende de:

* Trip Management;
* Traveler Profile;
* Place Catalog;
* Trip Collections;
* Itinerary Planning;
* Mobility;
* Decision Intelligence;
* Planning Assurance;
* Data Governance.

A aplicação da Proposta deve ocorrer por contrato de Itinerary Planning.

Proposal Management não deve alterar tabelas do Roteiro diretamente.

---

# Parte XII — Planning Assurance

## 79. Nome oficial

```text
Planning Assurance
```

---

## 80. Responsabilidades

* detecção de Conflitos;
* classificação;
* severidade;
* evidências;
* resolução;
* ignorar Riscos;
* invalidação;
* revisão do Roteiro;
* validação de Propostas;
* políticas de viabilidade.

---

## 81. Conceitos principais

* Conflict;
* PlanningError;
* PlanningRisk;
* PlanningSuggestion;
* ConflictEvidence;
* ConflictRule;
* ConflictResolution.

---

## 82. Invariantes próprias

* Conflito possui objeto afetado;
* possui regra;
* possui evidência;
* possui severidade;
* Erro bloqueante não pode ser ignorado;
* Risco ignorado é auditável;
* resolução exige remoção da condição;
* invalidação difere de resolução.

---

## 83. Dados de propriedade

Planning Assurance possui:

* Conflitos;
* estado;
* severidade;
* evidências;
* decisões de ignorar;
* regras aplicadas;
* versão do contexto analisado.

Não possui:

* Atividade;
* Roteiro;
* Estimativa;
* Proposta.

Mantém referências.

---

## 84. Contratos expostos

### Comandos

* ReviewItinerary;
* ReviewProposal;
* DetectConflicts;
* ResolveConflict;
* IgnoreRisk;
* RestoreIgnoredRisk;
* InvalidateConflicts.

### Consultas

* ListConflicts;
* GetConflict;
* GetConflictSummary;
* ValidatePlanningOperation;
* GetBlockingConflicts.

### Eventos

* ConflictDetected;
* ConflictResolved;
* ConflictIgnored;
* ConflictInvalidated;
* ConflictSuperseded;
* ItineraryReviewCompleted.

---

## 85. Dependências

Depende de:

* Trip Management;
* Traveler Profile;
* Place Catalog;
* Itinerary Planning;
* Mobility;
* Proposal Management somente por snapshots de revisão.

É consumido por:

* Itinerary Planning;
* Proposal Management;
* interfaces de revisão.

---

# Parte XIII — Data Governance

## 86. Nome oficial

```text
Data Governance
```

---

## 87. Responsabilidades

* Fontes de Dados;
* Proveniência;
* confiança;
* Atualidade dos Dados;
* divergência;
* políticas de precedência;
* metadados de coleta;
* licenças;
* qualidade;
* lineage.

---

## 88. Conceitos principais

* DataSource;
* Provenance;
* ConfidenceLevel;
* DataFreshness;
* ConflictingData;
* ExternalId;
* DataQualityPolicy.

---

## 89. Invariantes próprias

* dado externo relevante possui origem;
* dado desconhecido não recebe valor enganoso;
* confiança não é certeza;
* divergências preservam fontes;
* dado gerado por IA não vira fato automaticamente;
* atualização não apaga histórico crítico.

---

## 90. Dados de propriedade

Data Governance possui:

* cadastro de Fontes;
* políticas;
* registros de Proveniência;
* metadados de qualidade;
* estado de atualização.

Dados de negócio permanecem em seus contextos de origem.

---

## 91. Contratos expostos

### Comandos

* RegisterDataSource;
* RecordProvenance;
* MarkDataStale;
* RecordDataConflict;
* ResolveDataConflict;
* UpdateDataQualityPolicy.

### Consultas

* GetProvenance;
* GetDataFreshness;
* GetConfidenceLevel;
* ListDataSources;
* EvaluateDataQuality.

### Eventos

* DataSourceRegistered;
* DataMarkedStale;
* DataConflictDetected;
* DataConflictResolved;
* ConfidenceLevelChanged.

---

## 92. Dependências

Pode depender apenas de:

* Platform Operations;
* integrações externas controladas.

É consumido por:

* Place Catalog;
* Mobility;
* Decision Intelligence;
* Proposal Management;
* Planning Assurance.

---

# Parte XIV — Platform Operations

## 93. Nome oficial

```text
Platform Operations
```

---

## 94. Responsabilidades

* IDs;
* Clock;
* transações;
* publicação de Eventos;
* jobs;
* observabilidade;
* logs;
* métricas;
* traces;
* configuração;
* cache;
* feature flags;
* segurança técnica;
* armazenamento;
* filas internas;
* resiliência.

---

## 95. Limite

Platform Operations não deverá possuir regras de negócio.

Não deverá decidir:

* se uma Proposta pode ser aceita;
* se uma Viagem é válida;
* se um Risco pode ser ignorado;
* se um Lugar deve ser recomendado.

---

## 96. Contratos transversais

* EventBus;
* UnitOfWork;
* Clock;
* IdGenerator;
* JobScheduler;
* Cache;
* Logger;
* Metrics;
* Tracer;
* FeatureFlagProvider;
* SecretProvider.

---

# Parte XV — Context Map

## 97. Tipos de relação

As relações entre Contextos poderão seguir padrões como:

* Customer–Supplier;
* Conformist;
* Anti-Corruption Layer;
* Open Host Service;
* Published Language;
* Shared Kernel;
* Separate Ways.

---

## 98. Identity and Access → Trip Management

Tipo:

```text
Customer–Supplier
```

Trip Management consome identidade e autorização.

Identity and Access fornece:

* `UserId`;
* sessão;
* permissões;
* identidade validada.

Trip Management mantém papéis específicos da Viagem.

---

## 99. Trip Management → Itinerary Planning

Tipo:

```text
Customer–Supplier
```

Trip Management fornece:

* TripId;
* Período;
* versão de contexto;
* status.

Itinerary Planning reage a mudanças estruturais por Eventos.

---

## 100. Place Catalog → consumidores

Tipo:

```text
Open Host Service
+ Published Language
```

Place Catalog deverá expor contratos internos estáveis para:

* Itinerary Planning;
* Trip Collections;
* Mobility;
* Decision Intelligence.

---

## 101. Provedores externos → Place Catalog

Tipo:

```text
Anti-Corruption Layer
```

Place Catalog traduz modelos externos para o modelo interno.

---

## 102. Itinerary Planning → Mobility

Tipo:

```text
Customer–Supplier
```

Itinerary Planning fornece sequência e referências.

Mobility fornece Estimativas.

---

## 103. Traveler Profile → Decision Intelligence

Tipo:

```text
Customer–Supplier
```

Decision Intelligence depende de Preferências e Restrições, mas não altera seus dados.

---

## 104. Decision Intelligence → Proposal Management

Tipo:

```text
Customer–Supplier
```

Proposal Management poderá utilizar Recomendações, rankings e Justificativas.

---

## 105. Proposal Management → Itinerary Planning

Tipo:

```text
Application Contract
```

Proposal Management solicita aplicação.

Itinerary Planning valida e modifica o Roteiro.

Não há acesso direto à persistência.

---

## 106. Planning Assurance → Itinerary Planning

Tipo:

```text
Policy Provider
```

Planning Assurance identifica bloqueios e riscos.

Itinerary Planning continua responsável pela integridade do Roteiro.

---

## 107. Data Governance → Contextos de dados externos

Tipo:

```text
Shared Policy
```

Data Governance fornece regras e metadados, sem possuir os dados de negócio.

---

# Parte XVI — Dependências permitidas

## 108. Matriz principal

| Origem                | Destino permitido                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identity and Access   | Platform Operations                                                                                                                                          |
| Trip Management       | Identity and Access, Traveler Profile, Platform Operations                                                                                                   |
| Traveler Profile      | Trip Management, Platform Operations                                                                                                                         |
| Place Catalog         | Data Governance, Platform Operations                                                                                                                         |
| Trip Collections      | Trip Management, Place Catalog, Platform Operations                                                                                                          |
| Itinerary Planning    | Trip Management, Place Catalog, Platform Operations                                                                                                          |
| Mobility              | Trip Management, Place Catalog, Itinerary Planning, Data Governance, Platform Operations                                                                     |
| Decision Intelligence | Trip Management, Traveler Profile, Place Catalog, Trip Collections, Itinerary Planning, Mobility, Data Governance                                            |
| Proposal Management   | Trip Management, Traveler Profile, Place Catalog, Trip Collections, Itinerary Planning, Mobility, Decision Intelligence, Planning Assurance, Data Governance |
| Planning Assurance    | Trip Management, Traveler Profile, Place Catalog, Itinerary Planning, Mobility, Platform Operations                                                          |
| Data Governance       | Platform Operations                                                                                                                                          |

---

## 109. Dependências proibidas

Exemplos:

* Place Catalog depender de Itinerary Planning;
* Identity and Access depender de Viagem;
* Platform Operations depender de regras de domínio;
* Mobility alterar Atividade diretamente;
* Decision Intelligence persistir Preferências;
* Proposal Management alterar Roteiro diretamente;
* frontend acessar persistência;
* um módulo acessar repositório privado de outro módulo.

---

## 110. Dependência bidirecional

Dependência bidirecional direta deverá ser proibida.

Quando houver necessidade de reação mútua, utilizar:

* Evento;
* orquestração de aplicação;
* contrato de leitura;
* módulo coordenador;
* projeção.

---

# Parte XVII — Comunicação síncrona

## 111. Quando utilizar

Comunicação síncrona será adequada quando:

* o resultado for necessário para concluir o caso de uso;
* a validação fizer parte da operação;
* o dado precisar estar atualizado;
* a falha impedir legitimamente a ação.

---

## 112. Exemplos

```text
AddActivity
→ validar TripId
→ validar TripDay
→ validar PlaceId opcional
→ persistir Activity
```

```text
AcceptProposal
→ validar versão base
→ consultar bloqueios
→ aplicar itens
```

---

## 113. Regras

* utilizar contratos explícitos;
* evitar chamadas profundas;
* evitar cadeia longa de módulos;
* evitar exposição de entidades internas;
* utilizar DTOs de aplicação;
* propagar `correlationId`.

---

## 114. Limite de profundidade

Fluxos síncronos com múltiplos saltos deverão ser revisados.

Exemplo de risco:

```text
A → B → C → D → provedor externo
```

Alternativas:

* orquestração;
* consulta agregada;
* Evento;
* projeção;
* processamento assíncrono.

---

# Parte XVIII — Comunicação assíncrona

## 115. Quando utilizar

Adequada para:

* efeitos secundários;
* recálculos;
* invalidações;
* geração de Proposta;
* Recomendações;
* atualização de busca;
* analytics;
* notificações;
* ingestão de dados.

---

## 116. Eventos principais entre módulos

```text
TripCreated
TripDestinationChanged
TripPeriodChanged
TripAccommodationChanged
TravelerAdded
TripRestrictionAdded
PlaceSaved
PlaceUnsaved
PlaceMarkedPermanentlyClosed
ActivityAdded
ActivityMoved
ActivityRemoved
ItineraryVersionChanged
TravelEstimateCalculated
RecommendationGenerated
ItineraryProposalAccepted
ConflictDetected
```

---

## 117. Publicação confiável

Eventos dependentes de persistência deverão utilizar estratégia consistente, como:

* after-commit confiável;
* transactional outbox;
* fila persistida.

A definição final ocorrerá em documento posterior.

---

## 118. Consumidores idempotentes

Todo consumidor deverá:

* reconhecer `eventId`;
* evitar efeito duplicado;
* lidar com retry;
* registrar falha;
* preservar ordem quando necessária.

---

## 119. Consistência eventual

Exemplos aceitáveis:

* Distância aparece depois da Atividade;
* Recomendação atualiza após mudança;
* Conflito é reavaliado após movimento;
* projeção da Visão Geral atualiza com pequeno atraso.

Invariantes essenciais não deverão depender de consistência eventual.

---

# Parte XIX — APIs internas

## 120. Princípio

Cada módulo deverá expor uma API interna mínima.

A API poderá conter:

* comandos;
* consultas;
* tipos públicos;
* Eventos publicados.

---

## 121. Interface pública do módulo

Estrutura conceitual:

```text
module/
├── public/
│   ├── commands/
│   ├── queries/
│   ├── events/
│   └── contracts/
├── domain/
├── application/
├── infrastructure/
└── internal/
```

---

## 122. Elementos privados

Não deverão ser importados externamente:

* entidades;
* repositórios;
* serviços internos;
* ORM models;
* mappers;
* regras privadas;
* adapters.

---

## 123. DTOs internos

DTOs deverão:

* representar necessidade do consumidor;
* possuir estabilidade;
* evitar estado completo;
* evitar dependência de ORM;
* utilizar termos canônicos;
* ser versionados quando necessário.

---

## 124. Repositórios

Repositórios são privados ao módulo.

Exemplo proibido:

```text
ProposalModule
→ ItineraryRepository.save(...)
```

Correto:

```text
ProposalModule
→ ApplyProposalItems command
→ ItineraryModule
```

---

# Parte XX — Persistência modular

## 125. Ownership de tabelas

Cada tabela ou coleção deverá possuir owner único.

Outros módulos não deverão escrever diretamente.

---

## 126. Leitura entre módulos

Opções permitidas:

1. consulta pela API interna;
2. projeção;
3. view controlada;
4. réplica de leitura;
5. Evento;
6. snapshot.

---

## 127. Banco compartilhado

No Monólito Modular, um banco compartilhado é permitido.

Isso não autoriza:

* joins indiscriminados entre módulos;
* foreign keys controladas por qualquer módulo;
* escrita cruzada;
* uso de ORM models externos.

---

## 128. Schemas lógicos

Estrutura conceitual:

```text
identity.*
trips.*
travelers.*
places.*
collections.*
itinerary.*
mobility.*
recommendations.*
proposals.*
assurance.*
data_governance.*
platform.*
```

A implementação real dependerá da tecnologia escolhida.

---

## 129. Integridade referencial

Referências entre módulos poderão utilizar IDs sem navegação direta de objeto.

A validação deverá ocorrer por contrato ou consistência controlada.

---

## 130. Transações

Transações deverão permanecer preferencialmente dentro de um módulo ou agregado.

Fluxos entre módulos deverão ser coordenados por aplicação.

---

# Parte XXI — Projeções e modelos de leitura

## 131. Objetivo

A interface não deverá precisar compor dezenas de chamadas para apresentar uma tela.

Poderão existir projeções específicas.

---

## 132. Projeções iniciais

* Trip Overview;
* Explore Results;
* Place Details View;
* Map View;
* Saved Places View;
* Itinerary Day View;
* Proposal Review View;
* Conflict Review View.

---

## 133. Ownership das projeções

Uma projeção poderá:

* pertencer ao módulo mais próximo;
* ser mantida por camada de leitura;
* consumir Eventos de vários módulos.

Não deverá se tornar fonte de escrita.

---

## 134. Atualização

Pode ser:

* síncrona;
* assíncrona;
* sob demanda;
* cacheada.

A estratégia dependerá da necessidade de consistência.

---

## 135. Estado desatualizado

Quando a projeção puder estar atrasada, o contrato deverá permitir informar:

* versão;
* momento da atualização;
* estado de processamento;
* possibilidade de refresh.

---

# Parte XXII — Orquestração de casos de uso

## 136. Casos simples

Podem ser tratados por um único módulo.

Exemplo:

```text
SavePlace
→ Trip Collections
```

---

## 137. Casos compostos

Devem ser orquestrados por serviço de aplicação.

Exemplo:

```text
AddPlaceToItinerary
1. validar acesso à Viagem;
2. validar Lugar;
3. criar Atividade;
4. publicar Evento;
5. solicitar cálculo de Deslocamento;
6. solicitar revisão de Conflitos.
```

---

## 138. Orquestrador

O orquestrador:

* coordena;
* não contém regras de domínio;
* chama contratos;
* controla transação quando possível;
* publica Eventos;
* trata falhas;
* preserva correlação.

---

## 139. Saga ou Process Manager

Poderá ser introduzido em fluxos longos.

Candidatos:

* geração de Proposta;
* exclusão da Viagem;
* ingestão de Lugar;
* recálculo de Roteiro;
* integração futura com Reserva.

---

# Parte XXIII — Geração de Proposta como processo modular

## 140. Fluxo

```text
Proposal Management
→ captura versão do Roteiro
→ obtém contexto da Viagem
→ obtém Perfil do Grupo
→ obtém Salvos
→ obtém Lugares
→ obtém Estimativas
→ solicita Recomendações
→ chama IA
→ valida saída
→ solicita revisão de Conflitos
→ persiste Proposta
```

---

## 141. Ownership do fluxo

Proposal Management é responsável pelo processo.

Não é responsável pelas regras internas dos demais módulos.

---

## 142. Snapshots

A Proposta deverá registrar snapshots suficientes para:

* explicar contexto;
* validar expiração;
* reproduzir decisões;
* auditar geração.

---

## 143. Aplicação

Ao aceitar:

```text
Proposal Management
→ ValidateProposalApplicability
→ ApplyProposalItems em Itinerary Planning
→ atualizar status da Proposta
```

---

## 144. Falha parcial

Falhas em:

* IA;
* Mobilidade;
* dados de Lugar;
* revisão;

deverão produzir resultado explícito.

A arquitetura poderá permitir Proposta parcial somente se a política de produto autorizar e as limitações forem claras.

---

# Parte XXIV — Recomendação como capacidade modular

## 145. Context Builder

Decision Intelligence deverá possuir componente responsável por construir `DecisionContext`.

Esse componente consulta contratos, não bancos externos diretamente.

---

## 146. Pipeline conceitual

```text
Coletar fatos
→ validar Proveniência
→ aplicar Restrições
→ gerar candidatos
→ calcular sinais
→ chamar IA quando necessário
→ validar saída
→ gerar Justificativas
→ persistir Recomendação
```

---

## 147. Regras determinísticas antes da IA

Devem ser aplicadas antes da apresentação:

* autorização;
* Restrição obrigatória;
* estado operacional conhecido;
* compatibilidade com Destino;
* validade dos IDs;
* disponibilidade mínima de dados.

---

## 148. Saída da IA

A IA não deverá retornar entidades completas.

Deverá retornar, quando possível:

* IDs candidatos;
* organização;
* razões;
* limitações;
* classificação;
* campos controlados.

---

# Parte XXV — Segurança entre módulos

## 149. Autorização contextual

Módulos que alteram dados de Viagem deverão validar autorização ou receber contexto já validado por mecanismo confiável.

---

## 150. Princípio de menor privilégio

Um módulo deverá acessar apenas:

* contratos necessários;
* dados necessários;
* operações permitidas.

---

## 151. Dados sensíveis

Traveler Profile, Identity and Access e Trip Management poderão conter dados sensíveis.

Outros módulos deverão receber somente informações minimizadas.

Exemplo:

```text
requiresStepFreeAccess = true
```

em vez de diagnóstico detalhado.

---

## 152. Logs

Nenhum módulo deverá registrar dados sensíveis sem finalidade.

---

## 153. IA

Decision Intelligence e Proposal Management deverão aplicar política de minimização antes de enviar contexto ao provedor de IA.

---

# Parte XXVI — Observabilidade modular

## 154. Identificação do módulo

Logs, métricas e traces deverão incluir:

```text
module
operation
correlationId
aggregateId
status
duration
```

---

## 155. Métricas por módulo

Exemplos:

### Trip Management

* Viagens criadas;
* alterações estruturais;
* falhas de validação.

### Place Catalog

* buscas;
* cache hit;
* divergências;
* falhas de provedor.

### Mobility

* latência;
* indisponibilidade;
* Estimativas desatualizadas;
* custo de provedor.

### Decision Intelligence

* Recomendações geradas;
* rejeições;
* custo de IA;
* falhas de validação.

### Proposal Management

* tempo de geração;
* falhas;
* taxa de aceitação;
* Propostas expiradas.

---

## 156. Tracing

Fluxos compostos deverão permitir rastrear transições entre módulos.

Exemplo:

```text
RequestItineraryProposal
→ Proposal Management
→ Decision Intelligence
→ Mobility
→ AI Provider
→ Planning Assurance
```

---

# Parte XXVII — Testes de arquitetura

## 157. Testes de dependência

Deverão validar:

* dependências permitidas;
* ausência de ciclos;
* domínio sem infraestrutura;
* repositórios privados;
* APIs internas respeitadas.

---

## 158. Testes de contrato

Cada módulo deverá possuir testes para:

* comandos;
* consultas;
* Eventos;
* integração interna;
* compatibilidade.

---

## 159. Testes de isolamento

Um módulo deverá ser testável com:

* banco isolado ou schema de teste;
* adapters falsos;
* Clock controlado;
* EventBus de teste;
* IDs determinísticos.

---

## 160. Testes de integração modular

Deverão cobrir:

* TripCreated inicializando Roteiro;
* alteração da Hospedagem invalidando Estimativas;
* ActivityMoved reavaliando Conflitos;
* PlaceUnsaved preservando Atividade;
* Proposta aceita aplicando itens uma única vez.

---

## 161. Fitness Functions

Exemplos:

* módulo não importa infraestrutura de outro;
* módulo não acessa repositório externo;
* Domain não importa framework;
* Eventos públicos seguem convenção;
* contratos internos possuem owner;
* ciclos de dependência falham o build.

---

# Parte XXVIII — Estrutura conceitual de código

## 162. Organização geral

```text
apps/api/src/modules/
├── identity-access/
├── trip-management/
├── traveler-profile/
├── place-catalog/
├── trip-collections/
├── itinerary-planning/
├── mobility/
├── decision-intelligence/
├── proposal-management/
├── planning-assurance/
├── data-governance/
└── platform-operations/
```

---

## 163. Estrutura interna

```text
trip-management/
├── public/
│   ├── commands/
│   ├── queries/
│   ├── events/
│   └── contracts/
├── domain/
│   ├── aggregates/
│   ├── entities/
│   ├── value-objects/
│   ├── policies/
│   └── events/
├── application/
│   ├── use-cases/
│   ├── handlers/
│   └── ports/
├── infrastructure/
│   ├── persistence/
│   ├── adapters/
│   └── messaging/
├── interfaces/
└── tests/
```

---

## 164. Importações públicas

Consumidores deverão importar apenas por ponto de entrada oficial.

Exemplo:

```text
modules/trip-management/public
```

Não deverão importar:

```text
modules/trip-management/domain/internal/*
```

---

# Parte XXIX — Estratégia de evolução

## 165. Módulo interno

Estado inicial de todas as capacidades.

Características:

* mesmo processo;
* mesma implantação;
* contrato interno;
* persistência logicamente isolada.

---

## 166. Módulo com processamento assíncrono

Uma capacidade poderá possuir worker próprio sem virar serviço independente.

Candidatos:

* Proposal Management;
* Mobility;
* Place Catalog;
* Decision Intelligence.

---

## 167. Serviço extraído

Um módulo poderá ser extraído quando houver evidência de:

* escala independente;
* carga elevada;
* isolamento de falha;
* ciclo de implantação diferente;
* equipe responsável própria;
* requisito de segurança;
* disponibilidade distinta;
* tecnologia especializada.

---

## 168. Critérios de extração

Antes da extração, verificar:

1. contrato já é explícito?
2. dados possuem owner claro?
3. Eventos estão definidos?
4. acoplamento síncrono é controlado?
5. existe necessidade operacional real?
6. a consistência eventual é aceitável?
7. o custo de rede é aceitável?
8. a observabilidade está preparada?

---

## 169. Candidatos potenciais

### Place Catalog

Pode exigir ingestão e busca em escala.

### Mobility

Pode ter alto volume e provedores específicos.

### Decision Intelligence

Pode demandar escalabilidade e custos próprios de IA.

### Proposal Management

Pode possuir jobs demorados e independentes.

### Platform Notifications futura

Pode possuir ciclo operacional próprio.

---

## 170. Contextos que não devem ser extraídos cedo

* Trip Management;
* Traveler Profile;
* Itinerary Planning.

Esses contextos possuem alta proximidade transacional no início.

---

# Parte XXX — Anti-patterns

## 171. Monólito distribuído

Não extrair serviços mantendo:

* banco compartilhado;
* chamadas síncronas excessivas;
* deploy coordenado;
* dependências circulares;
* ausência de autonomia.

---

## 172. Banco como API

Não integrar módulos por leitura direta de tabelas.

---

## 173. Shared Kernel excessivo

Não mover conceitos para `shared` apenas para evitar dependências.

---

## 174. Módulo por entidade

Não criar um módulo independente para cada entidade.

Exemplo inadequado:

```text
TripService
ActivityService
DayService
FreePeriodService
```

sem capacidade coesa.

---

## 175. Módulo técnico

Evitar módulos principais como:

* Controllers;
* Repositories;
* Services;
* Models.

Camadas técnicas devem existir dentro das capacidades.

---

## 176. Eventos genéricos

Evitar:

```text
EntityUpdated
DataChanged
ItemProcessed
```

quando houver fato de domínio específico.

---

## 177. Orquestrador com regras

O orquestrador não deverá decidir:

* se uma Restrição é obrigatória;
* se uma Proposta é válida;
* se um Dia pertence à Viagem.

Essas regras pertencem aos módulos de domínio.

---

## 178. Dependência de fornecedor

Não nomear módulo ou domínio com base em fornecedor externo.

Evitar:

```text
GooglePlacesModule
OpenAIModule
MapboxModule
```

Preferir:

```text
Place Catalog
Decision Intelligence
Mobility
```

---

## 179. IA acessando banco diretamente

Agentes e modelos não deverão consultar ou alterar persistência sem serviços de aplicação e contratos autorizados.

---

# Parte XXXI — Rastreabilidade

## 180. Contextos e entidades

| Contexto              | Entidades principais                     |
| --------------------- | ---------------------------------------- |
| Identity and Access   | Account, User, Session                   |
| Trip Management       | Trip, Accommodation, TripParticipant     |
| Traveler Profile      | Traveler                                 |
| Place Catalog         | Place                                    |
| Trip Collections      | SavedPlace                               |
| Itinerary Planning    | Itinerary, TripDay, Activity, FreePeriod |
| Mobility              | TravelEstimate                           |
| Decision Intelligence | Recommendation                           |
| Proposal Management   | ItineraryProposal                        |
| Planning Assurance    | Conflict                                 |
| Data Governance       | DataSource                               |

---

## 181. Contextos e superfícies

| Superfície        | Contextos principais                                   |
| ----------------- | ------------------------------------------------------ |
| Minhas Viagens    | Trip Management                                        |
| Criar Viagem      | Trip Management, Traveler Profile                      |
| Visão Geral       | Trip Management, Itinerary Planning, Trip Collections  |
| Explorar          | Place Catalog, Trip Collections, Decision Intelligence |
| Detalhes do Lugar | Place Catalog, Mobility                                |
| Mapa              | Place Catalog, Mobility                                |
| Salvos            | Trip Collections, Place Catalog                        |
| Roteiro           | Itinerary Planning, Mobility, Planning Assurance       |
| Proposta          | Proposal Management, Decision Intelligence             |
| Revisão           | Planning Assurance                                     |
| Configurações     | Trip Management, Traveler Profile                      |

---

## 182. Contextos e Eventos

| Evento                       | Produtor              | Consumidores principais                              |
| ---------------------------- | --------------------- | ---------------------------------------------------- |
| TripCreated                  | Trip Management       | Itinerary Planning, Traveler Profile                 |
| TripAccommodationChanged     | Trip Management       | Mobility, Decision Intelligence, Proposal Management |
| TravelerAdded                | Traveler Profile      | Decision Intelligence, Proposal Management           |
| PlaceSaved                   | Trip Collections      | Decision Intelligence, projeções                     |
| PlaceMarkedPermanentlyClosed | Place Catalog         | Itinerary Planning, Planning Assurance               |
| ActivityAdded                | Itinerary Planning    | Mobility, Planning Assurance                         |
| ActivityMoved                | Itinerary Planning    | Mobility, Planning Assurance                         |
| TravelEstimateCalculated     | Mobility              | Planning Assurance, Decision Intelligence            |
| RecommendationGenerated      | Decision Intelligence | Proposal Management                                  |
| ItineraryProposalAccepted    | Proposal Management   | Itinerary Planning, projeções                        |
| ConflictDetected             | Planning Assurance    | interfaces, Proposal Management                      |

---

# Parte XXXII — Critérios de aceite

## 183. Contextos

* contextos possuem responsabilidades claras;
* termos são consistentes;
* ownership está definido;
* dados possuem owner único;
* fronteiras são coerentes com o domínio.

---

## 184. Dependências

* dependências permitidas estão documentadas;
* dependências proibidas estão explícitas;
* ciclos são proibidos;
* acesso direto a repositórios externos é proibido;
* comunicação utiliza contratos.

---

## 185. Persistência

* banco compartilhado não implica ownership compartilhado;
* tabelas possuem owner;
* escrita cruzada é proibida;
* projeções não são fonte canônica;
* transações respeitam agregados.

---

## 186. IA

* Decision Intelligence possui ownership das Recomendações;
* Proposal Management possui ownership das Propostas;
* IA não altera o Roteiro diretamente;
* saídas são validadas;
* dados enviados são minimizados.

---

## 187. Evolução

* critérios de extração estão definidos;
* microservices não são obrigatórios;
* módulos podem possuir workers;
* contratos preparam extração futura;
* complexidade deve ser justificada.

---

## 188. Qualidade

* testes de arquitetura estão previstos;
* contratos possuem testes;
* observabilidade identifica módulos;
* segurança respeita fronteiras;
* Eventos são rastreáveis.

---

# Parte XXXIII — Governança

## 189. Owner

O owner deste documento é:

```text
Architecture
```

A manutenção deverá envolver:

* Domain;
* Backend;
* Frontend;
* Data;
* AI;
* Security;
* QA;
* Product.

---

## 190. Inclusão de novo Contexto Delimitado

Uma proposta deverá conter:

* problema;
* capacidade;
* linguagem;
* modelo;
* owner;
* dados;
* contratos;
* dependências;
* Eventos;
* justificativa;
* impacto;
* alternativas.

---

## 191. Inclusão de novo módulo

Um novo módulo deverá:

* possuir responsabilidade coesa;
* ter owner;
* não duplicar capacidade;
* possuir API pública;
* possuir dados próprios ou responsabilidade explícita;
* possuir testes;
* respeitar dependências.

---

## 192. Alteração de fronteira

Mudanças deverão revisar:

* Modelo de Domínio;
* Regras de Negócio;
* Eventos;
* APIs;
* persistência;
* ownership;
* observabilidade;
* segurança;
* testes;
* documentação.

---

## 193. Exceções

Exceções deverão possuir:

* justificativa;
* owner;
* prazo;
* risco;
* mitigação;
* plano de convergência.

---

## 194. ADR obrigatório

Deverá ser criado ADR quando:

* um Contexto for dividido;
* Contextos forem fundidos;
* módulo virar serviço;
* ownership de dados mudar;
* comunicação síncrona virar assíncrona;
* um Shared Kernel for criado;
* banco for separado.

---

## 195. Uso por agentes de IA

Agentes de engenharia deverão:

* identificar o Contexto responsável;
* utilizar somente contratos públicos;
* não importar elementos internos;
* não criar dependência circular;
* não acessar persistência externa;
* não mover regra para Platform;
* não criar módulo por conveniência;
* registrar lacunas;
* recomendar ADR quando necessário;
* gerar testes de arquitetura.

---

## 196. Checklist de revisão

Antes de aprovar este documento, verificar:

* conceitos arquiteturais estão definidos;
* Contextos Delimitados estão identificados;
* responsabilidades estão claras;
* ownership está definido;
* dados de propriedade estão definidos;
* contratos estão definidos;
* dependências estão definidas;
* Context Map está definido;
* comunicação síncrona está definida;
* comunicação assíncrona está definida;
* APIs internas estão definidas;
* persistência modular está definida;
* projeções estão definidas;
* orquestração está definida;
* Propostas estão contempladas;
* Recomendações estão contempladas;
* segurança está contemplada;
* observabilidade está contemplada;
* testes estão contemplados;
* evolução está definida;
* anti-patterns estão definidos;
* rastreabilidade está presente;
* governança está definida.

---

## 197. Declaração final

A Arquitetura de Módulos e Contextos Delimitados estabelece as fronteiras internas oficiais do RouteBook.

Ela define:

* quem possui cada conceito;
* onde cada regra deve existir;
* quais dados pertencem a cada módulo;
* como os módulos podem se comunicar;
* quais dependências são permitidas;
* quais acessos são proibidos;
* como capacidades podem evoluir.

O RouteBook deverá iniciar como um Monólito Modular, mas suas fronteiras deverão ser tratadas com a mesma disciplina exigida em uma arquitetura distribuída.

Cada módulo deverá possuir:

* responsabilidade coesa;
* ownership;
* contratos;
* dados controlados;
* Eventos;
* testes;
* observabilidade.

Nenhum módulo deverá modificar diretamente o estado interno de outro módulo.

A colaboração deverá ocorrer por:

* Comandos;
* Consultas;
* Eventos;
* portas;
* projeções;
* contratos explícitos.

Essa disciplina permitirá que o RouteBook permaneça simples no início e preparado para evoluir sem perder integridade arquitetural.
