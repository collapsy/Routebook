---

id: RB-DS-003

title: UI Patterns
description: Define os padrões recorrentes de composição, interação, conteúdo, responsividade e acessibilidade utilizados nas principais experiências do RouteBook.

document_type: design-system
owner: Experience

status: Draft
version: "0.1.0"

created: "2026-07-17"
last_updated: null

authors:

- RouteBook Team

tags:

- design-system
- ui-patterns
- interaction-patterns
- composition
- accessibility
- responsive-design
- travel-experience

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

prerequisites:

- RB-CORE-0001
- RB-CORE-0002
- RB-CORE-0003
- RB-CORE-0004
- RB-UX-001
- RB-UX-002
- RB-UX-003
- RB-UX-004
- RB-UX-005
- RB-UX-006
- RB-DS-001
- RB-DS-002

next_documents:

- RB-DS-004
- RB-DOM-001
- RB-ARC-001
- RB-QA-001

ai_context:
priority: high
index: true
---

# RouteBook — UI Patterns

## 1. Propósito deste documento

Este documento define os padrões recorrentes de interface do RouteBook.

Seu objetivo é transformar componentes isolados em estruturas de experiência reutilizáveis.

Enquanto a Component Library define unidades como:

* Button;
* Text Field;
* Place Card;
* Activity Card;
* Modal;
* Bottom Sheet;

este documento define como essas unidades deverão ser combinadas para resolver problemas recorrentes.

Os padrões deverão orientar:

* composição de telas;
* fluxos;
* protótipos;
* implementação frontend;
* responsividade;
* acessibilidade;
* testes;
* documentação;
* agentes de IA que produzam interfaces.

Este documento define:

* padrões de navegação;
* padrões de busca;
* padrões de filtros;
* padrões de seleção;
* padrões de formulário;
* padrões de feedback;
* padrões de confirmação;
* padrões de estados vazios;
* padrões de carregamento;
* padrões de erro;
* padrões de Mapa;
* padrões de Roteiro;
* padrões de recomendação;
* padrões de proposta;
* padrões responsivos;
* governança.

Este documento não define:

* telas específicas;
* componentes isolados;
* código;
* regras de negócio;
* arquitetura técnica;
* identidade visual final;
* contratos de API.

---

## 2. Relação com a biblioteca de componentes

A sequência do Design System é:

```text
RB-DS-001 — Design System Foundations
→ define fundamentos e tokens

RB-DS-002 — Component Library
→ define componentes reutilizáveis

RB-DS-003 — UI Patterns
→ define composições recorrentes

RB-DS-004 — Design System Governance
→ definirá evolução e manutenção
```

Um padrão deverá reutilizar componentes existentes sempre que possível.

Ele não deverá criar uma biblioteca paralela.

---

## 3. Definição de padrão

Um padrão de interface é uma solução reutilizável para um problema recorrente de experiência.

Um padrão deverá possuir:

* problema;
* contexto;
* objetivo;
* estrutura;
* componentes;
* comportamento;
* estados;
* responsividade;
* acessibilidade;
* conteúdo;
* critérios de uso;
* anti-patterns.

---

## 4. Convenção de identificação

Os padrões utilizarão:

```text
RB-PAT-XXX
```

Exemplo:

```text
RB-PAT-001 — Navegação contextual da Viagem
```

---

## 5. Critérios para criação de padrão

Um padrão deverá ser documentado quando:

* ocorrer em mais de uma superfície;
* combinar vários componentes;
* possuir comportamento recorrente;
* exigir consistência;
* afetar acessibilidade;
* possuir variação responsiva;
* reduzir decisões repetidas;
* representar uma prática importante do produto.

---

# Parte I — Princípios de composição

## 6. Um objetivo principal por contexto

Cada superfície deverá possuir um objetivo principal claramente reconhecível.

Exemplos:

* Criar Viagem;
* Explorar Lugares;
* Adicionar ao Roteiro;
* Revisar conflitos;
* Salvar alterações.

A composição não deverá atribuir o mesmo destaque a várias ações concorrentes sem necessidade.

---

## 7. Progressão do geral para o específico

A experiência deverá normalmente seguir:

```text
Contexto
→ exploração
→ seleção
→ detalhe
→ decisão
→ confirmação
```

Exemplo:

```text
Explorar
→ selecionar Lugar
→ abrir Detalhes
→ adicionar ao Roteiro
→ escolher Dia
→ confirmar
```

---

## 8. Preservação de contexto

Padrões que abrem Detalhes, filtros ou edição deverão preservar:

* Viagem ativa;
* filtros;
* pesquisa;
* Dia;
* posição da lista;
* enquadramento do Mapa;
* item selecionado.

---

## 9. Divulgação progressiva

Informações deverão ser apresentadas conforme sua relevância.

Exemplo:

```text
Place Card
→ resumo essencial

Detalhes do Lugar
→ conteúdo completo
```

A interface não deverá apresentar toda a informação em todas as superfícies.

---

## 10. Sincronização entre representações

Quando o mesmo objeto estiver presente em:

* lista;
* Mapa;
* painel;
* Roteiro;

a seleção deverá permanecer sincronizada.

---

## 11. Recuperação

Todo padrão deverá considerar:

* cancelamento;
* falha;
* nova tentativa;
* retorno;
* dados parciais;
* alterações não salvas.

---

# Parte II — Navegação

## 12. RB-PAT-001 — Navegação contextual da Viagem

### Problema

Permitir que o usuário navegue entre as áreas principais sem perder o contexto da Viagem.

### Áreas

* Viagem;
* Explorar;
* Mapa;
* Roteiro;
* Salvos.

### Componentes

* Bottom Navigation;
* Side Navigation;
* Trip Header;
* Badge opcional.

### Mobile

```text
Conteúdo
────────────────────────
Viagem Explorar Mapa Roteiro Salvos
```

