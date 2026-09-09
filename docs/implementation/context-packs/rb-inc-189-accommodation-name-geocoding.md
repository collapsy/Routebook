---
id: RB-CTX-189
title: Context Pack do RB-INC-189 — geocodificação robusta de Hospedagem por nome
description: Delimita a seleção destination-aware de candidatos de geocoding para Hospedagem somente por nome, preservando o Provider e o fallback do RB-INC-181.
document_type: implementation-context-pack
owner: Trip Management
status: Draft
version: "0.1.0"
created: "2026-09-09"
last_updated: "2026-09-09"
authors: [RouteBook Team]
tags: [implementation, context-pack, trip, accommodation, geocoding, routebook-anywhere]
related_documents: [RB-INC-189, RB-INC-181, RB-CORE-0004, RB-DOM-001, RB-DOM-002, RB-ARC-001, RB-DATA-002, RB-DATA-003, RB-OBS-001]
prerequisites: [RB-INC-181]
next_documents: []
ai_context:
  priority: high
  index: true
---

# RB-CTX-189 — geocodificação robusta de Hospedagem por nome

## 1. Missão

Aumentar a taxa de resolução segura de Hospedagem informada somente por nome usando o Destination como contexto geográfico textual e estruturado, sem aceitar silenciosamente homônimos distantes ou ambíguos.

## 2. Unidade de trabalho

- Issue: #451;
- branch: `codex/rb-inc-189-accommodation-name-geocoding-rb181`;
- base: PR #431 / RB-INC-181 @ `0d86b0ca3eabcc27ad12ae0013d0f12c70c49259`;
- Provider: Nominatim existente;
- Preview: gate funcional;
- merge: gate humano;
- Production: fora de escopo.

## 3. Leitura obrigatória

1. `AGENTS.md`;
2. RB-CORE-0004 — RouteBook Bible;
3. `docs/README.md`;
4. RB-DOM-001 / RB-DOM-002;
5. RB-ARC-001;
6. RB-DATA-002 / RB-DATA-003;
7. RB-OBS-001;
8. RB-INC-181 / RB-CTX-181;
9. issue #451;
10. RB-INC-189 / este Context Pack.

## 4. Invariantes

- Accommodation continua opcional e pertencente à Trip;
- `coordinate` permanece contexto espacial opcional;
- Provider e parâmetros externos permanecem fora do domínio;
- o mesmo `Geocoder` continua sendo a porta da integração;
- Nominatim permanece consulta pontual por submit, nunca autocomplete;
- Destination fornece contexto, não regra regional;
- resultado inseguro equivale a ausência de coordenada, não a estimativa inventada;
- endereço completo mantém o comportamento já validado no RB-INC-181;
- fallback manual avançado permanece disponível;
- nenhuma mudança em Production ou `main` é autorizada por este incremento.

## 5. Alterações permitidas

```text
apps/web/lib/geocoding.ts
apps/web/lib/geocoding.test.ts
apps/web/lib/accommodation-geocoding.ts
apps/web/lib/accommodation-geocoding.test.ts
apps/web/e2e/authenticated-trips.spec.ts
docs/implementation/increments/rb-inc-189-accommodation-name-geocoding.md
docs/implementation/context-packs/rb-inc-189-accommodation-name-geocoding.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

Qualquer caminho adicional deve ser autorizado primeiro neste Context Pack e no Increment.

## 6. Contrato da porta Geocoder

A operação existente `geocode(query)` pode receber contexto opcional sem tornar o domínio dependente de Nominatim:

- `countryCode` opcional;
- `anchor` opcional com latitude/longitude do Destination;
- `maxDistanceKm` opcional;
- indicação de seleção conservadora/ambiguidade quando necessário.

Sem contexto, o comportamento permanece compatível com o contrato anterior.

## 7. Contrato name-only

Para Hospedagem sem endereço:

1. query = `nome da Hospedagem + Destination`;
2. contexto estruturado = país + coordenada do Destination quando disponíveis;
3. o texto do Destination serve para recuperação do Provider, enquanto país/âncora/raio continuam sendo a autoridade para aceitar ou rejeitar o resultado;
4. o adapter solicita no máximo uma pequena lista de candidatos em uma única chamada;
5. quando existe âncora e raio válidos, usar `viewbox` restritivo (`bounded=1`);
6. candidatos inválidos ou de país divergente são descartados;
7. candidatos além do raio são descartados;
8. candidatos praticamente co-localizados são tratados como uma mesma localização para fins de ambiguidade;
9. se dois candidatos distintos continuam competitivos, a resolução retorna `undefined`;
10. caso contrário, o candidato seguro é retornado.

O caso live `Hotel Palacio Maya` em `Panajachel, Guatemala` deve resolver o registro local `Hotel El Palacio Maya` quando o Provider o devolver para a query contextual, sem aceitar homônimo de outra cidade.

## 8. Contrato com endereço

- query continua sendo `endereço + Destination`;
- país pode ser usado como restrição adicional;
- não aplicar o raio rígido de name-only para não regredir endereços completos em Destinations amplos;
- o primeiro resultado válido do Provider continua sendo aceito quando não há conflito do contrato existente.

## 9. Limites espaciais

Os limites existem apenas para impedir homônimos claramente fora do Destination no fluxo name-only. Permanecem configurados em código testável, sem nomes de cidades ou países.

Para `Destination.type = city`, o limite é 40 km a partir da coordenada canônica do Destination. Esse valor rejeita cidades vizinhas claramente distintas sem exigir precisão de bairro ou endereço.

Os demais tipos canônicos preservam os limites já estabelecidos nesta branch enquanto não houver evidência live que justifique recalibração específica.

A implementação deve preferir falhar fechado em caso de dúvida. Se o Destination não oferecer coordenada válida, aplicar somente os sinais seguros disponíveis, como país, sem inventar âncora.

## 10. Testes mínimos

- compatibilidade de `Geocoder` sem contexto;
- múltiplos candidatos e seleção do mais próximo;
- `countryCode` aplicado e revalidado;
- `viewbox` restritivo com `bounded=1` quando há âncora/raio;
- candidato fora do raio rejeitado;
- candidato a aproximadamente 50 km de um Destination `city` rejeitado pelo raio de 40 km;
- dois candidatos distintos competitivos → `undefined`;
- duplicatas co-localizadas não bloqueiam candidato seguro;
- name-only envia `nome + Destination` e contexto estruturado;
- regressão realista `Hotel Palacio Maya` + `Panajachel, Guatemala` pode aceitar `Hotel El Palacio Maya` local retornado pelo Provider;
- endereço completo preserva query e comportamento do RB-INC-181;
- Provider error/no-result continuam degradando sem coordenadas;
- E2E determinístico prova save somente por nome e contexto espacial disponível.

## 11. Gates

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Documentation e Engineering Validation do GitHub são as evidências técnicas canônicas.

## 12. Gates humanos remanescentes

- Vercel Preview real do SHA final;
- prova funcional com `Hotel Palacio Maya` em `Panajachel, Guatemala`;
- prova funcional em ao menos um segundo Destination não-Pipa;
- qualquer mudança em Provider/comercialização;
- qualquer mudança em Production;
- integração na `main`.

## 13. Handoff

Relatar SHA, arquivos alterados, estratégia textual/espacial, testes reais, comportamento de ambiguidade/distância, estado do Preview e riscos/gates restantes.
