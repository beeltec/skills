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
const RISK_LEVELS = ["low", "elevated", "high"];
const RISK_FACTORS = [
  "sensitive-data",
  "authentication",
  "public-network",
  "financial",
  "destructive",
  "dependency",
  "migration",
  "user-interface",
  "availability",
  "performance",
];
const QUALITY_GATE_TYPES = [
  "security",
  "privacy",
  "dependency",
  "migration",
  "accessibility",
  "reliability",
  "performance",
  "compatibility",
];
const REQUIRED_GATES_BY_RISK = Object.freeze({
  "sensitive-data": ["security", "privacy"],
  authentication: ["security"],
  "public-network": ["security"],
  financial: ["security"],
  destructive: ["security"],
  dependency: ["dependency"],
  migration: ["migration"],
  "user-interface": ["accessibility"],
  availability: ["reliability"],
  performance: ["performance"],
});
const BRIEF_STATUSES = ["draft", "confirmed"];
const RELEASE_KINDS = ["deploy", "publish"];
const RELEASE_STATUSES = ["planned", "deploying", "green", "failed", "rolled-back"];
const RELEASE_RESULTS = ["green", "failed", "rolled-back"];
const OUTCOME_STATUSES = ["planned", "observed"];
const OUTCOME_RESULTS = ["met", "missed", "inconclusive"];
const OUTCOME_DECISIONS = ["proceed", "improve", "revert", "stop"];
const OFFICIAL_SOURCE_DONE = "Relevant external claims cite refreshed official source notes.";
const QUALITY_GATE_DONE = "Applicable risk-driven quality gates have passing evidence.";
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
    knowledgeReleases: join(knowledge, "releases"),
    knowledgeOutcomes: join(knowledge, "outcomes"),
    work,
    board: join(work, "board.md"),
    items: join(work, "items"),
    candidates: join(work, "drafts"),
    briefs: join(work, "briefs"),
    releases: join(work, "releases"),
    outcomes: join(work, "outcomes"),
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

function normalizeRecordId(value, prefix, label) {
  const id = String(value).toUpperCase();
  if (!new RegExp(`^${prefix}-[1-9][0-9]*$`).test(id)) fail(`Invalid ${label} ID: ${value}.`);
  return id;
}

function normalizeBriefId(value) {
  return normalizeRecordId(value, "BRIEF", "brief");
}

function normalizeReleaseId(value) {
  return normalizeRecordId(value, "REL", "release");
}

function normalizeOutcomeId(value) {
  return normalizeRecordId(value, "OUT", "outcome");
}

function itemPath(paths, key) {
  return join(paths.items, `${normalizeKey(key)}.json`);
}

function briefPath(paths, id) {
  return join(paths.briefs, `${normalizeBriefId(id)}.md`);
}

function releasePath(paths, id) {
  return join(paths.releases, `${normalizeReleaseId(id)}.json`);
}

