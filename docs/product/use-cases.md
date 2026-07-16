---

id: RB-PRD-005

title: Casos de Uso
description: Define os principais casos de uso do RouteBook, descrevendo atores, objetivos, pré-condições, fluxos, exceções, resultados e regras associadas.

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
- use-cases
- requirements
- travel-planning
- itinerary
- maps

related_documents:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-001
- RB-PRD-002
- RB-PRD-003
- RB-PRD-004

prerequisites:

- RB-FND-001
- RB-FND-002
- RB-FND-003
- RB-FND-004
- RB-PRD-001
- RB-PRD-002
- RB-PRD-003
- RB-PRD-004

next_documents:

- RB-PRD-006
- RB-PRD-007
- RB-UX-001
- RB-UX-002
- RB-DOM-001

ai_context:
priority: high
index: true
---

# RouteBook — Casos de Uso

## 1. Propósito deste documento

Este documento define os principais Casos de Uso do RouteBook.

Seu objetivo é descrever, de forma estruturada e verificável, como os atores interagem com o produto para alcançar objetivos específicos.

Os Casos de Uso deverão orientar:

* requisitos funcionais;
* regras de negócio;
* arquitetura da informação;
* fluxos de usuário;
* definição de telas;
* critérios de aceitação;
* testes funcionais;
* testes de integração;
* testes ponta a ponta;
* modelagem do domínio;
* decisões de implementação.

Este documento transforma as Jornadas do Usuário em interações formais entre atores e o sistema.

---

## 2. Relação com outros documentos

A relação entre os documentos pode ser compreendida da seguinte forma:

```text
Personas
→ representam padrões de usuário

Jornadas do Usuário
→ descrevem experiências ponta a ponta

Casos de Uso
→ descrevem objetivos específicos e interações com o sistema

Requisitos Funcionais
→ definem comportamentos verificáveis

Critérios de Aceitação
→ determinam como validar a implementação
```

Um Caso de Uso poderá originar vários requisitos funcionais.

Um requisito funcional poderá apoiar mais de um Caso de Uso.

---

## 3. Estrutura dos Casos de Uso

Cada Caso de Uso poderá conter:

* identificador;
* nome;
* objetivo;
* ator principal;
* atores secundários;
* gatilho;
* pré-condições;
* pós-condições;
* fluxo principal;
* fluxos alternativos;
* exceções;
* regras relacionadas;
* dados envolvidos;
* prioridade;
* relação com o MVP;
* critérios gerais de sucesso.

---

## 4. Convenção de identificação

Os Casos de Uso utilizarão o padrão:

```text
RB-UC-XXX
```

Exemplo:

```text
RB-UC-001 — Criar Viagem
```

A numeração identifica o Caso de Uso e não representa necessariamente sua ordem de implementação.

---

## 5. Atores do sistema

### 5.1 Usuário

Pessoa que interage com o RouteBook.

### 5.2 Organizador da Viagem

Usuário responsável pela criação e manutenção principal de uma Viagem.

No MVP, será o ator principal da maioria dos Casos de Uso.

### 5.3 Viajante

Pessoa que participa da Viagem.

No MVP, poderá ser representada por dados inseridos pelo Organizador, sem acesso próprio ao sistema.

### 5.4 Provedor de Mapas

Sistema externo responsável por capacidades como:

* mapas;
* geocodificação;
* Lugares;
* rotas;
* distâncias;
* Tempos de deslocamento.

### 5.5 Provedor de Dados de Lugares

Sistema externo responsável por informações sobre Lugares.

Poderá ser o mesmo Provedor de Mapas ou um serviço separado.

### 5.6 Provedor de Inteligência Artificial

Sistema externo que poderá apoiar:

* interpretação de Preferências;
* geração de Justificativas;
* resumos;
* propostas de Roteiro.

Esse ator não será obrigatório em todos os Casos de Uso.

### 5.7 Sistema de Persistência

Capacidade interna ou externa responsável por armazenar os dados da Viagem.

---

# Parte I — Gestão da Viagem

## 6. RB-UC-001 — Criar Viagem

### Objetivo

Permitir que o Organizador crie uma nova Viagem.

### Ator principal

Organizador da Viagem.

### Atores secundários

* Provedor de Mapas;
* Sistema de Persistência.

### Gatilho

O usuário deseja iniciar o planejamento de uma nova Viagem.

### Pré-condições

* O usuário acessou o RouteBook.
* O sistema está disponível.

### Pós-condições

* Uma nova Viagem é criada.
* O Período da Viagem é definido.
* Os Dias da Viagem são gerados.
* A Hospedagem ou referência geográfica é associada.
* A Viagem pode ser retomada posteriormente.

### Fluxo principal

1. O usuário seleciona a opção para criar uma Viagem.
2. O sistema solicita o nome da Viagem.
3. O usuário informa o Destino.
4. O sistema apresenta resultados de localização.
5. O usuário seleciona o Destino correto.
6. O usuário informa a data de início.
7. O usuário informa a data de término.
8. O sistema valida o intervalo.
9. O usuário informa ou pesquisa a Hospedagem.
10. O sistema localiza a Hospedagem.
11. O usuário informa a quantidade de Viajantes.
12. O sistema cria a Viagem.
13. O sistema gera os Dias da Viagem.
14. O sistema persiste os dados.
15. O sistema apresenta a visão inicial da Viagem.

### Fluxos alternativos

#### A1 — Hospedagem ainda não definida

1. O usuário informa apenas uma Região ou referência provisória.
2. O sistema registra a localização como provisória.
3. O sistema informa que as distâncias poderão ser menos precisas.
4. O usuário poderá atualizar a Hospedagem posteriormente.

#### A2 — Destino com múltiplos resultados

1. O sistema apresenta opções semelhantes.
2. O usuário seleciona a localidade correta.
3. O sistema utiliza a localização confirmada.

#### A3 — Usuário deseja personalizar imediatamente

1. Após criar a Viagem, o usuário acessa as Preferências.
2. O sistema inicia o Caso de Uso `RB-UC-004 — Configurar Preferências`.

### Exceções

#### E1 — Data final anterior à inicial

O sistema impede a conclusão e solicita correção.

#### E2 — Destino não encontrado

O sistema permite nova pesquisa ou entrada alternativa.

#### E3 — Hospedagem não localizada

O sistema permite:

* nova busca;
* seleção manual no mapa;
* uso de referência provisória.

#### E4 — Falha ao persistir

O sistema informa o erro e preserva os dados temporariamente quando possível.

### Regras relacionadas

* A data final não pode ser anterior à data inicial.
* A Viagem deve possuir pelo menos um Viajante.
* O MVP considera um Destino principal.
* O MVP considera uma Hospedagem principal.
* A Hospedagem pode ser provisória se essa capacidade for suportada.

### Dados envolvidos

