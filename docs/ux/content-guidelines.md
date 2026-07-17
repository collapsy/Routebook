---

id: RB-UX-006

title: Diretrizes de Conteúdo e Microcopy
description: Define a voz, o tom, a terminologia, os rótulos, as mensagens, os feedbacks e os padrões de conteúdo utilizados na experiência do RouteBook.

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
- content-design
- microcopy
- voice-and-tone
- terminology
- accessibility
- localization

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

prerequisites:

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

next_documents:

- RB-DS-001
- RB-DOM-001
- RB-ARC-001
- RB-QA-001

ai_context:
priority: high
index: true
---

# RouteBook — Diretrizes de Conteúdo e Microcopy

## 1. Propósito deste documento

Este documento define as Diretrizes de Conteúdo e Microcopy do RouteBook.

Seu objetivo é estabelecer como o produto se comunica com o usuário em todas as superfícies da experiência.

Este documento define:

* voz do produto;
* variações de tom;
* terminologia oficial;
* convenções de escrita;
* rótulos de navegação;
* títulos;
* descrições;
* instruções;
* mensagens de erro;
* feedbacks;
* alertas;
* estados vazios;
* confirmações;
* conteúdos gerados por IA;
* padrões de acessibilidade;
* critérios de localização.

Estas diretrizes deverão orientar:

* UX Writing;
* Content Design;
* Design System;
* protótipos;
* interface frontend;
* mensagens de backend;
* notificações;
* testes;
* agentes de IA;
* documentação orientada ao usuário.

O conteúdo da interface deverá ajudar o usuário a:

* compreender onde está;
* entender o que está acontecendo;
* tomar decisões;
* evitar erros;
* recuperar-se de falhas;
* confiar nos limites do produto;
* manter controle sobre seu planejamento.

---

## 2. Relação com a experiência

O conteúdo do RouteBook não é uma camada decorativa.

Ele faz parte da interação.

Uma interface visualmente correta, mas com texto ambíguo, continua sendo uma experiência incorreta.

As mensagens deverão estar alinhadas a:

* Arquitetura da Informação;
* Fluxos do Usuário;
* Inventário de Telas;
* Wireframes;
* Especificações de Interação;
* conceitos definidos na RouteBook Bible.

---

## 3. Princípios de conteúdo

Todo conteúdo deverá seguir estes princípios:

1. Ser claro antes de ser criativo.
2. Ser útil antes de ser promocional.
3. Explicar impacto antes de pedir confirmação.
4. Informar limitações sem gerar insegurança desnecessária.
5. Orientar o próximo passo.
6. Evitar culpa.
7. Evitar promessas absolutas.
8. Diferenciar fatos, estimativas e sugestões.
9. Preservar a autonomia do usuário.
10. Utilizar terminologia consistente.
11. Adaptar-se ao contexto da Viagem.
12. Ser compreensível fora do contexto visual.
13. Evitar linguagem técnica desnecessária.
14. Ser conciso sem perder precisão.
15. Permitir tradução e localização futuras.

---

# Parte I — Voz do RouteBook

## 4. Definição da voz

A voz do RouteBook deverá ser:

* clara;
* confiável;
* prática;
* contextual;
* respeitosa;
* orientativa;
* transparente;
* calma.

O RouteBook deverá se comunicar como um guia de viagem experiente que:

* entende o contexto;
* explica opções;
* antecipa impactos;
* oferece recomendações;
* permite que o viajante decida.

---

## 5. Características da voz

### Clara

Utiliza palavras comuns e frases diretas.

Evita:

* ambiguidades;
* metáforas desnecessárias;
* jargão;
* linguagem excessivamente promocional.

### Confiável

Explica de onde vem uma recomendação quando relevante.

Não apresenta estimativas como garantias.

### Prática

Prioriza a informação necessária para a decisão atual.

### Contextual

Considera:

* Destino;
* Hospedagem;
* Dia;
* horário;
* Distância;
* Preferências;
* Roteiro;
* estado da Viagem.

### Respeitosa

Não culpa o usuário por erros, atrasos ou informações ausentes.

### Orientativa

Apresenta opções e próximos passos.

### Transparente

Distingue:

* informação confirmada;
* estimativa;
* recomendação;
* limitação;
* indisponibilidade.

---

## 6. O que a voz não deve ser

A voz do RouteBook não deverá ser:

* autoritária;
* infantilizada;
* alarmista;
* excessivamente informal;
* artificialmente entusiasmada;
* vaga;
* promocional;
* culpabilizadora;
* tecnicamente opaca.

---

## 7. Comparação de voz

### Evitar

```text
Você precisa resolver esses conflitos agora.
```

### Preferir

```text
Seu roteiro possui 2 conflitos que podem afetar os horários.
```

---

### Evitar

```text
Roteiro perfeito criado com sucesso!
```

### Preferir

```text
A proposta foi criada com base nas informações disponíveis.
```

---

### Evitar

```text
Ops! Você fez algo errado.
```

### Preferir

```text
A data final deve ser igual ou posterior à data inicial.
```

---

# Parte II — Tom

## 8. Definição de tom

A voz permanece estável.

