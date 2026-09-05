---
id: RB-CTX-180
title: Context Pack do RB-INC-180 — Destination autocomplete
description: Delimita autocomplete provider-neutral, revalidação server-side e criação não-regional de Trip sem ativar Production ou billing.
document_type: implementation-context-pack
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-04"
last_updated: "2026-09-05"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip, destination, autocomplete, routebook-anywhere]
related_documents: [RB-INC-180, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-ADR-012, RB-DATA-002, RB-DATA-003, RB-OBS-001, RB-INC-174, RB-INC-179]
prerequisites: [RB-INC-174, RB-INC-179]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-180 — Destination autocomplete

## 1. Missão

Fechar a entrada do RouteBook Anywhere: ajudar o usuário a escolher um Destination enquanto digita e garantir que a identidade externa seja revalidada server-side antes da criação da Trip.

## 2. Unidade de trabalho

- Issue: #428;
- branch: `codex/rb-inc-180-destination-autocomplete`;
- base: `main@604433b7eb403f577b7ca142eed12f28607d731b`;
- merge: gate humano;
- Production/billing: fora de escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RouteBook Bible;
3. `docs/README.md`;
4. RB-DOM-001 / RB-DOM-002;
5. RB-ARC-001;
6. RB-ADR-012;
7. RB-DATA-002 / RB-DATA-003;
8. RB-OBS-001;
9. RB-INC-174 / RB-CTX-174;
10. RB-INC-179;
11. RB-INC-180 / este Context Pack.

## 4. Invariantes

- Destination não é Place;
- Pipa é regressão, não default;
- Provider e DTO externo ficam fora do domínio;
- navegador não é fonte de verdade para coordenadas, timezone ou identidade canônica;
- resultado ambíguo não vira identidade inventada;
- falha de Provider não cria Trip parcial;
- editar o texto depois da seleção invalida a identidade selecionada;
- sessão de autocomplete encerrada/tentada não é reutilizada após uma falha posterior à resolução;
- API keys e secrets permanecem server-side;
- rota de sugestões exige sessão RouteBook antes de consumir quota externa;
- Nominatim público não recebe autocomplete;
- RB-ADR-012 continua `Proposed` na dimensão decisória;
- Production, billing e merge permanecem gates humanos.

## 5. Alterações permitidas

Somente os caminhos listados no RB-INC-180.

## 6. Regras de Provider

### Suggestion Provider

- default: desabilitado;
- Google Places Autocomplete: adapter explícito por configuração;
- entrada mínima: 3 caracteres;
- debounce no browser: aproximadamente 300 ms;
- máximo de 5 sugestões exibidas;
- requests obsoletos são cancelados/ignorados;
- sessão de autocomplete possui token opaco próprio;
- se uma tentativa encerra/tenta encerrar a sessão via resolução e a Trip não é persistida, a UI preserva o texto, limpa a referência e gera token novo antes da reconfirmação;
- endpoint valida autenticação antes de consultar o Provider;
- respostas da rota permanecem `private, no-store` e `noindex`;
- API key nunca é serializada para o browser;
- payload transitório não é persistido.

### Resolver final

- seleção externa é revalidada server-side por Place Details;
- somente após revalidação o contrato `ResolvedDestination` é produzido;
- timezone continua derivado localmente pelo lookup já introduzido no RB-INC-174;
- Provenance continua persistida atomicamente junto com a Trip;
- submit textual sem seleção só usa resolver legado quando este estiver configurado.

### Nominatim

- continua permitido apenas no contrato unitário do RB-INC-174;
- nunca é chamado por tecla/autocomplete;
- permanece bloqueado em Production pelo contrato atual.

## 7. UX obrigatória

- combobox/listbox com roles e estados ARIA corretos;
- loading, vazio e erro recuperável;
- teclado: setas, Enter e Escape;
- clique/touch em sugestão;
- contexto geográfico suficiente para homônimos;
- attribution visível quando exigida;
- texto do usuário não desaparece em falha de rede ou falha posterior à resolução;
- identidade/token consumidos são renovados sem apagar o texto visível;
- campos técnicos permanecem invisíveis.

## 8. Testes mínimos

- suggestion adapter normaliza Google válido e limita resultados;
- provider ausente/secret ausente/falha/timeout degradam corretamente;
- rota rejeita usuário anônimo antes de chamar Provider;
- rota autenticada não vaza API key;
- requests com menos de 3 caracteres não chamam Provider;
- componente aplica debounce e ignora resposta obsoleta;
- componente permite seleção por teclado e mouse;
- editar após seleção limpa referência externa;
- falha após sessão consumida preserva texto, limpa identidade e troca token;
- action revalida referência externa e cria Trip válida;
- action rejeita referência adulterada/mismatch sem Trip parcial;
- action incrementa revision de seleção quando a resolução/persistência falha após uso da seleção;
- Pipa mantém regressão;
- E2E cria destino não-Pipa pela nova experiência;
- CI completo desktop/mobile.

## 9. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

O CI do GitHub e o Vercel Preview do mesmo SHA são a evidência canônica.

## 10. Gates humanos remanescentes

- ativar/configurar Google Places Autocomplete/Details em Preview para prova live do Provider;
- ativar/configurar Google Places Autocomplete/Details em Production;
- qualquer billing/quota comercial nova;
- aceitar ou alterar RB-ADR-012;
- integrar na `main`.

## 11. Handoff

Relatar SHA final, arquivos alterados, configuração Preview necessária, testes, CI, Preview, comportamento entregue, degradação, custo/budget observado, riscos e gates humanos restantes.
