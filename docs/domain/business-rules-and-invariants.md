---

id: RB-DOM-003

title: Regras de Negócio e Invariantes
description: Define as regras de negócio, invariantes, pré-condições, pós-condições, políticas, exceções e critérios de validação que governam o domínio do RouteBook.

document_type: domain
owner: Domain

status: Draft
version: "0.1.0"

created: "2026-07-17"
last_updated: null

authors:

- RouteBook Team

tags:

- domain
- business-rules
- invariants
- validation
- policies
- travel-planning
- ai-first

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
- RB-UX-006
- RB-DS-001
- RB-DS-002
- RB-DS-003
- RB-DS-004
- RB-DOM-001
- RB-DOM-002

prerequisites:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
- RB-DOM-001
- RB-DOM-002

next_documents:

- RB-DOM-004
- RB-ARC-001
- RB-DATA-001
- RB-QA-001

ai_context:
priority: critical
index: true
---

# RouteBook — Regras de Negócio e Invariantes

## 1. Propósito deste documento

Este documento define as regras de negócio e invariantes oficiais do RouteBook.

Seu objetivo é transformar os conceitos descritos no Modelo de Domínio em comportamentos verificáveis e consistentes.

As regras definidas aqui deverão orientar:

* requisitos;
* arquitetura;
* implementação;
* validação;
* APIs;
* persistência;
* serviços de domínio;
* agentes de IA;
* testes;
* tratamento de erros;
* auditoria;
* analytics;
* evolução do produto.

Este documento define:

* invariantes;
* pré-condições;
* pós-condições;
* políticas;
* regras derivadas;
* regras de validação;
* regras de autorização;
* regras temporais;
* regras geográficas;
* regras de planejamento;
* regras de recomendação;
* regras de aceitação de propostas;
* regras de conflitos;
* regras de proveniência;
* exceções;
* prioridades;
* critérios de bloqueio;
* critérios de invalidação.

Este documento não define:

* tabelas;
* endpoints;
* classes;
* frameworks;
* mensagens técnicas;
* interface visual;
* provedor externo;
* algoritmo específico de recomendação;
* implementação da IA.

---

## 2. Relação com os documentos de domínio

A sequência documental é:

```text
RB-DOM-001 — Modelo de Domínio
→ define entidades, objetos de valor, agregados e relações

RB-DOM-002 — Linguagem Ubíqua
→ define o significado oficial dos termos

RB-DOM-003 — Regras de Negócio e Invariantes
→ define o que deve, pode e não pode acontecer

RB-DOM-004 — Eventos e Ciclos de Vida
→ definirá transições, eventos e efeitos temporais
```

Este documento deverá utilizar exclusivamente a terminologia canônica definida em `RB-DOM-002`.

---

## 3. Definições normativas

Os termos normativos deste documento são:

* `DEVE`: obrigação;
* `NÃO DEVE`: proibição;
* `PODE`: possibilidade permitida;
* `RECOMENDA-SE`: orientação não obrigatória;
* `BLOQUEANTE`: impede a operação;
* `NÃO BLOQUEANTE`: permite continuar com comunicação;
* `DERIVADO`: calculado a partir de outros dados;
* `CANÔNICO`: estado oficial persistido;
* `TRANSITÓRIO`: estado temporário de processamento.

---

## 4. Tipos de regra

As regras serão classificadas em:

### Invariante

Condição que deve permanecer verdadeira dentro de um limite de consistência.

### Pré-condição

Condição necessária antes da execução de uma operação.

### Pós-condição

Condição que deve ser verdadeira após uma operação concluída.

### Política

Critério de decisão que pode evoluir sem alterar a identidade do domínio.

### Regra derivada

Valor ou estado calculado a partir de dados canônicos.

### Restrição operacional

Limitação imposta por capacidade técnica, integração ou escopo do produto.

---

## 5. Convenção de identificação

As regras utilizarão o padrão:

```text
RB-BR-XXX
```

Exemplo:

```text
RB-BR-001 — Toda Viagem deve possuir um proprietário
```

Sub-regras poderão utilizar:

```text
RB-BR-001-A
RB-BR-001-B
```

---

# Parte I — Princípios transversais

## 6. RB-BR-001 — Controle do Usuário

Recomendações, Propostas e automações NÃO DEVEM alterar o estado canônico da Viagem sem decisão explícita do Usuário autorizado.

### Aplica-se a

* Roteiro;
* Atividades;
* Períodos Livres;
* Preferências;
* Hospedagem;
* Destino;
* transporte;
* Lugares Salvos.

### É permitido

* calcular;
* sugerir;
* simular;
* pré-visualizar;
* identificar impacto;
* preparar alteração pendente.

### Não é permitido

* aplicar silenciosamente;
* excluir;
* substituir;
* reorganizar;
* ignorar Restrição obrigatória.

---

## 7. RB-BR-002 — Preservação do estado válido

Falhas em serviços externos NÃO DEVEM apagar ou corromper estado canônico válido.

### Deve ser preservado

* Viagem;
* Roteiro;
* Atividades;
* Preferências;
* Lugares Salvos;
* alterações locais ainda não enviadas, quando tecnicamente possível;
* Proposta anterior ainda válida.

---

## 8. RB-BR-003 — Separação entre fato, estimativa e sugestão

Toda informação relevante DEVE ser classificada como:

* confirmada;
* estimada;
* inferida;
* sugerida;
* desconhecida;
* indisponível;
* desatualizada.

A interface e os contratos de domínio NÃO DEVEM representar essas categorias como equivalentes.

---

## 9. RB-BR-004 — Proveniência obrigatória

Dados externos relevantes DEVEM possuir Proveniência suficiente para identificar:

* Fonte de Dados;
* momento de obtenção;
* identificador externo, quando existir;
* método;
* atualização;
* confiança, quando aplicável.

---

## 10. RB-BR-005 — Planejamento parcial válido

Uma Viagem PODE existir com:

* Roteiro vazio;
* Dias vazios;
* Atividades sem horário;
* Hospedagem provisória;
* Preferências incompletas;
* informações externas ausentes.

Essas condições NÃO DEVEM invalidar a Viagem quando os requisitos mínimos forem atendidos.

