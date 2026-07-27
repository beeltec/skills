import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const wikiRoot = path.join(projectRoot, 'docs/wiki');
const backlogRoot = path.join(projectRoot, 'docs/backlog');
const wikiStatuses = new Set(['draft', 'active', 'deprecated', 'superseded']);
const adrIdPattern = /^ADR-\d{3,}$/;
const adrSections = [
  'Context',
  'Decision',
  'Alternatives considered',
  'Consequences',
  'Affected concepts',
  'Provenance',
];
const backlogStatuses = new Set(['proposed', 'ready', 'in-progress', 'done', 'cancelled']);
const workTypes = new Set(['story', 'task', 'bug']);
const relationshipFields = ['blocks', 'clones', 'duplicates', 'relates_to', 'causes'];
const recommendedConceptLines = 350;
const maximumConceptLines = 500;

const exists = async (target) => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};

const walkMarkdown = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return walkMarkdown(target);
      return entry.isFile() && entry.name.endsWith('.md') ? [target] : [];
    }),
  );
  return nested.flat();
};

const parseFrontmatter = (content) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  return match ? { raw: match[1], body: content.slice(match[0].length) } : null;
};

const unquote = (value) => value.trim().replace(/^(['"])(.*)\1$/, '$2');

const scalar = (frontmatter, key) => {
  const match = new RegExp(`^${key}:\\s*(.*?)\\s*$`, 'm').exec(frontmatter);
  return match && match[1] ? unquote(match[1]) : null;
};

const inlineList = (frontmatter, key) => {
  const value = scalar(frontmatter, key);
  if (value === null || !/^\[.*\]$/.test(value)) return null;
  const inner = value.slice(1, -1).trim();
  if (!inner) return [];
  return inner
    .split(',')
    .map((item) => unquote(item))
    .filter(Boolean);
};

const markdownTargets = (content) =>
  [...content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1]?.trim()).filter(Boolean);

const resolveLocalTarget = (sourceFile, rawTarget, bundleRoot) => {
  const withoutTitle = rawTarget.replace(/\s+["'][^"']*["']$/, '');
  const target = withoutTitle.replace(/^<|>$/g, '');
  if (/^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith('#')) return null;
  const pathname = target.split(/[?#]/, 1)[0];
  if (!pathname) return null;
  return pathname.startsWith('/')
    ? path.resolve(bundleRoot, pathname.slice(1))
    : path.resolve(path.dirname(sourceFile), pathname);
};

const isWithin = (root, target) => {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
};

const section = (body, heading) => {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^##\\s+${escaped}\\s*$([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, 'mi').exec(body);
  return match?.[1]?.trim() ?? '';
};

const checkboxes = (content) =>
  [...content.matchAll(/^\s*-\s+\[([ xX])\]\s+(.+)$/gm)].map((match) => ({
    checked: match[1].toLowerCase() === 'x',
    text: match[2].trim(),
  }));

const hasPlaceholder = (value) => !value || /\b(?:replace (?:with|this)\b|tbd|todo)\b/i.test(value);

const checkLinks = async (files, bundleRoot, errors, activeRecords = new Map()) => {
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const target of markdownTargets(content)) {
      const resolved = resolveLocalTarget(file, target, bundleRoot);
      if (!resolved) continue;
      const relativeFile = path.relative(projectRoot, file);
      if (!isWithin(projectRoot, resolved)) {
        errors.push(`${relativeFile}: unsafe local link escapes the project: ${target}`);
      } else if (!(await exists(resolved))) {
        errors.push(`${relativeFile}: broken link ${target}`);
      } else if (activeRecords.has(file) && isWithin(path.join(backlogRoot, 'archive'), resolved)) {
        errors.push(`${relativeFile}: active backlog record links to archived content: ${target}`);
      }
    }
  }
};

const validateWiki = async () => {
  const errors = [];
  const warnings = [];
  const required = [
    'index.md',
    'maintenance.md',
    'start-here.md',
    'log.md',
    'architecture/index.md',
    'architecture/decisions/index.md',
    'domains/index.md',
    'domains/ubiquitous-language.md',
    'engineering/index.md',
    'engineering/guidance-template.md',
    'engineering/technologies/index.md',
    'engineering/standards/index.md',
    'operations/index.md',
  ];

  const decisionsRoot = path.join(wikiRoot, 'architecture/decisions');
  const adrTemplate = path.join(decisionsRoot, 'template.md');
  const adrs = new Map();

  if (!(await exists(wikiRoot))) {
    return { errors: ['docs/wiki does not exist'], warnings, count: 0, adrIds: new Set() };
  }
  for (const relative of required) {
    if (!(await exists(path.join(wikiRoot, relative))))
      errors.push(`docs/wiki/${relative}: required wiki root is missing`);
  }

  const files = (await walkMarkdown(wikiRoot)).sort();
  const reservedNames = new Set(['index.md', 'log.md']);
  const titles = new Map();
  const directories = new Set(files.map((file) => path.dirname(file)));

  for (const file of files) {
    const relativeFile = path.relative(wikiRoot, file);
    const basename = path.basename(file);
    const content = await readFile(file, 'utf8');
    const parsed = parseFrontmatter(content);

    if (reservedNames.has(basename)) {
      const rootIndex = file === path.join(wikiRoot, 'index.md');
      if (parsed && !rootIndex)
        errors.push(`${relativeFile}: reserved files outside the root index cannot have frontmatter`);
      if (rootIndex && parsed) {
        const keys = [...parsed.raw.matchAll(/^([a-zA-Z_][\w-]*):/gm)].map((match) => match[1]);
        if (keys.length !== 1 || keys[0] !== 'okf_version') {
          errors.push(`${relativeFile}: root index frontmatter may contain only okf_version`);
        }
      }
      if (rootIndex && !parsed) errors.push(`${relativeFile}: root index is missing okf_version frontmatter`);
      if (basename === 'log.md') {
        for (const match of content.matchAll(/^##\s+(.+)$/gm)) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(match[1] ?? '')) {
            errors.push(`${relativeFile}: log heading is not an ISO 8601 date: ${match[1]}`);
          }
        }
      }
      continue;
    }

    if (file === adrTemplate) continue;

    if (!parsed) {
      errors.push(`${relativeFile}: concept document is missing YAML frontmatter`);
      continue;
    }
    const isAdr = isWithin(decisionsRoot, file);
    const type = scalar(parsed.raw, 'type');
    const title = scalar(parsed.raw, 'title');
    const description = scalar(parsed.raw, 'description');
    const timestamp = scalar(parsed.raw, 'timestamp');
    const status = scalar(parsed.raw, 'status');
    const lineCount = content.replace(/\r?\n$/, '').split(/\r?\n/).length;
    if (!type) errors.push(`${relativeFile}: concept document is missing a non-empty type`);
    if (!title) errors.push(`${relativeFile}: concept document is missing a title`);
    else if (isAdr && status === 'superseded') {
      // A superseded ADR is retained history; its title may recur in the ADR that replaced it.
    } else if (titles.has(title)) errors.push(`${relativeFile}: duplicate title also used by ${titles.get(title)}`);
    else titles.set(title, relativeFile);
    if (!description) errors.push(`${relativeFile}: concept document is missing a description`);
    if (!timestamp || !/^\d{4}-\d{2}-\d{2}T/.test(timestamp)) {
      errors.push(`${relativeFile}: timestamp must be a non-empty ISO 8601 date-time`);
    }
    if (!status || !wikiStatuses.has(status)) {
      errors.push(`${relativeFile}: status must be one of ${[...wikiStatuses].join(', ')}`);
    }
    if (lineCount > maximumConceptLines) {
      errors.push(`${relativeFile}: ${lineCount} lines exceeds the ${maximumConceptLines}-line maximum`);
    } else if (lineCount > recommendedConceptLines) {
      warnings.push(`${relativeFile}: ${lineCount} lines exceeds the ${recommendedConceptLines}-line review threshold`);
    }

    if (!isAdr) {
      if (type === 'Decision') {
        errors.push(`${relativeFile}: type Decision is reserved for ADRs under architecture/decisions/`);
      }
      if (status === 'superseded') {
        errors.push(`${relativeFile}: status superseded applies only to an ADR under architecture/decisions/`);
      }
      continue;
    }

    const id = scalar(parsed.raw, 'id');
    const decided = scalar(parsed.raw, 'decided');
    const supersedes = scalar(parsed.raw, 'supersedes');
    const supersededBy = scalar(parsed.raw, 'superseded_by');
    if (type !== 'Decision') errors.push(`${relativeFile}: ADR type must be Decision`);
    if (!id || !adrIdPattern.test(id)) errors.push(`${relativeFile}: ADR id must match ADR-NNN`);
    else if (adrs.has(id)) errors.push(`${relativeFile}: duplicate ADR id also used by ${adrs.get(id).relativeFile}`);
    else {
      adrs.set(id, { relativeFile, status, supersedes, supersededBy });
      const expected = `adr-${id.slice(4).toLowerCase()}-`;
      if (!basename.startsWith(expected)) errors.push(`${relativeFile}: ADR filename must begin with ${expected}`);
    }
    if (!decided || !/^\d{4}-\d{2}-\d{2}$/.test(decided)) {
      errors.push(`${relativeFile}: ADR decided must be an ISO 8601 YYYY-MM-DD date`);
    }
    if (status === 'superseded') {
      if (!supersededBy || !adrIdPattern.test(supersededBy)) {
        errors.push(`${relativeFile}: superseded ADR requires superseded_by: ADR-NNN`);
      }
    } else if (supersededBy !== 'none') {
      errors.push(`${relativeFile}: ADR outside superseded must use superseded_by: none`);
    }
    if (supersedes !== 'none' && !adrIdPattern.test(supersedes ?? '')) {
      errors.push(`${relativeFile}: ADR supersedes must be ADR-NNN or none`);
    }
    for (const heading of adrSections) {
      if (!section(parsed.body, heading)) warnings.push(`${relativeFile}: ADR is missing the ${heading} section`);
    }
  }

  for (const [id, adr] of adrs) {
    if (adr.status === 'superseded' && adrIdPattern.test(adr.supersededBy ?? '')) {
      const replacement = adrs.get(adr.supersededBy);
      if (adr.supersededBy === id) errors.push(`${adr.relativeFile}: ADR cannot supersede itself`);
      else if (!replacement) errors.push(`${adr.relativeFile}: superseded_by references missing ${adr.supersededBy}`);
      else if (replacement.supersedes !== id) {
        errors.push(`${adr.relativeFile}: superseded_by ${adr.supersededBy} must declare supersedes: ${id}`);
      }
    }
    if (adrIdPattern.test(adr.supersedes ?? '')) {
      const replaced = adrs.get(adr.supersedes);
      if (adr.supersedes === id) errors.push(`${adr.relativeFile}: ADR cannot supersede itself`);
      else if (!replaced) errors.push(`${adr.relativeFile}: supersedes references missing ${adr.supersedes}`);
      else if (replaced.status !== 'superseded' || replaced.supersededBy !== id) {
        errors.push(`${adr.relativeFile}: supersedes ${adr.supersedes} must be superseded with superseded_by: ${id}`);
      }
    }
  }

  for (const directory of directories) {
    const indexFile = path.join(directory, 'index.md');
    const relativeDirectory = path.relative(wikiRoot, directory) || '.';
    if (!(await exists(indexFile))) {
      errors.push(`${relativeDirectory}: directory containing wiki content is missing index.md`);
      continue;
    }
    const indexContent = await readFile(indexFile, 'utf8');
    const indexed = new Set(
      markdownTargets(indexContent)
        .map((target) => resolveLocalTarget(indexFile, target, wikiRoot))
        .filter(Boolean),
    );
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md') && !reservedNames.has(entry.name)) {
        if (!indexed.has(path.join(directory, entry.name))) {
          errors.push(`${relativeDirectory}/index.md: does not list ${entry.name}`);
        }
      }
      if (entry.isDirectory() && directories.has(path.join(directory, entry.name))) {
        const child = path.join(directory, entry.name);
        if (!indexed.has(child) && !indexed.has(path.join(child, 'index.md'))) {
          errors.push(`${relativeDirectory}/index.md: does not list ${entry.name}/`);
        }
      }
    }
  }

  await checkLinks(files, wikiRoot, errors);
  return { errors, warnings, count: files.length, adrIds: new Set(adrs.keys()) };
};

