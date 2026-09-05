---
id: RB-INC-180
title: Autocomplete de Destination e criação de Viagem sem dependência regional
description: Fecha a entrada do RouteBook Anywhere com sugestões de Destination provider-neutral e revalidação server-side antes da criação da Trip.
document_type: implementation-increment
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-04"
last_updated: "2026-09-05"
authors: [RouteBook Team]
tags: [implementation, trip, destination, autocomplete, routebook-anywhere, google-places]
related_documents: [RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-ADR-012, RB-DATA-002, RB-DATA-003, RB-OBS-001, RB-INC-174, RB-INC-179, RB-CTX-180]
prerequisites: [RB-INC-174, RB-INC-179]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-INC-180 — Autocomplete de Destination e criação de Viagem sem dependência regional

## 1. Contexto

- Issue: #428.
- Branch: `codex/rb-inc-180-destination-autocomplete`.
- Base: `main@604433b7eb403f577b7ca142eed12f28607d731b`.
- RB-INC-174 introduziu a porta `DestinationResolver`, Provenance e criação destination-agnostic, mas deixou autocomplete, Google e Production fora do escopo.
- RB-INC-179 provou São Paulo depois que a Trip já existe; a entrada da jornada ainda falha quando `ROUTEBOOK_DESTINATION_RESOLVER` não está configurado.
- O formulário atual usa texto livre em “Para onde você vai?” e não ajuda a desambiguar nomes enquanto o usuário digita.

## 2. Resultado vertical

O usuário digita um destino e recebe sugestões limitadas e acessíveis. Ao escolher uma sugestão, o navegador mantém somente uma referência externa opaca e o texto exibido. No submit, o servidor revalida essa referência no Provider e produz o `Destination` canônico antes de criar a Trip.

O fluxo deve funcionar sem regra regional para Pipa, São Paulo, Florianópolis ou qualquer outro destino suportado pelo Provider.

## 3. Decisões de desenho

### 3.1 Porta separada para sugestões

Autocomplete é uma capacidade distinta da resolução final. A camada web introduz uma porta de sugestões provider-neutral; nenhum DTO de Google/Nominatim atravessa para `@routebook/trip-management`.

A resposta pública contém apenas:

- referência externa estável/opaca;
- rótulo principal;
- texto secundário opcional;
- attribution necessária;
- identificador de sessão opaco quando o contrato do Provider exigir.

Coordenadas, timezone, tipos canônicos e Provenance não são confiados ao navegador.

A rota de sugestões é uma capacidade do workspace autenticado. Ela valida a sessão RouteBook antes de consultar qualquer Provider, impedindo que tráfego anônimo consuma quota externa. Todas as respostas permanecem `private, no-store` e `noindex`.

### 3.2 Google Places Autocomplete como adapter experimental

O adapter Google pode ser habilitado por configuração explícita e reutiliza `GOOGLE_PLACES_API_KEY` somente server-side.

- usa Places API (New) Autocomplete para sugestões;
- usa token de sessão por interação e encerra a sessão na resolução selecionada via Place Details;
- se a sessão já foi encerrada/tentada e a Trip não é persistida, a seleção é invalidada e o browser gera novo token antes de uma nova tentativa;
- limita resultados e campos solicitados;
- não expõe API key;
- não persiste resposta transitória de autocomplete;
- preserva attribution/branding aplicáveis;
- falha fechada quando configuração/secret estão ausentes;
- Production/billing continuam gate humano separado neste incremento.

RB-ADR-012 permanece em estado decisório interno `Proposed`; este incremento não o aceita nem o altera.

### 3.3 Nominatim não será usado para autocomplete

O adapter Nominatim do RB-INC-174 permanece apenas para resolução textual unitária por submit. O servidor público Nominatim não será chamado por tecla nem usado como suggestion provider.

### 3.4 Revalidação no submit

Quando existe seleção externa, a action de criação envia a identidade selecionada para um resolver server-side específico do Provider. O Place/Destination retornado é normalizado pelo mesmo contrato de `ResolvedDestination` e só então persistido.

Se o usuário alterar o texto depois de selecionar, a UI invalida a identidade anterior. Uma referência selecionada nunca pode resolver um texto diferente silenciosamente.

Se a revalidação consumir a sessão e uma etapa posterior falhar, o texto digitado permanece visível, mas a referência externa é limpa e uma nova sessão é iniciada. O usuário precisa reconfirmar a sugestão, evitando reutilizar sessão encerrada ou identidade antiga.

### 3.5 Degradação

- menos de 3 caracteres: nenhuma chamada externa;
- usuário sem sessão: rota rejeita a consulta antes do Provider;
- Provider de sugestões desabilitado: campo continua editável e informa que as sugestões estão indisponíveis;
- erro/timeout: sugestões degradam sem apagar o texto do usuário;
- submit sem seleção pode usar o resolver textual legado quando este estiver governadamente habilitado;
- falha posterior à resolução preserva texto, mas invalida referência/token consumidos;
- nenhum caso inventa coordenadas nem cria Trip parcial.

