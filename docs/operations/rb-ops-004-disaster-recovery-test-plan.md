---
id: RB-OPS-004

title: Plano de Teste de Recuperação de Desastres
description: Define cenários, calendário, critérios, evidências e ações para provar a recuperabilidade do RouteBook.

document_type: operations-test-plan
owner: Operations

status: Published
version: "0.1.0"

created: "2026-07-27"
last_updated: null

authors:
  - RouteBook Team

tags:
  - operations
  - disaster-recovery
  - restore-test
  - resilience
  - verification

related_documents:
  - RB-ADR-022
  - RB-ADR-023
  - RB-OPS-003

prerequisites:
  - RB-ADR-023
  - RB-OPS-003

next_documents: []

ai_context:
  priority: high
  index: true
---

# RB-OPS-004 — Plano de Teste de Recuperação de Desastres

## 1. Objetivo

Provar que dados, serviços e controles podem ser recuperados dentro dos objetivos definidos.

## 2. Cadência

| Exercício | Frequência |
| --- | --- |
| verificação automática de backup | diária |
| restore isolado | mensal |
| restore lógico | trimestral |
| tabletop de desastre | trimestral |
| exercício técnico completo | semestral |
| cenário de comprometimento | anual |
| teste extraordinário | após mudança material |

## 3. Cenários obrigatórios

### DR-01 — Exclusão acidental

- restaurar ponto anterior;
- preservar alterações válidas posteriores;
- reaplicar tombstones;
- validar objetos.

### DR-02 — Migration defeituosa

- detectar corrupção lógica;
- escolher roll-forward ou restore;
- validar compatibilidade.

### DR-03 — Falha regional ou de Provider

- reconstruir aplicação;
- restaurar banco;
- recuperar objetos;
- trocar endpoints e secrets.

### DR-04 — Credencial comprometida

- conter;
- rotacionar;
- preservar evidências;
- restaurar somente se integridade estiver em dúvida.

### DR-05 — Corrupção silenciosa

- identificar ponto seguro;
- medir alcance;
- restaurar;
- reconciliar eventos posteriores.

### DR-06 — Ressurreição de dados

- restaurar backup que contém dado apagado;
- reaplicar tombstone;
- provar ausência no banco, objeto, índice e cache.

### DR-07 — Replay duplicado

- restaurar outbox anterior;
- provar idempotência;
- impedir efeito externo duplicado.

### DR-08 — Redis perdido

- iniciar vazio;
- reconstruir;
- provar que nenhuma fonte canônica dependia dele.

## 4. Plano de cada execução

```yaml
exercise_id:
scenario:
date:
scope:
owner:
participants:
source_backup:
target_point:
rpo_target:
rto_target:
success_criteria:
abort_criteria:
```

## 5. Critérios comuns

- restauração concluída;
- integridade referencial;
- checksums;
- Account isolation;
- autenticação;
- autorização;
- Trip e Roteiro acessíveis;
- tombstones;
- consentimentos;
- outbox;
- objetos;
- observabilidade;
- RPO;
- RTO;
- evidência.

## 6. Dados de teste

Preferir Accounts sintéticas com:

- duas Accounts;
- dois Users;
- uma Trip ativa;
- Roteiro;
- Proposta;
- decisão;
- objeto;
- consentimento revogado;
- dado tombstonado;
- evento pendente;
- efeito externo simulado.

## 7. Falhas injetadas

Somente em ambiente isolado:

- indisponibilidade de banco;
- WAL incompleto;
- checksum inválido;
- objeto ausente;
- Redis vazio;
- Provider indisponível;
- migration incompatível;
- atraso de evento;
- credencial revogada.

## 8. Evidências

- timestamps;
- comandos ou ações;
- versões;
- logs sanitizados;
- métricas;
- screenshots sem dados pessoais;
- resultados dos checks;
- RPO e RTO;
- desvios;
- decisões;
- ações.

## 9. Resultado

```text
Passed
Passed with observations
Failed
Aborted
```

`Passed with observations` não poderá esconder violação de RPO, RTO, privacidade ou isolamento.

## 10. Ações

Cada desvio deverá possuir:

- severidade;
- owner;
- prazo;
- correção;
- evidência;
- necessidade de reteste.

## 11. Critérios de falha

- backup não restaura;
- RPO não pode ser determinado;
- RTO excede limite sem aceitação;
- cross-account;
- tombstone não reaplicado;
- efeito externo duplicado;
- objeto incorreto;
- runbook insuficiente;
- dependência desconhecida;
- evidência incompleta.

## 12. Relatório final

```markdown
# Relatório DR-YYYY-NNN

## Resumo
## Escopo
## Timeline
## Resultado
## RPO observado
## RTO observado
## Integridade
## Privacidade
## Efeitos assíncronos
## Desvios
## Ações
## Aprovação
```