* nome da Viagem;
* Destino;
* data inicial;
* data final;
* Hospedagem;
* quantidade de Viajantes.

### Prioridade

Crítica.

### MVP

Obrigatório.

### Critério geral de sucesso

A Viagem é criada e pode ser retomada sem perda de dados.

---

## 7. RB-UC-002 — Consultar Viagem

### Objetivo

Permitir que o usuário consulte o estado atual de uma Viagem.

### Ator principal

Organizador da Viagem.

### Pré-condições

* Existe uma Viagem persistida.
* O usuário possui acesso à Viagem.

### Pós-condições

* Nenhuma alteração obrigatória é realizada.
* O usuário visualiza o resumo atualizado.

### Fluxo principal

1. O usuário acessa suas Viagens.
2. O sistema apresenta as Viagens disponíveis.
3. O usuário seleciona uma Viagem.
4. O sistema carrega os dados persistidos.
5. O sistema apresenta:

   * Destino;
   * Período;
   * Hospedagem;
   * Preferências;
   * Lugares salvos;
   * resumo do Roteiro;
   * próxima ação recomendada.
6. O usuário escolhe a área em que deseja continuar.

### Fluxos alternativos

#### A1 — Viagem em andamento

O sistema prioriza:

* Dia atual;
* Atividade atual;
* próxima Atividade;
* acesso ao Mapa;
* abertura de rota.

#### A2 — Viagem futura sem Roteiro

O sistema sugere:

* explorar Lugares;
* configurar Preferências;
* adicionar Atividades.

### Exceções

#### E1 — Dados externos indisponíveis

O sistema apresenta os dados internos e identifica informações temporariamente indisponíveis.

#### E2 — Viagem não encontrada

O sistema informa que a Viagem não está disponível.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 8. RB-UC-003 — Editar informações da Viagem

### Objetivo

Permitir que o Organizador altere informações gerais de uma Viagem.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A Viagem existe.
* O usuário possui permissão de edição.

### Pós-condições

* Os dados alterados são persistidos.
* Dependências relevantes são recalculadas.

### Fluxo principal

1. O usuário acessa as configurações da Viagem.
2. O sistema apresenta os dados atuais.
3. O usuário altera uma ou mais informações.
4. O sistema valida as mudanças.
5. O sistema apresenta impactos relevantes.
6. O usuário confirma.
7. O sistema persiste as alterações.
8. O sistema recalcula dependências.
9. O sistema apresenta confirmação.

### Informações editáveis

* nome;
* Destino;
* datas;
* Hospedagem;
* quantidade de Viajantes;
* orçamento;
* Meio de transporte;
* Ritmo da Viagem.

### Fluxos alternativos

#### A1 — Alteração de Hospedagem

O sistema recalcula:

* distâncias;
* Tempos de deslocamento;
* relevância por proximidade;
* Mapa da Viagem.

#### A2 — Alteração do Período

O sistema:

* cria novos Dias da Viagem;
* identifica Dias removidos;
* informa Atividades afetadas;
* solicita decisão sobre Atividades fora do novo período.

### Exceções

#### E1 — Alteração gera perda potencial

O sistema não conclui sem informar o impacto e solicitar confirmação.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 9. RB-UC-004 — Configurar Preferências

### Objetivo

Permitir que o usuário refine o Contexto da Viagem.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A Viagem existe.

### Pós-condições

* O Contexto da Viagem é atualizado.
* Recomendações futuras podem refletir as Preferências.

### Fluxo principal

1. O usuário acessa a personalização da Viagem.
2. O sistema apresenta categorias de Interesse.
3. O usuário seleciona uma ou mais categorias.
4. O usuário informa Preferências adicionais.
5. O usuário informa Restrições relevantes.
6. O usuário define orçamento.
7. O usuário escolhe Meio de transporte.
8. O usuário seleciona Ritmo da Viagem.
9. O sistema salva as informações.
10. O sistema atualiza Recomendações e filtros.

### Fluxos alternativos

#### A1 — Usuário não deseja informar Preferências

O sistema mantém configuração neutra e permite continuar.

#### A2 — Preferências conflitantes no grupo

O sistema registra múltiplos Interesses e prioriza Restrições obrigatórias.

### Regras relacionadas

* Preferências são opcionais.
* Restrições possuem prioridade sobre Preferências.
* A ausência de resposta não representa rejeição.
* O usuário poderá alterar os dados posteriormente.

### Prioridade

Alta.

### MVP

Obrigatório em versão básica.

---

# Parte II — Descoberta e avaliação

## 10. RB-UC-005 — Explorar Lugares

### Objetivo

Permitir que o usuário descubra Lugares relevantes no Destino.

### Ator principal

Organizador da Viagem.

### Atores secundários

* Provedor de Dados de Lugares;
* Provedor de Mapas;
* Provedor de Inteligência Artificial, quando aplicável.

### Pré-condições

* A Viagem existe.
* O Destino está definido.

### Pós-condições

* O usuário visualiza Lugares disponíveis.
* Nenhuma seleção é obrigatória.

### Fluxo principal

1. O usuário acessa Explorar.
2. O sistema carrega o Contexto da Viagem.
3. O sistema consulta Lugares relevantes.
4. O sistema organiza os resultados.
5. O sistema apresenta lista e mapa.
6. O usuário navega pelos resultados.
7. O usuário seleciona categorias ou filtros.
8. O sistema atualiza os resultados.
9. O usuário seleciona um Lugar.
10. O sistema apresenta um resumo ou Detalhes.

### Fluxos alternativos

#### A1 — Exploração por categoria

O usuário seleciona:

* praias;
* restaurantes;
* bares;
* vida noturna;
* atrações;
* passeios.

#### A2 — Exploração pelo mapa

O usuário movimenta ou amplia o mapa e solicita resultados na Região visualizada.

#### A3 — Exploração a partir de um Dia da Viagem

O sistema poderá considerar:

* Região das Atividades existentes;
* Período livre;
* categoria desejada;
* distância.

### Exceções

#### E1 — Nenhum resultado

O sistema:

* informa a ausência;
* sugere ampliar filtros;
* permite nova Região;
* mantém acesso ao mapa.

#### E2 — Falha do provedor

O sistema informa indisponibilidade e preserva dados já carregados.

### Regras relacionadas

* Resultados devem considerar o Contexto quando disponível.
* Popularidade não deve ser o único critério.
* O sistema deve identificar dados ausentes.
* Lista e mapa devem permanecer sincronizados.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 11. RB-UC-006 — Pesquisar Lugar

### Objetivo

Permitir que o usuário procure um Lugar específico.

### Ator principal

Organizador da Viagem.

### Atores secundários

* Provedor de Dados de Lugares;
* Provedor de Mapas.

### Pré-condições

* A Viagem existe.
* O usuário informou um termo de pesquisa.

### Pós-condições

* Resultados correspondentes são apresentados.

### Fluxo principal

