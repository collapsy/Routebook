---

id: RB-UX-003

title: Inventário de Telas
description: Define as telas, páginas, painéis, modais, estados e superfícies de interface necessárias para suportar os fluxos do RouteBook.

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
- screen-inventory
- interface
- screens
- states
- wireframes
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
- RB-UX-001
- RB-UX-002

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

next_documents:

- RB-UX-004
- RB-UX-005
- RB-UX-006
- RB-DS-001
- RB-QA-001

ai_context:
priority: high
index: true
---

# RouteBook — Inventário de Telas

## 1. Propósito deste documento

Este documento define o Inventário de Telas do RouteBook.

Seu objetivo é identificar e especificar todas as superfícies de interface necessárias para suportar:

* a Arquitetura da Informação;
* os Fluxos do Usuário;
* os Casos de Uso;
* os Requisitos Funcionais;
* as Regras de Negócio;
* os Requisitos Não Funcionais;
* as necessidades das Personas.

O inventário deverá funcionar como ponte entre a definição da experiência e a criação dos wireframes.

Este documento deverá orientar:

* wireframes;
* protótipos;
* Design System;
* definição de componentes;
* implementação de páginas;
* rotas da aplicação;
* critérios de aceitação;
* testes visuais;
* testes de usabilidade;
* testes ponta a ponta.

Este documento define quais superfícies deverão existir, por que existem e quais estados precisam representar.

Ele não define:

* estilo visual final;
* identidade visual;
* cores;
* tipografia;
* espaçamento definitivo;
* componentes finais;
* código;
* comportamento técnico detalhado.

---

## 2. Escopo do inventário

O inventário contempla:

* páginas;
* telas completas;
* painéis;
* modais;
* drawers;
* bottom sheets;
* formulários;
* seletores;
* estados vazios;
* estados de carregamento;
* estados de erro;
* confirmações;
* alertas;
* visualizações móveis;
* visualizações em telas maiores.

---

## 3. Relação com os wireframes

A sequência documental da experiência é:

```text
Arquitetura da Informação
→ define a estrutura

Fluxos do Usuário
→ definem os caminhos

Inventário de Telas
→ define as superfícies necessárias

Wireframes
→ representam visualmente as superfícies

Especificações de Interação
→ detalham comportamentos e transições
```

Nenhum wireframe deverá ser criado sem associação com uma tela ou estado descrito neste inventário.

---

## 4. Convenção de identificação

As superfícies utilizarão identificadores com os seguintes padrões:

```text
RB-SCR-XXX — Tela ou página
RB-PNL-XXX — Painel
RB-MDL-XXX — Modal ou diálogo
RB-SHT-XXX — Bottom sheet ou drawer móvel
RB-STA-XXX — Estado de interface
RB-FRM-XXX — Formulário ou fluxo de entrada
```

Exemplos:

```text
RB-SCR-001 — Minhas Viagens
RB-PNL-001 — Resumo do Lugar
RB-MDL-001 — Confirmar exclusão
RB-STA-001 — Nenhuma Viagem
```

---

## 5. Estrutura de especificação

Cada superfície poderá incluir:

* identificador;
* nome;
* tipo;
* objetivo;
* usuários relacionados;
* pontos de entrada;
* conteúdo principal;
* ações;
* estados;
* variações responsivas;
* dependências;
* requisitos relacionados;
* fluxos relacionados;
* prioridade;
* classificação no MVP;
* observações.

---

## 6. Classificação de superfície

### Página

Superfície com rota ou contexto principal próprio.

### Tela

Superfície completa, mesmo quando não possui rota permanente.

### Painel

Conteúdo contextual apresentado junto a outra superfície.

### Modal

Superfície sobreposta para decisão, confirmação ou tarefa curta.

### Bottom sheet

Painel móvel apresentado a partir da parte inferior da tela.

### Drawer

Painel lateral ou contextual.

### Estado

Representação de carregamento, vazio, erro, sucesso ou indisponibilidade.

### Formulário

Superfície dedicada à entrada ou edição de dados.

---

## 7. Classificação de prioridade

### Crítica

Necessária para os fluxos centrais do MVP.

### Alta

Importante para experiência adequada.

### Média

Pode ser simplificada ou adiada.

### Baixa

Melhoria futura.

---

# Parte I — Visão geral do inventário

## 8. Mapa das superfícies

```text
RouteBook
├── Global
│   ├── Página inicial
│   ├── Minhas Viagens
│   ├── Criar Viagem
│   ├── Conta
│   ├── Ajuda
│   └── Erros globais
│
├── Viagem
│   ├── Visão Geral
│   ├── Explorar
│   ├── Mapa
│   ├── Roteiro
│   ├── Salvos
│   └── Configurações
│
├── Lugar
│   ├── Detalhes do Lugar
│   ├── Resumo do Lugar
│   ├── Seleção de Dia
│   └── Distância e rota
│
├── Roteiro
│   ├── Dia da Viagem
│   ├── Detalhes da Atividade
│   ├── Edição da Atividade
│   ├── Reordenação
│   ├── Período livre
│   ├── Proposta de Roteiro
│   └── Revisão de conflitos
│
└── Estados
    ├── Carregamento
    ├── Vazio
    ├── Erro
    ├── Parcial
    ├── Salvamento
    └── Indisponibilidade externa
```

---

## 9. Superfícies críticas do MVP

| ID         | Superfície              |
| ---------- | ----------------------- |
| RB-SCR-001 | Minhas Viagens          |
| RB-FRM-001 | Criar Viagem            |
| RB-SCR-002 | Visão Geral da Viagem   |
| RB-SCR-003 | Explorar                |
| RB-SCR-004 | Detalhes do Lugar       |
| RB-SCR-005 | Mapa da Viagem          |
| RB-SCR-006 | Salvos                  |
| RB-SCR-007 | Roteiro                 |
| RB-SCR-008 | Configurações da Viagem |
| RB-SHT-001 | Selecionar Dia          |
| RB-FRM-002 | Editar Atividade        |
| RB-PNL-001 | Resumo do Lugar         |
| RB-PNL-002 | Detalhes da Atividade   |
| RB-SCR-009 | Proposta de Roteiro     |
| RB-SCR-010 | Revisão de Conflitos    |

---

# Parte II — Superfícies globais

## 10. RB-SCR-001 — Minhas Viagens

### Tipo

Página global.

### Objetivo

Permitir que o usuário visualize, identifique, abra e crie Viagens.

### Pontos de entrada

* rota inicial;
* retorno de uma Viagem;
* navegação global;
* autenticação concluída.

