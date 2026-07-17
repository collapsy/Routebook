---

id: RB-UX-005

title: Especificações de Interação
description: Define os comportamentos, estados, feedbacks, transições, gestos, regras de foco, formulários e padrões de interação das superfícies do RouteBook.

document_type: ux
owner: Experience

status: Draft
version: "0.1.0"

created: "2026-07-17"
last_updated: null

authors:

- RouteBook Team

tags:

- ux
- interaction-design
- interaction-specifications
- behavior
- accessibility
- mobile-first
- responsive-design

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
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

prerequisites:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
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

next_documents:

- RB-UX-006
- RB-DS-001
- RB-DOM-001
- RB-ARC-001
- RB-QA-001

ai_context:
priority: high
index: true
---

# RouteBook — Especificações de Interação

## 1. Propósito deste documento

Este documento define as Especificações de Interação do RouteBook.

Seu objetivo é detalhar como as superfícies descritas nos documentos anteriores deverão se comportar durante o uso.

Este documento especifica:

* comportamentos de navegação;
* estados de controles;
* respostas a ações;
* feedbacks;
* transições;
* abertura e fechamento de superfícies;
* regras de formulários;
* seleção;
* salvamento;
* carregamento;
* falhas;
* reordenação;
* interações com Mapa;
* interações responsivas;
* acessibilidade;
* prevenção e recuperação de erros.

Este documento deverá orientar:

* Design System;
* protótipos interativos;
* implementação frontend;
* critérios de aceitação;
* testes de usabilidade;
* testes de acessibilidade;
* testes de integração;
* testes ponta a ponta;
* instrumentação de métricas.

Ele não define:

* identidade visual final;
* código;
* biblioteca de componentes;
* framework;
* animações decorativas;
* contratos técnicos de API;
* arquitetura de software.

---

## 2. Relação com os documentos anteriores

A sequência da camada de experiência é:

```text
Arquitetura da Informação
→ define áreas e estrutura

Fluxos do Usuário
→ definem caminhos e decisões

Inventário de Telas
→ define superfícies e estados

Wireframes
→ representam a composição

Especificações de Interação
→ definem o comportamento
```

As interações deverão preservar a estrutura já aprovada.

Nenhuma interação deverá introduzir:

* nova área principal;
* nova responsabilidade de tela;
* novo fluxo relevante;
* novo estado de negócio;

sem atualização dos documentos correspondentes.

---

## 3. Princípios de interação

Todas as interações do RouteBook deverão seguir estes princípios:

1. O usuário deve perceber o resultado de suas ações.
2. O sistema deve preservar contexto sempre que possível.
3. Ações não devem produzir efeitos inesperados.
4. Informações opcionais não devem bloquear tarefas centrais.
5. A automação deve sugerir, não impor.
6. Erros devem possuir recuperação.
7. Estados de carregamento devem ser proporcionais ao impacto.
8. A interface não deve depender apenas do Mapa.
9. Gestos não devem ser o único meio de interação.
10. Ações destrutivas devem comunicar impacto.
11. Estados devem ser compreensíveis sem depender de cor.
12. O comportamento mobile deve ser intencional.
13. Alterações não salvas devem ser protegidas.
14. A navegação deve manter previsibilidade.
15. O produto deve permitir planejamento parcial.

---

## 4. Convenção de identificação

As especificações utilizarão o padrão:

```text
RB-INT-XXX
```

Exemplo:

```text
RB-INT-001 — Navegação principal da Viagem
```

---

# Parte I — Estados fundamentais

## 5. Estados de um controle interativo

Controles como botões, links, seletores e itens de menu deverão considerar os seguintes estados:

* padrão;
* hover, quando aplicável;
* foco;
* pressionado;
* selecionado;
* desabilitado;
* carregando;
* sucesso;
* erro.

Nem todos os controles precisarão representar visualmente todos os estados, mas o comportamento deverá ser definido.

---

## 6. Estado padrão

O controle está disponível e ainda não recebeu interação.

Deverá comunicar:

* função;
* hierarquia;
* disponibilidade.

---

## 7. Estado de hover

Aplicável a dispositivos com ponteiro.

Deverá:

* indicar interatividade;
* preservar legibilidade;
* não alterar o layout;
* não ser necessário para compreender o controle.

Informação crítica não deverá aparecer apenas em hover.

---

## 8. Estado de foco

O foco deverá ser visível e possuir contraste adequado.

O foco não deverá:

* ser removido;
* depender apenas de cor;
* ser ocultado por elementos fixos;
* produzir mudança de layout.

---

## 9. Estado pressionado

Deverá comunicar que o controle está sendo ativado.

A resposta deverá ser imediata, mesmo quando a ação posterior depender de processamento.

---

## 10. Estado selecionado

Deverá ser utilizado em:

* filtros;
* categorias;
* Dias;
* abas;
* opções;
* contexto do Mapa;
* itens de navegação.

A seleção deverá ser comunicada por mais de um atributo quando necessário:

* texto;
* marca;
* borda;
* contraste;
* estado semântico.

---

## 11. Estado desabilitado

Um controle poderá ser desabilitado quando:

* pré-condição obrigatória não tiver sido atendida;
* ação estiver em processamento;
* ação não for permitida;
* dados necessários estiverem indisponíveis.

Sempre que possível, o motivo deverá ser compreensível.

Controles desabilitados não deverão ser utilizados para esconder regras importantes.

---

## 12. Estado carregando

Durante uma ação assíncrona, o controle deverá:

* impedir duplicação;
* preservar o rótulo ou contexto;
* indicar processamento;
* permanecer acessível.

Exemplo:

