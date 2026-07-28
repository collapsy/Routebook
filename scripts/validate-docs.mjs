import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const docsRoot = join(root, 'docs');
const registryPath = join(docsRoot, 'registry.md');
const allowedStatuses = new Set([
  'Planned',
  'Draft',
  'Approved',
  'Published',
  'Deprecated',
  'Archived',
]);

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function read(path) {
  return readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
}

function parseFrontmatter(content, path) {
  let sourceContent = content;

  if (sourceContent.startsWith('```yaml\n---')) {
    warn(`${relative(root, path)}: frontmatter legado está cercado por bloco de código YAML.`);
    sourceContent = sourceContent.slice('```yaml\n'.length);
  }

  if (!sourceContent.startsWith('---')) {
    return null;
  }

  const end = sourceContent.indexOf('\n---', 3);
  if (end === -1) {
    fail(`${relative(root, path)}: frontmatter não foi encerrado.`);
    return null;
  }

  const source = sourceContent.slice(3, end).trim();
  const scalar = (key) => {
    const match = source.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'));
    return match?.[1]?.replace(/^['"]|['"]$/g, '') ?? null;
  };

  const ids = [...source.matchAll(/\bRB-[A-Z]+-\d{3,4}\b/g)].map((match) => match[0]);

  return {
    id: scalar('id'),
    title: scalar('title'),
    status: scalar('status'),
    version: scalar('version'),
    referencedIds: ids,
  };
}

function parseRegistry(content) {
  const entries = new Map();
  const rowPattern = /^\|\s*(RB-[A-Z]+-\d{3,4})\s*\|.*?\|\s*(Planned|Draft|Approved|Published|Deprecated|Archived)\s*\|\s*([^|]+?)\s*\|\s*\[[^\]]+\]\(([^)]+)\)\s*\|$/gm;

  for (const match of content.matchAll(rowPattern)) {
    const [, id, status, version, link] = match;
    const absolutePath = resolve(dirname(registryPath), link);

    if (entries.has(id)) {
      fail(`docs/registry.md: ID duplicado ${id}.`);
      continue;
    }

    entries.set(id, {
      id,
      status,
      version: version.trim(),
      path: normalize(absolutePath),
    });
  }

  return entries;
}

const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'docs/README.md',
  'docs/registry.md',
  'docs/core/routebook-bible.md',
  'docs/implementation/README.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
];

for (const path of requiredFiles) {
  if (!existsSync(join(root, path))) {
    fail(`Arquivo obrigatório ausente: ${path}`);
  }
}

if (!existsSync(docsRoot) || !existsSync(registryPath)) {
  fail('Diretório docs ou registro documental ausente.');
} else {
  const markdownFiles = walk(docsRoot).filter((path) => path.endsWith('.md'));
  const documents = new Map();

  for (const path of markdownFiles) {
    const content = read(path);
    const metadata = parseFrontmatter(content, path);

    if (!metadata?.id) {
      if (!['README.md', 'registry.md'].includes(path.split(/[\\/]/).at(-1))) {
        warn(`${relative(root, path)}: arquivo Markdown sem ID no frontmatter.`);
      }
      continue;
    }

    if (documents.has(metadata.id)) {
      fail(
        `ID ${metadata.id} duplicado em ${relative(root, documents.get(metadata.id).path)} e ${relative(root, path)}.`,
      );
      continue;
    }

    if (!metadata.title) {
      fail(`${relative(root, path)}: campo title ausente.`);
    }

    if (!metadata.status || !allowedStatuses.has(metadata.status)) {
      fail(`${relative(root, path)}: status inválido ou ausente (${metadata.status ?? 'null'}).`);
    }

    if (!metadata.version) {
      fail(`${relative(root, path)}: campo version ausente.`);
    }

    documents.set(metadata.id, { ...metadata, path: normalize(path), content });

    if (content.includes('22 e 29 de julho de 2026')) {
      warn(
        `${relative(root, path)}: referência histórica à data incorreta; o cenário canônico é 22 a 29 de agosto de 2026.`,
      );
    }
  }

  const registry = parseRegistry(read(registryPath));

  for (const [id, document] of documents) {
    const registered = registry.get(id);
    if (!registered) {
      fail(`${id}: documento não registrado (${relative(root, document.path)}).`);
      continue;
    }

    if (registered.path !== document.path) {
      fail(
        `${id}: caminho do registro (${relative(root, registered.path)}) difere do arquivo (${relative(root, document.path)}).`,
      );
    }

    if (registered.status !== document.status) {
      fail(`${id}: status do registro (${registered.status}) difere do frontmatter (${document.status}).`);
    }

    if (registered.version !== document.version) {
      fail(`${id}: versão do registro (${registered.version}) difere do frontmatter (${document.version}).`);
    }
  }

  for (const [id, entry] of registry) {
    if (!existsSync(entry.path)) {
      fail(`${id}: caminho registrado não existe (${relative(root, entry.path)}).`);
    }

    if (!documents.has(id)) {
      fail(`${id}: registro não corresponde a documento com frontmatter válido.`);
    }
  }

  const knownIds = new Set([...registry.keys(), ...documents.keys()]);
  for (const document of documents.values()) {
    for (const referencedId of document.referencedIds) {
      if (referencedId !== document.id && !knownIds.has(referencedId)) {
        warn(`${document.id}: referência não resolvida para ${referencedId}.`);
      }
    }
  }

  for (const coreId of ['RB-CORE-0001', 'RB-CORE-0002', 'RB-CORE-0003', 'RB-CORE-0004']) {
    if (!documents.has(coreId)) {
      fail(`Documento constitucional ausente: ${coreId}.`);
    }
  }

  console.log(`Documentos com ID encontrados: ${documents.size}`);
  console.log(`Documentos registrados: ${registry.size}`);
}

for (const message of warnings) {
  console.warn(`WARN: ${message}`);
}

if (errors.length > 0) {
  for (const message of errors) {
    console.error(`ERROR: ${message}`);
  }
  console.error(`Validação documental falhou com ${errors.length} erro(s) e ${warnings.length} aviso(s).`);
  process.exit(1);
}

console.log(`Validação documental concluída com ${warnings.length} aviso(s).`);