const validateRecordPath = (record, recordsById, errors) => {
  const parts = record.relative.split(path.sep);
  const stem = path.basename(record.file, '.md');
  const validWorkName = stem === record.id || stem.startsWith(`${record.id}-`);
  if (record.type === 'epic') {
    const expectedArchive = record.archived ? ['archive', 'epics'] : ['epics'];
    const prefixMatches = expectedArchive.every((part, index) => parts[index] === part);
    const directory = parts[expectedArchive.length];
    if (
      !prefixMatches ||
      parts.length !== expectedArchive.length + 2 ||
      stem !== record.id ||
      !directory?.startsWith(`${record.id}-`)
    ) {
      errors.push(`${record.relative}: Epic must be <area>/${record.id}-short-title/${record.id}.md`);
    }
    return;
  }
  if (!validWorkName) errors.push(`${record.relative}: work filename must begin with ${record.id}`);
  const parent = record.parent;
  if (parent === 'none') {
    const expected = record.archived ? ['archive', 'standalone'] : ['standalone'];
    if (!expected.every((part, index) => parts[index] === part) || parts.length !== expected.length + 1) {
      errors.push(`${record.relative}: standalone work must be placed under ${expected.join('/')}/`);
    }
  } else {
    const parentRecord = recordsById.get(parent);
    const expected = record.archived ? ['archive', 'epics'] : ['epics'];
    const directory = parts[expected.length];
    if (!expected.every((part, index) => parts[index] === part) || parts.length !== expected.length + 2) {
      errors.push(`${record.relative}: Epic work must be inside its Epic directory`);
    } else if (parentRecord && path.dirname(parentRecord.file) !== path.dirname(record.file)) {
      errors.push(`${record.relative}: parent ${parent} is not in the same Epic directory`);
    } else if (!directory?.startsWith(`${parent}-`)) {
      errors.push(`${record.relative}: containing directory must begin with ${parent}-`);
    }
  }
};

