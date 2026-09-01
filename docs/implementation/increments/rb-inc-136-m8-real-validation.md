---
id: RB-INC-136
title: Validação Real do MVP em Pipa — M8
description: Define e executa o protocolo de validação real do MVP do RouteBook no cenário pessoal de Pipa, separando preparação pré-viagem de evidência humana observada durante o uso.
document_type: implementation-increment
owner: Product and Quality Engineering
status: Draft
version: "0.2.0"
created: "2026-08-14"
last_updated: "2026-09-01"
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
| Estado | Closeout M8 — Fase A concluída; Fase B revisada com evidência real; decisão `partially_validated` proposta |
| Responsável | Product and Quality Engineering |
| Issue | #319 |
| Branch | `codex/rb-inc-136-m8-closeout` |
| Baseline do closeout | `main@22a84867c4fbd1596be4e905eccc560d43e42c99` |
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

### 4.1 Reconciliação da Fase A em 2026-08-20

A preparação foi reconciliada contra a `main` atual após a integração do RB-INC-160:

- baseline da reconciliação: `bef09b68ce631073fb9d4b5a203a1ca462f1befd`;
- `RB-INC-136` e `RB-CTX-136` já estavam criados e registrados no Registry da `main`;
- a branch histórica `codex/rb-inc-136-m8-real-validation` foi preservada porque divergiu do histórico atual; a continuação usa `codex/rb-inc-136-m8-phase-a-reconciliation` criada a partir da `main` corrente;
- a matriz de rastreabilidade ainda não possuía evidência do RB-INC-136 e deve ser sincronizada nesta PR de preparação;
- o aceite funcional humano do Preview do RB-INC-160 em 2026-08-20 é evidência do gate daquele incremento, não uma Session do M8 e não deve sustentar H1–H10;
- todas as hipóteses H1–H10 continuam `not_measured` até existir uso humano real elegível para a Fase B;
- nenhuma escrita, migration ou promoção de Production é autorizada ou inferida por esta reconciliação documental.

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

A Fase B foi encerrada retrospectivamente com evidências contemporâneas registradas nas issues criadas durante o piloto e com feedback pós-viagem explícito. Ausência de evidência específica continua `not_measured`.

| Hipótese | Status | Evidências primárias | Observação |
| --- | --- | --- | --- |
| H1 | `partially_supported` | RB-M8-20260901-01 | o usuário relatou que o RouteBook foi útil no cenário real; não foi medido quanto setup mínimo foi necessário para chegar ao valor |
| H2 | `not_measured` | — | não há evidência primária suficiente de que o mapa, isoladamente, alterou decisões |
| H3 | `not_measured` | — | proximidade/distância foi uma necessidade recorrente do produto, mas não há relato específico de uma escolha alterada por distância |
| H4 | `not_measured` | — | uso e compreensão de Salvos não foram registrados com evidência suficiente |
| H5 | `not_measured` | #386 | houve fricção real na superfície de Roteiro, mas não há evidência suficiente de que a edição em si agregou valor |
| H6 | `not_measured` | #390 | o piloto mostrou lacuna de qualidade/ranking na Discovery; isso não prova personalização contextual |
| H7 | `not_measured` | — | leitura/confiança nas justificativas não foi registrada |
| H8 | `not_measured` | #399 | navegação e carga cognitiva foram problemáticas, mas não há evidência suficiente sobre a necessidade conjunta de lista + mapa |
| H9 | `not_measured` | — | não há evidência humana suficiente sobre aceite/edição de Itinerary Proposal durante o piloto |
| H10 | `supported` | RB-M8-20260823-01, RB-M8-20260827-01, RB-M8-20260901-01 | houve utilidade real durante a viagem sem capacidade de reserva/transação dentro do RouteBook |