### Conteúdo principal

* identificação do RouteBook;
* ação Criar Viagem;
* lista de Viagens;
* agrupamento temporal;
* estados das Viagens;
* acesso à conta.

### Agrupamentos possíveis

* em andamento;
* próximas;
* concluídas;
* recentes.

### Conteúdo de cada Viagem

* nome;
* Destino;
* datas;
* duração;
* estado temporal;
* progresso do Roteiro;
* próxima informação relevante.

### Ações

* abrir Viagem;
* criar Viagem;
* acessar menu contextual;
* editar nome futuramente;
* excluir ou arquivar futuramente.

### Estados

* carregando;
* nenhuma Viagem;
* lista disponível;
* erro de carregamento;
* carregamento parcial.

### Mobile

* cartões empilhados;
* ação Criar Viagem destacada;
* navegação simples.

### Desktop

* lista ou grade;
* resumo mais amplo;
* agrupamentos laterais ou verticais.

### Prioridade

Crítica.

### MVP

Obrigatório.

### Fluxos relacionados

* RB-UF-001;
* RB-UF-002.

---

## 11. RB-STA-001 — Nenhuma Viagem

### Tipo

Estado vazio.

### Objetivo

Orientar o primeiro uso.

### Conteúdo

* título;
* explicação curta;
* proposta de valor;
* ação Criar Viagem;
* visão simplificada do processo.

### Mensagem conceitual

```text
Você ainda não criou nenhuma viagem.
Comece informando destino, datas e hospedagem.
```

### Ação principal

Criar Viagem.

### Prioridade

Crítica.

---

## 12. RB-STA-002 — Erro ao carregar Viagens

### Tipo

Estado de erro.

### Conteúdo

* mensagem clara;
* impacto;
* ação Tentar novamente;
* alternativa de suporte, quando aplicável.

### Regra

Não apresentar lista vazia como se o usuário não possuísse Viagens quando ocorrer erro de carregamento.

---

## 13. RB-SCR-011 — Página inicial pública

### Tipo

Página global.

### Objetivo

Apresentar o produto antes da autenticação ou do primeiro uso.

### Conteúdo possível

* proposta de valor;
* benefícios;
* exemplo de experiência;
* ação Criar primeira Viagem;
* acesso à conta.

### Prioridade

Média.

### MVP

Pode ser combinada com Minhas Viagens.

---

## 14. RB-SCR-012 — Conta

### Tipo

Página global.

### Objetivo

Gerenciar dados gerais do usuário.

### Conteúdo possível

* nome;
* e-mail;
* idioma;
* privacidade;
* sessões;
* exclusão de conta;
* sair.

### Prioridade

Média.

### MVP

Simplificado quando houver autenticação.

---

## 15. RB-SCR-013 — Ajuda

### Tipo

Página global.

### Objetivo

Explicar conceitos e oferecer suporte.

### Conteúdo possível

* como criar Viagem;
* diferença entre Salvos e Roteiro;
* como usar o Mapa;
* como funcionam Recomendações;
* contato ou feedback.

### Prioridade

Baixa.

### MVP

Desejável.

---

## 16. RB-SCR-014 — Página não encontrada

### Tipo

Erro global.

### Objetivo

Recuperar o usuário de rota inexistente.

### Ações

* voltar;
* acessar Minhas Viagens;
* abrir Viagem atual, quando aplicável.

### Prioridade

Alta.

---

## 17. RB-SCR-015 — Acesso não autorizado

### Tipo

Erro global.

### Objetivo

Informar que o usuário não possui acesso sem expor dados privados.

### Ações

* autenticar;
* voltar para Minhas Viagens;
* solicitar acesso futuramente.

### Prioridade

Alta.

---

# Parte III — Criação da Viagem

## 18. RB-FRM-001 — Criar Viagem

### Tipo

Fluxo de formulário.

### Objetivo

Criar uma Viagem com contexto mínimo.

### Estrutura

```text
Criar Viagem
├── Etapa 1 — Destino
├── Etapa 2 — Datas
├── Etapa 3 — Hospedagem
├── Etapa 4 — Viajantes
└── Etapa 5 — Revisão
```

### Elementos persistentes

* título;
* indicador de etapa;
* ação Voltar;
* ação Continuar;
* ação Cancelar;
* resumo parcial quando aplicável.

### Mobile

Uma etapa por tela.

### Desktop

Etapas poderão permanecer em tela única progressiva, desde que a carga cognitiva permaneça controlada.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 19. RB-FRM-001-A — Etapa Destino

### Objetivo

Selecionar o Destino principal.

### Conteúdo

* campo de pesquisa;
* sugestões;
* resultados;
* identificação geográfica;
* Estado de carregamento;
* ausência de resultados.

### Ações

* pesquisar;
* selecionar;
* limpar;
* continuar.

### Validação

Um Destino válido deve ser selecionado.

---

## 20. RB-FRM-001-B — Etapa Datas

### Objetivo

Definir o Período da Viagem.

### Conteúdo

* data inicial;
* data final;
* duração calculada;
* calendário ou campos;
* validação.

### Estados de erro

* data inválida;
* data final anterior;
* formato não reconhecido.

---

## 21. RB-FRM-001-C — Etapa Hospedagem

### Objetivo

Definir a referência geográfica principal.

### Conteúdo

* pesquisa;
* resultados;
* endereço;
* seleção no Mapa futuramente;
* alternativa provisória.

### Ações

* pesquisar;
* selecionar;
* usar referência provisória;
* continuar.

### Estado especial

Hospedagem provisória.

---

## 22. RB-MDL-001 — Confirmar referência provisória

### Tipo

Modal ou diálogo.

### Objetivo

Explicar o impacto da Hospedagem provisória.

### Conteúdo

* referência escolhida;
* impacto nas Distâncias;
* possibilidade de alteração futura.

### Ações

* usar referência;
* voltar e pesquisar novamente.

---

## 23. RB-FRM-001-D — Etapa Viajantes

### Objetivo

Informar o Perfil básico do Grupo.

### Conteúdo mínimo

* quantidade de Viajantes.

### Conteúdo opcional

* adultos;
* crianças;
* observação inicial.

### Regra

A quantidade mínima é um.

---

## 24. RB-FRM-001-E — Revisão da criação

### Objetivo

Confirmar os dados antes da criação.

### Conteúdo

* Destino;
* datas;
* duração;
* Hospedagem;
* Viajantes;
* indicação de informação provisória.

### Ações

* editar seção;
* criar Viagem;
* cancelar.

---

