---

id: RB-FND-004

title: Glossário do Produto
description: Define a terminologia oficial do RouteBook e estabelece o significado dos principais conceitos utilizados na documentação, no produto e na implementação.

document_type: foundation
owner: Product

status: Draft
version: "0.1.0"

created: "2026-07-15"
last_updated: null

authors:

- RouteBook Team

tags:

- foundation
- glossary
- terminology
- domain-language
- product-language

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003

prerequisites:

- RB-FND-001
- RB-FND-002
- RB-FND-003

next_documents:

- RB-PRD-001
- RB-DOM-001

ai_context:
priority: high
index: true
---

# RouteBook — Glossário do Produto

## 1. Propósito deste documento

Este documento define a terminologia oficial do RouteBook.

Seu objetivo é estabelecer um vocabulário comum para:

* produto;
* experiência do usuário;
* domínio;
* inteligência;
* arquitetura;
* desenvolvimento;
* testes;
* documentação;
* comunicação entre pessoas;
* comunicação com agentes de inteligência artificial.

Os termos definidos aqui devem ser utilizados de maneira consistente em todos os documentos e implementações do projeto.

Quando um termo possuir significado específico dentro do RouteBook, esse significado deverá prevalecer sobre interpretações informais ou genéricas.

O glossário não substitui a modelagem detalhada do domínio.

Ele estabelece a linguagem necessária para que documentos posteriores possam ser compreendidos sem ambiguidade.

---

## 2. Regras de utilização

A terminologia oficial deverá seguir estas regras:

1. Um mesmo conceito deve utilizar sempre o mesmo termo principal.
2. Termos diferentes não devem ser utilizados como sinônimos quando representarem conceitos distintos.
3. Nomes técnicos de fornecedores não devem substituir conceitos do produto.
4. Termos apresentados ao usuário podem ser mais simples que termos internos, desde que preservem o mesmo significado.
5. Novos termos relevantes devem ser adicionados ao glossário antes de serem utilizados extensivamente.
6. Termos obsoletos devem ser marcados como descontinuados, não removidos sem histórico.
7. Definições de domínio devem ser independentes de tecnologias específicas.
8. A linguagem deve permanecer compreensível para pessoas e agentes de IA.

---

## 3. Convenções terminológicas

### 3.1 Termo oficial

É o nome adotado como referência principal para um conceito.

Exemplo:

```text
Viagem
```

### 3.2 Termo apresentado ao usuário

É a forma utilizada na interface quando uma linguagem mais simples for necessária.

Exemplo:

```text
Minha viagem
```

### 3.3 Sinônimo permitido

É uma variação que pode ser utilizada sem alterar o significado, desde que não gere ambiguidade.

### 3.4 Termo evitado

É uma palavra que não deve ser utilizada para representar determinado conceito, geralmente por ser genérica, imprecisa ou associada a outro significado.

### 3.5 Conceito técnico

É um termo utilizado internamente em arquitetura, domínio ou implementação.

Não precisa necessariamente aparecer na interface.

---

# Parte I — Conceitos centrais

## 4. RouteBook

### Definição

Nome oficial do produto.

O RouteBook é uma aplicação web de apoio à descoberta, organização e execução de viagens de lazer.

O produto combina contexto, preferências, lugares, mapas, distâncias e planejamento para ajudar o viajante a tomar decisões antes e durante a viagem.

### Uso correto

* RouteBook
* produto RouteBook
* aplicação RouteBook

### Uso incorreto

* Route Book
* Routebook, quando utilizado como marca na documentação
* aplicativo de reservas
* agência de viagens

### Observação

O nome técnico do repositório pode possuir variações por restrições de plataforma, mas a marca oficial deverá ser escrita como **RouteBook**.

---

## 5. Viagem

### Definição

Contexto principal de planejamento dentro do RouteBook.

Uma Viagem representa um período definido em que um ou mais viajantes visitarão um destino ou região.

Ela poderá conter:

* nome;
* destino;
* período;
* hospedagem;
* viajantes;
* preferências;
* orçamento;
* transporte;
* lugares salvos;
* roteiro.

### Exemplo

> Viagem para Pipa, de 22 a 29 de julho de 2026.

### Termos evitados

* projeto de viagem;
* pacote;
* excursão;
* reserva.

### Observação

No escopo inicial, uma Viagem possui um destino ou região principal.

---

## 6. Viajante

### Definição

Pessoa que participa de uma Viagem.

O Viajante pode possuir características e preferências relevantes para o planejamento.

### Exemplos de informações

* faixa etária;
* interesses;
* restrições;
* preferências alimentares;
* necessidades de acessibilidade;
* ritmo desejado.

### Observação

Uma pessoa que utiliza o sistema pode ser simultaneamente:

* Usuário;
* Organizador da Viagem;
* Viajante.

Esses papéis não são necessariamente equivalentes.

---

## 7. Usuário

### Definição

Pessoa que interage com o RouteBook.

O Usuário poderá criar, consultar ou modificar uma Viagem.

### Diferença entre Usuário e Viajante

* Usuário: pessoa que utiliza o sistema.
* Viajante: pessoa que participa da viagem.

Um Usuário pode organizar uma viagem da qual outras pessoas participam.

---

## 8. Organizador da Viagem

### Definição

Usuário responsável pela criação e manutenção principal de uma Viagem.

No escopo inicial, o Organizador poderá ser a única pessoa com controle de edição.

### Responsabilidades possíveis