---

## 11. RB-BR-006 — Estados derivados não substituem fatos

Estados como:

* Lugar Planejado;
* Dia vazio;
* Viagem em andamento;
* Roteiro parcial;
* conflito ativo;

DEVEM ser derivados de dados canônicos sempre que possível.

---

## 12. RB-BR-007 — Idempotência conceitual

Operações repetidas com a mesma intenção NÃO DEVEM produzir duplicações indevidas.

Exemplos:

* salvar o mesmo Lugar duas vezes;
* aceitar a mesma Proposta duas vezes;
* adicionar o mesmo evento processado novamente;
* resolver Conflito já resolvido.

---

# Parte II — Conta, Usuário e autorização

## 13. RB-BR-008 — Responsável obrigatório pela Conta

Toda Conta ativa DEVE possuir pelo menos um Usuário responsável.

### Bloqueante

Sim.

---

## 14. RB-BR-009 — Proprietário obrigatório da Viagem

Toda Viagem DEVE possuir pelo menos um participante com papel `owner`.

### Não permitido

* remover o último owner;
* desativar o último owner sem transferência;
* deixar a Viagem sem responsável.

---

## 15. RB-BR-010 — Papéis e permissões

As operações DEVEM respeitar o papel do participante.

### Owner

Pode:

* editar;
* excluir;
* arquivar;
* alterar participantes;
* transferir ownership.

### Editor

Pode:

* editar dados da Viagem;
* editar Roteiro;
* salvar Lugares;
* revisar Propostas.

Não pode, salvo política futura:

* excluir a Viagem;
* remover o último owner;
* transferir ownership.

### Viewer

Pode consultar.

Não pode alterar estado canônico.

---

## 16. RB-BR-011 — Autorização independente da interface

A permissão DEVE ser verificada no domínio ou na aplicação.

Ocultar um botão NÃO É uma regra de autorização suficiente.

---

## 17. RB-BR-012 — Associação entre Usuário e Viajante

Um Usuário PODE estar associado a um Viajante.

A associação NÃO É obrigatória.

Um participante com acesso PODE não viajar.

Um Viajante PODE não possuir Conta.

---

# Parte III — Criação e validade da Viagem

## 18. RB-BR-013 — Requisitos mínimos para criar uma Viagem planejável

Para sair de `Draft` e tornar-se `Planned`, a Viagem DEVE possuir:

* Destino válido;
* Período válido;
* pelo menos um Viajante;
* pelo menos um owner.

A Hospedagem NÃO É obrigatória.

---

## 19. RB-BR-014 — Período válido

O Período da Viagem DEVE satisfazer:

```text
dataInicial <= dataFinal
```

### Bloqueante

Sim.

---

## 20. RB-BR-015 — Datas locais

As datas da Viagem DEVEM ser interpretadas como datas locais no fuso da Viagem.

Elas NÃO DEVEM ser tratadas como instantes UTC puros.

---

## 21. RB-BR-016 — Geração dos Dias da Viagem

Ao validar o Período, o sistema DEVE produzir um Dia da Viagem para cada data inclusiva.

Exemplo:

```text
22 a 29 de agosto
→ 8 Dias da Viagem
```

---

## 22. RB-BR-017 — Unicidade de Dia

Não PODE existir mais de um Dia da Viagem para a mesma data dentro da mesma Viagem.

---

## 23. RB-BR-018 — Nome da Viagem

O nome da Viagem PODE ser:

* informado pelo Usuário;
* derivado do Destino;
* alterado posteriormente.

A alteração do nome NÃO DEVE alterar a identidade da Viagem.

---

## 24. RB-BR-019 — Estado temporal da Viagem

Na ausência de estado manual prioritário:

```text
hoje < dataInicial
→ Planned

dataInicial <= hoje <= dataFinal
→ InProgress

hoje > dataFinal
→ Completed
```

Estados manuais como `Cancelled` e `Archived` possuem precedência de apresentação.

---

## 25. RB-BR-020 — Exclusão da Viagem

Excluir uma Viagem DEVE exigir:

* autorização;
* identificação explícita da Viagem;
* confirmação;
* comunicação de irreversibilidade conforme política;
* proteção contra duplicação.

---

## 26. RB-BR-021 — Arquivamento não é exclusão

Arquivar uma Viagem DEVE:

* preservar dados;
* retirar a Viagem das visões principais;
* permitir consulta ou restauração futura conforme política.

---

## 27. RB-BR-022 — Cancelamento não é exclusão

Cancelar uma Viagem DEVE preservar seu histórico.

O cancelamento NÃO DEVE apagar automaticamente:

* Roteiro;
* Lugares Salvos;
* Preferências;
* Propostas;
* Conflitos históricos.

---

# Parte IV — Alteração do Período

## 28. RB-BR-023 — Ampliação do Período

Ao ampliar o Período:

* novos Dias DEVEM ser criados;
* Dias existentes DEVEM ser preservados;
* Atividades existentes DEVEM permanecer;
* a ordem cronológica DEVE ser recalculada.

---

## 29. RB-BR-024 — Redução do Período

Ao reduzir o Período, o sistema DEVE identificar:

* Dias removidos;
* Atividades afetadas;
* Períodos Livres afetados;
* Propostas afetadas;
* Conflitos afetados.

A alteração NÃO DEVE ser aplicada silenciosamente quando houver conteúdo afetado.

---

## 30. RB-BR-025 — Dias removidos sem conteúdo

Dias fora do novo Período e sem conteúdo PODEM ser removidos após confirmação simples ou conforme política de edição.

---

## 31. RB-BR-026 — Dias removidos com conteúdo

Quando Dias removidos possuírem conteúdo, o Usuário DEVE poder:

* cancelar a alteração;
* revisar o conteúdo;
* mover Atividades;
* remover conteúdo;
* confirmar a perda explicitamente, se permitido.

---

## 32. RB-BR-027 — Invalidação após alteração do Período

Alterar o Período DEVE reavaliar:

* status da Viagem;
* Dias;
* Roteiro;
* Propostas;
* Recomendações;
* Conflitos;
* reservas futuras, quando existirem.

---

# Parte V — Destino e Hospedagem

