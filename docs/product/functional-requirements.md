---

id: RB-PRD-006

title: Requisitos Funcionais
description: Define os comportamentos funcionais verificáveis do RouteBook, derivados da visão, do MVP, das personas, das jornadas e dos casos de uso.

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
- functional-requirements
- requirements
- mvp
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
- RB-PRD-005

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

next_documents:

- RB-PRD-007
- RB-PRD-008
- RB-UX-001
- RB-UX-002
- RB-DOM-001

ai_context:
priority: high
index: true
---

# RouteBook — Requisitos Funcionais

## 1. Propósito deste documento

Este documento define os Requisitos Funcionais do RouteBook.

Seu objetivo é transformar as definições de produto em comportamentos específicos, verificáveis e rastreáveis.

Os requisitos descritos aqui deverão orientar:

* arquitetura da informação;
* fluxos de usuário;
* definição de telas;
* modelagem do domínio;
* arquitetura técnica;
* implementação;
* critérios de aceitação;
* testes funcionais;
* testes de integração;
* testes ponta a ponta;
* priorização do MVP.

Este documento define o que o produto deverá fazer.

Ele não define:

* tecnologia;
* framework;
* estrutura de banco de dados;
* provedor definitivo;
* aparência visual final;
* implementação técnica detalhada.

---

## 2. Relação com documentos anteriores

Os requisitos foram derivados de:

```text
Visão do Produto
→ define a direção

Princípios do Produto
→ definem critérios de decisão

Escopo do Produto
→ define os limites

Glossário
→ define a linguagem

Visão Geral do Produto
→ consolida as capacidades

Definição do MVP
→ define o recorte inicial

Personas
→ representam necessidades

Jornadas do Usuário
→ descrevem experiências ponta a ponta

Casos de Uso
→ descrevem objetivos e interações

Requisitos Funcionais
→ definem comportamentos verificáveis
```

---

## 3. Convenção de identificação

Os requisitos utilizarão o padrão:

```text
RB-FR-XXX
```

Exemplo:

```text
RB-FR-001 — Criar Viagem
```

A numeração identifica o requisito e não representa necessariamente a ordem de implementação.

---

## 4. Estrutura dos requisitos

Cada requisito poderá conter:

* identificador;
* título;
* declaração;
* prioridade;
* classificação no MVP;
* origem;
* dependências;
* critérios gerais de verificação;
* observações.

---

## 5. Termos normativos

Os seguintes termos possuem significado específico:

### Deve

Comportamento obrigatório.

### Não deve

Comportamento proibido.

### Pode

Comportamento permitido ou opcional.

### Deverá, quando disponível

Comportamento obrigatório apenas quando os dados ou serviços necessários estiverem disponíveis.

### Desejável

Comportamento valorizado, mas não obrigatório para conclusão do MVP.

---

## 6. Classificação de prioridade

### Crítica

Necessária para a proposta central ou conclusão do MVP.

### Alta

Importante para uma experiência adequada, podendo admitir simplificação inicial.

### Média

Relevante, mas pode ser adiada sem inviabilizar o núcleo.

### Baixa

Melhoria futura ou capacidade complementar.

---

## 7. Classificação no MVP

### Obrigatório

Deve existir no MVP.

### Simplificado

Deve existir, mas pode utilizar comportamento reduzido.

### Desejável

Pode ser incluído se não comprometer o escopo principal.

### Pós-MVP

Não é necessário para a primeira validação.

---

# Parte I — Gestão da Viagem

## 8. RB-FR-001 — Criar Viagem

### Declaração

O sistema deve permitir que o usuário crie uma nova Viagem.

### Dados mínimos

* nome da Viagem;
* Destino;
* data de início;
* data de término;
* Hospedagem ou referência geográfica;
* quantidade de Viajantes.

### Prioridade

Crítica.

### MVP

Obrigatório.

### Origem

* RB-UC-001;
* Jornada Criar uma Viagem.

---

## 9. RB-FR-002 — Validar Período da Viagem

### Declaração

O sistema deve validar que:

* a data de início é válida;
* a data de término é válida;
* a data de término não é anterior à data de início.

### Comportamento de erro

O sistema deve:

* identificar o campo inválido;
* explicar o problema;
* impedir a criação enquanto o intervalo permanecer inválido.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 10. RB-FR-003 — Gerar Dias da Viagem

### Declaração

Após a criação da Viagem, o sistema deve gerar automaticamente os Dias da Viagem correspondentes ao intervalo informado.

### Exemplo

Para uma Viagem de 22 a 29 de julho, o sistema deve gerar oito Dias da Viagem, incluindo as duas datas.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 11. RB-FR-004 — Definir Destino principal

### Declaração

O sistema deve permitir que o usuário pesquise e selecione um Destino principal.

### O Destino deve possuir

* nome;
* tipo de localidade;
* localização geográfica;
* identificador interno ou externo.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 12. RB-FR-005 — Tratar Destinos ambíguos

### Declaração

Quando uma pesquisa retornar Destinos semelhantes, o sistema deve apresentar informações suficientes para que o usuário selecione a opção correta.

### Informações possíveis

* cidade;
* estado;
* país;
* região;
* descrição geográfica.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 13. RB-FR-006 — Cadastrar Hospedagem

### Declaração

O sistema deve permitir que o usuário pesquise e selecione uma Hospedagem ou localização de referência.

### A Hospedagem deve possuir

* nome ou identificação;
* endereço;
* latitude;
* longitude.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 14. RB-FR-007 — Utilizar Hospedagem provisória

