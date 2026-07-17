---

id: RB-DOM-001

title: Modelo de Domínio
description: Define o modelo conceitual do domínio do RouteBook, incluindo entidades, objetos de valor, agregados, relacionamentos, estados, invariantes, eventos e limites de responsabilidade.

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
- domain-model
- ubiquitous-language
- entities
- value-objects
- aggregates
- invariants
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

prerequisites:

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

next_documents:

- RB-DOM-002
- RB-DOM-003
- RB-DOM-004
- RB-ARC-001
- RB-DATA-001
- RB-QA-001

ai_context:
priority: critical
index: true
---

# RouteBook — Modelo de Domínio

## 1. Propósito deste documento

Este documento define o modelo conceitual do domínio do RouteBook.

Seu objetivo é estabelecer uma representação comum e consistente dos conceitos permanentes do produto.

O modelo deverá orientar:

* produto;
* arquitetura;
* desenvolvimento;
* dados;
* IA;
* UX;
* QA;
* documentação;
* integrações;
* agentes autônomos;
* regras de negócio.

Este documento define:

* linguagem ubíqua;
* entidades;
* objetos de valor;
* agregados;
* relacionamentos;
* estados;
* invariantes;
* eventos de domínio;
* serviços de domínio;
* limites de consistência;
* conceitos derivados;
* regras de identidade;
* regras de ciclo de vida.

Este documento não define:

* banco de dados;
* tabelas;
* endpoints;
* contratos técnicos;
* classes;
* frameworks;
* implementação;
* estratégia de persistência;
* infraestrutura;
* provedor de mapas;
* modelo de IA específico.

---

## 2. Papel do modelo de domínio

O Modelo de Domínio deverá funcionar como ponte entre:

* intenção do produto;
* comportamento esperado;
* linguagem da interface;
* regras de negócio;
* arquitetura;
* implementação.

Ele deverá reduzir:

* ambiguidade;
* sinônimos inconsistentes;
* duplicação conceitual;
* regras contraditórias;
* lógica espalhada;
* interpretações incorretas por agentes de IA.

---

## 3. Princípios do domínio

O modelo deverá preservar os seguintes princípios:

1. A Viagem é o principal contexto de decisão.
2. O usuário permanece no controle.
3. Recomendações não são decisões aplicadas.
4. Salvar não significa planejar.
5. Lugar não significa Atividade.
6. Proposta não significa Roteiro atual.
7. Informação estimada não significa informação confirmada.
8. Dados externos podem estar incompletos ou desatualizados.
9. Planejamento parcial é válido.
10. Dias livres são decisões legítimas.
11. A Hospedagem é uma referência contextual, não uma obrigação.
12. O Mapa é uma representação, não o domínio.
13. Conflitos podem possuir diferentes severidades.
14. Uma recomendação deve possuir contexto e justificativa.
15. Alterações estruturais podem invalidar dados derivados.
16. Conceitos de domínio não devem depender da interface.
17. Estados derivados não devem ser persistidos sem necessidade.
18. Agentes de IA devem respeitar as mesmas invariantes.

---

# Parte I — Linguagem ubíqua

## 4. Definição

A linguagem ubíqua é o vocabulário oficial utilizado por todas as áreas do RouteBook.

Os mesmos termos deverão ser utilizados em:

* documentação;
* interface;
* código conceitual;
* testes;
* eventos;
* analytics;
* prompts;
* agentes;
* suporte.

---

## 5. Termos centrais

| Termo                 | Definição                                                |
| --------------------- | -------------------------------------------------------- |
| Conta                 | Identidade de acesso ao RouteBook                        |
| Usuário               | Pessoa que utiliza o RouteBook                           |
| Viagem                | Contexto principal de planejamento e decisão             |
| Destino               | Região geográfica principal associada à Viagem           |
| Hospedagem            | Referência de permanência durante a Viagem               |
| Viajante              | Pessoa participante da Viagem                            |
| Perfil do Grupo       | Características agregadas dos Viajantes                  |
| Preferência           | Informação que influencia personalização                 |
| Interesse             | Categoria de experiência desejada                        |
| Restrição             | Condição que deve ser respeitada                         |
| Ritmo                 | Intensidade desejada para o planejamento                 |
| Orçamento             | Referência financeira da Viagem                          |
| Lugar                 | Ponto de interesse potencialmente visitável              |
| Lugar Salvo           | Lugar mantido para avaliação futura                      |
| Atividade             | Compromisso planejado em um Dia da Viagem                |
| Dia da Viagem         | Unidade temporal pertencente à Viagem                    |
| Roteiro               | Organização atual dos Dias e Atividades                  |
| Proposta de Roteiro   | Organização sugerida ainda não aplicada                  |
| Período Livre         | Intervalo intencionalmente sem Atividade                 |
| Deslocamento          | Movimento entre duas referências geográficas             |
| Distância             | Medida entre dois pontos                                 |
| Tempo de Deslocamento | Duração estimada de um Deslocamento                      |
| Recomendação          | Sugestão contextual produzida pelo sistema               |
| Justificativa         | Razão explicável para uma recomendação                   |
| Conflito              | Condição que afeta ou pode afetar o planejamento         |
| Alerta                | Comunicação de erro, risco ou sugestão                   |
| Fonte de Dados        | Origem externa ou interna de uma informação              |
| Evidência             | Dado utilizado para sustentar uma conclusão              |
| Estimativa            | Valor aproximado sujeito a variação                      |
| Confirmação           | Informação validada por fonte adequada                   |
| Contexto de Decisão   | Conjunto de informações relevantes para uma recomendação |

---

## 6. Termos que não são equivalentes

### Lugar e Atividade

Um Lugar é um ponto de interesse.

Uma Atividade é um compromisso planejado.

Uma Atividade pode:

* referenciar um Lugar;
* não possuir Lugar;
* representar refeição;
* representar deslocamento futuro;
* representar descanso;
* representar compromisso manual.

---

### Salvo e Planejado

Um Lugar Salvo foi preservado para avaliação.

Um Lugar Planejado possui pelo menos uma Atividade associada ao Roteiro.

Um Lugar pode estar:

* não salvo e não planejado;
* salvo e não planejado;
* não salvo e planejado;
* salvo e planejado.

---

### Roteiro e Proposta

O Roteiro representa o planejamento atual.

A Proposta de Roteiro representa uma alternativa ainda não aplicada.