1. O usuário informa um termo.
2. O sistema consulta as fontes disponíveis.
3. O sistema considera o Destino como contexto.
4. O sistema apresenta resultados.
5. O usuário seleciona um Lugar.
6. O sistema abre o resumo ou Detalhes.

### Fluxos alternativos

#### A1 — Pesquisa por nome incompleto

O sistema apresenta correspondências aproximadas.

#### A2 — Pesquisa fora do Destino

O sistema informa a diferença geográfica e permite continuar.

### Exceções

#### E1 — Nenhum resultado

O sistema sugere:

* revisar grafia;
* ampliar Região;
* usar categoria;
* selecionar manualmente no mapa, quando suportado.

### Prioridade

Alta.

### MVP

Obrigatório em versão básica.

---

## 12. RB-UC-007 — Filtrar Lugares

### Objetivo

Permitir que o usuário reduza ou reorganize os resultados.

### Ator principal

Organizador da Viagem.

### Pré-condições

* Existe um conjunto de Lugares disponível.

### Pós-condições

* Os resultados refletem os filtros ativos.

### Filtros do MVP

* categoria;
* distância;
* Faixa de preço.

### Filtros desejáveis

* avaliação;
* aberto no momento;
* adequado para crianças;
* acessibilidade;
* salvo;
* planejado.

### Fluxo principal

1. O usuário abre os filtros.
2. O sistema apresenta as opções.
3. O usuário seleciona critérios.
4. O sistema aplica os filtros.
5. Lista e mapa são atualizados.
6. O sistema identifica os filtros ativos.
7. O usuário pode remover ou redefinir filtros.

### Exceções

#### E1 — Nenhum resultado após filtros

O sistema informa a situação e oferece remoção simplificada dos critérios.

### Prioridade

Alta.

### MVP

Obrigatório para os filtros mínimos.

---

## 13. RB-UC-008 — Consultar Detalhes do Lugar

### Objetivo

Permitir que o usuário avalie se um Lugar é adequado para a Viagem.

### Ator principal

Organizador da Viagem.

### Atores secundários

* Provedor de Dados de Lugares;
* Provedor de Mapas.

### Pré-condições

* Um Lugar foi identificado.

### Pós-condições

* O usuário visualiza as informações disponíveis.
* O Lugar pode ser salvo ou adicionado ao Roteiro.

### Fluxo principal

1. O usuário seleciona um Lugar.
2. O sistema carrega os dados disponíveis.
3. O sistema apresenta:

   * nome;
   * categoria;
   * fotografias;
   * descrição;
   * endereço;
   * localização;
   * avaliação;
   * Faixa de preço;
   * horário;
   * distância;
   * Tempo de deslocamento;
   * duração sugerida;
   * Justificativa da recomendação.
4. O usuário consulta o mapa.
5. O usuário escolhe uma ação.

### Ações possíveis

* salvar;
* remover dos salvos;
* adicionar ao Roteiro;
* visualizar no mapa;
* abrir rota;
* retornar à exploração.

### Exceções

#### E1 — Dado indisponível

O sistema identifica a ausência, sem inventar informação.

#### E2 — Dado estimado

O sistema informa que se trata de estimativa.

#### E3 — Fontes divergentes

O sistema apresenta a informação com cautela ou indica a fonte disponível.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 14. RB-UC-009 — Visualizar Lugar no mapa

### Objetivo

Permitir que o usuário compreenda a posição geográfica de um Lugar.

### Ator principal

Organizador da Viagem.

### Ator secundário

Provedor de Mapas.

### Pré-condições

* O Lugar possui Localização válida.

### Pós-condições

* O mapa destaca o Lugar.
* A Hospedagem poderá permanecer visível como referência.

### Fluxo principal

1. O usuário seleciona a ação para visualizar no mapa.
2. O sistema abre ou centraliza o Mapa da Viagem.
3. O sistema destaca o Marcador do Lugar.
4. O sistema apresenta a Hospedagem.
5. O usuário consulta distância e contexto geográfico.
6. O usuário pode retornar aos Detalhes.

### Exceções

#### E1 — Mapa indisponível

O sistema apresenta:

* endereço;
* coordenadas de forma técnica quando necessário;
* ação para abrir serviço externo;
* alternativa em lista.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte III — Lugares salvos

## 15. RB-UC-010 — Salvar Lugar

### Objetivo

Permitir que o usuário mantenha um Lugar como opção de interesse.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A Viagem existe.
* O Lugar foi identificado.

### Pós-condições

* O Lugar fica associado à Viagem como Lugar salvo.
* O estado é atualizado em todas as visualizações.

### Fluxo principal

1. O usuário seleciona Salvar.
2. O sistema associa o Lugar à Viagem.
3. O sistema persiste a alteração.
4. O sistema atualiza:

   * Cartão de Lugar;
   * Detalhes;
   * Mapa;
   * área Salvos.
5. O sistema apresenta confirmação visual.

### Fluxos alternativos

#### A1 — Lugar já salvo

O sistema não cria duplicação e mantém o estado atual.

### Exceções

#### E1 — Falha ao salvar

O sistema informa o erro e mantém o estado anterior.

### Regras relacionadas

* Salvar não adiciona ao Roteiro.
* O mesmo Lugar não deve ser salvo duplicadamente na mesma Viagem.
* O estado deve ser consistente em lista, mapa e Detalhes.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 16. RB-UC-011 — Remover Lugar dos salvos

### Objetivo

Permitir que o usuário remova um Lugar da coleção de interesse.

### Ator principal

Organizador da Viagem.

### Pré-condições

* O Lugar está salvo.

### Pós-condições

* O Lugar deixa de aparecer em Salvos.
* Uma Atividade já planejada não é removida automaticamente.

### Fluxo principal

1. O usuário seleciona Remover dos salvos.
2. O sistema remove a associação.
3. O sistema persiste a alteração.
4. O sistema atualiza todas as visualizações.
5. O sistema mantém Atividades relacionadas no Roteiro.

### Regra relacionada

Salvos e Roteiro são estados independentes.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 17. RB-UC-012 — Consultar Lugares salvos

### Objetivo

Permitir que o usuário consulte as opções mantidas para a Viagem.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A Viagem existe.

### Pós-condições

* O usuário visualiza os Lugares salvos.

### Fluxo principal

1. O usuário acessa Salvos.
2. O sistema carrega os Lugares associados.
3. O sistema apresenta lista e, quando aplicável, mapa.
4. O usuário poderá:

   * abrir Detalhes;
   * remover;
   * adicionar ao Roteiro;
   * filtrar;
   * visualizar no mapa.

### Fluxo alternativo

#### A1 — Nenhum Lugar salvo

O sistema apresenta Estado vazio e direciona para Explorar.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte IV — Construção do Roteiro

## 18. RB-UC-013 — Adicionar Lugar ao Roteiro