### Declaração

O sistema pode permitir que o usuário utilize uma Região ou ponto de referência provisório quando a Hospedagem definitiva ainda não estiver disponível.

### Comportamento obrigatório

O sistema deve informar que:

* a localização é provisória;
* distâncias e recomendações podem ser menos precisas;
* a Hospedagem poderá ser atualizada posteriormente.

### Prioridade

Média.

### MVP

Desejável.

---

## 15. RB-FR-008 — Informar quantidade de Viajantes

### Declaração

O sistema deve permitir que o usuário informe a quantidade total de Viajantes.

### Regra mínima

A quantidade deve ser igual ou superior a um.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 16. RB-FR-009 — Consultar Viagens existentes

### Declaração

O sistema deve permitir que o usuário visualize suas Viagens existentes.

### Cada item deve apresentar

* nome;
* Destino;
* Período;
* estado geral;
* próxima data relevante.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 17. RB-FR-010 — Abrir Viagem existente

### Declaração

O sistema deve permitir que o usuário selecione uma Viagem e recupere seu estado persistido.

### Dados recuperados

* informações gerais;
* Hospedagem;
* Preferências;
* Restrições;
* Lugares salvos;
* Roteiro;
* Atividades;
* Períodos livres.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 18. RB-FR-011 — Editar informações da Viagem

### Declaração

O sistema deve permitir que o usuário altere:

* nome;
* Destino;
* Período;
* Hospedagem;
* quantidade de Viajantes;
* Preferências;
* orçamento;
* transporte;
* ritmo.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 19. RB-FR-012 — Informar impacto de alteração estrutural

### Declaração

Quando uma alteração puder afetar outras partes da Viagem, o sistema deve informar o impacto antes da confirmação.

### Exemplos

* alteração de datas;
* alteração de Destino;
* alteração de Hospedagem;
* redução do Período da Viagem.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 20. RB-FR-013 — Recalcular dependências após alteração

### Declaração

Após alterações relevantes, o sistema deve recalcular as dependências aplicáveis.

### Dependências possíveis

* Dias da Viagem;
* distâncias;
* Tempos de deslocamento;
* relevância de Lugares;
* conflitos;
* mapa;
* proposta de Roteiro.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte II — Contexto e personalização

## 21. RB-FR-014 — Configurar Interesses

### Declaração

O sistema deve permitir que o usuário selecione um ou mais Interesses.

### Categorias iniciais

* praias;
* restaurantes;
* bares;
* vida noturna;
* natureza;
* cultura;
* passeios;
* descanso;
* opções econômicas.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 22. RB-FR-015 — Alterar Interesses

### Declaração

O sistema deve permitir que o usuário adicione ou remova Interesses após a criação da Viagem.

### Resultado esperado

As futuras Recomendações devem considerar o novo contexto.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 23. RB-FR-016 — Configurar orçamento

### Declaração

O sistema deve permitir que o usuário informe uma referência de orçamento.

### Formatos possíveis no MVP

* econômico;
* moderado;
* elevado;
* sem preferência.

### Prioridade

Alta.

### MVP

Obrigatório em forma simplificada.

---

## 24. RB-FR-017 — Configurar Meio de transporte

### Declaração

O sistema deve permitir que o usuário selecione o Meio de transporte predominante.

### Opções iniciais

* carro;
* transporte por aplicativo;
* caminhada;
* transporte público;
* combinação de meios.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 25. RB-FR-018 — Configurar Ritmo da Viagem

### Declaração

O sistema deve permitir que o usuário selecione o Ritmo da Viagem.

### Opções

* tranquilo;
* equilibrado;
* intenso.

### Prioridade

Alta.

### MVP

Obrigatório em forma simplificada.

---

## 26. RB-FR-019 — Registrar Restrições

### Declaração

O sistema deve permitir o registro de Restrições relevantes à Viagem.

### Exemplos

* alimentares;
* mobilidade;
* idade;
* orçamento máximo;
* atividades inadequadas;
* horários indisponíveis.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 27. RB-FR-020 — Priorizar Restrições sobre Preferências

### Declaração

Quando uma Restrição entrar em conflito com uma Preferência, o sistema deve priorizar a Restrição.

### Exemplo

Uma preferência por gastronomia não deve gerar recomendação incompatível com uma Restrição alimentar registrada.

### Prioridade

Crítica.

### MVP

Obrigatório quando a Restrição for suportada.

---

## 28. RB-FR-021 — Permitir personalização parcial

### Declaração

O sistema não deve exigir o preenchimento de todas as Preferências para permitir a utilização do produto.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 29. RB-FR-022 — Tratar ausência de Preferência como neutra

### Declaração

A ausência de uma Preferência deve ser interpretada como informação não fornecida, e não como rejeição.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 30. RB-FR-023 — Atualizar Recomendações após personalização

### Declaração

Quando o usuário alterar informações relevantes, o sistema deve atualizar ou recalcular as Recomendações futuras.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte III — Descoberta de Lugares

## 31. RB-FR-024 — Explorar Lugares

### Declaração

O sistema deve permitir que o usuário explore Lugares relacionados ao Destino.

### Categorias mínimas

* Praia;
* Restaurante;
* Bar;
* Vida noturna;
* Atração;
* Passeio.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 32. RB-FR-025 — Apresentar resultados em lista

### Declaração

O sistema deve apresentar os Lugares em uma Visualização em lista.

### Cada resultado deve conter, quando disponível

