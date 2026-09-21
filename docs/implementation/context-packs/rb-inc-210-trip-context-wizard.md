---
id: RB-CTX-210
title: Context Pack do RB-INC-210 — Contexto progressivo do wizard
description: Delimita a integração do TravelerProfile existente ao segundo passo da preparação e a projeção derivada para a futura Revisão.
document_type: implementation-context-pack
owner: Experience and Traveler Profile
status: Draft
version: "0.1.0"
created: "2026-09-21"
last_updated: "2026-09-21"
authors: [RouteBook Team]
tags: [implementation, context-pack, wizard, traveler-profile, review]
related_documents: [RB-INC-210, RB-INC-005, RB-INC-207, RB-INC-208, RB-INC-209, RB-ADR-027, RB-ADR-028, RB-ADR-029, RB-CORE-0004, RB-DOM-001, RB-DOM-003]
prerequisites: [RB-INC-209]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-210 — Contexto progressivo do wizard

## 1. Missão

Implementar somente **Contexto**, a Etapa 2 de 4 da preparação, reutilizando `Trip`, `TravelerProfile` e `TripPlacePreference`.

Não gerar Proposal, Activity ou recomendação complementar.

## 2. Unidade de trabalho

- Issue: [#511](https://github.com/collapsy/Routebook/issues/511).
- Branch: `codex/issue-511-trip-context-wizard`.
- Base: `main@1267507c82f706c2cf812300e2552ebcff524947`.
- Incremento: RB-INC-210.
- Merge exige autorização humana explícita.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004;
3. `docs/README.md`;
4. RB-INC-005;
5. RB-INC-207 / RB-CTX-207;
6. RB-INC-208 / RB-CTX-208;
7. RB-INC-209 / RB-CTX-209;
8. RB-ADR-027, RB-ADR-028 e RB-ADR-029;
9. Domain de Trip, TravelerProfile, TripPlacePreference e Itinerary Proposal;
10. implementação atual de `/viagens/[tripId]/contexto`;
11. schema, repository e service de TravelerProfile;
12. Registry, matriz de rastreabilidade, Issues, PRs e CI.

## 4. Contratos herdados

`TravelerProfile` já contém:

- `travelerCount`;
- `interests`;
- `pace?`;
- `transportPreference?`;
- `budget?`.

`Trip` já contém destino, período, hospedagem, participantes e versão de contexto.

Nenhum novo conceito de domínio é necessário.

## 5. Decisões do corte

### Persistência progressiva

Cada grupo salva por meio do mesmo serviço canônico. A orquestração lê o perfil atual e preserva campos que pertencem a outros grupos.

### Primeiro grupo

Sem perfil persistido, o fluxo começa por quantidade de viajantes porque `TravelerProfile` exige valor entre 1 e 20.

Isso não transforma os campos opcionais em obrigatórios.

### Dados conhecidos

Destino, período, hospedagem e responsável são exibidos como resumo da Trip, sem cópia persistida no perfil.

### Revisão futura

A projeção `TripPreparationReviewModel` é derivada em memória e pode ser reconstruída das fontes autoritativas. Não existe tabela de preparação.

## 6. Caminhos permitidos

Somente os caminhos listados na seção 10 do RB-INC-210.

## 7. Proibições

- criar Wizard, WizardState, WizardSession ou tabela equivalente;
- duplicar Trip ou TravelerProfile em JSON de planejamento;
- adicionar migration por conveniência;
- criar ou remover Activity;
- gerar ou aplicar ItineraryProposal;
- gerar `ROUTEBOOK_RECOMMENDED`;
- preencher lacunas do roteiro;
- implementar replanejamento;
- criar links falsos para Revisão/Proposta;
- tocar Production;
- integrar na main sem autorização.

## 8. Verificações mínimas

- `preparar=1` atravessa Lugares → Contexto e retorno;
- Contexto aparece como Etapa 2 ativa;
- Lugares é navegável para trás;
- perfil novo começa no grupo obrigatório canônico;
- campos opcionais podem permanecer vazios;
- salvar um grupo não apaga os demais;
- recarregar preserva valores;
- dados da Trip aparecem sem ser regravados;
- TripPlacePreference não muda;
- Itinerary não muda;
- Proposal não surge;
- projeção da futura Revisão deriva, não persiste;
- rota fora do wizard permanece funcional;
- sem quebra mobile ou de teclado.

## 9. Gates

```bash
node scripts/validate-docs.mjs
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Executar E2E aplicável e usar CI como evidência autoritativa. Validar Vercel Preview do HEAD.

## 10. Gate humano

Quando PR, CI e Preview estiverem prontos, parar antes do merge e informar número da PR, HEAD SHA, Engineering Validation, Documentation Validation, Vercel e riscos restantes.