Status permitidos: `supported`, `partially_supported`, `contradicted`, `not_measured`.

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
- [x] RB-CTX-136 criado e registrado;
- [x] Registry sincronizado;
- [x] Documentation Validation e Engineering Validation verdes no mesmo SHA;
- [x] PR de preparação/reconciliação integrada em `main` (#374, merge `7f68a5693ba405e599c00c497c5458b0b92f8640`);
- [x] preparação técnica/release concluída sem pendência atribuível à Fase A;

## 22. Critérios de aceite da Fase B

- [x] existem Sessions reais reconstruídas a partir de registros contemporâneos do piloto;
- [x] limitações reais estão registradas e vinculadas às issues derivadas;
- [x] fricções relevantes geraram issues próprias;
- [x] ausência de evidência sobre tarefas feitas fora do RouteBook permanece explícita, sem fabricação;
- [x] feedback qualitativo pós-viagem está registrado sem indução;
- [x] hipóteses H1–H10 foram avaliadas somente onde há evidência;
- [x] sinais `not_measured` permanecem explícitos quando não houve cobertura;
- [x] achados relevantes possuem disposition no backlog;
- [x] decisão M8 proposta está registrada com referências às evidências;
- [x] documentação e backlog pós-validação estão sincronizados neste closeout.

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

- [x] Fase A integrada em `main`;
- [x] Production estava saudável nos checkpoints pré-piloto;
- [x] catálogo de Pipa estava disponível;
- [x] usuário possuía acesso legítimo ao RouteBook;
- [x] cenário real de viagem ocorreu entre 22 e 29/08/2026;
- [x] nenhum S0-blocker foi registrado como impeditivo integral do piloto.

## 27. Definition of Done

O RB-INC-136 somente ficará `Done` quando:

- [x] Fase A concluída;
- [x] Fase B contém evidência humana real;
- [x] achados relevantes possuem disposition;
- [x] decisão M8 documentada como `partially_validated`;
- [x] documentação sincronizada no branch de closeout;
- [ ] issue #319 encerrada somente após revisão final e integração desta PR.


## 28. Evidências reais reconstruídas da Fase B

As Sessions abaixo são registros retrospectivos e sanitizados. Elas não inventam duração, cliques, decisões ou comportamentos não registrados: cada uma consolida somente feedback contemporâneo já preservado no GitHub ou feedback explícito pós-viagem.

### Session RB-M8-20260823-01

- contexto: `in-trip`;
- evidence source: `reported`;
- fonte primária: issue #382;
- fato registrado: durante uso humano real em Pipa, a cobertura de fotografias reais foi insuficiente, especialmente para restaurantes, bares e estabelecimentos menores;
- impacto: a experiência visual do RouteBook como guia ficou abaixo do nível desejado;
- disposition: #382 — Google Places Photos; #397/#398 — fallback visual ilustrativo sem fingir fotografia real;
- hipóteses H1–H10: nenhuma recebe suporte direto apenas por esta evidência.

### Session RB-M8-20260827-01

- contexto: `in-trip`;
- evidence source: `reported`;
- fontes primárias: issues #390 e #395;
- fatos registrados:
  - a Discovery listava Places, mas não respondia claramente quais eram os melhores;
  - para vida noturna, ranking estático de Place não respondia “o que está rolando hoje?”;
  - experiências naturais dependentes de horário/direção, como pôr do sol e nascer da lua, também surgiram como necessidade temporal distinta de eventos comerciais;
- disposition:
  - #390 e #401/#402 — qualidade/ranking contextual;
  - #395/#396 — experiências do dia, rolês e fenômenos naturais;
- hipóteses H1–H10: evidência demonstra lacunas reais de decisão, mas não é suficiente para marcar H6/H7 como suportadas ou contraditas.

### Session RB-M8-20260828-01

- contexto: `in-trip/post-use`;
- evidence source: `reported`;
- fontes primárias: issues #397, #399 e #401;
- fatos registrados:
  - cards sem fotografia real continuavam visualmente secos;
  - feedback explícito: “Parece que tem muita coisa na mesma página a navegação está um pouco confusa”;
  - a experiência precisava concluir a parte visual do ranking;
- disposition:
  - #397/#398 — fallback visual por categoria;
  - #399/#400 — navegação mobile e separação Hoje / Guia por dia;
  - #401/#402 — experiência completa de ranking;
- severidade: tratada como fricção de produto relevante, sem registro de S0-blocker.

### Session RB-M8-20260901-01

- contexto: `post-trip`;
- evidence source: `reported`;
- fonte primária: feedback pós-viagem do owner em 01/09/2026;
- fatos registrados:
  - a viagem de Pipa ocorreu;
  - o RouteBook foi útil;
  - alterações foram feitas durante o período de teste/uso;
- limite: não foi atribuído retrospectivamente valor específico a mapa, distância, Salvos, Recommendations, Planning Conflicts ou Itinerary Proposals sem evidência mais precisa;
- hipóteses:
  - H1: `partially_supported` pelo valor global relatado, sem medição do esforço mínimo de configuração;
  - H10: `supported`, pois o produto foi útil no cenário real sem oferecer reservas/transações como capacidade central.

## 29. Backlog derivado do piloto

| Achado real | Disposition |
| --- | --- |
| cobertura visual insuficiente | #382; mitigação intermediária #397/#398 |
| Roteiro com carga cognitiva/fricção | #386/#387 |
| falta de ranking que responda “quais são os melhores?” | #390 e #401/#402 |
| ausência de agenda temporal “o que tem hoje?” | #395/#396 |
| excesso de conteúdo e navegação mobile confusa | #399/#400 |
| necessidade de ranking visível e explicável | #401/#402 |

Não é aberto novo item duplicado neste closeout quando já existe issue específica para o achado.

## 30. Síntese de valor, usabilidade e confiabilidade

### Valor

Há evidência humana suficiente de valor no cenário que originou o produto: após a viagem, o usuário classificou o RouteBook como útil. O uso real também gerou feedback específico e backlog durante vários dias do piloto, demonstrando que o produto foi utilizado como instrumento de decisão/guia e não somente executado tecnicamente.

### Usabilidade

O piloto não valida a experiência integral. Foram encontrados problemas relevantes de carga cognitiva no Roteiro e na navegação, além de necessidade de tornar o conteúdo do Dia mais direto no mobile.

### Qualidade de dados

A maior lacuna observada foi transformar cobertura em informação útil para decisão:

- fotografia real insuficiente;
- ausência inicial de sinais claros de qualidade/ranking;
- necessidade de temporalidade para eventos e experiências do Dia.

### Confiabilidade

Os checkpoints técnicos de Production/Preview registraram CI, health e deployments saudáveis ao longo da preparação. Não há evidência de um S0-blocker que tenha invalidado integralmente o piloto. Isso não substitui as lacunas de evidência humana nas capabilities não exercitadas/registradas.

## 31. Decisão M8

**Decisão: `partially_validated`.**

Justificativa:

1. existe feedback humano explícito pós-viagem de que o RouteBook foi útil;
2. uso real gerou achados concretos durante o piloto, registrados contemporaneamente em #382, #390, #395, #397, #399 e #401;
3. as fricções descobertas originaram incrementos específicos em vez de serem escondidas;
4. várias hipóteses centrais H1–H10 continuam sem evidência específica suficiente e permanecem `not_measured`;
5. ranking, qualidade visual, temporalidade e navegação exigiram evolução durante/depois do piloto.

Portanto, o M8 demonstra valor real, mas não sustenta a afirmação de que todo o MVP foi validado integralmente. O resultado adequado é validação parcial com backlog pós-MVP explícito.

## 32. Próxima fronteira após M8

O closeout não redefine o roadmap nem cria novo conceito de domínio. Após consolidar as PRs derivadas do piloto, o próximo ciclo deve validar generalização: o RouteBook precisa deixar de depender de preparação específica de Pipa e demonstrar que consegue inicializar uma experiência útil para outro Destino sem catálogo/seed manual dedicado.

Essa direção deve ser aberta em incremento próprio após o fechamento do M8 e a consolidação da pilha de Preview.