### Desktop

```text
Navegação lateral
+ conteúdo da área
```

### Regras

* a área ativa deverá ser indicada;
* a Viagem ativa deverá permanecer identificável;
* Configurações poderão ficar fora da navegação principal mobile;
* estados locais deverão ser preservados quando possível;
* a navegação não deverá cobrir conteúdo.

### Acessibilidade

* utilizar elemento de navegação;
* indicar item atual;
* manter rótulos visíveis;
* permitir teclado;
* possuir foco visível.

---

## 13. RB-PAT-002 — Cabeçalho contextual

### Problema

Identificar a página atual e apresentar ações relacionadas.

### Componentes

* Top App Bar;
* Trip Header;
* Icon Button;
* Button Group;
* Breadcrumb em desktop.

### Estrutura

```text
Voltar opcional
Título
Subtítulo
Ações
Menu contextual
```

### Regras

* o título deverá ser específico;
* ações deverão pertencer ao contexto;
* ações secundárias poderão ir para menu;
* o cabeçalho poderá ser fixo quando necessário;
* o retorno deverá preservar contexto.

---

## 14. RB-PAT-003 — Navegação mestre-detalhe

### Problema

Permitir comparação e inspeção de itens relacionados.

### Usos

* Explorar;
* Salvos;
* conflitos;
* Configurações;
* Roteiro desktop.

### Desktop

```text
Lista
+ Detalhes
```

Ou:

```text
Lista
+ Mapa
+ Detalhes
```

### Mobile

```text
Lista
→ página de Detalhes
```

### Regras

* seleção deve ser clara;
* foco deve acompanhar a interação;
* retorno preserva lista;
* o painel não deverá substituir navegação global;
* largura mínima deverá ser respeitada.

---

## 15. RB-PAT-004 — Navegação por etapas

### Problema

Conduzir o usuário por uma tarefa sequencial.

### Uso principal

Criação da Viagem.

### Componentes

* Step Progress;
* Form Fields;
* Button Group;
* Inline Message.

### Estrutura

```text
Título
Progresso
Conteúdo da etapa
Ação voltar
Ação continuar
```

### Regras

* mostrar etapa atual;
* preservar dados anteriores;
* validar somente o necessário;
* permitir voltar;
* usar ação específica na última etapa;
* não apresentar etapas falsas apenas para reduzir conteúdo.

---

# Parte III — Busca e descoberta

## 16. RB-PAT-005 — Busca com sugestões

### Problema

Ajudar o usuário a encontrar Destinos, Hospedagens ou Lugares.

### Componentes

* Search Field;
* Popover ou lista;
* List Item;
* Progress Indicator;
* Empty State;
* Error State.

### Estados

* vazio;
* digitando;
* carregando;
* resultados;
* sem resultados;
* erro.

### Comportamento

```text
Digitar
→ aguardar intervalo adequado
→ buscar
→ exibir sugestões
→ selecionar
→ fechar sugestões
```

### Regras

* limpar deve preservar filtros;
* sugestões devem indicar contexto geográfico;
* navegação por teclado obrigatória;
* resultado ativo deve ser anunciado;
* falha não deverá limpar o termo.

---

## 17. RB-PAT-006 — Exploração com lista e Mapa

### Problema

Permitir descobrir Lugares visual e geograficamente.

### Componentes

* Filter Bar;
* Place Card;
* Map Marker;
* Map Controls;
* Place Summary;
* Split View;
* Bottom Sheet.

### Desktop

```text
Busca e filtros
────────────────────────────
Lista de Lugares | Mapa
```

Opcionalmente:

```text
Lista | Mapa | Detalhes
```

### Mobile

```text
Lista
↔
Mapa
```

Com resumo em Bottom Sheet.

### Regras

* lista e Mapa devem permanecer sincronizados;
* seleção em um atualiza o outro;
* Mapa deve possuir alternativa em lista;
* filtros afetam as duas representações;
* mudança de enquadramento não deve substituir resultados silenciosamente.

---

## 18. RB-PAT-007 — Buscar nesta área

### Problema

Atualizar resultados após movimentação do Mapa sem causar perda inesperada.

### Componentes

* Map Controls;
* Button;
* Results Count;
* Progress Indicator.

### Fluxo

```text
Usuário move o Mapa
→ região muda
→ botão “Buscar nesta área” aparece
→ usuário confirma
→ resultados atualizam
```

### Regras

* não atualizar automaticamente quando isso causar instabilidade;
* manter filtros;
* indicar carregamento;
* preservar Lugar selecionado quando ainda válido;
* anunciar quantidade de resultados.

---

## 19. RB-PAT-008 — Filtros aplicáveis

### Problema

Permitir ajustar resultados sem perder contexto.

### Componentes

* Filter Bar;
* Filter Group;
* Checkbox;
* Radio;
* Chip;
* Active Filters;
* Bottom Sheet ou Drawer;
* Button Group.

### Mobile

```text
Acionador de filtros
→ Bottom Sheet
→ alterações locais
→ Aplicar
```

### Desktop

```text
Drawer ou painel persistente
```

### Regras

* filtros atuais devem aparecer selecionados;
* cancelar descarta mudanças locais;
* aplicar atualiza resultados;
* filtros ativos ficam visíveis;
* Limpar todos remove filtros;
* busca e ordenação permanecem.

---

## 20. RB-PAT-009 — Sem resultados com recuperação

### Problema

Orientar o usuário quando a consulta não retorna opções.

### Componentes

* Empty State;
* Active Filters;
* Button;
* Link;
* Map alternative.

### Estrutura

```text
Título
Explicação
Filtros atuais
Ação principal
Alternativas
```

### Ações possíveis

* ampliar Distância;
* limpar filtros;
* mudar categoria;
* pesquisar outro termo;
* buscar em outra Região.

