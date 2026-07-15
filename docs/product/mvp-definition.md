---

id: RB-PRD-002

title: Definição do MVP
description: Define o Produto Mínimo Viável do RouteBook, incluindo objetivos de validação, público inicial, escopo funcional, limites, critérios de sucesso e condições de conclusão.

document_type: product
owner: Product

status: Draft
version: "0.1.0"

created: "2026-07-15"
last_updated: null

authors:

- RouteBook Team

tags:

- product
- mvp
- validation
- travel-planning
- itinerary
- maps

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-001

prerequisites:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-001

next_documents:

- RB-PRD-003
- RB-PRD-004
- RB-PRD-005
- RB-UX-001
- RB-DOM-001

ai_context:
priority: high
index: true
---

# RouteBook — Definição do MVP

## 1. Propósito deste documento

Este documento define o Produto Mínimo Viável do RouteBook.

Seu objetivo é estabelecer:

* qual problema será validado primeiro;
* para qual público o MVP será criado;
* quais hipóteses precisam ser testadas;
* quais capacidades são obrigatórias;
* quais funcionalidades podem ser simplificadas;
* quais itens ficam fora da primeira versão;
* quais critérios determinam o sucesso;
* quais condições indicam que o MVP está concluído.

O MVP não representa a versão final do RouteBook.

Ele representa o menor conjunto de capacidades capaz de demonstrar que o produto consegue transformar contexto, lugares, localização e preferências em um planejamento de viagem útil.

Este documento deverá orientar:

* priorização;
* design;
* arquitetura;
* desenvolvimento;
* testes;
* validação;
* controle de escopo.

---

## 2. Definição do MVP

O MVP do RouteBook será uma aplicação web responsiva que permitirá ao usuário:

1. criar uma Viagem;
2. informar Destino, Período e Hospedagem;
3. definir Preferências básicas;
4. descobrir Lugares relevantes;
5. visualizar Lugares em lista e mapa;
6. consultar distância e tempo estimado de deslocamento;
7. salvar Lugares;
8. adicionar Lugares a um Roteiro;
9. organizar atividades por Dia da Viagem;
10. editar manualmente o planejamento;
11. receber uma proposta inicial de organização;
12. compreender justificativas simples para recomendações.

O MVP deverá validar a proposta central do RouteBook sem depender de funcionalidades avançadas, colaboração, reservas, pagamentos ou automações complexas.

---

## 3. Problema principal a validar

O MVP deverá validar se o RouteBook consegue reduzir o esforço necessário para transformar informações dispersas em um roteiro de viagem compreensível e personalizável.

O problema poderá ser resumido da seguinte forma:

> Viajantes encontram muitos Lugares e informações sobre um Destino, mas possuem dificuldade para compreender quais opções são relevantes, onde estão localizadas e como distribuí-las de maneira viável durante a Viagem.

O MVP deverá demonstrar que o produto consegue apoiar essa transformação.

---

## 4. Proposta de valor do MVP

A proposta de valor da primeira versão será:

> Permitir que uma pessoa planeje uma viagem de lazer visualizando Lugares no mapa, entendendo distâncias e organizando atividades em um Roteiro editável.

O MVP não precisará entregar toda a visão futura.

Ele deverá provar que a combinação entre:

* contexto da Viagem;
* descoberta;
* mapa;
* distâncias;
* seleção;
* organização diária;
* personalização básica;

gera valor suficiente para justificar a evolução do produto.

---

## 5. Cenário inicial de validação

A primeira validação será realizada com uma viagem real entre **22 e 29 de julho de 2026**.

O cenário inicial deverá considerar:

* um Destino principal;
* uma Hospedagem principal;
* um grupo pequeno de Viajantes;
* interesse em praias;
* interesse em restaurantes;
* interesse em bares e vida noturna;
* busca por custo-benefício;
* necessidade de visualizar distâncias;
* necessidade de distribuir atividades pelos dias.

Esse cenário servirá como referência prática, mas não deverá produzir regras fixas exclusivas para um Destino específico.

---

## 6. Público do MVP

O MVP será orientado principalmente para:

* uma pessoa responsável pelo planejamento;
* viagens de lazer;
* viagens com um Destino principal;
* viagens com datas definidas;
* viagens com uma Hospedagem principal;
* grupos pequenos;
* usuários com acesso a navegador;
* usuários que desejam combinar exploração e planejamento.

O MVP deverá funcionar para:

* viajante individual;
* casal;
* família;
* grupo de amigos.

No entanto, a edição colaborativa entre vários usuários não será obrigatória.

---

## 7. Organizador principal

