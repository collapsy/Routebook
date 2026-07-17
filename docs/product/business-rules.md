---

id: RB-PRD-007

title: Regras de Negócio
description: Define as regras permanentes que controlam o comportamento funcional, a consistência dos dados, as decisões e os limites operacionais do RouteBook.

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
- business-rules
- domain-rules
- travel-planning
- itinerary
- recommendations
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
- RB-PRD-005
- RB-PRD-006

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

next_documents:

- RB-PRD-008
- RB-UX-001
- RB-UX-002
- RB-DOM-001
- RB-INT-001

ai_context:
priority: high
index: true
---

# RouteBook — Regras de Negócio

## 1. Propósito deste documento

Este documento define as Regras de Negócio do RouteBook.

Seu objetivo é estabelecer condições, restrições, prioridades e comportamentos que devem permanecer consistentes em toda a aplicação.

As regras descritas aqui deverão orientar:

* produto;
* experiência do usuário;
* modelagem do domínio;
* inteligência;
* arquitetura;
* implementação;
* validações;
* testes;
* tratamento de erros;
* decisões de evolução.

Os Requisitos Funcionais definem o que o sistema deve permitir que o usuário faça.

As Regras de Negócio definem sob quais condições essas ações são válidas, como conflitos devem ser resolvidos e quais estados não podem existir.

---

## 2. Relação com os Requisitos Funcionais

A relação entre os documentos pode ser compreendida da seguinte forma:

```text
Requisito funcional
→ define uma capacidade ou comportamento

Regra de negócio
→ define as condições e limitações desse comportamento
```

Exemplo:

```text
Requisito:
O usuário deve conseguir adicionar um Lugar ao Roteiro.

Regras:
- O Dia da Viagem deve pertencer ao Período da Viagem.
- O mesmo Lugar não deve ser adicionado acidentalmente duas vezes.
- Conflitos conhecidos devem ser informados.
- O usuário poderá manter a decisão quando o conflito não tornar o estado inválido.
```

---

## 3. Convenção de identificação

As regras utilizarão o padrão:

```text
RB-BR-XXX
```

Exemplo:

```text
RB-BR-001 — A data final não pode ser anterior à data inicial
```

A numeração não representa prioridade ou ordem de implementação.

---

## 4. Classificação das regras

### Regra obrigatória

Não pode ser violada.

A violação produziria estado inválido, perda de consistência ou comportamento incompatível com o produto.

### Regra condicionada

Aplica-se quando determinado dado, recurso ou condição estiver disponível.

### Regra orientativa

Orienta Recomendações ou planejamento, mas pode ser ignorada pelo usuário.

### Regra de prioridade

Define qual condição prevalece em caso de conflito.

### Regra de transparência

Define como incertezas, estimativas e limitações devem ser comunicadas.

---

## 5. Severidade

### Bloqueante

A ação não pode ser concluída.

### Alerta

A ação pode ser concluída após o usuário compreender o impacto.

### Informativa

A regra apenas comunica contexto ou recomendação.

---

# Parte I — Regras gerais do produto

## 6. RB-BR-001 — O usuário mantém a decisão final

### Regra

Recomendações, propostas de Roteiro, alternativas e reorganizações não devem substituir automaticamente decisões relevantes do usuário.

### Severidade

Obrigatória.

### Aplicação

O sistema poderá:

* sugerir;
* alertar;
* ordenar;
* comparar;
* gerar;
* explicar.

O sistema não deverá:

* confirmar escolhas em nome do usuário;
* remover Atividades sem autorização;
* substituir Lugares silenciosamente;
* alterar o Roteiro sem informar o impacto.

---

## 7. RB-BR-002 — Automação deve ser reversível

### Regra

Alterações automáticas devem poder ser revisadas, editadas ou desfeitas quando tecnicamente possível.

### Exemplos

* geração de Roteiro;
* agrupamento de Atividades;
* sugestão de horários;
* reorganização.

### Severidade

Obrigatória.

---

## 8. RB-BR-003 — O RouteBook não deve apresentar certeza inexistente

### Regra

Informações estimadas, inferidas ou sujeitas a variação não devem ser apresentadas como fatos garantidos.

### Exemplos

* Tempo de deslocamento;
* Faixa de preço;
* duração sugerida;
* lotação;
* disponibilidade;
* custo-benefício;
* horário obtido de fonte externa.

### Severidade

Obrigatória.

---

## 9. RB-BR-004 — Dados ausentes não devem ser inventados

### Regra

Quando uma informação não estiver disponível, o sistema deve identificar a ausência em vez de gerar um valor sem base confiável.

### Severidade

Bloqueante para a apresentação do dado como fato.

---

## 10. RB-BR-005 — Falha externa não invalida dados internos

### Regra

Falhas em mapas, rotas, Recomendações ou provedores externos não devem apagar ou corromper os dados internos da Viagem.

### Severidade

Obrigatória.

---

## 11. RB-BR-006 — Conceitos do produto são independentes de fornecedor

### Regra

Conceitos como Lugar, Mapa, Rota, Distância e Recomendação não devem depender semanticamente de um fornecedor específico.

### Exemplo

O produto deve utilizar o conceito de Provedor de Mapas, e não tratar Google Maps como sinônimo de mapa.

### Severidade

Obrigatória para domínio e arquitetura.

---

# Parte II — Regras da Viagem

## 12. RB-BR-007 — Toda Viagem deve possuir identificador único

### Regra

Cada Viagem deve possuir um identificador único e estável.

### Severidade

Bloqueante.

---

## 13. RB-BR-008 — Toda Viagem deve possuir um Destino principal

### Regra

No MVP, uma Viagem deve possuir exatamente um Destino principal.

### Severidade

Bloqueante.

### Observação

Múltiplos Destinos pertencem ao pós-MVP.

---

## 14. RB-BR-009 — Toda Viagem deve possuir Período válido

### Regra

Uma Viagem deve possuir:

* data de início;
* data de término;
* data de término igual ou posterior à data de início.