### Regra

Não apresentar apenas:

```text
Nenhum resultado
```

sem recuperação.

---

# Parte IV — Seleção e decisão

## 21. RB-PAT-010 — Seleção única contextual

### Problema

Escolher uma opção entre alternativas mutuamente exclusivas.

### Usos

* Dia;
* transporte;
* Ritmo;
* origem;
* ordenação.

### Componentes

* Radio;
* Select;
* Segmented Control;
* List Item selecionável.

### Regras

* usar Radio quando comparação for importante;
* usar Select quando houver muitas opções;
* seleção deve ser perceptível sem cor;
* estado atual deve ser preservado;
* mudança estrutural pode exigir confirmação.

---

## 22. RB-PAT-011 — Seleção múltipla

### Problema

Escolher várias opções independentes.

### Usos

* interesses;
* categorias;
* filtros;
* Dias de uma proposta;
* Atividades para aceitação parcial.

### Componentes

* Checkbox;
* Chip;
* Selection Summary;
* Button.

### Regras

* grupo deve possuir título;
* quantidade selecionada poderá ser exibida;
* ação global poderá existir;
* seleção não deverá aplicar impacto destrutivo imediatamente sem contexto.

---

## 23. RB-PAT-012 — Salvar versus Planejar

### Problema

Diferenciar duas ações relacionadas, mas semanticamente distintas.

### Componentes

* Place Status;
* Icon Button;
* Button;
* Toast;
* Place Card.

### Estados

```text
Não salvo / não planejado
Salvo / não planejado
Não salvo / planejado
Salvo / planejado
```

### Regras

* `Salvar` mantém o Lugar para avaliação;
* `Adicionar ao Roteiro` cria uma Atividade;
* os estados devem ser independentes;
* remover de Salvos não remove Atividade;
* Lugar já planejado deve oferecer `Ver no roteiro`.

---

## 24. RB-PAT-013 — Seleção de Dia para planejamento

### Problema

Adicionar um Lugar ao Roteiro em um Dia apropriado.

### Componentes

* Bottom Sheet;
* Day Selector;
* Radio;
* Day Status;
* Button;
* Inline Message.

### Estrutura

```text
Lugar selecionado
Dias disponíveis
Estado de cada Dia
Recomendação opcional
Ação continuar
```

### Estados do Dia

* vazio;
* planejado;
* intenso;
* conflito;
* sugerido.

### Regras

* Dia sugerido deve possuir justificativa;
* escolha final é do usuário;
* conflito deverá aparecer antes da confirmação;
* horário poderá ser definido posteriormente.

---

# Parte V — Formulários

## 25. RB-PAT-014 — Formulário padrão

### Problema

Coletar ou editar dados de forma previsível.

### Componentes

* Section;
* Text Field;
* Select;
* Date Field;
* Text Area;
* Button Group;
* Inline Message.

### Estrutura

```text
Título
Descrição opcional
Campos
Mensagens
Ações
```

### Regras

* rótulos persistentes;
* erro próximo ao campo;
* ação principal no final;
* cancelamento separado;
* valores preservados após falha;
* seções longas podem ser divididas.

---

## 26. RB-PAT-015 — Formulário por etapas

### Problema

Coletar informações extensas sem sobrecarregar o usuário.

### Uso

Criar Viagem.

### Etapas iniciais

1. Destino;
2. Datas;
3. Hospedagem;
4. Viajantes;
5. revisão, quando separada.

### Regras

* cada etapa deve possuir objetivo;
* dados devem permanecer salvos localmente;
* validação deve ocorrer por etapa;
* revisão final deve resumir impacto;
* saída deve proteger alterações.

---

## 27. RB-PAT-016 — Edição contextual

### Problema

Editar um objeto sem perder seu contexto.

### Usos

* Atividade;
* Hospedagem;
* Preferências;
* Período livre.

### Mobile

Página completa ou Bottom Sheet, conforme complexidade.

### Desktop

Drawer, painel ou página.

### Regras

* valores atuais preenchidos;
* mudanças locais até salvar;
* impacto mostrado antes da aplicação;
* retorno preserva objeto selecionado;
* falha mantém os dados.

---

## 28. RB-PAT-017 — Alteração estrutural com impacto

### Problema

Editar informação que afeta outras partes da Viagem.

### Usos

* Destino;
* Período;
* Hospedagem;
* transporte.

### Componentes

* Form;
* Impact Summary;
* Alert Banner;
* Modal;
* Button Group.

### Fluxo

```text
Editar
→ calcular impacto
→ apresentar resumo
→ revisar
→ confirmar
→ recalcular dados
→ mostrar conclusão
```

### Regras

* nunca aplicar silenciosamente;
* identificar elementos afetados;
* proteger contra perda;
* mostrar estado de recálculo;
* permitir cancelamento.

---

## 29. RB-PAT-018 — Proteção de alterações não salvas

### Problema

Evitar perda acidental de dados.

### Componentes

* Modal;
* Button Group;
* Inline Message.

### Fluxo

```text
Usuário tenta sair
→ existem alterações?
   ├── não → sair
   └── sim → confirmação
```

### Ações

* continuar editando;
* descartar alterações;
* salvar e sair, quando disponível.

### Regras

* Escape não deve descartar;
* gesto de voltar deve respeitar a proteção;
* o modal deve nomear o impacto.

---

# Parte VI — Feedback e estado

## 30. RB-PAT-019 — Feedback de salvamento

### Problema

Comunicar persistência de alterações.

### Componentes

* Button;
* Inline Message;
* Toast;
* Status Label.

### Estados

```text
Alterado
→ Salvando...
→ Salvo
```

Falha:

```text
Salvando...
→ Não foi possível salvar
→ Tentar novamente
```

### Regras