```text
[ Salvando... ]
```

O rótulo deverá ser preferível a um indicador sem contexto.

---

## 13. Estado de sucesso

O sucesso poderá ser comunicado por:

* mudança persistente do estado;
* mensagem contextual;
* notificação;
* confirmação na própria superfície.

Exemplo:

```text
Salvar
→ Salvo
```

---

## 14. Estado de erro

O erro deverá informar:

* o que não ocorreu;
* se os dados foram preservados;
* qual ação pode ser tomada;
* se o usuário deve revisar algo.

---

# Parte II — Navegação

## 15. RB-INT-001 — Navegação principal da Viagem

### Objetivo

Permitir acesso contínuo às áreas principais.

### Áreas

* Viagem;
* Explorar;
* Mapa;
* Roteiro;
* Salvos.

### Comportamento

Ao selecionar uma área:

1. a rota correspondente deverá ser aberta;
2. a área ativa deverá ser marcada;
3. o contexto da Viagem deverá ser preservado;
4. estados relevantes deverão ser mantidos quando possível.

### Mobile

A navegação deverá permanecer fixa na parte inferior nas áreas centrais.

### Desktop

A navegação deverá permanecer lateral ou superior.

### Exceções

A navegação poderá ser temporariamente ocultada em:

* criação da Viagem;
* formulários imersivos;
* edição em tela completa;
* modais;
* superfícies críticas de confirmação.

---

## 16. RB-INT-002 — Navegação de retorno

### Regra principal

Voltar deverá retornar ao contexto de origem, não apenas à página anterior lógica.

Exemplos:

```text
Explorar
→ Detalhes do Lugar
→ Voltar
→ Explorar com mesmos filtros e posição
```

```text
Roteiro do Dia 24
→ Detalhes da Atividade
→ Voltar
→ Dia 24 preservado
```

### Preservação

Deverão ser preservados, quando possível:

* pesquisa;
* filtros;
* ordenação;
* posição da lista;
* Região do Mapa;
* Dia selecionado;
* Lugar selecionado;
* scroll.

---

## 17. RB-INT-003 — Navegação entre Viagens

Ao trocar de Viagem:

* filtros contextuais deverão ser reiniciados;
* Dia selecionado deverá ser recalculado;
* dados da Viagem anterior não deverão permanecer;
* estado global da conta poderá ser preservado.

A troca deverá ser explícita.

---

## 18. RB-INT-004 — Links internos

Links internos deverão:

* manter a aplicação no mesmo contexto;
* utilizar navegação interna;
* possuir rótulo descritivo;
* evitar recarregamento completo quando não necessário.

---

## 19. RB-INT-005 — Links externos

Links externos deverão ser utilizados para:

* rotas;
* serviços especializados;
* fontes;
* reservas futuras;
* informações externas.

Quando relevante, deverá ser indicado que o usuário sairá temporariamente do RouteBook.

---

# Parte III — Páginas, painéis e superfícies sobrepostas

## 20. RB-INT-006 — Abertura de página

Ao abrir uma página:

1. o título deverá ser atualizado;
2. o foco inicial deverá ser previsível;
3. o carregamento deverá ser apresentado no nível correto;
4. o contexto da Viagem deverá permanecer visível.

---

## 21. RB-INT-007 — Modal

Modais deverão ser utilizados para:

* confirmação;
* decisão curta;
* impacto;
* ação destrutiva;
* tarefa pequena.

Não deverão ser utilizados para fluxos longos.

### Ao abrir

* o foco deverá ser movido para o modal;
* o conteúdo atrás deverá ficar inativo;
* o título deverá ser anunciado;
* o primeiro foco deverá ser significativo.

### Ao fechar

* o foco deverá retornar ao elemento de origem;
* nenhuma alteração deverá ser aplicada sem confirmação;
* o contexto anterior deverá ser preservado.

---

## 22. RB-INT-008 — Bottom sheet

Bottom sheets móveis poderão representar:

* filtros;
* seleção de Dia;
* seleção de transporte;
* resumo do Marcador;
* ações contextuais;
* reordenação.

### Estados possíveis

* fechado;
* parcialmente aberto;
* expandido;
* em processamento;
* erro.

### Regras

* deverá possuir ação explícita de fechar;
* o gesto de arrastar não deverá ser o único método;
* a altura deverá respeitar o conteúdo;
* ações importantes não deverão ficar ocultas.

---

## 23. RB-INT-009 — Drawer lateral

Drawers poderão ser utilizados em desktop para:

* filtros;
* Detalhes;
* Configurações contextuais.

O drawer deverá:

* preservar a página base;
* permitir fechamento explícito;
* devolver foco;
* evitar largura excessiva.

---

## 24. RB-INT-010 — Painel lateral persistente

Painéis persistentes deverão ser utilizados quando a relação entre conteúdos for importante.

Exemplos:

* lista e Detalhes;
* Roteiro e Mapa;
* alertas e correção.

A seleção em um painel deverá atualizar os demais sem perder o contexto.

---

# Parte IV — Feedback

## 25. RB-INT-011 — Feedback imediato

Toda ação deverá produzir resposta inicial em até o menor intervalo perceptível.

Exemplos:

* botão muda para pressionado;
* item muda de estado;
* indicador aparece;
* painel começa a abrir.

---

## 26. RB-INT-012 — Feedback contextual

Preferível para ações que alteram o objeto visível.

Exemplos:

```text
♡ Salvar
→ ♥ Salvo
```

```text
Adicionar ao Roteiro
→ Planejado para 24 de agosto
```

---

## 27. RB-INT-013 — Notificação temporária

Notificações temporárias poderão ser utilizadas para:

* confirmação não crítica;
* ação concluída;
* falha recuperável;
* desfazer ação simples.

Exemplo:

```text
Lugar removido dos Salvos. Desfazer
```

### Regras

* não deverão conter informação indispensável;
* deverão ser acessíveis;
* não deverão desaparecer rápido demais;
* ações importantes deverão permanecer disponíveis em outro lugar.

---

## 28. RB-INT-014 — Feedback persistente

Deverá ser utilizado quando:

* erro continuar afetando a superfície;
* alteração não tiver sido salva;
* dados estiverem parciais;
* serviço estiver indisponível;
* conflito exigir ação.

---

## 29. RB-INT-015 — Desfazer

A ação Desfazer deverá ser preferida para operações simples e reversíveis.

Exemplos:

* remover dos Salvos;
* reordenar Atividade;
* remover filtro;
* arquivar futuramente.

A ação não substitui confirmação em operações irreversíveis.

---

# Parte V — Formulários

## 30. RB-INT-016 — Estrutura de formulário

Formulários deverão apresentar:

* título;
* instrução necessária;
* campos;
* validação;
* ação principal;
* cancelamento;
* estado de salvamento.

---

## 31. RB-INT-017 — Rótulos

Todo campo deverá possuir rótulo persistente.

Placeholder não deverá substituir rótulo.

Exemplo correto:

```text
Destino
[ Pesquise uma cidade ]
```

---

## 32. RB-INT-018 — Campos obrigatórios

Campos obrigatórios deverão ser identificados de forma compreensível.

A interface não deverá depender apenas de asterisco.

Quando a maioria dos campos for obrigatória, poderá ser informado:

```text
Todos os campos são obrigatórios, exceto quando indicado.
```

---

## 33. RB-INT-019 — Validação

A validação deverá ocorrer:

* após interação suficiente;
* ao sair do campo;
* ao tentar continuar;
* durante preenchimento apenas quando útil.

A validação não deverá interromper prematuramente a digitação.

---

## 34. RB-INT-020 — Mensagem de erro de campo

A mensagem deverá:

* aparecer próxima ao campo;
* explicar o problema;
* indicar correção;
* estar associada semanticamente ao campo.

Exemplo:

```text
A data final deve ser igual ou posterior à data inicial.
```

---

## 35. RB-INT-021 — Erro no envio

Quando o envio falhar:

* os dados deverão ser preservados;
* o usuário deverá permanecer no formulário;
* a falha deverá ser explicada;
* uma nova tentativa deverá estar disponível.

---

## 36. RB-INT-022 — Alterações não salvas

Ao sair de um formulário alterado:

```text
<Existem alterações?>
   ├── Não → sair
   └── Sim → apresentar proteção
```

Opções:

* continuar editando;
* descartar;
* salvar e sair, quando suportado.

---

## 37. RB-INT-023 — Salvamento automático

O salvamento automático poderá ser utilizado em:

* Preferências simples;
* ordenação;
* filtros persistentes;
* estados de visualização.

Deverá indicar:

* salvando;
* salvo;
* falha.

Não deverá ser utilizado silenciosamente em ações estruturais críticas.

---

## 38. RB-INT-024 — Campos de data

Campos de data deverão:

* aceitar entrada acessível;
* apresentar calendário como apoio;
* respeitar localidade;
* impedir combinações inválidas;
* comunicar duração calculada.

---

## 39. RB-INT-025 — Contadores

Contadores como quantidade de Viajantes deverão possuir:

* diminuir;
* aumentar;
* valor atual;
* limites;
* operação por teclado.

O valor mínimo deverá ser um.

---

# Parte VI — Busca, categorias e filtros

## 40. RB-INT-026 — Campo de pesquisa

A pesquisa deverá permitir:

* digitação;
* limpeza;
* envio;
* cancelamento;
* resultados;
* ausência de resultados;
* falha.

### Comportamento

A busca poderá iniciar após:

* confirmação;
* pausa de digitação;
* seleção de sugestão.

A estratégia final deverá evitar chamadas desnecessárias.

---

## 41. RB-INT-027 — Sugestões de pesquisa

Sugestões deverão:

* estar associadas ao termo;
* indicar localização;
* permitir navegação por teclado;
* possuir item ativo;
* fechar ao selecionar ou cancelar.

---

## 42. RB-INT-028 — Limpar pesquisa

Ao limpar:

* o termo deverá ser removido;
* o foco poderá permanecer no campo;
* resultados padrão deverão retornar;
* filtros não deverão ser removidos automaticamente.

---

## 43. RB-INT-029 — Categorias

Categorias poderão funcionar como atalhos ou filtros.

Ao selecionar:

* a categoria deverá ficar ativa;
* os resultados deverão ser atualizados;
* o Mapa deverá acompanhar;
* a seleção deverá ser removível.

---

## 44. RB-INT-030 — Painel de filtros

### Ao abrir

* os filtros aplicados deverão aparecer selecionados;
* alterações ainda não aplicadas deverão permanecer locais;
* a ação Aplicar deverá refletir a quantidade estimada quando possível.

### Ao aplicar

* o painel deverá fechar em mobile;
* resultados deverão ser atualizados;
* filtros ativos deverão aparecer;
* foco deverá retornar ao acionador ou ao título dos resultados.

### Ao cancelar

Alterações não aplicadas deverão ser descartadas.

---

## 45. RB-INT-031 — Remover filtro

Um filtro deverá poder ser removido:

* pelo chip ativo;
* pelo painel;
* pela ação Limpar todos.

A remoção deverá atualizar lista e Mapa.

---

## 46. RB-INT-032 — Sem resultados filtrados