## 33. RB-BR-028 — Destino geograficamente válido

Um Destino DEVE possuir referência geográfica suficiente para:

* identificação;
* associação com fuso;
* pesquisa de Lugares.

---

## 34. RB-BR-029 — Alteração do Destino

Alterar o Destino é uma operação estrutural de alto impacto.

Antes da aplicação, o sistema DEVE identificar:

* Hospedagem potencialmente incompatível;
* Lugares Salvos incompatíveis;
* Atividades associadas a outro Destino;
* Propostas inválidas;
* Recomendações inválidas;
* estimativas geográficas inválidas.

---

## 35. RB-BR-030 — Destino não remove dados silenciosamente

A alteração do Destino NÃO DEVE apagar automaticamente Lugares, Atividades ou Preferências.

Os elementos incompatíveis DEVEM ser:

* marcados para revisão;
* migrados por decisão explícita;
* removidos mediante confirmação.

---

## 36. RB-BR-031 — Hospedagem opcional

A ausência de Hospedagem NÃO DEVE impedir:

* criação da Viagem;
* pesquisa de Lugares;
* salvamento;
* planejamento manual.

Pode limitar:

* Distâncias contextuais;
* Recomendações por proximidade;
* Deslocamentos a partir da Hospedagem.

---

## 37. RB-BR-032 — Hospedagem provisória identificada

Uma Hospedagem provisória DEVE ser claramente identificada como aproximação.

Cálculos derivados DEVEM herdar essa incerteza.

---

## 38. RB-BR-033 — Localização necessária para cálculo

Uma Hospedagem somente PODE ser utilizada em cálculo geográfico quando possuir Localização válida.

---

## 39. RB-BR-034 — Alteração da Hospedagem

Alterar a Hospedagem DEVE invalidar ou recalcular:

* Distâncias a partir da Hospedagem;
* Tempos de Deslocamento;
* rankings por proximidade;
* Recomendações relacionadas;
* Conflitos geográficos;
* agrupamentos contextuais.

---

## 40. RB-BR-035 — Hospedagem confirmada

Marcar Hospedagem como confirmada DEVE exigir origem adequada:

* confirmação do Usuário;
* importação de Reserva válida;
* fonte considerada suficiente pela política.

---

# Parte VI — Viajantes, grupo e Preferências

## 41. RB-BR-036 — Viajante mínimo

Toda Viagem planejável DEVE possuir pelo menos um Viajante.

---

## 42. RB-BR-037 — Quantidade derivada

A quantidade de Viajantes DEVE ser derivada da coleção de Viajantes, não mantida como valor independente sem sincronização.

---

## 43. RB-BR-038 — Perfil do Grupo derivado

O Perfil do Grupo DEVE ser recalculado quando:

* Viajante for adicionado;
* Viajante for removido;
* faixa etária mudar;
* necessidade relevante mudar.

---

## 44. RB-BR-039 — Minimização de dados pessoais

O RouteBook DEVE preferir dados funcionais mínimos.

Exemplo:

```text
Necessita acesso sem escadas
```

é preferível a armazenar diagnóstico médico quando não necessário.

---

## 45. RB-BR-040 — Preferência não é Restrição

Uma Preferência PODE influenciar ordenação e recomendação.

Ela NÃO DEVE bloquear uma opção automaticamente.

---

## 46. RB-BR-041 — Restrição obrigatória

Uma Restrição marcada como `mandatory`:

* NÃO DEVE ser violada silenciosamente;
* DEVE bloquear recomendações incompatíveis ou gerar Erro de planejamento;
* DEVE ser considerada em Propostas;
* DEVE possuir origem identificável.

---

## 47. RB-BR-042 — Conflito entre Preferências

Preferências conflitantes DEVEM resultar em:

* ponderação;
* solicitação de decisão;
* recomendação com limitação;
* explicação.

Não DEVEM ser resolvidas silenciosamente como se houvesse certeza.

---

## 48. RB-BR-043 — Ritmo como orientação

O Ritmo influencia:

* densidade;
* quantidade de Atividades;
* intervalos;
* distribuição.

O Ritmo NÃO impõe quantidade fixa universal.

---

## 49. RB-BR-044 — Orçamento sem moeda é incompleto

Valores monetários DEVEM possuir moeda.

Um número isolado NÃO DEVE ser interpretado como Orçamento válido.

---

## 50. RB-BR-045 — Orçamento desconhecido

Ausência de Orçamento DEVE ser suportada.

O sistema PODE recomendar opções, mas DEVE evitar alegar compatibilidade financeira não verificada.

---

# Parte VII — Lugar e dados do Lugar

## 51. RB-BR-046 — Identidade interna do Lugar

A identidade canônica de um Lugar NÃO DEVE depender exclusivamente de identificador externo.

---

## 52. RB-BR-047 — Duplicidade de Lugar

Ao receber dados potencialmente duplicados, o sistema DEVE considerar:

* nome;
* Localização;
* categoria;
* endereço;
* identificadores externos;
* fonte.

A consolidação NÃO DEVE eliminar Proveniência.

---

## 53. RB-BR-048 — Categoria múltipla

Um Lugar PODE possuir várias Categorias de Lugar.

---

## 54. RB-BR-049 — Ausência de preço não é gratuidade

Quando preço não estiver disponível:

```text
Preço desconhecido
```

NÃO DEVE ser representado como:

```text
Gratuito
```

---

## 55. RB-BR-050 — Ausência de avaliação não é nota zero

Um Lugar sem avaliação NÃO DEVE receber valor zero como representação visual ou de domínio.

---

## 56. RB-BR-051 — Estado operacional desconhecido

Quando não houver informação suficiente, o estado operacional DEVE ser `unknown`.

NÃO DEVE ser inferido como aberto.

---

## 57. RB-BR-052 — Horário não garante disponibilidade

Horário de Funcionamento informado NÃO garante:

* entrada;
* reserva;
* ausência de lotação;
* funcionamento excepcional.

---

## 58. RB-BR-053 — Dados de Lugar podem ser parciais

Um Lugar PODE existir com:

* imagem ausente;
* preço ausente;
* avaliação ausente;
* horário ausente;
* acessibilidade desconhecida.