* cadastrar a viagem;
* informar hospedagem;
* definir preferências;
* salvar lugares;
* organizar o roteiro;
* realizar alterações.

### Termos evitados

* administrador;
* proprietário da viagem;
* gerente da viagem.

---

## 9. Destino

### Definição

Localidade ou região principal visitada durante uma Viagem.

Um Destino poderá representar:

* cidade;
* vila;
* município;
* região turística;
* ilha;
* conjunto geográfico reconhecido.

### Exemplos

* Pipa;
* Natal;
* Serra Gaúcha;
* Circuito das Águas Paulista.

### Observação

O Destino não deve ser confundido com um Lugar específico.

---

## 10. Período da Viagem

### Definição

Intervalo entre a data inicial e a data final de uma Viagem.

O Período da Viagem determina:

* quantidade de dias;
* disponibilidade para atividades;
* organização do roteiro;
* contexto temporal das recomendações.

### Termos relacionados

* data de início;
* data de término;
* duração da viagem.

---

## 11. Dia da Viagem

### Definição

Unidade cronológica utilizada para organizar atividades dentro de uma Viagem.

Cada Dia da Viagem poderá conter:

* atividades;
* refeições;
* deslocamentos;
* períodos livres;
* observações.

### Observação

O Dia da Viagem não é necessariamente um período completo de 24 horas disponível para atividades.

Dias de chegada e partida podem possuir disponibilidade parcial.

---

## 12. Hospedagem

### Definição

Local principal onde o grupo permanecerá durante uma Viagem.

A Hospedagem funciona como uma referência geográfica importante para:

* calcular distâncias;
* estimar deslocamentos;
* recomendar lugares;
* organizar o início e o fim dos dias.

### Exemplos

* hotel;
* pousada;
* apartamento;
* casa;
* hostel.

### Termos evitados

* hotel, quando o conceito puder abranger outros tipos;
* base, na interface;
* endereço principal, quando se referir especificamente à hospedagem.

---

# Parte II — Lugares e experiências

## 13. Lugar

### Definição

Entidade geográfica que pode ser descoberta, consultada, salva ou adicionada ao roteiro.

Um Lugar possui localização identificável e poderá representar:

* praia;
* restaurante;
* bar;
* balada;
* atração;
* parque;
* mirante;
* estabelecimento;
* ponto turístico.

### Informações possíveis

* nome;
* categoria;
* endereço;
* coordenadas;
* fotografias;
* avaliação;
* faixa de preço;
* horário de funcionamento;
* distância;
* duração sugerida.

### Observação

Lugar é o conceito geral. Categorias específicas devem ser representadas por classificação, e não necessariamente por modelos completamente independentes.

---

## 14. Experiência

### Definição

Atividade ou vivência que o viajante pode realizar durante uma Viagem.

Uma Experiência pode estar associada a um Lugar, mas não precisa ser equivalente a ele.

### Exemplos

* assistir ao pôr do sol;
* fazer passeio de barco;
* praticar mergulho;
* participar de uma visita guiada;
* realizar uma experiência gastronômica.

### Diferença entre Lugar e Experiência

* Lugar: onde algo existe ou acontece.
* Experiência: o que o viajante realiza.

### Exemplo

* Lugar: Praia do Madeiro.
* Experiência: aula de surfe na Praia do Madeiro.

---

## 15. Categoria de Lugar

### Definição

Classificação utilizada para organizar e filtrar Lugares.

### Categorias iniciais possíveis

* praia;
* restaurante;
* bar;
* vida noturna;
* atração;
* passeio;
* natureza;
* cultura;
* compras;
* serviço.

### Observação

As categorias oficiais serão detalhadas posteriormente no modelo de domínio.

---

## 16. Atração

### Definição

Lugar ou Experiência que possui interesse turístico, cultural, natural, histórico ou recreativo.

### Exemplos

* monumento;
* parque;
* mirante;
* museu;
* centro histórico;
* passeio turístico.

### Termos relacionados

* ponto turístico;
* atração turística.

### Termo oficial recomendado

Utilizar **Atração** como termo principal.

---

## 17. Praia

### Definição

Categoria de Lugar associada a uma área costeira utilizada para lazer, contemplação ou atividades aquáticas.

### Informações específicas possíveis

* condições de acesso;
* estrutura;
* perfil do mar;
* presença de barracas;
* indicação para crianças;
* duração sugerida;
* melhor período.

---

## 18. Restaurante

### Definição

Categoria de Lugar voltada principalmente ao consumo de refeições.

### Informações específicas possíveis

* tipo de culinária;
* faixa de preço;
* restrições alimentares atendidas;
* necessidade de reserva;
* horários;
* adequação para grupos.

---

## 19. Bar

### Definição

Categoria de Lugar voltada principalmente ao consumo de bebidas, socialização e entretenimento.

Um Bar pode ou não possuir:

* música ao vivo;
* refeições;
* dança;
* apresentações;
* funcionamento noturno.

---

## 20. Vida noturna

### Definição

Categoria ampla que reúne Lugares e Experiências realizados predominantemente à noite.

### Exemplos

* bares;
* baladas;
* casas de show;
* festas;
* eventos noturnos.

### Observação

Vida noturna não deve ser utilizada como sinônimo exclusivo de balada.

---

## 21. Balada

### Definição

Lugar ou evento noturno voltado principalmente à música, dança e socialização.

### Termo alternativo

Casa noturna.

### Observação

Na interface, o vocabulário poderá ser adaptado ao perfil e à região, mas a classificação interna deve permanecer consistente.