### Severidade

Bloqueante.

---

## 15. RB-BR-010 — O Período inclui as datas inicial e final

### Regra

A quantidade de Dias da Viagem deve considerar de forma inclusiva a data inicial e a data final.

### Exemplo

Uma Viagem entre 22 e 29 de julho possui oito Dias da Viagem.

### Severidade

Obrigatória.

---

## 16. RB-BR-011 — Todo Dia da Viagem deve pertencer ao Período

### Regra

Não pode existir Dia da Viagem fora do intervalo definido pela Viagem.

### Severidade

Bloqueante.

---

## 17. RB-BR-012 — Toda Viagem deve possuir ao menos um Viajante

### Regra

A quantidade de Viajantes deve ser igual ou superior a um.

### Severidade

Bloqueante.

---

## 18. RB-BR-013 — A Viagem deve possuir uma referência geográfica principal

### Regra

No MVP, a Viagem deve possuir uma Hospedagem ou Localização de referência principal.

### Severidade

Bloqueante para cálculos de proximidade baseados na Hospedagem.

---

## 19. RB-BR-014 — Hospedagem provisória deve ser identificada

### Regra

Quando a Hospedagem ainda não for definitiva, a referência deve ser marcada como provisória.

### Consequência

O sistema deve informar que:

* distâncias podem mudar;
* Recomendações por proximidade podem ser menos precisas;
* o usuário deverá revisar o planejamento após a atualização.

### Severidade

Obrigatória.

---

## 20. RB-BR-015 — Alteração de Destino exige reavaliação estrutural

### Regra

A alteração do Destino deve invalidar ou reavaliar informações diretamente dependentes da localização anterior.

### Elementos afetados

* Hospedagem;
* Lugares;
* Distâncias;
* Tempos de deslocamento;
* Recomendações;
* Mapa;
* Atividades geográficas.

### Severidade

Alerta com confirmação obrigatória.

---

## 21. RB-BR-016 — Alteração do Período deve preservar dados viáveis

### Regra

Quando o Período for alterado, o sistema deve preservar os Dias e Atividades que permanecerem válidos.

### Para datas removidas

O sistema deve:

* identificar Atividades afetadas;
* solicitar realocação, remoção ou cancelamento;
* evitar exclusão silenciosa.

### Severidade

Alerta.

---

## 22. RB-BR-017 — Alteração da Hospedagem exige recálculo geográfico

### Regra

Quando a Hospedagem for alterada, o sistema deve recalcular, quando aplicável:

* Distâncias;
* Tempos de deslocamento;
* ordenação por proximidade;
* Recomendações;
* Mapa;
* alertas de deslocamento.

### Severidade

Obrigatória.

---

## 23. RB-BR-018 — Uma Viagem pode existir sem Roteiro preenchido

### Regra

A criação da Viagem não exige Atividades planejadas.

### Severidade

Obrigatória.

### Justificativa

O usuário pode utilizar o produto apenas para Descoberta ou planejamento parcial.

---

# Parte III — Regras de contexto e personalização

## 24. RB-BR-019 — Preferências são opcionais

### Regra

O usuário deve conseguir utilizar o produto sem fornecer todas as Preferências disponíveis.

### Severidade

Obrigatória.

---

## 25. RB-BR-020 — Ausência de Preferência é estado neutro

### Regra

Uma Preferência não informada não deve ser interpretada como rejeição.

### Exemplo

Não selecionar “vida noturna” não significa obrigatoriamente que o usuário deseja excluir bares ou eventos noturnos.

### Severidade

Obrigatória.

---

## 26. RB-BR-021 — Restrições prevalecem sobre Preferências

### Regra

Quando uma Restrição válida entrar em conflito com uma Preferência, a Restrição deve prevalecer.

### Exemplos

* Restrição alimentar sobre Interesse gastronômico;
* limitação de mobilidade sobre preferência por caminhada;
* orçamento máximo sobre preferência por experiência premium.

### Severidade

Bloqueante ou alerta, conforme a Restrição.

---

## 27. RB-BR-022 — Restrições obrigatórias não podem ser ignoradas silenciosamente

### Regra

Quando uma Recomendação ou Atividade contrariar uma Restrição, o sistema deve:

* excluir a opção;
* ou apresentar um alerta explícito, quando a Restrição permitir decisão consciente.

### Severidade

Obrigatória.

---

## 28. RB-BR-023 — Personalização deve impactar a experiência

### Regra

Informações de personalização solicitadas ao usuário devem possuir uso funcional identificável.

### Exemplos

* orçamento influencia filtros ou Recomendações;
* Meio de transporte influencia deslocamentos;
* Ritmo influencia quantidade de Atividades;
* presença de crianças influencia adequação.

### Severidade

Obrigatória.

---

## 29. RB-BR-024 — O produto não deve solicitar dados sem finalidade clara

### Regra

Informações pessoais ou contextuais só devem ser solicitadas quando houver relação com a experiência da Viagem.

### Severidade

Obrigatória.

---

## 30. RB-BR-025 — O orçamento inicial é uma referência

### Regra

No MVP, o Orçamento da Viagem deve orientar Recomendações e filtros, mas não representar controle financeiro contábil.

### Severidade

Orientativa.

---

## 31. RB-BR-026 — O Ritmo da Viagem influencia, mas não bloqueia

### Regra

O Ritmo da Viagem deve influenciar sugestões de quantidade, duração e margens, mas não deve impedir que o usuário crie um dia mais intenso ou mais leve.

### Severidade

Orientativa.

---

# Parte IV — Regras de Lugares

## 32. RB-BR-027 — Todo Lugar deve possuir identidade estável

### Regra

Cada Lugar deve possuir um identificador que permita reconhecê-lo entre diferentes visualizações e interações.

### Severidade

Bloqueante.

---

## 33. RB-BR-028 — Todo Lugar geográfico deve possuir Localização

### Regra

Um Lugar apresentado no Mapa deve possuir coordenadas geográficas válidas.

### Severidade

Bloqueante para exibição no mapa.