* fotografia;
* nome;
* categoria;
* avaliação;
* distância;
* Faixa de preço;
* estado salvo;
* estado planejado.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 33. RB-FR-026 — Apresentar resultados no mapa

### Declaração

O sistema deve apresentar os Lugares em uma Visualização em mapa.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 34. RB-FR-027 — Sincronizar lista e mapa

### Declaração

Lista e mapa devem representar o mesmo conjunto de resultados ativos.

### Comportamentos esperados

* filtros devem afetar ambas as visualizações;
* seleção em lista deve destacar o Marcador;
* seleção no mapa deve apresentar o Lugar correspondente.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 35. RB-FR-028 — Pesquisar Lugar

### Declaração

O sistema deve permitir que o usuário pesquise um Lugar por texto.

### Campos considerados

* nome;
* categoria;
* Região;
* endereço.

### Prioridade

Alta.

### MVP

Obrigatório em versão básica.

---

## 36. RB-FR-029 — Utilizar Destino como contexto de pesquisa

### Declaração

A pesquisa deve utilizar o Destino da Viagem como contexto geográfico padrão.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 37. RB-FR-030 — Permitir resultado fora do Destino

### Declaração

Quando um resultado estiver fora do Destino principal, o sistema pode apresentá-lo, mas deve identificar a diferença geográfica.

### Prioridade

Média.

### MVP

Desejável.

---

## 38. RB-FR-031 — Filtrar por categoria

### Declaração

O sistema deve permitir que o usuário filtre os Lugares por categoria.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 39. RB-FR-032 — Filtrar por distância

### Declaração

O sistema deve permitir que o usuário filtre Lugares por distância em relação a uma referência geográfica.

### Referência padrão

Hospedagem.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 40. RB-FR-033 — Filtrar por Faixa de preço

### Declaração

O sistema deve permitir que o usuário filtre Lugares por Faixa de preço.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 41. RB-FR-034 — Identificar filtros ativos

### Declaração

O sistema deve indicar claramente quais filtros estão ativos.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 42. RB-FR-035 — Limpar filtros

### Declaração

O sistema deve permitir que o usuário remova filtros individualmente ou redefina todos.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 43. RB-FR-036 — Tratar ausência de resultados

### Declaração

Quando não existirem resultados, o sistema deve:

* informar a situação;
* sugerir alteração de filtros;
* permitir ampliar a área;
* permitir nova pesquisa.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 44. RB-FR-037 — Ordenar resultados por relevância

### Declaração

O sistema deve ordenar os resultados utilizando critérios contextualizados quando houver dados suficientes.

### Critérios possíveis

* distância;
* Interesses;
* orçamento;
* avaliação;
* adequação ao grupo;
* compatibilidade com o Roteiro.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 45. RB-FR-038 — Não utilizar popularidade como único critério

### Declaração

O sistema não deve ordenar ou recomendar Lugares exclusivamente com base em popularidade.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte IV — Detalhes do Lugar

## 46. RB-FR-039 — Consultar Detalhes do Lugar

### Declaração

O sistema deve permitir que o usuário abra os Detalhes de um Lugar.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 47. RB-FR-040 — Exibir informações principais do Lugar

### Declaração

Os Detalhes do Lugar devem apresentar, quando disponível:

* nome;
* categoria;
* descrição;
* endereço;
* Localização;
* fotografias;
* avaliação;
* Faixa de preço;
* horário de funcionamento;
* distância;
* Tempo de deslocamento;
* Duração estimada;
* Justificativa da recomendação.

### Prioridade

Crítica.

### MVP

Obrigatório conforme disponibilidade.

---

## 48. RB-FR-041 — Identificar dados indisponíveis

### Declaração

Quando uma informação não estiver disponível, o sistema deve indicar sua indisponibilidade e não deve inventar conteúdo.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 49. RB-FR-042 — Identificar Dados estimados

### Declaração

O sistema deve indicar quando uma informação for estimada.

### Exemplos

* Tempo de deslocamento;
* Faixa de preço;
* duração sugerida;
* custo médio.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 50. RB-FR-043 — Exibir origem dos dados relevantes

### Declaração

O sistema deve permitir identificar a fonte de dados externos quando isso for relevante para confiança ou atualização.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 51. RB-FR-044 — Exibir ações principais do Lugar

### Declaração

Nos Detalhes do Lugar, o sistema deve disponibilizar:

* salvar;
* remover dos salvos;
* adicionar ao Roteiro;
* visualizar no mapa;
* abrir rota.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte V — Mapa e localização

## 52. RB-FR-045 — Exibir Mapa da Viagem

### Declaração

O sistema deve disponibilizar um Mapa da Viagem interativo.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 53. RB-FR-046 — Exibir Hospedagem no mapa

### Declaração

O sistema deve representar a Hospedagem no mapa com identificação visual distinta.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 54. RB-FR-047 — Exibir Lugares no mapa

### Declaração

O sistema deve representar os Lugares por Marcadores.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 55. RB-FR-048 — Diferenciar categorias no mapa

### Declaração

O sistema deve permitir que o usuário diferencie Categorias de Lugar no mapa.

### Observação

A diferenciação não deve depender exclusivamente de cor.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 56. RB-FR-049 — Diferenciar estados no mapa

### Declaração

O sistema deve diferenciar, quando aplicável:

* Lugar comum;
* Lugar salvo;
* Lugar planejado;
* Hospedagem.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 57. RB-FR-050 — Selecionar Marcador

### Declaração

