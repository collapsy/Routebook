---

id: RB-UX-002

title: Fluxos do Usuário
description: Define os fluxos de interação do RouteBook, incluindo entradas, decisões, transições, estados, exceções e resultados dos principais objetivos do usuário.

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
- user-flows
- navigation
- interaction
- mvp
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

next_documents:

- RB-UX-003
- RB-UX-004
- RB-UX-005
- RB-DOM-001
- RB-QA-001

ai_context:
priority: high
index: true
---

# RouteBook — Fluxos do Usuário

## 1. Propósito deste documento

Este documento define os Fluxos do Usuário do RouteBook.

Seu objetivo é transformar as Jornadas do Usuário, os Casos de Uso, os Requisitos e a Arquitetura da Informação em sequências claras de interação.

Os fluxos deverão especificar:

* onde o usuário inicia;
* qual objetivo deseja alcançar;
* quais telas ou superfícies utiliza;
* quais decisões precisa tomar;
* quais estados o sistema apresenta;
* como falhas são tratadas;
* como o usuário retorna ou continua;
* qual resultado encerra o fluxo.

Este documento deverá orientar:

* Inventário de Telas;
* wireframes;
* protótipos;
* especificações de interação;
* critérios de aceitação;
* testes de usabilidade;
* testes ponta a ponta;
* implementação da navegação.

---

## 2. Diferença entre jornada e fluxo

Uma Jornada do Usuário representa uma experiência ampla, que pode atravessar várias sessões e objetivos.

Um Fluxo do Usuário representa uma sequência específica de interações para concluir uma tarefa.

Exemplo:

```text
Jornada:
Planejar uma viagem

Fluxos relacionados:
- criar Viagem;
- definir Hospedagem;
- explorar Lugares;
- salvar opções;
- adicionar Atividades;
- revisar Roteiro.
```

---

## 3. Princípios dos fluxos

Todos os fluxos deverão preservar os seguintes princípios:

1. O usuário deve compreender o objetivo da etapa atual.
2. Informações opcionais não devem bloquear o fluxo.
3. O sistema deve preservar o contexto ao navegar entre áreas.
4. Ações concluídas devem possuir feedback.
5. Falhas devem possuir recuperação.
6. O usuário deve manter controle sobre decisões.
7. Fluxos críticos devem funcionar em celular.
8. A navegação não deve depender exclusivamente do Mapa.
9. Automação deve ser apresentada como sugestão.
10. Estados vazios devem orientar o próximo passo.
11. Retornos não devem apagar filtros ou seleção sem necessidade.
12. Fluxos destrutivos devem apresentar impacto antes da confirmação.

---

## 4. Convenção de identificação

Os fluxos utilizarão o padrão:

```text
RB-UF-XXX
```

Exemplo:

```text
RB-UF-001 — Criar Viagem
```

---

## 5. Elementos utilizados nos diagramas

### Início e fim

```text
(Início)
(Fim)
```

### Tela ou estado

```text
[Tela]
```

### Ação do usuário

```text
{Ação}
```

### Decisão

```text
<Decisão?>
```

### Processo do sistema

```text
[Sistema processa]
```

### Erro ou exceção

```text
! Erro
```

---

# Parte I — Mapa geral dos fluxos

## 6. Fluxo macro do RouteBook

```text
(Início)
   ↓
[Minhas Viagens]
   ↓
<Criar ou abrir Viagem?>
   ├── Criar
   │     ↓
   │ [Criação da Viagem]
   │     ↓
   │ [Visão Geral]
   │
   └── Abrir
         ↓
      [Viagem existente]
         ↓
      [Visão Geral]
         ↓
<Qual objetivo?>
   ├── Explorar Lugares
   ├── Consultar Mapa
   ├── Gerenciar Salvos
   ├── Montar Roteiro
   ├── Revisar Roteiro
   ├── Consultar Dia atual
   └── Alterar configurações
```

---

## 7. Fluxos críticos do MVP

Os fluxos críticos são:

| ID        | Fluxo                       |
| --------- | --------------------------- |
| RB-UF-001 | Criar Viagem                |
| RB-UF-002 | Retomar Viagem              |
| RB-UF-003 | Editar contexto da Viagem   |
| RB-UF-004 | Explorar Lugares            |
| RB-UF-005 | Pesquisar Lugar             |
| RB-UF-006 | Filtrar Lugares             |
| RB-UF-007 | Consultar Detalhes do Lugar |
| RB-UF-008 | Salvar Lugar                |
| RB-UF-009 | Consultar Salvos            |
| RB-UF-010 | Adicionar Lugar ao Roteiro  |
| RB-UF-011 | Consultar Roteiro           |
| RB-UF-012 | Editar Atividade            |
| RB-UF-013 | Reordenar Atividades        |
| RB-UF-014 | Mover Atividade entre dias  |
| RB-UF-015 | Remover Atividade           |
| RB-UF-016 | Adicionar Período livre     |
| RB-UF-017 | Consultar Mapa da Viagem    |
| RB-UF-018 | Consultar distância         |
| RB-UF-019 | Abrir rota externa          |
| RB-UF-020 | Gerar proposta de Roteiro   |
| RB-UF-021 | Revisar conflitos           |
| RB-UF-022 | Consultar Dia atual         |

---

# Parte II — Criação e retomada da Viagem

## 8. RB-UF-001 — Criar Viagem

### Objetivo

Criar uma Viagem com contexto mínimo suficiente para iniciar a experiência.

### Ponto de entrada

* Página inicial;
* Minhas Viagens;
* Estado vazio;
* ação global Criar Viagem.

### Pré-condições