O tom varia conforme o contexto.

O RouteBook poderá utilizar tom:

* neutro;
* orientativo;
* positivo;
* cauteloso;
* urgente;
* acolhedor.

---

## 9. Tom neutro

Utilizado para:

* navegação;
* rótulos;
* dados;
* configurações;
* informações objetivas.

Exemplo:

```text
3 atividades planejadas
```

---

## 10. Tom orientativo

Utilizado para:

* estados vazios;
* próximos passos;
* ajuda;
* recuperação.

Exemplo:

```text
Salve lugares para comparar e adicionar ao roteiro depois.
```

---

## 11. Tom positivo

Utilizado para:

* conclusão;
* progresso;
* sucesso;
* confirmação.

O tom positivo deverá ser moderado.

Exemplo:

```text
A atividade foi adicionada ao dia 24 de agosto.
```

---

## 12. Tom cauteloso

Utilizado quando:

* dados forem estimados;
* horários não estiverem confirmados;
* existirem riscos;
* serviços externos estiverem envolvidos.

Exemplo:

```text
O tempo de deslocamento é uma estimativa e pode variar.
```

---

## 13. Tom urgente

Deverá ser reservado para situações que exigem atenção imediata.

Exemplos:

* ação irreversível;
* conflito bloqueante;
* perda de dados;
* impossibilidade de concluir.

Mesmo em situações urgentes, o texto deverá permanecer objetivo.

---

## 14. Tom acolhedor

Poderá ser utilizado no primeiro uso e em estados vazios.

Exemplo:

```text
Comece criando sua viagem. Você poderá ajustar os detalhes depois.
```

Não deverá ser usado de forma excessivamente emocional.

---

# Parte III — Terminologia oficial

## 15. Regra de terminologia

Os termos oficiais deverão ser utilizados de forma consistente em:

* interface;
* documentação;
* código conceitual;
* testes;
* agentes de IA;
* métricas;
* suporte.

Sinônimos não deverão ser alternados sem justificativa.

---

## 16. Termos principais

| Termo oficial         | Significado                                |
| --------------------- | ------------------------------------------ |
| Viagem                | Contexto principal de planejamento         |
| Destino               | Região principal da Viagem                 |
| Hospedagem            | Referência geográfica principal            |
| Viajante              | Pessoa participante da Viagem              |
| Lugar                 | Ponto de interesse pesquisável             |
| Atividade             | Item planejado em um Dia                   |
| Dia da Viagem         | Unidade temporal do Roteiro                |
| Roteiro               | Organização de Dias, Atividades e períodos |
| Salvos                | Lugares mantidos para avaliação            |
| Período livre         | Intervalo intencionalmente não planejado   |
| Deslocamento          | Movimento entre dois pontos                |
| Distância             | Medida entre origem e destino              |
| Tempo de deslocamento | Duração estimada do percurso               |
| Preferências          | Informações utilizadas para personalização |
| Interesse             | Categoria de experiência desejada          |
| Ritmo                 | Intensidade esperada do planejamento       |
| Restrição             | Condição que deve ser respeitada           |
| Recomendação          | Opção sugerida com base no contexto        |
| Proposta de Roteiro   | Organização sugerida antes da aceitação    |
| Conflito              | Condição que pode afetar a viabilidade     |
| Alerta                | Comunicação de erro, risco ou sugestão     |
| Mapa                  | Representação geográfica da Viagem         |

---

## 17. Termos que não devem ser usados como equivalentes

### Salvar e adicionar ao Roteiro

`Salvar` significa manter um Lugar para avaliação.

`Adicionar ao Roteiro` significa criar uma Atividade planejada.

Esses termos não são equivalentes.

---

### Lugar e Atividade

`Lugar` é um ponto de interesse.

`Atividade` é uma ação planejada em um Dia.

Uma Atividade pode estar associada a um Lugar, mas os termos não são intercambiáveis.

---

### Roteiro e proposta

`Roteiro` é o planejamento atual do usuário.

`Proposta de Roteiro` é uma sugestão ainda não aplicada.

---

### Erro, risco e sugestão

`Erro` representa impedimento ou inconsistência crítica.

`Risco` representa condição que pode causar problema.

`Sugestão` representa oportunidade de melhoria opcional.

---

## 18. Capitalização conceitual

Em documentação de produto, os conceitos oficiais poderão utilizar inicial maiúscula para reforçar seu significado de domínio.

Exemplos:

* Viagem;
* Lugar;
* Roteiro;
* Atividade;
* Hospedagem.

Na interface, deverá ser utilizada capitalização natural da língua portuguesa.

Exemplos:

```text
Criar viagem
Adicionar ao roteiro
Detalhes do lugar
```

---

# Parte IV — Convenções de escrita

## 19. Idioma principal

O idioma inicial do produto será português do Brasil.

Convenção:

```text
pt-BR
```

---

## 20. Pessoa gramatical

O produto deverá falar diretamente com o usuário utilizando `você` quando necessário.

Exemplo:

```text
Você poderá alterar a hospedagem depois.
```

O pronome deverá ser omitido quando a frase continuar clara.

Exemplo:

```text
Escolha um dia para adicionar a atividade.
```