---

## 34. RB-BR-029 — Lugar sem Localização pode permanecer consultável

### Regra

Um Lugar com dados incompletos pode ser apresentado em lista, desde que a ausência de Localização seja informada.

### Consequências

Esse Lugar não poderá:

* aparecer corretamente no Mapa;
* possuir Distância por rota;
* participar de otimização geográfica confiável.

### Severidade

Informativa.

---

## 35. RB-BR-030 — O mesmo Lugar não deve ser duplicado por fornecedor

### Regra

Quando o mesmo Lugar for obtido de diferentes fontes, o sistema deve tentar consolidar as referências em uma identidade única.

### Critérios possíveis

* identificador do provedor;
* nome;
* endereço;
* coordenadas;
* categoria.

### Severidade

Obrigatória quando a duplicidade puder ser identificada com confiança.

---

## 36. RB-BR-031 — Categoria deve ser consistente

### Regra

Um Lugar deve possuir ao menos uma Categoria de Lugar reconhecida pelo produto.

### Severidade

Obrigatória.

---

## 37. RB-BR-032 — Um Lugar pode possuir múltiplas categorias

### Regra

Quando aplicável, um Lugar pode pertencer a mais de uma Categoria.

### Exemplo

Um restaurante com música ao vivo pode ser:

* Restaurante;
* Bar;
* Vida noturna.

### Severidade

Permitida.

---

## 38. RB-BR-033 — Dados externos devem manter referência de origem

### Regra

Informações obtidas de fonte externa devem manter metadados de origem quando relevantes.

### Dados possíveis

* Provedor;
* identificador externo;
* momento da consulta;
* nível de confiança;
* natureza estimada.

### Severidade

Obrigatória para rastreabilidade.

---

## 39. RB-BR-034 — Faixa de preço não equivale a preço exato

### Regra

A Faixa de preço deve ser tratada como classificação aproximada.

### Severidade

Obrigatória.

---

## 40. RB-BR-035 — Avaliação não determina relevância isoladamente

### Regra

A avaliação de um Lugar não deve ser utilizada como único critério de ordenação ou Recomendação.

### Severidade

Obrigatória.

---

## 41. RB-BR-036 — Popularidade não determina adequação

### Regra

Um Lugar popular não deve ser considerado automaticamente adequado à Viagem.

### Severidade

Obrigatória.

---

# Parte V — Regras de Descoberta e pesquisa

## 42. RB-BR-037 — O Destino é o contexto geográfico padrão

### Regra

Pesquisas e Descobertas devem utilizar o Destino como contexto geográfico inicial.

### Severidade

Obrigatória.

---

## 43. RB-BR-038 — O usuário pode explorar além do Destino

### Regra

O produto pode apresentar Lugares fora do limite principal do Destino quando forem relevantes.

### Condição

A diferença geográfica deve ser comunicada.

### Severidade

Informativa.

---

## 44. RB-BR-039 — Filtros devem ser aplicados de forma consistente

### Regra

Filtros ativos devem afetar todas as visualizações correspondentes.

### Exemplos

* lista;
* mapa;
* contadores;
* resultados relacionados.

### Severidade

Obrigatória.

---

## 45. RB-BR-040 — Filtros não devem alterar dados originais

### Regra

Aplicar um Filtro não deve remover ou modificar permanentemente Lugares.

### Severidade

Obrigatória.

---

## 46. RB-BR-041 — Ausência de resultados deve ser recuperável

### Regra

Quando não houver resultados, o sistema deve oferecer caminhos de recuperação.

### Exemplos

* limpar filtros;
* ampliar Distância;
* mudar Categoria;
* pesquisar novamente;
* alterar Região.

### Severidade

Obrigatória.

---

## 47. RB-BR-042 — Ordenação por relevância deve ser contextual

### Regra

Quando o sistema utilizar relevância, deve considerar o Contexto da Viagem disponível.

### Severidade

Obrigatória.

---

## 48. RB-BR-043 — O usuário deve poder ignorar a ordenação recomendada

### Regra

O produto pode permitir outras ordenações, como:

* Distância;
* avaliação;
* preço;
* popularidade.

### Severidade

Orientativa.

---

# Parte VI — Regras do Mapa

## 49. RB-BR-044 — O Mapa é uma representação da Viagem

### Regra

O Mapa deve refletir os mesmos estados presentes em lista, Salvos e Roteiro.

### Severidade

Obrigatória.

---

## 50. RB-BR-045 — A Hospedagem deve possuir representação distinta

### Regra

A Hospedagem deve ser visualmente diferenciada dos Lugares e Atividades.

### Severidade

Obrigatória.

---

## 51. RB-BR-046 — Estados geográficos devem ser distinguíveis sem depender apenas de cor

### Regra

Marcadores devem diferenciar estados por mais de um atributo visual.

### Estados possíveis

* Hospedagem;
* Lugar;
* Salvo;
* Planejado;
* Atividade do dia.

### Severidade

Obrigatória.

---

## 52. RB-BR-047 — Marcadores próximos podem ser agrupados

### Regra

O sistema pode agrupar Marcadores quando a concentração comprometer a legibilidade.

### Severidade

Orientativa.

---

## 53. RB-BR-048 — Seleção no mapa deve refletir na lista

### Regra

Quando o usuário selecionar um Marcador, o elemento correspondente deve ser identificável na Visualização em lista ou painel de detalhes.

### Severidade

Obrigatória.

---

## 54. RB-BR-049 — Seleção na lista deve refletir no mapa

### Regra

Quando o usuário selecionar um Lugar na lista, o Marcador correspondente deve ser destacado ou centralizado.

### Severidade

Obrigatória.

---

## 55. RB-BR-050 — Falha do mapa não pode bloquear a Viagem

### Regra

A indisponibilidade do mapa não deve impedir:

* consulta de Lugares em lista;
* acesso a Salvos;
* consulta do Roteiro;
* edição de Atividades;
* persistência dos dados.

### Severidade

Obrigatória.

---