No MVP, uma Viagem deverá possuir um Organizador principal.

Esse Organizador será responsável por:

* criar a Viagem;
* informar o contexto;
* selecionar Preferências;
* explorar Lugares;
* salvar opções;
* montar o Roteiro;
* realizar alterações.

Os demais Viajantes poderão ser representados como informações do grupo, sem necessidade de contas individuais.

---

## 8. Hipóteses do MVP

O MVP deverá validar as seguintes hipóteses.

### H1 — Contexto mínimo gera valor inicial

Destino, Período e Hospedagem são suficientes para apresentar uma primeira experiência útil.

### H2 — O mapa melhora a compreensão

Visualizar Lugares geograficamente ajuda o usuário a entender proximidade, concentração e viabilidade.

### H3 — Distância influencia decisões

A distância da Hospedagem e entre atividades altera a percepção de relevância de um Lugar.

### H4 — Lugares salvos ajudam a organizar opções

Separar interesse de compromisso facilita a construção do Roteiro.

### H5 — Um Roteiro editável possui valor superior a um roteiro fixo

O usuário deseja modificar horários, atividades e sequência.

### H6 — Personalização básica melhora a relevância

Interesses, orçamento e transporte ajudam a priorizar opções mais adequadas.

### H7 — Justificativas aumentam confiança

Explicações simples ajudam o usuário a compreender por que uma opção foi recomendada.

### H8 — Lista e mapa precisam estar integrados

O usuário precisa alternar entre compreensão descritiva e geográfica.

### H9 — O usuário aceita uma proposta inicial quando mantém controle

Uma organização sugerida é útil desde que possa ser editada.

### H10 — O MVP entrega valor sem reservas e pagamentos

A proposta central pode ser validada apenas com descoberta, mapa e Roteiro.

---

## 9. Objetivos do MVP

O MVP deverá permitir validar se o usuário consegue:

* iniciar o planejamento sem dificuldade;
* compreender a estrutura da Viagem;
* encontrar Lugares relevantes;
* identificar onde cada Lugar está;
* consultar distância da Hospedagem;
* salvar opções;
* montar um Roteiro;
* reorganizar atividades;
* visualizar o planejamento por dia;
* perceber valor na integração entre lista, mapa e Roteiro.

---

## 10. Resultados esperados

Ao concluir o fluxo principal, o usuário deverá possuir:

* uma Viagem cadastrada;
* um contexto básico definido;
* uma lista de Lugares relevantes;
* uma visão geográfica do Destino;
* Lugares salvos;
* atividades distribuídas pelos dias;
* um Roteiro editável;
* estimativas de deslocamento;
* justificativas simples para algumas sugestões.

O resultado esperado não é um roteiro perfeito.

O resultado esperado é um planejamento compreensível, utilizável e modificável.

---

# Parte I — Escopo funcional obrigatório

## 11. Criação de Viagem

O usuário deverá conseguir criar uma Viagem informando:

* nome da Viagem;
* Destino;
* data de início;
* data de término;
* Hospedagem;
* quantidade de Viajantes.

### Requisitos mínimos

* Destino obrigatório;
* data de início obrigatória;
* data de término obrigatória;
* data de término igual ou posterior à data de início;
* Hospedagem ou localização de referência obrigatória;
* pelo menos um Viajante.

---

## 12. Cadastro da Hospedagem

O usuário deverá conseguir localizar e selecionar uma Hospedagem.

A Hospedagem deverá possuir, no mínimo:

* nome ou identificação;
* endereço;
* localização geográfica;
* latitude;
* longitude.

A Hospedagem será utilizada como referência para:

* iniciar o Mapa da Viagem;
* calcular distâncias;
* apresentar Lugares próximos;
* estimar deslocamentos;
* organizar o início e o fim dos dias.

---

## 13. Configuração de Preferências

O usuário deverá conseguir informar Preferências básicas.

As categorias iniciais deverão incluir:

* praias;
* restaurantes;
* bares;
* vida noturna;
* natureza;
* cultura;
* passeios;
* descanso;
* opções econômicas.

O usuário poderá selecionar mais de uma categoria.

---

## 14. Configuração de orçamento

O usuário deverá conseguir informar uma referência de orçamento.

O MVP poderá utilizar uma das seguintes formas:

* econômico;
* moderado;
* elevado;
* sem preferência.

Alternativamente, poderá permitir uma faixa aproximada por dia.

O produto não deverá exigir controle financeiro detalhado.

---

## 15. Configuração do Meio de transporte

O usuário deverá conseguir informar o Meio de transporte predominante.

