---
id: RB-CTX-136
title: Context Pack do RB-INC-136 — Validação Real do MVP em Pipa
description: Fornece o contexto mínimo e as restrições para preparar, executar e registrar a validação real M8 sem fabricar evidência humana ou expor dados pessoais.
document_type: implementation-context-pack
owner: Product and Quality Engineering
status: Draft
version: "0.1.0"
created: "2026-08-14"
last_updated: "2026-08-20"
authors: [RouteBook Team]
tags: [context-pack, mvp-validation, m8, pipa, product-validation, privacy]
related_documents: [RB-INC-136, RB-CORE-0004, RB-PRD-002, RB-DEL-001, RB-QA-001, RB-OBS-001, RB-PRIV-001, RB-INC-129, RB-INC-132, RB-INC-134, RB-INC-135]
prerequisites: [RB-INC-129, RB-INC-132, RB-INC-134, RB-INC-135]
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-CTX-136 — Validação Real do MVP em Pipa

## 1. Missão do executor

Preparar e, quando existir uso humano real, registrar a validação M8 do RouteBook sem transformar automação, suposição ou inferência em evidência de experiência do usuário.

## 2. Incremento

- ID: `RB-INC-136`;
- Issue: `#319`;
- Draft PR de preparação: `#374`;
- arquivo: `docs/implementation/increments/rb-inc-136-m8-real-validation.md`;
- branch de preparação atual: `codex/rb-inc-136-m8-phase-a-reconciliation`;
- baseline da reconciliação: `bef09b68ce631073fb9d4b5a203a1ca462f1befd`;
- branch histórica preservada: `codex/rb-inc-136-m8-real-validation`, divergente da `main` atual;
- janela canônica da viagem: 22 a 29 de agosto de 2026.

## 3. Leitura obrigatória

Antes de alterar o escopo, ler nesta ordem:

1. `AGENTS.md`;
2. `docs/core/routebook-bible.md`;
3. `docs/product/mvp-definition.md` (`RB-PRD-002`);
4. `docs/delivery/delivery-strategy-and-implementation-roadmap.md` (`RB-DEL-001`);
5. `docs/quality/quality-and-testing-strategy.md` (`RB-QA-001`);
6. documentos aplicáveis de observabilidade e privacidade;
7. `docs/implementation/increments/rb-inc-129-mvp-production-validation.md`;
8. `docs/implementation/increments/rb-inc-132-place-discovery-filters.md`;
9. `docs/implementation/increments/rb-inc-134-production-public-access.md`;
10. `docs/implementation/increments/rb-inc-135-pipa-catalog-m8-readiness.md`;
11. este Context Pack e o RB-INC-136.

## 4. Conceitos relevantes

| Termo oficial | Interpretação necessária |
| --- | --- |
| MVP Validation | validação de valor e uso real; não equivale a CI verde |
| Session | período real de uso observado/relatado com objetivo identificável |
| Evidence | registro verificável de comportamento, feedback, sistema ou síntese referenciada |
| Friction | dificuldade que aumenta esforço, confusão ou risco na jornada |
| Decision | escolha real apoiada, alterada, confirmada ou não resolvida pelo RouteBook |
| `not_measured` | ausência legítima de evidência; não é falha de cobertura a ser inventada |
| M8 | marco de validação do MVP em cenário real definido no roadmap |

## 5. Invariantes

- CI, E2E e health comprovam qualidade técnica, não satisfação ou valor humano;
- evidência de comportamento só pode ser registrada se observada ou relatada explicitamente;
- sínteses `derived` devem apontar para evidências primárias;
- ausência de ocorrência natural deve permanecer `not_measured`;
- nenhum problema encontrado pode ser apagado para melhorar a decisão M8;
- dados pessoais devem ser minimizados e sanitizados antes de documentação pública;
- Product Validation de um usuário não pode ser descrita como validação universal de mercado;
- aceite funcional de outro incremento não equivale a Session M8 nem pode sustentar H1–H10;
- M8 não pode ser encerrado antes da existência de uso real revisado.

## 6. Decisões aplicáveis

- Production permanece pública na camada Vercel e protegida pela autenticação/autorização do RouteBook;
- Preview permanece protegido;
- PostgreSQL/Neon e Vercel seguem como providers já aprovados; este incremento não reabre essas decisões;
- o catálogo curado de Pipa entregue pelo RB-INC-135 é a base inicial do piloto; incrementos posteriores podem ampliar a experiência, mas não substituem evidência humana do M8;
- o piloto não exige ativação de tracking de terceiros para ser válido;
- problemas de produto identificados devem ser tratados em issues próprias quando exigirem alteração de comportamento.

## 7. Contratos existentes

- Trip persistida e isolada por Account;
- Place Catalog publicado para `pipa-rn-br`;
- lista/mapa e filtros de Place Discovery;
- Saved Places;
- Itinerary editável;
- Mobility/distâncias/rotas externas;
- Recommendations e Decisions;
- Planning Conflicts;
- Itinerary Proposals e ações de revisão/aceite;
- health `/api/health/live` e `/api/health/ready`;
- release branch `codex/production-release` e gate de migrations.

