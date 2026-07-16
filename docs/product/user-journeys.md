---

id: RB-PRD-004

title: Jornadas do Usuário
description: Define as principais jornadas ponta a ponta do RouteBook, desde a criação da viagem até o uso do roteiro durante a execução.

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
- user-journeys
- travel-planning
- itinerary
- maps
- personalization

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-001
- RB-PRD-002
- RB-PRD-003

prerequisites:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-001
- RB-PRD-002
- RB-PRD-003

next_documents:

- RB-PRD-005
- RB-PRD-006
- RB-UX-001
- RB-UX-002
- RB-DOM-001

ai_context:
priority: high
index: true
---

# RouteBook — Jornadas do Usuário

## 1. Propósito deste documento

Este documento define as principais Jornadas do Usuário do RouteBook.

Seu objetivo é descrever, de ponta a ponta, como diferentes usuários interagem com o produto para alcançar objetivos de viagem.

As jornadas deverão orientar:

* arquitetura da informação;
* navegação;
* fluxos de usuário;
* definição de telas;
* requisitos funcionais;
* regras de negócio;
* critérios de aceitação;
* prioridades do MVP;
* testes de usabilidade;
* testes ponta a ponta;
* decisões de personalização;
* experiência móvel.

As jornadas não representam sequências rígidas.

O usuário poderá entrar, sair, repetir, ignorar ou reorganizar etapas conforme seu contexto.

O RouteBook deverá apoiar diferentes formas de planejamento sem impor um único caminho obrigatório.

---

## 2. Relação entre jornada e fluxo

Uma Jornada do Usuário representa a experiência completa de uma pessoa ao tentar alcançar um objetivo.

Ela inclui:

* contexto;
* motivação;
* ações;
* decisões;
* expectativas;
* dificuldades;
* emoções;
* pontos de contato;
* resultados.

Um Fluxo do Usuário representa uma sequência específica de interações dentro da aplicação.

Uma mesma jornada poderá conter vários fluxos.

Exemplo:

```text
Jornada:
Planejar uma viagem

Fluxos relacionados:
- criar Viagem;
- cadastrar Hospedagem;
- definir Preferências;
- salvar Lugares;
- montar Roteiro.
```

Os fluxos detalhados serão documentados posteriormente na área de experiência.

---

## 3. Princípios aplicados às jornadas

Todas as jornadas deverão preservar os seguintes princípios:

* entregar valor com poucas informações;
* manter o usuário no controle;
* apresentar o mapa como parte estrutural;
* permitir personalização progressiva;
* evitar planejamento rígido;
* explicar recomendações;
* considerar localização e deslocamento;
* funcionar em dispositivos móveis;
* oferecer alternativas acessíveis ao mapa;
* evitar exigir configurações desnecessárias.

---

## 4. Personas relacionadas

As jornadas consideram principalmente as personas:

* Planejador Prático;
* Explorador Flexível;
* Planejador Econômico;
* Organizador de Grupo.

Uma mesma jornada poderá atender mais de uma persona, com diferenças de prioridade e comportamento.

---

# Parte I — Mapa geral das jornadas

## 5. Macrojornada do RouteBook

A experiência completa do RouteBook poderá ser compreendida pelas seguintes fases:

```text
Iniciar
→ configurar
→ descobrir
→ compreender
→ selecionar
→ organizar
→ revisar
→ utilizar
→ adaptar
→ concluir
```

### Iniciar

O usuário conhece o produto e cria uma Viagem.

### Configurar

O usuário informa o contexto mínimo e adiciona Preferências progressivamente.

### Descobrir

O usuário encontra Lugares e Experiências relevantes.

### Compreender

O usuário avalia localização, distância, custo, horário e adequação.

### Selecionar

O usuário salva ou adiciona opções ao Roteiro.

### Organizar

O usuário distribui Atividades pelos Dias da Viagem.

### Revisar

O usuário identifica conflitos, deslocamentos e oportunidades de melhoria.

### Utilizar

O usuário consulta o planejamento antes e durante a Viagem.

### Adaptar

O usuário altera o plano conforme mudanças ou novas decisões.

### Concluir

O usuário encerra ou arquiva a Viagem, preservando informações relevantes.

---

## 6. Jornadas principais

As jornadas prioritárias são:

1. Criar uma Viagem.
2. Configurar o contexto da Viagem.
3. Descobrir Lugares.
4. Avaliar um Lugar.
5. Salvar Lugares.
6. Adicionar um Lugar ao Roteiro.
7. Montar o Roteiro manualmente.
8. Gerar uma proposta de Roteiro.
9. Revisar a viabilidade do Roteiro.
10. Consultar o Roteiro durante a Viagem.
11. Alterar o planejamento.
12. Encontrar uma opção próxima.
13. Planejar com foco em orçamento.
14. Planejar para um grupo.
15. Retomar uma Viagem existente.

---

## 7. Jornadas do MVP

As seguintes jornadas são obrigatórias para o MVP:

* criar uma Viagem;
* configurar contexto básico;
* descobrir Lugares;
* visualizar lista e mapa;
* avaliar Detalhes do Lugar;
* salvar Lugares;
* adicionar ao Roteiro;
* organizar Dias da Viagem;
* editar Atividades;
* consultar o Roteiro;
* abrir rota externa;
* retomar a Viagem.

As demais poderão ser entregues de forma simplificada ou evoluir posteriormente.

---

# Parte II — Jornada 1: Criar uma Viagem

## 8. Objetivo

Permitir que o usuário crie o contexto principal de planejamento.

---

## 9. Persona principal

Planejador Prático.

### Personas relacionadas

* Planejador Econômico;
* Organizador de Grupo;
* Explorador Flexível.