---

## 21. Voz ativa

Preferir voz ativa.

### Evitar

```text
A viagem será criada após a confirmação.
```

### Preferir

```text
Criaremos a viagem após a confirmação.
```

Ou, de forma mais direta:

```text
Confirme para criar a viagem.
```

---

## 22. Frases curtas

Preferir uma ideia principal por frase.

Textos longos deverão ser divididos em:

* parágrafos;
* itens;
* seções;
* etapas.

---

## 23. Pontuação

Títulos, rótulos e botões não deverão utilizar ponto-final.

Mensagens completas poderão utilizar ponto-final.

Exemplos:

```text
Criar viagem
```

```text
Não foi possível salvar a alteração.
```

---

## 24. Exclamação

Pontos de exclamação deverão ser evitados.

Não utilizar:

```text
Viagem criada com sucesso!
```

Preferir:

```text
Viagem criada
```

---

## 25. Reticências

Reticências poderão ser utilizadas em estados de processamento quando o texto representar uma ação em andamento.

Exemplo:

```text
Salvando...
```

Em textos estáticos, deverão ser evitadas.

---

## 26. Abreviações

Evitar abreviações quando reduzirem compreensão.

Abreviações aceitas poderão incluir:

* km;
* min;
* h;
* R$;
* datas compactas em espaços reduzidos.

A primeira ocorrência de termos menos conhecidos deverá ser apresentada por extenso.

---

## 27. Números

Utilizar algarismos para:

* datas;
* horários;
* Distâncias;
* quantidades;
* preços;
* duração.

Exemplos:

```text
3 viajantes
2,4 km
15 min
R$ 45
```

---

## 28. Horários

Formato principal:

```text
10:30
```

Não utilizar:

```text
10h30min
```

Em frases:

```text
Saída recomendada às 09:45.
```

---

## 29. Datas

### Forma completa

```text
24 de agosto de 2026
```

### Forma contextual

```text
24 de agosto
```

### Forma compacta

```text
24 ago
```

A forma compacta deverá ser utilizada apenas em espaços reduzidos.

---

## 30. Intervalos de datas

Preferir:

```text
22 a 29 de agosto
```

Quando houver meses diferentes:

```text
29 de agosto a 2 de setembro
```

---

## 31. Distâncias

Formato:

```text
1,8 km
```

Para distâncias curtas:

```text
450 m
```

Evitar precisão desnecessária.

---

## 32. Duração

Exemplos:

```text
15 min
1 h
1 h 30 min
3 h
```

A interface poderá utilizar formas mais naturais quando houver espaço:

```text
1 hora e 30 minutos
```

---

## 33. Valores monetários

Formato:

```text
R$ 45
R$ 45,90
```

Faixas:

```text
R$ 40 a R$ 60 por pessoa
```

Quando estimado:

```text
Estimativa: R$ 40 a R$ 60 por pessoa
```

---

# Parte V — Títulos e hierarquia

## 34. Títulos de página

Títulos deverão identificar claramente a área ou tarefa.

Exemplos:

* Minhas viagens;
* Criar viagem;
* Explorar;
* Detalhes do lugar;
* Roteiro;
* Salvos;
* Configurações;
* Revisão de conflitos.

---

## 35. Títulos contextuais

Poderão utilizar o objeto atual.

Exemplo:

```text
Praia do Amor
```

Subtítulo:

```text
Praia · 1,8 km da hospedagem
```

---

## 36. Títulos de modal

Deverão representar a decisão.

### Evitar

```text
Tem certeza?
```

### Preferir

```text
Excluir esta viagem?
```

---

## 37. Títulos de estados

Deverão informar a situação.

Exemplos:

```text
Nenhum lugar salvo
Nenhum resultado encontrado
Mapa indisponível
Alteração não salva
```

---

# Parte VI — Botões e ações

## 38. Regra geral

Rótulos de ação deverão começar com verbo.

Exemplos:

* Criar viagem;
* Explorar lugares;
* Adicionar ao roteiro;
* Salvar alterações;
* Abrir rota;
* Limpar filtros;
* Tentar novamente.

---

## 39. Ação específica

O rótulo deverá indicar o resultado esperado.

### Evitar

```text
Continuar
```

Quando a ação final for conhecida.

### Preferir

```text
Criar viagem
Aplicar filtros
Salvar alterações
```

`Continuar` poderá ser utilizado em fluxos por etapas.

---

## 40. Ações positivas

Exemplos:

* Criar viagem;
* Adicionar atividade;
* Aceitar proposta;
* Salvar alteração;
* Aplicar filtros.

---

## 41. Ações secundárias

Exemplos:

* Ver detalhes;
* Ver no mapa;
* Editar;
* Voltar;
* Cancelar.

---

## 42. Ações destrutivas

O rótulo deverá nomear a ação destrutiva.

### Evitar

```text
Confirmar
```

### Preferir

```text
Excluir viagem
Remover atividade
Descartar proposta
```

---

## 43. Cancelar e fechar

`Cancelar` deverá ser utilizado quando uma tarefa ou alteração estiver em andamento.

`Fechar` deverá ser utilizado quando não houver alteração pendente.

