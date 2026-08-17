#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = resolve(SCRIPT_DIRECTORY, "..", "..", "..");
const RULES_ROOT = join(REPOSITORY_ROOT, "agent-rules");

const RULE_CATALOG = Object.freeze([
  { name: "plain-english", recommendedScope: "user" },
  { name: "official-sources", recommendedScope: "user" },
  { name: "project-evidence", recommendedScope: "project" },
  { name: "ubiquitous-language", recommendedScope: "project" },
  { name: "ticket-git-workflow", recommendedScope: "project" },
  { name: "code-quality", recommendedScope: "project" },
  { name: "comments", recommendedScope: "project" },
  { name: "testing", recommendedScope: "project" },
  { name: "review-policy", recommendedScope: "project" },
]);

const RULE_ORDER = new Map(RULE_CATALOG.map((rule, index) => [rule.name, index]));
const RULE_NAMES = new Set(RULE_CATALOG.map((rule) => rule.name));
const RULE_BY_NAME = new Map(RULE_CATALOG.map((rule) => [rule.name, rule]));
const START_PATTERN = /^<!-- agent-rule:([a-z0-9]+(?:-[a-z0-9]+)*):start sha256=([a-f0-9]{64}) -->$/;
const END_PATTERN = /^<!-- agent-rule:([a-z0-9]+(?:-[a-z0-9]+)*):end -->$/;
const MARKER_PATTERN = /^<!--\s*agent-rule:/;

function fail(message) {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}

function usage() {
  process.stdout.write(`Usage:
  manage-rules.mjs list
  manage-rules.mjs install --scope project|user [options]
  manage-rules.mjs check --scope project|user [options]

Options:
  --root PATH        Project root. Defaults to the current directory.
  --codex-home PATH  Codex home for user scope. Defaults to CODEX_HOME or ~/.codex.
  --rule NAME        Select one rule. Repeat for more rules.
  --all              Select every rule.
  --dry-run          Show an install without writing.
  -h, --help         Show this help.

Without --rule or --all, the recommended profile for the scope is selected.
`);
}

function requireValue(arguments_, index, option) {
  const value = arguments_[index + 1];
  if (!value || value.startsWith("--")) {
    fail(`${option} requires a value.`);
  }
  return value;
}

function parseArguments(arguments_) {
  if (arguments_.length === 0 || arguments_.includes("-h") || arguments_.includes("--help")) {
    usage();
    process.exit(0);
  }

  const action = arguments_[0];
  if (!["list", "install", "check"].includes(action)) {
    fail(`Unknown action: ${action}`);
  }

  const options = {
    action,
    all: false,
    codexHome: undefined,
    dryRun: false,
    root: process.cwd(),
    rootProvided: false,
    rules: [],
    scope: undefined,
  };

  for (let index = 1; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    switch (argument) {
      case "--scope":
        options.scope = requireValue(arguments_, index, argument);
        index += 1;
        break;
      case "--root":
        options.root = requireValue(arguments_, index, argument);
        options.rootProvided = true;
        index += 1;
        break;
      case "--codex-home":
        options.codexHome = requireValue(arguments_, index, argument);
        index += 1;
        break;
      case "--rule":
        options.rules.push(requireValue(arguments_, index, argument));
        index += 1;
        break;
      case "--all":
        if (options.all) fail("--all may be provided only once.");
        options.all = true;
        break;
      case "--dry-run":
        if (options.dryRun) fail("--dry-run may be provided only once.");
        options.dryRun = true;
        break;
      default:
        fail(`Unknown option: ${argument}`);
    }
  }

  if (action === "list") {
    if (arguments_.length !== 1) fail("list does not accept options.");
    return options;
  }

  if (!["project", "user"].includes(options.scope)) {
    fail("--scope must be project or user.");
  }
  if (options.all && options.rules.length > 0) {
    fail("Use --all or --rule, not both.");
  }
  if (action === "check" && options.dryRun) {
    fail("--dry-run is available only for install.");
  }
  if (options.scope === "project" && options.codexHome) {
    fail("--codex-home is available only for user scope.");
  }
  if (options.scope === "user" && options.rootProvided) {
    fail("--root is available only for project scope.");
  }

  const duplicates = options.rules.filter((rule, index) => options.rules.indexOf(rule) !== index);
  if (duplicates.length > 0) {
    fail(`Duplicate --rule value: ${duplicates[0]}`);
  }

  return options;
}

