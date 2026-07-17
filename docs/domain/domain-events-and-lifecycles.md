---

id: RB-DOM-004

title: Eventos de Domínio e Ciclos de Vida
description: Define os eventos de domínio, comandos, transições de estado, ciclos de vida, efeitos, invalidações e regras temporais das principais entidades e agregados do RouteBook.

document_type: domain
owner: Domain

status: Draft
version: "0.1.0"

created: "2026-07-17"
last_updated: null

authors:

- RouteBook Team

tags:

- domain
- domain-events
- lifecycle
- state-transitions
- commands
- event-driven
- ai-first
- travel-planning

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

prerequisites:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
- RB-DOM-001
- RB-DOM-002
- RB-DOM-003

next_documents:

- RB-ARC-001
- RB-DATA-001
- RB-API-001
- RB-QA-001

ai_context:
priority: critical
index: true
---

# RouteBook — Eventos de Domínio e Ciclos de Vida

## 1. Propósito deste documento

Este documento define os eventos de domínio e os ciclos de vida oficiais do RouteBook.

Seu objetivo é estabelecer como os principais conceitos do produto:

* nascem;
* mudam;
* produzem efeitos;
* tornam-se inválidos;
* expiram;
* são concluídos;
* são cancelados;
* são arquivados;
* são removidos.

Este documento também define:

* comandos conceituais;
* eventos de domínio;
* transições de estado;
* pré-condições;
* pós-condições;
* efeitos derivados;
* invalidações;
* reprocessamentos;
* idempotência;
* correlação;
* causalidade;
* consistência;
* temporalidade;
* auditoria.

Ele deverá orientar:

* arquitetura;
* aplicação;
* domínio;
* persistência;
* mensageria;
* APIs;
* integrações;
* processamento assíncrono;
* IA;
* analytics;
* auditoria;
* QA;
* observabilidade;
* agentes autônomos.

Este documento não define:

* tecnologia de mensageria;
* formato final de payload;
* tópicos;
* filas;
* bancos de dados;
* endpoints;
* classes;
* framework;
* estratégia de event sourcing;
* infraestrutura de processamento.

---

## 2. Relação com os documentos anteriores

A sequência da Epic Domain é:

```text
RB-DOM-001 — Modelo de Domínio
→ define os conceitos e agregados

RB-DOM-002 — Linguagem Ubíqua
→ define os nomes oficiais

RB-DOM-003 — Regras de Negócio e Invariantes
→ define limites e validações

RB-DOM-004 — Eventos de Domínio e Ciclos de Vida
→ define mudanças, transições e efeitos
```

Os eventos e ciclos de vida definidos aqui deverão respeitar integralmente as invariantes de `RB-DOM-003`.

---

## 3. Objetivos

Este documento deverá:

1. tornar mudanças de estado explícitas;
2. diferenciar intenção de fato ocorrido;
3. definir transições válidas;
4. impedir transições impossíveis;
5. preservar rastreabilidade;
6. permitir processamento assíncrono;
7. suportar auditoria;
8. orientar integração entre contextos;
9. preparar o domínio para agentes de IA;
10. reduzir lógica implícita;
11. permitir reprocessamento seguro;
12. evitar efeitos duplicados;
13. preservar a ordem causal;
14. distinguir estado canônico de estado derivado;
15. documentar expiração e invalidação.

---

# Parte I — Conceitos fundamentais

## 4. Comando

Um Comando representa intenção de alterar o estado do domínio.

Exemplos:

```text
CreateTrip
SavePlace
AddActivity
MoveActivity
AcceptItineraryProposal
```

Um Comando:

* pode ser aceito;
* pode ser rejeitado;
* pode produzir um ou mais Eventos;
* pode não produzir alteração quando for idempotente;
* não representa fato concluído.

---

## 5. Evento de Domínio

Um Evento de Domínio representa um fato relevante já ocorrido.

Exemplos:

```text
TripCreated
PlaceSaved
ActivityMoved
ConflictDetected
```

Um Evento:

* utiliza tempo passado;
* é imutável;
* representa algo que ocorreu;
* pode produzir efeitos;
* pode ser publicado internamente;
* pode ser persistido para auditoria;
* não pode ser desfeito por alteração do próprio evento.

---

## 6. Estado

Estado representa a condição atual de uma entidade, agregado ou processo.

Exemplos:

* Viagem planejada;
* Atividade cancelada;
* Proposta pronta;
* Conflito aberto;
* Estimativa desatualizada.

---

## 7. Transição

Transição representa mudança válida entre estados.

Exemplo:

```text
Draft
→ Planned
```

Toda transição deverá possuir:

* origem;
* destino;
* gatilho;
* pré-condições;
* efeitos;
* eventos;
* transições proibidas.

---

## 8. Efeito

Um efeito é uma consequência produzida por um Evento.

Exemplos:

```text
TripAccommodationChanged
→ invalida Distâncias

ActivityMoved
→ recalcula Deslocamentos

PlaceMarkedUnavailable
→ detecta Conflito
```

---

## 9. Invalidação

Invalidação ocorre quando um dado ou objeto deixa de ser aplicável ao contexto atual.

Exemplos:

* Recomendação invalidada;
* Proposta expirada;
* Estimativa desatualizada;
* Conflito invalidado.

Invalidação não significa necessariamente exclusão.

---

## 10. Expiração

Expiração ocorre quando um objeto ultrapassa sua validade temporal ou contextual.

Exemplos:

* Proposta baseada em versão antiga;
* Recomendação antiga;
* Estimativa fora da janela de validade.

---

## 11. Conclusão

Conclusão representa encerramento normal do ciclo de vida.

Exemplos:

* Viagem concluída;
* Atividade concluída;
* processamento concluído.

Conclusão não significa arquivamento ou exclusão.

---

## 12. Cancelamento

Cancelamento representa interrupção explícita de um ciclo ainda relevante.

Exemplos:

* Viagem cancelada;
* Atividade cancelada;
* geração cancelada.

Cancelamento deve preservar histórico.

---

## 13. Arquivamento

Arquivamento remove um objeto das visões principais sem removê-lo do histórico.

---

## 14. Remoção

Remoção representa retirada de um objeto do estado ativo.

Poderá ser:

* lógica;
* física;
* anonimizada;
* definitiva.

A estratégia técnica será definida posteriormente.

---

# Parte II — Estrutura de um Evento de Domínio

## 15. Metadados obrigatórios

Todo Evento de Domínio deverá possuir conceitualmente:

```text
eventId
eventType
aggregateId
aggregateType
occurredAt
correlationId
causationId
actor
version
schemaVersion
```