A tela deverá apresentar recuperação:

* limpar filtros;
* ampliar Distância;
* mudar categoria;
* pesquisar outro termo;
* mover Região do Mapa.

---

## 47. RB-INT-033 — Ordenação

A alteração de ordenação deverá:

* atualizar os resultados;
* preservar filtros;
* preservar termo;
* retornar ao início da lista quando necessário;
* manter o item selecionado apenas quando ainda válido.

---

# Parte VII — Lugares, Salvos e planejamento

## 48. RB-INT-034 — Abrir Detalhes do Lugar

Ao abrir os Detalhes:

* a origem deverá ser registrada;
* o Lugar deverá ficar selecionado;
* o conteúdo prioritário deverá aparecer primeiro;
* o carregamento parcial deverá ser permitido.

---

## 49. RB-INT-035 — Salvar Lugar

### Fluxo

```text
Não salvo
→ usuário seleciona Salvar
→ estado Salvando
→ sucesso
→ estado Salvo
```

### Falha

```text
Salvando
→ falha
→ retornar para Não salvo
→ mostrar erro
```

### Regras

* não redirecionar;
* não criar duplicação;
* atualizar todas as áreas;
* preservar contexto.

---

## 50. RB-INT-036 — Remover dos Salvos

Quando o Lugar não estiver planejado:

* remover imediatamente;
* oferecer Desfazer.

Quando estiver planejado:

* remover apenas dos Salvos;
* manter a Atividade;
* comunicar essa diferença.

---

## 51. RB-INT-037 — Adicionar ao Roteiro

Ao selecionar Adicionar ao Roteiro:

1. abrir seleção de Dia;
2. apresentar estado dos Dias;
3. permitir escolher;
4. permitir horário opcional;
5. verificar conflitos;
6. confirmar;
7. atualizar estados.

---

## 52. RB-INT-038 — Lugar já planejado

Quando um Lugar já estiver no Roteiro:

* o estado Planejado deverá ser mostrado;
* a ação principal poderá ser Ver no Roteiro;
* uma nova visita deverá exigir ação explícita.

---

## 53. RB-INT-039 — Estado Salvo e Planejado

Os estados deverão ser independentes.

Possibilidades:

* não salvo e não planejado;
* salvo e não planejado;
* não salvo e planejado;
* salvo e planejado.

A interface não deverá tratar Salvar e Planejar como equivalentes.

---

# Parte VIII — Mapa

## 54. RB-INT-040 — Carregamento do Mapa

Enquanto o Mapa carrega:

* controles principais poderão aparecer;
* uma estrutura provisória deverá ser apresentada;
* a lista deverá permanecer utilizável quando possível.

---

## 55. RB-INT-041 — Seleção de Marcador

Ao selecionar um Marcador:

* o Marcador deverá ficar destacado;
* o resumo correspondente deverá abrir;
* a lista deverá destacar o mesmo Lugar;
* o Mapa poderá ajustar o enquadramento sem ocultar o Marcador.

---

## 56. RB-INT-042 — Seleção pela lista

Ao selecionar um Lugar na lista:

* o Marcador correspondente deverá ser destacado;
* o Mapa poderá centralizar suavemente;
* o conteúdo não deverá ser reposicionado de forma abrupta.

---

## 57. RB-INT-043 — Movimento do Mapa

Ao mover o Mapa:

* a Região visível deverá ser atualizada;
* resultados não deverão mudar automaticamente sem indicação quando isso causar perda de contexto;
* poderá existir ação:

```text
Buscar nesta área
```

---

## 58. RB-INT-044 — Zoom

O zoom deverá:

* permitir agrupamento de Marcadores;
* preservar o contexto selecionado;
* possuir controles acessíveis;
* não depender apenas de gesto.

---

## 59. RB-INT-045 — Agrupamento de Marcadores

Ao selecionar um agrupamento:

* o Mapa poderá ampliar;
* os Lugares contidos poderão ser listados;
* o agrupamento deverá comunicar quantidade.

---

## 60. RB-INT-046 — Contexto do Mapa

Ao alternar entre:

* Todos;
* Explorar;
* Salvos;
* Roteiro;
* Dia;

o Mapa deverá:

* atualizar Marcadores;
* atualizar lista;
* atualizar rótulo;
* preservar enquadramento quando possível.

---

## 61. RB-INT-047 — Hospedagem no Mapa

A Hospedagem deverá:

* possuir símbolo próprio;
* permanecer identificável;
* apresentar resumo ao selecionar;
* não ser confundida com Lugar turístico.

---

## 62. RB-INT-048 — Falha do Mapa

Em falha:

* mostrar mensagem;
* oferecer nova tentativa;
* apresentar lista equivalente;
* permitir continuar sem o Mapa.

---

## 63. RB-INT-049 — Localização atual

A localização atual deverá ser utilizada apenas após permissão.

Estados:

* não solicitada;
* solicitando;
* concedida;
* negada;
* indisponível.

A negação não deverá bloquear o planejamento.

---

# Parte IX — Roteiro

## 64. RB-INT-050 — Seleção de Dia

Ao selecionar um Dia:

* o Dia deverá ficar ativo;
* Atividades deverão ser carregadas;
* alertas deverão aparecer;
* o Mapa do Dia deverá atualizar;
* a URL ou estado navegável poderá refletir a seleção.

---

## 65. RB-INT-051 — Estado do Dia

O Dia poderá estar:

* vazio;
* parcialmente planejado;
* planejado;
* com alertas;
* atual;
* passado;
* futuro.

Esses estados poderão coexistir.

---

## 66. RB-INT-052 — Abrir Atividade

