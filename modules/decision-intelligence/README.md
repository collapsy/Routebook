# @routebook/decision-intelligence

Módulo proprietário do bounded context Decision Intelligence.

## Responsabilidades atuais

- representar `Recommendation` com identidade e ciclo de vida próprios;
- preservar um `DecisionContextSnapshot` mínimo e versionado;
- distinguir `RecommendationScore` interno de `RecommendationConfidence` qualitativa;
- exigir razões conhecidas antes da apresentação;
- registrar limitações sem inventar dados ausentes;
- bloquear aceitação de Recommendations expiradas, invalidadas ou substituídas;
- exigir uma `DecisionId` explícita para a transição de aceitação.

## Limites do RB-INC-038

Este primeiro corte não gera ranking, não persiste Recommendations e não altera Place, Saved Place, Preferences ou Itinerary. O módulo não depende de Drizzle, Next.js ou React.

## Contrato público

Os tipos, factories e operações são exportados por `src/index.ts`. As operações retornam novos agregados e preservam os inputs recebidos.