---

## 16. eventId

Identificador único do Evento.

Deverá impedir processamento duplicado.

---

## 17. eventType

Nome canônico do Evento.

Exemplo:

```text
TripCreated
```

---

## 18. aggregateId

Identificador do agregado que produziu o Evento.

---

## 19. aggregateType

Tipo do agregado.

Exemplos:

* Trip;
* Itinerary;
* Place;
* ItineraryProposal.

---

## 20. occurredAt

Instante em que o fato ocorreu.

Deverá utilizar referência temporal inequívoca.

---

## 21. correlationId

Identificador utilizado para agrupar operações do mesmo fluxo.

Exemplo:

```text
CreateTrip
→ TripCreated
→ TripDaysGenerated
→ ItineraryInitialized
```

Todos podem compartilhar o mesmo `correlationId`.

---

## 22. causationId

Identificador do Comando ou Evento que causou diretamente o Evento atual.

---

## 23. actor

Origem responsável pela ação.

Tipos possíveis:

* user;
* system;
* scheduler;
* integration;
* ai-agent;
* administrator.

O ator não substitui autorização.

---

## 24. version

Versão do agregado após a aplicação do Evento.

---

## 25. schemaVersion

Versão estrutural do Evento.

Permite evolução do contrato.

---

## 26. Payload

O payload deverá conter apenas os dados necessários para representar o fato.

Não deverá conter:

* estado completo sem necessidade;
* dado sensível desnecessário;
* objetos externos inteiros;
* conteúdo técnico irrelevante.

---

# Parte III — Regras gerais para Eventos

## 27. Imutabilidade

Eventos publicados não deverão ser alterados.

Correções deverão ocorrer por:

* novo Evento;
* compensação;
* migração documentada;
* correção de projeção.

---

## 28. Tempo passado

Eventos deverão utilizar nomes no passado.

Correto:

```text
TripCreated
ActivityRemoved
ProposalExpired
```

Incorreto:

```text
CreateTrip
RemoveActivity
ExpireProposal
```

---

## 29. Relevância de domínio

Eventos deverão representar fatos relevantes.

Não deverão ser criados Eventos de Domínio para toda ação da interface.

Exemplos que normalmente não são Eventos de Domínio:

* ButtonClicked;
* ModalOpened;
* TabSelected;
* TooltipDisplayed.

---

## 30. Idempotência

Consumidores deverão poder identificar Eventos já processados.

O mesmo Evento não deverá produzir o mesmo efeito duas vezes.

---

## 31. Ordenação

A ordem de Eventos do mesmo agregado deverá ser preservada ou detectável por versão.

---

## 32. Processamento fora de ordem

Quando um Evento chegar fora de ordem, o consumidor deverá:

* aguardar;
* rejeitar;
* reconciliar;
* reprocessar;
* registrar inconsistência.

Não deverá aplicar silenciosamente estado impossível.

---

## 33. Reprocessamento

Eventos poderão ser reprocessados para:

* reconstrução;
* projeção;
* auditoria;
* correção;
* nova capacidade derivada.

O reprocessamento não deverá repetir efeitos externos irreversíveis sem proteção.

---

## 34. Eventos internos e de integração

### Evento de Domínio

Representa fato interno do domínio.

### Evento de Integração

Representa fato publicado para outros contextos ou sistemas.

Nem todo Evento de Domínio deverá ser exposto externamente.

---

# Parte IV — Ciclo de vida da Viagem

## 35. Estados da Viagem

```text
Draft
Planned
InProgress
Completed
Cancelled
Archived
Deleted
```

`Deleted` representa estado conceitual terminal ou processo de remoção conforme política.

---

## 36. Fluxo principal

```text
Draft
→ Planned
→ InProgress
→ Completed
→ Archived
```

---

## 37. Fluxos alternativos

```text
Draft → Cancelled
Planned → Cancelled
InProgress → Cancelled
Completed → Archived
Cancelled → Archived
```

---

## 38. Transições proibidas

Exemplos:

```text
Deleted → Planned
Archived → InProgress
Completed → Draft
Cancelled → InProgress
```

Restauração futura deverá utilizar transição específica e política explícita.

---

## 39. CreateTrip

### Pré-condições

* ator autorizado;
* dados mínimos disponíveis;
* Destino válido;
* Período válido;
* pelo menos um Viajante.

### Evento principal

```text
TripCreated
```

### Efeitos

* gerar Dias;
* inicializar Roteiro;
* registrar owner;
* gerar versão inicial;
* tornar a Viagem planejável.

### Eventos derivados possíveis

```text
TripDaysGenerated
ItineraryInitialized
TripOwnerAssigned
```

---

## 40. TripCreated

### Significado

Uma nova Viagem foi criada com contexto mínimo válido.

### Pós-condições

* TripId existe;
* status inicial é `Planned`, ou `Draft` se o fluxo permitir persistência incompleta;
* owner existe;
* Período foi validado;
* Dias podem ser gerados.

---

## 41. CompleteTripDraft

### Objetivo

Concluir um Rascunho de Viagem.

### Evento

```text
TripPlanningContextCompleted
```

### Transição

```text
Draft → Planned
```

---

## 42. StartTrip

A transição para `InProgress` deverá normalmente ser derivada da data atual.

Evento conceitual possível:

```text
TripStarted
```

Pode ser emitido por processo temporal.

### Transição

```text
Planned → InProgress
```

---

## 43. CompleteTrip

A transição para `Completed` poderá ser automática com base no Período.

Evento:

```text
TripCompleted
```

### Transição

```text
InProgress → Completed
```

---

## 44. CancelTrip

### Pré-condições

* Viagem não excluída;
* ator autorizado.

### Evento

```text
TripCancelled
```

### Efeitos

* preservar histórico;
* impedir novas operações não permitidas;
* invalidar Recomendações futuras;
* invalidar Propostas pendentes;
* manter Roteiro para consulta.

---

## 45. ArchiveTrip

### Evento

```text
TripArchived
```

### Efeitos

* remover de visões principais;
* preservar consulta;
* impedir edição conforme política;
* manter histórico.

---

## 46. RestoreArchivedTrip

Poderá existir futuramente.

Evento:

```text
TripRestored
```

### Transição possível

```text
Archived → Completed
```

ou estado temporal correspondente.

---

## 47. DeleteTrip

### Pré-condições

* autorização elevada;
* confirmação explícita;
* política de retenção conhecida.

### Evento inicial

```text
TripDeletionRequested
```

### Eventos seguintes possíveis

