---

id: RB-PRD-008

title: Requisitos Não Funcionais
description: Define os atributos de qualidade, restrições operacionais e critérios de desempenho, acessibilidade, segurança, confiabilidade, privacidade e manutenção do RouteBook.

document_type: product
owner: Product

status: Draft
version: "0.1.0"

created: "2026-07-17"
last_updated: null

authors:

- RouteBook Team

tags:

- product
- non-functional-requirements
- quality
- performance
- accessibility
- security
- reliability

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

next_documents:

- RB-UX-001
- RB-UX-002
- RB-DOM-001
- RB-ARC-001
- RB-QA-001

ai_context:
priority: high
index: true
---

# RouteBook — Requisitos Não Funcionais

## 1. Propósito deste documento

Este documento define os Requisitos Não Funcionais do RouteBook.

Seu objetivo é estabelecer os atributos de qualidade que o produto deverá atender, independentemente das funcionalidades específicas implementadas.

Os Requisitos Funcionais definem o que o sistema deverá fazer.

Os Requisitos Não Funcionais definem como o sistema deverá se comportar enquanto executa essas funções.

Este documento deverá orientar:

* experiência do usuário;
* arquitetura;
* desenvolvimento;
* segurança;
* infraestrutura;
* observabilidade;
* qualidade;
* testes;
* operação;
* integração com serviços externos;
* decisões de evolução.

Os requisitos descritos aqui deverão ser refinados posteriormente em critérios técnicos mensuráveis, decisões arquiteturais, planos de teste e acordos operacionais.

---

## 2. Escopo dos Requisitos Não Funcionais

Este documento cobre:

* desempenho;
* responsividade;
* acessibilidade;
* usabilidade;
* segurança;
* privacidade;
* confiabilidade;
* disponibilidade;
* resiliência;
* recuperação;
* escalabilidade;
* compatibilidade;
* interoperabilidade;
* manutenibilidade;
* testabilidade;
* observabilidade;
* qualidade dos dados;
* qualidade de Recomendações;
* operação;
* internacionalização;
* localização;
* sustentabilidade técnica;
* dependências externas;
* continuidade da experiência.

---

## 3. Convenção de identificação

Os requisitos utilizarão o padrão:

```text
RB-NFR-XXX
```

Exemplo:

```text
RB-NFR-001 — Tempo de carregamento inicial
```

A numeração identifica o requisito e não representa necessariamente prioridade ou ordem de implementação.

---

## 4. Estrutura dos requisitos

Cada requisito poderá conter:

* identificador;
* título;
* declaração;
* objetivo;
* prioridade;
* classificação no MVP;
* métrica ou critério;
* contexto de medição;
* dependências;
* observações.

---

## 5. Classificação de prioridade

### Crítica

Necessária para segurança, integridade, acesso ou uso principal do produto.

### Alta

Necessária para uma experiência adequada e confiável.

### Média

Importante para sustentabilidade e evolução, mas pode ser refinada após o MVP.

### Baixa

Melhoria complementar ou futura.

---

## 6. Classificação no MVP

### Obrigatório

Deve ser atendido na primeira versão validável.

### Simplificado

Deve existir com metas iniciais proporcionais ao estágio do produto.

### Desejável

Pode ser incluído caso não comprometa o núcleo do MVP.

### Pós-MVP

Não é necessário para a primeira validação.

---

## 7. Princípios gerais de qualidade

Os Requisitos Não Funcionais deverão preservar os seguintes princípios:

1. A experiência móvel é prioritária.
2. O produto deverá permanecer utilizável quando integrações externas falharem parcialmente.
3. Informações essenciais não dependerão exclusivamente do Mapa.
4. Dados estimados deverão ser identificados.
5. Segurança e privacidade serão proporcionais aos dados tratados.
6. A arquitetura deverá permanecer simples e evolutiva.
7. O sistema deverá ser observável sem expor dados pessoais desnecessariamente.
8. O desempenho percebido é tão importante quanto o tempo absoluto.
9. O usuário deverá compreender falhas e caminhos de recuperação.
10. A qualidade deverá ser verificável por testes e métricas.

---

# Parte I — Desempenho

## 8. RB-NFR-001 — Tempo de carregamento inicial

### Declaração

A aplicação deverá apresentar sua estrutura principal em tempo compatível com uma experiência web moderna.

### Meta inicial

Em condições normais de rede e dispositivo:

* o conteúdo estrutural principal deverá aparecer em até 2,5 segundos;
* uma tela utilizável deverá estar disponível em até 4 segundos;
* recursos secundários poderão continuar carregando progressivamente.

### Prioridade

Alta.

### MVP

Obrigatório.

### Observação

O carregamento do Mapa ou de dados externos não deverá bloquear toda a interface.

---

## 9. RB-NFR-002 — Carregamento progressivo

### Declaração

A aplicação deverá carregar primeiro os elementos necessários para compreensão e ação imediata.

### Prioridade de carregamento

1. estrutura da tela;
2. dados internos da Viagem;
3. ações principais;
4. lista de Lugares;
5. Mapa;
6. fotografias;
7. dados complementares.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 10. RB-NFR-003 — Desempenho percebido

### Declaração

Operações não imediatas deverão fornecer retorno visual em até 300 milissegundos.

### Retornos possíveis

* Estado de carregamento;
* indicador de salvamento;
* esqueleto de conteúdo;
* mudança visual da ação;
* mensagem de processamento.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 11. RB-NFR-004 — Resposta a interações locais

### Declaração

Interações que não dependam de chamadas externas deverão produzir resposta visual imediata.

### Meta inicial

A resposta visual deverá ocorrer preferencialmente em até 100 milissegundos.

### Exemplos

* abrir menu;
* alternar aba;
* selecionar filtro;
* expandir cartão;
* reordenar item localmente;
* marcar Lugar como salvo antes da confirmação final.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 12. RB-NFR-005 — Tempo de pesquisa de Lugares

### Declaração

Pesquisas de Lugares deverão retornar um Estado de resultado, ausência ou erro em tempo aceitável.

### Meta inicial

* retorno inicial em até 3 segundos em condições normais;
* após 1 segundo, o usuário deverá visualizar Estado de carregamento;
* após tempo limite definido, deverá ser apresentada opção de nova tentativa.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 13. RB-NFR-006 — Tempo de cálculo de distância

### Declaração

Consultas de Distância e Tempo de deslocamento deverão possuir resposta previsível.