---

## 22. Ponto de interesse

### Definição

Lugar relevante para a viagem, mesmo que não seja uma atividade turística principal.

### Exemplos

* estacionamento;
* farmácia;
* mercado;
* posto de combustível;
* aeroporto;
* terminal rodoviário.

### Abreviação técnica permitida

POI, apenas em contextos técnicos.

### Termo apresentado ao usuário

Preferir o nome da categoria ou **Lugar**.

---

## 23. Detalhes do Lugar

### Definição

Conjunto de informações disponíveis sobre um Lugar.

Pode incluir:

* descrição;
* localização;
* fotografias;
* avaliação;
* faixa de preço;
* horário;
* distância;
* duração sugerida;
* recomendações;
* observações;
* fonte dos dados.

---

# Parte III — Descoberta e seleção

## 24. Explorar

### Definição

Área ou ação utilizada para descobrir Lugares e Experiências dentro de uma Viagem.

### Capacidades possíveis

* visualizar recomendações;
* filtrar categorias;
* pesquisar;
* abrir detalhes;
* localizar no mapa;
* salvar;
* adicionar ao roteiro.

### Termo apresentado ao usuário

**Explorar**.

---

## 25. Descoberta

### Definição

Processo de apresentar ao usuário Lugares ou Experiências que ele ainda não selecionou.

A Descoberta poderá ser orientada por:

* destino;
* categoria;
* popularidade;
* proximidade;
* interesses;
* orçamento;
* contexto da viagem.

---

## 26. Pesquisa

### Definição

Ação explícita em que o usuário procura um Lugar, categoria ou termo específico.

### Diferença entre Pesquisa e Descoberta

* Pesquisa: o usuário sabe o que deseja procurar.
* Descoberta: o produto apresenta possibilidades relevantes.

---

## 27. Filtro

### Definição

Critério aplicado pelo usuário para reduzir ou organizar resultados.

### Exemplos

* categoria;
* faixa de preço;
* distância;
* avaliação;
* horário;
* perfil;
* acessibilidade.

---

## 28. Lugar salvo

### Definição

Lugar que o usuário deseja manter como opção de interesse, sem necessariamente incluí-lo no roteiro.

### Ações possíveis

* salvar;
* remover dos salvos;
* visualizar no mapa;
* adicionar ao roteiro;
* comparar.

### Termos evitados

* favorito, quando o usuário apenas demonstra interesse;
* desejo;
* item salvo.

### Observação

**Favorito** poderá representar futuramente uma preferência mais forte, caso exista necessidade de diferenciação.

---

## 29. Lugar obrigatório

### Definição

Lugar que o usuário considera prioritário ou indispensável para a Viagem.

O planejamento deverá tentar incluir esse Lugar antes de opções comuns, respeitando restrições reais.

### Observação

Obrigatório representa preferência do usuário, não garantia de viabilidade.

---

## 30. Comparação

### Definição

Processo de avaliar duas ou mais opções com base em critérios relevantes.

### Critérios possíveis

* distância;
* preço;
* avaliação;
* duração;
* horário;
* adequação ao perfil;
* custo-benefício;
* compatibilidade com o roteiro.

---

# Parte IV — Preferências e contexto

## 31. Contexto da Viagem

### Definição

Conjunto de informações que descreve as condições reais de uma Viagem.

Pode incluir:

* destino;
* período;
* hospedagem;
* viajantes;
* orçamento;
* transporte;
* preferências;
* restrições;
* roteiro atual;
* tempo disponível.

### Observação

O Contexto da Viagem é uma das principais entradas para recomendações e planejamento.

---

## 32. Preferência

### Definição

Indicação de algo que o usuário ou viajante tende a desejar.

### Exemplos

* praias tranquilas;
* restaurantes econômicos;
* música ao vivo;
* passeios culturais;
* roteiro pouco intenso.

### Observação

Uma Preferência influencia recomendações, mas não representa necessariamente uma restrição.

---

## 33. Interesse

### Definição

Tema, categoria ou tipo de experiência que desperta atenção do usuário.

### Exemplos

* gastronomia;
* natureza;
* praias;
* história;
* vida noturna.

### Diferença entre Interesse e Preferência

* Interesse: tipo de conteúdo ou experiência desejada.
* Preferência: forma específica como o usuário deseja vivenciar esse interesse.

### Exemplo

* Interesse: gastronomia.
* Preferência: restaurantes regionais de preço moderado.

---

## 34. Restrição

### Definição

Condição que limita ou impede determinadas opções.

### Exemplos

* restrição alimentar;
* limitação de mobilidade;
* orçamento máximo;
* horário indisponível;
* atividade inadequada para crianças;
* ausência de veículo.

### Observação

Restrições devem possuir prioridade maior que preferências quando houver conflito.

---

## 35. Perfil da Viagem

### Definição

Representação resumida do estilo e das características gerais de uma Viagem.

### Exemplos

* econômica;
* familiar;
* romântica;
* gastronômica;
* aventura;
* vida noturna;
* descanso;
* equilibrada.

### Observação

Uma Viagem pode possuir mais de um perfil.

---

## 36. Perfil do Grupo

### Definição

Representação das características coletivas dos Viajantes.

Pode considerar:

* quantidade de pessoas;
* idades;
* presença de crianças;
* interesses compartilhados;
* restrições;
* ritmo;
* orçamento.

---

## 37. Ritmo da Viagem

### Definição

Nível de intensidade desejado para o planejamento.

### Classificações iniciais possíveis