### Objetivo

Transformar um Lugar em uma Atividade planejada.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A Viagem existe.
* O Lugar foi identificado.
* Existe pelo menos um Dia da Viagem.

### Pós-condições

* Uma Atividade planejada é criada.
* O Roteiro e o mapa são atualizados.

### Fluxo principal

1. O usuário seleciona Adicionar ao Roteiro.
2. O sistema apresenta os Dias da Viagem.
3. O usuário escolhe um dia.
4. O usuário informa, opcionalmente:

   * Horário planejado;
   * Duração estimada.
5. O sistema verifica conflitos conhecidos.
6. O sistema apresenta alertas, quando existirem.
7. O usuário confirma.
8. O sistema cria a Atividade.
9. O sistema persiste os dados.
10. O sistema atualiza o Roteiro e o mapa.
11. O sistema apresenta confirmação.

### Fluxos alternativos

#### A1 — Adição sem horário

A Atividade é adicionada ao dia sem horário exato.

#### A2 — Dia sugerido

O sistema recomenda um dia com base em:

* proximidade;
* disponibilidade;
* carga do dia;
* categoria;
* atividades existentes.

#### A3 — Lugar já planejado

O sistema informa que o Lugar já está no Roteiro e permite:

* cancelar;
* adicionar nova visita, quando fizer sentido;
* visualizar a Atividade existente.

### Exceções

#### E1 — Conflito de horário

O sistema informa o conflito e permite ajuste ou confirmação consciente.

#### E2 — Dia fora do Período

O sistema impede a seleção.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 19. RB-UC-014 — Criar Atividade manual

### Objetivo

Permitir que o usuário adicione ao Roteiro uma Atividade que não depende de um Lugar catalogado.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A Viagem existe.

### Pós-condições

* Uma Atividade manual é criada.

### Exemplos

* descanso;
* compromisso pessoal;
* evento privado;
* refeição em local ainda indefinido;
* traslado;
* retirada de veículo.

### Fluxo principal

1. O usuário seleciona adicionar Atividade.
2. O sistema permite escolher Atividade manual.
3. O usuário informa:

   * título;
   * dia;
   * horário opcional;
   * duração opcional;
   * localização opcional;
   * observação opcional.
4. O sistema valida os dados.
5. O sistema cria a Atividade.
6. O sistema atualiza o Roteiro.

### Prioridade

Média.

### MVP

Desejável.

---

## 20. RB-UC-015 — Adicionar Período livre

### Objetivo

Permitir que o usuário reserve tempo sem atividade definida.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A Viagem existe.

### Pós-condições

* Um Período livre é representado no Roteiro.

### Fluxo principal

1. O usuário seleciona adicionar Período livre.
2. O usuário escolhe o Dia da Viagem.
3. O usuário informa horário ou período aproximado.
4. O usuário poderá informar uma observação.
5. O sistema adiciona o período.
6. O Roteiro é atualizado.

### Regras relacionadas

* O sistema não deve tratar Período livre como lacuna obrigatoriamente preenchível.
* A geração de Roteiro deve respeitar Períodos livres bloqueados pelo usuário.

### Prioridade

Alta.

### MVP

Obrigatório em forma básica.

---

## 21. RB-UC-016 — Reordenar Atividades

### Objetivo

Permitir que o usuário altere a sequência de Atividades em um Dia da Viagem.

### Ator principal

Organizador da Viagem.

### Pré-condições

* O dia possui pelo menos duas Atividades.

### Pós-condições

* A nova ordem é persistida.
* Deslocamentos e alertas são recalculados.

### Fluxo principal

1. O usuário acessa um Dia da Viagem.
2. O usuário move uma Atividade para nova posição.
3. O sistema atualiza a ordem.
4. O sistema recalcula Deslocamentos.
5. O sistema verifica conflitos.
6. O sistema apresenta o resultado.
7. O sistema persiste a alteração.

### Alternativas de interação

* arrastar e soltar;
* botões de mover;
* seleção de posição.

A interface não deverá depender exclusivamente de arrastar e soltar.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 22. RB-UC-017 — Mover Atividade entre dias

### Objetivo

Permitir que o usuário altere o Dia da Viagem de uma Atividade.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A Atividade existe.
* Existe outro Dia da Viagem disponível.

### Pós-condições

* A Atividade passa a pertencer ao novo dia.
* O Roteiro é atualizado.

### Fluxo principal

1. O usuário seleciona a Atividade.
2. O usuário escolhe Mover.
3. O sistema apresenta os Dias disponíveis.
4. O usuário seleciona o novo dia.
5. O sistema verifica conflitos.
6. O sistema apresenta impactos.
7. O usuário confirma.
8. O sistema move a Atividade.
9. O sistema recalcula os dois dias.
10. O sistema persiste a alteração.

### Regra relacionada

O horário poderá ser preservado, removido ou ajustado conforme escolha do usuário.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 23. RB-UC-018 — Editar Atividade

### Objetivo

Permitir que o usuário altere informações de uma Atividade planejada.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A Atividade existe.

### Pós-condições

* A Atividade é atualizada.
* Conflitos e Deslocamentos são recalculados.

### Informações editáveis

* dia;
* horário;
* duração;
* observações;
* título, quando manual;
* localização, quando manual.

### Fluxo principal

1. O usuário seleciona a Atividade.
2. O sistema apresenta os dados atuais.
3. O usuário realiza alterações.
4. O sistema valida.
5. O sistema apresenta impactos.
6. O usuário confirma.
7. O sistema persiste.
8. O Roteiro é atualizado.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 24. RB-UC-019 — Remover Atividade

### Objetivo

Permitir que o usuário exclua uma Atividade do Roteiro.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A Atividade existe.

### Pós-condições

* A Atividade é removida.
* O Lugar relacionado poderá permanecer salvo.
* O dia é recalculado.

### Fluxo principal

1. O usuário seleciona Remover.
2. O sistema solicita confirmação quando necessário.
3. O usuário confirma.
4. O sistema remove a Atividade.
5. O sistema recalcula o dia.
6. O sistema persiste a alteração.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 25. RB-UC-020 — Consultar Roteiro

### Objetivo

Permitir que o usuário visualize o planejamento completo da Viagem.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A Viagem existe.

### Pós-condições

* Nenhuma alteração obrigatória é realizada.

### Fluxo principal

1. O usuário acessa Roteiro.
2. O sistema apresenta os Dias da Viagem.
3. O sistema destaca o Dia atual, quando aplicável.
4. O usuário seleciona um dia.
5. O sistema apresenta:

   * Atividades;
   * horários;
   * durações;
   * Períodos livres;
   * Deslocamentos;
   * alertas.
6. O usuário poderá editar ou abrir o mapa do dia.

### Fluxo alternativo

#### A1 — Roteiro vazio

O sistema apresenta opções para:

* explorar;
* adicionar Lugar;
* gerar proposta;
* criar Atividade manual.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 26. RB-UC-021 — Visualizar dia no mapa

### Objetivo

Permitir que o usuário compreenda geograficamente as Atividades de um Dia da Viagem.

### Ator principal

Organizador da Viagem.

### Ator secundário

Provedor de Mapas.

### Pré-condições

* O dia possui ao menos uma Atividade com Localização.

### Pós-condições

* O mapa apresenta os pontos do dia.

### Fluxo principal

1. O usuário seleciona a visualização geográfica do dia.
2. O sistema carrega as Atividades com Localização.
3. O sistema apresenta os Marcadores.
4. O sistema apresenta a Hospedagem.
5. O sistema apresenta a ordem planejada.
6. O usuário seleciona um Marcador.
7. O sistema apresenta o resumo da Atividade.

### Exceções

#### E1 — Parte das Atividades sem Localização

O sistema apresenta as Atividades localizáveis e identifica as demais.

### Prioridade

Alta.

### MVP

Obrigatório em forma básica.

---

# Parte V — Geração e recomendações

## 27. RB-UC-022 — Gerar proposta de Roteiro

### Objetivo

Permitir que o sistema apresente uma organização inicial das Atividades.

### Ator principal

Organizador da Viagem.

### Atores secundários

* Travel Engine;
* Recommendation Engine;
* Provedor de Mapas;
* Provedor de Inteligência Artificial, quando aplicável.

### Pré-condições

* A Viagem existe.
* Existem Dias da Viagem.
* Existem Lugares salvos, selecionados ou opções recomendáveis.

### Pós-condições

* Uma proposta de Roteiro é apresentada.
* Nenhuma alteração definitiva ocorre sem ação do usuário.

### Fluxo principal

1. O usuário solicita uma proposta.
2. O sistema reúne o Contexto da Viagem.
3. O sistema identifica Lugares disponíveis.
4. O sistema verifica Restrições.
5. O sistema agrupa opções por proximidade.
6. O sistema considera:

   * dias;
   * duração;
   * horários;
   * ritmo;
   * orçamento;
   * categorias.
7. O sistema cria uma proposta.
8. O sistema apresenta limitações conhecidas.
9. O sistema apresenta a proposta e Justificativas.
10. O usuário poderá:

    * aceitar integralmente;
    * aceitar parcialmente;
    * editar;
    * descartar;
    * gerar novamente.

### Fluxos alternativos

#### A1 — Dados insuficientes

O sistema informa o que falta e permite:

* continuar com proposta limitada;
* adicionar Lugares;
* montar manualmente.

#### A2 — Roteiro parcialmente existente

O sistema preserva Atividades bloqueadas ou confirmadas e sugere preenchimento dos demais períodos.

### Exceções

#### E1 — Proposta inviável

O sistema não apresenta como concluída e informa os conflitos.

### Regras relacionadas

* A proposta deve ser editável.
* O usuário mantém controle final.
* Lugares obrigatórios devem receber prioridade quando viáveis.
* Restrições devem ser respeitadas.
* O sistema deve evitar falsa precisão.

### Prioridade

Alta.

### MVP

Obrigatório em versão simplificada.

---

## 28. RB-UC-023 — Receber recomendação de Lugar

### Objetivo

Apresentar uma opção relevante para o Contexto da Viagem.

### Ator principal

Organizador da Viagem.

### Atores secundários

* Recommendation Engine;
* Provedor de Dados;
* Provedor de Mapas.

### Pré-condições

* Existe uma Viagem.
* Existem dados suficientes para avaliar opções.

### Pós-condições

* Uma ou mais Recomendações são apresentadas.

### Fluxo principal

1. O sistema reúne o Contexto.
2. O sistema consulta opções.
3. O sistema aplica critérios.
4. O sistema ordena os resultados.
5. O sistema gera uma Justificativa.
6. O usuário visualiza a Recomendação.
7. O usuário poderá:

   * abrir Detalhes;
   * salvar;
   * adicionar;
   * ignorar.

### Critérios possíveis

* proximidade;
* categoria;
* orçamento;
* avaliação;
* adequação ao grupo;
* compatibilidade com o Roteiro;
* custo-benefício.

### Regras relacionadas

* Popularidade não deve ser o único critério.
* A Justificativa deve ser baseada em dados conhecidos.
* A Recomendação não é obrigatória.

### Prioridade

Alta.

### MVP

Obrigatório em forma básica.

---

## 29. RB-UC-024 — Consultar Justificativa da recomendação

### Objetivo

Permitir que o usuário compreenda por que uma opção foi apresentada.

### Ator principal

Organizador da Viagem.

### Pré-condições

* Existe uma Recomendação.

### Pós-condições

* O usuário visualiza os principais critérios considerados.

### Fluxo principal

1. O usuário visualiza uma Recomendação.
2. O sistema apresenta uma justificativa resumida.
3. O usuário poderá expandir detalhes, quando disponível.
4. O sistema apresenta fatores como:

   * distância;
   * preço;
   * Interesse;
   * adequação;
   * relação com o Roteiro.
5. O usuário toma sua decisão.

### Regra relacionada

A justificativa não deve apresentar dados inexistentes ou inferências como fatos.

### Prioridade

Alta.

### MVP

Obrigatório em forma simples.

---

## 30. RB-UC-025 — Solicitar alternativa

### Objetivo

Permitir que o usuário encontre uma opção substituta.

### Ator principal

Organizador da Viagem.

### Atores secundários

* Recommendation Engine;
* Provedor de Mapas;
* Provedor de Dados.

### Pré-condições

* Existe um Lugar ou Atividade de referência.

### Pós-condições

* Alternativas são apresentadas.

### Motivos possíveis

* menor preço;
* menor distância;
* categoria semelhante;
* horário compatível;
* melhor adequação ao grupo;
* indisponibilidade da opção original.

### Fluxo principal

1. O usuário solicita uma Alternativa.
2. O sistema pergunta ou identifica o motivo.
3. O sistema consulta opções compatíveis.
4. O sistema apresenta Alternativas.
5. O usuário compara.
6. O usuário poderá substituir ou manter a opção original.

### Prioridade

Média.

### MVP

Desejável; pode ser simplificado.

---

# Parte VI — Revisão e adaptação

## 31. RB-UC-026 — Revisar viabilidade do Roteiro

### Objetivo

Identificar problemas conhecidos no planejamento.

### Ator principal

Organizador da Viagem.

### Atores secundários

* Travel Engine;
* Provedor de Mapas.

### Pré-condições

* O Roteiro possui Atividades.

### Pós-condições

* Alertas e sugestões são apresentados.
* Nenhuma alteração obrigatória ocorre sem decisão do usuário.

### Verificações possíveis

* sobreposição;
* deslocamento incompatível;
* atividade fora do horário;
* Dia sobrecarregado;
* falta de margem;
* conflito com Período livre;
* atividade fora do Período da Viagem.

