---

id: RB-UX-001

title: Arquitetura da Informação
description: Define a organização estrutural da experiência do RouteBook, incluindo áreas do produto, hierarquia de conteúdo, navegação, relações entre informações e modelos de acesso.

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
- information-architecture
- navigation
- content-structure
- travel-planning
- mobile-first

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

next_documents:

- RB-UX-002
- RB-UX-003
- RB-UX-004
- RB-DOM-001
- RB-ARC-001

ai_context:
priority: high
index: true
---

# RouteBook — Arquitetura da Informação

## 1. Propósito deste documento

Este documento define a Arquitetura da Informação do RouteBook.

Seu objetivo é organizar as informações, áreas, conteúdos e caminhos de navegação necessários para que o usuário consiga:

* criar uma Viagem;
* compreender seu contexto;
* descobrir Lugares;
* visualizar localização e Distâncias;
* salvar opções;
* construir um Roteiro;
* revisar decisões;
* consultar o planejamento;
* adaptar a Viagem.

A Arquitetura da Informação deverá orientar:

* navegação global;
* navegação contextual;
* hierarquia de telas;
* agrupamento de conteúdo;
* rotulagem;
* organização de páginas;
* fluxos de usuário;
* inventário de telas;
* wireframes;
* responsividade;
* acessibilidade;
* implementação da interface.

Este documento define como o conteúdo do produto deverá ser estruturado.

Ele não define:

* aparência visual final;
* componentes definitivos;
* identidade visual;
* código;
* framework;
* animações;
* layout em nível de pixel.

---

## 2. Relação com outros documentos

A Arquitetura da Informação deriva de:

```text
Visão e Princípios
→ definem o propósito da experiência

Escopo e MVP
→ definem o que deve existir

Personas
→ definem para quem a experiência é organizada

Jornadas
→ definem os caminhos ponta a ponta

Casos de Uso
→ definem objetivos específicos

Requisitos
→ definem comportamentos e restrições

Arquitetura da Informação
→ organiza áreas, conteúdos e caminhos de acesso
```

A partir deste documento serão detalhados:

* fluxos de usuário;
* inventário de telas;
* estrutura de navegação;
* wireframes;
* Design System;
* contratos entre interface e domínio.

---

## 3. Princípios da Arquitetura da Informação

A organização do RouteBook deverá preservar os seguintes princípios:

1. A Viagem é o contexto central da experiência.
2. O usuário deverá saber em qual Viagem está.
3. Descoberta, Mapa, Salvos e Roteiro deverão funcionar como partes conectadas.
4. O Mapa não deverá ser uma área isolada do restante do produto.
5. A navegação deverá ser simples em dispositivos móveis.
6. O usuário não deverá precisar conhecer a estrutura interna do sistema.
7. Informações deverão aparecer no momento em que forem relevantes.
8. A mesma informação não deverá ser duplicada de forma inconsistente.
9. Estados como Salvo e Planejado deverão ser visíveis em todas as áreas relevantes.
10. O produto deverá permitir planejamento parcial.
11. Informações críticas deverão possuir alternativa ao Mapa.
12. A estrutura deverá permitir crescimento sem reorganização completa do produto.

---

## 4. Modelo mental principal

O RouteBook deverá ser compreendido pelo usuário como:

```text
Minhas Viagens
└── Viagem selecionada
    ├── Visão Geral
    ├── Explorar
    ├── Mapa
    ├── Roteiro
    ├── Salvos
    └── Configurações
```

A Viagem selecionada funciona como contêiner principal.

Todas as ações de Descoberta, planejamento e consulta deverão ocorrer dentro de uma Viagem.

---

## 5. Objetos centrais da informação

A Arquitetura da Informação deverá organizar os seguintes objetos principais:

### Viagem

Contêiner central do planejamento.

### Destino

Localidade principal da Viagem.

### Hospedagem

Referência geográfica principal.

### Dia da Viagem

Unidade temporal do Roteiro.

### Lugar

Local geográfico que pode ser explorado, salvo ou planejado.

### Atividade

Item inserido em um Dia da Viagem.

### Período livre

Intervalo intencionalmente não preenchido.

### Recomendação

Sugestão contextual apresentada pelo produto.

### Lugar salvo

Lugar mantido como opção de interesse.

### Roteiro

Organização temporal e geográfica das Atividades.

### Contexto da Viagem

Conjunto de informações utilizadas para personalização.

---

# Parte I — Estrutura global

## 6. Nível global do produto

O nível global deverá permitir:

* acessar a página inicial;
* visualizar Viagens existentes;
* criar uma nova Viagem;
* abrir uma Viagem;
* acessar configurações gerais;
* acessar perfil ou conta, quando aplicável.

Estrutura inicial:

```text
RouteBook
├── Início
├── Minhas Viagens
├── Criar Viagem
├── Conta
└── Ajuda
```

No MVP, Início e Minhas Viagens poderão compartilhar a mesma página.

---

## 7. Nível contextual da Viagem

Ao acessar uma Viagem, o usuário deverá entrar em um espaço contextual próprio.

Estrutura:

```text
Viagem
├── Visão Geral
├── Explorar
├── Mapa
├── Roteiro
├── Salvos
└── Configurações
```

Todas essas áreas deverão compartilhar:

* identificação da Viagem;
* Destino;
* Período;
* contexto de navegação;
* acesso às áreas principais.

