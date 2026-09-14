---
id: RB-CTX-187
title: Context Pack do RB-INC-187 — Microcopy de confiança
description: Delimita a revisão transversal de microcopy traveler-facing para remover justificativas técnicas e priorizar decisão, recuperação, transparência útil e linguagem natural.
document_type: implementation-context-pack
owner: Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-08"
last_updated: "2026-09-08"
authors: [RouteBook Team]
tags: [implementation, context-pack, ux, content-design, microcopy, trust, accessibility]
related_documents: [RB-INC-187, RB-CORE-0004, RB-UX-006, RB-DOM-002, RB-INC-186]
prerequisites: [RB-INC-186]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-187 — Microcopy de confiança

## 1. Missão

Revisar a linguagem traveler-facing para que o RouteBook comunique estado, decisão, limitação e próximo passo sem narrar arquitetura, pipeline ou lifecycle interno.

Princípio operacional:

> **A interface explica a decisão, não a implementação.**

## 2. Unidade de trabalho

- issue: `#444`;
- branch: `codex/rb-inc-187-trustworthy-microcopy`;
- base: `fa7c430fcac3b2d3a409cb62deec0ebcd70163e4`, HEAD verde do RB-INC-186 / PR #443;
- cadeia empilhada: #431 -> #434 -> #436 -> #439 -> #441 -> #443 -> RB-INC-187;
- PR Draft durante implementação;
- Production e merge em `main` continuam gates humanos explícitos.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004 — valor antes de volume, visual antes de texto, transparência antes de persuasão, linguagem clara e distinção obrigatória de estimativas;
3. `docs/README.md`;
4. RB-UX-006 — clareza, concisão, voz confiável, próximo passo, recuperação de erros, diferenciação entre fato/estimativa/sugestão e ausência de jargão desnecessário;
5. RB-DOM-002 — linguagem ubíqua e proibição de criar significado novo ou sinônimos conflitantes;
6. RB-INC-186 — origem da evidência visual, fallback ilustrativo compacto e experiência unificada de Lugar;
7. RB-INC-187 / este Context Pack.

## 4. Problema observado

O produto contém textos que são verdadeiros para a implementação, mas não úteis para o viajante. Isso aparece principalmente como:

- explicação de Provider/Fonte fora do contexto em que a origem muda confiança;
- termos de lifecycle (`externo`, `publicado`, `materializado`, `canônico`);
- descrição de reconciliação ou identidade interna;
- garantias repetidas de que leitura/sugestão não alterou estado;
- justificativas longas de fallback visual;
- mensagens de erro que narram transações ou persistência;
- estados de loading/vazio que explicam pipeline.

A correção é de Content Design. Não autoriza mudança de comportamento canônico.

## 5. Heurística de decisão para cada texto

Para cada bloco traveler-facing, responder nesta ordem:

1. O texto muda uma decisão do viajante?
2. Explica uma incerteza, estimativa ou risco real?
3. Oferece recuperação concreta?
4. É obrigatório por atribuição/licença/acessibilidade?
5. Se removido, o usuário perde significado necessário?

Se todas as respostas forem `não`, o texto deve ser candidato a remoção ou redução.

Se a informação for útil apenas ocasionalmente, preferir divulgação progressiva já existente em vez de texto permanente.

## 6. Padrões alvo

### Estado + próximo passo

Preferir:

```text
Não foi possível salvar este lugar agora. Tente novamente.
```

Evitar mensagens que expliquem falha de Provider, transação ou materialização sem oferecer recuperação adicional.

### Indisponibilidade factual

Preferir:

```text
Horário não informado
```

em vez de inferir que o lugar está fechado ou explicar por que o dado não chegou.

### Estimativa

Preservar qualificadores como:

```text
1,2 km em linha reta da hospedagem
Tempo estimado: 15 min
```

Não encurtar removendo a distinção entre estimativa e fato.

### Provenance

- manter atribuição/licença obrigatória;
- manter Fonte quando muda confiança ou permite auditoria útil;
- não transformar Provider em badge dominante se não muda a decisão;
- preferir `Mais informações`/detalhe quando a origem é secundária.

### Loading/vazio

- frase curta;
- causa somente quando conhecida;
- próximo passo quando existe;
- sem descrição de bootstrap, Region, adapter ou busca interna.

## 7. Superfícies e ordem de auditoria

Auditar em lotes pequenos, na ordem:

1. Minhas viagens + criação de Viagem;
2. visão geral + Hospedagem;
3. Explorar Lugares + Detalhes + Salvos;
4. Sugestões;
5. Guia;
6. Roteiro + Proposta + Revisão;
7. estados compartilhados de erro/vazio/loading e componentes comuns.

Cada lote deve produzir inventário `antes → depois`, alteração mínima e testes correspondentes antes de avançar.

## 8. Invariantes

- `Lugar` continua diferente de `Atividade`;
- `Salvar lugar` continua diferente de `Adicionar ao roteiro`;
- `Recomendação` não é `Decisão`;
- `Proposta de Roteiro` não é `Roteiro` aplicado;
- estimativa continua identificada como estimativa;
- indisponibilidade não vira fato inventado;
- atribuição/licença obrigatória permanece;
- redução de copy não altera persistência nem autorização;
- nomes acessíveis continuam completos mesmo quando a apresentação visual é curta;
- lista e mapa preservam significado equivalente.

## 9. Caminhos permitidos

Somente os caminhos definidos em RB-INC-187.

Dentro dos diretórios amplos autorizados, a mudança deve permanecer limitada a:

- strings traveler-facing;
- `aria-label`, nomes acessíveis e descrições de status;
- wrappers de divulgação progressiva já suportados pelo produto quando necessários para mover detalhe secundário;
- testes unitários/de componente/E2E diretamente impactados.

Não alterar regras de negócio, queries, schema, adapters, Providers, persistência ou migrations.

## 10. Estratégia de testes

### Componente/UI

- verificar presença de estado/ação essencial;
- verificar ausência de termos internos quando não necessários;
- verificar estimativa/indisponibilidade preservadas;
- verificar nome acessível quando copy visual é reduzida;
- evitar asserções literais de parágrafos longos quando um contrato semântico mais estável for suficiente.

### E2E

Cobrir jornadas reais, não arquitetura textual:

- criar Viagem;
- configurar Hospedagem;
- explorar e salvar Lugar;
- abrir Detalhes;
- consultar Sugestões;
- usar Guia;
- adicionar ao Roteiro e revisar Proposta;
- Pipa e pelo menos dois Destinations zero-seed.

## 11. Critério de revisão humana

No Preview desktop e mobile, verificar especialmente:

- se a interface parece mais curta sem parecer vaga;
- se limitações importantes continuam claras;
- se textos técnicos deixaram de competir com ações;
- se erros apontam recuperação;
- se estados vazios orientam o próximo passo;
- se a remoção de copy não criou espaços, repetições ou hierarquia confusa.

## 12. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation e Engineering Validation devem ficar verdes no mesmo SHA final. Vercel Preview deve ser revisado em desktop/mobile antes da integração. Production permanece fora de escopo.
