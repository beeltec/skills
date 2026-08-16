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
  assert.ok(existsSync(join(root, "docs", "work", "board.md")));
  assert.ok(existsSync(join(root, ".project", "bin", "project-flow.mjs")));
  const config = JSON.parse(readFileSync(join(root, ".project", "workflow.json"), "utf8"));
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
