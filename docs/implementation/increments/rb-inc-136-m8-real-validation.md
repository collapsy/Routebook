---
id: RB-INC-136
title: Validação Real do MVP em Pipa — M8
description: Define e executa o protocolo de validação real do MVP do RouteBook no cenário pessoal de Pipa, separando preparação pré-viagem de evidência humana observada durante o uso.
document_type: implementation-increment
owner: Product and Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-14"
last_updated: "2026-08-14"
authors: [RouteBook Team]
tags: [implementation, mvp-validation, m8, pipa, usability, product-validation, quality]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-DEL-001, RB-QA-001, RB-OBS-001, RB-PRIV-001, RB-INC-129, RB-INC-132, RB-INC-134, RB-INC-135]
prerequisites: [RB-INC-129, RB-INC-132, RB-INC-134, RB-INC-135]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-136 — Validação Real do MVP em Pipa — M8

## Metadados

| Campo | Valor |
| --- | --- |
| ID | RB-INC-136 |
| Estado | In Progress — Fase A; Fase B aguardando uso real |
| Responsável | Product and Quality Engineering |
| Issue | #319 |
| Branch | `codex/rb-inc-136-m8-real-validation` |
| Data de criação | 2026-08-14 |
| Janela de uso real | 2026-08-22 a 2026-08-29 |

## 1. Resultado vertical

Produzir evidência confiável para decidir se o MVP do RouteBook gera valor no cenário real que motivou o produto, sem confundir testes automatizados com validação humana.

O incremento possui duas fases:

1. **Fase A — preparação pré-viagem:** protocolo, critérios, diário e controles de evidência;
2. **Fase B — uso real:** sessões, feedback, decisões e fricções observadas ou relatadas durante/depois da viagem.

A Fase A pode ser concluída antes da viagem. A Fase B não pode ser antecipada.

## 2. Problema

O RouteBook já possui jornada técnica, Production pública, autenticação própria, catálogo real de Pipa e testes automatizados. Isso comprova capacidade técnica, mas não responde às hipóteses centrais do MVP:

- o produto reduz esforço de pesquisa?
- mapa e distâncias realmente alteram decisões?
- lista, mapa e roteiro são compreensíveis em uso real?
- Recommendations e justificativas inspiram confiança?
- Planning Conflicts evitam planejamento ruim?
- Itinerary Proposals ajudam sem retirar controle?
- a experiência funciona em celular durante a viagem?
- o usuário retorna ao produto porque ele é útil?

Sem observação real, qualquer resposta positiva seria inferência indevida.

## 3. Valor entregue

Ao final, o owner deverá possuir:

- evidências reais organizadas por sessão;
- avaliação explícita das hipóteses H1–H10 do MVP;
- lista priorizada de fricções e falhas reais;
- distinção entre defeito técnico, problema de UX, lacuna de dados e hipótese não sustentada;
- decisão M8 documentada como `validated`, `partially_validated` ou `not_validated`;
- backlog de próximos incrementos derivado das evidências, não de suposições.

## 4. Fonte canônica

- repositório: `collapsy/Routebook`;
- issue: #319;
- incremento anterior: RB-INC-135;
- cenário canônico: viagem real para Pipa de 22 a 29 de agosto de 2026;
- Production: domínio canônico público do RouteBook;
- evidência técnica de preparação: CI, Vercel, Neon e health checks já consolidados pelos RB-INC-129 a RB-INC-135.

Dados pessoais precisos da viagem não devem ser copiados para documentação pública quando não forem necessários à avaliação.

## 5. Escopo da Fase A — preparação

- definir taxonomia de evidências;
- mapear H1–H10 para sinais observáveis;
- definir roteiro mínimo das sessões;
- definir perguntas qualitativas;
- definir critérios de severidade de fricção;
- definir template de diário de validação;
- definir como abrir issues para problemas encontrados;
- definir regras de sanitização e privacidade;
- validar que Production está pronta tecnicamente;
- deixar claro o que permanece `não medido` antes do uso real.

## 6. Escopo da Fase B — uso real

- registrar sessões de planejamento prévio e consulta durante a viagem;
- registrar ações efetivamente realizadas no RouteBook;
- registrar decisões influenciadas por Places, mapa, distâncias, Recommendations, conflicts ou proposals;
- registrar rejeições, ignorados e alterações manuais;
- registrar falhas, lentidão, confusão e workarounds;
- registrar atividades feitas fora do RouteBook porque o produto não resolveu a necessidade;
- registrar uso em celular e retorno posterior;
- sintetizar resultados por hipótese;
- abrir issues independentes para correções ou melhorias concretas;
- decidir M8 somente após revisão da evidência.

## 7. Fora de escopo