* tranquilo;
* equilibrado;
* intenso.

### Tranquilo

Poucas atividades, maior tempo livre e margens amplas.

### Equilibrado

Combinação entre atividades, pausas e tempo livre.

### Intenso

Maior quantidade de atividades e menor tempo ocioso, mantendo viabilidade mínima.

---

## 38. Orçamento da Viagem

### Definição

Valor ou faixa de valor que o usuário pretende gastar durante a Viagem.

O orçamento poderá ser definido por:

* viagem;
* dia;
* pessoa;
* categoria.

### Observação

No escopo inicial, o orçamento poderá funcionar apenas como referência para recomendações.

---

## 39. Faixa de preço

### Definição

Classificação aproximada do custo associado a um Lugar ou Experiência.

### Classificações possíveis

* econômico;
* moderado;
* elevado;
* premium.

### Observação

A classificação deverá considerar o contexto do destino e possuir origem conhecida.

---

## 40. Custo-benefício

### Definição

Relação entre o valor esperado de uma opção e o custo necessário para realizá-la.

Pode considerar:

* preço;
* qualidade;
* avaliação;
* duração;
* distância;
* experiência oferecida;
* adequação ao perfil;
* custo de deslocamento.

### Observação

Custo-benefício não significa simplesmente menor preço.

---

# Parte V — Mapa, localização e deslocamento

## 41. Mapa da Viagem

### Definição

Representação geográfica dos elementos relevantes de uma Viagem.

Pode apresentar:

* hospedagem;
* lugares;
* atividades;
* rotas;
* distâncias;
* agrupamentos;
* categorias.

### Termo apresentado ao usuário

**Mapa**.

### Observação

O Mapa da Viagem é uma capacidade do produto, independentemente do fornecedor utilizado.

---

## 42. Localização

### Definição

Posição geográfica associada a uma entidade.

Pode ser representada por:

* endereço;
* coordenadas;
* ponto no mapa;
* região;
* referência geográfica.

---

## 43. Coordenadas geográficas

### Definição

Representação técnica de uma localização por latitude e longitude.

### Uso

Termo técnico utilizado em domínio, integração e arquitetura.

Não precisa ser apresentado diretamente ao usuário.

---

## 44. Marcador

### Definição

Elemento visual utilizado para representar uma localização no mapa.

Um Marcador poderá indicar:

* Lugar;
* Hospedagem;
* Atividade;
* ponto de interesse;
* início ou fim de rota.

### Termos técnicos alternativos

* pin;
* map marker.

### Termo oficial

Preferir **Marcador** na documentação em português.

---

## 45. Agrupamento de marcadores

### Definição

Representação visual que reúne vários Marcadores próximos para reduzir poluição no mapa.

### Termo técnico permitido

Cluster.

### Termo oficial

Agrupamento de marcadores.

---

## 46. Distância

### Definição

Medida espacial entre dois pontos.

Poderá ser apresentada como:

* distância em linha reta;
* distância por rota;
* distância da hospedagem;
* distância entre atividades.

### Observação

Sempre que possível, o tipo de distância deverá ser identificado.

---

## 47. Tempo de deslocamento

### Definição

Estimativa de tempo necessário para viajar entre duas localizações.

Pode considerar:

* meio de transporte;
* rota;
* trânsito;
* distância;
* condições conhecidas.

### Observação

Tempo de deslocamento é uma estimativa, não uma garantia.

---

## 48. Deslocamento

### Definição

Movimento entre dois pontos da Viagem.

Um Deslocamento poderá existir:

* entre hospedagem e atividade;
* entre atividades;
* entre atividade e refeição;
* no retorno à hospedagem.

### Informações possíveis

* origem;
* destino;
* distância;
* duração estimada;
* transporte;
* rota.

---

## 49. Rota

### Definição

Caminho sugerido entre duas ou mais localizações.

### Observação

O RouteBook poderá exibir ou encaminhar para uma Rota, mas não deverá inicialmente substituir um aplicativo completo de navegação.

---

## 50. Meio de transporte

### Definição

Forma utilizada pelo viajante para realizar deslocamentos.

### Exemplos

* carro;
* caminhada;
* transporte por aplicativo;
* transporte público;
* bicicleta;
* combinação de meios.

---

## 51. Proximidade

### Definição

Relação espacial que indica que dois ou mais Lugares estão relativamente próximos.

### Observação

Proximidade não deve utilizar um limite universal.

Ela poderá depender de:

* destino;
* transporte;
* tempo disponível;
* contexto urbano;
* perfil do usuário.

---

## 52. Região

### Definição

Área geográfica utilizada para agrupar Lugares ou atividades.

### Exemplos

* centro;
* orla;
* bairro;
* zona turística;
* região de praias.

### Observação

Uma Região pode ser formal ou criada pelo produto para facilitar o planejamento.

---

# Parte VI — Roteiro e planejamento

## 53. Roteiro

### Definição

Organização temporal e geográfica das atividades planejadas para uma Viagem.

O Roteiro poderá conter:

* dias;
* atividades;
* horários;
* refeições;
* deslocamentos;
* períodos livres;
* observações.

### Observação

O Roteiro é editável e não deve ser tratado como programação imutável.

---

## 54. Atividade planejada

### Definição

Item incluído no Roteiro para ser realizado em determinado dia ou período.

Uma Atividade planejada poderá representar:

* visita a um Lugar;
* Experiência;
* refeição;
* deslocamento;
* evento;
* período livre.

### Termo apresentado ao usuário

