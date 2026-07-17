---

id: RB-DOM-002

title: Linguagem Ubíqua e Glossário de Domínio
description: Define o vocabulário oficial do domínio do RouteBook, incluindo conceitos, definições, relações semânticas, termos permitidos, termos proibidos e regras de nomenclatura.

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
- ubiquitous-language
- glossary
- terminology
- semantics
- knowledge-management
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

prerequisites:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
- RB-DOM-001

next_documents:

- RB-DOM-003
- RB-DOM-004
- RB-ARC-001
- RB-DATA-001
- RB-QA-001

ai_context:
priority: critical
index: true
---

# RouteBook — Linguagem Ubíqua e Glossário de Domínio

## 1. Propósito deste documento

Este documento define a linguagem ubíqua oficial do RouteBook.

Seu objetivo é garantir que pessoas, documentos, sistemas e agentes de IA utilizem os mesmos termos com o mesmo significado.

A linguagem definida aqui deverá ser utilizada em:

* produto;
* documentação;
* interface;
* arquitetura;
* código;
* APIs;
* eventos;
* dados;
* testes;
* analytics;
* prompts;
* agentes de IA;
* suporte;
* decisões de produto.

Este documento define:

* termos oficiais;
* definições normativas;
* relações conceituais;
* diferenças entre termos próximos;
* sinônimos permitidos;
* sinônimos proibidos;
* convenções de nomenclatura;
* termos de interface;
* termos técnicos;
* termos de domínio;
* regras de tradução;
* critérios de inclusão e alteração;
* governança semântica.

Este documento não substitui o Modelo de Domínio.

O `RB-DOM-001 — Modelo de Domínio` define a estrutura conceitual, as entidades, os objetos de valor, os agregados, os estados e as invariantes.

Este documento define como esses conceitos deverão ser nomeados e compreendidos.

---

## 2. Objetivo da linguagem ubíqua

A linguagem ubíqua deverá reduzir:

* ambiguidade;
* uso inconsistente de sinônimos;
* divergência entre produto e tecnologia;
* interpretações conflitantes;
* conceitos duplicados;
* traduções inadequadas;
* regras implícitas;
* respostas incorretas de agentes de IA.

Ela deverá aumentar:

* precisão;
* alinhamento;
* rastreabilidade;
* consistência;
* compreensão;
* qualidade documental;
* qualidade de implementação;
* interoperabilidade entre agentes.

---

## 3. Princípios semânticos

A linguagem do RouteBook deverá seguir estes princípios:

1. Cada conceito central deve possuir um termo oficial.
2. Termos diferentes não devem representar o mesmo conceito sem necessidade.
3. O mesmo termo não deve possuir múltiplos significados no mesmo contexto.
4. Termos de interface devem refletir conceitos de domínio.
5. Termos técnicos não devem substituir conceitos de produto.
6. Conceitos externos devem ser traduzidos para a linguagem interna.
7. Identificadores técnicos devem preservar o significado do domínio.
8. Abreviações devem ser limitadas.
9. Sinônimos informais não devem virar conceitos paralelos.
10. Termos gerados por IA devem ser validados contra este glossário.
11. Definições devem explicar limites, não apenas descrições.
12. Conceitos estimados e confirmados devem ser diferenciados.
13. Automação, sugestão e decisão devem permanecer semanticamente separadas.
14. A terminologia deve funcionar em português e permitir internacionalização.
15. Mudanças semânticas devem ser versionadas.

---

# Parte I — Regras de uso

## 4. Termo normativo

Um termo normativo é a denominação oficial de um conceito.

Exemplo:

```text
Viagem
```

Esse termo deverá ser preferido em:

* documentação;
* nomes conceituais;
* interface;
* código de domínio;
* eventos;
* testes.

---

## 5. Termo de interface

Um termo de interface é a forma natural apresentada ao usuário.

Exemplo documental:

```text
Proposta de Roteiro
```

Exemplo na interface:

```text
Proposta de roteiro
```

A diferença de capitalização não altera o conceito.

---

## 6. Termo técnico

Um termo técnico representa o conceito em estruturas de implementação.

Exemplo:

```text
Trip
TripId
TripCreated
```

O termo técnico deverá manter correspondência explícita com o termo de domínio.

---

## 7. Sinônimo permitido

Um sinônimo permitido poderá ser utilizado apenas em contexto específico sem criar novo conceito.

Exemplo:

* `data inicial` como rótulo de campo para o atributo inicial do `Período da Viagem`;
* `data de início` como forma textual equivalente.

Sinônimos permitidos não deverão ser usados como nomes de entidades concorrentes.

---

## 8. Sinônimo proibido

Um sinônimo será proibido quando:

* causar ambiguidade;
* misturar conceitos;
* criar entidade duplicada;
* contrariar a terminologia oficial;
* reduzir precisão.

Exemplo:

```text
Ponto turístico
```

Não deverá substituir genericamente `Lugar`, porque nem todo Lugar é turístico.

---

## 9. Capitalização

### Documentação de domínio

Conceitos centrais poderão utilizar inicial maiúscula:

* Viagem;
* Lugar;
* Atividade;
* Roteiro;
* Hospedagem;
* Recomendação.

### Interface

Utilizar capitalização natural:

* Criar viagem;
* Adicionar ao roteiro;
* Detalhes do lugar;
* Alterar hospedagem.

### Código

Utilizar convenções técnicas da linguagem:

```text
Trip
Place
Activity
ItineraryProposal
```

---

## 10. Singular e plural

O singular deverá nomear o conceito.

Exemplo:

```text
Lugar
```

O plural deverá representar uma coleção:

```text
Lugares
```

Nomes de entidades, tipos e eventos deverão evitar plural quando representam um único objeto.

---

## 11. Idioma

A linguagem conceitual canônica deste documento será escrita em português do Brasil.

A implementação poderá utilizar termos técnicos em inglês, desde que exista correspondência oficial registrada.

---

# Parte II — Mapa terminológico

## 12. Núcleo conceitual

```text
Conta
└── Usuário
    └── participa de Viagem

Viagem
├── Destino
├── Período da Viagem
├── Hospedagem
├── Viajantes
├── Preferências
├── Lugares Salvos
├── Roteiro
├── Recomendações
├── Propostas de Roteiro
└── Conflitos

Roteiro
└── Dias da Viagem
    ├── Atividades
    ├── Períodos Livres
    └── Deslocamentos derivados

Lugar
├── Localização
├── Categorias
├── Informações
├── Fontes de Dados
└── Proveniência
```

---

## 13. Relações semânticas centrais

```text
Usuário cria ou participa de Viagem.

Viagem possui um Destino principal.

Viagem possui um Período.

Período gera Dias da Viagem.

Roteiro organiza os Dias da Viagem.

Dia da Viagem contém Atividades e Períodos Livres.

Atividade pode referenciar um Lugar.

Lugar pode ser Salvo.

Lugar pode ser Planejado por meio de uma Atividade.

Recomendação sugere uma decisão.

Proposta de Roteiro sugere uma organização.

Conflito representa uma condição identificada no planejamento.
```

---

# Parte III — Identidade e acesso

## 14. Conta

### Definição

Contexto de propriedade, acesso e organização de dados no RouteBook.

### Termo técnico

```text
Account
```

### Não significa

* Usuário;
* perfil;
* sessão;
* assinatura;
* Viagem.

### Termos relacionados

* Usuário;
* acesso;
* papel;
* permissão.

### Sinônimos proibidos

* cadastro, quando utilizado como entidade;
* login;
* perfil de usuário;
* workspace, sem decisão explícita de produto.

---

## 15. Usuário

### Definição

Pessoa identificada que utiliza o RouteBook por meio de uma Conta.

### Termo técnico

```text
User
```

### Não significa

* Viajante;
* participante;
* Conta;
* proprietário da Viagem.

Um Usuário pode ser um Viajante, mas os conceitos não são equivalentes.

### Sinônimos permitidos

* pessoa usuária, em textos inclusivos;
* usuário autenticado, quando o estado de autenticação for relevante.

### Sinônimos proibidos

* cliente, sem contexto comercial;
* passageiro;
* turista;
* viajante, quando a referência for à identidade de acesso.

---

## 16. Sessão

### Definição

Período técnico de autenticação ou interação reconhecida.

### Termo técnico

```text
Session
```

### Não significa

* Conta;
* Usuário;
* Viagem;
* atividade turística.

---

## 17. Papel de participação

### Definição

Nível de autoridade de um Usuário dentro de uma Viagem.

### Termo técnico

```text
TripRole
```

### Valores iniciais

* owner;
* editor;
* viewer.

### Termos em português

* proprietário;
* editor;
* visualizador.

### Regra

O papel representa autorização, não relação pessoal entre Viajantes.

---

## 18. Permissão

### Definição

Capacidade concedida para executar uma ação.

### Termo técnico

```text
Permission
```

### Não significa

* papel;
* consentimento;
* Preferência.

Um papel pode conceder várias permissões.

---

# Parte IV — Viagem

## 19. Viagem

### Definição

Contexto principal no qual o RouteBook organiza Destino, Período, Viajantes, Preferências, Lugares e planejamento.

### Termo técnico

```text
Trip
```

### Não significa

* Roteiro;
* Destino;
* passeio;
* reserva;
* deslocamento;
* férias.

### Exemplos

* Viagem para Pipa;
* Viagem para Águas de Lindóia;
* Viagem de agosto.

### Sinônimos permitidos

Nenhum sinônimo deverá substituir o conceito de forma geral.

Em conteúdo natural, poderá ser utilizada a expressão:

```text
sua viagem
```

### Sinônimos proibidos

* projeto;
* roteiro;
* excursão;
* pacote;
* jornada, como entidade;
* destino.

---

## 20. Viagem ativa

### Definição

Viagem atualmente selecionada como contexto de uso.

### Termo técnico

```text
ActiveTrip
```

### Regra

`Ativa` neste contexto significa selecionada na aplicação, não necessariamente em andamento na data atual.

---

## 21. Viagem em andamento

### Definição

