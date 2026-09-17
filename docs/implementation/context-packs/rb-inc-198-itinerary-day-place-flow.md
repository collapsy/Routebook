---
id: RB-CTX-198
title: Context Pack do RB-INC-198 — Contexto de Dia na jornada Roteiro → Lugar → Roteiro
description: Delimita o primeiro vertical do redesenho do Roteiro, preservando o Dia entre Roteiro, Discovery e Detalhes sem alterar invariantes de Saved Place, Activity ou Proposal.
document_type: implementation-context-pack
owner: Traveler Experience and Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-17"
last_updated: "2026-09-17"
authors: [RouteBook Team]
tags: [implementation, context-pack, itinerary, place-discovery, navigation-context, ux]
related_documents: [RB-INC-198, RB-CORE-0004, RB-UX-002, RB-UX-004, RB-UX-005, RB-INC-157, RB-INC-159, RB-INC-165, RB-INC-178]
prerequisites: [RB-INC-165, RB-INC-178]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-198 — Contexto de Dia na jornada Roteiro → Lugar → Roteiro

## 1. Missão

Fechar uma jornada de planejamento simples e comercialmente compreensível na qual o usuário escolhe um Dia, escolhe um Place e volta ao mesmo Dia com a Activity criada, sem precisar entender Saved Places como etapa obrigatória.

## 2. Unidade de trabalho

- issue: `#479`;
- branch: `codex/rb-inc-198-itinerary-day-place-flow`;
- base: `main` @ `3beceb737edfc390c9e56eecf90f006fac8342b0`;
- risco de integração: PR `#478` toca `lugares/page.tsx` e `roteiro/page.tsx`;
- Production e merge na `main` permanecem gates humanos.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004 — RouteBook Bible;
3. `docs/README.md`;
4. RB-UX-002 — fluxos de Explore, Detalhes, Saved Places e Itinerary;
5. RB-UX-004 — wireframes de Discovery, Detalhes, Salvos e Roteiro;
6. RB-UX-005 — especificações de Save, Add to Itinerary, Day selection e Free Period;
7. RB-INC-157 — jornada progressiva Catálogo → Roteiro;
8. RB-INC-159 — ações de Place e entrada no Itinerary;
9. RB-INC-165 — timeline diária;
10. RB-INC-178 — materialização segura de Place externo;
11. RB-INC-198 / este Context Pack.

## 4. Invariantes

- `Saved Place` representa interesse; não é Activity.
- Salvar não adiciona ao Roteiro.
- Remover dos Salvos não remove Activity já existente.
- `Itinerary Day` permanece unidade canônica de organização.
- `dia=YYYY-MM-DD` é apenas contexto de navegação/edição e deve ser validado contra o período da Trip.
- Horário e duração permanecem opcionais; dados desconhecidos não são inventados.
- Server Actions existentes continuam responsáveis por autorização e persistência.
- Proposal continua separada e nunca é aplicada silenciosamente.
- Candidato externo não entra diretamente no Itinerary nesta fatia.

## 5. Contrato de contexto do Dia

### Entrada

O Roteiro gera links de Discovery com:

```text
/viagens/<tripId>/lugares?dia=<YYYY-MM-DD>
```

Somente datas presentes em `deriveTripDays(trip.period)` são consideradas contexto válido.

### Propagação

Quando válido, `dia` deve sobreviver a:

- submit de pesquisa/filtros;
- mudança de ordenação;
- limpar um filtro;
- limpar todos os filtros;
- abertura de Detalhes;
- navegação do marker canônico do mapa;
- Save/Remove nos Detalhes;
- erro de validação ao adicionar Activity.

### Saída

Após uma inclusão bem-sucedida:

```text
/viagens/<tripId>/roteiro?atividadeCriada=1&dia=<YYYY-MM-DD>#dia-em-foco
```

O `dia` usado no retorno é o Dia efetivamente enviado no formulário, inclusive quando o usuário troca o Dia na tela de Detalhes.

## 6. Hierarquia de ações

### Roteiro — Dia vazio

Primária:

```text
Adicionar lugar ao Dia X
```

Secundárias nesta fatia:

- usar lugar salvo;
- criar atividade manual.

A ação explícita `Manter este Dia livre` será tratada na fatia de estado/resumo diário para evitar introduzir uma semântica persistida sem contrato.

### Discovery em modo de planejamento

Place canônico:

1. `Adicionar ao Dia X` — primária;
2. `Salvar para depois` — secundária;
3. `Ver detalhes` — secundária de inspeção.

Fora de modo de planejamento, a Discovery mantém sua hierarquia geral anterior.

### Detalhes

- `Adicionar ao Dia X` usa o Dia de origem como default;
- seletor continua permitindo outro Dia;
- horário/duração opcionais;
- `Salvar para depois` continua independente.

## 7. External Places

External candidate exige materialização/reconciliação segura antes de se tornar Place canônico. A ação direta `Adicionar ao Dia X` para esse caso precisa reutilizar o contrato do RB-INC-178 sem criar Saved Place como efeito colateral. Isso fica explicitamente fora do RB-INC-198 para uma fatia posterior.

## 8. Salvos

`/lugares-salvos` recebe o parâmetro `dia` a partir do Roteiro já nesta fatia, mas a experiência completa de leitura, default de Dia, inclusão e retorno será implementada separadamente. O RB-INC-198 não muda o comportamento persistente de Saved Places.

## 9. Proposal e Revisão

Continuam acessíveis como ações secundárias do Roteiro, com aceite explícito e sem aplicação automática. Preservar `dia` ao entrar/voltar dessas superfícies será tratado em fatia posterior.

## 10. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/actions.ts
apps/web/e2e/itinerary-day-place-flow.spec.ts
docs/implementation/increments/rb-inc-198-itinerary-day-place-flow.md
docs/implementation/context-packs/rb-inc-198-itinerary-day-place-flow.md
docs/registry.md
```

## 11. Testes mínimos

- Roteiro no Dia 2 apresenta CTA com href de Discovery contendo `dia`;
- Discovery reconhece e comunica `Planejando o Dia 2`;
- pesquisa/filtro preserva `dia`;
- Place canônico apresenta `Adicionar ao Dia 2` e `Salvar para depois`;
- Detalhes href preserva `dia`;
- Add direto cria Activity e retorna ao Dia 2;
- Activity adicionada aparece no Dia retornado;
- Detalhes pré-seleciona Dia de origem;
- Save nos Detalhes mantém `dia` e não dispara Add to Itinerary.

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

Também é obrigatório:

- Preview Vercel READY no SHA final;
- validação visual/funcional em desktop e mobile;
- reconciliação explícita caso a PR #478 entre na `main` antes do aceite.

## 13. Proibições

- não criar estado de Domain para o parâmetro `dia`;
- não transformar Save em requisito para planejar Place canônico;
- não criar Activity ao salvar;
- não inventar horário/duração;
- não aplicar Proposal automaticamente;
- não alterar Provider, secret, schema ou migration;
- não promover Production;
- não fazer merge na `main` sem aprovação humana.