Na interface, poderá ser utilizado apenas **Atividade**.

---

## 55. Item do roteiro

### Definição

Conceito técnico geral para qualquer elemento organizado dentro do Roteiro.

Pode representar:

* atividade;
* refeição;
* deslocamento;
* período livre;
* observação operacional.

### Observação

O termo é útil internamente, mas a interface deve utilizar nomes mais específicos.

---

## 56. Horário planejado

### Definição

Horário estimado de início ou término de uma atividade.

### Observação

O Horário planejado não representa garantia de execução exata.

---

## 57. Duração estimada

### Definição

Tempo aproximado reservado para uma atividade ou deslocamento.

### Observação

A duração poderá ser sugerida pelo sistema ou definida pelo usuário.

---

## 58. Período do dia

### Definição

Divisão ampla utilizada para organizar atividades.

### Classificações iniciais

* manhã;
* tarde;
* noite;
* madrugada.

### Observação

Os limites de horário poderão variar por contexto.

---

## 59. Período livre

### Definição

Intervalo do Roteiro sem atividade programada.

O Período livre poderá ser:

* criado pelo usuário;
* sugerido pelo sistema;
* utilizado como margem;
* mantido intencionalmente sem planejamento.

---

## 60. Disponibilidade

### Definição

Intervalo de tempo em que uma atividade pode ser planejada.

Pode ser influenciada por:

* horários do usuário;
* horário de funcionamento;
* data;
* duração;
* restrições;
* compromissos existentes.

---

## 61. Conflito de roteiro

### Definição

Situação em que dois ou mais elementos do Roteiro são incompatíveis.

### Exemplos

* sobreposição de horários;
* local fechado;
* deslocamento inviável;
* atividade fora do período disponível;
* duração superior ao tempo restante.

---

## 62. Dia sobrecarregado

### Definição

Dia da Viagem com quantidade ou duração de atividades incompatível com um planejamento realista.

Pode considerar:

* ausência de pausas;
* deslocamentos excessivos;
* horários muito próximos;
* intensidade acima do perfil;
* falta de margem.

---

## 63. Geração de roteiro

### Definição

Processo de criar uma proposta inicial de organização das atividades.

A geração poderá considerar:

* datas;
* lugares selecionados;
* localização;
* duração;
* preferências;
* orçamento;
* horários;
* ritmo.

### Observação

O resultado é uma sugestão editável.

---

## 64. Replanejamento

### Definição

Processo de alterar uma parte existente do Roteiro em resposta a uma mudança.

### Exemplos

* substituir atividade;
* alterar horário;
* reorganizar o dia;
* reduzir deslocamento;
* adaptar por chuva.

### Diferença entre Geração e Replanejamento

* Geração: cria uma organização inicial.
* Replanejamento: modifica um planejamento existente.

---

## 65. Otimização de roteiro

### Definição

Processo de buscar uma organização mais adequada segundo determinados critérios.

### Critérios possíveis

* menor deslocamento;
* melhor uso do tempo;
* menor custo;
* maior compatibilidade;
* melhor distribuição de atividades.

### Observação

Otimização não deve eliminar preferências do usuário.

---

## 66. Viabilidade

### Definição

Condição que indica se um plano pode ser realizado nas condições conhecidas.

Pode considerar:

* tempo;
* distância;
* horário;
* duração;
* transporte;
* restrições;
* disponibilidade.

---

# Parte VII — Recomendação e inteligência

## 67. Recomendação

### Definição

Sugestão apresentada pelo RouteBook com base no Contexto da Viagem e nos dados disponíveis.

Uma Recomendação poderá indicar:

* Lugar;
* Experiência;
* horário;
* sequência;
* substituição;
* região;
* refeição;
* ajuste no roteiro.

### Observação

Toda Recomendação deverá permanecer sujeita à decisão do usuário.

---

## 68. Recomendação contextualizada

### Definição

Recomendação que considera fatores específicos da Viagem, e não apenas popularidade geral.

### Fatores possíveis

* distância;
* orçamento;
* preferências;
* perfil do grupo;
* tempo;
* transporte;
* roteiro existente;
* localização.

---

## 69. Justificativa da recomendação

### Definição

Explicação resumida dos principais motivos que levaram uma opção a ser recomendada.

### Exemplo

> Recomendado por estar próximo da hospedagem, possuir preço moderado e combinar com seu interesse por praias tranquilas.

### Termos relacionados

* explicação;
* motivo da recomendação.

### Termo oficial recomendado

**Justificativa da recomendação**.

---

## 70. Alternativa

### Definição

Opção apresentada como substituição possível para um Lugar, Experiência ou atividade planejada.

Uma Alternativa poderá ser sugerida por:

* menor preço;
* menor distância;
* horário compatível;
* categoria semelhante;
* indisponibilidade da opção original.

---

## 71. Pontuação de recomendação

### Definição

Valor técnico utilizado internamente para ordenar ou comparar opções.

A pontuação poderá combinar diferentes critérios e pesos.

### Observação

A Pontuação de recomendação não precisa ser exibida diretamente ao usuário.

---

## 72. Critério de recomendação

### Definição

Fator utilizado para avaliar a relevância de uma opção.

### Exemplos

* proximidade;
* preço;
* avaliação;
* interesse;
* duração;
* adequação ao grupo;
* compatibilidade temporal.

---

## 73. Relevância

### Definição

Grau de adequação de uma opção ao Contexto da Viagem.

### Observação

Relevância é contextual e não deve ser confundida com popularidade.