A proposta não deverá modificar o Roteiro sem aceitação explícita.

---

### Destino e Região

Destino representa o contexto geográfico principal da Viagem.

Região representa uma área geográfica utilizada para:

* busca;
* agrupamento;
* recomendação;
* visualização;
* cálculo.

Uma Viagem poderá possuir um Destino e várias Regiões relevantes.

---

### Distância e Tempo de Deslocamento

Distância mede separação espacial.

Tempo de Deslocamento estima duração considerando:

* meio de transporte;
* rota;
* tráfego;
* condições;
* fonte;
* horário.

---

# Parte II — Visão geral do domínio

## 7. Mapa conceitual principal

```text
Conta
└── possui Usuários

Usuário
├── cria Viagens
├── participa de Viagens
└── mantém Preferências pessoais

Viagem
├── possui Destino
├── pode possuir Hospedagem
├── possui Viajantes
├── possui Preferências da Viagem
├── possui Dias da Viagem
├── possui Roteiro
├── possui Lugares Salvos
├── recebe Recomendações
├── recebe Propostas de Roteiro
└── possui Conflitos derivados

Roteiro
└── organiza Dias da Viagem

Dia da Viagem
├── possui Atividades
├── possui Períodos Livres
└── possui Deslocamentos derivados

Atividade
├── pode referenciar Lugar
├── possui horário opcional
├── possui duração opcional
└── pode gerar Conflitos

Lugar
├── possui Localização
├── possui Categoria
├── possui Informações
├── possui Fontes
└── pode ser salvo ou planejado
```

---

## 8. Áreas conceituais

O domínio inicial será dividido em:

1. identidade;
2. Viagem;
3. participantes;
4. Preferências;
5. Lugares;
6. planejamento;
7. mobilidade;
8. recomendações;
9. conflitos;
10. proveniência de dados.

---

# Parte III — Identidade

## 9. Entidade Conta

### Definição

Representa o contexto de acesso e propriedade de dados.

### Identidade

```text
AccountId
```

### Responsabilidades

* agrupar Usuários;
* controlar acesso;
* associar Viagens;
* manter configurações globais;
* suportar colaboração futura.

### Atributos conceituais

* identificador;
* status;
* data de criação;
* configurações;
* plano futuro opcional.

### Estados

* active;
* suspended;
* closed.

### Invariantes

* uma Conta deve possuir pelo menos um responsável;
* Conta encerrada não aceita novas Viagens;
* encerramento não deve apagar histórico sem política definida.

---

## 10. Entidade Usuário

### Definição

Pessoa identificada que utiliza o produto.

### Identidade

```text
UserId
```

### Atributos conceituais

* nome;
* e-mail;
* localidade;
* fuso horário;
* Preferências pessoais;
* configurações de acessibilidade;
* consentimentos.

### Responsabilidades

* criar Viagem;
* editar Viagem quando autorizado;
* salvar Lugares;
* planejar Atividades;
* aceitar Propostas;
* responder a Conflitos.

### Invariantes

* e-mail deve possuir formato válido;
* localidade deve ser suportada ou possuir fallback;
* consentimentos devem ser rastreáveis.

---

## 11. Participação em Viagem

A relação entre Usuário e Viagem deverá possuir papel.

### Papéis iniciais

* owner;
* editor;
* viewer.

### Futuro

* collaborator;
* guest;
* travel-agent.

### Invariantes

* toda Viagem possui pelo menos um owner;
* somente papéis autorizados podem alterar o Roteiro;
* permissões não devem ser inferidas apenas pela interface.

---

# Parte IV — Agregado Viagem

## 12. Entidade Viagem

### Definição

A Viagem é o principal agregado do domínio.

Ela representa o contexto dentro do qual o RouteBook organiza informações, decisões, Lugares e planejamento.

### Identidade

```text
TripId
```

### Raiz do agregado

```text
Trip
```

### Responsabilidades

* preservar identidade da Viagem;
* manter Destino;
* manter Período;
* manter Hospedagem;
* manter Viajantes;
* manter Preferências;
* coordenar Dias;
* possuir Roteiro;
* controlar Lugares Salvos;
* registrar alterações estruturais;
* controlar versões de planejamento.

---

## 13. Atributos conceituais da Viagem

* identificador;
* nome;
* Destino;
* Período;
* Hospedagem opcional;
* Viajantes;
* Preferências;
* status;
* owner;
* participantes;
* data de criação;
* última atualização;
* versão de contexto.

---

## 14. Estados da Viagem

### Draft

Criação iniciada, mas contexto mínimo ainda não foi concluído.

### Planned

Viagem criada e disponível para planejamento.

### InProgress

Data atual está dentro do Período da Viagem.

### Completed

Período já terminou.

### Archived

Viagem preservada, mas removida da visão principal.

### Cancelled

Viagem cancelada explicitamente.

---

## 15. Transições da Viagem

```text
Draft
→ Planned
→ InProgress
→ Completed
→ Archived
```

Transições alternativas:

```text
Draft → Cancelled
Planned → Cancelled
InProgress → Cancelled
Completed → Archived
```

---

## 16. Invariantes da Viagem

1. Deve possuir Destino válido antes de se tornar `Planned`.
2. Deve possuir Período válido antes de se tornar `Planned`.
3. A data final não pode ser anterior à data inicial.
4. Deve possuir pelo menos um Viajante.
5. Deve possuir pelo menos um owner.
6. Cada Dia da Viagem deve estar dentro do Período.
7. Alterar Período deve recalcular os Dias.
8. Alterar Destino deve invalidar dependências geográficas incompatíveis.
9. Alterar Hospedagem deve invalidar Distâncias derivadas.
10. Excluir Viagem não deve ser uma operação silenciosa.
11. Propostas não devem alterar a Viagem automaticamente.
12. Histórico relevante não deve ser perdido sem política explícita.

---

## 17. Nome da Viagem

O nome poderá:

* ser informado;
* ser derivado do Destino;
* ser alterado;
* não alterar a identidade.

Exemplos:

```text
Pipa
Férias em Pipa
Viagem de agosto
```

---

# Parte V — Destino e geografia

## 18. Objeto de valor Destino

### Definição

Representa a região geográfica principal da Viagem.

### Estrutura conceitual

* nome;
* tipo;
* país;
* divisão administrativa;
* coordenada de referência;
* limite geográfico opcional;
* identificador externo opcional;
* fuso horário.