* O usuário acessou o RouteBook.
* Não é necessário possuir Preferências configuradas.

### Fluxo principal

```text
(Início)
   ↓
[Minhas Viagens]
   ↓
{Selecionar Criar Viagem}
   ↓
[Etapa: Destino]
   ↓
{Pesquisar Destino}
   ↓
[Resultados de Destino]
   ↓
{Selecionar Destino}
   ↓
[Etapa: Datas]
   ↓
{Informar início e término}
   ↓
<Datas válidas?>
   ├── Não → [Erro de validação] → [Etapa: Datas]
   └── Sim
         ↓
      [Etapa: Hospedagem]
         ↓
      {Pesquisar Hospedagem}
         ↓
      <Hospedagem encontrada?>
         ├── Sim → {Selecionar Hospedagem}
         └── Não → {Tentar novamente ou usar referência provisória}
         ↓
      [Etapa: Viajantes]
         ↓
      {Informar quantidade}
         ↓
      [Resumo da criação]
         ↓
      {Confirmar}
         ↓
      [Criando Viagem]
         ↓
      <Criação concluída?>
         ├── Não → [Erro recuperável]
         └── Sim → [Visão Geral da Viagem]
                         ↓
                       (Fim)
```

### Informações obrigatórias

* Destino;
* data inicial;
* data final;
* quantidade de Viajantes;
* referência geográfica válida.

### Informações opcionais

* nome personalizado;
* Hospedagem definitiva;
* Preferências;
* orçamento;
* Ritmo;
* transporte.

### Regras de navegação

* O usuário deve poder voltar às etapas anteriores.
* Dados preenchidos devem ser preservados durante o fluxo.
* A etapa atual deve estar identificada.
* O usuário não deve ser enviado para Configurações antes de acessar a Viagem.

### Resultado

* Viagem criada;
* Dias gerados;
* usuário direcionado à Visão Geral.

---

## 9. Fluxo alternativo — Hospedagem provisória

```text
[Etapa: Hospedagem]
   ↓
{Não encontrei ou ainda não defini}
   ↓
[Opções alternativas]
   ├── Selecionar Região no Mapa
   ├── Informar endereço
   └── Usar centro do Destino
         ↓
[Aviso: referência provisória]
         ↓
{Confirmar}
         ↓
[Continuar criação]
```

O produto deverá indicar que Distâncias e Recomendações poderão mudar.

---

## 10. Fluxo de erro — Falha ao criar Viagem

```text
[Processando criação]
   ↓
! Falha de persistência
   ↓
[Mensagem de erro]
   ↓
<Qual ação?>
   ├── Tentar novamente
   ├── Voltar e revisar
   └── Cancelar
```

Os dados preenchidos deverão ser preservados enquanto a sessão estiver ativa, quando possível.

---

## 11. RB-UF-002 — Retomar Viagem

### Objetivo

Abrir uma Viagem já existente e continuar do último estado válido.

### Fluxo principal

```text
(Início)
   ↓
[Minhas Viagens]
   ↓
{Selecionar Viagem}
   ↓
[Carregando Viagem]
   ↓
<Carregamento completo?>
   ├── Sim → [Visão Geral]
   └── Parcial → [Visão Geral com aviso]
                     ↓
                   (Fim)
```

### Comportamento contextual

#### Viagem futura

Priorizar:

* próximo passo;
* Roteiro;
* Salvos;
* alertas.

#### Viagem em andamento

Priorizar:

* Dia atual;
* próxima Atividade;
* Distância;
* rota.

#### Viagem sem planejamento

Priorizar:

* Explorar;
* configurar contexto;
* gerar proposta.

---

## 12. Fluxo de erro — Viagem indisponível

```text
{Selecionar Viagem}
   ↓
! Viagem não encontrada ou sem acesso
   ↓
[Mensagem segura]
   ↓
{Voltar para Minhas Viagens}
```

O sistema não deverá expor dados privados ou detalhes técnicos.

---

## 13. RB-UF-003 — Editar contexto da Viagem

### Objetivo

Alterar dados gerais e Preferências.

### Ponto de entrada

* Visão Geral;
* Configurações da Viagem;
* solicitação contextual.

### Fluxo principal

```text
[Viagem]
   ↓
{Abrir Configurações}
   ↓
[Configurações da Viagem]
   ↓
{Selecionar seção}
   ├── Informações gerais
   ├── Hospedagem
   ├── Interesses
   ├── Orçamento
   ├── Transporte
   ├── Ritmo
   └── Restrições
         ↓
{Editar dados}
   ↓
<Alteração estrutural?>
   ├── Não → {Salvar}
   └── Sim → [Resumo de impacto] → {Confirmar}
         ↓
[Salvando]
   ↓
<Sucesso?>
   ├── Não → [Erro e nova tentativa]
   └── Sim → [Confirmação]
                  ↓
                (Fim)
```

### Alterações estruturais

* Destino;
* Período;
* Hospedagem;
* Meio de transporte predominante.

### Regras

* O impacto deve ser informado antes da confirmação.
* O usuário deve permanecer na seção após salvar.
* Recomendações e Distâncias afetadas devem ser recalculadas.

---

# Parte III — Descoberta

## 14. RB-UF-004 — Explorar Lugares

### Objetivo

Descobrir opções relevantes no Destino.

### Pontos de entrada

* navegação Explorar;
* Visão Geral;
* Estado vazio de Salvos;
* Dia vazio;
* Recomendação contextual.

### Fluxo principal