const findBlockingCycles = (recordsById, errors) => {
  const state = new Map();
  const stack = [];
  const visit = (id) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      const start = stack.indexOf(id);
      errors.push(`blocking cycle: ${[...stack.slice(start), id].join(' -> ')}`);
      return;
    }
    state.set(id, 1);
    stack.push(id);
    for (const target of recordsById.get(id)?.relationships.blocks ?? []) {
      if (recordsById.has(target)) visit(target);
    }
    stack.pop();
    state.set(id, 2);
  };
  for (const id of recordsById.keys()) visit(id);
};

const validateBacklog = async (adrIds) => {
  const errors = [];
  const warnings = [];
  const required = [
    'index.md',
    'maintenance.md',
    'epics/index.md',
    'standalone/index.md',
    'archive/index.md',
    'archive/epics/index.md',
    'archive/standalone/index.md',
    'templates/index.md',
    'templates/epic.md',
    'templates/story.md',
    'templates/task.md',
    'templates/bug.md',
  ];
  const publishedAdrs = adrIds ?? new Set();
  if (!(await exists(backlogRoot))) {
    return { errors: ['docs/backlog does not exist'], warnings, count: 0 };
  }
  for (const relative of required) {
    if (!(await exists(path.join(backlogRoot, relative))))
      errors.push(`docs/backlog/${relative}: required backlog scaffold is missing`);
  }

  const files = (await walkMarkdown(backlogRoot)).sort();
  const records = [];
  const recordsById = new Map();
  for (const file of files) {
    const relative = path.relative(backlogRoot, file);
    if (
      relative.startsWith(`templates${path.sep}`) ||
      path.basename(file) === 'index.md' ||
      relative === 'maintenance.md'
    )
      continue;
    const content = await readFile(file, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed) {
      if (/^(?:EPIC|WORK)-\d+/.test(path.basename(file)))
        errors.push(`${relative}: backlog record is missing YAML frontmatter`);
      continue;
    }
    const id = scalar(parsed.raw, 'id');
    const type = scalar(parsed.raw, 'type');
    const status = scalar(parsed.raw, 'status');
    const relationships = Object.fromEntries(relationshipFields.map((field) => [field, inlineList(parsed.raw, field)]));
    const record = {
      file,
      relative,
      content,
      body: parsed.body,
      frontmatter: parsed.raw,
      id,
      type,
      status,
      title: scalar(parsed.raw, 'title'),
      outcome: scalar(parsed.raw, 'outcome'),
      parent: scalar(parsed.raw, 'parent'),
      archived: relative.startsWith(`archive${path.sep}`),
      relationships,
    };
    records.push(record);
    if (!id) errors.push(`${relative}: record is missing id`);
    else if (recordsById.has(id))
      errors.push(`${relative}: duplicate immutable ID also used by ${recordsById.get(id).relative}`);
    else recordsById.set(id, record);
  }

  const now = Date.now();
  for (const record of records) {
    const label = record.relative;
    if (record.type === 'epic') {
      if (!/^EPIC-\d{3,}$/.test(record.id ?? '')) errors.push(`${label}: Epic id must match EPIC-NNN`);
      if (record.parent !== null) errors.push(`${label}: Epic must not declare parent`);
    } else if (workTypes.has(record.type)) {
      if (!/^WORK-\d{3,}$/.test(record.id ?? '')) errors.push(`${label}: executable-work id must match WORK-NNN`);
      if (!record.parent) errors.push(`${label}: work must declare parent as EPIC-NNN or none`);
    } else {
      errors.push(`${label}: type must be epic, story, task, or bug`);
    }
    if (!record.title) errors.push(`${label}: record is missing title`);
    if (!backlogStatuses.has(record.status)) errors.push(`${label}: invalid status ${record.status ?? '(missing)'}`);
    if (hasPlaceholder(record.outcome)) errors.push(`${label}: outcome must be non-empty and contain no placeholder`);
    for (const field of relationshipFields) {
      if (record.relationships[field] === null)
        errors.push(`${label}: ${field} must be declared as a YAML inline array`);
    }
    if (record.id) validateRecordPath(record, recordsById, errors);

    if (record.archived && !['done', 'cancelled'].includes(record.status)) {
      errors.push(`${label}: archived records must be done or cancelled`);
    }
    if (!record.archived && record.type === 'epic' && ['done', 'cancelled'].includes(record.status)) {
      errors.push(`${label}: terminal Epic must be archived atomically`);
    }
    if (!record.archived && record.parent === 'none' && ['done', 'cancelled'].includes(record.status)) {
      errors.push(`${label}: terminal standalone work must be archived`);
    }

    const decisions = scalar(record.frontmatter, 'decisions');
    const nonterminalOrDone = ['ready', 'in-progress', 'done'].includes(record.status);
    if (decisions === null) {
      const message = `${label}: record must declare decisions as pending, none, or an ADR-NNN inline array`;
      if (nonterminalOrDone) errors.push(message);
      else warnings.push(message);
    } else if (decisions === 'pending') {
      if (nonterminalOrDone) errors.push(`${label}: ready work requires decisions none or published ADR IDs`);
    } else if (decisions !== 'none') {
      const decisionIds = inlineList(record.frontmatter, 'decisions');
      if (decisionIds === null) {
        errors.push(`${label}: decisions must be pending, none, or a YAML inline array of ADR-NNN`);
      } else if (decisionIds.length === 0) {
        errors.push(`${label}: decisions inline array must not be empty; use none`);
      } else {
        for (const adrId of decisionIds) {
          if (!adrIdPattern.test(adrId)) errors.push(`${label}: decisions has invalid ADR ID ${adrId}`);
          else if (publishedAdrs.has(adrId)) continue;
          else if (record.archived) warnings.push(`${label}: archived decisions retains missing historical ${adrId}`);
          else errors.push(`${label}: decisions references missing ${adrId}`);
        }
      }
    }

    const cancelledReason = scalar(record.frontmatter, 'cancelled_reason');
    if (record.status === 'cancelled' && (!cancelledReason || cancelledReason === 'none')) {
      errors.push(`${label}: cancelled record requires cancelled_reason`);
    } else if (record.status !== 'cancelled' && cancelledReason !== 'none') {
      errors.push(`${label}: non-cancelled record must use cancelled_reason: none`);
    }

    if (workTypes.has(record.type)) {
      const claim = scalar(record.frontmatter, 'claim');
      const claimExpires = scalar(record.frontmatter, 'claim_expires');
      const wikiRefs = inlineList(record.frontmatter, 'wiki_refs');
      if (record.status === 'in-progress') {
        if (!claim || claim === 'none') errors.push(`${label}: in-progress work requires a temporary claim`);
        const expiry = Date.parse(claimExpires ?? '');
        if (!claimExpires || claimExpires === 'none' || Number.isNaN(expiry) || expiry <= now) {
          errors.push(`${label}: in-progress work requires a future ISO 8601 claim_expires`);
        }
      } else if (claim !== 'none' || claimExpires !== 'none') {
        errors.push(`${label}: work outside in-progress must use claim: none and claim_expires: none`);
      }

      if (wikiRefs?.includes('none') && wikiRefs.length !== 1) {
        errors.push(`${label}: wiki_refs may use none only by itself`);
      } else if (wikiRefs && !wikiRefs.includes('none')) {
        for (const reference of wikiRefs) {
          const target = reference.startsWith('/')
            ? path.resolve(wikiRoot, reference.slice(1))
            : path.resolve(projectRoot, reference);
          if (!isWithin(wikiRoot, target)) errors.push(`${label}: wiki_refs must stay within docs/wiki: ${reference}`);
          else if (!(await exists(target)) && record.archived) {
            warnings.push(`${label}: archived wiki_refs retains missing historical ${reference}`);
          } else if (!(await exists(target))) errors.push(`${label}: wiki_refs references missing ${reference}`);
        }
      }

      if (['ready', 'in-progress', 'done'].includes(record.status)) {
        const acceptance = checkboxes(section(record.body, 'Acceptance criteria'));
        const research = scalar(record.frontmatter, 'research');
        const researchBody = section(record.body, 'Research');
        const execution = section(record.body, 'Execution');
        const subtasks = section(record.body, 'Subtasks');
        if (acceptance.length === 0) errors.push(`${label}: ready work requires checkable acceptance criteria`);
        if (!wikiRefs || wikiRefs.length === 0) errors.push(`${label}: ready work requires wiki_refs or [none]`);
        if (!['complete', 'not-needed'].includes(research ?? '')) {
          errors.push(`${label}: ready work research must be complete or not-needed`);
        }
        if (!researchBody || hasPlaceholder(researchBody))
          errors.push(`${label}: ready work requires a resolved Research section`);
        if (
          !execution ||
          hasPlaceholder(execution) ||
          !/approv/i.test(execution) ||
          !/(?:verif|test|check|command)/i.test(execution)
        ) {
          errors.push(`${label}: ready work Execution must record approach, verification, and explicit approval`);
        }
        if (checkboxes(subtasks).length === 0 && !/^No subtasks\.$/im.test(subtasks)) {
          errors.push(`${label}: ready work requires checklist subtasks or "No subtasks."`);
        }
        if (record.status === 'done') {
          const incomplete = [...acceptance, ...checkboxes(subtasks)].filter((item) => !item.checked);
          if (incomplete.length > 0) errors.push(`${label}: done work has incomplete acceptance or subtasks`);
        }
      }
    } else if (record.type === 'epic' && ['ready', 'in-progress', 'done'].includes(record.status)) {
      const acceptance = checkboxes(section(record.body, 'Acceptance criteria'));
      const execution = section(record.body, 'Execution');
      if (acceptance.length === 0) errors.push(`${label}: ready Epic requires checkable acceptance criteria`);
      if (!execution || hasPlaceholder(execution) || !/approv/i.test(execution)) {
        errors.push(`${label}: ready Epic Execution must record explicit approval and coordination`);
      }
      if (record.status === 'done' && acceptance.some((item) => !item.checked)) {
        errors.push(`${label}: done Epic has incomplete acceptance criteria`);
      }
    }
  }

  for (const record of records) {
    if (workTypes.has(record.type) && record.parent !== 'none') {
      const parent = recordsById.get(record.parent);
      if (!parent) errors.push(`${record.relative}: missing parent reference ${record.parent}`);
      else if (parent.type !== 'epic') errors.push(`${record.relative}: parent ${record.parent} is not an Epic`);
    }
    for (const field of relationshipFields) {
      const targets = record.relationships[field] ?? [];
      if (new Set(targets).size !== targets.length)
        errors.push(`${record.relative}: ${field} contains duplicate references`);
      for (const target of targets) {
        if (!/^(?:EPIC|WORK)-\d{3,}$/.test(target))
          errors.push(`${record.relative}: ${field} has invalid ID ${target}`);
        else if (target === record.id) errors.push(`${record.relative}: ${field} cannot reference itself`);
        else if (!recordsById.has(target)) errors.push(`${record.relative}: ${field} references missing ${target}`);
        else if (!record.archived && recordsById.get(target).archived) {
          errors.push(`${record.relative}: active record ${field} archived ${target}`);
        }
      }
      if (field === 'relates_to') {
        for (const target of targets) {
          const reverse = recordsById.get(target)?.relationships.relates_to ?? [];
          if (!reverse.includes(record.id))
            errors.push(`${record.relative}: relates_to ${target} must be declared symmetrically`);
        }
      }
    }
  }

  for (const epic of records.filter((record) => record.type === 'epic')) {
    const children = records.filter((record) => record.parent === epic.id);
    if (['ready', 'in-progress', 'done'].includes(epic.status) && children.length === 0) {
      errors.push(`${epic.relative}: ready Epic requires at least one child work item`);
    }
    if (epic.archived) {
      for (const child of children) {
        if (
          !child.archived ||
          path.dirname(child.file) !== path.dirname(epic.file) ||
          !['done', 'cancelled'].includes(child.status)
        ) {
          errors.push(`${epic.relative}: archived Epic must contain every terminal child in the same directory`);
        }
      }
    } else if (children.some((child) => child.archived)) {
      errors.push(`${epic.relative}: active Epic cannot have archived children`);
    }
  }

  const rootIndex = path.join(backlogRoot, 'index.md');
  if (await exists(rootIndex)) {
    const indexContent = await readFile(rootIndex, 'utf8');
    const rankSection = section(indexContent, 'Global executable-work rank');
    const rankLines = rankSection.split(/\r?\n/).filter((line) => /^\s*\d+\./.test(line));
    const ranked = [];
    for (const line of rankLines) {
      const linked = /^\s*\d+\.\s+\[[^\]]*\]\([^)]+\)/.test(line);
      const id = /\bWORK-\d{3,}\b/.exec(line)?.[0];
      if (!linked || !id) errors.push(`index.md: invalid global rank entry: ${line.trim()}`);
      else {
        ranked.push(id);
        const targetText = /\[[^\]]*\]\(([^)]+)\)/.exec(line)?.[1];
        const target = targetText ? resolveLocalTarget(rootIndex, targetText, backlogRoot) : null;
        if (recordsById.get(id)?.file !== target) {
          errors.push(`index.md: global rank ${id} must link to its matching record`);
        }
      }
    }
    const activeWork = records
      .filter((record) => workTypes.has(record.type) && !['done', 'cancelled'].includes(record.status))
      .map((record) => record.id)
      .filter(Boolean);
    for (const id of activeWork) {
      const count = ranked.filter((rankedId) => rankedId === id).length;
      if (count !== 1) errors.push(`index.md: active work ${id} must appear exactly once in global rank`);
    }
    for (const id of ranked) {
      if (!activeWork.includes(id)) errors.push(`index.md: global rank contains missing or terminal work ${id}`);
    }
  }

  for (const relativeArea of ['epics', 'standalone', 'archive/epics', 'archive/standalone']) {
    const area = path.join(backlogRoot, relativeArea);
    const indexFile = path.join(area, 'index.md');
    if (!(await exists(area)) || !(await exists(indexFile))) continue;
    const indexContent = await readFile(indexFile, 'utf8');
    const indexed = new Set(
      markdownTargets(indexContent)
        .map((target) => resolveLocalTarget(indexFile, target, backlogRoot))
        .filter(Boolean),
    );
    const entries = await readdir(area, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'index.md') continue;
      if (entry.isDirectory()) {
        const target = path.join(area, entry.name);
        if (!indexed.has(target) && !indexed.has(path.join(target, 'index.md'))) {
          errors.push(`${relativeArea}/index.md: does not list ${entry.name}/`);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md') && !indexed.has(path.join(area, entry.name))) {
        errors.push(`${relativeArea}/index.md: does not list ${entry.name}`);
      }
    }
  }

  findBlockingCycles(recordsById, errors);
  const activeRecordFiles = new Map(
    records.filter((record) => !record.archived).map((record) => [record.file, record]),
  );
  await checkLinks(files, backlogRoot, errors, activeRecordFiles);
  return { errors, warnings, count: records.length };
};

const report = (name, result, noun) => {
  if (result.warnings.length > 0) {
    process.stderr.write(
      `${name} validation warnings:\n${result.warnings.map((warning) => `- ${warning}`).join('\n')}\n`,
    );
  }
  if (result.errors.length > 0) {
    process.stderr.write(
      `${name} validation failed with ${result.errors.length} error(s):\n${result.errors.map((error) => `- ${error}`).join('\n')}\n`,
    );
  } else {
    process.stdout.write(`${name} validation passed: ${result.count} ${noun} checked.\n`);
  }
};

const wikiResult = await validateWiki();
const backlogResult = await validateBacklog(wikiResult.adrIds);
report('Wiki', wikiResult, 'Markdown files');
report('Backlog', backlogResult, 'records');
if (wikiResult.errors.length > 0 || backlogResult.errors.length > 0) process.exitCode = 1;