Viagem cujo Período inclui a data atual.

### Termo técnico

```text
TripInProgress
```

### Não significa

* Viagem ativa;
* Viagem aberta na interface;
* Roteiro completo.

---

## 22. Viagem planejada

### Definição

Viagem criada e disponível para planejamento antes de seu início.

### Termo técnico

```text
PlannedTrip
```

### Regra

Uma Viagem planejada pode possuir Roteiro vazio ou parcial.

---

## 23. Viagem concluída

### Definição

Viagem cujo Período terminou.

### Termo técnico

```text
CompletedTrip
```

### Regra

Concluída representa estado temporal e não significa que todas as Atividades foram realizadas.

---

## 24. Viagem cancelada

### Definição

Viagem explicitamente marcada como não realizada ou interrompida.

### Termo técnico

```text
CancelledTrip
```

### Não significa

* excluída;
* arquivada;
* concluída.

---

## 25. Viagem arquivada

### Definição

Viagem preservada, mas retirada das visualizações principais.

### Termo técnico

```text
ArchivedTrip
```

### Não significa

* excluída;
* cancelada.

---

## 26. Rascunho de Viagem

### Definição

Viagem cuja criação ainda não atingiu o contexto mínimo necessário.

### Termo técnico

```text
TripDraft
```

### Interface preferida

```text
Continuar criação
```

### Sinônimo permitido

* criação incompleta.

### Sinônimos proibidos

* viagem inválida;
* viagem quebrada.

---

# Parte V — Destino e território

## 27. Destino

### Definição

Região geográfica principal associada à Viagem.

### Termo técnico

```text
Destination
```

### Pode representar

* cidade;
* distrito;
* ilha;
* parque;
* região;
* área personalizada.

### Não significa

* Lugar;
* endereço;
* Hospedagem;
* Marcador;
* rota;
* ponto final de um Deslocamento.

### Sinônimos proibidos

* localização, como substituição geral;
* cidade, porque um Destino pode não ser uma cidade;
* região, quando se refere ao conceito principal da Viagem.

---

## 28. Região

### Definição

Área geográfica utilizada para agrupamento, busca, recomendação ou visualização.

### Termo técnico

```text
Region
```

### Exemplos

* Centro de Pipa;
* região da Praia do Madeiro;
* área próxima à Hospedagem.

### Não significa

* Destino;
* Localização;
* bairro necessariamente;
* divisão administrativa oficial.

---

## 29. Localização

### Definição

Referência geográfica de um objeto, composta principalmente por coordenadas e, opcionalmente, endereço.

### Termo técnico

```text
Location
```

### Não significa

* localização atual do Usuário exclusivamente;
* endereço;
* Lugar;
* Região.

---

## 30. Coordenada

### Definição

Par de latitude e longitude utilizado para representar um ponto geográfico.

### Termo técnico

```text
GeoCoordinate
```

### Estrutura

* latitude;
* longitude.

### Não significa

* Localização completa;
* endereço;
* Região.

---

## 31. Endereço

### Definição

Representação textual e estruturada de uma Localização.

### Termo técnico

```text
Address
```

### Pode conter

* logradouro;
* número;
* complemento;
* bairro;
* cidade;
* estado;
* país;
* código postal.

### Regra

Endereço e coordenada podem existir separadamente.

---

## 32. Fuso horário

### Definição

Regra temporal utilizada para interpretar datas e horários em uma Localização ou Viagem.

### Termo técnico

```text
TimeZone
```

### Regra

Não utilizar apenas diferença fixa de UTC quando um identificador de fuso for necessário.

---

# Parte VI — Período e tempo

## 33. Período da Viagem

### Definição

Intervalo de datas entre o início e o término da Viagem.

### Termo técnico

```text
TripPeriod
```

### Composição

* data inicial;
* data final;
* fuso horário.

### Não significa

* duração;
* intervalo de uma Atividade;
* disponibilidade;
* temporada.

---

## 34. Data inicial

### Definição

Primeira data do Período da Viagem.

### Termo técnico

```text
startDate
```

### Termos de interface permitidos

* Data de início;
* Início.

---

## 35. Data final

### Definição

Última data do Período da Viagem.

### Termo técnico

```text
endDate
```

### Termos de interface permitidos

* Data de término;
* Término;
* Data final.

---

## 36. Duração da Viagem

### Definição

Quantidade derivada de Dias da Viagem contidos no Período.

### Termo técnico

```text
tripDuration
```

### Regra

Não deverá ser informada de forma independente quando puder ser calculada.

---

## 37. Dia da Viagem

### Definição

Unidade temporal do Roteiro associada a uma data local específica do Período da Viagem.

### Termo técnico

```text
TripDay
```

### Não significa

* dia do calendário genérico;
* período de 24 horas em UTC;
* etapa de criação;
* atividade diária.

### Sinônimos permitidos

* Dia, quando o contexto da Viagem estiver claro.

### Sinônimos proibidos

* agenda;
* roteiro diário, como entidade concorrente;
* jornada.

---

## 38. Dia atual

### Definição

Dia da Viagem cuja data corresponde à data atual no fuso da Viagem.

### Termo técnico

```text
CurrentTripDay
```

### Não significa

* Dia selecionado;
* Dia planejado.

---

## 39. Dia selecionado

### Definição

Dia da Viagem atualmente aberto na interface.

### Termo técnico

```text
SelectedTripDay
```

### Regra

Pode ser passado, atual ou futuro.

---

## 40. Dia vazio

### Definição

Dia da Viagem sem Atividades e sem Períodos Livres.

### Termo técnico

```text
EmptyTripDay
```

### Não significa

* erro;
* dado ausente;
* planejamento incompleto necessariamente.

---

## 41. Dia livre

### Definição

Dia da Viagem mantido intencionalmente sem compromissos ou com um Período Livre que representa essa decisão.

### Termo técnico

```text
FreeTripDay
```

### Diferença

`Dia vazio` descreve ausência de conteúdo.

`Dia livre` descreve uma intenção de planejamento.

---

## 42. Intervalo

### Definição

Espaço temporal entre dois instantes ou atividades.

### Termo técnico

```text
TimeInterval
```

### Não significa

* Período da Viagem;
* Período Livre;
* duração.

---

# Parte VII — Hospedagem

## 43. Hospedagem

### Definição

Referência de permanência utilizada na Viagem e nos cálculos contextuais.

### Termo técnico

```text
Accommodation
```

### Pode representar

* hotel;
* pousada;
* aluguel;
* residência;
* hostel;
* referência aproximada.

### Não significa

* Lugar genérico;
* endereço apenas;
* reserva;
* quarto;
* estabelecimento necessariamente confirmado.

### Sinônimos permitidos em conteúdo específico

* local de hospedagem;
* onde você ficará hospedado.

### Sinônimos proibidos como conceito geral

* hotel;
* pousada;
* estadia;
* acomodação, caso crie variação terminológica desnecessária.

---

## 44. Hospedagem provisória

### Definição

Referência aproximada utilizada antes da confirmação do local real de permanência.

### Termo técnico

```text
ProvisionalAccommodation
```

### Exemplos

* centro do Destino;
* bairro;
* endereço aproximado;
* ponto escolhido.

### Regra

Deverá ser identificada como provisória.

---

## 45. Hospedagem confirmada

### Definição

Hospedagem explicitamente validada pelo Usuário ou por fonte adequada.

### Termo técnico

```text
ConfirmedAccommodation
```

### Regra

Confirmada não significa que exista uma Reserva registrada no RouteBook.

---

# Parte VIII — Pessoas e grupo

## 46. Viajante

### Definição

Pessoa participante da Viagem, possuindo ou não uma Conta no RouteBook.

### Termo técnico

```text
Traveler
```

### Não significa

* Usuário;
* participante com acesso;
* passageiro;
* cliente;
* convidado.

### Sinônimos permitidos

* pessoa viajante, em conteúdo inclusivo;
* pessoa do grupo, em linguagem natural.

---

## 47. Participante da Viagem

### Definição

Usuário que possui relação de acesso com uma Viagem.

### Termo técnico

```text
TripParticipant
```

### Não significa

* Viajante obrigatoriamente.

Um participante pode editar uma Viagem sem viajar.

---

## 48. Grupo de Viajantes

### Definição

Conjunto de Viajantes associados à mesma Viagem.

### Termo técnico

```text
TravelerGroup
```

### Não significa

* Conta;
* equipe;
* participantes com acesso.

---

## 49. Perfil do Grupo

### Definição

Resumo derivado das características relevantes dos Viajantes.

### Termo técnico

```text
GroupProfile
```

### Exemplos

* 3 adultos;
* grupo com crianças;
* grupo com necessidade de acessibilidade.

### Regra

Não substitui os dados individuais dos Viajantes.

---

## 50. Adulto

### Definição

Classificação etária contextual de um Viajante.

### Termo técnico

```text
AdultTraveler
```

### Regra

Os limites legais ou comerciais podem variar conforme o contexto e não deverão ser inferidos sem regra explícita.

---

## 51. Criança

### Definição

Classificação etária contextual de um Viajante.

### Termo técnico

```text
ChildTraveler
```

### Regra

Quando necessário, utilizar faixa etária em vez de classificação genérica.

---

## 52. Necessidade do Viajante

### Definição

Condição funcional relevante para a experiência da Viagem.

### Termo técnico

```text
TravelerNeed
```

### Exemplos

* acesso sem escadas;
* pausas frequentes;
* alimentação específica.

### Regra

Preferir necessidade funcional a diagnóstico médico.

---

# Parte IX — Preferências

## 53. Preferência

### Definição

Informação que influencia personalização sem necessariamente representar obrigação.

### Termo técnico

```text
Preference
```

### Não significa

* Restrição;
* regra;
* requisito;
* decisão;
* Interesse exclusivamente.

---

## 54. Preferência pessoal

### Definição

Preferência associada a um Usuário ou Viajante.

### Termo técnico

```text
PersonalPreference
```

---

## 55. Preferência da Viagem

### Definição