```text
TripDeletionScheduled
TripAnonymizationCompleted
TripDeleted
```

A remoção poderá ser assíncrona.

---

# Parte V — Alterações estruturais da Viagem

## 48. UpdateTripDestination

### Evento

```text
TripDestinationChanged
```

### Efeitos

* marcar Hospedagem para revisão;
* invalidar Estimativas;
* invalidar Recomendações;
* expirar Propostas;
* reavaliar Lugares;
* reavaliar Atividades;
* gerar Conflitos estruturais.

---

## 49. UpdateTripPeriod

### Evento

```text
TripPeriodChanged
```

### Eventos derivados possíveis

```text
TripDaysAdded
TripDaysRemovalRequested
TripDaysRemoved
ItineraryMarkedOutdated
ProposalExpired
```

---

## 50. UpdateAccommodation

### Evento

```text
TripAccommodationChanged
```

### Efeitos

* invalidar Distâncias;
* invalidar rankings por proximidade;
* solicitar recálculo;
* expirar Recomendações dependentes;
* reavaliar Conflitos geográficos.

---

## 51. AddTraveler

### Evento

```text
TravelerAdded
```

### Efeitos

* atualizar Perfil do Grupo;
* reavaliar Recomendações;
* reavaliar Restrições;
* reavaliar custos por grupo.

---

## 52. RemoveTraveler

### Evento

```text
TravelerRemoved
```

### Efeitos

* recalcular Perfil do Grupo;
* reavaliar Preferências;
* reavaliar custos;
* invalidar Recomendações personalizadas quando necessário.

---

## 53. UpdateTripPreferences

Eventos mais específicos deverão ser preferidos quando relevantes:

```text
TripInterestAdded
TripInterestRemoved
TripBudgetChanged
TripPaceChanged
TripRestrictionAdded
TripRestrictionRemoved
TripTransportModeChanged
```

Eventos excessivamente genéricos deverão ser evitados quando impedirem rastreabilidade.

---

# Parte VI — Ciclo de vida da Hospedagem

## 54. Estados

```text
Provisional
Confirmed
Outdated
Removed
```

---

## 55. Fluxo principal

```text
Provisional
→ Confirmed
```

---

## 56. Fluxos alternativos

```text
Provisional → Removed
Confirmed → Outdated
Outdated → Confirmed
Confirmed → Removed
```

---

## 57. AccommodationAdded

Emitido quando uma Hospedagem é associada à Viagem.

---

## 58. AccommodationConfirmed

Emitido quando a Hospedagem é validada por origem adequada.

---

## 59. AccommodationMarkedOutdated

Emitido quando a referência deixa de ser confiável ou compatível.

---

## 60. AccommodationRemoved

Emitido quando a Hospedagem é retirada da Viagem.

### Efeitos

* invalidar Distâncias dependentes;
* alterar origem padrão;
* reavaliar Recomendações.

---

# Parte VII — Ciclo de vida do Roteiro

## 61. Estados do Roteiro

```text
Empty
Partial
Planned
WithConflicts
UnderReview
Outdated
```

Esses estados podem ser derivados e alguns podem coexistir conceitualmente.

---

## 62. ItineraryInitialized

Emitido após criação da estrutura inicial do Roteiro.

### Pós-condições

* ItineraryId existe;
* versão inicial existe;
* Dias estão associados.

---

## 63. ItineraryChanged

Evento genérico não deverá substituir Eventos específicos.

Pode ser utilizado apenas como Evento de integração resumido.

Eventos internos preferidos:

```text
ActivityAdded
ActivityUpdated
ActivityRemoved
ActivityMoved
FreePeriodAdded
FreePeriodUpdated
FreePeriodRemoved
```

---

## 64. ItineraryVersionChanged

Pode ser emitido quando a versão lógica do Roteiro é atualizada.

---

## 65. ItineraryMarkedOutdated

Emitido quando dados derivados deixam de corresponder ao contexto atual.

### Causas

* Hospedagem alterada;
* Destino alterado;
* transporte alterado;
* dados externos relevantes alterados.

---

## 66. ItineraryRecalculated

Emitido após atualização bem-sucedida de dados derivados.

---

## 67. ItineraryReviewStarted

### Transição

```text
Planned ou WithConflicts
→ UnderReview
```

---

## 68. ItineraryReviewCompleted

Emitido após análise.

Pode produzir:

```text
ConflictDetected
ConflictInvalidated
NoKnownConflictDetected
```

`NoKnownConflictDetected` deverá ser usado com cautela por não representar garantia absoluta.

---

# Parte VIII — Ciclo de vida do Dia da Viagem

## 69. Estados derivados

```text
Empty
PartiallyPlanned
Planned
Current
Past
Future
WithConflicts
Free
```

---

## 70. TripDayCreated

Emitido quando um Dia é criado a partir do Período.

---

## 71. TripDayRemoved

Emitido quando um Dia é removido após alteração confirmada do Período.

Não deverá ocorrer silenciosamente quando houver conteúdo.

---

## 72. TripDayMarkedFree

Emitido quando o Usuário declara intenção de manter o Dia livre.

---

## 73. TripDayPlanningStarted

Evento opcional para representar início de planejamento relevante.

Não deverá ser emitido por simples abertura da tela.

---

## 74. TripDayPlanningCompleted

Pode ser emitido quando o Dia atende critérios definidos de planejamento.

Esses critérios devem permanecer políticas, não invariantes universais.

---

# Parte IX — Ciclo de vida da Atividade

## 75. Estados

```text
Planned
Tentative
Completed
Skipped
Cancelled
Unavailable
NeedsReview
Removed
```

---

## 76. Fluxo principal

```text
Planned
→ Completed
```

---

## 77. Fluxos alternativos

```text
Planned → Cancelled
Planned → Skipped
Planned → NeedsReview
Tentative → Planned
Tentative → Cancelled
NeedsReview → Planned
NeedsReview → Cancelled
```

---

## 78. AddActivity

### Evento

```text
ActivityAdded
```

### Efeitos

* incrementar versão do Roteiro;
* recalcular ordem;
* recalcular Deslocamentos;
* reavaliar Conflitos;
* atualizar estado Planejado do Lugar.

---

## 79. UpdateActivity

### Evento

```text
ActivityUpdated
```

Quando possível, Eventos específicos podem ser melhores:

```text
ActivityTimeChanged
ActivityDurationChanged
ActivityLocationChanged
ActivityTitleChanged
ActivityFlexibilityChanged
```

---

## 80. MoveActivity

### Eventos possíveis