## 25. RB-STA-003 — Criando Viagem

### Tipo

Estado de processamento.

### Objetivo

Comunicar que a criação está em andamento.

### Conteúdo

* indicador de progresso;
* mensagem;
* prevenção de envio duplicado.

---

## 26. RB-STA-004 — Falha ao criar Viagem

### Tipo

Estado de erro.

### Ações

* tentar novamente;
* voltar e revisar;
* cancelar.

### Regra

Os dados preenchidos devem ser preservados quando possível.

---

# Parte IV — Visão Geral da Viagem

## 27. RB-SCR-002 — Visão Geral da Viagem

### Tipo

Página contextual.

### Objetivo

Apresentar o estado geral da Viagem e orientar o próximo passo.

### Conteúdo principal

```text
Visão Geral
├── Cabeçalho da Viagem
├── Próximo passo
├── Resumo do Dia atual
├── Resumo do Roteiro
├── Alertas
├── Salvos recentes
├── Contexto da Viagem
└── Ações rápidas
```

### Cabeçalho

* nome;
* Destino;
* Período;
* quantidade de Viajantes;
* acesso às configurações.

### Próximo passo

Deverá ser contextual.

Exemplos:

* definir Hospedagem;
* escolher Interesses;
* explorar Lugares;
* revisar Salvos;
* adicionar ao Roteiro;
* resolver conflito;
* consultar Dia atual.

### Ações rápidas

* Explorar;
* abrir Roteiro;
* abrir Mapa;
* abrir Salvos;
* gerar proposta.

### Estados

* Viagem recém-criada;
* Viagem em planejamento;
* Viagem futura;
* Viagem em andamento;
* Viagem sem Roteiro;
* Viagem com alertas;
* carregamento parcial.

### Mobile

Conteúdo em blocos empilhados, priorizando:

1. Dia atual ou próximo passo;
2. Roteiro;
3. alertas;
4. Salvos.

### Desktop

Resumo em múltiplos blocos ou colunas.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 28. RB-PNL-003 — Resumo do Dia atual

### Tipo

Painel contextual.

### Conteúdo

* data;
* próxima Atividade;
* horário;
* Distância;
* alerta;
* acesso ao Dia completo.

### Estado sem Atividades

* informar Dia livre;
* oferecer Explorar;
* oferecer Salvos;
* manter Dia livre.

---

## 29. RB-PNL-004 — Próximo passo

### Tipo

Painel orientativo.

### Objetivo

Indicar uma ação relevante sem impedir outras escolhas.

### Conteúdo

* título;
* justificativa curta;
* ação principal;
* ação secundária opcional.

---

## 30. RB-PNL-005 — Resumo de alertas

### Tipo

Painel.

### Conteúdo

* quantidade;
* severidades;
* principais alertas;
* acesso à revisão.

---

# Parte V — Explorar

## 31. RB-SCR-003 — Explorar

### Tipo

Página contextual.

### Objetivo

Permitir Descoberta, pesquisa, filtro e seleção de Lugares.

### Conteúdo principal

```text
Explorar
├── Cabeçalho contextual
├── Pesquisa
├── Categorias
├── Filtros
├── Ordenação
├── Resultados
├── Alternância de visualização
└── Mapa associado
```

### Ações principais

* pesquisar;
* selecionar categoria;
* filtrar;
* ordenar;
* abrir Lugar;
* salvar;
* adicionar ao Roteiro;
* visualizar no Mapa.

### Estados

* carregamento inicial;
* resultados;
* nenhum resultado;
* resultados filtrados;
* erro;
* carregamento incremental;
* dados parciais.

### Mobile

Possíveis modos:

* lista;
* Mapa;
* alternância entre lista e Mapa.

### Desktop

Lista e Mapa simultâneos quando houver espaço.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 32. RB-PNL-006 — Pesquisa de Lugares

### Tipo

Painel ou região da tela.

### Conteúdo

* campo;
* limpar;
* histórico futuramente;
* sugestões;
* Estado de pesquisa.

### Estados

* vazio;
* digitando;
* buscando;
* resultados;
* nenhum resultado;
* erro.

---

## 33. RB-SHT-002 — Filtros de Exploração

### Tipo

Bottom sheet em mobile; painel ou drawer em desktop.

### Conteúdo MVP

* Categoria;
* Distância;
* Faixa de preço.

### Ações

* aplicar;
* limpar todos;
* cancelar;
* remover filtro individual.

### Estados

* padrão;
* alterado;
* aplicado;
* sem resultados.

---

## 34. RB-SHT-003 — Ordenar resultados

### Tipo

Bottom sheet, menu ou seletor.

### Opções iniciais possíveis

* relevância;
* Distância;
* avaliação;
* Faixa de preço.

### Prioridade

Média.

### MVP

Simplificado.

---

## 35. RB-PNL-007 — Cartão de Lugar

### Tipo

Componente informacional reutilizável.

### Conteúdo

* fotografia;
* nome;
* categoria;
* avaliação;
* Distância;
* Faixa de preço;
* Justificativa resumida;
* estado Salvo;
* estado Planejado.

### Ações

* abrir Detalhes;
* salvar;
* adicionar ao Roteiro;
* ver no Mapa.

### Estados

* padrão;
* selecionado;
* salvo;
* planejado;
* salvo e planejado;
* com dados incompletos;
* indisponível.

---

## 36. RB-STA-005 — Nenhum resultado em Explorar

### Tipo

Estado vazio.

### Conteúdo

* explicação;
* filtros ativos;
* ações de recuperação.

### Ações

* limpar filtros;
* ampliar Distância;
* alterar Categoria;
* pesquisar novamente;
* mover Região do Mapa.

---

## 37. RB-STA-006 — Falha ao carregar Lugares

### Tipo

Estado de erro.

### Ações

* tentar novamente;
* continuar com dados anteriores;
* utilizar Mapa ou lista, conforme área disponível.

---

# Parte VI — Detalhes do Lugar

## 38. RB-SCR-004 — Detalhes do Lugar

### Tipo

Página ou superfície completa.

### Objetivo

Permitir avaliação detalhada e decisão sobre o Lugar.

### Conteúdo principal

```text
Detalhes do Lugar
├── Identificação
├── Galeria
├── Informações principais
├── Localização
├── Distância
├── Horários
├── Faixa de preço
├── Justificativa
├── Fonte
└── Ações
```

### Conteúdo prioritário

* nome;
* categoria;
* fotografia;
* Distância;
* Tempo de deslocamento;
* horário;
* Faixa de preço;
* avaliação;
* Justificativa;
* endereço.