Preferência contextual aplicada a uma Viagem específica.

### Termo técnico

```text
TripPreference
```

### Regra

Pode substituir ou complementar Preferências pessoais no contexto da Viagem.

---

## 56. Interesse

### Definição

Categoria de experiência desejada pelo Usuário, Viajante ou grupo.

### Termo técnico

```text
Interest
```

### Exemplos

* praias;
* gastronomia;
* natureza;
* vida noturna;
* cultura;
* descanso.

### Não significa

* categoria do Lugar;
* Preferência completa;
* recomendação;
* intenção de reserva.

---

## 57. Restrição

### Definição

Condição que limita ou condiciona decisões da Viagem.

### Termo técnico

```text
Restriction
```

### Exemplos

* mobilidade;
* alimentação;
* orçamento máximo;
* horário;
* categoria evitada.

### Não significa

* Preferência;
* sugestão;
* filtro temporário.

---

## 58. Restrição obrigatória

### Definição

Restrição que não pode ser violada silenciosamente pelo planejamento ou recomendação.

### Termo técnico

```text
MandatoryRestriction
```

### Regra

Qualquer incompatibilidade deverá gerar Conflito ou impedir determinada ação.

---

## 59. Ritmo

### Definição

Nível desejado de intensidade e densidade do planejamento.

### Termo técnico

```text
Pace
```

### Valores iniciais

* relaxed;
* balanced;
* intense;
* custom.

### Traduções

* relaxado;
* equilibrado;
* intenso;
* personalizado.

### Não significa

* velocidade de deslocamento;
* duração da Viagem;
* quantidade fixa de Atividades.

---

## 60. Orçamento

### Definição

Referência financeira utilizada para orientar decisões da Viagem.

### Termo técnico

```text
Budget
```

### Pode representar

* faixa total;
* valor diário;
* valor por pessoa;
* categoria qualitativa.

### Não significa

* despesa;
* preço;
* saldo;
* custo confirmado.

---

## 61. Faixa de orçamento

### Definição

Intervalo qualitativo ou monetário utilizado para personalização.

### Termo técnico

```text
BudgetRange
```

---

## 62. Prioridade

### Definição

Grau de importância atribuído a uma Preferência, Interesse ou objetivo.

### Termo técnico

```text
Priority
```

### Não significa

* score de recomendação;
* ordem de Atividade;
* severidade de Conflito.

---

# Parte X — Lugares

## 63. Lugar

### Definição

Ponto de interesse potencialmente relevante para uma Viagem.

### Termo técnico

```text
Place
```

### Exemplos

* praia;
* restaurante;
* bar;
* mirante;
* passeio;
* parque;
* cafeteria.

### Não significa

* Atividade;
* Destino;
* Hospedagem necessariamente;
* endereço;
* Marcador;
* Região.

### Sinônimos proibidos como termo geral

* ponto turístico;
* estabelecimento;
* atração;
* local;
* spot;
* POI, em conteúdo de produto.

---

## 64. Ponto de interesse

### Definição

Termo técnico externo frequentemente utilizado para representar um Lugar.

### Termo técnico externo

```text
Point of Interest
POI
```

### Regra

Na linguagem de domínio do RouteBook, utilizar `Lugar`.

`POI` poderá existir apenas em integrações, contratos externos ou documentação técnica específica.

---

## 65. Categoria de Lugar

### Definição

Classificação temática ou funcional de um Lugar.

### Termo técnico

```text
PlaceCategory
```

### Exemplos

* praia;
* restaurante;
* bar;
* passeio;
* parque.

### Regra

Um Lugar pode possuir várias categorias.

---

## 66. Tipo de Lugar

### Definição

Classificação estrutural principal de um Lugar quando necessária.

### Termo técnico

```text
PlaceType
```

### Regra

Não criar `Tipo` e `Categoria` com o mesmo significado.

Quando não houver diferença estrutural clara, utilizar apenas `Categoria de Lugar`.

---

## 67. Lugar Salvo

### Definição

Associação entre uma Viagem e um Lugar preservado para avaliação futura.

### Termo técnico

```text
SavedPlace
```

### Não significa

* Lugar Planejado;
* favorito global;
* Reserva;
* Atividade.

### Interface

```text
Salvo
Salvos
Salvar
Remover dos Salvos
```

### Sinônimos proibidos

* favorito, salvo decisão formal;
* curtido;
* marcado;
* selecionado.

---

## 68. Lugar Planejado

### Definição

Lugar associado a pelo menos uma Atividade ativa do Roteiro.

### Termo técnico

```text
PlannedPlace
```

### Regra

É um estado derivado.

### Não significa

* Lugar Salvo;
* Lugar visitado;
* Lugar confirmado.

---

## 69. Lugar recomendado

### Definição

Lugar apresentado como parte de uma Recomendação.

### Termo técnico

```text
RecommendedPlace
```

### Regra

Recomendado não significa salvo ou planejado.

---

## 70. Lugar indisponível

### Definição

Lugar que não pode ser utilizado como esperado por fechamento, encerramento ou ausência de acesso.

### Termo técnico

```text
UnavailablePlace
```

### Regra

Indisponibilidade deve possuir motivo ou nível de confiança quando possível.

---

## 71. Lugar personalizado

### Definição

Lugar criado manualmente quando não existe correspondência adequada nas fontes.

### Termo técnico

```text
CustomPlace
```

### Regra

Não deverá ser confundido com Atividade manual.

---

## 72. Detalhes do Lugar

### Definição

Conjunto de informações utilizadas para avaliar um Lugar.

### Termo técnico

```text
PlaceDetails
```

### Pode conter

* descrição;
* categoria;
* Localização;
* horário;
* preço;
* avaliação;
* imagens;
* acessibilidade;
* contato.

---

## 73. Avaliação

### Definição

Valor agregado atribuído a um Lugar por uma fonte.

### Termo técnico

```text
Rating
```

### Regra

Deve possuir escala e fonte.

### Não significa

* score de recomendação;
* classificação oficial;
* opinião do RouteBook.

---

## 74. Faixa de Preço

### Definição

Representação qualitativa ou monetária do custo relacionado a um Lugar.

### Termo técnico

```text
PriceRange
```

### Não significa

* Orçamento;
* custo total da Viagem;
* preço confirmado necessariamente.

---

## 75. Horário de Funcionamento

### Definição

Conjunto de períodos em que um Lugar informa estar aberto.

### Termo técnico

```text
OpeningHours
```

### Regra

Não equivale a disponibilidade garantida.

---

## 76. Acessibilidade do Lugar

### Definição

Informações sobre condições de acesso e uso do Lugar.

### Termo técnico

```text
PlaceAccessibility
```

### Regra

Ausência de informação não significa ausência de acessibilidade.

---

# Parte XI — Roteiro e planejamento

## 77. Roteiro

### Definição

Organização atual dos Dias da Viagem, Atividades e Períodos Livres.

### Termo técnico

```text
Itinerary
```

### Não significa

* Viagem;
* Proposta de Roteiro;
* rota;
* trajeto;
* lista de Lugares;
* plano gerado por IA.

### Sinônimos proibidos

* agenda, como entidade;
* cronograma, como substituição geral;
* planejamento, quando se refere à estrutura persistida;
* routebook, como objeto interno.

---

## 78. Planejamento

### Definição

Processo de criação, organização e revisão do Roteiro.

### Termo técnico

```text
Planning
```

### Não significa

* Roteiro;
* Proposta;
* configuração.

---

## 79. Roteiro atual

### Definição

Versão vigente do planejamento da Viagem.

### Termo técnico

```text
CurrentItinerary
```

### Regra

Deve ser distinguido de uma Proposta de Roteiro.

---

## 80. Roteiro vazio

### Definição

Roteiro sem Atividades e sem Períodos Livres.

### Termo técnico

```text
EmptyItinerary
```

---

## 81. Roteiro parcial

### Definição

Roteiro com algum planejamento, mas ainda incompleto segundo critérios contextuais.

### Termo técnico

```text
PartialItinerary
```

### Pode ocorrer quando

* alguns Dias estão vazios;
* existem Atividades sem horário;
* apenas parte dos Lugares foi organizada.

### Regra

Parcial não significa inválido.

---

## 82. Roteiro planejado

### Definição

Roteiro que possui organização suficiente para o uso pretendido.

### Termo técnico

```text
PlannedItinerary
```

### Regra

Não significa ausência de Conflitos.

---

## 83. Roteiro desatualizado

### Definição

Roteiro cujos dados derivados precisam ser recalculados após mudança relevante.

### Termo técnico

```text
OutdatedItinerary
```

### Causas

* alteração da Hospedagem;
* alteração de transporte;
* mudança de Destino;
* dados externos atualizados.

---

## 84. Versão do Roteiro

### Definição

Identificador lógico de uma configuração específica do Roteiro.

### Termo técnico

```text
ItineraryVersion
```

### Uso

* concorrência;
* auditoria;
* comparação;
* validade de Proposta.

---

## 85. Atividade

### Definição

Compromisso planejado dentro de um Dia da Viagem.

### Termo técnico

```text
Activity
```

### Pode representar

* visita a Lugar;
* refeição;
* passeio;
* descanso;
* transporte;
* check-in;
* compromisso manual.

### Não significa

* Lugar;
* evento externo necessariamente;
* tarefa técnica;
* ação de interface.

---

## 86. Atividade associada a Lugar

### Definição

Atividade que referencia um Lugar existente.

### Termo técnico

```text
PlaceLinkedActivity
```

---

## 87. Atividade manual

### Definição

Atividade criada sem associação obrigatória a um Lugar existente.

### Termo técnico

```text
ManualActivity
```

### Exemplo

```text
Buscar carro alugado
Descansar na hospedagem
Encontrar amigos
```

---

## 88. Atividade sem horário

### Definição

Atividade planejada sem hora inicial definida.

### Termo técnico

```text
UnscheduledActivity
```

### Regra

Não representa erro.

---

## 89. Atividade fixa

### Definição

Atividade cujo horário ou posição não deverá ser alterado automaticamente.