## 4. UX

O campo “Para onde você vai?” passa a se comportar como combobox:

1. após entrada mínima, aguarda debounce curto;
2. mostra estado de busca;
3. lista até cinco sugestões com contexto geográfico;
4. permite navegação por teclado e seleção;
5. anuncia estados de loading, vazio e erro para tecnologia assistiva;
6. mostra attribution do Provider quando aplicável;
7. ao selecionar, mantém o texto legível e a identidade externa separada;
8. ao editar novamente, limpa a seleção anterior;
9. após uma tentativa que consumiu a sessão sem criar a Trip, preserva o texto, limpa a identidade e abre uma nova sessão para reconfirmação.

O usuário não vê Place ID, coordenadas, timezone, API key ou termos técnicos internos.

## 5. Escopo

```text
.env.example
turbo.json
apps/web/app/api/destination-suggestions/route.ts
apps/web/app/api/destination-suggestions/route.test.ts
apps/web/app/viagens/nova/actions.ts
apps/web/app/viagens/nova/actions.test.ts
apps/web/app/viagens/nova/page.tsx
apps/web/app/viagens/nova/state.ts
apps/web/app/trip-creation.css
apps/web/components/destination-combobox.tsx
apps/web/components/destination-combobox.test.tsx
apps/web/components/trip-form.tsx
apps/web/components/trip-form.test.tsx
apps/web/e2e/authenticated-trips.spec.ts
apps/web/lib/destination-resolver.ts
apps/web/lib/destination-resolver.test.ts
apps/web/lib/destination-suggestions.ts
apps/web/lib/destination-suggestions.test.ts
docs/implementation/increments/rb-inc-180-destination-autocomplete.md
docs/implementation/context-packs/rb-inc-180-destination-autocomplete.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Mudança fora desses caminhos exige atualização deste incremento antes do commit.

## 6. Fora de escopo

- aceitar ou alterar RB-ADR-012;
- ativar billing ou criar projeto/credencial Google;
- ativar Google Autocomplete/Details em Production sem gate humano;
- usar Nominatim público para autocomplete;
- mudar Place Catalog, ranking, mídia ou Recommendation;
- alterar Discovery Region;
- mudar schema de domínio de Destination;
- persistir payload transitório de autocomplete;
- integrar na `main` sem autorização humana.

## 7. Critérios de aceite

- [ ] combobox acessível oferece sugestões enquanto o usuário digita;
- [ ] chamadas começam somente com entrada mínima e respeitam debounce/cancelamento;
- [ ] no máximo cinco sugestões são exibidas;
- [ ] rota de sugestões exige sessão autenticada antes de consumir Provider;
- [ ] API key nunca chega ao browser;
- [ ] coordenadas/timezone nunca são aceitos do cliente como fonte de verdade;
- [ ] seleção é revalidada server-side antes da persistência;
- [ ] editar o texto invalida a seleção anterior;
- [ ] sessão consumida não é reutilizada após falha posterior à resolução;
- [ ] ausência/timeout/erro do Provider degrada sem perder o texto digitado;
- [ ] submit não cria Trip parcial quando não consegue resolver Destination;
- [ ] Pipa e destino não-Pipa usam o mesmo contrato;
- [ ] E2E cobre criação não-Pipa pela nova interação;
- [ ] Nominatim continua sem autocomplete;
- [ ] Documentation e Engineering Validation ficam verdes no mesmo SHA;
- [ ] Vercel Preview valida sugestões, seleção e criação sem exposição de secret;
- [ ] Production permanece intocada;
- [ ] merge permanece gate humano explícito.

## 8. Riscos

| Risco | Mitigação |
| --- | --- |
| custo por tecla | debounce, mínimo de caracteres, limite de resultados, token de sessão e kill switch |
| abuso anônimo de quota | autenticação RouteBook obrigatória antes de qualquer chamada ao suggestion Provider |
| reutilização de sessão Google encerrada | revision de seleção limpa referência e gera token novo quando a criação falha após resolução |
| seleção errada | contexto geográfico no label + Place Details server-side antes da criação |
| stale request sobrescrever lista nova | AbortController e identidade da consulta atual |
| Place ID adulterado | revalidação server-side e comparação com texto selecionado |
| chave Google exposta | requests Google somente no servidor |
| dependência do Google entrar no domínio | portas/adapters ficam na camada web |
| indisponibilidade bloquear formulário | degradação explícita + resolver textual legado quando habilitado |
| política Nominatim violada | nenhum autocomplete é roteado ao Nominatim público |

## 9. Rollback

O incremento é aditivo na UI e nos adapters e não exige migration. Rollback remove autocomplete e restaura o submit textual do RB-INC-174 sem alterar Trips ou Provenance existentes.
