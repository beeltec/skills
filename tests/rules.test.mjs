import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const SCRIPT = resolve("skills/rules/scripts/manage-rules.mjs");
const PROJECT_RULES = [
  "project-evidence",
  "ubiquitous-language",
  "ticket-git-workflow",
  "code-quality",
  "comments",
  "testing",
  "review-policy",
];
const USER_RULES = ["plain-english", "official-sources"];

function run(arguments_, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [SCRIPT, ...arguments_], {
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    expectedStatus,
    `Command failed: ${arguments_.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

function assertManaged(content, names) {
  const starts = content.match(/<!-- agent-rule:[a-z0-9-]+:start/g) ?? [];
  assert.equal(starts.length, names.length);
  for (const name of names) {
    assert.match(
      content,
      new RegExp(`<!-- agent-rule:${name}:start sha256=[a-f0-9]{64} -->`),
    );
    assert.match(content, new RegExp(`<!-- agent-rule:${name}:end -->`));
  }
}

test("lists each rule with its recommended scope", () => {
  const result = run(["list"]);
  assert.deepEqual(
    result.stdout.trim().split("\n"),
    [
      ...USER_RULES.map((name) => `${name}\trecommended=user`),
      ...PROJECT_RULES.map((name) => `${name}\trecommended=project`),
    ],
  );
});

test("finds the rule catalog when the skill directory is symlinked", (context) => {
  const project = mkdtempSync(join(tmpdir(), "agent-rules-linked-"));
  context.after(() => rmSync(project, { recursive: true, force: true }));
  const linkedSkill = join(project, ".agents", "skills", "rules");
  mkdirSync(join(project, ".agents", "skills"), { recursive: true });
  symlinkSync(resolve("skills/rules"), linkedSkill, "dir");

  const result = spawnSync(
    process.execPath,
    [join(linkedSkill, "scripts", "manage-rules.mjs"), "list"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.match(result.stdout, /plain-english\trecommended=user/);
  assert.match(result.stdout, /review-policy\trecommended=project/);
});

test("installs and checks the project profile without changing local text", (context) => {
  const sandbox = mkdtempSync(join(tmpdir(), "agent-rules-project-"));
  context.after(() => rmSync(sandbox, { recursive: true, force: true }));
  const project = join(sandbox, "project");
  const target = join(project, "AGENTS.md");
  const original = "# Local instructions\r\n\r\nKeep this exact text.\r\n";
  mkdirSync(project);
  writeFileSync(target, original, "utf8");

  const dryRun = run(["install", "--scope", "project", "--root", project, "--dry-run"]);
  assert.match(dryRun.stdout, /Would update:/);
  assert.equal(readFileSync(target, "utf8"), original);

  run(["install", "--scope", "project", "--root", project]);
  const installed = readFileSync(target, "utf8");
  assert.ok(installed.startsWith(original));
  assert.equal(installed.replaceAll("\r\n", "").includes("\n"), false);
  assertManaged(installed, PROJECT_RULES);
  for (const name of USER_RULES) {
    assert.doesNotMatch(installed, new RegExp(`agent-rule:${name}:start`));
  }

  run(["check", "--scope", "project", "--root", project]);
  const second = run(["install", "--scope", "project", "--root", project]);
  assert.match(second.stdout, /Unchanged:/);
  assert.equal(readFileSync(target, "utf8"), installed);

  const withSuffix = `${installed}Keep this suffix without a final newline.`;
  writeFileSync(target, withSuffix, "utf8");
  run(["install", "--scope", "project", "--root", project]);
  assert.equal(readFileSync(target, "utf8"), withSuffix);
});

test("installs only the user profile after an explicit user-scope command", (context) => {
  const sandbox = mkdtempSync(join(tmpdir(), "agent-rules-user-"));
  context.after(() => rmSync(sandbox, { recursive: true, force: true }));
  const codexHome = join(sandbox, "codex");
  const target = join(codexHome, "AGENTS.md");

  run(["install", "--scope", "user", "--codex-home", codexHome, "--dry-run"]);
  assert.equal(existsSync(codexHome), false);

  run(["install", "--scope", "user", "--codex-home", codexHome]);
  const installed = readFileSync(target, "utf8");
  assertManaged(installed, USER_RULES);
  for (const name of PROJECT_RULES) {
    assert.doesNotMatch(installed, new RegExp(`agent-rule:${name}:start`));
  }
  run(["check", "--scope", "user", "--codex-home", codexHome]);
});

test("detects edits and repairs them only through installation", (context) => {
  const project = mkdtempSync(join(tmpdir(), "agent-rules-repair-"));
  context.after(() => rmSync(project, { recursive: true, force: true }));
  const target = join(project, "AGENTS.md");

  run(["install", "--scope", "project", "--root", project]);
  const installed = readFileSync(target, "utf8");
  const changed = installed.replace(
    "Use the smallest test that gives reliable confidence",
    "Use the largest possible test regardless of confidence",
  );
  assert.notEqual(changed, installed);
  writeFileSync(target, changed, "utf8");

  const failed = run(["check", "--scope", "project", "--root", project], 1);
  assert.match(failed.stderr, /content differs from its source: testing/);

  run(["install", "--scope", "project", "--root", project]);
  run(["check", "--scope", "project", "--root", project]);
  assert.equal(readFileSync(target, "utf8"), installed);
});

test("refuses malformed, duplicate, and overridden boundaries", (context) => {
  const sandbox = mkdtempSync(join(tmpdir(), "agent-rules-invalid-"));
  context.after(() => rmSync(sandbox, { recursive: true, force: true }));

  const malformedProject = join(sandbox, "malformed");
  const malformedTarget = join(malformedProject, "AGENTS.md");
  const malformed = "# Keep\n\n<!-- agent-rule:testing:start sha256=bad -->\n";
  mkdirSync(malformedProject);
  writeFileSync(malformedTarget, malformed, "utf8");
  const malformedResult = run(
    ["install", "--scope", "project", "--root", malformedProject],
    1,
  );
  assert.match(malformedResult.stderr, /Malformed agent-rule marker/);
  assert.equal(readFileSync(malformedTarget, "utf8"), malformed);

  const duplicateProject = join(sandbox, "duplicate");
  const duplicateTarget = join(duplicateProject, "AGENTS.md");
  mkdirSync(duplicateProject);
  run(["install", "--scope", "project", "--root", duplicateProject]);
  const installed = readFileSync(duplicateTarget, "utf8");
  const block = installed.match(
    /<!-- agent-rule:testing:start[\s\S]*?<!-- agent-rule:testing:end -->/,
  )?.[0];
  assert.ok(block);
  writeFileSync(duplicateTarget, `${installed}\n${block}\n`, "utf8");
  const duplicateResult = run(
    ["check", "--scope", "project", "--root", duplicateProject],
    1,
  );
  assert.match(duplicateResult.stderr, /Duplicate agent-rule block: testing/);

  const overrideProject = join(sandbox, "override");
  mkdirSync(overrideProject);
  writeFileSync(join(overrideProject, "AGENTS.md"), "# Local\n", "utf8");
  writeFileSync(join(overrideProject, "AGENTS.override.md"), "# Override\n", "utf8");
  const overrideResult = run(
    ["install", "--scope", "project", "--root", overrideProject],
    1,
  );
  assert.match(overrideResult.stderr, /AGENTS\.override\.md takes precedence/);
});
