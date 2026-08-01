---
id: RB-INC-065
title: Descarte da Itinerary Proposal na Revisão
description: Permite descartar explicitamente uma Itinerary Proposal pronta, preservando o Roteiro e retornando ao contexto de origem.
document_type: implementation-increment
owner: Proposal Management
status: Draft
version: "0.1.0"
created: "2026-08-01"
last_updated: "2026-08-01"
authors:
  - RouteBook Team
tags:
  - implementation
  - proposal-management
  - web
  - rejection
  - review
related_documents:
  - RB-CORE-0004
  - RB-PRD-004
  - RB-UX-003
  - RB-UX-004
  - RB-UX-005
  - RB-UX-006
  - RB-INC-057
  - RB-INC-061
  - RB-INC-064
prerequisites:
  - RB-INC-064
next_documents: []
ai_context:
  priority: critical
  index: true
---

# RB-INC-065 — Descarte da Itinerary Proposal na Revisão

## 1. Objetivo

Permitir que o usuário descarte explicitamente a Itinerary Proposal `ready` exibida na revisão, persistindo `rejected`, preservando o Itinerary atual e retornando ao Roteiro com feedback inequívoco.

Issue: [#146](https://github.com/collapsy/Routebook/issues/146)

Branch: `codex/rb-inc-065-discard-proposal-review`.

Pull request: pendente.

## 2. Problema

A revisão apresenta a Proposal separada, mas ainda não oferece a ação canônica “Descartar proposta”. O usuário não consegue encerrar a sugestão sem sair silenciosamente ou depender de um consumidor técnico do comando já implementado.

## 3. Resultado verificável

- a revisão `ready` oferece “Descartar proposta” com contexto de preservação;
- a ação usa o `tripId` da rota e a identidade da Proposal exibida;
- o servidor define `rejectedAt` e delega ao comando público do RB-INC-064;
- sucesso retorna ao Roteiro com feedback explícito;
- o Itinerary e suas Activities permanecem inalterados;
- Proposal `expired` não oferece decisão;
- ausência, input inválido ou estado atualizado não produzem escrita indevida;
- a Proposal descartada deixa de ser apresentada como revisável ativa.

## 4. Decisão local e reversível

Não apresentar confirmação neste recorte. A revisão atual é somente leitura e não possui edições não salvas; RB-INT-068 exige confirmação somente quando essas edições existirem, e RB-MDL-005 é opcional.

## 5. Invariantes

1. descarte é confirmação explícita do usuário, nunca efeito automático;
2. somente Proposal `ready` é descartável;
3. a ação não modifica Itinerary, Activity ou outro bounded context;
4. identidade de Trip vem do contexto da rota e limita a busca;
5. input de formulário é validado antes de alcançar PostgreSQL;
6. erros conhecidos retornam feedback seguro e não simulam sucesso;
7. Proposal `expired` permanece histórica e sem ações de decisão.

## 6. Escopo

- Server Action de descarte;
- ação acessível no componente de revisão `ready`;
- feedback de sucesso e erro no Roteiro;
- estilos responsivos mínimos;
- testes de componente e E2E com persistência real;
- documentação, registry e rastreabilidade.

## 7. Fora de escopo

- aceitar, aceitar parcialmente, editar ou gerar novamente;
- motivo, comentário ou ator de rejeição;
- confirmação sem edições não salvas;
- histórico visual de Proposals `rejected`;
- nova autorização, autenticação ou compartilhamento;
- alteração do Itinerary, aplicação de Proposed Activities ou Decision;
- Provider, evento, Outbox, job, fila ou retry;
- schema, migration ou novo estado de domínio.

## 8. Context Pack

`docs/implementation/context-packs/rb-inc-065-itinerary-proposal-discard-review.md`

## 9. Caminhos permitidos

```text
apps/web/app/viagens/[tripId]/roteiro/page.tsx
apps/web/app/viagens/[tripId]/roteiro/proposta/actions.ts
apps/web/app/viagens/[tripId]/roteiro/proposta/actions.test.ts
apps/web/app/viagens/[tripId]/roteiro/proposta/page.tsx
apps/web/components/itinerary-proposal-review.tsx
apps/web/components/itinerary-proposal-review.test.tsx
apps/web/components/itinerary-proposal-review.module.css
apps/web/e2e/itinerary-proposal-review.spec.ts
docs/implementation/increments/rb-inc-065-itinerary-proposal-discard-review.md
docs/implementation/context-packs/rb-inc-065-itinerary-proposal-discard-review.md
docs/implementation/traceability-matrix.md
docs/registry.md
```

## 10. Critérios de aceite

- [ ] Proposal `ready` exibe ação “Descartar proposta”;
- [ ] Proposal `expired` não exibe ação de descarte;
- [ ] sucesso persiste `rejected` e registra `rejectedAt`;
- [ ] sucesso retorna ao Roteiro com feedback de preservação;
- [ ] Itinerary e Activities confirmadas permanecem inalterados;
- [ ] Proposed Activity não é aplicada;
- [ ] Proposal descartada deixa de oferecer link de revisão ativa;
- [ ] ausência, input inválido e estado atualizado recebem tratamento seguro;
- [ ] semântica, teclado e layout responsivo permanecem adequados;
- [ ] documentação, lint, tipagem, testes, E2E e build permanecem verdes.

## 11. Testes obrigatórios

- componente `ready` apresenta formulário e ação com identidade correta;
- componente `expired` permanece sem botão;
- E2E desktop e mobile descarta, retorna, informa sucesso e preserva Roteiro;
- E2E confirma status persistido `rejected` e timestamp registrado;
- E2E de estado concorrente não escreve nem apresenta sucesso;
- unidade da Server Action bloqueia identidade ausente ou malformada antes do repositório;
- regressão da revisão ready, expired e estado vazio.

## 12. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| descartar Proposal diferente da exibida | Alto | identidade explícita e busca escopada pela Trip |
| aplicar conteúdo durante descarte | Alto | usar somente o comando de rejeição de Proposal |
| duplo envio ou estado concorrente | Médio | aggregate rejeita origem fora de `ready` e UI retorna feedback |
| input inválido alcançar UUID PostgreSQL | Médio | validação estrutural na Server Action |
| ação aparecer em histórico expirado | Alto | renderização discriminada pelo status do view model |

## 13. Segurança e privacidade

A ação recebe somente a identidade técnica da Proposal exibida. Não recebe prompt, token, secret, conteúdo livre ou dado pessoal novo. O `tripId` não é aceito do formulário e a persistência mantém isolamento pela Viagem.

## 14. Rollback

Reverter ação, controle, feedback, testes e documentação. O domínio e a migration permanecem compatíveis; não há operação destrutiva.

## 15. Evidências

Evidências locais:

- 171 documentos registrados e validados, com quatro avisos preexistentes;
- lint e typecheck do app web aprovados;
- 59 testes de componente e unidade do app web aprovados em 19 arquivos;
- lint, typecheck e build integrais aprovados;
- Prettier dos arquivos alterados e `git diff --check` aprovados;
- PostgreSQL e Playwright não executados localmente porque `DATABASE_URL` não está configurada e o Docker está indisponível.

Evidências de CI pendentes.
