---
id: RB-OPS-003

title: Runbook de Backup e Restauração
description: Procedimento operacional para verificar backups, restaurar PostgreSQL e objetos, validar integridade e reconciliar privacidade e efeitos assíncronos.

document_type: operations-runbook
owner: Operations

status: Published
version: "0.1.0"

created: "2026-07-27"
last_updated: null

authors:
  - RouteBook Team

tags:
  - operations
  - runbook
  - backup
  - restore
  - postgresql
  - privacy

related_documents:
  - RB-ADR-022
  - RB-ADR-023
  - RB-OPS-004
  - RB-OPS-005

prerequisites:
  - RB-ADR-022
  - RB-ADR-023

next_documents: []

ai_context:
  priority: high
  index: true
---

# RB-OPS-003 — Runbook de Backup e Restauração

## 1. Objetivo

Executar restaurações seguras, repetíveis, auditáveis e compatíveis com privacidade.

## 2. Regras críticas

- nunca restaurar diretamente sobre produção;
- nunca usar credenciais da aplicação;
- nunca liberar tráfego antes da validação;
- nunca executar replay mutável sem reconciliação;
- nunca copiar dados produtivos para ambiente inferior sem autorização;
- nunca considerar sucesso apenas pelo término do comando;
- preservar evidências e timeline.

## 3. Pré-requisitos

- autorização registrada;
- Incident Commander ou responsável designado;
- ponto de recuperação escolhido;
- destino isolado;
- credenciais temporárias;
- versão do código e migrations identificada;
- inventário de objetos;
- tombstones e revogações disponíveis;
- comunicação definida.

## 4. Registro da execução

```yaml
restore_id:
reason:
requested_by:
approved_by:
started_at:
target_environment:
source_backup:
target_point_in_time:
application_version:
schema_version:
incident_id:
```

## 5. Verificação do backup

- confirmar status do Provider;
- confirmar idade;
- confirmar janela de retenção;
- validar checksum;
- validar criptografia;
- validar acesso;
- confirmar cadeia de WAL ou equivalente;
- confirmar backup base compatível;
- confirmar objetos e manifests.

## 6. Preparação do ambiente

1. criar destino isolado;
2. bloquear acesso público;
3. restringir rede;
4. configurar secrets temporários;
5. desativar e-mail, webhooks, Tools e integrações mutáveis;
6. desativar analytics;
7. apontar Providers para stubs quando possível;
8. registrar versões.

## 7. Restauração do PostgreSQL

O mecanismo exato dependerá do Provider, mas deverá:

1. restaurar backup base;
2. aplicar WAL até o ponto escolhido;
3. iniciar sem tráfego;
4. executar checks de consistência;
5. registrar tempo e erros;
6. interromper se houver incompatibilidade de schema.

## 8. Restauração lógica alternativa

Usar somente quando:

- PITR não estiver disponível;
- recuperação seletiva for necessária;
- portabilidade estiver sendo testada;
- o plano tiver sido aprovado.

Restaurar primeiro estrutura, depois dados, índices e validações, conforme ferramenta e tamanho.

## 9. Objetos

- validar manifest;
- restaurar versões corretas;
- conferir checksum;
- confirmar ownership;
- testar autorização;
- não restaurar objeto tombstonado;
- registrar ausências.

## 10. Migrations

Aplicar apenas migrations compatíveis com o ponto restaurado.

Se o código atual exigir schema posterior:

- preferir executar a versão compatível;
- depois migrar de forma controlada;
- não improvisar alteração destrutiva.

## 11. Reconciliação de privacidade

Reaplicar, em ordem:

1. tombstones;
2. exclusões concluídas;
3. revogações;
4. mudanças de consentimento;
5. legal holds;
6. retenções executadas;
7. solicitações em andamento.

Gerar relatório:

```yaml
tombstones_applied:
subjects_reconciled:
objects_removed:
providers_pending:
errors:
```

## 12. Reconciliação de workflows

Para cada job, outbox ou efeito:

- identificar estado no ponto restaurado;
- consultar registro de efeitos;
- marcar duplicados;
- reprocessar somente itens seguros;
- manter integrações mutáveis desligadas;
- obter aprovação para replay externo.

## 13. Validação técnica

- banco inicia;
- migrations conferem;
- checksums conferem;
- conexões usam TLS;
- índices essenciais existem;
- filas estão controladas;
- objetos são acessíveis;
- backups não ficaram montados na aplicação;
- observabilidade funciona.

## 14. Validação de domínio

Testar com Accounts sintéticas:

- login;
- isolamento;
- abertura de Trip;
- Preferências;
- lugares salvos;
- Roteiro;
- Proposta;
- Recomendações;
- Decisões;
- autorização de escrita;
- exclusão.

## 15. Validação cross-account

- User A não acessa Account B;
- cache não mistura chaves;
- busca filtra Account;
- objetos exigem ownership;
- eventos não cruzam contexto;
- analytics permanece desligado no teste.

## 16. Critérios de promoção

Todos devem ser verdadeiros:

- integridade aprovada;
- privacidade aprovada;
- cross-account aprovado;
- efeitos reconciliados;
- RPO medido;
- RTO medido;
- risco residual registrado;
- rollback disponível;
- responsável aprova.

## 17. Promoção

1. definir janela;
2. bloquear mutações no ambiente antigo;
3. executar sincronização final quando aplicável;
4. atualizar roteamento;
5. liberar leitura;
6. liberar mutações gradualmente;
7. reativar Providers por ordem;
8. observar;
9. manter fallback.

## 18. Abortagem

Abortar quando:

- checksum falhar;
- schema for incompatível;
- tombstones não puderem ser aplicados;
- houver cross-account;
- efeitos externos forem desconhecidos;
- backup estiver incompleto;
- integridade não puder ser provada.

## 19. Encerramento

- registrar resultado;
- remover credenciais temporárias;
- destruir ambiente de teste conforme política;
- preservar evidências;
- calcular RPO e RTO;
- abrir ações;
- atualizar runbook;
- vincular postmortem quando aplicável.

## 20. Checklist rápido

- [ ] autorização
- [ ] ponto de recuperação
- [ ] destino isolado
- [ ] integrações mutáveis desligadas
- [ ] banco restaurado
- [ ] objetos restaurados
- [ ] tombstones aplicados
- [ ] workflows reconciliados
- [ ] integridade aprovada
- [ ] cross-account aprovado
- [ ] RPO e RTO registrados
- [ ] evidência salva