## 56. RB-BR-051 — Informações essenciais devem existir fora do mapa

### Regra

Localização, endereço, Distância e ações críticas devem possuir alternativa textual ou em lista.

### Severidade

Obrigatória.

---

# Parte VII — Regras de distância e deslocamento

## 57. RB-BR-052 — Distância deve identificar sua natureza

### Regra

Quando relevante, o sistema deve distinguir:

* Distância geográfica;
* Distância por rota;
* Distância estimada.

### Severidade

Obrigatória.

---

## 58. RB-BR-053 — Tempo de deslocamento deve identificar o Meio de transporte

### Regra

Toda estimativa de Tempo de deslocamento deve indicar o Meio de transporte considerado.

### Severidade

Obrigatória.

---

## 59. RB-BR-054 — Tempo de deslocamento não é garantia

### Regra

O Tempo de deslocamento deve ser apresentado como estimativa sujeita a condições externas.

### Severidade

Obrigatória.

---

## 60. RB-BR-055 — Distância igual a zero não representa falha

### Regra

Quando o cálculo falhar, o sistema não deve utilizar zero como valor substituto.

### Severidade

Obrigatória.

---

## 61. RB-BR-056 — Falha de rota deve ser identificada

### Regra

Quando uma rota não puder ser calculada, o sistema deve apresentar estado de indisponibilidade.

### Alternativas

* Distância geográfica;
* abertura em serviço externo;
* nova tentativa.

### Severidade

Obrigatória.

---

## 62. RB-BR-057 — Alteração do Meio de transporte pode alterar a viabilidade

### Regra

Quando o Meio de transporte for alterado, o sistema deve reavaliar:

* Tempos de deslocamento;
* conflitos;
* proximidade;
* Recomendações;
* Dias sobrecarregados.

### Severidade

Obrigatória.

---

## 63. RB-BR-058 — Proximidade depende do contexto

### Regra

O conceito de Lugar próximo não deve possuir um único limite universal.

### Pode considerar

* Meio de transporte;
* tempo disponível;
* Destino;
* Região;
* perfil do usuário.

### Severidade

Orientativa.

---

# Parte VIII — Regras de Lugares salvos

## 64. RB-BR-059 — Salvar não equivale a planejar

### Regra

Um Lugar salvo não deve ser automaticamente adicionado ao Roteiro.

### Severidade

Obrigatória.

---

## 65. RB-BR-060 — Planejar não exige salvar

### Regra

O usuário pode adicionar um Lugar diretamente ao Roteiro sem salvá-lo antes.

### Severidade

Obrigatória.

---

## 66. RB-BR-061 — Não pode existir duplicidade de Salvo

### Regra

O mesmo Lugar não deve possuir mais de uma associação de Salvo na mesma Viagem.

### Severidade

Bloqueante.

---

## 67. RB-BR-062 — Remover dos Salvos não remove do Roteiro

### Regra

A remoção de um Lugar dos Salvos não deve remover Atividades relacionadas.

### Severidade

Obrigatória.

---

## 68. RB-BR-063 — Remover do Roteiro não remove dos Salvos

### Regra

A remoção de uma Atividade não deve remover automaticamente o Lugar dos Salvos.

### Severidade

Obrigatória.

---

## 69. RB-BR-064 — Estado salvo deve ser consistente

### Regra

O estado de Lugar salvo deve ser igual em:

* lista;
* mapa;
* Detalhes;
* área Salvos.

### Severidade

Obrigatória.

---

# Parte IX — Regras do Roteiro

## 70. RB-BR-065 — Toda Atividade deve pertencer a uma Viagem

### Regra

Uma Atividade planejada não pode existir sem associação a uma Viagem.

### Severidade

Bloqueante.

---

## 71. RB-BR-066 — Toda Atividade deve pertencer a um Dia válido

### Regra

Uma Atividade deve pertencer a um Dia da Viagem dentro do Período.

### Severidade

Bloqueante.

---

## 72. RB-BR-067 — Atividade pode existir sem horário exato

### Regra

Uma Atividade pode ser associada a um dia sem Horário planejado.

### Severidade

Permitida.

---

## 73. RB-BR-068 — Atividade com horário deve possuir horário válido

### Regra

Quando informado, o Horário planejado deve representar um horário válido dentro do Dia da Viagem.

### Severidade

Bloqueante.

---

## 74. RB-BR-069 — Duração deve ser positiva

### Regra

Quando informada, a Duração estimada deve ser superior a zero.

### Severidade

Bloqueante.

---

## 75. RB-BR-070 — Duração sugerida é editável

### Regra

Uma duração sugerida pelo sistema deve poder ser alterada pelo usuário.

### Severidade

Obrigatória.

---

## 76. RB-BR-071 — Ordem das Atividades deve ser estável

### Regra

Cada Dia da Viagem deve manter uma sequência determinística de Atividades.

### Severidade

Obrigatória.

---

## 77. RB-BR-072 — Reordenação deve recalcular dependências

### Regra

Quando a ordem for alterada, o sistema deve reavaliar:

* Deslocamentos;
* conflitos;
* Tempos de deslocamento;
* sequência no mapa;
* alertas.

### Severidade

Obrigatória.

---

## 78. RB-BR-073 — Movimentação entre dias deve preservar dados compatíveis

### Regra

Ao mover uma Atividade para outro Dia, o sistema deve preservar:

* Lugar;
* duração;
* observações;
* identificação.

### Horário

O horário poderá ser:

* preservado;
* removido;
* ajustado;

conforme o impacto e a escolha do usuário.

### Severidade

Obrigatória.

---

## 79. RB-BR-074 — Remoção de Atividade deve atualizar dependências

### Regra

Ao remover uma Atividade, o sistema deve atualizar:

* ordem;
* Deslocamentos;
* alertas;
* mapa do dia;
* resumo da Viagem.

### Severidade

Obrigatória.

---

## 80. RB-BR-075 — Período livre é parte válida do Roteiro

### Regra