### Meta inicial

* resultado em até 3 segundos em condições normais;
* falha controlada quando o provedor não responder dentro do limite configurado;
* a interface não deverá permanecer bloqueada indefinidamente.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 14. RB-NFR-007 — Tempo de geração de proposta de Roteiro

### Declaração

A geração de uma proposta deverá apresentar feedback contínuo e concluir em tempo compatível com a complexidade da operação.

### Meta inicial

* indicação de processamento em até 300 milissegundos;
* conclusão preferencial em até 10 segundos;
* após esse período, a interface deverá continuar informando o estado;
* falha deverá permitir nova tentativa sem perda do Roteiro anterior.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 15. RB-NFR-008 — Paginação ou carregamento incremental

### Declaração

Listas extensas de Lugares não deverão ser carregadas integralmente quando isso comprometer desempenho.

### Estratégias permitidas

* paginação;
* carregamento incremental;
* virtualização;
* limite por área do mapa;
* carregamento sob demanda.

### Prioridade

Média.

### MVP

Simplificado.

---

## 16. RB-NFR-009 — Otimização de imagens

### Declaração

Fotografias deverão ser entregues em tamanho e formato adequados ao dispositivo e ao contexto.

### Requisitos

* evitar imagens maiores que o necessário;
* utilizar carregamento tardio;
* preservar proporção;
* fornecer versão de baixa resolução ou placeholder quando adequado;
* impedir que imagens bloqueiem conteúdo essencial.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 17. RB-NFR-010 — Controle de consultas externas

### Declaração

O sistema deverá evitar chamadas redundantes a provedores externos.

### Estratégias possíveis

* cache;
* deduplicação;
* reutilização de resultados;
* debounce;
* limites de atualização;
* consultas por Região.

### Prioridade

Alta.

### MVP

Obrigatório em forma básica.

---

## 18. RB-NFR-011 — Desempenho em dispositivos intermediários

### Declaração

Os fluxos críticos deverão permanecer utilizáveis em dispositivos móveis intermediários, não apenas em equipamentos de alta performance.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 19. RB-NFR-012 — Limite de bloqueio da interface

### Declaração

Nenhuma operação externa deverá bloquear toda a interface quando apenas uma parte da tela depender dela.

### Exemplo

Falha no Mapa não deverá impedir:

* consulta do Roteiro;
* edição de Atividades;
* visualização de Salvos;
* acesso às informações da Viagem.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte II — Responsividade e experiência multiplataforma

## 20. RB-NFR-013 — Aplicação web responsiva

### Declaração

O RouteBook deverá adaptar sua interface a diferentes tamanhos de tela.

### Contextos mínimos

* celular;
* tablet;
* notebook;
* desktop.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 21. RB-NFR-014 — Mobile-first

### Declaração

Os fluxos críticos deverão ser concebidos inicialmente para uso em dispositivos móveis.

### Fluxos prioritários

* consultar a Viagem;
* visualizar o Dia atual;
* abrir Detalhes;
* salvar Lugar;
* adicionar ao Roteiro;
* editar Atividade;
* consultar Distância;
* abrir rota externa.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 22. RB-NFR-015 — Paridade funcional essencial

### Declaração

Funcionalidades críticas não deverão existir apenas em desktop.

### Exceção

Interfaces de planejamento complexo poderão utilizar organização visual diferente em telas maiores, desde que permaneçam funcionalmente possíveis no celular.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 23. RB-NFR-016 — Adaptação de layout

### Declaração

A responsividade deverá adaptar a estrutura da interface, e não apenas reduzir dimensões.

### Exemplos

* mapa em painel alternável no celular;
* navegação inferior em dispositivos móveis;
* painel lateral em desktop;
* cartões empilhados;
* ações prioritárias fixadas.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 24. RB-NFR-017 — Alvos de toque

### Declaração

Controles interativos deverão possuir área de toque adequada.

### Meta inicial

Alvos principais deverão possuir aproximadamente 44 por 44 pixels CSS ou área equivalente.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 25. RB-NFR-018 — Uso em orientação vertical e horizontal

### Declaração

A aplicação deverá permanecer utilizável nas orientações vertical e horizontal quando suportadas pelo dispositivo.

### Prioridade

Média.

### MVP

Desejável.

---

## 26. RB-NFR-019 — Continuidade entre dispositivos

### Declaração

Quando o usuário acessar a mesma Viagem em dispositivos diferentes, deverá recuperar o último estado persistido.

### Prioridade

Alta.

### MVP

Obrigatório quando houver autenticação e persistência remota.

---

# Parte III — Acessibilidade

## 27. RB-NFR-020 — Referência de acessibilidade

### Declaração

O RouteBook deverá buscar conformidade com as diretrizes WCAG 2.2 no nível AA para os fluxos críticos.

### Prioridade

Crítica.

### MVP

Obrigatório de forma progressiva.

---

## 28. RB-NFR-021 — Navegação por teclado

### Declaração

Todas as ações críticas deverão ser realizáveis por teclado.

### Inclui

* navegação;
* formulários;
* filtros;
* abertura de painéis;
* seleção de Lugares;
* edição;
* salvamento;
* reordenação por alternativa ao arrastar.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 29. RB-NFR-022 — Ordem de foco

### Declaração

A ordem de foco deverá seguir uma sequência lógica e previsível.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 30. RB-NFR-023 — Foco visível

### Declaração

Todo elemento interativo deverá possuir indicação de foco claramente perceptível.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 31. RB-NFR-024 — Leitores de tela

### Declaração

A interface deverá fornecer estrutura semântica e rótulos adequados para tecnologias assistivas.

### Inclui

* títulos;
* regiões;
* botões;
* links;
* campos;
* mensagens;
* alertas;
* estados de carregamento;
* mudanças relevantes.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 32. RB-NFR-025 — Alternativa ao Mapa

### Declaração

Todas as informações e ações críticas do Mapa deverão possuir representação acessível em lista ou texto.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 33. RB-NFR-026 — Alternativa ao arrastar e soltar

### Declaração

A reorganização de Atividades deverá possuir controles alternativos.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 34. RB-NFR-027 — Contraste

### Declaração

Textos, ícones e controles deverão possuir contraste compatível com o nível AA das diretrizes adotadas.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 35. RB-NFR-028 — Informação não dependente de cor

### Declaração

Nenhuma informação deverá ser comunicada exclusivamente por cor.