```text
ActivityReordered
ActivityMovedToAnotherDay
```

### Efeitos

* atualizar ordem;
* recalcular Deslocamentos;
* reavaliar Conflitos;
* gerar nova versão.

---

## 81. RemoveActivity

### Evento

```text
ActivityRemoved
```

### Efeitos

* preservar Lugar;
* preservar Lugar Salvo;
* recalcular ordem;
* recalcular Deslocamentos;
* atualizar estado Planejado derivado.

---

## 82. CompleteActivity

### Evento

```text
ActivityCompleted
```

### Transição

```text
Planned → Completed
```

---

## 83. SkipActivity

### Evento

```text
ActivitySkipped
```

### Significado

A Atividade não foi realizada, mas permanece no histórico.

---

## 84. CancelActivity

### Evento

```text
ActivityCancelled
```

### Efeito

A Atividade deixa de participar do planejamento ativo.

---

## 85. ActivityMarkedUnavailable

Emitido quando a Atividade associada a um Lugar indisponível exige revisão.

### Transição

```text
Planned → Unavailable
```

---

## 86. ActivityMarkedForReview

### Evento

```text
ActivityMarkedForReview
```

### Causas

* Lugar indisponível;
* conflito temporal;
* alteração estrutural;
* dado crítico desatualizado.

---

# Parte X — Ciclo de vida do Período Livre

## 87. Estados

```text
Flexible
Protected
Removed
```

O modo é parte principal do estado.

---

## 88. AddFreePeriod

### Evento

```text
FreePeriodAdded
```

---

## 89. UpdateFreePeriod

Eventos possíveis:

```text
FreePeriodUpdated
FreePeriodProtected
FreePeriodMadeFlexible
```

---

## 90. RemoveFreePeriod

### Evento

```text
FreePeriodRemoved
```

A remoção não gera Atividade automaticamente.

---

## 91. ReplaceFreePeriodWithActivity

Operação possível apenas com decisão explícita.

Eventos possíveis:

```text
FreePeriodRemoved
ActivityAdded
```

Devem compartilhar correlação.

---

# Parte XI — Ciclo de vida do Lugar Salvo

## 92. Estados

```text
Saved
Removed
```

---

## 93. SavePlace

### Evento

```text
PlaceSaved
```

### Regra

Operação idempotente.

---

## 94. UnsavePlace

### Evento

```text
PlaceUnsaved
```

### Efeitos

* remover associação com Salvos;
* preservar Atividades;
* preservar Lugar;
* atualizar visualizações derivadas.

---

## 95. PlacePlanned

Pode ser Evento derivado quando a primeira Atividade associada é criada.

### Evento

```text
PlacePlanned
```

Quando a última Atividade ativa for removida:

```text
PlaceNoLongerPlanned
```

Esses Eventos representam estados derivados e devem ser usados somente se houver necessidade de integração.

---

# Parte XII — Ciclo de vida do Lugar

## 96. Estados operacionais

```text
Open
TemporarilyClosed
PermanentlyClosed
Seasonal
Unknown
```

---

## 97. PlaceCreated

Emitido quando um Lugar interno é criado.

---

## 98. PlaceDataUpdated

Emitido quando informações relevantes são atualizadas.

---

## 99. PlaceMarkedTemporarilyClosed

Emitido quando fonte adequada indica fechamento temporário.

---

## 100. PlaceMarkedPermanentlyClosed

Emitido quando encerramento definitivo é identificado.

### Efeitos

* marcar Atividades para revisão;
* invalidar Recomendações;
* detectar Conflitos;
* retirar de resultados ativos conforme política.

---

## 101. PlaceDataConflictDetected

Emitido quando fontes divergentes relevantes são identificadas.

---

## 102. PlaceMerged

Emitido quando duplicações são consolidadas.

### Deve preservar

* identificadores externos;
* Proveniência;
* referências;
* associações;
* histórico.

---

# Parte XIII — Ciclo de vida da Estimativa de Deslocamento

## 103. Estados

```text
Requested
Calculating
Available
Estimated
Unavailable
Stale
Failed
```

---

## 104. TravelEstimateRequested

Emitido quando cálculo é solicitado.

---

## 105. TravelEstimateCalculationStarted

Estado transitório opcional.

---

## 106. TravelEstimateCalculated

Emitido quando Distância e Tempo são calculados.

### Pós-condições

* origem definida;
* destino definido;
* transporte definido;
* Fonte definida;
* validade definida quando aplicável.

---

## 107. TravelEstimateMarkedStale

Emitido quando contexto muda.

### Causas

* Hospedagem alterada;
* Atividade movida;
* transporte alterado;
* rota atualizada;
* validade expirada.

---

## 108. TravelEstimateUnavailable

Emitido quando não há dados suficientes ou provedor não suporta o cálculo.

---

## 109. TravelEstimateFailed

Representa falha técnica transitória.

Diferença:

* `Unavailable`: capacidade ou dado não disponível;
* `Failed`: tentativa falhou.

---

# Parte XIV — Ciclo de vida da Recomendação

## 110. Estados

```text
Generated
Presented
Accepted
Rejected
Expired
Invalidated
Superseded
```

---

## 111. RecommendationRequested

Emitido quando uma recomendação é solicitada.

---

## 112. RecommendationGenerated

### Pré-condições

* Contexto de Decisão disponível;
* regras aplicadas;
* Restrições respeitadas;
* Justificativas produzidas.

---

## 113. RecommendationPresented

Emitido quando a Recomendação é apresentada ao Usuário.

Esse Evento pode ser analítico ou de domínio conforme a necessidade.

---

## 114. RecommendationAccepted

Emitido quando o Usuário aceita a sugestão.

A aceitação pode produzir outro Comando.

Exemplo:

```text
RecommendationAccepted
→ AddPlaceToItinerary
```

A aceitação da Recomendação não deve alterar o domínio sem operação específica.

---

## 115. RecommendationRejected

Emitido quando recusada explicitamente.

---

## 116. RecommendationExpired

Emitido quando a validade temporal termina.

---

## 117. RecommendationInvalidated

Emitido quando o Contexto muda.

### Causas

* Hospedagem alterada;
* Preferência alterada;
* Restrição adicionada;
* Lugar indisponível;
* Roteiro alterado.

---

## 118. RecommendationSuperseded

Emitido quando nova Recomendação substitui uma anterior para o mesmo contexto.

---

# Parte XV — Ciclo de vida da Proposta de Roteiro

## 119. Estados

```text
Requested
Generating
Ready
PartiallyAccepted
Accepted
Rejected
Expired
Failed
Cancelled
Superseded
```