---

## 10. Gatilho

O usuário possui uma viagem futura ou em andamento e deseja começar a organizá-la.

---

## 11. Pré-condições

* O usuário acessou o RouteBook.
* O produto está disponível.
* O usuário conhece pelo menos o Destino e o Período aproximado.

---

## 12. Informações esperadas

O usuário deverá informar:

* nome da Viagem;
* Destino;
* data de início;
* data de término;
* Hospedagem ou localização de referência;
* quantidade de Viajantes.

---

## 13. Etapas principais

1. O usuário inicia a criação de uma Viagem.
2. O produto solicita Destino e Período.
3. O usuário informa as datas.
4. O produto valida o intervalo.
5. O usuário pesquisa ou informa a Hospedagem.
6. O produto identifica a Localização.
7. O usuário informa a quantidade de Viajantes.
8. O produto cria os Dias da Viagem.
9. O produto apresenta a visão inicial.
10. O usuário pode continuar personalizando ou explorar imediatamente.

---

## 14. Resultado esperado

A Viagem é criada com:

* Destino;
* Período;
* Hospedagem;
* Viajantes;
* Dias da Viagem;
* Mapa inicial.

---

## 15. Primeiro valor

O usuário percebe valor quando visualiza:

* Hospedagem no mapa;
* estrutura dos Dias da Viagem;
* Lugares iniciais próximos.

---

## 16. Dificuldades possíveis

* Destino ambíguo;
* Hospedagem ainda não definida;
* endereço não encontrado;
* datas inválidas;
* ausência de geolocalização;
* usuário não sabe quantas pessoas participarão;
* excesso de campos obrigatórios.

---

## 17. Comportamentos esperados do produto

O produto deverá:

* validar datas;
* permitir busca de Destino;
* permitir busca de Hospedagem;
* informar falhas de localização;
* permitir uma referência provisória, quando aplicável;
* evitar exigir Preferências avançadas;
* salvar progresso;
* explicar o próximo passo.

---

## 18. Critérios de sucesso

* A criação pode ser concluída sem ajuda externa.
* O usuário não precisa preencher um formulário longo.
* O Mapa inicial é apresentado.
* A Viagem pode ser retomada depois.
* As datas geram corretamente os Dias da Viagem.

---

# Parte III — Jornada 2: Configurar o contexto da Viagem

## 19. Objetivo

Permitir que o usuário refine o contexto para melhorar recomendações e planejamento.

---

## 20. Persona principal

Planejador Prático.

### Personas relacionadas

* Planejador Econômico;
* Organizador de Grupo;
* Explorador Flexível.

---

## 21. Gatilho

A Viagem foi criada e o usuário deseja receber opções mais adequadas.

---

## 22. Informações configuráveis

* Interesses;
* Preferências;
* Restrições;
* Orçamento;
* Meio de transporte;
* Ritmo da Viagem;
* Perfil do Grupo;
* Lugares obrigatórios;
* períodos indisponíveis.

---

## 23. Etapas principais

1. O usuário acessa as configurações da Viagem.
2. O produto apresenta categorias simples.
3. O usuário seleciona seus Interesses.
4. O usuário informa o orçamento.
5. O usuário escolhe o Meio de transporte.
6. O usuário define o Ritmo da Viagem.
7. O usuário informa características relevantes do grupo.
8. O produto atualiza o Contexto da Viagem.
9. Recomendações e filtros são recalculados.
10. O usuário visualiza o impacto das alterações.

---

## 24. Personalização progressiva

O usuário poderá configurar apenas parte das informações.

A ausência de uma informação deverá ser tratada como:

* não informada;
* sem preferência;
* desconhecida;

e não como uma escolha negativa.

---

## 25. Resultado esperado

O Contexto da Viagem passa a representar melhor:

* quem viaja;
* o que deseja;
* quanto pretende gastar;
* como pretende se deslocar;
* qual ritmo deseja seguir.

---

## 26. Dificuldades possíveis

* usuário não entende categorias;
* orçamento difícil de estimar;
* grupo possui Preferências conflitantes;
* Meio de transporte pode variar;
* usuário não deseja responder tudo;
* personalização não altera resultados de forma perceptível.

---

## 27. Comportamentos esperados do produto

O produto deverá:

* tornar campos opcionais claros;
* explicar por que uma informação é solicitada;
* permitir revisão posterior;
* evitar assumir informações;
* mostrar impacto quando relevante;
* manter opções padrão neutras;
* não bloquear a Descoberta.

---

## 28. Critérios de sucesso

* O usuário entende que a personalização é opcional.
* A configuração pode ser alterada.
* As Recomendações refletem o contexto informado.
* O usuário percebe diferença relevante.
* Nenhum dado desnecessário é solicitado.

---

# Parte IV — Jornada 3: Descobrir Lugares

## 29. Objetivo

Permitir que o usuário encontre Lugares e Experiências relevantes para sua Viagem.

---

## 30. Persona principal

Planejador Prático.

### Personas relacionadas

Todas.

---

## 31. Gatilho

O usuário deseja conhecer opções disponíveis no Destino.

---

## 32. Pontos de entrada

A Descoberta poderá ser iniciada por:

* área Explorar;
* Mapa;
* Categoria de Lugar;
* pesquisa;
* recomendação;
* Período livre;
* região específica.

---

## 33. Etapas principais

1. O usuário acessa Explorar.
2. O produto apresenta Lugares iniciais.
3. O usuário alterna entre lista e mapa.
4. O usuário seleciona uma categoria.
5. O usuário aplica filtros.
6. O produto atualiza os resultados.
7. O usuário seleciona um Cartão ou Marcador.
8. O produto apresenta um resumo.
9. O usuário abre os Detalhes do Lugar.
10. O usuário salva, adiciona ao Roteiro ou retorna à exploração.