```text
[Viagem]
   ↓
{Abrir Explorar}
   ↓
[Explorar]
   ↓
[Carregando resultados]
   ↓
<Resultados disponíveis?>
   ├── Não → [Estado sem resultados]
   └── Sim → [Lista e/ou Mapa]
                  ↓
          {Navegar pelos Lugares}
                  ↓
          <Qual ação?>
             ├── Abrir Detalhes
             ├── Salvar
             ├── Adicionar ao Roteiro
             ├── Ver no Mapa
             ├── Pesquisar
             └── Aplicar filtros
```

### Estado inicial

A área deverá utilizar:

* Destino;
* Hospedagem;
* Preferências;
* filtros padrão neutros.

### Preservação de contexto

Ao retornar de Detalhes, devem ser preservados:

* pesquisa;
* filtros;
* ordenação;
* posição da lista;
* Região do Mapa;
* Lugar previamente selecionado.

---

## 15. Estado sem resultados em Explorar

```text
[Explorar]
   ↓
[Nenhum resultado]
   ↓
[Explicação]
   ↓
<Próxima ação?>
   ├── Limpar filtros
   ├── Ampliar Distância
   ├── Alterar categoria
   ├── Pesquisar outro termo
   └── Mover Região do Mapa
```

---

## 16. RB-UF-005 — Pesquisar Lugar

### Objetivo

Encontrar um Lugar específico.

### Fluxo principal

```text
[Explorar]
   ↓
{Selecionar campo de pesquisa}
   ↓
{Informar termo}
   ↓
[Buscando]
   ↓
<Resultados encontrados?>
   ├── Não → [Nenhum resultado]
   └── Sim → [Resultados da pesquisa]
                  ↓
          {Selecionar Lugar}
                  ↓
          [Detalhes do Lugar]
```

### Comportamentos

* A pesquisa deve considerar o Destino.
* Resultados fora do Destino devem ser identificados.
* Limpar o termo deve restaurar o estado anterior ou a Descoberta padrão.

---

## 17. Fluxo alternativo — Resultado fora do Destino

```text
[Resultados]
   ↓
{Selecionar Lugar fora do Destino}
   ↓
[Aviso de localização]
   ↓
<Continuar?>
   ├── Não → [Resultados]
   └── Sim → [Detalhes do Lugar]
```

---

## 18. RB-UF-006 — Filtrar Lugares

### Objetivo

Reduzir os resultados conforme critérios relevantes.

### Fluxo principal

```text
[Explorar]
   ↓
{Abrir Filtros}
   ↓
[Painel de Filtros]
   ↓
{Selecionar critérios}
   ↓
{Aplicar}
   ↓
[Atualizando resultados]
   ↓
<Resultados disponíveis?>
   ├── Não → [Estado sem resultados filtrados]
   └── Sim → [Lista e Mapa atualizados]
```

### Filtros obrigatórios do MVP

* Categoria;
* Distância;
* Faixa de preço.

### Regras

* Filtros ativos devem permanecer visíveis.
* O usuário deve conseguir remover um filtro isoladamente.
* Deve existir ação Limpar todos.
* Fechar o painel sem aplicar não deve alterar resultados, caso esse seja o padrão escolhido.

---

# Parte IV — Detalhes e ações sobre Lugares

## 19. RB-UF-007 — Consultar Detalhes do Lugar

### Objetivo

Avaliar um Lugar e decidir o que fazer com ele.

### Pontos de entrada

* Explorar;
* Mapa;
* Salvos;
* Roteiro;
* Recomendação.

### Fluxo principal

```text
[Lista, Mapa ou Roteiro]
   ↓
{Selecionar Lugar}
   ↓
[Carregando Detalhes]
   ↓
[Detalhes do Lugar]
   ↓
<Qual ação?>
   ├── Salvar
   ├── Remover dos Salvos
   ├── Adicionar ao Roteiro
   ├── Ver no Mapa
   ├── Abrir rota
   └── Voltar
```

### Conteúdo prioritário

* nome;
* categoria;
* Distância;
* Tempo de deslocamento;
* horário;
* Faixa de preço;
* Justificativa;
* ações.

### Regras de retorno

Ao voltar, o usuário deve retornar ao contexto de origem.

---

## 20. Estado parcial dos Detalhes

```text
[Detalhes do Lugar]
   ↓
<Algum dado indisponível?>
   ├── Não → [Conteúdo completo]
   └── Sim → [Conteúdo disponível + indicação de ausência]
```

A ausência de fotografias, horário ou preço não deve impedir acesso às demais informações.

---

## 21. RB-UF-008 — Salvar Lugar

### Objetivo

Manter um Lugar como opção sem adicioná-lo ao Roteiro.

### Pontos de entrada

* Cartão;
* Detalhes;
* Mapa;
* Recomendação.

### Fluxo principal

```text
[Lugar]
   ↓
{Selecionar Salvar}
   ↓
[Estado otimista ou salvando]
   ↓
<Salvamento concluído?>
   ├── Sim → [Estado Salvo]
   └── Não → [Estado anterior + erro]
```

### Regras

* A ação não deve redirecionar o usuário.
* O estado deve mudar em todas as áreas.
* Repetir a ação não deve criar duplicação.
* Salvar não adiciona ao Roteiro.

---

## 22. Fluxo — Remover dos Salvos

```text
[Lugar salvo]
   ↓
{Selecionar Remover dos Salvos}
   ↓
<Está no Roteiro?>
   ├── Não → [Remover associação]
   └── Sim → [Remover dos Salvos e manter Atividade]
         ↓
[Atualizar estados]
```

---

## 23. RB-UF-009 — Consultar Salvos

### Objetivo

Revisar Lugares mantidos como opções.

### Fluxo principal