Um Período livre não deve ser tratado como erro ou informação incompleta.

### Severidade

Obrigatória.

---

## 81. RB-BR-076 — Período livre bloqueado deve ser respeitado

### Regra

Uma automação não deve preencher um Período livre marcado como bloqueado sem confirmação explícita.

### Severidade

Obrigatória.

---

## 82. RB-BR-077 — O Roteiro não precisa preencher todo o dia

### Regra

O sistema não deve exigir que todos os intervalos estejam ocupados.

### Severidade

Obrigatória.

---

## 83. RB-BR-078 — Atividade manual pode não possuir Lugar

### Regra

Uma Atividade manual pode existir sem associação a um Lugar catalogado.

### Exemplos

* descanso;
* compromisso pessoal;
* deslocamento;
* retirada de veículo.

### Severidade

Permitida.

---

## 84. RB-BR-079 — Atividade com Lugar deve manter referência estável

### Regra

Quando uma Atividade estiver associada a um Lugar, essa associação deve ser preservada mesmo que dados externos do Lugar sejam atualizados.

### Severidade

Obrigatória.

---

# Parte X — Regras de conflito e viabilidade

## 85. RB-BR-080 — Sobreposição de horários deve ser detectada

### Regra

Duas Atividades com horários incompatíveis no mesmo Dia devem gerar conflito.

### Severidade

Alerta ou bloqueio, conforme o tipo de Atividade.

---

## 86. RB-BR-081 — Atividade sem horário não gera sobreposição automática

### Regra

Atividades sem Horário planejado não devem ser classificadas automaticamente como sobrepostas.

### Severidade

Obrigatória.

---

## 87. RB-BR-082 — Deslocamento deve caber entre Atividades

### Regra

Quando duas Atividades possuírem horários definidos, o intervalo entre elas deve ser comparado ao Tempo de deslocamento estimado.

### Consequência

Quando o intervalo for insuficiente, o sistema deve gerar alerta.

### Severidade

Alerta.

---

## 88. RB-BR-083 — Horário de funcionamento deve ser considerado quando conhecido

### Regra

Uma Atividade planejada fora do horário conhecido do Lugar deve gerar alerta.

### Severidade

Alerta.

### Observação

O horário externo pode estar desatualizado e não deve ser tratado como garantia absoluta.

---

## 89. RB-BR-084 — Ausência de horário não implica funcionamento livre

### Regra

Quando o horário do Lugar não estiver disponível, o sistema deve indicar a ausência em vez de assumir que o Lugar estará aberto.

### Severidade

Obrigatória.

---

## 90. RB-BR-085 — Dia sobrecarregado é um alerta

### Regra

Um Dia considerado sobrecarregado deve gerar orientação, não bloqueio automático.

### Severidade

Alerta.

---

## 91. RB-BR-086 — A intensidade depende do Ritmo da Viagem

### Regra

A classificação de Dia sobrecarregado deve considerar o Ritmo da Viagem.

### Severidade

Orientativa.

---

## 92. RB-BR-087 — Alertas devem possuir severidade

### Regra

Todo alerta deve ser classificado como:

* erro;
* risco;
* sugestão.

### Severidade

Obrigatória.

---

## 93. RB-BR-088 — Erros bloqueiam estados inválidos

### Regra

Condições que produzam estado inválido devem impedir a conclusão da ação.

### Exemplos

* Dia fora da Viagem;
* data final anterior à inicial;
* duração negativa;
* quantidade de Viajantes igual a zero.

### Severidade

Bloqueante.

---

## 94. RB-BR-089 — Riscos podem ser aceitos

### Regra

Condições classificadas como risco podem ser mantidas após o usuário compreender o impacto.

### Exemplos

* deslocamento apertado;
* Dia intenso;
* atividade com horário externo incerto.

### Severidade

Alerta.

---

## 95. RB-BR-090 — Sugestões são opcionais

### Regra

Sugestões não devem impedir ou exigir ação do usuário.

### Severidade

Informativa.

---

# Parte XI — Regras de geração de Roteiro

## 96. RB-BR-091 — Geração depende de contexto mínimo

### Regra

Uma proposta de Roteiro deve utilizar, no mínimo:

* Período da Viagem;
* Dias disponíveis;
* Lugares ou opções disponíveis.

### Severidade

Obrigatória.

---

## 97. RB-BR-092 — A proposta deve respeitar Restrições

### Regra

A geração não deve incluir opções incompatíveis com Restrições obrigatórias conhecidas.

### Severidade

Bloqueante.

---

## 98. RB-BR-093 — A proposta deve respeitar Períodos livres bloqueados

### Regra

A geração não deve ocupar Períodos livres bloqueados.

### Severidade

Bloqueante.

---

## 99. RB-BR-094 — A proposta deve priorizar Lugares obrigatórios

### Regra

Lugares marcados como obrigatórios devem receber prioridade quando forem viáveis.

### Severidade

Alta.

---

## 100. RB-BR-095 — Lugar obrigatório não garante inclusão

### Regra

Quando um Lugar obrigatório for inviável, o sistema deve explicar o motivo.

### Motivos possíveis

* fora do Período;
* fechado;
* conflito de horário;
* distância incompatível;
* Restrição.

### Severidade

Obrigatória.

---

## 101. RB-BR-096 — A proposta deve considerar proximidade

### Regra

A geração deve tentar agrupar Lugares geograficamente próximos.

### Severidade

Orientativa.

---

## 102. RB-BR-097 — A proposta deve considerar o Ritmo

### Regra

A quantidade de Atividades sugeridas deve ser proporcional ao Ritmo da Viagem.

### Severidade

Orientativa.

---

## 103. RB-BR-098 — A proposta deve considerar Deslocamentos

### Regra

O sistema não deve gerar um Roteiro sem considerar os Deslocamentos disponíveis ou estimados.

### Severidade

Obrigatória.

---

## 104. RB-BR-099 — A proposta deve preservar margens

### Regra

A geração deve evitar sequências sem margem quando houver risco de inviabilidade.