---

## 34. Informações prioritárias

Na Descoberta, o usuário deverá perceber rapidamente:

* nome;
* categoria;
* fotografia;
* avaliação;
* Faixa de preço;
* distância da Hospedagem;
* justificativa resumida;
* estado salvo ou planejado.

---

## 35. Resultado esperado

O usuário encontra opções que considera relevantes e compreende sua distribuição geográfica.

---

## 36. Dificuldades possíveis

* resultados em excesso;
* ausência de filtros úteis;
* mapa poluído;
* informações incompletas;
* recomendações genéricas;
* distância pouco clara;
* baixa cobertura do Destino;
* lista e mapa inconsistentes.

---

## 37. Comportamentos esperados do produto

O produto deverá:

* ordenar por relevância contextual;
* permitir filtros;
* agrupar Marcadores;
* sincronizar mapa e lista;
* tratar ausência de dados;
* apresentar estados de carregamento;
* explicar por que algo foi recomendado;
* não esconder opções apenas por baixa pontuação.

---

## 38. Critérios de sucesso

* O usuário encontra ao menos uma opção relevante.
* O usuário entende onde o Lugar está.
* Filtros alteram os resultados.
* A relação entre lista e mapa é compreensível.
* O usuário consegue seguir para Detalhes, Salvos ou Roteiro.

---

# Parte V — Jornada 4: Avaliar um Lugar

## 39. Objetivo

Permitir que o usuário decida se um Lugar é adequado para a Viagem.

---

## 40. Persona principal

Planejador Prático.

### Personas relacionadas

Todas.

---

## 41. Gatilho

O usuário encontra um Lugar potencialmente interessante.

---

## 42. Perguntas que a jornada deve responder

* O que é este Lugar?
* Onde está?
* Qual a distância?
* Quanto tempo leva para chegar?
* Qual a Faixa de preço?
* Em que horário funciona?
* Para qual perfil é indicado?
* Quanto tempo vale a pena permanecer?
* Por que foi recomendado?
* Como pode ser incluído no Roteiro?

---

## 43. Etapas principais

1. O usuário abre os Detalhes do Lugar.
2. O produto apresenta informações principais.
3. O usuário visualiza fotografias.
4. O usuário consulta localização e distância.
5. O usuário verifica horário e preço.
6. O usuário lê a Justificativa da recomendação.
7. O usuário visualiza o Lugar no mapa.
8. O usuário decide:

   * salvar;
   * adicionar ao Roteiro;
   * abrir rota;
   * comparar;
   * descartar.

---

## 44. Resultado esperado

O usuário toma uma decisão informada sem precisar consultar várias fontes para informações básicas.

---

## 45. Dificuldades possíveis

* dados ausentes;
* preço desatualizado;
* horário incerto;
* avaliação sem contexto;
* fotografia enganosa;
* distância sem Meio de transporte;
* recomendação não explicada.

---

## 46. Comportamentos esperados do produto

O produto deverá:

* identificar Dados estimados;
* informar indisponibilidade;
* exibir fonte quando relevante;
* distinguir distância e Tempo de deslocamento;
* evitar afirmações absolutas;
* permitir abertura de fonte externa;
* manter ações principais visíveis.

---

## 47. Critérios de sucesso

* O usuário entende o tipo de Lugar.
* O usuário compreende localização e custo aproximado.
* O usuário sabe por que o Lugar apareceu.
* O usuário consegue realizar uma ação clara.
* Informações incertas não são apresentadas como garantias.

---

# Parte VI — Jornada 5: Salvar Lugares

## 48. Objetivo

Permitir que o usuário mantenha opções de interesse sem assumir compromisso com o Roteiro.

---

## 49. Persona principal

Planejador Prático.

### Personas relacionadas

Todas.

---

## 50. Gatilho

O usuário encontra um Lugar interessante, mas ainda não decidiu quando ou se irá visitá-lo.

---

## 51. Etapas principais

1. O usuário seleciona a ação Salvar.
2. O produto confirma a alteração visualmente.
3. O Lugar passa a aparecer na área Salvos.
4. O Marcador recebe indicação correspondente.
5. O usuário continua explorando.
6. Posteriormente, o usuário acessa os Lugares salvos.
7. O usuário pode:

   * abrir Detalhes;
   * visualizar no mapa;
   * adicionar ao Roteiro;
   * remover dos salvos.

---

## 52. Resultado esperado

O usuário constrói uma coleção temporária de possibilidades para a Viagem.

---

## 53. Dificuldades possíveis

* confusão entre salvar e adicionar ao Roteiro;
* salvamento sem confirmação;
* duplicação;
* dificuldade para localizar Salvos;
* remoção acidental;
* estados inconsistentes.

---

## 54. Comportamentos esperados do produto

O produto deverá:

* diferenciar claramente Salvo e Planejado;
* permitir reversão;
* manter estado sincronizado;
* evitar duplicações;
* atualizar lista, mapa e Detalhes;
* permitir adição posterior ao Roteiro.

---

## 55. Critérios de sucesso

* O usuário entende o significado de Salvar.
* A ação é rápida.
* O Lugar aparece em Salvos.
* O estado é consistente em todas as visualizações.
* A remoção é possível.

---

# Parte VII — Jornada 6: Adicionar um Lugar ao Roteiro

## 56. Objetivo

Transformar um Lugar em uma Atividade planejada.

---

## 57. Persona principal

Planejador Prático.

### Personas relacionadas

Todas.

---

## 58. Gatilho

O usuário decidiu que deseja considerar a visita em um Dia da Viagem.

---

