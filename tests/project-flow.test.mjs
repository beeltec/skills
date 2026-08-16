import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const CLI = resolve("skills/setup/scripts/project-flow.mjs");

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

function readItem(root, key) {
  return JSON.parse(readFileSync(join(root, "docs", "work", "items", `${key}.json`), "utf8"));
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
  assert.ok(existsSync(join(root, "docs", "knowledge", "sources", "index.md")));
  assert.ok(existsSync(join(root, "docs", "work", "board.md")));
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

  run(root, [
    "create",
    "--type",
    "epic",
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

test("isolates ready tickets and merges only green worktrees", (context) => {
  const root = mkdtempSync(join(tmpdir(), "project-flow-worktree-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));

  git(root, ["init", "-b", "main"]);
  git(root, ["config", "user.name", "Project Flow Test"]);
  git(root, ["config", "user.email", "project-flow@example.com"]);
  run(root, ["init", "--key", "TREE", "--name", "Worktree Example"]);
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
