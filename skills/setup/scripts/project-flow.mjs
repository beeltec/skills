#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import {
  dirname,
  isAbsolute,
  join,
  normalize,
  parse as parsePath,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";

const ITEM_TYPES = ["epic", "story", "bug", "task", "subtask"];
const STANDARD_TYPES = ["story", "bug", "task"];
const STATUSES = ["backlog", "ready", "in-progress", "in-review", "done"];
const PRIORITIES = ["highest", "high", "medium", "low", "lowest"];
const OFFICIAL_SOURCE_DONE = "Relevant external claims cite refreshed official source notes.";
const DEFAULT_GIT_CONFIG = Object.freeze({
  targetBranch: "main",
  worktreeDirectory: ".woktrees",
  mergeStrategy: "no-ff",
  branchConvention: "conventional-branch@1.1.0",
  commitConvention: "conventional-commits@1.0.0",
});
const TICKET_BRANCH_TYPES = ["feature", "feat", "bugfix", "fix", "hotfix", "chore"];
const CONVENTIONAL_COMMIT_SUBJECT = /^[a-z][a-z0-9-]*(?:\([a-z0-9][a-z0-9._/-]*\))?!?: \S.*$/;
const TRANSITIONS = {
  backlog: ["ready"],
  ready: ["backlog", "in-progress"],
  "in-progress": ["ready", "in-review"],
  "in-review": ["in-progress"],
  done: [],
};
const RESERVED_KNOWLEDGE_FILES = new Set(["index.md", "log.md"]);
const SCRIPT_PATH = fileURLToPath(import.meta.url);

class WorkflowError extends Error {}

function fail(message) {
  throw new WorkflowError(message);
}

function now() {
  return new Date().toISOString();
}

function today() {
  return now().slice(0, 10);
}

function parseArguments(values) {
  const positionals = [];
  const options = new Map();

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) {
      positionals.push(value);
      continue;
    }

    const name = value.slice(2);
    if (!name) fail("Option names cannot be empty.");

    const next = values[index + 1];
    const optionValue = next === undefined || next.startsWith("--") ? true : next;
    if (optionValue !== true) index += 1;

    const existing = options.get(name) ?? [];
    existing.push(optionValue);
    options.set(name, existing);
  }

  return { positionals, options };
}

function option(args, name, required = false) {
  const values = args.options.get(name) ?? [];
  const value = values.at(-1);
  if (required && (value === undefined || value === true || !String(value).trim())) {
    fail(`Missing required option --${name}.`);
  }
  return value === true || value === undefined ? undefined : String(value);
}

function options(args, name) {
  return (args.options.get(name) ?? [])
    .filter((value) => value !== true)
    .map(String);
}

function hasOption(args, name) {
  return args.options.has(name);
}

function requiredPositional(args, index, label) {
  const value = args.positionals[index];
  if (!value) fail(`Missing ${label}.`);
  return value;
}

