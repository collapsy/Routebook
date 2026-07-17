---

id: RB-DS-004

title: Design System Governance
description: Define o modelo de governança, ownership, contribuição, revisão, versionamento, qualidade, adoção, depreciação e evolução do Design System do RouteBook.

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
- governance
- contribution
- versioning
- quality
- accessibility
- documentation
- maintenance

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
- RB-DS-003

next_documents:

- RB-DOM-001
- RB-ARC-001
- RB-QA-001
- RB-FE-001

ai_context:
priority: high
index: true
---

# RouteBook — Design System Governance

## 1. Propósito deste documento

Este documento define a governança do Design System do RouteBook.

Seu objetivo é estabelecer como o sistema deverá ser:

* mantido;
* revisado;
* expandido;
* versionado;
* documentado;
* testado;
* adotado;
* depreciado;
* auditado;
* utilizado por pessoas e agentes de IA.

A governança deverá garantir que o Design System permaneça:

* consistente;
* confiável;
* acessível;
* atualizado;
* reutilizável;
* rastreável;
* compatível com o produto;
* sustentável ao longo do tempo.

Este documento define:

* ownership;
* papéis;
* responsabilidades;
* fluxo de contribuição;
* critérios de entrada;
* revisão;
* aprovação;
* versionamento;
* compatibilidade;
* depreciação;
* qualidade;
* testes;
* documentação;
* métricas;
* adoção;
* auditoria;
* tratamento de exceções;
* uso por agentes de IA.

Este documento não define:

* código de componentes;
* framework frontend;
* pipeline técnico definitivo;
* estrutura organizacional permanente da empresa;
* implementação do repositório;
* contratos de APIs;
* roadmap completo do produto.

---

## 2. Relação com os documentos anteriores

A sequência do Design System é:

```text
RB-DS-001 — Design System Foundations
→ define fundamentos e tokens

RB-DS-002 — Component Library
→ define componentes

RB-DS-003 — UI Patterns
→ define composições recorrentes

RB-DS-004 — Design System Governance
→ define manutenção, evolução e controle
```

A governança não poderá contradizer os fundamentos, os componentes ou os padrões já aprovados.

---

## 3. Objetivos da governança

A governança deverá:

1. evitar componentes duplicados;
2. reduzir decisões visuais isoladas;
3. preservar acessibilidade;
4. manter documentação sincronizada;
5. garantir rastreabilidade;
6. tornar mudanças previsíveis;
7. permitir evolução controlada;
8. reduzir regressões;
9. orientar contribuições;
10. limitar exceções;
11. apoiar múltiplos consumidores;
12. preparar o sistema para automação e IA.

---

## 4. Princípios de governança

Toda decisão deverá seguir estes princípios:

* o Design System é produto interno;
* documentação e implementação devem evoluir juntas;
* acessibilidade é requisito de entrada;
* consistência tem precedência sobre preferência individual;
* mudanças devem possuir motivação verificável;
* componentes não devem existir sem uso real;
* exceções devem ser temporárias e justificadas;
* breaking changes devem ser explícitas;
* depreciação deve preceder remoção;
* consumidores devem possuir caminho de migração;
* decisões devem permanecer rastreáveis;
* IA não pode alterar o sistema autonomamente sem revisão.

---

# Parte I — Escopo do sistema

## 5. Elementos governados

Esta governança se aplica a:

* tokens;
* cores;
* tipografia;
* espaçamento;
* dimensões;
* iconografia;
* elevação;
* movimento;
* componentes;
* variantes;
* estados;
* padrões;
* conteúdo de interface;
* acessibilidade;
* documentação;
* exemplos;
* assets;
* testes;
* pacotes técnicos futuros.

---

## 6. Elementos fora do escopo direto

Não são governados diretamente por este documento:

* regras de domínio;
* lógica de recomendação;
* APIs;
* infraestrutura;
* modelos de IA;
* conteúdo editorial de Destinos;
* dados de Lugares;
* regras comerciais.

Esses elementos poderão consumir o Design System, mas pertencem a outras áreas documentais.

---

## 7. Fonte de verdade

O repositório oficial do RouteBook será a fonte canônica.

Deverão permanecer versionados:

* documentação Markdown;
* tokens;
* assets;
* componentes;
* exemplos;
* changelog;
* decisões;
* testes;
* guias de migração.

Ferramentas externas não deverão ser tratadas como única fonte de verdade.

---

# Parte II — Ownership

## 8. Owner principal

O owner do Design System será:

```text
Experience
```

Esse ownership representa responsabilidade sobre:

* coerência;
* linguagem visual;
* acessibilidade;
* documentação;
* evolução conceitual;
* priorização.

---

## 9. Ownership compartilhado

A implementação deverá possuir participação compartilhada entre:

* Experience;
* Frontend;
* QA;
* Produto;
* Arquitetura;
* Content Design;
* Acessibilidade.

