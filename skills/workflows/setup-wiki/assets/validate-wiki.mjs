import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const wikiRoot = path.join(projectRoot, 'docs/wiki');
const reservedNames = new Set(['index.md', 'log.md']);
const allowedStatuses = new Set(['draft', 'active', 'deprecated', 'superseded']);
const recommendedConceptLines = 350;
const maximumConceptLines = 500;

const walkMarkdown = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return walkMarkdown(entryPath);
      }

      return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
    }),
  );

  return nested.flat();
};

const parseFrontmatter = (content) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  return match?.[1] ?? null;
};

const scalar = (frontmatter, key) => {
  const match = new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm').exec(frontmatter);
  return match?.[1]?.replace(/^['"]|['"]$/g, '') ?? null;
};

const markdownTargets = (content) => {
  const targets = [];
  const pattern = /\[[^\]]*\]\(([^)]+)\)/g;

  for (const match of content.matchAll(pattern)) {
    const target = match[1]?.trim();
    if (target) {
      targets.push(target);
    }
  }

  return targets;
};

const localTarget = (sourceFile, target) => {
  const withoutTitle = target.replace(/\s+["'][^"']*["']$/, '');
  const unwrapped = withoutTitle.replace(/^<|>$/g, '');

  if (/^[a-z][a-z\d+.-]*:/i.test(unwrapped) || unwrapped.startsWith('#')) {
    return null;
  }

  const pathname = unwrapped.split('#', 1)[0];
  if (!pathname) {
    return null;
  }

  return pathname.startsWith('/')
    ? path.resolve(wikiRoot, pathname.slice(1))
    : path.resolve(path.dirname(sourceFile), pathname);
};

const canAccess = async (target) => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};

if (!(await canAccess(wikiRoot))) {
  process.stderr.write('Wiki validation failed: docs/wiki does not exist.\n');
  process.exit(1);
}

const files = (await walkMarkdown(wikiRoot)).sort();
const errors = [];
const warnings = [];
const titles = new Map();
const directories = new Set(files.map((file) => path.dirname(file)));

for (const file of files) {
  const relativeFile = path.relative(wikiRoot, file);
  const basename = path.basename(file);
  const content = await readFile(file, 'utf8');
  const frontmatter = parseFrontmatter(content);

  if (reservedNames.has(basename)) {
    const rootIndex = file === path.join(wikiRoot, 'index.md');

    if (frontmatter !== null && !rootIndex) {
      errors.push(`${relativeFile}: reserved files outside the root index cannot have frontmatter`);
    }

    if (rootIndex && frontmatter !== null) {
      const keys = [...frontmatter.matchAll(/^([a-zA-Z_][\w-]*):/gm)].map(
        (match) => match[1],
      );
      if (keys.length !== 1 || keys[0] !== 'okf_version') {
        errors.push(`${relativeFile}: root index frontmatter may contain only okf_version`);
      }
    }

    if (basename === 'log.md') {
      const dateHeadings = [...content.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);
      for (const heading of dateHeadings) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(heading ?? '')) {
          errors.push(`${relativeFile}: log heading is not an ISO 8601 date: ${heading}`);
        }
      }
    }
  } else if (frontmatter === null) {
    errors.push(`${relativeFile}: concept document is missing YAML frontmatter`);
  } else {
    const type = scalar(frontmatter, 'type');
    const title = scalar(frontmatter, 'title');
    const description = scalar(frontmatter, 'description');
    const timestamp = scalar(frontmatter, 'timestamp');
    const status = scalar(frontmatter, 'status');
    const lineCount = content.replace(/\r?\n$/, '').split(/\r?\n/).length;

    if (!type) {
      errors.push(`${relativeFile}: concept document is missing a non-empty type`);
    }
    if (!title) {
      errors.push(`${relativeFile}: concept document is missing a title`);
    } else if (titles.has(title)) {
      errors.push(`${relativeFile}: duplicate title also used by ${titles.get(title)}`);
    } else {
      titles.set(title, relativeFile);
    }
    if (!description) {
      errors.push(`${relativeFile}: concept document is missing a description`);
    }
    if (!timestamp || !/^\d{4}-\d{2}-\d{2}T/.test(timestamp)) {
      errors.push(`${relativeFile}: timestamp must be a non-empty ISO 8601 date-time`);
    }
    if (!status || !allowedStatuses.has(status)) {
      errors.push(`${relativeFile}: status must be one of ${[...allowedStatuses].join(', ')}`);
    }
    if (lineCount > maximumConceptLines) {
      errors.push(`${relativeFile}: ${lineCount} lines exceeds the ${maximumConceptLines}-line maximum`);
    } else if (lineCount > recommendedConceptLines) {
      warnings.push(
        `${relativeFile}: ${lineCount} lines exceeds the ${recommendedConceptLines}-line review threshold`,
      );
    }
  }

  for (const target of markdownTargets(content)) {
    const resolvedTarget = localTarget(file, target);
    if (resolvedTarget && !(await canAccess(resolvedTarget))) {
      errors.push(`${relativeFile}: broken link ${target}`);
    }
  }
}

for (const directory of directories) {
  const indexFile = path.join(directory, 'index.md');
  const relativeDirectory = path.relative(wikiRoot, directory) || '.';

  if (!(await canAccess(indexFile))) {
    errors.push(`${relativeDirectory}: directory containing wiki content is missing index.md`);
    continue;
  }

  const indexContent = await readFile(indexFile, 'utf8');
  const indexedTargets = new Set(
    markdownTargets(indexContent)
      .map((target) => localTarget(indexFile, target))
      .filter((target) => target !== null),
  );
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md') && !reservedNames.has(entry.name)) {
      const conceptPath = path.join(directory, entry.name);
      if (!indexedTargets.has(conceptPath)) {
        errors.push(`${relativeDirectory}/index.md: does not list ${entry.name}`);
      }
    }

    if (entry.isDirectory() && directories.has(path.join(directory, entry.name))) {
      const childPath = path.join(directory, entry.name);
      const childIndex = path.join(childPath, 'index.md');
      if (!indexedTargets.has(childPath) && !indexedTargets.has(childIndex)) {
        errors.push(`${relativeDirectory}/index.md: does not list ${entry.name}/`);
      }
    }
  }
}

if (warnings.length > 0) {
  process.stderr.write(`Wiki validation warnings:\n${warnings.map((warning) => `- ${warning}`).join('\n')}\n`);
}

if (errors.length > 0) {
  process.stderr.write(
    `Wiki validation failed with ${errors.length} error(s):\n${errors
      .map((error) => `- ${error}`)
      .join('\n')}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write(`Wiki validation passed: ${files.length} Markdown files checked.\n`);
}