### Severidade

Orientativa.

---

## 105. RB-BR-100 — A proposta não altera o Roteiro sem confirmação

### Regra

A geração deve ser apresentada como proposta separada até que o usuário aceite.

### Severidade

Obrigatória.

---

## 106. RB-BR-101 — A proposta pode ser aceita parcialmente

### Regra

O produto deve permitir, quando suportado, que o usuário aprove apenas parte da proposta.

### Severidade

Alta.

---

## 107. RB-BR-102 — Descartar proposta preserva o estado anterior

### Regra

Ao descartar uma proposta, o sistema deve preservar o Roteiro existente.

### Severidade

Obrigatória.

---

## 108. RB-BR-103 — Dados insuficientes devem limitar a proposta

### Regra

Quando não houver dados suficientes, o sistema deve reduzir o nível de precisão da proposta e informar suas limitações.

### Severidade

Obrigatória.

---

# Parte XII — Regras de Recomendação

## 109. RB-BR-104 — Recomendação deve possuir contexto identificável

### Regra

Uma Recomendação contextualizada deve ser baseada em pelo menos um critério relevante para a Viagem.

### Exemplos

* proximidade;
* Interesse;
* orçamento;
* categoria;
* compatibilidade com o Roteiro.

### Severidade

Obrigatória.

---

## 110. RB-BR-105 — Recomendação não é decisão

### Regra

Uma Recomendação deve ser apresentada como opção, não como ação obrigatória.

### Severidade

Obrigatória.

---

## 111. RB-BR-106 — Recomendação deve respeitar Restrições

### Regra

Uma Recomendação não deve contrariar Restrições obrigatórias conhecidas.

### Severidade

Bloqueante.

---

## 112. RB-BR-107 — Recomendação deve considerar localização

### Regra

Quando a Localização for relevante para a decisão, a Recomendação deve considerar Distância ou Região.

### Severidade

Alta.

---

## 113. RB-BR-108 — Recomendação deve considerar orçamento informado

### Regra

Quando o orçamento estiver configurado, ele deve influenciar a seleção ou a apresentação das opções.

### Severidade

Alta.

---

## 114. RB-BR-109 — Recomendação pode apresentar opção fora do orçamento

### Regra

Uma opção fora da Faixa de orçamento pode ser apresentada quando possuir relevância especial.

### Condição

O desvio deve ser identificado.

### Severidade

Informativa.

---

## 115. RB-BR-110 — Recomendação deve possuir Justificativa

### Regra

Recomendações relevantes devem possuir uma Justificativa resumida.

### Severidade

Obrigatória.

---

## 116. RB-BR-111 — Justificativa deve utilizar dados reais

### Regra

A Justificativa deve ser derivada de dados conhecidos ou inferências claramente controladas.

### Severidade

Obrigatória.

---

## 117. RB-BR-112 — Justificativa não deve expor complexidade desnecessária

### Regra

A explicação deve apresentar os fatores principais sem exigir compreensão de fórmulas, pesos ou modelos internos.

### Severidade

Orientativa.

---

## 118. RB-BR-113 — Pontuação interna não precisa ser exibida

### Regra

A Pontuação de recomendação pode permanecer interna quando não agregar valor ao usuário.

### Severidade

Permitida.

---

## 119. RB-BR-114 — O usuário pode ignorar Recomendações

### Regra

Ignorar uma Recomendação não deve bloquear funcionalidades ou impedir o planejamento.

### Severidade

Obrigatória.

---

# Parte XIII — Regras de alternativas e replanejamento

## 120. RB-BR-115 — Alternativa deve preservar o objetivo principal

### Regra

Uma Alternativa deve manter, quando possível, o propósito da opção original.

### Exemplos

* Restaurante por Restaurante;
* Praia por Praia;
* atividade cultural por atividade cultural.

### Severidade

Orientativa.

---

## 121. RB-BR-116 — Motivo da Alternativa deve ser considerado

### Regra

Quando o usuário solicitar uma Alternativa, o motivo deve influenciar os resultados.

### Motivos possíveis

* menor preço;
* menor Distância;
* horário;
* categoria;
* adequação ao grupo.

### Severidade

Alta.

---

## 122. RB-BR-117 — Substituição deve mostrar impacto

### Regra

Antes de substituir uma Atividade, o sistema deve informar os impactos conhecidos.

### Exemplos

* alteração de Distância;
* mudança de horário;
* mudança de preço;
* novo conflito.

### Severidade

Obrigatória.

---

## 123. RB-BR-118 — Replanejamento deve ser local quando possível

### Regra

Alterações em uma parte do Roteiro devem evitar modificar Dias ou Atividades não relacionados.

### Severidade

Obrigatória.

---

## 124. RB-BR-119 — Replanejamento não remove Atividades confirmadas silenciosamente

### Regra

Atividades preservadas ou confirmadas pelo usuário não devem ser removidas sem autorização.

### Severidade

Obrigatória.

---

## 125. RB-BR-120 — Replanejamento deve preservar dados manuais

### Regra

Observações, durações ajustadas e informações manuais devem ser preservadas quando compatíveis com a alteração.

### Severidade

Obrigatória.

---

# Parte XIV — Regras de uso durante a Viagem

## 126. RB-BR-121 — Dia atual depende do fuso da Viagem

### Regra

A identificação do Dia atual deve considerar o fuso horário associado ao Destino ou à Viagem.

### Severidade

Obrigatória quando o recurso for implementado.

---

## 127. RB-BR-122 — Dia atual só existe dentro do Período

### Regra

O sistema só deve destacar um Dia atual quando a data estiver dentro do Período da Viagem.

### Severidade

Obrigatória.

---

## 128. RB-BR-123 — Próxima Atividade depende de horário conhecido

### Regra

A identificação automática da próxima Atividade deve considerar Atividades com Horário planejado.

### Atividades sem horário

Podem ser apresentadas separadamente como pendentes ou flexíveis.

### Severidade

Obrigatória.

---

## 129. RB-BR-124 — Localização atual exige consentimento