### Exemplos

* estado salvo;
* conflito;
* categoria;
* seleção;
* erro;
* Hospedagem;
* Atividade planejada.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 36. RB-NFR-029 — Redimensionamento de texto

### Declaração

A aplicação deverá permanecer utilizável com ampliação de texto e zoom do navegador.

### Meta inicial

O conteúdo deverá permanecer funcional com zoom de até 200%, sem perda de informações essenciais.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 37. RB-NFR-030 — Texto alternativo para imagens

### Declaração

Imagens informativas deverão possuir texto alternativo adequado.

Imagens decorativas deverão ser ignoradas por tecnologias assistivas.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 38. RB-NFR-031 — Movimento reduzido

### Declaração

A interface deverá respeitar preferências de redução de movimento do sistema operacional.

### Prioridade

Média.

### MVP

Desejável.

---

## 39. RB-NFR-032 — Mensagens acessíveis

### Declaração

Mensagens de sucesso, erro, salvamento e atualização deverão ser perceptíveis por tecnologias assistivas.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 40. RB-NFR-033 — Linguagem compreensível

### Declaração

Textos de interface deverão utilizar linguagem clara e direta.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte IV — Usabilidade

## 41. RB-NFR-034 — Primeiro valor rápido

### Declaração

O usuário deverá perceber valor antes de concluir toda a configuração da Viagem.

### Critério inicial

Após informar Destino, Período e Hospedagem, o produto deverá apresentar:

* estrutura dos Dias;
* Localização de referência;
* Lugares iniciais ou caminho claro para Descoberta.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 42. RB-NFR-035 — Baixa carga inicial

### Declaração

O onboarding não deverá exigir dados opcionais antes da primeira entrega de valor.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 43. RB-NFR-036 — Consistência de navegação

### Declaração

Áreas, ações e termos equivalentes deverão manter comportamento e nomenclatura consistentes.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 44. RB-NFR-037 — Visibilidade do estado

### Declaração

O sistema deverá comunicar claramente:

* carregando;
* salvo;
* não salvo;
* erro;
* filtro ativo;
* Lugar salvo;
* Lugar planejado;
* proposta não confirmada.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 45. RB-NFR-038 — Prevenção de erros

### Declaração

A interface deverá prevenir erros previsíveis antes de sua confirmação.

### Exemplos

* datas inválidas;
* remoção com impacto;
* alteração do Destino;
* atividade duplicada;
* perda potencial de dados;
* conflito de horário.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 46. RB-NFR-039 — Recuperação de erros

### Declaração

Quando ocorrer um erro, o usuário deverá compreender:

* o que aconteceu;
* o impacto;
* o que pode fazer.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 47. RB-NFR-040 — Reversibilidade

### Declaração

Ações destrutivas ou automações relevantes deverão permitir cancelamento, edição ou reversão quando possível.

### Prioridade

Alta.

### MVP

Obrigatório para ações críticas.

---

## 48. RB-NFR-041 — Redução de etapas

### Declaração

Ações recorrentes deverão exigir o menor número razoável de etapas.

### Exemplos

* salvar Lugar;
* adicionar ao Roteiro;
* abrir rota;
* mover Atividade;
* alterar horário.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 49. RB-NFR-042 — Não exigir precisão artificial

### Declaração

O produto não deverá obrigar o usuário a fornecer horários, durações ou orçamentos exatos quando estimativas forem suficientes.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 50. RB-NFR-043 — Coerência entre lista, mapa e Roteiro

### Declaração

As diferentes visualizações deverão comunicar o mesmo estado funcional.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte V — Segurança

## 51. RB-NFR-044 — Segurança por padrão

### Declaração

O produto deverá adotar configurações seguras por padrão.

### Inclui

* acesso restrito aos dados do usuário;
* proteção de credenciais;
* validação de entradas;
* comunicação segura;
* permissões mínimas;
* dependências atualizadas.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 52. RB-NFR-045 — Comunicação criptografada

### Declaração

Toda comunicação entre cliente, aplicação e serviços deverá utilizar transporte criptografado em produção.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 53. RB-NFR-046 — Proteção de credenciais

### Declaração

Credenciais, tokens e chaves de provedores não deverão ser armazenados em código-fonte público ou enviados ao cliente quando não forem destinados a uso público.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 54. RB-NFR-047 — Validação de entrada

### Declaração

Dados recebidos deverão ser validados no limite apropriado da aplicação.

### Exemplos

* datas;
* quantidade de Viajantes;
* identificadores;
* textos;
* URLs;
* coordenadas;
* filtros;
* parâmetros externos.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 55. RB-NFR-048 — Proteção contra injeção

### Declaração

A aplicação deverá prevenir ataques de injeção em consultas, comandos, conteúdo e integrações.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 56. RB-NFR-049 — Proteção contra conteúdo malicioso

### Declaração

Conteúdo fornecido por usuários ou fontes externas deverá ser tratado de forma segura antes da renderização.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 57. RB-NFR-050 — Controle de acesso

### Declaração

Somente usuários autorizados deverão acessar ou alterar uma Viagem privada.

### Prioridade

Crítica.

### MVP

Obrigatório quando houver contas de usuário.

---

## 58. RB-NFR-051 — Princípio do menor privilégio

### Declaração

Usuários, serviços e integrações deverão receber apenas as permissões necessárias.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 59. RB-NFR-052 — Sessões seguras

### Declaração

Quando houver autenticação, sessões deverão ser protegidas contra:

* roubo;
* reutilização indevida;
* expiração inadequada;
* exposição em armazenamento inseguro.

### Prioridade

Crítica.

### MVP

Obrigatório quando aplicável.

---

## 60. RB-NFR-053 — Dependências seguras

### Declaração

Dependências com vulnerabilidades críticas conhecidas não deverão permanecer sem tratamento em versões de produção.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 61. RB-NFR-054 — Registro seguro

### Declaração

Logs não deverão conter:

* senhas;
* tokens;
* chaves;
* informações pessoais desnecessárias;
* conteúdo sensível integral.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 62. RB-NFR-055 — Tratamento de incidentes

### Declaração

O projeto deverá possuir processo proporcional para:

* identificar incidentes;
* limitar impacto;
* corrigir;
* registrar aprendizado;
* comunicar quando necessário.

### Prioridade

Média.

### MVP

Simplificado.

---

# Parte VI — Privacidade e proteção de dados