---

## 8. Hierarquia principal

A hierarquia recomendada é:

```text
Nível 0 — Produto
Nível 1 — Lista de Viagens
Nível 2 — Viagem selecionada
Nível 3 — Área funcional
Nível 4 — Conteúdo ou objeto
Nível 5 — Ação ou detalhe contextual
```

Exemplo:

```text
RouteBook
→ Minhas Viagens
→ Viagem Pipa
→ Explorar
→ Restaurante
→ Detalhes do Lugar
```

---

# Parte II — Navegação global

## 9. Página inicial

A página inicial deverá orientar o usuário para a ação mais relevante.

### Quando não existirem Viagens

Deverá apresentar:

* proposta de valor;
* ação Criar Viagem;
* breve explicação do processo;
* Estado vazio orientativo.

### Quando existirem Viagens

Deverá apresentar:

* Viagens futuras;
* Viagem em andamento;
* Viagens recentes;
* ação Criar Viagem.

### Prioridade do MVP

Alta.

---

## 10. Minhas Viagens

A área Minhas Viagens deverá permitir:

* visualizar Viagens;
* identificar estado temporal;
* abrir uma Viagem;
* criar nova Viagem;
* diferenciar Viagens futuras, atuais e concluídas.

Cada item deverá apresentar:

* nome;
* Destino;
* Período;
* quantidade de Dias;
* estado;
* próxima informação relevante.

---

## 11. Criar Viagem

A criação deverá ser um fluxo orientado, separado da navegação principal da Viagem.

Estrutura inicial:

```text
Criar Viagem
├── Destino
├── Datas
├── Hospedagem
├── Viajantes
└── Confirmação
```

Preferências adicionais não deverão bloquear a criação.

Após a conclusão, o usuário deverá entrar na Viagem criada.

---

## 12. Conta e configurações gerais

Quando houver autenticação, a área poderá incluir:

* dados da conta;
* idioma;
* privacidade;
* exclusão de dados;
* sessão;
* preferências globais.

Configurações relacionadas a uma Viagem específica não deverão ser misturadas com configurações gerais.

---

# Parte III — Navegação da Viagem

## 13. Áreas principais

A navegação principal dentro de uma Viagem deverá possuir cinco áreas centrais:

1. Visão Geral;
2. Explorar;
3. Mapa;
4. Roteiro;
5. Salvos.

Configurações da Viagem deverão estar disponíveis como ação secundária.

---

## 14. Visão Geral

A Visão Geral deverá responder:

* Qual é a Viagem?
* Quando ela acontece?
* Onde será a Hospedagem?
* O que já foi planejado?
* O que falta fazer?
* Qual é o próximo passo?
* Qual é a situação do Dia atual?

Estrutura recomendada:

```text
Visão Geral
├── Cabeçalho da Viagem
├── Resumo do contexto
├── Próximo passo
├── Resumo do Roteiro
├── Lugares salvos
├── Alertas
└── Ações rápidas
```

---

## 15. Conteúdo da Visão Geral

### Cabeçalho

* nome;
* Destino;
* Período;
* quantidade de Viajantes;
* acesso às configurações.

### Resumo do contexto

* Hospedagem;
* transporte;
* orçamento;
* Ritmo da Viagem;
* principais Interesses.

### Próximo passo

Deverá variar conforme o estado.

Exemplos:

* completar Hospedagem;
* explorar Lugares;
* revisar Salvos;
* adicionar Atividades;
* revisar conflito;
* consultar Dia atual.

### Resumo do Roteiro

* quantidade de Dias;
* Dias com Atividades;
* Dias vazios;
* alertas;
* próxima Atividade.

### Salvos

* quantidade;
* itens recentes;
* acesso à área completa.

---

## 16. Explorar

A área Explorar deverá concentrar Descoberta, pesquisa, filtros e avaliação inicial de Lugares.

Estrutura:

```text
Explorar
├── Pesquisa
├── Categorias
├── Filtros
├── Ordenação
├── Lista de resultados
├── Alternância lista/mapa
└── Detalhes do Lugar
```

---

## 17. Pesquisa

A pesquisa deverá estar associada ao Destino da Viagem.

Deverá permitir:

* pesquisar por nome;
* pesquisar por categoria;
* pesquisar por Região;
* corrigir termo;
* identificar resultados fora do Destino.

A pesquisa não deverá remover o contexto da Viagem.

---

## 18. Categorias de Exploração

Categorias iniciais:

* Praias;
* Restaurantes;
* Bares;
* Vida noturna;
* Passeios;
* Atrações;
* Natureza;
* Cultura.

As categorias deverão ser representadas por rótulos claros.

Categorias poderão funcionar como:

* atalho;
* filtro;
* seção;
* agrupamento.

---

## 19. Filtros

Os filtros mínimos do MVP são:

* Categoria;
* Distância;
* Faixa de preço.

Filtros futuros poderão incluir:

* avaliação;
* aberto no momento;
* acessibilidade;
* adequado para crianças;
* salvo;
* planejado;
* duração;
* Região.

Os filtros ativos deverão permanecer visíveis.

---

## 20. Lista de resultados

Cada item deverá apresentar informações suficientes para avaliação rápida.

Estrutura mínima:

```text
Cartão de Lugar
├── Fotografia
├── Nome
├── Categoria
├── Avaliação
├── Distância
├── Faixa de preço
├── Justificativa resumida
├── Estado salvo
├── Estado planejado
└── Ações rápidas
```

Ações rápidas:

* salvar;
* adicionar ao Roteiro;
* abrir Detalhes;
* visualizar no Mapa.

---

## 21. Detalhes do Lugar

Os Detalhes do Lugar deverão ser acessíveis a partir de:

* Explorar;
* Mapa;
* Salvos;
* Roteiro;
* Recomendação;
* pesquisa.

Estrutura:

```text
Detalhes do Lugar
├── Identificação
├── Fotografias
├── Informações principais
├── Localização
├── Distância e deslocamento
├── Horários
├── Faixa de preço
├── Justificativa
├── Fonte e atualização
└── Ações
```

Ações prioritárias:

* salvar;
* adicionar ao Roteiro;
* visualizar no Mapa;
* abrir rota.

---

## 22. Comportamento dos Detalhes

Os Detalhes poderão ser apresentados como:

* página;
* painel lateral;
* modal amplo;
* painel inferior móvel.

A escolha dependerá do dispositivo.

O conteúdo deverá preservar uma URL ou estado navegável quando tecnicamente aplicável.

---

# Parte IV — Mapa

## 23. Papel do Mapa

O Mapa deverá funcionar como representação geográfica da Viagem.

Ele não deverá ser apenas uma visualização decorativa.

Deverá apoiar:

* Descoberta;
* comparação;
* proximidade;
* compreensão regional;
* planejamento;
* revisão do Roteiro.

---

## 24. Estrutura da área Mapa

```text
Mapa
├── Mapa interativo
├── Hospedagem
├── Marcadores
├── Controles de categoria
├── Filtros
├── Resumo do Lugar selecionado
├── Alternância de contexto
└── Visualização em lista
```

---

## 25. Contextos do Mapa

O Mapa poderá possuir diferentes contextos:

### Mapa da Viagem

Mostra elementos gerais da Viagem.

### Mapa da Exploração

Mostra resultados da Descoberta.

### Mapa de Salvos

Mostra Lugares salvos.

### Mapa do Roteiro

Mostra Atividades planejadas.

### Mapa do Dia

Mostra Atividades de um Dia específico.

A mudança de contexto deverá ser clara.

---

## 26. Elementos do Mapa

O Mapa deverá poder representar:

* Hospedagem;
* Lugares;
* Lugares salvos;
* Lugares planejados;
* Atividades;
* sequência do Dia;
* Região pesquisada;
* agrupamentos de Marcadores.

---

## 27. Painel associado ao Mapa

A seleção de um Marcador deverá apresentar um resumo associado.

Conteúdo mínimo:

* nome;
* categoria;
* distância;
* Faixa de preço;
* estado;
* ações principais.

O usuário deverá conseguir abrir os Detalhes completos.

---

## 28. Alternativa ao Mapa

Toda informação crítica deverá estar disponível em lista.

A área Mapa deverá possuir:

* opção de Visualização em lista;
* navegação por teclado quando tecnicamente possível;
* rótulos acessíveis;
* alternativa textual para Distâncias e Lugares.

---

# Parte V — Roteiro

## 29. Papel do Roteiro

O Roteiro deverá representar a organização temporal da Viagem.

Ele deverá responder:

* O que está planejado?
* Em qual dia?
* Em qual ordem?
* Em qual horário?
* Quanto tempo deve durar?
* Qual é o deslocamento?
* Onde existem conflitos?
* Onde existem Períodos livres?

---

## 30. Estrutura da área Roteiro

```text
Roteiro
├── Visão geral dos Dias
├── Dia selecionado
├── Atividades
├── Períodos livres
├── Deslocamentos
├── Alertas
├── Mapa do Dia
└── Ações de edição
```

---

## 31. Navegação entre Dias

O usuário deverá conseguir:

* visualizar todos os Dias;
* identificar o Dia selecionado;
* identificar o Dia atual;
* avançar e voltar entre Dias;
* acessar diretamente uma data;
* perceber Dias vazios;
* perceber Dias com alertas.

Em dispositivos móveis, poderá ser utilizado:

* seletor horizontal;
* lista de Dias;
* calendário simplificado;
* menu de datas.

---

## 32. Estrutura de um Dia da Viagem

```text
Dia da Viagem
├── Data
├── Resumo
├── Atividades
├── Períodos livres
├── Deslocamentos
├── Alertas
├── Mapa
└── Ações
```

---

## 33. Atividade no Roteiro

Cada Atividade deverá apresentar:

* título;
* Lugar, quando associado;
* horário;
* duração;
* categoria;
* Localização resumida;
* deslocamento anterior;
* estado de alerta;
* ações de edição.

Ações possíveis:

* editar;
* reordenar;
* mover;
* remover;
* abrir Detalhes;
* abrir rota.

---

## 34. Atividades sem horário

Atividades sem horário deverão aparecer em agrupamento compreensível.

Possibilidades:

* seção “Sem horário”;
* posição flexível no Dia;
* bloco “A definir”.

Elas não deverão parecer erro.

---

## 35. Períodos livres

Períodos livres deverão possuir representação explícita.

Informações possíveis:

* horário;
* duração;
* estado bloqueado;
* observação;
* ação para adicionar sugestão.

Períodos livres não deverão ser tratados como lacunas obrigatórias.