function findProjectRoot(start) {
  let current = resolve(start);

  while (true) {
    if (existsSync(join(current, ".project", "workflow.json"))) return current;
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  fail("No .project/workflow.json was found. Run the setup skill first.");
}

function pathsFor(root) {
  const project = join(root, ".project");
  const docs = join(root, "docs");
  const knowledge = join(docs, "knowledge");
  const sources = join(knowledge, "sources");
  const work = join(docs, "work");
  return {
    root,
    project,
    docs,
    config: join(project, "workflow.json"),
    cli: join(project, "bin", "project-flow.mjs"),
    knowledge,
    knowledgeLog: join(knowledge, "log.md"),
    sources,
    work,
    board: join(work, "board.md"),
    items: join(work, "items"),
    candidates: join(work, "drafts"),
  };
}

function readText(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    fail(`Cannot read ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Cannot parse ${label} at ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function writeText(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, content, "utf8");
  renameSync(temporary, path);
}

function writeJson(path, value) {
  writeText(path, `${JSON.stringify(value, null, 2)}\n`);
}

function loadConfig(paths) {
  const config = readJson(paths.config, "workflow configuration");
  if (!config || typeof config !== "object") fail("Workflow configuration must be an object.");
  if (config.schemaVersion !== 1) fail(`Unsupported workflow schema: ${config.schemaVersion}.`);
  if (typeof config.projectKey !== "string" || !/^[A-Z][A-Z0-9]{1,9}$/.test(config.projectKey)) {
    fail("workflow.json has an invalid projectKey.");
  }
  if (typeof config.projectName !== "string" || !config.projectName.trim()) {
    fail("workflow.json has an invalid projectName.");
  }
  if (config.spaces?.knowledge !== "docs/knowledge" || config.spaces?.work !== "docs/work") {
    fail("workflow.json must use docs/knowledge and docs/work.");
  }
  if (config.git !== undefined) validateGitConfig(config.git);
  return config;
}

function validateGitConfig(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail("workflow.json git settings must be an object.");
  }
  if (typeof value.targetBranch !== "string" || !validGitRefName(value.targetBranch)) {
    fail("workflow.json git.targetBranch is invalid.");
  }
  if (value.worktreeDirectory !== DEFAULT_GIT_CONFIG.worktreeDirectory) {
    fail("workflow.json git.worktreeDirectory must be .woktrees.");
  }
  if (value.mergeStrategy !== DEFAULT_GIT_CONFIG.mergeStrategy) {
    fail("workflow.json git.mergeStrategy must be no-ff.");
  }
  if (value.branchConvention !== DEFAULT_GIT_CONFIG.branchConvention) {
    fail("workflow.json must use Conventional Branch 1.1.0.");
  }
  if (value.commitConvention !== DEFAULT_GIT_CONFIG.commitConvention) {
    fail("workflow.json must use Conventional Commits 1.0.0.");
  }
}

function validGitRefName(value) {
  return (
    /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value) &&
    !value.includes("..") &&
    !value.includes("//") &&
    !value.endsWith(".") &&
    !value.endsWith("/") &&
    !value.endsWith(".lock")
  );
}

function gitConfig(config) {
  const value = config.git ?? DEFAULT_GIT_CONFIG;
  validateGitConfig(value);
  return value;
}

function normalizeKey(value) {
  const key = String(value).toUpperCase();
  if (!/^[A-Z][A-Z0-9]{1,9}-[1-9][0-9]*$/.test(key)) fail(`Invalid work item key: ${value}.`);
  return key;
}

function itemPath(paths, key) {
  return join(paths.items, `${normalizeKey(key)}.json`);
}

function validateItemShape(item, path) {
  const errors = [];
  if (!item || typeof item !== "object" || Array.isArray(item)) return [`${path} must contain an object.`];
  if (item.schemaVersion !== 1) errors.push(`${path}: schemaVersion must be 1.`);
  if (typeof item.key !== "string" || !/^[A-Z][A-Z0-9]{1,9}-[1-9][0-9]*$/.test(item.key)) {
    errors.push(`${path}: key is invalid.`);
  }
  if (!ITEM_TYPES.includes(item.type)) errors.push(`${path}: type is invalid.`);
  if (typeof item.summary !== "string" || !item.summary.trim()) errors.push(`${path}: summary is required.`);
  if (typeof item.description !== "string") errors.push(`${path}: description must be a string.`);
  if (!STATUSES.includes(item.status)) errors.push(`${path}: status is invalid.`);
  if (!PRIORITIES.includes(item.priority)) errors.push(`${path}: priority is invalid.`);
  if (item.parent !== null && typeof item.parent !== "string") errors.push(`${path}: parent must be a key or null.`);
  if (item.resolution !== null && typeof item.resolution !== "string") {
    errors.push(`${path}: resolution must be a string or null.`);
  }
  if (!Array.isArray(item.acceptanceCriteria)) errors.push(`${path}: acceptanceCriteria must be an array.`);
  if (!Array.isArray(item.checks)) errors.push(`${path}: checks must be an array.`);
  if (!Array.isArray(item.knowledgeChanges)) errors.push(`${path}: knowledgeChanges must be an array.`);
  if (!Array.isArray(item.promotions)) errors.push(`${path}: promotions must be an array.`);
  if (
    !item.review ||
    typeof item.review !== "object" ||
    !["pending", "pass", "changes-requested"].includes(item.review.status)
  ) {
    errors.push(`${path}: review status must be pending, pass, or changes-requested.`);
  } else if (
    (item.review.reviewer !== null && typeof item.review.reviewer !== "string") ||
    (item.review.fixedPoint !== null && typeof item.review.fixedPoint !== "string") ||
    (item.review.standards !== null && typeof item.review.standards !== "string") ||
    (item.review.spec !== null && typeof item.review.spec !== "string") ||
    (item.review.reviewedAt !== null && typeof item.review.reviewedAt !== "string")
  ) {
    errors.push(`${path}: review fields must be strings or null.`);
  }
  if (
    !item.links ||
    typeof item.links !== "object" ||
    !Array.isArray(item.links.blockedBy) ||
    !Array.isArray(item.links.relatesTo)
  ) {
    errors.push(`${path}: links.blockedBy and links.relatesTo must be arrays.`);
  }
  if (!["required", "none"].includes(item.knowledgePolicy)) {
    errors.push(`${path}: knowledgePolicy must be required or none.`);
  }
  return errors;
}

function loadItems(paths) {
  if (!existsSync(paths.items)) return [];
  return readdirSync(paths.items)
    .filter((name) => name.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
    .map((name) => {
      const path = join(paths.items, name);
      const item = readJson(path, "work item");
      const errors = validateItemShape(item, path);
      if (errors.length) fail(errors.join("\n"));
      return item;
    });
}

function loadItem(paths, key) {
  const path = itemPath(paths, key);
  if (!existsSync(path)) fail(`Work item ${normalizeKey(key)} does not exist.`);
  const item = readJson(path, "work item");
  const errors = validateItemShape(item, path);
  if (errors.length) fail(errors.join("\n"));
  return item;
}

function saveItem(paths, item) {
  item.updatedAt = now();
  writeJson(itemPath(paths, item.key), item);
}

function resetReview(item) {
  item.review = {
    status: "pending",
    reviewer: null,
    fixedPoint: null,
    standards: null,
    spec: null,
    reviewedAt: null,
  };
}

function hasPassingReview(item) {
  return (
    item.review.status === "pass" &&
    typeof item.review.reviewer === "string" &&
    Boolean(item.review.reviewer.trim()) &&
    typeof item.review.fixedPoint === "string" &&
    Boolean(item.review.fixedPoint.trim()) &&
    typeof item.review.standards === "string" &&
    Boolean(item.review.standards.trim()) &&
    typeof item.review.spec === "string" &&
    Boolean(item.review.spec.trim()) &&
    typeof item.review.reviewedAt === "string" &&
    Boolean(item.review.reviewedAt.trim())
  );
}

function itemMap(items) {
  return new Map(items.map((item) => [item.key, item]));
}

function validateHierarchy(items) {
  const errors = [];
  const byKey = itemMap(items);

  for (const item of items) {
    if (item.type === "epic" && item.parent !== null) {
      errors.push(`${item.key}: an epic cannot have a parent.`);
    }

    if (item.type === "subtask") {
      const parent = item.parent ? byKey.get(item.parent) : undefined;
      if (!parent) errors.push(`${item.key}: a subtask needs an existing parent.`);
      else if (!STANDARD_TYPES.includes(parent.type)) {
        errors.push(`${item.key}: a subtask parent must be a story, bug, or task.`);
      }
    }

    if (STANDARD_TYPES.includes(item.type) && item.parent !== null) {
      const parent = byKey.get(item.parent);
      if (!parent) errors.push(`${item.key}: parent ${item.parent} does not exist.`);
      else if (parent.type !== "epic") errors.push(`${item.key}: a standard item can only have an epic parent.`);
    }

    for (const blocker of item.links.blockedBy) {
      if (blocker === item.key) errors.push(`${item.key}: an item cannot block itself.`);
      else if (!byKey.has(blocker)) errors.push(`${item.key}: blocker ${blocker} does not exist.`);
    }

    const visited = new Set([item.key]);
    let parentKey = item.parent;
    while (parentKey) {
      if (visited.has(parentKey)) {
        errors.push(`${item.key}: parent hierarchy contains a cycle.`);
        break;
      }
      visited.add(parentKey);
      parentKey = byKey.get(parentKey)?.parent ?? null;
    }
  }

  const states = new Map();
  const stack = [];
  function visitBlockers(key) {
    const state = states.get(key) ?? "new";
    if (state === "done") return;
    if (state === "visiting") {
      const start = stack.indexOf(key);
      const cycle = [...stack.slice(start), key];
      errors.push(`Blocked-by links contain a cycle: ${cycle.join(" -> ")}.`);
      return;
    }

    states.set(key, "visiting");
    stack.push(key);
    for (const blocker of byKey.get(key)?.links.blockedBy ?? []) {
      if (byKey.has(blocker)) visitBlockers(blocker);
    }
    stack.pop();
    states.set(key, "done");
  }

  for (const item of items) visitBlockers(item.key);

  return errors;
}

function safeKnowledgeTarget(value) {
  if (isAbsolute(value)) fail("Knowledge targets must be relative to the bundle root.");
  const unix = value.replaceAll("\\", "/");
  const normalized = normalize(unix).split(sep).join("/");
  if (!normalized || normalized === "." || normalized.startsWith("../") || normalized.includes("/../")) {
    fail(`Unsafe knowledge target: ${value}.`);
  }
  if (!normalized.endsWith(".md")) fail("Knowledge targets must end in .md.");
  if (RESERVED_KNOWLEDGE_FILES.has(normalized.split("/").at(-1))) {
    fail("index.md and log.md are reserved knowledge filenames.");
  }
  for (const segment of normalized.split("/")) {
    if (!/^[A-Za-z0-9._-]+$/.test(segment)) {
      fail(`Knowledge target segments may only contain letters, numbers, dots, underscores, and hyphens: ${value}.`);
    }
  }
  return normalized;
}

function canonicalHttpsUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    fail(`Invalid source URL: ${value}.`);
  }
  if (url.protocol !== "https:") fail("Official source URLs must use HTTPS.");
  if (url.username || url.password) fail("Official source URLs cannot contain credentials.");
  return url.toString();
}

function oneLine(value) {
  return String(value).trim().replace(/\s+/g, " ");
}

function ensureWorktreeLayout(paths, config) {
  const settings = gitConfig(config);
  mkdirSync(join(paths.root, settings.worktreeDirectory), { recursive: true });

  const ignorePath = join(paths.root, ".gitignore");
  const rule = `/${settings.worktreeDirectory}/`;
  const existing = existsSync(ignorePath) ? readFileSync(ignorePath, "utf8") : "";
  const lines = existing.replaceAll("\r\n", "\n").split("\n");
  if (lines.includes(rule)) return;

  const prefix = existing && !existing.endsWith("\n") ? `${existing}\n` : existing;
  writeText(ignorePath, `${prefix}${rule}\n`);
}

function runGit(root, args, allowFailure = false) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024,
  });
  if (result.error) {
    fail(`Cannot run Git: ${result.error.message}`);
  }
  if (result.status !== 0 && !allowFailure) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    fail(`Git command failed: git ${args.join(" ")}${details ? `\n${details}` : ""}`);
  }
  return result;
}

function requireGitRepositoryRoot(root) {
  const result = runGit(root, ["rev-parse", "--show-toplevel"], true);
  if (result.status !== 0) fail("Ticket worktrees require an initialized Git repository.");
  const topLevel = realpathSync(result.stdout.trim());
  if (topLevel !== realpathSync(root)) {
    fail("The workflow root must equal the Git repository root for ticket worktrees.");
  }
  const head = runGit(root, ["rev-parse", "--verify", "HEAD^{commit}"], true);
  if (head.status !== 0) fail("Create the initial Git commit before creating a ticket worktree.");
}

function currentGitBranch(root) {
  const result = runGit(root, ["symbolic-ref", "--quiet", "--short", "HEAD"], true);
  if (result.status !== 0 || !result.stdout.trim()) fail("Ticket worktrees require a checked-out branch, not detached HEAD.");
  return result.stdout.trim();
}

function assertCleanGitWorktree(root, label) {
  const status = runGit(root, ["status", "--porcelain=v1", "--untracked-files=all"]).stdout.trim();
  if (status) fail(`${label} must be clean before this operation.\n${status}`);
}

function slugifyBranchDescription(value) {
  const slug = String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/[-.]+$/g, "");
  return slug || "work";
}

function branchTypeForItem(item) {
  if (item.type === "story") return "feat";
  if (item.type === "bug") return "fix";
  return "chore";
}

function conventionalBranchName(item, requestedType) {
  const type = (requestedType ?? branchTypeForItem(item)).toLowerCase();
  if (!TICKET_BRANCH_TYPES.includes(type)) {
    fail(`Branch type must be one of: ${TICKET_BRANCH_TYPES.join(", ")}.`);
  }
  const description = `${item.key.toLowerCase()}-${slugifyBranchDescription(item.summary)}`;
  const branch = `${type}/${description}`;
  if (!isConventionalTicketBranch(branch, item.key)) fail(`Generated invalid ticket branch: ${branch}.`);
  return branch;
}

function isConventionalTicketBranch(branch, key) {
  const separator = branch.indexOf("/");
  if (separator < 1) return false;
  const type = branch.slice(0, separator);
  const description = branch.slice(separator + 1);
  return (
    TICKET_BRANCH_TYPES.includes(type) &&
    description.startsWith(`${key.toLowerCase()}-`) &&
    /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(description)
  );
}

function commitTypeForBranch(branch) {
  const type = branch.split("/", 1)[0];
  if (["feature", "feat"].includes(type)) return "feat";
  if (["bugfix", "fix", "hotfix"].includes(type)) return "fix";
  return "chore";
}

function parseFrontmatter(content, jsonRequired = false) {
  const normalized = content.replaceAll("\r\n", "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
  if (!match) fail("The Markdown file needs a complete YAML frontmatter block.");
  const raw = match[1].trim();
  const body = match[2];

  if (raw.startsWith("{")) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      fail(`JSON-compatible YAML is invalid: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) fail("Frontmatter must be an object.");
    return { data, body, format: "json" };
  }

  if (jsonRequired) {
    fail("Draft knowledge must use JSON-compatible YAML frontmatter. Recreate it with knowledge-template.");
  }

  const fields = {};
  for (const line of raw.split("\n")) {
    const field = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*?)\s*$/);
    if (!field) continue;
    let value = field[2].replace(/\s+#.*$/, "").trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    fields[field[1]] = value;
  }
  return { data: fields, body, format: "yaml" };
}