### Ações principais

* Salvar;
* Remover dos Salvos;
* Adicionar ao Roteiro;
* Ver no Mapa;
* Abrir rota.

### Pontos de entrada

* Explorar;
* Mapa;
* Salvos;
* Roteiro;
* Recomendação;
* pesquisa.

### Estados

* carregando;
* completo;
* parcial;
* sem fotografias;
* horário indisponível;
* rota indisponível;
* erro.

### Mobile

Tela completa com ações principais fixadas quando adequado.

### Desktop

Página ou painel lateral amplo.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 39. RB-PNL-001 — Resumo do Lugar

### Tipo

Painel contextual.

### Uso

* Marcador do Mapa;
* visualização rápida;
* lista em desktop.

### Conteúdo

* nome;
* categoria;
* Distância;
* Faixa de preço;
* estado;
* fotografia opcional.

### Ações

* abrir Detalhes;
* salvar;
* adicionar ao Roteiro;
* abrir rota.

---

## 40. RB-SHT-004 — Resumo do Lugar no Mapa

### Tipo

Bottom sheet móvel.

### Objetivo

Apresentar informação contextual sem retirar completamente o Mapa.

### Estados

* recolhido;
* intermediário;
* expandido.

### Regra

O Marcador selecionado deve permanecer identificável.

---

## 41. RB-STA-007 — Dados parciais do Lugar

### Tipo

Estado parcial.

### Objetivo

Exibir dados disponíveis e identificar ausências.

### Regra

A ausência de um dado não deve bloquear as demais ações possíveis.

---

# Parte VII — Mapa

## 42. RB-SCR-005 — Mapa da Viagem

### Tipo

Página contextual.

### Objetivo

Representar geograficamente a Viagem e seus elementos.

### Conteúdo principal

```text
Mapa da Viagem
├── Mapa
├── Hospedagem
├── Marcadores
├── Contexto ativo
├── Filtros
├── Lista alternativa
└── Resumo do elemento selecionado
```

### Contextos

* todos os Lugares;
* Explorar;
* Salvos;
* Roteiro;
* Dia específico.

### Ações

* selecionar Marcador;
* alterar contexto;
* filtrar;
* abrir Detalhes;
* salvar;
* adicionar ao Roteiro;
* abrir Atividade;
* abrir rota;
* alternar para lista.

### Estados

* carregando;
* disponível;
* sem Marcadores;
* erro do Mapa;
* dados parciais;
* localização indisponível.

### Mobile

Mapa em tela cheia ou predominante, com bottom sheet.

### Desktop

Mapa com lista ou painel lateral.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 43. RB-PNL-008 — Seletor de contexto do Mapa

### Tipo

Controle contextual.

### Opções

* todos;
* Explorar;
* Salvos;
* Roteiro;
* Dia.

### Regra

O contexto ativo deve ser claramente indicado.

---

## 44. RB-STA-008 — Mapa indisponível

### Tipo

Estado de erro.

### Conteúdo

* explicação;
* Visualização em lista;
* ação Tentar novamente;
* ação Abrir serviço externo, quando possível.

### Regra

A falha do Mapa não deve bloquear outras áreas.

---

## 45. RB-STA-009 — Mapa sem pontos

### Tipo

Estado vazio.

### Conteúdo

* explicação;
* contexto atual;
* ação Explorar;
* ação alterar filtros.

---

# Parte VIII — Salvos

## 46. RB-SCR-006 — Salvos

### Tipo

Página contextual.

### Objetivo

Permitir consultar e organizar Lugares de interesse.

### Conteúdo

```text
Salvos
├── Resumo
├── Filtros
├── Lista
├── Mapa opcional
├── Estados
└── Ações
```

### Informações por Lugar

* nome;
* categoria;
* Distância;
* estado planejado;
* Faixa de preço;
* fotografia.

### Ações

* abrir Detalhes;
* ver no Mapa;
* adicionar ao Roteiro;
* remover dos Salvos;
* filtrar.

### Estados

* carregando;
* vazio;
* disponível;
* erro;
* Lugar com dados indisponíveis.

### Mobile

Lista prioritária, com acesso ao Mapa.

### Desktop

Lista e Mapa poderão coexistir.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 47. RB-STA-010 — Nenhum Lugar salvo

### Tipo

Estado vazio.

### Conteúdo

* explicação da área;
* ação Explorar;
* categorias sugeridas.

---

## 48. RB-MDL-002 — Remover dos Salvos

### Tipo

Confirmação opcional.

### Uso

A confirmação pode ser omitida para ação reversível e simples.

### Regra

Quando o Lugar estiver no Roteiro, a interface deverá deixar claro que a Atividade será mantida.

---

# Parte IX — Roteiro

## 49. RB-SCR-007 — Roteiro

### Tipo

Página contextual.

### Objetivo

Permitir consultar, construir, editar e revisar o planejamento temporal.

### Conteúdo principal

```text
Roteiro
├── Navegação entre Dias
├── Dia selecionado
├── Atividades
├── Períodos livres
├── Deslocamentos
├── Alertas
├── Mapa do Dia
└── Ações de planejamento
```

### Ações principais

* selecionar Dia;
* adicionar Lugar;
* criar Atividade;
* adicionar Período livre;
* editar Atividade;
* reordenar;
* mover;
* remover;
* gerar proposta;
* revisar conflitos;
* visualizar no Mapa.

### Estados

* Roteiro vazio;
* Dia vazio;
* Dia com Atividades;
* Dia com alertas;
* salvando;
* falha de persistência;
* carregamento parcial.

### Mobile

* seletor horizontal ou lista de Dias;
* Atividades empilhadas;
* ações por item;
* Mapa acessado separadamente.

### Desktop

* Dias em painel;
* Atividades no centro;
* Mapa ou Detalhes em painel lateral.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 50. RB-PNL-009 — Navegação entre Dias

### Tipo

Painel ou componente estrutural.

### Conteúdo

* data;
* dia da semana;
* estado;
* quantidade de Atividades;
* alerta;
* indicação de Dia atual.

### Estados

* selecionado;
* vazio;
* com Atividades;
* com alerta;
* atual.

---

## 51. RB-PNL-010 — Dia da Viagem

### Tipo

Painel principal.

### Conteúdo

* data;
* resumo;
* Atividades;
* Períodos livres;
* Deslocamentos;
* alertas;
* ações.

### Estado vazio

* nenhuma Atividade;
* ações para Explorar;
* adicionar manualmente;
* gerar proposta;
* manter livre.

---