---

## 36. Deslocamentos

Os Deslocamentos deverão aparecer entre Atividades relacionadas.

Conteúdo:

* origem;
* destino;
* Meio de transporte;
* Distância;
* Tempo estimado;
* estado de indisponibilidade.

O Deslocamento deverá ser entendido como parte do Roteiro, não como informação separada.

---

## 37. Alertas do Roteiro

Alertas deverão aparecer:

* no resumo da Viagem;
* no Dia afetado;
* na Atividade relacionada;
* na revisão geral.

Categorias:

* erro;
* risco;
* sugestão.

A navegação deverá levar o usuário ao elemento afetado.

---

## 38. Ações da área Roteiro

A área deverá permitir:

* adicionar Lugar;
* criar Atividade manual;
* adicionar Período livre;
* gerar proposta;
* revisar Roteiro;
* visualizar Mapa do Dia;
* editar Dia;
* mover Atividades.

---

# Parte VI — Salvos

## 39. Papel da área Salvos

Salvos deverá funcionar como espaço intermediário entre Descoberta e planejamento.

Ela deverá responder:

* Quais Lugares chamaram minha atenção?
* Quais ainda não foram planejados?
* Onde estão?
* Quais posso adicionar ao Roteiro?

---

## 40. Estrutura da área Salvos

```text
Salvos
├── Resumo
├── Filtros
├── Lista
├── Mapa
├── Estados
└── Ações
```

---

## 41. Organização dos Salvos

Os Salvos poderão ser organizados por:

* categoria;
* Região;
* distância;
* estado planejado;
* data de salvamento;
* relevância.

No MVP, deverá existir pelo menos:

* lista completa;
* filtro por categoria;
* identificação de planejado ou não planejado.

---

## 42. Estados na área Salvos

Um Lugar salvo poderá estar:

* salvo e não planejado;
* salvo e planejado;
* temporariamente indisponível;
* com dados incompletos.

A diferença entre Salvo e Planejado deverá ser clara.

---

## 43. Ações em Salvos

O usuário deverá conseguir:

* abrir Detalhes;
* visualizar no Mapa;
* adicionar ao Roteiro;
* remover dos Salvos;
* filtrar;
* comparar Distâncias.

---

## 44. Estado vazio de Salvos

Quando não existirem Salvos, a área deverá:

* explicar sua finalidade;
* direcionar para Explorar;
* sugerir categorias iniciais.

---

# Parte VII — Configurações da Viagem

## 45. Papel das configurações

Configurações da Viagem deverão concentrar informações que alteram o contexto geral.

Elas não deverão ser utilizadas para ações frequentes do Roteiro.

---

## 46. Estrutura das configurações

```text
Configurações da Viagem
├── Informações gerais
├── Destino
├── Período
├── Hospedagem
├── Viajantes
├── Interesses
├── Orçamento
├── Transporte
├── Ritmo
├── Restrições
└── Ações da Viagem
```

---

## 47. Informações gerais

* nome da Viagem;
* Destino;
* datas;
* quantidade de Viajantes;
* fuso horário, quando aplicável.

---

## 48. Hospedagem

Deverá permitir:

* visualizar referência atual;
* alterar;
* identificar estado provisório;
* visualizar no Mapa;
* compreender impacto da mudança.

---

## 49. Preferências

Deverá incluir:

* Interesses;
* orçamento;
* transporte;
* Ritmo;
* Restrições;
* Perfil do Grupo.

A interface deverá indicar que essas informações são editáveis e progressivas.

---

## 50. Ações sensíveis

Ações como:

* alterar Destino;
* reduzir Período;
* excluir Viagem;

deverão possuir tratamento separado, explicação de impacto e confirmação.

---

# Parte VIII — Navegação móvel

## 51. Estrutura mobile-first

Em dispositivos móveis, a navegação principal da Viagem deverá priorizar acesso rápido às áreas mais utilizadas.

Modelo recomendado:

```text
Navegação inferior
├── Viagem
├── Explorar
├── Mapa
├── Roteiro
└── Salvos
```

Configurações poderão estar em:

* menu superior;
* menu contextual;
* cabeçalho da Viagem.

---

## 52. Rótulos da navegação móvel

Rótulos deverão ser curtos e compreensíveis.

Recomendação:

* Viagem;
* Explorar;
* Mapa;
* Roteiro;
* Salvos.

“Visão Geral” poderá ser representada como “Viagem” na navegação móvel para reduzir complexidade verbal.

---

## 53. Persistência da navegação

A navegação principal deverá permanecer acessível nos fluxos centrais.

Páginas de detalhe poderão ocultar temporariamente a navegação quando necessário, desde que o retorno seja evidente.

---

## 54. Voltar e preservar contexto

Ao retornar de Detalhes para uma lista ou Mapa, o produto deverá preservar, quando possível:

* posição;
* filtros;
* pesquisa;
* Região do Mapa;
* Dia selecionado;
* contexto de origem.

---

## 55. Ações principais em mobile

Ações recorrentes poderão permanecer fixadas ou destacadas.

Exemplos:

* salvar;
* adicionar ao Roteiro;
* abrir rota;
* editar Atividade.

---

# Parte IX — Navegação em telas maiores

## 56. Estrutura desktop

Em telas maiores, a aplicação poderá utilizar:

* barra lateral;
* cabeçalho contextual;
* conteúdo em múltiplos painéis;
* Mapa e lista simultâneos;
* Roteiro e Mapa do Dia simultâneos.

---

## 57. Modelo de navegação lateral

Estrutura recomendada:

```text
Viagem Pipa
├── Visão Geral
├── Explorar
├── Mapa
├── Roteiro
├── Salvos
└── Configurações
```

A identificação da Viagem deverá permanecer visível.

---

## 58. Uso de múltiplos painéis

Telas maiores poderão apresentar:

### Explorar

* lista à esquerda;
* Mapa à direita;
* Detalhes em painel contextual.

### Roteiro

* Dias à esquerda;
* Atividades ao centro;
* Mapa ou Detalhes à direita.

### Salvos

* lista e Mapa lado a lado.

A estrutura deverá evitar excesso de densidade.

---

# Parte X — Navegação contextual

## 59. Ações contextuais

Ações deverão aparecer próximas ao objeto relacionado.

Exemplos:

* Salvar no Cartão do Lugar;
* editar na Atividade;
* abrir rota no Detalhe;
* mover no item do Roteiro;
* remover em Salvos.

---

## 60. Ações globais e contextuais

### Globais

* criar Viagem;
* abrir Viagem;
* acessar conta.

### Contextuais da Viagem

* explorar;
* gerar proposta;
* editar Preferências;
* revisar Roteiro.

### Contextuais do objeto

* salvar Lugar;
* editar Atividade;
* mover item;
* abrir rota.

As ações não deverão ser misturadas sem hierarquia.

---

## 61. Menus de contexto

Menus secundários poderão agrupar ações menos frequentes.

Exemplo de Atividade:

* editar;
* mover;
* duplicar futuramente;
* remover.

A ação principal não deverá ficar escondida em menu quando houver espaço e relevância.

---

# Parte XI — Relações entre áreas

## 62. Explorar para Detalhes

```text
Explorar
→ selecionar Lugar
→ abrir Detalhes
```

O retorno deverá preservar o contexto de Exploração.

---

## 63. Detalhes para Salvos

```text
Detalhes
→ Salvar
→ estado atualizado
→ permanecer nos Detalhes
```

O usuário não deverá ser redirecionado obrigatoriamente para Salvos.

---

## 64. Detalhes para Roteiro

```text
Detalhes
→ Adicionar ao Roteiro
→ selecionar Dia
→ confirmar
→ permanecer ou abrir o Dia
```

O usuário deverá escolher entre continuar explorando ou visualizar o Roteiro.

---

## 65. Salvos para Roteiro

```text
Salvos
→ selecionar Lugar
→ Adicionar ao Roteiro
→ selecionar Dia
→ confirmar
```

O estado planejado deverá ser atualizado na área Salvos.

---

## 66. Roteiro para Detalhes

```text
Roteiro
→ selecionar Atividade
→ abrir Detalhes do Lugar
```

O retorno deverá preservar o Dia selecionado.

---

## 67. Roteiro para Mapa

```text
Roteiro
→ visualizar Dia no Mapa
→ Mapa contextual do Dia
```

O contexto do Dia deverá permanecer claro.

---

## 68. Mapa para Detalhes

```text
Mapa
→ selecionar Marcador
→ visualizar resumo
→ abrir Detalhes
```

---

## 69. Mapa para Roteiro

Quando um Lugar estiver planejado, o resumo no Mapa deverá permitir abrir a Atividade correspondente.

---

# Parte XII — Rotulagem

## 70. Princípios de rotulagem

Os rótulos deverão ser:

* claros;
* consistentes;
* curtos;
* orientados à ação;
* alinhados ao Glossário;
* compreensíveis sem contexto técnico.

---

## 71. Rótulos oficiais das áreas

| Conceito                 | Rótulo principal        |
| ------------------------ | ----------------------- |
| Área geral da Viagem     | Viagem ou Visão Geral   |
| Descoberta               | Explorar                |
| Representação geográfica | Mapa                    |
| Planejamento temporal    | Roteiro                 |
| Coleção de interesse     | Salvos                  |
| Contexto geral           | Configurações da Viagem |

---

## 72. Ações oficiais

| Intenção                  | Rótulo recomendado   |
| ------------------------- | -------------------- |
| Criar nova Viagem         | Criar Viagem         |
| Manter Lugar como opção   | Salvar               |
| Remover da coleção        | Remover dos Salvos   |
| Planejar visita           | Adicionar ao Roteiro |
| Consultar localização     | Ver no Mapa          |
| Iniciar navegação externa | Abrir rota           |
| Alterar Atividade         | Editar               |
| Trocar Dia                | Mover para outro dia |
| Excluir Atividade         | Remover do Roteiro   |
| Solicitar automação       | Gerar proposta       |
| Verificar problemas       | Revisar Roteiro      |

---

## 73. Termos que devem ser evitados na interface

Evitar, sem explicação:

* entidade;
* recurso;
* item;
* objeto;
* cluster;
* geocoding;
* waypoint;
* engine;
* score;
* payload;
* provider;
* itinerary optimization.

Termos técnicos poderão existir internamente, mas não deverão orientar a linguagem do usuário.

---

# Parte XIII — Estados informacionais

## 74. Estados de uma Viagem

Uma Viagem poderá estar:

* em configuração;
* em planejamento;
* futura;
* em andamento;
* concluída;
* arquivada futuramente.

No MVP, os estados poderão ser inferidos pelas datas e pela existência de dados.

---

## 75. Estados de um Lugar

Um Lugar poderá estar:

* disponível;
* salvo;
* planejado;
* salvo e planejado;
* indisponível temporariamente;
* com dados incompletos.

---

## 76. Estados de uma Atividade

Uma Atividade poderá estar:

* sem horário;
* planejada;
* com alerta;
* concluída futuramente;
* removida logicamente, quando necessário para histórico.

---

## 77. Estados de salvamento

A interface deverá comunicar:

* não salvo;
* salvando;
* salvo;
* falha ao salvar;
* alteração pendente.

---

## 78. Estados de carregamento

Cada área deverá tratar:

* carregamento inicial;
* carregamento incremental;
* atualização;
* carregamento de integração;
* carregamento parcial.

---

## 79. Estados vazios

Deverão existir Estados vazios específicos para:

* nenhuma Viagem;
* Viagem sem Hospedagem;
* nenhuma Preferência;
* Explorar sem resultados;
* nenhum Lugar salvo;
* Roteiro vazio;
* Dia vazio;
* Mapa sem pontos;
* nenhum alerta.

Cada Estado vazio deverá sugerir uma próxima ação.

---

## 80. Estados de erro

Erros deverão ser apresentados no nível correto.

### Erro global

Quando toda a aplicação não puder funcionar.

### Erro de página

Quando uma área não puder carregar.

### Erro de seção

Quando apenas parte da tela falhar.

### Erro de campo

Quando uma entrada for inválida.

### Erro de ação

Quando salvar, adicionar ou editar falhar.

---

# Parte XIV — Busca e descoberta

## 81. Busca global

No MVP, não será necessária uma busca global fora da Viagem.

A pesquisa deverá permanecer contextualizada ao Destino.

---

## 82. Descoberta sem busca

O usuário deverá conseguir descobrir Lugares sem saber seus nomes.

Caminhos:

* categorias;
* Recomendações;
* proximidade;
* Mapa;
* filtros;
* sugestões contextuais.

---

## 83. Histórico e sugestões de pesquisa

Recursos como histórico, termos recentes e autocomplete avançado poderão evoluir posteriormente.

No MVP, a prioridade será:

* busca clara;
* resultados compreensíveis;
* recuperação de erro;
* contexto geográfico.

---

# Parte XV — Estrutura de URLs e rotas conceituais

## 84. Princípio de endereçamento

Áreas e objetos importantes deverão possuir estado navegável e identificável.

Estrutura conceitual:

```text
/
 /trips
 /trips/new
 /trips/{tripId}
 /trips/{tripId}/explore
 /trips/{tripId}/map
 /trips/{tripId}/itinerary
 /trips/{tripId}/saved
 /trips/{tripId}/settings
 /trips/{tripId}/places/{placeId}
```

Esta estrutura é conceitual e poderá ser adaptada tecnicamente.

---

## 85. Preservação de contexto na URL

Quando fizer sentido, estados como os seguintes poderão ser refletidos na navegação:

* Dia selecionado;
* Lugar selecionado;
* categoria;
* modo de visualização;
* contexto do Mapa.

Filtros temporários poderão permanecer apenas no estado da interface quando não houver benefício em compartilhamento ou retomada.

---

## 86. Rotas inválidas

Quando uma rota não existir ou o usuário não possuir acesso, o produto deverá:

* informar o problema;
* evitar exposição de dados;
* oferecer retorno seguro;
* direcionar para Minhas Viagens.

---

# Parte XVI — Priorização da informação

## 87. Prioridade na Visão Geral

1. identidade da Viagem;
2. próxima ação;
3. Dia atual ou próximo Dia;
4. resumo do Roteiro;
5. alertas;
6. Salvos;
7. contexto adicional.

---

## 88. Prioridade no Cartão de Lugar

1. nome;
2. categoria;
3. Distância;
4. estado salvo ou planejado;
5. Faixa de preço;
6. avaliação;
7. Justificativa;
8. dados secundários.

---

## 89. Prioridade nos Detalhes do Lugar

1. identidade;
2. ações;
3. localização;
4. Distância;
5. horário;
6. preço;
7. descrição;
8. avaliação;
9. fonte.

---

## 90. Prioridade na Atividade

1. título;
2. horário;
3. estado;
4. deslocamento;
5. duração;
6. Localização;
7. ações;
8. observações.

---

## 91. Prioridade durante a Viagem

Durante a Viagem, deverão receber prioridade:

1. Dia atual;
2. próxima Atividade;
3. horário;
4. rota;
5. Distância;
6. alertas;
7. alternativa;
8. conteúdo editorial.

---

# Parte XVII — Personalização da informação

## 92. Arquitetura progressiva

A interface deverá apresentar personalização conforme a necessidade.

Exemplo:

```text
Contexto mínimo
→ Destino, datas e Hospedagem

Contexto intermediário
→ Interesses, orçamento e transporte

Contexto avançado
→ Restrições, grupo e ritmo
```

O usuário não deverá precisar configurar tudo antecipadamente.

---

## 93. Impacto visível

Quando o usuário alterar uma Preferência, deverá ser possível perceber onde ela afeta:

* Recomendações;
* filtros;
* geração;
* alertas;
* adequação.