function renderJsonConcept(data, body) {
  const normalizedBody = body.startsWith("\n") ? body.slice(1) : body;
  return `---\n${JSON.stringify(data, null, 2)}\n---\n\n${normalizedBody.trimEnd()}\n`;
}

function conceptMetadata(content) {
  const { data } = parseFrontmatter(content);
  const type = typeof data.type === "string" ? data.type.trim() : "";
  if (!type) fail("An OKF concept needs a non-empty type field.");
  return {
    type,
    title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : undefined,
    description:
      typeof data.description === "string" && data.description.trim() ? data.description.trim() : undefined,
  };
}

function officialSourceErrors(data, body, path) {
  if (data.type !== "OfficialSource") return [];

  const errors = [];
  if (data.status !== "stable") errors.push(`${path}: an official source must have stable status.`);
  if (typeof data.description !== "string" || !data.description.trim()) {
    errors.push(`${path}: an official source needs an applicability description.`);
  }
  if (!Array.isArray(data.sources) || data.sources.length !== 1) {
    errors.push(`${path}: an official source must contain exactly one source entry.`);
  } else {
    const source = data.sources[0];
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      errors.push(`${path}: the official source entry must be an object.`);
    } else {
      if (typeof source.resource !== "string") {
        errors.push(`${path}: the official source needs a canonical URL.`);
      } else {
        try {
          canonicalHttpsUrl(source.resource);
        } catch (error) {
          errors.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      for (const field of ["title", "publisher", "version", "retrievedAt"]) {
        if (typeof source[field] !== "string" || !source[field].trim()) {
          errors.push(`${path}: source.${field} must be a non-empty string.`);
        }
      }
      if (
        typeof source.retrievedAt === "string" &&
        Number.isNaN(Date.parse(source.retrievedAt))
      ) {
        errors.push(`${path}: source.retrievedAt must be an ISO date-time.`);
      }
    }
  }

  const claims = body.match(/(?:^|\n)# Verified claims\n\n([\s\S]*?)(?=\n# |\s*$)/)?.[1] ?? "";
  if (!claims.split("\n").some((line) => line.startsWith("- ") && line.slice(2).trim())) {
    errors.push(`${path}: an official source needs at least one verified claim.`);
  }
  return errors;
}

function markdownLabel(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("[", "\\[").replaceAll("]", "\\]");
}

function humanize(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function knowledgeIndexContent(directory, paths, config) {
  const entries = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .sort((left, right) => left.name.localeCompare(right.name));
  const concepts = [];
  const sections = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      sections.push(entry.name);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".md") || RESERVED_KNOWLEDGE_FILES.has(entry.name)) continue;
    const metadata = conceptMetadata(readText(path));
    concepts.push({ name: entry.name, ...metadata });
  }

  const isRoot = directory === paths.knowledge;
  const heading = isRoot ? `${config.projectName} Knowledge` : humanize(parsePath(directory).base);
  const lines = [];
  if (isRoot) lines.push("---", 'okf_version: "0.2"', "---", "");
  lines.push(`# ${heading}`, "");

  if (concepts.length) {
    lines.push("## Concepts", "");
    for (const concept of concepts) {
      const label = concept.title ?? humanize(concept.name.slice(0, -3));
      const description = concept.description ? ` - ${concept.description}` : "";
      lines.push(`* [${markdownLabel(label)}](${encodeURI(concept.name)})${description}`);
    }
    lines.push("");
  }

  if (sections.length) {
    lines.push("## Sections", "");
    for (const section of sections) {
      lines.push(`* [${markdownLabel(humanize(section))}](${encodeURI(section)}/) - Browse ${section} concepts.`);
    }
    lines.push("");
  }

  if (!concepts.length && !sections.length) lines.push("No concepts yet.", "");
  return `${lines.join("\n").trimEnd()}\n`;
}

function generateKnowledgeIndexes(paths, config) {
  function visit(directory) {
    const subdirectories = readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => join(directory, entry.name));
    for (const subdirectory of subdirectories) visit(subdirectory);
    writeText(join(directory, "index.md"), knowledgeIndexContent(directory, paths, config));
  }
  visit(paths.knowledge);
}

function appendKnowledgeLog(paths, item, promotions) {
  const heading = "# Knowledge Update Log\n\n";
  let content = existsSync(paths.knowledgeLog) ? readText(paths.knowledgeLog) : heading;
  if (!content.startsWith("# Knowledge Update Log")) fail("Knowledge log has an invalid heading.");

  const entries = promotions.map((promotion) => {
    const label = markdownLabel(promotion.title ?? humanize(promotion.target.split("/").at(-1).slice(0, -3)));
    return `* **Promotion**: ${item.key} promoted [${label}](/${promotion.target}).`;
  });
  const dateHeading = `## ${today()}`;

  if (content.includes(`${dateHeading}\n`)) {
    content = content.replace(`${dateHeading}\n`, `${dateHeading}\n${entries.join("\n")}\n`);
  } else {
    const remainder = content.slice(content.indexOf("\n") + 1).trimStart();
    content = `${heading}${dateHeading}\n${entries.join("\n")}\n\n${remainder}`.trimEnd() + "\n";
  }
  writeText(paths.knowledgeLog, content);
}

function childrenOf(items, key) {
  return items.filter((item) => item.parent === key);
}