## 52. RB-PNL-011 — Cartão de Atividade

### Tipo

Componente informacional.

### Conteúdo

* horário;
* título;
* Lugar;
* duração;
* categoria;
* localização;
* alerta;
* deslocamento relacionado.

### Ações

* abrir Detalhes;
* editar;
* mover;
* reordenar;
* remover;
* abrir rota.

### Estados

* sem horário;
* planejada;
* com alerta;
* selecionada;
* salvando;
* falha ao salvar.

---

## 53. RB-PNL-012 — Deslocamento

### Tipo

Componente entre Atividades.

### Conteúdo

* origem;
* destino;
* Meio de transporte;
* Distância;
* Tempo estimado;
* estado de cálculo.

### Estados

* calculando;
* disponível;
* indisponível;
* desatualizado.

---

## 54. RB-PNL-013 — Período livre

### Tipo

Componente do Roteiro.

### Conteúdo

* horário;
* duração;
* observação;
* estado bloqueado;
* ação contextual.

### Ações

* editar;
* remover;
* encontrar sugestão;
* bloquear ou desbloquear.

---

## 55. RB-STA-011 — Roteiro vazio

### Tipo

Estado vazio.

### Conteúdo

* explicação;
* ação Explorar;
* ação adicionar Lugar;
* ação gerar proposta;
* ação criar Atividade manual.

---

## 56. RB-STA-012 — Dia vazio

### Tipo

Estado vazio contextual.

### Ações

* Explorar;
* adicionar de Salvos;
* criar Atividade;
* adicionar Período livre;
* manter Dia livre.

---

# Parte X — Atividades

## 57. RB-PNL-002 — Detalhes da Atividade

### Tipo

Painel ou página contextual.

### Objetivo

Apresentar dados e ações de uma Atividade planejada.

### Conteúdo

* título;
* Dia;
* horário;
* duração;
* Lugar;
* Localização;
* observações;
* alertas;
* Deslocamentos;
* estado de salvamento.

### Ações

* editar;
* mover;
* remover;
* abrir Detalhes do Lugar;
* abrir rota.

### Mobile

Tela completa ou bottom sheet expandido.

### Desktop

Painel lateral.

---

## 58. RB-FRM-002 — Editar Atividade

### Tipo

Formulário.

### Conteúdo

* Dia;
* horário;
* duração;
* observações;
* título, quando manual;
* Localização, quando manual.

### Ações

* salvar;
* cancelar;
* remover em ação separada.

### Estados

* padrão;
* alterado;
* validação;
* impacto;
* salvando;
* erro;
* sucesso.

### Regra

Cancelar deve preservar o estado anterior.

---

## 59. RB-SHT-001 — Selecionar Dia

### Tipo

Bottom sheet, modal ou painel.

### Objetivo

Escolher um Dia para adicionar ou mover uma Atividade.

### Conteúdo

* lista de Dias;
* estado de cada Dia;
* alertas;
* sugestão de Dia;
* quantidade de Atividades.

### Ações

* selecionar;
* cancelar;
* continuar.

---

## 60. RB-SHT-005 — Configurar Atividade ao adicionar

### Tipo

Bottom sheet ou modal.

### Conteúdo

* Dia escolhido;
* horário opcional;
* duração opcional;
* observação;
* alertas.

### Ações

* confirmar;
* editar Dia;
* cancelar.

---

## 61. RB-MDL-003 — Confirmar remoção de Atividade

### Tipo

Modal.

### Conteúdo

* Atividade;
* impacto;
* informação sobre Salvos.

### Ações

* remover;
* cancelar.

---

## 62. RB-SHT-006 — Mover Atividade

### Tipo

Bottom sheet ou painel.

### Conteúdo

* Dias disponíveis;
* opção de horário;
* conflitos;
* impacto.

### Ações

* confirmar mudança;
* ajustar;
* cancelar.

---

## 63. RB-SHT-007 — Reordenar Atividade

### Tipo

Menu ou superfície acessível.

### Ações

* mover para cima;
* mover para baixo;
* mover para primeira posição;
* mover para última posição;
* selecionar posição.

### Regra

Deve existir como alternativa a arrastar e soltar.

---

# Parte XI — Período livre e Atividade manual

## 64. RB-FRM-003 — Adicionar Período livre

### Tipo

Formulário.

### Conteúdo

* Dia;
* horário opcional;
* duração;
* observação;
* estado bloqueado ou flexível.

### Ações

* salvar;
* cancelar.

---

## 65. RB-FRM-004 — Criar Atividade manual

### Tipo

Formulário.

### Conteúdo

* título;
* Dia;
* horário;
* duração;
* Localização opcional;
* observação.

### Prioridade

Média.

### MVP

Desejável.

---

# Parte XII — Geração de Roteiro

## 66. RB-SCR-009 — Proposta de Roteiro

### Tipo

Página ou modo de revisão.

### Objetivo

Apresentar uma proposta separada do Roteiro atual.

### Conteúdo

```text
Proposta de Roteiro
├── Resumo do contexto
├── Limitações
├── Dias propostos
├── Atividades
├── Justificativas
├── Alertas
└── Ações de decisão
```

### Ações

* aceitar;
* aceitar parcialmente;
* editar;
* gerar novamente;
* descartar.

### Estados

* contexto insuficiente;
* gerando;
* proposta disponível;
* proposta parcial;
* erro;
* conflito;
* aplicando.

### Regra

O Roteiro atual deve permanecer preservado até a aceitação.

### Mobile

Dias empilhados ou navegáveis.

### Desktop

Comparação com Roteiro atual poderá ser apresentada lado a lado.

### Prioridade

Alta.

### MVP

Obrigatório em versão simplificada.

---

## 67. RB-STA-013 — Gerando proposta

### Tipo

Estado de processamento.

### Conteúdo

* progresso;
* etapas conceituais;
* possibilidade de cancelar, quando suportado;
* informação de que o Roteiro atual está preservado.

---

## 68. RB-STA-014 — Contexto insuficiente

### Tipo

Estado orientativo.

### Conteúdo

* dados ausentes;
* impacto;
* ações.

### Ações

* completar contexto;
* adicionar Lugares;
* gerar versão limitada;
* cancelar.

---

## 69. RB-MDL-004 — Confirmar aplicação da proposta

### Tipo

Modal.

### Conteúdo

* impacto sobre o Roteiro atual;
* quantidade de Dias e Atividades afetadas;
* possibilidade de edição posterior.

### Ações

* aplicar;
* cancelar.

---

## 70. RB-MDL-005 — Descartar proposta

### Tipo