### Fluxo principal

1. O usuário solicita revisão ou o sistema inicia análise.
2. O sistema avalia os Dias.
3. O sistema classifica os achados.
4. O sistema apresenta:

   * erro;
   * risco;
   * sugestão.
5. O usuário seleciona um item.
6. O sistema explica o impacto.
7. O usuário poderá:

   * corrigir;
   * ignorar;
   * solicitar Alternativa;
   * remover;
   * mover.
8. O sistema atualiza a revisão.

### Regras relacionadas

* Alertas devem ser priorizados.
* O sistema não deve bloquear escolhas pessoais sem necessidade.
* Estimativas devem ser identificadas.

### Prioridade

Alta.

### MVP

Obrigatório em versão básica.

---

## 32. RB-UC-027 — Replanejar parte do Roteiro

### Objetivo

Permitir a adaptação de uma parte do planejamento.

### Ator principal

Organizador da Viagem.

### Atores secundários

* Travel Engine;
* Recommendation Engine;
* Provedor de Mapas.

### Pré-condições

* Existe um Roteiro.
* Existe uma Atividade ou período a ser alterado.

### Pós-condições

* A parte selecionada é atualizada.
* O restante do Roteiro é preservado quando possível.

### Fluxo principal

1. O usuário seleciona uma Atividade ou intervalo.
2. O usuário escolhe Replanejar.
3. O sistema identifica restrições locais.
4. O sistema apresenta opções.
5. O usuário seleciona uma alteração.
6. O sistema apresenta impactos.
7. O usuário confirma.
8. O sistema atualiza a parte afetada.
9. O sistema recalcula Deslocamentos e conflitos.
10. O sistema preserva os demais dias.

### Prioridade

Média.

### MVP

Pode ser atendido por edição manual.

---

## 33. RB-UC-028 — Encontrar Lugar próximo

### Objetivo

Permitir que o usuário encontre uma opção adequada perto de uma referência.

### Ator principal

Organizador da Viagem.

### Atores secundários

* Provedor de Mapas;
* Recommendation Engine;
* Provedor de Dados.

### Pré-condições

* Existe uma referência geográfica.

### Referências possíveis

* Hospedagem;
* Atividade atual;
* próxima Atividade;
* Localização atual;
* ponto selecionado.

### Pós-condições

* Opções próximas são apresentadas.

### Fluxo principal

1. O usuário seleciona Encontrar próximo.
2. O sistema identifica ou solicita a referência.
3. O usuário escolhe categoria.
4. O sistema consulta Lugares.
5. O sistema considera distância, horário e Preferências.
6. O sistema apresenta poucas opções relevantes.
7. O usuário seleciona uma opção.
8. O usuário poderá adicionar, salvar ou abrir rota.

### Exceções

#### E1 — Localização atual não autorizada

O sistema permite escolher outra referência.

### Prioridade

Alta para uso durante a Viagem.

### MVP

Desejável; pode utilizar Hospedagem ou Atividade como referência.

---

# Parte VII — Mapa e deslocamento

## 34. RB-UC-029 — Consultar Mapa da Viagem

### Objetivo

Permitir que o usuário visualize geograficamente os elementos da Viagem.

### Ator principal

Organizador da Viagem.

### Ator secundário

Provedor de Mapas.

### Pré-condições

* A Viagem possui Destino ou Hospedagem.

### Pós-condições

* O Mapa da Viagem é apresentado.

### Elementos possíveis

* Hospedagem;
* Lugares;
* Salvos;
* Atividades;
* categorias;
* Região;
* rotas;
* agrupamentos.

### Fluxo principal

1. O usuário acessa o Mapa.
2. O sistema carrega a Região.
3. O sistema apresenta a Hospedagem.
4. O sistema carrega os Marcadores relevantes.
5. O usuário aplica filtros.
6. O usuário seleciona um Marcador.
7. O sistema apresenta o resumo.
8. O usuário poderá abrir Detalhes ou Roteiro.

### Exceções

#### E1 — Mapa indisponível

O sistema oferece a Visualização em lista e mantém as ações essenciais.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 35. RB-UC-030 — Consultar distância e Tempo de deslocamento

### Objetivo

Permitir que o usuário compreenda o esforço de deslocamento entre dois pontos.

### Ator principal

Organizador da Viagem.

### Ator secundário

Provedor de Mapas.

### Pré-condições

* Origem e destino possuem Localização.
* Existe Meio de transporte definido ou selecionável.

### Pós-condições

* Distância e Tempo estimado são apresentados.

### Fluxo principal

1. O sistema identifica origem e destino.
2. O sistema identifica o Meio de transporte.
3. O sistema consulta o provedor.
4. O sistema apresenta:

   * distância;
   * duração estimada;
   * Meio de transporte;
   * natureza estimada;
   * momento da consulta, quando relevante.
5. O usuário utiliza a informação para decidir.

### Exceções

#### E1 — Rota indisponível

O sistema poderá apresentar:

* distância geográfica;
* mensagem de indisponibilidade;
* abertura em serviço externo.

### Regra relacionada

O sistema não deve apresentar Tempo estimado como garantia.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 36. RB-UC-031 — Abrir rota externa

### Objetivo

Permitir que o usuário continue a navegação em um serviço especializado.

### Ator principal

Organizador da Viagem.

### Ator secundário

Provedor de Mapas externo.

### Pré-condições

* Existe um destino válido.

### Pós-condições

* O serviço externo é aberto com os dados disponíveis.

### Fluxo principal

1. O usuário seleciona Abrir rota.
2. O sistema identifica origem e destino.
3. O sistema monta o endereço externo.
4. O sistema abre o provedor.
5. O usuário continua a navegação fora do RouteBook.

### Regra relacionada

O RouteBook não oferece navegação curva a curva no MVP.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte VIII — Uso durante a Viagem

## 37. RB-UC-032 — Consultar Dia atual

### Objetivo

Permitir que o usuário visualize rapidamente o planejamento do dia em andamento.

### Ator principal

Organizador da Viagem.

### Pré-condições

* A data atual pertence ao Período da Viagem.

### Pós-condições

* O Dia atual é apresentado.

### Fluxo principal

1. O usuário acessa a Viagem.
2. O sistema identifica a data atual.
3. O sistema apresenta o Dia correspondente.
4. O sistema destaca:

   * Atividade atual;
   * próxima Atividade;
   * horário;
   * distância;
   * rota.
5. O usuário seleciona a ação desejada.

### Fluxo alternativo

#### A1 — Nenhuma Atividade no dia

O sistema apresenta:

* Período livre;
* opções próximas;
* acesso a Explorar.

### Prioridade

Alta.

### MVP

Desejável, especialmente em mobile.

---

## 38. RB-UC-033 — Consultar próxima Atividade

### Objetivo

