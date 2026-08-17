---
id: RB-INC-159
title: Ações diretas de Lugar no planejamento
description: Reduz a fricção entre descoberta e Roteiro ao disponibilizar Salvar e Adicionar ao Roteiro diretamente no contexto do Place, preservando a independência entre Saved Place e Activity.
document_type: implementation-increment
owner: Traveler Experience and Place Catalog
status: Draft
version: "0.1.0"
created: "2026-08-17"
last_updated: "2026-08-17"
authors: [RouteBook Team]
tags: [implementation, pipa, discovery, saved-place, itinerary, ux]
related_documents: [RB-CORE-0004, RB-PRD-002, RB-UX-002, RB-INC-157, RB-INC-158, RB-INC-136, RB-CTX-159]
prerequisites: [RB-INC-157, RB-INC-158]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-INC-159 — Ações diretas de Lugar no planejamento

## 1. Contexto

Issue: `#367`.

Branch: `codex/rb-inc-159-place-actions-itinerary-entry`.

Baseline: `570567fc49844fdd926624287871a98926f8c27a`, HEAD da `main` após RB-INC-158.

A auditoria pré-Production identificou uma fricção que contradiz o fluxo obrigatório do MVP. O catálogo publicado permite consultar Detalhes, Google Maps e rota externa, mas não permite Salvar diretamente no cartão nem iniciar a inclusão no Roteiro. A página de Detalhes permite Salvar/Remover, porém não oferece a ação obrigatória de Adicionar ao Roteiro.

O resultado prático é um caminho maior do que o previsto pelo produto: `Explorar → Detalhes → Salvar → Salvos → escolher Dia → adicionar`.

RB-PRD-002 determina que Explorar, Cartão e Detalhes exponham ações de Salvar e Adicionar ao Roteiro. RB-UX-002 / RB-UF-004, RB-UF-007 e RB-UF-010 confirmam esses pontos de entrada e estabelecem que o Lugar pode permanecer salvo ou não ao virar Atividade. A RouteBook Bible preserva a distinção semântica entre Saved Place e Activity.

## 2. Objetivo

Reduzir o esforço entre descoberta e planejamento sem alterar domínio ou persistência:

- permitir Salvar/Remover Place publicado diretamente no catálogo;
- preservar pesquisa, filtros e janela de Discovery durante essa mutation;
- expor `Adicionar ao roteiro` no cartão publicado;
- oferecer em Detalhes um compositor com Dia, horário e duração opcionais;
- permitir criar Activity a partir do Place publicado sem salvar o Lugar automaticamente;
- manter Salvar e Adicionar como decisões explícitas e independentes;
- após criação da Activity, informar o Dia e oferecer acesso direto ao Roteiro focado nesse Dia.

## 3. Decisões

### 3.1 Salvar é interesse, Roteiro é compromisso

`Salvar lugar` cria ou remove somente a seleção pessoal da Viagem.

`Adicionar ao roteiro` cria somente uma Activity `place-visit` associada ao Place publicado. A ação não cria Saved Place como efeito colateral.

Isso preserva:

- Saved Place ≠ Activity;
- salvar não altera o Roteiro;
- adicionar ao Roteiro não altera Salvos;
- remover dos Salvos não remove Activity existente.

### 3.2 Catálogo preserva o contexto atual

A mutation de Salvar/Remover no cartão usa Server Action sem redirect de sucesso. A página revalida os estados afetados, mas mantém URL, pesquisa, filtros, expansão/ocultação de Discovery e posição de navegação sempre que o runtime do navegador preservar a superfície atual.

### 3.3 Compositor contextual em Detalhes

O cartão publicado oferece `Adicionar ao roteiro`, apontando para `#adicionar-ao-roteiro` na página do Place.

O compositor permite:

- selecionar um Dia canônico da Viagem;
- informar horário opcional;
- informar duração opcional;
- criar Activity com `placeId`, título e tipo `place-visit`;
- receber feedback de sucesso ou erro;
- abrir o Roteiro já focado no Dia escolhido.

A página continua oferecendo Salvar/Remover como ação independente.

### 3.4 Candidatos externos permanecem não canônicos

Candidato Overture ainda não publicado não recebe Salvar nem Adicionar ao Roteiro. Ele continua limitado a consulta externa, mapa/fotos, rota externa e promoção explícita para curadoria.

## 4. Escopo

- estado Salvo/não Salvo no cartão publicado;
- Server Actions de Salvar/Remover sem redirect de sucesso no catálogo;
- CTA de Adicionar ao Roteiro no cartão publicado;
- compositor de Activity em Detalhes;
- feedback e deep link para o Dia do Roteiro;
- atualização do estado do mapa quando Place publicado passa a Saved Place;
- regressão E2E das duas decisões independentes;
- documentação, Context Pack e Registry.