Modal opcional.

### Regra

O Roteiro anterior deve permanecer intacto.

---

# Parte XIII — Revisão e alertas

## 71. RB-SCR-010 — Revisão de Conflitos

### Tipo

Página ou modo contextual do Roteiro.

### Objetivo

Permitir identificar, compreender e tratar problemas de viabilidade.

### Conteúdo

* resumo;
* filtros por severidade;
* lista de alertas;
* elemento afetado;
* impacto;
* ações.

### Categorias

* erro;
* risco;
* sugestão.

### Ações

* editar;
* mover;
* remover;
* solicitar Alternativa;
* ignorar, quando permitido;
* voltar ao Roteiro.

### Estados

* analisando;
* nenhum alerta;
* alertas disponíveis;
* erro de análise;
* atualização após correção.

### Prioridade

Alta.

### MVP

Obrigatório em versão básica.

---

## 72. RB-PNL-014 — Item de alerta

### Tipo

Componente.

### Conteúdo

* severidade;
* título;
* explicação;
* Dia;
* Atividade;
* impacto;
* ação recomendada.

### Ações

* abrir item;
* corrigir;
* ignorar, quando permitido.

---

## 73. RB-STA-015 — Nenhum alerta conhecido

### Tipo

Estado de sucesso.

### Regra

Não deverá afirmar que o Roteiro é garantidamente viável.

### Mensagem conceitual

```text
Nenhum conflito conhecido foi identificado com os dados disponíveis.
```

---

# Parte XIV — Distância e rota

## 74. RB-PNL-015 — Distância e deslocamento

### Tipo

Painel contextual.

### Conteúdo

* origem;
* destino;
* Meio de transporte;
* Distância;
* Tempo estimado;
* atualização;
* natureza estimada.

### Ações

* alterar origem;
* alterar transporte;
* abrir rota;
* recalcular.

---

## 75. RB-SHT-008 — Selecionar origem

### Tipo

Bottom sheet ou modal.

### Opções

* Hospedagem;
* Atividade anterior;
* Localização atual;
* Lugar selecionado;
* endereço manual.

---

## 76. RB-SHT-009 — Selecionar Meio de transporte

### Tipo

Bottom sheet ou seletor.

### Opções

* carro;
* caminhada;
* transporte público;
* transporte por aplicativo;
* combinação ou outro, quando aplicável.

---

## 77. RB-STA-016 — Rota indisponível

### Tipo

Estado parcial.

### Conteúdo

* explicação;
* Distância geográfica, quando disponível;
* abrir serviço externo;
* tentar novamente.

---

# Parte XV — Configurações da Viagem

## 78. RB-SCR-008 — Configurações da Viagem

### Tipo

Página contextual.

### Objetivo

Gerenciar o contexto geral da Viagem.

### Estrutura

```text
Configurações
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
└── Ações sensíveis
```

### Ações

* editar;
* salvar;
* cancelar;
* excluir Viagem futuramente.

### Estados

* carregando;
* editável;
* alterações pendentes;
* salvando;
* salvo;
* erro;
* impacto estrutural.

### Mobile

Seções navegáveis ou acordeões.

### Desktop

Menu lateral e conteúdo por seção.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 79. RB-FRM-005 — Editar informações gerais

### Conteúdo

* nome;
* Destino;
* datas;
* quantidade de Viajantes;
* fuso quando aplicável.

---

## 80. RB-FRM-006 — Editar Hospedagem

### Conteúdo

* referência atual;
* pesquisa;
* endereço;
* Mapa opcional;
* impacto.

---

## 81. RB-FRM-007 — Editar Preferências

### Conteúdo

* Interesses;
* orçamento;
* transporte;
* Ritmo;
* Restrições;
* Perfil do Grupo.

---

## 82. RB-MDL-006 — Confirmar alteração estrutural

### Tipo

Modal.

### Uso

* Destino;
* Período;
* Hospedagem.

### Conteúdo

* alteração;
* elementos afetados;
* necessidade de recálculo;
* risco de Atividades inválidas.

### Ações

* confirmar;
* cancelar;
* revisar.

---

## 83. RB-MDL-007 — Excluir Viagem

### Tipo

Modal destrutivo.

### Conteúdo

* nome da Viagem;
* impacto;
* irreversibilidade;
* confirmação explícita.

### Prioridade

Média.

### MVP

Pode ser adiado.

---

# Parte XVI — Navegação

## 84. RB-PNL-016 — Navegação global

### Mobile

* acesso a Minhas Viagens;
* conta;
* ajuda.

### Desktop

* marca;
* Minhas Viagens;
* criar Viagem;
* conta.

---

## 85. RB-PNL-017 — Navegação principal da Viagem

### Mobile

Navegação inferior:

* Viagem;
* Explorar;
* Mapa;
* Roteiro;
* Salvos.

### Desktop

Navegação lateral ou superior:

* Visão Geral;
* Explorar;
* Mapa;
* Roteiro;
* Salvos;
* Configurações.

### Estados

* ativo;
* alerta;
* indisponível temporariamente;
* reduzido.

---

## 86. RB-PNL-018 — Cabeçalho contextual da Viagem

### Conteúdo

* nome;
* Destino;
* Período;
* voltar;
* Configurações;
* ações contextuais.

---

# Parte XVII — Estados transversais

## 87. RB-STA-017 — Carregamento de página

### Uso

Quando a estrutura principal ainda não estiver disponível.

### Requisitos

* não bloquear indefinidamente;
* indicar progresso;
* evitar mudança brusca de layout.

---

## 88. RB-STA-018 — Carregamento de seção

### Uso

Quando apenas uma parte da página depende de processamento.

### Regra

Outras partes devem permanecer utilizáveis.

---

## 89. RB-STA-019 — Salvando

### Conteúdo

* indicador;
* ação temporariamente protegida contra duplicação;
* estado acessível.

---

## 90. RB-STA-020 — Salvo

### Tipo

Feedback de sucesso.

### Regra

Pode ser discreto, mas deve ser perceptível.

---

## 91. RB-STA-021 — Falha ao salvar

### Conteúdo

* informação de que a alteração não foi salva;
* ação Tentar novamente;
* ação revisar;
* preservação local quando possível.

---

## 92. RB-STA-022 — Conteúdo parcial

### Uso

Quando parte dos dados externos não estiver disponível.

### Conteúdo

* dados disponíveis;
* indicação das ausências;
* ação de nova tentativa.

---

## 93. RB-STA-023 — Serviço externo indisponível

### Uso

* Mapa;
* rota;
* pesquisa;
* IA;
* fotografias.