A ausência DEVE ser representada explicitamente.

---

## 59. RB-BR-054 — Lugar indisponível no Roteiro

Se um Lugar associado a uma Atividade ficar indisponível:

* a Atividade NÃO DEVE ser removida automaticamente;
* DEVE ser marcada como `needs-review` ou equivalente;
* um Conflito DEVE ser produzido;
* alternativas PODEM ser recomendadas.

---

# Parte VIII — Lugares Salvos

## 60. RB-BR-055 — Unicidade de Lugar Salvo

Um Lugar PODE ser salvo no máximo uma vez por Viagem.

### Repetição

Uma nova tentativa de salvar o mesmo Lugar DEVE ser idempotente.

---

## 61. RB-BR-056 — Salvar não cria Atividade

Salvar Lugar NÃO DEVE:

* criar Atividade;
* escolher Dia;
* definir horário;
* alterar Roteiro.

---

## 62. RB-BR-057 — Planejar não exige salvar

Um Lugar PODE ser adicionado ao Roteiro sem estar nos Salvos.

---

## 63. RB-BR-058 — Remover dos Salvos preserva Atividade

Remover um Lugar dos Salvos NÃO DEVE remover Atividades associadas.

---

## 64. RB-BR-059 — Estado Planejado derivado

Um Lugar é Planejado quando existe pelo menos uma Atividade ativa associada a ele.

---

## 65. RB-BR-060 — Múltiplas visitas

Um mesmo Lugar PODE possuir múltiplas Atividades na mesma Viagem.

A criação de visita adicional DEVE ser explícita quando o Lugar já estiver planejado.

---

# Parte IX — Roteiro e Dias

## 66. RB-BR-061 — Um Roteiro atual por Viagem

Uma Viagem DEVE possuir no máximo um Roteiro atual canônico.

Pode possuir:

* histórico;
* versões;
* Propostas;
* simulações.

---

## 67. RB-BR-062 — Roteiro inicial vazio

Ao criar uma Viagem planejável, o sistema PODE criar um Roteiro vazio com seus Dias.

---

## 68. RB-BR-063 — Dia pertence ao mesmo Roteiro

Toda Atividade e Período Livre DEVE pertencer a um Dia do mesmo Roteiro e da mesma Viagem.

---

## 69. RB-BR-064 — Ordem determinística

A ordem dos itens dentro de um Dia DEVE ser determinística.

Empates ou ausência de horário DEVEM utilizar critério explícito de posição.

---

## 70. RB-BR-065 — Atividades sem horário permitidas

Uma Atividade PODE existir sem horário.

Ela DEVE permanecer em contexto próprio ou possuir ordem explícita.

---

## 71. RB-BR-066 — Dia vazio não é inválido

Um Dia sem conteúdo é válido.

Pode resultar em:

* estado vazio;
* sugestão;
* decisão de Dia livre.

---

## 72. RB-BR-067 — Dia livre intencional

Um Dia marcado como livre NÃO DEVE ser preenchido automaticamente sem autorização.

---

## 73. RB-BR-068 — Versão do Roteiro

Toda alteração canônica no Roteiro DEVE incrementar ou gerar nova versão lógica.

Aplica-se a:

* adicionar;
* editar;
* remover;
* mover;
* aceitar Proposta;
* alterar Período Livre.

---

## 74. RB-BR-069 — Concorrência de edição

Uma alteração baseada em versão desatualizada NÃO DEVE sobrescrever silenciosamente estado mais recente.

O sistema DEVE:

* rejeitar;
* reconciliar;
* solicitar revisão;
* ou aplicar política explícita.

---

# Parte X — Atividades

## 75. RB-BR-070 — Título obrigatório

Toda Atividade DEVE possuir título não vazio.

---

## 76. RB-BR-071 — Dia obrigatório

Toda Atividade DEVE pertencer a um Dia da Viagem.

---

## 77. RB-BR-072 — Duração válida

Quando informada, a duração DEVE ser maior que zero.

---

## 78. RB-BR-073 — Horário no fuso correto

O horário de uma Atividade DEVE ser interpretado no fuso do Dia e da Viagem.

---

## 79. RB-BR-074 — Localização da Atividade

Uma Atividade PODE possuir Localização por:

* Lugar associado;
* endereço manual;
* coordenada manual;
* Hospedagem;
* ausência explícita.

---

## 80. RB-BR-075 — Lugar associado existente

Quando uma Atividade referenciar Lugar, esse Lugar DEVE existir no domínio e estar acessível à Viagem.

---

## 81. RB-BR-076 — Remover Atividade não remove Lugar

Remover Atividade NÃO DEVE:

* excluir Lugar;
* remover dos Salvos;
* apagar dados externos.

---

## 82. RB-BR-077 — Mover Atividade dentro do Dia

Mover Atividade DEVE:

* atualizar ordem;
* gerar nova versão;
* recalcular Deslocamentos;
* reavaliar Conflitos.

---

## 83. RB-BR-078 — Mover Atividade para outro Dia

Mover Atividade para outro Dia DEVE:

* validar se o Dia pertence à mesma Viagem;
* atualizar relacionamento;
* recalcular origem e destino dos Deslocamentos;
* reavaliar horários;
* reavaliar Conflitos;
* preservar identidade da Atividade.

---

## 84. RB-BR-079 — Atividade fixa

Uma Atividade `fixed` NÃO DEVE ser movida automaticamente por recomendação ou geração.

Alteração manual autorizada PODE ocorrer.

---

## 85. RB-BR-080 — Atividade flexível

Uma Atividade `flexible` PODE ser incluída em alternativas e Propostas.

A aplicação de mudança continua exigindo decisão.

---

## 86. RB-BR-081 — Atividade concluída

Marcar Atividade como concluída NÃO DEVE alterar automaticamente:

* Lugar Salvo;
* avaliação;
* Preferências;
* Roteiro de outros Dias.

---

## 87. RB-BR-082 — Atividade cancelada

Uma Atividade cancelada NÃO DEVE ser considerada para planejamento futuro ativo, mas PODE permanecer no histórico.

---

# Parte XI — Períodos Livres

## 88. RB-BR-083 — Período Livre intencional