## 63. RB-NFR-056 — Minimização de dados

### Declaração

O RouteBook deverá coletar somente dados necessários para a experiência e operação.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 64. RB-NFR-057 — Finalidade explícita

### Declaração

Dados pessoais e contextuais deverão possuir finalidade definida.

### Exemplos

* Hospedagem para Distância;
* Restrições para Recomendações;
* Localização atual para opções próximas;
* e-mail para autenticação.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 65. RB-NFR-058 — Consentimento para Localização atual

### Declaração

A Localização atual somente poderá ser utilizada após autorização explícita do usuário.

### Prioridade

Crítica.

### MVP

Obrigatório quando o recurso existir.

---

## 66. RB-NFR-059 — Funcionamento sem Localização atual

### Declaração

A recusa de acesso à Localização atual não deverá bloquear a experiência principal.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 67. RB-NFR-060 — Transparência sobre dados

### Declaração

O usuário deverá compreender quais dados são utilizados e para qual finalidade.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 68. RB-NFR-061 — Exclusão de dados

### Declaração

Quando houver conta e persistência pessoal, o usuário deverá conseguir solicitar ou realizar a exclusão de seus dados conforme as regras aplicáveis.

### Prioridade

Alta.

### MVP

Simplificado quando houver autenticação.

---

## 69. RB-NFR-062 — Retenção proporcional

### Declaração

Dados não deverão ser mantidos por período superior ao necessário sem justificativa.

### Prioridade

Média.

### MVP

Simplificado.

---

## 70. RB-NFR-063 — Compartilhamento controlado

### Declaração

Dados de uma Viagem privada não deverão ser compartilhados publicamente por padrão.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 71. RB-NFR-064 — Dados pessoais em provedores externos

### Declaração

A aplicação deverá evitar enviar dados pessoais desnecessários para provedores externos.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 72. RB-NFR-065 — Adequação à legislação aplicável

### Declaração

O tratamento de dados deverá considerar a legislação aplicável ao contexto de operação, incluindo a LGPD quando pertinente.

### Prioridade

Crítica.

### MVP

Obrigatório de forma proporcional.

---

# Parte VII — Confiabilidade

## 73. RB-NFR-066 — Consistência dos dados da Viagem

### Declaração

O estado persistido da Viagem deverá permanecer válido e coerente.

### Exemplos

* Atividades pertencem a Dias válidos;
* Salvos não são duplicados;
* ordem das Atividades é preservada;
* remoções não produzem referências inválidas.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 74. RB-NFR-067 — Persistência confiável

### Declaração

Alterações confirmadas não deverão ser perdidas silenciosamente.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 75. RB-NFR-068 — Confirmação de salvamento

### Declaração

O sistema deverá distinguir claramente:

* salvamento em andamento;
* salvamento concluído;
* falha no salvamento.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 76. RB-NFR-069 — Idempotência de operações críticas

### Declaração

Repetir uma operação devido a falha ou nova tentativa não deverá criar duplicações indevidas.

### Exemplos

* salvar Lugar;
* criar associação;
* aceitar proposta;
* persistir Atividade.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 77. RB-NFR-070 — Integridade entre visualizações

### Declaração

Lista, Mapa, Salvos e Roteiro deverão representar o mesmo estado persistido ou pendente claramente identificado.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 78. RB-NFR-071 — Estado válido após falha

### Declaração

Após uma falha, o sistema deverá retornar a um estado conhecido e utilizável.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 79. RB-NFR-072 — Ausência de corrupção silenciosa

### Declaração

Quando os dados não puderem ser interpretados ou recuperados com segurança, o sistema deverá informar o problema em vez de assumir valores arbitrários.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 80. RB-NFR-073 — Atualizações externas não apagam decisões internas

### Declaração

Mudanças em dados de provedores não deverão remover silenciosamente:

* Lugares salvos;
* Atividades;
* observações;
* escolhas;
* ordem do Roteiro.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte VIII — Disponibilidade e resiliência

## 81. RB-NFR-074 — Disponibilidade inicial

### Declaração

A aplicação deverá possuir disponibilidade compatível com um produto pessoal em validação.

### Meta inicial

Não será exigido SLA comercial no MVP.

Entretanto:

* a aplicação deverá estar disponível durante os períodos planejados de teste;
* indisponibilidades conhecidas deverão ser tratadas;
* falhas críticas deverão possuir caminho de recuperação.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 82. RB-NFR-075 — Degradação controlada

### Declaração

A falha de uma capacidade externa deverá degradar apenas os recursos dependentes.

### Exemplos

* sem Mapa: manter lista e Roteiro;
* sem rotas: manter endereços e Lugares;
* sem IA: manter regras determinísticas;
* sem fotografias: manter conteúdo textual.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 83. RB-NFR-076 — Timeouts

### Declaração

Chamadas externas deverão possuir limites de tempo configurados.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 84. RB-NFR-077 — Novas tentativas controladas

### Declaração

Falhas temporárias poderão gerar novas tentativas automáticas ou manuais, sem criar carga excessiva ou duplicações.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 85. RB-NFR-078 — Circuit breaker ou proteção equivalente

### Declaração

Integrações instáveis deverão possuir mecanismo que evite chamadas repetidas sem benefício.

### Prioridade

Média.

### MVP

Desejável.

---

## 86. RB-NFR-079 — Cache de dados externos

### Declaração

Dados externos reutilizáveis poderão ser armazenados temporariamente para reduzir dependência e custo.

### Condições

* respeitar termos do provedor;
* manter contexto de atualização;
* não apresentar dado antigo como atual sem indicação;
* permitir invalidação.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 87. RB-NFR-080 — Recuperação após reinício

### Declaração

O reinício de componentes da aplicação não deverá causar perda de dados já persistidos.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 88. RB-NFR-081 — Continuidade durante falha parcial

### Declaração

O usuário deverá conseguir continuar tarefas não afetadas por uma falha parcial.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte IX — Recuperação e continuidade

## 89. RB-NFR-082 — Backups

### Declaração

Dados persistidos relevantes deverão possuir estratégia de backup proporcional ao estágio do produto.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 90. RB-NFR-083 — Restauração testável

### Declaração

A existência de backup não será suficiente; o processo de restauração deverá ser conhecido e testável.

### Prioridade

Média.

### MVP

Desejável.

---

## 91. RB-NFR-084 — Objetivo de perda de dados

### Declaração

