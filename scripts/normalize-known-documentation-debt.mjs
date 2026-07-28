import { readFileSync, writeFileSync } from 'node:fs';

const dateFiles = [
  'docs/foundation/product-scope.md',
  'docs/foundation/product-vision.md',
  'docs/product/mvp-definition.md',
  'docs/product/product-overview.md',
];

for (const path of dateFiles) {
  const original = readFileSync(path, 'utf8');
  const updated = original.replaceAll(
    '22 e 29 de julho de 2026',
    '22 e 29 de agosto de 2026',
  );

  if (updated === original) {
    throw new Error(`A data legada esperada não foi encontrada em ${path}.`);
  }

  writeFileSync(path, updated);
}

const aiSecurityPath = 'docs/ai/ai-security-red-teaming-and-resilience.md';
const aiSecurityOriginal = readFileSync(aiSecurityPath, 'utf8');
let aiSecurityUpdated = aiSecurityOriginal.replace(/^```yaml\r?\n/, '');
aiSecurityUpdated = aiSecurityUpdated.replace(/(\r?\n---\r?\n)\r?\n```\r?\n/, '$1\n');

if (aiSecurityUpdated === aiSecurityOriginal || !aiSecurityUpdated.startsWith('---')) {
  throw new Error('Não foi possível normalizar o frontmatter de RB-AI-005.');
}

writeFileSync(aiSecurityPath, aiSecurityUpdated);

console.log('Dívida documental conhecida normalizada com sucesso.');