---

## 74. Popularidade

### Definição

Indicador de reconhecimento, procura ou quantidade de avaliações de um Lugar ou Experiência.

### Observação

Popularidade pode influenciar recomendações, mas não deve ser utilizada isoladamente.

---

## 75. Personalização

### Definição

Processo de adaptar conteúdo, recomendações e planejamento às informações do usuário e da Viagem.

### Observação

A personalização deverá ser progressiva e proporcional aos dados fornecidos.

---

## 76. Context Engine

### Definição

Nome técnico provisório para a capacidade responsável por consolidar o Contexto da Viagem.

### Responsabilidades possíveis

* reunir dados da viagem;
* identificar restrições;
* disponibilizar contexto para recomendações;
* atualizar informações após alterações.

### Termo em português

Motor de Contexto.

### Observação

O nome definitivo será validado na documentação de inteligência e arquitetura.

---

## 77. Recommendation Engine

### Definição

Nome técnico para o módulo responsável por avaliar e ordenar recomendações.

### Termo em português

Motor de Recomendação.

### Observação

Na documentação de produto, preferir o termo em português. O nome em inglês poderá ser utilizado em código e nomes de pacotes.

---

## 78. Travel Engine

### Definição

Nome técnico para o módulo responsável por apoiar a construção, validação e adaptação de roteiros.

### Termo em português

Motor de Viagem ou Motor de Roteiro.

### Observação

O nome oficial definitivo será detalhado posteriormente. Até lá, **Travel Engine** permanece como nome técnico do pacote.

---

## 79. Inteligência artificial

### Definição

Conjunto de capacidades computacionais utilizadas para interpretar, gerar, resumir ou apoiar decisões.

### Possíveis usos

* interpretar preferências;
* resumir informações;
* explicar recomendações;
* sugerir roteiros;
* propor alternativas.

### Observação

Inteligência artificial não deve ser utilizada como sinônimo de todo o sistema de recomendação.

---

## 80. Regra determinística

### Definição

Regra cujo resultado pode ser obtido de maneira previsível a partir das mesmas entradas.

### Exemplos

* atividade fora do horário de funcionamento;
* orçamento acima do limite;
* sobreposição de horários;
* distância superior ao filtro.

### Observação

Regras determinísticas devem ser utilizadas quando forem mais confiáveis que geração por IA.

---

# Parte VIII — Dados e confiabilidade

## 81. Dado externo

### Definição

Informação obtida de um provedor ou fonte fora do RouteBook.

### Exemplos

* endereço;
* avaliação;
* fotografia;
* rota;
* horário;
* previsão do tempo.

---

## 82. Fonte de dados

### Definição

Origem de uma informação utilizada pelo produto.

### Exemplos

* serviço de mapas;
* API;
* base aberta;
* conteúdo editorial;
* cadastro interno.

---

## 83. Provedor

### Definição

Serviço externo que fornece uma capacidade ou conjunto de dados.

### Exemplos

* provedor de mapas;
* provedor de lugares;
* provedor de clima;
* provedor de inteligência artificial.

### Observação

O conceito do produto não deve depender do nome específico do Provedor.

---

## 84. Dado estimado

### Definição

Informação calculada ou aproximada que pode variar em relação à realidade.

### Exemplos

* tempo de deslocamento;
* duração recomendada;
* custo médio;
* horário provável de chegada.

### Observação

Dados estimados deverão ser apresentados como estimativas.

---

## 85. Nível de confiança

### Definição

Indicação interna ou visível da confiabilidade atribuída a uma informação ou recomendação.

Pode considerar:

* origem;
* atualização;
* quantidade de dados;
* consistência entre fontes;
* natureza estimada.

---

## 86. Atualização dos dados

### Definição

Momento em que uma informação foi obtida, revisada ou confirmada.

### Observação

Informações instáveis devem, quando relevante, possuir contexto temporal.

---

# Parte IX — Experiência e interface

## 87. Cartão de Lugar

### Definição

Componente visual que apresenta um resumo de um Lugar.

Pode conter:

* fotografia;
* nome;
* categoria;
* avaliação;
* distância;
* faixa de preço;
* justificativa;
* ações.

### Termo técnico alternativo

Place Card.

### Termo oficial

Cartão de Lugar.

---

## 88. Linha do tempo

### Definição

Representação visual da sequência de atividades de um Dia da Viagem.

Pode exibir:

* horários;
* atividades;
* deslocamentos;
* períodos livres;
* conflitos.

---

## 89. Visualização em lista

### Definição

Apresentação sequencial ou agrupada de Lugares ou atividades.

### Observação

Deve permanecer sincronizada com o mapa quando ambas estiverem presentes.

---

## 90. Visualização em mapa

### Definição

Apresentação geográfica de Lugares ou atividades.

### Observação

Informações essenciais também devem possuir alternativa acessível fora do mapa.

---

## 91. Visualização do roteiro

### Definição

Forma de apresentar o planejamento temporal de uma Viagem.

Pode ser organizada por:

* dia;
* período;
* horário;
* atividade;
* mapa.

---

## 92. Estado vazio

### Definição

Estado da interface exibido quando ainda não existem dados ou itens suficientes.

### Exemplos

* nenhuma viagem criada;
* nenhum lugar salvo;
* roteiro vazio;
* nenhum resultado encontrado.

### Observação

Estados vazios devem orientar o próximo passo do usuário.

---

## 93. Estado de carregamento

### Definição

Estado temporário exibido enquanto o sistema obtém ou processa dados.