Permitir que o usuário identifique rapidamente o próximo item do Roteiro.

### Ator principal

Organizador da Viagem.

### Pré-condições

* Existe uma próxima Atividade.

### Pós-condições

* A próxima Atividade é apresentada.

### Informações prioritárias

* nome;
* horário;
* Localização;
* distância;
* Tempo de deslocamento;
* ação de rota.

### Prioridade

Alta para uso durante a Viagem.

### MVP

Desejável.

---

# Parte IX — Persistência e continuidade

## 39. RB-UC-034 — Retomar Viagem

### Objetivo

Permitir que o usuário continue o planejamento ou a consulta.

### Ator principal

Organizador da Viagem.

### Ator secundário

Sistema de Persistência.

### Pré-condições

* Existe uma Viagem armazenada.

### Pós-condições

* O estado anterior é restaurado.

### Fluxo principal

1. O usuário acessa o RouteBook.
2. O sistema identifica as Viagens disponíveis.
3. O usuário seleciona uma Viagem.
4. O sistema carrega:

   * dados gerais;
   * Preferências;
   * Salvos;
   * Roteiro;
   * Atividades;
   * Períodos livres.
5. O sistema apresenta o contexto atual.
6. O usuário continua a interação.

### Exceções

#### E1 — Parte dos dados externos mudou

O sistema preserva os dados internos e identifica informações que precisam ser atualizadas.

#### E2 — Falha parcial de carregamento

O sistema apresenta o que foi recuperado e permite nova tentativa.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 40. RB-UC-035 — Salvar alterações automaticamente

### Objetivo

Reduzir o risco de perda de progresso.

### Ator principal

Sistema.

### Ator secundário

Sistema de Persistência.

### Gatilho

O usuário realiza uma alteração persistente.

### Pós-condições

* A alteração é armazenada.
* O estado visual indica sucesso ou falha quando necessário.

### Alterações relacionadas

* dados da Viagem;
* Preferências;
* Salvos;
* Roteiro;
* Atividades;
* ordem;
* horários;
* duração.

### Exceções

#### E1 — Falha de persistência

O sistema:

* informa a falha;
* evita apresentar sucesso incorreto;
* mantém cópia temporária quando possível;
* oferece nova tentativa.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte X — Casos de Uso pós-MVP

## 41. RB-UC-036 — Compartilhar Roteiro

Permitir que o Organizador compartilhe uma visualização da Viagem.

### Prioridade

Pós-MVP.

---

## 42. RB-UC-037 — Convidar participante

Permitir que outro usuário acesse ou colabore com a Viagem.

### Prioridade

Pós-MVP.

---

## 43. RB-UC-038 — Registrar Preferências individuais

Permitir que cada Viajante informe suas próprias Preferências.

### Prioridade

Pós-MVP.

---

## 44. RB-UC-039 — Votar em Lugar

Permitir que participantes expressem interesse por opções.

### Prioridade

Pós-MVP.

---

## 45. RB-UC-040 — Replanejar por clima

Permitir que o sistema proponha alterações com base em condições meteorológicas.

### Prioridade

Pós-MVP.

---

## 46. RB-UC-041 — Utilizar Roteiro offline

Permitir acesso a informações essenciais sem conexão.

### Prioridade

Pós-MVP.

---

## 47. RB-UC-042 — Controlar orçamento realizado

Permitir registrar gastos durante a Viagem.

### Prioridade

Pós-MVP.

---

## 48. RB-UC-043 — Planejar múltiplos Destinos

Permitir criar uma Viagem com diferentes cidades e Hospedagens.

### Prioridade

Pós-MVP.

---

# Parte XI — Matriz de prioridade

## 49. Casos de Uso críticos do MVP

| ID        | Caso de Uso                                 |
| --------- | ------------------------------------------- |
| RB-UC-001 | Criar Viagem                                |
| RB-UC-002 | Consultar Viagem                            |
| RB-UC-005 | Explorar Lugares                            |
| RB-UC-008 | Consultar Detalhes do Lugar                 |
| RB-UC-010 | Salvar Lugar                                |
| RB-UC-013 | Adicionar Lugar ao Roteiro                  |
| RB-UC-016 | Reordenar Atividades                        |
| RB-UC-018 | Editar Atividade                            |
| RB-UC-019 | Remover Atividade                           |
| RB-UC-020 | Consultar Roteiro                           |
| RB-UC-029 | Consultar Mapa da Viagem                    |
| RB-UC-030 | Consultar distância e Tempo de deslocamento |
| RB-UC-034 | Retomar Viagem                              |
| RB-UC-035 | Salvar alterações automaticamente           |

---

## 50. Casos de Uso de prioridade alta

| ID        | Caso de Uso                   |
| --------- | ----------------------------- |
| RB-UC-003 | Editar informações da Viagem  |
| RB-UC-004 | Configurar Preferências       |
| RB-UC-006 | Pesquisar Lugar               |
| RB-UC-007 | Filtrar Lugares               |
| RB-UC-009 | Visualizar Lugar no mapa      |
| RB-UC-011 | Remover Lugar dos salvos      |
| RB-UC-012 | Consultar Lugares salvos      |
| RB-UC-015 | Adicionar Período livre       |
| RB-UC-017 | Mover Atividade entre dias    |
| RB-UC-021 | Visualizar dia no mapa        |
| RB-UC-022 | Gerar proposta de Roteiro     |
| RB-UC-023 | Receber recomendação de Lugar |
| RB-UC-024 | Consultar Justificativa       |
| RB-UC-026 | Revisar viabilidade           |
| RB-UC-031 | Abrir rota externa            |

---

## 51. Casos de Uso desejáveis no MVP

| ID        | Caso de Uso                 |
| --------- | --------------------------- |
| RB-UC-014 | Criar Atividade manual      |
| RB-UC-025 | Solicitar alternativa       |
| RB-UC-028 | Encontrar Lugar próximo     |
| RB-UC-032 | Consultar Dia atual         |
| RB-UC-033 | Consultar próxima Atividade |

---

# Parte XII — Matriz entre jornadas e Casos de Uso

## 52. Criar e configurar a Viagem

Relaciona-se a:

* RB-UC-001;
* RB-UC-003;
* RB-UC-004;
* RB-UC-034.

---

## 53. Descobrir e avaliar Lugares

Relaciona-se a:

* RB-UC-005;
* RB-UC-006;
* RB-UC-007;
* RB-UC-008;
* RB-UC-009;
* RB-UC-023;
* RB-UC-024.

---

## 54. Selecionar e organizar

Relaciona-se a:

* RB-UC-010;
* RB-UC-011;
* RB-UC-012;
* RB-UC-013;
* RB-UC-014;
* RB-UC-015;
* RB-UC-016;
* RB-UC-017;
* RB-UC-018;
* RB-UC-019.

---

## 55. Consultar e revisar o Roteiro