Período Livre representa decisão de planejamento e NÃO DEVE ser confundido com ausência de dados.

---

## 89. RB-BR-084 — Período Livre protegido

Um Período Livre `protected` NÃO PODE ser preenchido por:

* Proposta;
* reorganização automática;
* recomendação aplicada em lote.

---

## 90. RB-BR-085 — Período Livre flexível

Um Período Livre `flexible` PODE receber sugestão.

A substituição DEVE exigir decisão explícita.

---

## 91. RB-BR-086 — Sobreposição com Período Livre

Atividade sobreposta a Período Livre protegido DEVE gerar Erro de planejamento ou impedir a operação, conforme política.

---

## 92. RB-BR-087 — Remoção do Período Livre

Remover um Período Livre NÃO cria automaticamente Atividade nem reorganiza o Dia.

---

# Parte XII — Deslocamentos e estimativas

## 93. RB-BR-088 — Deslocamento entre itens consecutivos

Deslocamentos derivados DEVEM ser calculados entre referências geográficas consecutivas relevantes.

---

## 94. RB-BR-089 — Origem inicial do Dia

A origem inicial PODE ser:

* Hospedagem;
* localização escolhida;
* Atividade anterior externa ao recorte;
* origem manual.

A origem utilizada DEVE ser identificável.

---

## 95. RB-BR-090 — Estimativa depende de transporte

Toda Estimativa de Deslocamento DEVE estar associada a um Meio de Transporte.

---

## 96. RB-BR-091 — Mudança de transporte invalida estimativa

Alterar o Meio de Transporte DEVE invalidar estimativas dependentes.

---

## 97. RB-BR-092 — Mudança de sequência invalida estimativa

Reordenar Atividades DEVE invalidar Deslocamentos afetados.

---

## 98. RB-BR-093 — Validade temporal

Toda Estimativa PODE possuir período de validade.

Quando vencida, DEVE ser marcada como desatualizada.

---

## 99. RB-BR-094 — Falha de rota não impede planejamento

Se a rota não puder ser calculada:

* a Atividade PODE permanecer;
* o Roteiro PODE ser salvo;
* um Risco ou estado indisponível PODE ser apresentado;
* alternativas textuais DEVEM permanecer.

---

## 100. RB-BR-095 — Precisão proporcional à fonte

O sistema NÃO DEVE exibir precisão maior do que a suportada pela fonte.

Exemplo inadequado:

```text
7 minutos e 14 segundos
```

para uma estimativa aproximada de tráfego.

---

# Parte XIII — Recomendações

## 101. RB-BR-096 — Contexto obrigatório

Toda Recomendação personalizada DEVE possuir Contexto de Decisão identificável.

---

## 102. RB-BR-097 — Justificativa obrigatória

Toda Recomendação apresentada como personalizada DEVE possuir pelo menos uma Justificativa compreensível.

---

## 103. RB-BR-098 — Restrição obrigatória tem precedência

Uma Recomendação NÃO DEVE contradizer Restrição obrigatória.

Se os dados forem insuficientes, a limitação DEVE ser informada.

---

## 104. RB-BR-099 — Recomendação não é garantia

Recomendações NÃO DEVEM utilizar linguagem de garantia quando dependerem de:

* dados externos;
* estimativas;
* disponibilidade;
* preferências inferidas;
* condições futuras.

---

## 105. RB-BR-100 — Validade contextual

Uma Recomendação DEVE ser invalidada ou reavaliada quando mudar informação material, como:

* Destino;
* Hospedagem;
* Período;
* Viajantes;
* Preferências;
* Restrição;
* Roteiro;
* disponibilidade do Lugar.

---

## 106. RB-BR-101 — Score interno

Score de Recomendação, quando existir:

* NÃO DEVE substituir Justificativa;
* NÃO DEVE ser confundido com avaliação;
* NÃO DEVE ser apresentado como qualidade absoluta.

---

## 107. RB-BR-102 — Rejeição de Recomendação

O Usuário PODE rejeitar Recomendação sem informar motivo.

A rejeição PODE ser utilizada como sinal de personalização, conforme regras de privacidade.

---

## 108. RB-BR-103 — Diversidade de recomendação

Quando aplicável, a política de Recomendação PODE considerar diversidade para evitar resultados excessivamente homogêneos.

A diversidade NÃO DEVE violar Restrições obrigatórias.

---

## 109. RB-BR-104 — Dados insuficientes

Quando não houver dados suficientes para personalização, o sistema DEVE:

* informar limitação;
* apresentar opções gerais;
* solicitar mais contexto opcionalmente;
* evitar alegar alta personalização.

---

# Parte XIV — Propostas de Roteiro

## 110. RB-BR-105 — Separação entre Proposta e Roteiro

Uma Proposta DEVE permanecer separada do Roteiro atual até aceitação.

---

## 111. RB-BR-106 — Versão base obrigatória

Toda Proposta DEVE referenciar a versão do Roteiro e o contexto utilizados em sua geração.

---

## 112. RB-BR-107 — Geração preserva Roteiro

Falha, cancelamento ou nova tentativa de geração NÃO DEVE alterar o Roteiro atual.

---

## 113. RB-BR-108 — Períodos protegidos respeitados

Uma Proposta NÃO PODE preencher Período Livre protegido.

---

## 114. RB-BR-109 — Atividades fixas preservadas

Uma Proposta NÃO PODE mover ou remover Atividade fixa sem ação explícita posterior do Usuário.

---

## 115. RB-BR-110 — Conflitos conhecidos apresentados

A Proposta DEVE incluir Conflitos conhecidos ou limitações relevantes antes da aceitação.

---

## 116. RB-BR-111 — Proposta expirada

Uma Proposta DEVE ser considerada expirada quando:

* versão base do Roteiro mudar de forma incompatível;
* Destino mudar;
* Período mudar;
* Hospedagem mudar materialmente;
* Restrições obrigatórias mudarem;
* dados críticos deixarem de ser válidos.

---

## 117. RB-BR-112 — Aceitação integral

Aceitar integralmente uma Proposta DEVE:

* validar a versão base;
* validar autorização;
* aplicar itens elegíveis;
* gerar nova versão do Roteiro;
* recalcular dados derivados;
* reavaliar Conflitos;
* registrar origem.

