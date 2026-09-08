---
id: RB-CTX-188
title: Context Pack do RB-INC-188 — Fotos reais e qualidade do catálogo
description: Delimita a generalização de mídia real para qualquer Destination, o fallback compacto sem foto e a filtragem conservadora de POIs genéricos na Discovery.
document_type: implementation-context-pack
owner: Place Catalog and Traveler Experience
status: Draft
version: "0.1.0"
created: "2026-09-08"
last_updated: "2026-09-08"
authors: [RouteBook Team]
tags: [implementation, context-pack, places, images, discovery, quality, mobile, destination-agnostic]
related_documents: [RB-INC-188, RB-CORE-0004, RB-UX-006, RB-DOM-001, RB-DOM-002, RB-ARC-003, RB-INC-141, RB-INC-143, RB-INC-162, RB-INC-168, RB-INC-170, RB-INC-172, RB-INC-186, RB-INC-187]
prerequisites: [RB-INC-187]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-188 — Fotos reais e qualidade do catálogo

## 1. Missão

Fazer com que **Explorar Lugares** seja visual e confiável em qualquer Destination: priorizar fotografia real corretamente atribuída, degradar de forma compacta quando não houver foto e impedir que registros externos claramente genéricos sejam tratados como opções de viagem normais.

A missão não é aumentar cobertura a qualquer custo. Mídia errada ou identidade inventada é pior que ausência de mídia.

## 2. Unidade de trabalho

- issue: `#446`;
- branch: `codex/rb-inc-188-real-place-media-quality`;
- base: `4ad856aeadeed25eff2f1670ee9015d2d8823824` do RB-INC-187 / PR #445;
- PR deve ser Draft e apontar para `codex/rb-inc-187-trustworthy-microcopy`;
- cadeia permanece empilhada;
- merge em `main`, Production e expansão de Provider pago continuam gates humanos.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004 — visual antes de texto quando melhora compreensão; transparência antes de persuasão; não inventar precisão;
3. `docs/README.md`;
4. RB-UX-006 — clareza, concisão, próximo passo e distinção de fato/estimativa;
5. RB-DOM-001 / RB-DOM-002 — significado de Place e linguagem ubíqua;
6. RB-ARC-003 — integração externa, Provenance e degradação;
7. RB-INC-141 — `Place.primaryImage`;
8. RB-INC-143 — materialização governada de imagens reais;
9. RB-INC-162 — preview externo Wikimedia e fronteira de bytes;
10. RB-INC-168 — qualidade/ranking provider-neutral;
11. RB-INC-170 — fallback ilustrativo por categoria;
12. RB-INC-172 — ranking visível e Provider de quality signals;
13. RB-INC-186 — hierarquia progressiva dos cards;
14. RB-INC-187 — microcopy de confiança;
15. RB-INC-188 / este Context Pack.

## 4. Evidência que disparou o incremento

No Preview mobile do RB-INC-187, a inspeção humana mostrou um card de Gastronomia chamado `Sobremesa` com uma ilustração de categoria grande, ranking expandido, Provenance Overture e ação `Calcular rota real`.

O feedback humano foi explícito:

- a ilustração genérica não agrada como representação do Lugar;
- remover todas as imagens também não serve, pois o catálogo ficaria vazio;
- a experiência precisa buscar **imagens reais do lugar**;
- cards continuam visualmente grandes e com informação de sistema demais;
- a qualidade do próprio POI precisa ser questionada.

Esse feedback reprova o aceite visual da cadeia atual sem invalidar os gates automatizados já verdes do RB-INC-187.

## 5. Achado arquitetural prioritário

A capacidade de preview externo está hardcoded para Pipa:

```text
route.ts
  destinationId === pipa-rn-br
  coordinates dentro de bounds de Pipa/Tibau do Sul

wikimedia-place-image.ts
  query = "<place>" Pipa Tibau do Sul
  secure = identidade + metadata contendo Pipa|Tibau do Sul
```

Antes de otimizar CSS, remover essa dependência é obrigatório. Caso contrário qualquer Destination generalizado continuará caindo no fallback por definição.

## 6. Invariantes de mídia

- `Place.primaryImage` válida tem precedência;
- preview Wikimedia é read-only e não transforma candidato em Place canônico;
- fotografia externa só aparece com identidade `secure`, autor e licença aceitos;
- Destination dinâmico substitui Pipa fixo;
- coordenada valida localização, mas proximidade sozinha não prova identidade;
- nome genérico não pode obter foto `secure` apenas por contexto local;
- browser não hotlinka Provenance;
- proxy RouteBook continua restringindo host, caminho, MIME, redirect e tamanho;
- ausência/erro/ambiguidade não produz fotografia;
- não usar IA generativa para criar uma foto factual de Lugar;
- não usar foto genérica do Destination como se fosse o estabelecimento.

## 7. Contrato de contexto de mídia

