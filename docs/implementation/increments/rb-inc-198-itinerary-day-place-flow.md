---
id: RB-INC-198
title: Contexto de Dia na jornada Roteiro → Lugar → Roteiro
description: Reestrutura a jornada principal de planejamento para preservar o Dia selecionado entre Roteiro, Discovery e Detalhes e retornar ao mesmo Dia após adicionar um Place.
document_type: implementation-increment
owner: Traveler Experience and Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-17"
last_updated: "2026-09-17"
authors: [RouteBook Team]
tags: [implementation, itinerary, place-discovery, navigation-context, ux]
related_documents: [RB-CORE-0004, RB-UX-002, RB-UX-004, RB-UX-005, RB-INC-157, RB-INC-159, RB-INC-165, RB-INC-178, RB-CTX-198]
prerequisites: [RB-INC-165, RB-INC-178]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-198 — Contexto de Dia na jornada Roteiro → Lugar → Roteiro

## 1. Resultado vertical

O usuário escolhe um Dia no Roteiro, entra em Lugares já sabendo qual Dia está planejando, adiciona um Place canônico e retorna diretamente ao mesmo Dia com a Activity criada e visível.

A URL `dia=YYYY-MM-DD` representa contexto de navegação e edição. Ela não cria estado de Domain novo e não substitui o `Itinerary Day` persistido.

## 2. Unidade de trabalho

- Issue: `#479`.
- Branch: `codex/rb-inc-198-itinerary-day-place-flow`.
- Base: `main` @ `3beceb737edfc390c9e56eecf90f006fac8342b0`.
- A PR #478 está aberta e toca `lugares/page.tsx` e `roteiro/page.tsx`; eventual integração exige reconciliação explícita antes do aceite.
- Production e merge na `main` permanecem gates humanos explícitos.

## 3. Auditoria da experiência anterior

### Roteiro

O Roteiro já usava o Dia como unidade visual e as mutações locais de Activity/Free Period retornavam ao Dia correto. Porém os CTAs de descoberta abriam `/lugares` e `/lugares-salvos` sem transportar o Dia selecionado.

### Discovery

Os cards de Place canônico priorizavam `Ver detalhes` e `Salvar lugar`. Não havia uma ação direta contextual de `Adicionar ao Dia X`, e filtros, ordenação e mapa não conheciam um Dia de destino.

### Detalhes

A tela já distinguia corretamente `Adicionar ao roteiro` de `Salvar`, permitia Dia, horário e duração opcional. Contudo, sem `dia` de origem, o formulário caía no primeiro Dia; salvar/remover removia o contexto; e o sucesso da inclusão permanecia nos Detalhes, exigindo novo clique em `Ver dia no roteiro`.

### Salvos, Proposal e Revisão

Salvos também adicionava Activity, mas retornava à própria lista. Proposal e Revisão permanecem operações secundárias, explícitas e sem aplicação automática. O redesenho completo desses pontos foi separado para incrementos posteriores para manter este primeiro vertical pequeno e reversível.

## 4. Decisões de experiência

- Dia é a unidade primária de planejamento.
- `dia` válido é propagado explicitamente entre Roteiro, Discovery e Detalhes.
- Em Discovery com Dia de destino, `Adicionar ao Dia X` vira ação primária de Place canônico.
- `Salvar para depois` continua ação independente e não cria Activity.
- `Ver detalhes` permanece disponível, mas não compete com a ação principal de planejamento.
- Detalhes permite trocar o Dia antes de confirmar; o CTA usa `Adicionar ao roteiro` para não exibir um número de Dia obsoleto depois da troca no seletor.
- Horário e duração continuam opcionais.
- Após inclusão bem-sucedida, o destino é o Roteiro no Dia efetivamente escolhido.
- Erros preservam Place e Dia para correção sem perda de contexto.
- Sem `dia`, Discovery mantém o comportamento geral de exploração.

## 5. Fluxo principal

```text
Roteiro
  ↓ escolher Dia
Dia X
  ↓ Adicionar lugar ao Dia X
Lugares ?dia=<data>
  ↓ pesquisar/filtrar/ordenar sem perder Dia
Place canônico
  ↓ Adicionar ao Dia X
Activity persistida
  ↓ redirect explícito
Roteiro ?dia=<data>#dia-em-foco
```