### Termo técnico

```text
FixedActivity
```

---

## 90. Atividade flexível

### Definição

Atividade que pode ser reorganizada mediante decisão do Usuário.

### Termo técnico

```text
FlexibleActivity
```

---

## 91. Atividade sugerida

### Definição

Atividade originada de Recomendação ou Proposta ainda sujeita a revisão.

### Termo técnico

```text
SuggestedActivity
```

### Regra

Após aplicação ao Roteiro, deverá ser uma Atividade com origem registrada, não um conceito paralelo indefinido.

---

## 92. Ordem da Atividade

### Definição

Posição relativa de uma Atividade dentro de um Dia da Viagem.

### Termo técnico

```text
ActivityOrder
```

### Não significa

* horário;
* prioridade;
* score.

---

## 93. Duração da Atividade

### Definição

Intervalo estimado ou definido para a realização de uma Atividade.

### Termo técnico

```text
ActivityDuration
```

### Regra

Deve distinguir valor estimado de valor confirmado.

---

## 94. Período Livre

### Definição

Intervalo intencionalmente não ocupado por Atividade.

### Termo técnico

```text
FreePeriod
```

### Não significa

* Dia vazio;
* lacuna;
* erro de planejamento;
* disponibilidade genérica.

---

## 95. Período Livre flexível

### Definição

Período Livre que pode receber sugestão mediante decisão do Usuário.

### Termo técnico

```text
FlexibleFreePeriod
```

---

## 96. Período Livre protegido

### Definição

Período Livre que não pode ser preenchido automaticamente.

### Termo técnico

```text
ProtectedFreePeriod
```

### Termo de interface permitido

```text
Não preencher automaticamente
```

---

# Parte XII — Mobilidade

## 97. Deslocamento

### Definição

Movimento entre duas referências geográficas.

### Termo técnico

```text
TravelLeg
```

### Não significa

* Distância;
* rota;
* viagem;
* transporte;
* Atividade, salvo quando explicitamente modelado como uma.

---

## 98. Origem

### Definição

Ponto inicial de um Deslocamento.

### Termo técnico

```text
TravelOrigin
```

### Pode ser

* Hospedagem;
* Atividade anterior;
* Lugar;
* Localização atual;
* endereço manual.

---

## 99. Destino do Deslocamento

### Definição

Ponto final de um Deslocamento.

### Termo técnico

```text
TravelDestination
```

### Regra

Não confundir com o `Destino` principal da Viagem.

Em código, o contexto deverá eliminar a ambiguidade.

---

## 100. Distância

### Definição

Medida espacial entre origem e destino.

### Termo técnico

```text
Distance
```

### Não significa

* Tempo de Deslocamento;
* rota;
* proximidade qualitativa.

---

## 101. Tempo de Deslocamento

### Definição

Duração estimada para realizar um Deslocamento.

### Termo técnico

```text
TravelTime
```

### Regra

Deve ser tratado como estimativa salvo confirmação adequada.

---

## 102. Meio de Transporte

### Definição

Modalidade utilizada para realizar um Deslocamento.

### Termo técnico

```text
TransportMode
```

### Valores iniciais

* a pé;
* carro;
* transporte público;
* transporte por aplicativo;
* bicicleta;
* barco;
* personalizado.

### Sinônimos proibidos

* modal, em conteúdo de interface;
* veículo, como substituição geral.

---

## 103. Rota

### Definição

Caminho geográfico utilizado ou sugerido entre origem e destino.

### Termo técnico

```text
Route
```

### Não significa

* Roteiro;
* Viagem;
* Deslocamento completo;
* sequência de Atividades.

---

## 104. Estimativa de Deslocamento

### Definição

Conjunto calculado de Distância, Tempo de Deslocamento, transporte e proveniência.

### Termo técnico

```text
TravelEstimate
```

### Estados

* calculando;
* disponível;
* estimada;
* indisponível;
* desatualizada.

---

## 105. Proximidade

### Definição

Relação qualitativa ou calculada de Distância entre referências.

### Termo técnico

```text
Proximity
```

### Regra

Deve possuir critério contextual.

`Próximo` não deverá ser utilizado como valor absoluto sem referência.

---

# Parte XIII — Recomendação e decisão

## 106. Recomendação

### Definição

Sugestão contextual produzida pelo RouteBook para apoiar uma decisão.

### Termo técnico

```text
Recommendation
```

### Não significa

* decisão;
* ordem;
* Proposta de Roteiro;
* resultado de busca;
* publicidade;
* garantia.

### Regra central

Uma Recomendação não deverá ser aplicada automaticamente.

---

## 107. Recomendação personalizada

### Definição

Recomendação produzida com base em informações específicas da Viagem ou do Usuário.

### Termo técnico

```text
PersonalizedRecommendation
```

### Regra

Deve possuir pelo menos uma Justificativa compreensível.

---

## 108. Sugestão

### Definição

Forma de Recomendação de menor formalidade ou uma severidade de Conflito.

### Termo técnico

```text
Suggestion
```

### Regra

O contexto deverá indicar se representa:

* recomendação de conteúdo;
* sugestão de melhoria em Conflito.

Evitar criar entidades distintas apenas por mudança de tom.

---

## 109. Decisão

### Definição

Escolha efetivamente realizada pelo Usuário ou por regra autorizada.

### Termo técnico

```text
Decision
```

### Não significa

* Recomendação;
* opção;
* resultado;
* inferência.

---

## 110. Contexto de Decisão

### Definição

Conjunto de informações relevantes utilizado para produzir ou avaliar uma Recomendação.

### Termo técnico

```text
DecisionContext
```

### Pode incluir

* Viagem;
* Destino;
* Hospedagem;
* Dia;
* horário;
* Viajantes;
* Preferências;
* Restrições;
* orçamento;
* Ritmo;
* Lugares;
* Roteiro;
* Distâncias.

---

## 111. Justificativa

### Definição

Razão compreensível que explica uma Recomendação, Proposta ou decisão do sistema.

### Termo técnico

```text
RecommendationReason
```

### Exemplos

* próxima da Hospedagem;
* compatível com Interesse;
* dentro do orçamento;
* mesma Região do Dia.

### Não significa

* evidência;
* score;
* explicação técnica do modelo.

---

## 112. Evidência

### Definição

Informação utilizada para sustentar uma conclusão, Justificativa ou Conflito.

### Termo técnico

```text
Evidence
```

### Exemplos

* Distância calculada;
* horário informado;
* Restrição cadastrada;
* dado de fonte externa.

---

## 113. Score de Recomendação

### Definição

Valor interno opcional utilizado para ordenar ou comparar Recomendações.

### Termo técnico

```text
RecommendationScore
```

### Regra

Não deverá ser apresentado como verdade objetiva.

### Não significa

* avaliação do Lugar;
* prioridade;
* confiança;
* qualidade absoluta.

---

## 114. Validade da Recomendação

### Definição

Período ou condição durante a qual uma Recomendação permanece aplicável.

### Termo técnico

```text
RecommendationValidity
```

### Regra

Mudança do Contexto de Decisão pode invalidar a Recomendação.

---

## 115. Recomendação expirada

### Definição

Recomendação que não deve mais ser utilizada sem nova avaliação.

### Termo técnico

```text
ExpiredRecommendation
```

---

## 116. Recomendação rejeitada

### Definição

Recomendação recusada explicitamente pelo Usuário.

### Termo técnico

```text
RejectedRecommendation
```

### Regra

A rejeição não deverá exigir justificativa obrigatória.

---

# Parte XIV — Proposta de Roteiro

## 117. Proposta de Roteiro

### Definição

Organização sugerida de Dias e Atividades ainda não aplicada ao Roteiro atual.

### Termo técnico

```text
ItineraryProposal
```

### Não significa

* Roteiro;
* Recomendação simples;
* plano aplicado;
* resultado definitivo;
* agenda automática.

### Regra central

A Proposta permanece separada do Roteiro até aceitação explícita.

---

## 118. Atividade Proposta

### Definição

Item pertencente à Proposta de Roteiro que pode se tornar Atividade após aceitação.

### Termo técnico

```text
ProposedActivity
```

### Não significa

* Atividade atual;
* Recomendação isolada;
* Lugar Salvo.

---

## 119. Dia Proposto

### Definição

Representação de um Dia dentro da Proposta de Roteiro.

### Termo técnico

```text
ProposedDay
```

### Regra

Não deverá substituir o Dia da Viagem atual antes da aplicação.

---

## 120. Geração de Proposta

### Definição

Processo de produção de uma Proposta de Roteiro.

### Termo técnico

```text
ProposalGeneration
```

### Não significa

* criação do Roteiro;
* aplicação;
* confirmação;
* otimização garantida.

---

## 121. Aceitação integral

### Definição

Aplicação de todos os itens elegíveis de uma Proposta ao Roteiro.

### Termo técnico

```text
FullProposalAcceptance
```

---

## 122. Aceitação parcial

### Definição

Aplicação apenas dos Dias ou Atividades selecionados de uma Proposta.

### Termo técnico

```text
PartialProposalAcceptance
```

### Regra

Itens não selecionados não deverão alterar o Roteiro.

---

## 123. Proposta rejeitada

### Definição

Proposta explicitamente descartada sem aplicação ao Roteiro.

### Termo técnico

```text
RejectedItineraryProposal
```

---

## 124. Proposta expirada

### Definição

Proposta cuja versão base ou contexto não é mais válido.

### Termo técnico

```text
ExpiredItineraryProposal
```

### Causas

* Roteiro alterado;
* Hospedagem alterada;
* Período alterado;
* dados relevantes atualizados.

---

## 125. Proposta substituída

### Definição

Proposta que deixou de ser a alternativa mais recente após nova geração.

### Termo técnico

```text
SupersededItineraryProposal
```

---

# Parte XV — Conflitos e alertas

## 126. Conflito

### Definição

Condição identificada que afeta ou pode afetar o planejamento.

### Termo técnico

```text
Conflict
```

### Não significa

* erro técnico;
* notificação;
* alerta visual;
* incompatibilidade humana;
* falha de sistema.

