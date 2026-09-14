---
id: RB-CTX-186
title: Context Pack do RB-INC-186 — Cards de Lugar com hierarquia visual progressiva
description: Delimita a simplificação dos Place Cards da Discovery, priorizando decisão rápida e divulgação progressiva sem perder Provenance.
document_type: implementation-context-pack
owner: Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-07"
last_updated: "2026-09-08"
authors: [RouteBook Team]
tags: [implementation, context-pack, places, discovery, ux, cards, progressive-disclosure]
related_documents: [RB-INC-186, RB-CORE-0004, RB-UX-006, RB-DS-002, RB-DS-003, RB-INC-185]
prerequisites: [RB-INC-185]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-186 — Cards de Lugar com hierarquia visual progressiva

## 1. Missão

Reduzir a carga cognitiva dos cards de Lugar na Discovery sem remover informação necessária. O viajante deve compreender rapidamente nome, distância, relevância e próximo passo; ranking detalhado, Provenance e ações auxiliares devem permanecer acessíveis em segundo nível.

## 2. Unidade de trabalho

- issue: #442;
- branch: `codex/rb-inc-186-place-card-hierarchy`;
- base: `af12a9de42604487cc0a140acd45af776580fafb` do RB-INC-185 / PR #441;
- cadeia empilhada: #431 -> #434 -> #436 -> #439 -> #441 -> RB-INC-186;
- Production e merge continuam gates humanos.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004 — valor antes de volume, visual antes de texto e linguagem clara;
3. `docs/README.md`;
4. RB-UX-006 — clareza, concisão, informação de limitações sem insegurança desnecessária e orientação do próximo passo;
5. RB-DS-002 — RB-CMP-023 Card, RB-CMP-052 Place Card, RB-CMP-054 Recommendation Reason;
6. RB-DS-003 — um objetivo principal por contexto e progressão geral -> específico;
7. RB-INC-185 — experiência unificada de Lugar provider-first;
8. RB-INC-186 / este Context Pack.

## 4. Evidência do problema

O card atual concentra ranking completo, imagem, categoria, nome, resumo/endereço, preço, distância, Fonte e até cinco ações. Em telas estreitas, a grade herdada pode produzir cards pequenos demais para essa densidade.

O problema é de hierarquia, não de falta de dados. A correção deve reorganizar e ocultar progressivamente o que não é necessário para a primeira decisão.

A validação visual humana de 2026-09-08 confirmou também que o fallback ilustrativo estava transformando a imagem em superfície de documentação: Categoria, `Referência visual` e `Ilustração de categoria — não é foto do local` competiam com a arte, repetiam conteúdo do card e apresentavam contraste insuficiente. O fallback precisa informar sua natureza sem parecer justificativa de implementação.

## 5. Invariantes de UX

- nome e Distância são prioritários;
- somente uma ação principal por card;
- Salvar pode permanecer ação rápida secundária;
- não remover acesso a Provenance;
- não exibir informação inventada quando preço/rating/Score estiver ausente;
- ação de exploração não deve obrigar o usuário a entender materialização interna;
- lista e mapa continuam semanticamente alinhados;
- Place vindo de Provider e Place materializado usam a mesma anatomia visual;
- o card não substitui a tela de Detalhes;
- a ilustração de fallback não repete Categoria nem explica pipeline de mídia;
- no Place Card, o fallback visual usa apenas selo curto `Imagem ilustrativa` sobre a arte;
- o nome acessível continua identificando explicitamente a ilustração e o Lugar, mesmo com microcopy visual reduzida.

## 6. Anatomia alvo

```text
Imagem / ilustração
  selo curto “Imagem ilustrativa” apenas quando for fallback
Categoria / estado curto
Nome
Resumo curto opcional
Distância + sinais principais disponíveis
Ranking compacto quando houver sinais reais
[Ação principal] [Salvar/remover]
Entender este ranking
  posição / ordenação / evidências
Mais informações
  endereço / Provenance
  mapa / rota real quando aplicável
```

A ordem pode variar levemente por disponibilidade de dados, mas a hierarquia não.

A mídia não deve repetir no interior da arte o que o corpo do card já informa. Estados de carregamento ou fallback podem continuar acessíveis e observáveis para testes, mas não precisam virar frases permanentes para o viajante.

## 7. Ranking

`PlaceRankingMeta` deve deixar de renderizar toda a evidência expandida por padrão.

Visível somente quando houver dado real:

- Top de categoria quando houver evidência;
- Score/rating resumido quando houver sinais verificados.

Divulgação progressiva em `Entender este ranking`:

- posição e ordenação ativas;
- volume de avaliações;
- popularidade relativa;
- Provider e timestamp;
- razões do Score.

Sem `quality/signals`, não se fabrica Score, rating ou Top; a posição/ordenação real permanece consultável no disclosure sem dominar a leitura rápida.

## 8. Ações

### Lugar materializado

- principal: `Ver detalhes`;
- secundária: `Salvar lugar` / `Remover dos salvos`;
- em segundo nível: mapa/fotos e rota real;
- `Adicionar ao roteiro` fica em Detalhes.

### Lugar vindo diretamente de Provider

- principal: `Ver mapa e fotos` enquanto não houver rota de Detalhes neutra à materialização;
- secundária: `Salvar lugar`;
- em segundo nível: rota real e Provenance.

Não explicar essa diferença com termos `externo`, `publicado`, `candidato` ou `curado`.

## 9. Responsividade

- Desktop: largura mínima de card suficiente para nome, fatos e duas ações sem empilhamento excessivo.
- Tablet: reduzir colunas antes de comprimir o conteúdo.
- Mobile: uma coluna, ações com área de toque confortável e disclosure abaixo das ações principais.
- Não truncar nome de Lugar em uma única linha; resumo pode usar clamp controlado.
- O selo `Imagem ilustrativa` precisa manter contraste suficiente em todas as artes de categoria, sem depender do fundo específico da ilustração.

## 10. Caminhos permitidos

Somente os caminhos declarados em RB-INC-186. O escopo inclui os testes de regressão e o fallback visual explicitamente registrados no incremento porque a nova linguagem de Lugar invalida contratos legados desses pontos.

A variante compacta de `CategoryIllustration` é autorizada apenas para o fallback de Place Card neste incremento. Outros usos descritivos do componente não devem mudar silenciosamente; uma revisão transversal de microcopy pertence ao próximo incremento específico.

## 11. Testes mínimos

- `PlaceRankingMeta` não fabrica sinais e mantém evidência detalhada acessível por disclosure;
- card materializado possui um CTA principal e Salvar secundário;
- card provider-first não exibe CTA de curadoria nem excesso de ações primárias;
- `Adicionar ao roteiro` não aparece na grade de Discovery;
- Provenance continua acessível;
- fallback do card renderiza visualmente apenas `Imagem ilustrativa`, sem Categoria/justificativa duplicada dentro da arte;
- fallback mantém nome acessível que explicita ilustração e Lugar;
- estado async de mídia continua observável sem expor pipeline como copy permanente;
- E2E zero-seed, proximidade, mapa e regressão de filtros continuam operacionais;
- mobile mantém uma coluna e os fluxos de salvar/detalhes funcionam.

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

Documentation e Engineering Validation devem ficar verdes no mesmo SHA final. O Vercel Preview deve validar visualmente a hierarquia em desktop e mobile antes da integração. Production permanece fora de escopo.