```text
[Viagem]
   ↓
{Abrir Salvos}
   ↓
<Existem Lugares salvos?>
   ├── Não → [Estado vazio]
   └── Sim → [Lista de Salvos]
                  ↓
          <Qual ação?>
             ├── Abrir Detalhes
             ├── Ver no Mapa
             ├── Adicionar ao Roteiro
             ├── Remover dos Salvos
             └── Filtrar
```

### Estado vazio

Deverá direcionar para Explorar.

---

# Parte V — Construção do Roteiro

## 24. RB-UF-010 — Adicionar Lugar ao Roteiro

### Objetivo

Transformar um Lugar em uma Atividade planejada.

### Pontos de entrada

* Detalhes;
* Cartão;
* Mapa;
* Salvos;
* Recomendação.

### Fluxo principal

```text
[Lugar]
   ↓
{Selecionar Adicionar ao Roteiro}
   ↓
[Selecionar Dia]
   ↓
{Escolher Dia}
   ↓
[Configuração opcional]
   ├── Horário
   ├── Duração
   └── Observação
         ↓
[Verificação de conflitos]
   ↓
<Existe conflito?>
   ├── Não → {Confirmar}
   └── Sim → [Apresentar alerta]
                ↓
          <Decisão?>
             ├── Ajustar
             ├── Confirmar mesmo assim
             └── Cancelar
         ↓
[Salvando Atividade]
   ↓
<Sucesso?>
   ├── Não → [Erro]
   └── Sim → [Confirmação]
                  ↓
          <Próxima ação?>
             ├── Continuar explorando
             └── Ver Dia no Roteiro
```

### Regras

* Horário não é obrigatório.
* O usuário deve identificar claramente o Dia escolhido.
* Conflitos não bloqueantes podem ser aceitos.
* O Lugar pode permanecer salvo ou não.

---

## 25. Fluxo alternativo — Lugar já planejado

```text
{Adicionar ao Roteiro}
   ↓
[Lugar já existe no Roteiro]
   ↓
<Qual ação?>
   ├── Ver Atividade existente
   ├── Adicionar nova visita
   └── Cancelar
```

A opção de nova visita deverá existir apenas quando fizer sentido.

---

## 26. RB-UF-011 — Consultar Roteiro

### Objetivo

Visualizar os Dias e Atividades da Viagem.

### Fluxo principal

```text
[Viagem]
   ↓
{Abrir Roteiro}
   ↓
[Roteiro]
   ↓
<Existe planejamento?>
   ├── Não → [Estado vazio do Roteiro]
   └── Sim → [Dia selecionado]
                  ↓
          <Qual ação?>
             ├── Selecionar outro Dia
             ├── Adicionar Atividade
             ├── Adicionar Período livre
             ├── Editar Atividade
             ├── Reordenar
             ├── Ver Mapa do Dia
             ├── Revisar alertas
             └── Gerar proposta
```

### Estado vazio

Ações sugeridas:

* Explorar Lugares;
* adicionar Lugar;
* gerar proposta;
* criar Atividade manual.

---

## 27. Navegação entre Dias

```text
[Roteiro]
   ↓
{Selecionar Dia}
   ↓
[Carregar Dia]
   ↓
<Existe conteúdo?>
   ├── Não → [Dia vazio]
   └── Sim → [Atividades e Deslocamentos]
```

A seleção do Dia deve permanecer ao abrir e fechar Detalhes.

---

## 28. RB-UF-012 — Editar Atividade

### Objetivo

Alterar horário, duração, observação ou outros dados.

### Fluxo principal

```text
[Roteiro]
   ↓
{Selecionar Atividade}
   ↓
[Detalhes da Atividade]
   ↓
{Selecionar Editar}
   ↓
[Formulário de edição]
   ↓
{Alterar dados}
   ↓
[Verificar impacto]
   ↓
<Existe alerta?>
   ├── Não → {Salvar}
   └── Sim → [Apresentar impacto] → {Confirmar ou ajustar}
         ↓
[Salvando]
   ↓
[Atividade atualizada]
```

### Regras

* Dados atuais devem estar preenchidos.
* Cancelar deve preservar o estado anterior.
* Mudanças devem atualizar Deslocamentos e alertas.

---

## 29. RB-UF-013 — Reordenar Atividades

### Objetivo

Alterar a sequência de Atividades em um Dia.

### Fluxo por arrastar

```text
[Dia da Viagem]
   ↓
{Arrastar Atividade}
   ↓
[Prévia da nova posição]
   ↓
{Soltar}
   ↓
[Recalcular sequência]
   ↓
[Atualizar Deslocamentos e alertas]
   ↓
[Salvar nova ordem]
```

### Fluxo alternativo acessível

```text
[Atividade]
   ↓
{Abrir menu de posição}
   ↓
<Qual ação?>
   ├── Mover para cima
   ├── Mover para baixo
   └── Selecionar posição
         ↓
[Atualizar ordem]
```

### Regras

* Arrastar não pode ser o único método.
* Falha ao salvar deve restaurar ou identificar a ordem anterior.

---

## 30. RB-UF-014 — Mover Atividade entre dias

### Objetivo

Transferir uma Atividade para outro Dia.

### Fluxo principal

```text
[Atividade]
   ↓
{Selecionar Mover para outro dia}
   ↓
[Lista de Dias]
   ↓
{Selecionar novo Dia}
   ↓
<Preservar horário?>
   ├── Sim
   ├── Remover horário
   └── Definir novo horário
         ↓
[Verificar conflitos]
         ↓
{Confirmar}
         ↓
[Mover Atividade]
         ↓
[Atualizar os dois Dias]
```

---

## 31. RB-UF-015 — Remover Atividade

### Objetivo