---

## 120. Fluxo principal

```text
Requested
→ Generating
→ Ready
→ Accepted
```

---

## 121. Fluxos alternativos

```text
Generating → Failed
Generating → Cancelled
Ready → PartiallyAccepted
Ready → Rejected
Ready → Expired
Ready → Superseded
```

---

## 122. RequestItineraryProposal

### Evento

```text
ItineraryProposalRequested
```

### Pós-condições

* contexto registrado;
* versão base registrada;
* solicitação identificada;
* Roteiro atual preservado.

---

## 123. ItineraryProposalGenerationStarted

### Transição

```text
Requested → Generating
```

---

## 124. ItineraryProposalGenerated

### Transição

```text
Generating → Ready
```

### Pós-condições

* Dias propostos existem;
* Atividades propostas existem ou resultado vazio explicado;
* critérios registrados;
* Conflitos conhecidos registrados;
* validade definida.

---

## 125. ItineraryProposalGenerationFailed

### Transição

```text
Generating → Failed
```

### Efeitos

* preservar Roteiro atual;
* preservar Proposta anterior válida;
* permitir nova tentativa.

---

## 126. CancelItineraryProposalGeneration

### Evento

```text
ItineraryProposalGenerationCancelled
```

### Transição

```text
Generating → Cancelled
```

---

## 127. AcceptItineraryProposal

### Pré-condições

* Proposta em `Ready`;
* versão base válida;
* ator autorizado;
* invariantes preservadas.

### Eventos possíveis

```text
ItineraryProposalAccepted
ProposalActivitiesApplied
ItineraryVersionChanged
```

### Transição

```text
Ready → Accepted
```

---

## 128. AcceptItineraryProposalPartially

### Evento

```text
ItineraryProposalPartiallyAccepted
```

### Transição

```text
Ready → PartiallyAccepted
```

A Proposta pode permanecer disponível para itens restantes conforme política.

---

## 129. RejectItineraryProposal

### Evento

```text
ItineraryProposalRejected
```

### Transição

```text
Ready → Rejected
```

---

## 130. ExpireItineraryProposal

### Evento

```text
ItineraryProposalExpired
```

### Causas

* versão base alterada;
* Destino alterado;
* Período alterado;
* Hospedagem alterada;
* Restrição obrigatória alterada.

---

## 131. SupersedeItineraryProposal

### Evento

```text
ItineraryProposalSuperseded
```

Emitido quando outra Proposta passa a ser a alternativa atual.

---

# Parte XVI — Ciclo de vida do Conflito

## 132. Estados

```text
Open
Resolved
Ignored
Invalidated
Superseded
```

---

## 133. Fluxos

```text
Open → Resolved
Open → Ignored
Open → Invalidated
Open → Superseded
Ignored → Resolved
Ignored → Invalidated
```

Erros bloqueantes não podem transicionar para `Ignored`.

---

## 134. ConflictDetected

### Pré-condições

* regra identificada;
* objeto afetado;
* evidência;
* severidade;
* versão de contexto.

### Transição

```text
inexistente → Open
```

---

## 135. ResolveConflict

### Evento

```text
ConflictResolved
```

### Pré-condição

A condição que originou o Conflito deixou de existir.

---

## 136. IgnoreRisk

### Evento

```text
ConflictIgnored
```

### Pré-condições

* severidade `risk`;
* ator autorizado;
* justificativa opcional;
* regra permite ignorar.

---

## 137. ConflictInvalidated

Emitido quando o Conflito deixa de se aplicar por mudança de contexto.

---

## 138. ConflictSuperseded

Emitido quando um novo Conflito representa de maneira mais atual a mesma condição.

---

## 139. ConflictReopened

Poderá ser utilizado quando uma condição resolvida voltar a ocorrer.

Recomenda-se criar novo Conflito com referência ao anterior, em vez de reabrir silenciosamente, quando a rastreabilidade exigir.

---

# Parte XVII — Processos temporais

## 140. Relógio do domínio

Regras temporais deverão utilizar uma abstração de relógio.

Não deverão depender diretamente do relógio do dispositivo ou de chamadas não controladas.

---

## 141. Transições automáticas

Podem ocorrer automaticamente:

* Viagem planejada para em andamento;
* Viagem em andamento para concluída;
* Recomendação para expirada;
* Proposta para expirada;
* Estimativa para desatualizada.

---

## 142. Eventos temporais

Exemplos:

```text
TripStarted
TripCompleted
RecommendationExpired
ItineraryProposalExpired
TravelEstimateMarkedStale
```

---

## 143. Agendamento

A Arquitetura poderá utilizar:

* scheduler;
* processamento sob demanda;
* avaliação na leitura;
* combinação dessas estratégias.

O domínio deverá definir o resultado, não a tecnologia.

---

## 144. Estado derivado versus Evento persistido

Nem toda mudança temporal precisa gerar Evento persistido.

Exemplo:

`Viagem em andamento` pode ser derivado na leitura.

Um Evento `TripStarted` só será necessário se houver efeitos relevantes, como:

* notificação;
* mudança de política;
* preparação de conteúdo;
* auditoria.

---

# Parte XVIII — Efeitos e reações

## 145. Reação síncrona

Deve ocorrer dentro do mesmo limite de consistência quando necessária para preservar invariantes.

Exemplos:

* validar Dia;
* atualizar ordem;
* incrementar versão;
* impedir duplicação.

---

## 146. Reação assíncrona

Pode ocorrer posteriormente quando não for necessária para a validade imediata.

Exemplos:

* recalcular Distâncias;
* gerar Recomendações;
* atualizar projeções;
* reavaliar Conflitos;
* enviar notificações.

---

## 147. Matriz de efeitos principais

| Evento                       | Efeito                               |
| ---------------------------- | ------------------------------------ |
| TripCreated                  | Criar Dias e inicializar Roteiro     |
| TripPeriodChanged            | Adicionar ou revisar remoção de Dias |
| TripAccommodationChanged     | Invalidar Distâncias                 |
| TravelerAdded                | Atualizar Perfil do Grupo            |
| TripRestrictionAdded         | Reavaliar Recomendações e Propostas  |
| ActivityAdded                | Recalcular Deslocamentos             |
| ActivityMoved                | Reavaliar Conflitos                  |
| PlaceUnsaved                 | Preservar Atividades                 |
| PlaceMarkedPermanentlyClosed | Marcar Atividades para revisão       |
| ItineraryProposalAccepted    | Aplicar itens e gerar nova versão    |
| ConflictResolved             | Atualizar revisão                    |
| TravelEstimateMarkedStale    | Solicitar recálculo                  |