---

## 94. Configurações no contexto

Quando uma informação estiver ausente e for relevante, o produto poderá solicitar sua configuração no próprio fluxo.

Exemplo:

```text
Usuário solicita Distância
→ Meio de transporte ausente
→ sistema solicita seleção
→ cálculo continua
```

O usuário não deverá ser obrigado a abandonar o contexto atual.

---

# Parte XVIII — Acessibilidade informacional

## 95. Estrutura semântica

Páginas deverão possuir:

* título principal;
* hierarquia de títulos;
* regiões;
* navegação identificada;
* conteúdo principal;
* formulários estruturados;
* mensagens associadas.

---

## 96. Conteúdo fora do Mapa

A lista deverá permitir:

* localizar Lugar;
* compreender Distância;
* identificar estado;
* abrir Detalhes;
* salvar;
* adicionar ao Roteiro.

---

## 97. Ordem de leitura

Em layouts com múltiplos painéis, a ordem semântica deverá continuar lógica.

Exemplo:

```text
Pesquisa
→ Filtros
→ Resultados
→ Detalhes
→ Mapa complementar
```

A ordem visual não deverá comprometer a leitura assistiva.

---

## 98. Navegação por foco

Ao abrir:

* modal;
* painel;
* menu;
* Detalhes;

o foco deverá ser direcionado adequadamente e devolvido ao elemento de origem ao fechar.

---

## 99. Atualizações dinâmicas

Mudanças como:

* Lugar salvo;
* Atividade adicionada;
* filtro aplicado;
* erro;
* sucesso;

deverão ser comunicadas de forma acessível.

---

# Parte XIX — Arquitetura para crescimento

## 100. Colaboração futura

A estrutura deverá permitir futura inclusão de:

* participantes;
* convites;
* Preferências individuais;
* votação;
* comentários.

Possível área futura:

```text
Viagem
└── Grupo
```

Não deverá ser exibida no MVP sem funcionalidade real.

---

## 101. Orçamento futuro

Uma futura área de orçamento poderá ser adicionada sem alterar o núcleo da navegação.

Possível estrutura:

```text
Viagem
└── Orçamento
```

No MVP, orçamento permanece como contexto e Faixa de preço.

---

## 102. Reservas futuras

Reservas poderão aparecer relacionadas a:

* Lugar;
* Atividade;
* Roteiro;
* Visão Geral.

Não deverão substituir o modelo central de Lugar e Atividade.

---

## 103. Múltiplos Destinos

Quando suportados, a estrutura poderá evoluir para:

```text
Viagem
├── Destinos
│   ├── Destino A
│   └── Destino B
├── Roteiro
└── Mapa geral
```

No MVP, a navegação assume um Destino principal.

---

## 104. Uso offline

Uma futura capacidade offline deverá preservar acesso prioritário a:

* Roteiro;
* Dias;
* Atividades;
* endereços;
* observações;
* Salvos essenciais.

---

# Parte XX — Inventário conceitual de páginas

## 105. Páginas globais

* Página inicial;
* Minhas Viagens;
* Criar Viagem;
* Conta;
* Ajuda;
* Erro global;
* Página não encontrada.

---

## 106. Páginas da Viagem

* Visão Geral;
* Explorar;
* Mapa;
* Roteiro;
* Salvos;
* Configurações.

---

## 107. Páginas ou painéis de objeto

* Detalhes do Lugar;
* Detalhes da Atividade;
* Seleção de Dia;
* Edição de Atividade;
* Configuração de Preferências;
* Revisão do Roteiro;
* Proposta de Roteiro;
* Seleção de Alternativa.

---

## 108. Estados auxiliares

* carregamento;
* Estado vazio;
* erro parcial;
* confirmação;
* alerta;
* falha de persistência;
* indisponibilidade externa.

O inventário detalhado será consolidado em documento posterior.

---

# Parte XXI — Matriz entre áreas e capacidades

## 109. Matriz funcional

| Capacidade           | Visão Geral |   Explorar |       Mapa |    Roteiro |     Salvos | Configurações |
| -------------------- | ----------: | ---------: | ---------: | ---------: | ---------: | ------------: |
| Consultar contexto   |   Principal | Secundário | Secundário | Secundário | Secundário |     Principal |
| Descobrir Lugares    |      Atalho |  Principal |  Principal | Contextual | Contextual |           Não |
| Consultar Detalhes   |  Contextual |  Principal |  Principal | Contextual |  Principal |           Não |
| Salvar Lugar         |  Contextual |  Principal |  Principal | Contextual |  Principal |           Não |
| Adicionar ao Roteiro |  Contextual |  Principal |  Principal |  Principal |  Principal |           Não |
| Editar Roteiro       |      Resumo |        Não | Contextual |  Principal |        Não |           Não |
| Consultar Distância  |      Resumo |  Principal |  Principal |  Principal |  Principal |           Não |
| Alterar Preferências |      Atalho | Contextual |        Não | Contextual |        Não |     Principal |
| Revisar alertas      |      Resumo |        Não | Contextual |  Principal |        Não |           Não |

---

# Parte XXII — Critérios de qualidade

## 110. Encontrabilidade

O usuário deverá conseguir localizar as áreas principais sem depender de treinamento.

---

## 111. Clareza

Rótulos e agrupamentos deverão comunicar sua finalidade.