### Tipos possíveis

* city;
* district;
* region;
* island;
* park;
* custom-region.

### Invariantes

* deve possuir referência geográfica;
* deve possuir localidade;
* deve possuir fuso ou mecanismo de resolução;
* identificadores externos não definem identidade interna.

---

## 19. Objeto de valor Localização

### Estrutura

* latitude;
* longitude;
* precisão opcional;
* endereço opcional;
* fonte;
* data de atualização.

### Invariantes

* latitude entre -90 e 90;
* longitude entre -180 e 180;
* precisão deve ser identificada quando relevante;
* endereço e coordenada podem divergir e devem ser tratados separadamente.

---

## 20. Objeto de valor Região

### Definição

Área utilizada para agrupamento e busca.

### Exemplos

* Centro de Pipa;
* Praia do Madeiro;
* Tibau do Sul;
* região ao redor da Hospedagem.

### Responsabilidades

* agrupar Lugares;
* limitar busca;
* apoiar Recomendações;
* apoiar visualização.

---

# Parte VI — Período e Dias

## 21. Objeto de valor Período da Viagem

### Estrutura

* data inicial;
* data final;
* fuso horário.

### Propriedades derivadas

* quantidade de Dias;
* estado temporal;
* datas contidas.

### Invariantes

* início não pode ser posterior ao término;
* todas as datas são interpretadas no fuso da Viagem;
* duração é derivada, não informada manualmente.

---

## 22. Entidade Dia da Viagem

### Identidade

```text
TripDayId
```

### Identidade natural contextual

```text
TripId + LocalDate
```

### Atributos

* data;
* posição;
* status;
* observação;
* Atividades;
* Períodos Livres.

### Estados derivados

* empty;
* partially-planned;
* planned;
* current;
* past;
* future;
* with-conflicts.

### Invariantes

* pertence a uma única Viagem;
* data deve estar no Período;
* posição deve respeitar ordem cronológica;
* não pode existir mais de um Dia para a mesma data na mesma Viagem.

---

## 23. Alteração do Período

### Ampliação

Deve:

* criar Dias adicionais;
* preservar Dias existentes;
* preservar Atividades existentes.

### Redução

Deve:

* identificar Dias removidos;
* identificar Atividades afetadas;
* exigir decisão explícita;
* evitar perda silenciosa.

---

# Parte VII — Hospedagem

## 24. Entidade Hospedagem da Viagem

### Definição

Representa a referência de permanência utilizada na Viagem.

### Identidade

```text
AccommodationId
```

### Tipos

* hotel;
* pousada;
* hostel;
* rental;
* residence;
* approximate-reference;
* multiple-accommodations futuramente.

### Atributos

* nome;
* Localização;
* endereço;
* período aplicável;
* status de confirmação;
* fonte;
* observações.

### Estados

* provisional;
* confirmed;
* outdated;
* removed.

### Invariantes

* pode ser provisória;
* deve possuir Localização para cálculos geográficos;
* alteração deve invalidar Distâncias dependentes;
* ausência não deve impedir planejamento básico.

---

## 25. Hospedagem provisória

Uma Hospedagem provisória poderá ser:

* centro do Destino;
* bairro;
* coordenada aproximada;
* ponto escolhido pelo usuário.

Deverá ser identificada como aproximação.

---

# Parte VIII — Viajantes e grupo

## 26. Entidade Viajante

### Identidade

```text
TravelerId
```

### Definição

Pessoa participante da Viagem, podendo ou não possuir conta no RouteBook.

### Atributos

* nome opcional;
* faixa etária;
* papel;
* necessidades;
* Preferências;
* Restrições;
* associação com Usuário opcional.

### Tipos iniciais

* adult;
* child;
* senior;
* unspecified.

### Invariantes

* todo Viajante pertence à Viagem;
* dados sensíveis devem ser minimizados;
* faixa etária não deve ser usada para inferências indevidas;
* necessidades relevantes devem ser explícitas.

---

## 27. Objeto de valor Perfil do Grupo

### Definição

Resumo derivado dos Viajantes.

### Exemplos

* 3 adultos;
* 5 adultos e 2 crianças;
* grupo com mobilidade reduzida;
* grupo familiar.

### Uso

* Recomendações;
* filtros;
* adequação de Lugares;
* Ritmo;
* custo estimado.

### Regra

Perfil do Grupo é derivado e não substitui os Viajantes individuais.

---

# Parte IX — Preferências

## 28. Agregado Preferências da Viagem

### Definição

Conjunto de informações utilizadas para personalizar decisões.

### Categorias

* Interesses;
* Orçamento;
* Ritmo;
* transporte;
* Restrições;
* horários preferidos;
* categorias evitadas;
* prioridades.

---

## 29. Objeto de valor Interesse

### Exemplos

* praias;
* gastronomia;
* vida noturna;
* natureza;
* cultura;
* compras;
* atividades infantis;
* aventura;
* descanso.

### Estrutura

* categoria;
* peso opcional;
* origem;
* escopo.

### Escopo

* pessoal;
* Viajante;
* grupo;
* Viagem.

---

## 30. Objeto de valor Orçamento

### Formas possíveis

* faixa total;
* faixa diária;
* faixa por pessoa;
* categoria qualitativa.

### Categorias iniciais

* economic;
* moderate;
* comfortable;
* premium;
* unspecified.

### Invariantes

* moeda deve ser identificada;
* estimativa não deve ser apresentada como limite rígido;
* ausência deve ser suportada.

---

## 31. Objeto de valor Ritmo

### Valores iniciais

* relaxed;
* balanced;
* intense;
* custom.

### Significado

#### Relaxed

Menos Atividades, mais intervalos e flexibilidade.

#### Balanced

Combinação moderada entre atividades e descanso.

#### Intense

Maior densidade de atividades.

### Regra

Ritmo influencia recomendação, mas não impõe decisão.

---

## 32. Objeto de valor Restrição

### Tipos

* mobilidade;
* alimentação;
* faixa etária;
* horário;
* transporte;
* acessibilidade;
* categoria evitada;
* restrição manual.

### Severidade

* preference;
* important;
* mandatory.

### Invariantes

* Restrições obrigatórias não podem ser ignoradas silenciosamente;
* conflito com Restrição deve ser comunicado;
* origem da Restrição deve ser identificável.

---

# Parte X — Lugar

## 33. Entidade Lugar

### Definição