* prevenir duplicação;
* preservar conteúdo;
* sucesso pode ser contextual;
* erro persistente deve permanecer visível;
* não depender apenas de Toast.

---

## 31. RB-PAT-020 — Ação com Desfazer

### Problema

Permitir recuperação rápida de ação simples.

### Usos

* remover dos Salvos;
* desfazer reordenação;
* remover filtro;
* restaurar risco ignorado.

### Componentes

* Toast;
* Button;
* estado persistente.

### Regras

* ação deve ser reversível;
* tempo deve ser suficiente;
* foco e leitor de tela devem acessar Desfazer;
* informação não pode existir somente no Toast.

---

## 32. RB-PAT-021 — Estado vazio orientativo

### Problema

Orientar quando ainda não existe conteúdo.

### Componentes

* Empty State;
* Illustration opcional;
* Button;
* Link.

### Estrutura

```text
Título
Explicação
Ação principal
Alternativa opcional
```

### Usos

* nenhuma Viagem;
* nenhum Salvo;
* Roteiro vazio;
* Dia livre.

### Regra

Estado vazio não é erro.

---

## 33. RB-PAT-022 — Carregamento estrutural

### Problema

Representar espera sem provocar instabilidade visual.

### Componentes

* Skeleton;
* Progress Indicator;
* Status Text.

### Usos

* página;
* seção;
* lista;
* Card;
* Detalhes.

### Regras

* skeleton deve refletir estrutura;
* conteúdo parcial pode aparecer;
* evitar skeleton para ações rápidas;
* respeitar redução de movimento;
* não simular conteúdo definitivo.

---

## 34. RB-PAT-023 — Erro recuperável

### Problema

Comunicar falha sem bloquear desnecessariamente.

### Componentes

* Error State;
* Alert Banner;
* Inline Message;
* Button.

### Estrutura

```text
O que falhou
O que foi preservado
O que ainda funciona
Ação de recuperação
```

### Exemplo

```text
Não foi possível carregar o Mapa.
Você ainda pode consultar os lugares em lista.
[ Tentar novamente ]
[ Ver lista ]
```

---

## 35. RB-PAT-024 — Conteúdo parcial

### Problema

Permitir uso quando parte dos dados estiver indisponível.

### Componentes

* Alert Banner;
* placeholders;
* conteúdo disponível;
* ação de atualização.

### Regras

* não esconder o conteúdo disponível;
* identificar campos ausentes;
* estimativas devem ser rotuladas;
* ações possíveis devem permanecer;
* falha parcial não deve virar falha total.

---

# Parte VII — Confirmações

## 36. RB-PAT-025 — Confirmação destrutiva

### Problema

Evitar execução acidental de ação irreversível.

### Componentes

* Modal;
* Button destructive;
* Button secondary;
* Impact Summary.

### Estrutura

```text
Título específico
Objeto afetado
Consequência
Reversibilidade
Cancelar
Ação destrutiva
```

### Exemplo

```text
Excluir a viagem para Pipa?

O roteiro, os lugares salvos e as configurações serão removidos.
Esta ação não poderá ser desfeita.

[ Cancelar ] [ Excluir viagem ]
```

---

## 37. RB-PAT-026 — Confirmação de alto impacto

### Problema

Confirmar ação reversível, mas com efeito amplo.

### Usos

* aplicar proposta;
* alterar Hospedagem;
* alterar Período;
* mover várias Atividades.

### Regras

* apresentar impacto;
* permitir revisão;
* não utilizar linguagem genérica;
* explicar recálculos;
* preservar alternativa de cancelamento.

---

## 38. RB-PAT-027 — Confirmação não necessária

Não solicitar confirmação quando:

* a ação é simples;
* o efeito é reversível;
* existe Desfazer;
* a interrupção causaria atrito desnecessário.

Exemplos:

* salvar Lugar;
* remover filtro;
* mudar ordenação;
* selecionar Dia.

---

# Parte VIII — Padrões de Lugar

## 39. RB-PAT-028 — Card de Lugar em resultados

### Problema

Apresentar dados suficientes para comparação.

### Componentes

* Place Card;
* Image;
* Place Status;
* Rating;
* Price Range;
* Recommendation Reason;
* Button.

### Prioridade

1. nome;
2. categoria;
3. Distância;
4. preço;
5. avaliação;
6. justificativa;
7. ações.

### Regras

* imagem não é obrigatória;
* ações devem ser claras;
* card selecionado deve sincronizar com Mapa;
* conteúdo secundário pode ser omitido em variação compacta.

---

## 40. RB-PAT-029 — Detalhes do Lugar

### Problema

Apresentar conteúdo completo para decisão.

### Componentes

* Gallery;
* Place Status;
* Rating;
* Price Range;
* Recommendation Reason;
* Section;
* Map link;
* fixed actions mobile.

### Estrutura

```text
Galeria
Identificação
Dados essenciais
Justificativa
Descrição
Localização
Fonte e atualização
Ações
```

### Regras

* ações principais permanecem acessíveis;
* dados indisponíveis devem ser identificados;
* recomendações devem possuir justificativa;
* estimativas não são garantias.

---

## 41. RB-PAT-030 — Resumo de Lugar no Mapa

### Problema

Permitir decisão rápida sem sair do Mapa.

### Componentes

* Place Summary;
* Bottom Sheet;
* Button;
* Place Status.

### Conteúdo mínimo

* nome;
* categoria;
* Distância;
* estado;
* ação Ver Detalhes;
* ação Salvar ou Planejar.

---

# Parte IX — Padrões de Mapa

## 42. RB-PAT-031 — Seleção sincronizada no Mapa

### Problema

Manter coerência entre lista e geografia.

### Fluxo pela lista

```text
Selecionar Place Card
→ destacar Card
→ destacar Marcador
→ ajustar enquadramento
→ abrir resumo
```