---

## 44. Voltar

`Voltar` deverá representar navegação para o contexto anterior.

Não deverá ser utilizado como sinônimo de cancelar.

---

# Parte VII — Campos e formulários

## 45. Rótulos de campo

Rótulos deverão descrever a informação solicitada.

Exemplos:

* Destino;
* Data de início;
* Data de término;
* Hospedagem;
* Número de viajantes;
* Horário;
* Duração;
* Observações.

---

## 46. Placeholders

Placeholders deverão apresentar exemplo ou formato.

Exemplos:

```text
Pesquise uma cidade ou região
```

```text
Ex.: descanso na hospedagem
```

Não deverão repetir o rótulo sem acrescentar informação.

---

## 47. Texto de apoio

Deverá explicar:

* formato;
* consequência;
* opcionalidade;
* limitação.

Exemplo:

```text
Use um endereço aproximado se ainda não souber a hospedagem.
```

---

## 48. Campos opcionais

Utilizar indicação:

```text
Observações — opcional
```

Evitar marcar apenas campos obrigatórios quando a maioria for opcional.

---

## 49. Validação positiva

Validações positivas deverão ser usadas apenas quando forem úteis.

Exemplo:

```text
Endereço encontrado
```

Não é necessário confirmar visualmente cada campo válido.

---

# Parte VIII — Busca e filtros

## 50. Campo de busca

Exemplos:

```text
Pesquisar lugares
Pesquisar cidade ou destino
Pesquisar hospedagem
```

Evitar:

```text
Digite aqui
Buscar
```

Sem objeto claro.

---

## 51. Resultado da busca

Exemplos:

```text
42 lugares encontrados
1 lugar encontrado
```

Quando a quantidade não for relevante:

```text
Resultados para “praia”
```

---

## 52. Filtros ativos

Exemplos:

```text
Praias
Até 5 km
Econômico
```

A ação global deverá ser:

```text
Limpar todos
```

---

## 53. Aplicar filtros

Quando a quantidade estimada estiver disponível:

```text
Ver 18 lugares
```

Ou:

```text
Aplicar filtros
```

A escolha deverá permanecer consistente.

---

## 54. Sem resultados

### Título

```text
Nenhum lugar encontrado
```

### Descrição

```text
Não encontramos opções com os filtros atuais.
```

### Ações

```text
Ampliar distância
Limpar filtros
Ver outra região no mapa
```

---

# Parte IX — Estados vazios

## 55. Estrutura

Um estado vazio deverá conter:

1. título;
2. explicação;
3. ação principal;
4. ação secundária opcional.

---

## 56. Minhas viagens vazia

### Título

```text
Você ainda não criou nenhuma viagem
```

### Descrição

```text
Comece informando destino, datas e hospedagem.
```

### Ação

```text
Criar primeira viagem
```

---

## 57. Salvos vazio

### Título

```text
Nenhum lugar salvo
```

### Descrição

```text
Salve praias, restaurantes e passeios para avaliar depois.
```

### Ação

```text
Explorar lugares
```

---

## 58. Roteiro vazio

### Título

```text
Seu roteiro ainda está vazio
```

### Descrição

```text
Adicione lugares manualmente ou gere uma proposta para começar.
```

### Ações

```text
Explorar lugares
Gerar proposta
```

---

## 59. Dia vazio

### Título

```text
Este dia está livre
```

### Descrição

```text
Adicione uma atividade ou mantenha o dia sem compromissos.
```

### Ações

```text
Adicionar atividade
Manter dia livre
```

---

## 60. Nenhum conflito

### Título

```text
Nenhum conflito conhecido
```

### Descrição

```text
A análise considera apenas as informações disponíveis atualmente.
```

Evitar:

```text
Seu roteiro está perfeito
```

---

# Parte X — Carregamento e progresso

## 61. Carregamento simples

Exemplos:

```text
Carregando lugares...
Carregando roteiro...
Calculando distância...
```

---

## 62. Salvamento

Estados:

```text
Salvando...
Salvo
Não foi possível salvar
```

---

## 63. Geração de proposta

O conteúdo deverá explicar o processo sem simular precisão técnica inexistente.

Exemplos:

```text
Analisando os lugares selecionados...
Agrupando opções próximas...
Verificando horários disponíveis...
Organizando os dias...
```

---

## 64. Progresso indeterminado

Quando não houver progresso mensurável, não apresentar percentual artificial.

Evitar:

```text
73% concluído
```

Sem base real.

---

## 65. Espera prolongada

Quando o processamento ultrapassar o esperado:

```text
A análise está levando mais tempo que o normal.
```

Ações possíveis:

```text
Continuar aguardando
Cancelar
Tentar novamente
```

---

# Parte XI — Sucesso e confirmação

## 66. Estrutura de sucesso

Mensagens de sucesso deverão informar o resultado.

Exemplos:

```text
Viagem criada
Lugar salvo
Atividade adicionada ao dia 24 de agosto
Alterações salvas
Proposta aplicada ao roteiro
```

---

## 67. Evitar redundância

Quando o resultado já estiver evidente na interface, não será necessária uma mensagem adicional.

