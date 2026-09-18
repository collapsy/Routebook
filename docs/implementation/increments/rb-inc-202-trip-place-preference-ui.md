---
id: RB-INC-202
title: Minha seleção e intenção por Lugar
description: Substitui a experiência binária de Salvos pela interface canônica de TripPlacePreference com Quero ir, Talvez, Não tenho interesse e Imperdível.
document_type: implementation-increment
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, trip-collection, trip-place-preference, ux, selection, web]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-UX-002, RB-ARC-002, RB-ADR-028, RB-INC-199, RB-INC-200, RB-INC-201, RB-CTX-202]
prerequisites: [RB-INC-201]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-202 — Minha seleção e intenção por Lugar

## 1. Estado

`Draft`

- issue: [#487](https://github.com/collapsy/Routebook/issues/487);
- branch: `codex/issue-487-trip-place-preference-ui`;
- base: `origin/main@d2887427aa84834d8074c538f091fcb5898f86f6`.

## 2. Resultado vertical

O viajante deixa de interagir com uma associação binária de “Salvos” e passa a expressar a intenção canônica por Lugar:

```text
WANT           -> Quero ir
MAYBE          -> Talvez
NOT_INTERESTED -> Não tenho interesse
MUST_DO        -> Imperdível, somente com WANT
ausência       -> não avaliado
```

A experiência é refletida no catálogo, no detalhe do Place e em Minha seleção.

## 3. Problema

O RB-INC-201 tornou `TripPlacePreference` persistível, mas a aplicação web ainda lê e escreve por meio do adapter legado de Saved Places. Isso esconde `MAYBE`, `NOT_INTERESTED` e `MUST_DO`, além de manter a linguagem binária “Salvar/Remover”.

## 4. Escopo

- dependência de `@routebook/trip-collection` no app web;
- controle reutilizável de intenção e prioridade;
- leitura canônica no catálogo;
- Set/Clear sem redirect para Places canônicos no catálogo;
- leitura e edição canônica no detalhe do Place;
- transformação visual de `/lugares-salvos` em Minha seleção;
- listagem das três intenções;
- edição e limpeza de preferência na seleção;
- apresentação de `Imperdível`;
- navegação da Trip usando “Minha seleção”;
- manutenção da rota física `/lugares-salvos` por compatibilidade;
- ação de candidato externo apresentada como “Quero ir”, mantendo materialização e persistência `WANT`;
- testes de Server Actions;
- documentação e rastreabilidade.

## 5. Linguagem de interface

A interface segue RB-DOM-002:

| Estado canônico | Interface |
| --- | --- |
| `WANT` | Quero ir |
| `MAYBE` | Talvez |
| `NOT_INTERESTED` | Não tenho interesse |
| `MUST_DO` | Imperdível |
| ausência | não avaliado |
| Trip Collection | Minha seleção |

“Saved Place” e “Lugar Salvo” permanecem apenas como compatibilidade técnica legada.

## 6. Catálogo

Para Places canônicos:

- o estado atual é carregado por `DrizzleTripPlacePreferenceRepository`;
- o card apresenta a intenção atual e `Imperdível`, quando aplicável;
- o usuário pode escolher qualquer uma das três intenções;
- `Imperdível` aparece somente para `WANT`;
- a mesma escolha repetida é idempotente;
- limpar remove somente `TripPlacePreference`;
- nenhuma ação cria ou remove Activity.

Candidatos externos ainda não são Place canônico. A ação transitória “Quero ir” continua revalidando/materializando o candidato antes de persistir `WANT`.

## 7. Detalhe do Place

O bloco de “Salvos” é substituído por “Minha seleção”.

O detalhe:

- mostra o estado atual;
- permite alterar intenção;
- permite alternar `Imperdível`;
- permite limpar preferência;
- explica explicitamente que preferência e Roteiro são estados independentes.

A adição manual ao Roteiro permanece disponível separadamente.

## 8. Minha seleção

A rota física continua:

```text
/viagens/[tripId]/lugares-salvos
```

O nome funcional exibido passa a ser **Minha seleção**.

A página:

- carrega todas as `TripPlacePreference` da Trip;
- resolve os Places associados;
- resume contagens por intenção;
- mostra intenção e prioridade por Place;
- permite alterar ou limpar a preferência;
- preserva mapa e distância;
- mantém adição manual ao Roteiro como ação separada;
- apresenta a edição direta de Dia somente para `WANT`, mantendo o detalhe como caminho secundário de adição manual para os demais estados.

## 9. Compatibilidade

- nenhum rename de rota;
- nenhum rename de tabela;
- `@routebook/saved-places` não é removido;
- aliases internos antigos podem permanecer durante a transição;
- dados migrados no RB-INC-201 aparecem como `Quero ir` sem prioridade.

## 10. Caminhos permitidos

```text
apps/web/package.json
apps/web/components/trip-context-nav.tsx
apps/web/components/trip-place-preference-controls.tsx
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/lugares/page.tsx
apps/web/app/viagens/[tripId]/lugares/actions.ts
apps/web/app/viagens/[tripId]/lugares/actions.test.ts
apps/web/app/viagens/[tripId]/lugares/[placeSlug]/page.tsx
apps/web/app/viagens/[tripId]/lugares-salvos/page.tsx
apps/web/app/viagens/[tripId]/lugares-salvos/actions.ts
apps/web/app/viagens/[tripId]/lugares-salvos/actions.test.ts
apps/web/e2e/active-trip-experience.spec.ts
apps/web/e2e/itinerary.spec.ts
apps/web/e2e/multi-destination-validation.spec.ts
pnpm-lock.yaml
docs/implementation/increments/rb-inc-202-trip-place-preference-ui.md
docs/implementation/context-packs/rb-inc-202-trip-place-preference-ui.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 11. Fora de escopo

- migration ou schema;
- remover Saved Places legado;
- renomear a rota física;
- candidate set da Itinerary Proposal;
- `includeMaybe`;
- Planning Role;
- ReplanningWindow;
- mudança automática de Activity;
- Provider novo;
- Preview ou Production.

## 12. Invariantes

- preferência não é Activity;
- `MUST_DO` somente com `WANT`;
- troca de `WANT + MUST_DO` para outra intenção zera prioridade;
- ausência é não avaliado;
- Clear não remove Activity;
- preferência não aplica Proposal;
- a mesma escolha repetida não cria duplicidade.

## 13. Testes obrigatórios

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O CI do PR também executa migrations existentes, smoke e Playwright/responsividade.

## 14. Critérios de aceite

- [ ] catálogo reflete a preferência atual;
- [ ] Quero ir, Talvez e Não tenho interesse podem ser selecionados;
- [ ] repetição é idempotente;
- [ ] Imperdível só existe sobre Quero ir;
- [ ] mudança para outra intenção zera MUST_DO;
- [ ] Clear volta para não avaliado;
- [ ] nenhuma ação de preferência altera Activity;
- [ ] detalhe reflete o mesmo estado;
- [ ] Minha seleção lista as três intenções;
- [ ] navegação usa Minha seleção;
- [ ] rota legada continua funcional;
- [ ] candidato externo “Quero ir” persiste WANT;
- [ ] nenhuma migration nova;
- [ ] validação integral do CI passa.

## 15. Rollback

O incremento não possui migration. O rollback técnico consiste em reverter a alteração de aplicação; os dados canônicos de `TripPlacePreference` permanecem compatíveis com o RB-INC-201.

## 16. Evidências

Pendentes do CI do pull request.