Ao selecionar uma Atividade:

* abrir Detalhes;
* preservar Dia;
* destacar no Mapa, quando visível;
* apresentar ações contextuais.

---

## 67. RB-INT-053 — Criar Atividade manual

A criação manual deverá permitir:

* título;
* Dia;
* horário opcional;
* duração opcional;
* Localização opcional;
* observações.

A ausência de Lugar associado deverá ser clara.

---

## 68. RB-INT-054 — Editar Atividade

Ao abrir edição:

* dados atuais deverão estar preenchidos;
* alterações deverão ser locais;
* impacto deverá ser recalculado;
* salvamento deverá atualizar Deslocamentos e alertas.

---

## 69. RB-INT-055 — Remover Atividade

Ao remover:

* solicitar confirmação quando necessário;
* comunicar impacto;
* manter Lugar nos Salvos;
* recalcular sequência;
* recalcular Deslocamentos;
* preservar Dia.

---

## 70. RB-INT-056 — Reordenar por arrastar

Durante o arraste:

* o item deverá ser destacado;
* a posição de destino deverá ser visível;
* outros itens deverão ajustar posição;
* o scroll automático deverá ser controlado.

Ao soltar:

* a nova ordem deverá ser aplicada;
* Deslocamentos deverão ser recalculados;
* o salvamento deverá iniciar;
* falha deverá permitir recuperação.

---

## 71. RB-INT-057 — Reordenar sem arrastar

A alternativa acessível deverá permitir:

* mover para cima;
* mover para baixo;
* mover para o início;
* mover para o fim;
* escolher posição.

O resultado deverá ser equivalente ao arraste.

---

## 72. RB-INT-058 — Mover Atividade entre Dias

Ao mover:

1. abrir seleção de Dia;
2. indicar Dia atual;
3. permitir novo horário;
4. verificar conflito;
5. confirmar;
6. atualizar os dois Dias.

---

## 73. RB-INT-059 — Atividade sem horário

Atividades sem horário deverão:

* aparecer em seção própria;
* poder ser reordenadas;
* não gerar erro automaticamente;
* permitir definição posterior.

---

## 74. RB-INT-060 — Período livre

O Período livre poderá ser:

* flexível;
* bloqueado.

### Flexível

Pode receber sugestão mediante confirmação.

### Bloqueado

Não pode ser preenchido automaticamente.

---

## 75. RB-INT-061 — Deslocamentos

Deslocamentos deverão atualizar quando:

* Atividade for adicionada;
* horário mudar;
* ordem mudar;
* Dia mudar;
* transporte mudar;
* Hospedagem mudar.

Durante recálculo, o estado deverá ser identificado.

---

## 76. RB-INT-062 — Conflitos

Conflitos deverão aparecer no nível do elemento afetado.

Classificação:

* erro;
* risco;
* sugestão.

A seleção deverá levar à correção correspondente.

---

# Parte X — Geração de proposta

## 77. RB-INT-063 — Iniciar geração

Antes da geração, o sistema deverá apresentar:

* contexto utilizado;
* dados ausentes;
* limitações;
* impacto sobre o Roteiro atual.

---

## 78. RB-INT-064 — Estado de geração

Durante a geração:

* indicar progresso conceitual;
* informar que o Roteiro atual está preservado;
* evitar promessas de precisão;
* permitir cancelamento quando tecnicamente possível.

---

## 79. RB-INT-065 — Proposta disponível

A proposta deverá permanecer separada do Roteiro atual.

O usuário deverá poder:

* revisar;
* editar;
* aceitar;
* aceitar parcialmente;
* gerar novamente;
* descartar.

---

## 80. RB-INT-066 — Aceitar proposta

Ao aceitar:

* apresentar impacto quando houver Roteiro anterior;
* solicitar confirmação;
* aplicar alterações;
* atualizar Dias;
* recalcular alertas;
* informar sucesso.

---

## 81. RB-INT-067 — Aceitar parcialmente

A aceitação parcial deverá permitir selecionar:

* Dias;
* Atividades;
* blocos.

Itens não selecionados não deverão alterar o Roteiro atual.

---

## 82. RB-INT-068 — Descartar proposta

Descartar deverá:

* preservar o Roteiro anterior;
* fechar a proposta;
* retornar ao contexto de origem;
* pedir confirmação apenas quando houver edições não salvas na proposta.

---

## 83. RB-INT-069 — Gerar novamente

Ao gerar novamente:

* a proposta atual deverá ser substituída apenas após a nova conclusão;
* critérios alterados deverão ser visíveis;
* o Roteiro atual deverá permanecer preservado.

---

# Parte XI — Revisão de conflitos

## 84. RB-INT-070 — Abrir revisão

Ao abrir Revisão:

* analisar o Roteiro;
* apresentar carregamento;
* agrupar alertas;
* destacar severidade;
* indicar quantidade.

---

## 85. RB-INT-071 — Filtrar alertas

Filtros:

* todos;
* erros;
* riscos;
* sugestões.

A filtragem deverá preservar o alerta selecionado quando ainda válido.

---

## 86. RB-INT-072 — Corrigir alerta

Ao selecionar Corrigir:

* abrir a superfície adequada;
* manter o alerta como contexto;
* retornar à revisão após salvar;
* atualizar a análise.

---

## 87. RB-INT-073 — Ignorar risco

Riscos poderão ser ignorados quando permitido.

Ao ignorar:

* registrar decisão;
* manter possibilidade de restaurar;
* não esconder erros bloqueantes.

---

## 88. RB-INT-074 — Nenhum conflito conhecido

O estado deverá comunicar:

* que nenhum conflito foi identificado;
* que a análise depende dos dados disponíveis;
* que isso não representa garantia absoluta.

---

# Parte XII — Distância, deslocamento e rota

## 89. RB-INT-075 — Selecionar origem

Origens possíveis:

* Hospedagem;
* Atividade anterior;
* localização atual;
* outro Lugar;
* endereço.

A origem ativa deverá ser visível.

---

## 90. RB-INT-076 — Selecionar transporte

A seleção deverá atualizar:

* Tempo;
* Distância aplicável;
* rota;
* alertas;
* recomendações futuras.

---

## 91. RB-INT-077 — Calcular Distância

Estados:

* aguardando dados;
* calculando;
* disponível;
* estimado;
* indisponível;
* desatualizado.

---

## 92. RB-INT-078 — Abrir rota externa

Antes de abrir:

* confirmar origem e destino;
* utilizar aplicativo disponível;
* usar versão web como alternativa.

Ao retornar:

* preservar a tela;
* preservar Lugar ou Atividade;
* não reiniciar a navegação.

---

# Parte XIII — Configurações da Viagem

## 93. RB-INT-079 — Editar seção

Ao selecionar uma seção:

* abrir formulário correspondente;
* carregar valores;
* preservar demais seções;
* indicar alterações pendentes.

---

## 94. RB-INT-080 — Alteração estrutural

Alterações estruturais incluem:

* Destino;
* Período;
* Hospedagem;
* transporte predominante.

Antes de salvar:

* apresentar impacto;
* indicar dados que serão recalculados;
* informar possíveis conflitos;
* solicitar confirmação.

---

## 95. RB-INT-081 — Alterar Hospedagem

Após confirmação:

* atualizar referência;
* recalcular Distâncias;
* recalcular Deslocamentos;
* atualizar Recomendações;
* marcar dados temporariamente desatualizados;
* apresentar conclusão.

---

## 96. RB-INT-082 — Alterar Período

Ao reduzir o Período:

* identificar Dias removidos;
* identificar Atividades afetadas;
* impedir perda silenciosa;
* permitir revisar antes da aplicação.

Ao ampliar:

* criar novos Dias;
* manter planejamento existente.

---

## 97. RB-INT-083 — Alterar Destino

A alteração de Destino deverá ser tratada como ação de alto impacto.

Deverá:

* explicar incompatibilidades;
* revisar Hospedagem;
* revisar Lugares;
* revisar Atividades;
* exigir confirmação explícita.

---

## 98. RB-INT-084 — Excluir Viagem

A exclusão deverá:

* informar irreversibilidade;
* mostrar nome da Viagem;
* exigir confirmação;
* evitar acionamento acidental;
* retornar para Minhas Viagens.

---

# Parte XIV — Carregamento e falhas

## 99. RB-INT-085 — Carregamento de página

Utilizar quando a estrutura principal ainda não estiver disponível.

Deverá:

* preservar forma aproximada;
* evitar layout shift;
* apresentar conteúdo assim que disponível.

---

## 100. RB-INT-086 — Carregamento de seção

Utilizar quando apenas parte da tela estiver pendente.

O restante deverá continuar utilizável.

---

## 101. RB-INT-087 — Carregamento incremental

Utilizar em listas extensas.

Poderá ser acionado por:

* paginação;
* carregar mais;
* scroll progressivo.

A posição atual deverá ser preservada.

---

## 102. RB-INT-088 — Conteúdo parcial

Quando alguns dados falharem:

* mostrar dados disponíveis;
* identificar ausências;
* preservar ações possíveis;
* permitir nova tentativa.

---

## 103. RB-INT-089 — Falha de serviço externo

A falha deverá ficar restrita à capacidade afetada.

Exemplos:

* Mapa falhou, lista continua;
* rota falhou, Distância geográfica continua;
* IA falhou, edição manual continua;
* fotografias falharam, Detalhes continuam.

---

## 104. RB-INT-090 — Sem conexão

No MVP:

* informar indisponibilidade;
* preservar conteúdo já carregado;
* evitar perda silenciosa de alterações;
* permitir nova tentativa.

---

## 105. RB-INT-091 — Repetição de tentativa

A ação Tentar novamente deverá:

* preservar contexto;
* evitar duplicação;
* indicar novo processamento;
* atualizar apenas a área afetada quando possível.

---

# Parte XV — Acessibilidade de interação

## 106. RB-INT-092 — Navegação por teclado

O usuário deverá conseguir:

* acessar navegação;
* percorrer resultados;
* abrir Detalhes;
* aplicar filtros;
* selecionar Dia;
* editar;
* reordenar;
* confirmar;
* cancelar;
* operar Mapa por controles alternativos.

---

## 107. RB-INT-093 — Ordem de foco

A ordem deverá seguir a lógica do conteúdo, não apenas a posição visual.

Em múltiplos painéis:

```text
Navegação
→ controles da página
→ lista
→ Detalhes
→ Mapa complementar
```

---

## 108. RB-INT-094 — Anúncios dinâmicos

Mudanças relevantes deverão ser anunciadas:

* filtro aplicado;
* Lugar salvo;
* Atividade adicionada;
* Dia alterado;
* erro;
* carregamento concluído;
* conflito identificado;
* proposta pronta.

---

## 109. RB-INT-095 — Tecla Escape

Escape deverá fechar, quando aplicável:

* modal;
* drawer;
* bottom sheet;
* menu;
* popover.

Não deverá descartar alterações sem confirmação.

---

## 110. RB-INT-096 — Alternativa a gestos

Gestos deverão possuir alternativa.

Exemplos:

| Gesto              | Alternativa                |
| ------------------ | -------------------------- |
| Arrastar Atividade | Mover para cima ou posição |
| Pinça no Mapa      | Controles de zoom          |
| Deslizar sheet     | Botão expandir ou fechar   |
| Swipe para remover | Ação em menu               |

---

## 111. RB-INT-097 — Redução de movimento

Quando o usuário preferir movimento reduzido:

* transições deverão ser simplificadas;
* animações de deslocamento deverão ser reduzidas;
* conteúdo não deverá depender de movimento.

---

# Parte XVI — Movimento e transições

## 112. Propósito das transições

As transições deverão comunicar:

* relação espacial;
* mudança de estado;
* abertura;
* fechamento;
* continuidade.

Não deverão ser apenas decorativas.

---

## 113. RB-INT-098 — Transição de página

Deverá ser discreta e rápida.

O conteúdo principal deverá receber prioridade sobre animações.

---

## 114. RB-INT-099 — Abertura de bottom sheet

A abertura poderá ocorrer de baixo para cima.

O movimento deverá:

* preservar contexto;
* possuir duração curta;
* respeitar redução de movimento.

---

## 115. RB-INT-100 — Painel lateral

O painel poderá entrar pela lateral correspondente.

A página base não deverá se deslocar de forma confusa.

---

## 116. RB-INT-101 — Atualização de lista e Mapa

A atualização deverá:

* evitar piscadas;
* preservar itens estáveis;
* destacar mudanças;
* não reposicionar sem necessidade.

---

## 117. RB-INT-102 — Reordenação

O movimento deverá comunicar a nova posição.

Ao concluir, o item poderá receber destaque temporário.

---

# Parte XVII — Comportamento mobile

## 118. Navegação móvel

A navegação inferior deverá:

* respeitar áreas seguras;
* não cobrir conteúdo;
* manter rótulos;
* indicar área ativa.

---

## 119. Ações fixas

Ações poderão permanecer fixas quando:

* forem essenciais;
* a tela for longa;
* a decisão depender do conteúdo atual.

Exemplo:

```text
Salvar
Adicionar ao Roteiro
```

A área fixa não deverá ocultar conteúdo.

---

## 120. Teclado virtual

Ao abrir o teclado:

* o campo ativo deverá permanecer visível;
* ações importantes deverão ser acessíveis;
* o layout não deverá quebrar;
* o teclado não deverá cobrir mensagens de erro.

---

## 121. Gestos de sistema

A interação deverá respeitar:

* gesto de voltar;
* áreas seguras;
* barras do navegador;
* orientação.

---

## 122. Orientação

O MVP deverá priorizar orientação vertical.

Orientação horizontal poderá ser suportada, mas não deverá ser necessária para fluxos centrais.

---

# Parte XVIII — Comportamento desktop

## 123. Múltiplos painéis

Em telas maiores:

* lista, Detalhes e Mapa poderão coexistir;
* seleção deverá sincronizar painéis;
* foco deverá permanecer previsível;
* painéis deverão possuir largura mínima utilizável.

---

## 124. Redimensionamento

Quando a largura diminuir:

* o painel menos prioritário deverá recolher;
* Detalhes poderão virar drawer;
* lista e Mapa poderão alternar;
* ações não deverão desaparecer.

---

## 125. Ponteiro

Interações com ponteiro poderão utilizar hover como complemento.

Hover nunca deverá ser obrigatório.

---

## 126. Atalhos

Atalhos de teclado poderão ser adicionados futuramente.

Eles não deverão substituir a interface visível.

---

# Parte XIX — Instrumentação de interação

## 127. Objetivo

As interações críticas poderão ser instrumentadas para avaliar:

* conclusão;
* abandono;
* falha;
* dificuldade;
* retorno;
* retrabalho.

---

## 128. Eventos prioritários

Eventos conceituais:

* Viagem iniciada;
* Viagem criada;
* Lugar pesquisado;
* filtro aplicado;
* Lugar salvo;
* Lugar adicionado ao Roteiro;
* Atividade editada;
* Atividade movida;
* proposta gerada;
* proposta aceita;
* conflito corrigido;
* rota aberta.

---

## 129. Regras de instrumentação

A instrumentação deverá:

* respeitar privacidade;
* evitar conteúdo sensível;
* utilizar nomes consistentes;
* diferenciar intenção e sucesso;
* registrar falha quando relevante.

---

# Parte XX — Matriz de interação e superfícies

## 130. Navegação e estrutura

| Especificação           | Superfícies principais            |
| ----------------------- | --------------------------------- |
| RB-INT-001 a RB-INT-005 | Navegação global e contextual     |
| RB-INT-006 a RB-INT-010 | Páginas, modais, sheets e painéis |

---

## 131. Feedback e formulários

| Especificação           | Superfícies principais           |
| ----------------------- | -------------------------------- |
| RB-INT-011 a RB-INT-015 | Todas as superfícies interativas |
| RB-INT-016 a RB-INT-025 | Criação, edição e Configurações  |

---

## 132. Descoberta

| Especificação           | Superfícies principais          |
| ----------------------- | ------------------------------- |
| RB-INT-026 a RB-INT-033 | Explorar, pesquisa e filtros    |
| RB-INT-034 a RB-INT-039 | Detalhes, Salvos e planejamento |

---

## 133. Mapa e Roteiro

| Especificação           | Superfícies principais |
| ----------------------- | ---------------------- |
| RB-INT-040 a RB-INT-049 | Mapa                   |
| RB-INT-050 a RB-INT-062 | Roteiro e Atividades   |

---

## 134. IA, revisão e Configurações