Retirar uma Atividade do Roteiro.

### Fluxo principal

```text
[Atividade]
   ↓
{Selecionar Remover}
   ↓
[Confirmação]
   ↓
<Confirmar?>
   ├── Não → [Voltar]
   └── Sim → [Removendo]
                  ↓
          [Atualizar Roteiro]
                  ↓
          <Lugar estava salvo?>
             ├── Sim → [Manter em Salvos]
             └── Não → [Nenhuma associação]
```

### Regras

* Remover Atividade não remove dos Salvos.
* O Dia deve permanecer selecionado.
* Deslocamentos devem ser recalculados.

---

## 32. RB-UF-016 — Adicionar Período livre

### Objetivo

Registrar um intervalo intencionalmente não planejado.

### Fluxo principal

```text
[Dia da Viagem]
   ↓
{Adicionar Período livre}
   ↓
[Configurar período]
   ├── Horário opcional
   ├── Duração
   ├── Observação
   └── Bloqueado ou flexível
         ↓
{Salvar}
         ↓
[Período livre no Roteiro]
```

### Regras

* Período livre não deve ser apresentado como erro.
* Um período bloqueado não pode ser preenchido automaticamente.

---

# Parte VI — Mapa e deslocamentos

## 33. RB-UF-017 — Consultar Mapa da Viagem

### Objetivo

Compreender a distribuição geográfica dos elementos da Viagem.

### Fluxo principal

```text
[Viagem]
   ↓
{Abrir Mapa}
   ↓
[Carregando Mapa]
   ↓
<Mapa disponível?>
   ├── Não → [Lista alternativa + erro]
   └── Sim → [Mapa da Viagem]
                  ↓
          {Selecionar contexto}
             ├── Todos
             ├── Explorar
             ├── Salvos
             ├── Roteiro
             └── Dia específico
                  ↓
          {Selecionar Marcador}
                  ↓
          [Resumo do Lugar ou Atividade]
                  ↓
          <Qual ação?>
             ├── Abrir Detalhes
             ├── Salvar
             ├── Adicionar ao Roteiro
             ├── Abrir Atividade
             └── Abrir rota
```

### Regras

* O contexto atual do Mapa deve estar visível.
* A Hospedagem deve possuir identificação distinta.
* Deve existir alternativa em lista.

---

## 34. Fluxo — Sincronização entre lista e Mapa

```text
[Lista + Mapa]
   ↓
{Selecionar item na lista}
   ↓
[Destacar Marcador]
```

```text
[Lista + Mapa]
   ↓
{Selecionar Marcador}
   ↓
[Destacar item ou abrir resumo]
```

---

## 35. RB-UF-018 — Consultar Distância

### Objetivo

Conhecer Distância e Tempo de deslocamento entre dois pontos.

### Pontos de entrada

* Cartão;
* Detalhes;
* Roteiro;
* Mapa;
* Salvos.

### Fluxo principal

```text
[Lugar ou Atividade]
   ↓
{Consultar Distância}
   ↓
<Origem definida?>
   ├── Sim → [Usar origem]
   └── Não → [Selecionar origem]
                ├── Hospedagem
                ├── Atividade anterior
                ├── Localização atual
                └── Endereço
         ↓
<Meio de transporte definido?>
   ├── Sim → [Calcular]
   └── Não → [Selecionar transporte] → [Calcular]
         ↓
<Resultados disponíveis?>
   ├── Sim → [Distância + Tempo estimado]
   └── Não → [Estado indisponível + alternativas]
```

### Alternativas em falha

* Distância geográfica;
* abrir serviço externo;
* tentar novamente.

---

## 36. RB-UF-019 — Abrir rota externa

### Objetivo

Iniciar navegação em um serviço especializado.

### Fluxo principal

```text
[Lugar ou Atividade]
   ↓
{Selecionar Abrir rota}
   ↓
<Origem disponível?>
   ├── Sim
   └── Não → [Selecionar origem]
         ↓
[Preparar rota externa]
   ↓
<Aplicativo disponível?>
   ├── Sim → [Abrir aplicativo]
   └── Não → [Abrir versão web]
         ↓
(Saída temporária do RouteBook)
```

Ao retornar, o contexto anterior deverá ser preservado quando possível.

---

# Parte VII — Geração e revisão

## 37. RB-UF-020 — Gerar proposta de Roteiro

### Objetivo

Receber uma organização inicial editável.

### Pontos de entrada

* Roteiro vazio;
* Roteiro parcial;
* Visão Geral;
* Salvos.

### Fluxo principal

```text
[Roteiro]
   ↓
{Selecionar Gerar proposta}
   ↓
[Resumo do contexto utilizado]
   ↓
<Dados suficientes?>
   ├── Não → [Dados ausentes]
   │             ↓
   │       <Qual ação?>
   │          ├── Completar contexto
   │          ├── Adicionar Lugares
   │          └── Gerar versão limitada
   │
   └── Sim
         ↓
      {Confirmar geração}
         ↓
      [Gerando proposta]
         ↓
      <Sucesso?>
         ├── Não → [Erro + tentar novamente]
         └── Sim → [Visualização da proposta]
                         ↓
                 <Qual ação?>
                    ├── Aceitar
                    ├── Aceitar parcialmente
                    ├── Editar
                    ├── Gerar novamente
                    └── Descartar
```

### Regras

* O Roteiro existente não deve ser substituído antes da aceitação.
* Limitações devem ser apresentadas.
* Restrições e Períodos livres bloqueados devem ser respeitados.

---

## 38. Fluxo — Aceitar proposta