### Regra

O sistema só deve utilizar a Localização atual após autorização do usuário.

### Severidade

Obrigatória.

---

## 130. RB-BR-125 — Negar localização não bloqueia o produto

### Regra

Quando o usuário negar acesso à Localização atual, o sistema deve permitir outra referência.

### Referências possíveis

* Hospedagem;
* Atividade atual;
* Lugar selecionado;
* endereço manual.

### Severidade

Obrigatória.

---

# Parte XV — Regras de persistência

## 131. RB-BR-126 — Dados persistidos devem manter consistência

### Regra

O estado salvo deve representar uma versão válida da Viagem.

### Severidade

Bloqueante.

---

## 132. RB-BR-127 — Falha de persistência deve ser visível

### Regra

Quando uma alteração não puder ser salva, o sistema deve informar a falha.

### Severidade

Obrigatória.

---

## 133. RB-BR-128 — O sistema não deve confirmar salvamento inexistente

### Regra

Uma ação não pode ser apresentada como salva antes da confirmação de persistência necessária.

### Severidade

Obrigatória.

---

## 134. RB-BR-129 — Alterações pendentes devem ser identificadas

### Regra

Quando houver alteração ainda não persistida, o estado deve ser comunicável ao usuário.

### Severidade

Alta.

---

## 135. RB-BR-130 — Retomada utiliza o último estado válido

### Regra

Ao retomar uma Viagem, o sistema deve recuperar o último estado persistido considerado válido.

### Severidade

Obrigatória.

---

## 136. RB-BR-131 — Dados internos não devem depender de disponibilidade externa

### Regra

Uma Viagem persistida deve permanecer acessível mesmo quando provedores externos estiverem indisponíveis.

### Limitação

Informações dinâmicas poderão ficar temporariamente indisponíveis.

### Severidade

Obrigatória.

---

# Parte XVI — Regras de acessibilidade

## 137. RB-BR-132 — Nenhuma ação crítica depende exclusivamente de mapa

### Regra

Objetivos críticos devem possuir alternativa textual ou em lista.

### Severidade

Obrigatória.

---

## 138. RB-BR-133 — Nenhum estado depende exclusivamente de cor

### Regra

Estados e alertas devem utilizar, além de cor:

* texto;
* ícone;
* padrão;
* rótulo;
* forma.

### Severidade

Obrigatória.

---

## 139. RB-BR-134 — Reordenação deve possuir alternativa ao gesto

### Regra

O usuário deve conseguir reordenar Atividades sem depender exclusivamente de arrastar e soltar.

### Severidade

Obrigatória.

---

## 140. RB-BR-135 — Imagens não substituem informação essencial

### Regra

Uma fotografia não deve ser a única fonte para compreender um Lugar ou ação.

### Severidade

Obrigatória.

---

## 141. RB-BR-136 — Mensagens devem orientar recuperação

### Regra

Mensagens de erro devem informar:

* o problema;
* o impacto;
* uma ação possível.

### Severidade

Obrigatória.

---

# Parte XVII — Regras de privacidade e confiança

## 142. RB-BR-137 — Dados devem possuir finalidade definida

### Regra

Todo dado pessoal ou contextual solicitado deve possuir finalidade relacionada à Viagem.

### Severidade

Obrigatória.

---

## 143. RB-BR-138 — Dados sensíveis devem ser minimizados

### Regra

O sistema deve evitar coletar dados sensíveis quando uma informação menos específica for suficiente.

### Severidade

Obrigatória.

---

## 144. RB-BR-139 — Restrições pessoais exigem tratamento controlado

### Regra

Informações sobre alimentação, mobilidade ou acessibilidade devem ser utilizadas apenas para os objetivos informados.

### Severidade

Obrigatória.

---

## 145. RB-BR-140 — Conteúdo patrocinado deve ser identificado

### Regra

Caso Recomendações patrocinadas sejam incorporadas futuramente, elas devem ser claramente identificadas.

### Severidade

Obrigatória.

### MVP

Pós-MVP.

---

## 146. RB-BR-141 — Patrocínio não deve invalidar Restrições

### Regra

Conteúdo patrocinado não pode receber prioridade sobre Restrições ou segurança do usuário.

### Severidade

Obrigatória.

---

# Parte XVIII — Matriz de rastreabilidade

## 147. Gestão da Viagem

| Regras                | Requisitos relacionados |
| --------------------- | ----------------------- |
| RB-BR-007 a RB-BR-018 | RB-FR-001 a RB-FR-013   |

---

## 148. Contexto e personalização

| Regras                | Requisitos relacionados |
| --------------------- | ----------------------- |
| RB-BR-019 a RB-BR-026 | RB-FR-014 a RB-FR-023   |

---

## 149. Lugares e Descoberta

| Regras                | Requisitos relacionados |
| --------------------- | ----------------------- |
| RB-BR-027 a RB-BR-043 | RB-FR-024 a RB-FR-044   |

---

## 150. Mapa e deslocamento

| Regras                | Requisitos relacionados |
| --------------------- | ----------------------- |
| RB-BR-044 a RB-BR-058 | RB-FR-045 a RB-FR-059   |

---

## 151. Salvos

| Regras                | Requisitos relacionados |
| --------------------- | ----------------------- |
| RB-BR-059 a RB-BR-064 | RB-FR-060 a RB-FR-066   |

---

## 152. Roteiro e conflitos

| Regras                | Requisitos relacionados                      |
| --------------------- | -------------------------------------------- |
| RB-BR-065 a RB-BR-090 | RB-FR-067 a RB-FR-086, RB-FR-105 a RB-FR-112 |

---

## 153. Geração e Recomendações

| Regras                | Requisitos relacionados |
| --------------------- | ----------------------- |
| RB-BR-091 a RB-BR-114 | RB-FR-087 a RB-FR-104   |

---

## 154. Replanejamento e uso durante a Viagem

| Regras                | Requisitos relacionados          |
| --------------------- | -------------------------------- |
| RB-BR-115 a RB-BR-125 | RB-FR-104, RB-FR-113 a RB-FR-117 |