Nenhuma disciplina deverá controlar isoladamente todas as decisões.

---

## 10. Responsabilidade do owner

O owner deverá:

* manter visão do sistema;
* revisar propostas;
* arbitrar conflitos;
* evitar duplicações;
* preservar consistência;
* organizar roadmap;
* acompanhar adoção;
* conduzir auditorias;
* coordenar depreciações;
* manter documentação atualizada.

---

## 11. Responsabilidade dos consumidores

Equipes e agentes consumidores deverão:

* reutilizar elementos existentes;
* informar lacunas;
* evitar forks locais;
* reportar problemas;
* participar de migrações;
* respeitar versões;
* contribuir com exemplos reais;
* não alterar contratos sem aprovação.

---

# Parte III — Papéis

## 12. Design System Owner

Responsável por:

* direção;
* priorização;
* aprovação final;
* visão de longo prazo;
* governança;
* depreciação;
* alinhamento entre áreas.

---

## 13. Design Contributor

Responsável por:

* proposta visual;
* anatomia;
* estados;
* responsividade;
* acessibilidade;
* documentação de uso;
* exemplos.

---

## 14. Engineering Contributor

Responsável por:

* arquitetura técnica;
* implementação;
* API;
* performance;
* testes;
* compatibilidade;
* distribuição;
* manutenção.

---

## 15. Content Contributor

Responsável por:

* nomenclatura;
* microcopy;
* mensagens;
* pluralização;
* localização;
* consistência terminológica.

---

## 16. Accessibility Reviewer

Responsável por revisar:

* contraste;
* teclado;
* foco;
* semântica;
* leitor de tela;
* gestos;
* redução de movimento;
* texto ampliado.

---

## 17. QA Reviewer

Responsável por:

* estratégia de testes;
* estados;
* regressão;
* compatibilidade;
* testes visuais;
* acessibilidade automatizada;
* critérios de aceite.

---

## 18. Product Reviewer

Responsável por verificar:

* necessidade real;
* alinhamento ao produto;
* impacto;
* prioridade;
* uso previsto;
* relação com fluxos.

---

## 19. Architecture Reviewer

Responsável por revisar:

* dependências;
* integração;
* contratos;
* escalabilidade;
* compatibilidade;
* distribuição;
* impacto técnico.

---

# Parte IV — Modelo de decisão

## 20. Categorias de decisão

As decisões serão classificadas como:

* operacional;
* evolutiva;
* estrutural;
* breaking;
* emergencial.

---

## 21. Decisão operacional

Inclui:

* correção de documentação;
* ajuste de exemplo;
* melhoria sem alteração de contrato;
* correção visual pequena;
* teste adicional.

Poderá exigir revisão simplificada.

---

## 22. Decisão evolutiva

Inclui:

* nova variante;
* novo estado;
* novo padrão;
* novo token semântico;
* melhoria relevante de acessibilidade.

Exige revisão multidisciplinar.

---

## 23. Decisão estrutural

Inclui:

* novo componente;
* mudança de arquitetura de tokens;
* alteração de nomenclatura;
* mudança de responsabilidade;
* mudança de padrão transversal.

Exige aprovação formal do owner.

---

## 24. Breaking change

Inclui:

* remoção;
* alteração incompatível de API;
* mudança de semântica;
* renomeação sem compatibilidade;
* alteração de comportamento esperado.

Exige:

* justificativa;
* plano de migração;
* versão principal;
* comunicação;
* período de transição.

---

## 25. Decisão emergencial

Utilizada em:

* falha crítica;
* vulnerabilidade;
* regressão severa;
* problema grave de acessibilidade;
* bloqueio de produção.

A correção poderá ser acelerada, mas deverá ser documentada posteriormente.

---

# Parte V — Fluxo de contribuição

## 26. Etapas

Toda contribuição relevante deverá seguir:

```text
Identificação
→ investigação
→ proposta
→ revisão
→ aprovação
→ implementação
→ validação
→ publicação
→ monitoramento
```

---

## 27. Identificação da necessidade

A necessidade poderá surgir de:

* nova funcionalidade;
* pesquisa;
* teste de usabilidade;
* auditoria;
* bug;
* acessibilidade;
* inconsistência;
* dívida técnica;
* contribuição externa;
* análise de métricas.

---

## 28. Investigação

Antes de propor novo elemento, verificar:

* existe componente semelhante?
* composição resolve?
* nova variante é suficiente?
* padrão existente atende?
* a necessidade é recorrente?
* o problema é de conteúdo?
* o problema é de implementação local?
* existe evidência real?

---

## 29. Proposta

A proposta deverá conter:

* problema;
* contexto;
* evidências;
* consumidores;
* alternativa analisada;
* solução;
* escopo;
* estados;
* acessibilidade;
* responsividade;
* impacto;
* migração;
* testes.

---

## 30. Template de proposta