---

## 148. Falha em reação assíncrona

Falha em reação assíncrona não deve reverter automaticamente o fato original quando ele já for válido.

Exemplo:

```text
ActivityMoved
→ recálculo de rota falha
```

A Atividade permanece movida.

A rota fica:

```text
Unavailable ou Failed
```

---

## 149. Compensação

Quando um efeito externo irreversível falhar parcialmente, poderá ser necessário Evento compensatório.

Exemplo conceitual:

```text
ExternalReservationRequested
ExternalReservationFailed
ReservationCompensationRequested
```

Esse cenário é futuro e não pertence ao MVP inicial.

---

# Parte XIX — Idempotência e deduplicação

## 150. Comandos idempotentes

Operações conceitualmente idempotentes:

* SavePlace;
* ArchiveTrip já arquivada;
* IgnoreRisk já ignorado;
* AcceptProposal já aceita deve ser rejeitada sem reaplicar;
* Remove item já removido pode retornar estado atual.

---

## 151. Chave de idempotência

Comandos externos poderão possuir:

```text
idempotencyKey
```

A tecnologia será definida na Arquitetura.

---

## 152. Deduplicação de Eventos

Consumidores deverão registrar `eventId` processados quando necessário.

---

## 153. Efeitos externos

Notificações, integrações e chamadas externas deverão possuir proteção adicional contra repetição.

---

# Parte XX — Concorrência e versionamento

## 154. Versão do agregado

Agregados mutáveis deverão possuir versão lógica.

---

## 155. Comando baseado em versão

Operações sensíveis poderão informar:

```text
expectedVersion
```

---

## 156. Conflito de concorrência

Quando a versão atual divergir:

```text
expectedVersion != currentVersion
```

o Comando deverá:

* ser rejeitado;
* solicitar recarregamento;
* tentar reconciliação;
* ou aplicar política específica.

Nunca deverá sobrescrever silenciosamente.

---

## 157. Proposta e concorrência

A Proposta deverá registrar:

```text
baseItineraryVersion
```

Se a versão mudar de forma incompatível, a Proposta expira.

---

# Parte XXI — Eventos de integração

## 158. Objetivo

Eventos de integração poderão expor fatos para:

* IA;
* dados;
* analytics;
* notificações;
* busca;
* indexação;
* provedores;
* outros contextos.

---

## 159. Exemplos

```text
TripCreatedIntegrationEvent
TripContextChangedIntegrationEvent
ItineraryUpdatedIntegrationEvent
PlaceSavedIntegrationEvent
ProposalAcceptedIntegrationEvent
```

Os nomes finais poderão ser simplificados conforme o padrão técnico.

---

## 160. Redução de acoplamento

Eventos de integração deverão expor contratos estáveis e mínimos.

Não deverão vazar estrutura interna dos agregados.

---

## 161. Privacidade

Eventos de integração não deverão incluir dados pessoais ou sensíveis sem finalidade legítima.

---

# Parte XXII — Eventos e IA

## 162. Ator IA

Quando uma ação for proposta por IA, o ator deverá ser identificado como:

```text
ai-agent
```

Mas o responsável pela decisão final deverá permanecer distinguível.

---

## 163. Ação sugerida por IA

Exemplo:

```text
ItineraryProposalGenerated
actor = ai-agent
```

A aplicação posterior:

```text
ItineraryProposalAccepted
actor = user
```

---

## 164. IA não produz fato canônico sem validação

Conteúdo gerado por IA poderá produzir:

* RecommendationGenerated;
* ItineraryProposalGenerated;
* ConflictSuggestionGenerated;
* DraftContentGenerated.

Não deverá produzir diretamente:

* ActivityAdded;
* TripDestinationChanged;
* TripDeleted;

sem Comando autorizado.

---

## 165. Auditoria de IA

Eventos gerados com assistência de IA deverão poder registrar:

* agente;
* versão;
* política;
* Contexto de Decisão;
* fontes;
* limitações.

Detalhes técnicos serão definidos posteriormente.

---

# Parte XXIII — Auditoria

## 166. Eventos auditáveis

Operações críticas deverão ser auditáveis:

* criação;
* exclusão;
* mudança de owner;
* alteração de Destino;
* alteração de Período;
* alteração de Hospedagem;
* aceitação de Proposta;
* ignorar Risco;
* mudança de Restrição;
* remoção de Atividade.

---

## 167. Dados de auditoria

A auditoria deverá registrar:

* quem;
* quando;
* o quê;
* objeto;
* versão anterior;
* versão nova;
* correlação;
* origem.

Não é obrigatório armazenar estado completo em todo Evento.

---

## 168. Histórico de estado

O sistema poderá reconstruir parcialmente o histórico a partir de:

* Eventos;
* versões;
* auditoria;
* snapshots;
* diffs.

A estratégia será definida pela Arquitetura.

---

# Parte XXIV — Catálogo de Comandos

## 169. Viagem

```text
CreateTrip
CompleteTripDraft
UpdateTripName
UpdateTripDestination
UpdateTripPeriod
UpdateAccommodation
AddTraveler
RemoveTraveler
AssignTripOwner
UpdateTripRole
CancelTrip
ArchiveTrip
RestoreTrip
DeleteTrip
```

---

## 170. Preferências

```text
AddTripInterest
RemoveTripInterest
UpdateTripBudget
UpdateTripPace
AddTripRestriction
RemoveTripRestriction
UpdateTripTransportMode
```

---

## 171. Lugares

```text
SavePlace
UnsavePlace
CreateCustomPlace
UpdateCustomPlace
MergePlaces
MarkPlaceUnavailable
```

---

## 172. Roteiro

```text
AddActivity
UpdateActivity
MoveActivity
MoveActivityToAnotherDay
RemoveActivity
CompleteActivity
SkipActivity
CancelActivity
AddFreePeriod
UpdateFreePeriod
RemoveFreePeriod
MarkTripDayFree
ReviewItinerary
```

---

## 173. Recomendações e Propostas

```text
RequestRecommendation
AcceptRecommendation
RejectRecommendation
RequestItineraryProposal
CancelItineraryProposalGeneration
AcceptItineraryProposal
AcceptItineraryProposalPartially
RejectItineraryProposal
RegenerateItineraryProposal
```

---

## 174. Conflitos

```text
DetectConflicts
ResolveConflict
IgnoreRisk
RestoreIgnoredRisk
```

---

## 175. Deslocamentos