function outcomePath(paths, id) {
  return join(paths.outcomes, `${normalizeOutcomeId(id)}.json`);
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
  if (item.brief !== undefined && item.brief !== null && typeof item.brief !== "string") {
    errors.push(`${path}: brief must be an ID or null.`);
  }
  if (item.resolution !== null && typeof item.resolution !== "string") {
    errors.push(`${path}: resolution must be a string or null.`);
  }
  if (!Array.isArray(item.acceptanceCriteria)) errors.push(`${path}: acceptanceCriteria must be an array.`);
  if (!Array.isArray(item.checks)) errors.push(`${path}: checks must be an array.`);
  if (item.risk !== undefined) {
    if (!item.risk || typeof item.risk !== "object" || Array.isArray(item.risk)) {
      errors.push(`${path}: risk must be an object.`);
    } else {
      if (!RISK_LEVELS.includes(item.risk.level)) errors.push(`${path}: risk.level is invalid.`);
      if (!Array.isArray(item.risk.factors)) errors.push(`${path}: risk.factors must be an array.`);
      else {
        for (const factor of item.risk.factors) {
          if (!RISK_FACTORS.includes(factor)) errors.push(`${path}: risk factor ${factor} is invalid.`);
        }
      }
    }
  }
  if (item.qualityGates !== undefined) {
    if (!Array.isArray(item.qualityGates)) errors.push(`${path}: qualityGates must be an array.`);
    else {
      for (const gate of item.qualityGates) {
        if (!gate || typeof gate !== "object" || Array.isArray(gate)) {
          errors.push(`${path}: a quality gate is invalid.`);
          continue;
        }
        if (!/^GATE-[1-9][0-9]*$/.test(gate.id ?? "")) errors.push(`${path}: quality gate ID is invalid.`);
        if (!QUALITY_GATE_TYPES.includes(gate.type)) errors.push(`${path}: quality gate type is invalid.`);
        if (!["pending", "pass", "fail"].includes(gate.status)) errors.push(`${path}: quality gate status is invalid.`);
        if (gate.evidence !== null && typeof gate.evidence !== "string") {
          errors.push(`${path}: quality gate evidence must be a string or null.`);
        }
        if (gate.verifiedAt !== null && typeof gate.verifiedAt !== "string") {
          errors.push(`${path}: quality gate verifiedAt must be a string or null.`);
        }
      }
    }
  }
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

function itemRisk(item) {
  return item.risk ?? { level: "low", factors: [] };
}

function itemQualityGates(item) {
  return item.qualityGates ?? [];
}

function requiredGateTypes(item) {
  return [
    ...new Set(itemRisk(item).factors.flatMap((factor) => REQUIRED_GATES_BY_RISK[factor] ?? [])),
  ];
}

function qualityGateErrors(item, requirePassing) {
  const errors = [];
  const gates = itemQualityGates(item);
  for (const type of requiredGateTypes(item)) {
    if (!gates.some((gate) => gate.type === type)) {
      errors.push(`${item.key}: risk profile requires a ${type} quality gate.`);
    }
  }
  if (requirePassing) {
    for (const gate of gates) {
      if (gate.status !== "pass" || typeof gate.evidence !== "string" || !gate.evidence.trim()) {
        errors.push(`${item.key}: ${gate.id} ${gate.type} needs passing evidence.`);
      }
    }
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

function requireTargetBranch(paths, config, operation) {
  requireGitRepositoryRoot(paths.root);
  const target = gitConfig(config).targetBranch;
  const branch = currentGitBranch(paths.root);
  if (branch !== target) fail(`${operation} must run on the configured target branch ${target}, not ${branch}.`);
  return target;
}

function assertTicketsInReleaseCommit(root, commit, ticketKeys) {
  const errors = [];
  for (const key of ticketKeys) {
    const target = `docs/work/items/${key}.json`;
    const result = runGit(root, ["show", `${commit}:${target}`], true);
    if (result.status !== 0) {
      errors.push(`${key} is absent from the release commit.`);
      continue;
    }

    let item;
    try {
      item = JSON.parse(result.stdout);
    } catch {
      errors.push(`${key} is not valid JSON in the release commit.`);
      continue;
    }
    if (item?.key !== key || item?.status !== "done" || !nonEmptyString(item?.resolution)) {
      errors.push(`${key} is not completed in the release commit.`);
    }
  }
  if (errors.length) fail(`Release commit does not contain every completed ticket:\n- ${errors.join("\n- ")}`);
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

function nextRecordId(directory, prefix, extension) {
  if (!existsSync(directory)) return `${prefix}-1`;
  const highest = readdirSync(directory).reduce((value, name) => {
    const match = name.match(new RegExp(`^${prefix}-([1-9][0-9]*)\\.${extension}$`));
    if (!match) return value;
    return Math.max(value, Number(match[1]));
  }, 0);
  return `${prefix}-${highest + 1}`;
}

function nonEmptyString(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function stringArrayErrors(value, label) {
  if (!Array.isArray(value)) return [`${label} must be an array.`];
  return value.flatMap((entry) =>
    nonEmptyString(entry) ? [] : [`${label} entries must be non-empty strings.`],
  );
}

function sourceNoteErrors(paths, sourceNotes, label) {
  const errors = stringArrayErrors(sourceNotes, label);
  if (!Array.isArray(sourceNotes)) return errors;
  for (const source of sourceNotes) {
    if (!nonEmptyString(source)) continue;
    const target = resolve(paths.root, source);
    if (!target.startsWith(`${resolve(paths.sources)}${sep}`) || !target.endsWith(".md")) {
      errors.push(`${label} must point under docs/knowledge/sources/: ${source}.`);
      continue;
    }
    if (!existsSync(target)) errors.push(`${label} does not exist: ${source}.`);
  }
  return errors;
}

function briefErrors(paths, brief) {
  const label = brief?.id ?? "Brief";
  const errors = [];
  if (!brief || typeof brief !== "object" || Array.isArray(brief)) return ["A brief must be an object."];
  if (brief.schemaVersion !== 1) errors.push(`${label}: schemaVersion must be 1.`);
  if (!/^BRIEF-[1-9][0-9]*$/.test(brief.id ?? "")) errors.push(`${label}: ID is invalid.`);
  if (!nonEmptyString(brief.title)) errors.push(`${label}: title is required.`);
  if (!BRIEF_STATUSES.includes(brief.status)) errors.push(`${label}: status is invalid.`);
  for (const field of ["problem", "outcome"]) {
    if (typeof brief[field] !== "string") errors.push(`${label}: ${field} must be a string.`);
  }
  for (const field of [
    "users",
    "evidence",
    "inScope",
    "outOfScope",
    "assumptions",
    "alternatives",
    "decisions",
    "constraints",
    "dependencies",
    "risks",
    "deliveryAcceptance",
  ]) {
    errors.push(...stringArrayErrors(brief[field], `${label}: ${field}`));
  }
  errors.push(...sourceNoteErrors(paths, brief.officialSources, `${label}: officialSources`));
  if (!brief.success || typeof brief.success !== "object" || Array.isArray(brief.success)) {
    errors.push(`${label}: success must be an object.`);
  } else {
    for (const field of ["metric", "baseline", "target", "observationWindow", "dataSource"]) {
      if (typeof brief.success[field] !== "string") errors.push(`${label}: success.${field} must be a string.`);
    }
  }
  for (const field of ["createdAt", "updatedAt"]) {
    if (!nonEmptyString(brief[field]) || Number.isNaN(Date.parse(brief[field]))) {
      errors.push(`${label}: ${field} must be an ISO date-time.`);
    }
  }
  for (const field of ["confirmedAt", "confirmedBy"]) {
    if (brief[field] !== null && !nonEmptyString(brief[field])) {
      errors.push(`${label}: ${field} must be a string or null.`);
    }
  }
  if (brief.status === "confirmed") {
    if (!nonEmptyString(brief.problem)) errors.push(`${label}: confirmed briefs need a problem.`);
    if (!nonEmptyString(brief.outcome)) errors.push(`${label}: confirmed briefs need an outcome.`);
    if (Array.isArray(brief.users) && brief.users.length === 0) {
      errors.push(`${label}: confirmed briefs need at least one user.`);
    }
    if (Array.isArray(brief.evidence) && brief.evidence.length === 0) {
      errors.push(`${label}: confirmed briefs need problem evidence.`);
    }
    if (Array.isArray(brief.deliveryAcceptance) && brief.deliveryAcceptance.length === 0) {
      errors.push(`${label}: confirmed briefs need at least one delivery acceptance signal.`);
    }
    if (brief.success && typeof brief.success === "object" && !Array.isArray(brief.success)) {
      for (const field of ["metric", "baseline", "target", "observationWindow", "dataSource"]) {
        if (!nonEmptyString(brief.success[field])) errors.push(`${label}: confirmed briefs need success.${field}.`);
      }
    }
    if (!brief.confirmedAt || !brief.confirmedBy) errors.push(`${label}: confirmation actor and time are required.`);
  } else if (brief.confirmedAt !== null || brief.confirmedBy !== null) {
    errors.push(`${label}: draft briefs cannot contain confirmation evidence.`);
  }
  return errors;
}

function loadBriefs(paths) {
  if (!existsSync(paths.briefs)) return [];
  return readdirSync(paths.briefs)
    .filter((name) => /^BRIEF-[1-9][0-9]*\.md$/.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
    .map((name) => {
      const path = join(paths.briefs, name);
      const { data, body } = parseFrontmatter(readText(path), true);
      const errors = briefErrors(paths, data);
      if (errors.length) fail(errors.join("\n"));
      return { ...data, body };
    });
}

function loadBrief(paths, id) {
  const path = briefPath(paths, id);
  if (!existsSync(path)) fail(`Brief ${normalizeBriefId(id)} does not exist.`);
  const { data, body } = parseFrontmatter(readText(path), true);
  const errors = briefErrors(paths, data);
  if (errors.length) fail(errors.join("\n"));
  return { ...data, body };
}

function saveBrief(paths, brief) {
  const { body = "# Planning context\n\nThis brief records the confirmed product intent.\n", ...data } = brief;
  data.updatedAt = now();
  writeText(briefPath(paths, data.id), renderJsonConcept(data, body));
}

function releaseErrors(paths, release, items) {
  const label = release?.id ?? "Release";
  const errors = [];
  if (!release || typeof release !== "object" || Array.isArray(release)) return ["A release must be an object."];
  if (release.schemaVersion !== 1) errors.push(`${label}: schemaVersion must be 1.`);
  if (!/^REL-[1-9][0-9]*$/.test(release.id ?? "")) errors.push(`${label}: ID is invalid.`);
  if (!nonEmptyString(release.title)) errors.push(`${label}: title is required.`);
  if (!RELEASE_KINDS.includes(release.kind)) errors.push(`${label}: kind is invalid.`);
  if (!RELEASE_STATUSES.includes(release.status)) errors.push(`${label}: status is invalid.`);
  errors.push(...stringArrayErrors(release.tickets, `${label}: tickets`));
  const byKey = itemMap(items);
  if (Array.isArray(release.tickets)) {
    if (release.tickets.length === 0) errors.push(`${label}: at least one ticket is required.`);
    if (new Set(release.tickets).size !== release.tickets.length) {
      errors.push(`${label}: tickets must be unique.`);
    }
    for (const key of release.tickets) {
      if (!byKey.has(key)) errors.push(`${label}: ticket ${key} does not exist.`);
    }
  }
  if (release.version !== null && !nonEmptyString(release.version)) {
    errors.push(`${label}: version must be a string or null.`);
  }
  if (!release.target || typeof release.target !== "object" || Array.isArray(release.target)) {
    errors.push(`${label}: target must be an object.`);
  } else {
    for (const field of ["provider", "environment", "destination"]) {
      if (!nonEmptyString(release.target[field])) errors.push(`${label}: target.${field} is required.`);
    }
  }
  errors.push(...sourceNoteErrors(paths, release.officialSources, `${label}: officialSources`));
  for (const field of ["migrationPlan", "rolloutPlan", "recoveryPlan"]) {
    if (!nonEmptyString(release[field])) errors.push(`${label}: ${field} is required.`);
  }
  errors.push(...stringArrayErrors(release.requiredApprovals, `${label}: requiredApprovals`));
  errors.push(...stringArrayErrors(release.approvals, `${label}: approvals`));
  if (!Array.isArray(release.checks)) errors.push(`${label}: checks must be an array.`);
  else {
    for (const check of release.checks) {
      if (!check || typeof check !== "object" || Array.isArray(check)) {
        errors.push(`${label}: a release check is invalid.`);
        continue;
      }
      if (!/^RELCHK-[1-9][0-9]*$/.test(check.id ?? "")) errors.push(`${label}: release check ID is invalid.`);
      if (!["pre", "post"].includes(check.phase)) errors.push(`${label}: release check phase is invalid.`);
      if (!nonEmptyString(check.name)) errors.push(`${label}: release check name is required.`);
      if (!["pass", "fail"].includes(check.status)) errors.push(`${label}: release check status is invalid.`);
      if (!nonEmptyString(check.evidence)) errors.push(`${label}: release check evidence is required.`);
      if (!nonEmptyString(check.recordedAt) || Number.isNaN(Date.parse(check.recordedAt))) {
        errors.push(`${label}: release check time is invalid.`);
      }
    }
  }
  errors.push(...stringArrayErrors(release.resultEvidence, `${label}: resultEvidence`));
  for (const field of ["commit", "artifact", "digest", "startedAt", "startedBy", "finishedAt", "finishedBy"]) {
    if (release[field] !== null && !nonEmptyString(release[field])) {
      errors.push(`${label}: ${field} must be a string or null.`);
    }
  }
  for (const field of ["createdAt", "updatedAt"]) {
    if (!nonEmptyString(release[field]) || Number.isNaN(Date.parse(release[field]))) {
      errors.push(`${label}: ${field} must be an ISO date-time.`);
    }
  }
  if (release.status === "planned") {
    if ([release.commit, release.artifact, release.digest, release.startedAt, release.startedBy].some((value) => value !== null)) {
      errors.push(`${label}: planned releases cannot contain started release evidence.`);
    }
  } else {
    for (const field of ["commit", "artifact", "digest", "startedAt", "startedBy"]) {
      if (!nonEmptyString(release[field])) errors.push(`${label}: ${field} is required after release start.`);
    }
    if (Array.isArray(release.tickets)) {
      for (const key of release.tickets) {
        if (byKey.get(key)?.status !== "done") errors.push(`${label}: started release ticket ${key} must be done.`);
      }
    }
    if (Array.isArray(release.requiredApprovals) && Array.isArray(release.approvals)) {
      for (const approval of release.requiredApprovals) {
        if (!release.approvals.includes(approval)) errors.push(`${label}: required approval ${approval} is missing.`);
      }
    }
  }
  if (["green", "failed", "rolled-back"].includes(release.status)) {
    if (
      !release.finishedAt ||
      !release.finishedBy ||
      (Array.isArray(release.resultEvidence) && release.resultEvidence.length === 0)
    ) {
      errors.push(`${label}: terminal releases need actor, time, and result evidence.`);
    }
  } else if (
    release.finishedAt !== null ||
    release.finishedBy !== null ||
    (Array.isArray(release.resultEvidence) && release.resultEvidence.length > 0)
  ) {
    errors.push(`${label}: unfinished releases cannot contain final evidence.`);
  }
  if (release.status === "green") {
    if (Array.isArray(release.checks)) {
      const postChecks = release.checks.filter((check) => check.phase === "post");
      if (postChecks.length === 0 || postChecks.some((check) => check.status !== "pass")) {
        errors.push(`${label}: green releases need passing post-release checks.`);
      }
      if (release.checks.some((check) => check.status !== "pass")) {
        errors.push(`${label}: green releases cannot contain failed checks.`);
      }
    }
  }
  return errors;
}

function loadReleases(paths, items = loadItems(paths)) {
  if (!existsSync(paths.releases)) return [];
  return readdirSync(paths.releases)
    .filter((name) => /^REL-[1-9][0-9]*\.json$/.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
    .map((name) => {
      const path = join(paths.releases, name);
      const release = readJson(path, "release");
      const errors = releaseErrors(paths, release, items);
      if (errors.length) fail(errors.join("\n"));
      return release;
    });
}

function loadRelease(paths, id, items = loadItems(paths)) {
  const path = releasePath(paths, id);
  if (!existsSync(path)) fail(`Release ${normalizeReleaseId(id)} does not exist.`);
  const release = readJson(path, "release");
  const errors = releaseErrors(paths, release, items);
  if (errors.length) fail(errors.join("\n"));
  return release;
}

function saveRelease(paths, release) {
  release.updatedAt = now();
  writeJson(releasePath(paths, release.id), release);
}

function outcomeErrors(outcome, briefs, releases, items) {
  const label = outcome?.id ?? "Outcome";
  const errors = [];
  if (!outcome || typeof outcome !== "object" || Array.isArray(outcome)) return ["An outcome must be an object."];
  if (outcome.schemaVersion !== 1) errors.push(`${label}: schemaVersion must be 1.`);
  if (!/^OUT-[1-9][0-9]*$/.test(outcome.id ?? "")) errors.push(`${label}: ID is invalid.`);
  if (!OUTCOME_STATUSES.includes(outcome.status)) errors.push(`${label}: status is invalid.`);
  const brief = briefs.find((entry) => entry.id === outcome.brief);
  const release = releases.find((entry) => entry.id === outcome.release);
  if (!brief) errors.push(`${label}: brief ${outcome.brief} does not exist.`);
  else if (brief.status !== "confirmed") errors.push(`${label}: brief ${outcome.brief} must be confirmed.`);
  if (!release) {
    errors.push(`${label}: release ${outcome.release} does not exist.`);
  } else if (release.status !== "green") {
    errors.push(`${label}: release ${outcome.release} must be green.`);
  }
  if (!outcome.success || typeof outcome.success !== "object" || Array.isArray(outcome.success)) {
    errors.push(`${label}: success must be an object.`);
  } else {
    for (const field of ["metric", "baseline", "target", "observationWindow", "dataSource"]) {
      if (!nonEmptyString(outcome.success[field])) errors.push(`${label}: success.${field} is required.`);
      if (brief && outcome.success[field] !== brief.success[field]) {
        errors.push(`${label}: success.${field} must match ${brief.id}.`);
      }
    }
  }
  for (const field of ["observed", "result", "decision", "measuredAt", "measuredBy"]) {
    if (outcome[field] !== null && !nonEmptyString(outcome[field])) {
      errors.push(`${label}: ${field} must be a string or null.`);
    }
  }
  if (outcome.result !== null && !OUTCOME_RESULTS.includes(outcome.result)) errors.push(`${label}: result is invalid.`);
  if (outcome.decision !== null && !OUTCOME_DECISIONS.includes(outcome.decision)) {
    errors.push(`${label}: decision is invalid.`);
  }
  errors.push(...stringArrayErrors(outcome.evidence, `${label}: evidence`));
  errors.push(...stringArrayErrors(outcome.followUpTickets, `${label}: followUpTickets`));
  const byKey = itemMap(items);
  if (
    brief &&
    release &&
    !release.tickets.some((key) => byKey.get(key)?.brief === brief.id)
  ) {
    errors.push(`${label}: ${release.id} contains no ticket linked to ${brief.id}.`);
  }
  if (Array.isArray(outcome.followUpTickets)) {
    for (const key of outcome.followUpTickets) {
      if (!byKey.has(key)) errors.push(`${label}: follow-up ticket ${key} does not exist.`);
    }
  }
  for (const field of ["createdAt", "updatedAt"]) {
    if (!nonEmptyString(outcome[field]) || Number.isNaN(Date.parse(outcome[field]))) {
      errors.push(`${label}: ${field} must be an ISO date-time.`);
    }
  }
  if (outcome.status === "observed") {
    if (!outcome.observed || !outcome.result || !outcome.decision || !outcome.measuredAt || !outcome.measuredBy) {
      errors.push(`${label}: observed outcomes need value, result, decision, actor, and time.`);
    }
    if (Array.isArray(outcome.evidence) && outcome.evidence.length === 0) {
      errors.push(`${label}: observed outcomes need evidence.`);
    }
    if (
      ["improve", "revert"].includes(outcome.decision) &&
      Array.isArray(outcome.followUpTickets) &&
      outcome.followUpTickets.length === 0
    ) {
      errors.push(`${label}: ${outcome.decision} decisions need a follow-up ticket.`);
    }
  } else if (
    [outcome.observed, outcome.result, outcome.decision, outcome.measuredAt, outcome.measuredBy].some(
      (value) => value !== null,
    ) ||
    (Array.isArray(outcome.evidence) && outcome.evidence.length > 0) ||
    (Array.isArray(outcome.followUpTickets) && outcome.followUpTickets.length > 0)
  ) {
    errors.push(`${label}: planned outcomes cannot contain observation results.`);
  }
  return errors;
}

function loadOutcomes(paths, briefs = loadBriefs(paths), releases = loadReleases(paths), items = loadItems(paths)) {
  if (!existsSync(paths.outcomes)) return [];
  return readdirSync(paths.outcomes)
    .filter((name) => /^OUT-[1-9][0-9]*\.json$/.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
    .map((name) => {
      const path = join(paths.outcomes, name);
      const outcome = readJson(path, "outcome");
      const errors = outcomeErrors(outcome, briefs, releases, items);
      if (errors.length) fail(errors.join("\n"));
      return outcome;
    });
}

function loadOutcome(paths, id, items = loadItems(paths)) {
  const briefs = loadBriefs(paths);
  const releases = loadReleases(paths, items);
  const path = outcomePath(paths, id);
  if (!existsSync(path)) fail(`Outcome ${normalizeOutcomeId(id)} does not exist.`);
  const outcome = readJson(path, "outcome");
  const errors = outcomeErrors(outcome, briefs, releases, items);
  if (errors.length) fail(errors.join("\n"));
  return outcome;
}

function saveOutcome(paths, outcome) {
  outcome.updatedAt = now();
  writeJson(outcomePath(paths, outcome.id), outcome);
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
  errors.push(...qualityGateErrors(item, true));
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
  errors.push(...qualityGateErrors(item, true));
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

function briefIndexContent(briefs) {
  const lines = ["# Planning Briefs", ""];
  if (briefs.length === 0) return `${lines.join("\n")}No briefs yet.\n`;
  lines.push("| ID | Status | Title | Success metric |", "| --- | --- | --- | --- |");
  for (const brief of briefs) {
    lines.push(
      `| [${brief.id}](${brief.id}.md) | ${brief.status} | ${markdownLabel(brief.title)} | ${markdownLabel(brief.success.metric || "-")} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function releaseIndexContent(releases) {
  const lines = ["# Releases", ""];
  if (releases.length === 0) return `${lines.join("\n")}No releases yet.\n`;
  lines.push(
    "| ID | Status | Version | Target | Tickets |",
    "| --- | --- | --- | --- | --- |",
  );
  for (const release of releases) {
    const target = `${release.target.provider}:${release.target.environment}`;
    lines.push(
      `| [${release.id}](${release.id}.json) | ${release.status} | ${markdownLabel(release.version ?? "-")} | ${markdownLabel(target)} | ${release.tickets.join(", ")} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function outcomeIndexContent(outcomes) {
  const lines = ["# Product Outcomes", ""];
  if (outcomes.length === 0) return `${lines.join("\n")}No outcomes yet.\n`;
  lines.push(
    "| ID | Status | Brief | Release | Result | Decision |",
    "| --- | --- | --- | --- | --- | --- |",
  );
  for (const outcome of outcomes) {
    lines.push(
      `| [${outcome.id}](${outcome.id}.json) | ${outcome.status} | ${outcome.brief} | ${outcome.release} | ${outcome.result ?? "-"} | ${outcome.decision ?? "-"} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function generateWorkIndexes(paths, items) {
  const briefs = loadBriefs(paths);
  const releases = loadReleases(paths, items);
  const outcomes = loadOutcomes(paths, briefs, releases, items);
  writeText(join(paths.briefs, "index.md"), briefIndexContent(briefs));
  writeText(join(paths.releases, "index.md"), releaseIndexContent(releases));
  writeText(join(paths.outcomes, "index.md"), outcomeIndexContent(outcomes));
}

function syncGeneratedFiles(paths, config, items = loadItems(paths)) {
  for (const directory of [
    paths.sources,
    paths.knowledgeReleases,
    paths.knowledgeOutcomes,
    paths.briefs,
    paths.releases,
    paths.outcomes,
  ]) {
    mkdirSync(directory, { recursive: true });
  }
  generateKnowledgeIndexes(paths, config);
  writeText(paths.board, boardContent(paths, config, items));
  generateWorkIndexes(paths, items);
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

  const briefs = loadBriefs(paths);
  const releases = loadReleases(paths, items);
  const outcomes = loadOutcomes(paths, briefs, releases, items);
  const briefsById = new Map(briefs.map((brief) => [brief.id, brief]));

  for (const item of items) {
    if (item.brief && !briefsById.has(item.brief)) errors.push(`${item.key}: brief ${item.brief} does not exist.`);
    if (
      ["epic", "story"].includes(item.type) &&
      !["backlog", "done"].includes(item.status) &&
      (!item.brief || briefsById.get(item.brief)?.status !== "confirmed")
    ) {
      errors.push(`${item.key}: active ${item.type} needs a confirmed planning brief.`);
    }
    if (item.status !== "backlog") errors.push(...qualityGateErrors(item, item.status === "done"));
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
  const indexes = [
    [join(paths.briefs, "index.md"), briefIndexContent(briefs)],
    [join(paths.releases, "index.md"), releaseIndexContent(releases)],
    [join(paths.outcomes, "index.md"), outcomeIndexContent(outcomes)],
  ];
  for (const [path, expected] of indexes) {
    if (!existsSync(path) || readText(path) !== expected) {
      errors.push(`${path}: generated index is stale. Run sync.`);
    }
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

function assertReady(paths, item) {
  const errors = [];
  if (!item.description.trim()) errors.push(`${item.key}: description is required before ready.`);
  if (["epic", "story", "bug"].includes(item.type) && item.acceptanceCriteria.length === 0) {
    errors.push(`${item.key}: at least one acceptance criterion is required before ready.`);
  }
  if (["epic", "story"].includes(item.type)) {
    if (!item.brief) errors.push(`${item.key}: a confirmed planning brief is required before ready.`);
    else {
      try {
        const brief = loadBrief(paths, item.brief);
        if (brief.status !== "confirmed") errors.push(`${item.key}: brief ${brief.id} is not confirmed.`);
      } catch (error) {
        errors.push(`${item.key}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  const risk = itemRisk(item);
  if (["elevated", "high"].includes(risk.level) && risk.factors.length === 0) {
    errors.push(`${item.key}: ${risk.level} risk needs at least one named factor.`);
  }
  errors.push(...qualityGateErrors(item, false));
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
  mkdirSync(paths.knowledgeReleases, { recursive: true });
  mkdirSync(paths.knowledgeOutcomes, { recursive: true });
  mkdirSync(paths.items, { recursive: true });
  mkdirSync(paths.candidates, { recursive: true });
  mkdirSync(paths.briefs, { recursive: true });
  mkdirSync(paths.releases, { recursive: true });
  mkdirSync(paths.outcomes, { recursive: true });

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
      QUALITY_GATE_DONE,
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
  if (!config.definitionOfDone.includes(QUALITY_GATE_DONE)) {
    const sourceGate = config.definitionOfDone.indexOf(OFFICIAL_SOURCE_DONE);
    const insertion = sourceGate < 0 ? config.definitionOfDone.length : sourceGate;
    config.definitionOfDone.splice(insertion, 0, QUALITY_GATE_DONE);
    changed = true;
  }
  if (config.git === undefined) {
    config.git = { ...DEFAULT_GIT_CONFIG };
    changed = true;
  }
  validateGitConfig(config.git);
  if (changed) writeJson(paths.config, config);
  mkdirSync(paths.sources, { recursive: true });
  mkdirSync(paths.knowledgeReleases, { recursive: true });
  mkdirSync(paths.knowledgeOutcomes, { recursive: true });
  mkdirSync(paths.briefs, { recursive: true });
  mkdirSync(paths.releases, { recursive: true });
  mkdirSync(paths.outcomes, { recursive: true });
  ensureWorktreeLayout(paths, config);
  syncGeneratedFiles(paths, config);
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
  const parentItem = parent ? byKey.get(parent) : undefined;
  const briefValue = option(args, "brief") ?? parentItem?.brief ?? null;
  const brief = briefValue ? normalizeBriefId(briefValue) : null;
  const riskLevel = (option(args, "risk") ?? "low").toLowerCase();
  const riskFactors = [...new Set(options(args, "risk-factor").map((value) => value.toLowerCase()))];
  const gateTypes = [...new Set(options(args, "gate").map((value) => value.toLowerCase()))];
  const knowledgePolicy = (option(args, "knowledge") ?? (["epic", "story"].includes(type) ? "required" : "none")).toLowerCase();

  if (!ITEM_TYPES.includes(type)) fail(`Type must be one of: ${ITEM_TYPES.join(", ")}.`);
  if (!PRIORITIES.includes(priority)) fail(`Priority must be one of: ${PRIORITIES.join(", ")}.`);
  if (!RISK_LEVELS.includes(riskLevel)) fail(`Risk must be one of: ${RISK_LEVELS.join(", ")}.`);
  for (const factor of riskFactors) {
    if (!RISK_FACTORS.includes(factor)) fail(`Risk factor must be one of: ${RISK_FACTORS.join(", ")}.`);
  }
  for (const gate of gateTypes) {
    if (!QUALITY_GATE_TYPES.includes(gate)) fail(`Quality gate must be one of: ${QUALITY_GATE_TYPES.join(", ")}.`);
  }
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
  if (brief) loadBrief(paths, brief);

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
    brief,
    risk: { level: riskLevel, factors: riskFactors },
    acceptanceCriteria,
    checks,
    qualityGates: gateTypes.map((gate, index) => ({
      id: `GATE-${index + 1}`,
      type: gate,
      status: "pending",
      evidence: null,
      verifiedAt: null,
    })),
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
  const briefValue = option(args, "brief");
  if (briefValue !== undefined) {
    const brief = normalizeBriefId(briefValue);
    loadBrief(paths, brief);
    item.brief = brief;
    changed = true;
  }
  const riskLevel = option(args, "risk");
  if (riskLevel !== undefined) {
    const normalized = riskLevel.toLowerCase();
    if (!RISK_LEVELS.includes(normalized)) fail(`Risk must be one of: ${RISK_LEVELS.join(", ")}.`);
    item.risk = { ...itemRisk(item), level: normalized };
    changed = true;
  }
  if (hasOption(args, "risk-factor")) {
    const factors = [...new Set(options(args, "risk-factor").map((value) => value.toLowerCase()))];
    for (const factor of factors) {
      if (!RISK_FACTORS.includes(factor)) fail(`Risk factor must be one of: ${RISK_FACTORS.join(", ")}.`);
    }
    item.risk = { ...itemRisk(item), factors };
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

function commandAddGate(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const item = loadItem(paths, key);
  if (item.status === "done") fail("Done work items are immutable.");
  const type = option(args, "type", true).toLowerCase();
  if (!QUALITY_GATE_TYPES.includes(type)) fail(`Quality gate must be one of: ${QUALITY_GATE_TYPES.join(", ")}.`);
  const gates = itemQualityGates(item);
  if (gates.some((gate) => gate.type === type)) fail(`${key} already has a ${type} quality gate.`);
  const sequence = gates.reduce((highest, gate) => {
    const number = Number(String(gate.id).replace("GATE-", ""));
    return Number.isSafeInteger(number) ? Math.max(highest, number) : highest;
  }, 0);
  item.qualityGates = [
    ...gates,
    { id: `GATE-${sequence + 1}`, type, status: "pending", evidence: null, verifiedAt: null },
  ];
  resetReview(item);
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  console.log(`Added GATE-${sequence + 1} ${type} to ${key}.`);
}

function commandGate(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const gateId = requiredPositional(args, 2, "quality gate ID").toUpperCase();
  const status = option(args, "status", true).toLowerCase();
  const evidence = option(args, "evidence");
  const item = loadItem(paths, key);
  if (item.status === "done") fail("Done work items are immutable.");
  if (!["pending", "pass", "fail"].includes(status)) fail("Quality gate status must be pending, pass, or fail.");
  if (status === "pass" && !evidence?.trim()) fail("Passing quality gates need --evidence.");
  const gate = itemQualityGates(item).find((entry) => entry.id === gateId);
  if (!gate) fail(`${key} has no ${gateId}.`);
  gate.status = status;
  gate.evidence = status === "pending" ? null : evidence ?? null;
  gate.verifiedAt = status === "pending" ? null : now();
  item.qualityGates = itemQualityGates(item);
  resetReview(item);
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  console.log(`Marked ${key} ${gateId} as ${status}.`);
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
  if (target === "ready") assertReady(paths, item);
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
    errors.push(...qualityGateErrors(item, true));
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

function commandBriefCreate(args, paths, config) {
  const id = nextRecordId(paths.briefs, "BRIEF", "md");
  const timestamp = now();
  const brief = {
    schemaVersion: 1,
    id,
    title: oneLine(option(args, "title", true)),
    status: "draft",
    problem: option(args, "problem", true).trim(),
    users: options(args, "user").map(oneLine).filter(Boolean),
    evidence: options(args, "evidence").map(oneLine).filter(Boolean),
    outcome: option(args, "outcome", true).trim(),
    inScope: options(args, "in-scope").map(oneLine).filter(Boolean),
    outOfScope: options(args, "out-of-scope").map(oneLine).filter(Boolean),
    assumptions: options(args, "assumption").map(oneLine).filter(Boolean),
    alternatives: options(args, "alternative").map(oneLine).filter(Boolean),
    decisions: options(args, "decision").map(oneLine).filter(Boolean),
    constraints: options(args, "constraint").map(oneLine).filter(Boolean),
    dependencies: options(args, "dependency").map(oneLine).filter(Boolean),
    officialSources: options(args, "source-note").map(oneLine).filter(Boolean),
    risks: options(args, "risk").map(oneLine).filter(Boolean),
    deliveryAcceptance: options(args, "accept").map(oneLine).filter(Boolean),
    success: {
      metric: oneLine(option(args, "metric", true)),
      baseline: oneLine(option(args, "baseline", true)),
      target: oneLine(option(args, "target", true)),
      observationWindow: oneLine(option(args, "window", true)),
      dataSource: oneLine(option(args, "data-source", true)),
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    confirmedAt: null,
    confirmedBy: null,
    body: "# Planning context\n\nThis brief records product intent. It is not established project state.\n",
  };
  if (brief.users.length === 0) fail("Add at least one user with --user.");
  if (brief.evidence.length === 0) fail("Add at least one problem evidence statement with --evidence.");
  if (brief.deliveryAcceptance.length === 0) fail("Add at least one delivery signal with --accept.");
  const errors = briefErrors(paths, brief);
  if (errors.length) fail(`Brief is invalid:\n- ${errors.join("\n- ")}`);
  saveBrief(paths, brief);
  syncGeneratedFiles(paths, config);
  console.log(`${id}: ${brief.title}`);
}

function commandBriefConfirm(args, paths, config) {
  const id = normalizeBriefId(requiredPositional(args, 1, "brief ID"));
  const actor = oneLine(option(args, "by", true));
  const brief = loadBrief(paths, id);
  if (brief.status !== "draft") fail(`${id} is already confirmed and immutable.`);
  brief.status = "confirmed";
  brief.confirmedAt = now();
  brief.confirmedBy = actor;
  const errors = briefErrors(paths, brief);
  if (errors.length) fail(`Brief confirmation failed:\n- ${errors.join("\n- ")}`);
  saveBrief(paths, brief);
  syncGeneratedFiles(paths, config);
  console.log(`Confirmed ${id} by ${actor}.`);
}

function commandBriefShow(args, paths) {
  const id = normalizeBriefId(requiredPositional(args, 1, "brief ID"));
  const { body, ...brief } = loadBrief(paths, id);
  console.log(JSON.stringify(brief, null, 2));
}

function commandReleaseCreate(args, paths, config) {
  requireTargetBranch(paths, config, "Release creation");
  const items = loadItems(paths);
  const byKey = itemMap(items);
  const tickets = [...new Set(options(args, "ticket").map(normalizeKey))];
  if (tickets.length === 0) fail("Add at least one completed ticket with --ticket.");
  for (const key of tickets) {
    if (!byKey.has(key)) fail(`Ticket ${key} does not exist.`);
  }
  const kind = option(args, "kind", true).toLowerCase();
  if (!RELEASE_KINDS.includes(kind)) fail(`Release kind must be one of: ${RELEASE_KINDS.join(", ")}.`);
  const timestamp = now();
  const release = {
    schemaVersion: 1,
    id: nextRecordId(paths.releases, "REL", "json"),
    title: oneLine(option(args, "title", true)),
    kind,
    status: "planned",
    version: option(args, "version") ? oneLine(option(args, "version")) : null,
    tickets,
    target: {
      provider: oneLine(option(args, "provider", true)),
      environment: oneLine(option(args, "environment", true)),
      destination: oneLine(option(args, "destination", true)),
    },
    officialSources: options(args, "source-note").map(oneLine).filter(Boolean),
    migrationPlan: oneLine(option(args, "migration", true)),
    rolloutPlan: oneLine(option(args, "rollout", true)),
    recoveryPlan: oneLine(option(args, "recovery", true)),
    requiredApprovals: options(args, "require-approval").map(oneLine).filter(Boolean),
    approvals: [],
    commit: null,
    artifact: null,
    digest: null,
    checks: [],
    resultEvidence: [],
    startedAt: null,
    startedBy: null,
    finishedAt: null,
    finishedBy: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const errors = releaseErrors(paths, release, items);
  if (errors.length) fail(`Release is invalid:\n- ${errors.join("\n- ")}`);
  writeJson(releasePath(paths, release.id), release);
  syncGeneratedFiles(paths, config, items);
  console.log(`${release.id}: ${release.title}`);
}

function commandReleaseCheck(args, paths, config) {
  requireTargetBranch(paths, config, "Release checks");
  const id = normalizeReleaseId(requiredPositional(args, 1, "release ID"));
  const phase = option(args, "phase", true).toLowerCase();
  const status = option(args, "status", true).toLowerCase();
  const release = loadRelease(paths, id);
  if (!["pre", "post"].includes(phase)) fail("Release check phase must be pre or post.");
  if (!["pass", "fail"].includes(status)) fail("Release check status must be pass or fail.");
  if (phase === "pre" && release.status !== "planned") fail("Pre-release checks belong to planned releases.");
  if (phase === "post" && release.status !== "deploying") fail("Post-release checks belong to deploying releases.");
  const sequence = release.checks.reduce((highest, check) => {
    const number = Number(String(check.id).replace("RELCHK-", ""));
    return Number.isSafeInteger(number) ? Math.max(highest, number) : highest;
  }, 0);
  release.checks.push({
    id: `RELCHK-${sequence + 1}`,
    phase,
    name: oneLine(option(args, "name", true)),
    status,
    evidence: option(args, "evidence", true).trim(),
    recordedAt: now(),
  });
  saveRelease(paths, release);
  syncGeneratedFiles(paths, config);
  console.log(`Recorded ${phase} ${status} check for ${id}.`);
}

function commandReleaseStart(args, paths, config) {
  const targetBranch = requireTargetBranch(paths, config, "Release start");
  const id = normalizeReleaseId(requiredPositional(args, 1, "release ID"));
  const items = loadItems(paths);
  const byKey = itemMap(items);
  const release = loadRelease(paths, id, items);
  if (release.status !== "planned") fail(`${id} must be planned before release start.`);
  const incomplete = release.tickets.filter((key) => byKey.get(key)?.status !== "done");
  if (incomplete.length) fail(`Release tickets must be done: ${incomplete.join(", ")}.`);
  const epics = release.tickets.filter((key) => byKey.get(key)?.type === "epic");
  if (epics.length) fail(`Release leaf tickets, not coordination epics: ${epics.join(", ")}.`);
  const preChecks = release.checks.filter((check) => check.phase === "pre");
  if (preChecks.length === 0 || preChecks.some((check) => check.status !== "pass")) {
    fail("Release start needs at least one passing pre-release check and no failures.");
  }
  const approvals = [...new Set(options(args, "approval").map(oneLine).filter(Boolean))];
  const missingApprovals = release.requiredApprovals.filter((approval) => !approvals.includes(approval));
  if (missingApprovals.length) fail(`Missing required approvals: ${missingApprovals.join(", ")}.`);

  const ref = option(args, "commit") ?? targetBranch;
  const commitResult = runGit(paths.root, ["rev-parse", "--verify", `${ref}^{commit}`], true);
  if (commitResult.status !== 0) fail(`Release commit ${ref} does not resolve.`);
  const commit = commitResult.stdout.trim();
  const targetCommit = runGit(
    paths.root,
    ["rev-parse", "--verify", `${targetBranch}^{commit}`],
  ).stdout.trim();
  if (commit.toLowerCase() !== targetCommit.toLowerCase()) {
    fail(`Release commit must equal the current ${targetBranch} commit ${targetCommit}.`);
  }
  assertTicketsInReleaseCommit(paths.root, commit, release.tickets);
  release.status = "deploying";
  release.commit = commit;
  release.artifact = oneLine(option(args, "artifact", true));
  release.digest = oneLine(option(args, "digest", true));
  release.approvals = approvals;
  release.startedAt = now();
  release.startedBy = oneLine(option(args, "by", true));
  saveRelease(paths, release);
  syncGeneratedFiles(paths, config, items);
  console.log(`Started ${id} from ${commit}.`);
}

function lifecycleConcept(type, title, description, tags, actor, source, body) {
  const timestamp = now();
  return renderJsonConcept(
    {
      type,
      title,
      description,
      tags,
      sources: [{ resource: source, title }],
      status: "stable",
      generated: { by: actor, at: timestamp },
      verified: [{ by: "process:project-flow", at: timestamp }],
    },
    body,
  );
}

function appendKnowledgeEvent(paths, kind, id, target) {
  const heading = "# Knowledge Update Log\n\n";
  let content = existsSync(paths.knowledgeLog) ? readText(paths.knowledgeLog) : heading;
  if (!content.startsWith("# Knowledge Update Log")) fail("Knowledge log has an invalid heading.");
  const dateHeading = `## ${today()}`;
  const entry = `* **${kind}**: ${id} established [${target}](/${target}).`;
  if (content.includes(`${dateHeading}\n`)) {
    content = content.replace(`${dateHeading}\n`, `${dateHeading}\n${entry}\n`);
  } else {
    const remainder = content.slice(content.indexOf("\n") + 1).trimStart();
    content = `${heading}${dateHeading}\n${entry}\n\n${remainder}`.trimEnd() + "\n";
  }
  writeText(paths.knowledgeLog, content);
}

function releaseKnowledge(release, actor) {
  const checks = release.checks.map(
    (check) => `- ${check.phase} ${check.name}: ${check.status} — ${check.evidence}`,
  );
  const body = [
    "# Released state",
    "",
    `- Kind: ${release.kind}`,
    `- Version: ${release.version ?? "unversioned"}`,
    `- Provider: ${release.target.provider}`,
    `- Environment: ${release.target.environment}`,
    `- Destination: ${release.target.destination}`,
    `- Commit: ${release.commit}`,
    `- Artifact: ${release.artifact}`,
    `- Digest: ${release.digest}`,
    `- Tickets: ${release.tickets.join(", ")}`,
    `- Finished: ${release.finishedAt}`,
    "",
    "# Verification",
    "",
    ...checks,
    ...release.resultEvidence.map((evidence) => `- Result: ${evidence}`),
    "",
    "# Recovery",
    "",
    release.recoveryPlan,
  ].join("\n");
  return lifecycleConcept(
    "Release",
    `${release.id} ${release.title}`,
    `Verified ${release.kind} to ${release.target.environment}.`,
    ["release", release.kind, release.target.environment],
    actor,
    `urn:project-release:${release.id}`,
    body,
  );
}

function commandReleaseFinish(args, paths, config) {
  requireTargetBranch(paths, config, "Release completion");
  const id = normalizeReleaseId(requiredPositional(args, 1, "release ID"));
  const status = option(args, "status", true).toLowerCase();
  if (!RELEASE_RESULTS.includes(status)) fail(`Release result must be one of: ${RELEASE_RESULTS.join(", ")}.`);
  const items = loadItems(paths);
  const release = loadRelease(paths, id, items);
  if (release.status !== "deploying") fail(`${id} must be deploying before it can finish.`);
  const actor = oneLine(option(args, "by", true));
  release.status = status;
  release.resultEvidence = options(args, "evidence").map(oneLine).filter(Boolean);
  if (release.resultEvidence.length === 0) fail("Release completion needs at least one --evidence value.");
  release.finishedAt = now();
  release.finishedBy = actor;
  const errors = releaseErrors(paths, release, items);
  if (errors.length) fail(`Release completion failed:\n- ${errors.join("\n- ")}`);

  if (status === "green") {
    const target = `releases/${release.id.toLowerCase()}.md`;
    const targetPath = join(paths.knowledge, ...target.split("/"));
    if (existsSync(targetPath)) fail(`Established release knowledge already exists: ${target}.`);
    writeText(targetPath, releaseKnowledge(release, actor));
    appendKnowledgeEvent(paths, "Release", id, target);
  }
  saveRelease(paths, release);
  syncGeneratedFiles(paths, config, items);
  console.log(`Finished ${id} as ${status}.`);
}

function commandReleaseShow(args, paths) {
  const id = normalizeReleaseId(requiredPositional(args, 1, "release ID"));
  console.log(JSON.stringify(loadRelease(paths, id), null, 2));
}

function commandOutcomeCreate(args, paths, config) {
  requireTargetBranch(paths, config, "Outcome creation");
  const items = loadItems(paths);
  const brief = loadBrief(paths, normalizeBriefId(option(args, "brief", true)));
  const release = loadRelease(paths, normalizeReleaseId(option(args, "release", true)), items);
  if (brief.status !== "confirmed") fail(`${brief.id} must be confirmed.`);
  if (release.status !== "green") fail(`${release.id} must be green before outcome measurement is planned.`);
  const byKey = itemMap(items);
  if (!release.tickets.some((key) => byKey.get(key)?.brief === brief.id)) {
    fail(`${release.id} contains no ticket linked to ${brief.id}.`);
  }
  const existing = loadOutcomes(paths, loadBriefs(paths), loadReleases(paths, items), items);
  if (existing.some((outcome) => outcome.brief === brief.id && outcome.release === release.id)) {
    fail(`An outcome already exists for ${brief.id} and ${release.id}.`);
  }
  const timestamp = now();
  const outcome = {
    schemaVersion: 1,
    id: nextRecordId(paths.outcomes, "OUT", "json"),
    status: "planned",
    brief: brief.id,
    release: release.id,
    success: { ...brief.success },
    observed: null,
    result: null,
    evidence: [],
    decision: null,
    followUpTickets: [],
    measuredAt: null,
    measuredBy: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const errors = outcomeErrors(outcome, [brief], [release], items);
  if (errors.length) fail(`Outcome is invalid:\n- ${errors.join("\n- ")}`);
  writeJson(outcomePath(paths, outcome.id), outcome);
  syncGeneratedFiles(paths, config, items);
  console.log(`${outcome.id}: measure ${brief.id} after ${release.id}.`);
}

function outcomeKnowledge(outcome, brief, release, actor) {
  const body = [
    "# Observed outcome",
    "",
    `- Brief: ${brief.id}`,
    `- Release: ${release.id}`,
    `- Metric: ${outcome.success.metric}`,
    `- Baseline: ${outcome.success.baseline}`,
    `- Target: ${outcome.success.target}`,
    `- Observed: ${outcome.observed}`,
    `- Result: ${outcome.result}`,
    `- Decision: ${outcome.decision}`,
    `- Measured: ${outcome.measuredAt}`,
    "",
    "# Evidence",
    "",
    ...outcome.evidence.map((evidence) => `- ${evidence}`),
    "",
    "# Follow-up",
    "",
    outcome.followUpTickets.length ? outcome.followUpTickets.map((key) => `- ${key}`).join("\n") : "None.",
  ].join("\n");
  return lifecycleConcept(
    "ProductOutcome",
    `${outcome.id} ${brief.title}`,
    `${outcome.result} outcome for ${release.id}.`,
    ["product-outcome", outcome.result, outcome.decision],
    actor,
    `urn:project-outcome:${outcome.id}`,
    body,
  );
}

function commandOutcomeRecord(args, paths, config) {
  requireTargetBranch(paths, config, "Outcome recording");
  const id = normalizeOutcomeId(requiredPositional(args, 1, "outcome ID"));
  const items = loadItems(paths);
  const outcome = loadOutcome(paths, id, items);
  if (outcome.status !== "planned") fail(`${id} is already observed and immutable.`);
  const result = option(args, "result", true).toLowerCase();
  const decision = option(args, "decision", true).toLowerCase();
  if (!OUTCOME_RESULTS.includes(result)) fail(`Outcome result must be one of: ${OUTCOME_RESULTS.join(", ")}.`);
  if (!OUTCOME_DECISIONS.includes(decision)) {
    fail(`Outcome decision must be one of: ${OUTCOME_DECISIONS.join(", ")}.`);
  }
  const evidence = options(args, "evidence").map(oneLine).filter(Boolean);
  if (evidence.length === 0) fail("Outcome recording needs at least one --evidence value.");
  const followUpTickets = [...new Set(options(args, "follow-up").map(normalizeKey))];
  const actor = oneLine(option(args, "by", true));
  outcome.status = "observed";
  outcome.observed = oneLine(option(args, "observed", true));
  outcome.result = result;
  outcome.evidence = evidence;
  outcome.decision = decision;
  outcome.followUpTickets = followUpTickets;
  outcome.measuredAt = now();
  outcome.measuredBy = actor;
  const briefs = loadBriefs(paths);
  const releases = loadReleases(paths, items);
  const errors = outcomeErrors(outcome, briefs, releases, items);
  if (errors.length) fail(`Outcome recording failed:\n- ${errors.join("\n- ")}`);
  const target = `outcomes/${outcome.id.toLowerCase()}.md`;
  const targetPath = join(paths.knowledge, ...target.split("/"));
  if (existsSync(targetPath)) fail(`Established outcome knowledge already exists: ${target}.`);
  const brief = briefs.find((entry) => entry.id === outcome.brief);
  const release = releases.find((entry) => entry.id === outcome.release);
  writeText(targetPath, outcomeKnowledge(outcome, brief, release, actor));
  appendKnowledgeEvent(paths, "Outcome", id, target);
  saveOutcome(paths, outcome);
  syncGeneratedFiles(paths, config, items);
  console.log(`Recorded ${id} as ${result}; decision ${decision}.`);
}

function commandOutcomeShow(args, paths) {
  const id = normalizeOutcomeId(requiredPositional(args, 1, "outcome ID"));
  console.log(JSON.stringify(loadOutcome(paths, id), null, 2));
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
  project-flow.mjs add-gate KEY --type TYPE
  project-flow.mjs gate KEY GATE-N --status pending|pass|fail [--evidence TEXT]
  project-flow.mjs link KEY --type blocked-by|relates-to --target KEY
  project-flow.mjs transition KEY STATUS
  project-flow.mjs accept KEY AC-N --status pending|pass|fail [--evidence TEXT]
  project-flow.mjs verify KEY
  project-flow.mjs review KEY --status STATUS --reviewer ACTOR [review evidence]
  project-flow.mjs source-add --target PATH --title TEXT --publisher TEXT [options]
  project-flow.mjs brief-create --title TEXT --problem TEXT --outcome TEXT [options]
  project-flow.mjs brief-confirm BRIEF-N --by ACTOR
  project-flow.mjs brief-show BRIEF-N
  project-flow.mjs knowledge-template KEY --target PATH --action create|update [options]
  project-flow.mjs complete KEY
  project-flow.mjs worktree-add KEY [--branch-type TYPE] [--base BRANCH]
  project-flow.mjs worktree-list
  project-flow.mjs worktree-finish KEY [--target BRANCH] [--message TEXT]
  project-flow.mjs release-create --title TEXT --ticket KEY [options]
  project-flow.mjs release-check REL-N --phase pre|post --status pass|fail [options]
  project-flow.mjs release-start REL-N --artifact TEXT --digest TEXT --by ACTOR [options]
  project-flow.mjs release-finish REL-N --status green|failed|rolled-back --by ACTOR [options]
  project-flow.mjs release-show REL-N
  project-flow.mjs outcome-create --brief BRIEF-N --release REL-N
  project-flow.mjs outcome-record OUT-N --observed TEXT --result RESULT [options]
  project-flow.mjs outcome-show OUT-N
  project-flow.mjs show KEY
  project-flow.mjs status
  project-flow.mjs sync
  project-flow.mjs validate

Create options:
  --parent KEY
  --brief BRIEF-N
  --description TEXT
  --priority highest|high|medium|low|lowest
  --risk low|elevated|high
  --risk-factor FACTOR          Repeat for applicable risks.
  --gate TYPE                   Repeat for required quality evidence.
  --accept TEXT                 Repeat for more criteria.
  --check "Name::command"       Repeat for more checks.
  --blocked-by KEY             Repeat for more blockers.
  --knowledge required|none

Risk factors:
  sensitive-data, authentication, public-network, financial, destructive,
  dependency, migration, user-interface, availability, performance.

Quality gate types:
  security, privacy, dependency, migration, accessibility, reliability,
  performance, compatibility.

Brief options:
  --user TEXT --evidence TEXT --accept TEXT       Repeat each as needed.
  --in-scope TEXT --out-of-scope TEXT             Repeat as needed.
  --assumption TEXT --alternative TEXT --decision TEXT
  --constraint TEXT --dependency TEXT --risk TEXT
  --source-note PATH                              Local official source note.
  --metric TEXT --baseline TEXT --target TEXT
  --window TEXT --data-source TEXT

Release create options:
  --kind deploy|publish --provider TEXT --environment TEXT --destination TEXT
  --version TEXT --source-note PATH --require-approval ACTOR
  --migration TEXT --rollout TEXT --recovery TEXT

Release evidence:
  release-check: --name TEXT --evidence TEXT
  release-start: --commit REF --approval ACTOR
  release-finish: --evidence TEXT                  Repeat for final evidence.

Outcome evidence:
  --decision proceed|improve|revert|stop --by ACTOR
  --evidence TEXT --follow-up KEY                  Repeat as needed.

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
    case "add-gate":
      commandAddGate(args, paths, config);
      return true;
    case "gate":
      commandGate(args, paths, config);
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
    case "brief-create":
      commandBriefCreate(args, paths, config);
      return true;
    case "brief-confirm":
      commandBriefConfirm(args, paths, config);
      return true;
    case "brief-show":
      commandBriefShow(args, paths);
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
    case "release-create":
      commandReleaseCreate(args, paths, config);
      return true;
    case "release-check":
      commandReleaseCheck(args, paths, config);
      return true;
    case "release-start":
      commandReleaseStart(args, paths, config);
      return true;
    case "release-finish":
      commandReleaseFinish(args, paths, config);
      return true;
    case "release-show":
      commandReleaseShow(args, paths);
      return true;
    case "outcome-create":
      commandOutcomeCreate(args, paths, config);
      return true;
    case "outcome-record":
      commandOutcomeRecord(args, paths, config);
      return true;
    case "outcome-show":
      commandOutcomeShow(args, paths);
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