## 59. Pontos de entrada

A ação poderá ser iniciada a partir de:

* Cartão de Lugar;
* Detalhes do Lugar;
* Lugares salvos;
* Mapa;
* sugestão;
* Período livre.

---

## 60. Etapas principais

1. O usuário escolhe Adicionar ao Roteiro.
2. O produto apresenta os Dias da Viagem.
3. O usuário escolhe um dia.
4. O usuário poderá informar horário e duração.
5. O produto verifica conflitos conhecidos.
6. O produto cria a Atividade planejada.
7. O Roteiro é atualizado.
8. O mapa do dia é atualizado.
9. O usuário visualiza confirmação.
10. O usuário pode acessar o dia ou continuar explorando.

---

## 61. Resultado esperado

O Lugar passa a integrar o Roteiro como uma Atividade planejada.

---

## 62. Dificuldades possíveis

* usuário não sabe qual dia escolher;
* Dia sobrecarregado;
* conflito de horário;
* duração desconhecida;
* adição duplicada;
* Lugar fechado no horário;
* deslocamento incompatível.

---

## 63. Comportamentos esperados do produto

O produto deverá:

* sugerir dias adequados quando possível;
* informar conflitos sem bloquear indevidamente;
* oferecer Duração estimada;
* permitir adicionar sem horário exato;
* evitar duplicação acidental;
* mostrar impacto de deslocamento;
* preservar controle do usuário.

---

## 64. Critérios de sucesso

* A atividade pode ser adicionada com poucos passos.
* O usuário identifica o dia escolhido.
* O estado aparece no Roteiro e no mapa.
* Conflitos conhecidos são comunicados.
* O usuário pode editar depois.

---

# Parte VIII — Jornada 7: Montar o Roteiro manualmente

## 65. Objetivo

Permitir que o usuário organize Atividades de acordo com suas próprias escolhas.

---

## 66. Persona principal

Planejador Prático.

### Personas relacionadas

* Planejador Econômico;
* Organizador de Grupo.

---

## 67. Gatilho

O usuário possui Lugares salvos ou selecionados e deseja distribuí-los pelos dias.

---

## 68. Etapas principais

1. O usuário acessa o Roteiro.
2. O produto apresenta os Dias da Viagem.
3. O usuário seleciona um dia.
4. O usuário adiciona Atividades.
5. O usuário define ordem.
6. O usuário informa horários aproximados.
7. O usuário ajusta durações.
8. O produto apresenta Deslocamentos estimados.
9. O usuário inclui Períodos livres.
10. O produto exibe possíveis conflitos.
11. O usuário revisa o dia.
12. O usuário repete o processo nos demais dias.

---

## 69. Resultado esperado

O usuário possui um Roteiro diário editável e compreensível.

---

## 70. Dificuldades possíveis

* excesso de Lugares;
* dias desequilibrados;
* dificuldade para estimar duração;
* deslocamentos ignorados;
* interface de reordenação ruim;
* falta de visão geral;
* planejamento excessivamente detalhado.

---

## 71. Comportamentos esperados do produto

O produto deverá:

* permitir adicionar sem horário exato;
* sugerir duração;
* mostrar distâncias;
* permitir reordenação;
* permitir mover entre dias;
* preservar Períodos livres;
* destacar Dias sobrecarregados;
* oferecer visão geográfica;
* evitar preenchimento obrigatório de todos os períodos.

---

## 72. Critérios de sucesso

* O usuário consegue distribuir Atividades.
* A ordem pode ser alterada.
* A visão diária é compreensível.
* O planejamento considera Deslocamentos.
* O usuário mantém autonomia.
* O Roteiro não exige precisão artificial.

---

# Parte IX — Jornada 8: Gerar uma proposta de Roteiro

## 73. Objetivo

Permitir que o sistema apresente uma organização inicial baseada no Contexto da Viagem.

---

## 74. Persona principal

Planejador Prático.

### Personas relacionadas

* Planejador Econômico;
* Organizador de Grupo;
* usuários que desejam assistência alta.

---

## 75. Gatilho

O usuário possui:

* Viagem criada;
* alguns Lugares selecionados ou salvos;
* contexto mínimo;
* desejo de reduzir o trabalho manual.

---

## 76. Etapas principais

1. O usuário solicita uma proposta.
2. O produto verifica as informações disponíveis.
3. O produto informa possíveis limitações.
4. O sistema agrupa Lugares por proximidade.
5. O sistema considera duração e dias disponíveis.
6. O sistema distribui Atividades.
7. O sistema preserva margens e Períodos livres.
8. O produto apresenta a proposta.
9. O usuário revisa as Justificativas.
10. O usuário pode:

    * aceitar;
    * editar;
    * descartar;
    * gerar novamente.

---

## 77. Resultado esperado

O usuário recebe um ponto de partida utilizável, sem perder controle.

---

## 78. Dificuldades possíveis

* poucos dados;
* Lugares incompatíveis;
* proposta genérica;
* dias sobrecarregados;
* horários incorretos;
* confiança excessiva;
* usuário não entende critérios.

---

## 79. Comportamentos esperados do produto

O produto deverá:

* apresentar como sugestão;
* explicar critérios principais;
* indicar dados ausentes;
* permitir edição completa;
* preservar Lugares obrigatórios;
* respeitar Restrições;
* não substituir escolhas sem informar;
* evitar falsa precisão.

---

## 80. Critérios de sucesso

* A proposta reduz esforço inicial.
* O usuário entende que pode alterar.
* Os dias são minimamente viáveis.
* A distribuição geográfica faz sentido.
* Preferências e ritmo são considerados.
* O usuário consegue aceitar parcialmente.

---

