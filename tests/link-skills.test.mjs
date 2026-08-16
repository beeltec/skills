import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import test from "node:test";

const SCRIPT = resolve("scripts/link-skills.sh");
const SKILLS_ROOT = resolve("skills");
const SKILL_NAMES = readdirSync(SKILLS_ROOT)
  .filter((name) => existsSync(join(SKILLS_ROOT, name, "SKILL.md")))
  .sort();
const DESTINATION_ROOTS = [join(".agents", "skills"), join(".claude", "skills")];

function run(arguments_, cwd, expectedStatus = 0) {
  const result = spawnSync(SCRIPT, arguments_, { cwd, encoding: "utf8" });
  assert.equal(
    result.status,
    expectedStatus,
    `Command failed: ${SCRIPT} ${arguments_.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

test("links every skill from any working directory and stays idempotent", (context) => {
  const sandbox = mkdtempSync(join(tmpdir(), "link-skills-success-"));
  context.after(() => rmSync(sandbox, { recursive: true, force: true }));
  const project = join(sandbox, "project");
  const caller = join(sandbox, "caller");
  mkdirSync(project);
  mkdirSync(caller);

  const first = run([project], caller);
  assert.match(first.stdout, new RegExp(`Linked: ${SKILL_NAMES.length * DESTINATION_ROOTS.length}\\.`));

  for (const destinationRoot of DESTINATION_ROOTS) {
    for (const name of SKILL_NAMES) {
      const destination = join(project, destinationRoot, name);
      assert.ok(lstatSync(destination).isSymbolicLink());
      assert.equal(realpathSync(destination), realpathSync(join(SKILLS_ROOT, name)));
    }
  }

  const second = run([], project);
  assert.match(
    second.stdout,
    new RegExp(`Unchanged: ${SKILL_NAMES.length * DESTINATION_ROOTS.length}\\.`),
  );
});

test("resolves its repository when called through PATH", (context) => {
  const sandbox = mkdtempSync(join(tmpdir(), "link-skills-path-"));
  context.after(() => rmSync(sandbox, { recursive: true, force: true }));
  const project = join(sandbox, "project");
  const caller = join(sandbox, "caller");
  const bin = join(sandbox, "bin");
  mkdirSync(project);
  mkdirSync(caller);
  mkdirSync(bin);
  symlinkSync(SCRIPT, join(bin, "link-project-skills"));

  const result = spawnSync("link-project-skills", [project], {
    cwd: caller,
    encoding: "utf8",
    env: { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH ?? ""}` },
  });
  assert.equal(result.status, 0, `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.equal(
    realpathSync(join(project, ".agents", "skills", SKILL_NAMES[0])),
    realpathSync(join(SKILLS_ROOT, SKILL_NAMES[0])),
  );
  assert.equal(
    realpathSync(join(project, ".claude", "skills", SKILL_NAMES[0])),
    realpathSync(join(SKILLS_ROOT, SKILL_NAMES[0])),
  );
});

test("dry-run does not create project files", (context) => {
  const project = mkdtempSync(join(tmpdir(), "link-skills-dry-run-"));
  context.after(() => rmSync(project, { recursive: true, force: true }));

  const result = run(["--dry-run"], project);
  assert.match(result.stdout, /Would link:/);
  assert.equal(existsSync(join(project, ".agents")), false);
  assert.equal(existsSync(join(project, ".claude")), false);
});

test("refuses real path conflicts before creating links", (context) => {
  const project = mkdtempSync(join(tmpdir(), "link-skills-conflict-"));
  context.after(() => rmSync(project, { recursive: true, force: true }));
  const conflict = join(project, ".agents", "skills", SKILL_NAMES[0]);
  mkdirSync(conflict, { recursive: true });
  writeFileSync(join(conflict, "keep.txt"), "keep\n", "utf8");

  const result = run(["--force"], project, 1);
  assert.match(result.stderr, /is not a symlink/);
  assert.equal(readFileSync(join(conflict, "keep.txt"), "utf8"), "keep\n");
  assert.equal(existsSync(join(project, ".agents", "skills", SKILL_NAMES[1])), false);
  assert.equal(existsSync(join(project, ".claude")), false);
});

test("force replaces only a conflicting symlink", (context) => {
  const sandbox = mkdtempSync(join(tmpdir(), "link-skills-force-"));
  context.after(() => rmSync(sandbox, { recursive: true, force: true }));
  const project = join(sandbox, "project");
  const oldTarget = join(sandbox, "old-skill");
  const destination = join(project, ".agents", "skills", SKILL_NAMES[0]);
  mkdirSync(join(project, ".agents", "skills"), { recursive: true });
  mkdirSync(oldTarget);
  symlinkSync(oldTarget, destination);

  run([], project, 1);
  const result = run(["--force"], project);
  assert.match(result.stdout, /Replaced: 1\./);
  assert.equal(realpathSync(destination), realpathSync(join(SKILLS_ROOT, SKILL_NAMES[0])));
  assert.equal(
    realpathSync(join(project, ".claude", "skills", SKILL_NAMES[0])),
    realpathSync(join(SKILLS_ROOT, SKILL_NAMES[0])),
  );
});