```markdown
# Proposta

## Problema

## Evidências

## Consumidores

## Alternativas avaliadas

## Solução proposta

## Anatomia

## Estados

## Responsividade

## Acessibilidade

## Impacto

## Compatibilidade

## Migração

## Testes

## Questões abertas
```

---

## 31. Protótipo

Mudanças relevantes deverão possuir:

* exemplo visual;
* comportamento;
* estados;
* uso real;
* adaptação mobile;
* adaptação desktop.

O protótipo poderá ser de baixa ou alta fidelidade conforme a decisão.

---

## 32. Revisão

A revisão deverá avaliar:

* necessidade;
* duplicação;
* consistência;
* acessibilidade;
* conteúdo;
* implementação;
* testes;
* impacto;
* manutenção.

---

## 33. Aprovação

A aprovação deverá registrar:

* responsáveis;
* data;
* decisão;
* ressalvas;
* versão;
* documentos afetados;
* plano de entrega.

---

## 34. Implementação

A implementação deverá ser acompanhada por:

* documentação;
* exemplos;
* testes;
* changelog;
* migração, quando necessária.

Um componente sem documentação não deverá ser considerado concluído.

---

## 35. Validação

Antes da publicação, validar:

* comportamento;
* estados;
* responsividade;
* acessibilidade;
* conteúdo;
* regressão;
* performance;
* integração.

---

## 36. Publicação

A publicação deverá atualizar:

* versão;
* changelog;
* documentação;
* registry;
* exemplos;
* referências;
* guias de migração.

---

## 37. Monitoramento

Após publicação, acompanhar:

* bugs;
* dúvidas;
* adoção;
* exceções;
* feedback;
* regressões;
* uso incorreto;
* necessidade de ajuste.

---

# Parte VI — Critérios de entrada

## 38. Critérios para novo componente

Um novo componente deverá:

* resolver problema recorrente;
* possuir consumidores identificados;
* não duplicar elemento existente;
* ter responsabilidade clara;
* possuir estados;
* ser acessível;
* ser responsivo;
* utilizar tokens;
* possuir testes;
* possuir documentação.

---

## 39. Critérios para nova variante

Uma nova variante deverá:

* representar diferença semântica;
* possuir uso recorrente;
* manter responsabilidade original;
* não ser apenas preferência visual;
* não aumentar complexidade sem benefício.

---

## 40. Critérios para novo token

Um novo token deverá:

* representar decisão reutilizável;
* possuir semântica;
* reduzir valor isolado;
* suportar temas;
* evitar duplicação.

---

## 41. Critérios para novo padrão

Um novo padrão deverá:

* resolver problema recorrente;
* combinar componentes existentes;
* possuir mais de um uso;
* documentar responsividade;
* documentar acessibilidade;
* possuir anti-patterns.

---

## 42. Critérios para exceção

Uma exceção somente será aceita quando:

* o sistema não atender;
* a necessidade for legítima;
* a solução temporária estiver documentada;
* existir plano de revisão;
* não houver comprometimento de acessibilidade.

---

# Parte VII — Revisão e aprovação

## 43. Níveis de revisão

### Revisão leve

Para:

* documentação;
* typo;
* exemplo;
* teste;
* ajuste semântico não incompatível.

### Revisão padrão

Para:

* variante;
* estado;
* token;
* melhoria visual;
* acessibilidade.

### Revisão ampliada

Para:

* novo componente;
* novo padrão;
* breaking change;
* mudança arquitetural;
* depreciação.

---

## 44. Revisores mínimos

| Mudança         | Revisores mínimos                      |
| --------------- | -------------------------------------- |
| Documentação    | Experience                             |
| Token           | Experience e Frontend                  |
| Componente      | Experience, Frontend e QA              |
| Conteúdo        | Experience e Content                   |
| Acessibilidade  | Experience e Accessibility             |
| Padrão          | Experience, Frontend e Produto         |
| Breaking change | Experience, Frontend, QA e Arquitetura |

---

## 45. Critérios de aprovação

Uma contribuição será aprovada quando:

* necessidade estiver comprovada;
* escopo estiver claro;
* não houver duplicação;
* documentação estiver completa;
* acessibilidade estiver validada;
* testes estiverem definidos;
* impacto estiver compreendido;
* migração estiver preparada quando necessária.

---

## 46. Reprovação

Uma proposta poderá ser recusada quando:

* duplicar componente;
* resolver caso isolado;
* não possuir evidência;
* comprometer acessibilidade;
* introduzir complexidade excessiva;
* contrariar fundamentos;
* não possuir plano de manutenção.

A reprovação deverá registrar justificativa.

---

## 47. Solicitação de revisão

Uma proposta poderá retornar para ajustes quando:

* houver lacunas;
* estados estiverem ausentes;
* responsividade não estiver definida;
* testes forem insuficientes;
* nomenclatura estiver inconsistente;
* impacto não estiver claro.

---