### Fluxo pelo Mapa

```text
Selecionar Marcador
→ destacar Marcador
→ localizar item na lista
→ abrir resumo
```

### Regras

* ajuste deve ser suave;
* foco deve permanecer previsível;
* seleção deve possuir alternativa textual;
* não depender apenas de cor.

---

## 43. RB-PAT-032 — Marcadores agrupados

### Problema

Evitar sobreposição excessiva em regiões densas.

### Componentes

* Marker Cluster;
* Map Marker;
* Results Count;
* Place List.

### Comportamento

* selecionar cluster amplia ou lista itens;
* quantidade deve ser legível;
* navegação por teclado deve ser suportada;
* foco não pode ser perdido após expansão.

---

## 44. RB-PAT-033 — Mapa indisponível

### Problema

Permitir continuidade quando o serviço geográfico falhar.

### Componentes

* Map Fallback;
* Alert Banner;
* Place List;
* Button.

### Estrutura

```text
Mensagem
Nova tentativa
Lista equivalente
Distâncias textuais
Rota externa opcional
```

### Regra

O Mapa não pode ser pré-requisito absoluto para planejar.

---

# Parte X — Padrões de Roteiro

## 45. RB-PAT-034 — Planejamento por Dia

### Problema

Organizar Atividades dentro de um Dia da Viagem.

### Componentes

* Day Selector;
* Day Header;
* Activity Card;
* Travel Time;
* Free Period Card;
* Button.

### Estrutura

```text
Seletor de Dia
Cabeçalho do Dia
Atividade
Deslocamento
Atividade
Período livre
Ações
```

### Regras

* Dia selecionado deve permanecer claro;
* alertas aparecem no contexto;
* Atividades sem horário ficam em seção própria;
* Deslocamentos não devem competir com Atividades;
* Dia vazio deve possuir orientação.

---

## 46. RB-PAT-035 — Linha do tempo do Dia

### Problema

Representar sequência temporal.

### Componentes

* Activity Card;
* Travel Time;
* Time Label;
* Conflict Indicator.

### Regras

* ordem vertical deve refletir sequência;
* horário sem definição deve ser separado;
* sobreposição deve ser indicada;
* intervalos devem ser legíveis;
* não depender de precisão visual absoluta.

---

## 47. RB-PAT-036 — Reordenação acessível

### Problema

Permitir reorganizar Atividades por gesto e alternativa explícita.

### Componentes

* Activity Card;
* Drag Handle;
* Reorder Controls;
* Toast;
* loading state.

### Arrastar

```text
Selecionar handle
→ mover
→ indicar destino
→ soltar
→ salvar
```

### Alternativa

* mover para cima;
* mover para baixo;
* mover para início;
* mover para fim;
* escolher posição.

### Regras

* nova posição deve ser anunciada;
* foco deve permanecer no item;
* falha deve restaurar ou permitir nova tentativa;
* Deslocamentos devem ser recalculados.

---

## 48. RB-PAT-037 — Atividade sem horário

### Problema

Permitir planejamento parcial.

### Componentes

* Unscheduled Activities;
* Activity Card;
* Button;
* Reorder Controls.

### Regras

* não tratar como erro;
* manter seção separada;
* permitir definir horário;
* permitir mover para sequência;
* recomendações podem considerar flexibilidade.

---

## 49. RB-PAT-038 — Período livre intencional

### Problema

Representar intervalo sem Atividade como decisão explícita.

### Componentes

* Free Period Card;
* Switch ou Checkbox;
* Button;
* Edit Form.

### Estados

* flexível;
* bloqueado;
* sem horário;
* definido por intervalo.

### Regras

* diferenciar de lacuna não planejada;
* indicar se pode receber sugestão;
* automação não deve preencher período bloqueado;
* usuário pode editar ou remover.

---

## 50. RB-PAT-039 — Conflito contextual

### Problema

Apresentar inconsistência junto do elemento afetado.

### Componentes

* Conflict Indicator;
* Inline Message;
* Conflict Item;
* Button.

### Tipos

* erro;
* risco;
* sugestão.

### Regras

* mostrar contexto;
* explicar impacto;
* oferecer correção;
* erros bloqueantes não podem ser ignorados;
* risco pode ser ignorado quando permitido.

---

# Parte XI — Recomendações e automação

## 51. RB-PAT-040 — Recomendação explicável

### Problema

Apresentar sugestão sem retirar autonomia.

### Componentes

* Recommendation Reason;
* Place Card;
* Proposal Activity;
* Alert Banner opcional.

### Estrutura

```text
Sugestão
Justificativa
Limitação
Ação
```

### Exemplos de justificativa

* próxima da Hospedagem;
* mesma Região do Dia;
* compatível com Interesse;
* adequada ao período;
* dentro do orçamento.

### Regras

* não usar “melhor opção” sem base;
* justificar com fatores compreensíveis;
* permitir ignorar;
* não substituir decisão.

---

## 52. RB-PAT-041 — Geração de proposta

### Problema

Organizar uma proposta sem alterar o Roteiro atual.

### Componentes

* Proposal Summary;
* Progress Indicator;
* Alert Banner;
* Button.

### Fluxo

```text
Iniciar
→ revisar contexto
→ gerar
→ apresentar proposta separada
```

### Regras

* Roteiro atual deve permanecer preservado;
* progresso não deve ser artificial;
* cancelamento quando possível;
* falha deve permitir continuar manualmente;
* limitações devem ser informadas.

---

## 53. RB-PAT-042 — Revisão de proposta

### Problema

Permitir avaliar uma proposta antes da aplicação.

### Componentes

* Proposal Day;
* Proposal Activity;
* Checkbox;
* Conflict Item;
* Button Group.

### Ações

* editar;
* aceitar integralmente;
* aceitar parcialmente;
* gerar novamente;
* descartar.