Opções iniciais:

* carro;
* transporte por aplicativo;
* caminhada;
* transporte público;
* combinação de meios.

Essa informação deverá influenciar estimativas de deslocamento quando possível.

---

## 16. Configuração do Ritmo da Viagem

O usuário deverá conseguir selecionar:

* tranquilo;
* equilibrado;
* intenso.

O Ritmo da Viagem deverá influenciar:

* quantidade sugerida de atividades;
* duração de Períodos livres;
* margens entre atividades;
* intensidade do Roteiro.

No MVP, essa influência poderá ser baseada em regras simples.

---

## 17. Exploração de Lugares

O usuário deverá conseguir visualizar Lugares relevantes para o Destino.

Os resultados deverão poder ser apresentados por:

* lista;
* mapa.

O usuário deverá conseguir:

* visualizar resumo;
* abrir detalhes;
* localizar no mapa;
* salvar;
* adicionar ao Roteiro.

---

## 18. Categorias de Lugar do MVP

O MVP deverá priorizar:

* Praia;
* Restaurante;
* Bar;
* Vida noturna;
* Atração;
* Passeio.

Categorias adicionais poderão existir quando estiverem disponíveis, mas não são obrigatórias para concluir o MVP.

---

## 19. Pesquisa

O usuário deverá conseguir pesquisar Lugares pelo nome ou termo.

A pesquisa poderá considerar:

* nome;
* categoria;
* região;
* endereço.

Pesquisa semântica avançada não será obrigatória no MVP.

---

## 20. Filtros

O MVP deverá oferecer filtros básicos.

Filtros obrigatórios:

* categoria;
* distância;
* faixa de preço.

Filtros desejáveis:

* avaliação;
* aberto no momento;
* adequado ao perfil do grupo;
* Lugar salvo;
* Lugar adicionado ao Roteiro.

Filtros avançados poderão ficar para fases posteriores.

---

## 21. Cartão de Lugar

Cada resultado deverá ser apresentado por meio de um Cartão de Lugar.

O cartão deverá conter, conforme disponibilidade:

* fotografia;
* nome;
* categoria;
* avaliação;
* distância da Hospedagem;
* faixa de preço;
* justificativa resumida;
* ação para salvar;
* ação para visualizar detalhes;
* ação para adicionar ao Roteiro.

---

## 22. Detalhes do Lugar

A página ou painel de detalhes deverá apresentar, conforme disponibilidade:

* nome;
* categoria;
* fotografias;
* descrição resumida;
* endereço;
* localização;
* avaliação;
* faixa de preço;
* horário de funcionamento;
* distância da Hospedagem;
* Tempo de deslocamento;
* duração sugerida;
* Justificativa da recomendação.

Ações obrigatórias:

* salvar ou remover dos salvos;
* adicionar ao Roteiro;
* visualizar no mapa;
* abrir rota em serviço externo.

---

## 23. Mapa da Viagem

O MVP deverá possuir um Mapa da Viagem interativo.

O mapa deverá exibir:

* Hospedagem;
* Lugares encontrados;
* Lugares salvos;
* Atividades planejadas.

O mapa deverá permitir:

* selecionar Marcador;
* abrir resumo do Lugar;
* identificar categoria;
* centralizar um Lugar;
* visualizar Hospedagem;
* diferenciar estados por representação visual.

---

## 24. Integração entre lista e mapa

Lista e mapa deverão representar o mesmo conjunto de dados.

Quando o usuário selecionar um Lugar na lista:

* o Marcador correspondente deverá ser destacado;
* o mapa deverá centralizar ou evidenciar o ponto, quando necessário.

Quando o usuário selecionar um Marcador:

* o resumo ou Cartão correspondente deverá ser apresentado.

---

## 25. Distância da Hospedagem

Cada Lugar deverá apresentar, quando possível:

* distância estimada da Hospedagem;
* Tempo de deslocamento estimado;
* Meio de transporte considerado.

O produto deverá deixar claro que os valores são estimativas.

---

## 26. Lugares salvos

O usuário deverá conseguir:

* salvar um Lugar;
* remover um Lugar dos salvos;
* consultar todos os Lugares salvos;
* visualizar Lugares salvos no mapa;
* adicionar um Lugar salvo ao Roteiro.

Salvar um Lugar não deverá adicioná-lo automaticamente ao Roteiro.

---

## 27. Criação do Roteiro

Ao criar uma Viagem, o sistema deverá gerar os Dias da Viagem com base no Período informado.

Cada Dia da Viagem deverá permitir:

* adicionar Atividade;
* remover Atividade;
* alterar ordem;
* definir Horário planejado;
* definir Duração estimada;
* incluir Período livre.

---

## 28. Adição de Lugar ao Roteiro

O usuário deverá conseguir adicionar um Lugar:

* diretamente da Exploração;
* a partir dos Detalhes do Lugar;
* a partir dos Lugares salvos.

Ao adicionar, deverá selecionar:

* Dia da Viagem;
* Horário planejado, quando desejado;
* duração aproximada, quando desejado.

---

## 29. Reordenação de Atividades

O usuário deverá conseguir alterar a ordem das Atividades de um mesmo dia.

A implementação poderá utilizar:

* arrastar e soltar;
* controles de mover;
* seleção de posição.

A experiência deverá funcionar em dispositivos móveis e desktop.

---

## 30. Movimentação entre dias

O usuário deverá conseguir mover uma Atividade de um Dia da Viagem para outro.

A alteração deverá preservar, quando possível:

* Lugar;
* duração;
* observações.

O horário poderá precisar ser redefinido.

---

## 31. Remoção de Atividade

O usuário deverá conseguir remover uma Atividade do Roteiro.

A remoção não deverá eliminar automaticamente o Lugar dos salvos.

---

## 32. Períodos livres

O usuário deverá conseguir manter ou adicionar Períodos livres.

O sistema não deverá obrigar o preenchimento de todos os horários.

Períodos livres poderão representar:

* descanso;
* margem de deslocamento;
* tempo não planejado;
* espaço para decisões futuras.

---

## 33. Visualização diária

O Roteiro deverá ser apresentado por Dia da Viagem.

Cada dia deverá mostrar:

* data;
* Atividades;
* horários;
* durações;
* Deslocamentos estimados;
* Períodos livres;
* possíveis alertas.

---

## 34. Visualização geográfica do dia

O usuário deverá conseguir visualizar no mapa as Atividades de um Dia da Viagem.

O mapa poderá apresentar:

* sequência dos Lugares;
* Hospedagem;
* Marcadores do dia;
* rota aproximada;
* distâncias entre pontos.

O cálculo otimizado de rota completa não será obrigatório no MVP.

---

## 35. Proposta inicial de Roteiro

O RouteBook deverá conseguir apresentar uma proposta inicial de organização.

Essa proposta poderá utilizar:

* Lugares salvos;
* Lugares selecionados;
* Dias disponíveis;
* distância;
* categoria;
* duração;
* Ritmo da Viagem.

A geração poderá ser simples e baseada em regras.

O usuário deverá poder:

* aceitar;
* editar;
* descartar;
* gerar novamente.

---

## 36. Agrupamento por proximidade

A proposta de Roteiro deverá tentar agrupar Lugares próximos no mesmo dia.

No MVP, a regra poderá considerar:

* distância geográfica;
* mesma Região;
* limite simples de deslocamento.

Não será necessária otimização matemática completa.

---

## 37. Distribuição básica de categorias

A proposta inicial deverá evitar, quando possível:

* excesso de atividades semelhantes no mesmo dia;
* ausência de períodos para refeição;
* quantidade incompatível com o Ritmo da Viagem;
* concentração de todas as atividades em poucos dias.

---

## 38. Justificativas simples

O MVP deverá apresentar justificativas para recomendações relevantes.

Exemplos:

> Próximo da Hospedagem e compatível com sua preferência por praias.

> Opção de preço moderado próxima às atividades planejadas para este dia.

> Lugar bem avaliado localizado na mesma Região de outras atividades salvas.

As justificativas poderão ser geradas por regras ou modelos de linguagem, desde que sejam baseadas em dados conhecidos.

---

## 39. Alertas básicos de planejamento

O MVP deverá identificar situações simples, como:

* duas Atividades com horários sobrepostos;
* atividade fora do Período da Viagem;
* data inválida;
* Dia da Viagem com quantidade elevada de atividades;
* Tempo de deslocamento incompatível com o intervalo disponível;
* informação de horário indisponível.

Os alertas deverão orientar, não bloquear automaticamente todas as decisões.

---

## 40. Abertura de rota externa

O usuário deverá conseguir abrir uma rota em um serviço externo de mapas.

A rota poderá considerar:

* Hospedagem até o Lugar;
* localização atual até o Lugar;
* uma Atividade até a próxima.

O RouteBook não deverá oferecer navegação curva a curva no MVP.

---

## 41. Persistência da Viagem

A Viagem deverá permanecer disponível após o usuário sair da aplicação.

Deverão ser persistidos:

* informações da Viagem;
* Preferências;
* Hospedagem;
* Lugares salvos;
* Roteiro;
* alterações realizadas.

A estratégia de autenticação e armazenamento será definida tecnicamente.

---

# Parte II — Experiência mínima

## 42. Fluxo principal

O fluxo principal do MVP será:

```text
Acessar o RouteBook
→ criar Viagem
→ informar Destino, datas e Hospedagem
→ selecionar Preferências
→ visualizar Lugares
→ explorar lista e mapa
→ salvar opções
→ adicionar ao Roteiro
→ organizar os dias
→ revisar distâncias
→ consultar o planejamento
```

---

## 43. Primeiro valor

O usuário deverá perceber valor antes de concluir toda a configuração.

Após informar:

* Destino;
* Período;
* Hospedagem;

o sistema já deverá conseguir apresentar:

* mapa;
* Lugares iniciais;
* distâncias básicas;
* estrutura dos Dias da Viagem.

---

## 44. Onboarding mínimo

O onboarding deverá solicitar apenas informações necessárias para iniciar.

Etapas recomendadas:

1. Destino e datas.
2. Hospedagem.
3. Preferências opcionais.
4. Orçamento opcional.
5. Transporte opcional.
6. Ritmo opcional.

O usuário poderá revisar essas informações posteriormente.

---

## 45. Navegação principal

O MVP deverá possuir acesso claro às seguintes áreas:

* Minha Viagem;
* Explorar;
* Mapa;
* Roteiro;
* Salvos.

Em dispositivos móveis, a navegação deverá priorizar acesso rápido a essas áreas.

---

## 46. Responsividade

O MVP deverá funcionar em:

* celular;
* tablet;
* notebook;
* desktop.

O produto deverá ser utilizável durante a Viagem em dispositivos móveis.

---

## 47. Acessibilidade mínima

O MVP deverá possuir:

* navegação básica por teclado;
* foco visível;
* contraste adequado;
* rótulos acessíveis;
* textos alternativos para imagens relevantes;
* ações não dependentes apenas de cor;
* alternativa em lista para informações do mapa;
* mensagens de erro compreensíveis.

---

## 48. Estados de interface

O MVP deverá tratar:

* Estado vazio;
* Estado de carregamento;
* Estado de erro;
* ausência de resultados;
* ausência de dados externos;
* falha no mapa;
* falha no cálculo de distância;
* Viagem sem Roteiro;
* Dia sem Atividades.

---

# Parte III — Dados mínimos

## 49. Dados da Viagem

Campos mínimos:

* identificador;
* nome;
* Destino;
* data de início;
* data de término;
* Hospedagem;
* quantidade de Viajantes;
* Preferências;
* orçamento;
* transporte;
* ritmo.

---

## 50. Dados do Lugar

Campos mínimos:

* identificador interno;
* identificador externo, quando aplicável;
* nome;
* categoria;
* endereço;
* latitude;
* longitude;
* fotografia principal, quando disponível;
* avaliação, quando disponível;
* faixa de preço, quando disponível;
* horário, quando disponível;
* fonte dos dados.

---

## 51. Dados do Roteiro

Campos mínimos:

* Dia da Viagem;
* Atividades;
* ordem;
* Horário planejado;
* Duração estimada;
* Lugar associado, quando aplicável;
* observações;
* Períodos livres.

---

## 52. Dados de distância

Campos mínimos:

* origem;
* destino;
* distância;
* duração estimada;
* Meio de transporte;
* provedor;
* momento da consulta.

---

## 53. Dados estimados

Dados estimados deverão ser identificados como aproximações.

Exemplos:

* tempo de deslocamento;
* duração sugerida;
* faixa de preço;
* custo-benefício;
* horário provável de chegada.

---

# Parte IV — Simplificações aceitas

## 54. Um Organizador por Viagem

O MVP poderá considerar apenas um Organizador com permissão de edição.

---

## 55. Um Destino principal

O MVP poderá limitar cada Viagem a um Destino ou Região principal.

---

## 56. Uma Hospedagem principal

O MVP poderá considerar apenas uma Hospedagem como referência.

---

## 57. Um idioma

O MVP poderá ser disponibilizado inicialmente apenas em português do Brasil.

---

## 58. Uma moeda principal

O MVP poderá utilizar uma moeda principal por Viagem.

Na primeira validação, poderá utilizar Real brasileiro.

---

## 59. Um provedor de mapas

O MVP poderá utilizar apenas um provedor de mapas.

A arquitetura deverá manter a responsabilidade encapsulada, sem exigir múltiplos provedores desde o início.

---

## 60. Recomendações baseadas em regras