```text
RequestTravelEstimate
RefreshTravelEstimate
ChangeTransportMode
```

---

# Parte XXV — Catálogo de Eventos

## 176. Viagem

```text
TripCreated
TripPlanningContextCompleted
TripNameChanged
TripDestinationChanged
TripPeriodChanged
TripStarted
TripCompleted
TripCancelled
TripArchived
TripRestored
TripDeletionRequested
TripDeleted
```

---

## 177. Participantes e Preferências

```text
TripOwnerAssigned
TripRoleChanged
TravelerAdded
TravelerRemoved
GroupProfileUpdated
TripInterestAdded
TripInterestRemoved
TripBudgetChanged
TripPaceChanged
TripRestrictionAdded
TripRestrictionRemoved
TripTransportModeChanged
```

---

## 178. Hospedagem

```text
AccommodationAdded
AccommodationConfirmed
AccommodationChanged
AccommodationMarkedOutdated
AccommodationRemoved
```

---

## 179. Lugares

```text
PlaceCreated
PlaceUpdated
PlaceSaved
PlaceUnsaved
PlacePlanned
PlaceNoLongerPlanned
PlaceMarkedTemporarilyClosed
PlaceMarkedPermanentlyClosed
PlaceDataConflictDetected
PlaceMerged
```

---

## 180. Roteiro

```text
ItineraryInitialized
ItineraryMarkedOutdated
ItineraryRecalculated
ItineraryReviewStarted
ItineraryReviewCompleted
ItineraryVersionChanged
TripDayCreated
TripDayRemoved
TripDayMarkedFree
```

---

## 181. Atividades

```text
ActivityAdded
ActivityUpdated
ActivityTimeChanged
ActivityDurationChanged
ActivityLocationChanged
ActivityReordered
ActivityMovedToAnotherDay
ActivityRemoved
ActivityCompleted
ActivitySkipped
ActivityCancelled
ActivityMarkedUnavailable
ActivityMarkedForReview
```

---

## 182. Períodos Livres

```text
FreePeriodAdded
FreePeriodUpdated
FreePeriodProtected
FreePeriodMadeFlexible
FreePeriodRemoved
```

---

## 183. Deslocamentos

```text
TravelEstimateRequested
TravelEstimateCalculationStarted
TravelEstimateCalculated
TravelEstimateMarkedStale
TravelEstimateUnavailable
TravelEstimateFailed
```

---

## 184. Recomendações

```text
RecommendationRequested
RecommendationGenerated
RecommendationPresented
RecommendationAccepted
RecommendationRejected
RecommendationExpired
RecommendationInvalidated
RecommendationSuperseded
```

---

## 185. Propostas

```text
ItineraryProposalRequested
ItineraryProposalGenerationStarted
ItineraryProposalGenerated
ItineraryProposalGenerationFailed
ItineraryProposalGenerationCancelled
ItineraryProposalAccepted
ItineraryProposalPartiallyAccepted
ItineraryProposalRejected
ItineraryProposalExpired
ItineraryProposalSuperseded
```

---

## 186. Conflitos

```text
ConflictDetected
ConflictResolved
ConflictIgnored
ConflictInvalidated
ConflictSuperseded
```

---

# Parte XXVI — Cenários normativos

## 187. Criação da Viagem

```text
Dado que o Usuário possui autorização
E informou Destino, Período e Viajantes válidos
Quando executa CreateTrip
Então TripCreated é emitido
E os Dias da Viagem são gerados
E o Roteiro é inicializado
E a versão inicial é registrada
```

---

## 188. Mudança de Hospedagem

```text
Dado que a Viagem possui Hospedagem confirmada
E existem Estimativas calculadas
Quando UpdateAccommodation é aceito
Então TripAccommodationChanged é emitido
E as Estimativas dependentes são marcadas como desatualizadas
E o recálculo é solicitado
E o Roteiro permanece preservado
```

---

## 189. Reordenação de Atividade

```text
Dado que o Dia possui três Atividades
Quando MoveActivity altera a segunda para a primeira posição
Então ActivityReordered é emitido
E a versão do Roteiro é incrementada
E os Deslocamentos afetados são invalidados
E os Conflitos são reavaliados
```

---

## 190. Aceitação de Proposta

```text
Dado que a Proposta está pronta
E sua versão base ainda é válida
Quando o Usuário executa AcceptItineraryProposal
Então ItineraryProposalAccepted é emitido
E as Atividades elegíveis são aplicadas
E a versão do Roteiro é alterada
E os Conflitos são reavaliados
```

---

## 191. Proposta expirada

```text
Dado que uma Proposta foi gerada para a versão 5
E o Roteiro foi alterado para a versão 6
Quando a Proposta é revisada
Então ItineraryProposalExpired é emitido
E a aplicação é bloqueada
E uma nova geração pode ser solicitada
```

---

## 192. Lugar encerrado

```text
Dado que um Lugar está associado a uma Atividade futura
Quando PlaceMarkedPermanentlyClosed é emitido
Então a Atividade é marcada para revisão
E um Conflito é detectado
E Recomendações relacionadas são invalidadas
```

---

## 193. Risco ignorado

```text
Dado que existe um Conflito de severidade Risco
Quando o Usuário autorizado executa IgnoreRisk
Então ConflictIgnored é emitido
E a decisão permanece auditável
E o Roteiro continua válido
```

---

# Parte XXVII — Anti-patterns

## 194. Evento como Comando

Evitar:

```text
TripCreateRequestedEvent
```

quando o conceito correto for um Comando.

---

## 195. Evento genérico excessivo

Evitar:

```text
TripUpdated
DataChanged
ItemModified
```

quando a mudança relevante puder ser nomeada.

---

## 196. Evento técnico como Evento de Domínio

Evitar:

```text
DatabaseRowInserted
CacheCleared
HttpRequestCompleted
```

---

## 197. Payload completo sem necessidade

Não publicar todo o agregado em todos os Eventos.

---

## 198. Estado impossível

Não permitir:

```text
Accepted Proposal
→ Generating
```

sem novo ciclo ou nova identidade.

---

## 199. Efeito duplicado

Não permitir que o mesmo Evento:

* adicione duas Atividades;
* envie duas notificações;
* aplique duas vezes a Proposta.

---

## 200. IA como ator final indevido

Não registrar decisão do Usuário como se fosse decisão autônoma da IA.

---

## 201. Exclusão sem histórico

Não remover objetos críticos sem Evento, auditoria ou política de retenção.

---

# Parte XXVIII — Rastreabilidade