O projeto deverá definir posteriormente um Recovery Point Objective compatível com a criticidade dos dados.

### Meta inicial

No MVP, alterações confirmadas pelo usuário não deverão depender apenas de memória local temporária.

### Prioridade

Alta.

### MVP

Obrigatório em princípio.

---

## 92. RB-NFR-085 — Objetivo de recuperação

### Declaração

O projeto deverá definir posteriormente um Recovery Time Objective para falhas de produção.

### Prioridade

Média.

### MVP

Pós-validação.

---

## 93. RB-NFR-086 — Exportação futura

### Declaração

A arquitetura deverá evitar impedir uma futura capacidade de exportar dados da Viagem.

### Prioridade

Baixa.

### MVP

Pós-MVP.

---

# Parte X — Escalabilidade

## 94. RB-NFR-087 — Escalabilidade proporcional

### Declaração

A arquitetura deverá suportar crescimento gradual sem antecipar escala não validada.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 95. RB-NFR-088 — Ausência de microsserviços prematuros

### Declaração

O projeto não deverá adotar distribuição complexa apenas por expectativa futura de escala.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 96. RB-NFR-089 — Componentes sem estado quando adequado

### Declaração

Serviços de aplicação deverão evitar estado local permanente quando isso impedir escalabilidade ou recuperação.

### Prioridade

Média.

### MVP

Desejável.

---

## 97. RB-NFR-090 — Escala de consultas externas

### Declaração

O crescimento do uso não deverá resultar em aumento descontrolado de chamadas externas.

### Estratégias

* cache;
* limites;
* agregação;
* reutilização;
* monitoramento de custo.

### Prioridade

Alta.

### MVP

Obrigatório em forma básica.

---

## 98. RB-NFR-091 — Escala de dados por Viagem

### Declaração

Uma Viagem deverá suportar quantidade razoável de:

* Dias;
* Lugares salvos;
* Atividades;
* resultados;
* observações;

sem degradação significativa.

### Meta inicial de referência

O sistema deverá permanecer utilizável com:

* até 30 Dias da Viagem;
* até 500 Lugares salvos;
* até 300 Atividades;
* até 1.000 resultados exploráveis por carregamento incremental.

Esses valores são referências iniciais e deverão ser validados.

### Prioridade

Média.

### MVP

Simplificado.

---

# Parte XI — Compatibilidade

## 99. RB-NFR-092 — Navegadores suportados

### Declaração

O RouteBook deverá funcionar nas versões atuais dos principais navegadores modernos.

### Prioridade inicial

* Google Chrome;
* Microsoft Edge;
* Safari;
* Firefox.

### Política

Suportar versões recentes com uso significativo, conforme definição técnica posterior.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 100. RB-NFR-093 — Dispositivos móveis

### Declaração

A aplicação deverá ser validada em navegadores móveis Android e iOS.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 101. RB-NFR-094 — Ausência de dependência exclusiva de recurso experimental

### Declaração

Fluxos críticos não deverão depender exclusivamente de APIs experimentais ou de suporte restrito.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 102. RB-NFR-095 — Fuso horário

### Declaração

Datas e horários da Viagem deverão considerar o fuso associado ao Destino.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 103. RB-NFR-096 — Formatos locais

### Declaração

A aplicação deverá apresentar datas, horários, números e moedas conforme a localização configurada.

### MVP inicial

* português do Brasil;
* formato de data brasileiro;
* Real brasileiro como moeda padrão no cenário inicial.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte XII — Interoperabilidade e integrações

## 104. RB-NFR-097 — Encapsulamento de provedores

### Declaração

Integrações externas deverão ser encapsuladas por contratos internos claros.

### Objetivo

Evitar que o domínio dependa diretamente de:

* formato;
* terminologia;
* identificadores;
* limitações;

de um fornecedor específico.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 105. RB-NFR-098 — Tratamento de versões de API

### Declaração

Mudanças de versão de provedores deverão ser controladas e testadas antes da adoção.

### Prioridade

Média.

### MVP

Simplificado.

---

## 106. RB-NFR-099 — Limites de uso

### Declaração

O sistema deverá conhecer e respeitar limites de:

* requisições;
* cotas;
* custos;
* armazenamento;
* licenciamento;
* atribuição.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 107. RB-NFR-100 — Identificação de origem

### Declaração

Dados externos deverão manter referência suficiente para rastrear sua origem.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 108. RB-NFR-101 — Normalização de dados

### Declaração

Dados provenientes de diferentes fontes deverão ser convertidos para modelos internos consistentes.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 109. RB-NFR-102 — Isolamento de falhas

### Declaração

Falhas em uma integração não deverão provocar falha generalizada em capacidades não relacionadas.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 110. RB-NFR-103 — Substituição de provedor

### Declaração

A arquitetura deverá permitir substituição de Provedor sem exigir reescrita completa do domínio.

### Observação

Isso não exige suportar múltiplos provedores simultaneamente no MVP.

### Prioridade

Alta.

### MVP

Obrigatório como princípio arquitetural.

---

# Parte XIII — Manutenibilidade

## 111. RB-NFR-104 — Modularidade

### Declaração

O código deverá ser organizado por responsabilidades claras.

### Áreas iniciais

* domínio;
* mapas;
* Recomendações;
* Travel Engine;
* interface;
* aplicação web.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 112. RB-NFR-105 — Baixo acoplamento

### Declaração

Módulos deverão depender de contratos e conceitos estáveis, evitando dependência desnecessária de detalhes internos.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 113. RB-NFR-106 — Alta coesão

### Declaração

Cada módulo deverá concentrar responsabilidades relacionadas.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 114. RB-NFR-107 — Clareza de código

### Declaração

O código deverá priorizar legibilidade, nomes compreensíveis e estruturas previsíveis.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 115. RB-NFR-108 — Documentação próxima da decisão

### Declaração

Decisões importantes deverão ser documentadas em local versionado e rastreável.

### Exemplos

* documentação oficial;
* ADRs;
* contratos;
* comentários apenas quando necessários;
* changelog.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 116. RB-NFR-109 — Ausência de duplicação conceitual

### Declaração

O mesmo conceito de domínio não deverá ser modelado de formas incompatíveis em diferentes módulos.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 117. RB-NFR-110 — Evolução segura

### Declaração

Alterações deverão poder ser introduzidas sem quebrar silenciosamente comportamentos existentes.

### Estratégias

