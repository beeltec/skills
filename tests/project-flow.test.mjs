import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readlinkSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import test from "node:test";

const CLI = resolve("skills/setup/scripts/project-flow.mjs");
const EXAMPLE_ROOT = resolve("examples/next-sqlite");
const [NODE_MAJOR, NODE_MINOR] = process.versions.node.split(".").map(Number);
const SUPPORTS_EXAMPLE = NODE_MAJOR > 24 || (NODE_MAJOR === 24 && NODE_MINOR >= 15);

function run(root, arguments_, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [CLI, ...arguments_, "--root", root], {
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    expectedStatus,
    `Command failed: ${arguments_.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

function git(root, arguments_, expectedStatus = 0) {
  const result = spawnSync("git", arguments_, { cwd: root, encoding: "utf8" });
  assert.equal(
    result.status,
    expectedStatus,
    `Git command failed: git ${arguments_.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

function runProgram(root, command, arguments_, expectedStatus = 0) {
  const result = spawnSync(command, arguments_, {
    cwd: root,
    encoding: "utf8",
    timeout: 180000,
    maxBuffer: 10 * 1024 * 1024,
  });
  assert.equal(
    result.status,
    expectedStatus,
    `Command failed: ${command} ${arguments_.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

function runInstalled(root, arguments_, expectedStatus = 0) {
  return runProgram(
    root,
    process.execPath,
    [join(root, ".project", "bin", "project-flow.mjs"), ...arguments_],
    expectedStatus,
  );
}

function copyExampleProject(target) {
  const excluded = new Set([".next", ".woktrees", "data", "node_modules"]);
  cpSync(EXAMPLE_ROOT, target, {
    recursive: true,
    filter(source) {
      const local = relative(EXAMPLE_ROOT, source);
      if (!local) return true;
      return !excluded.has(local.split(sep)[0]);
    },
  });

  runProgram(target, "npm", ["ci", "--prefer-offline", "--no-audit", "--no-fund"]);
}

function directorySha256(directory) {
  const hash = createHash("sha256");

  function visit(current) {
    const entries = readdirSync(current, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const path = join(current, entry.name);
      const local = relative(directory, path).split(sep).join("/");
      if (entry.isDirectory()) {
        hash.update(`directory\0${local}\0`);
        visit(path);
      } else if (entry.isFile()) {
        hash.update(`file\0${local}\0`);
        hash.update(readFileSync(path));
      } else if (entry.isSymbolicLink()) {
        hash.update(`symlink\0${local}\0${readlinkSync(path)}\0`);
      }
    }
  }

  visit(directory);
  return hash.digest("hex");
}

function availablePort() {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();
    server.once("error", rejectPort);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        rejectPort(new Error("Could not allocate a local test port."));
        return;
      }
      server.close((error) => {
        if (error) rejectPort(error);
        else resolvePort(address.port);
      });
    });
  });
}

async function waitForPage(url, child, output) {
  let lastError = "No response.";
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js stopped before the smoke check.\n${output()}`);
    }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.status === 200) return response.text();
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error(`Next.js did not become ready: ${lastError}\n${output()}`);
}

async function stopChild(child) {
  if (child.exitCode !== null) return;
  const exited = once(child, "exit");
  child.kill("SIGTERM");
  const timeout = new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5000));
  await Promise.race([exited, timeout]);
  if (child.exitCode === null) {
    child.kill("SIGKILL");
    await once(child, "exit");
  }
}

function readItem(root, key) {
  return JSON.parse(readFileSync(join(root, "docs", "work", "items", `${key}.json`), "utf8"));
}

function readLanguage(root) {
  const content = readFileSync(
    join(root, "docs", "knowledge", "ubiquitous-language.md"),
    "utf8",
  );
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(match, "The ubiquitous language file needs JSON frontmatter.");
  return { data: JSON.parse(match[1]), body: match[2] };
}

function createConfirmedBrief(root) {
  run(root, [
    "brief-create",
    "--title",
    "Validated task need",
    "--problem",
    "Users need a reliable way to retain a task.",
    "--user",
    "A person tracking personal work.",
    "--evidence",
    "Fixture interviews found lost tasks after restarts.",
    "--outcome",
    "Users retain and complete saved tasks.",
    "--accept",
    "A saved task remains after a restart.",
    "--metric",
    "Retained task completion rate",
    "--baseline",
    "0 percent",
    "--target",
    "60 percent",
    "--window",
    "14 days",
    "--data-source",
    "Fixture analytics report",
  ]);
  run(root, ["brief-confirm", "BRIEF-1", "--by", "human:test-owner"]);
  return "BRIEF-1";
}

function replaceCandidateText(root, key, target, text) {
  const path = join(root, "docs", "work", "drafts", key, ...target.split("/"));
  const content = readFileSync(path, "utf8");
  writeFileSync(
    path,
    content.replace("Replace this text with facts verified by the completed work item.", text),
    "utf8",
  );
}