# Parte X — Jornada 9: Revisar a viabilidade do Roteiro

## 81. Objetivo

Ajudar o usuário a identificar problemas antes da execução.

---

## 82. Persona principal

Planejador Prático.

### Personas relacionadas

* Organizador de Grupo;
* Planejador Econômico.

---

## 83. Gatilho

O usuário adicionou Atividades suficientes para revisar o planejamento.

---

## 84. Aspectos revisados

* sobreposição;
* horários de funcionamento;
* deslocamentos;
* duração;
* intensidade;
* Períodos livres;
* distribuição por região;
* compatibilidade com orçamento;
* adequação ao grupo.

---

## 85. Etapas principais

1. O usuário acessa a revisão do Roteiro.
2. O produto analisa os dias.
3. O produto identifica alertas.
4. O usuário visualiza os problemas por prioridade.
5. O produto explica o impacto.
6. O usuário escolhe uma ação:

   * ajustar;
   * ignorar;
   * substituir;
   * mover;
   * remover.
7. O produto atualiza a análise.
8. O usuário confirma o planejamento.

---

## 86. Resultado esperado

O usuário compreende os principais riscos e pode corrigir o Roteiro.

---

## 87. Dificuldades possíveis

* alertas excessivos;
* falsa precisão;
* bloqueios desnecessários;
* mensagens técnicas;
* ausência de solução;
* conflito entre preferência e otimização.

---

## 88. Comportamentos esperados do produto

O produto deverá:

* priorizar alertas;
* diferenciar erro, risco e sugestão;
* explicar impacto;
* permitir ignorar quando seguro;
* oferecer alternativas;
* preservar autonomia;
* atualizar a revisão após mudanças.

---

## 89. Critérios de sucesso

* O usuário identifica problemas relevantes.
* Os alertas são compreensíveis.
* O produto não bloqueia preferências injustificadamente.
* O usuário consegue resolver ou aceitar o risco.
* O Roteiro final parece executável.

---

# Parte XI — Jornada 10: Consultar o Roteiro durante a Viagem

## 90. Objetivo

Permitir consulta rápida e prática do planejamento durante a execução.

---

## 91. Persona principal

Explorador Flexível.

### Personas relacionadas

Todas.

---

## 92. Gatilho

O usuário está no Destino e deseja saber o que fará em seguida.

---

## 93. Contexto de uso

* dispositivo móvel;
* atenção limitada;
* possível conexão instável;
* necessidade de ação rápida;
* uso em deslocamento;
* mudanças de última hora.

---

## 94. Etapas principais

1. O usuário abre a Viagem.
2. O produto apresenta o Dia atual.
3. O usuário visualiza:

   * Atividade atual;
   * próxima Atividade;
   * horário;
   * distância;
   * rota;
   * observações.
4. O usuário abre Detalhes, se necessário.
5. O usuário inicia rota externa.
6. O usuário marca mentalmente ou futuramente registra conclusão.
7. O usuário retorna para consultar a próxima etapa.

---

## 95. Resultado esperado

O usuário obtém rapidamente as informações necessárias para continuar a Viagem.

---

## 96. Dificuldades possíveis

* excesso de informação;
* navegação profunda;
* mapa lento;
* rota escondida;
* horário desatualizado;
* ausência de alternativa;
* baixa legibilidade.

---

## 97. Comportamentos esperados do produto

O produto deverá:

* priorizar o Dia atual;
* destacar próxima Atividade;
* manter ações principais acessíveis;
* funcionar em tela pequena;
* reduzir conteúdo secundário;
* permitir abrir rota;
* informar mudanças relevantes;
* oferecer alternativa em lista.

---

## 98. Critérios de sucesso

* O usuário encontra a próxima Atividade rapidamente.
* A rota pode ser aberta.
* Informações essenciais são legíveis.
* O usuário não precisa navegar por várias telas.
* A consulta funciona em celular.

---

# Parte XII — Jornada 11: Alterar o planejamento

## 99. Objetivo

Permitir que o usuário adapte uma parte do Roteiro sem reconstruir toda a Viagem.

---

## 100. Persona principal

Explorador Flexível.

### Personas relacionadas

Todas.

---

## 101. Gatilhos

* atraso;
* cansaço;
* mudança de interesse;
* atividade cancelada;
* local fechado;
* orçamento alterado;
* nova descoberta;
* mudança de horário;
* decisão do grupo.

---

## 102. Tipos de alteração

* remover Atividade;
* mover horário;
* mover dia;
* substituir Lugar;
* reduzir duração;
* adicionar Período livre;
* alterar ordem;
* adicionar nova opção.

---

## 103. Etapas principais

1. O usuário seleciona a Atividade.
2. O produto apresenta ações de edição.
3. O usuário escolhe a alteração.
4. O produto mostra impactos conhecidos.
5. O usuário confirma.
6. O Roteiro é atualizado.
7. O mapa e os Deslocamentos são recalculados.
8. O produto apresenta alertas restantes.
9. O usuário continua a Viagem.

---

## 104. Resultado esperado

A mudança é aplicada localmente com impacto compreensível.

---

## 105. Dificuldades possíveis

* alteração modifica todo o Roteiro;
* perda de dados;
* dificuldade para desfazer;
* conflitos novos;
* falta de alternativas;
* recalculação lenta;
* atualização inconsistente.

---

## 106. Comportamentos esperados do produto

O produto deverá:

* limitar a mudança ao necessário;
* permitir desfazer quando possível;
* mostrar impacto;
* manter estados sincronizados;
* preservar informações;
* recalcular apenas dependências relevantes;
* evitar mudanças automáticas ocultas.

---

## 107. Critérios de sucesso

