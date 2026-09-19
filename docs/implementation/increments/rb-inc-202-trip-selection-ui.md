---
id: RB-INC-202
title: Minha seleção e preferências de lugar na interface
description: Expõe TripPlacePreference em Explorar, Detalhes e Minha seleção, com intenção, Imperdível e estado planejado derivado.
document_type: implementation-increment
owner: Delivery
status: Draft
version: "0.1.0"
created: "2026-09-18"
last_updated: "2026-09-18"
authors: [RouteBook Team]
tags: [implementation, trip-collection, ux, trip-place-preference, selection]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-DOM-003, RB-DOM-004, RB-UX-001, RB-UX-002, RB-UX-005, RB-ADR-028, RB-INC-200, RB-INC-201, RB-CTX-202]
prerequisites: [RB-INC-201]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-202 — Minha seleção e preferências de lugar na interface

## 1. Estado

`Draft`

- issue: [#489](https://github.com/collapsy/Routebook/issues/489);
- branch: `codex/issue-489-trip-selection-ui`;
- base: `origin/main@d2887427aa84834d8074c538f091fcb5898f86f6`.

## 2. Resultado vertical

O viajante deixa de interagir com uma escolha binária “salvar/remover” como linguagem principal e passa a registrar intenção explícita por Place:

- `WANT` → **Quero ir**;
- `MAYBE` → **Talvez**;
- `NOT_INTERESTED` → **Não tenho interesse**;
- `MUST_DO` sobre WANT → **Imperdível**.

A rota física `/lugares-salvos` permanece por compatibilidade, mas sua interface passa a ser **Minha seleção**.

## 3. Problema

RB-INC-201 publicou a persistência canônica, porém a interface ainda usava Saved Place como experiência principal e escondia MAYBE, NOT_INTERESTED e MUST_DO. Isso mantinha o produto visualmente incompatível com RB-ADR-028 e com a arquitetura de informação já aprovada.

## 4. Escopo

- helper de aplicação web para set/clear de TripPlacePreference;
- Explorar Lugares:
  - estado atual por Place;
  - Quero ir / Talvez / Não tenho interesse;
  - limpar preferência;
- candidatos externos:
  - intenção escolhida é preservada após materialização;
- Detalhes:
  - preferência explícita;
  - Imperdível;
  - limpar preferência;
- Minha seleção:
  - WANT, MAYBE e NOT_INTERESTED;
  - resumo por intenção;
  - filtro por categoria;
  - Imperdível;
  - Planejado / Ainda não planejado derivado do Itinerary;
  - alteração e limpeza de preferência;
  - Adicionar ao roteiro somente como ação manual secundária, independente da intenção atual;
- navegação e visão geral com o rótulo Minha seleção;
- autorização `trip:edit` nas mutações da coleção;
- ajuste dos textos de compatibilidade em Roteiro/Mapa para eliminar “Salvos” como linguagem visível;
- atualização dos E2Es afetados pela mudança de linguagem e comportamento;
- testes e documentação.

## 5. Contrato visual

### Explorar e Detalhes

A ação primária de planejamento é expressar preferência.

```text
Quero ir | Talvez | Não tenho interesse
```

Limpar retorna o Place ao estado não avaliado.

### Minha seleção

A área lista somente Places que possuem TripPlacePreference.

O estado planejado é derivado:

```text
Planejado = existe Activity ativa com o mesmo placeId
```

Activities com status `removed` ou `cancelled` não contam como planejamento ativo.

## 6. Invariantes preservadas

- preferência não cria Activity;
- preferência não remove Activity;
- intenção não bloqueia uma adição manual explícita ao Roteiro;
- limpar preferência não altera o Roteiro;
- MUST_DO só existe com WANT;
- trocar intenção preserva a identidade da preferência;
- NOT_INTERESTED continua sendo preferência explícita;
- ausência continua significando não avaliado.

## 7. Compatibilidade

A rota `/lugares-salvos` não é renomeada neste incremento.

Motivos:

- preservar links existentes;
- evitar mudança de roteamento no mesmo incremento de comportamento;
- permitir depreciação controlada posterior.

O adapter `@routebook/saved-places` também não é removido aqui.

## 8. Candidatos externos

Quando um candidato externo ainda não possui Place canônico:

1. a ação revalida o candidato no servidor;
2. promove/materializa o Place;
3. aplica a intenção escolhida via TripPlacePreference;
4. permanece na experiência de Explorar.

Nenhum dado externo enviado pelo browser é tratado como fonte autoritativa.

## 9. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/lugares/**
apps/web/app/viagens/[tripId]/lugares-salvos/**
apps/web/app/viagens/[tripId]/page.tsx
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/components/trip-context-nav.tsx
apps/web/components/trip-map.tsx
apps/web/components/trip-map.test.tsx
apps/web/e2e/**
apps/web/lib/trip-place-preference.ts
apps/web/lib/trip-place-preference.test.ts
apps/web/package.json
pnpm-lock.yaml
docs/implementation/increments/rb-inc-202-trip-selection-ui.md
docs/implementation/context-packs/rb-inc-202-trip-selection-ui.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 10. Somente leitura

```text
modules/**
packages/database/**
docs/core/**
docs/domain/**
docs/ux/**
docs/architecture/**
```

## 11. Fora de escopo

- renomear fisicamente `/lugares-salvos`;
- remover Saved Places;
- alterar schema/migration;
- alterar geração de Proposal;
- implementar `includeMaybe`;
- Planning Role na interface;
- ReplanningWindow;
- replanejamento automático;
- Preview/Production.

## 12. Testes obrigatórios

```bash
pnpm install --frozen-lockfile
pnpm --filter @routebook/web test
pnpm --filter @routebook/web lint
pnpm --filter @routebook/web typecheck
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

O CI também executa smoke e Playwright.

## 13. Critérios de aceite

- [ ] Explorar exibe e altera as três intenções;
- [ ] Detalhes exibe e altera preferência;
- [ ] Minha seleção lista WANT, MAYBE e NOT_INTERESTED;
- [ ] Imperdível só aparece/aplica sobre WANT;
- [ ] Minha seleção permite limpar preferência;
- [ ] filtro por categoria funciona;
- [ ] Planejado é derivado de Activity ativa;
- [ ] alterar ou limpar preferência não altera Activity;
- [ ] candidato externo preserva intenção escolhida;
- [ ] navegação usa Minha seleção;
- [ ] rota legada continua funcional;
- [ ] mutações exigem autorização;
- [ ] regressão integral permanece verde.

## 14. Riscos

- a URL ainda contém `lugares-salvos`, embora o significado visível já seja Minha seleção;
- Proposal ainda não consome a coleção como candidate set autoritativo;
- Planning Role ainda não está visível;
- NOT_INTERESTED permanece armazenado e exibido na coleção, mas sua exclusão da Proposal será integrada em incremento posterior.

## 15. Rollback

Reverter o incremento retorna a UI ao adapter legado sem alterar os dados canônicos já persistidos por RB-INC-201.

## 16. Evidências

Pendentes do CI do pull request.