O sistema deve permitir que o usuário selecione um Marcador e visualize um resumo do Lugar.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 58. RB-FR-051 — Centralizar Lugar no mapa

### Declaração

Quando o usuário solicitar a visualização de um Lugar, o sistema deve centralizar ou destacar sua posição no mapa.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 59. RB-FR-052 — Agrupar Marcadores próximos

### Declaração

O sistema deve agrupar Marcadores próximos quando a quantidade de pontos prejudicar a compreensão do mapa.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 60. RB-FR-053 — Oferecer alternativa ao mapa

### Declaração

Informações essenciais apresentadas no mapa devem possuir alternativa acessível em lista ou texto.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 61. RB-FR-054 — Tratar falha no mapa

### Declaração

Quando o mapa estiver indisponível, o sistema deve:

* informar o problema;
* manter a Visualização em lista;
* preservar Salvos e Roteiro;
* permitir nova tentativa;
* permitir abertura em serviço externo quando possível.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 62. RB-FR-055 — Calcular distância da Hospedagem

### Declaração

O sistema deve calcular ou consultar a distância entre a Hospedagem e um Lugar.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 63. RB-FR-056 — Calcular Tempo de deslocamento

### Declaração

O sistema deve calcular ou consultar o Tempo de deslocamento entre dois pontos, considerando o Meio de transporte selecionado.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 64. RB-FR-057 — Identificar Meio de transporte da estimativa

### Declaração

O sistema deve informar qual Meio de transporte foi utilizado no cálculo do Tempo de deslocamento.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 65. RB-FR-058 — Tratar indisponibilidade de rota

### Declaração

Quando uma rota não puder ser calculada, o sistema deve:

* informar a indisponibilidade;
* evitar apresentar valor igual a zero;
* oferecer Distância geográfica quando disponível;
* permitir abrir serviço externo.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 66. RB-FR-059 — Abrir rota externa

### Declaração

O sistema deve permitir que o usuário abra uma rota em um serviço externo de mapas.

### Origem possível

* Hospedagem;
* Atividade anterior;
* Localização atual, quando disponível.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte VI — Lugares salvos

## 67. RB-FR-060 — Salvar Lugar

### Declaração

O sistema deve permitir que o usuário associe um Lugar à Viagem como Lugar salvo.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 68. RB-FR-061 — Impedir duplicação de Lugar salvo

### Declaração

O sistema não deve criar associações duplicadas do mesmo Lugar salvo na mesma Viagem.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 69. RB-FR-062 — Atualizar estado salvo

### Declaração

Após salvar um Lugar, o estado deve ser atualizado em:

* lista;
* mapa;
* Detalhes;
* área Salvos.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 70. RB-FR-063 — Remover Lugar dos salvos

### Declaração

O sistema deve permitir que o usuário remova um Lugar dos salvos.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 71. RB-FR-064 — Manter Atividade ao remover dos salvos

### Declaração

A remoção de um Lugar dos salvos não deve remover automaticamente uma Atividade existente no Roteiro.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 72. RB-FR-065 — Consultar Lugares salvos

### Declaração

O sistema deve disponibilizar uma área que apresente todos os Lugares salvos da Viagem.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 73. RB-FR-066 — Apresentar Estado vazio em Salvos

### Declaração

Quando não existirem Lugares salvos, o sistema deve:

* informar a situação;
* explicar a função da área;
* direcionar para Explorar.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte VII — Roteiro

## 74. RB-FR-067 — Criar estrutura do Roteiro

### Declaração

O sistema deve criar um Roteiro associado à Viagem.

### Estrutura mínima

* Dias da Viagem;
* Atividades;
* ordem;
* horários;
* durações;
* Períodos livres.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 75. RB-FR-068 — Adicionar Lugar ao Roteiro

### Declaração

O sistema deve permitir que o usuário transforme um Lugar em uma Atividade planejada.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 76. RB-FR-069 — Selecionar Dia da Viagem

### Declaração

Ao adicionar um Lugar ao Roteiro, o sistema deve permitir que o usuário selecione um Dia da Viagem válido.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 77. RB-FR-070 — Adicionar Atividade sem horário

### Declaração

O sistema deve permitir adicionar uma Atividade a um dia sem exigir Horário planejado.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 78. RB-FR-071 — Informar Horário planejado

### Declaração

O sistema deve permitir que o usuário informe ou altere o Horário planejado de uma Atividade.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 79. RB-FR-072 — Informar Duração estimada

### Declaração

O sistema deve permitir que o usuário informe ou altere a Duração estimada de uma Atividade.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 80. RB-FR-073 — Sugerir duração

### Declaração

O sistema pode sugerir uma duração para uma Atividade quando houver informação suficiente.

### Comportamento obrigatório

A duração sugerida deve ser:

* identificada como estimativa;
* editável;
* opcional.

### Prioridade

Média.

### MVP

Desejável.

---

## 81. RB-FR-074 — Reordenar Atividades

### Declaração

O sistema deve permitir que o usuário altere a ordem das Atividades dentro de um Dia da Viagem.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 82. RB-FR-075 — Oferecer alternativa ao arrastar e soltar

### Declaração

A reordenação não deve depender exclusivamente de arrastar e soltar.

### Alternativas

* mover para cima;
* mover para baixo;
* selecionar posição;
* alterar ordem por menu.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 83. RB-FR-076 — Mover Atividade entre dias

### Declaração

O sistema deve permitir mover uma Atividade entre Dias da Viagem.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 84. RB-FR-077 — Editar Atividade

### Declaração

O sistema deve permitir editar:

* dia;
* horário;
* duração;
* observações;
* ordem;
* título, quando manual;
* Localização, quando manual.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 85. RB-FR-078 — Remover Atividade

### Declaração

O sistema deve permitir que o usuário remova uma Atividade do Roteiro.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 86. RB-FR-079 — Preservar Lugar salvo ao remover Atividade

### Declaração

A remoção de uma Atividade não deve remover automaticamente o Lugar dos salvos.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 87. RB-FR-080 — Adicionar Período livre

### Declaração

O sistema deve permitir que o usuário represente um Período livre no Roteiro.

### Prioridade

Alta.

### MVP

Obrigatório em forma básica.

---

## 88. RB-FR-081 — Respeitar Período livre bloqueado

### Declaração

Uma geração ou reorganização automática não deve preencher um Período livre explicitamente bloqueado pelo usuário sem confirmação.

### Prioridade

Alta.

### MVP

Obrigatório quando houver geração.

---

## 89. RB-FR-082 — Consultar Roteiro por dia

### Declaração

O sistema deve apresentar o Roteiro organizado por Dia da Viagem.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 90. RB-FR-083 — Exibir informações do dia

### Declaração

Cada Dia da Viagem deve apresentar:

* data;
* Atividades;
* horários;
* durações;
* Períodos livres;
* Deslocamentos;
* alertas.

### Prioridade

Crítica.

### MVP

Obrigatório conforme disponibilidade.

---

## 91. RB-FR-084 — Visualizar dia no mapa

### Declaração

O sistema deve permitir que o usuário visualize no mapa as Atividades de um Dia da Viagem.

### Prioridade

Alta.

### MVP

Obrigatório em forma simplificada.

---

## 92. RB-FR-085 — Exibir sequência do dia no mapa

### Declaração

Quando possível, o mapa do dia deve representar a ordem das Atividades.

### Prioridade

Média.

### MVP

Desejável.

---

## 93. RB-FR-086 — Criar Atividade manual

### Declaração

O sistema pode permitir que o usuário crie uma Atividade não associada a um Lugar catalogado.

### Campos possíveis

* título;
* dia;
* horário;
* duração;
* Localização;
* observações.

### Prioridade

Média.

### MVP

Desejável.

---

# Parte VIII — Geração de Roteiro

## 94. RB-FR-087 — Gerar proposta de Roteiro

### Declaração

O sistema deve permitir que o usuário solicite uma proposta inicial de Roteiro.

### Prioridade

Alta.

### MVP

Obrigatório em versão simplificada.

---

## 95. RB-FR-088 — Utilizar Contexto da Viagem na geração

### Declaração

A geração deve considerar, quando disponível:

* Período;
* Hospedagem;
* Lugares selecionados;
* Preferências;
* Restrições;
* orçamento;
* transporte;
* ritmo;
* duração;
* distância;
* horário de funcionamento.

### Prioridade

Crítica.

### MVP

Obrigatório conforme suporte.

---

## 96. RB-FR-089 — Agrupar Lugares por proximidade

### Declaração

A proposta deve tentar agrupar Lugares próximos no mesmo dia.

### Prioridade

Alta.

### MVP

Obrigatório em forma básica.

---

## 97. RB-FR-090 — Considerar Ritmo da Viagem

### Declaração

A proposta deve ajustar a quantidade e a distribuição de Atividades conforme o Ritmo da Viagem.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 98. RB-FR-091 — Preservar Lugares obrigatórios

### Declaração

A geração deve priorizar Lugares marcados como obrigatórios, quando forem viáveis.

### Prioridade

Alta.

### MVP

Desejável.

---

## 99. RB-FR-092 — Apresentar proposta como sugestão

### Declaração

O sistema deve deixar claro que a proposta de Roteiro é editável e não representa decisão definitiva.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 100. RB-FR-093 — Permitir aceitar proposta

### Declaração

O sistema deve permitir que o usuário aceite uma proposta de Roteiro.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 101. RB-FR-094 — Permitir editar proposta

### Declaração

O sistema deve permitir que o usuário altere qualquer parte editável da proposta.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 102. RB-FR-095 — Permitir descartar proposta

### Declaração

O sistema deve permitir que o usuário descarte uma proposta sem perder o estado anterior do Roteiro.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 103. RB-FR-096 — Informar limitações da proposta

### Declaração

Quando dados estiverem ausentes ou incompletos, o sistema deve informar as limitações da proposta.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte IX — Recomendações

## 104. RB-FR-097 — Apresentar Recomendações contextualizadas

### Declaração

O sistema deve apresentar Recomendações baseadas no Contexto da Viagem quando houver dados suficientes.

### Prioridade

Alta.

### MVP

Obrigatório em forma básica.

---

## 105. RB-FR-098 — Considerar critérios de Recomendação

### Declaração

As Recomendações podem considerar:

* distância;
* categoria;
* Preferências;
* Restrições;
* orçamento;
* avaliação;
* adequação ao grupo;
* compatibilidade com o Roteiro;
* custo-benefício.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 106. RB-FR-099 — Apresentar Justificativa

### Declaração

O sistema deve apresentar uma Justificativa para Recomendações relevantes.

### Prioridade

Alta.

### MVP

Obrigatório em forma simples.

---

## 107. RB-FR-100 — Basear Justificativa em dados conhecidos

### Declaração

A Justificativa não deve afirmar informações que não estejam presentes nos dados ou não possam ser justificadas.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 108. RB-FR-101 — Permitir ignorar Recomendação

### Declaração