function verifyCatalog() {
  if (!existsSync(RULES_ROOT)) {
    fail(`Rule directory does not exist: ${RULES_ROOT}`);
  }

  const rootMarkdown = readdirSync(RULES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
  if (rootMarkdown.length > 0) {
    fail("Place every rule inside agent-rules/project or agent-rules/user.");
  }

  const diskRules = ["project", "user"].flatMap((scope) => {
    const directory = join(RULES_ROOT, scope);
    if (!existsSync(directory)) fail(`Rule scope directory does not exist: ${directory}`);
    return readdirSync(directory)
      .filter((name) => name.endsWith(".md"))
      .map((name) => `${scope}/${name}`);
  }).sort();
  const catalogRules = RULE_CATALOG
    .map((rule) => `${rule.recommendedScope}/${rule.name}.md`)
    .sort();
  if (JSON.stringify(diskRules) !== JSON.stringify(catalogRules)) {
    fail("The rule catalog and agent-rules directory do not match.");
  }
}

function listRules() {
  for (const rule of RULE_CATALOG) {
    process.stdout.write(`${rule.name}\trecommended=${rule.recommendedScope}\n`);
  }
}

function selectRules(options) {
  const selected = options.all
    ? RULE_CATALOG.map((rule) => rule.name)
    : options.rules.length > 0
      ? options.rules
      : RULE_CATALOG
          .filter((rule) => rule.recommendedScope === options.scope)
          .map((rule) => rule.name);

  for (const name of selected) {
    if (!RULE_NAMES.has(name)) fail(`Unknown rule: ${name}`);
  }

  return [...selected].sort((left, right) => RULE_ORDER.get(left) - RULE_ORDER.get(right));
}

function normalize(content) {
  return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function detectLineEnding(content) {
  const withoutCrLf = content.replaceAll("\r\n", "");
  if (withoutCrLf.includes("\r")) {
    fail("AGENTS.md uses unsupported carriage-return line endings.");
  }
  if (content.includes("\r\n") && withoutCrLf.includes("\n")) {
    fail("AGENTS.md uses mixed line endings.");
  }
  return content.includes("\r\n") ? "\r\n" : "\n";
}

function demoteHeadings(content) {
  let inFence = false;
  return content.split("\n").map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;
    return line.replace(/^(#{1,5})(?=\s)/, "$1#");
  }).join("\n");
}

function renderRule(name) {
  const rule = RULE_BY_NAME.get(name);
  if (!rule) fail(`Unknown rule: ${name}`);
  const path = join(RULES_ROOT, rule.recommendedScope, `${name}.md`);
  const content = demoteHeadings(normalize(readFileSync(path, "utf8")).trim());
  const digest = createHash("sha256").update(content, "utf8").digest("hex");
  const start = `<!-- agent-rule:${name}:start sha256=${digest} -->`;
  const end = `<!-- agent-rule:${name}:end -->`;
  return { content, digest, block: `${start}\n${content}\n${end}` };
}

function parseBlocks(content) {
  const lines = normalize(content).split("\n");
  const blocks = new Map();
  let open;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const start = line.match(START_PATTERN);
    const end = line.match(END_PATTERN);

    if (MARKER_PATTERN.test(line) && !start && !end) {
      fail(`Malformed agent-rule marker on line ${index + 1}.`);
    }

    if (start) {
      if (open) fail(`Nested agent-rule block on line ${index + 1}.`);
      if (blocks.has(start[1])) fail(`Duplicate agent-rule block: ${start[1]}`);
      open = { name: start[1], digest: start[2], start: index };
      continue;
    }

    if (end) {
      if (!open) fail(`Agent-rule end marker has no start on line ${index + 1}.`);
      if (open.name !== end[1]) {
        fail(`Agent-rule end marker ${end[1]} does not match ${open.name}.`);
      }
      blocks.set(open.name, {
        digest: open.digest,
        start: open.start,
        end: index,
        content: lines.slice(open.start + 1, index).join("\n"),
      });
      open = undefined;
    }
  }

  if (open) fail(`Agent-rule block has no end marker: ${open.name}`);
  return { blocks, lines };
}

function validateKnownBlocks(blocks) {
  for (const name of blocks.keys()) {
    if (!RULE_NAMES.has(name)) fail(`Managed block has no local rule source: ${name}`);
  }
}

function validateBlocks(content, requiredRules) {
  const { blocks } = parseBlocks(content);
  validateKnownBlocks(blocks);

  for (const name of requiredRules) {
    if (!blocks.has(name)) fail(`Required agent-rule block is missing: ${name}`);
  }

  for (const [name, block] of blocks) {
    const expected = renderRule(name);
    if (block.digest !== expected.digest) {
      fail(`Agent-rule digest is stale or invalid: ${name}`);
    }
    if (block.content !== expected.content) {
      fail(`Agent-rule content differs from its source: ${name}`);
    }
  }

  return blocks;
}

function appendBlock(content, block) {
  if (content.length === 0) return `${block}\n`;
  if (content.endsWith("\n\n")) return `${content}${block}\n`;
  if (content.endsWith("\n")) return `${content}\n${block}\n`;
  return `${content}\n\n${block}\n`;
}

function installBlocks(originalContent, selectedRules) {
  let content = normalize(originalContent);
  const initial = parseBlocks(content);
  validateKnownBlocks(initial.blocks);

  const namesToUpdate = new Set([...selectedRules, ...initial.blocks.keys()]);
  const orderedNames = [...namesToUpdate]
    .sort((left, right) => RULE_ORDER.get(left) - RULE_ORDER.get(right));

  for (const name of orderedNames) {
    const expected = renderRule(name);
    const parsed = parseBlocks(content);
    const existing = parsed.blocks.get(name);
    if (!existing) {
      content = appendBlock(content, expected.block);
      continue;
    }

    parsed.lines.splice(existing.start, existing.end - existing.start + 1, ...expected.block.split("\n"));
    content = parsed.lines.join("\n");
  }

  validateBlocks(content, selectedRules);
  return content;
}

function resolveTarget(options) {
  if (options.scope === "project") {
    return join(resolve(options.root), "AGENTS.md");
  }
  const codexHome = resolve(options.codexHome ?? process.env.CODEX_HOME ?? join(homedir(), ".codex"));
  return join(codexHome, "AGENTS.md");
}

function checkTargetSafety(target) {
  if (existsSync(target) && lstatSync(target).isSymbolicLink()) {
    fail(`Refusing to write through symlinked AGENTS.md: ${target}`);
  }

  const override = join(dirname(target), "AGENTS.override.md");
  if (existsSync(override) && readFileSync(override, "utf8").trim().length > 0) {
    fail(`AGENTS.override.md takes precedence over the managed file: ${override}`);
  }
}

function writeAtomic(target, content) {
  mkdirSync(dirname(target), { recursive: true });
  const temporary = join(dirname(target), `.${basename(target)}.${process.pid}.tmp`);
  const mode = existsSync(target) ? statSync(target).mode & 0o777 : 0o644;
  writeFileSync(temporary, content, { encoding: "utf8", mode });
  chmodSync(temporary, mode);
  renameSync(temporary, target);
}

function reportCheck(target, blocks, selectedRules) {
  process.stdout.write(`Target: ${target}\n`);
  for (const name of selectedRules) {
    process.stdout.write(`Pass: ${name} sha256=${blocks.get(name).digest}\n`);
  }
  process.stdout.write("Check: pass\n");
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  verifyCatalog();

  if (options.action === "list") {
    listRules();
    return;
  }

  const selectedRules = selectRules(options);
  const target = resolveTarget(options);
  checkTargetSafety(target);

  if (options.action === "check") {
    if (!existsSync(target)) fail(`AGENTS.md does not exist: ${target}`);
    const content = readFileSync(target, "utf8");
    const blocks = validateBlocks(content, selectedRules);
    reportCheck(target, blocks, selectedRules);
    return;
  }

  const originalContent = existsSync(target) ? readFileSync(target, "utf8") : "";
  const lineEnding = detectLineEnding(originalContent);
  const normalizedContent = installBlocks(originalContent, selectedRules);
  const installedContent = lineEnding === "\r\n"
    ? normalizedContent.replaceAll("\n", "\r\n")
    : normalizedContent;
  const changed = installedContent !== originalContent;

  if (options.dryRun) {
    process.stdout.write(`${changed ? "Would update" : "Unchanged"}: ${target}\n`);
    process.stdout.write(`Rules: ${selectedRules.join(", ")}\n`);
    return;
  }

  if (changed) writeAtomic(target, installedContent);
  const blocks = validateBlocks(normalizedContent, selectedRules);
  process.stdout.write(`${changed ? "Updated" : "Unchanged"}: ${target}\n`);
  reportCheck(target, blocks, selectedRules);
}

main();