- inventar eventos de uso;
- preencher satisfação antecipadamente;
- transformar um E2E verde em evidência de valor;
- publicar dados pessoais do grupo ou endereço preciso da hospedagem;
- alterar a arquitetura para melhorar métricas sem evidência de necessidade;
- ativar tracking de terceiros apenas para este piloto sem decisão documental aplicável;
- redefinir escopo do MVP;
- generalizar conclusões de um único usuário para o mercado inteiro;
- declarar product-market fit.

## 8. Taxonomia de evidência

Toda evidência humana deve receber exatamente uma origem primária:

| Tipo | Definição | Exemplo válido |
| --- | --- | --- |
| `observed` | comportamento diretamente observado durante uma sessão | usuário abriu mapa antes de escolher um Place |
| `reported` | afirmação explícita do usuário | “a distância me fez trocar de restaurante” |
| `technical` | dado objetivo de sistema/observabilidade | request 200, deployment READY, erro runtime |
| `derived` | síntese baseada em evidências citadas | H3 parcialmente sustentada por três decisões registradas |
| `not_measured` | não houve evidência suficiente | nenhum conflito ocorreu no período observado |

`derived` nunca pode existir sem referências às evidências primárias que o sustentam.

## 9. Severidade de fricção

| Severidade | Critério |
| --- | --- |
| `S0-blocker` | impede a jornada ou torna o produto inseguro/incorreto para o uso atual |
| `S1-high` | exige workaround externo importante ou causa decisão errada relevante |
| `S2-medium` | atrasa/confunde, mas a jornada segue sem perda material |
| `S3-low` | inconveniência, clareza ou refinamento sem impacto relevante na decisão |

Problema de segurança ou exposição de dados é tratado separadamente pela severidade de segurança canônica, mesmo que a fricção percebida seja baixa.

## 10. Hipóteses H1–H10 e sinais observáveis

| Hipótese | Pergunta de validação | Sinais que sustentam | Sinais que contradizem |
| --- | --- | --- | --- |
| H1 Contexto mínimo | destino, período e hospedagem geram primeiro valor? | Places/distâncias úteis aparecem cedo | usuário precisa configurar muito mais antes de obter valor |
| H2 Mapa | mapa melhora compreensão? | consulta do mapa precede/ajuda decisão | mapa é ignorado, confuso ou não adiciona contexto |
| H3 Distância | distância influencia escolhas? | escolha muda ou é confirmada pela distância | usuário precisa buscar distância fora do RouteBook |
| H4 Salvos | separar interesse de compromisso ajuda? | usuário salva alternativas antes de roteirizar | Salvos não é compreendido ou é redundante |
| H5 Roteiro editável | edição agrega valor? | usuário ajusta ordem/horário/dia | mudanças são difíceis ou roteiro fixo bastaria |
| H6 Personalização | contexto melhora relevância? | recomendações/opções parecem compatíveis | resultados parecem genéricos ou incompatíveis |
| H7 Justificativas | explicações aumentam confiança? | justificativa é lida/citada antes da decisão | texto não ajuda, confunde ou parece inventado |
| H8 Lista + mapa | integração é necessária? | usuário alterna ou correlaciona representações | uma das visões não é usada ou sincronização confunde |
| H9 Proposta inicial | proposta é útil mantendo controle? | proposal é aceita/editada/parcialmente aceita | usuário rejeita por falta de controle ou baixa utilidade |
| H10 Sem reservas | valor existe sem transação? | produto apoia planejamento mesmo concluindo reserva fora | ausência de reservas impede perceber valor central |

Nenhuma linha recebe status antes da Fase B.

## 11. Jornadas mínimas a observar

Não é necessário forçar todas em uma única sessão. Registrar quando ocorrerem naturalmente:

1. entrar e recuperar a Trip;
2. revisar contexto da viagem;
3. explorar Places por lista/mapa;
4. filtrar ou pesquisar alternativa;
5. consultar distância/contexto espacial;
6. salvar ao menos uma opção, quando fizer sentido;
7. adicionar/editar/remover/reordenar Activity, quando fizer sentido;
8. consultar roteiro por dia;
9. avaliar Recommendation;
10. responder a Planning Conflict, se houver;
11. avaliar/edit/accept/reject/partial accept de Itinerary Proposal, se houver;
12. abrir rota externa, quando necessário;
13. retornar ao RouteBook em outro momento/dispositivo.

Ausência natural de uma jornada deve ser registrada como `not_measured`, não simulada para obter cobertura.

## 12. Perguntas qualitativas

Ao fim de uma sessão relevante, usar apenas as perguntas necessárias:

- Qual decisão você estava tentando tomar?
- O que o RouteBook tornou mais fácil?
- O que ainda precisou ser buscado ou resolvido fora do RouteBook?
- O mapa ajudou? Como?
- A distância alterou ou confirmou alguma escolha?
- Houve informação em que você não confiou?
- Alguma Recommendation foi útil ou irrelevante? Por quê?
- O roteiro pareceu realista para aquele momento?
- O que causou maior confusão ou demora?
- Em celular, alguma ação ficou difícil?
- Você voltaria ao RouteBook para a próxima decisão desta viagem? Por quê?

Não induzir resposta positiva.

## 13. Template de diário de sessão

Copiar este bloco para cada sessão real. Não preencher campos que não foram observados.

```markdown
### Session RB-M8-YYYYMMDD-NN

- momento local:
- contexto: pre-trip | in-trip | post-trip
- dispositivo: mobile | tablet | desktop
- objetivo da sessão:
- duração aproximada:
- evidence source: observed | reported | technical

#### Ações realmente realizadas
- 

#### Decisões apoiadas pelo RouteBook
- decisão:
  - evidência:
  - capability relacionada:
  - impacto percebido:

#### Fricções/falhas
- descrição:
  - severidade: S0-blocker | S1-high | S2-medium | S3-low
  - workaround:
  - issue criada: #NNN | none

#### O que foi feito fora do RouteBook
- 

#### Feedback explícito
- 

#### Hipóteses relacionadas
- HN: supporting | contradicting | neutral | not_measured
  - evidência:

#### Dados removidos/sanitizados antes de publicar
- 
```

Não registrar credenciais, tokens, e-mail, telefone, documento, localização em tempo real do usuário ou dados pessoais de outros viajantes.

## 14. Matriz de resultado H1–H10

Esta tabela permanece `not_measured` até haver evidência humana real.

| Hipótese | Status | Evidências primárias | Observação |
| --- | --- | --- | --- |
| H1 | `not_measured` | — | aguardando Fase B |
| H2 | `not_measured` | — | aguardando Fase B |
| H3 | `not_measured` | — | aguardando Fase B |
| H4 | `not_measured` | — | aguardando Fase B |
| H5 | `not_measured` | — | aguardando Fase B |
| H6 | `not_measured` | — | aguardando Fase B |
| H7 | `not_measured` | — | aguardando Fase B |
| H8 | `not_measured` | — | aguardando Fase B |
| H9 | `not_measured` | — | aguardando Fase B |
| H10 | `not_measured` | — | aguardando Fase B |

Status permitidos depois da observação: `supported`, `partially_supported`, `contradicted`, `not_measured`.

## 15. Critérios de decisão M8

A decisão final deve ser uma destas:

### `validated`

Há evidência real suficiente de que o fluxo central é utilizável e gera valor, sem bloqueador crítico aberto que invalide o cenário principal.

### `partially_validated`

Há valor real demonstrado, mas uma ou mais capacidades centrais possuem evidência insuficiente ou fricções relevantes que exigem novo incremento antes de considerar o MVP concluído.

### `not_validated`

O cenário real não demonstra valor suficiente ou há bloqueadores que impedem completar/usar a jornada central.

A decisão deve citar sessões e issues. Contagem de testes automatizados não é critério de decisão de produto.

## 16. Regra de abertura de bugs/melhorias

Durante a Fase B:

- `S0-blocker`: abrir issue imediatamente e interromper a jornada afetada quando necessário;
- `S1-high`: abrir issue na mesma sessão ou logo após;
- `S2-medium`: consolidar evidência e abrir issue se reproduzível/relevante;
- `S3-low`: registrar no diário e agrupar somente se houver padrão claro.

Cada issue derivada deve referenciar `RB-INC-136` e a Session ID sanitizada, sem dados pessoais.

## 17. Observabilidade

Usar somente sinais já disponíveis e necessários:

- health live/ready;
- runtime errors e 5xx;
- latência quando uma falha/percepção de lentidão exigir diagnóstico;
- deployment/SHA em Production;
- logs sanitizados.

Métricas técnicas apoiam diagnóstico; não substituem feedback de valor/usabilidade.

## 18. Segurança e privacidade

- manter autenticação e autorização existentes;
- não desabilitar proteção para facilitar teste;
- minimizar qualquer evidência publicada;
- referenciar hospedagem como “Hospedagem” quando endereço não for necessário;
- não publicar composição nominal do grupo;
- screenshots devem ser revisados antes de versionar;
- não versionar sessão autenticada, cookies, tokens ou headers;
- não copiar conteúdo privado do banco para documentos públicos;
- queries de diagnóstico devem ser read-only salvo incremento aprovado específico.

## 19. Acessibilidade e UX

Durante uso real observar também:

- legibilidade em ambiente móvel;
- áreas de toque;
- navegação e retorno entre lista/mapa/roteiro;
- feedback de ações;
- estados vazio/erro/loading;
- clareza de linguagem;
- recuperação após erro;
- necessidade de zoom horizontal ou gesto não evidente.

Problemas devem ser registrados como evidência, não corrigidos silenciosamente dentro deste incremento sem issue própria quando alterarem comportamento do produto.

## 20. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| viés do owner por ser também usuário | Alta | Alto | registrar fatos e feedback antes da síntese |
| confundir teste técnico com valor | Alta | Alto | taxonomia de evidência obrigatória |
| fabricar cobertura de jornadas | Média | Alto | permitir `not_measured` |
| dados pessoais em documentação pública | Média | Alto | sanitização antes de commit |
| tentar corrigir tudo durante a viagem | Média | Médio | issues separadas e priorização por severidade |
| indisponibilidade de Production | Baixa/Média | Alto | health/runtime e fallback operacional |
| catálogo insuficiente para uma decisão específica | Média | Médio | registrar lacuna como evidência, não inventar Place |

## 21. Critérios de aceite da Fase A

- [x] issue #319 define objetivo e limites;
- [x] hipóteses H1–H10 estão mapeadas para sinais observáveis;
- [x] taxonomia de evidência está definida;
- [x] severidade de fricção está definida;
- [x] jornadas mínimas estão definidas;
- [x] perguntas qualitativas não indutivas estão definidas;
- [x] template de diário está definido;
- [x] matriz H1–H10 inicia integralmente em `not_measured`;
- [x] decisão M8 possui estados e critérios explícitos;
- [x] privacidade e sanitização estão definidas;
- [ ] RB-CTX-136 criado e registrado;
- [ ] Registry sincronizado;
- [ ] Documentation Validation e Engineering Validation verdes no mesmo SHA;
- [ ] PR de preparação integrada em `main`;
- [ ] Production Release pós-merge não executa migrations pendentes;

## 22. Critérios de aceite da Fase B

- [ ] existe ao menos uma Session real com ações realmente realizadas;
- [ ] decisões apoiadas e/ou limitações reais estão registradas;
- [ ] fricções relevantes geraram issues quando aplicável;
- [ ] uso fora do RouteBook está registrado quando ocorrer;
- [ ] feedback qualitativo está registrado sem indução;
- [ ] hipóteses H1–H10 foram avaliadas somente onde há evidência;
- [ ] sinais `not_measured` permanecem explícitos quando não houve cobertura;
- [ ] blockers/high findings possuem disposition;
- [ ] decisão M8 está registrada com referências às evidências;
- [ ] documentação e backlog pós-validação estão sincronizados.

## 23. Cenários de teste do protocolo

### Preparação sem fabricar evidência

```gherkin
Dado que a viagem real ainda não começou
Quando o protocolo M8 é preparado
Então todas as hipóteses humanas permanecem not_measured
E somente readiness técnica pode ser marcada como comprovada
```

### Evidência insuficiente

```gherkin
Dado que uma capability não ocorreu naturalmente nas sessões reais
Quando o resultado M8 é sintetizado
Então a capability é marcada como not_measured
E nenhuma ação artificial é inventada apenas para completar cobertura
```

### Fricção relevante

```gherkin
Dado uma falha S0 ou S1 durante uso real
Quando a evidência é registrada
Então uma issue separada referencia o RB-INC-136 e a Session ID sanitizada
E nenhum dado pessoal desnecessário é publicado
```

## 24. Comandos de validação da Fase A

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O CI canônico também executa migration policy, PostgreSQL efêmero e Playwright responsivo conforme Engineering Validation.

## 25. Estratégia de rollback

A Fase A é documental e não altera dados de Production. Rollback significa reverter o commit/PR documental se o protocolo contradizer requisito canônico.

A Fase B registra evidência; evidência válida não deve ser apagada para melhorar o resultado. Correções devem ocorrer por adendo, issue ou nova versão, preservando rastreabilidade.

## 26. Definition of Ready da Fase B

- [ ] Fase A integrada em `main`;
- [ ] Production saudável;
- [ ] catálogo de Pipa disponível;
- [ ] usuário possui acesso legítimo ao RouteBook;
- [ ] cenário real de viagem iniciado ou sessão real pré-viagem disponível;
- [ ] nenhum bloqueador crítico conhecido impede a jornada a ser observada.

## 27. Definition of Done

O RB-INC-136 somente ficará `Done` quando:

- [ ] Fase A concluída;
- [ ] Fase B contém evidência humana real;
- [ ] achados relevantes possuem disposition;
- [ ] decisão M8 documentada;
- [ ] documentação sincronizada;
- [ ] issue #319 encerrada somente após revisão final.