## 202. Eventos e Regras de Negócio

| Evento                    | Regras principais     |
| ------------------------- | --------------------- |
| TripCreated               | RB-BR-013 a RB-BR-018 |
| TripPeriodChanged         | RB-BR-023 a RB-BR-027 |
| TripAccommodationChanged  | RB-BR-031 a RB-BR-035 |
| PlaceSaved                | RB-BR-055 a RB-BR-060 |
| ActivityAdded             | RB-BR-061 a RB-BR-082 |
| FreePeriodProtected       | RB-BR-083 a RB-BR-087 |
| TravelEstimateMarkedStale | RB-BR-088 a RB-BR-095 |
| RecommendationGenerated   | RB-BR-096 a RB-BR-104 |
| ItineraryProposalAccepted | RB-BR-105 a RB-BR-116 |
| ConflictDetected          | RB-BR-117 a RB-BR-126 |

---

## 203. Ciclos e Agregados

| Agregado          | Ciclo principal                              |
| ----------------- | -------------------------------------------- |
| Trip              | Draft → Planned → InProgress → Completed     |
| Accommodation     | Provisional → Confirmed                      |
| Activity          | Planned → Completed                          |
| Recommendation    | Generated → Presented → Accepted ou Rejected |
| ItineraryProposal | Requested → Generating → Ready → Accepted    |
| Conflict          | Open → Resolved                              |
| TravelEstimate    | Requested → Calculating → Available          |

---

## 204. Eventos e superfícies

| Superfície    | Eventos principais                                              |
| ------------- | --------------------------------------------------------------- |
| Criar Viagem  | TripCreated, TripDaysGenerated                                  |
| Configurações | TripDestinationChanged, TripPeriodChanged, AccommodationChanged |
| Explorar      | PlaceSaved, PlaceUnsaved, RecommendationPresented               |
| Roteiro       | ActivityAdded, ActivityMoved, FreePeriodAdded                   |
| Proposta      | ItineraryProposalGenerated, ItineraryProposalAccepted           |
| Revisão       | ConflictDetected, ConflictResolved, ConflictIgnored             |
| Mapa          | TravelEstimateCalculated, TravelEstimateFailed                  |

---

# Parte XXIX — Critérios de aceite

## 205. Comandos

* representam intenção;
* utilizam verbo;
* possuem pré-condições;
* respeitam autorização;
* não são confundidos com Eventos.

---

## 206. Eventos

* representam fatos;
* utilizam passado;
* são imutáveis;
* possuem metadados;
* são idempotentes no consumo;
* preservam causalidade.

---

## 207. Ciclos de vida

* estados estão definidos;
* transições válidas estão definidas;
* transições proibidas estão identificadas;
* cancelamento, conclusão e arquivamento são distintos;
* expiração e invalidação são distintas.

---

## 208. Efeitos

* efeitos síncronos e assíncronos estão diferenciados;
* falha assíncrona não corrompe fato válido;
* dados derivados são invalidados corretamente;
* efeitos duplicados são prevenidos.

---

## 209. IA

* IA pode gerar Recomendações e Propostas;
* IA não aplica estado canônico sem autorização;
* ator e decisão permanecem distinguíveis;
* outputs gerados por IA são auditáveis.

---

## 210. Concorrência

* agregados possuem versão;
* comandos podem utilizar versão esperada;
* Propostas registram versão base;
* sobrescrita silenciosa é proibida.

---

# Parte XXX — Governança

## 211. Inclusão de novo Evento

Um novo Evento deverá possuir:

* nome;
* significado;
* agregado;
* gatilho;
* Comando ou causa;
* payload;
* efeitos;
* idempotência;
* consumidores;
* privacidade;
* versão;
* testes.

---

## 212. Alteração de Evento

Mudanças deverão considerar:

* consumidores;
* compatibilidade;
* schemaVersion;
* migração;
* replay;
* documentação;
* analytics;
* testes;
* integração.

---

## 213. Depreciação

Eventos depreciados deverão:

* permanecer documentados;
* possuir substituto;
* possuir período de compatibilidade;
* não ser removidos abruptamente.

---

## 214. Breaking change

Alterações incompatíveis no contrato de Evento deverão:

* incrementar versão;
* possuir migração;
* atualizar consumidores;
* preservar histórico.

---

## 215. Uso por agentes de IA

Agentes deverão:

* distinguir Comando de Evento;
* utilizar nomes oficiais;
* respeitar transições;
* não inventar estados;
* citar efeitos esperados;
* não aplicar Proposta automaticamente;
* preservar correlação e causalidade;
* gerar testes de transição;
* identificar impacto em consumidores.

---

## 216. Checklist de revisão

Antes de aprovar este documento, verificar:

* conceitos fundamentais estão definidos;
* estrutura de Evento está definida;
* regras gerais estão definidas;
* ciclo da Viagem está definido;
* ciclo da Hospedagem está definido;
* ciclo do Roteiro está definido;
* ciclo do Dia está definido;
* ciclo da Atividade está definido;
* ciclo do Período Livre está definido;
* ciclo de Salvos está definido;
* ciclo do Lugar está definido;
* ciclo das Estimativas está definido;
* ciclo das Recomendações está definido;
* ciclo das Propostas está definido;
* ciclo dos Conflitos está definido;
* temporalidade está definida;
* efeitos estão definidos;
* idempotência está definida;
* concorrência está definida;
* integração está definida;
* IA está contemplada;
* auditoria está contemplada;
* catálogos estão presentes;
* cenários normativos estão presentes;
* anti-patterns estão definidos;
* rastreabilidade está presente;
* governança está definida.

---

## 217. Declaração final

Os Eventos de Domínio e Ciclos de Vida definem como o RouteBook representa mudanças relevantes.

Eles estabelecem:

* quais intenções podem ser solicitadas;
* quais fatos podem ocorrer;
* quais estados são válidos;
* quais transições são permitidas;
* quais efeitos devem ser produzidos;
* quais objetos devem expirar;
* quais dados devem ser invalidados;
* quais decisões devem permanecer auditáveis.

O RouteBook deverá preservar uma distinção rigorosa entre:

* Comando e Evento;
* intenção e fato;
* geração e aplicação;
* expiração e exclusão;
* invalidação e resolução;
* conclusão e arquivamento;
* recomendação e decisão.

Essa distinção é essencial para garantir:

* consistência;
* rastreabilidade;
* automação segura;
* processamento assíncrono;
* auditabilidade;
* evolução arquitetural;
* controle do Usuário.

Com este documento, a documentação principal da Epic Domain está concluída.