## 8. Caminhos permitidos na Fase A

```text
docs/implementation/increments/rb-inc-136-m8-real-validation.md
docs/implementation/context-packs/rb-inc-136-m8-real-validation.md
docs/registry.md
docs/implementation/traceability-matrix.md
```

Mudança em código de aplicação, banco, CI ou configuração exige issue derivada específica e não deve ser embutida silenciosamente neste incremento.

## 9. Caminhos somente leitura

```text
apps/**
packages/**
modules/**
.github/**
docs/product/**
docs/delivery/**
docs/quality/**
docs/security/**
docs/privacy/**
docs/observability/**
```

## 10. Caminhos proibidos na Fase A

```text
.env*
secrets
credenciais
cookies/sessões
mudanças de schema/migrations
configuração destrutiva de Production
```

## 11. Entradas disponíveis

- issue #319;
- RB-INC-136;
- hipóteses H1–H10 do `RB-PRD-002`;
- critérios de sucesso e conclusão do MVP;
- cenário real 22–29/08/2026;
- catálogo curado de Pipa já disponível; qualquer contagem atual deve ser revalidada tecnicamente quando necessária, sem converter quantidade de Places em evidência de valor;
- readiness técnica histórica já comprovada pelos incrementos anteriores e sujeita a smoke fresco antes da Fase B;
- automação E2E como baseline técnico, não como evidência humana.

## 12. Saídas esperadas

### Fase A

- protocolo versionado dentro do RB-INC-136;
- taxonomia de evidência;
- severidade de fricção;
- matriz H1–H10 inicial em `not_measured`;
- perguntas qualitativas;
- template de Session;
- regras de abertura de issues;
- regras de privacidade/sanitização;
- PR verde e integrada sem mudanças funcionais.

### Fase B

- Sessions reais sanitizadas;
- evidências `observed`/`reported`/`technical`;
- issues derivadas quando aplicável;
- matriz H1–H10 atualizada somente onde houver evidência;
- síntese M8 e decisão final justificada.

## 13. Critérios de aceite da preparação

- [x] issue #319 aberta;
- [x] incremento define duas fases;
- [x] protocolo impede fabricação de evidência;
- [x] hipóteses iniciam em `not_measured`;
- [x] template de Session está definido;
- [x] privacidade está explicitamente limitada;
- [x] alterações funcionais estão fora de escopo desta fase;
- [x] Registry atualizado;
- [x] rastreabilidade atualizada;
- [ ] Documentation Validation verde;
- [ ] Engineering Validation verde no mesmo SHA;
- [ ] PR integrada;
- [ ] release pós-merge sem migration pendente.

## 14. Restrições

- não inventar Session, feedback, decisão ou satisfação;
- não usar linguagem de “validado” quando a evidência for apenas técnica;
- não forçar jornadas artificiais somente para completar H1–H10;
- não versionar screenshots sem revisão de dados pessoais;
- não registrar endereço preciso de hospedagem se não for necessário;
- não registrar nomes, contatos ou dados dos demais viajantes;
- não alterar o domínio;
- não adicionar Provider ou dependência;
- não executar write em Production para coletar evidência;
- não expandir escopo para analytics de mercado ou product-market fit.

## 15. Comandos

```bash
pnpm format:check
pnpm docs:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Engineering Validation continua sendo a fonte canônica para migration policy, PostgreSQL efêmero e Playwright.

## 16. Dados e privacidade

Dados permitidos em documentação pública:

- Session ID abstrata;
- data/dia sem horário preciso quando não necessário;
- dispositivo genérico;
- ação de produto;
- decisão sanitizada;
- fricção;
- issue relacionada;
- status de hipótese;
- métricas técnicas não sensíveis.

Dados proibidos sem necessidade e revisão explícita:

- credenciais;
- cookies/tokens;
- e-mail/telefone/documento;
- endereço preciso da hospedagem;
- localização em tempo real;
- nomes/dados de terceiros;
- conteúdo privado irrelevante da Account/Trip.

## 17. Quando interromper e escalar

Interromper a execução autônoma quando:

- for necessária observação/feedback humano que ainda não existe;
- houver incidente de segurança ou exposição de dados;
- surgir S0-blocker que torne inseguro continuar a jornada;
- uma correção exigir mudança destrutiva ou migration de Production;
- a decisão M8 depender de interpretação humana não sustentada pelas evidências;
- a documentação canônica contradizer o protocolo.

Não interromper para correções operacionais ou documentais que possam ser resolvidas pelos contratos existentes.

## 18. Relatório final da Fase A

Incluir:

- issue e PR;
- arquivos alterados;
- gates executados;
- SHA de merge;
- release pós-merge e confirmação de zero migrations pendentes;
- estado da Fase B como aguardando evidência real;
- qualquer risco/preparação restante antes de 22/08/2026.

## 19. Regra para retomada da Fase B

Ao iniciar uma sessão real, usar o template definido no RB-INC-136. O executor não deve pedir ao usuário para lembrar artificialmente detalhes que não foram registrados; quando a evidência for incompleta, registrar `not_measured` ou nível de confiança apropriado, preservando a incerteza.
