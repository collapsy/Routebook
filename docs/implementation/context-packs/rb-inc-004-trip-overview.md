# Context Pack — RB-INC-004

## Objetivo

Entregar a visão inicial de uma `Trip` persistida, incluindo consulta por `TripId`, contexto estrutural e Dias da Viagem derivados do período.

## Fonte de verdade

- RB-PRD-004;
- RB-UX-001;
- RB-UX-002;
- RB-UX-003;
- RB-DOM-001;
- RB-DOM-003;
- RB-INC-003.

## Restrições

- não criar migration;
- não persistir Dias da Viagem;
- não introduzir Preferências, Lugares, mapas, Roteiro, IA ou autenticação;
- preservar TypeScript estrito, acessibilidade e responsividade;
- manter PostgreSQL como fonte de verdade da `Trip`.

## Evidência mínima

- consulta por identidade testável;
- derivação inclusiva dos Dias;
- rota dinâmica e 404 específico;
- E2E em desktop e mobile;
- todos os quality gates aprovados.