### Regras

* proposta deve ser visualmente distinta;
* conflitos devem ser apresentados;
* seleção parcial deve ser clara;
* Roteiro atual não deve ser confundido com proposta.

---

## 54. RB-PAT-043 — Aceitação parcial

### Problema

Aplicar somente partes selecionadas.

### Componentes

* Checkbox;
* Proposal Day;
* Proposal Activity;
* Selection Summary;
* Confirmation Modal.

### Fluxo

```text
Selecionar Dias ou Atividades
→ revisar impacto
→ confirmar
→ aplicar selecionados
```

### Regras

* itens não selecionados não alteram o Roteiro;
* conflitos devem ser recalculados;
* seleção deve ser reversível antes da confirmação;
* quantidade selecionada deve ser apresentada.

---

# Parte XII — Revisão de conflitos

## 55. RB-PAT-044 — Lista e detalhe de conflitos

### Problema

Permitir revisar vários alertas com eficiência.

### Componentes

* Conflict Summary;
* Tabs ou Chips;
* Conflict Item;
* Split View;
* Button.

### Desktop

```text
Filtros
+ lista de alertas
+ detalhe e correção
```

### Mobile

```text
Lista
→ detalhe ou edição
```

### Regras

* filtros por severidade;
* alerta selecionado deve permanecer;
* correção atualiza análise;
* estado sem conflito deve ser transparente.

---

## 56. RB-PAT-045 — Correção guiada

### Problema

Levar o usuário diretamente à origem do conflito.

### Fluxo

```text
Selecionar Corrigir
→ abrir Atividade ou configuração
→ preservar contexto do alerta
→ salvar
→ recalcular
→ retornar à revisão
```

### Regras

* manter referência ao alerta;
* não exigir que o usuário procure manualmente;
* preservar filtros da revisão;
* comunicar resolução.

---

# Parte XIII — Configurações

## 57. RB-PAT-046 — Lista de Configurações

### Problema

Organizar opções da Viagem em categorias.

### Componentes

* Settings List;
* List Item;
* Badge;
* Side Navigation em desktop.

### Categorias

* Informações gerais;
* Hospedagem;
* Viajantes;
* Interesses;
* orçamento;
* transporte;
* Ritmo;
* Restrições;
* ações da Viagem.

### Regras

* mostrar valor atual;
* indicar incompletude;
* ações destrutivas separadas;
* estrutura responsiva.

---

## 58. RB-PAT-047 — Configurações mestre-detalhe

### Desktop

```text
Lista de seções
+ formulário da seção
```

### Mobile

```text
Lista
→ página de edição
```

### Regras

* seleção de seção clara;
* alterações locais protegidas;
* impacto estrutural destacado;
* navegação preserva contexto.

---

# Parte XIV — Padrões responsivos

## 59. RB-PAT-048 — Painel para página

### Problema

Adaptar conteúdo lateral para telas menores.

### Transformação

```text
Desktop:
Lista + painel de Detalhes

Mobile:
Lista → página de Detalhes
```

### Regras

* manter conteúdo equivalente;
* preservar retorno;
* não remover ações;
* ordem semântica permanece.

---

## 60. RB-PAT-049 — Drawer para Bottom Sheet

### Transformação

```text
Desktop:
Drawer lateral

Mobile:
Bottom Sheet
```

### Usos

* filtros;
* resumo do Mapa;
* seleção de Dia;
* ações contextuais.

### Regras

* mesma responsabilidade;
* conteúdo pode ser reorganizado;
* fechamento explícito;
* foco e scroll adaptados.

---

## 61. RB-PAT-050 — Grade para lista

### Transformação

```text
Desktop:
Cards em grade

Mobile:
Lista vertical
```

### Regras

* prioridade do conteúdo preservada;
* imagens podem mudar de proporção;
* ações não devem desaparecer;
* ordem de leitura deve permanecer lógica.

---

## 62. RB-PAT-051 — Navegação lateral para inferior

### Transformação

```text
Desktop:
Side Navigation

Mobile:
Bottom Navigation
```

### Regras

* destinos equivalentes;
* Configurações podem mudar de posição;
* item ativo preservado;
* rótulos não devem desaparecer.

---

## 63. RB-PAT-052 — Split View para visualização alternada

### Transformação

```text
Desktop:
Lista + Mapa

Mobile:
Lista ↔ Mapa
```

### Regras

* filtros e seleção compartilhados;
* alternância não reinicia conteúdo;
* item selecionado permanece;
* Mapa possui lista equivalente.

---

# Parte XV — Conteúdo e microcopy

## 64. RB-PAT-053 — Ação específica

Botões deverão nomear o resultado.

Preferir:

```text
Criar viagem
Salvar alterações
Aplicar filtros
Aceitar proposta
```

Evitar:

```text
OK
Confirmar
Enviar
```

sem contexto.

---

## 65. RB-PAT-054 — Mensagem com recuperação

Estrutura:

```text
O que aconteceu
O que foi preservado
O que fazer agora
```

Exemplo:

```text
Não foi possível salvar a atividade.
Os dados preenchidos foram preservados.
Tente novamente.
```

---

## 66. RB-PAT-055 — Estimativa identificada

Informações não confirmadas deverão utilizar:

* cerca de;
* estimativa;
* aproximadamente;
* pode variar;
* informação não confirmada.

Exemplo:

```text
Cerca de 7 min de carro
```

---

## 67. RB-PAT-056 — Estado positivo moderado

Preferir:

```text
Viagem criada
Lugar salvo
Atividade adicionada
```

Evitar:

```text
Tudo perfeito!
Sua viagem incrível está pronta!
```

---

# Parte XVI — Acessibilidade

## 68. Padrões de foco

Todo padrão com sobreposição deverá:

* mover foco ao abrir;
* restringir foco quando modal;
* devolver foco ao fechar.

