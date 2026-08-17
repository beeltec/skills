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
const LANGUAGE_STATUSES = ["active", "deprecated"];
const LANGUAGE_ACTIONS = ["added", "updated", "deprecated"];
const LANGUAGE_SOURCE_URL =
  "https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf";
const LANGUAGE_SOURCE_PAGE_URL = "https://www.domainlanguage.com/ddd/reference/";
const LANGUAGE_SOURCE_URLS = [LANGUAGE_SOURCE_URL, LANGUAGE_SOURCE_PAGE_URL];
const LANGUAGE_SOURCE_NOTE = "sources/methods/ubiquitous-language.md";
const LANGUAGE_FILENAME = "ubiquitous-language.md";
const SUCCESS_FIELDS = ["metric", "baseline", "target", "observationWindow", "dataSource"];
const OFFICIAL_SOURCE_DONE = "Relevant external claims cite refreshed official source notes.";
const QUALITY_GATE_DONE = "Applicable risk-driven quality gates have passing evidence.";
const DEFAULT_GIT_CONFIG = Object.freeze({
  targetBranch: "main",
  worktreeDirectory: ".worktrees",
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
    legacyKnowledgeLog: join(knowledge, "log.md"),
    language: join(knowledge, LANGUAGE_FILENAME),
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
    fail("workflow.json git.worktreeDirectory must be .worktrees.");
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
  if (Array.isArray(item.checks)) {
    for (const check of item.checks) {
      if (
        check?.status === "pass" &&
        check.lastRun?.exitCode === 0 &&
        check.lastRun.output !== undefined
      ) {
        errors.push(`${path}: passing checks must not retain command output. Run setup refresh.`);
      }
    }
  }
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
    (item.review.scopeBase !== undefined &&
      item.review.scopeBase !== null &&
      typeof item.review.scopeBase !== "string") ||
    (item.review.targetBranch !== undefined &&
      item.review.targetBranch !== null &&
      (typeof item.review.targetBranch !== "string" || !validGitRefName(item.review.targetBranch))) ||
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
  const scopeBase = item.type === "epic" ? item.review?.scopeBase ?? null : null;
  item.review = {
    status: "pending",
    reviewer: null,
    fixedPoint: null,
    scopeBase,
    targetBranch: null,
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

function blockingReviewCountErrors(item) {
  const errors = [];
  for (const axis of ["standards", "spec"]) {
    const evidence = item.review?.[axis];
    if (typeof evidence !== "string" || !evidence.trim()) {
      errors.push(`${item.key}: ${axis} review evidence is missing.`);
      continue;
    }
    for (const severity of ["P0", "P1", "P2"]) {
      const matches = [...evidence.matchAll(new RegExp(`\\b${severity}\\s*:\\s*(\\d+)\\b`, "gi"))];
      if (matches.length === 0) {
        errors.push(`${item.key}: ${axis} review evidence needs an explicit ${severity} count.`);
        continue;
      }
      if (matches.some((match) => Number(match[1]) !== 0)) {
        errors.push(`${item.key}: ${axis} review evidence reports a blocking ${severity} finding.`);
      }
    }
  }
  return errors;
}

function itemMap(items) {
  return new Map(items.map((item) => [item.key, item]));
}

function ancestorEpicKey(item, byKey) {
  const visited = new Set();
  let parent = item?.parent ? byKey.get(item.parent) : undefined;
  while (parent) {
    if (visited.has(parent.key)) fail(`${item.key}: parent hierarchy contains a cycle.`);
    visited.add(parent.key);
    if (parent.type === "epic") return parent.key;
    parent = parent.parent ? byKey.get(parent.parent) : undefined;
  }
  return null;
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

  const childrenByParent = new Map();
  for (const item of items) {
    if (!item.parent) continue;
    const children = childrenByParent.get(item.parent) ?? [];
    children.push(item.key);
    childrenByParent.set(item.parent, children);
  }

  const states = new Map();
  const stack = [];
  function visitCompletionDependencies(key) {
    const state = states.get(key) ?? "new";
    if (state === "done") return;
    if (state === "visiting") {
      const start = stack.indexOf(key);
      const cycle = [...stack.slice(start), key];
      errors.push(`Completion dependencies contain a cycle: ${cycle.join(" -> ")}.`);
      return;
    }

    states.set(key, "visiting");
    stack.push(key);
    const dependencies = [
      ...(byKey.get(key)?.links.blockedBy ?? []),
      ...(childrenByParent.get(key) ?? []),
    ];
    for (const dependency of dependencies) {
      if (byKey.has(dependency)) visitCompletionDependencies(dependency);
    }
    stack.pop();
    states.set(key, "done");
  }

  for (const item of items) visitCompletionDependencies(item.key);

  for (const epic of items.filter((item) => item.type === "epic")) {
    const descendantKeys = new Set(descendantsOf(items, epic.key).map((item) => item.key));
    const blockerQueue = [...epic.links.blockedBy];
    const visitedBlockers = new Set();
    while (blockerQueue.length) {
      const blocker = blockerQueue.shift();
      if (visitedBlockers.has(blocker)) continue;
      visitedBlockers.add(blocker);
      if (descendantKeys.has(blocker)) {
        errors.push(`${epic.key}: an epic cannot be blocked by its descendant ${blocker}.`);
        break;
      }
      blockerQueue.push(...(byKey.get(blocker)?.links.blockedBy ?? []));
    }
  }

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
  if (
    RESERVED_KNOWLEDGE_FILES.has(normalized.split("/").at(-1)) ||
    normalized === LANGUAGE_FILENAME
  ) {
    fail(`${normalized.split("/").at(-1)} is a workflow-managed knowledge filename.`);
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

function requireLanguageMutationLocation(paths, config) {
  const repository = runGit(paths.root, ["rev-parse", "--show-toplevel"], true);
  if (repository.status !== 0) return;

  const topLevel = realpathSync(repository.stdout.trim());
  if (topLevel !== realpathSync(paths.root)) {
    fail("Language changes must run from the workflow's Git repository root.");
  }

  const target = gitConfig(config).targetBranch;
  const branch = currentGitBranch(paths.root);
  if (branch !== target) {
    fail(`Language changes must run on the configured target branch ${target}, not ${branch}.`);
  }
}

function loadItemsFromCommit(root, commit) {
  const listing = runGit(
    root,
    ["ls-tree", "-r", "--name-only", commit, "--", "docs/work/items"],
    true,
  );
  if (listing.status !== 0) fail(`Cannot inspect work items in release commit ${commit}.`);

  const items = [];
  const errors = [];
  for (const target of listing.stdout.split("\n").map((line) => line.trim()).filter(Boolean)) {
    if (!target.endsWith(".json")) continue;
    const result = runGit(root, ["show", `${commit}:${target}`], true);
    if (result.status !== 0) {
      errors.push(`${target} cannot be read from the release commit.`);
      continue;
    }
    try {
      const item = JSON.parse(result.stdout);
      const shapeErrors = validateItemShape(item, target);
      if (shapeErrors.length) errors.push(...shapeErrors);
      else items.push(item);
    } catch {
      errors.push(`${target} is not valid JSON in the release commit.`);
    }
  }
  if (errors.length) fail(`Release commit work items are invalid:\n- ${errors.join("\n- ")}`);
  return items;
}

function assertTicketsInReleaseCommit(items, ticketKeys) {
  const errors = [];
  const byKey = itemMap(items);
  for (const key of ticketKeys) {
    const item = byKey.get(key);
    if (!item) {
      errors.push(`${key} is absent from the release commit.`);
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
  if (result.status !== 0 || !result.stdout.trim()) fail("This operation requires a checked-out branch, not detached HEAD.");
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

function languageTermKey(value) {
  return oneLine(value).normalize("NFKC").toLocaleLowerCase("en-US");
}

function compareLanguageEntries(left, right) {
  const leftKey = languageTermKey(left.term);
  const rightKey = languageTermKey(right.term);
  if (leftKey < rightKey) return -1;
  if (leftKey > rightKey) return 1;
  return 0;
}

function languageTermInput(value, label = "Term") {
  const normalized = oneLine(value);
  if (!/^[\p{L}\p{N}][\p{L}\p{N} ._/'&()+-]{0,79}$/u.test(normalized)) {
    fail(`${label} must be 1-80 plain-text characters.`);
  }
  return normalized;
}

function languageTextInput(value, label, maximum) {
  const normalized = oneLine(value);
  if (!normalized) fail(`${label} cannot be empty.`);
  if (normalized.length > maximum) fail(`${label} cannot exceed ${maximum} characters.`);
  return normalized;
}

function languageListInput(values, label, kind) {
  const normalized = values.map((value) =>
    kind === "term"
      ? languageTermInput(value, label)
      : languageTextInput(value, label, 300),
  );
  const seen = new Set();
  for (const value of normalized) {
    const key = value.normalize("NFKC").toLocaleLowerCase("en-US");
    if (seen.has(key)) fail(`${label} contains a duplicate: ${value}.`);
    seen.add(key);
  }
  return normalized;
}

function languageDisplay(data) {
  const terms = [...data.terms].sort(compareLanguageEntries);
  const active = terms.filter((entry) => entry.status === "active");
  const deprecated = terms.filter((entry) => entry.status === "deprecated");
  const lines = [
    "# Purpose",
    "",
    "Use these agreed terms in user conversations, project documents, tests, and code when they describe the same project concept.",
    "",
    "This file applies only the Ubiquitous Language principle. It does not adopt other Domain-Driven Design patterns.",
    "",
    "# Rules",
    "",
    "- Use each active canonical term for its stated meaning.",
    "- Recognize accepted aliases, but prefer the canonical term.",
    "- Ask the user when a term is missing, ambiguous, or used with another meaning.",
    "- Treat a definition change as a project meaning change that needs explicit agreement.",
    "",
    "# Active terms",
    "",
  ];

  function appendTerm(entry) {
    lines.push(`## ${entry.term}`, "", entry.definition, "");
    if (entry.aliases.length) lines.push(`Accepted aliases: ${entry.aliases.join(", ")}.`, "");
    if (entry.examples.length) {
      lines.push("Examples:", "", ...entry.examples.map((example) => `- ${example}`), "");
    }
    if (entry.status === "deprecated") {
      lines.push(`Replacement: ${entry.replacement ?? "None"}.`, "");
    }
  }

  if (active.length) active.forEach(appendTerm);
  else lines.push("No active terms yet.", "");

  lines.push("# Deprecated terms", "");
  if (deprecated.length) deprecated.forEach(appendTerm);
  else lines.push("No deprecated terms.", "");

  return `${lines.join("\n").trimEnd()}\n`;
}

function languageDocumentBody() {
  return [
    "# Usage",
    "",
    "Read the canonical vocabulary data from the frontmatter.",
    "Run `node .project/bin/project-flow.mjs language-show` for a readable view.",
    "",
  ].join("\n");
}

function normalizeLanguageData(data) {
  const history = Array.isArray(data.history) ? data.history : [];
  const latestEvent = history.at(-1);
  const meaningfulAt = latestEvent?.at ?? data.updatedAt;

  if (nonEmptyString(meaningfulAt) && !Number.isNaN(Date.parse(meaningfulAt))) {
    if (
      data.generated !== undefined &&
      (!data.generated || typeof data.generated !== "object" || Array.isArray(data.generated))
    ) {
      fail("Ubiquitous Language generated metadata must be an object before setup can refresh it.");
    }
    data.generated = {
      ...(data.generated ?? {}),
      by: "process:project-flow",
      at: meaningfulAt,
    };
    const previousVerifications = Array.isArray(data.verified)
      ? data.verified
      : data.verified
        ? [data.verified]
        : [];
    data.verified = previousVerifications.filter(
      (event) =>
        nonEmptyString(event?.at) &&
        !Number.isNaN(Date.parse(event.at)) &&
        Date.parse(event.at) >= Date.parse(meaningfulAt),
    );
    if (
      latestEvent &&
      !data.verified.some(
        (event) => event?.by === latestEvent.by && event?.at === latestEvent.at,
      )
    ) {
      data.verified.push({ by: latestEvent.by, at: latestEvent.at });
    }
  }
  delete data.updatedAt;

  const sources = Array.isArray(data.sources) ? data.sources : [];
  const matchingSources = sources.filter(
    (source) =>
      source?.resource === LANGUAGE_SOURCE_URL || source?.resource === LANGUAGE_SOURCE_NOTE,
  );
  if (matchingSources.length > 1) {
    fail("Ubiquitous Language has several canonical source entries. Resolve them before setup refresh.");
  }
  const existingSource = matchingSources[0];
  const normalizedSource =
    existingSource && typeof existingSource === "object" && !Array.isArray(existingSource)
      ? { ...existingSource, resource: LANGUAGE_SOURCE_NOTE }
      : { resource: LANGUAGE_SOURCE_NOTE };
  if (normalizedSource.title === "Domain-Driven Design Reference: Ubiquitous Language") {
    delete normalizedSource.title;
  }
  if (normalizedSource.publisher === "Eric Evans, Domain Language") {
    delete normalizedSource.publisher;
  }
  if (normalizedSource.version === "2015") delete normalizedSource.version;
  const retained = sources.filter((source) => !matchingSources.includes(source));
  data.sources = [normalizedSource, ...retained];
}

function newLanguageConcept(config) {
  const timestamp = now();
  const data = {
    type: "UbiquitousLanguage",
    title: `${config.projectName} ubiquitous language`,
    description: "Agreed project terms used consistently by users and agents.",
    tags: ["ubiquitous-language", "project-vocabulary"],
    sources: [{ resource: LANGUAGE_SOURCE_NOTE }],
    status: "stable",
    generated: { by: "process:project-flow", at: timestamp },
    verified: [],
    terms: [],
    history: [],
  };
  return renderJsonConcept(data, languageDocumentBody());
}

function refreshedLanguageContent(paths, config) {
  const current = existsSync(paths.language)
    ? readText(paths.language)
    : newLanguageConcept(config);
  const { data, body } = parseFrontmatter(current, true);
  const storedBody = normalizedConceptBody(body);
  let legacyBody = null;
  try {
    legacyBody = languageDisplay(data).trimEnd();
  } catch {
    // Shape validation below reports malformed vocabulary data.
  }
  if (storedBody !== languageDocumentBody().trimEnd() && storedBody !== legacyBody) {
    fail(`${paths.language}: the Markdown body was customized; resolve it before setup refresh.`);
  }
  normalizeLanguageData(data);
  const errors = languageConceptErrors(data, "", paths.language, false, false);
  if (errors.length) fail(errors.join("\n"));
  return renderJsonConcept(data, languageDocumentBody());
}

function refreshLanguageFile(paths, config) {
  const rendered = refreshedLanguageContent(paths, config);
  if (!existsSync(paths.language) || readText(paths.language) !== rendered) {
    writeText(paths.language, rendered);
  }
}

function languageConceptErrors(data, body, path, checkBody = true, checkSourceFile = true) {
  const errors = [];
  if (data.type !== "UbiquitousLanguage") errors.push(`${path}: type must be UbiquitousLanguage.`);
  if (data.status !== "stable") errors.push(`${path}: status must be stable.`);
  if (!nonEmptyString(data.title)) errors.push(`${path}: title must be a non-empty string.`);
  if (!nonEmptyString(data.description)) errors.push(`${path}: description must be a non-empty string.`);
  if (!Array.isArray(data.terms)) errors.push(`${path}: terms must be an array.`);
  if (!Array.isArray(data.history)) errors.push(`${path}: history must be an array.`);
  const hasLanguageSource =
    Array.isArray(data.sources) &&
    data.sources.some((source) => source?.resource === LANGUAGE_SOURCE_NOTE);
  if (!hasLanguageSource) {
    errors.push(`${path}: sources must reference the local Ubiquitous Language source note.`);
  }
  if (checkSourceFile && hasLanguageSource) {
    const sourcePath = join(dirname(path), ...LANGUAGE_SOURCE_NOTE.split("/"));
    if (!existsSync(sourcePath)) {
      errors.push(`${path}: the local Ubiquitous Language source note is missing.`);
    } else {
      try {
        const source = parseFrontmatter(readText(sourcePath), true);
        if (source.data.type !== "OfficialSource") {
          errors.push(`${sourcePath}: type must be OfficialSource.`);
        }
        if (
          !Array.isArray(source.data.sources) ||
          !source.data.sources.some((entry) => LANGUAGE_SOURCE_URLS.includes(entry?.resource))
        ) {
          errors.push(`${sourcePath}: sources must cite the official Ubiquitous Language reference.`);
        }
      } catch (error) {
        errors.push(`${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  if (errors.length) return errors;

  const canonical = new Map();
  const aliasOwners = new Map();
  for (const [index, entry] of data.terms.entries()) {
    const label = `${path}: terms[${index}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`${label} must be an object.`);
      continue;
    }
    if (
      !nonEmptyString(entry.term) ||
      entry.term !== oneLine(entry.term) ||
      !/^[\p{L}\p{N}][\p{L}\p{N} ._/'&()+-]{0,79}$/u.test(entry.term)
    ) {
      errors.push(`${label}.term must be 1-80 plain-text characters.`);
    } else {
      const key = languageTermKey(entry.term);
      if (canonical.has(key)) errors.push(`${label}.term duplicates ${canonical.get(key)}.`);
      else canonical.set(key, entry.term);
    }
    if (!nonEmptyString(entry.definition) || entry.definition !== oneLine(entry.definition)) {
      errors.push(`${label}.definition must be one non-empty line.`);
    } else if (entry.definition.length > 500) {
      errors.push(`${label}.definition cannot exceed 500 characters.`);
    }
    if (!LANGUAGE_STATUSES.includes(entry.status)) errors.push(`${label}.status is invalid.`);
    errors.push(...stringArrayErrors(entry.aliases, `${label}.aliases`));
    errors.push(...stringArrayErrors(entry.examples, `${label}.examples`));
    if (Array.isArray(entry.aliases)) {
      for (const alias of entry.aliases) {
        if (
          !nonEmptyString(alias) ||
          alias !== oneLine(alias) ||
          !/^[\p{L}\p{N}][\p{L}\p{N} ._/'&()+-]{0,79}$/u.test(alias)
        ) {
          errors.push(`${label}.aliases entries must be 1-80 plain-text characters.`);
        }
      }
    }
    if (Array.isArray(entry.examples)) {
      for (const example of entry.examples) {
        if (!nonEmptyString(example) || example !== oneLine(example) || example.length > 300) {
          errors.push(`${label}.examples entries must be one line of at most 300 characters.`);
        }
      }
    }
    if (!nonEmptyString(entry.updatedBy)) errors.push(`${label}.updatedBy is required.`);
    if (!nonEmptyString(entry.updatedAt) || Number.isNaN(Date.parse(entry.updatedAt))) {
      errors.push(`${label}.updatedAt must be an ISO date-time.`);
    }
    if (entry.status === "active" && entry.replacement !== null) {
      errors.push(`${label}.replacement must be null while active.`);
    }
    if (
      entry.status === "deprecated" &&
      entry.replacement !== null &&
      !nonEmptyString(entry.replacement)
    ) {
      errors.push(`${label}.replacement must be null or a canonical term.`);
    }
  }

  for (const entry of data.terms) {
    if (!entry || typeof entry !== "object" || !Array.isArray(entry.aliases)) continue;
    const owner = nonEmptyString(entry.term) ? entry.term : "unknown term";
    const localAliases = new Set();
    for (const alias of entry.aliases) {
      if (!nonEmptyString(alias)) continue;
      const key = languageTermKey(alias);
      if (localAliases.has(key)) errors.push(`${path}: ${owner} contains duplicate alias ${alias}.`);
      localAliases.add(key);
      if (canonical.has(key)) errors.push(`${path}: alias ${alias} conflicts with canonical term ${canonical.get(key)}.`);
      if (aliasOwners.has(key)) errors.push(`${path}: alias ${alias} belongs to both ${aliasOwners.get(key)} and ${owner}.`);
      else aliasOwners.set(key, owner);
    }
    if (entry.status === "deprecated" && entry.replacement !== null) {
      const replacement = data.terms.find(
        (candidate) =>
          nonEmptyString(candidate?.term) && languageTermKey(candidate.term) === languageTermKey(entry.replacement),
      );
      if (!replacement || replacement.status !== "active") {
        errors.push(`${path}: replacement ${entry.replacement} for ${owner} must name an active canonical term.`);
      }
    }
  }

  for (const [index, event] of data.history.entries()) {
    const label = `${path}: history[${index}]`;
    if (!event || typeof event !== "object" || Array.isArray(event)) {
      errors.push(`${label} must be an object.`);
      continue;
    }
    if (!LANGUAGE_ACTIONS.includes(event.action)) errors.push(`${label}.action is invalid.`);
    if (!nonEmptyString(event.term) || event.term !== oneLine(event.term)) {
      errors.push(`${label}.term must be one non-empty line.`);
    }
    if (!nonEmptyString(event.by) || event.by !== oneLine(event.by) || event.by.length > 120) {
      errors.push(`${label}.by must be one line of at most 120 characters.`);
    }
    if (
      !nonEmptyString(event.reason) ||
      event.reason !== oneLine(event.reason) ||
      event.reason.length > 300
    ) {
      errors.push(`${label}.reason must be one line of at most 300 characters.`);
    }
    if (!nonEmptyString(event.at) || Number.isNaN(Date.parse(event.at))) {
      errors.push(`${label}.at must be an ISO date-time.`);
    }
  }

  if (data.updatedAt !== undefined) {
    errors.push(`${path}: updatedAt duplicates generated.at. Run setup refresh.`);
  }
  const latestEvent = data.history.at(-1);
  if (latestEvent) {
    if (data.generated?.by !== "process:project-flow" || data.generated?.at !== latestEvent.at) {
      errors.push(`${path}: generated metadata must describe the latest language change.`);
    }
    const verifications = Array.isArray(data.verified) ? data.verified : data.verified ? [data.verified] : [];
    if (!verifications.some((event) => event?.by === latestEvent.by && event?.at === latestEvent.at)) {
      errors.push(`${path}: the latest language change needs its confirmation evidence.`);
    }
    if (
      verifications.some(
        (event) =>
          !nonEmptyString(event?.at) ||
          Number.isNaN(Date.parse(event.at)) ||
          Date.parse(event.at) < Date.parse(latestEvent.at),
      )
    ) {
      errors.push(`${path}: verification entries must apply to the current vocabulary content.`);
    }
  }

  if (
    checkBody &&
    !errors.length &&
    body !== `\n${languageDocumentBody()}` &&
    body !== languageDocumentBody()
  ) {
    errors.push(`${path}: body must not duplicate vocabulary data. Run setup refresh.`);
  }
  return errors;
}

function loadLanguage(paths) {
  if (!existsSync(paths.language)) fail("The ubiquitous language file is missing. Run setup to refresh the workflow.");
  const { data, body } = parseFrontmatter(readText(paths.language), true);
  const errors = languageConceptErrors(data, body, paths.language);
  if (errors.length) fail(errors.join("\n"));
  return data;
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
    for (const field of SUCCESS_FIELDS) {
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
      for (const field of SUCCESS_FIELDS) {
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
  if (outcome.success !== undefined) {
    errors.push(`${label}: duplicated success data is obsolete. Run setup refresh.`);
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
      for (const field of ["publisher", "version", "retrievedAt"]) {
        if (typeof source[field] !== "string" || !source[field].trim()) {
          errors.push(`${path}: source.${field} must be a non-empty string.`);
        }
      }
      if (source.title !== undefined && !nonEmptyString(source.title)) {
        errors.push(`${path}: source.title must be a non-empty string when present.`);
      }
      if (source.title === data.title) {
        errors.push(`${path}: source.title duplicates the concept title. Run setup refresh.`);
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
  const normalizedBody = body.startsWith("\n") ? body.slice(1) : body;
  if (normalizedBody.startsWith(`# Applicability\n\n${data.description}\n\n`)) {
    errors.push(`${path}: Applicability duplicates description. Run setup refresh.`);
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

function childrenOf(items, key) {
  return items.filter((item) => item.parent === key);
}

function descendantsOf(items, key) {
  const descendants = [];
  const queue = [...childrenOf(items, key)];
  const visited = new Set();
  while (queue.length) {
    const item = queue.shift();
    if (!item || visited.has(item.key)) continue;
    visited.add(item.key);
    descendants.push(item);
    queue.push(...childrenOf(items, item.key));
  }
  return descendants;
}

function emptyTreeHash(root, write = false) {
  const args = ["hash-object"];
  if (write) args.push("-w");
  args.push("-t", "tree", "--stdin");
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    input: "",
    maxBuffer: 2 * 1024 * 1024,
  });
  if (result.error || result.status !== 0 || !result.stdout.trim()) {
    fail("Cannot resolve Git's empty tree object.");
  }
  return result.stdout.trim();
}

function resolveReviewScope(root, scopeBase) {
  const emptyTree = emptyTreeHash(root);
  const isEmptyTree = scopeBase.toLowerCase() === emptyTree.toLowerCase();
  if (isEmptyTree) emptyTreeHash(root, true);
  const suffix = isEmptyTree ? "tree" : "commit";
  const result = runGit(root, ["rev-parse", "--verify", `${scopeBase}^{${suffix}}`], true);
  return { emptyTree, isEmptyTree, result };
}

function epicScopeCoverageErrors(paths, item, items, scopeBase) {
  if (item.type !== "epic") return [];

  const errors = [];
  const scopeIsEmptyTree = scopeBase.toLowerCase() === emptyTreeHash(paths.root).toLowerCase();
  for (const descendant of descendantsOf(items, item.key)) {
    const fixedPoint = descendant.review.fixedPoint;
    if (fixedPoint?.trim().toLowerCase() === "initial tree") {
      const emptyTree = emptyTreeHash(paths.root);
      if (emptyTree.toLowerCase() !== scopeBase.toLowerCase()) {
        errors.push(`${item.key}: legacy descendant ${descendant.key} needs the empty tree as scope base.`);
      }
      continue;
    }
    if (!fixedPoint) {
      if (descendant.status === "done") {
        errors.push(`${item.key}: completed descendant ${descendant.key} lacks a review fixed point.`);
      }
      continue;
    }
    if (!/^[0-9a-f]{40,64}$/i.test(fixedPoint)) {
      errors.push(`${item.key}: descendant ${descendant.key} has an invalid review fixed point.`);
      continue;
    }
    const descendantRef = runGit(
      paths.root,
      ["rev-parse", "--verify", `${fixedPoint}^{commit}`],
      true,
    );
    if (descendantRef.status !== 0) {
      errors.push(`${item.key}: descendant ${descendant.key} review fixed point does not resolve.`);
      continue;
    }
    if (scopeIsEmptyTree) continue;
    const containsDescendantBase = runGit(
      paths.root,
      ["merge-base", "--is-ancestor", scopeBase, descendantRef.stdout.trim()],
      true,
    );
    if (containsDescendantBase.status !== 0) {
      errors.push(`${item.key}: scope base does not cover descendant ${descendant.key}.`);
    }
  }
  return errors;
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
  } else {
    errors.push(...blockingReviewCountErrors(item));
  }
  if (item.type === "epic" && !item.review.scopeBase?.trim()) {
    errors.push(`${item.key}: an epic review needs the full delivery scope base.`);
  }
  for (const blockerKey of item.links.blockedBy) {
    if (byKey.get(blockerKey)?.status !== "done") errors.push(`${item.key}: blocker ${blockerKey} is not done.`);
  }
  const completionChildren = item.type === "epic" ? descendantsOf(items, item.key) : childrenOf(items, item.key);
  for (const child of completionChildren) {
    if (child.status !== "done") errors.push(`${item.key}: child ${child.key} is not done.`);
  }
  const hasEstablishedEpicKnowledge = item.type === "epic" && item.promotions.length > 0;
  if (
    item.knowledgePolicy === "required" &&
    item.knowledgeChanges.length === 0 &&
    !hasEstablishedEpicKnowledge
  ) {
    errors.push(`${item.key}: drafted knowledge is required.`);
  }
  errors.push(...candidateErrors(paths, item));
  return errors;
}

function epicReviewScopeErrors(paths, item) {
  if (item.type !== "epic") return [];

  const errors = [];
  const scopeBase = item.review.scopeBase ?? "";
  const fixedPoint = item.review.fixedPoint ?? "";
  if (!/^[0-9a-f]{40,64}$/i.test(scopeBase)) {
    return [`${item.key}: review.scopeBase must be a resolved full Git object hash.`];
  }
  if (!/^[0-9a-f]{40,64}$/i.test(fixedPoint)) {
    return [`${item.key}: review.fixedPoint must be a resolved full commit hash.`];
  }

  const scope = resolveReviewScope(paths.root, scopeBase);
  const fixedRef = runGit(paths.root, ["rev-parse", "--verify", `${fixedPoint}^{commit}`], true);
  if (scope.result.status !== 0) errors.push(`${item.key}: review.scopeBase does not resolve.`);
  if (fixedRef.status !== 0) errors.push(`${item.key}: review.fixedPoint does not resolve to a commit.`);
  if (errors.length) return errors;

  const resolvedScope = scope.result.stdout.trim();
  const resolvedFixed = fixedRef.stdout.trim();
  if (
    !scope.isEmptyTree &&
    runGit(paths.root, ["merge-base", "--is-ancestor", resolvedScope, resolvedFixed], true).status !== 0
  ) {
    errors.push(`${item.key}: review.scopeBase is not an ancestor of review.fixedPoint.`);
  }
  if (runGit(paths.root, ["merge-base", "--is-ancestor", resolvedFixed, "HEAD"], true).status !== 0) {
    errors.push(`${item.key}: review.fixedPoint is not an ancestor of the epic review branch.`);
  }
  errors.push(...epicScopeCoverageErrors(paths, item, loadItems(paths), resolvedScope));
  return errors;
}

function reviewTargetErrors(paths, config, item) {
  const target = item.review.targetBranch?.trim() || gitConfig(config).targetBranch;
  const fixedPoint = item.review.fixedPoint ?? "";
  if (!target) return [`${item.key}: review target branch is missing.`];
  if (!/^[0-9a-f]{40,64}$/i.test(fixedPoint)) {
    return [`${item.key}: review.fixedPoint must be a resolved full commit hash.`];
  }
  const targetRef = runGit(
    paths.root,
    ["rev-parse", "--verify", `refs/heads/${target}^{commit}`],
    true,
  );
  if (targetRef.status !== 0) return [`${item.key}: review target branch ${target} does not resolve.`];
  if (targetRef.stdout.trim().toLowerCase() !== fixedPoint.toLowerCase()) {
    return [`${item.key}: review fixed point is not the current ${target} commit.`];
  }
  return [];
}

function completedEpicReviewErrors(paths, config, item, items = loadItems(paths)) {
  if (item.type !== "epic") return [];

  const errors = [];
  if (item.status !== "done") errors.push(`${item.key}: parent epic is not done.`);
  if (!hasPassingReview(item)) errors.push(`${item.key}: parent epic review did not pass.`);
  else errors.push(...blockingReviewCountErrors(item));
  for (const descendant of descendantsOf(items, item.key)) {
    if (descendant.status !== "done") {
      errors.push(`${item.key}: descendant ${descendant.key} is not done.`);
    }
  }

  const scopeBase = item.review.scopeBase ?? "";
  const fixedPoint = item.review.fixedPoint ?? "";
  if (!/^[0-9a-f]{40,64}$/i.test(scopeBase)) {
    errors.push(`${item.key}: parent epic lacks an integrated review scope base.`);
  }
  if (!/^[0-9a-f]{40,64}$/i.test(fixedPoint)) {
    errors.push(`${item.key}: parent epic lacks a resolved review fixed point.`);
  }
  if (errors.length) return errors;

  const target = gitConfig(config).targetBranch;
  const scope = resolveReviewScope(paths.root, scopeBase);
  const fixedRef = runGit(paths.root, ["rev-parse", "--verify", `${fixedPoint}^{commit}`], true);
  const targetRef = runGit(paths.root, ["rev-parse", "--verify", `${target}^{commit}`], true);
  if (scope.result.status !== 0) errors.push(`${item.key}: parent epic scope base does not resolve.`);
  if (fixedRef.status !== 0) errors.push(`${item.key}: parent epic fixed point does not resolve.`);
  if (targetRef.status !== 0) errors.push(`${item.key}: target branch ${target} does not resolve.`);
  if (errors.length) return errors;

  const resolvedScope = scope.result.stdout.trim();
  const resolvedFixed = fixedRef.stdout.trim();
  const resolvedTarget = targetRef.stdout.trim();
  if (
    !scope.isEmptyTree &&
    runGit(paths.root, ["merge-base", "--is-ancestor", resolvedScope, resolvedFixed], true).status !== 0
  ) {
    errors.push(`${item.key}: parent epic scope base is not an ancestor of its fixed point.`);
  }
  if (runGit(paths.root, ["merge-base", "--is-ancestor", resolvedFixed, resolvedTarget], true).status !== 0) {
    errors.push(`${item.key}: parent epic review is not part of current ${target}.`);
  }
  errors.push(...epicScopeCoverageErrors(paths, item, items, resolvedScope));
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

function validateKnowledge(paths, config) {
  const errors = [];
  if (!existsSync(paths.language)) {
    errors.push(`${paths.language}: required ubiquitous language file is missing. Run setup to refresh the workflow.`);
  }

  function visit(directory) {
    const indexPath = join(directory, "index.md");
    try {
      const expectedIndex = knowledgeIndexContent(directory, paths, config);
      if (!existsSync(indexPath) || readText(indexPath) !== expectedIndex) {
        errors.push(`${indexPath}: generated index is stale. Run sync.`);
      }
    } catch (error) {
      errors.push(`${indexPath}: cannot generate index: ${error instanceof Error ? error.message : String(error)}`);
    }

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
      if (localName === "index.md") continue;

      if (localName === "log.md") {
        if (content.startsWith("# Knowledge Update Log")) {
          errors.push(`${path}: generated knowledge logs are obsolete. Run setup refresh.`);
        }
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
        if (data.type === "UbiquitousLanguage" && path !== paths.language) {
          errors.push(`${path}: UbiquitousLanguage must use docs/knowledge/ubiquitous-language.md.`);
        }
        if (path === paths.language) errors.push(...languageConceptErrors(data, body, path));
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
  errors.push(...validateKnowledge(paths, config));

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

function plannedWrite(path, content) {
  if (existsSync(path) && readText(path) === content) return [];
  return [{ path, content }];
}

function planOfficialSourceMigrations(paths) {
  if (!existsSync(paths.sources)) return [];
  const writes = [];

  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".md") || entry.name === "index.md") continue;

      const content = readText(path);
      const parsed = parseFrontmatter(content);
      if (parsed.format !== "json" || parsed.data.type !== "OfficialSource") continue;

      let changed = false;
      const source = Array.isArray(parsed.data.sources) ? parsed.data.sources[0] : undefined;
      if (source?.title === parsed.data.title) {
        delete source.title;
        changed = true;
      }

      let body = parsed.body.startsWith("\n") ? parsed.body.slice(1) : parsed.body;
      const repeatedApplicability = `# Applicability\n\n${parsed.data.description}\n\n`;
      if (body.startsWith(repeatedApplicability)) {
        body = body.slice(repeatedApplicability.length);
        changed = true;
      }

      if (changed) {
        writes.push({ path, content: renderJsonConcept(parsed.data, body) });
      }
    }
  }

  visit(paths.sources);
  return writes;
}

function planSuccessfulCheckOutputMigrations(paths) {
  if (!existsSync(paths.items)) return { writes: [], items: [] };
  const writes = [];
  const items = [];

  for (const name of readdirSync(paths.items)
    .filter((entry) => entry.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))) {
    const path = join(paths.items, name);
    const item = readJson(path, "work item");
    let changed = false;
    for (const check of Array.isArray(item.checks) ? item.checks : []) {
      if (
        check.status === "pass" &&
        check.lastRun?.exitCode === 0 &&
        Object.hasOwn(check.lastRun, "output")
      ) {
        delete check.lastRun.output;
        changed = true;
      }
    }
    const errors = validateItemShape(item, path);
    if (errors.length) fail(errors.join("\n"));
    items.push(item);
    if (changed) writes.push({ path, content: `${JSON.stringify(item, null, 2)}\n` });
  }

  const hierarchyErrors = validateHierarchy(items);
  if (hierarchyErrors.length) fail(hierarchyErrors.join("\n"));
  return { writes, items };
}

function planOutcomeSuccessMigrations(paths, briefs, releases, items) {
  if (!existsSync(paths.outcomes)) return { writes: [], outcomes: [] };
  const briefsById = new Map(briefs.map((brief) => [brief.id, brief]));
  const writes = [];
  const outcomes = [];

  for (const name of readdirSync(paths.outcomes)
    .filter((entry) => /^OUT-[1-9][0-9]*\.json$/.test(entry))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))) {
    const path = join(paths.outcomes, name);
    const outcome = readJson(path, "outcome");
    let changed = false;

    if (Object.hasOwn(outcome, "success")) {
      const brief = briefsById.get(outcome.brief);
      if (!brief) fail(`${outcome.id}: cannot migrate success data without brief ${outcome.brief}.`);
      for (const field of SUCCESS_FIELDS) {
        if (outcome.success?.[field] !== brief.success[field]) {
          fail(`${outcome.id}: success.${field} conflicts with ${brief.id}; resolve it before setup refresh.`);
        }
      }
      delete outcome.success;
      changed = true;
    }

    const errors = outcomeErrors(outcome, briefs, releases, items);
    if (errors.length) fail(errors.join("\n"));
    outcomes.push(outcome);
    if (changed) writes.push({ path, content: `${JSON.stringify(outcome, null, 2)}\n` });
  }

  return { writes, outcomes };
}

function normalizedConceptBody(body) {
  return (body.startsWith("\n") ? body.slice(1) : body).trimEnd();
}

function planLifecycleConceptMigration(path, type, resource, legacyBody, currentBody) {
  const parsed = parseFrontmatter(readText(path), true);
  if (parsed.data.type !== type) {
    fail(`${path}: cannot migrate ${type} knowledge because its type was changed.`);
  }
  const sources = Array.isArray(parsed.data.sources) ? parsed.data.sources : [];
  const source = sources.find((entry) => entry?.resource === resource);
  if (!source) {
    fail(`${path}: cannot migrate ${type} knowledge without source ${resource}.`);
  }

  const storedBody = normalizedConceptBody(parsed.body);
  const legacy = legacyBody.trimEnd();
  const current = currentBody.trimEnd();
  if (storedBody !== legacy && storedBody !== current) {
    fail(`${path}: generated lifecycle body was customized; resolve it before setup refresh.`);
  }

  if (source.title === parsed.data.title) delete source.title;
  return plannedWrite(path, renderJsonConcept(parsed.data, currentBody));
}

function planLifecycleKnowledgeMigrations(paths, briefs, releases, outcomes) {
  const writes = [];
  const briefsById = new Map(briefs.map((brief) => [brief.id, brief]));
  const releasesById = new Map(releases.map((release) => [release.id, release]));

  for (const release of releases) {
    const path = join(paths.knowledgeReleases, `${release.id.toLowerCase()}.md`);
    if (!existsSync(path)) continue;
    writes.push(
      ...planLifecycleConceptMigration(
        path,
        "Release",
        `urn:project-release:${release.id}`,
        legacyReleaseKnowledgeBody(release),
        releaseKnowledgeBody(release),
      ),
    );
  }

  for (const outcome of outcomes) {
    const path = join(paths.knowledgeOutcomes, `${outcome.id.toLowerCase()}.md`);
    if (!existsSync(path)) continue;
    const brief = briefsById.get(outcome.brief);
    const release = releasesById.get(outcome.release);
    if (!brief || !release) {
      fail(`${outcome.id}: cannot migrate lifecycle knowledge without its brief and release.`);
    }
    writes.push(
      ...planLifecycleConceptMigration(
        path,
        "ProductOutcome",
        `urn:project-outcome:${outcome.id}`,
        legacyOutcomeKnowledgeBody(outcome, brief, release),
        outcomeKnowledgeBody(outcome, brief, release),
      ),
    );
  }

  return writes;
}

function planSetupMigration(paths, config) {
  const workItems = planSuccessfulCheckOutputMigrations(paths);
  const briefs = loadBriefs(paths);
  const releases = loadReleases(paths, workItems.items);
  const outcomeRecords = planOutcomeSuccessMigrations(
    paths,
    briefs,
    releases,
    workItems.items,
  );
  const sourceNotes = planOfficialSourceMigrations(paths);
  const language = plannedWrite(paths.language, refreshedLanguageContent(paths, config));
  const lifecycle = planLifecycleKnowledgeMigrations(
    paths,
    briefs,
    releases,
    outcomeRecords.outcomes,
  );
  const removeLog =
    existsSync(paths.legacyKnowledgeLog) &&
    readText(paths.legacyKnowledgeLog).startsWith("# Knowledge Update Log");

  const writes = [
    ...language,
    ...sourceNotes,
    ...workItems.writes,
    ...outcomeRecords.writes,
    ...lifecycle,
  ];
  const targets = new Set();
  for (const write of writes) {
    if (targets.has(write.path)) fail(`Setup migration planned duplicate writes for ${write.path}.`);
    targets.add(write.path);
  }

  return {
    writes,
    removeLog,
    counts: {
      sourceNotes: sourceNotes.length,
      outcomes: outcomeRecords.writes.length,
      workItems: workItems.writes.length,
      lifecycle: lifecycle.length,
    },
  };
}

function applySetupMigration(paths, plan) {
  for (const write of plan.writes) writeText(write.path, write.content);
  if (plan.removeLog) unlinkSync(paths.legacyKnowledgeLog);
}

function installLocalCli(paths) {
  if (resolve(SCRIPT_PATH) === resolve(paths.cli)) return false;
  mkdirSync(dirname(paths.cli), { recursive: true });
  copyFileSync(SCRIPT_PATH, paths.cli);
  chmodSync(paths.cli, 0o755);
  return true;
}

function reportSetupMigration(plan) {
  if (plan.counts.sourceNotes) {
    console.log(`Removed duplicated fields from ${plan.counts.sourceNotes} official source note(s).`);
  }
  if (plan.counts.outcomes) {
    console.log(`Removed copied success data from ${plan.counts.outcomes} outcome record(s).`);
  }
  if (plan.counts.workItems) {
    console.log(`Removed successful command output from ${plan.counts.workItems} work item(s).`);
  }
  if (plan.counts.lifecycle) {
    console.log(`Removed copied detail from ${plan.counts.lifecycle} lifecycle concept(s).`);
  }
  if (plan.removeLog) {
    console.log("Removed the generated knowledge log. Git retains committed history.");
  }
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
  refreshLanguageFile(paths, config);
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
  const migration = planSetupMigration(paths, config);
  mkdirSync(paths.sources, { recursive: true });
  mkdirSync(paths.knowledgeReleases, { recursive: true });
  mkdirSync(paths.knowledgeOutcomes, { recursive: true });
  mkdirSync(paths.briefs, { recursive: true });
  mkdirSync(paths.releases, { recursive: true });
  mkdirSync(paths.outcomes, { recursive: true });
  const installedCli = installLocalCli(paths);
  if (changed) writeJson(paths.config, config);
  applySetupMigration(paths, migration);
  ensureWorktreeLayout(paths, config);
  syncGeneratedFiles(paths, config);
  reportSetupMigration(migration);
  if (!installedCli) {
    console.log("The project CLI is already running from its installed path.");
    return;
  }
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
  if (parentItem?.status === "done") fail(`Cannot add a child to done parent ${parentItem.key}.`);
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
      scopeBase: null,
      targetBranch: null,
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
  const hierarchyErrors = validateHierarchy([...items, item]);
  if (hierarchyErrors.length) fail(`Work item hierarchy is invalid:\n- ${hierarchyErrors.join("\n- ")}`);
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
    check.status = exitCode === 0 ? "pass" : "fail";
    check.lastRun = { at: now(), exitCode };
    if (exitCode !== 0) {
      const output = boundedOutput(result.stdout, result.stderr || result.error?.message);
      check.lastRun.output = output;
      console.error(output);
      passed = false;
    }
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
  const requestedScopeBase = option(args, "scope-base");
  const requestedTarget = option(args, "target") ?? gitConfig(config).targetBranch;
  const standards = option(args, "standards");
  const spec = option(args, "spec");
  const item = loadItem(paths, key);

  if (!["in-progress", "in-review"].includes(item.status)) {
    fail("Code review may run only while an item is in-progress or in-review.");
  }
  if (!["pending", "pass", "changes-requested"].includes(status)) {
    fail("Review status must be pending, pass, or changes-requested.");
  }
  if (!validGitRefName(requestedTarget)) fail("Review target branch is invalid.");
  if (
    status !== "pending" &&
    (!reviewer?.trim() || !fixedPoint?.trim() || !standards?.trim() || !spec?.trim())
  ) {
    fail("A completed review needs --reviewer, --base, --standards, and --spec.");
  }

  const storedScopeBase = item.review.scopeBase?.trim() || null;
  const suppliedScopeBase = requestedScopeBase?.trim() || null;
  if (
    item.type === "epic" &&
    storedScopeBase &&
    suppliedScopeBase &&
    storedScopeBase.toLowerCase() !== suppliedScopeBase.toLowerCase()
  ) {
    fail(`Epic review scope base is immutable at ${storedScopeBase}.`);
  }
  let scopeBase = suppliedScopeBase;
  if (item.type === "epic") scopeBase = storedScopeBase ?? suppliedScopeBase;
  else if (status !== "pending") scopeBase = fixedPoint?.trim() || null;
  if (scopeBase && !/^[0-9a-f]{40,64}$/i.test(scopeBase)) {
    fail("Review scope base must be a resolved full Git object hash.");
  }
  if (item.type === "epic" && status !== "pending" && !scopeBase) {
    fail("An epic review needs --scope-base from the start of epic delivery.");
  }
  if (status !== "pending" && !/^[0-9a-f]{40,64}$/i.test(fixedPoint ?? "")) {
    fail("Review fixed point must be a resolved full commit hash.");
  }
  if (status !== "pending") {
    const targetRef = runGit(
      paths.root,
      ["rev-parse", "--verify", `refs/heads/${requestedTarget}^{commit}`],
      true,
    );
    if (targetRef.status !== 0) fail(`Review target branch ${requestedTarget} does not resolve.`);
    if (targetRef.stdout.trim().toLowerCase() !== fixedPoint.toLowerCase()) {
      fail(`Review fixed point must equal the current ${requestedTarget} commit.`);
    }
  }

  if (scopeBase) {
    const scope = resolveReviewScope(paths.root, scopeBase);
    if (scope.result.status !== 0) fail("Review scope base does not resolve.");
    if (item.type === "epic") {
      const coverageErrors = epicScopeCoverageErrors(
        paths,
        item,
        loadItems(paths),
        scope.result.stdout.trim(),
      );
      if (coverageErrors.length) fail(`Epic review scope is incomplete:\n- ${coverageErrors.join("\n- ")}`);
    }
    const comparisonRef = status === "pending" ? "HEAD" : fixedPoint;
    if (!scope.isEmptyTree) {
      const containsScope = runGit(
        paths.root,
        ["merge-base", "--is-ancestor", scope.result.stdout.trim(), comparisonRef],
        true,
      );
      if (containsScope.status !== 0) fail("Review scope base is not an ancestor of the reviewed change.");
    }
  }
  if (status !== "pending") {
    const fixedRef = runGit(paths.root, ["rev-parse", "--verify", `${fixedPoint}^{commit}`], true);
    if (fixedRef.status !== 0) fail("Review fixed point does not resolve to a commit.");
    const containsTarget = runGit(
      paths.root,
      ["merge-base", "--is-ancestor", fixedRef.stdout.trim(), "HEAD"],
      true,
    );
    if (containsTarget.status !== 0) fail("Review branch does not contain the current target commit.");
  }

  if (status === "pass") {
    const errors = [];
    errors.push(
      ...blockingReviewCountErrors({
        ...item,
        review: { ...item.review, status, standards, spec },
      }),
    );
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
    const reviewChildren = item.type === "epic" ? descendantsOf(items, item.key) : childrenOf(items, item.key);
    for (const child of reviewChildren) {
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
    scopeBase,
    targetBranch: status === "pending" ? null : requestedTarget,
    standards: status === "pending" ? null : standards,
    spec: status === "pending" ? null : spec,
    reviewedAt: status === "pending" ? null : now(),
  };
  if (status === "changes-requested" && item.status === "in-review") item.status = "in-progress";
  saveItem(paths, item);
  syncGeneratedFiles(paths, config);
  console.log(`Recorded ${status} review for ${key}.`);
}

function languageMutationIdentity(args) {
  return {
    actor: languageTextInput(option(args, "by", true), "Language actor", 120),
    reason: languageTextInput(option(args, "reason", true), "Language change reason", 300),
  };
}

function canonicalLanguageEntry(data, requested) {
  const term = languageTermInput(requested);
  const entry = data.terms.find((candidate) => languageTermKey(candidate.term) === languageTermKey(term));
  if (!entry) fail(`Language term ${term} does not exist.`);
  return entry;
}

function visibleLanguageEntry(data, requested) {
  const term = languageTermInput(requested);
  const canonical = data.terms.find(
    (candidate) => languageTermKey(candidate.term) === languageTermKey(term),
  );
  if (canonical) return { entry: canonical, matchedAlias: null };
  const alias = data.terms.find((candidate) =>
    candidate.aliases.some((value) => languageTermKey(value) === languageTermKey(term)),
  );
  if (!alias) fail(`Language term or alias ${term} does not exist.`);
  return { entry: alias, matchedAlias: term };
}

function saveLanguage(paths, config, data, event) {
  data.terms.sort(compareLanguageEntries);
  data.generated = { by: "process:project-flow", at: event.at };
  data.verified = [{ by: event.by, at: event.at }];
  data.history.push(event);
  const body = languageDocumentBody();
  const errors = languageConceptErrors(data, `\n${body}`, paths.language);
  if (errors.length) fail(errors.join("\n"));
  writeText(paths.language, renderJsonConcept(data, body));
  syncGeneratedFiles(paths, config);
}

function commandLanguageAdd(args, paths, config) {
  requireLanguageMutationLocation(paths, config);
  const data = loadLanguage(paths);
  const term = languageTermInput(option(args, "term", true));
  if (data.terms.some((entry) => languageTermKey(entry.term) === languageTermKey(term))) {
    fail(`Language term ${term} already exists. Use language-update.`);
  }
  const definition = languageTextInput(option(args, "definition", true), "Definition", 500);
  const aliases = languageListInput(options(args, "alias"), "Alias", "term");
  const examples = languageListInput(options(args, "example"), "Example", "text");
  const { actor, reason } = languageMutationIdentity(args);
  const timestamp = now();
  data.terms.push({
    term,
    definition,
    aliases,
    examples,
    status: "active",
    replacement: null,
    updatedAt: timestamp,
    updatedBy: actor,
  });
  saveLanguage(paths, config, data, {
    action: "added",
    term,
    at: timestamp,
    by: actor,
    reason,
  });
  console.log(`Added language term ${term}.`);
}

function commandLanguageUpdate(args, paths, config) {
  requireLanguageMutationLocation(paths, config);
  const data = loadLanguage(paths);
  const entry = canonicalLanguageEntry(data, requiredPositional(args, 1, "canonical language term"));
  if (
    !hasOption(args, "definition") &&
    !hasOption(args, "alias") &&
    !hasOption(args, "example") &&
    !hasOption(args, "replacement")
  ) {
    fail("Change --definition, --alias, --example, or --replacement.");
  }
  const { actor, reason } = languageMutationIdentity(args);
  const previous = {
    definition: entry.definition,
    aliases: [...entry.aliases],
    examples: [...entry.examples],
    replacement: entry.replacement,
  };
  if (hasOption(args, "definition")) {
    entry.definition = languageTextInput(option(args, "definition", true), "Definition", 500);
  }
  if (hasOption(args, "alias")) {
    entry.aliases = languageListInput(options(args, "alias"), "Alias", "term");
  }
  if (hasOption(args, "example")) {
    entry.examples = languageListInput(options(args, "example"), "Example", "text");
  }
  if (hasOption(args, "replacement")) {
    if (entry.status !== "deprecated") {
      fail("Only a deprecated term can have a replacement.");
    }
    const requestedReplacement = option(args, "replacement");
    if (requestedReplacement === undefined) {
      entry.replacement = null;
    } else {
      const replacementEntry = canonicalLanguageEntry(data, requestedReplacement);
      if (replacementEntry === entry) fail("A deprecated term cannot replace itself.");
      if (replacementEntry.status !== "active") fail("A replacement must be an active canonical term.");
      entry.replacement = replacementEntry.term;
    }
  }
  const current = {
    definition: entry.definition,
    aliases: [...entry.aliases],
    examples: [...entry.examples],
    replacement: entry.replacement,
  };
  if (JSON.stringify(current) === JSON.stringify(previous)) {
    fail("The requested language update does not change the term.");
  }
  const timestamp = now();
  entry.updatedAt = timestamp;
  entry.updatedBy = actor;
  saveLanguage(paths, config, data, {
    action: "updated",
    term: entry.term,
    at: timestamp,
    by: actor,
    reason,
    previous,
  });
  console.log(`Updated language term ${entry.term}.`);
}

function commandLanguageDeprecate(args, paths, config) {
  requireLanguageMutationLocation(paths, config);
  const data = loadLanguage(paths);
  const entry = canonicalLanguageEntry(data, requiredPositional(args, 1, "canonical language term"));
  if (entry.status !== "active") fail(`${entry.term} is already deprecated.`);
  const requestedReplacement = option(args, "replacement");
  let replacement = null;
  if (requestedReplacement !== undefined) {
    const replacementEntry = canonicalLanguageEntry(data, requestedReplacement);
    if (replacementEntry === entry) fail("A deprecated term cannot replace itself.");
    if (replacementEntry.status !== "active") fail("A replacement must be an active canonical term.");
    replacement = replacementEntry.term;
  }
  const dependents = data.terms.filter(
    (candidate) =>
      candidate.status === "deprecated" &&
      nonEmptyString(candidate.replacement) &&
      languageTermKey(candidate.replacement) === languageTermKey(entry.term),
  );
  if (dependents.length) {
    fail(`Update these replacement links before deprecating ${entry.term}: ${dependents.map((item) => item.term).join(", ")}.`);
  }
  const { actor, reason } = languageMutationIdentity(args);
  const timestamp = now();
  entry.status = "deprecated";
  entry.replacement = replacement;
  entry.updatedAt = timestamp;
  entry.updatedBy = actor;
  saveLanguage(paths, config, data, {
    action: "deprecated",
    term: entry.term,
    at: timestamp,
    by: actor,
    reason,
    previous: { status: "active", replacement: null },
  });
  console.log(`Deprecated language term ${entry.term}.`);
}

function commandLanguageShow(args, paths) {
  const data = loadLanguage(paths);
  const requested = args.positionals[1];
  if (!requested) {
    console.log(languageDisplay(data).trimEnd());
    return;
  }
  const { entry, matchedAlias } = visibleLanguageEntry(data, requested);
  console.log(
    JSON.stringify(
      {
        ...entry,
        matchedAlias,
        history: data.history.filter(
          (event) => languageTermKey(event.term) === languageTermKey(entry.term),
        ),
      },
      null,
      2,
    ),
  );
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
  const hierarchyErrors = validateHierarchy(items);
  if (hierarchyErrors.length) fail(`Work item hierarchy is invalid:\n- ${hierarchyErrors.join("\n- ")}`);
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
  const committedItems = loadItemsFromCommit(paths.root, commit);
  const committedHierarchyErrors = validateHierarchy(committedItems);
  if (committedHierarchyErrors.length) {
    fail(`Release commit hierarchy is invalid:\n- ${committedHierarchyErrors.join("\n- ")}`);
  }
  assertTicketsInReleaseCommit(committedItems, release.tickets);
  const committedByKey = itemMap(committedItems);
  const nonLeafTickets = release.tickets.filter(
    (key) => committedByKey.get(key)?.type === "epic" || childrenOf(committedItems, key).length > 0,
  );
  if (nonLeafTickets.length) {
    fail(`Release leaf tickets, not parent items: ${nonLeafTickets.join(", ")}.`);
  }
  const parentEpics = [
    ...new Set(
      release.tickets
        .map((key) => ancestorEpicKey(committedByKey.get(key), committedByKey))
        .filter(Boolean),
    ),
  ];
  const parentEpicErrors = parentEpics.flatMap((key) =>
    completedEpicReviewErrors(paths, config, committedByKey.get(key), committedItems),
  );
  if (parentEpicErrors.length) fail(`Parent epic review gate failed:\n- ${parentEpicErrors.join("\n- ")}`);
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
      sources: [{ resource: source }],
      status: "stable",
      generated: { by: actor, at: timestamp },
      verified: [{ by: "process:project-flow", at: timestamp }],
    },
    body,
  );
}

function releaseKnowledgeBody(release) {
  return [
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
  ].join("\n");
}

function legacyReleaseKnowledgeBody(release) {
  const checks = release.checks.map(
    (check) => `- ${check.phase} ${check.name}: ${check.status} — ${check.evidence}`,
  );
  return [
    releaseKnowledgeBody(release),
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
}

function releaseKnowledge(release, actor) {
  return lifecycleConcept(
    "Release",
    `${release.id} ${release.title}`,
    `Verified ${release.kind} to ${release.target.environment}.`,
    ["release", release.kind, release.target.environment],
    actor,
    `urn:project-release:${release.id}`,
    releaseKnowledgeBody(release),
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

function outcomeKnowledgeBody(outcome, brief, release) {
  return [
    "# Observed outcome",
    "",
    `- Brief: ${brief.id}`,
    `- Release: ${release.id}`,
    `- Metric: ${brief.success.metric}`,
    `- Target: ${brief.success.target}`,
    `- Observed: ${outcome.observed}`,
    `- Result: ${outcome.result}`,
    `- Decision: ${outcome.decision}`,
    `- Measured: ${outcome.measuredAt}`,
  ].join("\n");
}

function legacyOutcomeKnowledgeBody(outcome, brief, release) {
  return [
    "# Observed outcome",
    "",
    `- Brief: ${brief.id}`,
    `- Release: ${release.id}`,
    `- Metric: ${brief.success.metric}`,
    `- Baseline: ${brief.success.baseline}`,
    `- Target: ${brief.success.target}`,
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
    outcome.followUpTickets.length
      ? outcome.followUpTickets.map((key) => `- ${key}`).join("\n")
      : "None.",
  ].join("\n");
}

function outcomeKnowledge(outcome, brief, release, actor) {
  return lifecycleConcept(
    "ProductOutcome",
    `${outcome.id} ${brief.title}`,
    `${outcome.result} outcome for ${release.id}.`,
    ["product-outcome", outcome.result, outcome.decision],
    actor,
    `urn:project-outcome:${outcome.id}`,
    outcomeKnowledgeBody(outcome, brief, release),
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

function earliestDescendantReviewBase(paths, item, items) {
  const fixedPoints = [];
  for (const descendant of descendantsOf(items, item.key)) {
    const fixedPoint = descendant.review.fixedPoint;
    if (fixedPoint?.trim().toLowerCase() === "initial tree") {
      fixedPoints.push(emptyTreeHash(paths.root, true));
      continue;
    }
    if (!/^[0-9a-f]{40,64}$/i.test(fixedPoint ?? "")) {
      fail(`Cannot derive ${item.key} scope. ${descendant.key} lacks a resolved review fixed point.`);
    }
    const result = runGit(paths.root, ["rev-parse", "--verify", `${fixedPoint}^{commit}`], true);
    if (result.status !== 0) fail(`${descendant.key} review fixed point does not resolve to a commit.`);
    fixedPoints.push(result.stdout.trim());
  }
  if (!fixedPoints.length) fail(`${item.key} has no reviewed descendants for a legacy epic review.`);

  const emptyTree = emptyTreeHash(paths.root);
  if (fixedPoints.some((fixedPoint) => fixedPoint.toLowerCase() === emptyTree.toLowerCase())) {
    return emptyTree;
  }

  let earliest = fixedPoints[0];
  for (const candidate of fixedPoints.slice(1)) {
    if (runGit(paths.root, ["merge-base", "--is-ancestor", candidate, earliest], true).status === 0) {
      earliest = candidate;
      continue;
    }
    if (runGit(paths.root, ["merge-base", "--is-ancestor", earliest, candidate], true).status !== 0) {
      fail(`${item.key} descendant review fixed points do not share one target history.`);
    }
  }
  return earliest;
}

function commandEpicReviewOpen(args, paths, config) {
  const target = requireTargetBranch(paths, config, "Legacy epic review");
  assertCleanGitWorktree(paths.root, `Target branch ${target}`);
  const key = normalizeKey(requiredPositional(args, 1, "epic key"));
  const items = loadItems(paths);
  const hierarchyErrors = validateHierarchy(items);
  if (hierarchyErrors.length) fail(`Work item hierarchy is invalid:\n- ${hierarchyErrors.join("\n- ")}`);
  const item = items.find((entry) => entry.key === key);
  if (!item) fail(`Work item ${key} does not exist.`);
  if (item.type !== "epic") fail(`${key} is not an epic.`);
  if (item.status !== "done") fail(`${key} must be a legacy done epic.`);
  if (item.review.scopeBase?.trim()) fail(`${key} already has integrated epic review evidence.`);
  const openDescendants = descendantsOf(items, key).filter((child) => child.status !== "done");
  if (openDescendants.length) {
    fail(`Cannot reopen ${key}. Open descendants: ${openDescendants.map((child) => child.key).join(", ")}.`);
  }

  const targetRef = runGit(paths.root, ["rev-parse", "--verify", `${target}^{commit}`]).stdout.trim();
  const scopeBase = earliestDescendantReviewBase(paths, item, items);
  const scope = resolveReviewScope(paths.root, scopeBase);
  if (scope.result.status !== 0) fail(`${key} derived scope base does not resolve.`);
  if (
    !scope.isEmptyTree &&
    runGit(paths.root, ["merge-base", "--is-ancestor", scopeBase, targetRef], true).status !== 0
  ) {
    fail(`${key} derived scope base is not an ancestor of ${target}.`);
  }

  item.status = "in-progress";
  item.resolution = null;
  item.completedAt = null;
  item.review = {
    status: "pending",
    reviewer: null,
    fixedPoint: null,
    scopeBase,
    targetBranch: null,
    standards: null,
    spec: null,
    reviewedAt: null,
  };
  saveItem(paths, item);
  syncGeneratedFiles(paths, config, items);
  console.log(`Reopened ${key} for integrated epic review from ${scopeBase}.`);
}

function commandComplete(args, paths, config) {
  const key = normalizeKey(requiredPositional(args, 1, "work item key"));
  const items = loadItems(paths);
  const item = items.find((entry) => entry.key === key);
  if (!item) fail(`Work item ${key} does not exist.`);
  const errors = greenGateErrors(paths, item, items);
  if (errors.length === 0) errors.push(...reviewTargetErrors(paths, config, item));
  if (errors.length === 0) errors.push(...epicReviewScopeErrors(paths, item));
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
  const epicReview = hasOption(args, "epic-review");

  requireGitRepositoryRoot(paths.root);
  if (currentGitBranch(paths.root) !== target) {
    fail(`Create ticket worktrees from the checked-out target branch ${target}.`);
  }
  assertCleanGitWorktree(paths.root, `Target branch ${target}`);
  const byKey = itemMap(items);
  if (item.type === "epic") {
    if (!epicReview) fail("Use --epic-review for an epic after every child ticket is done.");
    if (item.status !== "in-progress") fail(`${key} must be in-progress before its final epic review.`);
    const openDescendants = descendantsOf(items, key).filter((child) => child.status !== "done");
    if (openDescendants.length) {
      fail(`Cannot review ${key}. Open descendants: ${openDescendants.map((child) => child.key).join(", ")}.`);
    }
    if (!item.review.scopeBase?.trim()) {
      fail(`${key} needs a recorded review scope base before creating its epic review worktree.`);
    }
  } else {
    if (epicReview) fail("--epic-review applies only to an epic.");
    if (item.status !== "ready") fail(`${key} must be ready before creating its worktree.`);
    const parentEpicKey = ancestorEpicKey(item, byKey);
    if (parentEpicKey) {
      const parentEpic = byKey.get(parentEpicKey);
      if (parentEpic.status !== "in-progress" || !parentEpic.review.scopeBase?.trim()) {
        fail(`Start or resume parent epic ${parentEpicKey} before implementing ${key}.`);
      }
    }
  }

  const openBlockers = item.links.blockedBy.filter((blocker) => byKey.get(blocker)?.status !== "done");
  if (openBlockers.length) {
    fail(`Cannot implement ${key}. Open blockers: ${openBlockers.join(", ")}.`);
  }

  const targetRef = runGit(paths.root, ["rev-parse", "--verify", `${target}^{commit}`], true);
  if (targetRef.status !== 0) fail(`Target branch ${target} does not resolve to a commit.`);
  if (item.type === "epic") {
    const scope = resolveReviewScope(paths.root, item.review.scopeBase);
    if (scope.result.status !== 0) fail(`${key} review.scopeBase does not resolve.`);
    const coverageErrors = epicScopeCoverageErrors(paths, item, items, scope.result.stdout.trim());
    if (coverageErrors.length) fail(`Epic review scope is incomplete:\n- ${coverageErrors.join("\n- ")}`);
    if (!scope.isEmptyTree) {
      const containsScope = runGit(
        paths.root,
        ["merge-base", "--is-ancestor", scope.result.stdout.trim(), targetRef.stdout.trim()],
        true,
      );
      if (containsScope.status !== 0) fail(`${key} review.scopeBase is not an ancestor of ${target}.`);
    }
  }

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
  if (item.review.targetBranch && item.review.targetBranch !== target) {
    fail(`${key} was reviewed for ${item.review.targetBranch}, not ${target}.`);
  }
  const epicScopeErrors = epicReviewScopeErrors(worktreePaths, item);
  if (epicScopeErrors.length) fail(`Epic review scope failed:\n- ${epicScopeErrors.join("\n- ")}`);
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
  project-flow.mjs language-add --term TERM --definition TEXT --by ACTOR --reason TEXT [options]
  project-flow.mjs language-update TERM --by ACTOR --reason TEXT [options]
  project-flow.mjs language-deprecate TERM --by ACTOR --reason TEXT [--replacement TERM]
  project-flow.mjs language-show [TERM]
  project-flow.mjs source-add --target PATH --title TEXT --publisher TEXT [options]
  project-flow.mjs brief-create --title TEXT --problem TEXT --outcome TEXT [options]
  project-flow.mjs brief-confirm BRIEF-N --by ACTOR
  project-flow.mjs brief-show BRIEF-N
  project-flow.mjs knowledge-template KEY --target PATH --action create|update [options]
  project-flow.mjs complete KEY
  project-flow.mjs epic-review-open KEY
  project-flow.mjs worktree-add KEY [--branch-type TYPE] [--base BRANCH] [--epic-review]
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
  --base REF                    Current target commit for the review branch.
  --scope-base REF              Start of the complete epic delivery range.
  --target BRANCH               Reviewed target; defaults to the configured branch.
  --standards TEXT              Independent Standards result.
  --spec TEXT                   Independent Spec result.

Language options:
  --alias TERM                  Repeat accepted aliases. Prefer the canonical term.
  --example TEXT                Repeat examples of correct usage.
  --replacement TERM           Change a deprecated term's active replacement.
  language-update replaces an array when its option is present.
  Pass --alias, --example, or --replacement without a value to clear it.
  Deprecate obsolete terms. Language terms are never deleted.

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
  Epics use one final review worktree after every descendant ticket is done.
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
    case "language-add":
      commandLanguageAdd(args, paths, config);
      return true;
    case "language-update":
      commandLanguageUpdate(args, paths, config);
      return true;
    case "language-deprecate":
      commandLanguageDeprecate(args, paths, config);
      return true;
    case "language-show":
      commandLanguageShow(args, paths);
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
    case "epic-review-open":
      commandEpicReviewOpen(args, paths, config);
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