test("completes a hierarchy and promotes knowledge", (context) => {
  const root = mkdtempSync(join(tmpdir(), "project-flow-success-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));

  run(root, ["init", "--key", "FLOW", "--name", "Flow Example"]);
  assert.ok(existsSync(join(root, "docs", "knowledge", "index.md")));
  assert.ok(existsSync(join(root, "docs", "knowledge", "ubiquitous-language.md")));
  assert.ok(existsSync(join(root, "docs", "knowledge", "sources", "index.md")));
  assert.ok(existsSync(join(root, "docs", "knowledge", "releases")));
  assert.ok(existsSync(join(root, "docs", "knowledge", "outcomes")));
  assert.ok(existsSync(join(root, "docs", "work", "board.md")));
  assert.ok(existsSync(join(root, "docs", "work", "briefs", "index.md")));
  assert.ok(existsSync(join(root, "docs", "work", "releases", "index.md")));
  assert.ok(existsSync(join(root, "docs", "work", "outcomes", "index.md")));
  assert.ok(existsSync(join(root, ".project", "bin", "project-flow.mjs")));
  const config = JSON.parse(readFileSync(join(root, ".project", "workflow.json"), "utf8"));
  assert.deepEqual(config.git, {
    targetBranch: "main",
    worktreeDirectory: ".woktrees",
    mergeStrategy: "no-ff",
    branchConvention: "conventional-branch@1.1.0",
    commitConvention: "conventional-commits@1.0.0",
  });
  assert.ok(existsSync(join(root, ".woktrees")));
  assert.match(readFileSync(join(root, ".gitignore"), "utf8"), /^\/\.woktrees\/$/m);
  assert.ok(
    config.definitionOfDone.includes(
      "Relevant external claims cite refreshed official source notes.",
    ),
  );
  assert.ok(
    config.definitionOfDone.includes(
      "Standards and Spec report zero P0, P1, and P2 findings with separate evidence.",
    ),
  );
  assert.ok(
    config.definitionOfDone.includes(
      "Applicable risk-driven quality gates have passing evidence.",
    ),
  );

  const brief = createConfirmedBrief(root);

  run(root, [
    "create",
    "--type",
    "epic",
    "--brief",
    brief,
    "--summary",
    "Provide task tracking",
    "--description",
    "Deliver the complete task workflow.",
    "--accept",
    "The task workflow is available.",
  ]);
  run(root, [
    "create",
    "--type",
    "story",
    "--parent",
    "FLOW-1",
    "--summary",
    "Persist tasks",
    "--description",
    "As a user, I want tasks to survive reloads.",
    "--accept",
    "Tasks persist in SQLite.",
    "--check",
    'Unit tests::node -e "process.exit(0)"',
  ]);
  run(root, [
    "create",
    "--type",
    "subtask",
    "--parent",
    "FLOW-2",
    "--summary",
    "Create the schema",
    "--description",
    "Create the tasks table.",
  ]);

  run(root, ["create", "--type", "subtask", "--parent", "FLOW-1", "--summary", "Invalid"], 1);

  run(root, ["transition", "FLOW-3", "ready"]);
  run(root, ["transition", "FLOW-3", "in-progress"]);
  run(root, [
    "review",
    "FLOW-3",
    "--status",
    "pass",
    "--reviewer",
    "agent/test",
    "--base",
    "initial tree",
    "--standards",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
    "--spec",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
  ]);
  run(root, ["transition", "FLOW-3", "in-review"]);
  run(root, ["complete", "FLOW-3"]);

  run(root, ["transition", "FLOW-2", "ready"]);
  run(root, ["transition", "FLOW-2", "in-progress"]);
  run(root, ["verify", "FLOW-2"]);
  run(root, [
    "accept",
    "FLOW-2",
    "AC-1",
    "--status",
    "pass",
    "--evidence",
    "A focused storage test passes.",
  ]);
  run(root, [
    "review",
    "FLOW-2",
    "--status",
    "pass",
    "--reviewer",
    "agent/test",
    "--base",
    "initial tree",
    "--standards",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
    "--spec",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
  ]);
  run(root, ["transition", "FLOW-2", "in-review"]);
  run(root, [
    "knowledge-template",
    "FLOW-2",
    "--target",
    "architecture/task-storage.md",
    "--action",
    "create",
    "--type",
    "Architecture",
    "--title",
    "Task storage",
    "--description",
    "Tasks persist in a local SQLite database.",
    "--tag",
    "sqlite",
  ]);
  replaceCandidateText(root, "FLOW-2", "architecture/task-storage.md", "Tasks use the local SQLite tasks table.");
  run(root, ["complete", "FLOW-2"]);

  const story = readItem(root, "FLOW-2");
  assert.equal(story.status, "done");
  assert.equal(story.resolution, "done");
  assert.equal(story.promotions.length, 1);
  assert.equal(story.knowledgeChanges.length, 0);
  assert.equal(story.review.fixedPoint, "initial tree");
  assert.equal(story.review.standards, "Pass. P0:0 P1:0 P2:0 P3:0.");
  assert.equal(story.review.spec, "Pass. P0:0 P1:0 P2:0 P3:0.");
  const storyKnowledge = readFileSync(
    join(root, "docs", "knowledge", "architecture", "task-storage.md"),
    "utf8",
  );
  assert.match(storyKnowledge, /"status": "stable"/);
  assert.match(storyKnowledge, /"by": "process:project-flow"/);

  run(root, ["transition", "FLOW-1", "ready"]);
  run(root, ["transition", "FLOW-1", "in-progress"]);
  run(root, [
    "accept",
    "FLOW-1",
    "AC-1",
    "--status",
    "pass",
    "--evidence",
    "FLOW-2 delivered task persistence.",
  ]);
  run(root, [
    "review",
    "FLOW-1",
    "--status",
    "pass",
    "--reviewer",
    "agent/test",
    "--base",
    "initial tree",
    "--standards",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
    "--spec",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
  ]);
  run(root, ["transition", "FLOW-1", "in-review"]);
  run(root, [
    "knowledge-template",
    "FLOW-1",
    "--target",
    "features/task-tracking.md",
    "--action",
    "create",
    "--type",
    "Feature",
    "--title",
    "Task tracking",
    "--description",
    "The application provides persistent task tracking.",
  ]);
  replaceCandidateText(root, "FLOW-1", "features/task-tracking.md", "Users can create and retain tasks.");
  run(root, ["complete", "FLOW-1"]);
  run(root, ["validate"]);

  assert.equal(readItem(root, "FLOW-1").status, "done");
  assert.match(
    readFileSync(join(root, "docs", "knowledge", "index.md"), "utf8"),
    /okf_version: "0.2"/,
  );
  assert.match(readFileSync(join(root, "docs", "work", "board.md"), "utf8"), /Done \(3\)/);
});

test("records and refreshes official source notes", (context) => {
  const root = mkdtempSync(join(tmpdir(), "project-flow-source-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));

  run(root, ["init", "--key", "SRC", "--name", "Source Example"]);
  const configPath = join(root, ".project", "workflow.json");
  const legacyConfig = JSON.parse(readFileSync(configPath, "utf8"));
  rmSync(join(root, "docs", "knowledge", "ubiquitous-language.md"));
  delete legacyConfig.git;
  legacyConfig.definitionOfDone = legacyConfig.definitionOfDone.filter(
    (entry) => entry !== "Relevant external claims cite refreshed official source notes.",
  );
  writeFileSync(configPath, `${JSON.stringify(legacyConfig, null, 2)}\n`, "utf8");
  run(root, ["install"]);
  const refreshedConfig = JSON.parse(readFileSync(configPath, "utf8"));
  assert.ok(
    refreshedConfig.definitionOfDone.includes(
      "Relevant external claims cite refreshed official source notes.",
    ),
  );
  assert.equal(refreshedConfig.git.targetBranch, "main");
  assert.equal(refreshedConfig.git.worktreeDirectory, ".woktrees");
  const languagePath = join(root, "docs", "knowledge", "ubiquitous-language.md");
  assert.ok(existsSync(languagePath));

  writeFileSync(languagePath, readFileSync(languagePath, "utf8").replace("No active terms yet.", "Stale body."));
  assert.match(run(root, ["validate"], 1).stderr, /generated body is stale/);
  run(root, ["install"]);
  assert.match(readFileSync(languagePath, "utf8"), /No active terms yet/);
  run(root, ["validate"]);

  const addArguments = [
    "source-add",
    "--target",
    "runtimes/node-sqlite.md",
    "--title",
    "Node.js SQLite API",
    "--publisher",
    "Node.js",
    "--url",
    "https://nodejs.org/api/sqlite.html",
    "--version",
    "24",
    "--scope",
    "The local task store.",
    "--claim",
    "DatabaseSync exposes synchronous SQLite operations.",
    "--tag",
    "node",
  ];

  run(root, addArguments);
  const notePath = join(
    root,
    "docs",
    "knowledge",
    "sources",
    "runtimes",
    "node-sqlite.md",
  );
  const note = readFileSync(notePath, "utf8");
  assert.match(note, /"type": "OfficialSource"/);
  assert.match(note, /"resource": "https:\/\/nodejs\.org\/api\/sqlite\.html"/);
  assert.match(note, /"version": "24"/);
  assert.match(note, /# Verified claims/);
  assert.match(note, /DatabaseSync exposes synchronous SQLite operations/);
  assert.match(
    readFileSync(join(root, "docs", "knowledge", "sources", "runtimes", "index.md"), "utf8"),
    /Node\.js SQLite API/,
  );

  const duplicate = run(root, addArguments, 1);
  assert.match(duplicate.stderr, /Re-open the page, then use --force/);

  const insecure = run(root, [
    "source-add",
    "--target",
    "invalid.md",
    "--title",
    "Invalid",
    "--publisher",
    "Example",
    "--url",
    "http://example.com/docs",
    "--scope",
    "Invalid source.",
    "--claim",
    "This should fail.",
  ], 1);
  assert.match(insecure.stderr, /must use HTTPS/);

  run(root, [...addArguments, "--claim", "Prepared statements support bound values.", "--force"]);
  assert.match(readFileSync(notePath, "utf8"), /Prepared statements support bound values/);
  run(root, ["validate"]);
});

test("manages an agreed ubiquitous language without deleting history", (context) => {
  const root = mkdtempSync(join(tmpdir(), "project-flow-language-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));

  run(root, ["init", "--key", "TERM", "--name", "Language Example"]);
  const initial = readLanguage(root);
  assert.equal(initial.data.type, "UbiquitousLanguage");
  assert.deepEqual(initial.data.terms, []);
  assert.match(initial.body, /does not adopt other Domain-Driven Design patterns/);

  run(root, [
    "language-add",
    "--term",
    "Task",
    "--definition",
    "A piece of user work that can be completed.",
    "--alias",
    "todo",
    "--example",
    "A user completes a task.",
    "--by",
    "human:test-owner",
    "--reason",
    "The user confirmed this project meaning.",
  ]);
  const alias = run(root, ["language-show", "todo"]).stdout;
  assert.match(alias, /"term": "Task"/);
  assert.match(alias, /"matchedAlias": "todo"/);

  const duplicate = run(root, [
    "language-add",
    "--term",
    "task",
    "--definition",
    "A conflicting definition.",
    "--by",
    "human:test-owner",
    "--reason",
    "This should fail.",
  ], 1);
  assert.match(duplicate.stderr, /already exists/);

  const aliasConflict = run(root, [
    "language-add",
    "--term",
    "Todo",
    "--definition",
    "A second canonical meaning.",
    "--by",
    "human:test-owner",
    "--reason",
    "This should fail.",
  ], 1);
  assert.match(aliasConflict.stderr, /alias todo conflicts with canonical term Todo/i);

  run(root, [
    "language-update",
    "Task",
    "--definition",
    "A tracked piece of user work that can be completed.",
    "--alias",
    "--example",
    "A user completes a task.",
    "--by",
    "human:test-owner",
    "--reason",
    "The user removed the ambiguous alias.",
  ]);
  run(root, [
    "language-add",
    "--term",
    "Work item",
    "--definition",
    "A unit tracked in the delivery workflow.",
    "--by",
    "human:test-owner",
    "--reason",
    "The user separated product tasks from delivery records.",
  ]);
  run(root, [
    "language-deprecate",
    "Task",
    "--replacement",
    "Work item",
    "--by",
    "human:test-owner",
    "--reason",
    "The old term no longer has one clear meaning.",
  ]);
  run(root, ["validate"]);

  const language = readLanguage(root);
  const task = language.data.terms.find((entry) => entry.term === "Task");
  assert.equal(task.status, "deprecated");
  assert.equal(task.replacement, "Work item");
  assert.equal(task.aliases.length, 0);
  assert.deepEqual(language.data.history.map((entry) => entry.action), [
    "added",
    "updated",
    "added",
    "deprecated",
  ]);
  assert.match(language.body, /# Active terms[\s\S]*## Work item/);
  assert.match(language.body, /# Deprecated terms[\s\S]*## Task/);
  assert.match(
    readFileSync(join(root, "docs", "knowledge", "log.md"), "utf8"),
    /\* \*\*Language\*\*: Deprecated Task by human:test-owner\./,
  );

  run(root, [
    "language-add",
    "--term",
    "Work record",
    "--definition",
    "A durable record of delivery work.",
    "--by",
    "human:test-owner",
    "--reason",
    "The user confirmed a replacement for the delivery concept.",
  ]);
  run(root, [
    "language-update",
    "Task",
    "--replacement",
    "Work record",
    "--by",
    "human:test-owner",
    "--reason",
    "The replacement term changed before Work item was retired.",
  ]);
  run(root, [
    "language-deprecate",
    "Work item",
    "--replacement",
    "Work record",
    "--by",
    "human:test-owner",
    "--reason",
    "The user retired Work item in favor of Work record.",
  ]);
  run(root, ["validate"]);
  const revisedLanguage = readLanguage(root);
  assert.equal(
    revisedLanguage.data.terms.find((entry) => entry.term === "Task").replacement,
    "Work record",
  );
  assert.equal(
    revisedLanguage.data.terms.find((entry) => entry.term === "Work item").replacement,
    "Work record",
  );

  git(root, ["init", "-b", "main"]);
  git(root, ["config", "user.name", "Workflow Test"]);
  git(root, ["config", "user.email", "workflow@example.com"]);
  git(root, ["add", "."]);
  git(root, ["commit", "-m", "chore: establish language fixture"]);
  git(root, ["switch", "-c", "feat/term-change"]);
  const offTarget = run(root, [
    "language-update",
    "Work item",
    "--definition",
    "A changed definition that must not be written from a ticket branch.",
    "--by",
    "human:test-owner",
    "--reason",
    "This should fail.",
  ], 1);
  assert.match(offTarget.stderr, /must run on the configured target branch main/);
  assert.match(run(root, ["language-show", "Work item"]).stdout, /A unit tracked in the delivery workflow/);
});

test("isolates ready tickets and merges only green worktrees", (context) => {
  const root = mkdtempSync(join(tmpdir(), "project-flow-worktree-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));

  git(root, ["init", "-b", "main"]);
  git(root, ["config", "user.name", "Project Flow Test"]);
  git(root, ["config", "user.email", "project-flow@example.com"]);
  run(root, ["init", "--key", "TREE", "--name", "Worktree Example"]);
  const brief = createConfirmedBrief(root);
  git(root, ["add", "--all"]);
  git(root, ["commit", "-m", "chore(setup): initialize workflow"]);

  run(root, [
    "create",
    "--type",
    "task",
    "--summary",
    "Build shared base",
    "--description",
    "Create the shared base.",
  ]);
  run(root, [
    "create",
    "--type",
    "story",
    "--brief",
    brief,
    "--summary",
    "Use shared base",
    "--description",
    "Use the completed shared base.",
    "--accept",
    "The shared base is used.",
    "--blocked-by",
    "TREE-1",
    "--knowledge",
    "none",
  ]);
  run(root, [
    "create",
    "--type",
    "task",
    "--summary",
    "Build independent helper",
    "--description",
    "Create an independent helper file.",
  ]);
  run(root, ["transition", "TREE-1", "ready"]);
  run(root, ["transition", "TREE-2", "ready"]);
  run(root, ["transition", "TREE-3", "ready"]);
  git(root, ["add", "--all"]);
  git(root, ["commit", "-m", "docs(plan): add dependent tickets"]);

  const cycle = run(root, ["link", "TREE-1", "--type", "blocked-by", "--target", "TREE-2"], 1);
  assert.match(cycle.stderr, /Blocked-by links contain a cycle/);

  const blocked = run(root, ["worktree-add", "TREE-2"], 1);
  assert.match(blocked.stderr, /Open blockers: TREE-1/);

  const created = run(root, ["worktree-add", "TREE-1"]);
  assert.match(created.stdout, /Branch: chore\/tree-1-build-shared-base/);
  const worktree = join(root, ".woktrees", "tree-1");
  assert.ok(existsSync(worktree));
  assert.equal(git(worktree, ["branch", "--show-current"]).stdout.trim(), "chore/tree-1-build-shared-base");

  const independent = run(root, ["worktree-add", "TREE-3"]);
  assert.match(independent.stdout, /Branch: chore\/tree-3-build-independent-helper/);
  const independentWorktree = join(root, ".woktrees", "tree-3");
  assert.ok(existsSync(independentWorktree));
  const activeWorktrees = run(root, ["worktree-list"]).stdout;
  assert.match(activeWorktrees, /chore\/tree-1-build-shared-base/);
  assert.match(activeWorktrees, /chore\/tree-3-build-independent-helper/);

  const fixedPoint = git(root, ["rev-parse", "main"]).stdout.trim();
  run(worktree, ["transition", "TREE-1", "in-progress"]);
  run(independentWorktree, ["transition", "TREE-3", "in-progress"]);
  writeFileSync(join(independentWorktree, "helper.txt"), "independent\n", "utf8");
  git(independentWorktree, ["add", "--all"]);
  git(independentWorktree, ["commit", "-m", "chore(tree-3): build independent helper"]);
  run(worktree, [
    "review",
    "TREE-1",
    "--status",
    "pass",
    "--reviewer",
    "agent/test",
    "--base",
    fixedPoint,
    "--standards",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
    "--spec",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
  ]);
  run(worktree, ["transition", "TREE-1", "in-review"]);
  run(worktree, ["complete", "TREE-1"]);
  git(worktree, ["add", "--all"]);
  git(worktree, ["commit", "-m", "complete shared base"]);

  const invalidCommit = run(root, ["worktree-finish", "TREE-1"], 1);
  assert.match(invalidCommit.stderr, /Non-conventional commit subjects/);
  git(worktree, ["commit", "--amend", "-m", "chore(tree-1): complete shared base"]);

  run(root, ["worktree-finish", "TREE-1"]);
  assert.equal(existsSync(worktree), false);
  git(root, ["show-ref", "--verify", "--quiet", "refs/heads/chore/tree-1-build-shared-base"], 1);
  assert.equal(readItem(root, "TREE-1").status, "done");
  assert.match(git(root, ["log", "-1", "--format=%s"]).stdout, /^chore\(tree-1\): build shared base$/m);

  const syncResult = spawnSync(
    "git",
    ["merge", "--no-ff", "--no-commit", "main"],
    { cwd: independentWorktree, encoding: "utf8" },
  );
  assert.ok(
    syncResult.status === 0 || syncResult.status === 1,
    `Unexpected sync result.\nstdout:\n${syncResult.stdout}\nstderr:\n${syncResult.stderr}`,
  );
  run(independentWorktree, ["sync"]);
  git(independentWorktree, ["add", "--all"]);
  git(independentWorktree, ["commit", "-m", "chore(tree-3): sync main"]);

  const latestFixedPoint = git(root, ["rev-parse", "main"]).stdout.trim();
  run(independentWorktree, [
    "review",
    "TREE-3",
    "--status",
    "pass",
    "--reviewer",
    "agent/test",
    "--base",
    latestFixedPoint,
    "--standards",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
    "--spec",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
  ]);
  run(independentWorktree, ["transition", "TREE-3", "in-review"]);
  run(independentWorktree, ["complete", "TREE-3"]);
  git(independentWorktree, ["add", "--all"]);
  git(independentWorktree, ["commit", "-m", "docs(tree-3): complete independent helper"]);
  run(root, ["worktree-finish", "TREE-3"]);
  assert.equal(existsSync(independentWorktree), false);
  git(root, ["show-ref", "--verify", "--quiet", "refs/heads/chore/tree-3-build-independent-helper"], 1);
  assert.equal(readItem(root, "TREE-3").status, "done");

  run(root, ["worktree-add", "TREE-2"]);
  const dependentWorktree = join(root, ".woktrees", "tree-2");
  assert.ok(existsSync(dependentWorktree));
  git(root, ["worktree", "remove", dependentWorktree]);
  git(root, ["branch", "--delete", "feat/tree-2-use-shared-base"]);
});

test("rejects a passing review when a configured check fails", (context) => {
  const root = mkdtempSync(join(tmpdir(), "project-flow-failure-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));

  run(root, ["init", "--key", "BUG", "--name", "Failure Example"]);
  run(root, [
    "create",
    "--type",
    "bug",
    "--summary",
    "Reject a failing build",
    "--description",
    "Expected: checks pass. Actual: one check fails.",
    "--accept",
    "The failure is handled.",
    "--check",
    'Failure::node -e "process.exit(2)"',
  ]);
  run(root, ["transition", "BUG-1", "ready"]);
  run(root, ["transition", "BUG-1", "in-progress"]);
  run(root, ["verify", "BUG-1"], 1);
  run(root, [
    "accept",
    "BUG-1",
    "AC-1",
    "--status",
    "pass",
    "--evidence",
    "Failure path inspected.",
  ]);
  const incompleteReview = run(root, [
    "review",
    "BUG-1",
    "--status",
    "changes-requested",
    "--reviewer",
    "agent/test",
    "--base",
    "initial tree",
    "--standards",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
  ], 1);
  assert.match(incompleteReview.stderr, /--standards, and --spec/);

  const result = run(root, [
    "review",
    "BUG-1",
    "--status",
    "pass",
    "--reviewer",
    "agent/test",
    "--base",
    "initial tree",
    "--standards",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
    "--spec",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
  ], 1);

  assert.match(result.stderr, /CHK-1 must pass through verify/);
  assert.equal(readItem(root, "BUG-1").status, "in-progress");
});

test("requires risk-driven quality gate evidence", (context) => {
  const root = mkdtempSync(join(tmpdir(), "project-flow-risk-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));

  run(root, ["init", "--key", "RISK", "--name", "Risk Example"]);
  run(root, [
    "create",
    "--type",
    "bug",
    "--summary",
    "Repair a schema migration",
    "--description",
    "Expected: the migration is reversible. Actual: rollback is untested.",
    "--accept",
    "The migration can be reversed.",
    "--risk",
    "elevated",
    "--risk-factor",
    "migration",
    "--knowledge",
    "none",
  ]);

  const notReady = run(root, ["transition", "RISK-1", "ready"], 1);
  assert.match(notReady.stderr, /requires a migration quality gate/);
  run(root, ["add-gate", "RISK-1", "--type", "migration"]);
  run(root, ["transition", "RISK-1", "ready"]);
  run(root, ["transition", "RISK-1", "in-progress"]);
  run(root, [
    "accept",
    "RISK-1",
    "AC-1",
    "--status",
    "pass",
    "--evidence",
    "The migration behavior matches the ticket.",
  ]);
  const pendingGate = run(root, [
    "review",
    "RISK-1",
    "--status",
    "pass",
    "--reviewer",
    "agent/test",
    "--base",
    "initial tree",
    "--standards",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
    "--spec",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
  ], 1);
  assert.match(pendingGate.stderr, /GATE-1 migration needs passing evidence/);
  run(root, [
    "gate",
    "RISK-1",
    "GATE-1",
    "--status",
    "pass",
    "--evidence",
    "A rollback fixture restores the previous schema.",
  ]);
  run(root, [
    "review",
    "RISK-1",
    "--status",
    "pass",
    "--reviewer",
    "agent/test",
    "--base",
    "initial tree",
    "--standards",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
    "--spec",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
  ]);
  run(root, ["transition", "RISK-1", "in-review"]);
  run(root, ["complete", "RISK-1"]);
  run(root, ["validate"]);
});

test("records a green release and an observed product outcome", (context) => {
  const root = mkdtempSync(join(tmpdir(), "project-flow-release-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));

  git(root, ["init", "-b", "main"]);
  git(root, ["config", "user.name", "Project Flow Test"]);
  git(root, ["config", "user.email", "project-flow@example.com"]);
  run(root, ["init", "--key", "SHIP", "--name", "Release Example"]);
  const brief = createConfirmedBrief(root);
  run(root, [
    "create",
    "--type",
    "story",
    "--brief",
    brief,
    "--summary",
    "Retain tasks",
    "--description",
    "As a user, I want saved tasks to survive a restart.",
    "--accept",
    "A saved task remains after a restart.",
    "--knowledge",
    "none",
  ]);
  git(root, ["add", "--all"]);
  git(root, ["commit", "-m", "chore(setup): prepare release fixture"]);
  const fixedPoint = git(root, ["rev-parse", "HEAD"]).stdout.trim();
  run(root, ["transition", "SHIP-1", "ready"]);
  run(root, ["transition", "SHIP-1", "in-progress"]);
  run(root, [
    "accept",
    "SHIP-1",
    "AC-1",
    "--status",
    "pass",
    "--evidence",
    "A focused restart test retains the task.",
  ]);
  run(root, [
    "review",
    "SHIP-1",
    "--status",
    "pass",
    "--reviewer",
    "agent/test",
    "--base",
    fixedPoint,
    "--standards",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
    "--spec",
    "Pass. P0:0 P1:0 P2:0 P3:0.",
  ]);
  run(root, ["transition", "SHIP-1", "in-review"]);
  run(root, ["complete", "SHIP-1"]);

  run(root, [
    "release-create",
    "--title",
    "Task retention release",
    "--kind",
    "deploy",
    "--ticket",
    "SHIP-1",
    "--provider",
    "Local fixture",
    "--environment",
    "test",
    "--destination",
    "local process",
    "--migration",
    "No data migration.",
    "--rollout",
    "Start the fixture process.",
    "--recovery",
    "Stop the fixture process.",
    "--require-approval",
    "human:test-owner",
  ]);
  git(root, ["switch", "-c", "chore/off-target-release"]);
  const wrongBranch = run(root, [
    "release-check",
    "REL-1",
    "--phase",
    "pre",
    "--status",
    "pass",
    "--name",
    "Build",
    "--evidence",
    "This evidence must not be recorded from a ticket branch.",
  ], 1);
  assert.match(wrongBranch.stderr, /must run on the configured target branch main/);
  git(root, ["switch", "main"]);
  git(root, ["branch", "--delete", "chore/off-target-release"]);
  run(root, [
    "release-check",
    "REL-1",
    "--phase",
    "pre",
    "--status",
    "pass",
    "--name",
    "Build",
    "--evidence",
    "The deterministic fixture build passed.",
  ]);
  const staleArtifact = run(root, [
    "release-start",
    "REL-1",
    "--commit",
    fixedPoint,
    "--artifact",
    `git:${fixedPoint}`,
    "--digest",
    `git:${fixedPoint}`,
    "--approval",
    "human:test-owner",
    "--by",
    "agent/test",
  ], 1);
  assert.match(staleArtifact.stderr, /SHIP-1 is not completed in the release commit/);
  git(root, ["add", "--all"]);
  git(root, ["commit", "-m", "feat(ship-1): retain tasks"]);
  const commit = git(root, ["rev-parse", "HEAD"]).stdout.trim();
  const missingApproval = run(root, [
    "release-start",
    "REL-1",
    "--commit",
    commit,
    "--artifact",
    `git:${commit}`,
    "--digest",
    `git:${commit}`,
    "--by",
    "agent/test",
  ], 1);
  assert.match(missingApproval.stderr, /Missing required approvals: human:test-owner/);
  run(root, [
    "release-start",
    "REL-1",
    "--commit",
    commit,
    "--artifact",
    `git:${commit}`,
    "--digest",
    `git:${commit}`,
    "--approval",
    "human:test-owner",
    "--by",
    "agent/test",
  ]);
  const noLiveEvidence = run(root, [
    "release-finish",
    "REL-1",
    "--status",
    "green",
    "--by",
    "agent/test",
    "--evidence",
    "The release command returned successfully.",
  ], 1);
  assert.match(noLiveEvidence.stderr, /passing post-release checks/);
  run(root, [
    "release-check",
    "REL-1",
    "--phase",
    "post",
    "--status",
    "pass",
    "--name",
    "Task smoke test",
    "--evidence",
    "The released fixture retained a task after restart.",
  ]);
  run(root, [
    "release-finish",
    "REL-1",
    "--status",
    "green",
    "--by",
    "agent/test",
    "--evidence",
    "The released fixture remained healthy.",
  ]);
  assert.ok(existsSync(join(root, "docs", "knowledge", "releases", "rel-1.md")));

  run(root, ["outcome-create", "--brief", brief, "--release", "REL-1"]);
  run(root, [
    "outcome-record",
    "OUT-1",
    "--observed",
    "Completion increased from 0 percent to 65 percent over 14 days.",
    "--result",
    "met",
    "--decision",
    "proceed",
    "--evidence",
    "Fixture analytics report with 20 retained tasks.",
    "--by",
    "human:test-owner",
  ]);
  assert.ok(existsSync(join(root, "docs", "knowledge", "outcomes", "out-1.md")));
  const outcomePath = join(root, "docs", "work", "outcomes", "OUT-1.json");
  const outcome = JSON.parse(readFileSync(outcomePath, "utf8"));
  outcome.success.target = "A rewritten target";
  writeFileSync(outcomePath, `${JSON.stringify(outcome, null, 2)}\n`, "utf8");
  const rewrittenTarget = run(root, ["validate"], 1);
  assert.match(rewrittenTarget.stderr, /success.target must match BRIEF-1/);
  outcome.success.target = "60 percent";
  writeFileSync(outcomePath, `${JSON.stringify(outcome, null, 2)}\n`, "utf8");
  run(root, ["validate"]);
});

test("ships and measures a copied Next.js and SQLite example", {
  skip: SUPPORTS_EXAMPLE ? false : "The example requires Node.js 24.15 or newer.",
}, async (context) => {
  const container = mkdtempSync(join(tmpdir(), "project-flow-next-release-"));
  const root = join(container, "project");
  context.after(() => rmSync(container, { recursive: true, force: true }));
  copyExampleProject(root);

  git(root, ["init", "-b", "main"]);
  git(root, ["config", "user.name", "Project Flow Test"]);
  git(root, ["config", "user.email", "project-flow@example.com"]);
  git(root, ["add", "--all"]);
  git(root, ["commit", "-m", "feat(example): provide task workflow"]);
  const releaseCommit = git(root, ["rev-parse", "HEAD"]).stdout.trim();

  runProgram(root, "npm", ["test"]);
  runProgram(root, "npm", ["run", "typecheck"]);
  runProgram(root, "npm", ["run", "build"]);
  assert.ok(existsSync(join(root, ".next", "BUILD_ID")));
  const artifactDigest = directorySha256(join(root, ".next"));
  runInstalled(root, ["validate"]);

  runInstalled(root, [
    "release-create",
    "--title",
    "Next.js SQLite example",
    "--kind",
    "publish",
    "--ticket",
    "TASK-2",
    "--ticket",
    "TASK-4",
    "--provider",
    "Local Next.js build",
    "--environment",
    "local-verification",
    "--destination",
    ".next build output",
    "--migration",
    "The fixture creates its local SQLite table on first use.",
    "--rollout",
    "Build the exact main commit and inspect its route output.",
    "--recovery",
    "Discard the local build and restore the prior commit.",
  ]);
  runInstalled(root, [
    "release-check",
    "REL-1",
    "--phase",
    "pre",
    "--status",
    "pass",
    "--name",
    "Tests, types, and build",
    "--evidence",
    "npm test, npm run typecheck, and npm run build passed.",
  ]);
  runInstalled(root, [
    "release-start",
    "REL-1",
    "--commit",
    releaseCommit,
    "--artifact",
    `.next directory for git:${releaseCommit}`,
    "--digest",
    `sha256:${artifactDigest}`,
    "--by",
    "agent/test",
  ]);
  const port = await availablePort();
  const server = spawn(
    "npm",
    ["run", "start", "--", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
  );
  let serverOutput = "";
  server.stdout.setEncoding("utf8");
  server.stderr.setEncoding("utf8");
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk;
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk;
  });
  context.after(() => stopChild(server));
  const page = await waitForPage(`http://127.0.0.1:${port}`, server, () => serverOutput);
  assert.match(page, /Small Steps/);
  await stopChild(server);
  runInstalled(root, [
    "release-check",
    "REL-1",
    "--phase",
    "post",
    "--status",
    "pass",
    "--name",
    "Running build smoke",
    "--evidence",
    `The sha256:${artifactDigest} build served Small Steps over HTTP 200.`,
  ]);
  runInstalled(root, [
    "release-finish",
    "REL-1",
    "--status",
    "green",
    "--by",
    "agent/test",
    "--evidence",
    "The local Next.js build and task workflow remained valid.",
  ]);
  runInstalled(root, ["outcome-create", "--brief", "BRIEF-1", "--release", "REL-1"]);
  git(root, ["add", "docs"]);
  git(root, ["commit", "-m", "docs(rel-1): record verified example release"]);

  runInstalled(root, ["validate"]);
  runInstalled(root, [
    "outcome-record",
    "OUT-1",
    "--observed",
    "One clean copied fixture passed tests, type checks, build, and workflow validation.",
    "--result",
    "met",
    "--decision",
    "proceed",
    "--evidence",
    "The reproducible test completed 1 of 1 verification runs with no exclusions.",
    "--by",
    "human:test-owner",
  ]);
  git(root, ["add", "docs"]);
  git(root, ["commit", "-m", "docs(out-1): record measured example outcome"]);
  runInstalled(root, ["validate"]);

  const release = JSON.parse(
    readFileSync(join(root, "docs", "work", "releases", "REL-1.json"), "utf8"),
  );
  const outcome = JSON.parse(
    readFileSync(join(root, "docs", "work", "outcomes", "OUT-1.json"), "utf8"),
  );
  assert.equal(release.status, "green");
  assert.equal(release.commit, releaseCommit);
  assert.equal(release.digest, `sha256:${artifactDigest}`);
  assert.equal(outcome.result, "met");
  assert.equal(outcome.decision, "proceed");
  assert.equal(git(root, ["status", "--porcelain"]).stdout, "");
});