O MVP poderá utilizar regras simples para:

* proximidade;
* categoria;
* orçamento;
* ritmo;
* agrupamento;
* justificativas.

Não será obrigatória uma plataforma avançada de aprendizado de máquina.

---

## 61. Replanejamento manual

O replanejamento automático completo não será obrigatório.

O usuário deverá conseguir alterar manualmente:

* dias;
* horários;
* Atividades;
* ordem.

---

## 62. Dados incompletos

O MVP poderá operar mesmo quando algumas informações externas não estiverem disponíveis.

A interface deverá informar a ausência do dado sem impedir toda a experiência.

---

# Parte V — Fora do MVP

## 63. Colaboração em tempo real

Não será obrigatório:

* edição simultânea;
* comentários;
* votação;
* convites;
* preferências individuais por conta.

---

## 64. Reservas e pagamentos

Não farão parte do MVP:

* reserva de Hospedagem;
* reserva de restaurante;
* compra de ingresso;
* venda de passeio;
* compra de passagem;
* processamento de pagamento.

---

## 65. Gestão financeira completa

Não farão parte do MVP:

* registro de gastos realizados;
* divisão de despesas;
* controle de cartões;
* conciliação financeira;
* prestação de contas.

---

## 66. Navegação própria

O RouteBook não oferecerá:

* orientação curva a curva;
* navegação por voz;
* trânsito em tempo real próprio;
* funcionamento como GPS.

---

## 67. Uso offline

O MVP não precisará funcionar integralmente sem conexão.

---

## 68. Clima e replanejamento climático

Não serão obrigatórios:

* previsão do tempo;
* alertas climáticos;
* substituição automática por chuva;
* recomendações meteorológicas.

---

## 69. Notificações

Não serão obrigatórios:

* lembrete de saída;
* alerta de próxima Atividade;
* push notification;
* aviso de mudança de horário.

---

## 70. Múltiplos destinos

O MVP não precisará organizar:

* circuitos entre cidades;
* múltiplas Hospedagens;
* troca de Destino;
* viagens rodoviárias complexas.

---

## 71. Conteúdo social

Não farão parte do MVP:

* feed;
* seguidores;
* avaliações próprias;
* comentários públicos;
* publicação de Roteiros;
* perfis públicos.

---

## 72. Inteligência avançada

Não serão obrigatórios:

* aprendizado contínuo de Preferências;
* modelos próprios;
* previsão de comportamento;
* otimização matemática completa;
* agente autônomo de viagem;
* recomendações em tempo real.

---

## 73. Painel administrativo completo

O MVP não exigirá uma plataforma administrativa avançada.

Ferramentas mínimas de manutenção poderão ser utilizadas tecnicamente, sem constituir produto separado.

---

# Parte VI — Critérios de sucesso

## 74. Sucesso funcional

O MVP será funcionalmente bem-sucedido quando um usuário conseguir:

* criar uma Viagem;
* cadastrar Hospedagem;
* informar Preferências;
* encontrar Lugares;
* visualizar mapa;
* entender distância;
* salvar opções;
* montar Roteiro;
* editar Atividades;
* consultar o planejamento posteriormente.

---

## 75. Sucesso de experiência

A experiência será considerada adequada quando:

* o usuário compreender o fluxo principal;
* a navegação for clara;
* o mapa for útil;
* a relação entre lista, mapa e Roteiro for compreensível;
* o usuário conseguir realizar alterações sem ajuda externa;
* a aplicação funcionar adequadamente em celular.

---

## 76. Sucesso de valor

O MVP demonstrará valor quando o usuário perceber que o RouteBook:

* reduz o esforço de pesquisa;
* melhora a compreensão geográfica;
* facilita a seleção de Lugares;
* ajuda a distribuir Atividades;
* reduz deslocamentos desnecessários;
* mantém o planejamento modificável.

---

## 77. Indicadores quantitativos iniciais

Possíveis indicadores:

* percentual de usuários que concluem a criação da Viagem;
* tempo até a primeira lista de Lugares;
* quantidade de Lugares visualizados;
* quantidade de Lugares salvos;
* quantidade de Atividades adicionadas;
* percentual de Viagens com Roteiro;
* quantidade de alterações no Roteiro;
* uso do mapa;
* retorno posterior à Viagem criada.

Metas numéricas serão definidas após os primeiros testes.

---

## 78. Indicadores qualitativos iniciais

Perguntas de validação:

* O usuário entendeu o propósito do RouteBook?
* O mapa ajudou na decisão?
* As distâncias influenciaram escolhas?
* O usuário confiou nas Recomendações?
* As Justificativas foram úteis?
* O Roteiro pareceu realista?
* O usuário conseguiu personalizar?
* O que ainda precisou ser feito fora do RouteBook?
* Qual funcionalidade gerou mais valor?
* Qual parte criou maior confusão?

---

## 79. Critério de primeiro valor

O primeiro valor será atingido quando o usuário conseguir visualizar Lugares relevantes em relação à sua Hospedagem.

Esse momento deverá acontecer antes da montagem completa do Roteiro.

---

## 80. Critério de valor principal

O valor principal será atingido quando o usuário transformar Lugares selecionados em um Roteiro diário editável.

---

## 81. Critério de retenção de uso

Um sinal positivo será o usuário retornar ao RouteBook para:

* revisar a Viagem;
* consultar o Roteiro;
* fazer alterações;
* utilizar durante a execução.

---

# Parte VII — Critérios de conclusão

## 82. Critérios obrigatórios de conclusão

O MVP somente poderá ser considerado concluído quando:

1. O fluxo principal estiver implementado.
2. A Viagem puder ser persistida.
3. A Hospedagem funcionar como referência geográfica.
4. Lugares puderem ser visualizados em lista e mapa.
5. Distâncias puderem ser consultadas.
6. Lugares puderem ser salvos.
7. Lugares puderem ser adicionados ao Roteiro.
8. Atividades puderem ser reorganizadas.
9. O Roteiro puder ser consultado por dia.
10. A experiência funcionar em celular.
11. Estados principais de erro estiverem tratados.
12. Critérios básicos de acessibilidade forem atendidos.
13. O fluxo for validado com uma Viagem real.
14. Problemas críticos conhecidos estiverem documentados.
15. A documentação relevante estiver atualizada.

---

## 83. Critérios não obrigatórios

O MVP poderá ser concluído sem:

* colaboração;
* reservas;
* pagamentos;
* clima;
* notificações;
* uso offline;
* replanejamento automático;
* múltiplos Destinos;
* controle financeiro;
* inteligência avançada.

---

## 84. Definição de pronto funcional

Uma funcionalidade do MVP será considerada pronta quando:

* comportamento estiver documentado;
* critérios de aceitação estiverem definidos;
* implementação estiver concluída;
* testes relevantes estiverem executados;
* estados de erro estiverem tratados;
* experiência responsiva estiver validada;
* acessibilidade aplicável estiver verificada;
* documentação estiver atualizada.

---

## 85. Definição de pronto do MVP

O MVP estará pronto para validação quando:

* capacidades obrigatórias estiverem integradas;
* jornada principal puder ser concluída;
* dados persistirem;
* mapa e Roteiro estiverem sincronizados;
* não existirem bloqueios críticos;
* uma Viagem real puder ser planejada;
* feedback puder ser coletado.

---

# Parte VIII — Riscos

## 86. Cobertura de dados

Pode haver Destinos com informações incompletas.

### Mitigação

* informar indisponibilidade;
* trabalhar com fontes conhecidas;
* permitir dados parciais;
* priorizar Destinos com boa cobertura.

---

## 87. Custo de provedores

Mapas, rotas e Lugares podem gerar custos.

### Mitigação

* limitar consultas;
* utilizar cache;
* monitorar consumo;
* avaliar alternativas;
* manter abstração do provedor.

---

## 88. Complexidade do mapa

O mapa pode sobrecarregar a experiência.

### Mitigação

* filtros simples;
* agrupamento de Marcadores;
* sincronização com lista;
* informação progressiva;
* alternativa textual.

---

## 89. Roteiro irrealista

Regras simples podem criar organizações inadequadas.

### Mitigação

* apresentar como sugestão;
* permitir edição;
* mostrar distâncias;
* incluir margens;
* coletar feedback.

---

## 90. Dados desatualizados

Horários, preços e avaliações podem mudar.

### Mitigação

* exibir fonte;
* exibir data quando relevante;
* identificar estimativas;
* permitir abertura da fonte externa.

---

## 91. Escopo excessivo

O produto pode tentar incorporar reservas, finanças e colaboração prematuramente.

### Mitigação

* utilizar este documento como limite;
* exigir justificativa para inclusão;
* priorizar hipóteses centrais;
* revisar impacto no cronograma.

---

## 92. Dependência de inteligência artificial

A IA pode gerar informações incorretas ou justificativas inconsistentes.

### Mitigação

* utilizar dados estruturados;
* combinar regras determinísticas;
* limitar geração;
* não inventar informações;
* revisar saídas críticas.

---