---

## 127. Erro de planejamento

### Definição

Conflito de severidade alta que impede uma operação ou produz inconsistência não aceitável.

### Termo técnico

```text
PlanningError
```

### Exemplos

* Atividade fora do Período;
* data final anterior à inicial;
* Restrição obrigatória violada.

---

## 128. Risco

### Definição

Conflito que pode causar problema, mas não impede necessariamente o planejamento.

### Termo técnico

```text
PlanningRisk
```

### Exemplos

* intervalo curto;
* Dia excessivamente intenso;
* informação de horário pouco confiável.

---

## 129. Sugestão de melhoria

### Definição

Conflito de menor severidade que identifica oportunidade de aprimoramento.

### Termo técnico

```text
PlanningSuggestion
```

### Exemplo

* reorganizar Lugares para reduzir Deslocamento.

---

## 130. Alerta

### Definição

Forma de comunicação de um Erro, Risco ou Sugestão.

### Termo técnico

```text
Alert
```

### Não significa

* Conflito;
* notificação genérica;
* evento de domínio.

Um Conflito pode gerar um Alerta.

---

## 131. Severidade

### Definição

Classificação do impacto de um Conflito ou mensagem.

### Termo técnico

```text
Severity
```

### Valores de planejamento

* error;
* risk;
* suggestion.

### Regra

Não reutilizar os mesmos valores para criticidade técnica sem contexto.

---

## 132. Conflito aberto

### Definição

Conflito ainda aplicável e não resolvido.

### Termo técnico

```text
OpenConflict
```

---

## 133. Conflito resolvido

### Definição

Conflito cuja condição deixou de existir após alteração ou correção.

### Termo técnico

```text
ResolvedConflict
```

---

## 134. Risco ignorado

### Definição

Risco que permanece conhecido, mas foi aceito pelo Usuário.

### Termo técnico

```text
IgnoredRisk
```

### Regra

Erro bloqueante não pode utilizar esse estado.

---

## 135. Conflito invalidado

### Definição

Conflito que deixou de ser aplicável após mudança de contexto ou dados.

### Termo técnico

```text
InvalidatedConflict
```

### Não significa

* resolvido por ação corretiva;
* ignorado.

---

# Parte XVI — Dados e proveniência

## 136. Fonte de Dados

### Definição

Origem interna ou externa de uma informação utilizada pelo RouteBook.

### Termo técnico

```text
DataSource
```

### Tipos

* interna;
* fornecida pelo Usuário;
* provedor;
* dataset público;
* parceiro;
* gerada por IA;
* inferida.

---

## 137. Proveniência

### Definição

Metadados que explicam a origem, o método e a atualização de uma informação.

### Termo técnico

```text
Provenance
```

### Pode conter

* Fonte de Dados;
* identificador externo;
* data da coleta;
* data da atualização;
* método;
* confiança;
* licença.

### Não significa

* fonte textual exibida ao usuário apenas;
* histórico completo;
* autoria.

---

## 138. Dado fornecido pelo Usuário

### Definição

Informação inserida ou confirmada diretamente por um Usuário.

### Termo técnico

```text
UserProvidedData
```

### Regra

Não deverá ser automaticamente considerado correto em todos os contextos, mas sua origem deve ser preservada.

---

## 139. Dado externo

### Definição

Informação obtida de fonte fora do domínio interno do RouteBook.

### Termo técnico

```text
ExternalData
```

---

## 140. Dado inferido

### Definição

Informação derivada de outros dados por regra, cálculo ou modelo.

### Termo técnico

```text
InferredData
```

### Regra

Deve ser distinguido de informação confirmada.

---

## 141. Dado gerado por IA

### Definição

Conteúdo produzido por sistema de IA.

### Termo técnico

```text
AIGeneratedData
```

### Regra

Não deverá ser automaticamente tratado como fato confirmado.

---

## 142. Confiança

### Definição

Avaliação da qualidade da evidência disponível para uma informação.

### Termo técnico

```text
ConfidenceLevel
```

### Valores

* confirmed;
* high;
* medium;
* low;
* unknown.

### Não significa

* probabilidade estatística obrigatoriamente;
* score de Recomendação;
* avaliação.

---

## 143. Informação confirmada

### Definição

Informação validada por fonte ou ação adequada ao contexto.

### Termo técnico

```text
ConfirmedInformation
```

### Regra

Confirmada não significa permanente.

---

## 144. Estimativa

### Definição

Valor aproximado sujeito a variação.

### Termo técnico

```text
Estimate
```

### Exemplos

* Tempo de Deslocamento;
* preço;
* duração;
* custo diário.

### Regra

Deve ser identificada como estimativa.

---

## 145. Informação desconhecida

### Definição

Informação cujo valor não está disponível.

### Termo técnico

```text
UnknownInformation
```

### Regra

Não deverá ser representada como zero, falso ou vazio sem semântica.

---

## 146. Informação indisponível

### Definição

Informação que deveria ser acessível, mas não pôde ser obtida naquele momento.

### Termo técnico

```text
UnavailableInformation
```

### Diferença

`Desconhecida` significa ausência de conhecimento.

`Indisponível` significa falha ou impossibilidade temporária de acesso.

---

## 147. Informação desatualizada

### Definição

Informação que ultrapassou seu período de validade ou foi invalidada por mudança de contexto.

### Termo técnico

```text
StaleInformation
```

### Sinônimo técnico permitido

```text
stale
```

### Sinônimos proibidos em interface

* velha;
* vencida, salvo quando fizer sentido legal;
* inválida, sem comprovação.

---

## 148. Atualidade dos Dados

### Definição

Estado que representa quão recente e aplicável uma informação é.

### Termo técnico

```text
DataFreshness
```

### Estados

* current;
* stale;
* unknown;
* conflicting;
* unavailable.

---

## 149. Dados conflitantes

### Definição

Informações divergentes sobre o mesmo atributo provenientes de fontes diferentes.

### Termo técnico

```text
ConflictingData
```

### Regra

A divergência deve preservar a Proveniência.

---

## 150. Identificador externo

### Definição

Identificador atribuído a um objeto por uma Fonte de Dados externa.

### Termo técnico

```text
ExternalId
```

### Regra

Não deverá ser a única identidade interna de uma entidade do RouteBook.

---

# Parte XVII — Interface geográfica

## 151. Mapa

### Definição

Representação visual geográfica de Lugares, Hospedagem, Regiões e planejamento.

### Termo técnico

```text
Map
```

### Não significa

* domínio geográfico;
* Localização;
* Região;
* rota;
* lista de Lugares.

### Regra

O Mapa é uma representação da informação e deve possuir alternativa textual.

---

## 152. Marcador

### Definição

Representação visual de um ponto no Mapa.

### Termo técnico

```text
MapMarker
```

### Não significa

* Lugar;
* Localização;
* Lugar Salvo.

Um Marcador representa um objeto no Mapa.

---

## 153. Agrupamento de Marcadores

### Definição

Representação visual de vários Marcadores próximos.

### Termo técnico

```text
MarkerCluster
```

### Não significa

* Região;
* categoria;
* coleção persistida.

---

## 154. Enquadramento do Mapa

### Definição

Área geográfica atualmente visível.

### Termo técnico

```text
MapViewport
```

### Sinônimos técnicos permitidos

* viewport;
* bounds, quando se refere aos limites geográficos.

---

## 155. Buscar nesta área

### Definição

Ação que atualiza resultados usando o enquadramento atual do Mapa.

### Termo técnico

```text
SearchWithinMapArea
```

### Regra

Não deverá alterar filtros implicitamente.

---

## 156. Localização atual

### Definição

Localização aproximada ou precisa do dispositivo do Usuário no momento.

### Termo técnico

```text
CurrentLocation
```

### Regra

É opcional e depende de permissão.

---

# Parte XVIII — Operações e ações

## 157. Criar Viagem

### Definição

Operação que estabelece uma nova Viagem com contexto mínimo válido.

### Termo técnico

```text
CreateTrip
```

### Não significa

* gerar Roteiro;
* iniciar fisicamente a Viagem;
* reservar.

---

## 158. Salvar Lugar

### Definição

Operação que cria a associação Lugar Salvo dentro de uma Viagem.

### Termo técnico

```text
SavePlace
```

### Não significa

* persistir genericamente;
* adicionar ao Roteiro;
* favoritar globalmente.

---

## 159. Remover dos Salvos

### Definição

Operação que remove a associação Lugar Salvo.

### Termo técnico

```text
UnsavePlace
```

### Regra

Não remove Atividades relacionadas.

---

## 160. Adicionar ao Roteiro

### Definição

Operação que cria uma Atividade associada a um Lugar em um Dia da Viagem.

### Termo técnico

```text
AddPlaceToItinerary
```

### Não significa

* Salvar;
* aceitar Proposta inteira;
* criar Lugar.

---

## 161. Criar Atividade

### Definição

Operação que adiciona uma nova Atividade ao Roteiro.

### Termo técnico

```text
AddActivity
```

---

## 162. Editar Atividade

### Definição

Operação que altera os dados de uma Atividade existente.

### Termo técnico

```text
UpdateActivity
```

---

## 163. Mover Atividade

### Definição

Operação que altera a ordem ou o Dia de uma Atividade.

### Termo técnico

```text
MoveActivity
```

### Variações

* mover dentro do Dia;
* mover para outro Dia.

---

## 164. Reordenar

### Definição

Alterar a sequência relativa de elementos.

### Termo técnico

```text
Reorder
```

### Não significa

* ordenar resultados de busca;
* mudar horário necessariamente.

O contexto técnico deverá explicitar o alvo:

```text
ReorderActivities
ReorderProposalItems
```

---

## 165. Gerar Proposta

### Definição

Solicitar a criação de uma Proposta de Roteiro.

### Termo técnico

```text
RequestItineraryProposal
```

### Não significa

* criar ou substituir o Roteiro atual;
* otimizar definitivamente.

---

## 166. Aceitar Proposta

### Definição