```text
[Proposta]
   ↓
{Aceitar}
   ↓
<Existe Roteiro anterior?>
   ├── Não → [Aplicar proposta]
   └── Sim → [Mostrar impacto]
                ↓
          {Confirmar}
                ↓
          [Aplicar proposta]
                ↓
          [Roteiro atualizado]
```

---

## 39. Fluxo — Descartar proposta

```text
[Proposta]
   ↓
{Descartar}
   ↓
[Confirmação opcional]
   ↓
[Retornar ao Roteiro anterior]
```

Nenhuma alteração anterior deve ser perdida.

---

## 40. RB-UF-021 — Revisar conflitos

### Objetivo

Identificar e tratar problemas de viabilidade.

### Fluxo principal

```text
[Roteiro]
   ↓
{Selecionar Revisar}
   ↓
[Analisando Roteiro]
   ↓
<Existem alertas?>
   ├── Não → [Roteiro sem alertas conhecidos]
   └── Sim → [Lista de alertas]
                  ↓
          {Selecionar alerta}
                  ↓
          [Detalhe do impacto]
                  ↓
          <Qual ação?>
             ├── Editar
             ├── Mover
             ├── Remover
             ├── Solicitar alternativa
             └── Ignorar
                  ↓
          [Atualizar revisão]
```

### Classificações

* erro;
* risco;
* sugestão.

### Regras

* Erros bloqueantes não podem ser ignorados.
* Riscos podem ser aceitos.
* Sugestões são opcionais.
* O alerta deve levar ao elemento afetado.

---

# Parte VIII — Uso durante a Viagem

## 41. RB-UF-022 — Consultar Dia atual

### Objetivo

Acessar rapidamente o planejamento do dia em andamento.

### Ponto de entrada

* abertura da Viagem durante o Período;
* Visão Geral;
* Roteiro.

### Fluxo principal

```text
[Abrir Viagem]
   ↓
<Data atual dentro do Período?>
   ├── Não → [Visão Geral padrão]
   └── Sim → [Resumo do Dia atual]
                  ↓
          <Existe próxima Atividade?>
             ├── Não → [Dia livre ou sem horário]
             └── Sim → [Próxima Atividade]
                            ↓
                    <Qual ação?>
                       ├── Abrir Detalhes
                       ├── Abrir rota
                       ├── Editar
                       ├── Encontrar opção próxima
                       └── Ver Dia completo
```

### Informações prioritárias

* horário;
* nome;
* localização;
* Distância;
* Tempo de deslocamento;
* rota;
* alerta.

---

## 42. Fluxo — Dia atual sem Atividades

```text
[Dia atual vazio]
   ↓
<Qual ação?>
   ├── Explorar próximo
   ├── Ver Salvos
   ├── Adicionar Atividade
   └── Manter Dia livre
```

---

## 43. Fluxo — Localização atual

```text
{Encontrar opção próxima}
   ↓
<Permissão de localização?>
   ├── Concedida → [Usar Localização atual]
   ├── Negada → [Selecionar outra referência]
   └── Não solicitada → [Solicitar permissão]
```

Negar permissão não deverá bloquear a funcionalidade principal.

---

# Parte IX — Fluxos de estados e recuperação

## 44. Fluxo padrão de carregamento

```text
{Iniciar ação}
   ↓
[Estado de carregamento]
   ↓
<Resultado?>
   ├── Sucesso → [Conteúdo]
   ├── Vazio → [Estado vazio]
   ├── Parcial → [Conteúdo parcial + aviso]
   └── Erro → [Mensagem + recuperação]
```

---

## 45. Fluxo padrão de salvamento

```text
{Alterar dado}
   ↓
[Salvando]
   ↓
<Resultado?>
   ├── Sucesso → [Salvo]
   └── Falha → [Não salvo]
                    ↓
            <Qual ação?>
               ├── Tentar novamente
               ├── Revisar
               └── Descartar alteração
```

---

## 46. Fluxo padrão de ação destrutiva

```text
{Solicitar ação destrutiva}
   ↓
[Explicar impacto]
   ↓
<Confirmar?>
   ├── Não → [Estado anterior]
   └── Sim → [Executar]
                  ↓
          <Sucesso?>
             ├── Sim → [Confirmação]
             └── Não → [Erro + preservar estado]
```

---

## 47. Fluxo de falha do Mapa

```text
[Carregando Mapa]
   ↓
! Falha
   ↓
[Mensagem de indisponibilidade]
   ↓
[Visualização em lista]
   ↓
<Qual ação?>
   ├── Tentar novamente
   ├── Continuar em lista
   └── Abrir serviço externo
```

---

## 48. Fluxo de falha parcial de dados do Lugar

```text
[Detalhes do Lugar]
   ↓
<Dados incompletos?>
   ├── Não → [Detalhes completos]
   └── Sim → [Mostrar dados disponíveis]
                  ↓
          [Identificar ausências]
                  ↓
          [Manter ações possíveis]
```

---

## 49. Fluxo de sessão ou acesso expirado

```text
{Executar ação protegida}
   ↓
! Sessão inválida
   ↓
[Solicitar autenticação]
   ↓
<Autenticação concluída?>
   ├── Não → [Preservar dados locais quando possível]
   └── Sim → [Retomar ação ou contexto]
```

---

# Parte X — Fluxos mobile

## 50. Navegação principal mobile

```text
[Viagem]
   ↓
[Navegação inferior]
   ├── Viagem
   ├── Explorar
   ├── Mapa
   ├── Roteiro
   └── Salvos
```

### Regras

* A área ativa deve estar identificada.
* A navegação deve permanecer disponível nos fluxos principais.
* Detalhes podem ocupar a tela inteira.
* Voltar deve preservar o contexto anterior.