# Parte VIII — Status de maturidade

## 48. Estados oficiais

Elementos do Design System poderão possuir:

* Proposed;
* Experimental;
* Beta;
* Stable;
* Deprecated;
* Removed.

---

## 49. Proposed

Representa ideia em avaliação.

Não deverá ser utilizada em produção.

---

## 50. Experimental

Representa implementação para aprendizado controlado.

Pode mudar sem garantia de compatibilidade.

Deverá possuir consumidores limitados.

---

## 51. Beta

Representa elemento próximo da estabilidade.

Pode ser utilizado em escopo controlado.

Mudanças incompatíveis ainda são possíveis, mas devem ser comunicadas.

---

## 52. Stable

Representa elemento aprovado para uso geral.

Deverá possuir:

* documentação;
* testes;
* acessibilidade;
* compatibilidade;
* owner;
* exemplos.

---

## 53. Deprecated

Representa elemento ainda disponível, mas não recomendado.

Deverá possuir:

* substituto;
* aviso;
* prazo;
* guia de migração.

---

## 54. Removed

Representa elemento removido da versão ativa.

Seu histórico deverá permanecer no repositório.

---

## 55. Fluxo de maturidade

```text
Proposed
→ Experimental
→ Beta
→ Stable
→ Deprecated
→ Removed
```

Nem todo elemento precisará passar por todas as etapas, mas saltos deverão ser justificados.

---

# Parte IX — Versionamento

## 56. Modelo

O Design System deverá utilizar versionamento semântico:

```text
MAJOR.MINOR.PATCH
```

Exemplo:

```text
2.4.1
```

---

## 57. PATCH

Utilizado para:

* correções;
* documentação;
* bug visual;
* melhoria sem mudança de contrato;
* teste adicional;
* acessibilidade sem impacto incompatível.

---

## 58. MINOR

Utilizado para:

* novo componente;
* nova variante compatível;
* novo token;
* novo padrão;
* propriedade opcional;
* melhoria compatível.

---

## 59. MAJOR

Utilizado para:

* breaking change;
* remoção;
* renomeação incompatível;
* mudança de arquitetura;
* alteração de comportamento;
* migração obrigatória.

---

## 60. Versão documental

Documentos individuais poderão possuir versão própria.

A versão do pacote técnico futuro poderá ser diferente da versão documental, desde que a relação seja rastreável.

---

## 61. Pré-lançamentos

Versões poderão utilizar:

```text
1.0.0-alpha.1
1.0.0-beta.1
1.0.0-rc.1
```

Essas versões não deverão ser tratadas como estáveis.

---

## 62. Changelog

Toda versão deverá possuir changelog contendo:

* adições;
* alterações;
* correções;
* depreciações;
* remoções;
* migrações;
* acessibilidade;
* known issues.

---

## 63. Estrutura de changelog

```markdown
## 1.2.0

### Adicionado

### Alterado

### Corrigido

### Depreciado

### Removido

### Migração

### Acessibilidade

### Problemas conhecidos
```

---

# Parte X — Compatibilidade

## 64. Compatibilidade retroativa

Mudanças compatíveis deverão evitar exigir alteração dos consumidores.

Exemplos:

* nova propriedade opcional;
* novo componente;
* nova variante;
* correção visual;
* melhoria de documentação.

---

## 65. Mudança incompatível

Uma mudança será incompatível quando:

* remover propriedade;
* alterar valor padrão;
* modificar semântica;
* alterar estrutura necessária;
* remover token;
* modificar comportamento;
* alterar marcação acessível.

---

## 66. Contratos protegidos

Deverão ser tratados como contratos:

* nomes;
* propriedades;
* eventos;
* estados;
* tokens;
* semântica;
* comportamento de teclado;
* nomes acessíveis;
* responsividade essencial.

---

## 67. Janela de suporte

Versões principais anteriores poderão possuir suporte temporário.

A política definitiva será definida quando houver distribuição técnica formal.

---

# Parte XI — Depreciação

## 68. Processo

A depreciação deverá seguir:

```text
Identificar
→ anunciar
→ fornecer substituto
→ documentar migração
→ monitorar adoção
→ remover
```

---

## 69. Critérios de depreciação

Um elemento poderá ser depreciado quando:

* duplicar outro;
* não atender acessibilidade;
* possuir arquitetura inadequada;
* ter baixo uso;
* gerar inconsistência;
* ter substituto melhor;
* não corresponder ao produto atual.

---

## 70. Aviso de depreciação

O aviso deverá informar:

* elemento afetado;
* motivo;
* substituto;
* versão de remoção;
* guia de migração;
* owner.

---

## 71. Período de transição

O período deverá ser proporcional ao impacto.

Componentes amplamente utilizados exigirão transição maior.

---

## 72. Remoção

A remoção somente deverá ocorrer quando:

* substituto estiver estável;
* migração estiver documentada;
* consumidores críticos estiverem migrados;
* versão principal for adequada;
* comunicação tiver ocorrido.

---

## 73. Elementos sem substituto

Um elemento poderá ser removido sem substituto quando sua responsabilidade deixar de existir.

A justificativa deverá ser explícita.

---

# Parte XII — Documentação

## 74. Documentação obrigatória

Cada elemento deverá possuir:

* nome;
* identificador;
* objetivo;
* status;
* owner;
* anatomia;
* propriedades;
* estados;
* variações;
* comportamento;
* responsividade;
* acessibilidade;
* conteúdo;
* exemplos;
* anti-patterns;
* tokens;
* testes;
* changelog.

---

## 75. Documentação visual

Quando aplicável, incluir:

* anatomia;
* variações;
* estados;
* responsividade;
* uso correto;
* uso incorreto;
* exemplos reais.

---

## 76. Documentação técnica

Quando houver implementação, incluir:

* instalação;
* importação;
* API;
* propriedades;
* eventos;
* exemplos;
* dependências;
* compatibilidade;
* migração.

---

## 77. Sincronização

Documentação e implementação deverão ser atualizadas na mesma mudança.

Não deverá existir componente publicado com documentação antiga conhecida.

---

## 78. Exemplos

Exemplos deverão:

* representar uso real;
* utilizar microcopy oficial;
* incluir estados;
* considerar acessibilidade;
* evitar dados enganosos;
* respeitar o domínio.

---

## 79. Decisões

Decisões relevantes deverão ser registradas em documento próprio ou log de decisão.

---

# Parte XIII — Qualidade

## 80. Dimensões de qualidade

A qualidade será avaliada por:

* consistência;
* acessibilidade;
* usabilidade;
* responsividade;
* performance;
* testabilidade;
* documentação;
* adoção;
* estabilidade;
* manutenção.

---

## 81. Definition of Ready

Um item estará pronto para implementação quando possuir:

* problema definido;
* escopo;
* proposta;
* estados;
* responsividade;
* acessibilidade;
* conteúdo;
* critérios de aceite;
* revisores.

---

## 82. Definition of Done

Um item estará concluído quando possuir:

* implementação;
* documentação;
* exemplos;
* testes;
* acessibilidade validada;
* revisão visual;
* changelog;
* status;
* owner;
* publicação.

---

## 83. Critérios mínimos de componente estável

Um componente Stable deverá:

* utilizar tokens;
* possuir API coerente;
* possuir estados;
* funcionar por teclado;
* possuir foco visível;
* suportar texto ampliado;
* funcionar responsivamente;
* possuir testes;
* possuir documentação;
* possuir exemplos.

---

## 84. Dívida do Design System

Dívida deverá ser registrada quando houver:

* valor isolado;
* componente duplicado;
* documentação incompleta;
* teste ausente;
* acessibilidade incompleta;
* exceção prolongada;
* API inconsistente;
* componente local não migrado.

---

## 85. Priorização da dívida

Prioridade alta para:

* acessibilidade;
* regressão;
* inconsistência estrutural;
* breaking bug;
* componente amplamente utilizado;
* falha de documentação crítica.

---

# Parte XIV — Testes

## 86. Estratégia de testes

O Design System deverá possuir testes em diferentes níveis:

* unitários;
* interação;
* acessibilidade;
* visuais;
* integração;
* responsividade;
* conteúdo;
* performance.

---

## 87. Testes unitários

Validar:

* renderização;
* propriedades;
* eventos;
* estados;
* conteúdo condicional;
* valores padrão.

---

## 88. Testes de interação

Validar:

* mouse;
* toque;
* teclado;
* foco;
* abertura;
* fechamento;
* seleção;
* loading;
* erro;
* cancelamento.

---

## 89. Testes de acessibilidade

Validar:

* semântica;
* nome;
* contraste;
* foco;
* teclado;
* leitor de tela;
* redução de movimento;
* texto ampliado.

---

## 90. Testes visuais

Validar:

* estados;
* variantes;
* breakpoints;
* temas;
* textos longos;
* imagens ausentes;
* regressão.

---

## 91. Testes de integração

Validar componentes em:

* formulários;
* páginas;
* Mapas;
* Roteiro;
* modais;
* navegação;
* propostas.

---

## 92. Testes de conteúdo

Validar:

* português;
* pluralização;
* datas;
* números;
* mensagens;
* texto longo;
* localização futura.

---

## 93. Testes de performance

Validar quando aplicável:

* tamanho de pacote;
* tempo de renderização;
* quantidade de re-renderizações;
* carregamento de assets;
* impacto de animações.

---

# Parte XV — Acessibilidade

## 94. Gate obrigatório

Nenhum elemento poderá alcançar status Stable com falha grave de acessibilidade conhecida.

---

## 95. Revisão obrigatória

Novos componentes interativos deverão passar por revisão de:

* teclado;
* foco;
* semântica;
* nome acessível;
* estados;
* contraste;
* toque;
* redução de movimento.

---

## 96. Regressões

Regressões de acessibilidade deverão ser classificadas como defeitos de alta prioridade.

---

## 97. Exceções de acessibilidade

Exceções não poderão ser aprovadas apenas por conveniência técnica.

Quando uma limitação externa existir, deverá haver:

* documentação;
* alternativa;
* mitigação;
* prazo de revisão.

---

## 98. Auditorias

Auditorias deverão ocorrer:

* antes de versão principal;
* após mudança estrutural;
* periodicamente;
* após incidentes;
* quando novos dispositivos forem suportados.

---

# Parte XVI — Adoção

## 99. Objetivo

A governança deverá estimular adoção sem criar bloqueio excessivo.

---

## 100. Indicadores de adoção

Poderão ser medidos:

* percentual de telas usando componentes oficiais;
* quantidade de componentes locais;
* uso de tokens;
* consumo por versão;
* exceções abertas;
* migrações pendentes;
* componentes depreciados ainda utilizados.

---

## 101. Componentes locais

Componentes locais deverão ser registrados quando:

* não houver equivalente;
* a necessidade ainda estiver em avaliação;
* o uso for específico.

Se o componente se repetir, deverá ser avaliado para incorporação.

---

## 102. Forks

Forks locais de componentes oficiais deverão ser evitados.

Quando inevitáveis, deverão possuir:

* justificativa;
* owner;
* prazo;
* plano de convergência.

---

## 103. Migração

Migrações deverão possuir:

* escopo;
* prioridade;
* responsáveis;
* exemplos;
* automação quando possível;
* prazo;
* validação.

---

## 104. Suporte

O Design System deverá oferecer suporte por meio de:

* documentação;
* exemplos;
* decisões registradas;
* canal de dúvidas futuro;
* templates;
* guias de migração.

---

# Parte XVII — Métricas

## 105. Métricas de qualidade

* regressões;
* falhas de acessibilidade;
* bugs por componente;
* inconsistências;
* cobertura de testes;
* documentação incompleta.

---

## 106. Métricas de adoção

* componentes reutilizados;
* componentes locais;
* telas migradas;
* tokens utilizados;
* versões em uso;
* elementos depreciados ativos.

---

## 107. Métricas de eficiência

* tempo para construir tela;
* tempo para corrigir inconsistência;
* quantidade de decisões repetidas;
* retrabalho;
* tempo de revisão;
* velocidade de migração.

---

## 108. Métricas de contribuição

* propostas abertas;
* propostas aprovadas;
* tempo de ciclo;
* contribuições por área;
* depreciações concluídas;
* dívida aberta.

---

## 109. Interpretação

Métricas não deverão ser utilizadas isoladamente para avaliar qualidade.

Exemplo:

Um grande número de componentes não significa maturidade.

Pode representar fragmentação.

---

# Parte XVIII — Auditoria

## 110. Objetivo

Auditorias deverão identificar:

* inconsistência;
* duplicação;
* dívida;
* acessibilidade;
* baixa adoção;
* documentação desatualizada;
* elementos obsoletos;
* padrões paralelos.

---

## 111. Frequência

Enquanto o projeto estiver em fase inicial, auditorias deverão ocorrer em marcos relevantes.

Futuramente, poderão ser:

* trimestrais;
* semestrais;
* anteriores a versões principais.

---

## 112. Escopo de auditoria

Uma auditoria poderá avaliar:

* tokens;
* componentes;
* padrões;
* documentação;
* telas;
* código;
* testes;
* acessibilidade;
* métricas;
* exceções.

---

## 113. Resultado

A auditoria deverá produzir:

* achados;
* severidade;
* responsáveis;
* prazo;
* plano de correção;
* decisões;
* itens de dívida.

---

## 114. Severidade

| Nível   | Significado                                         |
| ------- | --------------------------------------------------- |
| Crítica | Bloqueio, acessibilidade grave ou quebra estrutural |
| Alta    | Inconsistência relevante ou risco de regressão      |
| Média   | Problema de manutenção ou adoção                    |
| Baixa   | Melhoria ou refinamento                             |

---

# Parte XIX — Exceções

## 115. Registro obrigatório

Toda exceção deverá registrar:

* problema;
* justificativa;
* elemento afetado;
* owner;
* risco;
* acessibilidade;
* prazo;
* plano de resolução.

---

## 116. Prazo

Exceções não deverão permanecer indefinidamente.

A data de revisão deverá ser definida no momento da aprovação.

---

## 117. Exceção temporária

Exemplo:

```text
Componente local temporário
Motivo: ausência de padrão adequado
Revisão: próxima versão minor
Owner: Frontend
```

---

## 118. Exceção permanente

Exceções permanentes deverão ser extremamente raras.

Quando um caso for realmente permanente e recorrente, deverá ser considerado para incorporação formal.