---

## 118. RB-BR-113 — Aceitação parcial

Aceitar parcialmente DEVE aplicar somente:

* Dias selecionados;
* Atividades selecionadas;
* blocos selecionados, quando suportados.

Itens não selecionados NÃO DEVEM alterar o Roteiro.

---

## 119. RB-BR-114 — Aceitação idempotente

A mesma Proposta NÃO DEVE ser aplicada duas vezes.

---

## 120. RB-BR-115 — Proposta substituída

Uma nova Proposta concluída PODE marcar a anterior como `superseded`.

A anterior NÃO DEVE ser apagada antes de a nova geração concluir.

---

## 121. RB-BR-116 — Rejeição preserva estado

Rejeitar uma Proposta NÃO DEVE alterar o Roteiro atual.

---

# Parte XV — Conflitos

## 122. RB-BR-117 — Conflito possui objeto afetado

Todo Conflito DEVE referenciar:

* objeto;
* regra;
* evidência;
* severidade;
* estado.

---

## 123. RB-BR-118 — Severidades oficiais

As severidades de planejamento são:

* `error`;
* `risk`;
* `suggestion`.

---

## 124. RB-BR-119 — Erro bloqueante

Um Erro de planejamento PODE bloquear uma operação específica quando a condição resultante for inválida.

Exemplos:

* data fora da Viagem;
* Restrição obrigatória violada;
* Dia pertencente a outra Viagem.

---

## 125. RB-BR-120 — Risco não bloqueante

Um Risco normalmente NÃO bloqueia salvamento.

Deve:

* ser comunicado;
* possuir ação de revisão;
* poder ser ignorado quando permitido.

---

## 126. RB-BR-121 — Sugestão opcional

Uma Sugestão de melhoria NÃO DEVE bloquear operação.

---

## 127. RB-BR-122 — Erro não pode ser ignorado

Conflitos classificados como Erro bloqueante NÃO PODEM receber estado `ignored`.

---

## 128. RB-BR-123 — Risco ignorado permanece rastreável

Ignorar um Risco DEVE registrar:

* responsável;
* data;
* versão do contexto;
* risco aceito.

---

## 129. RB-BR-124 — Resolução exige mudança da condição

Um Conflito somente DEVE ser marcado como resolvido quando a condição que o originou deixar de existir.

---

## 130. RB-BR-125 — Invalidação não é resolução

Conflito invalidado por mudança de contexto DEVE ser diferenciado de Conflito resolvido por correção.

---

## 131. RB-BR-126 — Reavaliação após alterações

As seguintes operações DEVEM reavaliar Conflitos relacionados:

* editar horário;
* editar duração;
* mover Atividade;
* alterar Dia;
* alterar transporte;
* alterar Hospedagem;
* alterar Restrição;
* aceitar Proposta.

---

# Parte XVI — Dados, confiança e atualização

## 132. RB-BR-127 — Informação desconhecida não recebe valor padrão enganoso

Valores desconhecidos NÃO DEVEM ser convertidos automaticamente em:

* zero;
* falso;
* gratuito;
* fechado;
* aberto;
* sem acessibilidade.

---

## 133. RB-BR-128 — Confiança não é certeza

`ConfidenceLevel` representa qualidade da evidência.

NÃO DEVE ser apresentado como probabilidade exata sem fundamento estatístico.

---

## 134. RB-BR-129 — Atualidade contextual

A validade de um dado PODE depender de:

* tempo;
* Fonte;
* tipo de informação;
* mudança de contexto;
* política do provedor.

---

## 135. RB-BR-130 — Divergência de fontes

Quando fontes relevantes divergirem, o sistema DEVE:

* preservar ambas as Proveniências;
* aplicar política de precedência documentada;
* identificar incerteza quando necessário;
* evitar escolha silenciosa sem regra.

---

## 136. RB-BR-131 — Dados gerados por IA

Conteúdo gerado por IA NÃO DEVE tornar-se automaticamente fato canônico.

Pode tornar-se:

* sugestão;
* rascunho;
* inferência;
* Proposta;
* conteúdo pendente de validação.

---

## 137. RB-BR-132 — Dados fornecidos pelo Usuário

Dados fornecidos pelo Usuário DEVEM preservar sua origem.

Podem possuir precedência contextual sobre dado externo, conforme política.

---

## 138. RB-BR-133 — Atualização não apaga histórico crítico

Atualizar dados externos NÃO DEVE apagar sem rastreabilidade:

* decisões;
* Propostas aceitas;
* Atividades;
* Conflitos históricos;
* fontes anteriores relevantes.

---

# Parte XVII — Regras de operação offline e falhas

## 139. RB-BR-134 — Falha parcial

Falha de uma capacidade NÃO DEVE bloquear capacidades independentes.

Exemplos:

* Mapa falha, lista continua;
* IA falha, edição manual continua;
* rota falha, Atividade continua;
* imagens falham, Detalhes textuais continuam.

---

## 140. RB-BR-135 — Nova tentativa preserva contexto

Tentar novamente DEVE preservar:

* objeto;
* filtros;
* pesquisa;
* Dia;
* alterações;
* versão base.

---

## 141. RB-BR-136 — Operação duplicada

Durante processamento, ações mutáveis DEVEM ser protegidas contra repetição acidental.

---

## 142. RB-BR-137 — Resultado incerto

Quando o sistema não souber se uma operação foi concluída, NÃO DEVE assumir sucesso ou falha definitiva.

Deve:

* consultar estado;
* reconciliar;
* informar incerteza;
* evitar repetir ação destrutiva.

---

## 143. RB-BR-138 — Salvamento local pendente

Quando suportado, alterações locais podem permanecer pendentes.

Elas DEVEM ser diferenciadas do estado persistido.

---

# Parte XVIII — Privacidade e consentimento

## 144. RB-BR-139 — Localização atual opcional

A Localização atual:

* depende de permissão;
* NÃO é obrigatória para planejamento;
* DEVE possuir finalidade clara;
* DEVE ser descartada quando não necessária, conforme política.

---

## 145. RB-BR-140 — Consentimento rastreável

Consentimentos relevantes DEVEM possuir:

* tipo;
* versão;
* data;
* responsável;
* estado.

---

## 146. RB-BR-141 — Dados sensíveis minimizados

O sistema NÃO DEVE coletar dado sensível quando uma representação funcional menos invasiva atender à necessidade.

---

## 147. RB-BR-142 — Analytics sem conteúdo sensível desnecessário

Eventos analíticos NÃO DEVEM incluir:

* observações livres;
* endereço preciso;
* Restrição detalhada;
* localização precisa;
* dados pessoais não necessários.

---

# Parte XIX — Priorização de regras

## 148. Ordem de precedência

Em caso de conflito entre critérios, a ordem conceitual é:

1. segurança e legalidade;
2. autorização;
3. Restrição obrigatória;
4. integridade do domínio;
5. decisão explícita do Usuário;
6. preservação de dados;
7. consistência temporal;
8. Preferências;
9. políticas de Recomendação;
10. conveniência de interface.

---

## 149. Regra mais restritiva

Quando duas regras obrigatórias se aplicarem e não puderem ser conciliadas, a operação DEVE ser bloqueada até resolução explícita.

---

## 150. Política não pode violar invariante

Uma política de produto ou algoritmo NÃO PODE sobrescrever uma invariante de domínio.

---

# Parte XX — Catálogo de validações

## 151. Validação da Viagem

| Campo ou operação             | Regra                             | Severidade           |
| ----------------------------- | --------------------------------- | -------------------- |
| Destino ausente               | Impede tornar a Viagem planejável | Erro                 |
| Data final anterior           | Impede criação ou alteração       | Erro                 |
| Sem Viajante                  | Impede tornar a Viagem planejável | Erro                 |
| Sem Hospedagem                | Permitido                         | Informação           |
| Hospedagem provisória         | Permitido com indicação           | Informação           |
| Período reduzido com conteúdo | Exige revisão                     | Risco ou confirmação |

---

## 152. Validação da Atividade

| Campo ou operação         | Regra                      | Severidade    |
| ------------------------- | -------------------------- | ------------- |
| Título vazio              | Impede salvamento          | Erro          |
| Dia inválido              | Impede salvamento          | Erro          |
| Duração zero ou negativa  | Impede salvamento          | Erro          |
| Sem horário               | Permitido                  | Informação    |
| Sem Lugar                 | Permitido                  | Informação    |
| Sobreposição              | Depende do contexto        | Risco ou Erro |
| Deslocamento insuficiente | Normalmente não bloqueante | Risco         |

---

## 153. Validação da Proposta

| Condição                      | Regra                         | Severidade        |
| ----------------------------- | ----------------------------- | ----------------- |
| Versão base alterada          | Proposta expira               | Erro de aplicação |
| Restrição obrigatória violada | Não pode ser aplicada         | Erro              |
| Período protegido preenchido  | Não pode ser aplicado         | Erro              |
| Dados estimados               | Pode continuar com indicação  | Risco             |
| Horário não confirmado        | Pode continuar                | Risco             |
| Atividade fixa movida         | Bloqueia aplicação automática | Erro              |

---

# Parte XXI — Cenários normativos

## 154. Salvar Lugar repetido

```text
Dado que o Lugar já está salvo na Viagem
Quando o Usuário solicita salvar novamente
Então nenhum novo Lugar Salvo é criado
E o estado permanece Salvo
```

---

## 155. Remover Lugar planejado dos Salvos

```text
Dado que o Lugar está salvo e planejado
Quando o Usuário remove o Lugar dos Salvos
Então a associação Lugar Salvo é removida
E a Atividade permanece no Roteiro
E o Lugar continua derivado como Planejado
```

---

## 156. Alterar Hospedagem

```text
Dado que a Viagem possui Distâncias calculadas
Quando a Hospedagem é alterada
Então as Distâncias dependentes são marcadas como desatualizadas
E o recálculo é solicitado
E o Roteiro não é removido
```

---

## 157. Aceitar Proposta expirada

```text
Dado que a versão base do Roteiro mudou
E existe uma Proposta baseada na versão anterior
Quando o Usuário tenta aceitar a Proposta
Então a aplicação é bloqueada
E a Proposta é marcada como expirada
E uma nova revisão é solicitada
```

---

## 158. Atividade em Período Livre protegido

```text
Dado que o Dia possui Período Livre protegido
Quando uma Proposta tenta inserir Atividade nesse intervalo
Então a Atividade não é aplicada
E um Erro de planejamento é apresentado
```

---

## 159. Falha de Mapa

```text
Dado que o serviço de Mapa está indisponível
Quando o Usuário acessa Explorar
Então a lista de Lugares continua disponível
E a falha é comunicada
E uma nova tentativa é oferecida
```

---

# Parte XXII — Anti-patterns de regra

## 160. Regra apenas na interface

Não considerar uma regra implementada apenas porque:

* botão está oculto;
* campo está desabilitado;
* fluxo visual evita a ação.

---

## 161. Regra duplicada e divergente

A mesma regra NÃO DEVE possuir versões contraditórias em:

* frontend;
* backend;
* prompts;
* testes;
* documentação.

---

## 162. Booleanos ambíguos

Evitar regras baseadas em campos como:

```text
active
valid
ready
processed
```

sem definição contextual.

---

## 163. Falha externa alterando domínio

Não remover Atividade porque provedor de rota falhou.

Não excluir Lugar porque imagem não carregou.

Não apagar Proposta porque nova geração falhou.

---

## 164. IA ignorando invariantes

Nenhum prompt, modelo ou agente PODE:

* aplicar Proposta;
* ignorar Restrição;
* mover Atividade fixa;
* preencher Período protegido;

fora das mesmas regras do restante do sistema.

---

## 165. Regra implícita em score

Um score NÃO DEVE esconder regras obrigatórias.

Exemplo incorreto:

```text
Lugar incompatível ainda aparece porque o score ficou baixo
```

Se viola Restrição obrigatória, deve ser excluído ou bloqueado conforme regra.

---

# Parte XXIII — Rastreabilidade

## 166. Regras e agregados