Relaciona-se a:

* RB-UC-020;
* RB-UC-021;
* RB-UC-026;
* RB-UC-029;
* RB-UC-030.

---

## 56. Gerar e adaptar

Relaciona-se a:

* RB-UC-022;
* RB-UC-025;
* RB-UC-027;
* RB-UC-028.

---

## 57. Utilizar durante a Viagem

Relaciona-se a:

* RB-UC-031;
* RB-UC-032;
* RB-UC-033;
* RB-UC-034.

---

# Parte XIII — Regras transversais

## 58. Controle do usuário

Casos de Uso que geram ou alteram o Roteiro deverão preservar a decisão final do usuário.

---

## 59. Consistência de estado

Alterações em Lugares, Salvos e Atividades deverão refletir em:

* lista;
* mapa;
* Detalhes;
* Roteiro.

---

## 60. Transparência

O sistema deverá identificar:

* Dados estimados;
* dados ausentes;
* limitações;
* fonte externa;
* impacto de alterações.

---

## 61. Recuperação de falhas

Falhas externas não deverão apagar dados internos da Viagem.

---

## 62. Acessibilidade

Nenhum Caso de Uso crítico poderá depender exclusivamente:

* do mapa;
* de cor;
* de arrastar e soltar;
* de imagens;
* de precisão motora elevada.

---

## 63. Responsividade

Casos de Uso relacionados a consulta, rota e adaptação deverão funcionar adequadamente em celular.

---

## 64. Persistência

Toda alteração relevante deverá ser persistida ou claramente identificada como não salva.

---

# Parte XIV — Critérios para derivação de requisitos

## 65. Cada Caso de Uso deverá gerar requisitos verificáveis

Exemplo:

```text
Caso de Uso:
RB-UC-010 — Salvar Lugar

Requisitos derivados:
- O usuário deve conseguir salvar um Lugar.
- O sistema não deve criar duplicação.
- O estado salvo deve aparecer na lista.
- O estado salvo deve aparecer no mapa.
- O Lugar salvo não deve ser adicionado automaticamente ao Roteiro.
```

---

## 66. Requisitos não devem copiar o Caso de Uso integralmente

O Caso de Uso descreve uma interação orientada a objetivo.

O requisito deverá definir um comportamento específico e verificável.

---

## 67. Fluxos alternativos devem gerar requisitos quando relevantes

Comportamentos alternativos que afetem o produto deverão ser formalizados.

Exemplo:

* Hospedagem provisória;
* adição sem horário;
* falha no mapa;
* dados ausentes.

---

## 68. Exceções devem gerar critérios de erro e recuperação

Cada exceção relevante deverá resultar em:

* mensagem;
* estado;
* ação disponível;
* preservação de dados;
* critério de teste.

---

# Parte XV — Critérios de aceitação gerais

## 69. Conclusão do objetivo

O ator deve conseguir alcançar o objetivo principal.

---

## 70. Clareza de estado

O sistema deve informar:

* ação concluída;
* ação pendente;
* falha;
* impacto.

---

## 71. Reversibilidade

Ações editáveis devem poder ser alteradas ou desfeitas quando aplicável.

---

## 72. Preservação de dados

Falhas não devem causar perda silenciosa de progresso.

---

## 73. Coerência entre visualizações

Lista, mapa e Roteiro devem representar o mesmo estado da Viagem.

---

## 74. Tratamento de indisponibilidade

O sistema deve possuir comportamento definido para dados ou serviços indisponíveis.

---

## 75. Compatibilidade móvel

Casos críticos de uso durante a Viagem devem funcionar em dispositivos móveis.

---

# Parte XVI — Testes derivados

## 76. Testes funcionais

Cada Caso de Uso deverá possuir testes para:

* Fluxo principal;
* Fluxos alternativos relevantes;
* Exceções;
* Regras de negócio;
* persistência.

---

## 77. Testes ponta a ponta prioritários

### E2E-01 — Criar e retomar Viagem

Abrange:

* RB-UC-001;
* RB-UC-034;
* RB-UC-035.

### E2E-02 — Explorar e salvar Lugar

Abrange:

* RB-UC-005;
* RB-UC-008;
* RB-UC-010;
* RB-UC-012.

### E2E-03 — Adicionar e editar Roteiro

Abrange:

* RB-UC-013;
* RB-UC-016;
* RB-UC-018;
* RB-UC-020.

### E2E-04 — Consultar mapa e distância

Abrange:

* RB-UC-009;
* RB-UC-029;
* RB-UC-030;
* RB-UC-031.

### E2E-05 — Gerar e revisar proposta

Abrange:

* RB-UC-022;
* RB-UC-024;
* RB-UC-026.

---

# Parte XVII — Governança

## 78. Inclusão de novo Caso de Uso

Um novo Caso de Uso deverá ser criado quando:

* existir um objetivo distinto;
* houver ator identificável;
* o comportamento atravessar várias ações;
* o resultado possuir valor próprio;
* não for apenas uma variação de interface.

---

## 79. Alteração de Caso de Uso

Um Caso de Uso deverá ser revisado quando:

* o MVP mudar;
* uma Jornada mudar;
* uma Regra de negócio alterar o fluxo;
* uma integração criar nova exceção;
* testes revelarem comportamento ausente;
* o domínio redefinir conceitos.

---

## 80. Descontinuação

Casos de Uso removidos deverão ser marcados como:

* Deprecated;
* substituídos;
* pós-MVP;
* fora de escopo.

Não deverão desaparecer sem histórico quando já tiverem sido utilizados para requisitos ou implementação.

---

## 81. Relação com o Registro de Documentos

Este documento deve permanecer registrado como unidade documental.

Os Casos de Uso internos não precisam ser adicionados individualmente ao `registry.md`, pois pertencem ao mesmo arquivo `RB-PRD-005`.

---

## 82. Checklist de consistência

Antes de aprovar um Caso de Uso, verificar:

* possui objetivo claro;
* possui ator principal;
* possui gatilho;
* possui Pré-condições;
* possui Pós-condições;
* possui Fluxo principal;
* trata alternativas relevantes;
* trata exceções;
* respeita os Princípios do Produto;
* utiliza a terminologia oficial;
* está relacionado a uma Jornada;
* pode gerar requisitos;
* pode ser testado;
* está corretamente classificado no MVP.

---

## 83. Declaração final

Os Casos de Uso definem como o RouteBook transforma suas capacidades em objetivos concretos para o usuário.

Eles deverão assegurar que o produto permita:

* criar uma Viagem;
* configurar contexto;
* descobrir Lugares;
* compreender Localização;
* salvar opções;
* construir um Roteiro;
* revisar viabilidade;
* adaptar decisões;
* consultar o planejamento.

Os Casos de Uso não definem a aparência final da interface.

Eles definem o comportamento que a experiência e a implementação deverão tornar possível.