Representa ponto de interesse potencialmente relevante para uma Viagem.

### Identidade

```text
PlaceId
```

### Atributos conceituais

* nome;
* Localização;
* categorias;
* descrição;
* imagens;
* horários;
* preço;
* avaliação;
* contatos;
* acessibilidade;
* público indicado;
* status operacional;
* fontes;
* última atualização.

---

## 34. Identidade do Lugar

A identidade interna não deverá depender exclusivamente de provedor externo.

Um Lugar poderá possuir:

* identificador interno;
* múltiplos identificadores externos;
* aliases;
* versões de dados.

---

## 35. Categorias de Lugar

Categorias iniciais:

* beach;
* restaurant;
* bar;
* nightclub;
* attraction;
* tour;
* viewpoint;
* shopping;
* cafe;
* park;
* cultural-site;
* transport-point;
* accommodation;
* custom.

Um Lugar poderá possuir múltiplas categorias.

---

## 36. Estado operacional do Lugar

Estados possíveis:

* open;
* temporarily-closed;
* permanently-closed;
* seasonal;
* unknown.

### Regra

Estado `unknown` não deve ser apresentado como aberto.

---

## 37. Informações do Lugar

Informações podem possuir diferentes níveis de confiança.

Exemplos:

* horário confirmado;
* preço estimado;
* acessibilidade não informada;
* endereço divergente;
* avaliação externa.

Cada informação relevante poderá possuir:

* valor;
* fonte;
* data;
* nível de confiança;
* status.

---

## 38. Objeto de valor Faixa de Preço

### Formas

* gratuito;
* faixa qualitativa;
* faixa monetária;
* por pessoa;
* por grupo;
* desconhecido.

### Invariantes

* moeda deve ser informada quando monetária;
* preço desatualizado deve ser identificado;
* ausência não é zero.

---

## 39. Objeto de valor Horário de Funcionamento

### Estrutura

* dia da semana;
* intervalos;
* exceções;
* data de vigência;
* fuso;
* fonte;
* confiança.

### Estados derivados

* provavelmente aberto;
* provavelmente fechado;
* informação insuficiente.

O RouteBook não deverá afirmar disponibilidade absoluta sem fonte adequada.

---

# Parte XI — Lugares Salvos

## 40. Entidade Lugar Salvo

### Identidade

```text
SavedPlaceId
```

### Relação

Associação entre Viagem e Lugar.

### Atributos

* Viagem;
* Lugar;
* data de salvamento;
* origem;
* observação;
* tags;
* prioridade opcional.

### Invariantes

* um Lugar deve ser salvo no máximo uma vez por Viagem;
* remover dos Salvos não remove Atividade;
* salvar não cria Atividade;
* um Lugar planejado pode não estar salvo.

---

## 41. Origem do salvamento

Possíveis origens:

* exploração;
* Mapa;
* recomendação;
* proposta;
* busca;
* ação manual.

---

# Parte XII — Roteiro

## 42. Agregado Roteiro

### Definição

Representa o planejamento atual da Viagem.

### Identidade

```text
ItineraryId
```

### Relação

Uma Viagem possui um Roteiro atual.

### Responsabilidades

* organizar Dias;
* ordenar Atividades;
* manter Períodos Livres;
* registrar versão;
* coordenar alterações;
* preservar consistência;
* permitir planejamento parcial.

---

## 43. Estados do Roteiro

* empty;
* partial;
* planned;
* with-conflicts;
* under-review;
* outdated.

### Outdated

O Roteiro pode ficar desatualizado quando:

* Hospedagem muda;
* transporte muda;
* Destino muda;
* Período muda;
* dados externos relevantes mudam.

---

## 44. Versão do Roteiro

O Roteiro deverá possuir versão lógica para:

* evitar sobrescrita concorrente;
* comparar Propostas;
* auditar alterações;
* detectar dados desatualizados.

---

## 45. Invariantes do Roteiro

1. Pertence a uma única Viagem.
2. Atividade pertence a um único Dia.
3. Dia pertence à mesma Viagem.
4. Ordem das Atividades deve ser determinística.
5. Atividades sem horário são permitidas.
6. Períodos Livres são permitidos.
7. Conflitos não impedem necessariamente salvamento.
8. Erros bloqueantes devem impedir operações específicas.
9. Reordenação deve recalcular dados derivados.
10. Proposta não altera o Roteiro sem aceitação.
11. Alterações devem produzir nova versão lógica.

---

# Parte XIII — Atividade

## 46. Entidade Atividade

### Identidade

```text
ActivityId
```

### Definição

Representa um compromisso planejado em um Dia da Viagem.

### Tipos

* place-visit;
* meal;
* tour;
* transport;
* rest;
* custom;
* check-in;
* check-out;
* free-form.

### Atributos

* título;
* tipo;
* Dia;
* Lugar opcional;
* horário inicial opcional;
* duração opcional;
* Localização opcional;
* observação;
* ordem;
* origem;
* status;
* flexibilidade.

---

## 47. Estados da Atividade

* planned;
* tentative;
* completed;
* skipped;
* cancelled;
* unavailable;
* needs-review.

---

## 48. Origem da Atividade

* manual;
* Lugar adicionado;
* proposta aceita;
* importação futura;
* duplicação;
* recomendação.

---

## 49. Flexibilidade da Atividade

### Fixed

Horário ou posição não deve ser alterado automaticamente.

### Flexible

Pode ser reorganizada mediante confirmação.

### Suggested

Foi sugerida e ainda pode ser revisada.

---

## 50. Invariantes da Atividade

* deve pertencer a um Dia;
* título não pode ser vazio;
* horário deve usar fuso da Viagem;
* duração não pode ser negativa;
* Lugar associado deve existir;
* Localização manual pode substituir ausência de Lugar;
* ordem deve ser válida dentro do Dia;
* remoção não deve apagar Lugar;
* mudança de Dia deve atualizar relacionamentos.

---

# Parte XIV — Período Livre

## 51. Entidade Período Livre

### Identidade

```text
FreePeriodId
```

### Definição

Representa intervalo intencionalmente não ocupado.

### Atributos

* Dia;
* início opcional;
* duração opcional;
* observação;
* modo;
* ordem.

### Modos

* flexible;
* protected.

### Invariantes

* período protegido não pode ser preenchido automaticamente;
* período flexível pode receber sugestão somente com decisão do usuário;
* ausência de horário é permitida;
* não deve ser tratado como falha de planejamento.

