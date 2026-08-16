import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

const SKILLS_ROOT = resolve("skills");

function parseSkillFrontmatter(content) {
  const match = content.replaceAll("\r\n", "\n").match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "SKILL.md needs YAML frontmatter.");
  const fields = new Map();
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([a-z-]+):\s*(.+)$/);
    assert.ok(field, `Invalid frontmatter line: ${line}`);
    fields.set(field[1], field[2]);
  }
  return fields;
}

for (const name of readdirSync(SKILLS_ROOT).sort()) {
  test(`${name} follows the Agent Skills structure`, () => {
    const directory = join(SKILLS_ROOT, name);
    const skillPath = join(directory, "SKILL.md");
    const metadataPath = join(directory, "agents", "openai.yaml");
    assert.ok(existsSync(skillPath));
    assert.ok(existsSync(metadataPath));

    const content = readFileSync(skillPath, "utf8");
    const fields = parseSkillFrontmatter(content);
    assert.deepEqual([...fields.keys()].sort(), ["description", "name"]);
    assert.equal(fields.get("name"), name);
    assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(name.length <= 64);
    assert.ok((fields.get("description") ?? "").length <= 1024);
    assert.ok(content.split("\n").length < 500);
    assert.doesNotMatch(content, /\bTODO\b/);

    for (const match of content.matchAll(/\((references\/[A-Za-z0-9._/-]+\.md)\)/g)) {
      assert.ok(existsSync(join(directory, match[1])), `${name} references missing ${match[1]}`);
    }

    const metadata = readFileSync(metadataPath, "utf8");
    const shortDescription = metadata.match(/short_description:\s*"([^"]+)"/)?.[1];
    assert.ok(shortDescription);
    assert.ok(shortDescription.length >= 25 && shortDescription.length <= 64);
    assert.match(metadata, new RegExp(`default_prompt:.*\\$${name}`));
  });
}

test("review defines an auditable two-axis review", () => {
  const skill = readFileSync(join(SKILLS_ROOT, "review", "SKILL.md"), "utf8");
  const review = readFileSync(
    join(SKILLS_ROOT, "review", "references", "two-axis.md"),
    "utf8",
  );

  assert.match(skill, /pin the fixed point/i);
  assert.match(skill, /Standards pass/);
  assert.match(skill, /Spec pass/);
  assert.match(review, /## Standards pass/);
  assert.match(review, /## Spec pass/);
  assert.match(review, /docs\/work\/items\/<KEY>\.json/);
  assert.match(review, /Do not merge or rank findings across axes/);
});

test("setup owns workflow initialization", () => {
  const skill = readFileSync(join(SKILLS_ROOT, "setup", "SKILL.md"), "utf8");
  assert.ok(existsSync(join(SKILLS_ROOT, "setup", "scripts", "project-flow.mjs")));
  assert.ok(existsSync(join(SKILLS_ROOT, "setup", "references", "workspace-format.md")));
  assert.match(skill, /\.project\/workflow\.json/);
  assert.match(skill, /Do not initialize twice/);
});