---

# Parte XX — Incidentes

## 119. Definição

Um incidente do Design System poderá envolver:

* regressão crítica;
* componente quebrado;
* falha de acessibilidade;
* versão incompatível;
* token incorreto;
* remoção acidental;
* documentação enganosa.

---

## 120. Resposta

O fluxo deverá ser:

```text
Detectar
→ conter
→ corrigir
→ publicar
→ comunicar
→ analisar causa
→ prevenir recorrência
```

---

## 121. Hotfix

Hotfix deverá utilizar versão PATCH, salvo quando a correção for incompatível.

---

## 122. Pós-incidente

Deverá registrar:

* causa;
* impacto;
* detecção;
* correção;
* prevenção;
* testes adicionados;
* documentação atualizada.

---

# Parte XXI — Segurança e privacidade

## 123. Componentes sensíveis

Componentes que exibam ou coletem dados pessoais deverão considerar:

* minimização;
* mascaramento;
* consentimento;
* segurança;
* visibilidade;
* preenchimento automático;
* mensagens.

---

## 124. Dados em exemplos

Exemplos documentais não deverão utilizar dados pessoais reais sem necessidade e autorização.

---

## 125. Logs

Componentes não deverão expor conteúdo sensível em logs de desenvolvimento ou telemetria.

---

# Parte XXII — Localização

## 126. Governança de conteúdo localizado

Mudanças de texto deverão considerar:

* chaves;
* pluralização;
* contexto;
* expansão;
* gênero;
* datas;
* números;
* moedas.

---

## 127. Textos não localizáveis

Textos não deverão ser incorporados diretamente em imagens ou ícones quando precisarem ser traduzidos.

---

## 128. Revisão

Mudanças de componente que afetem conteúdo deverão incluir revisão de localização.

---

# Parte XXIII — Repositório e organização

## 129. Estrutura conceitual

```text
design-system/
├── foundations/
├── tokens/
├── components/
├── patterns/
├── assets/
├── documentation/
├── tests/
├── decisions/
├── migrations/
└── changelog/
```

A estrutura técnica final será definida pela Arquitetura.

---

## 130. Registry

O registry deverá listar:

* identificador;
* nome;
* categoria;
* status;
* versão;
* owner;
* documentação;
* implementação;
* depreciação.

---

## 131. Catálogo

O catálogo futuro deverá permitir consultar:

* componentes;
* estados;
* variantes;
* exemplos;
* acessibilidade;
* API;
* status;
* changelog.

---

## 132. Decisões registradas

Mudanças estruturais deverão possuir registro de decisão.

Exemplos:

* adoção de tokens;
* biblioteca de ícones;
* estratégia de temas;
* arquitetura de componentes;
* política de distribuição.

---

# Parte XXIV — Automação

## 133. Automação recomendada

Poderão ser automatizados:

* lint de tokens;
* contraste;
* testes;
* regressão visual;
* documentação;
* changelog;
* validação de status;
* detecção de uso depreciado;
* atualização de catálogo.

---

## 134. Gates automáticos

Mudanças poderão ser bloqueadas por:

* testes falhando;
* lint;
* acessibilidade automatizada;
* documentação ausente;
* breaking change não declarado;
* token inexistente;
* uso depreciado proibido.

---

## 135. Limites da automação

Automação não substitui revisão humana de:

* usabilidade;
* clareza;
* semântica;
* conteúdo;
* acessibilidade real;
* impacto de produto.

---

# Parte XXV — Uso por agentes de IA

## 136. Papel dos agentes

Agentes poderão:

* sugerir componentes;
* gerar documentação;
* identificar inconsistências;
* produzir testes;
* propor migrações;
* localizar usos depreciados;
* gerar exemplos;
* auxiliar auditorias.

---

## 137. Restrições

Agentes não poderão:

* aprovar mudanças autonomamente;
* criar novo componente sem proposta;
* alterar status para Stable;
* remover componente;
* alterar token canônico sem revisão;
* ignorar acessibilidade;
* introduzir fork local silencioso.

---

## 138. Contexto obrigatório

Antes de gerar interface, o agente deverá consultar:

* Foundations;
* Component Library;
* UI Patterns;
* Governance;
* Wireframes;
* Interaction Specifications;
* Content Guidelines.

---

## 139. Saída esperada

Ao propor mudança, o agente deverá informar:

* elemento reutilizado;
* lacuna;
* justificativa;
* impacto;
* testes;
* acessibilidade;
* documentação afetada.

---

## 140. Registro

Contribuições assistidas por IA deverão permanecer sujeitas ao mesmo processo de revisão.

---

# Parte XXVI — Matriz de responsabilidade

## 141. Matriz RACI conceitual