A implementação deve tornar explícito o contexto local usado na busca/classificação. O formato pode ser refinado durante o trabalho, mas deve derivar somente de dados reais já disponíveis na viagem/candidato:

```text
name
latitude
longitude
destinationName
countryCode?
addressLabel?
```

Requisitos:

- limites de tamanho e normalização;
- strings vazias não viram sinal;
- Destination não é identity do Place;
- endereço pode reforçar localidade, mas não substituir nome distintivo;
- Pipa continua apenas como um Destination possível;
- nenhuma allowlist regional fixa.

## 8. Invariantes de qualidade dos candidatos

A validação técnica de `ExternalPlaceCandidate` continua separada da **utilidade traveler-facing**.

A nova política de elegibilidade deve:

- reconhecer nomes claramente genéricos com alta confiança;
- não confundir categoria/produto com estabelecimento;
- preservar nomes distintivos válidos;
- permanecer determinística;
- ser testável sem rede;
- não depender de Pipa;
- não usar Overture confidence como rating;
- não exigir foto/rating para manter um candidato válido;
- não alterar identidade persistida silenciosamente.

Começar conservador: rejeitar apenas casos inequivocamente ruins. Ambiguidade que exigiria nova semântica de Domain deve virar trabalho futuro, não heurística agressiva.

## 9. Hierarquia visual alvo

### Foto real disponível

A foto pode ser o hero. Abaixo dela: categoria, nome, distância, sinal real de qualidade quando houver, CTA principal e Salvar.

### Foto real indisponível

O card não reserva a mesma área de hero para uma ilustração genérica. O estado visual deve ser menor e neutro, preservando ritmo e consistência da lista.

A diferença entre esses estados deve ser clara sem texto longo de justificativa.

## 10. Ranking e Provenance

RB-INC-186/187 continuam válidos:

- não fabricar Score/rating/Top;
- posição baseada apenas em ordenação por proximidade não precisa de explicação proeminente;
- `Entender este ranking` só deve existir quando acrescentar evidência que muda a decisão;
- Fonte/licença continuam acessíveis quando obrigatórias;
- Provider não vira badge dominante;
- atribuição da fotografia permanece disponível conforme licença.

## 11. Rota e distância

- `Ver rota` substitui `Calcular rota real` como rótulo traveler-facing;
- comportamento de Google Maps/destino semântico não muda;
- origem pode continuar hospedagem quando disponível ou ser omitida conforme contratos existentes;
- distância calculada pelo RouteBook continua marcada `em linha reta`;
- referência deve preferir `hospedagem` quando ela for de fato a origem;
- não chamar distância em linha reta de rota.

## 12. Ordem de implementação

### Lote A — mídia destination-agnostic

1. testes que demonstram o hardcode atual;
2. contexto dinâmico no adapter Wikimedia;
3. endpoint sem allowlist/bounds de Pipa;
4. Pipa + dois Destinations zero-seed;
5. preservar segurança/cache/proxy.

### Lote B — elegibilidade de candidatos

1. inventário de nomes genéricos observados;
2. política conservadora test-first;
3. integração na normalização Overture;
4. regressão de praias/categorias/deduplicação.

### Lote C — card e fallback

1. remover hero ilustrativo dominante quando não houver foto real;
2. ajustar densidade mobile;
3. reduzir ranking sem evidência;
4. `Ver rota`;
5. Provenance/atribuição em segundo nível.

### Lote D — validação

1. unit/component tests;
2. E2E multi-destino;
3. CI completo;
4. Vercel READY;
5. inspeção humana mobile obrigatória.

Cada lote deve registrar evidência antes → depois na PR ou no incremento antes de ampliar o escopo.

## 13. Caminhos permitidos

Somente os caminhos listados no RB-INC-188. Arquivo adicional indispensável exige atualização prévia do Increment e deste Context Pack.

## 14. Testes mínimos

- query Wikimedia não contém Pipa para outro Destination;
- match seguro usa contexto dinâmico e continua fail-closed;
- Pipa não regride;
- endpoint aceita coordenadas globais válidas e rejeita inputs inválidos;
- nomes genéricos inequivocamente ruins são filtrados;
- estabelecimentos válidos permanecem;
- ausência de foto real não renderiza ilustração hero;
- fotografia real mantém precedência;
- atribuição/licença continuam auditáveis;
- rota e distância preservam semântica;
- pelo menos três Destinations no E2E total: Pipa + dois zero-seed.

## 15. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation e Engineering Validation precisam ficar verdes no mesmo SHA final. Preview Vercel do mesmo SHA precisa ficar READY e ser revisado visualmente em mobile.

## 16. Gate humano de fotos pagas

Wikimedia destination-agnostic deve ser implementado e medido primeiro.

Se a cobertura real continuar insuficiente, sobretudo em Gastronomia e Vida noturna, não expandir silenciosamente o Google Places já usado para ranking. Google Places Photos implica novo campo/endpoints, quota, termos e custo; requer autorização humana explícita em incremento/decisão separados.

Production permanece fora de escopo.