Aplicar uma Proposta de Roteiro ao Roteiro atual.

### Termo técnico

```text
AcceptItineraryProposal
```

---

## 167. Revisar Roteiro

### Definição

Analisar o Roteiro em busca de Conflitos, riscos e oportunidades de melhoria.

### Termo técnico

```text
ReviewItinerary
```

### Não significa

* editar;
* aprovar formalmente;
* gerar Proposta.

---

## 168. Corrigir Conflito

### Definição

Executar alteração que elimina a condição responsável por um Conflito.

### Termo técnico

```text
ResolveConflict
```

---

## 169. Ignorar Risco

### Definição

Registrar a decisão de continuar apesar de um Risco conhecido.

### Termo técnico

```text
IgnoreRisk
```

### Regra

Não utilizar para Erro bloqueante.

---

## 170. Alterar Hospedagem

### Definição

Substituir a referência de Hospedagem da Viagem.

### Termo técnico

```text
UpdateAccommodation
```

### Efeito

Invalida ou exige recálculo de dados geográficos derivados.

---

## 171. Arquivar Viagem

### Definição

Remover a Viagem das visualizações principais preservando seus dados.

### Termo técnico

```text
ArchiveTrip
```

---

## 172. Excluir Viagem

### Definição

Operação destrutiva que inicia a remoção da Viagem conforme política definida.

### Termo técnico

```text
DeleteTrip
```

### Não significa

* arquivar;
* cancelar;
* ocultar.

---

# Parte XIX — Eventos de domínio

## 173. Regra de nomenclatura

Eventos representam fatos ocorridos e deverão utilizar passado.

Exemplos:

```text
TripCreated
PlaceSaved
ActivityMoved
ConflictDetected
```

Não utilizar:

```text
CreateTrip
SavePlace
MoveActivity
```

como eventos.

Esses nomes representam comandos.

---

## 174. Evento de domínio

### Definição

Registro imutável de um fato relevante ocorrido no domínio.

### Termo técnico

```text
DomainEvent
```

### Não significa

* evento da interface;
* clique;
* log;
* métrica;
* comando.

---

## 175. Comando

### Definição

Solicitação para que o domínio execute uma operação.

### Termo técnico

```text
Command
```

### Exemplo

```text
CreateTrip
```

### Diferença

```text
CreateTrip
→ comando

TripCreated
→ evento
```

---

## 176. Consulta

### Definição

Solicitação de leitura de dados sem intenção de alterar estado.

### Termo técnico

```text
Query
```

### Exemplos

```text
GetTrip
SearchPlaces
ListSavedPlaces
```

---

## 177. Correlação

### Definição

Identificador que relaciona comandos, eventos e operações pertencentes ao mesmo fluxo.

### Termo técnico

```text
CorrelationId
```

---

## 178. Causalidade

### Definição

Relação que identifica qual comando ou evento originou outro evento.

### Termo técnico

```text
CausationId
```

---

# Parte XX — Termos de estado e persistência

## 179. Estado

### Definição

Condição atual de uma entidade, objeto ou processo.

### Termo técnico

```text
State
```

### Regra

Não utilizar um único `status` para conceitos sem relação.

---

## 180. Status

### Definição

Atributo que representa um conjunto finito de estados de um conceito específico.

### Termo técnico

```text
Status
```

### Regra

O nome técnico deverá indicar o contexto:

```text
TripStatus
ActivityStatus
ProposalStatus
```

Evitar:

```text
status
```

sem significado.

---

## 181. Persistir

### Definição

Registrar estado de forma durável.

### Termo técnico

```text
Persist
```

### Regra

Na interface, utilizar verbos de domínio como:

* Salvar alterações;
* Criar viagem;
* Adicionar atividade.

Não utilizar `Persistir`.

---

## 182. Salvar alterações

### Definição

Ação de interface que confirma e persiste modificações realizadas.

### Termo técnico

Pode corresponder a diferentes comandos conforme o contexto.

### Regra

Não confundir com `Salvar Lugar`.

---

## 183. Salvamento automático

### Definição

Persistência de alteração sem ação explícita final de salvar.

### Termo técnico

```text
AutoSave
```

### Regra

Deve comunicar estados de persistência quando relevante.

---

## 184. Alteração pendente

### Definição

Mudança local ainda não persistida.

### Termo técnico

```text
UnsavedChange
```

### Sinônimo técnico permitido

```text
dirty state
```

### Interface preferida

```text
Alterações não salvas
```

---

## 185. Desatualizado

### Definição

Estado de um dado derivado que não corresponde mais ao contexto atual.

### Termo técnico

```text
Outdated
Stale
```

### Regra

Utilizar `stale` para dados técnicos e `outdated` para objetos de domínio quando essa distinção for útil.

---

# Parte XXI — Termos de IA e automação

## 186. IA

### Definição

Capacidade computacional utilizada para apoiar análise, geração ou recomendação.

### Termo técnico

```text
Artificial Intelligence
AI
```

### Regra

IA não deverá ser modelada como ator com autoridade de decisão.

---

## 187. Agente de IA

### Definição

Sistema de IA com objetivo, contexto e capacidade de executar tarefas limitadas.

### Termo técnico

```text
AIAgent
```

### Não significa

* Usuário;
* serviço de domínio;
* owner;
* fonte confiável automaticamente.

---

## 188. Assistência por IA

### Definição

Uso de IA para apoiar uma tarefa controlada pelo Usuário.

### Termo técnico

```text
AIAssistance
```

### Exemplo

* sugerir Lugares;
* gerar Proposta;
* identificar Conflitos;
* resumir contexto.

---

## 189. Conteúdo gerado por IA

### Definição

Conteúdo textual ou estruturado produzido por IA.

### Termo técnico

```text
AIGeneratedContent
```

### Regra

Deve possuir validação adequada antes de virar estado canônico.

---

## 190. Inferência

### Definição

Conclusão derivada de dados existentes.

### Termo técnico

```text
Inference
```

### Regra

Deve ser distinguida de dado fornecido e confirmado.

---

## 191. Explicabilidade

### Definição

Capacidade de comunicar fatores compreensíveis que sustentam uma Recomendação ou conclusão.

### Termo técnico

```text
Explainability
```

### Não significa

* exposição integral do modelo;
* garantia;
* explicação matemática obrigatória.

---

## 192. Alucinação

### Definição

Conteúdo gerado sem suporte adequado em dados ou evidência.

### Termo técnico

```text
Hallucination
```

### Uso

Termo técnico interno.

Na interface, comunicar o problema específico, como:

```text
Informação não confirmada
```

---

## 193. Grounding

### Definição

Processo de vincular uma resposta de IA a dados, contexto ou fontes verificáveis.

### Termo técnico

```text
Grounding
```

### Tradução documental preferida

```text
fundamentação em dados
```

---

## 194. Prompt

### Definição

Instrução fornecida a um modelo de IA.

### Termo técnico

```text
Prompt
```

### Regra

Prompt é conceito técnico e não deve substituir requisito, regra ou contexto de domínio.

---

# Parte XXII — Termos externos e tradução interna

## 195. POI

### Termo externo

```text
Point of Interest
```

### Termo interno

```text
Lugar
```

---

## 196. Itinerary

### Termo externo ou técnico

```text
Itinerary
```

### Termo de domínio em português

```text
Roteiro
```

---

## 197. Trip

### Termo técnico

```text
Trip
```

### Termo de domínio

```text
Viagem
```

---

## 198. Accommodation

### Termo técnico

```text
Accommodation
```

### Termo de domínio

```text
Hospedagem
```

---

## 199. Saved Place

### Termo técnico

```text
SavedPlace
```

### Termo de domínio

```text
Lugar Salvo
```

---

## 200. Travel Leg

### Termo técnico

```text
TravelLeg
```

### Termo de domínio

```text
Deslocamento
```

---

## 201. Opening Hours

### Termo técnico

```text
OpeningHours
```

### Termo de domínio

```text
Horário de Funcionamento
```

---

## 202. Recommendation Reason

### Termo técnico

```text
RecommendationReason
```

### Termo de domínio

```text
Justificativa
```

---

## 203. Free Period

### Termo técnico

```text
FreePeriod
```

### Termo de domínio

```text
Período Livre
```

---

## 204. Conflict

### Termo técnico

```text
Conflict
```

### Termo de domínio

```text
Conflito
```

---

# Parte XXIII — Sinônimos proibidos

## 205. Viagem

Não utilizar como equivalente:

* roteiro;
* projeto;
* pacote;
* jornada;
* destino;
* viagem planejada, quando o estado não for relevante.

---

## 206. Lugar

Não utilizar como equivalente genérico:

* ponto turístico;
* atração;
* estabelecimento;
* localização;
* spot;
* endereço;
* POI em interface.

---

## 207. Atividade

Não utilizar como equivalente:

* Lugar;
* evento, sem distinção;
* passeio, porque nem toda Atividade é passeio;
* tarefa;
* item turístico.

---

## 208. Roteiro

Não utilizar como equivalente:

* rota;
* trajeto;
* agenda;
* viagem;
* Proposta;
* cronograma, sem contexto.

---

## 209. Hospedagem

Não utilizar como equivalente genérico:

* hotel;
* pousada;
* endereço;
* reserva;
* estadia.

---

## 210. Salvo

Não utilizar como equivalente:

* favorito;
* planejado;
* selecionado;
* curtido;
* reservado.

---

## 211. Recomendação

Não utilizar como equivalente:

* decisão;
* regra;
* ordem;
* garantia;
* resultado;
* proposta automática.

---

## 212. Proposta

Não utilizar como equivalente:

* Roteiro atual;
* recomendação simples;
* versão aplicada;
* planejamento final.

---

## 213. Conflito

Não utilizar como equivalente:

* bug;
* erro técnico;
* alerta;
* falha de integração;
* problema genérico.

---

## 214. Estimativa

Não utilizar como equivalente:

* valor confirmado;
* garantia;
* previsão exata;
* informação oficial.

---

# Parte XXIV — Convenções para código

## 215. Entidades