| Especificação           | Superfícies principais |
| ----------------------- | ---------------------- |
| RB-INT-063 a RB-INT-069 | Proposta de Roteiro    |
| RB-INT-070 a RB-INT-074 | Revisão de Conflitos   |
| RB-INT-075 a RB-INT-078 | Distância e rota       |
| RB-INT-079 a RB-INT-084 | Configurações          |

---

# Parte XXI — Critérios de aceite

## 135. Navegação

* a área ativa está identificada;
* Voltar preserva contexto;
* a troca de Viagem limpa contexto inválido;
* links externos não causam perda inesperada.

---

## 136. Formulários

* campos possuem rótulos;
* erros são específicos;
* dados são preservados após falha;
* alterações não salvas são protegidas;
* ações duplicadas são evitadas.

---

## 137. Feedback

* toda ação produz resposta;
* salvamento possui estado;
* falhas possuem recuperação;
* sucesso é perceptível;
* feedback crítico não desaparece automaticamente.

---

## 138. Mapa

* lista e Mapa permanecem sincronizados;
* Marcadores são selecionáveis;
* a Hospedagem é distinta;
* existe alternativa ao Mapa;
* a falha não bloqueia o produto.

---

## 139. Roteiro

* Dia selecionado é preservado;
* reordenação possui alternativa;
* conflitos aparecem no elemento afetado;
* Deslocamentos são recalculados;
* remover Atividade não remove Salvo.

---

## 140. Automação

* o Roteiro atual é preservado;
* proposta é revisável;
* o usuário mantém decisão final;
* limitações são apresentadas;
* falha não impede edição manual.

---

## 141. Acessibilidade

* foco é visível;
* modais gerenciam foco;
* atualizações são anunciadas;
* gestos possuem alternativas;
* estados não dependem apenas de cor.

---

# Parte XXII — Validação

## 142. Testes de usabilidade prioritários

1. Criar Viagem.
2. Pesquisar Lugar.
3. Aplicar filtro.
4. Salvar Lugar.
5. Adicionar ao Roteiro.
6. Escolher Dia.
7. Editar Atividade.
8. Reordenar sem arrastar.
9. Consultar Mapa.
10. Corrigir conflito.
11. Gerar proposta.
12. Alterar Hospedagem.

---

## 143. Perguntas de validação

* O usuário percebe quando uma ação foi concluída?
* Entende quando algo ainda está salvando?
* Consegue recuperar-se de erro?
* Sabe como fechar uma superfície?
* Consegue voltar sem perder contexto?
* Distingue Salvo de Planejado?
* Entende conflitos?
* Percebe limitações da automação?
* Consegue operar sem Mapa?
* Consegue reordenar sem gesto?
* Entende o impacto de alterar Hospedagem?
* Consegue concluir no celular?

---

## 144. Indicadores

* taxa de conclusão;
* tempo de tarefa;
* erro por fluxo;
* repetição de clique;
* abandono;
* retorno inesperado;
* falha de salvamento;
* uso de Desfazer;
* correção de conflito;
* aceitação de proposta;
* uso da alternativa ao Mapa.

---

# Parte XXIII — Governança

## 145. Inclusão de nova interação

Uma nova interação deverá ser documentada quando:

* alterar comportamento;
* introduzir decisão;
* criar novo estado;
* afetar acessibilidade;
* alterar rastreabilidade;
* exigir teste específico.

---

## 146. Alteração de interação

Uma alteração deverá revisar:

* Fluxos do Usuário;
* Inventário de Telas;
* Wireframes;
* Requisitos;
* Design System;
* testes.

---

## 147. Consistência

Interações equivalentes deverão utilizar padrões equivalentes.

Exemplos:

* todos os modais fecham de forma consistente;
* todos os formulários tratam erro de maneira equivalente;
* todas as ações de salvamento possuem estados equivalentes;
* todas as listas preservam contexto ao retornar.

---

## 148. Uso por agentes de IA

Agentes que criem protótipos ou código deverão:

* seguir estas especificações;
* não inventar estados;
* preservar feedback;
* tratar falhas;
* implementar alternativas acessíveis;
* respeitar diferenças mobile e desktop;
* não tornar a automação obrigatória;
* manter o usuário no controle;
* preservar contexto de navegação.

---

## 149. Checklist de revisão

Antes de aprovar este documento, verificar:

* estados fundamentais estão definidos;
* navegação está definida;
* modais e sheets estão definidos;
* feedback está definido;
* formulários estão definidos;
* pesquisa e filtros estão definidos;
* Salvos estão definidos;
* planejamento está definido;
* Mapa está definido;
* Roteiro está definido;
* geração está definida;
* conflitos estão definidos;
* Configurações estão definidas;
* carregamento está definido;
* falhas estão definidas;
* acessibilidade está definida;
* mobile está definido;
* desktop está definido;
* instrumentação está contemplada;
* critérios de aceite estão definidos;
* rastreabilidade está preservada.

---

## 150. Declaração final

As Especificações de Interação do RouteBook definem como a experiência deverá responder às ações do usuário.

Elas estabelecem comportamentos consistentes para:

* navegação;
* formulários;
* feedback;
* Descoberta;
* Salvos;
* Mapa;
* Roteiro;
* automação;
* conflitos;
* Configurações;
* falhas;
* acessibilidade.

O usuário deverá perceber continuamente:

* onde está;
* o que pode fazer;
* o que aconteceu;
* o que ainda está em andamento;
* o que falhou;
* como recuperar;
* qual será o impacto de uma decisão.

Essas especificações deverão ser aplicadas pelo Design System, pelos protótipos, pela implementação frontend e pelos testes do produto.