O sistema deve permitir que o usuário ignore uma Recomendação sem impedir o uso do produto.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 109. RB-FR-102 — Permitir salvar Recomendação

### Declaração

O sistema deve permitir que o usuário salve um Lugar recomendado.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 110. RB-FR-103 — Permitir adicionar Recomendação ao Roteiro

### Declaração

O sistema deve permitir que o usuário adicione diretamente uma Recomendação ao Roteiro.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 111. RB-FR-104 — Solicitar Alternativa

### Declaração

O sistema pode permitir que o usuário solicite uma Alternativa para um Lugar ou Atividade.

### Critérios possíveis

* menor preço;
* menor distância;
* categoria semelhante;
* horário compatível.

### Prioridade

Média.

### MVP

Desejável.

---

# Parte X — Revisão e conflitos

## 112. RB-FR-105 — Detectar sobreposição de horários

### Declaração

O sistema deve identificar Atividades com horários sobrepostos no mesmo Dia da Viagem.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 113. RB-FR-106 — Detectar deslocamento incompatível

### Declaração

O sistema deve identificar quando o intervalo entre duas Atividades for inferior ao Tempo de deslocamento estimado.

### Prioridade

Alta.

### MVP

Obrigatório em forma básica.

---

## 114. RB-FR-107 — Detectar Atividade fora do Período

### Declaração

O sistema não deve permitir que uma Atividade seja associada a uma data fora do Período da Viagem.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 115. RB-FR-108 — Detectar Dia sobrecarregado

### Declaração

O sistema deve identificar Dias potencialmente sobrecarregados.

### Critérios possíveis

* quantidade de Atividades;
* soma das durações;
* Deslocamentos;
* Ritmo da Viagem;
* ausência de pausas.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 116. RB-FR-109 — Classificar alertas

### Declaração

O sistema deve diferenciar:

* erro;
* risco;
* sugestão.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 117. RB-FR-110 — Explicar impacto do alerta

### Declaração

Cada alerta deve apresentar uma explicação compreensível sobre o impacto.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 118. RB-FR-111 — Permitir ignorar alertas não bloqueantes

### Declaração

O sistema deve permitir que o usuário ignore alertas classificados como risco ou sugestão.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 119. RB-FR-112 — Bloquear inconsistências obrigatórias

### Declaração

O sistema deve impedir ações que produzam estados inválidos, como:

* data fora da Viagem;
* data final anterior à inicial;
* quantidade de Viajantes inferior a um.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte XI — Uso durante a Viagem

## 120. RB-FR-113 — Identificar Dia atual

### Declaração

Quando a data atual estiver dentro do Período da Viagem, o sistema deve identificar o Dia atual.

### Prioridade

Alta.

### MVP

Desejável.

---

## 121. RB-FR-114 — Destacar Dia atual

### Declaração

Ao acessar o Roteiro durante a Viagem, o sistema deve destacar o Dia atual.

### Prioridade

Alta.

### MVP

Desejável.

---

## 122. RB-FR-115 — Apresentar próxima Atividade

### Declaração

Quando possível, o sistema deve apresentar a próxima Atividade planejada.

### Informações prioritárias

* nome;
* horário;
* Localização;
* distância;
* Tempo de deslocamento;
* ação para abrir rota.

### Prioridade

Alta.

### MVP

Desejável.

---

## 123. RB-FR-116 — Encontrar Lugar próximo

### Declaração

O sistema pode permitir que o usuário encontre Lugares próximos de uma referência.

### Referências possíveis

* Hospedagem;
* Atividade atual;
* próxima Atividade;
* ponto selecionado;
* Localização atual autorizada.

### Prioridade

Alta.

### MVP

Desejável.

---

## 124. RB-FR-117 — Tratar ausência de geolocalização atual

### Declaração

Quando a Localização atual não estiver disponível, o sistema deve permitir que o usuário selecione outra referência.

### Prioridade

Alta.

### MVP

Desejável.

---

# Parte XII — Persistência e continuidade

## 125. RB-FR-118 — Persistir Viagem

### Declaração

O sistema deve persistir os dados da Viagem após sua criação.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 126. RB-FR-119 — Persistir alterações

### Declaração

O sistema deve persistir alterações realizadas em:

* informações da Viagem;
* Preferências;
* Salvos;
* Roteiro;
* Atividades;
* ordem;
* horários;
* duração;
* Períodos livres.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 127. RB-FR-120 — Informar estado de persistência

### Declaração

O sistema deve informar quando uma alteração:

* foi salva;
* está sendo salva;
* falhou.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 128. RB-FR-121 — Evitar sucesso incorreto

### Declaração

O sistema não deve apresentar uma alteração como salva quando a persistência tiver falhado.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 129. RB-FR-122 — Preservar dados após falha externa

### Declaração

Falhas em mapas, rotas, Recomendações ou provedores externos não devem apagar dados internos da Viagem.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 130. RB-FR-123 — Recuperar estado anterior

### Declaração

Ao reabrir uma Viagem, o sistema deve restaurar o último estado persistido.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 131. RB-FR-124 — Tratar carregamento parcial

### Declaração

Quando parte dos dados não puder ser carregada, o sistema deve:

* apresentar os dados recuperados;
* identificar a falha parcial;
* permitir nova tentativa;
* não apagar o estado existente.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte XIII — Estados de interface

## 132. RB-FR-125 — Apresentar Estado de carregamento

### Declaração

O sistema deve apresentar um Estado de carregamento durante operações que não forem concluídas imediatamente.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 133. RB-FR-126 — Apresentar Estado de erro