* A alteração é simples.
* O usuário entende o impacto.
* O restante da Viagem é preservado.
* O mapa é atualizado.
* Novos conflitos são informados.
* O usuário permanece no controle.

---

# Parte XIII — Jornada 12: Encontrar uma opção próxima

## 108. Objetivo

Ajudar o usuário a encontrar rapidamente um Lugar adequado à localização ou Atividade atual.

---

## 109. Persona principal

Explorador Flexível.

### Personas relacionadas

* Planejador Econômico;
* Planejador Prático.

---

## 110. Gatilho

O usuário possui um Período livre ou precisa substituir uma atividade.

---

## 111. Exemplos

* encontrar restaurante próximo;
* encontrar bar após o jantar;
* encontrar passeio perto de uma praia;
* encontrar opção econômica na região;
* encontrar atividade curta.

---

## 112. Etapas principais

1. O usuário acessa opções próximas.
2. O produto determina a origem:

   * Hospedagem;
   * Atividade atual;
   * localização atual, quando disponível;
   * ponto selecionado.
3. O usuário escolhe categoria ou filtro.
4. O produto apresenta poucas opções relevantes.
5. O usuário compara distância e preço.
6. O usuário abre Detalhes.
7. O usuário adiciona ao Roteiro ou abre rota.

---

## 113. Resultado esperado

O usuário encontra uma opção adequada sem realizar pesquisa extensa.

---

## 114. Dificuldades possíveis

* geolocalização indisponível;
* muitas opções;
* local fechado;
* distância inadequada;
* recomendação incompatível;
* baixa cobertura.

---

## 115. Comportamentos esperados do produto

O produto deverá:

* permitir escolher a referência;
* apresentar distância;
* considerar horário;
* aplicar Preferências;
* priorizar relevância;
* permitir alterar filtros;
* tratar ausência de localização atual.

---

## 116. Critérios de sucesso

* O usuário entende qual origem está sendo utilizada.
* As opções são realmente próximas.
* Horário e transporte são considerados quando possível.
* A ação pode ser concluída rapidamente.
* O usuário consegue adicionar ou navegar.

---

# Parte XIV — Jornada 13: Planejar com foco em orçamento

## 117. Objetivo

Permitir que o usuário organize a Viagem considerando limites e custo-benefício.

---

## 118. Persona principal

Planejador Econômico.

---

## 119. Gatilho

O usuário possui orçamento limitado ou deseja maior previsibilidade.

---

## 120. Etapas principais

1. O usuário informa a Faixa de orçamento.
2. O produto adapta Recomendações.
3. O usuário filtra opções econômicas.
4. O usuário compara preço, avaliação e distância.
5. O usuário salva opções.
6. O produto apresenta Alternativas de menor custo.
7. O usuário distribui Atividades.
8. O usuário revisa a concentração de gastos.
9. O usuário ajusta experiências especiais e econômicas.

---

## 121. Resultado esperado

O Roteiro reflete o orçamento sem reduzir todas as decisões ao menor preço.

---

## 122. Dificuldades possíveis

* preços ausentes;
* dados desatualizados;
* classificação inconsistente;
* custo de transporte ignorado;
* orçamento rígido demais;
* ausência de opções gratuitas.

---

## 123. Comportamentos esperados do produto

O produto deverá:

* identificar estimativas;
* considerar custo-benefício;
* apresentar alternativas;
* destacar opções gratuitas;
* evitar garantir preços;
* considerar distância como custo indireto;
* permitir experiências fora da faixa com aviso.

---

## 124. Critérios de sucesso

* O orçamento influencia resultados.
* O usuário consegue comparar.
* Dados estimados são identificados.
* O produto não bloqueia escolhas.
* O usuário percebe equilíbrio de custos.

---

# Parte XV — Jornada 14: Planejar para um grupo

## 125. Objetivo

Permitir que um Organizador represente necessidades relevantes de várias pessoas.

---

## 126. Persona principal

Organizador de Grupo.

---

## 127. Gatilho

O usuário planeja uma Viagem para família ou amigos.

---

## 128. Informações relevantes

* quantidade de Viajantes;
* presença de crianças;
* faixas etárias;
* Restrições alimentares;
* necessidades de acessibilidade;
* Ritmo da Viagem;
* Interesses compartilhados;
* orçamento.

---

## 129. Etapas principais

1. O Organizador cria a Viagem.
2. Informa o Perfil do Grupo.
3. Registra Restrições essenciais.
4. Seleciona Interesses.
5. O produto adapta Recomendações.
6. O Organizador salva opções adequadas.
7. O produto sinaliza compatibilidade.
8. O Organizador monta o Roteiro.
9. O produto verifica intensidade.
10. O Organizador compartilha ou apresenta o resultado externamente.

---

## 130. Resultado esperado

O Roteiro considera as necessidades principais do grupo sem exigir cadastro individual de todos.

---

## 131. Dificuldades possíveis

* preferências conflitantes;
* dados incompletos;
* grupo heterogêneo;
* excesso de configurações;
* uma pessoa representa todos;
* falta de colaboração.

---

## 132. Comportamentos esperados do produto

O produto deverá:

* priorizar Restrições;
* permitir múltiplos Interesses;
* considerar crianças e acessibilidade;
* evitar formulários extensos;
* explicar adequação;
* permitir ajustes;
* preparar evolução para colaboração futura.

---

## 133. Critérios de sucesso

* O grupo pode ser representado de forma simples.
* Restrições alteram resultados.
* O Ritmo influencia o Roteiro.
* O Organizador entende a adequação.
* Não é necessário criar várias contas.

---

# Parte XVI — Jornada 15: Retomar uma Viagem existente

## 134. Objetivo

