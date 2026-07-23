#!/usr/bin/env python3

import subprocess
import tempfile
import unittest
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[4]
SKILL_ROOT = Path(__file__).resolve().parents[1]
SKILL = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
METADATA = (SKILL_ROOT / "agents" / "openai.yaml").read_text(encoding="utf-8")
INSTALLER = (
    REPOSITORY_ROOT
    / "skills"
    / "workflows"
    / "setup-project"
    / "scripts"
    / "setup_project.py"
)


class WikiContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.project = Path(self.temporary_directory.name) / "project"
        self.project.mkdir()
        subprocess.run(
            [
                "python3",
                str(INSTALLER),
                "--root",
                str(self.project),
                "--no-package-script",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        self.wiki = self.project / "docs" / "wiki"
        self.backlog = self.project / "docs" / "backlog"

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def validate(self) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["node", "scripts/validate-project.mjs"],
            cwd=self.project,
            capture_output=True,
            text=True,
        )

    def write_concept(self, status: str = "draft") -> Path:
        target = self.wiki / "architecture" / "runtime.md"
        target.write_text(
            f"""---
title: 'Runtime contract'
type: Reference
description: Accepted runtime behavior used by the project.
timestamp: 2026-07-23T12:00:00Z
status: {status}
---

# Runtime contract

The project uses the accepted runtime behavior.
""",
            encoding="utf-8",
        )
        (self.wiki / "architecture" / "index.md").write_text(
            "# Architecture\n\n"
            "- [Runtime contract](/architecture/runtime.md) - Accepted runtime behavior used by the project.\n",
            encoding="utf-8",
        )
        return target

    def delete_concept(self, target: Path) -> None:
        target.unlink()
        (self.wiki / "architecture" / "index.md").write_text(
            "# Architecture\n\n"
            "Add system-wide design, technology, security, delivery, and compatibility concepts here.\n",
            encoding="utf-8",
        )

    def write_work(self, relative: str, status: str, *, checked: bool) -> None:
        mark = "x" if checked else " "
        target = self.backlog / relative
        target.write_text(
            f"""---
id: WORK-001
type: task
title: Preserve wiki reference history
status: {status}
parent: none
outcome: Verify active and archived wiki reference behavior
wiki_refs: [docs/wiki/architecture/runtime.md]
research: not-needed
blocks: []
clones: []
duplicates: []
relates_to: []
causes: []
claim: none
claim_expires: none
cancelled_reason: none
---

# WORK-001: Preserve wiki reference history

## Outcome / delta

Verify active and archived wiki reference behavior.

## Acceptance criteria

- [{mark}] Project validation confirms reference handling.

## Relationships

No relationships apply.

## Wiki references

The runtime concept supplies accepted context.

## Research

No external research is needed for this validation fixture.

## Execution

The owner approved the approach. Verification command: node scripts/validate-project.mjs.

## Subtasks

- [{mark}] Run project validation.
""",
            encoding="utf-8",
        )

    def test_skill_owns_the_complete_governed_lifecycle(self) -> None:
        for contract in (
            "Treat a direct request as intent, not approval",
            "Strictly non-semantic maintenance requested by the user may proceed",
            "Read-only discovery, explanation, and audit requests",
            "work-branch-only behavior",
            "prepare an exact conditional transaction",
            "research current sources",
            "Use `draft` only for incomplete documentation",
            "Delete replaced concepts",
            "active backlog record references",
            "docs/wiki/log.md",
            "docs(wiki): <transaction outcome>",
        ):
            self.assertIn(contract, SKILL)
        self.assertIn("name: wiki", SKILL.split("---", 2)[1])
        self.assertIn("Use $wiki", METADATA)
        self.assertIn("allow_implicit_invocation: true", METADATA)
        self.assertTrue((SKILL_ROOT / "references" / "okf-spec.md").is_file())

    def test_draft_active_deprecated_and_clean_deletion_validate(self) -> None:
        concept = self.write_concept("draft")
        self.assertEqual(self.validate().returncode, 0)

        for status in ("active", "deprecated"):
            self.write_concept(status)
            result = self.validate()
            self.assertEqual(result.returncode, 0, result.stderr)

        self.delete_concept(concept)
        result = self.validate()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_active_work_blocks_a_missing_wiki_reference(self) -> None:
        concept = self.write_concept("active")
        self.write_work("standalone/WORK-001-reference.md", "ready", checked=False)
        (self.backlog / "standalone" / "index.md").write_text(
            "# Active standalone work\n\n"
            "- [WORK-001](WORK-001-reference.md) - Active wiki reference fixture.\n",
            encoding="utf-8",
        )
        index = self.backlog / "index.md"
        index.write_text(
            index.read_text(encoding="utf-8").replace(
                "No executable work is ranked. Add every active `WORK-NNN` exactly once as an ordered Markdown link; position 1 is the next work item.",
                "1. [WORK-001](standalone/WORK-001-reference.md)",
            ),
            encoding="utf-8",
        )
        self.assertEqual(self.validate().returncode, 0)

        self.delete_concept(concept)
        result = self.validate()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("wiki_refs references missing", result.stderr)

    def test_archived_work_retains_a_missing_historical_reference(self) -> None:
        concept = self.write_concept("active")
        self.write_work("archive/standalone/WORK-001-history.md", "done", checked=True)
        (self.backlog / "archive" / "standalone" / "index.md").write_text(
            "# Archived standalone work\n\n"
            "- [WORK-001](WORK-001-history.md) - Historical wiki reference fixture.\n",
            encoding="utf-8",
        )
        self.assertEqual(self.validate().returncode, 0)

        self.delete_concept(concept)
        result = self.validate()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn(
            "archived wiki_refs retains missing historical docs/wiki/architecture/runtime.md",
            result.stderr,
        )


if __name__ == "__main__":
    unittest.main()