### Declaração

O sistema deve apresentar um Estado de erro quando uma operação não puder ser concluída.

### A mensagem deve indicar

* o que ocorreu;
* o impacto;
* uma ação possível.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 134. RB-FR-127 — Apresentar Estados vazios

### Declaração

O sistema deve possuir Estados vazios para:

* nenhuma Viagem;
* nenhum Lugar salvo;
* Roteiro vazio;
* Dia sem Atividades;
* nenhum resultado.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 135. RB-FR-128 — Orientar próximo passo

### Declaração

Estados vazios devem sugerir uma próxima ação relevante.

### Exemplos

* criar Viagem;
* explorar Lugares;
* salvar Lugar;
* adicionar Atividade;
* remover filtros.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte XIV — Acessibilidade funcional

## 136. RB-FR-129 — Operar sem depender exclusivamente do mapa

### Declaração

Todos os objetivos críticos devem poder ser concluídos sem depender exclusivamente da interação visual com o mapa.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 137. RB-FR-130 — Operar sem depender exclusivamente de cor

### Declaração

Estados, categorias, alertas e seleções não devem ser comunicados apenas por cor.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 138. RB-FR-131 — Operar sem depender exclusivamente de arrastar

### Declaração

Ações de reordenação ou movimentação devem possuir alternativa ao gesto de arrastar.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 139. RB-FR-132 — Fornecer rótulos acessíveis

### Declaração

Ações interativas devem possuir rótulos compreensíveis para tecnologias assistivas.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 140. RB-FR-133 — Fornecer texto alternativo

### Declaração

Imagens relevantes para compreensão devem possuir texto alternativo adequado.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte XV — Responsividade funcional

## 141. RB-FR-134 — Suportar celular

### Declaração

Os fluxos críticos devem ser utilizáveis em dispositivos móveis.

### Fluxos críticos

* abrir Viagem;
* consultar Dia atual;
* explorar;
* visualizar mapa;
* abrir Detalhes;
* salvar;
* adicionar ao Roteiro;
* editar Atividade;
* abrir rota.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 142. RB-FR-135 — Adaptar navegação ao dispositivo

### Declaração

A navegação pode utilizar padrões diferentes em celular e telas maiores, desde que preserve acesso às áreas principais.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 143. RB-FR-136 — Preservar funcionalidade em telas pequenas

### Declaração

A redução de espaço não deve remover ações críticas.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte XVI — Requisitos funcionais pós-MVP

## 144. RB-FR-137 — Compartilhar Roteiro

O sistema poderá permitir que o usuário compartilhe uma visualização do Roteiro.

### MVP

Pós-MVP.

---

## 145. RB-FR-138 — Convidar participante

O sistema poderá permitir que o Organizador convide outros usuários.

### MVP

Pós-MVP.

---

## 146. RB-FR-139 — Registrar Preferências individuais

O sistema poderá permitir que cada Viajante registre suas próprias Preferências.

### MVP

Pós-MVP.

---

## 147. RB-FR-140 — Votar em Lugar

O sistema poderá permitir que participantes votem em Lugares.

### MVP

Pós-MVP.

---

## 148. RB-FR-141 — Replanejar por clima

O sistema poderá sugerir alterações com base em condições meteorológicas.

### MVP

Pós-MVP.

---

## 149. RB-FR-142 — Disponibilizar Roteiro offline

O sistema poderá disponibilizar dados essenciais da Viagem sem conexão.

### MVP

Pós-MVP.

---

## 150. RB-FR-143 — Registrar gastos realizados

O sistema poderá permitir o registro de despesas durante a Viagem.

### MVP

Pós-MVP.

---

## 151. RB-FR-144 — Suportar múltiplos Destinos

O sistema poderá permitir que uma Viagem possua múltiplos Destinos e Hospedagens.

### MVP

Pós-MVP.

---

## 152. RB-FR-145 — Enviar notificações

O sistema poderá enviar notificações sobre:

* próxima Atividade;
* horário de saída;
* alterações;
* alertas.

### MVP

Pós-MVP.

---

# Parte XVII — Matriz de rastreabilidade

## 153. Gestão da Viagem

| Requisitos            | Casos de Uso relacionados                             |
| --------------------- | ----------------------------------------------------- |
| RB-FR-001 a RB-FR-013 | RB-UC-001, RB-UC-002, RB-UC-003, RB-UC-034, RB-UC-035 |

---

## 154. Contexto e personalização

| Requisitos            | Casos de Uso relacionados |
| --------------------- | ------------------------- |
| RB-FR-014 a RB-FR-023 | RB-UC-004, RB-UC-023      |

---

## 155. Descoberta

| Requisitos            | Casos de Uso relacionados       |
| --------------------- | ------------------------------- |
| RB-FR-024 a RB-FR-038 | RB-UC-005, RB-UC-006, RB-UC-007 |

---

## 156. Detalhes e seleção

| Requisitos            | Casos de Uso relacionados |
| --------------------- | ------------------------- |
| RB-FR-039 a RB-FR-044 | RB-UC-008, RB-UC-009      |

---

## 157. Mapa e deslocamento

| Requisitos            | Casos de Uso relacionados                             |
| --------------------- | ----------------------------------------------------- |
| RB-FR-045 a RB-FR-059 | RB-UC-009, RB-UC-021, RB-UC-029, RB-UC-030, RB-UC-031 |

---

## 158. Salvos