---

## 155. Persistência

| Regras                | Requisitos relacionados |
| --------------------- | ----------------------- |
| RB-BR-126 a RB-BR-131 | RB-FR-118 a RB-FR-124   |

---

## 156. Acessibilidade e confiança

| Regras                | Requisitos relacionados |
| --------------------- | ----------------------- |
| RB-BR-132 a RB-BR-141 | RB-FR-129 a RB-FR-136   |

---

# Parte XIX — Critérios de validação

## 157. Regra verificável

Uma Regra de Negócio deve permitir verificar:

* condição de entrada;
* comportamento esperado;
* estado resultante;
* severidade;
* impacto;
* exceção, quando aplicável.

---

## 158. Regra implementada

Uma regra será considerada implementada quando:

* estiver refletida no comportamento;
* possuir validação aplicável;
* tratar erro ou alerta;
* possuir testes;
* não contradizer outra regra;
* estiver rastreada aos requisitos relacionados.

---

## 159. Regras bloqueantes

Regras bloqueantes devem possuir testes para:

* estado válido;
* tentativa inválida;
* mensagem apresentada;
* preservação de dados;
* recuperação.

---

## 160. Regras de alerta

Regras de alerta devem possuir testes para:

* detecção;
* explicação;
* decisão do usuário;
* manutenção ou alteração do estado;
* persistência da escolha.

---

## 161. Regras orientativas

Regras orientativas devem ser avaliadas em:

* Recomendações;
* geração;
* testes de usabilidade;
* análise de qualidade;
* experimentos.

---

# Parte XX — Conflitos entre regras

## 162. Prioridade geral

Quando regras entrarem em conflito, utilizar a seguinte ordem:

1. integridade e validade dos dados;
2. Restrições obrigatórias;
3. segurança e privacidade;
4. controle do usuário;
5. acessibilidade;
6. viabilidade do Roteiro;
7. Preferências;
8. otimização;
9. popularidade;
10. conveniência visual.

---

## 163. Restrição versus Preferência

A Restrição prevalece.

---

## 164. Controle do usuário versus otimização

O sistema deve explicar o impacto, mas o usuário mantém a decisão quando o estado continuar válido.

---

## 165. Acessibilidade versus experiência visual

A informação essencial deve permanecer acessível fora do recurso visual.

---

## 166. Dados externos versus dados internos

Dados externos podem atualizar informações dinâmicas, mas não devem apagar decisões e registros internos sem regra explícita.

---

## 167. Sugestão automática versus Período livre

O Período livre bloqueado prevalece.

---

## 168. Lugar obrigatório versus inviabilidade

A inviabilidade prevalece, mas deve ser explicada.

---

# Parte XXI — Regras fora do MVP

## 169. Colaboração

Quando colaboração for incorporada, deverão existir regras para:

* permissões;
* conflitos de edição;
* autoria;
* votação;
* Preferências individuais;
* histórico.

---

## 170. Reservas

Quando reservas forem incorporadas, deverão existir regras para:

* disponibilidade;
* confirmação;
* cancelamento;
* origem;
* responsabilidade;
* pagamento.

---

## 171. Múltiplos Destinos

Quando múltiplos Destinos forem incorporados, deverão existir regras para:

* troca de Hospedagem;
* deslocamentos entre cidades;
* Dias de trânsito;
* fusos;
* divisão geográfica.

---

## 172. Uso offline

Quando uso offline for incorporado, deverão existir regras para:

* sincronização;
* conflito de versões;
* dados disponíveis;
* validade de dados externos;
* operações pendentes.

---

# Parte XXII — Governança

## 173. Inclusão de nova regra

Uma nova regra deverá ser criada quando:

* estabelecer uma condição permanente;
* resolver ambiguidade;
* impedir estado inválido;
* definir prioridade;
* controlar conflito;
* possuir impacto em mais de um requisito;
* puder ser testada.

---

## 174. Alteração de regra

Uma regra deverá ser revisada quando:

* o domínio mudar;
* um requisito mudar;
* o MVP mudar;
* uma integração revelar nova limitação;
* testes demonstrarem comportamento inadequado;
* houver conflito não previsto.

---

## 175. Descontinuação

Regras já utilizadas não devem ser removidas sem histórico.

Elas deverão ser:

* substituídas;
* marcadas como Deprecated;
* movidas para pós-MVP;
* registradas no histórico de versão.

---

## 176. Responsabilidade

A manutenção das Regras de Negócio pertence à área de Produto, com participação de:

* domínio;
* experiência;
* inteligência;
* arquitetura;
* engenharia;
* qualidade.

---

## 177. Uso por agentes de IA

Agentes de IA que implementem ou revisem funcionalidades devem:

* consultar as regras relacionadas;
* preservar sua severidade;
* não inferir exceções não documentadas;
* registrar conflitos;
* manter rastreabilidade;
* evitar alterar comportamento permanente sem atualização documental.

---

## 178. Checklist de revisão

Antes de aprovar este documento, verificar:

* todas as regras possuem identificador único;
* não existem regras contraditórias;
* severidades estão coerentes;
* Restrições possuem prioridade correta;
* regras do mapa não dependem de fornecedor;
* regras de Roteiro preservam autonomia;
* regras de estimativa preservam transparência;
* persistência está contemplada;
* acessibilidade está contemplada;
* privacidade está contemplada;
* requisitos críticos possuem regras relacionadas;
* termos seguem o Glossário.

---

## 179. Declaração final

As Regras de Negócio definem os limites permanentes do comportamento do RouteBook.

Elas garantem que o produto permaneça:

* consistente;
* contextual;
* confiável;
* editável;
* explicável;
* acessível;
* orientado ao usuário.

A implementação poderá utilizar diferentes tecnologias, provedores e estratégias.

Entretanto, os estados válidos, as prioridades, as restrições e o controle do usuário deverão permanecer coerentes com as regras estabelecidas neste documento.