* testes;
* versionamento;
* contratos;
* migrações;
* revisão;
* integração contínua.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 118. RB-NFR-111 — Configuração externalizada

### Declaração

Configurações variáveis por ambiente não deverão ficar codificadas diretamente na lógica.

### Exemplos

* URLs;
* chaves;
* limites;
* timeouts;
* flags;
* ambientes.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 119. RB-NFR-112 — Dependências justificadas

### Declaração

Novas dependências deverão possuir finalidade clara e custo de manutenção aceitável.

### Prioridade

Média.

### MVP

Obrigatório como prática.

---

# Parte XIV — Testabilidade e qualidade

## 120. RB-NFR-113 — Testabilidade

### Declaração

A arquitetura e o código deverão permitir testes isolados e integrados sem dependência obrigatória de todos os serviços externos.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 121. RB-NFR-114 — Testes unitários

### Declaração

Regras de negócio e lógica determinística deverão possuir testes unitários adequados.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 122. RB-NFR-115 — Testes de integração

### Declaração

Integrações internas e externas relevantes deverão possuir testes de contrato ou integração.

### Prioridade

Alta.

### MVP

Obrigatório em forma proporcional.

---

## 123. RB-NFR-116 — Testes ponta a ponta

### Declaração

As jornadas críticas do MVP deverão possuir testes ponta a ponta.

### Jornadas mínimas

* criar e retomar Viagem;
* explorar e salvar Lugar;
* adicionar e editar Roteiro;
* consultar Mapa e Distância;
* persistir alterações.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 124. RB-NFR-117 — Testes de acessibilidade

### Declaração

Fluxos críticos deverão possuir verificações automatizadas e manuais de acessibilidade.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 125. RB-NFR-118 — Testes responsivos

### Declaração

Fluxos críticos deverão ser validados em diferentes larguras e dispositivos.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 126. RB-NFR-119 — Testes de falha

### Declaração

O sistema deverá ser testado com falhas simuladas de:

* Mapa;
* pesquisa;
* Distância;
* persistência;
* IA;
* carregamento parcial.

### Prioridade

Alta.

### MVP

Obrigatório em cenários principais.

---

## 127. RB-NFR-120 — Dados de teste controlados

### Declaração

Testes deverão utilizar dados previsíveis, sem depender exclusivamente de resultados dinâmicos de produção.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 128. RB-NFR-121 — Qualidade antes da implantação

### Declaração

Alterações não deverão ser implantadas sem validações mínimas automatizadas.

### Validações possíveis

* lint;
* tipagem;
* testes;
* build;
* segurança;
* acessibilidade;
* análise de dependências.

### Prioridade

Alta.

### MVP

Obrigatório.

---

# Parte XV — Observabilidade

## 129. RB-NFR-122 — Logs estruturados

### Declaração

Eventos operacionais relevantes deverão ser registrados de forma estruturada.

### Exemplos

* falha de integração;
* falha de persistência;
* geração de Roteiro;
* tempo de resposta;
* erro inesperado.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 130. RB-NFR-123 — Identificadores de correlação

### Declaração

Operações distribuídas ou compostas deverão possuir identificadores que permitam rastrear uma solicitação entre componentes.

### Prioridade

Média.

### MVP

Desejável.

---

## 131. RB-NFR-124 — Métricas operacionais

### Declaração

O sistema deverá permitir acompanhar métricas como:

* latência;
* taxa de erro;
* uso de integrações;
* falhas de persistência;
* tempo de geração;
* disponibilidade;
* consumo de cotas.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 132. RB-NFR-125 — Monitoramento de custos externos

### Declaração

O uso de serviços pagos deverá ser mensurável.

### Prioridade

Alta.

### MVP

Obrigatório quando houver serviços pagos.

---

## 133. RB-NFR-126 — Alertas operacionais

### Declaração

Falhas críticas ou consumo anormal deverão gerar alertas para responsáveis pelo produto.

### Prioridade

Média.

### MVP

Simplificado.

---

## 134. RB-NFR-127 — Rastreamento de erros

### Declaração

Erros inesperados de cliente e servidor deverão ser capturados com contexto suficiente para diagnóstico, sem exposição indevida de dados.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 135. RB-NFR-128 — Privacidade na observabilidade

### Declaração

Logs, métricas e rastros deverão minimizar dados pessoais.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte XVI — Qualidade dos dados

## 136. RB-NFR-129 — Origem conhecida

### Declaração

Dados externos relevantes deverão possuir origem identificável internamente.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 137. RB-NFR-130 — Atualização conhecida

### Declaração

Quando possível, informações instáveis deverão possuir registro de quando foram obtidas ou atualizadas.

### Exemplos

* horário;
* preço;
* rota;
* avaliação;
* fotografia;
* disponibilidade.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 138. RB-NFR-131 — Dados estimados identificados

### Declaração

Estimativas deverão ser diferenciadas de dados confirmados.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 139. RB-NFR-132 — Ausência explícita

### Declaração

A ausência de um dado deverá ser representada explicitamente, e não substituída por valor arbitrário.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 140. RB-NFR-133 — Deduplicação

### Declaração

O sistema deverá reduzir duplicações de Lugares quando houver evidência suficiente de identidade comum.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 141. RB-NFR-134 — Validação de coordenadas

### Declaração

Coordenadas deverão ser validadas antes de uso em Mapa ou cálculo.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 142. RB-NFR-135 — Inconsistência entre fontes

### Declaração

Quando fontes divergirem em informação relevante, o sistema deverá evitar apresentar certeza artificial.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 143. RB-NFR-136 — Expiração de cache

### Declaração

Dados dinâmicos armazenados em cache deverão possuir política de expiração apropriada.

### Prioridade

Média.

### MVP

Simplificado.

---

# Parte XVII — Qualidade de Recomendações e IA

## 144. RB-NFR-137 — Recomendações fundamentadas

### Declaração

Recomendações deverão ser baseadas em dados ou critérios identificáveis.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 145. RB-NFR-138 — Ausência de alucinação factual

### Declaração

Componentes de IA não deverão inventar:

* preços;
* horários;
* avaliações;
* endereços;
* Distâncias;
* disponibilidade;
* características do Lugar.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 146. RB-NFR-139 — Separação entre geração e fatos

### Declaração

Conteúdo gerado deverá ser distinguível dos dados estruturados utilizados como base.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 147. RB-NFR-140 — Justificativas coerentes