---

## 51. Fluxo mobile — Explorar e adicionar

```text
[Explorar]
   ↓
{Selecionar Cartão}
   ↓
[Detalhes em tela cheia]
   ↓
{Adicionar ao Roteiro}
   ↓
[Painel de seleção de Dia]
   ↓
{Confirmar}
   ↓
[Feedback]
   ↓
{Fechar}
   ↓
[Retornar a Explorar na mesma posição]
```

---

## 52. Fluxo mobile — Editar Roteiro

```text
[Roteiro]
   ↓
{Selecionar Dia}
   ↓
[Lista de Atividades]
   ↓
{Selecionar Atividade}
   ↓
[Painel ou página de Detalhes]
   ↓
{Editar}
   ↓
[Formulário]
   ↓
{Salvar}
   ↓
[Retornar ao mesmo Dia]
```

---

## 53. Fluxo mobile — Mapa

```text
[Mapa]
   ↓
{Selecionar Marcador}
   ↓
[Painel inferior]
   ↓
<Qual ação?>
   ├── Abrir Detalhes
   ├── Salvar
   ├── Adicionar
   └── Fechar
```

O painel não deve impedir o usuário de compreender qual Marcador está selecionado.

---

# Parte XI — Fluxos desktop

## 54. Fluxo desktop — Explorar em múltiplos painéis

```text
[Explorar]
   ├── Filtros
   ├── Lista
   └── Mapa
         ↓
{Selecionar Lugar}
         ↓
[Painel de Detalhes]
```

A lista e o Mapa devem permanecer visíveis quando houver espaço suficiente.

---

## 55. Fluxo desktop — Roteiro e Mapa do Dia

```text
[Roteiro]
   ├── Lista de Dias
   ├── Atividades do Dia
   └── Mapa do Dia
```

Selecionar uma Atividade deve destacar seu ponto no Mapa.

Selecionar um ponto deve identificar a Atividade.

---

# Parte XII — Matriz entre fluxos e áreas

## 56. Matriz de navegação

| Fluxo                | Área inicial   | Área final principal     |
| -------------------- | -------------- | ------------------------ |
| Criar Viagem         | Minhas Viagens | Visão Geral              |
| Retomar Viagem       | Minhas Viagens | Visão Geral ou Dia atual |
| Editar contexto      | Visão Geral    | Configurações            |
| Explorar Lugares     | Visão Geral    | Explorar                 |
| Pesquisar Lugar      | Explorar       | Detalhes                 |
| Filtrar Lugares      | Explorar       | Explorar                 |
| Consultar Detalhes   | Várias         | Detalhes                 |
| Salvar Lugar         | Várias         | Mesma área               |
| Consultar Salvos     | Navegação      | Salvos                   |
| Adicionar ao Roteiro | Várias         | Mesma área ou Roteiro    |
| Consultar Roteiro    | Navegação      | Roteiro                  |
| Editar Atividade     | Roteiro        | Roteiro                  |
| Consultar Mapa       | Navegação      | Mapa                     |
| Gerar proposta       | Roteiro        | Proposta                 |
| Revisar conflitos    | Roteiro        | Revisão                  |
| Consultar Dia atual  | Visão Geral    | Roteiro do Dia           |

---

# Parte XIII — Critérios de transição

## 57. Preservação de contexto

As transições deverão preservar, quando aplicável:

* Viagem selecionada;
* Dia selecionado;
* filtros;
* termo de pesquisa;
* posição da lista;
* Região do Mapa;
* Lugar selecionado;
* origem da navegação.

---

## 58. Transições que podem limpar contexto

O contexto só deverá ser limpo quando:

* o usuário solicitar;
* a Viagem mudar;
* o Destino mudar;
* a informação deixar de ser válida;
* a segurança exigir;
* a sessão for encerrada.

---

## 59. Feedback de transição

A mudança entre telas deverá indicar:

* destino da navegação;
* carregamento;
* erro;
* conclusão de ação;
* alteração pendente.

---

## 60. Navegação de retorno

O retorno deverá priorizar:

1. contexto de origem;
2. estado anterior;
3. posição anterior;
4. alternativa segura.

O usuário não deverá ser enviado sempre para a Visão Geral ao fechar uma tela contextual.

---

# Parte XIV — Fluxos de acessibilidade

## 61. Fluxo por teclado

Fluxos críticos deverão permitir:

* acessar navegação;
* percorrer resultados;
* abrir Detalhes;
* salvar;
* adicionar ao Roteiro;
* selecionar Dia;
* editar;
* reordenar;
* confirmar;
* cancelar.

---

## 62. Fluxo com leitor de tela

Mudanças relevantes deverão ser anunciadas:

* carregamento concluído;
* filtro aplicado;
* Lugar salvo;
* Atividade adicionada;
* erro;
* conflito;
* mudança de Dia;
* confirmação.

---

## 63. Fluxo alternativo ao Mapa

```text
[Mapa indisponível ou não utilizado]
   ↓
[Lista equivalente]
   ↓
{Selecionar Lugar}
   ↓
[Informações geográficas textuais]
   ↓
<Qual ação?>
   ├── Abrir Detalhes
   ├── Salvar
   ├── Adicionar
   └── Abrir rota
```

---

## 64. Fluxo alternativo ao arrastar

```text
[Atividade]
   ↓
{Abrir ações de posição}
   ↓
{Mover para cima, baixo ou posição específica}
   ↓
[Confirmar nova ordem]
```

---

# Parte XV — Fluxos fora do MVP

## 65. Compartilhar Roteiro

```text
[Roteiro]
   ↓
{Compartilhar}
   ↓
[Definir formato e acesso]
   ↓
[Gerar compartilhamento]
```