function candidateErrors(paths, item) {
  const errors = [];
  const seen = new Set();

  for (const change of item.knowledgeChanges) {
    if (!change || typeof change !== "object") {
      errors.push(`${item.key}: a knowledge change is invalid.`);
      continue;
    }

    let target;
    try {
      target = safeKnowledgeTarget(change.target);
    } catch (error) {
      errors.push(`${item.key}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    if (seen.has(target)) errors.push(`${item.key}: duplicate knowledge target ${target}.`);
    seen.add(target);

    if (!["create", "update"].includes(change.action)) {
      errors.push(`${item.key}: ${target} needs action create or update.`);
      continue;
    }

    const expectedCandidate = join(paths.candidates, item.key, ...target.split("/"));
    if (resolve(paths.root, change.candidate) !== expectedCandidate) {
      errors.push(`${item.key}: candidate path for ${target} does not match its target.`);
      continue;
    }
    if (!existsSync(expectedCandidate)) {
      errors.push(`${item.key}: candidate for ${target} is missing.`);
      continue;
    }

    const established = join(paths.knowledge, ...target.split("/"));
    if (change.action === "create" && existsSync(established)) {
      errors.push(`${item.key}: create target ${target} already exists.`);
    }
    if (change.action === "update" && !existsSync(established)) {
      errors.push(`${item.key}: update target ${target} does not exist.`);
    }

    try {
      const { data } = parseFrontmatter(readText(expectedCandidate), true);
      if (typeof data.type !== "string" || !data.type.trim()) {
        errors.push(`${item.key}: candidate ${target} needs a non-empty type.`);
      }
    } catch (error) {
      errors.push(`${item.key}: candidate ${target}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return errors;
}

function greenGateErrors(paths, item, items) {
  const errors = [];
  const byKey = itemMap(items);

  if (item.status !== "in-review") errors.push(`${item.key}: status must be in-review.`);
  if (["epic", "story", "bug"].includes(item.type) && item.acceptanceCriteria.length === 0) {
    errors.push(`${item.key}: at least one acceptance criterion is required.`);
  }
  for (const criterion of item.acceptanceCriteria) {
    if (criterion.status !== "pass" || typeof criterion.evidence !== "string" || !criterion.evidence.trim()) {
      errors.push(`${item.key}: ${criterion.id} needs passing evidence.`);
    }
  }
  for (const check of item.checks) {
    if (check.status !== "pass" || !check.lastRun || check.lastRun.exitCode !== 0) {
      errors.push(`${item.key}: ${check.id} must pass through verify.`);
    }
  }
  if (!hasPassingReview(item)) {
    errors.push(`${item.key}: Standards and Spec need passing evidence and a reviewer.`);
  }
  for (const blockerKey of item.links.blockedBy) {
    if (byKey.get(blockerKey)?.status !== "done") errors.push(`${item.key}: blocker ${blockerKey} is not done.`);
  }
  for (const child of childrenOf(items, item.key)) {
    if (child.status !== "done") errors.push(`${item.key}: child ${child.key} is not done.`);
  }
  if (item.knowledgePolicy === "required" && item.knowledgeChanges.length === 0) {
    errors.push(`${item.key}: drafted knowledge is required.`);
  }
  errors.push(...candidateErrors(paths, item));
  return errors;
}

function completedGateErrors(item, items) {
  const errors = [];
  const byKey = itemMap(items);

  if (item.status !== "done") return errors;
  if (!item.resolution) errors.push(`${item.key}: done items need a resolution.`);
  if (["epic", "story", "bug"].includes(item.type) && item.acceptanceCriteria.length === 0) {
    errors.push(`${item.key}: a completed ${item.type} needs an acceptance criterion.`);
  }
  for (const criterion of item.acceptanceCriteria) {
    if (criterion.status !== "pass" || typeof criterion.evidence !== "string" || !criterion.evidence.trim()) {
      errors.push(`${item.key}: completed ${criterion.id} needs passing evidence.`);
    }
  }
  for (const check of item.checks) {
    if (check.status !== "pass" || !check.lastRun || check.lastRun.exitCode !== 0) {
      errors.push(`${item.key}: completed ${check.id} needs a passing verification run.`);
    }
  }
  if (!hasPassingReview(item)) errors.push(`${item.key}: done items need a passing code review.`);
  for (const blockerKey of item.links.blockedBy) {
    if (byKey.get(blockerKey)?.status !== "done") errors.push(`${item.key}: blocker ${blockerKey} is not done.`);
  }
  for (const child of childrenOf(items, item.key)) {
    if (child.status !== "done") errors.push(`${item.key}: child ${child.key} is not done.`);
  }
  if (item.knowledgePolicy === "required" && item.promotions.length === 0) {
    errors.push(`${item.key}: a done item with required knowledge needs a promotion record.`);
  }
  if (item.knowledgeChanges.length !== 0) errors.push(`${item.key}: done items cannot retain knowledge drafts.`);
  return errors;
}

function boardContent(paths, config, items) {
  const lines = [
    `# ${config.projectName} Work Board`,
    "",
    `Project key: \`${config.projectKey}\``,
    "",
  ];

  for (const status of STATUSES) {
    const matching = items.filter((item) => item.status === status);
    lines.push(`## ${humanize(status)} (${matching.length})`, "");
    if (!matching.length) {
      lines.push("No items.", "");
      continue;
    }
    lines.push("| Key | Type | Summary | Parent | Green |", "| --- | --- | --- | --- | --- |");
    for (const item of matching) {
      const green = item.status === "done" || greenGateErrors(paths, item, items).length === 0 ? "yes" : "no";
      lines.push(
        `| ${item.key} | ${item.type} | ${markdownLabel(item.summary)} | ${item.parent ?? "-"} | ${green} |`,
      );
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function syncGeneratedFiles(paths, config, items = loadItems(paths)) {
  mkdirSync(paths.sources, { recursive: true });
  generateKnowledgeIndexes(paths, config);
  writeText(paths.board, boardContent(paths, config, items));
}

function validateKnowledge(paths) {
  const errors = [];

  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

      const localName = entry.name;
      const content = readText(path);
      if (localName === "index.md") {
        if (directory === paths.knowledge) {
          if (!/^---\nokf_version:\s*["']?0\.2["']?\n---\n/.test(content.replaceAll("\r\n", "\n"))) {
            errors.push(`${path}: root index must declare okf_version 0.2.`);
          }
        } else if (content.startsWith("---")) {
          errors.push(`${path}: only the root index may have frontmatter.`);
        }
        continue;
      }

      if (localName === "log.md") {
        for (const match of content.matchAll(/^##\s+(.+)$/gm)) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(match[1])) errors.push(`${path}: log dates must use YYYY-MM-DD.`);
        }
        continue;
      }

      try {
        const { data, body } = parseFrontmatter(content);
        conceptMetadata(content);
        if (path.startsWith(`${paths.sources}${sep}`) && data.type !== "OfficialSource") {
          errors.push(`${path}: files under docs/knowledge/sources must use type OfficialSource.`);
        }
        errors.push(...officialSourceErrors(data, body, path));
      } catch (error) {
        errors.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  visit(paths.knowledge);
  return errors;
}

function validateWorkspace(paths, config, items) {
  const errors = [];
  errors.push(...validateHierarchy(items));
  errors.push(...validateKnowledge(paths));

  for (const item of items) {
    if (item.status === "done") {
      errors.push(...completedGateErrors(item, items));
    } else if (item.resolution !== null) {
      errors.push(`${item.key}: open items cannot have a resolution.`);
    }
    errors.push(...candidateErrors(paths, item));
  }

  const expectedBoard = boardContent(paths, config, items);
  if (!existsSync(paths.board) || readText(paths.board) !== expectedBoard) {
    errors.push(`${paths.board}: generated board is stale. Run sync.`);
  }
  return errors;
}

function nextKey(config, items) {
  const highest = items.reduce((value, item) => {
    if (!item.key.startsWith(`${config.projectKey}-`)) return value;
    const sequence = Number(item.key.slice(config.projectKey.length + 1));
    return Number.isSafeInteger(sequence) ? Math.max(value, sequence) : value;
  }, 0);
  return `${config.projectKey}-${highest + 1}`;
}

function assertReady(item) {
  const errors = [];
  if (!item.description.trim()) errors.push(`${item.key}: description is required before ready.`);
  if (["epic", "story", "bug"].includes(item.type) && item.acceptanceCriteria.length === 0) {
    errors.push(`${item.key}: at least one acceptance criterion is required before ready.`);
  }
  if (errors.length) fail(errors.join("\n"));
}

function parseCheck(value) {
  const separator = value.indexOf("::");
  if (separator < 1 || separator === value.length - 2) {
    fail(`Invalid check "${value}". Use "Name::command".`);
  }
  return { name: value.slice(0, separator).trim(), command: value.slice(separator + 2).trim() };
}

function commandInit(args) {
  const root = resolve(option(args, "root") ?? process.cwd());
  const paths = pathsFor(root);
  const projectKey = option(args, "key", true).toUpperCase();
  const projectName = option(args, "name", true).trim();
  const targetBranch = option(args, "target-branch") ?? DEFAULT_GIT_CONFIG.targetBranch;

  if (!/^[A-Z][A-Z0-9]{1,9}$/.test(projectKey)) {
    fail("Project keys need 2-10 uppercase letters or numbers and must start with a letter.");
  }
  if (!validGitRefName(targetBranch)) fail("The target Git branch name is invalid.");
  if (existsSync(paths.config)) fail("This project workflow is already initialized.");
  if (existsSync(paths.project) && readdirSync(paths.project).length > 0) {
    fail(".project already exists and is not empty. Inspect it before initialization.");
  }
  for (const space of [paths.knowledge, paths.work]) {
    if (existsSync(space) && readdirSync(space).length > 0) {
      fail(`${space} already exists and is not empty. Inspect it before initialization.`);
    }
  }

  mkdirSync(join(paths.project, "bin"), { recursive: true });
  mkdirSync(paths.knowledge, { recursive: true });
  mkdirSync(paths.sources, { recursive: true });
  mkdirSync(paths.items, { recursive: true });
  mkdirSync(paths.candidates, { recursive: true });

  const config = {
    schemaVersion: 1,
    projectKey,
    projectName,
    createdAt: now(),
    spaces: { knowledge: "docs/knowledge", work: "docs/work" },
    git: { ...DEFAULT_GIT_CONFIG, targetBranch },
    checkTimeoutMs: 120000,
    statuses: STATUSES,
    definitionOfDone: [
      "Acceptance criteria have passing evidence.",
      "Configured checks pass in their latest run.",
      OFFICIAL_SOURCE_DONE,
      "Standards and Spec report zero P0, P1, and P2 findings with separate evidence.",
      "Blockers and child items are done.",
      "Required knowledge is drafted and valid.",
    ],
  };
  writeJson(paths.config, config);
  ensureWorktreeLayout(paths, config);
  copyFileSync(SCRIPT_PATH, paths.cli);
  chmodSync(paths.cli, 0o755);
  writeText(paths.knowledgeLog, `# Knowledge Update Log\n\n## ${today()}\n* **Initialization**: Created the knowledge bundle.\n`);
  syncGeneratedFiles(paths, config, []);
  console.log(`Initialized ${projectName} at ${paths.project}`);
}

function commandInstall(args) {
  const requestedRoot = option(args, "root") ?? process.cwd();
  const root = existsSync(join(resolve(requestedRoot), ".project", "workflow.json"))
    ? resolve(requestedRoot)
    : findProjectRoot(requestedRoot);
  const paths = pathsFor(root);
  const config = loadConfig(paths);
  let changed = false;
  if (!Array.isArray(config.definitionOfDone)) {
    fail("workflow.json must contain a definitionOfDone array.");
  }
  if (!config.definitionOfDone.includes(OFFICIAL_SOURCE_DONE)) {
    const reviewGate = config.definitionOfDone.findIndex((entry) =>
      typeof entry === "string" && entry.startsWith("Standards and Spec"),
    );
    const insertion = reviewGate < 0 ? config.definitionOfDone.length : reviewGate;
    config.definitionOfDone.splice(insertion, 0, OFFICIAL_SOURCE_DONE);
    changed = true;
  }
  if (config.git === undefined) {
    config.git = { ...DEFAULT_GIT_CONFIG };
    changed = true;
  }
  validateGitConfig(config.git);
  if (changed) writeJson(paths.config, config);
  mkdirSync(paths.sources, { recursive: true });
  ensureWorktreeLayout(paths, config);
  if (resolve(SCRIPT_PATH) === resolve(paths.cli)) {
    console.log("The project CLI is already running from its installed path.");
    return;
  }
  mkdirSync(dirname(paths.cli), { recursive: true });
  copyFileSync(SCRIPT_PATH, paths.cli);
  chmodSync(paths.cli, 0o755);
  console.log(`Installed workflow CLI at ${paths.cli}`);
}

function commandCreate(args, paths, config) {
  const items = loadItems(paths);
  const byKey = itemMap(items);
  const type = option(args, "type", true).toLowerCase();
  const summary = option(args, "summary", true).trim();
  const description = option(args, "description") ?? "";
  const priority = (option(args, "priority") ?? "medium").toLowerCase();
  const parentValue = option(args, "parent");
  const parent = parentValue ? normalizeKey(parentValue) : null;
  const knowledgePolicy = (option(args, "knowledge") ?? (["epic", "story"].includes(type) ? "required" : "none")).toLowerCase();

  if (!ITEM_TYPES.includes(type)) fail(`Type must be one of: ${ITEM_TYPES.join(", ")}.`);
  if (!PRIORITIES.includes(priority)) fail(`Priority must be one of: ${PRIORITIES.join(", ")}.`);
  if (!["required", "none"].includes(knowledgePolicy)) fail("Knowledge must be required or none.");
  if (type === "epic" && parent) fail("An epic cannot have a parent.");
  if (type === "subtask" && !parent) fail("A subtask needs --parent.");
  if (parent && !byKey.has(parent)) fail(`Parent ${parent} does not exist.`);
  if (type === "subtask" && parent && !STANDARD_TYPES.includes(byKey.get(parent).type)) {
    fail("A subtask parent must be a story, bug, or task.");
  }
  if (STANDARD_TYPES.includes(type) && parent && byKey.get(parent).type !== "epic") {
    fail("A story, bug, or task can only have an epic parent.");
  }

  const createdAt = now();
  const key = nextKey(config, items);
  const acceptanceCriteria = options(args, "accept").map((text, index) => ({
    id: `AC-${index + 1}`,
    text,
    status: "pending",
    evidence: null,
    verifiedAt: null,
  }));
  const checks = options(args, "check").map(parseCheck).map((check, index) => ({
    id: `CHK-${index + 1}`,
    ...check,
    status: "pending",
    lastRun: null,
  }));
  const blockedBy = options(args, "blocked-by").map(normalizeKey);
  for (const blocker of blockedBy) {
    if (!byKey.has(blocker)) fail(`Blocker ${blocker} does not exist.`);
  }

  const item = {
    schemaVersion: 1,
    key,
    type,
    summary,
    description,
    status: "backlog",
    resolution: null,
    priority,
    parent,
    acceptanceCriteria,
    checks,
    review: {
      status: "pending",
      reviewer: null,
      fixedPoint: null,
      standards: null,
      spec: null,
      reviewedAt: null,
    },
    knowledgePolicy,
    knowledgeChanges: [],
    promotions: [],
    links: { blockedBy, relatesTo: [] },
    createdAt,
    updatedAt: createdAt,
    completedAt: null,
  };
  writeJson(itemPath(paths, key), item);
  syncGeneratedFiles(paths, config, [...items, item]);
  console.log(`Created ${key}: ${summary}`);
}

function commandEdit(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const item = loadItem(paths, key);
  if (item.status === "done") fail("Done work items are immutable.");
  let changed = false;

  for (const field of ["summary", "description", "priority"]) {
    const value = option(args, field);
    if (value === undefined) continue;
    if (field === "priority" && !PRIORITIES.includes(value.toLowerCase())) {
      fail(`Priority must be one of: ${PRIORITIES.join(", ")}.`);
    }
    item[field] = field === "priority" ? value.toLowerCase() : value;
    changed = true;
  }

  const knowledge = option(args, "knowledge");
  if (knowledge !== undefined) {
    if (!["required", "none"].includes(knowledge)) fail("Knowledge must be required or none.");
    item.knowledgePolicy = knowledge;
    changed = true;
  }
  if (!changed) fail("No editable option was provided.");
  resetReview(item);
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  console.log(`Updated ${key}.`);
}

function commandAddAcceptance(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const item = loadItem(paths, key);
  if (item.status === "done") fail("Done work items are immutable.");
  const text = option(args, "text", true).trim();
  const sequence = item.acceptanceCriteria.reduce((highest, criterion) => {
    const number = Number(String(criterion.id).replace("AC-", ""));
    return Number.isSafeInteger(number) ? Math.max(highest, number) : highest;
  }, 0);
  item.acceptanceCriteria.push({
    id: `AC-${sequence + 1}`,
    text,
    status: "pending",
    evidence: null,
    verifiedAt: null,
  });
  resetReview(item);
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  console.log(`Added AC-${sequence + 1} to ${key}.`);
}

function commandAddCheck(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const item = loadItem(paths, key);
  if (item.status === "done") fail("Done work items are immutable.");
  const name = option(args, "name", true).trim();
  const command = option(args, "command", true).trim();
  const sequence = item.checks.reduce((highest, check) => {
    const number = Number(String(check.id).replace("CHK-", ""));
    return Number.isSafeInteger(number) ? Math.max(highest, number) : highest;
  }, 0);
  item.checks.push({ id: `CHK-${sequence + 1}`, name, command, status: "pending", lastRun: null });
  resetReview(item);
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  console.log(`Added CHK-${sequence + 1} to ${key}.`);
}

function commandLink(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const targetKey = normalizeKey(option(args, "target", true));
  const relation = option(args, "type", true).toLowerCase();
  const items = loadItems(paths);
  const byKey = itemMap(items);
  const item = byKey.get(key);
  if (!item) fail(`Work item ${key} does not exist.`);
  if (item.status === "done") fail("Done work items are immutable.");
  if (!byKey.has(targetKey)) fail(`Target ${targetKey} does not exist.`);
  if (key === targetKey) fail("An item cannot link to itself.");
  if (!["blocked-by", "relates-to"].includes(relation)) fail("Link type must be blocked-by or relates-to.");
  const field = relation === "blocked-by" ? "blockedBy" : "relatesTo";
  if (!item.links[field].includes(targetKey)) item.links[field].push(targetKey);
  const hierarchyErrors = validateHierarchy(items);
  if (hierarchyErrors.length) fail(hierarchyErrors.join("\n"));
  resetReview(item);
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  console.log(`Linked ${key} ${relation} ${targetKey}.`);
}

function commandTransition(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const target = requiredPositional(args, 2, "target status").toLowerCase();
  const item = loadItem(paths, key);
  const items = loadItems(paths);

  if (target === "done") fail("Use complete to enter done.");
  if (!STATUSES.includes(target)) fail(`Status must be one of: ${STATUSES.join(", ")}.`);
  if (!TRANSITIONS[item.status].includes(target)) {
    fail(`Transition ${item.status} -> ${target} is not allowed.`);
  }
  if (target === "ready") assertReady(item);
  if (target === "in-progress") {
    const byKey = itemMap(items);
    const openBlockers = item.links.blockedBy.filter((blocker) => byKey.get(blocker)?.status !== "done");
    if (openBlockers.length) fail(`Open blockers: ${openBlockers.join(", ")}.`);
    if (item.status === "in-review") resetReview(item);
  }
  if (target === "in-review" && !hasPassingReview(item)) {
    fail("Record passing Standards and Spec reviews before moving to in-review.");
  }
  item.status = target;
  item.resolution = null;
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  console.log(`Moved ${key} to ${target}.`);
}

function commandAccept(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const criterionId = requiredPositional(args, 2, "acceptance criterion ID").toUpperCase();
  const status = option(args, "status", true).toLowerCase();
  const evidence = option(args, "evidence");
  const item = loadItem(paths, key);
  if (item.status === "done") fail("Done work items are immutable.");
  if (!["pending", "pass", "fail"].includes(status)) fail("Acceptance status must be pending, pass, or fail.");
  if (status === "pass" && (!evidence || !evidence.trim())) fail("Passing acceptance needs --evidence.");
  const criterion = item.acceptanceCriteria.find((entry) => entry.id === criterionId);
  if (!criterion) fail(`${key} has no ${criterionId}.`);
  criterion.status = status;
  criterion.evidence = status === "pending" ? null : evidence ?? null;
  criterion.verifiedAt = status === "pending" ? null : now();
  resetReview(item);
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  console.log(`Marked ${key} ${criterionId} as ${status}.`);
}

function boundedOutput(stdout, stderr) {
  const combined = [stdout, stderr].filter(Boolean).join("\n").trim();
  if (!combined) return "No command output.";
  return combined.length > 4000 ? combined.slice(-4000) : combined;
}

function commandVerify(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const item = loadItem(paths, key);
  if (!["in-progress", "in-review"].includes(item.status)) {
    fail("Checks may run only while an item is in-progress or in-review.");
  }
  if (!item.checks.length) {
    console.log(`${key} has no configured checks.`);
    return true;
  }

  let passed = true;
  for (const check of item.checks) {
    console.log(`Running ${check.id} ${check.name}: ${check.command}`);
    const result = spawnSync(check.command, {
      cwd: paths.root,
      shell: true,
      encoding: "utf8",
      timeout: config.checkTimeoutMs,
      maxBuffer: 2 * 1024 * 1024,
      env: process.env,
    });
    const exitCode = typeof result.status === "number" ? result.status : 1;
    const output = boundedOutput(result.stdout, result.stderr || result.error?.message);
    check.status = exitCode === 0 ? "pass" : "fail";
    check.lastRun = { at: now(), exitCode, output };
    if (exitCode !== 0) passed = false;
    console.log(`${check.id}: ${check.status}`);
  }
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  return passed;
}

function commandReview(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const status = option(args, "status", true).toLowerCase();
  const reviewer = option(args, "reviewer");
  const fixedPoint = option(args, "base");
  const standards = option(args, "standards");
  const spec = option(args, "spec");
  const item = loadItem(paths, key);

  if (!["in-progress", "in-review"].includes(item.status)) {
    fail("Code review may run only while an item is in-progress or in-review.");
  }
  if (!["pending", "pass", "changes-requested"].includes(status)) {
    fail("Review status must be pending, pass, or changes-requested.");
  }
  if (
    status !== "pending" &&
    (!reviewer?.trim() || !fixedPoint?.trim() || !standards?.trim() || !spec?.trim())
  ) {
    fail("A completed review needs --reviewer, --base, --standards, and --spec.");
  }

  if (status === "pass") {
    const errors = [];
    for (const criterion of item.acceptanceCriteria) {
      if (criterion.status !== "pass" || !criterion.evidence?.trim()) {
        errors.push(`${criterion.id} needs passing evidence before review can pass.`);
      }
    }
    for (const check of item.checks) {
      if (check.status !== "pass" || check.lastRun?.exitCode !== 0) {
        errors.push(`${check.id} must pass through verify before review can pass.`);
      }
    }
    const items = loadItems(paths);
    for (const child of childrenOf(items, item.key)) {
      if (child.status !== "done") errors.push(`Child ${child.key} must be done before review can pass.`);
    }
    const byKey = itemMap(items);
    for (const blocker of item.links.blockedBy) {
      if (byKey.get(blocker)?.status !== "done") errors.push(`Blocker ${blocker} must be done before review can pass.`);
    }
    if (errors.length) fail(`Review gate failed:\n- ${errors.join("\n- ")}`);
  }

  item.review = {
    status,
    reviewer: status === "pending" ? null : reviewer,
    fixedPoint: status === "pending" ? null : fixedPoint,
    standards: status === "pending" ? null : standards,
    spec: status === "pending" ? null : spec,
    reviewedAt: status === "pending" ? null : now(),
  };
  if (status === "changes-requested" && item.status === "in-review") item.status = "in-progress";
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  console.log(`Recorded ${status} review for ${key}.`);
}

function commandSourceAdd(args, paths, config) {
  const target = safeKnowledgeTarget(option(args, "target", true));
  const targetPath = join(paths.sources, ...target.split("/"));
  const title = oneLine(option(args, "title", true));
  const publisher = oneLine(option(args, "publisher", true));
  const url = canonicalHttpsUrl(option(args, "url", true));
  const version = oneLine(option(args, "version") ?? "unversioned");
  const scope = oneLine(option(args, "scope", true));
  const actor = oneLine(option(args, "actor") ?? "agent/source");
  const claims = options(args, "claim").map(oneLine).filter(Boolean);
  const tags = [...new Set(["official-source", ...options(args, "tag").map(oneLine).filter(Boolean)])];

  if (!title || !publisher || !version || !scope || !actor) {
    fail("Source title, publisher, version, scope, and actor cannot be empty.");
  }
  if (claims.length === 0) fail("Add at least one verified claim with --claim.");
  if (existsSync(targetPath) && !hasOption(args, "force")) {
    fail(`Source note ${relative(paths.root, targetPath)} already exists. Re-open the page, then use --force.`);
  }

  const timestamp = now();
  const data = {
    type: "OfficialSource",
    title,
    description: scope,
    tags,
    sources: [
      {
        resource: url,
        title,
        publisher,
        version,
        retrievedAt: timestamp,
      },
    ],
    status: "stable",
    generated: { by: actor, at: timestamp },
    verified: [{ by: actor, at: timestamp }],
  };
  const body = [
    "# Applicability",
    "",
    scope,
    "",
    "# Verified claims",
    "",
    ...claims.map((claim) => `- ${claim}`),
    "",
    "# Refresh rule",
    "",
    "Open the canonical URL before relying on these claims in a new work session.",
  ].join("\n");

  writeText(targetPath, renderJsonConcept(data, body));
  syncGeneratedFiles(paths, config);
  console.log(relative(paths.root, targetPath).split(sep).join("/"));
}

function commandKnowledgeTemplate(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const item = loadItem(paths, key);
  if (item.status === "done") fail("Done work items are immutable.");
  const target = safeKnowledgeTarget(option(args, "target", true));
  const action = option(args, "action", true).toLowerCase();
  const actor = option(args, "actor") ?? "agent/project-flow";
  const targetPath = join(paths.knowledge, ...target.split("/"));
  const candidatePath = join(paths.candidates, key, ...target.split("/"));

  if (!["create", "update"].includes(action)) fail("Action must be create or update.");
  if (action === "create" && existsSync(targetPath)) fail(`Create target ${target} already exists.`);
  if (action === "update" && !existsSync(targetPath)) fail(`Update target ${target} does not exist.`);
  if (existsSync(candidatePath) && !hasOption(args, "force")) {
    fail(`Candidate ${relative(paths.root, candidatePath)} already exists. Use --force to replace it.`);
  }

  let data;
  let body;
  if (action === "update") {
    const parsed = parseFrontmatter(readText(targetPath), true);
    data = { ...parsed.data };
    body = parsed.body;
  } else {
    data = {
      type: option(args, "type", true).trim(),
      title: option(args, "title", true).trim(),
      description: option(args, "description", true).trim(),
      tags: options(args, "tag"),
    };
    body = "# Current state\n\nReplace this text with facts verified by the completed work item.\n";
  }

  if (option(args, "type") !== undefined) data.type = option(args, "type").trim();
  if (option(args, "title") !== undefined) data.title = option(args, "title").trim();
  if (option(args, "description") !== undefined) data.description = option(args, "description").trim();
  if (hasOption(args, "tag")) data.tags = options(args, "tag");
  if (typeof data.type !== "string" || !data.type.trim()) fail("Knowledge type cannot be empty.");

  const sources = Array.isArray(data.sources) ? [...data.sources] : [];
  const ticketResource = `urn:project-work:${key}`;
  if (!sources.some((source) => source && source.resource === ticketResource)) {
    sources.push({ resource: ticketResource, title: `${key} ${item.summary}` });
  }
  data.sources = sources;
  data.status = "draft";
  data.generated = { by: actor, at: now() };
  delete data.verified;

  writeText(candidatePath, renderJsonConcept(data, body));
  const candidate = relative(paths.root, candidatePath).split(sep).join("/");
  const change = { target, action, candidate, stagedAt: now() };
  const existingIndex = item.knowledgeChanges.findIndex((entry) => entry.target === target);
  if (existingIndex >= 0) item.knowledgeChanges[existingIndex] = change;
  else item.knowledgeChanges.push(change);
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  console.log(candidate);
}

function promotedConcept(content, timestamp) {
  const { data, body } = parseFrontmatter(content, true);
  const verified = Array.isArray(data.verified) ? [...data.verified] : data.verified ? [data.verified] : [];
  verified.push({ by: "process:project-flow", at: timestamp });
  data.status = "stable";
  data.verified = verified;
  return renderJsonConcept(data, body);
}

function commandComplete(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const items = loadItems(paths);
  const item = items.find((entry) => entry.key === key);
  if (!item) fail(`Work item ${key} does not exist.`);
  const errors = greenGateErrors(paths, item, items);
  if (errors.length) fail(`Completion gate failed:\n- ${errors.join("\n- ")}`);

  const completedAt = now();
  const promotions = item.knowledgeChanges.map((change) => {
    const candidatePath = resolve(paths.root, change.candidate);
    const targetPath = join(paths.knowledge, ...change.target.split("/"));
    const content = promotedConcept(readText(candidatePath), completedAt);
    const metadata = conceptMetadata(content);
    return {
      target: change.target,
      action: change.action,
      candidatePath,
      targetPath,
      content,
      title: metadata.title,
      sha256: createHash("sha256").update(content).digest("hex"),
      promotedAt: completedAt,
    };
  });

  for (const promotion of promotions) writeText(promotion.targetPath, promotion.content);
  for (const promotion of promotions) unlinkSync(promotion.candidatePath);

  item.status = "done";
  item.resolution = item.type === "bug" ? "fixed" : "done";
  item.completedAt = completedAt;
  item.promotions.push(
    ...promotions.map(({ target, action, sha256, promotedAt }) => ({ target, action, sha256, promotedAt })),
  );
  item.knowledgeChanges = [];
  saveItem(paths, item);
  if (promotions.length) appendKnowledgeLog(paths, item, promotions);
  syncGeneratedFiles(paths, config);
  console.log(`Completed ${key} with resolution ${item.resolution}.`);
  for (const promotion of promotions) console.log(`Promoted ${promotion.target}`);
}

function commandWorktreeAdd(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const item = loadItem(paths, key);
  const items = loadItems(paths);
  const settings = gitConfig(config);
  const target = option(args, "base") ?? settings.targetBranch;

  requireGitRepositoryRoot(paths.root);
  if (currentGitBranch(paths.root) !== target) {
    fail(`Create ticket worktrees from the checked-out target branch ${target}.`);
  }
  assertCleanGitWorktree(paths.root, `Target branch ${target}`);
  if (item.type === "epic") fail("Epics coordinate work and do not receive implementation worktrees.");
  if (item.status !== "ready") fail(`${key} must be ready before creating its worktree.`);

  const byKey = itemMap(items);
  const openBlockers = item.links.blockedBy.filter((blocker) => byKey.get(blocker)?.status !== "done");
  if (openBlockers.length) {
    fail(`Cannot implement ${key}. Open blockers: ${openBlockers.join(", ")}.`);
  }

  const targetRef = runGit(paths.root, ["rev-parse", "--verify", `${target}^{commit}`], true);
  if (targetRef.status !== 0) fail(`Target branch ${target} does not resolve to a commit.`);

  const branch = conventionalBranchName(item, option(args, "branch-type"));
  const existingBranch = runGit(paths.root, ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`], true);
  if (existingBranch.status === 0) fail(`Branch ${branch} already exists.`);
  runGit(paths.root, ["check-ref-format", "--branch", branch]);

  ensureWorktreeLayout(paths, config);
  const worktreePath = join(paths.root, settings.worktreeDirectory, key.toLowerCase());
  if (existsSync(worktreePath)) fail(`Worktree path already exists: ${worktreePath}`);

  runGit(paths.root, ["worktree", "add", "-b", branch, worktreePath, target]);
  console.log(`Created ${key} worktree.`);
  console.log(`Branch: ${branch}`);
  console.log(`Path: ${worktreePath}`);
}

function commandWorktreeList(paths) {
  requireGitRepositoryRoot(paths.root);
  process.stdout.write(runGit(paths.root, ["worktree", "list", "--porcelain"]).stdout);
}

function commandWorktreeFinish(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const settings = gitConfig(config);
  const target = option(args, "target") ?? settings.targetBranch;

  requireGitRepositoryRoot(paths.root);
  if (currentGitBranch(paths.root) !== target) {
    fail(`Finish ticket worktrees from the checked-out target branch ${target}.`);
  }
  assertCleanGitWorktree(paths.root, `Target branch ${target}`);

  const worktreePath = join(paths.root, settings.worktreeDirectory, key.toLowerCase());
  if (!existsSync(worktreePath)) fail(`No ticket worktree exists at ${worktreePath}.`);
  const worktreeRoot = runGit(worktreePath, ["rev-parse", "--show-toplevel"]).stdout.trim();
  if (realpathSync(worktreeRoot) !== realpathSync(worktreePath)) {
    fail(`${worktreePath} is not the expected Git worktree root.`);
  }
  assertCleanGitWorktree(worktreePath, `${key} worktree`);

  const branch = currentGitBranch(worktreePath);
  if (!isConventionalTicketBranch(branch, key)) {
    fail(`Branch ${branch} does not follow Conventional Branch for ${key}.`);
  }

  const worktreePaths = pathsFor(worktreePath);
  const worktreeConfig = loadConfig(worktreePaths);
  if (worktreeConfig.projectKey !== config.projectKey) fail("The ticket worktree belongs to another workflow.");
  const item = loadItem(worktreePaths, key);
  if (item.status !== "done" || !item.resolution) {
    fail(`${key} must pass complete before merge and cleanup.`);
  }
  const validationErrors = validateWorkspace(worktreePaths, worktreeConfig, loadItems(worktreePaths));
  if (validationErrors.length) fail(`Ticket worktree validation failed:\n- ${validationErrors.join("\n- ")}`);

  const targetCommit = runGit(paths.root, ["rev-parse", "--verify", `${target}^{commit}`]).stdout.trim();
  const branchCommit = runGit(paths.root, ["rev-parse", "--verify", `${branch}^{commit}`]).stdout.trim();
  const containsTarget = runGit(paths.root, ["merge-base", "--is-ancestor", targetCommit, branchCommit], true);
  if (containsTarget.status !== 0) {
    fail(`Branch ${branch} does not contain the latest ${target}. Sync it, then rerun checks and review.`);
  }

  if (!/^[0-9a-f]{40,64}$/i.test(item.review.fixedPoint ?? "")) {
    fail(`${key} review.fixedPoint must be a resolved commit hash.`);
  }
  if (item.review.fixedPoint.toLowerCase() !== targetCommit.toLowerCase()) {
    fail(`${key} must be reviewed against current ${target} commit ${targetCommit}.`);
  }

  const commitCount = Number(
    runGit(paths.root, ["rev-list", "--count", `${targetCommit}..${branchCommit}`]).stdout.trim(),
  );
  if (!Number.isSafeInteger(commitCount) || commitCount < 1) {
    fail(`${branch} has no ticket commits to merge.`);
  }
  const subjects = runGit(paths.root, ["log", "--format=%s", `${targetCommit}..${branchCommit}`])
    .stdout.split("\n")
    .map((subject) => subject.trim())
    .filter(Boolean);
  const invalidSubjects = subjects.filter((subject) => !CONVENTIONAL_COMMIT_SUBJECT.test(subject));
  if (invalidSubjects.length) {
    fail(`Non-conventional commit subjects:\n- ${invalidSubjects.join("\n- ")}`);
  }

  const defaultDescription = oneLine(item.summary);
  const normalizedDescription = `${defaultDescription.charAt(0).toLowerCase()}${defaultDescription.slice(1)}`;
  const mergeMessage = oneLine(
    option(args, "message") ?? `${commitTypeForBranch(branch)}(${key.toLowerCase()}): ${normalizedDescription}`,
  );
  if (!CONVENTIONAL_COMMIT_SUBJECT.test(mergeMessage)) {
    fail("The merge message must follow Conventional Commits 1.0.0.");
  }

  runGit(paths.root, ["merge", "--no-ff", "--no-edit", "-m", mergeMessage, branch]);
  runGit(paths.root, ["worktree", "remove", worktreePath]);
  runGit(paths.root, ["branch", "--delete", branch]);
  console.log(`Merged ${key} into ${target}.`);
  console.log(`Removed worktree ${worktreePath}.`);
  console.log(`Deleted local branch ${branch}.`);
}

function commandShow(args, paths) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  console.log(JSON.stringify(loadItem(paths, key), null, 2));
}

function commandStatus(paths, config) {
  console.log(boardContent(paths, config, loadItems(paths)).trimEnd());
}

function commandSync(paths, config) {
  const items = loadItems(paths);
  const hierarchyErrors = validateHierarchy(items);
  if (hierarchyErrors.length) fail(hierarchyErrors.join("\n"));
  syncGeneratedFiles(paths, config, items);
  console.log("Synchronized work board and knowledge indexes.");
}

function commandValidate(paths, config) {
  const items = loadItems(paths);
  const errors = validateWorkspace(paths, config, items);
  if (errors.length) fail(`Workspace validation failed:\n- ${errors.join("\n- ")}`);
  console.log(`Workspace is valid: ${items.length} work item(s).`);
}

function printHelp() {
  console.log(`Project Flow CLI

Usage:
  project-flow.mjs init --root PATH --key KEY --name NAME [--target-branch main]
  project-flow.mjs install [--root PATH]
  project-flow.mjs create --type TYPE --summary TEXT [options]
  project-flow.mjs edit KEY [--summary TEXT] [--description TEXT]
  project-flow.mjs add-acceptance KEY --text TEXT
  project-flow.mjs add-check KEY --name NAME --command COMMAND
  project-flow.mjs link KEY --type blocked-by|relates-to --target KEY
  project-flow.mjs transition KEY STATUS
  project-flow.mjs accept KEY AC-N --status pending|pass|fail [--evidence TEXT]
  project-flow.mjs verify KEY
  project-flow.mjs review KEY --status STATUS --reviewer ACTOR [review evidence]
  project-flow.mjs source-add --target PATH --title TEXT --publisher TEXT [options]
  project-flow.mjs knowledge-template KEY --target PATH --action create|update [options]
  project-flow.mjs complete KEY
  project-flow.mjs worktree-add KEY [--branch-type TYPE] [--base BRANCH]
  project-flow.mjs worktree-list
  project-flow.mjs worktree-finish KEY [--target BRANCH] [--message TEXT]
  project-flow.mjs show KEY
  project-flow.mjs status
  project-flow.mjs sync
  project-flow.mjs validate

Create options:
  --parent KEY
  --description TEXT
  --priority highest|high|medium|low|lowest
  --accept TEXT                 Repeat for more criteria.
  --check "Name::command"       Repeat for more checks.
  --blocked-by KEY             Repeat for more blockers.
  --knowledge required|none

Review evidence:
  --base REF                    Fixed point or "initial tree".
  --standards TEXT              Independent Standards result.
  --spec TEXT                   Independent Spec result.

Official source options:
  --url HTTPS_URL              Canonical official documentation page.
  --version TEXT               Exact dependency or documentation version.
  --scope TEXT                 Where this page applies in the project.
  --claim TEXT                 Repeat for each verified claim.
  --tag TEXT                   Repeat for discovery tags.
  --actor ACTOR
  --force                      Replace a note after live re-verification.

Knowledge template options:
  --type TEXT --title TEXT --description TEXT
  --tag TEXT                   Repeat for more tags.
  --actor ACTOR
  --force

Git workflow:
  Ticket branches use <type>/<ticket-key>-<description>.
  Branch types: feature, feat, bugfix, fix, hotfix, chore.
  Commits use <type>[optional scope]: <description>.
  The default target is main. Green merges use --no-ff.
  worktree-finish removes only a clean, merged worktree and local branch.

Use --root PATH with any project command when running outside the project.`);
}

function main() {
  const args = parseArguments(process.argv.slice(2));
  const command = args.positionals[0] ?? "help";
  if (["help", "--help", "-h"].includes(command)) {
    printHelp();
    return true;
  }
  if (command === "init") {
    commandInit(args);
    return true;
  }
  if (command === "install") {
    commandInstall(args);
    return true;
  }

  const rootOption = option(args, "root");
  const root = findProjectRoot(rootOption ? resolve(rootOption) : process.cwd());
  const paths = pathsFor(root);
  const config = loadConfig(paths);

  switch (command) {
    case "create":
      commandCreate(args, paths, config);
      return true;
    case "edit":
      commandEdit(args, paths, config);
      return true;
    case "add-acceptance":
      commandAddAcceptance(args, paths, config);
      return true;
    case "add-check":
      commandAddCheck(args, paths, config);
      return true;
    case "link":
      commandLink(args, paths, config);
      return true;
    case "transition":
      commandTransition(args, paths, config);
      return true;
    case "accept":
      commandAccept(args, paths, config);
      return true;
    case "verify":
      return commandVerify(args, paths, config);
    case "review":
      commandReview(args, paths, config);
      return true;
    case "source-add":
      commandSourceAdd(args, paths, config);
      return true;
    case "knowledge-template":
      commandKnowledgeTemplate(args, paths, config);
      return true;
    case "complete":
      commandComplete(args, paths, config);
      return true;
    case "worktree-add":
      commandWorktreeAdd(args, paths, config);
      return true;
    case "worktree-list":
      commandWorktreeList(paths);
      return true;
    case "worktree-finish":
      commandWorktreeFinish(args, paths, config);
      return true;
    case "show":
      commandShow(args, paths);
      return true;
    case "status":
      commandStatus(paths, config);
      return true;
    case "sync":
      commandSync(paths, config);
      return true;
    case "validate":
      commandValidate(paths, config);
      return true;
    default:
      fail(`Unknown command: ${command}. Run help for usage.`);
  }
}

try {
  const success = main();
  if (!success) process.exitCode = 1;
} catch (error) {
  if (error instanceof WorkflowError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