Exemplo:

O ícone muda de `Salvar` para `Salvo`.

Nesse caso, uma notificação extra poderá ser desnecessária.

---

## 68. Confirmação com próximo passo

Exemplo:

```text
Atividade adicionada ao dia 24 de agosto.
```

Ação opcional:

```text
Ver no roteiro
```

---

## 69. Desfazer

Exemplo:

```text
Lugar removido dos Salvos.
```

Ação:

```text
Desfazer
```

---

# Parte XII — Erros

## 70. Princípio de erro

Uma mensagem de erro deverá responder:

1. o que aconteceu;
2. o que foi afetado;
3. o que o usuário pode fazer.

---

## 71. Estrutura

```text
Título
Descrição
Ação de recuperação
```

---

## 72. Erro de campo

### Evitar

```text
Campo inválido
```

### Preferir

```text
Informe uma data igual ou posterior a 22 de agosto.
```

---

## 73. Erro de salvamento

### Título

```text
Alteração não salva
```

### Descrição

```text
Não foi possível salvar a alteração. Os dados preenchidos foram preservados.
```

### Ação

```text
Tentar novamente
```

---

## 74. Erro de carregamento

### Título

```text
Não foi possível carregar os lugares
```

### Descrição

```text
Tente novamente. Seus filtros continuam aplicados.
```

### Ação

```text
Tentar novamente
```

---

## 75. Mapa indisponível

### Título

```text
Mapa indisponível
```

### Descrição

```text
Você ainda pode consultar os lugares em lista.
```

### Ações

```text
Tentar novamente
Ver lista de lugares
```

---

## 76. Rota indisponível

```text
Não foi possível calcular a rota.
```

Complemento:

```text
A distância em linha reta ainda está disponível.
```

---

## 77. Falha na proposta

### Título

```text
Não foi possível gerar a proposta
```

### Descrição

```text
Seu roteiro atual não foi alterado.
```

### Ações

```text
Tentar novamente
Continuar manualmente
```

---

## 78. Sem conexão

### Título

```text
Sem conexão
```

### Descrição

```text
Algumas informações podem estar desatualizadas.
```

### Ação

```text
Tentar novamente
```

---

## 79. Sessão expirada

### Título

```text
Sua sessão expirou
```

### Descrição

```text
Entre novamente para continuar.
```

### Ação

```text
Entrar
```

---

## 80. Linguagem de culpa

Nunca utilizar:

```text
Você errou
Você informou dados incorretos
Falha do usuário
```

Preferir explicar a condição objetivamente.

---

# Parte XIII — Alertas e conflitos

## 81. Estrutura do alerta

Um alerta deverá conter:

* severidade;
* título;
* contexto;
* impacto;
* ação.

---

## 82. Erro

Exemplo:

```text
ERRO

Atividades sobrepostas

A segunda atividade começa antes do término da primeira.

Ajustar horários
```

---

## 83. Risco

Exemplo:

```text
RISCO

Intervalo curto

Há apenas 5 minutos entre as atividades.

Revisar horário
```

---

## 84. Sugestão

Exemplo:

```text
SUGESTÃO

Lugares distantes no mesmo dia

Reorganizar as atividades pode reduzir os deslocamentos.

Ver alternativa
```

---

## 85. Alerta ignorável

Quando o usuário puder ignorar:

```text
Ignorar risco
```

Evitar:

```text
Ignorar erro
```

Erros bloqueantes não deverão ser ignoráveis.

---

## 86. Limitação da análise

Utilizar:

```text
A análise considera as informações disponíveis atualmente.
```

Não utilizar:

```text
Garantimos que o roteiro é viável.
```

---

# Parte XIV — Distância e deslocamento

## 87. Distância confirmada e estimada

Quando houver estimativa:

```text
1,8 km · cerca de 7 min de carro
```

Quando houver incerteza:

```text
Tempo estimado: 7 a 12 min
```

---

## 88. Origem

Exemplos:

```text
Da hospedagem
Da atividade anterior
Da sua localização
```

---

## 89. Transporte

Rótulos:

* A pé;
* Carro;
* Transporte público;
* Transporte por aplicativo;
* Bicicleta, quando disponível.

Evitar misturar categorias e marcas comerciais sem necessidade.

---

## 90. Atualização

Exemplo:

```text
Estimativa atualizada há 10 minutos
```

Não utilizar precisão de atualização quando ela não estiver disponível.

---

# Parte XV — Recomendações

## 91. Estrutura

Uma Recomendação deverá comunicar:

* o que está sendo sugerido;
* por que faz sentido;
* limitações relevantes;
* ação possível.

---

## 92. Justificativa

Exemplos:

```text
Próxima da hospedagem
Combina com seu interesse por praias
Boa opção para a manhã
Fica na mesma região das atividades do dia
```

---

## 93. Recomendação sem certeza

Utilizar:

```text
Pode ser uma boa opção
```

Ou:

```text
Esta opção combina com as Preferências informadas.
```

Evitar:

```text
Esta é a melhor opção.
```

Sem base suficiente.

---

## 94. Ranking

Quando houver ordenação:

```text
Mais relevante para esta viagem
```