Fluxo alternativo de inspeção:

```text
Lugares ?dia=<data>
  ↓ Ver detalhes
Detalhes ?dia=<data>
  ↓ opcionalmente trocar Dia/horário/duração
Adicionar ao Dia
  ↓
Roteiro no Dia escolhido
```

## 6. Invariantes preservadas

- `Saved Place ≠ Activity`.
- Salvar ou remover dos Salvos não altera o Itinerary.
- Activity continua pertencendo ao Itinerary Day selecionado.
- Nenhum horário ou duração é inventado.
- Authorization permanece nos Server Actions existentes.
- Place externo não é inserido diretamente neste incremento; sua materialização segura permanece governada pelos contratos existentes.
- Proposal não sofre mutação nem aplicação automática.
- Nenhuma leitura cria estado canônico novo além do comportamento já existente do Roteiro ao inicializar seu Itinerary.

## 7. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/actions.ts
apps/web/e2e/itinerary-day-place-flow.spec.ts
apps/web/e2e/itinerary.spec.ts
apps/web/e2e/place-actions.spec.ts
docs/implementation/increments/rb-inc-198-itinerary-day-place-flow.md
docs/implementation/context-packs/rb-inc-198-itinerary-day-place-flow.md
docs/registry.md
```

As inclusões de `apps/web/e2e/itinerary.spec.ts` e `apps/web/e2e/place-actions.spec.ts` foram autorizadas durante a validação porque a nova hierarquia do Dia vazio, os novos CTAs e o redirect de Detalhes tornam assertions/locators legados incompatíveis. Nesses arquivos, o escopo é exclusivamente alinhar testes existentes à nova UX.

## 8. Fora de escopo

- ação direta de candidato externo para Itinerary;
- redesenho completo de `/lugares-salvos`;
- estado persistido de `Dia livre`;
- score/status agregado de cada Dia;
- retorno contextual de Proposal/Revisão;
- alteração de conflitos de planejamento;
- novo schema, migration, Provider ou secret;
- Production;
- merge na `main` sem autorização humana.

## 9. Critérios de aceite

- [ ] CTA do Dia abre Discovery com `dia` válido.
- [ ] Discovery deixa explícito qual Dia está sendo planejado.
- [ ] Pesquisa, filtros, ordenação, mapa e Detalhes preservam `dia`.
- [ ] Place canônico oferece `Adicionar ao Dia X` como ação primária no modo de planejamento.
- [ ] `Salvar para depois` permanece ação separada e não cria Activity.
- [ ] Detalhes pré-seleciona o Dia de origem e permite trocar de Dia.
- [ ] Horário e duração permanecem opcionais.
- [ ] Sucesso de inclusão retorna ao Roteiro no Dia escolhido.
- [ ] A Activity criada fica visível no Dia retornado.
- [ ] Erros de validação preservam Place e Dia.
- [ ] E2E cobre a jornada principal e a independência de Salvar.
- [ ] Mobile e desktop mantêm navegação livre, sem wizard bloqueante.
- [ ] Documentation e Engineering Validation passam no mesmo SHA.
- [ ] Preview fica READY antes do aceite funcional.
- [ ] Production permanece intocada.

## 10. Próximas fatias do redesenho

1. Salvos e candidatos externos com o mesmo contrato de Dia.
2. Resumo/status dos Dias e ação explícita `Manter este Dia livre`.
3. Retorno contextual de Revisão/Proposal e atenção por conflito.
4. Acabamento mobile, acessibilidade e hierarquia visual final.

## 11. Validação

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

O E2E dedicado deve validar no mínimo `Roteiro → Dia 2 → Lugares → Place → Roteiro Dia 2` e confirmar que Salvar nos Detalhes mantém o Dia sem criar a Activity.

## 12. Rollback

Sem migration. O rollback remove a propagação de `dia`, restaura os CTAs anteriores de Discovery e volta o sucesso de inclusão aos Detalhes. Saved Places e Itinerary persistidos permanecem compatíveis.