---

## 94. Estado de erro

### Definição

Estado apresentado quando uma ação não pode ser concluída.

A mensagem deverá indicar, quando possível:

* o que aconteceu;
* o impacto;
* o que o usuário pode fazer.

---

## 95. Responsividade

### Definição

Capacidade da interface de se adaptar a diferentes tamanhos de tela e contextos de uso.

### Observação

Responsividade não significa apenas redimensionamento visual. Os fluxos podem precisar de adaptação.

---

## 96. Acessibilidade

### Definição

Conjunto de práticas que permite que pessoas com diferentes capacidades utilizem o produto.

Inclui:

* navegação por teclado;
* leitores de tela;
* contraste;
* textos alternativos;
* foco visível;
* linguagem clara.

---

# Parte X — Produto e desenvolvimento

## 97. MVP

### Definição

Menor versão do RouteBook capaz de validar sua proposta central com usuários reais.

### Significado

Minimum Viable Product.

### Termo em português

Produto Mínimo Viável.

### Observação

MVP não significa produto incompleto ou sem qualidade. Significa escopo controlado para validar hipóteses essenciais.

---

## 98. Escopo inicial

### Definição

Conjunto de capacidades priorizadas para as primeiras fases do produto.

### Diferença entre Escopo inicial e MVP

* Escopo inicial: fronteira ampla das primeiras etapas.
* MVP: recorte mínimo necessário para validação.

---

## 99. Pós-MVP

### Definição

Capacidades compatíveis com a visão, mas não necessárias para a primeira validação.

---

## 100. Funcionalidade

### Definição

Capacidade oferecida pelo produto para permitir determinada ação ou resultado.

### Exemplos

* criar viagem;
* salvar lugar;
* adicionar atividade;
* visualizar mapa.

---

## 101. Requisito funcional

### Definição

Descrição verificável de um comportamento que o sistema deverá oferecer.

### Exemplo

> O usuário deve conseguir adicionar um Lugar salvo a um Dia da Viagem.

---

## 102. Requisito não funcional

### Definição

Condição de qualidade ou operação que o sistema deverá atender.

### Exemplos

* acessibilidade;
* desempenho;
* segurança;
* responsividade;
* disponibilidade.

---

## 103. Regra de negócio

### Definição

Regra que determina como conceitos e comportamentos do domínio devem funcionar.

### Exemplo

> Uma atividade não pode terminar antes de seu horário de início.

---

## 104. Critério de aceitação

### Definição

Condição verificável utilizada para confirmar que um requisito ou funcionalidade foi implementado corretamente.

---

## 105. Caso de uso

### Definição

Descrição de como um ator utiliza o produto para alcançar um objetivo.

---

## 106. Jornada do usuário

### Definição

Sequência de etapas, necessidades, decisões e interações vivenciadas pelo usuário em determinado contexto.

### Observação

Uma Jornada é mais ampla que um fluxo de interface.

---

## 107. Fluxo do usuário

### Definição

Sequência de interações realizadas dentro do produto para concluir uma tarefa.

---

## 108. Tela

### Definição

Unidade visual principal da aplicação.

### Observação

O conceito de Tela não deve ser confundido com rota técnica ou componente.

---

## 109. Componente

### Definição

Elemento reutilizável da interface.

### Exemplos

* botão;
* cartão;
* filtro;
* marcador;
* modal;
* seletor de data.

---

## 110. Módulo

### Definição

Unidade de organização com responsabilidade funcional ou técnica claramente definida.

### Observação

Um Módulo deve representar um limite real, não apenas uma divisão arbitrária.

---

## 111. Pacote

### Definição

Unidade de código reutilizável do monorepositório.

### Exemplos atuais

* `domain`;
* `maps`;
* `recommendation-engine`;
* `travel-engine`;
* `ui`.

---

## 112. Aplicação web

### Definição

Interface executável principal do RouteBook, acessada por navegador.

### Localização atual

```text
apps/web
```

---

## 113. Fonte oficial de verdade

### Definição

Local considerado autoritativo para decisões e informações do projeto.

No RouteBook, a fonte oficial de verdade é o repositório Git e sua documentação versionada.

---

## 114. Registro de documentos

### Definição

Inventário oficial dos documentos do projeto.

### Localização

```text
docs/registry.md
```

---

## 115. Frontmatter

### Definição

Bloco de metadados YAML localizado no início de um documento Markdown.

Pode conter:

* identificador;
* título;
* descrição;
* status;
* versão;
* relações;
* contexto para IA.

---

## 116. Status do documento

### Definição

Estado atual de um documento dentro do ciclo documental.

### Status oficiais

* `Planned`;
* `Draft`;
* `Approved`;
* `Deprecated`;
* `Archived`.

---

## 117. Documento relacionado

### Definição

Documento que possui associação temática, conceitual ou operacional com outro documento.

### Campo correspondente

```yaml
related_documents
```

---

## 118. Pré-requisito documental

### Definição

Documento que deve ser compreendido antes de outro.

### Campo correspondente

```yaml
prerequisites
```

---

# Parte XI — Termos evitados e substituições

## 119. Aplicativo de turismo

### Motivo para evitar

É genérico e não comunica a proposta de decisão, personalização e planejamento.

### Preferir

* guia de viagem personalizável;
* aplicação de planejamento de viagem;
* plataforma de apoio à decisão de viagem.

---

## 120. Lista de pontos turísticos

### Motivo para evitar

Reduz o RouteBook a uma capacidade de catálogo.