Evitar apresentar uma ordem como verdade objetiva.

---

## 95. Explicabilidade

Quando possível, a justificativa deverá utilizar fatores compreensíveis:

* proximidade;
* horário;
* preço;
* categoria;
* Ritmo;
* Dia;
* Preferências;
* compatibilidade geográfica.

---

# Parte XVI — Conteúdo gerado por IA

## 96. Princípio

Conteúdo gerado por IA deverá ser tratado como apoio à decisão.

Não deverá ser apresentado como:

* certeza;
* autoridade absoluta;
* garantia;
* substituição da decisão do usuário.

---

## 97. Identificação

Quando necessário, o produto poderá indicar:

```text
Sugestão do RouteBook
```

Ou:

```text
Proposta gerada com base nas informações da viagem
```

Não é necessário destacar tecnicamente o modelo utilizado na interface principal.

---

## 98. Limitações

Exemplo:

```text
Horários e preços podem mudar. Confirme antes de sair.
```

---

## 99. Proposta de Roteiro

Texto recomendado:

```text
Criamos uma proposta com base na proximidade, no ritmo da viagem e nos lugares selecionados.
```

Complemento:

```text
Revise antes de aplicar ao roteiro.
```

---

## 100. Erro de IA

Texto recomendado:

```text
Não foi possível gerar uma proposta agora.
```

Complemento:

```text
Seu roteiro atual não foi alterado.
```

Ações:

```text
Tentar novamente
Continuar manualmente
```

---

## 101. Conteúdo não verificado

Quando o produto não puder confirmar uma informação:

```text
Informação não confirmada
```

Ou:

```text
Confirme diretamente com o estabelecimento.
```

---

# Parte XVII — Ações destrutivas e confirmações

## 102. Estrutura de confirmação

Uma confirmação deverá conter:

* ação;
* objeto;
* impacto;
* reversibilidade;
* botão específico.

---

## 103. Excluir Viagem

### Título

```text
Excluir a viagem para Pipa?
```

### Descrição

```text
O roteiro, os lugares salvos e as configurações desta viagem serão removidos.
```

### Complemento

```text
Esta ação não poderá ser desfeita.
```

### Ações

```text
Cancelar
Excluir viagem
```

---

## 104. Remover Atividade

### Título

```text
Remover esta atividade?
```

### Descrição

```text
A atividade será removida do roteiro. O lugar continuará nos Salvos.
```

### Ações

```text
Cancelar
Remover atividade
```

---

## 105. Descartar proposta

### Título

```text
Descartar esta proposta?
```

### Descrição

```text
Seu roteiro atual não será alterado.
```

### Ações

```text
Continuar revisando
Descartar proposta
```

---

## 106. Alterações não salvas

### Título

```text
Descartar alterações?
```

### Descrição

```text
As alterações feitas nesta tela ainda não foram salvas.
```

### Ações

```text
Continuar editando
Descartar alterações
```

---

# Parte XVIII — Configurações

## 107. Alterar Hospedagem

### Alerta de impacto

```text
Alterar a hospedagem recalculará distâncias, deslocamentos e recomendações.
```

### Ações

```text
Cancelar
Salvar alteração
```

---

## 108. Alterar Período

Exemplo:

```text
A nova data final remove 2 dias da viagem e afeta 4 atividades.
```

Ações:

```text
Revisar atividades
Continuar alteração
```

---

## 109. Alterar Destino

Texto recomendado:

```text
Alterar o destino pode tornar a hospedagem, os lugares salvos e as atividades incompatíveis.
```

Ações:

```text
Cancelar
Revisar impacto
```

---

## 110. Preferências

Exemplos de rótulos:

* Interesses;
* Faixa de orçamento;
* Meio de transporte;
* Ritmo da viagem;
* Restrições;
* Perfil do grupo.

---

# Parte XIX — Navegação

## 111. Áreas principais

Rótulos oficiais:

* Viagem;
* Explorar;
* Mapa;
* Roteiro;
* Salvos;
* Configurações.

---

## 112. Área Viagem

O rótulo `Viagem` representa a Visão Geral no contexto móvel.

Na documentação e em títulos de página, poderá ser utilizado:

```text
Visão Geral da Viagem
```

Na navegação:

```text
Viagem
```

---

## 113. Voltar contextual

Exemplos:

```text
Voltar para Explorar
Voltar ao roteiro
Voltar para Minhas viagens
```

O uso de `Voltar` isolado será aceitável quando o contexto estiver claro.

---

## 114. Breadcrumbs

Quando utilizados em desktop, deverão refletir a hierarquia real.

Exemplo:

```text
Minhas viagens / Pipa / Roteiro / 24 de agosto
```

---

# Parte XX — Acessibilidade do conteúdo

## 115. Clareza sem contexto visual

O texto deverá continuar compreensível quando:

* lido por leitor de tela;
* apresentado sem ícone;
* retirado da cor;
* anunciado isoladamente.

---

## 116. Rótulos acessíveis

Ícones sem texto visível deverão possuir nome acessível.

Exemplos:

```text
Salvar Praia do Amor
Abrir configurações da viagem
Remover filtro Praias
```

---