---

# Parte XV — Deslocamento

## 52. Conceito Deslocamento

### Definição

Representa movimento entre duas referências.

### Origem e destino

Podem ser:

* Hospedagem;
* Atividade;
* Lugar;
* Localização atual;
* endereço;
* ponto manual.

---

## 53. Objeto de valor Meio de Transporte

Valores iniciais:

* walking;
* driving;
* public-transit;
* ride-hailing;
* cycling;
* boat;
* custom.

---

## 54. Objeto de valor Estimativa de Deslocamento

### Estrutura

* origem;
* destino;
* Distância;
* duração;
* transporte;
* rota opcional;
* data de cálculo;
* fonte;
* confiança;
* validade.

### Estados

* calculating;
* available;
* estimated;
* unavailable;
* stale.

### Invariantes

* duração deve indicar que é estimada;
* fonte deve ser rastreável;
* mudança de origem invalida a estimativa;
* mudança de transporte invalida a estimativa;
* estimativa vencida não deve ser tratada como atual.

---

## 55. Deslocamento derivado

Deslocamentos entre Atividades são derivados da sequência do Roteiro.

Eles não deverão possuir identidade independente quando puderem ser recalculados.

---

# Parte XVI — Recomendação

## 56. Entidade Recomendação

### Identidade

```text
RecommendationId
```

### Definição

Sugestão produzida com base no contexto da Viagem.

### Tipos

* Lugar;
* Atividade;
* Dia;
* horário;
* ordem;
* Região;
* transporte;
* correção;
* alternativa.

### Atributos

* objeto recomendado;
* contexto;
* justificativas;
* evidências;
* score opcional;
* limitações;
* data;
* validade;
* origem;
* status.

---

## 57. Estados da Recomendação

* generated;
* presented;
* accepted;
* rejected;
* expired;
* invalidated.

---

## 58. Objeto de valor Contexto de Decisão

Pode incluir:

* Viagem;
* Destino;
* Hospedagem;
* Dia;
* horário;
* Preferências;
* Viajantes;
* orçamento;
* Ritmo;
* Restrições;
* Lugares Salvos;
* Roteiro;
* Distâncias;
* disponibilidade de dados.

---

## 59. Objeto de valor Justificativa

### Estrutura

* fator;
* descrição;
* evidência;
* peso opcional;
* limitação opcional.

### Exemplos

* proximidade da Hospedagem;
* compatibilidade com Interesse;
* mesma Região;
* faixa de preço;
* horário apropriado;
* adequação para crianças.

---

## 60. Invariantes da Recomendação

1. Deve possuir contexto.
2. Deve possuir pelo menos uma justificativa quando apresentada como personalizada.
3. Não deve ser aplicada automaticamente.
4. Deve identificar limitações relevantes.
5. Deve expirar quando o contexto muda.
6. Não deve contradizer Restrição obrigatória.
7. Score não deve ser apresentado como verdade absoluta.
8. Rejeição não deve exigir justificativa do usuário.

---

# Parte XVII — Proposta de Roteiro

## 61. Agregado Proposta de Roteiro

### Identidade

```text
ItineraryProposalId
```

### Definição

Representa uma alternativa de organização ainda não incorporada ao Roteiro.

### Atributos

* Viagem;
* versão base do Roteiro;
* Dias propostos;
* Atividades propostas;
* critérios;
* justificativas;
* conflitos;
* status;
* data de criação;
* validade.

---

## 62. Estados da Proposta

* generating;
* ready;
* partially-accepted;
* accepted;
* rejected;
* expired;
* failed;
* superseded.

---

## 63. Invariantes da Proposta

1. Deve referenciar versão base do Roteiro.
2. Não pode modificar o Roteiro enquanto `ready`.
3. Aceitação deve ser explícita.
4. Aceitação parcial deve aplicar apenas itens selecionados.
5. Proposta vencida deve ser recalculada antes da aplicação.
6. Conflitos conhecidos devem ser apresentados.
7. Rejeição preserva Roteiro atual.
8. Nova geração não deve apagar proposta anterior antes de concluir.

---

## 64. Atividade Proposta

Uma Atividade Proposta não é uma Atividade do Roteiro.

Ela somente se torna Atividade após aceitação.

---

# Parte XVIII — Conflitos

## 65. Entidade Conflito

### Identidade

```text
ConflictId
```

### Definição

Representa condição detectada que afeta ou pode afetar o planejamento.

### Severidades

* error;
* risk;
* suggestion.

### Categorias

* temporal;
* geographic;
* availability;
* restriction;
* budget;
* intensity;
* transport;
* data-quality;
* dependency;
* structural.

---

## 66. Estados do Conflito

* open;
* resolved;
* ignored;
* invalidated;
* superseded.

---

## 67. Exemplos

### Erro

Atividades incompatíveis que impedem determinada operação.

### Risco

Intervalo de deslocamento curto.

### Sugestão

Reorganização que pode reduzir Distância.

---

## 68. Invariantes do Conflito

* deve possuir objeto afetado;
* deve possuir severidade;
* deve possuir descrição;
* deve possuir evidência ou regra;
* erro bloqueante não pode ser ignorado;
* risco pode ser ignorado quando permitido;
* resolução deve registrar causa;
* mudança de contexto pode invalidá-lo.

---

## 69. Conflitos derivados

Conflitos deverão preferencialmente ser derivados do estado atual.

Não deverão ser tratados como verdade permanente.

---

# Parte XIX — Proveniência e qualidade dos dados

## 70. Entidade Fonte de Dados

### Identidade

```text
DataSourceId
```

### Tipos

* internal;
* user-provided;
* provider;
* public-dataset;
* partner;
* ai-generated;
* inferred.

### Atributos

* nome;
* tipo;
* confiabilidade;
* política de atualização;
* termos;
* status.

---

## 71. Objeto de valor Proveniência

### Estrutura

* fonte;
* identificador externo;
* data de coleta;
* data de atualização;
* método;
* confiança;
* licença opcional.

---

## 72. Nível de confiança

Valores conceituais:

* confirmed;
* high;
* medium;
* low;
* unknown.

### Regra

Confiança representa qualidade da evidência, não certeza absoluta.

---

## 73. Estado de atualização

* current;
* stale;
* unknown;
* conflicting;
* unavailable.

---

## 74. Dados conflitantes

Quando fontes divergirem:

* não escolher silenciosamente sem regra;
* preservar proveniência;
* priorizar fonte adequada;
* comunicar incerteza quando relevante;
* permitir revisão futura.

---

# Parte XX — Objetos de valor principais

## 75. Lista inicial

* TripPeriod;
* Destination;
* Location;
* Region;
* Budget;
* Pace;
* Interest;
* Restriction;
* PriceRange;
* OpeningHours;
* TransportMode;
* TravelEstimate;
* DecisionContext;
* RecommendationReason;
* Provenance;
* ConfidenceLevel;
* DateTimeRange;
* CurrencyAmount;
* Address;
* DataFreshness.

---

## 76. Características dos objetos de valor

Objetos de valor deverão:

* não possuir identidade própria;
* ser definidos por seus atributos;
* ser imutáveis conceitualmente;
* validar invariantes na criação;
* permitir comparação por valor;
* evitar uso de primitivas sem significado.

---

# Parte XXI — Agregados

## 77. Agregados iniciais

### Trip Aggregate

Raiz:

```text
Trip
```

Contém ou coordena:

* Destino;
* Período;
* Hospedagem;
* Viajantes;
* Preferências;
* Lugares Salvos;
* referência ao Roteiro.

### Itinerary Aggregate

Raiz:

```text
Itinerary
```

Contém:

* Dias;
* Atividades;
* Períodos Livres;
* versão.

### Proposal Aggregate

Raiz:

```text
ItineraryProposal
```

Contém:

* Dias propostos;
* Atividades propostas;
* conflitos;
* critérios.

### Place Aggregate

Raiz:

```text
Place
```

Contém:

* dados do Lugar;
* categorias;
* informações;
* proveniência.

---

## 78. Limites de consistência

Operações que exigem consistência imediata:

* criar Viagem;
* alterar Período;
* adicionar Atividade;
* mover Atividade;
* aceitar Proposta;
* excluir Viagem;
* alterar owner;
* aplicar Restrição obrigatória.

Operações que podem ser eventualmente consistentes:

* recalcular Distâncias;
* atualizar Recomendações;
* atualizar avaliação;
* sincronizar dados externos;
* reavaliar Conflitos;
* gerar Proposta.

---

# Parte XXII — Serviços de domínio

## 79. TripPeriodService

Responsável por:

* validar Período;
* gerar Dias;
* identificar impacto de redução;
* calcular estado temporal.

---

## 80. TravelEstimationService

Responsável por:

* calcular Distância;
* estimar Tempo;
* validar origem e destino;
* indicar validade;
* produzir proveniência.

---

## 81. RecommendationService

Responsável por:

* construir Contexto de Decisão;
* produzir Recomendações;
* gerar justificativas;
* respeitar Restrições;
* invalidar sugestões obsoletas.

---

## 82. ItineraryPlanningService

Responsável por:

* sugerir organização;
* distribuir Atividades;
* respeitar Períodos Livres;
* considerar Ritmo;
* considerar Distâncias;
* produzir Proposta.

---

## 83. ConflictDetectionService

Responsável por:

* detectar sobreposição;
* avaliar deslocamento;
* avaliar intensidade;
* verificar Restrições;
* classificar severidade;
* reavaliar após alterações.

---

## 84. PlaceResolutionService

Responsável por:

* reconciliar identificadores externos;
* detectar duplicações;
* consolidar fontes;
* preservar proveniência.

---

# Parte XXIII — Eventos de domínio

## 85. Eventos da Viagem

* TripCreated;
* TripPlanningCompleted;
* TripDestinationChanged;
* TripPeriodChanged;
* TripAccommodationChanged;
* TripCancelled;
* TripArchived.

---

## 86. Eventos de participantes e Preferências

* TravelerAdded;
* TravelerRemoved;
* TripPreferenceChanged;
* RestrictionAdded;
* RestrictionRemoved;
* TransportModeChanged;
* PaceChanged.

---

## 87. Eventos de Lugares

* PlaceSaved;
* PlaceUnsaved;
* PlaceDataUpdated;
* PlaceMarkedUnavailable;
* PlacePlanned.

---

## 88. Eventos do Roteiro

* ActivityAdded;
* ActivityUpdated;
* ActivityRemoved;
* ActivityMoved;
* ActivityMovedToAnotherDay;
* FreePeriodAdded;
* FreePeriodUpdated;
* FreePeriodRemoved;
* ItineraryReordered;
* ItineraryMarkedOutdated.

---

## 89. Eventos de Proposta

* ItineraryProposalRequested;
* ItineraryProposalGenerated;
* ItineraryProposalFailed;
* ItineraryProposalAccepted;
* ItineraryProposalPartiallyAccepted;
* ItineraryProposalRejected;
* ItineraryProposalExpired.

---

## 90. Eventos de Conflito

* ConflictDetected;
* ConflictResolved;
* ConflictIgnored;
* ConflictInvalidated.

---

## 91. Características dos eventos

Eventos deverão:

* representar fato ocorrido;
* utilizar passado;
* ser imutáveis;
* possuir identificador;
* possuir data;
* possuir correlação;
* indicar agregado;
* evitar dados sensíveis desnecessários.

---

# Parte XXIV — Comandos conceituais

## 92. Comandos da Viagem

* CreateTrip;
* UpdateTripDestination;
* UpdateTripPeriod;
* UpdateAccommodation;
* AddTraveler;
* RemoveTraveler;
* UpdateTripPreferences;
* CancelTrip;
* ArchiveTrip.

---

## 93. Comandos de Lugares

* SavePlace;
* UnsavePlace;
* AddPlaceToItinerary;
* OpenPlaceDetails.

---

## 94. Comandos do Roteiro

* AddActivity;
* UpdateActivity;
* RemoveActivity;
* MoveActivity;
* MoveActivityToDay;
* AddFreePeriod;
* ReorderDay;
* MarkDayFree.

---

## 95. Comandos de Proposta

* RequestItineraryProposal;
* AcceptProposal;
* AcceptProposalPartially;
* RejectProposal;
* RegenerateProposal.

---

## 96. Comandos de Conflito

* ReviewConflicts;
* ResolveConflict;
* IgnoreRisk;
* RestoreIgnoredRisk.

---

# Parte XXV — Regras derivadas

## 97. Estado temporal da Viagem

```text
hoje < início
→ Planned

início ≤ hoje ≤ término
→ InProgress

hoje > término
→ Completed
```