### Declaração

A Justificativa da recomendação deverá refletir os critérios realmente utilizados.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 148. RB-NFR-141 — Reprodutibilidade de regras determinísticas

### Declaração

Com as mesmas entradas, regras determinísticas deverão produzir o mesmo resultado.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 149. RB-NFR-142 — Avaliação de qualidade de Recomendações

### Declaração

O projeto deverá definir critérios para avaliar:

* relevância;
* adequação;
* diversidade;
* respeito a Restrições;
* consistência;
* utilidade das Justificativas.

### Prioridade

Alta.

### MVP

Simplificado.

---

## 150. RB-NFR-143 — Controle humano

### Declaração

O usuário deverá poder rejeitar, alterar ou ignorar resultados gerados por IA.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 151. RB-NFR-144 — Falha de IA não bloqueia o núcleo

### Declaração

A indisponibilidade do Provedor de Inteligência Artificial não deverá impedir:

* criação da Viagem;
* Exploração básica;
* Salvos;
* edição do Roteiro;
* consulta de dados existentes.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

## 152. RB-NFR-145 — Proteção de dados em prompts

### Declaração

Somente dados necessários deverão ser enviados a provedores de IA.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte XVIII — Operação

## 153. RB-NFR-146 — Ambientes separados

### Declaração

O projeto deverá possuir separação adequada entre ambientes.

### Ambientes mínimos

* desenvolvimento;
* teste ou homologação;
* produção.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 154. RB-NFR-147 — Configuração por ambiente

### Declaração

Cada ambiente deverá possuir configurações próprias para:

* serviços;
* credenciais;
* bancos;
* logs;
* limites;
* funcionalidades experimentais.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 155. RB-NFR-148 — Implantação reproduzível

### Declaração

A implantação deverá ser executável de forma previsível e documentada.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 156. RB-NFR-149 — Rollback

### Declaração

O processo de implantação deverá permitir retorno a uma versão estável quando necessário.

### Prioridade

Média.

### MVP

Desejável.

---

## 157. RB-NFR-150 — Migrações controladas

### Declaração

Mudanças na persistência deverão utilizar migrações versionadas e reversíveis quando possível.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 158. RB-NFR-151 — Feature flags

### Declaração

Funcionalidades experimentais ou de alto risco poderão utilizar mecanismos de ativação controlada.

### Prioridade

Média.

### MVP

Desejável.

---

## 159. RB-NFR-152 — Segredos por ambiente

### Declaração

Credenciais deverão ser gerenciadas separadamente por ambiente.

### Prioridade

Crítica.

### MVP

Obrigatório.

---

# Parte XIX — Internacionalização e localização

## 160. RB-NFR-153 — Idioma inicial

### Declaração

O MVP poderá utilizar português do Brasil como idioma único.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 161. RB-NFR-154 — Textos desacoplados

### Declaração

Textos de interface deverão ser organizados de forma que não impeça futura internacionalização.

### Prioridade

Média.

### MVP

Desejável.

---

## 162. RB-NFR-155 — Datas e horários localizados

### Declaração

Datas e horários deverão ser apresentados conforme a localidade da Viagem e a preferência do usuário quando disponível.

### Prioridade

Alta.

### MVP

Obrigatório em português do Brasil.

---

## 163. RB-NFR-156 — Moeda localizada

### Declaração

Valores deverão indicar a moeda utilizada.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 164. RB-NFR-157 — Unidades de medida

### Declaração

Distâncias deverão utilizar unidades adequadas ao contexto.

### MVP inicial

* metros para pequenas Distâncias;
* quilômetros para Distâncias maiores.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 165. RB-NFR-158 — Fuso horário da Viagem

### Declaração

O fuso horário deverá estar associado ao Destino ou configurado na Viagem.

### Prioridade

Alta.

### MVP

Simplificado.

---

# Parte XX — Sustentabilidade técnica

## 166. RB-NFR-159 — Complexidade proporcional

### Declaração

A solução deverá permanecer proporcional ao estágio e ao uso real do produto.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 167. RB-NFR-160 — Evitar infraestrutura prematura

### Declaração

Infraestrutura complexa não deverá ser criada apenas para cenários hipotéticos.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 168. RB-NFR-161 — Controle de custo

### Declaração

Decisões técnicas deverão considerar custo operacional.

### Áreas críticas

* mapas;
* Lugares;
* rotas;
* IA;
* armazenamento;
* imagens;
* observabilidade.

### Prioridade

Alta.

### MVP

Obrigatório.

---

## 169. RB-NFR-162 — Eficiência de processamento

### Declaração

A aplicação deverá evitar processamento, transferência e armazenamento desnecessários.

### Prioridade

Média.

### MVP

Obrigatório como prática.

---

## 170. RB-NFR-163 — Remoção de recursos obsoletos

### Declaração

Código, dependências e configurações sem uso deverão ser removidos quando sua manutenção não for justificada.

### Prioridade

Média.

### MVP

Contínuo.

---

# Parte XXI — Métricas iniciais de qualidade

## 171. Desempenho

Métricas possíveis:

* tempo de carregamento inicial;
* Largest Contentful Paint;
* Interaction to Next Paint;
* tempo de pesquisa;
* tempo de cálculo;
* tempo de geração;
* tamanho de recursos;
* quantidade de chamadas externas.

---

## 172. Confiabilidade

Métricas possíveis:

* taxa de erro;
* falhas de salvamento;
* duplicações;
* inconsistências entre visualizações;
* tentativas de recuperação;
* perda de sessão;
* falhas de carregamento parcial.

---

## 173. Integrações

Métricas possíveis:

* latência por Provedor;
* taxa de timeout;
* consumo de cota;
* custo;
* uso de cache;
* falhas por endpoint.

---

## 174. Acessibilidade

Métricas possíveis:

* erros automatizados;
* fluxos concluídos por teclado;
* problemas de contraste;
* falhas de foco;
* problemas com leitores de tela;
* conformidade dos componentes.

---

## 175. Qualidade de Recomendações

Métricas possíveis:

* Recomendações aceitas;
* Recomendações ignoradas;
* violações de Restrições;
* justificativas inconsistentes;
* salvamento de Lugares recomendados;
* inclusão no Roteiro.

---

## 176. Operação

Métricas possíveis:

* disponibilidade;
* implantações;
* rollback;
* incidentes;
* tempo de recuperação;
* vulnerabilidades;
* custo por ambiente.