Permitir que o usuário continue o planejamento ou a consulta sem perder progresso.

---

## 135. Persona principal

Todas.

---

## 136. Gatilho

O usuário retorna ao RouteBook após sair da aplicação.

---

## 137. Etapas principais

1. O usuário acessa o produto.
2. O produto identifica Viagens existentes.
3. O usuário seleciona a Viagem.
4. O produto apresenta um resumo contextual.
5. O usuário continua de onde parou.
6. O usuário pode:

   * explorar;
   * editar;
   * consultar o Roteiro;
   * revisar Salvos;
   * alterar configurações.

---

## 138. Resultado esperado

O usuário recupera o estado completo da Viagem.

---

## 139. Informações preservadas

* contexto;
* Hospedagem;
* Preferências;
* Salvos;
* Roteiro;
* ordem das Atividades;
* horários;
* Períodos livres;
* alterações.

---

## 140. Dificuldades possíveis

* dados não persistidos;
* estado desatualizado;
* usuário não sabe onde continuar;
* múltiplas Viagens;
* mapa demora a carregar;
* mudança de provedor externo.

---

## 141. Comportamentos esperados do produto

O produto deverá:

* preservar dados;
* apresentar status atual;
* destacar próximo passo;
* tratar falha parcial de dados externos;
* evitar perder o Roteiro;
* indicar informações que precisam ser atualizadas.

---

## 142. Critérios de sucesso

* A Viagem é encontrada.
* O estado anterior é preservado.
* O usuário entende o próximo passo.
* Falhas externas não apagam dados internos.
* A retomada funciona em diferentes dispositivos quando aplicável.

---

# Parte XVII — Estados emocionais e expectativas

## 143. Início do planejamento

### Estado provável

* entusiasmo;
* curiosidade;
* incerteza;
* excesso de possibilidades.

### Resposta esperada do produto

* simplicidade;
* orientação;
* valor rápido;
* baixa exigência inicial.

---

## 144. Descoberta

### Estado provável

* interesse;
* comparação;
* receio de perder opções;
* sobrecarga.

### Resposta esperada do produto

* filtros;
* Salvos;
* mapa;
* relevância;
* informação progressiva.

---

## 145. Organização

### Estado provável

* necessidade de controle;
* dúvida;
* tentativa de equilíbrio;
* cansaço de planejamento.

### Resposta esperada do produto

* edição simples;
* sugestões;
* alertas úteis;
* automação controlada;
* visão geral.

---

## 146. Antes da Viagem

### Estado provável

* expectativa;
* ansiedade;
* necessidade de confirmação.

### Resposta esperada do produto

* resumo;
* Roteiro acessível;
* clareza;
* informações pendentes;
* rotas.

---

## 147. Durante a Viagem

### Estado provável

* atenção limitada;
* pressa;
* mudança de planos;
* necessidade prática.

### Resposta esperada do produto

* consulta rápida;
* próxima ação;
* mapa;
* rota;
* alternativas;
* edição local.

---

# Parte XVIII — Pontos de contato

## 148. Pontos de contato principais

* página inicial;
* criação da Viagem;
* onboarding;
* Minha Viagem;
* Explorar;
* Mapa;
* Detalhes do Lugar;
* Salvos;
* Roteiro;
* revisão;
* consulta diária;
* configurações.

---

## 149. Pontos de contato externos

O usuário poderá sair temporariamente do RouteBook para:

* navegação;
* confirmação de horário;
* consulta de fonte;
* reserva externa;
* contato com estabelecimento;
* compartilhamento.

O produto deverá preservar contexto ao retornar.

---

# Parte XIX — Falhas e recuperação

## 150. Falha ao localizar Hospedagem

O produto deverá permitir:

* nova pesquisa;
* inserção manual;
* seleção no mapa;
* uso de referência provisória, quando suportado.

---

## 151. Falha ao carregar Lugares

O produto deverá:

* informar o problema;
* preservar a Viagem;
* permitir tentar novamente;
* apresentar dados já armazenados;
* evitar tela sem orientação.

---

## 152. Falha no mapa

O produto deverá:

* apresentar alternativa em lista;
* manter ações essenciais;
* informar indisponibilidade;
* permitir nova tentativa;
* não impedir acesso ao Roteiro.

---

## 153. Falha no cálculo de distância

O produto deverá:

* identificar indisponibilidade;
* evitar apresentar zero;
* manter localização;
* permitir abrir mapa externo;
* não bloquear seleção.

---

## 154. Roteiro sem dados suficientes

O produto deverá:

* indicar o que falta;
* permitir montagem manual;
* sugerir adicionar Lugares;
* evitar gerar proposta artificialmente completa.

---

## 155. Dados externos divergentes

O produto deverá:

* indicar fonte;
* evitar escolher silenciosamente quando o conflito for relevante;
* apresentar a informação com menor certeza;
* permitir confirmação externa.

---

# Parte XX — Requisitos derivados das jornadas

## 156. Requisitos de continuidade

O produto deverá:

* persistir a Viagem;
* permitir retomada;
* manter estados sincronizados;
* preservar alterações;
* evitar perda após falhas externas.

---

## 157. Requisitos de navegação

O produto deverá permitir acesso claro a:

* Minha Viagem;
* Explorar;
* Mapa;
* Salvos;
* Roteiro.

---

## 158. Requisitos de contexto

O Contexto da Viagem deverá estar disponível para:

* Recomendações;
* filtros;
* mapa;
* Roteiro;
* Justificativas;
* revisão.

---

## 159. Requisitos de edição

O usuário deverá conseguir:

* adicionar;
* remover;
* mover;
* reordenar;
* substituir;
* alterar horário;
* alterar duração;
* desfazer quando aplicável.

---