Utilizar nomes no singular e em `PascalCase`.

Exemplos:

```text
Trip
Traveler
Place
Activity
ItineraryProposal
Conflict
```

---

## 216. Identificadores

Utilizar o nome da entidade seguido de `Id`.

Exemplos:

```text
TripId
PlaceId
ActivityId
TravelerId
```

Evitar:

```text
idTrip
tripIdentifierValue
genericId
```

---

## 217. Objetos de valor

Utilizar nomes que expressem significado.

Exemplos:

```text
TripPeriod
GeoCoordinate
PriceRange
TravelEstimate
ConfidenceLevel
```

---

## 218. Comandos

Utilizar verbo no imperativo conceitual seguido do objeto.

Exemplos:

```text
CreateTrip
SavePlace
AddActivity
MoveActivity
AcceptItineraryProposal
```

---

## 219. Eventos

Utilizar passado.

Exemplos:

```text
TripCreated
PlaceSaved
ActivityAdded
ActivityMoved
ProposalAccepted
```

---

## 220. Consultas

Utilizar intenção de leitura.

Exemplos:

```text
GetTrip
ListTrips
SearchPlaces
GetItinerary
ListConflicts
```

---

## 221. Booleanos

Nomes booleanos deverão representar perguntas claras.

Exemplos:

```text
isSaved
isPlanned
isProvisional
hasConflicts
canEdit
```

Evitar:

```text
saved
planned
flag
statusBool
```

quando houver ambiguidade.

---

## 222. Coleções

Utilizar substantivos no plural.

Exemplos:

```text
travelers
activities
savedPlaces
conflicts
```

---

## 223. Datas

Distinguir:

* `LocalDate`;
* `LocalTime`;
* `Instant`;
* `ZonedDateTime`;
* `DateRange`.

Não utilizar `DateTime` genérico sem semântica.

---

## 224. Valores monetários

Utilizar objeto com valor e moeda.

Exemplo:

```text
Money
CurrencyAmount
```

Evitar número isolado.

---

## 225. Distâncias

Utilizar objeto com valor e unidade.

Exemplo:

```text
Distance
```

Evitar:

```text
distance: 1.8
```

sem unidade.

---

# Parte XXV — Convenções para interface

## 226. Navegação principal

Termos oficiais:

* Viagem;
* Explorar;
* Mapa;
* Roteiro;
* Salvos;
* Configurações.

---

## 227. Ações principais

Termos oficiais:

* Criar viagem;
* Explorar lugares;
* Salvar;
* Remover dos Salvos;
* Adicionar ao roteiro;
* Ver no roteiro;
* Adicionar atividade;
* Adicionar período livre;
* Revisar roteiro;
* Gerar proposta;
* Aceitar proposta;
* Salvar alterações;
* Abrir rota.

---

## 228. Estados oficiais de interface

* Salvo;
* Planejado;
* Em andamento;
* Próxima;
* Concluída;
* Rascunho;
* Provisória;
* Confirmada;
* Carregando;
* Salvando;
* Salvo;
* Indisponível;
* Desatualizado;
* Informação não confirmada.

---

## 229. Severidades oficiais

* Erro;
* Risco;
* Sugestão.

Evitar alternar com:

* crítico;
* aviso;
* atenção;
* dica;

sem definição de um sistema diferente.

---

## 230. Termos de recuperação

* Tentar novamente;
* Continuar manualmente;
* Revisar alteração;
* Continuar editando;
* Descartar alterações;
* Desfazer;
* Ver lista;
* Limpar filtros.

---

# Parte XXVI — Regras para analytics

## 231. Nomenclatura de eventos analíticos

Eventos de analytics não são Eventos de Domínio.

Eles deverão possuir convenção própria e manter rastreabilidade.

Exemplo conceitual:

```text
trip_creation_started
trip_created
place_saved
place_added_to_itinerary
proposal_generated
proposal_accepted
```

---

## 232. Diferença entre intenção e sucesso

Registrar separadamente quando relevante:

```text
place_save_requested
place_saved
place_save_failed
```

---

## 233. Objeto e ação

Nomes deverão refletir:

```text
objeto + ação + estado
```

A convenção técnica definitiva será definida posteriormente.

---

## 234. Conteúdo sensível

Não utilizar em nomes ou propriedades:

* texto livre sensível;
* endereço completo sem necessidade;
* Restrições pessoais detalhadas;
* localização precisa sem finalidade legítima.

---

# Parte XXVII — Regras para testes

## 235. Cenários de domínio

Os testes deverão utilizar termos oficiais.

Preferir:

```text
Dado que a Viagem possui um Lugar Salvo
Quando o Usuário adiciona o Lugar ao Roteiro
Então uma Atividade é criada no Dia selecionado
```

Evitar:

```text
Dado que o ponto está favoritado
Quando o item é colocado na agenda
```

---

## 236. Nomes de testes

Exemplos:

```text
should_add_saved_place_to_itinerary
should_preserve_activity_when_place_is_unsaved
should_invalidate_travel_estimates_when_accommodation_changes
```

---

## 237. Fixtures

Fixtures deverão utilizar nomes de domínio.

Exemplos:

```text
trip
traveler
savedPlace
tripDay
activity
itineraryProposal
```

---

# Parte XXVIII — Regras para agentes de IA

## 238. Consulta obrigatória

Agentes deverão consultar este glossário antes de:

* gerar documentação;
* criar código;
* sugerir entidades;
* produzir eventos;
* escrever testes;
* gerar microcopy;
* analisar requisitos;
* propor APIs.

---

## 239. Preservação semântica

Agentes não deverão:

* substituir termos oficiais por sinônimos;
* criar entidades paralelas;
* confundir Lugar com Atividade;
* confundir Salvo com Planejado;
* confundir Roteiro com Proposta;
* confundir Recomendação com decisão;
* confundir Conflito com erro técnico.

---

## 240. Termo ausente

Quando um conceito necessário não existir, o agente deverá:

1. identificar a lacuna;
2. utilizar descrição provisória;
3. propor termo;
4. explicar diferença para termos existentes;
5. solicitar revisão documental;
6. evitar tornar o termo canônico automaticamente.

---

## 241. Ambiguidade

Quando um termo possuir possível ambiguidade, o agente deverá utilizar o nome qualificado.

Exemplos:

```text
Destino da Viagem
Destino do Deslocamento
Estado da Viagem
Estado da Atividade
```

---

## 242. Tradução automática

Agentes não deverão traduzir conceitos técnicos palavra por palavra sem preservar significado.

Exemplo:

```text
Travel Leg
```

Deve ser traduzido como:

```text
Deslocamento
```

e não necessariamente como:

```text
perna da viagem
```

---

# Parte XXIX — Critérios para novos termos

## 243. Necessidade

Um novo termo deverá ser criado quando:

* representar conceito relevante;
* possuir significado distinto;
* aparecer de forma recorrente;
* exigir regra própria;
* melhorar precisão;
* não puder ser representado por termo existente.

---

## 244. Proposta de termo

A proposta deverá conter:

* nome;
* definição;
* contexto;
* limites;
* exemplos;
* não exemplos;
* relações;
* termo técnico;
* sinônimos permitidos;
* sinônimos proibidos;
* documentos afetados.

---

## 245. Critérios de aprovação

O termo será aprovado quando:

* não duplicar conceito;
* possuir definição precisa;
* funcionar em produto e tecnologia;
* permitir tradução;
* possuir rastreabilidade;
* não introduzir ambiguidade;
* estiver alinhado à Bible.

---

## 246. Termo provisório

Termos provisórios deverão ser explicitamente marcados.

Exemplo:

```text
Termo provisório: Etapa da Viagem
Status: em avaliação
```

Não deverão ser usados como canônicos antes da aprovação.

---

# Parte XXX — Alteração e depreciação

## 247. Alteração de definição

Uma alteração semântica deverá revisar:

* Modelo de Domínio;
* PRD;
* UX;
* Design System;
* Arquitetura;
* Dados;
* eventos;
* APIs;
* testes;
* analytics;
* prompts.

---

## 248. Renomeação

Uma renomeação deverá possuir:

* termo anterior;
* termo novo;
* justificativa;
* data;
* versão;
* impacto;
* plano de migração;
* período de compatibilidade técnica.

---

## 249. Depreciação

Termos depreciados deverão ser registrados.

Exemplo:

```text
Termo depreciado: Favorito
Substituto: Lugar Salvo
Motivo: alinhamento com o comportamento real
```

---

## 250. Remoção

Um termo somente deverá ser removido da linguagem ativa quando:

* todas as referências forem migradas;
* integrações forem revisadas;
* documentação estiver atualizada;
* histórico permanecer disponível.

---

# Parte XXXI — Matriz de equivalência

## 251. Português e inglês técnico

| Português                  | Inglês técnico       |
| -------------------------- | -------------------- |
| Conta                      | Account              |
| Usuário                    | User                 |
| Viagem                     | Trip                 |
| Destino                    | Destination          |
| Período da Viagem          | TripPeriod           |
| Dia da Viagem              | TripDay              |
| Hospedagem                 | Accommodation        |
| Viajante                   | Traveler             |
| Perfil do Grupo            | GroupProfile         |
| Preferência                | Preference           |
| Interesse                  | Interest             |
| Restrição                  | Restriction          |
| Ritmo                      | Pace                 |
| Orçamento                  | Budget               |
| Lugar                      | Place                |
| Lugar Salvo                | SavedPlace           |
| Roteiro                    | Itinerary            |
| Atividade                  | Activity             |
| Período Livre              | FreePeriod           |
| Deslocamento               | TravelLeg            |
| Distância                  | Distance             |
| Tempo de Deslocamento      | TravelTime           |
| Meio de Transporte         | TransportMode        |
| Estimativa de Deslocamento | TravelEstimate       |
| Recomendação               | Recommendation       |
| Contexto de Decisão        | DecisionContext      |
| Justificativa              | RecommendationReason |
| Proposta de Roteiro        | ItineraryProposal    |
| Atividade Proposta         | ProposedActivity     |
| Conflito                   | Conflict             |
| Risco                      | PlanningRisk         |
| Alerta                     | Alert                |
| Fonte de Dados             | DataSource           |
| Proveniência               | Provenance           |
| Confiança                  | ConfidenceLevel      |
| Atualidade dos Dados       | DataFreshness        |

