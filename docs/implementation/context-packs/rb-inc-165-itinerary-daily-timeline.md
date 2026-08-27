---
id: RB-CTX-165
title: Context Pack do RB-INC-165 — Roteiro diário operacional e timeline contextual
description: Delimita o redesign do Roteiro para priorizar Dia, timeline, deslocamentos e mapa contextual sem alterar domínio ou persistência.
document_type: implementation-context-pack
owner: Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-08-21"
last_updated: "2026-08-21"
authors: [RouteBook Team]
tags: [implementation, context-pack, itinerary, timeline, mobile, map]
related_documents: [RB-INC-165, RB-CORE-0004, RB-PRD-002, RB-UX-002, RB-UX-004, RB-UX-005, RB-INC-159, RB-INC-160, RB-INC-161, RB-INC-136]
prerequisites: [RB-INC-159, RB-INC-160, RB-INC-161]
next_documents: [RB-INC-136]
ai_context:
  priority: high
  index: true
---

# RB-CTX-165 — Roteiro diário operacional e timeline contextual

## 1. Missão do executor

Transformar o Roteiro em uma superfície operacional do Dia, alinhada aos fluxos, wireframes e especificações de interação canônicos, reduzindo ruído visual sem remover capacidades existentes ou alterar estado de domínio.

## 2. Incremento

- ID: `RB-INC-165`;
- issue: `#386`;
- branch: `codex/rb-inc-165-itinerary-daily-timeline`;
- baseline: `21a0ca5521f507c8c2b3264a7303155417c1cfdf`;
- ambiente de aceite: Vercel Preview;
- merge e Production permanecem gates humanos separados.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/README.md`;
4. `docs/product/mvp-definition.md`;
5. `docs/ux/user-flows.md`, especialmente RB-UF-010 a RB-UF-016;
6. `docs/ux/wireframes.md`, especialmente RB-WF-MOB-018/019/020/022 e RB-WF-DESK-008;
7. `docs/ux/interaction-specifications.md`, especialmente RB-INT-050 a RB-INT-062 e RB-INT-096;
8. `docs/implementation/increments/rb-inc-159-place-actions-itinerary-entry.md`;
9. `docs/implementation/increments/rb-inc-160-pipa-trip-guide.md`;
10. `docs/implementation/increments/rb-inc-161-active-trip-mobile-experience.md`;
11. `docs/implementation/context-packs/rb-inc-161-active-trip-mobile-experience.md`;
12. `docs/implementation/increments/rb-inc-165-itinerary-daily-timeline.md`;
13. `docs/cicd/continuous-integration-delivery-and-release-strategy.md`.

## 4. Contratos preservados

- Roteiro continua sendo planejamento editável organizado por Dia, Atividade, deslocamento e tempo livre;
- Saved Place não é Activity;
- Proposal não é estado aplicado;
- Recommendation não é Decision;
- query `dia` válida representa intenção explícita e vence foco automático em Hoje;
- ordem canônica da Activity continua vindo do Itinerary;
- mapa e timeline devem representar a mesma sequência sem inferência silenciosa;
- distância interna continua geodésica/estimada e qualificada como tal;
- rota real permanece externa quando disponível;
- Activity manual sem Place continua válida e legível;
- Free Period continua distinto de Activity, pode permanecer protegido e mantém seus Server Actions de criação, edição e remoção;
- redirects de Free Period continuam sendo parte do contrato Server Action e devem ser validados pela resposta quando a navegação cliente for assíncrona;
- leitura do Roteiro não cria mutations adicionais;
- evidência técnica não substitui M8 real.

## 5. Regras de UX

- o usuário deve chegar ao Dia e à timeline no primeiro viewport útil;
- instrução de processo não deve ocupar prioridade superior ao plano do Dia;
- navegação contextual da Viagem substitui a jornada redundante 1/2/3/4;
- seletor de Dias deve permanecer horizontal/compacto no mobile e claro no desktop;
- `Hoje` deve ser texto explícito;
- Atividade deve exibir primeiro horário, título e duração/contexto principal;
- ações de manutenção devem ser contextuais e não dominar o card;
- nenhum gesto pode ser caminho exclusivo;
- deslocamento deve aparecer entre os passos aos quais pertence, não apenas em um relatório separado;
- mapa deve permanecer relacionado ao Dia selecionado e complementar à timeline;
- no mobile, timeline precede mapa;
- estados indisponíveis devem degradar sem dados inventados;
- Períodos livres permanecem legíveis dentro do Dia sem exigir o cabeçalho estrutural antigo do card;
- Proposta e Revisão devem permanecer acessíveis sem transformar Roteiro em wizard linear.

## 6. Caminhos permitidos

Somente os caminhos declarados no RB-INC-165 podem ser alterados. Isso inclui `apps/web/e2e/free-period.spec.ts` apenas para alinhar as regressões ao contrato Server Action/persistência após a nova composição visual. A exceção transitória `.github/workflows/rb-inc-165-assembly-helper.yml` está autorizada apenas para a montagem mecânica descrita no incremento e deve remover a si própria no mesmo ciclo. Arquivo adicional exige atualização explícita do incremento e deste Context Pack antes da mudança e justificativa na PR.

## 7. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @routebook/web exec playwright test e2e/itinerary.spec.ts e2e/active-trip-experience.spec.ts e2e/free-period.spec.ts e2e/place-actions.spec.ts
```

Engineering Validation e Documentation Validation devem concluir no mesmo SHA.

O aceite funcional exige Preview Vercel READY do head final. Merge e Production continuam gates humanos separados.

## 8. Proibições

- não alterar domínio de Activity, Itinerary ou Free Period;
- não alterar os Server Actions de Free Period apenas para satisfazer expectativa de markup ou navegação de teste;
- não persistir estado visual, Dia atual ou ordem paralela;
- não autoaplicar Guia, Recommendation, Decision ou Proposal;
- não inventar distância, rota, horário ou localização;
- não criar Activity ao apenas abrir ou reorganizar visualmente a página;
- não introduzir Provider, SDK, API paga, secret, migration ou dependência;
- não remover alternativa acessível de reordenação;
- não depender apenas de drag-and-drop;
- não tratar cor como único indicador;
- não fechar M8 por CI ou Preview;
- não fazer merge nem promover Production sem autorização humana separada.

## 9. Handoff

Relatar:

- hierarquia do Roteiro entregue;
- comportamento da timeline e deslocamentos;
- comportamento desktop/mobile do mapa;
- ações contextuais preservadas;
- comportamento de Free Period preservado;
- arquivos alterados;
- testes executados e resultados reais;
- SHA dos gates;
- Preview Vercel do mesmo head;
- riscos residuais;
- issue e PR;
- decisão humana pendente para merge/Production.

## 10. Exceção operacional temporária

O helper `.github/workflows/rb-inc-165-assembly-helper.yml` pode somente: inserir as duas entradas de RB-165 no Registry, aplicar substituições mecânicas nos E2E já autorizados para abrir o menu contextual antes das ações, trocar a categoria técnica por microcopy legível no Roteiro, executar Prettier nos arquivos afetados, remover a si próprio e criar o commit resultante. Não pode tocar domínio, dados, migrations, Providers, secrets, Production ou workflows canônicos e não pode permanecer no diff final da PR.