---

# Parte XXII — Matriz de prioridade do MVP

## 177. Requisitos críticos

Os requisitos críticos do MVP incluem:

* desempenho básico;
* mobile-first;
* responsividade;
* acessibilidade dos fluxos críticos;
* segurança de comunicação;
* proteção de credenciais;
* consistência e persistência;
* degradação controlada;
* alternativa ao Mapa;
* validação de entrada;
* rastreabilidade de dados;
* controle do usuário sobre IA;
* compatibilidade móvel;
* testes das jornadas críticas.

---

## 178. Requisitos simplificados

Poderão ser entregues inicialmente de forma simplificada:

* métricas avançadas;
* backups automatizados complexos;
* circuit breaker;
* escalabilidade ampla;
* múltiplos idiomas;
* observabilidade distribuída;
* feature flags;
* avaliação avançada de IA;
* recuperação operacional formal.

---

## 179. Requisitos pós-MVP

Poderão ficar para fases posteriores:

* SLA comercial;
* suporte offline;
* internacionalização completa;
* múltiplas moedas;
* colaboração em tempo real;
* infraestrutura multi-região;
* alta disponibilidade avançada;
* exportação de dados;
* testes de carga de larga escala.

---

# Parte XXIII — Critérios de aceitação gerais

## 180. Requisito mensurável

Sempre que possível, um Requisito Não Funcional deverá possuir:

* métrica;
* ambiente;
* carga;
* dispositivo;
* limite;
* método de validação.

---

## 181. Critério proporcional

Metas deverão considerar o estágio do produto.

A ausência de escala comercial não elimina a necessidade de:

* segurança básica;
* acessibilidade;
* consistência;
* tratamento de erros;
* desempenho adequado;
* observabilidade mínima.

---

## 182. Critério de dispositivo

Requisitos de desempenho e responsividade deverão ser medidos em dispositivos e condições realistas.

---

## 183. Critério de rede

Testes móveis deverão considerar:

* rede estável;
* rede lenta;
* latência elevada;
* interrupção parcial;
* retorno da conexão.

---

## 184. Critério de integração

Integrações deverão ser testadas para:

* sucesso;
* erro;
* timeout;
* limite de cota;
* resposta inválida;
* resposta parcial.

---

## 185. Critério de acessibilidade

A validação não deverá depender apenas de ferramentas automáticas.

Também deverão existir verificações manuais dos fluxos críticos.

---

## 186. Critério de segurança

Controles críticos deverão ser verificados antes da implantação em produção.

---

# Parte XXIV — Relação com documentos posteriores

## 187. Arquitetura da Informação

Deverá utilizar os requisitos de:

* usabilidade;
* responsividade;
* acessibilidade;
* continuidade;
* consistência.

---

## 188. UX e fluxos

Deverão detalhar:

* feedback;
* prevenção de erro;
* Estados vazios;
* recuperação;
* navegação móvel;
* alternativas ao Mapa.

---

## 189. Domínio

Deverá preservar:

* integridade;
* identidade;
* consistência;
* independência de Provedor;
* estados válidos.

---

## 190. Arquitetura técnica

Deverá detalhar:

* segurança;
* persistência;
* integrações;
* cache;
* resiliência;
* observabilidade;
* implantação;
* escalabilidade.

---

## 191. Estratégia de qualidade

Deverá definir:

* níveis de teste;
* automação;
* ambientes;
* métricas;
* critérios de saída;
* testes não funcionais.

---

## 192. Design System

Deverá incorporar:

* contraste;
* foco;
* responsividade;
* alvos de toque;
* movimento reduzido;
* componentes acessíveis.

---

# Parte XXV — Governança

## 193. Inclusão de novo requisito

Um novo Requisito Não Funcional deverá ser criado quando:

* definir atributo de qualidade relevante;
* estabelecer restrição operacional;
* possuir impacto transversal;
* puder ser verificado;
* não estiver coberto por requisito existente.

---

## 194. Alteração de requisito

Um requisito deverá ser revisado quando:

* o MVP mudar;
* a arquitetura mudar;
* novos riscos forem identificados;
* métricas reais estiverem disponíveis;
* um Provedor alterar limitações;
* testes demonstrarem meta inadequada;
* o produto entrar em nova fase.

---

## 195. Descontinuação

Requisitos utilizados por arquitetura, testes ou operação não deverão ser removidos sem histórico.

Eles deverão ser:

* substituídos;
* marcados como `Deprecated`;
* movidos para pós-MVP;
* registrados no histórico.

---

## 196. Responsabilidade

A manutenção deste documento pertence à área de Produto, com participação de:

* arquitetura;
* engenharia;
* segurança;
* qualidade;
* experiência;
* dados;
* operação.

---

## 197. Uso por agentes de IA

Agentes de IA que projetem ou implementem funcionalidades deverão:

* verificar requisitos funcionais e não funcionais relacionados;
* não priorizar velocidade sobre segurança ou integridade;
* preservar acessibilidade;
* considerar falhas externas;
* evitar introduzir dependências desnecessárias;
* manter observabilidade;
* registrar decisões que alterem metas.

---

## 198. Checklist de revisão

Antes de aprovar este documento, verificar:

* os requisitos possuem identificadores únicos;
* metas iniciais são proporcionais ao MVP;
* desempenho móvel está contemplado;
* acessibilidade está contemplada;
* segurança está contemplada;
* privacidade está contemplada;
* confiabilidade está contemplada;
* falhas externas estão contempladas;
* persistência está contemplada;
* observabilidade está contemplada;
* qualidade de dados está contemplada;
* IA está contemplada;
* compatibilidade está contemplada;
* manutenção está contemplada;
* testes estão contemplados;
* nenhum requisito define tecnologia sem necessidade;
* a terminologia segue o Glossário.

---

## 199. Declaração final

Os Requisitos Não Funcionais definem a qualidade mínima necessária para que o RouteBook seja confiável, utilizável e sustentável.

O produto não será considerado adequado apenas por executar suas funcionalidades.

Ele deverá também:

* responder em tempo aceitável;
* funcionar em celular;
* ser acessível;
* proteger dados;
* preservar decisões;
* lidar com falhas;
* manter consistência;
* explicar limitações;
* permitir manutenção;
* suportar evolução.

Esses atributos deverão fazer parte da definição do produto desde o início, e não ser tratados como melhorias opcionais adicionadas após a implementação.