## 93. Ausência de validação real

O produto pode ser construído com base apenas em suposições.

### Mitigação

* utilizar a viagem real;
* registrar feedback;
* observar uso;
* medir dificuldades;
* revisar documentos.

---

# Parte IX — Estratégia de validação

## 94. Validação interna

A primeira validação deverá utilizar o cenário real que originou o RouteBook.

Deverão ser avaliados:

* criação da Viagem;
* descoberta de praias;
* restaurantes;
* bares;
* vida noturna;
* custo-benefício;
* distâncias;
* montagem dos dias;
* facilidade de alteração.

---

## 95. Teste de planejamento

O usuário deverá tentar criar um Roteiro completo utilizando apenas o RouteBook.

Deverá ser observado:

* onde o produto foi suficiente;
* onde fontes externas foram necessárias;
* quais dados faltaram;
* quais etapas foram confusas;
* quais decisões permaneceram manuais.

---

## 96. Teste de mapa

O teste deverá verificar:

* clareza dos Marcadores;
* localização da Hospedagem;
* compreensão de proximidade;
* utilidade da seleção;
* integração com a lista;
* uso em celular.

---

## 97. Teste de Roteiro

O teste deverá verificar:

* adição de Atividades;
* mudança de dias;
* reordenação;
* horários;
* visualização de deslocamentos;
* compreensão do dia;
* identificação de conflitos.

---

## 98. Teste durante a Viagem

Quando possível, o produto deverá ser utilizado durante a execução real.

Deverão ser avaliados:

* consulta rápida;
* clareza da próxima Atividade;
* acesso à rota;
* uso em celular;
* necessidade de alteração;
* utilidade dos dados;
* diferença entre planejamento e realidade.

---

## 99. Registro de aprendizado

Os aprendizados deverão ser registrados em documentação própria ou issues.

Cada descoberta deverá indicar:

* problema observado;
* contexto;
* impacto;
* evidência;
* possível alteração;
* documentos afetados;
* prioridade.

---

# Parte X — Governança do MVP

## 100. Inclusão de nova funcionalidade

Uma funcionalidade somente deverá entrar no MVP quando:

1. Resolver uma hipótese central.
2. For necessária para concluir o fluxo principal.
3. Não possuir alternativa mais simples.
4. Entregar valor direto.
5. Possuir custo proporcional.
6. Poder ser validada.
7. Não ampliar excessivamente o escopo.

---

## 101. Remoção de funcionalidade

Uma funcionalidade poderá ser removida quando:

* não for necessária para validar a proposta;
* possuir dependência excessiva;
* aumentar risco sem aprendizado equivalente;
* puder ser substituída por solução manual;
* não impactar o fluxo principal.

---

## 102. Mudança de escopo

Mudanças relevantes deverão atualizar:

* este documento;
* Registro de Documentos;
* requisitos relacionados;
* roadmap;
* arquitetura afetada;
* critérios de teste.

---

## 103. Priorização

A prioridade deverá seguir:

1. criação da Viagem;
2. localização e Hospedagem;
3. descoberta de Lugares;
4. Mapa;
5. distâncias;
6. Lugares salvos;
7. Roteiro;
8. edição;
9. Recomendações;
10. Justificativas;
11. refinamentos visuais;
12. capacidades não essenciais.

---

## 104. Dependências documentais

Este documento deverá orientar:

* Personas;
* Jornadas do Usuário;
* Casos de uso;
* Requisitos funcionais;
* Regras de negócio;
* Arquitetura da Informação;
* Fluxos;
* Domínio;
* Arquitetura técnica;
* Estratégia de testes.

---

## 105. Critérios de revisão

Este documento deverá ser revisado quando:

* as Personas revelarem novas necessidades essenciais;
* as Jornadas demonstrarem lacunas;
* uma integração inviabilizar capacidade obrigatória;
* a validação real alterar hipóteses;
* o escopo for reduzido ou ampliado;
* os critérios de sucesso forem definidos quantitativamente.

---

## 106. Declaração final

O MVP do RouteBook deverá provar uma ideia simples:

> Um viajante consegue planejar melhor quando Lugares, localização, distâncias, Preferências e Roteiro fazem parte da mesma experiência.

A primeira versão não deverá tentar resolver todo o universo de viagens.

Ela deverá permitir que um usuário:

* compreenda o Destino;
* encontre opções;
* visualize onde estão;
* selecione o que interessa;
* organize os dias;
* altere o planejamento;
* utilize o resultado.

Se o MVP demonstrar esse valor de forma clara, o RouteBook possuirá uma base válida para evoluir.