### Preferir

* descoberta de lugares;
* recomendações contextualizadas;
* opções de viagem.

---

## 121. Roteiro automático

### Motivo para evitar

Pode transmitir a ideia de que o usuário perde controle ou que o sistema gera um resultado definitivo.

### Preferir

* roteiro sugerido;
* geração de roteiro;
* proposta de roteiro;
* roteiro personalizável.

---

## 122. Melhor lugar

### Motivo para evitar

“Melhor” depende do contexto e pode sugerir verdade absoluta.

### Preferir

* lugar mais adequado;
* opção recomendada;
* melhor opção para este contexto;
* opção com maior relevância.

---

## 123. Distância exata

### Motivo para evitar

Distância pode variar conforme rota, origem e método de cálculo.

### Preferir

* distância estimada;
* distância por rota;
* distância aproximada.

---

## 124. Tempo exato de chegada

### Motivo para evitar

O tempo depende de trânsito, rota, espera e condições externas.

### Preferir

* tempo estimado de deslocamento;
* previsão de chegada;
* duração aproximada.

---

## 125. Inteligência do sistema

### Motivo para evitar

É amplo e pouco verificável.

### Preferir

Nomear a capacidade específica:

* recomendação;
* geração de roteiro;
* personalização;
* replanejamento;
* interpretação de preferências.

---

## 126. Usuário ideal

### Motivo para evitar

Pode restringir desnecessariamente o público.

### Preferir

* público inicial;
* perfil prioritário;
* persona;
* segmento de usuário.

---

# Parte XII — Relações entre conceitos

## 127. Estrutura principal da Viagem

A relação conceitual inicial deverá ser compreendida da seguinte forma:

```text
Usuário
└── organiza uma Viagem
    ├── possui um Destino
    ├── possui um Período
    ├── possui uma Hospedagem
    ├── possui Viajantes
    ├── possui Preferências
    ├── possui Restrições
    ├── possui um Orçamento
    ├── possui Lugares salvos
    └── possui um Roteiro
        └── possui Dias da Viagem
            └── possuem Atividades planejadas
```

Essa representação é conceitual e não define ainda o modelo técnico de dados.

---

## 128. Relação entre Lugar, Experiência e Atividade

```text
Lugar
└── pode oferecer uma ou mais Experiências

Experiência
└── pode ocorrer em um Lugar

Atividade planejada
└── representa algo incluído no Roteiro
    ├── visita a um Lugar
    ├── realização de uma Experiência
    ├── refeição
    ├── deslocamento
    └── período livre
```

---

## 129. Relação entre descoberta e roteiro

```text
Descobrir Lugar
→ consultar Detalhes
→ salvar Lugar
→ adicionar ao Roteiro
→ organizar Atividade
→ visualizar no Mapa
→ realizar ou replanejar
```

O usuário não precisa seguir todas as etapas.

Um Lugar poderá ser adicionado diretamente ao Roteiro sem ser salvo anteriormente.

---

## 130. Relação entre contexto e recomendação

```text
Contexto da Viagem
+ dados do Lugar
+ critérios de recomendação
= Recomendação contextualizada
```

Essa relação não representa uma fórmula técnica definitiva.

Ela descreve o princípio conceitual da recomendação.

---

# Parte XIII — Governança do glossário

## 131. Inclusão de novos termos

Um novo termo deverá ser incluído quando:

* representar conceito relevante;
* aparecer em mais de um documento;
* possuir risco de interpretação ambígua;
* afetar produto, domínio ou arquitetura;
* precisar ser compreendido por agentes de IA;
* possuir diferença importante em relação a termos existentes.

---

## 132. Alteração de definições

Uma definição deverá ser revisada quando:

* estiver ambígua;
* entrar em conflito com outro documento;
* o domínio evoluir;
* o termo passar a representar responsabilidade diferente;
* novos casos revelarem limites não documentados.

Alterações significativas poderão impactar vários documentos e deverão ser revisadas transversalmente.

---

## 133. Descontinuação de termos

Um termo não deverá ser removido imediatamente quando deixar de ser utilizado.

Ele deverá ser marcado como:

* descontinuado;
* substituído por outro termo;
* mantido apenas para compatibilidade histórica.

---

## 134. Responsabilidade de manutenção

A manutenção deste glossário pertence à área de Produto, com contribuição das áreas de:

* experiência;
* domínio;
* inteligência;
* arquitetura;
* engenharia;
* qualidade.

Termos técnicos específicos poderão ser detalhados em documentos próprios, mas não deverão contradizer este glossário.

---

## 135. Checklist terminológico

Antes de aprovar um novo documento, verificar:

* os conceitos utilizam os termos oficiais;
* não existem sinônimos ambíguos;
* fornecedores não substituem conceitos do produto;
* termos técnicos estão explicados;
* novos conceitos foram adicionados ao glossário;
* o texto é compreensível para humanos e agentes de IA;
* o uso de maiúsculas e nomes oficiais está consistente;
* RouteBook está escrito corretamente.

---

## 136. Declaração final

O glossário estabelece a linguagem oficial do RouteBook.

A consistência terminológica é essencial para evitar:

* requisitos contraditórios;
* modelos duplicados;
* interpretações divergentes;
* implementações incompatíveis;
* respostas incorretas de agentes de IA.

Todos os documentos futuros deverão utilizar este vocabulário como referência.

A linguagem poderá evoluir junto com o produto, mas cada alteração deverá preservar clareza, coerência e rastreabilidade.