| Atividade       | Experience | Frontend | QA  | Produto | Arquitetura |
| --------------- | ---------- | -------- | --- | ------- | ----------- |
| Novo fundamento | A/R        | C        | C   | C       | C           |
| Novo componente | A/R        | R        | C   | C       | C           |
| Implementação   | C          | A/R      | C   | I       | C           |
| Testes          | C          | C        | A/R | I       | C           |
| Acessibilidade  | A/R        | R        | R   | I       | C           |
| Novo padrão     | A/R        | C        | C   | R       | C           |
| Breaking change | A          | R        | C   | C       | R           |
| Depreciação     | A/R        | R        | C   | I       | C           |
| Publicação      | A          | R        | C   | I       | C           |

Legenda:

* `R`: Responsible;
* `A`: Accountable;
* `C`: Consulted;
* `I`: Informed.

---

# Parte XXVII — Priorização

## 142. Critérios

Itens poderão ser priorizados por:

* impacto;
* recorrência;
* acessibilidade;
* risco;
* adoção;
* dívida;
* esforço;
* dependências.

---

## 143. Prioridade crítica

* regressão;
* falha grave;
* acessibilidade;
* vulnerabilidade;
* quebra de produção;
* incompatibilidade.

---

## 144. Prioridade alta

* componente amplamente utilizado;
* bloqueio de fluxo;
* inconsistência relevante;
* migração necessária;
* dívida estrutural.

---

## 145. Prioridade média

* melhoria;
* nova variante;
* documentação;
* automação;
* padrão adicional.

---

## 146. Prioridade baixa

* refinamento;
* conveniência;
* exceção rara;
* melhoria sem impacto comprovado.

---

# Parte XXVIII — Critérios de aceite

## 147. Governança

* papéis estão definidos;
* decisões possuem níveis;
* fluxo de contribuição está documentado;
* aprovação possui critérios;
* exceções possuem controle.

---

## 148. Versionamento

* versionamento semântico está definido;
* changelog é obrigatório;
* breaking changes possuem migração;
* depreciação precede remoção.

---

## 149. Qualidade

* Definition of Ready existe;
* Definition of Done existe;
* testes são obrigatórios;
* acessibilidade é gate;
* documentação acompanha implementação.

---

## 150. Adoção

* componentes locais são monitorados;
* forks são controlados;
* métricas são definidas;
* migrações possuem processo;
* auditorias são previstas.

---

## 151. IA

* agentes seguem os mesmos critérios;
* aprovações continuam humanas;
* alterações canônicas exigem revisão;
* contexto documental é obrigatório;
* saídas permanecem rastreáveis.

---

# Parte XXIX — Checklist de contribuição

## 152. Antes de propor

* o problema é recorrente?
* existe solução atual?
* composição resolve?
* há evidência?
* há consumidores?
* acessibilidade foi considerada?
* impacto foi avaliado?

---

## 153. Antes de aprovar

* não há duplicação;
* a responsabilidade está clara;
* os estados estão definidos;
* responsividade está definida;
* conteúdo está definido;
* testes estão definidos;
* migração está definida;
* documentação está completa.

---

## 154. Antes de publicar

* implementação revisada;
* testes aprovados;
* acessibilidade validada;
* documentação atualizada;
* changelog atualizado;
* versão definida;
* registry atualizado;
* exemplos atualizados.

---

## 155. Antes de remover

* elemento depreciado;
* substituto estável;
* consumidores identificados;
* migração concluída;
* comunicação realizada;
* versão principal preparada;
* histórico preservado.

---

# Parte XXX — Checklist de revisão do documento

## 156. Verificações

Antes de aprovar este documento, verificar:

* escopo está definido;
* ownership está definido;
* papéis estão definidos;
* modelo de decisão está definido;
* contribuição está definida;
* critérios de entrada estão definidos;
* revisão está definida;
* maturidade está definida;
* versionamento está definido;
* compatibilidade está definida;
* depreciação está definida;
* documentação está definida;
* qualidade está definida;
* testes estão definidos;
* acessibilidade está definida;
* adoção está definida;
* métricas estão definidas;
* auditoria está definida;
* exceções estão definidas;
* incidentes estão definidos;
* segurança está contemplada;
* localização está contemplada;
* organização do repositório está contemplada;
* automação está contemplada;
* IA está contemplada;
* responsabilidades estão definidas;
* priorização está definida;
* critérios de aceite estão definidos.

---

## 157. Declaração final

A governança do Design System define como os fundamentos, componentes e padrões do RouteBook deverão evoluir.

Ela estabelece um modelo para:

* propor;
* revisar;
* aprovar;
* implementar;
* testar;
* documentar;
* publicar;
* migrar;
* depreciar;
* remover;
* auditar.

O Design System deverá ser tratado como um produto interno permanente, e não como um conjunto estático de componentes.

Sua evolução deverá preservar:

* consistência;
* acessibilidade;
* compatibilidade;
* qualidade;
* rastreabilidade;
* sustentabilidade;
* controle humano.

Com este documento, a documentação principal da Epic Design System está concluída.