O status manual poderá coexistir com estado temporal em casos como cancelamento.

---

## 98. Lugar Planejado

Um Lugar está planejado quando existe pelo menos uma Atividade ativa associada a ele.

---

## 99. Dia vazio

Um Dia está vazio quando não possui:

* Atividade;
* Período Livre.

Um Dia com Período Livre não é vazio.

---

## 100. Roteiro parcial

O Roteiro é parcial quando:

* possui pelo menos uma Atividade;
* nem todos os Dias possuem conteúdo planejado;
* ou existem Atividades sem horário.

---

## 101. Dados desatualizados

Um dado poderá ser considerado desatualizado por:

* tempo;
* mudança de contexto;
* mudança de fonte;
* alteração estrutural;
* erro de sincronização.

---

# Parte XXVI — Invariantes transversais

## 102. Controle do usuário

Nenhuma Recomendação ou Proposta deverá:

* alterar Roteiro;
* remover Atividade;
* substituir Preferência;
* ignorar Restrição;

sem decisão explícita.

---

## 103. Preservação

Falhas externas não deverão apagar:

* Viagem;
* Roteiro;
* Preferências;
* alterações locais;
* Proposta anterior válida.

---

## 104. Proveniência

Informações externas relevantes deverão possuir origem identificável.

---

## 105. Estimativas

Estimativas deverão:

* ser rotuladas;
* possuir validade;
* possuir fonte;
* poder ficar desatualizadas.

---

## 106. Identidade

Entidades internas não deverão utilizar identificadores externos como única identidade.

---

## 107. Exclusão

Exclusões deverão distinguir:

* remoção lógica;
* arquivamento;
* cancelamento;
* anonimização;
* exclusão definitiva.

A política técnica será definida posteriormente.

---

# Parte XXVII — Consistência temporal

## 108. Fuso horário

A Viagem deverá possuir fuso horário principal.

Datas e horários de:

* Dias;
* Atividades;
* horários de funcionamento;
* eventos;

deverão ser interpretados no fuso adequado.

---

## 109. Datas sem horário

Datas de Viagem deverão utilizar data local.

Não deverão ser convertidas implicitamente para UTC como instante.

---

## 110. Horários externos

Horários de Lugares devem utilizar fuso da Localização do Lugar.

---

## 111. Travessia de fusos

O domínio deverá permitir futuramente:

* Viagens com múltiplos Destinos;
* mudança de fuso;
* deslocamentos longos.

O MVP poderá assumir um fuso principal por Viagem.

---

# Parte XXVIII — Privacidade e sensibilidade

## 112. Dados pessoais

Podem incluir:

* nome;
* e-mail;
* Preferências;
* necessidades;
* Restrições;
* Localização atual.

---

## 113. Minimização

O domínio deverá armazenar apenas dados necessários.

Exemplos:

* utilizar faixa etária em vez de data de nascimento quando suficiente;
* evitar diagnóstico médico;
* registrar necessidade funcional quando apropriado;
* evitar localização contínua sem necessidade.

---

## 114. Localização atual

Deverá ser:

* opcional;
* autorizada;
* temporária quando possível;
* não necessária para planejamento básico.

---

# Parte XXIX — Extensibilidade

## 115. Múltiplos Destinos

O modelo futuro poderá evoluir de:

```text
Viagem
→ um Destino
```

para:

```text
Viagem
→ múltiplas Etapas
→ cada Etapa possui Destino e Período
```

Essa evolução não deverá ser antecipada na implementação sem necessidade, mas o modelo não deverá impedir completamente sua adoção.

---

## 116. Múltiplas Hospedagens

Poderão ser representadas futuramente por período.

---

## 117. Colaboração

O modelo de participação deverá permitir:

* múltiplos editores;
* comentários;
* decisões;
* conflitos de edição;
* aprovação.

---

## 118. Reservas

Reservas futuras poderão associar:

* Lugar;
* Atividade;
* confirmação;
* fornecedor;
* custo;
* política.

Reserva não deverá ser incorporada prematuramente como atributo de Lugar.

---

# Parte XXX — Anti-patterns de domínio

## 119. Entidade Deus

Não concentrar em `Trip` todas as regras e dados sem limites claros.

---

## 120. Modelo anêmico

Não deslocar todas as invariantes para serviços externos sem responsabilidade nos agregados.

---

## 121. Persistência orientando o domínio

Não definir conceitos apenas com base em tabelas ou documentos externos.

---

## 122. Primitivas sem significado

Evitar representar tudo como:

* string;
* number;
* boolean;
* array.

Exemplos que exigem tipos próprios:

* Distância;
* moeda;
* Período;
* Localização;
* confiança;
* fuso;
* Restrição.

---

## 123. Status genérico

Evitar um único campo `status` com significados diferentes.

---

## 124. Duplicação de conceitos

Evitar entidades paralelas como:

```text
TouristSpot
Place
Attraction
LocationItem
```

sem distinção real.

---

## 125. IA como autoridade

Não modelar resposta de IA como estado definitivo do domínio.

---

## 126. Dados derivados persistidos sem necessidade

Evitar persistir permanentemente:

* quantidade de Dias;
* estado Planejado do Lugar;
* duração total;
* estado temporal;

quando puderem ser derivados com segurança.

---

# Parte XXXI — Matriz de entidades

## 127. Entidades principais

| Entidade          | Identidade          | Agregado              |
| ----------------- | ------------------- | --------------------- |
| Account           | AccountId           | Account               |
| User              | UserId              | Account               |
| Trip              | TripId              | Trip                  |
| Traveler          | TravelerId          | Trip                  |
| Accommodation     | AccommodationId     | Trip                  |
| TripDay           | TripDayId           | Itinerary             |
| Itinerary         | ItineraryId         | Itinerary             |
| Activity          | ActivityId          | Itinerary             |
| FreePeriod        | FreePeriodId        | Itinerary             |
| Place             | PlaceId             | Place                 |
| SavedPlace        | SavedPlaceId        | Trip                  |
| Recommendation    | RecommendationId    | Recommendation        |
| ItineraryProposal | ItineraryProposalId | Proposal              |
| Conflict          | ConflictId          | Itinerary ou Proposal |
| DataSource        | DataSourceId        | Data                  |

---

## 128. Objetos de valor principais