---

## 69. Padrões de teclado

Deverão ser suportados:

* navegação;
* seleção;
* aplicação;
* cancelamento;
* reordenação;
* abertura;
* fechamento;
* operação alternativa ao Mapa.

---

## 70. Padrões de anúncio

Mudanças relevantes deverão ser anunciadas.

Exemplos:

```text
Filtro Praias aplicado. 18 lugares encontrados.
```

```text
Praia do Amor movida para a terceira posição.
```

```text
Proposta aplicada ao roteiro.
```

---

## 71. Alternativa a gestos

| Gesto              | Alternativa              |
| ------------------ | ------------------------ |
| Arrastar           | Controles de reordenação |
| Swipe              | Botão ou menu            |
| Pinça              | Zoom explícito           |
| Arrastar sheet     | Expandir ou fechar       |
| Selecionar no Mapa | Lista equivalente        |

---

## 72. Informação sem cor

Todo estado deverá utilizar:

* texto;
* símbolo;
* nome acessível;
* contraste;
* forma quando apropriado.

---

# Parte XVII — Anti-patterns

## 73. Padrões paralelos

Não criar soluções diferentes para o mesmo problema sem necessidade.

Exemplo:

```text
Filtro em Modal em uma tela
Filtro em página em outra
Filtro em Popover em outra
```

sem justificativa responsiva ou contextual.

---

## 74. Modal para fluxo longo

Não utilizar Modal para:

* criação completa de Viagem;
* Configurações extensas;
* edição com múltiplas seções;
* revisão de proposta complexa.

---

## 75. Atualização silenciosa

Não atualizar:

* resultados;
* Roteiro;
* proposta;
* Distâncias;
* Configurações;

sem feedback quando a mudança for relevante.

---

## 76. Perda de contexto

Não retornar o usuário para:

* início da lista;
* primeiro Dia;
* Mapa padrão;
* filtros vazios;

após Detalhes ou edição sem necessidade.

---

## 77. Automação obrigatória

Não aplicar proposta automaticamente.

Não reorganizar o Roteiro sem confirmação.

Não preencher Período livre bloqueado.

---

## 78. Dependência exclusiva de Mapa

Não exigir interação geográfica para:

* selecionar Lugar;
* consultar Distância;
* adicionar ao Roteiro;
* visualizar Salvos.

---

## 79. Confirmação excessiva

Não solicitar confirmação para toda ação.

Utilizar:

* Desfazer;
* feedback contextual;
* salvamento automático seguro;

quando apropriado.

---

## 80. Ações genéricas

Evitar:

* Continuar em etapa final;
* Confirmar em exclusão;
* Enviar em salvamento;
* OK em mensagem de erro.

---

# Parte XVIII — Rastreabilidade

## 81. Padrões e áreas

| Área              | Padrões principais                              |
| ----------------- | ----------------------------------------------- |
| Minhas Viagens    | RB-PAT-001, RB-PAT-021                          |
| Criar Viagem      | RB-PAT-004, RB-PAT-015                          |
| Visão Geral       | RB-PAT-001, RB-PAT-002                          |
| Explorar          | RB-PAT-005 a RB-PAT-009                         |
| Detalhes do Lugar | RB-PAT-028 a RB-PAT-030                         |
| Mapa              | RB-PAT-006, RB-PAT-007, RB-PAT-031 a RB-PAT-033 |
| Salvos            | RB-PAT-012, RB-PAT-028                          |
| Roteiro           | RB-PAT-034 a RB-PAT-039                         |
| Proposta          | RB-PAT-040 a RB-PAT-043                         |
| Revisão           | RB-PAT-044, RB-PAT-045                          |
| Configurações     | RB-PAT-017, RB-PAT-046, RB-PAT-047              |

---

## 82. Padrões e componentes

| Padrão               | Componentes principais                   |
| -------------------- | ---------------------------------------- |
| Navegação contextual | Bottom Navigation, Side Navigation       |
| Mestre-detalhe       | List Item, Split View, Drawer            |
| Busca com sugestões  | Search Field, Popover, List Item         |
| Filtros              | Filter Bar, Filter Group, Chip           |
| Lista e Mapa         | Place Card, Map Marker, Split View       |
| Formulário           | Text Field, Select, Button               |
| Confirmação          | Modal, Button Group                      |
| Roteiro              | Day Selector, Activity Card, Travel Time |
| Reordenação          | Drag Handle, Reorder Controls            |
| Proposta             | Proposal Day, Proposal Activity          |
| Conflitos            | Conflict Item, Conflict Summary          |

---

## 83. Padrões e wireframes

| Wireframes                    | Padrões                           |
| ----------------------------- | --------------------------------- |
| RB-WF-MOB-001, RB-WF-DESK-001 | Navegação, Empty State, Trip Card |
| RB-WF-MOB-003 a 006           | Navegação por etapas              |
| RB-WF-MOB-009, RB-WF-DESK-004 | Busca, filtros, lista e Mapa      |
| RB-WF-MOB-012, RB-WF-DESK-005 | Detalhes do Lugar                 |
| RB-WF-MOB-014, RB-WF-DESK-006 | Mapa sincronizado                 |
| RB-WF-MOB-018, RB-WF-DESK-008 | Planejamento por Dia              |
| RB-WF-MOB-025, RB-WF-DESK-009 | Revisão de proposta               |
| RB-WF-MOB-026, RB-WF-DESK-010 | Lista e detalhe de conflitos      |
| RB-WF-MOB-028, RB-WF-DESK-011 | Configurações mestre-detalhe      |

---

# Parte XIX — Priorização

## 84. Lote 1 — Padrões essenciais

Implementar e validar primeiro:

1. navegação contextual;
2. cabeçalho contextual;
3. navegação por etapas;
4. formulário padrão;
5. feedback de salvamento;
6. estado vazio;
7. erro recuperável;
8. confirmação destrutiva.