## 117. Evitar orientação espacial isolada

Evitar:

```text
Clique no botão acima
Veja a opção à direita
```

Preferir:

```text
Selecione Aplicar filtros.
```

---

## 118. Links

O texto do link deverá indicar seu destino.

### Evitar

```text
Clique aqui
Saiba mais
```

### Preferir

```text
Ver detalhes do lugar
Consultar política de privacidade
```

---

## 119. Imagens

Textos alternativos deverão:

* descrever função ou conteúdo relevante;
* evitar repetir legenda;
* omitir imagens decorativas.

Exemplo:

```text
Mapa com a hospedagem e quatro lugares salvos em Pipa
```

---

## 120. Anúncios dinâmicos

Exemplos:

```text
Filtro Praias aplicado. 18 lugares encontrados.
```

```text
Praia do Amor adicionada ao dia 24 de agosto.
```

```text
Não foi possível salvar a atividade.
```

---

## 121. Leitura de números

Rótulos acessíveis poderão expandir abreviações.

Visual:

```text
1,8 km · 7 min
```

Acessível:

```text
1 vírgula 8 quilômetro. Aproximadamente 7 minutos.
```

---

# Parte XXI — Localização e internacionalização

## 122. Estrutura preparada para localização

O conteúdo não deverá depender de:

* concatenação rígida;
* ordem fixa de palavras;
* abreviações exclusivas;
* tamanho exato de texto;
* gênero não adaptável.

---

## 123. Datas e números

Datas, valores e unidades deverão utilizar formatação de localidade.

Exemplo inicial:

```text
pt-BR
```

Futuras localidades poderão exigir:

* ordem diferente de data;
* símbolo monetário;
* separador decimal;
* pluralização;
* fuso horário.

---

## 124. Textos em imagens

Textos de interface não deverão ser incorporados diretamente em imagens quando precisarem ser traduzidos.

---

## 125. Expansão de texto

Layouts deverão suportar expansão textual.

Rótulos não deverão depender de largura mínima excessivamente restrita.

---

## 126. Pluralização

Exemplos:

```text
1 atividade
2 atividades
```

```text
1 lugar encontrado
18 lugares encontrados
```

A pluralização deverá ser tratada como regra de conteúdo, não por concatenação improvisada.

---

# Parte XXII — Inventário de microcopy

## 127. Criação da Viagem

| Contexto              | Texto                       |
| --------------------- | --------------------------- |
| Título                | Criar viagem                |
| Destino               | Para onde você vai?         |
| Datas                 | Quando será a viagem?       |
| Hospedagem            | Onde você ficará hospedado? |
| Viajantes             | Quem vai viajar?            |
| Ação final            | Criar viagem                |
| Hospedagem indefinida | Usar referência provisória  |

---

## 128. Explorar

| Contexto  | Texto                |
| --------- | -------------------- |
| Título    | Explorar             |
| Busca     | Pesquisar lugares    |
| Filtros   | Filtros              |
| Ordenação | Relevância           |
| Salvar    | Salvar               |
| Salvo     | Salvo                |
| Planejar  | Adicionar ao roteiro |
| Abrir     | Ver detalhes         |
| Mapa      | Ver no mapa          |

---

## 129. Roteiro

| Contexto      | Texto                   |
| ------------- | ----------------------- |
| Título        | Roteiro                 |
| Adicionar     | Adicionar atividade     |
| Período livre | Adicionar período livre |
| Revisão       | Revisar roteiro         |
| Edição        | Editar atividade        |
| Remoção       | Remover atividade       |
| Rota          | Abrir rota              |
| Vazio         | Este dia está livre     |

---

## 130. Proposta

| Contexto      | Texto                  |
| ------------- | ---------------------- |
| Iniciar       | Gerar proposta         |
| Processamento | Organizando roteiro... |
| Aceitar       | Aceitar proposta       |
| Editar        | Editar proposta        |
| Repetir       | Gerar novamente        |
| Descartar     | Descartar proposta     |

---

## 131. Estados

| Contexto       | Texto                     |
| -------------- | ------------------------- |
| Carregando     | Carregando...             |
| Salvando       | Salvando...               |
| Salvo          | Salvo                     |
| Erro           | Não foi possível concluir |
| Nova tentativa | Tentar novamente          |
| Cancelamento   | Cancelar                  |
| Fechamento     | Fechar                    |
| Desfazer       | Desfazer                  |

---

# Parte XXIII — Conteúdo proibido ou desaconselhado

## 132. Promessas absolutas

Evitar:

* melhor opção garantida;
* roteiro perfeito;
* viagem sem imprevistos;
* preço garantido;
* horário garantido;
* trajeto sempre mais rápido.

---

## 133. Linguagem de pressão

Evitar:

* você precisa;
* faça agora;
* não perca;
* última chance;

exceto quando houver condição real e verificável.

---

## 134. Linguagem manipulativa

Não utilizar:

* culpa;
* medo artificial;
* escassez não confirmada;
* urgência falsa;
* confirmação enganosa.

---

## 135. Linguagem técnica

Evitar apresentar ao usuário termos como:

* endpoint;
* payload;
* timeout;
* stack trace;
* geocoding failure;
* exception;
* cache invalidation.

Esses termos poderão existir em logs e documentação técnica.

---

## 136. Antropomorfização excessiva

Evitar:

```text
Eu pensei no roteiro perfeito para você.
```

Preferir:

```text
A proposta considera proximidade, ritmo e lugares selecionados.
```

---

# Parte XXIV — Critérios de aceite

## 137. Clareza

* o texto comunica uma ideia principal;
* o usuário entende a ação;
* o impacto está explícito;
* não há ambiguidade relevante.

---

## 138. Consistência

* termos oficiais são preservados;
* ações equivalentes usam rótulos equivalentes;
* mensagens seguem padrões;
* capitalização está consistente.

---

## 139. Transparência

* estimativas estão identificadas;
* limitações estão comunicadas;
* recomendações possuem justificativa;
* automação não é apresentada como certeza.

---

## 140. Recuperação

* erros possuem ação;
* dados preservados são mencionados;
* falhas externas possuem alternativa;
* o próximo passo está claro.

---

## 141. Acessibilidade

* rótulos funcionam sem ícones;
* links são descritivos;
* mensagens podem ser anunciadas;
* números e unidades são compreensíveis;
* o texto não depende de posição ou cor.

---

## 142. Localização

* frases não dependem de concatenação rígida;
* pluralização está correta;
* datas e valores utilizam localidade;
* textos suportam expansão.

---

# Parte XXV — Validação

## 143. Testes de compreensão

O conteúdo deverá ser testado em tarefas como:

1. Criar uma Viagem.
2. Diferenciar Salvar de Adicionar ao Roteiro.
3. Entender um conflito.
4. Interpretar uma estimativa.
5. Recuperar-se de erro.
6. Alterar Hospedagem.
7. Revisar proposta.
8. Excluir Viagem.

---

## 144. Perguntas de validação

* O usuário entende o que acontecerá?
* O botão representa o resultado?
* A mensagem explica o erro?
* A recomendação parece uma sugestão ou uma ordem?
* A diferença entre Salvos e Roteiro está clara?
* O impacto da ação destrutiva está compreensível?
* A limitação da informação está explícita?
* O próximo passo está claro?

---

## 145. Métricas possíveis

* taxa de erro;
* abandono;
* repetição de ação;
* retorno;
* cancelamento;
* uso de ajuda;
* compreensão de alertas;
* recuperação após falha;
* seleção incorreta entre Salvar e Adicionar.

---

# Parte XXVI — Governança

## 146. Inclusão de novo termo

Um novo termo deverá:

* possuir definição;
* não conflitar com termos existentes;
* ser adicionado ao glossário;
* ser utilizado de forma consistente;
* possuir tradução futura possível.

---

## 147. Alteração de rótulo

A alteração de um rótulo deverá considerar:

* Arquitetura da Informação;
* Fluxos;
* Wireframes;
* Especificações de Interação;
* testes;
* métricas;
* documentação;
* código;
* localização.

---

## 148. Revisão de microcopy

Textos críticos deverão ser revisados por:

* clareza;
* precisão;
* impacto;
* acessibilidade;
* consistência;
* localização;
* alinhamento com o domínio.

---

## 149. Conteúdo dinâmico

Conteúdos dinâmicos deverão possuir:

* fonte de dados definida;
* estado ausente;
* estado parcial;
* estado estimado;
* fallback;
* regra de formatação.

---

## 150. Uso por agentes de IA

Agentes que produzam conteúdo deverão:

* seguir a terminologia oficial;
* utilizar a voz definida;
* adaptar o tom ao contexto;
* não inventar garantias;
* identificar estimativas;
* explicar limitações;
* preservar o controle do usuário;
* produzir mensagens recuperáveis;
* evitar jargão técnico;
* respeitar acessibilidade;
* respeitar localização.

---

## 151. Checklist de revisão

Antes de aprovar este documento, verificar:

* voz está definida;
* tons estão definidos;
* terminologia está definida;
* convenções de escrita estão definidas;
* títulos estão definidos;
* botões estão definidos;
* formulários estão definidos;
* estados vazios estão definidos;
* carregamento está definido;
* sucessos estão definidos;
* erros estão definidos;
* alertas estão definidos;
* Recomendações estão definidas;
* conteúdo de IA está definido;
* ações destrutivas estão definidas;
* acessibilidade está definida;
* localização está definida;
* inventário de microcopy está presente;
* conteúdo proibido está definido;
* critérios de aceite estão definidos;
* governança está definida.

---

## 152. Declaração final

As Diretrizes de Conteúdo e Microcopy estabelecem como o RouteBook deverá se comunicar com o usuário.

O conteúdo deverá tornar a experiência:

* clara;
* confiável;
* orientativa;
* transparente;
* acessível;
* consistente.

O RouteBook não deverá apenas informar dados.

Ele deverá ajudar o usuário a compreender:

* o contexto da Viagem;
* as opções disponíveis;
* o impacto de cada decisão;
* os limites das informações;
* o próximo passo possível.

Toda mensagem deverá contribuir para uma decisão mais consciente, sem substituir a autonomia do viajante.
