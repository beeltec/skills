#!/usr/bin/env python3

import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[4]
INSTALLER = (
    REPOSITORY_ROOT
    / "skills"
    / "workflows"
    / "setup-project"
    / "scripts"
    / "setup_project.py"
)


class BacklogLifecycleTests(unittest.TestCase):
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

    def write_work(
        self,
        relative: str,
        work_id: str,
        *,
        work_type: str = "task",
        status: str = "proposed",
        parent: str = "none",
        blocks: tuple[str, ...] = (),
        duplicates: tuple[str, ...] = (),
        relates_to: tuple[str, ...] = (),
        claim: str = "none",
        claim_expires: str = "none",
        cancelled_reason: str = "none",
        checked: bool = False,
        execution: str = "Owner approved the approach. Verification command: node --test.",
    ) -> Path:
        target = self.backlog / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        mark = "x" if checked else " "
        target.write_text(
            f"""---
id: {work_id}
type: {work_type}
title: Governed {work_type} {work_id}
status: {status}
parent: {parent}
outcome: Deliver a bounded and verifiable project result
wiki_refs: [none]
research: not-needed
blocks: [{', '.join(blocks)}]
clones: []
duplicates: [{', '.join(duplicates)}]
relates_to: [{', '.join(relates_to)}]
causes: []
claim: {claim}
claim_expires: {claim_expires}
cancelled_reason: {cancelled_reason}
---

# {work_id}: Governed {work_type}

## Outcome / delta

Deliver a bounded and verifiable project result.

## Acceptance criteria

- [{mark}] The project validator confirms the result.

## Relationships

The frontmatter records every relationship.

## Wiki references

No accepted-state page applies to this fixture.

## Research

No research is needed because this fixture exercises local governance.

## Execution

{execution}

## Subtasks

- [{mark}] Run the project validator.

## Provenance

Approved lifecycle smoke-test fixture.
""",
            encoding="utf-8",
        )
        return target

    def write_epic(
        self,
        relative: str,
        epic_id: str,
        *,
        status: str = "proposed",
        checked: bool = False,
        cancelled_reason: str = "none",
    ) -> Path:
        target = self.backlog / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        mark = "x" if checked else " "
        target.write_text(
            f"""---
id: {epic_id}
type: epic
title: Governed outcome {epic_id}
status: {status}
outcome: Coordinate a measurable governed outcome
blocks: []
clones: []
duplicates: []
relates_to: []
causes: []
cancelled_reason: {cancelled_reason}
---

# {epic_id}: Governed outcome

## Outcome

Coordinate a measurable governed outcome.

## Acceptance criteria

- [{mark}] Every retained child reaches a terminal state.

## Scope

Coordinate the work records stored in this Epic directory.

## Relationships

No additional relationships are required.

## Wiki references

No accepted-state page applies to this fixture.

## Research

No research is needed for this fixture.

## Execution

The owner approved coordination and archive verification.

## Provenance

Approved lifecycle smoke-test fixture.
""",
            encoding="utf-8",
        )
        return target

    def write_rank(self, entries: list[tuple[str, str]]) -> None:
        lines = [
            "# Project backlog",
            "",
            "## Global executable-work rank",
            "",
        ]
        if entries:
            lines.extend(
                f"{position}. [{work_id}]({target})"
                for position, (work_id, target) in enumerate(entries, 1)
            )
        else:
            lines.append("No executable work is ranked.")
        (self.backlog / "index.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    def write_index(self, relative: str, title: str, links: list[tuple[str, str]]) -> None:
        content = [f"# {title}", ""]
        content.extend(f"- [{label}]({target})" for label, target in links)
        (self.backlog / relative).write_text("\n".join(content) + "\n", encoding="utf-8")

    def assert_valid(self) -> None:
        result = self.validate()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_intake_readiness_rank_and_reciprocal_links(self) -> None:
        epic_path = "epics/EPIC-001-governed-outcome/EPIC-001.md"
        story_path = "epics/EPIC-001-governed-outcome/WORK-001-story.md"
        bug_path = "standalone/WORK-002-bug.md"
        self.write_epic(epic_path, "EPIC-001")
        self.write_work(
            story_path,
            "WORK-001",
            work_type="story",
            parent="EPIC-001",
            relates_to=("WORK-002",),
        )
        self.write_work(
            bug_path,
            "WORK-002",
            work_type="bug",
            relates_to=("WORK-001",),
        )
        self.write_index(
            "epics/index.md",
            "Active Epics",
            [("EPIC-001", "EPIC-001-governed-outcome/")],
        )
        self.write_index(
            "standalone/index.md",
            "Active standalone work",
            [("WORK-002", "WORK-002-bug.md")],
        )
        self.write_rank(
            [("WORK-001", story_path), ("WORK-002", bug_path)]
        )
        self.assert_valid()

        self.write_epic(epic_path, "EPIC-001", status="ready")
        self.write_work(
            story_path,
            "WORK-001",
            work_type="story",
            status="ready",
            parent="EPIC-001",
            relates_to=("WORK-002",),
        )
        self.write_work(
            bug_path,
            "WORK-002",
            work_type="bug",
            status="ready",
            relates_to=("WORK-001",),
        )
        self.write_rank(
            [("WORK-002", bug_path), ("WORK-001", story_path)]
        )
        self.assert_valid()

        self.write_work(
            bug_path,
            "WORK-002",
            work_type="bug",
            status="ready",
            relates_to=("WORK-001",),
            execution="Verification command: node --test.",
        )
        invalid = self.validate()
        self.assertNotEqual(invalid.returncode, 0)
        self.assertIn("explicit approval", invalid.stderr)

    def test_graph_and_claim_failures_are_rejected(self) -> None:
        first_path = "standalone/WORK-010-first.md"
        second_path = "standalone/WORK-011-second.md"
        self.write_work(first_path, "WORK-010", status="ready", blocks=("WORK-011",))
        self.write_work(second_path, "WORK-011", status="ready", blocks=("WORK-010",))
        self.write_index(
            "standalone/index.md",
            "Active standalone work",
            [("WORK-010", "WORK-010-first.md"), ("WORK-011", "WORK-011-second.md")],
        )
        self.write_rank(
            [("WORK-010", first_path), ("WORK-011", second_path)]
        )
        cycle = self.validate()
        self.assertNotEqual(cycle.returncode, 0)
        self.assertIn("blocking cycle", cycle.stderr)

        self.write_work(
            first_path,
            "WORK-010",
            status="ready",
            blocks=("WORK-011",),
            relates_to=("WORK-011",),
        )
        self.write_work(second_path, "WORK-011", status="ready")
        asymmetric = self.validate()
        self.assertNotEqual(asymmetric.returncode, 0)
        self.assertIn("must be declared symmetrically", asymmetric.stderr)

        self.write_work(
            second_path,
            "WORK-011",
            status="in-progress",
            relates_to=("WORK-010",),
            claim="agent-session-11",
            claim_expires="2099-01-01T00:00:00Z",
        )
        self.assert_valid()

        self.write_work(
            second_path,
            "WORK-011",
            status="in-progress",
            relates_to=("WORK-010",),
            claim="agent-session-11",
            claim_expires="2000-01-01T00:00:00Z",
        )
        expired = self.validate()
        self.assertNotEqual(expired.returncode, 0)
        self.assertIn("future ISO 8601 claim_expires", expired.stderr)

    def test_cancellation_and_archive_transitions(self) -> None:
        epic_directory = self.backlog / "epics" / "EPIC-020-release"
        epic_path = "epics/EPIC-020-release/EPIC-020.md"
        child_path = "epics/EPIC-020-release/WORK-020-child.md"
        standalone_path = "standalone/WORK-021-duplicate.md"
        self.write_epic(epic_path, "EPIC-020", status="ready")
        self.write_work(
            child_path,
            "WORK-020",
            status="ready",
            parent="EPIC-020",
        )
        self.write_work(standalone_path, "WORK-021", status="ready")
        self.write_index(
            "epics/index.md",
            "Active Epics",
            [("EPIC-020", "EPIC-020-release/")],
        )
        self.write_index(
            "standalone/index.md",
            "Active standalone work",
            [("WORK-021", "WORK-021-duplicate.md")],
        )
        self.write_rank(
            [("WORK-020", child_path), ("WORK-021", standalone_path)]
        )
        self.assert_valid()

        self.write_work(
            standalone_path,
            "WORK-021",
            status="cancelled",
            duplicates=("WORK-020",),
        )
        invalid_cancellation = self.validate()
        self.assertNotEqual(invalid_cancellation.returncode, 0)
        self.assertIn("cancelled record requires cancelled_reason", invalid_cancellation.stderr)
        self.assertIn("terminal standalone work must be archived", invalid_cancellation.stderr)

        archived_standalone = "archive/standalone/WORK-021-duplicate.md"
        self.write_work(
            archived_standalone,
            "WORK-021",
            status="cancelled",
            duplicates=("WORK-020",),
            cancelled_reason="Duplicates WORK-020 after owner review",
        )
        (self.backlog / standalone_path).unlink()
        self.write_index("standalone/index.md", "Active standalone work", [])
        self.write_index(
            "archive/standalone/index.md",
            "Archived standalone work",
            [("WORK-021", "WORK-021-duplicate.md")],
        )
        self.write_rank([("WORK-020", child_path)])
        self.assert_valid()

        archived_epic_directory = self.backlog / "archive" / "epics" / "EPIC-020-release"
        shutil.move(epic_directory, archived_epic_directory)
        self.write_index("epics/index.md", "Active Epics", [])
        self.write_index(
            "archive/epics/index.md",
            "Archived Epics",
            [("EPIC-020", "EPIC-020-release/")],
        )
        premature_archive = self.validate()
        self.assertNotEqual(premature_archive.returncode, 0)
        self.assertIn("archived records must be done or cancelled", premature_archive.stderr)

        shutil.move(archived_epic_directory, epic_directory)
        self.write_index(
            "epics/index.md",
            "Active Epics",
            [("EPIC-020", "EPIC-020-release/")],
        )
        self.write_index("archive/epics/index.md", "Archived Epics", [])
        self.write_work(
            child_path,
            "WORK-020",
            status="done",
            parent="EPIC-020",
            checked=True,
        )
        self.write_rank([])
        self.assert_valid()

        self.write_epic(epic_path, "EPIC-020", status="done", checked=True)
        shutil.move(epic_directory, archived_epic_directory)
        self.write_index("epics/index.md", "Active Epics", [])
        self.write_index(
            "archive/epics/index.md",
            "Archived Epics",
            [("EPIC-020", "EPIC-020-release/")],
        )
        self.assert_valid()


if __name__ == "__main__":
    unittest.main()