Pós-MVP.

---

## 66. Convidar participante

```text
[Configurações da Viagem]
   ↓
{Convidar}
   ↓
[Informar contato]
   ↓
[Definir permissão]
   ↓
[Enviar convite]
```

Pós-MVP.

---

## 67. Votar em Lugar

```text
[Lugar]
   ↓
{Registrar interesse}
   ↓
[Atualizar resultado do grupo]
```

Pós-MVP.

---

## 68. Replanejar por clima

```text
[Alerta meteorológico]
   ↓
{Revisar impacto}
   ↓
[Proposta alternativa]
   ↓
{Aceitar ou editar}
```

Pós-MVP.

---

## 69. Uso offline

```text
[Sem conexão]
   ↓
[Dados locais disponíveis]
   ↓
{Consultar ou editar}
   ↓
[Alteração pendente]
   ↓
[Reconectar]
   ↓
[Sincronizar]
```

Pós-MVP.

---

# Parte XVI — Validação dos fluxos

## 70. Critérios de validação

Cada fluxo deverá ser validado quanto a:

* compreensão do objetivo;
* clareza do próximo passo;
* quantidade de etapas;
* preservação do contexto;
* feedback;
* recuperação de erros;
* funcionamento móvel;
* acessibilidade;
* consistência com os requisitos.

---

## 71. Fluxos prioritários para teste de usabilidade

1. Criar Viagem.
2. Explorar e salvar Lugar.
3. Adicionar Lugar ao Roteiro.
4. Editar e mover Atividade.
5. Consultar Mapa e Distância.
6. Gerar e revisar proposta.
7. Consultar Dia atual.
8. Retomar Viagem.

---

## 72. Perguntas para teste

* O usuário sabe por onde começar?
* Entende a diferença entre Salvar e Adicionar ao Roteiro?
* Consegue retornar sem perder contexto?
* Compreende os alertas?
* Consegue editar sem reconstruir o Roteiro?
* Percebe que a proposta é opcional?
* Consegue usar o produto sem depender do Mapa?
* Consegue concluir as ações no celular?
* Entende quando uma alteração foi salva?
* Consegue recuperar-se de uma falha?

---

## 73. Indicadores possíveis

* taxa de conclusão;
* tempo por fluxo;
* abandono;
* retorno incorreto;
* erros;
* tentativas repetidas;
* uso de Voltar;
* perda de contexto;
* necessidade de ajuda;
* ações canceladas;
* falhas de salvamento.

---

# Parte XVII — Relação com o Inventário de Telas

## 74. Telas derivadas dos fluxos

Os fluxos indicam a necessidade das seguintes superfícies:

* Minhas Viagens;
* Criar Viagem;
* Visão Geral;
* Explorar;
* Filtros;
* Detalhes do Lugar;
* Mapa;
* Salvos;
* Roteiro;
* Dia da Viagem;
* Detalhes da Atividade;
* Edição de Atividade;
* Seleção de Dia;
* Configurações;
* Proposta de Roteiro;
* Revisão de conflitos.

---

## 75. Estados derivados

Também serão necessárias representações para:

* carregamento;
* erro;
* vazio;
* parcial;
* salvando;
* salvo;
* não salvo;
* confirmação;
* conflito;
* indisponibilidade externa.

Essas superfícies serão formalizadas no `RB-UX-003 — Inventário de Telas`.

---

# Parte XVIII — Governança

## 76. Inclusão de novo fluxo

Um novo fluxo deverá ser criado quando:

* representar objetivo distinto;
* atravessar mais de uma interação;
* possuir decisões ou exceções próprias;
* precisar de validação específica;
* não estiver coberto por fluxo existente.

---

## 77. Alteração de fluxo

Um fluxo deverá ser revisado quando:

* a Arquitetura da Informação mudar;
* um Caso de Uso mudar;
* um requisito mudar;
* testes revelarem dificuldade;
* uma tela for removida;
* uma integração alterar etapas;
* a experiência móvel exigir adaptação.

---

## 78. Uso por agentes de IA

Agentes que criem telas, protótipos ou código deverão:

* seguir os pontos de entrada definidos;
* preservar decisões e exceções;
* manter feedback de ações;
* tratar carregamento, vazio e erro;
* preservar contexto no retorno;
* não criar redirecionamentos arbitrários;
* respeitar caminhos acessíveis;
* manter rastreabilidade com os Casos de Uso.

---

## 79. Checklist de revisão

Antes de aprovar este documento, verificar:

* todos os fluxos críticos do MVP estão cobertos;
* cada fluxo possui início e resultado;
* decisões estão representadas;
* erros estão tratados;
* retorno preserva contexto;
* mobile está contemplado;
* desktop está contemplado;
* acessibilidade está contemplada;
* Mapa possui alternativa;
* ações destrutivas possuem confirmação;
* automação não substitui o usuário;
* Salvos e Roteiro permanecem distintos;
* os rótulos seguem a Arquitetura da Informação;
* os fluxos podem gerar telas e testes.

---

## 80. Declaração final

Os Fluxos do Usuário definem como as capacidades do RouteBook serão utilizadas na prática.

Eles conectam:

* navegação;
* conteúdo;
* ações;
* decisões;
* estados;
* erros;
* resultados.

O produto deverá permitir que o usuário se mova entre Descoberta, Mapa, Salvos e Roteiro sem perder o contexto da Viagem.

Cada fluxo deverá ser simples o suficiente para uso cotidiano, completo o suficiente para lidar com exceções e flexível o suficiente para respeitar diferentes formas de planejar e executar uma Viagem.