| Objeto               | Uso                        |
| -------------------- | -------------------------- |
| TripPeriod           | Período da Viagem          |
| Destination          | Destino                    |
| Location             | Coordenada e endereço      |
| Region               | Área geográfica            |
| Budget               | Referência financeira      |
| Pace                 | Ritmo                      |
| Interest             | Interesse                  |
| Restriction          | Restrição                  |
| PriceRange           | Faixa de preço             |
| OpeningHours         | Horário de funcionamento   |
| TransportMode        | Meio de transporte         |
| TravelEstimate       | Estimativa de deslocamento |
| DecisionContext      | Contexto de recomendação   |
| RecommendationReason | Justificativa              |
| Provenance           | Origem do dado             |
| ConfidenceLevel      | Confiança                  |
| DataFreshness        | Atualidade                 |

---

# Parte XXXII — Rastreabilidade com o produto

## 129. Conceitos e áreas do produto

| Conceito          | Área                               |
| ----------------- | ---------------------------------- |
| Trip              | Minhas Viagens e Visão Geral       |
| Destination       | Criar Viagem e Configurações       |
| Accommodation     | Criar Viagem, Mapa e Configurações |
| Traveler          | Criar Viagem e Configurações       |
| Preference        | Configurações e personalização     |
| Place             | Explorar e Detalhes                |
| SavedPlace        | Salvos                             |
| Itinerary         | Roteiro                            |
| Activity          | Roteiro                            |
| FreePeriod        | Roteiro                            |
| TravelEstimate    | Mapa e Roteiro                     |
| Recommendation    | Explorar e Visão Geral             |
| ItineraryProposal | Proposta                           |
| Conflict          | Revisão                            |

---

## 130. Conceitos e componentes

| Conceito       | Componentes                             |
| -------------- | --------------------------------------- |
| Trip           | Trip Card, Trip Header, Trip Summary    |
| Place          | Place Card, Place Summary, Place Status |
| Activity       | Activity Card                           |
| FreePeriod     | Free Period Card                        |
| TravelEstimate | Travel Time                             |
| Recommendation | Recommendation Reason                   |
| Conflict       | Conflict Item, Conflict Summary         |
| Proposal       | Proposal Day, Proposal Activity         |

---

# Parte XXXIII — Critérios de aceite

## 131. Linguagem

* conceitos possuem nomes únicos;
* termos oficiais estão alinhados à Bible;
* sinônimos conflitantes foram eliminados;
* termos de interface possuem correspondência conceitual.

---

## 132. Entidades

* entidades possuem identidade;
* ciclo de vida está definido;
* responsabilidades estão claras;
* estados estão documentados.

---

## 133. Objetos de valor

* valores importantes possuem tipos conceituais;
* invariantes estão definidas;
* primitivas ambíguas foram reduzidas;
* imutabilidade conceitual está preservada.

---

## 134. Agregados

* raízes estão definidas;
* limites de consistência estão claros;
* responsabilidades não estão excessivamente concentradas;
* relações entre agregados utilizam identidade.

---

## 135. Recomendações e IA

* recomendação não é decisão;
* justificativa é obrigatória quando personalizada;
* limitações são preservadas;
* Proposta não altera Roteiro automaticamente;
* contexto e validade são definidos.

---

## 136. Dados

* proveniência está contemplada;
* confiança está contemplada;
* dados desatualizados são representados;
* divergência de fontes é suportada.

---

## 137. Planejamento

* planejamento parcial é válido;
* Atividade sem horário é válida;
* Período Livre é válido;
* Salvo e Planejado são independentes;
* Conflitos possuem severidades.

---

# Parte XXXIV — Governança do modelo

## 138. Inclusão de conceito

Um novo conceito deverá:

* resolver necessidade de domínio;
* possuir definição;
* não duplicar conceito existente;
* possuir responsabilidade;
* possuir invariantes;
* estar relacionado à linguagem ubíqua;
* possuir rastreabilidade.

---

## 139. Alteração de conceito

Uma alteração deverá revisar:

* Bible;
* PRD;
* UX;
* Design System;
* Arquitetura;
* Dados;
* testes;
* prompts;
* analytics.

---

## 140. Depreciação

Conceitos obsoletos deverão:

* ser marcados;
* possuir substituto;
* possuir migração;
* preservar histórico;
* evitar remoção abrupta.

---

## 141. Decisões de domínio

Mudanças estruturais deverão possuir registro de decisão.

Exemplos:

* múltiplos Destinos;
* múltiplas Hospedagens;
* colaboração;
* reservas;
* identidade de Lugares;
* proveniência.

---

## 142. Uso por agentes de IA

Agentes deverão:

* consultar este modelo;
* utilizar termos oficiais;
* respeitar invariantes;
* não criar entidades sem necessidade;
* não confundir Recomendação com decisão;
* não aplicar Proposta automaticamente;
* preservar proveniência;
* indicar lacunas;
* produzir saída rastreável.

---

## 143. Checklist de revisão

Antes de aprovar este documento, verificar:

* linguagem ubíqua está definida;
* entidades estão identificadas;
* objetos de valor estão identificados;
* agregados estão definidos;
* estados estão definidos;
* invariantes estão definidas;
* serviços de domínio estão definidos;
* eventos estão definidos;
* comandos estão definidos;
* Recomendações estão modeladas;
* Propostas estão modeladas;
* Conflitos estão modelados;
* proveniência está modelada;
* consistência temporal está definida;
* privacidade está contemplada;
* extensibilidade está contemplada;
* anti-patterns estão definidos;
* rastreabilidade está presente;
* critérios de aceite estão definidos;
* governança está definida.

---

## 144. Declaração final

O Modelo de Domínio do RouteBook estabelece a representação conceitual oficial do produto.

Ele define como o RouteBook compreende:

* Usuários;
* Viagens;
* Destinos;
* Hospedagens;
* Viajantes;
* Preferências;
* Lugares;
* Salvos;
* Dias;
* Atividades;
* Roteiros;
* Períodos Livres;
* Deslocamentos;
* Recomendações;
* Propostas;
* Conflitos;
* Fontes de Dados.

Esse modelo deverá garantir que produto, UX, arquitetura, dados, IA, desenvolvimento e QA utilizem os mesmos conceitos e preservem as mesmas regras.

O RouteBook deverá continuar sendo um sistema de apoio à decisão.

Seu domínio não deverá transformar sugestões em ordens, estimativas em garantias ou automação em perda de controle do usuário.