## 5. Fora de escopo

- salvar ou inserir no Roteiro candidato Overture não publicado;
- auto-save ao criar Activity;
- criação de Activity ao apenas salvar;
- alterar domínio Saved Place/Activity;
- novo Provider, API paga, secret ou migration;
- cálculo interno de distância rodoviária, duração ou trânsito;
- redesign geral do Roteiro;
- expansão do guia editorial para todos os oito dias;
- evidência humana M8;
- merge ou Production sem gates humanos separados.

## 6. Caminhos autorizados

```text
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/actions.ts
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/actions.ts
apps/web/e2e/place-actions.spec.ts
docs/implementation/increments/rb-inc-159-place-actions-itinerary-entry.md
docs/implementation/context-packs/rb-inc-159-place-actions-itinerary-entry.md
docs/registry.md
```

`apps/web/e2e/place-actions.spec.ts` é um arquivo novo e dedicado porque a regressão cruza Discovery, Detalhes, Salvos e Roteiro; concentrar a jornada evita acoplar o aceite do incremento a suítes maiores que possuem objetivos diferentes.

Arquivo adicional indispensável exige atualização explícita desta seção e justificativa na PR.

## 7. Critérios de aceite

- [ ] cartão de Place publicado mostra Salvar ou Remover dos salvos conforme estado atual;
- [ ] salvar/remover no catálogo mantém os filtros e a superfície atual;
- [ ] mapa passa a representar Place salvo com o estado visual já existente;
- [ ] cartão publicado oferece `Adicionar ao roteiro`;
- [ ] Detalhes oferece Dia, horário opcional e duração opcional;
- [ ] adicionar cria Activity sem criar Saved Place automaticamente;
- [ ] salvar não cria Activity;
- [ ] sucesso informa o Dia escolhido e oferece `Ver Dia no roteiro`;
- [ ] erro de validação mantém o Place como contexto e não cria estado parcial;
- [ ] remover dos Salvos não remove Activity existente;
- [ ] candidatos externos continuam sem ações canônicas de Salvos/Roteiro;
- [ ] experiência continua utilizável em desktop e mobile;
- [ ] documentação e CI passam no mesmo SHA;
- [ ] aceite funcional ocorre em Preview antes de qualquer promoção para Production.

## 8. Testes obrigatórios

- E2E comprova Salvar no catálogo mantendo query de Discovery;
- E2E comprova mudança do botão para Remover dos salvos;
- E2E comprova CTA do cartão para o compositor de Detalhes;
- E2E comprova criação de Activity em Dia diferente do primeiro;
- E2E comprova que a criação de Activity não salva o Lugar;
- E2E abre o Roteiro focado no Dia criado e encontra a Activity;
- regressões existentes de Saved Places e Itinerary continuam verdes;
- `node scripts/validate-docs.mjs`;
- `pnpm format:check`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm build`;
- Playwright aplicável.

## 9. Preview e release

O Preview da Vercel é o ambiente de aceite deste pacote antes de Production.

No início do incremento, o alias de Preview da `main` estava atrasado porque o deployment do HEAD `570567f` foi bloqueado por build rate limit da Vercel. O Preview READY do RB-INC-158 usa o commit `3c83bb44df33c6de2b204cb98b76ff26dad3681e`, cuja árvore Git é a mesma `e1e57d2f89bbba5b1587316c28901b49e3028295` do merge final da `main`; ele serve como baseline funcional do pacote anterior, não como evidência do RB-INC-159.

O RB-INC-159 só poderá ser considerado aceito visualmente quando houver um Preview READY contendo sua própria árvore final. Falha de Vercel causada por quota/rate limit deve ser tratada como gate de ambiente, não como teste funcional aprovado.

## 10. Riscos e mitigação

- **confundir Salvo com planejado:** microcopy explica que as ações são independentes;
- **perder filtros ao salvar:** mutation não redireciona no sucesso;
- **duplicar estado por submit repetido:** serviço de Saved Place permanece idempotente e o domínio de Itinerary continua responsável pelas validações existentes;
- **inserir candidato externo:** CTA canônico existe somente para item `published`;
- **Activity em Dia incorreto:** o Dia é selecionado explicitamente e o redirect de sucesso carrega o mesmo Dia no Roteiro.

## 11. Rollback

Reverter o incremento remove as ações diretas e restaura o caminho via página de Salvos. Não há migration, Provider, secret, DML ou estado externo novo para desfazer; Activities e Saved Places criados pelos contratos canônicos permanecem dados válidos do usuário.