| Requisitos            | Casos de Uso relacionados       |
| --------------------- | ------------------------------- |
| RB-FR-060 a RB-FR-066 | RB-UC-010, RB-UC-011, RB-UC-012 |

---

## 159. Roteiro

| Requisitos            | Casos de Uso relacionados |
| --------------------- | ------------------------- |
| RB-FR-067 a RB-FR-086 | RB-UC-013 a RB-UC-021     |

---

## 160. Geração e Recomendações

| Requisitos            | Casos de Uso relacionados                  |
| --------------------- | ------------------------------------------ |
| RB-FR-087 a RB-FR-104 | RB-UC-022, RB-UC-023, RB-UC-024, RB-UC-025 |

---

## 161. Revisão e adaptação

| Requisitos            | Casos de Uso relacionados                             |
| --------------------- | ----------------------------------------------------- |
| RB-FR-105 a RB-FR-117 | RB-UC-026, RB-UC-027, RB-UC-028, RB-UC-032, RB-UC-033 |

---

## 162. Persistência

| Requisitos            | Casos de Uso relacionados |
| --------------------- | ------------------------- |
| RB-FR-118 a RB-FR-124 | RB-UC-034, RB-UC-035      |

---

# Parte XVIII — Critérios de implementação

## 163. Requisito implementável

Um requisito somente deverá ser considerado pronto para implementação quando:

* seu objetivo estiver claro;
* seu comportamento puder ser testado;
* suas dependências forem conhecidas;
* suas regras relacionadas estiverem identificadas;
* seus estados de erro estiverem definidos;
* sua prioridade estiver confirmada.

---

## 164. Requisito testável

Um requisito deverá permitir derivar pelo menos:

* cenário de sucesso;
* cenário alternativo, quando aplicável;
* cenário de erro;
* condição de persistência;
* condição de acessibilidade;
* condição responsiva, quando relevante.

---

## 165. Requisito concluído

Um requisito será considerado concluído quando:

* estiver implementado;
* possuir testes adequados;
* atender critérios de aceitação;
* funcionar nos dispositivos aplicáveis;
* tratar estados de erro;
* possuir documentação atualizada;
* não contradizer requisitos relacionados.

---

# Parte XIX — Critérios de qualidade funcional

## 166. Coerência de estado

O mesmo dado não deve possuir estados conflitantes entre lista, mapa, Salvos e Roteiro.

---

## 167. Preservação de autonomia

Recomendações, geração e alertas não devem retirar a decisão final do usuário.

---

## 168. Transparência

Dados estimados, ausentes ou externos devem ser comunicados adequadamente.

---

## 169. Recuperação

Falhas externas ou temporárias não devem causar perda silenciosa de dados.

---

## 170. Simplicidade

Fluxos críticos devem exigir apenas informações necessárias para a ação atual.

---

## 171. Contexto

Recomendações e planejamento devem utilizar o Contexto da Viagem quando disponível.

---

# Parte XX — Governança

## 172. Inclusão de novo requisito

Um novo requisito deverá ser criado quando:

* representar comportamento verificável;
* derivar de necessidade válida;
* não estiver coberto por requisito existente;
* possuir impacto funcional;
* puder ser testado.

---

## 173. Alteração de requisito

Um requisito deverá ser revisado quando:

* o Caso de Uso mudar;
* a Regra de negócio mudar;
* o MVP mudar;
* o domínio redefinir um conceito;
* uma integração criar limitação;
* testes revelarem ambiguidade;
* a experiência exigir comportamento diferente.

---

## 174. Descontinuação

Requisitos já utilizados não devem ser removidos sem histórico.

Eles deverão ser marcados como:

* Deprecated;
* substituídos;
* Pós-MVP;
* fora de escopo.

---

## 175. Relação com critérios de aceitação

Os critérios de aceitação poderão ser mantidos:

* dentro de histórias;
* em especificações funcionais;
* em documentação própria;
* em ferramentas de gestão.

Eles deverão sempre referenciar o identificador do requisito correspondente.

---

## 176. Relação com testes

Casos de teste deverão referenciar os requisitos relacionados.

Exemplo:

```text
RB-FR-060
→ TEST-FUNC-060-01
→ TEST-FUNC-060-02
→ E2E-02
```

---

## 177. Checklist de revisão

Antes de aprovar este documento, verificar:

* os requisitos utilizam linguagem verificável;
* não existem requisitos duplicados;
* prioridades estão coerentes;
* classificação do MVP está coerente;
* todos os Casos de Uso críticos possuem requisitos;
* erros e falhas estão contemplados;
* persistência está contemplada;
* acessibilidade está contemplada;
* responsividade está contemplada;
* termos seguem o Glossário;
* fornecedores não substituem conceitos do produto;
* requisitos não definem tecnologia prematuramente.

---

## 178. Declaração final

Os Requisitos Funcionais definem os comportamentos que o RouteBook deverá oferecer para transformar sua visão em um produto utilizável.

Eles estabelecem que o usuário deverá conseguir:

* criar uma Viagem;
* configurar seu contexto;
* descobrir Lugares;
* compreender localização e deslocamento;
* salvar opções;
* construir um Roteiro;
* receber Recomendações;
* revisar problemas;
* alterar o planejamento;
* retomar a Viagem.

Esses requisitos deverão servir como base comum para produto, experiência, domínio, arquitetura, desenvolvimento e qualidade.

A implementação poderá evoluir tecnicamente, mas os comportamentos funcionais deverão permanecer rastreáveis, verificáveis e coerentes com a visão do RouteBook.