### Regra

Deve afetar apenas a capacidade dependente.

---

## 94. RB-STA-024 — Sem conexão

### Tipo

Estado de conectividade.

### MVP

Pode informar indisponibilidade e preservar dados já carregados.

### Pós-MVP

Poderá oferecer acesso offline.

---

## 95. RB-MDL-008 — Alterações não salvas

### Tipo

Modal de proteção.

### Uso

Quando o usuário tenta sair de formulário com alterações pendentes.

### Ações

* continuar editando;
* descartar;
* salvar e sair, quando possível.

---

# Parte XVIII — Variações por dispositivo

## 96. Telas prioritárias para wireframe mobile

Deverão possuir wireframes mobile obrigatórios:

1. Minhas Viagens;
2. Criar Viagem;
3. Visão Geral;
4. Explorar;
5. Filtros;
6. Detalhes do Lugar;
7. Mapa;
8. Salvos;
9. Roteiro;
10. Detalhes da Atividade;
11. Editar Atividade;
12. Selecionar Dia;
13. Proposta de Roteiro;
14. Revisão de Conflitos;
15. Configurações da Viagem.

---

## 97. Telas prioritárias para wireframe desktop

Deverão possuir wireframes desktop obrigatórios:

1. Minhas Viagens;
2. Visão Geral;
3. Explorar com lista e Mapa;
4. Detalhes do Lugar;
5. Mapa da Viagem;
6. Salvos com Mapa;
7. Roteiro com Mapa do Dia;
8. Proposta de Roteiro;
9. Revisão de Conflitos;
10. Configurações.

---

## 98. Superfícies que mudam de formato

| Conteúdo              | Mobile             | Desktop                  |
| --------------------- | ------------------ | ------------------------ |
| Detalhes do Lugar     | Página completa    | Página ou painel lateral |
| Filtros               | Bottom sheet       | Drawer ou painel         |
| Resumo do Marcador    | Bottom sheet       | Painel contextual        |
| Seleção de Dia        | Bottom sheet       | Modal ou painel          |
| Detalhes da Atividade | Página ou sheet    | Painel lateral           |
| Navegação da Viagem   | Inferior           | Lateral ou superior      |
| Explorar              | Lista ou Mapa      | Lista e Mapa             |
| Roteiro               | Conteúdo empilhado | Múltiplos painéis        |

---

# Parte XIX — Matriz de telas e fluxos

## 99. Criação e retomada

| Fluxo     | Superfícies                                                |
| --------- | ---------------------------------------------------------- |
| RB-UF-001 | RB-SCR-001, RB-FRM-001, RB-MDL-001, RB-STA-003, RB-STA-004 |
| RB-UF-002 | RB-SCR-001, RB-SCR-002, RB-STA-002                         |

---

## 100. Contexto da Viagem

| Fluxo     | Superfícies                                                |
| --------- | ---------------------------------------------------------- |
| RB-UF-003 | RB-SCR-008, RB-FRM-005, RB-FRM-006, RB-FRM-007, RB-MDL-006 |

---

## 101. Descoberta

| Fluxo     | Superfícies                                    |
| --------- | ---------------------------------------------- |
| RB-UF-004 | RB-SCR-003, RB-PNL-007, RB-STA-005, RB-STA-006 |
| RB-UF-005 | RB-SCR-003, RB-PNL-006, RB-SCR-004             |
| RB-UF-006 | RB-SHT-002, RB-SHT-003, RB-SCR-003             |

---

## 102. Lugar e Salvos

| Fluxo     | Superfícies                                                |
| --------- | ---------------------------------------------------------- |
| RB-UF-007 | RB-SCR-004, RB-PNL-001, RB-STA-007                         |
| RB-UF-008 | RB-PNL-007, RB-SCR-004, RB-STA-019, RB-STA-020, RB-STA-021 |
| RB-UF-009 | RB-SCR-006, RB-STA-010, RB-MDL-002                         |

---

## 103. Roteiro

| Fluxo     | Superfícies                                                |
| --------- | ---------------------------------------------------------- |
| RB-UF-010 | RB-SHT-001, RB-SHT-005, RB-STA-019, RB-STA-021             |
| RB-UF-011 | RB-SCR-007, RB-PNL-009, RB-PNL-010, RB-STA-011, RB-STA-012 |
| RB-UF-012 | RB-PNL-002, RB-FRM-002                                     |
| RB-UF-013 | RB-PNL-011, RB-SHT-007                                     |
| RB-UF-014 | RB-SHT-006                                                 |
| RB-UF-015 | RB-MDL-003                                                 |
| RB-UF-016 | RB-FRM-003, RB-PNL-013                                     |

---

## 104. Mapa e deslocamento

| Fluxo     | Superfícies                                                |
| --------- | ---------------------------------------------------------- |
| RB-UF-017 | RB-SCR-005, RB-PNL-008, RB-SHT-004, RB-STA-008, RB-STA-009 |
| RB-UF-018 | RB-PNL-015, RB-SHT-008, RB-SHT-009, RB-STA-016             |
| RB-UF-019 | RB-PNL-015, RB-STA-016                                     |

---

## 105. Geração e revisão

| Fluxo     | Superfícies                                                |
| --------- | ---------------------------------------------------------- |
| RB-UF-020 | RB-SCR-009, RB-STA-013, RB-STA-014, RB-MDL-004, RB-MDL-005 |
| RB-UF-021 | RB-SCR-010, RB-PNL-014, RB-STA-015                         |

---

# Parte XX — Matriz de telas e requisitos

## 106. Gestão da Viagem

| Superfícies                        | Requisitos principais |
| ---------------------------------- | --------------------- |
| RB-SCR-001, RB-FRM-001, RB-SCR-002 | RB-FR-001 a RB-FR-013 |
| RB-SCR-008                         | RB-FR-011 a RB-FR-023 |

---

## 107. Descoberta e Lugares

| Superfícies                        | Requisitos principais |
| ---------------------------------- | --------------------- |
| RB-SCR-003, RB-SHT-002, RB-PNL-007 | RB-FR-024 a RB-FR-038 |
| RB-SCR-004, RB-PNL-001             | RB-FR-039 a RB-FR-044 |

---

## 108. Mapa

| Superfícies            | Requisitos principais |
| ---------------------- | --------------------- |
| RB-SCR-005, RB-SHT-004 | RB-FR-045 a RB-FR-059 |

---

## 109. Salvos

| Superfícies | Requisitos principais |
| ----------- | --------------------- |
| RB-SCR-006  | RB-FR-060 a RB-FR-066 |