## 160. Requisitos de sincronização

Alterações deverão refletir em:

* lista;
* mapa;
* Salvos;
* Roteiro;
* Detalhes.

---

## 161. Requisitos de transparência

O produto deverá identificar:

* estimativas;
* dados ausentes;
* fonte externa;
* limitações;
* impacto de alterações;
* motivo das Recomendações.

---

## 162. Requisitos móveis

As jornadas de consulta e adaptação deverão ser priorizadas em celular.

---

## 163. Requisitos de acessibilidade

As jornadas deverão ser realizáveis sem depender exclusivamente:

* do mapa;
* de cor;
* de arrastar e soltar;
* de precisão motora;
* de imagens sem descrição.

---

# Parte XXI — Métricas por jornada

## 164. Criação de Viagem

Possíveis métricas:

* taxa de conclusão;
* tempo de criação;
* abandono por etapa;
* falha na Hospedagem;
* primeiro valor.

---

## 165. Descoberta

Possíveis métricas:

* Lugares visualizados;
* filtros utilizados;
* interação com mapa;
* abertura de Detalhes;
* resultados sem interação.

---

## 166. Salvos

Possíveis métricas:

* Lugares salvos;
* remoções;
* conversão de Salvo para Roteiro;
* tempo entre salvar e planejar.

---

## 167. Roteiro

Possíveis métricas:

* Atividades adicionadas;
* dias preenchidos;
* reordenações;
* conflitos;
* propostas aceitas;
* alterações manuais.

---

## 168. Uso durante a Viagem

Possíveis métricas:

* retorno no Dia da Viagem;
* abertura de rota;
* consulta da próxima Atividade;
* substituições;
* acesso por celular.

---

## 169. Retomada

Possíveis métricas:

* retorno à Viagem;
* frequência de edição;
* intervalo entre sessões;
* continuidade entre planejamento e execução.

---

# Parte XXII — Critérios de priorização

## 170. Prioridade máxima

* Criar Viagem.
* Configurar Hospedagem.
* Descobrir Lugares.
* Integrar lista e mapa.
* Avaliar Lugar.
* Salvar.
* Adicionar ao Roteiro.
* Editar.
* Retomar.

---

## 171. Prioridade alta

* proposta inicial;
* revisão de viabilidade;
* opções próximas;
* orçamento;
* Perfil do Grupo;
* Períodos livres;
* Justificativas.

---

## 172. Prioridade pós-MVP

* colaboração;
* votação;
* localização em tempo real;
* clima;
* notificações;
* uso offline;
* replanejamento automático completo;
* histórico de viagens concluídas.

---

# Parte XXIII — Validação das jornadas

## 173. Validação com cenário real

As jornadas deverão ser testadas utilizando a viagem que originou o RouteBook.

O teste deverá incluir:

* criação;
* Hospedagem;
* busca de praias;
* restaurantes;
* bares;
* vida noturna;
* Salvos;
* Roteiro;
* distâncias;
* consulta móvel.

---

## 174. Perguntas de validação

* O usuário entende por onde começar?
* O primeiro valor acontece cedo?
* O mapa ajuda?
* Salvos e Roteiro são claramente diferentes?
* O usuário entende as distâncias?
* A edição é simples?
* O Roteiro parece realista?
* A aplicação funciona durante a Viagem?
* Quais fontes externas continuam necessárias?
* Onde ocorre maior esforço?

---

## 175. Evidências esperadas

* observação de uso;
* feedback;
* problemas registrados;
* decisões alteradas;
* métricas;
* capturas de fluxo;
* testes de usabilidade;
* issues.

---

# Parte XXIV — Governança

## 176. Atualização das jornadas

Este documento deverá ser revisado quando:

* novas Personas forem validadas;
* o MVP mudar;
* fluxos revelarem etapas ausentes;
* novas capacidades centrais forem incorporadas;
* testes identificarem comportamentos diferentes;
* uso durante a Viagem gerar novos aprendizados.

---

## 177. Criação de nova jornada

Uma nova jornada deverá ser criada quando:

* representar objetivo distinto;
* atravessar vários fluxos;
* possuir valor próprio;
* exigir decisões específicas;
* não puder ser tratada como variação de jornada existente.

---

## 178. Relação com documentos posteriores

As jornadas deverão orientar:

### Casos de uso

Definirão interações orientadas a objetivos específicos.

### Requisitos funcionais

Transformarão comportamentos em especificações verificáveis.

### Arquitetura da informação

Organizará áreas e conteúdos necessários.

### Fluxos do usuário

Detalharão sequências de interface.

### Inventário de telas

Identificará superfícies necessárias.

### Testes ponta a ponta

Validarão a conclusão das jornadas críticas.

---

## 179. Checklist de consistência

Antes de aprovar uma jornada, verificar:

* possui objetivo claro;
* está relacionada a uma Persona;
* possui gatilho;
* possui resultado;
* mantém controle do usuário;
* considera mapa e distância quando relevantes;
* funciona em celular;
* possui recuperação de falhas;
* respeita acessibilidade;
* pode ser testada;
* está alinhada ao MVP;
* utiliza a terminologia oficial.

---

## 180. Declaração final

As Jornadas do Usuário representam como o RouteBook transforma sua proposta de valor em experiências concretas.

O produto deverá permitir que o usuário avance de informações básicas para um planejamento utilizável sem exigir um processo rígido.

As jornadas deverão manter integração entre:

* Contexto da Viagem;
* Descoberta;
* Mapa;
* Salvos;
* Roteiro;
* Recomendações;
* adaptação.

O RouteBook será bem-sucedido quando essas etapas funcionarem como partes de uma mesma experiência, e não como ferramentas isoladas.