---

## 252. Ações e comandos

| Ação em português       | Comando técnico          |
| ----------------------- | ------------------------ |
| Criar Viagem            | CreateTrip               |
| Alterar Destino         | UpdateTripDestination    |
| Alterar Período         | UpdateTripPeriod         |
| Alterar Hospedagem      | UpdateAccommodation      |
| Adicionar Viajante      | AddTraveler              |
| Salvar Lugar            | SavePlace                |
| Remover dos Salvos      | UnsavePlace              |
| Adicionar ao Roteiro    | AddPlaceToItinerary      |
| Criar Atividade         | AddActivity              |
| Editar Atividade        | UpdateActivity           |
| Remover Atividade       | RemoveActivity           |
| Mover Atividade         | MoveActivity             |
| Adicionar Período Livre | AddFreePeriod            |
| Gerar Proposta          | RequestItineraryProposal |
| Aceitar Proposta        | AcceptItineraryProposal  |
| Rejeitar Proposta       | RejectItineraryProposal  |
| Revisar Conflitos       | ReviewConflicts          |
| Corrigir Conflito       | ResolveConflict          |
| Ignorar Risco           | IgnoreRisk               |
| Arquivar Viagem         | ArchiveTrip              |
| Excluir Viagem          | DeleteTrip               |

---

## 253. Eventos

| Fato em português         | Evento técnico             |
| ------------------------- | -------------------------- |
| Viagem criada             | TripCreated                |
| Destino alterado          | TripDestinationChanged     |
| Período alterado          | TripPeriodChanged          |
| Hospedagem alterada       | TripAccommodationChanged   |
| Lugar salvo               | PlaceSaved                 |
| Lugar removido dos Salvos | PlaceUnsaved               |
| Atividade adicionada      | ActivityAdded              |
| Atividade alterada        | ActivityUpdated            |
| Atividade removida        | ActivityRemoved            |
| Atividade movida          | ActivityMoved              |
| Proposta gerada           | ItineraryProposalGenerated |
| Proposta aceita           | ItineraryProposalAccepted  |
| Proposta rejeitada        | ItineraryProposalRejected  |
| Conflito detectado        | ConflictDetected           |
| Conflito resolvido        | ConflictResolved           |
| Risco ignorado            | ConflictIgnored            |

---

# Parte XXXII — Exemplos de uso correto

## 254. Salvos e Roteiro

Correto:

```text
A Praia do Amor está salva, mas ainda não foi adicionada ao Roteiro.
```

Incorreto:

```text
A Praia do Amor está no Roteiro porque foi favoritada.
```

---

## 255. Lugar e Atividade

Correto:

```text
A Atividade “Visitar a Praia do Amor” está associada ao Lugar Praia do Amor.
```

Incorreto:

```text
A Praia do Amor é uma Atividade.
```

---

## 256. Recomendação

Correto:

```text
O RouteBook recomendou o Chapadão por ficar próximo às Atividades do Dia.
```

Incorreto:

```text
O RouteBook decidiu incluir o Chapadão.
```

---

## 257. Proposta

Correto:

```text
A Proposta de Roteiro ainda precisa ser revisada antes de ser aplicada.
```

Incorreto:

```text
O novo Roteiro já foi criado automaticamente.
```

---

## 258. Estimativa

Correto:

```text
O Tempo de Deslocamento estimado é de cerca de 15 minutos.
```

Incorreto:

```text
O deslocamento levará exatamente 15 minutos.
```

---

## 259. Conflito

Correto:

```text
Foi detectado um Risco de intervalo curto entre duas Atividades.
```

Incorreto:

```text
O sistema encontrou um bug no Roteiro.
```

---

## 260. Dados desatualizados

Correto:

```text
A estimativa ficou desatualizada após a alteração da Hospedagem.
```

Incorreto:

```text
A Distância está errada.
```

sem evidência suficiente.

---

# Parte XXXIII — Anti-patterns linguísticos

## 261. Sinônimos por estilo

Não alternar termos apenas para evitar repetição.

Exemplo inadequado:

```text
Viagem
jornada
excursão
aventura
```

quando todos se referem à mesma entidade.

A repetição controlada do termo oficial é preferível à ambiguidade.

---

## 262. Termos de banco de dados na interface

Não apresentar:

* registro;
* tabela;
* chave;
* entidade;
* relacionamento;
* payload.

---

## 263. Termos de integração no domínio

Não permitir que nomes de provedores definam conceitos internos.

Exemplo inadequado:

```text
GooglePlace
```

como entidade principal.

Preferir:

```text
Place
```

com identificador externo do provedor.

---

## 264. Booleanos como conceitos

Evitar conceitos reduzidos a booleanos ambíguos.

Exemplo:

```text
place.active = true
```

Pode significar:

* aberto;
* disponível;
* selecionado;
* publicado;
* não removido.

Utilizar estado específico.

---

## 265. Termos vagos

Evitar:

* item;
* coisa;
* conteúdo;
* dado;
* objeto;
* informação;

quando existir conceito específico.

---

## 266. Termos absolutos

Evitar:

* melhor;
* perfeito;
* garantido;
* definitivo;
* sempre;
* sem risco;

sem base adequada.

---

## 267. Antropomorfização

Evitar:

```text
A IA decidiu
A IA sabe
A IA escolheu por você
```

Preferir:

```text
O RouteBook sugeriu
A proposta considera
A análise identificou
```

---

# Parte XXXIV — Critérios de aceite

## 268. Precisão

* cada conceito central possui definição;
* os limites estão explícitos;
* termos próximos estão diferenciados;
* ambiguidades relevantes foram tratadas.

---

## 269. Consistência

* termos estão alinhados ao Modelo de Domínio;
* interface e documentação usam a mesma linguagem;
* equivalências técnicas estão registradas;
* sinônimos proibidos estão identificados.

---

## 270. Cobertura

* identidade está contemplada;
* Viagem está contemplada;
* geografia está contemplada;
* tempo está contemplado;
* participantes estão contemplados;
* Preferências estão contempladas;
* Lugares estão contemplados;
* Roteiro está contemplado;
* mobilidade está contemplada;
* Recomendações estão contempladas;
* Propostas estão contempladas;
* Conflitos estão contemplados;
* dados estão contemplados;
* IA está contemplada.

---

## 271. Implementação

* entidades possuem nomes técnicos;
* comandos e eventos estão diferenciados;
* identificadores seguem padrão;
* datas, moedas e Distâncias evitam primitivas ambíguas;
* booleanos possuem nomes claros.

---

## 272. IA

* agentes possuem regras de consulta;
* lacunas possuem processo;
* traduções preservam significado;
* termos não podem ser alterados autonomamente;
* sinônimos não criam conceitos paralelos.

---

# Parte XXXV — Governança

## 273. Owner

O owner deste glossário é:

```text
Domain
```

A manutenção deverá envolver:

* Produto;
* Experience;
* Arquitetura;
* Dados;
* Frontend;
* Backend;
* QA;
* Content Design;
* IA.

---

## 274. Revisão obrigatória

Mudanças em termos centrais deverão ser revisadas por:

* Domain;
* Produto;
* Arquitetura;
* área diretamente afetada.

Mudanças de interface também deverão envolver Experience ou Content Design.

---

## 275. Registro de decisão

Alterações significativas deverão registrar:

* termo;
* definição anterior;
* definição nova;
* motivo;
* impacto;
* documentos afetados;
* versão;
* responsáveis.

---

## 276. Auditoria terminológica

Auditorias deverão procurar:

* termos duplicados;
* sinônimos não autorizados;
* divergência entre interface e domínio;
* nomes técnicos inconsistentes;
* termos de provedores vazando para o domínio;
* conceitos sem definição;
* termos depreciados ainda ativos.

---

## 277. Uso por agentes de IA

Agentes deverão:

* indexar este documento com alta prioridade;
* citar o termo oficial em propostas;
* manter equivalência português–inglês;
* identificar conflitos terminológicos;
* não promover termos provisórios;
* informar quando um conceito não estiver definido;
* atualizar documentos dependentes após aprovação.

---

## 278. Checklist de revisão

Antes de aprovar este documento, verificar:

* regras de uso estão definidas;
* conceitos centrais estão definidos;
* termos próximos estão diferenciados;
* sinônimos permitidos estão claros;
* sinônimos proibidos estão claros;
* equivalências técnicas estão presentes;
* comandos estão padronizados;
* eventos estão padronizados;
* interface está alinhada;
* analytics está contemplado;
* testes estão contemplados;
* IA está contemplada;
* tradução está contemplada;
* governança está definida;
* rastreabilidade com o Modelo de Domínio está preservada.

---

## 279. Declaração final

A Linguagem Ubíqua e o Glossário de Domínio estabelecem o vocabulário oficial do RouteBook.

Esse vocabulário deverá garantir que pessoas, documentos, sistemas e agentes de IA compreendam da mesma maneira conceitos como:

* Viagem;
* Destino;
* Hospedagem;
* Viajante;
* Preferência;
* Restrição;
* Lugar;
* Lugar Salvo;
* Roteiro;
* Atividade;
* Período Livre;
* Deslocamento;
* Recomendação;
* Proposta de Roteiro;
* Conflito;
* Proveniência;
* Estimativa.

O uso consistente dessa linguagem é uma condição para preservar a integridade do produto.

No RouteBook:

* Lugar não é Atividade;
* Salvar não é Planejar;
* Roteiro não é Proposta;
* Recomendação não é decisão;
* Estimativa não é garantia;
* Alerta não é Conflito;
* Usuário não é necessariamente Viajante;
* Destino da Viagem não é destino de um Deslocamento.

Toda evolução futura deverá preservar essas distinções ou alterá-las por meio de decisão explícita e versionada.