---

## 112. Previsibilidade

A mesma ação deverá produzir comportamento equivalente em diferentes áreas.

---

## 113. Continuidade

O usuário deverá conseguir mover-se entre Descoberta, Salvos, Mapa e Roteiro sem perder contexto.

---

## 114. Redução de profundidade

Ações frequentes não deverão ficar escondidas em navegação excessivamente profunda.

Meta inicial:

* áreas principais acessíveis em uma ação;
* Detalhes em até duas ações;
* adicionar ao Roteiro em fluxo curto.

---

## 115. Flexibilidade

A estrutura deverá suportar:

* planejamento completo;
* planejamento parcial;
* consulta durante a Viagem;
* Descoberta sem planejamento imediato.

---

## 116. Escalabilidade informacional

Novas capacidades deverão ser adicionadas sem transformar a navegação principal em uma lista extensa.

Áreas futuras deverão ser avaliadas como:

* área principal;
* subárea;
* ação contextual;
* conteúdo da Visão Geral.

---

# Parte XXIII — Validação

## 117. Testes de encontrabilidade

Os testes deverão verificar se o usuário consegue localizar:

* criação de Viagem;
* Explorar;
* Mapa;
* Roteiro;
* Salvos;
* Preferências;
* edição de Atividade;
* abertura de rota.

---

## 118. Testes de rotulagem

Deverão validar se os usuários compreendem:

* Explorar;
* Salvos;
* Roteiro;
* Viagem;
* Adicionar ao Roteiro;
* Gerar proposta;
* Período livre.

---

## 119. Testes de navegação móvel

Deverão verificar:

* acesso às cinco áreas principais;
* retorno de Detalhes;
* preservação de filtros;
* mudança de Dia;
* uso com uma mão;
* ações fixas;
* legibilidade.

---

## 120. Testes de navegação desktop

Deverão verificar:

* compreensão de múltiplos painéis;
* relação entre lista e Mapa;
* foco;
* densidade de informação;
* contexto da Viagem.

---

## 121. Testes de acessibilidade

Deverão verificar:

* estrutura semântica;
* navegação por teclado;
* ordem de foco;
* alternativa ao Mapa;
* comunicação de estados;
* leitura das áreas.

---

# Parte XXIV — Governança

## 122. Inclusão de nova área principal

Uma nova área só deverá ser adicionada à navegação principal quando:

* representar objetivo frequente;
* possuir conteúdo próprio;
* não puder ser tratada como subárea;
* for relevante durante grande parte da jornada;
* justificar aumento de complexidade.

---

## 123. Inclusão de subárea

Uma subárea deverá ser preferida quando:

* depender de uma área principal;
* possuir uso contextual;
* não precisar de acesso constante;
* representar aprofundamento de um objeto.

---

## 124. Alteração de rótulo

Rótulos não deverão ser alterados apenas por preferência editorial.

A alteração deverá considerar:

* Glossário;
* testes;
* consistência;
* impacto em documentação;
* impacto em código;
* impacto em métricas.

---

## 125. Alteração da navegação

Mudanças estruturais deverão ser avaliadas contra:

* Jornadas;
* Casos de Uso;
* Requisitos;
* Personas;
* acessibilidade;
* responsividade;
* rastreabilidade.

---

## 126. Responsabilidade

A manutenção deste documento pertence à área de Experience, com participação de:

* Produto;
* Design;
* Arquitetura;
* Domínio;
* Engenharia;
* Qualidade.

---

## 127. Uso por agentes de IA

Agentes de IA que criem telas ou fluxos deverão:

* preservar as áreas oficiais;
* utilizar rótulos consistentes;
* manter a Viagem como contexto central;
* não criar novas áreas sem justificativa;
* preservar relação entre lista, Mapa, Salvos e Roteiro;
* manter alternativa ao Mapa;
* respeitar navegação móvel;
* não misturar configurações globais e contextuais.

---

## 128. Checklist de revisão

Antes de aprovar este documento, verificar:

* a Viagem é o contexto central;
* áreas principais estão definidas;
* navegação global está definida;
* navegação móvel está definida;
* navegação desktop está definida;
* Detalhes do Lugar possuem local claro;
* Mapa possui papel estrutural;
* Salvos e Roteiro estão diferenciados;
* Configurações estão separadas das ações frequentes;
* Estados vazios estão contemplados;
* erros estão contemplados;
* acessibilidade está contemplada;
* URLs conceituais estão definidas;
* crescimento futuro está contemplado;
* rótulos seguem o Glossário;
* não existe dependência de fornecedor.

---

## 129. Declaração final

A Arquitetura da Informação do RouteBook organiza o produto ao redor da Viagem.

Ela conecta cinco áreas principais:

* Viagem;
* Explorar;
* Mapa;
* Roteiro;
* Salvos.

Essas áreas não deverão funcionar como módulos isolados.

Elas deverão representar diferentes perspectivas sobre o mesmo contexto:

* a Visão Geral resume;
* Explorar apresenta possibilidades;
* o Mapa apresenta localização;
* Salvos preserva interesse;
* o Roteiro organiza decisões.

A qualidade da experiência dependerá da continuidade entre essas perspectivas.

O usuário deverá conseguir descobrir, compreender, selecionar, organizar e adaptar sua Viagem sem perder contexto e sem precisar compreender a estrutura técnica do sistema.