---

## 85. Lote 2 — Descoberta

1. busca com sugestões;
2. exploração com lista e Mapa;
3. filtros aplicáveis;
4. sem resultados;
5. Card de Lugar;
6. Detalhes do Lugar;
7. resumo no Mapa.

---

## 86. Lote 3 — Roteiro

1. planejamento por Dia;
2. linha do tempo;
3. reordenação;
4. Atividades sem horário;
5. Período livre;
6. conflito contextual.

---

## 87. Lote 4 — Automação e revisão

1. Recomendação explicável;
2. geração de proposta;
3. revisão de proposta;
4. aceitação parcial;
5. lista de conflitos;
6. correção guiada.

---

## 88. Lote 5 — Responsividade

1. painel para página;
2. drawer para bottom sheet;
3. grade para lista;
4. navegação lateral para inferior;
5. split view para visualização alternada.

---

# Parte XX — Testes

## 89. Testes de composição

Validar:

* hierarquia;
* relação entre componentes;
* ação principal;
* adaptação de conteúdo;
* estados;
* responsividade.

---

## 90. Testes de interação

Validar:

* navegação;
* seleção;
* abertura;
* fechamento;
* aplicação;
* cancelamento;
* retorno;
* preservação de contexto.

---

## 91. Testes de acessibilidade

Validar:

* ordem de foco;
* teclado;
* nomes acessíveis;
* anúncios;
* alternativa a gestos;
* contraste;
* zoom;
* texto ampliado.

---

## 92. Testes de conteúdo

Validar:

* nomes longos;
* mensagens de erro;
* pluralização;
* dados ausentes;
* estimativas;
* textos traduzidos futuramente.

---

## 93. Testes responsivos

Testar:

* mobile compacto;
* mobile amplo;
* tablet;
* desktop;
* desktop amplo;
* redimensionamento dinâmico.

---

# Parte XXI — Critérios de aceite

## 94. Consistência

* problemas equivalentes utilizam padrões equivalentes;
* componentes são reutilizados;
* não existem soluções paralelas sem justificativa;
* conteúdo segue microcopy oficial.

---

## 95. Navegação

* o usuário entende onde está;
* contexto da Viagem é preservado;
* retorno mantém estado;
* transformação responsiva é previsível.

---

## 96. Feedback

* toda ação relevante possui resposta;
* falhas possuem recuperação;
* salvamento possui estados;
* conteúdo parcial permanece utilizável.

---

## 97. Automação

* propostas não são aplicadas automaticamente;
* justificativas são compreensíveis;
* o Roteiro atual é preservado;
* o usuário pode editar, rejeitar ou aceitar parcialmente.

---

## 98. Acessibilidade

* padrões funcionam por teclado;
* gestos possuem alternativa;
* estados não dependem apenas de cor;
* Mapas possuem lista equivalente;
* foco é gerenciado.

---

## 99. Responsividade

* conteúdo prioritário permanece;
* ações não desaparecem;
* painéis se transformam adequadamente;
* contexto é preservado entre visualizações.

---

# Parte XXII — Governança

## 100. Inclusão de novo padrão

Um novo padrão deverá:

* resolver problema recorrente;
* reutilizar componentes;
* possuir identificação;
* documentar estados;
* documentar responsividade;
* documentar acessibilidade;
* possuir exemplos;
* possuir testes.

---

## 101. Alteração de padrão

Alterações deverão considerar:

* telas afetadas;
* componentes;
* fluxos;
* microcopy;
* acessibilidade;
* responsividade;
* testes;
* migração.

---

## 102. Depreciação

Um padrão obsoleto deverá:

* ser marcado;
* indicar substituto;
* documentar impacto;
* possuir plano de migração;
* não ser removido abruptamente.

---

## 103. Exceções

Uma exceção deverá:

* possuir motivo;
* estar documentada;
* não criar padrão paralelo permanente;
* preservar acessibilidade;
* ser revisada posteriormente.

---

## 104. Uso por agentes de IA

Agentes que produzam telas, protótipos ou código deverão:

* identificar o padrão aplicável;
* reutilizar componentes oficiais;
* preservar os estados documentados;
* respeitar responsividade;
* manter acessibilidade;
* preservar contexto;
* não inventar composições paralelas;
* seguir a terminologia oficial;
* registrar lacunas quando nenhum padrão atender.

---

## 105. Checklist de revisão

Antes de aprovar este documento, verificar:

* princípios de composição estão definidos;
* navegação está documentada;
* busca está documentada;
* filtros estão documentados;
* seleção está documentada;
* formulários estão documentados;
* feedback está documentado;
* confirmações estão documentadas;
* Lugares estão documentados;
* Mapa está documentado;
* Roteiro está documentado;
* proposta está documentada;
* conflitos estão documentados;
* Configurações estão documentadas;
* responsividade está documentada;
* acessibilidade está documentada;
* anti-patterns estão definidos;
* rastreabilidade está presente;
* priorização está definida;
* testes estão definidos;
* governança está definida.

---

## 106. Declaração final

Os UI Patterns do RouteBook definem como componentes deverão ser combinados para formar experiências consistentes.

Eles estabelecem soluções reutilizáveis para:

* navegação;
* descoberta;
* busca;
* filtros;
* seleção;
* formulários;
* feedback;
* confirmação;
* Lugares;
* Mapa;
* Roteiro;
* automação;
* conflitos;
* Configurações;
* responsividade.

Esses padrões deverão reduzir decisões repetidas e garantir que novas superfícies mantenham:

* clareza;
* consistência;
* previsibilidade;
* acessibilidade;
* rastreabilidade;
* controle do usuário.

A próxima etapa deverá definir como o Design System será governado, versionado, mantido, revisado e evoluído.
