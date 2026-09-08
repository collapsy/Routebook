---
id: RB-INC-187
title: Microcopy de confiança e remoção de justificativas técnicas
description: Revisa transversalmente a microcopy traveler-facing para priorizar decisão, recuperação e transparência útil, removendo explicações de arquitetura, pipeline e lifecycle da jornada principal.
document_type: implementation-increment
owner: Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-08"
last_updated: "2026-09-08"
authors: [RouteBook Team]
tags: [implementation, ux, content-design, microcopy, trust, accessibility, traveler-experience]
related_documents: [RB-CORE-0004, RB-UX-006, RB-DOM-002, RB-INC-186, RB-CTX-187]
prerequisites: [RB-INC-186]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-187 — Microcopy de confiança e remoção de justificativas técnicas

## 1. Resultado vertical

As superfícies principais do viajante passam a falar como um guia confiável e direto, não como uma explicação da implementação.

A interface deve responder primeiro:

1. o que aconteceu ou o que está disponível;
2. o que isso significa para a decisão atual;
3. o que o viajante pode fazer agora;
4. qual limitação ou incerteza realmente muda a decisão.

Detalhes de Provider, pipeline, lifecycle, reconciliação, materialização e mecanismos internos não devem ocupar a jornada principal quando não ajudam a decidir ou recuperar-se.

Princípio operacional do incremento:

> **A interface explica a decisão, não a implementação.**

## 2. Issue, branch e base

- Issue: `#444`.
- Branch: `codex/rb-inc-187-trustworthy-microcopy`.
- Base empilhada: `fa7c430fcac3b2d3a409cb62deec0ebcd70163e4`, HEAD final verde do RB-INC-186 / PR `#443`.
- Cadeia atual: `#431 -> #434 -> #436 -> #439 -> #441 -> #443 -> RB-INC-187`.
- `main` permanece sem push direto.
- PR deve permanecer Draft durante implementação e validação.
- Merge em `main` e Production continuam gates humanos explícitos.

## 3. Diagnóstico

A validação visual do RB-INC-186 confirmou um padrão transversal: várias superfícies exibem textos tecnicamente corretos, porém orientados a justificar arquitetura ou mecanismos internos.

Padrões a remover, reduzir ou mover para divulgação progressiva incluem:

- `Provider`, adapter, pipeline ou bootstrap na UX do viajante;
- `externo`, `publicado`, `materializado`, `canônico`, `provider-first` e lifecycle editorial quando não mudam a ação;
- explicações de reconciliação, identidade canônica ou consistência interna;
- garantias repetidas de ausência de efeitos colaterais em estados comuns;
- mensagens de erro que descrevem transação, persistência ou bloqueios internos em vez de recuperação;
- estados vazios/loading que explicam como o sistema busca dados;
- justificativas permanentes sobre fallback visual ou ausência de foto.

O problema não é transparência em excesso, e sim transparência no nível errado. O produto deve continuar distinguindo fatos, estimativas, sugestões, indisponibilidade e origem quando isso muda confiança, é exigido por licença/atribuição ou é relevante à decisão.

## 4. Regras de conteúdo autorizadas

### 4.1 Manter visível quando muda a decisão

- `estimado` para valores estimados;
- `em linha reta` quando a distância não representa rota/ETA;
- indisponibilidade factual de horário, preço, rating ou informação necessária;
- risco, conflito ou impacto antes de ação comprometida;
- atribuição/licença obrigatória;
- Fonte/Provenance quando a origem muda confiança ou é obrigação de atribuição;
- diferenças reais entre `Salvar lugar` e `Adicionar ao roteiro`.

### 4.2 Reduzir, mover ou remover

- frases que narram implementação;
- repetição de categoria, origem ou fallback sem valor decisório;
- estado técnico de materialização/publicação;
- termos internos de Domain usados como debug na interface;
- garantias repetidas de consistência/atomicidade após operações simples;
- disclaimers permanentes que podem aparecer apenas no contexto relevante;
- mensagens que explicam por que o sistema não criou entidades internas.

### 4.3 Erros

Mensagens de erro traveler-facing devem priorizar:

1. resultado;
2. recuperação;
3. detalhe adicional somente quando oferece ação concreta.

Exemplo alvo:

```text
Não foi possível salvar este lugar agora. Tente novamente.
```

Evitar expor Provider, transação, lifecycle ou consistência interna sem necessidade operacional para o viajante.

### 4.4 Estados vazios e loading

- uma mensagem curta;
- causa útil somente quando conhecida e relevante;
- um próximo passo claro;
- nenhuma descrição de pipeline;
- não inventar motivo para uma ausência de dados.

## 5. Superfícies traveler-facing em escopo

A auditoria deve cobrir:

- Minhas viagens;
- criação de Viagem;
- visão geral da Viagem;
- Hospedagem;
- Explorar Lugares;
- Detalhes de Lugar;
- Lugares salvos;
- Sugestões;
- Guia;
- Roteiro;
- Proposta de Roteiro;
- Revisão;
- componentes compartilhados que geram microcopy nessas superfícies;
- estados de erro, vazio e loading relacionados;
- nomes acessíveis e feedbacks de ações correspondentes.

A implementação pode ser entregue por lotes dentro do mesmo incremento, desde que cada lote preserve semântica, acessibilidade e cobertura de teste.

## 6. Inventário antes → depois

Antes de alterar uma superfície, registrar no próprio incremento ou no PR um inventário conciso contendo:

| Superfície | Padrão atual | Direção alvo | Motivo |
| --- | --- | --- | --- |
| exemplo | explicação de implementação | estado + próximo passo | reduz carga cognitiva sem esconder incerteza |

O inventário deve distinguir:

- copy removida;
- copy encurtada;
- copy movida para divulgação progressiva;
- copy preservada por ser necessária à decisão, estimativa, acessibilidade ou atribuição.

## 7. Linguagem e semântica

- preservar os conceitos oficiais de RB-DOM-002;
- capitalização na interface segue linguagem natural em pt-BR;
- não criar sinônimos que misturem `Lugar`, `Atividade`, `Roteiro`, `Recomendação` e `Proposta`;
- simplificar a explicação não autoriza simplificar o significado;
- não apresentar estimativa como fato;
- não transformar indisponibilidade em afirmação negativa não comprovada;
- não ocultar informação exigida por atribuição/licença;
- não usar jargão de Provider como linguagem principal.

## 8. Acessibilidade

- nomes acessíveis continuam inequívocos mesmo quando a copy visual é reduzida;
- botões e links devem continuar descrevendo a ação real;
- feedback de sucesso/erro deve continuar anunciado por `status`/`alert` quando aplicável;
- texto removido da tela não pode ser a única fonte de contexto necessária para leitores de tela;
- não depender apenas de cor ou ícone para comunicar estimativa, risco ou indisponibilidade;
- testes devem preferir contratos semânticos e acessíveis em vez de frases longas de implementação.

## 9. Fora de escopo

- alterar invariantes ou linguagem ubíqua do Domain;
- alterar algoritmo de ranking ou Recommendation;
- mudar Provider, ativar billing ou escolher serviço pago;
- migrations, schema ou persistência;
- alterar política de privacidade, consentimento ou retenção;
- redesenhar estruturalmente navegação ou arquitetura da informação;
- remover Provenance/licença obrigatória;
- inventar dados ausentes para tornar a interface mais simples;
- Production;
- merge em `main` sem autorização humana explícita.

## 10. Caminhos permitidos

A alteração de código fica restrita a microcopy, atributos acessíveis e testes correspondentes nas superfícies traveler-facing.

```text
apps/web/app/viagens/page.tsx
apps/web/app/viagens/error.tsx
apps/web/app/viagens/loading.tsx
apps/web/app/viagens/nova/**
apps/web/app/viagens/[tripId]/**
apps/web/components/**
apps/web/e2e/**
docs/implementation/increments/rb-inc-187-trustworthy-microcopy.md
docs/implementation/context-packs/rb-inc-187-trustworthy-microcopy.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Restrições adicionais dos diretórios acima:

- em `apps/web/app/viagens/**`, alterar apenas strings traveler-facing, nomes acessíveis e o mínimo de estrutura JSX necessário para divulgação progressiva já existente; regras de negócio, persistência, chamadas de Provider e fluxos canônicos não podem mudar;
- em `apps/web/components/**`, alterar somente componentes que efetivamente renderizam conteúdo nas superfícies listadas, junto de seus testes;
- em `apps/web/e2e/**`, alterar somente contratos impactados pelas novas mensagens/nomes acessíveis;
- CSS fica fora de escopo neste incremento, salvo se uma revisão humana identificar problema visual causado diretamente pela redução de conteúdo e o incremento for atualizado antes;
- qualquer arquivo adicional exige atualização deste incremento antes da mudança.

## 11. Critérios de aceite

- [ ] fallback ilustrativo não contém justificativa longa nem Categoria duplicada;
- [ ] principais telas do viajante possuem inventário `antes → depois` dos padrões removidos, reduzidos ou preservados;
- [ ] copy primária não expõe termos de arquitetura/lifecycle sem necessidade decisória;
- [ ] erros priorizam resultado + recuperação e não detalhes internos;
- [ ] estados vazios/loading são curtos e orientam o próximo passo;
- [ ] Provenance continua acessível onde relevante, sem dominar cards ou headers;
- [ ] estimativas continuam explicitamente diferenciadas de fatos;
- [ ] atribuições/licenças obrigatórias permanecem intactas;
- [ ] nenhuma informação ausente é inventada;
- [ ] Pipa e pelo menos dois Destinations sem dependência de seed permanecem funcionais;
- [ ] acessibilidade e nomes acessíveis continuam corretos;
- [ ] testes de componente/E2E usam contratos de conteúdo significativos e evitam acoplamento desnecessário a justificativas longas;
- [ ] Documentation e Engineering Validation ficam verdes no mesmo SHA;
- [ ] Vercel Preview é revisado em desktop e mobile;
- [ ] Production permanece intocada.

## 12. Testes

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 13. Riscos e reversão

Riscos principais:

- remover contexto que parecia técnico, mas era necessário para confiança ou recuperação;
- quebrar E2Es excessivamente acoplados a frases literais;
- criar sinônimos inconsistentes com a linguagem ubíqua;
- reduzir copy visual sem preservar nome acessível equivalente.

Mitigação:

- revisar cada remoção contra RB-CORE-0004, RB-UX-006 e RB-DOM-002;
- preservar estimativas, limitações e atribuições relevantes;
- atualizar testes para semântica e ações observáveis;
- validar desktop/mobile e múltiplos Destinations.

Reversão é textual e localizada: restaurar a copy anterior por superfície sem alterar estado persistido ou Domain.