| Área                     | Regras principais     |
| ------------------------ | --------------------- |
| Conta e autorização      | RB-BR-008 a RB-BR-012 |
| Viagem                   | RB-BR-013 a RB-BR-022 |
| Período                  | RB-BR-023 a RB-BR-027 |
| Destino e Hospedagem     | RB-BR-028 a RB-BR-035 |
| Viajantes e Preferências | RB-BR-036 a RB-BR-045 |
| Lugar                    | RB-BR-046 a RB-BR-054 |
| Salvos                   | RB-BR-055 a RB-BR-060 |
| Roteiro                  | RB-BR-061 a RB-BR-069 |
| Atividade                | RB-BR-070 a RB-BR-082 |
| Período Livre            | RB-BR-083 a RB-BR-087 |
| Deslocamento             | RB-BR-088 a RB-BR-095 |
| Recomendação             | RB-BR-096 a RB-BR-104 |
| Proposta                 | RB-BR-105 a RB-BR-116 |
| Conflitos                | RB-BR-117 a RB-BR-126 |
| Dados                    | RB-BR-127 a RB-BR-133 |

---

## 167. Regras e superfícies

| Superfície        | Regras relevantes                 |
| ----------------- | --------------------------------- |
| Criar Viagem      | RB-BR-013 a RB-BR-018             |
| Configurações     | RB-BR-023 a RB-BR-045             |
| Explorar          | RB-BR-046 a RB-BR-060             |
| Detalhes do Lugar | RB-BR-049 a RB-BR-054             |
| Roteiro           | RB-BR-061 a RB-BR-095             |
| Proposta          | RB-BR-105 a RB-BR-116             |
| Revisão           | RB-BR-117 a RB-BR-126             |
| Mapa              | RB-BR-088 a RB-BR-095 e RB-BR-134 |
| Salvos            | RB-BR-055 a RB-BR-060             |

---

# Parte XXIV — Critérios de aceite

## 168. Integridade

* invariantes possuem identificadores;
* operações críticas possuem pré-condições;
* pós-condições são verificáveis;
* regras não dependem apenas da interface;
* políticas não violam invariantes.

---

## 169. Viagem

* requisitos mínimos estão definidos;
* alteração de Período está coberta;
* alteração de Destino está coberta;
* alteração de Hospedagem está coberta;
* cancelamento, arquivamento e exclusão estão separados.

---

## 170. Planejamento

* Roteiro parcial é válido;
* Atividade sem horário é válida;
* Período Livre é válido;
* reordenação produz nova versão;
* concorrência não sobrescreve silenciosamente.

---

## 171. IA e Recomendação

* Recomendações possuem contexto;
* justificativas estão previstas;
* Restrições obrigatórias têm precedência;
* Propostas permanecem separadas;
* aplicação exige decisão explícita.

---

## 172. Dados

* Proveniência é obrigatória;
* desconhecido não vira zero;
* IA não gera fato canônico automaticamente;
* divergência de fontes é tratada;
* atualidade é representada.

---

## 173. Conflitos

* severidades estão definidas;
* Erro, Risco e Sugestão são distintos;
* Erro bloqueante não pode ser ignorado;
* resolução e invalidação são diferentes;
* alterações reavaliam Conflitos.

---

# Parte XXV — Governança

## 174. Inclusão de nova regra

Uma nova regra DEVE possuir:

* identificador;
* nome;
* contexto;
* motivação;
* tipo;
* condição;
* resultado;
* severidade;
* exceções;
* testes;
* documentos afetados.

---

## 175. Alteração de regra

Alterações DEVEM revisar:

* Modelo de Domínio;
* Linguagem Ubíqua;
* PRD;
* UX;
* Arquitetura;
* Dados;
* APIs;
* testes;
* analytics;
* prompts;
* agentes.

---

## 176. Regra temporária

Regras temporárias DEVEM possuir:

* motivo;
* prazo;
* owner;
* condição de remoção;
* impacto conhecido.

---

## 177. Conflito entre documentos

Quando houver conflito:

1. a RouteBook Bible possui precedência constitucional;
2. a decisão de domínio aprovada possui precedência sobre interpretação local;
3. a divergência DEVE ser corrigida nos documentos dependentes;
4. agentes NÃO DEVEM escolher silenciosamente uma versão.

---

## 178. Uso por agentes de IA

Agentes DEVEM:

* consultar este documento antes de propor comportamento;
* citar regras aplicáveis;
* não inventar exceções;
* respeitar bloqueios;
* preservar controle do Usuário;
* distinguir política de invariante;
* gerar testes para regras alteradas;
* identificar conflitos documentais.

---

## 179. Checklist de revisão

Antes de aprovar este documento, verificar:

* princípios transversais estão definidos;
* autorização está definida;
* criação da Viagem está definida;
* Período está definido;
* Destino está definido;
* Hospedagem está definida;
* Viajantes estão definidos;
* Preferências estão definidas;
* Lugares estão definidos;
* Salvos estão definidos;
* Roteiro está definido;
* Atividades estão definidas;
* Períodos Livres estão definidos;
* Deslocamentos estão definidos;
* Recomendações estão definidas;
* Propostas estão definidas;
* Conflitos estão definidos;
* proveniência está definida;
* falhas estão definidas;
* privacidade está definida;
* prioridades estão definidas;
* validações estão catalogadas;
* cenários normativos estão presentes;
* rastreabilidade está presente;
* governança está definida.

---

## 180. Declaração final

As Regras de Negócio e Invariantes estabelecem os limites comportamentais oficiais do RouteBook.

Elas definem:

* o que é válido;
* o que é obrigatório;
* o que é permitido;
* o que deve ser bloqueado;
* o que exige confirmação;
* o que deve ser recalculado;
* o que deve ser preservado;
* o que pode ser estimado;
* o que não pode ser aplicado automaticamente.

Essas regras preservam os princípios fundamentais do produto:

* o Usuário mantém controle;
* Salvar não significa Planejar;
* Lugar não significa Atividade;
* Proposta não significa Roteiro;
* Recomendação não significa decisão;
* Estimativa não significa garantia;
* falhas externas não apagam decisões válidas;
* IA respeita as mesmas invariantes do restante do sistema.

Toda implementação, automação, integração ou agente que opere no RouteBook deverá cumprir estas regras.