---

## 110. Roteiro

| Superfícies                        | Requisitos principais |
| ---------------------------------- | --------------------- |
| RB-SCR-007, RB-PNL-010, RB-PNL-011 | RB-FR-067 a RB-FR-086 |
| RB-SCR-009                         | RB-FR-087 a RB-FR-096 |
| RB-SCR-010                         | RB-FR-105 a RB-FR-112 |

---

# Parte XXI — Critérios para wireframes

## 111. Conteúdo mínimo

Cada wireframe deverá representar:

* título ou contexto;
* navegação;
* conteúdo principal;
* ação primária;
* ações secundárias;
* estado da tela;
* relação com outras superfícies.

---

## 112. Wireframes de estados

Telas críticas deverão possuir variações para:

* carregamento;
* vazio;
* sucesso;
* erro;
* dados parciais;
* salvamento;
* falha externa.

---

## 113. Wireframes responsivos

Os wireframes não deverão apenas reduzir o mesmo layout.

Devem representar:

* reorganização;
* prioridades diferentes;
* mudanças de navegação;
* painéis convertidos em páginas ou sheets;
* ações adaptadas ao dispositivo.

---

## 114. Fidelidade

Os wireframes deverão ser inicialmente de baixa fidelidade.

Eles deverão priorizar:

* hierarquia;
* conteúdo;
* navegação;
* ações;
* estados;
* distribuição espacial.

Não deverão definir antecipadamente:

* identidade visual final;
* cores definitivas;
* tipografia definitiva;
* ilustrações finais;
* detalhes decorativos.

---

## 115. Anotação

Cada wireframe deverá possuir:

* identificador da tela;
* dispositivo;
* estado;
* fluxo relacionado;
* ações principais;
* observações de interação.

---

# Parte XXII — Critérios de aceite das telas

## 116. Objetivo claro

Cada tela deverá possuir um objetivo principal identificável.

---

## 117. Ação principal clara

A ação prioritária deverá ser distinguível das ações secundárias.

---

## 118. Continuidade

A tela deverá preservar o contexto necessário para retorno e continuidade.

---

## 119. Estados completos

Telas críticas deverão tratar:

* carregamento;
* vazio;
* sucesso;
* erro.

---

## 120. Acessibilidade

A estrutura deverá permitir:

* navegação por teclado;
* leitura semântica;
* foco previsível;
* alternativa ao Mapa;
* alternativa ao arrastar;
* informação não dependente de cor.

---

## 121. Responsividade

A tela deverá permanecer funcional em celular e desktop nos contextos aplicáveis.

---

## 122. Rastreabilidade

Toda tela deverá estar associada a:

* fluxo;
* requisito;
* objeto de informação;
* área da Arquitetura da Informação.

---

# Parte XXIII — Superfícies pós-MVP

## 123. Colaboração

Superfícies futuras:

* participantes;
* convite;
* permissões;
* Preferências individuais;
* votação;
* comentários.

---

## 124. Orçamento detalhado

Superfícies futuras:

* resumo de orçamento;
* categorias;
* custos planejados;
* gastos realizados;
* alertas.

---

## 125. Clima e replanejamento

Superfícies futuras:

* previsão;
* alerta meteorológico;
* impacto no Roteiro;
* proposta alternativa.

---

## 126. Offline

Superfícies futuras:

* dados disponíveis offline;
* estado de sincronização;
* alterações pendentes;
* conflitos de sincronização.

---

## 127. Compartilhamento

Superfícies futuras:

* visualização compartilhada;
* configuração de acesso;
* link;
* exportação.

---

# Parte XXIV — Governança

## 128. Inclusão de nova tela

Uma nova tela só deverá ser criada quando:

* possuir objetivo próprio;
* não puder ser representada por estado ou painel existente;
* apoiar um fluxo validado;
* reduzir complexidade;
* possuir requisitos relacionados.

---

## 129. Inclusão de novo modal

Um modal só deverá ser criado quando:

* a decisão exigir foco temporário;
* o usuário precisar confirmar impacto;
* a tarefa for curta;
* não justificar navegação completa.

Modais não deverão ser utilizados para fluxos longos.

---

## 130. Inclusão de novo estado

Um estado deverá ser criado quando:

* mudar o comportamento;
* alterar a decisão do usuário;
* exigir mensagem específica;
* exigir ação de recuperação;
* afetar testes.

---

## 131. Remoção de tela

Uma tela poderá ser removida quando:

* seu objetivo for absorvido por outra;
* criar navegação desnecessária;
* não possuir fluxo válido;
* não possuir requisitos;
* testes demonstrarem baixa compreensão.

---

## 132. Alteração de responsabilidade

Quando uma tela assumir nova responsabilidade, deverão ser revisados:

* Arquitetura da Informação;
* Fluxos;
* Requisitos;
* wireframes;
* testes;
* rotas;
* métricas.

---

## 133. Uso por agentes de IA

Agentes que criem wireframes, componentes ou páginas deverão:

* utilizar os identificadores oficiais;
* não inventar telas sem rastreabilidade;
* representar estados obrigatórios;
* preservar diferenças entre mobile e desktop;
* manter Salvos e Roteiro distintos;
* preservar a Viagem como contexto;
* manter ações críticas acessíveis;
* documentar qualquer nova superfície necessária.

---

## 134. Checklist de revisão

Antes de aprovar este documento, verificar:

* todos os fluxos críticos possuem superfícies;
* todas as áreas da Arquitetura da Informação estão representadas;
* páginas e painéis estão diferenciados;
* mobile está contemplado;
* desktop está contemplado;
* estados vazios estão contemplados;
* erros estão contemplados;
* carregamento está contemplado;
* persistência está contemplada;
* falhas externas estão contempladas;
* acessibilidade está contemplada;
* ações destrutivas possuem confirmação;
* proposta de Roteiro está separada do Roteiro atual;
* telas possuem identificadores únicos;
* as superfícies podem ser transformadas em wireframes.

---

## 135. Declaração final

O Inventário de Telas estabelece as superfícies necessárias para transformar a Arquitetura da Informação e os Fluxos do Usuário em uma experiência concreta.

Ele define:

* quais telas existem;
* quais painéis apoiam essas telas;
* quais formulários são necessários;
* quais decisões exigem modais;
* quais estados precisam ser representados;
* quais variações mobile e desktop devem ser consideradas.

A próxima etapa deverá transformar este inventário em wireframes de baixa fidelidade, preservando hierarquia, navegação, conteúdo, estados e ações definidos neste documento.
